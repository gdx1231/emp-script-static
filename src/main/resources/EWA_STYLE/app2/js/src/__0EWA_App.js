//@ sourceMappingURL=app2.min.map

/*
	MonitorResize : __MonitorResize,
	State : __State,
	Section : __Section,
	LocalStore : __LocalStore,
	PicsViewer : __PicsViewer, // 图片缩放
*/
var EWA_App = {
	IS_STOP_TOUCH_MOVE : true,
	EWA_ROOT : "ewa.jsp",

	CFGS : null, // 所有配置信息
	CFGS_CURRENT : null, // 当前配置信息
	/* 在微信中 */
	IS_IN_WEIXIN : /micromessenger/ig.test(navigator.userAgent),
	/* 在小程序中 */
	IS_IN_WEIXIN_MINI : /miniprogram/ig.test(navigator.userAgent),
	/* 安卓 */
	IS_IN_ANDROID : /android/ig.test(navigator.userAgent),
	/* iphone */
	IS_IN_IPHONE : /iphone/ig.test(navigator.userAgent),

	/**
	 * 初始化配置信息
	 * 
	 * @param cfgs
	 *            配置信息列表
	 */
	initCfgs : function (cfgs) {
		var aa = {};
		for ( var n in cfgs) {
			var c = cfgs[n];
			var id = c.ID;
			var c1 = this.convertCfg(c);
			aa[id] = c1;
		}
		this.CFGS = {
			"INIT" : aa
		};
		this.CFGS_CURRENT = aa;
		__SECTIONS = this.CFGS_CURRENT;
	},
	/**
	 * 附加配置信息
	 * 
	 * @param tag
	 *            附加的标志
	 * @param cfgs
	 *            配置信息列表
	 */
	attatchCfgs : function (tag, cfgs) {
		var aa = {};
		for ( var n in cfgs) {
			var c = cfgs[n];
			var id = c.ID;
			var c1 = this.convertCfg(c);
			aa[id] = c1;
			this.CFGS_CURRENT[id] = c1;
		}
		this.CFGS[tag] = aa;
		__SECTIONS = this.CFGS_CURRENT;
	},
	changeCfgs : function (tag) {
		if (!tag) {
			tag = "INIT";
		}
		if (this.CFGS[tag]) {
			this.CFGS_CURRENT = this.CFGS[tag];
			__SECTIONS = this.CFGS_CURRENT;
		} else {
			alert(tag + "的配置信息不存在");
		}
	},
	/**
	 * 转换配置信息
	 */
	convertCfg : function (config) {
		var map_boolean = {
			IScroll : 1,
			PageFooter : 1,
			PageHeader : 1,
			Refresh : 1,
			ButtonOnFooter : 1,
			EWA : 1,
			IScrollMore : 1
		};
		var map_js = {
			Installed : 1,
			Losted : 1,
			RefreshAfter : 1,
			ShowCompleted : 1
		};
		var c1 = {};
		for ( var m in config) {
			var v = config[m];
			if (v != null && typeof v == "string") {
				v = v.trim();
			}
			if (v) {
				if (map_boolean[m]) { // 转换boolen
					c1[m] = (v == 'Y' ? true : false);
				} else if (map_js[m]) { // 转换function
					try {
						eval('window.______js=' + v);
						c1[m] = window.______js;
						delete window.______js;
					} catch (e) {
						console.log(e);
						console.log(config);
						console.log(v);
					}
				} else {
					c1[m] = v;
				}
			}
		}
		return c1;
	},
	log : function () {
		var u = "console.jsp";
		var data = {};
		for ( var n in arguments) {
			var o = arguments[n];
			try {
				var v = JSON.stringify(o);
			} catch (e) {
				v = e;
			}
			data['log' + n] = v;
		}
		$JP2(u, data, function () {

		});
	},
	/**
	 * 改变窗体高度，同时判断是否横屏
	 */
	changeBodyHeight : function (w, h, src) {
		if (!w) {
			w = document.documentElement.clientWidth;
			h = document.documentElement.clientHeight;
		}
		if (EWA_App.DEBUG)
			console.log("changeBodyHeight", w, h, src);
		$('body').css('height', h).css('width', w);
		$('section').css('width', w + 'px').attr('aw', w);
		if (w > h) {
			$('body').addClass('landscape');
		} else {
			$('body').removeClass('landscape');
		}
	},
	start : function (fristId) {
		if (!fristId) {
			$Tip('请定义 fristId《第一个页面id》');
			return;
		}
		if (!__SECTIONS[fristId]) {
			alert(' fristId《第一个页面id》对应配置项不存在__SECTIONS.' + fristId);
			return;
		}
		this.FirstId = fristId;
		window.addEventListener('orientationchange', function (event) {
			// 延时处理，以便微信反馈正确的高度
			setTimeout(function () {
				var w, h;
				if (EWA_App.DEBUG)
					console.log("orientation:" + window.orientation);
				h = document.documentElement.clientHeight;
				w = document.documentElement.clientWidth;

				if (w && h)
					EWA_App.changeBodyHeight(w, h, '延时1');
			}, 501);
		});

		// 每隔一秒检查一次窗体的高度（对付ios微信的下部导航栏）
		this._clientHeight = document.documentElement.clientHeight;
		var c = this;
		window.setInterval(function () {
			var h = document.documentElement.clientHeight;
			if (c._clientHeight == h) {
				return;
			}
			c._clientHeight = h;
			console.log('高度变化了：' + h);
			EWA_App.changeBodyHeight();
		}, 1000);
		EWA_App.changeBodyHeight();

		EWA_App.State.init('home');

		// 自动刷新登录状态
		//EWA_App.autorz();
		//window.setInterval(function () {
		//	EWA_App.autorz();
		// }, 1000 * 60 * 15); // 15分钟

		EWA_App.State._is_replace = true;

		// $('#butHome')[0].click();
		// this.FirstId = $('#butHome').attr('href').replace('#', '');

		// 根据url跳转到其它页面
		var other_id = "";
		var curlocs = window.location.href.split('#');
		var curloc = curlocs[0];

		// 进入的地址
		this.ENTRY_URL = curloc;

		if (curlocs.length > 1) {
			other_id = curlocs[1];
			if (other_id == this.FirstId) {
				other_id = null;
			}
		}

		// 显示第一个页面
		EWA_App.Section.createIScroll($('section#' + this.FirstId)[0], __SECTIONS[this.FirstId]);

		var title = __SECTIONS[this.FirstId].Title;

		EWA_App.State.state(title, curloc + '#' + this.FirstId);

		if (other_id) {
			if (EWA_App.DEBUG)
				console.log('other_id', other_id);
			EWA_App.State.state('', curloc + '#' + other_id);
		}

		if (EWA_App.startAfter) {
			EWA_App.startAfter();
		}

	},
	
	SplitEwa : function (fid, x, i) {
		var ewa = EWA.F.FOS[fid];
		var u = ewa.Url;
		var u1 = new EWA_UrlClass();
		u1.SetUrl(u);
		u1.AddParameter('xmlname', x);
		u1.AddParameter('itemname', i);
		ewa.Url = u1.GetUrl();
	},
	back : function (o) {
		if (o) {
			var t0 = $(o).attr('t') || 0;
			var t = new Date().getTime();
			if (t - t0 < 300) { // 连击
				return;
			}
			$(o).attr('t', t);
		}

		var cfg_show;
		if (EWA_App.SECTION_SHOW) {
			cfg_show = __SECTIONS[EWA_App.SECTION_SHOW.id];
		}
		if (cfg_show && cfg_show.backBeforeEvent) {
			cfg_show.backBeforeEvent();
		}
		this.backAction = true; // 标志是返回按键触发

		window.history.back();
		if (cfg_show && cfg_show.backAfterEvent) {
			cfg_show.backAfterEvent();
		}
	}
	/*
	loginOff : function () {
		var a = $('#user #user_loginoff');
		if (a.length > 0 && a.attr('cking')) {
			// iscroll 出现多次点击事件，避免重复
			return;
		}
		a.attr('cking', 'yes');
		var rst = window.confirm('您确定要退出么？');
		if (!rst) {
			a.attr('cking', null);
			return false;
		}
		var u = EWA.CP + '/user/login_exit.jsp?app=app';
		$J(u, function (rst) {
			a.attr('cking', null);
			// 重新加载此页面
			EWA_App.LocalStore.removeRz();
			EWA_App.Section.reload();
		});
		// 去除认证信息
		this.LocalStore.removeRz();
		return false;
	},
	doLogin : function () {
		EWA_App.State.state('用户登录', '#login');
	},
	register : function () {// 用户注册
		$('.ewa-ui-dialog').remove();
		EWA_App.State.state('用户注册', '#register');
	},
	pay : function (tag, paras) {
		if (EWA_App.DEBUG)
			console.log(tag, paras);
		var u = EWA.CP + "/pay_gateway/index.jsp?PAY_TAG=" + tag + "&" + paras;
		var s = "<iframe src='" + u + "' frameborder=0 width=100% height=100%></iframe>";
		$('section#pay .content').html(s);
	},
	autorz : function (func) {
		var rz = this.LocalStore.loadRz();
		if (rz && rz.uid && rz.code) {
			var u = this.EWA_ROOT + '?ewa_ajax=json&ewa_action=rz&xmlname=|2015_exchange|users|user.xml&itemname=WEB_USER.Frame.LoginApp&uid=' + rz.uid
					+ '&code=' + rz.code;
			$J(u, function (rst) {
				if (rst.length > 0) {
					var d = rst[0];
					EWA_App.LocalStore.addRz(d.FP_UNID, d.FP_VALIDCODE);
				} else {
					EWA_App.LocalStore.removeRz();
				}
				if (func) {
					try {
						func(rst);
					} catch (e) {
						console.log(func, e);
					}
				}
			});
		} else {
			if (EWA_App.DEBUG)
				console.log('no rz data');
		}
	},
	*/
	
};
