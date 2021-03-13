/**
 * 弹出窗体类
 */
function EWA_UI_DialogClass() {
	this.zIndex = 999;
	this.Id = null;
	this.Width = "200px";
	this.Height = "200px";
	this.Left = "-1000px";
	this.Top = "-1000px";
	this.Offset = "5";
	this.ShadowColor = "#777777"; // 阴影
	this.IsShowTitle = false; // 显示Title
	this.IsCanMove = true; // 是否允许拖动
	this.IsCover = false; // 是否生成Cover层
	this.AutoSize = false;
	this.DisposeOnClose = true; // 关闭时立即注销窗体
	// -----------------------------
	this.Frame = null;
	this.FrameContent = null;
	this.FrameTitle = null;
	this.CreateWindow = null; // 创建用的Win
	this._CreateWindowIndex = null;
	this._WindowIndex = null;

	this.GetFrame = function() {
		return this.GetObject(this.Frame);
	};
	this.GetFrameContent = function() {
		return this.GetObject(this.FrameContent);
	};
	this.GetFrameTitle = function() {
		return this.GetObject(this.FrameTitle);
	};
	this.GetObject = function(id) {
		if (id == null) {
			return null;
		}
		return this.CreateWindow.$X(id);
	};

	// --------------------------------
	this.SetHtml = function(html) {
		this.GetFrameContent().innerHTML = html;
	};
	this.SetObject = function(obj) {
		this.GetFrameContent().appendChild(obj);
	};
	this.SetTitle = function(title) {
		if (this.GetFrameTitle() != null) {
			this.GetFrameTitle().innerHTML = title;
		}
	};
	this.ScrollMoveDiv = function() {
		var o = this.GetFrame()
		if (o == null)
			return;
		var doc = o.ownerDocument;
		var x = doc.body.scrollLeft;
		var y = doc.body.scrollTop;

		var x0 = o.getAttribute('_SCROLL_X') * 1;
		var y0 = o.getAttribute('_SCROLL_Y') * 1;

		o.style.left = (x - x0 + $X(this.Frame).offsetLeft) + "px";
		o.style.top = (y - y0 + $X(this.Frame).offsetTop) + "px";

		o.setAttribute('_SCROLL_X', x);
		o.setAttribute('_SCROLL_Y', y);
		o = null;
	};
	// 移动到对象下部
	this.MoveBottom = function(obj) {
		// var p = EWA$UI$COMMON.GetPosition(obj);
		var p = $(obj).offset();
		p.Y = p.top + $(obj).height();
		p.X = p.left;
		var doc = obj.ownerDocument;
		var w = doc.parentWindow ? doc.parentWindow : doc.defaultView;
		if (w == this.CreateWindow) {
			var x = document.body.clientWidth;
			var y = document.body.clientHeight;
			var mx = p.X;
			var my = p.Y;

			var fh = (this.Height + "").replace("px", "") * 1;
			var fw = (this.Width + "").replace("px", "") * 1;
			if (p.Y + obj.clientHeight + fh > y) {
				my = p.Y - obj.clientHeight - fh;
			}
			if (p.X + fw > x) {
				mx = x - fw - obj.clientWidth;
			}
			if (EWA.B.PAD) {
				mx = 0;
			}
			var fix_h = 4;
			this.Move(mx, my + fix_h);

		} else {// 窗口Win不一致
			var f = w._EWA_DialogWnd._Dialog.GetFrame();
			var x = f.offsetLeft;
			var y = f.offsetTop;

			var o = this.GetFrame()
			o.setAttribute('_SCROLL_X', f.getAttribute('_SCROLL_X'));
			o.setAttribute('_SCROLL_Y', f.getAttribute('_SCROLL_Y'));
			f = o = null;

			var obj_h = $(obj).height();
			var mx = p.X + x;
			if (EWA.B.PAD) {
				mx = 0;
			}
			var caption_height = w._EWA_DialogWnd._Dialog.GetFrameTitle().clientHeight;
			this.Move(mx, p.Y + y + obj_h + caption_height);
		}
		doc = w = null;
	};
	this.Move = function(x, y) {
		var o = this.GetFrame()
		if (o == null)
			return;
		EWA.UI.Utils.MoveTo(o, x, y < 0 ? 0 : y);
		o = null;
	};
	this.MoveCenter = function() {
		var o = this.GetFrame()
		var w = o.clientWidth;
		var h = o.clientHeight;
		var docSize = EWA.UI.Utils.GetDocSize(this.CreateWindow);
		var h1 = docSize.H;

		var w1 = docSize.W;
		var h2 = (h1 - h) / 2 - 40;
		var w2 = (w1 - w) / 2;
		if (w2 < 0) {
			w2 = 0;
		}
		if (h2 < 0) {
			h2 = 0;
		}
		var h3 = docSize.SH;
		var w3 = docSize.SW;
		o.setAttribute('_SCROLL_X', w3);
		o.setAttribute('_SCROLL_Y', h3);
		this.Move(w2 + w3, h2 + h3);
		o = null;
	};
	this.ResizeByContent = function() {
		var o = this.GetFrame();
		var obj = this.GetFrameContent().childNodes[0];
		if (obj.tagName == "IFRAME") {
			var o2 = obj.contentWindow;
			if (o2 && o2.document && o2.document.body) {
				var o1 = o2.document.getElementById('Test1');
				if (o1) {
					obj = o1;
				}
			}
		}
		var w00 = 0;
		var h00 = 0;
		// if (!this._calc_frame_table) {
		var frame_table = this.GetFrameContent().parentNode.parentNode.parentNode; // table
		w00 = $(frame_table).css('border-left-width').replace('px', '') * 1
				+ $(frame_table).css('border-right-width').replace('px', '')
				* 1;

		h00 = $(frame_table).css('border-top-width').replace('px', '') * 1
				+ $(frame_table).css('border-bottom-width').replace('px', '')
				* 1;

		this._calc_frame_table = w00;
		// }
		var w = $(obj).width();
		w += w00;
		var h = $(obj).height() + h00;
		var x = o.style.left.replace("px", "") * 1;
		var y = o.style.top.replace("px", "") * 1;

		if ((w + x) > this.CreateWindow.document.body.clientWidth) {
			this.Move(this.CreateWindow.document.body.clientWidth - w - 20, y);
		}
		// console.log('ResizeByContent', w, h, w00, h00);
		this.Resize(w, h, true);
		o = obj = null;
	};
	this.Resize = function(width, height, ischeckborderwidth) {
		if (this.IsShowTitle) {
			var objTitle = this.GetFrameTitle();
			// console.log($(objTitle).parent().height());
			height = height + $(objTitle).parent().height();
		}
		var w00 = 0;
		var h00 = 0;
		if (!ischeckborderwidth) {
			var frame_table = this.GetFrameContent().parentNode.parentNode.parentNode; // table
			w00 = $(frame_table).css('border-left-width').replace('px', '')
					* 1
					+ $(frame_table).css('border-right-width')
							.replace('px', '') * 1;
			this._calc_frame_table = w00;

			h00 = $(frame_table).css('border-top-width').replace('px', '')
					* 1
					+ $(frame_table).css('border-bottom-width').replace('px',
							'') * 1;
		}
		width = width + w00;
		height = height + h00;
		// console.log("Resize", width, height, w00, h00, ischeckborderwidth);
		var o = this.GetFrame();
		o.style.width = width + "px";
		o.style.height = height + "px";
		for (var i = 0; i < o.childNodes.length; i += 1) {
			var c = o.childNodes[i];
			c.style.width = width + "px";
			c.style.height = height + "px";
			if (c.id.indexOf('divContent') > 0) {
				c.style.overflow = 'hidden';
			}
			c = null;
		}
		var cnt = this.GetFrameContent();

		var child = cnt.childNodes[0];
		/*
		 * if (child) { with (child.style) { width = cnt.clientWidth + 'px';
		 * height = cnt.clientHeight + 'px'; } }
		 */
		o = cnt = child = null;

		var oCover = this.GetObject(this._DivCover);
		$(oCover).css('background-image', 'none');
		$(oCover).attr('background-image', 'none');
	};
	this.Show = function(isShow) {
		var o = this.GetFrame();
		if (isShow) {
			o.style.display = "";
			if (this.IsShowTitle && this.AutoSize) {
				_EWA_DIALOG_ON_TIMER = this;
				this.TimerHandle = window.setInterval(function() {
					var wnd = _EWA_DIALOG_ON_TIMER;
					window.clearInterval(wnd.TimerHandle);
					var o1 = wnd.GetFrame();
					var o2 = wnd.GetFrameContent();
					var w = o2.childNodes[0].offsetWidth;
					var h = wnd.GetObject(wnd._FrameFore).offsetHeight;
					// console.log('show', w, h)
					o1.style.width = w + 'px';
					o1.style.height = h + 'px';

					if (wnd.GetObject(wnd._FrameBack1)) {
						wnd.GetObject(wnd._FrameBack1).style.width = w + 'px';
						wnd.GetObject(wnd._FrameBack1).style.height = h + 'px';
					}
					if (wnd.GetObject(wnd._FrameBack2)) {
						wnd.GetObject(wnd._FrameBack2).style.width = w + 'px';
						wnd.GetObject(wnd._FrameBack2).style.height = (h + 3)
								+ 'px';
					}
					var child = o2.childNodes[0];
					if (child) {
						child.style.width = w - 2 + 'px';
						child.style.height = h - 2 + 'px';
					}
					wnd = _EWA_DIALOG_ON_TIMER = o1 = o2 = null;

					var oCover = wnd.GetObject(this._DivCover);
					$(oCover).css('background-image', 'none');
					$(oCover).attr('background-image', 'none');
				}, 32);
			}

		} else {
			o.style.display = "none";
		}
		// var oCover = this.GetObject(this._DivCover);
		// if (oCover) {
		// oCover.style.display = o.style.display;
		// oCover.style.width = document.body.scrollWidth + 'px';
		// oCover.style.height = document.body.scrollHeight + 'px';
		// }
		o = oCover = null;
	};
	this.Dispose = function() {
		// this.CreateWindow.document.body.style.overflow=this.CreateWindow.document.body.getAttribute('ewa_open_window');
		if (!this.CreateWindow) {
			return;
		}
		this.CreateWindow._EWA_DIALOGS[this._CreateWindowIndex] = null;
		_EWA_DIALOGS[this._WindowIndex] = null;
		// this.CreateWindow.onscroll = null;
		// window.onscroll = null;
		if (this._DivCover != null) {
			EWA$UI$COMMON.Drop(this.GetObject(this._DivCover));
			this._DivCover = null;
		}
		this.GetObject(this.Frame).innerHTML = "";
		EWA$UI$COMMON.Drop(this.GetObject(this.Frame));
		this.CreateWindow = null;
		if (EWA.B.IE) {
			CollectGarbage();
		}
	};
	this.SetZIndex = function(zIndexInc) {
		this.CreateWindow._EWA_UI_DIALOG_COVERINDEX += zIndexInc;
		this.zIndex = this.CreateWindow._EWA_UI_DIALOG_COVERINDEX;
		this.GetObject(this.Frame).style.zIndex = this.zIndex;
	};
	this.CreateId = function() {
		var d = new Date();
		var r = Math.random();
		return d.getTime() + '_' + r;
	}
	this.Create = function() {
		if (this.CreateWindow == null) {
			this.CreateWindow = window;
		}
		if (this.IsCover) {
			this._CreateCover();
		}
		var id0 = this.CreateId();
		var w = this.CreateWindow;
		if (w._EWA_UI_DIALOG_COVERINDEX == null) {
			w._EWA_UI_DIALOG_COVERINDEX = 0;
		}
		w._EWA_UI_DIALOG_COVERINDEX += 1;
		this.zIndex = w._EWA_UI_DIALOG_COVERINDEX;
		var position = window.EWA_UI_DIALOG_FIXED ? "position:fixed"
				: "position:absolute";
		// 主框体
		var styleFrame = "display:none; " + position + "; width:" + this.Width
				+ "; height:" + this.Height + "; z-index:" + this.zIndex
				+ "; left:" + this.Left + "; top:" + this.Top + ";";
		var divFrame = EWA$UI$COMMON.CreateObject(w, "div", styleFrame,
				w.document.body);
		divFrame.setAttribute('EWA_NAME', 'DIV_FRAME');
		divFrame.className = 'ewa-dialog';
		divFrame.id = id0 + "divFrame";
		this.Frame = divFrame.id;

		// 背景一
		var styleBack1 = "position: absolute; width: 100%; height: 100%; left: 0px; top: 0px;";
		var divBack1 = EWA$UI$COMMON.CreateObject(w, "div", styleBack1,
				divFrame);
		divBack1.setAttribute('EWA_NAME', 'DIV_BACK1');

		divBack1.id = id0 + "divBack1";
		this._FrameBack1 = divBack1.id;

		// 背景二,阴影
		if (!(this.ShadowColor == null || this.ShadowColor == "")) {
			var styleBack2 = "position: absolute; background-color:"
					+ this.ShadowColor + "; width:100%; height:100%; left:"
					+ this.Offset + "px; top: " + (this.Offset * 1 + 2) + "px;";
			var divBack2 = EWA$UI$COMMON.CreateObject(w, "div", styleBack2,
					divFrame);
			divBack2.style.filter = "alpha(opacity=50)";
			divBack2.style.opacity = 0.5;

			divBack2.id = id0 + "divBack2";
			this._FrameBack2 = divBack2.id;
		}
		if (EWA.B.IE) { // 设置背景,覆盖select，用于ie6
			var coverHtml = "<iframe src='javascript:false' style=\"position:absolute;top:0px;left:0px;width:100%; height:100%; z-index:-1; filter='progid:DXImageTransform.Microsoft.Alpha(style=0,opacity=0)';\"></iframe>";
			divBack1.innerHTML = coverHtml;
			if (!(this.ShadowColor == null || this.ShadowColor == "")) {
				divBack2.innerHTML = coverHtml;
			}
		}
		//

		divFrame.setAttribute('_SCROLL_X', 0);
		divFrame.setAttribute('_SCROLL_Y', 0);

		this._CreateContent();

		$(divFrame)
				.append(
						"<i style='z-index:"
								+ this.zIndex
								+ "0' onclick='this.parentNode.style.display=\"none\"' class='ewa-dialog-close'></i>");

		w = divFrame = divBack1 = divBack2 = null;

		// 生成窗口事件
		if (!this.CreateWindow._EWA_DIALOGS) {
			this.CreateWindow._EWA_DIALOGS = [];
			addEvent(this.CreateWindow, 'scroll', EWA.UI.DialogOnScroll);
		}
		// 当前窗口事件
		if (!window._EWA_DIALOGS) {
			_EWA_DIALOGS = [];
			addEvent(window, 'scroll', EWA.UI.DialogOnScroll);
		}
		this._CreateWindowIndex = this.CreateWindow._EWA_DIALOGS.length;
		this.CreateWindow._EWA_DIALOGS[this._CreateWindowIndex] = this;
		this._WindowIndex = _EWA_DIALOGS.length;
		_EWA_DIALOGS[this._WindowIndex] = this;
	};
	this._CreateContent = function() {
		// 内容
		var id0 = this.CreateId();
		var w = this.CreateWindow == null ? window : this.CreateWindow;
		var styleContent = "position: absolute; width: 100%; height: 100%; z-index: 2; left: 0px; top: 0px;  background-color:white";
		var divContent = EWA$UI$COMMON.CreateObject(w, "div", styleContent,
				this.GetFrame());
		divContent.setAttribute('EWA_NAME', 'CONTENT');
		divContent.className = 'EWA_POP_MAIN';

		divContent.id = id0 + "divContent";
		if (!this.IsShowTitle) {
			this.FrameContent = divContent.id;
			return;
		}
		var mv = " EWA_WND_ID='" + this.Id + "'";
		var win = "this.ownerDocument.parentWindow";
		if (!EWA.B.IE) {
			win = "this.ownerDocument.defaultView";
		}
		if (this.IsCanMove) {// 可以移动
			var aa = win
					+ "._EWA_UI_WINDOW_LIST[this.getAttribute('EWA_WND_ID')]._OpenerWindow.EWA$UI$COMMON$Move.";
			mv += " onmousedown=\""
					+ aa
					+ "OnMouseDown(this.parentNode.parentNode,event,true,true);\"";
			mv += " onmousemove=\""
					+ aa
					+ "OnMouseMove(this.parentNode.parentNode,event,true,true);\"";
			mv += " onmouseup=\"" + aa
					+ "OnMouseUp(this.parentNode.parentNode);\"";
			mv += " onmouseout=\"try{" + aa
					+ "OnMouseOut(this.parentNode.parentNode);}catch(e){}\"";
			mv += " style='cursor:pointer' ";
		}
		// 关闭按钮
		var imgSrc = EWA.RV_STATIC_PATH == null ? '/EmpScriptV2'
				: EWA.RV_STATIC_PATH;
		var img = "<img src='" + imgSrc
				+ "/EWA_STYLE/images/dialog/but_1.gif' style='cursor:pointer' ";
		img += " onmouseover=\"var m=this.src.lastIndexOf('.');var s = this.src.substring(0, m);if(s.substring(s.length - 1).toUpperCase() == 'C'){return;}s+='c'+this.src.substring(m);this.src = s;\"";
		img += " onmouseout =\"var m=this.src.lastIndexOf('.');var s = this.src.substring(0, m - 1);s = s + this.src.substring(m);this.src = s;\"";
		var jsClose = '';
		var imgJsClose = '';
		if (this.DisposeOnClose) {
			jsClose = " ondblclick=\"" + win + "._EWA_UI_WINDOW_LIST['"
					+ this.Id + "'].CloseWindow();\"";
			imgJsClose = " onclick=\"" + win + "._EWA_UI_WINDOW_LIST['"
					+ this.Id + "'].CloseWindow();\"";
		} else {
			jsClose = " ondblclick=\"" + win + "._EWA_UI_WINDOW_LIST['"
					+ this.Id + "']._Dialog.Show(false);\"";
			imgJsClose = " onclick=\"" + win + "._EWA_UI_WINDOW_LIST['"
					+ this.Id + "']._Dialog.Show(false);\"";
		}
		img += imgJsClose + " />";
		// 显示窗体
		var s1 = "<table unselectable='on' onselectstart='return false;' style='cursor:pointer;margin-bottom:1px;width:100%;height:100%;-moz-user-select:none;' cellpadding='0' cellspacing='0' "
				+ mv + ">";
		s1 += "<tr><td "
				+ jsClose
				+ " class='EWA_POP_TITLE_L'>...</td><td class='EWA_POP_TITLE_R' align=\"right\">";
		s1 += img
				+ "</td></tr><tr><td class='EWA_POP_CNT' colspan=\"2\" valign=top></td></tr></table>";
		divContent.innerHTML = s1;

		var id1 = id0 + 'FrameContent';
		divContent.childNodes[0].rows[1].cells[0].id = id1;
		this.FrameContent = id1;

		var id2 = id0 + 'FrameTitle';
		divContent.childNodes[0].rows[0].cells[0].id = id2;
		this.FrameTitle = id2;

		this._FrameFore = divContent.id;

		w = divContent = null;

	};
	this._CreateCover = function() {
		var w = this.CreateWindow;
		if (w._EWA_UI_DIALOG_COVERINDEX == null) {
			w._EWA_UI_DIALOG_COVERINDEX = 10000000;
		}
		w._EWA_UI_DIALOG_COVERINDEX += 1;
		var cc = w.document.createElement("div");
		// var height = w.document.body.clientHeight == 0 ?
		// document.body.scrollHeight : w.document.body.clientHeight;
		// var style = "display:; width:" + w.document.body.clientWidth + "px;
		// height:" + height + "px; ";
		var style = "display:block; width:100%; height:100%; ";
		cc.style.cssText = style;
		cc.setAttribute("style", style);
		cc.style.zIndex = w._EWA_UI_DIALOG_COVERINDEX;
		cc.className = 'ewa-ui-dialog-cover';
		cc.id = this.CreateId() + '_DivCover';
		this._DivCover = cc.id;
		w.document.body.appendChild(cc);
	};
}

