/**
 * 提示消息框
 */
function EWA_UI_MsgClass(msg, isSelfWindow) {
	this._IsSelfWindow = isSelfWindow;
	this._Dialog = null;
	this._Msg = msg;
	this._Buttons = [];
	this._Caption = null;
	this._Icon = "MSG_ICON" // MSG_ICON,ERR_ICON,QUS_ICON;

	this.SetIcon = function(icon) {
		this._Icon = icon;
	}
	this.SetCaption = function(txtCap) {
		this._Caption = txtCap;
	}
	this.AddButton = function(text, event) {
		this._Buttons.push({
			Text : text,
			Event : event
		});
	}
	this.AddButtons = function(buts) {
		if (buts == null)
			return;
		for (var i = 0; i < buts.length; i++) {
			this._Buttons.push(buts[i]);
		}
	}
	this._Init = function() {
		var id = Math.random();
		this._Dialog = __Dialog.OpenWindow('about:blank', id, 500, 200,
				this._IsSelfWindow);
		this._Dialog._FromMsgClass = this;
		this._Dialog.SetHtml(this._CreateHtml());

		this._Dialog.SetCaption(this._Caption);
		var divCnt = this._Dialog._Dialog.GetFrameContent()
				.getElementsByTagName('table')[0];
		var divFrame = this._Dialog._Dialog.GetFrame();

		divFrame.style.width = divCnt.clientWidth + 'px';
		divFrame.style.height = divCnt.clientHeight + 'px';
	}
	this._CreateHtml = function() {
		var s = [];
		s.push("<table border=0 class='MSG_INFO'>");
		s.push("<tr><td rowspan=2 style='width:130px;' align='center'>");
		s.push("<div class='" + this._Icon + "'>&nbsp;</div></td>");
		s.push("<td class='MSG_TEXT'>");
		s.push(this._Msg);
		s.push("</td></tr>");
		s.push("<tr><td class='MSG_BUTS'>");

		var cjs = this._CloseWindowJs();
		if (this._Buttons.length > 0) {
			s.push("<hr><table><tr>")
			for (var i = 0; i < this._Buttons.length; i++) {
				var but = this._Buttons[i];
				s.push("<td>");
				var s1 = "<button _ewa_msg_default='" + (but.Default ? 1 : 0)
						+ "'  type='button' _ewa_dialog_='" + this._Dialog.Id
						+ "' ";

				if (but.Event && typeof but.Event == 'function') {
					s1 += " onclick=\"_EWA_UI_WINDOW_LIST[this.getAttribute('_ewa_dialog_')]._FromMsgClass.fire("
							+ i + ")\">" + but.Text + "</button>";
				} else {
					var evt = (!but.Event) ? cjs : but.Event + ";" + cjs;
					s1 += " onclick=\"" + evt + "\">" + but.Text + "</button>";
				}
				s.push(s1);
				s.push("</td>");
			}
			s.push("</tr></table>");
		}
		s.push("</td></tr></table>");
		return s.join('');
	};
	this.fire = function(buttonIndex) {
		var but = this._Buttons[buttonIndex];
		if (but && but.Event) {
			try {
				but.Event(this);
			} catch (e) {
				console.log(e);
			}
		}
		this.Hidden();
	};
	this._CloseWindowJs = function() {
		return "var a=this.getAttribute('_ewa_dialog_'); _EWA_UI_WINDOW_LIST[a].CloseWindow();";
	};
	this.Show = function(isShow, isInApp) {
		if (this._Dialog == null) {
			this._Init();
		}
		// this._Dialog.Show(isShow);

		if (isShow) {
			var buts = this._Dialog._ParentWindow.document
					.getElementsByTagName('button');

			if (isInApp) { // 在app中touch 事件会造成错误点击
				// 位置通过css定义
				var thisButs = [];
				// 隐含按钮
				for (var i = 0; i < buts.length; i++) {
					var but = $(buts[i]);
					if (but.attr('_ewa_dialog_') == this._Dialog.Id) {
						but.prop('disabled', true);
						thisButs.push(but);

					}
				}
				// 显示按钮
				setTimeout(function() {
					for ( var n in thisButs) {
						thisButs[n].prop('disabled', false);
					}
				}, 435);
			} else {
				this._Dialog.ResizeByContent();
				this._Dialog.MoveCenter();

				for (var i = 0; i < buts.length; i++) {
					if (buts[i].getAttribute('_ewa_msg_default') == 1
							&& buts[i].getAttribute('_ewa_dialog_') == this._Dialog.Id) {
						buts[i].focus();
						break;
					}
				}
			}

		}
	}
	this.Hidden = function() {
		this.Show(false);
		this._Dialog.CloseWindow();
	}
}

