/**
 * 消息, 抛弃了
 */
function EWA_AddEvent(chkId, funcName) {
	if (top.EWA && top.EWA['MQE']) {
		return;
	}
	var l = new EWA_MqeListenerClass();
	l.CheckId = chkId;
	l.FuncName = funcName;

	top.EWA['MQE'].AddListener(l);
}

function EWA_MqeClass() {
	this.FromId = null; // 来源ID
	this.Type = null; //
	this.Data = null;
	this.Paras = GetUrlParas(true);
	this.IsServer = false; // 消息从服务器来
}
function EWA_MqeListenerClass() {
	this.Win = window;
	this.CheckId = null;
	this.FuncName = null;
	this.Paras = GetUrlParas(true);

	this.LastMsg = null;
	this.LastResult = false;
}

function EWA_MqeManagerClass() {
	this._Listeners = [];
	this.UrlServer = null;
	this.LastTimer = -1; // 上次获取时间
	this.Stop = false; // 是否停止运行
	this.AddListener = function(listener) {
		this._Listeners.push(listener);
	}
	/**
	 * 
	 * @param {EWA_MqeClass}
	 *            mqe
	 */
	this.AddMqe = function(mqe) {
		// $X('EWA_MENU').parentNode.cells[1].innerHTML = mqe.FromId + ','
		// + mqe.Type;
		window.status = mqe.FromId + ',' + mqe.Type;
		for (var i = 0; i < this._Listeners.length; i++) {
			var listener = this._Listeners[i];
			if (listener == null) {
				continue;
			}
			var ids = listener.CheckId.split(',');
			for (var k = 0; k < ids.length; k++) {
				if (mqe.FromId != ids[k]) {
					continue;
				}

				var rst = this._DoEvent(listener, mqe);
				if (rst === true) {
					this._Listeners[i].LastResult = true;
				} else if (rst === null) {
					this._Listeners[i] = null;
				} else {
					this._Listeners[i].LastMsg = rst;
					this._Listeners[i].LastResult = false;
				}
			}
		}
	}

	/**
	 * 
	 * @param {Ewq_MqeListenerClass}
	 *            listener
	 * @param {EWA_MqeClass}
	 *            mqe
	 */
	this._DoEvent = function(listener, mqe) {
		try {
			// 窗体注销了
			var doc = listener.Win.document;
		} catch (e) {
			return null;
		}
		var func;
		try {
			var w = listener.Win;
			func = eval('w.' + listener.FuncName);
			// $X('EWA_MENU').parentNode.cells[1].innerHTML = func
			func(mqe.Type, mqe.Paras, mqe.IsServer);
			func = null;
			return true;
		} catch (e) {
			func = null;
			return e;
		}

	}

	/**
	 * 创建服务器的长连接
	 * 
	 * @param {}
	 *            mqeUrl
	 * @param {}
	 *            unid
	 */
	this.CreateServer = function(mqeUrl, unid) {
		var u = new EWA_UrlClass();
		u.SetUrl(mqeUrl);
		u.AddParameter("UNID", unid);
		this.UrlServer = u.GetUrl();
	}

	this._GetEvents = function() {
		var ajax = new EWA_AjaxClass();
		var from = EWA['MQE'];
		var u = from.UrlServer + '&T=' + from.LastTimer;
		ajax.IsShowWaitting = false; // 不显示等待信息

		ajax.Get(u, function() {
			if (!ajax.IsRunEnd()) {
				return;
			}
			var rst = ajax.GetRst();
			if (ajax.IsError()) {
				if (window.EWA_AjaxErr) {
					window.EWA_AjaxErr(rst);
				}
			} else {
				var rst = rst.trim();
				from.ParseMsg(rst);
				from.Mon();
			}
		});
	}

	/**
	 * 监控
	 */
	this.Mon = function() {
		if (userAgent.indexOf('ipad') > 0 || userAgent.indexOf('iphone') > 0) {
			return;
		}
		var o = EWA['MQE'];
		if (o.RunStopParaName != undefined) {
			o.Stop = !eval('window.' + o.RunStopParaName);
		}
		if (!o.Stop) {
			window.setTimeout(o._GetEvents, 1250);
		} else {
			window.setTimeout(o.Mon, 1250);
		}
	}
	/**
	 * 处理消息
	 * 
	 * @param {}
	 *            s
	 * @return {}
	 */
	this.ParseMsg = function(s) {
		var evts;
		try {
			eval('evts=' + s);
		} catch (e) {
			this.Stop = true;
			return;
		}

		if (!evts.E) { // 参数不正确，没有启动
			this.Stop = true;
			return;
		}

		if (evts.T < this.LastTimer) {
			return;
		}
		this.LastTimer = evts.T;

		if (evts.V.length == 0) {
			return;
		}
		var o = {};

		for (var i = evts.V.length - 1; i >= 0; i--) {
			var m = evts.V[i];
			var key = m.ID + '--GDX--' + m.TP + '---GDX---' + m.V;
			if (o[key]) {
				evts.V[i] = null; // 去除重复的事件
			} else {
				o[key] = true;
			}
		}
		for (var i = 0; i < evts.V.length; i++) {
			var m = evts.V[i];
			if (m == null) {
				continue;
			}
			var m1;
			eval('m1=' + m.V);
			var msg = new EWA_MqeClass();
			msg.FromId = m.ID;
			msg.Type = m.TP;
			msg.Paras = m1;
			msg.IsServer = true;
			this.AddMqe(msg);
		}
	}
}
/**
 * 创建消息管理器
 * 
 * @param {}
 *            mqeUrl 长连接地址
 * @param {}
 *            unid 唯一编号
 */
function EWA_MqeCreate(mqeUrl, unid, runStopParaName) {
	if (unid == null || unid.trim().length == 0) {
		alert('unid is blank');
		return;
	}

	EWA['MQE'] = new EWA_MqeManagerClass();
	EWA['MQE'].CreateServer(mqeUrl, unid);
	if (runStopParaName != undefined) { // 停止运行的开关
		EWA['MQE'].RunStopParaName = runStopParaName;
	}
	EWA['MQE'].Mon();

}