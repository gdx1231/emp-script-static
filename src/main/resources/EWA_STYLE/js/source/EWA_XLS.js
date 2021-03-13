function EWAXCell() {
	this._RowIndex = -1;
	this._ColIndex = -1;
	this._Value = null;
	this._Formula = null;
	this._EWAXRow = null;

	this.getRowIndex = function() {
		return this._RowIndex;
	}
	this.getColIndex = function() {
		return this._ColIndex;
	}

	this.setValue = function(val) {
		this._Value = val;
	}
	this.getValue = function() {
		return this._Value;
	}

	this.getFormula = function() {
		return this._Formula;
	}
	this.setFormula = function(formula) {
		this._Formula = formula;
	}
	this.getRow = function() {
		return this._EWAXRow;
	}
	this.getId = function() {
		return this._Id;
	}
	this.getCellHtmlObj = function() {
		return $(this._RowIndex + "_" + this._ColIndex);
	}
	this.getContentWidth = function() {
		var o = this.getCellHtmlObj();
		return o.childNodes[0].offsetWidth;
	}
	this.getContentHeight = function() {
		var o = this.getCellHtmlObj();
		return o.childNodes[0].offsetHeight;
	}
}

function EWAXRow() {
	this._RowIndex = -1;
	this._Id = null;

	this._Cells = new Array();
	/**
	 * 生成新Cell，如果已经存在，则覆盖
	 * 
	 * @param {Integer}
	 *            colIndex
	 * @return {EWAXCell}
	 */
	this.createCell = function(colIndex) {
		var cell = new EWAXCell();
		cell._EWAXRow = this;
		cell._ColIndex = colIndex;
		cell._RowIndex = this._RowIndex;
		this._Cells[colIndex] = cell;
		return cell;
	}
	this.deleteCell = function(colIndex) {
		if (this._Cells[colIndex] != null) {
			this._Cells[colIndex] = null;
		}
	}
	this.getCell = function(colIndex) {
		return this._Cells[colIndex];
	}
	this.getId = function() {
		return this._Id;
	}

}

function EWAXSheet(name) {
	this._Id = "SHEET_" + name;
	this._Rows = new Array();

	/**
	 * 获取列数
	 * 
	 * @return {Integer}
	 */
	this.getColsCount = function() {
		return this._Rows[0]._Cells.length;
	}

	/**
	 * 获取行数
	 * 
	 * @return {Integer}
	 */
	this.getRowsCount = function() {
		return this._Rows.length;
	}
	/**
	 * 生成数据行
	 * 
	 * @param {Integer}
	 *            rowIndex 行编号
	 * @return {EWAXRow} 行
	 */
	this.createRow = function(rowIndex) {
		var row = new EWAXRow();
		row._RowIndex = rowIndex;
		this._Rows[rowIndex] = row;
		row._Id = 'EWA_ROW_' + rowIndex;
		return this.getRow(rowIndex);
	}

	/**
	 * 获取行
	 * 
	 * @param {Integer}
	 *            rowIndex 行编号
	 * @return {EWAXRow} 行
	 */
	this.getRow = function(rowIndex) {
		return this._Rows[rowIndex];
	}

	this.getId = function() {
		return this._Id;
	}

	this.getCell = function(rowIndex, colIndex) {
		return this._Rows[rowIndex].getCell(colIndex);
	}
}

