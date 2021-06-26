/**
 * 根据ListFrame定义,绘制Box对象
 */
function EWA_UI_BoxClass() {
	this._ClassName = ("_eWAbOX" + Math.random()).replace(".", "$");
	window[this._ClassName] = this;

	this._REF_DATA = null;
	this._JSON_URL = null;
	this._Cfg = null;

	/**
	 * 加载Json数据
	 * 
	 * @param cfg
	 *            配置信息
	 */
	this.Create = function(cfg) {
		this._Cfg = cfg;
		// 查找本类的对应的 FOS(listframe)
		if (EWA.F && EWA.F.FOS) {
			for ( var n in EWA.F.FOS) {
				var fos = EWA.F.FOS[n];
				if (fos.BOX_CLASS == this) {
					this.FOS = fos;
				}
			}
		}
		if (this.FOS) {
			var u1 = new EWA_UrlClass(this.FOS.Url);
			if (u1.GetParameter("EWA_BOX_PARENT_ID")) { // 根据参数设定新的parent_id
				var new_pid = u1.GetParameter("EWA_BOX_PARENT_ID");
				if ($X(new_pid)) {
					this._Cfg.parent_id = new_pid;
				}
			}
		}
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

		this.initBoxSize();
		// this.add_box_style();
		var u2 = new EWA_UrlClass();
		u2.SetUrl(this.FOS.Url);

		var pagesize = u2.GetParameter("EWA_PAGESIZE");
		var pagecur = u2.GetParameter("EWA_PAGECUR");

		if (pagesize && !isNaN(pagesize)) {
			this._Cfg.EWA_PAGESIZE = pagesize;
		} else {
			this._Cfg.EWA_PAGESIZE = this._Cfg.EWA_PAGESIZE || 10;
		}
		if (pagecur && !isNaN(pagecur)) {
			this._Cfg.EWA_PAGECUR = pagecur;
		} else {
			this._Cfg.EWA_PAGECUR = this._Cfg.EWA_PAGECUR || 1;
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
			var u1 = new EWA_UrlClass();
			u1.SetUrl(this.FOS.Url);
			u1.AddParameter("EWA_AJAX", "JSON_EXT1");
			u1.AddParameter("ewa_frameset_no", "1");
			for ( var n in this._Cfg) {
				var n1 = n.toUpperCase();
				if (n1.indexOf('EWA_') == 0) {
					var v1 = this._Cfg[n];
					if (v1) {
						u1.AddParameter(n1, v1);
					}
				}
			}
			this._JSON_URL = u = u1.GetUrl();
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
		if (!EWA.F.FOS[v.FRAME_UNID]) {// 如果没有Jsframe则加载,否则抛弃
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
		// 执行模板定义的CallBack事件
		if (tmp.callback) {
			try {
				if (typeof tmp.callback == 'function') {
					tmp.callback(fromClass);
				} else {
					eval(tmp.callback);
				}
			} catch (e) {
				console.log("EWA_UI_BoxClass->tmp.callback" + e);
				console.log(tmp.callback);
			}
		}
		// 执行关联的 FramClass 的 ReloadAfter事件
		if (EWA && EWA.F && EWA.F.FOS) {
			for ( var n in EWA.F.FOS) {
				var o = EWA.F.FOS[n];
				if (o.BOX_CLASS == fromClass && o.ReloadAfter) {
					try {
						o.ReloadAfter(fromClass);
					} catch (e) {
						console.log("EWA_UI_BoxClass->EWA->ReloadAfter" + e);
						console.log(o.ReloadAfter);
					}
				}
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
		var o=$X(this._ClassName + "_records");
		if(o){
			o.innerHTML = s;
		}
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
			try {
				if (f.T == 'fix') { // 选择
					ss.push("<select onchange='" + this._ClassName + ".do_filter(this)' search_type='" + f.T + "' search_tag='"
						+ n + "'>");
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
						+ "' onclick=\"EWA.UI.Calendar.Pop(this)\" search_tag='" + n + "' search_type='" + f.T
						+ "' old='' onblur='" + this._ClassName + ".checkTextChange(this)' type=text placeholder=\""
						+ map1[n].DES + "\"/> <input style='width:43%' id='" + rid + "_1' old='' onblur='" + this._ClassName
						+ ".checkTextChange(this)' onclick=\"EWA.UI.Calendar.Pop(this)\" type=text placeholder=\"" + map1[n].DES
						+ "\"/></div>");
				}
			} catch (e) {
				console.log(e);
				console.log(n);
				console.log(f);
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
				$Tip('已经到页尾了');
				return;
			}
			this._Cfg.EWA_PAGECUR = p1;
			this.load_box_data();
		} else if (cla.indexOf('fa-backward') > 0) {
			var p1 = this._Cfg.EWA_PAGECUR * 1 - 1;
			if (p1 == 0) {
				$Tip('已经到页头了');
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
		if (this.FOS) {
			this.FOS._PageSize = p;
		}
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
		if(!pobj){
			return;
		}
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
			$(mTb).addClass('ewa-box-first');
		} else {
			// 按钮
			this.enq_op_main_sub_box_but(pobj);
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
			mTd.attr('json_ref', JSON.stringify(arr[i]));
		}
		$(pobj).find('.box_des1').each(function() {
			this.title = GetInnerText(this);
		});
		$(pobj).append('<div style="clear:both"></div>');
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
		if (!this.enq_op_main_sub_last_menu) {
			var o = document.createElement('div');
			o.className = "box_menus";
			o.setAttribute("onselectstart", "return false");
			document.body.appendChild(o);
			this.enq_op_main_sub_last_menu = $(o);
			this.enq_op_main_sub_last_menu.css("z-index", 1000000);
		}
		this.enq_op_main_sub_last_menu.html(menubox.innerHTML);
		this.enq_op_main_sub_last_menu.attr("json_ref", obj.parentNode.getAttribute('json_ref'))
		var o1 = $(obj);
		var p = o1.offset();
		// console.log(o1);
		// console.log(p)
		this.enq_op_main_sub_last_menu.show();
		var menu_height = this.enq_op_main_sub_last_menu.height() ;
		var window_height= $('body').height();
		//如果超出窗口高度，则显示到底部，否则显示在下部
		var top = p.top +menu_height> window_height ? p.top - menu_height - 10
			: p.top;
		this.enq_op_main_sub_last_menu.css({
			left : p.left - 110,
			top : top,
			width : 110
		});

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
			var evt = c._ONCLICK || c.EWA_ONCLICK || c.EWA_CLICK;
			if (evt == null || evt == "") {
				continue;
			}

			var des = c.DES;
			if (c.NAME.toUpperCase() == 'BUTDELETE') {
				delete_menu = c;
				continue;
			} else if (c.NAME.toUpperCase() == 'BUTMODIFY') {
				des = "<b class='fa fa-edit'></b>" + c.DES;
			} else if (c.NAME.toUpperCase() == 'BUTADD') {
				des = "<b class='fa fa-plus'></b>" + c.DES;
			} else {
				des = "<b class='fa'></b>" + c.DES;
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
		a.href = "javascript:void(0)";
		a.setAttribute("onclick", js + ";" + this._ClassName + ".enq_op_main_close_menu(event,this);");
		a.setAttribute("box_menu_item", "yes");
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
			ss.push("<tr class='ewa-box-" + n + "'><td class='box_subject'><div class='box_subject1'><nobr>");
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
		if (tmp.img) { // 左边图片 -背景图
			ss.push("<div class='box_img'>");
			var img;
			if (typeof tmp.img == 'function') {
				img = tmp.img(d);
			} else {
				img = d[tmp.img];
			}

			var u1 = "";
			var blk = "_blank";
			var click = "";
			if (img && img != "") {
				u1 = img.replace('_SMAILL', '');
			} else {
				img = EWA.RV_STATIC_PATH + "/EWA_STYLE/images/pic_no.jpg";
			}

			if (tmp.img_click) {
				click = this.replace_parameter(d, tmp.img_click.toString(), refData);
				blk = "";
			}
			ss.push("<a class='imgtb' style='background-image:url(" + img + ")' ");
			if (click) {
				ss.push(" href='javascript:void(0)' onclick=\"" + click + "\" ");
			} else if (u1 != "") {
				ss.push(" target='" + blk + "' href=\"" + u1 + "\" ");
			}
			ss.push("></a>");
			ss.push("</div>");
		}
		// if (tmp.img1) { // 左边图片
		// ss.push("<div class='box_img'>");
		// var img;
		// if (typeof tmp.img == 'function') {
		// img = tmp.img(d);
		// } else {
		// img = d[tmp.img];
		// }
		//
		// var u1 = "";
		// var blk = "_blank";
		// if (img && img != "") {
		// u1 = img.replace('_SMAILL', '');
		// } else {
		// img = EWA.RV_STATIC_PATH + "/EWA_STYLE/images/pic_no.jpg";
		// }
		//
		// if (tmp.img_click) {
		// u1 = "javascript:" + this.replace_parameter(d,
		// tmp.img_click.toString(),
		// refData);
		// blk = "";
		// }
		// ss.push("<table cellpadding=0 cellspacing=0 class='imgtb'><tr><td
		// align=center>");
		// if (u1 != "") {
		// ss.push("<a target='" + blk + "' href=\"" + u1 + "\">");
		// }
		// ss.push("<img src='");
		// ss.push(img);
		// ss.push("' border=0>");
		// if (u1 != "") {
		// ss.push("</a>");
		// }
		// ss.push("</td></tr></table>");
		// ss.push("</div>");
		// }

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

var EWA_UI_BoxExt = {
	getFileLen : function(v) {
		return EWA.UI.Ext.FileLen(v);
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