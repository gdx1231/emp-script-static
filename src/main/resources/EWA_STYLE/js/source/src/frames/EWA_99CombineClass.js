function EWA_CombineClass() {
	this.EWA_COMBINES_HTML = []; // html install
	this.EWA_COMBINES = []; // js install
	this.curCombineIndex = 0;
	this.ewa_lf_func_index = 0;
	this.MEAGER_ITEMS = [];
	this._init = function() {
		for (var i = 0; i < this.EWA_COMBINES_HTML.length; i++) {
			var id = this.EWA_COMBINES_HTML[i];
			this.installCfgMoveButton1(id);
		}
		if (this.EWA_COMBINES.length == 0) {
			for (var i = 0; i < this.MEAGER_ITEMS.length; i++) {
				this.meargeItems(this.MEAGER_ITEMS[i]);
			}
			if (window.lastDo) {
				lastDo();
			}
		} else {
			this.installCfg();// js
		}
	};
	this.installCfgMoveButton1 = function(id) {
		var oo = $('#' + id).find(".ewa_lf_func");
		if (oo.length == 0) {
			return;
		}
		var o = oo[0];

		$X(id).getElementsByTagName('table')[0].style.height = '';

		o.style.display = 'none';

		var obj1 = o.childNodes[1];
		if (obj1.getElementsByTagName('div').length > 0) {
			obj1.getElementsByTagName('div')[0].style.display = 'none';
			while (obj1.childNodes.length > 0) {
				$X('DES_' + id).appendChild(obj1.childNodes[0]);
			}
		}
	};

	this.installCfg = function() {
		if (this.curCombineIndex < this.EWA_COMBINES.length) {
			if (this.curCombineIndex > 0) {
				if (!$X('EWA_FRAME_MAIN')) {
					setTimeout(installCfg, 51);
					return;
				}
				$X('EWA_FRAME_MAIN').id = 'a';
			}
			var json = this.EWA_COMBINES[this.curCombineIndex];
			var c = this;
			EWA.F.Install(json.id, json.x, json.i, json.p, function(u, p, id,
					html) {
				c.installOk(u, p, id, html);
			});
			this.curCombineIndex++;
		} else {
			for (var i = 0; i < this.MEAGER_ITEMS.length; i++) {
				this.meargeItems(this.MEAGER_ITEMS[i]);
			}
			if (window.lastDo) {
				lastDo();
			}
		}
	};
	this.installOk = function(u, p, id, html) {
		this.installCfgMoveButton1(id);
		this.installCfg();
	};

	this.showFull = function(id) {
		var a = $('#' + id).parent('div');
		var b = a.find('.left');
		var c = $('#' + id).find('.show');
		var full = a.attr('full');
		if (full != null && full == '1') {
			a.attr('full', '0');
			$(document.body).css('overflow', 'auto');

			var ori;
			eval('ori=' + a.attr('ori'));

			a.animate(ori, 'fast', 'swing', function() {
				a[0].style.cssText = '';
				var st = a.attr('st') * 1;
				document.body.scrollTop = st;

				if ($('#crm_left_box').attr('show') == 1) {
					$('#crm_left_box').show();
				}
				a.css("display", a.attr('dsp'));
				if (c.length > 0 && id != 'DES_plugin') {
					c[0].click();
				} else {
					var lst = $X(id.replace('DES_', ''));
					lst.style.width = lst.parentNode.clientWidth - 10 + 'px';
					lst.style.height = ori.height - 30 + 'px';
					b.find('div[id="EWA_FRAME_MAIN"]').css('height',
							ori.height - 150);
				}
			});

		} else {
			a.attr('full', '1');
			a.attr('st', document.body.scrollTop);
			a.attr("dsp", a.css('display'));
			var hb = document.body.clientHeight;
			var he = document.documentElement.clientHeight;
			var w = document.documentElement.clientWidth - 10;
			var h = he - 20;
			var w1 = document.documentElement.clientWidth - 30;
			var h1 = he - 20 - 20 - 15;

			var p = a.offset();
			var loc = a.position();
			var mginLeft = p.left - loc.left;
			var aw = a.width();
			var ah = a.height();

			var ori = {
				width : aw,
				height : ah,
				'margin-left' : mginLeft,
				left : loc.left,
				top : loc.top
			};
			a.attr('ori', JSON.stringify(ori));
			a.css({
				'margin-left' : '0px',
				top : p.top,
				left : p.left,
				position : 'absolute',
				display : '',
				overflow : 'auto'
			});

			a.animate({
				width : w,
				height : h,
				left : 10,
				top : 0
			}, 'fast', 'swing', function() {
				b.css('width', w1);
				b.css('height', h1);
				a.find('iframe').css('height', h1);
				a.find('div[id="EWA_FRAME_MAIN"]').css('height', h1 - 30);
				if (c.length > 0 && id != 'DES_plugin')
					c[0].click();
			});

			document.body.scrollTop = 0;
			if ($('#crm_left_box').css('display') != 'none') {
				$('#crm_left_box').hide();
				$('#crm_left_box').attr('show', 1);
			}
			$(document.body).css('overflow', 'hidden');
		}

	};

	this.meargeItems = function(ids) {
		var ids1 = ids.split(',');
		var o0;
		var lst0;
		var aa;
		for (var i = 0; i < ids1.length; i++) {
			var id = ids1[i].trim();
			if (!$X(id)) {
				if (i == 0) {
					return;
				}
				continue;
			}
			var lst = $X(id.replace('DES_', ''));
			var o = $('#' + id);
			var ss = [];
			var chd0;
			if (i == 0) {
				o0 = $X(id);
				aa = document.createElement('div');
				aa.id = 'KK_' + id;
				aa.style.cssText = 'clear:both;height:25px;border-top:1px solid #cdcdcd';
				aa.setAttribute("but", "1");
				lst0 = lst;
				for (var ia = 1; ia < $X(id).childNodes.length; ia++) {
					var chd = $X(id).childNodes[ia];
					if (ia > 1) {
						chd.id = 'M' + Math.random();
						ss.push(chd.id);
					} else {
						chd0 = chd;
						chd0.className = 'ewa_lf_func_caption show';
						if (chd0.id == null || chd0.id == '') {
							chd0.id = 'MAx' + Math.random();
						}
						chd0.parentNode.setAttribute('lid', chd0.id);
					}
				}
				while ($X(id).childNodes.length > 2) {
					var chd = $X(id).childNodes[2];
					aa.appendChild(chd);
				}
			} else {
				lst.parentNode.style.display = 'none';
				lst0.parentNode.appendChild(lst);
				lst.style.display = 'none';

				var idx = 0;
				while ($X(id).childNodes.length > 1) {
					var chd = $X(id).childNodes[1];

					if (idx > 0) {
						chd.style.display = 'none';
						chd.id = 'M' + Math.random();
						ss.push(chd.id);
						aa.appendChild(chd);
					} else {
						chd0 = chd;
						o0.appendChild(chd);
					}
					idx++;
				}
			}
			chd0.setAttribute('ids', ss.join(','));
			chd0.setAttribute('lst', id);
			chd0.setAttribute('menu_id', aa.id);
			var c = this;
			addEvent(chd0, 'click', function() {
				c.meargeItems_ck(this);
			});
		}
		if (aa.childNodes.length > 0) {
			o0.appendChild(aa);
			o0.style.height = '50px';
		}
	};
	this.meargeItems_ck = function(obj) {
		var menuId = obj.getAttribute('menu_id');
		var lid = obj.parentNode.getAttribute('lid');
		if (lid != null && lid.length > 0) {
			$X(lid).className = 'ewa_lf_func_caption hide';
		}
		obj.className = 'ewa_lf_func_caption show';
		if (obj.id == null || obj.id == '') {
			obj.id = 'MAx' + Math.random();
		}
		obj.parentNode.setAttribute('lid', obj.id);
		$('#' + menuId).children('div').each(function() {
			$(this).hide();
		});
		$(obj).parent('div').parent('div').children('.ewa_cb_left').each(
				function() {
					$(this).hide();
				});
		var ids = obj.getAttribute('ids');
		if (ids != '') {
			var ids1 = ids.split(',');
			for (var i = 0; i < ids1.length; i++) {
				if ($X(ids1[i]).className == 'ewa_lf_func_caption') {
					continue;
				}
				$X(ids1[i]).style.display = '';
			}
		}
		var id = obj.getAttribute('lst');
		var lst = $X(id.replace('DES_', ''));
		lst.style.display = '';
		lst.style.width = lst.parentNode.clientWidth - 20 + 'px';
	};
	this.actIframe = function(id) {
		var o = $('#' + id).find('iframe');
		if (o.length == 0) {
			alert(id + ' not iframe');
			return;
		}

		var win = o[0].contentWindow;

		var h = win.document.body.scrollHeight;
		var w = win.document.body.scrollWidth;
		if (win.$) {
			var a = 0;
			if (win.document.body.innerHTML.indexOf('EWA.F.F.C') > 0) {
				a = win.$('#Test1').height();
				w = win.$('#Test1').width();
			} else {
				win.$('.ewa_table').parent().parent().children().each(
						function() {
							a += $(this).height();
						});
				w = win.$('.ewa_table').width();
			}
			h = a;

		}
		if (w > $('#' + id).width()) {
			h = h + 40;
		}
		if (h < 300) {
			h = 330;
		}
		$('#' + id).css('height', h);
		var c = this;
		if (o.attr('_src') != '0') {
			o.attr('src', o.attr('_src'));
			o.attr('_src', '0');
			setTimeout(function() {
				c.chkFrameLazyLoaded(id);
			}, 199);
			return;
		} else {
			c.setFrameCss(id, win);
			c.afterFrameLazyLoaded(id);
		}
	};
	this.setFrameCss = function(id, win) {
		if ($('#' + id).attr('lnk') != 1) {
			var lnk = win.document.createElement('link');
			lnk.type = 'text/css';
			lnk.rel = "stylesheet";
			lnk.rev = "stylesheet";
			lnk.href = "../../css/main.css";
			win.document.getElementsByTagName('head')[0].appendChild(lnk);
			win.document.body.style.backgroundColor = '#fff';
			$('#' + id).attr('lnk', 1);
		}
	};
	this.afterFrameLazyLoaded = function(id) {

	};
	this.chkFrameLazyLoaded = function(id) {
		var o = $('#' + id).find('iframe');
		var win = o[0].contentWindow;
		if (win && win.document && win.document.body && win.$) {
			if (win.document.readyState == 'complete') {
				var ss = [];
				var but = $('#' + id).parent().find('div[but=1]');
				if (but.length > 0) {
					win.$('.ewa_lf_func_dact').each(function(i) {
						var b = document.createElement("div");
						b.className = "ewa_lf_func_dact";
						b.style.cursor = 'pointer';
						b.innerHTML = this.innerHTML;
						if (this.id == '') {
							this.id = id + '|' + Math.random();
						}
						b.id = this.id;
						but[0].appendChild(b);
						b.onclick = function() {
							var fid = this.id.split('|')[0];
							var o = $('#' + id).find('iframe');
							var win = o[0].contentWindow;
							win.$X(this.id).click();
						};
						ss.push(b.id);
						if (i == 0) {
							this.parentNode.parentNode.style.display = 'none';
						}
					});
					but.parent().find('.show').attr("ids", ss.join(","));
				}
				this.actIframe(id);
				return;
			}
		}
		var c = this;
		setTimeout(function() {
			c.chkFrameLazyLoaded(id);
		}, 101);

	};
	this.showInPlugin = function(u, caption) {
		if (u.indexOf('.jsp') > 0) {
			var html = "<iframe width=100% height=100% frameborder=0 src=\""
					+ u + "\"></iframe>";
			$("#plugin").html(html);
		} else {

			// htmlobj = $.ajax( {
			// url : u + '&EWA_AJAX=install&EWA_FRAMESET_NO=1',
			// async : false
			// });
			// $("#plugin").html(htmlobj.responseText);
			var ajax = new EWA.C.Ajax();
			var u1 = u + '&EWA_AJAX=install&EWA_FRAMESET_NO=1';
			var c = this;
			ajax.Install(u1, "_r=1", 'plugin', function() {
				c.showFull("DES_plugin");
				document.body.scrollTop = 0;
				$X('subject_plugin').innerHTML = caption;
			});
			return;
		}
		this.showFull("DES_plugin");
		document.body.scrollTop = 0;
		$X('subject_plugin').innerHTML = caption;
	};
}
installCfgMoveButton1 = function(id) {
	var oo = $('#' + id).find(".ewa_lf_func");
	if (oo.length == 0) {
		return;
	}
	var o = oo[0];

	$X(id).getElementsByTagName('table')[0].style.height = '';

	o.style.display = 'none';

	var obj1 = o.childNodes[1];
	if (obj1.getElementsByTagName('div').length > 0) {
		obj1.getElementsByTagName('div')[0].style.display = 'none';
		while (obj1.childNodes.length > 0) {
			$X('DES_' + id).appendChild(obj1.childNodes[0]);
		}
	}
};