/**
 * 用于表宽度的拖动 --未完成
 * 
 * @param instanceName
 */
function EWA_ListFrame_CellResizeClass(instanceName) {
	this._Name = instanceName;
	this._Table=null;
	this._Cover=null;
	this._CellResize = new Array();
	/**
	 * 初始化
	 * 
	 * @param objTable
	 *            目标表对象
	 */
	this.Init = function(objTable) {
		this._Table = objTable;
		this._Table.style.tableLayout = 'fixed';

		this._Table.style.width = this._Table.clientWidth + 'px';

		this._Cover = this._CreateElement('div', "width:100%; height:100%;background-color:blue; position:absolute; "
			+ "top:0px; left:0px; display:block; " + "filter:alpha(opacity=0);opacity:0", document.body);

		for (var i = 0; i < this._Table.rows[0].cells.length - 1; i++) {
			this._CreateMarker(i);
		}
		this._SetLocation();
	}

	this._ShowCover = function(isShow) {
		if (isShow) {
			this._Cover.style.display = 'block';
		} else {
			this._Cover.style.display = 'none';
		}
	}

	this._EventX = function(e) {
		return e.x ? e.x : e.pageX;
	}

	this._OnMouseDown = function(obj, evt) {
		this._ShowCover(true);
		obj.childNodes[0].style.borderLeft = '1px solid black';
		obj.setAttribute('D', 1);
		var e = evt ? evt : event;
		var x = this._EventX(e);
		obj.setAttribute('X', x);
		obj.setAttribute('SX', x);
		if (typeof e.preventDefault != "undefined") {
			e.preventDefault();
		}
		typeof e.stopPropagation != "undefined" ? e.stopPropagation() : e.cancelBubble = true;
	}

	this._OnMouseUp = function(obj, evt) {
		obj.childNodes[0].style.borderLeft = '1px';
		obj.setAttribute('D', 0);
		var e = evt ? evt : event;
		var x = this._EventX(e);

		var dx = x - obj.getAttribute('SX') * 1;
		var tdIndex = obj.getAttribute('TDINDEX');

		var td = this._Table.rows[0].cells[tdIndex];
		var px = td.clientWidth + dx;
		td.style.width = px < 4 ? 4 : px + 'px';
		this._SetLocation();

		if (typeof e.preventDefault != "undefined") {
			e.preventDefault();
		}
		typeof e.stopPropagation != "undefined" ? e.stopPropagation() : e.cancelBubble = true;
		// ccc.innerText=px;

	}

	this._OnMouseOut = function(obj, evt) {
		if (obj.getAttribute('D') == "1") {
			obj.style.left = obj.getAttribute('SX') + 'px';
			obj.setAttribute('D', 0);
			this._SetLocation();
			obj.childNodes[0].style.borderLeft = '1px';

		}
		this._ShowCover(false);
	}

	this._OnMouseMove = function(obj, evt) {
		this._ShowCover(true);

		if (obj.getAttribute('D') != '1')
			return;
		var e = evt ? evt : event;
		var x = this._EventX(e);

		var x0 = obj.getAttribute('X') * 1;
		var dx = x - x0;
		obj.style.left = obj.style.left.replace('px', '') * 1 + dx + 'px';
		obj.setAttribute('X', x);
		if (typeof e.preventDefault != "undefined") {
			e.preventDefault();
		}
		typeof e.stopPropagation != "undefined" ? e.stopPropagation() : e.cancelBubble = true;
	}

	this._CreateMarker = function(tdIndex) {
		var otd = this._Table.rows[0].cells[tdIndex];
		var style = 'width:40px; height:' + this._Table.clientHeight + 'px; position:absolute;cursor:e-resize';
		var obj = this._CreateElement('div', style, document.body);
		obj.setAttribute('TDINDEX', tdIndex);
		obj.setAttribute('instanceName', instanceName);

		obj.onmouseover = function() {
			var instanceName = this.getAttribute('instanceName');
			var myclass = eval('window.' + instanceName);
			myclass._ShowCover(true);
		}

		obj.onmousedown = function(event) {
			var instanceName = this.getAttribute('instanceName');
			var myclass = eval('window.' + instanceName);
			myclass._OnMouseDown(this, event);
		}

		obj.onmouseup = function(event) {
			var instanceName = this.getAttribute('instanceName');
			var myclass = eval('window.' + instanceName);
			myclass._OnMouseUp(this, event);

		}
		obj.onmouseout = function(event) {
			var instanceName = this.getAttribute('instanceName');
			var myclass = eval('window.' + instanceName);
			myclass._OnMouseOut(this, event);
		}

		obj.onmousemove = function(event) {
			var instanceName = this.getAttribute('instanceName');
			var myclass = eval('window.' + instanceName);
			myclass._OnMouseMove(this, event);
		}

		var obj1 = this._CreateElement('div', "width:1px;height:100%;position:absolute;top:0px;left:20px;border-Left:1px ;", obj);

		this._CellResize[tdIndex] = obj;
		obj = obj1 = null;
	}

	this._SetLocation = function() {
		for (var i = 0; i < this._Table.rows[0].cells.length - 1; i++) {
			var otd = this._Table.rows[0].cells[i];
			var xy = this._Location(otd);
			if (otd.style.width != "") {
				otd.style.width = otd.clientWidth + 'px';
			}
			this._CellResize[i].style.left = (xy[0] + otd.clientWidth - this._CellResize[i].clientWidth / 2) + 'px';
			this._CellResize[i].style.top = xy[1] + 'px';
		}

	}

	this._CreateElement = function(tagName, style, objParent) {
		var obj = document.createElement(tagName);
		if (style != null) {
			obj.style.cssText = style;
			obj.setAttribute('style', style);
		}
		if (objParent != null) {
			objParent.appendChild(obj);
		}
		return obj;
	}

	this._Location = function(obj) {
		var o1 = obj;
		var x, y;
		x = y = 0;
		do {
			x += o1.offsetLeft;
			y += o1.offsetTop;
			o1 = o1.offsetParent;
		} while (o1.tagName != 'BODY')

		return new Array(x, y);
	}

}
