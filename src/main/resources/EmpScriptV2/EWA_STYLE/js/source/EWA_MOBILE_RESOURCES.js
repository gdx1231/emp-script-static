/**
 * 用于调用远程资源到phonegap应用，动态更新
 * 
 * 将本脚本放到首页
 * 
 * 
 * @memberOf {TypeName}
 * @return {TypeName}
 */
if (!window.EWA) {
	EWA = {
		B : {
			IE : false
		}
	};

	/**
	 * 模拟Ajax类
	 */
	function _EWA_AjaxClass(isAsync) {
		this._Http;
		this.ResutValue;
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
				var t = document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop;
				o1.style.top = t + 'px';
			}
			o1 = null;
		};

		/**
		 * 生成等待文字提示
		 */
		this._CreateWaittingText = function() {
			var o1 = document.createElement("DIV");
			o1.id = this._WaittingId;
			var t = document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop;
			cssText = "width:70px; height:20px; background-color:darkred; font-size:12px; "
				+ "color:white; position:absolute;left:0px;top:" + t + "px";
			if (EWA.B.IE) {
				o1.style.cssText = cssText;
			} else {
				o1.setAttribute("style", cssText);
			}
			o1.innerHTML = "Waiting...";
			document.body.appendChild(o1);
			o1 = null;
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
			for ( var n in this._Parameters) {
				var v = this._Parameters[n];
				if (v == null) {
					continue;
				}
				s.push(n + '=' + v);
			}
			this.Post(url, s.join('&'), callback);
		};
		this.Post = function(url, sinfo, callback) {
			// this._ShowWaitting();
			if (callback != null) {
				this._Http.onreadystatechange = callback;
			}

			this._Http.open("POST", url, !isAsync);
			this._Http.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
			this._Http.send(sinfo);
			if (!isAsync) {// 同步方式不能设置timeout
				try {
					this._Http.timeout = 14 * 1000;
				} catch (e) {
					console.log(e);
				}
			}
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

				return true;
			}
		}
		this.Dispose = function() {
			this._Http = null;
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
}
/**
 * 使用window.localStorage保存资源，css,js,html，调用时放到页面上
 * 
 * @memberOf {TypeName}
 * @return {TypeName}
 */
