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
	this.transAllToCn = function(objs_ch, objs_en, transCompleteItemCallBack, transCompleteCallback) {
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
		$Tip('enus' == EWA.LANG ? "Translate started" : "翻译开始", () => {
			return this.check_complete();
		});
	};
	/**
	 * 开始翻译
	 * @param {} transToLang 
	 * @returns 
	 */
	this.start_trans = function(transToLang) {
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
			this.trans.transAfter = function(rst, func) {
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
	this.get_text = function(fromObj) {
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
	this.call_item_callback = function(fromObj, rst) {
		if (this._transCompleteItemCallBack) {
			this._transCompleteItemCallBack(fromObj, rst);
		}
	}
	this.check_complete = function() {
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
	this.TransToEn = function(hz, func) {
		this.transToEn(hz, func);
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
				// delete window[this._Id];
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

		} else if (tag == 'DIV' || tag == 'SPAN' || tag == 'A' || tag == 'P' 
			|| tag == 'TD' || tag == 'TH' || tag == 'PRE' || tag == 'LI' || tag == 'BUTTON') {
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

