/**
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
		var tb = $(parent).find('.EWA_TABLE');
		tb.each(function() {
			var id = $(this).attr('id');
			if (!id) {
				return;
			}
			id = id.replace('EWA_FRAME_', '').replace('EWA_LF_', '');
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
		var tb = $('#EWA_FRAME_' + this._Id);
		var names = 'img,a,input[type=text],input[type=button],textarea';
		tb.find('.EWA_TD_M').each(function() {
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
		console.log('changed')
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
		var target = $('#EWA_FRAME_' + this._Id + " select#" + obj_id);
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
		var trs = $('#EWA_FRAME_' + this._Id + ' tr');
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
		$('#EWA_FRAME_' + this._Id + ' .ewa_d1').each(function() {
			this.title = this.innerHTML;
		});

		for (var name in this.ItemList.Items) {
			var dess = this.GetItemDescription(name);
			var memo = dess.Memo;
			if (memo != null && memo.trim().length > 0) {
				$('#' + name).attr('placeHolder', memo);
				$('#' + name).attr('title', memo);
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
		var tb = $('#EWA_FRAME_' + this._Id);
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
							var memoStr = "<div class='ewa-item-memo'>" + memo + "</div>";
							o.parentsUntil('tr').last().append(memoStr); // td
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
		let tb = $('#EWA_FRAME_' + this._Id);
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
		var p = $('#EWA_FRAME_' + this._Id);
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
		var tb = $('#EWA_FRAME_' + this._Id);
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
		var row2 = tb.parentNode.parentNode.parentNode.parentNode.insertRow(-1);
		var td = row2.insertCell(-1);

		td.appendChild(ipt0);
		td.appendChild(ipt1);
		td.className = "EWA_FRAME_GROUP_BUTTONS";

		// 上层表添加一行 提示行
		var rowTitle = tb.parentNode.parentNode.parentNode.parentNode.insertRow(0);
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

			var obj = $X(name1);
			if (obj == null) {
				alert(name1 + ' not exists');
				continue;
			}
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
		var tb = $('#EWA_FRAME_' + this._Id);
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
	this.checkIdempotenceError = function(){
		var ss = _EWA_EVENT_MSG['IdempotanceError'];
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
	};
	/**
	 * 添加必须输入的样式
	 */
	this._InitMustInputs = function() {
		var tb = $('#EWA_FRAME_' + this._Id);
		var nodeList = this.ItemList;
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
		var tb = $('#EWA_FRAME_' + this._Id);
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
	this._GetDropListValue1 = function(obj, obj1) {
		if (obj1.value == '') {
			obj1.setAttribute('setvalue', 1);
			return;
		}

		var exp = obj1.getAttribute('DlsShow');
		if (exp == null || exp == "") {
			obj1.setAttribute('canopen', 0);
			obj.value = obj1.value;
			obj1.setAttribute('canopen', 1);
			return;
		}

		var ajax = new EWA_AjaxClass();
		var xmlName = obj1.getAttribute("xmlName");
		var itemName = obj1.getAttribute("itemName");
		var paraname = obj1.getAttribute("paraName");
		var action = obj1.getAttribute('DlsAction');

		var ajax = new EWA.C.Ajax();
		var val = obj1.value;
		// var url = EWA.CP + "/EWA_STYLE/cgi-bin/";
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

		ajax.AddParameter(paraname, val);
		if (action != null && action.trim().length > 0) {
			ajax.AddParameter("EWA_ACTION", action);
			ajax.AddParameter(obj1.id, obj1.value);
		}

		ajax.PostNew(url, function() {
			if (!ajax.IsRunEnd()) {
				return;
			}
			var ret = ajax.GetRst();
			var json_id = '__json' + Math.random();
			try {
				eval('window["' + json_id + '"]=' + ret);
			} catch (e) {
				obj1.setAttribute('canopen', 0);
				obj.value = e;
				obj1.setAttribute('canopen', 1);
				return;
			}
			var s = window[json_id];
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
					obj1.setAttribute("para_" + n.toLowerCase(), o[n]);
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
			obj1.setAttribute('canopen', 0);
			obj.value = rst;

			obj1.id = obj1.id == null || obj1.id == "" ? Math.random() : obj1.id;
			if (obj1.getAttribute("isdlseventload") == "yes") {
				EWA.F.FOS[obj1.id] = new EWA_FrameItemClass();
				EWA.F.FOS[obj1.id].DropList(obj);
				// 执行调用
				EWA.F.FOS[obj1.id].CallAfterEvent();
			}
			obj1.setAttribute('canopen', 1);
			obj1.setAttribute('setvalue', 1);
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
				ajax.AddParameter(id + "_CHANGED", changed);
			} else {
				val = this._GetObjectValue(o1);
			}
			if (val != null) {
				ajax.AddParameter(id, val);
			}
			if (o1.tagName.toUpperCase() == "DIV" && o1.getAttribute('EWA_DHTML') == "1") {// dhtml
				// 传递上传的图片的unid，用于调用SQL的更新用
				var upImgsUuid = $X('UP_IMG_' + id).value;
				ajax.AddParameter(id + '_imgs_split', upImgsUuid);
			}

			if ('swffile' == ewa_tag || 'IMG_UPLOAD' == ewa_tag) {
				var s = o1.getAttribute("UP_PARAS");
				if (s != null && s.length > 0) {
					var s1 = s.split(',');
					for (var i = 0; i < s1.length; i++) {
						var n = s1[i];
						ajax.AddParameter(n, o1.getAttribute(n));
					}
				} else {
					ajax.AddParameter('UP_URL', o1.value);
				}
			} else if ('markdown' == ewa_tag) {
				var texts = o1.parentNode.getElementsByTagName('textarea');
				if (texts.length > 1) {
					ajax.AddParameter(texts[1].id, texts[1].value);
				}
			}
		}
		if (this.PostAddData) {
			for (var n in this.PostAddData) {
				ajax.AddParameter(n, this.PostAddData[n]);
			}
		}
		return ajax;
	};
	/**
	 * 获取提交的数据（json）
	 */
	this.CreatePostData = function() {
		var objForm = $('#f_' + this._Id)[0];
		var data = {};
		for (var name in this.ItemList.Items) {
			var node = this.ItemList.Items[name];
			var id = this.ItemList.GetItemValue(node, "Name", "Name");

			var o1 = this.GetObject(id, objForm);
			if (o1 == null) {
				continue;
			}
			var val = this._GetObjectValue(o1);
			if (val != null) {
				data[id] = val;
			}
			if (o1.tagName.toUpperCase() == "DIV" && o1.getAttribute('EWA_DHTML') == "1") {// dhtml
				// 传递上传的图片的unid，用于调用SQL的更新用
				var upImgsUuid = $X('UP_IMG_' + id).value;
				data[id + '_imgs_split'] = upImgsUuid;
			}
			var ewa_tag = o1.getAttribute('ewa_tag');
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
			}
			if ('markdown' == ewa_tag) {
				var texts = o1.parentNode.getElementsByTagName('textarea');
				if (texts.length > 1) {
					data[texts[1].id] = texts[1].value;
				}
			}
		}

		return data;
	};

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
	this.DoPost = function(objForm, url, isSkipDoPostBefore) {
		if (this.posting) {
			return false;
		}
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
		var c = this;
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
		this._Ajax.PostNew(url, function() {
			that._CallBack();
		});

		// 隐藏提交时候等待框 郭磊 2018-04-02
		if (!this.isShowPostWaitting) {
			this._Ajax.HiddenWaitting();
		}

		$('#EWA_FRAME_' + this._Id + ' input[type=submit]').attr('disabled', 'disabled');

		return true;
	};
	this._CallBack = function() {
		let that = this; // EWA.F.F.CUR
		var ajax = that._Ajax;
		if (!ajax.IsRunEnd()) {
			return;
		}
		$('#EWA_FRAME_' + that._Id + ' input[type=submit]').attr('disabled', null);
		that.posting = false;
		// 外部指定的 DoPostEnd，用于显示或提示写东西
		if (that.DoPostEnd) {
			that.DoPostEnd(ajax, ajax._Http.status, ajax._Http.responseText, ajax._Http.statusText);
		}
		if (ajax._Http.status == 200) {
			var ret = ajax._Http.responseText;
			if (EWA.F.CheckCallBack(ret)) {
				that.ValidCodeError(true); // 重新刷新验证码
				try {
					if (that.doPostAfter) {
						that.doPostAfter(ret);
					} else if (that.ReloadAfter) {
						console.log('请用：doPostAfter');
						that.ReloadAfter(ret);
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
		var frame_table = $('#EWA_FRAME_' + this._Id);
		if (frame_table.length == 0) {
			return;
		}
		var ewa_frame_main = frame_table.parentsUntil('#EWA_FRAME_MAIN').last().parent();
		if (ewa_frame_main.length == 0) {
			return;
		}
		var tmp_id = EWA_Utils.tempId("ewa_frame_relaod");
		var p = ewa_frame_main;
		p.attr('id', tmp_id);

		var u1 = new EWA_UrlClass(this.Url);
		u1.AddParameter("ewa_ajax", "install");
		var url = u1.GetUrl();
		$Install(url, tmp_id, function() {
			if (func) {
				func(p, this);
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

		var nodeList = this.ItemList;
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
		var tb = $('#EWA_FRAME_' + this._Id);
		for (var name in this.ItemList.Items) {
			var node = this.ItemList.Items[name];
			// name 是大写，name1是真正id
			var name1 = this.ItemList.GetItemValue(node, "Name", "Name");

			var obj = tb.find('[id="' + name1 + '"]');
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
		return;
	}
	if (o1.cells.length == 1 || o1.parentNode.parentNode.getAttribute("error_show_type") == "1") {
		var curTr = $(o1);
		var errTr = curTr.next();
		if (!errTr.attr('error')) {
			var tr = o1.parentNode.insertRow(o1.rowIndex + 1);
			tr.setAttribute('error', 1);
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
		return;
	}

	o1.style.backgroundColor = '';
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
			try {
				// val,text, input(hidden), input(text)
				func(this._Object1.value, this._Object.value, this._Object1, this._Object);
			} catch (e) {
				alert('定义的Js ' + funcName + "执行错误：" + e);
			}
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
		CUR : null,
		FI : EWA_FrameItemClass
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
		if(cfgs == null || cfgs.length == 0){
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
			var p = $(this).find('[id="' + toParent + '"]').parent();
			if (p.attr('ewa-merged') == 'yes') {// 已经合并
				return;
			}
			p.attr('ewa-merged', 'yes');

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
				if(this.hasAttribute('value')){
					v = this.value;
				} else if(this.hasAttribute('title')){
					v = this.title;
				} else {
					v = this.innerText;
				}
				if(v == null || v.length===0){
					return;
				}
				v = v.replace(/,/ig, '') ;
				if (isNaN(v)) {
					return;
				}
				total += v * 1;
				if (v.indexOf(".") > 0) {
					fm_length = 2;
				}
			});
			let html = "<span id='"+id+"' name='"+id+"' class='ewa-lf-sub'>" + total.fm(fm_length) + "</span>";
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
			var nextTr = tr.parentNode.rows[tr.rowIndex + 1];
			if (nextTr == null || nextTr.getAttribute('add_pre_row') != 1) {
				var o = tr.parentNode.parentNode; // tb
				var colspan = o.rows[0].cells.length;

				nextTr = o.insertRow(tr.rowIndex + 1);
				nextTr.setAttribute('add_pre_row', 1);
				var td = nextTr.insertCell(-1);
				td.colSpan = colspan;
				td.className = 'ewa-lf-add-pre-cell';
				nextTr.style.display = 'none';
				td.id = EWA_Utils.tempId('EWA_LF_NR_' + this._Id);
				$(nextTr).addClass('ewa-lf-add-pre-row');
			}

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
		html.push("<div><div style='cursor:pointer' class='ewa_lf_func_caption'></div></div>");
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
		if (isFrame) {
			// css = "width:100%;height:100%;overflow:auto;position: absolute";
		}

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
	 */
	this.ShowSearch = function(composeTexts) {
		var id = 'EWA_SEARCH_ITEM_' + this.Id;
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
			if (search == "fix") {
				ssFix.push(tmp.join(''));
			} else {
				ssOth.push(tmp.join(''));
			}
		}
		if ((ssOth.length + ssFix.length) == 0) {
			return;
		}
		var title = _EWA_INFO_MSG["EWA.SYS.DATASEARCH"];
		ss.push('<table class="ewa-lf-search-main" id="' + id + '" cellspacing="0" cellpadding="0" style="width:100%">');
		ss.push("<tr><td class='ewa-lf-search-des'></td><td>");
		if (ssOth.length > 0) {
			ss.push(" " + ssOth.join('') + " ");
		}
		if (ssFix.length > 0) {
			for (var i = 0; i < ssFix.length; i++) {
				ss.push(" " + ssFix[i] + " ");
			}
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
				var ss = [];
				for (var i1 = 0; i1 < exp.length; i1++) {
					var c = exp[i1];
					if ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9')) {
						ss.push(c);
					} else {
						ss.push('\\' + c); // 字符转义，避免正则表达式出错
					}
				}
				exp = ss.join('');
				exp = eval('/(' + exp + ')/ig');
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
								this.innerHTML = this.innerHTML.replace(exp, '<font color=red><b>$1</b></font>');
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
		var objs = $F(obj, 'input', 'type', 'radio,checkbox');
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
			this.DblClick(c._IsDblClick);
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
	// 编辑框输入后自定义触发事件
	this.EditAfterEvent = function() {
		return;
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
				if (m == 0) {
					td.className = "EWA_TD_H";
					td.innerHTML = '<nobr cellIdx="' + (idx) + '" id="' + d[colId] + '">' + d[colText] + '</nobr>';
					td.title = d[colMemo];
					td.width = 100;
					loc[d[colId]] = idx;

				} else {
					var rowId = tb.rows[m].getAttribute('EWA_KEY');
					td.className = "EWA_TD_M";
					var id = rowId + '_' + d[colId];
					var h = this._GetAddControl(d[colType]);
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
	this._GetAddControl = function(type) {
		if (type == null)
			return null;

		var t = type.toUpperCase().trim();
		if (t == 'SELECT') {
			return '<select !!></select>';
		} else if (t == 'DATE') {
			return '<input type=text class=EWA_INPUT onclick="EWA.UI.Calendar.Pop(this,false);" readonly !!>';
		} else if (t == 'TIME') {
			return '<input type=text class=EWA_INPUT onclick="EWA.UI.Calendar.Pop(this,true);" readonly !!>';
		} else if (t == 'STRING' || t == 'NUMBER') {
			return '<input type=text class=EWA_INPUT !!>';
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
		var css1 = [ this._GetClassNameNoTag(td) + tag ];
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
		var css1 = [ this._GetClassNameNoTag(td) + tag ];
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
				srcElement : this
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
		for ( var a in cmd) {
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
		if(t1 - t0 < 100){ 
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
			TEXT : nodeText,
			CMD : actionCommand,
			REGEX : nodeRegex,
			INFO : infoName
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
		var obj = $('#EWA_TREE_'+this._Id+' .ewa-tree-node[id="'+id+'"]');
		if(obj.length == 0){
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
		for ( var a in this.Icons) {
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
			if (node.AddParas[i] != null && node.AddParas[i] != undefined) {
				paras += "EWA_P" + i + "=\"" + node.AddParas[i] + "\" ";
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
	CUR : null,
	C : EWA_TreeClass,
	Node : EWA_TreeNodeClass
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
};