function EWAXHVCells() {
	this._HCells = new Array();
	this._VCells = new Array();
	this.addCell = function(objCell) {
		if (objCell.getType() == 'x') {
			this._HCells.push(objCell);
		} else {
			this._VCells.push(objCell);
		}
	}
	this.getCell = function(objHtml) {
		if (objHtml.getAttribute('rowIndex') != null) {
			return this._VCells[objHtml.getAttribute('rowIndex')];
		} else {
			return this._HCells[objHtml.getAttribute('colIndex')];
		}
	}

	this.setSplitsDLeft = function(hCell, dx) {
		var index = hCell.getIndex();
		for (var i = index + 1; i < this._HCells.length; i++) {
			var a = this._HCells[i].getHtmlSplitObj();
			EWAXUtils.setDLeft(a, dx);
		}
	}

	this.setHCellsDWidth = function(hCell, dx) {
		var index = hCell.getIndex();
		var sheet = EWAXUtils.UI.getSheet();
		for (var i = 0; i < sheet.getRowsCount(); i++) {
			var cell = sheet.getCell(i, index);
			if (i == 0) {
				EWAXUtils.setDWidth(cell.getHtmlObj().parentNode, dx);
			}
			EWAXUtils.setDWidth(cell.getHtmlObj(), dx);
		}

	}

}

function EWAXHCol() {
	this._Index = -1;
	this._Caption = null;
	this._Width = 90;
	this._Height = 20;
	this._HtmlObj = null;
	this._X = 0;

	this.getType = function() {
		return "x";
	}

	this.setIndex = function(index) {
		this._Index = index;
		this._Caption = EWAXUtils.createHorCaption(this._Index);
	}
	this.getIndex = function() {
		return this._Index;
	}
	this.getCaption = function() {
		return this._Caption;
	}
	this.setHeight = function(height) {
		this._Height = height;
	}

	this.getHeight = function() {
		return this._Height;
	}
	this.setHtmlObj = function(htmlObj) {
		this._HtmlObj = htmlObj;
	}
	this.getHtmlObj = function() {
		return this._HtmlObj;
	}

	this._HtmlSplitObj = null;
	this.setHtmlSplitObj = function(htmlObj) {
		this._HtmlSplitObj = htmlObj;
	}

	this.getHtmlSplitObj = function() {
		return this._HtmlSplitObj;
	}
	this.resize = function(width) {

	}
	this.getWidth = function() {
		return this._HtmlObj.clientWidth;
	}
	/**
	 * 设置相对宽度
	 * 
	 * @param {Number}
	 *            dWidth
	 */
	this.setDWidth = function(dWidth) {
		EWAXUtils.setDWidth(this._HtmlObj, dWidth);

	}
	this.setX0 = function(x0) {
		this._X0 = x0;
		this._X = x0;
	}
	this.setX = function(x) {
		var dx = x - this._X;
		if ((this.getWidth() + dx) < 20) {
			x = this._X - (this.getWidth() - 20);
			dx = x - this._X;
		}
		EWAXUtils.setDLeft(this._HtmlSplitObj, dx);
		this.setDWidth(dx);

		this._X = x;
	}
	this.getDX = function() {
		return this._X - this._X0;
	}

}

function EWAXVCol() {
	this._Index = -1;
	this._Caption = null;
	this._Width = 90;
	this._Height = 20;
	this._HtmlObj = null;
	this._MinHeight = 15;

	this.getType = function() {
		return "y";
	}

	this.setIndex = function(index) {
		this._Index = index;
		this._Caption = index + 1;
	}
	this.getIndex = function() {
		return this._Index;
	}
	this.getCaption = function() {
		return this._Caption;
	}
	this.setHeight = function(height) {
		this._Height = height;
	}
	this.getHeight = function() {
		return this._HtmlObj.clientHeight;
	}
	this.getHtmlObj = function() {
		return this._HtmlObj;
	}
	this.setHtmlObj = function(htmlObj) {
		this._HtmlObj = htmlObj;
	}
	this.resize = function(width) {

	}

	this._HtmlSplitObj = null;
	this.setHtmlSplitObj = function(htmlObj) {
		this._HtmlSplitObj = htmlObj;
	}

	this.getHtmlSplitObj = function() {
		return this._HtmlSplitObj;
	}

	/**
	 * 设置相对高度
	 * 
	 * @param {Number}
	 *            dHeight
	 */
	this.setDHeight = function(dHeight) {
		EWAXUtils.setDHeight(this._HtmlObj, dHeight);
	}

	this.setY0 = function(y0) {
		this._Y0 = y0;
		this._Y = y0;
	}
	this.setY = function(y) {
		var dy = y - this._Y;
		if ((this.getHeight() + dy) < this._MinHeight) {
			y = this._Y - (this.getHeight() - this._MinHeight);
			dy = y - this._Y;
		}
		EWAXUtils.setDTop(this._HtmlSplitObj, dy);
		this.setDHeight(dy);
		this._Y = y;
	}

	this.getDY = function() {
		return this._Y - this._Y0;
	}
}

