function EWA_ComplexClass() {
	this.Resources = {}; // EWA_FrameResoure

	this.edit = function (ref_id, obj) {
		var ref_obj = $X(ref_id);

		var p = $(ref_obj).offset();
		var is_open = ref_obj.getAttribute('is_open');
		if (is_open != 1) {
			this.changeEdit(ref_id, false);
			obj.innerHTML = '<i class="fa fa-save"></i>';
			ref_obj.setAttribute('is_open', 1);
			obj.setAttribute("_title", EWA.LANG == 'enus' ? "Save" : "保存");
		} else {
			var funid = $("#" + ref_id).find("form")[0].id.replace("f_", "");
			var rst = EWA.F.FOS[funid].DoPostBefore();
			if (!rst) {
				return;
			}
			if (!EWA.F.FOS[funid].CheckValidAll($("#f_" + funid)[0])) {
				return;
			}
			$(ref_obj).find('input[id=butOk]').click();
			this.changeEdit(ref_id, true);
			obj.innerHTML = '<i class="fa fa-edit"></i>';
			ref_obj.setAttribute('is_open', 0);
			obj.setAttribute("_title", EWA.LANG == 'enus' ? "Edit" : "编辑");
		}
		this.focusObject(ref_obj);
	};
	/**
	 * 栏目获得焦点
	 * 
	 * @param obj
	 *            对象
	 * @param func
	 *            获得后执行的脚本
	 */
	this.focusObject = function (obj, func) {
		var p = $(obj).offset();
		if (func) {
			$('body').animate({
				scrollTop : p.top - 40
			}, 300, func);
		} else {
			$('body').animate({
				scrollTop : p.top - 40
			}, 300);
		}
		$('.pop_title').hide();

		var p1 = $(obj).prev().find('.fa-expand');
		if (p1.length > 0) {
			p1.click();
		}
	};
	/**
	 * 跳转到对象，并执行方法
	 */
	this.goItem = function (id, func) {
		var obj = $X(id);
		if (obj == null) {
			alert('EWA_ComplexClass.goItem ' + id + ' not found');
			return;
		}
		var p = $(obj).offset();
		$('body').animate({
			scrollTop : p.top + 30
		}, 300);

		if (func) {
			func();
		} else {
			// 对象为异步加载，等待对象出现
			window['__timer_' + id] = setInterval(function () {
				if (func) {
					window.clearInterval(window['__timer_' + id]);
					func();
				}
			}, 111);
		}
		this.focusObject($(obj));
	}
	this.changeEdit = function (ref_id, isDisabled) {		
		var ref_obj = $X(ref_id);
		if(isDisabled && $(ref_obj).hasClass("disabled-true")){
			return;
		}
		$(ref_obj).find('.EWA_TD_B').hide();
		$(ref_obj).find('select').attr('disabled', isDisabled);
		$(ref_obj).find('input').attr('disabled', isDisabled);
		$(ref_obj).find('textarea')
			.each(
				function () {
					var a = $(this).parent();
					if (a.hasClass("ewa_redraw_info") && a.find(".textarea-tip").length == 0) {
						a.css("position", "relative").append(
							"<span class='textarea-tip'>" + $(this).attr("placeholder") + "</span>");
						a.hover(function () {
							a.find(".textarea-tip").show()
						}, function () {
							a.find(".textarea-tip").hide()
						});
					}
					if(a.find(".hide-textarea-content").length==0){
						var d = "<div class='hide-textarea-content' style='display:none;overflow:auto;height:" + $(this).height()
							+ "'>" + $(this).val() + "</div>";
						$(this).after(d);
					}
					a.find(".hide-textarea-content").hover(function () {
						$(this).parent().find(".textarea-tip").show()
					}, function () {
						$(this).parent().find(".textarea-tip").hide()
					});
				});
		$(ref_obj).find('.EWA_DHTML').each(
			function () {
				var a = $(this).parent();
				if (a.hasClass("ewa_redraw_info") && a.find(".textarea-tip").length == 0) {
					var uid = $('#cpx_tab1 .EWA_TABLE').prop("id").replace("EWA_FRAME_", "");
					var lowLang = EWA.LANG ? EWA.LANG.toLowerCase() : "zhcn";
					var tname = $(EWA.F.FOS[uid].ItemList.Items[this.id]).find("DescriptionSet Set[Lang='" + lowLang + "']")
						.attr("Info");
					a.css("position", "relative").append("<span class='textarea-tip'>" + tname + "</span>");
					a.hover(function () {
						a.find(".textarea-tip").show()
					}, function () {
						a.find(".textarea-tip").hide()
					});
				}
				if(a.find(".hide-textarea-content").length==0){
					var d = "<div class='hide-textarea-content' style='display:none;overflow:auto;height:" + $(this).height() + "'>"
						+ $(this).find("input").val() + "</div>";
					$(this).after(d);
				}
				a.find(".hide-textarea-content").hover(function () {
					$(this).parent().find(".textarea-tip").show()
				}, function () {
					$(this).parent().find(".textarea-tip").hide()
				});
			});
		if (isDisabled) {
			$(ref_obj).addClass("disabled-true");		
			$(ref_obj).find('input').css('background-color', '#eee');
			$(ref_obj).find('textarea').hide();
			$(ref_obj).find('.EWA_DHTML').hide();
			$(ref_obj).find(".hide-textarea-content").show();
		} else {
			$(ref_obj).removeClass("disabled-true");
			$(ref_obj).find('input').css('background-color', '');
			$(ref_obj).find('input[ewa_class="droplist"]').css('background-color', 'lightyellow');
			$(ref_obj).find('textarea').show();
			$(ref_obj).find('.EWA_DHTML').show();
			$(ref_obj).find(".hide-textarea-content").remove();
		}
	};
	this.textareaTip = function (obj) {
		var a = $(obj).parent();
		if (a.find(".textarea-tip").length > 0)
			return;
		a.css("position", "relative").append("<span class='textarea-tip' style=''>" + $(obj).attr("placeholder") + "</span>");
		a.hover(function () {
			a.find(".textarea-tip").show()
		}, function () {
			a.find(".textarea-tip").hide()
		});
	}
	// ---初始化调用-----
	this._init = function () {
		this.Xml = new EWA.C.Xml();
		var xmlString = window['EWA_ITEMS_XML_' + this._Id];
		this.Xml.LoadXml(xmlString);

		this.Resources = new EWA_FrameResoures();
		this.Resources.Init(this.Xml);

		var buts = window['_EWA_MENU_' + this._Id];
		$('.caption-info').attr("onselectstart", "return false");
		this.add_doc_buts(buts);
		this.init_lazy_frames_top();
		var c = this;
		addEvent(window, "scroll", function () {
			c.lazy_load();
		});
		this.mark_loc();

		this.lazy_load();
		document.body.style.overflow = 'hidden';

		if (EWA.B.MOZILLA) {
			addEvent(window, 'DOMMouseScroll', this.my_mousewheel);
		} else {
			addEvent(window, 'mousewheel', this.my_mousewheel);
		}
		var json = this.getlocalStorage();
		for ( var n in json) {
			if (n != 'id' && json[n] && $X(n)) {
				var o = $($X(n)).prev().find('.fa-compress');
				if (o.length > 0) {
					this.hide_frame(o[0]);
				}
			}
		}
		if (!window.open_in_box) {
			window.open_in_box = this.open_in_box;
		}

		if (parent != window) {
			document.body.style.backgroundColor = 'transparent';
		}
	};
	this.add_doc_buts = function (buts) {
		if (parent == window) {
			$('body').css("background-color", "#ccc");
		}
		if (!buts || buts.length == 0) {
			$('#dock').hide();
			return;
		}

		var buts_new = [];
		for (var i = 0; i < buts.length; i++) {
			buts_new[i] = buts[i];
		}
		buts_new.push({
			Id : this._Id + "_comress_all",
			Txt : EWA.LANG == 'enus' ? "Hide All" : "隐含全部",
			Cmd : "EWA.F.FOS['" + this._Id + "'].compress_all(this)",
			Img : "fa-compress"
		});

		for (var i = buts_new.length - 1; i >= 0; i--) {
			var d = buts_new[i];
			if (d == null) {
				continue;
			}
			var td = $X('controls').rows[0].insertCell(1);
			var txt = d.Txt;
			td.innerHTML = "<div id='" + d.Id + "' tag='" + d.Id + "' idx='" + i + "' onmouseover='EWA.F.FOS[\"" + this._Id
				+ "\"].show_title(this)' onmouseout=\"$('.pop_title').hide()\" class='but' _title=\"" + txt + "\" "
				+ (d.paras || "") + "><i class='fa " + d.Img + "'></i></div>";
			if (d.Cmd.indexOf('function(') >= 0) {
				td.childNodes[0].setAttribute("cmd", d.Cmd);
				td.childNodes[0].onclick = function () {
					var cmd = this.getAttribute('cmd');
					var obj = this;
					var js = "(" + cmd + ")";
					var inst = eval(js);
					inst(obj);
				}
			} else {
				td.childNodes[0].setAttribute("onclick", d.Cmd);
			}
			td.className = "tdbut";
		}
		var controls_width = $('#controls').width();
		$('#dock').css('width', controls_width).css('left', '50%').css('margin-left', -1 * controls_width / 2);
	};
	// 初始化frame的Top用于后加载
	this.init_lazy_frames_top = function () {
		this.lazy_frames = this.lazy_frames || {};
		var c = this;
		$('div[x]').each(function () {
			var t = $(this).offset().top;
			if (c.lazy_frames[this.id]) {
				c.lazy_frames[this.id].top = t;
			} else {
				c.lazy_frames[this.id] = {
					top : t
				};
			}
		});
	};
	this._getBodyHeight = function () {
		return (document.compatMode == 'CSS1Compat') ? document.documentElement.clientHeight : document.body.clientHeight;
	};
	this.lazy_load = function () {
		var h = (document.compatMode == 'CSS1Compat' ? document.documentElement.scrollTop : document.body.scrollTop)
			+ this._getBodyHeight();
		for ( var n in this.lazy_frames) {
			if (this.lazy_frames[n].top <= h - 10) {
				this.lazy_load_do(n);
			}
		}
		this.mark_loc();
	};
	this._getParas = function () {
		var u1 = new EWA_UrlClass(this.Url);
		u1.RemoveEwa();
		return u1.GetParas();
	};
	this.lazy_load_do = function (n) {
		if (this.lazy_frames[n].ok) {
			return;
		}

		this.lazy_frames[n].ok = true;
		var obj = $('#' + n);
		var x = obj.attr("x");

		var paras = this._getParas();
		if (paras) {
			paras = "&" + paras;
		}

		if (x != null && x.length > 0) {
			var i1 = obj.attr("i");
			var p = obj.attr("p");
			var js = obj.attr("js");
			if (js == null || js.trim() == "") {
				EWA.F.Install(n, x, i1, p + paras);
			} else {
				EWA.F.Install(n, x, i1, p + paras, function () {
					if(js.indexOf('(')>0){
						eval(js);
					} else {
						window[js](obj, this);
					}
				});
			}
		} else {
			var u = obj.attr("u") + paras + "&NO_NAV=1";
			// var ajax=new EWA_AjaxClass();
			// ajax.Install(u,"",n,function(){});
			var fid = ("iframe_lazy_" + Math.random()).replace(".", "A");
			var s = "<iframe id='" + fid + "' name='" + fid + "' width=100% height=100% frameborder=0 src='" + u + "'></iframe>";
			$X(n).innerHTML = s;
			var h0 = -1;
			var iscombine = u.indexOf('combine.jsp') > 0 ? true : false;
			var t1 = setInterval(function () {
				var w = window.frames[fid];
				if (w && w.document && w.document.readyState == 'complete' && w.$) {
					var h = iscombine ? $('[id=crm_main_box]:visible').height() : w.document.body.offsetHeight;
					if (Math.abs(h0 - h) < 100) {
					} else {
						h0 = h;
						$('#' + fid).css("height", h + 10);
						w.document.body.style.overflow = 'hidden';
					}
				}
			}, 777);
		}
	};
	this.mark_loc = function () {
		var bottoms = 0;
		var tops = 0;
		var objs = $('.fcaption');
		var topConv = $('#nav_left .top');
		var bottomConv = $('#nav_left .bottom');

		var conv = $('#nav_left');
		var bh = this._getBodyHeight();
		for (var i = 0; i < objs.length; i++) {
			var o = objs[i];
			var ref1 = this.mark_loc_ref(o, i);
			o = $(o);
			var top = o.offset().top
				- (document.compatMode == 'CSS1Compat' ? document.documentElement.scrollTop : document.body.scrollTop);

			if (top > bh - bottomConv.height()) {
				bottomConv.append(ref1);
			} else if (top < topConv.height()) {
				topConv.append(ref1);
			} else {
				var top1 = top;
				ref1.css({
					bottom : "",
					top : top
				});
				conv.append(ref1);
			}

		}
	};
	this.mark_loc_ref = function (o, index) {
		if (o.id == null || o.id == "") {
			o.id = Math.random();
		}
		var id = o.id;
		o = $(o);
		var ref = $X("zzz" + id);

		var thisClass = 'EWA.F.FOS["' + this._Id + '"].';
		if (!ref) {
			var color = "c" + index % 5;
			o.attr("class", o.attr("class") + " " + color);

			// 图钉
			var s2 = "<b onclick='" + thisClass + "max_frame(this)' class='fa fa-thumb-tack '>&nbsp;</b>";

			o.html(s2 + o.html());

			var bgc = o.css("background-color");

			o.parent().css("border-bottom-color", bgc);

			ref = document.createElement('div');
			ref.style.backgroundColor = bgc;
			ref.id = "zzz" + id;
			$('#nav_left').append(ref);
			ref.onclick = function () {
				var id = this.id.replace("zzz", "");
				var o = $($X(id));
				var top = o.offset().top;
				if (document.compatMode == "CSS1Compat") {
					// h5
					$(document.documentElement).animate({
						scrollTop : top
					}, 300);
				} else {
					// h4
					$('body').animate({
						scrollTop : top
					}, 300);
				}

			}
			ref.title = o.text();
			ref.innerHTML = index + 1;
			ref.onmouseover = function () {
				$('.pop_title_left div').html(this.title);
				var off = $(this).offset();
				$('.pop_title_left').show().css('top', off.top - 10).css('right', 45);
			};
			ref.onmouseout = function () {
				$('.pop_title_left').hide();
			};

			// 添加隐含button
			var s1 = '&nbsp;<i class="fa fa-compress" onclick=' + thisClass + 'hide_frame(this)></i>';
			o.append(s1);

			// 添加刷新button
			var s1 = '&nbsp;<i class="fa fa-refresh" onclick=' + thisClass + 'reload_frame(this)></i>';
			o.append(s1);

		}
		var ref1 = $(ref);
		return ref1;
	};
	// 阻止滚轮事件
	window.isStopMouseWheel = false;

	this.my_mousewheel = function (e) {
		if (isStopMouseWheel) {
			return;
		}
		var e1 = e || event;
		var v = e.wheelDelta || e.detail;

		var target = document.compatMode == "CSS1Compat" ? document.documentElement : document.body;

		if (EWA.B.MOZILLA) {
			target.scrollTop += v * 3;
		} else {
			target.scrollTop -= v;
		}
	};
	this.show_title = function (obj) {
		if (obj.getAttribute('_title') == "" || obj.getAttribute('_title') == null) {
			var ttt = obj.title;
			if (ttt == "" || ttt == null) {
				return;
			}
			obj.setAttribute("_title", ttt);
			obj.title = "";
		}
		$(".pop_title div").html(obj.getAttribute('_title'));

		var p = $(obj).offset();
		var w = $(obj).width();
		var h = $(".pop_title").height();
		var w1 = $(".pop_title").width();

		$(".pop_title").css('top', p.top - h - 8);
		$(".pop_title").show();
		$(".pop_title").css('left', p.left - (w1 - w) / 2);

	};
	// 隐含全部
	this.compress_all = function (obj) {
		var o = $(obj);
		var tag;
		if (o.attr('compress') == null || o.attr('compress') == "") {
			o.attr('compress', 1);
			o.find('i').attr('class', 'fa fa-expand');
			tag = 'fa-compress';
			o.attr("_title", EWA.LANG == 'enus' ? "Show All" : "显示全部");
		} else {
			o.attr('compress', "");
			o.find('i').attr('class', 'fa fa-compress');
			tag = 'fa-expand';
			o.attr("_title", EWA.LANG == 'enus' ? "Hide All" : "隐含全部" );
		}
		var c = this;
		$('.fcaption .' + tag).each(function () {
			c.hide_frame(this);
		});

	};
	/**
	 * 获取localStorage保存的数据
	 */
	this.getlocalStorage = function () {
		var id = "ROBERT_" + location.pathname;
		if (id.indexOf('/cgi-bin/') > 0) {
			var u1 = new EWA_UrlClass();
			u1.SetUrl(window.location.href);
			var x = u1.GetParameter("xmlname");
			var i = u1.GetParameter("itemname");
			if (x && i) {
				id = "EWA_" + x + "GdX" + i;
			}
		}
		var json = {};
		if (window.localStorage[id]) {
			try {
				json = eval('__json=' + window.localStorage[id] + "; __json;");
			} catch (e) {
				json = {};
			}
		}
		json.id = id;
		return json;
	};
	this.hide_frame = function (obj) {
		var refObj = $(obj.parentNode.parentNode);
		refObj = refObj.next();
		var o = $(obj);
		var is_compress = false;
		if (o.attr('compress') == null || o.attr('compress') == "") {
			o.attr('compress', 1);
			o.attr('class', 'fa fa-expand');
			refObj.hide();
			this.init_lazy_frames_top();
			this.lazy_load();
			is_compress = true;
		} else {
			o.attr('compress', "");
			o.attr('class', 'fa fa-compress');

			this.init_lazy_frames_top();
			refObj.show();
		}
		var json = this.getlocalStorage();

		json[refObj.attr("id")] = is_compress;
		window.localStorage[json.id] = JSON.stringify(json);
	};
	this.max_frame = function (obj) {
		var caption = $(obj.parentNode.parentNode);
		$('<p id="_MAX_FRAME___"></p>').insertBefore(caption);

		// frame
		var o = caption.next();

		// 禁止滚轮事件
		isStopMouseWheel = true;
		if (!$X('MAX_FRAME___')) {
			var o1 = document.createElement('div');
			o1.id = 'MAX_FRAME___';
			$(o1).css({
				position : 'fixed',
				left : 10,
				right : 10,
				top : 10,
				bottom : 10,
				'background-color' : 'rgba(255,255,255,0.9)',
				'z-index' : 10000000,
				'padding-top' : 5,
				overflow : 'auto',
				'border-radius' : 5
			});
			var s1 = '<div style="position:fixed;left:15px;top:15px;font-size:16px;color:#fff;cursor:pointer;'
				+ 'width:20px;height:20px;border-radius:10px;text-align:center;background-color:#111;" ' + ' onclick=EWA.F.FOS["'
				+ this._Id + '"].remove_max()><b style="line-height:20px" class="fa fa-times"></b></div>';
			o1.innerHTML = s1;
			document.body.appendChild(o1);
		}
		var o2 = $('#MAX_FRAME___');
		// CAPTION
		o2.append(caption);
		caption.find('.fa').hide();
		// FRAME
		o2.append(o);
		o.show();
		o2.show();
	};
	this.remove_max = function () {
		var o = $X('MAX_FRAME___');
		var loc = $('#_MAX_FRAME___');
		var inc = 0;
		while (o.childNodes.length > 1) {
			var o1 = o.childNodes[1];
			$(o1).insertBefore(loc);
			$(o1).find('.fa').show();
			inc++;
			if (inc > 5) {
				break;
			}
		}

		loc.remove();
		$(o).hide();

		// 允许滚轮事件
		isStopMouseWheel = false;
	};
	this.reload_frame = function (obj) {
		var refObj = obj.parentNode.parentNode;
		var o1 = refObj.nextElementSibling ? refObj.nextElementSibling : refObj.nextSibling;

		var r = o1.getAttribute("r");
		if (r != null && r != "") {
			// 自定义重新刷新
			eval(r);

			return;
		}
		var ft = $(o1).find('.EWA_TABLE');
		if (ft.length > 0) {
			var fid = ft[0].id.replace("EWA_LF_", "").replace("EWA_FRAME_", "");
			if (EWA.F.FOS[fid] instanceof EWA_FrameClass) {
				var u = EWA.F.FOS[fid].Url;
				var aa = new EWA_AjaxClass();
				aa.Install(u, "EWA_AJAX=INSTALL", o1.id, function () {
					change_edit('disabled')
				});
			} else {
				EWA.F.FOS[fid].Reload();
			}
		} else {
			if (o1.id == 'grp_fin_all') {
				load_grp_fin_total();
			} else {
				var iframes = o1.getElementsByTagName('iframe');
				if (iframes.length > 0) {
					iframes[0].src = iframes[0].src;
				}
			}
		}
	};

	this.open_in_box = function (u, txt) {
		$('#open_box').show();
		$('#open_box .title span').html(txt);

		u = u.replace(/\|/ig, '%7c');
		var s = "<iframe width=100% height=100% src='" + u + "' frameborder=0></iframe>";
		$('#open_box .cnt').html(s);

		isStopMouseWheel = true;
	};
}

/**
 * 栏目获得焦点
 * 
 * @param obj
 *            对象
 * @param func
 *            获得后执行的脚本
 */
function focus_object(obj, func) {
	var p = $(obj).offset();
	if (func) {
		$('body').animate({
			scrollTop : p.top - 40
		}, 300, func);
	} else {
		$('body').animate({
			scrollTop : p.top - 40
		}, 300);
	}
	$('.pop_title').hide();

	var p1 = $(obj).prev().find('.fa-expand');
	if (p1.length > 0) {
		p1.click();
	}
}