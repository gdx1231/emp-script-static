/**
 * 新的弹窗框
 */
function EWA_UI_DiaNewClass() {
	this.Id = null;
	this.IS_AUTO_SIZE = true; //自动缩放
	this._GetIndex = function() {
		var w = window;
		if (w._EWA_UI_DIALOG_COVERINDEX == null) {
			w._EWA_UI_DIALOG_COVERINDEX = 10000000;
		}
		w._EWA_UI_DIALOG_COVERINDEX++;
		return w._EWA_UI_DIALOG_COVERINDEX;
	};
	this._GetCover = function() {
		return $X(this.Id + "_cover");
	};
	this.Create = function(width, height, title, content, isUrl, noHeader, callback) {
		this._isUrl = isUrl;
		this._width = width;
		this._height = height;
		this._title = title;
		this._content = content;
		this._noHeader = noHeader;
		var index = this._GetIndex();
		this.index = index;

		this.Id = ('_EWA_UI_DIA_' + Math.random()).replace('.', '');
		var ss = ["<div id='" + this.Id + "' class='ewa-ui-dialog'>"];
		// cover
		ss.push("<div id='" + this.Id + "_cover'  class='ewa-ui-dialog-cover' style='position: fixed;z-index: " + index
			+ ";'></div>");
		// box-start
		var mv = " EWA_WND_ID='" + this.Id + "'";
		var win = "window";
		var aa = win + ".EWA$UI$COMMON$Move.";
		mv += " onmousedown=\"" + aa + "OnMouseDown(this.parentNode.parentNode,event,true,true);\"";
		mv += " onmousemove=\"" + aa + "OnMouseMove(this.parentNode.parentNode,event,true,true);\"";
		mv += " onmouseup=\"" + aa + "OnMouseUp(this.parentNode.parentNode);\"";
		mv += " onmouseout=\"" + aa + "OnMouseOut(this.parentNode.parentNode);\"";
		// mv += " style='cursor:pointer' ";
		ss.push("<div id='" + this.Id + "_box' " + " class='ewa-ui-dialog-box' " + " style='position: fixed;z-index: "
			+ this._GetIndex() + ";'>");
		ss.push("<div style='position:relative;'>");
		// title
		if (!noHeader) {
			ss.push("<div  id='" + this.Id + "_title'  class='ewa-ui-dialog-title'" + mv + " style=''>"
				+ "<span style='margin-left: 5px;'></span><a href='javascript:class_" + this.Id
				+ ".Close();' class='fa'" + " style=''>&#xf00d</a></div>");
		} else {
			ss.push("<div id='" + this.Id + "_title' class='ewa-ui-dialog-title-noheader'" + " style=''>"
				+ "<a href='javascript:class_" + this.Id + ".Close();' class='fa'"
				+ " style='text-decoration:none;padding:2px 2px 3px 3px;display:block'>&#xf00d</a></div>");
		}
		// content
		ss.push("<div  id='" + this.Id + "_content' class='ewa-ui-dialog-content'"
			+ " style='width: 100%;overflow: auto;'></div>");
		ss.push("</div>");
		// box-end-div
		ss.push("</div>");
		// end div
		ss.push("</div>");
		$('body').append(ss.join(''));

		// 关闭按钮颜色
		$(".ewa-ui-dialog-title a.fa").css({
			"color": "#aaa"
		}).hover(function() {
			$(this).css({
				"color": "orangered"
			});
		}, function() {
			$(this).css({
				"color": "#aaa"
			});
		});
		var obj = $('#' + this.Id + "_box");

		this.SetSize(width, height);

		this.SetTitle(title);
		this.ShowCover(true);
		this.MoveCenter();
		window['class_' + this.Id] = this;

		this.SetContent(content, isUrl, callback);

		return this;
	};
	this.SetSize = function(width, height) {
		var obj = $('#' + this.Id + "_content");
		if(!width){
			let dw = document.documentElement.clientWidth;
			if(dw> 410){
				width = 400;
			} else if(dw > 300){
				width = dw - 10;
			} else {
				width = 300;
			}
		}
		var box_w1 = width ? width : width;
		var box_h1 = height ? height : 200;

		obj.css('width', box_w1);
		obj.css('height', box_h1);

		// var title_height = 0;
		if ($('#' + this.Id + '_title span').length > 0){
			title_height = $('#' + this.Id + '_title').height();
		}
		// $('#' + this.Id + '_box').css('width', box_w1);
		// $('#' + this.Id + '_box').css('height', box_h1 + title_height);
	};
	this.SetTitle = function(title) {
		if (title)
			$('#' + this.Id + '_title span').html(title);
	};
	/**
	 * 获取标题所在div;
	 */
	this.getTitleContainer = function() {
		var obj = $('#' + this.Id + '_title');
		if (obj.length == 0) {
			return null;
		} else {
			return obj[0];
		}
	};
	this.SetContent = function(content, isUrl, callback) {
		var obj_content = $('#' + this.Id + '_content');
		if (isUrl) {
			content = '<iframe style="width:100%;height:100%" frameborder="0" src="' + content + '"></iframe>';
			obj_content.css('overflow', 'hidden');
		} else {
			// 直接显示html
			$(this._GetCover()).css('background-image', 'none');
		}
		obj_content.html(content);

		if (isUrl) {
			var c = this;
			setTimeout(function() {
				c._ChkIframeLoaded(callback);
			}, 222);
		} else {// 直接显示html的方式，调用回调
			if (callback) {
				callback(this);
			}
		}
	};
	/**
	 * 添加对象
	 * 
	 * @param objElement
	 *            html对象
	 * @param isAppend
	 *            是否为追加模式
	 * 
	 */
	this.SetObject = function(objElement, isAppend) {
		var obj_content = $('#' + this.Id + '_content');
		$(this._GetCover()).css('background-image', 'none');
		if (!isAppend) {
			obj_content.html("");
		}
		obj_content.append(objElement);
	};
	this._ChkIframeLoaded = function(callback) {
		var w = $('#' + this.Id + '_content iframe');
		if (w.length == 0) {
			return;
		}
		w = w[0];
		try {// not same domain
			if (w.contentWindow && w.contentWindow.document && w.contentWindow.document.readyState == 'complete'
				&& w.contentWindow.$) {
				try {
					this._IframeLoaded(w.contentWindow, callback);
				} catch (e1) {
					this._IframeLoaded(w.contentWindow, callback);
				}
				return;
			}
			var c = this;
			setTimeout(function() {
				c._ChkIframeLoaded(callback)
			}, 222);
		} catch (e) {
			console.log(e);
		}
	};
	this._IframeLoaded = function(w, callback) {
		w._EWA_DialogWnd = this;
		var title = w.document.title;
		this.SetTitle(title);

		var u1 = new EWA_UrlClass(w.location.href);
		if (this.IS_AUTO_SIZE) {
			this.AutoSize();
		}
		this.MoveCenter();
		var c = this;
		var objs = w.$.find('button,input');
		for (var i = 0; i < objs.length; i++) {
			var obj = objs[i];
			var isclosebutton = false;
			if (obj.id && obj.id.toLowerCase().indexOf('close') >= 0) {
				isclosebutton = true;
			} else {
				var txt = obj.value || obj.innerHTML;
				if (txt && (txt.indexOf('关闭') >= 0 || txt.indexOf('取消') >= 0)) {
					isclosebutton = true;
				}
			}
			if (isclosebutton) {
				obj.onclick = function() {
					c.Close();
				};
			}
		}
		$(this._GetCover()).css('background-image', 'none');

		if (callback) {
			callback(this);
		}
	};
	this.AutoSize = function() {
		var content = $(this.getContent());
		if (!this._isUrl) {
			var w, h;
			var objEWA = content.find('#Test1');
			if (objEWA.length > 0) {
				w = objEWA.outerWidth();
				h = objEWA.outerHeight();
			} else {
				h = content[0].scrollHeight;
				w = content[0].scrollWidth;
			}
			this.SetSize(w, h);
			this.MoveCenter();
		} else {
			var w = content.find('iframe');
			w = w[0].contentWindow;
			if (w.$) {
				var target = w.$('#Test1');
				if (target.length > 0) {
					var width = target.outerWidth();
					var height = target.outerHeight();
					this.SetSize(width, height);
					this.MoveCenter();
				}
			}
		}
	};
	/**
	 * 获取content的div
	 */
	this.getContent = function() {
		var cnt = $('#' + this.Id + '_content');
		return cnt[0];
	};
	/**
	 * 获取对话框的对象（最外层）
	 */
	this.getMain = function() {
		var cnt = $('#' + this.Id + '_box');
		return cnt[0];
	};
	this.ShowCover = function(isShow) {
		var obj_cover = $('#' + this.Id + '_cover');
		if (isShow) {
			var window_width = $(window).width();
			var window_height = $(window).height();

			obj_cover.css('width', window_width);
			obj_cover.css('height', window_height);
			obj_cover.show();
		} else {
			obj_cover.hide();
		}
	};
	this.MoveCenter = function() {
		var window_width = $(window).width();
		var window_height = $(window).height();

		var obj = $('#' + this.Id + "_box");
		var box_w1 = obj.width();
		var box_h1 = obj.height();

		var mid_left = (window_width - box_w1) / 2;
		var mid_top = (window_height - box_h1) / 2;

		if (mid_left < 0) {
			mid_left = 0;
		}
		if (mid_top < 0) {
			mid_top = 0;
		}
		this.Move(mid_left, mid_top);
	};
	this.Move = function(x, y) {
		var obj = $('#' + this.Id + "_box");
		obj.css('top', y);
		obj.css('left', x);
	};
	this.Close = function() {
		if (this.IsCloseAsHidden) { // 是否为关闭为隐藏
			$('#' + this.Id).hide();
		} else {
			this.Dispose();
		}

	};
	this.Dispose = function() { // 销毁对象
		$('#' + this.Id).remove();
		window['class_' + this.Id] = null;
		delete window['class_' + this.Id];
	};
	this.Show = function() {
		if (this.IsCloseAsHidden) { // 是否为关闭为隐藏
			$('#' + this.Id).show();
		} else {
			alert('请设置参数 IsCloseAsHidden=true');
		}
	};
}

