/**
 * add new function
 */
EWA.UI.Ext = EWA.UI.Ext || {};

EWA.UI.Ext.initExtsMap = function() {
	if (this.mapImg) {
		return;
	}
	this.mapImg = { "def": "Edit.png" }; // 默认图片
	this.mapIcon = { "def": "fa fa-file-text-o" }; // 默认图标

	let me = this;
	function addMaps(exts, img, icon) {
		var arr = exts.split(",");
		for (let n in arr) {
			let ext = arr[n].trim().toLowerCase();
			me.mapImg[ext] = img;
			me.mapIcon[ext] = icon;
		}
	}

	addMaps(".doc,.docx,.rtf", "MSWD.png", "fa fa-file-word-o ewa-file-ext-color-word");
	addMaps(".xls,.xlsx", "XCEL.png", "fa fa-file-excel-o ewa-file-ext-color-excel");
	addMaps(".ppt,.pptx", "PPT3.png", "fa fa-file-powerpoint-o ewa-file-ext-color-powerpoint");
	addMaps(".txt,.cvs,.pom", "Edit.png", "fa fa-file-text-o ewa-file-ext-color-text");
	addMaps(".pdf", "ACR_App.png", "fa fa-file-pdf-o ewa-file-ext-color-pdf");
	addMaps(".7z,.zip,.rar,.arc,.gz,.tar", "zip.png", "fa fa-file-zip-o ewa-file-ext-color-zip");
	addMaps(".odt", "openoffice.png", "fa fa-file-text-o ewa-file-ext-color-text");
	addMaps(".html,.htm", "html.png", "fa fa-internet-explorer ewa-file-ext-color-html");
	addMaps(".mp3,.wav,.mid,.m4a,.oga,.flac,.weba,.opus,.ogg", "mp3.png", "fa fa-file-audio-o ewa-file-ext-color-audio");
	addMaps(".mp4,.mov,.flv,.vod,.ogm,.ogv,.wmv,.mpg,.mpeg,.m4v,.avi,.asx,.webm", "vod.png", "fa fa-file-video-o ewa-file-ext-color-video");
	addMaps(".jpg,.jpeg,.jiff,jfif,.png,.bmp,.webp,.tiff,.avif", "vod.png", "fa fa-file-image-o ewa-file-ext-color-image");
}
/**
 * 获取文件图标
 */
EWA.UI.Ext.getFileIco = function(ext) {
	this.initExtsMap();
	var path = (EWA.RV_STATIC_PATH || '/EmpScriptV2') + "/EWA_STYLE/images/file_png/";

	if (ext == null) {
		ext = "";
	}
	ext = ext.toLowerCase();
	if (ext.indexOf('.') < 0) {
		ext = "." + ext;
	}

	if (this.mapImg[ext]) {
		return path + this.mapImg[ext];
	} else {
		return path + this.mapImg.def; // 默认图片
	}
};
EWA.UI.Ext.FileIco = EWA.UI.Ext.getFileIco;
EWA.UI.Ext.getFileIcon = function(ext) {
	this.initExtsMap();

	if (ext == null) {
		ext = "";
	}
	ext = ext.toLowerCase();
	if (ext.indexOf('.') < 0) {
		ext = "." + ext;
	}

	if (this.mapIcon[ext]) {
		return this.mapIcon[ext];
	} else {
		return this.mapIcon.def; // 默认图标
	}
};
/**
 * 获取文件扩展名
 */
EWA.UI.Ext.FileExt = function(filename) {
	if (filename == null) {
		return "";
	}
	var fn = filename.toLowerCase();
	var loc = fn.lastIndexOf('.');
	var ext = "";
	if (loc > 0) {
		ext = fn.substring(loc);
	}
	return ext;
}
/**
 * 获取文件字节描述
 */
