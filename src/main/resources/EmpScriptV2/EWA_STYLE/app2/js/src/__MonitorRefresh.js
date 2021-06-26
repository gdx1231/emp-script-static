EWA_App.MonitorRefresh = {
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
		var c=this;
		this.timerHandle = setInterval(function() {
			c._check();
		}, 15);
	},
	stop : function() {
		window.clearInterval(this.timerHandle)
	},
	_check : function() {
		for ( var n in this.list) {
			var d = this.list[n];
			if (d == null) {
				continue;
			}
			var o=$('section#'+d);
		}
	}
};
