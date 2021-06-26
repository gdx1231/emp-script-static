function EWA_UI_LeftClass() {
	this.crm_cfg;
	this.map;
	this.lastmd;
	this.parentId;
	this.objSearch;
	this.objSearchGrp = null;
	this.objRecords = null;
	this.objContent;
	this.instanceName; // 实例化的变量名
	this.sortExp;
	this.searchExp;
	this.Create = function(json) {
		this.parentId = ("EWA_UI_LeftClass" + Math.random()).replace(".", "m");
		EWA.F.FOS[this.parentId] = this;
		this._Id = this.parentId;

		this.map = json;
		this.map.des = this.map.des.split(',');
		this.map.order = this.map.order.split(',');

		if (window != parent) {
			$('body').css('background-color', 'transparent');
		}
		var init_htmls = [ "<link rel=\"stylesheet\" rev=\"stylesheet\" type=\"text/css\" href='" + EWA.RV_STATIC_PATH
			+ "/EWA_STYLE/skins/complex.css' />" ];
		init_htmls.push("<table cellpadding=0 cellspacing=0 width=100% height=100%>");
		init_htmls.push("<tr>");
		init_htmls.push("<td width=230><div id='" + this.parentId + "' class=\"items\"></div></td>");

		var src = "";
		if (this.map['default']) {// 默认打开页面
			src = " src=\"" + this.map['default'] + "\" ";
		}
		init_htmls.push("<td id=\"cnt\"><iframe frameborder=0 id='a2a2' " + src + " name=\"a2a2\"");
		init_htmls.push("height=100% width=100%></iframe></td>");
		init_htmls.push("</tr>");
		init_htmls.push("</table>");

		$('body').html(init_htmls.join(''));

		this.instanceName = "EWA.F.FOS." + this.parentId;
		// this.noDataFunc = noDataFunc;

		var p = $X(this.parentId);

		this.objContent = p;
		var s1 = '<div class="search_box" onselectstart="return false">' + this.create_grp()
			+ '<div class=" fa fa-search"><input class="search" onkeyup="' + this.instanceName
			+ '.do_search()" placeholder="search"  onselectstart="return true">'
			+ "</div></div><div class='search_records'><b class='fa fa-quote-left'></b>&nbsp;记录数：<i></i></div>";
		$('body').append(s1);

		this.objSearch = $('.search')[0];
		if (this.map.grp && this.map.grp.length > 0) {
			this.objSearchGrp = $('.search-grp')[0];
		} else {
			this.objContent.style.top = '31px';
			$('.search_box').css("height", 30);
		}
		this.objRecords = $('.search_records i')[0];

		// 获取数据
		this.load_data();
		this.current_page = 1;
		this.page_size = 50;
	};
	this.scroll_check = function(obj) {
		if (obj.scrollHeight - obj.scrollTop > obj.clientHeight * 1.2) {
			return;
		}
		if (this.current_page * this.page_size > this.total_records) {
			return;
		}
		if (this.is_load_data) {
			return;
		}
		this.load_more();
	};
	this.load_more = function() {
		if (this.current_page) {// 当前PAGE
			this.current_page++;
		} else {
			this.current_page = 2;
		}
		this._load_datas();
	}
	this.create_grp = function() {
		if (!this.map.grp || this.map.grp.length == 0) {
			return "";
		}
		var ss = [ "<div ><i class='fa fa-filter'></i><select onchange='" + this.instanceName
			+ ".do_grp(this)' class='search-grp'>" ];
		for (var i = 0; i < this.map.grp.length; i++) {
			var g = this.map.grp[i];
			var s1 = "<option value='" + g[1] + "'>" + g[0] + "</option>";
			ss.push(s1);
		}
		ss.push("</select></div>");
		return ss.join('');
	};
	this.create_sort = function() {
		if (this.map.order == null || this.map.order.length == 0) {
			return;
		}
		var map1 = $J2MAP(this.crm_cfg, 'NAME');
		var ss = [ "<div openbox=1 class='sort' onclick='" + this.instanceName
			+ ".show_sort(this.childNodes[0],event)'><i openbox=1 style='line-height:16px'"
			+ " class='fa fa-gear'></i><table cellpadding=1 cellspacing=1 class='sort_items'><tr><td valign=top>" ];
		ss.push('<p onclick="' + this.instanceName + '.do_sort(null,this)">清除排序<b class="fa fa-times"></b></p>');
		for (var i = 0; i < this.map.order.length; i++) {
			var exp = this.map.order[i];
			if (!map1[exp]) {
				continue;
			}
			var v = map1[exp].DES;
			var s = '<div  class="sort_item" onclick="' + this.instanceName + '.do_sort(&quot;' + exp
				+ '&quot;,this)"><nobr><i class="fa fa-circle-o"></i>&nbsp;' + v + '&nbsp;<b class="fa"></b></nobr></div>';
			ss.push(s);
		}
		ss.push("</td><td valign=top></td><td valign=top></td></tr></table></div><div onclick='" + this.instanceName
			+ ".hide(this)' class='hide_but'>" + "<b style='line-height:16px' class='fa fa-caret-left'></b></div>");
		return ss.join('');
	};
	this.hide = function(o) {
		this.objContent.style.display = 'none';
		this.objContent.parentNode.style.backgroundColor = '#f1f1f1';
		this.objSearch.parentNode.parentNode.style.display = 'none';
		this.objRecords.parentNode.style.display = 'none';
		var c = this;
		this.objContent.parentNode.onclick = function() {
			c.show();
		};
		this.objContent.parentNode.appendChild(o);
		this.hideButton = o;

		$(this.objContent.parentNode).animate({
			width : '30px'
		}, 300);
	};
	this.show = function() {
		this.objSearch.parentNode.appendChild(this.hideButton);
		var c = this;

		$(this.objContent.parentNode).animate({
			width : '230px'
		}, 300, function() {
			c.objContent.parentNode.style.backgroundColor = '';
			c.objContent.style.display = '';
			c.objRecords.parentNode.style.display = '';
			c.objSearch.parentNode.parentNode.style.display = '';

		});
	}
	this.do_sort = function(v, obj) {
		var sorts = $('.sort_items')[0];
		$(sorts).find('.sort_item i').attr("class", "fa fa-circle-o");
		$(sorts).find('.sort_item b').attr("class", "fa");
		if (v) {
			var desc = $(obj).attr("desc");
			var c1 = "";
			if (desc == null || desc == "") {
				v += " DESC";
				$(obj).attr("desc", "desc");
				c1 = "fa fa-caret-down";
			} else {
				$(obj).attr("desc", "");
				c1 = "fa fa-caret-up";
			}
			$(obj).find('i').attr("class", "fa fa-dot-circle-o");
			$(obj).find('b').attr("class", c1);
		}
		this.sortExp = v;
		this.current_page = 1;
		this._load_datas();
		sorts.style.display = 'none';
		sorts.setAttribute('show', '');
	};
	this.do_grp = function(obj) {
		this.current_page = 1;
		this._load_datas();
	};
	this.do_filter = function(obj) {
		var sorts = $('.sort_items')[0];
		var selects = $(sorts).find('[search_tag]');
		var ss = {};
		for (var i = 0; i < selects.length; i++) {
			var f1 = selects[i];
			var search_type = f1.getAttribute("search_type");
			if (f1.value == '' && search_type != 'date') {
				continue;
			}
			if (search_type == 'date') {
				var id1 = f1.id + '_1';
				var date0 = f1.value;
				var date1 = $X(id1).value;

				if (date0 == '' && date1 == '') {
					continue;
				} else {
					var exp = "@!@" + f1.getAttribute("search_tag") + "~!~" + search_type;
					if (!ss[exp]) {
						ss[exp] = "";
					}
					ss[exp] += "~!~" + date0 + '~!~' + date1;
				}
			} else {
				var exp = "@!@" + f1.getAttribute("search_tag") + "~!~" + search_type;
				if (!ss[exp]) {
					ss[exp] = "";
				}
				ss[exp] += "~!~" + f1.value;
			}

		}
		var ss2 = [];
		for ( var n in ss) {
			ss2.push(n);
			ss2.push(ss[n]);
		}
		this.filterExp = ss2.join("");
		sorts.style.display = 'none';
		sorts.setAttribute('show', '');
		this.current_page = 1;
		this._load_datas();
	}
	this.do_search = function() {
		var o = $(this.objSearch);
		var val = o.val();
		var oldVal = o.attr("old_val");
		if (val == oldVal) {
			return;
		}
		o.attr("old_val", val);

		this.searchExp = "@!@" + this.map.search + "~!~text~!~" + val;
		this.current_page = 1;
		this._load_datas();
	};
	this._load_datas = function() {
		this.is_load_data = true; // 当前数据加载中
		var u = $U2(this.map.XMLNAME, this.map.ITEMNAME, "&EWA_FRAMESET_NO=1&EWA_AJAX=json_ext", true);

		if (this.sortExp && this.sortExp != "") {
			u += "&EWA_LF_ORDER=" + this.sortExp.toURL();
		}
		var search = "";
		if (this.searchExp && this.searchExp != "") {
			search = this.searchExp;
		}
		if (this.filterExp && this.filterExp != "") {
			search += this.filterExp;
		}
		if (search != "") {
			u += "&EWA_LF_SEARCH=" + search.toURL();
		}
		if (this.objSearchGrp) {
			u += "&" + this.objSearchGrp.value;
		}
		if (this.current_page) {
			u += "&EWA_PAGECUR=" + this.current_page;
		}
		var c = this;
		$J(u, function(v) {
			c.total_records = v.RECORDS;
			c.show_pages();
			c.show_data(v.DATA, [ true ]);
			c.is_load_data = false; // 当前数据加载完毕
		});
	};
	this.show_sort = function(obj, evt) {
		evt = evt || event;
		var t = evt.srcElement || evt.target;
		var openbox = t.getAttribute("openbox");
		if (openbox != 1) {
			return;
		}
		var nxt = $(obj).next();
		if (nxt.attr('show') == null || nxt.attr("show") == "") {
			nxt.show();
			nxt.css({
				top : 20,
				right : 4
			});
			nxt.attr("show", 1);
		} else {
			nxt.hide();
			nxt.attr("show", "");
		}
	};
	this.load_data = function() {
		var u = $U2(this.map.XMLNAME, this.map.ITEMNAME, "&EWA_FRAMESET_NO=1&EWA_AJAX=json_ext1", true);
		if (this.objSearchGrp) {
			u += "&" + this.objSearchGrp.value;
		}
		$J(u, this.load_data1, this);

	};
	this.create_filter = function(json) {
		var ss = [];
		var map1 = $J2MAP(this.crm_cfg, 'NAME');
		var ss_text = [];
		for ( var n in json) {
			var f = json[n];
			if (f.T == 'fix') { // 选择
				ss.push("<select onchange='" + this.instanceName + ".do_filter(this)' search_type='" + f.T + "' search_tag='" + n
					+ "'>");
				ss.push("<option value=''>--" + map1[n].DES + "--</option>");
				for (var i = 0; i < f.D.length; i++) {
					var v = f.D[i];
					ss.push("<option value=\"" + v[0] + "\">" + v[1] + "</option>");
				}
				ss.push("</select>");
			} else if (f.T == 'text') {// 文字搜索
				ss_text.push("<div class='search_input'><input search_type='" + f.T + "' old='' onblur='" + this.instanceName
					+ ".checkTextChange(this)' search_tag='" + n + "' type=text placeholder=\"" + map1[n].DES + "\"/></div>");
			} else if (f.T == 'date') {// 文字搜索
				var rid = ("D" + Math.random()).replace(".", "A");

				ss_text.push("<div class='search_input'><input style='width:43%' id='" + rid
					+ "' onclick=\"EWA.UI.Calendar.Pop(this)\" search_tag='" + n + "' search_type='" + f.T + "' old='' onblur='"
					+ this.instanceName + ".checkTextChange(this)' type=text placeholder=\"" + map1[n].DES
					+ "\"/> <input style='width:43%' id='" + rid + "_1' old='' onblur='" + this.instanceName
					+ ".checkTextChange(this)' onclick=\"EWA.UI.Calendar.Pop(this)\" type=text placeholder=\"" + map1[n].DES
					+ "\"/></div>");
			}
		}
		return [ ss, ss_text ];
	};
	// 检查输入框内容是否变化
	this.checkTextChange = function(obj) {
		var old = obj.getAttribute('old');
		var v = obj.value.trim();
		if (old == v) {
			return;
		}
		obj.setAttribute('old', v);
		this.do_filter(obj.parentNode);
	};
	this.load_data1 = function(v, args) {
		var c = args[0];

		// 没有数据执行的方法
		if (v.DATA.length == 0 && c.noDataFunc) {
			c.noDataFunc();
		}

		c.crm_cfg = v.CFG;
		var map1 = $J2MAP(c.crm_cfg, 'NAME');

		c.CFG_MAP = map1;

		c.WF = v.WF;
		c.FRAME_UNID = v.FRAME_UNID;
		c.show_data(v.DATA);
		// 总记录数

		c.total_records = v.RECORDS;
		c.show_pages();

		console.log(c.total_records)
		var sort = c.create_sort();

		$(c.objSearch).parent().append(sort);

		var jsFrameUnid = v.FRAME_UNID;
		EWA_Utils.JsRegister(v.JSFRAME);
		var json = EWA.F.FOS[jsFrameUnid]._SearchJson;
		console.log(json);

		var searchSelectAndText = c.create_filter(json);
		var inc = 1;

		var objSortItems = $(c.objSearch).parent().find('.sort_items');
		if (searchSelectAndText[0].length > 0) {
			var sp = '<p on1click="' + this.instanceName + '.do_sort(null,this)">筛选</p>';
			objSortItems.find('td:eq(1)').css('width', 140).append(sp + searchSelectAndText[0].join(""));
			inc++;
		} else {
			objSortItems.find('td:eq(1)').hide();
		}
		if (searchSelectAndText[1].length > 0) {
			var sp = '<p on1click="' + this.instanceName + '.do_sort(null,this)">检索</p>';
			objSortItems.find('td:eq(2)').css('width', 140).html(sp + searchSelectAndText[1].join(""));
			inc++;
		} else {
			objSortItems.find('td:eq(2)').hide();
		}
		objSortItems.css('width', inc * 144);
		if (!c.init_scroll) {
			c.init_scroll = true;
			c.objContent.setAttribute('onscroll', c.instanceName + ".scroll_check(this)");
		}
	};
	this.show_pages = function() {
		var total_pages = Math.round(this.total_records / this.page_size);
		if (this.total_records % this.page_size > 0) {
			total_pages++;
		}
		this.objRecords.innerHTML = this.total_records + ', ' + this.current_page + '/ ' + total_pages;
	}
	this.load_after = function() {
		// replace your function
	};
	this.show_data = function(datas, args) {
		var o = $(this.objContent);
		if (this.current_page == 1) {
			if (args != null && args.length > 0 && args[0] == true) {
				o.find('.item').remove();
			}
		}
		for (var i = 0; i < datas.length; i++) {
			var d = datas[i];
			var chd = this.show_data1(d);
			o.append(chd);
		}
		if (this.load_after) {
			this.load_after();
		}
	};
	this.show_data1 = function(d) {
		var obj = document.createElement('div');
		obj.setAttribute('fid', ('ITEM_' + Math.random()).replace(".", "k"));

		obj.className = "item";
		var h1 = document.createElement('h1');
		var titleExp = this.map.title;
		var title = this.replace_parameter(d, titleExp);
		var sv = $(this.objSearch).val();
		if (sv && sv != "") {
			title = title.replace(sv, "<span style='color:red'>" + sv + "</span>");
		}
		h1.innerHTML = title;
		h1.title = title;
		$(h1).css({
			'white-space' : 'nowrap',
			'overflow' : 'hidden',
			'text-overflow' : 'ellipsis'
		});
		obj.appendChild(h1);
		var ul = document.createElement('ol');

		for ( var n in this.map.des) {
			var id = this.map.des[n];
			var span = document.createElement('li');
			var name = this.CFG_MAP[id].NAME;
			var txt = d[name + "_HTML"];

			if (txt == null || txt == "") {
				txt = d[name];
			}
			if (txt == null || txt == "") {
				continue;
			}
			span.innerHTML = this.CFG_MAP[id].DES + ":&nbsp; " + txt;
			ul.appendChild(span);
		}
		obj.appendChild(ul);
		$(ul).css({
			'white-space' : 'nowrap',
			'overflow' : 'hidden',
			'text-overflow' : 'ellipsis',
			margin : 4,
			padding : '4px 18px'
		});
		var key = this.replace_parameter(d, this.map.key);
		obj.id = key;
		obj.setAttribute("onmousedown", this.instanceName + ".md(this)");
		if (this.WF) {
			var wf = this.create_item_wf(d);
			obj.appendChild(wf);
		}
		return obj;
	};
	this.create_item_wf = function(d) {
		var wf = this.WF;
		var p1 = wf.P;
		var ss = [];
		for (var i = 0; i < wf.RID.length; i++) {
			ss.push("@" + wf.RID[i]);
		}
		p1 = p1.replace(/\[RID\]/ig, ss.join(","));
		p1 += "&fjson=___wf_json_para"
		var js = "EWA.UI.Dialog.OpenReloadClose('" + this.FRAME_UNID + "','" + wf.X + "','" + wf.I + "',false,'" + p1 + "')";

		js = this.replace_parameter(d, js);
		var a = document.createElement('a');
		a.innerHTML = "流程控制/审批";
		// a.href = "javascript:" + js;
		a.setAttribute("flow", 1);
		a.setAttribute("onclick", "eval('window.___wf_json_para='+this.getAttribute('json'));" + js);
		var json = [];
		for ( var n in this.crm_cfg) {
			var cfg = this.crm_cfg[n];

			if (cfg.TAG == 'span') {
				var o1 = {
					DES : cfg.DES,
					VAL : d[cfg.NAME + '_HTML'] || d[cfg.NAME]
				};
				if (o1.VAL) {
					json.push(o1);
				}
			}
		}
		a.setAttribute("json", JSON.stringify(json));
		a.style.display = 'none';
		return a;
	};
	/**
	 * 鼠标点击事件，显示在右窗体
	 */
	this.md = function(obj) {
		if (this.lastmd) {
			this.lastmd.className = this.lastmd.className.replace(" md", "");
		}
		obj.className = obj.className + " md";
		this.lastmd = obj;
		var root = this.map.u;

		if (!root) {
			window.frames[0].document.body.innerHTML = '<h1 style="color:Red">json.u没定义,不知道要导航到哪里</h1>';
			return;
		}
		if (this.map.u.indexOf("()") > 0) {
			root = eval(this.map.u);
		}
		var u = root + (root.indexOf("?") > 0 ? "&" : "?") + obj.id + "&_fid_=" + obj.getAttribute("fid");
		if (this.objSearchGrp) {
			var v = this.objSearchGrp.value;
			if (v != "") {
				u += "&" + v;
			}
		}
		if (this.AddTab) {
			var t = GetInnerText($(obj).find('h1')[0]);
			this.AddTab(u, t);
		} else {

			window.frames["a2a2"].location.href = u;
		}
	};
	/**
	 * 替换参数
	 * 
	 * @param data
	 * @param temp
	 * @returns
	 */
	this.replace_parameter = function(data, temp, refData) {
		var exp = temp;
		var s2 = [];
		if (!data.____S2) {
			for ( var n in data) {
				s2["@" + n.toUpperCase()] = data[n];
			}
			if (refData) {
				for ( var n in refData) {
					if (!s2[n]) {
						s2[n] = refData[n];
					}
				}
			}
			data.____S2 = s2;
		}
		s2 = data.____S2;
		var r1 = /\@[a-zA-Z0-9\-\._:]*\b/ig;
		var m1 = temp.match(r1);
		for (var i = 0; i < m1.length; i++) {
			var key = m1[i];
			var v = s2[key.toUpperCase()];
			v = v || "-";
			exp = exp.replace(key, v);
		}

		return exp;
	};
}
var EWA_ComplexClass = function() {
	this.edit = function(ref_id, obj) {
		var ref_obj = $X(ref_id);

		var p = $(ref_obj).offset();
		var is_open = ref_obj.getAttribute('is_open');
		if (is_open != 1) {
			this.changeEdit(ref_id, false);
			obj.innerHTML = '<i class="fa fa-save"></i>';
			ref_obj.setAttribute('is_open', 1);
			obj.setAttribute("_title", "保存");
		} else {
			$(ref_obj).find('input[id=butOk]').click();
			this.changeEdit(ref_id, true);
			obj.innerHTML = '<i class="fa fa-edit"></i>';
			ref_obj.setAttribute('is_open', 0);
			obj.setAttribute("_title", "编辑");
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
	this.focusObject = function(obj, func) {
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
	this.changeEdit = function(ref_id, isDisabled) {
		var ref_obj = $X(ref_id);
		$(ref_obj).find('.EWA_TD_B').hide();
		$(ref_obj).find('select').attr('disabled', isDisabled);
		$(ref_obj).find('input').attr('disabled', isDisabled);
		if (isDisabled) {
			$(ref_obj).find('input').css('background-color', '#eee');
			$(ref_obj).find('textarea').hide();
		} else {
			$(ref_obj).find('input').css('background-color', '');
			$(ref_obj).find('textarea').show();
		}
	};
	// ---初始化调用-----
	this._init = function() {
		var buts = window['_EWA_MENU_' + this._Id];
		$('.caption-info').attr("onselectstart", "return false");
		this.add_doc_buts(buts);
		this.init_lazy_frames_top();
		var c = this;
		addEvent(window, "scroll", function() {
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
	this.add_doc_buts = function(buts) {
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
			Txt : "隐含全部",
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
				td.childNodes[0].onclick = function() {
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

		$('#dock').css('width', $('#controls').width()).css('left', '50%');
		$('#controls').css('margin-left', '-50%');
	};
	// 初始化frame的Top用于后加载
	this.init_lazy_frames_top = function() {
		this.lazy_frames = this.lazy_frames || {};
		var c = this;
		$('div[x]').each(function() {
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
	this.lazy_load = function() {
		var h = document.body.scrollTop + document.body.clientHeight;
		for ( var n in this.lazy_frames) {
			if (this.lazy_frames[n].top <= h - 10) {
				this.lazy_load_do(n);
			}
		}
		this.mark_loc();
	};
	this.lazy_load_do = function(n) {
		if (this.lazy_frames[n].ok) {
			return;
		}

		this.lazy_frames[n].ok = true;
		var obj = $('#' + n);
		var x = obj.attr("x");
		if (x != null && x.length > 0) {
			var i1 = obj.attr("i");
			var p = obj.attr("p");
			var js = obj.attr("js");
			if (js == null || js.trim() == "") {
				EWA.F.Install(n, x, i1, p + "&" + $U());
			} else {
				EWA.F.Install(n, x, i1, p + "&" + $U(), function() {
					eval(js);
				});
			}
		} else {
			var u = obj.attr("u") + "&" + $U() + "&NO_NAV=1";
			// var ajax=new EWA_AjaxClass();
			// ajax.Install(u,"",n,function(){});
			var fid = ("iframe_lazy_" + Math.random()).replace(".", "A");
			var s = "<iframe id='" + fid + "' name='" + fid + "' width=100% height=100% frameborder=0 src='" + u + "'></iframe>";
			$X(n).innerHTML = s;
			var h0 = -1;
			var iscombine = u.indexOf('combine.jsp') > 0 ? true : false;
			var t1 = setInterval(function() {
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
	this.mark_loc = function() {
		var bottoms = 0;
		var tops = 0;
		var objs = $('.fcaption');
		var topConv = $('#nav_left .top');
		var bottomConv = $('#nav_left .bottom');

		var conv = $('#nav_left');

		for (var i = 0; i < objs.length; i++) {
			var o = objs[i];
			var ref1 = this.mark_loc_ref(o, i);
			o = $(o);
			var top = o.offset().top - document.body.scrollTop;

			if (top > document.body.clientHeight - bottomConv.height()) {
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
	this.mark_loc_ref = function(o, index) {
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
			if (window.EWA_LANG && EWA_LANG == 'enus') {
				var en = o.attr('en');
				if (en) {
					o.html(en);
				}
			}
			// 图钉
			var s2 = "<b onclick='" + thisClass + "max_frame(this)' class='fa fa-thumb-tack '>&nbsp;</b>";

			o.html(s2 + o.html());

			var bgc = o.css("background-color");

			o.parent().css("border-bottom-color", bgc);

			ref = document.createElement('div');
			ref.style.backgroundColor = bgc;
			ref.id = "zzz" + id;
			$('#nav_left').append(ref);
			ref.onclick = function() {
				var id = this.id.replace("zzz", "");
				var o = $($X(id));
				var top = o.offset().top;
				$('body').animate({
					scrollTop : top
				}, 300);
			}
			ref.title = o.html();
			ref.innerHTML = index + 1;
			ref.onmouseover = function() {
				$('.pop_title_left div').html(this.title);
				var off = $(this).offset();
				$('.pop_title_left').show().css('top', off.top - 10).css('right', 45);
			};
			ref.onmouseout = function() {
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

	this.my_mousewheel = function(e) {
		if (isStopMouseWheel) {
			return;
		}
		var e1 = e || event;
		var v = e.wheelDelta || e.detail;
		if (EWA.B.MOZILLA) {
			document.body.scrollTop += v * 3;
		} else {
			document.body.scrollTop -= v;
		}
	};
	this.show_title = function(obj) {
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
	this.compress_all = function(obj) {
		var o = $(obj);
		var tag;
		if (o.attr('compress') == null || o.attr('compress') == "") {
			o.attr('compress', 1);
			o.find('i').attr('class', 'fa fa-expand');
			tag = 'fa-compress';
			o.attr("_title", '显示全部');
		} else {
			o.attr('compress', "");
			o.find('i').attr('class', 'fa fa-compress');
			tag = 'fa-expand';
			o.attr("_title", '隐含全部');
		}
		var c = this;
		$('.fcaption .' + tag).each(function() {
			c.hide_frame(this);
		});

	};
	/**
	 * 获取localStorage保存的数据
	 */
	this.getlocalStorage = function() {
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
				json=eval('__json=' + window.localStorage[id]+"; __json;");
			} catch (e) {
				json = {};
			}
		}
		json.id = id;
		return json;
	};
	this.hide_frame = function(obj) {
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
	this.max_frame = function(obj) {
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
	this.remove_max = function() {
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
	this.reload_frame = function(obj) {
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
				aa.Install(u, "EWA_AJAX=INSTALL", o1.id, function() {
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

	this.open_in_box = function(u, txt) {
		$('#open_box').show();
		$('#open_box .title span').html(txt);
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
var EWA_UI_BoxClass = function() {
	this._ClassName = ("EWA_UI_BoxClass" + Math.random()).replace(".", "$");
	window[this._ClassName] = this;

	this._REF_DATA;
	this._JSON_URL;
	this._Cfg;

	/**
	 * 加载Json数据
	 * 
	 * @param cfg
	 *            配置信息
	 */
	this.Create = function(cfg) {
		this._Cfg = cfg;
		if (!this._Cfg.parent_id) {
			alert('parent_id未定义');
			return;
		}
		var pids = this._Cfg.parent_id.split(',');
		for (var i = 0; i < pids.length; i++) {
			var pid = pids[i].trim();
			if ($X(pid)) {
				$($X(pid)).html("waiting...");
				this._Cfg.parent_id_init = this._Cfg.parent_id;
				this._Cfg.parent_id = pid;
				break;
			}
		}
		if (!this._Cfg.parent_id_init) {
			alert('parent_id[' + this._Cfg.parent_id + ']找不到定义的对象');
			return;
		}
		// 查找本类的对应的 FOS(listframe)
		if (EWA.F && EWA.F.FOS) {
			for ( var n in EWA.F.FOS) {
				var fos = EWA.F.FOS[n];
				if (fos.BOX_CLASS == this) {
					this.FOS = fos;
				}
			}
		}

		this.initBoxSize();
		// this.add_box_style();
		var u2 = new EWA_UrlClass();
		u2.SetUrl(window.location.href);

		var pagesize = u2.GetParameter("EWA_PAGESIZE");
		var pagecur = u2.GetParameter("EWA_PAGECUR");

		if (pagesize && !isNaN(pagesize)) {
			this._Cfg.EWA_PAGESIZE = pagesize;
		} else {
			this._Cfg.EWA_PAGESIZE = 10;
		}
		if (pagecur && !isNaN(pagecur)) {
			this._Cfg.EWA_PAGECUR = pagecur;
		} else {
			this._Cfg.EWA_PAGECUR = 1;
		}

		var ref_data = {};
		for ( var n in u2._Paras) {
			ref_data["@" + n.toUpperCase()] = u2._Paras[n];
		}
		this._REF_DATA = ref_data;

		this.load_box_data();
	};
	/**
	 * 修正宽度
	 */
	this.initBoxSize = function() {
		if (!this._Cfg.page_width) {
			return;
		}
		var newWidth;
		if (isNaN(this._Cfg.page_width)) {// 参数如果不是纯数字,例如200px,130pt,20mm...
			var id = this._ClassName + "_check_size";
			var obj = "<div id='" + id + "' style='height:1px;width:" + this._Cfg.page_width + "'></div>";
			$('body').append(obj);
			var obj1 = $($X(id));
			newWidth = obj1.width();
			obj1.remove();
		} else {
			newWidth = this._Cfg.page_width * 1;
		}
		if (newWidth <= 50) {
			return;
		}
		var fix = {};
		fix.width = newWidth;
		// title margin 5, icon width 20,margin-right5
		var box_title = newWidth - 5 * 2 - 20 - 5;
		fix.box_title = box_title;
		// left img width,img margin-left
		fix.box_title_img = box_title - 30 - 5;
		// box_txt margin 5
		var box_txt = newWidth - 5 * 2;
		fix.box_txt = box_txt;
		// box_des padding
		var box_des1 = box_txt - 1 * 2 - 58;
		// 明细右侧
		fix.box_des1 = box_des1;

		this._Cfg._Fix = fix;
	}
	/**
	 * 创建URL并提交
	 */
	this.load_box_data = function() {
		var u;
		if (this.FOS == null) {
			var ss = [ EWA.CP + '/EWA_STYLE/cgi-bin/?EWA_AJAX=JSON_EXT1&ewa_frameset_no=1' ];

			for ( var n in this._Cfg) {
				var n1 = n.toUpperCase();
				if (n1 == 'XMLNAME' || n1 == 'ITEMNAME' || n1.indexOf('EWA_') == 0) {
					var v1 = this._Cfg[n];
					if (v1) {
						ss.push(n1 + "=" + v1);
					}
				}
			}
			ss.push($U());
			u = ss.join('&');
			this._JSON_URL = u;
		} else {
			var ss = [ this.FOS.Url + "&EWA_AJAX=JSON_EXT1&ewa_frameset_no=1" ];

			for ( var n in this._Cfg) {
				var n1 = n.toUpperCase();
				if (n1.indexOf('EWA_') == 0) {
					var v1 = this._Cfg[n];
					if (v1) {
						ss.push(n1 + "=" + v1);
					}
				}
			}
			ss.push($U());
			u = ss.join('&');
			this._JSON_URL = u;
		}
		// console.log(u);
		$J(u, this.load_box_data1, this);
	};
	/**
	 * 处理返回的json数据
	 * 
	 * @param v
	 *            json
	 * @param args
	 *            其它参数
	 */
	this.load_box_data1 = function(v, args) {
		var refData = this._REF_DATA;
		var u = this._JSON_URL;
		var fromClass = args[args.length - 1];

		var tmp = fromClass._Cfg;
		var pid = fromClass._Cfg.parent_id;

		// EWA.F.FOS[v.FRAME_UNID] = {
		// Reload : function() {
		// fromClass.Create(fromClass._Cfg);
		// }
		// };
		if (!window['EWA_F' + v.FRAME_UNID]) {// 如果没有Jsframe则加载,否则抛弃
			EWA_Utils.JsRegister(v.JSFRAME);
			EWA_Utils.JsRegister(v.JS);

		}
		// 替换重新加载事件
		EWA.F.FOS[v.FRAME_UNID].Reload = function() {
			fromClass.Create(fromClass._Cfg);
		};
		// 替换跳转事件
		EWA.F.FOS[v.FRAME_UNID].Goto = function(idx) {
			var u2 = new EWA_UrlClass();
			u2.SetUrl(fromClass._JSON_URL);
			u2.RemoveParameter("ewa_pagecur");
			u2.AddParameter("ewa_pagecur", idx);
			var json_url = u2.GetUrl();
			console.log(json_url);
			$J(json_url, fromClass.load_box_data1, fromClass._REF_DATA, json_url, fromClass);
			this._JSON_URL = json_url;
		};

		var newid = '___NeW_____' + tmp.parent_id;
		if (!$X(newid)) {
			// 首次加载生成,以后就不生成了
			tmp.new_parent_id = newid;
			fromClass.createToolbar(v);
		}

		// 显示页码
		fromClass.setPageInfo(v);

		// 生成box对象
		fromClass.enq_op_main_sub_boxs(v);

		// 跳转到焦点
		if (tmp.autofocus == true) {
			var pobj = $X(pid);
			var t = $(pobj).offset().top;
			$('body').animate({
				scrollTop : t - 30
			}, 300);
		}
		if (tmp.callback) {
			try {
				if (typeof tmp.callback == 'function') {
					tmp.callback(fromClass);
				} else {
					eval(tmp.callback);
				}
			} catch (e) {
				alert(e);
			}
		}
	};
	/**
	 * 创建工具条
	 */
	this.createToolbar = function(v) {
		var tmp = this._Cfg;
		var pobj = $($X(tmp.parent_id));

		var ss = [];
		ss.push('<div onselectstart="return false;" class="box-tool-bar">');
		var js = " onclick='" + this._ClassName + ".toolBarClick(this)' ";
		var buts = 'fa-table,fa-list aa,fa-sort aa,fa-search aa'.split(',');
		for (var i = 0; i < buts.length; i++) {
			ss.push("<i class='fa " + buts[i] + "' " + js + "></i>");
		}

		ss.push("&nbsp;&nbsp;")

		var navs = 'fa-fast-backward aa,fa-backward aa,fa-forward aa,fa-fast-forward aa'.split(',');
		for (var i = 0; i < navs.length; i++) {
			ss.push("<i class='fa " + navs[i] + "' " + js + "></i>");
			if (i == 1) {
				// 记录信息
				ss.push("<span class='aa' id='" + this._ClassName + "_records'></span>");
				ss.push("<select class='aa' id='" + this._ClassName + "_page' onchange='" + this._ClassName
					+ ".do_page(this)'><option value=5>5</option><option value=10>10</option>" + "<option value=20>20</option>"
					+ "<option value=50>50</option><option value=100>100</option>"
					+ "<option value=150>150</option><option value=200>200</option>"
					+ "<option value=300>300</option><option value=500>500</option></select>");
			}
		}
		var filters = this.create_filter(v);
		var filter = filters[0]; // fix检索
		var search = filters[1]; // 文字和日期检索

		ss.push("<div class='sort_items' id='" + this._ClassName + "_search'>");
		ss.push(filter.join(''));
		ss.push(search.join(''));
		ss.push("</div>");

		var sort = this.create_sort(v);
		ss.push("<div class='sort_items' id='" + this._ClassName + "_sort'>");
		ss.push(sort);
		ss.push("</div>");

		ss.push('</div><div id="' + tmp.new_parent_id + '"></div>');

		pobj.html(ss.join(''));

		$X(this._ClassName + "_page").value = this._Cfg.EWA_PAGESIZE;
	};
	this.setPageInfo = function(v) {
		var p0 = v.RECORDS * 1 / this._Cfg.EWA_PAGESIZE * 1;
		var p1 = Math.round(p0);
		if (p1 < p0) {
			p1++;
		}
		this._Cfg._TOTALPAGE = p1;
		var s = " [" + this._Cfg.EWA_PAGECUR + '/ <b >' + p1 + '</b> (' + v.RECORDS + ')] ';
		$X(this._ClassName + "_records").innerHTML = s;
	}
	this.create_sort = function(v) {
		var map1 = $J2MAP(v.CFG, 'NAME');
		var orders = [];
		for ( var n in EWA.F.FOS[v.FRAME_UNID].ItemList.Items) {
			var item = EWA.F.FOS[v.FRAME_UNID].ItemList.Items[n];
			if ($(item).find("OrderSearch Set").attr('IsOrder') == "1") {
				orders.push(n);
			}
		}
		var ss = [];
		ss.push('<p class="sort-item" onclick="' + this._ClassName + '.do_sort(null,this)">清除排序<b class="fa fa-times"></b></p>');
		for (var i = 0; i < orders.length; i++) {
			var exp = orders[i];
			if (!map1[exp]) {
				continue;
			}
			var v = map1[exp].DES;
			var s = '<div  class="sort-item" onclick="' + this._ClassName + '.do_sort(&quot;' + exp
				+ '&quot;,this)"><nobr><i class="fa fa-circle-o"></i>&nbsp;' + v + '&nbsp;<b class="fa"></b></nobr></div>';
			ss.push(s);
		}

		return ss.join('');
	};
	this.do_sort = function(v, obj) {
		var sorts = $('.sort_items')[1];
		$(sorts).find('.sort-item i').attr("class", "fa fa-circle-o");
		$(sorts).find('.sort-item b').attr("class", "fa");
		if (v) {
			var desc = $(obj).attr("desc");
			var c1 = "";
			if (desc == null || desc == "") {
				v += " DESC";
				$(obj).attr("desc", "desc");
				c1 = "fa fa-caret-down";
			} else {
				$(obj).attr("desc", "");
				c1 = "fa fa-caret-up";
			}
			$(obj).find('i').attr("class", "fa fa-dot-circle-o");
			$(obj).find('b').attr("class", c1);
		}
		this._Cfg.EWA_LF_ORDER = v;
		this._Cfg.EWA_PAGECUR = 1;
		this.load_box_data();
		sorts.style.display = 'none';
		sorts.setAttribute('show', '');
	};
	this.create_filter = function(v) {
		var json = EWA.F.FOS[v.FRAME_UNID]._SearchJson;
		var ss = [];
		var map1 = $J2MAP(v.CFG, 'NAME');
		var ss_text = [];
		for ( var n in json) {
			var f = json[n];
			if (f.T == 'fix') { // 选择
				ss.push("<select onchange='" + this._ClassName + ".do_filter(this)' search_type='" + f.T + "' search_tag='" + n
					+ "'>");
				ss.push("<option value=''>--" + map1[n].DES + "--</option>");
				for (var i = 0; i < f.D.length; i++) {
					var v = f.D[i];
					ss.push("<option value=\"" + v[0] + "\">" + v[1] + "</option>");
				}
				ss.push("</select>");
			} else if (f.T == 'text') {// 文字搜索
				ss_text.push("<div class='search_input'><input search_type='" + f.T + "' old='' onblur='" + this._ClassName
					+ ".checkTextChange(this)' search_tag='" + n + "' type=text placeholder=\"" + map1[n].DES + "\"/></div>");
			} else if (f.T == 'date') {// 文字搜索
				var rid = ("D" + Math.random()).replace(".", "A");

				ss_text.push("<div class='search_input'><input style='width:43%' id='" + rid
					+ "' onclick=\"EWA.UI.Calendar.Pop(this)\" search_tag='" + n + "' search_type='" + f.T + "' old='' onblur='"
					+ this._ClassName + ".checkTextChange(this)' type=text placeholder=\"" + map1[n].DES
					+ "\"/> <input style='width:43%' id='" + rid + "_1' old='' onblur='" + this._ClassName
					+ ".checkTextChange(this)' onclick=\"EWA.UI.Calendar.Pop(this)\" type=text placeholder=\"" + map1[n].DES
					+ "\"/></div>");
			}
		}
		return [ ss, ss_text ];
	};
	this.toolBarClick = function(obj) {
		var cla = obj.className;

		if (cla.indexOf('fa-table') > 0) {
			if (this.last_but == obj) {
				return;
			}
			this.last_but = obj;
			$(obj).parent().find('.aa').show();
			this.load_box_data();
		} else if (cla.indexOf('fa-list') > 0) {// 列表
			if (this.last_but == obj) {
				return;
			}
			this.last_but = obj;
			$(obj).parent().find('.aa').hide();
			var u2 = new EWA_UrlClass();
			u2.SetUrl(this._JSON_URL);
			u2.RemoveParameter("ewa_ajax");
			u2.AddParameter("ewa_ajax", 'install');

			u2.RemoveParameter("ewa_box");
			// 避免fos对象重复
			u2.RemoveParameter("xmlname");
			u2.AddParameter("xmlname", '|' + this._Cfg.xmlname);
			var ajax = new EWA.C.Ajax();
			ajax.Install(u2.GetUrl(), "", this._Cfg.new_parent_id, function() {
			});
		} else if (cla.indexOf('fa-search') > 0) {
			var id = this._ClassName + '_search';
			var o = $($X(id));
			var p = $(obj).offset();
			var left = p.left;
			var top = p + $(obj).height + 20;
			o.css({
				top : top,
				left : left,
				'z-index' : 10000
			}).show();
		} else if (cla.indexOf('fa-sort') > 0) {
			var id = this._ClassName + '_sort';
			var o = $($X(id));
			var p = $(obj).offset();
			var left = p.left;
			var top = p + $(obj).height + 20;
			o.css({
				top : top,
				left : left,
				'z-index' : 10000
			}).show();
		} else if (cla.indexOf('fa-fast-forward') > 0) {
			this._Cfg.EWA_PAGECUR = this._Cfg._TOTALPAGE;
			this.load_box_data();
		} else if (cla.indexOf('fa-forward') > 0) {
			var p1 = this._Cfg.EWA_PAGECUR * 1 + 1;
			if (p1 > this._Cfg._TOTALPAGE) {
				alert('已经到页尾了');
				return;
			}
			this._Cfg.EWA_PAGECUR = p1;
			this.load_box_data();
		} else if (cla.indexOf('fa-backward') > 0) {
			var p1 = this._Cfg.EWA_PAGECUR * 1 - 1;
			if (p1 == 0) {
				alert('已经到页头了');
				return;
			}
			this._Cfg.EWA_PAGECUR = p1;
			this.load_box_data();
		} else if (cla.indexOf('fa-fast-backward') > 0) {
			this._Cfg.EWA_PAGECUR = 1;
			this.load_box_data();
		}
	};
	// 检查输入框内容是否变化
	this.checkTextChange = function(obj) {
		var old = obj.getAttribute('old');
		var v = obj.value.trim();
		if (old == v) {
			return;
		}
		obj.setAttribute('old', v);
		this.do_filter(obj.parentNode);
	};
	/**
	 * 分页
	 */
	this.do_page = function(obj) {
		var p = obj.value;
		this._Cfg.EWA_PAGESIZE = p;
		this._Cfg.EWA_PAGECUR = 1;
		this.load_box_data();
	}
	this.do_filter = function(obj) {
		var sorts = $('.sort_items')[0];
		var selects = $(sorts).find('[search_tag]');
		var ss = {};
		for (var i = 0; i < selects.length; i++) {
			var f1 = selects[i];
			var search_type = f1.getAttribute("search_type");
			if (f1.value == '' && search_type != 'date') {
				continue;
			}
			if (search_type == 'date') {
				var id1 = f1.id + '_1';
				var date0 = f1.value;
				var date1 = $X(id1).value;

				if (date0 == '' && date1 == '') {
					continue;
				} else {
					var exp = "@!@" + f1.getAttribute("search_tag") + "~!~" + search_type;
					if (!ss[exp]) {
						ss[exp] = "";
					}
					ss[exp] += "~!~" + date0 + '~!~' + date1;
				}
			} else {
				var exp = "@!@" + f1.getAttribute("search_tag") + "~!~" + search_type;
				if (!ss[exp]) {
					ss[exp] = "";
				}
				ss[exp] += "~!~" + f1.value;
			}

		}
		var ss2 = [];
		for ( var n in ss) {
			ss2.push(n);
			ss2.push(ss[n]);
		}
		this._Cfg.EWA_LF_SEARCH = ss2.join("");
		console.log(this.filterExp);
		sorts.style.display = 'none';
		sorts.setAttribute('show', '');
		this._Cfg.EWA_PAGECUR = 1;
		this.load_box_data();
	};
	this.enq_op_main_sub_boxs = function(json) {
		var cfg = $J2MAP(json.CFG, "NAME");
		var arr = json.DATA;
		var wf = json.WF;

		var tmp = this._Cfg;
		var refData = this._REF_DATA;

		var pobj = $X(tmp.new_parent_id);
		pobj.innerHTML = "";
		if (tmp.first) {
			var mTb = this.enq_op_main_sub_tb();
			pobj.appendChild(mTb);
			var td = $(mTb.rows[0].cells[0]);
			td.attr({
				"valign" : "",
				align : "center"
			});
			td.append(tmp.first);
		} else {
			// 按钮
			enq_op_main_sub_box_but(pobj);
		}
		pobj.setAttribute('sys_frame_unid', json.FRAME_UNID);
		for (var i = 0; i < arr.length; i++) {
			var mTb = this.enq_op_main_sub_tb();
			mTb.id = json.FRAME_UNID + "$" + arr[i].EWA_KEY;

			pobj.appendChild(mTb);

			var mTd = $(mTb.rows[0].cells[0]); // td
			if (tmp.chk && tmp.chk_icons) {// 状态
				var chkObj = this.enq_op_main_sub_box_chk(cfg, arr[i], tmp, refData, wf, json.FRAME_UNID);
				mTd.append(chkObj);
			}
			var title = this.enq_op_main_sub_title(cfg, arr[i], tmp, refData);
			mTd.append(title);
			// 文字描述
			var o = this.enq_op_main_sub_box(cfg, arr[i], tmp, refData);
			mTd.append(o[0]);
			mTd.attr("json", JSON.stringify(o[1]));
		}
		$(pobj).find('.box_des1').each(function() {
			this.title = GetInnerText(this);
		});
	};
	/**
	 * buttons
	 * 
	 * @param pobj
	 * @returns
	 */
	this.enq_op_main_sub_box_but = function(pobj) {
		var buts = $(pobj).parentsUntil('table[id=Test1]').find('.ewa_lf_func_dact');
		var mTb = this.enq_op_main_sub_tb();
		pobj.appendChild(mTb);
		var mTd = $(mTb.rows[0].cells[0]);
		var w = mTd.width();
		var w1 = w / 3 - 10;
		mTd.attr("valign", "middle");
		buts.each(function() {
			var obj = document.createElement('div');
			obj.innerHTML = this.innerHTML;
			obj.className = "box_but";
			this.id = this.id || ("sdo" + Math.random()).replace(".", "P");
			obj.id = "K" + this.id;
			$(obj).attr("fid", this.id);
			$(obj).attr("onclick", "$X(this.getAttribute('fid')).click()");
			$(obj).css('width', w1);
			mTd.append(obj);
		});
		return mTb;
	};
	/**
	 * 状态图标
	 * 
	 * @param cfg
	 * @param data
	 * @param tmp
	 * @returns {___anonymous2588_2590}
	 */
	this.enq_op_main_sub_box_chk = function(cfg, data, tmp, refData, wf, fuid) {
		var obj = document.createElement('div');
		obj.className = "status";
		var s;
		if (tmp.chk && tmp.chk instanceof Function) {
			try {
				var v = tmp.chk(data);
				s = tmp.chk_icons[v];
				if (typeof s == 'function') {
					s = s();
				}
			} catch (e) {
				s = e;
			}
		}
		if (s == null || s == '') {
			// 模板定义的默认图标
			s = tmp.icon;
		}
		if (s == null || s == '') {
			s = "fa fa-gear";
		}
		var color = tmp.icon_color;
		if (typeof s == 'object') {
			color = s.color;
			s = s.icon;
		}
		if (s.trim().indexOf('fa') == 0) {
			obj.innerHTML = "<li class='" + s + "' " + (color ? " style='color:" + color + "'" : "") + "></li>";
		} else {
			obj.innerHTML = s;
		}

		// 菜单
		var menus = this.enq_op_main_sub_menu(cfg, data, refData, wf, fuid);

		if (menus.childNodes.length > 0) {
			obj.setAttribute("onclick", this._ClassName + ".enq_op_main_sub_menu_show(this)");
			obj.appendChild(menus);
		}
		return obj;
	};
	this.enq_op_main_sub_menu_show = function(obj) {
		var menubox = $(obj).find('.box_menus')[0];
		if (!window.enq_op_main_sub_last_menu) {
			var o = document.createElement('div');
			o.className = "box_menus";
			o.setAttribute("onselectstart", "return false");
			document.body.appendChild(o);
			this.enq_op_main_sub_last_menu = $(o);
			this.enq_op_main_sub_last_menu.css("z-index", 1000000);
		}
		this.enq_op_main_sub_last_menu.html(menubox.innerHTML);

		var o1 = $(obj);
		var p = o1.offset();
		console.log(o1);
		console.log(p)
		this.enq_op_main_sub_last_menu.css({
			left : p.left - 110,
			top : p.top,
			width : 110
		});
		this.enq_op_main_sub_last_menu.show();
	};
	/**
	 * 创建菜单
	 * 
	 * @param cfg
	 * @param data
	 * @param refData
	 * @param wf
	 *            workflow
	 * @param fuid
	 *            sys_frame_unid
	 * 
	 * @returns {___anonymous2797_2799}
	 */
	this.enq_op_main_sub_menu = function(cfg, data, refData, wf, fuid) {
		var div = document.createElement("div");
		div.className = "box_menus";
		$(div).hide();
		var delete_menu = null;
		for ( var n in cfg) {
			var c = cfg[n];
			var evt = c._ONCLICK || c.EWA_ONCLICK;
			if (evt == null || evt == "") {
				continue;
			}

			var des = c.DES;
			if (c.NAME.toUpperCase() == 'BUTDELETE') {
				delete_menu = c;
				continue;
			} else if (c.NAME.toUpperCase() == 'BUTMODIFY') {
				des = "<b class='fa fa-edit'></b>&nbsp;" + c.DES;
			}

			var js = this.replace_parameter(data, evt, refData);
			var a = this.enq_op_main_sub_menu_item(des, js)
			a.setAttribute('refid', c.NAME);
			div.appendChild(a);
		}
		if (delete_menu) {
			var hr = document.createElement('hr');
			div.appendChild(hr);
			var des = "<b class='fa fa-trash-o'></b>&nbsp;" + delete_menu.DES;
			var js = this.replace_parameter(data, delete_menu._ONCLICK, refData);
			var a = this.enq_op_main_sub_menu_item(des, js)

			div.appendChild(a);
		}
		if (wf) {
			var wfrst = this.enq_op_main_wf_js(cfg, data, refData, wf, fuid);
			var js = wfrst[0];
			var a = enq_op_main_sub_menu_item("流程控制/审批", js);
			a.setAttribute("flow", 1);
			var js1 = this._ClassName
				+ ".enq_op_main_close_menu(event,this);eval('window.___wf_json_para='+this.parentNode.parentNode.parentNode.getAttribute('json'))";
			a.setAttribute("onclick", js1);
			div.appendChild(a);
		}
		var clo = "<b onclick='" + this._ClassName + ".enq_op_main_close_menu(event,this)' class='fa fa-power-off close'></b>";
		div.setAttribute("onselectstart", "return false;");
		$(div).append(clo)
		return div;
	};
	/**
	 * 生成审批的脚本和显示数据
	 * 
	 * @param cfg
	 *            配置信息
	 * @param data
	 *            当前数据
	 * @param refData
	 *            引用数据（如Query参数）
	 * @param wf
	 *            工作流配置
	 * @param fuid
	 *            刷新Frame的ID，用于 EWA.F.FOS[xxx].Reload
	 * @returns {Array} 0 脚本，1显示数据的JSON
	 */
	this.enq_op_main_wf_js = function(cfg, data, refData, wf, fuid) {
		var p1 = wf.P;
		var ss = [];
		for (var i = 0; i < wf.RID.length; i++) {
			ss.push("@" + wf.RID[i]);
		}
		p1 = p1.replace(/\[RID\]/ig, ss.join(","));
		p1 += "&fjson=___wf_json_para"
		var js = "EWA.UI.Dialog.OpenReloadClose('" + fuid + "','" + wf.X + "','" + wf.I + "',false,'" + p1 + "')";
		js = this.replace_parameter(data, js, refData);
		var json = [];
		for (var i = cfg.length - 1; i >= 0; i--) {
			var d = cfg[i];
			var n = d.NAME;
			var v = data[n + '_HTML'] || data[n];
			if (v) {
				var o = {
					DES : d.DES,
					VAL : v
				};
				json.push(o);
			}
		}
		return [ js, json ];
	};
	this.enq_op_main_sub_menu_item = function(des, js) {
		var a = document.createElement("a");
		a.innerHTML = des;
		a.href = "javascript:" + js;
		a.setAttribute("onclick", this._ClassName + ".enq_op_main_close_menu(event,this);");

		return a;
	};
	this.enq_op_main_close_menu = function(evt, fobj) {
		var e1 = evt || window.event;
		e1.stopPropagation();
		e1.cancelBubble = true;
		fobj.parentNode.style.display = 'none';
	};
	/**
	 * 文字描述
	 * 
	 * @param cfg
	 * @param d
	 * @param tmp
	 * @returns
	 */
	this.enq_op_main_sub_box = function(cfg, d, tmp, refData) {
		var box_txt_fix = this._Cfg._Fix ? "style='width:" + this._Cfg._Fix.box_txt + "px'" : "";
		var ss = [ "<table  onselectstart='return true' class='box_txt' " + box_txt_fix + " cellspacing=0 cellpadding=0>" ];
		var box_des1_fix = this._Cfg._Fix ? "style='width:" + this._Cfg._Fix.box_des1 + "px'" : "";
		var json = [];
		for (var i = 0; i < tmp.txt.length; i++) {
			var txt1 = tmp.txt[i];

			var tmpText = txt1["t"];
			var n = txt1["n"];
			if (n.indexOf("<hr") == 0) { // 分割线
				ss.push("<tr><td class='box_subject' colspan=2>");
				ss.push(n);
				ss.push("</td></tr>");
				continue;
			}
			var rst = this.replace_parameter(d, tmpText);

			if (rst && rst.indexOf('(') >= 0 && rst.indexOf(')') > 0) {
				try {
					rst = eval(rst);
				} catch (e) {

				}
			}

			var v = cfg[n] ? cfg[n].DES : n;
			ss.push("<tr><td class='box_subject'><div class='box_subject1'><nobr>");
			ss.push(v);
			ss.push("</nobr><i class='fa fa-caret-right' style='color:#ccc'></i></div></td>");
			ss.push("<td class='box_des'><div class='box_des1' " + box_des1_fix + ">");
			ss.push(rst + "</div></td></tr>");
			json.push({
				DES : v,
				VAL : rst
			});
		}
		return [ ss.join(""), json ];
	};
	/**
	 * box外壳
	 * 
	 * @returns {___anonymous2849_2853}
	 */
	this.enq_op_main_sub_tb = function() {
		var table = document.createElement('table');
		table.className = "box";
		table.cellSpacing = 0;
		table.cellPadding = 0;

		var tr = table.insertRow(-1);
		var td = tr.insertCell(-1);
		td.vAlign = "top";
		table.setAttribute("onselectstart", "return false;");

		if (this._Cfg._Fix) {
			$(table).css('width', this._Cfg._Fix.width);
		}
		if (this._Cfg.page_color) {
			$(table).css('background', this._Cfg.page_color);
		}
		if (this._Cfg.page_radius) {
			$(table).css('border-radius', this._Cfg.page_radius);
		}
		if (this._Cfg.page_height) {
			$(table).css('height', this._Cfg.page_height);
		}
		return table;
	};
	/**
	 * 替换参数
	 * 
	 * @param data
	 * @param temp
	 * @returns
	 */
	this.replace_parameter = function(data, temp, refData) {
		var exp = temp;
		var s2 = [];
		for ( var n in data) {
			s2["@" + n.toUpperCase()] = data[n];
		}
		if (refData) {
			for ( var n in refData) {
				if (!s2[n]) {
					s2[n] = refData[n];
				}
			}
		}

		var r1 = /\@[a-zA-Z0-9\-\._:]*\b/ig;
		var m1 = temp.match(r1);
		if (m1) {
			for (var i = 0; i < m1.length; i++) {
				var key = m1[i];
				var key1 = key.toUpperCase();
				var v = s2[key1 + '_HTML'] || s2[key1] || "";
				exp = exp.replace(key, v);
			}
		}
		return exp;
	};
	/**
	 * 创建Title
	 * 
	 * @param cfg
	 * @param d
	 * @param tmp
	 * @param refData
	 * @returns
	 */
	this.enq_op_main_sub_title = function(cfg, d, tmp, refData) {
		if (!tmp.title) {
			return "";
		}

		var ss = [];

		if (tmp.img) { // 左边图片
			ss.push("<div class='box_img'>");
			var img;
			if (typeof tmp.img == 'function') {
				img = tmp.img(d);
			} else {
				img = d[tmp.img];
			}

			var u1 = "";
			var blk = "_blank";
			if (img && img != "") {
				u1 = img.replace('_SMAILL', '');
			} else {
				img = EWA.RV_STATIC_PATH + "/EWA_STYLE/images/pic_no.jpg";
			}

			if (tmp.img_click) {
				u1 = "javascript:" + this.replace_parameter(d, tmp.img_click.toString(), refData);
				blk = "";
			}
			ss.push("<table cellpadding=0 cellspacing=0 class='imgtb'><tr><td align=center>");
			if (u1 != "") {
				ss.push("<a target='" + blk + "' href=\"" + u1 + "\">");
			}
			ss.push("<img src='");
			ss.push(img);
			ss.push("' border=0>");
			if (u1 != "") {
				ss.push("</a>");
			}
			ss.push("</td></tr></table>");
			ss.push("</div>");
		}

		if (tmp.title) {
			var css = "box_title";
			var fixWidth = "";

			if (tmp.img) {
				css = "box_title_img";
			}
			if (this._Cfg._Fix) {
				fixWidth = "width:" + this._Cfg._Fix[css] + "px; ";
			}
			if (tmp.title_color) {// 标题颜色
				fixWidth += 'color:' + tmp.title_color;
			}
			ss.push("<div class='" + css + "' style='" + fixWidth + "'>");
			var t = this.replace_parameter(d, tmp.title);
			ss.push(t);
			ss.push("</div>");

		}
		return ss.join('');
	};

	this.add_box_style = function() {
		// defined in EWA_STYLE/skins/box.css
	}
};
var EWA_UI_BoxExt = {
	getFileLen : function(v) {
		if (v == null || isNaN(v)) {
			return v || "";
		}
		if (v > 1024 * 1024 * 1024) {
			return Math.round(v / (1024 * 1024 * 1024) * 100) / 100 + "G";
		}
		if (v > 1024 * 1024) {
			return Math.round(v / (1024 * 1024) * 100) / 100 + "M";
		} else if (v > 1024) {
			return Math.round(v / (1024) * 100) / 100 + "K";
		} else {
			return v + "B";
		}
	},
	openInBox : function(u, title, callBack) {
		if (!$X('EWA_UI_BoxExt_OpenInBox')) {
			var css = [];
			css.push("#EWA_UI_BoxExt_OpenInBox {left: 10px;right: 10px;" + "bottom: 10px;top: 10px;" + "position: fixed; "
				+ "background-color: rgba(127, 127, 127, 0.7);" + "display: none;padding: 5px;z-index: 1010;}");
			css.push("#EWA_UI_BoxExt_OpenInBox .title {height: 30px;background-color: #cdcdcd;font-size: 14px;padding: 4px;}");
			css.push("#open_box .title b {color: #08c;cursor: pointer;}");

			var style = document.createElement("style");
			style.textContent = css.join('\n');
			document.getElementsByTagName('head')[0].appendChild(style);

			var ss = [];
			ss.push("<div id='EWA_UI_BoxExt_OpenInBox'>");
			ss.push("<table width=100% height=100% cellpadding=0 cellspacing=0>");
			ss.push("<tr>");
			ss.push("<td class=\"title\"><b class=\"fa fa-power-off fa-border\"");
			ss.push(" onclick=\"$('#EWA_UI_BoxExt_OpenInBox').hide();isStopMouseWheel = false;\"></b>&nbsp;<span></span></td>");
			ss.push("</tr>");
			ss.push("<tr>");
			ss.push("<td class=\"cnt\" valign=top><div id='open_box_cnt'");
			ss.push(" style='overflow: auto; width: 100%; height: 100%'></div></td>");
			ss.push("</tr>");
			ss.push("</table>");
			ss.push("</div>");
			$('body').append(ss.join(''));

		}
		$('#EWA_UI_BoxExt_OpenInBox').show();
		$('#EWA_UI_BoxExt_OpenInBox .title span').html(title);
		var s = "<iframe width=100% height=100% src='" + u + "' frameborder=0></iframe>";
		$('#EWA_UI_BoxExt_OpenInBox .cnt').html(s);
		if (callBack) {
			callBack();
		}
	}
};
/**
 * EWA 扩展 利用HTML5 input multi 的特性上传文件
 * 
 */
var EWA_Html5UploadClass = function() {
	this.uploadIframes = [];
	this.files = [];
	this.POST_XMLNAME = "";
	this.POST_ITEMNAME = "";
	this.POST_NAME = "";
	this.POST_REF = "";
	this.UPLOAD_STATUS = "";// start,checking,ok ,nofile(没有上传文件)
	this.WAIT_ID = ("ht5upload_wait_" + Math.random()).replace(".", "G");
	this.haveFile = function() {
		for (var i = 0; i < this.files.length; i++) {
			if (this.files[i].value != "") {
				return true;
			}
		}
		return false;
	};
	// 获取值
	this.getValue = function() {
		if (this.uploadIframes.length == 0) {
			if (this.files.length == 0) {
				return "";
			}
		}
		var rst = [];
		for (var i = 0; i < this.uploadIframes.length; i++) {
			var s1 = this.uploadIframes[i];
			var json=eval('(function(){var __json=' + s1+'; return __json;})()');
			for ( var k in json) {
				rst.push(json[k]);
			}
		}
		return JSON.stringify(rst);
	}
	this.fileIco = function(file, id) {
		var path = EWA.RV_STATIC_PATH + "/EWA_STYLE/images/file_png/";
		var fn = file.name.toLowerCase();
		var loc = fn.lastIndexOf('.');
		var ext = "";
		if (loc > 0) {
			ext = fn.substring(loc);
		}
		var src = "gnote.png";
		if (ext == '.doc' || ext == '.docx') {
			src = "MSWD.png";
		} else if (ext == '.xls' || ext == '.xlsx') {
			src = "XCEL.png";
		} else if (ext == '.ppt' || ext == '.pptx') {
			src = "PPT3.png";
		} else if (ext == '.txt' || ext == '.cvs' || ext == '.pom') {
			src = "Edit.png";
		} else if (ext == '.zip' || ext == '.rar' || ext == '.7z') {
			src = "zip.png";
		} else if (ext == '.pdf') {
			src = "ACR_App.png";
		} else if (ext == '.odt') {
			src = "openoffice.png";
		} else if (ext == '.html') {
			src = "html.png";
		}

		$X(id).src = path + src;

	};
	this.showPreview = function(source) {
		console.log(this._name);
		var div = source.parentNode;
		var h = div.outerHTML; // div
		div.style.display = 'none';
		source.setAttribute('ok', 1);
		gFileReaders = {};
		for (var i = 0; i < source.files.length; i++) {
			var file = source.files[i];
			this.showPreview1(div, file);
			this.files.push(file);
		}
		if (this.UpMulti == 'yes') {
			$(div).before(h);
		}
	};
	/**
	 * 添加其它文件，已经上传的 JSON 包含 name,type
	 */
	this.addOther = function(json) {
		var div = $X(this.POST_NAME).parentNode.getElementsByTagName('input')[1].parentNode;
		for (var i = 0; i < json.length; i++) {
			this.showPreview1(div, json[i]);
		}
		this.uploadIframes.push(JSON.stringify(json));
	};
	this.showPreviewExists = function() {
		var u = $('#' + this.POST_NAME).val();
		if (u == '') {
			return;
		}
		try {
			// 如果文件已经存在，则将必输项设为false;
			EWA.F.FOS[this.SYS_FRAME_UNID].setUnMust(this.POST_NAME);
		} catch (e) {

		}
		var div = $('#' + this.POST_NAME).parent().find('.ewa_app_upload_form')[0];
		var id = Math.random();

		var img = document.createElement("img");
		img.id = id;

		var table = document.createElement('table');
		table.cellPadding = 0;
		table.cellSpacing = 0;
		table.className = "ewa_app_upload_form1";
		div.parentNode.appendChild(table);

		var td = table.insertRow(-1).insertCell(-1);
		td.align = 'center';
		td.appendChild(img);
		td.className = 'img';
		td.vAlign = 'middle';
		td = table.insertRow(-1).insertCell(-1);

		var u1 = u.split('/');
		var u2 = u1[u1.length - 1];
		td.innerHTML = "<div title='" + u2 + "'>" + u2 + "</div>";
		td.className = "name";
		// if (u.toLowerCase().endsWith('.png')
		// || u.toLowerCase().endsWith('.jpg')
		// || u.toLowerCase().endsWith('.bmp')
		// || u.toLowerCase().endsWith('.ico')
		// || u.toLowerCase().endsWith('.gif') ||
		// u.toLowerCase().endsWith('.bin')) {
		img.src = u;
		// } else{
		// var file={name:u2};
		// this.fileIco(file, id)
		// }
		var c = this;
		img.onerror = function() {
			var file = {
				name : this.src
			};
			c.fileIco(file, this.id);
		}
	};

	this.showPreview1 = function(div, file) {
		var id = Math.random();

		var img = document.createElement("img");
		img.id = id;

		var table = document.createElement('table');
		table.cellPadding = 0;
		table.cellSpacing = 0;
		table.className = "ewa_app_upload_form1";
		div.parentNode.appendChild(table);

		var td = table.insertRow(-1).insertCell(-1);
		td.align = 'center';
		td.appendChild(img);
		td.className = 'img';
		td.vAlign = 'middle';
		td = table.insertRow(-1).insertCell(-1);
		td.innerHTML = "<div>" + file.name + "</div>";
		td.className = "name";

		// console.log(file)
		if (file.type && file.type.indexOf('image/') == 0) {
			img.src = EWA.RV_STATIC_PATH + "/EWA_STYLE/images/loading2.gif";
			var fr = new FileReader();
			gFileReaders[id] = fr;
			fr.onloadend = function(e) {
				for ( var n in gFileReaders) {
					var o = gFileReaders[n];
					if (o == e.target) {
						$X(n).src = e.target.result;
					}
				}
			};
			fr.readAsDataURL(file);
		}
		this.fileIco(file, id);
	};
	/**
	 * 提交上传文件
	 */
	this.submitUploads = function(refId) {
		this.uploadIframes = [];
		var c = this;
		this.UPLOAD_STATUS = "start";

		try {

			$('input[type=file][ok=1]').each(function(index) {
				var name = this.id.split('$')[1];
				if (c.POST_NAME == name) {
					c.submitUpload(index, this);
				}
			});
		} catch (e) {
			alert(e);
		}

		if (this.uploadIframes.length > 0) {
			window.setTimeout(function() {
				c.UPLOAD_STATUS = "checking";
				c.chkframeSubmt();
			}, 400);
		} else {
			this.UPLOAD_STATUS = "nofile";
		}

	}
	/**
	 * 每个 input 执行一次上传
	 */
	this.submitUpload = function(index, obj) {
		var target = "GDX" + index;
		var ff = document.createElement('iframe');
		ff.id = target;
		ff.name = target;
		document.body.appendChild(ff);
		var objIframe = $(ff);
		objIframe.hide();

		var form = document.createElement('form');
		document.body.appendChild(form);
		form.method = 'post';
		form.enctype = "multipart/form-data"
		form.innerHTML = "<input type=submit>";

		var objForm = $(form);
		objForm.hide();

		var action = EWA.CP + "/EWA_STYLE/cgi-bin/_up_/?xmlname=" + this.POST_XMLNAME + "&ITEMNAME=" + this.POST_ITEMNAME
			+ "&NAME=" + this.POST_NAME + "&EWA_UP_TYPE=SWFUPLOAD&EWA_UP_REF=" + this.POST_REF;

		var frameUnid = obj.id.split('_')[1].split('$')[0];

		var url = EWA.F.FOS[frameUnid].Url;

		var u1 = new EWA_UrlClass();
		u1.SetUrl(url);
		for ( var n in u1._Paras) {
			if (n.toUpperCase().indexOf("EWA") == 0) {
				continue;
			}
			action += "&" + n + "=" + u1._Paras[n];
		}
		//console.log(u1);

		objForm.attr('action', action);
		objForm.append(obj);
		objForm.attr("target", target);

		this.uploadIframes.push(objIframe[0]);

		setTimeout(function() {
			objForm.submit();
		}, 400);

	};
	// 检查文件是否上传完毕
	this.chkframeSubmt = function() {
		var inc = 0;
		for (var i = 0; i < this.uploadIframes.length; i++) {
			var iframe = this.uploadIframes[i];
			if (typeof iframe == "string") {
				inc++;
				continue;
			}
			if (iframe.contentDocument && iframe.contentDocument.body) {
				var s = GetInnerText(iframe.contentDocument.body);

				if (s.indexOf(']') >= 0 && s.indexOf('[') >= 0) {
					$('form[target=' + iframe.id + ']').remove();
					$(iframe).remove();
					this.uploadIframes[i] = s;
				} else {
					if (s.trim() != '') {
						alert('系统执行错误：' + s);
						return;
					}
				}
			}
		}
		if (inc == this.uploadIframes.length) {
			this.UPLOAD_STATUS = "ok";
			// alert(this.UPLOAD_STATUS);
		} else {
			var c = this;
			window.setTimeout(function() {
				c.chkframeSubmt();
			}, 100);
		}
	};
	this.createWaitBox = function() {
		if (!$X(this.WAIT_ID)) {
			var div = document.createElement('div');
			div.id = this.WAIT_ID;
			var tb = $('body');
			$(div).css({
				'width' : 300,
				height : 100,
				'line-height' : '100px',
				'font-size' : '16px',
				'position' : 'fixed',
				'top' : tb.height() / 2 - 70 / 2,
				'left' : tb.width() / 2 - 300 / 2,
				'z-index' : 12838,
				'background-color' : 'f0f0f0',
				'color' : '#08c',
				'border-radius' : '10px',
				opacity : 0.9
			});
			div.innerHTML = "<table height=100% align=center><tr><td><img src='" + EWA.RV_STATIC_PATH
				+ "/EWA_STYLE/images/loading2.gif'></td><td>请等待文件上传完毕...</td></table>";
			tb.append(div);
		}
	};
	this.removeWaitBox = function() {
		$("#" + this.WAIT_ID).remove();
	};
}