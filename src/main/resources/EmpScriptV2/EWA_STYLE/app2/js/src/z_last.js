;
/**
	显示 ListFrame 为 App2形式
	@param ewa listframe的ewa
**/
EWA_App.showFrameAsMobile = (ewa) => {
	let id = "SECTION_" + (ewa.Id || ewa._Id);
	if (window.__SECTIONS && __SECTIONS[id]) {
		return;
	}

	if (window.location.href.indexOf('#' + id) > 0) {
		window.location.href = window.location.href.split('#')[0];
		return;
	}

	let u = new EWA_UrlClass(ewa.Url);
	u.AddParameter("EWA_AJAX", "INSTALL");
	u.AddParameter("EWA_APP", "1");
	let url = u.GetUrl();
	let cfg = ewa.appCfg || {
		ID: id,
		IScroll: "Y",
		IScrollMore: "Y",
		PageFooter: "N",
		PageHeader: "Y",
		Refresh: "N",
		USE_EWA_LF: "Y",
		RE_SHOW_LF_FILTER: "Y",
		SHOW_LF_MENUS: "Y",
		SHOW_ORDERS: "Y",
		SHOW_LF_ADD: "Y",
		EWA: false,
		U: url,
		loaded: true,
		swap: "direct",
		Title: ewa.Title
	};

	if (ewa instanceof EWA_FrameClass && !ewa.appCfg) {
		cfg.PageFooter = "Y";
		cfg.ButtonOnFooter = 'Y';
		cfg.USE_EWA_LF = "N";
		cfg.RE_SHOW_LF_FILTER = "N";
		cfg.SHOW_LF_MENUS = "N";
		cfg.SHOW_ORDERS = "N";
		cfg.SHOW_LF_ADD = "N";
		cfg.IScrollMore = "N";
	}

	let ewacfg = {
		ButtonOnFooter: "Y",
		Css: "ewa",
		EWA: true,
		ID: "ewa",
		IScroll: true,
		IScrollMore: false,
		PageFooter: "Y",
		PageHeader: "Y",
		Refresh: "Y",
		RE_SHOW_LF_FILTER: "Y",
		U: EWA.CP + "/EWA_STYLE/cgi-bin/index.jsp",
		USE_EWA_LF: "Y"
	};
	let cfgs = [];
	cfgs.push(cfg);
	//cfgs.push(main1);
	cfgs.push(ewacfg);
	EWA_App.initCfgs(cfgs);

	EWA_App.start(id);

	ewa.SECTION_CFG = __SECTIONS[id];

	if(ewa instanceof EWA_FrameClass ){
		EWA_App.Section.buttonOnFooter();
		EWA_App.Section.frameUIAndEvents(ewa);
	} else {
		EWA_App.Section.reShowFilter();
		EWA_App.Section.listFrameUIAndEvents(ewa);
	}
}

/*
function EWA_AppSection(options) {
	this.options = options;
	this.getUrl = function () {
		var u = EWA_ROOT + "?xmlname=" + this.options.X + "&itemname=" + this.options.Y;
	}
}
*/

function createDDL(from) {
	window.__createDDL = from;
	var o = $X('___ewa_ddl');
	if (!o) {
		window._EWA_UI_DIALOG_COVERINDEX = 1231;
		var div = document.createElement('div');
		div.id = '___ewa_ddl';
		div.className = 'ewa-ddl-box ewa-frame';
		div.innerHTML = "<div class='ewa-ddl-box-content'></div><i onclick='closeDDL1()' class='fa fa-close'></i>";
		document.body.appendChild(div);

	}
	o = $('#___ewa_ddl');
	var html = $(from).parent().html();
	o.find('.ewa-ddl-box-content').html(html);

	var o1 = o.find('input:eq(0)');
	var o2 = o.find('input:eq(1)');
	o1.attr('oninput', o1.attr('oninput1')).attr('onkeyup', o1.attr('onkeyup1'));
	o1.attr('onmousedown', null);
	o1.attr('readonly', null);
	o1.attr('id', '_create_ddl_from_' + o2.attr('id'));

	// have有内容表示输入东西了
	o1.attr('onkeypress', 'ddlKeyPress(this)');

	o.find('input:eq(1)').attr('afterEvent', 'closeDDL');

	$('body').append(o);
	o.show();
	setTimeout(function() {
		o1[0].focus();
	}, 500);
}
function ddlKeyPress(o) {
	setTimeout(function() {
		o.setAttribute("have", o.value)
	}, 11);
}
// 关闭并赋值
function closeDDL(a, b, c, d) {
	if (a == "") {
		// 输入并且离开焦点 a==""表示是离开输入框焦点触发
		return;
	}

	$('.ewa-ddl-list').hide();
	var from = $(window.__createDDL);
	// console.log(from);

	from.val($('#___ewa_ddl input:eq(0)').val());
	from.next().val($('#___ewa_ddl input:eq(1)').val());
	// 调用原来的 afterEvent
	if (from.next().attr('afterEvent')) {
		var js = eval(from.next().attr('afterEvent'));
		// console.log(js)
		js(a, b, c, d);
	}
	$('#___ewa_ddl').hide();
	window.__createDDL = null;
}
// 关闭并清除内容
function closeDDL1() {
	var from = $(window.__createDDL);
	from.val("");
	from.next().val("");
	$('#___ewa_ddl').hide();
	window.__createDDL = null;
}
// 文本框根据输入内容自适应高度
// ref http://www.xuanfengge.com/demo/201308/textarea/demo2.html
var autoTextarea = function(elem, extra, maxHeight) {
	extra = extra || 0;
	var isFirefox = !!document.getBoxObjectFor || 'mozInnerScreenX' in window;
	var isOpera = !!window.opera && !!window.opera.toString().indexOf('Opera');
	var addEvent = function(type, callback) {
		elem.addEventListener ? elem.addEventListener(type, callback, false) : elem.attachEvent('on' + type, callback);
	};
	var getStyle1 = function(name) {
		if (elem.currentStyle) {
			return elem.currentStyle[name];
		} else {
			return getComputedStyle(elem, null)[name];
		}
	};
	var getStyle = function(name) {
		var val = getStyle1(name);

		if (name === 'height' && val.search(/px/i) !== 1) {
			var rect = elem.getBoundingClientRect();
			val = rect.bottom - rect.top - parseFloat(getStyle1('paddingTop')) - parseFloat(getStyle1('paddingBottom')) + 'px';
		}
		console.log(val);
		return val;
	};
	var minHeight = parseFloat(getStyle('height'));

	elem.style.resize = 'none';

	var change = function() {
		var scrollTop, height, padding = 0, style = elem.style;

		if (elem._length === elem.value.length)
			return;
		elem._length = elem.value.length;

		// padding = parseInt(getStyle('paddingTop')) + parseInt(getStyle('paddingBottom'));

		scrollTop = document.body.scrollTop || document.documentElement.scrollTop;

		elem.style.height = minHeight + 'px';
		if (elem.scrollHeight > minHeight) {
			if (maxHeight && elem.scrollHeight > maxHeight) {
				height = maxHeight - padding;
				style.overflowY = 'auto';
			} else {
				height = elem.scrollHeight - padding;
				style.overflowY = 'hidden';
			}
			style.height = height + extra + 'px';
			scrollTop += parseInt(style.height) - elem.currHeight;
			document.body.scrollTop = scrollTop;
			document.documentElement.scrollTop = scrollTop;
			elem.currHeight = parseInt(style.height);
		}
	};

	addEvent('propertychange', change);
	addEvent('input', change);
	addEvent('focus', change);
	change();
};