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
	this.responseStatus = 0; // http status code 200, 404, 504 ...

	if (this._IsAsync) {
		this._IsAsync = true;
	} else {
		this._IsAsync = false;
	}

	/**
	 * 显示等待图标/文字
	 */
	this._ShowWaitting = function () {
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
	this._CreateWaittingText = function () {
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
	this._CreateWaittingImg = function () {
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
	this.HiddenWaitting = function () {
		var o1 = document.getElementById(this._WaittingId);
		if (o1 != null) {
			o1.style.display = "none";
		}
		o1 = null;
	};
	/**
	 * 初始化Ajax对象
	 */
	this._InitHttp = function () {
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
	this.Get = function (url, Callback) {
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
	this.Post = function (url, sinfo, callback) {
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
	this.PostNew = function (url, callback) {
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
	this.GetReturnValue = function () {
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
	this.AddParameter = function (name, val, notEncode) {
		this._Parameters[name] = (notEncode ? val : encodeURIComponent(val));
	};
	this._InitHttp();

	this._getLoaddingImg = function () {
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
	this.Install = function (url, parameters, parentId, afterJs, notShowWaitting) {
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

		this.Post(url, parameters, function () {
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
	this.IsRunEnd = function () {
		this.responseStatus = this._Http.status; //200, 404 ...
		this.responseReadyState = this._Http.readyState;

		if (this._Http.readyState != 4) {
			return false;
		}

		this.HiddenWaitting();
		if (!this._RunEndTime) {
			var d = new Date();
			this._RunEndTime = d.getTime();
		}
		// 清除对象，避免内存溢出
		window.setTimeout(function () {
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
	this.Dispose = function () {
		this._Http = null;
	}
	/**
	 * 获取执行完成过去的时间
	 * 
	 * @return {}
	 */
	this.GetEndPastTime = function () {
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
	this.IsError = function () {
		this.responseStatus = this._Http.status; //200, 404 ...
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
	this.GetRst = function () {
		if (!this.IsRunEnd()) {
			return null;
		}
		if (!this.IsError()) {
			return this._Http.responseText;
		} else {
			return this._Http.statusText;
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
	ajax.Get(url, function () {
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
	ajax.Get(url, function () {
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
	ajax.PostNew(url, function () {
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
	ajax.PostNew(url, function () {
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
	ajax.PostNew(url, function () {
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
	ajax.Get(url, function () {
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
		if(ajax.onError){ //外部定义的错误
			ajax.onError(ajax.responseStatus);
		} else if (window.EWA_AjaxErr) {
			window.EWA_AjaxErr(ajax);
		} else {
			alert('ERROR: ' + ajax.responseStatus);
			console.error(ajax._Http);
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
$Install = function (url, pid, func, notShowWaitting) {
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
	this.transAll = function (objs_ch, objs_en, transCompleteItemCallBack, transCompleteCallback) {
		this.idx = 0;
		this.idx_ok = 0;// 翻译完成数量
		if (objs_ch == null) {
			alert('enus' == EWA.LANG ? 'Object objs_ch cannot be empty' : '对象objs_ch不能为空');
			return;
		}
		this._objs_ch = objs_ch;
		this._objs_en = objs_en;
		this._transCompleteCallback = transCompleteCallback;
		this._transCompleteItemCallBack = transCompleteItemCallBack;
		this.start_trans('en');
		$Tip('enus' == EWA.LANG ? "Translate started" : "翻译开始", () => {
			return this.check_complete();
		});
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
	this.transAllToCn = function (objs_ch, objs_en, transCompleteItemCallBack, transCompleteCallback) {
		this.idx = 0;
		this.idx_ok = 0;// 翻译完成数量
		if (objs_ch == null) {
			alert('enus' == EWA.LANG ? 'Object objs_ch cannot be empty' : '对象objs_ch不能为空');
			return;
		}
		this._objs_ch = objs_ch;
		this._objs_en = objs_en;
		this._transCompleteCallback = transCompleteCallback;
		this._transCompleteItemCallBack = transCompleteItemCallBack;
		this.start_trans('cn');
	};
	/**
	 * 开始翻译
	 * @param {} transToLang 
	 * @returns 
	 */
	this.start_trans = function (transToLang) {
		if (this.idx <= this._objs_ch.length - 1) {
			const idx = this.idx;
			this.idx++;

			const ch_obj = this._objs_ch[idx];
			const ch = this.get_text(ch_obj);
			if (!ch) { // 如果没有内容，则跳过
				this.idx_ok++;
				this.start_trans(transToLang);
				return;
			}
			let en_obj = this._objs_en ? this._objs_en[idx] : null;
			const en_txt = this.get_text(en_obj);
			if (this.SKIP_EXISTS && en_txt) {// 检查是否已经存在
				this.idx_ok++;
				this.start_trans(transToLang);
				return;
			}

			this.trans_item(ch_obj, en_obj, transToLang);

			// 定时调用
			const c = this;
			setTimeout(function () {
				c.start_trans(transToLang);
			}, 123);
			return;
		}
		// setTimeout(this.post_server, 1231);
	};
	this.trans_item = function (fromObj, toObj, transToLang) {
		let that = this;
		if (this.trans == null) {
			this.trans = new EWA_TransClass();
			this.trans.transAfter = function (rst, func) {
				that.idx_ok++;
				that.call_item_callback(func, rst);
			};
		}
		if (transToLang == 'cn') {
			this.trans.TransToCn(this.get_text(fromObj), toObj);
		} else {
			this.trans.TransToEn(this.get_text(fromObj), toObj);
		}
	};
	/**
	 * 根据对象返回文字
	 */
	this.get_text = function (fromObj) {
		if (!fromObj == null || fromObj == undefined) {
			return null;
		}
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
	this.call_item_callback = function (fromObj, rst) {
		if (this._transCompleteItemCallBack) {
			this._transCompleteItemCallBack(fromObj, rst);
		}
	}
	this.check_complete = function () {
		if (this._objs_ch.length == this.idx_ok) {
			$Tip('enus' == EWA.LANG ? "Translate completed" : "翻译完成");

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
	this.TransToEn = function (hz, func) {
		this.transToEn(hz, func);
	};
	this.transToEn = function (hz, func) {
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
	this.TransToCn = function (english, func) {
		this.transToCn(english, func);
	};
	this.transToCn = function (english, func) {
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
	this._trans_azure = function (fromStr, func, isTransToEn) {
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
			success: function (results) {
				// [{"translations":[{"text":"你好","to":"zh-Hans"}]}]
				if (results.length == 0) {
					$Tip('No result');
					return;
				}
				let rst = results[0].translations[0].text;
				that.transBackCallCommon(rst, func);
				// delete window[this._Id];
			},
			error: function (req) {
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
	this._trans_youdao = function (fromStr, func) {
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
	this._trans_bing = function (fromStr, func, isTransToEn) {
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
	this._get_user_func_str = function (funcName, funcName1) {
		var js = "var fromClass=window['" + this._Id + "'];\n var func=window['" + funcName1 + "']; \n var _fname='" + funcName
			+ "'; \n var _fname1='" + funcName1 + "'; \n ";
		return js;
	};
	this._get_func_name = function () {
		this._IDX++;
		var funcName = '___GDX_T_' + this._IDX;
		return funcName;
	};
	/**
	 * bing 回调模板脚本
	 */
	this.transback_bing_tmp = function (rst) {
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
	this.transback_youdao_tmp = function (rst) {
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
	this.transBackCallCommon = function (rst, func) {
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

}