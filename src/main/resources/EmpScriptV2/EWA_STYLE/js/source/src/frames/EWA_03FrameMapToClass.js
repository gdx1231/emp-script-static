function EWA_FrameMapToClass() {
	this.EWA = null;
	this.mapRef = function(parentObject, refEwaFrameClass, postUrl) {
		this.POST_URL = postUrl;
		this.EWA = refEwaFrameClass;

		var refTb = $('#EWA_FRAME_' + this.EWA._Id);

		this._Id = this.EWA._Id + '_MAPTO';
		EWA.F.FOS[this._Id] = this;

		var c = this;
		$(parentObject).find('[ref]').each(function() {
			try {
				c.mapRefItem(this, refTb);
			} catch (e) {
				console.log(e, this);
			}
		});

	};
	this.checkbox = function(obj) {
		var p = $(obj).parentsUntil('div[tag="REPT"]').last().parent();
		var v = [];
		p.find('input:checked').each(function() {
			v.push(this.value);
		});

		var data = {
			key : p.attr('id'),
			val : v.join(',')
		}
		// 执行更改提交
		var u = this.POST_URL || window.location.href;
		$JP(u, data, function(rst) {
			if (rst.RST) {
				$TipTL('保存完毕');
			} else {
				$Tip(rst.ERR);
			}
		});
	};
	this.showGpsMap = function(obj, obj_control) {
		var ref_map = obj.attr('ref_map'); // 地图显示位置

		if (!ref_map) {
			return;
		}
		var gps = obj_control.parent().parent().next().find('.ewa-map-small');

		if (gps.length == 0) {
			var c = this;
			setTimeout(function() {
				c.showGpsMap(obj, obj_control);
			}, 100);
			return;
		}

		if (ref_map.indexOf('.') == 0 || ref_map.indexOf('#') == 0) {
			$(ref_map).append(gps.css('height', '100%'));
		} else {
			$('#' + ref_map).append(gps.css('height', '100%'));
		}
	}
	this.mapRefItem = function(obj, refTb) {
		var o = $(obj);

		var ref = o.attr('ref');
		var obj_control = refTb.find('[id="' + ref + '"]');
		var is_html = false;
		var c = this;
		var txt = "";

		var js_name = "EWA.F.FOS['" + this._Id + "']";

		if (obj_control[0].type == 'hidden') {// drop-list
			var setvalue = obj_control.attr('setvalue');
			if (!setvalue) {
				setTimeout(function() {
					c.mapRefItem(obj, refTb);
				}, 100);
				return;
			}
			obj_control = obj_control.prev();
			txt = obj_control.val();
			o.attr('onclick', js_name + '.modifyRef(this)').css('cursor', 'pointer');
		} else if ('addressMap' == obj_control.attr('ewa_tag')) {// 地图地址
			txt = obj_control.val();
			o.attr('onclick', js_name + '.modifyRef(this)').css('cursor', 'pointer');
			this.showGpsMap(o, obj_control);
		} else if (obj_control.attr('tag') == 'REPT') {// checkbox
			var jo = $(obj);
			var left = jo.offset().left;
			var top = jo.offset().top;
			var width = jo.outerWidth();
			var css = {
				position : 'absolute',
				left : left,
				top : top,
				width : width,
				outline : 'none'
			};
			jo.append(obj_control);
			obj_control.find('input[type=checkbox]').attr('onclick', js_name + ".checkbox(this)");
			return;
		} else if ('1' == obj_control.attr('ewa_dhtml')) {
			is_html = true;
			txt = obj_control[0].textContent;
			o.attr('onclick', js_name + '.modifyRefHtml(this)').css('cursor', 'pointer');
		} else if ('SELECT' == obj_control[0].tagName) {
			txt = obj_control[0].options[obj_control[0].selectedIndex].text;
			o.attr('onclick', js_name + '.modifyRef(this)').css('cursor', 'pointer');
		} else if ('TEXTAREA' == obj_control[0].tagName) {
			txt = obj_control.val();
			if (txt) {
				txt = '<div>' + txt.replace(/</, '&lt;').replace(/>/, '&gt;').replace(/\n/ig, '</div><div>') + "</div>";
			}
			is_html = true;
			o.attr('onclick', js_name + '.modifyRef(this)').css('cursor', 'pointer');
		} else {
			txt = obj_control.val();
			o.attr('onclick', js_name + '.modifyRef(this)').css('cursor', 'pointer');
		}

		if (!txt) {
			txt = "...................";
		}

		if (is_html) {
			o.html(txt);
		} else {
			o.text(txt);
		}
		var edit = '<i style="margin-left:5px" class="fa fa-edit"></i>';
		o.append(edit);
	};
	this.createRefCaption = function(refId, caption, left, top) {
		if (!$X(refId + "_____tip")) {
			var memo_div = document.createElement('div');
			var o1 = $(memo_div);
			var css1 = {
				position : 'absolute',
				left : left,
				top : top - 30,
				height : 30,
				'line-height' : '30px',
				background : 'antiquewhite',
				padding : '0 10'
			};
			o1.css(css1).text(caption);
			o1.attr('id', refId + "_____tip");
			$('body').append(o1);
		} else {
			o1 = $($X(refId + "_____tip"));
			o1.show();
		}
		return o1;
	};
	this.modifyRefHtml = function(obj) {
		var jo = $(obj);
		var ref = jo.attr('ref');
		var refTb = $('#EWA_FRAME_' + this.EWA._Id);
		var obj_control = refTb.find('[id="' + ref + '"]').prev(); // textarea
		// prev is
		// editor
		// table

		var left = jo.offset().left;
		var top = jo.offset().top;
		var width = jo.outerWidth();
		var height = jo.outerHeight();

		var css = {
			position : 'absolute',
			left : left,
			top : top,
			width : width,
			height : height,
			font : jo.css('font'),
			border : '2px solid antiquewhite',
			outline : 'none'
		};

		obj_control.css(css);

		$(obj_control.find('iframe')[0].contentWindow.document.body).css('width', 'auto').css('font', jo.css('font'));
		oldv = window[obj_control.attr('id').replace('box', '')].GetHtml();

		obj_control.attr('oldv', oldv);
		var td_memo = $($X('_ewa_tr$' + ref).cells[0]).text(); // td0
		var o1 = this.createRefCaption(ref, td_memo, left, top);

		obj_control.focus();

		var c = this;
		// console.log('set body mousedown')
		window.onmousedown = function(event) {
			if (c.checkInHtmlEditor(event.target)) {
				return;
			}
			var edit_id = obj_control.attr('id').replace('box', '');
			var html = window[edit_id].GetHtml();
			window.onmousedown = null;
			// console.log('remote body mousedown');

			var oldv = obj_control.attr('oldv');
			if (html == oldv) {
				$(obj_control).attr('style', '');
				o1.hide();
				// 值没有编号
				return;
			}
			var field = $(obj).attr('ref'); // field name
			var data = {
				key : field,
				val : html
			}
			// 执行更改提交
			var u = c.POST_URL || window.location.href;
			$JP(u, data, function(rst) {
				$(obj_control).attr('style', '');
				o1.hide();
				if (rst.RST) {
					if (html == "") {
						html = ".............";
					}
					jo.html(html);
					$TipTL('保存完毕');

					var edit = '<i style="margin-left:5px" class="fa fa-edit"></i>';
					jo.append(edit);
				} else {
					$Tip(rst.ERR);
				}
			});
		}
	};
	this.checkInHtmlEditor = function(obj) {
		var objs = $(event.target).parents();
		for (var i = 0; i < objs.length; i++) {
			var o = $(objs[i]);
			if (o.hasClass('ewa-editor') || o.hasClass('ewa-editor-pop') || o.hasClass('ewa-dialog')) {
				return true;
			}
		}
		return false;
	};
	this.modifyRef = function(obj) {
		var jo = $(obj);
		var ref = jo.attr('ref');
		var refTb = $('#EWA_FRAME_' + this.EWA._Id);
		var obj_control = refTb.find('[id="' + ref + '"]');

		if (obj_control[0].type == 'hidden') {// drop-list
			obj_control = $(obj_control).prev();
			// console.log(obj_control)
		}

		var left = jo.offset().left;
		var top = jo.offset().top;
		var width = jo.outerWidth();
		var height = jo.outerHeight();

		if (obj_control[0].tagName == "TEXTAREA") {
			height += 30;
		}
		var css = {
			position : 'absolute',
			left : left,
			top : top,
			width : width,
			height : height,
			font : jo.css('font'),
			border : '2px solid antiquewhite',
			outline : 'none'
		};

		obj_control.css(css);
		var oldv = obj_control.val();

		obj_control.attr('oldv', oldv);
		var td_memo = $($X('_ewa_tr$' + ref).cells[0]).text(); // td0
		var o1 = this.createRefCaption(ref, td_memo, left, top);

		obj_control.focus();

		if (obj_control.attr('evtblur')) {
			return;
		}
		obj_control.attr('evtblur', 'is_setted');

		var c = this;
		addEvent(obj_control[0], 'keydown', function(event) {
			var key_code = event.keyCode;
			if (13 == key_code && 'TEXTAREA' != obj_control[0].tagName) { // enter
				this.blur();
			} else if (27 == key_code) { // esc
				var v = $(this).attr('oldv');
				this.value = v;
				this.blur();
			}
		});
		addEvent(obj_control[0], 'blur', function() {
			var td = $(this.parentNode.parentNode.cells[0]);
			var bg = td.css('background-color');
			var mde = $(this).attr('onmousedown');
			if (mde) {
				var loc = mde.indexOf('.CheckValid');
				var cmd = mde.substring(0, loc);
				var chk = eval(cmd);
				var result = chk.CheckValid(this);
				if (!result) {
					this.focus();
					$(this).css('background', 'pink');
					return;
				} else {
					$(this).css('background', '');
				}
			}
			var k = this.id;
			var v = this.value;
			if ($(this).attr("ewa_class") == "droplist") {
				v = $(this).next().val();
				k = $(this).next().attr('id');
			}

			var data = {
				key : k,
				val : v
			}
			if (bg == 'rgb(255, 255, 224)') {
				$Tip(td.html());
				o1.hide();
				this.focus();
				return;
			}
			if (this.value == $(this).attr('oldv')) {
				$(this).attr('style', '');
				o1.hide();
				// 值没有编号
				return;
			}
			// 执行更改提交
			var u = c.POST_URL || window.location.href;

			var this_obj = this;
			$JP(u, data, function(rst) {
				$(this_obj).attr('style', '');
				o1.hide();
				if (rst.RST) {
					var newv = ('SELECT' == this_obj.tagName ? this_obj.options[this_obj.selectedIndex].text : this_obj.value);
					if (this_obj.tagName == 'TEXTAREA') {
						if (newv == "") {
							newv = ".............";
							jo.html(newv);
						} else {
							newv = newv.replace(/</ig, '&lt;').replace(/>/ig, '&gt;');
							var vs = newv.split('\n');
							var s = "<div>" + vs.join("</div><div>") + "</div>";
							jo.html(s);
						}
					} else {
						if (newv == "") {
							newv = ".............";
						}
						jo.text(newv);

					}
					var edit = '<i style="margin-left:5px" class="fa fa-edit"></i>';
					jo.append(edit);
					$TipTL('保存完毕');
				} else {
					$Tip(rst.ERR);
				}
			});
		});
	};

}