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
