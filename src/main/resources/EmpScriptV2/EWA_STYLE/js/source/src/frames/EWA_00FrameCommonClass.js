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
