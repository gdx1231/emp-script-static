/**
 * 菜单项类
 */
function EWA_UI_MenuItemClass() {
	this.Img = null; // 图片
	this.Txt = null; // 显示文字
	this.Cmd = null; // 脚本
	this.Group = null; // 菜单组
}

/**
 * 菜单类
 * 
 * @param className
 *            类名
 */
function EWA_UI_MenuClass(className) {
	this.ClassName = className;
	this.MenuShowType = "";

	this.Dialog = null;// new EWA_UI_DialogClass();
	this.Dialogs = new Array();
	this._LastObj = null;
	this._ItemsDiv = null;

	// 被点击的菜单项 2018-11-10
	this.clickedItem = null;


	this.Click = function(e, obj) {
		if(this.clickBeforeEvent){
			this.clickBeforeEvent (e, obj);
		}
		if (this.MenuShowType == 'LEFT') {
			// if (this._LastObj != null) {
			// }
		} else {
			if (this._LastObj != null) {
				this._LastObj.className = this._LastObj.className.replace('_mv1', '');
			}
			this._LastObj = null;
			typeof e.stopPropagation != "undefined" ? e.stopPropagation() : e.cancelBubble = true;
			this._HiddenDialogs();
		}
		EWA.C.Utils.RunCmd(obj);// 执行cmd
		if(this.clickAfterEvent){
			this.clickAfterEvent (e, obj);
		}
	};
	this.OnClick = function(event, obj) {
		this.clickedItem = obj;
		if (this.MenuShowType == 'LEFT') {
			var menuDiv = obj.parentNode.parentNode;
			var po = obj.parentNode;
			var co = obj.parentNode.parentNode.childNodes[1];
			if (co == null) {
				return;
			}
			if (co.childNodes.length == 0) {// 子节点
				if (this._LastCkObj) {
					this._LastCkObj.style.backgroundColor = '';
				}
				po.style.backgroundColor = '#ccc';
				this._LastCkObj = po;
			} else {
				if (co.style.display == 'none') {
					co.style.display = '';
					$(menuDiv).addClass('ewa-lmenu-show')
				} else {
					$(menuDiv).removeClass('ewa-lmenu-show')
					co.style.display = 'none';
				}
				if (window.event) {
					event.cancelBubble = true;
				} else {
					event.stopPropagation();
				}
			}
			this.Click(event, obj);
		} else {
			if (obj.getAttribute('EWA_MF_PID') == "") {
				this._HiddenDialogs();
				var lvl = 0;
				if (this.Dialogs.length <= lvl) {
					this.Dialogs.push(this._CreateDialog());
				}
				var items = this._ShowPullDownMenu(obj, this.Dialogs[lvl]);
				if (items > 0) {
					this.ShowByObject(obj, this.Dialogs[lvl], lvl);
					return;
				}
			}
			this.Click(event, obj);
		}

	}
	this._CalcLevel = function(obj) {
		var lvl = 0;
		var o1 = obj;
		while (o1.getAttribute('EWA_MF_PID') != "") {
			lvl += 1;
			o1 = document.getElementById(o1.getAttribute('EWA_MF_PID'));
			if (o1 == null) {
				return null;
			}
		}
		return lvl;
	}
	this._ShowPullDownMenu = function(obj, dia) {
		var o = $X(dia.FrameContent).childNodes[0].rows[0].cells[0];
		while (o.childNodes.length > 0) {
			var menuItem = o.childNodes[0];
			this._ItemsDiv.appendChild(menuItem);
		}
		var al = new Array();
		for (var i = 0; i < this._ItemsDiv.childNodes.length; i++) {
			var o2 = this._ItemsDiv.childNodes[i];
			if (o2.innerHTML.toUpperCase().indexOf('<HR') > 0) {
			} else {
				o2.style.paddingRight = '10px';
			}
			if (o2.getAttribute('EWA_MF_PID') == obj.id) {
				al.push(o2);
			}
		}
		var len = al.length;
		for (var i = 0; i < al.length; i++) {
			o.appendChild(al[i]);
			var isHaveChildren = this._CheckChildren(al[i].id);
			if (isHaveChildren) {
				var tdd = al[i].childNodes[0].rows[0].cells[2];
				if (tdd.getAttribute('gdx') == null || tdd.getAttribute('gdx') == '') {
					tdd.innerHTML += " +";
					tdd.setAttribute('gdx', 'gdx');
				}
				al[i].setAttribute('EWA_MF_CHILD', "1");
			} else {
				al[i].setAttribute('EWA_MF_CHILD', "0");
			}
			al[i] = null;
		}
		al.length = 0;
		al = null;
		$X(dia.FrameContent).childNodes[0].style.height = 'auto';// 保证菜单框高度
		return len
	}
	this._CheckChildren = function(id) {
		for (var i = 0; i < this._ItemsDiv.childNodes.length; i++) {
			var o2 = this._ItemsDiv.childNodes[i];
			if (o2.getAttribute('EWA_MF_PID') == id) {
				return true;
			}
		}
		return false;
	};

	this.InstallMenus = function(menusId, parentId, showType) {

		if (showType == 'METRO') {
			var menus = [];
			var map = {};
			$('.ewa_menu_m').each(function() {
				var o = $(this);
				var d = {};
				d.id = o.attr('id');
				d.pid = o.attr('EWA_MF_PID');
				d.url = o.attr('EWA_CMD');
				d.icon = o.find('.ewa_menu_m0').attr('class');
				d.title = o.text().trim();
				if (d.icon) {
					d.icon = d.icon.replace('ewa_menu_m0', '').trim();
				}
				if (d.pid == "") {
					d.pid = "0";
					d.subs = [];
					map[d.id] = d;
					menus.push(d);
				} else {
					map[d.pid].subs.push(d);
				}

			});
			// console.log(menus);
			var pid = 'EWA_FRAME_MAIN';
			var isShowBlank = true;
			var className = 'item';
			EWA_UI_Metro.menus = menus;

			EWA_UI_Metro.add_menus(menus, pid, className, null, null, isShowBlank);
			return;
		}

		this.MenuShowType = showType;

		var ms = $X(menusId);
		var p = $X(parentId);
		if (p == null) {
			alert('MenuShow defined error (' + parentId + ')');
			return;
		}
		this._ItemsDiv = ms;
		var s1 = "<table onselectstart='return false' style='cursor:pointer;-moz-user-select:none;' border=0 cellspacing=0 cellpadding=0>";
		s1 += "</table>";

		var al = [];
		p.innerHTML = s1;
		var tb = p.childNodes[0];
		// 获取第一层菜单
		for (var i = 0; i < ms.childNodes.length; i++) {
			var o = ms.childNodes[i];
			if (o.tagName == 'DIV' && o.getAttribute('EWA_MF_PID') == "") {
				al.push(o);
			}
		}
		if (this.MenuShowType == '' || this.MenuShowType == 'TOP') {
			tb.insertRow(-1);
			for (var i = 0; i < al.length; i++) {
				var td = tb.rows[0].insertCell(-1);
				td.appendChild(al[i]);
			}
		} else {
			tb.style.width = '100%';
			this._InstallMenusLeft(tb, ms, al, menusId);
		}
		al.length = 0;
		al = null;

	};
	this._InstallMenusLeft = function(tb, ms, al, menusId) {
		$(tb).addClass('ewa-lmenu');
		// 生成第一层菜单
		for (var i = 0; i < al.length; i++) {
			var tr = tb.insertRow(-1);
			var td = tr.insertCell(-1);
			var div = document.createElement('div');
			div.innerHTML = '<div class="ewa_lmenu_bar" des="rq1"></div><div  des="rq2"></div>'
			div.childNodes[1].style.paddingLeft = '5px';
			td.appendChild(div);
			al[i].style.height = '100%';
			div.childNodes[0].appendChild(al[i]);
			if(i == 0){
				$(div).addClass('ewa-lmenu-show')
			} else {
				div.childNodes[1].style.display = 'none';
			}
		}

		var subMenus = ms.childNodes;
		while (ms.childNodes.length > 0) {
			var o = subMenus[0];
			var pid = o.getAttribute('EWA_MF_PID');
			var div = document.createElement('div');
			div.innerHTML = '<div class="ewa_lmenu_bar1"></div><div style="padding-left:4px;display:none"></div>'
			var menu0 = $X(pid).parentNode.parentNode;
			$(menu0).addClass('ewa-lmenu-children');
			menu0.childNodes[1].appendChild(div);
			div.childNodes[0].appendChild(o);
		}
	};
	this._CreateDialog = function() {
		var dia = new EWA_UI_DialogClass();
		dia.Create();
		var s1 = "<table class='ewa_menu_down' border=0 width=100 cellspacing=0 cellpadding=0 onmousemove='window."
			+ this.ClassName + ".IsOut=false;' onmouseout='window." + this.ClassName
			+ ".IsOut=true; window.setTimeout(function(){var a=window." + this.ClassName
			+ ";a.AutoHidden();},1410);' onselectstart='return false' style='cursor:pointer;-moz-user-select:none;' >";
		s1 += "<tr><td></td></tr>";
		s1 += "</table>";
		dia.SetHtml(s1);
		return dia;
	};
	this.AutoHidden = function() {
		if (this.IsOut) {
			this._HiddenDialogs();
		}
	};
	this.Create = function(menuItems) {
		// this.Dialog.Height=menuItems.length*20+2;
		if (menuItems == null || menuItems.length == 0) {
			return;
		}
		this.Dialog = new EWA_UI_DialogClass();
		this.Dialog.Create();
		var ss = [];
		ss
			.push("<div class='ewa_menu_box' onmousemove='window."
				+ this.ClassName
				+ ".IsOut=false;' onmouseout='window."
				+ this.ClassName
				+ ".IsOut=true; var t1=new Date().getTime(); if(t1-$(this).attr(&quot;open_time&quot;)>1000){ window.setTimeout(function(){var a=window."
				+ this.ClassName
				+ ";a.AutoHidden(this);},1410);}'  onselectstart='return false' style='width:120px;cursor:pointer;-moz-user-select:none;'>");
		for (var i = 0; i < menuItems.length; i += 1) {
			var o = menuItems[i];
			ss.push("<div class='ewa_menu_m' EWA_MG=\"" + o.Group + "\" style='cursor:pointer' EWA_CMD=\"" + o.Cmd
				+ "\" onclick='" + this.ClassName + ".Click(event,this);' onmouseover='" + this.ClassName
				+ ".MouseOver(this);'><table boder=0 width=100% cellpadding=0 cellspacing=0>")
			if (o.Txt.toUpperCase().indexOf('<HR') >= 0) {
				ss.push("<tr><td colspan=2 style='white-space:nowrap'>" + o.Txt + "</td></tr></table></div>");
				continue;
			}
			ss.push("<tr><td class='ewa_menu_m0'>");
			var img = menuItems[i].Img;

			if (img != null && img.indexOf('index=0,size=0') < 0 && img.trim().length > 0) {
				if (img.indexOf('fa') >= 0) {
					ss.push('<i class="' + img + '"></i>');
				} else {
					ss.push("<img src=\"" + menuItems[i].Img + "\">");
				}
			}
			ss.push("</td><td class='ewa_menu_m1' style='white-space:nowrap'>" + menuItems[i].Txt + "</td></tr></table></div>");
		}
		ss.push("</div>");
		this.Dialog.SetHtml(ss.join(""));
	};
	this.HiddenMemu = function() {
		this.Dialog.Show(false);
		EWA.UI.CurMenu = null;
	};
	this.ShowByObject = function(obj, dia, lvl) {
		var loc = EWA.UI.Utils.GetPosition(obj);
		// 出发menu的对象
		this.SHOW_BY_OBJECT = obj;
		dia = dia || this.Dialog;
		if (lvl == null || lvl == 0) {
			dia.Move(loc.X, loc.Y);
		} else {
			var left = obj.offsetWidth;
			dia.Move(loc.X + left - 5, loc.Y - obj.offsetHeight + 4);
		}
		dia.Show(true);
		var o=$(dia.GetFrame()).find('.ewa_menu_box');
		o.attr('open_time',new Date().getTime());
		//console.log(o[0])
		dia.ResizeByContent();
	};

	/**
	 * 根据鼠标显示菜单
	 * 
	 * @param evt
	 *            window.event
	 * @param groupName
	 *            菜单组名称
	 */
	this.ShowByMouse = function(evt, groupName) {
		if(!this.Dialog){
			// 没有菜单
			return;
		}
		var m = 0;
		var ot = $X(this.Dialog.FrameContent).childNodes[0];
		if (groupName == null) {
			m = ot.childNodes.length;
		} else {
			for (var i = 0; i < ot.childNodes.length; i++) {
				var g = ot.childNodes[i].getAttribute('EWA_MG');
				if (g == groupName || groupName == null || groupName == "") {
					ot.childNodes[i].style.display = "";
					m++;
				} else {
					ot.childNodes[i].style.display = "none";
				}
			}
		}
		if (m > 0) {
			var x = evt.x ? evt.x : evt.pageX;
			var y = evt.y ? evt.y : evt.pageY;
			y += document.documentElement.scrollTop || document.body.scrollTop;
			x += document.documentElement.scrollLeft || document.body.scrollLeft;

			this.Dialog.Move(x, y);
			this.Dialog.Show(true);
			this.Dialog.ResizeByContent();
		} else {
			this.Dialog.Show(false);
		}
	};
	this.MouseOver = function(obj) {
		if (this._LastObj != null) {
			if (this.MenuShowType == 'LEFT') {
				// this._LastObj.style.backgroundColor = "";
				this._LastObj.parentNode.className = this._LastObj.parentNode.className.replace('_mv', '');
			} else {
				this._LastObj.className = this._LastObj.className.replace('_mv1', '');
			}
		}

		if (this.MenuShowType == 'LEFT') {
			this._LastObj = obj;
			// this._LastObj.style.backgroundColor = "#DDD";
			this._LastObj.parentNode.className = this._LastObj.parentNode.className + '_mv';
		} else {
			this._LastObj = obj;
			this.IsOut = false;
			this._LastObj.className = this._LastObj.className + '_mv1';
			if (EWA.UI.CurMenu == null) {
				EWA.UI.CurMenu = this;
			}
			var lvl = this._CalcLevel(obj);
			if (obj.getAttribute('EWA_MF_CHILD') == "1") {
				if (this.Dialogs.length <= lvl) {
					this.Dialogs.push(this._CreateDialog());
				}
				this._ShowPullDownMenu(obj, this.Dialogs[lvl]);
				this.ShowByObject(obj, this.Dialogs[lvl], lvl);
			} else {
				/*
				 * if(this.Dialogs.length > lvl+1){
				 * this.Dialogs[lvl+1].Show(false); }
				 */
			}
		}
	};

	this._HiddenDialogs = function() {
		if (this.Dialog != null) {
			this.Dialog.Show(false);
		}
		for (var i = 0; i < this.Dialogs.length; i++) {
			this.Dialogs[i].Show(false);
			var o = $X(this.Dialogs[i].FrameContent).childNodes[0].rows[0].cells[0];
			while (o.childNodes.length > 0) {
				this._ItemsDiv.appendChild(o.childNodes[0]);
			}
		}

	}
	this._InitEvent = function() {
		if (this.MenuShowType == 'LEFT') {
			return;
		}
		if (EWA.B.IE) {
			document.body.attachEvent("onclick", function() {
				if (typeof EWA.UI.CurMenu != 'undefined') {
					EWA.UI.CurMenu._HiddenDialogs();
				}
			});
		} else {
			document.body.addEventListener("click", function() {
				if (typeof EWA.UI.CurMenu != 'undefined') {
					EWA.UI.CurMenu._HiddenDialogs();
				}
			});
		}
	}
	// this._InitEvent();
}
var EWA_UI_Metro = {
	show_title : function(obj) {
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

	},

	item_click : function(obj) {
		var item = $(obj);
		var u = item.attr("u");
		var t = item.attr("_title");
		if (u) {
			if (u.startsWith("js:")) {
				var u1 = u.replace("js:", "");
				eval(u1);
				return;
			}
			if (u.indexOf('/') > 0) {
				u = u;
			} else if (u.indexOf('?') >= 0) {
				u = EWA.CP + "/EWA_STYLE/cgi-bin/" + u;
			} else {
				u = EWA.CP + "/EWA_STYLE/cgi-bin/?" + u;
			}
			top.AddTab(u, t);
		}
	},
	add_menus : function(menus, pid, className, cols, rows, isShowBlank) {
		this.g_menu_cols = window.g_menu_cols || 6; // 列数
		this.g_menu_rows = window.g_menu_rows || 3; // 行数
		this.menuLoadInRight = window.menuLoadInRight || false; // 是否在右侧加载菜单Ï

		// this.css();
		cols = cols || this.g_menu_cols;
		rows = rows || this.g_menu_rows;

		// 系统管理菜单
		for (var i = 0; i < menus.length; i++) {
			var item = menus[i];
			if (item && item.icon && item.icon.indexOf('gear')>0) {
				menus[i] = null;
				menus[cols * rows - 1] = item;
				break;
			}
		}

		var table = document.createElement('table');
		$X(pid).innerHTML = "";
		$X(pid).className = 'ewa-metro-menu';
		$X(pid).appendChild(table);
		$($X(pid)).append('<div class="pop_title" style="display: none;"><div>-</div><p></p></div>');
		$($X(pid)).css('background', 'transparent').css('border', 0);
		table.align = 'center';
		var idx = 0;
		var ss = [];
		for (var i = 0; i < rows; i++) {
			var hid = pid + '_htr_' + i;

			var tr1 = table.insertRow(-1);
			tr1.id = hid;
			var td1 = tr1.insertCell(-1);
			td1.colSpan = cols;
			tr1.style.display = 'none';
			td1.id = hid + 'a';

			var tr = table.insertRow(-1);

			for (var m = 0; m < cols; m++) {
				var item = menus[idx];
				idx++;
				var td = this.add_menu_item(tr, item, isShowBlank, idx, className, hid);
				if (item) {
					td.id = "M_" + item.id;
				}
				if (td && item && (item.all == null || item.all == true)) {
					var s1 = td.innerHTML;
					ss.push(s1);
				}

			}
		}
		if (!this._is_load_main_menu && this.menuLoadInRight) {
			parent.$("#RIGHT").html(ss.join(''));
			parent.$("#RIGHT .item").each(function() {
				$(this).append($(this).attr('_title'));
				$(this).attr("onmouseout", null);
				$(this).attr("onmouseover", null);
				$(this).attr("onclick", "EWA_UI_Metro.right_show_menu_sub(this,event)");
			});
		}
		this._is_load_main_menu = true;
	},
	add_menu_item : function(tr, item, isShowBlank, idx, className, hid) {
		if (isShowBlank || item) {
			var td = tr.insertCell(-1);
			var s = "<div class='" + className + "'><i id='memu_item_" + idx + "'></i></div>";
			td.innerHTML = s;
		}
		if (!item) {
			return;
		}

		var o = $(td).find('i');
		var op = o.parent();
		if (item.icon && item.icon.trim().length > 0) {
			if (item.icon.indexOf('fa') == 0) {
				o.attr("class", item.icon);
			} else {
				op.append("<table width=100% height=100%><tr><td align=center><img style='max-width:90%;max-height:90%' src='"
					+ item.icon + "' /></td></tr></table>");
				o.hide();
			}
		} else if (item.img) {
			op.append("<table width=100% height=100%><tr><td align=center><img  src='" + item.img + "' /></td></tr></table>");
			o.hide();
		}
		op.attr("_title", item.title);
		op.attr("onmouseover", 'EWA_UI_Metro.show_title(this)');
		op.attr("onmouseout", "$('.pop_title').hide()");
		op.attr("hid", hid);
		if (item.url) {
			op.attr("u", item.url);
			op.attr("onclick", "EWA_UI_Metro.item_click(this,event)");
		} else if (item.subs) {
			// sub menu
			op.attr('subs', JSON.stringify(item.subs));
			op.attr('onclick', "EWA_UI_Metro.show_menu_sub(this,event)");
		}
		td.id = "M_" + item.id;
		return td;
	},
	show_menu_sub : function(obj) {
		var t = $(obj);
		var cls = t.attr("class");
		var pid = t.attr('hid');
		if (window.last_open && window.last_open != obj) {
			window.last_open.click();
		}
		if (t.attr('is_open') == 1) { // 已经打开，关闭
			t.attr('is_open', "0");
			$X(pid).style.display = 'none';
			window.last_open = null;
			t.attr('class', cls.split(' ')[0]);

		} else {
			t.attr('is_open', "1");
			var menus = JSON.parse(obj.getAttribute('subs'));
			$X(pid).style.display = '';
			$X(pid).style.opacity = 0;
			EWA_UI_Metro.add_menus(menus, pid + 'a', 'item_sub', 9, Math.round(menus.length / 9 + 0.4), false);
			t.attr('class', cls + " open");
			$($X(pid)).animate({
				opacity : 1
			}, 300);
			window.last_open = obj;
			EWA_UI_Metro.load_msg_sub();
		}
		
		if(this.show_menu_sub_after){
			this.show_menu_sub_after(obj);
		}
	},
	css : function() {
		if (this._css_setted) {
			return;
		}
		var ss = [];
		ss.push(".nav_box {");
		ss.push("margin: auto;");
		ss.push("margin-top: 50px;");
		ss.push("}");
		ss.push(".nav_box .item {");
		ss.push("margin: 5px;");
		ss.push("background-color: #08c;");
		ss.push("width: 140px;");
		ss.push("height: 140px;");
		ss.push("text-align: center;");
		ss.push("color: #fff;");
		ss.push("transition-duration: 0.3s;");
		ss.push("-webkit-transition-duration: 0.3s;");
		ss.push("cursor: pointer;");
		ss.push("position: relative;");
		ss.push("}");
		ss.push(".nav_box .item .msg {");
		ss.push("position: absolute;");
		ss.push("top: -8px;");
		ss.push("right: -8px;");
		ss.push("height: 18px;");
		ss.push("border-radius: 10px;");
		ss.push("background-color: red;");
		ss.push("color: #fff;");
		ss.push("line-height: 18px;");
		ss.push("text-align: center;");
		ss.push("min-width: 18px;");
		ss.push("padding: 2px;");
		ss.push("box-shadow: 1px 1px 13px rgba(0, 0, 245, 0.7);");
		ss.push("}");
		ss.push(".nav_box .open {");
		ss.push("-webkit-transform: rotate(45deg) scale(0.7);");
		ss.push("-webkit-transition-duration: 0.7s;");
		ss.push("transform: rotate(45deg) scale(0.7);");
		ss.push("transition-duration: 0.7s;");
		ss.push("}");
		ss.push(".nav_box .open i {");
		ss.push("transform: rotate(-45deg);");
		ss.push("-webkit-transform: rotate(-45deg);");
		ss.push("}");
		ss.push(".nav_box .item:hover {");
		ss.push("background-color: #fff;");
		ss.push("color: #08c;");
		ss.push("-webkit-transition-duration: 0.3s;");
		ss.push("transition-duration: 0.3s;");
		ss.push("}");
		ss.push(".nav_box .item i {");
		ss.push("line-height: 140px;");
		ss.push("font-size: 60px;");
		ss.push("}");
		ss.push(".nav_box .item img {");
		ss.push("max-height: 100px;");
		ss.push("max-width: 100px;");
		ss.push("}");
		ss.push(".nav_box .item_sub {");
		ss.push("margin: 12px;");
		ss.push("background-color: darkorange;");
		ss.push("width: 70px;");
		ss.push("height: 70px;");
		ss.push("text-align: center;");
		ss.push("color: #fff;");
		ss.push("-webkit-transition-duration: 0.3s;");
		ss.push("transition-duration: 0.3s;");
		ss.push("cursor: pointer;");
		ss.push("position: relative;");
		ss.push("}");
		ss.push(".nav_box .item_sub .msg {");
		ss.push("position: absolute;");
		ss.push("top: -8px;");
		ss.push("right: -8px;");
		ss.push("height: 18px;");
		ss.push("border-radius: 10px;");
		ss.push("background-color: #fff;");
		ss.push("color: red;");
		ss.push("line-height: 18px;");
		ss.push("text-align: center;");
		ss.push("min-width: 18px;");
		ss.push("padding: 2px;");
		ss.push("box-shadow: 1px 1px 13px rgba(255, 0, 0, 0.7);");
		ss.push("}");
		ss.push(".nav_box .item_sub i {");
		ss.push("line-height: 70px;");
		ss.push("font-size: 30px;");
		ss.push("}");
		ss.push(".nav_box .item_sub:hover {");
		ss.push("background-color: #fff;");
		ss.push("color: darkorange;");
		ss.push("-webkit-transition-duration: 0.3s;");
		ss.push("transition-duration: 0.3s;");
		ss.push("}");

		ss.push(".pop_title{ position: absolute;min-width: 50px;display: none;z-index: 212;white-space: nowrap;}");
		ss
			.push(".pop_title div {position: relative;width: 100%;z-index: 2;height: 30px;line-height: 30px;text-align: center;background-color: #8D8804;padding: 0 4px;border-radius: 5px;color: #fff;}");
		ss.push(".pop_title p {");
		ss.push("position: relative;");
		ss.push("padding: 0px;");
		ss.push("height: 12px;");
		ss.push("width: 12px;");
		ss.push("transform: rotate(45deg);");
		ss.push("-webkit-transform: rotate(45deg);");
		ss.push("margin: auto;");
		ss.push("margin-top: -6px;");
		ss.push("z-index: 1;");
		ss.push("background-color: #8D8804;");
		ss.push("}");

		var obj = document.createElement('style');
		obj.textContent = ss.join('\n');
		document.getElementsByTagName('head')[0].appendChild(obj);
		this._css_setted = true;
	},
	right_show_menu_sub : function(obj, evt) {
		var evt = evt || event;
		var t1 = evt.target || evt.srcElement;
		if (t1.className != 'item') {
			return;
		}
		var t = $(obj);
		var subMenus = this.right_add_menu_subs(obj);
		if (window.last_open && window.last_open != obj) {
			window.last_open.click();
		}
		if (t.attr('is_open') == 1) { // 已经打开，关闭
			t.attr('is_open', "0");
			if (subMenus) {
				subMenus.style.display = 'none';
			}
			window.last_open = null;
		} else {
			t.attr('is_open', "1");
			if (subMenus) {
				subMenus.style.display = '';
			}
			window.last_open = obj;
		}
	},
	right_add_menu_subs : function(pobj) {
		var id = ('M_' + Math.random()).replace(".", "");
		pobj.id = pobj.id || id;
		var id1 = pobj.id + "_s";
		if ($X(id1)) {
			return $X(id1);
		}
		var menus;
		var subs = pobj.getAttribute('subs');
		if (subs) {
			menus = JSON.parse(subs);
		}
		if (!menus || menus.length == 0) {
			this.right_item_click(pobj);
			return;
		}
		var div = document.createElement('div');
		div.id = id1;
		pobj.appendChild(div);
		for (var i = 0; i < menus.length; i++) {
			var item = menus[i];
			var p = document.createElement('p');
			$(p).attr({
				onclick : "EWA_UI_Metro.right_item_click(this)",
				"_title" : item.title,
				u : item.url
			});
			p.innerHTML = "<b class='" + item.icon + "'></b><span>" + item.title + "</span>";
			div.appendChild(p);
		}
		return div;
	},
	right_item_click : function(obj) {
		var item = $(obj);
		var u = item.attr("u");
		var t = item.attr("_title");
		if (u) {
			if (u.indexOf('/') > 0) {
				u = u;
			} else if (u.indexOf('?') >= 0) {
				u = EWA.CP + "/EWA_STYLE/cgi-bin/" + u;
			} else {
				u = EWA.CP + "/EWA_STYLE/cgi-bin/?" + u;
			}
			AddTab(u, t);
		}
	},
	load_msg_sub : function() {

	}
// add_menus(index_menus, 'nav_box', 'item', g_menu_cols, g_menu_rows,
// true);

};
var __Menu = {
	C : EWA_UI_MenuClass
};
__Menu.OnMouseOver = function(obj) {
	if (__Menu._LastObj != null) {
		__Menu._LastObj.style.backgroundColor = "";
	}
	__Menu._LastObj = obj;
	obj.style.backgroundColor = "#DDD";
};
__Menu.OnClick = function(e, obj) {
	if (__Menu._LastObj != null) {
		__Menu._LastObj.style.backgroundColor = "";
	}
	__Menu._LastObj = null;
	typeof e.stopPropagation != "undefined" ? e.stopPropagation() : e.cancelBubble = true;
	if (obj.id.indexOf('_EWA_MF_') > 0 && obj.id.indexOf('*') > 0) {
		var id = obj.id.split('*')[0];
		var o1 = document.getElementById(id);
		for (var i = 0; i < o1.childNodes.length; i++) {
			var o2 = o1.childNodes[i];
			if (o2.getAttribute('EWA_MF_PID') == o1.id) {
				alert(o2.innerHTML);
			}
		}
	}
	EWA.C.Utils.RunCmd(obj);// 执行cmd
};

EWA["UI"].Menu = __Menu; /* 菜单 */

