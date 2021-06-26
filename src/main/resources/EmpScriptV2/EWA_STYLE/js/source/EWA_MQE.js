/**
 * 消息
 */

function EWA_MqeClass() {
	this.FromId = null; // 来源ID
	this.Type = null; //
	this.Data = null;
}
function Ewq_MqeListenerClass() {
	this.Win = null;
	this.CheckId = null;
	this.FuncName = null;
	this.LastMsg = null;
	this.LastResult = false;
}

function EWA_MqeManagerClass() {
	this._Listeners = [];
	this.AddListener = function(listener) {
		this._Listeners.push(listener);
	}
	/**
	 * 
	 * @param {EWA_MqeClass}
	 *            mqe
	 */
	this.AddMqe = function(mqe) {
		alert(mqe.Data)
		for (var i = 0; i < this._Listeners.length; i++) {
			var listener = this._Listeners[i];
			if (listener == null) {
				continue;
			}
			if (mqe.FromId != listener.CheckId) {
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

		try {
			var w = listener.Win;
			var func = eval('w.' + listener.FuncName);
			func(mqe);
			return true;
		} catch (e) {
			return e;
		}

	}

}
function EWA_MqeCreate() {
	EWA['MQE'] = new EWA_MqeManagerClass();
}