/**
 * 弹出窗体类
 * 
 * @param parentWindow
 *            父窗体
 */
function EWA_UI_PopWindowClass(parentWindow, isDisposeOnClose) {
	this._DivCover = null; // 覆盖层
	this._Dialog = new EWA_UI_DialogClass();
	this._Dialog.DisposeOnClose = isDisposeOnClose;
	this.OpendDialogs = new Array(); // 在此窗口上创建的对话框, 本窗口关闭时，同时关闭子窗口
	// ----------------------------
	this.Id = null;
	this._Name = null;
	this.ClassName = null;// 实例化的类名称
	this._Url = "about:blank";
	// ---------------------------------
	this._ParentWindow = parentWindow;
	this._OpenerWindow = window;
	this.OpendObject = EWA.B.IE ? (window.event ? window.event.srcElement
			: null) : null;
	// ----------- 页面显示后调用的方法 ----------
	this._CallBack = null;
	this.SetCallBack = function(callBack) {
		this._CallBack = callBack; // defined in EWA_Command
	};
	// ----------- 返回调用的窗体值的方法 -----------
	this._ReturnBack = null;
	this.SetReturnBack = function(returnBack) {
		this._ReturnBack = returnBack; // defined in EWA_Command
	};
	this.GetReturnBack = function() {
		return this._ReturnBack; // exceute Run method
	};

	this.Show = function(isShow) {
		this._Dialog.Show(isShow);
	};
	this.Hidden = function() {
		this._Dialog.Show(false);
	};

	// 关闭窗口
	this.CloseWindow = function() {
		for (var i = 0; i < this.OpendDialogs.length; i += 1) {
			this.OpendDialogs[i].Dispose();
			this.OpendDialogs[i] = null;
		}
		this._Dialog.Dispose();
		if (this._OpenerWindow) {
			try {
				this._OpenerWindow.document.body.focus();
				if (this.OpendObject) {
					this.OpendObject.focus();
				}
			} catch (e) {
			}
		}
		this.Dispose();
	};
	// 释放内存 ie
	this.Dispose = function() {
		if (this._CallBack != null) {
			try {
				this._CallBack.Dispose();
			} catch (e) {
			}
		}

		if (this._ReturnBack != null) {
			try {
				this._ReturnBack.Dispose();
			} catch (e) {
			}
		}

		try {
			var w = this.GetIframeWindow();
			if (w) {
				w._EWA_DialogWnd = null;
			}
		} catch (e) {
		}

		// 清理在其它页面的引用
		if (this._OpenerWindow) {
			try {
				this._OpenerWindow.EWA.UI.Dialog.WND[this.Id] = null;
				this._ParentWindow._EWA_UI_WINDOW_LIST[this.Id] = null;
			} catch (e) {
			}
		}
		try {
			this._Dialog.Dispose();
			this._Dialog = null;
			this._ParentWindow = null;
			this._OpenerWindow = null;
			this.OpendObject = null;
			this._CallBack = null;
			this._ReturnBack = null;
		} catch (e) {
		}
		if (EWA.B.IE) {
			CollectGarbage();
		}
	};
	this.SetNewSize = function(width, height) {
		this._Dialog.Resize(width, height);
	};
	this.Move = function(x, y) {
		this._Dialog.Move(x, y);
	};
	this.MoveCenter = function() {
		this._Dialog.MoveCenter();
	};
	this.GetIframeWindow = function() {
		if (this._ParentWindow == null) {
			return;
		}
		var n1 = "__EMP_COMMON_IFRAME" + this._Name;
		var o1;
		if (EWA.B.IE) {
			o1 = this._ParentWindow.frames[n1];
		} else {
			for (var i = 0; i < this._ParentWindow.frames.length; i = i + 1) {
				if (this._ParentWindow.frames[i].name == n1) {
					o1 = null;
					o1 = this._ParentWindow.frames[i];
					break;
				}
			}
		}
		return o1;
	};
	this.SetCaption = function(txtCaption) {
		this._Dialog.SetTitle(txtCaption);
	};
	this.SetUrl = function(url) {
		if (url == 'about:blank')
			return;
		this.GetIframeWindow().location = url;
	};

	// create dialog
	this.Create = function(width, height, name) {
		this._Name = name;
		// 生成主窗体
		this._CreateDialog(width, height);

		if (this._ParentWindow._EWA_UI_WINDOW_LIST == null) {
			this._ParentWindow._EWA_UI_WINDOW_LIST = new Object();
		}
		this._ParentWindow._EWA_UI_WINDOW_LIST[this.Id] = this;
	};
	this._CreateDialog = function(width, height) {
		var h1 = this._ParentWindow.document.body.clientHeight;
		var w1 = this._ParentWindow.document.body.clientWidth;
		var h2 = (h1 - height) / 2 - 20;
		var w2 = (w1 - width) / 2 - 20;
		if (w2 < 0) {
			w2 = 0;
		}
		if (h2 < 0) {
			h2 = 0;
		}
		this._Dialog.Id = this.Id;
		this._Dialog.Width = width;
		this._Dialog.Height = height;
		this._Dialog.CreateWindow = this._ParentWindow;
		this._Dialog.IsShowTitle = true;
		this._Dialog.IsCanMove = true;
		this._Dialog.IsCover = true;
		this._Dialog.Create();
		this._Dialog.Show(true);
		var html = "<iframe style='width:100%;height:100%;' name='__EMP_COMMON_IFRAME"
				+ this._Name + "' frameborder=0 src=\"about:blank\"></iframe>";
		this.SetHtml(html);
	};
	this.SetHtml = function(html) {
		this._Dialog.SetHtml(html);
	};
	this.ResizeByContent = function() {
		this._Dialog.ResizeByContent();
	};
}

