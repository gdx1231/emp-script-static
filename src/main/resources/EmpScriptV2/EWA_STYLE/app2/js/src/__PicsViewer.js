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
};