EWA.UI.Dialog.OpenReloadCloseOld = EWA.UI.Dialog.OpenReloadClose;
EWA.UI.Dialog.OpenReloadClose = function (ewa_uid, xmlName, itemName, nothing, params) {
	var href = EWA_App.Section.fake_EWA_UI_Dialog_OpenReloadClose(ewa_uid, xmlName, itemName, nothing, params);

	var showId = EWA_App.SECTION_SHOW.id;
	// 来源section id,用于提交后刷新页面，在 ajaxLoadedAfter 定义
	href += "&EWA_APP_FROM_SECTION_ID=" + showId;

	if (EWA_App.DEBUG)
		console.log(href);

	EWA_App.State.state(null, href);
};
function $X(id) {
	if (EWA_App.SECTION_SHOW && EWA_App.SECTION_SHOW.id) {
		var showId = EWA_App.SECTION_SHOW.id;
		var obj = $('section#' + showId + " [id=\"" + id + "\"]");
		if (obj.length == 0) {
			return document.getElementById(id);
		} else {
			return obj[0];
		}
	} else {
		return document.getElementById(id);
	}
}
EWA_Utils.JsRegisterSrc = function (src, onlyonce) {
	var hash = src.hashCode();
	var script_id = "ewa_js_register_" + hash;
	var o = $X(script_id);
	if (o) {
		if (onlyonce) {
			console.log("skip-js: " + src);
			// 注册过了
			return;
		}
		if (src.endsWith(".js")) {
			console.log("skip-js: " + src);
			return;
		}
	}

	var oHead;
	if (!onlyonce && !src.endsWith(".js") && EWA_App.SECTION_SHOW) {
		var p = $(EWA_App.SECTION_SHOW).find('div.js-registers');
		if (p.length == 0) {
			p = $("<div class='js-registers'></div>");
			$(EWA_App.SECTION_SHOW).find("div.content:eq(0)").append(p);
		}
		oHead = p[0];
	} else {
		// 结尾为.js的文件加载一次，因此放到头部便于检查
		oHead = document.getElementsByTagName('head')[0];
	}
	var oScript = document.createElement("script");
	oScript.type = "text/javascript";
	oScript.language = "javascript";
	oScript.id = script_id;
	try {
		oScript.src = src;
		oHead.appendChild(oScript);
	} catch (e) {
		alert(e);
	}
};
EWA_Utils.JsRegister = function (js) {
	var oHead;
	if (EWA_App.SECTION_SHOW) {
		var p = $(EWA_App.SECTION_SHOW).find('div.js-registers');
		if (p.length == 0) {
			p = $("<div class='js-registers'></div>");
			$(EWA_App.SECTION_SHOW).find("div.content:eq(0)").append(p);
		}
		oHead = p[0];
	} else {
		oHead = document.getElementsByTagName('head')[0];
	}

	var oScript = document.createElement("script");
	oScript.type = "text/javascript";
	oScript.language = "javascript";
	try {
		oScript.text = js;
		oHead.appendChild(oScript);
	} catch (e) {
		alert(e);
	}

};

