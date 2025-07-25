// --------------------class of Frame -------------------
function EWA_FrameClass() {
	this.Xml = null;
	this._Ajax = null;
	this.ItemList = new EWA_FrameCommonItems(); // EWA_01FrameCommonItems.js
	this.Resources = {};
	this.Url = null;
	this._ValidExOk = null;
	this._ValidExFail = null;
	this._ValidExObj = null;
	this._Id = null;
	// this.ReloadAfter = null; // POST后的事件，用户定义
	// 替代ReloadAfter
	this.doPostAfter = null;// POST后的事件，用户定义
	this.isShowPostWaitting = true; // 是否显示提交时的等待框

	this.textareaAutoSize = function() {
		// /third-party/autosize-master/dist/autosize.min.js
		if (!window.autosize) {
			console.warn('autosize.js 没有引入，/third-party/autosize-master/dist/autosize.min.js');
			return;
		}
		autosize(this.getObj('textarea').addClass('ewa-textarea-auto-size'));
	};

	this.getObj = function(exp) {
		var tb = $('#EWA_FRAME_' + this._Id);
		if (exp) {
			return tb.find(exp);
		} else {
			return tb;
		}
	};
	/**
	* 开关元素变化后调用的Action
	* @param source input[type=checkbox]元素
	* @param actionName 提交到后台的 action
	 */
	this.switchButtonAction = function(source, actionName) {
		if (!actionName) {
			return;
		}
		let u1 = this.getUrlClass();
		let data = {};
		data.ewa_switch_name = source.name;
		data.ewa_action = actionName;
		data.ewa_ajax = 'json';
		data.ewa_switch = source.checked ? 'on' : 'off';
		let parent = source.parentNode;
		let names = parent.getAttributeNames();
		// 附加父元素的属性，可在配置中定义元素属性
		for (let n in names) {
			let name = names[n];
			let val = parent.getAttribute(name);
			if (name.indexOf('on') == 0 || name == 'name' || name == 'id' || name == 'class') {
				continue;
			}
			data[name] = val;
		}
		let that = this;

		let u = u1.GetUrl();
		$JP(u, data, function(rst) {
			// 可以外部定义回调函数 extSwitchCallBack
			if (that.extSwitchCallBack) {
				that.extSwitchCallBack(source, rst);
			}
		});
	};
	/**
	 * 设置为禁止修改状态
	 */
	this.setDisable = function() {
		var tb = this.getObj();
		tb.find("input,textarea,select,label").each(function() {
			if (!this.disabled && this.type != 'hidden') {
				this.disabled = true;
				this.setAttribute("ewadisabled", 1);
			}
		});
		tb.find(".EWA_DHTML").each(function() {
			if (this.tagName == "DIV") { // 老版本的dhtml
				var iframe = $(this).find("iframe")[0].contentWindow;
				var tt = setInterval(function() {
					if (iframe.document.readyState == 'complete') {
						window.clearInterval(tt);
						iframe.frames[0].document.body.contentEditable = false;
						iframe.frames[0].document.body.style.backgroundColor = "#eee";
						var o = iframe.document.getElementsByClassName('but')[0];
						o.style.pointerEvents = 'none';
						o.style.filter = "grayscale(1) opacity(0.8)";
					}
				}, 300);
			} else if (this.tagName == "TEXTAREA") { // 新版本的h5
				var target = $(this).parent();
				var tt = setInterval(function() {
					var qiframe = target.find("iframe");
					if (qiframe.length > 0) {
						var iframe = qiframe[0].contentWindow;
						if (iframe && iframe.document.readyState == 'complete') {
							window.clearInterval(tt);
							iframe.document.body.contentEditable = false;
							iframe.document.body.style.backgroundColor = "#eee";

							target.find(".ewa-editor").attr('ewadisabled', 1);
						}
					}
				}, 300);
			}
		});
	};
	/**
	 * 设置为允许修改状态
	 */
	this.setEnable = function() {
		var tb = this.getObj();
		tb.find("input,textarea,select,label").each(function() {
			if (this.disabled && this.getAttribute("ewadisabled")) {
				this.disabled = false;
				this.removeAttribute("ewadisabled");
			}
		});
		tb.find(".EWA_DHTML").each(function() {
			if (this.tagName == "DIV") {
				var iframe = $(this).find("iframe")[0].contentWindow;
				iframe.frames[0].document.body.contentEditable = true;
				iframe.frames[0].document.body.style.backgroundColor = "";
				var o = iframe.document.getElementsByClassName('but')[0];
				o.style.pointerEvents = '';
				o.style.filter = "";
			} else if (this.tagName == "TEXTAREA") {
				var target = $(this).parent();
				var qiframe = target.find("iframe");
				var iframe = qiframe[0].contentWindow;
				iframe.document.body.contentEditable = true;
				iframe.document.body.style.backgroundColor = "";

				target.find(".ewa-editor").removeAttr('ewadisabled');
			}
		});
	};
	/**
	 * 将 checkbox 按照字母进行排序
	 * 
	 * @checkboxTargetId checkbox的id
	 * @filterTargetId 放置A-Z字母的位置
	 * @charFieldName 字母的json字段名称
	 * @isMergeCell 是否合并 checkboxTarget ，EWA_TD_L隐含，EWA_TD_M colspan=2
	 * @callBackConverted 转换完毕的回调成
	 * @callBackDoFilter 点击字母的回调
	 * 
	 */
	this.convertFilterCheckbox = function(checkboxTargetId, filterTargetId, charFieldName, isMergeCell,
		callBackConverted, callBackDoFilter) {
		var map = {};
		var trCheckBox = this.getObj('.ewa-row-' + checkboxTargetId);
		var trfilter = this.getObj('.ewa-row-' + filterTargetId);

		// 放置已经选择的checkbox
		var oChecked = $("<div class='ewa-filter-checked'></div>");
		trCheckBox.find('#' + checkboxTargetId).prepend(oChecked).addClass('ewa-filter-chks');

		var mainID = this._Id;
		function moveToChecked(obj) {
			var o = $('<nobr></nobr>');
			oChecked.append(o);
			oChecked.append(" ");

			var chkParent = $(obj).parent(); // nobr
			var id = $(obj).attr('id') + "_" + mainID;
			chkParent.attr('id', id);
			o.append(chkParent.children());
			o.attr('ref_id', id);
		}
		function moveToUnChecked(obj) {
			var chkParent = $(obj).parent();
			var ref_id = chkParent.attr('ref_id');
			if (ref_id) { // 没有表示不在 ewa-filter-checked 里
				$('#' + ref_id).append(chkParent.children());
				chkParent.remove();
			}
		}

		if (!charFieldName) {
			charFieldName = 'PY';
		}

		trCheckBox.find('input[type=checkbox]').each(function() {
			var o = JSON.parse($(this).attr('json'));
			var py = o[charFieldName]; // 获取字母
			if (!py) {
				return;
			}
			py = py.toUpperCase().trim().substring(0, 1);
			if (!map[py]) {
				map[py] = [];
			}
			map[py].push(this.id);

			if (this.checked) {
				moveToChecked(this)
			}

			$(this).on('change', function() {
				if (this.checked) {
					moveToChecked(this);
				} else {
					moveToUnChecked(this);
				}
			});
		});
		var codes = 'A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z'.split(',');
		var ss = ["<a class='ewa-filter-char ewa-filter-char-all' code=''>ALL</a>"];
		for (var n in codes) {
			var c = codes[n];
			var arr = map[c];
			if (!arr) {
				continue;
			}
			var s = "<a class='ewa-filter-char' code='" + c + "'>" + c + "<span class='ewa-filter-char-num'>("
				+ arr.length + ")</span></a>";
			ss.push(s);
		}
		trfilter.find('.EWA_TD_M').html(ss.join(" "));
		if (isMergeCell) {
			trCheckBox.find('.EWA_TD_L').hide();
			trCheckBox.find('.EWA_TD_M').attr('colspan', 2);
		}

		trfilter.find('a.ewa-filter-char').on('click', function() {
			var c = $(this).attr('code');
			trCheckBox.find('input[type=checkbox]').each(function() {
				if (c) {
					if (!this.checked) {
						if ($(this).parent().attr('ref_id')) {
							// 在 ewa-filter-checked 里
							moveToUnChecked(this);
						}
						$(this).parent().hide();
					} else {
						oChecked.append($(this).parent());
					}
				} else { // 显示全部
					$(this).parent().show();
				}
			});
			if (!c) {
				return;
			}
			var arr = map[c];
			for (var i = 0; i < arr.length; i++) {
				trCheckBox.find('#' + arr[i]).parent().show();
			}

			if (callBackDoFilter) {
				callBackDoFilter(this, trCheckBox, trfilter);
			}
		});

		if (callBackConverted) {
			callBackConverted(trCheckBox, trfilter);
		}
	};
	/**
	 * 通过ajax创建带字母过滤器的多选框,多用于人员筛选
	 * 
	 * @param checkboxTarget
	 *            放checkbox的对象
	 * @param filterTarget
	 *            放字母筛选的对象
	 * @param initvlas
	 *            用","分割的初始化值
	 * @param ajaxUrl
	 *            获取数据的ajax请求地址
	 * @param idName
	 *            值的字段名称,例如usr_id
	 * @param textName
	 *            显示的字段名称,例如usr_name
	 * @param pyName
	 *            用于筛选的字母字段
	 */
	this.createFilterCheckbox = function(checkboxTarget, filterTarget, initvals, ajaxUrl, idName, textName, pyName) {
		var c = this;
		$J(ajaxUrl, function(rst) {
			c.createFilterCheckboxByData(checkboxTarget, filterTarget, initvals, rst, idName, textName, pyName);
		});
	};
	/**
	 * 创建带字母过滤器的多选框,多用于人员筛选
	 * 
	 * @param checkboxTarget
	 *            放checkbox的对象
	 * @param filterTarget
	 *            放字母筛选的对象
	 * @param initvlas
	 *            用","分割的初始化值
	 * @param data
	 *            多行记录
	 * @param idName
	 *            值的字段名称,例如usr_id
	 * @param textName
	 *            显示的字段名称,例如usr_name
	 * @param pyName
	 *            用于筛选的字母字段
	 */
	this.createFilterCheckboxByData = function(checkboxTarget, filterTarget, initvals, data, idName, textName, pyName) {
		var pys = {};
		var init_vals = init_vals ? "[]" : initvals.split(',');

		// 初始化值的 map
		var init_vals_map = {};
		for (var n in init_vals) {
			var v = init_vals[n];
			init_vals_map[v] = 1;
		}

		var htmls = [];
		var htmls_checked = [];
		var id_prefix = checkboxTarget.id;
		for (var n in data) {
			var d = data[n];
			var id = d[idName];
			if (id) {
				id = id.replace(/</ig, '&lt;');
			}
			var text = d[textName];
			if (text) {
				text = text.replace(/</ig, '&lt;');
			}
			var py = d[pyName];
			var checked = init_vals_map[id]; // 是否选中

			var ckAdm = [];
			ckAdm.push("<nobr class='ewa-filter-chk' style='float:left;margin-right:4px'>");
			ckAdm.push("<input class=\"ewa-filter-chkbox\" type=\"checkbox\" ");
			if (checked) {
				ckAdm.push(" checked ");
			}
			var tid = id_prefix + "_" + n;
			ckAdm.push(" value=\"" + id + "\" id=\"" + tid + "\" name=\"" + id_prefix + "\"><label ");
			ckAdm.push(" for=\"" + tid + "\">" + text + "</label></nobr>");

			if (checked) {
				htmls_checked.push(ckAdm.join(""));
			} else {
				htmls.push(ckAdm.join(""));
			}
			if (filterTarget) {
				var pya = py ? py.substring(0, 1).toUpperCase() : "";
				if (!pys[pya]) {
					pys[pya] = [];
				}
				pys[pya].push(tid);
			}
		}

		checkboxTarget.innerHTML = htmls_checked.join(" ") + " " + htmls.join(" ");

		if (!filterTarget) {
			return;
		}
		var filters = ['<a href="javascript:void(0)">ALL</a>'];
		for (var n = 'A'.charCodeAt(); n <= 'Z'.charCodeAt(); n++) {
			var alpha = String.fromCharCode(n);
			if (pys[alpha]) {
				var s = '<a href="javascript:void(0)">' + alpha + '</a>';
				filters.push(s);
			}
		}
		filterTarget.innerHTML = filters.join(" ");
		$(filterTarget).find('a').each(function() {
			var alpha = $(this).text();
			if (alpha != 'ALL') {
				$(this).attr('ids', pys[alpha].join(","));
			}

			$(this).on('click', function() {
				if ($(this).text() == 'ALL') {
					$(checkboxTarget).find('nobr.ewa-filter-chk').show();
					return;
				}
				var ids = $(this).attr('ids').split(',');
				var ids_map = {};
				for (var n in ids) {
					ids_map[ids[n]] = 1;
				}
				$(checkboxTarget).find('input.ewa-filter-chkbox').each(function() {
					if (this.checked || ids_map[this.id]) {
						$(this).parent().show();
					} else {
						$(this).parent().hide();
					}
				});
			});
		});
	}
	/**
	 * 隐含没有内容的行
	 */
	this.hiddenNoContentRow = function() {
		var names = 'img,a,input[type=text],input[type=button],textarea';
		let tb = this.getObj();
		this.getObj('.EWA_TD_M').each(function() {
			if ($(this).text() == '') {
				if ($(this).find(names).length == 0) {
					$(this).parent().hide();

					// 用于上下排列的隐含
					var id = $(this).find("*:eq(0)").attr('id');
					if (id) {
						var cname = ".ewa-row-" + id;
						tb.find(cname).hide().attr('hiddennocontentrow', 1);
					}
				}
			}
		});
	};

	/**
	 * 重新刷新select的内容
	 * 
	 * @param itemName
	 *            select对象的名称（id）
	 * @param defaultValue
	 *            默认值
	 * @afterEvent 加载完成后的事件
	 */
	this.itemReload = function(itemName, defaultValue, afterEvent) {
		if (!itemName) {
			return;
		}
		var u1 = new EWA_UrlClass(this.Url);
		u1.AddParameter("EWA_AJAX", "SELECT_RELOAD");
		u1.AddParameter("EWA_RELOAD_ID", itemName);
		// 当前表单上的所有元素同时提交，避免因为上下元素关联出现问题
		this.getObj('input,select').each(function() {
			if (this.name == itemName) {
				return;
			}
			if (this.value.length < 100) {
				u1.AddParameter(this.name, this.value);
			}
		});
		var u = u1.GetUrl();
		var o = this.getObj("#" + itemName)[0];
		let map = {};
		// 记录刷新前的数据
		for (let i = 0; i < o.options.length; i++) {
			let opt = o.options[i];
			map[opt.value] = 1;
		}
		$J(u, function(rst) {
			if (!rst.RST) {
				$Tip(rst.ERR);
				return;
			}
			var items = rst.ITEM.LST;
			o.options.length = 0;
			let newCount = [];
			for (var n in items) {
				var item = items[n];
				if (item.V && map[item.V]) {
					// 对比刷新前的数据，新数据放在最前面
					continue;
				}
				var opt = new Option(item.T, item.V);
				if (item.json) {
					$(opt).attr("json", item.json);
				}
				o.options[o.options.length] = opt;
				newCount.push(opt);
				item._used = true;
			}
			for (var n in items) {
				var item = items[n];
				if (item._used) {
					continue;
				}
				// 添加老数据
				var opt = new Option(item.T, item.V);
				if (item.json) {
					$(opt).attr("json", item.json);
				}
				o.options[o.options.length] = opt;
			}
			if (defaultValue) {
				o.value = defaultValue;
			} else {
				for (let n in newCount) {
					if (newCount[n].value) {
						o.value = newCount[n].value;
						break;
					}
				}
			}
			if (afterEvent) {
				try {
					afterEvent(rst, o);
				} catch (e) {
					console.log(e);
				}
			}
		});
	};
	/**
	 * 检查option的变化
	 */
	this._checkSelectOptionsChange = function() {
		if (!this._SelectFilters) {
			return;
		}
		var c = this;
		if (this.isSelectFilter) {
			setTimeout(function() {
				c._checkSelectOptionsChange();
			}, 311);
		}
		for (var n in this._SelectFilters) {
			var o = this._SelectFilters[n];
			//var h = $($X(o.id)).html();
			let h = this.getObj('#' + o.id).html();
			if (h != o.html) {
				c._selectOptionsChangeed(o);
			}
		}
		setTimeout(function() {
			c._checkSelectOptionsChange();
		}, 311);
	};
	this._selectOptionsChangeed = function(o) {
		//console.log('changed')
		var target = this.getObj("select#" + o.id);

		var id1 = "initSelectFilter" + this._Id + "-" + o.id + "-filter";
		var id2 = "initSelectFilter" + this._Id + "-" + o.id + "-filter2";

		// 选择code
		var options = this._initSelectFilterCreateCode(o.codeJsonFrom || o.filterFrom, target);
		this.getObj('#' + id1).html(options);
		this.getObj('#' + id2).html("");
		o.html = target.html();
	};
	this._initSelectFilterCreateCode = function(codeJsonFrom, target) {
		var ss = ["<option value=''>-ALL-</option>"];
		if (!(codeJsonFrom)) {
			// 放置26个字母（A-Z）
			for (var a = 'A'.charCodeAt(); a <= 'Z'.charCodeAt(); a++) {
				var v = String.fromCharCode(a);
				ss.push('<option value="' + v + '">' + v + "</option>");
			}
		} else {
			var map = {};
			var arr = [];
			target.find("option").each(function() {
				if (this.value == '') {
					return;
				}
				var code;
				if (this.hasAttribute("para_" + codeJsonFrom)) {
					code = this.getAttribute("para_" + codeJsonFrom);
				} else if (this.getAttribute('json')) {
					var json = JSON.parse(this.getAttribute('json'));
					code = json[codeJsonFrom];
				}
				if (!code) {
					return;
				}
				if (!map[code]) {
					map[code] = 1;
					arr.push(code);
				} else {
					map[code] += 1;
				}
			});
			var arr1 = arr.sort();
			for (var n in arr1) {
				var v = arr1[n];
				v = v.replace(/>/ig, '&lt;').replace(/"/, '&quot;');
				ss.push('<option value="' + v + '">' + v + " [" + map[v] + "]</option>");
			}
		}

		return ss.join("");
	};
	/**
	 * 创建 select的 按照A-Z字母的筛选 ，字母判断来源为option的value,text或json
	 * 
	 * @param obj_id
	 *            来源的ID
	 * @param filterType
	 *            筛选的类型（value,text或json）
	 * @param filterFrom
	 *            如果是json的话，对应的字段
	 */
	this.initSelectFilter = function(obj_id, filterType, filterFrom, codeJsonFrom) {

		if (this["INIT_SELECT_FILTER" + obj_id]) { // 创建过了
			return;
		}

		this["INIT_SELECT_FILTER" + obj_id] = true;
		// console.log(obj_id, filterType, filterFrom);

		// 要做筛选的select
		var target = this.getObj("select#" + obj_id);
		// 筛选的select 所在的 TD
		var td = target.parent();

		var id1 = "initSelectFilter" + this._Id + "-" + obj_id + "-filter";
		var id2 = "initSelectFilter" + this._Id + "-" + obj_id + "-filter2";
		var id_tb = "initSelectFilter" + this._Id + "-" + obj_id + "-filter-table";

		if ($X(id_tb)) {
			td.append(target);
			$($X(id_tb)).remove();
		}
		// console.log(id_tb);
		td.addClass('ewa-select-filter');

		// 创建一个table,第一个单元格放字母的select和隐含的select(作为模板)，第二个单元格放 要做筛选的select
		var ss = ["<table id='" + id_tb + "' cellpadding=0 cellspacing=0 width=100%><tr>"
			+ "<td class='ewa-select-filter-char'>" + "<select class='EWA_SELECT' style='margin-right:4px' id='"
			+ id1 + "' onchange='EWA.F.FOS[\"" + this._Id + "\"]._chCode(this,\"" + filterType + "\",\""
			+ filterFrom + "\")'>"];

		// 选择code
		var options = this._initSelectFilterCreateCode(codeJsonFrom || filterFrom, target);
		ss.push(options);

		ss.push("</select><select id='" + id2 + "' style='display:none'></select></td>"
			+ "<td class='ewa-select-filter-target'></td></tr>" + "</table>");

		td.prepend(ss.join(''));
		td.find('.ewa-select-filter-target').append(target);

		if (!this._SelectFilters) {
			this._SelectFilters = {};
		}
		var o = {};
		o.html = target.html();
		o.id = obj_id;
		o.filterType = filterType;
		o.filterFrom = filterFrom;
		o.codeJsonFrom = codeJsonFrom;

		this._SelectFilters[o.id] = o;
	};

	/**
	 * select筛选发生变化时，显示不同的select列表（options）
	 */
	this._chCode = function(obj, filterType, filterFrom) {
		this.isSelectFilter = true;
		var hide = $(obj).next();
		var target = $(obj).parent().parent().find(".ewa-select-filter-target select");
		if (hide[0].options.length == 0) {
			hide.html(target.html());
		}
		if (obj.value == '') {
			target.html(hide.html());
			return;
		}
		var ss = ['<option></option>'];
		for (var i = 1; i < hide[0].options.length; i++) {
			var opt = hide[0].options[i];
			if (this._chCodeFilter(opt, filterType, filterFrom, obj.value)) {
				ss.push(GetOuterHTML(opt));
			}
		}

		target.html(ss.join(''));
		this._SelectFilters[target[0].id].html = target.html();

		this.isSelectFilter = false;
	};
	/**
	 * 检查option规定部分的首字母是否是规定字母（例如B）
	 */
	this._chCodeFilter = function(opt, filterType, filterFrom, chkValue) {
		var id;
		if (filterType == 'json') {
			var json = JSON.parse(opt.getAttribute('json'));
			var id = json[filterFrom];
			if (filterFrom == 'ADM_LID') {
				// 针对ADM_USER的特殊处理部分，遗留的问题，不改了
				var ids = id.split('.');
				id = ids[ids.length - 1];
			}
		} else if (filterType == 'text') {
			id = opt.text;
		} else {
			id = opt.value;
		}
		if (id) {
			var len = chkValue.length;
			if (id.substring(0, len).toUpperCase() == chkValue.toUpperCase()) {
				return true;
			} else {
				return false;
			}
		} else {
			return false;
		}
	};

	/**
	 * 设置为非必填项
	 */
	this.setUnMust = function(name) {
		var a = this.ItemList.Items[name.toUpperCase()];
		if (a) {
			var b = a.getElementsByTagName("IsMustInput")[0].getElementsByTagName("Set")[0];
			b.setAttribute("IsMustInput", 0);
		}
	};
	/**
	 * 设置必填项
	 */
	this.setMust = function(name) {
		var a = this.ItemList.Items[name.toUpperCase()];
		if (a) {
			var b = a.getElementsByTagName("IsMustInput")[0].getElementsByTagName("Set")[0];
			b.setAttribute("IsMustInput", 1);
		}
	};

	this.RedrawCreateSpans = function() {
		var trs = this.getObj('tr');
		for (var i = 0; i < trs.length; i++) {
			var tr = trs[i];
			if (tr.style.display == 'none') {
				continue;
			}
			var spans = 0;
			var isStart = false;
			for (var ia = tr.cells.length - 1; ia >= 0; ia--) {
				var td = tr.cells[ia];
				if (td.style.display == 'none') {
					if (isStart) {
						spans++;
					} else {
						spans = 1;
						isStart = true;
					}
				} else {
					if (isStart) {
						td.colSpan = spans + 1;
						isStart = false;
					}
				}
			}
		}
		// 改写脚本
		EWA_FrameShowAlert = EWA_FrameShowAlert1;
		EWA_FrameRemoveAlert = EWA_FrameRemoveAlert1;
		this.getObj('.ewa_d1').each(function() {
			this.title = this.innerHTML;
		});

		for (var name in this.ItemList.Items) {
			var dess = this.GetItemDescription(name);
			var memo = dess.Memo;
			if (memo != null && memo.trim().length > 0) {
				this.getObj('#' + name).attr('placeHolder', memo);
				this.getObj('#' + name).attr('title', memo);
			}
		}

		// 调整宽度
		this.RedrawChangWidth();
	};
	/**
	 * 获取元素的描述，Info和Memo
	 */
	this.GetItemDescription = function(itemName) {
		return this.ItemList.GetDescription(itemName);
	};
	this.ShowPlaceHolder = function(colSpan) {
		var tb = this.getObj();
		tb.addClass('ewa-frame-cols-' + colSpan);
		for (var name in this.ItemList.Items) {
			// name 是大写，所以取真实id
			var real_name = this.ItemList.GetValue(name, "Name", 'Name');
			var o = this.GetObject(real_name);
			if (!o) {
				continue;
			}

			o = $(o);

			var dess = this.GetItemDescription(name);
			var memo = dess.Memo;
			var info = dess.Info;
			var ph = null;
			if (colSpan == 1 || o.parent().attr('colspan')) {
				ph = info;
				if (memo && memo != ph) {
					if (o.attr('ewa_tag') == 'smsValid') { // 短信验证码
						ph = memo;
					} else {
						// memo信息放到对象的下部
						//var memoStr = "<div class='ewa-item-memo'>" + memo + "</div>";
						//o.parentsUntil('tr').last().append(memoStr); // td
						ph += ", " + memo;
					}
				}
				if (o.hasClass('ewa-switch')) {
					o.prepend("<div class='ewa-switch-info'>" + ph + "</div>");
				}
			} else if (colSpan == 2) {
				if (memo != null && memo.trim().length > 0) {
					ph = memo;
				}
			}

			if (!ph) {
				continue;
			}

			if (o[0].type == 'hidden') {
				o.prev().attr('placeholder', ph); // ddl
			} else if (o[0].tagName == 'SELECT') {
				if (o[0].options.length > 0 && o[0].options[0].value == '') {
					o[0].options[0].text = "-- " + ph + " --";
					o[0].options[0].value = '';
				}
			} else {
				o.attr('placeHolder', ph);
				o.attr('title', ph);
			}
		}
	};
	// 调整宽度
	this.RedrawChangWidth = function() {
		let tb = this.getObj();
		let tb_width = tb.width();
		let cols = tb.find('.ewa_msg_box')[0].colSpan / 2;
		let info_width = 90;
		$("#EWA_FRAME_" + this._Id + ">tbody>tr[class*='ewa-row-']:not('.ewa-row-msg-box')").each(function() {
			let info_cols = $(this).find("td.ewa_redraw_info:visible").length;
			let ctl_width = (tb_width - info_width * info_cols) / cols;
			$(this).find("td.ewa_redraw_ctl:visible").each(function() {
				let colspan = this.colSpan || 1;
				$(this).css('width', ctl_width * colspan);
			});
		});

		var c = this;
		addEvent(window, 'size', function() {
			c.RedrawChangWidth();
		});
	};
	this.Mearge = function(fromId, toId, mergeStr) {
		console.log('拼写错误：请用 Merge');
		this.Merge(fromId, toId, mergeStr);
	};
	this.Merge = function(fromId, toId, mergeStr, cb) {
		this.merges(toId, [toId, fromId], mergeStr, cb);
	};
	/**
	 * 合并多个对象到一个对象 2025-06-24
	 * @param {*} toParentId  合并的目标对象ID
	 * @param {*} itemIds 需要合并的对象ID列表，可以是字符串或数组
	 * @param {*} isAddMemo  是否添加备注信息
	 * @param {*} func 回调函数，执行完调用的程序
	 * @returns 
	 */
	this.merges = function(toParentId, itemIds, isAddMemo, func) {
		if (!toParentId || !itemIds || itemIds.length == 0) {
			return;
		}
		if (typeof itemIds == 'string') {
			itemIds = itemIds.split(',');
		}
		let ss = [];
		ss.push("<table class='ewa-merge-table' cellpadding=0 cellpadding=0><tr>");
		for (let i = 0; i < itemIds.length; i++) {
			let id = (itemIds[i] + "").trim();
			let s = `<td class='ewa-merge-td ${i === 0 ? "ewa-merge-td-first " : ""}
				${i === itemIds.length - 1 ? "ewa-merge-td-last " : ""}
			'>@@${id}</td>`;
			ss.push(s);
		}
		ss.push("</tr></table>");
		this.MergeExp(toParentId, ss.join(""), isAddMemo, func);
	}
	/**
	 * 合并表达式
	 * 
	 * @param toParentId
	 *            防止合并内容的容器
	 * @param mergeExp
	 *            合并表达式
	 * @param isAddMemo
	 *            是否添加备注信息
	 * @func 执行完调用的程序
	 */
	this.MergeExp = function(toParentId, mergeExp, isAddMemo, func) {
		if (!mergeExp) {
			console.log("mergeExp 没有设置");
			return;
		}
		// meargeExp="@id1 x @id2 = @id3 (@id4)"
		var r1 = /\@\@[a-zA-Z0-9\-\._:]*\b/ig;
		var m1 = mergeExp.match(r1);
		var paras = [];
		var tmp_html = mergeExp;
		var memos = {};
		var tb = this.getObj();
		for (var i = 0; i < m1.length; i++) {
			var key = m1[i];
			paras.push(key);
			var id = key.replace('@@', '');
			let td = tb.find('.ewa-row-' + id);
			let must = td.hasClass('ewa-row-must') ? "ewa-row-must" : "";
			let span = "<span class='ewa-row-merge " + must + " ewa-row-merge-" + id + "' mid=\"" + id + "\"></span>";
			tmp_html = tmp_html.replace(key, span);
			if (id != toParentId) {
				td.hide().addClass('ewa-row-merge-hide')
					.attr('hiddennocontentrow', 1); // 避免groupshow显示
			}
			memos[id] = this.GetItemDescription(id).Info;
		}
		// console.log(memos);
		// console.log(paras);

		// console.log(tmp_html);

		// 临时容器
		var o1 = document.createElement('div');
		o1.style.display = 'none';
		o1.innerHTML = tmp_html;
		document.body.appendChild(o1);
		// console.log(o1);
		var target = tb.find('[id="' + toParentId + '"]');
		if (target.length == 0) {
			console.log('not find ' + toParentId);
			return;
		}

		// 合并对象的容器
		var p = target.parent();

		for (var n in paras) {
			var exp = paras[n];
			var key = exp.replace('@@', '');
			var o = tb.find('[id="' + key + "\"]");
			if (o.length == 0) {
				console.log('not found [id=' + key + "]");
				continue;
			}

			var t = $(o1).find('span[mid="' + key + '"]');
			if ('placeholder' == isAddMemo) {
				o.attr('placeholder', memos[key]);
			} else if (isAddMemo) {
				t.append("<span class='ewa-row-merge-memo'></span>");
				t.find('.ewa-row-merge-memo').text(memos[key]);
			}
			// 找到目标对象的父容器 
			let itemParent = tb.find('.ewa-row-' + key + ' .EWA_TD_M');
			if (itemParent.length == 0) {
				//找不到父容器，只能放在目标对象
				t.append(o);
			} else {
				// 将目标对象的所有内容放在父容器中
				while (itemParent[0].childNodes.length > 0) {
					t.append(itemParent[0].childNodes[0]);
				}
			}
			// t.append(o);
		}
		//将临时容器下的所有对象放到目标容器里toParentId
		while (o1.childNodes.length > 0) {
			p.append(o1.childNodes[0]);
		}
		$(o1).remove();

		if (func) {
			func(p);
		}
	};
	this.MergeItems = function() {
		for (var n in this.MeargeMap) {
			var m = this.MeargeMap[n];
			var o1 = $X('_ewa_tr$' + n);
			if (!o1) {
				continue;
			}
			var span = o1.cells.length;
			var pp = $(o1.cells[0]);
			while (o1.cells.length > 1) {
				pp.append(o1.cells[1].innerHTML);
				o1.removeChild(o1.cells[1]);
			}
			o1.cells[0].colSpan = span;

			var ss = [];
			for (var i = 0; i < m.length; i++) {
				var o2 = $X('_ewa_tr$' + m[i]);

				// console.log(o2)
				var ss1 = ["<nobr>"];

				for (var k = 0; k < o2.cells.length; k++) {
					ss1.push(o2.cells[k].innerHTML);
				}
				ss1.push("</nobr>");
				ss.push(ss1.join(" "));

				o2.parentNode.removeChild(o2);
			}
			pp.append(ss.join(" "));
		}
	};

	this.LoadJson = function(actionName, func) {
		if (actionName == null) {
			return;
		}
		var u = this.Url + '&EWA_ACTION=' + actionName + '&EWA_AJAX=JSON';
		$J(u, func);
	};

	/**
	 * 调用ACTION
	 * 
	 * @param obj
	 *            调用DoAction的HTML对象
	 * @param action
	 *            调用的Action名称
	 * @param confirm
	 *            执行前确认的信息 _EWA_INFO_MSG定义
	 * @param tip
	 *            执行后提示的信息 _EWA_INFO_MSG定义
	 * @param parasArray
	 *            附加的参数数组, 参数用对象表示para.Name, para.Value
	 * @param afterJs
	 *            执行后调用的脚本
	 */
	this.DoAction = function(obj, action, confirm, tip, parasArray, afterJs) {
		EWA.F.CID = this._Id;
		if (action == null || action.trim() == "") {
			// alert("action not value");
			return;
		}

		if (confirm != null && confirm.trim().length > 0) {
			var msg = _EWA_INFO_MSG[confirm];
			if (!(msg == null || msg == "")) {
				if (!window.confirm(msg)) {
					return;
				}
			} else {
				if (!window.confirm(confirm)) {
					return;
				}
			}
		}
		this.DoPostBefore();

		this._Ajax = this.CreateAjax(null, true);
		this._Ajax.LoadingType = "image";
		this._Ajax.AddParameter("EWA_AJAX", "1");
		this._Ajax.AddParameter("EWA_ACTION", action);
		this._Ajax.AddParameter("EWA_ID", this._Id);
		this._Ajax.AddParameter("EWA_NO_CONTENT", "1");
		this._Ajax.AddParameter("EWA_ACTION_TIP", tip);

		if (afterJs != null && afterJs.trim().length > 0) {
			this._Ajax.AddParameter("EWA_AFTER_EVENT", afterJs);
			// DoAction 指定了提交后的脚本，阻止页面重新加载
			this.StopAjaxAfterReload = true;
			this._Ajax.AddParameter("EWA_ACTION_RELOAD", "0");
		} else {
			this.StopAjaxAfterReload = false;
		}

		if (parasArray != null && parasArray.length > 0) { // 附加的参数
			for (var i = 0; i < parasArray.length; i += 1) {
				this._Ajax.AddParameter(parasArray[i].Name, parasArray[i].Value);
			}
		}
		var url = new EWA.C.Url();
		url.SetUrl(this.Url);
		var u = url.RemoveParameter("EWA_ACTION");
		this._Ajax.PostNew(u, EWA.F.FOS[EWA.F.CID]._CallBackJs);
	};
	this.GuideShowCreate = function(infos) {
		this._GroupInfos = infos;

		var tb = $X('EWA_FRAME_' + this._Id);
		var maxIdx = infos.length - 1;

		tb.setAttribute('EWA_GUIDE_IDX', "0");
		tb.setAttribute('EWA_GUIDE_IDX_MAX', maxIdx);

		// 隐藏按钮
		var row1 = tb.rows[tb.rows.length - 1];
		row1.style.display = 'none';
		if (tb.clientHeight > 100) {
			tb.parentNode.style.height = tb.clientHeight + 'px';
		}
		// 添加向导按钮
		var ipt0 = document.createElement("input");
		ipt0.id = "ewa_but_" + Math.random();
		ipt0.type = "button";
		ipt0.value = (EWA.LANG == 'enus') ? "Back" : "上一步";
		ipt0.style.display = 'none';
		ipt0.onclick = function() {
			var idx = tb.getAttribute('EWA_GUIDE_IDX');
			if (idx * 1 == 0) {
				$Tip('到头了');
				return;
			}
			var id = tb.id.replace('EWA_FRAME_', '');
			// 执行下一步执行前的事件
			if (EWA.F.FOS[id].GuidePrevBefore) {
				EWA.F.FOS[id].GuidePrevBefore(idx, this, tb);
			}
			EWA.F.FOS[id].GuideShow(idx * 1 - 1);

			// 执行下一步执行后的事件
			if (EWA.F.FOS[id].GuidePrevAfter) {
				EWA.F.FOS[id].GuidePrevAfter(idx, this, tb);
			}
		};
		var ipt1 = document.createElement("input");
		ipt1.id = "ewa_but_" + Math.random();
		ipt1.type = "submit";
		ipt1.value = EWA.LANG == 'enus' ? "Next" : "下一步";
		ipt1.onclick = function() {
			var idx = tb.getAttribute('EWA_GUIDE_IDX');
			var id = tb.id.replace('EWA_FRAME_', '');
			if (EWA.F.FOS[id].GuideShowCheck(idx)) {
				// 执行下一步执行前的事件
				if (EWA.F.FOS[id].GuideNextBefore) {
					EWA.F.FOS[id].GuideNextBefore(idx, this, tb);
				}
				if (this.getAttribute('ewa_guide_method') == 'ok') {
					$F(tb, 'input', 'type', 'submit')[0].click();
				} else {
					EWA.F.FOS[id].GuideShow(idx * 1 + 1);
				}
				// 执行下一步执行后的事件
				if (EWA.F.FOS[id].GuideNextAfter) {
					EWA.F.FOS[id].GuideNextAfter(idx, this, tb);
				}
			}
		};
		// 上层表添加一行放向导按钮
		let parentTable = tb.parentNode.parentNode.parentNode.parentNode.parentNode;
		var row2 = parentTable.insertRow(-1);
		var td = row2.insertCell(-1);

		td.appendChild(ipt0);
		td.appendChild(ipt1);
		td.className = "EWA_FRAME_GROUP_BUTTONS";

		// 上层表添加一行 提示行
		var rowTitle = parentTable.insertRow(0);
		tdTitle = rowTitle.insertCell(-1);
		var id1 = 'ewa_title_' + Math.random();
		var titles = [];
		for (var i = 0; i < this._GroupInfos.length; i++) {
			var a = '<div style="float:left" id="ewa_' + this._Id + '_' + i + '">' + (i + 1) + ". "
				+ this._GroupInfos[i].DES + '</div>';
			titles.push(a);
		}
		tdTitle.innerHTML = "<div style='text-align:left'>"
			+ titles.join(" <div style='float:left;color:#aaa'>&nbsp;&gt;&nbsp;</div> ") + "</div><div id='" + id1
			+ "'></div>";
		tdTitle.className = 'EWA_FRAME_GROUP_TITLE';
		tb.setAttribute('EWA_GUIDE_ID_PREV', ipt0.id);
		tb.setAttribute('EWA_GUIDE_ID_NEXT', ipt1.id);
		tb.setAttribute('EWA_GUIDE_ID_TITLE', id1);

		this.GuideShowTitle(0);

		var div = document.createElement("div");
		if (tb.clientHeight > 100) {
			div.style.width = tb.clientWidth + 'px';
			div.style.height = tb.clientHeight + 20 + 'px';
			div.style.overflow = 'auto';
		}
		tb.parentNode.appendChild(div);
		div.appendChild(tb);
		tb.parentNode.className = "EWA_GROUP_GUIDE";
	};
	this.GuideShowTitle = function(idx) {
		var tb = $X('EWA_FRAME_' + this._Id);
		// var tdTitle=$X(tb.getAttribute('EWA_GUIDE_ID_TITLE'));
		// var nums=['一','二','三','四','五','六','七','八','九','十'];
		// tdTitle.innerHTML="<div>第"
		// +nums[idx]+"步 "+ this._GroupInfos[idx].DES+"</div>";
		var maxIdx = tb.getAttribute('EWA_GUIDE_IDX_MAX');
		for (var i = 0; i <= maxIdx; i++) {
			var id = 'ewa_' + this._Id + '_' + i;
			if (i == idx) {
				$X(id).style.color = 'blue';
				$X(id).style.borderBottom = '2px solid green';
			} else {
				$X(id).style.color = 'green';
				$X(id).style.borderBottom = '2px';
			}
		}

	};

	this.GuideShowCheck = function(idx) {
		var isOk = true;

		var firstObj = null;
		for (var name in this.ItemList.Items) {
			var node = this.ItemList.Items[name];
			var name1 = this.ItemList.GetItemValue(node, "Name", "Name");

			var obj = this.getObj("#" + name1);
			if (obj.length == 0) {
				//alert(name1 + ' not exists');
				continue;
			}
			obj = obj[0];
			var tr = this._GetTr(obj);
			if (tr == null) {
				continue;
			}
			if (tr.getAttribute('groupindex') == idx) {
				isOk = isOk & this.CheckValid(obj);
				if (!isOk && firstObj == null) {
					firstObj = obj;
				}
			}
		}

		if (firstObj != null) {
			firstObj.focus();
		}
		return isOk;
	};
	this._GetTr = function(obj) {
		var inc = 0;
		var o = obj;
		while (inc < 100) {
			inc++;
			o = o.parentNode;
			try {
				if (o.tagName.toUpperCase() == 'TR' && o.getAttribute('id') != null
					&& o.getAttribute('id').indexOf('_ewa_tr$') == 0) {
					return o;
				}
			} catch (e) {
				return null;
			}
		}
		return null;
	};
	this.GuideShow = function(idx) {

		this.GuideShowTitle(idx);

		var tb = $X('EWA_FRAME_' + this._Id);
		var curIdx = tb.getAttribute('EWA_GUIDE_IDX');

		if (curIdx == idx) {
			return;
		}
		var maxIdx = tb.getAttribute('EWA_GUIDE_IDX_MAX');
		var idPrev = tb.getAttribute('EWA_GUIDE_ID_PREV');
		var idNext = tb.getAttribute('EWA_GUIDE_ID_NEXT');
		if (idx == maxIdx) {
			$X(idNext).value = EWA.LANG == 'enus' ? "Confirm" : '确定';
			$X(idNext).setAttribute('ewa_guide_method', 'ok');
		} else {
			$X(idNext).value = EWA.LANG == 'enus' ? "Next" : '下一步';
			$X(idNext).setAttribute('ewa_guide_method', '');
		}
		if (idx == 0) {
			$X(idPrev).style.display = 'none';
		} else {
			$X(idPrev).style.display = '';
		}
		tb.setAttribute('EWA_GUIDE_IDX', idx);
		this._ShowHidenGroup(tb, idx);

	};
	this._ShowHidenGroup = function(tb, newIdx) {
		for (var i = 0; i < tb.rows.length - 1; i++) {
			var row = tb.rows[i];
			var idx = 0;
			if (row.getAttribute('groupIndex') != null && row.getAttribute('groupIndex') != '') {
				idx = row.getAttribute('groupIndex') * 1;
				if (newIdx == idx) {
					row.style.display = '';
				} else {
					row.style.display = 'none';
				}
			}
		}
	};
	this.GroupShow = function(obj, grpIdx) {
		if (obj.className.indexOf('1') > 0) {
			return;
		}
		// 切换前处理 2017-10-25 郭磊
		if (this.GroupShowBefore) {
			this.GroupShowBefore(obj, grpIdx);
		}

		var tb = $X('EWA_FRAME_' + this._Id);
		var objParentTr = obj.parentNode.parentNode;
		for (var i = 0; i < tb.rows.length; i++) {
			var row = tb.rows[i];
			if (row == objParentTr) {
				continue;
			}
			// 按钮行
			if (row.cells.length == 1 && row.cells[0].className && row.cells[0].className.indexOf('EWA_TD_B') >= 0) {
				continue;
			}
			// hiddenNoContentRow 执行隐含的行
			if (row.getAttribute('hiddennocontentrow') == '1') {
				continue;
			}
			var idx = 0;
			if (row.getAttribute('groupIndex') != null && row.getAttribute('groupIndex') != '') {
				idx = row.getAttribute('groupIndex') * 1;
			}
			if (grpIdx == idx) {
				row.style.display = '';
			} else {
				row.style.display = 'none';
			}
		}
		var objs = objParentTr.getElementsByTagName('div');
		for (var i = 0; i < objs.length; i++) {
			var o = objs[i];
			if (o == obj) {
				o.className = o.className + '1';
			} else {
				o.className = o.className.replace('1', '');
			}
		}
		// 切换后处理 2017-10-25 郭磊
		if (this.GroupShowAfter) {
			this.GroupShowAfter(obj, grpIdx);
		}
	};
	/**
	 * 调用JSON
	 * 
	 * @param {String}
	 *            action 调用的Action名称
	 * @param {String}
	 *            jsonName 返回Json的名称
	 * @param {Array}
	 *            parasArray 参数数组 Name,Value对象数组
	 * @param {Function}
	 *            afterJs 执行后调用的Js
	 */
	this.DoActionJSON = function(action, jsonName, parasArray, afterJs) {
		EWA.F.CID = this._Id;

		this._Ajax = new EWA.C.Ajax();
		this._Ajax.LoadingType = "image";
		this._Ajax.AddParameter("EWA_AJAX", "JSON");
		this._Ajax.AddParameter("EWA_ACTION", action);
		this._Ajax.AddParameter("EWA_ID", this._Id);
		this._Ajax.AddParameter("EWA_JSON_NAME", jsonName);
		if (afterJs != null) {
			this._AjaxJsonAfter = afterJs;
		} else {
			this._AjaxJsonAfter = null;
		}

		if (parasArray != null && parasArray.length > 0) { // 附加的参数
			for (var i = 0; i < parasArray.length; i += 1) {
				this._Ajax.AddParameter(parasArray[i].Name, parasArray[i].Value);
			}
		}
		var url = new EWA.C.Url();
		url.SetUrl(this.Url);
		var u = url.RemoveParameter("EWA_ACTION");
		this._Ajax.PostNew(u, EWA.F.FOS[EWA.F.CID]._CallBackJs);
	};

	this._CallBackJs = function() {
		var ewa = EWA.F.FOS[EWA.F.CID];
		var ajax = ewa._Ajax;
		if (ajax._Http.readyState != 4) {
			ajax = null;
			return;
		}
		ajax.HiddenWaitting();

		if (ajax._Http.status == 200) {
			var ret = ajax._Http.responseText;
			if (EWA.F.CheckCallBack(ret)) {
				eval(ret);
				if (ewa._AjaxJsonAfter) {
					ewa._AjaxJsonAfter();
					ewa._AjaxJsonAfter = null;
				}
				// guolei 2017-04-17
				try {
					if (ewa.ReloadAfter) {
						ewa.ReloadAfter(ret);
					}
					// eval(ret);
				} catch (e) {
					alert(ret);
				}
			}
		} else {
			alert("ERROR:\r\n" + ajax._Http.statusText);
		}
		ajax = null;
	};
	/**
	 * 覆盖Frame的提示信息
	 * 
	 * @param {Array}
	 *            infoJson 信息对象
	 * @param {String}
	 *            idName id名称
	 * @param {String}
	 *            infoName info字段名称
	 * @param {String}
	 *            memoName memo字段名称
	 * @param cb 循环info回调的方法，p0当前tr，p1当前info, p2当前序号
	 * @return 影响的Tr数组
	 */
	this.RewriteInfo = function(infoJson, idName, infoName, memoName, cb) {
		var tb = $('this.getObj()_' + this._Id);
		var arr = [];
		idName = idName || "id";
		infoName = infoName || "info";
		memoName = memoName || "memo";
		for (var i = 0; i < infoJson.length; i++) {
			var v = infoJson[i];
			var id = v[idName];
			var target = tb.find('#' + id);
			if (target.length == 0) {
				continue;
			}
			var tr = target.parentsUntil('tr[show_msg]').last().parent();
			if (v[infoName] == null || v[infoName].trim() == '') {
				tr.hide();
				if (cb) {
					cb(tr[0], v, i);
				}
				continue;
			}
			if (tr[0].cells.length == 3) {
				arr.push(tr[0]);
				tr[0].cells[2].innerHTML = v[memoName];
				tr[0].cells[0].innerHTML = v[infoName];
				if (cb) {
					cb(tr[0], v, i);
				}
			} else if (tr[0].cells.length == 2) {
				arr.push(tr[0]);
				tr[0].cells[0].innerHTML = v[infoName];
				if (cb) {
					cb(tr[0], v, i);
				}
			} else if (tr[0].cells.length == 1) {
				var tr1 = tr.prev();
				if (tr1[0].cells.length > 1) {
					tr1[0].cells[1].innerHTML = v[memoName];
				}
				arr.push(tr1[0]);
				tr1[0].cells[0].innerHTML = v[infoName];
				if (cb) {
					cb(tr1[0], v, i);
				}
			}

		}
		return arr;
	};

	this._HiddenMemo = function(obj, tb) {
		var td = obj.parentNode
		var tr = td.parentNode;
		var isNone = false;
		if (tr.style.display == 'none') {
			isNone = true;
		}
		tr.style.display = 'none';
		tr.id = 'tr_' + obj.id;
		var tr1 = tr.previousSibling;
		if (tr1.nodeType == 3) {
			tr1 = tr1.previousSibling;
		}
		tr1.style.display = 'none';

		var id1 = obj.id;
		var s1 = '<span id=tab_' + id1 + ' class="ewa_merge_tab" onclick="EWA.F.FOS[\'' + this._Id
			+ '\'].ShowMemo(this.id);">' + tr1.cells[0].innerHTML + '</span>';

		return isNone ? "" : s1;
	};
	this.ShowMemo = function(id) {
		var tabs = $X(this._Id + '__ewa_meger').getElementsByTagName('SPAN');
		for (var i = 0; i < tabs.length; i++) {
			var id1 = tabs[i].id.replace('tab_', 'tr_');
			if (tabs[i].className == 'ewa_merge_tab1') {
				tabs[i].className = 'ewa_merge_tab';
				$X(id1).style.display = 'none';
			}

			if (tabs[i].id == id) {
				tabs[i].className = 'ewa_merge_tab1';
				$X(id1).style.display = '';
			}
		}
	};
	/**
	 * 合并备注字段
	 */
	this.MergeMemo = function() {
		var tb = $X('EWA_FRAME_' + this._Id);
		var objs = tb.getElementsByTagName('textarea');
		if (objs.length == 0) {
			return;
		}
		if (objs[0].getAttribute('ewa_merge') == "1") {
			return;
		}
		var s = [];
		for (var i = 0; i < objs.length; i++) {
			var ss = this._HiddenMemo(objs[i]);
			ss = '<nobr>' + ss.replace('• ', '').trim() + '</nobr>';
			s.push(ss);
		}

		var obj = objs[0];
		var td = obj.parentNode;
		var tr = td.parentNode;
		var tr1 = tr.previousSibling;
		if (tr1.nodeType == 3) {
			tr1 = tr1.previousSibling;
		}
		tr1.id = this._Id + '__ewa_meger';
		// tr1.deleteCell(0);
		tr1.cells[0].colSpan = 3;
		tr1.cells[0].innerHTML = s.join('');
		tr1.cells[0].style.width = '100%';
		tr1.cells[0].style.height = '25px';
		tr1.style.display = '';
		tr.style.display = '';
		$X('tab_' + obj.id).className = 'ewa_merge_tab1';

		if (window._EWA_DialogWnd != null) {
			EWA.UI.Dialog._SetTitle(window._EWA_DialogWnd);
		}
	};

	/**
	 * 扩展验证
	 * 
	 * @param {Object}
	 *            验证对象
	 * @param {String}
	 *            验证模式 Js 或 Action
	 * @param {Object}
	 *            调用的 Js
	 * @param {Object}
	 *            调用的 Action
	 * @param {Object}
	 *            验证成功信息
	 * @param {Object}
	 *            验证失败信息
	 */
	this.DoValidEx = function(obj, vxMode, vxJs, vxAction, vxOk, vxFail) {
		if (obj.value == "") {
			return;
		}
		this._ValidExOk = this.Resources[vxOk];
		this._ValidExFail = this.Resources[vxFail];
		this._ValidExObj = obj;
		if (vxMode.toLowerCase().trim() == "action") {
			this._DoValidExAction(obj, vxAction, this.Resources[vxOk].GetInfo(), this.Resources[vxFail].GetInfo());
		} else {// 脚本验证
			if (vxJs.indexOf('&quot;') >= 0) {
				vxJs = vxJs.replace(/\&quot\;/ig, '"');
			}
			var a = eval(vxJs); // 调用脚本，返回true or false
			if (a) {
				EWA_FrameShowAlert(obj, this._ValidExOk.GetInfo());
				obj.setAttribute('EWA_VALID_EX', "");
			} else {
				EWA_FrameShowAlert(obj, this._ValidExFail.GetInfo());
				obj.setAttribute('EWA_VALID_EX', this._ValidExFail.GetInfo());
			}
		}
	};
	this._DoValidExAction = function(obj, vxAction, okmsg, errmsg) {
		if (obj == null) {
			return;
		}

		if ($(obj).is(":hidden")) { // 隐含了
			return;
		}

		if (vxAction == null || vxAction.trim() == "") {
			alert("action not value");
			return;
		}

		var tag = obj.id + "," + obj.value;
		if (this["DoValidExAction_RETS"] && this["DoValidExAction_RETS"][tag] != null) {
			var a = this["DoValidExAction_RETS"][tag];
			if (a == 0) {
				EWA_FrameRemoveAlert(obj, okmsg);
				obj.setAttribute('EWA_VALID_EX', "");
			} else {
				EWA_FrameShowAlert(obj, errmsg);
				obj.setAttribute('EWA_VALID_EX', errmsg);
			}

			return;
		}
		var _Ajax = new EWA.C.Ajax();
		_Ajax.LoadingType = "image";
		_Ajax.AddParameter("EWA_AJAX", "HAVE_DATA"); // 是否有数据，如果有返回1，否则返回0
		_Ajax.AddParameter("EWA_ACTION", vxAction);
		_Ajax.AddParameter("EWA_ID", this._Id);
		_Ajax.AddParameter("EWA_NO_CONTENT", "1");
		_Ajax.AddParameter(obj.id, obj.value);

		if (!this["DoValidExAction_RETS"]) {
			this["DoValidExAction_RETS"] = {};
		}

		var c = this;

		_Ajax.PostNew(this.Url, function() {
			if (_Ajax._Http.readyState != 4) {
				return;
			}
			_Ajax.HiddenWaitting();
			if (_Ajax._Http.status == 200) {
				var ret = _Ajax._Http.responseText;
				if (EWA.F.CheckCallBack(ret)) {
					// obj.setAttribute('show_alert', 0);
					try {

						var a = parseInt(ret.trim());
						c["DoValidExAction_RETS"][tag] = a;
						if (a == 0) {
							EWA_FrameRemoveAlert(obj, okmsg);
							obj.setAttribute('EWA_VALID_EX', "");
						} else {
							EWA_FrameShowAlert(obj, errmsg);
							obj.setAttribute('EWA_VALID_EX', errmsg);
						}
					} catch (e) {
						alert(e + ',' + ret);
					}
				}
			} else {
				alert("ERROR:\r\n" + _Ajax._Http.statusText);
			}
			_Ajax = null;
		});
	};

	this.ValidCodeError = function(isHiddenAlert) {
		let t0 = this._t_ValidCodeError || 0;
		let t1 = new Date().getTime();
		if (t1 - t0 < 1000) {
			// 出现重复情况
			if (!isHiddenAlert) {
				var ss = _EWA_EVENT_MSG['ValidCodeError'];
				$Tip(ss);
				$('.ewa-valid-code-img').parent().parent().find('input').focus().select();
			}
			return;
		}
		this._t_ValidCodeError = t1;
		$('.ewa-valid-code-img').each(function() {
			this.click()
		});
		if (!isHiddenAlert) {
			var ss = _EWA_EVENT_MSG['ValidCodeError'];
			$Tip(ss);
			$('.ewa-valid-code-img').parent().parent().find('input').focus().select();
		}
	};
	//重复提交后的提醒（幂等性）
	this.checkIdempotenceError = function() {
		var ss = _EWA_EVENT_MSG['IdempotanceError'];
		$Tip(ss);
	};
	//拼图验证失败
	this.checkValidSildePuzzleError = function() {
		var ss = _EWA_EVENT_MSG['ValidSildePuzzleError'];
		$Tip(ss);
	};

	this.Init = function(xmlString) {
		this.Xml = new EWA.C.Xml();
		this.Xml.LoadXml(xmlString);

		this.ItemList.F = this;
		// DisableOnModify IdCard , Mobile Phone 初始化在此
		this.ItemList.Init(this.Xml);

		this.Resources = new EWA_FrameResoures();
		this.Resources.Init(this.Xml);

		if (EWA.LANG == 'enus') {// ddl
			$('.ewa-ipt-droplist').attr('placeholder', 'Input character selection');
		}
		this._InitTranslations();
		this._GetDropListValue();
		this._InitMustInputs();

		this._InitEncyptions();

		this._InitTriggerValids();
	};
	/**
	 * 触发验证，例如拼图验证
	 */
	this._InitTriggerValids = function() {
		var tb = this.getObj();
		var js = "EWA.F.FOS['" + this._Id + "'].callTriggerValid(this)";
		this.triggerValids = {};
		for (var name in this.ItemList.Items) {
			var node = this.ItemList.Items[name];
			var name1 = this.ItemList.GetItemValue(node, "Name", "Name");

			var triggerValid = $(node).find('DataItem Set[TriggerValid]').attr("TriggerValid");
			if (!triggerValid) {
				continue;
			}
			this.triggerValids[name1] = null;
			var jqitem = '#' + name1;
			// 在对象上
			var item = tb.find(jqitem);
			if (item.length === 0) {
				contine;
			}
			item.attr('ewa_trigger_valid', triggerValid);

			var tag = $(node).find('Tag Set').attr('Tag');
			//console.log(tag)
			if ("submit" == tag) {
				//通过form onsubmit触发
				return;
			}

			if ("smsValid" == tag) {
				var button = tb.find('.ewa-row-' + name1 + ' .ewa-sms-valid-code-button');
				let butId = button.attr('id');
				if (!butId) {
					butId = EWA_Utils.tempId();
					button.attr('id', butId);
				}
				// 通过一个覆盖层
				let html = $("<a style='position:absolute;left:0;top:0;right:0;bottom:0'></a>");
				html.attr('ewa_trigger_valid', triggerValid);
				html.attr('ewa_trigger_valid_rid', name1);
				html.attr('ewa_trigger_valid_click_id', butId);
				button.parent().css('position', 'relative').append(html);

				item = html;
			}

			let oldclick = item.attr('onclick');
			if (oldclick) {
				item.attr('_onclick', oldclick);
			}
			item.attr('onclick', js);

		}
	};
	/**
	 * 调用触发前判断（例如滑动拼图），检查是否符合执行调用的要求
	 */
	this.callTriggerValidBefore = function(obj) {
		return true;
	};
	/**
	 * 调用触发验证，例如滑动拼图
	 */
	this.callTriggerValid = function(obj) {
		if (!this.callTriggerValidBefore(obj)) {
			return;
		}
		let tb = this.getObj();
		let obj1 = $(obj)
		let objId = obj1.attr("id");
		if (!objId) {
			objId = obj1.attr("ewa_trigger_valid_rid");
		}
		let url = this.getUrlClass();
		let triggerValid = obj1.attr('ewa_trigger_valid');
		url.AddParameter("ewa_ajax", triggerValid);
		url.AddParameter("ewa_trigger_valid_name", objId);
		url.AddParameter("ewa_trigger_valid_mode", "create");
		url.AddParameter("ewa_trigger_valid_width", document.documentElement.clientWidth);
		let c = this;

		let tempid = EWA_Utils.tempId();


		$J(url.GetUrl(), function(rst) {
			if (!rst.RST) {
				alert(rst.ERR);
				return;
			}
			// 设置id，用于_checkTriggerValids判断窗口是否创建
			obj1.attr('_trigger_valid_id', tempid);

			//显示拼图窗口
			let title = EWA.LANG == 'enus' ? "Silde puzzle" : "拼图验证";
			let dia = top.$DialogHtml("<div id='" + tempid + "'></div>", title, rst.bigImgWidth + 20, 200, false);
			$(dia.getContent()).css('overflow', 'hidden'); //Compatible with the safari
			rst.ewa_trigger_valid_name = objId;
			rst.ewa_trigger_valid = triggerValid;
			rst.ewa_url = url.GetUrl();

			EWA.UI.SlidePuzzle(rst, top.$('#' + tempid), function(result) {
				console.log('2. puzzle cb true');

				// obj1.removeAttr('onclick');
				let click = false;
				if (obj1.attr('_onclick')) {
					obj1.attr('onclick', $(obj).attr('_onclick'));
					click = true;
				}
				setTimeout(function() {
					$(dia.getMain()).animate({ opacity: 0 }, 500);
				}, 500);
				setTimeout(function() {
					let type = obj1.attr('type');
					// let tagName = obj1[0].tagName;

					c.triggerValids[objId] = result.VALID;
					let butId = $(obj).attr('ewa_trigger_valid_click_id');

					// console.log(butId, click, type, tagName, obj);
					if (butId) {//通过一个覆盖层
						obj1.remove();
						console.log(butId + '.click');
						tb.find('#' + butId).click();
					} else if (click) {
						console.log('3. puzzle click');
						obj1.click();
					} else if ("submit" == type) {
						// 由DoPost调用判断
						console.log('3. puzzle submit');
					}
					dia.Close();
				}, 1000);
			});
			setTimeout(() => { dia.AutoSize(); }, 100);
		});
	};
	/**
	 * 添加必须输入的样式
	 */
	this._InitMustInputs = function() {
		var tb = this.getObj();
		for (var name in this.ItemList.Items) {
			var node = this.ItemList.Items[name];
			var name1 = this.ItemList.GetItemValue(node, "Name", "Name");
			var isMustInput = $(node).find('IsMustInput Set[IsMustInput="1"]').length > 0;

			if (isMustInput) {
				var jqrow = '.ewa-row-' + name1;
				var jqitem = '#' + name1;
				// 在行上
				tb.find(jqrow).addClass('ewa-row-must');
				// 在对象上
				var item = tb.find(jqitem);
				item.addClass('ewa-row-item-must');
				if (item.length > 0 && item.attr("type") && item.attr("type").toLowerCase() == 'hidden') {
					item.prev().addClass('ewa-row-item-must');
				}
			}

		}
	};
	/**
	 * 添加加密的样式
	 */
	this._InitEncyptions = function() {
		var tb = this.getObj();
		var nodeList = this.ItemList;
		var c = this;
		for (var name in this.ItemList.Items) {
			var node = this.ItemList.Items[name];
			var name1 = this.ItemList.GetItemValue(node, "Name", "Name");
			var enc = $(node).find('DispEnc Set');

			if (enc.length == 0) {
				continue;
			}

			var obj = tb.find('#' + name1);
			if (obj.length == 0) {
				continue;
			}

			var EncType = enc.attr('EncType');
			if (!EncType) {
				continue;
			}

			if (obj[0].tagName == 'INPUT' || obj[0].tagName == 'TEXTAREA') {
				if (!obj.val()) {
					continue;
				}
				obj.prop('disabled', true);
				obj.attr('ewa_encyrption', 'yes');
			}

			var o1 = $("<div class='ewa-enc-cover' style='position:absolute;left:0;top:0;width:100%;height:100%;'><div></div></div>");
			obj.parent().append(o1);
			obj.parent().css('position', 'relative');
			var enc_url = enc.attr('EncShowUrl');
			if (!enc_url) {
				continue;
			}
			var css = {
				position: 'absolute',
				height: 30,
				'line-height': '30px',
				'top': '50%',
				'margin-top': '-15px',
				right: 10,
				'text-align': 'right'
			};
			o1.find('div').html("点击查看").css(css);
			var u1 = new EWA_UrlClass(enc_url);
			var u2 = new EWA_UrlClass(c.Url);
			for (var n in u2._Paras) {
				if (!u1.GetParameter(n)) {
					var v = u2._Paras[n];
					if (v != null) {
						v = v.unURL();
					}
					u1.AddParameter(n, v);
				}
			}
			u1.AddParameter("EWA_ENCY_FROM_ID", obj.attr('id'));
			var u = u1.GetUrl();
			obj.parent().attr('enc_url', u).attr('fid', obj.attr('id'));
			obj.parent().on('click', function() {
				if ($(this).attr('enc_ok')) {
					return;
				}
				var t = $(this).attr('t') || 100;
				var t1 = new Date().getTime();
				if (t1 - t < 400) { // 避免多次点击
					return;
				}
				$(this).attr("t", t1);
				var u = $(this).attr('enc_url');
				var obj = $(this).find('#' + $(this).attr('fid'));
				$J(u, function(rst) {
					if (rst.RST) {
						obj.prop("disabled", false);
						obj.removeAttr('ewa_encyrption');

						obj.val(rst.VALUE);
						$(obj).parent().find('.ewa-enc-cover').remove();
						$(obj).parent().attr('enc_ok', '1')
					} else {
						if (rst.ERR || rst.MSG) {
							$Tip(rst.ERR || rst.MSG);
						}
					}
				});
			});
		}
	};
	/**
	 * 检查所有对象合法性
	 * 
	 * @param {}
	 *            objForm
	 * @return {}
	 */
	this._InitTranslations = function() {
		var js = "EWA.F.FOS[&quot;" + this._Id + "&quot;]._Trans(this)";
		for (var name in this.ItemList.Items) {
			var node = this.ItemList.Items[name];
			var name1 = this.ItemList.GetItemValue(node, "Name", "Name");
			var translation = $(node).find('DataItem Set[Translation]');
			var trnasType = translation.attr('Translation');
			if (trnasType) {
				var transTarget = translation.attr('TransTarget');
				// console.log(name1, trnasType, transTarget);
				var txt = trnasType == "en2zh" ? " 英译中" : " 中译英";
				if (EWA.LANG == 'enus') {
					txt = trnasType == "en2zh" ? " En-Zh" : " Zh-En";
				}
				var s = '<a class="ewa-but-trans" href="javascript:void(0)" onclick="' + js + '" _transf="' + name1
					+ '" _transp="' + trnasType + '" _transt="' + transTarget + '">' + txt + '</a>';

				var but = $(s);
				var o = $('#EWA_FRAME_' + this._Id + ' .ewa-row-' + name1 + ' .EWA_TD_L');
				if (o.length == 0) {
					o = $('#EWA_FRAME_' + this._Id + ' .ewa-row-' + name1 + ' .EWA_TD'); // textarea
				}
				if (o.length == 0) {
					// redraw
					o = $('#EWA_FRAME_' + this._Id + ' #' + name1).parent().prev().find(".ewa_d1");
				}

				if (o.length == 0) { // 放在对象的上面
					o = $('#EWA_FRAME_' + this._Id + ' #' + name1).parent();
					o.css('position', 'relative');
					but.addClass('ewa-but-trans-float');
				}

				o.append(but);
			}
		}
	};
	this._Trans = function(obj) {
		if (!obj) {
			return;
		}
		var trnasFrom = $(obj).attr('_transf');
		var trnasType = $(obj).attr('_transp');
		var transTarget = $(obj).attr('_transt');
		var fromObj = $('#EWA_FRAME_' + this._Id + ' #' + trnasFrom); // 英文对象
		var toObj = $('#EWA_FRAME_' + this._Id + ' #' + transTarget); // 英文对象

		if (fromObj.length == 0 || toObj.length == 0) {
			console.log('trans ex:', fromObj, toObj);
			return;
		}
		var fromStr;
		var tagName = fromObj[0].tagName.toLowerCase();
		if (tagName == 'input' || tagName == 'textarea' || tagName == 'hidden') {
			fromStr = fromObj.val(); // 中文对象字符串
		} else {
			fromStr = fromObj.text();
		}

		if (fromStr) {
			var trans = new EWA_TransClass();
			// trans._Trans = 'youdao'; //默认用bing

			if (trnasType == 'en2zh') {
				trans.transToCn(fromStr, toObj[0]); // 英文到中文
			} else {
				trans.transToEn(fromStr, toObj[0]); // 中文到英文
			}
			var txt = EWA.LANG == 'enus' ? 'Translating...' : "翻译中...";

			$Tip(txt, function() {
				return !trans.IsRun;
			});
		}
	};
	/**
	* 绑定当输入法打开时的判断
	 */
	this._bindCompostion = function(inputShowText, inputSaveValue) {
		if (EWA.B.IE) {
			return;
		}
		let c = this;
		if (!c["_droplist_"]) {
			c["_droplist_"] = {};
		};

		c["_droplist_"][inputSaveValue.id] = { _is_composition: false };

		$(inputShowText).on('compositionstart', function() {
			// 输入法打开输入
			c["_droplist_"][inputSaveValue.id]._is_composition = true;
		}).on('compositionend', function() {
			// 输入法输入完毕
			c["_droplist_"][inputSaveValue.id]._is_composition = false;
			EWA.F.I.DropList(this);
		}).removeAttr('oninput')
			.removeAttr('onkeyup')
			.on('input', function() {
				if (c["_droplist_"][inputSaveValue.id]._is_composition) {
					return;
				}
				EWA.F.I.DropList(this);
			});
	};
	this._GetDropListValue = function() {
		var tb = this.getObj();
		if (tb.length == 0) {
			return;
		}
		tb = tb[0];
		var inputs = tb.getElementsByTagName('input');
		let c = this;
		c["_droplist_"] = {};
		for (var i = 0; i < inputs.length; i++) {
			var o = inputs[i]; // show the text
			if (o.getAttribute('ewa_class') == 'droplist') {
				var o1 = o.nextSibling; // save the value ,type=hidden
				if (o1.tagName.toUpperCase() == 'INPUT' && o1.type.toUpperCase() == 'HIDDEN') {
					this._GetDropListValue1(o, o1);
					// 绑定当输入法打开时的判断
					this._bindCompostion(o, o1);
				}

			}
		}

		// select 的过滤
		var selects = tb.getElementsByTagName('select');
		for (var i = 0; i < selects.length; i++) {
			var o = selects[i];
			var _ListFilterType = o.getAttribute('_ListFilterType');
			if (_ListFilterType) {
				var _ListFilterField = o.getAttribute('_ListFilterField');
				this.initSelectFilter(o.id, _ListFilterType, _ListFilterField);
			}
		}
		if (this._SelectFilters) {
			this._checkSelectOptionsChange();
		}
	};

	this.refreshDropList = function(id, value) {
		let target = this.getObj('input[id="' + id + '"]');
		if (target.length == 0) {
			console.warn('Can not found id=' + id);
			return;
		}
		let obj1 = target.prev();
		if (obj1.length == 0) {
			console.warn('Can not found  id=' + id + " prev");
			return;
		}
		if (obj1.attr('ewa_class') == 'droplist') {
			target.val(value);
			this._GetDropListValue1(obj1[0], target[0]);
		} else {
			console.warn('Not droplist id=' + id + " prev");
		}
	};


	this._GetDropListValue1 = function(textInput, valueInput) {
		if (valueInput.value == '') {
			valueInput.setAttribute('setvalue', 1);
			return;
		}

		var exp = valueInput.getAttribute('DlsShow');
		if (exp == null || exp == "") {
			valueInput.setAttribute('canopen', 0);
			textInput.value = obj1.value;
			valueInput.setAttribute('canopen', 1);
			return;
		}

		var xmlName = valueInput.getAttribute("xmlName");
		var itemName = valueInput.getAttribute("itemName");
		var paraname = valueInput.getAttribute("paraName");
		var action = valueInput.getAttribute('DlsAction');

		var val = valueInput.value;
		var url;
		if (this.EWA_CGI) {
			url = this.EWA_CGI; // EWA.F.FOS的自定义路径优先级最高
		} else if (window.EWA_CGI) { // 全局替换cgi-bin路径
			url = window.EWA_CGI;
		} else {
			url = EWA.CP + "/EWA_STYLE/cgi-bin/";
		}

		var mark = url.indexOf('?') == -1 ? "?" : "&";
		url += mark + "XMLNAME=" + xmlName + "&ITEMNAME=" + itemName + "&EWA_AJAX=JSON";
		url = url.replace('//', '/');
		url = url.replace('//', '/');
		url = url.replace('//', '/');

		let data = {};
		data[paraname] = val;
		if (action != null && action.trim().length > 0) {
			data["EWA_ACTION"] = action;
			data[valueInput.id] = valueInput.value;
		}
		$JP(url, data, function(s) {
			if (s.length == 0) {
				return;
			}
			var o = s[0];
			var s1 = [];
			var s2 = {};
			for (var n in o) {
				s1.push(o[n]);
				s2['@' + n.toUpperCase()] = o[n];
				if (o[n]) {
					valueInput.setAttribute("para_" + n.toLowerCase(), o[n]);
				}
			}
			var rst;
			if (exp == null || exp == "") {
				rst = s1.join('/');
			} else {
				var r1 = /\@[a-zA-Z0-9\-\._:]*\b/ig;
				var m1 = exp.match(r1);
				for (var i = 0; i < m1.length; i++) {
					var key = m1[i];
					var v = s2[key.toUpperCase()];
					exp = exp.replace(key, v);
				}
				rst = exp;
			}
			valueInput.setAttribute('canopen', 0);
			textInput.value = rst;

			valueInput.id = valueInput.id == null || valueInput.id == "" ? Math.random() : valueInput.id;
			if (valueInput.getAttribute("isdlseventload") == "yes") {
				EWA.F.FOS[valueInput.id] = new EWA_FrameItemClass();
				//console.log(EWA.F.FOS[valueInput.id].DropList)
				EWA.F.FOS[valueInput.id].DropList(textInput);
				// 执行调用
				EWA.F.FOS[valueInput.id].CallAfterEvent();
			}
			valueInput.setAttribute('canopen', 1);
			valueInput.setAttribute('setvalue', 1);
		});

	};
	/**
	 * 用于外部调用
	 */
	this.DoPostEx = function() {
		EWA.F.F.CUR = this;
		var objForm = document.forms[0];
		if (!this.CheckValidAll(objForm)) {
			return;
		}
		this._Ajax = new EWA.C.Ajax();
		this._Ajax.LoadingType = "image";

		this._Ajax.AddParameter("EWA_AJAX", "1");
		this._Ajax.AddParameter("EWA_POST", "1");
		this._Ajax.AddParameter("EWA_NO_CONTENT", "1");

		var inputs = document.getElementsByTagName("input");
		for (var i = 0; i < inputs.length; i = i + 1) {
			var o1 = inputs[i];
			var id1 = o1.name == '' ? o1.id : o1.name;
			if (id1 != null && id1 != '')
				this._Ajax.AddParameter(id1, o1.value);
		}
		var inputs = document.getElementsByTagName("select");
		for (var i = 0; i < inputs.length; i = i + 1) {
			var o1 = inputs[i];
			var id1 = o1.name == '' ? o1.id : o1.name;
			if (id1 != null && id1 != '')
				this._Ajax.AddParameter(id1, o1.value);
		}
		var inputs = document.getElementsByTagName("textarea");
		for (var i = 0; i < inputs.length; i = i + 1) {
			var o1 = inputs[i];
			var id1 = o1.name == '' ? o1.id : o1.name;
			if (id1 != null && id1 != '')
				this._Ajax.AddParameter(id1, o1.value);
		}

		this._Ajax.PostNew(this.Url, EWA.F.F.CUR._CallBack);
	};
	/**
	 * 获取包含输入域内容的 Ajax
	 * 
	 * @param objForm
	 *            objForm
	 * @param unCheckValid
	 *            是否进行合法性检查，默认检查
	 * @return {}
	 */
	this.CreateAjax = function(objForm, unCheckValid) {
		EWA.F.F.CUR = this;
		if (objForm == null) {
			objForm = $('#f_' + this._Id)[0];
		}

		if (!unCheckValid) {
			if (!this.CheckValidAll(objForm)) {
				return null;
			}
		}
		var ajax = new EWA.C.Ajax();
		var data = this.CreatePostData();
		for (var n in data) {
			ajax.AddParameter(n, data[n]);
		}

		return ajax;
	};
	this.createAjax = this.CreateAjax;
	/**
	 * 获取提交的数据 
	 * 
	 * @param objForm
	 *            objForm
	 * @returns data
	 */
	this.CreatePostData = function(objForm) {
		var objForm = objForm || $('#f_' + this._Id)[0];
		var data = {};
		for (var name in this.ItemList.Items) {
			var node = this.ItemList.Items[name];
			var id = this.ItemList.GetItemValue(node, "Name", "Name");

			var o1 = this.GetObject(id, objForm);
			if (o1 == null) {
				continue;
			}

			if ($(o1).attr("ewa_encyrption")) {// 加密显示的对象
				continue;
			}

			var ewa_tag = o1.getAttribute('ewa_tag');
			let val = null;

			// 检查签名数据是否变化，如果有就获取变化的数据，否则为空白字符串
			if ("signature" == ewa_tag) {
				let changed = 'N';
				let tablet = this.tablets[name];
				// 检查所有线条
				for (let k = 0; k < tablet.lines.length; k++) {
					if (tablet.lines[k]) {
						changed = 'Y';
						break;
					}
				}
				if (changed == 'Y') {
					val = this._GetObjectValue(o1);
				} else {
					val = "";
				}
				// 签名数据是否变化
				data[id + "_CHANGED"] = changed;
			} else {
				val = this._GetObjectValue(o1);
			}
			if (val != null) {
				data[id] = val;
			}
			if (o1.tagName.toUpperCase() == "DIV" && o1.getAttribute('EWA_DHTML') == "1") {// dhtml
				// 传递上传的图片的unid，用于调用SQL的更新用
				var upImgsUuid = $X('UP_IMG_' + id).value;
				data[id + '_imgs_split'] = upImgsUuid;
			}

			if ('swffile' == ewa_tag || 'IMG_UPLOAD' == ewa_tag) {
				var s = o1.getAttribute("UP_PARAS");
				if (s != null && s.length > 0) {
					var s1 = s.split(',');
					for (var i = 0; i < s1.length; i++) {
						var n = s1[i];
						data[n] = o1.getAttribute(n);
					}
				} else {
					data['UP_URL'] = o1.value;
				}
			} else if ('markdown' == ewa_tag) {
				var texts = o1.parentNode.getElementsByTagName('textarea');
				if (texts.length > 1) {
					data[texts[1].id] = texts[1].value;
				}
			}
		}
		if (this.PostAddData) {
			for (var n in this.PostAddData) {
				data[n] = this.PostAddData[n];
			}
		}
		if (this.triggerValids) {
			for (let n in this.triggerValids) {
				let name = n + "_TRIGGER_VALID_RESULT";
				data[name] = this.triggerValids[n];
			}
		}

		return data;
	};
	this.createPostData = this.CreatePostData;
	// 提交前检查，返回true or false;
	this.DoPostBefore = function() {
		return true;
	};
	/**
	 * 是否在进行异步提交前检查
	 */
	this.isDoPostBeforeTimer = function() {
		return this._checkStatusFristResult != null;
	};

	// 检查上传文件状态
	this._uploadingFileCheck = function(ipt) {
		//	var ipt = html5uploads[i];
		var ipt_name = ipt.id;
		var ht5 = window['h5u_' + this._Id + '$' + ipt_name];
		if (!ht5.haveFile()) {// 有文件
			return false;
		}
		// start ok checking nofile error abort
		if (ht5.UPLOAD_STATUS == 'ok') {
			// 上传完毕
			ht5.removeWaitBox();
			this.uploadProcess = false;
			return false;
		}
		if (ht5.UPLOAD_STATUS == 'nofile') {
			// 用户虽然选择了文件，但是所有文件被标记为 isDelete
			// 没有可用的上传
			this.uploadProcess = false;
			ht5.removeWaitBox();
			return false;
		}
		if (ht5.UPLOAD_STATUS == 'error' || ht5.UPLOAD_STATUS == 'abort') {
			// 错误或终止
			this._stopPost = true;
			this._stopPostError = EWA.LANG == 'enus' ? 'Upload file error or aborted' : '上传文件错误或被中止';
			console.log(this._stopPostError);
			return false;
		}

		if (ht5.UPLOAD_STATUS == 'start' || ht5.UPLOAD_STATUS == 'checking') {
			// 上传中
			return true;
		}


		// 开始上传 UPLOAD_STATUS = checking，如果没有文件 UPLOAD_STATUS = nofile
		ht5.submitUploads();

		if (ht5.UPLOAD_STATUS == 'nofile') {
			// 用户虽然选择了文件，但是所有文件被标记为 isDelete
			// 没有可用的上传
			this.uploadProcess = false;
			ht5.removeWaitBox();
			return false;
		}

		if (!$X(ht5.WAIT_ID)) {// 开始上传文件
			ht5.createWaitBox();
		}
		this.uploadProcess = true;
		return true;
	};
	this._checkTriggerValids = function() {
		if (!this.triggerValids) {
			return true;
		}
		var tb = this.getObj();
		for (let n in this.triggerValids) {
			if (this.triggerValids[n]) {
				// 已经验证成功了
				continue;
			}

			let obj = tb.find('#' + n);
			if (obj.length > 0 && "submit" == obj[0].type) {
				let inc = obj.attr('_trigger_valid_inc') ? obj.attr('_trigger_valid_inc') * 1 : 0;
				if (inc == 0) {
					//console.log('1. Puzzle wait valid: ' + n + "(" + inc + ")");
					this.callTriggerValid(obj);
				} else {
					let id = obj.attr('_trigger_valid_id');
					if (!id) {
						//puzzle 窗口还未创建
						return false;
					}
					if (top.$('#' + id).length == 0) {//窗口不见了，用户关闭窗口
						//取消提交等待
						this._cancelPostWait = true;
						obj.removeAttr('_trigger_valid_inc');
						obj.removeAttr('_trigger_valid_id');
						console.log('窗口不见了，取消提交等待');
						return false;
					}
				}
				inc++;
				obj.attr('_trigger_valid_inc', inc);
				//console.log('3. Puzzle wait valid: ' + n + "(" + inc + ")");
			} else {
				//console.log('等待验证triggerValid: ' + n);
			}
			return false;
		}
		return true;
	};
	this.DoPost = function(objForm, url, isSkipDoPostBefore) {
		if (this.posting) {
			return false;
		}
		if (this._cancelPostWait) {
			console.log('取消提交')
			this._cancelPostWait = null;
			return false;
		}
		var c = this;

		if (!isSkipDoPostBefore) {
			var rst = this.DoPostBefore();
			if (rst instanceof Array) {
				// array = [0是否执行完成和完成的结果, 1'提示的内容', 2是否用Confirm确认]
				// 【参数0】： null 表示停止执行，true 表示执行完成直接提交， false 如果
				// 参数2=true，则提示确认信息（参数1），参数2=false，则提示信息后退出
				// 【参数1】：提示或确认的信息
				// 【参数2】：是否使用Confirm对话框
				var c = this;

				this._checkStatusInc = 0; // 检查计数器
				this._checkStatusFristResult = rst;
				// 用定时器检查
				this._checkStatusTimer = window.setInterval(function() {
					// 检查计数器==0 用前面的结果，避免多次检查
					var rst = c._checkStatusInc == 0 ? c._checkStatusFristResult : c.DoPostBefore();
					c._checkStatusInc++;
					let result = rst[0];

					if (result === null || result === undefined) {
						return;
					}
					window.clearInterval(c._checkStatusTimer);
					c._checkStatusTimer = null;
					c._checkStatusInc = null;
					c._checkStatusFristResult = null;


					let tipMsg = rst[1];
					let useTip = rst[2];
					if (result && !useTip) {
						c.DoPost(objForm, url, true);
						return;
					}
					if (result && useTip) {
						$Confirm(tipMsg, tipMsg, function() {
							// yes
							c.DoPost(objForm, url, true);
						}, function() {
							// no
							return;
						});
						return;
					}
					if (tipMsg) {
						$Tip(tipMsg);
					}
				}, 232);
				return;
			} else if (!rst) {
				return;
			}
		}
		var html5uploads = $(objForm).find('input[ewa_tag=ht5upload]');
		if (html5uploads.length > 0 && !this.uploadProcess) {
			// 如果没有开始上传，先检查一下所有对象是否合法，否则不检查
			if (!this.CheckValidAll(objForm)) {
				return;
			}
		}
		var incUploadings = 0;
		for (var i = 0; i < html5uploads.length > 0; i++) {
			var ipt = html5uploads[i];
			var uploadingCheckResult = this._uploadingFileCheck(ipt);
			if (uploadingCheckResult) {
				incUploadings++;
			}
		}
		if (incUploadings > 0) {
			// 延时700ms再次尝试提交数据
			setTimeout(function() {
				c.DoPost(objForm, url);
			}, 700);
			return;
		}

		var ht5takephotos = $(objForm).find('input[ewa_tag=ht5takephoto]');
		// console.log(ht5takephotos)
		if (ht5takephotos.length > 0 && !this.uploadProcess) {
			// 如果没有开始上传，先检查一下所有对象是否合法，否则不检查
			if (!this.CheckValidAll(objForm)) {
				return false;
			}
		}

		for (var i = 0; i < ht5takephotos.length > 0; i++) {
			var ipt = ht5takephotos[i];
			var ipt_name = ipt.id;
			var isRun = false;
			var ht5 = window['h5takephoto_' + this._Id + '$' + ipt_name];
			if (ht5.UPLOAD_STATUS != 'ok') {
				if (!$X(ht5.H5_UPLOAD.WAIT_ID)) {// 开始上传文件

					try {
						ht5.submitUpload();
					} catch (e) {
						console.log('ht5takephotos - ht5.submitUpload: ' + e);
						$Tip('您没有获取照片');
						return;
					}
					ht5.H5_UPLOAD.createWaitBox();
					// 开始上传
					this.uploadProcess = true;
				}

				if (!isRun) {
					var c = this;
					setTimeout(function() {
						c.DoPost(objForm, url);
					}, 700);
					isRun = true;
				}
				return;
			} else {
				// 上传完毕
				ht5.H5_UPLOAD.removeWaitBox();
			}
		}

		if (this._stopPostError) { // 停止提交的错误原因，系统错误，客户端无效处理
			EWA.UI.Msg.ShowError(this._stopPostError, "");
			return false;
		}

		var ajax = this.CreateAjax(objForm);
		if (ajax == null) {
			return false;
		}

		//检查拼图验证等
		if (!this._checkTriggerValids()) {
			setTimeout(function() {
				c.DoPost(objForm, url, isSkipDoPostBefore);
			}, 500);
			return;
		}

		if (url == null) {
			url = this.Url;
		}
		if (url == '' || url == null) {
			url = window.location.href;
		}
		this._Ajax = ajax;
		this._Ajax.AddParameter("EWA_AJAX", "1");
		this._Ajax.AddParameter("EWA_POST", "1");
		this._Ajax.AddParameter("EWA_NO_CONTENT", "1");

		this._Ajax.LoadingType = "image";

		// 外部指定的 DoPostStart，用于显示或提示写东西
		if (this.DoPostStart) {
			this.DoPostStart(this._Ajax);
		}

		// 去除query上和form相同的参数
		var u1 = new EWA_UrlClass(url);
		for (var n in this._Ajax._Parameters) {
			u1.RemoveParameter(n);
		}
		url = u1.GetUrl();

		this.posting = true;
		let that = this;

		if (this.triggerValids) {
			for (let n in this.triggerValids) {
				//提交后，清除trigger_valid标记
				this.triggerValids[n] = null;
				this.getObj('#' + n).removeAttr('_trigger_valid').removeAttr('_trigger_valid_inc');
			}
		}


		this._Ajax.PostNew(url, function() {
			that._CallBack();
		});

		// 隐藏提交时候等待框 郭磊 2018-04-02
		if (!this.isShowPostWaitting) {
			this._Ajax.HiddenWaitting();
		}

		this.getObj('input[type=submit]').attr('disabled', 'disabled');

		return true;
	};
	this._CallBack = function() {
		let that = this; // EWA.F.F.CUR
		var ajax = that._Ajax;
		if (!ajax.IsRunEnd()) {
			return;
		}
		that.getObj('input[type=submit]').attr('disabled', null);
		that.posting = false;
		// 外部指定的 DoPostEnd，用于显示或提示写东西
		if (that.DoPostEnd) {
			that.DoPostEnd(ajax, ajax._Http.status, ajax._Http.responseText, ajax._Http.statusText);
		}
		if (ajax._Http.status == 200) {
			var ret = ajax._Http.responseText;
			if (EWA.F.CheckCallBack(ret)) {
				that.ValidCodeError(true); // 重新刷新验证码

				let afterCall = null;
				if (that.doPostAfter) {
					afterCall = that.doPostAfter;
				} else if (that.ReloadAfter) {
					console.warn('请用：doPostAfter');
					afterCall = that.ReloadAfter;
				}

				try {
					if (afterCall) {
						let r = afterCall(ret);
						if (r) {// 不执行后面的eval 2024-10-07 郭磊
							return;
						}
					}
					eval(ret);
				} catch (e) {
					console.log(ret);
					console.error(e);
					alert(ret);
				}

			}
		} else {
			alert("ERROR:\r\n" + ajax._Http.statusText);
		}
		ajax = null;
	};
	this.Reload = function() {
		// for EWA_Behavior.RELOAD_PARENT
	};
	this.Reload1 = function() {
		// guolei 2020-05-26，当初指定了id，其实任何效果也没有
		console.log('Reload1 这个干嘛用？谁在调用？');
	};

	/**
	 * 重新加载Frame,guolei 2020-05-26
	 */
	this.ReloadFrame = function(func) {
		var frame_table = $('#f_' + this._Id); //form
		if (frame_table.length == 0) {
			return;
		}
		var u1 = new EWA_UrlClass(this.Url);
		var ewa_frame_main = null;
		var tmp_id = this._last_reload_frame_id;

		if (tmp_id) {
			ewa_frame_main = $('#' + this._last_reload_frame_id);
		} else {
			tmp_id = EWA_Utils.tempId("ewa_frame_relaod");
			ewa_frame_main = frame_table.parentsUntil('#EWA_FRAME_MAIN').last().parent();
			if (ewa_frame_main[0].id != 'EWA_FRAME_MAIN') {
				// EWA_SKIP_TEST1不存在 #EWA_FRAME_MAIN
				// 创建新父元素
				ewa_frame_main = $("<div class='ewa-reload-frame'></div>");
				ewa_frame_main.insertBefore(frame_table);
				ewa_frame_main.append(frame_table);
			}
			this._last_reload_frame_id = tmp_id;
			ewa_frame_main.attr('id', tmp_id);
		}
		var u1 = new EWA_UrlClass(this.Url);
		u1.AddParameter("ewa_ajax", "install");
		var url = u1.GetUrl();
		$Install(url, tmp_id, function() {
			if (func) {
				func(ewa_frame_main, this);
			}
		});
	};

	/**
	 * 检查所有对象合法性
	 * 
	 * @param {}
	 *            objForm
	 * @return {}
	 */
	this.CheckValidAll = function(objForm) {
		var isOk = true;

		var firstObj = null;
		for (var name in this.ItemList.Items) {
			var node = this.ItemList.Items[name];
			var name1 = this.ItemList.GetItemValue(node, "Name", "Name");

			var obj = this.GetObject(name1, objForm);
			if (obj == null) {
				continue;
			}
			isOk = isOk & this.CheckValid(obj);
			if (!isOk && firstObj == null) {
				firstObj = obj;
			}
		}

		if (firstObj != null) {
			firstObj.focus();
		}
		return isOk;
	};

	/**
	 * 检查所有对象合法性
	 * 
	 * @param {}
	 *            objForm
	 * @return {}
	 */
	this.H5Type = function() {
		var nodeList = this.ItemList;
		var firstObj = null;
		for (var name in this.ItemList.Items) {
			var node = this.ItemList.Items[name];
			// name 是大写，name1是真正id
			var name1 = this.ItemList.GetItemValue(node, "Name", "Name");

			var obj = this.getObj('[id="' + name1 + '"]');
			if (obj.length == 0) {
				continue;
			}
			// console.log(node);

			var tag = this.ItemList.GetItemValue(node, "Tag", "Tag");
			var valid = this.ItemList.GetItemValue(node, "DataItem", "Valid");
			var format = this.ItemList.GetItemValue(node, "DataItem", "Format");
			var IsMustInput = this.ItemList.GetItemValue(node, "IsMustInput", "IsMustInput");

			if (valid == 'Email') {
				obj.attr('type', 'email');
			}
			if (tag == 'valid') {
				obj.attr('type', 'tel');
			}
			if (IsMustInput == 1) {
				obj.attr('required', 'required');
			}
			// console.log(tag, valid, format, IsMustInput);
		}

	};
	this.GetObject = function(objName, objForm) {
		if (!objForm) {
			objForm = $('FORM#f_' + this._Id);
		}
		var objs = $(objForm).find('[id="' + objName + '"]');
		if (objs.length > 0) {
			return objs[0];
		} else {
			return null;
		}
	};

	/**
	 * 检查对象值的合法性
	 * 
	 * @param {}
	 *            obj
	 * @return {Boolean}
	 */
	this.CheckValid = function(obj, event) {
		if (obj.tagName == 'SPAN' || obj.tagName == 'IMG') {
			return true;
		}
		// 避免出现当是 radio/checkbox时,点击div出现后背景先变化
		if (obj && event && obj.tagName == 'DIV' && obj.getAttribute('tag') == 'REPT') {
			var tag = event.target.tagName;
			// console.log(event.target);
			// 点击label会后赋值input
			if (tag == 'LABEL' || tag == 'INPUT') {
				var c = this;
				setTimeout(function() {
					var v = c._GetObjectValue(obj);
					c.ItemList.CheckValid(obj, val);
				}, 10);
			}
			return true;
		}
		var val = this._GetObjectValue(obj);
		return this.ItemList.CheckValid(obj, val);
	};

	/**
	 * 获取Html对象值
	 * 
	 * @param {}
	 *            obj
	 * @return {}
	 */
	this._GetObjectValue = function(obj) {
		return this.ItemList.GetObjectValue(obj);
	};

	this.getUrlClass = function() {
		var u = new EWA_UrlClass();
		u.SetUrl(this.Url);
		return u;
	};
}
// ------------------------------------------
var __EWA_ALTER_MSG = null;
function EWA_FrameShowAlert(obj, errorInfo) {
	if (obj.getAttribute("show_alert") == 1) {
		return;
	}
	obj.setAttribute("show_alert", 1);
	var o1 = obj;
	do {
		o1 = o1.parentNode;
		if (o1.tagName == 'BODY') {
			o1 = null;
			break;
		}
	} while (!(o1.tagName == 'TR' && o1.getAttribute("SHOW_MSG") == 1));
	if (!o1) {
		var o = $(obj);
		o.attr("ori_bc", o.css('background-color'));
		o.css('background-color', 'pink');
		if (obj.tagName != 'SELECT') {
			obj.focus();
		}

		let tr = $(obj).parentsUntil('tbody').last();
		if (tr.prev().hasClass('ewa-row-' + obj.id)) {
			// C11
			o1 = tr.prev()[0];
		}
	}
	if (!o1) {
		return;
	}
	if (o1.cells.length == 1 || o1.parentNode.parentNode.getAttribute("error_show_type") == "1") {
		var curTr = $(o1);
		var errTr = curTr.next();
		if (!errTr.attr('error')) {
			var tr = o1.parentNode.insertRow(o1.rowIndex + 1);
			tr.setAttribute('error', 1);
			tr.setAttribute('rid', obj.id);
			var td = tr.insertCell(-1);
			td.colSpan = o1.cells.length;
			td.className = 'ewa-tip-error';
			errTr = $(tr);
			td.innerHTML = '<div class="ewa-tip-error-info"></div>';
		}
		curTr.find('td').addClass('ewa-tip-error');
		errTr.find('.ewa-tip-error-info').html(errorInfo);
	} else if (o1.cells.length == 3) {
		o1.style.backgroundColor = 'lightyellow';
		if (obj.getAttribute("ori_msg") == null) {
			obj.setAttribute("ori_msg", o1.cells[2].innerHTML);
			obj.setAttribute("ori_st", o1.cells[2].style.borderLeft);
		}
		o1.cells[2].innerHTML = obj.getAttribute("ORI_MSG") + "(<font color=red>" + errorInfo + "</font>)";
		o1.cells[2].style.borderLeft = '2px solid red';
	} else {
		$(o1).find('td').css('background-color', 'lightyellow');
		if (obj.tagName != 'SELECT') {
			obj.focus();
		}
		if (o1.cells.length == 1) {
			var tr1 = $(o1).prev();
			if (tr1.attr('id') && tr1.attr('id').indexOf(obj.id) > 0) {
				if (obj.getAttribute("ori_msg") == null) {
					obj.setAttribute("ori_msg", tr1[0].cells[0].innerHTML);
				}
				tr1[0].cells[0].innerHTML = obj.getAttribute("ori_msg") + "(<font color=red>" + errorInfo + "</font>)";
			} else {
				alert("请输入：" + errorInfo);
				obj.focus();
			}
		} else {
			if (obj.getAttribute("ori_msg") == null) {
				obj.setAttribute("ori_msg", o1.cells[0].innerHTML);
			}
			o1.cells[0].innerHTML = obj.getAttribute("ori_msg") + "(<font color=red>" + errorInfo + "</font>)";
		}
	}
}
function EWA_FrameRemoveAlert(obj) {
	if (__EWA_ALTER_MSG) {
		__EWA_ALTER_MSG.style.display = 'none';
	}
	if (obj.getAttribute("show_alert") != 1) {
		return;
	}
	obj.setAttribute("show_alert", 0);

	var o1 = obj;
	do {
		o1 = o1.parentNode;
		if (o1.tagName == 'BODY') {
			o1 = null;
			break;
		}
	} while (!(o1.tagName == 'TR' && o1.getAttribute("SHOW_MSG") == 1));
	if (!o1) {
		var o = $(obj);
		o.css('background-color', o.attr('ori_bc'));

		let tr = $(obj).parentsUntil('tbody').last();
		if (tr.prev().prev().hasClass('ewa-row-' + obj.id)) {
			// C11
			o1 = tr.prev().prev()[0];
		}
	}
	if (!o1) {
		return;
	}
	o1.style.backgroundColor = '';
	// 	console.log(o1);
	if (o1.cells.length == 1 || o1.parentNode.parentNode.getAttribute("error_show_type") == "1") {
		var curTr = $(o1);
		curTr.find('td').removeClass('ewa-tip-error');
		var errTr = curTr.next();
		if (errTr.attr('error')) {
			errTr.remove();
		}
	} else if (o1.cells.length == 3) {
		o1.cells[2].innerHTML = obj.getAttribute("ori_msg");
		o1.cells[2].style.borderLeft = obj.getAttribute("ori_st");
	} else {
		if (o1.cells.length == 1) {
			var tr1 = $(o1).prev();
			if (tr1.attr('id') && tr1.attr('id').indexOf(obj.id) > 0) {
				tr1[0].cells[0].innerHTML = obj.getAttribute("ori_msg");
			}
		} else {
			$(o1).find('td').css('background-color', '');
			o1.cells[0].innerHTML = obj.getAttribute("ori_msg");
		}
	}
}
// 用于 Frame RedrawJson
function EWA_FrameShowAlert1(obj, errorInfo) {
	var o1 = obj;
	do {
		o1 = o1.parentNode;
		if (o1.tagName == 'BODY') {
			o1 = null;
			break;
		}
	} while (!(o1.tagName == 'TD' && (o1.getAttribute("SHOW_MSG") == 1 || o1.className == 'ewa_redraw_info')))

	if (o1) {
		var table = o1.parentNode.parentNode.parentNode;

		var o2 = o1.previousElementSibling ? o1.previousElementSibling : o1.previousSibling;
		o1.style.backgroundColor = 'lightblue';
		if (o2 && o2.nodeType == 1) {
			o2.style.backgroundColor = 'lightblue';
			if (obj.getAttribute("ori_msg") == null) {
				obj.setAttribute("ori_msg", o2.innerHTML);
				obj.setAttribute("ori_st", o2.style.borderLeft);
			}
			if (errorInfo == "*") {
				errorInfo = $(o2).find('.ewa_d1').html() + "：需要输入";
			}
			o2.style.borderLeft = '2px solid red';
		} else {
			o1.style.borderLeft = '2px solid red';
		}
		var msg_id = "ERR_" + obj.id;
		var o1 = $(table).find('.ewa_msg_err span[id="' + msg_id + '"]');
		if (o1.length > 0) {
			o1.html(errorInfo + "&nbsp;");
		} else {
			$(table).find('.ewa_msg_err').append("<span id=\"" + msg_id + "\">" + errorInfo + "&nbsp;</span>")
		}

	} else {
		if (errorInfo == "*") {
			errorInfo = obj.parentNode.innerText + "：需要输入";
		}

		$('.ewa_msg_err').html(errorInfo);
		obj.focus();
	}
}
// 用于 Frame RedrawJson
function EWA_FrameRemoveAlert1(obj) {
	if (obj.getAttribute("ori_msg") == null) {
		return;
	}
	var o1 = obj;
	do {
		o1 = o1.parentNode;
		if (o1.tagName == 'BODY') {
			return;
		}
	} while (!(o1.tagName == 'TD' && (o1.getAttribute("SHOW_MSG") == 1 || o1.className == 'ewa_redraw_info')));
	var table = o1.parentNode.parentNode.parentNode;
	var o2 = o1.previousElementSibling ? o1.previousElementSibling : o1.previousSibling;

	o1.style.backgroundColor = '';
	if (o2 && o2.nodeType == 1) {
		o2.style.backgroundColor = '';
		o2.style.borderLeft = obj.getAttribute("ori_st");
	} else {
		o1.style.borderLeft = obj.getAttribute("ori_st");
	}
	var msg_id = "ERR_" + obj.id;
	$(table).find('.ewa_msg_err span[id="' + msg_id + '"]').remove();

}
if (!EWA.F || !EWA.F.F) {
	if (!EWA.F) {
		EWA.F = {};
	}
	EWA.F.F = {/* Frame */
		CUR: null,
		C: EWA_FrameClass
	};
} else {
	EWA.F.F.C = EWA_FrameClass;
}