EWA.UI.Ext.getFileLen = function(v, precision) {
	if (v == null || isNaN(v)) {
		return v || "";
	}
	// 返回的计算精度
	if (precision == null || isNaN(precision)) {
		precision = 0;
	}
	if (v >= 1024 * 1024 * 1024 * 1024) {
		let v1 = v / (1024 * 1024 * 1024 * 1024);
		return v1.fm(precision) + "T";
	} else if (v >= 1024 * 1024 * 1024) {
		let v1 = v / (1024 * 1024 * 1024);
		return v1.fm(precision) + "G";
	} else if (v >= 1024 * 1024) {
		let v1 = v / (1024 * 1024);
		return v1.fm(precision) + "M";

	} else if (v >= 1024) {
		let v1 = v / (1024);
		return v1.fm(precision) + "K";
	} else {
		return v + "B";
	}
};
EWA.UI.Ext.FileLen = EWA.UI.Ext.getFileLen;
/**
 * 手机
 */
EWA.UI.Ext.Mobile = function(obj) {
	if (!obj) {// input
		return;
	}
	var id = obj.id || 'R' + Math.random();
	obj.id = id;
	var newid = '__mobile_' + id;
	$(obj).attr('mobile_id', newid);
	if (!$X(newid)) {
		var ss = [];
		ss.push("<table class='ewa-text-help-box' border=0 cellpadding=3 cellspacing=0 id='" + newid + "'>");
		ss.push("<tr><td>");
		ss.push(EWA.UI.Ext.IdCard1(3));
		ss.push("</td><td>-</td><td>");
		ss.push(EWA.UI.Ext.IdCard1(4));
		ss.push("</td><td>-</td><td>");
		ss.push(EWA.UI.Ext.IdCard1(4));
		ss.push("</td><td><i></i></td></tr></table>");

		$('body').append(ss.join(""));
		var o = $X(newid);
		$(o).find('td').css('background-color', '#fff').attr('align', 'center');
		$(obj).attr('maxLength', 11);
	}

	var o = $X(newid);
	addEvent(obj, 'focus', function() {
		var id1 = $(this).attr('mobile_id');
		var oo = $($X(id1)).show();
		oo.css('top', $(this).offset().top - oo.height() - 7);
		oo.css('left', $(this).offset().left);
		EWA.UI.Ext.Mobile2(this);
	});
	addEvent(obj, 'blur', function() {
		var id1 = $(this).attr('mobile_id');
		var oo = $($X(id1)).hide();
	});
	addEvent(obj, 'keyup', function() {
		EWA.UI.Ext.Mobile2(this)
	});
};
EWA.UI.Ext.Mobile2 = function(obj) {
	var id1 = $(obj).attr('mobile_id');
	var oo = $($X(id1));
	var v = obj.value;
	var divs = oo.find('div');
	divs.html("");
	var isok = true;
	for (var i = 0; i < v.length; i++) {
		var c = v.substring(i, i + 1);
		var color = '';
		if (isNaN(c)) {
			color = 'red';
			isok = false;
		}
		if (divs[i]) {
			divs[i].innerHTML = "<span style='font-size:16px;color:" + color + "'>" + c + "</span>";
		}
	}

	if (v.length == divs.length && isok) {
		oo.find('i').html("<font color=green>正确</font>");
	} else {
		oo.find('i').html("<font color=red>错误</font>");
	}
};
/**
 * 辅助身份证输入
 */
