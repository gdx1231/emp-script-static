/**
 * cfg:{ country: "COUNTRY", province: "STATEORPROVINCE", city: "CITY1", zip:
 * "POSTALCODE", lat: "", lng: "" },
 */
function EWA_UI_MapClass(cfg, from_id) {
	this.cfg = cfg;
	this._FromId = from_id; // 来源输入框的id
	this.showFull = function() {
		var map_id = 'div$' + this._FromId + '$MAP1';
		var map_box_id = map_id + 'd';
		if (!$X(map_id)) {
			var s = "<div class='ewa-map-full' id='" + map_id + "'><div class='ewa-map-full-cnt' id='" + map_box_id + "'></div>"
				+ "<p title='退出全屏' onclick='$(this.parentNode).hide();' class='fa fa-power-off' id='" + map_id + "1p'></p></div>";
			$('body').append(s);
		}
		var o = $($X(map_id));
		o.show();
		this.gps1 = new EWA_GMapClass();
		this.gps1.init(14);
		var lngLat = this.getLngLat();
		var home_lng = lngLat[0];
		var home_lat = lngLat[1];

		if (home_lng && home_lat) {
			this.gps1.showMap(map_box_id, home_lng, home_lat, $X(this._FromId).value);
		} else {
			this.search_addr($X(this._FromId), this.gps1, map_box_id);
		}
	};
	this.getLngLat = function() {
		var home_lng;
		if (this.cfg.lng) {
			home_lng = $X(this.cfg.lng).value;
		} else {
			home_lng = $($X(this._FromId + '_LNG')).val();
			if (!home_lng) {
				home_lang = $($X(this._FromId.split('_')[0] + '_LNG')).val();
			}
		}
		var home_lat;
		if (this.cfg.lat) {
			home_lat = $X(this.cfg.lat).value;
		} else {
			home_lat = $($X(this._FromId + '_LAT')).val();
			if (!home_lat) {
				home_lat = $($X(this._FromId.split('_')[0] + '_LAT')).val();
			}
		}
		return [ home_lng, home_lat ];
	};
	this.init = function() {
		var this_class_name = this._FromId + '$MAPClass';
		var this_id = 'div$' + this._FromId + '$MAP';
		var c = this;
		addEvent($X(this._FromId), 'blur', function() {
			c.search_addr(this, c.gps, this_id);
		});
		var tr = $X(this._FromId).parentNode.parentNode;
		var newTr = tr.parentNode.insertRow(tr.rowIndex + 1);
		var newTd = newTr.insertCell(-1);
		newTd.innerHTML = "<div class='ewa-map-small'><div class='ewa-map-small-cnt' id='" + this_id + "'></div>"
			+ "<div class='ewa-map-full-but' title='全屏查看' onclick='" + this_class_name
			+ ".showFull()'><b class='fa fa-square-o'></b></div>" + "</div>";
		newTd.colSpan = tr.cells.length;
		newTd.className = 'ewa-map-small-td';

		this.gps = new EWA_GMapClass();
		this.gps.init(10);

		var lngLat = this.getLngLat();
		var home_lng = lngLat[0];
		var home_lat = lngLat[1];

		if (home_lng && home_lat) {
			this.gps.showMap(this_id, home_lng, home_lat, $X(this._FromId).value);
		} else {
			this.search_addr($X(this._FromId), this.gps, this_id);
		}
	};
	this.setSearchResult = function(rst1, gps, pid) {
		var c = this;
		if (c.cfg.lng) {
			$X(c.cfg.lng).value = rst1.Q_LNG;
		} else {
			if ($X(c._FromId + '_LNG')) {
				$X(c._FromId + '_LNG').value = rst1.Q_LNG; // 经度
			}
			if ($X(c._FromId.split('_')[0] + '_LNG')) {
				$X(c._FromId.split('_')[0] + '_LNG').value = rst1.Q_LNG; // 经度
			}
		}
		if (c.cfg.lat) {
			$X(c.cfg.lat).value = rst1.Q_LAT;
		} else {
			if ($X(c._FromId + '_LAT')) {
				$X(c._FromId + '_LAT').value = rst1.Q_LAT; // 纬度
			}
			if ($X(c._FromId.split('_')[0] + '_LAT')) {
				$X(c._FromId.split('_')[0] + '_LAT').value = rst1.Q_LAT; // 纬度
			}
		}
		if (c.cfg.zip) {
			$X(c.cfg.zip).value = rst1.Q_ZIP || "";
		} else {
			if ($X(c._FromId + '_ZIP')) {
				$X(c._FromId + '_ZIP').value = rst1.Q_ZIP; // zip
			}
			if ($X(c._FromId.split('_')[0] + '_ZIP')) {
				$X(c._FromId.split('_')[0] + '_ZIP').value = rst1.Q_ZIP; // zip
			}
		}
		if (c.cfg.province) {
			$X(c.cfg.province).value = rst1.Q_STATE || "";
		} else {
			if ($X(c._FromId + '_STATE')) {
				$X(c._FromId + '_STATE').value = rst1.Q_STATE; // 州
			}
			if ($X(c._FromId.split('_')[0] + '_STATE')) {
				$X(c._FromId.split('_')[0] + '_STATE').value = rst1.Q_STATE; // 州
			}
		}
		if (c.cfg.city) {
			$X(c.cfg.city).value = rst1.Q_CITY || "";
		}
		if (c.cfg.country) {
			$X(c.cfg.country).value = rst1.Q_COUNTRY || "";
		}

		var position = gps.showMap(pid, rst1.Q_LNG, rst1.Q_LAT, rst1.Q_SEARCH);
		gps.map.setCenter(position);
		//查询完地址附加的方法，外部定义
		if(this.searchResultAfter){
			this.searchResultAfter(rst1);
		}
		
	};
	this.search_addr = function(obj, gps, pid) {
		var addr = obj.value;
		if (addr == '') {
			return;
		}
		var c = this;

		var ss = [ addr ];
		if (c.cfg.city) {
			ss.push($X(c.cfg.city).value);
		}
		if (c.cfg.province) {
			ss.push($X(c.cfg.province).value);
		}
		if (c.cfg.country) {
			ss.push($X(c.cfg.country).value);
		}
		var addr1 = ss.join(', ');
		// console.log(addr1);
		gps.getGpsFromAddress(addr1, function(addr, result, rst1) {
			// console.log(rst1);
			c.setSearchResult(rst1, gps, pid);
		});
	};
}