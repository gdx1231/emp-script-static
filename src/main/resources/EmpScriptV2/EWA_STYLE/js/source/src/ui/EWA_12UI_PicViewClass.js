/**
 * 用于App显示图片，支持缩放
 */
function EWA_UI_PicViewClass() {
	this.id = ('EWAUIPicView' + Math.random()).replace('.', 'Gdx');
	this.t_start = -1;
	this.dist_base = 0;
	this.is_move = false;
	this.table=null;
	this.prevIdx = -1;
	this.setImg = function(img) {
		$(img).attr('mw', img.width).attr('mh', img.height).css("margin-left", 0).css('margin-top', '0');
		// css('width', img.width).css('height', img.height)
		$(img).parent().css("background-image", "none");
	};
	this.addPic = function(pic_path) {
		var idx = this.table.rows[0].cells.length;
		var td = this.table.rows[0].insertCell(idx);
		td.align = 'center';
		var id = this.id + "_" + idx;
		var s = "<img style='max-width:100%;max-height:100%' onload='" + this.id + ".setImg(this)' id='" + id + "' ";
		s += " src1='" + pic_path + "'>";
		var css = {
			'background-image' : "url('/static/images/loading2.gif')",
			"background-position" : "center center",
			"background-repeat" : "no-repeat"
		}
		$(td).hide().css(css);
		td.innerHTML = s;
		$(this.table1).find('td').append('<b>&bull;</b>');
		if (idx == 0) {
			this.changePhoto(0);
		} else {
			$(this.table1).show();
		}
		this.total = idx + 1;
	};
	this.changePhoto = function(idx) {
		if (this.prevIdx == idx) {
			return;
		}
		if (this.prevIdx >= 0) {
			var img = $('#' + this.id + '_' + this.prevIdx);
			$(img).parent().hide();
			$(this.table1).find('b:eq(' + this.prevIdx + ')').css('color', '#ccc');
		}
		this.prevIdx = idx;
		var img = $('#' + this.id + '_' + idx);
		if (img.attr('src1')) {
			img.attr('src', img.attr('src1'));
			img.attr('scr1', "");
			img[0].setAttribute('src1', '');
		} else {
			try {
				if (img.attr('mw')) {
					var mw = img.attr('mw') * 1;
					var mh = img.attr('mh') * 1;
					img.css('width', mw).css('height'.mh);
				}
			} catch (e) {
				console.log(e);
			}
			img.css('margin-left', 0).css('margin-top', 0).attr('r', null).attr('rold', null).css('transform', 'scale(1)');
		}
		img.parent().show();
		$(this.table1).find('b:eq(' + idx + ')').css('color', 'yellow');
	};
	this.close = function() {
		$(this.table).parent().remove();
		delete window[this.id];
	};
	this.create = function() {
		window[this.id] = this;

		var main = document.createElement('div');

		var page = document.createElement('table');
		page.insertRow(-1);

		var page1 = document.createElement('table');
		page1.insertRow(-1).insertCell(-1).align = 'center'; // td

		var close = document.createElement('div');
		close.innerHTML = "<b class='fa fa-close'></b>";
		var css = {
			'position' : 'fixed',
			'top' : 0,
			left : 0,
			width : '100%',
			height : '100%',
			'z-index' : 99999999,
			background : 'rgba(0, 0, 0, 0.9)'
		};
		$(main).css(css);
		var p_css = {
			position : 'absolute',
			left : 0,
			top : 0,
			height : '100%',
			width : '100%',
			'table-layout' : 'fixed'
		};
		$(page).css(p_css);

		var p_css1 = {
			position : 'absolute',
			left : 0,
			height : 30,
			width : '100%',
			overflow : 'hidden',
			bottom : '5px',
			'z-index' : 3,
			color : '#ccc',
			'font-size' : '30px',
			display : "none"
		};
		$(page1).css(p_css1);

		var close_css = {
			position : 'absolute',
			right : 20,
			top : 30,
			height : 40,
			width : 40,
			'line-height' : '40px',
			overflow : 'hidden',
			'z-index' : 4,
			color : 'darkred',
			'font-size' : '30px',
			'text-align' : 'center',
			display : 'block'
		}
		$(close).css(close_css).attr('onclick', this.id + ".close()");
		this.table = page;
		this.table1 = page1;

		$(main).append(page);
		$(main).append(page1);
		$(main).append(close);
		$('body').append(main);

		var c = this;
		page.ontouchstart = function(event) {
			if (event.targetTouches.length == 1) {
				// console.log(event);
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

				var dist = Math.sqrt((dx - dx1) * (dx - dx1) + (dy - dy1) * (dy - dy1));
				// console.log(dx, dy, dx1, dy1, dist, dt);
				if (c.dist_base == 0) {
					c.dist_base = dist;
				} else {
					// console.log(c.dist_base, dist, dist / c.dist_base);
					var r = dist / c.dist_base;

					var r_old = $(event.target).attr('rold');
					if (!r_old) {
						r_old = 1;
					} else {
						r_old = r_old * 1;
					}
					r = r * r_old;
					if (r <= 1) {
						r = 1;
					}
					if (r > 5) {
						r = 5;
					}
					$(event.target).css("transform", 'scale(' + r + ')').attr('r', r);
					if (r == 1) {
						$(event.target).css('margin-left', 0).css('margin-top', 0);
					}
				}

			} else if (event.targetTouches.length == 1) {
				var r = $(event.target).attr('r');

				if (r == null || r == 1) {
					return;
				}
				var dx = event.pageX - c.t_start.pageX;
				var dy = event.pageY - c.t_start.pageY;

				var px = $(event.target).css('margin-left').replace('px', '') * 1;
				var py = $(event.target).css('margin-top').replace('px', '') * 1;

				var left = px + dx;
				var top = py + dy;
				$(event.target).css('margin-left', left).css('margin-top', top);

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
					var idx = c.prevIdx;
					idx++;
					if (idx == c.total) {
						idx = 0;
					}
					c.changePhoto(idx);

				} else if (dx > 50 && dt < 244) {
					var idx = c.prevIdx;
					idx--;
					if (idx < 0) {
						idx = c.total - 1;
					}
					c.changePhoto(idx);

				} else if (Math.abs(dx) < 10 && dt < 150 && !c.is_move) {
					c.click_page();
				}
			}
			console.log(c.t_start1)
			if (c.t_start1) {

				var r = $(event.target).attr('r');
				console.log(r)
				$(event.target).attr('rold', r);
			}
			c.t_start = null;
			c.t_start1 = null;
		};
	};
}