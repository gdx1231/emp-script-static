/**
 * 提交后的行为
 */
var EWA_Behavior = {};
EWA_Behavior.RELOAD_PARENTA = function(frameUnid) {
	var win = window.parent;
	try {
		if (win.EWA.F.FOS[frameUnid] && win.EWA.F.FOS[frameUnid].Reload) {
			win.EWA.F.FOS[frameUnid].Reload();
		} else {
			win.location = win.location.href;
		}
	} catch (e) {
		win.location = win.location.href;
	}
};
/**
 * 刷新父体列表的内容
 */
EWA_Behavior.RELOAD_PARENT = function(frameUnid) {
	let win = EWA_Behavior.getParentWindow();
	if (!win) {
		return;
	}
	let frame = EWA_Behavior.getParentFrame(frameUnid);
	try {
		if (frame) {
			// 参数url用于列表判断重新加载来源的调用 2019-03-01
			let formUrl = window.location.href;
			frame.Reload(formUrl);
		} else {
			console.warn('not found parent frame:'+frameUnid);
			_EWA_DialogWnd.CloseWindow();
			win.location = win.location.href;
		}
	} catch (e) {
		console.log(e);
		win.location = win.location.href;
	}
};
EWA_Behavior.getParentWindow = function() {
	if (window._EWA_DialogWnd == null) {
		return null;
	}
	let win = _EWA_DialogWnd._OpenerWindow;
	return win;
};
EWA_Behavior.getParentFrame = function(frameUnid) {
	let win = EWA_Behavior.getParentWindow();
	if (win && win.EWA && win.EWA.F && win.EWA.F.FOS && win.EWA.F.FOS[frameUnid]) {
		return win.EWA.F.FOS[frameUnid];
	} else {
		return null;
	}
};
/**
 * 关闭自身的对话框
 */
EWA_Behavior.CLOSE_SELF = function() {
	if (window._EWA_DialogWnd == null) {
		self.close();
		return;
	}
	_EWA_DialogWnd.CloseWindow();
};
/**
 * 清除自身form的内容
 */
EWA_Behavior.CLEAR_SELF = function() {
	self.document.forms[0].reset();
};

/**
 * Frame提交后，刷新父体（ListFrame或其它）的数据
 * 
 * @param postBehavior
 * @param frameUnid
 *            父体的EWA对象 (EWA.F.FOS[frameUnid])
 * @returns
 */
function EWA_PostBehavior(postBehavior, frameUnid) {
	if (postBehavior.indexOf('RELOAD_PARENTA') < 0) {
		try {
			if (!window._EWA_DialogWnd) {
				console.log('not parent window');
				return;
			}

			if (window.STOP_RELOAD) {
				window.STOP_RELOAD = false;
				return;
			}

			var w = _EWA_DialogWnd._OpenerWindow;
			var o = w.__Dialog[frameUnid];

			if (o && o.AfterMsg) {
				w.EWA.UI.Msg.Alert(o.AfterMsg, _EWA_INFO_MSG['EWA.SYS.CHOOSE_ITEM_TITLE']);
			}
		} catch (e) {
			console.log(e);
		}
	}
	let parentFrame = EWA_Behavior.getParentFrame(frameUnid);
	if (parentFrame) {
		parentFrame.outParams = []; //输出参数集合
		for (let i = 2; i < arguments.length; i++) {
			parentFrame.outParams.push(arguments[i]);
		}
	}
	var behaviors = postBehavior.split(",");
	for (var i = 0; i < behaviors.length; i = i + 1) {
		EWA_Behavior[behaviors[i]](frameUnid);
	}
};