function EWAXWebUI() {
	this._VCols = new Array();
	this._HCols = new Array();

	this._CellHorMarked = null;
	this._CellVerMarked = null;

	/**
	 * EWAXSheet对象
	 * 
	 * @type EWAXSheet
	 */
	this._Sheet = null;

	this.freezeRow = function(rowsLen) {
		var rowObj = $('xlsVer').childNodes[0].childNodes[0];
		var dataObj = $('xlsContainer').childNodes[0];

		for (var i = 0; i < dataObj.rows.length; i++) {
			for (var m = 0; m < rowsLen; m++) {
				var td = rowObj.rows[i].insertCell(-1);
				var td0 = dataObj.rows[i].cells[m];
				td.innerHTML = td0.innerHTML;
				var w1 = td0.clientWidth;

				EWAXUtils.setWidth(td, w1);
			}
		}
		var conObj = $('xlsVer');
		// EWAXUtils.setDLeft(conObj,w);
		EWAXUtils.setWidth(conObj, rowObj.offsetWidth);
		conObj.style.borderRight = '2px red solid'
	}

	this.createFrameUI = function() {
		var main = EWAXUtils.createFrame();

		document.body.innerHTML = "";
		document.body.appendChild(main);

		this.resizeXls();

		this._CreateDataUI();

		this._CreateHorCells();
		this._CreateVerCells();

	}

	this.resizeXls = function() {
		var objMain = document.getElementById('xlsMain');
		var w = document.documentElement.clientWidth;
		var h = document.documentElement.clientHeight;

		objMain.style.width = w + 'px';
		objMain.style.height = h + 'px';

		var objHor = document.getElementById('xlsHor');
		objHor.style.width = (w - 35 - 20) + 'px';

		var objVer = document.getElementById('xlsVer');
		objVer.style.height = (h - 20 - 20) + 'px';

		var objContainer = document.getElementById('xlsContainer');
		objContainer.style.width = (w - 35) + 'px';
		objContainer.style.height = (h - 20) + 'px';
	}

	this._CreateVerCells = function() {
		var objVer = document.getElementById('xlsVer');
		var objHorFrame = EWAXUtils.createVerFrame();
		objVer.appendChild(objHorFrame);

		var dataTb = document.getElementById("xlsContainer").childNodes[0];

		for (var i = 0; i < this._VCols.length; i++) {

			var tr = objHorFrame.childNodes[0].insertRow(-1);
			var td = tr.insertCell(-1);
			td.setAttribute('rowIndex', i);
			td.onmousedown = function() {
				EWAXUtils.UI.onMarkedMouseDown(this);
			}
			td.innerHTML = this._VCols[i].getCaption();

			this._VCols[i].setHtmlObj(td);

			var vSplit = EWAXUtils.createVerSplit(this._VCols[i]);
			this._VCols[i].setHtmlSplitObj(vSplit);
			objHorFrame.appendChild(vSplit);
		}
		this._ResetVSplitTop();
	}

	/**
	 * 设置Y向移动位置
	 */
	this._ResetVSplitTop = function() {
		var dataTb = document.getElementById("xlsContainer").childNodes[0];
		for (var i = 0; i < this._VCols.length; i++) {
			var y = dataTb.rows[i].cells[0].offsetTop
					+ dataTb.rows[i].cells[0].offsetHeight - 4;
			EWAXUtils.setTop(this._VCols[i].getHtmlSplitObj(), y);

			var h = EWA.B.IE
					? dataTb.rows[i].cells[0].clientHeight
					: dataTb.rows[i].cells[0].offsetHeight;
			EWAXUtils.setHeight(this._VCols[i].getHtmlObj(), h);
			this._VCols[i].getHtmlObj().innerHTML = this._VCols[i].getHtmlObj().innerHTML;
		}
	}

	this._CreateHorCells = function() {
		var objHor = document.getElementById('xlsHor');
		var objHorFrame = EWAXUtils.createHorFrame();

		objHor.appendChild(objHorFrame);

		var dataTb = document.getElementById("xlsContainer").childNodes[0];

		var tr = objHorFrame.childNodes[0].insertRow(-1);
		for (var i = 0; i < this._HCols.length; i++) {
			var td = tr.insertCell(-1);
			td.innerHTML = this._HCols[i].getCaption();
			td.setAttribute('colIndex', i);
			this._HCols[i].setHtmlObj(td);
			td.onmousedown = function() {
				EWAXUtils.UI.onMarkedMouseDown(this);
			}
			var hSplit = EWAXUtils.createHorSplit(this._HCols[i]);
			objHorFrame.appendChild(hSplit);
			this._HCols[i].setHtmlSplitObj(hSplit);
		}
		this._ResetHSplitLeft();
	}
	/**
	 * 设置Y向移动位置
	 */
	this._ResetHSplitLeft = function() {
		var dataTb = document.getElementById("xlsContainer").childNodes[0];
		for (var i = 0; i < this._HCols.length; i++) {
			var hSplit = this._HCols[i].getHtmlSplitObj();
			var x = dataTb.rows[0].cells[i].offsetLeft
					+ dataTb.rows[0].cells[i].offsetWidth - 4;

			EWAXUtils.setLeft(hSplit, x);

			var w = EWA.B.IE
					? dataTb.rows[0].cells[i].clientWidth
					: dataTb.rows[0].cells[i].offsetWidth;
			EWAXUtils.setWidth(this._HCols[i].getHtmlObj(), w);

		}
	}
	this._CreateDataUI = function() {
		var tb = $('xlsContainer').childNodes[0];
		for (var i = 0; i < this._Sheet.getRowsCount(); i++) {
			var row = this._Sheet.getRow(i);
			var tbRow = tb.insertRow(-1);
			for (var m = 0; m < row._Cells.length; m++) {
				var cell = row.getCell(m);
				var tbTd = tbRow.insertCell(-1);
				tbTd.id = cell.getRowIndex() + "_" + cell.getColIndex();
				tbTd.className = 'xlsCell';
				tbTd.innerHTML = "<nobr></nobr>";
				if (m > 0) {
					tbTd.style.height = '4px';
				}
				tbTd.childNodes[0].innerHTML = cell.getValue();
				tbTd.onmousedown = function() {
					EWAXUtils.UI.onCellMouseDown(this);
				}
			}
		}
	}

	/**
	 * 设置Sheet
	 * 
	 * @param {EWAXSheet}
	 *            sheet
	 */
	this.setSheet = function(sheet) {
		this._Sheet = sheet;
		for (var i = 0; i < sheet.getRowsCount(); i++) {
			var vCol = new EWAXVCol();
			vCol.setIndex(i);
			vCol.setHeight(20);
			this._VCols[i] = vCol;
		}
		for (var i = 0; i < sheet.getColsCount(); i++) {
			var hCol = new EWAXHCol();
			hCol.setIndex(i);
			hCol.setHeight(20);
			this._HCols[i] = hCol;
		}
	}
	/**
	 * 
	 * @return {EWAXSheet}
	 */
	this.getSheet = function() {
		return this._Sheet;
	}

	this.getCell = function(rowIndex, colIndex) {
		return this._Sheet.getRow(rowIndex).getCell(colIndex);
	}

	this._GetCellMark = function() {
		return $('xlsCellMark');
	}

	this.onMarkedMouseDown = function(obj) {
		window.EWA_MARKED_OBJ = obj;
		if (obj.getAttribute('rowIndex') != null) {
			this.onRowMouseDown(obj);
		} else if (obj.getAttribute('colIndex') != null) {
			this.onColMouseDown(obj);
		} else {
			this.onCellMouseDown(obj);
		}
	}

	this.onCellMouseDown = function(cellHtmlObj) {
		var ids = cellHtmlObj.id.split('_');
		var rowIndex = ids[0];
		var colIndex = ids[1];

		var x = cellHtmlObj.offsetLeft;
		var y = cellHtmlObj.offsetTop;
		var w = cellHtmlObj.clientWidth;
		var h = cellHtmlObj.offsetHeight;
		
		if(EWA.B.GOOGLE){ //why google????
			y=y-h/2+8;
		}

		this._ShowCellMark(x, y, w, h);

		this._CellHorVerMarked(rowIndex, colIndex);
	};

	/**
	 * 点击行
	 * 
	 * @param {nsIDOMElement}
	 *            rowObj
	 */
	this.onRowMouseDown = function(rowObj) {
		var rowIndex = rowObj.getAttribute('rowIndex') * 1;
		var x = 0;
		var y = rowObj.offsetTop;

		var cellParent = $("xlsContainer").childNodes[0];
		var w = cellParent.clientWidth;
		var h = rowObj.offsetHeight;
		if (EWA.B.GOOGLE) { // why google?
			y = y - h / 2 + 8;
		}
		this._ShowCellMark(x, y, w, h);
		this._CellHorVerMarked(rowIndex);

	}
	this.onColMouseDown = function(colObj) {
		var colIndex = colObj.getAttribute('colIndex') * 1;

		var y = 0;
		var x = colObj.offsetLeft;

		var cellParent = $("xlsContainer").childNodes[0];
		var w = colObj.clientWidth;
		var h = cellParent.clientHeight;

		this._ShowCellMark(x, y, w, h);
		this._CellHorVerMarked(null, colIndex);
	}

	/**
	 * 显示选择框
	 * 
	 * @param {Integer}
	 *            x
	 * @param {Integer}
	 *            y
	 * @param {Integer}
	 *            w
	 * @param {Integer}
	 *            h
	 */
	this._ShowCellMark = function(x, y, w, h) {
		var mark = this._GetCellMark();
		with (mark.style) {
			display = 'block';
			left = (x - 2) + 'px';
			top = (y - 2) + 'px';
			width = w + 'px';
			height = h + 'px';
		}
	}
	this._CellHorVerMarked = function(rowIndex, colIndex) {
		if (this._CellVerMarked != null) {
			this._CellVerMarked.style.backgroundColor = '';
			this._CellVerMarked = null;
		}

		if (this._CellHorMarked != null) {
			this._CellHorMarked.style.backgroundColor = '';
			this._CellHorMarked = null;
		}

		if (rowIndex != null) {
			this._CellVerMarked = $('xlsVer').childNodes[0].childNodes[0].rows[rowIndex].cells[0];
			this._CellVerMarked.style.backgroundColor = 'yellow';
		}
		if (colIndex != null) {
			this._CellHorMarked = $('xlsHor').childNodes[0].childNodes[0].rows[0].cells[colIndex];
			this._CellHorMarked.style.backgroundColor = 'yellow';
		}
	}

	this.onGlobalMouseDown = function(event) {
		var e = (event == null ? window.event : event);
		var obj = EWA.B.IE ? e.srcElement : e.target;
		if (obj == null) {
			return;
		}

		if (obj.getAttribute('EWA_MOVE') != "1") {
			window._EWA_MOVE_OBJ = null;
			return;
		}
		var xy = EWA.UI.Utils.GetMousePosition(event);

		if (obj.getAttribute('EWA_MOVE_TYPE').indexOf('x') >= 0) {
			var colIndex = obj.getAttribute('colIndex') * 1;
			window._EWA_MOVE_OBJ = this._HCols[colIndex];
			window._EWA_MOVE_OBJ.setX0(xy.X);
		} else if (obj.getAttribute('EWA_MOVE_TYPE').indexOf('y') >= 0) {
			var rowIndex = obj.getAttribute('rowIndex') * 1;
			window._EWA_MOVE_OBJ = this._VCols[rowIndex];
			window._EWA_MOVE_OBJ.setY0(xy.Y);
		}
		obj.childNodes[0].style.display = '';
	}
	this.onGlobalMouseMove = function(event) {
		if (window._EWA_MOVE_OBJ == null) {
			return;
		}
		var split = window._EWA_MOVE_OBJ;
		var xy = EWA.UI.Utils.GetMousePosition(event);

		if (split.getType() == 'x') { // 横向移动
			split.setX(xy.X);
		} else if (split.getType() == 'y') {
			split.setY(xy.Y);
		}
	}
	this.onGlobalMouseUp = function(event) {
		if (window._EWA_MOVE_OBJ == null) {
			return;
		}
		var a = window._EWA_MOVE_OBJ;
		if (a.getType() == 'x') {
			var colIndex = a.getIndex();
			var dx = a.getDX();
			this.setColWidth(colIndex, dx + $('0_' + colIndex).clientWidth);
		} else if (a.getType() == 'y') {
			var rowIndex = a.getIndex();
			var dy = a.getDY();
			this.setRowHeight(rowIndex, dy + $(rowIndex + '_0').clientHeight)
		}
		// a.childNodes[0].style.display = 'none';
		window._EWA_MOVE_OBJ = a = null;
		this.onContainerScroll();

		// 清除选中标记
		if (window.EWA_MARKED_OBJ != null) {
			this.onMarkedMouseDown(window.EWA_MARKED_OBJ);
		}
	}
	this.onContainerScroll = function() {
		var obj = $('xlsContainer');
		var objHor = $('xlsHor');
		var objVer = $('xlsVer');
		EWAXUtils.setLeft(objHor.childNodes[0], 0 - obj.scrollLeft);
		EWAXUtils.setTop(objVer.childNodes[0], 0 - obj.scrollTop);
	}

	this.onSplitDblClick = function(objSplit) {
		if (objSplit.getAttribute('colIndex') != null) {
			var colIndex = objSplit.getAttribute('colIndex') * 1;
			var split = this._HCols[colIndex];
			var w = this._CalcCellsMaxWidth(colIndex);
			this.setColWidth(colIndex, w);
		} else if (objSplit.getAttribute('rowIndex') != null) {
			var rowIndex = objSplit.getAttribute('rowIndex') * 1;
			var split = this._VCols[colIndex];
			var h = this._CalcCellsMaxHeight(rowIndex);
			this.setRowHeight(rowIndex, h);
		}
		this.onContainerScroll();
		// 清除选中标记
		if (window.EWA_MARKED_OBJ != null) {
			this.onMarkedMouseDown(window.EWA_MARKED_OBJ);
		}
	}
	this._CalcCellsMaxWidth = function(colIndex) {
		var w = 0;
		for (var i = 0; i < this.getSheet().getRowsCount(); i++) {
			var w1 = this.getSheet().getCell(i, colIndex).getContentWidth() + 4;
			if (w1 > w) {
				w = w1;
			}
		}
		return w;
	}
	this._CalcCellsMaxHeight = function(rowIndex) {
		var w = 0;
		for (var i = 0; i < this.getSheet().getColsCount(); i++) {
			var w1 = this.getSheet().getCell(rowIndex, i).getContentHeight()
					+ 4;
			if (w1 > w) {
				w = w1;
			}
		}
		return w;
	}

	this.setColWidth = function(colIndex, w) {
		var dx = w - $('0_' + colIndex).clientWidth;
		// 设置Cells的宽度
		var c0 = $('0_' + colIndex);
		EWAXUtils.setDWidth(c0, dx);

		this._ResetHSplitLeft();
	}

	this.setRowHeight = function(rowIndex, h) {
		var dy = h - $(rowIndex + '_0').clientHeight;

		// 设置Cells的宽度
		var c0 = $(rowIndex + '_0');
		EWAXUtils.setDHeight(c0, dy);

		this._ResetVSplitTop();

		c0.innerHTML = c0.innerHTML;
	}
}

