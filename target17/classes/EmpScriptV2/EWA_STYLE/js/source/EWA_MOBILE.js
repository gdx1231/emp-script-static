/*
 	可加载事件(function)
	1.window.EWA_AppLoaded 当App加载完成
	2.window.EWA_AppCheck 当App(frame)提交前检查
  	3.window.EWA_AppUnLoaded; 当App卸载
 */

String.prototype.toHtml = function() {
	if (this == null || this == '') {
		return this;
	}
	var s1 = this.replace(/</ig, '&lt;').replace(/>/ig, '&gt;').replace(/"/ig, '&quot;');
	return s1;
};

function showPreview(source, ismulti) {

	var h = source.parentNode.parentNode.outerHTML; // div
	source.parentNode.parentNode.style.display = 'none';
	var newTarget = source.parentNode.target + Math.random();
	newTarget = newTarget.replace("0.", "");
	source.parentNode.target = newTarget;
	source.parentNode.parentNode.getElementsByTagName('iframe')[0].name = newTarget;
	for (var i = 0; i < source.files.length; i++) {
		var file = source.files[i];

		// MegaPixImage constructor accepts File/Blob object.
		var mpImg = new MegaPixImage(file);

		var img = document.createElement("img");

		var id = Math.random();
		img.id = id;

		var table = document.createElement('table');
		table.cellPadding = 0;
		table.cellSpacing = 0;
		table.className = "ewa_app_upload_form1 ui-body-inherit ui-corner-all ui-mini ui-shadow-inset";
		source.parentNode.parentNode.parentNode.appendChild(table);

		var td = table.insertRow(-1).insertCell(-1);
		td.align = 'center';
		td.appendChild(img);
		td.vAlign = 'middle';

		img.onload = function() {
			console.log(this.src.length / 4 * 3 / 1024);
		};
		mpImg.render(img, {
			maxWidth : 1024,
			maxHeight : 1024,
			quality : 0.5
		});
	}
	if (ismulti) {
		$(source.parentNode.parentNode).before(h);
	}
}

function showPreview_old(source, ismulti) {
	if (!window.FileReader) {
		alert('browser not support FileReader');
		return;
	}
	var h = source.parentNode.parentNode.outerHTML; // div
	source.parentNode.parentNode.style.display = 'none';
	var newTarget = source.parentNode.target + Math.random();
	newTarget = newTarget.replace("0.", "");
	source.parentNode.target = newTarget;
	source.parentNode.parentNode.getElementsByTagName('iframe')[0].name = newTarget;
	for (var i = 0; i < source.files.length; i++) {
		var file = source.files[i];

		var fr = new FileReader();
		fr.onloadend = function(e) {
			var img = document.createElement("img");
			img.src = e.target.result;

			var id = Math.random();
			img.id = id;

			var table = document.createElement('table');
			table.cellPadding = 0;
			table.cellSpacing = 0;
			table.className = "ewa_app_upload_form1 ui-body-inherit ui-corner-all ui-mini ui-shadow-inset";
			source.parentNode.parentNode.parentNode.appendChild(table);

			var td = table.insertRow(-1).insertCell(-1);
			td.align = 'center';
			td.appendChild(img);
			td.vAlign = 'middle';

			var img1 = document.createElement("img");
			img1.setAttribute("rid", id);
			img1.src = e.target.result;
			img1.onload = function() {
				var cvs = document.createElement('canvas');
				cvs.width = this.width;
				cvs.height = this.height;
				var ctx = cvs.getContext("2d");
				ctx.drawImage(this, 0, 0);

				var data = ctx.getImageData(0, 0, cvs.width, cvs.height);
				var rst = mc.jpgCompress.encode(data);
				var rid = this.getAttribute('rid');

				// ('rst',rst);
				console.log($X(rid).src.length / 1024 + 'k -> ' + rst.length / 1024 + 'k');
				$X(rid).src = rst;
			}
		};
		fr.readAsDataURL(file);
	}
	if (ismulti) {
		$(source.parentNode.parentNode).before(h);
	}
}
var EWA_MobileClass = function() {
	this.ROOT = "http://localhost:4040/pf/";
	this.ROOT_EWA = this.ROOT + "EWA_STYLE/cgi-bin/";
	this.APPS = {};
	this.APPS_MAP = {};
	this.DATA_HIS = [];
	this.WF_ID = 99999999;
	this.WF_DETAIL_ID = this.WF_ID - 1;
	this.WF_CHART_ID = this.WF_ID - 2;
	this.SESSION_OUT_MAX = 20 * 60 * 1000;// 20 minutes
	this.MSG_SPAN = 144 * 1000;// 144s
	this.DB;
	this.THEME = "c";

	this.APP_TMP = __a.join("");

	this.pageShowEvent = function(event, prevPage) {
		var curId = event.target.id;
		var prevId = (prevPage && prevPage.prevPage.length > 0) ? prevPage.prevPage[0].id : null;
		if (curId == 'ddl') {
			$X('ddlInput').focus();
		}
		if (prevId != null) {
			var prevApp = this.APPS_MAP[prevId.replace("app", "")];
			if (prevApp) {
				if (prevApp._FROMID == curId.replace("app", "")) {// back
					this.back(prevApp.APP_ID);
				}
			}
		}
	};
	this.doGet = function(url, func) {
		$JG(url, func);
	};
	this.showWait = function() {
		var o = $.mobile.loading('show', {
			text : '加载中, 请等待...', // 加载器中显示的文字
			textVisible : true, // 是否显示文字
			theme : 'a', // 加载器主题样式a-e
			textonly : false, // 是否只显示文字
			html : "" // 要显示的html内容，如图片等
		});
		$('body').append(o);
	};
	this.back = function(id) {
		console.log(id);
		if (this.TIMER_DHTML) {
			window.clearInterval(this.TIMER_DHTML);
			this.TIMER_DHTML = null;
		}
		if (window.EWA_AppUnLoaded) {
			try {
				window.EWA_AppUnLoaded(app);
			} catch (e) {
				alert("call window.EWA_AppUnLoaded err:" + e);
			}
			window.EWA_AppUnLoaded = null;
		}

		if (window.EWA_AppCheck) {
			window.EWA_AppCheck = null;
		}
		if (window.EWA_AppLoaded) {
			window.EWA_AppLoaded = null;
		}

		var app = this.APPS_MAP[id];
		if (app.APP_TYPE == 'frame') {
			// console.log($('#app' + app.APP_ID + ' ul'));
			$('#app' + app.APP_ID + ' ul').html("");
		}
		this._CURAPPID = app._FROMID;
		this.showFooter(app._FROMID);
	};
	this.hideWait = function() {
		$.mobile.loading('hide');
	};

	/**
	 * 检测数据合法性
	 */
	this.checkSubmitValid = function(id) {
		var error_color = "#F6DDDD";

		var app = this.APPS_MAP[id];
		var isOk = true;
		var upload = null;

		for (var i = 0; i < app._DATAS.CFG.length; i++) {
			var o = app._DATAS.CFG[i];
			var obj = $("#app" + id).find("[id=" + o.NAME + "]");
			if (obj.length == 0) {
				continue;
			}
			if (obj.attr('step_hide') == 1) {
				continue;
			}
			var v = "";
			if (o.TAG == "checkbox") {
				obj = $(obj).find('input');
				var vv = [];
				obj.each(function() {
					if (this.checked) {
						vv.push(this.value);
					}
				});
				v = vv.join(',');
				// console.log(v)
			} else if (obj[0] && obj[0].tagName == "INPUT" && obj[0].type == "file") {
				var vv = [];
				obj.each(function() {
					vv.push(this.value);
				});
				v = vv.join(',');
			} else {
				v = obj.val();
			}
			if (o.MUST == 1 && v == "" && o.TAG != "span") {
				if (obj[0] && obj[0].tagName == "SELECT") {
					obj[0].parentNode.style.backgroundColor = error_color;
				} else if (obj[0]) {
					if (obj[0].tagName == "INPUT" && obj[0].type == "file") {
						alert('请先上传资料');
					} else {
						obj[0].style.backgroundColor = error_color;
						if (obj[0].type == 'hidden') {
							// $X('ref_' + obj[0].id).style.backgroundColor =
							// '#E238EC';
						}
					}
				}
				isOk = false;
			} else if (obj[0]) {
				if (obj[0].tagName == "SELECT") {
					obj[0].parentNode.style.backgroundColor = '';
				} else {
					obj[0].style.backgroundColor = '';
				}
			}
			if (obj[0] && obj[0].type && obj[0].type.toUpperCase() == 'FILE') {
				upload = obj[0];
			}
			if (isOk && o.DT && (o.DT.toUpperCase() == "NUMBER" || o.DT.toUpperCase() == "INT")) {
				if (isNaN(v)) {
					obj[0].style.backgroundColor = error_color;
					isOk = false;
				} else {
					obj[0].style.backgroundColor = '';
					if (obj[0].type == 'hidden') {
						// $X('ref_' + obj[0].id).style.backgroundColor = '';
					}
				}
			}
		}
		return [ isOk, upload ];
	};

	this.submit = function(id) {
		var error_color = "#F6DDDD";
		var app = this.APPS_MAP[id];

		var submit_timestamp = app.submit_timestamp;
		var cur_timestamp = new Date().getTime();
		if (submit_timestamp && cur_timestamp - submit_timestamp < 400) {
			console.log('连续点击' + (cur_timestamp - submit_timestamp));
			// 检查是否为连续点击，间隔为400ms
			return;
		}
		app.submit_timestamp = cur_timestamp;

		var isok1 = this.checkSubmitValid(id);
		var isOk = isok1[0];
		var upload = isok1[1];

		console.log(isOk)
		if (!isOk) {
			return;
		}
		if (window.EWA_AppCheck) {
			isOk = window.EWA_AppCheck();
			if (!isOk) {
				return;
			}
		}
		this.showWait();
		if (upload) {// 上传文件
			// this.submitUpload(id,app,upload);
			this.submitUploadCompress(id, app, upload);
		} else {
			this.doSubmit(app);
		}
	};
	/**
	 * 上传文件
	 * 
	 * @param {Object}
	 *            id
	 * @param {Object}
	 *            app
	 * @memberOf {TypeName}
	 */
	this.submitUploadCompress = function(id, app, upload) {
		var c = this;
		var action = $('form[name=f' + id + ']')[0].action;
		this.uploadIframes = [];
		var imgs = $('#app' + app.APP_ID + ' img').each(function(idx) {
			var n = upload.id;
			var data = {};
			data[n] = this.src;

			c.uploadIframes[idx] = false;
			$P(action, data, function(data) {
				c.uploadIframes[idx] = true;
				upload.setAttribute('uplodresult', data);
			});
		});

		if (this.uploadIframes.length > 0) {
			window.setTimeout(function() {
				c.chkCompressSubmt(app);
			}, 100);
		} else {
			this.doSubmit(app);
		}
	};
	// 检查文件是否上传完毕
	this.chkCompressSubmt = function(app) {
		var inc = 0;
		for (var i = 0; i < this.uploadIframes.length; i++) {
			var rst = this.uploadIframes[i];
			if (rst) {
				inc++;
			}
		}
		if (inc == this.uploadIframes.length) {
			this.doSubmit(app);
		} else {
			var c = this;
			window.setTimeout(function() {
				c.chkCompressSubmt(app);
			}, 100);
		}
	};
	/**
	 * 上传文件
	 * 
	 * @param {Object}
	 *            id
	 * @param {Object}
	 *            app
	 * @memberOf {TypeName}
	 */
	this.submitUpload = function(id, app, upload) {
		var c = this;
		var forms = $('form[name=f' + id + ']');
		this.uploadIframes = [];
		for (var i = 0; i < forms.length; i++) {
			var form = forms[i];
			var ff = form.getElementsByTagName('input')[0];
			if (ff.files.length == 0) {
				continue;
			}
			var iframe = form.parentNode.getElementsByTagName('iframe')[0];
			console.log(iframe);
			this.uploadIframes.push(iframe);
			$('body').append(iframe);
			form.submit();
		}
		if (this.uploadIframes.length > 0) {
			window.setTimeout(function() {
				c.chkframeSubmt(upload, app);
			}, 100);
		} else {
			this.doSubmit(app);
		}
	};
	// 检查文件是否上传完毕
	this.chkframeSubmt = function(obj, app) {
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
					$(iframe).remove();
					this.uploadIframes[i] = s;
					//
				}
			}
		}
		if (inc == this.uploadIframes.length) {
			obj.setAttribute('uplodresult', this.uploadIframes[0]);
			this.doSubmit(app);
		} else {
			var c = this;
			window.setTimeout(function() {
				c.chkframeSubmt(obj, app, iframe);
			}, 100);
		}
	};
	this.doSubmit = function(app) {
		var id = app.APP_ID;
		var map = {};
		for (var i = 0; i < app._DATAS.CFG.length; i++) {
			var o = app._DATAS.CFG[i];
			if (o.TAG == 'span') {
				continue;
			}
			var obj = $("#app" + id).find("[id=" + o.NAME + "]");
			if (obj.length == 0) {
				continue;
			}
			var v = "";
			if (o.TAG == "checkbox") {
				obj = $(obj).find('input');
				var vv = [];
				obj.each(function() {
					if (this.checked) {
						vv.push(this.value);
					}
				});
				v = vv.join(',');
			} else if (o.TAG == "dHtmlNoImages" || o.TAG == "dHtml") {
				v = $('#' + o.NAME + '_DHTML').html();
			} else {
				v = obj.val();
			}
			if (o.TAG == 'datetime' || o.TAG == 'date') {
				v = v.replace('T', ' ');
			}
			if (obj[0] && obj[0].type && obj[0].type.toUpperCase() == 'FILE') {
				var s = obj[0].getAttribute('uplodresult');
				if (s) {
					var j = null;
					eval('j=' + s);
					// console.log(j)
					for ( var n in j[0]) {
						map[n] = j[0][n];
					}
				}
				// console.log(map)
			} else {
				map[o.NAME] = v;
			}
		}
		// window.m1 = map;
		if (id == this.WF_ID) {// workflow
			map["SYS_STA_VAL"] = map["EWA_WF_UOK"];
			map["SYS_STA_MEMO"] = map["EWA_WF_UMSG"];
		}

		var u;
		if (id == this.WF_ID) {// workflow
			u = this.ROOT_EWA.replace('/cgi-bin/', '/cgi-bin/_wf_/') + "?ewa_wf_type=ins_post" + "&APP_XMLNAME="
				+ app.APP_XML_NAME + '&APP_ITEMNAME=' + app.APP_ITEM_NAME + "&" + app._PARAMS;
		} else {
			u = this.ROOT_EWA + '?XMLNAME=' + app.APP_XML_NAME + '&ITEMNAME=' + app.APP_ITEM_NAME
				+ '&EWA_AJAX=json&EWA_ACTION=OnPagePost&EWA_POST=1';
			if (app.APP_URL_PARAS != null && app.APP_URL_PARAS.length > 0) {
				var p = app.APP_URL_PARAS;

				var refData = app._REFDATA;
				var thisData = [];
				if (app._DATAS['DATA'].length > 0) {
					thisData = app._DATAS['DATA'][0];
				}
				var data = this.meargeData(thisData, refData);
				if (data) {
					p = this.replaceParameter(p, data);
				}
				u += '&' + p;
			}
		}
		var exp = "#app" + id + " a[data-icon=carat-l]";
		var c = this;
		$P(u, map, function(data) {
			if (id == c.WF_ID) {// workflow
				var rst = null;
				eval('rst=' + data);
				if (!rst.RST) {
					alert(rst.ERR);
					return;
				}
				// 强制刷新列表数据
				c.RELOAD_DATA = true;
			}
			if (app.APP_MAP_MSG != null && app.APP_MAP_MSG.trim().length > 0) {
				try {
					eval(app.APP_MAP_MSG);
				} catch (e) {
					alert(e);
				}
			} else {
				console.log("dosubmit.back, exp" + exp);
				$(exp)[0].click();
			}
			// 提交后执行的脚本
			if (window.EWA_AppSubmitAfter) {
				try {
					window.EWA_AppSubmitAfter(app);
				} catch (e) {
					alert(e);
				}
				window.EWA_AppSubmitAfter = null;
			}
		});
	};
	this.doGetEwaCfg = function(x, i, p) {
		var u = this.ROOT_EWA + '?XMLNAME=' + x + '&ITEMNAME=' + i + '&' + p;
		this.doGet(u, function() {
		});
	};

	this.meargeData = function(d1, d2) {
		var d3 = {};
		if (d1) {
			for ( var n in d1) {
				d3[n] = d1[n];
			}
		}
		if (d2) {
			for ( var n in d2) {
				if (d3[n] == null) {
					d3[n] = d2[n];
				}
			}
		}
		return d3;
	};
	this.showFooter = function(id) {
		if (id == null) {
			id = '';
		}
		var o = $('#app' + id + ' div[data-role=footer]');
		if (o.find('a').length == 0) {
			o.html($('#footer').html()).trigger('create');
		}
		o.find('a').each(function() {
			this.className = this.className.replace('ui-btn-active', '');
			this.style.display = '';
		});
		o.find('a[id=ft' + id + ']').hide();
	};

	this.jumpApp = function(thisid, toid, data, backId) {
		var thisapp = this.APPS_MAP[thisid];
		if (thisapp == null) {
			alert('thisid=' + thisid + ' not app id');
			return;
		}
		var toapp = this.APPS_MAP[toid];
		if (toid == null) {
			alert('toid=' + toid + ' not app id');
			return;
		}
		var backapp = this.APPS_MAP[backId];
		// 设置虚假对象，模拟操作
		var fackobj = document.createElement("p");
		fackobj.setAttribute('json_ref', 0);
		if (data == null) {
			data = [ {} ];
		} else if (data.length == 0) {
			data = [ {} ];
		}
		if (backapp) {
			backapp._DATAS["DATA"] = data;
		}
		// 将当前的对象值传递到目标的对象值
		toapp._REFDATA = thisapp._REFDATA;

		// this.loadApp = function(id, obj, fromId, callBack)
		this.loadApp(toid, fackobj, backId, function() {
			// 跳转到这个页面
			window.location = "#app" + toid;
		});
	};
	this.copyRef = function(app) {
		var refId = app.APP_FRAME_DETAIL_ID;
		var refapp = this.APPS_MAP[refId];
		if (refapp == null) {
			alert('ref APP未定义[' + id + ']');
			return;
		}
		for ( var n in refapp) {
			if (n == 'APP_ID' || n == 'APP_TITLE' || n == 'APP_TITLE_EN') {
				continue;
			}
			if (n == 'APP_URL_PARAS') { // 合并参数
				var thispara = app[n];
				var refpara = refapp[n];
				var p = "";
				if (thispara == null || thispara == "") {
					p = refpara;
				} else {
					var u1 = new EWA_UrlClass();
					u1.SetUrl("a?" + thispara);
					var u2 = new EWA_UrlClass();
					u2.SetUrl("a?" + refpara);
					for ( var m in u2._Paras) {
						if (u1._Paras[m] == null) {
							u1.AddParameter(m, u2._Paras[m]);
						}
					}
					p = u1.GetUrl().replace("a?", "");
				}
				app[n] = p;
				continue;
			}
			app[n] = refapp[n];
		}
	};
	/**
	 * 跳转并显示配置
	 * 
	 * @param {Object}
	 *            id 要加载的APP_ID
	 * @param {Object}
	 *            obj ?好像没用了
	 * @param {Object}
	 *            fromId
	 * @memberOf {TypeName}
	 * @return {TypeName}
	 */
	this.loadApp = function(id, obj, fromId, callBack) {
		var app = this.APPS_MAP[id];
		if (app == null) {
			alert('APP未定义[' + id + ']');
			return;
		}
		this._CURAPPID = id;
		if (app.APP_TYPE == 'ref') {
			this.copyRef(app);
		}

		if (!this.addApp(app)) {
			// 去除多出来的div
			$('div[id=app' + id + ']:gt(0)').remove();
		}
		var appTitle = this.isEn ? app.APP_TITLE_ENUS : app.APP_TITLE;
		$('#app' + id + ' h1').html(appTitle);

		if (app.APP_TYPE == 'list' || app.APP_TYPE == 'home') {
			this.showFooter(id);
		} else {
			$('#app' + id + ' div[data-role=footer]').remove();
		}

		var o = $('#app' + id + ' ul');
		var stxt1 = this.isEn ? 'Please wait ...' : '请等待，数据加载中...';
		o.html("<center>" + stxt1 + "</center>");

		var data = null;
		var cfgJson = null;
		var fromApp = this.APPS_MAP[fromId];

		// 返回
		if (fromApp) {
			console.log(fromApp)
			var fid = fromApp.APP_ID;
			if (fromApp.APP_TYPE == 'detail' || fid == 1006) {// 1006 sp
				fid = fromApp._FROMID;
			}
			if (fid == null || fid == "" || fid == "home") {
				fid = ""; // go home
				$('#app' + app.APP_ID + ' a:eq(0)').attr('onclick', "javascript:void(0)");
			}
			$('#app' + app.APP_ID + ' a:eq(0)').attr('href', '#app' + fid);
		}

		if (fromApp && fromApp._REFDATA) {
			app._REFDATA = fromApp._REFDATA;
		}
		data = app._REFDATA;
		if (fromApp && fromApp._DATAS) {
			data = fromApp._DATAS['DATA'][obj.getAttribute('json_ref')];
			app._REFDATA = data;
			if (fromApp._REFDATA) {
				var refData1 = this.meargeData(data, fromApp._REFDATA);
				app._REFDATA = refData1;
				data = refData1;
			}
			cfgJson = fromApp._DATAS['CFG'];
		}
		if (fromApp) {
			app._FROMID = fromApp.APP_ID;
		} else {
			app._FROMID = null;
		}
		// console.log(app);
		var title = app.APP_TITLE;
		if (title.indexOf('@') >= 0) {
			title = this.replaceParameter(title, data);
		}
		$('#app' + id + ' h1')[0].innerHTML = title;
		document.title = title;

		this.showButtons(app, fromId, data, fromApp);

		if (app.APP_TYPE == 'detail') {
			this.createFrameDetail(app, cfgJson, fromApp, data, obj);
			if (callBack) {
				callBack(app);
			}
			return;
		} else if (app.APP_TYPE == 'web') {
			this.createFrameWeb(app, cfgJson, fromApp, data);
			if (callBack) {
				callBack(app);
			}
			return;
		} else if (app.APP_TYPE == 'home') {
			this.createFrameHome(app, cfgJson, fromApp, data);
			if (callBack) {
				callBack(app);
			}
			return;
		} else if (app.APP_TYPE == 'js') {
			this.createFrameJs(app, cfgJson, fromApp, data);
			if (callBack) {
				callBack(app);
			}
			return;
		} else if (app.APP_TYPE == 'calendar') {
			this.createFrameCalendar(app, cfgJson, fromApp, data);
			if (callBack) {
				callBack(app);
			}
			return;
		}

		var u;
		var c = this;
		this.showWait();
		// 我的审批
		if (fromApp && fromApp.APP_ITEM_NAME && fromApp.APP_ITEM_NAME.toLowerCase() == "v_sp_main.listframe.view") {
			u = this.spUrl(data['RID'], data['RID1'], data['RTAG'], "", "");
			$JG(u, function(rst) {
				var u1 = rst.u;
				if (rst.p) {
					u1 = rst.p;
				}
				u1 = c.ROOT_EWA + '/' + u1 + '&ewa_ajax=json_ext&ewa_frameset_no=1';
				// console.log(u1);
				$JG(u1, function(datas) {
					// console.log(datas);
					c.createFrameDetailSp(app, datas.CFG, fromApp, datas.DATA[0], obj, datas);
					c.hideWait();
					if (callBack) {
						callBack(app);
					}
				});
			});
		} else {
			if ((id == 111911111111 || id == 1120111111) && mc.TXTLID && mc.TXTPWD) {
				u = this.ROOT + "/app/app_cross.jsp" + '?XMLNAME=' + app.APP_XML_NAME + '&ITEMNAME=' + app.APP_ITEM_NAME
					+ '&EWA_AJAX=json_ext1&EWA_FRAMESET_NO=1&usr_id=' + mc.TXTLID.val() + '&pwd=' + mc.TXTPWD.val() + '&uid='
					+ USR_UNID;
			} else {
				u = this.ROOT_EWA + '?XMLNAME=' + app.APP_XML_NAME + '&ITEMNAME=' + app.APP_ITEM_NAME
					+ '&EWA_AJAX=json_ext1&EWA_FRAMESET_NO=1';
			}
			if (app.APP_URL_PARAS != null && app.APP_URL_PARAS.length > 0) {
				var p = app.APP_URL_PARAS;
				if (data) {
					p = this.replaceParameter(p, data);
				}
				u += '&' + p;
				app._PARAMS = p;
			}

			app._CURPAGE = 1;
			app._SEARCHTXT = "";
			$JG(u, function(datas) {
				c.createElements(datas, app, fromId);
				c.hideWait();
				if (callBack) {
					callBack(app);
				}
			});

		}
	};
	this.spUrl = function(rid, rid1, rtag, t, name, eid) {
		var stringBuilder = [];
		stringBuilder.push(this.ROOT);
		stringBuilder.push("/back_admin/common/workflow_go.jsp?rid=");
		stringBuilder.push(rid);
		stringBuilder.push("&rid1=");
		stringBuilder.push(rid1);
		stringBuilder.push("&rtag=");
		stringBuilder.push(rtag);
		stringBuilder.push("&t=");
		stringBuilder.push(t);
		stringBuilder.push("&name=");
		stringBuilder.push(name);
		stringBuilder.push("&eid=");
		stringBuilder.push(eid);
		var u = stringBuilder.join('');
		return u;
	};
	/**
	 * 显示按钮
	 * 
	 * @param {Object}
	 *            app
	 * @param {Object}
	 *            fromId
	 * @memberOf {TypeName}
	 */
	this.showButtons = function(app, fromId, data) {
		var cfgfrom = null;
		if (fromId && this.APPS_MAP[fromId]) {
			// 返回button
			cfgfrom = this.APPS_MAP[fromId];
			// 审批或细节
			if (cfgfrom.APP_TYPE == 'detail' || (cfgfrom.APP_TYPE == 'list' && cfgfrom.APP_XML_NAME == '')) {
				fromId = cfgfrom._FROMID;
			}
			var exp = '#app' + app.APP_ID + ' .ui-btn-left:eq(0)';
			if (fromId == null || fromId == "" || fromId == "home") {
				$(exp).attr('href', '#app');
				$(exp).attr('onclick', 'javascript:void(0)');
			} else {
				$(exp).attr('href', '#app' + fromId);
			}
		}

		if (cfgfrom && cfgfrom.APP_ITEM_NAME && cfgfrom.APP_ITEM_NAME.toLowerCase() == "v_sp_main.listframe.view") {
			// sp
			var exp = '#app' + app.APP_ID + ' a[data-icon1=action]';
			$(exp).show();
			var txt1 = this.isEn ? 'Approval' : '审批';
			$(exp).html(txt1);
			$(exp).attr('href', '#app' + this.WF_ID);
			$(exp)[0].onclick = function() {
				mc.loadApp(mc.WF_ID, app.APP_ID);
			};
		}
		var right = 0;
		if (app.APP_TYPE == 'list' && app.APP_XML_NAME != null && app.APP_XML_NAME != "") {
			// button more
			var exp = '#app' + app.APP_ID + ' a[data-icon1=recycle]';
			$(exp).show();

			var txt2 = this.isEn ? 'More' : '多';

			$(exp).html(txt2);
			// button refresh
			var exp1 = '#app' + app.APP_ID + ' a[data-icon1=refresh]';
			$(exp1).show();
			// $(exp).css('right', 60);
			right += 60 * 2;

			var txt1 = this.isEn ? 'Refresh' : '刷';
			$(exp1).html(txt1);
		}
		if (app.APP_TYPE == 'frame') {
			var exp = '#app' + app.APP_ID + ' a[data-icon1=action]';
			$(exp).show();
			right += 60 + 4;
			if (fromId) {
				// 返回button
				if (cfgfrom.APP_TYPE == 'list') {
					var exp = '#app' + app.APP_ID + ' a:eq(0)';
					var c = this;
					if ($(exp).length > 0) {
						$(exp)[0].onclick = function() {
							c.RELOAD_DATA = true;
						};
					} else {
						console.log($(exp));
						console.log($('#app' + app.APP_ID + ' a'));
					}
				}
			}
		}
		// 审批详情的acion
		if (app.APP_ID == this.WF_DETAIL_ID || (app.APP_TYPE == 'detail' && cfgfrom && cfgfrom["_DATAS"].WF)) {// sp
			var exp = '#app' + app.APP_ID + ' a[data-icon1=action]';
			var jo = $(exp);
			jo.show();
			jo.attr('href', '#app' + this.WF_ID);

			var txt1 = this.isEn ? 'Approval' : '审批';
			jo.html(txt1);

			var c = this;
			jo[0].onclick = function() {
				c.loadApp(c.WF_ID, this, app.APP_ID);
			};
		}

		var addId = app.APP_FRAME_ADD_ID;
		if (addId != null && addId != "") {
			var exp = '#app' + app.APP_ID + ' a[data-icon1=plus]';
			var jo = $(exp);
			jo.show();
			jo.attr('href', '#app' + addId);
			if (app.APP_ID == this.WF_ID) {
				var txt1 = this.isEn ? 'Step' : '过程';
				jo.html(txt1);
			} else {
				var cfgadd = this.APPS_MAP[addId];
				if (cfgadd == null) {
					alert('APP定义错误[' + addId + ']');
					return;
				}
				var txt1 = this.isEn ? cfgadd.APP_TITLE_ENUS : cfgadd.APP_TITLE;

				var title = this.replaceParameter(txt1, data);
				jo.html(title);
			}
			var c = this;
			jo[0].onclick = function() {
				c.loadApp(addId, this, app.APP_ID);
			};
			// jo.css('right', right - 4);
		}
	};
	this.createElements = function(datas, app, fromId) {
		// 配置信息放到app里
		app["_DATAS"] = datas;
		if (app.APP_TYPE == 'frame') {
			this.createFrameFrame(app, datas, fromId);
		} else if (app.APP_TYPE == 'list') {
			this.createFrameList(app, datas, fromId);
		}

	};
	this.createFrameHome = function(app, cfgJson, fromApp) {
		var id = app.APP_ID;
		var ss = [];
		for ( var n in app._CHDS) {
			var chdApp = app._CHDS[n];
			var ico = chdApp.APP_ADD_PARA2 == null || chdApp.APP_ADD_PARA2 == "" ? "icon-blank" : chdApp.APP_ADD_PARA2;
			var title = this.isEn ? chdApp.APP_TITLE_ENUS : chdApp.APP_TITLE;
			var s2 = '<li onclick=\'mc.loadApp(' + chdApp.APP_ID + ",this," + id + ");\'><a class='icon " + ico + "' href='#app"
				+ chdApp.APP_ID + "' data-transition='slide'>" + title + "</a></li>";
			ss.push(s2);
		}
		$('#app' + app.APP_ID + ' ul').html(ss.join(''));
		$('#app' + app.APP_ID).page();
		$('#app' + app.APP_ID + ' ul').listview('refresh');

		console.log(fromApp);
	};
	this.createFrameWeb = function(app, cfgJson, fromApp, data) {
		var u = app.APP_URL;
		u = this.replaceParameter(u, data);
		if (u.indexOf('http') < 0) {
			u = this.ROOT + '/' + u;
		}
		var ida = 'UL' + app.APP_ID;
		$('#app' + app.APP_ID + ' ul')[0].id = ida;
		// ajax.Install(u,"EWA_AJAX=install",ida,function(){});
		if ($('#app' + app.APP_ID + ' iframe').length == 0) {
			var s = '<iframe src="' + u + '" frameborder=0 width=100% height=100%></iframe>';
			$('#app' + app.APP_ID + ' ul').html(s).trigger("create");
			$('#app' + app.APP_ID + ' ul').css("background-color", "#fff");
		} else {
			$('#app' + app.APP_ID + ' iframe').attr('src', u);
		}

	};
	this.createFrameJs = function(app, cfgJson, fromApp, data) {
		var js = app.APP_MAP_MSG;
		js = this.replaceParameter(js, data);
		var oo = $('#app' + app.APP_ID);
		// var jsold = oo.attr('js');
		// if (jsold == js) {
		// return;
		// }
		try {
			eval(js + "(app, cfgJson, fromApp, data)");
			oo.attr('js', js);
		} catch (e) {
			oo.find('ul').html("ERROR" + e);
		}
	};
	this.showLargePic = function(obj) {
		var m = new EWA_UI_PicViewClass();
		m.create();
		m.addPic(obj.src);
	};
	this.createFrameDetailSp = function(app, cfgJson, fromApp, data, obj, datas) {
		var id = app.APP_ID;
		var ss = [];
		var ss1 = [];
		for ( var i in cfgJson) {
			var cfg = cfgJson[i];
			var name = cfg.NAME;
			var name1 = name + '_HTML';
			var des = cfg.DES;
			var val = data[name];
			if (data[name1]) {
				val = data[name1];
			}
			if (val != null && val.length > 0) {
				var s2;
				if (val.toLowerCase().endsWith('.jpg')) {
					s2 = "<div><div>" + des + ":</div><img onclick='mc.showLargePic(this)' style='width:99%' src='"
						+ val.replace('_SMAILL.', '.') + "' /></div>";
					ss1.push(s2);
				} else {
					s2 = "<li json_ref='0' onclick='mc.loadApp(" + this.WF_ID + ",this," + id + ")'><a  href='#app" + this.WF_ID
						+ "' data-transition='pop'>" + des + ": " + val + "</a></li>";
					ss.push(s2);
				}

			}
		}
		$('#app' + app.APP_ID + ' ul').html(ss.join('') + ss1.join(''));

		// 返回
		$('#app' + app.APP_ID + ' .ui-btn-left:eq(0)').attr('href', '#app' + fromApp.APP_ID);
		// 配置信息放到UL里
		app._DATAS = datas;

		$('#app' + app.APP_ID).page();
		$('#app' + app.APP_ID + ' ul').listview('refresh');

		var wf = this.setWfAppParameters(datas);
		var p = this.replaceParameter(wf.APP_URL_PARAS, data);
		wf.APP_URL_PARAS = p;
		wf._PARAMS = p;
	};

	this.createFrameDetail = function(app, cfgJson, fromApp, data, obj) {
		var id = app.APP_ID;
		var ss = [];
		var ss1 = [];
		var ss2 = [];
		for ( var i in cfgJson) {
			var cfg = cfgJson[i];
			var name = cfg.NAME;
			var name1 = name + '_HTML';
			var des = cfg.DES;
			var val = data[name];
			if (data[name1]) {
				val = data[name1];
			}
			if (val != null && val.length > 0) {
				var click = "";
				if (app.APP_FRAME_MODIFY_ID != null) {
					click = " onclick='mc.loadApp(" + app.APP_FRAME_MODIFY_ID + ",this," + id + ")'";
				}
				var s2 = "<li json_ref='" + obj.getAttribute('json_ref') + "' " + click + ">";
				if (name.toUpperCase().indexOf('TEL') >= 0 || name.toUpperCase().indexOf('MOBI') >= 0
					|| name.toUpperCase().indexOf('PHONE') >= 0) {
					s2 = "<li><a href='tel:" + val + "' class='icon icon-phone'>" + des + ": " + val + "</a></li>";
					ss1.push(s2);
				} else if (name.toUpperCase().indexOf('MAIL') >= 0) {
					s2 = "<li><a href='mailto:" + val + "' class='icon icon-mail'>" + des + ": " + val + "</a></li>";
					ss1.push(s2);
				} else if (val.endsWith(".jpg")) {
					// s2 = "<img onclick='mc.showPic(this)' src='" + val + "'
					// />";
					// ss1.push(s2);
					s2 = "<div><div>" + des + ":</div><img onclick='mc.showLargePic(this)' style='width:99%' src='"
						+ val.replace('_SMAILL.', '.') + "' /></div>";
					ss2.push(s2);
				} else if (app.APP_FRAME_MODIFY_ID == null) {
					s2 += "<div>" + des + ": " + val + "</div></li>";
					ss.push(s2);
				} else {
					s2 += "<a  href='#app" + app.APP_FRAME_MODIFY_ID + "' data-transition='pop'>" + des + ": " + val
						+ "</a></li>";
					ss.push(s2);
				}
			}
		}
		$('#app' + app.APP_ID + ' ul').html(ss1.join('') + ss.join('') + ss2.join(''));

		if (fromApp) {
			// 配置信息放到UL里
			app._DATAS = fromApp._DATAS;
		}
		$('#app' + app.APP_ID).page();
		$('#app' + app.APP_ID + ' ul').listview('refresh');
	};
	this.showPic = function(o) {
		var tb = document.createElement('table');
		var td = tb.insertRow(-1).insertCell(-1);
		$(tb).css({
			"width" : '100%',
			"height" : document.body.scrollHeight,
			position : 'absolute',
			top : '0px',
			left : '0px',
			"z-index" : 1000000,
			"text-align" : "center",
			"background-color" : "#111",
			"opacity" : "0.9"
		});
		$(td).css({
			"width" : '100%',
			"height" : '100%'
		});
		var img = document.createElement('img');
		$(img).css({
			"max-width" : '100%',
			"max-height" : '100%',
		});
		img.src = o.src.replace('_SMAILL', '');
		tb.onclick = function() {
			$(this).remove();
		};
		td.appendChild(img);
		document.body.appendChild(tb);
	};
	this.createFrameCalendar = function(app, cfgJson, fromApp, data, obj) {
		var id = app.APP_ID;
		var oo = $('#app' + id + ' ul').parent();
		oo.html("<input type=hidden id='app_cal_" + id + "'>");

		var cal = new EWA_CalendarClass();
		var obj = cal.CreateCalendar();
		obj.rows[3].style.display = 'none';
		obj.width = '100%';
		obj.rows[1].cells[0].childNodes[0].width = '100%';

		var isStart = false;
		$(obj).find('td [onmouseout]').each(function() {
			if (this.innerHTML.trim() == '') {
				if (isStart)
					this.style.display = 'none';
			} else {
				isStart = true;
			}
		});

		window._EWA_CALENDAR_ITEM = cal;
		_EWA_CALENDAR_ITEM.Object = $X('app_cal_' + id);
		cal.Object = $X('app_cal_' + id);
		cal.Dialog = {
			Show : function() {
				cal.Object = $X('app_cal_' + id);
			}
		};
		// js
		if (app.APP_MAP_MSG.length > 0) {
			var js = this.replaceParameter(app.APP_MAP_MSG, data);
			eval(js);
		}
		oo.append(obj);

		if (this.THEME == 'b') {
			$('#app' + id + ' table').css({
				"background-color" : "#111"
			});
		}

		oo.append("<ul style='padding:0em' id='app_show_" + id + "'></ul>");
		// 返回
		$('#app' + app.APP_ID + ' .ui-btn-left:eq(0)').attr('href', '#app' + fromApp.APP_ID);
		// 配置信息放到UL里
		app._DATAS = fromApp._DATAS;

		$('#app' + app.APP_ID).page();

		this._CalendarChangeDate(id);
		var c = this;
		$('#app' + id + ' select').bind('change', function() {
			c._CalendarChangeDate(id);
		});
	};
	this._CalendarChangeDate = function(id) {
		var w = (100 / 7) + '%';
		$('#app' + id + ' td[onmouseout] div').each(function() {
			var ids = this.title.split('-');
			var id = ids[0] + (ids[1] < 10 ? '0' + ids[1] : ids[1]) + (ids[2] < 10 ? '0' + ids[2] : ids[2]);
			this.parentNode.id = id;

			$(this.parentNode).css({
				'width' : w,
				height : 30,
				'line-height' : '30px',
				'font-size' : '14px'
			});
			$(this).parent().append('<div></div>');
		});
		var ym = $('#app' + id + ' select');
		// year,month
		if (window.load4App) {
			load4App(id, ym[1].value, ym[0].value * 1 + 1);
		} else {
			alert('请定义load4App 用于CalendarChange调用');
		}
	};

	this.createFrameFrame = function(app, datas, fromAppId, isSkip) {
		var id = app.APP_ID;
		var c = this;
		if (id == this.WF_ID && !isSkip) {
			var urlSp = this.ROOT + "/EWA_STYLE/cgi-bin/_wf_/?ewa_wf_type=ins_get&" + app._PARAMS;
			$JG(urlSp, function(rst) {
				// console.log(rst);
				var cfgMap = $J2MAP(datas.CFG, 'NAME', '');

				for ( var n in datas.CFG) {
					if (datas.CFG[n].NAME == 'EWA_WF_UOK') {
						cfgNext = datas.CFG[n];
					}
					if (datas.CFG[n].NAME.indexOf('EWA_WF') < 0) {
						datas.CFG[n]._WFSHOW = false;
					} else {
						datas.CFG[n]._WFSHOW = true;
					}
				}
				// 根据节点显示对象
				for ( var n in rst.WF_SHOW) {
					var XITEMS = rst.WF_SHOW[n].XITEMS;
					var xx = XITEMS.split(',');
					for ( var m in xx) {
						var key = xx[m].trim();
						if (cfgMap[key])
							cfgMap[key]._WFSHOW = true;
					}
				}
				cfgNext.LST = [];
				var map = $J2MAP(rst.UNIT, 'WF_UNIT_ID', '');
				var curId = rst.WF_CUR;
				app._PARAMS += "&SYS_STA_TAG=" + curId;

				// 审批过程查看
				var chartApp = c.APPS_MAP[c.WF_CHART_ID];
				chartApp.APP_URL = chartApp._APP_URL + '&' + app._PARAMS;
				// 选择节点的内容
				for ( var n in rst.CNN) {
					var cnn = rst.CNN[n];
					if (curId == cnn.WF_UNIT_FROM) {
						var toId = cnn.WF_UNIT_TO;
						var toTxt = map[toId].WF_UNIT_NAME;
						cfgNext.LST.push({
							V : toId,
							T : toTxt
						});
					}
				}
				c.createFrameFrame(app, datas, fromAppId, true);
			});
			return;
		}

		var ss = [];
		var data = [];
		if (datas['DATA'].length > 0) {
			data = datas['DATA'][0];
		}

		data = this.meargeData(data, app._REFDATA);
		var dhtmls = [];
		for ( var i in datas['CFG']) {
			var cfg = datas['CFG'][i];
			if (cfg.TAG == 'button' || cfg.TAG == 'submit') {
				continue;
			}
			if (id == this.WF_ID && !cfg._WFSHOW) {
				continue;
			}
			var name = cfg.NAME;
			var name1 = name + '_HTML';
			var des = cfg.DES;
			var val = cfg.VAL;
			if (val == null) {
				val = data[name];
				if (data[name1]) {
					val = data[name1];
				}
			}
			var s2 = '';

			var evts = this.createItemEvts(cfg);

			if (cfg.TAG == 'span') {
				s2 = '<div class="ui-input-text ui-body-inherit ui-corner-all ui-mini ui-shadow-inset" ' + evts
					+ ' style="padding:4px;">' + des + ": <span id='" + name + "'>" + (val == null ? "" : val.toHtml())
					+ '</span></div>';

			} else if (cfg.TAG == 'textarea') {
				s2 = '<textarea data-mini=\"true\"  ' + evts + ' id="' + name + '" style="width:100%;height:50px" placeholder="'
					+ des + '">' + (val == null ? "" : val.toHtml()) + '</textarea>';

			} else if (cfg.TAG == 'select' || cfg.TAG == 'radio') {
				var opts = [];
				var isHaveBlank = false;
				for ( var n in cfg.LST) {
					var opt = cfg.LST[n];
					var chk = "";
					if (opt.V == val) {
						chk = " selected";
					}
					var t = opt.T;
					if (opt.V == "") {
						isHaveBlank = true;
						t = "--" + des + "--";
					}
					var title = "";
					if (opt.TT && opt.TT.length > 0) {
						title = " title=\"" + opt.TT.toHtml() + "\" ";
					}
					var sopt = "<option " + chk + " value=\"" + opt.V.toHtml() + "\" " + title + ">" + t.toHtml() + "</option>";
					opts.push(sopt);
				}
				var addOpt = "";
				if (!isHaveBlank) {
					addOpt = "<option value=''>--" + des.toHtml() + "--</option>";
				}
				s2 = '<select data-mini=\"true\" ' + evts + ' id="' + name + '" style="">' + addOpt + opts.join("") + '</select>';

			} else if (cfg.TAG == 'swffile' || cfg.TAG == 'image' || cfg.TAG == 'h5upload') {
				if (!this.jpgCompress) { // 图片在线压缩
					this.jpgCompress = new JPEGEncoder(30);

				}
				var u = this.ROOT_EWA + '?XMLNAME=' + app.APP_XML_NAME + '&ITEMNAME=' + app.APP_ITEM_NAME;
				if (app.APP_URL_PARAS != null && app.APP_URL_PARAS.length > 0) {
					var p = app.APP_URL_PARAS;

					p = this.replaceParameter(p, data);

					u += '&' + p;
				}
				var action = u.replace("/cgi-bin/", "/cgi-bin/_up_/") + "&EWA_UP_TYPE=SWFUPLOAD&NAME=" + name;
				var target = "u" + name;
				var multi = (cfg.UpMulti == null || cfg.UpMulti != "yes") ? false : true;

				s2 = "<div class='ewa_app_upload_form ui-body-inherit ui-corner-all ui-mini ui-shadow-inset'><form style='zindex:0' name='f"
					+ id
					+ "' target='"
					+ target
					+ "'  action=\""
					+ action
					+ "\" method=\"post\" enctype=\"multipart/form-data\">"
					+ "<input "
					+ (multi ? "multiple" : "")
					+ " data-role='none'  onchange=\"showPreview(this,"
					+ multi
					+ ")\" type=\"file\" name=\""
					+ name
					+ "\" id=\""
					+ name
					+ "\" placeholder=\""
					+ des
					+ "\" value=\"\"></form><iframe name='"
					+ target
					+ "' style='display:none'></iframe></div>";

			} else if (cfg.TAG == 'datetime') {
				s2 = "<div data-mini=\"true\" class=\"ui-field-contain\"><label class='ui-mini' for='" + name + "'><sub>" + des
					+ ": </sub></label><input class='ui-mini' " + evts + " value=\"" + (val == null ? "" : val.replace(' ', 'T'))
					+ "\"   type=\"datetime-local\" name=\"" + name + "\" id=\"" + name + "\" placeholder=\"" + des
					+ "\"  ></div>";
			} else if (cfg.TAG == 'date') {
				s2 = "<div data-mini=\"true\" class=\"ui-field-contain\"><label class='ui-mini' for='" + name + "'><sub>" + des
					+ ": </sub></label><input class='ui-mini'  " + evts + " value=\"" + (val == null ? "" : val)
					+ "\"  type=\"date\" name=\"" + name + "\" id=\"" + name + "\" placeholder=\"" + des + "\" ></div>";
			} else if (cfg.TAG == 'time') {
				s2 = "<div data-mini=\"true\" class=\"ui-field-contain\"><label class='ui-mini' for='" + name + "'><sub>" + des
					+ ": </sub></label><input class='ui-mini'  " + evts + " value=\"" + (val == null ? "" : val)
					+ "\"  type=\"time\" name=\"" + name + "\" id=\"" + name + "\" placeholder=\"" + des + "\" ></div>";
			} else if (cfg.TAG == 'droplist') {
				var droplstu = this.ROOT_EWA + '?XMLNAME=' + cfg.CallXmlName + '&itemname=' + cfg.CallItemName + '&ewa_action='
					+ cfg.DlsAction + '&ewa_ajax=json&' + cfg.CallPara + '=';

				s2 = "<input data-mini=\"true\"  " + evts + " id='ref_" + name
					+ "' type=text readonly onclick='mc.showDdl(this)' placeholder=\"" + des + "\"/><input  u=\"" + droplstu
					+ "\" show=\"" + cfg.DlsShow + "\" value=\"" + (val == null ? "" : val) + "\"  type=\"hidden\" name=\""
					+ name + "\" id=\"" + name + "\"  >";
				if (val != null && val.trim().length > 0) {
					var u = droplstu + val;
					this._loadDropList(u, name);
				}

			} else if (cfg.TAG == 'hidden') {
				s2 = '<input id="' + name + '" type=hidden value="' + (val == null ? "" : val.toHtml()) + '"/>';
			} else if (cfg.TAG == "dHtmlNoImages" || cfg.TAG == "dHtml") {
				s2 = '<div>'
					+ des
					+ '</div><div style="height:150px;overflow:auto;border:1px solid #ccc;background-color:#fff;color:#000" contentEditable=true id="'
					+ name + '_DHTML"></div><input type=hidden id="' + name + '" value="' + (val == null ? "" : val.toHtml())
					+ '">';
				dhtmls.push(name);
			} else if (cfg.TAG == 'checkbox') {
				var opts = [ '<fieldset  data-role="controlgroup" id="JQM_' + name + '"><legend>' + des + ':</legend><div id="'
					+ name + '">' ];
				for ( var n in cfg.LST) {
					var opt = cfg.LST[n];
					var id = "AA_" + Math.random();

					var sopt = "<input data-mini=\"true\" id='" + id + "' type=\"checkbox\" value=\"" + opt.V.toHtml()
						+ "\"><label " + evts + " for='" + id + "'>" + opt.T.toHtml() + "</label>";
					opts.push(sopt);
				}
				opts.push("</div></fieldset>");
				s2 = opts.join("");
			} else if (cfg.TAG == 'password') {
				s2 = '<input data-mini=\"true\" ' + evts + ' id="' + name + '" type=password placeholder="' + des + '" value="'
					+ (val == null ? "" : val.toHtml()) + '"/>';
			} else {
				s2 = '<input data-mini=\"true\" ' + evts + ' id="' + name + '" type=text placeholder="' + des + '" value="'
					+ (val == null ? "" : val.toHtml()) + '"/>';
			}
			ss.push(s2);
		}
		$('#app' + app.APP_ID + ' ul').html(ss.join('')).trigger("create");
		if (dhtmls.length > 0) {
			this.TIMER_DHTML = window.setInterval(function() {
				for (var i = 0; i < dhtmls.length; i++) {
					var o = $('#' + dhtmls[i]);
					var v1 = o.val();
					var v2 = o.attr('oldv');
					if (v1 != v2) {
						o.attr("oldv", v1);
						$('#' + dhtmls[i] + '_DHTML').html(v1);
					}
				}
			}, 400);
		}

		// step
		EWA_Utils.JsRegister(datas.JSFRAME);
		var ewa = EWA.F.FOS[datas.FRAME_UNID];
		var map = {};
		var max = -111;
		for ( var n in ewa.ItemList.Items) {
			var xi = ewa.ItemList.Items[n];
			var groupIndex = $(xi).find('Set[GroupIndex]').attr('GroupIndex');
			if (groupIndex) {
				map[n] = groupIndex * 1;
				if (map[n] > max) {
					max = map[n];
				}
			}
		}
		if (max >= 0) {
			console.log(map)
			datas.steps = map;
			datas.steps_index = -1;
			datas.steps_max = max;

			var id1 = 'but_next_prev_' + id;
			if ($('#' + id1).length == 0) {
				var s = '<table style="clear:both" id="' + id1 + '" align="center"><tr><td>'
					+ '<a class="ui-btn" onclick="mc.frameNextPrev(-1)" >上一步</a></td><td>'
					+ '<a class="ui-btn" onclick="mc.frameNextPrev(1)">下一步</a></td></tr></table>';
				$('#app' + id + ' ul').append(s);
			}
			setTimeout(function() {
				mc.frameNextPrev(1);
			}, 111);
		}
		if (datas.JS.length > 0) {
			var js = this.replaceParameter(datas.JS, data);
			EWA_Utils.JsRegister(js);
			// console.log(js)
		}

		if (app.APP_JS_LOADED) {
			try {
				eval(app.APP_JS_LOADED);
			} catch (e) {
				console.log(e, app.APP_JS_LOADED);
			}
		} else {
			if (window.EWA_AppLoaded) {
				console.log(window.EWA_AppLoaded);
				window.EWA_AppLoaded(app);
				EWA_AppLoaded = null;
			}
		}
	};
	this.frameNextPrev = function(dv) {
		var o = mc.APPS_MAP[mc._CURAPPID]._DATAS;
		var map = o.steps;
		var steps_index = o.steps_index;
		var max = o.steps_max;

		if (dv == -1 && steps_index == 0) {
			alert('已经是第一个了');
			return;
		}
		if (dv == 1 && steps_index == max) {
			alert('已经是最后了');
			return;
		}
		if (steps_index >= 0) {
			var isoks = this.checkSubmitValid(mc._CURAPPID);
			if (!isoks[0]) {
				return;
			}
		}
		o.steps_index += dv;
		steps_index = o.steps_index;

		for ( var n in map) {
			var v = map[n];
			var o1 = $('#' + n);
			if (o1.length == 0) {
				continue;
			}
			if (v == null || v * 1 != steps_index) {
				if (o1.parent().attr('class') == 'ui-listview') {
					o1.hide();
				} else if (o1.parent()[0].tagName == 'FORM') {
					o1.parent().parent().hide();
				} else {
					o1.parent().hide();
				}

				var o2 = $('label[for="' + n + '"]').parent().hide();
				o1.attr('step_hide', 1);
			} else {
				if (o1.parent().attr('class') == 'ui-listview') {
					o1.show();
				} else if (o1.parent()[0].tagName == 'FORM') {
					o1.parent().parent().show();
				} else {
					o1.parent().show();
				}

				var o2 = $('label[for="' + n + '"]').parent().show();
				o1.attr('step_hide', 0);
			}
		}
	};
	this.createItemEvts = function(cfg) {
		var ss = [];
		for ( var n in cfg) {
			if (n.indexOf('ON') == 0) {
				ss.push(" " + n + "=\"" + cfg[n] + "\" ");
			}
		}
		return ss.join(" ");
	};
	this.showDdl = function(obj) {
		$("#ddlSubject").html(obj.getAttribute('placeholder'));
		$("#ddlInput").attr("ref", obj.id.replace('ref_', ''));
		window.location = "#ddl";
	};
	this._loadDropList1 = function(obj) {
		var id = $(obj).attr("ref");
		var u = $('#' + id).attr("u");
		u = u.replace('ewa_action', 'aa').replace("ewa_ajax=json", "ewa_ajax=json_ext") + ("%" + obj.value + "%").toURL();

		this._loadDropList12(u, id);
	};
	this._loadDropList12 = function(u, id) {
		$JG(u, function(datas) {
			window.___DDLDATA = datas.DATA;
			var ss = [];
			var vname = datas.CFG[0].NAME;
			var dname = datas.CFG[1].NAME;

			for (var i = 0; i < datas.DATA.length; i++) {
				if (i > 5) {
					break;
				}
				var d = datas.DATA[i];
				var v = d[vname];
				var t = d[dname];
				var id = 'aaaa' + i;
				var s1 = '<input type="radio" name="aaa" onclick="mc._loadDropList13(this,' + i + ')"  id="' + id + '" value="'
					+ v + '"><label for="' + id + '">' + t + "</label>";
				ss.push(s1);
			}
			$('#ddllst').html(ss.join('')).trigger('create');

		});
	};
	this._loadDropList13 = function(obj, idx) {
		var d = window.___DDLDATA[idx];
		var v = obj.value;
		var ref = $("#ddl input:eq(0)").attr('ref');
		$('#' + ref).val(v);
		var ss = $('#' + ref).attr('show');
		ss = ss.toUpperCase();
		var v1 = this.replaceParameter(ss, d);
		$('#ref_' + ref).val(v1);

		$("#ddl a").click();
	};
	this._loadDropList = function(u, name) {
		var c = this;
		$J1(u, function(datas) {
			if (datas.length > 0) {
				var ss = $('#' + name).attr('show');
				ss = ss.toUpperCase();
				var v = c.replaceParameter(ss, datas[0]);
				$('#ref_' + name).val(v);
			}
		});
	};
	this.setWfAppParameters = function(datas) {
		var wf = this.APPS_MAP[this.WF_ID];
		wf.APP_XML_NAME = datas.WF.X;
		wf.APP_ITEM_NAME = datas.WF.I;
		// var keyExp = [];
		// for ( var n in datas.WF.RID) {
		// keyExp.push("@" + datas.WF.RID[n]);
		// }
		var keyExp = [ '@EWA_KEY' ];
		wf.APP_URL_PARAS = datas.WF.P.replace(/\[RID\]/ig, keyExp.join(','));
		return wf;
	};
	this.createFrameList = function(app, datas, fromId) {
		var c = this;
		var id = app.APP_ID;
		var lbl = c.isEn ? app.APP_MAP_LABEL_ENUS : app.APP_MAP_LABEL;
		var msg = c.isEn ? app.APP_MAP_MSG_ENUS : app.APP_MAP_MSG;
		var ss = [];
		var detailId = app.APP_FRAME_DETAIL_ID;
		if (detailId == null || detailId == "") {
			detailId = app.APP_FRAME_MODIFY_ID;
		}

		if (!detailId && datas.WF) {
			detailId = this.WF_DETAIL_ID;

		}
		if (datas.WF) {
			this.setWfAppParameters(datas);
		}

		if ((app.APP_SCROLL_LOAD_MORE != 'y' || app._CURPAGE == 1) && app.APP_SEARCH_NAME != null
			&& app.APP_SEARCH_NAME.trim().length > 0) {
			var stxt = c.isEn ? 'Search' : '查询';
			var search = "<input class='search'  placeholder='" + stxt + "' "
				+ " type=\"search\" data-mini=\"true\" onblur='mc.doSearch(" + id + ",this);'/>";
			ss.push(search);

		}

		this.APPS_MAP[id]._DATAS.last_count = datas['DATA'].length;

		if (datas['DATA'].length == 0) {
			var stxt1 = c.isEn ? 'No data' : '没有数据';
			ss.push("<div style='text-align:center'>" + stxt1 + "</div>");
		} else {

			var selfDefined = null;
			if (detailId == null) {
				for (var i = 0; i < datas['CFG'].length; i++) {
					var d = datas['CFG'][i];
					if (d.ONCLICK) {
						selfDefined = d._ONCLICK; // 未替换的模板
						break;
					}
				}
			}

			for (var i = 0; i < datas['DATA'].length; i++) {
				var d = datas['DATA'][i];
				var lbl1 = c.replaceParameter(lbl, d);
				var msg1 = c.replaceParameter(msg, d);
				msg1 = msg1.replace(/\n/ig, '<br>');
				var s2;
				if (detailId == null) {
					if (selfDefined) {
						var sfd = this.replaceParameter(selfDefined, d);
						s2 = "<li json_ref='" + i + "'><a href=\"javascript:" + sfd + "\" data-transition='pop' >" + lbl1
							+ (msg1.length > 0 ? '<br><sub>' + msg1 + '</sub>' : "") + "</a></li>";
					} else {
						s2 = "<li json_ref='" + i + "'><div>" + lbl1 + (msg1.length > 0 ? '<br><sub>' + msg1 + '</sub>' : "")
							+ "</div></li>";
					}
				} else {
					s2 = '<li onclick=\'mc.loadApp(' + detailId + ",this," + id + ");\' json_ref='" + i + "'><a href='#app"
						+ detailId + "' data-transition='pop'>" + lbl1 + (msg1.length > 0 ? '<br><sub>' + msg1 + '</sub>' : "")
						+ "</a></li>";
				}
				ss.push(s2);
			}
		}
		if (datas.JS && datas.JS.length > 0) {
			EWA_Utils.JsRegister(datas.JS);
			// console.log(js)
		}

		if (app.APP_SCROLL_LOAD_MORE == 'y' && app._CURPAGE > 1) {
			$('#app' + app.APP_ID + ' ul').append(ss.join('')).trigger("create");
		} else {
			$('#app' + app.APP_ID + ' ul').html(ss.join('')).trigger("create");
		}
		try {
			$('#app' + app.APP_ID + ' ul').listview('refresh');
		} catch (e) {
		}
		$('#app' + app.APP_ID + ' .search').val(app._SEARCHTXT);

		this._is_scroll_load_more = false;
		if (app.APP_JS_LOADED) {
			try {
				eval(app.APP_JS_LOADED);
			} catch (e) {
				console.log(e, app.APP_JS_LOADED);
			}
		} else {
			if (window.EWA_AppLoaded) {
				console.log(window.EWA_AppLoaded);
				window.EWA_AppLoaded(app);
				EWA_AppLoaded = null;
			}
		}
	};
	this.doSearch = function(id, obj) {
		var app = this.APPS_MAP[id];

		var oldTxt = app._SEARCHTXT;
		if (oldTxt == null) {
			oldTxt = "";
		}
		var newTxt = obj.value;
		if (oldTxt == newTxt) {
			return;
		}

		var u = this.createListUrl(id);
		var c = this;
		this.showWait();
		$JG(u, function(datas) {
			c.createElements(datas, app);
			c.hideWait();
		});
	};
	this.loadMore = function(id) {
		var app = this.APPS_MAP[id];
		if (!app._CURPAGE) {
			app._CURPAGE = 1;
		} else {
			app._CURPAGE += 1;
		}
		console.log(app._CURPAGE)
		var u = this.createListUrl(id);
		var c = this;
		this.showWait();
		$JG(u, function(datas) {
			c.createElements(datas, app);
			c.hideWait();
		});
	};
	this.reloadData = function(id) {
		var app = this.APPS_MAP[id];
		app._CURPAGE = 1;
		var u = this.createListUrl(id);
		var c = this;
		this.showWait();
		$JG(u, function(datas) {
			c.createElements(datas, app);
			c.hideWait();
		});
	};
	this.createListUrl = function(id) {
		var app = this.APPS_MAP[id];
		var u = this.ROOT_EWA + '?XMLNAME=' + app.APP_XML_NAME + '&ITEMNAME=' + app.APP_ITEM_NAME
			+ '&EWA_AJAX=json_ext&EWA_FRAMESET_NO=1';
		var data = app._REFDATA;
		if (app.APP_URL_PARAS != null && app.APP_URL_PARAS.length > 0) {
			var p = app.APP_URL_PARAS;
			if (data) {
				p = this.replaceParameter(p, data);
			}
			u += '&' + p;
		}
		// 检索词
		var searchTxt = $('#app' + id + ' .search').val();
		if (searchTxt == null) {
			searchTxt = "";
		}
		var s = "";
		var isNew = false;
		var curPage = app._CURPAGE ? app._CURPAGE : 1;
		if (searchTxt.length > 0) {
			s = "&ewa_lf_search=@!@" + app.APP_SEARCH_NAME.trim() + "~!~text~!~" + searchTxt.toURL();

		}
		isNew = (searchTxt != app._SEARCHTXT); // 重新检索
		app._SEARCHTXT = searchTxt;
		if (isNew) {
			curPage = 1;
			app._CURPAGE = 1;
		}

		u = u + "&ajax=1&EWA_PAGESIZE=10&EWA_PAGECUR=" + curPage + s;
		return u;
	};
	this.replaceParameter = function(str, data) {
		var r1 = /\@[a-zA-Z0-9\-\._:]*\b/ig;
		var dd = {};
		for ( var n in data) {
			dd[n.toUpperCase()] = data[n];
		}
		var m1 = str.match(r1);
		for ( var n in m1) {
			var key = m1[n];
			var v = dd[key.replace('@', '').toUpperCase()];
			if (!v) {
				v = '';
			}
			str = str.replace(key, v);
		}
		return str;
	};

	// ---
	this.doGetAppCfgsIcon = function(para0) {
		var u = this.ROOT_EWA + "?XMLNAME=|ewa|app_cfg.xml&ITEMNAME=_EWA_APP_CFG.Tree.Modify&para0=" + para0
			+ "&EWA_action=loadicons&ewa_ajax=json&icon=1&EWA_FRAMESET_NO=1";
		var c = this;
		this.showWait();
		$JG(u, function(datas) {
			c.doGetAppCfgsIcon1(datas);
		});
	};
	this.doGetAppCfgsIcon1 = function(datas) {
		var tb = document.createElement("table");
		tb.width = '100%';
		tb.border = 0;
		var tr;
		for (var i = 0; i < datas.length; i++) {
			if (i % 2 == 0) {
				tr = tb.insertRow(-1);
			}
			var app = datas[i];
			var td = tr.insertCell(-1);
			td.width = "33.33%";
			td.innerHTML = "<div onmouseover='this.className=\"micon1\"' onmouseout='this.className=\"micon\"' class='micon' >"
				+ app.APP_TITLE + "</div>";
			td.align = 'center';
		}
		$('#title').html('主页');
		$('#content').html("");
		$('#content').append(tb);
	};
	// load home
	this.doGetAppCfgs = function(url) {
		var c = this;
		this.showWait();
		$JG(url, function(datas) {
			c.doGetAppCfgs1(datas);
		});
	};
	this.doGetAppCfgs1 = function(datas) {
		var c = this;
		c.APPS = datas;
		for(var n in c.APPS){
			var o=c.APPS[n];
			if(o.APP_XML_NAME){
				o.APP_XML_NAME=o.APP_XML_NAME.replace(/\|/ig,'/');
			}
		}
		c.APPS.push({
			APP_ID : c.WF_ID,
			APP_PID : '-WF',
			APP_TITLE : '审批',
			APP_TYPE : "frame",
			APP_FRAME_ADD_ID : c.WF_CHART_ID
		});
		c.APPS.push({
			APP_ID : c.WF_DETAIL_ID,
			APP_PID : '-WF',
			APP_TITLE : '审批详情',
			APP_TYPE : "detail",
			APP_FRAME_MODIFY_ID : c.WF_ID
		});
		c.APPS.push({
			APP_ID : c.WF_CHART_ID,
			APP_PID : '-WF',
			APP_TITLE : '审批详情',
			APP_TYPE : "web",
			_APP_URL : "/EWA_STYLE/cgi-bin/?xmlname=global_travel|common.xml&itemname=wf.frame.chart"
		});
		c.APPS_MAP = $J2MAP(datas, 'APP_ID', '');
		c.showApps();
		c.hideWait();
	};
	/**
	 * 显示主页列表
	 * 
	 * @memberOf {TypeName}
	 */
	this.showApps = function() {
		var pid = null;
		var ss = [];
		var ss1 = [ '<a href="#app" id="ft" style="display:none" onclick="mc.showFooter()" data-transition="slideup" class="icon1 icon-home ui-btn ui-shadow ui-corner-all"></a>' ];// footers
		for ( var i in this.APPS) {
			var app = this.APPS[i];
			if (app.APP_TYPE == 'catalog') {
				continue; // 目录为管理用，不作为APP配置
			}
			if (pid == null) {
				pid = app.APP_PID;
			}
			if (app.APP_PID == pid || app.APP_PID == -234) {
				// console.log(app);
				var ico = app.APP_ADD_PARA2 == null || app.APP_ADD_PARA2 == "" ? "icon-blank" : app.APP_ADD_PARA2;
				var s2 = "<li onclick='mc.loadApp(" + app.APP_ID + ",this)'><a id='main" + app.APP_ID
					+ "' style='font-weight:normal' href='#app" + app.APP_ID + "' data-transition='slide' class='icon   " + ico
					+ "'>" + (this.isEn ? app.APP_TITLE_ENUS : app.APP_TITLE) + "</a></li>";
				ss.push(s2);
			}
			if (this.APPS_MAP[app.APP_PID]) { // children app
				if (!this.APPS_MAP[app.APP_PID]._CHDS) {
					this.APPS_MAP[app.APP_PID]._CHDS = [];
				}
				this.APPS_MAP[app.APP_PID]._CHDS.push(app);
			}
			// this.addApp(app);

			// 页脚
			if (app.APP_SKIP == 'y') {// show in footer
				var s1 = '<a data-transition="slideup" id="ft' + app.APP_ID + '" onclick="mc.loadApp(' + app.APP_ID
					+ ')" href="#app' + app.APP_ID + '"  class="icon1 ' + app.APP_ADD_PARA2
					+ ' ui-link ui-btn ui-shadow ui-corner-all"></a>';
				ss1.push(s1);
			}
		}
		ss.push('<iframe style="display:none" name="_ewa_up_"></iframe>');
		// console.log(s)
		$('#title').html(this.isEn ? 'Home' : '主页');
		$('#app ul').html(ss.join(''));

		var f1 = "<span style='position:relative'>" + ss1.join('</span><span style=\'position:relative\'>') + "</span>";
		// console.log(f1)
		$('#footer').html(f1).trigger('create');
		if (this.GOAPPID != null) {
			this.loadApp(this.GOAPPID);
			var c = this;
			setTimeout(function() {
				window.location = "#app" + c.GOAPPID;
			}, 999);
		}
		try {
			$('#lst').listview('refresh');
		} catch (e) {
		}
	};

	/**
	 * 加载配置框架
	 * 
	 * @param {Object}
	 *            app
	 * @memberOf {TypeName}
	 */
	this.addApp = function(app) {
		var id = app.APP_ID;
		if (id == this.WF_ID) {//工作流审批因为出现返回id的歧义，因此强行删除再创建
			console.log('remove wf page app '+id)
			$('#app' + id).remove();
		}
		if (!$X("app" + id)) {
			var title = this.isEn ? app.APP_TITLE_ENUS : app.APP_TITLE;
			var s = this.APP_TMP.replace(/\[ID\]/ig, id).replace('[TITLE]', title).replace(/\[THEME\]/ig, this.THEME);
			$('body').append(s);
			return true;
		}
		return false;
	};

	// ---------dataBASE ------------------
	this.openDb = function() {
		try {
			if (window.openDatabase) {
				var g_db = window.openDatabase("ewa_moble", "1.0", "ewa_moble", 200000);
				g_db.transaction(this.populateDB, this.errorCB, function() {
				});
				this.DB = g_db;
			}
		} catch (e) {
			console.log(e)
		}
	};

	this.saveLogin = function() {
		// try{
		// if (window.openDatabase) {
		// this.DB.transaction(this.saveLogin1, this.errorCB, function() {
		// });
		// }
		// }catch(e){
		// console.log(e);
		// }
		var lid = mc.TXTLID.val();
		var pwd = mc.TXTPWD.val();
		var json = {
			APPID : this.loginAppId,
			"LID" : lid,
			"PWD" : pwd
		};
		var jsonStr = JSON.stringify(json);
		window.localStorage["LG#" + this.loginAppId] = jsonStr;

	};
	this.saveLogin1 = function(tx) {
		var lid = mc.TXTLID.val();
		var pwd = mc.TXTPWD.val();

		var exp = eval("/\'/ig");
		lid = lid.replace(exp, "''");
		pwd = pwd.replace(exp, "''");

		var sql = "REPLACE into user1(appid, lid,pwd) values('" + mc.loginAppId + "','" + lid + "','" + pwd + "')";

		console.log(sql);
		tx.executeSql(sql);
	};
	this.deleteLogin = function() {
		// try{
		// if (window.openDatabase) {
		// this.DB.transaction(this.deleteLogin1, this.errorCB, function() {
		// });
		// }
		// }catch(e){
		// console.log(e);
		// }
		window.localStorage.removeItem("LG#" + this.loginAppId);
	};
	this.deleteLogin1 = function(tx) {
		if (window.openDatabase) {
			var sql = "delete from user1 where appid='" + mc.loginAppId + "'";
			// console.log(sql);
			tx.executeSql(sql);
		}
	};
	this.queryLogin = function(appId) {
		console.log(appId);

		mc.TXTLID.val("");
		mc.TXTPWD.val("");

		this.loginAppId = appId;

		// try{
		// this.loginAppId=appId;
		// if (window.openDatabase) {
		// this.DB.transaction(this.queryLogin1, this.errorCB);
		// }
		// }catch(e){
		// console.log(e);
		// }

		var jsonStr = window.localStorage["LG#" + this.loginAppId];
		if (!jsonStr) {
			return;
		}
		var v;
		try {
			eval("v=" + jsonStr);

			mc.TXTLID.val(v.LID);
			mc.TXTPWD.val(v.PWD);
		} catch (e) {
			mc.TXTLID.val("");
			mc.TXTPWD.val("");
		}
	};
	this.queryLogin1 = function(tx) {
		if (window.openDatabase) {
			var c = this;
			var sql = "SELECT * FROM USER1 WHERE appid='" + mc.loginAppId + "'";
			console.log(sql)
			tx.executeSql(sql, [], function(tx, results) {
				if (results.rows.length > 0) {
					mc.TXTLID.val(results.rows.item(0).lid);
					mc.TXTPWD.val(results.rows.item(0).pwd);
				}
			}, this.errorCB);
		}
	};

	this.populateDB = function(tx) {
		tx.executeSql('CREATE TABLE IF NOT EXISTS USER1 (appid UNIQUE, lid , pwd)');
	};

	this.errorCB = function(err) {
		alert("Error processing SQL: " + err.code);
	};
	this._Init = function() {
		var c = this;
		// fix css
		var ss = [ ".ui-icon-loading { background: url(/EmpScriptV2/EWA_STYLE/jquery.mobile-1.4.2/images/ajax-loader.gif);}" ];
		var style = document.createElement('style');
		style.textContent = ss.join('\n');
		document.getElementsByTagName('head')[0].appendChild(style);

		$(document).bind("pageshow", function(event, prevPage) {
			c.CUR_PAGE_ID = event.target.id;

			var id = c.CUR_PAGE_ID.replace('app', '');
			var app = c.APPS_MAP[id];

			try {
				if (c.RELOAD_DATA) {
					c.RELOAD_DATA = false;
					if (app && app.APP_TYPE == 'list') {
						c.reloadData(id);
					}
				}
				if (app && app.APP_TYPE == 'web') {
					var p = $('#' + c.CUR_PAGE_ID);
					var h0 = p.find('[data-role=header]').height();
					var h1 = p.find('[data-role=footer]').height();
					var h = document.documentElement.clientHeight - h0 - h1;
					p.find('iframe').css('height', h);
				}
			} catch (e) {
				console.log(event, prevPage);
			}
			// console.log(c.CUR_PAGE_ID);
			if (mc.CUR_PAGE_ID == null || mc.CUR_PAGE_ID == 'app') {
				mc.loadMsg();
			}
		});
		this.SESSION_LAST_TIME = (new Date()).getTime();
		addEvent(window, 'scroll', function() {
			c.scrollCheck();
		});
	};
	/**
	 * 检查滚动条状态，仅对 list有效
	 */
	this.scrollCheck = function() {
		if (!this.CUR_PAGE_ID) {
			return;
		}
		var appid = this.CUR_PAGE_ID.replace('app', '');
		if (!this.APPS_MAP[appid]) {
			return;
		}

		var tp = this.APPS_MAP[appid].APP_TYPE;
		var APP_SCROLL_LOAD_MORE = this.APPS_MAP[appid].APP_SCROLL_LOAD_MORE;
		if (tp != 'list' || this._is_scroll_load_more || !APP_SCROLL_LOAD_MORE) {
			return;
		}
		if (document.body.scrollHeight <= document.body.clientHeight * 1.1) {
			return;
		}

		if (this.APPS_MAP[appid]._DATAS.last_count == 0) {
			return;
		}

		var h1 = document.body.scrollHeight - document.body.scrollTop;
		if (h1 > document.body.clientHeight * 1.4) {
			return;
		}
		// 设定加载中
		this._is_scroll_load_more = true;

		// 附加数据为真
		this.APPS_MAP[appid]._IS_APPEND = true;

		// 调用加载更多数据
		this.loadMore(appid);
		console.log(h1);
	};
	this.checkSessionOut = function() {
		var t1 = (new Date()).getTime();
		var t2 = t1 - (this.SESSION_LAST_TIME == null ? t1 : this.SESSION_LAST_TIME);
		if (t2 > this.SESSION_OUT_MAX) {
			return true;
		}
		this.SESSION_LAST_TIME = t1;
		return false;

	};

	// ------------- msg -----------------------
	this.loadMsg = function() {
		var u = mc.ROOT + '/back_admin/common/msg.jsp';
		$J1(u, mc.loadMsg1);
	};

	this.loadMsg1 = function(datas) {
		mc.checkSessionOut();
		if (datas.length == 0) {// 没有消息
			return;
		}
		for (var i = 0; i < datas.length; i++) {
			var d = datas[i];
			mc.showHomeMsg(d);

		}
	};

	this.showHomeMsg = function(d) {
		var id = d.APP;
		if (id == null) {
			return;
		}
		if (id == 'sAgentsPay1') {
			var v = d.B;
			if (v != '') {
				var v1 = v * 1;
				if (v1 > 1000) {
					d.B = parseInt(v1 / 1000) + 'k+';
				} else {
					d.B = parseInt(v1);
				}
			}
		}
		var obj = $X("main" + id);
		if (!obj) {
			return;
		}
		this.createAlert(id, obj, d.B, 40);

		var obj = $X("ft" + id);
		if (!obj) {
			return;
		}
		this.createAlert(id + 'fftt', obj, d.B, 4);

	};
	this.createAlert = function(id, obj, v, padLeft) {
		if (id.indexOf('fftt') > 0) {
			return;
		}
		var alert = $X('ALERT_' + id);
		if (alert == null) {
			alert = document.createElement('div');
			alert.id = 'ALERT_' + id;
			$('#app ul').append(alert);
			// $(obj).append(alert);
			alert.className = 'alert k' + (id.indexOf('fftt') > 0 ? 1 : 0);
		}
		var p = $(obj).offset();
		if (id.indexOf('fftt') > 0) {
			$(alert).css({
				left : p.left + padLeft,
				top : p.top + 5,
				position : 'fixed',
				'z-index' : '11221'
			});

		} else {
			$(alert).css({
				left : p.left + padLeft,
				top : p.top - 35,
				position : 'absolute',
				'z-index' : '11221'
			});
		}
		if (v != null && v.length > 2) {
			$(alert).css('width', (v.length * 8));
		}
		if (v != null && v != 0) {
			alert.style.display = '';
			alert.innerHTML = v;
		} else {
			alert.innerHTML = "&nbsp;";
			alert.style.display = 'none';
		}
		return alert;
	};
	this._Init();
};
var EWA_GpsClass = function(funcShow, funcErr) {
	this.IS_SUPPORT = navigator.geolocation != null;
	this._ShowFunc = funcShow;
	this._ErrFunc = funcErr;
	this._Init = function() {
		if (this.IS_SUPPORT) {
			var c = this;
			navigator.geolocation.getCurrentPosition(c.showPosition, c.showError);
		}
	};
	this.showPosition = function(position) {
		// console.log(position.coords.latitude + "," +
		// position.coords.longitude);
		if (gps.LAST_POSITION && position.coords.latitude == gps.LAST_POSITION.coords.latitude
			&& position.coords.longitude == gps.LAST_POSITION.coords.longitude) {
			// 位置没有改变
			gps.LAST_POSITION = position;
			return;
		}
		gps.LAST_POSITION = position;
		if (gps._ShowFunc) {

			var stop = gps._ShowFunc(position);
			if (stop) {
				return;
			}
		}

		if (gps.MAP == null) {
			return;
		}
		if (this.marker) {
			console.log(position)
			if (this.PROVIDER == 'google') {
				this.marker.setPosition(position);
			}
			if (this.PROVIDER == 'baidu') {

			}
		} else {
			gps.addMarker();
		}
	};
	this.addMarker = function() {
		if (this.LAST_POSITION == null) {
			return;
		}
		if ($(this.MAP_SHOW.parentNode).css('display') == 'none') {
			// 不显示了
			// console.log($(this.MAP_SHOW.parentNode).css('display'))
			return;
		}
		if (this.PROVIDER == 'google') {
			if (this.marker) {
				this.marker.setMap(null);
			}

			this.marker = new google.maps.Marker({
				position : new google.maps.LatLng(this.LAST_POSITION.coords.latitude, this.LAST_POSITION.coords.longitude),
				map : this.MAP,
				title : 'me'
			});

			var c = this;
			var icon = "http://maps.googleapis.com/mapfiles/marker_green.png";
			this.marker.setIcon(icon);
			google.maps.event.addListener(this.marker, 'click', function(e) {
				var infoWindow = new google.maps.InfoWindow({
					content : 'Me'
				});
				infoWindow.open(c.MAP, c.marker);
			});
			this.MAP.setCenter(this.marker.getPosition());
		} else if (this.PROVIDER == 'baidu') {
			var point = new BMap.Point(this.LAST_POSITION.coords.longitude, this.LAST_POSITION.coords.latitude);
			var marker = new BMap.Marker(point);
			this.MAP.addOverlay(marker);
			this.marker = marker;
		}
	};
	// 自动缩放到所有节点
	this.fitBounds = function() {
		var bounds = new google.maps.LatLngBounds();
		var cnt = 0;
		for ( var n in this.MARKERS_USER) {
			var marker = this.MARKERS_USER[n];
			if (marker) {
				cnt++;
				var p = marker.getPosition();
				bounds.extend(p);
			}
		}
		if (cnt == 0) {
			return;
		}
		this.MAP.fitBounds(bounds);
	};
	this.addMarkerUser = function(d) {
		if (this.MAP == null) {
			return;
		}
		if ($(this.MAP_SHOW.parentNode).css('display') == 'none') {
			// 不显示了
			// console.log($(this.MAP_SHOW.parentNode).css('display'))
			return;
		}
		if (!this.MARKERS_USER) {
			this.MARKERS_USER = {};
		}
		// data中应包含LBS_ID(主键),INFO_TITLE和INFO_DETAIL,LBS_LAT,LBS_LON
		// var uid = d.USR_ID;
		var lbsId = d.LBS_ID;
		var marker_old = this.MARKERS_USER[lbsId];
		var lbsTitle = "";
		var lbsDetail = "";
		if (typeof (d.INFO_DETAIL) != "undefined" && typeof (d.INFO_TITLE) != "undefined") {
			lbsDetail = d.INFO_DETAIL;
			lbsTitle = d.INFO_TITLE;
		} else {// 兼容原来的员工版本
			if (typeof (d.ADM_NAME) != "undefined" && typeof (d.ADM_MOBILE) != "undefined") {
				lbsDetail = '<a href="tel:\\"' + d.ADM_MOBILE + '>' + d.ADM_MOBILE + '</a>';
				lbsTitle = d.ADM_NAME;
			}
		}
		var img = mc.ROOT + "/app/txt_img.jsp?txt=" + lbsTitle.toURL();
		var imgBg = "";
		var showLastTime = "N";
		var mins = 1000;
		if ((d.LBS_CDATE) && (d.LBS_MINUTES)) {
			showLastTime = "Y";
			var cdate = d.LBS_CDATE;
			if (cdate.toLowerCase() == 'null') {
				imgBg = "DEFAULT";
			} else {
				mins = parseInt(d.LBS_MINUTES);
				if (mins < 30) {
					imgBg = "DEFAULT";
				} else {
					imgBg = "PINK";// 30分钟以上的都显示为PINK背景色
				}
			}
		} else {
			imgBg = "DEFAULT"; // MAGENTA
		}
		img += "&bg=" + imgBg;
		// console.log(typeof(d.LBS_CDATE));
		if (this.PROVIDER == 'google') {
			if (marker_old) {
				marker_old.setMap(null);
			}
			var opt = {
				position : new google.maps.LatLng(d.LBS_LAT * 1, d.LBS_LON * 1),
				map : this.MAP,
				icon : img,
				title : d.INFO_TITLE
			};
			marker_old = new google.maps.Marker(opt);
			// console.log(opt);
			this.MARKERS_USER[lbsId] = marker_old;
			var tcnt = '<div style="font-size:14px;color:#333">' + lbsDetail + '</a>';
			if (showLastTime == 'Y') {
				tcnt += "<br><span style='font-size:12px;color:#999'>";
				if (mins < 30) {
					if (mins < 1) {
						tcnt += "更新：刚刚";
					} else {
						tcnt += "更新：" + mins + "分钟前";
					}
				} else {
					tcnt += "更新：" + d.LBS_CDATE.substring(0, 16);
				}
				tcnt += "</span>";
			}
			tcnt += '</div>';
			var infoWindow = new google.maps.InfoWindow({
				content : tcnt
			});
			// console.log(d);
			var c = this;
			google.maps.event.addListener(marker_old, 'click', function(e) {
				infoWindow.open(c.MAP, marker_old);
			});
		} else if (this.PROVIDER == 'baidu') {
			var pt = new BMap.Point(d.LBS_LON * 1, d.LBS_LAT * 1);
			var myIcon = new BMap.Icon(img, new BMap.Size(60, 20));
			var marker2 = new BMap.Marker(pt, {
				icon : myIcon
			}); // 创建标注
			this.MAP.addOverlay(marker2); // 将标注添加到地图中
			this.MARKERS_USER[lbsId] = marker2;
		}
	};
	this.startWatch = function() {
		if (!this.IS_SUPPORT || this.watchID) {
			return;
		}
		var opt = {
			frequency : 3000
		};
		var c = this;
		this.watchID = navigator.geolocation.watchPosition(c.showPosition, c.showError, opt);
	};
	this.endWatch = function() {
		if (!this.IS_SUPPORT) {
			return;
		}
		navigator.geolocation.clearWatch(this.watchID);
		this.watchID = null;
	};
	this.showError = function(error) {
		if (this.funcErr) {
			this.funcErr(error);
		} else {
			switch (error.code) {
			case error.PERMISSION_DENIED:
				console.log("User denied the request for Geolocation.");
				break;
			case error.POSITION_UNAVAILABLE:
				console.log("Location information is unavailable.");
				break;
			case error.TIMEOUT:
				console.log("The request to get user location timed out.");
				break;
			case error.UNKNOWN_ERROR:
				console.log("An unknown error occurred.");
				break;
			}
		}
		console.log(error);
	};
	this.loadMap = function(provider, mapShow) {
		if (!this.IS_SUPPORT) {
			return;
		}
		if (provider == null || provider == "") {
			provider = "google";
		}
		this.PROVIDER = provider;
		this.MAP_SHOW = mapShow;
		if (provider == 'google') {
			var _ewa_google_key = "AIzaSyCObGlANQukwOXzCS3W2W7QMLFq-iiT-SY";
			var s = document.createElement('script');
			s.src = "http://maps.googleapis.com/maps/api/js?key=" + _ewa_google_key + "&sensor=true&callback=gpsInitialize";
			document.getElementsByTagName("head")[0].appendChild(s);
		} else if (provider == 'baidu') {
			// http://api.map.baidu.com/api?v=2.0&ak=7goiTc5NqfxdoaW4BCAGqAC7
			var _ewa_baidu_key = "7goiTc5NqfxdoaW4BCAGqAC7";
			var s = document.createElement('script');
			s.src = "http://api.map.baidu.com/api?v=2.0&ak=" + _ewa_baidu_key + "&callback=gpsInitialize";
			document.getElementsByTagName("head")[0].appendChild(s);
		}
	};
	this.initMap = function() {
		if (!this.IS_SUPPORT) {
			this.MAP_SHOW.innerHTML = "系统不支持GPS";
			return;
		}
		// if (this.LAST_POSITION == null) {
		// this.MAP_SHOW.innerHTML = "等待GPS信息...";
		// var c = this;
		// setTimeout(function() {
		// c.initMap();
		// }, 200);
		// return;
		// }
		if (this.PROVIDER == 'google') {
			var latlng;
			if (this.LAST_POSITION) {
				latlng = new google.maps.LatLng(this.LAST_POSITION.coords.latitude, this.LAST_POSITION.coords.longitude);
			} else {
				latlng = new google.maps.LatLng(39.915, 116.404);
			}
			var mapOptions = {
				zoom : 14,
				center : latlng,
				mapTypeId : google.maps.MapTypeId.ROADMAP,
				disableDoubleClickZoom : false, // 禁止双击缩放
				scaleControl : true
			// 缩放控件
			};
			this.MAP = new google.maps.Map(this.MAP_SHOW, mapOptions);
			this.addMarker();
		} else if (this.PROVIDER == 'baidu') {
			var latlng;
			if (this.LAST_POSITION) {
				latlng = new BMap.Point(this.LAST_POSITION.coords.longitude, this.LAST_POSITION.coords.latitude);
			} else {
				latlng = new BMap.Point(116.404, 39.915);
			}
			console.log(latlng);
			this.MAP = new BMap.Map(this.MAP_SHOW);
			this.MAP.addControl(new BMap.NavigationControl()); // 添加默认缩放平移控件
			this.MAP.addControl(new BMap.NavigationControl({
				anchor : BMAP_ANCHOR_TOP_RIGHT,
				type : BMAP_NAVIGATION_CONTROL_SMALL
			})); // 右上角，仅包含平移和缩放按钮
			this.MAP.addControl(new BMap.NavigationControl({
				anchor : BMAP_ANCHOR_BOTTOM_LEFT,
				type : BMAP_NAVIGATION_CONTROL_PAN
			})); // 左下角，仅包含平移按钮
			this.MAP.addControl(new BMap.NavigationControl({
				anchor : BMAP_ANCHOR_BOTTOM_RIGHT,
				type : BMAP_NAVIGATION_CONTROL_ZOOM
			})); // 右下角，仅包含缩放按钮

			this.MAP.enableScrollWheelZoom(); // 启用滚轮放大缩小，默认禁用
			this.MAP.enableContinuousZoom(); // 启用地图惯性拖拽，默认禁用
			this.MAP.centerAndZoom(latlng, 15);

			this.addMarker();
		}
	};

	this._Init();
};
if (!window.gpsInitialize) {
	gpsInitialize = function() {
		alert('请覆盖这个方法:gpsInitialize');
	};
}
// get
function $JG(u, funcOk) {
	if (mc.checkSessionOut()) {
		window.location = '#login';
		return;
	}
	mc.showWait();
	if (u.toUpperCase().indexOf('EWA_LANG') < 0) {
		u += '&EWA_LANG=' + (mc.isEn ? 'enus' : 'zhcn');
	}
	u = u.replace(/\|/ig,'%7c');
	if (u.indexOf("ewa_wf_type=ins_get") >= 0) { // sp
		$.ajax({
			url : u,
			type : "get", // 使用get方法访问后台
			timeout : 64 * 1000,
			success : function(data) {
				// 返回json带_EWA_WF={};
				var _EWA_WF = null;
				eval(data);
				mc.hideWait();
				funcOk(_EWA_WF);
			},
			error : EwaMobileAjaxError
		});
	} else {
		// console.log(u);
		$.ajax({
			url : u,
			type : "get", // 使用get方法访问后台
			dataType : "json", // 返回json格式的数据
			timeout : 64 * 1000,
			success : function(data) {
				mc.hideWait();
				funcOk(data);
			},
			error : EwaMobileAjaxError
		});
	}
}
// post-html
function $P(u, d, funcOk) {
	if (mc.checkSessionOut()) {
		window.location = '#login';
		return;
	}
	mc.showWait();
	if (u.toUpperCase().indexOf('EWA_LANG') < 0) {
		u += '&EWA_LANG=' + (mc.isEn ? 'enus' : 'zhcn');
	}
	u = u.replace(/\|/ig,'%7c');
	$.ajax({
		url : u,
		data : d,
		type : "post", // 使用post方法访问后台
		timeout : 64 * 1000,
		dataType : 'html',
		success : function(data) {
			mc.hideWait();
			funcOk(data);
		},
		error : EwaMobileAjaxError
	});
}
// post-json
function $P1(u, d, funcOk) {
	if (mc.checkSessionOut()) {
		window.location = '#login';
		return;
	}
	mc.showWait();
	if (u.toUpperCase().indexOf('EWA_LANG') < 0) {
		u += '&EWA_LANG=' + (mc.isEn ? 'enus' : 'zhcn');
	}
	u = u.replace(/\|/ig,'%7c');
	$.ajax({
		url : u,
		data : d,
		dataType : "json", // 返回json格式的数据
		type : "post", // 使用post方法访问后台
		timeout : 64 * 1000,
		success : function(data) {
			mc.hideWait();
			funcOk(data);
		},
		error : EwaMobileAjaxError
	});
}
function EwaMobileAjaxError(error) {
	mc.hideWait();
	if (error.status == 200) {
		var s = error.responseText;
		if (s.indexOf('EWA.UI.Msg.ShowError') >= 0) {
			eval(s);
		} else {
			alert('访问服务器错误：\n' + error.status + "：" + error.statusText);
		}
	} else {
		console.log(error);
		alert('访问服务器错误：\n' + error.status + "：" + error.statusText);
	}
}
var _EWA_G_SETTINGS = {
	WEEKS : "日,一,二,三,四,五,六",
	MONTHS : "一月,二月,三月,四月,五月,六月,七月,八月,九月,十月,十一月,十二月",
	DATE : "yyyy-MM-dd",
	TIME : "hh:MM:ss",
	CURRENCY : "￥",
	Today : "今天",
	Hour : "小时",
	Minute : "分钟",
	Second : "秒"
};