EWA.UI.DialogOnScroll = function() {
	if (window.EWA_UI_DIALOG_FIXED || typeof _EWA_DIALOGS == 'undefined') {
		return;
	}
	for (var i = 0; i < _EWA_DIALOGS.length; i += 1) {
		if (_EWA_DIALOGS[i] == null) {
			continue;
		}
		try {
			_EWA_DIALOGS[i].ScrollMoveDiv();
		} catch (e) {
			_EWA_DIALOGS[i] = null;
		}
	}
};

/**
 * 弹出窗体调用的命令类
 */
function EWA_Command() {
	this.CmdWindow = window;// 命令窗体
	this.Cmd = null;// 方法
	this.CmdArgus = new Array();// 参数
	this.IsRunAuto = false;
	this.Run = function() {
		if ((typeof this.Cmd).toLowerCase() == "function") {
			this.Cmd(this.CmdArgus);
		} else {
			var cmd = this.CmdWindow.eval(this.Cmd);
			if (cmd == null) {
				alert("EWA_Command.Cmd undefined! Pls check call method");
				return;
			} else {
				cmd(this.CmdArgus);
				cmd = null;
			}
		}
	};
	this.Dispose = function() {
		for (var i = 0; i < this.CmdArgus.length; i++) {
			this.CmdArgus[i] = null;
		}
		this.CmdArgus.length = 0;
		this.CmdArgus = null;
		this.CmdWindow = null;
		this.Cmd = null;
	}
}