var EWAXUtils = {};
EWAXUtils.UI = new EWAXWebUI();
/**
 * 生成标题行格子
 * 
 * @param {EWAXHCol}
 *            col
 * @return {nsIDOMElement}
 */
EWAXUtils.createHorCell = function(hCol) {
	var s1 = "<div class='xlsHorCell' colIndex='" + hCol.getIndex()
			+ "'  onmousedown='EWAXUtils.UI.onMarkedMouseDown(this)'>"
			+ hCol.getCaption() + "</div>";
	hCol.setHtmlObj(EWAXUtils.convertToHtmlObj(s1));
	return hCol.getHtmlObj();
}
/**
 * 生成设置宽度对象
 * 
 * @param {EWAXHCol}
 *            hCol
 * @return {nsIDOMElement}
 */
EWAXUtils.createHorSplit = function(hCol) {
	var s1 = "<div class='xlsHorSplit' ondblclick='EWAXUtils.UI.onSplitDblClick(this)'  EWA_MOVE='1' EWA_MOVE_TYPE='x' "
			+ "id='xlsCol" + hCol.getIndex() + "' ><div></div></div>"
	var o1 = EWAXUtils.convertToHtmlObj(s1);
	o1.setAttribute('colIndex', hCol.getIndex());
	hCol.setHtmlSplitObj(o1);
	return o1;
}

