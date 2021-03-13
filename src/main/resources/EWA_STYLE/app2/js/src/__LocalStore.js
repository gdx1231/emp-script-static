EWA_App.LocalStore = {
	name: "EX_APP",
	getJson: function() {
		if (this.CFG) {
			return this.CFG;
		}
		if (window.localStorage[this.name]) {
			var v = window.localStorage[this.name];
			try {
				this.CFG = JSON.parse(v);
			} catch (e) {
				this.CFG = {};
			}
		} else {
			this.CFG = {};
		}
		return this.CFG;
	},
	selectCitys: function() {
		var o = this.getJson();
		if (o.selectCitys) {
			return o.selectCitys;
		} else {
			return [];
		}
	},
	addDefaultCity: function(id, text) {
		var citys = this.selectCitys();
		var new_citys = [{
			id: id,
			text: text
		}];
		for (var i = 0; i < citys.length; i++) {
			if (new_citys.length >= 10) {
				break;
			}
			var city = citys[i];
			if (city.id == id) {
				continue;
			}
			new_citys.push(city);
		}
		this.CFG.selectCitys = new_citys;
		this.save();
	},
	save: function() {
		window.localStorage[this.name] = JSON.stringify(this.CFG);
	},
	addRz: function(uid, code) {
		var o = this.getJson();
		o.rz = {
			uid: uid,
			code: code
		}
		this.save();
	},
	loadRz: function() {
		var o = this.getJson();
		return o.rz || {};
	},
	removeRz: function() {
		var o = this.getJson();
		delete o.rz;
		this.save();
	}
};
