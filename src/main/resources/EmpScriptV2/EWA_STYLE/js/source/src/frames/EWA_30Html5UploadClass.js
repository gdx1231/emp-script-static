/**
 * 利用HTML5的Upload进行上传操作
 */
function EWA_Html5UploadClass() {
	this.uploadIframes = [];
	this.files = [];
	this.POST_XMLNAME = "";
	this.POST_ITEMNAME = "";
	this.POST_NAME = "";
	this.POST_REF = "";
	this.UPLOAD_STATUS = ""; // start,checking,ok ,nofile(没有上传文件)
	this.WAIT_ID = EWA_Utils.tempId("ht5upload_wait_");

	//限制上传文件类型，类型应在配置中，服务器端判断配置参数
	this.changeUpExts = function(exts) {
		let input = $('#' + this.INPUT_FILE_ID);
		input.attr('accept', exts);
	};

	// 限制上传大小，此参数应该小于配置参数，服务器端判断配置参数
	this.changeUpSizeLimit = function(sizeLimit) {
		this.UpLimit = sizeLimit;
	};

	this.haveFile = function() {
		for (var i = 0; i < this.files.length; i++) {
			if (this.files[i].value != "") {
				return true;
			}
		}
		return false;
	};
	// 获取值
	this.getValue = function() {
		if (this.uploadIframes.length == 0) {
			if (this.files.length == 0) {
				return "";
			}
		}
		var rst = [];
		for (var i = 0; i < this.uploadIframes.length; i++) {
			var s1 = this.uploadIframes[i];
			if (typeof (s1) != "string") {
				continue;
			}
			var json = JSON.parse(s1);
			for (var k in json) {
				rst.push(json[k]);
			}
		}
		return JSON.stringify(rst);
	}
	this.fileIco = function(file, id) {
		var ext = EWA.UI.Ext.FileExt(file.name);
		// 避免出现级联问题，取消错误事件
		$X(id).onerror = function() {

		};
		$X(id).src = EWA.UI.Ext.FileIco(ext);
	};


	this.showPreview = function(source, event) {
		if (source.files.length > 10) {
			if (EWA.LANG == 'enus') {
				EWA.UI.Msg.ShowError("Upload up to 10 files at a time", "limts");
			} else {
				EWA.UI.Msg.ShowError("一次最多上传10个文件", "文件数量限制");
			}
			source.value = "";
			return;
		}
		let sizeLimit = 0; //文件大小限制,0表示无限制
		if(!this.UpLimit){
			this.UpLimit = "10M"; // 未指定的话，默认10M
		}
		
		let limit = (this.UpLimit + "").toLocaleLowerCase().replace(/,/ig, "").replace(/ /ig, "");
		if (limit.endsWith("m")) {
			let num = limit.substring(0, limit.length - 1);
			if (isNaN(num)) {
				alert('Invalid sizeLimit parameter:' + this.sizeLimit);
				return;
			}
			sizeLimit = num * 1024 * 1024;
		} else if (limit.endsWith("k")) {
			let num = limit.substring(0, limit.length - 1);
			if (isNaN(num)) {
				alert('Invalid sizeLimit parameter:' + this.sizeLimit);
				return;
			}
			sizeLimit = num * 1024;
		} else {
			if (isNaN(limit)) {
				alert('Invalid sizeLimit parameter:' + this.sizeLimit);
				return;
			}
			sizeLimit = limit * 1;
		}
		 
		let errs = [];
		if (sizeLimit > 0) {//检查每个文件的大小
			for (var i = 0; i < source.files.length; i++) {
				var file = source.files[i];
				if (file.size > sizeLimit) {
					let fileSize = EWA.UI.Ext.getFileLen(file.size, 2);
					errs.push(file.name.replace(/</ig, "%lt;").replace(/>/ig, "%gt;") + " [" + fileSize + "]");
				}
			}
		}
		if (errs.length > 0) {
			source.value = "";
			if (EWA.LANG == 'enus') {
				errs.push("Exceed " + this.UpLimit + " limit");
				EWA.UI.Msg.ShowError(errs.join("<br>"), "Exceed " + this.UpLimit + " limit");
			} else {
				errs.push("超过" + this.UpLimit + "大小限制");
				EWA.UI.Msg.ShowError(errs.join("<br>"), "超过" + this.UpLimit + "大小限制");
			}
			return;
		}

		var div = source.parentNode;
		var h = div.outerHTML; // div
		div.style.display = 'none';
		source.setAttribute('ok', 1);
		gFileReaders = {};

		for (var i = 0; i < source.files.length; i++) {
			var file = source.files[i];
			this.showPreview1(div, file);
			this.files.push(file);
		}
		if (this.UpMulti == 'yes') {
			$(div).before(h);
		}
	};
	/**
	 * 添加其它文件，已经上传的 JSON 包含 name,type
	 */
	this.addOther = function(json) {
		var div = $X(this.POST_NAME).parentNode.getElementsByTagName('input')[1].parentNode;
		for (var i = 0; i < json.length; i++) {
			this.showPreview1(div, json[i]);
		}
		this.uploadIframes.push(JSON.stringify(json));
	};
	this.createPreviewBox = function(divParent) {
		var div = divParent || $('#EWA_FRAME_' + this.SYS_FRAME_UNID + ' input#' + this.POST_NAME).parent().find('.ewa_app_upload_form')[0];
		var id = '_upload_' + Math.random();
		id = id.replace('.', 'G');

		var img = document.createElement("img");
		img.id = id;

		var table = document.createElement('table');
		table.cellPadding = 0;
		table.cellSpacing = 0;
		table.className = "ewa_app_upload_form1";
		div.parentNode.appendChild(table);

		var td = table.insertRow(-1).insertCell(-1);
		td.align = 'center';
		td.appendChild(img);
		td.className = 'img';
		td.vAlign = 'middle';


		var tdTitle = table.insertRow(-1).insertCell(-1);
		tdTitle.className = "name";
		var c = this;
		img.onerror = function(e) {
			console.log(e);
			var file = {
				name: this.src
			};
			c.fileIco(file, this.id);
		};

		return table;
	};
	this.showPreviewExists = function() {
		var u = $('#EWA_FRAME_' + this.SYS_FRAME_UNID + ' input#' + this.POST_NAME).val();
		if (u == '') {
			return;
		}
		try {
			// 如果文件已经存在，则将必输项设为false;
			EWA.F.FOS[this.SYS_FRAME_UNID].setUnMust(this.POST_NAME);
		} catch (e) {

		}
		this.showPreviewUrl(u);
	};
	this.showPreviewUrl = function(imageUrl) {
		var u = imageUrl;
		var table = this.createPreviewBox();

		var td = $(table).find('td')[1];
		var u1 = u.split('/');
		var u2 = u1[u1.length - 1];
		td.innerHTML = "<div title='" + u2 + "'>" + u2 + "</div>";

		var img = $(table).find('img')[0];
		img.src = u;

		return table;
	};

	this.showPreview1 = function(div, file) {
		var table = this.createPreviewBox(div);
		var td = $(table).find('td')[1];
		var img = $(table).find('img')[0];
		var id = img.id;

		file.ref = id;

		td.innerHTML = "<div>" + file.name + "</div><div id='" + id + "_process1' class='ewa-app-upload-process1'></div><div id='" + id
			+ "_process' class='ewa-app-upload-process'>0%</div>";
		td.className = "name";

		$(table).attr('file_name', file.name);
		$(table).attr('file_type', file.type);
		$(table).attr('file_size', file.size);

		// console.log(file)
		if (file.type && file.type.indexOf('image/') == 0) {
			img.src = (EWA.RV_STATIC_PATH || '/EmpScriptV2') + "/EWA_STYLE/images/loading2.gif";
			var fr = new FileReader();
			gFileReaders[id] = fr;
			var c = this;
			fr.onloadend = function(e) {
				for (var n in gFileReaders) {
					var o = gFileReaders[n];
					if (o == e.target) {
						$X(n).src = e.target.result;

						if (c.showPreviewAfter) {
							// 读取文件完成后
							c.showPreviewAfter($X(n), file);
						}
					}
				}
			};
			fr.readAsDataURL(file);
		} else {
			this.fileIco(file, id);
			// 读取文件完成后
			if (this.showPreviewAfter) {
				this.showPreviewAfter($X(id), file);
			}
		}
	};
	/**
	 * 提交上传文件
	 */
	this.submitUploads = function(refId) {
		if (!window.FormData) {
			// 不支持FormData的提交
			this.submitUploads_old(refId);
			return;
		}

		this.uploadIframes = [];
		var c = this;
		this.UPLOAD_STATUS = "start";
		var action = EWA.CP + "/EWA_STYLE/cgi-bin/_up_/?xmlname=" + this.POST_XMLNAME + "&ITEMNAME=" + this.POST_ITEMNAME + "&NAME=" + this.POST_NAME
			+ "&EWA_UP_TYPE=SWFUPLOAD&EWA_UP_REF=" + this.POST_REF;

		this.action = action;
		try {
			$('input[type=file][ok=1]').each(function() {
				var name = this.id.split('_1_2_3_4_5_')[1];
				if (c.POST_NAME != name) {
					return;
				}
				var obj = this;
				for (var i = 0; i < obj.files.length; i++) {
					let file = obj.files[i];
					if (file.isDeleted) {
						//被删除，跳过
						console.log(file);
						continue;
					}
					c.uploadIframes.push({
						file: file
					});
				}
			});
		} catch (e) {
			alert(e);
		}
		if (this.uploadIframes.length > 0) {
			var main_form = $('#f_' + this.SYS_FRAME_UNID);
			main_form.find('.ewa-app-upload-process,.ewa-app-upload-process1').show();
			c.UPLOAD_STATUS = "checking";
			this.asyncUpload();
		} else {
			this.UPLOAD_STATUS = "nofile";
		}
	};
	this.asyncUpload = function() {
		var c = this;
		var new_submit = null;
		for (var n in this.uploadIframes) {
			var o = this.uploadIframes[n];
			// 未上传前，o的对象是 input[type=file]对象
			if (typeof (o) == 'string') {
				// 上传完成后是返回的json字符串
				continue;
			}
			new_submit = o;
			break;
		}

		if (new_submit != null) {
			if (!new_submit.submitting) {
				new_submit.submitting = true;
				// 上传文件到服务器
				this.submitUpload(new_submit);
			}
			setTimeout(function() {
				// 延时重新调用此方法，直到所有文件都提交完毕
				c.asyncUpload();
			}, 111)
		} else {
			// 外部注册此方法
			if (this.uploadsCompleted) {
				this.uploadsCompleted(this.uploadIframes);
			}
			// console.log('complete');
		}
	};
	this.createFormData = function() {
		var fd = new FormData();
		var u1 = new EWA_UrlClass();
		u1.SetUrl(EWA.F.FOS[this.SYS_FRAME_UNID].Url);
		for (var n in u1._Paras) {
			if (n.toUpperCase().indexOf("EWA") == 0) {
				continue;
			}
			fd.append(n, u1._Paras[n]);
		}

		var main_form = $X('f_' + this.SYS_FRAME_UNID);
		if (main_form) {
			for (var i = 0; i < main_form.length; i++) {
				var o = main_form[i];
				var name = o.name || o.id;
				if (o.type == 'file' || o.type == 'button' || o.type == 'submit') {
					continue;
				}
				if ((o.type == 'radio' || o.type == 'checkbox') && !o.checked) {
					continue;
				}
				if ($(o).attr('ewa_tag') == 'ht5upload') {
					continue;
				}
				fd.append(name, o.value);
			}
		}
		return fd;
	}
	/**
	 * 每个 input 执行一次上传
	 */
	this.submitUpload = function(o) {
		var file = o.file;

		var fd = this.createFormData();
		fd.append(this.POST_NAME, file, file.name);

		var img = $('img[id="' + file.ref + '"]');
		// 创建缩略图
		this.createNewSizes(img[0], fd);

		var c = this;
		var img_target = $('div[id="' + file.ref + '_process"]');
		img_target.show().html("0%");
		var img_target1 = $('div[id="' + file.ref + '_process1"]');
		img_target1.css('width', 0).show();

		var xhr = new XMLHttpRequest();
		xhr.upload.addEventListener("progress", function(evt) {
			if (evt.lengthComputable) {
				var percentComplete = Math.round(evt.loaded * 100 / evt.total - 10);
				if (percentComplete < 0) {
					percentComplete = 0;
				}
				img_target.html(percentComplete.toString() + '%');
				img_target1.css('width', percentComplete.toString() + '%');
			} else {
				img_target.html('unable to compute');
			}
		}, false);
		xhr.addEventListener("load", function(evt) {
			img_target.html('100%');
			img_target1.css('width', '100%');

			/* 服务器端返回响应时候触发event事件 */
			for (var n in c.uploadIframes) {
				if (c.uploadIframes[n].xhr == evt.target) {
					// 返回内容是 文件的 json表达式字符串
					c.uploadIframes[n] = evt.target.responseText;
					break;
				}
			}
			c.chkAllXhrComplete();
		}, false);
		xhr.addEventListener("error", function(evt) {
			console.log(evt);
			img_target.html(evt);
			c.UPLOAD_STATUS = "error";
		}, false);
		xhr.addEventListener("abort", function(evt) {
			img_target.html("The upload has been canceled by the user or the browser dropped the connection.");
			console.log(evt);
			c.UPLOAD_STATUS = "abort";
		}, false)

		xhr.open('POST', this.action, true);
		xhr.send(fd);
		// this.uploadIframes.push(xhr);
		o.xhr = xhr;
		delete o.file;
	};
	this.createNewSizes = function(fromImg, fd) {
		if (this.NewSizesIn !== 'client') {
			return;
		}
		if (!this.siezs) {
			var siezs = this.UpNewSizes.split(',');
			this.siezs = [];
			for (var n in siezs) {
				var size = siezs[n];
				var a = size.split('x');
				if (a.length == 2) {
					var w = a[0];
					var h = a[1];
					if (isNaN(w) || isNaN(h)) {
						continue;
					}
					this.siezs.push({
						w: w * 1,
						h: h * 1
					});
				}
			}
		}
		if (this.siezs.length == 0) {
			return;
		}
		for (var n in this.siezs) {
			var size = this.siezs[n];
			var blob = EWA_ImageCalss.resizeAsBlob(fromImg, size.w, size.h);
			fd.append(this.POST_NAME, blob, "resized$" + size.w + "x" + size.h + ".jpg");
		}
	};
	// 检查文件是否上传完毕
	this.chkAllXhrComplete = function() {
		var inc = 0;
		for (var i = 0; i < this.uploadIframes.length; i++) {
			var iframe = this.uploadIframes[i];
			if (typeof iframe == "string") {
				inc++;
			}
		}
		if (inc < this.uploadIframes.length) {
			return;
		}
		let ss = [];
		for (var i = 0; i < this.uploadIframes.length; i++) {
			let txt = this.uploadIframes[i];
			let json = JSON.parse(txt);
			if (json.ERR) {
				ss.push(json.ERR);
			}
		}
		if (ss.length === 0) {
			this.UPLOAD_STATUS = "ok";
			return;
		} 
		
		// 上传有错误		
		var buts = [];
		var that = this;
		buts[0] = {
			Text: _EWA_INFO_MSG['BUT.OK'],
			Event: function(){
				that.UPLOAD_STATUS = "error";
			},
			Default: true
		};
		EWA.UI.Msg.Show(ss.join("<br>"), buts, "", "ERR_ICON");
		this.removeWaitBox();
	};

	this.createWaitBox = function() {
		if (!$X(this.WAIT_ID)) {
			var div = document.createElement('div');
			div.id = this.WAIT_ID;
			var tb = $('body');

			$(div).css({
				'width': 300,
				height: 100,
				'line-height': '100px',
				'font-size': '16px',
				'position': 'fixed',
				'top': tb.height() * 0.5 - 70 * 0.5,
				'left': tb.width() * 0.5 - 300 * 0.5,
				'z-index': 12838,
				'background-color': 'f0f0f0',
				'color': '#08c',
				'border-radius': '10px',
				opacity: 0.9
			}).addClass('ewa-upload-wait-box');
			var txt = EWA.LANG == 'enus' ? "Please waitting ..." : "请等待文件上传完毕...";
			var imgsrc = (EWA.RV_STATIC_PATH || '/EmpScriptV2') + "/EWA_STYLE/images/loading2.gif";
			div.innerHTML = "<table height=100% align=center><tr><td><img src='" + imgsrc + "'></td><td>" + txt
				+ "</td></table>";
			tb.append(div);
			if (this.noWaitBox) { // 不显示等待框
				$(div).hide();
			}
		}
	};
	this.removeWaitBox = function() {
		$("#" + this.WAIT_ID).remove();
	};

	/**********************	以下为不支持 FormData 的 提交  **********************/
	// 上传文件
	this.submitUploads_old = function(refId) {
		this.uploadIframes = [];
		var c = this;
		this.UPLOAD_STATUS = "start";

		try {

			$('input[type=file][ok=1]').each(function(index) {
				var name = this.id.split('$')[1];
				if (c.POST_NAME == name) {
					c.submitUpload_old(index, this);
				}
			});
		} catch (e) {
			alert(e);
		}

		if (this.uploadIframes.length > 0) {
			window.setTimeout(function() {
				c.UPLOAD_STATUS = "checking";
				c.chkframeSubmt();
			}, 400);
		} else {
			this.UPLOAD_STATUS = "nofile";
		}

	}
	// 每个 input 执行一次上传
	this.submitUpload_old = function(index, obj) {
		var target = "GDX" + index;
		var ff = document.createElement('iframe');
		ff.id = target;
		ff.name = target;
		document.body.appendChild(ff);
		var objIframe = $(ff);
		objIframe.hide();

		var form = document.createElement('form');
		document.body.appendChild(form);
		form.method = 'post';
		form.enctype = "multipart/form-data"
		form.innerHTML = "<input type=submit>";

		var objForm = $(form);
		objForm.hide();

		var action = EWA.CP + "/EWA_STYLE/cgi-bin/_up_/?xmlname=" + this.POST_XMLNAME + "&ITEMNAME=" + this.POST_ITEMNAME + "&NAME=" + this.POST_NAME
			+ "&EWA_UP_TYPE=SWFUPLOAD&EWA_UP_REF=" + this.POST_REF;

		var frameUnid = obj.id.split('_')[1].split('$')[0];

		var url = EWA.F.FOS[frameUnid].Url;

		var u1 = new EWA_UrlClass();
		u1.SetUrl(url);
		for (var n in u1._Paras) {
			if (n.toUpperCase().indexOf("EWA") == 0) {
				continue;
			}
			action += "&" + n + "=" + u1._Paras[n];
		}
		// console.log(u1);
		// main form values
		var main_form = $X('f_' + frameUnid);
		if (main_form) {
			for (var i = 0; i < main_form.length; i++) {
				var o = main_form[i];
				var name = o.name || o.id;
				if (o.type == 'file' || o.type == 'button' || o.type == 'submit') {
					continue;
				}
				if ((o.type == 'radio' || o.type == 'checkbox') && !o.checked) {
					continue;
				}
				action += "&" + name + "=" + o.value.toURL();
			}
		}
		// console.log(action);
		objForm.attr('action', action);
		objForm.append(obj);
		objForm.attr("target", target);

		this.uploadIframes.push(objIframe[0]);

		setTimeout(function() {
			objForm.submit();
		}, 400);

	};
	// 检查文件是否上传完毕
	this.chkframeSubmt = function() {
		var inc = 0;
		for (var i = 0; i < this.uploadIframes.length; i++) {
			var iframe = this.uploadIframes[i];
			if (typeof iframe == "string") {
				inc++;
				continue;
			}
			if (iframe.contentDocument && iframe.contentDocument.body) {
				var s = GetInnerText(iframe.contentDocument.body);

				if (s.indexOf(']') >= 0 && s.indexOf('[') >= 0) {
					$('form[target=' + iframe.id + ']').remove();
					$(iframe).remove();
					this.uploadIframes[i] = s;
				} else {
					if (s.trim() != '') {
						alert('系统执行错误：' + s);
						return;
					}
				}
			}
		}
		if (inc == this.uploadIframes.length) {
			this.UPLOAD_STATUS = "ok";
			// alert(this.UPLOAD_STATUS);
		} else {
			var c = this;
			window.setTimeout(function() {
				c.chkframeSubmt();
			}, 100);
		}
	};

}