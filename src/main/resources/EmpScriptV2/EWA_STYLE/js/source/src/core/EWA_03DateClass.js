/**
 * 
 */
function EWA_DateClass(dateStr) {
	if (dateStr) {
		if (dateStr instanceof Date) {
			this._Date = dateStr; // 日期类型
		} else {
			this._Date = EWA_Utils.Date(dateStr)._Date; // 字符串
		}
	} else {
		this._Date = new Date();
	}
	this._Days = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];
	this.PastMilliseconds = function(dateClass1) {
		return dateClass1._Date - this._Date;
	};
	this.PastSeconds = function(dateClass1) {
		return this.PastMilliseconds(dateClass1) / 1000;
	};
	this.GetYear = function() {
		return this._Date.getFullYear();
	};
	this.GetMonth = function() {
		return this._Date.getMonth() + 1;
	};
	this.GetDay = function() {
		return this._Date.getDate();
	};
	this.GetBenYear = function() {
		var y = this.GetYear();
		var d1 = y + '-01-01';
		var d2 = y + '-12-31';
		return [ d1, d2 ];
	};
	this.GetBenMonth = function() {
		var y = this.GetYear();
		var m = this.GetMonth();
		var d = this._Days[m - 1];
		if (m == 2 && (((y - 1992) % 4 == 0 && (y - 1900) % 100 != 0) || (y - 2000) % 400 == 0)) {
			d = 29;
		}
		if (m < 10) {
			m = '0' + m;
		}
		if (d < 10) {
			d = '0' + d;
		}
		var d1 = y + '-' + m + '-01';
		var d2 = y + '-' + m + '-' + d;
		return [ d1, d2 ];
	};
	/**
	 * 获取本周(第一天,最后一天)
	 * 
	 * @param isSundayIsFirstDay
	 *            是否周日为第一天
	 */
	this.GetBenWeek = function(isSundayIsFirstDay) {
		var dayOfWeek = this._Date.getDay(); // day of week
		var curDay = this.GetDay();

		var d0;
		var d2;
		if (isSundayIsFirstDay) { // 周日为第一天 ,返回周日到周六
			d0 = dayOfWeek;
			d2 = 6 - dayOfWeek;
		} else {// 周一为第一天 ,返回周一到周六日
			d0 = dayOfWeek - 1;
			d2 = 7 - dayOfWeek;
		}
		var dd1 = this.Clone();
		dd1.setDate(curDay - d0);

		var dd2 = this.Clone();
		dd2.setDate(curDay + d2);

		return [ this.GetDateString(dd1), this.GetDateString(dd2) ];
	};

	this.GetBenQ = function() {
		var m = this.GetMonth();
		var m1, m2;
		if (m <= 3) {
			m1 = 1;
			m2 = 3;
		} else if (m <= 6) {
			m1 = 4;
			m2 = 6;
		} else if (m <= 9) {
			m1 = 7;
			m2 = 9;
		} else {
			m1 = 10;
			m2 = 12;
		}
		var y = this.GetYear();
		var d1 = this.CreateDate(y, m1, 1);
		var d2 = this.CreateDate(y, m2, this._Days[m2 - 1]);

		return [ this.GetDateString(d1), this.GetDateString(d2) ];
	};
	this.GetDateString = function(d) {
		return this.FormatDateTime(null, d);
	};
	this.GetDateTimeString = function(d) {
		return this.FormatDate(null, d);
	};
	this.Clone = function() {
		var d1 = this.CreateDate(this.GetYear(), this.GetMonth(), this.GetDay());
		return d1;
	};
	this.AddDays = function(days) {
		var cd = this._Date.getDate();
		this._Date.setDate(cd + days * 1);
		return this.GetDateString();
	};
	this.AddDaysFt = function(days, format) {
		var cd = this._Date.getDate();
		this._Date.setDate(cd + days * 1);
		return this.FormatDate(format);
	};
	/**
	 * 设置时间
	 * 
	 * @param {Number}
	 *            y 4为年
	 * @param {Number}
	 *            m 月
	 * @param {Number}
	 *            d 日
	 * @param {Number}
	 *            h 小时
	 * @param {Number}
	 *            mm 分钟
	 * @param {Number}
	 *            s 秒
	 */
	this.CreateDate = function(y, m, d, h, mm, s) {
		var d1 = new Date();
		if (h == null) {
			h = 0;
		}
		if (mm == null) {
			mm = 0;
		}
		if (s == null) {
			s = 0;
		}
		d1.setDate(1);
		d1.setFullYear(y);
		d1.setMonth(m - 1);
		d1.setDate(d);
		d1.setHours(h);
		d1.setMinutes(mm);
		d1.setSeconds(s);
		d1.setMilliseconds(0);
		return d1;
	};
	/**
	 * 设置时间
	 * 
	 * @param {Number}
	 *            y 4为年
	 * @param {Number}
	 *            m 月
	 * @param {Number}
	 *            d 日
	 * @param {Number}
	 *            h 小时
	 * @param {Number}
	 *            mm 分钟
	 * @param {Number}
	 *            s 秒
	 */
	this.SetDate = function(y, m, d, h, mm, s) {
		if (m == null) {
			this._Date = EWA_Utils.Date(y)._Date;
			return;
		}
		this._Date = this.CreateDate(y, m, d, h, mm, s);
	};
	// 获取周几的名称
	this.GetWeekName = function() {
		var wknames = _EWA_G_SETTINGS.WEEKS.split(',');
		return wknames[this._Date.getDay()];
	};
	this.FormatDate = function(format, dateFrom) {
		if (!format && _EWA_G_SETTINGS && _EWA_G_SETTINGS.DATE) {
			format = _EWA_G_SETTINGS.DATE;
		}
		if (!format) {
			format = "yyyy-MM-dd";
		}
		var d = dateFrom || this._Date;

		var month = d.getMonth() + 1;
		var dm = month;
		var dd = d.getDate();
		if (dm < 10) {
			dm = "0" + month;
		}
		if (dd < 10) {
			dd = "0" + dd;
		}
		var dy = d.getFullYear();
		var val;
		var enMonths = "Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec".split(",");
		var chMonths = "一月,二月,三月,四月,五月,六月,七月,八月,九月,十月,十一月,十二月".split(",");
		if (format == "MM/dd/yyyy") {
			val = dm + "/" + dd + "/" + dy;
		} else if (format == "dd/MM/yyyy") {
			val = dd + "/" + dm + "/" + dy;
		} else if (format == "yyyy-MM-dd") {
			val = dy + "-" + dm + "-" + dd;
		} else if (format == "MM/dd") {
			val = dm + "/" + dd + "/" + dy;
		} else if (format == "dd/MM") {
			val = dd + "/" + dm + "/" + dy;
		} else if (format == "MM-dd") {
			val = dm + "-" + dd;
		} else if (format == "MMM dd") {
			val = enMonths[month - 1] + " " + dd;
		} else if (format == "dd-MMM") {
			val = dd + "-" + enMonths[month - 1];
		} else if (format == "ddMMM") {
			val = dd + enMonths[month - 1];
		} else if (format == "MMMdd") {
			val = enMonths[month - 1] + dd;
		} else if (format == "MM月dd日") {
			val = (month) + dd + "日";
		} else if (format == "yyyyMMdd") {
			val = dy + "" + dm + "" + dd;
		}
		return val;
	};
	this.FormatDateTime = function(format, dateFrom) {
		var d1 = this.FormatDate(format, dateFrom) + " " + this.GetTimeStr(dateFrom);
		return d1;

	};
	this.GetTimeStr = function(dateFrom) {
		var d1 = dateFrom || this._Date;
		var hh = d1.getHours();
		var mi = d1.getMinutes();
		var se = d1.getSeconds();

		return (hh < 10 ? "0" : "") + hh + ":" + (mi < 10 ? "0" : "") + mi + ":" + (se < 10 ? "0" : "") + se;

	};
	this.GetDateDiff = function(bDate) {
		var a = this._Date;
		var b;
		if (!bDate) {
			b = new Date();
		} else if (bDate instanceof Date) {
			b = bDate;
		} else if (bDate instanceof EWA_DateClass) {
			b = bDate._Date;
		} else {
			b = EWA_Utils.Date(bDate)._Date;
		}
		var aTime = a.getTime();
		var bTime = b.getTime();
		var dates = (aTime - bTime) / (1000 * 60 * 60 * 24);
		return dates.toFixed(0);
	};

};
EWA_Utils.Date = function(dateStr) {
	if (!dateStr) {
		return new EWA_DateClass();
	}
	var d1 = dateStr;
	var d2 = '';
	if (dateStr.indexOf(' ') > 0) {
		var d3 = dateStr.split(' ');
		d1 = d3[0];
		d2 = d3[1];
	}
	var da;
	var y;
	var m;
	var d;
	if (dateStr.length == 8) {
		y = dateStr.substring(0, 4);
		m = dateStr.substring(4, 6);
		d = dateStr.substring(6, 8);

	} else {
		if (d1.indexOf("/") > 0) {
			da = d1.split('/');
			y = da[2];
			if (_EWA_G_SETTINGS && _EWA_G_SETTINGS.DATE == "MM/dd/yyyy") {
				m = da[0];
				d = da[1];
			} else {
				m = da[1];
				d = da[0];
			}
		} else {
			da = d1.split('-');
			y = da[0];
			m = da[1];
			d = da[2];
		}
		var mm = 0;
		var h = 0;
		var s = 0;
		if (d2.length > 0) {
			var db = d2.split(':');
			h = db[0];
			mm = db[1];
			if (db.length > 2) {
				s = db[2];
			}
		}
	}
	var dt = new EWA_DateClass();
	dt.SetDate(y, m, d, h, mm, s);
	return dt;
};