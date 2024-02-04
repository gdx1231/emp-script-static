//图片滑动验证 2024-02-04
(function() {
	var template = [];
	template.push("<div class=\"ewa-slider-puzzle-box\">");
	template.push("<div class=\"ewa-slider-puzzle-imgbox\">");
	template.push("<div class=\"ewa-slider-puzzle-verify\"></div>");
	template.push("<div class=\"ewa-slider-puzzle-refresh\"></div>");
	template.push("</div>");
	template.push("<div class=\"ewa-slider-puzzle-handle\">");
	template.push("<span class=\"ewa-slider-puzzle-swiper\"></span>");
	template.push("<span class=\"ewa-slider-puzzle-text\"></span>");
	template.push("</div>");
	template.push("</div>");

	var funcSuccess;
	var funcFail;
	var config;
	var mobile = /iphone|android|ipad/ig.test( navigator.userAgent) || window.EWA_App;
	function fnDown() {
		let box = $('.ewa-slider-puzzle-box');
		let swiper = $('.ewa-slider-puzzle-swiper');
		let verify = $('.ewa-slider-puzzle-verify');
		let text = $('.ewa-slider-puzzle-text');
		
		let move = mobile?'touchmove':'mousemove';
		let up = mobile?'touchend':'mouseup';
		let down = mobile?'touchstart':'mousedown';
		// console.log(move,up,down)
		swiper.bind(down, function(e0) {
			e0.stopPropagation()

			// 30为模块宽度
			verify.css({
				display: 'block',
			});
			let e = mobile?e0.touches[0]:e0;
			
			// 获取鼠标到按钮的距离
			var disX = e.clientX - $(this).offset().left,
				disY = e.clientY - $(this).offset().top
			text.css('opacity', '0')

			// 防止重复绑定触发多次
			box.unbind(move)
			box.unbind(up)
			
			// 移动
			console.log(box[0]);
			box.bind(move, function(e) {
				let e1 = mobile?e.touches[0]:e;
				fnMove(e1, disX, disY)
			})
			 
			// 释放
			box.bind(up, function(e) {
				box.unbind(move)
				box.unbind(up)

				let u = new EWA_UrlClass();
				console.log(verify.position());
				console.log(verify.offset());

				u.AddParameter("left", verify.position().left);
				u.AddParameter("top", verify.position().top);
				u.AddParameter("left1", verify.offset().left);
				u.AddParameter("top1", verify.offset().top);

				u.AddParameter("ewa_trigger_valid_mode", "check");
				u.AddParameter("ewa_trigger_valid_name", config.ewa_trigger_valid_name);
				u.AddParameter("ewa_ajax", config.ewa_trigger_valid);
				$J(u.GetUrl(), function(rst) {
					console.log(rst);
					if (rst.RST) {
						box.addClass('ewa-slider-puzzle-successful');
						if (funcSuccess) {
							funcSuccess(rst);
						}
					} else {
						box.addClass('ewa-slider-puzzle-fail');
						setTimeout(() => {
							box.removeClass('ewa-slider-puzzle-fail');
							// 解除绑定，并将滑动模块归位

							swiper.css('left', '0px')
							verify.css('left', '10px')
							text.css('opacity', '1')

							if (funcFail) {
								funcFail(rst);
							}
						}, 500);
					}

				});

			})
		})
	}

	function fnMove(e, posX, posY) {
		let handle = $('.ewa-slider-puzzle-handle')
		let swiper = $('.ewa-slider-puzzle-swiper');
		let verify = $('.ewa-slider-puzzle-verify');
		
		// 这里的e是以鼠标为参考
		var l = e.clientX - posX - $(handle).offset().left;
		var	winW = $(handle).width() + 29;
		// console.log(l,winW)
		// 限制拖动范围只能在handle中
		if (l < 0) {
			l = 0
		} else if (l > winW) {
			l = winW
		}
		swiper.css('left', l);
		verify.css('left', l + 10);
	}

	function refreshImg(json) {
		var imgBox = $('.ewa-slider-puzzle-imgbox');
		var verImg = $('.ewa-slider-puzzle-imgbox img');
		imgBox.css('width', json.imgBigWidth).css('height', json.imgBigHeight);
		if (verImg.length) {
			verImg.attr('src', json.imgBig)
		} else {
			imgBox.prepend("<img src='" + json.imgBig + "' />");
		}
		let verify = $('.ewa-slider-puzzle-verify');
		verify.css('background-image', "url('" + json.imgSmall + "')")
			.css('top', json.imgTop)
			.css('width', json.imgSmallWidth)
			.css('height', json.imgSmallHeight);
	}


	/**
	 * 初始化
	 * @param json 配置信息，imgBig，imgBigWidth，imgBigHeight<br>
	 * 	imgSmall, imgSmallWidth, imgSmallHeight<br>
	 *  imgTop
	 * @param parent 安装的父体
	 * @param cbSuccess 验证成功的回调方法
	 * @param cbFail 验证失败的回调方法
	 */
	function init(json, parent, cbSuccess, cbFail) {
		config = json;
		funcSuccess = cbSuccess;
		funcFail = cbFail;
		$(parent || 'body').append(template.join(""));

		let refresh = $('.ewa-slider-puzzle-refresh');
		let box = $('.ewa-slider-puzzle-box');
		box.css('width', json.imgBigWidth);
		refreshImg(json)
		refresh.click(function(e) {
			e.stopPropagation();
			var u = new EWA_UrlClass();
			u.AddParameter("ewa_trigger_valid_mode", "refresh");
			u.AddParameter("ewa_trigger_valid_name", config.ewa_trigger_valid_name);
			u.AddParameter("ewa_ajax", config.ewa_trigger_valid);
			u.AddParameter("ewa_trigger_valid_width", document.documentElement.clientWidth);
			$J(u, function(rst) {
				if (!rst.RST) {
					alert(rst.ERR);
					return;
				}
				rst.ewa_trigger_valid_name = config.ewa_trigger_valid_name;
				rst.ewa_trigger_valid = config.ewa_trigger_valid;
				config = rst;
				refreshImg(config)
			});
		});
		fnDown();
	}
	EWA.UI.SlidePuzzle = init;
})();