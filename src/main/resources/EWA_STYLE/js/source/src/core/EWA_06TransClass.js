EWA_Tanslator_Providers = {
	BAIDU : {
		http : "/cm/back_admin/common/trans_baidu.jsp",
		Trans : function(fromObj, toObj, fromCallClass, fromLang, toLang) {
			var funcName = '___GDX_BING_' + fromCallClass.idx;
			var fromStr = fromCallClass.get_text(fromObj);

			var tmp_obj_id = 'EWA_Tanslator_Providers_baidu';
			if (!$X(tmp_obj_id)) {
				$('body').append('<div id="' + tmp_obj_id + '" style="display:none"></div>');
			}
			$('#' + tmp_obj_id).html(fromStr);
			fromStr = $('#' + tmp_obj_id).text().trim();

			// 发起请求内容
			var s = document.createElement("script");
			var u = this.http + "?from=" + fromLang + "&to=" + toLang;
			var data = {
				q : fromStr
			};
			$JP(u, data, EWA_Tanslator_Providers.BAIDU.__transCallBack, fromObj, toObj, fromCallClass);
		},
		__transCallBack : function(rstJson, args) {
			var from_call_class = args[2];
			
			if(!rstJson.trans_result || !rstJson.trans_result.data){
				// 完成数量+1
				from_call_class.idx_ok++;
				// 检查是否全部完成
				from_call_class.check_complete();
				
				return;
			}
			var to_obj = args[1];
			

			var ss = [];
			for (var i = 0; i < rstJson.trans_result.data.length; i++) {
				ss.push(rstJson.trans_result.data[i].dst);
			}
			rst = ss.join('\n');

			if (to_obj) {
				if (typeof to_obj == 'string') {
					// 对象的ID
					to_obj = $X(to_obj);
				}
				if (to_obj) {
					var tag = to_obj.tagName;

					if (tag == null) {
						tag = '';
					}
					tag = tag.toUpperCase();
					if (tag == '') {
						console.log("trans-error:" + to_obj);
					} else if (tag == 'SELECT' || tag == 'INPUT' || tag == 'TEXTAREA') {
						to_obj.value = rst;
						to_obj.setAttribute('ewa_trans_end', 'ok');
						if (to_obj.onblur != null) {
							to_obj.onblur();
						}
					} else {
						to_obj.setAttribute('ewa_trans_end', 'ok');
						to_obj.innerHTML = rst;
					}
				} else {
					to_obj = rst;
				}
			}
			
			// 完成数量+1
			from_call_class.idx_ok++;
			// 检查是否全部完成
			from_call_class.check_complete();
		},
		/**
		 * cn-en
		 */
		TransToEn : function(fromObj, toObj, fromCallClass) {
			EWA_Tanslator_Providers.BAIDU.Trans(fromObj, toObj, fromCallClass, 'zh', 'en');
		},
		/**
		 * en - cn
		 */
		TransToCn : function(fromObj, toObj, fromCallClass) {
			EWA_Tanslator_Providers.BAIDU.Trans(fromObj, toObj, fromCallClass, 'en', 'zh');
		}
	},
	BING : { // bing
		key : '50F7C8D4BC00A6E047C046D012F334DEC61FA003',
		http : '//api.microsofttranslator.com/V2/Ajax.svc/Translate?appid=50F7C8D4BC00A6E047C046D012F334DEC61FA003',

		Trans : function(fromObj, toObj, fromCallClass, fromLang, toLang) {
			var funcName = '___GDX_BING_' + fromCallClass.idx;

			window[funcName] = {
				id : funcName,
				is_run : true,
				to_obj : toObj,// 用户回调
				// 调用类
				from_call_class : fromCallClass,
				// 来源对象,文字或htmlElement
				from_obj : fromObj,
				// 生成 bing 请求的回调trans_call_back;
				provider_call_back : function(rst) {
					EWA_Tanslator_Providers.BING.trans_call_back(rst, this);
				}
			};

			var fromStr = fromCallClass.get_text(fromObj);
			// 发起请求内容
			var s = document.createElement("script");
			var u = this.http + "&oncomplete=window." + funcName + ".provider_call_back" + "&from=" + fromLang + "&to=" + toLang
				+ "&text=" + fromStr.toURL();
			s.src = u;
			document.getElementsByTagName("head")[0].appendChild(s);
		},
		/**
		 * cn-en
		 */
		TransToEn : function(fromObj, toObj, fromCallClass) {
			EWA_Tanslator_Providers.BING.Trans(fromObj, toObj, fromCallClass, 'zh-CHS', 'en');
		},
		/**
		 * en - cn
		 */
		TransToCn : function(fromObj, toObj, fromCallClass) {
			EWA_Tanslator_Providers.BING.Trans(fromObj, toObj, fromCallClass, 'en', 'zh-CHS');
		},
		/**
		 * bing 请求回调的脚本callBack
		 */
		trans_call_back : function(rst, from) {
			var to_obj = from.to_obj;

			window[from.id] = null;

			from.is_run = false;
			// 完成数量+1
			from.from_call_class.idx_ok++;
			// 检查是否全部完成
			from.from_call_class.check_complete();
			from.from_call_class.call_item_callback(from.from_obj, rst);
			if (to_obj) {
				if (typeof to_obj == 'string') {
					// 对象的ID
					to_obj = $X(to_obj);
				}
				if (to_obj) {
					var tag = to_obj.tagName;

					if (tag == null) {
						tag = '';
					}
					tag = tag.toUpperCase();
					if (tag == '') {
						console.log("trans-error:" + to_obj);
					} else if (tag == 'SELECT' || tag == 'INPUT' || tag == 'TEXTAREA') {
						to_obj.value = rst;
						to_obj.setAttribute('ewa_trans_end', 'ok');
						if (to_obj.onblur != null) {
							to_obj.onblur();
						}
					} else {
						to_obj.setAttribute('ewa_trans_end', 'ok');
						to_obj.innerHTML = rst;
					}
				} else {
					to_obj = rst;
				}
			}
			for ( var n in from) {
				from[n] = null;// clear memory
			}
		}
	},

	YOUDAO : {
		/*
		 * 有道翻译API申请成功 API key：1597375709 keyfrom：wwwoneworldcc 创建时间：2012-05-04
		 * 网站名称：wwwoneworldcc 网站地址：http://www.oneworld.cc
		 * http://fanyi.youdao.com/openapi.do?keyfrom=wwwoneworldcc&key=1597375709&type=data&doctype=<doctype>&version=1.1&q=要翻译的文本
		 */
		key : "1597375709",
		http : "//fanyi.youdao.com/openapi.do?keyfrom=wwwoneworldcc&key=1597375709&type=data&doctype=<doctype>&version=1.1&q="
	}
};
function EWA_TanslatorCalss() {
	this.PROVIDER = 'BAIDU';
	this.SKIP_EXISTS = true; // 不翻译已经存在的
	/**
	 * 翻译全部
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
		var obj1 = toObj;
		if (this.trans == null) {
			this.trans = EWA_Tanslator_Providers[this.PROVIDER];
		}
		if (transToLang == 'cn') {
			this.trans.TransToCn(fromObj, obj1, this);
		} else {
			this.trans.TransToEn(fromObj, obj1, this);
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