var __Dialog = {
	D : EWA_UI_DialogClass, /* 对话框 */
	C : EWA_UI_PopWindowClass, /* 弹出对话框 */
	WND : new Object(), /* 实例化对象列表 */
	WNDCUR : null, /* 当前对话框 */
	CMD : EWA_Command
/* Command */
}

/**
 * 弹出对话框
 * 
 * @param {}
 *            objCnt 显示的对象
 * @param {}
 *            objFrom 激发事件的来源，如button
 * @param {}
 *            isBottom 是否在底部显示
 * @return {} 对话框本身
 */
__Dialog.Pop = function(objCnt, objFrom, isBottom) {
	var win = window;
	var dia = new EWA_UI_PopWindowClass(win, true);
	if (typeof _EWA_DialogWnd != 'undefined') {
		dia.CreateWindow = _EWA_DialogWnd._ParentWindow;
	}

	dia.Width = 172;
	dia.Height = 200;
	dia.ShadowColor = "";
	__Cal.WND = new EWA_CalendarClass();
	if (typeof _EWA_DialogWnd == 'undefined') {
		dia.CreateWindow = window;
	} else { // pop window created
		dia.CreateWindow = _EWA_DialogWnd._ParentWindow;
		_EWA_DialogWnd.OpendDialogs[_EWA_DialogWnd.OpendDialogs.length] = dia;
	}
	dia.Create();
	dia.SetHtml(objCnt);
	dia.MoveCenter();
	dia.Show(true);
	return dia;
}