/**
 * 生成列头框架
 * 
 * @return {nsIDOMElement}
 */
EWAXUtils.createHorFrame = function() {
	var w = EWAXUtils.UI.getSheet().getColsCount() * 91;
	var s2 = '<div style="height:20px; position: absolute; top:0px;;left:0px; width:'
			+ w
			+ 'px; " onselectstart="return false;"><table border="0" cellpadding="0" cellspacing="1"></table></div>';
	return EWAXUtils.convertToHtmlObj(s2);
}

/**
 * 生成设置宽度对象
 * 
 * @param {EWAXVCol}
 *            hCol
 * @return {nsIDOMElement}
 */
EWAXUtils.createVerSplit = function(vCol) {
	var s1 = "<div class='xlsVerSplit' ondblclick='EWAXUtils.UI.onSplitDblClick(this)'   EWA_MOVE='1' EWA_MOVE_TYPE='y' "
			+ "id='xlsVCol" + vCol.getIndex() + "' ><div></div></div>"
	var o1 = EWAXUtils.convertToHtmlObj(s1);
	o1.setAttribute('rowIndex', vCol.getIndex());
	vCol.setHtmlSplitObj(o1);
	return o1;
}

/**
 * 生成左侧序号标记的框架
 * 
 * @return {nsIDOMElement}
 */
