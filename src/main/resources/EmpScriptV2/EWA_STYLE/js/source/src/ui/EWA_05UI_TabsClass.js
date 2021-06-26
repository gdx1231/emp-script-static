function EWA_UI_TabsClass(className) {
	this._ClassName = className;
	this._Index = 0;
	this._TabsParent = null; // 页舌容器
	this._ContentsParent = null; // 内容容器
	this._IdTabTag = "__EWA_TAB_HEAD_";
	this._IdFrameTag = "__EWA_TAB_FRAME_";
	this.CurrentWindow = null;
	this._CurId = '';

	this.CreateTab = function(url, name) {
		var id = this._CheckExist(url);
		if (id == null) {
			id = this._Index;
			var title = name || "...";
			var objTab = this._CreateTabHead(url, title);
			var objIframe = this._CreateIframe(url);
			this._Index++;

			if (!name) { // 根据ifame的title设置tab标题
				EWA_ChkIframeOk(objIframe, function(ifameWindow, iframe) {
					var title = ifameWindow.document.title;
					$(objTab).find('.bg_c span:eq(0)').text(title);
				});
			}
		}
		this.ShowTab(id);
	};

	this._CreateTabHead = function(url, name) {
		var id = this._Index;
		var td = this._TabsParent.ownerDocument.createElement("table");
		td.cellPadding = 0;
		td.cellSpacing = 0;
		td.border = 0;
		td.setAttribute('ewa_tab_url', url);
		td.title = '双击关闭窗口\r\n右键刷新当前窗口';
		var tr = td.insertRow(-1);

		var cellLeft = tr.insertCell(-1);
		cellLeft.className = 'bg_l';

		var cell = tr.insertCell(-1);
		cell.className = 'bg_c';
		cell.innerHTML = "<nobr><span>" + name
				+ "</span><b class='ewa_tab_close'></b></nobr></div>";
		cell.getElementsByTagName('b')[0].onclick = function() {
			var obj = this.parentNode.parentNode.parentNode.parentNode.parentNode;
			var id1 = obj.id.split("_");
			var id = id1[id1.length - 1];
			eval('window.' + obj.getAttribute('ewa_class_name')).RemoveTab(id);
		}
		var cellRigth = tr.insertCell(-1);
		cellRigth.className = 'bg_r';

		td.id = this._IdTabTag + id;
		td.className = "ewa_tab_act";
		td.setAttribute('ewa_class_name', this._ClassName);
		td.onclick = function() {
			if (td.getAttribute("ewa_tab_act") == 0) {
				var id1 = this.id.split("_");
				var id = id1[id1.length - 1];
				eval('window.' + this.getAttribute('ewa_class_name')).ShowTab(
						id);
			}
		};
		td.ondblclick = function() {
			var id1 = this.id.split("_");
			var id = id1[id1.length - 1];
			eval('window.' + this.getAttribute('ewa_class_name')).RemoveTab(id);
		};
		td.onselectstart = function() {
			return false;
		};
		td.oncontextmenu = function(evt) {
			this.onclick();
			if (EWA.B.IE) {
				window.event.returnValue = false;// for IE
			} else {
				evt.preventDefault();
			}
			var id1 = this.id.split("_");
			var id = '__EWA_TAB_FRAME_' + id1[id1.length - 1];
			var u = new EWA_UrlClass();
			var w = $X(id).contentWindow;
			u.SetUrl(w.location.href);
			u.RemoveParameter("________r");
			u.AddParameter("________r", Math.random());
			w.location.href = u.GetUrl();
			return false;
		}
		if (!EWA.B.IE) {
			td.onmousedown = function(event) {
				if (typeof (event.preventDefault) != "undefined") {
					event.preventDefault();
				}
			};
		}
		this._TabsParent.appendChild(td);
		return td;
	};
	this._CreateIframe = function(url) {
		var obj = this._ContentsParent.ownerDocument.createElement("IFRAME");
		obj.frameBorder = 0;
		obj.width = "100%";
		obj.height = "100%";
		obj.src = url;

		var id = this._Index;
		obj.id = this._IdFrameTag + id;
		this._ContentsParent.appendChild(obj);

		return obj;
	};

	this.RemoveCurrentTab = function() {
		this.RemoveTab(this._CurId);
	};
	this.RemoveTab = function(id) {
		var seqIndex = 9999999999999;
		var seqId;
		var iframes = this._ContentsParent.getElementsByTagName('iframe');
		var objRemove = null;
		for (var i = 0; i < iframes.length; i++) {
			var o = iframes[i];
			if (o.id != this._IdFrameTag + id) {
				if (seqIndex > o.getAttribute("ewa_tab_show_seq") * 1) {
					seqIndex = o.getAttribute("ewa_tab_show_seq") * 1;
					seqId = o.id;
				}
			} else {
				objRemove = o;
			}
		}

		this._ContentsParent.removeChild(objRemove);
		var objTab = this._TabsParent.ownerDocument
				.getElementById(this._IdTabTag + id);
		this._TabsParent.removeChild(objTab);

		if (seqId != null) {
			var id1 = seqId.split("_");
			var id2 = id1[id1.length - 1];

			if (this._ContentsParent.ownerDocument
					.getElementById(this._IdTabTag + id2) != null) {
				this.ShowTab(id2);
			}
		}
	};

	this._CheckExist = function(url) {
		var spans = this._TabsParent.childNodes;
		for (var i = 0; i < spans.length; i++) {
			var o = spans[i];
			if (o.getAttribute('ewa_tab_url') == url) {
				var id1 = o.id.split("_");
				var id2 = id1[id1.length - 1];
				return id2;
			}
		}
		return null;
	};

	this.ShowTab = function(id) {
		this._CurId = id;

		var iframes = this._ContentsParent.getElementsByTagName('iframe');
		this.CurrentWindow = null;
		var showTab, showIframe, hideTab, hideIframe;
		for (var i = 0; i < iframes.length; i++) {
			var o = iframes[i];
			var id1 = o.id.split("_");
			var id2 = id1[id1.length - 1];
			var oTab = o.ownerDocument.getElementById(this._IdTabTag + id2);
			if (o.id == this._IdFrameTag + id) {

				this.CurrentWindow = o.contentWindow;
				showTab = oTab;
				showIframe = o;
			} else {
				if (o.style.display != 'none') {
					hideTab = oTab;
					hideIframe = o;
				}

				var showSeq = o.getAttribute("ewa_tab_show_seq") * 1 + 1;
				o.setAttribute("ewa_tab_show_seq", showSeq);

			}
		}

		// 切换前调用
		if (this.showTabBeforeCallback) {
			// 用户外部定义的回调
			var isStopNext = this.showTabBeforeCallback(showTab, showIframe,
					hideTab, hideIframe);
			if (isStopNext) {
				console.log('showTabBeforeCallback return stop next');
				return;
			}
		}

		showTab.className = 'ewa_tab_act';
		showTab.setAttribute("ewa_tab_act", 1);
		showIframe.setAttribute("ewa_tab_show_seq", 0);
		showIframe.style.display = '';
		showIframe.style.zIndex = 1;
		var scrollTop = showIframe.getAttribute('s_top');
		if (scrollTop && o.contentWindow.document.scrollingElement) {
			// 恢复到原来的位置
			o.contentWindow.document.scrollingElement.scrollTop = scrollTop * 1;
		}

		if (hideIframe) {
			hideTab.className = 'ewa_tab_dact';
			hideTab.setAttribute("ewa_tab_act", 0);

			hideIframe.style.display = 'none';
			hideIframe.style.zIndex = 0;

			// frameset为null
			if (o.contentWindow.document.scrollingElement) {
				// 保存当前的位置
				var scrollTop = o.contentWindow.document.scrollingElement.scrollTop;
				hideIframe.setAttribute('s_top', scrollTop);
			}
		}

		// 切换后调用
		if (this.showTabAfterCallback) {
			// 用户外部定义的回调
			this.showTabCallback(showTab, showIframe, hideTab, hideIframe);
		}
	};
	/**
	 * 初始化
	 * 
	 * @param {}
	 *            tabsParent 标头的容器
	 * @param {}
	 *            framesParent 内容的容器
	 */
	this.Init = function(tabsParent, contentsParent) {
		if (!EWA.B.IE) {
			// firefox onselectstart
			try {
				tabsParent.style.MozUserFocus = "ignore";
				tabsParent.style.MozUserInput = "disabled";
				tabsParent.style.MozUserSelect = "none";
			} catch (e) {

			}
		}

		var ot = tabsParent.ownerDocument.createElement("table");
		ot.style.width = "100%";
		ot.style.height = "100%";
		ot.onselectstart = function() {
			return false;
		};

		ot.cellSpacing = 0;
		ot.cellPadding = 0;
		var otr = ot.insertRow(-1);
		var otd = otr.insertCell(-1);
		otd.vAlign = "bottom";
		ot.className = 'ewa_tab';
		tabsParent.appendChild(ot);
		this._ContentsParent = contentsParent;

		this._TabsParent = ot.rows[0].cells[0];
		ot = null;
	};
}