/**
 * 获取最外层窗口
 */
__Dialog._GetTopWindow = function() {
	var ow = window;
	while (ow.parent != ow) {
		ow = ow.parent;
	}
	var s1 = ow.document.documentElement.innerHTML.toUpperCase();
	if (s1.indexOf('<FRAMESET') >= 0) {
		return window;
	} else {
		return ow;
	}
}
/**
 * 监控窗口变化，设置内容
 */
__Dialog._DialogMointer = function() {
	var wnd = EWA.UI.Dialog.WNDCUR;
	__Dialog.TimerInc++;
	if (wnd == null && __Dialog.TimerInc > 100) {
		return;
	}
	if (wnd == null) {
		return;
	}
	var oFrame = wnd.GetIframeWindow();
	if (oFrame == null) {
		window.clearInterval(wnd._TimerHandle);
		wnd = EWA.UI.Dialog.WNDCUR = null;
		return;
	}
	if (oFrame.location.href == wnd._Url) {
		return;
	}
	if (oFrame.document.readyState) { // ie
		if (oFrame.document.readyState == "complete") {
			window.clearInterval(wnd._TimerHandle);
			EWA.UI.Dialog._SetTitle(wnd);
		}
	} else { // firefox
		if (oFrame.document.body != null) {
			var s = oFrame.document.documentElement.innerHTML;
			s = s.toLowerCase();
			if (s.indexOf('</body>') > 0 || s.indexOf('</html>') > 0) {
				if (wnd._IncNoIe == 0) {
					wnd._IncNoIe = 1;
				} else {
					EWA.UI.Dialog._SetTitle(wnd);
				}
			}
		}
	}
}

