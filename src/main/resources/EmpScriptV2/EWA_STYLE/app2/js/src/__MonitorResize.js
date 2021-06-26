/**
 * 监控IScroll的对象的高度/宽度的变化
 */
EWA_App.MonitorResize = {
	list : [],
	add : function(obj, func) {
		var o = {};
		o.obj = obj;
		o.h = $(obj).height();
		o.w = $(obj).width();
		o.f = func;
		this.list.push(o);
		if (this.list.length == 1) {
			this.start();
		}
	},
	start : function() {
		this.timerHandle = setInterval(function() {
			EWA_App.MonitorResize._check();
		}, 15);
	},
	stop : function() {
		window.clearInterval(this.timerHandle)
	},
	_check : function() {

		var t = new Date().getTime(); // 当前的时间
		for ( var n in this.list) {
			var d = this.list[n];
			if (d == null) {
				continue;
			}

			if (!document.contains(d.obj)) {
				// 对象不存在了
				d.obj = null; // 引用的对象
				this.list[n] = null;
				return;
			}
			var w = $(d.obj).width();
			var h = $(d.obj).height();
			if (w == d.w && h == d.h) {
				continue;
			}
			d.ow = d.w;
			d.oh = d.h;
			d.w = w;
			d.h = h;
			if (d.f) {
				// console.log(d, w, h);
				d.f(d, t);
			}

		}
	}
};
