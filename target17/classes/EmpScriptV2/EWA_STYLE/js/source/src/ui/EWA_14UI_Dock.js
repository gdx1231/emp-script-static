var EWA_UI_Dock = {
	dockObj : null,
	dockTitleObj : null,
	menuMap : {},
	init : function (menus) {
		var ss = [ "<div class='ewa-dock'><table class='ewa-dock-table'><tr>" ];
		for ( var n in menus) {
			var menu = menus[n];
			var ref_id = EWA_Utils.tempId("_EWA_UI_Dock_");
			this.menuMap[ref_id] = menu;
			var txt = this.getMenuText(menu);
			var txt1 = this.filterHtml(txt);
			var s = "<td class='ewa-dock-item-td' ><div class='ewa-dock-item-div' id='" + ref_id + "' _title=\"" + txt1
					+ "\" onclick='EWA_UI_Dock.click(this)' onmouseover='EWA_UI_Dock.showTitle(this)' onmouseout='EWA_UI_Dock.hideTitle(this)'>"
					+ "<div class='ewa-dock-item-icon " + menu.ICON + "'></div></div></td>";
			ss.push(s);
		}
		ss.push("</tr></table></div>");
		this.dockObj = $(ss.join(""));

		var ss1 = '<div class="ewa-dock-title" style="display: none;"><div>--</div><p></p></div>';
		this.dockTitleObj = $(ss1);
		$('body').append(this.dockObj).append(this.dockTitleObj);
	},
	click : function (obj) {
		var menu = this.menuMap[obj.id];
		if(!menu){
			console.log('menu ['+obj.id+']?')
		}
		if(!menu.CMD){
			console.log('NO CMD in menu' , menu);
			return;
		}
		if(menu.CMD instanceof Function){
			menu.CMD(obj); 
		} else { //字符串调用
			eval(menu.CMD);
		}
	},
	getMenuText : function (menu) {
		return menu.TEXT;
	},
	filterHtml : function (s) {
		return s.replace(/</ig, "&lt;").replace(/>/ig, "&gt;").replace(/"/ig, "&quot;")
	},
	showTitle : function (obj) {
		if (obj.getAttribute('_title') == "" || obj.getAttribute('_title') == null) {
			var ttt = obj.title;
			if (ttt == "" || ttt == null) {
				return;
			}
			obj.setAttribute("_title", ttt);
			obj.title = "";
		}
		this.dockTitleObj.find("div:eq(0)").html(obj.getAttribute('_title'));

		var p = $(obj).offset();
		var w = $(obj).width();
		var h = this.dockTitleObj.height();
		var w1 = this.dockTitleObj.width();

		this.dockTitleObj.css('top', p.top - h - 8);
		this.dockTitleObj.show();
		this.dockTitleObj.css('left', p.left - (w1 - w) / 2);

	},
	hideTitle : function () {
		this.dockTitleObj.hide();
	}
};