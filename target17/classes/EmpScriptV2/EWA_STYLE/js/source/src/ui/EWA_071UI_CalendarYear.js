;
function EWA_UI_CalendarYearClass() {
	this.Create = function(pid, startYear, startMonth, monthLength,byMonth) {
		console.log(startYear, startMonth, monthLength)
		this.classId = ("CY" + Math.random()).replace('.', '');
		EWA.UI.CalendarYear = EWA.UI.CalendarYear || {};
		EWA.UI.CalendarYear[this.classId] = this;

		$($X(pid)).append('<div class="ewa-ui-calendar-year" id="' + this.classId + '"></div>');
		var p = $('#' + this.classId);
		var aa = new EWA_CalendarClass();
		// 开始日期
		var today = new Date();
		if (startYear && startMonth) {
			today = new Date(startYear, startMonth-1, 1);
		}
		var m = today.getMonth();
		var start_m=m;
		if(!byMonth){
			// 计算出当前月的季度开始月份
			var jd = Math.round(m / 3 - 0.5);
			start_m = jd * 3;
		}
		var year = today.getFullYear();
		if (!monthLength || monthLength <= 0) {
			monthLength = 12;
		}
		for (var i = 1; i <= monthLength; i++) {
			if (EWA.LANG == 'enus') {
				var m1 = (start_m + 1) + "/" + year;
				var m2
				if(_EWA_G_SETTINGS.DATE == "dd/MM/yyyy"){
					m2="01/" + (start_m + 1) + "/" + year;
				}else{
					m2 = (start_m + 1) + "/01/" + year;
				}
				aa.SetDate(m2);
			} else {
				var m1 = year + "-" + (start_m + 1);
				aa.SetDate(m1 + '-01');
			}
			var tb = aa.CreateCalendar();
			var tbid = this.classId + '_' + year + "_" + start_m;
			tb.id = tbid;
			
			var ym=year + (start_m<10?"0":"") + start_m
			
			tb.setAttribute('yearmonth',ym)
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
	};
	this.chooeseWeek = function(id, obj, evt) {
		var cellIndex = obj.cellIndex;
		var tb = $("#" + id).find('.ewa-ui-days')[0];
		var is_chooese = $(obj).attr('chooese');
		var rqs = []; // 选中或未选中的日期
		for (var i = 1; i < tb.rows.length; i++) {
			var td = tb.rows[i].cells[cellIndex];
			if (td.childNodes.length == 0) {
				continue;
			}
			if (!is_chooese) {
				$(td).addClass('ewa-ui-calendar-year-chooese').attr('chooese', 1);
			} else {
				$(td).removeClass('ewa-ui-calendar-year-chooese').attr('chooese', null);
			}
			rqs.push($(td).find('div:eq(0)').attr('title'));
		}
		if (is_chooese) {
			$(obj).attr('chooese', null);
		} else {
			$(obj).attr('chooese', 1);
		}
		if (this.ClickEvent) {
			this.ClickEvent(rqs, !is_chooese, evt);
		}
	};
	this.chooeseMonth = function(id, evt) {
		var tb = $('#' + id);
		var isChecked = tb.attr('all1');
		var rqs = [];
		if (isChecked) {
			tb.attr('all1', null);
			$('#' + id + " .ewa-ui-days .ewa-ui-calendar-year-chooese").each(function() {
				$(this).removeClass('ewa-ui-calendar-year-chooese').attr('chooese', null);
				rqs.push($(this).find('div:eq(0)').attr('title'));
			});
			tb.find('th').attr('chooese', null);
		} else {
			tb.attr('all1', 'yes');
			$('#' + id + " .ewa-ui-days tr:gt(0) td div[title]").parent().each(function() {
				$(this).addClass('ewa-ui-calendar-year-chooese').attr('chooese', 1);
				rqs.push($(this).find('div:eq(0)').attr('title'));
			});
			tb.find('th').attr('chooese', 1);
		}
		if (this.ClickEvent) {
			this.ClickEvent(rqs, !isChecked, evt);
		}
	};
	this.SetChooeses = function(jsonArr, filedName) {
		for ( var n in jsonArr) {
			var d = jsonArr[n];
			var rq = d[filedName];
			if (!rq) {
				continue;
			}
			rq = rq.split(' ')[0];
			$('#' + this.classId + " .ewa-ui-days td div[title='" + rq + "']").parent().addClass('ewa-ui-calendar-year-chooese')
				.attr('chooese', 1);
		}
		// 如果日期全选，则设置为全选的标志
		$('#' + this.classId + " .ewa-ui-date").each(function() {
			if ($(this).find('.ewa-ui-calendar-year-chooese').length == $(this).find('td div[title]').length) {
				$(this).attr('all1', 'yes');
				$(this).find('th').attr('chooese', 'yes');
			}
		});
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
	}
	this.Click = function(obj, evt) {
		if (obj.innerHTML.trim() == '') {
			// 没日期
			return;
		}
		var isChecked;
		if (!$(obj).attr('chooese')) {
			$(obj).addClass('ewa-ui-calendar-year-chooese').attr('chooese', 1);
			isChecked = true;
		} else {
			$(obj).removeClass('ewa-ui-calendar-year-chooese').attr('chooese', null);
			isChecked = false;
		}
		if (this.ClickEvent) {
			var rqs = [ $(obj).find('div:eq(0)').attr('title') ];
			this.ClickEvent(rqs, isChecked, evt)
		}
	};
	this.ClickEvent = function(rqs, isChecked, evt) {
		// overwrite this;
		console.log('overwrite xxx.ClickEvent(rqs,   isChecked, evt)');
	};
}