function EWA_CalendarClass() {
	this._Weeks = _EWA_G_SETTINGS["WEEKS"].split(',');
	this._Days = new Array(31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31);
	this._Months = _EWA_G_SETTINGS["MONTHS"].split(',');
	this._CurDate = new Date();
	this._DaysTable = null;
	this._SelectMonth = null;
	this._SelectYear = null;
	this._SelectHour = null;
	this._SelectMinute = null;
	this.CreateWindow = window;
	this.IsShowTime = false;
	this.Object = null;
	this.Dialog = null;
	//
	this.ChangeDate = function() {
		var y = this._SelectYear.value;
		var m = this._SelectMonth.value;
		// var d = this._DaysTable.getAttribute("EMP_CURRENT_DAY");

		this._SetNewDate(y, m, 1);
		this._WriteDays(false);
	};
	this._SetNewDate = function(y, m, d) {
		if (!y) {
			var y = this._SelectYear.value;
			var m = this._SelectMonth.value;
			var d = this._DaysTable.getAttribute("EMP_CURRENT_DAY");
			var lastDay;
			if ((((y - 2008) % 4 == 0 && y % 100 != 0) || (y % 400 == 0))
					&& m == 1) {
				lastDay = 29
			} else {
				lastDay = this._Days[m];
			}
			if (d > lastDay) {
				d = lastDay;
			}
		}
		this._CurDate = new Date(y, m, d);
		if (this.IsShowTime) {
			var hh = this._SelectHour.value;
			var mm = this._SelectMinute.value;

			this._CurDate.setHours(hh);
			this._CurDate.setMinutes(mm);
		}
	};
	this.SetDate = function(dateString) {
		var dd = dateString.split(" ");
		var d1 = dd[0].split("-");
		if (d1.length < 3) {
			d1 = dd[0].split("/");
		}
		if (d1.length < 3) {
			d1 = dd[0].split(".");
		}
		if (d1.length == 3) {
			d1[0] = parseInt(d1[0]);
			if (d1[1].substring(0, 1) == "0") {
				d1[1] = d1[1].substring(1);
			}
			if (d1[2].substring(0, 1) == "0") {
				d1[2] = d1[2].substring(1);
			}
			d1[1] = parseInt(d1[1]);
			d1[2] = parseInt(d1[2]);
			if (!(d1[0] + "" == "NaN" || d1[1] + "" == "NaN" || d1[2] + "" == "NaN")) {
				if (EWA.LANG.toUpperCase() == "ENUS") {// mm/dd/yyyy
					if (_EWA_G_SETTINGS.DATE == "dd/MM/yyyy") {
						this._CurDate = new Date(d1[2], d1[1] - 1, d1[0]);
					} else {
						this._CurDate = new Date(d1[2], d1[0] - 1, d1[1]);
					}
				} else {
					this._CurDate = new Date(d1[0], d1[1] - 1, d1[2]);
				}
				if (dd.length > 1) {
					d1 = dd[1].split(':');
					this._CurDate.setHours(d1[0]);
					if (d1.length > 1) {
						this._CurDate.setMinutes(d1[1]);
					}
					if (d1.length > 2) {
						this._CurDate.setSeconds(d1[2].split('.')[0]);
					}
				}
			}
			var day = this._CurDate.getDate();
			if (this._DaysTable) {
				this._DaysTable.setAttribute("EMP_CURRENT_DAY", day);
			}
		}
	};

	this._CreateTime = function() {
		var d1 = this._CurDate;
		var td = this.CreateWindow.document.createElement("div");

		var selHor = this.CreateWindow.document.createElement("select");
		var selTime = this.CreateWindow.document.createElement("select");
		var span1 = this.CreateWindow.document.createElement("span");
		if (EWA.LANG.toLowerCase() == 'enus') {
			span1.innerHTML = 'Time ';
		}else{
			span1.innerHTML = '时间 ';
		}
		var span2 = this.CreateWindow.document.createElement("span");
		span2.innerHTML = ":";
		for (var i = 0; i < 24; i++) {
			var time_val = i < 10 ? ("0" + i) : (i + "");
			selHor.options[selHor.options.length] = new Option(time_val,
					time_val);
		}
		selHor.value = ((100 + d1.getHours()) + "").substring(1);
		td.appendChild(span1);
		td.appendChild(selHor);

		td.appendChild(span2);
		td.appendChild(selTime);
		var span3 = this.CreateWindow.document.createElement("span");
		span3.innerHTML = '&nbsp;';

		var a = this.CreateWindow.document.createElement("span");
		a.style.cursor = 'pointer';
		a.style.color = 'blue';
		a.setAttribute('IS_ALL', 0);
		a.onclick = function() {
			var o = selTime;
			o.options.length = 0;
			if (this.getAttribute('IS_ALL') == 1) {
				for (var i = 0; i < 12; i++) {
					var vv = ((100 + i * 5) + "").substring(1);
					o.options[o.options.length] = new Option(vv, vv);
				}
				var mm = d1.getMinutes();
				mm = mm % 5 == 0 ? mm : parseInt(mm / 5) * 5;
				selTime.value = ((100 + mm) + "").substring(1);
				this.setAttribute('IS_ALL', 0);
				this.innerHTML = '全部';
			} else {
				for (var i = 0; i < 60; i++) {
					var vv = ((100 + i) + "").substring(1);
					o.options[o.options.length] = new Option(vv, vv);
				}
				var mm = d1.getMinutes();
				selTime.value = ((100 + mm) + "").substring(1);
				this.setAttribute('IS_ALL', 1);
				this.innerHTML = '每5分钟';
			}
		}
		td.appendChild(span3);
		td.appendChild(a);
		return td;
	}
	this.CreateTime = function() {
		var ss = [];
		var s1 = "<table border=0 class='ewa-ui-date-picker' style='border:1px solid #aaa' bgcolor='#E1E1E1' onselectstart='return false'>";
		ss.push(s1);

		// time
		ss.push("<tr><td><nobr></nobr></td></tr>");
		// today;
		ss.push("</table>");

		var o = this.CreateWindow.document.createElement("DIV");
		o.innerHTML = ss.join("");

		var tr = o.childNodes[0].rows[0];
		var td = tr.cells[0].childNodes[0];
		var obj = this._CreateTime();

		while (obj.childNodes.length > 0) {
			var oz = obj.childNodes[0];
			td.appendChild(oz);
		}

		var a = td.getElementsByTagName('span')[3];
		a.setAttribute('IS_ALL', 1);
		a.click();
		a.style.display = 'none';
		var opt = this.CreateWindow.document.createElement("input");
		opt.type = 'button';

		var ctTxt;
		if (EWA.LANG.toLowerCase() == 'enus') {
			opt.value = "OK";
			ctTxt = "Clear";
		} else {
			opt.value = '确定';
			ctTxt = "清除";
		}
		opt.onclick = function() {
			var win = EWA.B.IE ? this.ownerDocument.parentWindow
					: this.ownerDocument.defaultView;
			var objs = this.parentNode.getElementsByTagName('select');
			var v1 = win._EWA_CALENDAR_TIME_ITEM.Object.value;
			var v2 = objs[0].value + ':' + objs[1].value;
			win._EWA_CALENDAR_TIME_ITEM.Object.value = v2;
			win._EWA_CALENDAR_TIME_ITEM.Dialog.Show(false);
			if (v1 != v2) {
				$(win._EWA_CALENDAR_TIME_ITEM.Object).trigger("keyup");
				$(win._EWA_CALENDAR_TIME_ITEM.Object).trigger("blur");
			}
		}
		td.appendChild(opt);

		var o2 = "<a href='javascript:void(0)' style='margin:0 5px;color:#08c;font-size:12px;'>"
				+ ctTxt + "</a>";
		$(td).append(o2);
		$(td).find("a").click(
				function() {
					var win = EWA.B.IE ? this.ownerDocument.parentWindow
							: this.ownerDocument.defaultView;
					var v = win._EWA_CALENDAR_TIME_ITEM.Object.value;
					win._EWA_CALENDAR_TIME_ITEM.Object.value = "";
					win._EWA_CALENDAR_TIME_ITEM.Dialog.Show(false);
					if (v != '') {
						$(win._EWA_CALENDAR_TIME_ITEM.Object).trigger("keyup");
						$(win._EWA_CALENDAR_TIME_ITEM.Object).trigger("blur");
					}
				});
		var o3 = "<b class='fa fa-close' style='color:#666;font-size:12px;'></b>";
		$(td).append(o3);
		$(td).find("b").click(
				function() {
					var win = EWA.B.IE ? this.ownerDocument.parentWindow
							: this.ownerDocument.defaultView;
					win._EWA_CALENDAR_TIME_ITEM.Dialog.Show(false);
				});
		return o.childNodes[0];
	}
	this.CreateCalendar = function(haveTime) {
		this.IsShowTime = haveTime;

		var ss = [];
		var s1 = "<table border=0 class='ewa-ui-date' onselectstart='return false'>";
		ss.push(s1);

		// month year
		ss.push("<tr>");
		ss.push("<td height=28>" + this._CreateMonth() + "</td>");
		ss.push("<td align=right>" + this._CreateYear() + "</td>");
		ss.push("</tr>");

		// days;
		ss.push("<tr><td colspan=2>" + this._CreateDaysTable() + "</td></tr>");
		// time
		ss.push("<tr style='display:none'><td colspan=2></td></tr>");

		// today;
		ss.push("<tr><td colspan=2>" + this._CreateToDay() + "</td></tr>");
		ss.push("</table>");

		var o = this.CreateWindow.document.createElement("DIV");
		o.innerHTML = ss.join("");
		this._DaysTable = o.childNodes[0].rows[1].cells[0].childNodes[0];
		var o1 = o.getElementsByTagName("select");
		this._SelectMonth = o1[0];
		this._SelectYear = o1[1];
		o1 = null;

		this._WriteDays();
		if (haveTime) {
			var d1 = this._CurDate;
			var tr = o.childNodes[0].rows[2];
			tr.style.display = '';
			var td = tr.cells[0];

			var obj = this._CreateTime();
			while (obj.childNodes.length > 0) {
				var oz = obj.childNodes[0];
				td.appendChild(oz);

			}
			var a = td.getElementsByTagName('span')[3];
			a.click();

			this._SelectHour = td.getElementsByTagName('select')[0];
			this._SelectMinute = td.getElementsByTagName('select')[1];
		}

		return o.childNodes[0];
	};
	this._CreateToDay = function() {
		var opt = {};
		if (EWA.LANG.toLowerCase() == 'enus') {
			opt["today"] = "Today";
			opt["empty_title"] = "Empty";
			opt["empty"] = "Empty";
			opt["close"] = "Close"
		} else {
			opt["today"] = "设置为今天";
			opt["empty_title"] = "清空日期";
			opt["empty"] = "空";
			opt["close"] = "关闭"
		}
		var clickEvt = "if(_EWA_CALENDAR_ITEM.Object.onkeyup!=null)_EWA_CALENDAR_ITEM.Object.onkeyup();"
				+ "if(_EWA_CALENDAR_ITEM.Object.onblur!=null)_EWA_CALENDAR_ITEM.Object.onblur();";
		var today = "<div class='ewa-ui-date-today-day' title='" + opt["today"]
				+ "'"
				+ " onclick='_EWA_CALENDAR_ITEM.Object.value=this.innerHTML;"
				+ clickEvt + "_EWA_CALENDAR_ITEM.Dialog.Show(false);'>"
				+ this.GetDate(new Date()) + "</div>";
		var s1 = "<table border=0 class='ewa-ui-date-today' width=100%>";
		s1 += "<tr>";
		s1 += "<td class='ewa-ui-date-today-day' onclick='_EWA_CALENDAR_ITEM.Object.value=$(this).next().text();"
				+ clickEvt
				+ "_EWA_CALENDAR_ITEM.Dialog.Show(false);'>"
				+ _EWA_G_SETTINGS["Today"] + "</td>";
		s1 += "<td>" + today + "</td>";
		s1 += "<td><div class='ewa-ui-date-today-clear' title='"
				+ opt["empty_title"] + "'"
				+ " onclick='_EWA_CALENDAR_ITEM.Object.value=\"\";" + clickEvt
				+ "_EWA_CALENDAR_ITEM.Dialog.Show(false);'>" + opt["empty"]
				+ "</div></td>";
		s1 += "<td align=right><div class='ewa-ui-date-close' title='"
				+ opt["close"]
				+ "' onclick='_EWA_CALENDAR_ITEM.Hidden()'><b>X</b></div></td>";
		s1 += "</tr></table>";
		return s1;
	};

	/**
	 * 标记当前设定的日期
	 */
	this.MarkDay = function() {
		var day = this._DaysTable.getAttribute("EMP_CURRENT_DAY") * 1;
		for (var i = 1; i < this._DaysTable.rows.length; i += 1) {
			var r = this._DaysTable.rows[i];
			for (var m = 0; m < r.cells.length; m += 1) {
				var td = r.cells[m];
				if (td.childNodes.length > 0
						&& GetInnerText(td.childNodes[0]) * 1 == day) {
					this.MarkSelected(td);
				} else {
					this.MarkUnSelected(td);
				}
			}
		}
	};
	this.MarkSelected = function(obj) {
		$(obj).addClass('ewa-ui-date-selected');
		// obj.style.backgroundColor = "blue";
	};
	this.MarkUnSelected = function(obj) {
		$(obj).removeClass('ewa-ui-date-selected');
		// obj.style.backgroundColor = "";
	};
	this.MarkBlur = function(obj) {
		$(obj).addClass('ewa-ui-date-blur');
		// obj.style.border = "1px solid #cdcdcd";
	};
	this.MarkUnBlur = function(obj) {
		$(obj).removeClass('ewa-ui-date-blur');
		// obj.style.border = "1px solid #f1f1f1";
	};
	this._CreateMonth = function() {
		var oTable = this._CreatePervNext();
		var s1 = "<select onchange='_EWA_CALENDAR_ITEM.ChangeDate();'>";
		var s2;
		var curMonth = this._CurDate.getMonth();
		for (var i = 0; i < this._Months.length; i += 1) {
			if (i == curMonth) {
				s1 += "<option value='" + i + "' selected>" + this._Months[i]
						+ "</option>";
			} else {
				s1 += "<option value='" + i + "'>" + this._Months[i]
						+ "</option>";
			}
		}
		s1 += "</select>";
		oTable = oTable.replace("[$]", s1);
		return oTable;
	};
	this._CreateYear = function() {
		var y1 = 1900;
		var y2 = 2050;
		var curYear = this._CurDate.getFullYear();
		var oTable = this._CreatePervNext();
		var ss = [];
		ss[0] = "<select onchange='_EWA_CALENDAR_ITEM.ChangeDate();'>";
		var s2;
		for (var i = y1; i <= y2; i += 1) {
			if (i == curYear) {
				ss
						.push("<option value='" + i + "' selected>" + i
								+ "</option>");
			} else {
				ss.push("<option value='" + i + "'>" + i + "</option>");
			}
		}
		ss.push("</select>");
		oTable = oTable.replace("[$]", ss.join(""));
		return oTable;
	};
	this._CreatePervNext = function() {
		var js = "var o=this.parentNode;var o1=o.nextSibling.childNodes[0];if(o1.selectedIndex>0){o1.value=o1.value*1-1;o1.onchange();}o=o1=null";
		var js1 = "var o=this.parentNode;var o1=o.previousSibling.childNodes[0];if(o1.options.length-1>o1.selectedIndex){o1.value=o1.value*1+1;o1.onchange();}o=o1=null";
		var sPrev = "<div class='ewa-ui-date-prev'  onclick='" + js
				+ "'><b class='fa fa-caret-left'></b></div>";
		var sNext = "<div class='ewa-ui-date-next' onclick='" + js1
				+ "'><b class='fa fa-caret-right'></div>";
		var s1 = "<table cellpadding=0 cellspacing=0 border=0>";
		s1 += "<tr><td>" + sPrev + "</td><td>[$]</td><td>" + sNext
				+ "</td></tr></table>";
		return s1;
	};
	/**
	 * 创建日历
	 * 
	 * @param isMark
	 *            是否标记日期
	 */
	this._WriteDays = function(isMark) {
		if (this.__LAST__WriteDaysDate != this._CurDate) {
			// 当前日期不重新创建
			this.__LAST__WriteDaysDate = this._CurDate;

			var mmm = this._CreateDays();
			var day = this._CurDate.getDate();

			var month = this._CurDate.getMonth();
			var year = this._CurDate.getFullYear();

			this._SelectMonth.value = month;
			this._SelectYear.value = year;

			var modth = (month + 1);
			if (modth < 10) {
				modth = "0" + modth;
			}
			var title = year + "-" + modth + "-DD";
			// 新增20170414 guolei
			var rq = this._CurDate.getFullYear() + "" + modth;
			if (EWA.LANG != null && EWA.LANG.toUpperCase() == 'ENUS') {
				if (_EWA_G_SETTINGS.DATE == "dd/MM/yyyy") {
					title = "DD/" + modth + "/" + year;
				} else {
					title = modth + "/DD/" + year;
				}
			}
			var otd;
			for (var i = 1; i < this._DaysTable.rows.length; i += 1) {
				var r = this._DaysTable.rows[i];
				for (var m = 0; m < r.cells.length; m += 1) {
					otd = r.cells[m];
					if (mmm[i] == null || mmm[i][m] == null) {
						otd.innerHTML = "";
					} else {
						var rq1 = rq + mmm[i][m]; // 新增20170414 guolei
						otd.innerHTML = "<div date='" + rq1 + "' title='"
								+ title.replace("DD", mmm[i][m]) + "'>"
								+ mmm[i][m] + "</div>";
					}
					this.MarkUnSelected(otd);
					otd = null;
				}
				if ($(r).text() == '') {
					$(r).hide();
				} else {
					$(r).show();
				}
			}
		}
		if (isMark) {
			this.MarkDay();
		}
	};
	this._CreateDaysTable = function() {
		var ss = [];
		ss[0] = "<table class='ewa-ui-days' align ='center' border=0 cellpadding=1 cellspacing=1 EMP_CURRENT_DAY='"
				+ this._CurDate.getDate() + "'>";
		for (var i = 0; i < 7; i += 1) {
			ss.push("<tr>");
			for (var m = 0; m < 7; m += 1) {

				if (i == 0) {
					ss.push("<th>" + this._Weeks[m] + "</th>");
				} else {
					ss
							.push("<td onmouseover='if(this.innerHTML.length>0)_EWA_CALENDAR_ITEM.MarkBlur(this);'");
					ss
							.push(" onmouseout='if(this.innerHTML.length>0)_EWA_CALENDAR_ITEM.MarkUnBlur(this);'");
					ss
							.push(" onclick='_EWA_CALENDAR_ITEM.Clicked(this);'></td>");
				}
			}
			ss.push("</tr>");
		}
		ss.push("</table>")
		return ss.join("");
	};
	this.Clear = function() {
		this.Object.value = "";
		this.Hidden();
	};
	this.Hidden = function(notRunOnBlur) {
		if (this.Object.onblur != null && !notRunOnBlur) {
			this.Object.onblur();
		}
		this.Object = null;
		this.Dialog.Show(false);
	};
	this.Clicked = function(obj) {
		if (obj.innerHTML.length > 0) {
			this._DaysTable.setAttribute("EMP_CURRENT_DAY",
					obj.childNodes[0].innerHTML);
			this._SetNewDate();
			this.MarkDay();
			this.Object.value = this.GetDate();
			if (this.Object.onkeyup != null) {
				this.Object.onkeyup();
			}
			if (this.Object.onblur != null) {
				this.Object.onblur();
			}
			if (this.Object.onchange != null) {
				// 显示定义了 onchange 属性
				this.Object.onchange();
			} else {
				// 不管有没有，都触发 change 事件
				$(this.Object).trigger('change');
			}
			this.Hidden(true);
		}
	}
	this.GetDate = function(d1) {
		var d2 = _EWA_G_SETTINGS["DATE"];
		if (d1 == null) {
			d1 = this._CurDate;
		}
		var y = d1.getFullYear();
		var m = d1.getMonth() + 1;
		var d = d1.getDate();
		if (m < 10) {
			m = "0" + m;
		}
		if (d < 10) {
			d = "0" + d;
		}
		var s1 = d2.replace('yyyy', y);
		s1 = s1.replace('MM', m);
		s1 = s1.replace('dd', d);

		if (this.IsShowTime) {
			var hh = d1.getHours();
			var mm = d1.getMinutes();
			hh = hh < 10 ? "0" + hh : hh;
			mm = mm < 10 ? "0" + mm : mm;
			s1 += " " + hh + ":" + mm;
		}
		return s1;
	};
	this._CreateDays = function() {
		var baseDate = new Date(this._CurDate.getFullYear(), this._CurDate
				.getMonth(), 1);
		var week = baseDate.getDay();
		var a = 1;
		var arrayDays = new Array();
		arrayDays[0] = this._Weeks;
		var m = 1;
		var maxDays = this._getCurMonthDays();
		for (var i = 0; i < 49; i += 1) {
			if (i == 0 || week == 7) {
				arrayDays[m] = new Array();
				m += 1;
			}
			if (week == 7) {
				week = 0;
			}
			if (a <= maxDays) {
				arrayDays[m - 1][week] = (a < 10 ? "0" + a : a + "");
			} else {
				break;
			}
			a += 1;
			week += 1;
		}
		return arrayDays;
	};
	this._getCurMonthDays = function() {
		if ((((this._CurDate.getFullYear() - 2008) % 4 == 0 && (this._CurDate
				.getFullYear() - 400) % 100 != 0) || (this._CurDate
				.getFullYear() - 400) % 400 == 0)
				&& this._CurDate.getMonth() == 1) {
			return 29;
		} else {
			return this._Days[this._CurDate.getMonth()];
		}
	};
}