EWAXUtils.createVerFrame = function() {
	var s2 = '<div style="width:35px; position: absolute; top:0px;;left:0px;">'
			+ '<table border="0" cellpadding="0" cellspacing="1"></table></div>';
	return EWAXUtils.convertToHtmlObj(s2);
}

EWAXUtils.createFrame = function() {
	var w = EWAXUtils.UI.getSheet().getColsCount() * 91;
	var h = EWAXUtils.UI.getSheet().getRowsCount() * 21;
	var s1 = '<div  id="xlsMain" onselectstart="return false">'
			+ '<div id="xlsMark"></div>'
			+ '<div id="xlsHor"></div>'
			+ '<div id="xlsVer"></div>'
			+ '<div id="xlsContainer" onscroll="EWAXUtils.UI.onContainerScroll()">'
			+ '<table border=0 cellpadding=0 cellspacing=1></table>'
			+ EWAXUtils.createMarker() + '</div></div>';
	return EWAXUtils.convertToHtmlObj(s1);
}

EWAXUtils.createMarker = function() {
	var s1 = '<div id="xlsCellMark"><div id="xlsCellMark_01"></div><div id="xlsCellMark_02"></div></div>';
	return s1;
}

EWAXUtils._TempObj = null;
EWAXUtils._HorChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
/**
 * 转换Html字符串到对象
 * 
 * @param {String}
 *            sHtml
 */