EWA.UI.Msg = {
	IS_IN_APP : false, // 是否在App中，外部定义，在app中touch 事件会造成错误点击
	C : EWA_UI_MsgClass,
	/**
	 * 显示消息
	 * 
	 * @param {}
	 *            txtMsg 消息内容
	 * @param {}
	 *            buttons 按键
	 * @param {}
	 *            txtCaption 标题
	 * @param {}
	 *            txtIcon 图标，css名称
	 * @return {}
	 */
	Show : function(txtMsg, buttons, txtCaption, txtIcon) {
		if (txtMsg.indexOf("(") > 0 && txtMsg.indexOf(")") > 0) {
			try {
				txtMsg = eval(txtMsg);
			} catch (e) {
				console.log(txtMsg);
			}
		}
		var msg = new EWA_UI_MsgClass(txtMsg);
		msg.SetCaption(txtCaption)
		msg.AddButtons(buttons);
		msg.SetIcon(txtIcon)

		// 在app中touch 事件会造成错误点击
		msg.Show(true, EWA.UI.Msg.IS_IN_APP);
		return msg;
	},
	ShowInfo : function(txtMsg, buttons, txtCaption) {
		__EWA_MSG__ = EWA.UI.Msg.Show(txtMsg, buttons, txtCaption, "MSG_ICON");
		$(__EWA_MSG__._Dialog._Dialog.GetFrame()).addClass('ewa-msg-info');
		return __EWA_MSG__;
	},
	ShowError : function(txtMsg, txtCaption) {
		var buts = [];
		buts[0] = {
			Text : _EWA_INFO_MSG['BUT.OK'],
			Event : null,
			Default : true
		};
		__EWA_MSG__ = EWA.UI.Msg.Show(txtMsg, buts, txtCaption, "ERR_ICON");
		$(__EWA_MSG__._Dialog._Dialog.GetFrame()).addClass('ewa-msg-err');
		return __EWA_MSG__;
	},
	Alter : function(txtMsg, txtCaption) {
		var buts = [];
		buts[0] = {
			Text : _EWA_INFO_MSG['BUT.OK'],
			Event : null,
			Default : true
		};
		__EWA_MSG__ = EWA.UI.Msg.Show(txtMsg, buts, txtCaption, "MSG_ICON");
		$(__EWA_MSG__._Dialog._Dialog.GetFrame()).addClass('ewa-msg-alert');
		return __EWA_MSG__;
	},
	Alert : function(txtMsg, txtCaption) {
		var buts = [];
		buts[0] = {
			Text : _EWA_INFO_MSG['BUT.OK'],
			Event : null,
			Default : true
		};
		__EWA_MSG__ = EWA.UI.Msg.Show(txtMsg, buts, txtCaption, "MSG_ICON");
		$(__EWA_MSG__._Dialog._Dialog.GetFrame()).addClass('ewa-msg-alert');
		return __EWA_MSG__;
	},
	Confirm : function(txtMsg, txtCaption, yesFunction, noFunction) {
		var buts = [];
		buts[0] = {
			Text : _EWA_INFO_MSG['BUT.YES'],
			Event : yesFunction
		};
		buts[1] = {
			Text : _EWA_INFO_MSG['BUT.NO'],
			Event : noFunction,
			Default : true
		};
		__EWA_MSG__ = EWA.UI.Msg.Show(txtMsg, buts, txtCaption, "QUS_ICON");
		$(__EWA_MSG__._Dialog._Dialog.GetFrame()).addClass('ewa-msg-confirm');
		return __EWA_MSG__;
	},
	_Tip : function(msg, cssBox, cssText, interval) {
		var obj = document.createElement('table');
		document.body.appendChild(obj);
		$(obj).css(cssBox);
		var td = obj.insertRow(-1).insertCell(-1);
		$(td).css(cssText);
		if (interval && interval instanceof Function) {
			td.innerHTML = '<i class="fa fa-refresh fa-spin"></i> ' + msg;
			// 定时检查function是否返回true
			var timer = setInterval(function() {
				if (interval()) {
					window.clearInterval(timer);

					$(obj).animate({
						opacity : 0
					}, 200, function() {
						$(obj).remove();
					});
				}
			}, 300);
		} else {
			td.innerHTML = msg;
			if (!interval || isNaN(interval)) {
				interval = 1500;// 1.5s
			}

			setTimeout(function() {
				$(obj).animate({
					opacity : 0
				}, 200, function() {
					$(obj).remove();
				});
			}, interval);
		}
	},
	Tip : function(msg, interval) {
		var z = window._EWA_UI_DIALOG_COVERINDEX ? window._EWA_UI_DIALOG_COVERINDEX + 10
				: 1000000;
		var css_box = {
			width : 300,
			height : 80,
			padding : 10,
			'background-color' : 'rgba(10,20,30,0.7)',
			position : 'fixed',
			top : '50%',
			left : '50%',
			'margin-left' : -150,
			'margin-top' : -40 - 10 - 10,
			'border-radius' : 10,
			'z-index' : z,
			'color' : '#fff'
		};
		if (EWA.B.IE && EWA.B.VERSION * 1 < 9) {
			css_box['filter'] = "progid:DXImageTransform.Microsoft.Gradient(GradientType=0,StartColorStr='#77000000',EndColorStr='#77000000')";
		}
		var css_text = {
			'text-align' : 'center',
			'font-size' : 16,
			'line-height' : 1.5
		};
		EWA.UI.Msg._Tip(msg, css_box, css_text, interval);
	},
	TipBR : function(msg, interval) {// 在页面底部显示消息
		var z = window._EWA_UI_DIALOG_COVERINDEX ? window._EWA_UI_DIALOG_COVERINDEX + 10
				: 1000000;
		var css_box = {
			height : 20,
			padding : 2,
			'background-color' : 'rgba(222,222,0,0.7)',
			position : 'fixed',
			bottom : 5,
			right : 5,
			'border-radius' : 1,
			'z-index' : z,
			'color' : '#111'
		};
		if (EWA.B.IE && EWA.B.VERSION * 1 < 9) {
			css_box['filter'] = "progid:DXImageTransform.Microsoft.Gradient(GradientType=0,StartColorStr='#66000000',EndColorStr='#66000000')";
		}
		var css_text = {
			'text-align' : 'center',
			'font-size' : 12,
			'line-height' : 1.5
		};
		EWA.UI.Msg._Tip(msg, css_box, css_text, interval);
	},
	TipBL : function(msg, interval) {// 在页面底部显示消息
		var z = window._EWA_UI_DIALOG_COVERINDEX ? window._EWA_UI_DIALOG_COVERINDEX + 10
				: 1000000;
		var css_box = {
			height : 20,
			padding : 2,
			'background-color' : 'rgba(222,222,0,0.7)',
			position : 'fixed',
			bottom : 5,
			left : 5,
			'border-radius' : 1,
			'z-index' : z,
			'color' : '#111'
		};
		if (EWA.B.IE && EWA.B.VERSION * 1 < 9) {
			css_box['filter'] = "progid:DXImageTransform.Microsoft.Gradient(GradientType=0,StartColorStr='#66000000',EndColorStr='#66000000')";
		}
		var css_text = {
			'text-align' : 'center',
			'font-size' : 12,
			'line-height' : 1.5
		};
		EWA.UI.Msg._Tip(msg, css_box, css_text, interval);
	},
	TipTL : function(msg, interval) {// 在页面底部显示消息
		var z = window._EWA_UI_DIALOG_COVERINDEX ? window._EWA_UI_DIALOG_COVERINDEX + 10
				: 1000000;
		var css_box = {
			height : 20,
			padding : 2,
			'background-color' : 'rgba(222,222,0,0.7)',
			position : 'fixed',
			top : 5,
			left : 5,
			'border-radius' : 1,
			'z-index' : z,
			'color' : '#111'
		};
		if (EWA.B.IE && EWA.B.VERSION * 1 < 9) {
			css_box['background-color'] = "filter:progid:DXImageTransform.Microsoft.Gradient(GradientType=0,StartColorStr='#00000000',EndColorStr='#66000000')";
		}
		var css_text = {
			'text-align' : 'center',
			'font-size' : 12,
			'line-height' : 1.5
		};
		EWA.UI.Msg._Tip(msg, css_box, css_text, interval);
	},
	TipTR : function(msg, interval) {// 在页面底部显示消息
		var z = window._EWA_UI_DIALOG_COVERINDEX ? window._EWA_UI_DIALOG_COVERINDEX + 10
				: 1000000;
		var css_box = {
			height : 20,
			padding : 2,
			'background-color' : 'rgba(222,222,0,0.7)',
			position : 'fixed',
			top : 5,
			right : 5,
			'border-radius' : 1,
			'z-index' : z,
			'color' : '#111'
		};
		if (EWA.B.IE && EWA.B.VERSION * 1 < 9) {
			css_box['background-color'] = "filter:progid:DXImageTransform.Microsoft.Gradient(GradientType=0,StartColorStr='#00000000',EndColorStr='#66000000')";
		}
		var css_text = {
			'text-align' : 'center',
			'font-size' : 12,
			'line-height' : 1.5
		};
		EWA.UI.Msg._Tip(msg, css_box, css_text, interval);
	}
};
/**
 * 用于标记对象，显示后showSeconds后消失
 * 
 * @param obj
 *            标记的对象/jq对象集合
 * @param showSeconds
 *            显示秒数
 */
$Mark = function(obj, showSeconds) {
	var se = showSeconds || 3;
	var ms = showSeconds * 1000 || 3000; // 默认3秒
	var s = "<div class='ewa-mark' style='transition-duration:" + se
			+ "s;'></div>";
	$(obj).each(function() {
		var o = $(s);
		var p = $(this).offset();
		var css = {
			left : p.left + 2,
			top : p.top - 2,
			width : $(this).outerWidth(),
			height : $(this).outerHeight()
		};
		o.css(css);
		$('body').append(o);
		setTimeout(function() {
			// 动画隐含
			o.css('opacity', 0);
		}, 10);
		setTimeout(function() {
			// 移除对象
			o.remove();
		}, ms + 10);
	});
};
$Confirm = EWA.UI.Msg.Confirm;
$Tip = EWA.UI.Msg.Tip;
$TipBR = EWA.UI.Msg.TipBR;
$TipBL = EWA.UI.Msg.TipBL;
$TipTR = EWA.UI.Msg.TipTR;
$TipTL = EWA.UI.Msg.TipTL;