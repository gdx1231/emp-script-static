//@ sourceMappingURL=app2.min.map

/*
	MonitorResize : __MonitorResize,
	State : __State,
	Section : __Section,
	LocalStore : __LocalStore,
	PicsViewer : __PicsViewer, // 图片缩放
*/
var EWA_App = {
	IS_STOP_TOUCH_MOVE: true,
	EWA_ROOT: "ewa.jsp",

	CFGS: null, // 所有配置信息
	CFGS_CURRENT: null, // 当前配置信息
	/* 在微信中 */
	IS_IN_WEIXIN: /micromessenger/ig.test(navigator.userAgent),
	/* 在小程序中 */
	IS_IN_WEIXIN_MINI: /miniprogram/ig.test(navigator.userAgent),
	/* 安卓 */
	IS_IN_ANDROID: /android/ig.test(navigator.userAgent),
	/* iphone */
	IS_IN_IPHONE: /iphone/ig.test(navigator.userAgent),
	/* ipad */
	IS_IN_IPAD: /ipad/ig.test(navigator.userAgent),
	/**
	 * 初始化配置信息
	 * 
	 * @param cfgs
	 *            配置信息列表
	 */
	initCfgs: function(cfgs) {
		var aa = {};
		for (var n in cfgs) {
			var c = cfgs[n];
			var id = c.ID;
			var c1 = this.convertCfg(c);
			aa[id] = c1;
		}
		this.CFGS = {
			"INIT": aa
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
	attatchCfgs: function(tag, cfgs) {
		var aa = {};
		for (var n in cfgs) {
			var c = cfgs[n];
			var id = c.ID;
			var c1 = this.convertCfg(c);
			aa[id] = c1;
			this.CFGS_CURRENT[id] = c1;
		}
		this.CFGS[tag] = aa;
		__SECTIONS = this.CFGS_CURRENT;
	},
	changeCfgs: function(tag) {
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
	convertCfg: function(config) {
		var map_boolean = {
			IScroll: 1,
			PageFooter: 1,
			PageHeader: 1,
			Refresh: 1,
			ButtonOnFooter: 1,
			EWA: 1,
			IScrollMore: 1
		};
		var map_js = {
			Installed: 1,
			Losted: 1,
			RefreshAfter: 1,
			ShowCompleted: 1
		};
		var c1 = {};
		for (var m in config) {
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
	log: function() {
		var u = "console.jsp";
		var data = {};
		for (var n in arguments) {
			var o = arguments[n];
			try {
				var v = JSON.stringify(o);
			} catch (e) {
				v = e;
			}
			data['log' + n] = v;
		}
		$JP2(u, data, function() {

		});
	},
	getBodySize: function() {
		let vertical = false;
		// 在iOS中，window.innerHeight有时会返回错误的值 
		// let domWidth = (EWA_App.IS_IN_IPHONE || EWA_App.IS_IN_IPAD)?window.innerWidth: document.documentElement.clientWidth;
		// let domHeight = (EWA_App.IS_IN_IPHONE || EWA_App.IS_IN_IPAD)?window.innerHeight: document.documentElement.clientHeight;

		let domWidth = document.documentElement.clientWidth;
		let domHeight = document.documentElement.clientHeight;

		if (screen.orientation) {
			if (screen.orientation.angle === 0 || screen.orientation.angle === 180) {
				vertical = true;
			}
			//return { width: screen.availWidth, height: screen.availHeight, orientation: vertical ? "v" : "h" };
			return { width: domWidth, height: domHeight, orientation: vertical ? "v" : "h" };

		}

		if (this.IS_IN_IPHONE || this.IS_IN_IPAD) {
			if (window.orientation === 180 || window.orientation === 0) {
				//ipad,iphone： 0 或180 竖屏
				vertical = true;
			}
		} else {
			if (window.orientation === 180 || window.orientation === 0) {
				//Andriod：0 或180 横屏
				vertical = false;
			} else {
				vertical = true;
			}
		}
		let w = domWidth; //screen.availWidth;
		let h = domHeight; //screen.availHeight;
		if (vertical) {
			return { width: w < h ? w : h, height: w < h ? h : w, orientation: "v" };
		} else {
			return { height: w > h ? h : w, width: w > h ? w : h, orientation: "h" };
		}
	},
	/**
	 * 改变窗体高度，同时判断是否横屏
	 */
	changeBodyHeight: function(w, h, src) {
		if (!w) {
			let s = this.getBodySize();
			w = s.width;
			h = s.height;
			//w = document.documentElement.clientWidth;
			//h = document.documentElement.clientHeight;
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
	start: function(fristId) {
		if (!fristId) {
			$Tip('请定义 fristId《第一个页面id》');
			return;
		}
		if (!__SECTIONS[fristId]) {
			alert(' fristId《第一个页面id》对应配置项不存在__SECTIONS.' + fristId);
			return;
		}
		this.FirstId = fristId;
		var c = this;
		window.addEventListener('orientationchange', function(event) {
			// 延时处理，以便微信反馈正确的高度
			setTimeout(function() {
				var w, h;
				if (EWA_App.DEBUG)
					console.log("orientation:" + window.orientation);
				let s = c.getBodySize();
				//h = document.documentElement.clientHeight;
				//w = document.documentElement.clientWidth;
				h = s.height;
				w = s.width;
				if (w && h)
					EWA_App.changeBodyHeight(w, h, '延时1');
			}, 501);
		});

		// 每隔一秒检查一次窗体的高度（对付ios微信的下部导航栏）
		this._clientHeight = document.documentElement.clientHeight;

		window.setInterval(function() {
			//var h = document.documentElement.clientHeight;
			let h = c.getBodySize().height;
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

	SplitEwa: function(fid, x, i) {
		var ewa = EWA.F.FOS[fid];
		var u = ewa.Url;
		var u1 = new EWA_UrlClass();
		u1.SetUrl(u);
		u1.AddParameter('xmlname', x);
		u1.AddParameter('itemname', i);
		ewa.Url = u1.GetUrl();
	},
	back: function(o) {
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
(function() {
	var __Ani = {
		DEF_CSS: {
			INIT: { //动画开始初始化位置
				'-webkit-transform': 'translate3d(90%,0,0)'
			},
			INIT_BACK: {
				'-webkit-transform': 'translate3d(-90%,0,0)'
			},

			HIDE: {
				'-webkit-transform': 'translate3d(-100%, 0, 0)',
				'-webkit-transition': '-webkit-transform 400ms cubic-bezier(0.42, 0, 0.58, 1.0) 0.1s'
			},
			SHOW: {
				'-webkit-transform': 'translate3d(0, 0, 0)',
				'-webkit-transition': '-webkit-transform 350ms cubic-bezier(0.42, 0, 0.58, 1.0)'
			},
			BACK_HIDE: {
				'-webkit-transform': 'translate3d(100%, 0px, 0px)',
				'-webkit-transition': '-webkit-transform 350ms cubic-bezier(0.42, 0, 0.58, 1.0) 0.1s'
			},
			BACK_SHOW: {
				'-webkit-transform': 'translate3d(0%, 0px, 0px)',
				'-webkit-transition': '-webkit-transform 400ms cubic-bezier(0.42, 0, 0.58, 1.0)'
			}
		},
		POP_CSS: {
			INIT: { //动画开始初始化位置
				'-webkit-transform': 'translate3d(0, 90%, 0)'
			},
			INIT_BACK: {
				'-webkit-transform': 'translate3d(0, 0, 0)'
			},
			HIDE: {
				'-webkit-transform': 'translate3d(0, 0%, 0)'
			},
			SHOW: {
				'-webkit-transform': 'translate3d(0, 0%, 0)',
				'-webkit-transition': '-webkit-transform 350ms cubic-bezier(0.42, 0, 0.58, 1.0)'
			},
			BACK_HIDE: {
				'-webkit-transform': 'translate3d(0, 100%, 0px)',
				'-webkit-transition': '-webkit-transform 350ms cubic-bezier(0.42, 0, 0.58, 1.0) 0.1s'
			},
			BACK_SHOW: {
				'-webkit-transform': 'translate3d(0%, 0px, 0px)'
			}
		},
		getCss: function(swapType) {
			if (EWA_App.DEBUG) console.log(swapType);
			if (swapType == 'pop') {
				return this.POP_CSS;
			}
			return this.DEF_CSS;
		}
	};
	EWA_App.Ani = __Ani;
})();EWA_App.LocalStore = {
	name: "EX_APP",
	getJson: function() {
		if (this.CFG) {
			return this.CFG;
		}
		if (window.localStorage[this.name]) {
			var v = window.localStorage[this.name];
			try {
				this.CFG = JSON.parse(v);
			} catch (e) {
				this.CFG = {};
			}
		} else {
			this.CFG = {};
		}
		return this.CFG;
	},
	selectCitys: function() {
		var o = this.getJson();
		if (o.selectCitys) {
			return o.selectCitys;
		} else {
			return [];
		}
	},
	addDefaultCity: function(id, text) {
		var citys = this.selectCitys();
		var new_citys = [{
			id: id,
			text: text
		}];
		for (var i = 0; i < citys.length; i++) {
			if (new_citys.length >= 10) {
				break;
			}
			var city = citys[i];
			if (city.id == id) {
				continue;
			}
			new_citys.push(city);
		}
		this.CFG.selectCitys = new_citys;
		this.save();
	},
	save: function() {
		window.localStorage[this.name] = JSON.stringify(this.CFG);
	},
	addRz: function(uid, code) {
		var o = this.getJson();
		o.rz = {
			uid: uid,
			code: code
		}
		this.save();
	},
	loadRz: function() {
		var o = this.getJson();
		return o.rz || {};
	},
	removeRz: function() {
		var o = this.getJson();
		delete o.rz;
		this.save();
	}
};
EWA_App.MonitorRefresh = {
	list : [],
	add : function(obj, func) {
		var o = {};
		o.obj = obj;
		o.h = $(obj).height();
		o.w = $(obj).width();
		o.f = func;
		this.list.push(o);
		if (this.list.length == 1) {
			this.start();
		}
	},
	start : function() {
		var c=this;
		this.timerHandle = setInterval(function() {
			c._check();
		}, 15);
	},
	stop : function() {
		window.clearInterval(this.timerHandle)
	},
	_check : function() {
		for ( var n in this.list) {
			var d = this.list[n];
			if (d == null) {
				continue;
			}
			var o=$('section#'+d);
		}
	}
};
/**
 * 监控IScroll的对象的高度/宽度的变化
 */
EWA_App.MonitorResize = {
	list : [],
	add : function(obj, func) {
		var o = {};
		o.obj = obj;
		o.h = $(obj).height();
		o.w = $(obj).width();
		o.f = func;
		this.list.push(o);
		if (this.list.length == 1) {
			this.start();
		}
	},
	start : function() {
		this.timerHandle = setInterval(function() {
			EWA_App.MonitorResize._check();
		}, 15);
	},
	stop : function() {
		window.clearInterval(this.timerHandle)
	},
	_check : function() {

		var t = new Date().getTime(); // 当前的时间
		for ( var n in this.list) {
			var d = this.list[n];
			if (d == null) {
				continue;
			}

			if (!document.contains(d.obj)) {
				// 对象不存在了
				d.obj = null; // 引用的对象
				this.list[n] = null;
				return;
			}
			var w = $(d.obj).width();
			var h = $(d.obj).height();
			if (w == d.w && h == d.h) {
				continue;
			}
			d.ow = d.w;
			d.oh = d.h;
			d.w = w;
			d.h = h;
			if (d.f) {
				// console.log(d, w, h);
				d.f(d, t);
			}

		}
	}
};
/**
 * 处理图片缩放
 */
EWA_App.PicsViewer = {
	IPHONE: navigator.userAgent.toLowerCase().match(/cpu iphone os (\d+)\_(\d+) like/),
	IS_DEBUG: false,
	/**
	 * 是否在原生app中
	 */
	IS_IN_IOS_NATIVE_APP: navigator.userAgent.toLowerCase().indexOf('/classroom') > 0,
	IS_IN_WEIXIN: navigator.userAgent.toLowerCase().indexOf('micromessenger') > 0,
	IS_MINIPROGRAM: navigator.userAgent.toLowerCase().indexOf('miniprogram') > 0,
	collect: function() {
		if (!this.FILE_META) {
			alert('没有文件可以收藏');
			return;
		}
		if (this.collectCallback) {
			this.collectCallback(this.FILE_META);
		} else {
			console.warn("collectCallback: " + this.FILE_META);
		}
	},
	/**
	 * 分享到微信朋友圈
	 */
	timeline: function() {
		if (!this.FILE_META) {
			alert('没有文件可以分享');
			return;
		}
		this.shareToWeiXin(this.FILE_META, 'timeline')
	},
	/**
	 * 分享给微信朋友
	 */
	re: function() {
		if (!this.FILE_META) {
			alert('没有文件可以转发');
			return;
		}
		this.shareToWeiXin(this.FILE_META, 'session')
	},
	share: function() {
		if (!this.FILE_META) {
			alert('没有文件可以分享');
			return;
		}
		var fakeObj = this.BOX.find('tr.ewa-lf-data-row')[0];
		EWA_App.Section.showLfMenus(fakeObj, "EWA_App.PicsViewer.Share");
	},
	/** 
	 *分享文件
	 * */
	shareToWeiXin: function(fileMeta, session) {
		var root = location.protocol + "//" + location.host
			+ (location.port ? ":" + location.port : "");
		var cur_context = window.location.pathname.substring(0,
			location.pathname.lastIndexOf('/'))
			+ "/";
		if (this.IS_IN_IOS_NATIVE_APP) {
			if (fileMeta.CMD == 'pic') {
				var url = root
					+ (fileMeta.URL.startsWith('/') ? '' : cur_context)
					+ fileMeta.URL;
				if (url.indexOf('?') > 0) {
					url = url + '&DOWNLOAD=1';
				} else {
					url = url + '?DOWNLOAD=1';
				}
				this.shareToWxCommand(session, 'pic', null, null, null, url, null);
			} else {
				var url = root
					+ (fileMeta.DOWNLOAD_URL.startsWith('/')
						? ''
						: cur_context) + fileMeta.DOWNLOAD_URL;
				var icon = root
					+ (fileMeta.ICON.startsWith('/') ? '' : cur_context)
					+ fileMeta.ICON;
				this.shareToWxCommand(session, 'link', fileMeta.NAME,
					fileMeta.DES, url, null, icon);
			}
		} else if (this.IS_IN_WEIXIN) {
			this.FILE_META = fileMeta;
			if (session == 'session') {
				this.createWx_onMenuShareAppMessage();
			} else {
				this.createWx_onMenuShareTimeline();
			}
		} else {
			$Tip("只能在微信公众号和App下进行操作");
		}
	},
	shareToWxCommand: function(session, cmd, title, description, url, dataurl,
		icon) {
		//var session = "session"; //默认分享- 发送到聊天界面
		//timeline 发送到朋友圈
		// favorite 微信收藏
		var t = new Date().getTime();
		var t0 = this.asldfskfsldfksdlfksldkfsldjdfnkvndfkj || 0;
		if (t - t0 < 1000) {
			return;
		}
		this.asldfskfsldfksdlfksldkfsldjdfnkvndfkj = t;
		var search = [];
		search.push("cmd=" + cmd);
		if (title) {
			search.push("title=" + title.toURL());
		}
		if (description) {
			search.push("description=" + description.toURL());
		}
		if (icon) {
			search.push("icon=" + icon.toURL());
		}
		if (url) {
			search.push("url=" + url.toURL());
		}
		if (dataurl) {
			search.push("dataUrl=" + dataurl.toURL());
		}
		var q = search.join("&");
		var u = "gdx://weixinshare/" + session + "?" + q;
		$('#asdadsadas').text(u);
		loadNativeURL(u);
	},
	/**
	 * 显示文件内容(html)
	 * 
	 * @param url
	 */
	showFile: function(url) {
		this._init();
		if (!url) {
			return;
		}
		this.FILE_URL = url;
		$('#bbs-pic-view-file').html(
			"<div style='text-align: center'>请等待加载文件...</div>");
		window.FILE_META = null;
		var c = this;
		$Install(url, 'bbs-pic-view-file', function() {
			if (window.FILE_META) {
				c.FILE_META = window.FILE_META;
				c.createWx_onMenuShareAppMessage();
				c.createWx_onMenuShareTimeline();

				window.FILE_META = null;
			}
		});
		this.BOX.find('#page').hide();
		this.BOX.find('#page1').hide();
		this.BOX.show();
	},
	/**
	 * 微信fa朋友圈
	 */
	createWx_onMenuShareTimeline: function() {
		if (!(window.wx && wx.onMenuShareAppMessage)) {
			return;
		}
		var root = location.protocol + "//" + location.hostname;
		if (location.port) {
			root += ":" + location.port;
		}
		var share_config = {
			title: this.FILE_META.NAME, // 分享标题
			link: root + this.FILE_META.DOWNLOAD_URL, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
			imgUrl: root + this.FILE_META.ICON, // 分享图标
			success: function() {
			},
			cancel: function() {
			}
		}
		wx.onMenuShareTimeline(share_config);
	},
	/**
	 * 	微信分享给朋友
	 */
	createWx_onMenuShareAppMessage: function() {
		if (!(window.wx && wx.onMenuShareAppMessage)) {
			return;
		}
		var root = location.protocol + "//" + location.hostname;
		if (location.port) {
			root += ":" + location.port;
		}
		// 分享给朋友
		var cfg1 = {
			title: this.FILE_META.NAME, // 分享标题
			desc: this.FILE_META.DES, // 分享描述
			link: root + this.FILE_META.DOWNLOAD_URL, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
			imgUrl: root + this.FILE_META.ICON, // 分享图标
			type: '', // 分享类型,music、video或link，不填默认为link
			dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
			success: function() {
				//alert('success')
			},
			cancel: function() {
				//alert('cancel')
			}
		};
		wx.onMenuShareAppMessage(cfg1);
	},
	/**
	 * 显示单个或多个图片
	 * 
	 * @param urls
	 *            可以为数组或字符串
	 */
	showPics: function(urls, showIndex) {
		this._init();
		if (!urls) {
			return;
		}
		this.FILE_URL = urls;
		//分享图片用描述
		this.FILE_META = {
			CMD: "pic",
			URL: urls
		};
		$('#bbs-pic-view-file').html("");
		this.BOX.find('#page').show();
		var ss = [];
		var ss1 = [];
		var imgs_length = 1;
		var showIndex1 = showIndex ? showIndex : 0;
		if (showIndex1 < 0) {
			showIndex1 = 0;
		}
		if (urls instanceof Array) {
			if (urls.length == 0) {
				return;
			}
			imgs_length = urls.length;
			if (showIndex1 > imgs_length - 1) {
				showIndex1 = imgs_length - 1;
			}
			for (var n in urls) {
				ss.push(this._createImg(n, urls[n], showIndex1));
				var s;
				if (n == showIndex1) {
					s = "<b id='idx_" + n + "' class='cur' >&bull; </b>";
					this.FILE_META.URL = urls[n]; //分享图片只分享一个图片
				} else {
					s = "<b id='idx_" + n + "'>&bull; </b>";
				}
				ss1.push(s);
			}
		} else {
			ss.push(this._createImg(0, urls, showIndex1));
		}
		this.BOX.find("#page tr").html(ss.join(""));
		if (imgs_length == 1) {
			this.BOX.find('#page1').hide();
		} else {
			this.BOX.find('#page1').show();
			this.BOX.find('#page1 td').html(ss1.join(""));
		}
		this.BOX.show();
	},
	hide: function() {
		this.BOX.hide();
	},
	_createImg: function(index, url, showIndex) {
		var showIndex1 = showIndex ? showIndex : 0;
		var ss = ["<td class='list0' [SSTT] align=\"center\"><img class='imga' onload='EWA_App.PicsViewer._setImg(this)' "];
		ss.push(" id='img_" + index + "' ");
		if (index == showIndex1) {
			ss.push(' src="' + url + '" ');
		} else {
			ss.push(' src1="' + url + '" ');
		}
		ss.push('></td>');

		var s = ss.join("");
		s = s.replace("[SSTT]", index == showIndex1
			? ""
			: "style='display:none' ");
		return s;
	},
	_setImg: function(img) {
		$(img).attr('mw', img.width).attr('mh', img.height).css('width',
			img.width).css('height', img.height).css("margin-left", 0).css(
				'margin-top', '0');
		$(img).removeClass('imga');
	},
	_changePhoto: function(idx) {
		var img = this.BOX.find('#img_' + idx);
		if (img.attr('src1')) {
			img.attr('src', img.attr('src1'));
			img.attr('scr1', "");
			img[0].setAttribute('src1', '');
		} else {
			try {
				if (img.attr('mw')) {
					var mw = img.attr('mw') * 1;
					var mh = img.attr('mh') * 1;
					img.css('width', mw).css('height'.mh).css('margin-left', 0)
						.css('margin-top', 0);
				}
			} catch (e) {
				console.log(e);
			}
		}
		img.parent().show();
		this.BOX.find('#idx_' + idx).addClass('cur');
	},
	_init: function() {
		if (this.BOX) {
			return this.BOX;
		}
		var html = [];
		html.push("<div id=\"bbs-pic-view-box\" style=\"display:none\">");
		html.push("<div id=\"bbs-pic-view-box1\">");
		html.push("<div id='bbs-pic-view-file' style='height:100%;'></div>");
		html.push("<div class=\"view-large-image\">");
		html
			.push("<table id=\"page\" class=\"page \" cellspacing=\"0\" cellpadding=\"0\">");
		html.push("<tr id='bbs-pic-view-box-page-imgs'>");
		html.push("<!-- imgs -->");
		html.push("</tr>");
		html.push("</table>");
		html.push("<table id=\"page1\" style=\"display: none\">");
		html.push("<tr>");
		html
			.push("<td height=\"30\" align=\"center\" id='page1-indexes'></td>");
		html.push("</tr>");
		html.push("</table>");
		html.push("</div>");
		html.push("</div>");
		html
			.push("<a href='javascript:EWA_App.PicsViewer.hide();' class=\"fa fa-close close\"></a>");
		html
			.push("<a href='javascript:EWA_App.PicsViewer.share();' class='bbs-pic-view-share fa fa-share-alt'></a>");

		// 用于显示分享菜单部分
		html
			.push("<table><tr class='ewa-lf-data-row'><td>"
				+ "<input id='session' type=button onclick='EWA_App.PicsViewer.re()' value='转发给朋友'>"
				+ "<input id='timeline' type=button onclick='EWA_App.PicsViewer.timeline()' value='分享朋友圈'></td></tr></table>");
		html.push("</div>");

		var obj = $(html.join(""));
		$("body").append(obj);
		this.BOX = obj;
		var page = obj.find("#page")[0];

		var c = this;
		page.ontouchstart = function(event) {
			if (event.targetTouches.length == 1) {
				c.t_start = event;
			} else if (event.targetTouches.length == 2) { // scale
				c.t_start1 = event;
				c.dist_base = 0;
			}
			c.is_move = false;
			event.preventDefault();
			event.stopPropagation();
		};
		page.ontouchmove = function(event) {
			if (event.targetTouches.length == 2) { // 双指头
				c.t_start1a = event;

				var dx = event.targetTouches[0].pageX - c.t_start1.pageX;
				var dy = event.targetTouches[0].pageY - c.t_start1.pageY;

				var dx1 = event.targetTouches[1].pageX - c.t_start1.pageX;
				var dy1 = event.targetTouches[1].pageY - c.t_start1.pageY;

				var dt = event.timeStamp - c.t_start1.timeStamp;

				var dist = Math.sqrt((dx - dx1) * (dx - dx1) + (dy - dy1)
					* (dy - dy1));
				// console.log(dx, dy, dx1, dy1, dist, dt);
				if (c.dist_base == 0) {
					c.dist_base = dist;
				} else {
					// console.log(dist_base, dist, dist / dist_base);

					var r = dist / c.dist_base;
					var mw = $(event.target).attr('mw') * 1;
					var mh = $(event.target).attr('mh') * 1;

					var ow = $(event.target).width();
					var oh = $(event.target).height();

					var w = ow * r;
					var h = oh * r;

					if (w < mw) {
						w = mw;
						h = mh;
						r = 0;
					}
					$(event.target).css("width", w).css('height', h).attr('r',
						r);
					if (r == 0) {
						$(event.target).css("margin-left", 0).css('margin-top',
							'0');
					}
					c.dist_base = dist;
				}

			} else if (event.targetTouches.length == 1) {
				var r = $(event.target).attr('r');

				if (r == null || r == 0) {
					return;
				}

				if (!c.t_start) {
					c.t_start = event;
				}

				var dx = event.pageX - c.t_start.pageX;
				var dy = event.pageY - c.t_start.pageY;

				var px = $(event.target).css('margin-left').replace('px', '') * 1;
				var py = $(event.target).css('margin-top').replace('px', '') * 1;

				var left = px + dx;
				var top = py + dy;
				$(event.target).css('margin-left', left).css('margin-top', top);

				// console.log(dx, dy, r);

				c.t_start = event;
				c.is_move = true;
			}
			event.preventDefault();
			event.stopPropagation();
		};
		page.ontouchend = function(event) {
			event.preventDefault();
			event.stopPropagation();
			if (c.t_start) { // 单个指头
				// console.log(event);
				var dx = event.pageX - c.t_start.pageX;
				var dy = event.pageY - c.t_start.pageY;
				var dt = event.timeStamp - c.t_start.timeStamp;

				// console.log(dx, dy, dt);

				if (dx < -50 && dt < 244) {
					var old = c.BOX.find('.cur');
					var id = old.attr('id');
					var idx = id.replace('idx_', '') * 1;

					old.removeClass('cur');

					c.BOX.find('#img_' + idx).parent().hide();

					var imgs = c.BOX.find('.page img');
					idx++;
					if (idx == imgs.length) {
						idx = 0;
					}
					c._changePhoto(idx);

				} else if (dx > 50 && dt < 244) {
					var old = c.BOX.find('.cur');
					var id = old.attr('id');
					var idx = id.replace('idx_', '') * 1;

					old.removeClass('cur');

					c.BOX.find('#img_' + idx).parent().hide();

					var imgs = c.BOX.find('.page img');
					idx--;
					if (idx < 0) {
						idx = imgs.length - 1;
					}
					c._changePhoto(idx);

				} else if (Math.abs(dx) < 10 && dt < 150 && !c.is_move) {
					// click_page();
				}
			}
			c.t_start = null;
			c.t_start1 = null;
		};
	}
};/**
 * 用于处理不同Page切换与显示
 */
EWA_App.Section = {
	IS_WEIXIN: navigator.appVersion.toLowerCase().indexOf('micromessenger') > 0,
	handleState: function(s) {
		if (s == null) {
			return;
		}
		var url = s.url;
		if (!url) {
			return;
		}

		var urls = this.getParas(url);
		if (urls.section_id) {
			var id = urls.section_id;
			this.cover(EWA_App.State.prevShow, $('section[id=' + id + ']')[0], urls, s._is_back);
		} else {

		}
	},
	getParas: function(u) {
		var urls = u.split('#');
		var d = {};
		if (urls.length == 1) {
			return {
				url: u
			};
		}
		d.url = urls[0];

		var u1 = urls[1];
		var u1s = u1.split('?');
		d.section_id = u1s[0];
		if (u1s.length == 2) {
			var ps = u1s[1].split('&');
			var paras = {};
			for (var n in ps) {
				var pexp = ps[n];
				var pexps = pexp.split('=');
				if (pexps.length == 2) {
					paras[pexps[0].unURL()] = pexps[1].unURL();
				}
			}
			d.paras = paras;
		}
		// console.log(d);
		this.createSection(d);
		return d;
	},
	createSection: function(urls) {
		/*
		 * ID : "user_change_password", EWA : true, X :
		 * "|2015_exchange|users|user.xml", I : "WEB_USER.Frame.ChangePWD",
		 * Refresh : true, IScroll : false, PageHeader : true, PageFooter :
		 * false
		 */
		var id = urls.section_id;
		var opt = __SECTIONS[id];
		if (opt && opt.swap && opt.swap.toLowerCase().trim() == 'pop') {
			// 弹出窗口始终在前面
			$('section[id=' + id + ']').remove();
		}
		if ($('section[id=' + id + ']').length == 0) {
			var opt = __SECTIONS[id];
			if (opt == null) {
				console.log(id + ' not defined');
				return;
			}
			var css = opt.Css ? opt.Css : "";
			if (opt.USE_EWA_LF == 'Y') {
				css += " ewa-app-use-ewa-lf";
			}

			// 向上弹出
			if (opt.swap == 'pop') {
				css += " ewa-app-pop";
			}

			// <a name="'+id+'"></a>
			var html = ['<section style="display1:none" class="' + css.trim() + '" id="' + id + '">'];

			if (EWA_App.IS_IN_WEIXIN && !EWA_App.IS_IN_WEIXIN_MINI) {
				// 在微信中同时不在小程序中，不显示头部
				opt.PageHeader = false;
			}
			if (opt.PageHeader && opt.PageFooter) {
				html.push("<header><h1></h1></header><div class='content'></div><footer></footer>");
			} else if (opt.PageHeader && !opt.PageFooter) {
				html.push("<header><h1></h1></header><div class='content'></div>");
			} else if (!opt.PageHeader && opt.PageFooter) {
				html.push("<div class='content'></div><footer></footer>");
			} else {
				html.push("<div class=\"content\"></div>");
			}
			// 返回按钮
			html.push("<div class='ewa-app-btn ewa-app-btn-back' onclick='EWA_App.back();'></div>");
			// 添加按钮
			html.push("<div class='ewa-app-btn ewa-app-btn-add'><a></a></div>");
			// 更多按钮
			html.push("<div class='ewa-app-btn ewa-app-btn-more'><a></a></div>");
			html.push("</section>");

			$('body').append(html.join(''));
			if (opt.Footer == 'init') {
				var o = $('section[id=' + id + '] footer');
				o.html($('section:eq(1) footer').html());
				o.find('a').removeAttr('ckjs');
			} else if (opt.Footer) {
				var ref = $('section[id="' + opt.Footer + '"] footer');
				if (ref.length == 1) {
					var o = $('section[id=' + id + '] footer');
					o.html(ref.html());
					o.find('a').removeAttr('ckjs');
				}
			}
		}
	},
	_getRequestUrl: function(opt, sectionTag) {
		var url;
		var ewa = EWA_App.CFGS_CURRENT['ewa'];
		if (opt.ID.indexOf('ewa') == 0) { // 作为ewa检查之前配置的 CONTENT_PATH
			if (EWA_App.SECTION_HIDE) {
				var opt_prev = EWA_App.CFGS_CURRENT[EWA_App.SECTION_HIDE.id];
				opt.CONTENT_PATH = opt_prev.CONTENT_PATH;
			}
		} else {
			// EWA_App.attatchCfgs 附加配置文件时候，会指定调用的content_path，例如/pf/app-2017
			if (opt.CONTENT_PATH) {
				if (!EWA_App.EWA_ROOT_INIT) {
					EWA_App.EWA_ROOT_INIT = EWA_App.EWA_ROOT;
					EWA.CP = opt.CONTENT_PATH + "../";
				}
				EWA_App.EWA_ROOT = opt.CONTENT_PATH + EWA_App.EWA_ROOT_INIT;
				if (!ewa.CONTENT_PATH) {
					// 修改ewa的根路径，是因为当前的配置可能会创建调用ewa的方法，例如lf的修改
					ewa.CONTENT_PATH = opt.CONTENT_PATH;
					ewa.CONTENT_PATH_CHANGED = true;
				}
			} else {
				if (EWA_App.EWA_ROOT_INIT) {
					EWA_App.EWA_ROOT = EWA_App.EWA_ROOT_INIT;
					EWA_App.EWA_ROOT_INIT = null;
					EWA.CP_INIT = null;
					if (ewa.CONTENT_PATH_CHANGED) {
						ewa.CONTENT_PATH = null;
						ewa.CONTENT_PATH_CHANGED = null;
					}
				}
			}
		}

		if (opt.EWA) {
			var xmlname = opt.X instanceof Array ? opt.X.join(',') : opt.X;
			var itemname = opt.I instanceof Array ? opt.I.join(',') : opt.I;
			url = EWA_App.EWA_ROOT + "?add_div=1&xmlname=" + xmlname + "&itemname=" + itemname + "&EWA_APP=1";
		} else {
			url = opt.U;
			// EWA_App.attatchCfgs 附加配置文件时候，会指定调用的content_path，例如/pf/app-2017
			if (opt.CONTENT_PATH && !url.startsWith("/") && !url.startsWith("http")) {
				url = opt.CONTENT_PATH + url;
			}
		}

		var u1 = new EWA_UrlClass();
		u1.SetUrl(url);

		// location的参数
		var u3 = new EWA_UrlClass();
		for (var n in u3._Paras) {
			u1.AddParameter(n, u3._Paras[n]);
		}

		// 配置中附加参数
		if (opt.AddParas) {
			for (var n in opt.AddParas) {
				u1.AddParameter(n, opt.AddParas[n]);
			}
		}
		if (opt._paras) {
			for (var n in opt._paras) {
				u1.AddParameter(n, opt._paras[n]);
			}
		}
		// 添加语言
		if (!u1.GetParameter("EWA_LANG") && EWA.LANG) {
			u1.AddParameter("EWA_LANG", EWA.LANG);
		}

		url = u1.AddParameter("section", sectionTag);
		if (EWA_App.DEBUG) {
			console.log(url);
		}
		return url;
	},
	/**
	 * 获取当前页面下的所有EWA
	 */
	getEWAS: function() {
		var ewas = [];
		var tb = $(EWA_App.SECTION_SHOW).find('.EWA_TABLE');
		tb.each(function() {
			var id = $(this).attr('id');
			if (!id) {
				return;
			}
			id = id.replace('EWA_FRAME_', '').replace('EWA_LF_', '');
			var ewa = EWA.F.FOS[id];
			if (ewa) {
				ewas.push(ewa);
			}
		});

		return ewas;
	},
	loadMore: function(isNotShowTip) {
		var id = $(EWA_App.SECTION_SHOW).attr('id');
		var opt = __SECTIONS[id];
		if (opt._is_reloadding) {
			return;
		}
		opt._is_reloadding = true;
		if (EWA_App.DEBUG)
			console.log('reload more id =' + id);

		opt.loaded = true;
		var ewa_obj = opt._ewa_load_more_obj;
		if (ewa_obj == null || ewa_obj.parent().length == 0 || ewa_obj.parent().parent().length == 0) {
			// listframe
			ewa_obj = $(EWA_App.SECTION_SHOW).find('.ewa-lf-frame[id]');
			if (ewa_obj.length == 0) { // ewa_grid
				is_lf_call = false;
				ewa_obj = $(EWA_App.SECTION_SHOW).find('.ewa-grid-frame[id]');
			}

			if (ewa_obj.length == 0) {
				console.log("loadMore ewa_obj ? (listframe or grid)");
				return;
			}

			if (ewa_obj.length > 1) {
				// 出现的情况是 由id=""的情况
				for (var i = 0; i < ewa_obj.length; i++) {
					var o = ewa_obj[i];
					if (o.id != '') {
						ewa_obj = $(o);
						break;
					}
				}
			}
			if (EWA_App.DEBUG) console.log(ewa_obj[0]);
			// 在 createIScroll 中重置
			opt._ewa_load_more_obj = ewa_obj;
		}
		var ewa_id = ewa_obj.attr('id');
		ewa_id = ewa_id.replace('EWA_LF_', '');
		var ewa = EWA.F.FOS[ewa_id];

		if (!ewa) {
			console.log("ewa[" + ewa_id + "] ?");
			opt._is_reloadding = false;
			return;
		}

		var content = ewa_obj.parent();

		ewa._PageCurrent++;
		if (ewa._PageCurrent > ewa._PageCount) {
			ewa._PageCurrent--;
			opt._is_reloadding = false;

			var is_continute = true;
			if (opt.noMoreData) {
				is_continute = opt.noMoreData();
			} else {
				if (!isNotShowTip) {
					$Tip('没有更多的数据');
				}
			}
			if (is_continute) {
				$(opt.myScroll.wrapper).removeClass('loadingmore');
				$(opt.myScroll.scroller).removeClass('loadingmore-scroller').css('margin-top', '');
			}
			return;
		}
		var content_id = EWA_Utils.tempId("_sc_");
		content.append('<div id="' + content_id + '"></div>');

		var u1 = new EWA_UrlClass(ewa.Url);
		u1.AddParameter("EWA_PAGECUR", ewa._PageCurrent);
		u1.AddParameter("EWA_PAGESIZE", ewa._PageSize);
		u1.AddParameter("EWA_AJAX", "LF_RELOAD");
		u1.AddParameter("EWA_IS_SPLIT_PAGE", "no");
		u1.AddParameter("EWA_IS_HIDDEN_CAPTION", "yes");
		//var url = ewa.Url + "&EWA_PAGECUR=" + ewa._PageCurrent + "&EWA_PAGESIZE=" + ewa._PageSize
		//	+ "&EWA_AJAX=LF_RELOAD&EWA_IS_SPLIT_PAGE=no&EWA_IS_HIDDEN_CAPTION=yes";



		// 检索
		var search = ewa.SearchGetExp(EWA_App.SECTION_SHOW);
		if (search) {
			u1.AddParameter("EWA_LF_SEARCH", search);
			// url += "&EWA_LF_SEARCH=" + search.toURL();
		}
		// 排序
		if (ewa._Sort) {
			u1.AddParameter("EWA_LF_ORDER", ewa._Sort);
			// url += "&EWA_LF_ORDER=" + ewa._Sort.toURL();
		}

		var url = u1.GetUrl();
		var ajax = new EWA_AjaxClass();
		var c = this;

		// 去掉已存在的 table id,避免加载后事件重复执行
		// ewa_obj.attr('id', '');

		ajax.Install(url, "", content_id, function() {
			opt._is_reloadding = false;
			if (ewa.ReloadAfter) {
				ewa.ReloadAfter();
			}
			if (opt.myScroll) {
				opt.myScroll.refresh();
			}
			c.listFrameUIAndEvents(ewa);
		}, true);
	},
	reload: function() {
		var cur_section = $(EWA_App.SECTION_SHOW);
		if (cur_section.length == 0) {
			return;
		}
		var id = cur_section.attr('id');
		var opt = __SECTIONS[id];
		if (opt._is_reloadding) {
			return;
		}
		opt._is_reloadding = true;
		if (EWA_App.DEBUG)
			console.log('reload id =' + id);

		if (opt.myScroll) {
			$(opt.myScroll.wrapper).addClass('reloading');
		}
		opt.loaded = true;
		var content = cur_section.find('.content');
		// content.html('');

		if (!content.attr('id')) {
			content.attr('id', EWA_Utils.tempId("_sc_"));
		}
		// var url = this._getRequestUrl(opt, id);
		// var ajax = new EWA_AjaxClass();
		var c = this;

		// listframe
		var ewa_obj = $(EWA_App.SECTION_SHOW).find('.ewa-lf-frame[id]');
		if (ewa_obj.length == 0) { // ewa_grid
			is_lf_call = false;
			ewa_obj = $(EWA_App.SECTION_SHOW).find('.ewa-grid-frame[id]');
		}

		if (ewa_obj.length == 0) {
			console.log("loadMore ewa_obj ? (listframe or grid)");
			return;
		}

		if (ewa_obj.length > 1) {
			// 出现的情况是 由id=""的情况
			for (var i = 0; i < ewa_obj.length; i++) {
				var o = ewa_obj[i];
				if (o.id != '') {
					ewa_obj = $(o);
					break;
				}
			}
		}

		var ewa_id = ewa_obj.attr('id');
		ewa_id = ewa_id.replace('EWA_LF_', '');
		var ewa = EWA.F.FOS[ewa_id];

		var url = ewa.Url;
		ewa._PageCurrent = 1;
		var search = ewa.SearchGetExp(EWA_App.SECTION_SHOW);
		if (search) {
			url += "&EWA_LF_SEARCH=" + search.toURL();
		}
		// 排序
		if (ewa._Sort) {
			url += "&EWA_LF_ORDER=" + ewa._Sort.toURL();
		}
		url += "&EWA_PAGECUR=1";
		ewa.Url = url;
		if (ewa.ReloadAfter) {
			ewa.__ReloadAfter = ewa.ReloadAfter;
		}
		ewa.ReloadAfter = function() {
			if (ewa.__ReloadAfter) {
				ewa.__ReloadAfter();
				ewa.ReloadAfter = ewa.__ReloadAfter;
			}

			c.ajaxLoadedAfter(cur_section, cur_section, opt, content, false, true);
			if (opt.myScroll) {
				$(opt.myScroll.wrapper).animate({
					'padding-top': 0
				}, 521, function() {
					$(this).removeClass('reloading').css('padding-top', '');
				});
			}
			opt._is_reloadding = false;
			if (ewa.__ReloadAfter) {
				ewa.ReloadAfter = ewa.__ReloadAfter;
			} else {
				ewa.ReloadAfter = null;
			}

		};
		ewa.Reload();

		// ajax.Install(url, "EWA_AJAX=INSTALL", cur_section.find('.iscroller'),
		// function () {
		// // true 避免重新创建iscroll
		// c.ajaxLoadedAfter(cur_section, cur_section, opt, content, false,
		// true);
		// if (opt.myScroll) {
		// $(opt.myScroll.wrapper).animate({
		// 'padding-top' : 0
		// }, 521, function () {
		// $(this).removeClass('reloading').css('padding-top', '');
		// });
		// }
		// opt._is_reloadding = false;
		// }, true);
	},
	showCoverDiv: function() {
		if (!this._COVER || !document.contains(this._COVER[0])) {
			this._COVER = $('<div id="showCoverDiv" ontouchmove="return false;" style="z-index:981281;position:absolute;top:0;left:0;bottom:0;right:0;"></div>');
			$('body').append(this._COVER);
		}
		this._COVER.show();
	},
	hideCoverDiv: function() {
		if (this._COVER) {
			this._COVER.hide();
		}
	},
	cover: function(hide, show, urls, isback) {
		if (!show.id) {
			show.id = EWA_Utils.tempId("_show_");
		}

		EWA_App.State.prevShow = show;
		var sectionTag = urls ? urls.section_id : "-------";

		EWA_App.SECTION_SHOW = show;
		EWA_App.SECTION_HIDE = hide;
		EWA_App.SECTION_URLS = urls;
		EWA_App.SECTION_IS_BACK = isback;

		if (hide && __SECTIONS[hide.id] && __SECTIONS[hide.id].myScroll) {
			// 上一次的位置
			__SECTIONS[hide.id]._LastScrollY = __SECTIONS[hide.id].myScroll.y;
			if (EWA_App.DEBUG) {
				console.log('记录位置 [' + hide.id + '] ->' + __SECTIONS[hide.id]._LastScrollY);
			}
		}

		if (!EWA.CP_INIT) { // 初始化记录 当前cp
			EWA.CP_INIT = EWA.CP;
		}
		var opt = __SECTIONS[sectionTag];

		if (opt) {
			// 切换到当前的EWA.CP
			if (opt.CONTENT_PATH) {
				EWA.CP = opt.CONTENT_PATH + "../";
			} else if (EWA.CP_INIT) {
				EWA.CP = EWA.CP_INIT
			}
			if (EWA_App.DEBUG) {
				console.log("EWA.CP =" + EWA.CP);
			}

			this.showCoverDiv();
			if (opt.Title) {
				$(show).find('header h1').html(opt.Title);
			}

			var is_reload_data = false;
			if (isback) {
				if (opt.RefreshBackAction) { // 定义了返回按钮强制刷新
					is_reload_data = true;
				}

			} else {
				if (!opt.loaded || opt.Refresh) {// 未加载过
					is_reload_data = true;
				}
			}
			var content = $(show).find('.content');
			if (content.children().length == 0) {
				// 没有内容
				is_reload_data = true;
			}

			// 需要重新加载数据
			if (is_reload_data) {
				opt.loaded = true;
				if (EWA_App.DEBUG) {
					console.log('cover->clear content!')
				}
				content.html('');
				if (!content.attr('id')) {
					content.attr('id', EWA_Utils.tempId("_sc_"));
				}
				opt._paras = urls.paras;
				var url = this._getRequestUrl(opt, sectionTag);
				var ajax = new EWA_AjaxClass();
				var c = this;

				// 显示提示信息
				c._is_ajax_loading = true;
				$Tip(EWA.LANG == 'enus' ? "Loading" : '数据加载中', function() {
					// _is_ajax_loading 在ajaxLoadedAfter改为false;
					return !c._is_ajax_loading;
				});
				ajax.Install(url, "", content[0].id, function() {
					if (EWA_App.DEBUG) {
						console.log('cover->AJAX INSTALL:' + url);
					}
					c.ajaxLoadedAfter(hide, show, opt, content, isback);
				});
				return;
			} else {
				// 无需重新加载数据
				if (EWA_App.DEBUG) {
					console.log('不刷新', opt, isback);
				}
				this.hideCoverDiv();

				if (opt._LastScrollY != null && opt.myScroll) {
					// 恢复上一次的位置
					opt.myScroll.scrollTo(0, opt._LastScrollY);

					if (EWA_App.DEBUG) {
						console.log('恢复位置 [' + opt.ID + '] ->' + opt._LastScrollY);
						opt._LastScrollY = null;
					}
				}
			}
		}

		this.swapPage(hide, show, isback);
		this.hideCoverDiv();
	},
	/**
	 * 显示排序的头 opt.SHOW_ORDERS=='Y'
	 */
	showOrders: function(section_id) {
		if (!section_id) {
			section_id = EWA_App.SECTION_SHOW.id; // 当前显示section的id
		}
		var sec = $('section#' + section_id);
		var header = sec.find('.ewa-lf-header:eq(0)');
		if (header.length == 0) {
			return;
		}
		var inc = 0;
		header.find("td").each(function() {
			if ($(this).find("a").length == 0) {
				$(this).remove();
			} else {
				var text = $(this).text();
				$(this).attr('order-index', inc).addClass('ewa-app-lf-order');
				if (text.endsWith(" ^")) {
					text = text.replace(" ^", "").trim();
					$(this).find('a').addClass('asc').text(text);
				} else if (text.endsWith(" v")) {
					text = text.replace(" v", "").trim();
					$(this).find('a').addClass('desc').text(text);
				}
				inc++;
			}
		});
		if (inc == 0) {
			return;
		}
		if (inc > 5) {
			inc = 5;
		}
		var css = {
			'width': (100 / inc) + '%'
		};
		header.find("td.ewa-app-lf-order").css(css);
		header.css('display', 'block').css("width", "100%");

		return header;
	},
	/**
	 * 合并搜索框
	 * 
	 * @param section_id
	 * @param notfixed
	 * @param is_not_compose_text
	 */
	reShowFilter: function(section_id, notfixed, is_not_compose_text) {
		if (!section_id) {
			section_id = EWA_App.SECTION_SHOW.id; // 当前显示section的id
		}

		var filter = $('section#' + section_id + ' .ewa-lf-search');
		if (filter.length == 0) {
			return;
		}
		// 已经设置过了
		if (filter.attr('reshowfilter')) {
			return;
		}

		if (!notfixed) {
			filter.css('position', 'absolute').css('top', 0).css('left', 0);
		}

		if (!notfixed) {
			setTimeout(function() {
				// 合并搜索框添加高度
				var o = $('section#' + section_id + ">.content>.iscroller");
				o.css('padding-top', filter.height()).css('padding-bottom', filter.height() + 50);

				// 刷新IScoll尺寸
				if (__SECTIONS[section_id].myScroll) {
					__SECTIONS[section_id].myScroll.refresh();
				}
			}, 310);
			$('section#' + section_id + '>.content').append(filter);
		}

		$('section#' + section_id + ' .ewa-lf-search-item-title').hide();

		var selects = [];
		$('section#' + section_id + ' .ewa-lf-search-item').each(function() {
			$(this).find('a').remove();
			var txt = $(this).find('.ewa-lf-search-item-title').text();

			// $(this).find('input[type=text]').attr('placeholder',
			// txt);

			$(this).find('input[type=text]').each(function() {
				if ($(this).attr('onclick') && $(this).attr('onclick').indexOf('EWA.UI.Calendar.Pop') >= 0) {
					// 日期选择
					$(this).attr('onclick', '').attr('type', 'date');
				} else {
					$(this).attr('placeholder', txt);
				}
			});
			var is_select = false;
			$(this).find('select').each(function() {
				this.options[0].text = "-- " + txt + " --";
				this.options[0].value = "";
				is_select = true;
			});
			if (is_select) {
				selects.push(this);
			}
		});
		// 将select搜索合并到一行
		if (selects.length > 1) {
			var tb1 = document.createElement('table');
			var w = 100 / selects.length;
			var tr = tb1.insertRow(-1);
			var pnode = selects[0].parentNode;

			for (var i = 0; i < selects.length; i++) {
				var td = tr.insertCell(-1);
				td.style.width = w + 'px';
				td.style.padding = 0;
				td.appendChild(selects[i]);
			}
			tb1.style.width = '100%';
			tb1.cellPadding = 0;
			tb1.cellSpacing = 0;
			pnode.appendChild(tb1);
		}

		if (!is_not_compose_text) {
			// 合并文字搜索到一个input中
			var titles = [];
			var names = [];
			var objs = $('section#' + section_id + ' .ewa-lf-search-type-text');
			if (objs.length > 0) {
				objs.each(function(index) {
					var txt = $(this).find('.ewa-lf-search-item-title').text();
					txt = txt.replace(":", "").replace("：", "");

					var name = $(this).find('input[type=text]').attr('name');
					titles.push(txt);
					names.push(name);
					if (index > 0) {
						$(this).hide();
					}
				});

				$(objs[0]).addClass('ewa-app-lf-search-compose');

				$(objs[0]).find('input[type=text]').attr('name', names.join(','))
					.attr('placeholder', titles.join(", "));
			}
		}
		var c = this;
		filter.find('.ewa-lf-search-fix-m1').bind('click', function() {
			c.showOptionsOnLfMenu(this);
		});

		filter.attr('reshowfilter', 1);
	},
	/**
	 * 美化搜索框
	 * @param ewaLfSearch 搜索框
	 */
	beautfyFilter: function(ewaLfSearch) {
		var filter;
		if (!ewaLfSearch) { // 指定的搜索框不存在
			var section_id = EWA_App.SECTION_SHOW.id; // 当前显示section的id
			var filter = $('section#' + section_id + ' .ewa-lf-search');
		} else {
			filter = $(ewaLfSearch);
		}
		if (filter.length == 0) {
			return;
		}
		// 已经设置过了
		if (filter.attr('beautfyFilter')) {
			return;
		}
		filter.attr('beautfyFilter', 1);
		filter.find('.ewa-lf-search-item').each(function() {
			var title = $(this).find('.ewa-lf-search-item-title');
			title.hide();
			var txt = title.text().replace(":", "");
			var ipts = $(this).find('.ewa-lf-search-item-ctl input');
			if (ipts.length > 0) {
				ipts.each(function() {
					if ($(this).attr('onclick') && $(this).attr('onclick').indexOf('EWA.UI.Calendar.Pop') >= 0) {
						// 日期选择
						$(this).attr('onclick', '').attr('type', 'date');
					}
				});
				ipts.attr('placeholder', txt);
				if (ipts.length == 1) {
					$(this).addClass('ewa-app-lf-search-compose');
				}
			} else {
				$(this).find('select').each(function() {
					this.options[0].text = "-- " + txt + " --";
					this.options[0].value = "";
				});
			}
		});
	},
	showOptionsOnLfMenu: function(table) {
		var opts = [];
		var chks = {};
		$(table).find('input').each(function() {
			if (this.checked) {
				chks[this.id] = true;
			}
			var ipt = $(this);
			var opt = {
				txt: this.parentNode.outerHTML,
				js11: "$('#" + ipt.attr('id') + "').trigger('click');return;",
				js: " ",
				notclose: true // 不关闭窗口
			}
			opts.push(opt);
		});
		var box = this.showLfMenuBox(opts);
		var c = this;
		box.find('input').each(function() {
			if (chks[this.id]) {
				this.checked = true;
			}
			c.reShowRadio(this);
		});
	},
	radioClick: function(obj) {
		var last_t = $(obj).attr('last_t') || 0;
		var current_time = new Date().getTime();
		if (current_time - last_t < 500) {
			// 小余500ms，避免连击
			return;
		}
		$(obj).attr('last_t', current_time);
		var rid = $(obj).attr('rid');
		var radio = $(EWA_App.SECTION_SHOW).find("input[id='" + rid + "']");
		if (radio.length == 0) {
			console.log("radioClick", rid, 'not found');
			return;
		}
		radio = radio[0];
		if (radio.type == 'radio') {
			var name = radio.name;
			// 根据名称查找
			var objs = $(EWA_App.SECTION_SHOW).find('input[type=radio][name="' + name + '"]');
			objs.each(function() {
				$(this).parent().find('i.ewa-app-radio').removeClass('fa-check');
				$(this).parent().removeClass('ewa-app-radio-checked');
			});
			radio.checked = true;
		} else {// checkbox
			radio.checked = !radio.checked;
		}
		if (radio.checked) {
			$(radio).parent().addClass('ewa-app-radio-checked');
			$(obj).find("i").addClass("fa-check");
		} else {
			$(radio).parent().removeClass('ewa-app-radio-checked');
			$(obj).find("i").removeClass("fa-check");
		}

		if (radio.onclick) {
			radio.onclick();
		}
	},
	/**
	 * 重绘当前页的所有 Radio/Checkbox
	 */
	reShowRadios: function(show) {
		var p = show ? $(show) : $(EWA_App.SECTION_SHOW);
		var c = this;
		p.find('.ewa-frame').find('input[type=radio],input[type=checkbox]').each(function() {
			c.reShowRadio(this);
		});
	},
	/**
	 * 重绘 Radio/Checkbox
	 * 
	 * @param obj
	 */
	reShowRadio: function(obj) {
		var r = $(obj);
		if (r.length == 0) {
			return;
		}
		if (r.attr('reshowradio')) { // 如果已经存在，则重新刷新true/false
			var a = $('a.ewa-app-radio-box[rid="' + obj.id + '"]');
			if (obj.checked) {
				$(a).find('i').addClass('fa-check');
			} else {
				$(a).find("i").removeClass("fa-check");
			}
			return;
		}
		obj = r[0];
		var id = r.attr('id');

		if (!id) {
			id = EWA_Utils.tempId('reShowRadio');
			r.attr('id', id);
		}

		var nobr = r.parent();
		var label = nobr.find('label[for="' + id + '"]');

		var txt = label.length == 0 ? "" : label.html();

		var a = document.createElement('a');
		a.className = 'ewa-app-radio-box';
		nobr.append(a);

		var s = '<i class="ewa-app-radio ' + r[0].type + ' fa"></i><span class="ewa-app-radio-text">' + txt + '</span>';

		$(a).html(s);
		$(a).attr('onclick', 'EWA_App.Section.radioClick(this)');
		$(a).attr('rid', id);
		$(a).attr('rname', this.name);

		if (obj.checked) {
			$(a).find('i').addClass('fa fa-check');
		}
		r.hide();
		r.attr('reshowradio', 'yes');
		label.hide();

	},
	/**
	 * 将ListFrame buttons显示为下部弹起菜单
	 * 
	 * @param fromObj
	 * @param ewaId
	 */
	showLfMenus: function(fromObj, ewaId) {
		var obj = fromObj;
		if (!obj) {
			alert('传入的对象为空');
			return;
		}
		if (!(obj.tagName == 'TR' && obj.className.indexOf('ewa-lf-data-row') >= 0)) {
			var p = $(obj).parentsUntil('tr.ewa-lf-data-row').last().parent()[0];
			if (!(p.tagName == 'TR' && p.className.indexOf('ewa-lf-data-row') >= 0)) {
				alert('找不到对应的TR（ewa-lf-data-row）');
				return;
			}
			obj = p;
		}

		var tgid = EWA_Utils.tempId('ewa-app-lf-menu-trigger');
		$(obj).parent().find(".ewa-app-lf-menu-trigger").removeClass('ewa-app-lf-menu-trigger');
		$(fromObj).addClass("ewa-app-lf-menu-trigger").attr('tgid', tgid);


		var sectionId = $(EWA_App.SECTION_SHOW).attr('id');

		var fid = 'EWA.UI.Dialog.OpenReloadClose';
		var rep = 'EWA_App.Section.fake_EWA_UI_Dialog_OpenReloadClose';
		var ss = [];
		$(obj).find('input[type=button]').each(function() {
			var clk = $(this).attr('ewa_click');
			if (!clk) {
				clk = $(this).attr('onclick');
			}
			var o1 = null;
			// 是否是流程
			var isflow = $(this).attr("ewa_tag") == "butFlow";
			if (!clk) {
				// 匿名函数，直接出发点击事件
				var ref_id = EWA_Utils.tempId('_ref_');
				$(this).attr('ewa_app_ref_id', ref_id);
				var js = "$('input[ewa_app_ref_id=" + ref_id + "]').trigger('click')";
				o1 = {
					txt: $(this).val(),
					js: js
				};
			} else if (clk.indexOf(fid) >= 0) {
				clk = clk.replace(fid, rep);
				var href = eval(clk) + "&EWA_APP_FROM_SECTION_ID=" + sectionId + (isflow ? "&isflow=1" : "");
				o1 = {
					txt: $(this).val(),
					href: href
				};
			} else {
				if (clk.indexOf('this') > 0) {
					// EWA.F.FOS['533570858'].DoAction(this,'ExtendAction1','CommonTitle','')
					var ref_id = EWA_Utils.tempId('_ref_');

					$(this).attr('ewa_app_ref_id', ref_id);
					var stmp = "$('input[ewa_app_ref_id=" + ref_id + "]')[0]";
					clk = clk.replace("this", stmp);
				}
				o1 = {
					txt: $(this).val(),
					js: clk
				};

				var attrHref = $(this).attr("data-href")
				if (attrHref) {
					o1.href = attrHref;
				}
			}
			ss.push(o1);
			o1.id = this.id;
		});
		if (EWA_App.DEBUG) console.log(ss);

		var attacheJs = "$('a[tgid=" + tgid + "]').removeClass('ewa-app-lf-menu-trigger');";
		this.showLfMenuBox(ss, attacheJs);

	},
	/*显示底部菜单
	 */
	showLfMenuBox: function(ss, attacheJs) {
		var ss1 = [];
		var jscommon = (attacheJs || "") + ";$(this).parent().parent().hide();";

		var isDoubleCol = ss.length > 6;

		for (var n in ss) {
			var d = ss[n];
			var js = d.js;
			var href = d.href
			var t = "<a ";
			if (isDoubleCol) {
				t += ' style="width:50%;float:left;"';
			}
			t += " class='ewa-app-lf-menu-item ref-id-" + d.id + " ";
			if (href) {
				t += " href' href='" + href + "' onclick=\"" + jscommon + "\">";
			} else if (js) {
				js = js.replace(/\"/gi, "&quot;");
				if (d.notclose) {
					t += " js' onclick=\"" + js + "; \">";
				} else {
					t += " js' onclick=\"" + js + "; " + jscommon + "\">";
				}
			} else {
				if (EWA_App.DEBUG)
					console.log('not ', d);
				continue;
			}
			t += d.txt + "</a>";
			ss1.push(t);
		}
		var o = $X('___ewa_lf_menu');
		if (!o) {
			window._EWA_UI_DIALOG_COVERINDEX = 1231;
			var div = document.createElement('div');
			div.id = '___ewa_lf_menu';
			div.className = 'ewa-ddl-box ewa-frame ewa-app-lf-menu';
			div.innerHTML = "<div class='ewa-ddl-box-content'></div><span><i onclick=\"" + jscommon + "\" class='fa fa-close'></i></span>";
			document.body.appendChild(div);
			o = $('#___ewa_lf_menu');
		} else {
			o = $(o);
			o.find('i').attr('onclick', jscommon);
		}
		var html = ss1.join("");
		o.find('.ewa-ddl-box-content').html(html);

		// 对应链接，绑定事件
		var c = this;
		o.find('a.href').each(function() {
			c.bindAEvent(this);
		});
		o.css('bottom', -200).show();
		o.animate({
			bottom: 0
		}, 200, "swing");

		return o;
	},
	/**
	 * 图片后加载，三种情况<br>
	 * 1、.EWA_GRID_BG_IMG[is_lazy_load=true] <br>
	 * 2、.cover<br>
	 * 3、img[is_lazy_load]<br>
	 */
	lazyload: function(iscroll) {
		if (!iscroll && EWA_App.SECTION_SHOW) {
			var opt = __SECTIONS[EWA_App.SECTION_SHOW.id];
			if (opt) {
				iscroll = opt.myScroll;
			}
		}
		if (!iscroll) {
			return;
		}
		var h = document.documentElement.clientHeight - 100;
		// ewa gridBgImg ImageLazyLoad=yes
		var objs = $(iscroll.scroller).find('.EWA_GRID_BG_IMG[is_lazy_load=true]');
		objs.each(function() {
			var o = $(this);
			if (o.offset().top < h) {
				o.removeAttr('is_lazy_load');
				var src = o.attr('ori_src');
				o.css('background-image', 'url("' + src + '")');
			}
		});
		// 自定义部分
		$(iscroll.scroller).find('.cover').each(function() {
			var o = $(this);
			if (o.attr('lazyloaded')) {
				return;
			}
			var t = o.offset().top;
			if (t < h && t >= 0) {
				o.attr('lazyloaded', 1);
				var bg = o.attr('backgroundimage');
				o.attr('backgroundimage1', bg);
				if (bg) {
					if (bg.indexOf('url(') < 0) {
						bg = "url(\"" + bg + "\")";
					}
					o.css('background-image', bg);
				}
			}
		});
		// img
		$(iscroll.scroller).find('img[is_lazy_load]').each(function() {
			var o = $(this);
			if (o.attr('lazyloaded')) {
				return;
			}
			var t = o.offset().top;
			if (t < h && t >= 0) {
				o.attr('lazyloaded', 1);
				o.removeAttr('is_lazy_load');
				var bg = o.attr('lazy');
				if (bg) {
					o.attr('src', bg);
				}
			}
		});
	},

	checkIsChromePassive: function() {
		// Chrome 51 和 Firefox 49 已经支持 passive 属性。如果浏览器不支持，已经有人做了非常巧妙地 polyfill：
		// https://segmentfault.com/a/1190000007913386?_ea=1507605
		if (this.__is_supportsPassive === undefined) {
			// Test via a getter in the options object to see
			// if the passive property is accessed
			var supportsPassive = false;
			if (EWA.B.IS_ANDROID) {
				try {
					var opts = Object.defineProperty({}, 'passive', {
						get: function() {
							supportsPassive = true;
						}
					});
					window.addEventListener("test", null, opts);
				} catch (e) {
				}
				this.__is_supportsPassive = supportsPassive;
				if (EWA_App.DEBUG)
					console.log(this.__is_supportsPassive);
			}
		}
		return this.__is_supportsPassive;
	},
	/**
	 * 创建IScroll
	 * 
	 * @param show
	 * @param opt
	 */
	createIScroll: function(show, opt) {
		EWA_App.IS_STOP_TOUCH_MOVE = true;
		var iscroll_opts = {
			click: true,
			probeType: 3,
			scrollbars: true, // 开启滚动条
			shrinkScrollbars: 'scale', // 滚动条动态伸缩的效果
			fadeScrollbars: true
			// 淡入淡出
		};
		var content = $(show).find('.content');
		if (content.length == 0) {
			console.log('创建IScroll错误, content为空', opt.ID);
			return;
		}
		content = content[0];
		try {
			opt.myScroll = new IScroll(content, iscroll_opts);
		} catch (e) {
			console.log('创建IScroll错误', $(show).id, e);
			return;
		}
		// 显示滚动条位置
		opt._ewa_load_more_obj = null; // 加载更多的对象
		opt.myScroll._events.scroll = [];

		// 后加载背景图
		if ($(show).find('.cover').length > 1 || $(show).find('.EWA_GRID_BG_IMG[is_lazy_load=true]')) {
			$(show).find('.cover').each(function() {
				if ($(this).attr('lazyloaded')) {
					// 已经加载，当loadmore时出现
					return;
				}
				var bg = $(this).css('background-image');
				if (bg && bg != 'none') {
					$(this).css('background-image', 'none').attr('backgroundimage', bg);
				}
			});
			opt.myScroll._events.scroll.push(function() {
				EWA_App.Section.lazyload(this);
			});
			setTimeout(function() {
				// 执行一次
				EWA_App.Section.lazyload(opt.myScroll);
			}, 121);
		}
		// 隐含滚动条
		opt.myScroll._events.scrollEnd = [function() {
			/*
			 * $('#slider_bar').animate({ opacity : 0 }, 10);
			 */
			$(EWA_App.SECTION_SHOW).find('.iScrollLoneScrollbar').animate({
				opacity: 0
			}, 10);
		}];
		// 显示滚动条
		opt.myScroll._events.scrollStart = [function() {
			/*
			 * var my = this.maxScrollY * -1; var h = this.wrapperHeight; var
			 * top = this.y * -1;
			 * 
			 * var slider_bar_height = h * (h / my); var slider_bar_top = top /
			 * my * h - slider_bar_height + (this.wrapperOffset.top * -1); var
			 * css = { height : slider_bar_height, top : slider_bar_top };
			 * $('#slider_bar').css(css); $('#slider_bar').show(100);
			 */
			$(EWA_App.SECTION_SHOW).find('.iScrollLoneScrollbar').animate({
				opacity: 0.5
			}, 10);
		}];

		var addDiv = opt.myScroll.scroller;
		if (opt.IScrollScale) {
			// IScroll 下拉时关联图片放大
			var o = $(show).find(opt.IScrollScale);
			if (o.length == 0) {
				if (EWA_App.DEBUG)
					console.log(opt.IScrollScale + ' not defined (IScrollScale)');
				return;
			}
			$(show).addClass("ewa-app-iscrollscale"); // 在section上添加标记
			$(show).attr('IScrollScale', opt.IScrollScale)
			o.addClass('ewa-app-iscrollscale-target');
			$(show).find('.content:eq(0)').append(o);
			var h = o.height();
			// 装载根据 下拉的位置改变标题图的尺寸
			opt.myScroll._events.scroll.push(function() {
				if (this.y < 0 && this.distY < 0) {
					return;
				}
				var a = 1 + this.distY / (h * 3);
				if (a < 1 || o.attr('a') == a) {
					return;
				}
				o.css('transform', 'scale(' + a + ')').css('transition-duration', '0s').attr('a', a);
			});
			// 恢复尺寸
			opt.myScroll.gdxScrollEnd = function() {
				if (o.attr('a')) {
					o.css('transform', 'scale(1)').css('transition-duration', '0.6s');
				} else {
					o.attr('a', null);
				}
			};
		}
		// 左右滑动
		opt.myScroll.gdxScrollEnd1 = function(e) {
			// console.log(e, this.distX, this.distY, e.timeStamp -
			// this.startTime);

			if (e.timeStamp - this.startTime > 655 || Math.abs(this.distY) > 140 || Math.abs(this.distX) < 100) {
				return;
			}
			// console.log(e, this.distX, this.distY, e.timeStamp -
			// this.startTime);
			if (this.distX < 0) {
				// console.log("从右向左");
				// console.log(e.target);
				if (e.target != null && e.target.getAttribute('delete')) {
					// 之前的删除按钮隐含
					var prevs = $('.scroll-delete-active');
					if (prevs.length > 0) {
						prevs.addClass('scroll-delete-deactive');
						setTimeout(function() {
							prevs.removeClass('scroll-delete-active').removeClass('scroll-delete-deactive');
						}, 1000);
					}
					var o = $(e.target).parent().parent(); // tr
					o.addClass('scroll-delete-active');
					var top = o.offset().top;
					o.removeAttr('onmouseover').removeAttr('onclick');
				} else {
					// 从右向左
					var objs = $(EWA_App.SECTION_SHOW).find('footer a.ft-item');
					if (objs.length == 0) {
						return;
					}
					var startIndex = -1;
					objs.each(function(n) {
						if (startIndex == -1 && this.className && this.className.indexOf('ft-item-cur') > 0) {
							startIndex = n * 1;
						}
					});

					if (startIndex < 0) {
						return;
					}
					if (startIndex == objs.length - 1) {// 最后一个
						return;
					}
					objs[startIndex + 1].click();
				}
			} else if (this.distX > 0) {
				// 从做向右
				// console.log("从左向右");
				if (e.target != null && e.target.getAttribute('delete')) {
					var po = $(e.target).parent().parent();
					if (po.hasClass('scroll-delete-active')) {
						// 隐含删除
						po.addClass('scroll-delete-deactive');
						setTimeout(function() {
							po.removeClass('scroll-delete-active').removeClass('scroll-delete-deactive');
						}, 1000);
						return;
					}
				}
				if (window.history.length > 0) {
					window.history.back();
				}
			}
		};
		if (opt.IScrollMore) {
			opt.myScroll.gdxScrollEnd = function(e) {
				if (!opt.myScroll || !opt.myScroll.y) {
					return;
				}
				if (opt.myScroll.y > 33) {
					// 刷新数据
					$(opt.myScroll.wrapper).addClass('reloading');
					setTimeout(function() {
						EWA_App.Section.reload();
					}, 333);
				}
			};
			opt.noMoreData = function() {
				// 当没有更多数据时直接返回
				return false;
			};
			// 加载更多数据
			opt.myScroll._events.scroll.push(function() {
				if (!opt.myScroll || !opt.myScroll.y) {
					return;
				}
				if (opt.myScroll.directionY == -1) {
					// 向上
					return;
				}
				var dist = (opt.myScroll.y - opt.myScroll.maxScrollY);
				if (dist < 247 && dist > 100) { //距离底部距离
					if (EWA_App.DEBUG) {
						console.log(opt.myScroll);
						console.log("myScroll.loadMore: " + dist);
					}
					EWA_App.Section.loadMore(true);
				}
			});
		}
		EWA_App.MonitorResize.add(addDiv, function(d, currentTime) {
			if (opt._is_reloadding) {// 数据加载中，不处理
				return;
			}
			if (opt.myScroll) {
				var t1 = opt.myScrollLastTimer || 0;

				if (t1 == currentTime) {
					// 当前的时间执行过了，出现在多次添加了相同的Section
					return;
				}
				opt.myScrollLastTimer = currentTime;

				opt.myScroll.refresh();
				if (EWA_App.DEBUG) {
					console.log('scroll refresh(' + opt.ID + ')');
				}
			}
			if (opt.RefreshAfter) {
				opt.RefreshAfter(opt);
			}
		});
	},
	/**
	 * 修改微信中的标题
	 * 
	 * @param title
	 *            标题
	 */
	setWeiXinTitle: function(title) {
		// hack在微信等webview中无法修改document.title的情况
		var b = $("body");
		document.title = title;
		var c = $('<iframe class="fack-weixin" width=0 style="display:none" height=0 src="about:blank"></iframe>');
		b.append(c);
		setTimeout(function() {
			c.remove()
		}, 1300);
	},
	/**
	 * 修改标题（页头和document）
	 * 
	 * @param title
	 *            标题
	 */
	setTitle: function(title, section) {
		var obj = section || EWA_App.SECTION_SHOW;
		if (!obj) {
			return;
		}
		var opt = __SECTIONS[obj.id];
		if (opt) {
			// 记录设置的标题，返回时候显示
			opt._title_old = title;
		}
		$(obj).find('header h1').text(title);
		document.title = title;
		// 微信小程序中hack修改title
		if (EWA_App.IS_IN_WEIXIN_MINI) {
			EWA_App.Section.setWeiXinTitle(document.title);
		}
	},
	/**
	 * 页面切换后ajax数据加载完成事件
	 * 
	 * @param hide
	 *            隐藏的section
	 * @param show
	 *            显示的section
	 * @param opt
	 *            配置
	 * @param content
	 *            加载的内容
	 * @param isback
	 *            是否是返回
	 * @param isloadMore
	 *            是否是加载更多
	 */
	ajaxLoadedAfter: function(hide, show, opt, content, isback, isloadMore) {
		var c = this;

		var tb = $(show).find('.EWA_TABLE');
		var ewas = this.getEWAS(); // 获取所有的 ewa

		if (opt.Title) {
			this.setTitle(opt.Title);
		} else {
			var setted = false;
			if (ewas.length > 0) {
				this.setTitle(ewas[0].Title);
			}
		}

		// EWA_APP_FROM_SECTION_ID 参数是Frame提交数据后，刷新来源数据并返回
		var u1 = new EWA_UrlClass();
		var fromSectionId = u1.GetParameter("EWA_APP_FROM_SECTION_ID");
		var fromCfg = __SECTIONS[fromSectionId];
		var ewa_id = "";

		for (var i = 0; i < ewas.length; i++) {
			var ewa = ewas[i];
			ewa.SECTION_CFG = opt;
			var id = ewa.Id;
			ewa_id = id;
			if (ewa instanceof EWA_FrameClass) { // frame
				this.frameUIAndEvents(ewa);
				if (window.EWA_CGI && $(show).find('.ewa-ipt-droplist').length > 0) {
					if (EWA_App.DEBUG) {
						console.log('清除EWA_CGI, ' + window.EWA_CGI);
					}
					window.EWA_CGI = null; // 清除已存在的EWA_CGI，否则ddl会出错
				}
			} else if (ewa instanceof EWA_ListFrameClass) {
				this.listFrameUIAndEvents(ewa);
			}
		}

		var is_scroll = false;
		if (opt.IScroll instanceof Function) {
			is_scroll = opt.IScroll(show);
		} else {
			is_scroll = opt.IScroll;
		}
		if (is_scroll && !isloadMore) {
			EWA_App.IS_STOP_TOUCH_MOVE = true;
			this.createIScroll(show, opt);
		} else {
			EWA_App.IS_STOP_TOUCH_MOVE = false;
			$('#slider_bar').hide(); // 隐藏滚动条
			$(show).find('.content').css('overflow', 'auto');
			$(show).find('.add-div').css('padding-bottom', 50);
		}

		var c = this;
		var sectionId = $(show).attr('id');

		// 重新绘制搜索框，合并多个text搜索为一个
		//if (opt.RE_SHOW_LF_FILTER == 'Y') {
		this.reShowFilter();
		//} else {
		//	this.beautfyFilter();
		//}

		$(show).find('a').each(function() {
			c.bindAEvent(this);
		});

		this.reShowRadios(show);

		if (opt.Installed) {
			opt.Installed(show);
		}

		var footers = $(show).find('footer');
		for (var i = 0; i < footers.length; i++) {
			var f = footers[i];
			if (i == 0) {
				if (f.parentNode.tagName != 'SECTION') {
					$(show).append(f);
				}
			} else { // 只保留第一次出现的footer ,其它删除
				$(f).remove();
			}
		}

		var headers = $(show).find('header');
		for (var i = 0; i < headers.length; i++) {
			var f = headers[i];
			if (i == 0) {
				if (f.parentNode.tagName != 'SECTION') {
					$(show).prepend(f);
				}
			} else { // 只保留第一次出现的header ,其它删除
				$(f).remove();
			}
		}

		// console.log('ajaxloaded')
		this.swapPage(hide, show, isback);
		this._is_ajax_loading = false;
	},
	/**
	 * 让date显示placeholder
	 */
	frameDatePlaceHolder: function(ele) {
		var obj = $(ele);

		var ss = [];
		ss.push(obj.attr('onmousedown'));
		var bl = obj.attr('onblur');
		if (bl) {
			ss.push(bl);
		}

		var fc = obj.attr('ewa_tag');
		var tp = 'date';
		if (fc == "datetime") {
			tp = 'datetime-local';
			if (ele.value) {
				// 处理英文默认日期无效
				let tmptime = new EWA_DateClass(ele.value);
				let tmpt = tmptime.FormatDateTime("yyyy-MM-dd").replace(' ', 'T');
				if (EWA_App.DEBUG) {
					console.log(tmpt);
				}
				ele.value = tmpt;
				ele.setAttribute('_formatdatetime_', tmpt);
			}
		} else if (fc == "time") {
			tp = 'time'
		} else { // date
			if (ele.value) {
				// 处理英文默认日期无效
				let tmptime = new EWA_DateClass(ele.value);

				// https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/input/date
				// 一个代表按照 YYYY-MM-DD 格式化过的日期 DOMString，或者是为空
				let tmpt = tmptime.FormatDate("yyyy-MM-dd");
				if (EWA_App.DEBUG) {
					console.log(tmpt);
				}
				ele.value = tmpt;
				ele.setAttribute('_formatdate_', tmpt);
			}
		}
		var atts = {
			onchange: ss.join(';'),
			type: tp
		};
		obj.removeAttr('readonly').removeAttr('onclick').removeAttr('onfocus').removeAttr('onkeydown').attr(atts);

		// 使input date支持placeholder方法
		var placeholder = obj.attr('placeholder');
		var css = "ewa-date-placeholder";
		if (obj.parent().hasClass('ewa-with-icon')) {
			css += ' ewa-with-icon'; // 有图标的输入框，padding-left: 25px
		}
		var disp = "";
		if (ele.value) { // 如果值存在，则不显示 placeholder
			disp = " style='display: none' "
		}

		var objPlaceholder = $("<div id='" + EWA_Utils.tempId() + "' class='" + css + "' " + disp + "></div>");
		objPlaceholder.text(placeholder);

		var td = obj.parentsUntil("tr").last();
		td.css('position', 'relative');
		td.append(objPlaceholder);

		obj.attr('_placeholder_id', objPlaceholder.attr('id'));
		obj.on('change keyup', function() {
			if (this.value) {
				$('#' + this.getAttribute('_placeholder_id')).hide();
			} else {
				$('#' + this.getAttribute('_placeholder_id')).show();
			}
		});
	},
	/**
	 * frame加载创建UI和事件
	 */
	frameUIAndEvents: function(ewa) {
		var c = this;

		var opt = ewa.SECTION_CFG;
		var sectionId = ewa.SECTION_CFG.ID;
		var show = $('section[id="' + sectionId + '"]');
		var tb = show.find('#EWA_FRAME_' + ewa._Id);

		ewa.H5Type();

		// EWA_APP_FROM_SECTION_ID 参数是Frame提交数据后，刷新来源数据并返回
		var u1 = new EWA_UrlClass();
		var fromSectionId = u1.GetParameter("EWA_APP_FROM_SECTION_ID");
		var fromCfg = __SECTIONS[fromSectionId];

		if (fromSectionId) {
			if (EWA_App.DEBUG) {
				console.log("EWA.F.FOS['" + ewa._Id + "'].ReloadAfter (" + fromSectionId + ")");
			}

			if (ewa.ReloadAfter) {
				// 原来定义过
				ewa._App_ReloadAfter = ewa.ReloadAfter;
			}

			ewa.ReloadAfter = function() {
				if (ewa._App_ReloadAfter) {
					// 首先调用原来定义的方法
					ewa._App_ReloadAfter();
				}
				// 强制返回的时候刷新
				fromCfg.RefreshBackAction = true;
				setTimeout(function() {
					fromCfg.RefreshBackAction = false;
				}, 500);
				EWA_App.back();
			};
		}

		tb.find('div[tag="REPT"]').each(function() {
			$(this).attr('onmousedown', null);
		});

		setTimeout(function() { // 自适应textarea
			tb.find('textarea').each(function() {
				var obj = $(this);
				if (!obj.attr('notautosize') && !obj.attr('aa')) {
					autoTextarea(this);
					obj.attr('aa', 'aa');
				}
				if (EWA_App.IS_IN_WEIXIN) {
					// H5页面在微信中页面会被软键盘顶起来
					obj.on('blur', function() {
						window.scroll(0, 0);
					});
				}
			});
		}, 200);

		// 处理时间和日期
		tb.find('.EWA_INPUT').each(
			function() {
				var obj = $(this);

				if (EWA_App.IS_IN_WEIXIN && this.type != 'file' && this.type != 'radio' && !this.type != 'checkbox'
					&& !this.type != 'submit' && this.type != 'button' && this.type != 'image') {
					// H5页面在微信中页面会被软键盘顶起来
					obj.on('blur', function() {
						window.scroll(0, 0);
					});
				}
				if (obj.hasClass('ewa-ipt-date') || obj.attr('ewa_tag') == 'time') {
					c.frameDatePlaceHolder(this);
					return;
				}
				if (obj.hasClass('ewa-ipt-droplist')) {
					obj.attr('oninput1', obj.attr('oninput'));
					obj.attr('onkeyup1', obj.attr('onkeyup'));
					obj.attr('readonly', 'readonly');
					obj.attr('onmousedown', 'createDDL(this)');
					obj.removeAttr('onkeyup');
					obj.removeAttr('oninput');
				}

				var xItem = ewa.ItemList.GetItem(this.id);
				if (!xItem) {
					return;
				}
				var dataType = $(xItem).find('DataItem Set').attr('DataType');
				// 数字
				if ("Int" === dataType || "Number" === dataType) {
					obj.attr('type', 'tel');
				} else if ("Number" === dataType) {
					obj.attr('type', 'number');
				}
			});

		if (opt.ButtonOnFooter) {
			this.buttonOnFooter(show);
		}

		if (EWA.B.IS_ANDROID) {
			// Android 微信 H5 不支持其它文件类型说明，vivo 不支持 multiple 属性
			tb.find('input[type=file]').each(function() {
				$(this).attr('accept', "image/*").removeAttr("multiple");
			});
		}
	},
	/**
	 * 加载Listframe的下一页，排序，搜索ajax调用后执行动作
	 */
	listFrameUIAndEvents: function(ewa) {
		var opt = ewa.SECTION_CFG;
		var sectionId = ewa.SECTION_CFG.ID;
		var show = $('section[id="' + sectionId + '"]');
		var tb = show.find('[id=EWA_LF_' + ewa.Id + ']');

		tb.find('.ewa-lf-data-row').each(function() {
			$(this).attr('onclick', $(this).attr('onmousedown'));
			$(this).attr('onmousedown', null);
		});

		// 先找流程按钮
		var butFlows = tb.find('input[ewa_tag="butFlow"]');
		var isflow = true;
		if (butFlows.length == 0) {
			// 再找修改按钮
			butFlows = tb.find('.ewa-lf-data-row #butModify');
			isflow = false;
		}

		var c = this;

		// 替换 butModify按钮为 A
		butFlows.each(function() {
			var a = c.convertButtonToAnchor(this, isflow, sectionId);
			if (a) {
				$(this).hide();
				$(this).parent().append(a).addClass('ewa-col-A').removeAttr('style');
			}
		});

		// 左移删除
		var butDeletes = tb.find('input[id="butDelete"]');
		butDeletes.each(function() {
			$(this).parent().addClass('scroll-delete').removeAttr('style');
			$(this).parent().parent().find('.ewa-col-A a').attr('delete', 'delete');
			if (!EWA.UI.Msg.IS_IN_APP) {
				// 在app中touch 事件会造成错误点击
				EWA.UI.Msg.IS_IN_APP = true;
			}
		});

		tb.find('a').each(function() {
			c.bindAEvent(this);
		});

		// console.log(opt.SHOW_LF_MENUS);
		// 从下部弹起菜单
		if (opt.SHOW_LF_MENUS == 'Y') {
			this.listFrameSetUpBottomMenu(tb, ewa);
		}

		var orderHeader;
		// 显示排序, 排序每次会重新加载
		if (opt.SHOW_ORDERS == 'Y') {
			orderHeader = this.showOrders();
			show.find('.ewa-lf-search .ewa-lf-header').remove();
			show.find('.ewa-lf-search').append(orderHeader);
		}

		// 利用ListFrame模式
		if ((opt.USE_EWA_LF == 'Y' || opt.USE_EWA_LF === true) && opt.IScrollMore != 'Y') {
			// 分页放到footer上 
			c.moveSplitToFooter();
		}

		// 下面需要设置 ReloadAfterApp，当listframe重新加载完成后，需要重新绘制
		// 触发条件：检索，排序，下一页，上一页等
		ewa.ReloadAfterApp = function() {
			if (EWA_App.DEBUG) {
				console.log("触发 ewa 的 ReloadAfterApp");
				console.log(ewa);
			}
			opt._ewa_load_more_obj = null; //加载更多的对象 重新设定为空
			c.listFrameUIAndEvents(ewa);
			if (opt.myScroll) {
				c.lazyload(opt.myScroll); // 加载图片
				// 重新加载后，移动0，0位置
				opt.myScroll.scrollTo(0, 0, 100);
			}
		};

		opt._is_reloadding = false;
	},
	/**
	* 创建底部菜单
	* @param listFrameTable
	* @param ewa
	 */
	listFrameSetUpBottomMenu: function(listframeTable, ewa) {
		var s = "<td class='ewa-col-A'><a onclick='EWA_App.Section.showLfMenus(this,\"" + ewa.Id
			+ "\");' class='show-lf-menus'></a></td>";
		$(listframeTable).find('tr.ewa-lf-data-row').each(function() {
			if (!$(this).attr('SHOW_LF_MENUS')) {
				$(this).append(s).attr('SHOW_LF_MENUS', 1);
			}
		});
	},
	/**
	 * 转换 按钮为链接 A
	 * 
	 * @param obj
	 *            button
	 * @param isflow
	 *            是否流程
	 * @param sectionId
	 *            当前section的 Id
	 * @returns
	 */
	convertButtonToAnchor: function(obj, isflow, sectionId) {
		var clk = $(obj).attr('onclick');
		if (clk && clk.indexOf('EWA.UI.Dialog.OpenReloadClose') >= 0) {
			clk = clk.replace('EWA.UI.Dialog.OpenReloadClose', 'EWA_App.Section.fake_EWA_UI_Dialog_OpenReloadClose');
			var href = eval(clk) + "&EWA_APP_FROM_SECTION_ID=" + sectionId + (isflow ? "&isflow=1" : "");
			var a = $("<a convertButtonToAnchor='1' class='ewa-anchor'></a>");
			a.attr('href', href);

			return a;
		} else {
			return null;
		}
	},
	/**
	 * 将butModify的值转换为 a的url
	 */
	fake_EWA_UI_Dialog_OpenReloadClose: function(ewa_uid, xmlName, itemName, nothing, params, afterMsg, isAttatchParas) {

		var id = EWA_App.SECTION_SHOW && EWA_App.SECTION_SHOW.id == 'ewa' ? 'ewa1' : 'ewa';
		if (id == 'ewa1' && !__SECTIONS[id]) {
			__SECTIONS[id] = __SECTIONS['ewa'];
		}
		if (itemName.toUpperCase().indexOf('.LF.') > 0 || itemName.toUpperCase().indexOf('.LISTFRAME.') > 0) {
			id = EWA_App.SECTION_SHOW && EWA_App.SECTION_SHOW.id == 'ewa_lf' ? 'ewa_lf1' : 'ewa_lf';
			if (id == 'ewa_lf1' && !__SECTIONS[id]) {
				__SECTIONS[id] = __SECTIONS['ewa_lf'];
			}
		}

		var paras = params;
		// 附加来源的参数
		if (isAttatchParas == 'yes' && EWA.F && EWA.F.FOS[ewa_uid] && EWA.F.FOS[ewa_uid].Url) {
			var u1 = new EWA_UrlClass(EWA.F.FOS[ewa_uid].Url);
			u1.RemoveEwa();

			// 传递的参数级别高于来源参数
			var u0 = new EWA_UrlClass("a1?" + paras);
			for (var n in u0._Paras) {
				var v = u0.GetParameter(n);
				u1.AddParameter(n, v);
			}
			paras = u1.GetParas();
		}
		var href = window.location.href.split('#')[0] + "#" + id + "?xmlname=" + xmlName + "&itemname=" + itemName
			+ "&" + paras + "&EWA_AJAX=INSTALL";
		return href.replace(/\|/ig, '%7c');
	},
	/**
	 * 将EWA_FRAME的button放到footer
	 */
	buttonOnFooter: function(show) {
		var jshow = show ? $(show) : $(EWA_App.SECTION_SHOW);
		jshow.find('#butClose').remove();
		var objs;
		// 向导模式
		var EWA_FRAME_GROUP_BUTTONS = jshow.find('.EWA_FRAME_GROUP_BUTTONS');
		var is_guide_method = false;
		if (EWA_FRAME_GROUP_BUTTONS.length == 0) {
			objs = jshow.find('.EWA_TD_B input,.EWA_TD_B button');
		} else {
			// 向导模式
			objs = EWA_FRAME_GROUP_BUTTONS.find('input');
			EWA_FRAME_GROUP_BUTTONS.hide();
			is_guide_method = true;
		}

		jshow.find('.EWA_TD_B').hide();
		var footer = jshow.find('footer');
		var w = (100 / objs.length);
		footer.html("");

		var formId = jshow.find('form').attr('id');
		// 添加一个100px的高度
		jshow.find('form').append('<div class="ewa-app-bottom-append" ></div>');

		objs.each(function(index) {
			var o = document.createElement('input');
			o.id = 'butOk';
			o.value = this.value || this.innerHTML;
			o.type = 'button';
			o.style.width = w + "%";
			o.style.left = w * index + "%";
			o.style.display = 'block';
			if (index > 0) {
				o.style.borderLeft = '1px solid #fff';
			}
			if (is_guide_method == false && this.type == 'submit') {
				o.setAttribute('onclick', "$X('" + formId + "').onsubmit();");
			} else {
				var rid = is_guide_method ? this.id : EWA_Utils.tempId('ref_but_');
				if (!is_guide_method) {
					this.id = rid;
				}
				o.setAttribute('rid', rid);
				o.setAttribute('onclick', "EWA_App.Section.footerButtonRelate(this);");

				if (this.style.display == 'none' || this.disabled) {
					o.setAttribute('disabled', 'disabled');
				}
			}
			footer.append(o);
		});
	},
	// 针对上一步，下一步显示 input上的文字
	footerButtonRelate: function(obj) {
		// 先执行
		const t0 = $(obj).attr('last_t') || 0;
		const t1 = new Date().getTime();
		if(t1 - t0 < 500){
			// 间隔小于500毫秒，认为是重复点击
			return;
		}
		 $(obj).attr('last_t', t1);
		
		var rid = $(obj).attr('rid');
		var ref_obj = $X(rid); // 根据rid找到真正的input[button]
		if (ref_obj == null) {
			console.log('不能找到 ref_obj id=' + rid);
			return;
		}
		ref_obj.onclick();

		// 再改变文字或是否禁用
		var footer = $(obj).parent();
		footer.find('input').each(function() {
			var rid = $(this).attr('rid');
			var ref_obj = $X(rid); // 根据rid找到真正的input[button]
			if (ref_obj == null) {
				console.log('不能找到 ref_obj id=' + rid);
				return;
			}

			this.value = ref_obj.value;
			if (ref_obj.style.display == 'none' || ref_obj.disabled) {
				this.setAttribute('disabled', 'disabled');
			} else {
				this.removeAttribute('disabled');
			}
		});
	},
	/**
	 * 绑定当前链接的事件
	 */
	bindAEvents: function(parent) {
		var me = this;
		var p = parent || EWA_App.SECTION_SHOW;
		$(p).find('a').each(function() {
			me.bindAEvent(this);
		});
	},
	/**
	 * 绑定链接事件
	 */
	bindAEvent: function(a) {
		var obj = $(a);
		if (!obj.attr('ckjs')) {
			var me = this;
			var href = obj.attr("href");

			if (!href || href.indexOf('#') < 0) {
				return;
			}
			obj[0].addEventListener('click', function(e) {
				me.handleAClick(this, e);
				return false;
			}, false);
			obj.attr('ckjs', 'g');
		}
	},
	handleAClick: function(a, e) {
		if (e) {
			e.stopPropagation();
			e.preventDefault();
		}
		var t = new Date().getTime();
		var t1 = $(a).attr('t');
		$(a).attr('t', t);
		if (t1 && t - t1 < 144) {
			// console.log('same click', t-t1)
			return;
		}
		var href = a.href;
		if (href == null || href.indexOf('#') < 0) {
			return;
		}
		var urls = EWA_App.Section.getParas(href);
		if (urls.section_id) {
			var id = urls.section_id;
			if (EWA_App.State.prevShow == $('section[id=' + id + ']')[0]) {
				// console.log(id, 'same');
				return false;
			}
		}
		var title = a.innerText.trim();

		$(a).addClass('act');

		// 2018-06-19 chrome新出现的问题，直接获取href会把xxx.jsp地址替换掉
		href = EWA_App.ENTRY_URL + '#' + href.split('#')[1];
		// 跳转前 进行自定义事件处理，例如：判断是否登录
		if (EWA_App.DEBUG) {
			console.log(href);
		}

		var u1 = new EWA_UrlClass(href);
		// 是否替换当前的 section
		var is_replace_state = u1.GetParameter("EWA_APP_SECTION_REPLACE");
		if (EWA_App.DEBUG) {
			console.log(is_replace_state);
		}
		if (EWA_App.handleAClickBefore) {
			EWA_App.handleAClickBefore(urls, href, title, function() {
				EWA_App.State.state(title, href, false, is_replace_state);
			});
		} else {
			setTimeout(function() {
				EWA_App.State.state(title, href, false, is_replace_state);
			}, 10);
		}
		setTimeout(function() {
			$(a).removeClass('act');
		}, 500);
	},
	/**
	 * 在当前section添加大型添加按钮
	 */
	showLargeAddButton: function(text, clickFunc) {
		var show = $(EWA_App.SECTION_SHOW);
		var grid = show.find('.ewa-grid-frame');
		var lf = show.find('.ewa-lf-frame');
		var parent;
		if (grid.length > 0) {
			if (grid.find('.ewa_grid_li').length > 0) {
				return;
			}
			parent = grid.parent();
		} else if (lf.length > 0) {
			if (lf.find('.ewa-lf-data-row').length > 0) {
				return;
			}
			parent = lf.parent();
		} else {
			return;
		}
		var a = $('<a class="ewa-app-large-add-btn"></a>');
		if (!text) {
			text = EWA.LANG == 'enus' ? "Publish your work and let more people know about you" : "发表您的作品，让更多的人了解您。";
		}
		a.text(text);
		parent.html("").append(a);
		if (clickFunc) {
			a[0].onclick = function() {
				clickFunc(this);
			};
		} else {
			var c = this;
			setTimeout(function() {
				var href = show.find('.ewa-app-btn-add a').attr('href');
				a.attr('href', href);
				c.bindAEvent(a[0]);
			}, 444);
		}
	},
	showBtnAdd: function(show, href) {
		var btnAdd = $(show).find('.ewa-app-btn-add');
		// 重新创建 A
		btnAdd.html('<a></a>');
		btnAdd.show();
		if (href) {
			btnAdd.find('a').attr('href', href);
			this.bindAEvent(btnAdd.find('a')[0]);
		}
		return btnAdd;
	},
	hideBtnAdd: function(show) {
		var btnAdd = $(show).find('.ewa-app-btn-add');
		btnAdd.hide();
		return btnAdd;
	},
	swapPage: function(hide, show, isback) {
		var hideId = $(hide).attr("id");
		var showId = $(show).attr("id");
		var showCfg = __SECTIONS[showId];
		var hideCfg = __SECTIONS[hideId];

		if (hideId == showId) { // 当section replace时出现
			// 用户自定义显示完成后的动作
			if (showCfg.ShowCompleted) {
				try {
					showCfg.ShowCompleted(show, hide);
				} catch (e) {
					console.log(showCfg.ShowCompleted, e);
				}
			}
			this.hideCoverDiv();
			return;
		}
		if (EWA_App.DEBUG) {
			console.log('swapPage', hide, show, isback);
		}

		// 返回按钮
		//if (!EWA_App.FirstId || showId == EWA_App.FirstId) {
		// $('#header_but_back').hide();
		//} else {
		// $('#header_but_back').show();
		//}

		// 显示添加按钮
		if (showCfg.ShowPlusButton) {
			var paras = (new EWA_UrlClass()).GetParas();
			var href = showCfg.ShowPlusButton;
			if (paras) {
				href = href + "&" + paras;
			}
			// 来源section id,用于提交后刷新页面，在 ajaxLoadedAfter 定义
			href += "&EWA_APP_FROM_SECTION_ID=" + showId;

			// $('#header_but_plus').show();
			this.showBtnAdd(show, href);
		} else {
			var clk = null;
			if (showId.indexOf('ewa') == 0 || showCfg.SHOW_LF_ADD == 'Y') {
				var p = $('section#' + showId + " .ewa_lf_func");
				// 寻找老式的在htmlTop添加的按钮
				p.find("input[type=button]").each(function() {
					var res = $(this).attr("res");
					if (res && res.indexOf('butAdd') > 0) {
						clk = $(this).attr('onclick');
					}
				});
				if (!clk) {
					// 寻找第一个 ewa_click标记的按钮，通常添加放在第一位
					clk = p.find(".ewa_lf_func_dact[ewa_click]:eq(0)").attr('ewa_click');
				}
			}
			if (EWA_App.DEBUG) {
				console.log("添加按钮");
				console.log(clk);
			}
			if (clk) { // 显示添加按钮
				var btn = this.showBtnAdd(show);
				btn.find('a').attr('onclick', clk);
			} else {
				this.hideBtnAdd(show);
			}
		}

		if (hideCfg) {
			if (hideCfg.Losted) {
				// 当页面消失后事件
				hideCfg.Losted(hide);
			}
			if (!hideCfg.Refresh && hideCfg.myScroll) {
				hideCfg.myScroll.___x = hideCfg.myScroll.x;
				hideCfg.myScroll.___y = hideCfg.myScroll.y;
			}
		}
		$(show).find('footer a.ft-item').each(function() {
			$(this).removeClass('ft-item-cur');
			var href = $(this).attr("href").split('?')[0];
			if (href == '#' + showId) {
				$(this).addClass('ft-item-cur');
			}
		});

		if (isback && EWA_App.IS_IN_WEIXIN) {
			// 返回时候，刷新Title 避免微信标题不对
			var t = showCfg._title_old || showCfg.Title;
			document.title = t;
			this.setWeiXinTitle(t);
		}

		if (showCfg && showCfg.swap == 'direct') {
			if (EWA_App.DEBUG) {
				console.log(showCfg.swap);
			}
			$(hide).hide();
			$(show).css('display', 'flex');
			$(show).css('-webkit-transform', 'translate3d(0,0,0)');
			showCfg.swap = '';
			this.showCompleted(hide, isback)
			return;
		}

		var CSS = EWA_App.Ani.getCss(isback ? hideCfg.swap : showCfg.swap);

		if (isback) {
			$(show).css(CSS.INIT_BACK);
		} else {
			$(show).css(CSS.INIT);
		}

		// $(hide).show();
		// $(show).parent().append(show);
		$(show).css('display', 'flex');
		// 跳转到原来位置
		if ((!showCfg.Refresh) && showCfg.myScroll && showCfg.myScroll.___y) {
			if (EWA_App.DEBUG)
				console.log(showCfg.myScroll.___x, showCfg.myScroll.___y)
			showCfg.myScroll.scrollTo(showCfg.myScroll.___x, showCfg.myScroll.___y, 0);
		}

		var c = this;

		setTimeout(function() {
			// 转换场景
			if (isback) { // 返回
				$(hide).css(CSS.BACK_HIDE);
				$(show).css(CSS.BACK_SHOW);

				if (EWA_App.DEBUG)
					console.log(hide, show);
				if (EWA_App.DEBUG)
					console.log(CSS.BACK_HIDE, CSS.BACK_SHOW);

			} else {
				$(hide).css(CSS.HIDE);
				$(show).css(CSS.SHOW);
			}

			// 延时处理后续内容
			setTimeout(function() {

				if (showCfg.swap != 'pop') {
					$(hide).css({
						'-webkit-transform': '',
						'-webkit-transition': ''
					});
					$(hide).hide();
				}

				// 用户自定义显示完成后的动作
				if (showCfg.ShowCompleted) {
					try {
						showCfg.ShowCompleted(show, hide);
					} catch (e) {
						console.log(showCfg.ShowCompleted, e);
					}
				}

				// 执行完跳转到的元素
				if (showCfg.InitScrollToElement) { // 需要在用户程序中定义
					var o = $(showCfg.InitScrollToElement);
					if (o.length == 0) {
						if (EWA_App.DEBUG)
							console.log("showCfg.InitScrollToElement none");
					} else {
						var t = showCfg.InitScrollToElementTimer || 0;
						showCfg.myScroll.scrollToElement(o[0], t);
					}
					// 处理完清除属性
					showCfg.InitScrollToElementTimer = null;
					showCfg.InitScrollToElement = null;
				}
				// if (showCfg.USE_EWA_LF) { // 利用ListFrame模式
				// c.moveSplitToFooter();
				// }
				c.showCompleted(hide, isback);
				// showCfg.myScroll.refresh();
			}, 500);
		}, 1);
	},
	showCompleted: function(hide, isback) {
		this.hideCoverDiv();

		var hideId = $(hide).attr("id");
		var hideCfg = __SECTIONS[hideId];
		if (!hideCfg) {
			return;
		}
		var is_clear_hidden = false;
		if (isback) { // 返回时候，hide 如果定义的强制刷新，清空内容
			if (hideCfg.Refresh) {
				is_clear_hidden = true;
			}
		} else {
			// 前进时
			if (hideCfg.RefreshBackAction) { // 定义了返回按钮强制刷新
				is_clear_hidden = true;
			}
		}
		if (is_clear_hidden) {
			if (EWA_App.DEBUG)
				console.log('showCompleted (' + hideId + ') -> clear content!')
			// 清除iscroll
			if (hideCfg.myScroll) {
				hideCfg.myScroll.destroy();
				delete hideCfg.myScroll;
				hideCfg.myScroll = null;
			}
			// $('section#' + hideId + '>.content').html('');
			// $('section#' + hideId + '>.content .js-registers').html('');
			$('section#' + hideId).remove();
		}
	},

	/**
	 * 利用ListFrame模式
	 */
	moveSplitToFooter: function() {
		var sec = $(EWA_App.SECTION_SHOW);

		var footer = sec.find('footer');
		if (footer.length == 0) {
			return;
		}
		var cfg = __SECTIONS[sec.attr('id')];
		if (cfg.IScrollMore) {
			// 上拉加载更多
			return;
		}

		var ewaid = sec.find('.ewa-lf-frame').attr('id');
		if (!ewaid) {
			return;
		}
		var ewa = EWA.F.FOS[ewaid.replace('EWA_LF_', '')];
		if (!ewa) {
			return;
		}

		var rid = footer.attr('rid');
		if (!rid) {
			rid = EWA_Utils.tempId("_rid_")
			footer.attr('rid', rid);
		}

		var split = sec.find(".content .ewa-lf-frame-split");
		if (split.length > 0) {
			var rid1 = split.attr('rid1');
			if (rid1 != rid) { // 如果来源的没有添加过(根据rid判断)
				split.attr('rid1', rid);
				footer.html("").append(split);
				var s1 = split.find('td:eq(0) b:last()').text();
				if (s1) {
					s1 = "<span class='records'> (" + s1 + ")</span>";
					sec.find('header h1 .records').remove();
					sec.find('header h1').append(s1);
				}
			}
		}
	}
};
EWA_App.State = {
	stack : [], // 记录url的堆栈
	inc : 0,
	init : function(id) {
		this.state(document.title, window.location.href, true);
		this.stateListen();
		this.initUrl = window.location.href;
		this.initSection = $('section[id="' + id + '"]')[0];
		this.prevShow = this.initSection;
		$('a').each(
				function() {
					var href = this.href;
					if (!href || href.toLowerCase().indexOf("javascript") >= 0
							|| href.indexOf('#') < 0) {
						return;
					}
					EWA_App.Section.bindAEvent(this);
				});
	},
	/**
	 * 更换状态（跳转地址）
	 * 
	 * @param title
	 *            标题
	 * @param url
	 *            地址,例如 #aa?a=1&b=2
	 * @param isinit
	 *            是否初始化，无刷新改变URL
	 * @param isReplace
	 *            是否替换当前地址
	 */
	state : function(title, url, isinit, isReplace) {
		if (window.history.pushState) {
			this.inc++;
			var s = {
				title : title,
				url : url,
				inc : this.inc
			};
			var a = s.title + '/' + s.url;
			if (this.___last_ == a) { // 避免重复提交
				if (EWA_App.DEBUG) {
					console.log('none-push', this.___last_);
				}
				return;
			}
			this.___last_ = a;
			var c = this;
			setTimeout(function() {
				c.___last_ = null;
			}, 444);
			if (EWA_App.DEBUG) {
				console.log('push', s);
			}
			// EWA_App.State._is_replace 老方法调用
			if (EWA_App.State._is_replace || isReplace) {
				window.history.replaceState(s, title, url);
				EWA_App.State._is_replace = false;
				this.stack[this.stack.length - 1] = url;
			} else {
				window.history.pushState(s, title, url);
				this.stack.push(url);
			}
			if (!isinit) {
				EWA_App.Section.handleState(s);
			}
		} else {
			alert('brower not support history.pushState')
		}
		document.title = title;
	},
	stateListen : function() {// 监听地址
		var c = this;
		window.addEventListener('popstate', function(e) {
			if (EWA_App.DEBUG) {
				console.log('popstate', e);
			}
			var h = c.stack.pop();
			if (c.stack.length == 0) {
				if (EWA_App.DEBUG) {
					console.log('地址堆栈为空了，重新将第一页入栈');
				}
				c.state("", h, true);
				return;
			}
			if (e.state) {
				e.state._is_back = true;
				EWA_App.Section.handleState(e.state);
			} else {
			}
		}, false);
	}
};EWA.UI.Dialog.OpenReloadCloseOld = EWA.UI.Dialog.OpenReloadClose;
EWA.UI.Dialog.OpenReloadClose = function (ewa_uid, xmlName, itemName, nothing, params) {
	var href = EWA_App.Section.fake_EWA_UI_Dialog_OpenReloadClose(ewa_uid, xmlName, itemName, nothing, params);

	var showId = EWA_App.SECTION_SHOW.id;
	// 来源section id,用于提交后刷新页面，在 ajaxLoadedAfter 定义
	href += "&EWA_APP_FROM_SECTION_ID=" + showId;

	if (EWA_App.DEBUG)
		console.log(href);

	EWA_App.State.state(null, href);
};
function $X(id) {
	if (EWA_App.SECTION_SHOW && EWA_App.SECTION_SHOW.id) {
		var showId = EWA_App.SECTION_SHOW.id;
		var obj = $('section#' + showId + " [id=\"" + id + "\"]");
		if (obj.length == 0) {
			return document.getElementById(id);
		} else {
			return obj[0];
		}
	} else {
		return document.getElementById(id);
	}
}
EWA_Utils.JsRegisterSrc = function (src, onlyonce) {
	var hash = src.hashCode();
	var script_id = "ewa_js_register_" + hash;
	var o = $X(script_id);
	if (o) {
		if (onlyonce) {
			console.log("skip-js: " + src);
			// 注册过了
			return;
		}
		if (src.endsWith(".js")) {
			console.log("skip-js: " + src);
			return;
		}
	}

	var oHead;
	if (!onlyonce && !src.endsWith(".js") && EWA_App.SECTION_SHOW) {
		var p = $(EWA_App.SECTION_SHOW).find('div.js-registers');
		if (p.length == 0) {
			p = $("<div class='js-registers'></div>");
			$(EWA_App.SECTION_SHOW).find("div.content:eq(0)").append(p);
		}
		oHead = p[0];
	} else {
		// 结尾为.js的文件加载一次，因此放到头部便于检查
		oHead = document.getElementsByTagName('head')[0];
	}
	var oScript = document.createElement("script");
	oScript.type = "text/javascript";
	oScript.language = "javascript";
	oScript.id = script_id;
	try {
		oScript.src = src;
		oHead.appendChild(oScript);
	} catch (e) {
		alert(e);
	}
};
EWA_Utils.JsRegister = function (js) {
	var oHead;
	if (EWA_App.SECTION_SHOW) {
		var p = $(EWA_App.SECTION_SHOW).find('div.js-registers');
		if (p.length == 0) {
			p = $("<div class='js-registers'></div>");
			$(EWA_App.SECTION_SHOW).find("div.content:eq(0)").append(p);
		}
		oHead = p[0];
	} else {
		oHead = document.getElementsByTagName('head')[0];
	}

	var oScript = document.createElement("script");
	oScript.type = "text/javascript";
	oScript.language = "javascript";
	try {
		oScript.text = js;
		oHead.appendChild(oScript);
	} catch (e) {
		alert(e);
	}

};

function EWA_UrlClass(url) {
	this._URL = "";
	this._Paras = {};
	this._Root = "";
	this.SetUrl = function (url) {
		this._URL = url;
		this._Paras = {};

		var urls = url.split('?');
		this._Root = urls[0];
		if (url.indexOf("?") < 0) {
			return;
		}
		// index.jsp?wx_cfg_no=gh_02e4b5728208&openid=oaf5g8&weixinauth=1#visa?product_id=949&usr_unid=f78c4121-fae0-46ec-b256-a6bdac410c96
		// 由于app会出现畸形参数，因此需要处理
		for (ia = 1; ia < urls.length; ia++) {
			var u1 = urls[ia];
			var u2 = u1.split('&');

			for (var i = 0; i < u2.length; i++) {
				var u3 = u2[i].split('=');
				var paraName = u3[0].toUpperCase();
				var paraVal = '';
				if (u3.length == 2) {
					var paraVal = u3[1];
					if (paraVal.indexOf('#') > 0) {
						paraVal = paraVal.split('#')[0];
					}
				}
				this._Paras[paraName] = paraVal;
			}
		}
	};
	this.GetParameter = function (paraName) {
		return this._Paras[paraName.toUpperCase().trim()];
	};
	this.GetParas = function (islower) {
		var ss = [];
		for ( var n in this._Paras) {
			var v = this._Paras[n];
			if (islower) {
				n = n.toLowerCase();
			}
			if (v != null) {
				ss.push(n + "=" + v);
			}
		}
		return ss.join('&');
	};
	this.SetRoot = function (root) {
		this._Root = root;
	};
	/**
	 * 获取Url，islower是否将名称转换为小写
	 */
	this.GetUrl = function (islower) {
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
	this.AddParameter = function (paraName, paraValue, notEncode) {
		var p = paraName.toUpperCase().trim();
		this._Paras[p] = notEncode ? paraValue : encodeURIComponent(paraValue);
		return this.GetUrl();
	};
	this.RemoveParameter = function (paraName) {
		var p = paraName.toUpperCase().trim();
		this._Paras[p] = null;
		return this.GetUrl();
	};
	this.RemoveEwa = function () {
		for ( var n in this._Paras) {
			if (n.toUpperCase() == "XMLNAME" || n.toUpperCase() == "ITEMNAME" || n.toUpperCase().indexOf('EWA_') == 0) {
				this.RemoveParameter(n);
			}
		}
	}
	this.SetUrl(url || document.location.href);
}
// 由于app会出现畸形参数，因此需要处理
function $U(islower) {
	var u1 = new EWA_UrlClass();
	// 去除EWA参数
	u1.RemoveEwa();
	var ss = [];
	for ( var n in u1._Paras) {
		var v = u1._Paras[n];
		if (islower) {
			n = n.toLowerCase();
		}
		if (v != null) {
			if (v.indexOf('#') > 0) {
				v = v.split('#')[0];
			}
			ss.push(n + "=" + v);
		}
	}
	return ss.join('&');
}
/**
 * 改写错误提示信息
 * 
 * @param obj
 * @param errorInfo
 */
function EWA_FrameShowAlert(obj, errorInfo) {
	if (obj.getAttribute("show_alert") == 1) {
		return;
	}
	obj.setAttribute("show_alert", 1);
	var o1 = obj;
	do {
		o1 = o1.parentNode;
		if (o1.tagName == 'BODY') {
			o1 = null;
			break;
		}
	} while (!(o1.tagName == 'TR' && o1.getAttribute("SHOW_MSG") == 1));
	if (!o1) {
		var o = $(obj);
		o.attr("ori_bc", o.css('background-color'));
		o.css('background-color', 'pink');
		obj.focus();
		return;
	}

	var colSpan = 0;
	for (var i = 0; i < o1.cells.length; i++) {
		var td = o1.cells[i];
		if (td.style.display == 'none') {
			continue;
		}
		colSpan += td.colSpan;
	}

	var curTr = $(o1);
	var errTr = curTr.next();
	if (!errTr.attr('error')) {
		var tr = o1.parentNode.insertRow(o1.rowIndex + 1);
		tr.setAttribute('error', 1);
		var td = tr.insertCell(-1);
		td.colSpan = colSpan;
		td.className = 'ewa-tip-error';
		errTr = $(tr);
		td.innerHTML = '<div class="ewa-tip-error-info"></div>';
	}
	curTr.find('td').addClass('ewa-tip-error');
	errTr.find('.ewa-tip-error-info').html(errorInfo);

}
function EWA_FrameRemoveAlert(obj) {
	if (obj.getAttribute("show_alert") != 1) {
		return;
	}
	obj.setAttribute("show_alert", 0);

	var o1 = obj;
	do {
		o1 = o1.parentNode;
		if (o1.tagName == 'BODY') {
			o1 = null;
			break;
		}
	} while (!(o1.tagName == 'TR' && o1.getAttribute("SHOW_MSG") == 1));
	if (!o1) {
		var o = $(obj);
		o.css('background-color', o.attr('ori_bc'));
		return;
	}
	var curTr = $(o1);
	curTr.find('td').removeClass('ewa-tip-error');
	var errTr = curTr.next();
	if (errTr.attr('error')) {
		errTr.remove();
	}
}
/**
 * 自动登录， 本地localStorage保存的凭证发送到服务器进行登录，同时获取新的凭证保存下来
 * 
 * @param locaStoreName
 *            本地保存名称
 * @param loginUrl
 *            登录的url
 * @param loginSucessCb
 *            登录成功的回调 (rst.RST=true)
 * @param loginFailCb
 *            登录失败的回调 (rst.RST!=true)
 */
var EWA_AppAutoLoginClass = function(locaStoreName, loginUrl, loginSucessCb,
		loginFailCb) {
	this.name = locaStoreName;
	this.loginUrl = loginUrl;
	this.loginSucess = loginSucessCb;
	this.loginFail = loginFailCb;
	
	
	this.lastLoginTime = 0; // 最后一次登录时间
	/**
	 * 自动登录
	 * 
	 * @param callBack
	 *            传递进来的回调
	 * @returns 是否执行
	 */
	this.autoLogin = function(callBack) {
		var code = this.getCode();
		if (!code) {
			return false;
		}
		var data = {
			code : code,
			method : "auto_login"
		};
		var u = this.loginUrl;

		if (!u) {
			console.log('没有定义自动登录的url');
			return false;
		}
		var c = this;
		$JP1(u, data, function(rst) {
			
			c.lastLoginTime = new Date().getTime();
			
			console.log(rst);
			if (!rst.RST) {
				c.removeCode(); // 删除凭证
				if (c.loginFail) {
					c.loginFail(rst);
				}
				
				if(callBack){ // 传递进来的回调
					callBack(rst);
				}
				return;
			}

			g_is_user_logined = true;
			if (rst.CODE) {
				// 保存凭证
				c.saveCode(rst.CODE);
			}
			if (c.loginSucess) {
				c.loginSucess(rst);
			}
			if(callBack){ // 传递进来的回调
				callBack(rst);
			}
		});
		
		return true;
	};
	/**
	 * 距离上一次执行的分钟
	 */
	this.getPastMinutes = function(){
		var diff = new Date().getTime() - this.lastLoginTime;
		return diff / 1000 /60; // 换算成分钟
	};
	/**
	 * 获取凭证
	 */
	this.getCode = function() {
		try {
			var code = window.localStorage[this.name];
			return code;
		} catch (e) {
			console.log(e);
		}
	};
	/**
	 * 保存凭证
	 */
	this.saveCode = function(code) {
		window.localStorage[this.name] = code;
	};
	/**
	 * 删除凭证
	 */
	this.removeCode = function() {
		window.localStorage.removeItem(this.name);
	};
}
;
/**
	显示 ListFrame 为 App2形式
	@param ewa listframe的ewa
**/
EWA_App.showFrameAsMobile = (ewa) => {
	let id = "SECTION_" + (ewa.Id || ewa._Id);
	if (window.__SECTIONS && __SECTIONS[id]) {
		return;
	}

	if (window.location.href.indexOf('#' + id) > 0) {
		window.location.href = window.location.href.split('#')[0];
		return;
	}

	let u = new EWA_UrlClass(ewa.Url);
	u.AddParameter("EWA_AJAX", "INSTALL");
	u.AddParameter("EWA_APP", "1");
	let url = u.GetUrl();
	let cfg = ewa.appCfg || {
		ID: id,
		IScroll: "Y",
		IScrollMore: "Y",
		PageFooter: "N",
		PageHeader: "Y",
		Refresh: "N",
		USE_EWA_LF: "Y",
		RE_SHOW_LF_FILTER: "Y",
		SHOW_LF_MENUS: "Y",
		SHOW_ORDERS: "Y",
		SHOW_LF_ADD: "Y",
		EWA: false,
		U: url,
		loaded: true,
		swap: "direct",
		Title: ewa.Title
	};

	if (ewa instanceof EWA_FrameClass && !ewa.appCfg) {
		cfg.PageFooter = "Y";
		cfg.ButtonOnFooter = 'Y';
		cfg.USE_EWA_LF = "N";
		cfg.RE_SHOW_LF_FILTER = "N";
		cfg.SHOW_LF_MENUS = "N";
		cfg.SHOW_ORDERS = "N";
		cfg.SHOW_LF_ADD = "N";
		cfg.IScrollMore = "N";
	}

	let ewacfg = {
		ButtonOnFooter: "Y",
		Css: "ewa",
		EWA: true,
		ID: "ewa",
		IScroll: true,
		IScrollMore: false,
		PageFooter: "Y",
		PageHeader: "Y",
		Refresh: "Y",
		RE_SHOW_LF_FILTER: "Y",
		U: EWA.CP + "/EWA_STYLE/cgi-bin/index.jsp",
		USE_EWA_LF: "Y"
	};
	let cfgs = [];
	cfgs.push(cfg);
	//cfgs.push(main1);
	cfgs.push(ewacfg);
	EWA_App.initCfgs(cfgs);

	EWA_App.start(id);

	ewa.SECTION_CFG = __SECTIONS[id];

	if(ewa instanceof EWA_FrameClass ){
		EWA_App.Section.buttonOnFooter();
		EWA_App.Section.frameUIAndEvents(ewa);
	} else {
		EWA_App.Section.reShowFilter();
		EWA_App.Section.listFrameUIAndEvents(ewa);
	}
}

/*
function EWA_AppSection(options) {
	this.options = options;
	this.getUrl = function () {
		var u = EWA_ROOT + "?xmlname=" + this.options.X + "&itemname=" + this.options.Y;
	}
}
*/

function createDDL(from) {
	window.__createDDL = from;
	var o = $X('___ewa_ddl');
	if (!o) {
		window._EWA_UI_DIALOG_COVERINDEX = 1231;
		var div = document.createElement('div');
		div.id = '___ewa_ddl';
		div.className = 'ewa-ddl-box ewa-frame';
		div.innerHTML = "<div class='ewa-ddl-box-content'></div><i onclick='closeDDL1()' class='fa fa-close'></i>";
		document.body.appendChild(div);

	}
	o = $('#___ewa_ddl');
	var html = $(from).parent().html();
	o.find('.ewa-ddl-box-content').html(html);

	var o1 = o.find('input:eq(0)');
	var o2 = o.find('input:eq(1)');
	o1.attr('oninput', o1.attr('oninput1')).attr('onkeyup', o1.attr('onkeyup1'));
	o1.attr('onmousedown', null);
	o1.attr('readonly', null);
	o1.attr('id', '_create_ddl_from_' + o2.attr('id'));

	// have有内容表示输入东西了
	o1.attr('onkeypress', 'ddlKeyPress(this)');

	o.find('input:eq(1)').attr('afterEvent', 'closeDDL');

	$('body').append(o);
	o.show();
	setTimeout(function() {
		o1[0].focus();
	}, 500);
}
function ddlKeyPress(o) {
	EWA.F.I.DropList(o);
	setTimeout(function() {
		o.setAttribute("have", o.value)
	}, 11);
}
// 关闭并赋值
function closeDDL(a, b, c, d) {
	if (a == "") {
		// 输入并且离开焦点 a==""表示是离开输入框焦点触发
		return;
	}

	$('.ewa-ddl-list').hide();
	var from = $(window.__createDDL);
	// console.log(from);

	from.val($('#___ewa_ddl input:eq(0)').val());
	from.next().val($('#___ewa_ddl input:eq(1)').val());
	// 调用原来的 afterEvent
	if (from.next().attr('afterEvent')) {
		var js = eval(from.next().attr('afterEvent'));
		// console.log(js)
		js(a, b, c, d);
	}
	$('#___ewa_ddl').hide();
	window.__createDDL = null;
}
// 关闭并清除内容
function closeDDL1() {
	var from = $(window.__createDDL);
	from.val("");
	from.next().val("");
	$('#___ewa_ddl').hide();
	window.__createDDL = null;
}
// 文本框根据输入内容自适应高度
// ref http://www.xuanfengge.com/demo/201308/textarea/demo2.html
var autoTextarea = function(elem, extra, maxHeight) {
	extra = extra || 0;
	var isFirefox = !!document.getBoxObjectFor || 'mozInnerScreenX' in window;
	var isOpera = !!window.opera && !!window.opera.toString().indexOf('Opera');
	var addEvent = function(type, callback) {
		elem.addEventListener ? elem.addEventListener(type, callback, false) : elem.attachEvent('on' + type, callback);
	};
	var getStyle1 = function(name) {
		if (elem.currentStyle) {
			return elem.currentStyle[name];
		} else {
			return getComputedStyle(elem, null)[name];
		}
	};
	var getStyle = function(name) {
		var val = getStyle1(name);

		if (name === 'height' && val.search(/px/i) !== 1) {
			var rect = elem.getBoundingClientRect();
			val = rect.bottom - rect.top - parseFloat(getStyle1('paddingTop')) - parseFloat(getStyle1('paddingBottom')) + 'px';
		}
		console.log(val);
		return val;
	};
	var minHeight = parseFloat(getStyle('height'));

	elem.style.resize = 'none';

	var change = function() {
		var scrollTop, height, padding = 0, style = elem.style;

		if (elem._length === elem.value.length)
			return;
		elem._length = elem.value.length;

		// padding = parseInt(getStyle('paddingTop')) + parseInt(getStyle('paddingBottom'));

		scrollTop = document.body.scrollTop || document.documentElement.scrollTop;

		elem.style.height = minHeight + 'px';
		if (elem.scrollHeight > minHeight) {
			if (maxHeight && elem.scrollHeight > maxHeight) {
				height = maxHeight - padding;
				style.overflowY = 'auto';
			} else {
				height = elem.scrollHeight - padding;
				style.overflowY = 'hidden';
			}
			style.height = height + extra + 'px';
			scrollTop += parseInt(style.height) - elem.currHeight;
			document.body.scrollTop = scrollTop;
			document.documentElement.scrollTop = scrollTop;
			elem.currHeight = parseInt(style.height);
		}
	};

	addEvent('propertychange', change);
	addEvent('input', change);
	addEvent('focus', change);
	change();
};