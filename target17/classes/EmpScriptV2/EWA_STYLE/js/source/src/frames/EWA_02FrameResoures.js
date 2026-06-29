function EWA_FrameResourceDescription() {
	this.Lang=null;
	this.Info=null;
	this.Memo=null;
}

function EWA_FrameResoure() {
	this.Name=null;
	this.Descriptions = {};
	this.GetDescription = function() {
		var d = this.Descriptions[EWA.LANG];
		if (d == null) {
			for ( var a in this.Description) {
				return this.Description[a];
			}
		}
		return d;
	}
	this.GetInfo = function() {
		var d = this.GetDescription();
		if (d == null)
			return null;
		return d.Info;
	}
	this.GetMemo = function() {
		var d = this.GetDescription();
		if (d == null)
			return null;
		return d.Memo;
	}

}

function EWA_FrameResoures() {
	this.Init = function(xmlClass) {
		var res = xmlClass.GetElements("root/PageInfo");
		if (res == null) {
			return;
		}
		for (var i = 0; i < res.length; i += 1) {
			var r = new EWA_FrameResoure();
			r.Name = res[i].getAttribute('Name');
			var nl = xmlClass.GetElements("Set", res[i]);
			for (var m = 0; m < nl.length; m++) {
				var d = new EWA_FrameResourceDescription();
				d.Info = nl[m].getAttribute('Info');
				d.Memo = nl[m].getAttribute('Memo');
				d.Lang = nl[m].getAttribute('Lang');
				r.Descriptions[d.Lang] = d;
			}
			this[r.Name] = r;
		}
		this.ReplaceResById();
		this.ReplaceRes();
	};
	this.ReplaceResById = function() {
		for ( var name in this) {
			var o = this[name];
			var o1 = $X(name);
			if (!o1) {
				continue;
			}
			var t = o1.tagName.toLowerCase();
			if (t == 'input') {
				o1.value = o.GetInfo();
				o1.title = o.GetMemo();
			} else {
				o1.innerHTML = o.GetInfo();
				o1.title = o.GetMemo();
			}
		}
	}
	this.ReplaceRes = function() {
		var a = new Array();
		a.push(document.getElementsByTagName('div'));
		a.push(document.getElementsByTagName('span'));
		a.push(document.getElementsByTagName('input'));
		a.push(document.getElementsByTagName('button'));
		for (var m = 0; m < a.length; m++) {
			var objs = a[m];
			for (var i = 0; i < objs.length; i += 1) {
				var id = objs[i].getAttribute('res');
				if (id == null) {
					continue;
				}
				id = id.trim();
				if (id.indexOf('EWA.F.FOS') == 0 && (id.indexOf('.Resources.') > 0 || id.indexOf('.Resources[') > 0)) {
					var v = "";
					try {
						v = eval(id);
					} catch (e) {
						v = e.message;
					}
					if (objs[i].tagName == 'INPUT') {
						objs[i].value = v;
					} else {
						objs[i].innerHTML = v;
					}
				}
			}
		}
		a.length = 0;
		a = null;
	}
}
