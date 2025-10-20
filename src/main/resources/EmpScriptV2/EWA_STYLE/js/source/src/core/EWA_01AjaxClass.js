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
		if (ajax.onError) { //外部定义的错误
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
			return textName(d);
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
};