var __Cal = {
	C : EWA_CalendarClass,
	WND : null, // 实例化的日期
	WND_PARENT : null, // 打开日期的对象
	WND_DIA : null
// 实例化的窗体
}

__Cal.Pop = function(obj, havTime) {
	var popId = 'WND_PARENT/Pop/' + havTime;
	if (!__Cal[popId]) {
		__Cal[popId] = {};
	}
	var ins = __Cal[popId];
	ins.OBJ = obj;
	if (ins.WND == null) {
		// console.log('create instance');

		var o = ins.WND_DIA = new EWA_UI_DialogClass();
		o.Width = 172;
		o.Height = 200;
		o.ShadowColor = "";
		ins.WND = new EWA_CalendarClass();
		if (typeof _EWA_DialogWnd == 'undefined') {
			o.CreateWindow = window;
		} else { // pop window created
			o.CreateWindow = _EWA_DialogWnd._ParentWindow;
			_EWA_DialogWnd.OpendDialogs[_EWA_DialogWnd.OpendDialogs.length] = o;
		}
		o.CreateWindow._EWA_CALENDAR_ITEM = ins.WND;
		o.Create();
		ins.WND.CreateWindow = o.CreateWindow;
		ins.WND.SetDate(obj.value);
		var o1 = ins.WND.CreateCalendar(havTime);
		o.SetObject(o1);
		ins.WND.Dialog = o;
		// 自动设定高度和宽度
		$(o.GetFrameContent()).css('width','').css('height','');
		o = o1 = null;
	}
	// console.log('show instance');
	ins.WND.SetDate(obj.value);
	ins.WND._WriteDays(true);
	ins.WND.Dialog.SetZIndex(10);
	ins.WND.Object = obj;
	ins.WND_DIA.MoveBottom(obj);
	ins.WND_DIA.Show(true);
}
__Cal.PopTime = function(obj) {
	var popId = 'WND_PARENT/PopTime/';
	if (!__Cal[popId]) {
		__Cal[popId] = {};
	}
	var ins = __Cal[popId];
	ins.OBJ = obj;
	if (ins.WND == null) {
		var o = ins.WND_DIA = new EWA_UI_DialogClass();
		o.Width = 180;
		o.Height = 20;
		o.ShadowColor = "";
		ins.WND = new EWA_CalendarClass();
		if (typeof _EWA_DialogWnd == 'undefined') {
			o.CreateWindow = window;
		} else { // pop window created
			o.CreateWindow = _EWA_DialogWnd._ParentWindow;
			_EWA_DialogWnd.OpendDialogs[_EWA_DialogWnd.OpendDialogs.length] = o;
		}
		o.CreateWindow._EWA_CALENDAR_TIME_ITEM = ins.WND;
		o.Create();
		ins.WND.CreateWindow = o.CreateWindow;
		ins.WND.SetDate(obj.value);

		var o1 = ins.WND.CreateTime();
		o.SetObject(o1);
		ins.WND.Dialog = o;
		
		// 自动设定高度和宽度
		$(o.GetFrameContent()).css('width','').css('height','');
		
		o = o1 = null;
	}
	ins.WND.CreateWindow._EWA_CALENDAR_TIME_ITEM.Object = obj;
	ins.WND.CreateWindow._EWA_CALENDAR_TIME_ITEM.Dialog = ins.WND_DIA;
	ins.WND.SetDate(obj.value);
	ins.WND.Dialog.SetZIndex(10);
	ins.WND.Object = obj;
	ins.WND_DIA.MoveBottom(obj);
	ins.WND_DIA.Show(true);
}

EWA["UI"].Calendar = __Cal /* 日历 */