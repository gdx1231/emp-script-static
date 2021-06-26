/**
 * 画横向流程
 */
function EWA_UI_FlowChartClass() {
	this.DEF_CHART_WIDTH = 200;
	this.DEF_CHART_HEIGHT = 50;
	this.DEF_BG_COLOR = '#08c';
	this.DEF_COLOR = '#fff';

	this.Create = function(pid, jsonArray, fieldId, filedText, width, height, bgcolor, color) {
		this.PID = pid;
		this.FIELD_ID = fieldId;
		this.FIELD_TEXT = filedText;
		this.CHART_WIDTH = width || this.DEF_CHART_WIDTH;
		this.CHART_HEIGHT = height || this.DEF_CHART_HEIGHT;
		this.BG_COLOR = bgcolor || this.DEF_BG_COLOR;
		this.COLOR = color || this.DEF_COLOR;
		// 箭头的偏移
		this.OFF = Math.round( this.CHART_HEIGHT * Math.sqrt(2) / 2);

		this._CreateCss();

		var main_width = (this.CHART_WIDTH) * jsonArray.length - (this.OFF -4) * (jsonArray.length-1) + 4;
		var ss = [ "<div style='z-index:1;padding-left:" + this.OFF + "px;height:" + this.CHART_HEIGHT
			+ "px;position:relative;margin:auto;width:" + (main_width) + "px'>" ];
		for (var i = 0; i < jsonArray.length; i++) {
			var d = jsonArray[i];
			var html = this._CreateChart(d, i, i == jsonArray.length - 1);
			ss.push(html);
		}
		ss.push("</div>");
		if ($X(pid)) {
			$($X(pid)).append(ss.join(''));
		} else {
			$('body').append(ss.join(''));
		}
	};
	this._CreateCss = function() {
		var pcolor = '#fff';
		// if ($X(this.PID)) {
		// pcolor = $($X(this.PID)).css('background-color');
		// } else {
		// pcolor = $('body').css('background-color');
		// }

		var h = this.CHART_HEIGHT;
		var w = this.CHART_WIDTH;
		var c = this.BG_COLOR;
		var off = this.OFF;
		var off1 = Math.round(off);
		var css = {
			main : "position:relative;margin-left:-" + (off - 4) + "px;float:left;z-index:[ZINDEX];height:" + h
				+ "px;width:[WIDTH]px;overflow:hidden;",
			leftbox : "background-color:[BGCOLOR];float:left;width:" + off1 + "px;height:" + h + "px;overflow:hidden",
			leftarrow : "background: " + pcolor + ";margin-left: -" + off + "px;width:" + h + "px;height:" + h
				+ "px;-webkit-transform: rotate(45deg);transform: rotate(45deg);",
			center : "height:" + h + "px;float:left;text-overflow: ellipsis;overflow: hidden;line-height:" + h
				+ "px;background-color:[BGCOLOR];width:" + (w - off1 * 2) + "px;text-align:center;font-size:16px",
			centertd : "color:[COLOR];text-overflow: ellipsis;overflow: hidden;width:100%;text-align:center;font-size:16px",
			rightbox : "float:right;width:" + off1 + "px;height:" + h + "px;overflow:hidden",
			rightarrow : "background:[BGCOLOR];margin-left: -" + off1 + "px;width:" + h + "px;height:" + h
				+ "px;-webkit-transform: rotate(45deg);transform: rotate(45deg);"
		};
		this.CSS = css;
	};
	this._CreateChart = function(d, idx, islast) {
		console.log(d)

		

		var ss = [];
		var cssMain = this.CSS.main.replace('[ZINDEX]', (1000 - idx)).replace('[LEFT]', (this.CHART_WIDTH - 20) * idx);
		cssMain = cssMain.replace('[WIDTH]', this.CHART_WIDTH);
		ss.push("<div id='" + d[this.FIELD_ID] + "' style='" + cssMain + "'>");

		var bgcolor = d.bgColor || this.BG_COLOR;
		var csslefbox = this.CSS.leftbox.replace('[BGCOLOR]', bgcolor);
		var csscenter = this.CSS.center.replace('[BGCOLOR]', bgcolor);
		var cssrightarrow = this.CSS.rightarrow.replace('[BGCOLOR]', bgcolor);

		var color=d.color||this.COLOR;
		var csscentertd=this.CSS.centertd.replace('[COLOR]', color);
		// 左箭头
		ss.push("<div style='" + csslefbox + "'>");
		ss.push("<div style='" + this.CSS.leftarrow + "'></div>");
		ss.push("</div>");

		// 中间文字
		ss.push("<table border=0 cellpadding=0 cellspacing=0  style='" + csscenter + "'><tr><td style='" + csscentertd
			+ "'>");
		if (typeof this.FIELD_TEXT == 'function') {
			var tmp = this.FIELD_TEXT(d, idx, islast);
			ss.push(tmp);
		} else {
			ss.push(d[this.FIELD_TEXT]);
		}
		ss.push("</td></tr></table>");

		// 右键头
		ss.push("<div style='" + this.CSS.rightbox + "'>");
		ss.push("<div style='" + cssrightarrow + "'></div>");
		ss.push("</div>");

		ss.push("</div>");

		return ss.join('');
	};
}
/*
 * aa = new EWA_UI_FlowChartClass(); var json = [ { id : 'a1', txt : '方式1' }, {
 * id : 'a2', txt : '方式2' }, {id : 'a3', txt : '方式3' }, { id : 'a4', txt : '方式4' }, {
 * id : 'a4', txt : '方式4' } ] aa.Create('EWA_FRAME_MAIN', json, 'id', 'txt',
 * 190, 80, '#000', 'red')
 */