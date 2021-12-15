window.ewaBackgrounds = {
	staticPath: window.EWA && EWA.RV_STATIC_PATH ? EWA.RV_STATIC_PATH : "/EmpScriptV2",
	backgrounds: [
		"/backgrounds/Ubuntu/15266165381.jpg",
		"/backgrounds/Ubuntu/152661648622.jpg",
		"/backgrounds/Ubuntu/152661650382.jpg",
		"/backgrounds/Ubuntu/152661651342.jpg",
		"/backgrounds/Ubuntu/1526616480990.jpg",
		"/backgrounds/Ubuntu/1526616491790.jpg",
		"/backgrounds/Ubuntu/1526616497815.jpg",
		"/backgrounds/Ubuntu/1526616508896.jpg",
		"/backgrounds/Ubuntu/1526616517697.jpg",
		"/backgrounds/Ubuntu/1526616521273.jpg",
		"/backgrounds/Ubuntu/1526616526796.jpg",
		"/backgrounds/Ubuntu/1526616530254.jpg",
		"/backgrounds/Ubuntu/1526616534901.jpg",
		"/backgrounds/Ubuntu/1526616541182.jpg"
	],

	setBgRandom(refData) {
		let data = refData || this.backgrounds;
		let m = data.length;
		let r = Math.round(Math.random() * 1000);
		let v = r < m ? r : r % m;
		let s = data[v];
		this.setCss(s);
	}
	,
	setBg() {
		let s = window.localStorage["BG"];
		if (s == null) {
			this.setBgRandom(this.backgrounds);
			return;
		}
		this.setCss(s);
	},
	setCss(s) {
		let url = this.staticPath + s.replace(".200x150.jpg", "");
		if (url.endsWith(",1")) { // 平铺
			url = url.replace(",1", "");
			let css = {
				"background-repeat": "repeat",
				"background-size": "auto",
				'background-image': 'url(' + url + ')'
			};
			$('body').css(css);
		} else {
			let css = {
				"background-repeat": "no-repeat",
				"background-size": "cover",
				'background-image': 'url(' + url + ')'
			};
			$('body').css(css);
		}
	}
};