EWA.UI.Ext.IdCard = function(obj) {
	if (!obj) {// input
		return;
	}
	var id = obj.id || 'R' + Math.random();
	obj.id = id;
	var newid = '__sfz_' + id;
	$(obj).attr('sfz_id', newid);
	if (!$X(newid)) {
		var ss = [];
		ss.push("<table class='ewa-text-help-box' border=0 cellpadding=1 cellspacing=1 id='" + newid + "'>");
		ss.push("</tr><td height=18>地区</td><td >年</td><td>月</td><td>日</td><td>顺序号</td></tr>");
		ss.push("<tr><td>");
		ss.push(EWA.UI.Ext.IdCard1(6));
		ss.push("</td><td>");
		ss.push(EWA.UI.Ext.IdCard1(4));
		ss.push("</td><td>");
		ss.push(EWA.UI.Ext.IdCard1(2));
		ss.push("</td><td>");
		ss.push(EWA.UI.Ext.IdCard1(2));
		ss.push("</td><td>");
		ss.push(EWA.UI.Ext.IdCard1(4));
		ss.push("</td></tr><tr><td colspan=5>状态 <i></i></td></tr></table>");

		$('body').append(ss.join(""));

		var o = $X(newid);
		$(o).find('td').css('background-color', '#fff').attr('align', 'center');
		$(obj).attr('maxLength', 18);
	}

	var o = $X(newid);
	addEvent(obj, 'focus', function() {
		var id1 = $(this).attr('sfz_id');
		var oo = $($X(id1)).show();
		oo.css('top', $(this).offset().top - oo.height() - 8);
		oo.css('left', $(this).offset().left);
		EWA.UI.Ext.IdCard2(this);
	});
	addEvent(obj, 'blur', function() {
		var id1 = $(this).attr('sfz_id');
		var oo = $($X(id1)).hide();
	});
	addEvent(obj, 'keyup', function() {
		EWA.UI.Ext.IdCard2(this)
	});
};
EWA.UI.Ext.IdCard1 = function(len) {
	var cc = "<div></div>";
	var ss = [];
	for (var i = 0; i < len; i++) {
		ss.push(cc);
	}
	return ss.join('');
};
EWA.UI.Ext.IdCard2 = function(obj) {
	var mm = [1, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
	var id1 = $(obj).attr('sfz_id');
	var oo = $($X(id1)).show();
	var v = obj.value;
	var divs = oo.find('div');
	divs.html("");
	var isok = true;
	var dq = [];
	var year = [];
	var month = [];
	var day = [];
	for (var i = 0; i < v.length; i++) {
		var c = v.substring(i, i + 1);
		var color = '';
		if (i < 6) {
			dq.push(c);
		} else if (i >= 6 && i < 10) {
			year.push(c);
		} else if (i >= 10 && i < 12) {
			month.push(c);
		} else if (i >= 12 && i < 14) {
			day.push(c);
		}
		if (i < 17) {
			if (isNaN(c)) {
				color = 'red';
				isok = false;
			}
		} else {
			if (!(c == 'x' || c == 'X' || !isNaN(c))) {
				color = 'red';
				isok = false;
			}
		}
		if (divs[i]) {
			divs[i].innerHTML = "<span style='font-size:16px;color:" + color + "'>" + c + "</span>";
		}
	}
	var year1 = year.join('');
	var msg = [];
	if (!isNaN(year1)) {
		if (year1 < 1900 || year1 > 2100) {
			isok = false;
			for (var i = 6; i < 10; i++) {
				$(divs[i]).find('span').css('color', 'red');
			}
			msg.push("年:" + year1);
		}
		if ((year1 - 1996) % 4 == 0) { // 闰年
			mm[2] = 29;
		} else {
			mm[2] = 28;
		}
	} else {
		isok = false;
		msg.push("年:" + year1);
	}

	var month1 = month.join('');
	ismonth1 = true;
	if (!isNaN(month1)) {
		if (month1 < 1 || month1 > 12) {
			isok = false;
			ismonth1 = false;
			for (var i = 10; i < 12; i++) {
				$(divs[i]).find('span').css('color', 'red');
			}
			msg.push("月:" + month1);
		}
	} else {
		ismonth1 = false;
		isok = false;
		msg.push("月:" + month1);
	}
	var day1 = day.join('');
	if (!isNaN(day1)) {
		if (ismonth1 && (day1 < 1 || day1 > mm[month1 * 1])) {
			isok = false;
			for (var i = 12; i < 14; i++) {
				$(divs[i]).find('span').css('color', 'red');
			}
			msg.push("日:" + day1);
		}
	} else {
		isok = false;
	}
	if (v.length == divs.length && isok) {
		oo.find('i').html("<font color=green>正确</font>");
		var json = {
			YEAR: year1,
			MONTH: month1,
			DAY: day1,
			SEX: $(divs[16]).text() * 1 % 2
			// 0:female, 1: male
		};
		$(obj).attr('sfz_json', JSON.stringify(json));
	} else {
		oo.find('i').html("<font color=red>" + msg.join(", ") + "错误</font>");
	}
};

// if ($X('BAS_APP_NATIONAL_ID')) {
// sfz($X('BAS_APP_NATIONAL_ID'));
// }