/**
 * 设置弹出窗口的信息，标题、尺寸，并移动到屏幕中央
 * 
 * @param wnd
 *            窗体实例
 */
__Dialog._SetTitle = function(wnd) {
	if (wnd == null) {
		return;
	}
	// 获取内容Frame
	var oFrame = wnd.GetIframeWindow();

	// 在打开窗口的iframe设置Dialog的句柄
	oFrame._EWA_DialogWnd = wnd;
	wnd._Url = oFrame.location.href;

	// 修改窗口的标题
	wnd.SetCaption(oFrame.document.title);
	var buts = oFrame.document.getElementsByTagName("INPUT");

	// 窗体重新刷新时,用于 _DialogMointer 监控
	oFrame.document.body.onunload = function() {
		try {
			this._EWA_DialogWnd._Url = "";
		} catch (e) {
		}
	};

	// 设置页面焦点
	var focus = __Dialog._SetInputFocus(oFrame.document);
	if (!focus) {
		__Dialog._SetTextAreaFocus(oFrame.document);
	}
	if (!focus) {
		oFrame.document.body.focus();
	}

	// 设置关闭按钮事件
	__Dialog._SetClose(oFrame.document);

	// var w = oFrame.document.getElementById("EWA_FRAME_MAIN");
	// if (w != null) {// 自动调整宽度和高度
	// oFrame.document.body.style.margin = "0px";
	// oFrame.document.body.style.overflow = "hidden";
	// var wa, ha, w1;
	// if (w.tagName == 'TABLE') {
	// w1 = w;
	// } else {
	// for (var i = 0; i < w.childNodes.length; i++) {
	// w1 = w.childNodes[i];
	// if (w1.tagName != null) {
	// break;
	// }
	// }
	// }
	// wa = w1.offsetWidth + 0;
	// ha = w1.offsetHeight + 12;
	// var padl = $(w1).css('margin-left');
	// var padr = $(w1).css('margin-right');
	// var padt = $(w1).css('margin-top');
	// var padb = $(w1).css('margin-bottom');
	// // console.log(w1);
	// // console.log($(w1).css('margin'))
	// if (padl) {
	// wa += padl.replace('px', '') * 1;
	// }
	// if (padr) {
	// wa += padr.replace('px', '') * 1;
	// }
	// if (padt) {
	// ha += padt.replace('px', '') * 1;
	// }
	// if (padb) {
	// ha += padb.replace('px', '') * 1;
	// }
	// // console.log(wa, ha)
	// if (wa < 30 || ha < 10) {
	// wa = w.scrollWidth;
	// ha = w.scrollHeight;
	// }
	// if (!(wa < 30 || ha < 10)) {
	// wnd.MoveCenter();
	// // EWA.UI.Utils.AniExpandTo(wnd._Dialog.GetFrame(), wa + 25, ha +
	// // 56, 10);
	//
	// wnd.SetNewSize(wa, ha);
	// // EWA.UI.Utils.AniExpandCompleateFunction = function() {
	// // wnd.SetNewSize(wa, ha);
	// // }
	// }
	// }
	oFrame.document.body.style.margin = "0px";
	oFrame.document.body.style.overflow = "hidden";
	wnd._Dialog.ResizeByContent();
	// 移动到屏幕中央
	wnd.MoveCenter();

	// 自行窗体调用命令
	if (wnd._CallBack != null) {
		wnd._CallBack.Run();// 自动执行
	}
	oFrame = null;
}
__Dialog._SetClose = function(doc) {
	var buts = doc.getElementsByTagName("INPUT");
	for (var i = 0; i < buts.length; i = i + 1) {
		var type = buts[i].type.toLowerCase();
		if (type == "button" || type == "submit") {
			__Dialog._SetCloseFunction(buts[i]);
		}
	}
	buts = null;
	buts = doc.getElementsByTagName("BUTTON");
	for (var i = 0; i < buts.length; i++) {
		__Dialog._SetCloseFunction(buts[i]);
	}
}
__Dialog._SetCloseFunction = function(obj) {
	var v = obj.value.trim().toLowerCase();
	if (obj.tagName.toLowerCase() == 'button') {
		v = obj.innerHTML;
	}
	if (v.indexOf("关闭") >= 0 || v.indexOf("取消") >= 0 || v.indexOf("close") >= 0
			|| v.indexOf("cancel") >= 0) {
		if (obj.onclick != null && obj.onclick.toString().indexOf("EWA") >= 0) {
			return;
		}
		obj.onclick = function() {
			var d = this.ownerDocument;
			var w = d.parentWindow ? d.parentWindow : d.defaultView;
			w._EWA_DialogWnd.CloseWindow();
		};
	}
}
__Dialog._SetInputFocus = function(doc) {
	var buts = doc.getElementsByTagName("INPUT");
	for (var i = 0; i < buts.length; i = i + 1) {
		var but = buts[i];
		var type = but.type.toLowerCase();
		if (type == "text" || type == "password") {
			var func = but.parentNode.innerHTML;
			if (func != null && func.toString().indexOf('EWA.F.I.Date') >= 0) {
				// date
				func = null;
				continue;
			}
			try {
				but.focus();
				buts = null;
				but = null;
				return true;
			} catch (e) {
			}
		}
		but = null;
	}
	buts = null;
	return false;
}
__Dialog._SetTextAreaFocus = function(doc) {
	var textareas = doc.getElementsByTagName("TEXTAREA");
	for (var i = 0; i < textareas.length; i = i + 1) {
		try {
			textareas[i].focus();
			textareas = null;
			return true;
		} catch (e) {
		}
	}
	textareas = null;
	return false;
}
/**
 * 打开弹出窗口，当数据提交后刷新父窗口，并关闭当前窗口
 * 
 * @param frameUnid:
 *            调用的Frame编号
 * @param xmlName:
 *            配置文件名称
 * @param itemName:
 *            配置项名称
 * @param isCurrentWindow:
 *            是否为当前窗口
 * @param parameters:
 *            传递的参数
 * @param afterMsg
 *            完成后的消息
 * @param isAttatchParas
 *            是否附加 frameUnid 的参数
 */
