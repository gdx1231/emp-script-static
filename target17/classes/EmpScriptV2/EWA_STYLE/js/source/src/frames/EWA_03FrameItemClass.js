/**
 * DropList 类
 */
function EWA_FrameItemClass() {
	this._Ajax = null;
	this._Object = null; // textbox
	this._Object1 = null; // hidden width id
	this._Dialog = null;
	this._Items = new Object();
	this._LastMoveTr = null;
	this._SelectedValue = null;

	//
	this.DropList = function(obj, isMustShow) {
		var obj1 = obj.nextSibling;
		this._Object = obj; // textbox
		this._Object1 = obj1;// hidden width id

		if (obj.value == "") {
			obj1.value = "";
			return;
		}
		if (obj1.getAttribute("canopen") == 0) {
			return;
		}
		if (!isMustShow && this._SelectedValue != null && this._SelectedValue == obj.value) {
			this._SelectedValue = null;
			return;
		}

		// if(this._inputValue == obj.value){
		// return;
		// }
		this._inputValue = obj.value;
		var xmlName = obj1.getAttribute("xmlName");
		var itemName = obj1.getAttribute("itemName");
		var paraname = obj1.getAttribute("paraName");

		// if (this._Items[obj1.value] == null) {
		_EWA_FRAME_ITEM = this;

		var ajax = new EWA.C.Ajax();
		ajax.LoadingType = "none";
		var val = "%" + obj.value + "%";

		var url;
		if (window.EWA_CGI) { // 全局替换cgi-bin路径
			url = window.EWA_CGI;
		} else {
			url = EWA.CP + "/EWA_STYLE/cgi-bin/";
		}
		url += "?XMLNAME=" + xmlName.toURL() + "&ITEMNAME=" + itemName.toURL() + "&EWA_AJAX=NOJS&EWA_LF_NOHEADER=1";
		var ref_paras = $U();
		if (ref_paras) { // 传递页面参数
			url += "&" + ref_paras;
		}

		// 附加参数，通过脚本定义的，例如设定城市后，选择城市下的景点
		if ($(obj).attr('ewa_drop_list_para')) {
			url += "&" + $(obj).attr('ewa_drop_list_para');
		} else if ($(obj1).attr('ewa_drop_list_para')) {
			url += "&" + $(obj1).attr('ewa_drop_list_para');
		}

		var u1 = new EWA_UrlClass(url); // 清理重复的参数
		u1.RemoveParameter(paraname); // 删除和查询参数同名的参数
		url = u1.GetUrl();
		ajax.AddParameter(paraname, val);
		ajax.PostNew(url, function() {
			if (!ajax.IsRunEnd()) {
				return;
			}
			var ret = ajax.GetRst();
			_EWA_FRAME_ITEM.Show(true);
			_EWA_FRAME_ITEM.SetContent(ret);
		});
		// } else {
		this.SetContent(this._Items[obj1.value]);
		// }
	};

	this.MouseOver = function(evt) {
		var e = evt ? evt : window.event;
		var objP = e.srcElement ? e.srcElement : e.target;
		if (objP.tagName != "TD") {
			return;
		}
		var tr = objP.parentNode;
		if (this._LastMoveTr != null) {
			for (var i = 0; i < this._LastMoveTr.cells.length; i += 1) {
				this._LastMoveTr.cells[i].style.backgroundColor = "";
			}
		}
		if (tr.getAttribute("EWA_TAG") == "HEADER") {
			this._LastMoveTr = null;
			return;
		}
		for (var i = 0; i < tr.cells.length; i += 1) {
			tr.cells[i].style.backgroundColor = "#cccccc";
		}
		this._LastMoveTr = tr;
	}
	this.MouseDown = function(evt) {
		var e = evt ? evt : window.event;
		var objP = e.srcElement ? e.srcElement : e.target;

		if (objP.tagName == "DIV") {
			return;
		}
		// var tr = this._LastMoveTr;
		// if (tr == null) {
		// return;
		// }
		var tr;
		if (objP.tagName == 'TR') {
			tr = objP;
		} else {
			var trs = $(objP).parentsUntil('tbody').last();
			if (trs.length == 0) {
				console.log(objP);
				return;
			}
			tr = trs[0];
		}
		if (tr == null) {
			console.log(objP);
			return;
		}
		if (tr.tagName != 'TR') {
			console.log(objP);
			return;
		}
		if (tr.getAttribute("ewa_tag") == "HEADER") {
			return;
		}
		var obj1 = this._Object.nextSibling;
		obj1.setAttribute("canopen", 0);
		var s1 = [];
		var s2 = {};
		for (var i = 0; i < tr.cells.length; i += 1) {
			var cell = tr.cells[i];
			cell.style.backgroundColor = "lightyellow";
			var txt = GetInnerText(cell).trim();
			s1[s1.length] = txt;
			var id = cell.childNodes[0].id;
			if (id != null) {
				s2['@' + id.toUpperCase()] = txt;
				this._Object1.setAttribute("para_" + id.toLowerCase(), txt);
			} else {
				s2[i] = txt;
			}
		}
		this._LastMoveTr = null;
		this._SelectedValue = s1[0];
		this._Object1.value = s1[0];
		var exp = this._Object1.getAttribute("DlsShow");
		if (exp == null || exp == "") {
			this._Object.value = s1[0];
		} else {
			var r1 = /\@[a-zA-Z0-9\-\._:]*\b/ig;
			var m1 = exp.match(r1);
			for (var i = 0; i < m1.length; i++) {
				var key = m1[i];
				var v = s2[key.toUpperCase()];
				exp = exp.replace(key, v);
			}
			this._Object.value = exp;
		}
		this._Object.parentNode.setAttribute('title', s1.join('\n'));
		var funcName = this._Object1.getAttribute('afterEvent');

		this.CallAfterEvent();
		this.Show(false);
		obj1.setAttribute("canopen", 1);
	};
	this.CallAfterEvent = function() {
		var funcName = this._Object1.getAttribute('afterEvent');

		if (funcName == null || funcName.trim().length == 0) {
			return;
		}
		var func = eval('window.' + funcName);
		if (typeof func == "function") {
			func(this._Object1.value, this._Object.value, this._Object1, this._Object);
		} else {
			alert('定义的Js ' + funcName + "不存在, 对象为" + typeof func);
		}
	};
	this.Show = function(isShow) {
		if (this._Dialog == null) {
			var w;
			// 跟随 input对象的宽度 2019-12-04
			var objWidth = $(this._Object).width();
			if (objWidth > 400) { // 低于400惨不忍睹 2019-12-18
				w = objWidth + 'px';
			} else {
				w = '500px';
			}
			var h = '180px';
			if (this._Object1.getAttribute("set-dialog-width") != null) {
				w = this._Object1.getAttribute("set-dialog-width");
			}
			if (this._Object1.getAttribute("set-dialog-height") != null) {
				h = this._Object1.getAttribute("set-dialog-height");
			}
			if (EWA.B.PAD) {
				w = document.documentElement.clientWidth + 'px';
				h = document.documentElement.clientHeight - 300 + 'px';
			}
			this._Dialog = new EWA_UI_DialogClass();
			this._Dialog.Width = w;
			this._Dialog.Height = h;
			this._Dialog.ShadowColor = "";
			if (typeof _EWA_DialogWnd == 'undefined') {
				this._Dialog.CreateWindow = window;
			} else { // pop window created
				this._Dialog.CreateWindow = _EWA_DialogWnd._ParentWindow;
				_EWA_DialogWnd.OpendDialogs[_EWA_DialogWnd.OpendDialogs.length] = this._Dialog;
			}

			this._Dialog.Create();
			var s1 = "<div style='position:absolute;width:" + w + ";height:" + h
				+ ";overflow-y:scroll;overflow-x:hidden;border:1px solid #ccc;cursor:pointer'";
			if (EWA.B.PAD) {
				s1 += " onclick='_EWA_FRAME_ITEM.MouseDown(event)' ></div>";
			} else {
				s1 += " onmouseover='_EWA_FRAME_ITEM.MouseOver(event)' ";
				s1 += " onmousedown='_EWA_FRAME_ITEM.MouseDown(event)' ></div>";
			}
			this._Dialog.SetHtml(s1);

			$(this._Dialog.GetFrame()).addClass('ewa-ddl-list');
		}
		// if (this._Dialog.ShowType == isShow) {
		// //return;
		// }
		this._Dialog.ShowType = isShow;
		this._Dialog.MoveBottom(this._Object);
		this._Dialog.Show(isShow);
		this._Dialog.CreateWindow._EWA_FRAME_ITEM = this;

		_EWA_FRAME_ITEM = this;
	};
	this.SetContent = function(content) {
		if (content == null) {
			return;
		}
		content = content.replace(/onmouseout/ig, 'z1');
		content = content.replace(/onmousedown/ig, 'z2');
		content = content.replace(/onmouseover/ig, 'z3');

		if (this._Items[this._Object.value] == null) {
			this._Items[this._Object.value] = content;
		}
		this._Dialog.GetFrameContent().childNodes[0].innerHTML = content;
		var tb = this._Dialog.GetFrameContent().childNodes[0].getElementsByTagName('table')[0];
		tb.style.position = 'absolute';
		if (tb.rows.length <= 1 || this._Object.value.length == 0) {
			if (tb.rows.length <= 1) {
				this.Show(false);
			}
			return;
		}
		try {
			var regex = eval('/(' + this._Object.value + ')/ig');
			for (var i = 1; i < tb.rows.length; i += 1) {
				var r = tb.rows[i];
				for (var k = 0; k < r.cells.length; k++) {
					var s1 = GetInnerText(r.cells[k].childNodes[0]);
					r.cells[k].childNodes[0].innerHTML = s1.replace(regex, '<font color=blue><b>$1</b></font>');
				}
			}
		} catch (e) {
		}
		this.Show(true);
	}
};
if (!EWA.F.F) {
	EWA.F.F = {
		CUR: null,
		FI: EWA_FrameItemClass
	};
} else {
	EWA.F.F.FI = EWA_FrameItemClass;
}