EWAXUtils.convertToHtmlObj = function(sHtml) {
	if (EWAXUtils._TempObj == null) {
		EWAXUtils._TempObj = document.createElement('div');
	}
	EWAXUtils._TempObj.innerHTML = sHtml;
	return EWAXUtils._TempObj.childNodes[0];
}

EWAXUtils.createHorCaption = function(m) {
	var b = m % EWAXUtils._HorChars.length;
	var a = m / EWAXUtils._HorChars.length;
	var s1 = '';
	if (a >= 1) {
		a = parseInt(a);
		s1 += EWAXUtils._HorChars.substring(a - 1, a);
	}
	s1 += EWAXUtils._HorChars.substring(b, b + 1);
	return s1;
}
EWAXUtils.createRow = function(rowIndex) {
	var s1 = "<div id='ROW_" + rowIndex + "' class='xlsRow'></div>";
	return EWAXUtils.convertToHtmlObj(s1);
}
/**
 * 设置Html对象的相对宽度
 * 
 * @param {}
 *            htmlObj
 * @param {}
 *            dWidth
 */
EWAXUtils.setDWidth = function(htmlObj, dWidth) {
	var w = EWA.B.IE ? htmlObj.clientWidth : htmlObj.offsetWidth;
	EWAXUtils.setWidth(htmlObj, w + dWidth);
}
EWAXUtils.setWidth = function(htmlObj, width) {
	htmlObj.style.width = width + 'px';
}