__Dialog.OpenReloadClose = function(frameUnid, xmlName, itemName,
		isCurrentWindow, parameters, afterMsg, isAttatchParas) {
	var p = "RELOAD_PARENT,CLOSE_SELF";
	EWA.UI.Dialog.OpenFrame(frameUnid, xmlName, itemName, isCurrentWindow,
			parameters, p, afterMsg, isAttatchParas);
}

/**
 * 打开弹出窗口，当数据提交后刷新父窗口
 * 
 * @param frameUnid:
 *            调用Frame编号
 * @param xmlName:
 *            配置文件名称
 * @param itemName:
 *            配置项名称
 * @param isCurrentWindow:
 *            是否为当前窗口
 * @param parameters:
 *            传递的参数
 * @param afterMsg
 *            完成后的消息
 * @param isAttatchParas
 *            是否附加 frameUnid 的参数
 */
__Dialog.OpenReload = function(frameUnid, xmlName, itemName, isCurrentWindow,
		parameters, afterMsg, isAttatchParas) {
	var p = "RELOAD_PARENT";
	EWA.UI.Dialog.OpenFrame(frameUnid, xmlName, itemName, isCurrentWindow,
			parameters, p, afterMsg, isAttatchParas);
}

/**
 * 打开弹出窗口，当数据提交后刷新父窗口
 * 
 * @param frameUnid:
 *            调用Frame编号
 * @param xmlName:
 *            配置文件名称
 * @param itemName:
 *            配置项名称
 * @param isCurrentWindow:
 *            是否为当前窗口
 * @param parameters:
 *            传递的参数
 * @param afterMsg
 *            完成后的消息
 * @param isAttatchParas
 *            是否附加 frameUnid 的参数
 */
__Dialog.OpenReloadClear = function(frameUnid, xmlName, itemName,
		isCurrentWindow, parameters, afterMsg, isAttatchParas) {
	var p = "RELOAD_PARENT,CLEAR_SELF";
	EWA.UI.Dialog.OpenFrame(frameUnid, xmlName, itemName, isCurrentWindow,
			parameters, p, afterMsg, isAttatchParas);
}
/**
 * 打开弹出窗口，当数据提交后，执行 behavior 指定的 行为(如：刷新父窗口，关闭当前窗口...)
 * 
 * @param obj:
 *            调用的对象
 * @param xmlName:
 *            配置文件名称
 * @param itemName:
 *            配置项名称
 * @param isCurrentWindow:
 *            是否为当前窗口
 * @param parameters:
 *            传递的参数
 * @param behavior:
 *            数据刷新后的行为
 * @param afterMsg
 *            完成后的消息
 * @param isAttatchParas
 *            是否附加 frameUnid 的参数
 */
