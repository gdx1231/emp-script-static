EWA_Tanslator_Providers = {
	BING : { // bing
		key : '50F7C8D4BC00A6E047C046D012F334DEC61FA003',
		http : 'http://api.microsofttranslator.com/V2/Ajax.svc/Translate?appid=50F7C8D4BC00A6E047C046D012F334DEC61FA003',
		trans : function(fromStr, userCallback) {
			EWA_Tanslator._IDX++;
			var funcName = '___GDX_BING_' + EWA_Tanslator._IDX;
			var funcName1 = funcName + "_userCallback";
			var funcStr = EWA_Tanslator._providers.BING.trans_call_back_tmp.toString().replace("trans_call_back_tmp", '');
			funcStr = funcStr.replace("/* FF */", "var fromClass=this;var func=window['" + funcName1 + "']");

			// 生成 trans_call_back;
			eval('window.' + funcName + '=' + funcStr);

			// 用户回调
			window[funcName1] = userCallback;

			// 发起请求内容
			var s = document.createElement("script");
			var u = bingTrans + "&oncomplete=" + funcName + "&from=zh-CHS&to=en&text=" + fromStr.toURL();
			s.src = u;
			document.getElementsByTagName("head")[0].appendChild(s);
		},
		trans_call_back_tmp : function(rst) {
			// 替换 下面 FF 脚本内容
			/* FF */
			fromClass.IsRun = false;
			if (func == null) {
				alert(rst)
				return;
			}

			if (func instanceof Function) {// 调用用户的方法
				func(rst);
				return;
			}

			if (typeof func == 'string') { // 对象的ID
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
				func.setAttribute('ewa_trans_end', 'ok');
				func.innerHTML = rst;
			} else {
				alert(rst);
			}
		}
	},
	/*
	 * 有道翻译API申请成功 API key：1597375709 keyfrom：wwwoneworldcc 创建时间：2012-05-04
	 * 网站名称：wwwoneworldcc 网站地址：http://www.oneworld.cc
	 * http://fanyi.youdao.com/openapi.do?keyfrom=wwwoneworldcc&key=1597375709&type=data&doctype=<doctype>&version=1.1&q=要翻译的文本
	 */
	YOUDAO : {
		key : "1597375709",
		http : "http://fanyi.youdao.com/openapi.do?keyfrom=wwwoneworldcc&key=1597375709&type=data&doctype=<doctype>&version=1.1&q="
	}
};