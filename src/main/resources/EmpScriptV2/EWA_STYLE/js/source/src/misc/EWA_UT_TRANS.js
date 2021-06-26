var EWA_UT_TansAll = {
	tall : function(objs_ch, objs_en) {
		this.idx = 0;
		this._objs_ch = objs_ch;
		this._objs_en = objs_en;

		this.start_trans();
	},
	start_trans : function() {
		if (idx <= this._objs_ch.length - 1) {
			var ch_obj = this._objs_ch[idx];
			var en_obj = this._objs_en[idx];

			this.trans_item(ipts[this.idx]);

			this.idx++;
			setTimeout(bb, 123);
			return;
		}
		setTimeout(this.post_server, 1231);
	},
	trans_item : function(fromObj, toObj) {
		var obj1 = toObj;
		if (this.trans == null) {
			this.trans = new EWA_UT_TRANS();
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
				fromObj.setAttribute('ewa_trans_end', 'no');

			} else if (tag != '') {
				fromObj.setAttribute('ewa_trans_end', 'no');
				chstr = func.innerHTML;
			} else {
				console.log("trans_err");
				console.log(fromObj);
			}
		}

		this.trans.TransToEn(chstr, obj1);
	},

	post_server : function() {
		var ids = [];
		var vals = [];
		for (var i = 0; i < ipts.length; i++) {
			var tr = ipts[i].parentNode.parentNode;
			var span = tr.cells[4].getElementsByTagName('span')[0];
			if (span.getAttribute('ewa_trans_end') == 'ok') {
				ids.push(GetInnerText(tr.cells[0]));
				vals.push(GetInnerText(span));
			}
		}
		if (ids.length == 0) {
			return;
		}
		var ajax = new EWA_AjaxClass();
		ajax.AddParameter('ids', ids.join('`'));
		ajax.AddParameter('vals', vals.join('`'));
		ajax.AddParameter('EWA_ACTION', 'EXTENDACTION2');
		ajax.AddParameter('EWA_AJAX', 'JSON');
		ajax.PostNew(window.location.href, function() {
			if (ajax.IsRunEnd()) {
				alert('ok');
			}
		});
	}

};
function EWA_TransClass() {
	/**
	 * bing trans
	 */
	this.bingAppId = '50F7C8D4BC00A6E047C046D012F334DEC61FA003';
	this.bingTrans = '//api.microsofttranslator.com/V2/Ajax.svc/Translate?appid=' + this.bingAppId;
	/*
	 * 有道翻译API申请成功 API key：1597375709 keyfrom：wwwoneworldcc 创建时间：2012-05-04
	 * 网站名称：wwwoneworldcc 网站地址：http://www.oneworld.cc
	 * http://fanyi.youdao.com/openapi.do?keyfrom=wwwoneworldcc&key=1597375709&type=data&doctype=<doctype>&version=1.1&q=要翻译的文本
	 */
	this.youdaoTrans = "//fanyi.youdao.com/openapi.do?keyfrom=wwwoneworldcc&key=1597375709&type=data&doctype=jsonp&version=1.1";

	this._Id = ("EWA_UT_TRANS" + Math.random()).replace('.', '_');

	window[this._Id] = this;
	// this._Trans = 'youdao';
	this._Trans = 'bing';
	this._IDX = 0;
	this.IsRun = false;
	this.TransToEn = function(hz, func) {
		if (hz == null || hz.trim() == '') {
			if (func instanceof Function) {// 调用用户的方法
				func(null);
			}
			return;
		}
		this.IsRun = true;
		if (this._Trans == 'bing') {
			this._trans_bing(hz, func, true);
		} else if (this._Trans == 'youdao') {
			this._trans_youdao(hz, func);
		} else {
			console.log('没有指定翻译引擎');
		}
	};
	this.TransToCn = function(english, func) {
		if (english == null || english.trim() == '') {
			if (func instanceof Function) {// 调用用户的方法
				func(null);
			}
			return;
		}
		this.IsRun = true;
		if (this._Trans == 'bing') {
			this._trans_bing(english, func, false);
		} else if (this._Trans == 'youdao') {
			this._trans_youdao(english, func);
		} else {
			console.log('没有指定翻译引擎');
		}
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
			return;
		} else if (func instanceof Function) {// 调用用户的方法
			func(rst);
			return;
		} else if (typeof func == 'string') { // 对象的ID
			func = $X(func);
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
	};
}
EWA_UT_TRANS = EWA_TransClass;
/*
 * function trans_en_baidu(fromObj, toObj) { // trans_en_google(fromObj,toObj);
 * 
 * var val = fromObj.value; if (!check_changed(fromObj)) { return; } if (val == "" ||
 * val.trim() == "") { toObj.value = ""; fromObj.value = ""; if
 * (window.saveTrans) { saveTrans(toObj); } return; } // baidu var u = EWA.CP +
 * "/utils/trans_en.jsp?q=" + val.toURL(); $J(u, trans_en_back1, toObj); }
 * function trans_en_back1(data, cmds) { if (data.IsError) { alert("错误");
 * return; } var txt; if (data.type == 1) { var d; eval('d=' + data.result); var
 * o = d.content[0].mean[0].cont; for ( var n in o) { txt = n; break; } } else {
 * txt = data.data[0].dst; } cmds[0].value = txt.toUpperCase().trim(); if
 * (window.saveTrans) { saveTrans(cmds[0]); } }
 * 
 * function trans_en(fromObj, toObj) { var val = fromObj.value; if
 * (!check_changed(fromObj)) { return; } trans_to_obj = toObj; var s =
 * document.createElement("script"); var u = bingTrans +
 * "&oncomplete=trans_en_back&from=zh-CHS&to=en&text=" + val.toURL(); s.src = u;
 * document.getElementsByTagName("head")[0].appendChild(s); } function
 * trans_en_back(s) { trans_to_obj.value = s.toUpperCase(); if
 * (window.saveTrans) { saveTrans(trans_to_obj); } }
 */