__Dialog.OpenFrame = function(frameUnid, xmlName, itemName, isCurrentWindow,
		parameters, behavior, afterMsg, isAttatchParas) {
	if (behavior == null) {
		behavior = "";
	}

	if (!__Dialog[frameUnid]) {
		__Dialog[frameUnid] = {};
	}
	__Dialog[frameUnid].AfterMsg = afterMsg == null ? "" : afterMsg;

	var paras = parameters;
	// 附加来源的参数
	if (isAttatchParas == 'yes' && EWA.F && EWA.F.FOS[frameUnid]
			&& EWA.F.FOS[frameUnid].Url) {
		var u1 = new EWA_UrlClass(EWA.F.FOS[frameUnid].Url);
		u1.RemoveEwa();

		// 传递的参数级别高于来源参数
		var u0 = new EWA_UrlClass("a1?" + paras);
		for ( var n in u0._Paras) {
			var v = u0.GetParameter(n);
			u1.AddParameter(n, v);
		}
		paras = u1.GetParas();
	}
	behavior = "EWA_P_BEHAVIOR=" + behavior + "&EWA_PARENT_FRAME=" + frameUnid;

	if (!paras) {
		paras = behavior;
	} else {
		paras = paras + "&" + behavior;
	}

	var href = EWA.UI.Dialog.GetUrl(xmlName, itemName, paras);
	var name = xmlName + "-" + itemName;
	EWA.UI.Dialog.OpenWindow(href, name, 100, 50, isCurrentWindow);
}
/**
 * 打开弹出窗口
 * 
 * @param url:
 *            页面地址
 * @param name:
 *            窗体名称
 * @param width:
 *            窗口宽度px
 * @param height:
 *            窗口高度
 * @param IsSelfWindow:
 *            是否为当前窗口
 * @param callBackCommand:
 *            窗口打开时候执行的命令对象 EWA_Command
 * @param returnBackCommand
 *            窗口关闭时候执行的命令对象 EWA_Command
 * @param isDisposeOnClose
 *            关闭时是否注销，如果不填就是是
 */
__Dialog.OpenWindow = function(url, name, width, height, IsSelfWindow,
		callBackCommand, returnBackCommand, isDisposeOnClose) {// 打开窗体

	// 关闭时是否注销,默认是是
	var isClose = isDisposeOnClose === undefined ? true : isDisposeOnClose;
	var topWindow;
	if (IsSelfWindow) {
		topWindow = window; // 当前窗体
	} else {
		topWindow = EWA.UI.Dialog._GetTopWindow();
	}
	var u1 = url;
	if (u1 != null && u1 != 'about:blank') {
		if (url.indexOf("?") > 0) {
			u1 += "&_r=" + Math.random();
		} else {
			u1 += "?_r=" + Math.random();
		}
	}

	u1 = u1.replace(/\|/ig, '%7c'); // for tomcat7.060+

	// topWindow.document.body.setAttribute('ewa_open_window',topWindow.document.body.style.overflow);
	// topWindow.document.body.style.overflow='hidden';

	var pid = "_EWA_UI_DIALOG_" + name; // 窗体的ID
	EWA.UI.Dialog.WND[pid] = null;
	EWA.UI.Dialog.WND[pid] = new EWA.UI.Dialog.C(topWindow, isClose);
	var wnd = EWA.UI.Dialog.WND[pid];
	wnd.Id = pid;
	wnd.DisposeOnClose = isDisposeOnClose;
	wnd.Create(width, height, name);

	if (u1 != null) {
		wnd.SetUrl(u1);
	}
	if (callBackCommand != null) {
		wnd.SetCallBack(callBackCommand);
	}
	if (returnBackCommand != null) {
		wnd.SetReturnBack(returnBackCommand);
	}

	// wnd.MoveCenter();
	// 时钟事件
	__Dialog.TimerInc = 0;
	wnd._TimerHandle = window.setInterval(EWA.UI.Dialog._DialogMointer, 155);
	wnd._IncNoIe = 0;
	// 设置当前的Dialog的句柄
	EWA.UI.Dialog.WNDCUR = null;
	EWA.UI.Dialog.WNDCUR = wnd;
	wnd = topWindow = null;
	return EWA.UI.Dialog.WND[pid];
}

/**
 * 获取配置执行的路径
 * 
 * @param xmlName
 *            配置文件名称
 * @param itemName
 *            配置项名称
 * @param parameters
 *            传递的参数
 */
__Dialog.GetUrl = function(xmlName, itemName, parameters) {
	var href = EWA.CP + "/EWA_STYLE/cgi-bin/?XMLNAME=" + xmlName.toURL()
			+ "&ITEMNAME=" + itemName.toURL() + "&" + parameters;
	return href;
}

/**
 * 弹开对话框
 * 
 * @type
 */
EWA["OW"] = {
	Dia : null, // 对话框对象
	PWin : null, // 父窗体
	Frame : null, // 父窗体当前的Frame
	Close : function() {
		if (EWA["OW"].Dia) {
			EWA["OW"].Dia.CloseWindow();
		} else {
			alert('Dialog not Load');
		}
	},
	Load : function() {
		EWA["OW"].Dia = window._EWA_DialogWnd; // 对话框对象
		EWA["OW"].PWin = EWA["OW"].Dia ? EWA["OW"].Dia._OpenerWindow : null; // 父窗体
		EWA["OW"].Frame = EWA["OW"].PWin ? EWA["OW"].PWin.EWA.F.FOS[EWA["OW"].PWin.EWA.F.CID]
				: null;
	}
}

EWA["UI"].Dialog = __Dialog; /* 公共弹出框 */