var __a = [];
__a.push('<div data-role="page" id="app[ID]" data-theme="[THEME]">');
__a.push('<div data-role="header" data-position="fixed" class="ui-noboxshadow">');
__a.push("<h1 class='ui-title'>[TITLE]<\/h1>");
__a.push("<a onclick='mc.back([ID])' data-transition='flip' href='#app' data-icon='carat-l' "
	+ " class='ui-btn ui-icon-carat-l ui-btn-icon-left ui-btn-icon-notext ui-corner-all'>返回</a>");
__a.push("<div data-role='controlgroup' data-type='horizontal' style='position:absolute;right:4px;top:0cm' >");
__a.push('<a href="javascript:mc.submit([ID])" style="display:none" data-icon1="action" '
	+ ' class="ui-btn ui-icon-action ui-corner-all ui-btn-[THEME]">提交</a>');
__a.push('<a href="#" style="display:none" data-icon1="plus" '
	+ '  class="ui-shadow  ui-btn  ui-corner-all ui-btn-icon-left ui-icon-plus  ui-btn-[THEME]">新建</a>');
__a.push("<a href=\"javascript:mc.loadMore([ID]);\" data-icon1=\"recycle\"  "
	+ " class=\"ui-shadow ui-btn  ui-corner-all ui-btn-icon-left ui-icon-grid   ui-btn-[THEME]\" style=\"display:none;\">多</a>");
__a
	.push("<a href=\"javascript:mc.reloadData([ID]);\" data-icon1=\"refresh\"  "
		+ " class=\"ui-shadow ui-btn ui-corner-all ui-btn-[THEME] ui-btn-icon-left ui-icon-refresh\" style=\"display:none;\">刷</a></div>");
__a.push('</div><div data-role="content"><ul data-role="listview"></ul></div>');
__a.push('<div data-role="footer" data-position="fixed" style="text-align: center"></div></div>');