/**
 * 设置省对高度
 * 
 * @param {}
 *            htmlObj
 * @param {}
 *            dHeight
 */
EWAXUtils.setDHeight = function(htmlObj, dHeight) {
	var h = EWA.B.IE ? htmlObj.clientHeight : htmlObj.offsetHeight;
	EWAXUtils.setHeight(htmlObj, h + dHeight);
}
/**
 * 设置高度
 * 
 * @param {}
 *            htmlObj
 * @param {}
 *            height
 */
EWAXUtils.setHeight = function(htmlObj, height) {
	htmlObj.style.height = height + 'px';
}

/**
 * 设置Html对象的相对Left
 * 
 * @param {}
 *            htmObj
 * @param {}
 *            dX
 */
EWAXUtils.setDLeft = function(htmlObj, dX) {
	EWAXUtils.setLeft(htmlObj, htmlObj.offsetLeft + dX);
}
EWAXUtils.setLeft = function(htmlObj, x) {
	htmlObj.style.left = x + 'px';
}

/**
 * 设置Html对象的相对Left
 * 
 * @param {}
 *            htmObj
 * @param {}
 *            dY
 */
EWAXUtils.setDTop = function(htmlObj, dY) {
	EWAXUtils.setTop(htmlObj, htmlObj.offsetTop + dY);
}
EWAXUtils.setTop = function(htmlObj, y) {
	htmlObj.style.top = y + 'px';
}