function EWA_UrlClass(url) {
	this._URL = "";
	this._Paras = {};
	this._Root = "";
	this.SetUrl = function (url) {
		this._URL = url;
		this._Paras = {};

		var urls = url.split('?');
		this._Root = urls[0];
		if (url.indexOf("?") < 0) {
			return;
		}
		// index.jsp?wx_cfg_no=gh_02e4b5728208&openid=oaf5g8&weixinauth=1#visa?product_id=949&usr_unid=f78c4121-fae0-46ec-b256-a6bdac410c96
		// 由于app会出现畸形参数，因此需要处理
		for (ia = 1; ia < urls.length; ia++) {
			var u1 = urls[ia];
			var u2 = u1.split('&');

			for (var i = 0; i < u2.length; i++) {
				var u3 = u2[i].split('=');
				var paraName = u3[0].toUpperCase();
				var paraVal = '';
				if (u3.length == 2) {
					var paraVal = u3[1];
					if (paraVal.indexOf('#') > 0) {
						paraVal = paraVal.split('#')[0];
					}
				}
				this._Paras[paraName] = paraVal;
			}
		}
	};
	this.GetParameter = function (paraName) {
		return this._Paras[paraName.toUpperCase().trim()];
	};
	this.GetParas = function (islower) {
		var ss = [];
		for ( var n in this._Paras) {
			var v = this._Paras[n];
			if (islower) {
				n = n.toLowerCase();
			}
			if (v != null) {
				ss.push(n + "=" + v);
			}
		}
		return ss.join('&');
	};
	this.SetRoot = function (root) {
		this._Root = root;
	};
	/**
	 * 获取Url，islower是否将名称转换为小写
	 */
	this.GetUrl = function (islower) {
		var pp = this.GetParas(islower);
		var mark = "";
		if (pp.length > 0) {
			if (this._Root.indexOf('?') >= 0) {
				mark = "&"
			} else {
				mark = "?"
			}
		}
		var s = this._Root + mark + pp;
		return s;
	};
	this.AddParameter = function (paraName, paraValue, notEncode) {
		var p = paraName.toUpperCase().trim();
		this._Paras[p] = notEncode ? paraValue : encodeURIComponent(paraValue);
		return this.GetUrl();
	};
	this.RemoveParameter = function (paraName) {
		var p = paraName.toUpperCase().trim();
		this._Paras[p] = null;
		return this.GetUrl();
	};
	this.RemoveEwa = function () {
		for ( var n in this._Paras) {
			if (n.toUpperCase() == "XMLNAME" || n.toUpperCase() == "ITEMNAME" || n.toUpperCase().indexOf('EWA_') == 0) {
				this.RemoveParameter(n);
			}
		}
	}
	this.SetUrl(url || document.location.href);
}
// 由于app会出现畸形参数，因此需要处理
function $U(islower) {
	var u1 = new EWA_UrlClass();
	// 去除EWA参数
	u1.RemoveEwa();
	var ss = [];
	for ( var n in u1._Paras) {
		var v = u1._Paras[n];
		if (islower) {
			n = n.toLowerCase();
		}
		if (v != null) {
			if (v.indexOf('#') > 0) {
				v = v.split('#')[0];
			}
			ss.push(n + "=" + v);
		}
	}
	return ss.join('&');
}
/**
 * 改写错误提示信息
 * 
 * @param obj
 * @param errorInfo
 */
function EWA_FrameShowAlert(obj, errorInfo) {
	if (obj.getAttribute("show_alert") == 1) {
		return;
	}
	obj.setAttribute("show_alert", 1);
	var o1 = obj;
	do {
		o1 = o1.parentNode;
		if (o1.tagName == 'BODY') {
			o1 = null;
			break;
		}
	} while (!(o1.tagName == 'TR' && o1.getAttribute("SHOW_MSG") == 1));
	if (!o1) {
		var o = $(obj);
		o.attr("ori_bc", o.css('background-color'));
		o.css('background-color', 'pink');
		obj.focus();
		return;
	}

	var colSpan = 0;
	for (var i = 0; i < o1.cells.length; i++) {
		var td = o1.cells[i];
		if (td.style.display == 'none') {
			continue;
		}
		colSpan += td.colSpan;
	}

	var curTr = $(o1);
	var errTr = curTr.next();
	if (!errTr.attr('error')) {
		var tr = o1.parentNode.insertRow(o1.rowIndex + 1);
		tr.setAttribute('error', 1);
		var td = tr.insertCell(-1);
		td.colSpan = colSpan;
		td.className = 'ewa-tip-error';
		errTr = $(tr);
		td.innerHTML = '<div class="ewa-tip-error-info"></div>';
	}
	curTr.find('td').addClass('ewa-tip-error');
	errTr.find('.ewa-tip-error-info').html(errorInfo);

}
function EWA_FrameRemoveAlert(obj) {
	if (obj.getAttribute("show_alert") != 1) {
		return;
	}
	obj.setAttribute("show_alert", 0);

	var o1 = obj;
	do {
		o1 = o1.parentNode;
		if (o1.tagName == 'BODY') {
			o1 = null;
			break;
		}
	} while (!(o1.tagName == 'TR' && o1.getAttribute("SHOW_MSG") == 1));
	if (!o1) {
		var o = $(obj);
		o.css('background-color', o.attr('ori_bc'));
		return;
	}
	var curTr = $(o1);
	curTr.find('td').removeClass('ewa-tip-error');
	var errTr = curTr.next();
	if (errTr.attr('error')) {
		errTr.remove();
	}
}
