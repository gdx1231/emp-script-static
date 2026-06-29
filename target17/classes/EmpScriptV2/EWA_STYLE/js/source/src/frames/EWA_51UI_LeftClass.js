function EWA_UI_LeftClass() {
	this.crm_cfg = null;
	this.map = null;
	this.lastmd = null;
	this.parentId = null;
	this.objSearch = null;
	this.objSearchGrp = null;
	this.objRecords = null;
	this.objContent = null;
	this.instanceName = null; // 实例化的变量名
	this.sortExp = null;
	this.searchExp = null;
	this.Create = function (json) {
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
		init_htmls.push("<td width=230><div id='div_" + this.parentId + "' class=\"items\"></div></td>");

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

		var p = $X("div_" + this.parentId);

		this.objContent = p;
		var s1 = '<div class="search_box" onselectstart="return false">'
			+ this.create_grp()
			+ '<div class=" fa fa-search" style="width:100%"><input class="search" onkeyup="'
			+ this.instanceName
			+ '.do_search()" placeholder="search"  onselectstart="return true">'
			+ "</div></div><div class='search_records'><b class='fa fa-quote-left'></b>&nbsp;记录数：<i></i><b class='fa fa-chevron-up records-gotop'></b></div>";
		$('body').append(s1);

		this.objSearch = $('.search')[0];
		if (this.map.grp && this.map.grp.length > 0) {
			this.objSearchGrp = $('.search-grp')[0];
		} else {
			this.objContent.style.top = '31px';
			$('.search_box').css("height", 30);
		}
		this.objRecords = $('.search_records i')[0];

		$('.search_records .records-gotop').click(function () {
			$(".items").first().scrollTop(0)
		});

		this.page_size = 50;
		if (this.map['page_size']) {
			this.page_size = this.map['page_size'];
		} else {
			this.page_size = 50;
		}
		// 获取数据
		this.load_data();
		this.current_page = 1;
	};
	this.scroll_check = function (obj) {
		if (obj.scrollHeight - obj.scrollTop > obj.clientHeight * 1.2) {
			return;
		}
		if (this.current_page * this.page_size >= this.total_records) {
			return;
		}
		if (this.is_load_data) {
			return;
		}
		this.load_more();
	};
	this.load_more = function () {
		if (this.current_page) {// 当前PAGE
			this.current_page++;
		} else {
			this.current_page = 2;
		}
		this._load_datas();
	}
	this.create_grp = function () {
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
	this.create_sort = function () {
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
	this.hide = function (o) {
		this.objContent.style.display = 'none';
		this.objContent.parentNode.style.backgroundColor = '#f1f1f1';
		this.objSearch.parentNode.parentNode.style.display = 'none';
		this.objRecords.parentNode.style.display = 'none';
		var c = this;
		this.objContent.parentNode.onclick = function () {
			c.show();
		};
		this.objContent.parentNode.appendChild(o);
		this.hideButton = o;

		$(this.objContent.parentNode).animate({
			width : '30px'
		}, 300);
	};
	this.show = function () {
		this.objSearch.parentNode.appendChild(this.hideButton);
		var c = this;

		$(this.objContent.parentNode).animate({
			width : '230px'
		}, 300, function () {
			c.objContent.parentNode.style.backgroundColor = '';
			c.objContent.style.display = '';
			c.objRecords.parentNode.style.display = '';
			c.objSearch.parentNode.parentNode.style.display = '';

		});
	}
	this.do_sort = function (v, obj) {
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
	this.do_grp = function (obj) {
		this.current_page = 1;
		this._load_datas();
	};
	this.do_filter = function (obj) {
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
	this.do_search = function () {
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
	this._load_datas = function () {
		this.is_load_data = true; // 当前数据加载中
		var u = $U2(this.map.XMLNAME, this.map.ITEMNAME, this.map._URL_PARAS, true);

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
		u += "&EWA_PAGESIZE=" + this.page_size;
		var c = this;

		// 当多次提交查询请求时，ajax返回的顺序和查询的顺序不一致，
		// 因此只保留最后一次查询的结果
		var post_time = new Date().getTime(); // ajax提交时间
		this._load_datas_post_time = post_time; // 最后一次提交时间

		$J(u, function (v) {
			if (post_time != c._load_datas_post_time) {
				// ajax提交时间和记录的最后一次提交时间不一致，抛弃
				return;
			}
			c.total_records = v.RECORDS;
			c.show_pages();
			c.show_data(v.DATA, [ true ]);
			c.is_load_data = false; // 当前数据加载完毕
		});
	};
	this.show_sort = function (obj, evt) {
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
	this.load_data = function () {
		var fos;
		if (EWA && EWA.F && EWA.F.FOS) {
			for ( var n in EWA.F.FOS) {
				var fos1 = EWA.F.FOS[n];
				if (fos1.LEFT_CLASS == this) {
					fos = fos1;
					break;
				}
			}
		}
		var paras = {};
		if (fos) {
			var url = fos.Url;
			var u2 = new EWA_UrlClass();
			u2.SetUrl(url);
			for ( var n in u2._Paras) {
				if (n == 'XMLNAME' || n == "ITEMNAME" || n == 'EWA_LEFT') {
					continue;
				}
				paras[n] = u2._Paras[n];
			}
		}
		var u2 = new EWA_UrlClass();
		u2.SetUrl(window.location.href);
		for ( var n in u2._Paras) {
			if (n == 'XMLNAME' || n == "ITEMNAME" || n == 'EWA_LEFT') {
				continue;
			}
			paras[n] = u2._Paras[n];
		}
		paras["EWA_FRAMESET_NO"] = 1;
		paras["EWA_AJAX"] = "json_ext1";

		var ss = [];
		for ( var n in paras) {
			var v = (paras[n] || "") + "";
			ss.push(n + "=" + v.toURL());
		}
		this.map._URL_PARAS = ss.join("&");
		var u = $U2(this.map.XMLNAME, this.map.ITEMNAME, this.map._URL_PARAS, true);
		// console.log(u)
		if (this.objSearchGrp) {
			u += "&" + this.objSearchGrp.value;
		}
		u += "&EWA_PAGESIZE=" + this.page_size;
		$J(u, this.load_data1, this);

	};
	this.create_filter = function (json) {
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
	this.checkTextChange = function (obj) {
		var old = obj.getAttribute('old');
		var v = obj.value.trim();
		if (old == v) {
			return;
		}
		obj.setAttribute('old', v);
		this.do_filter(obj.parentNode);
	};
	this.load_data1 = function (v, args) {
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

		// console.log(c.total_records)
		var sort = c.create_sort();

		$(c.objSearch).parent().append(sort);

		var jsFrameUnid = v.FRAME_UNID;
		EWA_Utils.JsRegister(v.JSFRAME);
		var json = EWA.F.FOS[jsFrameUnid]._SearchJson;
		// console.log(json);

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
	this.show_pages = function () {
		var total_pages = Math.ceil(this.total_records / this.page_size);
		this.objRecords.innerHTML = this.total_records + ', ' + this.current_page + '/ ' + total_pages;
	}
	this.load_after = function () {
		// replace your function
	};
	this.show_data = function (datas, args) {
		var o = $(this.objContent);
		if (this.current_page == 1) {
			if (args != null && args.length > 0 && args[0] == true) {
				o.find('.item').remove();
			}
		}
		for (var i = 0; i < datas.length; i++) {
			var d = datas[i];
			var chd = this.show_data1(d, i);
			o.append(chd);
		}
		if (this.load_after) {
			this.load_after();
		}
	};
	this.show_data1 = function (d, index) {
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
		var idxLength = this.total_records ? this.total_records : this.page_size;
		var idxWidth = 8 * ((idxLength < 10 ? 10 : idxLength) + "").split('').length + 2;
		h1.innerHTML = "<span class=idx style='width:" + idxWidth + "px'>"
			+ (index + 1 + (this.current_page - 1) * this.page_size) + "</span>" + title;
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
			if (!this.CFG_MAP[id]) {
				continue;
			}
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
	this.create_item_wf = function (d) {
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
	this.md = function (obj) {
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
		var add_paras = $U();
		if (add_paras) {
			u += "&" + add_paras;
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
	this.replace_parameter = function (data, temp, refData) {
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
