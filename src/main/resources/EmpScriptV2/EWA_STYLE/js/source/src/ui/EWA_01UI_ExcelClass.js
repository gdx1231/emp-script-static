/**
 * excel 类
 */
function EWA_UI_ExcelClass() {
	this._Tb = null;
	this._HeaderRowSize = 1;
	this._ClassName = "";
	this._LeftColSize = 1;
	this._Top=null;
	this._Left=null;
	this._Height=null;
	this._DivTop=null;
	this._DivLeft=null;
	this._LeftHeader=null;
	this._ScrollParent=null;
	this.Init = function(tb, headerRowSize, leftColSize, className, scrollParent) {
		this._Tb = tb;

		// $(tb).find('td').each(function(){
		// $(this).css('width',$(this).width());
		// });
		var offset = $(tb).offset();
		this._Top = offset.top;
		this._Left = offset.left;
		this._Height = $(tb).parent()[0].clientHeight;

		this._HeaderRowSize = headerRowSize;
		this._LeftColSize = leftColSize;
		this._ClassName = className;
		this._ScrollParent = scrollParent || document.body;

		this._Create();

	};
	this._Create = function() {
		var tb = this._Tb;
		// top table
		var tb2 = tb.cloneNode(true);
		tb2.removeAttribute('onmouseout');
		tb2.removeAttribute('onmousedown');
		tb2.removeAttribute('onmouseover');

		$(tb2).css('width', $(tb).width());
		for (var i = tb2.rows.length - 1; i >= this._HeaderRowSize; i--) {
			tb2.deleteRow(i);
		}
		for (var m = 0; m < this._HeaderRowSize; m++) {
			var r1 = tb2.rows[m];
			var r2 = tb.rows[m];
			for (var i = 0; i < r1.cells.length; i++) {
				var cell = r1.cells[i];
				var refCell = r2.cells[i];
				$(cell).css('width', $(refCell).width());
			}
		}
		// top table
		// tb2.rows[0].deleteCell(0);
		// var headerLeft = tb.rows[0].cells[0].offsetWidth + 1;
		var headerLeft = 0;
		this._DivTop = document.createElement("div");
		this._DivTop.id = "tb_header_con" + this._ClassName;
		var cssTop = {
			position : "fixed",
			display : "none",
			top : 0,
			// height : $(tb.rows[0].cells[0]).height() + 4,
			left : this._Left + headerLeft,
			overflow : 'hidden'
		};
		$(this._DivTop).css(cssTop);
		$(this._DivTop).append(tb2);

		$(this._Tb).parent().append(this._DivTop);

		this._LeftHeader = this._Left + headerLeft;

		// left table
		var tb3 = tb.cloneNode(true);
		tb3.removeAttribute('onmouseout');
		tb3.removeAttribute('onmousedown');
		tb3.removeAttribute('onmouseover');

		$(tb3).find("td").attr("id", null);

		var sidebarWidth = tb.rows[0].cells[0].offsetWidth + 2;

		this._DivLeft = document.createElement("div");
		this._DivLeft.id = "tb_sidebar_con" + this._ClassName;

		this._DivLeft.appendChild(tb3);
		this._DivLeft.style.position = "fixed";
		this._DivLeft.style.top = this._Top + 'px';
		this._DivLeft.style.left = this._Left + "px";
		this._DivLeft.style.overflow = 'hidden';
		this._DivLeft.style.width = sidebarWidth + 'px';
		this._DivLeft.style.height = this._Height + 'px';

		$(this._Tb).parent().append(this._DivLeft);

		var c = this;
		// addEvent(this._ScrollParent, 'scroll', function() {
		// c.OnScroll(evt);
		// });
		try {
			this._ScrollParent.onscroll = function() {
				try {
					c.OnScroll();
				} catch (e) {
					console.log(e);
				}
			};
		} catch (e) {
			console.log(e);
		}
		console.log(this._ScrollParent.onscroll)
	};
	this.OnScroll = function() {
		var c = this;
		if (c._ScrollParent.scrollTop > c._Top
			&& (c._ScrollParent.scrollTop < c._Top + this._Height || c._ScrollParent != document.body)) {
			c._DivTop.style.display = '';
			$(c._DivTop).css({
				left : (c._LeftHeader - c._ScrollParent.scrollLeft)
			});
		} else {
			// console.log(this._ScrollParent.scrollTop)
			c._DivTop.style.display = 'none';
		}
		$(c._DivLeft).css({
			top : (c._Top - c._ScrollParent.scrollTop),
			height : c._Height + c._ScrollParent.scrollTop
		});
	}
}