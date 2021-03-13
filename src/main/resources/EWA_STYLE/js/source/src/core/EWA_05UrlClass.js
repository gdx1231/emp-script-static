/**
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