$Dialog = function(url, title, width, height, noHeader, callback) {
	var is_auto_size = !(width && height);
	var dia = new EWA_UI_DiaNewClass();
	dia.IS_AUTO_SIZE = is_auto_size; // 自动缩放窗口
	dia.Create(width, height, title, url, true, noHeader, callback);
	dia.MoveCenter();
	return dia;
}

$DialogHtml = function(html, title, width, height, noHeader, callback) {
	var dia = new EWA_UI_DiaNewClass();
	dia.Create(width, height, title, html, false, noHeader);
	dia.MoveCenter();
	if (callback) {
		callback(dia, id);
	}
	return dia;
}
/**
 * 安装方式打开Dialog
 * 
 * @param url
 *            加载的网址
 * @param tilte
 *            标题
 * @param width
 *            宽度
 * @param height
 *            高度
 * @param noheader
 *            不显示表头
 * @return dialog
 */
$DialogInstall = function(url, title, width, height, noHeader, callback) {
	var id = EWA_Utils.tempId('dialogInstall');
	var s1 = "<div id='" + id + "'></div>";
	var dia = $DialogHtml(s1, '', width, height, noHeader);
	$Install(url, id, function() {
		var is_auto_size = !(width && height);
		if (noHeader || title) {
			if (is_auto_size) {
				dia.AutoSize();
			}
			if (callback) {
				callback(dia, id);
			}
			return;
		}
		// 设置标题
		var divContent = dia.getContent();
		var ewaTables = $(divContent).find(".EWA_TABLE");
		if (ewaTables.length == 0 || !ewaTables[0].id) {
			if (is_auto_size) {
				dia.AutoSize();
			}
			if (callback) {
				callback(dia, id);
			}
			return;
		}

		// 获取EWA的标题
		var id = ewaTables[0].id;
		var id0 = id.replace('EWA_FRAME_', '').replace('EWA_LF_', '');
		if (!EWA || !EWA.F || !EWA.F.FOS || !EWA.F.FOS[id0]) {
			if (is_auto_size) {
				dia.AutoSize();
			}
			if (callback) {
				callback(dia, id);
			}
			return;
		}
		var title_ewa = EWA.F.FOS[id0].Title;

		if (id.startsWith('EWA_LF_')) {
			var inc = 0;
			// 等待脚本创建完毕 .ewa_lf_func
			var t1 = setInterval(function() {
				inc++;
				if (inc > 90) {// 900毫秒没有执行
					// 没有发现 ewa_lf_func
					window.clearInterval(t1);
					if (is_auto_size) {
						dia.AutoSize();
					}
					if (callback) {
						callback(dia, id);
					}
					return;
				}
				var reshow = $(divContent).find(".ewa_lf_func");
				if (reshow.length == 0) {
					return;
				}
				window.clearInterval(t1);
				var obj = dia.getTitleContainer();
				if (obj) {
					var css = {
						"background-color": "transparent",
						"display": "block",
						"float": "left",
						"font-size": "14px"
					};
					reshow.css(css);
					var cap = reshow.find('.ewa_lf_func_caption');
					cap.css('color', '#08c');
					cap.text(cap.text().replace('[', '').replace(']', '').trim());
					$(obj).find('span:eq(0)').remove();
					$(obj).append(reshow).css('border-bottom', '1px solid #eee');
				}
				if (is_auto_size) {
					dia.AutoSize();
				}
				if (callback) {
					callback(dia, id);
				}
			}, 10);
		} else {
			if (title_ewa) {
				dia.SetTitle(title_ewa);
			}
			if (is_auto_size) {
				dia.AutoSize();
			}
			if (callback) {
				callback(dia, id);
			}
		}
	});
	return dia;
};