/*!
 * Easy Web Application js lib
 * guolei 
 * https://gdxsoft.com/
 * https://github.com/gdx1231/emp-script-static
 */
window.EWA = window.EWA || {
	VERSION: '1.1.8',
	/** 版本 */
	LANG: 'zhcn',
	/** 当前语言代码 */
	SHOW_ERROR: true // 是否提示执行错误
};
if (!EWA["CP"]) {
	EWA.__p = window.location.pathname;
	EWA.__inc = 0;
	while (EWA.__p.indexOf('//') == 0) {
		EWA.__p = EWA.__p.replace('//', '/');
		EWA.__inc++;

		if (EWA.__inc > 100) {
			break;
		}
	}
	/** EWA的根目录 */
	EWA["CP"] = "/" + EWA.__p.split('/')[1] + "/";
}
var userAgent = window.navigator.userAgent.toLowerCase();
/**
 * 浏览器类型
 */
EWA.B = {
	VERSION: (userAgent.match(/.+(?:rv|it|ra|ie)[\/: ]([\d.]+)/) || [])[1],
	SAFAIR: /webkit/.test(userAgent),
	OPERA: /opera/.test(userAgent),
	IE: (/msie/.test(userAgent) || /traaaaaident/.test(userAgent)) && !/opera/.test(userAgent),
	MOZILLA: /mozilla/.test(userAgent) && !/(compatible|webkit)/.test(userAgent),
	GOOGLE: /chrome/.test(userAgent),
	PAD: /ipad|iphone|android|mobile/.test(userAgent),
	IS_ANDROID: /android/.test(userAgent)
};

var EWA_Utils = {};

/**
 * 公共工具 COMMON
 */
EWA["C"] = {
	Utils: EWA_Utils, /* 工具 */
	Ajax: EWA_AjaxClass, /* AJAX */
	Xml: EWA_XmlClass, /* XML */
	Url: EWA_UrlClass
	/* URL工具 */
};

/**
 * 显示图片
 * 
 * @param {Object}
 *            obj
 */
EWA_Utils.ShowPic = function(obj) {
	var u = obj.src;
	if (u.indexOf('pic_no.jpg') > 0) {
		return;
	}
	if (u.indexOf('$resized/') > 0) {
		var loc = u.indexOf('$resized/');
		u = u.substring(0, loc);
	} else {
		u = u.replace("_SMAILL.", ".");
		u = u.replace("small", "a");
	}
	window.open(u);
};
/**
 * 显示背景图片
 */
EWA_Utils.ShowBgPic = function(obj) {
	var u = $(obj).css('background-image');
	if (!u) {
		return;
	}
	u = u.slice(4, u.length - 1); // url("aaa/bbb/ccc.png")
	if (u.startsWith('"') || u.startsWith("'")) { // chrome 50+
		u = u.slice(1, u.length - 1);
	}
	if (u.indexOf('pic_no.jpg') > 0 || u.indexOf('transparent.png') > 0) {
		return;
	}
	u = u.replace("_SMAILL.", ".").split('$resized')[0];
	u = u.replace("small", "a");
	window.open(u);
};
/**
 * 静态，执行命令
 * 
 * @param obj:
 *            如果类型为string,则执行，如果为HtmlObject, 则执行getAttribute("EWA_CMD")
 */
EWA_Utils.RunCmd = function(obj, msg) {
	// 执行命令
	var cmd = "";
	if (typeof obj == "string") {
		cmd = obj;
		// 当前消息
		EWA.LastMenuMsg = "";
	} else {
		cmd = obj.getAttribute("EWA_CMD");
		// 当前消息
		EWA.LastMenuMsg = GetInnerText(obj).trimEx();
	}
	if (cmd != null && cmd.trim().length > 0) {
		// try {
		eval(cmd);
		// }
		// catch (e) {
		// alert(e.name + ": " + e.description);
		// }
	}
}
/**
 * 静态，验证错误，重新刷新验证图片
 */
EWA_Utils.ReloadValidCodeImage = function() {
	var os = document.getElementsByTagName("IMG");
	for (var i = 0; i < os.length; i = i + 1) {
		var o = os[i];
		if (o.src.indexOf("/cgi-bin/_co_/") > 0) {
			o.src = o.src;
		}
	}
	alert(_EWA_EVENT_MSG["ValidCodeError"]);
}

/**
 * Register js from HTML and Js String
 * 
 * @param {}
 *            htmlAndJs
 */
EWA_Utils.JsRegisters = function(htmlAndJs) {
	var s1 = /<[\s]*?script[^>]*?>[\s\S]*?<[\s]*?\/[\s]*?script[\s]*?>/ig;
	var exp = /addEvent\([^\)]+\){1}/ig;
	var m = htmlAndJs.match(s1);
	if (m == null)
		return;
	var evts = [];
	for (var i = 0; i < m.length; i++) {
		var sss = m[i];
		sss = sss.replace(/<[\s]*?script[^>]*?>/ig, '');
		sss = sss.replace(/<[\s]*?\/[\s]*?script[\s]*?>/ig, '');
		sss = sss.trim();

		if (sss.length > 0) {
			try {
				EWA.C.Utils.JsRegister(sss);
			} catch (e) {
				alert(e);
			}
			try {
				var m1 = sss.match(exp);
				if (m1) {
					for (var ai = 0; ai < m1.length; ai++) {
						var mm = m1[ai].split(',');
						if (mm.length == 3) {
							var s = mm[2].replace(')', '');
							evts.push(s);
						}
					}
				}
			} catch (e) {
				console.log(sss);
			}
		} else {
			var o1 = document.createElement('div');
			o1.innerHTML = m[i];
			var src = o1.getElementsByTagName('script')[0].src;
			EWA_Utils.JsRegisterSrc(src, false);
		}
	}
	for (var i = 0; i < evts.length; i++) {
		if (evts[i].indexOf('function') >= 0) {
			continue;
		}
		try {
			eval(evts[i] + "()");
		} catch (e) {
			console.log(e);
		}
	}
};
/**
 * 通过 src 注册javascript
 * 
 * @param src
 *            script地址
 * @param onlyonce
 *            只注册一次
 */
EWA_Utils.JsRegisterSrc = function(src, onlyonce) {
	var hash = src.hashCode();
	var script_id = "ewa_js_register_" + hash;
	if (onlyonce && $X(script_id)) {
		// 注册过了
		return;
	}

	var oHead = document.getElementsByTagName('head')[0];
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
/**
 * Register js
 * 
 * @param {}
 *            js
 */
EWA_Utils.JsRegister = function(js) {
	// hash执行效率太慢，不适合
	// var hash = js.hashCode();
	// var script_id = "ewa_js_register_" + hash;
	// var obj = document.getElementById(script_id);
	// if (obj) {
	// obj.parentNode.removeChild(obj);
	// }
	var oHead = document.getElementsByTagName('head')[0];
	var oScript = document.createElement("script");
	oScript.type = "text/javascript";
	oScript.language = "javascript";
	// oScript.id = script_id;
	// console.log(js)
	try {
		oScript.text = js;
		oHead.appendChild(oScript);
	} catch (e) {
		alert(e);
	}

};
/**
 * 后加载背景图
 */
EWA_Utils.LazyBackgroundLoad = function(objs, checkHeight) {
	//var h = checkHeight
	//	|| ((document.compatMode == "CSS1Compat" ? document.documentElement.clientHeight + document.documentElement.scrollTop : document.body.clientHeight
	//		+ document.body.scrollTop) + 50);
	
	var h = checkHeight || $(window).height() + $(window).scrollTop() + 50;
	var objs1 = objs || $('.EWA_GRID_BG_IMG[is_lazy_load=true]');
	objs1.each(function() {
		var o = $(this);
		// console.log(h, o.offset().top);
		if (o.offset().top < h) {
			o.removeAttr('is_lazy_load');
			var src = o.attr('ori_src');
			o.css('background-image', 'url("' + src + '")');
		}
	});
};
EWA_Utils.ImageAdjust = function(img, maxWidth, maxHeight) {
	if (maxWidth == null || maxHeight == null) {
		return;
	}

	maxWidth = parseInt(maxWidth.replace('px', ''));
	maxHeight = parseInt(maxHeight.replace('px', ''));

	if (img == null || maxWidth <= 0 || maxHeight <= 0) {
		return;
	}
	if (isNaN(maxWidth) && isNaN(maxHeight)) {
		return;
	}
	if (isNaN(maxWidth)) {
		img.height = maxHeight;
		return;
	}
	if (isNaN(maxHeight)) {
		img.width = maxWidth;
		return;
	}
	var w = img.width;
	var h = img.height;
	// alert(img+','+ w+',' + h)
	if (w == 0 || h == 0) {
		return;
	}
	var blw = maxWidth / w;
	var blh = maxHeight / h;

	if (blw > blh) {
		w = w * blh;
		h = h * blh;
	} else {
		w = w * blw;
		h = h * blw;
	}

	if (w > 0 && h > 0) {
		img.width = w;
		img.height = h;
	}
};
/**
 * 创建临时编号
 */
EWA_Utils.tempId = function(prefix) {
	if (!this.__TMPIDS) {
		this.__TMPIDS = {};
	}
	var id;
	var p = prefix || "__ewatmpid__";
	for (var i = 0; i < 1000; i++) {
		id = p + Math.random();
		id = id.replace(".", "GdX");
		if (!this.__TMPIDS[id]) {
			this.__TMPIDS[id] = 1;
			return id;
		}
	}
	id = p + "执行1000次重复的编号";
	console.log("执行1000次重复的编号");
	return id;
};
/**
 * 选择源对象下的对象，并根据属性值返回对象列表
 * 
 * @param {DOMElement}
 *            sourceObj 源对象
 * @param {String}
 *            findTagName 要查找的子对象的TagName
 * @param {String}
 *            findAttribute 属性
 * @param {String}
 *            findValue 属性值
 * @return {Array} 对象列表
 */
function $F(sourceObj, findTagName, findAttribute, findValue) {
	var objs = sourceObj.getElementsByTagName(findTagName);
	var arr = [];
	var fvs = findValue.toUpperCase().trim().split(",")
	for (var i = 0; i < objs.length; i++) {
		var o = objs[i];
		var fa = o.getAttribute(findAttribute);
		if (fa == null || fa == '') {
			continue;
		}
		fa = fa.toUpperCase();
		for (var k = 0; k < fvs.length; k++) {
			if (fa == fvs[k]) {
				arr.push(o);
			}
		}
	}
	return arr;
}
/**
 * 将json数组返回为MAP对象
 * 
 * @param {Object}
 *            jsonArray
 * @param {String}
 *            idsExp
 * @param {String}
 *            splitExp
 * @return {TypeName}
 */
function $J2MAP(jsonArray, idsExp, splitExp) {
	var ids = idsExp.split(',');
	var _m = {};
	var _s = splitExp == null ? "," : splitExp;
	for (var i = 0; i < jsonArray.length; i++) {
		var _o = jsonArray[i];
		if (!_o) { // 对象不存在
			continue;
		}

		var id = [];
		for (var k = 0; k < ids.length; k++) {
			id.push(_o[ids[k]]);
		}
		_m[id.join(_s)] = _o;
	}
	return _m;
}
function $J2MAP1(jsonArray, idsExp, splitExp) {
	var ids = idsExp.split(',');
	var _m = {};
	var _s = splitExp == null ? "," : splitExp;
	for (var i = 0; i < jsonArray.length; i++) {
		var _o = jsonArray[i];
		if (!_o) { // 对象不存在
			continue;
		}
		var id = [];
		for (var k = 0; k < ids.length; k++) {
			var key = ids[k];
			var v = _o[key];
			id.push(v);
		}
		var key = id.join(_s);
		if (!_m[key]) {
			_m[key] = [];
		}
		_m[key].push(_o);
	}
	return _m;
}
function GetOuterHTML(obj) {
	if (obj.outerHTML) {
		return obj.outerHTML;
	}
	var attr;
	var attrs = obj.attributes;
	var s = []
	s.push("<" + obj.tagName.toLowerCase());
	for (var i = 0; i < attrs.length; i++) {
		attr = attrs[i];
		if (attr.specified) {
			var av = attr.value.replace(/"/ig, "&quot;")
			s.push(" " + attr.name + '="' + av + '"');
		}
	}
	var b = obj.innerHTML;
	if (b == null) {
		b = "";
	}
	s.push(">" + b + "</" + obj.tagName.toLowerCase() + ">");
	return s.join("");
}
function GetInnerText(obj) {
	return obj.innerText || obj.textContent || "";
}
function SetInnerText(obj, text) {
	if (EWA.B.IE) {
		obj.innerText = text;
	} else {
		obj.textContent = text;
	}
}
// firefox
if (typeof document.readyState == 'undefined') {
	EWA.B._T = window.setInterval(function() {
		if (EWA.CP) {
			window.clearInterval(EWA.B._T);
			document.readyState = 'complete';
		}
	}, 10);
}
/**
 * 获取当前页面的URL的参数
 * 
 * @return {String}
 */
function UrlParas() {
	var paras = GetUrlParas();
	var tmp = [];
	for (var n in paras) {
		var name = n.toUpperCase();
		if (name == 'XMLNAME' || name == 'ITEMNAME' || name.indexOf('EWA') >= 0) {
			continue;
		}
		tmp.push(n + '=' + paras[n]);
	}
	return tmp.join('&')
}
var $U = UrlParas;

/**
 * 根据(XMLNAME,ITEMNAME和参数)构造ewa_url
 * 
 * @param xmlname
 * @param itemname
 * @param parameters
 * @param isAppendUrlParas
 *            是否附加location参数(true/false)
 * @returns {String}
 */
function $U2(xmlname, itemname, parameters, isAppendUrlParas) {
	if (!xmlname || !itemname) {
		var msg = "xmlname and itemname not blank";
		alert(msg);
		return msg;
	}
	var u = EWA.CP + "/EWA_STYLE/cgi-bin/?xmlname=" + xmlname + "&itemname=" + itemname;
	if (parameters) {
		if (parameters.indexOf('&') == 0) {
			u += parameters;
		} else {
			u += "&" + parameters;
		}
	}
	if (isAppendUrlParas) {
		u += "&" + $U();
	}
	return u;
}
/**
 * 获取页面的URL的参数
 * 
 * @param {Boolean}
 *            isUpper 是否名称改为大写
 * @return {}
 */
function GetUrlParas(isUpper) {
	var paras = {};
	var s = window.location.href;
	var s2 = s.split('?');
	if (s2.length == 1) {
		return paras;
	}
	var ss = s2[1].split('&');
	var tmp = [];
	for (var i = 0; i < ss.length; i++) {
		var ss1 = ss[i].split('=');
		if (ss1.length == 1) {
			continue;
		}
		var name = ss1[0];
		if (isUpper) {
			name = name.toUpperCase();
		}
		paras[name] = ss1[1];
	}
	return paras;
}
function GetTopWin() {
	var w = window;
	var inc = 0;
	while (w != w.parent) {
		w = w.parent;
		if (inc > 20) {
			return null;
		}
		inc++;
	}
	return w;
}

function addEvent(obj, name, event) {
	if (obj.attachEvent) {
		obj.attachEvent('on' + name, event);
	} else {
		obj.addEventListener(name, event, false);
	}
}
function AddEvent(obj, name, event) {
	addEvent(obj, name, event);
}

// ----- String prototype -------

String.prototype.lTrim = function() {
	return this.replace(/(^\s*)/g, "");
};
String.prototype.rTrim = function() {
	return this.replace(/(\s*$)/g, "");
};

String.prototype.trimEx = function() {
	return this.trim().replace(/(^　*)|(　*$)/g, "");
};
if (!String.prototype.startsWith) {
	String.prototype.trim = function() {
		return this.replace(/(^\s*)|(\s*$)/g, "");
	};

	String.prototype.startsWith = function(s2) {
		var s1 = this;
		if (s2 == null) {
			return false;
		}
		if (s1.length < s2.length)
			return false;
		if (s1 == s2)
			return true;
		if (s1.substring(0, s2.length) == s2)
			return true;
		return false;
	};
	String.prototype.endsWith = function(s2) {
		var s1 = this;
		if (s2 == null) {
			return false;
		}
		if (s1.length < s2.length)
			return false;
		if (s1 == s2)
			return true;
		if (s1.substring(s1.length - s2.length) == s2)
			return true;
		return false;
	};
}
String.prototype.toURL = function() {
	return encodeURIComponent(this);
};
String.prototype.toInputValue = function() {
	if (this == null || this == '') {
		return this;
	}
	return this.replace(/\</ig, "&lt;").replace(/\>/ig, "&gt;").replace(/\"/ig, "&quot;");
};
String.prototype.unURL = function() {
	return decodeURIComponent(this);
};
String.prototype.toMoney = function() {
	var v = this;
	if (v == null || v == '') {
		return v;
	}
	var v1 = v * 1;
	if (isNaN(v1)) {
		return v1;
	}

	var v2 = v + ''
	var v3 = v2.split('.');
	var v4 = v3[0];
	if (v4 * 1 <= 999) {
		return v;
	}
	var s = v3.length == 2 ? '.' + v3[1] : '';
	var len = v4.length / 3
	for (var i = 0; i < len; i++) {
		var t0 = v4.substring(v4.length - 3);
		if (i > 0) {
			s = ',' + s;
		}
		s = t0 + s
		v4 = v4.substring(0, v4.length - 3);
	}
	if (v4.length > 0) {
		s = v4 + ',' + s;
	}

	return s;
};
/**
 * 获取字符串的hashcode
 */
String.prototype.hashCode = function() {
	var str = this;
	var h = 0;
	var len = str.length;
	var t = 2147483648;
	for (var i = 0; i < len; i++) {
		h = 31 * h + str.charCodeAt(i);
		if (h > 2147483647) {
			h %= t;// java int溢出则取模
		}
	}
	return h;
};
// 格式化数字为货币
Number.prototype.fm = function(places, symbol, thousand, decimal) {
	places = !isNaN(places = Math.abs(places)) ? places : 2;
	symbol = symbol !== undefined ? symbol : "";
	thousand = thousand || ",";
	decimal = decimal || ".";
	var number = this, negative = number < 0 ? "-" : "", i = parseInt(number = Math.abs(+number || 0).toFixed(places), 10) + "", j = (j = i.length) > 3 ? j % 3
		: 0;
	return symbol + negative + (j ? i.substr(0, j) + thousand : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousand)
		+ (places ? decimal + Math.abs(number - i).toFixed(places).slice(2) : "");
};
function $X(id) {
	return document.getElementById(id);
}
/**
 * 用户控件筛选条件
 */
function $XUC(id, ownId) {
	if (!ownId) {
		var o = $('input[ucid="' + id + '"]');
		if (o.length > 0) {
			return o[0];
		}
		o = $('select[ucid="' + id + '"]');
		if (o.length > 0) {
			return o[0];
		}
	} else {
		// ownid uc 的 sys_frame_unid,区分相同控件在同一页面
		var o = $('input[ucid="' + id + '"][ucuid="' + ownId + '"]');
		if (o.length > 0) {
			return o[0];
		}
		o = $('select[ucid="' + id + '"][ucuid="' + ownId + '"]');
		if (o.length > 0) {
			return o[0];
		}

	}
	return document.getElementById(id);

}
function $N(name) {
	return document.getElementsByName(name);
}
function $T(tagName, obj) {
	if (obj == null) {
		obj = document;
	}
	return obj.getElementsByTagName(tagName);
}

function T$(tagName, obj) {
	return $T(tagName, obj);
}

/**
 * 后加载googlemap js
 * 
 * @param callAfter
 */
function $GMap(callAfter) {
	if (callAfter == null || !(callAfter instanceof Function)) {
		alert('需要传统加载完成调用方法');
		return;
	}
	if (window.google) {
		callAfter();
		return;
	}
	if (!EWA._____set_google_map) {
		setTimeout(function() {
			var s = document.createElement('script');
			if (EWA.RV_STATIC_PATH) {
				s.src = EWA.RV_STATIC_PATH + "/EWA_STYLE/js/js_jquery/EWA_GOOGLE_MAP.js";
			} else {
				s.src = "/EmpScriptV2/EWA_STYLE/js/js_jquery/EWA_GOOGLE_MAP.js";
			}
			document.body.appendChild(s);
		}, 123);
		EWA._____set_google_map = true;
	}
	setTimeout(function() {
		$GMap(callAfter);
	}, 100);
}
/**
 * 执行select 的 onchange
 */
function $JS_RUN_CHANGE(obj) {
	if (obj && obj.onchange) {
		var s = obj.onchange.toString();
		var idx0 = s.indexOf('{');
		var idx1 = s.lastIndexOf('}');
		var ss = s.substring(idx0 + 1, idx1);

		// 创建全局变量名称，避免在压缩js时候，obj名称被替换
		var name = "OBJ_" + Math.random();
		name = name.replace('.', 'GdX');
		window[name] = obj;
		ss = ss.replace(/this/ig, name);
		try {
			eval(ss);
		} catch (e) {
			console.log(ss);
			document.title = e;
		}
		window[name] = null;
		delete window[name];
	}
}
/**
 * Ajax类
 */
function EWA_AjaxClass(isAsync) {
	this._Http = null;
	this.ResutValue = null;
	this._WaittingId = "EWA_AJAX_WAITING";
	this.LoadingType = "text";
	this._Parameters = {};
	this._ParentId = null;
	this.IsShowWaitting = true; // 是否显示等待信息
	this._RunEndTime = null;
	this._IsAsync = isAsync; // 是否同步请求
	if (this._IsAsync) {
		this._IsAsync = true;
	} else {
		this._IsAsync = false;
	}
	/**
	 * 显示等待图标/文字
	 */
	this._ShowWaitting = function() {
		if (!this.IsShowWaitting) {
			return;
		}
		var o1 = document.getElementById(this._WaittingId);
		if (o1 == null) {
			if (this.LoadingType.trim().toLowerCase() == "text") {
				this._CreateWaittingText();
			}
			if (this.LoadingType.trim().toLowerCase() == "image") {
				this._CreateWaittingImg();
			}
		} else {
			o1.style.display = "";
		}
		o1 = null;
	};

	/**
	 * 生成等待文字提示
	 */
	this._CreateWaittingText = function() {
		var o1 = document.createElement("DIV");
		o1.id = this._WaittingId;
		o1.innerHTML = "Waiting...";
		document.body.appendChild(o1);
		o1.className = 'ewa-wait-txt';
		o1 = null;
	};
	/**
	 * 生成等待图示
	 */
	this._CreateWaittingImg = function() {
		var o1 = document.createElement("TABLE");
		o1.id = this._WaittingId;
		var tr = o1.insertRow(-1);
		var td = tr.insertCell(-1);
		td.align = "center";
		td.innerHTML = "<img src='" + this._getLoaddingImg() + "'>";
		document.body.appendChild(o1);
		o1.className = 'ewa-wait-img';
		o1 = td = tr = null;
	};
	/**
	 * 隐藏等待
	 */
	this.HiddenWaitting = function() {
		var o1 = document.getElementById(this._WaittingId);
		if (o1 != null) {
			o1.style.display = "none";
		}
		o1 = null;
	};
	/**
	 * 初始化Ajax对象
	 */
	this._InitHttp = function() {
		if (!window.XMLHttpRequest) {// ie
			this._Http = new ActiveXObject("Microsoft.XMLHTTP");
		} else {
			this._Http = new XMLHttpRequest();
		}
		if (window._EWA_AJAX_LIST == null || window._EWA_AJAX_LIST.length > 200) {
			window._EWA_AJAX_LIST = [];
		}
		window._EWA_AJAX_LIST.push(this);
	};
	/**
	 * 获取数据Get模式
	 * 
	 * @param {String}
	 *            url 地址
	 * @param {Function}
	 *            Callback 回调方法
	 */
	this.Get = function(url, Callback) {
		if (url == null) {
			console.log('ajax url not null');
			return;
		}

		if (url.GetUrl) {
			url = url.GetUrl();
		} else if (url.getUrl) {
			url = url.getUrl();
		} else if (url.href) {
			url = url.href;
		}
		if (url.indexOf('|') >= 0) {
			url = url.replace(/\|/ig, '%7c');
		}

		this._Http.onreadystatechange = Callback;
		if (url.endsWith(".txt") || url.endsWith(".TXT")) {

		} else {
			if (url.indexOf("?") > 0) {
				url = url + "&___R=" + Math.random();
			} else {
				url = url + "?___R=" + Math.random();
			}
		}
		url = url.replace('&&', '&');
		url = url.replace('?&', '?');
		if (EWA.B.IE == false) {
			this._Http.open("GET", url, !this._IsAsync);
			this._Http.send(null);
		} else {// ie
			this._Http.open("GET", url, !this._IsAsync);
			this._Http.send();
		}
		if (!this._IsAsync) {
			this._ShowWaitting();
		}
	};
	/**
	 * 获取数据 Post 模式
	 * 
	 * @param {Object}
	 *            url 地址
	 * @param {Object}
	 *            sinfo 参数
	 * @param {Object}
	 *            callback 回调方法
	 */
	this.Post = function(url, sinfo, callback) {
		if (url == null) {
			console.log('ajax url not null');
			return;
		}
		if (url.GetUrl) {
			url = url.GetUrl();
		} else if (url.getUrl) {
			url = url.getUrl();
		} else if (url.href) {
			url = url.href;
		}
		if (url.indexOf('|') >= 0) {
			url = url.replace(/\|/ig, '%7c');
		}

		this._ShowWaitting();
		if (callback != null) {
			this._Http.onreadystatechange = callback;
		}

		url = url.replace('&&', '&');
		url = url.replace('?&', '?');

		this._Http.open("POST", url, !this._IsAsync);
		this._Http.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		this._Http.send(sinfo);
		if (!this._IsAsync) {
			this._ShowWaitting();
		}
	};
	/**
	 * 获取数据 Post模式
	 * 
	 * @param {Object}
	 *            url 地址
	 * @param {Object}
	 *            callback 回调方法
	 */
	this.PostNew = function(url, callback) {
		var s = [];
		for (var n in this._Parameters) {
			var v = this._Parameters[n];
			if (v == null) {
				continue;
			}
			s.push(n + '=' + v);
		}
		this.Post(url, s.join('&'), callback);
	};
	/**
	 * 获取返回数据
	 */
	this.GetReturnValue = function() {
		return this._Http.responseText;
	};
	/**
	 * 增加参数
	 * 
	 * @param {String}
	 *            name 参数名称
	 * @param {String}
	 *            val 参数值
	 */
	this.AddParameter = function(name, val, notEncode) {
		this._Parameters[name] = (notEncode ? val : encodeURIComponent(val));
	};
	this._InitHttp();

	this._getLoaddingImg = function() {
		return (EWA.RV_STATIC_PATH || "/EmpScriptV2") + "/EWA_STYLE/images/loading4.gif";
	}
	/**
	 * 安装对象
	 * 
	 * @param {}
	 *            url
	 * @param {}
	 *            parameters
	 * @param {}
	 *            对象的Id 或 对象 parentId
	 */
	this.Install = function(url, parameters, parentId, afterJs, notShowWaitting) {
		var _ajax_gdx = this;
		var obj = (typeof parentId == 'string') ? document.getElementById(parentId) : parentId;
		if (obj == null) {
			alert('Object [' + parentId + '] not found');
			return;
		}
		var parent = $(obj);
		var oldPosition = null;
		if (!notShowWaitting) {// 不显示等待图标
			oldPosition = parent.css('position');
			if ('static' == oldPosition) {
				parent.css('position', 'relative');
			}
			var loadding = "<div class='ewa-ajax-install-waitting'></div>";
			parent.append(loadding);
		}

		this.Post(url, parameters, function() {
			if (!_ajax_gdx.IsRunEnd()) {
				return;
			}
			if ('static' == oldPosition) {
				parent.css('position', oldPosition);
			}
			var rst = _ajax_gdx.GetRst();
			if (_ajax_gdx.IsError()) {
				$(obj)[0].innerHTML = rst;
			} else {
				// $(obj).html(rst); 会注册js，从而造成脚本重复注册
				// EWA.C.Utils.JsRegisters 会处理 addEvent事件，因此不能用jq的html
				$(obj)[0].innerHTML = rst;
				try {
					EWA.C.Utils.JsRegisters(rst);
				} catch (e) {
					console.log(e);
				}
			}
			if (afterJs != null) {
				afterJs(url, parameters, parentId, rst);
			}
		});
		this.HiddenWaitting();
	}
	/**
	 * 执行完毕
	 * 
	 * @return {Boolean}
	 */
	this.IsRunEnd = function() {
		if (this._Http.readyState != 4) {
			return false;
		} else {
			this.HiddenWaitting();
			if (!this._RunEndTime) {
				var d = new Date();
				this._RunEndTime = d.getTime();
			}
			// 清除对象，避免内存溢出
			window.setTimeout(function() {
				for (var i = window._EWA_AJAX_LIST.length - 1; i >= 0; i--) {
					var a = window._EWA_AJAX_LIST[i];
					if (a == null) {
						continue;
					}
					if (a.GetEndPastTime() > 1231) {
						try {
							a.Dispose();
						} catch (e) {

						}
						window._EWA_AJAX_LIST[i] = null;
						a = null;
					}
				}
			}, 1);
			return true;
		}
	}
	this.Dispose = function() {
		this._Http = null;
	}
	/**
	 * 获取执行完成过去的时间
	 * 
	 * @return {}
	 */
	this.GetEndPastTime = function() {
		if (!this._RunEndTime) {
			return -1;
		} else {
			var d = new Date();
			return d.getTime() - this._RunEndTime;
		}
	}
	/**
	 * 执行错误
	 * 
	 * @return {Boolean}
	 */
	this.IsError = function() {
		if (this._Http.status == 200) {
			return false;
		} else {
			return true;
		}
	}
	/**
	 * 返回结果，如果正确返回相应结果，否则返回错误信息
	 * 
	 * @return {}
	 */
	this.GetRst = function() {
		if (!this.IsRunEnd()) {
			return null;
		} else {
			if (!this.IsError()) {
				return this._Http.responseText;
			} else {
				return this._Http.statusText;
			}
		}
	}
}

/**
 * 同步获取JSON
 * 
 * @param {String}
 *            url 地址
 * @param {Object}
 *            func 方法、对象ID或对象
 */
function $JA(url, func) {
	var ajax = new EWA_AjaxClass(true); // true表示同步获取
	var cmds = []; // 附加的参数
	for (var i = 2; i < arguments.length; i++) {
		cmds.push(arguments[i]);
	}
	ajax.Get(url, function() {
		_$J_HandleRst(ajax, func, cmds, true); // true表示json
	});
	return ajax;
}

/**
 * 同步获取Html
 * 
 * @param {String}
 *            url 地址
 * @param {Object}
 *            func 方法、对象ID或对象
 */
function $J2A(url, func) {
	var ajax = new EWA_AjaxClass(true); // true表示同步获取
	var cmds = []; // 附加的参数
	for (var i = 2; i < arguments.length; i++) {
		cmds.push(arguments[i]);
	}
	ajax.Get(url, function() {
		_$J_HandleRst(ajax, func, cmds, false); // false表示html
	});
	return ajax;
}

/**
 * Post方式请求
 * 
 * @param url
 * @param postData
 * @param func
 * @returns {EWA_AjaxClass}
 */
function $JPA(url, postData, func) {
	var ajax = new EWA_AjaxClass(true);
	var cmds = []; // 附加的参数
	for (var i = 3; i < arguments.length; i++) {
		cmds.push(arguments[i]);
	}
	if (postData) {
		for (var n in postData) {
			ajax.AddParameter(n, postData[n]);
		}
	}
	ajax.PostNew(url, function() {
		_$J_HandleRst(ajax, func, cmds, true);
	});
	return ajax;
}

/**
 * 异步获取JSON
 * 
 * @param {String}
 *            url 地址
 * @param {Object}
 *            func 方法、对象ID或对象
 */
function $J(url, func) {
	"use strict";
	var cmds = []; // 附加的参数
	for (var i = 2; i < arguments.length; i++) {
		cmds.push(arguments[i]);
	}
	return __$J(false, url, func, cmds, true);
}

/**
 * 异步获取JSON，不显示等待框
 * 
 * @param url
 * @param func
 */
function $J1(url, func) {
	"use strict";
	var cmds = []; // 附加的参数
	for (var i = 2; i < arguments.length; i++) {
		cmds.push(arguments[i]);
	}
	return __$J(false, url, func, cmds, true, true);

}

/**
 * 执行Ajax调用，返回值不进行Json反射，直接传到指定的Function
 * 
 * @param {}
 *            url
 * @param {}
 *            func
 * @return {}
 */
function $J2(url, func) {
	"use strict";
	var cmds = []; // 附加的参数
	for (var i = 2; i < arguments.length; i++) {
		cmds.push(arguments[i]);
	}
	return __$J(false, url, func, cmds, false, false);
}
/**
 * 不显示等待框 执行Ajax调用，返回值不进行Json反射，直接传到指定的Function
 * 
 * @param url
 * @param func
 * @returns
 */
function $J3(url, func) {
	"use strict";
	var cmds = []; // 附加的参数
	for (var i = 2; i < arguments.length; i++) {
		cmds.push(arguments[i]);
	}
	return __$J(false, url, func, cmds, false, true);
}
/**
 * Post方式请求，返回JSON，不显示等待框
 * 
 * @param url
 * @param postData
 * @param func
 */
function $JP1(url, postData, func, arg0, arg1, arg2, arg3, arg4, arg5) {
	"use strict";
	var ajax = $JP(url, postData, func, arg0, arg1, arg2, arg3, arg4, arg5);
	ajax.HiddenWaitting();
}
/**
 * Post方式请求，返回JSON
 * 
 * @param url
 * @param postData
 * @param func
 * @returns {EWA_AjaxClass}
 */
function $JP(url, postData, func) {
	"use strict";
	var ajax = new EWA_AjaxClass();
	var cmds = []; // 附加的参数
	for (var i = 3; i < arguments.length; i++) {
		cmds.push(arguments[i]);
	}
	if (postData) {
		for (var n in postData) {
			ajax.AddParameter(n, postData[n]);
		}
	}
	ajax.PostNew(url, function() {
		_$J_HandleRst(ajax, func, cmds, true);
	});
	return ajax;
}
/**
 * 执行Ajax调用，返回值不进行Json反射，直接传到指定的Function
 */
function $JP2(url, postData, func) {
	"use strict";
	var ajax = new EWA_AjaxClass();
	var cmds = []; // 附加的参数
	for (var i = 2; i < arguments.length; i++) {
		cmds.push(arguments[i]);
	}
	if (postData) {
		for (var n in postData) {
			ajax.AddParameter(n, postData[n]);
		}
	}
	ajax.PostNew(url, function() {
		_$J_HandleRst(ajax, func, cmds, false);
	});
	return ajax;
}
/**
 * Ajax调用方式
 * 
 * @param isAsync
 *            是否同步
 * @param url
 *            网址
 * @param func
 *            回调方法
 * @param cmds
 *            附加参数
 * @param isJson
 *            是否为JSON
 * @param disableWaitMsg
 *            禁止显示等待框
 * @returns {EWA_AjaxClass}
 */
function __$J(isAsync, url, func, cmds, isJson, disableWaitMsg) {
	var ajax = new EWA_AjaxClass(isAsync);
	ajax.Get(url, function() {
		_$J_HandleRst(ajax, func, cmds, isJson);
	});
	if (disableWaitMsg) {
		ajax.HiddenWaitting();
	}
	return ajax;
}
/**
 * 处理Ajax过程
 * 
 * @param ajax
 * @param func
 * @param cmds
 * @param isJson
 */
function _$J_HandleRst(ajax, func, cmds, isJson) {
	if (!ajax.IsRunEnd()) {
		return;
	}
	if (ajax.IsError()) {
		if (window.EWA_AjaxErr) {
			window.EWA_AjaxErr(ajax.GetRst());
		} else {
			console.error(ajax.GetRst());
		}
		return;
	}
	var z = ajax.GetRst();
	if (isJson) {
		try {
			//z = eval('var _zz=' + z + '; _zz');
			z = JSON.parse(z);
		} catch (e) {
			console.error("_$J_HandleRst-JSON" + e);
			return;
		}
	}
	if (func == null) {
		alert('对象没有发现');
		return;
	}

	if (func instanceof Function || typeof func == 'function') {// 调用用户的方法
		func(z, cmds);
		return;
	} else if (typeof func == 'string') { // 对象的ID
		func = $X(func);
	} else if (func.tagName == 'SELECT') { // SELECT生成OPTION
		if (!isJson) {
			alert('SELECT需要映射为JSON');
			return;
		}
		if (cmds.length < 2) {
			alert('参数不足，需要textName,valueName的定义');
			return;
		}
		var t = cmds[0];
		var v = cmds[1];
		var b = true;
		if (cmds.length > 2) {
			b = cmds[2];
		}
		var iv = '';
		if (cmds.length > 3) {
			iv = cmds[3];
		}
		var funcCallBack = null;
		if (cmds.length > 4) {
			funcCallBack = cmds[4];
		}
		_$J_SELECT(z, func, t, v, b, iv, funcCallBack);
		return;
	} else {
		console.log('not define callback');
	}
}
/**
 * 添加SELECT的OPTIONS
 * 
 * @param {}
 *            data
 * @param {nsIDomElement}
 *            obj
 * @param {String}
 *            textName Option的TEXT对应的属性名称
 * @param {String}
 *            valueName Option的VALUE对应的属性名称
 * @param {Boolean}
 *            isAddBlank 是否增加空行（第一行)
 * @param {String}
 *            initValue 初始化值
 * @param {String}
 *            funcCallBack 回调函数
 * @param {String}
 *            父节点字段名称
 */
function _$J_SELECT(data, obj, textName, valueName, isAddBlank, initValue, funcCallBack, parentKeyName) {
	"use strict";
	obj.options.length = 0;
	if (isAddBlank) {
		obj.options[0] = new Option('', '');
		if (isAddBlank instanceof Array) {
			obj.options[0].text = isAddBlank[0];
			obj.options[0].value = isAddBlank[1];
		}
	}

	function getText(d, textName) {
		if (!textName) {
			return "not defined textName";
		}
		if (textName instanceof Function) {
			return textName[d];
		}
		if (textName.indexOf("@@") == -1) {
			return d[textName];
		}
		// textName="@@id3 (@@id4)"
		let r1 = /\@\@[a-zA-Z0-9\-\._:]*\b/ig;
		let m1 = textName.match(r1);
		let tmp_html = textName;

		for (let i = 0; i < m1.length; i++) {
			let key = m1[i];
			let id = key.replace('@@', '');
			let rep = d[id] || "";
			tmp_html = tmp_html.replace(key, rep);
		}

		return tmp_html;
	}

	function addOpt(d, lvl) {
		var optText = getText(d, textName); // d[textName];
		var optValue = d[valueName];
		var opt = obj.options[obj.options.length] = new Option(optText, optValue);

		if (lvl) {
			var spaces = [];
			for (var i = 0; i < lvl; i++) {
				spaces.push("");
			}
			spaces.push(optText);
			optText = spaces.join("　");
		}
		for (var n in d) {
			if (d[n]) {
				opt.setAttribute("para_" + n.toLowerCase(), d[n]);
			}
		}
		opt.setAttribute('json', JSON.stringify(d));
		return opt;
	}

	if (parentKeyName) {
		// 按照parent排序
		var map = {
			"___ROOT___": []
		};
		var map1 = {
			"___ROOT___": {}
		};
		var pkey, key, d;
		for (var i = 0; i < data.length; i++) {
			d = data[i];
			pkey = d[parentKeyName];
			key = d[valueName];
			if (pkey === null || pkey === "" || pkey === "0") {
				pkey = "___ROOT___";
			}
			if (!map[pkey]) {
				map[pkey] = [];
			}
			map[pkey].push(d);
			map1[key] = d;
			if (map1[pkey]) {
				if (!map1[pkey]._children) {
					map1[pkey]._children = [];
				}
				map1[pkey]._children.push(d);
			}
		}

		// 递归添加option
		function reverse(pkey, lvl) {
			var pNode = map[pkey];
			if (!pNode || !pNode._children || pNode._children.length == 0) {
				return;
			}
			var d;
			for (var i = 0; i < pNode._children.length; i++) {
				d = pNode._children[i];
				addOpt(d, lvl);
				reverse(d[valueName], lvl + 1);
			}
		}

		reverse("___ROOT___", 0);

	} else {
		for (var i = 0; i < data.length; i++) {
			var d = data[i];
			addOpt(d);
		}
	}
	if (initValue) {
		obj.value = initValue;
	}
	// 触发select的onchange事件
	$(obj).trigger('change');
	if (funcCallBack) {// 执行完调用的方法
		funcCallBack(obj);
	}
};
$Install = function(url, pid, func, notShowWaitting) {
	if (url.GetUrl) {
		url = url.GetUrl();
	} else if (url.getUrl) {
		url = url.getUrl();
	} else if (url.href) {
		url = url.href;
	}
	var u1 = new EWA_UrlClass();
	u1.SetUrl(url);

	if (!u1.GetParameter("EWA_AJAX")) {
		u1.AddParameter("EWA_AJAX", "INSTALL");
	}
	var ajax = new EWA_AjaxClass();
	ajax.Install(u1.GetUrl(), "", pid, func, notShowWaitting);
};function EWA_JSONXmlClass() {
	this._JSon = new EWA_JSONClass();
	this.toJSON = function(xmlNode) {
		return this.createNode(xmlNode);
	}
	this.createNode = function(node) {
		var s = [];
		s.push(this._JSon.ToJSONString(node.tagName));
		s.push(": {");
		for (var i = 0; i < node.attributes.length; i++) {
			var att = node.attributes[i];
			var s1 = this.createAttribute(att);
			if (i > 0) {
				s.push(",")
			}
			s.push(s1)
		}

		for (var i = 0; i < node.childNodes.length; i++) {
			if (i > 0 || node.attributes.length > 0)
				s.push(",\r\n");
			s.push(this.createNode(node.childNodes[i]));
		}

		s.push("}");

		return s.join(" ");
	}
	this.createAttribute = function(att) {
		var s = [];
		s.push(this._JSon.ToJSONString(att.name));
		s.push(":");
		s.push(this._JSon.ToJSONString(att.value));
		return s.join(" ");
	}
}

function EWA_JSONClass() {
	this._Escapeable = /["\\\x00-\x1f\x7f-\x9f]/g;
	this._Meta = {
		'\b' : '\\b',
		'\t' : '\\t',
		'\n' : '\\n',
		'\f' : '\\f',
		'\r' : '\\r',
		'"' : '\\"',
		'\\' : '\\\\'
	};
	this.ToJSONDate = function(date) {
		if (date == null) {
			return 'null';
		}
		return date.getUTCFullYear() + '-' + f(date.getUTCMonth() + 1) + '-' + f(date.getUTCDate()) + 'T' + f(date.getUTCHours())
			+ ':' + f(date.getUTCMinutes()) + ':' + f(date.getUTCSeconds()) + 'Z';

	};
	this.ToJSONString = function(s) {
		var s1;
		if (this._Escapeable.test(s)) {
			s1 = s.replace(escapeable, function(a) {
				var c = meta[a];
				if (typeof c === 'string') {
					return c;
				}
				c = a.charCodeAt();
				return '\\u00' + Math.floor(c / 16).toString(16) + (c % 16).toString(16);
			})
		} else {
			s1 = s;
		}
		s1 = '"' + s1 + '"';
		return s1;
	};
	this.ToJSONArray = function(arr) {
		var length = arr.length;
		var s = [];
		for (var i = 0; i < length; i += 1) {
			s[i] = this.ToJSON(arr[i]);
		}
		var v = s.length === 0 ? '[]' : '[' + s.join(', ') + ']';
		return v;
	};
	this.ToJSONObject = function(obj) {
		var key, val, s = [];
		for (key in obj) {
			val = obj[key];
			if (key == 'parent' || key.substring(0, 1) == "_" || val == null || val instanceof Function) {
				continue;
			}
			var s0 = this.ToJSONString(key) + ": ";
			var t1 = typeof val;
			if (t1 === 'string' || t1 === 'number' || t1 === 'boolean' || val instanceof Date) {
				s.push(s0 + this.ToJSON(val));
			} else if (t1 === 'object') {
				s.push(s0 + this.ToJSON(val));
			}
		}
		return s.length === 0 ? "{}" : "{" + s.join(', ') + "}";
	}
	this.ToJSON = function(obj) {
		var t = typeof obj;
		if (obj instanceof Date) {
			return this.ToJSONDate(obj);
		} else if (t === 'string') {
			return this.ToJSONString(obj);
		} else if (t === 'number') {
			return isFinite(obj) ? String(obj) : 'null';
		} else if (t === 'boolean' || t === 'null') {
			return String(obj);
		} else if (t === 'object') {
			if (typeof obj.length === 'number' && !obj.propertyIsEnumerable('length')) {
				return this.ToJSONArray(obj);
			} else {
				return this.ToJSONObject(obj);
			}
		}
	};

	this.Parse = function(str) {
		var o = eval('(' + str + ')');
		return o;
	};
}

JSON = window.JSON
	|| function() {

		function f(n) { // Format integers to have at least two digits.
			return n < 10 ? '0' + n : n;
		}

		Date.prototype.toJSON = function() {

			// Eventually, this method will be based on the date.toISOString
			// method.

			return this.getUTCFullYear() + '-' + f(this.getUTCMonth() + 1) + '-' + f(this.getUTCDate()) + 'T'
				+ f(this.getUTCHours()) + ':' + f(this.getUTCMinutes()) + ':' + f(this.getUTCSeconds()) + 'Z';
		};

		var escapeable = /["\\\x00-\x1f\x7f-\x9f]/g, gap, indent, meta = {
			'\b' : '\\b',
			'\t' : '\\t',
			'\n' : '\\n',
			'\f' : '\\f',
			'\r' : '\\r',
			'"' : '\\"',
			'\\' : '\\\\'
		}, rep;

		function quote(string) {
			return escapeable.test(string) ? '"' + string.replace(escapeable, function(a) {
				var c = meta[a];
				if (typeof c === 'string') {
					return c;
				}
				c = a.charCodeAt();
				return '\\u00' + Math.floor(c / 16).toString(16) + (c % 16).toString(16);
			}) + '"' : '"' + string + '"';
		}

		function str(key, holder) {
			var i, // The loop counter.
			k, // The member key.
			v, // The member value.
			length, mind = gap, partial, value = holder[key];

			if (value && typeof value === 'object' && typeof value.toJSON === 'function') {
				value = value.toJSON(key);
			}

			// If we were called with a replacer function, then call the
			// replacer to
			// obtain a replacement value.

			// if (typeof rep === 'function') {
			// value = rep.call(holder, key, value);
			// }

			// What happens next depends on the value's type.

			switch (typeof value) {
			case 'string':
				return quote(value);
			case 'number':
				return isFinite(value) ? String(value) : 'null';
			case 'boolean':
			case 'null':

				// If the value is a boolean or null, convert it to a
				// string. Note:
				// typeof null does not produce 'null'. The case is included
				// here in
				// the remote chance that this gets fixed someday.

				return String(value);

				// If the type is 'object', we might be dealing with an
				// object or an array or
				// null.

			case 'object':

				// Due to a specification blunder in ECMAScript, typeof null
				// is 'object',
				// so watch out for that case.

				if (!value) {
					return 'null';
				}

				// Make an array to hold the partial results of stringifying
				// this object value.

				gap += indent;
				partial = [];

				// If the object has a dontEnum length property, we'll treat
				// it as an array.

				if (typeof value.length === 'number' && !(value.propertyIsEnumerable('length'))) {

					// The object is an array. Stringify every element. Use
					// null as a placeholder
					// for non-JSON values.

					length = value.length;
					for (i = 0; i < length; i += 1) {
						partial[i] = str(i, value) || 'null';
					}

					// Join all of the elements together, separated with
					// commas, and wrap them in
					// brackets.

					v = partial.length === 0 ? '[]' : gap ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']' : '['
						+ partial.join(',') + ']';
					gap = mind;
					return v;
				}

				// If the replacer is an array, use it to select the members
				// to be stringified.

				if (typeof rep === 'object') {
					length = rep.length;
					for (i = 0; i < length; i += 1) {
						k = rep[i];
						if (typeof k === 'string') {
							v = str(k, value, rep);
							if (v) {
								partial.push(quote(k) + (gap ? ': ' : ':') + v);
							}
						}
					}
				} else {

					// Otherwise, iterate through all of the keys in the
					// object.

					for (k in value) {
						v = str(k, value, rep);
						if (v) {
							partial.push(quote(k) + (gap ? ': ' : ':') + v);
						}
					}
				}

				// Join all of the member texts together, separated with
				// commas,
				// and wrap them in braces.

				v = partial.length === 0 ? '{}' : gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}' : '{'
					+ partial.join(',') + '}';
				gap = mind;
				return v;
			}
		}

		// Return the JSON object containing the stringify, parse, and quote
		// methods.

		return {
			stringify : function(value, replacer, space) {

				// The stringify method takes a value and an optional
				// replacer,
				// and an optional
				// space parameter, and returns a JSON text. The replacer
				// can be
				// a function
				// that can replace values, or an array of strings that will
				// select the keys.
				// A default replacer method can be provided. Use of the
				// space
				// parameter can
				// produce text that is more easily readable.

				var i;
				gap = '';
				indent = '';
				if (space) {

					// If the space parameter is a number, make an indent
					// string
					// containing that
					// many spaces.

					if (typeof space === 'number') {
						for (i = 0; i < space; i += 1) {
							indent += ' ';
						}

						// If the space parameter is a string, it will be
						// used
						// as the indent string.

					} else if (typeof space === 'string') {
						indent = space;
					}
				}

				// If there is no replacer parameter, use the default
				// replacer.

				if (!replacer) {
					rep = function(key, value) {
						if (!Object.hasOwnProperty.call(this, key)) {
							return undefined;
						}
						return value;
					};

					// The replacer can be a function or an array.
					// Otherwise,
					// throw an error.

				} else if (typeof replacer === 'function'
					|| (typeof replacer === 'object' && typeof replacer.length === 'number')) {
					rep = replacer;
				} else {
					throw new Error('JSON.stringify');
				}

				// Make a fake root object containing our value under the
				// key of
				// ''.
				// Return the result of stringifying the value.

				return str('', {
					'' : value
				});
			},

			parse : function(text, reviver) {

				// The parse method takes a text and an optional reviver
				// function, and returns
				// a JavaScript value if the text is a valid JSON text.

				var j;

				function walk(holder, key) {

					// The walk method is used to recursively walk the
					// resulting
					// structure so
					// that modifications can be made.

					var k, v, value = holder[key];
					if (value && typeof value === 'object') {
						for (k in value) {
							if (Object.hasOwnProperty.call(value, k)) {
								v = walk(value, k);
								if (v !== undefined) {
									value[k] = v;
								} else {
									delete value[k];
								}
							}
						}
					}
					return reviver.call(holder, key, value);
				}

				// Parsing happens in three stages. In the first stage, we
				// run
				// the text against
				// regular expressions that look for non-JSON patterns. We
				// are
				// especially
				// concerned with '()' and 'new' because they can cause
				// invocation, and '='
				// because it can cause mutation. But just to be safe, we
				// want
				// to reject all
				// unexpected forms.

				// We split the first stage into 4 regexp operations in
				// order to
				// work around
				// crippling inefficiencies in IE's and Safari's regexp
				// engines.
				// First we
				// replace all backslash pairs with '@' (a non-JSON
				// character).
				// Second, we
				// replace all simple value tokens with ']' characters.
				// Third,
				// we delete all
				// open brackets that follow a colon or comma or that begin
				// the
				// text. Finally,
				// we look to see that the remaining characters are only
				// whitespace or ']' or
				// ',' or ':' or '{' or '}'. If that is so, then the text is
				// safe for eval.

				if (/^[\],:{}\s]*$/.test(text.replace(/\\["\\\/bfnrtu]/g, '@').replace(
					/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

					// In the second stage we use the eval function to
					// compile
					// the text into a
					// JavaScript structure. The '{' operator is subject to
					// a
					// syntactic ambiguity
					// in JavaScript: it can begin a block or an object
					// literal.
					// We wrap the text
					// in parens to eliminate the ambiguity.

					j = eval('(' + text + ')');

					// In the optional third stage, we recursively walk the
					// new
					// structure, passing
					// each name/value pair to a reviver function for
					// possible
					// transformation.

					return typeof reviver === 'function' ? walk({
						'' : j
					}, '') : j;
				}

				// If the text is not JSON parseable, then a SyntaxError is
				// thrown.

				throw new SyntaxError('JSON.parse');
			},

			quote : quote
		};
	}();
EWA.JSON = JSON;/**
 * 
 */
function EWA_DateClass(dateStr) {
	if (dateStr) {
		if (dateStr instanceof Date) {
			this._Date = dateStr; // 日期类型
		} else {
			this._Date = EWA_Utils.Date(dateStr)._Date; // 字符串
		}
	} else {
		this._Date = new Date();
	}
	this._Days = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];
	this.PastMilliseconds = function(dateClass1) {
		return dateClass1._Date - this._Date;
	};
	this.PastSeconds = function(dateClass1) {
		return this.PastMilliseconds(dateClass1) / 1000;
	};
	this.GetYear = function() {
		return this._Date.getFullYear();
	};
	this.GetMonth = function() {
		return this._Date.getMonth() + 1;
	};
	this.GetDay = function() {
		return this._Date.getDate();
	};
	this.GetBenYear = function() {
		var y = this.GetYear();
		var d1 = y + '-01-01';
		var d2 = y + '-12-31';
		return [ d1, d2 ];
	};
	this.GetBenMonth = function() {
		var y = this.GetYear();
		var m = this.GetMonth();
		var d = this._Days[m - 1];
		if (m == 2 && (((y - 1992) % 4 == 0 && (y - 1900) % 100 != 0) || (y - 2000) % 400 == 0)) {
			d = 29;
		}
		if (m < 10) {
			m = '0' + m;
		}
		if (d < 10) {
			d = '0' + d;
		}
		var d1 = y + '-' + m + '-01';
		var d2 = y + '-' + m + '-' + d;
		return [ d1, d2 ];
	};
	/**
	 * 获取本周(第一天,最后一天)
	 * 
	 * @param isSundayIsFirstDay
	 *            是否周日为第一天
	 */
	this.GetBenWeek = function(isSundayIsFirstDay) {
		var dayOfWeek = this._Date.getDay(); // day of week
		var curDay = this.GetDay();

		var d0;
		var d2;
		if (isSundayIsFirstDay) { // 周日为第一天 ,返回周日到周六
			d0 = dayOfWeek;
			d2 = 6 - dayOfWeek;
		} else {// 周一为第一天 ,返回周一到周六日
			d0 = dayOfWeek - 1;
			d2 = 7 - dayOfWeek;
		}
		var dd1 = this.Clone();
		dd1.setDate(curDay - d0);

		var dd2 = this.Clone();
		dd2.setDate(curDay + d2);

		return [ this.GetDateString(dd1), this.GetDateString(dd2) ];
	};

	this.GetBenQ = function() {
		var m = this.GetMonth();
		var m1, m2;
		if (m <= 3) {
			m1 = 1;
			m2 = 3;
		} else if (m <= 6) {
			m1 = 4;
			m2 = 6;
		} else if (m <= 9) {
			m1 = 7;
			m2 = 9;
		} else {
			m1 = 10;
			m2 = 12;
		}
		var y = this.GetYear();
		var d1 = this.CreateDate(y, m1, 1);
		var d2 = this.CreateDate(y, m2, this._Days[m2 - 1]);

		return [ this.GetDateString(d1), this.GetDateString(d2) ];
	};
	this.GetDateString = function(d) {
		return this.FormatDateTime(null, d);
	};
	this.GetDateTimeString = function(d) {
		return this.FormatDate(null, d);
	};
	this.Clone = function() {
		var d1 = this.CreateDate(this.GetYear(), this.GetMonth(), this.GetDay());
		return d1;
	};
	this.AddDays = function(days) {
		var cd = this._Date.getDate();
		this._Date.setDate(cd + days * 1);
		return this.GetDateString();
	};
	this.AddDaysFt = function(days, format) {
		var cd = this._Date.getDate();
		this._Date.setDate(cd + days * 1);
		return this.FormatDate(format);
	};
	/**
	 * 设置时间
	 * 
	 * @param {Number}
	 *            y 4为年
	 * @param {Number}
	 *            m 月
	 * @param {Number}
	 *            d 日
	 * @param {Number}
	 *            h 小时
	 * @param {Number}
	 *            mm 分钟
	 * @param {Number}
	 *            s 秒
	 */
	this.CreateDate = function(y, m, d, h, mm, s) {
		var d1 = new Date();
		if (h == null) {
			h = 0;
		}
		if (mm == null) {
			mm = 0;
		}
		if (s == null) {
			s = 0;
		}
		d1.setDate(1);
		d1.setFullYear(y);
		d1.setMonth(m - 1);
		d1.setDate(d);
		d1.setHours(h);
		d1.setMinutes(mm);
		d1.setSeconds(s);
		d1.setMilliseconds(0);
		return d1;
	};
	/**
	 * 设置时间
	 * 
	 * @param {Number}
	 *            y 4为年
	 * @param {Number}
	 *            m 月
	 * @param {Number}
	 *            d 日
	 * @param {Number}
	 *            h 小时
	 * @param {Number}
	 *            mm 分钟
	 * @param {Number}
	 *            s 秒
	 */
	this.SetDate = function(y, m, d, h, mm, s) {
		if (m == null) {
			this._Date = EWA_Utils.Date(y)._Date;
			return;
		}
		this._Date = this.CreateDate(y, m, d, h, mm, s);
	};
	// 获取周几的名称
	this.GetWeekName = function() {
		var wknames = _EWA_G_SETTINGS.WEEKS.split(',');
		return wknames[this._Date.getDay()];
	};
	this.FormatDate = function(format, dateFrom) {
		if (!format && _EWA_G_SETTINGS && _EWA_G_SETTINGS.DATE) {
			format = _EWA_G_SETTINGS.DATE;
		}
		if (!format) {
			format = "yyyy-MM-dd";
		}
		var d = dateFrom || this._Date;

		var month = d.getMonth() + 1;
		var dm = month;
		var dd = d.getDate();
		if (dm < 10) {
			dm = "0" + month;
		}
		if (dd < 10) {
			dd = "0" + dd;
		}
		var dy = d.getFullYear();
		var val;
		var enMonths = "Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec".split(",");
		var chMonths = "一月,二月,三月,四月,五月,六月,七月,八月,九月,十月,十一月,十二月".split(",");
		if (format == "MM/dd/yyyy") {
			val = dm + "/" + dd + "/" + dy;
		} else if (format == "dd/MM/yyyy") {
			val = dd + "/" + dm + "/" + dy;
		} else if (format == "yyyy-MM-dd") {
			val = dy + "-" + dm + "-" + dd;
		} else if (format == "MM/dd") {
			val = dm + "/" + dd + "/" + dy;
		} else if (format == "dd/MM") {
			val = dd + "/" + dm + "/" + dy;
		} else if (format == "MM-dd") {
			val = dm + "-" + dd;
		} else if (format == "MMM dd") {
			val = enMonths[month - 1] + " " + dd;
		} else if (format == "dd-MMM") {
			val = dd + "-" + enMonths[month - 1];
		} else if (format == "ddMMM") {
			val = dd + enMonths[month - 1];
		} else if (format == "MMMdd") {
			val = enMonths[month - 1] + dd;
		} else if (format == "MM月dd日") {
			val = (month) + dd + "日";
		} else if (format == "yyyyMMdd") {
			val = dy + "" + dm + "" + dd;
		}
		return val;
	};
	this.FormatDateTime = function(format, dateFrom) {
		var d1 = this.FormatDate(format, dateFrom) + " " + this.GetTimeStr(dateFrom);
		return d1;

	};
	this.GetTimeStr = function(dateFrom) {
		var d1 = dateFrom || this._Date;
		var hh = d1.getHours();
		var mi = d1.getMinutes();
		var se = d1.getSeconds();

		return (hh < 10 ? "0" : "") + hh + ":" + (mi < 10 ? "0" : "") + mi + ":" + (se < 10 ? "0" : "") + se;

	};
	this.GetDateDiff = function(bDate) {
		var a = this._Date;
		var b;
		if (!bDate) {
			b = new Date();
		} else if (bDate instanceof Date) {
			b = bDate;
		} else if (bDate instanceof EWA_DateClass) {
			b = bDate._Date;
		} else {
			b = EWA_Utils.Date(bDate)._Date;
		}
		var aTime = a.getTime();
		var bTime = b.getTime();
		var dates = (aTime - bTime) / (1000 * 60 * 60 * 24);
		return dates.toFixed(0);
	};

};
EWA_Utils.Date = function(dateStr) {
	if (!dateStr) {
		return new EWA_DateClass();
	}
	var d1 = dateStr;
	var d2 = '';
	if (dateStr.indexOf(' ') > 0) {
		var d3 = dateStr.split(' ');
		d1 = d3[0];
		d2 = d3[1];
	}
	var da;
	var y;
	var m;
	var d;
	if (dateStr.length == 8) {
		y = dateStr.substring(0, 4);
		m = dateStr.substring(4, 6);
		d = dateStr.substring(6, 8);

	} else {
		if (d1.indexOf("/") > 0) {
			da = d1.split('/');
			y = da[2];
			if (_EWA_G_SETTINGS && _EWA_G_SETTINGS.DATE == "MM/dd/yyyy") {
				m = da[0];
				d = da[1];
			} else {
				m = da[1];
				d = da[0];
			}
		} else {
			da = d1.split('-');
			y = da[0];
			m = da[1];
			d = da[2];
		}
		var mm = 0;
		var h = 0;
		var s = 0;
		if (d2.length > 0) {
			var db = d2.split(':');
			h = db[0];
			mm = db[1];
			if (db.length > 2) {
				s = db[2];
			}
		}
	}
	var dt = new EWA_DateClass();
	dt.SetDate(y, m, d, h, mm, s);
	return dt;
};/**
 * Xml对象
 */
function EWA_XmlClass() {
    this.XmlDoc = null;
    this.LoadXmlFile = function(fileUrl) {
	this._InitXmlDoc();
	this.XmlDoc.load(fileUrl);
    };
    /**
     * 加载XML字符串
     * 
     * @param {Object}
     *                strXml xml字符串
     */
    this.LoadXml = function(strXml) {
	if (EWA.B.IE && !EWA.B.MOZILLA) { // IE<11
	    this._InitXmlDoc();
	    if (!this.XmlDoc) {
		alert('xml is null');
		return;
	    }
	    this.XmlDoc.loadXML(strXml);
	} else {
	    this.XmlDoc = null;
	    this.XmlDoc = new DOMParser().parseFromString(strXml, "text/xml");
	}
    };
    /**
     * 获取XML节点的XML
     * 
     * @param {Object}
     *                node 节点
     * @return 如果Node不为空，返回Node的XML，否则返回DOC的XML
     */
    this.GetXml = function(node) {
	if (node == null) {
	    node = this.XmlDoc;
	}
	if (!EWA.B.IE) {
	    return (new XMLSerializer).serializeToString(node);
	} else {
	    return node.xml;
	}
    };
    /**
     * 获取属性值
     * 
     * @param {Object}
     *                path 路径
     * @param {Object}
     *                attributeName 属性名称
     * @param {Object}
     *                element 当前对象
     * @return (String) 属性值
     */
    this.GetAttributeValue = function(path, attributeName, element) {
	var a = this.GetElement(path, element);
	return a.getAttribute(attributeName);
    };
    /**
     * 获取对象的Text值
     * 
     * @param {Object}
     *                element 对象
     * @return (String) 值
     */
    this.GetElementText = function(element) {
	if (element == null)
	    return null;
	if (element.childNodes.length > 0) {
	    var s1 = "";
	    for (var i = 0; i < element.childNodes.length; i++) {
		s1 += element.childNodes[i].nodeValue;
	    }
	    return s1;
	} else {
	    return null;
	}
    };
    /**
     * 获取对象属性值
     * 
     * @param {Object}
     *                element 对象
     * @param {Object}
     *                attributeName 属性名称
     */
    this.GetElementAttribute = function(element, attributeName) {
	return element.getAttribute(attributeName);
    };
    /**
     * 获取对象的Text值
     * 
     * @param {Object}
     *                path 路径
     * @param {Object}
     *                element 对象
     */
    this.GetText = function(path, element) {
	var a = this.GetElement(path, element);
	return this.GetElementText(a);
    };
    /**
     * 获取对象列表
     * 
     * @param {Object}
     *                path 路径
     * @param {Object}
     *                element 对象
     * @return 对象列表数组
     */
    this.GetElements = function(path, element) {
	var paths = path.split("/");
	var a;
	if (element == null) {
	    a = this.XmlDoc;
	} else {
	    a = element;
	}
	for (var i = 0; i < paths.length - 1; i += 1) {// for firefox
	    var b = a.getElementsByTagName(paths[i]);
	    if (b == null || b.length == 0) {
		return null;
	    }
	    a = b[0];
	    b = null;
	}
	if (a == null || a.length == 0) {
	    return null;
	} else {
	    return a.getElementsByTagName(paths[paths.length - 1]);
	}
    };
    /**
     * 获取对象
     * 
     * @param {String}
     *                path 路径
     * @param {Object}
     *                element 对象
     */
    this.GetElement = function(path, element) {
	var a = this.GetElements(path, element);
	if (a == null) {
	    return null;
	} else {
	    return a[0];
	}
    };
    /**
     * 对象属性赋值
     * 
     * @param {String}
     *                attName 属性名称
     * @param {String}
     *                attValue 属性值
     * @param {Object}
     *                element 对象
     */
    this.SetAttribute = function(attName, attValue, element) {
	if (attValue == null) {
	    element.setAttribute(attName, "");
	} else {
	    element.setAttribute(attName, attValue);
	}
    };
    /**
     * 生成或获取节点
     * 
     * @param {String}
     *                path 路径
     * @param {Object}
     *                element 当前节点
     */
    this.GetOrCreateElement = function(path, element) {
	var paths = path.split("/");
	var a;
	if (element == null) {
	    a = this.XmlDoc;
	} else {
	    a = element;
	}
	for (var i = 0; i < paths.length; i += 1) {// for firefox
	    var b = a.getElementsByTagName(paths[i]);
	    if (b == null || b.length == 0) {
		a = this.NewChild(paths[i], a);
		b = null;
	    } else {
		a = b[0];
		b = null;
	    }
	}
	return a;
    }
    /**
     * 新字节点
     * 
     * @param {String}
     *                tagName 节点Tag名称
     * @param {Object}
     *                elementParent 父节点
     */
    this.NewChild = function(tagName, elementParent) {
	var ele = this.XmlDoc.createElement(tagName);
	elementParent.appendChild(ele);
	return ele;
    };
    this.NewChilds = function(tagNames, elementParent) {
	var tags = tagNames.split('/');
	var eleP = elementParent;
	for (var i = 0; i < tags.length; i++) {
	    var eleP = this.NewChild(tags[i].trim(), eleP)
	}
	return eleP;
    };
    /**
     * 设置节点值
     * 
     * @param {Object}
     *                text 值
     * @param {Object}
     *                element 节点
     */
    this.SetText = function(text, element) {
	element.text = text;
    };
    /**
     * 新增文本节点
     * 
     * @param {Object}
     *                text
     * @param {Object}
     *                element
     */
    this.AppendText = function(text, element) {
	var node = this.XmlDoc.createTextNode(text);
	element.appendChild(node);
    };
    /**
     * 赋值CDATA节点
     * 
     * @param {String}
     *                text
     * @param {Object}
     *                element
     */
    this.SetCData = function(text, element) {
	if (text == null) {
	    return;
	}
	var c = this.XmlDoc.createCDATASection(text);
	element.appendChild(c);
    };
    /**
     * 初始化XML Document
     */
    this._InitXmlDoc = function() {
	if (this.XmlDoc) {
	    return;
	}
	if (EWA.B.IE) {
	    var xmls = [ "MSXML4.DOMDocument", "MSXML3.DOMDocument", "MSXML2.DOMDocument", "MSXML.DOMDocument",
		    "Microsoft.XmlDom" ];
	    for (var i = 0; i < xmls.length; i++) {
		try {
		    this.XmlDoc = new ActiveXObject(xmls[i]);
		} catch (e) {
		    this.XmlDoc = null;
		}
		if (this.XmlDoc != null) {
		    break;
		}
	    }
	}
	if (!this.XmlDoc) {
	    try {
		// 创建FIREFOX下XML文档对象
		this.XmlDoc = document.implementation.createDocument("", "doc", null);
	    } catch (e) {

	    }
	}
	if (!this.XmlDoc) {
	    alert('XML init failed');
	    return;
	}
	try {
	    this.XmlDoc.async = false;
	} catch (e) {

	}
    };
    this._InitXmlDoc();
}/**
 * Url类
 */
function EWA_UrlClass(init_url) {
    this._URL = "";
    this._Paras = {};
    this._Root = "";
    this.SetUrl = function(url) {
	if (url == null) {
	    url = window.location.href;
	} else if (url.href) {
	    url = url.href;
	} else {
	    url = url.toString();
	}
	this._URL = url;
	this._Paras = {};
	this._Root = url.split('?')[0];
	if (url.indexOf("?") < 0) {
	    return;
	}
	var u1 = url.split('?')[1];
	var u2 = u1.split('&');

	for (var i = 0; i < u2.length; i++) {
	    var u3 = u2[i].split('=');
	    if (u3.length == 2) {
		this._Paras[u3[0].toUpperCase()] = u3[1];
	    } else {
		this._Paras[u3[0].toUpperCase()] = '';
	    }
	}
    };
    /**
     * 移除所有EWA相关的参数
     */
    this.RemoveEwa = function() {
	for ( var n in this._Paras) {
	    var n1 = n.toLowerCase();
	    if (n1 == 'xmlname' || n1 == 'itemname' || n1.indexOf('ewa_') == 0) {
		this._Paras[n] = null;
	    }
	}
	return this.GetUrl();
    };
    this.GetParameter = function(paraName) {
	return this._Paras[paraName.toUpperCase().trim()];
    };
    this.GetParas = function(islower) {
	var ss = [];
	for ( var n in this._Paras) {
	    var v = this._Paras[n];
	    if (islower) {
		n = n.toLowerCase();
	    }
	    if (n && v != null) {
		ss.push(n + "=" + v);
	    }
	}
	return ss.join('&');
    };
    this.SetRoot = function(root) {
	this._Root = root;
    };
    /**
     * 获取Url，islower是否将名称转换为小写
     */
    this.GetUrl = function(islower) {
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
    this.AddParameter = function(paraName, paraValue, notEncode) {
	var p = paraName.toUpperCase().trim();
	this._Paras[p] = notEncode ? paraValue : encodeURIComponent(paraValue);
	return this.GetUrl();
    };
    this.RemoveParameter = function(paraName) {
	var p = paraName.toUpperCase().trim();
	this._Paras[p] = null;
	return this.GetUrl();
    };
    this.SetUrl(init_url || window.location.href);
}
/**
* 用于翻译全部的类
**/ 
function EWA_TanslatorCalss() {
	this.SKIP_EXISTS = true; // 不翻译已经存在的
	/**
	 * 翻译全部（中文-英文）
	 * 
	 * @prarm objs_ch 要翻译的对象(数组) 不可为空
	 * @prarm objs_en 翻译后显示的对象(数组) 可为空
	 * @prarm transCompleteItemCallBack 翻译完成一条的调用 function 可为空
	 * @prarm transCompleteCallback 全部翻译完成的调用 function 可为空
	 * 
	 */
	this.transAll = function(objs_ch, objs_en, transCompleteItemCallBack, transCompleteCallback) {
		this.idx = 0;
		this.idx_ok = 0;// 翻译完成数量
		if (objs_ch == null) {
			alert('对象objs_ch不能为空');
			return;
		}
		this._objs_ch = objs_ch;
		this._objs_en = objs_en;
		this._transCompleteCallback = transCompleteCallback;
		this._transCompleteItemCallBack = transCompleteItemCallBack;
		this.start_trans('en');
	};
	/**
	 * 翻译全部（英文-中文）
	 * 
	 * @prarm objs_ch 要翻译的对象(数组) 不可为空
	 * @prarm objs_en 翻译后显示的对象(数组) 可为空
	 * @prarm transCompleteItemCallBack 翻译完成一条的调用 function 可为空
	 * @prarm transCompleteCallback 全部翻译完成的调用 function 可为空
	 * 
	 */
	this.transAllToCn = function(objs_ch, objs_en, transCompleteItemCallBack, transCompleteCallback) {
		this.idx = 0;
		this.idx_ok = 0;// 翻译完成数量
		if (objs_ch == null) {
			alert('对象objs_ch不能为空');
			return;
		}
		this._objs_ch = objs_ch;
		this._objs_en = objs_en;
		this._transCompleteCallback = transCompleteCallback;
		this._transCompleteItemCallBack = transCompleteItemCallBack;
		this.start_trans('cn');
	};
	this.start_trans = function(transToLang) {
		if (this.idx <= this._objs_ch.length - 1) {
			var ch_obj = this._objs_ch[this.idx];
			var en_obj = null;
			if (this._objs_en) {
				en_obj = this._objs_en[this.idx];
				if (this.SKIP_EXISTS) {// 检查是否已经存在
					var en_txt = this.get_text(en_obj);
					if (en_txt) {
						this.idx++;
						this.start_trans(transToLang);
						return;
					}
				}
			}
			this.idx++;
			this.trans_item(ch_obj, en_obj, transToLang);

			// 定时调用
			var c = this;
			setTimeout(function() {
				c.start_trans(transToLang);
			}, 123);
			return;
		}
		// setTimeout(this.post_server, 1231);
	};
	this.trans_item = function(fromObj, toObj, transToLang) {
		let that = this;
		if (this.trans == null) {
			this.trans = new EWA_TransClass();
			this.trans.transAfter = function(rst, func){
				that.idx_ok++;
				that.call_item_callback(func, rst);
				that.check_complete();
			};
		}
		
		/*let cb = function(rst, obj1){
			that.idx_ok++;
			that.trans.transBackCallCommon(rst, toObj);
			that.call_item_callback(obj1,rst);
			that.check_complete();
		}*/
		
		if (transToLang == 'cn') {
			this.trans.TransToCn(this.get_text(fromObj), toObj);
		} else {
			this.trans.TransToEn(this.get_text(fromObj), toObj);
		}
	};
	/**
	 * 根据对象返回文字
	 */
	this.get_text = function(fromObj) {
		var chstr;
		if (typeof fromObj == 'string') { // 对象的ID
			chstr = fromObj;
		} else {
			var tag = fromObj.tagName;
			if (tag == null) {
				tag = '';
			}
			tag = tag.toUpperCase()
			if (tag == 'SELECT' || tag == 'INPUT' || tag == 'TEXTAREA') {
				chstr = fromObj.value;
			} else if (tag != '') {
				chstr = fromObj.innerHTML;
			} else {
				console.log("trans_err");
				console.log(fromObj);
			}
		}
		return chstr || "";
	};
	this.call_item_callback = function(fromObj, rst) {
		if (this._transCompleteItemCallBack) {
			this._transCompleteItemCallBack(fromObj, rst);
		}
	}
	this.check_complete = function() {
		if (this._objs_ch.length == this.idx_ok) {
			$Tip("翻译完成");

			if (this._transCompleteCallback) {
				this._transCompleteCallback();
			}
			return true;
		} else {
			return false;
		}
	};
};

function EWA_TransClass() {
	this._Id = ("EWA_UT_TRANS" + Math.random()).replace('.', '_');
	window[this._Id] = this;
	// this._Trans = 'youdao';

	this._IDX = 0;
	this.IsRun = false;
	this.TransToEn = function(hz, func) {
		this.transToEn(hz,func);
	};
	this.transToEn = function(hz, func) {
		if (hz == null || hz.trim() == '') {
			if (func instanceof Function) {// 调用用户的方法
				func(null);
			}
			return;
		}
		this.IsRun = true;
		if (this.transProvider == 'azure') {//微软云翻译
			this._trans_azure(hz, func, true);
		} else if (this.transProvider == 'bing') {// 老版的微软翻译
			this._trans_bing(hz, func, true);
		} else if (this.transProvider == 'youdao') { // 有道，不建议用，限制200字符
			this._trans_youdao(hz, func);
		} else {
			console.log('没有指定翻译引擎');
		}
	};
	this.TransToCn = function(english, func) {
		this.transToCn(english, func);	
	};
	this.transToCn = function(english, func) {
		if (english == null || english.trim() == '') {
			if (func instanceof Function) {// 调用用户的方法
				func(null);
			}
			return;
		}
		this.IsRun = true;
		if (this.transProvider == 'azure') {//微软云翻译
			this._trans_azure(english, func, false);
		} else if (this.transProvider == 'bing') {
			this._trans_bing(english, func, false);
		} else if (this.transProvider == 'youdao') {
			this._trans_youdao(english, func);
		} else {
			console.log('没有指定翻译引擎');
		}
	};
	this._trans_azure = function(fromStr, func, isTransToEn) {
		let that = this;
		let ajaxCfg = {
			url: this.azureTansCfg.url + (isTransToEn ? "&from=zh-Hans&to=en" : "&from=en&to=zh-Hans"),
			headers: {
				'Content-Type': 'application/json;charset=utf8'
				, 'Ocp-Apim-Subscription-Key': this.azureTansCfg.key
				, "Ocp-Apim-Subscription-Region": this.azureTansCfg.location
			},
			data: JSON.stringify([{ "text": fromStr }]),
			type: "POST",
			success: function(results) {
				// [{"translations":[{"text":"你好","to":"zh-Hans"}]}]
				if (results.length == 0) {
					$Tip('No result');
					return;
				}
				let rst = results[0].translations[0].text;
				that.transBackCallCommon(rst, func);
				delete window[this._Id];
			},
			error: function(req) {
				that.IsRun = false;
				$Tip(req.responseText);
			}
		}
		// 发起请求内容
		$.ajax(ajaxCfg);
	};
	/**
	 * 有道翻译，不区分英文和汉字
	 */
	this._trans_youdao = function(fromStr, func) {
		var funcName = this._get_func_name();
		var funcName1 = funcName + "AAAAA";
		var funcStr = this.transback_youdao_tmp.toString().replace("transback_youdao_tmp", '');
		var js = this._get_user_func_str(funcName, funcName1);
		funcStr = funcStr.replace("{", "{" + js);

		var s = 'window.' + funcName + '=' + funcStr;
		// console.log(s);
		eval(s);

		window[funcName1] = func;

		var s = document.createElement("script");
		fromStr = fromStr.replace(/\n/ig, '[GDX]').replace(/\r/ig, '');
		var u = this.youdaoTrans + "&callback=" + funcName + "&q=" + fromStr.toURL();

		s.src = u;
		document.getElementsByTagName("head")[0].appendChild(s);
	};
	this._trans_bing = function(fromStr, func, isTransToEn) {
		var funcName = this._get_func_name();
		var funcName1 = funcName + "AAAAA";

		var funcStr = this.transback_bing_tmp.toString().replace("trans_en_back_bing_tmp", '');

		var js = this._get_user_func_str(funcName, funcName1);
		funcStr = funcStr.replace("{", "{" + js);

		var s = 'window.' + funcName + '=' + funcStr;
		// console.log(s)
		// 生成 trans_call_back;
		eval(s);

		// 用户回调
		window[funcName1] = func;

		// 发起请求内容
		var s = document.createElement("script");
		var u = this.bingTrans + "&oncomplete=" + funcName;
		if (isTransToEn) {// 中译英
			u += "&from=zh-CHS&to=en&text=" + fromStr.toURL();
		} else {
			u += "&from=en&to=zh-CHS&text=" + fromStr.toURL();
		}
		s.src = u;
		document.getElementsByTagName("head")[0].appendChild(s);
	};
	this._get_user_func_str = function(funcName, funcName1) {
		var js = "var fromClass=window['" + this._Id + "'];\n var func=window['" + funcName1 + "']; \n var _fname='" + funcName
			+ "'; \n var _fname1='" + funcName1 + "'; \n ";
		return js;
	};
	this._get_func_name = function() {
		this._IDX++;
		var funcName = '___GDX_T_' + this._IDX;
		return funcName;
	};
	/**
	 * bing 回调模板脚本
	 */
	this.transback_bing_tmp = function(rst) {
		// 替换 下面 FF 脚本内容
		/* FF */
		try {
			fromClass.transBackCallCommon(rst, func);
		} catch (e) {
			console.log(e);
		}
		delete window[_fname1];
		delete window[_fname];
	};
	/**
	 * youdao 回调模板脚本
	 */
	this.transback_youdao_tmp = function(rst) {
		// 替换 下面 FF 脚本内容
		/* FF */
		try {
			if (rst && rst.errorCode) {
				console.log(rst);
				if (func instanceof Function) {// 调用用户的方法
					func("翻译引擎错误");
				}
				return;
			}
			if (rst && rst.translation && rst.translation.length > 0) {
				rst = rst.translation[0];
			} else {
				if (func instanceof Function) {// 调用用户的方法
					func(rst);
				}
				console.log(rst);
				return;
			}

			fromClass.transBackCallCommon(rst, func);
		} catch (e) {
			console.log(e);
		}
		delete window[_fname1];
		delete window[_fname];
	};
	this.transBackCallCommon = function(rst, func) {
		this.IsRun = false;
		if (func == null) {
			console.log(rst)
			if (this.transAfter) {
				this.transAfter(rst, func, this);
			}
			return;
		} else if (func instanceof Function) {// 调用用户的方法
			func(rst);
			if (this.transAfter) {
				this.transAfter(rst, func, this);
			}
			return;
		} else if (typeof func == 'string') { // 对象的ID
			func = document.getElementById(func);
		}

		var tag = func.tagName;
		if (tag == null) {
			tag = '';
		}
		tag = tag.toUpperCase()
		if (tag == 'SELECT' || tag == 'INPUT' || tag == 'TEXTAREA') {
			func.value = rst;
			func.setAttribute('ewa_trans_end', 'ok');
			if (func.onblur != null) {
				func.onblur();
			}
			if (tag == "TEXTAREA" && window.autosize && autosize.update) {
				// 如果使用了autosize来调整textarea高度
				autosize.update(func);
			}

		} else if (tag == 'DIV' || tag == 'SPAN') {
			if (tag == 'DIV' && $(func).attr('EWA_DHTML')) {
				$(func).find('iframe')[0].contentWindow.frames[0].document.body.innerHTML = rst;
				$(func).find('input[type=hidden]')[0].value = rst;
			} else {
				func.setAttribute('ewa_trans_end', 'ok');
				func.innerHTML = rst;
			}
		} else {
			console.log(rst);
		}
		if (this.transAfter) {
			this.transAfter(rst, func, this);
		}
	};
}
window["EWA_UT_TRANS"] = EWA_TransClass;
EWA_TransClass.prototype.transProvider = 'azure';
/*	在微软 https://portal.azure.com/进行申请，
 此key为200万单词每月的免费配额 (root@gdxsoft.com)	 
*/
EWA_TransClass.prototype.azureTansCfg = {
	url: "https://api.cognitive.microsofttranslator.com/translate?api-version=3.0", //&from=en&to=zh-Hans
	key: "f436c44286474b5eaa928d8b3f251972",
	location: "EastAsia"
};
/**	 * bing trans v2*/
EWA_TransClass.prototype.bingTrans = '//api.microsofttranslator.com/V2/Ajax.svc/Translate?appid=50F7C8D4BC00A6E047C046D012F334DEC61FA003';

/*
 * 有道翻译API申请成功 API key：1597375709 keyfrom：wwwoneworldcc 创建时间：2012-05-04
 * 网站名称：wwwoneworldcc 网站地址：http://www.oneworld.cc
 * http://fanyi.youdao.com/openapi.do?keyfrom=wwwoneworldcc&key=1597375709&type=data&doctype=<doctype>&version=1.1&q=要翻译的文本
 */
EWA_TransClass.prototype.youdaoTrans = "//fanyi.youdao.com/openapi.do?keyfrom=wwwoneworldcc&key=1597375709&type=data&doctype=jsonp&version=1.1";

/**
 * 图片操作类 toDataURL
 */
EWA_ImageCalss = {
	defaultRatio : 0.7,

	resize : function(img, width, height, format, ratio) {
		var scale1 = img.naturalWidth / width;
		var scale2 = img.naturalHeight / height;

		var scale = scale1 > scale2 ? scale1 : scale2;

		var width = img.naturalWidth / scale;
		var height = img.naturalHeight / scale;

		var format1 = format ? format : 'image/jpeg';
		var ratio1 = ratio || this.defaultRatio;
		if (isNaN(ratio1) || ratio1 > 1) {
			ratio1 = this.defaultRatio;
		}
		var c1 = document.createElement('canvas');
		c1.width = width;
		c1.height = height;
		ctx1 = c1.getContext("2d");

		// context.drawImage(img,sx,sy,swidth,sheight,x,y,width,height);
		// 参数值
		// 参数 描述
		// img 规定要使用的图像、画布或视频。
		// sx 可选。开始剪切的 x 坐标位置。
		// sy 可选。开始剪切的 y 坐标位置。
		// swidth 可选。被剪切图像的宽度。
		// sheight 可选。被剪切图像的高度。
		// x 在画布上放置图像的 x 坐标位置。
		// y 在画布上放置图像的 y 坐标位置。
		// width 可选。要使用的图像的宽度。（伸展或缩小图像）
		// height 可选。要使用的图像的高度。（伸展或缩小图像）
		ctx1.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, 0, 0, c1.width, c1.height);
		var src = c1.toDataURL(format1, ratio1);
		// delete c1;
		return src;
	},
	dataURItoBlob : function(dataURI) {
		var arr = dataURI.split(',');
		var mime = arr[0].match(/:(.*?);/)[1];
		// arr1 = arr;
		var data = window.atob(arr[1]);
		var ia = new Uint8Array(data.length);
		for (var i = 0; i < data.length; i++) {
			ia[i] = data.charCodeAt(i);
		}
		;
		return new Blob([ ia ], {
			type : mime
		});
	},
	resizeAsBlob : function(img, width, height, format, ratio) {
		var src = this.resize(img, width, height, format, ratio);
		var blob = this.dataURItoBlob(src);
		// console.log(src);
		// aaaa = src;
		// bbbb = blob;

		// var a = document.createElement('a');
		// a.href = window.URL.createObjectURL(blob);
		// a.donwload = 'hello-world.jpg';
		// a.textContent = 'Download Hello World';
		// a.target = '_blank';
		// a.style.display = 'block';
		// document.body.appendChild(a);

		return blob;
	}
};
function EWA_WebSocketClass(wsUrl) {
	this.inited = false; // 曾经初始化过
	this.connected = false;
	this.socket = null;
	this.cbs = {};
	this.cbs_length = 0;
	this.handleBroadMsgs = {}; // 处理广播消息方法的容器
	this.handleOnReconnected = {}; // 断线后重新上线调用方法的容器
	this.handleOnOffline = {}; // 断线后处理的方法
	this.url = wsUrl;
	this.init = function(cb, debug) {
		this.inited = true;
		this.open(cb);
		this.debug = debug;

	};
	/**
	 * 注册处理广播消息的方法
	 * 
	 * @param handleId
	 *            方法ID
	 * @param func
	 *            处理方法
	 */
	this.registerHandleBroadMsg = function(handleId, func) {
		this.handleBroadMsgs[handleId] = func;
	};
	/**
	 * 取消注册 广播消息的方法
	 * 
	 * @param handleId
	 *            方法ID
	 */
	this.unRegisterHandleBroadMsg = function(handleId) {
		this.handleBroadMsgs[handleId] = null;
	};
	/**
	 * 注册当断线后重新上线调用的方法
	 * 
	 * @param handleId
	 *            方法ID
	 * @param func
	 *            处理方法
	 */
	this.registerOnReconnected = function(handleId, func) {
		this.handleOnReconnected[handleId] = func;
	};
	/**
	 * 取消 注册当断线后重新上线调用的方法
	 * 
	 * @param handleId
	 *            方法ID
	 */
	this.unRegisterOnReconnected = function(handleId) {
		this.handleOnReconnected[handleId] = null;
	};
	/**
	 * 注册当断线后调用的方法
	 * 
	 * @param handleId
	 *            方法ID
	 * @param func
	 *            处理方法
	 */
	this.registerOnOffline = function(handleId, func) {
		this.handleOnOffline[handleId] = func;
	};
	/**
	 * 取消 注册当断线后调用的方法
	 * 
	 * @param handleId
	 *            方法ID
	 */
	this.unRegisterOnOffline = function(handleId) {
		this.handleOnOffline[handleId] = null;
	};

	/**
	 * 发送消息
	 * 
	 * @param command
	 *            执行的命令
	 * @param cb
	 *            回调函数
	 */
	this.send = function(command, cb) {
		if (!this.connected) { // 为连接
			console.log('未连接');
			return false;
		}
		if (this.debug) {
			console.debug(command, cb);
		}
		this.socket.send(JSON.stringify(command));
		if (cb) {
			// 消息返回时，通过返回的ID找到回调函数并执行
			this.cbs[command.ID] = cb;
			this.cbs_length++;
		}

		return true;
	};
	// 关闭连接
	this.closeWebSocket = function() {
		this.socket.close();
	};
	/**
	 * 试图清除回调，避免长期执行对内存的占用
	 */
	this.tryClearCbs = function() {
		if (this.cbs_length > 200) {
			// 超过200，强制清空
			this.cbs = {};
			this.cbs_length = 0;

			if (this.debug) {
				console.debug("tryClearCbs：超过200，强制清空");
			}
			return;
		}
		for ( var n in this.cbs) {
			if (this.cbs[n] != null) {
				// 回调还在执行
				return;
			}
		}
		if (this.debug) {
			console.debug("tryClearCbs：清空" + this.cbs_length);
		}
		this.cbs = {};
		this.cbs_length = 0;
	};
	// 当收到消息时处理
	// 根据返回的JSON.ID获取 cbs 的对应的回调方法，回调用完就抛弃
	// 如果 返回JSON.BROADCAST_ID 的对应的回调方法，方法不会抛弃
	this.onMessage = function(event) {
		// console.log(event);
		var c = this;
		try {
			var json = JSON.parse(event.data);
			if (json.ID && c.cbs[json.ID]) {
				var func = c.cbs[json.ID];
				if (!func) {
					return;
				}

				if (c.debug) {
					console.debug("执行回调方法");
					console.debug(json.ID, func);
				}
				try {
					func(json, event);
				} catch (err) {
					console.log(event);
					console.log(func);
					console.log(err);
				}
				c.cbs[json.ID] = null;

				if (c.cbs_length > 10) {
					c.tryClearCbs();
				}
			} else if (json.BROADCAST_ID && c.handleBroadMsgs[json.BROADCAST_ID]) {
				var func = c.handleBroadMsgs[json.BROADCAST_ID];
				if (!func) {
					return;
				}
				if (c.debug) {
					console.debug("执行广播消息回调的方法");
					console.debug(func);
				}
				// 对应广播消息回调的方法
				try {
					func(json, event);
				} catch (err) {
					console.log(event);
					console.log(func);
					console.log(err);
				}
			}
		} catch (e) {
			console.log(event);
			console.log(e);
		}
		// c.setMessageInnerHTML(event.data);
	};

	this.onOpen = function(e, cb) {
		var c = this;
		c.connected = true;

		if (cb) {
			cb();
		} else {
			// 当断线后重新上线调用的方法
			for ( var n in c.handleOnReconnected) {
				var func = c.handleOnReconnected[n];
				if (c.debug) {
					console.debug(n, func);
				}
				try {
					if (func) {
						func(this, event);
					}
				} catch (err) {
					console.error(n);
					console.error(func);
					console.error(err);
				}
			}
		}

		// 监听窗口关闭事件，当窗口关闭时，主动去关闭websocket连接，
		// 防止连接还没断开就关闭窗口，server端会抛异常。
		window.onbeforeunload = function() {
			c.CLOSED_ON_QUIT = true;
			c.socket.close();
		};

		c._Attempts = 0;
		c._maxTimeout = 0;
	};
	this.onError = function(e) {
		var c = this;
	};
	this.onClose = function(e) {
		var c = this;
		// 从连接到非连接只调用一次
		if (c.connected) {
			for ( var n in c.handleOnOffline) {
				// 当断线后重新上线调用的方法
				var func = c.handleOnOffline[n];
				try {
					if (func) {
						func(this, e);
					}
				} catch (err) {
					console.error(n);
					console.error(func);
					console.error(err);
				}
			}
		}
		c.connected = false;
		if (c.CLOSED_ON_QUIT) {
			console.log("closed");
			return;
		}
		// 重试次数
		c._Attempts ? c._Attempts++ : c._Attempts = 0;
		if (c._maxTimeout == 0) {
			// 按照重试次数，增加重试时间间隔
			var timeout = 555 * Math.pow(1.1, c._Attempts);
			if (timeout > 3000) {
				timeout = 3210; // 最大时间间隔
				c._maxTimeout = timeout;
			}
		} else {
			timeout = c._maxTimeout;
		}
		// 重试连接
		setTimeout(function() {
			c.open();
		}, timeout);
	};
	/**
	 * 初始化
	 */
	this.open = function(cb) {
		var websocket = new WebSocket(this.url);
		var c = this;
		// 连接发生错误的回调方法
		websocket.onerror = function(event) {
			if (c.debug) {
				console.debug(event);
			}
			c.onError(event);
		};

		// 连接成功建立的回调方法
		websocket.onopen = function(event) {
			if (c.debug) {
				console.debug(event);
			}
			c.onOpen(event, cb);
		};
		// 接收到消息的回调方法
		websocket.onmessage = function(event) {
			if (c.debug) {
				console.debug(event);
			}
			c.onMessage(event);
		};

		// 连接关闭的回调方法
		websocket.onclose = function(event) {
			if (c.debug) {
				console.debug(event);
			}
			c.onClose(event);
		};

		this.socket = websocket;
	};
};/**
 * 消息, 抛弃了
 */
function EWA_AddEvent(chkId, funcName) {
	if (top.EWA && top.EWA['MQE']) {
		return;
	}
	var l = new EWA_MqeListenerClass();
	l.CheckId = chkId;
	l.FuncName = funcName;

	top.EWA['MQE'].AddListener(l);
}

function EWA_MqeClass() {
	this.FromId = null; // 来源ID
	this.Type = null; //
	this.Data = null;
	this.Paras = GetUrlParas(true);
	this.IsServer = false; // 消息从服务器来
}
function EWA_MqeListenerClass() {
	this.Win = window;
	this.CheckId = null;
	this.FuncName = null;
	this.Paras = GetUrlParas(true);

	this.LastMsg = null;
	this.LastResult = false;
}

function EWA_MqeManagerClass() {
	this._Listeners = [];
	this.UrlServer = null;
	this.LastTimer = -1; // 上次获取时间
	this.Stop = false; // 是否停止运行
	this.AddListener = function(listener) {
		this._Listeners.push(listener);
	}
	/**
	 * 
	 * @param {EWA_MqeClass}
	 *            mqe
	 */
	this.AddMqe = function(mqe) {
		// $X('EWA_MENU').parentNode.cells[1].innerHTML = mqe.FromId + ','
		// + mqe.Type;
		window.status = mqe.FromId + ',' + mqe.Type;
		for (var i = 0; i < this._Listeners.length; i++) {
			var listener = this._Listeners[i];
			if (listener == null) {
				continue;
			}
			var ids = listener.CheckId.split(',');
			for (var k = 0; k < ids.length; k++) {
				if (mqe.FromId != ids[k]) {
					continue;
				}

				var rst = this._DoEvent(listener, mqe);
				if (rst === true) {
					this._Listeners[i].LastResult = true;
				} else if (rst === null) {
					this._Listeners[i] = null;
				} else {
					this._Listeners[i].LastMsg = rst;
					this._Listeners[i].LastResult = false;
				}
			}
		}
	}

	/**
	 * 
	 * @param {Ewq_MqeListenerClass}
	 *            listener
	 * @param {EWA_MqeClass}
	 *            mqe
	 */
	this._DoEvent = function(listener, mqe) {
		try {
			// 窗体注销了
			var doc = listener.Win.document;
		} catch (e) {
			return null;
		}
		var func;
		try {
			var w = listener.Win;
			func = eval('w.' + listener.FuncName);
			// $X('EWA_MENU').parentNode.cells[1].innerHTML = func
			func(mqe.Type, mqe.Paras, mqe.IsServer);
			func = null;
			return true;
		} catch (e) {
			func = null;
			return e;
		}

	}

	/**
	 * 创建服务器的长连接
	 * 
	 * @param {}
	 *            mqeUrl
	 * @param {}
	 *            unid
	 */
	this.CreateServer = function(mqeUrl, unid) {
		var u = new EWA_UrlClass();
		u.SetUrl(mqeUrl);
		u.AddParameter("UNID", unid);
		this.UrlServer = u.GetUrl();
	}

	this._GetEvents = function() {
		var ajax = new EWA_AjaxClass();
		var from = EWA['MQE'];
		var u = from.UrlServer + '&T=' + from.LastTimer;
		ajax.IsShowWaitting = false; // 不显示等待信息

		ajax.Get(u, function() {
			if (!ajax.IsRunEnd()) {
				return;
			}
			var rst = ajax.GetRst();
			if (ajax.IsError()) {
				if (window.EWA_AjaxErr) {
					window.EWA_AjaxErr(rst);
				}
			} else {
				var rst = rst.trim();
				from.ParseMsg(rst);
				from.Mon();
			}
		});
	}

	/**
	 * 监控
	 */
	this.Mon = function() {
		if (userAgent.indexOf('ipad') > 0 || userAgent.indexOf('iphone') > 0) {
			return;
		}
		var o = EWA['MQE'];
		if (o.RunStopParaName != undefined) {
			o.Stop = !eval('window.' + o.RunStopParaName);
		}
		if (!o.Stop) {
			window.setTimeout(o._GetEvents, 1250);
		} else {
			window.setTimeout(o.Mon, 1250);
		}
	}
	/**
	 * 处理消息
	 * 
	 * @param {}
	 *            s
	 * @return {}
	 */
	this.ParseMsg = function(s) {
		var evts;
		try {
			eval('evts=' + s);
		} catch (e) {
			this.Stop = true;
			return;
		}

		if (!evts.E) { // 参数不正确，没有启动
			this.Stop = true;
			return;
		}

		if (evts.T < this.LastTimer) {
			return;
		}
		this.LastTimer = evts.T;

		if (evts.V.length == 0) {
			return;
		}
		var o = {};

		for (var i = evts.V.length - 1; i >= 0; i--) {
			var m = evts.V[i];
			var key = m.ID + '--GDX--' + m.TP + '---GDX---' + m.V;
			if (o[key]) {
				evts.V[i] = null; // 去除重复的事件
			} else {
				o[key] = true;
			}
		}
		for (var i = 0; i < evts.V.length; i++) {
			var m = evts.V[i];
			if (m == null) {
				continue;
			}
			var m1;
			eval('m1=' + m.V);
			var msg = new EWA_MqeClass();
			msg.FromId = m.ID;
			msg.Type = m.TP;
			msg.Paras = m1;
			msg.IsServer = true;
			this.AddMqe(msg);
		}
	}
}
/**
 * 创建消息管理器
 * 
 * @param {}
 *            mqeUrl 长连接地址
 * @param {}
 *            unid 唯一编号
 */
function EWA_MqeCreate(mqeUrl, unid, runStopParaName) {
	if (unid == null || unid.trim().length == 0) {
		alert('unid is blank');
		return;
	}

	EWA['MQE'] = new EWA_MqeManagerClass();
	EWA['MQE'].CreateServer(mqeUrl, unid);
	if (runStopParaName != undefined) { // 停止运行的开关
		EWA['MQE'].RunStopParaName = runStopParaName;
	}
	EWA['MQE'].Mon();

}if (typeof EWA == 'undefined') {
    EWA = {};
}

/* 界面 */
EWA["UI"] = EWA["UI"] || {};

/**
 * 计算位置
 * 
 * @param {}
 *            obj 要计算位置的对象
 * @return {Object} X 左<br>
 *         Y bottom<br>
 *         Left 左<br>
 *         Top 头<br>
 *         Width 宽<br>
 *         Height 高<br>
 *         Right 右<br>
 *         Bottom 底<br>
 */
EWA.UI.Postion = function(obj) {
    if (obj == null) {
        return null;
    }
    var o1 = obj;
    var x,
        y;
    x = y = 0;
    do {
        x += o1.offsetLeft * 1;
        y += o1.offsetTop * 1;
        if (o1.tagName == "DIV") {
            x -= o1.scrollLeft;
            y -= o1.scrollTop;
        }
        o1 = o1.offsetParent;
    } while (o1 != null && o1.tagName != "BODY" && o1.tagName != "HTML");
    var y1 = y + obj.offsetHeight * 1;
    return {
        X : x, // 左
        Y : y1, // bottom
        Left : x, // 左
        Top : y, // 头
        Width : obj.offsetWidth, // 宽
        Height : obj.offsetHeight, // 高
        Right : x + obj.offsetWidth, // 右
        Bottom : y1
    // 底
    };
}

// ----------------移动对象-----------------------
var EWA$UI$COMMON$Move = {
    OnMouseDown : function(obj, evt, objMove, isX, isY) {
        obj.setAttribute("D", 1);
        var e = EWA$UI$COMMON.Move._Event(obj, evt);
        var xy = EWA$UI$COMMON.Move._EventXY(e);
        if (isX == null || isX) {
            obj.setAttribute("X", xy.X);
            obj.setAttribute("SX", xy.X);
        }
        if (isY == null || isY) {
            obj.setAttribute("Y", xy.Y);
            obj.setAttribute("SY", xy.Y);
        }
        if (typeof e.preventDefault != "undefined") {
            e.preventDefault();
        }
        typeof e.stopPropagation != "undefined" ? e.stopPropagation() : e.cancelBubble = true;
    },
    OnMouseUp : function(obj) {
        obj.setAttribute("D", 0);
    },
    OnMouseOut : function(obj) {
        if (obj.getAttribute("D") == "1") {
            obj.setAttribute("D", 0);
        }
    },
    OnMouseMove : function(obj, evt) {
        if (obj.getAttribute("D") != "1") {
            return;
        }
        var e = EWA$UI$COMMON.Move._Event(obj, evt);
        var xy = EWA$UI$COMMON.Move._EventXY(e);
        if (obj.getAttribute("X") != null) {
            var x0 = obj.getAttribute("X") * 1;
            var dx = xy.X - x0;
            obj.style.left = obj.style.left.replace("px", "") * 1 + dx + "px";
            obj.setAttribute("X", xy.X);
        }
        if (obj.getAttribute("Y") != null) {
            var y0 = obj.getAttribute("Y") * 1;
            var dy = xy.Y - y0;
            obj.style.top = obj.style.top.replace("px", "") * 1 + dy + "px";
            obj.setAttribute("Y", xy.Y);
        }
        if (typeof e.preventDefault != "undefined") {
            e.preventDefault();
        }
        typeof e.stopPropagation != "undefined" ? e.stopPropagation() : e.cancelBubble = true;
    },
    _Event : function(obj, evt) {
        if (evt) {
            return evt;
        } else {
            return obj.ownerDocument.parentWindow.event;
        }
    },
    _EventXY : function(e) {
        if (EWA.B.IE) {
            return {
                X : e.x,
                Y : e.y
            };
        } else {
            return {
                X : e.pageX,
                Y : e.pageY
            };
        }
    }
};
// ---------------UI公共方法------------------------
var EWA$UI$COMMON = {
    Move : EWA$UI$COMMON$Move,
    /**
     * 获取鼠标位置
     * 
     * @return {}
     */
    GetMousePosition : function(e) {
        if (e == null) {
            e = event;
        }
        if (EWA.B.IE) {
            return {
                X : e.x,
                Y : e.y
            };
        } else {
            return {
                X : e.pageX,
                Y : e.pageY
            };
        }
    },
    /**
     * 
     * @param {}
     *            objWindow
     * @param {}
     *            objTag
     * @param {}
     *            objStyle
     * @param {}
     *            objParent
     * @return {}
     */
    CreateObject : function(objWindow, objTag, objStyle, objParent) { // 生成新对象
        /**
         * 在指定的目标窗口(objWindow)中生成新对象 objWindow 生成对象的窗体 objTag 对象的 tagName
         * objStyle 对象的样式 objParent 对象的母体
         */
        var obj = objWindow.document.createElement(objTag);
        if (objStyle != null && objStyle.trim().length > 0) {
            if (EWA.B.IE) {
                obj.style.cssText = objStyle;
            } else {
                obj.setAttribute("style", objStyle);
            }
        }
        if (objParent != null) {
            objParent.appendChild(obj);
        }
        return obj;
    },
    SetStyle : function(obj, style) {
        if (EWA.B.IE) {
            obj.style.cssText = style;
        } else {
            obj.setAttribute("style", style);
        }
    },
    GetPosition : function(obj) { // 计算位置
        var o1 = obj;
        var x,
            y;
        x = y = 0;
        do {
            x += o1.offsetLeft * 1;
            y += o1.offsetTop * 1;
            if (o1.tagName == "DIV") {
                x -= o1.scrollLeft;
                y -= o1.scrollTop;
            }
            o1 = o1.offsetParent;
        } while (o1 != null && o1.tagName != "BODY" && o1.tagName != "HTML");
        y += obj.offsetHeight * 1;
        var location = {
            X : x,
            Y : y
        };
        return location;
    },
    Dispose : function(obj) { // 注销对象和子对象方法，避免IE内存泄露
        if (!EWA.B.IE) {
            return;
        }
        if (obj.attributes != null) {
            for (var i = 0; i < obj.attributes.length; i += 1) {
                if (obj.attributes[i] != null && typeof obj.attributes[i] == "function") {
                    obj.attributes[i] = null;
                }
            }
        }
        for (var i = 0; i < obj.childNodes.length; i += 1) {
            EWA$UI$COMMON.Dispose(obj.childNodes[i]);
        }
    },
    Drop : function(obj) {
        EWA$UI$COMMON.Dispose(obj);
        obj.parentNode.removeChild(obj);
    },
    /**
     * 动画扩展对象，开始大小，目标大小
     * 
     * @param {}
     *            obj
     * @param {Integer}
     *            expandedWidth
     * @param {Integer}
     *            expandedHeight
     * @param {Integer}
     *            inc
     */
    AniExpand : function(obj, expandedWidth, expandedHeight, inc, expandType) {
        if (inc == null || inc <= 0) {
            inc = 10;
        }
        var incc = 0;
        var dx = expandedWidth / (inc * 1.0);
        var dy = expandedHeight / (inc * 1.0);
        var maxX = obj.clientWidth + expandedWidth;
        var maxY = obj.clientHeight + expandedHeight;
        // document.title=maxX+','+maxY+','+obj.clientWidth+','+obj.clientHeight;
        var t = window.setInterval(function() {
            var size = EWA$UI$COMMON.GetObjSize(obj);
            if (incc < inc - 1) {
                var h = size.H + dy;
                var w = size.W + dx;
                if (h > maxY) {
                    h = maxY;
                }
                if (w > maxX) {
                    w = maxX;
                }
                EWA$UI$COMMON.SetSize(obj, w, h);
            } else {
                EWA$UI$COMMON.SetSize(obj, maxX, maxY);
            }
            var size1 = EWA$UI$COMMON.GetObjSize(obj);
            var ddx = size1.W - size.W;
            var ddy = size1.H - size.H;

            var loc = EWA$UI$COMMON.GetPosition(obj);
            loc.Y = loc.Y - obj.clientHeight - obj.style.borderTopWidth.replace('px', '') * 1
                - obj.style.borderBottomWidth.replace('px', '') * 1;
            if (expandType == 'LEFT_TOP') {
                // nothing to do;
            } else if (expandType == 'LEFT_BOTTOM') {
                var top = loc.Y - ddy;
                var left = loc.X;
                EWA$UI$COMMON.MoveTo(obj, left, top);
            } else if (expandType == 'RIGHT_TOP') {
                var top = loc.Y;
                var left = loc.X - ddx;
                EWA$UI$COMMON.MoveTo(obj, left, top);
            } else if (expandType == 'RIGHT_BOTTOM') {
                var top = loc.Y - ddy;
                var left = loc.X - ddx;
                EWA$UI$COMMON.MoveTo(obj, left, top);
            } else {
                var top = loc.Y * 1 - ddy / 2;
                var left = loc.X * 1 - ddx / 2;
                // obj.innerHTML=obj.innerHTML+'<br>'+left+','+top+','+ddx+','+ddy+','+loc.Y;
                EWA$UI$COMMON.MoveTo(obj, left, top);
                EWA._TmpAniObj = obj;
            }
            incc++;
            if (incc >= inc) {
                window.clearInterval(t);
                if (EWA.UI.Utils.AniExpandCompleateFunction) {
                    EWA.UI.Utils.AniExpandCompleateFunction();
                    EWA.UI.Utils.AniExpandCompleateFunction = null;
                }
            }
        }, 12);
    },
    AniExpandTo : function(obj, dW, dH, inc, expandType) {
        if (inc == null || inc <= 0) {
            inc = 10;
        }
        var size = EWA$UI$COMMON.GetObjSize(obj);
        var expW = dW - size.W;
        var expH = dH - size.H;
        this.AniExpand(obj, expW, expH, inc, expandType);
    },
    SetSize : function(obj, width, height) {
        obj.style.width = width + 'px';
        obj.style.height = height + 'px';
    },
    MoveTo : function(obj, x, y) {
        obj.style.left = x + 'px';
        obj.style.top = y + 'px';
    },
    MoveCenter : function(obj) {
        // var xy = this.GetPosition(obj);
        var win = this._GetOwnerWindow(obj);

        var size = this.GetObjSize(obj);
        var docSize = this.GetDocSize(win);
        var dx = (docSize.W - size.W) / 2;
        var dy = (docSize.H - size.H) / 2;
        this.MoveTo(obj, dx, dy);
    },
    GetObjSize : function(obj) {
        var w = obj.clientWidth;
        var h = obj.clientHeight;
        return {
            H : h,
            W : w
        };
    },
    /**
     * 获取窗体尺寸
     * 
     * @param {}
     *            win
     * @return {}
     */
    GetDocSize : function(win) {
        if (win == null) {
            win = window;
        }
        var doc = win.document;
        var w = doc.body.clientWidth;
        var h = doc.compatMode == "CSS1Compat" ? doc.documentElement.clientHeight : doc.body.clientHeight;
        var h3 = win.document.body.scrollTop;
        var w3 = win.document.body.scrollLeft;
        return {
            W : w,
            H : h,
            SH : h3, // 滚动条高度
            SW : w3
        // 滚动条宽度
        };
    },
    _GetOwnerWindow : function(obj) {
        return EWA.B.IE ? obj.ownerDocument.parentWindow : obj.ownerDocument.defaultView;
    }
};
// ---------------------------------------

EWA.UI.Utils = EWA$UI$COMMON;

EWA.UI.ImgResize = function(oImg, width, height) {}



// 检查Iframe是否加载完毕;
function EWA_ChkIframeOk(f, func) {
    var w = f.contentWindow;
    if (w.location && w.location.href != 'about:blank' && w.document && w.document.readyState == 'complete') {
        if (func) {
            func(w, f);
        }
    } else {
        setTimeout(function() {
            EWA_ChkIframeOk(f, func)
        }, 111);
    }
}
// 从 ewa_ad 挪过来
EWA.UI.Utils.FadeIn = function(objIn, objOut, step, timeSpan, afterFunction) {
    if (objIn == objOut) {
        return;
    }
    objOut.setAttribute('alpha', 100);
    objIn.style.display = '';
    objIn.style.zIndex = -1000;
    objIn.style.filter = 'Alpha(Opacity=100)';
    objIn.style.opacity = 1;

    objOut.style.zIndex = 1000;
    objOut.style.display = '';
    objOut.style.filter = 'Alpha(Opacity=100)';
    objOut.style.opacity = 1;

    EWA.UI.Utils.FADE_IN_OBJ = objIn;
    EWA.UI.Utils.FADE_OUT_OBJ = objOut;
    EWA.UI.Utils.FADE_STEP = step;
    EWA.UI.Utils.FADE_TIME_SPAN = timeSpan;
    EWA.UI.Utils.FADE_AFTER = afterFunction;

    window.setTimeout(EWA.UI.Utils.FadeInTimer, EWA.UI.Utils.FADE_TIME_SPAN);
};
EWA.UI.Utils.FadeInTimer = function() {
    try {
        var alpha = EWA.UI.Utils.FADE_OUT_OBJ.getAttribute('alpha') * 1 - EWA.UI.Utils.FADE_STEP;
        EWA.UI.Utils.FADE_OUT_OBJ.setAttribute('alpha', alpha);
        if (alpha <= 0) {
            EWA.UI.Utils.FADE_OUT_OBJ.style.display = 'none';
            EWA.UI.Utils.FADE_OUT_OBJ.setAttribute('alpha', 0);

            EWA.UI.Utils.FADE_OUT_OBJ.style.filter = 'Alpha(Opacity=100)';
            EWA.UI.Utils.FADE_OUT_OBJ.style.opacity = 1;

            EWA.UI.Utils.FADE_AFTER.ChangeAfter();

            EWA.UI.Utils.FADE_IN_OBJ = null;
            EWA.UI.Utils.FADE_OUT_OBJ = null;
            EWA.UI.Utils.FADE_STEP = null;
            EWA.UI.Utils.FADE_TIME_SPAN = null;
            EWA.UI.Utils.FADE_AFTER = null;
            return;
        }
        EWA.UI.Utils.FADE_OUT_OBJ.style.filter = 'Alpha(Opacity=' + alpha + ')';
        EWA.UI.Utils.FADE_OUT_OBJ.style.opacity = alpha * 1.0 / 100.0;
    } catch (e) {}
    window.setTimeout(EWA.UI.Utils.FadeInTimer, EWA.UI.Utils.FADE_TIME_SPAN);
};/**
 * excel 类
 */
function EWA_UI_ExcelClass() {
	this._Tb = null;
	this._HeaderRowSize = 1;
	this._ClassName = "";
	this._LeftColSize = 1;
	this._Top=null;
	this._Left=null;
	this._Height=null;
	this._DivTop=null;
	this._DivLeft=null;
	this._LeftHeader=null;
	this._ScrollParent=null;
	this.Init = function(tb, headerRowSize, leftColSize, className, scrollParent) {
		this._Tb = tb;

		// $(tb).find('td').each(function(){
		// $(this).css('width',$(this).width());
		// });
		var offset = $(tb).offset();
		this._Top = offset.top;
		this._Left = offset.left;
		this._Height = $(tb).parent()[0].clientHeight;

		this._HeaderRowSize = headerRowSize;
		this._LeftColSize = leftColSize;
		this._ClassName = className;
		this._ScrollParent = scrollParent || document.body;

		this._Create();

	};
	this._Create = function() {
		var tb = this._Tb;
		// top table
		var tb2 = tb.cloneNode(true);
		tb2.removeAttribute('onmouseout');
		tb2.removeAttribute('onmousedown');
		tb2.removeAttribute('onmouseover');

		$(tb2).css('width', $(tb).width());
		for (var i = tb2.rows.length - 1; i >= this._HeaderRowSize; i--) {
			tb2.deleteRow(i);
		}
		for (var m = 0; m < this._HeaderRowSize; m++) {
			var r1 = tb2.rows[m];
			var r2 = tb.rows[m];
			for (var i = 0; i < r1.cells.length; i++) {
				var cell = r1.cells[i];
				var refCell = r2.cells[i];
				$(cell).css('width', $(refCell).width());
			}
		}
		// top table
		// tb2.rows[0].deleteCell(0);
		// var headerLeft = tb.rows[0].cells[0].offsetWidth + 1;
		var headerLeft = 0;
		this._DivTop = document.createElement("div");
		this._DivTop.id = "tb_header_con" + this._ClassName;
		var cssTop = {
			position : "fixed",
			display : "none",
			top : 0,
			// height : $(tb.rows[0].cells[0]).height() + 4,
			left : this._Left + headerLeft,
			overflow : 'hidden'
		};
		$(this._DivTop).css(cssTop);
		$(this._DivTop).append(tb2);

		$(this._Tb).parent().append(this._DivTop);

		this._LeftHeader = this._Left + headerLeft;

		// left table
		var tb3 = tb.cloneNode(true);
		tb3.removeAttribute('onmouseout');
		tb3.removeAttribute('onmousedown');
		tb3.removeAttribute('onmouseover');

		$(tb3).find("td").attr("id", null);

		var sidebarWidth = tb.rows[0].cells[0].offsetWidth + 2;

		this._DivLeft = document.createElement("div");
		this._DivLeft.id = "tb_sidebar_con" + this._ClassName;

		this._DivLeft.appendChild(tb3);
		this._DivLeft.style.position = "fixed";
		this._DivLeft.style.top = this._Top + 'px';
		this._DivLeft.style.left = this._Left + "px";
		this._DivLeft.style.overflow = 'hidden';
		this._DivLeft.style.width = sidebarWidth + 'px';
		this._DivLeft.style.height = this._Height + 'px';

		$(this._Tb).parent().append(this._DivLeft);

		var c = this;
		// addEvent(this._ScrollParent, 'scroll', function() {
		// c.OnScroll(evt);
		// });
		try {
			this._ScrollParent.onscroll = function() {
				try {
					c.OnScroll();
				} catch (e) {
					console.log(e);
				}
			};
		} catch (e) {
			console.log(e);
		}
		console.log(this._ScrollParent.onscroll)
	};
	this.OnScroll = function() {
		var c = this;
		if (c._ScrollParent.scrollTop > c._Top
			&& (c._ScrollParent.scrollTop < c._Top + this._Height || c._ScrollParent != document.body)) {
			c._DivTop.style.display = '';
			$(c._DivTop).css({
				left : (c._LeftHeader - c._ScrollParent.scrollLeft)
			});
		} else {
			// console.log(this._ScrollParent.scrollTop)
			c._DivTop.style.display = 'none';
		}
		$(c._DivLeft).css({
			top : (c._Top - c._ScrollParent.scrollTop),
			height : c._Height + c._ScrollParent.scrollTop
		});
	}
}/**
 * 移动类<br>
 * 调用方式 var mv=new EWA.UI.Move(); mv.Init(mv);<br>
 * 移动对象应是绝对位置<br>
 * 容器对象可以是任何位置
 */
EWA.UI.Move = function () {
    this._BackgroundObjectList = [];
    this._MoveObjectList = [];
    this._MaxIndex = 199999;
    this.IsMoveX = true;
    this.IsMoveY = true;
    this.MoveStep = 1;

    /**
	 * 添加需要改变尺寸的移动
	 * 
	 * @param {}
	 *            a 对象本身，例如： var mv=new EWA.UI.Move(); mv.Init(mv);
	 */
    this.Init = function (a) {
        addEvent(document.body, 'mousedown', function (event) {
            a.OnMouseDown(event);
        });
        addEvent(document.body, 'mousemove', function (event) {
            a.OnMouseMove(event);
        });
        addEvent(document.body, 'mouseup', function (event) {
            a.OnMouseUp(event);
        });
        EWA_COMMON_MV_OBJECT = null;
    };

    this.AddBackgroundObjs = function (arrObjs) {
        for (var i = 0; i < arrObjs.length; i++) {
            this.AddBackgroundObj(arrObjs[i]);
        }
    };
    this.ReCalcBackgroundObjs = function () {
        for (var i = 0; i < this._BackgroundObjectList.length; i++) {
            var o1 = this._BackgroundObjectList[i];
            var p = EWA.UI.Utils.GetPosition(o1.obj);
            var s = EWA.UI.Utils.GetObjSize(o1.obj);
            o1.x0 = p.X;
            o1.x1 = p.X + s.W;
            o1.y0 = p.Y - s.H;
            o1.y1 = p.Y;
        }
    };
    this.AddBackgroundObj = function (obj) {
        var p = EWA.UI.Utils.GetPosition(obj);
        var s = EWA.UI.Utils.GetObjSize(obj);
        var o = {
            x0 : p.X,
            x1 : p.X + s.W,
            y0 : p.Y - s.H,
            y1 : p.Y,
            obj : obj
        };
        this._BackgroundObjectList.push(o);
    };
    this.CheckBackgroundObj = function (x, y) {
        for ( var i in this._BackgroundObjectList) {
            var o = this._BackgroundObjectList[i];
            if (o.x0 <= x && o.x1 >= x && o.y0 <= y && o.y1 >= y) {
                return o;
            }
        }
    };
    this.ClearLastBackgroundObj = function () {
        if (this.LastCheckedBackground) {
            this.LastCheckedBackground.obj.style.backgroundColor = this.LastCheckedBackground.obj
                    .getAttribute('_mv_last_bc');
            this.LastCheckedBackground = null;
        }
    }
    this.ClearAll = function () {
        for (var i = 0; i < this._MoveObjectList.length; i++) {
            var a = this._MoveObjectList[i];
            if (a.B.parentNode) {
                a.B.parentNode.removeChild(a.B);
            }

        }

        this._MoveObjectList = [];
    }

    /**
	 * 添加需要移动的对象
	 * 
	 * @param {}
	 *            objMonitor 相应移动的对象，即鼠标点击相应移动事件的对象
	 * @param {}
	 *            objMove 页面移动的对象
	 * @param {}
	 *            afterJs 鼠标按键抬起后执行的脚本
	 * @param {}
	 *            objParent 移动的容器
	 */
    this.AddMoveObject = function (objMonitor, objMove, mouseUpJs, objParent,
            moveJs, mouseDownJs) {
        objMonitor.setAttribute('ewa_move', 1);
        objMonitor.setAttribute('ewa_move_type', 'MOVE');
        var loc = objParent == null ? null : EWA.UI.Postion(objParent);
        var a = {
            A : objMonitor,
            B : objMove,
            JS : mouseUpJs,
            T : "MOVE",
            MOVE_X : true,
            MOVE_Y : true,
            L : loc,
            JSM : moveJs,
            JS_MOUSE_DOWN : mouseDownJs
        };
        this._MoveObjectList.push(a);
    };
    /**
	 * 添加需要移动的对象(X方向)
	 * 
	 * @param {}
	 *            objMonitor 相应移动的对象，即鼠标点击相应移动事件的对象
	 * @param {}
	 *            objMove 页面移动的对象
	 * @param {}
	 *            afterJs 鼠标按键抬起后执行的脚本
	 * @param {}
	 *            objParent 移动的容器
	 */
    this.AddMoveObjectX = function (objMonitor, objMove, mouseUpJs, objParent,
            moveJs, mouseDownJs) {
        objMonitor.setAttribute('ewa_move', 1);
        objMonitor.setAttribute('ewa_move_type', 'MOVE');
        var loc = objParent == null ? null : EWA.UI.Postion(objParent);
        var a = {
            A : objMonitor,
            B : objMove,
            JS : mouseUpJs,
            T : "MOVE",
            MOVE_X : true,
            MOVE_Y : false,
            L : loc,
            JSM : moveJs,
            JS_MOUSE_DOWN : mouseDownJs
        };
        this._MoveObjectList.push(a);
    };
    /**
	 * 添加需要移动的对象(Y方向)
	 * 
	 * @param {}
	 *            objMonitor 相应移动的对象，即鼠标点击相应移动事件的对象
	 * @param {}
	 *            objMove 页面移动的对象
	 * @param {}
	 *            afterJs 鼠标按键抬起后执行的脚本
	 * @param {}
	 *            objParent 移动的容器
	 */
    this.AddMoveObjectY = function (objMonitor, objMove, mouseUpJs, objParent,
            moveJs, mouseDownJs) {
        objMonitor.setAttribute('ewa_move', 1);
        objMonitor.setAttribute('ewa_move_type', 'MOVE');
        var loc = objParent == null ? null : EWA.UI.Postion(objParent);
        var a = {
            A : objMonitor,
            B : objMove,
            JS : mouseUpJs,
            T : "MOVE",
            MOVE_X : false,
            MOVE_Y : true,
            L : loc,
            JSM : moveJs,
            JS_MOUSE_DOWN : mouseDownJs
        };
        this._MoveObjectList.push(a);
    };
    /**
	 * 添加需要改变尺寸的移动
	 * 
	 * @param {}
	 *            objMonitor 相应移动的对象，即鼠标点击相应移动事件的对象
	 * @param {}
	 *            objMove 页面移动的对象
	 * @param {}
	 *            afterJs 鼠标按键抬起后执行的脚本
	 * @param {}
	 *            objParent 移动的容器
	 * @param {}
	 *            isFixed 是否固定比例
	 */
    this.AddSizeObject = function (objMonitor, objMove, afterJs, objParent,
            isFixed, moveJs, mouseDownJs) {
        objMonitor.setAttribute('ewa_move', 1);
        objMonitor.setAttribute('ewa_move_type', 'SIZE');
        objMove.style.width = objMove.clientWidth + 'px';
        var loc = objParent == null ? null : EWA.UI.Postion(objParent);
        var loc1 = isFixed ? EWA.UI.Postion(objMove) : null;
        var a = {
            A : objMonitor,
            B : objMove,
            JS : afterJs,
            T : "SIZE",
            L : loc,
            M : loc1,
            JSM : moveJs,
            JS_MOUSE_DOWN : mouseDownJs
        };
        this._MoveObjectList.push(a);
    }

    /**
	 * 
	 */
    this.OnMouseDown = function (evt) {
        var obj = this._GetEventTarget(evt);
        if (obj == null) {
            return;
        }
        var objA = this._GetObject(obj);
        if (objA == null || objA.A.getAttribute('ewa_move') != '1') {
            return;
        }
        var xy = this._GetEventXY(evt);
        this._MaxIndex++;
        objA.B.style.zIndex = this._MaxIndex;
        objA.B.setAttribute("_EWA_MOUSE_DOWN", 1);
        objA.B.setAttribute("_EWA_MOUSE_X", xy.X);
        objA.B.setAttribute("_EWA_MOUSE_Y", xy.Y);
        if ($(objA.B).css('position') != 'absolute') {
            var p = $(objA.B).position();
            objA.B.style.position = 'absolute';
            objA.B.style.left = p.left + 'px';
            objA.B.style.top = p.top + 'px';

        }
        EWA_COMMON_MV_OBJECT = objA;
        this.ReCalcBackgroundObjs();
        if (objA.JS_MOUSE_DOWN) { // 鼠标点击事件
            objA.JS_MOUSE_DOWN(objA);
        }
    };
    this.OnMouseMove = function (evt) {
        if (EWA_COMMON_MV_OBJECT == null) {
            return;
        }
        var objA = EWA_COMMON_MV_OBJECT;
        var obj = objA.B;
        if (obj.getAttribute("_EWA_MOUSE_DOWN") != "1") {
            return;
        }
        var xy = this._GetEventXY(evt);
        var x = obj.getAttribute("_EWA_MOUSE_X") * 1;
        var y = obj.getAttribute("_EWA_MOUSE_Y") * 1;
        var dx = xy.X - x; // x 轴移动位置
        var dy = xy.Y - y; // y 轴移动位置
        // 移动位置< this.MoveStep，则不移动
        if (Math.abs(dx) < this.MoveStep && Math.abs(dy) < this.MoveStep) {
            return;
        }

        var loc = objA.L; // 移动对象所在容器的位置信息

        var left = $(obj).css('left').replace("px", "") * 1 + dx;
        var top = $(obj).css('top').replace("px", "") * 1 + dy;

        var right;
        var bottom;
        if (objA.T == 'MOVE') {
            if (loc == null) {
                if (left < 0)
                    left = 0;
                if (top < 0)
                    top = 0;
            } else {
                var w = obj.offsetWidth;
                var h = obj.offsetHeight;
                
                
                
                if (left < loc.Left) {
                    left = loc.Left;
                } else if (left + w > loc.Right) {
                    left = loc.Right - w;
                }
                right = loc.Right - (left + w) ;
                if (top < loc.Top) {
                    top = loc.Top;
                } else if (top + h > loc.Bottom) {
                    top = loc.Bottom - h;
                }
                
                bottom = loc.Bottom - (top +h);
                // console.log(left, top, right, bottom, loc);
                obj.setAttribute('ewa_mv_left', left.fm(0));
                obj.setAttribute('ewa_mv_top', top.fm(0));
                obj.setAttribute('ewa_mv_bottom', bottom.fm(0));
                obj.setAttribute('ewa_mv_right', right.fm(0));
            }
            // console.log(this.IsMoveX, this.IsMoveY);
            if (this.IsMoveX && objA.MOVE_X) {
                obj.style.left = left + "px";
            }
            if (this.IsMoveY && objA.MOVE_Y) {
                obj.style.top = top + "px";
            }
        } else {
            // scale
            var width = obj.style.width.replace("px", "") * 1 + dx;
            var height = obj.style.height.replace("px", "") * 1 + dy;
            if (width < 10) {
                width = 10;
            }
            if (height < 10) {
                height = 10;
            }
            if (loc != null) {
                if (objA.M != null) { // 固定比例
                    var r = (objA.M.Width * 1.0 / objA.M.Height); // 原始比例
                    if (r == 1) { // 矩形
                        width = obj.style.width.replace("px", "") * 1;
                        height = width;
                        var d_len = Math.sqrt(dx * dx + dy * dy); // 利用勾股定理求弦长
                        if (dy > 0 || dx < 0) {
                            d_len = d_len * -1;
                        }
                        // console.log(dx, dy, d_len);

                        var css = {
                            left : $(obj).position().left - d_len / 4,
                            top : $(obj).position().top - d_len / 4,
                            width : $(obj).width() + d_len / 2,
                            height : $(obj).height() + d_len / 2
                        }
                        if (css.height + css.top > loc.Bottom
                                || css.top < loc.Top
                                || css.left + css.width > loc.Right
                                || css.left < loc.Left) {
                            return;
                        }
                        if (css.width < 50) {
                            return;
                        }
                        $(obj).css(css);
                        if (objA.JSM) {
                            objA.JSM(objA.B, objA.A);
                        }
                        return;

                    } else {
                        var r1 = width / height;
                        if (r1 > r) {
                            height = width / r;
                        } else if (r1 < r) {
                            width = height * r;
                        }
                        if (left + width > loc.Right) {
                            width = loc.Right - left;
                            height = width / r;
                        }
                        if (top + height > loc.Bottom) {
                            height = loc.Bottom - top;
                            width = height * r;
                        }
                    }
                } else {
                    if (left + width > loc.Right) {
                        width = loc.Right - left;
                    }
                    if (top + height > loc.Bottom) {
                        height = loc.Bottom - top;
                    }
                }
            }
            if (this.IsMoveX) {
                obj.style.width = width + 'px';
            }
            if (this.IsMoveY) {
                obj.style.height = height + 'px';
            }
        }
        obj.setAttribute("_EWA_MOUSE_X", xy.X);
        obj.setAttribute("_EWA_MOUSE_Y", xy.Y);
        if (objA.JSM) {
            objA.JSM(objA.B, objA.A);
        }
        var bo = this.CheckBackgroundObj(xy.X, xy.Y);
        if (bo) {
            if (bo == this.LastCheckedBackground) {
                return;
            }
            if (this.LastCheckedBackground) {
                this.LastCheckedBackground.obj.style.backgroundColor = this.LastCheckedBackground.obj
                        .getAttribute('_mv_last_bc');
            }
            this.LastCheckedBackground = bo;
            bo.obj.setAttribute('_mv_last_bc', bo.obj.style.backgroundColor);
            bo.obj.style.backgroundColor = 'lightyellow';
        } else {
            if (this.LastCheckedBackground) {
                this.LastCheckedBackground.obj.style.backgroundColor = this.LastCheckedBackground.obj
                        .getAttribute('_mv_last_bc');
            }
        }
    };
    this.OnMouseUp = function (evt) {
        var objA = EWA_COMMON_MV_OBJECT;
        if (objA == null) {
            return;
        }
        for (var i = 0; i < this._MoveObjectList.length; i++) {
            this._MoveObjectList[i].B.setAttribute("_EWA_MOUSE_DOWN", 0);
        }
        if (objA.JS != null) {
            objA.JS(objA.B, objA.A);
        }
        EWA_COMMON_MV_OBJECT = null;
    };
    this._GetObject = function (obj) {
        for (var i = 0; i < this._MoveObjectList.length; i++) {
            var objMoniter = this._MoveObjectList[i].A;
            if (objMoniter == obj) {
                return this._MoveObjectList[i];
            }
        }
        // check children
        for (var i = 0; i < this._MoveObjectList.length; i++) {
            var objMoniter = this._MoveObjectList[i].A;
            var objs = objMoniter.getElementsByTagName(obj.tagName);
            for (var m = 0; m < objs.length; m++) {
                var objA = this._MoveObjectList[i];
                if (objs[m] == obj) {
                    return objA;
                }
            }
        }
        return null;
    };
    this._GetEventTarget = function (evt) {
        if (EWA.B.IE) {
            return event.srcElement;
        } else {
            return evt.target;
        }
    };
    this._GetEventXY = function (e) {
        if (EWA.B.IE) {
            return {
                X : e.x,
                Y : e.y
            };
        } else {
            return {
                X : e.pageX,
                Y : e.pageY
            };
        }
    };
}/**
 * 菜单项类
 */
function EWA_UI_MenuItemClass() {
	this.Img = null; // 图片
	this.Txt = null; // 显示文字
	this.Cmd = null; // 脚本
	this.Group = null; // 菜单组
}

/**
 * 菜单类
 * 
 * @param className
 *            类名
 */
function EWA_UI_MenuClass(className) {
	this.ClassName = className;
	this.MenuShowType = "";

	this.Dialog = null;// new EWA_UI_DialogClass();
	this.Dialogs = new Array();
	this._LastObj = null;
	this._ItemsDiv = null;

	// 被点击的菜单项 2018-11-10
	this.clickedItem = null;


	this.Click = function(e, obj) {
		if(this.clickBeforeEvent){
			this.clickBeforeEvent (e, obj);
		}
		if (this.MenuShowType == 'LEFT') {
			// if (this._LastObj != null) {
			// }
		} else {
			if (this._LastObj != null) {
				this._LastObj.className = this._LastObj.className.replace('_mv1', '');
			}
			this._LastObj = null;
			typeof e.stopPropagation != "undefined" ? e.stopPropagation() : e.cancelBubble = true;
			this._HiddenDialogs();
		}
		EWA.C.Utils.RunCmd(obj);// 执行cmd
		if(this.clickAfterEvent){
			this.clickAfterEvent (e, obj);
		}
	};
	this.OnClick = function(event, obj) {
		this.clickedItem = obj;
		if (this.MenuShowType == 'LEFT') {
			var menuDiv = obj.parentNode.parentNode;
			var po = obj.parentNode;
			var co = obj.parentNode.parentNode.childNodes[1];
			if (co == null) {
				return;
			}
			if (co.childNodes.length == 0) {// 子节点
				if (this._LastCkObj) {
					this._LastCkObj.style.backgroundColor = '';
				}
				po.style.backgroundColor = '#ccc';
				this._LastCkObj = po;
			} else {
				if (co.style.display == 'none') {
					co.style.display = '';
					$(menuDiv).addClass('ewa-lmenu-show')
				} else {
					$(menuDiv).removeClass('ewa-lmenu-show')
					co.style.display = 'none';
				}
				if (window.event) {
					event.cancelBubble = true;
				} else {
					event.stopPropagation();
				}
			}
			this.Click(event, obj);
		} else {
			if (obj.getAttribute('EWA_MF_PID') == "") {
				this._HiddenDialogs();
				var lvl = 0;
				if (this.Dialogs.length <= lvl) {
					this.Dialogs.push(this._CreateDialog());
				}
				var items = this._ShowPullDownMenu(obj, this.Dialogs[lvl]);
				if (items > 0) {
					this.ShowByObject(obj, this.Dialogs[lvl], lvl);
					return;
				}
			}
			this.Click(event, obj);
		}

	}
	this._CalcLevel = function(obj) {
		var lvl = 0;
		var o1 = obj;
		while (o1.getAttribute('EWA_MF_PID') != "") {
			lvl += 1;
			o1 = document.getElementById(o1.getAttribute('EWA_MF_PID'));
			if (o1 == null) {
				return null;
			}
		}
		return lvl;
	}
	this._ShowPullDownMenu = function(obj, dia) {
		var o = $X(dia.FrameContent).childNodes[0].rows[0].cells[0];
		while (o.childNodes.length > 0) {
			var menuItem = o.childNodes[0];
			this._ItemsDiv.appendChild(menuItem);
		}
		var al = new Array();
		for (var i = 0; i < this._ItemsDiv.childNodes.length; i++) {
			var o2 = this._ItemsDiv.childNodes[i];
			if (o2.innerHTML.toUpperCase().indexOf('<HR') > 0) {
			} else {
				o2.style.paddingRight = '10px';
			}
			if (o2.getAttribute('EWA_MF_PID') == obj.id) {
				al.push(o2);
			}
		}
		var len = al.length;
		for (var i = 0; i < al.length; i++) {
			o.appendChild(al[i]);
			var isHaveChildren = this._CheckChildren(al[i].id);
			if (isHaveChildren) {
				var tdd = al[i].childNodes[0].rows[0].cells[2];
				if (tdd.getAttribute('gdx') == null || tdd.getAttribute('gdx') == '') {
					tdd.innerHTML += " +";
					tdd.setAttribute('gdx', 'gdx');
				}
				al[i].setAttribute('EWA_MF_CHILD', "1");
			} else {
				al[i].setAttribute('EWA_MF_CHILD', "0");
			}
			al[i] = null;
		}
		al.length = 0;
		al = null;
		$X(dia.FrameContent).childNodes[0].style.height = 'auto';// 保证菜单框高度
		return len
	}
	this._CheckChildren = function(id) {
		for (var i = 0; i < this._ItemsDiv.childNodes.length; i++) {
			var o2 = this._ItemsDiv.childNodes[i];
			if (o2.getAttribute('EWA_MF_PID') == id) {
				return true;
			}
		}
		return false;
	};

	this.InstallMenus = function(menusId, parentId, showType) {

		if (showType == 'METRO') {
			var menus = [];
			var map = {};
			$('.ewa_menu_m').each(function() {
				var o = $(this);
				var d = {};
				d.id = o.attr('id');
				d.pid = o.attr('EWA_MF_PID');
				d.url = o.attr('EWA_CMD');
				d.icon = o.find('.ewa_menu_m0').attr('class');
				d.title = o.text().trim();
				if (d.icon) {
					d.icon = d.icon.replace('ewa_menu_m0', '').trim();
				}
				if (d.pid == "") {
					d.pid = "0";
					d.subs = [];
					map[d.id] = d;
					menus.push(d);
				} else {
					map[d.pid].subs.push(d);
				}

			});
			// console.log(menus);
			var pid = 'EWA_FRAME_MAIN';
			var isShowBlank = true;
			var className = 'item';
			EWA_UI_Metro.menus = menus;

			EWA_UI_Metro.add_menus(menus, pid, className, null, null, isShowBlank);
			return;
		}

		this.MenuShowType = showType;

		var ms = $X(menusId);
		var p = $X(parentId);
		if (p == null) {
			alert('MenuShow defined error (' + parentId + ')');
			return;
		}
		this._ItemsDiv = ms;
		var s1 = "<table onselectstart='return false' style='cursor:pointer;-moz-user-select:none;' border=0 cellspacing=0 cellpadding=0>";
		s1 += "</table>";

		var al = [];
		p.innerHTML = s1;
		var tb = p.childNodes[0];
		// 获取第一层菜单
		for (var i = 0; i < ms.childNodes.length; i++) {
			var o = ms.childNodes[i];
			if (o.tagName == 'DIV' && o.getAttribute('EWA_MF_PID') == "") {
				al.push(o);
			}
		}
		if (this.MenuShowType == '' || this.MenuShowType == 'TOP') {
			tb.insertRow(-1);
			for (var i = 0; i < al.length; i++) {
				var td = tb.rows[0].insertCell(-1);
				td.appendChild(al[i]);
			}
		} else {
			tb.style.width = '100%';
			this._InstallMenusLeft(tb, ms, al, menusId);
		}
		al.length = 0;
		al = null;

	};
	this._InstallMenusLeft = function(tb, ms, al, menusId) {
		$(tb).addClass('ewa-lmenu');
		// 生成第一层菜单
		for (var i = 0; i < al.length; i++) {
			var tr = tb.insertRow(-1);
			var td = tr.insertCell(-1);
			var div = document.createElement('div');
			div.innerHTML = '<div class="ewa_lmenu_bar" des="rq1"></div><div  des="rq2"></div>'
			div.childNodes[1].style.paddingLeft = '5px';
			td.appendChild(div);
			al[i].style.height = '100%';
			div.childNodes[0].appendChild(al[i]);
			if(i == 0){
				$(div).addClass('ewa-lmenu-show')
			} else {
				div.childNodes[1].style.display = 'none';
			}
		}

		var subMenus = ms.childNodes;
		while (ms.childNodes.length > 0) {
			var o = subMenus[0];
			var pid = o.getAttribute('EWA_MF_PID');
			var div = document.createElement('div');
			div.innerHTML = '<div class="ewa_lmenu_bar1"></div><div style="padding-left:4px;display:none"></div>';
            if(!$X(pid)){
                console.warn('not found pid', pid, o);
                $(o).remove();
                continue;
            }
			var menu0 = $X(pid).parentNode.parentNode;
			$(menu0).addClass('ewa-lmenu-children');
			menu0.childNodes[1].appendChild(div);
			div.childNodes[0].appendChild(o);
		}
	};
	this._CreateDialog = function() {
		var dia = new EWA_UI_DialogClass();
		dia.Create();
		var s1 = "<table class='ewa_menu_down' border=0 width=100 cellspacing=0 cellpadding=0 onmousemove='window."
			+ this.ClassName + ".IsOut=false;' onmouseout='window." + this.ClassName
			+ ".IsOut=true; window.setTimeout(function(){var a=window." + this.ClassName
			+ ";a.AutoHidden();},1410);' onselectstart='return false' style='cursor:pointer;-moz-user-select:none;' >";
		s1 += "<tr><td></td></tr>";
		s1 += "</table>";
		dia.SetHtml(s1);
		return dia;
	};
	this.AutoHidden = function() {
		if (this.IsOut) {
			this._HiddenDialogs();
		}
	};
	this.Create = function(menuItems) {
		// this.Dialog.Height=menuItems.length*20+2;
		if (menuItems == null || menuItems.length == 0) {
			return;
		}
		this.Dialog = new EWA_UI_DialogClass();
		this.Dialog.Create();
		var ss = [];
		ss
			.push("<div class='ewa_menu_box' onmousemove='window."
				+ this.ClassName
				+ ".IsOut=false;' onmouseout='window."
				+ this.ClassName
				+ ".IsOut=true; var t1=new Date().getTime(); if(t1-$(this).attr(&quot;open_time&quot;)>1000){ window.setTimeout(function(){var a=window."
				+ this.ClassName
				+ ";a.AutoHidden(this);},1410);}'  onselectstart='return false' style='width:120px;cursor:pointer;-moz-user-select:none;'>");
		for (var i = 0; i < menuItems.length; i += 1) {
			var o = menuItems[i];
			ss.push("<div class='ewa_menu_m' EWA_MG=\"" + o.Group + "\" style='cursor:pointer' EWA_CMD=\"" + o.Cmd
				+ "\" onclick='" + this.ClassName + ".Click(event,this);' onmouseover='" + this.ClassName
				+ ".MouseOver(this);'><table boder=0 width=100% cellpadding=0 cellspacing=0>")
			if (o.Txt.toUpperCase().indexOf('<HR') >= 0) {
				ss.push("<tr><td colspan=2 style='white-space:nowrap'>" + o.Txt + "</td></tr></table></div>");
				continue;
			}
			ss.push("<tr><td class='ewa_menu_m0'>");
			var img = menuItems[i].Img;

			if (img != null && img.indexOf('index=0,size=0') < 0 && img.trim().length > 0) {
				if (img.indexOf('fa') >= 0) {
					ss.push('<i class="' + img + '"></i>');
				} else {
					ss.push("<img src=\"" + menuItems[i].Img + "\">");
				}
			}
			ss.push("</td><td class='ewa_menu_m1' style='white-space:nowrap'>" + menuItems[i].Txt + "</td></tr></table></div>");
		}
		ss.push("</div>");
		this.Dialog.SetHtml(ss.join(""));
	};
	this.HiddenMemu = function() {
		this.Dialog.Show(false);
		EWA.UI.CurMenu = null;
	};
	this.ShowByObject = function(obj, dia, lvl) {
		var loc = EWA.UI.Utils.GetPosition(obj);
		// 出发menu的对象
		this.SHOW_BY_OBJECT = obj;
		dia = dia || this.Dialog;
		if (lvl == null || lvl == 0) {
			dia.Move(loc.X, loc.Y);
		} else {
			var left = obj.offsetWidth;
			dia.Move(loc.X + left - 5, loc.Y - obj.offsetHeight + 4);
		}
		dia.Show(true);
		var o=$(dia.GetFrame()).find('.ewa_menu_box');
		o.attr('open_time',new Date().getTime());
		//console.log(o[0])
		dia.ResizeByContent();
	};

	/**
	 * 根据鼠标显示菜单
	 * 
	 * @param evt
	 *            window.event
	 * @param groupName
	 *            菜单组名称
	 */
	this.ShowByMouse = function(evt, groupName) {
		if(!this.Dialog){
			// 没有菜单
			return;
		}
		var m = 0;
		var ot = $X(this.Dialog.FrameContent).childNodes[0];
		if (groupName == null) {
			m = ot.childNodes.length;
		} else {
			for (var i = 0; i < ot.childNodes.length; i++) {
				var g = ot.childNodes[i].getAttribute('EWA_MG');
				if (g == groupName || groupName == null || groupName == "") {
					ot.childNodes[i].style.display = "";
					m++;
				} else {
					ot.childNodes[i].style.display = "none";
				}
			}
		}
		if (m > 0) {
			var x = evt.x ? evt.x : evt.pageX;
			var y = evt.y ? evt.y : evt.pageY;
			y += document.documentElement.scrollTop || document.body.scrollTop;
			x += document.documentElement.scrollLeft || document.body.scrollLeft;

			this.Dialog.Move(x, y);
			this.Dialog.Show(true);
			this.Dialog.ResizeByContent();
		} else {
			this.Dialog.Show(false);
		}
	};
	this.MouseOver = function(obj) {
		if (this._LastObj != null) {
			if (this.MenuShowType == 'LEFT') {
				// this._LastObj.style.backgroundColor = "";
				this._LastObj.parentNode.className = this._LastObj.parentNode.className.replace('_mv', '');
			} else {
				this._LastObj.className = this._LastObj.className.replace('_mv1', '');
			}
		}

		if (this.MenuShowType == 'LEFT') {
			this._LastObj = obj;
			// this._LastObj.style.backgroundColor = "#DDD";
			this._LastObj.parentNode.className = this._LastObj.parentNode.className + '_mv';
		} else {
			this._LastObj = obj;
			this.IsOut = false;
			this._LastObj.className = this._LastObj.className + '_mv1';
			if (EWA.UI.CurMenu == null) {
				EWA.UI.CurMenu = this;
			}
			var lvl = this._CalcLevel(obj);
			if (obj.getAttribute('EWA_MF_CHILD') == "1") {
				if (this.Dialogs.length <= lvl) {
					this.Dialogs.push(this._CreateDialog());
				}
				this._ShowPullDownMenu(obj, this.Dialogs[lvl]);
				this.ShowByObject(obj, this.Dialogs[lvl], lvl);
			} else {
				/*
				 * if(this.Dialogs.length > lvl+1){
				 * this.Dialogs[lvl+1].Show(false); }
				 */
			}
		}
	};

	this._HiddenDialogs = function() {
		if (this.Dialog != null) {
			this.Dialog.Show(false);
		}
		for (var i = 0; i < this.Dialogs.length; i++) {
			this.Dialogs[i].Show(false);
			var o = $X(this.Dialogs[i].FrameContent).childNodes[0].rows[0].cells[0];
			while (o.childNodes.length > 0) {
				this._ItemsDiv.appendChild(o.childNodes[0]);
			}
		}

	}
	this._InitEvent = function() {
		if (this.MenuShowType == 'LEFT') {
			return;
		}
		if (EWA.B.IE) {
			document.body.attachEvent("onclick", function() {
				if (typeof EWA.UI.CurMenu != 'undefined') {
					EWA.UI.CurMenu._HiddenDialogs();
				}
			});
		} else {
			document.body.addEventListener("click", function() {
				if (typeof EWA.UI.CurMenu != 'undefined') {
					EWA.UI.CurMenu._HiddenDialogs();
				}
			});
		}
	}
	// this._InitEvent();
}
var EWA_UI_Metro = {
	show_title : function(obj) {
		if (obj.getAttribute('_title') == "" || obj.getAttribute('_title') == null) {
			var ttt = obj.title;
			if (ttt == "" || ttt == null) {
				return;
			}
			obj.setAttribute("_title", ttt);
			obj.title = "";
		}
		$(".pop_title div").html(obj.getAttribute('_title'));

		var p = $(obj).offset();
		var w = $(obj).width();
		var h = $(".pop_title").height();
		var w1 = $(".pop_title").width();

		$(".pop_title").css('top', p.top - h - 8);
		$(".pop_title").show();
		$(".pop_title").css('left', p.left - (w1 - w) / 2);

	},

	item_click : function(obj) {
		var item = $(obj);
		var u = item.attr("u");
		var t = item.attr("_title");
		if (u) {
			if (u.startsWith("js:")) {
				var u1 = u.replace("js:", "");
				eval(u1);
				return;
			}
			if (u.indexOf('/') > 0) {
				u = u;
			} else if (u.indexOf('?') >= 0) {
				u = EWA.CP + "/EWA_STYLE/cgi-bin/" + u;
			} else {
				u = EWA.CP + "/EWA_STYLE/cgi-bin/?" + u;
			}
			top.AddTab(u, t);
		}
	},
	add_menus : function(menus, pid, className, cols, rows, isShowBlank) {
		this.g_menu_cols = window.g_menu_cols || 6; // 列数
		this.g_menu_rows = window.g_menu_rows || 3; // 行数
		this.menuLoadInRight = window.menuLoadInRight || false; // 是否在右侧加载菜单Ï

		// this.css();
		cols = cols || this.g_menu_cols;
		rows = rows || this.g_menu_rows;

		// 系统管理菜单
		for (var i = 0; i < menus.length; i++) {
			var item = menus[i];
			if (item && item.icon && item.icon.indexOf('gear')>0) {
				menus[i] = null;
				menus[cols * rows - 1] = item;
				break;
			}
		}

		var table = document.createElement('table');
		$X(pid).innerHTML = "";
		$X(pid).className = 'ewa-metro-menu';
		$X(pid).appendChild(table);
		$($X(pid)).append('<div class="pop_title" style="display: none;"><div>-</div><p></p></div>');
		$($X(pid)).css('background', 'transparent').css('border', 0);
		table.align = 'center';
		var idx = 0;
		var ss = [];
		for (var i = 0; i < rows; i++) {
			var hid = pid + '_htr_' + i;

			var tr1 = table.insertRow(-1);
			tr1.id = hid;
			var td1 = tr1.insertCell(-1);
			td1.colSpan = cols;
			tr1.style.display = 'none';
			td1.id = hid + 'a';

			var tr = table.insertRow(-1);

			for (var m = 0; m < cols; m++) {
				var item = menus[idx];
				idx++;
				var td = this.add_menu_item(tr, item, isShowBlank, idx, className, hid);
				if (item) {
					td.id = "M_" + item.id;
				}
				if (td && item && (item.all == null || item.all == true)) {
					var s1 = td.innerHTML;
					ss.push(s1);
				}

			}
		}
		if (!this._is_load_main_menu && this.menuLoadInRight) {
			parent.$("#RIGHT").html(ss.join(''));
			parent.$("#RIGHT .item").each(function() {
				$(this).append($(this).attr('_title'));
				$(this).attr("onmouseout", null);
				$(this).attr("onmouseover", null);
				$(this).attr("onclick", "EWA_UI_Metro.right_show_menu_sub(this,event)");
			});
		}
		this._is_load_main_menu = true;
	},
	add_menu_item : function(tr, item, isShowBlank, idx, className, hid) {
		if (isShowBlank || item) {
			var td = tr.insertCell(-1);
			var s = "<div class='" + className + "'><i id='memu_item_" + idx + "'></i></div>";
			td.innerHTML = s;
		}
		if (!item) {
			return;
		}

		var o = $(td).find('i');
		var op = o.parent();
		if (item.icon && item.icon.trim().length > 0) {
			if (item.icon.indexOf('fa') == 0) {
				o.attr("class", item.icon);
			} else {
				op.append("<table width=100% height=100%><tr><td align=center><img style='max-width:90%;max-height:90%' src='"
					+ item.icon + "' /></td></tr></table>");
				o.hide();
			}
		} else if (item.img) {
			op.append("<table width=100% height=100%><tr><td align=center><img  src='" + item.img + "' /></td></tr></table>");
			o.hide();
		}
		op.attr("_title", item.title);
		op.attr("onmouseover", 'EWA_UI_Metro.show_title(this)');
		op.attr("onmouseout", "$('.pop_title').hide()");
		op.attr("hid", hid);
		if (item.url) {
			op.attr("u", item.url);
			op.attr("onclick", "EWA_UI_Metro.item_click(this,event)");
		} else if (item.subs) {
			// sub menu
			op.attr('subs', JSON.stringify(item.subs));
			op.attr('onclick', "EWA_UI_Metro.show_menu_sub(this,event)");
		}
		td.id = "M_" + item.id;
		return td;
	},
	show_menu_sub : function(obj) {
		var t = $(obj);
		var cls = t.attr("class");
		var pid = t.attr('hid');
		if (window.last_open && window.last_open != obj) {
			window.last_open.click();
		}
		if (t.attr('is_open') == 1) { // 已经打开，关闭
			t.attr('is_open', "0");
			$X(pid).style.display = 'none';
			window.last_open = null;
			t.attr('class', cls.split(' ')[0]);

		} else {
			t.attr('is_open', "1");
			var menus = JSON.parse(obj.getAttribute('subs'));
			$X(pid).style.display = '';
			$X(pid).style.opacity = 0;
			EWA_UI_Metro.add_menus(menus, pid + 'a', 'item_sub', 9, Math.round(menus.length / 9 + 0.4), false);
			t.attr('class', cls + " open");
			$($X(pid)).animate({
				opacity : 1
			}, 300);
			window.last_open = obj;
			EWA_UI_Metro.load_msg_sub();
		}
		
		if(this.show_menu_sub_after){
			this.show_menu_sub_after(obj);
		}
	},
	css : function() {
		if (this._css_setted) {
			return;
		}
		var ss = [];
		ss.push(".nav_box {");
		ss.push("margin: auto;");
		ss.push("margin-top: 50px;");
		ss.push("}");
		ss.push(".nav_box .item {");
		ss.push("margin: 5px;");
		ss.push("background-color: #08c;");
		ss.push("width: 140px;");
		ss.push("height: 140px;");
		ss.push("text-align: center;");
		ss.push("color: #fff;");
		ss.push("transition-duration: 0.3s;");
		ss.push("-webkit-transition-duration: 0.3s;");
		ss.push("cursor: pointer;");
		ss.push("position: relative;");
		ss.push("}");
		ss.push(".nav_box .item .msg {");
		ss.push("position: absolute;");
		ss.push("top: -8px;");
		ss.push("right: -8px;");
		ss.push("height: 18px;");
		ss.push("border-radius: 10px;");
		ss.push("background-color: red;");
		ss.push("color: #fff;");
		ss.push("line-height: 18px;");
		ss.push("text-align: center;");
		ss.push("min-width: 18px;");
		ss.push("padding: 2px;");
		ss.push("box-shadow: 1px 1px 13px rgba(0, 0, 245, 0.7);");
		ss.push("}");
		ss.push(".nav_box .open {");
		ss.push("-webkit-transform: rotate(45deg) scale(0.7);");
		ss.push("-webkit-transition-duration: 0.7s;");
		ss.push("transform: rotate(45deg) scale(0.7);");
		ss.push("transition-duration: 0.7s;");
		ss.push("}");
		ss.push(".nav_box .open i {");
		ss.push("transform: rotate(-45deg);");
		ss.push("-webkit-transform: rotate(-45deg);");
		ss.push("}");
		ss.push(".nav_box .item:hover {");
		ss.push("background-color: #fff;");
		ss.push("color: #08c;");
		ss.push("-webkit-transition-duration: 0.3s;");
		ss.push("transition-duration: 0.3s;");
		ss.push("}");
		ss.push(".nav_box .item i {");
		ss.push("line-height: 140px;");
		ss.push("font-size: 60px;");
		ss.push("}");
		ss.push(".nav_box .item img {");
		ss.push("max-height: 100px;");
		ss.push("max-width: 100px;");
		ss.push("}");
		ss.push(".nav_box .item_sub {");
		ss.push("margin: 12px;");
		ss.push("background-color: darkorange;");
		ss.push("width: 70px;");
		ss.push("height: 70px;");
		ss.push("text-align: center;");
		ss.push("color: #fff;");
		ss.push("-webkit-transition-duration: 0.3s;");
		ss.push("transition-duration: 0.3s;");
		ss.push("cursor: pointer;");
		ss.push("position: relative;");
		ss.push("}");
		ss.push(".nav_box .item_sub .msg {");
		ss.push("position: absolute;");
		ss.push("top: -8px;");
		ss.push("right: -8px;");
		ss.push("height: 18px;");
		ss.push("border-radius: 10px;");
		ss.push("background-color: #fff;");
		ss.push("color: red;");
		ss.push("line-height: 18px;");
		ss.push("text-align: center;");
		ss.push("min-width: 18px;");
		ss.push("padding: 2px;");
		ss.push("box-shadow: 1px 1px 13px rgba(255, 0, 0, 0.7);");
		ss.push("}");
		ss.push(".nav_box .item_sub i {");
		ss.push("line-height: 70px;");
		ss.push("font-size: 30px;");
		ss.push("}");
		ss.push(".nav_box .item_sub:hover {");
		ss.push("background-color: #fff;");
		ss.push("color: darkorange;");
		ss.push("-webkit-transition-duration: 0.3s;");
		ss.push("transition-duration: 0.3s;");
		ss.push("}");

		ss.push(".pop_title{ position: absolute;min-width: 50px;display: none;z-index: 212;white-space: nowrap;}");
		ss
			.push(".pop_title div {position: relative;width: 100%;z-index: 2;height: 30px;line-height: 30px;text-align: center;background-color: #8D8804;padding: 0 4px;border-radius: 5px;color: #fff;}");
		ss.push(".pop_title p {");
		ss.push("position: relative;");
		ss.push("padding: 0px;");
		ss.push("height: 12px;");
		ss.push("width: 12px;");
		ss.push("transform: rotate(45deg);");
		ss.push("-webkit-transform: rotate(45deg);");
		ss.push("margin: auto;");
		ss.push("margin-top: -6px;");
		ss.push("z-index: 1;");
		ss.push("background-color: #8D8804;");
		ss.push("}");

		var obj = document.createElement('style');
		obj.textContent = ss.join('\n');
		document.getElementsByTagName('head')[0].appendChild(obj);
		this._css_setted = true;
	},
	right_show_menu_sub : function(obj, evt) {
		var evt = evt || event;
		var t1 = evt.target || evt.srcElement;
		if (t1.className != 'item') {
			return;
		}
		var t = $(obj);
		var subMenus = this.right_add_menu_subs(obj);
		if (window.last_open && window.last_open != obj) {
			window.last_open.click();
		}
		if (t.attr('is_open') == 1) { // 已经打开，关闭
			t.attr('is_open', "0");
			if (subMenus) {
				subMenus.style.display = 'none';
			}
			window.last_open = null;
		} else {
			t.attr('is_open', "1");
			if (subMenus) {
				subMenus.style.display = '';
			}
			window.last_open = obj;
		}
	},
	right_add_menu_subs : function(pobj) {
		var id = ('M_' + Math.random()).replace(".", "");
		pobj.id = pobj.id || id;
		var id1 = pobj.id + "_s";
		if ($X(id1)) {
			return $X(id1);
		}
		var menus;
		var subs = pobj.getAttribute('subs');
		if (subs) {
			menus = JSON.parse(subs);
		}
		if (!menus || menus.length == 0) {
			this.right_item_click(pobj);
			return;
		}
		var div = document.createElement('div');
		div.id = id1;
		pobj.appendChild(div);
		for (var i = 0; i < menus.length; i++) {
			var item = menus[i];
			var p = document.createElement('p');
			$(p).attr({
				onclick : "EWA_UI_Metro.right_item_click(this)",
				"_title" : item.title,
				u : item.url
			});
			p.innerHTML = "<b class='" + item.icon + "'></b><span>" + item.title + "</span>";
			div.appendChild(p);
		}
		return div;
	},
	right_item_click : function(obj) {
		var item = $(obj);
		var u = item.attr("u");
		var t = item.attr("_title");
		if (u) {
			if (u.indexOf('/') > 0) {
				u = u;
			} else if (u.indexOf('?') >= 0) {
				u = EWA.CP + "/EWA_STYLE/cgi-bin/" + u;
			} else {
				u = EWA.CP + "/EWA_STYLE/cgi-bin/?" + u;
			}
			AddTab(u, t);
		}
	},
	load_msg_sub : function() {

	}
// add_menus(index_menus, 'nav_box', 'item', g_menu_cols, g_menu_rows,
// true);

};
var __Menu = {
	C : EWA_UI_MenuClass
};
__Menu.OnMouseOver = function(obj) {
	if (__Menu._LastObj != null) {
		__Menu._LastObj.style.backgroundColor = "";
	}
	__Menu._LastObj = obj;
	obj.style.backgroundColor = "#DDD";
};
__Menu.OnClick = function(e, obj) {
	if (__Menu._LastObj != null) {
		__Menu._LastObj.style.backgroundColor = "";
	}
	__Menu._LastObj = null;
	typeof e.stopPropagation != "undefined" ? e.stopPropagation() : e.cancelBubble = true;
	if (obj.id.indexOf('_EWA_MF_') > 0 && obj.id.indexOf('*') > 0) {
		var id = obj.id.split('*')[0];
		var o1 = document.getElementById(id);
		for (var i = 0; i < o1.childNodes.length; i++) {
			var o2 = o1.childNodes[i];
			if (o2.getAttribute('EWA_MF_PID') == o1.id) {
				alert(o2.innerHTML);
			}
		}
	}
	EWA.C.Utils.RunCmd(obj);// 执行cmd
};

EWA["UI"].Menu = __Menu; /* 菜单 */

var __EMP_TIP_TIMER_SHOW;
var __EMP_TIP_CLASS;
function EMP_TIP_HIDE() {
    window.clearInterval(__EMP_TIP_TIMER_SHOW);
    __EMP_TIP_CLASS._Hidden();
    __EMP_TIP_TIMER_SHOW = null;
}

function EWA_UI_TipClass(id) {
    this.ParentWindow = window;
    this.TipFrame = null;
    this.Alpha = 0;
    this.IsShow = true;
    this._Id = "__EWA_TIP_" + id;
    this._ShowDocument = null;

    this._ForTable = null;
    this._BakTable = null;
    this._BakFrame = null;
    this._InitTipFrame = function() {
        var odiv = this._InitDiv();
        var otb = this._InitTable();
        this._ForTable = otb;
        this._InitTableImgForground(otb);
        odiv.appendChild(otb);
        var otb1 = this._InitTable();
        this._BakTable = otb1;
        this._InitTableImgBackground(otb1);
        odiv.appendChild(otb1);
        this.TipFrame = odiv;
        this.ParentWindow.document.body.appendChild(odiv);
        __EMP_TIP_CLASS = this;
    };
    this._InitDiv = function() {
        var odiv = this.ParentWindow.document.createElement("div");
        odiv.id = this._Id;
        odiv.style.zIndex = "1998";
        odiv.style.display = "none";
        odiv.className = 'ewa-tip';
        if (EWA.B.IE) {
            odiv.innerHTML = "<iframe src='javascript:false' style=\"position:absolute; visibility:inherit; top:0px; left:0px; width:1px; height:1px; z-index:-1; filter='progid:DXImageTransform.Microsoft.Alpha(style=0,opacity=0)';\"></iframe>";
            this._BakFrame = odiv.childNodes[0];
        } else {
            odiv.innerHTML = "<div style=\"position:absolute; visibility:inherit; top:0px; left:0px; width:1px; height:1px; z-index:-1;\"></div>";
            this._BakFrame = odiv.childNodes[0];
        }
        return odiv;
    };
    this._CreateImgHtml = function(src, width, height) {
        var imgSrc = EWA.RV_STATIC_PATH == null ? EWA.CP : EWA.RV_STATIC_PATH;
        var src1 = imgSrc + "/EWA_STYLE/images/tip/" + src;
        return "<img src='" + src1 + "' width=" + width + " height=" + height + ">";
    };
    this._SetBackgound = function(obj, src) {
        var imgSrc = EWA.RV_STATIC_PATH == null ? EWA.CP : EWA.RV_STATIC_PATH;
        var src1 = imgSrc + "/EWA_STYLE/images/tip/" + src;
        obj.style.backgroundImage = "url('" + src1 + "')";
        obj.style.backgroundRepeat = "repeat-x";
    };
    this._InitTableImgForground = function(otb) {
        //		otb.style.position = "absolute";
        //		otb.style.zIndex = 22;
        //		otb.style.left = "0px";
        //		otb.style.top = "0px";
        otb.className = 'ewa-tip-for';

        otb.rows[2].cells[1].onmouseover = function() {
            window.clearInterval(__EMP_TIP_TIMER_SHOW);
            __EMP_TIP_TIMER_SHOW = null;
            this.bgColor = "#FFCC66";
        };
        otb.onmouseout = function() {
            window.clearInterval(__EMP_TIP_TIMER_SHOW);
            __EMP_TIP_TIMER_SHOW = null;
            __EMP_TIP_CLASS.HiddenTip();
            this.rows[2].cells[1].bgColor = "white";
        };
        otb.rows[0].cells[0].className = 'ewa-tip-arrow';
        // cells[0].style.width = "6px";
        // cells[0].style.height = "6px";
        // cells[0].innerHTML = this._CreateImgHtml("image040.gif", 6, 6);
        // cells[2].style.width = "6px";
        // cells[2].innerHTML = this._CreateImgHtml("image042.gif", 6, 6);
        // this._SetBackgound(cells[1], "image055.png");
        otb.rows[1].cells[0].className = "ewa-tip-tl";
        otb.rows[1].cells[1].className = "ewa-tip-tm";
        otb.rows[1].cells[2].className = "ewa-tip-tr";

        // this._SetBackgound(cells[0], "image057.png");
        // this._SetBackgound(cells[2], "image059.png");
        // cells[1].width = "100%";
        // cells[1].bgColor = "white";
        // cells[1].style.fontSize = "12px";
        otb.rows[2].cells[0].className = "ewa-tip-l";
        otb.rows[2].cells[1].className = "ewa-tip-m";
        otb.rows[2].cells[2].className = "ewa-tip-r";

        // cells[0].style.height = "6px";
        // cells[0].innerHTML = this._CreateImgHtml("image065.png", 6, 6);
        // cells[2].innerHTML = this._CreateImgHtml("image067.gif", 6, 6);
        // this._SetBackgound(cells[1], "image061.png");
        // cells[1].innerHTML = "<img width=1 height=1>";
        otb.rows[3].cells[0].className = "ewa-tip-bl";
        otb.rows[3].cells[1].className = "ewa-tip-bm";
        otb.rows[3].cells[2].className = "ewa-tip-br";
    };
    this._InitTableImgBackground = function(otb) {
        // otb.style.position = "absolute";
        // otb.style.zIndex = 21;
        // otb.style.left = "2px";
        // otb.style.top = "2px";
        // otb.style.filter = "alpha(opacity=60)";
        // otb.style.opacity = 0.6;
        // with (otb.rows[1]) {
        // cells[0].style.width = "6px";
        // cells[0].style.height = "6px";
        // cells[0].innerHTML = this._CreateImgHtml("image001.png", 8, 8);
        // cells[2].style.width = "6px";
        // cells[2].innerHTML = this._CreateImgHtml("image003.png", 8, 8);
        // this._SetBackgound(cells[1], "image021.png");
        // }
        // with (otb.rows[2]) {
        // this._SetBackgound(cells[0], "image023.png");
        // this._SetBackgound(cells[2], "image025.png");
        // cells[1].width = "100%";
        // cells[1].style.fontSize = "12px";
        // }
        // with (otb.rows[3]) {
        // cells[0].style.height = "6px";
        // cells[0].innerHTML = this._CreateImgHtml("image005.png", 8, 8);
        // cells[2].innerHTML = this._CreateImgHtml("image007.png", 8, 8);
        // this._SetBackgound(cells[1], "image027.png");
        // }
    };
    this._InitTable = function() {
        var otb = this.ParentWindow.document.createElement("table");
        var otr = otb.insertRow(-1);
        otr.insertCell(-1);
        otr = null;
        for (var i = 0; i < 3; i++) { // 3x3 table
            var otr = otb.insertRow(-1);
            for (var m = 0; m < 3; m++) {
                var otd = otr.insertCell(-1);
                if (i == 1 && m == 1) {
                    otd.style.fontSize = "12px";
                } else {
                    otd.style.fontSize = "1px";
                }
                otd = null;
            }
            otr = null;
        }
        otr = otb.insertRow(-1);
        otr.insertCell(-1);
        otr = null;
        otb.border = 0;
        otb.cellSpacing = 0;
        otb.cellPadding = 0;
        otb.style.fontSize = "1px";
        otb.rows[0].cells[0].colSpan = 3;
        otb.rows[4].cells[0].colSpan = 3;
        return otb;
    };
    this.ShowTip = function(str, x, y) {
        window.clearInterval(__EMP_TIP_TIMER_SHOW);
        __EMP_TIP_TIMER_SHOW = null;

        this.TipFrame.style.display = "";
        this._ForTable.rows[2].cells[1].innerHTML = str;
        var w = this._ForTable.offsetWidth;
        var h = this._ForTable.offsetHeight;
        var cw = this._ForTable.rows[2].cells[1].offsetWidth;
        var ch = this._ForTable.rows[2].cells[1].offsetHeight;
        this._ForTable.style.width = (cw + 12) + 'px';

        //		this._BakTable.rows[2].cells[1].innerHTML = "<div style='width:" + cw + "px;height:" + ch + "px'></div>";
        //		this._BakFrame.style.width = w + "px";
        //		this._BakFrame.style.height = h + "px";

        var aleft = w / 4;
        var divLeft = x - aleft + 14;
        if (divLeft < 0) {
            divLeft = 12;
        } else {
            var divRight = w + divLeft;
            if (this._ShowDocument != null) {
                if (divRight > this._ShowDocument.body.offsetWidth) {
                    divLeft = this._ShowDocument.body.offsetWidth - w - 2;
                }
            }
        }
        this.TipFrame.style.left = divLeft + "px";
        this.TipFrame.style.top = y + 3 + "px";
        var arrowX = x - divLeft;
        var arrowX1 = arrowX + 3;
        var arrowImg1 = "/EWA_STYLE/images/tip/image048.gif";
        var arrowImg2 = "/EWA_STYLE/images/tip/image013.png";
        if (arrowX < w / 2 && arrowX - 32 > 0) {
            arrowImg1 = "/EWA_STYLE/images/tip/image050.gif";
            arrowImg2 = "/EWA_STYLE/images/tip/image015.png";
            arrowX -= 32;
            if (arrowX < 0) {
                arrowX = 4;
            }
            arrowX1 = arrowX - 3;
        }
        var offsetY = document.all ? 6 : 9;
        var imgSrc = EWA.RV_STATIC_PATH == null ? EWA.CP : EWA.RV_STATIC_PATH;
        var s1 = "<img src='" + imgSrc + arrowImg1 + "' width=32 height=21 style='position: relative; left: " + arrowX
            + "px; top: " + offsetY + "px'>";
        this._ForTable.rows[0].cells[0].innerHTML = s1;
        var s2 = "<img src='" + imgSrc + arrowImg2 + "' width=37 height=21 style='position: relative; left: " + arrowX1
            + "px; top: " + offsetY + "px'>";
        if (document.all) {
            var src = imgSrc + arrowImg2;
            s2 = "<div style=\"filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + src
                + "', sizingMethod='scale'); position: relative; left: " + arrowX1 + "px; top: " + offsetY
                + "px; width:37px; height:21px\"></DIv>";
        }
        this._BakTable.rows[0].cells[0].innerHTML = s2;
        this.TipFrame.style.display = "";
    };
    this.HiddenTip = function() {
        __EMP_TIP_CLASS = this;
        if (__EMP_TIP_TIMER_SHOW != null) {
            window.clearInterval(__EMP_TIP_TIMER_SHOW);
        }
        __EMP_TIP_TIMER_SHOW = window.setInterval(EMP_TIP_HIDE, 500);
    };
    this.GetObjectLocation = function(obj, evt) {
        var loc = EWA.UI.Utils.GetPosition(obj);
        return [ loc.X, loc.Y ];
    };
    this._Hidden = function() {
        this.TipFrame.style.display = "none";
    };
    this._InitTipFrame();
}function EWA_UI_LinkClass(obj1, obj2) {
	this.LinkObj1 = obj1;
	this.LinkObj2 = obj2;
	this.LinkObj = null;
	this._Style = '2px solid blue';
	this.getSize = function(obj) {
		var xy = EWA$UI$COMMON.GetPosition(obj);
		var s = {
			X : xy.X,
			Y : xy.Y,
			W : obj.offsetWidth,
			H : obj.offsetHeight
		};
		return s;
	};
	this._CreateLinkObj = function() {
		var tb = document.createElement('table');
		if (EWA.B.IE) {
			tb.style.cssText = 'position: absolute; width: 100px; height: 100px; z-index: -11; left: 693px; top: 174px;font-size:1px;';
		} else {
			tb.setAttribute('style',
				'position: absolute; width: 100px; height: 100px; z-index: -11; left: 693px; top: 174px;font-size:1px;');
		}
		tb.cellSpacing = 0;
		tb.cellPadding = 0;
		for (var i = 0; i < 2; i++) {
			var tr = tb.insertRow(-1);
			for (var m = 0; m < 2; m++) {
				var td = tr.insertCell(-1);
				td.innerHTML = '&nbsp;';
			}
		}
		document.body.appendChild(tb);
		this.LinkObj = tb;

	}
	this.Link = function() {
		if (this.LinkObj == null) {
			this._CreateLinkObj();
		}

		var top, left, height, width;
		this.LinkObj.rows[0].cells[0].style.border = '';
		this.LinkObj.rows[0].cells[1].style.border = '';
		this.LinkObj.rows[1].cells[0].style.border = '';
		this.LinkObj.rows[1].cells[1].style.border = '';

		var s1 = this.getSize(this.LinkObj1);
		var s2 = this.getSize(this.LinkObj2);
		if (s1.X + s1.W < s2.X) {
			left = s1.X + s1.W;
			width = s2.X - s1.X - s1.W;

			this.LinkObj.rows[0].cells[0].style.width = width / 2 + 'px';

		} else if (s1.X < s2.X) {
			left = s1.X - 20;
			width = s2.X - s1.X + 20;

			this.LinkObj.rows[0].cells[0].style.width = '20px';

		} else if (s1.X >= s2.X && s1.X < s2.X + s2.W) {
			left = s2.X - 20;
			width = s1.X - s2.X + 20;

			this.LinkObj.rows[0].cells[0].style.width = '20px';

		} else {
			left = s2.X + s2.W;
			width = s1.X - s2.X - s2.W;
			this.LinkObj.rows[0].cells[0].style.width = width / 2 + 'px';

		}

		if (s1.Y < s2.Y) {
			height = s2.Y - s2.H / 2 - s1.Y + s1.H / 2;
			top = s1.Y - s1.H / 2;
		} else {
			height = s1.Y - s1.H / 2 - s2.Y + s2.H / 2;
			top = s2.Y - s2.H / 2;
		}
		this.LinkObj.style.width = width + 'px';
		this.LinkObj.style.height = height + 'px';
		this.LinkObj.style.left = left + 'px';
		this.LinkObj.style.top = top + 'px';

		var c00 = this.LinkObj.rows[0].cells[0];
		var c01 = this.LinkObj.rows[0].cells[1];
		var c10 = this.LinkObj.rows[1].cells[0];
		var c11 = this.LinkObj.rows[1].cells[1];
		if (s1.Y < s2.Y) {
			if (s1.X + s1.W < s2.X) {
				c00.style.borderTop = this._Style;
				c00.style.borderRight = this._Style;
				c10.style.borderRight = this._Style;
				c11.style.borderBottom = this._Style;
			} else if (s1.X < s2.X) {
				c00.style.borderTop = this._Style;
				c00.style.borderLeft = this._Style;
				c10.style.borderLeft = this._Style;
				c11.style.borderBottom = this._Style;
				c10.style.borderBottom = this._Style;
			} else if (s1.X >= s2.X && s1.X < s2.X + s2.W) {
				c00.style.borderTop = this._Style;
				c00.style.borderLeft = this._Style;
				c10.style.borderLeft = this._Style;
				c01.style.borderTop = this._Style;
				c10.style.borderBottom = this._Style;
			} else {
				c01.style.borderTop = this._Style;
				c00.style.borderRight = this._Style;
				c10.style.borderRight = this._Style;
				c10.style.borderBottom = this._Style;

			}
		} else {
			if (s1.X + s1.W < s2.X) {
				c01.style.borderTop = this._Style;
				c00.style.borderRight = this._Style;
				c10.style.borderRight = this._Style;
				c10.style.borderBottom = this._Style;
			} else if (s1.X < s2.X) {
				c00.style.borderTop = this._Style;
				c01.style.borderTop = this._Style;
				c00.style.borderLeft = this._Style;
				c10.style.borderLeft = this._Style;
				c10.style.borderBottom = this._Style;
			} else if (s1.X >= s2.X && s1.X < s2.X + s2.W) {
				c00.style.borderTop = this._Style;
				c00.style.borderLeft = this._Style;
				c10.style.borderLeft = this._Style;
				c11.style.borderBottom = this._Style;
				c10.style.borderBottom = this._Style;
			} else {
				c00.style.borderTop = this._Style;
				c00.style.borderRight = this._Style;
				c10.style.borderRight = this._Style;
				c11.style.borderBottom = this._Style;
			}
		}
	}

}function EWA_UI_TabsClass(className) {
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
}/**
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
		var position = window.EWA_UI_DIALOG_FIXED ? "position:fixed" : "position:absolute";
		// 在css中定义		
		// var position = "";		
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
				+ this._Name + "' frameborder='0'></iframe>";
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

EWA["UI"].Dialog = __Dialog; /* 公共弹出框 *//**
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

		this.Id = this.Id || ('_EWA_UI_DIA_' + Math.random()).replace('.', '');
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
};;
function EWA_UI_CalendarYearClass() {
	this.Create = function(pid, startYear, startMonth, monthLength,byMonth) {
		console.log(startYear, startMonth, monthLength)
		this.classId = ("CY" + Math.random()).replace('.', '');
		EWA.UI.CalendarYear = EWA.UI.CalendarYear || {};
		EWA.UI.CalendarYear[this.classId] = this;

		$($X(pid)).append('<div class="ewa-ui-calendar-year" id="' + this.classId + '"></div>');
		var p = $('#' + this.classId);
		var aa = new EWA_CalendarClass();
		// 开始日期
		var today = new Date();
		if (startYear && startMonth) {
			today = new Date(startYear, startMonth-1, 1);
		}
		var m = today.getMonth();
		var start_m=m;
		if(!byMonth){
			// 计算出当前月的季度开始月份
			var jd = Math.round(m / 3 - 0.5);
			start_m = jd * 3;
		}
		var year = today.getFullYear();
		if (!monthLength || monthLength <= 0) {
			monthLength = 12;
		}
		for (var i = 1; i <= monthLength; i++) {
			if (EWA.LANG == 'enus') {
				var m1 = (start_m + 1) + "/" + year;
				var m2
				if(_EWA_G_SETTINGS.DATE == "dd/MM/yyyy"){
					m2="01/" + (start_m + 1) + "/" + year;
				}else{
					m2 = (start_m + 1) + "/01/" + year;
				}
				aa.SetDate(m2);
			} else {
				var m1 = year + "-" + (start_m + 1);
				aa.SetDate(m1 + '-01');
			}
			var tb = aa.CreateCalendar();
			var tbid = this.classId + '_' + year + "_" + start_m;
			tb.id = tbid;
			
			var ym=year + (start_m<10?"0":"") + start_m
			
			tb.setAttribute('yearmonth',ym)
			p.append(tb);
			$(tb.rows[3]).remove();
			$(tb.rows[0].cells[1]).remove();
			// 点击月份
			var s = "<a href='javascript:EWA.UI.CalendarYear." + this.classId + ".chooeseMonth(\"" + tbid + "\",event)'>" + m1
				+ "</a>"
			$(tb.rows[0].cells[0]).html(s);
			// 点击星期
			$(tb).find('th').attr('onclick', "EWA.UI.CalendarYear." + this.classId + ".chooeseWeek('" + tbid + "',this, event)");
			start_m++;
			if (start_m == 12) {
				start_m = 0;
				year++;
			}
			$(tb).find('th:eq(0)').addClass('rq-sun'); // 周日
			$(tb).find('th:eq(6)').addClass('rq-sat'); // 周六

		}
		p.append('<div style="clear:both"></div>');
		p.find('.ewa-ui-days td').attr('onclick', "EWA.UI.CalendarYear." + this.classId + ".Click(this,event)");
		_EWA_CALENDAR_ITEM = aa;
	};
	this.chooeseWeek = function(id, obj, evt) {
		var cellIndex = obj.cellIndex;
		var tb = $("#" + id).find('.ewa-ui-days')[0];
		var is_chooese = $(obj).attr('chooese');
		var rqs = []; // 选中或未选中的日期
		for (var i = 1; i < tb.rows.length; i++) {
			var td = tb.rows[i].cells[cellIndex];
			if (td.childNodes.length == 0) {
				continue;
			}
			if (!is_chooese) {
				$(td).addClass('ewa-ui-calendar-year-chooese').attr('chooese', 1);
			} else {
				$(td).removeClass('ewa-ui-calendar-year-chooese').attr('chooese', null);
			}
			rqs.push($(td).find('div:eq(0)').attr('title'));
		}
		if (is_chooese) {
			$(obj).attr('chooese', null);
		} else {
			$(obj).attr('chooese', 1);
		}
		if (this.ClickEvent) {
			this.ClickEvent(rqs, !is_chooese, evt);
		}
	};
	this.chooeseMonth = function(id, evt) {
		var tb = $('#' + id);
		var isChecked = tb.attr('all1');
		var rqs = [];
		if (isChecked) {
			tb.attr('all1', null);
			$('#' + id + " .ewa-ui-days .ewa-ui-calendar-year-chooese").each(function() {
				$(this).removeClass('ewa-ui-calendar-year-chooese').attr('chooese', null);
				rqs.push($(this).find('div:eq(0)').attr('title'));
			});
			tb.find('th').attr('chooese', null);
		} else {
			tb.attr('all1', 'yes');
			$('#' + id + " .ewa-ui-days tr:gt(0) td div[title]").parent().each(function() {
				$(this).addClass('ewa-ui-calendar-year-chooese').attr('chooese', 1);
				rqs.push($(this).find('div:eq(0)').attr('title'));
			});
			tb.find('th').attr('chooese', 1);
		}
		if (this.ClickEvent) {
			this.ClickEvent(rqs, !isChecked, evt);
		}
	};
	this.SetChooeses = function(jsonArr, filedName) {
		for ( var n in jsonArr) {
			var d = jsonArr[n];
			var rq = d[filedName];
			if (!rq) {
				continue;
			}
			rq = rq.split(' ')[0];
			$('#' + this.classId + " .ewa-ui-days td div[title='" + rq + "']").parent().addClass('ewa-ui-calendar-year-chooese')
				.attr('chooese', 1);
		}
		// 如果日期全选，则设置为全选的标志
		$('#' + this.classId + " .ewa-ui-date").each(function() {
			if ($(this).find('.ewa-ui-calendar-year-chooese').length == $(this).find('td div[title]').length) {
				$(this).attr('all1', 'yes');
				$(this).find('th').attr('chooese', 'yes');
			}
		});
	};
	/**
	 * 获取选中的日期
	 */
	this.GetChooeses = function(pobj) {
		var ss = [];
		var p = pobj ? $(pobj) : $('#' + this.classId + ' .ewa-ui-days');
		p.find('.ewa-ui-calendar-year-chooese').each(function() {
			ss.push($(this).find('div:eq(0)').attr('title'));
		});
		return ss;
	};
	/**
	 * 获取未选中的日期
	 */
	this.GetUnChooeses = function(pobj) {
		var ss = [];
		var p = pobj ? $(pobj) : $('#' + this.classId + ' .ewa-ui-days');
		p.find('td').each(function() {
			if (!$(this).attr('chooese')) {
				var rq = $(this).find('div:eq(0)').attr("title");
				if (rq)
					ss.push(rq);
			}
		});
		return ss;
	}
	this.Click = function(obj, evt) {
		if (obj.innerHTML.trim() == '') {
			// 没日期
			return;
		}
		var isChecked;
		if (!$(obj).attr('chooese')) {
			$(obj).addClass('ewa-ui-calendar-year-chooese').attr('chooese', 1);
			isChecked = true;
		} else {
			$(obj).removeClass('ewa-ui-calendar-year-chooese').attr('chooese', null);
			isChecked = false;
		}
		if (this.ClickEvent) {
			var rqs = [ $(obj).find('div:eq(0)').attr('title') ];
			this.ClickEvent(rqs, isChecked, evt)
		}
	};
	this.ClickEvent = function(rqs, isChecked, evt) {
		// overwrite this;
		console.log('overwrite xxx.ClickEvent(rqs,   isChecked, evt)');
	};
};
function EWA_UI_CalendarYearGroupClass() {
	/**
	 * 禁止选择 小于 theDay 的天
	 */
	this.denysBefore = function(theDay) {
		var dt = new EWA_DateClass(theDay);
		for (var i = 1; i < 1500; i++) {
			var dayStr = dt.AddDays(-1);
			dayStr = dayStr.split(' ')[0];
			var td = this.denyDay(dayStr);
			if (td.length == 0) {
				break;
			}
		}
	};
	/**
	 * 禁止选择 大于 theDay 的天
	 */
	this.denysAfter = function(theDay) {
		var dt = new EWA_DateClass(theDay);
		for (var i = 1; i < 1500; i++) {
			var dayStr = dt.AddDays(1);
			dayStr = dayStr.split(' ')[0];
			var td = this.denyDay(dayStr);
			if (td.length == 0) {
				break;
			}
		}
	};
	this.denyDay = function(rq) {
		var p = $('#' + this.classId);
		var tds = p.find(".ewa-ui-days td");
		var td = tds.find("div[title='" + rq + "']").parent();
		td.addClass('ewa-ui-calendar-year-deny').attr('deny', 1);
		return td;
	};
	this.unDenyDay = function(rq) {
		var p = $('#' + this.classId);
		var tds = p.find(".ewa-ui-days td");
		var td = tds.find("div[title='" + rq + "']").parent();
		td.removeClass('ewa-ui-calendar-year-deny').attr('deny', null);
		return td;
	};
	this.CUR_GROUP_NAME = null; // 对象分组名称
	/**
	 * 设置新的分组名称
	 */
	this.setGroupName = function(groupName) {
		if (groupName) {
			this.CUR_GROUP_NAME = "CYG_" + groupName.replace(/\:|\?|\.|\=|\;|\(|\)|\-/ig, '');
			this.CUR_GROUP_NAME_O = groupName;
		} else {
			this.CUR_GROUP_NAME = null;
			this.CUR_GROUP_NAME_O = null;
		}
	};
	this.Create = function(pid, startYear, startMonth, monthLength, byMonth, denyStartDate, denyEndDate) {
		//console.log(pid, startYear, startMonth, monthLength, byMonth, denyStartDate)

		this.classId = ("CY" + Math.random()).replace('.', '');
		EWA.UI.CalendarYear = EWA.UI.CalendarYear || {};
		EWA.UI.CalendarYear[this.classId] = this;

		$($X(pid)).append('<div class="ewa-ui-calendar-year" id="' + this.classId + '"></div>');
		var p = $('#' + this.classId);

		// 开始日期
		var today = new Date();
		if (startYear && startMonth) {
			today = new Date(startYear, startMonth - 1, 1);
		}
		var m = today.getMonth();
		var start_m = m;
		if (!byMonth) {
			// 计算出当前月的季度开始月份
			var jd = Math.round(m / 3 - 0.5);
			start_m = jd * 3;
		}
		var year = today.getFullYear();
		if (!monthLength || monthLength <= 0) {
			monthLength = 12;
		}

		var aa = new EWA_CalendarClass();
		for (var i = 1; i <= monthLength; i++) {
			var month = start_m + 1; //显示的月份和Date的月份差1
			if (EWA.LANG == 'enus') {
				var m1 = month + "/" + year;
				var m2
				if (_EWA_G_SETTINGS.DATE == "dd/MM/yyyy") {
					m2 = "01/" + month + "/" + year;
				} else {
					m2 = month + "/01/" + year;
				}
				aa.SetDate(m2);
			} else {
				var m1 = year + "-" + (start_m + 1);
				aa.SetDate(m1 + '-01');
			}
			var tb = aa.CreateCalendar();

			var ym = year + (month < 10 ? "0" : "") + month
			var tbid = this.classId + '_' + ym
			tb.id = tbid;
			tb.setAttribute('yearmonth', ym)
			p.append(tb);
			$(tb.rows[3]).remove();
			$(tb.rows[0].cells[1]).remove();

			// 点击月份
			var s = "<a href='javascript:EWA.UI.CalendarYear." + this.classId + ".chooeseMonth(\"" + tbid + "\",event)'>" + m1
				+ "</a>"
			$(tb.rows[0].cells[0]).html(s);
			// 点击星期
			$(tb).find('th').attr('onclick', "EWA.UI.CalendarYear." + this.classId + ".chooeseWeek('" + tbid + "',this, event)");
			start_m++;
			if (start_m == 12) {
				start_m = 0;
				year++;
			}
			$(tb).find('th:eq(0)').addClass('rq-sun'); // 周日
			$(tb).find('th:eq(6)').addClass('rq-sat'); // 周六

		}
		p.append('<div style="clear:both"></div>');
		p.find('.ewa-ui-days td').attr('onclick', "EWA.UI.CalendarYear." + this.classId + ".Click(this,event)");
		_EWA_CALENDAR_ITEM = aa;


		if (denyStartDate) {
			this.denysBefore(denyStartDate);
		}
		if (denyEndDate) {
			this.denysAfter(denyEndDate);
		}
	};

	this.getChooeseName = function() {
		return this.CUR_GROUP_NAME ? this.CUR_GROUP_NAME : "chooese";
	};
	/**
	 * 添加或删除标记
	 */
	this.addOrRemoveMark = function(td, isRemove, rq) {
		var chooeseName = this.getChooeseName();
		var o = $(td);
		if (!isRemove) {
			if (o.find('.' + chooeseName).length == 0) {
				o.append("<nobr class='ewa-ui-calendar-year-item " + chooeseName + "'></nobr>");
				o.attr(chooeseName, 1);
				if (this.markEvent) {
					this.markEvent(td, rq);
				}
			}
		} else {
			o.find("." + chooeseName).remove();
			o.attr(chooeseName, null)
			if (this.unMarkEvent) {
				this.unMarkEvent(td, rq);
			}
		}

		// 删除上次的 Nxx class
		if (o.attr('_last_item_count_')) {
			o.removeClass(o.attr('_last_item_count_'));
		}

		var count = o.find('.ewa-ui-calendar-year-item').length;
		if (count > 0) {
			o.addClass('ewa-ui-calendar-year-chooese');
			var css_count = count < 100 ? "N" + count : "NP"; //最多显示99，否则用 ...代替
			o.addClass("N " + css_count).attr('_last_item_count_', css_count);
		} else {
			o.removeClass('ewa-ui-calendar-year-chooese').removeClass('N');
		}
	};
	this.chooeseWeek = function(id, obj, evt) {
		var tb = $("#" + id).find('.ewa-ui-days')[0];
		var chooeseName = this.getChooeseName();
		var rqs = []; // 选中或未选中的日期

		var cellIndex = obj.cellIndex;
		var is_chooese = true;
		var is_have_active = false;
		// 判读本周几的所有日期都选择了
		for (var i = 1; i < tb.rows.length; i++) {
			var td = tb.rows[i].cells[cellIndex];
			if (td.childNodes.length == 0) {
				continue;
			}
			if (!$(td).attr('deny')) {
				is_have_active = true;
			}
			if (!$(td).attr(chooeseName)) {
				is_chooese = false;
			}
			if (is_have_active && !is_chooese) {
				break;
			}
		}

		if (!is_have_active) {
			$Tip('没有可选的日期');
			return;
		}

		if (this.ClickBeforeEvent) {
			if (!this.ClickBeforeEvent(id, obj, evt, 'WEEK')) {
				return;
			}
		}

		for (var i = 1; i < tb.rows.length; i++) {
			var td = tb.rows[i].cells[cellIndex];
			if (td.childNodes.length == 0) {
				continue;
			}
			//禁止的日期
			if ($(td).attr('deny')) {
				continue;
			}
			var rq = $(td).find('div:eq(0)').attr('title');
			rqs.push(rq);
			this.addOrRemoveMark(td, is_chooese, rq);
		}
		if (is_chooese) {
			$(obj).attr(chooeseName, null);
		} else {
			$(obj).attr(chooeseName, 1);
		}
		if (this.ClickEvent) {
			this.ClickEvent(rqs, !is_chooese, evt);
		}
	};
	/**
	 * 按月全选/全不选
	 */
	this.chooeseMonth = function(id, evt) {
		var tb = $('#' + id + " .ewa-ui-days")[0];
		var chooeseName = this.getChooeseName();
		var is_all_chooesed = true;
		var is_have_active = false;
		// 判读本月的所有日期都选择了
		for (var i = 1; i < tb.rows.length; i++) {
			var row = tb.rows[i];
			for (var m = 0; m < row.cells.length; m++) {
				var td = row.cells[m];
				if (td.childNodes.length == 0) {
					continue;
				}
				if (!is_have_active && !$(td).attr('deny')) {
					is_have_active = true; //找到可用的
				}
				var tag = $(td).attr(chooeseName);
				if (!tag) {
					is_all_chooesed = false; //没有全部选择
				}
			}
			if (!is_all_chooesed && is_have_active) {
				break;
			}
		}
		if (!is_have_active) {
			$Tip("没有可选的日期");
			return;
		}

		if (this.ClickBeforeEvent) {
			if (!this.ClickBeforeEvent(id, null, evt, 'MONTH')) {
				return;
			}
		}

		var rqs = [];
		for (var i = 1; i < tb.rows.length; i++) {
			var row = tb.rows[i];
			for (var m = 0; m < row.cells.length; m++) {
				var td = row.cells[m];
				if (td.childNodes.length == 0) {
					continue;
				}
				//禁止的日期
				if ($(td).attr('deny')) {
					continue;
				}
				var rq = $(td).find('div:eq(0)').attr('title');
				rqs.push(rq);
				this.addOrRemoveMark(td, is_all_chooesed, rq);
			}
		}

		if (this.ClickEvent) {
			this.ClickEvent(rqs, !is_all_chooesed, evt);
		}
	};
	/**
	 * 设置显示在日历上
	 * 
	 * @param jsonArr
	 *            对象数组
	 * @param filedName
	 *            日期的字段名称
	 * @param groupFieldName
	 *            分组字段名称
	 * @param func
	 *            附加执行的方法,三个参数 td(日期所在的TD), rq(日期) ,d(JSON对象)
	 */
	this.SetChooeses = function(jsonArr, filedName, groupFieldName, func) {
		this._RQ_MAP = null;

		var p = $('#' + this.classId);
		var tds = p.find(".ewa-ui-days td");
		for (var n in jsonArr) {
			var d = jsonArr[n]; // JSON对象
			var rq = d[filedName]; // 日期
			if (!rq) {
				continue;
			}
			if (groupFieldName) {
				this.setGroupName(d[groupFieldName]);
			}

			rq = rq.split(' ')[0];
			var td = this.findTdByRq(rq);
			if (td && td.length > 0) {
				this.addOrRemoveMark(td, false, rq);
				if (func) { // 传递进去的方法
					func(td[0], rq, d);
				}
			} else {
				console.log('无效的日期' + rq);
			}
		}

		this._RQ_MAP = null;
		// 如果日期全选，则设置为全选的标志
		p.find(".ewa-ui-date").each(function() {
			if ($(this).find('.ewa-ui-calendar-year-chooese').length == $(this).find('td div[title]').length) {
				$(this).attr('all1', 'yes');
				$(this).find('th').attr('chooese', 'yes');
			}
		});
	};
	this.findTdByRq = function(rq) {
		if (!rq) {
			return null;
		}
		if (!this._RQ_MAP) { //缓存已经存在的日期
			this._RQ_MAP = {};
		} else {
			if (this._RQ_MAP[rq]) {
				return this._RQ_MAP[rq];
			}
		}

		var rq1 = rq.replace(/-/ig, '');
		var yearmonth = rq1.substring(0, 6);
		var tb = $('#' + this.classId + " table[yearmonth='" + yearmonth + "']");
		if (tb.length == 0) {
			this._RQ_MAP[rq] = null;
			return null;
		}
		this._RQ_MAP[rq] = tb.find("div[date='" + rq1 + "']").parent();
		return this._RQ_MAP[rq];
	};
	/**
	 * 获取选中的日期
	 */
	this.GetChooeses = function(pobj) {
		var ss = [];
		var p = pobj ? $(pobj) : $('#' + this.classId + ' .ewa-ui-days');
		p.find('.ewa-ui-calendar-year-chooese').each(function() {
			ss.push($(this).find('div:eq(0)').attr('title'));
		});
		return ss;
	};
	/**
	 * 获取未选中的日期
	 */
	this.GetUnChooeses = function(pobj) {
		var ss = [];
		var p = pobj ? $(pobj) : $('#' + this.classId + ' .ewa-ui-days');
		p.find('td').each(function() {
			if (!$(this).attr('chooese')) {
				var rq = $(this).find('div:eq(0)').attr("title");
				if (rq)
					ss.push(rq);
			}
		});
		return ss;
	};
	this.Click = function(obj, evt) {
		if ($(obj).attr('deny') || obj.innerHTML.trim() == '') {
			// 没日期
			return;
		}
		if (this.ClickBeforeEvent) {
			if (!this.ClickBeforeEvent(obj.id, obj, evt, 'DAY')) {
				return;
			}
		}
		var isChecked;
		var rq = $(obj).find('div:eq(0)').attr('title');
		var chooeseName = this.getChooeseName();

		var isRemove = $(obj).attr(chooeseName);

		this.addOrRemoveMark(obj, isRemove, rq);

		if (this.ClickEvent) {
			var rqs = [rq];
			this.ClickEvent(rqs, !isRemove, evt)
		}
	};
	/**
	 * 点击前处理，如果返回true,则继续执行选择，否则终止执行选择
	 * 
	 * @param id
	 *            来源ID
	 * @param obj
	 *            来源对象
	 * @param evt
	 *            event事件
	 * @param type
	 *            模式 DAY/WEEK/MONTH
	 * @returns true/false
	 */
	this.ClickBeforeEvent = function(id, obj, evt, type) {
		console.log('overwrite xxx.ClickBeforeEvent(id, obj, evt, type)');
		return true;
	};
	/**
	 * 点击后执行
	 * 
	 * @param rqs
	 *            日期数组
	 * @param isChecked
	 *            是否选中
	 * @param evt
	 *            event
	 */
	this.ClickEvent = function(rqs, isChecked, evt) {
		// overwrite this;
		console.log('overwrite xxx.ClickEvent(rqs,   isChecked, evt)');
	};
}function EWA_CalendarClass() {
	this._Weeks = _EWA_G_SETTINGS["WEEKS"].split(',');
	this._Days = new Array(31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31);
	this._Months = _EWA_G_SETTINGS["MONTHS"].split(',');
	this._CurDate = new Date();
	this._DaysTable = null;
	this._SelectMonth = null;
	this._SelectYear = null;
	this._SelectHour = null;
	this._SelectMinute = null;
	this.CreateWindow = window;
	this.IsShowTime = false;
	this.Object = null;
	this.Dialog = null;
	//
	this.ChangeDate = function() {
		var y = this._SelectYear.value;
		var m = this._SelectMonth.value;
		// var d = this._DaysTable.getAttribute("EMP_CURRENT_DAY");

		this._SetNewDate(y, m, 1);
		this._WriteDays(false);
	};
	this._SetNewDate = function(y, m, d) {
		if (!y) {
			var y = this._SelectYear.value;
			var m = this._SelectMonth.value;
			var d = this._DaysTable.getAttribute("EMP_CURRENT_DAY");
			var lastDay;
			if ((((y - 2008) % 4 == 0 && y % 100 != 0) || (y % 400 == 0))
					&& m == 1) {
				lastDay = 29
			} else {
				lastDay = this._Days[m];
			}
			if (d > lastDay) {
				d = lastDay;
			}
		}
		this._CurDate = new Date(y, m, d);
		if (this.IsShowTime) {
			var hh = this._SelectHour.value;
			var mm = this._SelectMinute.value;

			this._CurDate.setHours(hh);
			this._CurDate.setMinutes(mm);
		}
	};
	this.SetDate = function(dateString) {
		var dd = dateString.split(" ");
		var d1 = dd[0].split("-");
		if (d1.length < 3) {
			d1 = dd[0].split("/");
		}
		if (d1.length < 3) {
			d1 = dd[0].split(".");
		}
		if (d1.length == 3) {
			d1[0] = parseInt(d1[0]);
			if (d1[1].substring(0, 1) == "0") {
				d1[1] = d1[1].substring(1);
			}
			if (d1[2].substring(0, 1) == "0") {
				d1[2] = d1[2].substring(1);
			}
			d1[1] = parseInt(d1[1]);
			d1[2] = parseInt(d1[2]);
			if (!(d1[0] + "" == "NaN" || d1[1] + "" == "NaN" || d1[2] + "" == "NaN")) {
				if (EWA.LANG.toUpperCase() == "ENUS") {// mm/dd/yyyy
					if (_EWA_G_SETTINGS.DATE == "dd/MM/yyyy") {
						this._CurDate = new Date(d1[2], d1[1] - 1, d1[0]);
					} else {
						this._CurDate = new Date(d1[2], d1[0] - 1, d1[1]);
					}
				} else {
					this._CurDate = new Date(d1[0], d1[1] - 1, d1[2]);
				}
				if (dd.length > 1) {
					d1 = dd[1].split(':');
					this._CurDate.setHours(d1[0]);
					if (d1.length > 1) {
						this._CurDate.setMinutes(d1[1]);
					}
					if (d1.length > 2) {
						this._CurDate.setSeconds(d1[2].split('.')[0]);
					}
				}
			}
			var day = this._CurDate.getDate();
			if (this._DaysTable) {
				this._DaysTable.setAttribute("EMP_CURRENT_DAY", day);
			}
		}
	};

	this._CreateTime = function() {
		var d1 = this._CurDate;
		var td = this.CreateWindow.document.createElement("div");

		var selHor = this.CreateWindow.document.createElement("select");
		var selTime = this.CreateWindow.document.createElement("select");
		var span1 = this.CreateWindow.document.createElement("span");
		if (EWA.LANG.toLowerCase() == 'enus') {
			span1.innerHTML = 'Time ';
		}else{
			span1.innerHTML = '时间 ';
		}
		var span2 = this.CreateWindow.document.createElement("span");
		span2.innerHTML = ":";
		for (var i = 0; i < 24; i++) {
			var time_val = i < 10 ? ("0" + i) : (i + "");
			selHor.options[selHor.options.length] = new Option(time_val,
					time_val);
		}
		selHor.value = ((100 + d1.getHours()) + "").substring(1);
		td.appendChild(span1);
		td.appendChild(selHor);

		td.appendChild(span2);
		td.appendChild(selTime);
		var span3 = this.CreateWindow.document.createElement("span");
		span3.innerHTML = '&nbsp;';

		var a = this.CreateWindow.document.createElement("span");
		a.style.cursor = 'pointer';
		a.style.color = 'blue';
		a.setAttribute('IS_ALL', 0);
		a.onclick = function() {
			var o = selTime;
			o.options.length = 0;
			if (this.getAttribute('IS_ALL') == 1) {
				for (var i = 0; i < 12; i++) {
					var vv = ((100 + i * 5) + "").substring(1);
					o.options[o.options.length] = new Option(vv, vv);
				}
				var mm = d1.getMinutes();
				mm = mm % 5 == 0 ? mm : parseInt(mm / 5) * 5;
				selTime.value = ((100 + mm) + "").substring(1);
				this.setAttribute('IS_ALL', 0);
				this.innerHTML = '全部';
			} else {
				for (var i = 0; i < 60; i++) {
					var vv = ((100 + i) + "").substring(1);
					o.options[o.options.length] = new Option(vv, vv);
				}
				var mm = d1.getMinutes();
				selTime.value = ((100 + mm) + "").substring(1);
				this.setAttribute('IS_ALL', 1);
				this.innerHTML = '每5分钟';
			}
		}
		td.appendChild(span3);
		td.appendChild(a);
		return td;
	}
	this.CreateTime = function() {
		var ss = [];
		var s1 = "<table border=0 class='ewa-ui-date-picker' style='border:1px solid #aaa' bgcolor='#E1E1E1' onselectstart='return false'>";
		ss.push(s1);

		// time
		ss.push("<tr><td><nobr></nobr></td></tr>");
		// today;
		ss.push("</table>");

		var o = this.CreateWindow.document.createElement("DIV");
		o.innerHTML = ss.join("");

		var tr = o.childNodes[0].rows[0];
		var td = tr.cells[0].childNodes[0];
		var obj = this._CreateTime();

		while (obj.childNodes.length > 0) {
			var oz = obj.childNodes[0];
			td.appendChild(oz);
		}

		var a = td.getElementsByTagName('span')[3];
		a.setAttribute('IS_ALL', 1);
		a.click();
		a.style.display = 'none';
		var opt = this.CreateWindow.document.createElement("input");
		opt.type = 'button';

		var ctTxt;
		if (EWA.LANG.toLowerCase() == 'enus') {
			opt.value = "OK";
			ctTxt = "Clear";
		} else {
			opt.value = '确定';
			ctTxt = "清除";
		}
		opt.onclick = function() {
			var win = EWA.B.IE ? this.ownerDocument.parentWindow
					: this.ownerDocument.defaultView;
			var objs = this.parentNode.getElementsByTagName('select');
			var v1 = win._EWA_CALENDAR_TIME_ITEM.Object.value;
			var v2 = objs[0].value + ':' + objs[1].value;
			win._EWA_CALENDAR_TIME_ITEM.Object.value = v2;
			win._EWA_CALENDAR_TIME_ITEM.Dialog.Show(false);
			if (v1 != v2) {
				$(win._EWA_CALENDAR_TIME_ITEM.Object).trigger("keyup");
				$(win._EWA_CALENDAR_TIME_ITEM.Object).trigger("blur");
			}
		}
		td.appendChild(opt);

		var o2 = "<a href='javascript:void(0)' style='margin:0 5px;color:#08c;font-size:12px;'>"
				+ ctTxt + "</a>";
		$(td).append(o2);
		$(td).find("a").click(
				function() {
					var win = EWA.B.IE ? this.ownerDocument.parentWindow
							: this.ownerDocument.defaultView;
					var v = win._EWA_CALENDAR_TIME_ITEM.Object.value;
					win._EWA_CALENDAR_TIME_ITEM.Object.value = "";
					win._EWA_CALENDAR_TIME_ITEM.Dialog.Show(false);
					if (v != '') {
						$(win._EWA_CALENDAR_TIME_ITEM.Object).trigger("keyup");
						$(win._EWA_CALENDAR_TIME_ITEM.Object).trigger("blur");
					}
				});
		var o3 = "<b class='fa fa-close' style='color:#666;font-size:12px;'></b>";
		$(td).append(o3);
		$(td).find("b").click(
				function() {
					var win = EWA.B.IE ? this.ownerDocument.parentWindow
							: this.ownerDocument.defaultView;
					win._EWA_CALENDAR_TIME_ITEM.Dialog.Show(false);
				});
		return o.childNodes[0];
	}
	this.CreateCalendar = function(haveTime) {
		this.IsShowTime = haveTime;

		var ss = [];
		var s1 = "<table border=0 class='ewa-ui-date' onselectstart='return false'>";
		ss.push(s1);

		// month year
		ss.push("<tr>");
		ss.push("<td height=28>" + this._CreateMonth() + "</td>");
		ss.push("<td align=right>" + this._CreateYear() + "</td>");
		ss.push("</tr>");

		// days;
		ss.push("<tr><td colspan=2>" + this._CreateDaysTable() + "</td></tr>");
		// time
		ss.push("<tr style='display:none'><td colspan=2></td></tr>");

		// today;
		ss.push("<tr><td colspan=2>" + this._CreateToDay() + "</td></tr>");
		ss.push("</table>");

		var o = this.CreateWindow.document.createElement("DIV");
		o.innerHTML = ss.join("");
		this._DaysTable = o.childNodes[0].rows[1].cells[0].childNodes[0];
		var o1 = o.getElementsByTagName("select");
		this._SelectMonth = o1[0];
		this._SelectYear = o1[1];
		o1 = null;

		this._WriteDays();
		if (haveTime) {
			var d1 = this._CurDate;
			var tr = o.childNodes[0].rows[2];
			tr.style.display = '';
			var td = tr.cells[0];

			var obj = this._CreateTime();
			while (obj.childNodes.length > 0) {
				var oz = obj.childNodes[0];
				td.appendChild(oz);

			}
			var a = td.getElementsByTagName('span')[3];
			a.click();

			this._SelectHour = td.getElementsByTagName('select')[0];
			this._SelectMinute = td.getElementsByTagName('select')[1];
		}

		return o.childNodes[0];
	};
	this._CreateToDay = function() {
		var opt = {};
		if (EWA.LANG.toLowerCase() == 'enus') {
			opt["today"] = "Today";
			opt["empty_title"] = "Empty";
			opt["empty"] = "Empty";
			opt["close"] = "Close"
		} else {
			opt["today"] = "设置为今天";
			opt["empty_title"] = "清空日期";
			opt["empty"] = "空";
			opt["close"] = "关闭"
		}
		var clickEvt = "if(_EWA_CALENDAR_ITEM.Object.onkeyup!=null)_EWA_CALENDAR_ITEM.Object.onkeyup();"
				+ "if(_EWA_CALENDAR_ITEM.Object.onblur!=null)_EWA_CALENDAR_ITEM.Object.onblur();";
		var today = "<div class='ewa-ui-date-today-day' title='" + opt["today"]
				+ "'"
				+ " onclick='_EWA_CALENDAR_ITEM.Object.value=this.innerHTML;"
				+ clickEvt + "_EWA_CALENDAR_ITEM.Dialog.Show(false);'>"
				+ this.GetDate(new Date()) + "</div>";
		var s1 = "<table border=0 class='ewa-ui-date-today' width=100%>";
		s1 += "<tr>";
		s1 += "<td class='ewa-ui-date-today-day' onclick='_EWA_CALENDAR_ITEM.Object.value=$(this).next().text();"
				+ clickEvt
				+ "_EWA_CALENDAR_ITEM.Dialog.Show(false);'>"
				+ _EWA_G_SETTINGS["Today"] + "</td>";
		s1 += "<td>" + today + "</td>";
		s1 += "<td><div class='ewa-ui-date-today-clear' title='"
				+ opt["empty_title"] + "'"
				+ " onclick='_EWA_CALENDAR_ITEM.Object.value=\"\";" + clickEvt
				+ "_EWA_CALENDAR_ITEM.Dialog.Show(false);'>" + opt["empty"]
				+ "</div></td>";
		s1 += "<td align=right><div class='ewa-ui-date-close' title='"
				+ opt["close"]
				+ "' onclick='_EWA_CALENDAR_ITEM.Hidden()'><b>X</b></div></td>";
		s1 += "</tr></table>";
		return s1;
	};

	/**
	 * 标记当前设定的日期
	 */
	this.MarkDay = function() {
		var day = this._DaysTable.getAttribute("EMP_CURRENT_DAY") * 1;
		for (var i = 1; i < this._DaysTable.rows.length; i += 1) {
			var r = this._DaysTable.rows[i];
			for (var m = 0; m < r.cells.length; m += 1) {
				var td = r.cells[m];
				if (td.childNodes.length > 0
						&& GetInnerText(td.childNodes[0]) * 1 == day) {
					this.MarkSelected(td);
				} else {
					this.MarkUnSelected(td);
				}
			}
		}
	};
	this.MarkSelected = function(obj) {
		$(obj).addClass('ewa-ui-date-selected');
		// obj.style.backgroundColor = "blue";
	};
	this.MarkUnSelected = function(obj) {
		$(obj).removeClass('ewa-ui-date-selected');
		// obj.style.backgroundColor = "";
	};
	this.MarkBlur = function(obj) {
		$(obj).addClass('ewa-ui-date-blur');
		// obj.style.border = "1px solid #cdcdcd";
	};
	this.MarkUnBlur = function(obj) {
		$(obj).removeClass('ewa-ui-date-blur');
		// obj.style.border = "1px solid #f1f1f1";
	};
	this._CreateMonth = function() {
		var oTable = this._CreatePervNext();
		var s1 = "<select onchange='_EWA_CALENDAR_ITEM.ChangeDate();'>";
		var s2;
		var curMonth = this._CurDate.getMonth();
		for (var i = 0; i < this._Months.length; i += 1) {
			if (i == curMonth) {
				s1 += "<option value='" + i + "' selected>" + this._Months[i]
						+ "</option>";
			} else {
				s1 += "<option value='" + i + "'>" + this._Months[i]
						+ "</option>";
			}
		}
		s1 += "</select>";
		oTable = oTable.replace("[$]", s1);
		return oTable;
	};
	this._CreateYear = function() {
		var y1 = 1900;
		var y2 = 2050;
		var curYear = this._CurDate.getFullYear();
		var oTable = this._CreatePervNext();
		var ss = [];
		ss[0] = "<select onchange='_EWA_CALENDAR_ITEM.ChangeDate();'>";
		var s2;
		for (var i = y1; i <= y2; i += 1) {
			if (i == curYear) {
				ss
						.push("<option value='" + i + "' selected>" + i
								+ "</option>");
			} else {
				ss.push("<option value='" + i + "'>" + i + "</option>");
			}
		}
		ss.push("</select>");
		oTable = oTable.replace("[$]", ss.join(""));
		return oTable;
	};
	this._CreatePervNext = function() {
		var js = "var o=this.parentNode;var o1=o.nextSibling.childNodes[0];if(o1.selectedIndex>0){o1.value=o1.value*1-1;o1.onchange();}o=o1=null";
		var js1 = "var o=this.parentNode;var o1=o.previousSibling.childNodes[0];if(o1.options.length-1>o1.selectedIndex){o1.value=o1.value*1+1;o1.onchange();}o=o1=null";
		var sPrev = "<div class='ewa-ui-date-prev'  onclick='" + js
				+ "'><b class='fa fa-caret-left'></b></div>";
		var sNext = "<div class='ewa-ui-date-next' onclick='" + js1
				+ "'><b class='fa fa-caret-right'></div>";
		var s1 = "<table cellpadding=0 cellspacing=0 border=0>";
		s1 += "<tr><td>" + sPrev + "</td><td>[$]</td><td>" + sNext
				+ "</td></tr></table>";
		return s1;
	};
	/**
	 * 创建日历
	 * 
	 * @param isMark
	 *            是否标记日期
	 */
	this._WriteDays = function(isMark) {
		if (this.__LAST__WriteDaysDate != this._CurDate) {
			// 当前日期不重新创建
			this.__LAST__WriteDaysDate = this._CurDate;

			var mmm = this._CreateDays();
			var day = this._CurDate.getDate();

			var month = this._CurDate.getMonth();
			var year = this._CurDate.getFullYear();

			this._SelectMonth.value = month;
			this._SelectYear.value = year;

			var modth = (month + 1);
			if (modth < 10) {
				modth = "0" + modth;
			}
			var title = year + "-" + modth + "-DD";
			// 新增20170414 guolei
			var rq = this._CurDate.getFullYear() + "" + modth;
			if (EWA.LANG != null && EWA.LANG.toUpperCase() == 'ENUS') {
				if (_EWA_G_SETTINGS.DATE == "dd/MM/yyyy") {
					title = "DD/" + modth + "/" + year;
				} else {
					title = modth + "/DD/" + year;
				}
			}
			var otd;
			for (var i = 1; i < this._DaysTable.rows.length; i += 1) {
				var r = this._DaysTable.rows[i];
				for (var m = 0; m < r.cells.length; m += 1) {
					otd = r.cells[m];
					if (mmm[i] == null || mmm[i][m] == null) {
						otd.innerHTML = "";
					} else {
						var rq1 = rq + mmm[i][m]; // 新增20170414 guolei
						otd.innerHTML = "<div date='" + rq1 + "' title='"
								+ title.replace("DD", mmm[i][m]) + "'>"
								+ mmm[i][m] + "</div>";
					}
					this.MarkUnSelected(otd);
					otd = null;
				}
				if ($(r).text() == '') {
					$(r).hide();
				} else {
					$(r).show();
				}
			}
		}
		if (isMark) {
			this.MarkDay();
		}
	};
	this._CreateDaysTable = function() {
		var ss = [];
		ss[0] = "<table class='ewa-ui-days' align ='center' border=0 cellpadding=1 cellspacing=1 EMP_CURRENT_DAY='"
				+ this._CurDate.getDate() + "'>";
		for (var i = 0; i < 7; i += 1) {
			ss.push("<tr>");
			for (var m = 0; m < 7; m += 1) {

				if (i == 0) {
					ss.push("<th>" + this._Weeks[m] + "</th>");
				} else {
					ss
							.push("<td onmouseover='if(this.innerHTML.length>0)_EWA_CALENDAR_ITEM.MarkBlur(this);'");
					ss
							.push(" onmouseout='if(this.innerHTML.length>0)_EWA_CALENDAR_ITEM.MarkUnBlur(this);'");
					ss
							.push(" onclick='_EWA_CALENDAR_ITEM.Clicked(this);'></td>");
				}
			}
			ss.push("</tr>");
		}
		ss.push("</table>")
		return ss.join("");
	};
	this.Clear = function() {
		this.Object.value = "";
		this.Hidden();
	};
	this.Hidden = function(notRunOnBlur) {
		if (this.Object.onblur != null && !notRunOnBlur) {
			this.Object.onblur();
		}
		this.Object = null;
		this.Dialog.Show(false);
	};
	this.Clicked = function(obj) {
		if (obj.innerHTML.length > 0) {
			this._DaysTable.setAttribute("EMP_CURRENT_DAY",
					obj.childNodes[0].innerHTML);
			this._SetNewDate();
			this.MarkDay();
			this.Object.value = this.GetDate();
			if (this.Object.onkeyup != null) {
				this.Object.onkeyup();
			}
			if (this.Object.onblur != null) {
				this.Object.onblur();
			}
			if (this.Object.onchange != null) {
				// 显示定义了 onchange 属性
				this.Object.onchange();
			} else {
				// 不管有没有，都触发 change 事件
				$(this.Object).trigger('change');
			}
			this.Hidden(true);
		}
	}
	this.GetDate = function(d1) {
		var d2 = _EWA_G_SETTINGS["DATE"];
		if (d1 == null) {
			d1 = this._CurDate;
		}
		var y = d1.getFullYear();
		var m = d1.getMonth() + 1;
		var d = d1.getDate();
		if (m < 10) {
			m = "0" + m;
		}
		if (d < 10) {
			d = "0" + d;
		}
		var s1 = d2.replace('yyyy', y);
		s1 = s1.replace('MM', m);
		s1 = s1.replace('dd', d);

		if (this.IsShowTime) {
			var hh = d1.getHours();
			var mm = d1.getMinutes();
			hh = hh < 10 ? "0" + hh : hh;
			mm = mm < 10 ? "0" + mm : mm;
			s1 += " " + hh + ":" + mm;
		}
		return s1;
	};
	this._CreateDays = function() {
		var baseDate = new Date(this._CurDate.getFullYear(), this._CurDate
				.getMonth(), 1);
		var week = baseDate.getDay();
		var a = 1;
		var arrayDays = new Array();
		arrayDays[0] = this._Weeks;
		var m = 1;
		var maxDays = this._getCurMonthDays();
		for (var i = 0; i < 49; i += 1) {
			if (i == 0 || week == 7) {
				arrayDays[m] = new Array();
				m += 1;
			}
			if (week == 7) {
				week = 0;
			}
			if (a <= maxDays) {
				arrayDays[m - 1][week] = (a < 10 ? "0" + a : a + "");
			} else {
				break;
			}
			a += 1;
			week += 1;
		}
		return arrayDays;
	};
	this._getCurMonthDays = function() {
		if ((((this._CurDate.getFullYear() - 2008) % 4 == 0 && (this._CurDate
				.getFullYear() - 400) % 100 != 0) || (this._CurDate
				.getFullYear() - 400) % 400 == 0)
				&& this._CurDate.getMonth() == 1) {
			return 29;
		} else {
			return this._Days[this._CurDate.getMonth()];
		}
	};
}

var __Cal = {
	C : EWA_CalendarClass,
	WND : null, // 实例化的日期
	WND_PARENT : null, // 打开日期的对象
	WND_DIA : null
// 实例化的窗体
}

__Cal.Pop = function(obj, havTime) {
	var popId = 'WND_PARENT/Pop/' + havTime;
	if (!__Cal[popId]) {
		__Cal[popId] = {};
	}
	var ins = __Cal[popId];
	ins.OBJ = obj;
	if (ins.WND == null) {
		// console.log('create instance');

		var o = ins.WND_DIA = new EWA_UI_DialogClass();
		o.Width = 172;
		o.Height = 200;
		o.ShadowColor = "";
		ins.WND = new EWA_CalendarClass();
		if (typeof _EWA_DialogWnd == 'undefined') {
			o.CreateWindow = window;
		} else { // pop window created
			o.CreateWindow = _EWA_DialogWnd._ParentWindow;
			_EWA_DialogWnd.OpendDialogs[_EWA_DialogWnd.OpendDialogs.length] = o;
		}
		o.CreateWindow._EWA_CALENDAR_ITEM = ins.WND;
		o.Create();
		ins.WND.CreateWindow = o.CreateWindow;
		ins.WND.SetDate(obj.value);
		var o1 = ins.WND.CreateCalendar(havTime);
		o.SetObject(o1);
		ins.WND.Dialog = o;
		// 自动设定高度和宽度
		$(o.GetFrameContent()).css('width','').css('height','');
		o = o1 = null;
	}
	// console.log('show instance');
	ins.WND.SetDate(obj.value);
	ins.WND._WriteDays(true);
	ins.WND.Dialog.SetZIndex(10);
	ins.WND.Object = obj;
	ins.WND_DIA.MoveBottom(obj);
	ins.WND_DIA.Show(true);
}
__Cal.PopTime = function(obj) {
	var popId = 'WND_PARENT/PopTime/';
	if (!__Cal[popId]) {
		__Cal[popId] = {};
	}
	var ins = __Cal[popId];
	ins.OBJ = obj;
	if (ins.WND == null) {
		var o = ins.WND_DIA = new EWA_UI_DialogClass();
		o.Width = 180;
		o.Height = 20;
		o.ShadowColor = "";
		ins.WND = new EWA_CalendarClass();
		if (typeof _EWA_DialogWnd == 'undefined') {
			o.CreateWindow = window;
		} else { // pop window created
			o.CreateWindow = _EWA_DialogWnd._ParentWindow;
			_EWA_DialogWnd.OpendDialogs[_EWA_DialogWnd.OpendDialogs.length] = o;
		}
		o.CreateWindow._EWA_CALENDAR_TIME_ITEM = ins.WND;
		o.Create();
		ins.WND.CreateWindow = o.CreateWindow;
		ins.WND.SetDate(obj.value);

		var o1 = ins.WND.CreateTime();
		o.SetObject(o1);
		ins.WND.Dialog = o;
		
		// 自动设定高度和宽度
		$(o.GetFrameContent()).css('width','').css('height','');
		
		o = o1 = null;
	}
	ins.WND.CreateWindow._EWA_CALENDAR_TIME_ITEM.Object = obj;
	ins.WND.CreateWindow._EWA_CALENDAR_TIME_ITEM.Dialog = ins.WND_DIA;
	ins.WND.SetDate(obj.value);
	ins.WND.Dialog.SetZIndex(10);
	ins.WND.Object = obj;
	ins.WND_DIA.MoveBottom(obj);
	ins.WND_DIA.Show(true);
}

EWA["UI"].Calendar = __Cal /* 日历 *//**
 * 提示消息框
 */
function EWA_UI_MsgClass(msg, isSelfWindow) {
	this._IsSelfWindow = isSelfWindow;
	this._Dialog = null;
	this._Msg = msg;
	this._Buttons = [];
	this._Caption = null;
	this._Icon = "MSG_ICON" // MSG_ICON,ERR_ICON,QUS_ICON;
	this.SetIcon = function(icon) {
		this._Icon = icon;
	}
	this.SetCaption = function(txtCap) {
		this._Caption = txtCap;
	}
	this.AddButton = function(text, event) {
		this._Buttons.push({
			Text: text,
			Event: event
		});
	}
	this.AddButtons = function(buts) {
		if (buts == null)
			return;
		for (var i = 0; i < buts.length; i++) {
			this._Buttons.push(buts[i]);
		}
	};
	this.addClass = function(className) {
		$(this._Dialog.getMain()).addClass(className);
	};

	this._Init = function() {
		let dw = document.documentElement.clientWidth;
		let width;
		if (dw > 410) {
			width = 400;
		} else if (dw > 300) {
			width = dw - 10;
		} else {
			width = 300;
		}

		let html = this._CreateHtml(width);

		//$DialogHtml = function(html, title, width, height, noHeader, callback)
		this._Dialog = $DialogHtml(html, this._Caption, width);
		this._Dialog._ParentWindow = window;

		let that = this;

		$(this._Dialog.getContent()).find('button[_ewa_dialog_]').on('click', function() {
			$(this).attr('_ewa_dialog_', that._Dialog.Id);
			if ($(this).attr('evt')) {
				that.fire($(this).attr('evt'));;
			} else {
				that.Hidden();
			}
		});
		this._Dialog.AutoSize();
	}
	this._CreateHtml = function(width) {
		var s = [];
		s.push("<table border=0 class='MSG_INFO' style='width: " + width + "px'>");
		s.push("<tr><td rowspan=2 style='width:130px;' align='center'>");
		s.push("<div class='" + this._Icon + "'>&nbsp;</div></td>");
		s.push("<td class='MSG_TEXT'>");
		s.push(this._Msg);
		s.push("</td></tr>");
		s.push("<tr><td class='MSG_BUTS'>");

		if (this._Buttons.length > 0) {
			s.push("<hr><table><tr>")
			for (var i = 0; i < this._Buttons.length; i++) {
				var but = this._Buttons[i];
				s.push("<td>");
				var s1 = "<button _ewa_msg_default='" + (but.Default ? 1 : 0)
					+ "'  type='button' _ewa_dialog_='[~ID~]' ";

				if (but.Event && typeof but.Event == 'function') {
					s1 += " evt='" + i + "'>" + but.Text + "</button>";
				} else {
					s1 += ">" + but.Text + "</button>";
				}
				s.push(s1);
				s.push("</td>");
			}
			s.push("</tr></table>");
		}
		s.push("</td></tr></table>");
		return s.join('');
	};
	this.fire = function(buttonIndex) {
		var but = this._Buttons[buttonIndex];
		if (but && but.Event) {
			try {
				but.Event(this);
			} catch (e) {
				console.log(e);
			}
		}
		this.Hidden();
	};
 
	this.Show = function(isShow, isInApp) {
		if (this._Dialog == null) {
			this._Init();
		}

		if (isShow) {
			var buts = this._Dialog._ParentWindow.document
				.getElementsByTagName('button');

			if (isInApp) { // 在app中touch 事件会造成错误点击
				// 位置通过css定义
				var thisButs = [];
				// 隐含按钮
				for (var i = 0; i < buts.length; i++) {
					var but = $(buts[i]);
					if (but.attr('_ewa_dialog_') == this._Dialog.Id) {
						but.prop('disabled', true);
						thisButs.push(but);

					}
				}
				// 显示按钮
				setTimeout(function() {
					for (var n in thisButs) {
						thisButs[n].prop('disabled', false);
					}
				}, 435);
			} else {
				this._Dialog.AutoSize();
				//this._Dialog.MoveCenter();

				for (var i = 0; i < buts.length; i++) {
					if (buts[i].getAttribute('_ewa_msg_default') == 1
						&& buts[i].getAttribute('_ewa_dialog_') == this._Dialog.Id) {
						buts[i].focus();
						break;
					}
				}
			}
		}
	}
	this.Hidden = function() {
		this._Dialog.Close();
	}
}

EWA.UI.Msg = {
	IS_IN_APP: false, // 是否在App中，外部定义，在app中touch 事件会造成错误点击
	C: EWA_UI_MsgClass,
	/**
	 * 显示消息
	 * 
	 * @param {}
	 *            txtMsg 消息内容
	 * @param {}
	 *            buttons 按键
	 * @param {}
	 *            txtCaption 标题
	 * @param {}
	 *            txtIcon 图标，css名称
	 * @return {}
	 */
	Show: function(txtMsg, buttons, txtCaption, txtIcon) {
		if (txtMsg.indexOf("(") > 0 && txtMsg.trim().endsWith(")")) {
			try {
				txtMsg = eval(txtMsg);
			} catch (e) {
				console.log(txtMsg);
			}
		}
		var msg = new EWA_UI_MsgClass(txtMsg);
		msg.SetCaption(txtCaption)
		msg.AddButtons(buttons);
		msg.SetIcon(txtIcon)

		// 在app中touch 事件会造成错误点击
		msg.Show(true, EWA.UI.Msg.IS_IN_APP);
		return msg;
	},
	ShowInfo: function(txtMsg, buttons, txtCaption) {
		__EWA_MSG__ = EWA.UI.Msg.Show(txtMsg, buttons, txtCaption, "MSG_ICON");
		//$(__EWA_MSG__._Dialog._Dialog.GetFrame()).addClass('ewa-msg-info');
		__EWA_MSG__.addClass('ewa-msg-info');
		return __EWA_MSG__;
	},
	ShowError: function(txtMsg, txtCaption) {
		var buts = [];
		buts[0] = {
			Text: _EWA_INFO_MSG['BUT.OK'],
			Event: null,
			Default: true
		};
		__EWA_MSG__ = EWA.UI.Msg.Show(txtMsg, buts, txtCaption, "ERR_ICON");
		//$(__EWA_MSG__._Dialog._Dialog.GetFrame()).addClass('ewa-msg-err');
		__EWA_MSG__.addClass('ewa-msg-err');
		return __EWA_MSG__;
	},
	Alter: function(txtMsg, txtCaption) {
		console.log('拼写错误，应该是Alert');
		return EWA.UI.Msg.Alert(txtMsg, txtCaption);
	},
	Alert: function(txtMsg, txtCaption) {
		var buts = [];
		buts[0] = {
			Text: _EWA_INFO_MSG['BUT.OK'],
			Event: null,
			Default: true
		};
		__EWA_MSG__ = EWA.UI.Msg.Show(txtMsg, buts, txtCaption, "MSG_ICON");
		//$(__EWA_MSG__._Dialog._Dialog.GetFrame()).addClass('ewa-msg-alert');
		__EWA_MSG__.addClass('ewa-msg-alert');
		return __EWA_MSG__;
	},
	Confirm: function(txtMsg, txtCaption, yesFunction, noFunction) {
		var buts = [];
		buts[0] = {
			Text: _EWA_INFO_MSG['BUT.YES'],
			Event: yesFunction
		};
		buts[1] = {
			Text: _EWA_INFO_MSG['BUT.NO'],
			Event: noFunction,
			Default: true
		};
		__EWA_MSG__ = EWA.UI.Msg.Show(txtMsg, buts, txtCaption, "QUS_ICON");
		//$(__EWA_MSG__._Dialog._Dialog.GetFrame()).addClass('ewa-msg-confirm');
		__EWA_MSG__.addClass('ewa-msg-confirm');
		return __EWA_MSG__;
	},
	_Tip: function(msg, cssBox, cssText, interval) {
		var obj = document.createElement('table');
		document.body.appendChild(obj);
		$(obj).css(cssBox);
		var td = obj.insertRow(-1).insertCell(-1);
		$(td).css(cssText);
		if (interval && interval instanceof Function) {
			td.innerHTML = '<i class="fa fa-refresh fa-spin"></i> ' + msg;
			// 定时检查function是否返回true
			var timer = setInterval(function() {
				if (interval()) {
					window.clearInterval(timer);

					$(obj).animate({
						opacity: 0
					}, 200, function() {
						$(obj).remove();
					});
				}
			}, 300);
		} else {
			td.innerHTML = msg;
			if (!interval || isNaN(interval)) {
				interval = 1500;// 1.5s
			}

			setTimeout(function() {
				$(obj).animate({
					opacity: 0
				}, 200, function() {
					$(obj).remove();
				});
			}, interval);
		}
	},
	Tip: function(msg, interval) {
		var z = window._EWA_UI_DIALOG_COVERINDEX ? window._EWA_UI_DIALOG_COVERINDEX + 10
			: 1000000;
		var css_box = {
			width: 300,
			height: 80,
			padding: 10,
			'background-color': 'rgba(10,20,30,0.7)',
			position: 'fixed',
			top: '50%',
			left: '50%',
			'margin-left': -150,
			'margin-top': -40 - 10 - 10,
			'border-radius': 10,
			'z-index': z,
			'color': '#fff'
		};
		if (EWA.B.IE && EWA.B.VERSION * 1 < 9) {
			css_box['filter'] = "progid:DXImageTransform.Microsoft.Gradient(GradientType=0,StartColorStr='#77000000',EndColorStr='#77000000')";
		}
		var css_text = {
			'text-align': 'center',
			'font-size': 16,
			'line-height': 1.5
		};
		EWA.UI.Msg._Tip(msg, css_box, css_text, interval);
	},
	TipBR: function(msg, interval) {// 在页面底部显示消息
		var z = window._EWA_UI_DIALOG_COVERINDEX ? window._EWA_UI_DIALOG_COVERINDEX + 10
			: 1000000;
		var css_box = {
			height: 20,
			padding: 2,
			'background-color': 'rgba(222,222,0,0.7)',
			position: 'fixed',
			bottom: 5,
			right: 5,
			'border-radius': 1,
			'z-index': z,
			'color': '#111'
		};
		if (EWA.B.IE && EWA.B.VERSION * 1 < 9) {
			css_box['filter'] = "progid:DXImageTransform.Microsoft.Gradient(GradientType=0,StartColorStr='#66000000',EndColorStr='#66000000')";
		}
		var css_text = {
			'text-align': 'center',
			'font-size': 12,
			'line-height': 1.5
		};
		EWA.UI.Msg._Tip(msg, css_box, css_text, interval);
	},
	TipBL: function(msg, interval) {// 在页面底部显示消息
		var z = window._EWA_UI_DIALOG_COVERINDEX ? window._EWA_UI_DIALOG_COVERINDEX + 10
			: 1000000;
		var css_box = {
			height: 20,
			padding: 2,
			'background-color': 'rgba(222,222,0,0.7)',
			position: 'fixed',
			bottom: 5,
			left: 5,
			'border-radius': 1,
			'z-index': z,
			'color': '#111'
		};
		if (EWA.B.IE && EWA.B.VERSION * 1 < 9) {
			css_box['filter'] = "progid:DXImageTransform.Microsoft.Gradient(GradientType=0,StartColorStr='#66000000',EndColorStr='#66000000')";
		}
		var css_text = {
			'text-align': 'center',
			'font-size': 12,
			'line-height': 1.5
		};
		EWA.UI.Msg._Tip(msg, css_box, css_text, interval);
	},
	TipTL: function(msg, interval) {// 在页面底部显示消息
		var z = window._EWA_UI_DIALOG_COVERINDEX ? window._EWA_UI_DIALOG_COVERINDEX + 10
			: 1000000;
		var css_box = {
			height: 20,
			padding: 2,
			'background-color': 'rgba(222,222,0,0.7)',
			position: 'fixed',
			top: 5,
			left: 5,
			'border-radius': 1,
			'z-index': z,
			'color': '#111'
		};
		if (EWA.B.IE && EWA.B.VERSION * 1 < 9) {
			css_box['background-color'] = "filter:progid:DXImageTransform.Microsoft.Gradient(GradientType=0,StartColorStr='#00000000',EndColorStr='#66000000')";
		}
		var css_text = {
			'text-align': 'center',
			'font-size': 12,
			'line-height': 1.5
		};
		EWA.UI.Msg._Tip(msg, css_box, css_text, interval);
	},
	TipTR: function(msg, interval) {// 在页面底部显示消息
		var z = window._EWA_UI_DIALOG_COVERINDEX ? window._EWA_UI_DIALOG_COVERINDEX + 10
			: 1000000;
		var css_box = {
			height: 20,
			padding: 2,
			'background-color': 'rgba(222,222,0,0.7)',
			position: 'fixed',
			top: 5,
			right: 5,
			'border-radius': 1,
			'z-index': z,
			'color': '#111'
		};
		if (EWA.B.IE && EWA.B.VERSION * 1 < 9) {
			css_box['background-color'] = "filter:progid:DXImageTransform.Microsoft.Gradient(GradientType=0,StartColorStr='#00000000',EndColorStr='#66000000')";
		}
		var css_text = {
			'text-align': 'center',
			'font-size': 12,
			'line-height': 1.5
		};
		EWA.UI.Msg._Tip(msg, css_box, css_text, interval);
	}
};
/**
 * 用于标记对象，显示后showSeconds后消失
 * 
 * @param obj
 *            标记的对象/jq对象集合
 * @param showSeconds
 *            显示秒数
 */
$Mark = function(obj, showSeconds) {
	var se = showSeconds || 3;
	var ms = showSeconds * 1000 || 3000; // 默认3秒
	var s = "<div class='ewa-mark' style='transition-duration:" + se
		+ "s;'></div>";
	$(obj).each(function() {
		var o = $(s);
		var p = $(this).offset();
		var css = {
			left: p.left + 2,
			top: p.top - 2,
			width: $(this).outerWidth(),
			height: $(this).outerHeight()
		};
		o.css(css);
		$('body').append(o);
		setTimeout(function() {
			// 动画隐含
			o.css('opacity', 0);
		}, 10);
		setTimeout(function() {
			// 移除对象
			o.remove();
		}, ms + 10);
	});
};
$Confirm = EWA.UI.Msg.Confirm;
$Tip = EWA.UI.Msg.Tip;
$TipBR = EWA.UI.Msg.TipBR;
$TipBL = EWA.UI.Msg.TipBL;
$TipTR = EWA.UI.Msg.TipTR;
$TipTL = EWA.UI.Msg.TipTL;/**
 * 画横向流程
 */
function EWA_UI_FlowChartClass() {
	this.DEF_CHART_WIDTH = 200;
	this.DEF_CHART_HEIGHT = 50;
	this.DEF_BG_COLOR = '#08c';
	this.DEF_COLOR = '#fff';

	this.Create = function(pid, jsonArray, fieldId, filedText, width, height, bgcolor, color) {
		this.PID = pid;
		this.FIELD_ID = fieldId;
		this.FIELD_TEXT = filedText;
		this.CHART_WIDTH = width || this.DEF_CHART_WIDTH;
		this.CHART_HEIGHT = height || this.DEF_CHART_HEIGHT;
		this.BG_COLOR = bgcolor || this.DEF_BG_COLOR;
		this.COLOR = color || this.DEF_COLOR;
		// 箭头的偏移
		this.OFF = Math.round( this.CHART_HEIGHT * Math.sqrt(2) / 2);

		this._CreateCss();

		var main_width = (this.CHART_WIDTH) * jsonArray.length - (this.OFF -4) * (jsonArray.length-1) + 4;
		var ss = [ "<div style='z-index:1;padding-left:" + this.OFF + "px;height:" + this.CHART_HEIGHT
			+ "px;position:relative;margin:auto;width:" + (main_width) + "px'>" ];
		for (var i = 0; i < jsonArray.length; i++) {
			var d = jsonArray[i];
			var html = this._CreateChart(d, i, i == jsonArray.length - 1);
			ss.push(html);
		}
		ss.push("</div>");
		if ($X(pid)) {
			$($X(pid)).append(ss.join(''));
		} else {
			$('body').append(ss.join(''));
		}
	};
	this._CreateCss = function() {
		var pcolor = '#fff';
		// if ($X(this.PID)) {
		// pcolor = $($X(this.PID)).css('background-color');
		// } else {
		// pcolor = $('body').css('background-color');
		// }

		var h = this.CHART_HEIGHT;
		var w = this.CHART_WIDTH;
		var c = this.BG_COLOR;
		var off = this.OFF;
		var off1 = Math.round(off);
		var css = {
			main : "position:relative;margin-left:-" + (off - 4) + "px;float:left;z-index:[ZINDEX];height:" + h
				+ "px;width:[WIDTH]px;overflow:hidden;",
			leftbox : "background-color:[BGCOLOR];float:left;width:" + off1 + "px;height:" + h + "px;overflow:hidden",
			leftarrow : "background: " + pcolor + ";margin-left: -" + off + "px;width:" + h + "px;height:" + h
				+ "px;-webkit-transform: rotate(45deg);transform: rotate(45deg);",
			center : "height:" + h + "px;float:left;text-overflow: ellipsis;overflow: hidden;line-height:" + h
				+ "px;background-color:[BGCOLOR];width:" + (w - off1 * 2) + "px;text-align:center;font-size:16px",
			centertd : "color:[COLOR];text-overflow: ellipsis;overflow: hidden;width:100%;text-align:center;font-size:16px",
			rightbox : "float:right;width:" + off1 + "px;height:" + h + "px;overflow:hidden",
			rightarrow : "background:[BGCOLOR];margin-left: -" + off1 + "px;width:" + h + "px;height:" + h
				+ "px;-webkit-transform: rotate(45deg);transform: rotate(45deg);"
		};
		this.CSS = css;
	};
	this._CreateChart = function(d, idx, islast) {
		console.log(d)

		

		var ss = [];
		var cssMain = this.CSS.main.replace('[ZINDEX]', (1000 - idx)).replace('[LEFT]', (this.CHART_WIDTH - 20) * idx);
		cssMain = cssMain.replace('[WIDTH]', this.CHART_WIDTH);
		ss.push("<div id='" + d[this.FIELD_ID] + "' style='" + cssMain + "'>");

		var bgcolor = d.bgColor || this.BG_COLOR;
		var csslefbox = this.CSS.leftbox.replace('[BGCOLOR]', bgcolor);
		var csscenter = this.CSS.center.replace('[BGCOLOR]', bgcolor);
		var cssrightarrow = this.CSS.rightarrow.replace('[BGCOLOR]', bgcolor);

		var color=d.color||this.COLOR;
		var csscentertd=this.CSS.centertd.replace('[COLOR]', color);
		// 左箭头
		ss.push("<div style='" + csslefbox + "'>");
		ss.push("<div style='" + this.CSS.leftarrow + "'></div>");
		ss.push("</div>");

		// 中间文字
		ss.push("<table border=0 cellpadding=0 cellspacing=0  style='" + csscenter + "'><tr><td style='" + csscentertd
			+ "'>");
		if (typeof this.FIELD_TEXT == 'function') {
			var tmp = this.FIELD_TEXT(d, idx, islast);
			ss.push(tmp);
		} else {
			ss.push(d[this.FIELD_TEXT]);
		}
		ss.push("</td></tr></table>");

		// 右键头
		ss.push("<div style='" + this.CSS.rightbox + "'>");
		ss.push("<div style='" + cssrightarrow + "'></div>");
		ss.push("</div>");

		ss.push("</div>");

		return ss.join('');
	};
}
/*
 * aa = new EWA_UI_FlowChartClass(); var json = [ { id : 'a1', txt : '方式1' }, {
 * id : 'a2', txt : '方式2' }, {id : 'a3', txt : '方式3' }, { id : 'a4', txt : '方式4' }, {
 * id : 'a4', txt : '方式4' } ] aa.Create('EWA_FRAME_MAIN', json, 'id', 'txt',
 * 190, 80, '#000', 'red')
 */var EWA_UI_HtmlEditorConfig = {
	OPT_PopImgProperties : true,
	OPT_ImageResizes : null, // 800x600, 400x300
	fonts : [ {
		name : "微软雅黑",
		font : "Microsoft YaHei"
	}, {
		name : "宋体",
		font : "宋体"
	}, {
		name : "Arial",
		font : "Arial"
	}, {
		name : "STHeiti",
		font : "STHeiti"
	} ],
	formats : [ {
		name : "H1",
		format : "h1"
	}, {
		name : "H2",
		format : "h2"
	}, {
		name : "H3",
		format : "h3"
	}, {
		name : "H4",
		format : "h4"
	}, {
		name : "H5",
		format : "h5"
	}, {
		name : "普通",
		format : "p"
	} ],
	sizes : [ {
		name : "超大",
		size : '7'
	}, {
		name : "特大",
		size : '6'
	}, {
		name : "大",
		size : '5'
	}, {
		name : "标准",
		size : '4'
	}, {
		name : "小",
		size : '3'
	}, {
		name : "特小",
		size : '2'
	}, {
		name : "特小",
		size : '1'
	} ],
	css : "img{max-width:100%}html{background:#2f2f2f}body{width: 800px; padding:10px 20px; margin: auto;"
			+ " box-shadow: rgb(241, 241, 241) 1px 1px 13px; font-size:14px; box-sizing: border-box;"
			+ "overflow-y: scroll;   "
			+ "font-family: 'Microsoft YaHei', STHeiti, 微软雅黑, tahoma, Verdana, Arial, sans-serif, 宋体;"
			+ " background: rgb(255, 255, 255);}",
	colors : [ "#ffffff", "#000000", "#eeece1", "#1f497d", "#4f81bd",
			"#c0504d", "#9bbb59", "#8064a2", "#4bacc6", "#f79646", "#f2f2f2",
			"#7f7f7f", "#ddd9c3", "#c6d9f0", "#dbe5f1", "#f2dcdb", "#ebf1dd",
			"#e5e0ec", "#dbeef3", "#fdeada", "#d8d8d8", "#595959", "#c4bd97",
			"#8db3e2", "#b8cce4", "#e5b9b7", "#d7e3bc", "#ccc1d9", "#b7dde8",
			"#fbd5b5", "#bfbfbf", "#3f3f3f", "#938953", "#548dd4", "#95b3d7",
			"#d99694", "#c3d69b", "#b2a2c7", "#92cddc", "#fac08f", "#a5a5a5",
			"#262626", "#494429", "#17365d", "#366092", "#953734", "#76923c",
			"#5f497a", "#31859b", "#e36c09", "#7f7f7f", "#0c0c0c", "#1d1b10",
			"#0f243e", "#244061", "#632423", "#4f6128", "#3f3151", "#205867",
			"#974806", "#c00000", "#ff0000", "#ffc000", "#ffff00", "#92d050",
			"#00b050", "#00b0f0", "#0070c0", "#002060", "#7030a0" ],

	buts : {
		"FormatBlock" : {
			id : 'fn_FormatBlock',
			'cmd' : 'PopFormatBlock',
			title : "格式",
			'class' : 'fa fa-header'
		},
		"FontSize" : {
			id : 'fn_FontSize',
			'cmd' : 'PopFontSize',
			title : "字體大小",
			'class' : 'fa fa-text-height'
		},
		"FontName" : {
			id : 'fn_FontName',
			'cmd' : 'PopFont',
			title : "字体",
			'class' : 'fa fa-font'
		},
		"BOLD" : {
			"id" : "st_bold",
			"cmd" : "BOLD",
			"title" : "BOLD",
			"class" : "fa fa-bold"
		},
		"ITALIC" : {
			"id" : "st_italic",
			"cmd" : "ITALIC",
			"title" : "ITALIC",
			"class" : "fa fa-italic"
		},
		"UNDERLINE" : {
			"id" : "st_underline",
			"cmd" : "UNDERLINE",
			"title" : "UNDERLINE",
			"class" : "fa fa-underline"
		},
		"InsertOrderedList" : {
			"id" : "st_insertorderedlist",
			"cmd" : "InsertOrderedList",
			"title" : "InsertOrderedList",
			"class" : "fa fa-list-ol"
		},
		"InsertunOrderedList" : {
			"id" : "st_insertunorderedlist",
			"cmd" : "InsertunOrderedList",
			"title" : "InsertunOrderedList",
			"class" : "fa fa-list-ul"
		},
		"INDENT" : {
			"id" : "st_indent",
			"cmd" : "INDENT",
			"title" : "INDENT",
			"class" : "fa fa-indent"
		},
		"Outdent" : {
			"id" : "st_outdent",
			"cmd" : "Outdent",
			"title" : "Outdent",
			"class" : "fa fa-outdent"
		},
		"JustifyLEFT" : {
			"id" : "st_justifyleft",
			"cmd" : "JustifyLEFT",
			"title" : "左对齐",
			"class" : "fa fa-align-left"
		},
		"JustifyCENTER" : {
			"id" : "st_justifycenter",
			"cmd" : "JustifyCENTER",
			"title" : "居中",
			"class" : "fa fa-align-center"
		},
		"JustifyRIGHT" : {
			"id" : "st_justifyright",
			"cmd" : "JustifyRIGHT",
			"title" : "右对齐",
			"class" : "fa fa-align-right"
		},
		"CreateLink" : {
			"id" : "st_createlink",
			"cmd" : "CreateLink",
			"title" : "创建链接",
			"class" : "fa fa-chain"
		},
		"CODE_TXT" : {
			"id" : "code_txt",
			"cmd" : "CODE_TXT",
			"title" : "源代码",
			"class" : "fa fa-html5"
		},
		eraser : {
			id : 'eraser',
			cmd : 'eraser',
			title : '清除格式',
			"class" : "fa fa-eraser"
		},
		'ForColor' : {
			id : 'fn_ForColor',
			cmd : 'PopForColor',
			title : '字體顏色',
			'class' : 'fa fa-font ewa-editor-for'
		},
		'BackColor' : {
			id : 'fn_BackColor',
			cmd : 'PopBackColor',
			title : '背景顏色',
			'class' : 'fa fa-font ewa-editor-bg'
		},
		'Img' : {
			id : 'fn_Img',
			cmd : 'PopImg',
			title : '圖片',
			'class' : 'fa fa-camera'
		},
		FullScreen : {
			id : 'fn_FullScreen',
			cmd : 'FullScreen',
			title : '全屏',
			'class' : 'fa fa-square-o'
		},
		"Word2Html" : {
			id : 'fn_Word2Html',
			cmd : "Word2Html",
			title : "转换Word",
			'class' : 'fa fa-file-word-o'
		}
	},
	defaultConf : [ [ 'FontName', 'FormatBlock', 'FontSize' ],
			[ "BOLD", "ITALIC", "UNDERLINE" ],
			[ 'InsertOrderedList', 'InsertunOrderedList' ],
			[ "JustifyLEFT", "JustifyCENTER", "JustifyRIGHT" ],
			[ "INDENT", "Outdent" ], [ "CreateLink", "eraser" ],
			[ 'ForColor', 'BackColor' ], [ 'Word2Html', 'Img', "FullScreen" ],
			[ "CODE_TXT" ] ],
	pop : function(obj, cnt) {
		for ( var n in __Cal) {
			if (n.indexOf('EDITOR_Pop_') == 0) {
				__Cal[n].WND.Show(false);
			}
		}
		var popId = 'EDITOR_Pop_' + (obj ? obj.id : "");
		if (!__Cal[popId]) {
			__Cal[popId] = {};
		}
		var ins = __Cal[popId];
		ins.OBJ = obj;
		if (ins.WND == null) {
			var o = ins.WND = new EWA_UI_DialogClass();
			o.Width = 172;
			o.Height = 50;
			o.ShadowColor = "";

			o.CreateWindow = window;

			// if (typeof _EWA_DialogWnd == 'undefined') {
			// o.CreateWindow = window;
			// } else { // pop window created
			// o.CreateWindow = _EWA_DialogWnd._ParentWindow;
			// _EWA_DialogWnd.OpendDialogs[_EWA_DialogWnd.OpendDialogs.length] =
			// o;
			// }
			o.CreateWindow._EWA_CALENDAR_ITEM = ins.WND;
			o.Create();
			o.SetHtml(cnt);

			$(o.GetFrameContent()).find('a').attr('onclick',
					"__Cal[\"" + popId + "\"].WND.Show(false);");
			$('div[ewa_name="DIV_BACK1"]').hide();
		}
		ins.WND.SetZIndex(10);
		if (obj) {
			ins.WND.Object = obj;
			ins.WND.MoveBottom(obj);
		} else {
			ins.WND.MoveCenter();
		}
		ins.WND.Show(true);
		return ins;
	},
	pop1 : function(id, cnt, width, height) {
		var popId = 'EDITOR_Pop_' + id;
		if (!__Cal[popId]) {
			__Cal[popId] = {};
		}
		var ins = __Cal[popId];
		if (ins.WND == null) {
			var o = ins.WND = new EWA_UI_DialogClass();
			o.Width = width;
			o.Height = height;
			o.ShadowColor = "";
			if (typeof _EWA_DialogWnd == 'undefined') {
				o.CreateWindow = window;
			} else { // pop window created
				o.CreateWindow = _EWA_DialogWnd._ParentWindow;
				_EWA_DialogWnd.OpendDialogs[_EWA_DialogWnd.OpendDialogs.length] = o;
			}
			o.CreateWindow._EWA_CALENDAR_ITEM = ins.WND;
			o.Create();
		}
		ins.WND.SetHtml(cnt);

		$(ins.WND.GetFrameContent()).find('#butClose').attr('onclick',
				"__Cal[\"" + popId + "\"].WND.Show(false);")
		ins.WND.SetZIndex(10);
		ins.WND.MoveCenter();
		ins.WND.Show(true);

		return ins;
	}
};
/**
 * 
 */
function EWA_UI_HtmlEditorClass() {
	this.DEF_CHART_WIDTH = 200;
	this.DEF_CHART_HEIGHT = 50;
	this.DEF_BG_COLOR = '#08c';
	this.DEF_COLOR = '#fff';
	this.OBJ_REPLACE = null;
	this.pasteClass = new EWA_MiscPasteToolClass();
	this._CreateFonts = function() {
		var ss = [ "<table class='ewa-editor-pop'>" ];
		for (var i = 0; i < EWA_UI_HtmlEditorConfig.fonts.length; i++) {
			var f = EWA_UI_HtmlEditorConfig.fonts[i];
			ss.push("<tr><td>");
			ss
					.push("<a style='font-size:16px;line-height:1.5;font-family:"
							+ f.font
							+ "' href='javascript:"
							+ this.Id
							+ ".executeSetFont(\""
							+ f.font
							+ "\")'>"
							+ f.name
							+ "</a>")

			ss.push("</td></tr>");
		}
		ss.push("</table>");
		return ss.join('\n');
	};
	this._CreateFormats = function() {
		var ss = [ "<table class='ewa-editor-pop'>" ];
		for (var i = 0; i < EWA_UI_HtmlEditorConfig.formats.length; i++) {
			var f = EWA_UI_HtmlEditorConfig.formats[i];
			ss.push("<tr><td>");
			ss.push("<" + f.format + "><a href='javascript:" + this.Id
					+ ".executeSetFormat(\"" + f.format + "\")'>" + f.name
					+ "</a></" + f.format + ">")

			ss.push("</td></tr>");
		}
		ss.push("</table>");
		return ss.join('\n');
	};
	this._CreateFontSizes = function() {
		var ss = [ "<table class='ewa-editor-pop'>" ];
		for (var i = 0; i < EWA_UI_HtmlEditorConfig.sizes.length; i++) {
			var f = EWA_UI_HtmlEditorConfig.sizes[i];
			ss.push("<tr><td>");
			ss.push("<font size=" + f.size + "><a href='javascript:" + this.Id
					+ ".executeFontSize(\"" + f.size + "\")'>" + f.name
					+ "</a></font>")

			ss.push("</td></tr>");
		}
		ss.push("</table>");
		return ss.join('\n');
	};
	this.executeFontSize = function(fontsize) {
		var window_html = $('#' + this.BoxId + ' iframe:eq(0)')[0].contentWindow;
		this.execDocumentCommand("FontSize", false, fontsize);
	};
	this.executeSetFont = function(font) {
		var window_html = $('#' + this.BoxId + ' iframe:eq(0)')[0].contentWindow;
		this.execDocumentCommand("FontName", false, font);
	};
	this.executeSetFormat = function(format) {
		var window_html = $('#' + this.BoxId + ' iframe:eq(0)')[0].contentWindow;
		this.execDocumentCommand("FormatBlock", false, format);
	};
	this.executeForColor = function(color) {
		var window_html = $('#' + this.BoxId + ' iframe:eq(0)')[0].contentWindow;
		this.execDocumentCommand("ForeColor", false, color);
	};
	this.executeBackColor = function(color) {
		var window_html = $('#' + this.BoxId + ' iframe:eq(0)')[0].contentWindow;
		this.execDocumentCommand("BackColor", false, color);
		$(window_html.document.body).css('background', '#fff');
	};
	this.execDocumentCommand = function(command, truefalse, value) {
		var window_html = $('#' + this.BoxId + ' iframe:eq(0)')[0].contentWindow;
		window_html.document.execCommand(command, truefalse, value);
		this.executeAfterEvent(command, value);
	};
	// 上传文件
	this.executeImages = function(source) {
		var window_html = $('#' + this.BoxId + ' iframe:eq(0)')[0].contentWindow;
		var count = 0;
		var inc_ok = 0;
		var c = this;
		for (var i = 0; i < source.files.length; i++) {
			var file = source.files[i];

			if (file.type && file.type.indexOf('image/') == 0) {
				count++;

				var fr = new FileReader();
				fr.onloadend = function(e) {
					var img = new Image();
					img.src = e.target.result;
					img.style.maxWidth = '100%';
					window_html.document.body.appendChild(img);
					inc_ok++;
					if (inc_ok == count) {
						c.pasteClass.target = window_html.document.body;
						c.pasteClass.processAsHtml();
						c.pasteClass.process();
					}
					c.executeAfterEvent("executeImages", img);
				};
				fr.readAsDataURL(file);
			}
		}
	};
	this.executeWord = function(source) {
		var window_html = $('#' + this.BoxId + ' iframe:eq(0)')[0].contentWindow;
		var url = EWA.CP + (EWA.CP.endsWith("/") ? "" : "/")
				+ "EWA_STYLE/cgi-bin/_re_/?method=2Html";
		var c = this;
		for (var i = 0; i < source.files.length; i++) {
			var file = source.files[i];
			var loc0 = file.name.lastIndexOf(".");
			if (loc0 > 0) {
				var ext = file.name.substring(loc0).toLowerCase();
				if (!(ext == '.doc' || ext == '.docx' || ext == '.xls'
						|| ext == '.xlsx' || ext == '.odt')) {
					$Tip('仅支持 doc/docx/xls/xlsx/odt文件');
					return;
				}
			} else {
				$Tip('仅支持 doc/docx/xls/xlsx/odt文件');
				return;
			}
			var fr = new FileReader();
			fr.onloadend = function(e) {
				var data = {};
				data.src = e.target.result;
				url += "&name=" + file.name.toURL();
				var p = $X(c.BoxId).parentNode;
				var cover_id = c.BoxId + '_cover';
				var cover = '<div id="'
						+ cover_id
						+ '" style="width:100%;height:100%" class="ewa-ui-dialog-cover"></div>';
				$(p).css('position', 'relative').append(cover);
				$JP(url, data, function(rst) {
					if (rst.rst) {
						window_html.document.body.innerHTML = rst.cnt;
						$(window_html.document.body).find('img').each(
								function() {
									$(this).attr(
											"src",
											rst['img_root']
													+ $(this).attr("src"));
								});
						$('#' + cover_id).remove();
						$Tip("处理完成");
						c.executeAfterEvent("executeWord", rst);

					} else {
						$Tip(rst.msg);
					}
				});
			};
			fr.readAsDataURL(file);
		}
	}
	this.PopFontSize = function(from) {
		var ss = this._CreateFontSizes();
		EWA_UI_HtmlEditorConfig.pop(from, ss);
	};
	this.PopFont = function(from) {
		var ss = this._CreateFonts();
		EWA_UI_HtmlEditorConfig.pop(from, ss);
	};
	this.PopFormatBlock = function(from) {
		var ss = this._CreateFormats();
		EWA_UI_HtmlEditorConfig.pop(from, ss);
	};
	this.PopForColor = function(from) {
		var ss = this._CreateColorBox('executeForColor');
		EWA_UI_HtmlEditorConfig.pop(from, ss);
	};
	this.PopBackColor = function(from) {
		var ss = this._CreateColorBox('executeBackColor');
		EWA_UI_HtmlEditorConfig.pop(from, ss);
	};
	this.PopImg = function() {

	};
	this.FullScreen = function() {
		var o = $('#' + this.BoxId);
		var isfull = o.attr('isfull');
		if (isfull) {
			var old_css = o.attr('old_css');
			o.attr('style', old_css).attr('isfull', '');

		} else {
			var index;
			if (window._EWA_UI_DIALOG_COVERINDEX) {
				_EWA_UI_DIALOG_COVERINDEX++;
			} else {
				_EWA_UI_DIALOG_COVERINDEX = 999;
			}
			index = _EWA_UI_DIALOG_COVERINDEX;
			var old_css = o.attr('style');
			o.attr('old_css', old_css).attr('isfull', '1');
			o.css({
				position : 'fixed',
				left : 0,
				top : 0,
				right : 0,
				bottom : 0,
				width : '100%',
				height : '100%',
				"z-index" : index
			});
		}

	};
	this._CreateColorBox = function(fn) {
		var ss = [ "<table class='ewa-editor-pop'><tr>" ];
		for (var i = 0; i < EWA_UI_HtmlEditorConfig.colors.length; i++) {
			if (i > 0 && i % 10 == 0) {
				ss.push("</tr><tr>")
			}
			var c = EWA_UI_HtmlEditorConfig.colors[i];
			ss.push("<td><a href='javascript:" + this.Id + "." + fn + "(\"" + c
					+ "\")' class='ewa-edit-pop-color' style='background:" + c
					+ "'>&nbsp;</a></td>");
		}
		ss.push("</table>");
		return ss.join('\n');
	};
	this.Word2Html = function() {
		// nothing to do;
	}
	this.GetHtml = function() {
		var window_html = $('#' + this.BoxId + ' iframe:eq(0)')[0].contentWindow;
		var window_code = $('#' + this.BoxId + ' iframe:eq(1)')[0].contentWindow;

		if ($('#' + this.BoxId + ' iframe:eq(0)').css('display') == 'none') {
			return window_html.document.body.innerHTML = window_code.getText();
		}
		return window_html.document.body.innerHTML;
	};
	this.GetText = function() {
		var window_html = $('#' + this.BoxId + ' iframe:eq(0)')[0].contentWindow;
		var window_code = $('#' + this.BoxId + ' iframe:eq(1)')[0].contentWindow;

		if ($('#' + this.BoxId + ' iframe:eq(0)').css('display') == 'none') {
			return window_html.document.body.innerHTML = window_code.getText();
		}
		return window_html.document.body.innerText;
	};
	this.Create = function(objReplace) {
		this.OBJ_REPLACE = objReplace;

		this.Id = ("EWA_Html_" + Math.random()).replace('.', '_');
		this.BoxId = this.Id + 'box';
		// console.log('create edit ' + this.Id);
		// console.log('create edit (BOX)' + this.BoxId);

		window[this.Id] = this;
		EWA.F.FOS[this.Id] = this;

		var html = objReplace.value || objReplace.innerHTML;
		var height = $(objReplace).height();
		var width = $(objReplace).width();

		var css = {
			border : '1px solid #ccc',
			position : 'relative',
			width : width,
			height : height,
			overflow : 'hidden'
		};
		if (objReplace.getAttribute('EWA_DHTML') == '1') {
			css.width = '100%';
		}
		var obj = document.createElement('table');
		obj.id = this.BoxId;
		$(obj).css(css).addClass('ewa-editor').attr('cellpadding', 0).attr(
				'cellspacing', 0);
		var buts = obj.insertRow(-1).insertCell(-1);
		buts.className = 'ewa-editor-buts';

		var cnt = obj.insertRow(-1).insertCell(-1);
		$(cnt).css('position', 'static').css('opacity', 1).addClass(
				'ewa-ui-dialog-cover');
		var buts_html = [];
		var conf = EWA_UI_HtmlEditorConfig.defaultConf;
		for ( var n in conf) {
			if (n > 0)
				buts_html.push("<span class='ewa-editor-but-spt '>|</span>")
			for ( var m in conf[n]) {
				var o = EWA_UI_HtmlEditorConfig.buts[conf[n][m]];
				var s = this._CreateButton(o);
				buts_html.push(s);
			}
		}
		buts.innerHTML = buts_html.join('');

		objReplace.parentNode.insertBefore(obj, objReplace);
		objReplace.style.display = 'none';

		this._CreateIframe(cnt, html, objReplace);

		var file = "<input onchange='"
				+ this.Id
				+ ".executeImages(this)' multiple accept='image/jpeg,image/png,image/bmp' type=file "
				+ " style='width:30px;height:30px;position:absolute;top:4px;left:0px;opacity:0.0'>";
		$('#' + this.BoxId).find('a[id=fn_Img]').append(file);

		var fileWord = "<input onchange='"
				+ this.Id
				+ ".executeWord(this)' accept='doc,docx,odt' type=file "
				+ " style='width:30px;height:30px;position:absolute;top:4px;left:0px;opacity:0.0'>";
		$('#' + this.BoxId).find('a[id=fn_Word2Html]').append(fileWord);

		this.executeAfterEvent('init', 'ok');

		if (window.__Cal) { // 清除已经存在的Pop窗体，避免ajax多次加载出现找不到对象的问题 (this.Id会不一致)
			for ( var n in __Cal) {
				if (n.indexOf('EDITOR_Pop_') == 0) {
					delete window.__Cal[n];
				}
			}
		}
	};
	this._CreateIframe = function(cnt, html, objReplace) {
		cnt.innerHTML = "<iframe id='"
				+ this.Id
				+ "cntent' frameborder=0 width=100% height=100%></iframe>"
				+ "<iframe id='"
				+ this.Id
				+ "code' src0='"
				+ (EWA.RV_STATIC_PATH || "/EmpScriptV2")
				+ "/EWA_STYLE/editor/CodeMirror/index.html' style='display: none; width: 100%; height: 100%' frameborder=0></iframe>";

		var c = this;
		// 由于iframe创建需要时间，所以等待400ms
		setTimeout(function() {
			var iframe_obj = $('#' + c.BoxId + ' iframe:eq(0)');

			var window_html = iframe_obj[0].contentWindow;
			var doc = window_html.document;
			// firefox 设置最小高度
			doc.body.style.minHeight = iframe_obj.height() + 'px';

			// 设置新的宽度
			if (iframe_obj.width() < 840) {
				doc.body.style.boxSizing = 'border-box';
				doc.body.style.width = '100%';
			}
			var style = doc.createElement('style');
			style.textContent = EWA_UI_HtmlEditorConfig.css;
			doc.getElementsByTagName('head')[0].appendChild(style);

			var u = EWA.CP + (EWA.CP.endsWith('/') ? '' : '/')
					+ 'EWA_STYLE/cgi-bin/_re_/index.jsp?method=HtmlImages';
			// 图片缩放
			if (EWA_UI_HtmlEditorConfig.OPT_ImageResizes) {
				u += "&ImageReiszes="
						+ EWA_UI_HtmlEditorConfig.OPT_ImageResizes.toURL();
			}
			c.pasteClass.bind(window_html.document.body, u, function(rst) {
				c.executeAfterEvent("HtmlImages", rst);
			});

			// console.log(EWA_MiscPasteTool.target)

			doc.contentEditable = true;
			doc.designMode = "on";
			doc.body.innerHTML = html;

			$(doc.body).css(EWA_UI_HtmlEditorConfig.css);

			// 图片点击显示对话框
			if (EWA_UI_HtmlEditorConfig.OPT_PopImgProperties) {
				doc.onmousedown = function(evt) {
					var e = evt || event;
					var t = e.target || e.srcElement;
					if (t.tagName == 'IMG') {
						c.PopImgProperties(t)
					}
				};
			}
			$(doc.body).bind("cut", function() {
				setTimeout(function() {
					c.executeAfterEvent('cut');
				}, 10);
			});
			$(doc.body).bind("keyup", function() {
				c.executeAfterEvent('keyup');
			});
			$(doc.body).bind("paste", function() {
				setTimeout(function() {
					c.executeAfterEvent('paste');
				}, 10);
			});
			$(doc.body).bind("undo", function() {
				c.executeAfterEvent('undo');
			});
			$(doc.body).bind("redo", function() {
				c.executeAfterEvent('redo');
			});
		}, 411);
	};
	this.PopImgProperties = function(img) {
		var ss = [ "<table style='background:rgba(0,0,0,0.77);color:#f1f1f1;' border=0 width=300 height=140>" ];
		ss.push("</tr><td colspan=2 align=center>设定图片属性</td></tr>");

		ss.push("<tr><td>尺寸：</td><td><input name='width' value='" + img.width
				+ "' size=4 maxlength=4> x ");
		ss.push("<input name='height' value='" + img.height
				+ "' size=4 maxlength=4>");
		ss.push("</td></tr>");

		ss
				.push("<tr><td>浮动：</td><td><select name='float'><option value=''></option>");
		ss.push("<option value='left'>左</option>");
		ss.push("<option value='right'>右</option>");
		ss.push("</select></td></tr>");

		ss
				.push("<tr><td>边界：</td><td><input name='margin' value='2' size=4 maxlength=2> 像素 ");
		ss.push("</td></tr>");

		ss.push("<tr><td>边界：</td><td><input type='checkbox' name='bt'> 设为标题图 ");
		ss.push("</td></tr>");

		ss
				.push("</tr><td colspan=2 align=center><input type=button value='确定' id='butOk'>&nbsp;");
		ss
				.push("<input type=button onclick='$(this).parentsUntil(\"div[ewa_name=DIV_FRAME]\").last().parent().hide()' value='关闭'></td></tr>")
		ss.push("</table>");
		var ins = EWA_UI_HtmlEditorConfig.pop1(img.getAttribute('_tmp_id'), ss
				.join(''), 300, 150);

		var cnt = ins.WND.GetFrameContent();
		var c = this;
		$(cnt).find('#butOk').bind('click', function() {
			$(this.parentNode).find('#butClose').click();
			var w = $(cnt).find('[name=width]').val();
			if (w != '') {
				img.width = w;
			} else {
				$(img).attr('width', null);
			}
			var h = $(cnt).find('[name=height]').val();
			if (h != '') {
				img.height = h;
			} else {
				$(img).attr('height', null);
			}
			var f = $(cnt).find('[name=float]').val();
			$(img).css("float", f);
			$(img).css("margin", $(cnt).find('[name=margin]').val() + 'px');

			if ($(cnt).find('[name=bt]')[0].checked) {
				var ss = img.src.replace(location.origin, '');
				ss = ss.replace('//', '/');
				$('#NWS_HEAD_PIC').val(ss);
				if (c.userSetHeaderPic) {
					c.userSetHeaderPic(ss);
				}
			}
		});
	};
	this._CreateButton = function(o) {
		try {
			var s = "<a href='javascript:void(0)' class='btn " + o["class"]
					+ "' onclick='" + this.Id + ".execute(this)' id='" + o.id
					+ "' cmd='" + o.cmd + "' title='" + o.title + "'></a>";
			return s;
		} catch (e) {
			console.log(o)
			return "";
		}

	};
	this.showCode = function(o1) {

		var window_html = $('#' + this.BoxId + ' iframe:eq(0)')[0].contentWindow;
		var window_code = $('#' + this.BoxId + ' iframe:eq(1)')[0].contentWindow;

		var html = window_code.style_html(window_html.document.body.innerHTML,
				4, ' ', 80);

		o1.setAttribute('tag', 'txt');
		if (window_code.editor) {
			window_code.editor.setValue(html);
		} else {
			//__VAL__ = html;
			//__TYPE__ = 'html';
			// 调用初始化
			window_code.initEditor(html, 'html');
		}
	};
	this.execute = function(o1) {
		var window_html = $('#' + this.BoxId + ' iframe:eq(0)')[0].contentWindow;
		var window_code = $('#' + this.BoxId + ' iframe:eq(1)')[0].contentWindow;

		var doc = window_html.document;
		var cmd = o1.getAttribute('cmd');

		if (o1.id.indexOf('st_') == 0) {
			if (cmd == 'CreateLink') {
				doc.execCommand(cmd, true, null);
			} else {
				doc.execCommand(cmd, false, null);
			}

		} else if (o1.id.indexOf('fn_') == 0) {
			this[cmd](o1);
		} else if (cmd == 'eraser') {
			this.executeEraser();
		} else if (cmd == 'CODE_TXT') {
			var tag = o1.getAttribute('tag');
			var frameEditor = $('#' + this.BoxId + ' iframe:eq(0)');
			var frameCode = $('#' + this.BoxId + ' iframe:eq(1)');

			if (!tag) {
				frameEditor.hide();
				frameCode.show();

				if (frameCode.attr('src0')) { // 初始化编辑器不加载url
					var u = frameCode.attr('src0');
					frameCode.attr('src', u);
					frameCode.removeAttr('src0');

					var c = this;
					this._WAIT_CODE_LOAD_COMPLETE = setInterval(function() {
						if (window_code.document.readyState == 'complete') {
							window.clearInterval(c._WAIT_CODE_LOAD_COMPLETE);
							c._WAIT_CODE_LOAD_COMPLETE = null;
							c.showCode(o1);
						}
					}, 100);

				} else {
					this.showCode(o1);
				}
			} else {
				frameEditor.show();
				frameCode.hide();
				o1.setAttribute('tag', '');
				window_html.document.body.innerHTML = window_code.getText();
			}
		} else if (o1.id == 'IMG') {
			insertImg(window);
		} else {
			if (o1.id == 'CreateLink') {
				window_html.document.execCommand(o1.id, true, null);
			} else {
				window_html.document.execCommand(o1.id, false, null);
			}
			window_html.document.body.focus();
		}
		this.executeAfterEvent(cmd);
	};
	this.executeEraser = function() {
		var bd = $('#' + this.BoxId + ' iframe:eq(0)')[0].contentWindow.document.body;
		$(bd).find('p,h1,h2,h3,h4,h5').each(function() {
			if ($(this).find('img').length == 0) {
				this.innerText = this.innerText;
				if (this.innerText.trimEx() == '') {
					$(this).remove();
				}
			}
		});
		$(bd).find('div,font,span,a').each(function() {
			if ($(this).find('img').length == 0) {
				if (this.innerText.trimEx() == '') {
					$(this).remove();
				}
			}

		});

		$(bd).find('script').remove();
		$(bd).find('style').remove();
		$(bd).find('link').remove();
		$(bd).find('meta').remove();
		$(bd).find('title').remove();
		$(bd).find('colgroup').remove();

		/*var attrs={
			id:null,
			name:null,
			style:null,
			class:null,
			size:null,
			href:null,
			onload:null,
			onerror:null,
			onclick:null,
			onmousedown:null,
			onmousemove:null,
			onmouseout:null,
			onmouseover:null,
			ontouchstart:null,
			ontouch:null,
			contenteditable:null,
			color:null,
		}
		$(bd).find('*').attr(attrs);*/
		
		$(bd).find("*").each(function() {
			let removeAttrs={};
			for(let i=0;i<this.attributes.length;i++){
				let item = this.attributes[i].name;
				if(item != "src"){
					removeAttrs[item] = null;
				}
			}
			$(this).attr(removeAttrs);
		});

		// 重新写值
		var exp = /<!--[\w\W\r\n]*?-->/gim; // 注释的正则表达式
		this.OBJ_REPLACE.value = bd.innerHTML = bd.innerHTML.replace(exp, '');
	}
	this.executeAfterEvent = function(cmd, value) {
		var bd = $('#' + this.BoxId + ' iframe:eq(0)')[0].contentWindow.document.body;
		if (cmd == 'init' && value == 'ok') {
			// 初始化不改变值
		} else {
			this.OBJ_REPLACE.value = bd.innerHTML;
		}
		if (this.userAfterEvent) {
			this.userAfterEvent(cmd, value, bd);
		}
	};
	// define your function
	this.userAfterEvent = function(cmd, value, targetElement) {
		// console.log(cmd,value,targetElement);
	};
};
/**
 * 粘贴获取图片资源保存到本地 <br>
 * 提交地址 例如 ：xxx/EWA_STYLE/cgi-bin/_re_/index.jsp?method=HtmlImages<br>
 * method=HtmlImages 是标记<br>
 * 
 * 处理当编辑器粘贴网路图片(背景)，提交到后台获取图片保存到本地<br>
 * 当粘贴诸如 qq捕捉的图片时，提交base64内容到后台并转换成本地文件
 * 
 */
function EWA_MiscPasteToolClass() {
	this.target = document.body;
	this.handleUrl = null;
	this.images = [];
	this.paste = function(d) {
		d = d.originalEvent;
		if (!(d && d.clipboardData && d.clipboardData.items && d.clipboardData.items.length > 0)) {
			return;
		}
		for (var b = 0; b < d.clipboardData.items.length; b++) {
			var c = d.clipboardData.items[b];
			// console.log(c.type);
			if (c.type == "image/png") {
				// 粘贴图片处理
				this.processAsPaste(c);
			} else if (c.type == "text/html") {
				var me = this;
				if (d.clipboardData.getData("text/html")) {
					// 根据粘贴后的内容进行处理,延时300ms
					setTimeout(function() {
						me.processAsHtml();
						me.process();
					}, 311);
				}
				break;
			}
		}

	};
	this.processAsPaste = function(c) {
		var a = new FileReader();
		var me = this;
		var prevImgs = {};
		$(me.target).find('img').each(function() {
			prevImgs[this] = true;
		});
		a.onloadend = function() {
			var img = null;
			// 检查是否图形已经插入
			$(me.target).find('img').each(function() {
				if (img == null && !prevImgs[this]) {
					img = this;
				}
			});
			if(!img){
				// 执行插入图片
				me.target.ownerDocument.execCommand("InsertImage", false,
					this.result);
			}
			$(me.target).find('img').each(function() {
				if (img == null && !prevImgs[this]) {
					img = this;
				}
			});
			if (img) {
				var tmpid = me.tmpId(img);
				me.images.push({
					id : tmpid,
					src : img.src,
					mode : "base64"
				});
				me.process();
			} else {
				console.log('not img');
			}
		};
		a.readAsDataURL(c.getAsFile());
	};
	this.processAsHtml = function() {
		var obj = this.target;
		var me = this;
		$(obj)
				.find("img")
				.each(
						function() {
							if (!this.getAttribute("_tmp_id")) {
								var tmpid = me.tmpId(this);
								if (this.src
										&& this.src.indexOf(location.origin) != 0) {
									me.images
											.push({
												id : tmpid,
												src : this.src,
												mode : this.src
														.indexOf('data:image') == 0 ? "base64"
														: "normal"
											});
								}
							}
						});
		// 从body开始 清除备注
		this.processRemoveComments();

		$(obj).find('*').each(function() {
			var bg = $(this).css('background-image');
			if (bg) {
				bg = bg.replace('url(', '').replace(')', '');
				if (bg && bg.startsWith('http://')) {
					me.images.push({
						id : EWA_MiscPasteTool.tmpId(this),
						src : bg,
						mode : "background"
					});
				}
			}
			$(this).attr({
				onclick : null,
				onload : null,

				onkeydown : null,
				onkeyup : null,
				onerror : null,

				onmousedown : null,
				onmouseout : null,
				onmouseover : null,
				onkeypress : null,

				onblur : null,
				onscroll : null
			});
		});
	};
	this.processRemoveComments = function(parent) {
		if (parent == null) {
			parent = this.target;
		}
		// console.log(parent.innerHTML)
		var comments = [];
		for ( var n in parent.childNodes) {
			var o = parent.childNodes[n];
			if (o.nodeType == 8 || o.tagName == "SCRIPT" || o.tagName == "LINK"
					|| o.tagName == "STYLE" || o.tagName == "IFRAME") {
				comments.push(o);
			} else {
				if (o.tagName == "SPAN") {
					var v = GetInnerText(o);
					if (!v) {
						comments.push(o);
					}
				}
			}

		}

		for ( var n in comments) {
			parent.removeChild(comments[n]);
		}
		for ( var n in parent.childNodes) {
			var o = parent.childNodes[n];
			if (o.nodeType == 1 && o.childNodes) {
				this.processRemoveComments(o);
			}
		}
	};
	this.tmpId = function(obj) {
		if (!obj.getAttribute("_tmp_id")) {
			var tmpid = ("r_" + Math.random()).replace(".", "");
			obj.setAttribute("_tmp_id", tmpid);
			$(obj).css('max-width', '100%');
			return tmpid;
		} else {
			return obj.getAttribute("_tmp_id");
		}
	};
	this.process = function() {
		if (this.images.length == 0) {
			return;
		}
		// 提交到后台进行处理
		var data = {
			d : JSON.stringify(this.images)
		};
		this.images = [];
		var me = this;
		$JP(this.handleUrl, data, function(rst) {
			if (rst.rst) {
				for (var i = 0; i < rst.rsts.length; i++) {
					var d = rst.rsts[i];
					var id = d.id;
					var local = d.local;
					var mode = d.mode;
					if (mode == 'background') {
						$(me.target).find('[_tmp_id="' + id + '"]').css(
								'background-image', "url(" + local + ")");
					} else {
						$(me.target).find('img[_tmp_id="' + id + '"]').attr(
								'src', local);
					}
				}

			} else {
				$Tip('处理错误');
			}

			if (me.handleUrlAfterEvent) {
				me.handleUrlAfterEvent(rst);
			}
		});

	};
	this.bind = function(obj, handleUrl, handleUrlAfterEvent) {
		if (!handleUrl) {
			alert('请定义提交地址');
			return;
		}
		this.handleUrl = handleUrl;
		this.images = [];
		this.target = obj;
		var me = this;
		$(document).ready(function() {
			$(obj).bind("paste", function(e) {
				me.paste(e);
			});
		});

		if (handleUrlAfterEvent) {
			this.handleUrlAfterEvent = handleUrlAfterEvent;
		} else {
			this.handleUrlAfterEvent = null;
		}
	};
};

/**
 * 粘贴获取图片资源保存到本地 <br>
 * 提交地址 例如 ：xxx/EWA_STYLE/cgi-bin/_re_/index.jsp?method=HtmlImages<br>
 * method=HtmlImages 是标记<br>
 * 
 * 处理当编辑器粘贴网路图片(背景)，提交到后台获取图片保存到本地<br>
 * 当粘贴诸如 qq捕捉的图片时，提交base64内容到后台并转换成本地文件
 * 
 */

/*
var EWA_MiscPasteTool0000 = {
	target : document.body,
	handleUrl : null,
	images : [],
	paste : function(d) {
		d = d.originalEvent;
		if (d && d.clipboardData && d.clipboardData.items
				&& d.clipboardData.items.length > 0) {
			for (var b = 0; b < d.clipboardData.items.length; b++) {
				var c = d.clipboardData.items[b];
				// console.log(c.type);
				if (c.type == "image/png") {
					// 粘贴图片处理
					EWA_MiscPasteTool.processAsPaste(c);
				} else if (c.type == "text/html") {
					if (d.clipboardData.getData("text/html")) {
						// 根据粘贴后的内容进行处理,延时300ms
						setTimeout(function() {
							EWA_MiscPasteTool.processAsHtml();
							EWA_MiscPasteTool.process();
						}, 311);
					}
					break;
				}
			}
		}
	},
	processAsPaste : function(c) {
		var a = new FileReader();
		a.onloadend = function() {
			var img = null;
			// img.src = this.result;
			// EWA_MiscPasteTool.target.appendChild(img);
			var prevImgs = {};
			$(EWA_MiscPasteTool.target).find('img').each(function() {
				prevImgs[this.src] = true;
			});

			EWA_MiscPasteTool.target.ownerDocument.execCommand("InsertImage",
					false, this.result);

			$(EWA_MiscPasteTool.target).find('img').each(function() {
				if (img == null && !prevImgs[this.src]) {
					img = this;
				}
			});
			if (img) {
				var tmpid = EWA_MiscPasteTool.tmpId(img);
				EWA_MiscPasteTool.images.push({
					id : tmpid,
					src : img.src,
					mode : "base64"
				});
				EWA_MiscPasteTool.process();
			} else {
				console.log('not img');
			}
		};
		a.readAsDataURL(c.getAsFile());
	},
	processAsHtml : function() {
		var obj = this.target;

		$(obj)
				.find("img")
				.each(
						function() {
							if (!this.getAttribute("_tmp_id")) {
								var tmpid = EWA_MiscPasteTool.tmpId(this);
								if (this.src
										&& this.src.indexOf(location.origin) != 0) {
									EWA_MiscPasteTool.images
											.push({
												id : tmpid,
												src : this.src,
												mode : this.src
														.indexOf('data:image') == 0 ? "base64"
														: "normal"
											});
								}
							}
						});
		// 从body开始 清除备注
		this.processRemoveComments();

		$(obj).find('*').each(function() {
			var bg = $(this).css('background-image');
			if (bg) {
				bg = bg.replace('url(', '').replace(')', '');
				if (bg && bg.startsWith('http://')) {
					EWA_MiscPasteTool.images.push({
						id : EWA_MiscPasteTool.tmpId(this),
						src : bg,
						mode : "background"
					});
				}
			}
			$(this).attr({
				onclick : null,
				onload : null,

				onkeydown : null,
				onkeyup : null,
				onerror : null,

				onmousedown : null,
				onmouseout : null,
				onmouseover : null,
				onkeypress : null,

				onblur : null,
				onscroll : null
			});
		});
	},
	processRemoveComments : function(parent) {
		if (parent == null) {
			parent = this.target;
		}
		// console.log(parent.innerHTML)
		var comments = [];
		for ( var n in parent.childNodes) {
			var o = parent.childNodes[n];
			if (o.nodeType == 8 || o.tagName == "SCRIPT" || o.tagName == "LINK"
					|| o.tagName == "STYLE" || o.tagName == "IFRAME") {
				comments.push(o);
			} else {
				if (o.tagName == "SPAN") {
					var v = GetInnerText(o);
					if (!v) {
						comments.push(o);
					}
				}
			}

		}

		for ( var n in comments) {
			parent.removeChild(comments[n]);
		}
		for ( var n in parent.childNodes) {
			var o = parent.childNodes[n];
			if (o.nodeType == 1 && o.childNodes) {
				this.processRemoveComments(o);
			}
		}
	},
	tmpId : function(obj) {
		if (!obj.getAttribute("_tmp_id")) {
			var tmpid = ("r_" + Math.random()).replace(".", "");
			obj.setAttribute("_tmp_id", tmpid);
			$(obj).css('max-width', '100%');
			return tmpid;
		} else {
			return obj.getAttribute("_tmp_id");
		}
	},
	process : function() {
		if (EWA_MiscPasteTool.images.length == 0) {
			return;
		}
		// 提交到后台进行处理
		var data = {
			d : JSON.stringify(EWA_MiscPasteTool.images)
		};
		EWA_MiscPasteTool.images = [];
		$JP(this.handleUrl, data,
				function(rst) {
					if (rst.rst) {
						for (var i = 0; i < rst.rsts.length; i++) {
							var d = rst.rsts[i];
							var id = d.id;
							var local = d.local;
							var mode = d.mode;
							if (mode == 'background') {
								$(EWA_MiscPasteTool.target).find(
										'[_tmp_id="' + id + '"]').css(
										'background-image',
										"url(" + local + ")");
							} else {
								$(EWA_MiscPasteTool.target).find(
										'img[_tmp_id="' + id + '"]').attr(
										'src', local);
							}
						}

					} else {
						$Tip('处理错误');
					}

					if (EWA_MiscPasteTool.handleUrlAfterEvent) {
						EWA_MiscPasteTool.handleUrlAfterEvent(rst);
					}
				});

	},
	bind : function(obj, handleUrl, handleUrlAfterEvent) {
		if (!handleUrl) {
			alert('请定义提交地址');
			return;
		}
		EWA_MiscPasteTool.handleUrl = handleUrl;
		EWA_MiscPasteTool.images = [];
		EWA_MiscPasteTool.target = obj;
		$(document).ready(function() {
			$(obj).bind("paste", EWA_MiscPasteTool.paste);
		});

		if (handleUrlAfterEvent) {
			this.handleUrlAfterEvent = handleUrlAfterEvent;
		} else {
			this.handleUrlAfterEvent = null;
		}
	}
};
*//**
 * cfg:{ country: "COUNTRY", province: "STATEORPROVINCE", city: "CITY1", zip:
 * "POSTALCODE", lat: "", lng: "" },
 */
function EWA_UI_MapClass(cfg, from_id) {
	this.cfg = cfg;
	this._FromId = from_id; // 来源输入框的id
	this.showFull = function() {
		var map_id = 'div$' + this._FromId + '$MAP1';
		var map_box_id = map_id + 'd';
		if (!$X(map_id)) {
			var s = "<div class='ewa-map-full' id='" + map_id + "'><div class='ewa-map-full-cnt' id='" + map_box_id + "'></div>"
				+ "<p title='退出全屏' onclick='$(this.parentNode).hide();' class='fa fa-power-off' id='" + map_id + "1p'></p></div>";
			$('body').append(s);
		}
		var o = $($X(map_id));
		o.show();
		this.gps1 = new EWA_GMapClass();
		this.gps1.init(14);
		var lngLat = this.getLngLat();
		var home_lng = lngLat[0];
		var home_lat = lngLat[1];

		if (home_lng && home_lat) {
			this.gps1.showMap(map_box_id, home_lng, home_lat, $X(this._FromId).value);
		} else {
			this.search_addr($X(this._FromId), this.gps1, map_box_id);
		}
	};
	this.getLngLat = function() {
		var home_lng;
		if (this.cfg.lng) {
			home_lng = $X(this.cfg.lng).value;
		} else {
			home_lng = $($X(this._FromId + '_LNG')).val();
			if (!home_lng) {
				home_lang = $($X(this._FromId.split('_')[0] + '_LNG')).val();
			}
		}
		var home_lat;
		if (this.cfg.lat) {
			home_lat = $X(this.cfg.lat).value;
		} else {
			home_lat = $($X(this._FromId + '_LAT')).val();
			if (!home_lat) {
				home_lat = $($X(this._FromId.split('_')[0] + '_LAT')).val();
			}
		}
		return [ home_lng, home_lat ];
	};
	this.init = function() {
		var this_class_name = this._FromId + '$MAPClass';
		var this_id = 'div$' + this._FromId + '$MAP';
		var c = this;
		addEvent($X(this._FromId), 'blur', function() {
			c.search_addr(this, c.gps, this_id);
		});
		var tr = $X(this._FromId).parentNode.parentNode;
		var newTr = tr.parentNode.insertRow(tr.rowIndex + 1);
		var newTd = newTr.insertCell(-1);
		newTd.innerHTML = "<div class='ewa-map-small'><div class='ewa-map-small-cnt' id='" + this_id + "'></div>"
			+ "<div class='ewa-map-full-but' title='全屏查看' onclick='" + this_class_name
			+ ".showFull()'><b class='fa fa-square-o'></b></div>" + "</div>";
		newTd.colSpan = tr.cells.length;
		newTd.className = 'ewa-map-small-td';

		this.gps = new EWA_GMapClass();
		this.gps.init(10);

		var lngLat = this.getLngLat();
		var home_lng = lngLat[0];
		var home_lat = lngLat[1];

		if (home_lng && home_lat) {
			this.gps.showMap(this_id, home_lng, home_lat, $X(this._FromId).value);
		} else {
			this.search_addr($X(this._FromId), this.gps, this_id);
		}
	};
	this.setSearchResult = function(rst1, gps, pid) {
		var c = this;
		if (c.cfg.lng) {
			$X(c.cfg.lng).value = rst1.Q_LNG;
		} else {
			if ($X(c._FromId + '_LNG')) {
				$X(c._FromId + '_LNG').value = rst1.Q_LNG; // 经度
			}
			if ($X(c._FromId.split('_')[0] + '_LNG')) {
				$X(c._FromId.split('_')[0] + '_LNG').value = rst1.Q_LNG; // 经度
			}
		}
		if (c.cfg.lat) {
			$X(c.cfg.lat).value = rst1.Q_LAT;
		} else {
			if ($X(c._FromId + '_LAT')) {
				$X(c._FromId + '_LAT').value = rst1.Q_LAT; // 纬度
			}
			if ($X(c._FromId.split('_')[0] + '_LAT')) {
				$X(c._FromId.split('_')[0] + '_LAT').value = rst1.Q_LAT; // 纬度
			}
		}
		if (c.cfg.zip) {
			$X(c.cfg.zip).value = rst1.Q_ZIP || "";
		} else {
			if ($X(c._FromId + '_ZIP')) {
				$X(c._FromId + '_ZIP').value = rst1.Q_ZIP; // zip
			}
			if ($X(c._FromId.split('_')[0] + '_ZIP')) {
				$X(c._FromId.split('_')[0] + '_ZIP').value = rst1.Q_ZIP; // zip
			}
		}
		if (c.cfg.province) {
			$X(c.cfg.province).value = rst1.Q_STATE || "";
		} else {
			if ($X(c._FromId + '_STATE')) {
				$X(c._FromId + '_STATE').value = rst1.Q_STATE; // 州
			}
			if ($X(c._FromId.split('_')[0] + '_STATE')) {
				$X(c._FromId.split('_')[0] + '_STATE').value = rst1.Q_STATE; // 州
			}
		}
		if (c.cfg.city) {
			$X(c.cfg.city).value = rst1.Q_CITY || "";
		}
		if (c.cfg.country) {
			$X(c.cfg.country).value = rst1.Q_COUNTRY || "";
		}

		var position = gps.showMap(pid, rst1.Q_LNG, rst1.Q_LAT, rst1.Q_SEARCH);
		gps.map.setCenter(position);
		//查询完地址附加的方法，外部定义
		if(this.searchResultAfter){
			this.searchResultAfter(rst1);
		}
		
	};
	this.search_addr = function(obj, gps, pid) {
		var addr = obj.value;
		if (addr == '') {
			return;
		}
		var c = this;

		var ss = [ addr ];
		if (c.cfg.city) {
			ss.push($X(c.cfg.city).value);
		}
		if (c.cfg.province) {
			ss.push($X(c.cfg.province).value);
		}
		if (c.cfg.country) {
			ss.push($X(c.cfg.country).value);
		}
		var addr1 = ss.join(', ');
		// console.log(addr1);
		gps.getGpsFromAddress(addr1, function(addr, result, rst1) {
			// console.log(rst1);
			c.setSearchResult(rst1, gps, pid);
		});
	};
}/**
 * 用于App显示图片，支持缩放
 */
function EWA_UI_PicViewClass() {
	this.id = ('EWAUIPicView' + Math.random()).replace('.', 'Gdx');
	this.t_start = -1;
	this.dist_base = 0;
	this.is_move = false;
	this.table=null;
	this.prevIdx = -1;
	this.setImg = function(img) {
		$(img).attr('mw', img.width).attr('mh', img.height).css("margin-left", 0).css('margin-top', '0');
		// css('width', img.width).css('height', img.height)
		$(img).parent().css("background-image", "none");
	};
	this.addPic = function(pic_path) {
		var idx = this.table.rows[0].cells.length;
		var td = this.table.rows[0].insertCell(idx);
		td.align = 'center';
		var id = this.id + "_" + idx;
		var s = "<img style='max-width:100%;max-height:100%' onload='" + this.id + ".setImg(this)' id='" + id + "' ";
		s += " src1='" + pic_path + "'>";
		var css = {
			'background-image' : "url('/static/images/loading2.gif')",
			"background-position" : "center center",
			"background-repeat" : "no-repeat"
		}
		$(td).hide().css(css);
		td.innerHTML = s;
		$(this.table1).find('td').append('<b>&bull;</b>');
		if (idx == 0) {
			this.changePhoto(0);
		} else {
			$(this.table1).show();
		}
		this.total = idx + 1;
	};
	this.changePhoto = function(idx) {
		if (this.prevIdx == idx) {
			return;
		}
		if (this.prevIdx >= 0) {
			var img = $('#' + this.id + '_' + this.prevIdx);
			$(img).parent().hide();
			$(this.table1).find('b:eq(' + this.prevIdx + ')').css('color', '#ccc');
		}
		this.prevIdx = idx;
		var img = $('#' + this.id + '_' + idx);
		if (img.attr('src1')) {
			img.attr('src', img.attr('src1'));
			img.attr('scr1', "");
			img[0].setAttribute('src1', '');
		} else {
			try {
				if (img.attr('mw')) {
					var mw = img.attr('mw') * 1;
					var mh = img.attr('mh') * 1;
					img.css('width', mw).css('height'.mh);
				}
			} catch (e) {
				console.log(e);
			}
			img.css('margin-left', 0).css('margin-top', 0).attr('r', null).attr('rold', null).css('transform', 'scale(1)');
		}
		img.parent().show();
		$(this.table1).find('b:eq(' + idx + ')').css('color', 'yellow');
	};
	this.close = function() {
		$(this.table).parent().remove();
		delete window[this.id];
	};
	this.create = function() {
		window[this.id] = this;

		var main = document.createElement('div');

		var page = document.createElement('table');
		page.insertRow(-1);

		var page1 = document.createElement('table');
		page1.insertRow(-1).insertCell(-1).align = 'center'; // td

		var close = document.createElement('div');
		close.innerHTML = "<b class='fa fa-close'></b>";
		var css = {
			'position' : 'fixed',
			'top' : 0,
			left : 0,
			width : '100%',
			height : '100%',
			'z-index' : 99999999,
			background : 'rgba(0, 0, 0, 0.9)'
		};
		$(main).css(css);
		var p_css = {
			position : 'absolute',
			left : 0,
			top : 0,
			height : '100%',
			width : '100%',
			'table-layout' : 'fixed'
		};
		$(page).css(p_css);

		var p_css1 = {
			position : 'absolute',
			left : 0,
			height : 30,
			width : '100%',
			overflow : 'hidden',
			bottom : '5px',
			'z-index' : 3,
			color : '#ccc',
			'font-size' : '30px',
			display : "none"
		};
		$(page1).css(p_css1);

		var close_css = {
			position : 'absolute',
			right : 20,
			top : 30,
			height : 40,
			width : 40,
			'line-height' : '40px',
			overflow : 'hidden',
			'z-index' : 4,
			color : 'darkred',
			'font-size' : '30px',
			'text-align' : 'center',
			display : 'block'
		}
		$(close).css(close_css).attr('onclick', this.id + ".close()");
		this.table = page;
		this.table1 = page1;

		$(main).append(page);
		$(main).append(page1);
		$(main).append(close);
		$('body').append(main);

		var c = this;
		page.ontouchstart = function(event) {
			if (event.targetTouches.length == 1) {
				// console.log(event);
				c.t_start = event;
			} else if (event.targetTouches.length == 2) { // scale
				c.t_start1 = event;
				c.dist_base = 0;
			}
			c.is_move = false;
			event.preventDefault();
			event.stopPropagation();
		};
		page.ontouchmove = function(event) {
			if (event.targetTouches.length == 2) { // 双指头
				c.t_start1a = event;

				var dx = event.targetTouches[0].pageX - c.t_start1.pageX;
				var dy = event.targetTouches[0].pageY - c.t_start1.pageY;

				var dx1 = event.targetTouches[1].pageX - c.t_start1.pageX;
				var dy1 = event.targetTouches[1].pageY - c.t_start1.pageY;

				var dt = event.timeStamp - c.t_start1.timeStamp;

				var dist = Math.sqrt((dx - dx1) * (dx - dx1) + (dy - dy1) * (dy - dy1));
				// console.log(dx, dy, dx1, dy1, dist, dt);
				if (c.dist_base == 0) {
					c.dist_base = dist;
				} else {
					// console.log(c.dist_base, dist, dist / c.dist_base);
					var r = dist / c.dist_base;

					var r_old = $(event.target).attr('rold');
					if (!r_old) {
						r_old = 1;
					} else {
						r_old = r_old * 1;
					}
					r = r * r_old;
					if (r <= 1) {
						r = 1;
					}
					if (r > 5) {
						r = 5;
					}
					$(event.target).css("transform", 'scale(' + r + ')').attr('r', r);
					if (r == 1) {
						$(event.target).css('margin-left', 0).css('margin-top', 0);
					}
				}

			} else if (event.targetTouches.length == 1) {
				var r = $(event.target).attr('r');

				if (r == null || r == 1) {
					return;
				}
				var dx = event.pageX - c.t_start.pageX;
				var dy = event.pageY - c.t_start.pageY;

				var px = $(event.target).css('margin-left').replace('px', '') * 1;
				var py = $(event.target).css('margin-top').replace('px', '') * 1;

				var left = px + dx;
				var top = py + dy;
				$(event.target).css('margin-left', left).css('margin-top', top);

				c.t_start = event;
				c.is_move = true;
			}
			event.preventDefault();
			event.stopPropagation();
		};
		page.ontouchend = function(event) {
			event.preventDefault();
			event.stopPropagation();

			if (c.t_start) { // 单个指头
				// console.log(event);
				var dx = event.pageX - c.t_start.pageX;
				var dy = event.pageY - c.t_start.pageY;
				var dt = event.timeStamp - c.t_start.timeStamp;

				// console.log(dx, dy, dt);

				if (dx < -50 && dt < 244) {
					var idx = c.prevIdx;
					idx++;
					if (idx == c.total) {
						idx = 0;
					}
					c.changePhoto(idx);

				} else if (dx > 50 && dt < 244) {
					var idx = c.prevIdx;
					idx--;
					if (idx < 0) {
						idx = c.total - 1;
					}
					c.changePhoto(idx);

				} else if (Math.abs(dx) < 10 && dt < 150 && !c.is_move) {
					c.click_page();
				}
			}
			console.log(c.t_start1)
			if (c.t_start1) {

				var r = $(event.target).attr('r');
				console.log(r)
				$(event.target).attr('rold', r);
			}
			c.t_start = null;
			c.t_start1 = null;
		};
	};
}function EWA_UI_H5FrameSet() {
    this.Create = function (frameId, frameType) {
        this.Id = frameId;
        this.FrameType = frameType;

        this.LOC_ID = "EWA_UI_H5FrameSet_" + this.Id;

        this.ParentDiv = $('#F0_' + this.Id).parent();
        this.objOne = this.ParentDiv.find('.ewa-frameset-one');
        this.objTwo = this.ParentDiv.find('.ewa-frameset-two');
        this.objSplit = this.ParentDiv.find('.ewa-frameset-split');
        this.objCover = this.ParentDiv.find('.ewa-frameset-cover');

		// 当 h5 页面，需要指定高度		
		//$('#EWA_FRAME_MAIN').css('height', '100vh');
		$('body').css('height', '100vh');

        if (frameType == 'H5') {
            this.CreateMoveH5(); // 水平移动
        } else {
            this.CreateMoveV5(); // 上下移动
        }
        if (window.localStorage[this.LOC_ID]) {
            var left = window.localStorage[this.LOC_ID] * 1;
            this.ChangeLocation(left);
        }

		
    };

    /**
     * 获取已经存在的移动实例
     */
    this._GetMoveInstance = function () {
        var name = "__EWA_MOVE_EWA_UI_H5FrameSetInstance";
        if (window[name]) {
            return window[name];
        }

        window[name] = new EWA.UI.Move();
        window[name].NAME = "__EWA_MOVE_EWA_UI_H5FrameSetInstance";
        window[name].Init(window[name]);
        
        return window[name];
    };

    /**
     * 上下移动
     */
    this.CreateMoveV5 = function () {
        this.mv1 = this._GetMoveInstance();
        var obj = this.objSplit[0];

        var c = this;
        this.mv1.AddMoveObjectY(obj, obj, function (a) { // 鼠标抬起
            c.objCover.hide();
            c.objSplit.css('z-index', 1);
        }, document.body, function (a, b) {// 鼠标移动
            var top = $(a).css('top').replace('px', '') * 1;
            c.ChangeLocation(top);
            window.localStorage[c.LOC_ID] = top;
            // console.log(c)
        }, function () {// 鼠标按下
            c.objCover.show();
        });
    };
    /**
     * 水平移动
     */
    this.CreateMoveH5 = function () {
        this.mv1 = this._GetMoveInstance();
        var obj = this.objSplit[0];
        var c = this;
        this.mv1.AddMoveObjectX(obj, obj, function (a) { // 鼠标抬起
            c.objCover.hide();
            c.objSplit.css('z-index', 1);
        }, document.body, function (a, b) {// 鼠标移动
            var left = $(a).css('left').replace('px', '') * 1;
            c.ChangeLocation(left);
            window.localStorage[c.LOC_ID] = left;
            // console.log(c)
        }, function () {// 鼠标按下
            c.objCover.show();
        });
    };

    this.ChangeLocation = function (left) {
        if (this.FrameType == 'H5') {
            this.objOne.css('width', left);
            this.objTwo.css('left', left + 1);
            this.objSplit.css('left', left);
        } else {
            this.objOne.css('height', left);
            this.objTwo.css('top', left + 1);
            this.objSplit.css('top', left);
        }
    };
}var EWA_UI_Dock = {
	dockObj : null,
	dockTitleObj : null,
	menuMap : {},
	init : function (menus) {
		var ss = [ "<div class='ewa-dock'><table class='ewa-dock-table'><tr>" ];
		for ( var n in menus) {
			var menu = menus[n];
			var ref_id = EWA_Utils.tempId("_EWA_UI_Dock_");
			this.menuMap[ref_id] = menu;
			var txt = this.getMenuText(menu);
			var txt1 = this.filterHtml(txt);
			var s = "<td class='ewa-dock-item-td' ><div class='ewa-dock-item-div' id='" + ref_id + "' _title=\"" + txt1
					+ "\" onclick='EWA_UI_Dock.click(this)' onmouseover='EWA_UI_Dock.showTitle(this)' onmouseout='EWA_UI_Dock.hideTitle(this)'>"
					+ "<div class='ewa-dock-item-icon " + menu.ICON + "'></div></div></td>";
			ss.push(s);
		}
		ss.push("</tr></table></div>");
		this.dockObj = $(ss.join(""));

		var ss1 = '<div class="ewa-dock-title" style="display: none;"><div>--</div><p></p></div>';
		this.dockTitleObj = $(ss1);
		$('body').append(this.dockObj).append(this.dockTitleObj);
	},
	click : function (obj) {
		var menu = this.menuMap[obj.id];
		if(!menu){
			console.log('menu ['+obj.id+']?')
		}
		if(!menu.CMD){
			console.log('NO CMD in menu' , menu);
			return;
		}
		if(menu.CMD instanceof Function){
			menu.CMD(obj); 
		} else { //字符串调用
			eval(menu.CMD);
		}
	},
	getMenuText : function (menu) {
		return menu.TEXT;
	},
	filterHtml : function (s) {
		return s.replace(/</ig, "&lt;").replace(/>/ig, "&gt;").replace(/"/ig, "&quot;")
	},
	showTitle : function (obj) {
		if (obj.getAttribute('_title') == "" || obj.getAttribute('_title') == null) {
			var ttt = obj.title;
			if (ttt == "" || ttt == null) {
				return;
			}
			obj.setAttribute("_title", ttt);
			obj.title = "";
		}
		this.dockTitleObj.find("div:eq(0)").html(obj.getAttribute('_title'));

		var p = $(obj).offset();
		var w = $(obj).width();
		var h = this.dockTitleObj.height();
		var w1 = this.dockTitleObj.width();

		this.dockTitleObj.css('top', p.top - h - 8);
		this.dockTitleObj.show();
		this.dockTitleObj.css('left', p.left - (w1 - w) / 2);

	},
	hideTitle : function () {
		this.dockTitleObj.hide();
	}
};/**
 * 导航按钮
 * 
 */
class EWA_UI_NavBarClass {
	constructor() {
		this.id = null;
		this.parent = null;
		/**
		 * {text: '测试1', url: 'htts://gdx/1/a', cb: ()=>{console.log(1)}}
		 * {text: '测试2', content: '<h1>abc</h1>', cb: ()=>{console.log(2), show: true}}
		 * cb(target, index, content/url, ...)
		 */
		this.tabsCfg = null;
		this.lastIdx = 0;
	};

	show(idx) {
		let idx1 = idx * 1;
		if (idx1 === this.lastIdx) {
			return;
		}
		this.lastIdx = idx1;
		let boxes = $(this.parent).find('.ewa-tab-box');
		$(this.parent).find('.ewa-tab-tab').each(function() {
			if ($(this).attr('idx') * 1 === idx1) {
				$(this).removeClass('EWA_GROUP_CNT_TOP').addClass('EWA_GROUP_CNT_TOP1');
			} else {
				$(this).removeClass('EWA_GROUP_CNT_TOP1').addClass('EWA_GROUP_CNT_TOP');
			}
		});
		boxes.hide();
		$(boxes[idx1]).show();
	};
	getBox(idx) {
		let t = $(this.parent).find('.ewa-tab-box:eq(' + idx + ')');
		return t.length == 0 ? null : t[0];
	};
	setContent(idx, content, cb) {
		let t = this.getBox(idx);
		t.html(content);
		if (cb) {
			cb(t, idx, content);
		}
	};
	install(idx, url, cb) {
		let t = this.getBox(idx);
		$Install(url, t, function(a, b, c) {
			if (cb) {
				cb(t, idx, url, a, b, c);
			}
		});
	};
	createInstallCfg(text, url, cb, show) {
		return { text: text, url: url, cb: cb, show: show };
	};
	createContentCfg(text, content, cb, show) {
		return { text: text, content: content, cb: cb, show: show };
	}
	demo() {
		let cfgs = [{
			text: "标签一"
		}, {
			text: "标签二"
		}, {
			text: "<b>标签三</b>",
			show: true
		}];
		document.body.innerHTML = "";
		this.init('demo', document.body, cfgs);
	};
	init(id, parent, tabsCfg) {
		this.id = id;
		this.parent = parent;
		this.tabsCfg = tabsCfg;

		let headers = [];
		let boxes = [];
		for (let i in tabsCfg) {
			let cfg = tabsCfg[i];
			let hclass = i > 0 ? "EWA_GROUP_CNT_TOP" : "EWA_GROUP_CNT_TOP1";
			let header = `<div idx="${i}" class="ewa-tab-tab ${hclass}" id="tab_${id}_${i}">
<a style='display:block'>${cfg.text}</a></div>`;
			let dsp = i > 0 ? "none" : "block";
			let box = `<div idx="${i}" class='ewa-tab-box' id="box_${id}_${i}" style="display: ${dsp}"></div>`;
			boxes.push(box);
			headers.push(header);
		}
		let h = headers.join('');
		let b = boxes.join('');
		let html = `<div class="ewa-tab" id="${id}">
	<div class="ewa-tab-headers" id="headers_${id}">${h}<div style='clear:both'></div></div>
	<div class="ewa-tab-boxes" id="boxes_${id}">${b}</div>
</div>`;
		let tab = $(html);
		let that = this;
		tab.find('a').on('click', function() {
			let idx = $(this).parent().attr('idx') * 1;
			that.show(idx);
		});
		$(parent).append(tab);

		for (let i in tabsCfg) {
			let cfg = tabsCfg[i];
			if (cfg.url) {
				//let cmd = 'that.install(' + i + ',"' + cfg.url + '")';
				//conole.log(cmd);
				//eval(cmd);
				that.install(i, cfg.url, cfg.cb)
			} else if (cfg.content) {
				that.setContent(i, cfg.content, cfg.cb);
			}

			if (cfg.show) {
				console.log(cfg)

				this.show(i);
			}
		}
	};
}/**
 * 提交后的行为
 */
var EWA_Behavior = {};
EWA_Behavior.RELOAD_PARENTA = function(frameUnid) {
	var win = window.parent;
	try {
		if (win.EWA.F.FOS[frameUnid] && win.EWA.F.FOS[frameUnid].Reload) {
			win.EWA.F.FOS[frameUnid].Reload();
		} else {
			win.location = win.location.href;
		}
	} catch (e) {
		win.location = win.location.href;
	}
};
/**
 * 刷新父体列表的内容
 */
EWA_Behavior.RELOAD_PARENT = function(frameUnid) {
	let win = EWA_Behavior.getParentWindow();
	if (!win) {
		return;
	}
	let frame = EWA_Behavior.getParentFrame(frameUnid);
	try {
		if (frame) {
			// 参数url用于列表判断重新加载来源的调用 2019-03-01
			let formUrl = window.location.href;
			frame.Reload(formUrl);
		} else {
			console.warn('not found parent frame:'+frameUnid);
			_EWA_DialogWnd.CloseWindow();
			win.location = win.location.href;
		}
	} catch (e) {
		console.log(e);
		win.location = win.location.href;
	}
};
EWA_Behavior.getParentWindow = function() {
	if (window._EWA_DialogWnd == null) {
		return null;
	}
	let win = _EWA_DialogWnd._OpenerWindow;
	return win;
};
EWA_Behavior.getParentFrame = function(frameUnid) {
	let win = EWA_Behavior.getParentWindow();
	if (win && win.EWA && win.EWA.F && win.EWA.F.FOS && win.EWA.F.FOS[frameUnid]) {
		return win.EWA.F.FOS[frameUnid];
	} else {
		return null;
	}
};
/**
 * 关闭自身的对话框
 */
EWA_Behavior.CLOSE_SELF = function() {
	if (window._EWA_DialogWnd == null) {
		self.close();
		return;
	}
	_EWA_DialogWnd.CloseWindow();
};
/**
 * 清除自身form的内容
 */
EWA_Behavior.CLEAR_SELF = function() {
	self.document.forms[0].reset();
};

/**
 * Frame提交后，刷新父体（ListFrame或其它）的数据
 * 
 * @param postBehavior
 * @param frameUnid
 *            父体的EWA对象 (EWA.F.FOS[frameUnid])
 * @returns
 */
function EWA_PostBehavior(postBehavior, frameUnid) {
	if (postBehavior.indexOf('RELOAD_PARENTA') < 0) {
		try {
			if (!window._EWA_DialogWnd) {
				console.log('not parent window');
				return;
			}

			if (window.STOP_RELOAD) {
				window.STOP_RELOAD = false;
				return;
			}

			var w = _EWA_DialogWnd._OpenerWindow;
			var o = w.__Dialog[frameUnid];

			if (o && o.AfterMsg) {
				w.EWA.UI.Msg.Alert(o.AfterMsg, _EWA_INFO_MSG['EWA.SYS.CHOOSE_ITEM_TITLE']);
			}
		} catch (e) {
			console.log(e);
		}
	}
	let parentFrame = EWA_Behavior.getParentFrame(frameUnid);
	if (parentFrame) {
		parentFrame.outParams = []; //输出参数集合
		for (let i = 2; i < arguments.length; i++) {
			parentFrame.outParams.push(arguments[i]);
		}
	}
	var behaviors = postBehavior.split(",");
	for (var i = 0; i < behaviors.length; i = i + 1) {
		EWA_Behavior[behaviors[i]](frameUnid);
	}
};/**
 * add new function
 */
EWA.UI.Ext = EWA.UI.Ext || {};

EWA.UI.Ext.initExtsMap = function() {
	if (this.mapImg) {
		return;
	}
	this.mapImg = { "def": "Edit.png" }; // 默认图片
	this.mapIcon = { "def": "fa fa-file-text-o" }; // 默认图标

	let me = this;
	function addMaps(exts, img, icon) {
		var arr = exts.split(",");
		for (let n in arr) {
			let ext = arr[n].trim().toLowerCase();
			me.mapImg[ext] = img;
			me.mapIcon[ext] = icon;
		}
	}

	addMaps(".doc,.docx,.rtf", "MSWD.png", "fa fa-file-word-o ewa-file-ext-color-word");
	addMaps(".xls,.xlsx", "XCEL.png", "fa fa-file-excel-o ewa-file-ext-color-excel");
	addMaps(".ppt,.pptx", "PPT3.png", "fa fa-file-powerpoint-o ewa-file-ext-color-powerpoint");
	addMaps(".txt,.cvs,.pom", "Edit.png", "fa fa-file-text-o ewa-file-ext-color-text");
	addMaps(".pdf", "ACR_App.png", "fa fa-file-pdf-o ewa-file-ext-color-pdf");
	addMaps(".7z,.zip,.rar,.arc,.gz,.tar", "zip.png", "fa fa-file-zip-o ewa-file-ext-color-zip");
	addMaps(".odt", "openoffice.png", "fa fa-file-text-o ewa-file-ext-color-text");
	addMaps(".html,.htm", "html.png", "fa fa-internet-explorer ewa-file-ext-color-html");
	addMaps(".mp3,.wav,.mid,.m4a,.oga,.flac,.weba,.opus,.ogg", "mp3.png", "fa fa-file-audio-o ewa-file-ext-color-audio");
	addMaps(".mp4,.mov,.flv,.vod,.ogm,.ogv,.wmv,.mpg,.mpeg,.m4v,.avi,.asx,.webm", "vod.png", "fa fa-file-video-o ewa-file-ext-color-video");
	addMaps(".jpg,.jpeg,.jiff,jfif,.png,.bmp,.webp,.tiff,.avif", "vod.png", "fa fa-file-image-o ewa-file-ext-color-image");
}
/**
 * 获取文件图标
 */
EWA.UI.Ext.getFileIco = function(ext) {
	this.initExtsMap();
	var path = (EWA.RV_STATIC_PATH || '/EmpScriptV2') + "/EWA_STYLE/images/file_png/";

	if (ext == null) {
		ext = "";
	}
	ext = ext.toLowerCase();
	if (ext.indexOf('.') < 0) {
		ext = "." + ext;
	}

	if (this.mapImg[ext]) {
		return path + this.mapImg[ext];
	} else {
		return path + this.mapImg.def; // 默认图片
	}
};
EWA.UI.Ext.FileIco = EWA.UI.Ext.getFileIco;
EWA.UI.Ext.getFileIcon = function(ext) {
	this.initExtsMap();

	if (ext == null) {
		ext = "";
	}
	ext = ext.toLowerCase();
	if (ext.indexOf('.') < 0) {
		ext = "." + ext;
	}

	if (this.mapIcon[ext]) {
		return this.mapIcon[ext];
	} else {
		return this.mapIcon.def; // 默认图标
	}
};
/**
 * 获取文件扩展名
 */
EWA.UI.Ext.FileExt = function(filename) {
	if (filename == null) {
		return "";
	}
	var fn = filename.toLowerCase();
	var loc = fn.lastIndexOf('.');
	var ext = "";
	if (loc > 0) {
		ext = fn.substring(loc);
	}
	return ext;
}
/**
 * 获取文件字节描述
 */
EWA.UI.Ext.getFileLen = function(v, precision) {
	if (v == null || isNaN(v)) {
		return v || "";
	}
	// 返回的计算精度
	if (precision == null || isNaN(precision)) {
		precision = 0;
	}
	if (v >= 1024 * 1024 * 1024 * 1024) {
		let v1 = v / (1024 * 1024 * 1024 * 1024);
		return v1.fm(precision) + "T";
	} else if (v >= 1024 * 1024 * 1024) {
		let v1 = v / (1024 * 1024 * 1024);
		return v1.fm(precision) + "G";
	} else if (v >= 1024 * 1024) {
		let v1 = v / (1024 * 1024);
		return v1.fm(precision) + "M";

	} else if (v >= 1024) {
		let v1 = v / (1024);
		return v1.fm(precision) + "K";
	} else {
		return v + "B";
	}
};
EWA.UI.Ext.FileLen = EWA.UI.Ext.getFileLen;
/**
 * 手机
 */
EWA.UI.Ext.Mobile = function(obj) {
	if (!obj) {// input
		return;
	}
	var id = obj.id || 'R' + Math.random();
	obj.id = id;
	var newid = '__mobile_' + id;
	$(obj).attr('mobile_id', newid);
	if (!$X(newid)) {
		var ss = [];
		ss.push("<table class='ewa-text-help-box' border=0 cellpadding=3 cellspacing=0 id='" + newid + "'>");
		ss.push("<tr><td>");
		ss.push(EWA.UI.Ext.IdCard1(3));
		ss.push("</td><td>-</td><td>");
		ss.push(EWA.UI.Ext.IdCard1(4));
		ss.push("</td><td>-</td><td>");
		ss.push(EWA.UI.Ext.IdCard1(4));
		ss.push("</td><td><i></i></td></tr></table>");

		$('body').append(ss.join(""));
		var o = $X(newid);
		$(o).find('td').css('background-color', '#fff').attr('align', 'center');
		$(obj).attr('maxLength', 11);
	}

	var o = $X(newid);
	addEvent(obj, 'focus', function() {
		var id1 = $(this).attr('mobile_id');
		var oo = $($X(id1)).show();
		oo.css('top', $(this).offset().top - oo.height() - 7);
		oo.css('left', $(this).offset().left);
		EWA.UI.Ext.Mobile2(this);
	});
	addEvent(obj, 'blur', function() {
		var id1 = $(this).attr('mobile_id');
		var oo = $($X(id1)).hide();
	});
	addEvent(obj, 'keyup', function() {
		EWA.UI.Ext.Mobile2(this)
	});
};
EWA.UI.Ext.Mobile2 = function(obj) {
	var id1 = $(obj).attr('mobile_id');
	var oo = $($X(id1));
	var v = obj.value;
	var divs = oo.find('div');
	divs.html("");
	var isok = true;
	for (var i = 0; i < v.length; i++) {
		var c = v.substring(i, i + 1);
		var color = '';
		if (isNaN(c)) {
			color = 'red';
			isok = false;
		}
		if (divs[i]) {
			divs[i].innerHTML = "<span style='font-size:16px;color:" + color + "'>" + c + "</span>";
		}
	}

	if (v.length == divs.length && isok) {
		oo.find('i').html("<font color=green>正确</font>");
	} else {
		oo.find('i').html("<font color=red>错误</font>");
	}
};
/**
 * 辅助身份证输入
 */
EWA.UI.Ext.IdCard = function(obj) {
	if (!obj) {// input
		return;
	}
	var id = obj.id || 'R' + Math.random();
	obj.id = id;
	var newid = '__sfz_' + id;
	$(obj).attr('sfz_id', newid);
	if (!$X(newid)) {
		var ss = [];
		ss.push("<table class='ewa-text-help-box' border=0 cellpadding=1 cellspacing=1 id='" + newid + "'>");
		ss.push("</tr><td height=18>地区</td><td >年</td><td>月</td><td>日</td><td>顺序号</td></tr>");
		ss.push("<tr><td>");
		ss.push(EWA.UI.Ext.IdCard1(6));
		ss.push("</td><td>");
		ss.push(EWA.UI.Ext.IdCard1(4));
		ss.push("</td><td>");
		ss.push(EWA.UI.Ext.IdCard1(2));
		ss.push("</td><td>");
		ss.push(EWA.UI.Ext.IdCard1(2));
		ss.push("</td><td>");
		ss.push(EWA.UI.Ext.IdCard1(4));
		ss.push("</td></tr><tr><td colspan=5>状态 <i></i></td></tr></table>");

		$('body').append(ss.join(""));

		var o = $X(newid);
		$(o).find('td').css('background-color', '#fff').attr('align', 'center');
		$(obj).attr('maxLength', 18);
	}

	var o = $X(newid);
	addEvent(obj, 'focus', function() {
		var id1 = $(this).attr('sfz_id');
		var oo = $($X(id1)).show();
		oo.css('top', $(this).offset().top - oo.height() - 8);
		oo.css('left', $(this).offset().left);
		EWA.UI.Ext.IdCard2(this);
	});
	addEvent(obj, 'blur', function() {
		var id1 = $(this).attr('sfz_id');
		var oo = $($X(id1)).hide();
	});
	addEvent(obj, 'keyup', function() {
		EWA.UI.Ext.IdCard2(this)
	});
};
EWA.UI.Ext.IdCard1 = function(len) {
	var cc = "<div></div>";
	var ss = [];
	for (var i = 0; i < len; i++) {
		ss.push(cc);
	}
	return ss.join('');
};
EWA.UI.Ext.IdCard2 = function(obj) {
	var mm = [1, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
	var id1 = $(obj).attr('sfz_id');
	var oo = $($X(id1)).show();
	var v = obj.value;
	var divs = oo.find('div');
	divs.html("");
	var isok = true;
	var dq = [];
	var year = [];
	var month = [];
	var day = [];
	for (var i = 0; i < v.length; i++) {
		var c = v.substring(i, i + 1);
		var color = '';
		if (i < 6) {
			dq.push(c);
		} else if (i >= 6 && i < 10) {
			year.push(c);
		} else if (i >= 10 && i < 12) {
			month.push(c);
		} else if (i >= 12 && i < 14) {
			day.push(c);
		}
		if (i < 17) {
			if (isNaN(c)) {
				color = 'red';
				isok = false;
			}
		} else {
			if (!(c == 'x' || c == 'X' || !isNaN(c))) {
				color = 'red';
				isok = false;
			}
		}
		if (divs[i]) {
			divs[i].innerHTML = "<span style='font-size:16px;color:" + color + "'>" + c + "</span>";
		}
	}
	var year1 = year.join('');
	var msg = [];
	if (!isNaN(year1)) {
		if (year1 < 1900 || year1 > 2100) {
			isok = false;
			for (var i = 6; i < 10; i++) {
				$(divs[i]).find('span').css('color', 'red');
			}
			msg.push("年:" + year1);
		}
		if ((year1 - 1996) % 4 == 0) { // 闰年
			mm[2] = 29;
		} else {
			mm[2] = 28;
		}
	} else {
		isok = false;
		msg.push("年:" + year1);
	}

	var month1 = month.join('');
	ismonth1 = true;
	if (!isNaN(month1)) {
		if (month1 < 1 || month1 > 12) {
			isok = false;
			ismonth1 = false;
			for (var i = 10; i < 12; i++) {
				$(divs[i]).find('span').css('color', 'red');
			}
			msg.push("月:" + month1);
		}
	} else {
		ismonth1 = false;
		isok = false;
		msg.push("月:" + month1);
	}
	var day1 = day.join('');
	if (!isNaN(day1)) {
		if (ismonth1 && (day1 < 1 || day1 > mm[month1 * 1])) {
			isok = false;
			for (var i = 12; i < 14; i++) {
				$(divs[i]).find('span').css('color', 'red');
			}
			msg.push("日:" + day1);
		}
	} else {
		isok = false;
	}
	if (v.length == divs.length && isok) {
		oo.find('i').html("<font color=green>正确</font>");
		var json = {
			YEAR: year1,
			MONTH: month1,
			DAY: day1,
			SEX: $(divs[16]).text() * 1 % 2
			// 0:female, 1: male
		};
		$(obj).attr('sfz_json', JSON.stringify(json));
	} else {
		oo.find('i').html("<font color=red>" + msg.join(", ") + "错误</font>");
	}
};

// if ($X('BAS_APP_NATIONAL_ID')) {
// sfz($X('BAS_APP_NATIONAL_ID'));
// }
//图片滑动验证 2024-02-04
(function() {
	var template = [];
	template.push("<div class=\"ewa-slider-puzzle-box\">");
	template.push("<div class=\"ewa-slider-puzzle-imgbox\">");
	template.push("<div class=\"ewa-slider-puzzle-verify\"></div>");
	template.push("<div class=\"ewa-slider-puzzle-refresh\"></div>");
	template.push("</div>");
	template.push("<div class=\"ewa-slider-puzzle-handle\">");
	template.push("<span class=\"ewa-slider-puzzle-swiper\"></span>");
	template.push("<span class=\"ewa-slider-puzzle-text\"></span>");
	template.push("</div>");
	template.push("</div>");

	var funcSuccess;
	var funcFail;
	var config;
	var mobile = /iphone|android|ipad/ig.test(navigator.userAgent) || window.EWA_App;
	var win;
	function fnDown() {
		let box = win.$('.ewa-slider-puzzle-box');
		let swiper = win.$('.ewa-slider-puzzle-swiper');
		let verify = win.$('.ewa-slider-puzzle-verify');
		let text = win.$('.ewa-slider-puzzle-text');

		let move = mobile ? 'touchmove' : 'mousemove';
		let up = mobile ? 'touchend' : 'mouseup';
		let down = mobile ? 'touchstart' : 'mousedown';
		// console.log(move,up,down)
		swiper.bind(down, function(e0) {
			e0.stopPropagation()

			// 30为模块宽度
			verify.css({
				display: 'block',
			});
			let e = mobile ? e0.touches[0] : e0;

			// 获取鼠标到按钮的距离
			var disX = e.clientX - $(this).offset().left,
				disY = e.clientY - $(this).offset().top
			text.css('opacity', '0')

			// 防止重复绑定触发多次
			box.unbind(move)
			box.unbind(up)

			// 移动
			//console.log(box[0]);
			box.bind(move, function(e) {
				let e1 = mobile ? e.touches[0] : e;
				fnMove(e1, disX, disY)
			})

			// 释放
			box.bind(up, function(e) {
				box.unbind(move)
				box.unbind(up)

				let u = new EWA_UrlClass(config.ewa_url);
				//console.log(verify.position());
				//console.log(verify.offset());
				let data = {};
				data["left"] = verify.position().left;
				data["top"] = verify.position().top;
				data["left1"] = verify.offset().left;
				data["top1"] = verify.offset().top;

				data["ewa_trigger_valid_mode"] = "check";
				data["ewa_trigger_valid_name"] = config.ewa_trigger_valid_name;
				data["ewa_ajax"] = config.ewa_trigger_valid;
				console.log('0. Puzzle post check');
				$JP(u.GetUrl(), data, function(rst) {
					//console.log(rst);
					if (rst.RST) {
						console.log('1. puzzle valid ok');
						box.addClass('ewa-slider-puzzle-successful');
						if (funcSuccess) {
							funcSuccess(rst);
						}
						return;
					}
					box.addClass('ewa-slider-puzzle-fail');
					setTimeout(() => {
						box.removeClass('ewa-slider-puzzle-fail');
						// 解除绑定，并将滑动模块归位

						swiper.css('left', '0px')
						verify.css('left', '10px')
						text.css('opacity', '1')

						if (funcFail) {
							funcFail(rst);
						}

						if (rst.newConfig) {
							rst.newConfig.ewa_trigger_valid_name = config.ewa_trigger_valid_name;
							rst.newConfig.ewa_trigger_valid = config.ewa_trigger_valid;
							rst.newConfig.ewa_url = config.ewa_url;
							config = rst.newConfig;
							refreshImg(config)
						}

					}, 500);


				});

			})
		})
	}

	function fnMove(e, posX, posY) {
		let handle = win.$('.ewa-slider-puzzle-handle')
		let swiper = win.$('.ewa-slider-puzzle-swiper');
		let verify = win.$('.ewa-slider-puzzle-verify');

		// 这里的e是以鼠标为参考
		var l = e.clientX - posX - $(handle).offset().left;
		var winW = $(handle).width() + 29;
		// console.log(l,winW)
		// 限制拖动范围只能在handle中
		if (l < 0) {
			l = 0
		} else if (l > winW) {
			l = winW
		}
		swiper.css('left', l);
		verify.css('left', l + 10);
	}

	function refreshImg(json) {
		var imgBox = win.$('.ewa-slider-puzzle-imgbox');
		var verImg = win.$('.ewa-slider-puzzle-imgbox img');
		imgBox.css('width', json.imgBigWidth).css('height', json.imgBigHeight);
		if (verImg.length) {
			verImg.attr('src', json.imgBig)
		} else {
			imgBox.prepend("<img src='" + json.imgBig + "' />");
		}
		let verify = win.$('.ewa-slider-puzzle-verify');
		verify.css('background-image', "url('" + json.imgSmall + "')")
			.css('top', json.imgTop)
			.css('width', json.imgSmallWidth)
			.css('height', json.imgSmallHeight);
	}


	/**
	 * 初始化
	 * @param json 配置信息，imgBig，imgBigWidth，imgBigHeight<br>
	 * 	imgSmall, imgSmallWidth, imgSmallHeight<br>
	 *  imgTop
	 * @param parent 安装的父体
	 * @param cbSuccess 验证成功的回调方法
	 * @param cbFail 验证失败的回调方法
	 */
	function init(json, parent, cbSuccess, cbFail) {
		config = json;
		funcSuccess = cbSuccess;
		funcFail = cbFail;
		let target = $(parent || 'body');
		target.append(template.join(""));

		win = target[0].ownerDocument.defaultView;

		let refresh = win.$('.ewa-slider-puzzle-refresh');
		let box = win.$('.ewa-slider-puzzle-box');
		box.css('width', json.imgBigWidth);
		refreshImg(json)
		refresh.click(function(e) {
			e.stopPropagation();
			var u = new EWA_UrlClass(config.ewa_url);
			u.AddParameter("ewa_trigger_valid_mode", "refresh");
			u.AddParameter("ewa_trigger_valid_name", config.ewa_trigger_valid_name);
			u.AddParameter("ewa_ajax", config.ewa_trigger_valid);
			u.AddParameter("ewa_trigger_valid_width", document.documentElement.clientWidth);
			$J(u, function(rst) {
				if (!rst.RST) {
					alert(rst.ERR);
					return;
				}
				rst.ewa_trigger_valid_name = config.ewa_trigger_valid_name;
				rst.ewa_trigger_valid = config.ewa_trigger_valid;
				rst.ewa_url = config.ewa_url;
				config = rst;
				refreshImg(config)
			});
		});
		fnDown();
	}
	EWA.UI.SlidePuzzle = init;
})();/**
 * 
 * @include "EWA.js"
 * @include "EWA_UI.js"
 */

if (typeof EWA == 'undefined') {
	EWA = {};
}
/**
 * F: Frame L: ListFrame T: Tree
 */
EWA.F = {
	FOS: {}, /* Frame对象集合 */
	GetFOSOne: function() {/* 获得第一个对象 */
		for (var n in EWA.F.FOS) {
			return EWA.F.FOS[n];
		}
	},
	/**
	 * 获取父对象下的所有EWA
	 * 
	 * @param parent 父对象（JQ表达式或dom对象）
	 */
	getSubEwas: function(parent) {
		var ewas = [];
		var tb = $(parent||document.body).find('.EWA_TABLE, .ewa-tree');
		tb.each(function() {
			var id = $(this).attr('id');
			if (!id) {
				return;
			}
			id = id.replace('EWA_FRAME_', '').replace('EWA_LF_', '').replace('EWA_TREE_','');
			var ewa = EWA.F.FOS[id];
			if (ewa) {
				ewas.push(ewa);
			}
		});
		return ewas;
	},
	/* Upload */
	U: {
		WND: null
	},
	// cmd
	Cmd: function() {
		this.EWA_ACTION = null;
		this.EWA_AJAX = "1";
		this.EWA_NO_CONTENT = "1";

		this.EWA_TREE_KEY = null;
		this.EWA_TREE_PARENT_KEY = null;
		this.EWA_TREE_TEXT = null;

		this.EWA_AFTER_EVENT = "";
	},

	/**
	 * Install ewa
	 * 
	 * @param {String}
	 *            parentId
	 * @param {String}
	 *            xmlName
	 * @param {String}
	 *            itemName
	 * @param {String}
	 *            parameters
	 */
	Install: function(parentId, xmlName, itemName, parameters, afterJs) {
		var url;
		if (window.EWA_CGI) { // 全局替换cgi-bin路径
			url = window.EWA_CGI;
		} else {
			url = EWA.CP + "/EWA_STYLE/cgi-bin/";
		}

		var u = url + "?xmlName=" + xmlName + "&itemName=" + itemName + "&EWA_FRAMESET_NO=1&EWA_AJAX=INSTALL&" + parameters;
		var ajax = new EWA.C.Ajax();
		ajax.Install(u, "_r=1", parentId, afterJs);
	},

	/**
	 * 安装Html
	 * 
	 * @param {String}
	 *            parentId
	 * @param {String}
	 *            html
	 * @param {Function}
	 *            afterJs
	 * @return {TypeName}
	 */
	InstallHtml: function(parentId, html, afterJs) {
		var obj = $X(parentId);
		if (obj == null) {
			alert('Object [' + parentId + '] not found');
			return;
		}
		obj.innerHTML = html;

		try {
			EWA.C.Utils.JsRegisters(rst);
		} catch (e) {
			console.log(e);
		}
		if (afterJs != null) {
			try {
				afterJs(parentId);
			} catch (e) {
				console.log(e);
			}
		}
	},
	//替换当前包含路径的xmlname，替换文件名为新的xml文件名，路径不变
	replaceXmlName: function(refXmlFullPath, newOnlyXmlName) {
		let paths = refXmlFullPath.unURL().replace(/\|/ig, '/').split('/');
		let newPaths = [];
		for (let i = 0; i < paths.length - 1; i++) {
			let p = paths[i];
			if (p === "") {
				continue;
			}
			newPaths.push(p);
		}
		newPaths.push(newOnlyXmlName);

		return newPaths.join("/");
	}
};
EWA.F.POP = {
	AJAX: null,
	PostBehavior: function(frameUnid, parameters, ewaAction) {
		var f = EWA.F.FOS[frameUnid];
		if (f == null) {
			alert('Object EWA.F.FOS.' + frameUnid + ' not exists!');
			return;
		}
		var url = f.Url == null ? f._Url : f.Url;
		if (url == null) {
			alert('Object EWA.F.FOS.' + frameUnid + '.Url not exists!');
			return;
		}
		var s1 = "EWA_AJAX=1&EWA_NO_CONTENT=1&EWA_ACTION=" + ewaAction;
		if (parameters != null) {
			for (var i = 0; i < parameters.length; i = i + 1) {
				var n = parameters[i]['Name'];
				var v = parameters[i]['Value'];
				if (n == null || n == '' || v == null || v == '') {
					continue;
				}
				var v = encodeURIComponent(v);
				s1 = s1 + '&' + n + "=" + v;
			}
		}
		EWA.F.POP.AJAX = new EWA.C.Ajax();
		EWA.F.POP.AJAX.LoadingType = "image";
		EWA.F.POP.AJAX.Post(url, s1, EWA.F.POP.CallBack);
	},
	CallBack: function() {
		var ajax = EWA.F.POP.AJAX;
		if (ajax._Http.readyState != 4) {
			ajax = null;
			return;
		}
		ajax.HiddenWaitting();
		if (ajax._Http.status == 200) {
			var ret = ajax._Http.responseText;
			if (EWA.F.CheckCallBack(ret)) {
				try {
					eval(ret);
				} catch (e) {
					alert(ret);
				}
			}
		} else {
			alert("ERROR:\r\n" + ajax._Http.statusText);
		}
		ajax = null;
	}
};
EWA.F.CheckCallBack = function(s1) {
	if (s1.indexOf('<!--EWA_ERROR_INFOMATION-->') >= 0) {
		if (EWA["SHOW_ERROR"] == true) { // 允许提示错误
			$DialogHtml(s1, "ERROR", '90vw', '90vh');
		}
		return false;
	} else {
		return true;
	}
};
EWA.F.ST = {};
EWA.F.ST.SaveStatus = function(id, frameTag) {
	var url = EWA.CP + '/EWA_STYLE/cgi-bin/_st_/';
	url = url.replace("//", "/");
	var ajax = new EWA.C.Ajax();
	ajax.AddParameter('U', document.location.href);
	ajax.AddParameter('T', frameTag);
	ajax.AddParameter('V', id);
	ajax.AddParameter('M', "1"); // save status
	ajax.PostNew(url, function() {
	});
	ajax.HiddenWaitting();
}
EWA.F.ST.GetStatus = function(frameTag, frameClass) {
	var url = EWA.CP + '/EWA_STYLE/cgi-bin/_st_/';
	url = url.replace("//", "/");
	EWA.F.ST.Ajax = new EWA.C.Ajax();
	EWA.F.ST.Ajax.AddParameter('U', document.location.href);
	EWA.F.ST.Ajax.AddParameter('T', frameTag);
	EWA.F.ST.Ajax.AddParameter('M', "0"); // get status
	EWA.F.ST.Ajax.FrameClass = frameClass;
	EWA.F.ST.Ajax.PostNew(url, EWA.F.GetStatusCallBack);
}

EWA.F.GetStatusCallBack = function() {
	var ajax = EWA.F.ST.Ajax;
	if (ajax._Http.readyState != 4) {
		ajax = null;
		return;
	}
	ajax.HiddenWaitting();
	if (ajax._Http.status == 200) {
		var ret = ajax._Http.responseText;
		eval(ret);
		ajax.FrameClass.LoadStatus();
	} else {
		alert("ERROR:\r\n" + ajax._Http.statusText);
	}
	EWA.F.ST.Ajax = ajax = null;
}

EWA.F.Ajax = {
	TIMER_ID: null,
	AJAX_LIST: [],

	_GetId: function(obj) {
		var id = this.AJAX_LIST.length;
		this.AJAX_LIST[id] = obj;
		return id;
	},

	_StartMonitor: function() {
		if (this.TIMER_ID != null) {
			return;
		}
		this.TIMER_ID = window.setInterval(this._Moninter, 100);
	},

	_Moninter: function() {
		var stop = true;
		for (var i = 0; i < EWA.F.Ajax.AJAX_LIST.length; i++) {
			var a = EWA.F.Ajax.AJAX_LIST[i];
			if (a == null || a.isStop) {
				continue;
			}
			if (!EWA.F.Ajax._CallBack(a)) {
				stop = false;
			}
		}
		if (stop) {
			window.clearInterval(EWA.F.Ajax.TIMER_ID);
			EWA.F.Ajax.TIMER_ID = null;
		}
	},
	/**
	 * 
	 * @param {EWA.F.Ajax.Install}
	 *            installAjax
	 * @return {Boolean}
	 */
	_CallBack: function(installAjax) {
		var ajax = installAjax.ajax;
		if (ajax._Http.readyState != 4) {
			return false;
		}

		installAjax.isStop = true;
		ajax.HiddenWaitting();
		if (ajax._Http.status == 200) {
			installAjax.ret = ajax._Http.responseText;
		} else {
			installAjax.ret = "ERROR:\r\n" + ajax._Http.statusText;
		}
		installAjax.ReplaceObject();

		installAjax = null;
		return true;
	},

	/**
	 * 装载主程序
	 * 
	 * @param {String}
	 *            url 地址
	 * @param {String}
	 *            replaceObjId Html对象id
	 */
	Install: function(url, replaceObjId) {
		this.replaceId = replaceObjId;
		this.CLASS_NAME = 'EWA.F.Ajax.Install';
		this.ajax = new EWA.C.Ajax();
		this.ret = null;
		this.isStop = true;
		this.id = EWA.F.Ajax._GetId(this);

		this.ajax.Get(url, function() {
		});
		this.isStop = false;

		EWA.F.Ajax._StartMonitor();

		this.ReplaceObject = function() {
			var o = $X(this.replaceId);
			o.innerHTML = this.ret;
			this.AddScripts();
		}

		/**
		 * 将脚本Script在页面中加载
		 */
		this.AddScripts = function() {
			var s1 = /<script(.|\n|\r)*?>(.|\n|\r)*?<\/script(.|\n|\r)*?>/ig;
			var sss = this.ret.match(s1);
			if (sss == null)
				return;
			var head = document.getElementsByTagName("head")[0] || document.documentElement;
			for (var i = 0; i < sss.length; i++) {
				var s2 = /<script(.|\n|\r)*?>/ig;
				var s22 = /<\/script(.|\n|\r)*?>/ig;
				var s3 = sss[i];

				s3 = s3.replace(s2, '').replace(s22, '').trim();
				if (s3.length == 0) {
					continue;
				}
				// alert(s3);
				try {
					var script = document.createElement("script");
					script.type = "text/javascript";
					if (EWA.B.IE)
						script.text = s3;
					else
						script.appendChild(document.createTextNode(s3));
					head.insertBefore(script, head.firstChild);
					head.removeChild(script);
				} catch (E) {
				}
			}
		}
	}
};

/**
 * 文件上传
 * 
 * @param xmlName
 *            来源配置文件
 * @param itemName
 *            来源配置项
 * @param fromItemName
 *            来源条目
 */
EWA.F.U.Upload = function(xmlName, itemName, fromItem) {
	var retCmd = new EWA.UI.Dialog.CMD();
	retCmd.CmdArgus[0] = fromItem;
	retCmd.CmdArgus[1] = 'UPFILE';
	var url = EWA.CP + "/EWA_STYLE/cgi-bin/_up_/?xmlName=" + xmlName + "&ITEMNAME=" + itemName + "&FROMITEM=" + fromItem.id;
	EWA.UI.Dialog.OpenWindow(url, "upfile", 420, 310, false, null, retCmd);
};

EWA.F.Tip = function(tipName) {
	var msg = _EWA_INFO_MSG[tipName];
	if (msg == null) {
		msg = tipName;
	}
	if (msg == null || msg.trim() == '') {
		return;
	}
	alert(msg);
}

EWA.F.I = {}; // item类调用
/**
 * DropList 动态下拉框，选择和修改输入内容
 * 
 * @param obj
 *            当前的对象
 */
EWA.F.I.DropList = function(obj) {
	if (EWA.F.FOS[obj.id] == null) {
		EWA.F.FOS[obj.id] = new EWA_FrameItemClass();
	}
	EWA.F.FOS[obj.id].DropList(obj);
	// 输入值即重置
	$(obj).next().val('');

	if (!obj.getAttribute('_check_blank')) {
		obj.setAttribute('_check_blank', 'haha');
		addEvent(obj, 'blur', function() {
			if ($(this).next().val() == '') {
				this.value = '';
				var afterEvent = $(this).next().attr('afterevent');
				if (afterEvent) {
					// val, text, hidObj, txtObj
					if (window[afterEvent]) {
						window[afterEvent]('', '', $(this).next()[0], this);
					} else {
						try {
							var func = eval(afterEvent);
							func('', '', $(this).next()[0], this);
						} catch (e) {
							console.log(e);
						}
					}
				}
			}
		});
	}

}

/**
 * Date 动态日期
 * 
 * @param obj
 *            当前的对象
 */
EWA.F.I.Date = function(obj, havTime) {
	EWA.F.FOS[obj.id] = new EWA.UI.Calendar.Pop(obj, havTime);
}

/**
 * 用于页面安装的参数表
 * 
 */
function EWA_Parameters() {// 参数表
	this.ParaNames = new Array();
	this.ParaValues = new Array();

	/**
	 * 添加参数
	 * 
	 * @param name
	 *            参数名称
	 * @param value
	 *            参数值
	 */
	this.Add = function(name, value) {
		if (name == null || name.trim() == "") {
			return;
		}
		this.ParaNames[this.ParaNames.length] = name.trim();
		this.ParaValues[this.ParaValues.length] = value;
	};

	/**
	 * 获取所有参数组合的表达式
	 */
	this.GetString = function() {
		var s1 = "";
		for (var i = 0; i < this.ParaNames.length; i = 1 + i) {
			if (s1.length > 0) {
				s1 += "&";
			}
			var val = this.ParaValues[i];
			s1 += this.ParaNames[i] + "=" + val == null ? "" : encodeURIComponent(val);
		}
		return s1;
	};
}

/**
 * Frame页面加载
 * 
 * @param parentObject
 *            对象页面的父体
 * @param xmlName
 *            配置文件名称
 * @param itemName
 *            配置项名称
 * @param parameters
 *            参数对象 //EWA_Parameters
 */
function EWA_FrameInstallClass(parentObject, xmlName, itemName, parameters) {
	this.Xml = new EWA.C.Xml();
	this.XmlName = xmlName;
	this.ItemName = itemName;
	this.Parameters = parameters;

	/**
	 * 页面安装
	 * 
	 * @param url
	 *            Xml数据URL地址
	 */
	this.Install = function(url) {
		if (url == null) {
			url = this.GetUrl();
		}
		this.Xml.LoadXmlFile(url);
		var node = this.Xml.GetElement("FrameData");
		var type = this.Xml.GetElementAttribute(node, "Type");
		var className = this.Xml.GetElementAttribute(node, "ClassName");

		var nodeCss = this.Xml.GetElement("Css", node);
		var css = this.Xml.GetElementText(nodeCss);
		document.write(css);
		if (type.toUpperCase() == "TREE") {
			var c = new EWA.F.T.C(parentObject, className, url); // tree
			// frame;
			eval(className + "=c");
			EWA.F.FOS[className] = c;
			c.CreateByXml(this.Xml);
			c = null;
		}
	};

	/**
	 * 获取 XML 数据 URL 地址
	 */
	this.GetUrl = function() {
		var url = EWA.CP + "/EWA_STYLE/cgi-bin/?XMLNAME=";
		url += this.XmlName.toURL() + "&ITEMNAME=" + this.ItemName.toURL();
		url += "&EWA_AJAX=XML";
		if (this.Parameters != null) {
			url += "&" + this.Parameters.GetString();
		}
		return url;
	};
}
// ---------------------class of common Frame define items ------------
function EWA_FrameCommonItems() {
	this._ClassXml = null;
	this.Items = {};
	// 默认的提示信息，当热更新 _EWA_JS_ALERT 出现不完整或错误时，调用此信息
	this._EWA_JS_ALERT_DEFAULT = {
		"MaxMinLength": "长度应在{MinLength}-{MaxLength}之间 ",
		"MaxMinValue": "值应在({MinValue} - {MaxValue})之间",
		"IsMustInput": "*"
	};
	this.Init = function(classXml) {
		this._ClassXml = classXml;
		var nl = classXml.GetElements("root/XItem");
		var isModify = false;
		if (this.F) {
			var u = new EWA_UrlClass();
			u.SetUrl(this.F.Url);
			if (u.GetParameter('EWA_MTYPE') == 'M') {
				isModify = true;
			}
		}
		for (var i = 0; i < nl.length; i++) {
			var name1 = this.GetItemValue(nl[i], "Name", "Name")
			var name = name1.toUpperCase();
			var node = nl[i];
			this.Items[name] = node;
			var valid = this.GetItemValue(node, 'DataItem', 'Valid');
			if (valid && valid.toUpperCase() == 'MOBILE') {
				EWA.UI.Ext.Mobile($X(name));
			} else if (valid && valid.toUpperCase() == 'IDCARD') {
				EWA.UI.Ext.IdCard($X(name));
			}
			if (isModify) {
				this.disableOnModify(node, name1); //修改时禁用
			}
		}
	};
	/**
	* 修改时禁用
	*/
	this.disableOnModify = function(node, name1) {
		var DisableOnModify = this.GetItemValue(node, 'DataItem',
			'DisableOnModify');
		if (!(DisableOnModify && DisableOnModify.toUpperCase() == 'YES')) {
			return;
		}
		var o = $X(name1);
		if (o) {
			o.setAttribute('disabled', 'disabled');
			if (o.getAttribute('DlsShow')) {
				// droplist设置显示的对象禁用
				$(o).prev().attr('disabled', 'disabled');
			}
		}
	};
	this.GetItem = function(itemName) {
		var name = itemName.toUpperCase().trim();
		return this.Items[name];
	};
	this.GetItemValue = function(itemNode, tag, para) {
		if (itemNode == null)
			return null;

		var chd = this._ClassXml.GetElement(tag + "/Set", itemNode);
		if (chd == null)
			return null;
		return chd.getAttribute(para);
	};
	this.GetDescription = function(name) {
		var o = $(this.GetItem(name)).find(
			"DescriptionSet Set[Lang=" + EWA.LANG + "]");
		return {
			Info: o.attr("Info"),
			Memo: o.attr("Memo")
		};
	}
	this.GetValue = function(itemName, tag, para) {
		var item = this.GetItem(itemName);
		return this.GetItemValue(item, tag, para);
	}

	this.CheckValid = function(obj, val) {
		if (obj.tagName == 'SPAN' || obj.tagName == 'IMG') {
			return true;
		}
		var nodeItem = this.GetItem(obj.id);
		var errorInfos = [];

		// 必须输入
		var errorInfo = this._CheckMustInput(obj, val, nodeItem);
		if (errorInfo)
			errorInfos.push(errorInfo);

		if (val == null || val == "") {
			if (errorInfos.length == 0) {
				EWA_FrameRemoveAlert(obj);
				return true;
			} else {
				EWA_FrameShowAlert(obj, errorInfos.join(", "));
				return false;
			}
		}

		// 检查最大最小长度
		errorInfo = this._CheckMaxMinLength(obj, val, nodeItem);
		if (errorInfo)
			errorInfos.push(errorInfo);

		// 合法性检查
		errorInfo = this._CheckDataValid(obj, val, nodeItem);
		if (errorInfo)
			errorInfos.push(errorInfo);

		// 验证输入类型
		errorInfo = this._CheckDataType(obj, val, nodeItem);
		if (errorInfo)
			errorInfos.push(errorInfo);

		// 最大最小值检查
		errorInfo = this._CheckMaxMinValue(obj, val, nodeItem);
		if (errorInfo)
			errorInfos.push(errorInfo);
		// 检查密码
		errorInfo = this._CheckPassword(obj, val, nodeItem);
		if (errorInfo)
			errorInfos.push(errorInfo);

		// 扩展验证
		errorInfo = this._CheckExtent(obj, val, nodeItem);
		if (errorInfo)
			errorInfos.push(errorInfo);

		if (errorInfos.length == 0) {
			EWA_FrameRemoveAlert(obj);
			return true;
		} else {
			EWA_FrameShowAlert(obj, errorInfos.join(", "));
			return false;
		}
	};
	/**
	 * 检查扩展
	 * 
	 * @param {}
	 *            obj
	 * @param {}
	 *            val
	 * @param {}
	 *            nodeItem
	 */
	this._CheckExtent = function(obj, val, nodeItem) {
		var errorInfo = null;

		var validEx = obj.getAttribute("EWA_VALID_EX");
		validEx = validEx == null ? "" : validEx;
		if (validEx.length > 0) {
			errorInfo = validEx;
		}
		return errorInfo;
	}

	/**
	 * 验证输入类型
	 * 
	 * @param {}
	 *            obj
	 * @param {}
	 *            val
	 * @param {}
	 *            nodeItem
	 * @return {}
	 */
	this._CheckDataType = function(obj, val, nodeItem) {
		if (val == null || val.trim() == "") {
			return null;
		}
		var errorInfo = null;
		if (this.isNumber(obj)) {
			var val1 = val.replace(/,/ig, ''); //删除千分位
			if (isNaN(val1)) {
				errorInfo = _EWA_INFO_MSG['EWA.SYS.INVALID_NUMBER_FORMAT'];
			}
/* 对 12.312.12无效			
var test = /^[0-9.-]{0,120}$/;
			if (!test.test(val)) {
				errorInfo = _EWA_INFO_MSG['EWA.SYS.INVALID_NUMBER_FORMAT'];
			}
*/		}
		return errorInfo;
	}

	/**
	 * 检查两次输入密码是否一致
	 * 
	 * @param {}
	 *            obj
	 * @param {}
	 *            val
	 * @param {}
	 *            nodeItem
	 * @return {}
	 */
	this._CheckPassword = function(obj, val, nodeItem) {
		if (obj.tagName.toLowerCase() != 'input'
			|| obj.type.toLowerCase() != 'password') { // password
			// check
			return null;
		}
		// 郭磊 2017-09-19 检查两个密码是否一致只检查本form下的
		var objs = $('#USR_PWD').parentsUntil('form').last().find(
			'input[type=password]');
		// var objs = document.getElementsByTagName('input');

		var pass1 = null;
		var id0 = obj.id;
		for (var i = 0; i < objs.length; i += 1) {
			if (objs[i].type != 'password' || objs[i] == obj)
				continue;
			if (objs[i].id == id0 + "1") {// 第二个密码的id =
				// 第一个id+1，例如usr_pwd1对应usr_pwd
				pass1 = objs[i];
				break;
			}
		}
		var errorInfo = null;
		if (pass1 != null) {
			if (pass1.value != obj.value) {
				isok = false;
				errorInfo = _EWA_INFO_MSG["EWA.F.PASSWORD"];
			} else {
				EWA_FrameRemoveAlert(pass1);
			}
		}
		return errorInfo;

	}

	/**
	 * 检查必须输入
	 */
	this._CheckMustInput = function(obj, val, nodeItem) {
		var mustInput = this.GetItemValue(nodeItem, "IsMustInput",
			"IsMustInput");
		if (mustInput != "1") {
			return null;
		}
		// 检查必填项是否输入
		if (val != null && val.length > 0) {
			return null;
		}

		if ("hidden" == obj.type && "ht5upload" == $(obj).attr('ewa_tag')) { //h5upload
			// 检查是否有之前的上传文件
			if ($(obj).parent().find('.ewa_app_upload_form1:visible').length > 0) {
				return null;
			}
		}

		var errorInfo = null;
		errorInfo = _EWA_JS_ALERT["IsMustInput"];
		if (errorInfo) {
			errorInfo = errorInfo.replace("{Name}", obj.id);
		} else {
			errorInfo = "*";
		}
		return errorInfo;
	}
	/**
	 * 检查最大最小长度
	 * 
	 * @param {}
	 *            obj
	 * @param {}
	 *            val
	 * @param {}
	 *            nodeItem
	 */
	this._CheckMaxMinLength = function(obj, val, nodeItem) {
		if (!val) { // 没有值的情况不判断 2016-8-15 郭磊
			return null;
		}
		var maxLen = this.GetItemValue(nodeItem, "MaxMinLength", "MaxLength");
		var minLen = this.GetItemValue(nodeItem, "MaxMinLength", "MinLength");

		maxLen = maxLen == null ? -1 : parseInt(maxLen);
		minLen = minLen == null ? -1 : parseInt(minLen);

		var isOk = true;
		if (!isNaN(maxLen) && maxLen > 0 && val.length > maxLen) {
			isOk = false;
		}

		if (isOk && !isNaN(minLen) && minLen > 0 && val.length < minLen) {
			isOk = false;
		}

		var errorInfo = null;
		if (!isOk) {
			errorInfo = _EWA_JS_ALERT["MaxMinLength"]
				|| this._EWA_JS_ALERT_DEFAULT["MaxMinLength"];// 默认的提示信息，当热更新
			// _EWA_JS_ALERT
			// 出现不完整或错误时，调用此信息
			errorInfo = errorInfo.replace("{Name}", obj.id);
			errorInfo = errorInfo.replace("{MaxLength}", maxLen);
			errorInfo = errorInfo.replace("{MinLength}", minLen);
		}
		return errorInfo;
	}
	/**
	 * 检查数据合法性
	 * 
	 * @param {}
	 *            obj
	 * @param {}
	 *            val
	 * @param {}
	 *            nodeItem
	 * @return {String}
	 */
	this._CheckDataValid = function(obj, val, nodeItem) {
		var valid = this.GetItemValue(nodeItem, "DataItem", "Valid");
		if (valid == null || valid.trim() == "") {
			return "";
		}
		if (val.length > 0) {
			// 不是必填项但输入了内容
			var o = _EWA_VALIDS[valid.toUpperCase().trim()];
			if (o == null) {
				return "";
			}
			if (o.REGEX.test(val)) {
				return "";
			} else {
				return o.MSG;
			}
		}
	}
	/**
	 * 检查最大最小值
	 * 
	 * @param {}
	 *            val
	 * @param {}
	 *            nodeItem
	 * @return {String} 提示信息
	 */
	this._CheckMaxMinValue = function(obj, val, nodeItem) {
		var maxVal = this.GetItemValue(nodeItem, "MaxMinValue", "MaxValue");
		var minVal = this.GetItemValue(nodeItem, "MaxMinValue", "MinValue");
		var max = maxVal == null || maxVal.trim() == "" ? null : maxVal * 1;
		var min = minVal == null || minVal.trim() == "" ? null : minVal * 1;
		var isok = true;
		if (max != null) {
			if (val * 1 <= max) {
				isok = true;
			} else {
				isok = false;
			}
		}
		if (min != null) {
			if (val * 1 >= min) {
				isok = isok & true;
			} else {
				isok = false;
			}
		}
		if (!isok) {
			errorInfo = _EWA_JS_ALERT["MaxMinValue"]
				|| this._EWA_JS_ALERT_DEFAULT["MaxMinValue"]; // 默认的提示信息，当热更新
			// _EWA_JS_ALERT
			// 出现不完整或错误时，调用此信息
			errorInfo = errorInfo.replace("{MaxValue}", maxVal);
			errorInfo = errorInfo.replace("{MinValue}", minVal);
			return errorInfo
		} else {
			return "";
		}
	}
	/**
	* 是否为数字
	 */
	this.isNumber = function(obj) {
		if (!obj) {
			return null;
		}
		let nodeItem = this.GetItem(obj.id);
		let dataType = nodeItem ? this.GetItemValue(nodeItem, "DataItem", "DataType") : "";
		dataType = dataType == null ? "" : dataType.toUpperCase();
		let isNumber = dataType == "NUMBER" || dataType == "INT" || dataType == "BIGINT";
		return isNumber;
	};
	/**
	* 清除前后空格 20220623
	 */
	this.isTrim = function(obj) {
		if (!obj) {
			return null;
		}
		if ($(obj).attr('ewa_trim')) {
			return true;
		}
		let nodeItem = this.GetItem(obj.id);
		let trim = nodeItem ? this.GetItemValue(nodeItem, "DataItem", "Trim") : "";
		trim = trim ? trim.toUpperCase() : "YES";
		let isTrim = trim == "YES";
		if (isTrim) {
			$(obj).attr('ewa_trim', 'yes').on("blur", function() { // 失去焦点后触发
				this.value = this.value.trim();
			});
		}
		return isTrim;
	};

	this.getFormat = function(obj) {
		if (!obj) {
			return "";
		}
		let nodeItem = this.GetItem(obj.id);
		return nodeItem ? this.GetItemValue(nodeItem, "DataItem", "Format") : "";
	};
	/**
	 * 获取Html对象值
	 * 
	 * @param {}
	 *            obj
	 * @return {}
	 */
	this.GetObjectValue = function(obj) {
		var tagName = obj.tagName.toUpperCase();
		var o1 = obj;
		var s1 = "";
		// 开关
		if (tagName == "DIV" && $(obj).hasClass('ewa-switch')) {
			var switchObj = obj.getElementsByTagName("input")[0];
			return switchObj.checked ? "on" : "off";
		}
		// radio or checkbox
		if (tagName == "DIV" && obj.getAttribute("TAG") == 'REPT') {
			var objs = obj.getElementsByTagName("input");
			for (var i = 0; i < objs.length; i = i + 1) {
				if (objs[i].checked) {
					if (s1.length > 0) {
						s1 += ",";
					}
					s1 += objs[i].value;
				}
			}
			return s1;
		}
		if (tagName == "DIV" && obj.getAttribute('EWA_DHTML') == "1") {// dhtml
			var w = obj.getElementsByTagName("iframe")[0].contentWindow;
			var ts = w.document.getElementsByTagName('textarea');
			if (ts.length > 0 && ts[0].style.display != 'none') {
				// 获取textarea的值
				s1 = ts[0].value;
			} else {
				s1 = w.frames[0].document.body.innerHTML;
			}
			// 参数 EWA_DHTML_HOST，是否替换域名
			if (location.search != null
				&& location.search.toUpperCase().indexOf("EWA_DHTML_HOST") < 0) {
				var s2 = "http:\\/\\/" + eval('document.location.host');
			}
			var s3 = eval('/' + s2 + "/ig");
			s1 = s1.replace(s3, '');
			var obj = obj.getElementsByTagName("input")[0];
			obj.value = s1;
			return obj.value;
		}
		if (tagName == "SELECT") {
			var selectedValue = "";
			if (o1.options.selectedIndex >= 0) {
				selectedValue = o1.options[o1.options.selectedIndex].value;
			}
			s1 = selectedValue;
			return s1;
		}
		if (tagName == "TEXTAREA" && o1.style.display == "none") {
			// s1 = __EMP_AJAX_CHANGE_IMG(id);
			return obj.value;
		}
		if (tagName == "INPUT" && o1.getAttribute('ewa_tag') == 'IMG_UPLOAD') {
			// upload image
			if (EWA.CP != '/') {
				s1 = o1.value.replace(EWA.CP, "");
			} else {
				s1 = o1.value;
			}
			s1 = s1.replace('//', '/');
			return s1;
		}
		if (tagName == "INPUT" && o1.getAttribute('val_ref')) {
			// o1.getAttribute('ewa_tag') == 'ht5upload'
			// html5 upload or signature ...
			var ref_val = o1.getAttribute('val_ref');
			try {
				var rst = eval('(function(){var a=' + ref_val + ";return a;})()");
				s1 = rst;
			} catch (e) {
				console.log(ref_val);
				console.log(e);
				s1 = "";
			}
			return s1;
		}
		if (tagName == "INPUT" && (o1.type == 'checkbox' || o1.type == 'radio')) {
			// 对于复选内容只出现一个对象的处理
			if (o1.checked) {
				s1 = o1.value;
			} else {
				s1 = "";
			}
			return s1;
		}

		s1 = o1.value;

		if (s1 && this.isTrim(obj)) { //清除前后空格 20220623
			let s2 = s1.trim();
			if (s2 !== s1) {
				s1 = s2;
				// o1.value = s1; 放到失去焦点后触发，避免无法输入空格
			}
		}
		if (tagName !== "INPUT") {
			return s1;
		}
		if (!this.isNumber(obj)) {
			return s1;
		}
		if (s1 === "" || s1 === "-" || s1 === ".") {
			return;
		}
		if (isNaN(s1)) {
			s1 = s1.replace(/,/ig, ''); //删除千分位
			if (isNaN(s1)) {
				try {
					let v0 = EWA_Utils.chineseToNumber(s1);
					s1 = v0 + "";
					obj.value = s1;
				} catch (e) {
					return s1;
				}
			}
		}
		let format = this.getFormat(obj);
		if ("LeastMoney" == format || "Money" == format) { // 最短小数货币
			let vs = s1.split('.');
			if (vs.length == 1) {
				obj.value = (s1 * 1).fm(0);
			} else {
				obj.value = (s1 * 1).fm(vs[1].length) + (vs[1].length == 0 ? "." : "");
			}
		}
		return s1;
	};
}function EWA_FrameResourceDescription() {
	this.Lang=null;
	this.Info=null;
	this.Memo=null;
}

function EWA_FrameResoure() {
	this.Name=null;
	this.Descriptions = {};
	this.GetDescription = function() {
		var d = this.Descriptions[EWA.LANG];
		if (d == null) {
			for ( var a in this.Description) {
				return this.Description[a];
			}
		}
		return d;
	}
	this.GetInfo = function() {
		var d = this.GetDescription();
		if (d == null)
			return null;
		return d.Info;
	}
	this.GetMemo = function() {
		var d = this.GetDescription();
		if (d == null)
			return null;
		return d.Memo;
	}

}

function EWA_FrameResoures() {
	this.Init = function(xmlClass) {
		var res = xmlClass.GetElements("root/PageInfo");
		if (res == null) {
			return;
		}
		for (var i = 0; i < res.length; i += 1) {
			var r = new EWA_FrameResoure();
			r.Name = res[i].getAttribute('Name');
			var nl = xmlClass.GetElements("Set", res[i]);
			for (var m = 0; m < nl.length; m++) {
				var d = new EWA_FrameResourceDescription();
				d.Info = nl[m].getAttribute('Info');
				d.Memo = nl[m].getAttribute('Memo');
				d.Lang = nl[m].getAttribute('Lang');
				r.Descriptions[d.Lang] = d;
			}
			this[r.Name] = r;
		}
		this.ReplaceResById();
		this.ReplaceRes();
	};
	this.ReplaceResById = function() {
		for ( var name in this) {
			var o = this[name];
			var o1 = $X(name);
			if (!o1) {
				continue;
			}
			var t = o1.tagName.toLowerCase();
			if (t == 'input') {
				o1.value = o.GetInfo();
				o1.title = o.GetMemo();
			} else {
				o1.innerHTML = o.GetInfo();
				o1.title = o.GetMemo();
			}
		}
	}
	this.ReplaceRes = function() {
		var a = new Array();
		a.push(document.getElementsByTagName('div'));
		a.push(document.getElementsByTagName('span'));
		a.push(document.getElementsByTagName('input'));
		a.push(document.getElementsByTagName('button'));
		for (var m = 0; m < a.length; m++) {
			var objs = a[m];
			for (var i = 0; i < objs.length; i += 1) {
				var id = objs[i].getAttribute('res');
				if (id == null) {
					continue;
				}
				id = id.trim();
				if (id.indexOf('EWA.F.FOS') == 0 && (id.indexOf('.Resources.') > 0 || id.indexOf('.Resources[') > 0)) {
					var v = "";
					try {
						v = eval(id);
					} catch (e) {
						v = e.message;
					}
					if (objs[i].tagName == 'INPUT') {
						objs[i].value = v;
					} else {
						objs[i].innerHTML = v;
					}
				}
			}
		}
		a.length = 0;
		a = null;
	}
}
// --------------------class of Frame -------------------
function EWA_FrameClass() {
	this.Xml = null;
	this._Ajax = null;
	this.ItemList = new EWA_FrameCommonItems(); // EWA_01FrameCommonItems.js
	this.Resources = {};
	this.Url = null;
	this._ValidExOk = null;
	this._ValidExFail = null;
	this._ValidExObj = null;
	this._Id = null;
	// this.ReloadAfter = null; // POST后的事件，用户定义
	// 替代ReloadAfter
	this.doPostAfter = null;// POST后的事件，用户定义
	this.isShowPostWaitting = true; // 是否显示提交时的等待框

	this.textareaAutoSize = function() {
		// /third-party/autosize-master/dist/autosize.min.js
		if (!window.autosize) {
			console.warn('autosize.js 没有引入，/third-party/autosize-master/dist/autosize.min.js');
			return;
		}
		autosize(this.getObj('textarea').addClass('ewa-textarea-auto-size'));
	};

	this.getObj = function(exp) {
		var tb = $('#EWA_FRAME_' + this._Id);
		if (exp) {
			return tb.find(exp);
		} else {
			return tb;
		}
	};
	/**
	* 开关元素变化后调用的Action
	* @param source input[type=checkbox]元素
	* @param actionName 提交到后台的 action
	 */
	this.switchButtonAction = function(source, actionName) {
		if (!actionName) {
			return;
		}
		let u1 = this.getUrlClass();
		let data = {};
		data.ewa_switch_name = source.name;
		data.ewa_action = actionName;
		data.ewa_ajax = 'json';
		data.ewa_switch = source.checked ? 'on' : 'off';
		let parent = source.parentNode;
		let names = parent.getAttributeNames();
		// 附加父元素的属性，可在配置中定义元素属性
		for (let n in names) {
			let name = names[n];
			let val = parent.getAttribute(name);
			if (name.indexOf('on') == 0 || name == 'name' || name == 'id' || name == 'class') {
				continue;
			}
			data[name] = val;
		}
		let that = this;

		let u = u1.GetUrl();
		$JP(u, data, function(rst) {
			// 可以外部定义回调函数 extSwitchCallBack
			if (that.extSwitchCallBack) {
				that.extSwitchCallBack(source, rst);
			}
		});
	};
	/**
	 * 设置为禁止修改状态
	 */
	this.setDisable = function() {
		var tb = this.getObj();
		tb.find("input,textarea,select,label").each(function() {
			if (!this.disabled && this.type != 'hidden') {
				this.disabled = true;
				this.setAttribute("ewadisabled", 1);
			}
		});
		tb.find(".EWA_DHTML").each(function() {
			if (this.tagName == "DIV") { // 老版本的dhtml
				var iframe = $(this).find("iframe")[0].contentWindow;
				var tt = setInterval(function() {
					if (iframe.document.readyState == 'complete') {
						window.clearInterval(tt);
						iframe.frames[0].document.body.contentEditable = false;
						iframe.frames[0].document.body.style.backgroundColor = "#eee";
						var o = iframe.document.getElementsByClassName('but')[0];
						o.style.pointerEvents = 'none';
						o.style.filter = "grayscale(1) opacity(0.8)";
					}
				}, 300);
			} else if (this.tagName == "TEXTAREA") { // 新版本的h5
				var target = $(this).parent();
				var tt = setInterval(function() {
					var qiframe = target.find("iframe");
					if (qiframe.length > 0) {
						var iframe = qiframe[0].contentWindow;
						if (iframe && iframe.document.readyState == 'complete') {
							window.clearInterval(tt);
							iframe.document.body.contentEditable = false;
							iframe.document.body.style.backgroundColor = "#eee";

							target.find(".ewa-editor").attr('ewadisabled', 1);
						}
					}
				}, 300);
			}
		});
	};
	/**
	 * 设置为允许修改状态
	 */
	this.setEnable = function() {
		var tb = this.getObj();
		tb.find("input,textarea,select,label").each(function() {
			if (this.disabled && this.getAttribute("ewadisabled")) {
				this.disabled = false;
				this.removeAttribute("ewadisabled");
			}
		});
		tb.find(".EWA_DHTML").each(function() {
			if (this.tagName == "DIV") {
				var iframe = $(this).find("iframe")[0].contentWindow;
				iframe.frames[0].document.body.contentEditable = true;
				iframe.frames[0].document.body.style.backgroundColor = "";
				var o = iframe.document.getElementsByClassName('but')[0];
				o.style.pointerEvents = '';
				o.style.filter = "";
			} else if (this.tagName == "TEXTAREA") {
				var target = $(this).parent();
				var qiframe = target.find("iframe");
				var iframe = qiframe[0].contentWindow;
				iframe.document.body.contentEditable = true;
				iframe.document.body.style.backgroundColor = "";

				target.find(".ewa-editor").removeAttr('ewadisabled');
			}
		});
	};
	/**
	 * 将 checkbox 按照字母进行排序
	 * 
	 * @checkboxTargetId checkbox的id
	 * @filterTargetId 放置A-Z字母的位置
	 * @charFieldName 字母的json字段名称
	 * @isMergeCell 是否合并 checkboxTarget ，EWA_TD_L隐含，EWA_TD_M colspan=2
	 * @callBackConverted 转换完毕的回调成
	 * @callBackDoFilter 点击字母的回调
	 * 
	 */
	this.convertFilterCheckbox = function(checkboxTargetId, filterTargetId, charFieldName, isMergeCell,
		callBackConverted, callBackDoFilter) {
		var map = {};
		var trCheckBox = this.getObj('.ewa-row-' + checkboxTargetId);
		var trfilter = this.getObj('.ewa-row-' + filterTargetId);

		// 放置已经选择的checkbox
		var oChecked = $("<div class='ewa-filter-checked'></div>");
		trCheckBox.find('#' + checkboxTargetId).prepend(oChecked).addClass('ewa-filter-chks');

		var mainID = this._Id;
		function moveToChecked(obj) {
			var o = $('<nobr></nobr>');
			oChecked.append(o);
			oChecked.append(" ");

			var chkParent = $(obj).parent(); // nobr
			var id = $(obj).attr('id') + "_" + mainID;
			chkParent.attr('id', id);
			o.append(chkParent.children());
			o.attr('ref_id', id);
		}
		function moveToUnChecked(obj) {
			var chkParent = $(obj).parent();
			var ref_id = chkParent.attr('ref_id');
			if (ref_id) { // 没有表示不在 ewa-filter-checked 里
				$('#' + ref_id).append(chkParent.children());
				chkParent.remove();
			}
		}

		if (!charFieldName) {
			charFieldName = 'PY';
		}

		trCheckBox.find('input[type=checkbox]').each(function() {
			var o = JSON.parse($(this).attr('json'));
			var py = o[charFieldName]; // 获取字母
			if (!py) {
				return;
			}
			py = py.toUpperCase().trim().substring(0, 1);
			if (!map[py]) {
				map[py] = [];
			}
			map[py].push(this.id);

			if (this.checked) {
				moveToChecked(this)
			}

			$(this).on('change', function() {
				if (this.checked) {
					moveToChecked(this);
				} else {
					moveToUnChecked(this);
				}
			});
		});
		var codes = 'A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z'.split(',');
		var ss = ["<a class='ewa-filter-char ewa-filter-char-all' code=''>ALL</a>"];
		for (var n in codes) {
			var c = codes[n];
			var arr = map[c];
			if (!arr) {
				continue;
			}
			var s = "<a class='ewa-filter-char' code='" + c + "'>" + c + "<span class='ewa-filter-char-num'>("
				+ arr.length + ")</span></a>";
			ss.push(s);
		}
		trfilter.find('.EWA_TD_M').html(ss.join(" "));
		if (isMergeCell) {
			trCheckBox.find('.EWA_TD_L').hide();
			trCheckBox.find('.EWA_TD_M').attr('colspan', 2);
		}

		trfilter.find('a.ewa-filter-char').on('click', function() {
			var c = $(this).attr('code');
			trCheckBox.find('input[type=checkbox]').each(function() {
				if (c) {
					if (!this.checked) {
						if ($(this).parent().attr('ref_id')) {
							// 在 ewa-filter-checked 里
							moveToUnChecked(this);
						}
						$(this).parent().hide();
					} else {
						oChecked.append($(this).parent());
					}
				} else { // 显示全部
					$(this).parent().show();
				}
			});
			if (!c) {
				return;
			}
			var arr = map[c];
			for (var i = 0; i < arr.length; i++) {
				trCheckBox.find('#' + arr[i]).parent().show();
			}

			if (callBackDoFilter) {
				callBackDoFilter(this, trCheckBox, trfilter);
			}
		});

		if (callBackConverted) {
			callBackConverted(trCheckBox, trfilter);
		}
	};
	/**
	 * 通过ajax创建带字母过滤器的多选框,多用于人员筛选
	 * 
	 * @param checkboxTarget
	 *            放checkbox的对象
	 * @param filterTarget
	 *            放字母筛选的对象
	 * @param initvlas
	 *            用","分割的初始化值
	 * @param ajaxUrl
	 *            获取数据的ajax请求地址
	 * @param idName
	 *            值的字段名称,例如usr_id
	 * @param textName
	 *            显示的字段名称,例如usr_name
	 * @param pyName
	 *            用于筛选的字母字段
	 */
	this.createFilterCheckbox = function(checkboxTarget, filterTarget, initvals, ajaxUrl, idName, textName, pyName) {
		var c = this;
		$J(ajaxUrl, function(rst) {
			c.createFilterCheckboxByData(checkboxTarget, filterTarget, initvals, rst, idName, textName, pyName);
		});
	};
	/**
	 * 创建带字母过滤器的多选框,多用于人员筛选
	 * 
	 * @param checkboxTarget
	 *            放checkbox的对象
	 * @param filterTarget
	 *            放字母筛选的对象
	 * @param initvlas
	 *            用","分割的初始化值
	 * @param data
	 *            多行记录
	 * @param idName
	 *            值的字段名称,例如usr_id
	 * @param textName
	 *            显示的字段名称,例如usr_name
	 * @param pyName
	 *            用于筛选的字母字段
	 */
	this.createFilterCheckboxByData = function(checkboxTarget, filterTarget, initvals, data, idName, textName, pyName) {
		var pys = {};
		var init_vals = init_vals ? "[]" : initvals.split(',');

		// 初始化值的 map
		var init_vals_map = {};
		for (var n in init_vals) {
			var v = init_vals[n];
			init_vals_map[v] = 1;
		}

		var htmls = [];
		var htmls_checked = [];
		var id_prefix = checkboxTarget.id;
		for (var n in data) {
			var d = data[n];
			var id = d[idName];
			if (id) {
				id = id.replace(/</ig, '&lt;');
			}
			var text = d[textName];
			if (text) {
				text = text.replace(/</ig, '&lt;');
			}
			var py = d[pyName];
			var checked = init_vals_map[id]; // 是否选中

			var ckAdm = [];
			ckAdm.push("<nobr class='ewa-filter-chk' style='float:left;margin-right:4px'>");
			ckAdm.push("<input class=\"ewa-filter-chkbox\" type=\"checkbox\" ");
			if (checked) {
				ckAdm.push(" checked ");
			}
			var tid = id_prefix + "_" + n;
			ckAdm.push(" value=\"" + id + "\" id=\"" + tid + "\" name=\"" + id_prefix + "\"><label ");
			ckAdm.push(" for=\"" + tid + "\">" + text + "</label></nobr>");

			if (checked) {
				htmls_checked.push(ckAdm.join(""));
			} else {
				htmls.push(ckAdm.join(""));
			}
			if (filterTarget) {
				var pya = py ? py.substring(0, 1).toUpperCase() : "";
				if (!pys[pya]) {
					pys[pya] = [];
				}
				pys[pya].push(tid);
			}
		}

		checkboxTarget.innerHTML = htmls_checked.join(" ") + " " + htmls.join(" ");

		if (!filterTarget) {
			return;
		}
		var filters = ['<a href="javascript:void(0)">ALL</a>'];
		for (var n = 'A'.charCodeAt(); n <= 'Z'.charCodeAt(); n++) {
			var alpha = String.fromCharCode(n);
			if (pys[alpha]) {
				var s = '<a href="javascript:void(0)">' + alpha + '</a>';
				filters.push(s);
			}
		}
		filterTarget.innerHTML = filters.join(" ");
		$(filterTarget).find('a').each(function() {
			var alpha = $(this).text();
			if (alpha != 'ALL') {
				$(this).attr('ids', pys[alpha].join(","));
			}

			$(this).on('click', function() {
				if ($(this).text() == 'ALL') {
					$(checkboxTarget).find('nobr.ewa-filter-chk').show();
					return;
				}
				var ids = $(this).attr('ids').split(',');
				var ids_map = {};
				for (var n in ids) {
					ids_map[ids[n]] = 1;
				}
				$(checkboxTarget).find('input.ewa-filter-chkbox').each(function() {
					if (this.checked || ids_map[this.id]) {
						$(this).parent().show();
					} else {
						$(this).parent().hide();
					}
				});
			});
		});
	}
	/**
	 * 隐含没有内容的行
	 */
	this.hiddenNoContentRow = function() {
		var names = 'img,a,input[type=text],input[type=button],textarea';
		let tb = this.getObj();
		this.getObj('.EWA_TD_M').each(function() {
			if ($(this).text() == '') {
				if ($(this).find(names).length == 0) {
					$(this).parent().hide();

					// 用于上下排列的隐含
					var id = $(this).find("*:eq(0)").attr('id');
					if (id) {
						var cname = ".ewa-row-" + id;
						tb.find(cname).hide().attr('hiddennocontentrow', 1);
					}
				}
			}
		});
	};

	/**
	 * 重新刷新select的内容
	 * 
	 * @param itemName
	 *            select对象的名称（id）
	 * @param defaultValue
	 *            默认值
	 * @afterEvent 加载完成后的事件
	 */
	this.itemReload = function(itemName, defaultValue, afterEvent) {
		if (!itemName) {
			return;
		}
		var u1 = new EWA_UrlClass(this.Url);
		u1.AddParameter("EWA_AJAX", "SELECT_RELOAD");
		u1.AddParameter("EWA_RELOAD_ID", itemName);
		// 当前表单上的所有元素同时提交，避免因为上下元素关联出现问题
		this.getObj('input,select').each(function() {
			if (this.name == itemName) {
				return;
			}
			if (this.value.length < 100) {
				u1.AddParameter(this.name, this.value);
			}
		});
		var u = u1.GetUrl();
		var o = this.getObj("#" + itemName)[0];
		let map = {};
		// 记录刷新前的数据
		for (let i = 0; i < o.options.length; i++) {
			let opt = o.options[i];
			map[opt.value] = 1;
		}
		$J(u, function(rst) {
			if (!rst.RST) {
				$Tip(rst.ERR);
				return;
			}
			var items = rst.ITEM.LST;
			o.options.length = 0;
			let newCount = [];
			for (var n in items) {
				var item = items[n];
				if (item.V && map[item.V]) {
					// 对比刷新前的数据，新数据放在最前面
					continue;
				}
				var opt = new Option(item.T, item.V);
				if (item.json) {
					$(opt).attr("json", item.json);
				}
				o.options[o.options.length] = opt;
				newCount.push(opt);
				item._used = true;
			}
			for (var n in items) {
				var item = items[n];
				if (item._used) {
					continue;
				}
				// 添加老数据
				var opt = new Option(item.T, item.V);
				if (item.json) {
					$(opt).attr("json", item.json);
				}
				o.options[o.options.length] = opt;
			}
			if (defaultValue) {
				o.value = defaultValue;
			} else {
				for (let n in newCount) {
					if (newCount[n].value) {
						o.value = newCount[n].value;
						break;
					}
				}
			}
			if (afterEvent) {
				try {
					afterEvent(rst, o);
				} catch (e) {
					console.log(e);
				}
			}
		});
	};
	/**
	 * 检查option的变化
	 */
	this._checkSelectOptionsChange = function() {
		if (!this._SelectFilters) {
			return;
		}
		var c = this;
		if (this.isSelectFilter) {
			setTimeout(function() {
				c._checkSelectOptionsChange();
			}, 311);
		}
		for (var n in this._SelectFilters) {
			var o = this._SelectFilters[n];
			//var h = $($X(o.id)).html();
			let h = this.getObj('#' + o.id).html();
			if (h != o.html) {
				c._selectOptionsChangeed(o);
			}
		}
		setTimeout(function() {
			c._checkSelectOptionsChange();
		}, 311);
	};
	this._selectOptionsChangeed = function(o) {
		//console.log('changed')
		var target = this.getObj("select#" + o.id);

		var id1 = "initSelectFilter" + this._Id + "-" + o.id + "-filter";
		var id2 = "initSelectFilter" + this._Id + "-" + o.id + "-filter2";

		// 选择code
		var options = this._initSelectFilterCreateCode(o.codeJsonFrom || o.filterFrom, target);
		this.getObj('#' + id1).html(options);
		this.getObj('#' + id2).html("");
		o.html = target.html();
	};
	this._initSelectFilterCreateCode = function(codeJsonFrom, target) {
		var ss = ["<option value=''>-ALL-</option>"];
		if (!(codeJsonFrom)) {
			// 放置26个字母（A-Z）
			for (var a = 'A'.charCodeAt(); a <= 'Z'.charCodeAt(); a++) {
				var v = String.fromCharCode(a);
				ss.push('<option value="' + v + '">' + v + "</option>");
			}
		} else {
			var map = {};
			var arr = [];
			target.find("option").each(function() {
				if (this.value == '') {
					return;
				}
				var code;
				if (this.hasAttribute("para_" + codeJsonFrom)) {
					code = this.getAttribute("para_" + codeJsonFrom);
				} else if (this.getAttribute('json')) {
					var json = JSON.parse(this.getAttribute('json'));
					code = json[codeJsonFrom];
				}
				if (!code) {
					return;
				}
				if (!map[code]) {
					map[code] = 1;
					arr.push(code);
				} else {
					map[code] += 1;
				}
			});
			var arr1 = arr.sort();
			for (var n in arr1) {
				var v = arr1[n];
				v = v.replace(/>/ig, '&lt;').replace(/"/, '&quot;');
				ss.push('<option value="' + v + '">' + v + " [" + map[v] + "]</option>");
			}
		}

		return ss.join("");
	};
	/**
	 * 创建 select的 按照A-Z字母的筛选 ，字母判断来源为option的value,text或json
	 * 
	 * @param obj_id
	 *            来源的ID
	 * @param filterType
	 *            筛选的类型（value,text或json）
	 * @param filterFrom
	 *            如果是json的话，对应的字段
	 */
	this.initSelectFilter = function(obj_id, filterType, filterFrom, codeJsonFrom) {

		if (this["INIT_SELECT_FILTER" + obj_id]) { // 创建过了
			return;
		}

		this["INIT_SELECT_FILTER" + obj_id] = true;
		// console.log(obj_id, filterType, filterFrom);

		// 要做筛选的select
		var target = this.getObj("select#" + obj_id);
		// 筛选的select 所在的 TD
		var td = target.parent();

		var id1 = "initSelectFilter" + this._Id + "-" + obj_id + "-filter";
		var id2 = "initSelectFilter" + this._Id + "-" + obj_id + "-filter2";
		var id_tb = "initSelectFilter" + this._Id + "-" + obj_id + "-filter-table";

		if ($X(id_tb)) {
			td.append(target);
			$($X(id_tb)).remove();
		}
		// console.log(id_tb);
		td.addClass('ewa-select-filter');

		// 创建一个table,第一个单元格放字母的select和隐含的select(作为模板)，第二个单元格放 要做筛选的select
		var ss = ["<table id='" + id_tb + "' cellpadding=0 cellspacing=0 width=100%><tr>"
			+ "<td class='ewa-select-filter-char'>" + "<select class='EWA_SELECT' style='margin-right:4px' id='"
			+ id1 + "' onchange='EWA.F.FOS[\"" + this._Id + "\"]._chCode(this,\"" + filterType + "\",\""
			+ filterFrom + "\")'>"];

		// 选择code
		var options = this._initSelectFilterCreateCode(codeJsonFrom || filterFrom, target);
		ss.push(options);

		ss.push("</select><select id='" + id2 + "' style='display:none'></select></td>"
			+ "<td class='ewa-select-filter-target'></td></tr>" + "</table>");

		td.prepend(ss.join(''));
		td.find('.ewa-select-filter-target').append(target);

		if (!this._SelectFilters) {
			this._SelectFilters = {};
		}
		var o = {};
		o.html = target.html();
		o.id = obj_id;
		o.filterType = filterType;
		o.filterFrom = filterFrom;
		o.codeJsonFrom = codeJsonFrom;

		this._SelectFilters[o.id] = o;
	};

	/**
	 * select筛选发生变化时，显示不同的select列表（options）
	 */
	this._chCode = function(obj, filterType, filterFrom) {
		this.isSelectFilter = true;
		var hide = $(obj).next();
		var target = $(obj).parent().parent().find(".ewa-select-filter-target select");
		if (hide[0].options.length == 0) {
			hide.html(target.html());
		}
		if (obj.value == '') {
			target.html(hide.html());
			return;
		}
		var ss = ['<option></option>'];
		for (var i = 1; i < hide[0].options.length; i++) {
			var opt = hide[0].options[i];
			if (this._chCodeFilter(opt, filterType, filterFrom, obj.value)) {
				ss.push(GetOuterHTML(opt));
			}
		}

		target.html(ss.join(''));
		this._SelectFilters[target[0].id].html = target.html();

		this.isSelectFilter = false;
	};
	/**
	 * 检查option规定部分的首字母是否是规定字母（例如B）
	 */
	this._chCodeFilter = function(opt, filterType, filterFrom, chkValue) {
		var id;
		if (filterType == 'json') {
			var json = JSON.parse(opt.getAttribute('json'));
			var id = json[filterFrom];
			if (filterFrom == 'ADM_LID') {
				// 针对ADM_USER的特殊处理部分，遗留的问题，不改了
				var ids = id.split('.');
				id = ids[ids.length - 1];
			}
		} else if (filterType == 'text') {
			id = opt.text;
		} else {
			id = opt.value;
		}
		if (id) {
			var len = chkValue.length;
			if (id.substring(0, len).toUpperCase() == chkValue.toUpperCase()) {
				return true;
			} else {
				return false;
			}
		} else {
			return false;
		}
	};

	/**
	 * 设置为非必填项
	 */
	this.setUnMust = function(name) {
		var a = this.ItemList.Items[name.toUpperCase()];
		if (a) {
			var b = a.getElementsByTagName("IsMustInput")[0].getElementsByTagName("Set")[0];
			b.setAttribute("IsMustInput", 0);
		}
	};
	/**
	 * 设置必填项
	 */
	this.setMust = function(name) {
		var a = this.ItemList.Items[name.toUpperCase()];
		if (a) {
			var b = a.getElementsByTagName("IsMustInput")[0].getElementsByTagName("Set")[0];
			b.setAttribute("IsMustInput", 1);
		}
	};

	this.RedrawCreateSpans = function() {
		var trs = this.getObj('tr');
		for (var i = 0; i < trs.length; i++) {
			var tr = trs[i];
			if (tr.style.display == 'none') {
				continue;
			}
			var spans = 0;
			var isStart = false;
			for (var ia = tr.cells.length - 1; ia >= 0; ia--) {
				var td = tr.cells[ia];
				if (td.style.display == 'none') {
					if (isStart) {
						spans++;
					} else {
						spans = 1;
						isStart = true;
					}
				} else {
					if (isStart) {
						td.colSpan = spans + 1;
						isStart = false;
					}
				}
			}
		}
		// 改写脚本
		EWA_FrameShowAlert = EWA_FrameShowAlert1;
		EWA_FrameRemoveAlert = EWA_FrameRemoveAlert1;
		this.getObj('.ewa_d1').each(function() {
			this.title = this.innerHTML;
		});

		for (var name in this.ItemList.Items) {
			var dess = this.GetItemDescription(name);
			var memo = dess.Memo;
			if (memo != null && memo.trim().length > 0) {
				this.getObj('#' + name).attr('placeHolder', memo);
				this.getObj('#' + name).attr('title', memo);
			}
		}

		// 调整宽度
		this.RedrawChangWidth();
	};
	/**
	 * 获取元素的描述，Info和Memo
	 */
	this.GetItemDescription = function(itemName) {
		return this.ItemList.GetDescription(itemName);
	};
	this.ShowPlaceHolder = function(colSpan) {
		var tb = this.getObj ();
		tb.addClass('ewa-frame-cols-' + colSpan);
		for (var name in this.ItemList.Items) {
			// name 是大写，所以取真实id
			var real_name = this.ItemList.GetValue(name, "Name", 'Name');
			var o = this.GetObject(real_name);
			if (!o) {
				continue;
			}

			o = $(o);

			var dess = this.GetItemDescription(name);
			var memo = dess.Memo;
			var info = dess.Info;
			var ph = null;
			if (colSpan == 1) {
				ph = info;
				if (memo != null && memo.trim().length > 0) {
					if (memo != ph) {
						if (o.attr('ewa_tag') == 'smsValid') { // 短信验证码
							ph = memo;
						} else {
							// memo信息放到对象的下部
							//var memoStr = "<div class='ewa-item-memo'>" + memo + "</div>";
							//o.parentsUntil('tr').last().append(memoStr); // td
							ph += ", " + memo;
						}
					}
				}
				if (o.hasClass('ewa-switch')) {
					o.prepend("<div class='ewa-switch-info'>" + ph + "</div>");
				}
			} else if (colSpan == 2) {
				if (memo != null && memo.trim().length > 0) {
					ph = memo;
				}
			}

			if (!ph) {
				continue;
			}

			if (o[0].type == 'hidden') {
				o.prev().attr('placeholder', ph); // ddl
			} else if (o[0].tagName == 'SELECT') {
				if (o[0].options.length > 0 && o[0].options[0].value == '') {
					o[0].options[0].text = "-- " + ph + " --";
					o[0].options[0].value = '';
				}
			} else {
				o.attr('placeHolder', ph);
				o.attr('title', ph);
			}
		}
	};
	// 调整宽度
	this.RedrawChangWidth = function() {
		let tb = this.getObj ();
		let tb_width = tb.width();
		let cols = tb.find('.ewa_msg_box')[0].colSpan / 2;
		let info_width = 90;
		$("#EWA_FRAME_" + this._Id + ">tbody>tr[class*='ewa-row-']:not('.ewa-row-msg-box')").each(function() {
			let info_cols = $(this).find("td.ewa_redraw_info:visible").length;
			let ctl_width = (tb_width - info_width * info_cols) / cols;
			$(this).find("td.ewa_redraw_ctl:visible").each(function() {
				let colspan = this.colSpan || 1;
				$(this).css('width', ctl_width * colspan);
			});
		});

		var c = this;
		addEvent(window, 'size', function() {
			c.RedrawChangWidth();
		});
	};
	this.Mearge = function(fromId, toId, mergeStr) {
		console.log('拼写错误：请用 Merge');
		this.Merge(fromId, toId, mergeStr);
	};
	this.Merge = function(fromId, toId, mergeStr) {
		if (!fromId && !toId) {
			return;
		}
		var p = this.getObj ();
		var from = p.find('#' + fromId);
		var to = p.find('#' + toId);
		if (from.length == 0) {
			console.log('Mearge:' + fromId + '不存在');
			return;
		}
		if (to.length == 0) {
			console.log('Mearge:' + toId + '不存在');
			return;
		}

		var is_double = false;

		var t = p.find('.ewa-row-' + toId + ' .EWA_TD_M');
		var t0 = null;
		if (t.length == 0) { // textarea
			is_double = true;
			t = p.find('.ewa-row-' + toId + ' .EWA_TD_1'); // 对象所在 tr
			t0 = p.find('.ewa-row-' + toId + ' .EWA_TD'); // 提示信息 tr
			if (t0.length == 1) {
				is_double = true;
			}

			var html = t0.html();
			t0
				.html("<table cellpadding=0 cellspacing=0 width=100%>"
					+ "<tr><td style='width:50%'></td><td style='display:none'></td><td style='width:50%'></td></tr></table>");
			t0.find('td:eq(0)').html(html);
		}
		if (t.length == 0) {
			alert('target parent not exists');
			return;
		}

		var frompadding = from.css('box-sizing') == 'border-box' ? 0
			: (from.css('padding-left').replace('px', '') * 1 + from.css('padding-right').replace('px', '') * 1);

		var topadding = from.css('box-sizing') == 'border-box' ? 0 : (to.css('padding-left').replace('px', '') * 1 + to
			.css('padding-right').replace('px', '') * 1);

		p.find('.ewa-row-' + fromId).hide();

		if (mergeStr == null) {
			mergeStr = " - ";
		}
		var w = t.width();
		var fromType = from[0].tagName;
		var toType = to[0].tagName;

		if (from.parent().hasClass('ewa-select-filter-target')) { // 选择带字母分类
			from = p.find('.ewa-row-' + fromId + ' .EWA_TD_M table:eq(0)');
			fromType = 'SELECT_WITH_FILTER'
		}
		var mstr_w = 0;
		var mstr = null;
		if (mergeStr) { // 分割字符
			t.append('<span class="mearge-span">' + mergeStr + '</span>');
			if (is_double) {
				t0.find("table:eq(0) td:eq(1)").html('<span class="mearge-span">' + mergeStr + '</span>').show();
			}
			mstr = t.find('.mearge-span');
			mstr_w = mstr.width() + 1 + mstr.css('padding-left').replace('px', '') * 1
				+ mstr.css('padding-right').replace('px', '') * 1 + mstr.css('margin-left').replace('px', '') * 1
				+ mstr.css('margin-right').replace('px', '') * 1;
		}
		if (fromType == toType) {
			var w0 = (w - mstr_w) / 2 - frompadding - 2;
			from.css('width', w0);
			to.css('width', w0);
			if (is_double) {// textarea
				t0.find("table:eq(0) td:eq(2), table:eq(0) td:eq(0)").css('width', w0);
			}
		} else if (fromType == 'SELECT') {
			from.css('width', 100);
			to.css('width', w - mstr_w - frompadding - topadding - 2 - 2 - from.width());
		} else if (fromType == 'SELECT_WITH_FILTER') {
			from.css('width', 200);
			to.css('width', w - mstr_w - frompadding - topadding - 2 - 2 - from.width());
		} else if (toType == 'SELECT') {
			to.css('width', 100);
			from.css('width', w - mstr_w - frompadding - topadding - 2 - 2 - from.width());
		}
		to.css('float', 'left');
		if (mstr) {
			mstr.css('float', 'left');
		}
		from.css('float', 'right');
		t.append(from);
		t.addClass('ewa-frame-merge');

		if (is_double) {
			var txt = p.find('.ewa-row-' + fromId + ' .EWA_TD').html();
			t0.find('table:eq(0) td:eq(2)').html(txt);
		}
	};
	/**
	 * 合并表达式
	 * 
	 * @param toParent
	 *            防止合并内容的容器
	 * @param mergeExp
	 *            合并表达式
	 * @param isAddMemo
	 *            是否添加备注信息
	 * @func 执行完调用的程序
	 */
	this.MergeExp = function(toParent, mergeExp, isAddMemo, func) {
		if (!mergeExp) {
			console.log("mergeExp 没有设置");
			return;
		}
		// meargeExp="@id1 x @id2 = @id3 (@id4)"
		var r1 = /\@\@[a-zA-Z0-9\-\._:]*\b/ig;
		var m1 = mergeExp.match(r1);
		var paras = [];
		var tmp_html = mergeExp;
		var memos = {};
		var tb = this.getObj ();
		for (var i = 0; i < m1.length; i++) {
			var key = m1[i];
			paras.push(key);
			var id = key.replace('@@', '');
			tmp_html = tmp_html.replace(key, "<span class='ewa-row-merge ewa-row-merge-" + id + "' mid=\"" + key
				+ "\"></span>");
			if (id != toParent) {
				tb.find('.ewa-row-' + id).hide();
			}
			memos[id] = this.GetItemDescription(id).Info;
		}
		// console.log(memos);
		// console.log(paras);

		// console.log(tmp_html);

		// 临时容器
		var o1 = document.createElement('div');
		o1.style.display = 'none';
		o1.innerHTML = tmp_html;
		document.body.appendChild(o1);
		// console.log(o1);
		var target = tb.find('[id="' + toParent + '"]');
		if (target.length == 0) {
			console.log('not find ' + toParent);
			return;
		}

		// 合并对象的容器
		var p = target.parent();

		var tmp = mergeExp;
		for (var n in paras) {
			var exp = paras[n];
			var key = exp.replace('@@', '');
			var o = tb.find('[id="' + key + "\"]");
			if (o.length == 0) {
				console.log('not found [id=' + key + "]");
				continue;
			}

			var t = $(o1).find('span[mid="' + exp + '"]');
			if ('placeholder' == isAddMemo) {
				o.attr('placeholder', memos[key]);
			} else if (isAddMemo) {
				t.append("<span class='ewa-row-merge-memo'></span>");
				t.find('.ewa-row-merge-memo').text(memos[key]);
			}
			t.append(o);
		}
		while (o1.childNodes.length > 0) {
			p.append(o1.childNodes[0]);
		}
		$(o1).remove();

		if (func) {
			func(p);
		}
	};
	this.MergeItems = function() {
		for (var n in this.MeargeMap) {
			var m = this.MeargeMap[n];
			var o1 = $X('_ewa_tr$' + n);
			if (!o1) {
				continue;
			}
			var span = o1.cells.length;
			var pp = $(o1.cells[0]);
			while (o1.cells.length > 1) {
				pp.append(o1.cells[1].innerHTML);
				o1.removeChild(o1.cells[1]);
			}
			o1.cells[0].colSpan = span;

			var ss = [];
			for (var i = 0; i < m.length; i++) {
				var o2 = $X('_ewa_tr$' + m[i]);

				// console.log(o2)
				var ss1 = ["<nobr>"];

				for (var k = 0; k < o2.cells.length; k++) {
					ss1.push(o2.cells[k].innerHTML);
				}
				ss1.push("</nobr>");
				ss.push(ss1.join(" "));

				o2.parentNode.removeChild(o2);
			}
			pp.append(ss.join(" "));
		}
	};

	this.LoadJson = function(actionName, func) {
		if (actionName == null) {
			return;
		}
		var u = this.Url + '&EWA_ACTION=' + actionName + '&EWA_AJAX=JSON';
		$J(u, func);
	};

	/**
	 * 调用ACTION
	 * 
	 * @param obj
	 *            调用DoAction的HTML对象
	 * @param action
	 *            调用的Action名称
	 * @param confirm
	 *            执行前确认的信息 _EWA_INFO_MSG定义
	 * @param tip
	 *            执行后提示的信息 _EWA_INFO_MSG定义
	 * @param parasArray
	 *            附加的参数数组, 参数用对象表示para.Name, para.Value
	 * @param afterJs
	 *            执行后调用的脚本
	 */
	this.DoAction = function(obj, action, confirm, tip, parasArray, afterJs) {
		EWA.F.CID = this._Id;
		if (action == null || action.trim() == "") {
			// alert("action not value");
			return;
		}

		if (confirm != null && confirm.trim().length > 0) {
			var msg = _EWA_INFO_MSG[confirm];
			if (!(msg == null || msg == "")) {
				if (!window.confirm(msg)) {
					return;
				}
			} else {
				if (!window.confirm(confirm)) {
					return;
				}
			}
		}
		this.DoPostBefore();

		this._Ajax = this.CreateAjax(null, true);
		this._Ajax.LoadingType = "image";
		this._Ajax.AddParameter("EWA_AJAX", "1");
		this._Ajax.AddParameter("EWA_ACTION", action);
		this._Ajax.AddParameter("EWA_ID", this._Id);
		this._Ajax.AddParameter("EWA_NO_CONTENT", "1");
		this._Ajax.AddParameter("EWA_ACTION_TIP", tip);

		if (afterJs != null && afterJs.trim().length > 0) {
			this._Ajax.AddParameter("EWA_AFTER_EVENT", afterJs);
			// DoAction 指定了提交后的脚本，阻止页面重新加载
			this.StopAjaxAfterReload = true;
			this._Ajax.AddParameter("EWA_ACTION_RELOAD", "0");
		} else {
			this.StopAjaxAfterReload = false;
		}

		if (parasArray != null && parasArray.length > 0) { // 附加的参数
			for (var i = 0; i < parasArray.length; i += 1) {
				this._Ajax.AddParameter(parasArray[i].Name, parasArray[i].Value);
			}
		}
		var url = new EWA.C.Url();
		url.SetUrl(this.Url);
		var u = url.RemoveParameter("EWA_ACTION");
		this._Ajax.PostNew(u, EWA.F.FOS[EWA.F.CID]._CallBackJs);
	};
	this.GuideShowCreate = function(infos) {
		this._GroupInfos = infos;

		var tb = $X('EWA_FRAME_' + this._Id);
		var maxIdx = infos.length - 1;

		tb.setAttribute('EWA_GUIDE_IDX', "0");
		tb.setAttribute('EWA_GUIDE_IDX_MAX', maxIdx);

		// 隐藏按钮
		var row1 = tb.rows[tb.rows.length - 1];
		row1.style.display = 'none';
		if (tb.clientHeight > 100) {
			tb.parentNode.style.height = tb.clientHeight + 'px';
		}
		// 添加向导按钮
		var ipt0 = document.createElement("input");
		ipt0.id = "ewa_but_" + Math.random();
		ipt0.type = "button";
		ipt0.value = (EWA.LANG == 'enus') ? "Back" : "上一步";
		ipt0.style.display = 'none';
		ipt0.onclick = function() {
			var idx = tb.getAttribute('EWA_GUIDE_IDX');
			if (idx * 1 == 0) {
				$Tip('到头了');
				return;
			}
			var id = tb.id.replace('EWA_FRAME_', '');
			// 执行下一步执行前的事件
			if (EWA.F.FOS[id].GuidePrevBefore) {
				EWA.F.FOS[id].GuidePrevBefore(idx, this, tb);
			}
			EWA.F.FOS[id].GuideShow(idx * 1 - 1);

			// 执行下一步执行后的事件
			if (EWA.F.FOS[id].GuidePrevAfter) {
				EWA.F.FOS[id].GuidePrevAfter(idx, this, tb);
			}
		};
		var ipt1 = document.createElement("input");
		ipt1.id = "ewa_but_" + Math.random();
		ipt1.type = "submit";
		ipt1.value = EWA.LANG == 'enus' ? "Next" : "下一步";
		ipt1.onclick = function() {
			var idx = tb.getAttribute('EWA_GUIDE_IDX');
			var id = tb.id.replace('EWA_FRAME_', '');
			if (EWA.F.FOS[id].GuideShowCheck(idx)) {
				// 执行下一步执行前的事件
				if (EWA.F.FOS[id].GuideNextBefore) {
					EWA.F.FOS[id].GuideNextBefore(idx, this, tb);
				}
				if (this.getAttribute('ewa_guide_method') == 'ok') {
					$F(tb, 'input', 'type', 'submit')[0].click();
				} else {
					EWA.F.FOS[id].GuideShow(idx * 1 + 1);
				}
				// 执行下一步执行后的事件
				if (EWA.F.FOS[id].GuideNextAfter) {
					EWA.F.FOS[id].GuideNextAfter(idx, this, tb);
				}
			}
		};
		// 上层表添加一行放向导按钮
		let parentTable = tb.parentNode.parentNode.parentNode.parentNode.parentNode;
		var row2 = parentTable.insertRow(-1);
		var td = row2.insertCell(-1);

		td.appendChild(ipt0);
		td.appendChild(ipt1);
		td.className = "EWA_FRAME_GROUP_BUTTONS";

		// 上层表添加一行 提示行
		var rowTitle = parentTable.insertRow(0);
		tdTitle = rowTitle.insertCell(-1);
		var id1 = 'ewa_title_' + Math.random();
		var titles = [];
		for (var i = 0; i < this._GroupInfos.length; i++) {
			var a = '<div style="float:left" id="ewa_' + this._Id + '_' + i + '">' + (i + 1) + ". "
				+ this._GroupInfos[i].DES + '</div>';
			titles.push(a);
		}
		tdTitle.innerHTML = "<div style='text-align:left'>"
			+ titles.join(" <div style='float:left;color:#aaa'>&nbsp;&gt;&nbsp;</div> ") + "</div><div id='" + id1
			+ "'></div>";
		tdTitle.className = 'EWA_FRAME_GROUP_TITLE';
		tb.setAttribute('EWA_GUIDE_ID_PREV', ipt0.id);
		tb.setAttribute('EWA_GUIDE_ID_NEXT', ipt1.id);
		tb.setAttribute('EWA_GUIDE_ID_TITLE', id1);

		this.GuideShowTitle(0);

		var div = document.createElement("div");
		if (tb.clientHeight > 100) {
			div.style.width = tb.clientWidth + 'px';
			div.style.height = tb.clientHeight + 20 + 'px';
			div.style.overflow = 'auto';
		}
		tb.parentNode.appendChild(div);
		div.appendChild(tb);
		tb.parentNode.className = "EWA_GROUP_GUIDE";
	};
	this.GuideShowTitle = function(idx) {
		var tb = $X('EWA_FRAME_' + this._Id);
		// var tdTitle=$X(tb.getAttribute('EWA_GUIDE_ID_TITLE'));
		// var nums=['一','二','三','四','五','六','七','八','九','十'];
		// tdTitle.innerHTML="<div>第"
		// +nums[idx]+"步 "+ this._GroupInfos[idx].DES+"</div>";
		var maxIdx = tb.getAttribute('EWA_GUIDE_IDX_MAX');
		for (var i = 0; i <= maxIdx; i++) {
			var id = 'ewa_' + this._Id + '_' + i;
			if (i == idx) {
				$X(id).style.color = 'blue';
				$X(id).style.borderBottom = '2px solid green';
			} else {
				$X(id).style.color = 'green';
				$X(id).style.borderBottom = '2px';
			}
		}

	};

	this.GuideShowCheck = function(idx) {
		var isOk = true;

		var firstObj = null;
		for (var name in this.ItemList.Items) {
			var node = this.ItemList.Items[name];
			var name1 = this.ItemList.GetItemValue(node, "Name", "Name");

			var obj = this.getObj("#" + name1);
			if (obj.length == 0) {
				//alert(name1 + ' not exists');
				continue;
			}
			obj = obj[0];
			var tr = this._GetTr(obj);
			if (tr == null) {
				continue;
			}
			if (tr.getAttribute('groupindex') == idx) {
				isOk = isOk & this.CheckValid(obj);
				if (!isOk && firstObj == null) {
					firstObj = obj;
				}
			}
		}

		if (firstObj != null) {
			firstObj.focus();
		}
		return isOk;
	};
	this._GetTr = function(obj) {
		var inc = 0;
		var o = obj;
		while (inc < 100) {
			inc++;
			o = o.parentNode;
			try {
				if (o.tagName.toUpperCase() == 'TR' && o.getAttribute('id') != null
					&& o.getAttribute('id').indexOf('_ewa_tr$') == 0) {
					return o;
				}
			} catch (e) {
				return null;
			}
		}
		return null;
	};
	this.GuideShow = function(idx) {

		this.GuideShowTitle(idx);

		var tb = $X('EWA_FRAME_' + this._Id);
		var curIdx = tb.getAttribute('EWA_GUIDE_IDX');

		if (curIdx == idx) {
			return;
		}
		var maxIdx = tb.getAttribute('EWA_GUIDE_IDX_MAX');
		var idPrev = tb.getAttribute('EWA_GUIDE_ID_PREV');
		var idNext = tb.getAttribute('EWA_GUIDE_ID_NEXT');
		if (idx == maxIdx) {
			$X(idNext).value = EWA.LANG == 'enus' ? "Confirm" : '确定';
			$X(idNext).setAttribute('ewa_guide_method', 'ok');
		} else {
			$X(idNext).value = EWA.LANG == 'enus' ? "Next" : '下一步';
			$X(idNext).setAttribute('ewa_guide_method', '');
		}
		if (idx == 0) {
			$X(idPrev).style.display = 'none';
		} else {
			$X(idPrev).style.display = '';
		}
		tb.setAttribute('EWA_GUIDE_IDX', idx);
		this._ShowHidenGroup(tb, idx);

	};
	this._ShowHidenGroup = function(tb, newIdx) {
		for (var i = 0; i < tb.rows.length - 1; i++) {
			var row = tb.rows[i];
			var idx = 0;
			if (row.getAttribute('groupIndex') != null && row.getAttribute('groupIndex') != '') {
				idx = row.getAttribute('groupIndex') * 1;
				if (newIdx == idx) {
					row.style.display = '';
				} else {
					row.style.display = 'none';
				}
			}
		}
	};
	this.GroupShow = function(obj, grpIdx) {
		if (obj.className.indexOf('1') > 0) {
			return;
		}
		// 切换前处理 2017-10-25 郭磊
		if (this.GroupShowBefore) {
			this.GroupShowBefore(obj, grpIdx);
		}

		var tb = $X('EWA_FRAME_' + this._Id);
		var objParentTr = obj.parentNode.parentNode;
		for (var i = 0; i < tb.rows.length; i++) {
			var row = tb.rows[i];
			if (row == objParentTr) {
				continue;
			}
			// 按钮行
			if (row.cells.length == 1 && row.cells[0].className && row.cells[0].className.indexOf('EWA_TD_B') >= 0) {
				continue;
			}
			// hiddenNoContentRow 执行隐含的行
			if (row.getAttribute('hiddennocontentrow') == '1') {
				continue;
			}
			var idx = 0;
			if (row.getAttribute('groupIndex') != null && row.getAttribute('groupIndex') != '') {
				idx = row.getAttribute('groupIndex') * 1;
			}
			if (grpIdx == idx) {

				row.style.display = '';
			} else {
				row.style.display = 'none';
			}
		}
		var objs = objParentTr.getElementsByTagName('div');
		for (var i = 0; i < objs.length; i++) {
			var o = objs[i];
			if (o == obj) {
				o.className = o.className + '1';
			} else {
				o.className = o.className.replace('1', '');
			}
		}
		// 切换后处理 2017-10-25 郭磊
		if (this.GroupShowAfter) {
			this.GroupShowAfter(obj, grpIdx);
		}
	};
	/**
	 * 调用JSON
	 * 
	 * @param {String}
	 *            action 调用的Action名称
	 * @param {String}
	 *            jsonName 返回Json的名称
	 * @param {Array}
	 *            parasArray 参数数组 Name,Value对象数组
	 * @param {Function}
	 *            afterJs 执行后调用的Js
	 */
	this.DoActionJSON = function(action, jsonName, parasArray, afterJs) {
		EWA.F.CID = this._Id;

		this._Ajax = new EWA.C.Ajax();
		this._Ajax.LoadingType = "image";
		this._Ajax.AddParameter("EWA_AJAX", "JSON");
		this._Ajax.AddParameter("EWA_ACTION", action);
		this._Ajax.AddParameter("EWA_ID", this._Id);
		this._Ajax.AddParameter("EWA_JSON_NAME", jsonName);
		if (afterJs != null) {
			this._AjaxJsonAfter = afterJs;
		} else {
			this._AjaxJsonAfter = null;
		}

		if (parasArray != null && parasArray.length > 0) { // 附加的参数
			for (var i = 0; i < parasArray.length; i += 1) {
				this._Ajax.AddParameter(parasArray[i].Name, parasArray[i].Value);
			}
		}
		var url = new EWA.C.Url();
		url.SetUrl(this.Url);
		var u = url.RemoveParameter("EWA_ACTION");
		this._Ajax.PostNew(u, EWA.F.FOS[EWA.F.CID]._CallBackJs);
	};

	this._CallBackJs = function() {
		var ewa = EWA.F.FOS[EWA.F.CID];
		var ajax = ewa._Ajax;
		if (ajax._Http.readyState != 4) {
			ajax = null;
			return;
		}
		ajax.HiddenWaitting();

		if (ajax._Http.status == 200) {
			var ret = ajax._Http.responseText;
			if (EWA.F.CheckCallBack(ret)) {
				eval(ret);
				if (ewa._AjaxJsonAfter) {
					ewa._AjaxJsonAfter();
					ewa._AjaxJsonAfter = null;
				}
				// guolei 2017-04-17
				try {
					if (ewa.ReloadAfter) {
						ewa.ReloadAfter(ret);
					}
					// eval(ret);
				} catch (e) {
					alert(ret);
				}
			}
		} else {
			alert("ERROR:\r\n" + ajax._Http.statusText);
		}
		ajax = null;
	};
	/**
	 * 覆盖Frame的提示信息
	 * 
	 * @param {Array}
	 *            infoJson 信息对象
	 * @param {String}
	 *            idName id名称
	 * @param {String}
	 *            infoName info字段名称
	 * @param {String}
	 *            memoName memo字段名称
	 * @param cb 循环info回调的方法，p0当前tr，p1当前info, p2当前序号
	 * @return 影响的Tr数组
	 */
	this.RewriteInfo = function(infoJson, idName, infoName, memoName, cb) {
		var tb = $('this.getObj()_' + this._Id);
		var arr = [];
		idName = idName || "id";
		infoName = infoName || "info";
		memoName = memoName || "memo";
		for (var i = 0; i < infoJson.length; i++) {
			var v = infoJson[i];
			var id = v[idName];
			var target = tb.find('#' + id);
			if (target.length == 0) {
				continue;
			}
			var tr = target.parentsUntil('tr[show_msg]').last().parent();
			if (v[infoName] == null || v[infoName].trim() == '') {
				tr.hide();
				if (cb) {
					cb(tr[0], v, i);
				}
				continue;
			}
			if (tr[0].cells.length == 3) {
				arr.push(tr[0]);
				tr[0].cells[2].innerHTML = v[memoName];
				tr[0].cells[0].innerHTML = v[infoName];
				if (cb) {
					cb(tr[0], v, i);
				}
			} else if (tr[0].cells.length == 2) {
				arr.push(tr[0]);
				tr[0].cells[0].innerHTML = v[infoName];
				if (cb) {
					cb(tr[0], v, i);
				}
			} else if (tr[0].cells.length == 1) {
				var tr1 = tr.prev();
				if (tr1[0].cells.length > 1) {
					tr1[0].cells[1].innerHTML = v[memoName];
				}
				arr.push(tr1[0]);
				tr1[0].cells[0].innerHTML = v[infoName];
				if (cb) {
					cb(tr1[0], v, i);
				}
			}

		}
		return arr;
	};

	this._HiddenMemo = function(obj, tb) {
		var td = obj.parentNode
		var tr = td.parentNode;
		var isNone = false;
		if (tr.style.display == 'none') {
			isNone = true;
		}
		tr.style.display = 'none';
		tr.id = 'tr_' + obj.id;
		var tr1 = tr.previousSibling;
		if (tr1.nodeType == 3) {
			tr1 = tr1.previousSibling;
		}
		tr1.style.display = 'none';

		var id1 = obj.id;
		var s1 = '<span id=tab_' + id1 + ' class="ewa_merge_tab" onclick="EWA.F.FOS[\'' + this._Id
			+ '\'].ShowMemo(this.id);">' + tr1.cells[0].innerHTML + '</span>';

		return isNone ? "" : s1;
	};
	this.ShowMemo = function(id) {
		var tabs = $X(this._Id + '__ewa_meger').getElementsByTagName('SPAN');
		for (var i = 0; i < tabs.length; i++) {
			var id1 = tabs[i].id.replace('tab_', 'tr_');
			if (tabs[i].className == 'ewa_merge_tab1') {
				tabs[i].className = 'ewa_merge_tab';
				$X(id1).style.display = 'none';
			}

			if (tabs[i].id == id) {
				tabs[i].className = 'ewa_merge_tab1';
				$X(id1).style.display = '';
			}
		}
	};
	/**
	 * 合并备注字段
	 */
	this.MergeMemo = function() {
		var tb = $X('EWA_FRAME_' + this._Id);
		var objs = tb.getElementsByTagName('textarea');
		if (objs.length == 0) {
			return;
		}
		if (objs[0].getAttribute('ewa_merge') == "1") {
			return;
		}
		var s = [];
		for (var i = 0; i < objs.length; i++) {
			var ss = this._HiddenMemo(objs[i]);
			ss = '<nobr>' + ss.replace('• ', '').trim() + '</nobr>';
			s.push(ss);
		}

		var obj = objs[0];
		var td = obj.parentNode;
		var tr = td.parentNode;
		var tr1 = tr.previousSibling;
		if (tr1.nodeType == 3) {
			tr1 = tr1.previousSibling;
		}
		tr1.id = this._Id + '__ewa_meger';
		// tr1.deleteCell(0);
		tr1.cells[0].colSpan = 3;
		tr1.cells[0].innerHTML = s.join('');
		tr1.cells[0].style.width = '100%';
		tr1.cells[0].style.height = '25px';
		tr1.style.display = '';
		tr.style.display = '';
		$X('tab_' + obj.id).className = 'ewa_merge_tab1';

		if (window._EWA_DialogWnd != null) {
			EWA.UI.Dialog._SetTitle(window._EWA_DialogWnd);
		}
	};

	/**
	 * 扩展验证
	 * 
	 * @param {Object}
	 *            验证对象
	 * @param {String}
	 *            验证模式 Js 或 Action
	 * @param {Object}
	 *            调用的 Js
	 * @param {Object}
	 *            调用的 Action
	 * @param {Object}
	 *            验证成功信息
	 * @param {Object}
	 *            验证失败信息
	 */
	this.DoValidEx = function(obj, vxMode, vxJs, vxAction, vxOk, vxFail) {
		if (obj.value == "") {
			return;
		}
		this._ValidExOk = this.Resources[vxOk];
		this._ValidExFail = this.Resources[vxFail];
		this._ValidExObj = obj;
		if (vxMode.toLowerCase().trim() == "action") {
			this._DoValidExAction(obj, vxAction, this.Resources[vxOk].GetInfo(), this.Resources[vxFail].GetInfo());
		} else {// 脚本验证
			if (vxJs.indexOf('&quot;') >= 0) {
				vxJs = vxJs.replace(/\&quot\;/ig, '"');
			}
			var a = eval(vxJs); // 调用脚本，返回true or false
			if (a) {
				EWA_FrameShowAlert(obj, this._ValidExOk.GetInfo());
				obj.setAttribute('EWA_VALID_EX', "");
			} else {
				EWA_FrameShowAlert(obj, this._ValidExFail.GetInfo());
				obj.setAttribute('EWA_VALID_EX', this._ValidExFail.GetInfo());
			}
		}
	};
	this._DoValidExAction = function(obj, vxAction, okmsg, errmsg) {
		if (obj == null) {
			return;
		}

		if ($(obj).is(":hidden")) { // 隐含了
			return;
		}

		if (vxAction == null || vxAction.trim() == "") {
			alert("action not value");
			return;
		}

		var tag = obj.id + "," + obj.value;
		if (this["DoValidExAction_RETS"] && this["DoValidExAction_RETS"][tag] != null) {
			var a = this["DoValidExAction_RETS"][tag];
			if (a == 0) {
				EWA_FrameRemoveAlert(obj, okmsg);
				obj.setAttribute('EWA_VALID_EX', "");
			} else {
				EWA_FrameShowAlert(obj, errmsg);
				obj.setAttribute('EWA_VALID_EX', errmsg);
			}

			return;
		}
		var _Ajax = new EWA.C.Ajax();
		_Ajax.LoadingType = "image";
		_Ajax.AddParameter("EWA_AJAX", "HAVE_DATA"); // 是否有数据，如果有返回1，否则返回0
		_Ajax.AddParameter("EWA_ACTION", vxAction);
		_Ajax.AddParameter("EWA_ID", this._Id);
		_Ajax.AddParameter("EWA_NO_CONTENT", "1");
		_Ajax.AddParameter(obj.id, obj.value);

		if (!this["DoValidExAction_RETS"]) {
			this["DoValidExAction_RETS"] = {};
		}

		var c = this;

		_Ajax.PostNew(this.Url, function() {
			if (_Ajax._Http.readyState != 4) {
				return;
			}
			_Ajax.HiddenWaitting();
			if (_Ajax._Http.status == 200) {
				var ret = _Ajax._Http.responseText;
				if (EWA.F.CheckCallBack(ret)) {
					// obj.setAttribute('show_alert', 0);
					try {

						var a = parseInt(ret.trim());
						c["DoValidExAction_RETS"][tag] = a;
						if (a == 0) {
							EWA_FrameRemoveAlert(obj, okmsg);
							obj.setAttribute('EWA_VALID_EX', "");
						} else {
							EWA_FrameShowAlert(obj, errmsg);
							obj.setAttribute('EWA_VALID_EX', errmsg);
						}
					} catch (e) {
						alert(e + ',' + ret);
					}
				}
			} else {
				alert("ERROR:\r\n" + _Ajax._Http.statusText);
			}
			_Ajax = null;
		});
	};

	this.ValidCodeError = function(isHiddenAlert) {
		let t0 = this._t_ValidCodeError || 0;
		let t1 = new Date().getTime();
		if (t1 - t0 < 1000) {
			// 出现重复情况
			if (!isHiddenAlert) {
				var ss = _EWA_EVENT_MSG['ValidCodeError'];
				$Tip(ss);
				$('.ewa-valid-code-img').parent().parent().find('input').focus().select();
			}
			return;
		}
		this._t_ValidCodeError = t1;
		$('.ewa-valid-code-img').each(function() {
			this.click()
		});
		if (!isHiddenAlert) {
			var ss = _EWA_EVENT_MSG['ValidCodeError'];
			$Tip(ss);
			$('.ewa-valid-code-img').parent().parent().find('input').focus().select();
		}
	};
	//重复提交后的提醒（幂等性）
	this.checkIdempotenceError = function() {
		var ss = _EWA_EVENT_MSG['IdempotanceError'];
		$Tip(ss);
	};
	//拼图验证失败
	this.checkValidSildePuzzleError = function() {
		var ss = _EWA_EVENT_MSG['ValidSildePuzzleError'];
		$Tip(ss);
	};

	this.Init = function(xmlString) {
		this.Xml = new EWA.C.Xml();
		this.Xml.LoadXml(xmlString);

		this.ItemList.F = this;
		// DisableOnModify IdCard , Mobile Phone 初始化在此
		this.ItemList.Init(this.Xml);

		this.Resources = new EWA_FrameResoures();
		this.Resources.Init(this.Xml);

		if (EWA.LANG == 'enus') {// ddl
			$('.ewa-ipt-droplist').attr('placeholder', 'Input character selection');
		}
		this._InitTranslations();
		this._GetDropListValue();
		this._InitMustInputs();

		this._InitEncyptions();

		this._InitTriggerValids();
	};
	/**
	 * 触发验证，例如拼图验证
	 */
	this._InitTriggerValids = function() {
		var tb = this.getObj();
		var js = "EWA.F.FOS['" + this._Id + "'].callTriggerValid(this)";
		this.triggerValids = {};
		for (var name in this.ItemList.Items) {
			var node = this.ItemList.Items[name];
			var name1 = this.ItemList.GetItemValue(node, "Name", "Name");

			var triggerValid = $(node).find('DataItem Set[TriggerValid]').attr("TriggerValid");
			if (!triggerValid) {
				continue;
			}
			this.triggerValids[name1] = null;
			var jqitem = '#' + name1;
			// 在对象上
			var item = tb.find(jqitem);
			if (item.length === 0) {
				contine;
			}
			item.attr('ewa_trigger_valid', triggerValid);

			var tag = $(node).find('Tag Set').attr('Tag');
			//console.log(tag)
			if ("submit" == tag) {
				//通过form onsubmit触发
				return;
			}

			if ("smsValid" == tag) {
				var button = tb.find('.ewa-row-' + name1 + ' .ewa-sms-valid-code-button');
				let butId = button.attr('id');
				if (!butId) {
					butId = EWA_Utils.tempId();
					button.attr('id', butId);
				}
				// 通过一个覆盖层
				let html = $("<a style='position:absolute;left:0;top:0;right:0;bottom:0'></a>");
				html.attr('ewa_trigger_valid', triggerValid);
				html.attr('ewa_trigger_valid_rid', name1);
				html.attr('ewa_trigger_valid_click_id', butId);
				button.parent().css('position', 'relative').append(html);

				item = html;
			}

			let oldclick = item.attr('onclick');
			if (oldclick) {
				item.attr('_onclick', oldclick);
			}
			item.attr('onclick', js);

		}
	};
	/**
	 * 调用触发前判断（例如滑动拼图），检查是否符合执行调用的要求
	 */
	this.callTriggerValidBefore = function(obj) {
		return true;
	};
	/**
	 * 调用触发验证，例如滑动拼图
	 */
	this.callTriggerValid = function(obj) {
		if (!this.callTriggerValidBefore(obj)) {
			return;
		}
		let tb = this.getObj();
		let obj1 = $(obj)
		let objId = obj1.attr("id");
		if (!objId) {
			objId = obj1.attr("ewa_trigger_valid_rid");
		}
		let url = this.getUrlClass();
		let triggerValid = obj1.attr('ewa_trigger_valid');
		url.AddParameter("ewa_ajax", triggerValid);
		url.AddParameter("ewa_trigger_valid_name", objId);
		url.AddParameter("ewa_trigger_valid_mode", "create");
		url.AddParameter("ewa_trigger_valid_width", document.documentElement.clientWidth);
		let c = this;

		let tempid = EWA_Utils.tempId();


		$J(url.GetUrl(), function(rst) {
			if (!rst.RST) {
				alert(rst.ERR);
				return;
			}
			// 设置id，用于_checkTriggerValids判断窗口是否创建
			obj1.attr('_trigger_valid_id', tempid);

			//显示拼图窗口
			let title = EWA.LANG == 'enus' ? "Silde puzzle" : "拼图验证";
			let dia = top.$DialogHtml("<div id='" + tempid + "'></div>", title, rst.bigImgWidth + 20, 200, false);
			$(dia.getContent()).css('overflow', 'hidden'); //Compatible with the safari
			rst.ewa_trigger_valid_name = objId;
			rst.ewa_trigger_valid = triggerValid;
			rst.ewa_url = url.GetUrl();

			EWA.UI.SlidePuzzle(rst, top.$('#' + tempid), function(result) {
				console.log('2. puzzle cb true');

				// obj1.removeAttr('onclick');
				let click = false;
				if (obj1.attr('_onclick')) {
					obj1.attr('onclick', $(obj).attr('_onclick'));
					click = true;
				}
				setTimeout(function() {
					$(dia.getMain()).animate({ opacity: 0 }, 500);
				}, 500);
				setTimeout(function() {
					let type = obj1.attr('type');
					// let tagName = obj1[0].tagName;

					c.triggerValids[objId] = result.VALID;
					let butId = $(obj).attr('ewa_trigger_valid_click_id');

					// console.log(butId, click, type, tagName, obj);
					if (butId) {//通过一个覆盖层
						obj1.remove();
						console.log(butId + '.click');
						tb.find('#' + butId).click();
					} else if (click) {
						console.log('3. puzzle click');
						obj1.click();
					} else if ("submit" == type) {
						// 由DoPost调用判断
						console.log('3. puzzle submit');
					}
					dia.Close();
				}, 1000);
			});
			setTimeout(() => { dia.AutoSize(); }, 100);
		});
	};
	/**
	 * 添加必须输入的样式
	 */
	this._InitMustInputs = function() {
		var tb = this.getObj();
		for (var name in this.ItemList.Items) {
			var node = this.ItemList.Items[name];
			var name1 = this.ItemList.GetItemValue(node, "Name", "Name");
			var isMustInput = $(node).find('IsMustInput Set[IsMustInput="1"]').length > 0;

			if (isMustInput) {
				var jqrow = '.ewa-row-' + name1;
				var jqitem = '#' + name1;
				// 在行上
				tb.find(jqrow).addClass('ewa-row-must');
				// 在对象上
				var item = tb.find(jqitem);
				item.addClass('ewa-row-item-must');
				if (item.length > 0 && item.attr("type") && item.attr("type").toLowerCase() == 'hidden') {
					item.prev().addClass('ewa-row-item-must');
				}
			}

		}
	};
	/**
	 * 添加加密的样式
	 */
	this._InitEncyptions = function() {
		var tb = this.getObj();
		var nodeList = this.ItemList;
		var c = this;
		for (var name in this.ItemList.Items) {
			var node = this.ItemList.Items[name];
			var name1 = this.ItemList.GetItemValue(node, "Name", "Name");
			var enc = $(node).find('DispEnc Set');

			if (enc.length == 0) {
				continue;
			}

			var obj = tb.find('#' + name1);
			if (obj.length == 0) {
				continue;
			}

			var EncType = enc.attr('EncType');
			if (!EncType) {
				continue;
			}

			if (obj[0].tagName == 'INPUT' || obj[0].tagName == 'TEXTAREA') {
				if (!obj.val()) {
					continue;
				}
				obj.prop('disabled', true);
				obj.attr('ewa_encyrption', 'yes');
			}

			var o1 = $("<div class='ewa-enc-cover' style='position:absolute;left:0;top:0;width:100%;height:100%;'><div></div></div>");
			obj.parent().append(o1);
			obj.parent().css('position', 'relative');
			var enc_url = enc.attr('EncShowUrl');
			if (!enc_url) {
				continue;
			}
			var css = {
				position: 'absolute',
				height: 30,
				'line-height': '30px',
				'top': '50%',
				'margin-top': '-15px',
				right: 10,
				'text-align': 'right'
			};
			o1.find('div').html("点击查看").css(css);
			var u1 = new EWA_UrlClass(enc_url);
			var u2 = new EWA_UrlClass(c.Url);
			for (var n in u2._Paras) {
				if (!u1.GetParameter(n)) {
					var v = u2._Paras[n];
					if (v != null) {
						v = v.unURL();
					}
					u1.AddParameter(n, v);
				}
			}
			u1.AddParameter("EWA_ENCY_FROM_ID", obj.attr('id'));
			var u = u1.GetUrl();
			obj.parent().attr('enc_url', u).attr('fid', obj.attr('id'));
			obj.parent().on('click', function() {
				if ($(this).attr('enc_ok')) {
					return;
				}
				var t = $(this).attr('t') || 100;
				var t1 = new Date().getTime();
				if (t1 - t < 400) { // 避免多次点击
					return;
				}
				$(this).attr("t", t1);
				var u = $(this).attr('enc_url');
				var obj = $(this).find('#' + $(this).attr('fid'));
				$J(u, function(rst) {
					if (rst.RST) {
						obj.prop("disabled", false);
						obj.removeAttr('ewa_encyrption');

						obj.val(rst.VALUE);
						$(obj).parent().find('.ewa-enc-cover').remove();
						$(obj).parent().attr('enc_ok', '1')
					} else {
						if (rst.ERR || rst.MSG) {
							$Tip(rst.ERR || rst.MSG);
						}
					}
				});
			});
		}
	};
	/**
	 * 检查所有对象合法性
	 * 
	 * @param {}
	 *            objForm
	 * @return {}
	 */
	this._InitTranslations = function() {
		var js = "EWA.F.FOS[&quot;" + this._Id + "&quot;]._Trans(this)";
		for (var name in this.ItemList.Items) {
			var node = this.ItemList.Items[name];
			var name1 = this.ItemList.GetItemValue(node, "Name", "Name");
			var translation = $(node).find('DataItem Set[Translation]');
			var trnasType = translation.attr('Translation');
			if (trnasType) {
				var transTarget = translation.attr('TransTarget');
				// console.log(name1, trnasType, transTarget);
				var txt = trnasType == "en2zh" ? " 英译中" : " 中译英";
				if (EWA.LANG == 'enus') {
					txt = trnasType == "en2zh" ? " En-Zh" : " Zh-En";
				}
				var s = '<a class="ewa-but-trans" href="javascript:void(0)" onclick="' + js + '" _transf="' + name1
					+ '" _transp="' + trnasType + '" _transt="' + transTarget + '">' + txt + '</a>';

				var but = $(s);
				var o = $('#EWA_FRAME_' + this._Id + ' .ewa-row-' + name1 + ' .EWA_TD_L');
				if (o.length == 0) {
					o = $('#EWA_FRAME_' + this._Id + ' .ewa-row-' + name1 + ' .EWA_TD'); // textarea
				}
				if (o.length == 0) {
					// redraw
					o = $('#EWA_FRAME_' + this._Id + ' #' + name1).parent().prev().find(".ewa_d1");
				}

				if (o.length == 0) { // 放在对象的上面
					o = $('#EWA_FRAME_' + this._Id + ' #' + name1).parent();
					o.css('position', 'relative');
					but.addClass('ewa-but-trans-float');
				}

				o.append(but);
			}
		}
	};
	this._Trans = function(obj) {
		if (!obj) {
			return;
		}
		var trnasFrom = $(obj).attr('_transf');
		var trnasType = $(obj).attr('_transp');
		var transTarget = $(obj).attr('_transt');
		var fromObj = $('#EWA_FRAME_' + this._Id + ' #' + trnasFrom); // 英文对象
		var toObj = $('#EWA_FRAME_' + this._Id + ' #' + transTarget); // 英文对象

		if (fromObj.length == 0 || toObj.length == 0) {
			console.log('trans ex:', fromObj, toObj);
			return;
		}
		var fromStr;
		var tagName = fromObj[0].tagName.toLowerCase();
		if (tagName == 'input' || tagName == 'textarea' || tagName == 'hidden') {
			fromStr = fromObj.val(); // 中文对象字符串
		} else {
			fromStr = fromObj.text();
		}

		if (fromStr) {
			var trans = new EWA_TransClass();
			// trans._Trans = 'youdao'; //默认用bing

			if (trnasType == 'en2zh') {
				trans.transToCn(fromStr, toObj[0]); // 英文到中文
			} else {
				trans.transToEn(fromStr, toObj[0]); // 中文到英文
			}
			var txt = EWA.LANG == 'enus' ? 'Translating...' : "翻译中...";

			$Tip(txt, function() {
				return !trans.IsRun;
			});
		}
	};
	/**
	* 绑定当输入法打开时的判断
	 */
	this._bindCompostion = function(inputShowText, inputSaveValue) {
		if (EWA.B.IE) {
			return;
		}
		let c = this;
		if (!c["_droplist_"]) {
			c["_droplist_"] = {};
		};

		c["_droplist_"][inputSaveValue.id] = { _is_composition: false };

		$(inputShowText).on('compositionstart', function() {
			// 输入法打开输入
			c["_droplist_"][inputSaveValue.id]._is_composition = true;
		}).on('compositionend', function() {
			// 输入法输入完毕
			c["_droplist_"][inputSaveValue.id]._is_composition = false;
			EWA.F.I.DropList(this);
		}).removeAttr('oninput')
			.removeAttr('onkeyup')
			.on('input', function() {
				if (c["_droplist_"][inputSaveValue.id]._is_composition) {
					return;
				}
				EWA.F.I.DropList(this);
			});
	};
	this._GetDropListValue = function() {
		var tb = this.getObj();
		if (tb.length == 0) {
			return;
		}
		tb = tb[0];
		var inputs = tb.getElementsByTagName('input');
		let c = this;
		c["_droplist_"] = {};
		for (var i = 0; i < inputs.length; i++) {
			var o = inputs[i]; // show the text
			if (o.getAttribute('ewa_class') == 'droplist') {
				var o1 = o.nextSibling; // save the value ,type=hidden
				if (o1.tagName.toUpperCase() == 'INPUT' && o1.type.toUpperCase() == 'HIDDEN') {
					this._GetDropListValue1(o, o1);
					// 绑定当输入法打开时的判断
					this._bindCompostion(o, o1);
				}

			}
		}

		// select 的过滤
		var selects = tb.getElementsByTagName('select');
		for (var i = 0; i < selects.length; i++) {
			var o = selects[i];
			var _ListFilterType = o.getAttribute('_ListFilterType');
			if (_ListFilterType) {
				var _ListFilterField = o.getAttribute('_ListFilterField');
				this.initSelectFilter(o.id, _ListFilterType, _ListFilterField);
			}
		}
		if (this._SelectFilters) {
			this._checkSelectOptionsChange();
		}
	};

	this.refreshDropList = function(id, value) {
		let target = this.getObj('input[id="' + id + '"]');
		if (target.length == 0) {
			console.warn('Can not found id=' + id);
			return;
		}
		let obj1 = target.prev();
		if (obj1.length == 0) {
			console.warn('Can not found  id=' + id + " prev");
			return;
		}
		if (obj1.attr('ewa_class') == 'droplist') {
			target.val(value);
			this._GetDropListValue1(obj1[0], target[0]);
		} else {
			console.warn('Not droplist id=' + id + " prev");
		}
	};


	this._GetDropListValue1 = function(textInput, valueInput) {
		if (valueInput.value == '') {
			valueInput.setAttribute('setvalue', 1);
			return;
		}

		var exp = valueInput.getAttribute('DlsShow');
		if (exp == null || exp == "") {
			valueInput.setAttribute('canopen', 0);
			textInput.value = obj1.value;
			valueInput.setAttribute('canopen', 1);
			return;
		}

		var xmlName = valueInput.getAttribute("xmlName");
		var itemName = valueInput.getAttribute("itemName");
		var paraname = valueInput.getAttribute("paraName");
		var action = valueInput.getAttribute('DlsAction');

		var val = valueInput.value;
		var url;
		if (this.EWA_CGI) {
			url = this.EWA_CGI; // EWA.F.FOS的自定义路径优先级最高
		} else if (window.EWA_CGI) { // 全局替换cgi-bin路径
			url = window.EWA_CGI;
		} else {
			url = EWA.CP + "/EWA_STYLE/cgi-bin/";
		}

		var mark = url.indexOf('?') == -1 ? "?" : "&";
		url += mark + "XMLNAME=" + xmlName + "&ITEMNAME=" + itemName + "&EWA_AJAX=JSON";
		url = url.replace('//', '/');
		url = url.replace('//', '/');
		url = url.replace('//', '/');

		let data = {};
		data[paraname] = val;
		if (action != null && action.trim().length > 0) {
			data["EWA_ACTION"] = action;
			data[valueInput.id] = valueInput.value;
		}
		$JP(url, data, function(s) {
			if (s.length == 0) {
				return;
			}
			var o = s[0];
			var s1 = [];
			var s2 = {};
			for (var n in o) {
				s1.push(o[n]);
				s2['@' + n.toUpperCase()] = o[n];
				if (o[n]) {
					valueInput.setAttribute("para_" + n.toLowerCase(), o[n]);
				}
			}
			var rst;
			if (exp == null || exp == "") {
				rst = s1.join('/');
			} else {
				var r1 = /\@[a-zA-Z0-9\-\._:]*\b/ig;
				var m1 = exp.match(r1);
				for (var i = 0; i < m1.length; i++) {
					var key = m1[i];
					var v = s2[key.toUpperCase()];
					exp = exp.replace(key, v);
				}
				rst = exp;
			}
			valueInput.setAttribute('canopen', 0);
			textInput.value = rst;

			valueInput.id = valueInput.id == null || valueInput.id == "" ? Math.random() : valueInput.id;
			if (valueInput.getAttribute("isdlseventload") == "yes") {
				EWA.F.FOS[valueInput.id] = new EWA_FrameItemClass();
				//console.log(EWA.F.FOS[valueInput.id].DropList)
				EWA.F.FOS[valueInput.id].DropList(textInput);
				// 执行调用
				EWA.F.FOS[valueInput.id].CallAfterEvent();
			}
			valueInput.setAttribute('canopen', 1);
			valueInput.setAttribute('setvalue', 1);
		});

	};
	/**
	 * 用于外部调用
	 */
	this.DoPostEx = function() {
		EWA.F.F.CUR = this;
		var objForm = document.forms[0];
		if (!this.CheckValidAll(objForm)) {
			return;
		}
		this._Ajax = new EWA.C.Ajax();
		this._Ajax.LoadingType = "image";

		this._Ajax.AddParameter("EWA_AJAX", "1");
		this._Ajax.AddParameter("EWA_POST", "1");
		this._Ajax.AddParameter("EWA_NO_CONTENT", "1");

		var inputs = document.getElementsByTagName("input");
		for (var i = 0; i < inputs.length; i = i + 1) {
			var o1 = inputs[i];
			var id1 = o1.name == '' ? o1.id : o1.name;
			if (id1 != null && id1 != '')
				this._Ajax.AddParameter(id1, o1.value);
		}
		var inputs = document.getElementsByTagName("select");
		for (var i = 0; i < inputs.length; i = i + 1) {
			var o1 = inputs[i];
			var id1 = o1.name == '' ? o1.id : o1.name;
			if (id1 != null && id1 != '')
				this._Ajax.AddParameter(id1, o1.value);
		}
		var inputs = document.getElementsByTagName("textarea");
		for (var i = 0; i < inputs.length; i = i + 1) {
			var o1 = inputs[i];
			var id1 = o1.name == '' ? o1.id : o1.name;
			if (id1 != null && id1 != '')
				this._Ajax.AddParameter(id1, o1.value);
		}

		this._Ajax.PostNew(this.Url, EWA.F.F.CUR._CallBack);
	};
	/**
	 * 获取包含输入域内容的 Ajax
	 * 
	 * @param objForm
	 *            objForm
	 * @param unCheckValid
	 *            是否进行合法性检查，默认检查
	 * @return {}
	 */
	this.CreateAjax = function(objForm, unCheckValid) {
		EWA.F.F.CUR = this;
		if (objForm == null) {
			objForm = $('#f_' + this._Id)[0];
		}

		if (!unCheckValid) {
			if (!this.CheckValidAll(objForm)) {
				return null;
			}
		}
		var ajax = new EWA.C.Ajax();
		var data = this.CreatePostData();
		for (var n in data) {
			ajax.AddParameter(n, data[n]);
		}

		return ajax;
	};
	this.createAjax = this.CreateAjax;
	/**
	 * 获取提交的数据 
	 * 
	 * @param objForm
	 *            objForm
	 * @returns data
	 */
	this.CreatePostData = function(objForm) {
		var objForm = objForm || $('#f_' + this._Id)[0];
		var data = {};
		for (var name in this.ItemList.Items) {
			var node = this.ItemList.Items[name];
			var id = this.ItemList.GetItemValue(node, "Name", "Name");

			var o1 = this.GetObject(id, objForm);
			if (o1 == null) {
				continue;
			}

			if ($(o1).attr("ewa_encyrption")) {// 加密显示的对象
				continue;
			}

			var ewa_tag = o1.getAttribute('ewa_tag');
			let val = null;

			// 检查签名数据是否变化，如果有就获取变化的数据，否则为空白字符串
			if ("signature" == ewa_tag) {
				let changed = 'N';
				let tablet = this.tablets[name];
				// 检查所有线条
				for (let k = 0; k < tablet.lines.length; k++) {
					if (tablet.lines[k]) {
						changed = 'Y';
						break;
					}
				}
				if (changed == 'Y') {
					val = this._GetObjectValue(o1);
				} else {
					val = "";
				}
				// 签名数据是否变化
				data[id + "_CHANGED"] = changed;
			} else {
				val = this._GetObjectValue(o1);
			}
			if (val != null) {
				data[id] = val;
			}
			if (o1.tagName.toUpperCase() == "DIV" && o1.getAttribute('EWA_DHTML') == "1") {// dhtml
				// 传递上传的图片的unid，用于调用SQL的更新用
				var upImgsUuid = $X('UP_IMG_' + id).value;
				data[id + '_imgs_split'] = upImgsUuid;
			}

			if ('swffile' == ewa_tag || 'IMG_UPLOAD' == ewa_tag) {
				var s = o1.getAttribute("UP_PARAS");
				if (s != null && s.length > 0) {
					var s1 = s.split(',');
					for (var i = 0; i < s1.length; i++) {
						var n = s1[i];
						data[n] = o1.getAttribute(n);
					}
				} else {
					data['UP_URL'] = o1.value;
				}
			} else if ('markdown' == ewa_tag) {
				var texts = o1.parentNode.getElementsByTagName('textarea');
				if (texts.length > 1) {
					data[texts[1].id] = texts[1].value;
				}
			}
		}
		if (this.PostAddData) {
			for (var n in this.PostAddData) {
				data[n] = this.PostAddData[n];
			}
		}
		if (this.triggerValids) {
			for (let n in this.triggerValids) {
				let name = n + "_TRIGGER_VALID_RESULT";
				data[name] = this.triggerValids[n];
			}
		}

		return data;
	};
	this.createPostData = this.CreatePostData;
	// 提交前检查，返回true or false;
	this.DoPostBefore = function() {
		return true;
	};
	/**
	 * 是否在进行异步提交前检查
	 */
	this.isDoPostBeforeTimer = function() {
		return this._checkStatusFristResult != null;
	};

	// 检查上传文件状态
	this._uploadingFileCheck = function(ipt) {
		//	var ipt = html5uploads[i];
		var ipt_name = ipt.id;
		var ht5 = window['h5u_' + this._Id + '$' + ipt_name];
		if (!ht5.haveFile()) {// 有文件
			return false;
		}
		// start ok checking nofile error abort
		if (ht5.UPLOAD_STATUS == 'ok') {
			// 上传完毕
			ht5.removeWaitBox();
			this.uploadProcess = false;
			return false;
		}
		if (ht5.UPLOAD_STATUS == 'nofile') {
			// 用户虽然选择了文件，但是所有文件被标记为 isDelete
			// 没有可用的上传
			this.uploadProcess = false;
			ht5.removeWaitBox();
			return false;
		}
		if (ht5.UPLOAD_STATUS == 'error' || ht5.UPLOAD_STATUS == 'abort') {
			// 错误或终止
			this._stopPost = true;
			this._stopPostError = EWA.LANG == 'enus' ? 'Upload file error or aborted' : '上传文件错误或被中止';
			console.log(this._stopPostError);
			return false;
		}

		if (ht5.UPLOAD_STATUS == 'start' || ht5.UPLOAD_STATUS == 'checking') {
			// 上传中
			return true;
		}


		// 开始上传 UPLOAD_STATUS = checking，如果没有文件 UPLOAD_STATUS = nofile
		ht5.submitUploads();

		if (ht5.UPLOAD_STATUS == 'nofile') {
			// 用户虽然选择了文件，但是所有文件被标记为 isDelete
			// 没有可用的上传
			this.uploadProcess = false;
			ht5.removeWaitBox();
			return false;
		}

		if (!$X(ht5.WAIT_ID)) {// 开始上传文件
			ht5.createWaitBox();
		}
		this.uploadProcess = true;
		return true;
	};
	this._checkTriggerValids = function() {
		if (!this.triggerValids) {
			return true;
		}
		var tb = this.getObj();
		for (let n in this.triggerValids) {
			if (this.triggerValids[n]) {
				// 已经验证成功了
				continue;
			}

			let obj = tb.find('#' + n);
			if (obj.length > 0 && "submit" == obj[0].type) {
				let inc = obj.attr('_trigger_valid_inc') ? obj.attr('_trigger_valid_inc') * 1 : 0;
				if (inc == 0) {
					//console.log('1. Puzzle wait valid: ' + n + "(" + inc + ")");
					this.callTriggerValid(obj);
				} else {
					let id = obj.attr('_trigger_valid_id');
					if (!id) {
						//puzzle 窗口还未创建
						return false;
					}
					if (top.$('#' + id).length == 0) {//窗口不见了，用户关闭窗口
						//取消提交等待
						this._cancelPostWait = true;
						obj.removeAttr('_trigger_valid_inc');
						obj.removeAttr('_trigger_valid_id');
						console.log('窗口不见了，取消提交等待');
						return false;
					}
				}
				inc++;
				obj.attr('_trigger_valid_inc', inc);
				//console.log('3. Puzzle wait valid: ' + n + "(" + inc + ")");
			} else {
				//console.log('等待验证triggerValid: ' + n);
			}
			return false;
		}
		return true;
	};
	this.DoPost = function(objForm, url, isSkipDoPostBefore) {
		if (this.posting) {
			return false;
		}
		if (this._cancelPostWait) {
			console.log('取消提交')
			this._cancelPostWait = null;
			return false;
		}
		var c = this;

		if (!isSkipDoPostBefore) {
			var rst = this.DoPostBefore();
			if (rst instanceof Array) {
				// array = [0是否执行完成和完成的结果, 1'提示的内容', 2是否用Confirm确认]
				// 【参数0】： null 表示停止执行，true 表示执行完成直接提交， false 如果
				// 参数2=true，则提示确认信息（参数1），参数2=false，则提示信息后退出
				// 【参数1】：提示或确认的信息
				// 【参数2】：是否使用Confirm对话框
				var c = this;

				this._checkStatusInc = 0; // 检查计数器
				this._checkStatusFristResult = rst;
				// 用定时器检查
				this._checkStatusTimer = window.setInterval(function() {
					// 检查计数器==0 用前面的结果，避免多次检查
					var rst = c._checkStatusInc == 0 ? c._checkStatusFristResult : c.DoPostBefore();
					c._checkStatusInc++;
					let result = rst[0];

					if (result === null || result === undefined) {
						return;
					}
					window.clearInterval(c._checkStatusTimer);
					c._checkStatusTimer = null;
					c._checkStatusInc = null;
					c._checkStatusFristResult = null;


					let tipMsg = rst[1];
					let useTip = rst[2];
					if (result && !useTip) {
						c.DoPost(objForm, url, true);
						return;
					}
					if (result && useTip) {
						$Confirm(tipMsg, tipMsg, function() {
							// yes
							c.DoPost(objForm, url, true);
						}, function() {
							// no
							return;
						});
						return;
					}
					if (tipMsg) {
						$Tip(tipMsg);
					}
				}, 232);
				return;
			} else if (!rst) {
				return;
			}
		}
		var html5uploads = $(objForm).find('input[ewa_tag=ht5upload]');
		if (html5uploads.length > 0 && !this.uploadProcess) {
			// 如果没有开始上传，先检查一下所有对象是否合法，否则不检查
			if (!this.CheckValidAll(objForm)) {
				return;
			}
		}
		var incUploadings = 0;
		for (var i = 0; i < html5uploads.length > 0; i++) {
			var ipt = html5uploads[i];
			var uploadingCheckResult = this._uploadingFileCheck(ipt);
			if (uploadingCheckResult) {
				incUploadings++;
			}
		}
		if (incUploadings > 0) {
			// 延时700ms再次尝试提交数据
			setTimeout(function() {
				c.DoPost(objForm, url);
			}, 700);
			return;
		}

		var ht5takephotos = $(objForm).find('input[ewa_tag=ht5takephoto]');
		// console.log(ht5takephotos)
		if (ht5takephotos.length > 0 && !this.uploadProcess) {
			// 如果没有开始上传，先检查一下所有对象是否合法，否则不检查
			if (!this.CheckValidAll(objForm)) {
				return false;
			}
		}

		for (var i = 0; i < ht5takephotos.length > 0; i++) {
			var ipt = ht5takephotos[i];
			var ipt_name = ipt.id;
			var isRun = false;
			var ht5 = window['h5takephoto_' + this._Id + '$' + ipt_name];
			if (ht5.UPLOAD_STATUS != 'ok') {
				if (!$X(ht5.H5_UPLOAD.WAIT_ID)) {// 开始上传文件

					try {
						ht5.submitUpload();
					} catch (e) {
						console.log('ht5takephotos - ht5.submitUpload: ' + e);
						$Tip('您没有获取照片');
						return;
					}
					ht5.H5_UPLOAD.createWaitBox();
					// 开始上传
					this.uploadProcess = true;
				}

				if (!isRun) {
					var c = this;
					setTimeout(function() {
						c.DoPost(objForm, url);
					}, 700);
					isRun = true;
				}
				return;
			} else {
				// 上传完毕
				ht5.H5_UPLOAD.removeWaitBox();
			}
		}

		if (this._stopPostError) { // 停止提交的错误原因，系统错误，客户端无效处理
			EWA.UI.Msg.ShowError(this._stopPostError, "");
			return false;
		}

		var ajax = this.CreateAjax(objForm);
		if (ajax == null) {
			return false;
		}

		//检查拼图验证等
		if (!this._checkTriggerValids()) {
			setTimeout(function() {
				c.DoPost(objForm, url, isSkipDoPostBefore);
			}, 500);
			return;
		}

		if (url == null) {
			url = this.Url;
		}
		if (url == '' || url == null) {
			url = window.location.href;
		}
		this._Ajax = ajax;
		this._Ajax.AddParameter("EWA_AJAX", "1");
		this._Ajax.AddParameter("EWA_POST", "1");
		this._Ajax.AddParameter("EWA_NO_CONTENT", "1");

		this._Ajax.LoadingType = "image";

		// 外部指定的 DoPostStart，用于显示或提示写东西
		if (this.DoPostStart) {
			this.DoPostStart(this._Ajax);
		}

		// 去除query上和form相同的参数
		var u1 = new EWA_UrlClass(url);
		for (var n in this._Ajax._Parameters) {
			u1.RemoveParameter(n);
		}
		url = u1.GetUrl();

		this.posting = true;
		let that = this;

		if (this.triggerValids) {
			for (let n in this.triggerValids) {
				//提交后，清除trigger_valid标记
				this.triggerValids[n] = null;
				this.getObj('#' + n).removeAttr('_trigger_valid').removeAttr('_trigger_valid_inc');
			}
		}


		this._Ajax.PostNew(url, function() {
			that._CallBack();
		});

		// 隐藏提交时候等待框 郭磊 2018-04-02
		if (!this.isShowPostWaitting) {
			this._Ajax.HiddenWaitting();
		}

		this.getObj('input[type=submit]').attr('disabled', 'disabled');

		return true;
	};
	this._CallBack = function() {
		let that = this; // EWA.F.F.CUR
		var ajax = that._Ajax;
		if (!ajax.IsRunEnd()) {
			return;
		}
		that.getObj('input[type=submit]').attr('disabled', null);
		that.posting = false;
		// 外部指定的 DoPostEnd，用于显示或提示写东西
		if (that.DoPostEnd) {
			that.DoPostEnd(ajax, ajax._Http.status, ajax._Http.responseText, ajax._Http.statusText);
		}
		if (ajax._Http.status == 200) {
			var ret = ajax._Http.responseText;
			if (EWA.F.CheckCallBack(ret)) {
				that.ValidCodeError(true); // 重新刷新验证码

				let afterCall = null;
				if (that.doPostAfter) {
					afterCall = that.doPostAfter;
				} else if (that.ReloadAfter) {
					console.warn('请用：doPostAfter');
					afterCall = that.ReloadAfter;
				}

				try {
					if (afterCall) {
						let r = afterCall(ret);
						if (r) {// 不执行后面的eval 2024-10-07 郭磊
							return;
						}
					}
					eval(ret);
				} catch (e) {
					console.log(ret);
					console.error(e);
					alert(ret);
				}

			}
		} else {
			alert("ERROR:\r\n" + ajax._Http.statusText);
		}
		ajax = null;
	};
	this.Reload = function() {
		// for EWA_Behavior.RELOAD_PARENT
	};
	this.Reload1 = function() {
		// guolei 2020-05-26，当初指定了id，其实任何效果也没有
		console.log('Reload1 这个干嘛用？谁在调用？');
	};

	/**
	 * 重新加载Frame,guolei 2020-05-26
	 */
	this.ReloadFrame = function(func) {
		var frame_table = $('#f_' + this._Id); //form
		if (frame_table.length == 0) {
			return;
		}
		var u1 = new EWA_UrlClass(this.Url);
		var ewa_frame_main = null;
		var tmp_id = this._last_reload_frame_id;

		if (tmp_id) {
			ewa_frame_main = $('#' + this._last_reload_frame_id);
		} else {
			tmp_id = EWA_Utils.tempId("ewa_frame_relaod");
			ewa_frame_main = frame_table.parentsUntil('#EWA_FRAME_MAIN').last().parent();
			if (ewa_frame_main[0].id != 'EWA_FRAME_MAIN') {
				// EWA_SKIP_TEST1不存在 #EWA_FRAME_MAIN
				// 创建新父元素
				ewa_frame_main = $("<div class='ewa-reload-frame'></div>");
				ewa_frame_main.insertBefore(frame_table);
				ewa_frame_main.append(frame_table);
			}
			this._last_reload_frame_id = tmp_id;
			ewa_frame_main.attr('id', tmp_id);
		}
		var u1 = new EWA_UrlClass(this.Url);
		u1.AddParameter("ewa_ajax", "install");
		var url = u1.GetUrl();
		$Install(url, tmp_id, function() {
			if (func) {
				func(ewa_frame_main, this);
			}
		});
	};

	/**
	 * 检查所有对象合法性
	 * 
	 * @param {}
	 *            objForm
	 * @return {}
	 */
	this.CheckValidAll = function(objForm) {
		var isOk = true;

		var firstObj = null;
		for (var name in this.ItemList.Items) {
			var node = this.ItemList.Items[name];
			var name1 = this.ItemList.GetItemValue(node, "Name", "Name");

			var obj = this.GetObject(name1, objForm);
			if (obj == null) {
				continue;
			}
			isOk = isOk & this.CheckValid(obj);
			if (!isOk && firstObj == null) {
				firstObj = obj;
			}
		}

		if (firstObj != null) {
			firstObj.focus();
		}
		return isOk;
	};

	/**
	 * 检查所有对象合法性
	 * 
	 * @param {}
	 *            objForm
	 * @return {}
	 */
	this.H5Type = function() {
		var nodeList = this.ItemList;
		var firstObj = null;
		for (var name in this.ItemList.Items) {
			var node = this.ItemList.Items[name];
			// name 是大写，name1是真正id
			var name1 = this.ItemList.GetItemValue(node, "Name", "Name");

			var obj = this.getObj('[id="' + name1 + '"]');
			if (obj.length == 0) {
				continue;
			}
			// console.log(node);

			var tag = this.ItemList.GetItemValue(node, "Tag", "Tag");
			var valid = this.ItemList.GetItemValue(node, "DataItem", "Valid");
			var format = this.ItemList.GetItemValue(node, "DataItem", "Format");
			var IsMustInput = this.ItemList.GetItemValue(node, "IsMustInput", "IsMustInput");

			if (valid == 'Email') {
				obj.attr('type', 'email');
			}
			if (tag == 'valid') {
				obj.attr('type', 'tel');
			}
			if (IsMustInput == 1) {
				obj.attr('required', 'required');
			}
			// console.log(tag, valid, format, IsMustInput);
		}

	};
	this.GetObject = function(objName, objForm) {
		if (!objForm) {
			objForm = $('FORM#f_' + this._Id);
		}
		var objs = $(objForm).find('[id="' + objName + '"]');
		if (objs.length > 0) {
			return objs[0];
		} else {
			return null;
		}
	};

	/**
	 * 检查对象值的合法性
	 * 
	 * @param {}
	 *            obj
	 * @return {Boolean}
	 */
	this.CheckValid = function(obj, event) {
		if (obj.tagName == 'SPAN' || obj.tagName == 'IMG') {
			return true;
		}
		// 避免出现当是 radio/checkbox时,点击div出现后背景先变化
		if (obj && event && obj.tagName == 'DIV' && obj.getAttribute('tag') == 'REPT') {
			var tag = event.target.tagName;
			// console.log(event.target);
			// 点击label会后赋值input
			if (tag == 'LABEL' || tag == 'INPUT') {
				var c = this;
				setTimeout(function() {
					var v = c._GetObjectValue(obj);
					c.ItemList.CheckValid(obj, val);
				}, 10);
			}
			return true;
		}
		var val = this._GetObjectValue(obj);
		return this.ItemList.CheckValid(obj, val);
	};

	/**
	 * 获取Html对象值
	 * 
	 * @param {}
	 *            obj
	 * @return {}
	 */
	this._GetObjectValue = function(obj) {
		return this.ItemList.GetObjectValue(obj);
	};

	this.getUrlClass = function() {
		var u = new EWA_UrlClass();
		u.SetUrl(this.Url);
		return u;
	};
}
// ------------------------------------------
var __EWA_ALTER_MSG = null;
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
		if (obj.tagName != 'SELECT') {
			obj.focus();
		}

		let tr = $(obj).parentsUntil('tbody').last();
		if (tr.prev().hasClass('ewa-row-' + obj.id)) {
			// C11
			o1 = tr.prev()[0];
		}
	}
	if (!o1) {
		return;
	}
	if (o1.cells.length == 1 || o1.parentNode.parentNode.getAttribute("error_show_type") == "1") {
		var curTr = $(o1);
		var errTr = curTr.next();
		if (!errTr.attr('error')) {
			var tr = o1.parentNode.insertRow(o1.rowIndex + 1);
			tr.setAttribute('error', 1);
			tr.setAttribute('rid', obj.id);
			var td = tr.insertCell(-1);
			td.colSpan = o1.cells.length;
			td.className = 'ewa-tip-error';
			errTr = $(tr);
			td.innerHTML = '<div class="ewa-tip-error-info"></div>';
		}
		curTr.find('td').addClass('ewa-tip-error');
		errTr.find('.ewa-tip-error-info').html(errorInfo);
	} else if (o1.cells.length == 3) {
		o1.style.backgroundColor = 'lightyellow';
		if (obj.getAttribute("ori_msg") == null) {
			obj.setAttribute("ori_msg", o1.cells[2].innerHTML);
			obj.setAttribute("ori_st", o1.cells[2].style.borderLeft);
		}
		o1.cells[2].innerHTML = obj.getAttribute("ORI_MSG") + "(<font color=red>" + errorInfo + "</font>)";
		o1.cells[2].style.borderLeft = '2px solid red';
	} else {
		$(o1).find('td').css('background-color', 'lightyellow');
		if (obj.tagName != 'SELECT') {
			obj.focus();
		}
		if (o1.cells.length == 1) {
			var tr1 = $(o1).prev();
			if (tr1.attr('id') && tr1.attr('id').indexOf(obj.id) > 0) {
				if (obj.getAttribute("ori_msg") == null) {
					obj.setAttribute("ori_msg", tr1[0].cells[0].innerHTML);
				}
				tr1[0].cells[0].innerHTML = obj.getAttribute("ori_msg") + "(<font color=red>" + errorInfo + "</font>)";
			} else {
				alert("请输入：" + errorInfo);
				obj.focus();
			}
		} else {
			if (obj.getAttribute("ori_msg") == null) {
				obj.setAttribute("ori_msg", o1.cells[0].innerHTML);
			}
			o1.cells[0].innerHTML = obj.getAttribute("ori_msg") + "(<font color=red>" + errorInfo + "</font>)";
		}
	}
}
function EWA_FrameRemoveAlert(obj) {
	if (__EWA_ALTER_MSG) {
		__EWA_ALTER_MSG.style.display = 'none';
	}
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

		let tr = $(obj).parentsUntil('tbody').last();
		if (tr.prev().prev().hasClass('ewa-row-' + obj.id)) {
			// C11
			o1 = tr.prev().prev()[0];
		}
	}
	if (!o1) {
		return;
	}
	o1.style.backgroundColor = '';
	// 	console.log(o1);
	if (o1.cells.length == 1 || o1.parentNode.parentNode.getAttribute("error_show_type") == "1") {
		var curTr = $(o1);
		curTr.find('td').removeClass('ewa-tip-error');
		var errTr = curTr.next();
		if (errTr.attr('error')) {
			errTr.remove();
		}
	} else if (o1.cells.length == 3) {
		o1.cells[2].innerHTML = obj.getAttribute("ori_msg");
		o1.cells[2].style.borderLeft = obj.getAttribute("ori_st");
	} else {
		if (o1.cells.length == 1) {
			var tr1 = $(o1).prev();
			if (tr1.attr('id') && tr1.attr('id').indexOf(obj.id) > 0) {
				tr1[0].cells[0].innerHTML = obj.getAttribute("ori_msg");
			}
		} else {
			$(o1).find('td').css('background-color', '');
			o1.cells[0].innerHTML = obj.getAttribute("ori_msg");
		}
	}
}
// 用于 Frame RedrawJson
function EWA_FrameShowAlert1(obj, errorInfo) {
	var o1 = obj;
	do {
		o1 = o1.parentNode;
		if (o1.tagName == 'BODY') {
			o1 = null;
			break;
		}
	} while (!(o1.tagName == 'TD' && (o1.getAttribute("SHOW_MSG") == 1 || o1.className == 'ewa_redraw_info')))

	if (o1) {
		var table = o1.parentNode.parentNode.parentNode;

		var o2 = o1.previousElementSibling ? o1.previousElementSibling : o1.previousSibling;
		o1.style.backgroundColor = 'lightblue';
		if (o2 && o2.nodeType == 1) {
			o2.style.backgroundColor = 'lightblue';
			if (obj.getAttribute("ori_msg") == null) {
				obj.setAttribute("ori_msg", o2.innerHTML);
				obj.setAttribute("ori_st", o2.style.borderLeft);
			}
			if (errorInfo == "*") {
				errorInfo = $(o2).find('.ewa_d1').html() + "：需要输入";
			}
			o2.style.borderLeft = '2px solid red';
		} else {
			o1.style.borderLeft = '2px solid red';
		}
		var msg_id = "ERR_" + obj.id;
		var o1 = $(table).find('.ewa_msg_err span[id="' + msg_id + '"]');
		if (o1.length > 0) {
			o1.html(errorInfo + "&nbsp;");
		} else {
			$(table).find('.ewa_msg_err').append("<span id=\"" + msg_id + "\">" + errorInfo + "&nbsp;</span>")
		}

	} else {
		if (errorInfo == "*") {
			errorInfo = obj.parentNode.innerText + "：需要输入";
		}

		$('.ewa_msg_err').html(errorInfo);
		obj.focus();
	}
}
// 用于 Frame RedrawJson
function EWA_FrameRemoveAlert1(obj) {
	if (obj.getAttribute("ori_msg") == null) {
		return;
	}
	var o1 = obj;
	do {
		o1 = o1.parentNode;
		if (o1.tagName == 'BODY') {
			return;
		}
	} while (!(o1.tagName == 'TD' && (o1.getAttribute("SHOW_MSG") == 1 || o1.className == 'ewa_redraw_info')));
	var table = o1.parentNode.parentNode.parentNode;
	var o2 = o1.previousElementSibling ? o1.previousElementSibling : o1.previousSibling;

	o1.style.backgroundColor = '';
	if (o2 && o2.nodeType == 1) {
		o2.style.backgroundColor = '';
		o2.style.borderLeft = obj.getAttribute("ori_st");
	} else {
		o1.style.borderLeft = obj.getAttribute("ori_st");
	}
	var msg_id = "ERR_" + obj.id;
	$(table).find('.ewa_msg_err span[id="' + msg_id + '"]').remove();

}
if (!EWA.F || !EWA.F.F) {
	if (!EWA.F) {
		EWA.F = {};
	}
	EWA.F.F = {/* Frame */
		CUR: null,
		C: EWA_FrameClass
	};
} else {
	EWA.F.F.C = EWA_FrameClass;
}/**
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
}function EWA_FrameMapToClass() {
	this.EWA = null;
	this.mapRef = function(parentObject, refEwaFrameClass, postUrl) {
		this.POST_URL = postUrl;
		this.EWA = refEwaFrameClass;

		var refTb = $('#EWA_FRAME_' + this.EWA._Id);

		this._Id = this.EWA._Id + '_MAPTO';
		EWA.F.FOS[this._Id] = this;

		var c = this;
		$(parentObject).find('[ref]').each(function() {
			try {
				c.mapRefItem(this, refTb);
			} catch (e) {
				console.log(e, this);
			}
		});

	};
	this.checkbox = function(obj) {
		var p = $(obj).parentsUntil('div[tag="REPT"]').last().parent();
		var v = [];
		p.find('input:checked').each(function() {
			v.push(this.value);
		});

		var data = {
			key : p.attr('id'),
			val : v.join(',')
		}
		// 执行更改提交
		var u = this.POST_URL || window.location.href;
		$JP(u, data, function(rst) {
			if (rst.RST) {
				$TipTL('保存完毕');
			} else {
				$Tip(rst.ERR);
			}
		});
	};
	this.showGpsMap = function(obj, obj_control) {
		var ref_map = obj.attr('ref_map'); // 地图显示位置

		if (!ref_map) {
			return;
		}
		var gps = obj_control.parent().parent().next().find('.ewa-map-small');

		if (gps.length == 0) {
			var c = this;
			setTimeout(function() {
				c.showGpsMap(obj, obj_control);
			}, 100);
			return;
		}

		if (ref_map.indexOf('.') == 0 || ref_map.indexOf('#') == 0) {
			$(ref_map).append(gps.css('height', '100%'));
		} else {
			$('#' + ref_map).append(gps.css('height', '100%'));
		}
	}
	this.mapRefItem = function(obj, refTb) {
		var o = $(obj);

		var ref = o.attr('ref');
		var obj_control = refTb.find('[id="' + ref + '"]');
		var is_html = false;
		var c = this;
		var txt = "";

		var js_name = "EWA.F.FOS['" + this._Id + "']";

		if (obj_control[0].type == 'hidden') {// drop-list
			var setvalue = obj_control.attr('setvalue');
			if (!setvalue) {
				setTimeout(function() {
					c.mapRefItem(obj, refTb);
				}, 100);
				return;
			}
			obj_control = obj_control.prev();
			txt = obj_control.val();
			o.attr('onclick', js_name + '.modifyRef(this)').css('cursor', 'pointer');
		} else if ('addressMap' == obj_control.attr('ewa_tag')) {// 地图地址
			txt = obj_control.val();
			o.attr('onclick', js_name + '.modifyRef(this)').css('cursor', 'pointer');
			this.showGpsMap(o, obj_control);
		} else if (obj_control.attr('tag') == 'REPT') {// checkbox
			var jo = $(obj);
			var left = jo.offset().left;
			var top = jo.offset().top;
			var width = jo.outerWidth();
			var css = {
				position : 'absolute',
				left : left,
				top : top,
				width : width,
				outline : 'none'
			};
			jo.append(obj_control);
			obj_control.find('input[type=checkbox]').attr('onclick', js_name + ".checkbox(this)");
			return;
		} else if ('1' == obj_control.attr('ewa_dhtml')) {
			is_html = true;
			txt = obj_control[0].textContent;
			o.attr('onclick', js_name + '.modifyRefHtml(this)').css('cursor', 'pointer');
		} else if ('SELECT' == obj_control[0].tagName) {
			txt = obj_control[0].options[obj_control[0].selectedIndex].text;
			o.attr('onclick', js_name + '.modifyRef(this)').css('cursor', 'pointer');
		} else if ('TEXTAREA' == obj_control[0].tagName) {
			txt = obj_control.val();
			if (txt) {
				txt = '<div>' + txt.replace(/</, '&lt;').replace(/>/, '&gt;').replace(/\n/ig, '</div><div>') + "</div>";
			}
			is_html = true;
			o.attr('onclick', js_name + '.modifyRef(this)').css('cursor', 'pointer');
		} else {
			txt = obj_control.val();
			o.attr('onclick', js_name + '.modifyRef(this)').css('cursor', 'pointer');
		}

		if (!txt) {
			txt = "...................";
		}

		if (is_html) {
			o.html(txt);
		} else {
			o.text(txt);
		}
		var edit = '<i style="margin-left:5px" class="fa fa-edit"></i>';
		o.append(edit);
	};
	this.createRefCaption = function(refId, caption, left, top) {
		if (!$X(refId + "_____tip")) {
			var memo_div = document.createElement('div');
			var o1 = $(memo_div);
			var css1 = {
				position : 'absolute',
				left : left,
				top : top - 30,
				height : 30,
				'line-height' : '30px',
				background : 'antiquewhite',
				padding : '0 10'
			};
			o1.css(css1).text(caption);
			o1.attr('id', refId + "_____tip");
			$('body').append(o1);
		} else {
			o1 = $($X(refId + "_____tip"));
			o1.show();
		}
		return o1;
	};
	this.modifyRefHtml = function(obj) {
		var jo = $(obj);
		var ref = jo.attr('ref');
		var refTb = $('#EWA_FRAME_' + this.EWA._Id);
		var obj_control = refTb.find('[id="' + ref + '"]').prev(); // textarea
		// prev is
		// editor
		// table

		var left = jo.offset().left;
		var top = jo.offset().top;
		var width = jo.outerWidth();
		var height = jo.outerHeight();

		var css = {
			position : 'absolute',
			left : left,
			top : top,
			width : width,
			height : height,
			font : jo.css('font'),
			border : '2px solid antiquewhite',
			outline : 'none'
		};

		obj_control.css(css);

		$(obj_control.find('iframe')[0].contentWindow.document.body).css('width', 'auto').css('font', jo.css('font'));
		oldv = window[obj_control.attr('id').replace('box', '')].GetHtml();

		obj_control.attr('oldv', oldv);
		var td_memo = $($X('_ewa_tr$' + ref).cells[0]).text(); // td0
		var o1 = this.createRefCaption(ref, td_memo, left, top);

		obj_control.focus();

		var c = this;
		// console.log('set body mousedown')
		window.onmousedown = function(event) {
			if (c.checkInHtmlEditor(event.target)) {
				return;
			}
			var edit_id = obj_control.attr('id').replace('box', '');
			var html = window[edit_id].GetHtml();
			window.onmousedown = null;
			// console.log('remote body mousedown');

			var oldv = obj_control.attr('oldv');
			if (html == oldv) {
				$(obj_control).attr('style', '');
				o1.hide();
				// 值没有编号
				return;
			}
			var field = $(obj).attr('ref'); // field name
			var data = {
				key : field,
				val : html
			}
			// 执行更改提交
			var u = c.POST_URL || window.location.href;
			$JP(u, data, function(rst) {
				$(obj_control).attr('style', '');
				o1.hide();
				if (rst.RST) {
					if (html == "") {
						html = ".............";
					}
					jo.html(html);
					$TipTL('保存完毕');

					var edit = '<i style="margin-left:5px" class="fa fa-edit"></i>';
					jo.append(edit);
				} else {
					$Tip(rst.ERR);
				}
			});
		}
	};
	this.checkInHtmlEditor = function(obj) {
		var objs = $(event.target).parents();
		for (var i = 0; i < objs.length; i++) {
			var o = $(objs[i]);
			if (o.hasClass('ewa-editor') || o.hasClass('ewa-editor-pop') || o.hasClass('ewa-dialog')) {
				return true;
			}
		}
		return false;
	};
	this.modifyRef = function(obj) {
		var jo = $(obj);
		var ref = jo.attr('ref');
		var refTb = $('#EWA_FRAME_' + this.EWA._Id);
		var obj_control = refTb.find('[id="' + ref + '"]');

		if (obj_control[0].type == 'hidden') {// drop-list
			obj_control = $(obj_control).prev();
			// console.log(obj_control)
		}

		var left = jo.offset().left;
		var top = jo.offset().top;
		var width = jo.outerWidth();
		var height = jo.outerHeight();

		if (obj_control[0].tagName == "TEXTAREA") {
			height += 30;
		}
		var css = {
			position : 'absolute',
			left : left,
			top : top,
			width : width,
			height : height,
			font : jo.css('font'),
			border : '2px solid antiquewhite',
			outline : 'none'
		};

		obj_control.css(css);
		var oldv = obj_control.val();

		obj_control.attr('oldv', oldv);
		var td_memo = $($X('_ewa_tr$' + ref).cells[0]).text(); // td0
		var o1 = this.createRefCaption(ref, td_memo, left, top);

		obj_control.focus();

		if (obj_control.attr('evtblur')) {
			return;
		}
		obj_control.attr('evtblur', 'is_setted');

		var c = this;
		addEvent(obj_control[0], 'keydown', function(event) {
			var key_code = event.keyCode;
			if (13 == key_code && 'TEXTAREA' != obj_control[0].tagName) { // enter
				this.blur();
			} else if (27 == key_code) { // esc
				var v = $(this).attr('oldv');
				this.value = v;
				this.blur();
			}
		});
		addEvent(obj_control[0], 'blur', function() {
			var td = $(this.parentNode.parentNode.cells[0]);
			var bg = td.css('background-color');
			var mde = $(this).attr('onmousedown');
			if (mde) {
				var loc = mde.indexOf('.CheckValid');
				var cmd = mde.substring(0, loc);
				var chk = eval(cmd);
				var result = chk.CheckValid(this);
				if (!result) {
					this.focus();
					$(this).css('background', 'pink');
					return;
				} else {
					$(this).css('background', '');
				}
			}
			var k = this.id;
			var v = this.value;
			if ($(this).attr("ewa_class") == "droplist") {
				v = $(this).next().val();
				k = $(this).next().attr('id');
			}

			var data = {
				key : k,
				val : v
			}
			if (bg == 'rgb(255, 255, 224)') {
				$Tip(td.html());
				o1.hide();
				this.focus();
				return;
			}
			if (this.value == $(this).attr('oldv')) {
				$(this).attr('style', '');
				o1.hide();
				// 值没有编号
				return;
			}
			// 执行更改提交
			var u = c.POST_URL || window.location.href;

			var this_obj = this;
			$JP(u, data, function(rst) {
				$(this_obj).attr('style', '');
				o1.hide();
				if (rst.RST) {
					var newv = ('SELECT' == this_obj.tagName ? this_obj.options[this_obj.selectedIndex].text : this_obj.value);
					if (this_obj.tagName == 'TEXTAREA') {
						if (newv == "") {
							newv = ".............";
							jo.html(newv);
						} else {
							newv = newv.replace(/</ig, '&lt;').replace(/>/ig, '&gt;');
							var vs = newv.split('\n');
							var s = "<div>" + vs.join("</div><div>") + "</div>";
							jo.html(s);
						}
					} else {
						if (newv == "") {
							newv = ".............";
						}
						jo.text(newv);

					}
					var edit = '<i style="margin-left:5px" class="fa fa-edit"></i>';
					jo.append(edit);
					$TipTL('保存完毕');
				} else {
					$Tip(rst.ERR);
				}
			});
		});
	};

}// --------------------class of listFrame----------------
function EWA_ListFrameClass() {
	this.Xml = null;
	this._Ajax = null;
	this.ItemList = new EWA_FrameCommonItems();
	this._PageCurrent = null;
	this._PageSize = null;
	this._PageCount = null;
	this._RecordCount = null;
	this._PageCurrentName = null;
	this._PageSizeName = null;
	this._PageCountName = null;
	this._RecordCountName = null;
	this._Sort = null;
	this._SortName = null;
	this._SearchExp = ""; // 检索表达式
	this._SearchHtml = null;
	this._SearchFields = [];
	this._Id = null;
	this._IsCheckedAll = true;
	this._SearchDialog = null;
	this._SearchJson = {};
	this.Resources = {}; // EWA_FrameResoure
	this.GotoParas = [];
	this._CurTr = null;
	this._TrSelectMulti = true; // 是否多选
	this.IsTrSelect = false; // 是否可以选择行
	this.ReloadAfter = null; // Ajax刷新后的事件，用户定义
	this.CheckedAllAfter = null; // 全选后的时间，用户定义
	this.IsNotMDownAutoChecked = false; // 自动选择checkbox radio;
	// 2022-05-26
	this.REPLACE_HISTORY_STATE = false; // 列表查询更换网页的url

	this._IsSearchGroup = true; //2024-02-27 查询分组标记，默认分组

	//根据参数重新刷新表格 paras="abc=1&name=sun&gendar=0"
	this.changeTag = function(paras) {
		let tu = new EWA_UrlClass('fake?' + paras);
		let u = new EWA_UrlClass(this.Url);
		for (let para in tu._Paras) {
			u.AddParameter(para, tu._Paras[para]);
		}
		this.Url = u.GetUrl();
		this.Reload();
	};
	this._InitMneu = function() {
		let menus = window["_EWA_MENU_" + this._Id];
		//console.log(menus)
		if (!menus || menus.length == 0) {
			return;
		}
		let ss = [];
		for (let i = 0; i < menus.length; i++) {
			let menu = menus[i];
			let css = (i == 0 ? 'ewa-lf-menu-marked' : '') +
				(i == menus.length - 1 ? 'ewa-lf-menu-last' : '');
			let cmd = menu.Cmd.replace(/"/g, '&quot;');
			let js = "$(this).parent().find('.ewa-lf-menu-marked').removeClass('ewa-lf-menu-marked');$(this).addClass('ewa-lf-menu-marked');";
			let s = `<a class="ewa-lf-menu ${css}" onclick="${js} ${cmd}">${menu.Txt}</a>`;
			ss.push(s);
		}
		let html = ss.join('<b class="ewa-lf-menu-span"></b >');
		$('#EWA_RESHOW_' + this._Id).find('.ewa_lf_func_caption').after(html);

	}
	// 固定左侧的columns的位置,从0开始
	this.stickyColumns = function(columns) {
		var tb = $X('EWA_LF_' + this._Id);
		if (tb == null) {
			console.log('not found table[#EWA_LF_' + this._Id + "]");
			return;
		}
		if (tb.rows.length == 0) {
			return;
		}
		let scrollDiv = $(tb).parent();
		scrollDiv.addClass('ewa-lf-sticky-scroll');
		// 滚动条滑动时，显示或隐藏最后一个column的右侧阴影
		scrollDiv.on('scroll', function() {
			if (this.scrollLeft == 0) {
				scrollDiv.addClass('ewa-lf-stick-last-hide');
			} else {
				if (scrollDiv.hasClass('ewa-lf-stick-last-hide')) {
					scrollDiv.removeClass('ewa-lf-stick-last-hide');
				}
			}
		})
		for (let i = 0; i < columns; i++) {
			this.stickyColumn(i, i == columns - 1, tb);
		}
		scrollDiv.trigger('scroll');
	};
	this.stickyColumn = function(index, isLast, tb) {
		tb = tb || $X('EWA_LF_' + this._Id);
		if (tb == null) {
			console.log('not found table[#EWA_LF_' + this._Id + "]");
			return;
		}
		if (tb.rows.length == 0) {
			return;
		}
		let row0 = tb.rows[0];
		let cell = row0.cells[index];
		if (!cell) {
			return;
		}
		let left = $(cell).position().left;
		let width = $(cell).width();
		let css = {
			left: left,
			width: width
		};

		for (let m = 0; m < tb.rows.length; m++) {
			let c = $(tb.rows[m].cells[index]);

			c.css(css).addClass('ewa-lf-sticky');
			if (isLast) {
				//最后一个column的右侧阴影
				c.addClass('ewa-lf-sticky-last')
					//避免overflow=hidden遮挡阴影
					.css('overflow', 'initial');
			}
		}
	};
	/**
	* 合并文字搜索到第一个input中
	 */
	this.composeSearchTexts = function() {
		var titles = [];
		var names = [];
		var objs = $('#EWA_RESHOW_' + this._Id + ' .ewa-lf-search-type-text');
		if (objs.length == 0) {
			return null;
		}
		objs.each(function(index) {
			var txt = $(this).find('.ewa-lf-search-item-title').text();
			txt = txt.replace(":", "").replace("：", "").replace("包含", "").replace("Like", "").trim();

			var name = $(this).find('input[type=text]').attr('name');
			titles.push(txt);
			names.push(name);
			if (index > 0) {
				$(this).hide();
			}
		});
		let searchTable = $(objs[0]);
		searchTable.addClass('ewa-app-lf-search-compose');
		searchTable.find('input[type=text]').attr('name', names.join(','))
			.attr('placeholder', titles.join(", "));
		let a = searchTable.find('a').clone(); // like,rlike ...
		searchTable.find('.ewa-lf-search-item-title b').text(EWA.LANG == 'enus' ? 'Search' : '综合搜索').append(a);
		return objs;
	}
	/**
	* 开关元素变化后调用的Action
	* @param source input[type=checkbox]元素
	* @param actionName 提交到后台的 action
	 */
	this.switchButtonAction = function(source, actionName) {
		if (!actionName) {
			return;
		}
		let u1 = this.getUrlClass();
		u1.AddParameter("ewa_switch_name", source.name);
		u1.AddParameter("ewa_action", actionName);
		u1.AddParameter("ewa_ajax", "json");
		u1.AddParameter("ewa_switch", source.checked ? 'on' : 'off');
		u1.AddParameter("ewa_action_key", $(source).parentsUntil('tbody').last().attr('ewa_key'));
		let parent = source.parentNode;
		let names = parent.getAttributeNames();
		// 附加父元素的属性，可在配置中定义元素属性
		let data = {};
		for (let n in names) {
			let name = names[n];
			let val = parent.getAttribute(name);
			if (name.indexOf('on') == 0 || name == 'name' || name == 'id' || name == 'class') {
				continue;
			}
			data[name] = val;
		}
		let that = this;

		let u = u1.GetUrl();
		$JP(u, data, function(rst) {
			// 可以外部定义回调函数 extSwitchCallBack
			if (that.extSwitchCallBack) {
				that.extSwitchCallBack(source, rst);
			}
		});
	};


	/**
	 * 添加回收站标志
	 */
	this.ShowRecycle = function() {
		var tb = $X('EWA_LF_' + this._Id);
		if (tb == null) {
			// console.log('not found table[#EWA_LF_' + this._Id + "]");
			return;
		}
		var t = $(tb).parentsUntil('table').last().find('.ewa_lf_func_caption');
		if (t.length == 0) {
			// console.log('not found table[#EWA_LF_' + this._Id + "]
			// .ewa_lf_func_caption");
			return;

		}
		var recycle_name = '回收站';
		if (window._EWA_INFO_MSG && window._EWA_INFO_MSG.RECYCLE) {
			recycle_name = window._EWA_INFO_MSG.RECYCLE;
		}
		var s = "<div class='ewa_lf_func_dact ewa-lf-func-recycle' onclick='EWA.F.FOS[\"" + this._Id + "\"].ShowRecycle1(this)' ><b class='fa fa-recycle'></b>"
			+ recycle_name + "</div>";
		t.parent().append(s);
	};
	/**
	 * 切换回收站内容
	 */
	this.ShowRecycle1 = function(obj) {
		var u1 = new EWA_UrlClass(this.Url);
		var u;
		if ($(obj).attr('recycle')) {
			u = u1.RemoveParameter("ewa_recycle");
			$(obj).attr('recycle', null).removeClass('ewa-lf-func-recycle-yes');
		} else {
			u = u1.AddParameter("ewa_recycle", "1");
			$(obj).attr('recycle', 1).addClass('ewa-lf-func-recycle-yes');
		}
		this.Url = u;
		this.Goto(1);
	};
	this.BindButton = function(from, to) {
		$('#EWA_LF_' + this._Id + ' tr[ewa_key] [id="' + from + '"]').each(function() {
			$(this).attr('onclick', '$(this).parent().parent().find(\'[id="' + to + '"]\')[0].click()');
			$(this).addClass('ewa-map-button');
		});
	};
	this.Merges = function(cfgs) {
		if (cfgs == null || cfgs.length == 0) {
			console.log("cfg.from, cfg.to, cfg.str, cfg.func, cfg.header");
			return;
		}
		for (let i = 0; i < cfgs.length; i++) {
			let cfg = cfgs[i];
			this.Merge(cfg.from, cfg.to, cfg.str, cfg.func, cfg.header);
		}
	};
	/**
	 *  合并单元格
	 * @param from 来源对象的id
	 *		
	 * @param to 合并到的对象的id
	 * @param meargeStr  合并添加的字符
	 * @param funcEachRow
	 *            每行合并完成后执行的方法
	 * @param isMergeHeader 是否合并头部标题
	 */
	this.Merge = function(from, to, mergeStr, funcEachRow, isMergeHeader) {
		let tb = $('#EWA_LF_' + this._Id);
		if (mergeStr == null) {
			mergeStr = "";
		} else if (mergeStr.indexOf('<') == -1) {
			mergeStr = "<span class='ewa-merge-str ewa-mearge-str'>" + mergeStr + "</span>"
		}
		tb.find('tr[ewa_key],tr.ewa-lf-sub-tr').each(function() {
			let toObj = $(this).find('[id="' + to + '"]');
			let toParent = toObj.parentsUntil('tr').last();
			if (toParent.attr('ewa-merged') == 'yes') {// 已经合并
				return;
			}
			toParent.attr('ewa-merged', 'yes');

			let fromobj = $(this).find('[id="' + from + '"]');
			let fromobjParent = fromobj.parentsUntil('tr').last();
			fromobjParent.hide();

			// 分割字符
			toParent.append(mergeStr);

			toParent.append(fromobj);
			if (funcEachRow) {
				funcEachRow(toParent, this); // td, tr
			}
		});
		//	2020-05-28 合并列表头 			
		if (isMergeHeader) {
			let headerHtml = "<span class='ewa-lf-merge-header-split'></span>"
				+ tb.find('tr[ewa_tag="HEADER"] [id="' + from + '"]').html();
			tb.find('tr[ewa_tag="HEADER"] [id="' + to + '"]')
				.append(headerHtml);
		}
		tb.find('tr[ewa_tag="HEADER"] [id="' + from + '"]').parent().hide();
		tb.find('td#ADD_ROW_' + from).hide();
	};
	this.Mearge = function(from, to, meargeStr) {
		console.log('拼写错误，请用 Merge')
		this.Merge(from, to, meargeStr);
	};
	/**
	 * 根据表达式合并单元格
	 * 
	 * @param toParent
	 *            合并到的对象的id
	 * @param mergeExp
	 *            表达式
	 * @param isAddMemo
	 *            是否添加备注
	 * @param funcEachRow
	 *            每行合并完成后执行的方法
	 * @param isMergeHeader 合并头部标题
	 */
	this.MergeExp = function(toParent, mergeExp, isAddMemo, funcEachRow, isMergeHeader) {
		if (!mergeExp) {
			console.log("mergeExp 没有设置");
			return;
		}
		let tb = $('#EWA_LF_' + this._Id);

		// mergeExp="@id1 x @id2 = @id3 (@id4)"
		var r1 = /\@\@[a-zA-Z0-9\-\._:]*\b/ig;
		var m1 = mergeExp.match(r1);
		var paras = [];
		var tmp_html = mergeExp;
		var memos = {};

		//	2020-05-28 	合并列表头
		let headers = [];
		for (var i = 0; i < m1.length; i++) {
			var key = m1[i];
			paras.push(key);
			var id = key.replace('@@', '');
			// mearge是拼写错误
			let rep = "<span class='ewa-lf-merge ewa-lf-merge-" + id + " ewa-lf-mearge ewa-lf-mearge-" + id + "' mid=\"" + id + "\"></span>";
			tmp_html = tmp_html.replace(key, rep);
			if (id != toParent) {
				tb.find('tr[ewa_tag="HEADER"] [id="' + id + '"]').parent().hide();
				// 计算行
				tb.find('td#ADD_ROW_' + id).hide();
			}
			let header = tb.find('tr[ewa_tag="HEADER"] [id="' + id + '"]').html();
			memos[id] = header;
			//	2020-05-28 	合并列表头
			headers.push(header);
		}

		if (isMergeHeader) {
			let headersHtml = headers.join("<span class='ewa-lf-merge-header-split'></span>");
			tb.find('tr[ewa_tag="HEADER"] [id="' + toParent + '"]').html(headersHtml);
		}

		tb.find('tr[ewa_key],tr.ewa-lf-sub-tr').each(function() {
			var target = $(this).find('[id="' + toParent + '"]');
			if (target.length == 0) {
				console.log('not find ' + toParent);
				return;
			}
			// td
			var p = $(this).hasClass('ewa-lf-sub-tr') ?
				$(this).find('[id="ADD_ROW_' + toParent + '"]') : //统计合并
				$(this).find('.ewa-col-' + toParent);

			if ('yes' == p.attr('ewa-merged')) {// 已经合并
				return;
			}


			var o1 = $('<div style="display:none"></div>');
			o1.html(tmp_html);

			// var tmp = mergeExp;
			for (var n in paras) {
				var exp = paras[n];
				var key = exp.replace('@@', '');
				var o = $(this).find('[id="' + key + "\"]");
				if (o.length == 0) {
					continue;
				}
				if (key != toParent) {
					o.parent().hide();
				}
				var t = o1.find('span[mid="' + key + '"]');
				if (isAddMemo) {
					t.append("<span class='ewa-lf-mearge-memo'></span>");
					t.find('.ewa-lf-mearge-memo').html(memos[key]);
				}
				t.append(o);
			}
			while (o1[0].childNodes.length > 0) {
				p.append(o1[0].childNodes[0]);
			}
			$(o1).remove();
			if (funcEachRow) {
				funcEachRow(p, this); // td, tr
			}

			p.attr('ewa-merged', 'yes');
		});
	};
	this.MeargeExp = function(toParent, meargeExp, isAddMemo, func) {
		console.log('拼写错误，请用 MereExp');
		this.MergeExp(toParent, meargeExp, isAddMemo, func);
	}
	/**
	 * 在页面底部添加合计数
	 */
	this.SubBottoms = function(ids) {
		this.SubBottomsArray = ids.split(',');
		this._SubBottoms();
	}
	this.reCalcBottoms = function() {
		this._SubBottoms();
	};
	this._SubBottoms = function() {
		let tb = $('#EWA_LF_' + this._Id);
		let r = tb.find('.ewa-lf-sub-tr');
		if (r.length == 0) {
			r = $(this.AddRow([]));
			r.addClass('ewa-lf-sub-tr');
			r.find('td').addClass('ewa-lf-sub-td');
		} else {
			r.find('td').text("");
		}

		for (let i in this.SubBottomsArray) {
			let id = this.SubBottomsArray[i];
			let total = 0;
			let exp = '#EWA_LF_' + this._Id + ' .ewa-lf-data-row [name="' + id + '"]';
			let fm_length = 0;
			$(exp).each(function() {
				let v;
				if (this.hasAttribute('value')) {
					v = this.value;
				} else if (this.hasAttribute('title')) {
					v = this.title;
				} else {
					v = this.innerText;
				}
				if (v == null || v.length === 0) {
					return;
				}
				v = v.replace(/,/ig, '');
				if (isNaN(v)) {
					return;
				}
				total += v * 1;
				if (v.indexOf(".") > 0) {
					fm_length = 2;
				}
			});
			let html = "<span id='" + id + "' name='" + id + "' class='ewa-lf-sub'>" + total.fm(fm_length) + "</span>";
			r.find('td[id=ADD_ROW_' + id + "]").html(html);
		}
	};

	this.ChangeRowStyle = function(checkColIdx, atttName, styleJson) {
		var tb = $X('EWA_LF_' + this._Id);
		for (var i = 1; i < tb.rows.length; i++) {
			var r = tb.rows[i];
			if (r.cells.length == 0 || r.cells.length <= checkColIdx) {
				continue;
			}
			var v = r.cells[checkColIdx].childNodes[0].getAttribute(atttName);
			if (v == null) {
				continue;
			}
			if (styleJson[v]) {
				for (var m = 0; m < r.cells.length; m++) {
					r.cells[m].style.cssText = r.cells[m].style.cssText + ';' + styleJson[v];
				}
			}
		}
		if (this.ReloadAfter == null) {
			var c = this;
			this.ReloadAfter = function() {
				c.ChangeRowStyle(checkColIdx, atttName, styleJson);
			}
		}

	}
	this.MDownEvent = function(tr, evt) {
		// change to your event
	};
	/**
	 * 加载配置文件的JSON
	 * 
	 * @param {}
	 *            actionName 执行的加载名称
	 * @param {}
	 *            func 回调的方法名称
	 */
	this.LoadJson = function(actionName, func) {
		if (actionName == null) {
			return;
		}
		var u = this.Url + '&EWA_ACTION=' + actionName + '&EWA_AJAX=JSON';
		$J(u, func);
	};

	/**
	 * 调用工作流
	 * 
	 * @param {}
	 *            unitType 单元类型
	 * @param {}
	 *            name 名称
	 * @param {}
	 *            obj 来源对象
	 * @param {}
	 *            keyValue 当前行的Key值
	 * @param {}
	 *            uOk 是否用户同意
	 * @param {}
	 *            uMsg 附加用户信息
	 */
	this.Workflow = function(unitType, name, obj, keyValue, uOk, uMsg) {
		EWA.F.CID = this._Id;

		this._Ajax = this.CreateAjax();

		this._Ajax.AddParameter("EWA_AJAX", "WORKFLOW");
		this._Ajax.AddParameter("EWA_ID", this._Id);
		this._Ajax.AddParameter("EWA_WF_NAME", name);

		// this.StopAjaxAfterReload = true;
		// this._Ajax.AddParameter("EWA_ACTION_RELOAD", "0");
		var inc = 0;
		if (obj != null) { // ListFrame每行的主键值
			var key = this.GetRowKey(obj);
			this._Ajax.AddParameter("EWA_ACTION_KEY", key);
			if (obj.getAttribute('ewa_wf_control') == 'true') {
				this._Ajax.AddParameter("EWA_WF_CTRL", 1);
			} else {
				this._Ajax.AddParameter("EWA_WF_CTRL", 0);
			}
		} else {
			// 从Frame中调用
			this._Ajax.AddParameter("EWA_WF_CTRL", 1);
		}
		if (keyValue != null) {
			this._Ajax.AddParameter("EWA_ACTION_KEY", keyValue);

		}
		if (uOk) {
			this._Ajax.AddParameter("EWA_WF_UOK", uOk);
		}
		if (uMsg) {
			this._Ajax.AddParameter("EWA_WF_UMSG", uMsg);
		}
		var c = this;
		this._Ajax.PostNew(this.Url, function() {
			c._CallBackJs();
		});
	}
	/**
	 * ListFrame每行的主键值
	 * 
	 * @param {}
	 *            obj
	 * @return {}
	 */
	this.GetRowKey = function(obj) {
		var tr = this.GetRow(obj);
		if (tr != null) {
			var key = tr.getAttribute("EWA_KEY");
			return key;
		}
		return null;
	}

	this.GetRow = function(obj) {
		if (obj == null || obj.tagName == null || obj.tagName == '') {
			return null;
		}
		var inc = 0;
		var tr = obj.parentNode;
		while (!(tr.tagName == 'TR' && tr.getAttribute('EWA_KEY') != null)) {
			tr = tr.parentNode;
			if (tr.tagName == 'BODY') {
				tr = null;
				break;
			}
			inc++;
			if (inc > 100) {
				alert('循环100次，未发现TR');
				break;
			}
		}
		return tr;

	}
	this.RecordModify = function(xmlName, itemName, addParas) {
		var ids = this.SelectChecked();
		if (ids.length == 0) {
			EWA.UI.Msg.Alter("请先选择", "修改");
			return;
		}
		var id = ids;
		var q = window.location.search;
		// alert(q);
		var ps = "EWA_MTYPE=M";
		if (addParas != null && addParas.trim().length > 0) {
			ps += "&" + addParas;
		}
		ps += id;
		EWA.UI.Dialog.OpenReloadClose(this._Id, xmlName, itemName, false, ps);
	};
	this.RecordNew = function(xmlName, itemName, addParas) {
		var ps = "EWA_MTYPE=N";
		if (addParas != null && addParas.trim().length > 0) {
			ps += "&" + addParas;
		}
		EWA.UI.Dialog.OpenReloadClose(this._Id, xmlName, itemName, false, ps);
	};
	this.SelectSingle = function() {
		this.IsTrSelect = true;
		this._TrSelectMulti = false;
	};
	this.SelectMulti = function() {
		this.IsTrSelect = true;
		this._TrSelectMulti = true;
	};
	this.MOver = function(tr, evt) {
		if (!this.IsTrSelect)
			return;
		if (this._CurTr == tr) {
			return;
		}
		if (this._CurTr != null) {
			if (this._CurTr.getAttribute('__ewa_lf_mdown') != '1') {
				this._MSetBg(this._CurTr, '');
			} else {
				this._MSetBg(this._CurTr, 'down');
			}
		}
		if (tr.getAttribute('__ewa_lf_mdown') != '1') {
			this._MSetBg(tr, 'over');
		} else {
			this._MSetBg(tr, 'down');
		}
		this._CurTr = tr;
		if (this.MOverEvent) {
			try {
				this.MOverEvent(tr, evt);
			} catch (e) {
				console.log(e, this.MOverEvent);
			}
		}
	};

	this.MOut = function(evt) {
		if (!this.IsTrSelect)
			return;

		if (this._CurTr == null) {
			return;
		}

		if (this._CurTr.getAttribute('__ewa_lf_mdown') == '1') {
			return;
		}
		// for (var i = 0; i < this._CurTr.cells.length; i++) {
		// $(this._CurTr.cells[i]).removeClass('ewa_grid_down')
		// }
		this._MSetBg(this._CurTr, 'out');
		if (this.MOutEvent) {
			try {
				this.MOutEvent(this._CurTr, evt);
			} catch (e) {
				console.log(e, this.MOutEvent);
			}
		}
		this._CurTr = null;

	};
	/**
	 * 检查是否可以进行行点击事件，用户可以注册此事件
	 */
	this.MDownEnableCheck = function(tr, evt) {
		return true
	};
	this.checkMDownEnable = function(tr, evt) {
		if (!evt) {// 如果没有event,则不检测
			return true;
		}
		var target = evt.srcElement ? evt.srcElement : evt.target;
		if (!target) {
			return true;
		}
		if (target.tagName == 'TD' && target.parentNode == tr) {
			return true;
		}
		if (target.tagName == 'A'
			|| target.parentNode.tagName == 'A'
			|| target.tagName == 'INPUT'
			|| target.tagName == 'SELECT'
			|| target.tagName == 'BUTTON'
			|| target.tagName == 'TEXTAREA'
			|| target.className.indexOf("EWA_LF_EDIT") >= 0
			|| target.className.indexOf("ewa-lf-edit") >= 0
			|| target.className.indexOf("ewa-lf-search-text-click") >= 0
			|| target.parentNode.className.indexOf("ewa-lf-search-text-click") >= 0
			|| target.parentNode.parentNode.className.indexOf("ewa-lf-search-text-click") >= 0
			|| target.className.indexOf('ewa-mdown-stop') >= 0
		) {
			return false;
		}
		// 如果全td的话，会造成混淆
		//if(target.tagName == 'TD' && target.parentNode == tr){
		//	if($(target).children('a:visible').length > 0){
		//		return false;
		//	}
		//}
		return true;
	};
	// 选择当前行的checkbox或radio
	this.mDownAutoCheck = function(tr, objs, target) {
		var chk = null;
		for (var i = 0; i < objs.length; i++) {
			if (objs[i].parentNode.className.indexOf('ewa-switch') >= 0) {
				// switch 开关不执行
				break;
			}
			if (objs[i].type.toUpperCase() == 'RADIO') {
				chk = objs[i];
				chk.click();
				return chk;
			}
			if (objs[i].type.toUpperCase() == 'CHECKBOX') {
				chk = objs[i];
				chk.click();
				// 2020-05-28 单选始终选中
				// 当target包含当前input时才选中，否则取消其他选中项
				if (!this._TrSelectMulti) {
					let iptName = $(objs[i]).attr("id") || $(objs[i]).attr("name");
					if ($(target).find(objs[i]).length == 0) {
						$(tr).siblings(".ewa-lf-data-row").find("input[name='" + iptName + "']:checked").prop("checked", false);
					}
					chk.checked = true;
				}
				return chk;
			}
		}
		return null;
	};
	/**
	 * 在当前行新增一个新行, 2024-07-24
	 * @param tr 当前行
	 */
	this.newRowOneTd = function(currentTr) {
		if (currentTr == null) {
			return null
		}
		currentTr = $(currentTr)[0];
		let nextTr = currentTr.parentNode.rows[currentTr.rowIndex + 1];
		if (nextTr != null && nextTr.getAttribute('add_pre_row') == "1") {
			return nextTr;
		}
		let o = currentTr.parentNode.parentNode; // tb
		let colspan = o.rows[0].cells.length;

		nextTr = o.insertRow(currentTr.rowIndex + 1);
		nextTr.setAttribute('add_pre_row', 1);
		let td = nextTr.insertCell(-1);
		td.colSpan = colspan;
		td.className = 'ewa-lf-add-pre-cell';
		nextTr.style.display = 'none';
		td.id = EWA_Utils.tempId('EWA_LF_NR_' + this._Id);
		$(nextTr).addClass('ewa-lf-add-pre-row');

		return nextTr;
	};
	this.MDown = function(tr, evt) {
		if (!this.IsTrSelect)
			return;
		var t = new Date().getTime();
		var ot = $(tr).attr('mdown_time_last');
		if (ot != null && t - ot < 500) {// 两次事件间隔小余0.5s
			return;
		}
		$(tr).attr('mdown_time_last', t);

		var evt = evt == null ? window.event : evt;
		if (!this.MDownEnableCheck(tr)) {
			// 用户自定义
			return;
		}
		if (!this.checkMDownEnable(tr, evt)) {
			return;
		}
		var target = evt.srcElement ? evt.srcElement : evt.target;

		var chk = null;
		var objs = tr.getElementsByTagName('input');
		if (!this.IsNotMDownAutoChecked) {// 允许自动选择
			chk = this.mDownAutoCheck(tr, objs, target);
		}
		if (tr.getAttribute('__ewa_lf_mdown') == '1') {
			if (this._TrSelectMulti) { // 多选取消选择
				if (chk && chk.type.toUpperCase() == 'CHECKBOX') {
					chk.checked = false;
				}
				this._MSetBg(tr, '');
				tr.removeAttribute('__ewa_lf_mdown');
				$(tr).removeClass('ewa-lf-mdown');
			} else {
				// 单选保持状态
			}
		} else {
			if (chk) {
				chk.checked = true;
			}
			this._MSetBg(tr, 'down');
			tr.setAttribute('__ewa_lf_mdown', 1);
			$(tr).addClass('ewa-lf-mdown');
			if (!this._TrSelectMulti) {
				var tb = tr.parentNode;
				if (tb && tb.rows) { // tr有可能被挪走了
					for (var i = 0; i < tb.rows.length; i++) {
						var tr1 = tb.rows[i];
						if (tr1.getAttribute('__ewa_lf_mdown') == '1' && tr1 != tr) {
							tr1.removeAttribute('__ewa_lf_mdown');
							$(tr1).removeClass('ewa-lf-mdown');
							this._MSetBg(tr1, '');
						}
					}
				}
			}
			if (this.IsReShow) {
				for (var i = 0; i < objs.length; i++) {
					if (objs[i].type.toUpperCase() == 'BUTTON') {
						var o = objs[i];
						if (o.getAttribute('disabled') == 'true' || o.getAttribute('disabled') == true || o.parentNode.getAttribute('disabled') == 'true'
							|| o.parentNode.getAttribute('disabled') == true) {
							this._ReshowButs[o.value].disabled = true;
							this._ReshowButs[o.value].style.display = 'none';
						} else {
							this._ReshowButs[o.value].disabled = false;
							this._ReshowButs[o.value].style.display = '';
						}
					}
				}
			}
		}
		if (this._IsAddPreRow) {
			var aid = tr.getAttribute('ewa_key');
			if (!this.AddPreRowCheck(tr, aid, evt)) {
				// 检查触发对象，用户改写，默认为true
				return;
			}
			var nextTr = this.newRowOneTd(tr);

			if (this.prevTr) {
				if (this.AddPreRowCloseBeforeEvent) {
					// 关闭前触发事件
					// 参数：FrameUnid, 当前行，当前行的key，下一行(要放置东西的行)，鼠标事件
					this.AddPreRowCloseBeforeEvent(this._Id, tr, aid, this.prevTr, evt);
				}
				this.prevTr.style.display = 'none';
				this.prevTr.cells[0].innerHTML = '';
				if (this.AddPreRowCloseEvent) {
					// 关闭显示触发事件
					// 参数：FrameUnid, 当前行，当前行的key，下一行(要放置东西的行)，鼠标事件
					this.AddPreRowCloseEvent(this._Id, tr, aid, this.prevTr, evt);
				}
			}

			if (this.prevTr == nextTr) {
				this.prevTr = null;
				return;
			}
			this.prevTr = nextTr;
			this.prevTr.style.display = '';
			// 参数：FrameUnid, 当前行，当前行的key，下一行(要放置东西的行)，鼠标事件
			this.MDownEvent(this._Id, tr, aid, this.prevTr, evt);
		} else {
			this.MDownEvent(tr, evt);
		}
	};
	/**
	 * 添加点击当前行，触发的在之后行显示的内容方法
	 * 
	 * @param func
	 *            function(frameUnid, tr, key, newTr, evt)
	 */
	this.AddPreRow = function(func) {
		if (!this._IsAddPreRow) {
			this.MDownEvent = func;
		}
		this._IsAddPreRow = true;
	};
	/**
	 * 检查是否可以执行 AddPreRow 的方法，返回true执行，false不执行<br>
	 * 用于覆盖
	 * 
	 * @param tr
	 *            事件当前行
	 * @param key
	 *            事件当前行的key(ewa_key)
	 * @param evt
	 *            event事件
	 * @returns true/false
	 */
	this.AddPreRowCheck = function(tr, key, evt) {
		// 检查触发对象，用户需要改写此方法
		return true;
	};
	/**
	 * 关闭显示之前触发事件
	 * 
	 * @param frameUnid
	 *            配置项的 unid
	 * @param tr
	 *            事件当前行
	 * @param key
	 *            当前行的key
	 * @param newTr
	 *            下一行(要放置东西的行)，只有一个单元格，其id是随机数，调用采用 newTr.cells[0]
	 * @param evt
	 *            event事件
	 */
	this.AddPreRowCloseBeforeEvent = function(frameUnid, tr, key, newTr, evt) {
		// 用户需要改写此方法
	};
	/**
	 * 关闭显示后触发事件
	 * 
	 * @param frameUnid
	 *            配置项的 unid
	 * @param tr
	 *            事件当前行
	 * @param key
	 *            当前行的key
	 * @param newTr
	 *            下一行(要放置东西的行)，只有一个单元格，其id是随机数，调用采用 newTr.cells[0]
	 * @param evt
	 *            event事件
	 */
	this.AddPreRowCloseEvent = function(frameUnid, tr, key, newTr, evt) {
		// 用户需要改写此方法
	};

	this._MSetBg = function(tr, type) {
		let className = '';
		if (type == 'down') {
			className = 'ewa_grid_down';
		} else if (type == 'over') {
			className = 'ewa_grid_mover';
		}
		$(tr).children("td").removeClass('ewa_grid_mover ewa_grid_down').addClass(className);
	};
	/**
	 * 用于检索辅助快速点击
	 */
	this._ReShowSearchQuick = function() {
		var c = this;

		var items = EWA_ListFrameClass.prototype.RESOURCES.search_text_items;
		var eq_item, lk_item; // 文字检索的 标签
		for (var n in items) {
			var item = items[n];
			if (item.Id == 'eq') { // 等于
				eq_item = item;
			}
			if (item.Id == 'lk') {// like
				lk_item = item;
			}
		}

		for (var n in this._SearchJson) {
			var o = this._SearchJson[n];
			if (!o.isSearchQuick) {
				continue;
			}

			var objs = $('#EWA_LF_' + this.Id + ' .ewa-lf-data-row [id="' + n + '"]');
			objs.bind('click', function(event) {
				event.stopPropagation();

				// 检索方式
				var search_tag = $(this).attr('search_tag');
				var search_value = $(this).text();
				var search_value1 = search_value;

				var ipt = $('#EWA_SEARCH_ITEM_' + c.Id + ' .ewa-lf-search-item-ctl [name="' + this.id.toUpperCase() + '"]');

				if (search_tag == 'number' || search_tag == 'date') { // 日期和数字为2个输入框
					ipt = ipt.parentsUntil('.ewa-lf-search-item').last().find('input');
				}
				var q_obj = ipt.parentsUntil('.ewa-lf-search-item').last().find('a');

				//console.log(event);
				if (search_tag == 'date') {
					search_value = search_value.split(' ')[0];
					search_value1 = search_value + " 23:59:59";
				} else if (search_tag == 'fix') {
					var findOptionValue = null;
					ipt.find('option').each(function() {
						if (this.text == search_value) {
							findOptionValue = this.value;
						}
					});
					if (findOptionValue === null) {
						search_value = "";
					} else {
						search_value = findOptionValue;
					}
				}
				//console.log(search_value, search_value1);
				if (ipt.val() == search_value) {
					// 已经赋值，清除赋值
					if (search_tag == 'text' && lk_item && q_obj.length > 0) {
						q_obj.attr('tag', lk_item.Id);
						q_obj.html(EWA.LANG == 'enus' ? lk_item.TxtEn : lk_item.Txt);
					}
					ipt.val("");
					return;
				}
				// 设定检索值
				if (search_tag == 'text' && eq_item && q_obj.length > 0) {
					q_obj.attr('tag', eq_item.Id);
					q_obj.html(EWA.LANG == 'enus' ? eq_item.TxtEn : eq_item.Txt);
				}
				ipt.val(search_value);
				if (search_tag == 'date') {
					ipt[1].value = search_value1;
				}
			});
			objs.each(function() {
				if ($(this).text()) { // 空白字符不添加
					$(this).addClass('ewa-lf-search-text-click').attr('search_tag', o.T);
				}
			});

		}
	};
	this.ReShowWithNoButtons = function() {
		var gridTable = $X('EWA_LF_' + this._Id);
		var rowIndexes = [];
		for (var name in this.ItemList.Items) {
			var node = this.ItemList.Items[name];
			var s = this._GetSubValue("Tag", "Tag", node);
			if (s == null || s.trim().toLowerCase() != 'button') {
				continue;
			}
			for (var i = 0; i < gridTable.rows[0].cells.length; i++) {
				var cell = gridTable.rows[0].cells[i];
				if (cell.childNodes[0].id.toUpperCase() == name) {
					rowIndexes.push(i);
					node.setAttribute("but_show", "1");
					break;
				}
			}
		}
		this.ShowHiddenColumns(rowIndexes, false);

	};
	this.ReShowButtonsInDailogTitle = function() {
		EWA.OW.Load();
		if (!EWA.OW.Dia) {
			return;
		}
		var titleTd = $(EWA.OW.Dia._Dialog.GetFrameTitle());
		var id = "EWA_RESHOW_" + this._Id;
		var buttonsTd = $($X(id)).find('td.ewa_lf_func:eq(0)');
		var c = this;
		buttonsTd.find('.ewa_lf_func_dact').each(function() {
			var id = EWA_Utils.tempId('gDx_' + c._Id + "_");
			this.id = id;
		});
		titleTd.html(buttonsTd.html());
		titleTd.find('.ewa_lf_func_dact').each(function() {
			this.onclick = function() {
				var id = this.id;
				buttonsTd.find('div[id="' + id + '"]').click();
			};
		});
		buttonsTd.parent().hide();

		$(EWA.OW.Dia._Dialog.GetFrame()).addClass('ewa-lf-btns-in-title');
	};
	this.ReShow = function(notReDrawButtons) {
		this.IsReShow = true;
		var newDivId = '_G_' + this._Id;
		this.NewDivId = newDivId;

		let html = [];
		html.push("<table class='ewa-lf-reshow' id='EWA_RESHOW_" + this._Id + "'>");

		// td
		html.push("<tr style='display:none'><td style='padding:0'></td></tr>");

		// td00
		html.push("<tr><td class='ewa_lf_func' style='padding:0'>");
		html.push("<div style='display:none'></div>");
		html.push("<div><div class='ewa_lf_func_caption'></div></div>");
		html.push("</td></tr>");

		// td10
		html.push("<tr><td style='width:100%;padding:0;vertical-align:top'>");
		html.push("<div id='" + newDivId + "' style=''></div>");
		html.push("</td></tr>");

		html.push("</table>");

		let tbReShow = $(html.join(""));
		// $('body').append(tbReShow);
		var isFrame = !(this.Url.toUpperCase().indexOf('EWA_AJAX=INSTALL') > 0 || this.Url.toUpperCase().indexOf('EWA_CALL_METHOD=INNER_CALL') > 0 || this.Url
			.toUpperCase().indexOf('.JSP') > 0);
		if (isFrame) {
			// EWA.UI.Utils.SetStyle(document.body,"margin:0px;overflow:hidden");
			EWA.UI.Utils.SetStyle(tbReShow[0], "width:100%;height:100%;border-spacing:0");
		} else {
			EWA.UI.Utils.SetStyle(tbReShow[0], "width:100%;border-spacing:0");
		}

		css = "";
		//if (isFrame) {
		// css = "width:100%;height:100%;overflow:auto;position: absolute";
		//}

		var gridTable = $X('EWA_LF_' + this._Id);

		var objMain = gridTable.parentNode.parentNode; // table->div->table|test1->div|EWA_FRAME_MAIN
		// console.log(objMain);

		var objList = gridTable.parentNode;
		tbReShow.find("td:eq(2)>div").append(objList);
		let obj = tbReShow[0];
		let tr = tbReShow.find('tr:eq(0)')[0];
		// debug info
		let td = tbReShow.find('td:eq(0)')[0];
		let td00 = tbReShow.find('td:eq(1)')[0];
		let td10 = tbReShow.find('td:eq(2)')[0];

		if (isFrame) {
			window.setTimeout(function() {
				if ($X('__EWA_DEBUG')) {
					td10.childNodes[0].appendChild($X('__EWA_DEBUG'));
				}
				var o = $X(newDivId);
				var tb = o.getElementsByTagName("table")[0];
				var size = EWA.UI.Utils.GetDocSize(window);
				var h1 = o.parentNode.parentNode.previousSibling.offsetHeight;
				o.style.top = h1 + 'px'
				o.style.height = size.H - h1 + 'px';
				// tb.style.position='absolute';
				// tb.parentNode.style.position='absolute';
				// tb.style.width=o.offsetWidth;
			}, 100);
			addEvent(window, "resize", function() {
				var o = $X(newDivId);
				var size = EWA.UI.Utils.GetDocSize(window);
				var h1 = o.parentNode.parentNode.previousSibling.offsetHeight;
				o.style.top = h1 + 'px'
				o.style.height = size.H - h1 + 'px';
				// tb.style.width=o.offsetWidth;
			});
		}

		while (objMain.childNodes.length > 0) {
			td00.childNodes[0].appendChild(objMain.childNodes[0]);
		}

		// first block
		var captionDiv = tbReShow.find('.ewa_lf_func_caption')[0];

		var isDefinedButton = false;
		var txtCaption = GetInnerText(td00);
		txtCaption = txtCaption.trim();

		this._ReshowButs = {};
		var checkRow = $(gridTable.rows[0]);

		// 将所有button转换为菜单
		for (var name in this.ItemList.Items) {
			var node = this.ItemList.Items[name];
			var tag = this._GetSubValue("Tag", "Tag", node);
			if (!tag) {
				continue;
			}
			if (!(tag.toLowerCase() == 'button' || tag.toLowerCase() == 'butflow')) {
				continue;
			}
			var itemName = this._GetSubValue("Name", "Name", node);
			var itemClass = ".ewa-col-" + itemName;
			if (checkRow.find(itemClass).length === 0) {
				// console.log(itemClass);
				continue; // 过滤掉页面不存在的button
			}
			isDefinedButton = true;

			var text = this._GetSubValue("DescriptionSet", "Info", node);
			var title = this._GetSubValue("DescriptionSet", "Memo", node);

			var ewa_click = this._GetSubValue("EventSet", 'EventName', node);
			var evt = '';
			if (ewa_click != null && ewa_click.toLowerCase().trim() == 'ewa_click') {
				evt = this._GetSubValue("EventSet", 'EventValue', node);
			}

			txtCaption = txtCaption.replace(text, '');

			var o1 = this._ReShowButton(text, title, null);
			this._ReshowButs[text] = o1;
			o1.setAttribute('f_id', this._Id);
			o1.setAttribute('t_id', itemName);
			td00.childNodes[1].appendChild(o1);

			if (evt == '') {
				o1.setAttribute("onclick", "EWA.F.FOS['" + this._Id + "'].reShowButtonClick(this)");
			} else {
				o1.setAttribute('onclick', evt);
			}
		}

		// if exists defined buttons ,show split
		if (isDefinedButton) {
			this._ReShowSplit(td00.childNodes[1]);
		}

		var objs = td00.getElementsByTagName('input');
		var radios = {};
		for (var i = 0; i < objs.length; i++) {
			var o = objs[i];
			o.style.display = 'none';
			if (o.id == null || o.id == '') {
				o.id = ('_tmp_' + Math.random()).replace('.', '_');
			}
			var o1;
			if (o.type == 'button') {
				o1 = this._ReShowButton(o.value, o.title, o.id);
				var o2 = o.nextSibling;
				if (o2) {
					var txt = "";
					if (o2.nodeType == 3) {
						txt = o2.nodeValue.trimEx();
					}
					if (txt == "|") {
						this._ReShowSplit(td00.childNodes[1]);
					}
				}
			} else { // radios
				var o2 = o.nextSibling;
				var txt;
				if (o2) {
					if (o2.nodeType == 3) {
						txt = o2.nodeValue.replace('|', '');
					} else {
						txt = o2.innerHTML;
					}
				}
				o1 = this._ReShowButton(txt.trimEx(), o.title, o.id);
				o1.id = ('_tmp_' + Math.random()).replace('.', '_');
				if (!radios[o.name]) {
					radios[o.name] = [];
				}
				radios[o.name].push(o1.id);
			}
			td00.childNodes[1].appendChild(o1);
		}
		txtCaption = txtCaption.replace(/ /ig, '').replace(/\|/ig, '').trimEx();
		if (txtCaption != '') {
			if (txtCaption.indexOf('if') >= 0) {
				tr.style.display = 'none';
			} else {
				td.innerHTML = txtCaption.replace(/ /, '');
			}
		} else {
			tr.style.display = 'none';
		}
		objMain.appendChild(obj);

		// this.ShowHiddenColumns(rowIndexes, false);
		for (var name in radios) {
			var ids = radios[name];
			for (var i = 0; i < ids.length; i++) {
				var o = $X(ids[i]);
				o.setAttribute('_r_ids', ids.join(','));
				o.onclick = function() {
					var id = this.getAttribute('_ewa_event_id');
					$X(id).click();
					var ids = this.getAttribute('_r_ids').split(',');
					for (var i = 0; i < ids.length; i++) {
						if (o.id == ids[i]) {
							continue;
						}
						$X(ids[i]).style.fontWeight = '';
						$X(ids[i]).style.color = '';
					}
					this.style.fontWeight = 'bold';
					this.style.color = 'blue';
				}
			}
		}
		captionDiv.innerHTML = '<b><i class="fa fa-star-o">&nbsp;</i>' + this.Description + "</b>";

		// 将按钮挪到对话框的标题
		if (this.Url.toUpperCase().indexOf('EWA_BTNS_IN_TITLE') > 0) {
			var c = this;
			var inc = 0;
			var t = setInterval(function() {
				inc++;
				if (inc > 1000) { // 10s
					window.clearInterval(t);
				}
				EWA.OW.Load();
				if (!EWA.OW.Dia) {
					return;
				}
				window.clearInterval(t);
				c.ReShowButtonsInDailogTitle();
			}, 10);

		}
		// 加载菜单到功能条上
		this._InitMneu();
	};
	this.reShowButtonClick = function(button) {
		//var fId = button.getAttribute('f_id');
		var tId = button.getAttribute('t_id');
		var rows = this.SelectCheckedRows();
		if (rows == null || rows.length == 0) {
			EWA.UI.Msg.Alert(_EWA_INFO_MSG["EWA.SYS.CHOOSE_ITEM"], _EWA_INFO_MSG['EWA.SYS.CHOOSE_ITEM_TITLE']);
			return;
		}
		var r = rows[0];
		var buts = r.getElementsByTagName('input');
		for (var i = 0; i < buts.length; i++) {
			var but = buts[i];
			if (but.name === tId) {
				but.click();
				return;
			}
		}
	};
	this._ReShowSplit = function(parentObj) {
		var o3 = EWA.UI.Utils.CreateObject(window, 'div', '', parentObj);
		o3.className = 'ewa_lf_func_split';
		o3 = null;
	}
	this._ReShowButton = function(text, title, eventId) {
		var st = 'cursor:pointer';
		var o1 = EWA.UI.Utils.CreateObject(window, 'div', st, document.body);
		o1.innerHTML = '<nobr>' + text + '</nobr>';
		if (eventId != null) {
			o1.setAttribute('_ewa_event_id', eventId);
			o1.onclick = function() {
				var id = this.getAttribute('_ewa_event_id');
				$X(id).click();
			};
		}
		if (EWA.B.IE) {
			o1.onselectstart = function() {
				return false;
			};
		}
		o1.className = 'ewa_lf_func_dact';
		o1.title = title;
		return o1;
	}

	/**
	 * 检查输入合法性
	 * 
	 * @param {}
	 *            obj
	 * @return {Boolean}
	 */
	this.CheckValid = function(obj) {
		var tagName = obj.tagName.toLowerCase();
		if (tagName != 'input' && tagName != 'textarea' && tagName != 'select') {
			return true;
		}
		if ('button' == obj.type || 'submit' == obj.type || 'image' == obj.type) {
			return true;
		}
		var val = this.ItemList.GetObjectValue(obj);
		return this.ItemList.CheckValid(obj, val);
	}

	/**
	 * 显示编辑框
	 * 
	 * @param {}
	 *            obj
	 */
	this.ShowEdit = function(obj) {
		obj.parentNode.style.width = obj.clientWidth + 'px';

		obj.style.display = 'none';
		__show_obj__ = obj.nextSibling;
		__show_obj__.style.display = '';

		var chd = __show_obj__.childNodes[0];
		if (chd.nodeType == 3) {
			chd = __show_obj__.childNodes[1];
		}
		chd.setAttribute('old', chd.value);
		if (chd.tagName == 'SELECT' && !chd.getAttribute("func")) {
			chd.setAttribute("func", 1);
			chd.onchange = function() {
				EWA.F.FOS[this.getAttribute('__ewa_fid__')].EditAfter(this);
			}
		}
		if (chd.getAttribute('__ewa_fid__') == null) {
			chd.setAttribute('__ewa_fid__', this._Id);
			chd.onblur = function() {
				EWA.F.FOS[this.getAttribute('__ewa_fid__')].EditAfter(this);
			}
			chd.onkeydown = function(event) {
				var evt = event == null ? window.event : event;
				var obj = evt.target ? evt.target : evt.srcElement;
				if (evt.keyCode == 13 && obj.tagName == 'INPUT') {
					EWA.F.FOS[this.getAttribute('__ewa_fid__')].EditAfter(this);
				}
				if (evt.keyCode == 27) {
					EWA.F.FOS[this.getAttribute('__ewa_fid__')].EditReset(this);
				}
			}
		}
		setTimeout(function() {
			chd.focus();
			chd.select();
		}, 10);
	};
	this.EditReset = function(obj) {
		obj.parentNode.style.display = 'none';
		var o1 = obj.parentNode.previousSibling;
		o1.style.display = '';

		o1.innerHTML = obj.getAttribute('old');
		if (obj.tagName.toLowerCase() == "select") {
			o1.innerHTML = obj.options[obj.selectedIndex].text;
		} else {
			obj.value = obj.getAttribute('old').replace(/</ig, '&lt;').replace(/>/ig, '&gt;');
		}

	};
	/**
	 * 编辑框离开后事件
	 * 
	 * @param {}
	 *            obj
	 */
	this.EditAfter = function(obj) {
		if (!this.CheckValid(obj)) {
			obj.focus();
			return;
		}
		if (obj.getAttribute('old') == obj.value) {
			this.EditReset(obj);
			return;
		}

		obj.parentNode.style.display = 'none';
		var o1 = obj.parentNode.previousSibling;
		o1.style.display = '';

		var id, val;
		if (obj.getAttribute("ewa_class") == "droplist") {
			id = $(obj.parentNode.getElementsByTagName('input')[1]).attr('name');
			val = obj.parentNode.getElementsByTagName('input')[1].value;
			o1.innerHTML = obj.parentNode.getElementsByTagName('input')[0].value;
		} else if (obj.tagName.toLowerCase() == "select") {
			id = $(obj).attr("name");
			o1.innerHTML = obj.options[obj.selectedIndex].text;
			val = obj.value;
		} else {
			var sss = obj.value.replace(/</ig, '&lt;').replace(/>/ig, '&gt;').replace(/\n/ig, '<br>');
			o1.innerHTML = sss;
			id = $(obj).attr("name");
			val = obj.value;
		}
		// alert('id='+id+',val='+val);
		var actionName = obj.getAttribute('action_name');
		if (actionName == '' || actionName == null) {
			actionName = 'OnListFrameUpdateCell';
		}
		// 执行前提示
		var confirm = obj.getAttribute("action_confirm");
		confirm = confirm == null ? "" : confirm;

		// 执行后提示
		var tip = obj.getAttribute("action_tip");
		if (tip == null)
			tip = "";
		// 执行后脚本
		var js = obj.getAttribute("action_js");
		var dt = this.ItemList.GetValue(id, "DataItem", "DataType");
		var paras = [{
			Name: "EWA_FIELD_ID",
			Value: id
		}, {
			Name: "EWA_FIELD_VAL",
			Value: val
		}, {
			Name: "EWA_ACTION_RELOAD",
			Value: "0"
		}, {
			Name: id,
			Value: val
		}, {
			Name: "EWA_DATA_TYPE",
			Value: dt
		}, {
			Name: "EWA_FIELD_VAL_OLD",
			Value: obj.getAttribute('old')
		}];
		this.EditEvent = {
			FROM: obj,
			OLD_VAL: obj.getAttribute('old'),
			NEW_VAL: obj.value
		};
		this.DoAction(obj, actionName, confirm, tip, paras, js);
	};

	/**
	 * 覆盖Frame的提示信息
	 * 
	 * @param {Array}
	 *            infoJson 信息对象
	 * @param {String}
	 *            idName id名称
	 * @param {String}
	 *            infoName info字段名称
	 * @param {String}
	 *            memoName memo字段名称
	 * @param cb 循环info回调的方法，p0当前td，p1当前info, p2当前序号
	 * @return 影响的标题栏的nobr数组
	 */
	this.RewriteInfo = function(infoJson, idName, infoName, memoName, cb) {
		var tb = $('#EWA_LF_' + this._Id);
		var arr = [];
		if (infoJson) {
			this._INFO = {};
			this._INFO.INFO = infoJson;
			this._INFO.ID_NAME = idName || "id";
			this._INFO.INFO_NAME = infoName || "info";
			this._INFO.MEMO_NAME = memoName || "memo";
		} else if (!(this._INFO && this._INFO.INFO)) {
			return;
		}
		for (var i = 0; i < this._INFO.INFO.length; i++) {
			var v = this._INFO.INFO[i];
			var id = v[this._INFO.ID_NAME];
			let target = tb.find('[id="' + id + '"]:eq(0)');
			if (target.length === 0) {
				continue;
			}
			let td = target.parentsUntil("tr").last();
			let info = v[this._INFO.INFO_NAME];
			let memo = v[this._INFO.MEMO_NAME];

			if (info == null || info.trim() == '') { //隐藏列
				let tr = td.parent()[0];
				for (let m = 0; m < tr.cells.length; m++) {
					if (tr.cells[m] == td[0]) {
						this.ShowHiddenColumn(m, false);
						break;
					}
				}
			} else {
				if (target.children().length == 0) {
					target.text(info);
				} else {
					target.children()[0].innerText = info;
				}
				if (memo) {
					target.attr('title', memo);
				}
			}
			arr.push(target[0]);
			if (cb) {
				cb(target[0], v, i);
			}
		}

		return arr;
	};
	/**
	 * 显示或隐藏列，默认显示
	 * 
	 * @param {Int}
	 *            colIndex
	 * @param {Boolean}
	 *            dispMethod
	 */
	this.ShowHiddenColumn = function(colIndex, dispMethod) {
		var tb = $X('EWA_LF_' + this._Id);
		var dsp = '';
		if (dispMethod == null || dispMethod == false || dispMethod == 'none') {
			dsp = 'none';
		}
		for (var ii = 0; ii < tb.rows.length; ii++) {
			if (tb.rows[ii].cells.length == tb.rows[0].cells.length)
				tb.rows[ii].cells[colIndex].style.display = dsp;
		}
	};
	/**
	 * 显示或隐藏列，默认显示
	 * 
	 * @param {Array}
	 *            colIndexes 要隐含的列序号集合
	 * @param {Boolean}
	 *            dispMethod 显示模式
	 */
	this.ShowHiddenColumns = function(colIndexes, dispMethod) {
		var tb = $X('EWA_LF_' + this._Id);
		var dsp = '';
		if (dispMethod == null || dispMethod == false || dispMethod == 'none') {
			dsp = 'none';
		}
		var len = tb.rows[0].cells.length;
		for (var ii = 0; ii < tb.rows.length; ii++) {
			var tr = tb.rows[ii];
			if (tr.cells.length != len) {
				continue;
			}

			for (var m = 0; m < colIndexes.length; m++) {
				tr.cells[colIndexes[m]].style.display = dsp;
			}
		}
	};

	/**
	 * 显示或隐含分组
	 */
	this.GroupShowHidden = function(obj) {
		var t = $(obj).attr('t');
		var t0 = new Date().getTime();
		if (t) {// 避免连击，333毫秒内返回
			if (t0 - t < 333) {
				return;
			}
		}
		$(obj).attr('t', t0);
		var tr = obj.parentNode.parentNode;
		var show = tr.getAttribute('ewa_group');
		if (show == '') {
			show = 'none';
			obj.childNodes[0].innerHTML = ' + ';
		} else {
			show = '';
			obj.childNodes[0].innerHTML = ' - ';
		}
		tr.setAttribute('ewa_group', show);

		var tb = tr.parentNode.parentNode;
		var m = 0;
		for (var i = tr.rowIndex + 1; i < tb.rows.length; i++) {
			var t = tb.rows[i];
			if (t.getAttribute('ewa_tag') == 'group') {
				break;
			}
			if (t.getAttribute('add_pre_row')) { // _IsAddPreRow
				if (show == 'none') {
					if (t.style.display != 'none') {
						t.setAttribute('ewa_group_show_old', t.style.display);
					}
					t.style.display = 'none';
				} else {
					if (t.hasAttribute('ewa_group_show_old')) {
						t.style.display = t.getAttribute('ewa_group_show_old');
						t.removeAttribute("ewa_group_show_old");
					}
				}
			} else {
				t.style.display = show;
				m++;
			}
		}
		obj.childNodes[obj.childNodes.length - 1].innerHTML = ' (' + m + ')';
	};

	this.Sort = function(sortName) {
		var last_sort_timer = this._last_sort_timer || 0;
		var last_sort_name = this._Sort || "";
		var t = new Date().getTime();
		if (last_sort_name == sortName && t - last_sort_timer < 500) {
			// 500ms不重复执行
			return;
		}
		this._last_sort_timer = t;
		this._Sort = sortName;
		this.Goto(1);
	};

	this.SearchClear = function(obj) {
		var tb = obj.parentNode.parentNode.parentNode.parentNode;
		for (var i = 0; i < tb.rows.length; i += 1) {
			var inputs = tb.rows[i].getElementsByTagName('input');
			for (var m = 0; m < inputs.length; m++) {
				var oo = inputs[m];
				if (oo.type == 'text') {
					oo.value = "";
				} else if (oo.type == 'radio' || oo.type == 'checkbox') {
					oo.checked = false;
				}
			}
		}
	};
	// ewa_search=bas_tag[eq]acc,bas_tag_grp[lk]src
	// EWA_SEARCH=MEMO_STATE[or]MEMO_ING;MEMO_FINISH
	this.SearchGetExpInit = function() {
		let tb = $('#_G_' + this._Id);
		var s2 = [];
		$(tb).find('.ewa-lf-search-item').each(function() {
			var inputs = $(this).find('input');
			if (inputs.length == 0) {
				inputs = $(this).find('select');
				if (inputs.length == 0) {
					return;
				}
			}
			var input0 = inputs[0];
			var search_type = $(input0).attr('t');
			if (inputs.length == 1) {
				var v = input0.value;
				if (input0.value.trim() == '') {
					return;
				}
				if (search_type == 'text') {
					var tag1 = $(input0.parentNode.parentNode).find('a').attr('tag');
					if (tag1) {
						search_type = tag1;
					}
				}
				let names = input0.name.split(',');
				for (let i = 0; i < names.length; i++) {
					s2.push(names[i] + "[" + search_type + "]" + v);
				}
				return;
			}
			if ((search_type == 'date' || search_type == 'number') && inputs.length == 2) {
				var v = input0.value;
				var v1 = inputs[1].value;
				if (v1 == '' && v == '') {
					return;
				}
				s2.push(input0.name + "[gte]" + v);
				if (v1) {
					s2.push(input0.name + "[lte]" + v1);
				}
				return;
			}
			if (search_type == 'fix' && input0.tagName == 'INPUT') {
				var vs = [''];
				$(this).find('input').each(function() {
					if (this.checked) {
						vs.push(this.value);
					}
				});
				if (vs.length == 1) {// 没有数据
					return;
				}
				s2.push(input0.name + "[or]" + vs.join(';'));
			}
		});
		return s2.join(',');
	};
	this.SearchGetExp = function(tb) {
		var s2 = [];
		$(tb).find('.ewa-lf-search-item').each(function() {
			// 不用$(this).find('input,select')
			// 会造成debug状态不停的闪烁，怀疑jq添加属性又删除
			var inputs = $(this).find('input');
			if (inputs.length == 0) {
				inputs = $(this).find('select');
				if (inputs.length == 0) {
					return;
				}
			}
			var input0 = inputs[0];
			var search_type = $(input0).attr('t');
			if (inputs.length == 1) {
				var v = input0.value;
				if (input0.value.trim() == '') {
					return;
				}
				if (search_type == 'text') {
					var tag1 = $(input0.parentNode.parentNode).find('a').attr('tag');
					if (tag1) {
						search_type = tag1;
					}
				}
				s2.push("@!@" + input0.name + "~!~" + search_type + "~!~" + v);
				return;
			}
			if ((search_type == 'date' || search_type == 'number') && inputs.length == 2) {
				var v = input0.value;
				var v1 = inputs[1].value;
				if (v1 == '' && v == '') {
					return;
				}
				s2.push("@!@" + input0.name + "~!~" + search_type + "~!~" + v + "~!~" + v1);
				return;
			}
			if (search_type == 'fix' && input0.tagName == 'INPUT') {
				var vs = [''];
				$(this).find('input').each(function() {
					if (this.checked) {
						vs.push(this.value);
					}
				});
				if (vs.length == 1) {// 没有数据
					return;
				}
				s2.push("@!@" + input0.name + "~!~" + search_type + vs.join('~!~'));
			}
		});
		return s2.join('');
	};
	this.DoSearch = function(obj) {
		var tb;
		var isDialog = false;
		if (obj.id == 'EWA_SEARCH_ITEM_' + this.Id) {
			tb = $X('EWA_SEARCH_ITEM_' + this.Id).childNodes[0];
		} else {
			tb = obj.parentNode.parentNode.parentNode.parentNode;
			isDialog = true;
		}
		var s1 = this.SearchGetExp(tb);
		this._SearchExp = s1;
		if (isDialog) {
			this._SearchHtml = tb.parentNode.innerHTML;
			this._SearchDialog.Show(false);
		}
		// 数据调用来源于搜索
		this.Goto(1);
	};
	this.Search = function(search) {
		if (this._SearchHtml == null) {
			this._SearchCreate();
			this._SearchDialog = new EWA.UI.Dialog.OpenWindow('about:blank', 'aa', 400, 100, true, null, null, false);
			this._SearchDialog.SetCaption(_EWA_INFO_MSG["EWA.LF.SEARCH.BUT.TITLE"]);
			this._SearchDialog._Dialog.AutoSize = true;
			this._SearchDialog._Dialog.SetHtml(this._SearchHtml);
			this._SearchDialog._Dialog.Show(true);
			this._SearchDialog._Dialog.GetFrame().focus();
			this._SearchDialog.MoveCenter();
		} else {
			this._SearchDialog._Dialog.AutoSize = false;
			this._SearchDialog.Show(true);

		}

	};
	/**
	 * 在页面上将Search显示出来
	 * @param composeTexts 是否合并文字搜索框
	 * @param denySearchGroup 取消固定搜索分组，完全按照字段顺序来
	 */
	this.ShowSearch = function(composeTexts, denySearchGroup) {
		var id = 'EWA_SEARCH_ITEM_' + this.Id;
		if (denySearchGroup) {
			//取消固定搜索分组，完全按照字段顺序来
			this._IsSearchGroup = false;
		}
		if (!$X(id)) {
			this._SearchCreateItm();
			if (composeTexts) {
				this.composeSearchTexts();
			}
			this._ReShowSearchQuick();
		}
	};
	this.ChangeSearchTextType = function(obj) {
		if (this._MENU_DATE_RANGE)
			this._MENU_DATE_RANGE.HiddenMemu();
		this._MENU_TEXT_TYPE.ShowByObject(obj, null, 0);
		let frame = $(this._MENU_TEXT_TYPE.Dialog.GetFrame());
		frame.find('.search-text-tag').remove();
		frame.find('div[ewa_mg="' + $(obj).attr('tag') + '"] td:eq(0)').html('<b class="fa fa-check search-text-tag"></b>');

	};
	/**
	 * 检索日期显示日期范围列表
	 */
	this.ChangeSearchDateType = function(obj) {
		if (this._MENU_TEXT_TYPE)
			this._MENU_TEXT_TYPE.HiddenMemu();
		this._MENU_DATE_RANGE.ShowByObject(obj, null, 0);
	};

	this.ChangeSearchTextTypeIt = function(tag) {
		var targetObject = this._MENU_TEXT_TYPE.SHOW_BY_OBJECT;
		var search_item_table = $(targetObject).parentsUntil(".ewa-lf-search-item").last();
		var text_seach_type_map = $J2MAP(this.RESOURCES.search_text_items, 'Id');
		var item = text_seach_type_map[tag];
		var txt = EWA.LANG == 'enus' ? item.TxtEn : item.Txt;

		search_item_table.find('a').attr('tag', tag).html(txt);
		let input = search_item_table.find('input');
		if (tag == 'blk' || tag == 'nblk') { // 空白和非空白
			input.val(txt).prop('disabled', true);
		} else {
			if (input.prop('disabled')) {
				search_item_table.find('input').val("").prop('disabled', false);
			}
		}
	};

	/**
	 * 获取初始化查询数据
	 */
	this._GetInitSearchMap = function() {
		var u1 = new EWA_UrlClass(this.Url);
		var map = {};
		// ewa_search=bas_tag_grp[eq]ACC_SRC,bas_tag[rlk]Z1
		// ewa_search=POS_CDATE[gte]2011-09-20,POS_CDATE[lte]2011-09-30,POS_ID[gte]11,POS_ID[lt]12
		var search_paras = u1.GetParameter("ewa_search");
		if (!search_paras) {
			return map;
		}
		this.Url = u1.RemoveParameter("ewa_search");
		search_paras = search_paras.unURL();
		var ss = search_paras.split(',');
		for (var n in ss) {
			var s = ss[n]; // bas_tag[rlk]Z1
			var exp_start_loc = s.indexOf("[");
			var exp_end_loc = s.indexOf("]");

			if (exp_start_loc < 0 || exp_end_loc < exp_start_loc) {
				continue;
			}

			var name = s.substring(0, exp_start_loc).trim();
			if (name.length == 0) {
				continue;
			}

			var tag = s.substring(exp_start_loc + 1, exp_end_loc).trim().toLowerCase();

			if (tag.length == 0) {
				continue;
			}

			var para1 = s.substring(exp_end_loc + 1).trim();

			if (para1 == "") {
				continue;
			}
			if (!map[name.toUpperCase()]) {
				map[name.toUpperCase()] = {
					"name": name,
					"tag": tag
				};
			}
			var o = map[name.toUpperCase()];
			if (tag == 'lt' || tag == 'lte') {
				o.para2 = para1.unURL().replace(/\+/ig, ' ');
			} else {
				o.para1 = para1.unURL().replace(/\+/ig, ' ');
			}
		}
		return map;
	};

	/**
	 * 设置检索日期范围
	 */
	this.SearchFilterDate = function(t) {
		var targetObject = this._MENU_DATE_RANGE.SHOW_BY_OBJECT;

		var search_item_table = $(targetObject).parentsUntil(".ewa-lf-search-item").last();
		var input_date0 = search_item_table.find('input')[0];
		var input_date1 = search_item_table.find('input')[1];

		if (t == "Clear") {
			$(input_date0).val("");
			$(input_date1).val("");
			return;
		}
		var td = EWA_Utils.Date();
		var d1 = "";
		var d2 = "";
		if (t == "Today") {
			d1 = td.GetDateString();
			d2 = d1;
		} else if (t == "Week") {
			var tt = td.GetBenWeek();
			d1 = tt[0];
			d2 = tt[1];
		} else if (t == "Today-Weekend") {
			var tt = td.GetBenWeek();
			d1 = tt[td.GetDateString()];
			d2 = tt[1];
		} else if (t == "Month") {
			var tt = td.GetBenMonth();
			d1 = tt[0];
			d2 = tt[1];
		} else if (t == "Today-EOM") {
			var tt = td.GetBenMonth();
			d1 = tt[td.GetDateString()];
			d2 = tt[1];
		} else if (t == "Quarter") {
			var tt = td.GetBenQ();
			d1 = tt[0];
			d2 = tt[1];
		} else if (t == "Today-EOQ") {
			var tt = td.GetBenQ();
			d1 = tt[td.GetDateString()];
			d2 = tt[1];
		} else if (t == "Year") {
			var tt = td.GetBenYear();
			d1 = tt[0];
			d2 = tt[1];
		} else if (t == "Today-EOY") {
			var tt = td.GetBenYear();
			d1 = tt[td.GetDateString()];
			d2 = tt[1];
		}
		var ft_d1 = EWA_Utils.Date(d1).FormatDate();
		var ft_d2 = EWA_Utils.Date(d2).FormatDate();
		ft_d2 = ft_d2 + " 23:59:59";
		$(input_date0).val(ft_d1);
		$(input_date1).val(ft_d2);
	};
	/**
	 * 创建日期范围列表
	 * 
	 * @return String
	 */
	this._SearchCreateDateRange = function() {
		var id = '_MENU_DATE_RANGE' + this._Id;
		$('.' + id).remove(); // 清除已经存在的
		var idx = EWA.LANG.toLowerCase() == "enus" ? "TxtEn" : "Txt";
		var items = JSON.parse(JSON.stringify(this.RESOURCES.search_date_items));
		var ewa_js = "EWA.F.FOS[&quot;" + this._Id + "&quot;].SearchFilterDate";
		for (var n in items) {
			var itm = items[n];
			itm.Txt = itm[idx];
			itm.Cmd = ewa_js + "(&quot;" + itm.Id + "&quot;)";
		}
		var name = 'EWA.F.FOS[&quot;' + this._Id + '&quot;]._MENU_DATE_RANGE';

		this._MENU_DATE_RANGE = new EWA_UI_MenuClass(name);
		this._MENU_DATE_RANGE.Create(items);
		$(this._MENU_DATE_RANGE.Dialog.GetFrame()).addClass('ewa-lf-search-menu ' + id);
		return name;
	};
	this._SearchCreateTextType = function() {
		var id = '_MENU_TEXT_TYPE' + this._Id;
		$('.' + id).remove(); // 清除已经存在的
		var idx = EWA.LANG.toLowerCase() == "enus" ? "TxtEn" : "Txt";
		// clone resources
		var items = JSON.parse(JSON.stringify(this.RESOURCES.search_text_items));
		var ewa_js = "EWA.F.FOS[&quot;" + this._Id + "&quot;].ChangeSearchTextTypeIt";
		for (var n in items) {
			var itm = items[n];
			itm.Txt = itm[idx];
			itm.Cmd = ewa_js + "(&quot;" + itm.Id + "&quot;)";
			itm.Group = itm.Id;
		}
		var name = "EWA.F.FOS[&quot;" + this._Id + "&quot;]._MENU_TEXT_TYPE";

		this._MENU_TEXT_TYPE = new EWA_UI_MenuClass(name);
		this._MENU_TEXT_TYPE.Create(items);
		$(this._MENU_TEXT_TYPE.Dialog.GetFrame()).addClass('ewa-lf-search-menu ' + id);

		this._MENU_TEXT_TYPE.clickBeforeEvent = function(e, obj) {
			$(this.Dialog.GetFrame()).find('.search-text-tag').remove();
			$(obj).find('td:eq(0)').html('<b class="fa fa-check search-text-tag"></b>');
		};
		return name;
	}
	/**
	 * 创建搜索框
	 */
	this._SearchCreateItm = function() {
		var id = 'EWA_SEARCH_ITEM_' + this.Id;
		var ss = [];

		var ssFix = [];
		var ssOth = [];
		var jsonFix = {};
		for (var name in this._SearchJson) {
			this._SearchJson[name].ORI_NAME = name;
			jsonFix[name.toUpperCase()] = this._SearchJson[name];
		}
		this._SearchJson = jsonFix;
		var ewa_js = "EWA.F.FOS[&quot;" + this._Id + "&quot;].ChangeSearchTextType(this)";
		var ewa_js_date = "EWA.F.FOS[&quot;" + this._Id + "&quot;].ChangeSearchDateType(this)";

		var default_text_seach_type = 'lk'; // like;

		var text_seach_type_map = $J2MAP(this.RESOURCES.search_text_items, 'Id');
		var init_search_type_map = this._GetInitSearchMap();

		var is_have_date_search = false; // 是否由日期搜索
		var is_have_text_search = false; // 是否由日期搜索
		for (var name in this.ItemList.Items) {
			if (this._SearchJson[name] == null) {
				continue;
			}
			var tmp = [];
			var node = this.ItemList.Items[name];
			var searchItem = this._SearchJson[name];
			var search = searchItem.T;
			var des = this._GetSubValue('DescriptionSet', 'Info', node);
			var fixM = search == "fix" ? ("ewa-lf-search-fix-m" + (searchItem.M || "0")) : "";
			tmp.push("<table class='ewa-lf-search-item ewa-ref-" + name + " ewa-lf-search-type-" + search + " " + fixM + "' cellspacing=0 cellpadding=0>");
			tmp.push("<tr><td class='ewa-lf-search-item-title' style='position:relative'><nobr><b>");
			tmp.push(des);

			var text_val = "";
			var text_val2 = "";
			var ini_tag = default_text_seach_type;
			if (init_search_type_map[name.toUpperCase()]) {
				var s_item = init_search_type_map[name.toUpperCase()];
				ini_tag = s_item.tag;
				text_val = s_item.para1;
				text_val2 = s_item.para2;
			}
			var tag_text = "";
			if (search == "text") {
				var this_tag_text_type = text_seach_type_map[ini_tag] || text_seach_type_map[default_text_seach_type];
				tag_text = EWA.LANG == 'enus' ? this_tag_text_type.TxtEn : this_tag_text_type.Txt;
				tmp.push("<a class='ewa-lf-search-type' tag='" + ini_tag + "' href='javascript:void(0)' onclick='" + ewa_js + "'>");
				tmp.push(tag_text);
				tmp.push("</a>");
				is_have_text_search = true;
			} else if (search == 'date') {
				tmp.push("<a  href='javascript:void(0)' class='fa fa-calendar-check-o'  onclick='" + ewa_js_date + "'></a>");
				is_have_date_search = true;
			}

			tmp.push("</b></nobr></td><td class='ewa-lf-search-item-ctl'>");
			if (search == "text") {
				if (ini_tag == 'blk' || ini_tag == 'nblk') { // 空白和非空白
					let eleHtml = this._SearchSingle(name, tag_text);
					eleHtml = eleHtml.replace('<input', '<input disabled '); // 禁止修改
					tmp.push(eleHtml);
				} else {
					tmp.push(this._SearchSingle(name, text_val));
				}
			} else if (search == "date") {
				tmp.push(this._SearchDate(name, text_val, text_val2));
			} else if (search == "number") {
				tmp.push(this._SearchNumber(name, text_val, text_val2));
			} else if (search == "fix") {
				var ttt = "<div >" + this._SearchFix(name, searchItem, 'span', text_val) + "</div>";
				tmp.push(ttt);
			}
			tmp.push("</td></tr></table>");
			if (search == "fix" && this._IsSearchGroup) { //固定查询和分组标记
				ssFix.push(tmp.join(''));
			} else {
				ssOth.push(tmp.join(''));
			}
		}
		if ((ssOth.length + ssFix.length) == 0) {
			return;
		}
		// var title = _EWA_INFO_MSG["EWA.SYS.DATASEARCH"];
		ss.push('<table class="ewa-lf-search-main" id="' + id + '" cellspacing="0" cellpadding="0">');
		ss.push("<tr><td class='ewa-lf-search-des'></td><td>");
		if (ssOth.length > 0) {
			ss.push(" " + ssOth.join('') + " ");
		}
		// 固定查询
		for (var i = 0; i < ssFix.length; i++) {
			ss.push(" " + ssFix[i] + " ");
		}
		ss.push("</td></tr></table>")

		var rq = document.createElement('div');
		this._SEARCH_BOX = rq;
		rq.className = 'ewa-lf-search';
		rq.innerHTML = ss.join('');

		var obj = $X('EWA_LF_' + this.Id);
		var o1 = obj.parentNode
		o1.parentNode.insertBefore(rq, o1);

		var id = 'EWA_SEARCH_ITEM_' + this.Id;
		var c = this;

		// 附加日期范围菜单
		if (is_have_date_search) {
			this._SearchCreateDateRange();
		}
		// 附加文字搜索类型菜单
		if (is_have_text_search) {
			this._SearchCreateTextType();
		}
		c._SEARCH_ITEM_EXP = this.SearchGetExp(rq);
		// 检查初始默认值
		if (JSON.stringify(init_search_type_map) != "{}") {
			c._SearchExp = c._SEARCH_ITEM_EXP;
		}

		$(rq).find('input[type=text]').on('compositionstart', function() {
			// 输入法打开输入
			c._is_search_composition = true;
		}).on('compositionend', function() {
			// 输入法输入完毕
			c._is_search_composition = false;
		});
		// 检测搜索内容是否发生变化
		this._TIMER_SEARCH = window.setInterval(function() {
			if (c._is_search_composition) {
				return;
			}
			try { // 避免窗口关闭出现的异常
				if (!$X(id)) {
					window.clearInterval(c._TIMER_SEARCH);
					return;
				}
			} catch (e) {
				window.clearInterval(c._TIMER_SEARCH);
				return;
			}

			var s = c.SearchGetExp(rq);
			if (s != c._SEARCH_ITEM_EXP) {
				c._SEARCH_ITEM_EXP = s;
				c.DoSearch($X(id));
			}
		}, 700);
	};
	this._SearchSingle = function(name, value) {
		var ss = [];
		ss.push('<input t="text" type="text" autocomplete="off" class="EWA_INPUT" maxlength="40" name="');
		ss.push(name.toInputValue());
		ss.push('"');
		if (value != null) {
			ss.push(" value=\"");
			var v = value.toInputValue();
			ss.push(v);
			ss.push("\" ");
		}
		ss.push(' />');
		return ss.join('');
	};
	this._SearchDate = function(name, val1, val2) {
		var ss = [];
		var tmp = '<td  ><input type="text" autocomplete="off" class="EWA_INPUT" t="date" readonly maxlength="8" onclick="EWA.UI.Calendar.Pop(this)" name="';
		ss.push('<table border=0 cellpadding=0 cellspacing=0>')
		ss.push(tmp);
		ss.push(name);
		ss.push('"');
		if (val1) {
			var v = val1.toInputValue();
			ss.push(' value="');
			ss.push(v);
			ss.push('"');
		}
		ss.push(' /></td><td><span class="ewa-lf-search-split"> - </span></td>');
		ss.push(tmp);
		ss.push(name);
		ss.push('1"');
		if (val2) {
			var v = val2.toInputValue();
			ss.push(' value="');
			ss.push(v);
			ss.push('"');
		}
		ss.push('/></td></tr></table>');

		return ss.join('');
	};

	this._SearchNumber = function(name, val1, val2) {
		var ss = [];
		var tmp = '<input type="text" t="number" size="10" name="';
		ss.push(tmp);
		ss.push(name);
		ss.push('"');
		if (val1) {
			var v = val1 * 1;
			ss.push(' value="');
			ss.push(v);
			ss.push('"');
		}
		ss.push(' /><span class="ewa-lf-search-split"> - </span>');
		ss.push(tmp);
		ss.push(name);
		ss.push('1"');
		if (val2) {
			var v = val2 * 1;
			ss.push(' value="');
			ss.push(v);
			ss.push('"');
		}
		ss.push('/>');

		return ss.join('');
	};
	// radio/checkbox
	this._SearchFix = function(name, searchItem, tag, value) {
		var ss = [];
		var tp = 'radio';
		if (searchItem.M == "1") {
			tp = "checkbox";
		} else if (searchItem.M == "2") { // select
			return this._SearchFix1(name, searchItem, tag, value);
		}
		var tmp = "<" + tag + "><nobr><input t='fix' [@CHK] id='@ID' value=\"@V\" type='" + tp + "' name='" + name + "' /><label for='@ID'>@T</label></nobr></"
			+ tag + "> ";
		// ewa_search值
		var map = {};
		if (value) {
			var vals = value.split(';');
			for (var n in vals) {
				map[vals[n].trim().toUpperCase()] = 1;
			}
		}
		for (var i = 0; i < searchItem.D.length; i++) {
			var item = searchItem.D[i];
			var val = item[0];
			var txt = item[1];
			var id = this.Id + "_" + name + "_SearchFix_" + i;
			var tmp1 = tmp.replace("@ID", id);
			tmp1 = tmp1.replace("@ID", id);
			tmp1 = tmp1.replace("@V", val);
			if (map[val.toUpperCase().trim()]) {
				tmp1 = tmp1.replace("[@CHK]", "checked");
			} else {
				tmp1 = tmp1.replace("[@CHK]", "");
			}

			var tmp1 = tmp1.replace("@T", txt);
			ss.push(tmp1);
		}

		return ss.join('');
	};
	// select
	this._SearchFix1 = function(name, searchItem, tag, value) {
		var ss = [];
		// console.log(value)
		ss.push("<select t='fix' name='" + name + "'><option></option>")
		var tmp = "<option @CKD t='fix' id='@ID' value=\"@V\">@T</option> ";

		for (var i = 0; i < searchItem.D.length; i++) {
			var item = searchItem.D[i];
			var id = this.Id + "_" + name + "_SearchFix_" + i;
			var tmp1 = tmp.replace("@ID", id);
			tmp1 = tmp1.replace("@V", item[0]);
			tmp1 = tmp1.replace("@T", item[1]);
			if (value && item[0] == value) {
				tmp1 = tmp1.replace("@CKD", "selected");
			} else {
				tmp1 = tmp1.replace("@CKD", "");
			}
			ss.push(tmp1);
		}
		ss.push("</select>");
		return ss.join('');
	};

	this._SearchCreate = function() {
		var ss = [];
		var s1 = "<div><table border=0 style='margin:0px;' class=EWA_TABLE cellspacing=1>";
		ss.push(s1);
		for (var name in this.ItemList.Items) {
			if (this._SearchJson[name] == null) {
				continue;
			}
			var node = this.ItemList.Items[name];
			var searchItem = this._SearchJson[name];

			var search = searchItem.T;

			var des = this._GetSubValue('DescriptionSet', 'Info', node);
			ss.push("<tr><td class=EWA_TD_L width=140><nobr>" + des + "<nobr></td><td width=350 class=EWA_TD_M>");
			if (search == "text") {
				ss.push(this._SearchSingle(name));
			} else if (search == "date") {
				ss.push(this._SearchDate(name));
			} else if (search == "number") {
				ss.push(this._SearchNumber(name));
			} else if (search == "fix") {
				ss.push(this._SearchFix(name, searchItem, 'div'))
			}

			ss.push("</td></tr>");
		}
		ss.push("<tr><td class=EWA_TD_B colspan=2 align=right>" + "<input onclick='EWA.F.FOS[\"" + this._Id + "\"].SearchClear(this);' type=button value='"
			+ _EWA_INFO_MSG["EWA.LF.SEARCH.BUT.CLEAR"] + "'> " + "<input type=submit value='" + _EWA_INFO_MSG["EWA.LF.SEARCH.BUT.SEARCH"]
			+ "' onclick='EWA.F.FOS[\"" + this._Id + "\"].DoSearch(this);'> " + "<input type=button value='" + _EWA_INFO_MSG["EWA.LF.SEARCH.BUT.CLOSE"]
			+ "' " + "onclick='EWA.F.FOS[\"" + this.Id + "\"]._SearchDialog.Show(false);'></td></tr>");
		ss.push("</table></div>");
		this._SearchHtml = ss.join('');
	};

	/**
	 * 创建用于替换的正则表达式
	 * @param text 要替换的文字
	 */
	this.createRegExp = function(text) {
		if (!text) {
			return null;
		}
		text = String(text).trim();
		if (text.length === 0) {
			return null;
		}
		var ss = [];
		for (var i1 = 0; i1 < text.length; i1++) {
			var c = text[i1];
			if ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9')) {
				ss.push(c);
			} else {
				ss.push('\\' + c); // 字符转义，避免正则表达式出错
			}
		}
		try {
			return new RegExp('(' + ss.join('') + ')');
		} catch (e) {
			console.warn('new RegExp', text, e);
			return null;
		}

	};
	/**
	 * 检索关键字标红
	 */
	this.SearchMark = function() {
		var s1 = this._SearchExp.split('@!@');
		var tb = $X('EWA_LF_' + this._Id);

		for (var i = 0; i < s1.length; i += 1) {
			var s2 = s1[i].split('~!~');
			if (s2.length < 3) {
				continue;
			}
			for (var m = 2; m < s2.length; m++) {
				var exp = s2[m];
				if (exp == "") {
					continue;
				}
				if (s2[1] == 'fix') {
					// 固定检索，检索关键字替换为select的根据option的value获取text文字
					var id = s2[0];
					var val = s2[2];
					var select_fix = $('table#EWA_SEARCH_ITEM_' + this.Id + ' [name="' + id + '"]');
					select_fix.find('option').each(function() {
						if (this.value == val) {
							exp = this.text; // 获取text文字
							return;
						}
					});
				}
				// console.log(s2);

				let regExp = this.createRegExp(exp);
				// console.log(exp);
				let ids = s2[0].split(','); // 有可能为组合的id,composeTextSearch
				for (let index in ids) {
					let id = ids[index];
					if (this._SearchJson[id]) {
						id = this._SearchJson[id].ORI_NAME; // 原来的名称（没有被大写之前的名称，在SearchCreateItm生成）
					}
					let td = $(tb).find('.ewa-lf-data-row .ewa-col-' + id).not('[ewa-search-marked=yes]');
					// 已经标记过了
					td.attr('ewa-search-marked', 'yes');
					try {
						td.find('*').each(function() {
							if (this.children.length == 0) {
								this.innerHTML = this.innerHTML.replace(regExp, '<font color=red><b>$1</b></font>');
							}
						});
					} catch (e) {
						console.log(e);
					}
				}
			}
		}
	};
	/**
	 * 是否双击
	 * 
	 * @param {Object}
	 *            butIdx
	 * @memberOf {TypeName}
	 */
	this.DblClick = function(butIdx) {
		this._IsDblClick = butIdx;
		var tb = $X('EWA_LF_' + this._Id);
		for (var i = 1; i < tb.rows.length; i++) {
			tb.rows[i].ondblclick = function() {
				var inputs = this.getElementsByTagName('input');
				if (inputs.length > butIdx && inputs[butIdx].disabled == false)
					inputs[butIdx].click();
			}
		}
	};
	this.Init = function(xmlString) {
		this.Xml = new EWA.C.Xml();
		this.Xml.LoadXml(xmlString);
		this.ItemList.Init(this.Xml);
		this.Resources = new EWA_FrameResoures();
		this.Resources.Init(this.Xml);
		var tb = $X('EWA_LF_' + this._Id);
		if (!tb || tb.tagName != 'table' || tb.rows.length <= 1) {
			return;
		}
		var objs = tb.rows[1].getElementsByTagName('input');
		for (var i = 0; i < objs.length; i++) {
			if (objs[i].type.toUpperCase() == 'RADIO') {
				this._TrSelectMulti = false;
				break;
			}
		}

	};
	this.SetPageParameters = function(pageCurrent, pageCount, pageSize, recordCount, sort) {
		this._PageCurrent = pageCurrent;
		this._PageSize = pageSize;
		this._PageCount = pageCount;
		this._RecordCount = recordCount;
		this._Sort = sort;
	};
	this.SetPageParametersName = function(pageCurrentName, pageCountName, pageSizeName, recordCountName, sortName) {
		this._PageCurrentName = pageCurrentName;
		this._PageSizeName = pageSizeName;
		this._PageCountName = pageCountName;
		this._RecordCountName = recordCountName;
		this._SortName = sortName;
	};

	/**
	 * 全选
	 */
	this.CheckedAll = function() {
		var obj = document.getElementById("EWA_LF_" + this._Id);
		if (obj.rows.length <= 1) {
			return;
		}

		for (var i = 0; i < obj.rows.length; i += 1) {
			var objs = obj.rows[i].getElementsByTagName("input");
			if (objs.length == 0)
				continue;
			objs[0].checked = this._IsCheckedAll;

		}
		if (this._IsCheckedAll) {
			this._IsCheckedAll = false;
		} else {
			this._IsCheckedAll = true;
		}
		if (this.CheckedAllAfter) {
			this.CheckedAllAfter(obj);
		}
	};
	/**
	 * 返回选中的值，用“,”分割
	 * 
	 * @return {String}
	 */
	this.SelectChecked = function() {
		var obj = $X("EWA_LF_" + this._Id);
		if (!obj || obj.rows.length < 1) {
			return "";
		}
		var ids = [];
		//var objs = $F(obj, 'input', 'type', 'radio,checkbox');
		let objs = [];
		$("#EWA_LF_" + this._Id + ">tbody>tr").find("input[type='radio'],input[type='checkbox']").each(function() {
			if (this.parentNode.className.indexOf('ewa-switch') == -1) {
				objs.push(this);
			}
		});
		if (objs.length > 0) {
			for (var i = 0; i < objs.length; i++) {
				if (objs[i].checked) {
					ids.push(objs[i].value);
				}
			}
		} else {
			for (var i = 0; i < obj.rows.length; i++) {
				var tr = obj.rows[i];
				if (tr.getAttribute('__ewa_lf_mdown') == 1) {
					ids.push(tr.getAttribute('EWA_KEY'));
				}
			}
		}
		return ids.join(',');
	};
	/**
	 * 返回选中的checkbox 或 RADIO
	 * 
	 * @return {}
	 */
	this.SelectCheckedInputs = function() {
		var ids = [];
		var obj = $X("EWA_LF_" + this._Id);
		if (obj.rows.length < 1) {
			return ids;
		}
		var objs = obj.getElementsByTagName("input");
		var ids = [];
		for (var i = 0; i < objs.length; i++) {
			if (!(objs[i].type.toUpperCase() == "CHECKBOX" || objs[i].type.toUpperCase() == "RADIO")) {
				continue;
			}
			if (objs[i].checked) {
				ids.push(objs[i]);
			}

		}
		return ids;
	};
	/**
	 * 返回选择选中的行
	 * 
	 * @return {}
	 */
	this.SelectCheckedRows = function() {
		var trs = [];
		var obj = $X("EWA_LF_" + this._Id);
		for (var i = 0; i < obj.rows.length; i++) {
			var tr = obj.rows[i];
			var objs = tr.getElementsByTagName("input");
			if (objs.length == 0) {
				continue;
			}

			if (objs[0].checked) {
				if (objs[0].parentNode.className.indexOf('ewa-switch') == -1) {
					// not ewa-switch ui
					trs.push(tr);
				}
			}
		}
		if (trs.length == 0) {
			for (var i = 0; i < obj.rows.length; i++) {
				var tr = obj.rows[i];
				if (tr.getAttribute('__ewa_lf_mdown') == 1) {
					trs.push(tr);
				}
			}
		}
		return trs;
	};
	/**
	 * 重新刷新当前页面
	 * 
	 * @param httpReferer
	 *            跳转发起的页面，例如Frame，通常是EWA_PostBehavior调用
	 */
	this.Reload = function(httpReferer) {
		if (this.StopAjaxAfterReload) {
			// DoAction 指定了提交后的脚本，阻止页面重新加载
			this.StopAjaxAfterReload = false;
			return;
		}
		this.Goto(this._PageCurrent, httpReferer);
	};
	this.refreshPage = function(httpReferer, callBack) {
		this.replaceRowsData(null, null, httpReferer, callBack);
	};
	/**
	* 根据ajax请求，替换当前表中对应的行数据
	 */
	this.replaceRowsData = function(searchExp, replaceFuntion, httpReferer, callBack) {
		let u = this.getUrlClass();
		u.AddParameter("EWA_AJAX", "LF_RELOAD");
		u.AddParameter("EWA_IS_SPLIT_PAGE", "no");
		u.AddParameter("EWA_IS_HIDDEN_CAPTION", "yes");

		let url = u.GetUrl();
		if (searchExp) {
			url += "&" + searchExp;
		}
		// 当没有searchExp时，用当前页面默认的参数
		let ajax = searchExp ? new EWA_AjaxClass : this.CreateAjax();
		let that = this;
		ajax.PostNew(url, function() {
			if (ajax._Http.readyState != 4) {
				return;
			}
			ajax.HiddenWaitting();
			let ret = ajax._Http.responseText;
			if (ajax._Http.status != 200) {
				console.error(ret);
				alert("ERROR:\r\n" + ajax._Http.statusText);
				return;
			}
			if (!EWA.F.CheckCallBack(ret)) {
				console.error(ret);
				return;
			}
			that.replaceRowsWithDataHtml(ret, replaceFuntion, httpReferer, callBack);
		});

	};
	this.replaceRowsWithDataHtml = function(newDataHtml, replaceFuntion, httpReferer, callBack) {
		let pNode = $("<div></div>");
		pNode.html(newDataHtml);

		let changedTrClones = [];
		let tb = $('#EWA_LF_' + this._Id);
		pNode.find(".ewa-lf-data-row").each(function() {
			let ewa_key = $(this).attr('ewa_key');
			let jq = 'tr[ewa_key="' + ewa_key + '"]';
			let targetTr = tb.find(jq);
			if (targetTr.length == 0) {
				console.warn(jq + " not found");
				return;
			}
			// 行数据md5，需要参数 ewa_row_sign=yes
			let sourceRowSign = $(this).attr('ewa_row_sign');
			let targetRowSign = targetTr.attr('ewa_row_sign');
			let changed = true;
			if ((sourceRowSign || targetRowSign) && targetRowSign === sourceRowSign) {
				changed = false;
			}
			if (!changed) { // 数据没有任何变化
				return;
			}
			targetTr.attr('ewa_row_sign', sourceRowSign);

			let clone = targetTr.clone()[0];
			for (let i = 0; i < this.cells.length; i++) {
				let targetTd = targetTr[0].cells[i];
				let sourceTd = this.cells[i];
				targetTd.removeAttribute("ewa-merged"); //已合并标志
				targetTd.removeAttribute("ewa-search-marked"); //已搜索标红标志
				if (replaceFuntion) {
					replaceFuntion(sourceTd, targetTd);
				} else {
					targetTd.innerHTML = sourceTd.innerHTML;
				}
			}
			changedTrClones.push({ "before": clone, "current": targetTr[0] });
		});
		pNode.remove();

		this.SearchMark();
		if (this.IsReShow) {
			this.ReShowWithNoButtons();
		}
		this._ReShowSearchQuick();
		if (this._IsDblClick != null) {
			this.DblClick(this._IsDblClick);
		}

		if (this.SubBottomsArray) {
			this._SubBottoms();
		}
		if (this.ReloadAfter) {
			this.ReloadAfter(httpReferer);
		}
		if (this.ReloadAfterApp) {
			// app中定义
			this.ReloadAfterApp(httpReferer);
		}

		if (callBack) {
			callBack(changedTrClones);
		}
	};

	/**
	 * 调用ACTION
	 * 
	 * @param obj
	 *            调用DoAction的HTML对象
	 * @param action
	 *            调用的Action名称
	 * @param confirm
	 *            执行前确认的信息 _EWA_INFO_MSG定义
	 * @param tip
	 *            执行后提示的信息 _EWA_INFO_MSG定义
	 * @param parasArray
	 *            附加的参数数组, 参数用对象表示para.Name, para.Value
	 * @param afterJs
	 *            执行后调用的脚本
	 */
	this.DoAction = function(obj, action, confirm, tip, parasArray, afterJs) {
		EWA.F.CID = this._Id;
		if (!action) {
			return;
		}
		// app模式下，touch会出现连击的情况，为了避免，设置时间阀值，1000毫秒之内的点击视为无效
		// EWA_App.Section.ajaxLoadedAfter 设置 scroll-delete
		if (obj && $(obj).parent().hasClass('scroll-delete')) {
			var last_t = $(obj).attr('do-action-time') || 0;
			var t1 = (new Date()).getTime();
			if (t1 - last_t < 1000) {
				return;
			}
			$(obj).attr('do-action-time', t1);

		}

		this.lastAction = action;

		this._Ajax = new EWA_AjaxClass;
		this._Ajax.LoadingType = "image";
		this._Ajax.AddParameter("EWA_AJAX", "1");
		this._Ajax.AddParameter("EWA_ACTION", action);
		this._Ajax.AddParameter("EWA_ID", this._Id);
		this._Ajax.AddParameter("EWA_NO_CONTENT", "1");
		this._Ajax.AddParameter("EWA_ACTION_TIP", tip);

		if (afterJs != null && afterJs.trim().length > 0) {
			this._Ajax.AddParameter("EWA_AFTER_EVENT", afterJs);
			// DoAction 指定了提交后的脚本，阻止页面重新加载
			this.StopAjaxAfterReload = true;
			this._Ajax.AddParameter("EWA_ACTION_RELOAD", "0");
		} else {
			this.StopAjaxAfterReload = false;
		}
		if (obj && obj.getAttribute && obj.getAttribute("box_menu_item") == "yes") {// 来自box的调用
			this._Ajax.AddParameter("___CALL__FROM__", "box");
			var p = obj.parentNode;
			if (p) {
				var json_ref = p.getAttribute('json_ref'); // 调用对象的数据
				var json = JSON.parse(json_ref);
				if (json.EWA_KEY) {
					this._Ajax.AddParameter("EWA_ACTION_KEY", json.EWA_KEY);
				}
			}
		} else {

			var key = this.GetRowKey(obj);
			if (key) {
				this._Ajax.AddParameter("EWA_ACTION_KEY", key);
			}
		}
		// 所有被选择的行
		var idsSplit = this.SelectChecked();
		this._Ajax.AddParameter("IDS_SPLIT", idsSplit);

		if (parasArray != null && parasArray.length > 0) { // 附加的参数
			for (var i = 0; i < parasArray.length; i += 1) {
				this._Ajax.AddParameter(parasArray[i].Name, parasArray[i].Value);
			}
		}
		var url = new EWA.C.Url();
		url.SetUrl(this.Url);
		var u = url.RemoveParameter("EWA_ACTION");
		var c = this;
		if (confirm) {
			var msg = _EWA_INFO_MSG[confirm];
			if (!msg) {
				msg = confirm;
			}
			$Confirm(msg, 'Confirm', function() {
				c._Ajax.PostNew(u, function() {
					c._CallBackJs();
				});
			});

		} else {
			this._Ajax.PostNew(u, function() {
				c._CallBackJs();
			});
		}
	};
	this.NewPageSize = function(pageSize) {
		if (this._PageSize == pageSize) {
			return;
		}
		this._PageSize = pageSize;
		this.Goto(1);
	};
	/**
	 * 跳转的页面
	 * 
	 * @param gotoPage
	 *            到第几页
	 * @param httpReferer
	 *            跳转发起的页面，例如Frame，通常是EWA_PostBehavior调用
	 */
	this.Goto = function(gotoPage, httpReferer) {
		EWA.F.CID = this._Id;

		this._PageCurrent = gotoPage;
		this._Ajax = this.CreateAjax();

		var url = new EWA_UrlClass();
		url.SetUrl(this.Url == null ? document.location.href : this.Url);
		url.RemoveParameter("EWA_AJAX");
		var c = this;
		this._Ajax.PostNew(url.GetUrl(), function() {
			c._CallBack(httpReferer);
		});

		if (this.REPLACE_HISTORY_STATE) {
			this.replaceHistoryState();
		}
	};
	// 创建用于替换浏览器的history的url
	this.createReplaceHistoryStateUrl = function() {
		var url = new EWA_UrlClass();
		url.SetUrl(this.Url == null ? document.location.href : this.Url);

		url.AddParameter(this._PageCurrentName, this._PageCurrent);

		if (this._PageSize) {
			url.AddParameter(this._PageSizeName, this._PageSize);
		}
		if (this._Sort != null) {
			url.AddParameter(this._SortName, this._Sort);
		}
		let search = this.SearchGetExpInit();
		if (search) {
			url.AddParameter("EWA_SEARCH", search);
		}
		if (this.GotoParas != null && this.GotoParas.length > 0) {
			for (var i = 0; i < this.GotoParas.length; i += 1) {
				url.AddParameter(this.GotoParas[i].Name, this.GotoParas[i].Value);
			}
		}
		url.RemoveParameter("EWA_AJAX");
		return url;
	};
	this.replaceHistoryState = function() {
		let url = this.createReplaceHistoryStateUrl();
		window.history.replaceState('', null, url.GetUrl());
	};
	this.CreateAjax = function() {
		var ajax = new EWA.C.Ajax();
		ajax.LoadingType = "image";

		ajax.AddParameter(this._PageCurrentName, this._PageCurrent);

		if (this._PageSize) {
			ajax.AddParameter(this._PageSizeName, this._PageSize);
		}
		if (this._Sort != null) {
			ajax.AddParameter(this._SortName, this._Sort);
		}
		if (this._SearchExp != null && this._SearchExp != "") {
			ajax.AddParameter("EWA_LF_SEARCH", this._SearchExp);
		}
		ajax.AddParameter("EWA_AJAX", "LF_RELOAD");
		if (this.GotoParas != null && this.GotoParas.length > 0) {
			for (var i = 0; i < this.GotoParas.length; i += 1) {
				ajax.AddParameter(this.GotoParas[i].Name, this.GotoParas[i].Value);
			}
		}
		return ajax;
	};
	/**
	 * 下载数据
	 * 
	 * @param {String}
	 *            t 类型
	 */
	this.DownlodData = function(t, action) {
		EWA.F.CID = this._Id;
		this._Ajax = new EWA.C.Ajax();
		this._Ajax.LoadingType = "image";

		if (this._Sort != null) {
			this._Ajax.AddParameter(this._SortName, this._Sort);
		}
		if (this._SearchExp != null && this._SearchExp != "") {
			this._Ajax.AddParameter("EWA_LF_SEARCH", this._SearchExp);
		}
		this._Ajax.AddParameter("EWA_AJAX", "DOWN_DATA");
		this._Ajax.AddParameter("EWA_AJAX_DOWN_TYPE", t);
		if (action) {
			this._Ajax.AddParameter("EWA_ACTION", action);
		}
		if (this.GotoParas != null && this.GotoParas.length > 0) {
			for (var i = 0; i < this.GotoParas.length; i += 1) {
				this._Ajax.AddParameter(this.GotoParas[i].Name, this.GotoParas[i].Value);
			}
		}
		this._AjaxType = "DOWN_DATA";

		var url = new EWA_UrlClass();
		url.SetUrl(this.Url == null ? document.location.href : this.Url);
		var c = this;
		this._Ajax.PostNew(url.GetUrl(), function() {
			c._CallBack()
		});
	};
	this.Get = function(url) {
		EWA.F.CID = this._Id;
		this._Ajax = new EWA.C.Ajax();
		this._Ajax.LoadingType = "image";
		var c = this;
		this._Ajax.Get(url, function() {
			c._CallBack()
		});
	};
	this.Post = function(url, info) {
		EWA.F.CID = this._Id;
		this._Ajax = new EWA.C.Ajax();
		this._Ajax.LoadingType = "image";
		var c = this;
		this._Ajax.Post(url, info, function() {
			c._CallBackJs()
		});
	};
	/**
	 * 刷新数据后的回调
	 * 
	 * @param httpReferer
	 *            回调发起的页面，例如Frame
	 */
	this._CallBack = function(httpReferer) {
		var ajax = this._Ajax;
		if (ajax._Http.readyState != 4) {
			ajax = null;
			return;
		}
		ajax.HiddenWaitting();
		if (top.EWA && top.EWA.MQE) {
			var mqe = new EWA_MqeClass();
			mqe.Data = ajax.GetRst();
			mqe.FromId = EWA.F.CID;
			mqe.Type = "POST";
			top.EWA.MQE.AddMqe(mqe);
		}
		// console.log(ajax._Http.status);

		if (ajax._Http.status == 200) {
			var ret = ajax._Http.responseText;

			if (EWA.F.CheckCallBack(ret)) {
				if (this._AjaxType == "DOWN_DATA") { // 下载数据
					this._AjaxType = null;
					if (ret.trim() == 'DENY') {
						alert(_EWA_INFO_MSG["EWA.LF.DOWN_DATA.DENY"]);
					} else {
						window.location.href = ret.trim();
					}
				} else {
					var obj = $X("EWA_LF_" + this._Id);
					var pNode = obj.parentNode;
					// console.log(pNode);
					obj = null;
					// pNode.innerHTML = ret;
					$(pNode).replaceWith(ret); // 避免出现多重div
					var c = this;
					c.SearchMark();
					if (c.IsReShow) {
						c.ReShowWithNoButtons();
					}
					c._ReShowSearchQuick();
					if (c._IsDblClick != null) {
						c.DblClick(c._IsDblClick);
					}
					if (c._IsAddPreRow) {
						c.AddPreRow();
					}
					if (c.SubBottomsArray) {
						c._SubBottoms();
					}
					if (c.ReloadAfter) {
						c.ReloadAfter(httpReferer);
					}
					if (c.ReloadAfterApp) {
						// app中定义
						c.ReloadAfterApp(httpReferer);
					}
					c._IsCheckedAll = true; // 重置全选按钮
				}
			}
		} else {
			alert("ERROR:\r\n" + ajax._Http.statusText);
		}
		ajax = null;
		this.RewriteInfo();
	};

	this._CallBackJs = function() {
		var ajax = this._Ajax;
		if (ajax._Http.readyState != 4) {
			ajax = null;
			return;
		}
		if (top.EWA && top.EWA.MQE) {
			var mqe = new EWA_MqeClass();
			mqe.Data = ajax.GetRst();
			mqe.FromId = EWA.F.CID;
			mqe.Type = "POST";
			top.EWA.MQE.AddMqe(mqe);
		}
		ajax.HiddenWaitting();
		if (ajax._Http.status == 200) {
			var ret = ajax._Http.responseText;
			if (EWA.F.CheckCallBack(ret)) {
				eval(ret);
			}
		} else {
			alert("ERROR:\r\n" + ajax._Http.statusText);
		}
		ajax = null;
		if (this.EditAfterEvent) {
			this.EditAfterEvent();
		}
	};
	// 编辑框输入后自定义触发事件，用户可以覆盖此方法
	this.EditAfterEvent = function() {
		let u1 = this.getUrlClass();
		// 当有行签名时，默认编辑后刷新页面事件 2024-10-23
		if (u1.GetParameter("EWA_ROW_SIGN")) {
			this.refreshPage();
		}
	};
	this._GetItem = function(name) {
		var nodeList = this.ItemList;
		for (var i = 0; i < nodeList.length; i = i + 1) {
			var node = nodeList[i];
			var nameNode = this._GetSubItem("Name", node);
			var name1 = this.Xml.GetElementAttribute(nameNode, "Name");
			if (name1 == name) {
				return node;
			}
		}
	};
	this._GetSubItem = function(subName, itemNode) {
		var nodes = this.Xml.GetElements(subName + "/Set", itemNode);
		if (nodes == null || nodes.length == 0) {
			return null;
		}
		if (subName == 'DescriptionSet') {
			for (var i = 0; i < nodes.length; i += 1) {
				var l = nodes[i].getAttribute('Lang');
				if (l != null && l.trim().toUpperCase() == EWA.LANG.trim().toUpperCase()) {
					return nodes[i];
				}
			}
			return nodes[0];
		} else {
			return nodes[0];
		}
	};
	this._GetSubValue = function(subName, subAttName, itemNode) {
		var subItem = this._GetSubItem(subName, itemNode);
		if (subItem == null) {
			return null;
		}
		var val = this.Xml.GetElementAttribute(subItem, subAttName);
		subItem = null;
		return val;
	};

	/**
	 * 动态添加列
	 * 
	 * @param {Object}
	 *            datas 列的数据
	 * @param {Object}
	 *            colId 列编号
	 * @param {Object}
	 *            colText 列头
	 * @param {Object}
	 *            colMemo 列提示
	 * @param {Object}
	 *            colHtml 列的HTML
	 * @memberOf {TypeName}
	 */
	this.AddColumns = function(datas, colId, colText, colMemo, colHtml, colType, addAttrs, startCellIndex) {
		var tb = $X('EWA_LF_' + this._Id);
		var loc = {};
		if (startCellIndex == null) {
			startCellIndex = tb.rows[0].cells.length;
		}
		for (var i = 0; i < datas.length; i++) {
			var d = datas[i];
			var idx = startCellIndex + i;
			for (var m = 0; m < tb.rows.length; m++) {
				var td = tb.rows[m].insertCell(idx);
				td.title = d[colMemo];
				if (m == 0) {
					td.className = "EWA_TD_H ewa-add-column ewa-col-" + d[colId];
					td.innerHTML = '<nobr cellIdx="' + (idx) + '" id="' + d[colId] + '">' + d[colText] + '</nobr>';
					td.title = d[colMemo];
					td.width = 100;
					loc[d[colId]] = idx;

				} else {
					var rowId = tb.rows[m].getAttribute('EWA_KEY');
					td.className = "EWA_TD_M ewa-add-column ewa-col-" + d[colId];
					var id = rowId + '_' + d[colId];
					var h = this._GetAddControl(d[colType], d[colText], d[colMemo]);
					if (h == null) {
						h = colHtml;
					} else {

					}
					var atts = addAttrs.replace('[ID]', d[colId]);
					if (h.indexOf('<select') >= 0) {
						h = h.replace('!!', atts.replace('onblur=', 'onchange='));
					} else {
						h = h.replace('!!', atts);
					}
					td.innerHTML = h;
					td.childNodes[0].id = id;
				}
			}
		}
	};
	this._GetAddControl = function(type, des, title) {
		if (type == null)
			return null;

		var t = type.toUpperCase().trim();
		let des1 = des ? des.replace(/</ig, '&lt;').replace(/>/ig, '&gt;').replace(/"/ig, '&quot;') : "";
		let title1 = title ? title.replace(/</ig, '&lt;').replace(/>/ig, '&gt;').replace(/"/ig, '&quot;') : "";
		if (t == 'SELECT') {
			return '<select des="' + des1 + '"  title="' + title1 + '" !!></select>';
		} else if (t == 'DATE') {
			return '<input type=text des="' + des1 + '" title="' + title1 + '" class=EWA_INPUT onclick="EWA.UI.Calendar.Pop(this,false);" readonly !!>';
		} else if (t == 'TIME') {
			return '<input type=text des="' + des1 + '" title="' + title1 + '"  class=EWA_INPUT onclick="EWA.UI.Calendar.Pop(this,true);" readonly !!>';
		} else if (t == 'STRING' || t == 'NUMBER') {
			return '<input type=text des="' + des1 + '"  title="' + title1 + '" class=EWA_INPUT !!>';
		}
		return null;
	};
	this.AddedValues = function(colVals, rowId, colId, colValName, isChecked) {
		for (var i = 0; i < colVals.length; i++) {
			var v0 = colVals[i];
			var id = v0[rowId] + '_' + v0[colId];
			var obj = $X(id);
			if (!obj) {
				return;
			}
			var tag = obj.tagName.toUpperCase();
			if (tag == 'INPUT' || tag == 'SELECT' || tag == 'TEXTAREA') {
				obj.value = v0[colValName];
			} else {
				obj.innerHTML = v0[colValName];
			}
			if (isChecked) {
				var tr = this.GetRow(obj);
				tr.getElementsByTagName('input')[0].checked = true;
			}
		}
	};
	this.AddRow = function(arrRowTxt) {
		var tb = $X('EWA_LF_' + this._Id);
		var tr = tb.insertRow(-1);
		for (var i = 0; i < tb.rows[0].cells.length; i++) {
			var td = tr.insertCell(-1);
			var hCell = tb.rows[0].cells[i];
			td.className = "EWA_TD_M";
			if (arrRowTxt[i] != null) {
				td.innerHTML = arrRowTxt[i]
			}
			td.style.display = hCell.style.display;
			td.id = 'ADD_ROW_' + hCell.childNodes[0].id;
		}
		return tr;
	};

	this.Calc = function(arrCols, rowIdxStart, rowIdxEnd, rowSum) {
		var tb = $X('EWA_LF_' + this._Id);
		var sums = {};
		for (var i = 0; i < arrCols.length; i++) {
			sums[arrCols[i]] = 0;
		}
		for (var i = rowIdxStart; i < rowIdxEnd; i++) {
			var tr = tb.rows[i];
			for (var m = 0; m < tr.cells.length; m++) {
				if (sums[m] == null) {
					continue;
				}
				var td = tr.cells[m];
				var inputs = td.getElementsByTagName('input');
				if (inputs.length > 0) {
					sums[m] += inputs[0].value * 1;
				} else {
					var v = GetInnerText(td);
					if (v == '') {
						v = 0;
					}
					sums[m] += v * 1
				}
			}
		}
		var trSum = tb.rows[rowSum];
		for (var i = 0; i < trSum.cells.length; i++) {
			if (sums[i] != null) {
				var v = Math.round(sums[i] * 100) / 100;
				var v1 = GetInnerText(trSum.cells[i]);
				if (v != v1 * 1) {
					this.IsCalcChanged = true;
				}
				trSum.cells[i].innerHTML = v.fm();
			}
		}
	};
	/**
	 * 合并表头
	 * 
	 * @param formId
	 *            开始的字段id
	 * @param mergeText
	 *            合并的文字
	 * @param rowNums
	 *            从formId开始 合并的字段数量
	 */
	this.mergeHeaders = function(fromId, mergeText, rowNums) {
		var tb = $($X('EWA_LF_' + this._Id));
		var tr = tb.find('tr[ewa_tag="HEADER"]');
		if (tr.length == 0) {
			return;
		}
		var tdstart = tr.find('nobr[id="' + fromId + '"]').parent();
		if (tdstart.length == 0) {
			return;
		}
		var meargeTr = tb.find('tr[ewa_mearge]');
		if (meargeTr.length == 0) {
			meargeTr = $(tb[0].insertRow(1));
			meargeTr.attr("ewa_mearge", "gdx");
		}
		var i_start = -1;
		var new_td = null;
		for (var i = 0; i < tr[0].cells.length; i++) {
			var td = tr[0].cells[i];
			if (td == tdstart[0]) { // 合并开始的td
				i_start = i;
				td.colSpan = rowNums;
			}
			if (i_start == -1) {// 不是合并的td
				if ($(td).attr('ewa_tdmearged') != "1") {
					td.rowSpan = 2;
				}
			} else {
				if (i_start + rowNums == i) {
					// 合并结束后的第一个的td
					i_start = -1;
					td.rowSpan = 2;
				} else {
					td.rowSpan = 1;
					var td1 = meargeTr[0].insertCell(-1);
					td1.innerHTML = td.innerHTML;
					td1.className = td.className;
					td1.style.cssText = td.style.cssText;

					td.style.display = 'none';
					$(td).attr('ewa_tdmearged', 1);
				}
			}
			if (td == tdstart[0]) {
				td.innerHTML = mergeText;
				td.style.display = '';
				td.style.width = ''; // 取消宽度限制
			}
		}
	};
	/**
	 * 合并头部
	 */
	this.MeargeHeader = function(fromId, meargeText, rowNums) {
		console.log('拼写错误，请用 mergeHeaders');
		this.mergeHeaders(fromId, meargeText, rowNums);
	};

	this.getUrlClass = function() {
		var u = new EWA_UrlClass();
		u.SetUrl(this.Url);
		return u;
	};
};

EWA_ListFrameClass.prototype.RESOURCES = {
	search_text_items: [{
		Id: "lk",
		Txt: "包含",
		TxtEn: "Like"
	}, {
		Id: "llk",
		Txt: "左包含",
		TxtEn: "Left like"
	}, {
		Id: "rlk",
		Txt: "右包含",
		TxtEn: "Right like"
	}, {
		Id: "eq",
		Txt: "等于",
		TxtEn: "Equals"
	}, {
		Id: "uneq",
		Txt: "不等于",
		TxtEn: "Not equals"
	}, {
		Id: "nlk",
		Txt: "不包含",
		TxtEn: "Not contains"
	}, {
		Id: "blk",
		Txt: "空白",
		TxtEn: "Blank"
	}, {
		Id: "nblk",
		Txt: "非空白",
		TxtEn: "Not blank"
	}],
	search_date_items: [{
		Id: "Clear",
		Txt: "清空",
		TxtEn: "Clear",
		Img: "fa fa-eraser"
	}, {
		Id: "Today",
		Txt: "今天",
		TxtEn: "Today"
	}, {
		Id: "Week",
		Txt: "本周",
		TxtEn: "Week"
	}, {
		Id: "Today-Weekend",
		Txt: "今天至周日",
		TxtEn: "Today-Weekend"
	}, {
		Id: "Month",
		Txt: "本月",
		TxtEn: "This Month"
	}, {
		Id: "Today-EOM",
		Txt: "今天至月底",
		TxtEn: "Today-EOM"
	}, {
		Id: "Quarter",
		Txt: "本季度",
		TxtEn: "This Quarter"
	}, {
		Id: "Today-EOQ",
		Txt: "今天至季末",
		TxtEn: "Today-EOQ"
	}, {
		Id: "Year",
		Txt: "本年度",
		TxtEn: "This Year"
	}, {
		Id: "Today-EOY",
		Txt: "今天至年底",
		TxtEn: "Today-EOY"
	}]
};

EWA.F.L = {/* ListFrame */
	CUR: null,
	C: EWA_ListFrameClass
};// merge to EWA_04FrameListClass.js;
/**
 * 用于表宽度的拖动 --未完成
 * 
 * @param instanceName
 */
function EWA_ListFrame_CellResizeClass(instanceName) {
	this._Name = instanceName;
	this._Table=null;
	this._Cover=null;
	this._CellResize = new Array();
	/**
	 * 初始化
	 * 
	 * @param objTable
	 *            目标表对象
	 */
	this.Init = function(objTable) {
		this._Table = objTable;
		this._Table.style.tableLayout = 'fixed';

		this._Table.style.width = this._Table.clientWidth + 'px';

		this._Cover = this._CreateElement('div', "width:100%; height:100%;background-color:blue; position:absolute; "
			+ "top:0px; left:0px; display:block; " + "filter:alpha(opacity=0);opacity:0", document.body);

		for (var i = 0; i < this._Table.rows[0].cells.length - 1; i++) {
			this._CreateMarker(i);
		}
		this._SetLocation();
	}

	this._ShowCover = function(isShow) {
		if (isShow) {
			this._Cover.style.display = 'block';
		} else {
			this._Cover.style.display = 'none';
		}
	}

	this._EventX = function(e) {
		return e.x ? e.x : e.pageX;
	}

	this._OnMouseDown = function(obj, evt) {
		this._ShowCover(true);
		obj.childNodes[0].style.borderLeft = '1px solid black';
		obj.setAttribute('D', 1);
		var e = evt ? evt : event;
		var x = this._EventX(e);
		obj.setAttribute('X', x);
		obj.setAttribute('SX', x);
		if (typeof e.preventDefault != "undefined") {
			e.preventDefault();
		}
		typeof e.stopPropagation != "undefined" ? e.stopPropagation() : e.cancelBubble = true;
	}

	this._OnMouseUp = function(obj, evt) {
		obj.childNodes[0].style.borderLeft = '1px';
		obj.setAttribute('D', 0);
		var e = evt ? evt : event;
		var x = this._EventX(e);

		var dx = x - obj.getAttribute('SX') * 1;
		var tdIndex = obj.getAttribute('TDINDEX');

		var td = this._Table.rows[0].cells[tdIndex];
		var px = td.clientWidth + dx;
		td.style.width = px < 4 ? 4 : px + 'px';
		this._SetLocation();

		if (typeof e.preventDefault != "undefined") {
			e.preventDefault();
		}
		typeof e.stopPropagation != "undefined" ? e.stopPropagation() : e.cancelBubble = true;
		// ccc.innerText=px;

	}

	this._OnMouseOut = function(obj, evt) {
		if (obj.getAttribute('D') == "1") {
			obj.style.left = obj.getAttribute('SX') + 'px';
			obj.setAttribute('D', 0);
			this._SetLocation();
			obj.childNodes[0].style.borderLeft = '1px';

		}
		this._ShowCover(false);
	}

	this._OnMouseMove = function(obj, evt) {
		this._ShowCover(true);

		if (obj.getAttribute('D') != '1')
			return;
		var e = evt ? evt : event;
		var x = this._EventX(e);

		var x0 = obj.getAttribute('X') * 1;
		var dx = x - x0;
		obj.style.left = obj.style.left.replace('px', '') * 1 + dx + 'px';
		obj.setAttribute('X', x);
		if (typeof e.preventDefault != "undefined") {
			e.preventDefault();
		}
		typeof e.stopPropagation != "undefined" ? e.stopPropagation() : e.cancelBubble = true;
	}

	this._CreateMarker = function(tdIndex) {
		var otd = this._Table.rows[0].cells[tdIndex];
		var style = 'width:40px; height:' + this._Table.clientHeight + 'px; position:absolute;cursor:e-resize';
		var obj = this._CreateElement('div', style, document.body);
		obj.setAttribute('TDINDEX', tdIndex);
		obj.setAttribute('instanceName', instanceName);

		obj.onmouseover = function() {
			var instanceName = this.getAttribute('instanceName');
			var myclass = eval('window.' + instanceName);
			myclass._ShowCover(true);
		}

		obj.onmousedown = function(event) {
			var instanceName = this.getAttribute('instanceName');
			var myclass = eval('window.' + instanceName);
			myclass._OnMouseDown(this, event);
		}

		obj.onmouseup = function(event) {
			var instanceName = this.getAttribute('instanceName');
			var myclass = eval('window.' + instanceName);
			myclass._OnMouseUp(this, event);

		}
		obj.onmouseout = function(event) {
			var instanceName = this.getAttribute('instanceName');
			var myclass = eval('window.' + instanceName);
			myclass._OnMouseOut(this, event);
		}

		obj.onmousemove = function(event) {
			var instanceName = this.getAttribute('instanceName');
			var myclass = eval('window.' + instanceName);
			myclass._OnMouseMove(this, event);
		}

		var obj1 = this._CreateElement('div', "width:1px;height:100%;position:absolute;top:0px;left:20px;border-Left:1px ;", obj);

		this._CellResize[tdIndex] = obj;
		obj = obj1 = null;
	}

	this._SetLocation = function() {
		for (var i = 0; i < this._Table.rows[0].cells.length - 1; i++) {
			var otd = this._Table.rows[0].cells[i];
			var xy = this._Location(otd);
			if (otd.style.width != "") {
				otd.style.width = otd.clientWidth + 'px';
			}
			this._CellResize[i].style.left = (xy[0] + otd.clientWidth - this._CellResize[i].clientWidth / 2) + 'px';
			this._CellResize[i].style.top = xy[1] + 'px';
		}

	}

	this._CreateElement = function(tagName, style, objParent) {
		var obj = document.createElement(tagName);
		if (style != null) {
			obj.style.cssText = style;
			obj.setAttribute('style', style);
		}
		if (objParent != null) {
			objParent.appendChild(obj);
		}
		return obj;
	}

	this._Location = function(obj) {
		var o1 = obj;
		var x, y;
		x = y = 0;
		do {
			x += o1.offsetLeft;
			y += o1.offsetTop;
			o1 = o1.offsetParent;
		} while (o1.tagName != 'BODY')

		return new Array(x, y);
	}

}
/**
 * 显示隐藏列
 * 
 * @param instanceName
 */
function EWA_ListFrame_ShowHideColumns(instanceName){
	this._name=instanceName;
	this.frameUnid="";
	this.storageId="";
	this.inited=false;//已初始化
	this.notHideColsArr=[];//禁止隐藏的列
    this.defHideCols="";//默认隐藏的列
	this.readme="合并列和设置完初始查询条件后，再执行init。"
		+" 参数说明：SYS_FRAME_UNID;不隐藏的列（逗号分隔），复选列不隐藏"
		+" defHideCols 默认隐藏的列",
    this.wrap="",//容器ID，默认："#"+fraUnid+"_RESHOW"
    this.setWrap=function(wrapId){
		this.wrap="#"+wrapId;
	},
	this.initPart=function(fraUnid,notHideCols,defHideCols){
		var wrapId;
	    if($(".grp-part").length>0){
	        wrapId=$("#EWA_LF_"+fraUnid).parentsUntil(".grp-part").parent().attr("id");
	        this.setWrap(wrapId);
	    }
	    this.init(fraUnid,notHideCols,defHideCols);
	    if(wrapId){
	        $("#"+wrapId+" .but-shc-gear b.fa-gear").css({"line-height":"100%","font-size":"14px"});
	    }
	},
    this.init=function(fraUnid,notHideCols,defHideCols){
        if(!this.inited){
            var _self=this;
            this.frameUnid=fraUnid;
            if(!this.wrap){
            	this.wrap="#"+fraUnid+"_RESHOW";
            }
            this.defHideCols=defHideCols;
            this.storageId="LF_HIDE_COLS_"+this.frameUnid;
            if(notHideCols){
                this.notHideColsArr=notHideCols.split(",");
            }
            if(defHideCols && !window.localStorage.hasOwnProperty(this.storageId)){
                window.localStorage[this.storageId]=defHideCols;
            }
            var caption=$(this.wrap+" .ewa_lf_func_caption").parent();     
            
            var firstInit=false;
            if(caption.find(".but-shc-gear").length===0){
                firstInit=true;
                var but="<div class=\"ewa_lf_func_dact ewa-lf-func-recycle but-shc-gear\">"
                    +"<b class=\"fa fa-gear\" "
                    +" style=\"font-size: 16px;line-height: 30px;\"></b></div>";
                caption.append(but);
            
                caption.find(".but-shc-gear").on("click",function(){
                	_self.togglePanel();
                });
            }
            
            var hideIds=window.localStorage[this.storageId];
            var arrHideIds;
            if(hideIds){
                arrHideIds=hideIds.split(",");
                if(!firstInit){
                    for(var i=0;i<arrHideIds.length;i++){
                        $("#EWA_LF_"+fraUnid+" .ewa-col-"+arrHideIds[i]+".EWA_TD_H:hidden").show();
                    }
                }
            }else{
                arrHideIds=[];
            }
            
            var header=$("#EWA_LF_"+fraUnid+" .EWA_TD_H:not(:hidden)");
            var fields=[];
            header.each(function(){
                if($(this).find("a[href*='CheckedAll']").length===0){
                    var tdId=$(this).find("nobr").attr("id");
                    var tdName=$(this).text();
                    fields.push({"id":tdId,"name":tdName});
                }
            });
            
            if(fields.length===0){
                this.hideCols();
                return;
            }
            
            var ht=[];
            ht.push("<div class='custom-cols-panel-box' data-fid=\""+this.frameUnid+"\">");
            var headerContent="";
            if(EWA.LANG.toLowerCase()=="enus"){
                headerContent="Show/Hide";
                headerContent+="&nbsp;&nbsp;<a href='javascript:void(0)' class='but-default'>Default</a>"; 
            }else{
                headerContent="显示/隐藏列";  
                headerContent+="&nbsp;&nbsp;<a href='javascript:void(0)' class='but-default'>默认</a>";
            }
            
            headerContent+="<b class='fa fa-close but-close'></b>";
            ht.push("<div class='custom-cols-header'>"+headerContent+"</div>");
            
            ht.push("<div class='custom-cols-contain'>");
            
            
            ht.push("<ul>");
            for(var i=0;i<fields.length;i++){
                ht.push("<li><input type='checkbox' checked "
                    +" value='"+fields[i].id+"' id='custom_cols_id_"+fields[i].id+"'>"
                    +"<label for='custom_cols_id_"+fields[i].id+"'>"+fields[i].name.replace(/>/ig,'&gt')+"</label></li>");
            }
            ht.push("</ul>");
            ht.push("</div>");
            ht.push("</div>");
            caption.append(ht.join(""));
            
            caption.find(".but-default").on("click",function(){
            	_self.setDefault();
            });
            
            caption.find(".but-close").on("click",function(){
            	_self.togglePanel();
            });
            
            caption.find("li input[type=checkbox]").on("click",function(){
            	_self.setCol(this.value);
            });
            
            if(arrHideIds.length>0){
                for(var i=0;i<arrHideIds.length;i++){
                    if($(this.wrap+" .custom-cols-panel-box input[value='"+arrHideIds[i]+"']").length>0){
                        $(this.wrap+" .custom-cols-panel-box input[value='"+arrHideIds[i]+"']")[0].checked=false;
                    }else{
                        this.setCol(arrHideIds[i]);
                    }
                }
            }
            if(this.notHideColsArr.length>0){
                for(var i=0;i<this.notHideColsArr.length;i++){
                    var id2=this.notHideColsArr[i];
                    var obj=$(this.wrap+" .custom-cols-panel-box input[value='"+id2+"']");
                    if(obj.length>0){
                        obj.parent().addClass("not-hide-col");
                        if(!obj[0].checked){
                            this.setCol(id2);
                            obj[0].checked=true;
                        }
                        obj[0].disabled=true;
                    }
                }
            }
            
            this.inited=true;
        }
        this.hideCols();
    };
    this.adjustPanel=function(){    	
        var maxHeight=window.innerHeight-80;
        var containHeight=$(this.wrap+" .custom-cols-contain").height();
        var gearLeft=$(this.wrap+" .but-shc-gear").offset().left;
        var w=window.innerWidth;
        var panelWidth=$(this.wrap+" .custom-cols-panel-box").width();
        var right=(w-panelWidth)/2
        $(this.wrap+" .custom-cols-contain").css({"max-height":maxHeight});
        $(this.wrap+" .custom-cols-panel-box").css({"right":right,"top":"0"});
        
    };
    this.togglePanel=function(){
    	if(!this.inited){
    		this.init(this.frameUnid);
    	}
    	$(".custom-cols-panel-box[data-fid!=\""+this.frameUnid+"\"]").hide();
        $(this.wrap+" .custom-cols-panel-box").toggle();
        if(!$(this.wrap+" .custom-cols-panel-box").is("hide")){
            this.adjustPanel();
        }
    };
    this.hideCols=function(){
        var ids=window.localStorage[this.storageId];
        if(!ids){
            return;
        }
        var arrIds=ids.split(",");
        for(var i=0;i<arrIds.length;i++){
            this.hide(arrIds[i]);
        }
    };
    this.show=function(id){
        $("#EWA_LF_"+this.frameUnid+" .ewa-col-"+id).show();
        $("#EWA_SEARCH_ITEM_"+this.frameUnid+" .ewa-lf-search-item [name='"+id+"']")
            .parentsUntil(".ewa-lf-search-item").last().parent().show();
        $("#EWA_LF_"+this.frameUnid+" #ADD_ROW_"+id).show();
        $("#EWA_LF_"+this.frameUnid+" #INS_ROW_"+id).show();
    };
    this.hide=function(id){
        var pp=$("#EWA_SEARCH_ITEM_"+this.frameUnid+" .ewa-lf-search-item [name='"+id+"']")
            .parentsUntil(".ewa-lf-search-item").last().parent();
        pp.find("select").val("");
        pp.find("input[type=text]").val("");
        pp.find("input:checked").each(function(){this.checked=false});
        $("#EWA_LF_"+this.frameUnid+" .ewa-col-"+id).hide();
        pp.hide();
        $("#EWA_LF_"+this.frameUnid+" #ADD_ROW_"+id).hide();
        $("#EWA_LF_"+this.frameUnid+" #INS_ROW_"+id).hide();
    };
    this.setCol=function(id){
        if(!this.frameUnid){
            $Tip("not init");
        }
        if($("#EWA_LF_"+this.frameUnid+" .ewa-col-"+id+" a[href*='CheckedAll']").length>0){
            return;
        }
        var ids=window.localStorage[this.storageId];
        if(!ids){
            window.localStorage[this.storageId]=id;
            this.hide(id);
            return;
        }
        var arrIds=ids.split(",");
        var newArrIds=[];
        for(var i=0;i<arrIds.length;i++){
            if(id==arrIds[i]){
                this.show(id);
            }else{
                newArrIds.push(arrIds[i]);
            }
        }
        if(arrIds.length==newArrIds.length){
            newArrIds.push(id);
            this.hide(id);
        }
        window.localStorage[this.storageId]=newArrIds.join(",");
    };
    this.setDefault=function(){
       this.togglePanel();
       window.localStorage[this.storageId]=this.defHideCols;
       var ipts=$(this.wrap+" .custom-cols-panel-box input");
       for(var i=0;i<ipts.length;i++){
           ipts[i].checked=true;
       }
       if(this.defHideCols){
            var arrIds=this.defHideCols.split(",");
            for(var i=0;i<arrIds.length;i++){
                if($(this.wrap+" .custom-cols-panel-box input[value='"+arrIds[i]+"']").length>0){
                    $(this.wrap+" .custom-cols-panel-box input[value='"+arrIds[i]+"']")[0].checked=false;
                }else{
                    this.setCol(arrIds[i]);
                }
            }
        }
       EWA.F.FOS[this.frameUnid].Reload();
    }
}/**
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
/**
 * Tree Node Class
 */
function EWA_TreeNodeClass() {
	this.Key = null;
	this.Text = null;
	this.MenuGroup = null;
	this.Parent = null;
	this.Prev = null;
	this.Next = null;
	this.AddParas = new Array();
	this.Children = new Array();
	this.ChildLast = null;
	this.Cmd = null;
	this.tagName = "TREE_NODE";
	this.Object = null;
	this.IsMoreChildren = false;

	this.Mark = function(isMark) {
		// var obj = this.GetObject().rows[0].cells[2];
		// if (isMark) {
		// obj.childNodes[0].style.backgroundColor = "blue";
		// obj.childNodes[0].style.color = "white";
		// } else {
		// obj.childNodes[0].style.backgroundColor = "";
		// obj.childNodes[0].style.color = "";
		// }
		var obj = $(this.GetObject().rows[0]);
		if (isMark) {
			$(obj).addClass('ewa-tree-node-marked');
		} else {
			$(obj).removeClass('ewa-tree-node-marked');
		}
	}
	/**
	 * 修改Key值，一般用于新增后将Key修改为数据库值
	 * 
	 * @param newKey
	 *            修改后的Key值
	 */
	this.SetKey = function(newKey) {
		var obj = this.GetObject();
		this.Key = newKey;
		obj.id = newKey;
	}
	this.SetText = function(newText) {
		this.Text = newText;
		var obj = this.GetObject();
		obj.rows[0].cells[2].childNodes[0].innerHTML = newText;
	}
	this.SetAddParameters = function(parameters) {
		this.AddParas = parameters.split(',');
		var obj = this.GetObject();
		for (var i = 0; i < this.AddParas.length; i += 1) {
			obj.rows[0].cells[2].childNodes[0].setAttribute('EWA_P' + i,
				this.AddParas[i].trim());
		}
	}
	this.SetMenuGroup = function(menuGroup) {
		var obj = this.GetObject();
		obj.setAttribute('EWA_MG', menuGroup);
	}
	this.AddChild = function(node) {
		node.Parent = this;
		this.Children[this.Children.length] = node;
		this.ChildLast = null;
		this.ChildLast = node;
		this.IsMoreChildren = false;
	};
	this.GetObject = function() {
		if (this.Object == null) {
			this.Object = document.getElementById(this.Key);
		}
		return this.Object;
	};
	this.AddBackground = function(src) {
		var tb = this.GetObject();
		tb.rows[1].cells[0].background = src;
	};
	this.SetBookIcon = function(css) {
		var tb = this.GetObject();
		tb.rows[0].cells[1].className = css;
	};
	/**
	 * 节点是否处于打开状态
	 */
	this.IsNodeOpen = function() {
		var tb = this.GetObject();
		var td = tb.rows[0].cells[0];
		tag = this._GetTag(td);
		return tag == "B";
	};
	this.NodeShow = function(isOpen) {
		if (this.Key == 'EWA_TREE_ROOT') {
			return;
		}
		var tb = this.GetObject();
		var td = tb.rows[0].cells[0];
		var tag;
		if (isOpen == null) {// 未定显示方式，取当前状态反值
			tag = this._GetTag(td);
			if (tag == "C" || tag == "D") {
				return;
			}

			tag = tag == "A" ? "B" : "A";
		} else {
			tag = isOpen ? "B" : "A";
		}

		var css = td.className.split(' ');
		var css1 = [this._GetClassNameNoTag(td) + tag];
		for (var i = 1; i < css.length; i++) {
			css1.push(css[i]);
		}
		td.className = css1.join(' ');

		if (tb.rows.length == 2 && tb.rows[1].cells[1].childNodes.length > 0) {
			tb.rows[1].style.display = tag == "B" ? "table-row" : "none";
		}
		this.BookShow(isOpen);
		td = tb = null;
		if (this.IsMoreChildren) { // 通过Ajax调用,显示更多的子节点
			this.Object.setAttribute("EWA_TREE_MORE", "0");
			var cmd = new EWA.F.Cmd();
			cmd.EWA_ACTION = "OnTreeNodeMore";
			cmd.EWA_TREE_KEY = this.Key;
			EWA.CurUI._PostChange(cmd);
		}

		if (this.ewa && this.ewa.OnBookShowAfter) {
			try {
				this.ewa.OnBookShowAfter(tag == 'B', this);
			} catch (e) {
				console.log(e);
			}
		}
	};
	this.BookShow = function(isOpen) {
		if (this.Key == 'EWA_TREE_ROOT') {
			return;
		}
		var tb = this.GetObject();
		var td = tb.rows[0].cells[1];
		if (isOpen == null) {// 未定显示方式，取当前状态反值
			tag = this._GetTag(td);
			tag = tag == "A" ? "B" : "A";
		} else {
			tag = isOpen ? "B" : "A";
		}
		var css = td.className.split(' ');
		var css1 = [this._GetClassNameNoTag(td) + tag];
		for (var i = 1; i < css.length; i++) {
			css1.push(css[i]);
		}
		td.className = css1.join(' ');
		td = tb = null;
	};
	this.NodeClose = function() {
		this.NodeShow(false);
	};
	this.NodeOpen = function() {
		this.NodeShow(true);
	};
	this.BookOpen = function() {
		this.BookShow(true);
	};
	this.BookClose = function() {
		this.BookShow(false);
	};
	this.NodeCross = function(isMust) {
		var tb = this.GetObject();
		var td = tb.rows[0].cells[0];
		var tag = this._GetTag(td);
		if (tag == "D" || isMust) {
			td.className = this._GetClassNameNoTag(td) + "C";
		}
		if (tb.rows.length == 1) {
			var tr = tb.insertRow(-1);
			tr.insertCell(-1);
			tr.insertCell(-1);
			tr.cells[1].colSpan = 2;
			tr.style.display = "none";
		}
		td = tb.rows[1].cells[0];
		td.className = "TD10B";
		td = tb = null;
	};
	this.NodeCrossEnd = function(isMust) {
		var tb = this.GetObject();
		var td = tb.rows[0].cells[0];
		var tag = this._GetTag(td);
		if (tb.rows.length == 1) {
			var tr = tb.insertRow(-1);
			tr.insertCell(-1);
			tr.insertCell(-1);
			tr.cells[1].colSpan = 2;
		}
		tb.rows[1].style.display = "none";
		if (tag == "C" || isMust) {
			td.className = this._GetClassNameNoTag(td) + "D";
		}
		td = tb.rows[1].cells[0];
		td.className = "TD10A";
		td = tb = null;
	};
	this._GetTag = function(obj) {
		var className = obj.className.split(' ')[0];
		var tag = className.substring(className.length - 1);
		return tag;
	};
	this._GetClassNameNoTag = function(obj) {
		var className = obj.className.split(' ')[0];
		return className.substring(0, className.length - 1);
	};
}

/**
 * 树操作类
 * 
 * @param {Object}
 *            parentObject 父节点
 * @param {Object}
 *            className 类名称
 * @param {Object}
 *            url 提交URL
 */
function EWA_TreeClass(parentObject, className, url) {
	this.ParentObject = parentObject;
	this.ClassName = className;
	this._Url = url;
	this.Url = url;
	this.Resources = {}; // 资源
	this._Ajax = null; // = new EWA.C.Ajax();
	this.Menu = null; // EWA_UI_MenuClass(className + ".Menu");
	this.Icons = null;
	this._CurNewNode = 0;
	this.Fields = {}; // 字段表达式
	this._Id = null; // 类编号
	this._LastFocus = null; // 最后选中的节点
	this._TempNode = document.createElement('DIV');
	this._MoveNode = document.createElement('DIV');
	// 主模板
	this._HtmlTemplate1 = "<div oncontextmenu='"
		+ this.ClassName
		+ ".ShowMenu(event);return false;' onclick='"
		+ this.ClassName
		+ ".Click(event)'><table border=0 cellspacing=0 [ID] cellpadding=0 width=100% style='table-layout:fiexed'>";
	this._HtmlTemplate1 += "<tr><TD></TD><td class=CAPTION>&nbsp;&nbsp;&nbsp;</td><td width=99%><SPAN style='padding-left:4px'>[B]</SPAN></td></tr>";
	this._HtmlTemplate1 += "<tr><td></td><td colspan=2></td></tr></table></div>";
	this._HtmlTemplate1 += "<div style='display:none'><input style='margin:0px' type=text onblur='"
		+ this.ClassName + ".RenameBlur(this)'></div>";

	// 节点模板
	this._HtmlTemplate = "<table class='ewa-tree-node ewa-tree-lvl-[LVL]' border=0 EWA_MG=\"[EWA_MENU_GROUP]\" EWA_T=1 [EWA_MORE_CHILDREN] cellspacing=0 [ID] cellpadding=0 width=100%>";
	this._HtmlTemplate += "<tr class='ewa-node-row-0'><td nowrap class='[A] ewa-node-open-close'><div>&nbsp;</div></td>"
		+ "<td nowrap class='[B] ewa-node-icon'><div>&nbsp;</div></td>"
		+ "<td class='ewa-node-caption'><SPAN EWA_CMD=1 [TMP_ADD_PARAS]>[C]</SPAN></td>"
		+ "[TEMP_NODE_ADD_FIELDS]" // 附加字段替换;
	this._HtmlTemplate += "</tr><tr class='ewa-node-row-1' style='display:none'><td class='[A1]'></td><td colspan=13></td></tr></table>";

	/**
	 * 打开所有节点
	 */
	this.OpenAll = function() {
		this._OpenOrClose('.TD00A');
	};
	/**
	 * 关闭所有节点
	 */
	this.CloseAll = function() {
		this._OpenOrClose('.TD00B');
	};

	/**
	 * 打开或关闭节点
	 * 
	 * @param className
	 *            节点的类名称
	 */
	this._OpenOrClose = function(className) {
		var p = $('#EWA_TREE_' + this._Id);
		var c = this;
		p.find(className).each(function() {
			var fackevt = {
				srcElement: this
			};
			c.Click(fackevt);
		});
	}

	this.DoAction = function(obj, action, confirm, tip, parasArray, afterJs) {
		EWA.F.CID = this._Id;
		if (action == null || action.trim() == "") {
			alert("action not value");
			return;
		}

		if (confirm != null && confirm.trim().length > 0) {
			var msg = _EWA_INFO_MSG[confirm];
			if (!(msg == null || msg == "")) {
				if (!window.confirm(msg)) {
					return;
				}
			} else {
				if (!window.confirm(confirm)) {
					return;
				}
			}
		}

		this._Ajax = new EWA.C.Ajax();
		this._Ajax.LoadingType = "image";
		this._Ajax.AddParameter("EWA_AJAX", "1");
		this._Ajax.AddParameter("EWA_ACTION", action);
		this._Ajax.AddParameter("EWA_ID", this._Id);
		this._Ajax.AddParameter("EWA_NO_CONTENT", "1");
		this._Ajax.AddParameter("EWA_ACTION_TIP", tip);

		if (afterJs != null && afterJs.trim().length > 0) {
			this._Ajax.AddParameter("EWA_AFTER_EVENT", afterJs);
			// DoAction 指定了提交后的脚本，阻止页面重新加载
			this.StopAjaxAfterReload = true;
			this._Ajax.AddParameter("EWA_ACTION_RELOAD", "0");
		} else {
			this.StopAjaxAfterReload = false;
		}

		if (parasArray != null && parasArray.length > 0) { // 附加的参数
			for (var i = 0; i < parasArray.length; i += 1) {
				this._Ajax
					.AddParameter(parasArray[i].Name, parasArray[i].Value);
			}
		}
		var url = new EWA.C.Url();
		url.SetUrl(this.Url);
		var u = url.RemoveParameter("EWA_ACTION");
		this._Ajax.PostNew(u, EWA.F.FOS[EWA.F.CID]._PostChangeCallback);
	};

	this.OnMouseDown = function(evt) {
		// if (EWA.B.IE) {
		// }
	}
	this.OnMouseUp = function(evt) {

	}
	this.OnMouseMove = function(evt) {

	}
	this.OnMouseOut = function(evt) {

	}

	this.MoveNode = function(node) {
		/*
		 * this._MoveNode.innerHTML=""; this._MoveNode.id='Test1';
		 * this._MoveNode.appendChild(node.cloneNode(true));
		 * document.body.appendChild(this._MoveNode);
		 * with(this._MoveNode.style){ border='1px #DDD dotted';
		 * display='block'; position='absolute'; left=event.x; top=event.y;
		 * position='absolute'; }
		 */
	}
	this.GetParentNode = function(node) {
		if (node == null || node.Key == 'EWA_TREE_ROOT') {
			return null;
		}
		var obj = node.GetObject().parentNode;
		var n = this.GetNode(obj);
		if (n == null) {
			return null;
		}
		if (n.Key == 'EWA_TREE_ROOT') {
			return null;
		} else {
			return n;
		}
	}
	/**
	 * 通过XML生产节点
	 * 
	 * @param xml
	 *            XML类(EWA.C.Xml())
	 */
	this.CreateByXml = function(xml) {
		var nl = xml.GetElements("FrameData/Row");
		var oNodes = new Object();
		var firstNode;
		for (var i = 0; i < nl.length; i += 1) {
			var treeNode = this._CreateNodeFromXml(nl[i], xml);
			oNodes[treeNode.Key] = treeNode;
			if (i == 0) {
				firstNode = treeNode;
			} else {
				var key = treeNode.ParentKey == "" ? "EWA_TREE_ROOT"
					: treeNode.ParentKey;
				var treeNodeParent = oNodes[key];
				if (treeNodeParent != null) {
					treeNodeParent.AddChild(treeNode);
				}
			}
		}
		treeFirstNode = firstNode;
		this.Create(firstNode);
	};
	/**
	 * 确定是否可以选择
	 * 
	 * @param evt
	 *            event
	 */
	this.OnSelect = function(evt) {
		var obj = evt.srcElement;
		if (obj.tagName != "INPUT") {
			return false;
		} else {
			return true;
		}
	};

	/**
	 * 初始化菜单
	 * 
	 * @param {EWA_UI_MenuItemClass[]}
	 *            menus
	 */
	this.InitMenu = function(menus) {
		if (menus != null) {
			this.Menu = new EWA_UI_MenuClass(className + ".Menu");
			this.Menu.Create(menus); // 生成菜单
		}
	};
	/**
	 * 提交AJAX事件
	 * 
	 * @param cmd
	 *            事件
	 */
	this._PostChange = function(cmd) {// EWA UI TreeChange
		this.PostChangeType = cmd.EWA_ACTION;
		this.PostChangeKey = cmd.EWA_TREE_KEY;

		EWA.CurUI = this;
		this._Ajax = new EWA.C.Ajax();
		if (this.PostChangeType == "OnTreeNodeMore") {
			cmd.EWA_AJAX = "XML";
			cmd.EWA_TREE_MORE = "1"; // 更多的节点
		}
		for (var a in cmd) {
			this._Ajax.AddParameter(a, cmd[a]);
		}
		this._Ajax.PostNew(this._Url, EWA.CurUI._PostChangeCallback);
		this.IsPostChange = true;
	};

	/**
	 * 事件提交后的处理
	 */
	this._PostChangeCallback = function() {
		var ajax = EWA.CurUI._Ajax;
		if (ajax._Http.readyState != 4) {
			ajax = null;
			return;
		}
		ajax.HiddenWaitting();
		if (ajax._Http.status == 200) {
			var ret = ajax._Http.responseText;
			// 检查是否错误提示
			var isRightResponse = EWA.F.CheckCallBack(ret);
			if (isRightResponse) {
				// 更多的节点或初始化选中节点
				if (EWA.CurUI.PostChangeType == "OnTreeNodeMore") {
					EWA.CurUI.LoadChildrenAfter(ret);
				} else if (EWA.CurUI.PostChangeType == "OnTreeNodeStatus") {
					EWA.CurUI.LoadChildrenStatus(ret);
				} else if (EWA.CurUI.PostChangeType == "OnTreeNodeDelete") {
					EWA.CurUI.DeleteAfter();
				} else {
					eval(ret);
				}
			}
		} else {
			alert("ERROR:\r\n" + ajax._Http.statusText);
		}
		ajax = null;
		EWA.CurUI.IsPostChange = false;
		EWA["SHOW_ERROR"] = true;// 默认提示错误
	};

	this.LoadChildrenStatus = function(xmlString) {
		var xml = new EWA.C.Xml();
		xml.LoadXml(xmlString);
		var nl = xml.GetElements("FrameData/Row");
		if (nl == null) {
			return;
		}

		var nodes = new Array();
		var o1 = {};
		for (var i = 0; i < nl.length; i = 1 + i) {
			var treeNode = this._CreateNodeFromXml(nl[i], xml);
			if (treeNode.Key == "") {
				continue;
			}
			if ($[treeNode.ParentKey]) {
				continue;
			}
			nodes.push(treeNode);
			o1[treeNode.Key] = treeNode;
		}
		if (nodes.length == 0) {
			return;
		}
		var n0 = this.GetNodeById(nodes[0].ParentKey);
		if (n0 == null)
			return;

		o1[n0.Key] = n0;
		for (var i = 0; i < nodes.length; i += 1) {
			var p = o1[nodes[i].ParentKey];
			p.AddChild(nodes[i]);
		}

		n0.GetObject().setAttribute("EWA_TREE_MORE", "0");
		n0.IsMoreChildren = false;
		for (var i = 0; i < n0.Children.length; i += 1) {
			this.Create(n0.Children[i]);
		}
		n0.NodeShow(true);
		this.ShowNode(this.PostChangeKey);
	};

	/**
	 * 加载节点
	 * 
	 * @param {String}
	 *            xmlString
	 */
	this.LoadChildrenAfter = function(xmlString) {
		var xml = new EWA.C.Xml();
		xml.LoadXml(xmlString);
		var nl = xml.GetElements("FrameData/Row");
		if (nl == null || nl.length == 0) {
			return;
		}
		var firstNode = this.GetNodeById(this.PostChangeKey);

		var oNodes = new Object();
		oNodes[firstNode.Key] = firstNode;
		var parentNodes = new Array();
		var parentNodesTable = {};
		for (var i = 0; i < nl.length; i = 1 + i) {
			var treeNode = this._CreateNodeFromXml(nl[i], xml);
			if (treeNode.Key == "EWA_TREE_ROOT") {
				continue;
			}
			if (treeNode.ParentKey == null || treeNode.ParentKey == "") {
				treeNode.ParentKey = firstNode.Key;
			}
			oNodes[treeNode.Key] = treeNode;
			var pkey = treeNode.ParentKey;
			if (oNodes[pkey] != null) {
				oNodes[pkey].AddChild(treeNode);
			}
		}
		if (firstNode.Children.length > 0) {
			for (var i = 0; i < firstNode.Children.length; i = 1 + i) {
				this.Create(firstNode.Children[i]);
			}
		}
		firstNode.NodeShow(true);
	};

	/**
	 * 从XML文件中生成节点
	 * 
	 * @param {Object}
	 *            node
	 * @param {Object}
	 *            xml
	 * @return {EWA_TreeNodeClass} treeNode
	 */
	this._CreateNodeFromXml = function(node, xml) {
		var treeNode = new EWA_TreeNodeClass();
		treeNode.ewa = this;
		treeNode.Key = xml.GetElementAttribute(node, "Key");
		treeNode.ParentKey = xml.GetElementAttribute(node, "ParentKey");
		treeNode.Text = xml.GetElementAttribute(node, "Text");
		treeNode.IsMoreChildren = xml.GetElementAttribute(node,
			"IsMoreChildren") == "1" ? true : false;
		treeNode.MenuGroup = xml.GetElementAttribute(node, "MenuGroup");
		for (var i = 0; i < 3; i += 1) {
			treeNode.AddParas[treeNode.AddParas.length] = xml
				.GetElementAttribute(node, "AddPara" + i);
		}
		return treeNode;
	};

	/**
	 * 修改节点名称
	 * 
	 * @param obj
	 *            节点的对象
	 * @param actionCommand
	 *            节点调用的命令体
	 * @param nodeText
	 *            节点名称的测试表达式
	 * @param infoName
	 *            试不成功的提示信息
	 */
	this.Rename = function(obj, actionCommand, nodeRegex, infoName) {
		if (obj == null) {
			obj = this._LastFocus;
		}
		if (obj == null) {
			return;
		}
		this._RenameActionCmd = actionCommand;
		this._RenameRegex = nodeRegex;
		this._RenameInfo = infoName;
		this._RenameNode = obj.tagName == 'TREE_NODE' ? obj : this.GetNode(obj);
		if (this._RenameNode.Key == 'EWA_TREE_ROOT') {
			this._RenameNode = null;
			return;
		}
		var tb = this._RenameNode.GetObject();
		var oNode = tb.rows[0].cells[tb.rows[0].cells.length - 1].childNodes[0];
		var oldVal = GetInnerText(oNode);
		oNode.style.display = "none";
		var oInput = this._GetInput();
		oNode.parentNode.appendChild(oInput);
		oInput.value = oldVal;
		oInput.setAttribute("EWA_OLD_VAL", oldVal);
		oInput.style.width = "300px";
		oInput.focus();
	};

	/**
	 * 获取输入框
	 */
	this._GetInput = function() {
		var ipts = this.ParentObject.getElementsByTagName('INPUT');
		for (var i = ipts.length - 1; i >= 0; i--) {
			var ipt = ipts[i];
			if (ipt.getAttribute('onblur') && ipt.getAttribute('onblur').indexOf('RenameBlur(') > 0) {
				this._InputDiv = ipt.parentNode;
				// console.log(ipt)
				return ipt;
			}
		}
	};

	/**
	 * 修改节点名称离开输入框焦点后事件
	 * 
	 * @param obj
	 *            输入框
	 */
	this.RenameBlur = function(obj) {
		let t0 = this._RenameBlurT0 || 0;
		let t1 = (new Date()).getTime();
		if (t1 - t0 < 100) {
			// 阻止多重调用
			return;
		}
		this._RenameBlurT0 = t1;

		var oldVal = obj.getAttribute("EWA_OLD_VAL");
		var node = this._RenameNode;
		var pNode = this.GetNode(node.GetObject().parentNode);
		for (var i = 0; i < pNode.Children.length; i += 1) {
			var c1 = pNode.Children[i];
			if (c1.Key != node.Key && c1.Text.trim() == obj.value.trim()) {
				alert(_EWA_EVENT_MSG["OnTreeNodeNameRepeat"]);
				obj.focus();
				return;
			}
		}
		//
		var oNode = obj.parentNode.childNodes[0];
		this._InputDiv.appendChild(obj);
		oNode.style.display = "";
		if (node.RenameType != "NEW" && (oldVal == obj.value)) {
			return;// 名称没有变化
		}

		oNode.innerHTML = obj.value;
		var cmd = this._RenameActionCmd;
		if (cmd == null) {
			var cmd = new EWA.F.Cmd();
		}
		if (cmd.EWA_ACTION == null || cmd.EWA_ACTION.trim() == "") {
			if (node.RenameType == "NEW") {// new item
				cmd.EWA_ACTION = "OnTreeNodeNew"; // 默认的Action
			} else {
				cmd.EWA_ACTION = "OnTreeNodeRename"; // 默认的Action
			}
		}
		if (node.RenameType == "NEW") {// new item
			if (cmd.EWA_AFTER_EVENT == "") {
				// 执行完后在页面执行的脚本, 修改Id,addpara,menu_group等
				cmd.EWA_AFTER_EVENT = 'EWA.F.FOS["' + this._Id
					+ '"].NewNodeAfter;';
			}
			var nodeParent = this.GetNode(node.GetObject().parentNode);
			cmd.EWA_TREE_PARENT_KEY = nodeParent.Key;
		}
		cmd.EWA_TREE_TEXT = obj.value;
		cmd.EWA_TREE_KEY = node.Key;
		this._PostChange(cmd);
		this._RenameActionCmd = null;
	};

	/**
	 * 重命名键判断
	 * 
	 * @param {Object}
	 *            evt
	 * @param {Object}
	 *            obj
	 */
	this.RenameKeyDown = function(evt, obj) {
		var code = evt.keyCode ? evt.keyCode : evt.which;
		if (code == 13) {// enter
			this.RenameBlur(obj);
		}
		if (code == 27) {// esc
			var oldVal = obj.getAttribute("EWA_OLD_VAL");
			obj.value = oldVal;
			this.RenameBlur(obj);
		}
	};

	/**
	 * 删除节点
	 * 
	 * @param isDeep
	 *            是否鉴别是否存在子节点
	 * @param actionCommand
	 *            删除调用的actionCommand
	 */
	this.Delete = function(isDeep, actionCommand) {
		var node = this.GetNode(this._LastFocus);
		if (node == null || node.Key == 'EWA_TREE_ROOT') {
			return;
		}
		if (!window.confirm(_EWA_EVENT_MSG["OnTreeNodeDelete"])) {
			return;
		}
		if (!isDeep && (node.Children.length > 0 || node.IsMoreChildren)) {
			node.NodeShow(true);
			alert(_EWA_EVENT_MSG["OnTreeNodeDeleteHaveChildren"]);
			return;
		}
		var cmd = actionCommand;
		if (cmd == null) {
			cmd = new EWA.F.Cmd();
			cmd.EWA_ACTION = "OnTreeNodeDelete";
		}
		if (cmd.EWA_AFTER_EVENT == "") {
			cmd.EWA_AFTER_EVENT = 'EWA.F.FOS["' + this._Id
				+ '"].DeleteAfter();';
		}
		cmd.EWA_TREE_KEY = node.Key;
		this._PostChange(cmd);
	};
	// 删除指定ID的节点，无论是否有子节点，不提交后台
	this.DeleteNoConfirmById = function(id, evt) {
		if(evt){
			evt.cancelBubble = true;
			evt.stopPropagation();
		}
		var node = this.GetNodeById(id);
		if (node == null || node.Key == 'EWA_TREE_ROOT') {
			return;
		}
		this._LastFocus = node.GetObject();
		this.DeleteAfter();
	};
	this.DeleteAfter = function() {
		var node = this.GetNode(this._LastFocus);
		var tbNode = node.GetObject();
		var tbParent = tbNode.parentNode;
		tbParent.removeChild(tbNode);
		var nodeParent = this.GetNode(tbParent);
		if (nodeParent.Children.length == 0) {
			var nodeParentParent = this
				.GetNode(nodeParent.GetObject().parentNode);
			if (nodeParentParent.ChildLast.Key == nodeParent.Key) {
				nodeParent.NodeCrossEnd(true);
			} else {
				nodeParent.NodeCross(true);
			}
		} else {
			nodeParent.ChildLast.NodeCrossEnd();
		}
		this._LastFocus = null;
	};
	/**
	 * 新节点
	 * 
	 * @param nodeText
	 *            新节点的文字
	 * @param actionCommand
	 *            新节点调用的actionCommand
	 * @param nodeText
	 *            新节点名称的测试表达式
	 * @param infoName
	 *            测试不成功的提示信息
	 */
	this.NewNode = function(nodeText, actionCommand, nodeRegex, infoName) {
		if (this._LastFocus == null) {
			return;
		}
		this._NewNodeTemp = {
			TEXT: nodeText,
			CMD: actionCommand,
			REGEX: nodeRegex,
			INFO: infoName
		};

		var nodeParent = this.GetNode(this._LastFocus);
		nodeParent.NodeShow(true);
		if (this.IsPostChange) { // 调用更多子节点
			this._NewNodeTimer = window.setInterval(function() {
				if (EWA.CurUI.IsPostChange) {
					return;
				}
				window.clearInterval(EWA.CurUI._NewNodeTimer);
				EWA.CurUI._NewNode();
			}, 100);
		} else {
			this._NewNode();
		}
	};

	this._NewNode = function() {
		var nodeText = this._NewNodeTemp.TEXT;
		var actionCommand = this._NewNodeTemp.CMD;
		var nodeRegex = this._NewNodeTemp.REGEX;
		var infoName = this._NewNodeTemp.INFO;
		this._NewNodeTemp = null;

		var node = new EWA_TreeNodeClass();
		node.ewa = this;
		this._CurNewNode += 1;
		node.Key = "NEW_NODE_" + this._Id + "__" + this._CurNewNode;
		node.RenameType = "NEW";
		var txt = _EWA_EVENT_MSG["OnTreeNodeNew"] + this._CurNewNode;
		if (nodeText != null && nodeText.trim().length > 0) {
			txt = nodeText.trim();
		}
		node.Text = txt;

		var nodeParent = this.GetNode(this._LastFocus);
		if (nodeParent.Children.length > 0) {
			var prevIndex = nodeParent.Children.length - 1;
			var nodePerv = nodeParent.Children[prevIndex];
			nodePerv.NodeCross();// 将最后一个节点修改为交叉线
		}
		nodeParent.AddChild(node);
		this.Create(node);
		nodeParent.NodeShow(true);
		this.Rename(node, actionCommand, nodeRegex, infoName);
	}

	/**
	 * 新节点调用后执行
	 * 
	 * @param newId
	 *            新节点的ID
	 * @param parameters
	 *            新节点调用的附加参数, 用“,”分割
	 * @param menuGroup
	 *            新节点菜单组
	 */
	this.NewNodeAfter = function(newId, parameters, menuGroup) {
		var id = "NEW_NODE_" + this._Id + "__" + this._CurNewNode;
		var node = this.GetNodeById(id);
		node.SetKey(newId);
		node.SetAddParameters(parameters == null ? "" : parameters);
		node.SetMenuGroup(menuGroup == null ? "" : menuGroup);
		var c = this.TestIcon(node);
		node.SetBookIcon(c);
	};
	/**
	 * 根据ID获取节点(Node)
	 * 
	 * @param id
	 *            节点的Key
	 */
	this.GetNodeById = function(id) {
		var obj = $('#EWA_TREE_' + this._Id + ' .ewa-tree-node[id="' + id + '"]');
		if (obj.length == 0) {
			return null;
		}
		return this.GetNode(obj[0]);
	};
	/**
	 * 获取焦点节点
	 */
	this.GetFocusNode = function() {
		return this.GetNode(this._LastFocus);
	}
	/**
	 * 根据对象获取节点(Node)
	 * 
	 * @param obj
	 *            节点下的任意DOM对象
	 */
	this.GetNode = function(obj) {
		if (obj == null || obj.tagName == null) {
			return null;
		}
		var o1 = obj;
		var inc = 0;
		// EWA_T 表示是节点的表标记
		while (!(o1.tagName == "TABLE" && (o1.getAttribute("EWA_T") == "1") || o1.id == "EWA_TREE_ROOT")) {
			o1 = o1.parentNode;
			inc++;
			if (inc > 33) {
				return null;
			}
			if (o1.tagName == "BODY") {
				return null;
			}
		}
		var node = new EWA_TreeNodeClass();
		node.ewa = this;

		node.Key = o1.id;
		node.MenuGroup = o1.getAttribute("EWA_MG");
		node.Object = o1;
		var oNodeTd = o1.rows[0].cells[2];
		node.Text = GetInnerText(oNodeTd);
		for (var i = 0; i < 3; i += 1) {// 附加参数
			node.AddParas[i] = oNodeTd.childNodes[0].getAttribute("EWA_P" + i);
		}
		var moreChild = o1.getAttribute("EWA_TREE_MORE");
		node.IsMoreChildren = moreChild == "1" ? true : false;
		if (o1.rows.length > 1) {
			var td = o1.rows[1].cells[o1.rows[1].cells.length - 1];
			for (var i = 0; i < td.childNodes.length; i = 1 + i) {
				var chd = td.childNodes[i];
				if (chd.nodeType == 3) {
					continue;
				}
				if (chd.tagName == 'TABLE' && chd.getAttribute("EWA_T") == "1") {
					node.Children.push(this.GetNode(chd));
				}
			}
			if (node.Children.length > 0) {
				node.ChildLast = node.Children[node.Children.length - 1];
			}
		}

		return node;
	};

	//
	this.Click = function(evt, notRunCmd) {
		if (this.IsPostChange) {
			return;
		}
		EWA.CurUI = this;
		var obj = evt.srcElement ? evt.srcElement : evt.target;
		if (obj.tagName == "INPUT") {
			return;
		}
		if (obj.tagName == 'DIV') {
			obj = obj.parentNode;
		}
		if (obj.tagName == "TD" && obj.className.indexOf("TD00") == 0) {
			var node = this.GetNode(obj);
			node.NodeShow();
			return;
		}
		while (!(obj.tagName == "SPAN" && (obj.getAttribute("EWA_CMD") != null) || obj
			.getAttribute('EWA_TREE_TOP') == '1')) {
			obj = obj.parentNode;
			if (obj.tagName == "BODY") {
				return;
			}
		}
		var node = this.GetNode(obj);
		if (obj.tagName == "SPAN"
			&& (obj.getAttribute("EWA_CMD") != null || obj
				.getAttribute('EWA_TREE_TOP') == '1')) {
			if (this._LastFocus != null) {
				var lastNode = this.GetNode(this._LastFocus);
				lastNode.Mark(false);
				this._LastFocus = null;
			}
			if (obj.getAttribute('EWA_TREE_TOP') != '1') {
				node.Mark(true);
			}
			this._LastFocus = obj;
			if (!notRunCmd) {// 非右键
				if (this.Url.toUpperCase().indexOf('EWA_TREE_SKIP_GET_STATUS') < 0) {
					EWA.F.ST.SaveStatus(node.Key, 'TREE');
				}
				this._RunCmd(node);// 执行cmd
			} else {
				return obj;
			}
			this.MoveNode(node.GetObject());
		}
		node = null;
	};
	this._RunCmd = function(node) {
		var nodeParent = this.GetNode(node.GetObject().parentNode);
		if (this.link) {
			// 本身定义了连接方式，新增加 20190226 郭磊
			// 建议采用新的方式
			this.link(node.Key, node);
		} else {
			// 传统的调用方式
			console
				.warn('建议采用定义 EWA.F.FOS["xx"].link = function(nodeKey, node){}');
			var cmd = "link(\""
				+ node.Key
				+ "\",\""
				+ nodeParent.Key
				+ "\",\""
				+ node.Text.replace(/\n/mig, '\\n').replace(/\r/mig, '\\r')
					.replace(/\"/mig, '&quot;') + "\"";
			for (var i = 0; i < node.AddParas.length; i += 1) {
				if (node.AddParas[i] == null) {
					cmd += ",null";
				} else {
					cmd += ",\"" + node.AddParas[i] + "\"";
				}
			}
			cmd += ");";
			EWA.C.Utils.RunCmd(cmd);// 执行cmd
		}
	}
	this.ShowMenu = function(evt) {
		EWA.CurUI = this;
		var obj = this.Click(evt, true);
		if (this.Menu != null && obj != null) {
			var node = this.GetNode(obj);
			this.Menu.ShowByMouse(evt, node.MenuGroup);
		}
	};
	/**
	 * 测试图标
	 * 
	 * @param {EWA_TreeNodeClass}
	 *            node
	 * @return {String}
	 */
	this.TestIcon = function(node) {
		if (this.Icons == null) {
			return "TD01A";
		}
		for (var a in this.Icons) {
			var b = this.Icons[a];
			var val = null;
			switch (b.TEST.toUpperCase()) {
				case 'KEY':
					val = node.Key;
					break;
				case 'PARENTKEY':
					val = node.Parent.Key;
					break;
				case 'TEXT':
					val = node.Text;
					break;
				case 'P0':
					val = node.AddParas[0];
					break;
				case 'P1':
					val = node.AddParas[1];
					break;
				case 'P2':
					val = node.AddParas[2];
					break;
				case 'MG':
					val = node.MenuGroup;
					break;
			}
			if (val == null) {
				continue;
			}
			var c = eval('/' + b.FILTER + '/ig');
			if (c.test(val)) {
				return b.NAME + "A";
			}
		}
		return "TD01A";

	}
	/**
	 * 
	 * @param {EWA_TreeNodeClass}
	 *            node
	 */
	this.Create = function(node, callback) {
		if (node == null) {
			return;
		}
		if (node.Parent == null) {
			this._CreateFirst(node);
			return;
		}
		var html = this._HtmlTemplate
			.replace("[ID]", "id=\"" + node.Key + "\"");

		// 附加的字段 2019-03-26
		var addColsHtml = this.AddCols || "";
		html = html.replace("[TEMP_NODE_ADD_FIELDS]", addColsHtml);

		var paras = "";
		for (var i = 0; i < node.AddParas.length; i += 1) {
			if (node.AddParas[i]) {
				let v = node.AddParas[i] + ""; //避免数字造成替换出错
				paras += "EWA_P" + i + "=\"" + v.replace(/"/ig, "&quot;").replace(/</ig, "&lt;").replace(/</ig, "&gt;") + "\" ";
			}
		}
		html = html.replace("[TMP_ADD_PARAS]", paras);
		html = html.replace("[EWA_MENU_GROUP]", node.MenuGroup);
		var icon = this.TestIcon(node);
		html = html.replace("[B]", icon);
		html = html.replace("[C]", node.Text);
		if (node.IsMoreChildren) {
			html = html.replace("[EWA_MORE_CHILDREN]", "EWA_TREE_MORE='1'");
		} else {
			html = html.replace("[EWA_MORE_CHILDREN]", "");
		}
		if (node.Children.length > 0 || node.IsMoreChildren) {
			html = html.replace("[A]", "TD00A");
			if (node != node.Parent.ChildLast) {
				html = html.replace("[A1]", "TD10B");
			} else {
				html = html.replace("[A1]", "TD10A");
			}
		} else {
			if (node == node.Parent.ChildLast) {
				html = html.replace("[A]", "TD00D");
			} else {
				html = html.replace("[A]", "TD00C");
			}
		}
		var objParent = node.Parent.GetObject();
		if (objParent.rows.length == 1) {
			var tr = objParent.insertRow(-1);
			tr.insertCell(-1);
			tr.insertCell(-1);
			tr.cells[1].colSpan = 2;
		}
		// 节点所在的级别
		var parentLvl = this.GetNodeLvl(node.Parent);
		html = html.replace("[LVL]", parentLvl + 1);

		this._TempNode.innerHTML = html;
		// 新创建的对象
		var newNodeTable = this._TempNode.childNodes[0];
		objParent.rows[1].cells[objParent.rows[1].cells.length - 1]
			.appendChild(newNodeTable);
		if (objParent.parentNode.childNodes[objParent.parentNode.childNodes.length - 1] != objParent) {
			objParent.rows[1].cells[0].className = "TD10B";
		}

		node.Parent.NodeShow(true);
		if (callback) {
			callback(newNodeTable, this);
		}
		for (var i = 0; i < node.Children.length; i += 1) {
			this.Create(node.Children[i], callback);
		}
	};
	/**
	 * 获取此node所在的级别
	 */
	this.GetNodeLvl = function(node) {
		var n = node;
		if (node.Object.getAttribute('tree_lvl')) {
			// 增加了 tree_lvl属性在 tree node上，避免添加多个子项目是重复执行造成严重的延时
			return node.Object.getAttribute('tree_lvl') * 1;
		}
		for (var i = 0; i < 100; i++) {
			var p = this.GetParentNode(n);
			if (p == null) {
				node.Object.setAttribute('tree_lvl', i + 1);
				return i + 1;
			} else {
				n = p;
			}
		}
	};
	this._CreateFirst = function(nodeFirst, callback) {
		var html = this._HtmlTemplate1.replace("[ID]", "id='" + nodeFirst.Key
			+ "'");
		html = html.replace("[B]", nodeFirst.Text);
		this.ParentObject.innerHTML = html;
		for (var i = 0; i < nodeFirst.Children.length; i += 1) {
			this.Create(nodeFirst.Children[i], callback);
		}
	};
	this.Init = function(xmlString) {
		var xml = new EWA.C.Xml();
		xml.LoadXml(xmlString);
		this.Resources = new EWA_FrameResoures();
		this.Resources.Init(xml);
		// 如果EWA_TREE_INIT_KEY存在则表示已经设定初始化值，不用调用上次状态
		if (this.Url.toUpperCase().indexOf('EWA_TREE_INIT_KEY') == -1) {
			if (this.Url.toUpperCase().indexOf('EWA_TREE_SKIP_GET_STATUS') > 0) {
				return;
			}
			// 获取上次点击的节点
			EWA.F.ST.GetStatus('TREE', this);
		}
	};
	this.LoadStatus = function() {
		EWA["SHOW_ERROR"] = false; // 不提示执行错误，避免误报
		this.ShowNode(_EWA_STATUS_VALUE);
	};
	/**
	 * 初始化显示节点
	 * 
	 * @param {String}
	 *            id
	 */
	this.ShowNode = function(id) {
		if (id == null || id == '' || id == 'EWA_TREE_ROOT') {
			return;
		}
		var node = this.GetNodeById(id);
		if (node == null) {
			var cmd = new EWA.F.Cmd();
			cmd.EWA_ACTION = "OnTreeNodeStatus";
			cmd.EWA_TREE_KEY = this.Key;
			cmd.EWA_AJAX = "XML";
			cmd.EWA_TREE_KEY = id;
			cmd.EWA_TREE_STATUS = "1";
			this._PostChange(cmd);
			return;
		} else {
			this._StatusNode = node;
			this.ShowNodeA();
		}
	}
	this.ShowNodeA = function() {
		var node = this._StatusNode;
		this._StatusNode = null;

		var p = node.GetObject().parentNode;
		var np = this.GetNode(p);
		while (np.Key != 'EWA_TREE_ROOT') {
			np.NodeShow(true);
			np = this.GetNode(np.GetObject().parentNode);
		}
		node.Mark(true);
		this._LastFocus = node.GetObject();
		this._RunCmd(node);
		window.setTimeout(function() {
			p.focus();
		}, 0);
	};

	this.getUrlClass = function() {
		var u = new EWA_UrlClass();
		u.SetUrl(this.Url);
		return u;
	};
	this.Reload = function() {
		// for EWA_Behavior.RELOAD_PARENT
	};
	// mv = new EWA.UI.Move();
	// mv.Init(mv);
	// mv.AddMoveObject(this._MoveNode);
}

/**
 * 初始化的Tree默认点击事件，仅显示信息，通过重写覆盖改方法
 * 
 * @param key
 *            主键
 * @param parentKey
 *            父键
 * @param text
 *            显示文本
 * @param addPara1
 *            附加参数一
 * @param addPara2
 *            附加参数二
 * @param addPara3
 *            附加参数三
 */
function EWA_Treelink(key, parentKey, text, addPara1, addPara2, addPara3) {
	var s1 = "key=" + key + "\r\nparentKey=" + parentKey + "\r\ntext=" + text
		+ "\r\naddPara1=" + addPara1 + "\r\naddPara2=" + addPara2
		+ "\r\naddPara3=" + addPara3;
	s1 += "\r\n\r\n您需要覆盖这个方法\r\nlink(key, parentKey, text, addPara1, addPara2, addPara3)";
	alert(s1);
}

if (typeof link == 'undefined') {
	link = EWA_Treelink;
}

/* Tree */
EWA.F.T = {
	CUR: null,
	C: EWA_TreeClass,
	Node: EWA_TreeNodeClass
};
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

	this.loadFiles = function(url, fileName, filePath, funcRemove, funcShowFile) {
		let that = this;
		$J(url, function(rst) {
			for (let n in rst) {
				let d = rst[n];
				that.loadFile(d, fileName, filePath, funcRemove, funcShowFile);
			}
		})
	};
	// 加载文件
	this.loadFile = function(d, fileName, filePath, funcRemove, funcShowFile) {
		let img;

		img = d[filePath];
		let tb = this.showPreviewUrl(img);

		if (funcRemove) {
			let s = $("<a class='ewa_app_upload_remove'></a>").attr(d);
			s.on("click", function() {
				funcRemove(this);
			});
			$(tb).css("position", "relative").append(s);
		}

		if (funcShowFile) {
			$(tb).find("img").css("cursor", "pointer").attr(d).on("click", function() {
				funcShowFile(this);
			});
		}
		$(tb).find(".name div").attr("title", d[fileName]).text(d[fileName]);
	};
	this.remove = function(obj){ //obj 时删除A
		$(obj).parent().remove();
	};
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
		if (!this.UpLimit) {
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
			Event: function() {
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

}function EWA_Html5TakePhotoClass() {
	this._wait_end = true;
	this.UPLOAD_STATUS = 'NO';
	this.H5_UPLOAD = new EWA_Html5UploadClass(); // h5上传对象
	this.res = {
		zhcn : {
			TAKE_PHOTO : "点击获取照片",
			RE_TAKE : "重新获取"

		},
		enus : {
			TAKE_PHOTO : "Take photo",
			RE_TAKE : "Re take"
		}
	}
	this.getRes = function() {
		return EWA.LANG == 'enus' ? this.res.enus : this.res.zhcn;
	};
	// 获取值
	this.getValue = function() {
		if (!this.responseText) {
			return "";
		}
		return this.responseText;
	}
	this.init = function(objName) {
		this.objName = objName;
		var main_id = "#h5TakePhoto_" + objName;
		var canvas_id = "h5TakePhotoCan_" + objName;
		var video_id = "h5TakePhotoVod_" + objName;

		var canvas = $X(canvas_id);
		canvas.height = $(main_id).height();
		canvas.width = $(main_id).width();

		this.context = canvas.getContext("2d");
		// video 元素，将用于接收并播放摄像头 的数据流
		this.video = $X(video_id);
		$(this.video).show();

		var videoObj = {
			"video" : true
		};

		// Put video listeners into place
		// 针对标准的浏览器
		var c = this;
		if (navigator.getUserMedia) { // Standard
			navigator.getUserMedia(videoObj, function(stream) {
				c.video.src = stream;
				c.video.play();
			}, c.errBack);
		} else if (navigator.webkitGetUserMedia) { // WebKit-prefixed
			navigator.webkitGetUserMedia(videoObj, function(stream) {
				c.video.src = (window.URL || window.webkitURL).createObjectURL(stream);
				c.video.play();
			}, c.errBack);
		}   else if (navigator.mozGetUserMedia) {
			navigator.mozGetUserMedia(videoObj, function(stream) {
				c.video.src = window.URL.createObjectURL(stream);
				c.video.play();
			}, c.errBack);
		}

		$(main_id).find('button').html(this.getRes().TAKE_PHOTO);
	};
	// 一个出错的回调函数，在控制台打印出错信息
	this.errBack = function(error) {
		EWA.UI.Msg.ShowError('浏览器不支持在线拍摄<br>' + error.message, '浏览器不支持在线拍摄');
		console.log(error);
	};

	// 对拍照按钮的事件监听
	this.takePhoto = function(fromButton) {
		// 画到画布上
		if (!this._wait_end) {
			$Tip("运行中...");
			return;
		}
		var video_id = "#h5TakePhotoVod_" + this.objName;

		var pWidth = $(video_id).width();
		var pHeight = $(video_id).height();
		this.context.drawImage(this.video, 0, 0, pWidth, pHeight);
		this.createPic();
		this.setPhotoStatus("img");

		if (fromButton) {
			var c = this;

			fromButton.innerHTML = this.getRes().RE_TAKE;
			fromButton.onclick = function() {
				c.showVideo(this);
			};
			$(fromButton).show();
			$(fromButton).parent().show();
		}
	};
	this.showVideo = function(fromButton) {
		if (!this._wait_end) {
			$Tip("运行中...");
			return;
		}
		this.setPhotoStatus("video");
		if (fromButton) {
			var c = this;

			fromButton.innerHTML = this.getRes().TAKE_PHOTO;
			fromButton.onclick = function() {
				c.takePhoto(this);
			}
			$(fromButton).show();
			$(fromButton).parent().show();
		}
	};
	this.setPhotoStatus = function(sta) {
		var main_id = "#h5TakePhoto_" + this.objName;
		var canvas_id = "#h5TakePhotoCan_" + this.objName;
		var video_id = "#h5TakePhotoVod_" + this.objName;
		var img_id = "#h5TakePhotoImg_" + this.objName;
		$(main_id).find("*").hide();
		if (sta == "img") {
			this._photo_status = "img";
			$(main_id).css({
				"border" : "1px solid green"
			});
			$(img_id).show();
		} else if (sta == "video") {
			this._photo_status = "video";
			$(main_id).css({
				"border" : "1px solid red"
			});
			$(video_id).show();
		} else if (sta == "canvas") {
			this._photo_status = "canvas";
			$(main_id).css({
				"border" : "1px solid blue"
			});
			$(canvas_id).show();

		}
	};
	this.createPic = function() {
		var canvas_id = "h5TakePhotoCan_" + this.objName;
		var img_id = "#h5TakePhotoImg_" + this.objName;

		var imgData = $X(canvas_id).toDataURL('image/jpeg', 0.7);
		$(img_id).attr('src', imgData);
		this.setPhotoStatus('img');
		return $(img_id)[0];
	};

	/**
	 * 每个 input 执行一次上传
	 */
	this.submitUpload = function() {
		var img_id = "#h5TakePhotoImg_" + this.objName;
		var fd = this.H5_UPLOAD.createFormData();
		var fromImg = $(img_id)[0];

		var blob = EWA_ImageCalss.resizeAsBlob(fromImg, fromImg.width, fromImg.height);
		fd.append(this.objName, blob, this.objName + ".jpg");

		var main_id = "#h5TakePhoto_" + this.objName;

		var c = this;
		var img_target = $(main_id).find('.ewa-h5-take-photo-process');
		img_target.show();
		img_target.find('span').show().html("0%");
		var img_target1 = $(main_id).find('.ewa-h5-take-photo-process1');
		img_target1.css('width', 0).show();

		var xhr = new XMLHttpRequest();
		var c = this;
		xhr.upload.addEventListener("progress", function(evt) {
			if (evt.lengthComputable) {
				var percentComplete = Math.round(evt.loaded * 100 / evt.total - 10);
				if (percentComplete < 0) {
					percentComplete = 0;
				}
				img_target.find('span').html(percentComplete.toString() + '%');
				img_target1.css('width', percentComplete.toString() + '%');
			} else {
				img_target.html('unable to compute');
			}
		}, false);
		xhr.addEventListener("load", function(evt) {
			img_target.find('span').html('100%');
			img_target1.css('width', '100%');

			/* 服务器端返回响应时候触发event事件 */
			$('#EWA_FRAME_' + c.H5_UPLOAD.SYS_FRAME_UNID + ' #' + c.objName).val(evt.target.responseText);
			c.responseText = evt.target.responseText;
			c.UPLOAD_STATUS = 'ok';

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
		}, false);

		var action = EWA.CP + "/EWA_STYLE/cgi-bin/_up_/?xmlname=" + this.H5_UPLOAD.POST_XMLNAME + "&ITEMNAME="
			+ this.H5_UPLOAD.POST_ITEMNAME + "&NAME=" + this.H5_UPLOAD.POST_NAME + "&EWA_UP_TYPE=SWFUPLOAD&EWA_UP_REF="
			+ this.H5_UPLOAD.POST_REF;

		$(main_id).find('button').hide();

		xhr.open('POST', action, true);
		xhr.send(fd);
		this.xhr = xhr;
	};

}/**
 * 根据ListFrame定义,绘制Box对象
 */
function EWA_UI_BoxClass() {
	this._ClassName = ("_eWAbOX" + Math.random()).replace(".", "$");
	window[this._ClassName] = this;

	this._REF_DATA = null;
	this._JSON_URL = null;
	this._Cfg = null;

	/**
	 * 加载Json数据
	 * 
	 * @param cfg
	 *            配置信息
	 */
	this.Create = function(cfg) {
		this._Cfg = cfg;
		// 查找本类的对应的 FOS(listframe)
		if (EWA.F && EWA.F.FOS) {
			for ( var n in EWA.F.FOS) {
				var fos = EWA.F.FOS[n];
				if (fos.BOX_CLASS == this) {
					this.FOS = fos;
				}
			}
		}
		if (this.FOS) {
			var u1 = new EWA_UrlClass(this.FOS.Url);
			if (u1.GetParameter("EWA_BOX_PARENT_ID")) { // 根据参数设定新的parent_id
				var new_pid = u1.GetParameter("EWA_BOX_PARENT_ID");
				if ($X(new_pid)) {
					this._Cfg.parent_id = new_pid;
				}
			}
		}
		if (!this._Cfg.parent_id) {
			alert('parent_id未定义');
			return;
		}
		var pids = this._Cfg.parent_id.split(',');
		for (var i = 0; i < pids.length; i++) {
			var pid = pids[i].trim();
			if ($X(pid)) {
				$($X(pid)).html("waiting...");
				this._Cfg.parent_id_init = this._Cfg.parent_id;
				this._Cfg.parent_id = pid;
				break;
			}
		}
		if (!this._Cfg.parent_id_init) {
			alert('parent_id[' + this._Cfg.parent_id + ']找不到定义的对象');
			return;
		}

		this.initBoxSize();
		// this.add_box_style();
		var u2 = new EWA_UrlClass();
		u2.SetUrl(this.FOS.Url);

		var pagesize = u2.GetParameter("EWA_PAGESIZE");
		var pagecur = u2.GetParameter("EWA_PAGECUR");

		if (pagesize && !isNaN(pagesize)) {
			this._Cfg.EWA_PAGESIZE = pagesize;
		} else {
			this._Cfg.EWA_PAGESIZE = this._Cfg.EWA_PAGESIZE || 10;
		}
		if (pagecur && !isNaN(pagecur)) {
			this._Cfg.EWA_PAGECUR = pagecur;
		} else {
			this._Cfg.EWA_PAGECUR = this._Cfg.EWA_PAGECUR || 1;
		}

		var ref_data = {};
		for ( var n in u2._Paras) {
			ref_data["@" + n.toUpperCase()] = u2._Paras[n];
		}
		this._REF_DATA = ref_data;

		this.load_box_data();
	};
	/**
	 * 修正宽度
	 */
	this.initBoxSize = function() {
		if (!this._Cfg.page_width) {
			return;
		}
		var newWidth;
		if (isNaN(this._Cfg.page_width)) {// 参数如果不是纯数字,例如200px,130pt,20mm...
			var id = this._ClassName + "_check_size";
			var obj = "<div id='" + id + "' style='height:1px;width:" + this._Cfg.page_width + "'></div>";
			$('body').append(obj);
			var obj1 = $($X(id));
			newWidth = obj1.width();
			obj1.remove();
		} else {
			newWidth = this._Cfg.page_width * 1;
		}
		if (newWidth <= 50) {
			return;
		}
		var fix = {};
		fix.width = newWidth;
		// title margin 5, icon width 20,margin-right5
		var box_title = newWidth - 5 * 2 - 20 - 5;
		fix.box_title = box_title;
		// left img width,img margin-left
		fix.box_title_img = box_title - 30 - 5;
		// box_txt margin 5
		var box_txt = newWidth - 5 * 2;
		fix.box_txt = box_txt;
		// box_des padding
		var box_des1 = box_txt - 1 * 2 - 58;
		// 明细右侧
		fix.box_des1 = box_des1;

		this._Cfg._Fix = fix;
	}
	/**
	 * 创建URL并提交
	 */
	this.load_box_data = function() {
		var u;
		if (this.FOS == null) {
			var ss = [ EWA.CP + '/EWA_STYLE/cgi-bin/?EWA_AJAX=JSON_EXT1&ewa_frameset_no=1' ];

			for ( var n in this._Cfg) {
				var n1 = n.toUpperCase();
				if (n1 == 'XMLNAME' || n1 == 'ITEMNAME' || n1.indexOf('EWA_') == 0) {
					var v1 = this._Cfg[n];
					if (v1) {
						ss.push(n1 + "=" + v1);
					}
				}
			}
			ss.push($U());
			u = ss.join('&');
			this._JSON_URL = u;
		} else {
			var u1 = new EWA_UrlClass();
			u1.SetUrl(this.FOS.Url);
			u1.AddParameter("EWA_AJAX", "JSON_EXT1");
			u1.AddParameter("ewa_frameset_no", "1");
			for ( var n in this._Cfg) {
				var n1 = n.toUpperCase();
				if (n1.indexOf('EWA_') == 0) {
					var v1 = this._Cfg[n];
					if (v1) {
						u1.AddParameter(n1, v1);
					}
				}
			}
			this._JSON_URL = u = u1.GetUrl();
		}
		// console.log(u);
		$J(u, this.load_box_data1, this);
	};
	/**
	 * 处理返回的json数据
	 * 
	 * @param v
	 *            json
	 * @param args
	 *            其它参数
	 */
	this.load_box_data1 = function(v, args) {
		var refData = this._REF_DATA;
		var u = this._JSON_URL;
		var fromClass = args[args.length - 1];

		var tmp = fromClass._Cfg;
		var pid = fromClass._Cfg.parent_id;

		// EWA.F.FOS[v.FRAME_UNID] = {
		// Reload : function() {
		// fromClass.Create(fromClass._Cfg);
		// }
		// };
		if (!EWA.F.FOS[v.FRAME_UNID]) {// 如果没有Jsframe则加载,否则抛弃
			EWA_Utils.JsRegister(v.JSFRAME);
			EWA_Utils.JsRegister(v.JS);
		}
		// 替换重新加载事件
		EWA.F.FOS[v.FRAME_UNID].Reload = function() {
			fromClass.Create(fromClass._Cfg);
		};
		// 替换跳转事件
		EWA.F.FOS[v.FRAME_UNID].Goto = function(idx) {
			var u2 = new EWA_UrlClass();
			u2.SetUrl(fromClass._JSON_URL);
			u2.RemoveParameter("ewa_pagecur");
			u2.AddParameter("ewa_pagecur", idx);
			var json_url = u2.GetUrl();
			console.log(json_url);
			$J(json_url, fromClass.load_box_data1, fromClass._REF_DATA, json_url, fromClass);
			this._JSON_URL = json_url;
		};

		var newid = '___NeW_____' + tmp.parent_id;
		if (!$X(newid)) {
			// 首次加载生成,以后就不生成了
			tmp.new_parent_id = newid;
			fromClass.createToolbar(v);
		}

		// 显示页码
		fromClass.setPageInfo(v);

		// 生成box对象
		fromClass.enq_op_main_sub_boxs(v);

		// 跳转到焦点
		if (tmp.autofocus == true) {
			var pobj = $X(pid);
			var t = $(pobj).offset().top;
			$('body').animate({
				scrollTop : t - 30
			}, 300);
		}
		// 执行模板定义的CallBack事件
		if (tmp.callback) {
			try {
				if (typeof tmp.callback == 'function') {
					tmp.callback(fromClass);
				} else {
					eval(tmp.callback);
				}
			} catch (e) {
				console.log("EWA_UI_BoxClass->tmp.callback" + e);
				console.log(tmp.callback);
			}
		}
		// 执行关联的 FramClass 的 ReloadAfter事件
		if (EWA && EWA.F && EWA.F.FOS) {
			for ( var n in EWA.F.FOS) {
				var o = EWA.F.FOS[n];
				if (o.BOX_CLASS == fromClass && o.ReloadAfter) {
					try {
						o.ReloadAfter(fromClass);
					} catch (e) {
						console.log("EWA_UI_BoxClass->EWA->ReloadAfter" + e);
						console.log(o.ReloadAfter);
					}
				}
			}
		}
	};
	/**
	 * 创建工具条
	 */
	this.createToolbar = function(v) {
		var tmp = this._Cfg;
		var pobj = $($X(tmp.parent_id));

		var ss = [];
		ss.push('<div onselectstart="return false;" class="box-tool-bar">');
		var js = " onclick='" + this._ClassName + ".toolBarClick(this)' ";
		var buts = 'fa-table,fa-list aa,fa-sort aa,fa-search aa'.split(',');
		for (var i = 0; i < buts.length; i++) {
			ss.push("<i class='fa " + buts[i] + "' " + js + "></i>");
		}

		ss.push("&nbsp;&nbsp;")

		var navs = 'fa-fast-backward aa,fa-backward aa,fa-forward aa,fa-fast-forward aa'.split(',');
		for (var i = 0; i < navs.length; i++) {
			ss.push("<i class='fa " + navs[i] + "' " + js + "></i>");
			if (i == 1) {
				// 记录信息
				ss.push("<span class='aa' id='" + this._ClassName + "_records'></span>");
				ss.push("<select class='aa' id='" + this._ClassName + "_page' onchange='" + this._ClassName
					+ ".do_page(this)'><option value=5>5</option><option value=10>10</option>" + "<option value=20>20</option>"
					+ "<option value=50>50</option><option value=100>100</option>"
					+ "<option value=150>150</option><option value=200>200</option>"
					+ "<option value=300>300</option><option value=500>500</option></select>");
			}
		}
		var filters = this.create_filter(v);
		var filter = filters[0]; // fix检索
		var search = filters[1]; // 文字和日期检索

		ss.push("<div class='sort_items' id='" + this._ClassName + "_search'>");
		ss.push(filter.join(''));
		ss.push(search.join(''));
		ss.push("</div>");

		var sort = this.create_sort(v);
		ss.push("<div class='sort_items' id='" + this._ClassName + "_sort'>");
		ss.push(sort);
		ss.push("</div>");

		ss.push('</div><div id="' + tmp.new_parent_id + '"></div>');

		pobj.html(ss.join(''));

		$X(this._ClassName + "_page").value = this._Cfg.EWA_PAGESIZE;
	};
	this.setPageInfo = function(v) {
		var p0 = v.RECORDS * 1 / this._Cfg.EWA_PAGESIZE * 1;
		var p1 = Math.round(p0);
		if (p1 < p0) {
			p1++;
		}
		this._Cfg._TOTALPAGE = p1;
		var s = " [" + this._Cfg.EWA_PAGECUR + '/ <b >' + p1 + '</b> (' + v.RECORDS + ')] ';
		var o=$X(this._ClassName + "_records");
		if(o){
			o.innerHTML = s;
		}
	}
	this.create_sort = function(v) {
		var map1 = $J2MAP(v.CFG, 'NAME');
		var orders = [];
		for ( var n in EWA.F.FOS[v.FRAME_UNID].ItemList.Items) {
			var item = EWA.F.FOS[v.FRAME_UNID].ItemList.Items[n];
			if ($(item).find("OrderSearch Set").attr('IsOrder') == "1") {
				orders.push(n);
			}
		}
		var ss = [];
		ss.push('<p class="sort-item" onclick="' + this._ClassName + '.do_sort(null,this)">清除排序<b class="fa fa-times"></b></p>');
		for (var i = 0; i < orders.length; i++) {
			var exp = orders[i];
			if (!map1[exp]) {
				continue;
			}
			var v = map1[exp].DES;
			var s = '<div  class="sort-item" onclick="' + this._ClassName + '.do_sort(&quot;' + exp
				+ '&quot;,this)"><nobr><i class="fa fa-circle-o"></i>&nbsp;' + v + '&nbsp;<b class="fa"></b></nobr></div>';
			ss.push(s);
		}

		return ss.join('');
	};
	this.do_sort = function(v, obj) {
		var sorts = $('.sort_items')[1];
		$(sorts).find('.sort-item i').attr("class", "fa fa-circle-o");
		$(sorts).find('.sort-item b').attr("class", "fa");
		if (v) {
			var desc = $(obj).attr("desc");
			var c1 = "";
			if (desc == null || desc == "") {
				v += " DESC";
				$(obj).attr("desc", "desc");
				c1 = "fa fa-caret-down";
			} else {
				$(obj).attr("desc", "");
				c1 = "fa fa-caret-up";
			}
			$(obj).find('i').attr("class", "fa fa-dot-circle-o");
			$(obj).find('b').attr("class", c1);
		}
		this._Cfg.EWA_LF_ORDER = v;
		this._Cfg.EWA_PAGECUR = 1;
		this.load_box_data();
		sorts.style.display = 'none';
		sorts.setAttribute('show', '');
	};
	this.create_filter = function(v) {
		var json = EWA.F.FOS[v.FRAME_UNID]._SearchJson;
		var ss = [];
		var map1 = $J2MAP(v.CFG, 'NAME');
		var ss_text = [];
		for ( var n in json) {
			var f = json[n];
			try {
				if (f.T == 'fix') { // 选择
					ss.push("<select onchange='" + this._ClassName + ".do_filter(this)' search_type='" + f.T + "' search_tag='"
						+ n + "'>");
					ss.push("<option value=''>--" + map1[n].DES + "--</option>");
					for (var i = 0; i < f.D.length; i++) {
						var v = f.D[i];
						ss.push("<option value=\"" + v[0] + "\">" + v[1] + "</option>");
					}
					ss.push("</select>");
				} else if (f.T == 'text') {// 文字搜索
					ss_text.push("<div class='search_input'><input search_type='" + f.T + "' old='' onblur='" + this._ClassName
						+ ".checkTextChange(this)' search_tag='" + n + "' type=text placeholder=\"" + map1[n].DES + "\"/></div>");
				} else if (f.T == 'date') {// 文字搜索
					var rid = ("D" + Math.random()).replace(".", "A");

					ss_text.push("<div class='search_input'><input style='width:43%' id='" + rid
						+ "' onclick=\"EWA.UI.Calendar.Pop(this)\" search_tag='" + n + "' search_type='" + f.T
						+ "' old='' onblur='" + this._ClassName + ".checkTextChange(this)' type=text placeholder=\""
						+ map1[n].DES + "\"/> <input style='width:43%' id='" + rid + "_1' old='' onblur='" + this._ClassName
						+ ".checkTextChange(this)' onclick=\"EWA.UI.Calendar.Pop(this)\" type=text placeholder=\"" + map1[n].DES
						+ "\"/></div>");
				}
			} catch (e) {
				console.log(e);
				console.log(n);
				console.log(f);
			}
		}
		return [ ss, ss_text ];
	};
	this.toolBarClick = function(obj) {
		var cla = obj.className;

		if (cla.indexOf('fa-table') > 0) {
			if (this.last_but == obj) {
				return;
			}
			this.last_but = obj;
			$(obj).parent().find('.aa').show();
			this.load_box_data();
		} else if (cla.indexOf('fa-list') > 0) {// 列表
			if (this.last_but == obj) {
				return;
			}
			this.last_but = obj;
			$(obj).parent().find('.aa').hide();
			var u2 = new EWA_UrlClass();
			u2.SetUrl(this._JSON_URL);
			u2.RemoveParameter("ewa_ajax");
			u2.AddParameter("ewa_ajax", 'install');

			u2.RemoveParameter("ewa_box");
			// 避免fos对象重复
			u2.RemoveParameter("xmlname");
			u2.AddParameter("xmlname", '|' + this._Cfg.xmlname);
			var ajax = new EWA.C.Ajax();
			ajax.Install(u2.GetUrl(), "", this._Cfg.new_parent_id, function() {
			});
		} else if (cla.indexOf('fa-search') > 0) {
			var id = this._ClassName + '_search';
			var o = $($X(id));
			var p = $(obj).offset();
			var left = p.left;
			var top = p + $(obj).height + 20;
			o.css({
				top : top,
				left : left,
				'z-index' : 10000
			}).show();
		} else if (cla.indexOf('fa-sort') > 0) {
			var id = this._ClassName + '_sort';
			var o = $($X(id));
			var p = $(obj).offset();
			var left = p.left;
			var top = p + $(obj).height + 20;
			o.css({
				top : top,
				left : left,
				'z-index' : 10000
			}).show();
		} else if (cla.indexOf('fa-fast-forward') > 0) {
			this._Cfg.EWA_PAGECUR = this._Cfg._TOTALPAGE;
			this.load_box_data();
		} else if (cla.indexOf('fa-forward') > 0) {
			var p1 = this._Cfg.EWA_PAGECUR * 1 + 1;
			if (p1 > this._Cfg._TOTALPAGE) {
				$Tip('已经到页尾了');
				return;
			}
			this._Cfg.EWA_PAGECUR = p1;
			this.load_box_data();
		} else if (cla.indexOf('fa-backward') > 0) {
			var p1 = this._Cfg.EWA_PAGECUR * 1 - 1;
			if (p1 == 0) {
				$Tip('已经到页头了');
				return;
			}
			this._Cfg.EWA_PAGECUR = p1;
			this.load_box_data();
		} else if (cla.indexOf('fa-fast-backward') > 0) {
			this._Cfg.EWA_PAGECUR = 1;
			this.load_box_data();
		}
	};
	// 检查输入框内容是否变化
	this.checkTextChange = function(obj) {
		var old = obj.getAttribute('old');
		var v = obj.value.trim();
		if (old == v) {
			return;
		}
		obj.setAttribute('old', v);
		this.do_filter(obj.parentNode);
	};
	/**
	 * 分页
	 */
	this.do_page = function(obj) {
		var p = obj.value;
		this._Cfg.EWA_PAGESIZE = p;
		if (this.FOS) {
			this.FOS._PageSize = p;
		}
		this._Cfg.EWA_PAGECUR = 1;
		this.load_box_data();
	}
	this.do_filter = function(obj) {
		var sorts = $('.sort_items')[0];
		var selects = $(sorts).find('[search_tag]');
		var ss = {};
		for (var i = 0; i < selects.length; i++) {
			var f1 = selects[i];
			var search_type = f1.getAttribute("search_type");
			if (f1.value == '' && search_type != 'date') {
				continue;
			}
			if (search_type == 'date') {
				var id1 = f1.id + '_1';
				var date0 = f1.value;
				var date1 = $X(id1).value;

				if (date0 == '' && date1 == '') {
					continue;
				} else {
					var exp = "@!@" + f1.getAttribute("search_tag") + "~!~" + search_type;
					if (!ss[exp]) {
						ss[exp] = "";
					}
					ss[exp] += "~!~" + date0 + '~!~' + date1;
				}
			} else {
				var exp = "@!@" + f1.getAttribute("search_tag") + "~!~" + search_type;
				if (!ss[exp]) {
					ss[exp] = "";
				}
				ss[exp] += "~!~" + f1.value;
			}

		}
		var ss2 = [];
		for ( var n in ss) {
			ss2.push(n);
			ss2.push(ss[n]);
		}
		this._Cfg.EWA_LF_SEARCH = ss2.join("");
		console.log(this.filterExp);
		sorts.style.display = 'none';
		sorts.setAttribute('show', '');
		this._Cfg.EWA_PAGECUR = 1;
		this.load_box_data();
	};
	this.enq_op_main_sub_boxs = function(json) {
		var cfg = $J2MAP(json.CFG, "NAME");
		var arr = json.DATA;
		var wf = json.WF;

		var tmp = this._Cfg;
		var refData = this._REF_DATA;

		var pobj = $X(tmp.new_parent_id);
		if(!pobj){
			return;
		}
		pobj.innerHTML = "";
		if (tmp.first) {
			var mTb = this.enq_op_main_sub_tb();
			pobj.appendChild(mTb);
			var td = $(mTb.rows[0].cells[0]);
			td.attr({
				"valign" : "",
				align : "center"
			});
			td.append(tmp.first);
			$(mTb).addClass('ewa-box-first');
		} else {
			// 按钮
			this.enq_op_main_sub_box_but(pobj);
		}
		pobj.setAttribute('sys_frame_unid', json.FRAME_UNID);
		for (var i = 0; i < arr.length; i++) {
			var mTb = this.enq_op_main_sub_tb();
			mTb.id = json.FRAME_UNID + "$" + arr[i].EWA_KEY;

			pobj.appendChild(mTb);

			var mTd = $(mTb.rows[0].cells[0]); // td
			if (tmp.chk && tmp.chk_icons) {// 状态
				var chkObj = this.enq_op_main_sub_box_chk(cfg, arr[i], tmp, refData, wf, json.FRAME_UNID);
				mTd.append(chkObj);
			}
			var title = this.enq_op_main_sub_title(cfg, arr[i], tmp, refData);
			mTd.append(title);
			// 文字描述
			var o = this.enq_op_main_sub_box(cfg, arr[i], tmp, refData);
			mTd.append(o[0]);
			mTd.attr("json", JSON.stringify(o[1]));
			mTd.attr('json_ref', JSON.stringify(arr[i]));
		}
		$(pobj).find('.box_des1').each(function() {
			this.title = GetInnerText(this);
		});
		$(pobj).append('<div style="clear:both"></div>');
	};
	/**
	 * buttons
	 * 
	 * @param pobj
	 * @returns
	 */
	this.enq_op_main_sub_box_but = function(pobj) {
		var buts = $(pobj).parentsUntil('table[id=Test1]').find('.ewa_lf_func_dact');
		var mTb = this.enq_op_main_sub_tb();
		pobj.appendChild(mTb);
		var mTd = $(mTb.rows[0].cells[0]);
		var w = mTd.width();
		var w1 = w / 3 - 10;
		mTd.attr("valign", "middle");
		buts.each(function() {
			var obj = document.createElement('div');
			obj.innerHTML = this.innerHTML;
			obj.className = "box_but";
			this.id = this.id || ("sdo" + Math.random()).replace(".", "P");
			obj.id = "K" + this.id;
			$(obj).attr("fid", this.id);
			$(obj).attr("onclick", "$X(this.getAttribute('fid')).click()");
			$(obj).css('width', w1);
			mTd.append(obj);
		});
		return mTb;
	};
	/**
	 * 状态图标
	 * 
	 * @param cfg
	 * @param data
	 * @param tmp
	 * @returns {___anonymous2588_2590}
	 */
	this.enq_op_main_sub_box_chk = function(cfg, data, tmp, refData, wf, fuid) {
		var obj = document.createElement('div');
		obj.className = "status";
		var s;
		if (tmp.chk && tmp.chk instanceof Function) {
			try {
				var v = tmp.chk(data);
				s = tmp.chk_icons[v];
				if (typeof s == 'function') {
					s = s();
				}
			} catch (e) {
				s = e;
			}
		}
		if (s == null || s == '') {
			// 模板定义的默认图标
			s = tmp.icon;
		}
		if (s == null || s == '') {
			s = "fa fa-gear";
		}
		var color = tmp.icon_color;
		if (typeof s == 'object') {
			color = s.color;
			s = s.icon;
		}
		if (s.trim().indexOf('fa') == 0) {
			obj.innerHTML = "<li class='" + s + "' " + (color ? " style='color:" + color + "'" : "") + "></li>";
		} else {
			obj.innerHTML = s;
		}

		// 菜单
		var menus = this.enq_op_main_sub_menu(cfg, data, refData, wf, fuid);

		if (menus.childNodes.length > 0) {
			obj.setAttribute("onclick", this._ClassName + ".enq_op_main_sub_menu_show(this)");
			obj.appendChild(menus);
		}
		return obj;
	};
	this.enq_op_main_sub_menu_show = function(obj) {
		var menubox = $(obj).find('.box_menus')[0];
		if (!this.enq_op_main_sub_last_menu) {
			var o = document.createElement('div');
			o.className = "box_menus";
			o.setAttribute("onselectstart", "return false");
			document.body.appendChild(o);
			this.enq_op_main_sub_last_menu = $(o);
			this.enq_op_main_sub_last_menu.css("z-index", 1000000);
		}
		this.enq_op_main_sub_last_menu.html(menubox.innerHTML);
		this.enq_op_main_sub_last_menu.attr("json_ref", obj.parentNode.getAttribute('json_ref'))
		var o1 = $(obj);
		var p = o1.offset();
		// console.log(o1);
		// console.log(p)
		this.enq_op_main_sub_last_menu.show();
		var menu_height = this.enq_op_main_sub_last_menu.height() ;
		var window_height= $('body').height();
		//如果超出窗口高度，则显示到底部，否则显示在下部
		var top = p.top +menu_height> window_height ? p.top - menu_height - 10
			: p.top;
		this.enq_op_main_sub_last_menu.css({
			left : p.left - 110,
			top : top,
			width : 110
		});

	};
	/**
	 * 创建菜单
	 * 
	 * @param cfg
	 * @param data
	 * @param refData
	 * @param wf
	 *            workflow
	 * @param fuid
	 *            sys_frame_unid
	 * 
	 * @returns {___anonymous2797_2799}
	 */
	this.enq_op_main_sub_menu = function(cfg, data, refData, wf, fuid) {
		var div = document.createElement("div");
		div.className = "box_menus";
		$(div).hide();
		var delete_menu = null;
		for ( var n in cfg) {
			var c = cfg[n];
			var evt = c._ONCLICK || c.EWA_ONCLICK || c.EWA_CLICK;
			if (evt == null || evt == "") {
				continue;
			}

			var des = c.DES;
			if (c.NAME.toUpperCase() == 'BUTDELETE') {
				delete_menu = c;
				continue;
			} else if (c.NAME.toUpperCase() == 'BUTMODIFY') {
				des = "<b class='fa fa-edit'></b>" + c.DES;
			} else if (c.NAME.toUpperCase() == 'BUTADD') {
				des = "<b class='fa fa-plus'></b>" + c.DES;
			} else {
				des = "<b class='fa'></b>" + c.DES;
			}

			var js = this.replace_parameter(data, evt, refData);
			var a = this.enq_op_main_sub_menu_item(des, js)
			a.setAttribute('refid', c.NAME);
			div.appendChild(a);
		}
		if (delete_menu) {
			var hr = document.createElement('hr');
			div.appendChild(hr);
			var des = "<b class='fa fa-trash-o'></b>&nbsp;" + delete_menu.DES;
			var js = this.replace_parameter(data, delete_menu._ONCLICK, refData);
			var a = this.enq_op_main_sub_menu_item(des, js)

			div.appendChild(a);
		}
		if (wf) {
			var wfrst = this.enq_op_main_wf_js(cfg, data, refData, wf, fuid);
			var js = wfrst[0];
			var a = enq_op_main_sub_menu_item("流程控制/审批", js);
			a.setAttribute("flow", 1);
			var js1 = this._ClassName
				+ ".enq_op_main_close_menu(event,this);eval('window.___wf_json_para='+this.parentNode.parentNode.parentNode.getAttribute('json'))";
			a.setAttribute("onclick", js1);
			div.appendChild(a);
		}
		var clo = "<b onclick='" + this._ClassName + ".enq_op_main_close_menu(event,this)' class='fa fa-power-off close'></b>";
		div.setAttribute("onselectstart", "return false;");
		$(div).append(clo)
		return div;
	};
	/**
	 * 生成审批的脚本和显示数据
	 * 
	 * @param cfg
	 *            配置信息
	 * @param data
	 *            当前数据
	 * @param refData
	 *            引用数据（如Query参数）
	 * @param wf
	 *            工作流配置
	 * @param fuid
	 *            刷新Frame的ID，用于 EWA.F.FOS[xxx].Reload
	 * @returns {Array} 0 脚本，1显示数据的JSON
	 */
	this.enq_op_main_wf_js = function(cfg, data, refData, wf, fuid) {
		var p1 = wf.P;
		var ss = [];
		for (var i = 0; i < wf.RID.length; i++) {
			ss.push("@" + wf.RID[i]);
		}
		p1 = p1.replace(/\[RID\]/ig, ss.join(","));
		p1 += "&fjson=___wf_json_para"
		var js = "EWA.UI.Dialog.OpenReloadClose('" + fuid + "','" + wf.X + "','" + wf.I + "',false,'" + p1 + "')";
		js = this.replace_parameter(data, js, refData);
		var json = [];
		for (var i = cfg.length - 1; i >= 0; i--) {
			var d = cfg[i];
			var n = d.NAME;
			var v = data[n + '_HTML'] || data[n];
			if (v) {
				var o = {
					DES : d.DES,
					VAL : v
				};
				json.push(o);
			}
		}
		return [ js, json ];
	};
	this.enq_op_main_sub_menu_item = function(des, js) {
		var a = document.createElement("a");
		a.innerHTML = des;
		a.href = "javascript:void(0)";
		a.setAttribute("onclick", js + ";" + this._ClassName + ".enq_op_main_close_menu(event,this);");
		a.setAttribute("box_menu_item", "yes");
		return a;
	};
	this.enq_op_main_close_menu = function(evt, fobj) {
		var e1 = evt || window.event;
		e1.stopPropagation();
		e1.cancelBubble = true;
		fobj.parentNode.style.display = 'none';
	};
	/**
	 * 文字描述
	 * 
	 * @param cfg
	 * @param d
	 * @param tmp
	 * @returns
	 */
	this.enq_op_main_sub_box = function(cfg, d, tmp, refData) {
		var box_txt_fix = this._Cfg._Fix ? "style='width:" + this._Cfg._Fix.box_txt + "px'" : "";
		var ss = [ "<table  onselectstart='return true' class='box_txt' " + box_txt_fix + " cellspacing=0 cellpadding=0>" ];
		var box_des1_fix = this._Cfg._Fix ? "style='width:" + this._Cfg._Fix.box_des1 + "px'" : "";
		var json = [];
		for (var i = 0; i < tmp.txt.length; i++) {
			var txt1 = tmp.txt[i];

			var tmpText = txt1["t"];
			var n = txt1["n"];
			if (n.indexOf("<hr") == 0) { // 分割线
				ss.push("<tr><td class='box_subject' colspan=2>");
				ss.push(n);
				ss.push("</td></tr>");
				continue;
			}
			var rst = this.replace_parameter(d, tmpText);

			if (rst && rst.indexOf('(') >= 0 && rst.indexOf(')') > 0) {
				try {
					rst = eval(rst);
				} catch (e) {

				}
			}

			var v = cfg[n] ? cfg[n].DES : n;
			ss.push("<tr class='ewa-box-" + n + "'><td class='box_subject'><div class='box_subject1'><nobr>");
			ss.push(v);
			ss.push("</nobr><i class='fa fa-caret-right' style='color:#ccc'></i></div></td>");
			ss.push("<td class='box_des'><div class='box_des1' " + box_des1_fix + ">");
			ss.push(rst + "</div></td></tr>");
			json.push({
				DES : v,
				VAL : rst
			});
		}
		return [ ss.join(""), json ];
	};
	/**
	 * box外壳
	 * 
	 * @returns {___anonymous2849_2853}
	 */
	this.enq_op_main_sub_tb = function() {
		var table = document.createElement('table');
		table.className = "box";
		table.cellSpacing = 0;
		table.cellPadding = 0;

		var tr = table.insertRow(-1);
		var td = tr.insertCell(-1);
		td.vAlign = "top";
		table.setAttribute("onselectstart", "return false;");

		if (this._Cfg._Fix) {
			$(table).css('width', this._Cfg._Fix.width);
		}
		if (this._Cfg.page_color) {
			$(table).css('background', this._Cfg.page_color);
		}
		if (this._Cfg.page_radius) {
			$(table).css('border-radius', this._Cfg.page_radius);
		}
		if (this._Cfg.page_height) {
			$(table).css('height', this._Cfg.page_height);
		}
		return table;
	};
	/**
	 * 替换参数
	 * 
	 * @param data
	 * @param temp
	 * @returns
	 */
	this.replace_parameter = function(data, temp, refData) {
		var exp = temp;
		var s2 = [];
		for ( var n in data) {
			s2["@" + n.toUpperCase()] = data[n];
		}
		if (refData) {
			for ( var n in refData) {
				if (!s2[n]) {
					s2[n] = refData[n];
				}
			}
		}

		var r1 = /\@[a-zA-Z0-9\-\._:]*\b/ig;
		var m1 = temp.match(r1);
		if (m1) {
			for (var i = 0; i < m1.length; i++) {
				var key = m1[i];
				var key1 = key.toUpperCase();
				var v = s2[key1 + '_HTML'] || s2[key1] || "";
				exp = exp.replace(key, v);
			}
		}
		return exp;
	};
	/**
	 * 创建Title
	 * 
	 * @param cfg
	 * @param d
	 * @param tmp
	 * @param refData
	 * @returns
	 */
	this.enq_op_main_sub_title = function(cfg, d, tmp, refData) {
		if (!tmp.title) {
			return "";
		}

		var ss = [];
		if (tmp.img) { // 左边图片 -背景图
			ss.push("<div class='box_img'>");
			var img;
			if (typeof tmp.img == 'function') {
				img = tmp.img(d);
			} else {
				img = d[tmp.img];
			}

			var u1 = "";
			var blk = "_blank";
			var click = "";
			if (img && img != "") {
				u1 = img.replace('_SMAILL', '');
			} else {
				img = EWA.RV_STATIC_PATH + "/EWA_STYLE/images/pic_no.jpg";
			}

			if (tmp.img_click) {
				click = this.replace_parameter(d, tmp.img_click.toString(), refData);
				blk = "";
			}
			ss.push("<a class='imgtb' style='background-image:url(" + img + ")' ");
			if (click) {
				ss.push(" href='javascript:void(0)' onclick=\"" + click + "\" ");
			} else if (u1 != "") {
				ss.push(" target='" + blk + "' href=\"" + u1 + "\" ");
			}
			ss.push("></a>");
			ss.push("</div>");
		}
		// if (tmp.img1) { // 左边图片
		// ss.push("<div class='box_img'>");
		// var img;
		// if (typeof tmp.img == 'function') {
		// img = tmp.img(d);
		// } else {
		// img = d[tmp.img];
		// }
		//
		// var u1 = "";
		// var blk = "_blank";
		// if (img && img != "") {
		// u1 = img.replace('_SMAILL', '');
		// } else {
		// img = EWA.RV_STATIC_PATH + "/EWA_STYLE/images/pic_no.jpg";
		// }
		//
		// if (tmp.img_click) {
		// u1 = "javascript:" + this.replace_parameter(d,
		// tmp.img_click.toString(),
		// refData);
		// blk = "";
		// }
		// ss.push("<table cellpadding=0 cellspacing=0 class='imgtb'><tr><td
		// align=center>");
		// if (u1 != "") {
		// ss.push("<a target='" + blk + "' href=\"" + u1 + "\">");
		// }
		// ss.push("<img src='");
		// ss.push(img);
		// ss.push("' border=0>");
		// if (u1 != "") {
		// ss.push("</a>");
		// }
		// ss.push("</td></tr></table>");
		// ss.push("</div>");
		// }

		if (tmp.title) {
			var css = "box_title";
			var fixWidth = "";

			if (tmp.img) {
				css = "box_title_img";
			}
			if (this._Cfg._Fix) {
				fixWidth = "width:" + this._Cfg._Fix[css] + "px; ";
			}
			if (tmp.title_color) {// 标题颜色
				fixWidth += 'color:' + tmp.title_color;
			}
			ss.push("<div class='" + css + "' style='" + fixWidth + "'>");
			var t = this.replace_parameter(d, tmp.title);
			ss.push(t);
			ss.push("</div>");

		}
		return ss.join('');
	};

	this.add_box_style = function() {
		// defined in EWA_STYLE/skins/box.css
	}
};
var EWA_UI_BoxExt = {
	getFileLen : function(v) {
		if (v == null || isNaN(v)) {
			return v || "";
		}
		if (v > 1024 * 1024 * 1024) {
			return Math.round(v / (1024 * 1024 * 1024) * 100) / 100 + "G";
		}
		if (v > 1024 * 1024) {
			return Math.round(v / (1024 * 1024) * 100) / 100 + "M";
		} else if (v > 1024) {
			return Math.round(v / (1024) * 100) / 100 + "K";
		} else {
			return v + "B";
		}
	},
	openInBox : function(u, title, callBack) {
		if (!$X('EWA_UI_BoxExt_OpenInBox')) {
			var css = [];
			css.push("#EWA_UI_BoxExt_OpenInBox {left: 10px;right: 10px;" + "bottom: 10px;top: 10px;" + "position: fixed; "
				+ "background-color: rgba(127, 127, 127, 0.7);" + "display: none;padding: 5px;z-index: 1010;}");
			css.push("#EWA_UI_BoxExt_OpenInBox .title {height: 30px;background-color: #cdcdcd;font-size: 14px;padding: 4px;}");
			css.push("#open_box .title b {color: #08c;cursor: pointer;}");

			var style = document.createElement("style");
			style.textContent = css.join('\n');
			document.getElementsByTagName('head')[0].appendChild(style);

			var ss = [];
			ss.push("<div id='EWA_UI_BoxExt_OpenInBox'>");
			ss.push("<table width=100% height=100% cellpadding=0 cellspacing=0>");
			ss.push("<tr>");
			ss.push("<td class=\"title\"><b class=\"fa fa-power-off fa-border\"");
			ss.push(" onclick=\"$('#EWA_UI_BoxExt_OpenInBox').hide();isStopMouseWheel = false;\"></b>&nbsp;<span></span></td>");
			ss.push("</tr>");
			ss.push("<tr>");
			ss.push("<td class=\"cnt\" valign=top><div id='open_box_cnt'");
			ss.push(" style='overflow: auto; width: 100%; height: 100%'></div></td>");
			ss.push("</tr>");
			ss.push("</table>");
			ss.push("</div>");
			$('body').append(ss.join(''));

		}
		$('#EWA_UI_BoxExt_OpenInBox').show();
		$('#EWA_UI_BoxExt_OpenInBox .title span').html(title);
		var s = "<iframe width=100% height=100% src='" + u + "' frameborder=0></iframe>";
		$('#EWA_UI_BoxExt_OpenInBox .cnt').html(s);
		if (callBack) {
			callBack();
		}
	}
};
/**
 * EWA 扩展 利用HTML5 input multi 的特性上传文件
 * 
 */

var EWA_UI_BoxExt = {
	getFileLen : function(v) {
		return EWA.UI.Ext.FileLen(v);
	},
	openInBox : function(u, title, callBack) {
		if (!$X('EWA_UI_BoxExt_OpenInBox')) {
			var css = [];
			css.push("#EWA_UI_BoxExt_OpenInBox {left: 10px;right: 10px;" + "bottom: 10px;top: 10px;" + "position: fixed; "
				+ "background-color: rgba(127, 127, 127, 0.7);" + "display: none;padding: 5px;z-index: 1010;}");
			css.push("#EWA_UI_BoxExt_OpenInBox .title {height: 30px;background-color: #cdcdcd;font-size: 14px;padding: 4px;}");
			css.push("#open_box .title b {color: #08c;cursor: pointer;}");

			var style = document.createElement("style");
			style.textContent = css.join('\n');
			document.getElementsByTagName('head')[0].appendChild(style);

			var ss = [];
			ss.push("<div id='EWA_UI_BoxExt_OpenInBox'>");
			ss.push("<table width=100% height=100% cellpadding=0 cellspacing=0>");
			ss.push("<tr>");
			ss.push("<td class=\"title\"><b class=\"fa fa-power-off fa-border\"");
			ss.push(" onclick=\"$('#EWA_UI_BoxExt_OpenInBox').hide();isStopMouseWheel = false;\"></b>&nbsp;<span></span></td>");
			ss.push("</tr>");
			ss.push("<tr>");
			ss.push("<td class=\"cnt\" valign=top><div id='open_box_cnt'");
			ss.push(" style='overflow: auto; width: 100%; height: 100%'></div></td>");
			ss.push("</tr>");
			ss.push("</table>");
			ss.push("</div>");
			$('body').append(ss.join(''));

		}
		$('#EWA_UI_BoxExt_OpenInBox').show();
		$('#EWA_UI_BoxExt_OpenInBox .title span').html(title);
		var s = "<iframe width=100% height=100% src='" + u + "' frameborder=0></iframe>";
		$('#EWA_UI_BoxExt_OpenInBox .cnt').html(s);
		if (callBack) {
			callBack();
		}
	}
};function EWA_UI_LeftClass() {
	this.crm_cfg = null;
	this.map = null;
	this.lastmd = null;
	this.parentId = null;
	this.objSearch = null;
	this.objSearchGrp = null;
	this.objRecords = null;
	this.objContent = null;
	this.instanceName = null; // 实例化的变量名
	this.sortExp = null;
	this.searchExp = null;
	this.Create = function (json) {
		this.parentId = ("EWA_UI_LeftClass" + Math.random()).replace(".", "m");
		EWA.F.FOS[this.parentId] = this;
		this._Id = this.parentId;

		this.map = json;
		this.map.des = this.map.des.split(',');
		this.map.order = this.map.order.split(',');

		if (window != parent) {
			$('body').css('background-color', 'transparent');
		}
		var init_htmls = [ "<link rel=\"stylesheet\" rev=\"stylesheet\" type=\"text/css\" href='" + EWA.RV_STATIC_PATH
			+ "/EWA_STYLE/skins/complex.css' />" ];
		init_htmls.push("<table cellpadding=0 cellspacing=0 width=100% height=100%>");
		init_htmls.push("<tr>");
		init_htmls.push("<td width=230><div id='div_" + this.parentId + "' class=\"items\"></div></td>");

		var src = "";
		if (this.map['default']) {// 默认打开页面
			src = " src=\"" + this.map['default'] + "\" ";
		}
		init_htmls.push("<td id=\"cnt\"><iframe frameborder=0 id='a2a2' " + src + " name=\"a2a2\"");
		init_htmls.push("height=100% width=100%></iframe></td>");
		init_htmls.push("</tr>");
		init_htmls.push("</table>");

		$('body').html(init_htmls.join(''));

		this.instanceName = "EWA.F.FOS." + this.parentId;
		// this.noDataFunc = noDataFunc;

		var p = $X("div_" + this.parentId);

		this.objContent = p;
		var s1 = '<div class="search_box" onselectstart="return false">'
			+ this.create_grp()
			+ '<div class=" fa fa-search" style="width:100%"><input class="search" onkeyup="'
			+ this.instanceName
			+ '.do_search()" placeholder="search"  onselectstart="return true">'
			+ "</div></div><div class='search_records'><b class='fa fa-quote-left'></b>&nbsp;记录数：<i></i><b class='fa fa-chevron-up records-gotop'></b></div>";
		$('body').append(s1);

		this.objSearch = $('.search')[0];
		if (this.map.grp && this.map.grp.length > 0) {
			this.objSearchGrp = $('.search-grp')[0];
		} else {
			this.objContent.style.top = '31px';
			$('.search_box').css("height", 30);
		}
		this.objRecords = $('.search_records i')[0];

		$('.search_records .records-gotop').click(function () {
			$(".items").first().scrollTop(0)
		});

		this.page_size = 50;
		if (this.map['page_size']) {
			this.page_size = this.map['page_size'];
		} else {
			this.page_size = 50;
		}
		// 获取数据
		this.load_data();
		this.current_page = 1;
	};
	this.scroll_check = function (obj) {
		if (obj.scrollHeight - obj.scrollTop > obj.clientHeight * 1.2) {
			return;
		}
		if (this.current_page * this.page_size >= this.total_records) {
			return;
		}
		if (this.is_load_data) {
			return;
		}
		this.load_more();
	};
	this.load_more = function () {
		if (this.current_page) {// 当前PAGE
			this.current_page++;
		} else {
			this.current_page = 2;
		}
		this._load_datas();
	}
	this.create_grp = function () {
		if (!this.map.grp || this.map.grp.length == 0) {
			return "";
		}
		var ss = [ "<div ><i class='fa fa-filter'></i><select onchange='" + this.instanceName
			+ ".do_grp(this)' class='search-grp'>" ];
		for (var i = 0; i < this.map.grp.length; i++) {
			var g = this.map.grp[i];
			var s1 = "<option value='" + g[1] + "'>" + g[0] + "</option>";
			ss.push(s1);
		}
		ss.push("</select></div>");
		return ss.join('');
	};
	this.create_sort = function () {
		if (this.map.order == null || this.map.order.length == 0) {
			return;
		}
		var map1 = $J2MAP(this.crm_cfg, 'NAME');
		var ss = [ "<div openbox=1 class='sort' onclick='" + this.instanceName
			+ ".show_sort(this.childNodes[0],event)'><i openbox=1 style='line-height:16px'"
			+ " class='fa fa-gear'></i><table cellpadding=1 cellspacing=1 class='sort_items'><tr><td valign=top>" ];
		ss.push('<p onclick="' + this.instanceName + '.do_sort(null,this)">清除排序<b class="fa fa-times"></b></p>');
		for (var i = 0; i < this.map.order.length; i++) {
			var exp = this.map.order[i];
			if (!map1[exp]) {
				continue;
			}
			var v = map1[exp].DES;
			var s = '<div  class="sort_item" onclick="' + this.instanceName + '.do_sort(&quot;' + exp
				+ '&quot;,this)"><nobr><i class="fa fa-circle-o"></i>&nbsp;' + v + '&nbsp;<b class="fa"></b></nobr></div>';
			ss.push(s);
		}
		ss.push("</td><td valign=top></td><td valign=top></td></tr></table></div><div onclick='" + this.instanceName
			+ ".hide(this)' class='hide_but'>" + "<b style='line-height:16px' class='fa fa-caret-left'></b></div>");
		return ss.join('');
	};
	this.hide = function (o) {
		this.objContent.style.display = 'none';
		this.objContent.parentNode.style.backgroundColor = '#f1f1f1';
		this.objSearch.parentNode.parentNode.style.display = 'none';
		this.objRecords.parentNode.style.display = 'none';
		var c = this;
		this.objContent.parentNode.onclick = function () {
			c.show();
		};
		this.objContent.parentNode.appendChild(o);
		this.hideButton = o;

		$(this.objContent.parentNode).animate({
			width : '30px'
		}, 300);
	};
	this.show = function () {
		this.objSearch.parentNode.appendChild(this.hideButton);
		var c = this;

		$(this.objContent.parentNode).animate({
			width : '230px'
		}, 300, function () {
			c.objContent.parentNode.style.backgroundColor = '';
			c.objContent.style.display = '';
			c.objRecords.parentNode.style.display = '';
			c.objSearch.parentNode.parentNode.style.display = '';

		});
	}
	this.do_sort = function (v, obj) {
		var sorts = $('.sort_items')[0];
		$(sorts).find('.sort_item i').attr("class", "fa fa-circle-o");
		$(sorts).find('.sort_item b').attr("class", "fa");
		if (v) {
			var desc = $(obj).attr("desc");
			var c1 = "";
			if (desc == null || desc == "") {
				v += " DESC";
				$(obj).attr("desc", "desc");
				c1 = "fa fa-caret-down";
			} else {
				$(obj).attr("desc", "");
				c1 = "fa fa-caret-up";
			}
			$(obj).find('i').attr("class", "fa fa-dot-circle-o");
			$(obj).find('b').attr("class", c1);
		}
		this.sortExp = v;
		this.current_page = 1;
		this._load_datas();
		sorts.style.display = 'none';
		sorts.setAttribute('show', '');
	};
	this.do_grp = function (obj) {
		this.current_page = 1;
		this._load_datas();
	};
	this.do_filter = function (obj) {
		var sorts = $('.sort_items')[0];
		var selects = $(sorts).find('[search_tag]');
		var ss = {};
		for (var i = 0; i < selects.length; i++) {
			var f1 = selects[i];
			var search_type = f1.getAttribute("search_type");
			if (f1.value == '' && search_type != 'date') {
				continue;
			}
			if (search_type == 'date') {
				var id1 = f1.id + '_1';
				var date0 = f1.value;
				var date1 = $X(id1).value;

				if (date0 == '' && date1 == '') {
					continue;
				} else {
					var exp = "@!@" + f1.getAttribute("search_tag") + "~!~" + search_type;
					if (!ss[exp]) {
						ss[exp] = "";
					}
					ss[exp] += "~!~" + date0 + '~!~' + date1;
				}
			} else {
				var exp = "@!@" + f1.getAttribute("search_tag") + "~!~" + search_type;
				if (!ss[exp]) {
					ss[exp] = "";
				}
				ss[exp] += "~!~" + f1.value;
			}

		}
		var ss2 = [];
		for ( var n in ss) {
			ss2.push(n);
			ss2.push(ss[n]);
		}
		this.filterExp = ss2.join("");
		sorts.style.display = 'none';
		sorts.setAttribute('show', '');
		this.current_page = 1;
		this._load_datas();
	}
	this.do_search = function () {
		var o = $(this.objSearch);
		var val = o.val();
		var oldVal = o.attr("old_val");
		if (val == oldVal) {
			return;
		}
		o.attr("old_val", val);

		this.searchExp = "@!@" + this.map.search + "~!~text~!~" + val;
		this.current_page = 1;
		this._load_datas();
	};
	this._load_datas = function () {
		this.is_load_data = true; // 当前数据加载中
		var u = $U2(this.map.XMLNAME, this.map.ITEMNAME, this.map._URL_PARAS, true);

		if (this.sortExp && this.sortExp != "") {
			u += "&EWA_LF_ORDER=" + this.sortExp.toURL();
		}
		var search = "";
		if (this.searchExp && this.searchExp != "") {
			search = this.searchExp;
		}
		if (this.filterExp && this.filterExp != "") {
			search += this.filterExp;
		}
		if (search != "") {
			u += "&EWA_LF_SEARCH=" + search.toURL();
		}
		if (this.objSearchGrp) {
			u += "&" + this.objSearchGrp.value;
		}
		if (this.current_page) {
			u += "&EWA_PAGECUR=" + this.current_page;
		}
		u += "&EWA_PAGESIZE=" + this.page_size;
		var c = this;

		// 当多次提交查询请求时，ajax返回的顺序和查询的顺序不一致，
		// 因此只保留最后一次查询的结果
		var post_time = new Date().getTime(); // ajax提交时间
		this._load_datas_post_time = post_time; // 最后一次提交时间

		$J(u, function (v) {
			if (post_time != c._load_datas_post_time) {
				// ajax提交时间和记录的最后一次提交时间不一致，抛弃
				return;
			}
			c.total_records = v.RECORDS;
			c.show_pages();
			c.show_data(v.DATA, [ true ]);
			c.is_load_data = false; // 当前数据加载完毕
		});
	};
	this.show_sort = function (obj, evt) {
		evt = evt || event;
		var t = evt.srcElement || evt.target;
		var openbox = t.getAttribute("openbox");
		if (openbox != 1) {
			return;
		}
		var nxt = $(obj).next();
		if (nxt.attr('show') == null || nxt.attr("show") == "") {
			nxt.show();
			nxt.css({
				top : 20,
				right : 4
			});
			nxt.attr("show", 1);
		} else {
			nxt.hide();
			nxt.attr("show", "");
		}
	};
	this.load_data = function () {
		var fos;
		if (EWA && EWA.F && EWA.F.FOS) {
			for ( var n in EWA.F.FOS) {
				var fos1 = EWA.F.FOS[n];
				if (fos1.LEFT_CLASS == this) {
					fos = fos1;
					break;
				}
			}
		}
		var paras = {};
		if (fos) {
			var url = fos.Url;
			var u2 = new EWA_UrlClass();
			u2.SetUrl(url);
			for ( var n in u2._Paras) {
				if (n == 'XMLNAME' || n == "ITEMNAME" || n == 'EWA_LEFT') {
					continue;
				}
				paras[n] = u2._Paras[n];
			}
		}
		var u2 = new EWA_UrlClass();
		u2.SetUrl(window.location.href);
		for ( var n in u2._Paras) {
			if (n == 'XMLNAME' || n == "ITEMNAME" || n == 'EWA_LEFT') {
				continue;
			}
			paras[n] = u2._Paras[n];
		}
		paras["EWA_FRAMESET_NO"] = 1;
		paras["EWA_AJAX"] = "json_ext1";

		var ss = [];
		for ( var n in paras) {
			var v = (paras[n] || "") + "";
			ss.push(n + "=" + v.toURL());
		}
		this.map._URL_PARAS = ss.join("&");
		var u = $U2(this.map.XMLNAME, this.map.ITEMNAME, this.map._URL_PARAS, true);
		// console.log(u)
		if (this.objSearchGrp) {
			u += "&" + this.objSearchGrp.value;
		}
		u += "&EWA_PAGESIZE=" + this.page_size;
		$J(u, this.load_data1, this);

	};
	this.create_filter = function (json) {
		var ss = [];
		var map1 = $J2MAP(this.crm_cfg, 'NAME');
		var ss_text = [];
		for ( var n in json) {
			var f = json[n];
			if (f.T == 'fix') { // 选择
				ss.push("<select onchange='" + this.instanceName + ".do_filter(this)' search_type='" + f.T + "' search_tag='" + n
					+ "'>");
				ss.push("<option value=''>--" + map1[n].DES + "--</option>");
				for (var i = 0; i < f.D.length; i++) {
					var v = f.D[i];
					ss.push("<option value=\"" + v[0] + "\">" + v[1] + "</option>");
				}
				ss.push("</select>");
			} else if (f.T == 'text') {// 文字搜索
				ss_text.push("<div class='search_input'><input search_type='" + f.T + "' old='' onblur='" + this.instanceName
					+ ".checkTextChange(this)' search_tag='" + n + "' type=text placeholder=\"" + map1[n].DES + "\"/></div>");
			} else if (f.T == 'date') {// 文字搜索
				var rid = ("D" + Math.random()).replace(".", "A");

				ss_text.push("<div class='search_input'><input style='width:43%' id='" + rid
					+ "' onclick=\"EWA.UI.Calendar.Pop(this)\" search_tag='" + n + "' search_type='" + f.T + "' old='' onblur='"
					+ this.instanceName + ".checkTextChange(this)' type=text placeholder=\"" + map1[n].DES
					+ "\"/> <input style='width:43%' id='" + rid + "_1' old='' onblur='" + this.instanceName
					+ ".checkTextChange(this)' onclick=\"EWA.UI.Calendar.Pop(this)\" type=text placeholder=\"" + map1[n].DES
					+ "\"/></div>");
			}
		}
		return [ ss, ss_text ];
	};
	// 检查输入框内容是否变化
	this.checkTextChange = function (obj) {
		var old = obj.getAttribute('old');
		var v = obj.value.trim();
		if (old == v) {
			return;
		}
		obj.setAttribute('old', v);
		this.do_filter(obj.parentNode);
	};
	this.load_data1 = function (v, args) {
		var c = args[0];

		// 没有数据执行的方法
		if (v.DATA.length == 0 && c.noDataFunc) {
			c.noDataFunc();
		}

		c.crm_cfg = v.CFG;
		var map1 = $J2MAP(c.crm_cfg, 'NAME');

		c.CFG_MAP = map1;

		c.WF = v.WF;
		c.FRAME_UNID = v.FRAME_UNID;
		c.show_data(v.DATA);
		// 总记录数

		c.total_records = v.RECORDS;
		c.show_pages();

		// console.log(c.total_records)
		var sort = c.create_sort();

		$(c.objSearch).parent().append(sort);

		var jsFrameUnid = v.FRAME_UNID;
		EWA_Utils.JsRegister(v.JSFRAME);
		var json = EWA.F.FOS[jsFrameUnid]._SearchJson;
		// console.log(json);

		var searchSelectAndText = c.create_filter(json);
		var inc = 1;

		var objSortItems = $(c.objSearch).parent().find('.sort_items');
		if (searchSelectAndText[0].length > 0) {
			var sp = '<p on1click="' + this.instanceName + '.do_sort(null,this)">筛选</p>';
			objSortItems.find('td:eq(1)').css('width', 140).append(sp + searchSelectAndText[0].join(""));
			inc++;
		} else {
			objSortItems.find('td:eq(1)').hide();
		}
		if (searchSelectAndText[1].length > 0) {
			var sp = '<p on1click="' + this.instanceName + '.do_sort(null,this)">检索</p>';
			objSortItems.find('td:eq(2)').css('width', 140).html(sp + searchSelectAndText[1].join(""));
			inc++;
		} else {
			objSortItems.find('td:eq(2)').hide();
		}
		objSortItems.css('width', inc * 144);
		if (!c.init_scroll) {
			c.init_scroll = true;
			c.objContent.setAttribute('onscroll', c.instanceName + ".scroll_check(this)");
		}
	};
	this.show_pages = function () {
		var total_pages = Math.ceil(this.total_records / this.page_size);
		this.objRecords.innerHTML = this.total_records + ', ' + this.current_page + '/ ' + total_pages;
	}
	this.load_after = function () {
		// replace your function
	};
	this.show_data = function (datas, args) {
		var o = $(this.objContent);
		if (this.current_page == 1) {
			if (args != null && args.length > 0 && args[0] == true) {
				o.find('.item').remove();
			}
		}
		for (var i = 0; i < datas.length; i++) {
			var d = datas[i];
			var chd = this.show_data1(d, i);
			o.append(chd);
		}
		if (this.load_after) {
			this.load_after();
		}
	};
	this.show_data1 = function (d, index) {
		var obj = document.createElement('div');
		obj.setAttribute('fid', ('ITEM_' + Math.random()).replace(".", "k"));

		obj.className = "item";
		var h1 = document.createElement('h1');
		var titleExp = this.map.title;
		var title = this.replace_parameter(d, titleExp);
		var sv = $(this.objSearch).val();
		if (sv && sv != "") {
			title = title.replace(sv, "<span style='color:red'>" + sv + "</span>");
		}
		var idxLength = this.total_records ? this.total_records : this.page_size;
		var idxWidth = 8 * ((idxLength < 10 ? 10 : idxLength) + "").split('').length + 2;
		h1.innerHTML = "<span class=idx style='width:" + idxWidth + "px'>"
			+ (index + 1 + (this.current_page - 1) * this.page_size) + "</span>" + title;
		h1.title = title;
		$(h1).css({
			'white-space' : 'nowrap',
			'overflow' : 'hidden',
			'text-overflow' : 'ellipsis'
		});
		obj.appendChild(h1);
		var ul = document.createElement('ol');

		for ( var n in this.map.des) {
			var id = this.map.des[n];
			if (!this.CFG_MAP[id]) {
				continue;
			}
			var span = document.createElement('li');
			var name = this.CFG_MAP[id].NAME;
			var txt = d[name + "_HTML"];

			if (txt == null || txt == "") {
				txt = d[name];
			}
			if (txt == null || txt == "") {
				continue;
			}
			span.innerHTML = this.CFG_MAP[id].DES + ":&nbsp; " + txt;
			ul.appendChild(span);
		}
		obj.appendChild(ul);
		$(ul).css({
			'white-space' : 'nowrap',
			'overflow' : 'hidden',
			'text-overflow' : 'ellipsis',
			margin : 4,
			padding : '4px 18px'
		});
		var key = this.replace_parameter(d, this.map.key);
		obj.id = key;
		obj.setAttribute("onmousedown", this.instanceName + ".md(this)");
		if (this.WF) {
			var wf = this.create_item_wf(d);
			obj.appendChild(wf);
		}
		return obj;
	};
	this.create_item_wf = function (d) {
		var wf = this.WF;
		var p1 = wf.P;
		var ss = [];
		for (var i = 0; i < wf.RID.length; i++) {
			ss.push("@" + wf.RID[i]);
		}
		p1 = p1.replace(/\[RID\]/ig, ss.join(","));
		p1 += "&fjson=___wf_json_para"
		var js = "EWA.UI.Dialog.OpenReloadClose('" + this.FRAME_UNID + "','" + wf.X + "','" + wf.I + "',false,'" + p1 + "')";

		js = this.replace_parameter(d, js);
		var a = document.createElement('a');
		a.innerHTML = "流程控制/审批";
		// a.href = "javascript:" + js;
		a.setAttribute("flow", 1);
		a.setAttribute("onclick", "eval('window.___wf_json_para='+this.getAttribute('json'));" + js);
		var json = [];
		for ( var n in this.crm_cfg) {
			var cfg = this.crm_cfg[n];

			if (cfg.TAG == 'span') {
				var o1 = {
					DES : cfg.DES,
					VAL : d[cfg.NAME + '_HTML'] || d[cfg.NAME]
				};
				if (o1.VAL) {
					json.push(o1);
				}
			}
		}
		a.setAttribute("json", JSON.stringify(json));
		a.style.display = 'none';
		return a;
	};
	/**
	 * 鼠标点击事件，显示在右窗体
	 */
	this.md = function (obj) {
		if (this.lastmd) {
			this.lastmd.className = this.lastmd.className.replace(" md", "");
		}
		obj.className = obj.className + " md";
		this.lastmd = obj;
		var root = this.map.u;

		if (!root) {
			window.frames[0].document.body.innerHTML = '<h1 style="color:Red">json.u没定义,不知道要导航到哪里</h1>';
			return;
		}
		if (this.map.u.indexOf("()") > 0) {
			root = eval(this.map.u);
		}
		var u = root + (root.indexOf("?") > 0 ? "&" : "?") + obj.id + "&_fid_=" + obj.getAttribute("fid");
		if (this.objSearchGrp) {
			var v = this.objSearchGrp.value;
			if (v != "") {
				u += "&" + v;
			}
		}
		var add_paras = $U();
		if (add_paras) {
			u += "&" + add_paras;
		}
		if (this.AddTab) {
			var t = GetInnerText($(obj).find('h1')[0]);
			this.AddTab(u, t);
		} else {

			window.frames["a2a2"].location.href = u;
		}
	};
	/**
	 * 替换参数
	 * 
	 * @param data
	 * @param temp
	 * @returns
	 */
	this.replace_parameter = function (data, temp, refData) {
		var exp = temp;
		var s2 = [];
		if (!data.____S2) {
			for ( var n in data) {
				s2["@" + n.toUpperCase()] = data[n];
			}
			if (refData) {
				for ( var n in refData) {
					if (!s2[n]) {
						s2[n] = refData[n];
					}
				}
			}
			data.____S2 = s2;
		}
		s2 = data.____S2;
		var r1 = /\@[a-zA-Z0-9\-\._:]*\b/ig;
		var m1 = temp.match(r1);
		for (var i = 0; i < m1.length; i++) {
			var key = m1[i];
			var v = s2[key.toUpperCase()];
			v = v || "-";
			exp = exp.replace(key, v);
		}

		return exp;
	};
}
function EWA_ComplexClass() {
	this.Resources = {}; // EWA_FrameResoure

	this.edit = function (ref_id, obj) {
		var ref_obj = $X(ref_id);

		var p = $(ref_obj).offset();
		var is_open = ref_obj.getAttribute('is_open');
		if (is_open != 1) {
			this.changeEdit(ref_id, false);
			obj.innerHTML = '<i class="fa fa-save"></i>';
			ref_obj.setAttribute('is_open', 1);
			obj.setAttribute("_title", EWA.LANG == 'enus' ? "Save" : "保存");
		} else {
			var funid = $("#" + ref_id).find("form")[0].id.replace("f_", "");
			var rst = EWA.F.FOS[funid].DoPostBefore();
			if (!rst) {
				return;
			}
			if (!EWA.F.FOS[funid].CheckValidAll($("#f_" + funid)[0])) {
				return;
			}
			$(ref_obj).find('input[id=butOk]').click();
			this.changeEdit(ref_id, true);
			obj.innerHTML = '<i class="fa fa-edit"></i>';
			ref_obj.setAttribute('is_open', 0);
			obj.setAttribute("_title", EWA.LANG == 'enus' ? "Edit" : "编辑");
		}
		this.focusObject(ref_obj);
	};
	/**
	 * 栏目获得焦点
	 * 
	 * @param obj
	 *            对象
	 * @param func
	 *            获得后执行的脚本
	 */
	this.focusObject = function (obj, func) {
		var p = $(obj).offset();
		if (func) {
			$('body').animate({
				scrollTop : p.top - 40
			}, 300, func);
		} else {
			$('body').animate({
				scrollTop : p.top - 40
			}, 300);
		}
		$('.pop_title').hide();

		var p1 = $(obj).prev().find('.fa-expand');
		if (p1.length > 0) {
			p1.click();
		}
	};
	/**
	 * 跳转到对象，并执行方法
	 */
	this.goItem = function (id, func) {
		var obj = $X(id);
		if (obj == null) {
			alert('EWA_ComplexClass.goItem ' + id + ' not found');
			return;
		}
		var p = $(obj).offset();
		$('body').animate({
			scrollTop : p.top + 30
		}, 300);

		if (func) {
			func();
		} else {
			// 对象为异步加载，等待对象出现
			window['__timer_' + id] = setInterval(function () {
				if (func) {
					window.clearInterval(window['__timer_' + id]);
					func();
				}
			}, 111);
		}
		this.focusObject($(obj));
	}
	this.changeEdit = function (ref_id, isDisabled) {		
		var ref_obj = $X(ref_id);
		if(isDisabled && $(ref_obj).hasClass("disabled-true")){
			return;
		}
		$(ref_obj).find('.EWA_TD_B').hide();
		$(ref_obj).find('select').attr('disabled', isDisabled);
		$(ref_obj).find('input').attr('disabled', isDisabled);
		$(ref_obj).find('textarea')
			.each(
				function () {
					var a = $(this).parent();
					if (a.hasClass("ewa_redraw_info") && a.find(".textarea-tip").length == 0) {
						a.css("position", "relative").append(
							"<span class='textarea-tip'>" + $(this).attr("placeholder") + "</span>");
						a.hover(function () {
							a.find(".textarea-tip").show()
						}, function () {
							a.find(".textarea-tip").hide()
						});
					}
					if(a.find(".hide-textarea-content").length==0){
						var d = "<div class='hide-textarea-content' style='display:none;overflow:auto;height:" + $(this).height()
							+ "'>" + $(this).val() + "</div>";
						$(this).after(d);
					}
					a.find(".hide-textarea-content").hover(function () {
						$(this).parent().find(".textarea-tip").show()
					}, function () {
						$(this).parent().find(".textarea-tip").hide()
					});
				});
		$(ref_obj).find('.EWA_DHTML').each(
			function () {
				var a = $(this).parent();
				if (a.hasClass("ewa_redraw_info") && a.find(".textarea-tip").length == 0) {
					var uid = $('#cpx_tab1 .EWA_TABLE').prop("id").replace("EWA_FRAME_", "");
					var lowLang = EWA.LANG ? EWA.LANG.toLowerCase() : "zhcn";
					var tname = $(EWA.F.FOS[uid].ItemList.Items[this.id]).find("DescriptionSet Set[Lang='" + lowLang + "']")
						.attr("Info");
					a.css("position", "relative").append("<span class='textarea-tip'>" + tname + "</span>");
					a.hover(function () {
						a.find(".textarea-tip").show()
					}, function () {
						a.find(".textarea-tip").hide()
					});
				}
				if(a.find(".hide-textarea-content").length==0){
					var d = "<div class='hide-textarea-content' style='display:none;overflow:auto;height:" + $(this).height() + "'>"
						+ $(this).find("input").val() + "</div>";
					$(this).after(d);
				}
				a.find(".hide-textarea-content").hover(function () {
					$(this).parent().find(".textarea-tip").show()
				}, function () {
					$(this).parent().find(".textarea-tip").hide()
				});
			});
		if (isDisabled) {
			$(ref_obj).addClass("disabled-true");		
			$(ref_obj).find('input').css('background-color', '#eee');
			$(ref_obj).find('textarea').hide();
			$(ref_obj).find('.EWA_DHTML').hide();
			$(ref_obj).find(".hide-textarea-content").show();
		} else {
			$(ref_obj).removeClass("disabled-true");
			$(ref_obj).find('input').css('background-color', '');
			$(ref_obj).find('input[ewa_class="droplist"]').css('background-color', 'lightyellow');
			$(ref_obj).find('textarea').show();
			$(ref_obj).find('.EWA_DHTML').show();
			$(ref_obj).find(".hide-textarea-content").remove();
		}
	};
	this.textareaTip = function (obj) {
		var a = $(obj).parent();
		if (a.find(".textarea-tip").length > 0)
			return;
		a.css("position", "relative").append("<span class='textarea-tip' style=''>" + $(obj).attr("placeholder") + "</span>");
		a.hover(function () {
			a.find(".textarea-tip").show()
		}, function () {
			a.find(".textarea-tip").hide()
		});
	}
	// ---初始化调用-----
	this._init = function () {
		this.Xml = new EWA.C.Xml();
		var xmlString = window['EWA_ITEMS_XML_' + this._Id];
		this.Xml.LoadXml(xmlString);

		this.Resources = new EWA_FrameResoures();
		this.Resources.Init(this.Xml);

		var buts = window['_EWA_MENU_' + this._Id];
		$('.caption-info').attr("onselectstart", "return false");
		this.add_doc_buts(buts);
		this.init_lazy_frames_top();
		var c = this;
		addEvent(window, "scroll", function () {
			c.lazy_load();
		});
		this.mark_loc();

		this.lazy_load();
		document.body.style.overflow = 'hidden';

		if (EWA.B.MOZILLA) {
			addEvent(window, 'DOMMouseScroll', this.my_mousewheel);
		} else {
			addEvent(window, 'mousewheel', this.my_mousewheel);
		}
		var json = this.getlocalStorage();
		for ( var n in json) {
			if (n != 'id' && json[n] && $X(n)) {
				var o = $($X(n)).prev().find('.fa-compress');
				if (o.length > 0) {
					this.hide_frame(o[0]);
				}
			}
		}
		if (!window.open_in_box) {
			window.open_in_box = this.open_in_box;
		}

		if (parent != window) {
			document.body.style.backgroundColor = 'transparent';
		}
	};
	this.add_doc_buts = function (buts) {
		if (parent == window) {
			$('body').css("background-color", "#ccc");
		}
		if (!buts || buts.length == 0) {
			$('#dock').hide();
			return;
		}

		var buts_new = [];
		for (var i = 0; i < buts.length; i++) {
			buts_new[i] = buts[i];
		}
		buts_new.push({
			Id : this._Id + "_comress_all",
			Txt : EWA.LANG == 'enus' ? "Hide All" : "隐含全部",
			Cmd : "EWA.F.FOS['" + this._Id + "'].compress_all(this)",
			Img : "fa-compress"
		});

		for (var i = buts_new.length - 1; i >= 0; i--) {
			var d = buts_new[i];
			if (d == null) {
				continue;
			}
			var td = $X('controls').rows[0].insertCell(1);
			var txt = d.Txt;
			td.innerHTML = "<div id='" + d.Id + "' tag='" + d.Id + "' idx='" + i + "' onmouseover='EWA.F.FOS[\"" + this._Id
				+ "\"].show_title(this)' onmouseout=\"$('.pop_title').hide()\" class='but' _title=\"" + txt + "\" "
				+ (d.paras || "") + "><i class='fa " + d.Img + "'></i></div>";
			if (d.Cmd.indexOf('function(') >= 0) {
				td.childNodes[0].setAttribute("cmd", d.Cmd);
				td.childNodes[0].onclick = function () {
					var cmd = this.getAttribute('cmd');
					var obj = this;
					var js = "(" + cmd + ")";
					var inst = eval(js);
					inst(obj);
				}
			} else {
				td.childNodes[0].setAttribute("onclick", d.Cmd);
			}
			td.className = "tdbut";
		}
		var controls_width = $('#controls').width();
		$('#dock').css('width', controls_width).css('left', '50%').css('margin-left', -1 * controls_width / 2);
	};
	// 初始化frame的Top用于后加载
	this.init_lazy_frames_top = function () {
		this.lazy_frames = this.lazy_frames || {};
		var c = this;
		$('div[x]').each(function () {
			var t = $(this).offset().top;
			if (c.lazy_frames[this.id]) {
				c.lazy_frames[this.id].top = t;
			} else {
				c.lazy_frames[this.id] = {
					top : t
				};
			}
		});
	};
	this._getBodyHeight = function () {
		return (document.compatMode == 'CSS1Compat') ? document.documentElement.clientHeight : document.body.clientHeight;
	};
	this.lazy_load = function () {
		var h = (document.compatMode == 'CSS1Compat' ? document.documentElement.scrollTop : document.body.scrollTop)
			+ this._getBodyHeight();
		for ( var n in this.lazy_frames) {
			if (this.lazy_frames[n].top <= h - 10) {
				this.lazy_load_do(n);
			}
		}
		this.mark_loc();
	};
	this._getParas = function () {
		var u1 = new EWA_UrlClass(this.Url);
		u1.RemoveEwa();
		return u1.GetParas();
	};
	this.lazy_load_do = function (n) {
		if (this.lazy_frames[n].ok) {
			return;
		}

		this.lazy_frames[n].ok = true;
		var obj = $('#' + n);
		var x = obj.attr("x");

		var paras = this._getParas();
		if (paras) {
			paras = "&" + paras;
		}

		if (x != null && x.length > 0) {
			var i1 = obj.attr("i");
			var p = obj.attr("p");
			var js = obj.attr("js");
			if (js == null || js.trim() == "") {
				EWA.F.Install(n, x, i1, p + paras);
			} else {
				EWA.F.Install(n, x, i1, p + paras, function () {
					if(js.indexOf('(')>0){
						eval(js);
					} else {
						window[js](obj, this);
					}
				});
			}
		} else {
			var u = obj.attr("u") + paras + "&NO_NAV=1";
			// var ajax=new EWA_AjaxClass();
			// ajax.Install(u,"",n,function(){});
			var fid = ("iframe_lazy_" + Math.random()).replace(".", "A");
			var s = "<iframe id='" + fid + "' name='" + fid + "' width=100% height=100% frameborder=0 src='" + u + "'></iframe>";
			$X(n).innerHTML = s;
			var h0 = -1;
			var iscombine = u.indexOf('combine.jsp') > 0 ? true : false;
			var t1 = setInterval(function () {
				var w = window.frames[fid];
				if (w && w.document && w.document.readyState == 'complete' && w.$) {
					var h = iscombine ? $('[id=crm_main_box]:visible').height() : w.document.body.offsetHeight;
					if (Math.abs(h0 - h) < 100) {
					} else {
						h0 = h;
						$('#' + fid).css("height", h + 10);
						w.document.body.style.overflow = 'hidden';
					}
				}
			}, 777);
		}
	};
	this.mark_loc = function () {
		var bottoms = 0;
		var tops = 0;
		var objs = $('.fcaption');
		var topConv = $('#nav_left .top');
		var bottomConv = $('#nav_left .bottom');

		var conv = $('#nav_left');
		var bh = this._getBodyHeight();
		for (var i = 0; i < objs.length; i++) {
			var o = objs[i];
			var ref1 = this.mark_loc_ref(o, i);
			o = $(o);
			var top = o.offset().top
				- (document.compatMode == 'CSS1Compat' ? document.documentElement.scrollTop : document.body.scrollTop);

			if (top > bh - bottomConv.height()) {
				bottomConv.append(ref1);
			} else if (top < topConv.height()) {
				topConv.append(ref1);
			} else {
				var top1 = top;
				ref1.css({
					bottom : "",
					top : top
				});
				conv.append(ref1);
			}

		}
	};
	this.mark_loc_ref = function (o, index) {
		if (o.id == null || o.id == "") {
			o.id = Math.random();
		}
		var id = o.id;
		o = $(o);
		var ref = $X("zzz" + id);

		var thisClass = 'EWA.F.FOS["' + this._Id + '"].';
		if (!ref) {
			var color = "c" + index % 5;
			o.attr("class", o.attr("class") + " " + color);

			// 图钉
			var s2 = "<b onclick='" + thisClass + "max_frame(this)' class='fa fa-thumb-tack '>&nbsp;</b>";

			o.html(s2 + o.html());

			var bgc = o.css("background-color");

			o.parent().css("border-bottom-color", bgc);

			ref = document.createElement('div');
			ref.style.backgroundColor = bgc;
			ref.id = "zzz" + id;
			$('#nav_left').append(ref);
			ref.onclick = function () {
				var id = this.id.replace("zzz", "");
				var o = $($X(id));
				var top = o.offset().top;
				if (document.compatMode == "CSS1Compat") {
					// h5
					$(document.documentElement).animate({
						scrollTop : top
					}, 300);
				} else {
					// h4
					$('body').animate({
						scrollTop : top
					}, 300);
				}

			}
			ref.title = o.text();
			ref.innerHTML = index + 1;
			ref.onmouseover = function () {
				$('.pop_title_left div').html(this.title);
				var off = $(this).offset();
				$('.pop_title_left').show().css('top', off.top - 10).css('right', 45);
			};
			ref.onmouseout = function () {
				$('.pop_title_left').hide();
			};

			// 添加隐含button
			var s1 = '&nbsp;<i class="fa fa-compress" onclick=' + thisClass + 'hide_frame(this)></i>';
			o.append(s1);

			// 添加刷新button
			var s1 = '&nbsp;<i class="fa fa-refresh" onclick=' + thisClass + 'reload_frame(this)></i>';
			o.append(s1);

		}
		var ref1 = $(ref);
		return ref1;
	};
	// 阻止滚轮事件
	window.isStopMouseWheel = false;

	this.my_mousewheel = function (e) {
		if (isStopMouseWheel) {
			return;
		}
		var e1 = e || event;
		var v = e.wheelDelta || e.detail;

		var target = document.compatMode == "CSS1Compat" ? document.documentElement : document.body;

		if (EWA.B.MOZILLA) {
			target.scrollTop += v * 3;
		} else {
			target.scrollTop -= v;
		}
	};
	this.show_title = function (obj) {
		if (obj.getAttribute('_title') == "" || obj.getAttribute('_title') == null) {
			var ttt = obj.title;
			if (ttt == "" || ttt == null) {
				return;
			}
			obj.setAttribute("_title", ttt);
			obj.title = "";
		}
		$(".pop_title div").html(obj.getAttribute('_title'));

		var p = $(obj).offset();
		var w = $(obj).width();
		var h = $(".pop_title").height();
		var w1 = $(".pop_title").width();

		$(".pop_title").css('top', p.top - h - 8);
		$(".pop_title").show();
		$(".pop_title").css('left', p.left - (w1 - w) / 2);

	};
	// 隐含全部
	this.compress_all = function (obj) {
		var o = $(obj);
		var tag;
		if (o.attr('compress') == null || o.attr('compress') == "") {
			o.attr('compress', 1);
			o.find('i').attr('class', 'fa fa-expand');
			tag = 'fa-compress';
			o.attr("_title", EWA.LANG == 'enus' ? "Show All" : "显示全部");
		} else {
			o.attr('compress', "");
			o.find('i').attr('class', 'fa fa-compress');
			tag = 'fa-expand';
			o.attr("_title", EWA.LANG == 'enus' ? "Hide All" : "隐含全部" );
		}
		var c = this;
		$('.fcaption .' + tag).each(function () {
			c.hide_frame(this);
		});

	};
	/**
	 * 获取localStorage保存的数据
	 */
	this.getlocalStorage = function () {
		var id = "ROBERT_" + location.pathname;
		if (id.indexOf('/cgi-bin/') > 0) {
			var u1 = new EWA_UrlClass();
			u1.SetUrl(window.location.href);
			var x = u1.GetParameter("xmlname");
			var i = u1.GetParameter("itemname");
			if (x && i) {
				id = "EWA_" + x + "GdX" + i;
			}
		}
		var json = {};
		if (window.localStorage[id]) {
			try {
				json = eval('__json=' + window.localStorage[id] + "; __json;");
			} catch (e) {
				json = {};
			}
		}
		json.id = id;
		return json;
	};
	this.hide_frame = function (obj) {
		var refObj = $(obj.parentNode.parentNode);
		refObj = refObj.next();
		var o = $(obj);
		var is_compress = false;
		if (o.attr('compress') == null || o.attr('compress') == "") {
			o.attr('compress', 1);
			o.attr('class', 'fa fa-expand');
			refObj.hide();
			this.init_lazy_frames_top();
			this.lazy_load();
			is_compress = true;
		} else {
			o.attr('compress', "");
			o.attr('class', 'fa fa-compress');

			this.init_lazy_frames_top();
			refObj.show();
		}
		var json = this.getlocalStorage();

		json[refObj.attr("id")] = is_compress;
		window.localStorage[json.id] = JSON.stringify(json);
	};
	this.max_frame = function (obj) {
		var caption = $(obj.parentNode.parentNode);
		$('<p id="_MAX_FRAME___"></p>').insertBefore(caption);

		// frame
		var o = caption.next();

		// 禁止滚轮事件
		isStopMouseWheel = true;
		if (!$X('MAX_FRAME___')) {
			var o1 = document.createElement('div');
			o1.id = 'MAX_FRAME___';
			$(o1).css({
				position : 'fixed',
				left : 10,
				right : 10,
				top : 10,
				bottom : 10,
				'background-color' : 'rgba(255,255,255,0.9)',
				'z-index' : 10000000,
				'padding-top' : 5,
				overflow : 'auto',
				'border-radius' : 5
			});
			var s1 = '<div style="position:fixed;left:15px;top:15px;font-size:16px;color:#fff;cursor:pointer;'
				+ 'width:20px;height:20px;border-radius:10px;text-align:center;background-color:#111;" ' + ' onclick=EWA.F.FOS["'
				+ this._Id + '"].remove_max()><b style="line-height:20px" class="fa fa-times"></b></div>';
			o1.innerHTML = s1;
			document.body.appendChild(o1);
		}
		var o2 = $('#MAX_FRAME___');
		// CAPTION
		o2.append(caption);
		caption.find('.fa').hide();
		// FRAME
		o2.append(o);
		o.show();
		o2.show();
	};
	this.remove_max = function () {
		var o = $X('MAX_FRAME___');
		var loc = $('#_MAX_FRAME___');
		var inc = 0;
		while (o.childNodes.length > 1) {
			var o1 = o.childNodes[1];
			$(o1).insertBefore(loc);
			$(o1).find('.fa').show();
			inc++;
			if (inc > 5) {
				break;
			}
		}

		loc.remove();
		$(o).hide();

		// 允许滚轮事件
		isStopMouseWheel = false;
	};
	this.reload_frame = function (obj) {
		var refObj = obj.parentNode.parentNode;
		var o1 = refObj.nextElementSibling ? refObj.nextElementSibling : refObj.nextSibling;

		var r = o1.getAttribute("r");
		if (r != null && r != "") {
			// 自定义重新刷新
			eval(r);

			return;
		}
		var ft = $(o1).find('.EWA_TABLE');
		if (ft.length > 0) {
			var fid = ft[0].id.replace("EWA_LF_", "").replace("EWA_FRAME_", "");
			if (EWA.F.FOS[fid] instanceof EWA_FrameClass) {
				var u = EWA.F.FOS[fid].Url;
				var aa = new EWA_AjaxClass();
				aa.Install(u, "EWA_AJAX=INSTALL", o1.id, function () {
					change_edit('disabled')
				});
			} else {
				EWA.F.FOS[fid].Reload();
			}
		} else {
			if (o1.id == 'grp_fin_all') {
				load_grp_fin_total();
			} else {
				var iframes = o1.getElementsByTagName('iframe');
				if (iframes.length > 0) {
					iframes[0].src = iframes[0].src;
				}
			}
		}
	};

	this.open_in_box = function (u, txt) {
		$('#open_box').show();
		$('#open_box .title span').html(txt);

		u = u.replace(/\|/ig, '%7c');
		var s = "<iframe width=100% height=100% src='" + u + "' frameborder=0></iframe>";
		$('#open_box .cnt').html(s);

		isStopMouseWheel = true;
	};
}

/**
 * 栏目获得焦点
 * 
 * @param obj
 *            对象
 * @param func
 *            获得后执行的脚本
 */
function focus_object(obj, func) {
	var p = $(obj).offset();
	if (func) {
		$('body').animate({
			scrollTop : p.top - 40
		}, 300, func);
	} else {
		$('body').animate({
			scrollTop : p.top - 40
		}, 300);
	}
	$('.pop_title').hide();

	var p1 = $(obj).prev().find('.fa-expand');
	if (p1.length > 0) {
		p1.click();
	}
}/**
 * 轮播图片广告
 */
function EWA_UI_ADListClass() {
    this._TimeOut = 3000; // 3s
    this._Width = 515;
    this._Height = 223;
    this._List = [];
    this._Object = null;
    this._CurIndex = 0;
    this._GotoIndex = -1;
    this.ClassName = null;
    this.Timer = -1;
    this._CssSize = "";
    this.IsAutoPaly = true; // 默认自动播放

    this.SetSize = function(w, h) {
        this._Width = w;
        this._Height = h;

        var cssSize = "width:" + this._Width + (isNaN(this._Width) ? "" : 'px') + ";height:" + this._Height
        + (isNaN(this._Height) ? "" : 'px');
        this._CssSize = cssSize;
    }

    /**
     * 增加广告
     * 
     * @param {String}
     *            imgUrl 图片地址
     * @param {String}
     *            adUrl 广告地址
     * @param {String}
     *            adText 显示文字
     * @param {String}
     *            target 链接目标，默认是新开窗口
     */
    this.AddAd = function(imgUrl, adUrl, adText, target) {
        var o = {};
        o.ImgUrl = imgUrl;
        o.AdUrl = adUrl;
        o.AdText = adText;
        o.Target = target;

        this._List.push(o);
    }
    this.Change = function() {
        window.clearTimeout(this.Timer);
        var imgs = this._Object.getElementsByTagName('a');
        var tr = this._Object.getElementsByTagName('table')[0].rows[0];
        tr.cells[1].childNodes[this._CurIndex].style.backgroundColor = '#000';
        tr.cells[1].childNodes[this._CurIndex].style.color = '#fff';

        var objOut = imgs[this._CurIndex];
        if (this._GotoIndex == -1) {
            this._CurIndex++;
            if (this._CurIndex == this._List.length) {
                this._CurIndex = 0;
            }
        } else {
            this._CurIndex = this._GotoIndex;
            this._GotoIndex = -1;
        }
        var objIn = imgs[this._CurIndex];
        tr.cells[1].childNodes[this._CurIndex].style.backgroundColor = 'white';
        tr.cells[1].childNodes[this._CurIndex].style.color = '#000';

        EWA.UI.Utils.FadeIn(objIn, objOut, 10, 80, this);
    }
    this.ChangeAfter = function() {
        var tr = this._Object.getElementsByTagName('table')[0].rows[0];
        var a = tr.cells[0].childNodes[0];
        a.innerHTML = this._List[this._CurIndex].AdText;
        a.href = this._List[this._CurIndex].AdUrl;
        a.target = this._List[this._CurIndex].Target;

        if (this.IsAutoPaly) {
            window.clearTimeout(this.Timer);
            this.Timer = window.setTimeout(this.ClassName + '.Change()', this._TimeOut);
        }
    }

    this.CreateByUrl = function(url, pId) {
        this._ParentId = pId;
        EWA.UI.Utils.FADE_AJAX = new EWA.C.Ajax();
        EWA.UI.Utils.FADE_AJAX.Get(url, eval(this.ClassName + '.AjaxCallBack'));
        EWA.UI.Utils.FADE = this;
    // EWA.UI.Utils.FADE_AJAX.HiddenWaitting();
    }

    this.AjaxCallBack = function() {
        var ajax = EWA.UI.Utils.FADE_AJAX;
        if (ajax._Http.readyState != 4) {
            ajax = null;
            return;
        }
        ajax.HiddenWaitting();
        if (ajax._Http.status == 200) {
            var ret = ajax._Http.responseText;
            EWA.UI.Utils.FADE._List = eval(ret);
            EWA.UI.Utils.FADE.Create();
        } else {
            alert("ERROR:\r\n" + ajax._Http.statusText);
        }
        ajax = null;
        EWA["SHOW_ERROR"] = true; // 默认提示错误
    }

    this.Create = function(pId) {
        if (pId == null) {
            pId = this._ParentId;
        }
        var parent = $X(pId);
        if (parent == null) {
            alert('ID(' + pId + ') Not Exists!');
            return;
        }

        var o = document.createElement('DIV');
        o.style.width = this._Width + (isNaN(this._Width) ? "" : 'px');
        o.style.height = this._Height + (isNaN(this._Height) ? "" : 'px');
        o.style.overflow = 'hidden';
        var s = [];
        s.push('<div style="position: relative;' + this._CssSize + '">' + '<div style="z-index:0;position: absolute;'
            + this._CssSize + '"></div>');

        s.push('<div style="position: absolute; height: 20px; width: ' + this._Width + 'px; left: 0px; top:'
            + (this._Height - 22) + 'px; border: 1px black solid; ' + 'background-color: #000; filter: Alpha(Opacity=20); '
            + 'opacity: 0.2;z-index:1"></div>');
        s.push('<table style="z-index:2;position:absolute;height:20px; width:' + this._Width + (isNaN(this._Width) ? "" : "px")
            + '; left: 0px;top:' + (this._Height - 22) + 'px; font-size: 12px;'
            + 'color: white" cellpadding="0" cellspacing="0"><tr>' + '<td align="center"><a style="color:white"></a></td>'
            + '<td style="width:' + this._List.length * 24 + 'px;"></td></tr></table>');
        s.push('</div>');
        o.innerHTML = s.join('');
        parent.innerHTML = '';
        parent.appendChild(o);
        this._Object = o;

        this._CreateList();
        this.ChangeAfter();
    }

    this._CreateList = function() {
        var s = [];
        var tb = this._Object.getElementsByTagName('table')[0];
        var td = tb.rows[0].cells[1];

        var icon_css = "filter:Alpha(Opacity=70);width: 18px; height: 18px; float: left; "
            + "text-align: center; color: #fff; margin-right: 2px; font-family: arial; "
            + "cursor: pointer; opacity: 0.7; border-radius: 9px;line-height: 18px; background-color: #000;";
        for (var i = 0; i < this._List.length; i++) {
            var ad = this._List[i];
            var o = document.createElement('div');
            o.style.cssText = icon_css;
            o.innerHTML = (i + 1);
            td.appendChild(o);
            o.setAttribute('instancename', this.ClassName);
            o.onclick = function() {
                var instance = eval('window.' + this.getAttribute('instancename'));
                window.clearTimeout(instance.Timer);
                instance._GotoIndex = this.innerHTML * 1 - 1;
                instance.Change();
            }

            var img = document.createElement('div');
            var css_img = "background-image:url('"
                + ad.ImgUrl
                + "');  "
                + this._CssSize
                + ";background-repeat: no-repeat; background-size: cover;-moz-background-size: cover;-webkit-background-size: cover;background-position: center center;";

            img.style.cssText = css_img;
            // img.src = ad.ImgUrl;
            img.title = ad.AdText;
            var a = document.createElement('a');
            a.style.cssText = this._CssSize;
            a.style.position = 'absolute';
            a.style.top = '0em';
            a.style.left = '0em';
            if (i > 0) {
                a.style.display = 'none';
            }
            a.style.zIndex = i;
            a.href = ad.AdUrl;
            a.target = ad.Target == null ? '_blank' : ad.Target;
            a.appendChild(img);
            this._Object.childNodes[0].childNodes[0].appendChild(a);
        // a.style.display = 'none';
        }
    }
}

function EWA_UI_ADFlagClass() {
    this._ClassName = null;
    this._List = [];
    this._Ads = [];
    /**
     * 添加广告
     * 
     * @param {}
     *            imgSrc 图片地址
     * @param {}
     *            url 链接地址
     * @param {}
     *            top 上
     * @param {}
     *            left 左
     * @param {}
     *            imgWidth 图片宽度
     * @param {}
     *            imgHeight 高度
     * @param {}
     *            isformCenter 是否从中心向左右辐射
     */
    this.AddAd = function(imgSrc, url, top, left, imgWidth, imgHeight, isformCenter) {
        var o = {};
        o["IMG_SRC"] = imgSrc;
        o["URL"] = url;
        o["TOP"] = top;
        o["LEFT"] = left;
        o["IMG_WIDTH"] = imgWidth;
        o["IMG_HEIGHT"] = imgHeight;
        o["IS_FROM_CENTER"] = isformCenter;
        this._List.push(o);
    }

    this.Create = function(isFlow) {
        for (var i = 0; i < this._List.length; i++) {
            this._CreateObj(this._List[i]);
        }
        if (isFlow) {
            var inst = this;
            document.onscroll = function() {
                var dy;
                if (typeof window.pageYOffset != 'undefined') {
                    dy = window.pageYOffset;
                } else if (typeof document.compatMode != 'undefined' && document.compatMode != 'BackCompat') {
                    dy = document.documentElement.scrollTop;
                } else if (typeof document.body != 'undefined') {
                    dy = document.body.scrollTop;
                }
                for (var i = 0; i < inst._Ads.length; i++) {
                    inst._Ads[i].style.top = inst._List[i]["TOP"] * 1 + dy + 'px';
                }
            }
        }
    }

    this._CreateObj = function(o) {
        var left = o["LEFT"] * 1;
        if (o["IS_FROM_CENTER"]) { // 从中心向左右辐射
            var w = window.document.body.offsetWidth;
            left = w / 2 + left;
        }
        var obj = document.createElement("div");
        obj.style.position = 'absolute';
        obj.style.left = left + 'px';
        obj.style.top = o["TOP"] + 'px';
        obj.style.width = o["IMG_WIDTH"] + 'px';
        obj.style.height = o["IMG_HEIGHT"] + 'px';
        var s = "<a href='" + o["URL"] + "' target='_blank'><img src='" + o["IMG_SRC"] + "' border='0' width='" + o["IMG_WIDTH"]
            + "px' height='" + o["IMG_HEIGHT"] + "px' /></a>";
        s += "<div style='cursor:pointer;font-size:12px;text-align:right;padding-top:2px'"
            + " onclick='this.parentNode.style.display=\"none\"'>关闭</div>"
        obj.innerHTML = s;
        document.body.appendChild(obj);

        this._Ads.push(obj);
    }
}function EWA_CombineClass() {
	this.EWA_COMBINES_HTML = []; // html install
	this.EWA_COMBINES = []; // js install
	this.curCombineIndex = 0;
	this.ewa_lf_func_index = 0;
	this.MEAGER_ITEMS = [];
	this._init = function() {
		for (var i = 0; i < this.EWA_COMBINES_HTML.length; i++) {
			var id = this.EWA_COMBINES_HTML[i];
			this.installCfgMoveButton1(id);
		}
		if (this.EWA_COMBINES.length == 0) {
			for (var i = 0; i < this.MEAGER_ITEMS.length; i++) {
				this.meargeItems(this.MEAGER_ITEMS[i]);
			}
			if (window.lastDo) {
				lastDo();
			}
		} else {
			this.installCfg();// js
		}
	};
	this.installCfgMoveButton1 = function(id) {
		var oo = $('#' + id).find(".ewa_lf_func");
		if (oo.length == 0) {
			return;
		}
		var o = oo[0];

		$X(id).getElementsByTagName('table')[0].style.height = '';

		o.style.display = 'none';

		var obj1 = o.childNodes[1];
		if (obj1.getElementsByTagName('div').length > 0) {
			obj1.getElementsByTagName('div')[0].style.display = 'none';
			while (obj1.childNodes.length > 0) {
				$X('DES_' + id).appendChild(obj1.childNodes[0]);
			}
		}
	};

	this.installCfg = function() {
		if (this.curCombineIndex < this.EWA_COMBINES.length) {
			if (this.curCombineIndex > 0) {
				if (!$X('EWA_FRAME_MAIN')) {
					setTimeout(installCfg, 51);
					return;
				}
				$X('EWA_FRAME_MAIN').id = 'a';
			}
			var json = this.EWA_COMBINES[this.curCombineIndex];
			var c = this;
			EWA.F.Install(json.id, json.x, json.i, json.p, function(u, p, id,
					html) {
				c.installOk(u, p, id, html);
			});
			this.curCombineIndex++;
		} else {
			for (var i = 0; i < this.MEAGER_ITEMS.length; i++) {
				this.meargeItems(this.MEAGER_ITEMS[i]);
			}
			if (window.lastDo) {
				lastDo();
			}
		}
	};
	this.installOk = function(u, p, id, html) {
		this.installCfgMoveButton1(id);
		this.installCfg();
	};

	this.showFull = function(id) {
		var a = $('#' + id).parent('div');
		var b = a.find('.left');
		var c = $('#' + id).find('.show');
		var full = a.attr('full');
		if (full != null && full == '1') {
			a.attr('full', '0');
			$(document.body).css('overflow', 'auto');

			var ori;
			eval('ori=' + a.attr('ori'));

			a.animate(ori, 'fast', 'swing', function() {
				a[0].style.cssText = '';
				var st = a.attr('st') * 1;
				document.body.scrollTop = st;

				if ($('#crm_left_box').attr('show') == 1) {
					$('#crm_left_box').show();
				}
				a.css("display", a.attr('dsp'));
				if (c.length > 0 && id != 'DES_plugin') {
					c[0].click();
				} else {
					var lst = $X(id.replace('DES_', ''));
					lst.style.width = lst.parentNode.clientWidth - 10 + 'px';
					lst.style.height = ori.height - 30 + 'px';
					b.find('div[id="EWA_FRAME_MAIN"]').css('height',
							ori.height - 150);
				}
			});

		} else {
			a.attr('full', '1');
			a.attr('st', document.body.scrollTop);
			a.attr("dsp", a.css('display'));
			var hb = document.body.clientHeight;
			var he = document.documentElement.clientHeight;
			var w = document.documentElement.clientWidth - 10;
			var h = he - 20;
			var w1 = document.documentElement.clientWidth - 30;
			var h1 = he - 20 - 20 - 15;

			var p = a.offset();
			var loc = a.position();
			var mginLeft = p.left - loc.left;
			var aw = a.width();
			var ah = a.height();

			var ori = {
				width : aw,
				height : ah,
				'margin-left' : mginLeft,
				left : loc.left,
				top : loc.top
			};
			a.attr('ori', JSON.stringify(ori));
			a.css({
				'margin-left' : '0px',
				top : p.top,
				left : p.left,
				position : 'absolute',
				display : '',
				overflow : 'auto'
			});

			a.animate({
				width : w,
				height : h,
				left : 10,
				top : 0
			}, 'fast', 'swing', function() {
				b.css('width', w1);
				b.css('height', h1);
				a.find('iframe').css('height', h1);
				a.find('div[id="EWA_FRAME_MAIN"]').css('height', h1 - 30);
				if (c.length > 0 && id != 'DES_plugin')
					c[0].click();
			});

			document.body.scrollTop = 0;
			if ($('#crm_left_box').css('display') != 'none') {
				$('#crm_left_box').hide();
				$('#crm_left_box').attr('show', 1);
			}
			$(document.body).css('overflow', 'hidden');
		}

	};

	this.meargeItems = function(ids) {
		var ids1 = ids.split(',');
		var o0;
		var lst0;
		var aa;
		for (var i = 0; i < ids1.length; i++) {
			var id = ids1[i].trim();
			if (!$X(id)) {
				if (i == 0) {
					return;
				}
				continue;
			}
			var lst = $X(id.replace('DES_', ''));
			var o = $('#' + id);
			var ss = [];
			var chd0;
			if (i == 0) {
				o0 = $X(id);
				aa = document.createElement('div');
				aa.id = 'KK_' + id;
				aa.style.cssText = 'clear:both;height:25px;border-top:1px solid #cdcdcd';
				aa.setAttribute("but", "1");
				lst0 = lst;
				for (var ia = 1; ia < $X(id).childNodes.length; ia++) {
					var chd = $X(id).childNodes[ia];
					if (ia > 1) {
						chd.id = 'M' + Math.random();
						ss.push(chd.id);
					} else {
						chd0 = chd;
						chd0.className = 'ewa_lf_func_caption show';
						if (chd0.id == null || chd0.id == '') {
							chd0.id = 'MAx' + Math.random();
						}
						chd0.parentNode.setAttribute('lid', chd0.id);
					}
				}
				while ($X(id).childNodes.length > 2) {
					var chd = $X(id).childNodes[2];
					aa.appendChild(chd);
				}
			} else {
				lst.parentNode.style.display = 'none';
				lst0.parentNode.appendChild(lst);
				lst.style.display = 'none';

				var idx = 0;
				while ($X(id).childNodes.length > 1) {
					var chd = $X(id).childNodes[1];

					if (idx > 0) {
						chd.style.display = 'none';
						chd.id = 'M' + Math.random();
						ss.push(chd.id);
						aa.appendChild(chd);
					} else {
						chd0 = chd;
						o0.appendChild(chd);
					}
					idx++;
				}
			}
			chd0.setAttribute('ids', ss.join(','));
			chd0.setAttribute('lst', id);
			chd0.setAttribute('menu_id', aa.id);
			var c = this;
			addEvent(chd0, 'click', function() {
				c.meargeItems_ck(this);
			});
		}
		if (aa.childNodes.length > 0) {
			o0.appendChild(aa);
			o0.style.height = '50px';
		}
	};
	this.meargeItems_ck = function(obj) {
		var menuId = obj.getAttribute('menu_id');
		var lid = obj.parentNode.getAttribute('lid');
		if (lid != null && lid.length > 0) {
			$X(lid).className = 'ewa_lf_func_caption hide';
		}
		obj.className = 'ewa_lf_func_caption show';
		if (obj.id == null || obj.id == '') {
			obj.id = 'MAx' + Math.random();
		}
		obj.parentNode.setAttribute('lid', obj.id);
		$('#' + menuId).children('div').each(function() {
			$(this).hide();
		});
		$(obj).parent('div').parent('div').children('.ewa_cb_left').each(
				function() {
					$(this).hide();
				});
		var ids = obj.getAttribute('ids');
		if (ids != '') {
			var ids1 = ids.split(',');
			for (var i = 0; i < ids1.length; i++) {
				if ($X(ids1[i]).className == 'ewa_lf_func_caption') {
					continue;
				}
				$X(ids1[i]).style.display = '';
			}
		}
		var id = obj.getAttribute('lst');
		var lst = $X(id.replace('DES_', ''));
		lst.style.display = '';
		lst.style.width = lst.parentNode.clientWidth - 20 + 'px';
	};
	this.actIframe = function(id) {
		var o = $('#' + id).find('iframe');
		if (o.length == 0) {
			alert(id + ' not iframe');
			return;
		}

		var win = o[0].contentWindow;

		var h = win.document.body.scrollHeight;
		var w = win.document.body.scrollWidth;
		if (win.$) {
			var a = 0;
			if (win.document.body.innerHTML.indexOf('EWA.F.F.C') > 0) {
				a = win.$('#Test1').height();
				w = win.$('#Test1').width();
			} else {
				win.$('.ewa_table').parent().parent().children().each(
						function() {
							a += $(this).height();
						});
				w = win.$('.ewa_table').width();
			}
			h = a;

		}
		if (w > $('#' + id).width()) {
			h = h + 40;
		}
		if (h < 300) {
			h = 330;
		}
		$('#' + id).css('height', h);
		var c = this;
		if (o.attr('_src') != '0') {
			o.attr('src', o.attr('_src'));
			o.attr('_src', '0');
			setTimeout(function() {
				c.chkFrameLazyLoaded(id);
			}, 199);
			return;
		} else {
			c.setFrameCss(id, win);
			c.afterFrameLazyLoaded(id);
		}
	};
	this.setFrameCss = function(id, win) {
		if ($('#' + id).attr('lnk') != 1) {
			var lnk = win.document.createElement('link');
			lnk.type = 'text/css';
			lnk.rel = "stylesheet";
			lnk.rev = "stylesheet";
			lnk.href = "../../css/main.css";
			win.document.getElementsByTagName('head')[0].appendChild(lnk);
			win.document.body.style.backgroundColor = '#fff';
			$('#' + id).attr('lnk', 1);
		}
	};
	this.afterFrameLazyLoaded = function(id) {

	};
	this.chkFrameLazyLoaded = function(id) {
		var o = $('#' + id).find('iframe');
		var win = o[0].contentWindow;
		if (win && win.document && win.document.body && win.$) {
			if (win.document.readyState == 'complete') {
				var ss = [];
				var but = $('#' + id).parent().find('div[but=1]');
				if (but.length > 0) {
					win.$('.ewa_lf_func_dact').each(function(i) {
						var b = document.createElement("div");
						b.className = "ewa_lf_func_dact";
						b.style.cursor = 'pointer';
						b.innerHTML = this.innerHTML;
						if (this.id == '') {
							this.id = id + '|' + Math.random();
						}
						b.id = this.id;
						but[0].appendChild(b);
						b.onclick = function() {
							var fid = this.id.split('|')[0];
							var o = $('#' + id).find('iframe');
							var win = o[0].contentWindow;
							win.$X(this.id).click();
						};
						ss.push(b.id);
						if (i == 0) {
							this.parentNode.parentNode.style.display = 'none';
						}
					});
					but.parent().find('.show').attr("ids", ss.join(","));
				}
				this.actIframe(id);
				return;
			}
		}
		var c = this;
		setTimeout(function() {
			c.chkFrameLazyLoaded(id);
		}, 101);

	};
	this.showInPlugin = function(u, caption) {
		if (u.indexOf('.jsp') > 0) {
			var html = "<iframe width=100% height=100% frameborder=0 src=\""
					+ u + "\"></iframe>";
			$("#plugin").html(html);
		} else {

			// htmlobj = $.ajax( {
			// url : u + '&EWA_AJAX=install&EWA_FRAMESET_NO=1',
			// async : false
			// });
			// $("#plugin").html(htmlobj.responseText);
			var ajax = new EWA.C.Ajax();
			var u1 = u + '&EWA_AJAX=install&EWA_FRAMESET_NO=1';
			var c = this;
			ajax.Install(u1, "_r=1", 'plugin', function() {
				c.showFull("DES_plugin");
				document.body.scrollTop = 0;
				$X('subject_plugin').innerHTML = caption;
			});
			return;
		}
		this.showFull("DES_plugin");
		document.body.scrollTop = 0;
		$X('subject_plugin').innerHTML = caption;
	};
}
installCfgMoveButton1 = function(id) {
	var oo = $('#' + id).find(".ewa_lf_func");
	if (oo.length == 0) {
		return;
	}
	var o = oo[0];

	$X(id).getElementsByTagName('table')[0].style.height = '';

	o.style.display = 'none';

	var obj1 = o.childNodes[1];
	if (obj1.getElementsByTagName('div').length > 0) {
		obj1.getElementsByTagName('div')[0].style.display = 'none';
		while (obj1.childNodes.length > 0) {
			$X('DES_' + id).appendChild(obj1.childNodes[0]);
		}
	}
};(function (global, factory) {
	if (typeof module === "object" && typeof module.exports === "object") {
		module.exports = factory();
	} else {
		factory(global);
	}
})(typeof window !== "undefined" ? window : this, function (global) {
	let chnNumChar = {
		'零': 0, '0': 0, "０": 0, 'o': 0, 'O': 0,
		'一': 1, '壹': 1, '1': 1, "１": 1,
		'二': 2, '贰': 2, '2': 2, "２": 2, '两': 2, '俩': 2,
		'三': 3, '叁': 3, '3': 3, "３": 3,
		'四': 4, '肆': 4, '4': 4, "４": 4,
		'五': 5, '伍': 5, '5': 5, "５": 5,
		'六': 6, '陆': 6, '6': 6, "６": 6,
		'七': 7, '柒': 7, '7': 7, "７": 7,
		'八': 8, '捌': 8, '8': 8, "８": 8,
		'九': 9, '玖': 9, '9': 9, "９": 9
	};
	let chnNameValue = {
		'十': { value: 10, first: true },
		'拾': { value: 10, first: true },
		'什': { value: 10, first: true },
		'百': { value: 100 },
		'佰': { value: 100 },
		'陌': { value: 100 },
		
		'千': { value: 1000 },
		'阡': { value: 1000 },
		'仟': { value: 1000 },
		'k': { value: 1000, stop: true },
		'K': { value: 1000, stop: true },
		
		'万': { value: 10000, stop: true },
		'萬': { value: 10000, stop: true },
		'w': { value: 10000, stop: true },
		'W': { value: 10000, stop: true },
		
		'M': { value: 1000 * 1000, stop: true }, // million
		'm': { value: 1000 * 1000, stop: true },
		'亿': { value: 100000000, stop: true },
		'b': { value: 1000 * 1000 * 1000, stop: true }, //billion
		'B': { value: 1000 * 1000 * 1000, stop: true }
	};
	let negatives = {
		'-': true,
		'负': true,
		'－': true
	};
	let positives = {
		'+': true,
		'正': true
	};
	let skipTails = {
		'整': true
	};
	function newPart() {
		return { number: 0, scale: 1, items: [] };
	}

	function convertToParts(strs) {
		let parts = [newPart()];
		let prevName = null;
		for (let i = 0; i < strs.length; i++) {
			let alpha = strs[i];

			let name = chnNameValue[alpha];
			let num = chnNumChar[alpha];
			parts[parts.length - 1].items.push([alpha, name, num]);
			if (name) {
				if ((i == 0) && name.first) { //十
					let number = 10;
					parts[parts.length - 1].number = number;
				} else if (name.stop) {
					parts[parts.length - 1].scale = name.value || 1;
					// 创建新的片段
					parts.push(newPart());
					scale = 1;
					prevName = null;
				} else {
					if (i == strs.length - 1) {
						console.log(name)
						parts[parts.length - 1].number.scale = name.value;
					}
					prevName = name;
				}
				continue;
			}

			if (num == null) {
				throw '非数字或单位：' + alpha;
			}
			num = (num);

			let nextChar = i == strs.length - 1 ? null : strs[i + 1];
			let nextName = i == strs.length - 1 ? null : chnNameValue[nextChar];
			let nextNum = chnNumChar[nextChar];

			if (nextName && nextName.stop) {
				nextName = null;
			}
			let lastNum = parts[parts.length - 1].number;
			let number;

			let items = parts[parts.length - 1].items;
			let itemPre = items[items.length - 2];//上一个
			let itemPrePre = items[items.length - 3];// 上上个
			if (nextName == null) {
				if (prevName == null) {//连续的数字，例如 203
					let skipTen = false;
					if (itemPre && itemPre[2] === 0) {
						if (itemPrePre && itemPrePre[1] != null/*是单位 */) {//捌仟零六 的零
							skipTen = true;
						}
					} else if (itemPre && itemPre[1] && itemPre[1].value === 10) { //十六
						skipTen = true;
					}

					if (skipTen) {
						number = lastNum + num;
					} else {
						number = lastNum * 10 + num;
					}
				} else {// 例如 二千五，运算到五
					if (itemPre && itemPre[1] && itemPre[1].value === 10 && (itemPrePre == null || itemPrePre[2] === 0 || itemPrePre[1] != null)) { //十六
						number = lastNum + num + 10;
					} else {
						number = lastNum + num;
					}
				}
			} else {
				if (prevName == null) { // 例如 二千零五十
					number = lastNum + num * (nextName.value);
				} else {
					number = lastNum + num * (nextName.value);
				}
			}
			parts[parts.length - 1].number = number;
			prevName = null;
			//console.log(`num=${num},  number=${number}`);
		}
		//console.log(parts)
		return parts;
	}
	function convertJflhNum(strs, alpha, loc) {
		let fenv = strs[loc - 1];
		let fenNum = chnNumChar[fenv];
		if (!fenNum) {
			return -1;
		}
		//一元=10角，一元=100分，一元=1000厘，一元=10000毫
		if (alpha == '角') {
			return ("0." + fenNum) * 1;
		} else if (alpha == '分') {
			return ("0.0" + fenNum) * 1;
		} else if (alpha == '厘') {
			return ("0.00" + fenNum) * 1;
		} else if (alpha == '毫') {
			return ("0.000" + fenNum) * 1;
		} else {
			return -1;
		}
	}
	function convertJflh(strs) { // 角分厘毫
		let sum = 0;
		let inc = 0;
		for (let i = strs.length - 1; i >= 0; i -= 2) {
			let alpha = strs[i];
			let num = convertJflhNum(strs, alpha, i);
			if (num === -1) {
				break;

			} else {
				sum += num;
				inc++;
			}
		}
		return {
			sum: sum,
			inc: inc,
			strs: strs.splice(0, strs.length - inc * 2)
		};
	}
	/**
	 * 处理整数部分
	 * @param {*} strs 字符串
	 * @returns 整数
	 */
	function convert(strs) {
		let jiaofen = convertJflh(strs);
		// console.log(jiaofen);

		strs = jiaofen.strs;

		let parts = convertToParts(strs);
		let last = 0;
		let scale1 = 1;
		for (let i = parts.length - 1; i >= 0; i--) {
			let part = parts[i];
			let p = part.number;
			scale1 = scale1 * part.scale;
			last += p * scale1;
		}
		return last + jiaofen.sum;
	}
	/**
	 * 处理·小数部分
	 * @param {*} strs 字符串
	 * @returns 小数
	 */
	function convertDot(strs) {
		let scale = 1;
		let skip = 0;
		for (let i = strs.length - 1; i >= 0; i--) {
			let alpha = strs[i];
			let name = chnNameValue[alpha]; // 结尾的连续单位，例如 0.35百万
			if (!name) {
				break;
			}
			scale *= name.value;
			skip++;
		}
		let newStrs = scale == 1 ? strs : strs.splice(0, strs.length - skip);

		let parts = convertToParts(newStrs);
		let last = 0;
		let scale1 = 1;
		for (let i = parts.length - 1; i >= 0; i--) {
			let part = parts[i];
			let p = part.number;
			scale1 = scale1 * part.scale;
			last += p * scale1;
		}
		let last1 = ("0." + last) * 1;

		return [last1, scale, newStrs.length];
	}
	function chineseToNumber(chnStr) {
		if (!chnStr) {
			return chnStr;
		}
		if (!isNaN(chnStr.toString())) {
			return chnStr.toString() * 1;
		}
		let chnStrs = chnStr.replace(/，|,| |元|圆/ig, '').replace(/点|。/ig, '.').split('.');
		if (chnStrs.length > 2) {
			throw '非数字表达式：' + chnStr;
		}
		let strs = chnStrs[0].split('');
		let dots = (chnStrs.length == 2 ? chnStrs[1] : "").split('');

		let isNegative = false;
		let alpha = strs[0];
		if (negatives[alpha]) { // 负，- 
			isNegative = true;
			strs = strs.splice(1);
		} else if (positives[alpha]) { // 正，+
			isNegative = false;
			strs = strs.splice(1);
		}

		let lastAlpha = strs[strs.length - 1];
		if (skipTails[lastAlpha]) { //整
			strs = strs.splice(0, strs.length - 1);
		} else if (dots.length > 1) {
			lastAlpha = dots[dots.length - 1];
			if (skipTails[lastAlpha]) { //整
				dots = dots.splice(0, dots.length - 1);
			}
		}

		let number = convert(strs); // 
		let number1 = dots.length > 0 ? convertDot(dots) : 0;
		if (number1 == 0) { // 没有小数
			return number * (isNegative ? -1 : 1);
		}

		// console.log(number, number1)

		let fixed = number1[2] < 0 ? 0 : number1[2];
		let scale = number1[1];
		return ((number + number1[0]) * scale).toFixed(fixed) * (isNegative ? -1 : 1);

	}
	if (typeof window != 'undefined' && window.EWA && window.EWA_Utils) {
		window.EWA_Utils.chineseToNumber = chineseToNumber;
	} else if (global) {
		global.chineseToNumber = chineseToNumber;
	} else {
		return chineseToNumber;
	}
});/* move to EWA_06TransClass *//**
 * Workflow defined
 */
var EWAC_WfOrg = function () {
    this.Depts = {};
    this.Posts = {};
    this.Users = {};

    this.GetMaster = function (usrId) {
        var u = this.Users[usrId];
        if (u == null) {
            console.log((EWA.LANG == 'enus' ? 'NONE of ' : '没有啊') + usrId);
            return;
        }
        var dep = u.Dept;

        for (var n in dep.Users) {
            var u1 = dep.Users[n];
            for (var n1 in u1.Posts) {
                var p = u1.Posts[n1];
                if (p.IsMaster) {
                    return u1;
                }
            }
        }
        console.log(EWA.LANG == 'enus' ? '	No manager' : '没有管理者');
    }

    this.IsMaster = function (usrId) {
        var u = this.GetMaster(usrId);
        if (u == null) {
            return false;
        }
        return u.Id == usrId;
    }

    this.InitDepts = function (datas, depId, depName, depLvl, depOrd, depPid) {
        for (var i = 0; i < datas.length; i++) {
            var d = datas[i];
            var deptId = d[depId];
            if (this.Depts[deptId] != null) {
                continue;
            }
            var dept = {};
            dept.Id = d[depId];
            dept.Name = d[depName];
            dept.Lvl = d[depLvl];
            dept.Ord = d[depOrd];
            dept.Pid = d[depPid];
            dept.Posts = {};
            dept.Users = {};
            dept.Children = {};
            this.Depts[dept.Id] = dept;
        }

        for (var n in this.Depts) {
            var d = this.Depts[n];
            if (this.Depts[d.Pid]) {
                var p = this.Depts[d.Pid];
                d.Parent = p;
                p.Children[d.Id] = d;
            } else {
                if (this.DeptRoot == null) {
                    this.DeptRoot = d;
                }
            }
        }
    }

    this.InitPosts = function (datas, posId, posName, posIsMaster, depId) {
        for (var i = 0; i < datas.length; i++) {
            var d = datas[i];
            var postId = d[posId];
            if (this.Posts[postId] != null) {
                continue;
            }
            var post = {};
            post.Id = postId;
            post.Name = d[posName];
            post.DeptId = d[depId];
            var master = d[posIsMaster];
            master = master == null ? "" : master.trim().toLowerCase();
            if (master == "y" || master == "yes" || master == "true" || master == "1") {
                post.IsMaster = true;
            } else {
                post.IsMaster = false;
            }

            if (this.Depts[post.DeptId]) {
                post.Dept = this.Depts[post.DeptId];
                if (post.Dept.Posts[post.Id] == null) {
                    post.Dept.Posts[post.Id] = post;
                }
            }
            this.Posts[postId] = post;
        }
    }

    this.InitUsers = function (datas, userId, userName, depId, posId) {
        for (var i = 0; i < datas.length; i++) {
            var d = datas[i];
            var uId = d[userId];
            var u;
            if (this.Users[uId] != null) {
                u = this.Users[uId];
            } else {
                u = {};
                u.Id = uId;
                u.Name = d[userName];
                u.DeptId = d[depId];
                u.Posts = {};
                if (this.Depts[u.DeptId]) {
                    u.Dept = this.Depts[u.DeptId];
                    if (u.Dept.Users[u.Id] == null) {
                        u.Dept.Users[u.Id] = u;
                    }
                }
                this.Users[uId] = u;
            }
            var userPostId = d[posId];

            if (this.Posts[userPostId]) {
                u.Posts[userPostId] = this.Posts[userPostId];
            }
        }
    }
};
(function () {
    var ss = [];
    ss
        .push("<table gdx=\"LINE\" style=\"border-collapse: collapse;width:100%;height:100%;font-size:0px\" cellspacing=\"0\" cellpadding=\"0\"><tr>");
    ss.push("<td style=\"font-size: 1px; width: 50%;\" valign=\"top\">&nbsp;</td>");
    ss.push("<td style=\"font-size: 1px;\" valign=\"top\">&nbsp;</td></tr>");
    ss.push("<tr><td style=\"font-size: 1px\" valign=\"bottom\">&nbsp;</td>");
    ss.push("<td style=\"font-size: 1px;\" valign=\"bottom\">&nbsp;</td></tr></table>");
    EWAC_WF_CNN_TMP = ss.join("");
})();

function EWAC_WfUnit(id) {
    this.Id = id;
    this.Type = "normal";
    this.IsSelected = false;
    this.tagName = 'wfunit';

    this.CnnsFrom = {}; // 连接来源
    this.CnnsFromLength = 0;
    this.CnnsTo = {}; // 连接目标
    this.CnnsToLength = 0;
    this.IsDelete = false;
    this.ChangeType = function (type) {
        var obj = $X(this.Id);
        var css = 'ewa_wf_unit_img';
        if (type == 'control') {
            css = 'ewa_wf_unit_img1';
        } else if (type == 'end') {
            css = 'ewa_wf_unit_img2';
        }
        obj.getElementsByTagName('img')[0].className = css;
    }
    this.ChangeDes = function (des) {
        var obj = $X(this.Id);
        SetInnerText(obj.getElementsByTagName('td')[1].childNodes[0], des);
    };
    this.GetDes = function () {
        return GetInnerText($X(this.Id).getElementsByTagName('span')[0]).trimEx();
    };
    this.Delete = function () {
        if (!this.IsDelete) {
            for (var id in this.CnnsFrom) {
                this.CnnsFrom[id].Delete();
            }
            for (var id in this.CnnsTo) {
                this.CnnsTo[id].Delete();
            }
            var obj = $X(this.Id);
            obj.parentNode.removeChild(obj);
        }
        this.IsDelete = true;
    }
    this.Log = function (adm, date, text) {
        var imgSrc = EWA.RV_STATIC_PATH == null ? EWA.CP : EWA.RV_STATIC_PATH;
        imgSrc += "/EWA_STYLE/";
        var obj = $X(this.Id);
        var img = obj.getElementsByTagName('img')[0];
        // img.style.display = 'none';
        img.src = imgSrc + "images/workflow/wf_ok.png?a=1";
        img.style.width = '38px';
        img.style.height = '38px';
        img.className = '';
        var o = img.nextSibling;
        if (text != null && text.trim().length > 0) {
            obj.title = text;
        }
        var dt = "";
        try {
            var aa = new EWA_Utils.Date(date);
            // 中英文转换
            dt = aa.FormatDate();
        } catch (e) {

        }
        o.innerHTML += '<div style="font-size:9px;color:darkblue">' + adm + '<br><nobr>' + dt + '</nobr></div>';
        obj.style.backgroundColor = 'lightyellow'
    }
    this.LogCur = function (pid) {
        var obj = $X(this.Id);
        var img = obj.getElementsByTagName('img')[0];

        var o = img.nextSibling;

        var parentObj = null;
        if (pid && window.parent && window.parent.$X(pid)) {
            parentObj = window.parent.$X(pid);
            parentObj.options.length = 0;
            parentObj.options[parentObj.options.length] = new Option('', '');
        }

        var isEnd = true;
        for (var n in this.CnnsFrom) {
            isEnd = false;
            var cnn = this.CnnsFrom[n];
            if (cnn.IsStop) {
                continue;
            }
            cnn.Selected();
            var unitTo = EWAC_WfUtil["WF"].Units[cnn.To];
            unitTo.LogTo();
            if (parentObj) {
                parentObj.options[parentObj.options.length] = new Option(unitTo.GetDes(), unitTo.Id);
            }
        }
        img.style.width = '38px';
        img.style.height = '38px';
        img.className = '';
        var imgSrc = EWA.RV_STATIC_PATH == null ? EWA.CP : EWA.RV_STATIC_PATH;
        imgSrc += "/EWA_STYLE/";
        if (isEnd) {
            if (EWA.LANG == 'enus') {
                o.innerHTML += '<i><b>Finished</b></i>';
            } else {
                o.innerHTML += '<i><b>执行结束</b></i>';
            }
            // parentObj.parentNode.innerHTML = o.innerHTML;
            img.src = imgSrc + "images/workflow/wf_no.png?A=1";

        } else {
            if (EWA.LANG == 'enus') {
                o.innerHTML += '<i><b>Current</b></i>';
            } else {
                o.innerHTML += '<i><b>当前节点</b></i>';
            }
            if (parentObj && parentObj.options.length == 2) {
                parentObj.selectedIndex = 1;
            }
            obj.style.backgroundColor = 'lightblue';
            obj.style.color = 'white';
            img.src = imgSrc + "images/workflow/wf_cur.png?A=1";
        }
    }
    this.LogTo = function () {
        var imgSrc = EWA.RV_STATIC_PATH == null ? EWA.CP : EWA.RV_STATIC_PATH;
        imgSrc += "/EWA_STYLE/";
        var obj = $X(this.Id);
        obj.style.backgroundColor = 'lightyellow'
        var img = obj.getElementsByTagName('img')[0];
        img.src = imgSrc + "images/workflow/wf_next.png?A=2";
        img.style.width = '38px';
        img.style.height = '38px';
        img.className = '';
    }
    this.Create = function (CurID) {
        var obj = EWAC_WfUtil["CUR_OBJ"];

        var tb = document.createElement('TABLE');
        tb.id = this.Id;
        tb.className = 'ewa_wf_box';

        var tr = tb.insertRow(-1);
        var td = tr.insertCell(-1);
        var imgSrc = EWA.RV_STATIC_PATH == null ? EWA.CP : EWA.RV_STATIC_PATH;
        imgSrc += "/EWA_STYLE/";
        td.innerHTML = '<img style="cursor:pointer" class="ewa_wf_unit_img" src="' + imgSrc
            + '/images/transparent.png" id="Atom_Img_' + id + '"><div a=1></div>';
        td.align = 'center';

        tr = tb.insertRow(-1);
        td = tr.insertCell(-1);
        td.align = 'center';
        td.innerHTML = '<span onselectstart="return true" onkeypress="EWAC_WfUtil.AtomNameKeyPress(this)"'
            + ' onblur="EWAC_WfUtil.AtomChangedName(this)"' + ' ondblclick="EWAC_WfUtil.AtomChangeName(this)">业务元' + CurID
            + '</span>';

        document.body.appendChild(tb);

        tb.style.position = 'absolute';
        tb.style.left = obj ? obj.style.left : CurID * 120 + 'px';
        tb.style.top = obj ? obj.style.top : '90px';

        // 回到原点
        if (obj) {
            obj.style.position = 'static';
        }
        tb = null;
    };
    this.MoveTo = function (dx, dy) {
        var obj = this.GetObj();
        obj.style.left = obj.style.left.replace('px', '') * 1 + dx + 'px';
        obj.style.top = obj.style.top.replace('px', '') * 1 + dy + 'px';

        // 显示连接
        for (var id in this.CnnsFrom) {
            if (!this.CnnsFrom[id].IsDelete) {
                this.CnnsFrom[id].Show();
                this.CnnsFrom[id].Disp();
            }
        }
        for (var id in this.CnnsTo) {
            if (!this.CnnsTo[id].IsDelete) {
                this.CnnsTo[id].Show();
                this.CnnsTo[id].Disp();
            }
        }
    };
    this.GetObj = function () {
        return $X(this.Id);
    };
    /**
     * 未选择
     */
    this.UnSelect = function () {
        var obj = $X(this.Id);
        obj.getElementsByTagName('img')[0].className = 'ewa_wf_unit_img';
        this.IsSelected = false;
        EWAC_WfUtil["SELECTED"] = null;
    };
    /**
     * 选中了
     */
    this.Selected = function () {
        var obj = $X(this.Id);
        obj.getElementsByTagName('img')[0].className = 'ewa_wf_unit_img1';
        this.IsSelected = true;
        EWAC_WfUtil["SELECTED"] = this;
    };
}
function EWAC_WfCnn() {
    this.IsSelect = false;
    this.Id = null;
    this.Type = null;
    this.From = null;
    this.To = null;
    this.tagName = 'wfcnn';
    this.IsDelete = false;

    this.ChangeStyle = function (color, width) {
        var obj = $X(this.Id);
        var tds = obj.getElementsByTagName('td');
        for (var i = 0; i < tds.length; i++) {
            var td = tds[i];
            // uncomplete;
        }

    };
    this.Delete = function () {
        var obj = $X(this.Id);
        if (!this.IsDelete) {
            obj.parentNode.removeChild(obj);
        }
        this.IsDelete = true;
    }
    this._CreateObject = function (o1, o2) {
        var oo = document.createElement('div');
        oo.id = this.Id;
        oo.style.width = 10;
        oo.style.height = 10;
        oo.style.position = 'absolute';
        oo.style.zIndex = 0;
        oo.innerHTML = EWAC_WF_CNN_TMP;
        document.body.appendChild(oo);
    };

    this.Create = function (o1, o2) {
        var id = o1.Id + "G" + o2.Id;
        this.Id = id;
        this.From = o1.Id;
        this.To = o2.Id;

        o1.CnnsFrom[this.Id] = this;
        o1.CnnsFromLength++;

        o2.CnnsTo[this.Id] = this;
        o2.CnnsToLength++;

        this._CreateObject(o1, o2);

        this.Show();
    }

    this.Show = function () {
        var objLine = $X(this.Id); // html element

        var o1 = $X(this.From); // html element
        var o2 = $X(this.To); // html element

        var x1L = o1.offsetLeft; // left
        var x1R = x1L + o1.offsetWidth; // left+width
        var y1T = o1.offsetTop; // top
        var y1B = y1T + o1.offsetHeight; // top+height

        var x2L = o2.offsetLeft; // left
        var x2R = x2L + o2.offsetWidth; // left+width
        var y2T = o2.offsetTop; // top
        var y2B = y2T + o2.offsetHeight; // top+height

        var type;
        var x, y, w, h, k = 0;
        if (x1R < x2L) { // o1的右边 < o2的左边
            x = x1R;
            w = x2L - x1R;
            if (y1B < y2T) {
                y = y1B;
                h = y2T - y1B;
                type = '0T,1L,3LBA';
            } else if (y1B > y2T && y1B < y2B) { // o1比o2高 ，但有交叉
                y = y1T;
                h = y2B - y1T;
                type = '0T,1L,3LBA';
            } else if (y1T > y2B) {
                y = y2B;
                h = y1T - y2B;
                type = '2B,3L,1LTA';
            } else {
                y = y2T;
                h = y1B - y2T;
                type = '2B,3L,1LTA';
            }
            type += '第一'
        } else if (x2R < x1L) {// o2的右边 > o1的左边
            x = x2R;
            w = x1L - x2R;
            if (y1B < y2T) {
                y = y1B;
                h = y2T - y1B;
                type = '1T,0R,2RBA';
            } else if (y1B > y2T && y1B < y2B) { // o2比o1高 ，但有交叉
                y = y1T;
                h = y2B - y1T;
                type = '2BA,3L,1LT';
            } else if (y1T > y2B) {
                y = y2B;
                h = y1T - y2B;
                type = '0TA,1L,3LB(三)';
            } else {
                y = y2T;
                h = y1B - y2T;
                type = '0TA,1L,3LB(四)';
            }
            type += '第二'
        } else if (x1L > x2L && x1L < x2R) {
            x = x2R;
            w = x1R - x2R + 20;
            if (y1B < y2T) {
                y = y1B;
                h = y2T - y1B;
                k = 20;
                type = '1TR,3RB,2BA(大)';
            } else {
                y = y2B;
                h = y1T - y2B;
                k = 20;
                type = '0TA,1TR,3RB(##)';
            }
        } else {
            x = x1R;
            w = x2R - x1R + 20;
            if (y1B < y2T) {
                y = y1B;
                h = y2T - y1B;
                k = 20;
                type = '0T,1TR,3RBA(士)';
            } else {
                y = y2B;
                h = y1T - y2B;
                k = 20;
                type = '1TRA,3RB,2B(#)';
            }
        }
        if (type == null) {
            type = '未发现'
        }
        document.title = type
        this.Drawline(type, x, y, w, h, k);
        this.Disp(1);

    };

    this.Drawline = function (type, x, y, w, h, k) {
        var obj = $X(this.Id);
        if (w < 0 || h < 0) {
            return;
        }
        obj.setAttribute('type', type);
        obj.style.left = x + 'px';
        obj.style.top = y + 'px';
        obj.style.height = h + 'px';
        obj.style.width = w + 'px';
        if (w == 0 || w - k < 0) {
            return;
        }
        var cell0 = obj.childNodes[0].rows[0].cells[0];
        var cell1 = obj.childNodes[0].rows[0].cells[1];
        if (k > 0) {
            cell1.style.width = k + 'px';
            cell0.style.width = (w - k) + 'px';

        } else {
            cell1.style.width = '50%';
            cell0.style.width = '50%';
        }
    }

    this.Disp = function (width, color) {
        var o1 = $X(this.Id);
        var w = width == null ? 1 : width;

        var o1Type = o1.getAttribute("type");
        var w0 = o1.getAttribute("w");

        // 类型和宽度一致
        if (1 > 2 && o1Type == o1.childNodes[0].getAttribute("type") && w0 == w) {
            return;
        }

        o1.childNodes[0].setAttribute("type", o1Type);
        o1.childNodes[0].setAttribute("w", w0);

        // 先隐藏所有元素
        var objs = o1.getElementsByTagName('img');
        while (objs.length > 0) {
            objs[0].parentNode.removeChild(objs[0])
            objs = o1.getElementsByTagName('img');
        }
        for (var i = 0; i < objs.length; i++) {
            objs[i].style.display = 'none';
        }

        objs = o1.getElementsByTagName('td');
        for (var i = 0; i < objs.length; i++) {
            objs[i].style.border = '0px';
        }
        var colour = color == null ? '#000' : color;
        var bd = colour + ' ' + w + 'px solid';
        var td;
        var tdIdx;
        for (var i = 0; i < o1Type.length; i++) {
            var c = o1Type.substring(i, i + 1);
            if (c.trim() == "") {
                continue;
            }
            if (!isNaN(c)) { // 数字
                td = objs[c * 1];
                tdIdx = c;
            } else if (c == 'T') {
                td.style.borderTop = bd;
            } else if (c == 'L') {
                td.style.borderLeft = bd;
            } else if (c == 'R') {
                td.style.borderRight = bd;
            } else if (c == 'B') {
                td.style.borderBottom = bd;
            } else if (c == 'A') { // arrow
                var arrow;
                if (tdIdx == 3) {
                    if (td.style.borderLeftWidth != '0px') {
                        arrow = 'arraw_t00.gif';
                        td.style.textAlign = 'right';
                    } else {
                        arrow = 'arraw_t01.gif';
                        td.style.textAlign = 'left';
                    }
                } else if (tdIdx == 2) {
                    arrow = 'arraw_t01.gif';
                    td.style.textAlign = 'left';
                } else if (tdIdx == 1) {
                    if (td.style.borderLeftWidth != '0px') {
                        arrow = 'arraw_t10.gif';
                        td.style.textAlign = 'right';
                    } else {
                        arrow = 'arraw_t11.gif';
                        td.style.textAlign = 'left';
                    }
                } else {
                    arrow = 'arraw_t11.gif';
                    td.style.textAlign = 'left';
                }
                var imgSrc = EWA.RV_STATIC_PATH == null ? EWA.CP : EWA.RV_STATIC_PATH;
                imgSrc += "/EWA_STYLE/";
                td.innerHTML = '<img src="' + imgSrc + 'images/workflow/' + arrow + '" />';
            }
        }

    };

    /**
     * 未选择
     */
    this.UnSelect = function () {
        this.Disp(1);
        this.IsSelected = false;
        EWAC_WfUtil["SELECTED"] = null;
    };
    /**
     * 选中了
     */
    this.Selected = function () {
        this.Disp(3);
        this.IsSelected = true;
        EWAC_WfUtil["SELECTED"] = this;
    };
}

function EWAC_Wf() {
    this.Ids = null; // 100个 GUNID
    this._CurIdx = 0;
    this.Units = {};
    this.Cnns = {};

    this.GetUnid = function () {
        var s = this.Ids[this._CurIdx];
        this._CurIdx++;
        return s;
    }
    /**
     * 加载100个GUNIDS
     */
    this._LodIds = function () {
        var c = this;
        var u = EWA.CP + "/EWA_DEFINE/cgi-bin/xml/?TYPE=GUNID&NUM=100";
        var ajax = new EWA_AjaxClass();
        ajax.Get(u, function () {
            if (!ajax.IsRunEnd()) {
                return;
            }
            eval('c.Ids=' + ajax.GetRst());
        });
    };
    /**
     * 清除所有选择
     */
    this.ClearSelects = function () {
        for (var id in this.Units) {
            this.Units[id].UnSelect();
        }
        EWAC_WfUtil["CUR_OBJ"] = null;
        EWAC_WfUtil["TWO"] = [null, null];
    };
    this.GetUnit = function (obj) {
        var id;
        if (obj.className == 'ewa_wf_box') {
            id = obj.id;
        } else if (obj.id.indexOf('Atom_Img_') > -1) {
            id = obj.id.replace('Atom_Img_', '');
        }
        if (id) {
            return this.Units[id];
        } else {
            return null;
        }
    };
    this.CreateUnit = function (id) {
        if (!id) {
            id = this.GetUnid();
        } else {

        }
        var unit = new EWAC_WfUnit(id);
        unit.Create(this._CurIdx);
        this.Units[id] = unit;
        var obj = EWAC_WfUtil["CUR_OBJ"];
        // unit.Move(obj.offsetLeft, obj.offsetHeight);
        return unit;
    };
    this.CreateCnn = function () {
        var o1 = EWAC_WfUtil["TWO"][0];
        var o2 = EWAC_WfUtil["TWO"][1];
        if (o1 == null || o2 == null) {
            alert("需要两个业务元");
            return;
        }
        var cnn = new EWAC_WfCnn();
        cnn.Create(o1, o2);
        this.Cnns[cnn.Id] = cnn;
    };
    this.GetCnn = function (obj) {
        return this.Cnns[obj.parentNode.id];
    };

}
var EWAC_WfUtil = {};

EWAC_WfUtil["CUR_OBJ"] = null;
EWAC_WfUtil["TWO"] = [null, null];
EWAC_WfUtil["SELECTED"] = null;

EWAC_WfUtil["MouseDown"] = function (evt) {
    var e = evt ? evt : event;
    var target = EWA.B.IE ? e.srcElement : e.target;
    var tagName = target.tagName.toUpperCase();
    if (tagName == 'TD' && target.parentNode.parentNode.parentNode.id == 'Test1') {
        EWAC_WfUtil["WF"].ClearSelects();
        return;
    }
    var loc = EWA.UI.Utils.GetMousePosition(e);

    EWAC_WfUtil["M_X"] = loc.X;
    EWAC_WfUtil["M_Y"] = loc.Y;

    if (tagName == 'IMG') {
        if (target.id == 'TEMP') {
            EWAC_WfUtil["CUR_OBJ"] = target;
        } else {
            var unit = EWAC_WfUtil["WF"].GetUnit(target);
            EWAC_WfUtil["CUR_OBJ"] = unit;
            if (unit) {
                var loc = EWA.UI.Utils.GetMousePosition(e);
                // unit.Move(loc.X, loc.Y);

                EWAC_WfUtil.objSelectedDown(unit);
                EWAC_WfUtil["ShowUnitPara"](unit);
            }

        }
    } else if (tagName == 'TD') {
        var tb = target.parentNode.parentNode.parentNode;
        if (tb.getAttribute('gdx') == 'LINE') { // cnn
            var cnn = EWAC_WfUtil["WF"].GetCnn(tb);
            if (cnn.IsSelected) {
                cnn.UnSelect();
            } else {
                cnn.Selected();
            }
        }
    }

}
EWAC_WfUtil["MouseUp"] = function (evt) {
    var obj = EWAC_WfUtil["CUR_OBJ"];
    if (obj == null)
        return;

    if (obj.id == 'TEMP') { // 模板
        EWAC_WfUtil["WF"].CreateUnit();
    }
    EWAC_WfUtil["CUR_OBJ"] = null;
}
EWAC_WfUtil["MouseMove"] = function (evt) {
    var obj = EWAC_WfUtil["CUR_OBJ"];
    if (obj == null)
        return;

    var e = evt ? evt : event;
    var loc = EWA.UI.Utils.GetMousePosition(e);
    ;

    var dx = loc.X - EWAC_WfUtil["M_X"];
    var dy = loc.Y - EWAC_WfUtil["M_Y"];

    EWAC_WfUtil["M_X"] = loc.X;
    EWAC_WfUtil["M_Y"] = loc.Y;

    if (obj.tagName == 'IMG') {
        obj.style.position = 'absolute';
        obj.style.left = loc.X + 'px';
        obj.style.top = loc.Y + 'px';
    } else if (obj.tagName == 'wfunit') {
        obj.MoveTo(dx, dy);
    }
}
/**
 * 删除对象
 */
EWAC_WfUtil["Delete"] = function () {
    var obj = EWAC_WfUtil["SELECTED"];
    if (obj == null) {
        return;
    }
    if (obj.tagName.indexOf('wf') == 0) {
        obj.Delete();
        EWAC_WfUtil["TWO"] = [null, null];
        EWAC_WfUtil["SELECTED"] = null;
    }
    EWAC_WfUtil["CUR_OBJ"] = null;
}
EWAC_WfUtil["objSelectedDown"] = function (unit) {
    if (!unit.IsSelected) { // 未选择
        if (EWAC_WfUtil["TWO"][1] != null) {
            // 连个都选择了
            return;
        }
        unit.Selected();
        if (EWAC_WfUtil["TWO"][0] == null) {
            EWAC_WfUtil["TWO"][0] = unit;
        } else {
            EWAC_WfUtil["TWO"][1] = unit;
        }
    } else { // 已选择
        unit.UnSelect();
        if (EWAC_WfUtil["TWO"][0] == unit) { // 交换位置
            EWAC_WfUtil["TWO"][0] = EWAC_WfUtil["TWO"][1];
        }
        EWAC_WfUtil["TWO"][1] = null;
    }
}

EWAC_WfUtil["AtomChangeName"] = function (o1) {
    o1.contentEditable = true;
    o1.style.border = "1px solid black";
}
EWAC_WfUtil["AtomChangedName"] = function (o1) {
    o1.contentEditable = false;
    o1.style.border = '';
    // o1.innerHTML = GetInnerText(o1).trim();
    // var id = o1.parentNode.parentNode.parentNode.parentNode.sid;
    // arrayAtoms[id][2] = o1.innerText;
}

EWAC_WfUtil["AtomNameKeyPress"] = function (o1) {
    if (event.keyCode == 13) {
        AtomChangedName(o1);
    }
}
/**
 * 
 * @param {EWAC_WfUnit}
 *            unit
 */
EWAC_WfUtil["ShowUnitPara"] = function (unit) {
    return;
    // if (window.parent != window && window.parent.frames.length < 2) {
    // return;
    // }
    // var w = window.parent.frames[1];
    // w.$X('Id').innerHTML = unit.Id;
    // w.$X('Name').value = GetInnerText($X(unit.Id)).trim();
}

function Init() {
    EWAC_WfUtil["WF"] = new EWAC_Wf();
    EWAC_WfUtil["WF"]._LodIds();
}
/**
 * 
 * @param {}
 *            units 节点
 * @param {}
 *            cnns 连接
 * @param {}
 *            sts 状态
 * @param {}
 *            logic 逻辑
 * @param {}
 *            pid 父节点
 * @param {}
 *            admId 用户编号
 * @param {}
 *            deptId 部门编号
 * @param {}
 *            postId 岗位编号
 * @param {}
 *            curUnitId 当前节点
 * @param {}
 *            curLogicVal 当前值
 */
function loadWfShow(units, cnns, sts, logics, pid, admId, deptId, postId, curUnitId, curLogicVal) {
    if (_EWA_WF && _EWA_WF.EN) {
        _EWA_WF.EN1 = $J2MAP(_EWA_WF.EN, 'WF_UNIT_ID');
    }
    var div = document.createElement("div");
    div.style.position = 'absolute';
    div.style.zIndex = 123;
    div.innerHTML = "ver: " + _EWA_WF.WF_DLV_VER;
    document.body.appendChild(div);

    var wf = EWAC_WfUtil["WF"];
    var minX = 1000012;
    var minY = 1000011;
    for (var i = 0; i < units.length; i++) {
        var d1 = units[i];
        var x = d1.WF_UNIT_X;
        var y = d1.WF_UNIT_Y;
        if (x != null && x * 1 < minX) {
            minX = x * 1;
        }
        if (y != null && y * 1 < minY) {
            minY = y * 1;
        }
    }
    if (minX == 1000012) {
        minX = 0;
    }
    if (minY == 1000011) {
        minY = 0;
    }
    minX -= 10;
    minY -= 10;
    var _tmp_units = {};
    var startUnit;
    for (var i = 0; i < units.length; i++) {
        var d1 = units[i];
        wf.Ids[i] = d1.WF_UNIT_ID;
        var unit = wf.CreateUnit();
        _tmp_units[d1.WF_UNIT_ID] = unit;

        var unit_name1 = d1.WF_UNIT_NAME;
        if (EWA.LANG == 'enus' && _EWA_WF.EN1 && _EWA_WF.EN1[d1.WF_UNIT_ID] && _EWA_WF.EN1[d1.WF_UNIT_ID].WF_UNIT_NAME_EN) {
            unit_name1 = _EWA_WF.EN1[d1.WF_UNIT_ID].WF_UNIT_NAME_EN;
        }
        unit.ChangeDes(unit_name1);
        unit.ChangeType(d1.WF_UNIT_TYPE);

        // 操作人
        unit.WF_UNIT_ADM = d1.WF_UNIT_ADM;
        unit.WF_UNIT_ADM_LST = d1.WF_UNIT_ADM_LST;

        var x = d1.WF_UNIT_X;
        var y = d1.WF_UNIT_Y;
        var obj = $X(d1.WF_UNIT_ID);
        if (x != null) {
            obj.style.left = (x - minX) + 'px';
        }
        if (y != null) {
            obj.style.top = (y - minY) + 'px';
        }
    }
    // 先映射连接的From
    var cnnsMap = {};
    for (var i = 0; i < cnns.length; i++) {
        var d1 = cnns[i];
        var fromId = d1.WF_UNIT_FROM;
        if (!cnnsMap[fromId]) {
            cnnsMap[fromId] = [];
        }
        cnnsMap[fromId].push(d1);
    }

    for (var i = 0; i < cnns.length; i++) {
        var d1 = cnns[i];

        var toId = d1.WF_UNIT_TO;
        var fromId = d1.WF_UNIT_FROM;

        var o1 = wf.Units[fromId];
        var o2 = wf.Units[toId];

        var cnn = new EWAC_WfCnn();
        cnn.Create(o1, o2);
        wf.Cnns[cnn.Id] = cnn;
        if (d1.IsHaveLogic) {
            if (!d1.IsLogicOk) {
                cnn.IsStop = true;
            }
        }
    }
    for (var n in wf.Units) {
        var u = wf.Units[n];
        if (startUnit == null && u.CnnsToLength == 0) {
            // 当没有连接到节点为启动
            startUnit = u;
        }
    }
    if (startUnit == null) {
        var msg = EWA.LANG == 'enus' ? "No startup node was found, process definition error" : '未发现启动节点,流程定义错误';
        alert(msg);
        return;
    }
    if (sts.length == 0) {
        wf.CurUnit = startUnit; // 当前节点
    }
    var mapBack = []; // 回退的节点
    var map1 = {};
    for (var i = 0; i < sts.length; i++) {
        var st = sts[i];
        var tag = st.SYS_STA_TAG;
        var unit = _tmp_units[tag];
        if (unit == null) {
            continue;
        }

        var adm_name = st.ADM_NAME;
        if (EWA.LANG == 'enus' && st.ADM_NAME_EN) {
            adm_name = st.ADM_NAME_EN
        }

        unit.Log(adm_name, st.SYS_STA_CDATE, st.SYS_STA_MEMO);
        if (!map1[tag]) { // 过滤重复的节点
            map1[tag] = 1;
            mapBack.push({
                "ID": tag,
                "DES": unit.GetDes()
            });
        }
        var cnnId = st.SYS_STA_TAG + 'G' + st.SYS_STA_VAL;
        if (!EWAC_WfUtil["WF"].Cnns[cnnId]) {
            // 流程被修改了
            continue;
        }
        EWAC_WfUtil["WF"].Cnns[cnnId].Disp(3, 'blue');

        if (unit == startUnit) {
            unit.ADM_ID = st.ADM_ID;
        }
        if (i == sts.length - 1) {
            var next1 = st.SYS_STA_VAL;
            var unitNext = _tmp_units[next1];
            // 设置当前可操作用户为状态表的ID列表,原则上一致,但是当手动调整流程时进行转换
            unitNext.WF_UNIT_ADM_LST = st.ROLE_IDS;
            // 审批类型为用户定义的审批类型,原则上一致,但是当手动调整流程时进行转换
            unitNext.WF_UNIT_ADM = st.ROLE_TYPE;

            EWAC_WfUtil["WF"].CurUnit = unitNext; // 当前节点
        }
    }

    // 指定当前节点
    if (curUnitId != null && curUnitId.length > 0) {
        if (_tmp_units[curUnitId]) {
            EWAC_WfUtil["WF"].CurUnit = _tmp_units[curUnitId]
        }
    }

    EWAC_WfUtil["WF"].CurUnit.LogCur(pid);

    // 操作权限
    var canOpr = false;
    var unit = EWAC_WfUtil["WF"].CurUnit;
    // alert(startUnit.Id+','+ unit.Id)

    var ss = [];
    if (startUnit == unit) {
        canOpr = true;
    } else if (unit.WF_UNIT_ADM == 'WF_ADM_ADM') {
        var s = ',' + unit.WF_UNIT_ADM_LST + ',';
        if (s.indexOf(',' + admId + ',') >= 0) {
            canOpr = true;
        } else {
            var map2 = $J2MAP1(top.org, 'ADM_ID');
            var ids = unit.WF_UNIT_ADM_LST.split(',');

            for (var i in ids) {
                var adms = map2[ids[i]];
                for (var m in adms) {
                    ss.push(adms[m].ADM_NAME);
                }
            }

        }
    } else if (unit.WF_UNIT_ADM == 'WF_ADM_DEPT') {
        var s = ',' + unit.WF_UNIT_ADM_LST + ',';
        if (s.indexOf(',' + deptId + ',') >= 0) {
            canOpr = true;
        } else {
            var map2 = $J2MAP1(top.org, 'DEP_ID');
            var ids = unit.WF_UNIT_ADM_LST.split(',');

            for (var i in ids) {
                var adms = map2[ids[i]];
                for (var m in adms) {
                    ss.push(adms[m].ADM_NAME);
                }
            }

        }
    } else if (unit.WF_UNIT_ADM == 'WF_ADM_POST') {
        var s = ',' + unit.WF_UNIT_ADM_LST + ',';
        // 一个人拥有多个岗位
        let posts = postId.split(',');
        for (let m = 0; m < posts.length; m++) {
            if (s.indexOf(',' + posts[m] + ',') >= 0) {
                //console.log('WF_ADM_POST', "unit.WF_UNIT_ADM_LST="+unit.WF_UNIT_ADM_LST, "postId="+ postId )
                canOpr = true;
                break;
            }
        }
        if (!canOpr) {
            var map2 = $J2MAP1(top.org, 'DEP_POS_ID');
            var ids = unit.WF_UNIT_ADM_LST.split(',');
            let names = {};//避免重复
            for (var i in ids) {
                let depPostId = ids[i]
                var adms = map2[depPostId];
                for (var m in adms) {
                    let admId = adms[m];
                    if (names[admId]) { //避免重复
                        continue;
                    }
                    names[admId] = true;
                    ss.push(adms[m].ADM_NAME);
                }
            }
        }
    } else if (unit.WF_UNIT_ADM == 'WF_ADM_START') { // 启动人
        if (startUnit == unit || admId == startUnit.ADM_ID) {
            canOpr = true;
        } else {
			var map2 = $J2MAP1(top.org, 'ADM_ID');
			var adms = map2[startUnit.ADM_ID];
            for (var m in adms) {
                ss.push(adms[m].ADM_NAME);
            }
		}
    } else if (unit.WF_UNIT_ADM == 'WF_ADM_MANAGER') { // 管理者
        var startAdmId = startUnit.ADM_ID;
        if (!top && !top.ORG) {
            var msg = EWA.LANG == 'enus' ? "No organization" : "没有组织机构";
            alert(msg);
            canOpr = false;

        }
        // 本部门经理
        var master = top.ORG.GetMaster(startAdmId);
        if (master.Id == admId) {
            canOpr = true;
        } else {
            canOpr = false;
        }
    }
    if (pid && window.parent && window.parent.$X(pid)) {
        var tb = window.parent.$X(pid).parentNode.parentNode.parentNode;
        if (!canOpr) {
            if (ss.length == 0) {
                var msg = EWA.LANG == 'enus' ? "Only view" : "您只能查看";
                window.parent.$X(pid).parentNode.innerHTML = '<b>' + msg + '</b>';
            } else {
                var msg = EWA.LANG == 'enus' ? "Waitting" : "等待";
                var msg1 = EWA.LANG == 'enus' ? 'or' : "或";
                window.parent.$X(pid).parentNode.innerHTML = '<b>' + msg + ':<span style="color:blue">'
                    + ss.join('</span> ' + msg1 + ' <span style="color:blue">') + '</span></b>';
            }
            window.parent.$X('butOk').style.display = 'none';
        } else if (mapBack.length > 0) {
            var td = tb.rows[tb.rows.length - 1].cells[0];
            var back = window.parent.document.createElement('input');
            back.type = 'button';
            back.value = EWA.LANG == 'enus' ? 'Back' : '打回';
            back.onclick = function () {
                var s = window.parent.$X(pid);
                s.options.length = 1;
                for (var i = 0; i < mapBack.length; i++) {
                    var o = mapBack[i];
                    s.options[s.length] = new Option(o.DES, o.ID);
                    this.style.display = 'none';
                }
                s.parentNode.parentNode.cells[0].innerHTML = EWA.LANG == 'enus' ? '<div style="color:red">Back steps</div>'
                    : '<div style="color:red">返回步骤</div>';
            }
            td.insertBefore(back, td.getElementsByTagName('input')[1]);
        }
        var xitems = _EWA_WF.WF_SHOW;
        if(xitems){
            showControls(tb, xitems);
        }
    }
}
function showControls(tb, xitems) {

    for (var i = tb.rows.length - 5; i >= 0; i--) {
        if (tb.rows[i].id.indexOf('_ewa_tr$EWA_WF_') == 0) {
            continue;
        }
        tb.rows[i].style.display = 'none';
    }

    var ids = {};
    var isHave = false;
    for (var i = 0; i < xitems.length; i++) {
        var a = xitems[i].XITEMS.split(',');
        for (var k = 0; k < a.length; k++) {
            var id = a[k].trim();
            if (id == '') {
                continue;
            }
            if (!ids[id]) {
                ids[id] = 1;
                isHave = true;
            }
        }
    }
    if (!isHave) {
        return;
    }

    for (var n in ids) {
        var o = tb.ownerDocument.getElementById('_ewa_tr$' + n);
        if (o) {
            o.style.display = '';
        }
    }

}
function loadWf(units, cnns) {
    var wf = EWAC_WfUtil["WF"];
    var minX = 1000012;
    var minY = 1000011;
    for (var i = 0; i < units.length; i++) {
        var d1 = units[i];
        var x = d1.WF_UNIT_X;
        var y = d1.WF_UNIT_Y;
        if (x < minX) {
            minX = x;
        }
        if (y < minY) {
            minY = y;
        }

    }
    for (var i = 0; i < units.length; i++) {
        var d1 = units[i];
        wf.Ids[i] = d1.WF_UNIT_ID;
        var unit = wf.CreateUnit();
        unit.ChangeDes(d1.WF_UNIT_NAME);
        unit.ChangeType(d1.WF_UNIT_TYPE);
        var x = d1.WF_UNIT_X;
        var y = d1.WF_UNIT_Y;
        var obj = $X(d1.WF_UNIT_ID);
        if (x != null) {
            obj.style.left = x + 'px';
        }
        if (y != null) {
            obj.style.top = y + 'px';
        }
    }

    for (var i = 0; i < cnns.length; i++) {
        var d1 = cnns[i];
        var o1 = wf.Units[d1.WF_UNIT_FROM];
        var o2 = wf.Units[d1.WF_UNIT_TO];
        var cnn = new EWAC_WfCnn();
        try {
            cnn.Create(o1, o2);
            wf.Cnns[cnn.Id] = cnn;
        } catch (e) {
            alert(e)
        }
    }
}

function loadByDefined() {
    var data = window.parent._EWAC_User.WorkflowTableSet;
    var wf = EWAC_WfUtil["WF"];
    for (var i = 0; i < data.Count(); i++) {
        var d1 = data.GetItem(i);
        wf.Ids[i] = d1.Name;
        var unit = wf.CreateUnit();
        var des = d1.Tables.GetItem('descriptionset').SearchValue('lang=zhcn', 'info')
        unit.ChangeDes(des);
        var actType = d1.Tables.GetItem('WfType').GetSingleValue();
        unit.ChangeType(actType);
    }
    for (var i = 0; i < data.Count(); i++) {
        var d0 = data.GetItem(i);

        var actType = d0.Tables.GetItem('WfType').GetSingleValue();
        if (actType == 'end') {
            continue;
        }

        EWAC_WfUtil["TWO"][0] = wf.Units[d0.Name];
        var d0Act = d0.Tables.GetItem('WfAction');

        var nxt = d0Act.GetValue('WFANextYes');
        if (nxt == null || nxt == '') {
            var d1 = data.GetItem(i + 1);
            EWAC_WfUtil["TWO"][1] = wf.Units[d1.Name];
        } else {
            alert(nxt);
            EWAC_WfUtil["TWO"][1] = wf.Units[nxt];
        }
        wf.CreateCnn();
        var nxtNo = d0Act.GetValue('WFANextNo');
        if (nxtNo != null && nxtNo != '') {
            alert(nxtNo);
            EWAC_WfUtil["TWO"][1] = wf.Units[nxtNo];
        }
        wf.CreateCnn();
    }
    EWAC_WfUtil["TWO"][0] = EWAC_WfUtil["TWO"][1] = null;
}

function CreateExp() {
    var x = new EWA_XmlClass();
    x.LoadXml("<EwaWf><Units /><Cnns /><Draw /></EwaWf>");
    var rootUnits = x.GetElement("Units");
    var rootCnns = x.GetElement("Cnns");
    var tbs = document.getElementsByTagName('TABLE')
    var s = [];
    for (var i = 0; i < tbs.length; i++) {
        var tb = tbs[i];
        if (tb.id.indexOf('Atom_Table_') != 0 && tb.style.display != 'none') {
            continue;
        }
        var node = x.NewChild("Unit", rootUnits);
        node.setAttribute("Unid", tb.getAttribute("sid"));
        node.setAttribute("Type", tb.getAttribute("type"));
        node.setAttribute("Des", GetInnerText(tb).trim());

        s.push(GetOuterHTML(tb));
    }
    var divs = document.getElementsByTagName('DIV')
    for (i = 0; i < divs.length; i++) {
        var div = divs[i];
        if (div.id.indexOf('Atom_Table_') != 0) {
            continue;
        }
        var ids = div.id.split('G');
        var idFrom = ids[0].replace('Atom_Table_', '');
        var idTo = ids[1].replace('Atom_Table_', '');
        var node = x.NewChild("Cnn", rootCnns);
        node.setAttribute("Unid", div.id);
        node.setAttribute("From", idFrom);
        node.setAttribute("To", idTo);
        node.setAttribute("Logic", "");

        s.push(GetOuterHTML(div));
    }
    var rootDraw = x.GetElement("Draw");
    x.SetCData(s.join('\r\n'), rootDraw);
    alert(x.GetXml());
}

function SetAtomName(v1) {
    if (CurSelectedID == '')
        return;
    window.arrayAtoms[CurSelectedID][2] = v1;
    var o1 = $X('Atom_Table_' + CurSelectedID);
    o1.rows[1].cells[0].innerText = v1;
}

function SetAtomType(v1) {
    if (CurSelectedID == '')
        return;
    var imgSrc = EWA.RV_STATIC_PATH == null ? EWA.CP : EWA.RV_STATIC_PATH;
    imgSrc += "/EWA_STYLE/";
    window.arrayAtoms[CurSelectedID][1] = v1;
    var o1 = $X('Atom_Table_' + CurSelectedID);
    o1.type = v1;
    if (v1 == 0) {
        o1.rows[0].cells[0].childNodes[0].src = imgSrc + 'images/workflow/nulla.gif';
    } else {
        o1.rows[0].cells[0].childNodes[0].src = imgSrc + 'images/workflow/nullaico.gif';
    }
}
function loadParentInfoJson(w, fjson, tbMe) {
    var cfg = w[fjson];
    for (var n in cfg) {
        var r0 = tbMe.insertRow(0);
        var td0 = r0.insertCell(-1);
        td0.className = 'EWA_TD_L';
        var td1 = r0.insertCell(-1);
        td1.className = 'EWA_TD_M';

        var caption = cfg[n].DES;
        var text = cfg[n].VAL;

        td0.innerHTML = '<span style="color:111"><i>' + caption + "</i></span>";
        td1.innerHTML = text;
    }
}
function loadParentInfo() {
    EWA.OW.Load();
    if (!EWA.OW.PWin) {
        window.setTimeout(loadParentInfo, 300);
        return;
    }

    var tbMe;
    var objs = document.getElementsByTagName('table');
    for (var i = 0; i < objs.length; i++) {
        var o = objs[i];
        if (o.id.indexOf('EWA_FRAME_') == 0) {
            tbMe = o;
            break;
        }
    }

    if (tbMe == null) {
        return;
    }

    var p = tbMe.parentNode.parentNode;
    var h = p.offsetHeight;
    var h1 = tbMe.offsetHeight;

    var div = document.createElement("div");
    div.style.height = (h - h1) + 'px';
    div.style.overflow = 'auto';

    div.innerHTML = "<table broder=0 cellpadding=1 cellspacing=1 class=EWA_TABLE></table>";

    tbMe.parentNode.insertBefore(div, tbMe);

    tbMe = div.childNodes[0];

    var w = EWA.OW.PWin;
    var u = new EWA_UrlClass();
    u.SetUrl(window.location.href);
    var fjson = u.GetParameter("fjson");
    if (fjson != null) {
        loadParentInfoJson(w, fjson, tbMe);
        return;
    }

    if (u._Paras['COMBINE_ID']) {
        w.$('#' + u._Paras['COMBINE_ID']).find('li').each(function (idx) {
            if (idx % 2 == 0) {
                r0 = tbMe.insertRow(0);
                td0 = r0.insertCell(-1);
                td0.className = 'EWA_TD_L';
                td0.innerHTML = '<span style="color:111"><i>' + $(this).text() + "</i></span>";
            }
            if (idx % 2 == 1) {
                var td1 = r0.insertCell(-1);
                td1.className = 'EWA_TD_M';
                td1.innerHTML = $(this).text();
            }
        });
    }

    var frame;
    for (var n in w.EWA.F.FOS) {
        if (n == u.GetParameter('EWA_PARENT_FRAME')) {
            frame = w.EWA.F.FOS[n];
            break;
        }
    }
    if (!frame) {
        return;
    }

    var rows = frame.SelectCheckedRows();
    if (rows.length == 0) {
        return;
    }
    var r = rows[0];
    var rH = r.parentNode.rows[0];

    for (var i = r.cells.length - 1; i >= 0; i--) {
        if (r.cells[i].getElementsByTagName('input') > 0) {
            continue;
        }

        var caption = GetInnerText(rH.cells[i]);
        var text = GetInnerText(r.cells[i]);
        if (caption == null || caption.trim() == "" || text == null || text.trim() == "") {
            continue;
        }
        caption = caption.replace("?", "").trim();
        if (caption.trim() == text.trim()) {
            continue;
        }

        var r0 = tbMe.insertRow(0);
        var td0 = r0.insertCell(-1);
        td0.className = 'EWA_TD_L';
        var td1 = r0.insertCell(-1);
        td1.className = 'EWA_TD_M';

        td0.innerHTML = '<span style="color:111"><i>' + caption + "</i></span>";
        td1.innerHTML = text;
    }
}

function getSpJson() {
    var tb = null;
    var tbs = document.getElementsByTagName("table");
    for (var i = 0; i < tbs.length; i++) {
        if (tbs[i].id.indexOf("EWA_FRAME_") == 0) {
            tb = tbs[i];
            break;
        }
    }
    var id = "EWA_ITEMS_XML_" + tb.id.replace("EWA_FRAME_", "");

    var s = [];
    s.push("[");
    var xml = new EWA_XmlClass();
    xml.LoadXml(window[id]);
    var nl = xml.XmlDoc.getElementsByTagName("XItem");
    for (var i = 0; i < nl.length; i++) {
        if (i > 0) {
            s.push(",");
        }
        var s1 = getSpItem(nl[i]);
        var o;
        eval("o=" + s1 + "");
        if (o.TAG == "select") {
            var obj = $X(o.NAME);
            var ss = [];
            for (var k = 0; k < obj.options.length; k++) {
                var opt = obj.options[k];
                ss.push(opt.text + "gdx|z" + opt.value.replace(/"/ig, ""));
            }
            s1 = s1.replace("\"} ", "\"A\":\"" + ss.join("!@1`") + "}");
            $X("EWA_WF_UMSG").value = s1;
        }
        s.push(s1);
    }
    s.push("]");
    alert(s.join(""));

}
function getSpItem(node) {
    var tag = node.getElementsByTagName("Tag")[0].getElementsByTagName("Set")[0].getAttribute("Tag");
    var name = node.getElementsByTagName("Name")[0].getElementsByTagName("Set")[0].getAttribute("Name");
    var des = node.getElementsByTagName("DescriptionSet")[0].getElementsByTagName("Set")[0].getAttribute("Info");
    var s = "{\"TAG\":\"" + tag + "\", \"NAME\":\"" + name.replace(/"/ig, "") + "\", \"DES\":\"" + des.replace(/"/ig, "")
        + "\"} ";
    return s;
};
function EWA_DocWordClass() {
    this.docks = [];
    this.pics = [];
    this.liNum = 0;// numering.xml defined
    this.defaultFontEnglish = "Century Gothic";
    this.defaultFontChinese = "Microsoft YaHei";
    this.walker = function(obj, pNode) {
        if (obj.nodeType == 3) {
            this.walkerTxt(obj)
        } else if (obj.nodeType == 1) {
            this.walkerEle(obj)
        }
    };
    this.walkerEle = function(obj) {
        if (obj.style.display == 'none') {
            return;
        }
        var t = obj.tagName;
        var endPop = false;
        var o;
        if (t == 'LI') {
            o = this.createP(obj);
            var p = this.getDockTable();
            p.appendChild(o);
            this.docks.push(o);
            endPop = true;
            this.createLi(obj);
        } else if (t == 'BR') {
            o = this.createBr(obj);
            var p = this.getDock();
            // var o = this.createSpan(obj);
            if (p.tagName != 'w:p') { // td
                var p0 = this.createP(obj.parentNode);
                var wr = this.createSpan(obj.parentNode);
                p0.appendChild(wr);
                p0.appendChild(o);
                p.appendChild(p0);
                this.docks.push(p0);

            } else {
                p.appendChild(o);
            }
            this.lastWR = null;
        } else if (t == 'IMG') {
            var p = this.getDock();
            o = this.createPic(obj);
            if (p.tagName != 'w:p') { // td
                var p0 = this.createP(obj.parentNode);
                var wr = this.createSpan(obj.parentNode);
                p0.appendChild(wr);
                p0.appendChild(o);
                p.appendChild(p0);
                this.docks.push(p0);
                
                endPop = true; // 完成后弹出附体
                o = p0; // 交换父体 2022-01-02
            } else {
                p.appendChild(o);
            }
            this.lastWR = null;
        } else if (t == 'TABLE') {
            var prt = this.getDockTable();
            var prev = obj.previousElementSibling;
            if (prev != null && prev.tagName == "TABLE") {
                var p = this.createPVanish();
                prt.appendChild(p[0]);
            }
            o = this.createTable(obj);
            // jzp
            if (o != null) {
                endPop = true;
                prt.appendChild(o);
                this.docks.push(o);
            }
        } else if (t == 'TBODY') {
            o = this.createTbody(obj);
            this.getDock().appendChild(o);
        } else if (t == 'TR') {
            o = this.createTr(obj);
            this.getDock().appendChild(o);
            this.docks.push(o);
            endPop = true;
        } else if (t == 'TD') {
            o = this.createTd(obj);
            this.getDock().appendChild(o);
            this.docks.push(o);

            endPop = true;
        } else if (t == 'HR') {
            var p = this.getDockTable();
            o = this.createP(obj);
            var wr = this.createSpan(obj);
            o.appendChild(wr);
            var hr = this.createHr();
            wr.appendChild(hr);
            this.lastWR = null;
            p.appendChild(o);
        } else if (obj.parentNode.tagName != 'LI'
                && (t == 'H1' || t == 'H2' || t == 'H3' || t == 'P'
                        || t == 'CENTER' || t == 'DIV')) {
            var p = this.getDockTable();
            o = this.createP(obj);

            p.appendChild(o);
            this.docks.push(o);
            endPop = true;
        } else if (t == 'SCRIPT') {
            return;
        } else if (t == 'BODY' || t == 'OL' || t == 'UL') {

        } else {
            var p = this.getDock();
            o = this.createSpan(obj);
            if (p.tagName != 'w:p') { // td
                var p0 = this.createP(obj.parentNode);
                p0.appendChild(o);
                p.appendChild(p0);
                this.docks.push(p0);
            } else {
                p.appendChild(o);
            }
        }
        for (var i = 0; i < obj.childNodes.length; i++) {
            var ochild = obj.childNodes[i];
            this.walker(ochild);
        }
        if (endPop) {
            this.docksPop(o);
            this.lastWR = null;
        }
        if (t == 'TD' && o.childNodes.length == 1) {
            var p0 = this.createEle('w:p')
            o.appendChild(p0);
        } else if (t == 'TABLE' && o.nextSibling == null
                && o.parentNode.tagName == 'w:tc') {
            var p0 = this.createEle('w:p')
            o.parentNode.appendChild(p0);
        }
    }
    this.walkerTxt = function(obj) {
		let zwkg = '　'; // 中文全角空格 &#12288;
        // 如果节点值为空或者不包含中文全角空格，则不做处理
        if (obj.nodeValue.trimEx() == "" && obj.nodeValue.indexOf(zwkg) == -1) {
            this.lastWR = null;
            return;
        } 

         
        var eleTxt = this.createText(obj);
        var p = this.getDock();
        if (p.tagName != 'w:p') { // td
            var p0 = this.createP(obj.parentNode);
            var wr = this.createSpan(obj.parentNode);
            p0.appendChild(wr);
            wr.appendChild(eleTxt);

            p.appendChild(p0);
            this.docks.push(p0);
        } else {
            if (!this.lastWR) {
                var wr = this.createSpan(obj.parentNode);
                p.appendChild(wr)
            }
            this.lastWR.parentNode.appendChild(eleTxt);
        }
        this.lastWR = null;
    }
    this.createEle = function(tag) {
        var ele8 = this.doc.XmlDoc.createElement(tag);
        return ele8;
    };
    this.createEles = function(tags) {
        var tt = tags.split(',');
        var rts = [];
        for (var i = 0; i < tt.length; i++) {
            var ele8 = this.createEle(tt[i].trim());
            rts.push(ele8);
            if (i > 0) {
                rts[0].appendChild(ele8);
            }
        }
        return rts;
    };
    this.createElesLvl = function(tags) {
        var tt = tags.split(',');
        var rts = [];
        for (var i = 0; i < tt.length; i++) {
            var ele8 = this.createEle(tt[i].trim());
            rts.push(ele8);
            if (i > 0) {
                rts[i - 1].appendChild(ele8);
            }
        }
        return rts;
    };
    this.createElesSameLvl = function(tags, pNode) {
        var tt = tags.split(',');
        var rts = [];
        for (var i = 0; i < tt.length; i++) {
            var ele8 = this.createEle(tt[i].trim());
            rts.push(ele8);
            pNode.appendChild(ele8);
        }
        return rts;
    }
    this.createText = function(obj) {
		let zwkg = '　'; // 中文全角空格 &#12288;
		        // 如果节点值为空或者不包含中文全角空格，则不做处理
        if (obj.nodeValue.trim() == "" && obj.nodeValue.indexOf(zwkg) == -1) {
            return;
        }
		let v = obj.nodeValue;
		let zwkgTh = '【zwer中，wer,文_全`角=空格werwe】'; // 用于替换中文全角空格的临时字符串
        // 检查节点值中是否包含中文全角空格
        let hasZwkg = obj.nodeValue.indexOf(zwkg) >= 0;
        // 如果包含中文全角空格，则进行替换处理
        if (hasZwkg) {
            let exp1 = eval('/' + zwkg + '/g');
            v = v.replace(exp1, zwkgTh);
        }
        v = v.trim();
        // 将临时替换字符串还原为中文全角空格
        if (hasZwkg) {
            let exp = eval('/' + zwkgTh + '/g');
            v = v.replace(exp, zwkg);
        }
        var t = this.createEle("w:t");
        if (EWA.B.IE) {
            t.text = v;
        } else {
            t.textContent = v;
        }
        return t;
    };
    this.createHr = function() {
        // <w:pict w14:anchorId="0C1134BF">
        // <v:rect id="_x0000_i1037" style="width:.05pt;height:1pt"
        // o:hralign="center" o:hrstd="t"
        // o:hrnoshade="t" o:hr="t" fillcolor="black [3213]" stroked="f"/>
        // </w:pict>
        var hr = this.createElesLvl('w:pict,v:rect');
        hr[0].setAttribute('w14:anchorId', this.getParaId());
        this.setAtts(hr[1], {
            style : "width:.05pt;height:1pt",
            "o:hralign" : "center",
            "o:hrstd" : "t",
            "o:hrnoshade" : "t",
            "o:hr" : "t",
            fillcolor : "black [3213]",
            stroked : "f"
        });
        return hr[0];
    }
    this.createLi = function(obj) {
        // <w:numPr> <w:ilvl w:val="0"/> <w:numId w:val="8"/></w:numPr>
        // <w:spacing w:line="270" w:lineRule="atLeast"/>
        var numPrs = this.createEles('w:numPr,w:ilvl,w:numId');
        if (obj.parentNode.tagName == 'OL') {
            if (obj == obj.parentNode.getElementsByTagName('li')[0]) {
                this.liNum++;
            }
            numPrs[1].setAttribute('w:val', 0);
            numPrs[2].setAttribute('w:val', this.liNum);
        } else {
            numPrs[1].setAttribute('w:val', 0);
            numPrs[2].setAttribute('w:val', 22);
        }
        var wSpace = this.createEle('w:spacing');
        wSpace.setAttribute('w:line', 270);
        wSpace.setAttribute('w:lineRule', "atLeast");

        var p = this.getDock();
        p.getElementsByTagName('w:pPr')[0].appendChild(numPrs[0]);
        p.getElementsByTagName('w:pPr')[0].appendChild(wSpace);
    }
    this.createSpan = function(obj) {
        var r = this.createEle("w:r");
        var o = $(obj);
        var wrpr = this.createEle("w:rPr");

        this.lastWR = wrpr;

        r.appendChild(wrpr);
        if (o.css('color') != '') {// color
            var c = this.createEle('w:color');
            var c1 = this.rgb1(o.css('color'));
            c.setAttribute("w:val", c1);
            wrpr.appendChild(c);
        }
        if (o.css('font-family') != '') {// color
            // <w:rFonts w:ascii="宋体" w:eastAsia="宋体" w:hAnsi="宋体" w:cs="Times
            // New Roman" w:hint="eastAsia"/>
            var f = o.css('font-family').replace(/\'/ig, "").split(',');
            var c = this.createEle('w:rFonts');
            // var exp = /[a-z]/ig;
            // var f1 = (exp.test(f[0])) ? '宋体' : f[0].trim();
            var re = /[\u4E00-\u9FA5]|[\uFE30-\uFFA0]/gi;
            // var f1=(re.test(o.text()))?"宋体":"Times New Roman";
            var f1 = (re.test(o.text())) ? this.defaultFontChinese
                    : this.defaultFontEnglish;

            // var f2 = (exp.test(f[0])) ? f[0].trim() : 'Times New Roman';
            var f2 = this.defaultFontEnglish;
            this.setAtts(c, {
                "w:ascii" : f1,
                "w:eastAsia" : f1,
                "w:hAnsi" : f1,
                "w:hint" : "eastAsia",
                "w:cs" : f2
            });
            wrpr.appendChild(c);
        }
        if (o.css('font-size') != '') {// color
            var f = o.css('font-size');
            var f1 = this.fontSize(f);// <w:sz w:val="36" /><w:szCs w:val="36"
            // />
            // console.log(f1)
            if (f1 != null) {
                var c = this.createEle('w:sz');
                c.setAttribute("w:val", f1 * 2);
                wrpr.appendChild(c);

                var c1 = this.createEle('w:szCs');
                c1.setAttribute("w:val", f1 * 2);
                wrpr.appendChild(c1);
            }
        }
        var b = o.css('font-weight');
        if (o.tagName == 'B' || !(b == '' || b == 'normal' || b == '400')) {
            var c = this.createEle('w:b');
            wrpr.appendChild(c);
        }
        if (o.tagName == 'I') {
            var c = this.createEle('w:i');
            wrpr.appendChild(c);
        }

        return r;

    };
    this.createBr = function(obj) {
        var bele = this.createEle("w:r");
        var bele1 = this.createEle("w:br");
        bele.appendChild(bele1);

        return bele;
    };
    this.createTable = function(obj) {
        var bele = this.createEle("w:tbl");

        var tblPr = this.createEle("w:tblPr");
        var tblStyle = this.createEle("w:tblStyle");
        tblStyle.setAttribute("w:val", "a4");

        tblPr.appendChild(tblStyle);
        // <w:tblW w:w="8702" w:type="dxa" />
        var tbW = this.createWidth(obj, 'tblW');
        tblPr.appendChild(tbW);
        // if (this.getDockTable().tagName == 'w:body') {
        // tbW.setAttribute('w:type', 'pct'); //100%
        // tbW.setAttribute('w:w', 5000);
        // //console.log(tbW)
        // }
        obj.setAttribute('ww', tbW.getAttribute('w:w'));
        bele.appendChild(tblPr);

        return bele;
    };
    this.createTbody = function() {
        var bele = this.createEle("w:tblGrid");
        return bele;
    };
    this.createTr = function(obj) {
        var trs = this.createElesLvl("w:tr,w:trPr");
        this.setAtts(trs[0], {
            "w:rsidR" : "003D2D54",
            "w14:textId" : "77777777",
            "w14:paraId" : this.getParaId()
        });
        var h = this.createHeight(obj, 'trHeight');
        trs[1].appendChild(h);
        return trs[0];
    };
    this.paraId = 0;
    this.getParaId = function() {
        var v = "0000" + this.paraId;
        v = v.substring(v.length - 4);
        this.paraId++;
        return "F0C0" + v;
    }
    this.createTd = function(obj) {
        thisTr = obj.parentNode;
        var tb = thisTr.parentNode.parentNode;
        var vm = obj.getAttribute('vmerge');
        var refTdww = 0;
        if (vm != null && vm != '') {
            var bele = this.createEle("w:tc");
            var tcPr = this.createEle("w:tcPr");
            var vMerge = this.createEle("w:vMerge");
            tcPr.appendChild(vMerge);
            bele.appendChild(tcPr);
            this.getDock().appendChild(bele);

            var p = this.createEle('w:p');
            bele.appendChild(p);
            var refIdx = vm.split(',');
            var refTd = tb.rows[refIdx[0]].cells[refIdx[1]];
            tcPr.appendChild(this.createTdBorders(refTd));
            refTdww = refTd.getAttribute('wwtd') * 1;
        }

        var bele = this.createEle("w:tc");
        var tcPr = this.createEle("w:tcPr");
        bele.appendChild(tcPr);

        if (obj.rowSpan > 1) {
            // <w:vMerge w:val="restart" />
            var vMerge = this.createEle("w:vMerge");
            vMerge.setAttribute("w:val", "restart");
            tcPr.appendChild(vMerge);
            for (var i = 0; i < obj.rowSpan - 1; i++) {
                var tr = tb.rows[i + 1 + thisTr.rowIndex];
                if (tr) {
                    var td = tr.cells[obj.cellIndex];
                    if (td) {
                        td.setAttribute('vmerge', thisTr.rowIndex + ','
                                + obj.cellIndex);
                    }
                }

            }
        }
        if (obj.colSpan > 1) {
            // <w:gridSpan w:val="2"/>
            var colSpan = this.createEle('w:gridSpan');
            colSpan.setAttribute('w:val', obj.colSpan);
            tcPr.appendChild(colSpan);
        }
        tcPr.appendChild(this.createTdBorders(obj));

        var tcW = this.createWidth(obj, 'tcW');
        var tr = obj.parentNode;

        var trww = tr.getAttribute('wwtr');
        if (trww == null || trww == '') {
            var tb = tr.parentNode.parentNode;
            var ww = tb.getAttribute('ww');
            trww = ww;
        }
        var w = tcW.getAttribute("w:w");
        if (obj != obj.parentNode.cells[obj.parentNode.cells.length - 1]) {
            // <w:tcW w:w="2901" w:type="dxa" />
            obj.setAttribute('wwtd', w);
            var w1 = trww * 1 - w * 1 - refTdww;
            tr.setAttribute('wwtr', w1);
        } else {
            // 最后一个单元格不设置宽度
            // obj.setAttribute('wwtd', trww * 1 - refTdww);
            tcW.setAttribute("w:w", 0);
            tcW.setAttribute("w:type", "auto");
        }
        tcPr.appendChild(tcW);

        var o = $(obj);
        var vAlign = o.css("vertical-align");
        if (vAlign == 'middle') {
            // <w:vAlign w:val="bottom"/>
            var e1 = this.createEle('w:vAlign');
            e1.setAttribute('w:val', 'center');
            tcPr.appendChild(e1);
        } else if (vAlign == 'bottom') {
            var e1 = this.createEle('w:vAlign');
            e1.setAttribute('w:val', 'bottom');
            tcPr.appendChild(e1);
        }
        return bele;
    };
    this.createWidth = function(obj, tag) {
        // <w:tblW w:w="8702" w:type="dxa" />
        var e = this.createEle('w:' + tag);
        var w = $(obj).width() * 15; // px-->word width
        e.setAttribute('w:w', w);
        e.setAttribute('w:type', "dxa");
        return e;
    };
    this.createHeight = function(obj, tag) {
        // <w:trHeight w:val="10121"/>
        var e = this.createEle('w:' + tag);
        var h = $(obj).height() * 15; // px-->word width
        e.setAttribute('w:val', h);
        return e;
    };
    /*
     * <w:tcBorders> <w:top w:val="nil" /> <w:left w:val="single" w:sz="8"
     * w:space="0" w:color="000000" /> <w:bottom w:val="single" w:sz="8"
     * w:space="0" w:color="000000" /> <w:right w:val="single" w:sz="8"
     * w:space="0" w:color="000000" /> </w:tcBorders> @param {Object} obj
     */
    this.createTdBorders = function(obj) {
        var e = this.createEle('w:tcBorders');
        for (var i = 0; i < this.EWA_DocTmp.borders.length; i++) {
            var b1 = this.createBorder(obj, this.EWA_DocTmp.borders[i]);
            e.appendChild(b1);
        }
        return e;
    };
    this.createBorder = function(obj, a) {
        var v = $(obj).css('border-' + a + '-width');
        var e = this.createEle('w:' + a);
        if (v == '0px') {
            e.setAttribute('w:val', 'nil');
        } else {
            e.setAttribute('w:val', 'single');
            var c = $(obj).css('border-' + a + '-color');
            var c1 = this.rgb1(c);
            e.setAttribute('w:color', c1);
            e.setAttribute('w:sz', 6);
        }
        return e;
    };
    /**
     * 不可见的分割，用于两个紧连的表分割等
     * 
     * @param {Object}
     *            obj
     * @memberOf {TypeName}
     * @return {TypeName}
     */
    this.createPVanish = function() {
        var elep = this.createElesLvl("w:p,w:pPr,w:rPr,w:vanish");
        return elep;
    };
    this.createP = function(obj) {
        var elep = this.createEle("w:p");
        // <w:pPr>
        // <w:pStyle w:val="a7"/>
        // <w:jc w:val="left"/>
        // <w:rPr>
        // <w:rFonts w:hint="eastAsia"/>
        // </w:rPr>
        // </w:pPr>
        //
        var elepPr = this.createEle("w:pPr");
        elep.appendChild(elepPr);

        var pPrs = this.createElesSameLvl("w:pStyle,w:jc", elepPr);
        var elejc = pPrs[1];

        var al = $(obj).css('text-align');
        al = al == null ? "" : al;
        if (al.indexOf('center') >= 0) {
            elejc.setAttribute("w:val", "center");// 左对齐
        } else if (al.indexOf('right') >= 0) {
            elejc.setAttribute("w:val", "right");// 左对齐
        } else {
            elejc.setAttribute("w:val", "left");// 左对齐
        }

        var eleH = pPrs[0];
        eleH.setAttribute("w:val", "a");

        if (obj.tagName.indexOf('H') == 0) { // head
            eleH.setAttribute("w:val", obj.tagName.replace('H', ''));
        }
        var f = this.createElesLvl("w:rFonts", pPrs[2])[0];
        f.setAttribute("w:hint", "eastAsia");
        this.lastWR = null;

        this.setAtts(elep, {
            "w:rsidR" : "003D2D54",
            "w14:textId" : "77777777",
            "w14:paraId" : this.getParaId(),
            "w:rsidRDefault" : "0057281A"
        });
        return elep;
    };
    /**
     * <w:r> <w:rPr> <w:rFonts w:hint="eastAsia"/> <w:noProof/> </w:rPr>
     * <w:drawing> <wp:inline distT="0" distB="0" distL="0" distR="0"
     * wp14:anchorId="271B1DC6" wp14:editId="7E056E7F"> <wp:extent cx="358820"
     * cy="360000"/> <wp:effectExtent l="0" t="0" r="0" b="0"/> <wp:docPr id="1"
     * name="图片 1"/> <wp:cNvGraphicFramePr> <a:graphicFrameLocks
     * xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
     * noChangeAspect="1"/> </wp:cNvGraphicFramePr> <a:graphic
     * xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
     * <a:graphicData
     * uri="http://schemas.openxmlformats.org/drawingml/2006/picture"> <pic:pic
     * xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
     * <pic:nvPicPr> <pic:cNvPr id="0" name="1.gif"/> <pic:cNvPicPr/>
     * </pic:nvPicPr> <pic:blipFill rotWithShape="1"> <a:blip r:embed="rId8">
     * <a:extLst> <a:ext uri="{28A0092B-C50C-407E-A947-70E740481C1C}">
     * <a14:useLocalDpi
     * xmlns:a14="http://schemas.microsoft.com/office/drawing/2010/main"
     * val="0"/> </a:ext> </a:extLst> </a:blip> <a:srcRect l="-301" t="-466"
     * r="-301" b="-466"/> <a:stretch/> </pic:blipFill> <pic:spPr bwMode="auto">
     * <a:xfrm> <a:off x="0" y="0"/> <a:ext cx="362156" cy="363346"/> </a:xfrm>
     * <a:prstGeom prst="rect"> <a:avLst/> </a:prstGeom> <a:ln> <a:noFill/>
     * </a:ln> <a:extLst> <a:ext uri="{53640926-AAD7-44d8-BBD7-CCE9431645EC}">
     * <a14:shadowObscured
     * xmlns:a14="http://schemas.microsoft.com/office/drawing/2010/main"/>
     * </a:ext> </a:extLst> </pic:spPr> </pic:pic> </a:graphicData> </a:graphic>
     * </wp:inline> </w:drawing> </w:r>
     * 
     * @param {Object}
     *            obj
     * @memberOf {TypeName}
     */
    this.createPic = function(obj) {
        var o = $(obj);
        var picName = obj.src;
        this.pics.push(obj.src);

        var idx = picName.lastIndexOf('/');
        picName = picName.substring(idx + 1);
        var emuX = this.px2emu(o.width());
        var emuY = this.px2emu(o.height());

        var rs = this.createElesLvl("w:r,w:rPr,w:noProof");
        var wr = rs[0];
        var wdraws = this.createElesLvl("w:drawing,wp:inline,wp:extent");
        wr.appendChild(wdraws[0]);
        wExtent = wdraws[2];
        this.setAtts(wExtent, {
            'cx' : emuX,
            'cy' : emuY
        });

        var wpInline = wdraws[1];
        this.setAtts(wpInline, {
            distT : "0",
            distB : "0",
            distL : "0",
            distR : "0"
        });
        var eles = this.createElesSameLvl(
                'wp:effectExtent,wp:docPr,wp:cNvGraphicFramePr', wpInline);
        this.setAtts(eles[0], {
            l : "0",
            t : "0",
            r : "0",
            b : "0"
        });
        this.setAtts(eles[1], {
            id : "0",
            name : picName
        });
        var a_graphicFrameLocks = this.createEleNs('a:graphicFrameLocks',
                'http://schemas.openxmlformats.org/drawingml/2006/main');
        eles[2].appendChild(a_graphicFrameLocks);
        this.setAtts(a_graphicFrameLocks, {
            noChangeAspect : 1
        });
        // <a:graphic
        // xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
        // <a:graphicData
        // uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
        // <pic:pic
        // xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">

        var a_graphic = this.createEleNs('a:graphic',
                "http://schemas.openxmlformats.org/drawingml/2006/main");
        var a_graphicData = this.createEle('a:graphicData');
        a_graphicData.setAttribute('uri',
                "http://schemas.openxmlformats.org/drawingml/2006/picture");
        var pic_pic = this.createEleNs('pic:pic',
                "http://schemas.openxmlformats.org/drawingml/2006/picture");
        a_graphic.appendChild(a_graphicData);
        a_graphicData.appendChild(pic_pic);
        wpInline.appendChild(a_graphic);

        var pics = this.createElesSameLvl('pic:nvPicPr,pic:blipFill,pic:spPr',
                pic_pic);
        this.setAtts(pics[1], {
            'rotWithShape' : "1"
        });
        this.setAtts(pics[2], {
            'bwMode' : "auto"
        });
        // <pic:nvPicPr>
        // <pic:cNvPr id="0" name="1.gif"/>
        // <pic:cNvPicPr/>
        var nvPicPrs = this
                .createElesSameLvl('pic:cNvPr,pic:cNvPicPr', pics[0]);
        this.setAtts(nvPicPrs[0], {
            id : "0",
            name : picName
        });
        // <a:blip r:embed="rId8">
        // <a:extLst>
        // <a:ext uri="{28A0092B-C50C-407E-A947-70E740481C1C}">
        // <a14:useLocalDpi
        // xmlns:a14="http://schemas.microsoft.com/office/drawing/2010/main"
        // val="0"/>
        // </a:ext>
        // </a:extLst>
        // </a:blip>
        // <a:srcRect l="-301" t="-466" r="-301" b="-466"/>
        // <a:stretch/>
        var pic_blipFills = this.createElesSameLvl(
                'a:blip,a:srcRect,a:stretch', pics[1]);
        this.setAtts(pic_blipFills[0], {
            'r:embed' : "pic" + (this.pics.length - 1)
        });
        this.setAtts(pic_blipFills[1], {
            l : "0",
            t : "0",
            r : "0",
            b : "0"
        });
        var a_extLsts = this.createEles('a:extLst,a:ext');
        pic_blipFills[0].appendChild(a_extLsts[0]);
        a_extLsts[1].setAttribute('uri',
                "{28A0092B-C50C-407E-A947-70E740481C1C}");

        var a14_useLocalDpi = this.createEleNs('a14:useLocalDpi',
                'http://schemas.microsoft.com/office/drawing/2010/main');
        a14_useLocalDpi.setAttribute('val', 0);
        a_extLsts[1].appendChild(a14_useLocalDpi);
        // <a:xfrm>
        // <a:off x="0" y="0"/>
        // <a:ext cx="362156" cy="363346"/>
        // </a:xfrm>
        // <a:prstGeom prst="rect">
        // <a:avLst/>
        // </a:prstGeom>
        // <a:ln>
        // <a:noFill/>
        // </a:ln>
        // <a:extLst>
        // <a:ext uri="{53640926-AAD7-44d8-BBD7-CCE9431645EC}">
        // <a14:shadowObscured
        // xmlns:a14="http://schemas.microsoft.com/office/drawing/2010/main"/>
        // </a:ext>
        // </a:extLst>

        var pic_spPrs = this.createElesSameLvl(
                'a:xfrm,a:prstGeom,a:ln,a:extLst', pics[2]);
        this.setAtts(pic_spPrs[1], {
            prst : "rect"
        });
        var axfrms = this.createElesSameLvl('a:off,a:ext', pic_spPrs[0]);
        this.setAtts(axfrms[0], {
            x : 0,
            y : 0
        });
        this.setAtts(axfrms[1], {
            cx : emuX,
            cy : emuY
        });
        this.createElesSameLvl('a:avLst', pic_spPrs[1]);
        this.createElesSameLvl('a:noFill', pic_spPrs[2]);
        // var a_ext = this.createElesSameLvl('a:ext', pic_spPrs[3])[0];
        // a_ext.setAttribute('uri', '{53640926-AAD7-44d8-BBD7-CCE9431645EC}');
        // var a14_shadowObscured = this.createEleNs("a14:shadowObscured",
        // "http://schemas.microsoft.com/office/drawing/2010/main");
        // a_ext.appendChild(a14_shadowObscured);

        return wr;
    };
    this.createEleNs = function(tag, ns) {
        var ele8 = this.doc.XmlDoc.createElementNS(ns, tag);
        return ele8;
    }
    this.setAtts = function(node, params) {
        for ( var n in params) {
            node.setAttribute(n, params[n]);
        }
    }
    this.fontSize = function(f) {

        if (f.indexOf('px') > 0) {
            var f0 = this.EWA_DocTmp.f[f];
            if (f0 == null) {
                f = '9pt';
            } else {
                f = f0;
            }

        }

        var f1 = f.replace('pt', '');
        return f1;
    };
    this.rgb1 = function(s1) {
        var s = s1.replace('rgb(', '').replace(')', '');
        var ss = s.split(',');
        return this.rgb(ss[0] * 1, ss[1] * 1, ss[2] * 1).toUpperCase();
    };
    this.rgb = function(r, g, b) {
        var r1 = r.toString(16);
        var g1 = g.toString(16);
        var b1 = b.toString(16);
        return (r1.length < 2 ? "0" : "") + r1 + (g1.length < 2 ? "0" : "")
                + g1 + (b1.length < 2 ? "0" : "") + b1;
    };

    this.init = function() {
        this.doc = new EWA_XmlClass();
        this.doc.LoadXml(this.EWA_DocTmp.document);
        if (EWA.B.IE) {
            this.docks.push(this.doc.XmlDoc.getElementsByTagName('w:body')[0]);
        } else {
            this.docks.push(this.doc.XmlDoc.childNodes[0].childNodes[0]);
        }
    };
    this.getDock = function() {
        return this.docks[this.docks.length - 1];
    };
    this.idx = 0
    this.docksPop = function(o) {
        while (1 == 1) {
            if (this.docks.length == 1) {
                break;
            }
            var o1 = this.docks.pop();
            if (o1 == o) {
                // console.log(this.docks);
                break;
            }
        }
    };
    this.getDockTable = function() {
        for (var i = this.docks.length - 1; i >= 0; i--) {
            var o = this.docks[i];
            if (o.tagName == 'w:body' || o.tagName == 'w:tc') {
                return o;
            }
        }
    };
    /**
     * 包括英制单位（914,400 个 EMU 单位为 1 英寸）
     * 
     * @param {Object}
     *            v
     * @return {TypeName}
     */
    this.px2emu = function(v) {
        return parseInt(v / 96 * 914400);
    }
    this.EWA_DocTmp = {
        document : '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
                + '<w:document'
                + '				xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas"'
                + '				xmlns:mo="http://schemas.microsoft.com/office/mac/office/2008/main"'
                + '				xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"'
                + '				xmlns:mv="urn:schemas-microsoft-com:mac:vml" xmlns:o="urn:schemas-microsoft-com:office:office"'
                + '				xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"'
                + '				xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"'
                + '				xmlns:v="urn:schemas-microsoft-com:vml"'
                + '				xmlns:wp14="http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing"'
                + '				xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"'
                + '				xmlns:w10="urn:schemas-microsoft-com:office:word"'
                + '				xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"'
                + '				xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml"'
                + '				xmlns:wpg="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup"'
                + '				xmlns:wpi="http://schemas.microsoft.com/office/word/2010/wordprocessingInk"'
                + '				xmlns:wne="http://schemas.microsoft.com/office/word/2006/wordml"'
                + '				xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape"'
                + '				mc:Ignorable="w14 wp14"><w:body></w:body></w:document>',
        r : '<w:r w:rsidR="00A0061C" w:rsidRPr="00A0061C"><w:rPr>'
                + '<w:rFonts w:ascii="[FONT]" w:eastAsia="[FONT]" w:hAnsi="[FONT]" w:hint="eastAsia" />'
                + '<w:b /><w:i /><w:color w:val="FF0000" />'
                + '<w:sz w:val="36" /><w:szCs w:val="36" />'
                + '<w:u w:val="single" /></w:rPr><w:t>看看</w:t></w:r>',
        f : {
            "9px" : "7pt",
            "10px" : "7.5pt",
            "11px" : "8.5pt",
            "12px" : "9pt",
            "13px" : "10pt",
            "14px" : "10.5pt",
            "15px" : "11.5pt",
            "16px" : "12pt",
            "17px" : "13pt",
            "18px" : "13.5pt",
            "19px" : "14.5pt",
            "20px" : "15pt",
            "21px" : "16pt",
            "22px" : "16.5pt",
            "23px" : "17.5pt",
            "24px" : "18pt",
            "25px" : "19pt",
            "26px" : "19.5pt",
            "27px" : "20.5pt",
            "28px" : "21pt",
            "29px" : "22pt",
            "30px" : "22.5pt",
            "31px" : "23.5pt",
            "32px" : "24pt",
            "33px" : "25pt",
            "34px" : "25.5pt",
            "35px" : "26.5pt",
            "36px" : "27pt",
            "37px" : "28pt",
            "38px" : "28.5pt",
            "39px" : "29.5pt",
            "40px" : "30pt",
            "41px" : "31pt",
            "42px" : "31.5pt",
            "43px" : "32.5pt",
            "44px" : "33pt",
            "45px" : "34pt",
            "46px" : "34.5pt",
            "47px" : "35.5pt",
            "48px" : "36pt",
            "49px" : "37pt",
            "50px" : "37.5pt",
            "51px" : "38.5pt",
            "52px" : "39pt",
            "53px" : "40pt",
            "54px" : "40.5pt",
            "55px" : "41.5pt",
            "56px" : "42pt",
            "57px" : "43pt",
            "58px" : "43.5pt",
            "59px" : "44.5pt",
            "60px" : "45pt",
            "61px" : "46pt",
            "62px" : "46.5pt",
            "63px" : "47.5pt",
            "64px" : "48pt",
            "65px" : "49pt",
            "66px" : "49.5pt",
            "67px" : "50.5pt",
            "68px" : "51pt",
            "69px" : "52pt",
            "70px" : "52.5pt",
            "71px" : "53.5pt",
            "72px" : "54pt",
            "73px" : "55pt",
            "74px" : "55.5pt",
            "75px" : "56.5pt",
            "76px" : "57pt",
            "77px" : "58pt",
            "78px" : "58.5pt",
            "79px" : "59.5pt",
            "80px" : "60pt",
            "81px" : "61pt",
            "82px" : "61.5pt",
            "83px" : "62.5pt",
            "84px" : "63pt",
            "85px" : "64pt",
            "86px" : "64.5pt",
            "87px" : "65.5pt",
            "88px" : "66pt",
            "89px" : "67pt",
            "90px" : "67.5pt",
            "91px" : "68.5pt",
            "92px" : "69pt",
            "93px" : "70pt",
            "94px" : "70.5pt",
            "95px" : "71.5pt",
            "96px" : "72pt",
            "97px" : "73pt",
            "98px" : "73.5pt",
            "99px" : "74.5pt"
        },
        borders : [ 'top', 'bottom', 'right', 'left' ]
    };
    this.postData = function() {
        var data = {
            xml : this.xml(),
            pics : this.pics.join(','),
            ols : this.liNum
        };
        return data;
    }
    this.init();
    this.xml = function() {
        return this.doc.GetXml();
    };
};
// var word = new EWA_DocWordClass();
// word.walker(oo);
// word.xml();
;
function EWA_OdtDocWordClass() {
    this.docks = [];
    this.pics = [];
    this.liNum = 0;// numering.xml defined
    this.start = false;
    this.defaultFontEnglish = "Century Gothic";
    this.defaultFontChinese = "Microsoft YaHei";
    this.walker = function (obj) {

        this.fixTable();
        this.walker1(obj);
        this.unFixTable();
    };
    this.walker1 = function (obj) {

        if (obj.nodeType == 3) {
            this.walkerTxt(obj)
        } else if (obj.nodeType == 1) {
            this.walkerEle(obj)
        }
    };
    this.walkerEle = function (obj) {
        if (obj.style.display == 'none') {
            return;
        }
        if (obj.id == 'pp' && obj.tagName == 'CENTER') {
            console.log("skip->", obj.outerHTML);
            return;
        }
        var t = obj.tagName;
        var endPop = false;
        var o;
        if (t == 'DIV' && (obj.className.indexOf('page-next-before') >= 0 || obj.className
            .indexOf('page-next-after') >= 0)) {
            // 分页符号
            o = this.createBreak();
            var p = this.docks[0];
            console.log('break', o)
            p.appendChild(o);
            endPop = true;
        } else if (t == 'UL' || t == 'OL') {
            o = this.createUl(obj);
            var p = this.getDockTable();
            p.appendChild(o);
            this.docks.push(o);
            endPop = true;
        } else if (t == 'LI') {
            o = this.createLi(obj);
            var p = this.getDock();
            p.appendChild(o);
            this.docks.push(o);
            endPop = true;
        } else if (t == 'BR') {
            o = this.createBr(obj);
            var p = this.getDock();
            if (p.tagName != 'text:p') { // td
                var p0 = this.createP(obj.parentNode);
                this.docks.push(p0);
                p0.appendChild(o);
            } else {
                p.appendChild(o);
            }
            this.lastWR = null;
        } else if (t == 'IMG') {
            var p = this.getDock();
            console.log(p);
            o = this.createPic(obj);
            if (p.tagName != 'text:p') { // td
                var p0 = this.createP(obj.parentNode);
                p0.appendChild(o);
                p.appendChild(p0);
                this.docks.push(p0);
                endPop = true;
                o = p0; // 交换父体 2022-01-02
            } else {
                p.appendChild(o);
            }
            this.lastWR = null;
        } else if (t == 'TABLE') {
            var prt = this.getDockTable();
            o = this.createTable(obj);
            endPop = true;
            prt.appendChild(o);
            this.docks.push(o);
        } else if (t == 'TBODY') {

        } else if (t == 'TR') {
            o = this.createTr(obj);
            this.getDock().appendChild(o);
            this.docks.push(o);
            endPop = true;
        } else if (t == 'TD') {
            o = this.createTd(obj);
            this.getDock().appendChild(o);
            if (o.tagName == 'table:covered-table-cell') {
                return;
            }
            this.docks.push(o);

            endPop = true;
        } else if (t == 'HR') {
            var p = this.getDockTable();
            o = this.createP(obj);
            var wr = this.createSpan(obj);
            o.appendChild(wr);
            var hr = this.createHr();
            wr.appendChild(hr);
            this.lastWR = null;
            p.appendChild(o);
        } else if (t == 'H1' || t == 'H2' || t == 'H3' || t == 'P'
            || t == 'CENTER' || t == 'DIV') {
            var p = this.getDockTable();
            o = this.createP(obj);

            p.appendChild(o);
            this.docks.push(o);
            endPop = true;
        } else if (t == 'SCRIPT') {
            return;
        }// else if (t == 'BODY' || t == 'OL' || t == 'UL') {

        // } else {

        // }
        for (var i = 0; i < obj.childNodes.length; i++) {
            var ochild = obj.childNodes[i];
            this.walker1(ochild);
        }
        if (endPop) {
            this.docksPop(o);
            this.lastWR = null;
        }
    };
    /**
     * 遍历文本节点并处理其中的中文全角空格
     * @param {Object} obj - 文本节点对象
     */
    this.walkerTxt = function (obj) {
        let zwkg = '　'; // 中文全角空格 &#12288;
        // 如果节点值为空或者不包含中文全角空格，则不做处理
        if (obj.nodeValue.trimEx() == "" && obj.nodeValue.indexOf(zwkg) == -1) {
            this.lastWR = null;
            return;
        } 

        // 创建一个span元素用于包裹处理后的文本
        var eleTxt = this.createSpan(obj.parentNode);
        // 将节点值中的普通空格替换为标准空格
        var v = obj.nodeValue.replace(/ /ig, ' ');

        // 如果父节点是TD或P标签，则去除文本首尾的空格
        if (obj.parentNode.tagName == 'TD' || obj.parentNode.tagName == 'P') {
            let zwkgTh = '【zwer中，wer,文_全`角=空格werwe】'; // 用于替换中文全角空格的临时字符串
            // 检查节点值中是否包含中文全角空格
            let hasZwkg = obj.nodeValue.indexOf(zwkg) >= 0;
            // 如果包含中文全角空格，则进行替换处理
            if (hasZwkg) {

                let exp1 = eval('/' + zwkg + '/g');
                v = v.replace(exp1, zwkgTh);
            }
            v = v.trim();
            // 将临时替换字符串还原为中文全角空格
            if (hasZwkg) {
                let exp = eval('/' + zwkgTh + '/g');
                v = v.replace(exp, zwkg);
            }
        }

        // 根据浏览器类型设置文本内容
        if (EWA.B.IE) {
            eleTxt.text = v;
        } else {
            eleTxt.textContent = v;
        }

        // 获取当前节点的父级P元素
        var p = this.getDock();

        // 如果父级不是P元素，则创建一个新的P元素并添加到文档中
        if (p.tagName != 'text:p') {
            var p0 = this.createP(obj.parentNode);
            p0.appendChild(eleTxt);
            p.appendChild(p0);
            this.docks.push(p0);
        } else {
            // 如果父级已经是P元素，则直接添加到文档中
            p.appendChild(eleTxt);
        }
    };

    this.fixTable = function () {
        var objs = $('td[colspan]').toArray();
        for (var m = 0; m < objs.length; m++) {
            var o = objs[m];
            var tr = o.parentNode;
            var a = o.colSpan;
            o.setAttribute('m_colspan', a);
            for (var i = 0; i < a - 1; i++) {
                var td = tr.insertCell(o.cellIndex + i + 1);
                td.innerHTML = i;
                td.bgColor = 'blue';
                td.className = 'colspan';
                td.setAttribute('fixed', '1');
                td.style.display = 'none';
            }
            // o.colSpan = "";
        }

        $('td[rowspan]').each(
            function () {
                var a = this.rowSpan;
                var tr = this.parentNode;
                var tb = tr.parentNode.parentNode;
                for (var i = 0; i < a - 1; i++) {
                    var td = tb.rows[tr.rowIndex + i + 1]
                        .insertCell(this.cellIndex);
                    td.innerHTML = i;
                    td.bgColor = 'green';
                    td.className = 'rowspan';
                    td.setAttribute('fixed', '1');
                }
                $(this).attr('m_rowspan', a);
                this.rowSpan = "";
            });

    };
    this.unFixTable = function () {
        $('td[fixed]').each(function () {
            this.parentNode.removeChild(this);
        });
        $('td[m_colspan]').each(function () {
            this.colSpan = this.getAttribute('m_colspan');
        });
        $('td[m_rowspan]').each(function () {
            this.rowSpan = this.getAttribute('m_rowspan');
        });
    }
    this.createEle = function (tag) {
        var ele8 = this.doc.XmlDoc.createElement(tag);
        return ele8;
    };
    this.createEles = function (tags) {
        var tt = tags.split(',');
        var rts = [];
        for (var i = 0; i < tt.length; i++) {
            var ele8 = this.createEle(tt[i].trim());
            rts.push(ele8);
            if (i > 0) {
                rts[0].appendChild(ele8);
            }
        }
        return rts;
    };
    this.createElesLvl = function (tags) {
        var tt = tags.split(',');
        var rts = [];
        for (var i = 0; i < tt.length; i++) {
            var ele8 = this.createEle(tt[i].trim());
            rts.push(ele8);
            if (i > 0) {
                rts[i - 1].appendChild(ele8);
            }
        }
        return rts;
    };
    this.createElesSameLvl = function (tags, pNode) {
        var tt = tags.split(',');
        var rts = [];
        for (var i = 0; i < tt.length; i++) {
            var ele8 = this.createEle(tt[i].trim());
            rts.push(ele8);
            pNode.appendChild(ele8);
        }
        return rts;
    }

    this.createHr = function () {
        // <w:pict w14:anchorId="0C1134BF">
        // <v:rect id="_x0000_i1037" style="width:.05pt;height:1pt"
        // o:hralign="center" o:hrstd="t"
        // o:hrnoshade="t" o:hr="t" fillcolor="black [3213]" stroked="f"/>
        // </w:pict>
        var hr = this.createElesLvl('w:pict,v:rect');
        hr[0].setAttribute('w14:anchorId', this.getParaId());
        this.setAtts(hr[1], {
            style: "width:.05pt;height:1pt",
            "o:hralign": "center",
            "o:hrstd": "t",
            "o:hrnoshade": "t",
            "o:hr": "t",
            fillcolor: "black [3213]",
            stroked: "f"
        });
        return hr[0];
    };
    this.createUl = function (obj) {
        // <text:list xml:id="list6985372980825310444" text:style-name="L1">
        var ul = this.createEle('text:list');
        var stName = obj.tagName == 'OL' ? 'L1' : 'L2';
        ul.setAttribute('text:style-name', stName);
        return ul;
    }
    this.createLi = function (obj) {
        var li = this.createEle('text:list-item');
        return li;
    };
    this.createStyle = function (obj) {
        // <style:style style:name="P5" style:family="paragraph"
        // style:parent-style-name="Standard">
        // <style:paragraph-properties fo:text-align="end"
        // style:justify-single-word="false"/>
        // <style:text-properties style:font-name="黑体" fo:font-size="16pt"
        // style:font-name-asian="黑体" style:font-size-asian="16pt"
        // style:font-size-complex="16pt"/>
        // </style:style>
        var st = this.createEle("style:style");
        st.setAttribute('style:family', "text");
        var o = $(obj);

        // font family && font size
        var tp = this.createEle("style:text-properties");
        st.appendChild(tp);

        if (o.css('font-family') != '') {// color
            var fontlist = o.css('font-family').replace(/\'/ig, "").split(',');

            var f1 = this.defaultFontEnglish;
            var f2 = this.defaultFontChinese;
            var fs = this.fontSize(o.css('font-size'));
            var css = {
                "style:font-name": f1,
                "style:font-name-asian": f2,
                "fo:font-size": fs,
                "style:font-size-complex": fs,
                "style:font-size-asian": fs
            }
            this.setAtts(tp, css);
        }

        if (o.css('color') != '') {// color
            var c1 = '#' + this.rgb1(o.css('color')).toLowerCase();
            tp.setAttribute("fo:color", c1);
        }
        var b = o.css('font-weight');
        if (o.tagName == 'B' || !(b == '' || b == 'normal' || b == '400')) {
            tp.setAttribute("fo:font-weight", "bold");
            tp.setAttribute("style:font-weight-complex", "bold");
            tp.setAttribute("style:font-weight-asian", "bold");
        }
        if (o.tagName == 'I') {
            tp.setAttribute("fo:font-style", "italic");
            tp.setAttribute("style:font-style-complex", "italic");
            tp.setAttribute("style:font-style-asian", "italic")
        }
        return this.checkExistsStyle(st);
    };
    this.createStyleBreak = function () {
        /*
         * <style:style style:name="P1" style:family="paragraph"
         * style:parent-style-name="Standard"> <style:paragraph-properties
         * fo:break-before="page" /> </style:style>
         */
        var st = this.createEle("style:style");
        st.setAttribute('style:family', "paragraph");
        var stpp = this.createEle("style:paragraph-properties");
        st.appendChild(stpp);
        this.setAtts(stpp, {
            "fo:break-before": "page"
        });
        return this.checkExistsStyle(st);
    };
    this.createStyleP = function (obj) {
        // <style:style style:name="P5" style:family="paragraph"
        // style:parent-style-name="Standard">
        // <style:paragraph-properties fo:text-align="end"
        // style:justify-single-word="false" fo:margin-left="1.482cm"
        // fo:margin-right="0cm" fo:line-height="150%"/>
        // </style:style>
        var st = this.createEle("style:style");
        st.setAttribute('style:family', "paragraph");
        var stpp = this.createEle("style:paragraph-properties");
        st.appendChild(stpp);
        var o = $(obj);
        var al = o.css('text-align');
        al = al == null ? "" : al;
        if (al.indexOf('center') >= 0) {
            al = "center";// 左对齐
        } else if (al.indexOf('right') >= 0) {
            al = "end";// 左对齐
        } else {
            al = "";
        }
        // align
        if (al != "") {
            this.setAtts(stpp, {
                "fo:text-align": al
            });
        }
        var ml = o.css('margin-left').replace('px', '');
        var mr = o.css('margin-right').replace('px', '');

        var mlcm = this.px2cm(ml) + 'cm';
        var mrcm = this.px2cm(mr) + 'cm';

        this.setAtts(stpp, {
            "fo:margin-left": mlcm,
            "fo:margin-right": mrcm,
            "fo:text-indent": "0cm",
            "style:justify-single-word": "false"
        });
        // var mt = o.css('margin-top').replace('px', '');
        // var mb = o.css('margin-bottom').replace('px', '');
        // var lh = o.css('font-size').replace('px', '');
        // var lh1 = ((mt * 1.0 + mb * 1 + lh * 1) / lh -1)* 100;
        // this.setAtts(stpp, {
        // "fo:margin-left" : mlcm,
        // "fo:margin-right" : mrcm,
        // "fo:line-height" : lh1 + "%"
        // });
        return this.checkExistsStyle(st);
    };
    /**
     * 字体是否已经存在
     * 
     * @param {Object}
     *            st
     * @memberOf {TypeName}
     * @return {TypeName}
     */
    this.checkExistsStyle = function (st) {
        var s = st.outerHTML;
        if (this.fontMap[s]) {
            return this.fontMap[s];
        }
        var stName = this.getStyleName();
        this.setAtts(st, {
            "style:name": stName
        });
        this.fontMap[s] = stName;
        var parent = this.doc.XmlDoc.getElementsByTagName("automatic-styles");
        if (parent.length == 0) {// chrome 60+
            parent = this.doc.XmlDoc
                .getElementsByTagName("office:automatic-styles");
        }
        parent[0].appendChild(st);
        return stName;
    }
    this.createStyleTd = function (obj) {
        // <style:style style:name="表格1.A1" style:family="table-cell"
        // style:data-style-name="N0">
        // <style:table-cell-properties fo:padding="0.097cm"
        // fo:border-left="0.002cm solid #000000"
        // style:vertical-align="middle" fo:background-color="transparent"
        // fo:border-right="none" fo:border-top="0.002cm solid #000000"
        // fo:border-bottom="0.002cm solid #000000"/>
        // </style:style>
        var st = this.createEle("style:style");
        this.setAtts(st, {
            "style:family": "table-cell",
            "style:data-style-name": "NO"
        });
        var stpp = this.createEle("style:table-cell-properties");
        st.appendChild(stpp);
        this.setAtts(stpp, {
            "fo:background-color": "transparent",
            "fo:padding": "0.097cm"
        });
        for (var i = 0; i < this.EWA_DocTmp.borders.length; i++) {
            var n = this.EWA_DocTmp.borders[i];
            var b1 = this.createBorder(obj, n);
            stpp.setAttribute("fo:border-" + n, b1);
        }
        var o = $(obj);
        var vAlign = o.css("vertical-align");
        if (vAlign == 'middle') {
            stpp.setAttribute('style:vertical-align', 'middle');
        } else if (vAlign == 'bottom') {
            stpp.setAttribute('style:vertical-align', 'bottom');
        }
        return this.checkExistsStyle(st);
    };
    this.createStyleCol = function (obj) {
        // <style:style style:name="表格1.A" style:family="table-column">
        // <style:table-column-properties style:column-width="8.498cm"/>
        // </style:style>
        var st = this.createEle("style:style");
        this.setAtts(st, {
            "style:family": "table-column"
        });
        var stpp = this.createEle("style:table-column-properties");
        st.appendChild(stpp);
        var w = $(obj).width();
        var w1 = this.px2cm(w);
        stpp.setAttribute('style:column-width', w1 + 'cm');
        var st1 = this.checkExistsStyle(st);
        // console.log(st)
        return st1;
    };
    this.createStyleTable = function (obj) {
        //
        // <style:style style:name="表格1" style:family="table">
        // <style:table-properties style:width="17cm" table:align="center"
        // style:shadow="none"/>
        // </style:style>
        var st = this.createEle("style:style");
        this.setAtts(st, {
            "style:family": "table"
        });
        var stpp = this.createEle("style:table-properties");
        st.appendChild(stpp);
        var w = $(obj).width();
        var w1 = this.px2cm(w);
        stpp.setAttribute('style:width', w1 + 'cm');
        stpp.setAttribute("style:shadow", "none");
        return this.checkExistsStyle(st);
    };

    this.getStyleName = function () {
        this.fontIndex++;
        return "ST" + this.fontIndex;
    };
    this.fontIndex = 0;
    this.fontMap = {};
    this.createSpan = function (obj) {
        // <text:span text:style-name="T5">
        var r = this.createEle("text:span");
        var stName = this.createStyle(obj);
        r.setAttribute("text:style-name", stName);
        return r;
    };
    this.createBr = function (obj) {
        var bele = this.createEle("text:line-break");
        return bele;
    };
    this.createTable = function (obj) {
        var bele = this.createEle("table:table");
        // <table:table table:name="表格1" table:style-name="表格1">
        bele.setAttribute('table:name', 'gdx' + Math.random());
        var maxCellsTr = {
            row: null,
            num: -1
        };
        if (obj.id == 'EWA_FRAME_G1375752461') {
            var zzzzzzzz = 1;
        }
        for (var i = 0; i < obj.rows.length; i++) {
            var tr = obj.rows[i];
            var num = 0;
            for (var m = 0; m < tr.cells.length; m++) {
                var td = tr.cells[m];
                if (td.getAttribute('fixed')) { // 生成前补充的td
                    continue;
                }
                num++;
            }
            if (num > maxCellsTr.num) {
                maxCellsTr.num = num;
                maxCellsTr.row = tr;
            }
        }
        // console.log(maxCellsTr)
        if (maxCellsTr.row) {
            for (var i = 0; i < maxCellsTr.row.cells.length; i++) {
                var col = this.createEle("table:table-column");
                var colSt = this.createStyleCol(maxCellsTr.row.cells[i]);
                col.setAttribute('table:style-name', colSt);
                bele.appendChild(col);
            }
            // console.log(bele)
        }
        var tbSt = this.createStyleTable(obj);
        bele.setAttribute('table:style-name', tbSt);
        return bele;
    };

    this.createTr = function (obj) {
        // table:table-row
        var tr = this.createEle("table:table-row");
        return tr;
    };
    this.paraId = 0;
    this.getParaId = function () {
        var v = "0000" + this.paraId;
        v = v.substring(v.length - 4);
        this.paraId++;
        return "F0C0" + v;
    }
    this.createTd = function (obj) {
        // <table:table-cell table:style-name="A2" office:value-type="string">
        if (obj.className == 'rowspan' || obj.className == 'colspan') {
            return this.createEle('table:covered-table-cell');
        }
        var bele = this.createEle("table:table-cell");
        if (obj.getAttribute("m_rowspan") > 1) {
            bele.setAttribute('table:number-rows-spanned', obj
                .getAttribute("m_rowspan"));
        }
        if (obj.getAttribute("m_colspan") > 1) {
            bele.setAttribute('table:number-columns-spanned', obj
                .getAttribute("m_colspan"));
        }
        bele.setAttribute('office:value-type', "string");

        var stName = this.createStyleTd(obj);
        bele.setAttribute('table:style-name', stName);
        return bele;
    };
    this.createWidth = function (obj, tag) {
        // <w:tblW w:w="8702" w:type="dxa" />
        var e = this.createEle('w:' + tag);
        var w = $(obj).width() * 15; // px-->word width
        e.setAttribute('w:w', w);
        e.setAttribute('w:type', "dxa");
        return e;
    };
    this.createHeight = function (obj, tag) {
        // <w:trHeight w:val="10121"/>
        var e = this.createEle('w:' + tag);
        var h = $(obj).height() * 15; // px-->word width
        e.setAttribute('w:val', h);
        return e;
    };
    /*
     * <style:table-cell-properties fo:padding="0.097cm" fo:border-left="0.002cm
     * solid #000000" fo:border-right="none" fo:border-top="0.002cm solid
     * #000000" fo:border-bottom="0.002cm solid #000000"/>
     */
    this.createBorder = function (obj, a) {
        // "0.002cm solid #000000"
        var v1 = "";
        var v = $(obj).css('border-' + a + '-width');
        var e = this.createEle('w:' + a);
        if (v == '0px') {
            v1 = "none";
        } else {
            v1 = "0.002cm ";
            v1 += $(obj).css('border-' + a + '-style');
            var c = $(obj).css('border-' + a + '-color');
            var c1 = this.rgb1(c).toLowerCase();
            v1 += " #" + c1;
        }
        return v1;
    };
    /**
     * 不可见的分割，用于两个紧连的表分割等
     * 
     * @param {Object}
     *            obj
     * @memberOf {TypeName}
     * @return {TypeName}
     */
    this.createPVanish = function () {
        var elep = this.createElesLvl("w:p,w:pPr,w:rPr,w:vanish");
        return elep;
    };
    this.createP = function (obj) {
        // <text:p text:style-name="Standard"/>
        var elep = this.createEle("text:p");

        var stName = this.createStyleP(obj);
        elep.setAttribute("text:style-name", stName);
        return elep;
    };
    /**
     * 创建分页
     */
    this.createBreak = function () {
        var elep = this.createEle("text:p");
        var stName = this.createStyleBreak();
        elep.setAttribute("text:style-name", stName);
        return elep;
    };
    this.createPic = function (obj) {
        /*
         * <draw:frame draw:style-name="fr1" draw:name="图形1"
         * text:anchor-type="as-char" svg:width="4.233cm" svg:height="4.233cm"
         * draw:z-index="0"> <draw:image
         * xlink:href="Pictures/10000201000000A0000000A0214A9447.png"
         * xlink:type="simple" xlink:show="embed" xlink:actuate="onLoad"/>
         * </draw:frame>
         */
        var o = $(obj);
        var picName = obj.src;
        this.pics.push(obj.src);

        var idx = picName.lastIndexOf('/');
        picName = picName.substring(idx + 1);
        var emuX = this.px2cm(o.width());
        var emuY = this.px2cm(o.height());

        var rs = this.createElesLvl("draw:frame,draw:image");
        this.setAtts(rs[0], {
            'svg:width': emuX + 'cm',
            'svg:height': emuY + 'cm',
            "draw:z-index": "0",
            "draw:style-name": "fr1",
            "text:anchor-type": "as-char"
        });
        this.setAtts(rs[1], {
            'xlink:type': 'simple',
            'xlink:show': 'embed',
            "xlink:actuate": "onLoad",
            "xlink:href": "{[PIC" + (this.pics.length - 1) + "]}"
        });

        return rs[0];
    };
    this.createEleNs = function (tag, ns) {
        var ele8 = this.doc.XmlDoc.createElementNS(ns, tag);
        return ele8;
    }
    this.setAtts = function (node, params) {
        for (var n in params) {
            node.setAttribute(n, params[n]);
        }
    }
    this.fontSize = function (f) {
        if (f.indexOf('px') > 0) {
            var f0 = this.EWA_DocTmp.f[f];
            if (f0 == null) {
                f = '9pt';
            } else {
                f = f0;
            }
        }
        var f1 = f.replace('pt', '');
        return f1;
    };
    this.rgb1 = function (s1) {
        var s = s1.replace('rgb(', '').replace(')', '');
        var ss = s.split(',');
        return this.rgb(ss[0] * 1, ss[1] * 1, ss[2] * 1).toUpperCase();
    };
    this.rgb = function (r, g, b) {
        var r1 = r.toString(16);
        var g1 = g.toString(16);
        var b1 = b.toString(16);
        return (r1.length < 2 ? "0" : "") + r1 + (g1.length < 2 ? "0" : "")
            + g1 + (b1.length < 2 ? "0" : "") + b1;
    };

    this.init = function () {
        this.doc = new EWA_XmlClass();
        this.doc.LoadXml(this.EWA_DocTmp.document);
        var firstDock = this.doc.XmlDoc.getElementsByTagName('text');
        if (firstDock.length == 0) { // chrome 60+
            firstDock = this.doc.XmlDoc.getElementsByTagName('office:text');
        }
        this.docks.push(firstDock[0]);
    };
    this.getDock = function () {
        return this.docks[this.docks.length - 1];
    };
    this.idx = 0
    this.docksPop = function (o) {
        // console.log(o);
        while (1 == 1) {
            if (this.docks.length == 1) {
                break;
            }
            var o1 = this.docks.pop();
            // console.log(o1, o);
            if (o1 == o) {
                break;
            }
        }
    };
    this.getDockTable = function () {
        for (var i = this.docks.length - 1; i >= 0; i--) {
            var o = this.docks[i];
            if (o
                && (o.tagName == 'office:text'
                    || o.tagName == 'table:table-cell' || o.tagName == 'text:list-item')) {
                return o;
            }
        }
    };
    /**
     * 包括英制单位（914,400 个 EMU 单位为 1 英寸）
     * 
     * @param {Object}
     *            v
     * @return {TypeName}
     */
    this.px2cm = function (v) {
        if (v == null || v == '') {
            return 0;
        }
        return v / 96 * 2.539999918;
    }
    this.EWA_DocTmp = {
        document: [
            '<?xml version="1.0" encoding="UTF-8"?>',
            '<office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"',
            '   xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0"',
            '   xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0"',
            '  xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0"',
            '   xmlns:draw="urn:oasis:names:tc:opendocument:xmlns:drawing:1.0"',
            ' xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0"',
            ' xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:dc="http://purl.org/dc/elements/1.1/"',
            ' xmlns:meta="urn:oasis:names:tc:opendocument:xmlns:meta:1.0"',
            ' xmlns:number="urn:oasis:names:tc:opendocument:xmlns:datastyle:1.0"',
            ' xmlns:svg="urn:oasis:names:tc:opendocument:xmlns:svg-compatible:1.0"',
            ' xmlns:chart="urn:oasis:names:tc:opendocument:xmlns:chart:1.0"',
            ' xmlns:dr3d="urn:oasis:names:tc:opendocument:xmlns:dr3d:1.0"',
            '  xmlns:math="http://www.w3.org/1998/Math/MathML"',
            ' xmlns:form="urn:oasis:names:tc:opendocument:xmlns:form:1.0"',
            '  xmlns:script="urn:oasis:names:tc:opendocument:xmlns:script:1.0"',
            ' xmlns:ooo="http://openoffice.org/2004/office" xmlns:ooow="http://openoffice.org/2004/writer"',
            ' xmlns:oooc="http://openoffice.org/2004/calc" xmlns:dom="http://www.w3.org/2001/xml-events"',
            ' xmlns:xforms="http://www.w3.org/2002/xforms" xmlns:xsd="http://www.w3.org/2001/XMLSchema"',
            ' xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"',
            ' xmlns:rpt="http://openoffice.org/2005/report"',
            ' xmlns:of="urn:oasis:names:tc:opendocument:xmlns:of:1.2"',
            ' xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:grddl="http://www.w3.org/2003/g/data-view#"',
            ' xmlns:tableooo="http://openoffice.org/2009/table"',
            ' xmlns:field="urn:openoffice:names:experimental:ooo-ms-interop:xmlns:field:1.0"',
            ' office:version="1.2"><office:scripts/>',
            ' <office:font-face-decls>',
            '<style:font-face style:name="OpenSymbol" svg:font-family="OpenSymbol"/>',
            '<style:font-face style:name="微软雅黑" svg:font-family="微软雅黑"/>',
            '<style:font-face style:name="Lucida Sans1" svg:font-family="&apos;Lucida Sans&apos;"',
            ' style:font-family-generic="swiss"/><style:font-face style:name="宋体" svg:font-family="宋体" style:font-pitch="variable"/>',
            '<style:font-face style:name="黑体" svg:font-family="黑体" style:font-pitch="variable"/>',
            '<style:font-face style:name="Times New Roman" svg:font-family="&apos;Times New Roman&apos;"',
            '  style:font-family-generic="roman" style:font-pitch="variable"/>',
            '<style:font-face style:name="Century Gothic" svg:font-family="Century Gothic" style:font-family-generic="swiss"',
            ' style:font-pitch="variable"/>',
            '<style:font-face style:name="Lucida Sans" svg:font-family="&apos;Lucida Sans&apos;"',
            ' style:font-family-generic="system" style:font-pitch="variable"/>',
            '<style:font-face style:name="微软雅黑1" svg:font-family="微软雅黑" style:font-family-generic="system"',
            ' style:font-pitch="variable"/>',
            '</office:font-face-decls>',
            '<office:automatic-styles><style:style style:name="fr1" style:family="graphic" style:parent-style-name="Graphics">',
            '<style:graphic-properties style:vertical-pos="top" style:vertical-rel="baseline"',
            ' style:horizontal-pos="center" style:horizontal-rel="paragraph" style:shadow="none"',
            ' style:mirror="none" fo:clip="rect(0cm, 0cm, 0cm, 0cm)" draw:luminance="0%"',
            ' draw:contrast="0%" draw:red="0%" draw:green="0%" draw:blue="0%" draw:gamma="100%"',
            ' draw:color-inversion="false" draw:image-opacity="100%"',
            ' draw:color-mode="standard"/></style:style><text:list-style style:name="L1">',
            '<text:list-level-style-number text:level="1" text:style-name="Numbering_20_Symbols" style:num-suffix="."',
            ' style:num-format="1">',
            '<style:list-level-properties text:list-level-position-and-space-mode="label-alignment">',
            '<style:list-level-label-alignment text:label-followed-by="listtab"',
            ' text:list-tab-stop-position="1.27cm" fo:text-indent="-0.635cm"',
            ' fo:margin-left="1.27cm"/>',
            '</style:list-level-properties>',
            '</text:list-level-style-number>',
            '<text:list-level-style-number text:level="2" text:style-name="Numbering_20_Symbols" style:num-suffix="."',
            ' style:num-format="1">',
            '<style:list-level-properties text:list-level-position-and-space-mode="label-alignment">',
            ' <style:list-level-label-alignment text:label-followed-by="listtab"',
            ' text:list-tab-stop-position="1.905cm" fo:text-indent="-0.635cm"',
            ' fo:margin-left="1.905cm"/>',
            '</style:list-level-properties>',
            '</text:list-level-style-number>',
            '<text:list-level-style-number text:level="3" text:style-name="Numbering_20_Symbols" style:num-suffix="."',
            ' style:num-format="1">',
            ' <style:list-level-properties text:list-level-position-and-space-mode="label-alignment">',
            '<style:list-level-label-alignment text:label-followed-by="listtab"',
            ' text:list-tab-stop-position="2.54cm" fo:text-indent="-0.635cm" fo:margin-left="2.54cm"/>',
            '</style:list-level-properties>',
            '</text:list-level-style-number>',
            '<text:list-level-style-number text:level="4" text:style-name="Numbering_20_Symbols" style:num-suffix="." style:num-format="1">',
            '<style:list-level-properties text:list-level-position-and-space-mode="label-alignment">',
            '<style:list-level-label-alignment text:label-followed-by="listtab"',
            ' text:list-tab-stop-position="3.175cm" fo:text-indent="-0.635cm"  fo:margin-left="3.175cm"/>',
            '</style:list-level-properties>',
            '</text:list-level-style-number>',
            '<text:list-level-style-number text:level="5" text:style-name="Numbering_20_Symbols" style:num-suffix="."',
            ' style:num-format="1">',
            '<style:list-level-properties text:list-level-position-and-space-mode="label-alignment">',
            ' <style:list-level-label-alignment text:label-followed-by="listtab"',
            '  text:list-tab-stop-position="3.81cm" fo:text-indent="-0.635cm" fo:margin-left="3.81cm"/>',
            '</style:list-level-properties>',
            '</text:list-level-style-number>',
            '<text:list-level-style-number text:level="6" text:style-name="Numbering_20_Symbols" style:num-suffix="."',
            ' style:num-format="1">',
            ' <style:list-level-properties text:list-level-position-and-space-mode="label-alignment">',
            ' <style:list-level-label-alignment text:label-followed-by="listtab"',
            ' text:list-tab-stop-position="4.445cm" fo:text-indent="-0.635cm" fo:margin-left="4.445cm"/>',
            ' </style:list-level-properties>',
            '</text:list-level-style-number>',
            '<text:list-level-style-number text:level="7" text:style-name="Numbering_20_Symbols" style:num-suffix="."',
            ' style:num-format="1">',
            '<style:list-level-properties text:list-level-position-and-space-mode="label-alignment">',
            '<style:list-level-label-alignment text:label-followed-by="listtab"',
            ' text:list-tab-stop-position="5.08cm" fo:text-indent="-0.635cm"  fo:margin-left="5.08cm"/>',
            ' </style:list-level-properties>',
            '</text:list-level-style-number>',
            '<text:list-level-style-number text:level="8" text:style-name="Numbering_20_Symbols" style:num-suffix="."',
            ' style:num-format="1">',
            '<style:list-level-properties text:list-level-position-and-space-mode="label-alignment">',
            '<style:list-level-label-alignment text:label-followed-by="listtab"',
            ' text:list-tab-stop-position="5.715cm" fo:text-indent="-0.635cm" fo:margin-left="5.715cm"/>',
            ' </style:list-level-properties>',
            '</text:list-level-style-number>',
            '<text:list-level-style-number text:level="9" text:style-name="Numbering_20_Symbols" style:num-suffix="."',
            ' style:num-format="1">',
            ' <style:list-level-properties text:list-level-position-and-space-mode="label-alignment">',
            '<style:list-level-label-alignment text:label-followed-by="listtab"',
            ' text:list-tab-stop-position="6.35cm" fo:text-indent="-0.635cm" fo:margin-left="6.35cm"/>',
            ' </style:list-level-properties>',
            '</text:list-level-style-number>',
            '<text:list-level-style-number text:level="10" text:style-name="Numbering_20_Symbols" style:num-suffix="."',
            ' style:num-format="1">',
            '<style:list-level-properties text:list-level-position-and-space-mode="label-alignment">',
            '<style:list-level-label-alignment text:label-followed-by="listtab"',
            ' text:list-tab-stop-position="6.985cm" fo:text-indent="-0.635cm"',
            ' fo:margin-left="6.985cm"/>',
            '</style:list-level-properties>',
            '</text:list-level-style-number>',
            '</text:list-style>',
            '<text:list-style style:name="L2">',
            '<text:list-level-style-bullet text:level="1" text:style-name="Bullet_20_Symbols" text:bullet-char="•">',
            '<style:list-level-properties text:list-level-position-and-space-mode="label-alignment">',
            '<style:list-level-label-alignment text:label-followed-by="listtab"',
            ' text:list-tab-stop-position="1.27cm" fo:text-indent="-0.635cm"',
            ' fo:margin-left="1.27cm"/>',
            '</style:list-level-properties>',
            '</text:list-level-style-bullet>',
            ' <text:list-level-style-bullet text:level="2" text:style-name="Bullet_20_Symbols" text:bullet-char="◦">',
            '     <style:list-level-properties text:list-level-position-and-space-mode="label-alignment">',
            '         <style:list-level-label-alignment text:label-followed-by="listtab"',
            ' text:list-tab-stop-position="1.905cm" fo:text-indent="-0.635cm"',
            ' fo:margin-left="1.905cm"/>',
            '     </style:list-level-properties>',
            ' </text:list-level-style-bullet>',
            ' <text:list-level-style-bullet text:level="3" text:style-name="Bullet_20_Symbols" text:bullet-char="▪">',
            '     <style:list-level-properties text:list-level-position-and-space-mode="label-alignment">',
            '         <style:list-level-label-alignment text:label-followed-by="listtab"',
            ' text:list-tab-stop-position="2.54cm" fo:text-indent="-0.635cm"',
            ' fo:margin-left="2.54cm"/>',
            '     </style:list-level-properties>',
            ' </text:list-level-style-bullet>',
            ' <text:list-level-style-bullet text:level="4" text:style-name="Bullet_20_Symbols" text:bullet-char="•">',
            '     <style:list-level-properties text:list-level-position-and-space-mode="label-alignment">',
            '         <style:list-level-label-alignment text:label-followed-by="listtab"',
            ' text:list-tab-stop-position="3.175cm" fo:text-indent="-0.635cm"',
            ' fo:margin-left="3.175cm"/>',
            '     </style:list-level-properties>',
            ' </text:list-level-style-bullet>',
            ' <text:list-level-style-bullet text:level="5" text:style-name="Bullet_20_Symbols" text:bullet-char="◦">',
            '     <style:list-level-properties text:list-level-position-and-space-mode="label-alignment">',
            '         <style:list-level-label-alignment text:label-followed-by="listtab"',
            ' text:list-tab-stop-position="3.81cm" fo:text-indent="-0.635cm"',
            ' fo:margin-left="3.81cm"/>',
            '     </style:list-level-properties>',
            ' </text:list-level-style-bullet>',
            ' <text:list-level-style-bullet text:level="6" text:style-name="Bullet_20_Symbols" text:bullet-char="▪">',
            '     <style:list-level-properties text:list-level-position-and-space-mode="label-alignment">',
            '         <style:list-level-label-alignment text:label-followed-by="listtab"',
            ' text:list-tab-stop-position="4.445cm" fo:text-indent="-0.635cm"',
            ' fo:margin-left="4.445cm"/>',
            '     </style:list-level-properties>',
            ' </text:list-level-style-bullet>',
            ' <text:list-level-style-bullet text:level="7" text:style-name="Bullet_20_Symbols" text:bullet-char="•">',
            '     <style:list-level-properties text:list-level-position-and-space-mode="label-alignment">',
            '         <style:list-level-label-alignment text:label-followed-by="listtab"',
            ' text:list-tab-stop-position="5.08cm" fo:text-indent="-0.635cm"',
            ' fo:margin-left="5.08cm"/>',
            '     </style:list-level-properties>',
            ' </text:list-level-style-bullet>',
            ' <text:list-level-style-bullet text:level="8" text:style-name="Bullet_20_Symbols" text:bullet-char="◦">',
            '     <style:list-level-properties text:list-level-position-and-space-mode="label-alignment">',
            '         <style:list-level-label-alignment text:label-followed-by="listtab"',
            ' text:list-tab-stop-position="5.715cm" fo:text-indent="-0.635cm"',
            ' fo:margin-left="5.715cm"/>',
            '     </style:list-level-properties>',
            ' </text:list-level-style-bullet>',
            ' <text:list-level-style-bullet text:level="9" text:style-name="Bullet_20_Symbols" text:bullet-char="▪">',
            '     <style:list-level-properties text:list-level-position-and-space-mode="label-alignment">',
            '         <style:list-level-label-alignment text:label-followed-by="listtab"',
            ' text:list-tab-stop-position="6.35cm" fo:text-indent="-0.635cm"',
            ' fo:margin-left="6.35cm"/>',
            '     </style:list-level-properties>',
            ' </text:list-level-style-bullet>',
            ' <text:list-level-style-bullet text:level="10" text:style-name="Bullet_20_Symbols" text:bullet-char="•">',
            '     <style:list-level-properties text:list-level-position-and-space-mode="label-alignment">',
            '         <style:list-level-label-alignment text:label-followed-by="listtab"',
            ' text:list-tab-stop-position="6.985cm" fo:text-indent="-0.635cm"',
            ' fo:margin-left="6.985cm"/>',
            '     </style:list-level-properties>',
            ' </text:list-level-style-bullet>',
            '        </text:list-style>',
            '<number:number-style style:name="N0">',
            ' <number:number number:min-integer-digits="1"/>',
            '</number:number-style></office:automatic-styles>',
            '<office:body><office:text /></office:body></office:document-content>'].join(''),
        f: {
            "9px": "7pt",
            "10px": "7.5pt",
            "11px": "8.5pt",
            "12px": "9pt",
            "13px": "10pt",
            "14px": "10.5pt",
            "14.8px": "10.5pt",
            "15px": "11.5pt",
            "16px": "12pt",
            "17px": "13pt",
            "18px": "13.5pt",
            "19px": "14.5pt",
            "20px": "15pt",
            "21px": "16pt",
            "22px": "16.5pt",
            "23px": "17.5pt",
            "24px": "18pt",
            "25px": "19pt",
            "26px": "19.5pt",
            "27px": "20.5pt",
            "28px": "21pt",
            "29px": "22pt",
            "30px": "22.5pt",
            "31px": "23.5pt",
            "32px": "24pt",
            "33px": "25pt",
            "34px": "25.5pt",
            "35px": "26.5pt",
            "36px": "27pt",
            "37px": "28pt",
            "38px": "28.5pt",
            "39px": "29.5pt",
            "40px": "30pt",
            "41px": "31pt",
            "42px": "31.5pt",
            "43px": "32.5pt",
            "44px": "33pt",
            "45px": "34pt",
            "46px": "34.5pt",
            "47px": "35.5pt",
            "48px": "36pt",
            "49px": "37pt",
            "50px": "37.5pt",
            "51px": "38.5pt",
            "52px": "39pt",
            "53px": "40pt",
            "54px": "40.5pt",
            "55px": "41.5pt",
            "56px": "42pt",
            "57px": "43pt",
            "58px": "43.5pt",
            "59px": "44.5pt",
            "60px": "45pt",
            "61px": "46pt",
            "62px": "46.5pt",
            "63px": "47.5pt",
            "64px": "48pt",
            "65px": "49pt",
            "66px": "49.5pt",
            "67px": "50.5pt",
            "68px": "51pt",
            "69px": "52pt",
            "70px": "52.5pt",
            "71px": "53.5pt",
            "72px": "54pt",
            "73px": "55pt",
            "74px": "55.5pt",
            "75px": "56.5pt",
            "76px": "57pt",
            "77px": "58pt",
            "78px": "58.5pt",
            "79px": "59.5pt",
            "80px": "60pt",
            "81px": "61pt",
            "82px": "61.5pt",
            "83px": "62.5pt",
            "84px": "63pt",
            "85px": "64pt",
            "86px": "64.5pt",
            "87px": "65.5pt",
            "88px": "66pt",
            "89px": "67pt",
            "90px": "67.5pt",
            "91px": "68.5pt",
            "92px": "69pt",
            "93px": "70pt",
            "94px": "70.5pt",
            "95px": "71.5pt",
            "96px": "72pt",
            "97px": "73pt",
            "98px": "73.5pt",
            "99px": "74.5pt"
        },
        borders: ['top', 'bottom', 'right', 'left']
    };
    this.postData = function () {
        var data = {
            xml: this.xml(),
            pics: this.pics.join(','),
            ols: this.liNum
        };
        return data;
    }
    this.init();
    this.xml = function () {
        return this.doc.GetXml();
    };
};
// var word = new EWA_DocWordClass();
// word.walker(oo);
// word.xml();
