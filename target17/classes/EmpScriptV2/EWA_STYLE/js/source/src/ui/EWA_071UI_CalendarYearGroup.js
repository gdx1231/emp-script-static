;
function EWA_UI_CalendarYearGroupClass() {
	/**
	 * 禁止选择 小于 theDay 的天
	 */
	this.denysBefore = function(theDay) {
		var dt = new EWA_DateClass(theDay);
		for (var i = 1; i < 1500; i++) {
			var dayStr = dt.AddDays(-1);
			dayStr = dayStr.split(' ')[0];
			var td = this.denyDay(dayStr);
			if (td.length == 0) {
				break;
			}
		}
	};
	/**
	 * 禁止选择 大于 theDay 的天
	 */
	this.denysAfter = function(theDay) {
		var dt = new EWA_DateClass(theDay);
		for (var i = 1; i < 1500; i++) {
			var dayStr = dt.AddDays(1);
			dayStr = dayStr.split(' ')[0];
			var td = this.denyDay(dayStr);
			if (td.length == 0) {
				break;
			}
		}
	};
	this.denyDay = function(rq) {
		var p = $('#' + this.classId);
		var tds = p.find(".ewa-ui-days td");
		var td = tds.find("div[title='" + rq + "']").parent();
		td.addClass('ewa-ui-calendar-year-deny').attr('deny', 1);
		return td;
	};
	this.unDenyDay = function(rq) {
		var p = $('#' + this.classId);
		var tds = p.find(".ewa-ui-days td");
		var td = tds.find("div[title='" + rq + "']").parent();
		td.removeClass('ewa-ui-calendar-year-deny').attr('deny', null);
		return td;
	};
	this.CUR_GROUP_NAME = null; // 对象分组名称
	/**
	 * 设置新的分组名称
	 */
	this.setGroupName = function(groupName) {
		if (groupName) {
			this.CUR_GROUP_NAME = "CYG_" + groupName.replace(/\:|\?|\.|\=|\;|\(|\)|\-/ig, '');
			this.CUR_GROUP_NAME_O = groupName;
		} else {
			this.CUR_GROUP_NAME = null;
			this.CUR_GROUP_NAME_O = null;
		}
	};
	this.Create = function(pid, startYear, startMonth, monthLength, byMonth, denyStartDate, denyEndDate) {
		//console.log(pid, startYear, startMonth, monthLength, byMonth, denyStartDate)

		this.classId = ("CY" + Math.random()).replace('.', '');
		EWA.UI.CalendarYear = EWA.UI.CalendarYear || {};
		EWA.UI.CalendarYear[this.classId] = this;

		$($X(pid)).append('<div class="ewa-ui-calendar-year" id="' + this.classId + '"></div>');
		var p = $('#' + this.classId);

		// 开始日期
		var today = new Date();
		if (startYear && startMonth) {
			today = new Date(startYear, startMonth - 1, 1);
		}
		var m = today.getMonth();
		var start_m = m;
		if (!byMonth) {
			// 计算出当前月的季度开始月份
			var jd = Math.round(m / 3 - 0.5);
			start_m = jd * 3;
		}
		var year = today.getFullYear();
		if (!monthLength || monthLength <= 0) {
			monthLength = 12;
		}

		var aa = new EWA_CalendarClass();
		for (var i = 1; i <= monthLength; i++) {
			var month = start_m + 1; //显示的月份和Date的月份差1
			if (EWA.LANG == 'enus') {
				var m1 = month + "/" + year;
				var m2
				if (_EWA_G_SETTINGS.DATE == "dd/MM/yyyy") {
					m2 = "01/" + month + "/" + year;
				} else {
					m2 = month + "/01/" + year;
				}
				aa.SetDate(m2);
			} else {
				var m1 = year + "-" + (start_m + 1);
				aa.SetDate(m1 + '-01');
			}
			var tb = aa.CreateCalendar();

			var ym = year + (month < 10 ? "0" : "") + month
			var tbid = this.classId + '_' + ym
			tb.id = tbid;
			tb.setAttribute('yearmonth', ym)
			p.append(tb);
			$(tb.rows[3]).remove();
			$(tb.rows[0].cells[1]).remove();

			// 点击月份
			var s = "<a href='javascript:EWA.UI.CalendarYear." + this.classId + ".chooeseMonth(\"" + tbid + "\",event)'>" + m1
				+ "</a>"
			$(tb.rows[0].cells[0]).html(s);
			// 点击星期
			$(tb).find('th').attr('onclick', "EWA.UI.CalendarYear." + this.classId + ".chooeseWeek('" + tbid + "',this, event)");
			start_m++;
			if (start_m == 12) {
				start_m = 0;
				year++;
			}
			$(tb).find('th:eq(0)').addClass('rq-sun'); // 周日
			$(tb).find('th:eq(6)').addClass('rq-sat'); // 周六

		}
		p.append('<div style="clear:both"></div>');
		p.find('.ewa-ui-days td').attr('onclick', "EWA.UI.CalendarYear." + this.classId + ".Click(this,event)");
		_EWA_CALENDAR_ITEM = aa;


		if (denyStartDate) {
			this.denysBefore(denyStartDate);
		}
		if (denyEndDate) {
			this.denysAfter(denyEndDate);
		}
	};

	this.getChooeseName = function() {
		return this.CUR_GROUP_NAME ? this.CUR_GROUP_NAME : "chooese";
	};
	/**
	 * 添加或删除标记
	 */
	this.addOrRemoveMark = function(td, isRemove, rq) {
		var chooeseName = this.getChooeseName();
		var o = $(td);
		if (!isRemove) {
			if (o.find('.' + chooeseName).length == 0) {
				o.append("<nobr class='ewa-ui-calendar-year-item " + chooeseName + "'></nobr>");
				o.attr(chooeseName, 1);
				if (this.markEvent) {
					this.markEvent(td, rq);
				}
			}
		} else {
			o.find("." + chooeseName).remove();
			o.attr(chooeseName, null)
			if (this.unMarkEvent) {
				this.unMarkEvent(td, rq);
			}
		}

		// 删除上次的 Nxx class
		if (o.attr('_last_item_count_')) {
			o.removeClass(o.attr('_last_item_count_'));
		}

		var count = o.find('.ewa-ui-calendar-year-item').length;
		if (count > 0) {
			o.addClass('ewa-ui-calendar-year-chooese');
			var css_count = count < 100 ? "N" + count : "NP"; //最多显示99，否则用 ...代替
			o.addClass("N " + css_count).attr('_last_item_count_', css_count);
		} else {
			o.removeClass('ewa-ui-calendar-year-chooese').removeClass('N');
		}
	};
	this.chooeseWeek = function(id, obj, evt) {
		var tb = $("#" + id).find('.ewa-ui-days')[0];
		var chooeseName = this.getChooeseName();
		var rqs = []; // 选中或未选中的日期

		var cellIndex = obj.cellIndex;
		var is_chooese = true;
		var is_have_active = false;
		// 判读本周几的所有日期都选择了
		for (var i = 1; i < tb.rows.length; i++) {
			var td = tb.rows[i].cells[cellIndex];
			if (td.childNodes.length == 0) {
				continue;
			}
			if (!$(td).attr('deny')) {
				is_have_active = true;
			}
			if (!$(td).attr(chooeseName)) {
				is_chooese = false;
			}
			if (is_have_active && !is_chooese) {
				break;
			}
		}

		if (!is_have_active) {
			$Tip('没有可选的日期');
			return;
		}

		if (this.ClickBeforeEvent) {
			if (!this.ClickBeforeEvent(id, obj, evt, 'WEEK')) {
				return;
			}
		}

		for (var i = 1; i < tb.rows.length; i++) {
			var td = tb.rows[i].cells[cellIndex];
			if (td.childNodes.length == 0) {
				continue;
			}
			//禁止的日期
			if ($(td).attr('deny')) {
				continue;
			}
			var rq = $(td).find('div:eq(0)').attr('title');
			rqs.push(rq);
			this.addOrRemoveMark(td, is_chooese, rq);
		}
		if (is_chooese) {
			$(obj).attr(chooeseName, null);
		} else {
			$(obj).attr(chooeseName, 1);
		}
		if (this.ClickEvent) {
			this.ClickEvent(rqs, !is_chooese, evt);
		}
	};
	/**
	 * 按月全选/全不选
	 */
	this.chooeseMonth = function(id, evt) {
		var tb = $('#' + id + " .ewa-ui-days")[0];
		var chooeseName = this.getChooeseName();
		var is_all_chooesed = true;
		var is_have_active = false;
		// 判读本月的所有日期都选择了
		for (var i = 1; i < tb.rows.length; i++) {
			var row = tb.rows[i];
			for (var m = 0; m < row.cells.length; m++) {
				var td = row.cells[m];
				if (td.childNodes.length == 0) {
					continue;
				}
				if (!is_have_active && !$(td).attr('deny')) {
					is_have_active = true; //找到可用的
				}
				var tag = $(td).attr(chooeseName);
				if (!tag) {
					is_all_chooesed = false; //没有全部选择
				}
			}
			if (!is_all_chooesed && is_have_active) {
				break;
			}
		}
		if (!is_have_active) {
			$Tip("没有可选的日期");
			return;
		}

		if (this.ClickBeforeEvent) {
			if (!this.ClickBeforeEvent(id, null, evt, 'MONTH')) {
				return;
			}
		}

		var rqs = [];
		for (var i = 1; i < tb.rows.length; i++) {
			var row = tb.rows[i];
			for (var m = 0; m < row.cells.length; m++) {
				var td = row.cells[m];
				if (td.childNodes.length == 0) {
					continue;
				}
				//禁止的日期
				if ($(td).attr('deny')) {
					continue;
				}
				var rq = $(td).find('div:eq(0)').attr('title');
				rqs.push(rq);
				this.addOrRemoveMark(td, is_all_chooesed, rq);
			}
		}

		if (this.ClickEvent) {
			this.ClickEvent(rqs, !is_all_chooesed, evt);
		}
	};
	/**
	 * 设置显示在日历上
	 * 
	 * @param jsonArr
	 *            对象数组
	 * @param filedName
	 *            日期的字段名称
	 * @param groupFieldName
	 *            分组字段名称
	 * @param func
	 *            附加执行的方法,三个参数 td(日期所在的TD), rq(日期) ,d(JSON对象)
	 */
	this.SetChooeses = function(jsonArr, filedName, groupFieldName, func) {
		this._RQ_MAP = null;

		var p = $('#' + this.classId);
		var tds = p.find(".ewa-ui-days td");
		for (var n in jsonArr) {
			var d = jsonArr[n]; // JSON对象
			var rq = d[filedName]; // 日期
			if (!rq) {
				continue;
			}
			if (groupFieldName) {
				this.setGroupName(d[groupFieldName]);
			}

			rq = rq.split(' ')[0];
			var td = this.findTdByRq(rq);
			if (td && td.length > 0) {
				this.addOrRemoveMark(td, false, rq);
				if (func) { // 传递进去的方法
					func(td[0], rq, d);
				}
			} else {
				console.log('无效的日期' + rq);
			}
		}

		this._RQ_MAP = null;
		// 如果日期全选，则设置为全选的标志
		p.find(".ewa-ui-date").each(function() {
			if ($(this).find('.ewa-ui-calendar-year-chooese').length == $(this).find('td div[title]').length) {
				$(this).attr('all1', 'yes');
				$(this).find('th').attr('chooese', 'yes');
			}
		});
	};
	this.findTdByRq = function(rq) {
		if (!rq) {
			return null;
		}
		if (!this._RQ_MAP) { //缓存已经存在的日期
			this._RQ_MAP = {};
		} else {
			if (this._RQ_MAP[rq]) {
				return this._RQ_MAP[rq];
			}
		}

		var rq1 = rq.replace(/-/ig, '');
		var yearmonth = rq1.substring(0, 6);
		var tb = $('#' + this.classId + " table[yearmonth='" + yearmonth + "']");
		if (tb.length == 0) {
			this._RQ_MAP[rq] = null;
			return null;
		}
		this._RQ_MAP[rq] = tb.find("div[date='" + rq1 + "']").parent();
		return this._RQ_MAP[rq];
	};
	/**
	 * 获取选中的日期
	 */
	this.GetChooeses = function(pobj) {
		var ss = [];
		var p = pobj ? $(pobj) : $('#' + this.classId + ' .ewa-ui-days');
		p.find('.ewa-ui-calendar-year-chooese').each(function() {
			ss.push($(this).find('div:eq(0)').attr('title'));
		});
		return ss;
	};
	/**
	 * 获取未选中的日期
	 */
	this.GetUnChooeses = function(pobj) {
		var ss = [];
		var p = pobj ? $(pobj) : $('#' + this.classId + ' .ewa-ui-days');
		p.find('td').each(function() {
			if (!$(this).attr('chooese')) {
				var rq = $(this).find('div:eq(0)').attr("title");
				if (rq)
					ss.push(rq);
			}
		});
		return ss;
	};
	this.Click = function(obj, evt) {
		if ($(obj).attr('deny') || obj.innerHTML.trim() == '') {
			// 没日期
			return;
		}
		if (this.ClickBeforeEvent) {
			if (!this.ClickBeforeEvent(obj.id, obj, evt, 'DAY')) {
				return;
			}
		}
		var isChecked;
		var rq = $(obj).find('div:eq(0)').attr('title');
		var chooeseName = this.getChooeseName();

		var isRemove = $(obj).attr(chooeseName);

		this.addOrRemoveMark(obj, isRemove, rq);

		if (this.ClickEvent) {
			var rqs = [rq];
			this.ClickEvent(rqs, !isRemove, evt)
		}
	};
	/**
	 * 点击前处理，如果返回true,则继续执行选择，否则终止执行选择
	 * 
	 * @param id
	 *            来源ID
	 * @param obj
	 *            来源对象
	 * @param evt
	 *            event事件
	 * @param type
	 *            模式 DAY/WEEK/MONTH
	 * @returns true/false
	 */
	this.ClickBeforeEvent = function(id, obj, evt, type) {
		console.log('overwrite xxx.ClickBeforeEvent(id, obj, evt, type)');
		return true;
	};
	/**
	 * 点击后执行
	 * 
	 * @param rqs
	 *            日期数组
	 * @param isChecked
	 *            是否选中
	 * @param evt
	 *            event
	 */
	this.ClickEvent = function(rqs, isChecked, evt) {
		// overwrite this;
		console.log('overwrite xxx.ClickEvent(rqs,   isChecked, evt)');
	};
}