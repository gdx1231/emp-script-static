/**
 * 多维表格
 * 
 * @param {String}
 *            className 类名
 * @param {String}
 *            url 地址
 */
function EWA_MultiGridClass(className, url) {
	this.ClassName = className;
	this.Url = url;
	this.TransParent = null;
	this._Id = null;
	this.Resources = {};
	this.Init = function(xmlString) {
		this.Xml = new EWA.C.Xml();
		this.Xml.LoadXml(xmlString);
		this.Resources = new EWA_FrameResoures();
		this.Resources.Init(this.Xml);

	};
	this.CollapseCol = function(id, fromObj) {
		var dsp = '';
		var fromTd = fromObj.parentNode;
		if (fromTd.getAttribute("expand") == null || fromTd.getAttribute("expand") == 1) {
			fromTd.setAttribute("expand", 0);
			fromObj.innerHTML = '+';
			dsp = 'none';
			fromTd.setAttribute('col_span', fromTd.colSpan);
			fromTd.colSpan = 1;
			fromTd.style.fontStyle = 'italic';
			fromTd.style.color = 'blue';
		} else {
			fromTd.setAttribute("expand", 1);
			fromObj.innerHTML = '-';
			fromTd.colSpan = fromTd.getAttribute('col_span');
			fromTd.style.fontStyle = '';
			fromTd.style.color = '#000';
		}

		var objs = document.getElementsByTagName(id);
		var cells = [];
		var hiddenCells = [];
		for (var i = 0; i < objs.length; i++) {
			var o = objs[i];
			var rowIndex = o.parentNode.parentNode.rowIndex;
			if (cells[rowIndex] == null) {
				cells[rowIndex] = [];
			}
			var td = o.parentNode;
			cells[rowIndex].push(td);
			if (dsp == "none" && td.style.display == "none") {
				hiddenCells.push(td.id);
			}
		}
		var ids;
		if (dsp == "none") {
			fromTd.setAttribute("ids", "[" + hiddenCells.join("][") + "]")
		} else {
			ids = fromTd.getAttribute("ids");
			ids = ids == null ? "" : ids;
			// alert(ids);
		}

		for (var i = 0; i < cells.length; i++) {
			if (cells[i] == null) {
				continue;
			}
			var v = 0;
			for (var m = 0; m < cells[i].length; m++) {
				var c = cells[i][m];
				v += c.getAttribute("val") * 1;
				var idx = "[" + c.id + "]";

				if (m > 0) {
					if (dsp == "") {
						if (ids.indexOf(idx) < 0) {
							c.style.display = dsp;
						} else {
							// alert(c.outerHTML)
						}
					} else {
						c.style.display = dsp;
					}
				}

			}
			var c = cells[i][0];
			if (dsp == "") {
				var idx = "[" + c.id + "]";

				if (ids.indexOf(idx) < 0) {
					c.childNodes[0].innerHTML = c.getAttribute('val');
					c.style.fontStyle = '';
					c.style.color = '#000';
				}
			} else {
				if (c.className == 'EWA_GRID_H') {
					c.childNodes[0].innerHTML += "...";
				} else {
					c.childNodes[0].innerHTML = v;
				}
				c.style.fontStyle = 'italic';
				c.style.color = 'blue';
			}
		}
	}
	this.Trans = function() {
		var u = new EWA_UrlClass();
		u.SetUrl(this.Url);
		if (this.Url.indexOf("&EWA_GRID_TRANS=") > 0) {
			u.RemoveParameter("EWA_GRID_TRANS");
		} else {
			u.AddParameter("EWA_GRID_TRANS", "1");
		}
		this.TransParent = $X('EWA_MG_' + this._Id).parentNode;
		this.Url = u.GetUrl();
		this._DoTrans(u.GetUrl());

		// window.location.href = u.GetUrl();
	};
	this._DoTrans = function(url) {
		EWA.F.CID = this._Id;

		this._Ajax = new EWA.C.Ajax();
		this._Ajax.LoadingType = "image";
		this._Ajax.AddParameter("EWA_AJAX", "1");
		this._Ajax.AddParameter("EWA_ID", this._Id);

		this._Ajax.PostNew(url, EWA.F.FOS[EWA.F.CID]._CallBackJs);
	};

	this.Reload = function() {
		var u = new EWA_UrlClass();
		u.SetUrl(this.Url);
		this.TransParent = $X('EWA_MG_' + this._Id).parentNode;
		this.Url = u.GetUrl();
		this._DoTrans(u.GetUrl());

	};
	this.ReloadAfter = function() {

	};
	this.getUrlClass = function() {
		var u = new EWA_UrlClass();
		u.SetUrl(this.Url);
		return u;
	};
	this._CallBackJs = function() {
		var ajax = EWA.F.FOS[EWA.F.CID]._Ajax;
		if (ajax._Http.readyState != 4) {
			ajax = null;
			return;
		}
		ajax.HiddenWaitting();
		if (ajax._Http.status == 200) {
			var ret = ajax._Http.responseText;
			if (EWA.F.CheckCallBack(ret)) {
				EWA.F.FOS[EWA.F.CID].TransParent.innerHTML = ret;
				if (EWA.F.FOS[EWA.F.CID].ReloadAfter) {
					EWA.F.FOS[EWA.F.CID].ReloadAfter();
				}
			}
		} else {
			alert("ERROR:\r\n" + ajax._Http.statusText);
		}
		ajax = null;
	};
}
EWA.UI.MultiGrid = {
	COLOR_BG : "rgba(173, 216, 230, 0.25)",
	COLOR_FOCUS : "gold",
	MTbId : null,
	MTbs : {},
	MOut : function(evt) {
		var e = evt || event;
		var t = e.srcElement || e.target;
		if (t == null) {
			return;
		}
		e.stopPropagation ? e.stopPropagation() : e.cancelBubble();
		var inc = 0;
		try {
			while (!(t && t.tagName && t.tagName.toUpperCase() == 'TD' && t.id.indexOf('$MGC_') > 0)) {
				t = t.parentNode;
				inc++;
				if (inc > 5) {
					return;
				}
			}
		} catch (e) {
			return;
		}
		var id = t.id;
		if (id == EWA.UI.MultiGrid.MTbId) {
			return;
		}
		EWA.UI.MultiGrid.MTbId = id;
		var ids = id.split('_');

		var rowIndex = ids[2]; // 第几行
		var colIndex = ids[1]; // 第几列

		var tr = t.parentNode;
		var tb = tr.parentNode.parentNode;
		if (this.MTbs[tb.id] == null) {
			this.MTbs[tb.id] = [];
		}
		var map = this.MTbs[tb.id];
		for (var i = 0; i < map.length; i++) {
			this._restoreBg(map[i]);
		}
		map.length = 0;
		for (var i = 0; i < 1000; i++) {
			var id1 = ids[0] + '_' + i + '_' + ids[2];
			var o = $X(id1);
			if (!o) {
				break;
			}
			if (id1 == id) {
				this._setBg(o, this.COLOR_FOCUS);
			} else {
				this._setBg(o, this.COLOR_BG);
			}
			map.push(o);
		}
		for (var i = 0; i < 1000; i++) {
			var id1 = ids[0] + '_' + ids[1] + '_' + i;
			var o = $X(id1);
			if (!o) {
				break;
			}
			if (id1 != id) {
				map.push(o);
				this._setBg(o, this.COLOR_BG);
			}
		}
		var top_0 = $(tb).find('#MGA_' + rowIndex + '_0');
		if (top_0.length > 0) {
			var o = top_0[0];
			this._setBg(o, this.COLOR_BG);
			map.push(o);
		}
		var left_0 = $(tb).find('#MGB_' + colIndex + '_0');
		if (left_0.length > 0) {
			var o = left_0[0];
			this._setBg(o, this.COLOR_BG);
			map.push(o);
		}
	},
	_setBg : function(o, color) {
		o.setAttribute('oldbg', o.style.backgroundColor);
		o.style.backgroundColor = color;
	},
	_restoreBg : function(o) {
		var color = o.getAttribute('oldbg');
		o.style.backgroundColor = color;
	}
};

EWA.F.M = {
	CUR : null,
	C : EWA_MultiGridClass
};