function EWA_MobileCache(msgObj, appName) {
	this.msgObj = msgObj;
	this.checkURL;
	this.IS_SUPPORT = window.localStorage != null;
	this.APP_NAME = appName;

	this.save = function(id, content, vaildKey, type, appName) {
		if (this.IS_SUPPORT) {
			window.localStorage[id] = content;
			window.localStorage[id + ":key"] = vaildKey; // 资源的hashcode
			// js css ...
			window.localStorage[id + ":type"] = type;
			window.localStorage[id + ":app"] = appName;
		}
	};
	this.delete1 = function(id) {
		if (this.IS_SUPPORT) {
			window.localStorage.removeItem(id);
			window.localStorage.removeItem(id + ":key");
			window.localStorage.removeItem(id + ":type");
			window.localStorage.removeItem(id + ":app");
		}
	};
	this.loadItem = function(id) {
		if (this.IS_SUPPORT && window.localStorage[id + ":key"]) {
			var appName = window.localStorage[id + ":app"];
			if (appName == "ALL" || appName == this.APP_NAME) {
				var d = {
					id : id,
					content : window.localStorage[id],
					key : window.localStorage[id + ":key"],
					type : window.localStorage[id + ":type"],
					app : appName
				};
				return d;
			}
		}
	};
	this.loadAll = function() {
		var ss = [];
		for ( var id in window.localStorage) {
			if (id.indexOf(":") > 0) {
				continue;
			}
			var o = this.loadItem(id);
			if (o) {
				ss.push(o);
			}
		}
		return ss;
	};
	/**
	 * 通过远程检查资源是否一致
	 * 
	 * @memberOf {TypeName}
	 * @return {TypeName}
	 */
	this.checkAll = function() {
		var ss = [];
		var ss1 = [];
		var checkedMap = {};
		for ( var id in window.localStorage) {
			var key = window.localStorage[id + ':key'];
			var app = window.localStorage[id + ':app'];
			if (key && (app == 'ALL' || app == this.APP_NAME)) {
				// console.log(app + ',' + id);
				ss.push(id);
				ss1.push(key);
				checkedMap[id] = 0;
			}
		}
		if (!this.checkURL) {
			alert('请设置checkURL');
			return;
		}
		var c = this;
		var u = this.checkURL;

		var c = this;
		var ajax = new _EWA_AjaxClass();
		this.chekedIds = checkedMap;
		ajax.AddParameter("ids", ss.join(","));
		ajax.AddParameter("keys", ss1.join(","));
		ajax.PostNew(u, function() {
			if (!ajax.IsRunEnd()) {
				return;
			}
			var rst = ajax.GetRst();
			if (ajax.IsError()) {
				c.msgObj.innerHTML = "服务器访问失败 <a style='color:white' href='javascript:loadResources()'>重试</a>";
				return;
			}
			var data = null;
			eval('data=' + rst);
			c._checkAll(data);
		});
	};
	this._checkAll = function(data) {
		for ( var id in data) {
			if (this.chekedIds[id] != null) {
				this.chekedIds[id] = 1;
			}
			var d = data[id];
			if (d.CNT.length > 0) {
				if (d.CNT == "DELETE") {
					this.delete1(id);
				} else {
					this.save(id, d.CNT, d.HASH, d.TYPE, d.APP);
				}
			}
		}
		for ( var n in this.chekedIds) {
			if (this.chekedIds[n] == 0) {// deleted
				this.delete1(n);
			}
		}
		this.res_data = data;
		this.reWrite();
	};
	/**
	 * 写资源到document上
	 * 
	 * @memberOf {TypeName}
	 */
	this.reWrite = function() {
		var ss = this.loadAll();
		var ss1 = [];
		var max1 = ss.length + 1;
		if (this.res_data) {// 设定加载顺序
			for ( var id in ss) {
				var d = ss[id];
				var id = d.id;
				if (this.res_data[id].IDX) {
					var idx = this.res_data[id].IDX * 1;
					ss1[idx] = d;
				} else {
					ss1[max1] = d;
					max1++;
				}
			}
			ss = ss1;
		}

		var htm = [];
		var scr = {};
		var css = [];
		for ( var id in ss) {
			var d = ss[id];
			if (d == null) {
				continue;
			}

			if (d.type == 'js') {
				var o = document.createElement("script");
				o.type = "text/javascript";
				var idx = d.content.indexOf('\n');
				var name = d.id;

				o.text = d.content;
				if (idx > 0 && idx < 100) {
					var s1 = d.content.substring(0, idx);
					var s2 = s1.split(':');
					if (s2.length == 2 && s2[0].indexOf('load_idx') > 0) {
						name += s2[1].trim();
						o.id = "zscript__" + name;
					}
				}

				if (!o.id) {
					o.id = "__script__" + name;
				}
				scr[o.id] = o;
			} else if (d.type == 'css') {
				var o = document.createElement("style");
				o.textContent = d.content;
				var name = d.id;
				o.id = "___style__" + name;
				o.type = "text/css";
				css.push(o);
			} else {
				htm.push(d.content);
			}
		}
		document.designMode = "on";
		document.documentElement.innerHTML = htm.join("\n");
		document.designMode = "off";

		var head = document.getElementsByTagName('head')[0];
		for ( var n in css) {
			head.appendChild(css[n]);
			// console.log(css[n].id);
		}

		for ( var idx in scr) {
			if (idx.indexOf('z') == 0) {
				// 保证后加载
				continue;
			}
			head.appendChild(scr[idx]);
			// console.log(idx);
			scr[idx] = null;
		}
		for ( var idx in scr) {
			if (scr[idx]) {
				head.appendChild(scr[idx]);
				// console.log(idx);
			}
		}

		this.startWork();
		// this.initStyles();
	};
	this.startWork = function() {
		alert('pls set this function(EWA_MobileCache.startWork)');
	};
	this._Css = {};
	this.initStyles = function() {
		for ( var n in document.styleSheets) {
			var ss = document.styleSheets[n];
			for ( var m in ss.rules) {
				var css = ss.rules[m];
				var name = css.selectorText;
				if (!this._Css[name]) {
					this._Css[name] = [];
				}
				this._Css[name].push(css);
			}
		}
	};
	this.changeStyle = function(cssName, newStyle) {
		for ( var n in document.styleSheets) {
			var ss = document.styleSheets[n];
			for ( var m in ss.rules) {
				var css = ss.rules[m];
				var name = css.selectorText;
				if (name && (name.indexOf(cssName + ',') >= 0 || name.endsWith(cssName))) {
					for ( var k in newStyle) {
						// if(css.style[k]){
						css.style[k] = newStyle[k];
						// console.log(css);
						// }
					}
				}
			}
		}
	}
}
if (!Node.prototype.swapNode) {
	Node.prototype.swapNode = function(node) {// 浜ゆ崲鑺傜偣
		var p = this.parentNode;
		if (this.nextSibling != node) {
			p.insertBefore(this, node);
		} else {
			p.insertBefore(node, this);
		}
	}
}
def_SYS_APP_DEFINE_JSON = {
	show_design_colors : "#08c"
}
EWA_AppDefine = {
	choose_color : function(rg) {
		var color = SYS_APP_DEFINE_JSON.show_design_colors;
		if (!color) {
			color = '#08c';
		}
		var newCss = {
			".ui-header" : {
				"backgroundColor" : color,
				"color" : "#fff",
				"text-shadow" : "0 0 0 #fff"
			},
			".ui-btn" : {
				"backgroundColor" : color,
				"color" : "#fff",
				"text-shadow" : "0 0 0 #fff"
			},
			".ui-bar-inherit" : {
				"backgroundColor" : color,
				"color" : "#fff",
				"text-shadow" : "0 0 0 #fff"
			},
			"#main_back" : {
				"backgroundColor" : color,
				"color" : "#fff",
				"text-shadow" : "0 0 0 #fff"
			},
			".icon" : {
				"color" : color,
			}
		};
		for ( var n in newCss) {
			rg.changeStyle(n, newCss[n]);
		}
	}
}
