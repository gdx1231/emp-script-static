function EWA_UI_LinkClass(obj1, obj2) {
	this.LinkObj1 = obj1;
	this.LinkObj2 = obj2;
	this.LinkObj = null;
	this._Style = '2px solid blue';
	this.getSize = function(obj) {
		var xy = EWA$UI$COMMON.GetPosition(obj);
		var s = {
			X : xy.X,
			Y : xy.Y,
			W : obj.offsetWidth,
			H : obj.offsetHeight
		};
		return s;
	};
	this._CreateLinkObj = function() {
		var tb = document.createElement('table');
		if (EWA.B.IE) {
			tb.style.cssText = 'position: absolute; width: 100px; height: 100px; z-index: -11; left: 693px; top: 174px;font-size:1px;';
		} else {
			tb.setAttribute('style',
				'position: absolute; width: 100px; height: 100px; z-index: -11; left: 693px; top: 174px;font-size:1px;');
		}
		tb.cellSpacing = 0;
		tb.cellPadding = 0;
		for (var i = 0; i < 2; i++) {
			var tr = tb.insertRow(-1);
			for (var m = 0; m < 2; m++) {
				var td = tr.insertCell(-1);
				td.innerHTML = '&nbsp;';
			}
		}
		document.body.appendChild(tb);
		this.LinkObj = tb;

	}
	this.Link = function() {
		if (this.LinkObj == null) {
			this._CreateLinkObj();
		}

		var top, left, height, width;
		this.LinkObj.rows[0].cells[0].style.border = '';
		this.LinkObj.rows[0].cells[1].style.border = '';
		this.LinkObj.rows[1].cells[0].style.border = '';
		this.LinkObj.rows[1].cells[1].style.border = '';

		var s1 = this.getSize(this.LinkObj1);
		var s2 = this.getSize(this.LinkObj2);
		if (s1.X + s1.W < s2.X) {
			left = s1.X + s1.W;
			width = s2.X - s1.X - s1.W;

			this.LinkObj.rows[0].cells[0].style.width = width / 2 + 'px';

		} else if (s1.X < s2.X) {
			left = s1.X - 20;
			width = s2.X - s1.X + 20;

			this.LinkObj.rows[0].cells[0].style.width = '20px';

		} else if (s1.X >= s2.X && s1.X < s2.X + s2.W) {
			left = s2.X - 20;
			width = s1.X - s2.X + 20;

			this.LinkObj.rows[0].cells[0].style.width = '20px';

		} else {
			left = s2.X + s2.W;
			width = s1.X - s2.X - s2.W;
			this.LinkObj.rows[0].cells[0].style.width = width / 2 + 'px';

		}

		if (s1.Y < s2.Y) {
			height = s2.Y - s2.H / 2 - s1.Y + s1.H / 2;
			top = s1.Y - s1.H / 2;
		} else {
			height = s1.Y - s1.H / 2 - s2.Y + s2.H / 2;
			top = s2.Y - s2.H / 2;
		}
		this.LinkObj.style.width = width + 'px';
		this.LinkObj.style.height = height + 'px';
		this.LinkObj.style.left = left + 'px';
		this.LinkObj.style.top = top + 'px';

		var c00 = this.LinkObj.rows[0].cells[0];
		var c01 = this.LinkObj.rows[0].cells[1];
		var c10 = this.LinkObj.rows[1].cells[0];
		var c11 = this.LinkObj.rows[1].cells[1];
		if (s1.Y < s2.Y) {
			if (s1.X + s1.W < s2.X) {
				c00.style.borderTop = this._Style;
				c00.style.borderRight = this._Style;
				c10.style.borderRight = this._Style;
				c11.style.borderBottom = this._Style;
			} else if (s1.X < s2.X) {
				c00.style.borderTop = this._Style;
				c00.style.borderLeft = this._Style;
				c10.style.borderLeft = this._Style;
				c11.style.borderBottom = this._Style;
				c10.style.borderBottom = this._Style;
			} else if (s1.X >= s2.X && s1.X < s2.X + s2.W) {
				c00.style.borderTop = this._Style;
				c00.style.borderLeft = this._Style;
				c10.style.borderLeft = this._Style;
				c01.style.borderTop = this._Style;
				c10.style.borderBottom = this._Style;
			} else {
				c01.style.borderTop = this._Style;
				c00.style.borderRight = this._Style;
				c10.style.borderRight = this._Style;
				c10.style.borderBottom = this._Style;

			}
		} else {
			if (s1.X + s1.W < s2.X) {
				c01.style.borderTop = this._Style;
				c00.style.borderRight = this._Style;
				c10.style.borderRight = this._Style;
				c10.style.borderBottom = this._Style;
			} else if (s1.X < s2.X) {
				c00.style.borderTop = this._Style;
				c01.style.borderTop = this._Style;
				c00.style.borderLeft = this._Style;
				c10.style.borderLeft = this._Style;
				c10.style.borderBottom = this._Style;
			} else if (s1.X >= s2.X && s1.X < s2.X + s2.W) {
				c00.style.borderTop = this._Style;
				c00.style.borderLeft = this._Style;
				c10.style.borderLeft = this._Style;
				c11.style.borderBottom = this._Style;
				c10.style.borderBottom = this._Style;
			} else {
				c00.style.borderTop = this._Style;
				c00.style.borderRight = this._Style;
				c10.style.borderRight = this._Style;
				c11.style.borderBottom = this._Style;
			}
		}
	}

}