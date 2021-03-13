if (typeof EWA == 'undefined') {
    EWA = {};
}

/* 界面 */
EWA["UI"] = EWA["UI"] || {};

/**
 * 计算位置
 * 
 * @param {}
 *            obj 要计算位置的对象
 * @return {Object} X 左<br>
 *         Y bottom<br>
 *         Left 左<br>
 *         Top 头<br>
 *         Width 宽<br>
 *         Height 高<br>
 *         Right 右<br>
 *         Bottom 底<br>
 */
EWA.UI.Postion = function(obj) {
    if (obj == null) {
        return null;
    }
    var o1 = obj;
    var x,
        y;
    x = y = 0;
    do {
        x += o1.offsetLeft * 1;
        y += o1.offsetTop * 1;
        if (o1.tagName == "DIV") {
            x -= o1.scrollLeft;
            y -= o1.scrollTop;
        }
        o1 = o1.offsetParent;
    } while (o1 != null && o1.tagName != "BODY" && o1.tagName != "HTML");
    var y1 = y + obj.offsetHeight * 1;
    return {
        X : x, // 左
        Y : y1, // bottom
        Left : x, // 左
        Top : y, // 头
        Width : obj.offsetWidth, // 宽
        Height : obj.offsetHeight, // 高
        Right : x + obj.offsetWidth, // 右
        Bottom : y1
    // 底
    };
}

// ----------------移动对象-----------------------
var EWA$UI$COMMON$Move = {
    OnMouseDown : function(obj, evt, objMove, isX, isY) {
        obj.setAttribute("D", 1);
        var e = EWA$UI$COMMON.Move._Event(obj, evt);
        var xy = EWA$UI$COMMON.Move._EventXY(e);
        if (isX == null || isX) {
            obj.setAttribute("X", xy.X);
            obj.setAttribute("SX", xy.X);
        }
        if (isY == null || isY) {
            obj.setAttribute("Y", xy.Y);
            obj.setAttribute("SY", xy.Y);
        }
        if (typeof e.preventDefault != "undefined") {
            e.preventDefault();
        }
        typeof e.stopPropagation != "undefined" ? e.stopPropagation() : e.cancelBubble = true;
    },
    OnMouseUp : function(obj) {
        obj.setAttribute("D", 0);
    },
    OnMouseOut : function(obj) {
        if (obj.getAttribute("D") == "1") {
            obj.setAttribute("D", 0);
        }
    },
    OnMouseMove : function(obj, evt) {
        if (obj.getAttribute("D") != "1") {
            return;
        }
        var e = EWA$UI$COMMON.Move._Event(obj, evt);
        var xy = EWA$UI$COMMON.Move._EventXY(e);
        if (obj.getAttribute("X") != null) {
            var x0 = obj.getAttribute("X") * 1;
            var dx = xy.X - x0;
            obj.style.left = obj.style.left.replace("px", "") * 1 + dx + "px";
            obj.setAttribute("X", xy.X);
        }
        if (obj.getAttribute("Y") != null) {
            var y0 = obj.getAttribute("Y") * 1;
            var dy = xy.Y - y0;
            obj.style.top = obj.style.top.replace("px", "") * 1 + dy + "px";
            obj.setAttribute("Y", xy.Y);
        }
        if (typeof e.preventDefault != "undefined") {
            e.preventDefault();
        }
        typeof e.stopPropagation != "undefined" ? e.stopPropagation() : e.cancelBubble = true;
    },
    _Event : function(obj, evt) {
        if (evt) {
            return evt;
        } else {
            return obj.ownerDocument.parentWindow.event;
        }
    },
    _EventXY : function(e) {
        if (EWA.B.IE) {
            return {
                X : e.x,
                Y : e.y
            };
        } else {
            return {
                X : e.pageX,
                Y : e.pageY
            };
        }
    }
};
// ---------------UI公共方法------------------------
var EWA$UI$COMMON = {
    Move : EWA$UI$COMMON$Move,
    /**
     * 获取鼠标位置
     * 
     * @return {}
     */
    GetMousePosition : function(e) {
        if (e == null) {
            e = event;
        }
        if (EWA.B.IE) {
            return {
                X : e.x,
                Y : e.y
            };
        } else {
            return {
                X : e.pageX,
                Y : e.pageY
            };
        }
    },
    /**
     * 
     * @param {}
     *            objWindow
     * @param {}
     *            objTag
     * @param {}
     *            objStyle
     * @param {}
     *            objParent
     * @return {}
     */
    CreateObject : function(objWindow, objTag, objStyle, objParent) { // 生成新对象
        /**
         * 在指定的目标窗口(objWindow)中生成新对象 objWindow 生成对象的窗体 objTag 对象的 tagName
         * objStyle 对象的样式 objParent 对象的母体
         */
        var obj = objWindow.document.createElement(objTag);
        if (objStyle != null && objStyle.trim().length > 0) {
            if (EWA.B.IE) {
                obj.style.cssText = objStyle;
            } else {
                obj.setAttribute("style", objStyle);
            }
        }
        if (objParent != null) {
            objParent.appendChild(obj);
        }
        return obj;
    },
    SetStyle : function(obj, style) {
        if (EWA.B.IE) {
            obj.style.cssText = style;
        } else {
            obj.setAttribute("style", style);
        }
    },
    GetPosition : function(obj) { // 计算位置
        var o1 = obj;
        var x,
            y;
        x = y = 0;
        do {
            x += o1.offsetLeft * 1;
            y += o1.offsetTop * 1;
            if (o1.tagName == "DIV") {
                x -= o1.scrollLeft;
                y -= o1.scrollTop;
            }
            o1 = o1.offsetParent;
        } while (o1 != null && o1.tagName != "BODY" && o1.tagName != "HTML");
        y += obj.offsetHeight * 1;
        var location = {
            X : x,
            Y : y
        };
        return location;
    },
    Dispose : function(obj) { // 注销对象和子对象方法，避免IE内存泄露
        if (!EWA.B.IE) {
            return;
        }
        if (obj.attributes != null) {
            for (var i = 0; i < obj.attributes.length; i += 1) {
                if (obj.attributes[i] != null && typeof obj.attributes[i] == "function") {
                    obj.attributes[i] = null;
                }
            }
        }
        for (var i = 0; i < obj.childNodes.length; i += 1) {
            EWA$UI$COMMON.Dispose(obj.childNodes[i]);
        }
    },
    Drop : function(obj) {
        EWA$UI$COMMON.Dispose(obj);
        obj.parentNode.removeChild(obj);
    },
    /**
     * 动画扩展对象，开始大小，目标大小
     * 
     * @param {}
     *            obj
     * @param {Integer}
     *            expandedWidth
     * @param {Integer}
     *            expandedHeight
     * @param {Integer}
     *            inc
     */
    AniExpand : function(obj, expandedWidth, expandedHeight, inc, expandType) {
        if (inc == null || inc <= 0) {
            inc = 10;
        }
        var incc = 0;
        var dx = expandedWidth / (inc * 1.0);
        var dy = expandedHeight / (inc * 1.0);
        var maxX = obj.clientWidth + expandedWidth;
        var maxY = obj.clientHeight + expandedHeight;
        // document.title=maxX+','+maxY+','+obj.clientWidth+','+obj.clientHeight;
        var t = window.setInterval(function() {
            var size = EWA$UI$COMMON.GetObjSize(obj);
            if (incc < inc - 1) {
                var h = size.H + dy;
                var w = size.W + dx;
                if (h > maxY) {
                    h = maxY;
                }
                if (w > maxX) {
                    w = maxX;
                }
                EWA$UI$COMMON.SetSize(obj, w, h);
            } else {
                EWA$UI$COMMON.SetSize(obj, maxX, maxY);
            }
            var size1 = EWA$UI$COMMON.GetObjSize(obj);
            var ddx = size1.W - size.W;
            var ddy = size1.H - size.H;

            var loc = EWA$UI$COMMON.GetPosition(obj);
            loc.Y = loc.Y - obj.clientHeight - obj.style.borderTopWidth.replace('px', '') * 1
                - obj.style.borderBottomWidth.replace('px', '') * 1;
            if (expandType == 'LEFT_TOP') {
                // nothing to do;
            } else if (expandType == 'LEFT_BOTTOM') {
                var top = loc.Y - ddy;
                var left = loc.X;
                EWA$UI$COMMON.MoveTo(obj, left, top);
            } else if (expandType == 'RIGHT_TOP') {
                var top = loc.Y;
                var left = loc.X - ddx;
                EWA$UI$COMMON.MoveTo(obj, left, top);
            } else if (expandType == 'RIGHT_BOTTOM') {
                var top = loc.Y - ddy;
                var left = loc.X - ddx;
                EWA$UI$COMMON.MoveTo(obj, left, top);
            } else {
                var top = loc.Y * 1 - ddy / 2;
                var left = loc.X * 1 - ddx / 2;
                // obj.innerHTML=obj.innerHTML+'<br>'+left+','+top+','+ddx+','+ddy+','+loc.Y;
                EWA$UI$COMMON.MoveTo(obj, left, top);
                EWA._TmpAniObj = obj;
            }
            incc++;
            if (incc >= inc) {
                window.clearInterval(t);
                if (EWA.UI.Utils.AniExpandCompleateFunction) {
                    EWA.UI.Utils.AniExpandCompleateFunction();
                    EWA.UI.Utils.AniExpandCompleateFunction = null;
                }
            }
        }, 12);
    },
    AniExpandTo : function(obj, dW, dH, inc, expandType) {
        if (inc == null || inc <= 0) {
            inc = 10;
        }
        var size = EWA$UI$COMMON.GetObjSize(obj);
        var expW = dW - size.W;
        var expH = dH - size.H;
        this.AniExpand(obj, expW, expH, inc, expandType);
    },
    SetSize : function(obj, width, height) {
        obj.style.width = width + 'px';
        obj.style.height = height + 'px';
    },
    MoveTo : function(obj, x, y) {
        obj.style.left = x + 'px';
        obj.style.top = y + 'px';
    },
    MoveCenter : function(obj) {
        // var xy = this.GetPosition(obj);
        var win = this._GetOwnerWindow(obj);

        var size = this.GetObjSize(obj);
        var docSize = this.GetDocSize(win);
        var dx = (docSize.W - size.W) / 2;
        var dy = (docSize.H - size.H) / 2;
        this.MoveTo(obj, dx, dy);
    },
    GetObjSize : function(obj) {
        var w = obj.clientWidth;
        var h = obj.clientHeight;
        return {
            H : h,
            W : w
        };
    },
    /**
     * 获取窗体尺寸
     * 
     * @param {}
     *            win
     * @return {}
     */
    GetDocSize : function(win) {
        if (win == null) {
            win = window;
        }
        var doc = win.document;
        var w = doc.body.clientWidth;
        var h = doc.compatMode == "CSS1Compat" ? doc.documentElement.clientHeight : doc.body.clientHeight;
        var h3 = win.document.body.scrollTop;
        var w3 = win.document.body.scrollLeft;
        return {
            W : w,
            H : h,
            SH : h3, // 滚动条高度
            SW : w3
        // 滚动条宽度
        };
    },
    _GetOwnerWindow : function(obj) {
        return EWA.B.IE ? obj.ownerDocument.parentWindow : obj.ownerDocument.defaultView;
    }
};
// ---------------------------------------

EWA.UI.Utils = EWA$UI$COMMON;

EWA.UI.ImgResize = function(oImg, width, height) {}



// 检查Iframe是否加载完毕;
function EWA_ChkIframeOk(f, func) {
    var w = f.contentWindow;
    if (w.location && w.location.href != 'about:blank' && w.document && w.document.readyState == 'complete') {
        if (func) {
            func(w, f);
        }
    } else {
        setTimeout(function() {
            EWA_ChkIframeOk(f, func)
        }, 111);
    }
}
// 从 ewa_ad 挪过来
EWA.UI.Utils.FadeIn = function(objIn, objOut, step, timeSpan, afterFunction) {
    if (objIn == objOut) {
        return;
    }
    objOut.setAttribute('alpha', 100);
    objIn.style.display = '';
    objIn.style.zIndex = -1000;
    objIn.style.filter = 'Alpha(Opacity=100)';
    objIn.style.opacity = 1;

    objOut.style.zIndex = 1000;
    objOut.style.display = '';
    objOut.style.filter = 'Alpha(Opacity=100)';
    objOut.style.opacity = 1;

    EWA.UI.Utils.FADE_IN_OBJ = objIn;
    EWA.UI.Utils.FADE_OUT_OBJ = objOut;
    EWA.UI.Utils.FADE_STEP = step;
    EWA.UI.Utils.FADE_TIME_SPAN = timeSpan;
    EWA.UI.Utils.FADE_AFTER = afterFunction;

    window.setTimeout(EWA.UI.Utils.FadeInTimer, EWA.UI.Utils.FADE_TIME_SPAN);
};
EWA.UI.Utils.FadeInTimer = function() {
    try {
        var alpha = EWA.UI.Utils.FADE_OUT_OBJ.getAttribute('alpha') * 1 - EWA.UI.Utils.FADE_STEP;
        EWA.UI.Utils.FADE_OUT_OBJ.setAttribute('alpha', alpha);
        if (alpha <= 0) {
            EWA.UI.Utils.FADE_OUT_OBJ.style.display = 'none';
            EWA.UI.Utils.FADE_OUT_OBJ.setAttribute('alpha', 0);

            EWA.UI.Utils.FADE_OUT_OBJ.style.filter = 'Alpha(Opacity=100)';
            EWA.UI.Utils.FADE_OUT_OBJ.style.opacity = 1;

            EWA.UI.Utils.FADE_AFTER.ChangeAfter();

            EWA.UI.Utils.FADE_IN_OBJ = null;
            EWA.UI.Utils.FADE_OUT_OBJ = null;
            EWA.UI.Utils.FADE_STEP = null;
            EWA.UI.Utils.FADE_TIME_SPAN = null;
            EWA.UI.Utils.FADE_AFTER = null;
            return;
        }
        EWA.UI.Utils.FADE_OUT_OBJ.style.filter = 'Alpha(Opacity=' + alpha + ')';
        EWA.UI.Utils.FADE_OUT_OBJ.style.opacity = alpha * 1.0 / 100.0;
    } catch (e) {}
    window.setTimeout(EWA.UI.Utils.FadeInTimer, EWA.UI.Utils.FADE_TIME_SPAN);
};/**
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
}/**
 * 移动类<br>
 * 调用方式 var mv=new EWA.UI.Move(); mv.Init(mv);<br>
 * 移动对象应是绝对位置<br>
 * 容器对象可以是任何位置
 */
EWA.UI.Move = function () {
    this._BackgroundObjectList = [];
    this._MoveObjectList = [];
    this._MaxIndex = 199999;
    this.IsMoveX = true;
    this.IsMoveY = true;
    this.MoveStep = 1;

    /**
	 * 添加需要改变尺寸的移动
	 * 
	 * @param {}
	 *            a 对象本身，例如： var mv=new EWA.UI.Move(); mv.Init(mv);
	 */
    this.Init = function (a) {
        addEvent(document.body, 'mousedown', function (event) {
            a.OnMouseDown(event);
        });
        addEvent(document.body, 'mousemove', function (event) {
            a.OnMouseMove(event);
        });
        addEvent(document.body, 'mouseup', function (event) {
            a.OnMouseUp(event);
        });
        EWA_COMMON_MV_OBJECT = null;
    };

    this.AddBackgroundObjs = function (arrObjs) {
        for (var i = 0; i < arrObjs.length; i++) {
            this.AddBackgroundObj(arrObjs[i]);
        }
    };
    this.ReCalcBackgroundObjs = function () {
        for (var i = 0; i < this._BackgroundObjectList.length; i++) {
            var o1 = this._BackgroundObjectList[i];
            var p = EWA.UI.Utils.GetPosition(o1.obj);
            var s = EWA.UI.Utils.GetObjSize(o1.obj);
            o1.x0 = p.X;
            o1.x1 = p.X + s.W;
            o1.y0 = p.Y - s.H;
            o1.y1 = p.Y;
        }
    };
    this.AddBackgroundObj = function (obj) {
        var p = EWA.UI.Utils.GetPosition(obj);
        var s = EWA.UI.Utils.GetObjSize(obj);
        var o = {
            x0 : p.X,
            x1 : p.X + s.W,
            y0 : p.Y - s.H,
            y1 : p.Y,
            obj : obj
        };
        this._BackgroundObjectList.push(o);
    };
    this.CheckBackgroundObj = function (x, y) {
        for ( var i in this._BackgroundObjectList) {
            var o = this._BackgroundObjectList[i];
            if (o.x0 <= x && o.x1 >= x && o.y0 <= y && o.y1 >= y) {
                return o;
            }
        }
    };
    this.ClearLastBackgroundObj = function () {
        if (this.LastCheckedBackground) {
            this.LastCheckedBackground.obj.style.backgroundColor = this.LastCheckedBackground.obj
                    .getAttribute('_mv_last_bc');
            this.LastCheckedBackground = null;
        }
    }
    this.ClearAll = function () {
        for (var i = 0; i < this._MoveObjectList.length; i++) {
            var a = this._MoveObjectList[i];
            if (a.B.parentNode) {
                a.B.parentNode.removeChild(a.B);
            }

        }

        this._MoveObjectList = [];
    }

    /**
	 * 添加需要移动的对象
	 * 
	 * @param {}
	 *            objMonitor 相应移动的对象，即鼠标点击相应移动事件的对象
	 * @param {}
	 *            objMove 页面移动的对象
	 * @param {}
	 *            afterJs 鼠标按键抬起后执行的脚本
	 * @param {}
	 *            objParent 移动的容器
	 */
    this.AddMoveObject = function (objMonitor, objMove, mouseUpJs, objParent,
            moveJs, mouseDownJs) {
        objMonitor.setAttribute('ewa_move', 1);
        objMonitor.setAttribute('ewa_move_type', 'MOVE');
        var loc = objParent == null ? null : EWA.UI.Postion(objParent);
        var a = {
            A : objMonitor,
            B : objMove,
            JS : mouseUpJs,
            T : "MOVE",
            MOVE_X : true,
            MOVE_Y : true,
            L : loc,
            JSM : moveJs,
            JS_MOUSE_DOWN : mouseDownJs
        };
        this._MoveObjectList.push(a);
    };
    /**
	 * 添加需要移动的对象(X方向)
	 * 
	 * @param {}
	 *            objMonitor 相应移动的对象，即鼠标点击相应移动事件的对象
	 * @param {}
	 *            objMove 页面移动的对象
	 * @param {}
	 *            afterJs 鼠标按键抬起后执行的脚本
	 * @param {}
	 *            objParent 移动的容器
	 */
    this.AddMoveObjectX = function (objMonitor, objMove, mouseUpJs, objParent,
            moveJs, mouseDownJs) {
        objMonitor.setAttribute('ewa_move', 1);
        objMonitor.setAttribute('ewa_move_type', 'MOVE');
        var loc = objParent == null ? null : EWA.UI.Postion(objParent);
        var a = {
            A : objMonitor,
            B : objMove,
            JS : mouseUpJs,
            T : "MOVE",
            MOVE_X : true,
            MOVE_Y : false,
            L : loc,
            JSM : moveJs,
            JS_MOUSE_DOWN : mouseDownJs
        };
        this._MoveObjectList.push(a);
    };
    /**
	 * 添加需要移动的对象(Y方向)
	 * 
	 * @param {}
	 *            objMonitor 相应移动的对象，即鼠标点击相应移动事件的对象
	 * @param {}
	 *            objMove 页面移动的对象
	 * @param {}
	 *            afterJs 鼠标按键抬起后执行的脚本
	 * @param {}
	 *            objParent 移动的容器
	 */
    this.AddMoveObjectY = function (objMonitor, objMove, mouseUpJs, objParent,
            moveJs, mouseDownJs) {
        objMonitor.setAttribute('ewa_move', 1);
        objMonitor.setAttribute('ewa_move_type', 'MOVE');
        var loc = objParent == null ? null : EWA.UI.Postion(objParent);
        var a = {
            A : objMonitor,
            B : objMove,
            JS : mouseUpJs,
            T : "MOVE",
            MOVE_X : false,
            MOVE_Y : true,
            L : loc,
            JSM : moveJs,
            JS_MOUSE_DOWN : mouseDownJs
        };
        this._MoveObjectList.push(a);
    };
    /**
	 * 添加需要改变尺寸的移动
	 * 
	 * @param {}
	 *            objMonitor 相应移动的对象，即鼠标点击相应移动事件的对象
	 * @param {}
	 *            objMove 页面移动的对象
	 * @param {}
	 *            afterJs 鼠标按键抬起后执行的脚本
	 * @param {}
	 *            objParent 移动的容器
	 * @param {}
	 *            isFixed 是否固定比例
	 */
    this.AddSizeObject = function (objMonitor, objMove, afterJs, objParent,
            isFixed, moveJs, mouseDownJs) {
        objMonitor.setAttribute('ewa_move', 1);
        objMonitor.setAttribute('ewa_move_type', 'SIZE');
        objMove.style.width = objMove.clientWidth + 'px';
        var loc = objParent == null ? null : EWA.UI.Postion(objParent);
        var loc1 = isFixed ? EWA.UI.Postion(objMove) : null;
        var a = {
            A : objMonitor,
            B : objMove,
            JS : afterJs,
            T : "SIZE",
            L : loc,
            M : loc1,
            JSM : moveJs,
            JS_MOUSE_DOWN : mouseDownJs
        };
        this._MoveObjectList.push(a);
    }

    /**
	 * 
	 */
    this.OnMouseDown = function (evt) {
        var obj = this._GetEventTarget(evt);
        if (obj == null) {
            return;
        }
        var objA = this._GetObject(obj);
        if (objA == null || objA.A.getAttribute('ewa_move') != '1') {
            return;
        }
        var xy = this._GetEventXY(evt);
        this._MaxIndex++;
        objA.B.style.zIndex = this._MaxIndex;
        objA.B.setAttribute("_EWA_MOUSE_DOWN", 1);
        objA.B.setAttribute("_EWA_MOUSE_X", xy.X);
        objA.B.setAttribute("_EWA_MOUSE_Y", xy.Y);
        if ($(objA.B).css('position') != 'absolute') {
            var p = $(objA.B).position();
            objA.B.style.position = 'absolute';
            objA.B.style.left = p.left + 'px';
            objA.B.style.top = p.top + 'px';

        }
        EWA_COMMON_MV_OBJECT = objA;
        this.ReCalcBackgroundObjs();
        if (objA.JS_MOUSE_DOWN) { // 鼠标点击事件
            objA.JS_MOUSE_DOWN(objA);
        }
    };
    this.OnMouseMove = function (evt) {
        if (EWA_COMMON_MV_OBJECT == null) {
            return;
        }
        var objA = EWA_COMMON_MV_OBJECT;
        var obj = objA.B;
        if (obj.getAttribute("_EWA_MOUSE_DOWN") != "1") {
            return;
        }
        var xy = this._GetEventXY(evt);
        var x = obj.getAttribute("_EWA_MOUSE_X") * 1;
        var y = obj.getAttribute("_EWA_MOUSE_Y") * 1;
        var dx = xy.X - x; // x 轴移动位置
        var dy = xy.Y - y; // y 轴移动位置
        // 移动位置< this.MoveStep，则不移动
        if (Math.abs(dx) < this.MoveStep && Math.abs(dy) < this.MoveStep) {
            return;
        }

        var loc = objA.L; // 移动对象所在容器的位置信息

        var left = $(obj).css('left').replace("px", "") * 1 + dx;
        var top = $(obj).css('top').replace("px", "") * 1 + dy;

        var right;
        var bottom;
        if (objA.T == 'MOVE') {
            if (loc == null) {
                if (left < 0)
                    left = 0;
                if (top < 0)
                    top = 0;
            } else {
                var w = obj.offsetWidth;
                var h = obj.offsetHeight;
                
                
                
                if (left < loc.Left) {
                    left = loc.Left;
                } else if (left + w > loc.Right) {
                    left = loc.Right - w;
                }
                right = loc.Right - (left + w) ;
                if (top < loc.Top) {
                    top = loc.Top;
                } else if (top + h > loc.Bottom) {
                    top = loc.Bottom - h;
                }
                
                bottom = loc.Bottom - (top +h);
                // console.log(left, top, right, bottom, loc);
                obj.setAttribute('ewa_mv_left', left.fm(0));
                obj.setAttribute('ewa_mv_top', top.fm(0));
                obj.setAttribute('ewa_mv_bottom', bottom.fm(0));
                obj.setAttribute('ewa_mv_right', right.fm(0));
            }
            // console.log(this.IsMoveX, this.IsMoveY);
            if (this.IsMoveX && objA.MOVE_X) {
                obj.style.left = left + "px";
            }
            if (this.IsMoveY && objA.MOVE_Y) {
                obj.style.top = top + "px";
            }
        } else {
            // scale
            var width = obj.style.width.replace("px", "") * 1 + dx;
            var height = obj.style.height.replace("px", "") * 1 + dy;
            if (width < 10) {
                width = 10;
            }
            if (height < 10) {
                height = 10;
            }
            if (loc != null) {
                if (objA.M != null) { // 固定比例
                    var r = (objA.M.Width * 1.0 / objA.M.Height); // 原始比例
                    if (r == 1) { // 矩形
                        width = obj.style.width.replace("px", "") * 1;
                        height = width;
                        var d_len = Math.sqrt(dx * dx + dy * dy); // 利用勾股定理求弦长
                        if (dy > 0 || dx < 0) {
                            d_len = d_len * -1;
                        }
                        // console.log(dx, dy, d_len);

                        var css = {
                            left : $(obj).position().left - d_len / 4,
                            top : $(obj).position().top - d_len / 4,
                            width : $(obj).width() + d_len / 2,
                            height : $(obj).height() + d_len / 2
                        }
                        if (css.height + css.top > loc.Bottom
                                || css.top < loc.Top
                                || css.left + css.width > loc.Right
                                || css.left < loc.Left) {
                            return;
                        }
                        if (css.width < 50) {
                            return;
                        }
                        $(obj).css(css);
                        if (objA.JSM) {
                            objA.JSM(objA.B, objA.A);
                        }
                        return;

                    } else {
                        var r1 = width / height;
                        if (r1 > r) {
                            height = width / r;
                        } else if (r1 < r) {
                            width = height * r;
                        }
                        if (left + width > loc.Right) {
                            width = loc.Right - left;
                            height = width / r;
                        }
                        if (top + height > loc.Bottom) {
                            height = loc.Bottom - top;
                            width = height * r;
                        }
                    }
                } else {
                    if (left + width > loc.Right) {
                        width = loc.Right - left;
                    }
                    if (top + height > loc.Bottom) {
                        height = loc.Bottom - top;
                    }
                }
            }
            if (this.IsMoveX) {
                obj.style.width = width + 'px';
            }
            if (this.IsMoveY) {
                obj.style.height = height + 'px';
            }
        }
        obj.setAttribute("_EWA_MOUSE_X", xy.X);
        obj.setAttribute("_EWA_MOUSE_Y", xy.Y);
        if (objA.JSM) {
            objA.JSM(objA.B, objA.A);
        }
        var bo = this.CheckBackgroundObj(xy.X, xy.Y);
        if (bo) {
            if (bo == this.LastCheckedBackground) {
                return;
            }
            if (this.LastCheckedBackground) {
                this.LastCheckedBackground.obj.style.backgroundColor = this.LastCheckedBackground.obj
                        .getAttribute('_mv_last_bc');
            }
            this.LastCheckedBackground = bo;
            bo.obj.setAttribute('_mv_last_bc', bo.obj.style.backgroundColor);
            bo.obj.style.backgroundColor = 'lightyellow';
        } else {
            if (this.LastCheckedBackground) {
                this.LastCheckedBackground.obj.style.backgroundColor = this.LastCheckedBackground.obj
                        .getAttribute('_mv_last_bc');
            }
        }
    };
    this.OnMouseUp = function (evt) {
        var objA = EWA_COMMON_MV_OBJECT;
        if (objA == null) {
            return;
        }
        for (var i = 0; i < this._MoveObjectList.length; i++) {
            this._MoveObjectList[i].B.setAttribute("_EWA_MOUSE_DOWN", 0);
        }
        if (objA.JS != null) {
            objA.JS(objA.B, objA.A);
        }
        EWA_COMMON_MV_OBJECT = null;
    };
    this._GetObject = function (obj) {
        for (var i = 0; i < this._MoveObjectList.length; i++) {
            var objMoniter = this._MoveObjectList[i].A;
            if (objMoniter == obj) {
                return this._MoveObjectList[i];
            }
        }
        // check children
        for (var i = 0; i < this._MoveObjectList.length; i++) {
            var objMoniter = this._MoveObjectList[i].A;
            var objs = objMoniter.getElementsByTagName(obj.tagName);
            for (var m = 0; m < objs.length; m++) {
                var objA = this._MoveObjectList[i];
                if (objs[m] == obj) {
                    return objA;
                }
            }
        }
        return null;
    };
    this._GetEventTarget = function (evt) {
        if (EWA.B.IE) {
            return event.srcElement;
        } else {
            return evt.target;
        }
    };
    this._GetEventXY = function (e) {
        if (EWA.B.IE) {
            return {
                X : e.x,
                Y : e.y
            };
        } else {
            return {
                X : e.pageX,
                Y : e.pageY
            };
        }
    };
}/**
 * 菜单项类
 */
function EWA_UI_MenuItemClass() {
	this.Img = null; // 图片
	this.Txt = null; // 显示文字
	this.Cmd = null; // 脚本
	this.Group = null; // 菜单组
}

/**
 * 菜单类
 * 
 * @param className
 *            类名
 */
function EWA_UI_MenuClass(className) {
	this.ClassName = className;
	this.MenuShowType = "";

	this.Dialog = null;// new EWA_UI_DialogClass();
	this.Dialogs = new Array();
	this._LastObj = null;
	this._ItemsDiv = null;

	// 被点击的菜单项 2018-11-10
	this.clickedItem = null;

	this.Click = function(e, obj) {
		if (this.MenuShowType == 'LEFT') {
			// if (this._LastObj != null) {
			// }
		} else {
			if (this._LastObj != null) {
				this._LastObj.className = this._LastObj.className.replace('_mv1', '');
			}
			this._LastObj = null;
			typeof e.stopPropagation != "undefined" ? e.stopPropagation() : e.cancelBubble = true;
			this._HiddenDialogs();
		}
		EWA.C.Utils.RunCmd(obj);// 执行cmd
	};
	this.OnClick = function(event, obj) {
		this.clickedItem = obj;
		if (this.MenuShowType == 'LEFT') {
			var po = obj.parentNode;
			var co = obj.parentNode.parentNode.childNodes[1];
			if (co == null) {
				return;
			}
			if (co.childNodes.length == 0) {// 子节点
				if (this._LastCkObj) {
					this._LastCkObj.style.backgroundColor = '';
				}
				po.style.backgroundColor = '#ccc';
				this._LastCkObj = po;
			} else {
				if (co.style.display == 'none') {
					co.style.display = '';
				} else {
					co.style.display = 'none';
				}
				if (window.event) {
					event.cancelBubble = true;
				} else {
					event.stopPropagation();
				}
			}
			this.Click(event, obj);
		} else {
			if (obj.getAttribute('EWA_MF_PID') == "") {
				this._HiddenDialogs();
				var lvl = 0;
				if (this.Dialogs.length <= lvl) {
					this.Dialogs.push(this._CreateDialog());
				}
				var items = this._ShowPullDownMenu(obj, this.Dialogs[lvl]);
				if (items > 0) {
					this.ShowByObject(obj, this.Dialogs[lvl], lvl);
					return;
				}
			}
			this.Click(event, obj);
		}

	}
	this._CalcLevel = function(obj) {
		var lvl = 0;
		var o1 = obj;
		while (o1.getAttribute('EWA_MF_PID') != "") {
			lvl += 1;
			o1 = document.getElementById(o1.getAttribute('EWA_MF_PID'));
			if (o1 == null) {
				return null;
			}
		}
		return lvl;
	}
	this._ShowPullDownMenu = function(obj, dia) {
		var o = $X(dia.FrameContent).childNodes[0].rows[0].cells[0];
		while (o.childNodes.length > 0) {
			var menuItem = o.childNodes[0];
			this._ItemsDiv.appendChild(menuItem);
		}
		var al = new Array();
		for (var i = 0; i < this._ItemsDiv.childNodes.length; i++) {
			var o2 = this._ItemsDiv.childNodes[i];
			if (o2.innerHTML.toUpperCase().indexOf('<HR') > 0) {
			} else {
				o2.style.paddingRight = '10px';
			}
			if (o2.getAttribute('EWA_MF_PID') == obj.id) {
				al.push(o2);
			}
		}
		var len = al.length;
		for (var i = 0; i < al.length; i++) {
			o.appendChild(al[i]);
			var isHaveChildren = this._CheckChildren(al[i].id);
			if (isHaveChildren) {
				var tdd = al[i].childNodes[0].rows[0].cells[2];
				if (tdd.getAttribute('gdx') == null || tdd.getAttribute('gdx') == '') {
					tdd.innerHTML += " +";
					tdd.setAttribute('gdx', 'gdx');
				}
				al[i].setAttribute('EWA_MF_CHILD', "1");
			} else {
				al[i].setAttribute('EWA_MF_CHILD', "0");
			}
			al[i] = null;
		}
		al.length = 0;
		al = null;
		$X(dia.FrameContent).childNodes[0].style.height = 'auto';// 保证菜单框高度
		return len
	}
	this._CheckChildren = function(id) {
		for (var i = 0; i < this._ItemsDiv.childNodes.length; i++) {
			var o2 = this._ItemsDiv.childNodes[i];
			if (o2.getAttribute('EWA_MF_PID') == id) {
				return true;
			}
		}
		return false;
	};

	this.InstallMenus = function(menusId, parentId, showType) {

		if (showType == 'METRO') {
			var menus = [];
			var map = {};
			$('.ewa_menu_m').each(function() {
				var o = $(this);
				var d = {};
				d.id = o.attr('id');
				d.pid = o.attr('EWA_MF_PID');
				d.url = o.attr('EWA_CMD');
				d.icon = o.find('.ewa_menu_m0').attr('class');
				d.title = o.text().trim();
				if (d.icon) {
					d.icon = d.icon.replace('ewa_menu_m0', '').trim();
				}
				if (d.pid == "") {
					d.pid = "0";
					d.subs = [];
					map[d.id] = d;
					menus.push(d);
				} else {
					map[d.pid].subs.push(d);
				}

			});
			// console.log(menus);
			var pid = 'EWA_FRAME_MAIN';
			var isShowBlank = true;
			var className = 'item';
			EWA_UI_Metro.menus = menus;

			EWA_UI_Metro.add_menus(menus, pid, className, null, null, isShowBlank);
			return;
		}

		this.MenuShowType = showType;

		var ms = $X(menusId);
		var p = $X(parentId);
		if (p == null) {
			alert('MenuShow defined error (' + parentId + ')');
			return;
		}
		this._ItemsDiv = ms;
		var s1 = "<table onselectstart='return false' style='cursor:pointer;-moz-user-select:none;' border=0 cellspacing=0 cellpadding=0>";
		s1 += "</table>";

		var al = [];
		p.innerHTML = s1;
		var tb = p.childNodes[0];
		// 获取第一层菜单
		for (var i = 0; i < ms.childNodes.length; i++) {
			var o = ms.childNodes[i];
			if (o.tagName == 'DIV' && o.getAttribute('EWA_MF_PID') == "") {
				al.push(o);
			}
		}
		if (this.MenuShowType == '' || this.MenuShowType == 'TOP') {
			tb.insertRow(-1);
			for (var i = 0; i < al.length; i++) {
				var td = tb.rows[0].insertCell(-1);
				td.appendChild(al[i]);
			}
		} else {
			tb.style.width = '100%';
			this._InstallMenusLeft(tb, ms, al, menusId);
		}
		al.length = 0;
		al = null;

	};
	this._InstallMenusLeft = function(tb, ms, al, menusId) {
		// 生成第一层菜单
		for (var i = 0; i < al.length; i++) {
			var tr = tb.insertRow(-1);
			var td = tr.insertCell(-1);
			var div = document.createElement('div');
			div.innerHTML = '<div class="ewa_lmenu_bar" des="rq1"></div><div  des="rq2"></div>'
			div.childNodes[1].style.paddingLeft = '5px';
			td.appendChild(div);
			al[i].style.height = '100%';
			div.childNodes[0].appendChild(al[i]);
			if (i > 0) {
				div.childNodes[1].style.display = 'none';
			}
		}

		var subMenus = ms.childNodes;
		while (ms.childNodes.length > 0) {
			var o = subMenus[0];
			var pid = o.getAttribute('EWA_MF_PID');
			var div = document.createElement('div');
			div.innerHTML = '<div class="ewa_lmenu_bar1"></div><div style="padding-left:4px;display:none"></div>'
			$X(pid).parentNode.parentNode.childNodes[1].appendChild(div);
			div.childNodes[0].appendChild(o);
		}
	};
	this._CreateDialog = function() {
		var dia = new EWA_UI_DialogClass();
		dia.Create();
		var s1 = "<table class='ewa_menu_down' border=0 width=100 cellspacing=0 cellpadding=0 onmousemove='window."
			+ this.ClassName + ".IsOut=false;' onmouseout='window." + this.ClassName
			+ ".IsOut=true; window.setTimeout(function(){var a=window." + this.ClassName
			+ ";a.AutoHidden();},1410);' onselectstart='return false' style='cursor:pointer;-moz-user-select:none;' >";
		s1 += "<tr><td></td></tr>";
		s1 += "</table>";
		dia.SetHtml(s1);
		return dia;
	};
	this.AutoHidden = function() {
		if (this.IsOut) {
			this._HiddenDialogs();
		}
	};
	this.Create = function(menuItems) {
		// this.Dialog.Height=menuItems.length*20+2;
		if (menuItems == null || menuItems.length == 0) {
			return;
		}
		this.Dialog = new EWA_UI_DialogClass();
		this.Dialog.Create();
		var ss = [];
		ss
			.push("<div class='ewa_menu_box' onmousemove='window."
				+ this.ClassName
				+ ".IsOut=false;' onmouseout='window."
				+ this.ClassName
				+ ".IsOut=true; var t1=new Date().getTime(); if(t1-$(this).attr(&quot;open_time&quot;)>1000){ window.setTimeout(function(){var a=window."
				+ this.ClassName
				+ ";a.AutoHidden(this);},1410);}'  onselectstart='return false' style='width:120px;cursor:pointer;-moz-user-select:none;'>");
		for (var i = 0; i < menuItems.length; i += 1) {
			var o = menuItems[i];
			ss.push("<div class='ewa_menu_m' EWA_MG=\"" + o.Group + "\" style='cursor:pointer' EWA_CMD=\"" + o.Cmd
				+ "\" onclick='" + this.ClassName + ".Click(event,this);' onmouseover='" + this.ClassName
				+ ".MouseOver(this);'><table boder=0 width=100% cellpadding=0 cellspacing=0>")
			if (o.Txt.toUpperCase().indexOf('<HR') >= 0) {
				ss.push("<tr><td colspan=2 style='white-space:nowrap'>" + o.Txt + "</td></tr></table></div>");
				continue;
			}
			ss.push("<tr><td class='ewa_menu_m0'>");
			var img = menuItems[i].Img;

			if (img != null && img.indexOf('index=0,size=0') < 0 && img.trim().length > 0) {
				if (img.indexOf('fa') >= 0) {
					ss.push('<i class="' + img + '"></i>');
				} else {
					ss.push("<img src=\"" + menuItems[i].Img + "\">");
				}
			}
			ss.push("</td><td class='ewa_menu_m1' style='white-space:nowrap'>" + menuItems[i].Txt + "</td></tr></table></div>");
		}
		ss.push("</div>");
		this.Dialog.SetHtml(ss.join(""));
	};
	this.HiddenMemu = function() {
		this.Dialog.Show(false);
		EWA.UI.CurMenu = null;
	};
	this.ShowByObject = function(obj, dia, lvl) {
		var loc = EWA.UI.Utils.GetPosition(obj);
		// 出发menu的对象
		this.SHOW_BY_OBJECT = obj;
		dia = dia || this.Dialog;
		if (lvl == null || lvl == 0) {
			dia.Move(loc.X, loc.Y);
		} else {
			var left = obj.offsetWidth;
			dia.Move(loc.X + left - 5, loc.Y - obj.offsetHeight + 4);
		}
		dia.Show(true);
		var o=$(dia.GetFrame()).find('.ewa_menu_box');
		o.attr('open_time',new Date().getTime());
		//console.log(o[0])
		dia.ResizeByContent();
	};

	/**
	 * 根据鼠标显示菜单
	 * 
	 * @param evt
	 *            window.event
	 * @param groupName
	 *            菜单组名称
	 */
	this.ShowByMouse = function(evt, groupName) {
		if(!this.Dialog){
			// 没有菜单
			return;
		}
		var m = 0;
		var ot = $X(this.Dialog.FrameContent).childNodes[0];
		if (groupName == null) {
			m = ot.childNodes.length;
		} else {
			for (var i = 0; i < ot.childNodes.length; i++) {
				var g = ot.childNodes[i].getAttribute('EWA_MG');
				if (g == groupName || groupName == null || groupName == "") {
					ot.childNodes[i].style.display = "";
					m++;
				} else {
					ot.childNodes[i].style.display = "none";
				}
			}
		}
		if (m > 0) {
			var x = evt.x ? evt.x : evt.pageX;
			var y = evt.y ? evt.y : evt.pageY;
			y += document.body.scrollTop;
			x += document.body.scrollLeft;

			this.Dialog.Move(x, y);
			this.Dialog.Show(true);
			this.Dialog.ResizeByContent();
		} else {
			this.Dialog.Show(false);
		}
	};
	this.MouseOver = function(obj) {
		if (this._LastObj != null) {
			if (this.MenuShowType == 'LEFT') {
				// this._LastObj.style.backgroundColor = "";
				this._LastObj.parentNode.className = this._LastObj.parentNode.className.replace('_mv', '');
			} else {
				this._LastObj.className = this._LastObj.className.replace('_mv1', '');
			}
		}

		if (this.MenuShowType == 'LEFT') {
			this._LastObj = obj;
			// this._LastObj.style.backgroundColor = "#DDD";
			this._LastObj.parentNode.className = this._LastObj.parentNode.className + '_mv';
		} else {
			this._LastObj = obj;
			this.IsOut = false;
			this._LastObj.className = this._LastObj.className + '_mv1';
			if (EWA.UI.CurMenu == null) {
				EWA.UI.CurMenu = this;
			}
			var lvl = this._CalcLevel(obj);
			if (obj.getAttribute('EWA_MF_CHILD') == "1") {
				if (this.Dialogs.length <= lvl) {
					this.Dialogs.push(this._CreateDialog());
				}
				this._ShowPullDownMenu(obj, this.Dialogs[lvl]);
				this.ShowByObject(obj, this.Dialogs[lvl], lvl);
			} else {
				/*
				 * if(this.Dialogs.length > lvl+1){
				 * this.Dialogs[lvl+1].Show(false); }
				 */
			}
		}
	};

	this._HiddenDialogs = function() {
		if (this.Dialog != null) {
			this.Dialog.Show(false);
		}
		for (var i = 0; i < this.Dialogs.length; i++) {
			this.Dialogs[i].Show(false);
			var o = $X(this.Dialogs[i].FrameContent).childNodes[0].rows[0].cells[0];
			while (o.childNodes.length > 0) {
				this._ItemsDiv.appendChild(o.childNodes[0]);
			}
		}

	}
	this._InitEvent = function() {
		if (this.MenuShowType == 'LEFT') {
			return;
		}
		if (EWA.B.IE) {
			document.body.attachEvent("onclick", function() {
				if (typeof EWA.UI.CurMenu != 'undefined') {
					EWA.UI.CurMenu._HiddenDialogs();
				}
			});
		} else {
			document.body.addEventListener("click", function() {
				if (typeof EWA.UI.CurMenu != 'undefined') {
					EWA.UI.CurMenu._HiddenDialogs();
				}
			});
		}
	}
	// this._InitEvent();
}
var EWA_UI_Metro = {
	show_title : function(obj) {
		if (obj.getAttribute('_title') == "" || obj.getAttribute('_title') == null) {
			var ttt = obj.title;
			if (ttt == "" || ttt == null) {
				return;
			}
			obj.setAttribute("_title", ttt);
			obj.title = "";
		}
		$(".pop_title div").html(obj.getAttribute('_title'));

		var p = $(obj).offset();
		var w = $(obj).width();
		var h = $(".pop_title").height();
		var w1 = $(".pop_title").width();

		$(".pop_title").css('top', p.top - h - 8);
		$(".pop_title").show();
		$(".pop_title").css('left', p.left - (w1 - w) / 2);

	},

	item_click : function(obj) {
		var item = $(obj);
		var u = item.attr("u");
		var t = item.attr("_title");
		if (u) {
			if (u.startsWith("js:")) {
				var u1 = u.replace("js:", "");
				eval(u1);
				return;
			}
			if (u.indexOf('/') > 0) {
				u = u;
			} else if (u.indexOf('?') >= 0) {
				u = EWA.CP + "/EWA_STYLE/cgi-bin/" + u;
			} else {
				u = EWA.CP + "/EWA_STYLE/cgi-bin/?" + u;
			}
			top.AddTab(u, t);
		}
	},
	add_menus : function(menus, pid, className, cols, rows, isShowBlank) {
		this.g_menu_cols = window.g_menu_cols || 6; // 列数
		this.g_menu_rows = window.g_menu_rows || 3; // 行数
		this.menuLoadInRight = window.menuLoadInRight || false; // 是否在右侧加载菜单Ï

		// this.css();
		cols = cols || this.g_menu_cols;
		rows = rows || this.g_menu_rows;

		// 系统管理菜单
		for (var i = 0; i < menus.length; i++) {
			var item = menus[i];
			if (item && item.icon && item.icon.indexOf('gear')>0) {
				menus[i] = null;
				menus[cols * rows - 1] = item;
				break;
			}
		}

		var table = document.createElement('table');
		$X(pid).innerHTML = "";
		$X(pid).className = 'ewa-metro-menu';
		$X(pid).appendChild(table);
		$($X(pid)).append('<div class="pop_title" style="display: none;"><div>-</div><p></p></div>');
		$($X(pid)).css('background', 'transparent').css('border', 0);
		table.align = 'center';
		var idx = 0;
		var ss = [];
		for (var i = 0; i < rows; i++) {
			var hid = pid + '_htr_' + i;

			var tr1 = table.insertRow(-1);
			tr1.id = hid;
			var td1 = tr1.insertCell(-1);
			td1.colSpan = cols;
			tr1.style.display = 'none';
			td1.id = hid + 'a';

			var tr = table.insertRow(-1);

			for (var m = 0; m < cols; m++) {
				var item = menus[idx];
				idx++;
				var td = this.add_menu_item(tr, item, isShowBlank, idx, className, hid);
				if (item) {
					td.id = "M_" + item.id;
				}
				if (td && item && (item.all == null || item.all == true)) {
					var s1 = td.innerHTML;
					ss.push(s1);
				}

			}
		}
		if (!this._is_load_main_menu && this.menuLoadInRight) {
			parent.$("#RIGHT").html(ss.join(''));
			parent.$("#RIGHT .item").each(function() {
				$(this).append($(this).attr('_title'));
				$(this).attr("onmouseout", null);
				$(this).attr("onmouseover", null);
				$(this).attr("onclick", "EWA_UI_Metro.right_show_menu_sub(this,event)");
			});
		}
		this._is_load_main_menu = true;
	},
	add_menu_item : function(tr, item, isShowBlank, idx, className, hid) {
		if (isShowBlank || item) {
			var td = tr.insertCell(-1);
			var s = "<div class='" + className + "'><i id='memu_item_" + idx + "'></i></div>";
			td.innerHTML = s;
		}
		if (!item) {
			return;
		}

		var o = $(td).find('i');
		var op = o.parent();
		if (item.icon && item.icon.trim().length > 0) {
			if (item.icon.indexOf('fa') == 0) {
				o.attr("class", item.icon);
			} else {
				op.append("<table width=100% height=100%><tr><td align=center><img style='max-width:90%;max-height:90%' src='"
					+ item.icon + "' /></td></tr></table>");
				o.hide();
			}
		} else if (item.img) {
			op.append("<table width=100% height=100%><tr><td align=center><img  src='" + item.img + "' /></td></tr></table>");
			o.hide();
		}
		op.attr("_title", item.title);
		op.attr("onmouseover", 'EWA_UI_Metro.show_title(this)');
		op.attr("onmouseout", "$('.pop_title').hide()");
		op.attr("hid", hid);
		if (item.url) {
			op.attr("u", item.url);
			op.attr("onclick", "EWA_UI_Metro.item_click(this,event)");
		} else if (item.subs) {
			// sub menu
			op.attr('subs', JSON.stringify(item.subs));
			op.attr('onclick', "EWA_UI_Metro.show_menu_sub(this,event)");
		}
		td.id = "M_" + item.id;
		return td;
	},
	show_menu_sub : function(obj) {
		var t = $(obj);
		var cls = t.attr("class");
		var pid = t.attr('hid');
		if (window.last_open && window.last_open != obj) {
			window.last_open.click();
		}
		if (t.attr('is_open') == 1) { // 已经打开，关闭
			t.attr('is_open', "0");
			$X(pid).style.display = 'none';
			window.last_open = null;
			t.attr('class', cls.split(' ')[0]);

		} else {
			t.attr('is_open', "1");
			var menus = JSON.parse(obj.getAttribute('subs'));
			$X(pid).style.display = '';
			$X(pid).style.opacity = 0;
			EWA_UI_Metro.add_menus(menus, pid + 'a', 'item_sub', 9, Math.round(menus.length / 9 + 0.4), false);
			t.attr('class', cls + " open");
			$($X(pid)).animate({
				opacity : 1
			}, 300);
			window.last_open = obj;
			EWA_UI_Metro.load_msg_sub();
		}
		
		if(this.show_menu_sub_after){
			this.show_menu_sub_after(obj);
		}
	},
	css : function() {
		if (this._css_setted) {
			return;
		}
		var ss = [];
		ss.push(".nav_box {");
		ss.push("margin: auto;");
		ss.push("margin-top: 50px;");
		ss.push("}");
		ss.push(".nav_box .item {");
		ss.push("margin: 5px;");
		ss.push("background-color: #08c;");
		ss.push("width: 140px;");
		ss.push("height: 140px;");
		ss.push("text-align: center;");
		ss.push("color: #fff;");
		ss.push("transition-duration: 0.3s;");
		ss.push("-webkit-transition-duration: 0.3s;");
		ss.push("cursor: pointer;");
		ss.push("position: relative;");
		ss.push("}");
		ss.push(".nav_box .item .msg {");
		ss.push("position: absolute;");
		ss.push("top: -8px;");
		ss.push("right: -8px;");
		ss.push("height: 18px;");
		ss.push("border-radius: 10px;");
		ss.push("background-color: red;");
		ss.push("color: #fff;");
		ss.push("line-height: 18px;");
		ss.push("text-align: center;");
		ss.push("min-width: 18px;");
		ss.push("padding: 2px;");
		ss.push("box-shadow: 1px 1px 13px rgba(0, 0, 245, 0.7);");
		ss.push("}");
		ss.push(".nav_box .open {");
		ss.push("-webkit-transform: rotate(45deg) scale(0.7);");
		ss.push("-webkit-transition-duration: 0.7s;");
		ss.push("transform: rotate(45deg) scale(0.7);");
		ss.push("transition-duration: 0.7s;");
		ss.push("}");
		ss.push(".nav_box .open i {");
		ss.push("transform: rotate(-45deg);");
		ss.push("-webkit-transform: rotate(-45deg);");
		ss.push("}");
		ss.push(".nav_box .item:hover {");
		ss.push("background-color: #fff;");
		ss.push("color: #08c;");
		ss.push("-webkit-transition-duration: 0.3s;");
		ss.push("transition-duration: 0.3s;");
		ss.push("}");
		ss.push(".nav_box .item i {");
		ss.push("line-height: 140px;");
		ss.push("font-size: 60px;");
		ss.push("}");
		ss.push(".nav_box .item img {");
		ss.push("max-height: 100px;");
		ss.push("max-width: 100px;");
		ss.push("}");
		ss.push(".nav_box .item_sub {");
		ss.push("margin: 12px;");
		ss.push("background-color: darkorange;");
		ss.push("width: 70px;");
		ss.push("height: 70px;");
		ss.push("text-align: center;");
		ss.push("color: #fff;");
		ss.push("-webkit-transition-duration: 0.3s;");
		ss.push("transition-duration: 0.3s;");
		ss.push("cursor: pointer;");
		ss.push("position: relative;");
		ss.push("}");
		ss.push(".nav_box .item_sub .msg {");
		ss.push("position: absolute;");
		ss.push("top: -8px;");
		ss.push("right: -8px;");
		ss.push("height: 18px;");
		ss.push("border-radius: 10px;");
		ss.push("background-color: #fff;");
		ss.push("color: red;");
		ss.push("line-height: 18px;");
		ss.push("text-align: center;");
		ss.push("min-width: 18px;");
		ss.push("padding: 2px;");
		ss.push("box-shadow: 1px 1px 13px rgba(255, 0, 0, 0.7);");
		ss.push("}");
		ss.push(".nav_box .item_sub i {");
		ss.push("line-height: 70px;");
		ss.push("font-size: 30px;");
		ss.push("}");
		ss.push(".nav_box .item_sub:hover {");
		ss.push("background-color: #fff;");
		ss.push("color: darkorange;");
		ss.push("-webkit-transition-duration: 0.3s;");
		ss.push("transition-duration: 0.3s;");
		ss.push("}");

		ss.push(".pop_title{ position: absolute;min-width: 50px;display: none;z-index: 212;white-space: nowrap;}");
		ss
			.push(".pop_title div {position: relative;width: 100%;z-index: 2;height: 30px;line-height: 30px;text-align: center;background-color: #8D8804;padding: 0 4px;border-radius: 5px;color: #fff;}");
		ss.push(".pop_title p {");
		ss.push("position: relative;");
		ss.push("padding: 0px;");
		ss.push("height: 12px;");
		ss.push("width: 12px;");
		ss.push("transform: rotate(45deg);");
		ss.push("-webkit-transform: rotate(45deg);");
		ss.push("margin: auto;");
		ss.push("margin-top: -6px;");
		ss.push("z-index: 1;");
		ss.push("background-color: #8D8804;");
		ss.push("}");

		var obj = document.createElement('style');
		obj.textContent = ss.join('\n');
		document.getElementsByTagName('head')[0].appendChild(obj);
		this._css_setted = true;
	},
	right_show_menu_sub : function(obj, evt) {
		var evt = evt || event;
		var t1 = evt.target || evt.srcElement;
		if (t1.className != 'item') {
			return;
		}
		var t = $(obj);
		var subMenus = this.right_add_menu_subs(obj);
		if (window.last_open && window.last_open != obj) {
			window.last_open.click();
		}
		if (t.attr('is_open') == 1) { // 已经打开，关闭
			t.attr('is_open', "0");
			if (subMenus) {
				subMenus.style.display = 'none';
			}
			window.last_open = null;
		} else {
			t.attr('is_open', "1");
			if (subMenus) {
				subMenus.style.display = '';
			}
			window.last_open = obj;
		}
	},
	right_add_menu_subs : function(pobj) {
		var id = ('M_' + Math.random()).replace(".", "");
		pobj.id = pobj.id || id;
		var id1 = pobj.id + "_s";
		if ($X(id1)) {
			return $X(id1);
		}
		var menus;
		var subs = pobj.getAttribute('subs');
		if (subs) {
			menus = JSON.parse(subs);
		}
		if (!menus || menus.length == 0) {
			this.right_item_click(pobj);
			return;
		}
		var div = document.createElement('div');
		div.id = id1;
		pobj.appendChild(div);
		for (var i = 0; i < menus.length; i++) {
			var item = menus[i];
			var p = document.createElement('p');
			$(p).attr({
				onclick : "EWA_UI_Metro.right_item_click(this)",
				"_title" : item.title,
				u : item.url
			});
			p.innerHTML = "<b class='" + item.icon + "'></b><span>" + item.title + "</span>";
			div.appendChild(p);
		}
		return div;
	},
	right_item_click : function(obj) {
		var item = $(obj);
		var u = item.attr("u");
		var t = item.attr("_title");
		if (u) {
			if (u.indexOf('/') > 0) {
				u = u;
			} else if (u.indexOf('?') >= 0) {
				u = EWA.CP + "/EWA_STYLE/cgi-bin/" + u;
			} else {
				u = EWA.CP + "/EWA_STYLE/cgi-bin/?" + u;
			}
			AddTab(u, t);
		}
	},
	load_msg_sub : function() {

	}
// add_menus(index_menus, 'nav_box', 'item', g_menu_cols, g_menu_rows,
// true);

};
var __Menu = {
	C : EWA_UI_MenuClass
};
__Menu.OnMouseOver = function(obj) {
	if (__Menu._LastObj != null) {
		__Menu._LastObj.style.backgroundColor = "";
	}
	__Menu._LastObj = obj;
	obj.style.backgroundColor = "#DDD";
};
__Menu.OnClick = function(e, obj) {
	if (__Menu._LastObj != null) {
		__Menu._LastObj.style.backgroundColor = "";
	}
	__Menu._LastObj = null;
	typeof e.stopPropagation != "undefined" ? e.stopPropagation() : e.cancelBubble = true;
	if (obj.id.indexOf('_EWA_MF_') > 0 && obj.id.indexOf('*') > 0) {
		var id = obj.id.split('*')[0];
		var o1 = document.getElementById(id);
		for (var i = 0; i < o1.childNodes.length; i++) {
			var o2 = o1.childNodes[i];
			if (o2.getAttribute('EWA_MF_PID') == o1.id) {
				alert(o2.innerHTML);
			}
		}
	}
	EWA.C.Utils.RunCmd(obj);// 执行cmd
};

EWA["UI"].Menu = __Menu; /* 菜单 */

var __EMP_TIP_TIMER_SHOW;
var __EMP_TIP_CLASS;
function EMP_TIP_HIDE() {
    window.clearInterval(__EMP_TIP_TIMER_SHOW);
    __EMP_TIP_CLASS._Hidden();
    __EMP_TIP_TIMER_SHOW = null;
}

function EWA_UI_TipClass(id) {
    this.ParentWindow = window;
    this.TipFrame = null;
    this.Alpha = 0;
    this.IsShow = true;
    this._Id = "__EWA_TIP_" + id;
    this._ShowDocument = null;

    this._ForTable = null;
    this._BakTable = null;
    this._BakFrame = null;
    this._InitTipFrame = function() {
        var odiv = this._InitDiv();
        var otb = this._InitTable();
        this._ForTable = otb;
        this._InitTableImgForground(otb);
        odiv.appendChild(otb);
        var otb1 = this._InitTable();
        this._BakTable = otb1;
        this._InitTableImgBackground(otb1);
        odiv.appendChild(otb1);
        this.TipFrame = odiv;
        this.ParentWindow.document.body.appendChild(odiv);
        __EMP_TIP_CLASS = this;
    };
    this._InitDiv = function() {
        var odiv = this.ParentWindow.document.createElement("div");
        odiv.id = this._Id;
        odiv.style.zIndex = "1998";
        odiv.style.display = "none";
        odiv.className = 'ewa-tip';
        if (EWA.B.IE) {
            odiv.innerHTML = "<iframe src='javascript:false' style=\"position:absolute; visibility:inherit; top:0px; left:0px; width:1px; height:1px; z-index:-1; filter='progid:DXImageTransform.Microsoft.Alpha(style=0,opacity=0)';\"></iframe>";
            this._BakFrame = odiv.childNodes[0];
        } else {
            odiv.innerHTML = "<div style=\"position:absolute; visibility:inherit; top:0px; left:0px; width:1px; height:1px; z-index:-1;\"></div>";
            this._BakFrame = odiv.childNodes[0];
        }
        return odiv;
    };
    this._CreateImgHtml = function(src, width, height) {
        var imgSrc = EWA.RV_STATIC_PATH == null ? EWA.CP : EWA.RV_STATIC_PATH;
        var src1 = imgSrc + "/EWA_STYLE/images/tip/" + src;
        return "<img src='" + src1 + "' width=" + width + " height=" + height + ">";
    };
    this._SetBackgound = function(obj, src) {
        var imgSrc = EWA.RV_STATIC_PATH == null ? EWA.CP : EWA.RV_STATIC_PATH;
        var src1 = imgSrc + "/EWA_STYLE/images/tip/" + src;
        obj.style.backgroundImage = "url('" + src1 + "')";
        obj.style.backgroundRepeat = "repeat-x";
    };
    this._InitTableImgForground = function(otb) {
        //		otb.style.position = "absolute";
        //		otb.style.zIndex = 22;
        //		otb.style.left = "0px";
        //		otb.style.top = "0px";
        otb.className = 'ewa-tip-for';

        otb.rows[2].cells[1].onmouseover = function() {
            window.clearInterval(__EMP_TIP_TIMER_SHOW);
            __EMP_TIP_TIMER_SHOW = null;
            this.bgColor = "#FFCC66";
        };
        otb.onmouseout = function() {
            window.clearInterval(__EMP_TIP_TIMER_SHOW);
            __EMP_TIP_TIMER_SHOW = null;
            __EMP_TIP_CLASS.HiddenTip();
            this.rows[2].cells[1].bgColor = "white";
        };
        otb.rows[0].cells[0].className = 'ewa-tip-arrow';
        // cells[0].style.width = "6px";
        // cells[0].style.height = "6px";
        // cells[0].innerHTML = this._CreateImgHtml("image040.gif", 6, 6);
        // cells[2].style.width = "6px";
        // cells[2].innerHTML = this._CreateImgHtml("image042.gif", 6, 6);
        // this._SetBackgound(cells[1], "image055.png");
        otb.rows[1].cells[0].className = "ewa-tip-tl";
        otb.rows[1].cells[1].className = "ewa-tip-tm";
        otb.rows[1].cells[2].className = "ewa-tip-tr";

        // this._SetBackgound(cells[0], "image057.png");
        // this._SetBackgound(cells[2], "image059.png");
        // cells[1].width = "100%";
        // cells[1].bgColor = "white";
        // cells[1].style.fontSize = "12px";
        otb.rows[2].cells[0].className = "ewa-tip-l";
        otb.rows[2].cells[1].className = "ewa-tip-m";
        otb.rows[2].cells[2].className = "ewa-tip-r";

        // cells[0].style.height = "6px";
        // cells[0].innerHTML = this._CreateImgHtml("image065.png", 6, 6);
        // cells[2].innerHTML = this._CreateImgHtml("image067.gif", 6, 6);
        // this._SetBackgound(cells[1], "image061.png");
        // cells[1].innerHTML = "<img width=1 height=1>";
        otb.rows[3].cells[0].className = "ewa-tip-bl";
        otb.rows[3].cells[1].className = "ewa-tip-bm";
        otb.rows[3].cells[2].className = "ewa-tip-br";
    };
    this._InitTableImgBackground = function(otb) {
        // otb.style.position = "absolute";
        // otb.style.zIndex = 21;
        // otb.style.left = "2px";
        // otb.style.top = "2px";
        // otb.style.filter = "alpha(opacity=60)";
        // otb.style.opacity = 0.6;
        // with (otb.rows[1]) {
        // cells[0].style.width = "6px";
        // cells[0].style.height = "6px";
        // cells[0].innerHTML = this._CreateImgHtml("image001.png", 8, 8);
        // cells[2].style.width = "6px";
        // cells[2].innerHTML = this._CreateImgHtml("image003.png", 8, 8);
        // this._SetBackgound(cells[1], "image021.png");
        // }
        // with (otb.rows[2]) {
        // this._SetBackgound(cells[0], "image023.png");
        // this._SetBackgound(cells[2], "image025.png");
        // cells[1].width = "100%";
        // cells[1].style.fontSize = "12px";
        // }
        // with (otb.rows[3]) {
        // cells[0].style.height = "6px";
        // cells[0].innerHTML = this._CreateImgHtml("image005.png", 8, 8);
        // cells[2].innerHTML = this._CreateImgHtml("image007.png", 8, 8);
        // this._SetBackgound(cells[1], "image027.png");
        // }
    };
    this._InitTable = function() {
        var otb = this.ParentWindow.document.createElement("table");
        var otr = otb.insertRow(-1);
        otr.insertCell(-1);
        otr = null;
        for (var i = 0; i < 3; i++) { // 3x3 table
            var otr = otb.insertRow(-1);
            for (var m = 0; m < 3; m++) {
                var otd = otr.insertCell(-1);
                if (i == 1 && m == 1) {
                    otd.style.fontSize = "12px";
                } else {
                    otd.style.fontSize = "1px";
                }
                otd = null;
            }
            otr = null;
        }
        otr = otb.insertRow(-1);
        otr.insertCell(-1);
        otr = null;
        otb.border = 0;
        otb.cellSpacing = 0;
        otb.cellPadding = 0;
        otb.style.fontSize = "1px";
        otb.rows[0].cells[0].colSpan = 3;
        otb.rows[4].cells[0].colSpan = 3;
        return otb;
    };
    this.ShowTip = function(str, x, y) {
        window.clearInterval(__EMP_TIP_TIMER_SHOW);
        __EMP_TIP_TIMER_SHOW = null;

        this.TipFrame.style.display = "";
        this._ForTable.rows[2].cells[1].innerHTML = str;
        var w = this._ForTable.offsetWidth;
        var h = this._ForTable.offsetHeight;
        var cw = this._ForTable.rows[2].cells[1].offsetWidth;
        var ch = this._ForTable.rows[2].cells[1].offsetHeight;
        this._ForTable.style.width = (cw + 12) + 'px';

        //		this._BakTable.rows[2].cells[1].innerHTML = "<div style='width:" + cw + "px;height:" + ch + "px'></div>";
        //		this._BakFrame.style.width = w + "px";
        //		this._BakFrame.style.height = h + "px";

        var aleft = w / 4;
        var divLeft = x - aleft + 14;
        if (divLeft < 0) {
            divLeft = 12;
        } else {
            var divRight = w + divLeft;
            if (this._ShowDocument != null) {
                if (divRight > this._ShowDocument.body.offsetWidth) {
                    divLeft = this._ShowDocument.body.offsetWidth - w - 2;
                }
            }
        }
        this.TipFrame.style.left = divLeft + "px";
        this.TipFrame.style.top = y + 3 + "px";
        var arrowX = x - divLeft;
        var arrowX1 = arrowX + 3;
        var arrowImg1 = "/EWA_STYLE/images/tip/image048.gif";
        var arrowImg2 = "/EWA_STYLE/images/tip/image013.png";
        if (arrowX < w / 2 && arrowX - 32 > 0) {
            arrowImg1 = "/EWA_STYLE/images/tip/image050.gif";
            arrowImg2 = "/EWA_STYLE/images/tip/image015.png";
            arrowX -= 32;
            if (arrowX < 0) {
                arrowX = 4;
            }
            arrowX1 = arrowX - 3;
        }
        var offsetY = document.all ? 6 : 9;
        var imgSrc = EWA.RV_STATIC_PATH == null ? EWA.CP : EWA.RV_STATIC_PATH;
        var s1 = "<img src='" + imgSrc + arrowImg1 + "' width=32 height=21 style='position: relative; left: " + arrowX
            + "px; top: " + offsetY + "px'>";
        this._ForTable.rows[0].cells[0].innerHTML = s1;
        var s2 = "<img src='" + imgSrc + arrowImg2 + "' width=37 height=21 style='position: relative; left: " + arrowX1
            + "px; top: " + offsetY + "px'>";
        if (document.all) {
            var src = imgSrc + arrowImg2;
            s2 = "<div style=\"filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + src
                + "', sizingMethod='scale'); position: relative; left: " + arrowX1 + "px; top: " + offsetY
                + "px; width:37px; height:21px\"></DIv>";
        }
        this._BakTable.rows[0].cells[0].innerHTML = s2;
        this.TipFrame.style.display = "";
    };
    this.HiddenTip = function() {
        __EMP_TIP_CLASS = this;
        if (__EMP_TIP_TIMER_SHOW != null) {
            window.clearInterval(__EMP_TIP_TIMER_SHOW);
        }
        __EMP_TIP_TIMER_SHOW = window.setInterval(EMP_TIP_HIDE, 500);
    };
    this.GetObjectLocation = function(obj, evt) {
        var loc = EWA.UI.Utils.GetPosition(obj);
        return [ loc.X, loc.Y ];
    };
    this._Hidden = function() {
        this.TipFrame.style.display = "none";
    };
    this._InitTipFrame();
}function EWA_UI_LinkClass(obj1, obj2) {
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

}function EWA_UI_TabsClass(className) {
	this._ClassName = className;
	this._Index = 0;
	this._TabsParent = null; // 页舌容器
	this._ContentsParent = null; // 内容容器
	this._IdTabTag = "__EWA_TAB_HEAD_";
	this._IdFrameTag = "__EWA_TAB_FRAME_";
	this.CurrentWindow = null;
	this._CurId = '';

	this.CreateTab = function(url, name) {
		var id = this._CheckExist(url);
		if (id == null) {
			id = this._Index;
			var title = name || "...";
			var objTab = this._CreateTabHead(url, title);
			var objIframe = this._CreateIframe(url);
			this._Index++;

			if (!name) { // 根据ifame的title设置tab标题
				EWA_ChkIframeOk(objIframe, function(ifameWindow, iframe) {
					var title = ifameWindow.document.title;
					$(objTab).find('.bg_c span:eq(0)').text(title);
				});
			}
		}
		this.ShowTab(id);
	};

	this._CreateTabHead = function(url, name) {
		var id = this._Index;
		var td = this._TabsParent.ownerDocument.createElement("table");
		td.cellPadding = 0;
		td.cellSpacing = 0;
		td.border = 0;
		td.setAttribute('ewa_tab_url', url);
		td.title = '双击关闭窗口\r\n右键刷新当前窗口';
		var tr = td.insertRow(-1);

		var cellLeft = tr.insertCell(-1);
		cellLeft.className = 'bg_l';

		var cell = tr.insertCell(-1);
		cell.className = 'bg_c';
		cell.innerHTML = "<nobr><span>" + name
				+ "</span><b class='ewa_tab_close'></b></nobr></div>";
		cell.getElementsByTagName('b')[0].onclick = function() {
			var obj = this.parentNode.parentNode.parentNode.parentNode.parentNode;
			var id1 = obj.id.split("_");
			var id = id1[id1.length - 1];
			eval('window.' + obj.getAttribute('ewa_class_name')).RemoveTab(id);
		}
		var cellRigth = tr.insertCell(-1);
		cellRigth.className = 'bg_r';

		td.id = this._IdTabTag + id;
		td.className = "ewa_tab_act";
		td.setAttribute('ewa_class_name', this._ClassName);
		td.onclick = function() {
			if (td.getAttribute("ewa_tab_act") == 0) {
				var id1 = this.id.split("_");
				var id = id1[id1.length - 1];
				eval('window.' + this.getAttribute('ewa_class_name')).ShowTab(
						id);
			}
		};
		td.ondblclick = function() {
			var id1 = this.id.split("_");
			var id = id1[id1.length - 1];
			eval('window.' + this.getAttribute('ewa_class_name')).RemoveTab(id);
		};
		td.onselectstart = function() {
			return false;
		};
		td.oncontextmenu = function(evt) {
			this.onclick();
			if (EWA.B.IE) {
				window.event.returnValue = false;// for IE
			} else {
				evt.preventDefault();
			}
			var id1 = this.id.split("_");
			var id = '__EWA_TAB_FRAME_' + id1[id1.length - 1];
			var u = new EWA_UrlClass();
			var w = $X(id).contentWindow;
			u.SetUrl(w.location.href);
			u.RemoveParameter("________r");
			u.AddParameter("________r", Math.random());
			w.location.href = u.GetUrl();
			return false;
		}
		if (!EWA.B.IE) {
			td.onmousedown = function(event) {
				if (typeof (event.preventDefault) != "undefined") {
					event.preventDefault();
				}
			};
		}
		this._TabsParent.appendChild(td);
		return td;
	};
	this._CreateIframe = function(url) {
		var obj = this._ContentsParent.ownerDocument.createElement("IFRAME");
		obj.frameBorder = 0;
		obj.width = "100%";
		obj.height = "100%";
		obj.src = url;

		var id = this._Index;
		obj.id = this._IdFrameTag + id;
		this._ContentsParent.appendChild(obj);

		return obj;
	};

	this.RemoveCurrentTab = function() {
		this.RemoveTab(this._CurId);
	};
	this.RemoveTab = function(id) {
		var seqIndex = 9999999999999;
		var seqId;
		var iframes = this._ContentsParent.getElementsByTagName('iframe');
		var objRemove = null;
		for (var i = 0; i < iframes.length; i++) {
			var o = iframes[i];
			if (o.id != this._IdFrameTag + id) {
				if (seqIndex > o.getAttribute("ewa_tab_show_seq") * 1) {
					seqIndex = o.getAttribute("ewa_tab_show_seq") * 1;
					seqId = o.id;
				}
			} else {
				objRemove = o;
			}
		}

		this._ContentsParent.removeChild(objRemove);
		var objTab = this._TabsParent.ownerDocument
				.getElementById(this._IdTabTag + id);
		this._TabsParent.removeChild(objTab);

		if (seqId != null) {
			var id1 = seqId.split("_");
			var id2 = id1[id1.length - 1];

			if (this._ContentsParent.ownerDocument
					.getElementById(this._IdTabTag + id2) != null) {
				this.ShowTab(id2);
			}
		}
	};

	this._CheckExist = function(url) {
		var spans = this._TabsParent.childNodes;
		for (var i = 0; i < spans.length; i++) {
			var o = spans[i];
			if (o.getAttribute('ewa_tab_url') == url) {
				var id1 = o.id.split("_");
				var id2 = id1[id1.length - 1];
				return id2;
			}
		}
		return null;
	};

	this.ShowTab = function(id) {
		this._CurId = id;

		var iframes = this._ContentsParent.getElementsByTagName('iframe');
		this.CurrentWindow = null;
		var showTab, showIframe, hideTab, hideIframe;
		for (var i = 0; i < iframes.length; i++) {
			var o = iframes[i];
			var id1 = o.id.split("_");
			var id2 = id1[id1.length - 1];
			var oTab = o.ownerDocument.getElementById(this._IdTabTag + id2);
			if (o.id == this._IdFrameTag + id) {

				this.CurrentWindow = o.contentWindow;
				showTab = oTab;
				showIframe = o;
			} else {
				if (o.style.display != 'none') {
					hideTab = oTab;
					hideIframe = o;
				}

				var showSeq = o.getAttribute("ewa_tab_show_seq") * 1 + 1;
				o.setAttribute("ewa_tab_show_seq", showSeq);

			}
		}

		// 切换前调用
		if (this.showTabBeforeCallback) {
			// 用户外部定义的回调
			var isStopNext = this.showTabBeforeCallback(showTab, showIframe,
					hideTab, hideIframe);
			if (isStopNext) {
				console.log('showTabBeforeCallback return stop next');
				return;
			}
		}

		showTab.className = 'ewa_tab_act';
		showTab.setAttribute("ewa_tab_act", 1);
		showIframe.setAttribute("ewa_tab_show_seq", 0);
		showIframe.style.display = '';
		showIframe.style.zIndex = 1;
		var scrollTop = showIframe.getAttribute('s_top');
		if (scrollTop && o.contentWindow.document.scrollingElement) {
			// 恢复到原来的位置
			o.contentWindow.document.scrollingElement.scrollTop = scrollTop * 1;
		}

		if (hideIframe) {
			hideTab.className = 'ewa_tab_dact';
			hideTab.setAttribute("ewa_tab_act", 0);

			hideIframe.style.display = 'none';
			hideIframe.style.zIndex = 0;

			// frameset为null
			if (o.contentWindow.document.scrollingElement) {
				// 保存当前的位置
				var scrollTop = o.contentWindow.document.scrollingElement.scrollTop;
				hideIframe.setAttribute('s_top', scrollTop);
			}
		}

		// 切换后调用
		if (this.showTabAfterCallback) {
			// 用户外部定义的回调
			this.showTabCallback(showTab, showIframe, hideTab, hideIframe);
		}
	};
	/**
	 * 初始化
	 * 
	 * @param {}
	 *            tabsParent 标头的容器
	 * @param {}
	 *            framesParent 内容的容器
	 */
	this.Init = function(tabsParent, contentsParent) {
		if (!EWA.B.IE) {
			// firefox onselectstart
			try {
				tabsParent.style.MozUserFocus = "ignore";
				tabsParent.style.MozUserInput = "disabled";
				tabsParent.style.MozUserSelect = "none";
			} catch (e) {

			}
		}

		var ot = tabsParent.ownerDocument.createElement("table");
		ot.style.width = "100%";
		ot.style.height = "100%";
		ot.onselectstart = function() {
			return false;
		};

		ot.cellSpacing = 0;
		ot.cellPadding = 0;
		var otr = ot.insertRow(-1);
		var otd = otr.insertCell(-1);
		otd.vAlign = "bottom";
		ot.className = 'ewa_tab';
		tabsParent.appendChild(ot);
		this._ContentsParent = contentsParent;

		this._TabsParent = ot.rows[0].cells[0];
		ot = null;
	};
}/**
 * 弹出窗体类
 */
function EWA_UI_DialogClass() {
	this.zIndex = 999;
	this.Id = null;
	this.Width = "200px";
	this.Height = "200px";
	this.Left = "-1000px";
	this.Top = "-1000px";
	this.Offset = "5";
	this.ShadowColor = "#777777"; // 阴影
	this.IsShowTitle = false; // 显示Title
	this.IsCanMove = true; // 是否允许拖动
	this.IsCover = false; // 是否生成Cover层
	this.AutoSize = false;
	this.DisposeOnClose = true; // 关闭时立即注销窗体
	// -----------------------------
	this.Frame = null;
	this.FrameContent = null;
	this.FrameTitle = null;
	this.CreateWindow = null; // 创建用的Win
	this._CreateWindowIndex = null;
	this._WindowIndex = null;

	this.GetFrame = function() {
		return this.GetObject(this.Frame);
	};
	this.GetFrameContent = function() {
		return this.GetObject(this.FrameContent);
	};
	this.GetFrameTitle = function() {
		return this.GetObject(this.FrameTitle);
	};
	this.GetObject = function(id) {
		if (id == null) {
			return null;
		}
		return this.CreateWindow.$X(id);
	};

	// --------------------------------
	this.SetHtml = function(html) {
		this.GetFrameContent().innerHTML = html;
	};
	this.SetObject = function(obj) {
		this.GetFrameContent().appendChild(obj);
	};
	this.SetTitle = function(title) {
		if (this.GetFrameTitle() != null) {
			this.GetFrameTitle().innerHTML = title;
		}
	};
	this.ScrollMoveDiv = function() {
		var o = this.GetFrame()
		if (o == null)
			return;
		var doc = o.ownerDocument;
		var x = doc.body.scrollLeft;
		var y = doc.body.scrollTop;

		var x0 = o.getAttribute('_SCROLL_X') * 1;
		var y0 = o.getAttribute('_SCROLL_Y') * 1;

		o.style.left = (x - x0 + $X(this.Frame).offsetLeft) + "px";
		o.style.top = (y - y0 + $X(this.Frame).offsetTop) + "px";

		o.setAttribute('_SCROLL_X', x);
		o.setAttribute('_SCROLL_Y', y);
		o = null;
	};
	// 移动到对象下部
	this.MoveBottom = function(obj) {
		// var p = EWA$UI$COMMON.GetPosition(obj);
		var p = $(obj).offset();
		p.Y = p.top + $(obj).height();
		p.X = p.left;
		var doc = obj.ownerDocument;
		var w = doc.parentWindow ? doc.parentWindow : doc.defaultView;
		if (w == this.CreateWindow) {
			var x = document.body.clientWidth;
			var y = document.body.clientHeight;
			var mx = p.X;
			var my = p.Y;

			var fh = (this.Height + "").replace("px", "") * 1;
			var fw = (this.Width + "").replace("px", "") * 1;
			if (p.Y + obj.clientHeight + fh > y) {
				my = p.Y - obj.clientHeight - fh;
			}
			if (p.X + fw > x) {
				mx = x - fw - obj.clientWidth;
			}
			if (EWA.B.PAD) {
				mx = 0;
			}
			var fix_h = 4;
			this.Move(mx, my + fix_h);

		} else {// 窗口Win不一致
			var f = w._EWA_DialogWnd._Dialog.GetFrame();
			var x = f.offsetLeft;
			var y = f.offsetTop;

			var o = this.GetFrame()
			o.setAttribute('_SCROLL_X', f.getAttribute('_SCROLL_X'));
			o.setAttribute('_SCROLL_Y', f.getAttribute('_SCROLL_Y'));
			f = o = null;

			var obj_h = $(obj).height();
			var mx = p.X + x;
			if (EWA.B.PAD) {
				mx = 0;
			}
			var caption_height = w._EWA_DialogWnd._Dialog.GetFrameTitle().clientHeight;
			this.Move(mx, p.Y + y + obj_h + caption_height);
		}
		doc = w = null;
	};
	this.Move = function(x, y) {
		var o = this.GetFrame()
		if (o == null)
			return;
		EWA.UI.Utils.MoveTo(o, x, y < 0 ? 0 : y);
		o = null;
	};
	this.MoveCenter = function() {
		var o = this.GetFrame()
		var w = o.clientWidth;
		var h = o.clientHeight;
		var docSize = EWA.UI.Utils.GetDocSize(this.CreateWindow);
		var h1 = docSize.H;

		var w1 = docSize.W;
		var h2 = (h1 - h) / 2 - 40;
		var w2 = (w1 - w) / 2;
		if (w2 < 0) {
			w2 = 0;
		}
		if (h2 < 0) {
			h2 = 0;
		}
		var h3 = docSize.SH;
		var w3 = docSize.SW;
		o.setAttribute('_SCROLL_X', w3);
		o.setAttribute('_SCROLL_Y', h3);
		this.Move(w2 + w3, h2 + h3);
		o = null;
	};
	this.ResizeByContent = function() {
		var o = this.GetFrame();
		var obj = this.GetFrameContent().childNodes[0];
		if (obj.tagName == "IFRAME") {
			var o2 = obj.contentWindow;
			if (o2 && o2.document && o2.document.body) {
				var o1 = o2.document.getElementById('Test1');
				if (o1) {
					obj = o1;
				}
			}
		}
		var w00 = 0;
		var h00 = 0;
		// if (!this._calc_frame_table) {
		var frame_table = this.GetFrameContent().parentNode.parentNode.parentNode; // table
		w00 = $(frame_table).css('border-left-width').replace('px', '') * 1
				+ $(frame_table).css('border-right-width').replace('px', '')
				* 1;

		h00 = $(frame_table).css('border-top-width').replace('px', '') * 1
				+ $(frame_table).css('border-bottom-width').replace('px', '')
				* 1;

		this._calc_frame_table = w00;
		// }
		var w = $(obj).width();
		w += w00;
		var h = $(obj).height() + h00;
		var x = o.style.left.replace("px", "") * 1;
		var y = o.style.top.replace("px", "") * 1;

		if ((w + x) > this.CreateWindow.document.body.clientWidth) {
			this.Move(this.CreateWindow.document.body.clientWidth - w - 20, y);
		}
		// console.log('ResizeByContent', w, h, w00, h00);
		this.Resize(w, h, true);
		o = obj = null;
	};
	this.Resize = function(width, height, ischeckborderwidth) {
		if (this.IsShowTitle) {
			var objTitle = this.GetFrameTitle();
			// console.log($(objTitle).parent().height());
			height = height + $(objTitle).parent().height();
		}
		var w00 = 0;
		var h00 = 0;
		if (!ischeckborderwidth) {
			var frame_table = this.GetFrameContent().parentNode.parentNode.parentNode; // table
			w00 = $(frame_table).css('border-left-width').replace('px', '')
					* 1
					+ $(frame_table).css('border-right-width')
							.replace('px', '') * 1;
			this._calc_frame_table = w00;

			h00 = $(frame_table).css('border-top-width').replace('px', '')
					* 1
					+ $(frame_table).css('border-bottom-width').replace('px',
							'') * 1;
		}
		width = width + w00;
		height = height + h00;
		// console.log("Resize", width, height, w00, h00, ischeckborderwidth);
		var o = this.GetFrame();
		o.style.width = width + "px";
		o.style.height = height + "px";
		for (var i = 0; i < o.childNodes.length; i += 1) {
			var c = o.childNodes[i];
			c.style.width = width + "px";
			c.style.height = height + "px";
			if (c.id.indexOf('divContent') > 0) {
				c.style.overflow = 'hidden';
			}
			c = null;
		}
		var cnt = this.GetFrameContent();

		var child = cnt.childNodes[0];
		/*
		 * if (child) { with (child.style) { width = cnt.clientWidth + 'px';
		 * height = cnt.clientHeight + 'px'; } }
		 */
		o = cnt = child = null;

		var oCover = this.GetObject(this._DivCover);
		$(oCover).css('background-image', 'none');
		$(oCover).attr('background-image', 'none');
	};
	this.Show = function(isShow) {
		var o = this.GetFrame();
		if (isShow) {
			o.style.display = "";
			if (this.IsShowTitle && this.AutoSize) {
				_EWA_DIALOG_ON_TIMER = this;
				this.TimerHandle = window.setInterval(function() {
					var wnd = _EWA_DIALOG_ON_TIMER;
					window.clearInterval(wnd.TimerHandle);
					var o1 = wnd.GetFrame();
					var o2 = wnd.GetFrameContent();
					var w = o2.childNodes[0].offsetWidth;
					var h = wnd.GetObject(wnd._FrameFore).offsetHeight;
					// console.log('show', w, h)
					o1.style.width = w + 'px';
					o1.style.height = h + 'px';

					if (wnd.GetObject(wnd._FrameBack1)) {
						wnd.GetObject(wnd._FrameBack1).style.width = w + 'px';
						wnd.GetObject(wnd._FrameBack1).style.height = h + 'px';
					}
					if (wnd.GetObject(wnd._FrameBack2)) {
						wnd.GetObject(wnd._FrameBack2).style.width = w + 'px';
						wnd.GetObject(wnd._FrameBack2).style.height = (h + 3)
								+ 'px';
					}
					var child = o2.childNodes[0];
					if (child) {
						child.style.width = w - 2 + 'px';
						child.style.height = h - 2 + 'px';
					}
					wnd = _EWA_DIALOG_ON_TIMER = o1 = o2 = null;

					var oCover = wnd.GetObject(this._DivCover);
					$(oCover).css('background-image', 'none');
					$(oCover).attr('background-image', 'none');
				}, 32);
			}

		} else {
			o.style.display = "none";
		}
		// var oCover = this.GetObject(this._DivCover);
		// if (oCover) {
		// oCover.style.display = o.style.display;
		// oCover.style.width = document.body.scrollWidth + 'px';
		// oCover.style.height = document.body.scrollHeight + 'px';
		// }
		o = oCover = null;
	};
	this.Dispose = function() {
		// this.CreateWindow.document.body.style.overflow=this.CreateWindow.document.body.getAttribute('ewa_open_window');
		if (!this.CreateWindow) {
			return;
		}
		this.CreateWindow._EWA_DIALOGS[this._CreateWindowIndex] = null;
		_EWA_DIALOGS[this._WindowIndex] = null;
		// this.CreateWindow.onscroll = null;
		// window.onscroll = null;
		if (this._DivCover != null) {
			EWA$UI$COMMON.Drop(this.GetObject(this._DivCover));
			this._DivCover = null;
		}
		this.GetObject(this.Frame).innerHTML = "";
		EWA$UI$COMMON.Drop(this.GetObject(this.Frame));
		this.CreateWindow = null;
		if (EWA.B.IE) {
			CollectGarbage();
		}
	};
	this.SetZIndex = function(zIndexInc) {
		this.CreateWindow._EWA_UI_DIALOG_COVERINDEX += zIndexInc;
		this.zIndex = this.CreateWindow._EWA_UI_DIALOG_COVERINDEX;
		this.GetObject(this.Frame).style.zIndex = this.zIndex;
	};
	this.CreateId = function() {
		var d = new Date();
		var r = Math.random();
		return d.getTime() + '_' + r;
	}
	this.Create = function() {
		if (this.CreateWindow == null) {
			this.CreateWindow = window;
		}
		if (this.IsCover) {
			this._CreateCover();
		}
		var id0 = this.CreateId();
		var w = this.CreateWindow;
		if (w._EWA_UI_DIALOG_COVERINDEX == null) {
			w._EWA_UI_DIALOG_COVERINDEX = 0;
		}
		w._EWA_UI_DIALOG_COVERINDEX += 1;
		this.zIndex = w._EWA_UI_DIALOG_COVERINDEX;
		var position = window.EWA_UI_DIALOG_FIXED ? "position:fixed"
				: "position:absolute";
		// 主框体
		var styleFrame = "display:none; " + position + "; width:" + this.Width
				+ "; height:" + this.Height + "; z-index:" + this.zIndex
				+ "; left:" + this.Left + "; top:" + this.Top + ";";
		var divFrame = EWA$UI$COMMON.CreateObject(w, "div", styleFrame,
				w.document.body);
		divFrame.setAttribute('EWA_NAME', 'DIV_FRAME');
		divFrame.className = 'ewa-dialog';
		divFrame.id = id0 + "divFrame";
		this.Frame = divFrame.id;

		// 背景一
		var styleBack1 = "position: absolute; width: 100%; height: 100%; left: 0px; top: 0px;";
		var divBack1 = EWA$UI$COMMON.CreateObject(w, "div", styleBack1,
				divFrame);
		divBack1.setAttribute('EWA_NAME', 'DIV_BACK1');

		divBack1.id = id0 + "divBack1";
		this._FrameBack1 = divBack1.id;

		// 背景二,阴影
		if (!(this.ShadowColor == null || this.ShadowColor == "")) {
			var styleBack2 = "position: absolute; background-color:"
					+ this.ShadowColor + "; width:100%; height:100%; left:"
					+ this.Offset + "px; top: " + (this.Offset * 1 + 2) + "px;";
			var divBack2 = EWA$UI$COMMON.CreateObject(w, "div", styleBack2,
					divFrame);
			divBack2.style.filter = "alpha(opacity=50)";
			divBack2.style.opacity = 0.5;

			divBack2.id = id0 + "divBack2";
			this._FrameBack2 = divBack2.id;
		}
		if (EWA.B.IE) { // 设置背景,覆盖select，用于ie6
			var coverHtml = "<iframe src='javascript:false' style=\"position:absolute;top:0px;left:0px;width:100%; height:100%; z-index:-1; filter='progid:DXImageTransform.Microsoft.Alpha(style=0,opacity=0)';\"></iframe>";
			divBack1.innerHTML = coverHtml;
			if (!(this.ShadowColor == null || this.ShadowColor == "")) {
				divBack2.innerHTML = coverHtml;
			}
		}
		//

		divFrame.setAttribute('_SCROLL_X', 0);
		divFrame.setAttribute('_SCROLL_Y', 0);

		this._CreateContent();

		$(divFrame)
				.append(
						"<i style='z-index:"
								+ this.zIndex
								+ "0' onclick='this.parentNode.style.display=\"none\"' class='ewa-dialog-close'></i>");

		w = divFrame = divBack1 = divBack2 = null;

		// 生成窗口事件
		if (!this.CreateWindow._EWA_DIALOGS) {
			this.CreateWindow._EWA_DIALOGS = [];
			addEvent(this.CreateWindow, 'scroll', EWA.UI.DialogOnScroll);
		}
		// 当前窗口事件
		if (!window._EWA_DIALOGS) {
			_EWA_DIALOGS = [];
			addEvent(window, 'scroll', EWA.UI.DialogOnScroll);
		}
		this._CreateWindowIndex = this.CreateWindow._EWA_DIALOGS.length;
		this.CreateWindow._EWA_DIALOGS[this._CreateWindowIndex] = this;
		this._WindowIndex = _EWA_DIALOGS.length;
		_EWA_DIALOGS[this._WindowIndex] = this;
	};
	this._CreateContent = function() {
		// 内容
		var id0 = this.CreateId();
		var w = this.CreateWindow == null ? window : this.CreateWindow;
		var styleContent = "position: absolute; width: 100%; height: 100%; z-index: 2; left: 0px; top: 0px;  background-color:white";
		var divContent = EWA$UI$COMMON.CreateObject(w, "div", styleContent,
				this.GetFrame());
		divContent.setAttribute('EWA_NAME', 'CONTENT');
		divContent.className = 'EWA_POP_MAIN';

		divContent.id = id0 + "divContent";
		if (!this.IsShowTitle) {
			this.FrameContent = divContent.id;
			return;
		}
		var mv = " EWA_WND_ID='" + this.Id + "'";
		var win = "this.ownerDocument.parentWindow";
		if (!EWA.B.IE) {
			win = "this.ownerDocument.defaultView";
		}
		if (this.IsCanMove) {// 可以移动
			var aa = win
					+ "._EWA_UI_WINDOW_LIST[this.getAttribute('EWA_WND_ID')]._OpenerWindow.EWA$UI$COMMON$Move.";
			mv += " onmousedown=\""
					+ aa
					+ "OnMouseDown(this.parentNode.parentNode,event,true,true);\"";
			mv += " onmousemove=\""
					+ aa
					+ "OnMouseMove(this.parentNode.parentNode,event,true,true);\"";
			mv += " onmouseup=\"" + aa
					+ "OnMouseUp(this.parentNode.parentNode);\"";
			mv += " onmouseout=\"try{" + aa
					+ "OnMouseOut(this.parentNode.parentNode);}catch(e){}\"";
			mv += " style='cursor:pointer' ";
		}
		// 关闭按钮
		var imgSrc = EWA.RV_STATIC_PATH == null ? '/EmpScriptV2'
				: EWA.RV_STATIC_PATH;
		var img = "<img src='" + imgSrc
				+ "/EWA_STYLE/images/dialog/but_1.gif' style='cursor:pointer' ";
		img += " onmouseover=\"var m=this.src.lastIndexOf('.');var s = this.src.substring(0, m);if(s.substring(s.length - 1).toUpperCase() == 'C'){return;}s+='c'+this.src.substring(m);this.src = s;\"";
		img += " onmouseout =\"var m=this.src.lastIndexOf('.');var s = this.src.substring(0, m - 1);s = s + this.src.substring(m);this.src = s;\"";
		var jsClose = '';
		var imgJsClose = '';
		if (this.DisposeOnClose) {
			jsClose = " ondblclick=\"" + win + "._EWA_UI_WINDOW_LIST['"
					+ this.Id + "'].CloseWindow();\"";
			imgJsClose = " onclick=\"" + win + "._EWA_UI_WINDOW_LIST['"
					+ this.Id + "'].CloseWindow();\"";
		} else {
			jsClose = " ondblclick=\"" + win + "._EWA_UI_WINDOW_LIST['"
					+ this.Id + "']._Dialog.Show(false);\"";
			imgJsClose = " onclick=\"" + win + "._EWA_UI_WINDOW_LIST['"
					+ this.Id + "']._Dialog.Show(false);\"";
		}
		img += imgJsClose + " />";
		// 显示窗体
		var s1 = "<table unselectable='on' onselectstart='return false;' style='cursor:pointer;margin-bottom:1px;width:100%;height:100%;-moz-user-select:none;' cellpadding='0' cellspacing='0' "
				+ mv + ">";
		s1 += "<tr><td "
				+ jsClose
				+ " class='EWA_POP_TITLE_L'>...</td><td class='EWA_POP_TITLE_R' align=\"right\">";
		s1 += img
				+ "</td></tr><tr><td class='EWA_POP_CNT' colspan=\"2\" valign=top></td></tr></table>";
		divContent.innerHTML = s1;

		var id1 = id0 + 'FrameContent';
		divContent.childNodes[0].rows[1].cells[0].id = id1;
		this.FrameContent = id1;

		var id2 = id0 + 'FrameTitle';
		divContent.childNodes[0].rows[0].cells[0].id = id2;
		this.FrameTitle = id2;

		this._FrameFore = divContent.id;

		w = divContent = null;

	};
	this._CreateCover = function() {
		var w = this.CreateWindow;
		if (w._EWA_UI_DIALOG_COVERINDEX == null) {
			w._EWA_UI_DIALOG_COVERINDEX = 10000000;
		}
		w._EWA_UI_DIALOG_COVERINDEX += 1;
		var cc = w.document.createElement("div");
		// var height = w.document.body.clientHeight == 0 ?
		// document.body.scrollHeight : w.document.body.clientHeight;
		// var style = "display:; width:" + w.document.body.clientWidth + "px;
		// height:" + height + "px; ";
		var style = "display:block; width:100%; height:100%; ";
		cc.style.cssText = style;
		cc.setAttribute("style", style);
		cc.style.zIndex = w._EWA_UI_DIALOG_COVERINDEX;
		cc.className = 'ewa-ui-dialog-cover';
		cc.id = this.CreateId() + '_DivCover';
		this._DivCover = cc.id;
		w.document.body.appendChild(cc);
	};
}

/**
 * 弹出窗体类
 * 
 * @param parentWindow
 *            父窗体
 */
function EWA_UI_PopWindowClass(parentWindow, isDisposeOnClose) {
	this._DivCover = null; // 覆盖层
	this._Dialog = new EWA_UI_DialogClass();
	this._Dialog.DisposeOnClose = isDisposeOnClose;
	this.OpendDialogs = new Array(); // 在此窗口上创建的对话框, 本窗口关闭时，同时关闭子窗口
	// ----------------------------
	this.Id = null;
	this._Name = null;
	this.ClassName = null;// 实例化的类名称
	this._Url = "about:blank";
	// ---------------------------------
	this._ParentWindow = parentWindow;
	this._OpenerWindow = window;
	this.OpendObject = EWA.B.IE ? (window.event ? window.event.srcElement
			: null) : null;
	// ----------- 页面显示后调用的方法 ----------
	this._CallBack = null;
	this.SetCallBack = function(callBack) {
		this._CallBack = callBack; // defined in EWA_Command
	};
	// ----------- 返回调用的窗体值的方法 -----------
	this._ReturnBack = null;
	this.SetReturnBack = function(returnBack) {
		this._ReturnBack = returnBack; // defined in EWA_Command
	};
	this.GetReturnBack = function() {
		return this._ReturnBack; // exceute Run method
	};

	this.Show = function(isShow) {
		this._Dialog.Show(isShow);
	};
	this.Hidden = function() {
		this._Dialog.Show(false);
	};

	// 关闭窗口
	this.CloseWindow = function() {
		for (var i = 0; i < this.OpendDialogs.length; i += 1) {
			this.OpendDialogs[i].Dispose();
			this.OpendDialogs[i] = null;
		}
		this._Dialog.Dispose();
		if (this._OpenerWindow) {
			try {
				this._OpenerWindow.document.body.focus();
				if (this.OpendObject) {
					this.OpendObject.focus();
				}
			} catch (e) {
			}
		}
		this.Dispose();
	};
	// 释放内存 ie
	this.Dispose = function() {
		if (this._CallBack != null) {
			try {
				this._CallBack.Dispose();
			} catch (e) {
			}
		}

		if (this._ReturnBack != null) {
			try {
				this._ReturnBack.Dispose();
			} catch (e) {
			}
		}

		try {
			var w = this.GetIframeWindow();
			if (w) {
				w._EWA_DialogWnd = null;
			}
		} catch (e) {
		}

		// 清理在其它页面的引用
		if (this._OpenerWindow) {
			try {
				this._OpenerWindow.EWA.UI.Dialog.WND[this.Id] = null;
				this._ParentWindow._EWA_UI_WINDOW_LIST[this.Id] = null;
			} catch (e) {
			}
		}
		try {
			this._Dialog.Dispose();
			this._Dialog = null;
			this._ParentWindow = null;
			this._OpenerWindow = null;
			this.OpendObject = null;
			this._CallBack = null;
			this._ReturnBack = null;
		} catch (e) {
		}
		if (EWA.B.IE) {
			CollectGarbage();
		}
	};
	this.SetNewSize = function(width, height) {
		this._Dialog.Resize(width, height);
	};
	this.Move = function(x, y) {
		this._Dialog.Move(x, y);
	};
	this.MoveCenter = function() {
		this._Dialog.MoveCenter();
	};
	this.GetIframeWindow = function() {
		if (this._ParentWindow == null) {
			return;
		}
		var n1 = "__EMP_COMMON_IFRAME" + this._Name;
		var o1;
		if (EWA.B.IE) {
			o1 = this._ParentWindow.frames[n1];
		} else {
			for (var i = 0; i < this._ParentWindow.frames.length; i = i + 1) {
				if (this._ParentWindow.frames[i].name == n1) {
					o1 = null;
					o1 = this._ParentWindow.frames[i];
					break;
				}
			}
		}
		return o1;
	};
	this.SetCaption = function(txtCaption) {
		this._Dialog.SetTitle(txtCaption);
	};
	this.SetUrl = function(url) {
		if (url == 'about:blank')
			return;
		this.GetIframeWindow().location = url;
	};

	// create dialog
	this.Create = function(width, height, name) {
		this._Name = name;
		// 生成主窗体
		this._CreateDialog(width, height);

		if (this._ParentWindow._EWA_UI_WINDOW_LIST == null) {
			this._ParentWindow._EWA_UI_WINDOW_LIST = new Object();
		}
		this._ParentWindow._EWA_UI_WINDOW_LIST[this.Id] = this;
	};
	this._CreateDialog = function(width, height) {
		var h1 = this._ParentWindow.document.body.clientHeight;
		var w1 = this._ParentWindow.document.body.clientWidth;
		var h2 = (h1 - height) / 2 - 20;
		var w2 = (w1 - width) / 2 - 20;
		if (w2 < 0) {
			w2 = 0;
		}
		if (h2 < 0) {
			h2 = 0;
		}
		this._Dialog.Id = this.Id;
		this._Dialog.Width = width;
		this._Dialog.Height = height;
		this._Dialog.CreateWindow = this._ParentWindow;
		this._Dialog.IsShowTitle = true;
		this._Dialog.IsCanMove = true;
		this._Dialog.IsCover = true;
		this._Dialog.Create();
		this._Dialog.Show(true);
		var html = "<iframe style='width:100%;height:100%;' name='__EMP_COMMON_IFRAME"
				+ this._Name + "' frameborder=0 src=\"about:blank\"></iframe>";
		this.SetHtml(html);
	};
	this.SetHtml = function(html) {
		this._Dialog.SetHtml(html);
	};
	this.ResizeByContent = function() {
		this._Dialog.ResizeByContent();
	};
}

EWA.UI.DialogOnScroll = function() {
	if (window.EWA_UI_DIALOG_FIXED || typeof _EWA_DIALOGS == 'undefined') {
		return;
	}
	for (var i = 0; i < _EWA_DIALOGS.length; i += 1) {
		if (_EWA_DIALOGS[i] == null) {
			continue;
		}
		try {
			_EWA_DIALOGS[i].ScrollMoveDiv();
		} catch (e) {
			_EWA_DIALOGS[i] = null;
		}
	}
};

/**
 * 弹出窗体调用的命令类
 */
function EWA_Command() {
	this.CmdWindow = window;// 命令窗体
	this.Cmd = null;// 方法
	this.CmdArgus = new Array();// 参数
	this.IsRunAuto = false;
	this.Run = function() {
		if ((typeof this.Cmd).toLowerCase() == "function") {
			this.Cmd(this.CmdArgus);
		} else {
			var cmd = this.CmdWindow.eval(this.Cmd);
			if (cmd == null) {
				alert("EWA_Command.Cmd undefined! Pls check call method");
				return;
			} else {
				cmd(this.CmdArgus);
				cmd = null;
			}
		}
	};
	this.Dispose = function() {
		for (var i = 0; i < this.CmdArgus.length; i++) {
			this.CmdArgus[i] = null;
		}
		this.CmdArgus.length = 0;
		this.CmdArgus = null;
		this.CmdWindow = null;
		this.Cmd = null;
	}
}

var __Dialog = {
	D : EWA_UI_DialogClass, /* 对话框 */
	C : EWA_UI_PopWindowClass, /* 弹出对话框 */
	WND : new Object(), /* 实例化对象列表 */
	WNDCUR : null, /* 当前对话框 */
	CMD : EWA_Command
/* Command */
}

/**
 * 弹出对话框
 * 
 * @param {}
 *            objCnt 显示的对象
 * @param {}
 *            objFrom 激发事件的来源，如button
 * @param {}
 *            isBottom 是否在底部显示
 * @return {} 对话框本身
 */
__Dialog.Pop = function(objCnt, objFrom, isBottom) {
	var win = window;
	var dia = new EWA_UI_PopWindowClass(win, true);
	if (typeof _EWA_DialogWnd != 'undefined') {
		dia.CreateWindow = _EWA_DialogWnd._ParentWindow;
	}

	dia.Width = 172;
	dia.Height = 200;
	dia.ShadowColor = "";
	__Cal.WND = new EWA_CalendarClass();
	if (typeof _EWA_DialogWnd == 'undefined') {
		dia.CreateWindow = window;
	} else { // pop window created
		dia.CreateWindow = _EWA_DialogWnd._ParentWindow;
		_EWA_DialogWnd.OpendDialogs[_EWA_DialogWnd.OpendDialogs.length] = dia;
	}
	dia.Create();
	dia.SetHtml(objCnt);
	dia.MoveCenter();
	dia.Show(true);
	return dia;
}

/**
 * 获取最外层窗口
 */
__Dialog._GetTopWindow = function() {
	var ow = window;
	while (ow.parent != ow) {
		ow = ow.parent;
	}
	var s1 = ow.document.documentElement.innerHTML.toUpperCase();
	if (s1.indexOf('<FRAMESET') >= 0) {
		return window;
	} else {
		return ow;
	}
}
/**
 * 监控窗口变化，设置内容
 */
__Dialog._DialogMointer = function() {
	var wnd = EWA.UI.Dialog.WNDCUR;
	__Dialog.TimerInc++;
	if (wnd == null && __Dialog.TimerInc > 100) {
		return;
	}
	if (wnd == null) {
		return;
	}
	var oFrame = wnd.GetIframeWindow();
	if (oFrame == null) {
		window.clearInterval(wnd._TimerHandle);
		wnd = EWA.UI.Dialog.WNDCUR = null;
		return;
	}
	if (oFrame.location.href == wnd._Url) {
		return;
	}
	if (oFrame.document.readyState) { // ie
		if (oFrame.document.readyState == "complete") {
			window.clearInterval(wnd._TimerHandle);
			EWA.UI.Dialog._SetTitle(wnd);
		}
	} else { // firefox
		if (oFrame.document.body != null) {
			var s = oFrame.document.documentElement.innerHTML;
			s = s.toLowerCase();
			if (s.indexOf('</body>') > 0 || s.indexOf('</html>') > 0) {
				if (wnd._IncNoIe == 0) {
					wnd._IncNoIe = 1;
				} else {
					EWA.UI.Dialog._SetTitle(wnd);
				}
			}
		}
	}
}

/**
 * 设置弹出窗口的信息，标题、尺寸，并移动到屏幕中央
 * 
 * @param wnd
 *            窗体实例
 */
__Dialog._SetTitle = function(wnd) {
	if (wnd == null) {
		return;
	}
	// 获取内容Frame
	var oFrame = wnd.GetIframeWindow();

	// 在打开窗口的iframe设置Dialog的句柄
	oFrame._EWA_DialogWnd = wnd;
	wnd._Url = oFrame.location.href;

	// 修改窗口的标题
	wnd.SetCaption(oFrame.document.title);
	var buts = oFrame.document.getElementsByTagName("INPUT");

	// 窗体重新刷新时,用于 _DialogMointer 监控
	oFrame.document.body.onunload = function() {
		try {
			this._EWA_DialogWnd._Url = "";
		} catch (e) {
		}
	};

	// 设置页面焦点
	var focus = __Dialog._SetInputFocus(oFrame.document);
	if (!focus) {
		__Dialog._SetTextAreaFocus(oFrame.document);
	}
	if (!focus) {
		oFrame.document.body.focus();
	}

	// 设置关闭按钮事件
	__Dialog._SetClose(oFrame.document);

	// var w = oFrame.document.getElementById("EWA_FRAME_MAIN");
	// if (w != null) {// 自动调整宽度和高度
	// oFrame.document.body.style.margin = "0px";
	// oFrame.document.body.style.overflow = "hidden";
	// var wa, ha, w1;
	// if (w.tagName == 'TABLE') {
	// w1 = w;
	// } else {
	// for (var i = 0; i < w.childNodes.length; i++) {
	// w1 = w.childNodes[i];
	// if (w1.tagName != null) {
	// break;
	// }
	// }
	// }
	// wa = w1.offsetWidth + 0;
	// ha = w1.offsetHeight + 12;
	// var padl = $(w1).css('margin-left');
	// var padr = $(w1).css('margin-right');
	// var padt = $(w1).css('margin-top');
	// var padb = $(w1).css('margin-bottom');
	// // console.log(w1);
	// // console.log($(w1).css('margin'))
	// if (padl) {
	// wa += padl.replace('px', '') * 1;
	// }
	// if (padr) {
	// wa += padr.replace('px', '') * 1;
	// }
	// if (padt) {
	// ha += padt.replace('px', '') * 1;
	// }
	// if (padb) {
	// ha += padb.replace('px', '') * 1;
	// }
	// // console.log(wa, ha)
	// if (wa < 30 || ha < 10) {
	// wa = w.scrollWidth;
	// ha = w.scrollHeight;
	// }
	// if (!(wa < 30 || ha < 10)) {
	// wnd.MoveCenter();
	// // EWA.UI.Utils.AniExpandTo(wnd._Dialog.GetFrame(), wa + 25, ha +
	// // 56, 10);
	//
	// wnd.SetNewSize(wa, ha);
	// // EWA.UI.Utils.AniExpandCompleateFunction = function() {
	// // wnd.SetNewSize(wa, ha);
	// // }
	// }
	// }
	oFrame.document.body.style.margin = "0px";
	oFrame.document.body.style.overflow = "hidden";
	wnd._Dialog.ResizeByContent();
	// 移动到屏幕中央
	wnd.MoveCenter();

	// 自行窗体调用命令
	if (wnd._CallBack != null) {
		wnd._CallBack.Run();// 自动执行
	}
	oFrame = null;
}
__Dialog._SetClose = function(doc) {
	var buts = doc.getElementsByTagName("INPUT");
	for (var i = 0; i < buts.length; i = i + 1) {
		var type = buts[i].type.toLowerCase();
		if (type == "button" || type == "submit") {
			__Dialog._SetCloseFunction(buts[i]);
		}
	}
	buts = null;
	buts = doc.getElementsByTagName("BUTTON");
	for (var i = 0; i < buts.length; i++) {
		__Dialog._SetCloseFunction(buts[i]);
	}
}
__Dialog._SetCloseFunction = function(obj) {
	var v = obj.value.trim().toLowerCase();
	if (obj.tagName.toLowerCase() == 'button') {
		v = obj.innerHTML;
	}
	if (v.indexOf("关闭") >= 0 || v.indexOf("取消") >= 0 || v.indexOf("close") >= 0
			|| v.indexOf("cancel") >= 0) {
		if (obj.onclick != null && obj.onclick.toString().indexOf("EWA") >= 0) {
			return;
		}
		obj.onclick = function() {
			var d = this.ownerDocument;
			var w = d.parentWindow ? d.parentWindow : d.defaultView;
			w._EWA_DialogWnd.CloseWindow();
		};
	}
}
__Dialog._SetInputFocus = function(doc) {
	var buts = doc.getElementsByTagName("INPUT");
	for (var i = 0; i < buts.length; i = i + 1) {
		var but = buts[i];
		var type = but.type.toLowerCase();
		if (type == "text" || type == "password") {
			var func = but.parentNode.innerHTML;
			if (func != null && func.toString().indexOf('EWA.F.I.Date') >= 0) {
				// date
				func = null;
				continue;
			}
			try {
				but.focus();
				buts = null;
				but = null;
				return true;
			} catch (e) {
			}
		}
		but = null;
	}
	buts = null;
	return false;
}
__Dialog._SetTextAreaFocus = function(doc) {
	var textareas = doc.getElementsByTagName("TEXTAREA");
	for (var i = 0; i < textareas.length; i = i + 1) {
		try {
			textareas[i].focus();
			textareas = null;
			return true;
		} catch (e) {
		}
	}
	textareas = null;
	return false;
}
/**
 * 打开弹出窗口，当数据提交后刷新父窗口，并关闭当前窗口
 * 
 * @param frameUnid:
 *            调用的Frame编号
 * @param xmlName:
 *            配置文件名称
 * @param itemName:
 *            配置项名称
 * @param isCurrentWindow:
 *            是否为当前窗口
 * @param parameters:
 *            传递的参数
 * @param afterMsg
 *            完成后的消息
 * @param isAttatchParas
 *            是否附加 frameUnid 的参数
 */
__Dialog.OpenReloadClose = function(frameUnid, xmlName, itemName,
		isCurrentWindow, parameters, afterMsg, isAttatchParas) {
	var p = "RELOAD_PARENT,CLOSE_SELF";
	EWA.UI.Dialog.OpenFrame(frameUnid, xmlName, itemName, isCurrentWindow,
			parameters, p, afterMsg, isAttatchParas);
}

/**
 * 打开弹出窗口，当数据提交后刷新父窗口
 * 
 * @param frameUnid:
 *            调用Frame编号
 * @param xmlName:
 *            配置文件名称
 * @param itemName:
 *            配置项名称
 * @param isCurrentWindow:
 *            是否为当前窗口
 * @param parameters:
 *            传递的参数
 * @param afterMsg
 *            完成后的消息
 * @param isAttatchParas
 *            是否附加 frameUnid 的参数
 */
__Dialog.OpenReload = function(frameUnid, xmlName, itemName, isCurrentWindow,
		parameters, afterMsg, isAttatchParas) {
	var p = "RELOAD_PARENT";
	EWA.UI.Dialog.OpenFrame(frameUnid, xmlName, itemName, isCurrentWindow,
			parameters, p, afterMsg, isAttatchParas);
}

/**
 * 打开弹出窗口，当数据提交后刷新父窗口
 * 
 * @param frameUnid:
 *            调用Frame编号
 * @param xmlName:
 *            配置文件名称
 * @param itemName:
 *            配置项名称
 * @param isCurrentWindow:
 *            是否为当前窗口
 * @param parameters:
 *            传递的参数
 * @param afterMsg
 *            完成后的消息
 * @param isAttatchParas
 *            是否附加 frameUnid 的参数
 */
__Dialog.OpenReloadClear = function(frameUnid, xmlName, itemName,
		isCurrentWindow, parameters, afterMsg, isAttatchParas) {
	var p = "RELOAD_PARENT,CLEAR_SELF";
	EWA.UI.Dialog.OpenFrame(frameUnid, xmlName, itemName, isCurrentWindow,
			parameters, p, afterMsg, isAttatchParas);
}
/**
 * 打开弹出窗口，当数据提交后，执行 behavior 指定的 行为(如：刷新父窗口，关闭当前窗口...)
 * 
 * @param obj:
 *            调用的对象
 * @param xmlName:
 *            配置文件名称
 * @param itemName:
 *            配置项名称
 * @param isCurrentWindow:
 *            是否为当前窗口
 * @param parameters:
 *            传递的参数
 * @param behavior:
 *            数据刷新后的行为
 * @param afterMsg
 *            完成后的消息
 * @param isAttatchParas
 *            是否附加 frameUnid 的参数
 */
__Dialog.OpenFrame = function(frameUnid, xmlName, itemName, isCurrentWindow,
		parameters, behavior, afterMsg, isAttatchParas) {
	if (behavior == null) {
		behavior = "";
	}

	if (!__Dialog[frameUnid]) {
		__Dialog[frameUnid] = {};
	}
	__Dialog[frameUnid].AfterMsg = afterMsg == null ? "" : afterMsg;

	var paras = parameters;
	// 附加来源的参数
	if (isAttatchParas == 'yes' && EWA.F && EWA.F.FOS[frameUnid]
			&& EWA.F.FOS[frameUnid].Url) {
		var u1 = new EWA_UrlClass(EWA.F.FOS[frameUnid].Url);
		u1.RemoveEwa();

		// 传递的参数级别高于来源参数
		var u0 = new EWA_UrlClass("a1?" + paras);
		for ( var n in u0._Paras) {
			var v = u0.GetParameter(n);
			u1.AddParameter(n, v);
		}
		paras = u1.GetParas();
	}
	behavior = "EWA_P_BEHAVIOR=" + behavior + "&EWA_PARENT_FRAME=" + frameUnid;

	if (!paras) {
		paras = behavior;
	} else {
		paras = paras + "&" + behavior;
	}

	var href = EWA.UI.Dialog.GetUrl(xmlName, itemName, paras);
	var name = xmlName + "-" + itemName;
	EWA.UI.Dialog.OpenWindow(href, name, 100, 50, isCurrentWindow);
}
/**
 * 打开弹出窗口
 * 
 * @param url:
 *            页面地址
 * @param name:
 *            窗体名称
 * @param width:
 *            窗口宽度px
 * @param height:
 *            窗口高度
 * @param IsSelfWindow:
 *            是否为当前窗口
 * @param callBackCommand:
 *            窗口打开时候执行的命令对象 EWA_Command
 * @param returnBackCommand
 *            窗口关闭时候执行的命令对象 EWA_Command
 * @param isDisposeOnClose
 *            关闭时是否注销，如果不填就是是
 */
__Dialog.OpenWindow = function(url, name, width, height, IsSelfWindow,
		callBackCommand, returnBackCommand, isDisposeOnClose) {// 打开窗体

	// 关闭时是否注销,默认是是
	var isClose = isDisposeOnClose === undefined ? true : isDisposeOnClose;
	var topWindow;
	if (IsSelfWindow) {
		topWindow = window; // 当前窗体
	} else {
		topWindow = EWA.UI.Dialog._GetTopWindow();
	}
	var u1 = url;
	if (u1 != null && u1 != 'about:blank') {
		if (url.indexOf("?") > 0) {
			u1 += "&_r=" + Math.random();
		} else {
			u1 += "?_r=" + Math.random();
		}
	}

	u1 = u1.replace(/\|/ig, '%7c'); // for tomcat7.060+

	// topWindow.document.body.setAttribute('ewa_open_window',topWindow.document.body.style.overflow);
	// topWindow.document.body.style.overflow='hidden';

	var pid = "_EWA_UI_DIALOG_" + name; // 窗体的ID
	EWA.UI.Dialog.WND[pid] = null;
	EWA.UI.Dialog.WND[pid] = new EWA.UI.Dialog.C(topWindow, isClose);
	var wnd = EWA.UI.Dialog.WND[pid];
	wnd.Id = pid;
	wnd.DisposeOnClose = isDisposeOnClose;
	wnd.Create(width, height, name);

	if (u1 != null) {
		wnd.SetUrl(u1);
	}
	if (callBackCommand != null) {
		wnd.SetCallBack(callBackCommand);
	}
	if (returnBackCommand != null) {
		wnd.SetReturnBack(returnBackCommand);
	}

	// wnd.MoveCenter();
	// 时钟事件
	__Dialog.TimerInc = 0;
	wnd._TimerHandle = window.setInterval(EWA.UI.Dialog._DialogMointer, 155);
	wnd._IncNoIe = 0;
	// 设置当前的Dialog的句柄
	EWA.UI.Dialog.WNDCUR = null;
	EWA.UI.Dialog.WNDCUR = wnd;
	wnd = topWindow = null;
	return EWA.UI.Dialog.WND[pid];
}

/**
 * 获取配置执行的路径
 * 
 * @param xmlName
 *            配置文件名称
 * @param itemName
 *            配置项名称
 * @param parameters
 *            传递的参数
 */
__Dialog.GetUrl = function(xmlName, itemName, parameters) {
	var href = EWA.CP + "/EWA_STYLE/cgi-bin/?XMLNAME=" + xmlName.toURL()
			+ "&ITEMNAME=" + itemName.toURL() + "&" + parameters;
	return href;
}

/**
 * 弹开对话框
 * 
 * @type
 */
EWA["OW"] = {
	Dia : null, // 对话框对象
	PWin : null, // 父窗体
	Frame : null, // 父窗体当前的Frame
	Close : function() {
		if (EWA["OW"].Dia) {
			EWA["OW"].Dia.CloseWindow();
		} else {
			alert('Dialog not Load');
		}
	},
	Load : function() {
		EWA["OW"].Dia = window._EWA_DialogWnd; // 对话框对象
		EWA["OW"].PWin = EWA["OW"].Dia ? EWA["OW"].Dia._OpenerWindow : null; // 父窗体
		EWA["OW"].Frame = EWA["OW"].PWin ? EWA["OW"].PWin.EWA.F.FOS[EWA["OW"].PWin.EWA.F.CID]
				: null;
	}
}

EWA["UI"].Dialog = __Dialog; /* 公共弹出框 *//**
 * 新的弹窗框
 */
function EWA_UI_DiaNewClass() {
	this.Id = null;
	this.IS_AUTO_SIZE = true; //自动缩放
	this._GetIndex = function() {
		var w = window;
		if (w._EWA_UI_DIALOG_COVERINDEX == null) {
			w._EWA_UI_DIALOG_COVERINDEX = 10000000;
		}
		w._EWA_UI_DIALOG_COVERINDEX++;
		return w._EWA_UI_DIALOG_COVERINDEX;
	};
	this._GetCover = function() {
		return $X(this.Id + "_cover");
	};
	this.Create = function(width, height, title, content, isUrl, noHeader, callback) {
		this._isUrl = isUrl;
		this._width = width;
		this._height = height;
		this._title = title;
		this._content = content;
		this._noHeader = noHeader;
		var index = this._GetIndex();
		this.index = index;

		this.Id = ('_EWA_UI_DIA_' + Math.random()).replace('.', '');
		var ss = [ "<div id='" + this.Id + "' class='ewa-ui-dialog'>" ];
		// cover
		ss.push("<div id='" + this.Id + "_cover'  class='ewa-ui-dialog-cover' style='position: fixed;z-index: " + index
				+ ";'></div>");
		// box-start
		var mv = " EWA_WND_ID='" + this.Id + "'";
		var win = "window";
		var aa = win + ".EWA$UI$COMMON$Move.";
		mv += " onmousedown=\"" + aa + "OnMouseDown(this.parentNode.parentNode,event,true,true);\"";
		mv += " onmousemove=\"" + aa + "OnMouseMove(this.parentNode.parentNode,event,true,true);\"";
		mv += " onmouseup=\"" + aa + "OnMouseUp(this.parentNode.parentNode);\"";
		mv += " onmouseout=\"" + aa + "OnMouseOut(this.parentNode.parentNode);\"";
		// mv += " style='cursor:pointer' ";
		ss.push("<div id='" + this.Id + "_box' " + " class='ewa-ui-dialog-box' " + " style='position: fixed;z-index: "
				+ this._GetIndex() + ";'>");
		ss.push("<div style='position:relative;'>");
		// title
		if (!noHeader) {
			ss.push("<div  id='" + this.Id + "_title'  class='ewa-ui-dialog-title'" + mv + " style=''>"
					+ "<span style='margin-left: 5px;'></span><a href='javascript:class_" + this.Id
					+ ".Close();' class='fa'" + " style=''>&#xf00d</a></div>");
		} else {
			ss.push("<div id='" + this.Id + "_title' class='ewa-ui-dialog-title-noheader'" + " style=''>"
					+ "<a href='javascript:class_" + this.Id + ".Close();' class='fa'"
					+ " style='text-decoration:none;padding:2px 2px 3px 3px;display:block'>&#xf00d</a></div>");
		}
		// content
		ss.push("<div  id='" + this.Id + "_content' class='ewa-ui-dialog-content'"
				+ " style='width: 100%;overflow: auto;'></div>");
		ss.push("</div>");
		// box-end-div
		ss.push("</div>");
		// end div
		ss.push("</div>");
		$('body').append(ss.join(''));

		// 关闭按钮颜色
		$(".ewa-ui-dialog-title a.fa").css({
			"color" : "#aaa"
		}).hover(function() {
			$(this).css({
				"color" : "orangered"
			});
		}, function() {
			$(this).css({
				"color" : "#aaa"
			});
		});
		var obj = $('#' + this.Id + "_box");

		this.SetSize(width, height);

		this.SetTitle(title);
		this.ShowCover(true);
		this.MoveCenter();
		window['class_' + this.Id] = this;

		this.SetContent(content, isUrl, callback);

		return this;
	};
	this.SetSize = function(width, height) {
		var obj = $('#' + this.Id + "_content");
		var box_w1 = width ? width : 400;
		var box_h1 = height ? height : 200;

		obj.css('width', box_w1);
		obj.css('height', box_h1);

		var title_height = 0;
		if ($('#' + this.Id + '_title span').length > 0)
			title_height = $('#' + this.Id + '_title').height();

		// $('#' + this.Id + '_box').css('width', box_w1);
		// $('#' + this.Id + '_box').css('height', box_h1 + title_height);
	};
	this.SetTitle = function(title) {
		if (title)
			$('#' + this.Id + '_title span').html(title);
	};
	/**
	 * 获取标题所在div;
	 */
	this.getTitleContainer = function() {
		var obj = $('#' + this.Id + '_title');
		if (obj.length == 0) {
			return null;
		} else {
			return obj[0];
		}
	};
	this.SetContent = function(content, isUrl, callback) {
		var obj_content = $('#' + this.Id + '_content');
		if (isUrl) {
			content = '<iframe style="width:100%;height:100%" frameborder="0" src="' + content + '"></iframe>';
			obj_content.css('overflow', 'hidden');
		} else {
			// 直接显示html
			$(this._GetCover()).css('background-image', 'none');
		}
		obj_content.html(content);

		if (isUrl) {
			var c = this;
			setTimeout(function() {
				c._ChkIframeLoaded(callback);
			}, 222);
		} else {// 直接显示html的方式，调用回调
			if(callback){
				callback(this);
			}
		}
	};
	/**
	 * 添加对象
	 * 
	 * @param objElement
	 *            html对象
	 * @param isAppend
	 *            是否为追加模式
	 * 
	 */
	this.SetObject = function(objElement, isAppend) {
		var obj_content = $('#' + this.Id + '_content');
		$(this._GetCover()).css('background-image', 'none');
		if (!isAppend) {
			obj_content.html("");
		}
		obj_content.append(objElement);
	};
	this._ChkIframeLoaded = function(callback) {
		var w = $('#' + this.Id + '_content iframe');
		if (w.length == 0) {
			return;
		}
		w = w[0];
		try {// not same domain
			if (w.contentWindow && w.contentWindow.document && w.contentWindow.document.readyState == 'complete'
					&& w.contentWindow.$) {
				try {
					this._IframeLoaded(w.contentWindow, callback);
				} catch (e1) {
					this._IframeLoaded(w.contentWindow, callback);
				}
				return;
			}
			var c = this;
			setTimeout(function() {
				c._ChkIframeLoaded(callback)
			}, 222);
		} catch (e) {
			console.log(e);
		}
	};
	this._IframeLoaded = function(w, callback) {
		w._EWA_DialogWnd = this;
		var title = w.document.title;
		this.SetTitle(title);

		var u1 = new EWA_UrlClass(w.location.href);
		if (this.IS_AUTO_SIZE) {
			this.AutoSize();
		}
		this.MoveCenter();
		var c = this;
		var objs = w.$.find('button,input');
		for (var i = 0; i < objs.length; i++) {
			var obj = objs[i];
			var isclosebutton = false;
			if (obj.id && obj.id.toLowerCase().indexOf('close') >= 0) {
				isclosebutton = true;
			} else {
				var txt = obj.value || obj.innerHTML;
				if (txt && (txt.indexOf('关闭') >= 0 || txt.indexOf('取消') >= 0)) {
					isclosebutton = true;
				}
			}
			if (isclosebutton) {
				obj.onclick = function() {
					c.Close();
				};
			}
		}
		$(this._GetCover()).css('background-image', 'none');

		if (callback) {
			callback(this);
		}
	};
	this.AutoSize = function() {
		var content = $(this.getContent());

		if (!this._isUrl) {
			var w, h;
			var objEWA = content.find('#Test1');
			if (objEWA.length > 0) {
				w = objEWA.outerWidth();
				h = objEWA.outerHeight();
			} else {
				h = cnt[0].scrollHeight;
				w = cnt[0].scrollWidth;
			}
			this.SetSize(w, h);
			this.MoveCenter();
		} else {
			var w = content.find('iframe');
			w = w[0].contentWindow;
			if (w.$) {
				var target = w.$('#Test1');
				if (target.length > 0) {
					var width = target.outerWidth();
					var height = target.outerHeight();
					this.SetSize(width, height);
					this.MoveCenter();
				}
			}
		}
	};
	/**
	 * 获取content的div
	 */
	this.getContent = function() {
		var cnt = $('#' + this.Id + '_content');
		return cnt[0];
	};
	/**
	 * 获取对话框的对象（最外层）
	 */
	this.getMain = function() {
		var cnt = $('#' + this.Id + '_box');
		return cnt[0];
	};
	this.ShowCover = function(isShow) {
		var obj_cover = $('#' + this.Id + '_cover');
		if (isShow) {
			var window_width = $(window).width();
			var window_height = $(window).height();

			obj_cover.css('width', window_width);
			obj_cover.css('height', window_height);
			obj_cover.show();
		} else {
			obj_cover.hide();
		}
	};
	this.MoveCenter = function() {
		var window_width = $(window).width();
		var window_height = $(window).height();

		var obj = $('#' + this.Id + "_box");
		var box_w1 = obj.width();
		var box_h1 = obj.height();

		var mid_left = (window_width - box_w1) / 2;
		var mid_top = (window_height - box_h1) / 2;

		if (mid_left < 0) {
			mid_left = 0;
		}
		if (mid_top < 0) {
			mid_top = 0;
		}
		this.Move(mid_left, mid_top);
	};
	this.Move = function(x, y) {
		var obj = $('#' + this.Id + "_box");
		obj.css('top', y);
		obj.css('left', x);
	};
	this.Close = function() {
		if (this.IsCloseAsHidden) { // 是否为关闭为隐藏
			$('#' + this.Id).hide();
		} else {
			this.Dispose();
		}

	};
	this.Dispose = function() { // 销毁对象
		$('#' + this.Id).remove();
		window['class_' + this.Id] = null;
		delete window['class_' + this.Id];
	};
	this.Show = function() {
		if (this.IsCloseAsHidden) { // 是否为关闭为隐藏
			$('#' + this.Id).show();
		} else {
			alert('请设置参数 IsCloseAsHidden=true');
		}
	};
}

$Dialog = function(url, title, width, height, noHeader, callback) {
	var is_auto_size = !(width && height);
	var dia = new EWA_UI_DiaNewClass();
	dia.IS_AUTO_SIZE = is_auto_size; // 自动缩放窗口
	dia.Create(width, height, title, url, true, noHeader, callback);
	dia.MoveCenter();
	return dia;
}

$DialogHtml = function(html, title, width, height, noHeader, callback) {
	var dia = new EWA_UI_DiaNewClass();
	dia.Create(width, height, title, html, false, noHeader);
	dia.MoveCenter();
	if (callback) {
		callback(dia, id);
	}
	return dia;
}
/**
 * 安装方式打开Dialog
 * 
 * @param url
 *            加载的网址
 * @param tilte
 *            标题
 * @param width
 *            宽度
 * @param height
 *            高度
 * @param noheader
 *            不显示表头
 * @return dialog
 */
$DialogInstall = function(url, title, width, height, noHeader, callback) {
	var id = EWA_Utils.tempId('dialogInstall');
	var s1 = "<div id='" + id + "'></div>";
	var dia = $DialogHtml(s1, '', width, height, noHeader);
	$Install(url, id, function() {
		var is_auto_size = !(width && height);
		if (noHeader || title) {
			if (is_auto_size) {
				dia.AutoSize();
			}
			if (callback) {
				callback(dia, id);
			}
			return;
		}
		// 设置标题
		var divContent = dia.getContent();
		var ewaTables = $(divContent).find(".EWA_TABLE");
		if (ewaTables.length == 0 || !ewaTables[0].id) {
			if (is_auto_size) {
				dia.AutoSize();
			}
			if (callback) {
				callback(dia, id);
			}
			return;
		}

		// 获取EWA的标题
		var id = ewaTables[0].id;
		var id0 = id.replace('EWA_FRAME_', '').replace('EWA_LF_', '');
		if (!EWA || !EWA.F || !EWA.F.FOS || !EWA.F.FOS[id0]) {
			if (is_auto_size) {
				dia.AutoSize();
			}
			if (callback) {
				callback(dia, id);
			}
			return;
		}
		var title_ewa = EWA.F.FOS[id0].Title;

		if (id.startsWith('EWA_LF_')) {
			var inc = 0;
			// 等待脚本创建完毕 .ewa_lf_func
			var t1 = setInterval(function() {
				inc++;
				if (inc > 90) {// 900毫秒没有执行
					// 没有发现 ewa_lf_func
					window.clearInterval(t1);
					if (is_auto_size) {
						dia.AutoSize();
					}
					if (callback) {
						callback(dia, id);
					}
					return;
				}
				var reshow = $(divContent).find(".ewa_lf_func");
				if (reshow.length == 0) {
					return;
				}
				window.clearInterval(t1);
				var obj = dia.getTitleContainer();
				if (obj) {
					var css = {
						"background-color" : "transparent",
						"display" : "block",
						"float" : "left",
						"font-size" : "14px"
					};
					reshow.css(css);
					var cap = reshow.find('.ewa_lf_func_caption');
					cap.css('color', '#08c');
					cap.text(cap.text().replace('[', '').replace(']', '').trim());
					$(obj).find('span:eq(0)').remove();
					$(obj).append(reshow).css('border-bottom', '1px solid #eee');
				}
				if (is_auto_size) {
					dia.AutoSize();
				}
				if (callback) {
					callback(dia, id);
				}
			}, 10);
		} else {
			if (title_ewa) {
				dia.SetTitle(title_ewa);
			}
			if (is_auto_size) {
				dia.AutoSize();
			}
			if (callback) {
				callback(dia, id);
			}
		}
	});
	return dia;
};;
function EWA_UI_CalendarYearClass() {
	this.Create = function(pid, startYear, startMonth, monthLength,byMonth) {
		console.log(startYear, startMonth, monthLength)
		this.classId = ("CY" + Math.random()).replace('.', '');
		EWA.UI.CalendarYear = EWA.UI.CalendarYear || {};
		EWA.UI.CalendarYear[this.classId] = this;

		$($X(pid)).append('<div class="ewa-ui-calendar-year" id="' + this.classId + '"></div>');
		var p = $('#' + this.classId);
		var aa = new EWA_CalendarClass();
		// 开始日期
		var today = new Date();
		if (startYear && startMonth) {
			today = new Date(startYear, startMonth-1, 1);
		}
		var m = today.getMonth();
		var start_m=m;
		if(!byMonth){
			// 计算出当前月的季度开始月份
			var jd = Math.round(m / 3 - 0.5);
			start_m = jd * 3;
		}
		var year = today.getFullYear();
		if (!monthLength || monthLength <= 0) {
			monthLength = 12;
		}
		for (var i = 1; i <= monthLength; i++) {
			if (EWA.LANG == 'enus') {
				var m1 = (start_m + 1) + "/" + year;
				var m2
				if(_EWA_G_SETTINGS.DATE == "dd/MM/yyyy"){
					m2="01/" + (start_m + 1) + "/" + year;
				}else{
					m2 = (start_m + 1) + "/01/" + year;
				}
				aa.SetDate(m2);
			} else {
				var m1 = year + "-" + (start_m + 1);
				aa.SetDate(m1 + '-01');
			}
			var tb = aa.CreateCalendar();
			var tbid = this.classId + '_' + year + "_" + start_m;
			tb.id = tbid;
			
			var ym=year + (start_m<10?"0":"") + start_m
			
			tb.setAttribute('yearmonth',ym)
			p.append(tb);
			$(tb.rows[3]).remove();
			$(tb.rows[0].cells[1]).remove();
			// 点击月份
			var s = "<a href='javascript:EWA.UI.CalendarYear." + this.classId + ".chooeseMonth(\"" + tbid + "\",event)'>" + m1
				+ "</a>"
			$(tb.rows[0].cells[0]).html(s);
			// 点击星期
			$(tb).find('th').attr('onclick', "EWA.UI.CalendarYear." + this.classId + ".chooeseWeek('" + tbid + "',this, event)");
			start_m++;
			if (start_m == 12) {
				start_m = 0;
				year++;
			}
			$(tb).find('th:eq(0)').addClass('rq-sun'); // 周日
			$(tb).find('th:eq(6)').addClass('rq-sat'); // 周六

		}
		p.append('<div style="clear:both"></div>');
		p.find('.ewa-ui-days td').attr('onclick', "EWA.UI.CalendarYear." + this.classId + ".Click(this,event)");
		_EWA_CALENDAR_ITEM = aa;
	};
	this.chooeseWeek = function(id, obj, evt) {
		var cellIndex = obj.cellIndex;
		var tb = $("#" + id).find('.ewa-ui-days')[0];
		var is_chooese = $(obj).attr('chooese');
		var rqs = []; // 选中或未选中的日期
		for (var i = 1; i < tb.rows.length; i++) {
			var td = tb.rows[i].cells[cellIndex];
			if (td.childNodes.length == 0) {
				continue;
			}
			if (!is_chooese) {
				$(td).addClass('ewa-ui-calendar-year-chooese').attr('chooese', 1);
			} else {
				$(td).removeClass('ewa-ui-calendar-year-chooese').attr('chooese', null);
			}
			rqs.push($(td).find('div:eq(0)').attr('title'));
		}
		if (is_chooese) {
			$(obj).attr('chooese', null);
		} else {
			$(obj).attr('chooese', 1);
		}
		if (this.ClickEvent) {
			this.ClickEvent(rqs, !is_chooese, evt);
		}
	};
	this.chooeseMonth = function(id, evt) {
		var tb = $('#' + id);
		var isChecked = tb.attr('all1');
		var rqs = [];
		if (isChecked) {
			tb.attr('all1', null);
			$('#' + id + " .ewa-ui-days .ewa-ui-calendar-year-chooese").each(function() {
				$(this).removeClass('ewa-ui-calendar-year-chooese').attr('chooese', null);
				rqs.push($(this).find('div:eq(0)').attr('title'));
			});
			tb.find('th').attr('chooese', null);
		} else {
			tb.attr('all1', 'yes');
			$('#' + id + " .ewa-ui-days tr:gt(0) td div[title]").parent().each(function() {
				$(this).addClass('ewa-ui-calendar-year-chooese').attr('chooese', 1);
				rqs.push($(this).find('div:eq(0)').attr('title'));
			});
			tb.find('th').attr('chooese', 1);
		}
		if (this.ClickEvent) {
			this.ClickEvent(rqs, !isChecked, evt);
		}
	};
	this.SetChooeses = function(jsonArr, filedName) {
		for ( var n in jsonArr) {
			var d = jsonArr[n];
			var rq = d[filedName];
			if (!rq) {
				continue;
			}
			rq = rq.split(' ')[0];
			$('#' + this.classId + " .ewa-ui-days td div[title='" + rq + "']").parent().addClass('ewa-ui-calendar-year-chooese')
				.attr('chooese', 1);
		}
		// 如果日期全选，则设置为全选的标志
		$('#' + this.classId + " .ewa-ui-date").each(function() {
			if ($(this).find('.ewa-ui-calendar-year-chooese').length == $(this).find('td div[title]').length) {
				$(this).attr('all1', 'yes');
				$(this).find('th').attr('chooese', 'yes');
			}
		});
	};
	/**
	 * 获取选中的日期
	 */
	this.GetChooeses = function(pobj) {
		var ss = [];
		var p = pobj ? $(pobj) : $('#' + this.classId + ' .ewa-ui-days');
		p.find('.ewa-ui-calendar-year-chooese').each(function() {
			ss.push($(this).find('div:eq(0)').attr('title'));
		});
		return ss;
	};
	/**
	 * 获取未选中的日期
	 */
	this.GetUnChooeses = function(pobj) {
		var ss = [];
		var p = pobj ? $(pobj) : $('#' + this.classId + ' .ewa-ui-days');
		p.find('td').each(function() {
			if (!$(this).attr('chooese')) {
				var rq = $(this).find('div:eq(0)').attr("title");
				if (rq)
					ss.push(rq);
			}
		});
		return ss;
	}
	this.Click = function(obj, evt) {
		if (obj.innerHTML.trim() == '') {
			// 没日期
			return;
		}
		var isChecked;
		if (!$(obj).attr('chooese')) {
			$(obj).addClass('ewa-ui-calendar-year-chooese').attr('chooese', 1);
			isChecked = true;
		} else {
			$(obj).removeClass('ewa-ui-calendar-year-chooese').attr('chooese', null);
			isChecked = false;
		}
		if (this.ClickEvent) {
			var rqs = [ $(obj).find('div:eq(0)').attr('title') ];
			this.ClickEvent(rqs, isChecked, evt)
		}
	};
	this.ClickEvent = function(rqs, isChecked, evt) {
		// overwrite this;
		console.log('overwrite xxx.ClickEvent(rqs,   isChecked, evt)');
	};
};
function EWA_UI_CalendarYearGroupClass() {
	/**
	 * 禁止选择 小于 theDay 的天
	 */
	this.denysBefore = function(theDay) {
		var dt = new EWA_DateClass(theDay);
		for (var i = 1; i < 1500; i++) {
			var dayStr = dt.AddDays(-1);
			dayStr = dayStr.split(' ')[0];
			var td = this.denyDay(dayStr);
			if (td.length == 0) {
				break;
			}
		}
	};
	/**
	 * 禁止选择 大于 theDay 的天
	 */
	this.denysAfter = function(theDay) {
		var dt = new EWA_DateClass(theDay);
		for (var i = 1; i < 1500; i++) {
			var dayStr = dt.AddDays(1);
			dayStr = dayStr.split(' ')[0];
			var td = this.denyDay(dayStr);
			if (td.length == 0) {
				break;
			}
		}
	};
	this.denyDay = function(rq) {
		var p = $('#' + this.classId);
		var tds = p.find(".ewa-ui-days td");
		var td = tds.find("div[title='" + rq + "']").parent();
		td.addClass('ewa-ui-calendar-year-deny').attr('deny', 1);
		return td;
	};
	this.unDenyDay = function(rq) {
		var p = $('#' + this.classId);
		var tds = p.find(".ewa-ui-days td");
		var td = tds.find("div[title='" + rq + "']").parent();
		td.removeClass('ewa-ui-calendar-year-deny').attr('deny', null);
		return td;
	};
	this.CUR_GROUP_NAME = null; // 对象分组名称
	/**
	 * 设置新的分组名称
	 */
	this.setGroupName = function(groupName) {
		if (groupName) {
			this.CUR_GROUP_NAME = "CYG_" + groupName.replace(/\:|\?|\.|\=|\;|\(|\)|\-/ig, '');
			this.CUR_GROUP_NAME_O = groupName;
		} else {
			this.CUR_GROUP_NAME = null;
			this.CUR_GROUP_NAME_O = null;
		}
	};
	this.Create = function(pid, startYear, startMonth, monthLength, byMonth, denyStartDate, denyEndDate) {
		//console.log(pid, startYear, startMonth, monthLength, byMonth, denyStartDate)

		this.classId = ("CY" + Math.random()).replace('.', '');
		EWA.UI.CalendarYear = EWA.UI.CalendarYear || {};
		EWA.UI.CalendarYear[this.classId] = this;

		$($X(pid)).append('<div class="ewa-ui-calendar-year" id="' + this.classId + '"></div>');
		var p = $('#' + this.classId);

		// 开始日期
		var today = new Date();
		if (startYear && startMonth) {
			today = new Date(startYear, startMonth - 1, 1);
		}
		var m = today.getMonth();
		var start_m = m;
		if (!byMonth) {
			// 计算出当前月的季度开始月份
			var jd = Math.round(m / 3 - 0.5);
			start_m = jd * 3;
		}
		var year = today.getFullYear();
		if (!monthLength || monthLength <= 0) {
			monthLength = 12;
		}

		var aa = new EWA_CalendarClass();
		for (var i = 1; i <= monthLength; i++) {
			var month = start_m + 1; //显示的月份和Date的月份差1
			if (EWA.LANG == 'enus') {
				var m1 = month + "/" + year;
				var m2
				if (_EWA_G_SETTINGS.DATE == "dd/MM/yyyy") {
					m2 = "01/" + month + "/" + year;
				} else {
					m2 = month + "/01/" + year;
				}
				aa.SetDate(m2);
			} else {
				var m1 = year + "-" + (start_m + 1);
				aa.SetDate(m1 + '-01');
			}
			var tb = aa.CreateCalendar();

			var ym = year + (month < 10 ? "0" : "") + month
			var tbid = this.classId + '_' + ym
			tb.id = tbid;
			tb.setAttribute('yearmonth', ym)
			p.append(tb);
			$(tb.rows[3]).remove();
			$(tb.rows[0].cells[1]).remove();

			// 点击月份
			var s = "<a href='javascript:EWA.UI.CalendarYear." + this.classId + ".chooeseMonth(\"" + tbid + "\",event)'>" + m1
				+ "</a>"
			$(tb.rows[0].cells[0]).html(s);
			// 点击星期
			$(tb).find('th').attr('onclick', "EWA.UI.CalendarYear." + this.classId + ".chooeseWeek('" + tbid + "',this, event)");
			start_m++;
			if (start_m == 12) {
				start_m = 0;
				year++;
			}
			$(tb).find('th:eq(0)').addClass('rq-sun'); // 周日
			$(tb).find('th:eq(6)').addClass('rq-sat'); // 周六

		}
		p.append('<div style="clear:both"></div>');
		p.find('.ewa-ui-days td').attr('onclick', "EWA.UI.CalendarYear." + this.classId + ".Click(this,event)");
		_EWA_CALENDAR_ITEM = aa;


		if (denyStartDate) {
			this.denysBefore(denyStartDate);
		}
		if (denyEndDate) {
			this.denysAfter(denyEndDate);
		}
	};

	this.getChooeseName = function() {
		return this.CUR_GROUP_NAME ? this.CUR_GROUP_NAME : "chooese";
	};
	/**
	 * 添加或删除标记
	 */
	this.addOrRemoveMark = function(td, isRemove, rq) {
		var chooeseName = this.getChooeseName();
		var o = $(td);
		if (!isRemove) {
			if (o.find('.' + chooeseName).length == 0) {
				o.append("<nobr class='ewa-ui-calendar-year-item " + chooeseName + "'></nobr>");
				o.attr(chooeseName, 1);
				if (this.markEvent) {
					this.markEvent(td, rq);
				}
			}
		} else {
			o.find("." + chooeseName).remove();
			o.attr(chooeseName, null)
			if (this.unMarkEvent) {
				this.unMarkEvent(td, rq);
			}
		}

		// 删除上次的 Nxx class
		if (o.attr('_last_item_count_')) {
			o.removeClass(o.attr('_last_item_count_'));
		}

		var count = o.find('.ewa-ui-calendar-year-item').length;
		if (count > 0) {
			o.addClass('ewa-ui-calendar-year-chooese');
			var css_count = count < 100 ? "N" + count : "NP"; //最多显示99，否则用 ...代替
			o.addClass("N " + css_count).attr('_last_item_count_', css_count);
		} else {
			o.removeClass('ewa-ui-calendar-year-chooese').removeClass('N');
		}
	};
	this.chooeseWeek = function(id, obj, evt) {
		var tb = $("#" + id).find('.ewa-ui-days')[0];
		var chooeseName = this.getChooeseName();
		var rqs = []; // 选中或未选中的日期

		var cellIndex = obj.cellIndex;
		var is_chooese = true;
		var is_have_active = false;
		// 判读本周几的所有日期都选择了
		for (var i = 1; i < tb.rows.length; i++) {
			var td = tb.rows[i].cells[cellIndex];
			if (td.childNodes.length == 0) {
				continue;
			}
			if (!$(td).attr('deny')) {
				is_have_active = true;
			}
			if (!$(td).attr(chooeseName)) {
				is_chooese = false;
			}
			if (is_have_active && !is_chooese) {
				break;
			}
		}

		if (!is_have_active) {
			$Tip('没有可选的日期');
			return;
		}

		if (this.ClickBeforeEvent) {
			if (!this.ClickBeforeEvent(id, obj, evt, 'WEEK')) {
				return;
			}
		}

		for (var i = 1; i < tb.rows.length; i++) {
			var td = tb.rows[i].cells[cellIndex];
			if (td.childNodes.length == 0) {
				continue;
			}
			//禁止的日期
			if ($(td).attr('deny')) {
				continue;
			}
			var rq = $(td).find('div:eq(0)').attr('title');
			rqs.push(rq);
			this.addOrRemoveMark(td, is_chooese, rq);
		}
		if (is_chooese) {
			$(obj).attr(chooeseName, null);
		} else {
			$(obj).attr(chooeseName, 1);
		}
		if (this.ClickEvent) {
			this.ClickEvent(rqs, !is_chooese, evt);
		}
	};
	/**
	 * 按月全选/全不选
	 */
	this.chooeseMonth = function(id, evt) {
		var tb = $('#' + id + " .ewa-ui-days")[0];
		var chooeseName = this.getChooeseName();
		var is_all_chooesed = true;
		var is_have_active = false;
		// 判读本月的所有日期都选择了
		for (var i = 1; i < tb.rows.length; i++) {
			var row = tb.rows[i];
			for (var m = 0; m < row.cells.length; m++) {
				var td = row.cells[m];
				if (td.childNodes.length == 0) {
					continue;
				}
				if (!is_have_active && !$(td).attr('deny')) {
					is_have_active = true; //找到可用的
				}
				var tag = $(td).attr(chooeseName);
				if (!tag) {
					is_all_chooesed = false; //没有全部选择
				}
			}
			if (!is_all_chooesed && is_have_active) {
				break;
			}
		}
		if (!is_have_active) {
			$Tip("没有可选的日期");
			return;
		}

		if (this.ClickBeforeEvent) {
			if (!this.ClickBeforeEvent(id, null, evt, 'MONTH')) {
				return;
			}
		}

		var rqs = [];
		for (var i = 1; i < tb.rows.length; i++) {
			var row = tb.rows[i];
			for (var m = 0; m < row.cells.length; m++) {
				var td = row.cells[m];
				if (td.childNodes.length == 0) {
					continue;
				}
				//禁止的日期
				if ($(td).attr('deny')) {
					continue;
				}
				var rq = $(td).find('div:eq(0)').attr('title');
				rqs.push(rq);
				this.addOrRemoveMark(td, is_all_chooesed, rq);
			}
		}

		if (this.ClickEvent) {
			this.ClickEvent(rqs, !is_all_chooesed, evt);
		}
	};
	/**
	 * 设置显示在日历上
	 * 
	 * @param jsonArr
	 *            对象数组
	 * @param filedName
	 *            日期的字段名称
	 * @param groupFieldName
	 *            分组字段名称
	 * @param func
	 *            附加执行的方法,三个参数 td(日期所在的TD), rq(日期) ,d(JSON对象)
	 */
	this.SetChooeses = function(jsonArr, filedName, groupFieldName, func) {
		this._RQ_MAP = null;

		var p = $('#' + this.classId);
		var tds = p.find(".ewa-ui-days td");
		for (var n in jsonArr) {
			var d = jsonArr[n]; // JSON对象
			var rq = d[filedName]; // 日期
			if (!rq) {
				continue;
			}
			if (groupFieldName) {
				this.setGroupName(d[groupFieldName]);
			}

			rq = rq.split(' ')[0];
			var td = this.findTdByRq(rq);
			if (td && td.length > 0) {
				this.addOrRemoveMark(td, false, rq);
				if (func) { // 传递进去的方法
					func(td[0], rq, d);
				}
			} else {
				console.log('无效的日期' + rq);
			}
		}

		this._RQ_MAP = null;
		// 如果日期全选，则设置为全选的标志
		p.find(".ewa-ui-date").each(function() {
			if ($(this).find('.ewa-ui-calendar-year-chooese').length == $(this).find('td div[title]').length) {
				$(this).attr('all1', 'yes');
				$(this).find('th').attr('chooese', 'yes');
			}
		});
	};
	this.findTdByRq = function(rq) {
		if (!rq) {
			return null;
		}
		if (!this._RQ_MAP) { //缓存已经存在的日期
			this._RQ_MAP = {};
		} else {
			if (this._RQ_MAP[rq]) {
				return this._RQ_MAP[rq];
			}
		}

		var rq1 = rq.replace(/-/ig, '');
		var yearmonth = rq1.substring(0, 6);
		var tb = $('#' + this.classId + " table[yearmonth='" + yearmonth + "']");
		if (tb.length == 0) {
			this._RQ_MAP[rq] = null;
			return null;
		}
		this._RQ_MAP[rq] = tb.find("div[date='" + rq1 + "']").parent();
		return this._RQ_MAP[rq];
	};
	/**
	 * 获取选中的日期
	 */
	this.GetChooeses = function(pobj) {
		var ss = [];
		var p = pobj ? $(pobj) : $('#' + this.classId + ' .ewa-ui-days');
		p.find('.ewa-ui-calendar-year-chooese').each(function() {
			ss.push($(this).find('div:eq(0)').attr('title'));
		});
		return ss;
	};
	/**
	 * 获取未选中的日期
	 */
	this.GetUnChooeses = function(pobj) {
		var ss = [];
		var p = pobj ? $(pobj) : $('#' + this.classId + ' .ewa-ui-days');
		p.find('td').each(function() {
			if (!$(this).attr('chooese')) {
				var rq = $(this).find('div:eq(0)').attr("title");
				if (rq)
					ss.push(rq);
			}
		});
		return ss;
	};
	this.Click = function(obj, evt) {
		if ($(obj).attr('deny') || obj.innerHTML.trim() == '') {
			// 没日期
			return;
		}
		if (this.ClickBeforeEvent) {
			if (!this.ClickBeforeEvent(obj.id, obj, evt, 'DAY')) {
				return;
			}
		}
		var isChecked;
		var rq = $(obj).find('div:eq(0)').attr('title');
		var chooeseName = this.getChooeseName();

		var isRemove = $(obj).attr(chooeseName);

		this.addOrRemoveMark(obj, isRemove, rq);

		if (this.ClickEvent) {
			var rqs = [rq];
			this.ClickEvent(rqs, !isRemove, evt)
		}
	};
	/**
	 * 点击前处理，如果返回true,则继续执行选择，否则终止执行选择
	 * 
	 * @param id
	 *            来源ID
	 * @param obj
	 *            来源对象
	 * @param evt
	 *            event事件
	 * @param type
	 *            模式 DAY/WEEK/MONTH
	 * @returns true/false
	 */
	this.ClickBeforeEvent = function(id, obj, evt, type) {
		console.log('overwrite xxx.ClickBeforeEvent(id, obj, evt, type)');
		return true;
	};
	/**
	 * 点击后执行
	 * 
	 * @param rqs
	 *            日期数组
	 * @param isChecked
	 *            是否选中
	 * @param evt
	 *            event
	 */
	this.ClickEvent = function(rqs, isChecked, evt) {
		// overwrite this;
		console.log('overwrite xxx.ClickEvent(rqs,   isChecked, evt)');
	};
}function EWA_CalendarClass() {
	this._Weeks = _EWA_G_SETTINGS["WEEKS"].split(',');
	this._Days = new Array(31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31);
	this._Months = _EWA_G_SETTINGS["MONTHS"].split(',');
	this._CurDate = new Date();
	this._DaysTable = null;
	this._SelectMonth = null;
	this._SelectYear = null;
	this._SelectHour = null;
	this._SelectMinute = null;
	this.CreateWindow = window;
	this.IsShowTime = false;
	this.Object = null;
	this.Dialog = null;
	//
	this.ChangeDate = function() {
		var y = this._SelectYear.value;
		var m = this._SelectMonth.value;
		// var d = this._DaysTable.getAttribute("EMP_CURRENT_DAY");

		this._SetNewDate(y, m, 1);
		this._WriteDays(false);
	};
	this._SetNewDate = function(y, m, d) {
		if (!y) {
			var y = this._SelectYear.value;
			var m = this._SelectMonth.value;
			var d = this._DaysTable.getAttribute("EMP_CURRENT_DAY");
			var lastDay;
			if ((((y - 2008) % 4 == 0 && y % 100 != 0) || (y % 400 == 0))
					&& m == 1) {
				lastDay = 29
			} else {
				lastDay = this._Days[m];
			}
			if (d > lastDay) {
				d = lastDay;
			}
		}
		this._CurDate = new Date(y, m, d);
		if (this.IsShowTime) {
			var hh = this._SelectHour.value;
			var mm = this._SelectMinute.value;

			this._CurDate.setHours(hh);
			this._CurDate.setMinutes(mm);
		}
	};
	this.SetDate = function(dateString) {
		var dd = dateString.split(" ");
		var d1 = dd[0].split("-");
		if (d1.length < 3) {
			d1 = dd[0].split("/");
		}
		if (d1.length < 3) {
			d1 = dd[0].split(".");
		}
		if (d1.length == 3) {
			d1[0] = parseInt(d1[0]);
			if (d1[1].substring(0, 1) == "0") {
				d1[1] = d1[1].substring(1);
			}
			if (d1[2].substring(0, 1) == "0") {
				d1[2] = d1[2].substring(1);
			}
			d1[1] = parseInt(d1[1]);
			d1[2] = parseInt(d1[2]);
			if (!(d1[0] + "" == "NaN" || d1[1] + "" == "NaN" || d1[2] + "" == "NaN")) {
				if (EWA.LANG.toUpperCase() == "ENUS") {// mm/dd/yyyy
					if (_EWA_G_SETTINGS.DATE == "dd/MM/yyyy") {
						this._CurDate = new Date(d1[2], d1[1] - 1, d1[0]);
					} else {
						this._CurDate = new Date(d1[2], d1[0] - 1, d1[1]);
					}
				} else {
					this._CurDate = new Date(d1[0], d1[1] - 1, d1[2]);
				}
				if (dd.length > 1) {
					d1 = dd[1].split(':');
					this._CurDate.setHours(d1[0]);
					if (d1.length > 1) {
						this._CurDate.setMinutes(d1[1]);
					}
					if (d1.length > 2) {
						this._CurDate.setSeconds(d1[2].split('.')[0]);
					}
				}
			}
			var day = this._CurDate.getDate();
			if (this._DaysTable) {
				this._DaysTable.setAttribute("EMP_CURRENT_DAY", day);
			}
		}
	};

	this._CreateTime = function() {
		var d1 = this._CurDate;
		var td = this.CreateWindow.document.createElement("div");

		var selHor = this.CreateWindow.document.createElement("select");
		var selTime = this.CreateWindow.document.createElement("select");
		var span1 = this.CreateWindow.document.createElement("span");
		if (EWA.LANG.toLowerCase() == 'enus') {
			span1.innerHTML = 'Time ';
		}else{
			span1.innerHTML = '时间 ';
		}
		var span2 = this.CreateWindow.document.createElement("span");
		span2.innerHTML = ":";
		for (var i = 0; i < 24; i++) {
			var time_val = i < 10 ? ("0" + i) : (i + "");
			selHor.options[selHor.options.length] = new Option(time_val,
					time_val);
		}
		selHor.value = ((100 + d1.getHours()) + "").substring(1);
		td.appendChild(span1);
		td.appendChild(selHor);

		td.appendChild(span2);
		td.appendChild(selTime);
		var span3 = this.CreateWindow.document.createElement("span");
		span3.innerHTML = '&nbsp;';

		var a = this.CreateWindow.document.createElement("span");
		a.style.cursor = 'pointer';
		a.style.color = 'blue';
		a.setAttribute('IS_ALL', 0);
		a.onclick = function() {
			var o = selTime;
			o.options.length = 0;
			if (this.getAttribute('IS_ALL') == 1) {
				for (var i = 0; i < 12; i++) {
					var vv = ((100 + i * 5) + "").substring(1);
					o.options[o.options.length] = new Option(vv, vv);
				}
				var mm = d1.getMinutes();
				mm = mm % 5 == 0 ? mm : parseInt(mm / 5) * 5;
				selTime.value = ((100 + mm) + "").substring(1);
				this.setAttribute('IS_ALL', 0);
				this.innerHTML = '全部';
			} else {
				for (var i = 0; i < 60; i++) {
					var vv = ((100 + i) + "").substring(1);
					o.options[o.options.length] = new Option(vv, vv);
				}
				var mm = d1.getMinutes();
				selTime.value = ((100 + mm) + "").substring(1);
				this.setAttribute('IS_ALL', 1);
				this.innerHTML = '每5分钟';
			}
		}
		td.appendChild(span3);
		td.appendChild(a);
		return td;
	}
	this.CreateTime = function() {
		var ss = [];
		var s1 = "<table border=0 class='ewa-ui-date-picker' style='border:1px solid #aaa' bgcolor='#E1E1E1' onselectstart='return false'>";
		ss.push(s1);

		// time
		ss.push("<tr><td><nobr></nobr></td></tr>");
		// today;
		ss.push("</table>");

		var o = this.CreateWindow.document.createElement("DIV");
		o.innerHTML = ss.join("");

		var tr = o.childNodes[0].rows[0];
		var td = tr.cells[0].childNodes[0];
		var obj = this._CreateTime();

		while (obj.childNodes.length > 0) {
			var oz = obj.childNodes[0];
			td.appendChild(oz);
		}

		var a = td.getElementsByTagName('span')[3];
		a.setAttribute('IS_ALL', 1);
		a.click();
		a.style.display = 'none';
		var opt = this.CreateWindow.document.createElement("input");
		opt.type = 'button';

		var ctTxt;
		if (EWA.LANG.toLowerCase() == 'enus') {
			opt.value = "OK";
			ctTxt = "Clear";
		} else {
			opt.value = '确定';
			ctTxt = "清除";
		}
		opt.onclick = function() {
			var win = EWA.B.IE ? this.ownerDocument.parentWindow
					: this.ownerDocument.defaultView;
			var objs = this.parentNode.getElementsByTagName('select');
			var v1 = win._EWA_CALENDAR_TIME_ITEM.Object.value;
			var v2 = objs[0].value + ':' + objs[1].value;
			win._EWA_CALENDAR_TIME_ITEM.Object.value = v2;
			win._EWA_CALENDAR_TIME_ITEM.Dialog.Show(false);
			if (v1 != v2) {
				$(win._EWA_CALENDAR_TIME_ITEM.Object).trigger("keyup");
				$(win._EWA_CALENDAR_TIME_ITEM.Object).trigger("blur");
			}
		}
		td.appendChild(opt);

		var o2 = "<a href='javascript:void(0)' style='margin:0 5px;color:#08c;font-size:12px;'>"
				+ ctTxt + "</a>";
		$(td).append(o2);
		$(td).find("a").click(
				function() {
					var win = EWA.B.IE ? this.ownerDocument.parentWindow
							: this.ownerDocument.defaultView;
					var v = win._EWA_CALENDAR_TIME_ITEM.Object.value;
					win._EWA_CALENDAR_TIME_ITEM.Object.value = "";
					win._EWA_CALENDAR_TIME_ITEM.Dialog.Show(false);
					if (v != '') {
						$(win._EWA_CALENDAR_TIME_ITEM.Object).trigger("keyup");
						$(win._EWA_CALENDAR_TIME_ITEM.Object).trigger("blur");
					}
				});
		var o3 = "<b class='fa fa-close' style='color:#666;font-size:12px;'></b>";
		$(td).append(o3);
		$(td).find("b").click(
				function() {
					var win = EWA.B.IE ? this.ownerDocument.parentWindow
							: this.ownerDocument.defaultView;
					win._EWA_CALENDAR_TIME_ITEM.Dialog.Show(false);
				});
		return o.childNodes[0];
	}
	this.CreateCalendar = function(haveTime) {
		this.IsShowTime = haveTime;

		var ss = [];
		var s1 = "<table border=0 class='ewa-ui-date' onselectstart='return false'>";
		ss.push(s1);

		// month year
		ss.push("<tr>");
		ss.push("<td height=28>" + this._CreateMonth() + "</td>");
		ss.push("<td align=right>" + this._CreateYear() + "</td>");
		ss.push("</tr>");

		// days;
		ss.push("<tr><td colspan=2>" + this._CreateDaysTable() + "</td></tr>");
		// time
		ss.push("<tr style='display:none'><td colspan=2></td></tr>");

		// today;
		ss.push("<tr><td colspan=2>" + this._CreateToDay() + "</td></tr>");
		ss.push("</table>");

		var o = this.CreateWindow.document.createElement("DIV");
		o.innerHTML = ss.join("");
		this._DaysTable = o.childNodes[0].rows[1].cells[0].childNodes[0];
		var o1 = o.getElementsByTagName("select");
		this._SelectMonth = o1[0];
		this._SelectYear = o1[1];
		o1 = null;

		this._WriteDays();
		if (haveTime) {
			var d1 = this._CurDate;
			var tr = o.childNodes[0].rows[2];
			tr.style.display = '';
			var td = tr.cells[0];

			var obj = this._CreateTime();
			while (obj.childNodes.length > 0) {
				var oz = obj.childNodes[0];
				td.appendChild(oz);

			}
			var a = td.getElementsByTagName('span')[3];
			a.click();

			this._SelectHour = td.getElementsByTagName('select')[0];
			this._SelectMinute = td.getElementsByTagName('select')[1];
		}

		return o.childNodes[0];
	};
	this._CreateToDay = function() {
		var opt = {};
		if (EWA.LANG.toLowerCase() == 'enus') {
			opt["today"] = "Today";
			opt["empty_title"] = "Empty";
			opt["empty"] = "Empty";
			opt["close"] = "Close"
		} else {
			opt["today"] = "设置为今天";
			opt["empty_title"] = "清空日期";
			opt["empty"] = "空";
			opt["close"] = "关闭"
		}
		var clickEvt = "if(_EWA_CALENDAR_ITEM.Object.onkeyup!=null)_EWA_CALENDAR_ITEM.Object.onkeyup();"
				+ "if(_EWA_CALENDAR_ITEM.Object.onblur!=null)_EWA_CALENDAR_ITEM.Object.onblur();";
		var today = "<div class='ewa-ui-date-today-day' title='" + opt["today"]
				+ "'"
				+ " onclick='_EWA_CALENDAR_ITEM.Object.value=this.innerHTML;"
				+ clickEvt + "_EWA_CALENDAR_ITEM.Dialog.Show(false);'>"
				+ this.GetDate(new Date()) + "</div>";
		var s1 = "<table border=0 class='ewa-ui-date-today' width=100%>";
		s1 += "<tr>";
		s1 += "<td class='ewa-ui-date-today-day' onclick='_EWA_CALENDAR_ITEM.Object.value=$(this).next().text();"
				+ clickEvt
				+ "_EWA_CALENDAR_ITEM.Dialog.Show(false);'>"
				+ _EWA_G_SETTINGS["Today"] + "</td>";
		s1 += "<td>" + today + "</td>";
		s1 += "<td><div class='ewa-ui-date-today-clear' title='"
				+ opt["empty_title"] + "'"
				+ " onclick='_EWA_CALENDAR_ITEM.Object.value=\"\";" + clickEvt
				+ "_EWA_CALENDAR_ITEM.Dialog.Show(false);'>" + opt["empty"]
				+ "</div></td>";
		s1 += "<td align=right><div class='ewa-ui-date-close' title='"
				+ opt["close"]
				+ "' onclick='_EWA_CALENDAR_ITEM.Hidden()'><b>X</b></div></td>";
		s1 += "</tr></table>";
		return s1;
	};

	/**
	 * 标记当前设定的日期
	 */
	this.MarkDay = function() {
		var day = this._DaysTable.getAttribute("EMP_CURRENT_DAY") * 1;
		for (var i = 1; i < this._DaysTable.rows.length; i += 1) {
			var r = this._DaysTable.rows[i];
			for (var m = 0; m < r.cells.length; m += 1) {
				var td = r.cells[m];
				if (td.childNodes.length > 0
						&& GetInnerText(td.childNodes[0]) * 1 == day) {
					this.MarkSelected(td);
				} else {
					this.MarkUnSelected(td);
				}
			}
		}
	};
	this.MarkSelected = function(obj) {
		$(obj).addClass('ewa-ui-date-selected');
		// obj.style.backgroundColor = "blue";
	};
	this.MarkUnSelected = function(obj) {
		$(obj).removeClass('ewa-ui-date-selected');
		// obj.style.backgroundColor = "";
	};
	this.MarkBlur = function(obj) {
		$(obj).addClass('ewa-ui-date-blur');
		// obj.style.border = "1px solid #cdcdcd";
	};
	this.MarkUnBlur = function(obj) {
		$(obj).removeClass('ewa-ui-date-blur');
		// obj.style.border = "1px solid #f1f1f1";
	};
	this._CreateMonth = function() {
		var oTable = this._CreatePervNext();
		var s1 = "<select onchange='_EWA_CALENDAR_ITEM.ChangeDate();'>";
		var s2;
		var curMonth = this._CurDate.getMonth();
		for (var i = 0; i < this._Months.length; i += 1) {
			if (i == curMonth) {
				s1 += "<option value='" + i + "' selected>" + this._Months[i]
						+ "</option>";
			} else {
				s1 += "<option value='" + i + "'>" + this._Months[i]
						+ "</option>";
			}
		}
		s1 += "</select>";
		oTable = oTable.replace("[$]", s1);
		return oTable;
	};
	this._CreateYear = function() {
		var y1 = 1900;
		var y2 = 2050;
		var curYear = this._CurDate.getFullYear();
		var oTable = this._CreatePervNext();
		var ss = [];
		ss[0] = "<select onchange='_EWA_CALENDAR_ITEM.ChangeDate();'>";
		var s2;
		for (var i = y1; i <= y2; i += 1) {
			if (i == curYear) {
				ss
						.push("<option value='" + i + "' selected>" + i
								+ "</option>");
			} else {
				ss.push("<option value='" + i + "'>" + i + "</option>");
			}
		}
		ss.push("</select>");
		oTable = oTable.replace("[$]", ss.join(""));
		return oTable;
	};
	this._CreatePervNext = function() {
		var js = "var o=this.parentNode;var o1=o.nextSibling.childNodes[0];if(o1.selectedIndex>0){o1.value=o1.value*1-1;o1.onchange();}o=o1=null";
		var js1 = "var o=this.parentNode;var o1=o.previousSibling.childNodes[0];if(o1.options.length-1>o1.selectedIndex){o1.value=o1.value*1+1;o1.onchange();}o=o1=null";
		var sPrev = "<div class='ewa-ui-date-prev'  onclick='" + js
				+ "'><b class='fa fa-caret-left'></b></div>";
		var sNext = "<div class='ewa-ui-date-next' onclick='" + js1
				+ "'><b class='fa fa-caret-right'></div>";
		var s1 = "<table cellpadding=0 cellspacing=0 border=0>";
		s1 += "<tr><td>" + sPrev + "</td><td>[$]</td><td>" + sNext
				+ "</td></tr></table>";
		return s1;
	};
	/**
	 * 创建日历
	 * 
	 * @param isMark
	 *            是否标记日期
	 */
	this._WriteDays = function(isMark) {
		if (this.__LAST__WriteDaysDate != this._CurDate) {
			// 当前日期不重新创建
			this.__LAST__WriteDaysDate = this._CurDate;

			var mmm = this._CreateDays();
			var day = this._CurDate.getDate();

			var month = this._CurDate.getMonth();
			var year = this._CurDate.getFullYear();

			this._SelectMonth.value = month;
			this._SelectYear.value = year;

			var modth = (month + 1);
			if (modth < 10) {
				modth = "0" + modth;
			}
			var title = year + "-" + modth + "-DD";
			// 新增20170414 guolei
			var rq = this._CurDate.getFullYear() + "" + modth;
			if (EWA.LANG != null && EWA.LANG.toUpperCase() == 'ENUS') {
				if (_EWA_G_SETTINGS.DATE == "dd/MM/yyyy") {
					title = "DD/" + modth + "/" + year;
				} else {
					title = modth + "/DD/" + year;
				}
			}
			var otd;
			for (var i = 1; i < this._DaysTable.rows.length; i += 1) {
				var r = this._DaysTable.rows[i];
				for (var m = 0; m < r.cells.length; m += 1) {
					otd = r.cells[m];
					if (mmm[i] == null || mmm[i][m] == null) {
						otd.innerHTML = "";
					} else {
						var rq1 = rq + mmm[i][m]; // 新增20170414 guolei
						otd.innerHTML = "<div date='" + rq1 + "' title='"
								+ title.replace("DD", mmm[i][m]) + "'>"
								+ mmm[i][m] + "</div>";
					}
					this.MarkUnSelected(otd);
					otd = null;
				}
				if ($(r).text() == '') {
					$(r).hide();
				} else {
					$(r).show();
				}
			}
		}
		if (isMark) {
			this.MarkDay();
		}
	};
	this._CreateDaysTable = function() {
		var ss = [];
		ss[0] = "<table class='ewa-ui-days' align ='center' border=0 cellpadding=1 cellspacing=1 EMP_CURRENT_DAY='"
				+ this._CurDate.getDate() + "'>";
		for (var i = 0; i < 7; i += 1) {
			ss.push("<tr>");
			for (var m = 0; m < 7; m += 1) {

				if (i == 0) {
					ss.push("<th>" + this._Weeks[m] + "</th>");
				} else {
					ss
							.push("<td onmouseover='if(this.innerHTML.length>0)_EWA_CALENDAR_ITEM.MarkBlur(this);'");
					ss
							.push(" onmouseout='if(this.innerHTML.length>0)_EWA_CALENDAR_ITEM.MarkUnBlur(this);'");
					ss
							.push(" onclick='_EWA_CALENDAR_ITEM.Clicked(this);'></td>");
				}
			}
			ss.push("</tr>");
		}
		ss.push("</table>")
		return ss.join("");
	};
	this.Clear = function() {
		this.Object.value = "";
		this.Hidden();
	};
	this.Hidden = function(notRunOnBlur) {
		if (this.Object.onblur != null && !notRunOnBlur) {
			this.Object.onblur();
		}
		this.Object = null;
		this.Dialog.Show(false);
	};
	this.Clicked = function(obj) {
		if (obj.innerHTML.length > 0) {
			this._DaysTable.setAttribute("EMP_CURRENT_DAY",
					obj.childNodes[0].innerHTML);
			this._SetNewDate();
			this.MarkDay();
			this.Object.value = this.GetDate();
			if (this.Object.onkeyup != null) {
				this.Object.onkeyup();
			}
			if (this.Object.onblur != null) {
				this.Object.onblur();
			}
			if (this.Object.onchange != null) {
				// 显示定义了 onchange 属性
				this.Object.onchange();
			} else {
				// 不管有没有，都触发 change 事件
				$(this.Object).trigger('change');
			}
			this.Hidden(true);
		}
	}
	this.GetDate = function(d1) {
		var d2 = _EWA_G_SETTINGS["DATE"];
		if (d1 == null) {
			d1 = this._CurDate;
		}
		var y = d1.getFullYear();
		var m = d1.getMonth() + 1;
		var d = d1.getDate();
		if (m < 10) {
			m = "0" + m;
		}
		if (d < 10) {
			d = "0" + d;
		}
		var s1 = d2.replace('yyyy', y);
		s1 = s1.replace('MM', m);
		s1 = s1.replace('dd', d);

		if (this.IsShowTime) {
			var hh = d1.getHours();
			var mm = d1.getMinutes();
			hh = hh < 10 ? "0" + hh : hh;
			mm = mm < 10 ? "0" + mm : mm;
			s1 += " " + hh + ":" + mm;
		}
		return s1;
	};
	this._CreateDays = function() {
		var baseDate = new Date(this._CurDate.getFullYear(), this._CurDate
				.getMonth(), 1);
		var week = baseDate.getDay();
		var a = 1;
		var arrayDays = new Array();
		arrayDays[0] = this._Weeks;
		var m = 1;
		var maxDays = this._getCurMonthDays();
		for (var i = 0; i < 49; i += 1) {
			if (i == 0 || week == 7) {
				arrayDays[m] = new Array();
				m += 1;
			}
			if (week == 7) {
				week = 0;
			}
			if (a <= maxDays) {
				arrayDays[m - 1][week] = (a < 10 ? "0" + a : a + "");
			} else {
				break;
			}
			a += 1;
			week += 1;
		}
		return arrayDays;
	};
	this._getCurMonthDays = function() {
		if ((((this._CurDate.getFullYear() - 2008) % 4 == 0 && (this._CurDate
				.getFullYear() - 400) % 100 != 0) || (this._CurDate
				.getFullYear() - 400) % 400 == 0)
				&& this._CurDate.getMonth() == 1) {
			return 29;
		} else {
			return this._Days[this._CurDate.getMonth()];
		}
	};
}

var __Cal = {
	C : EWA_CalendarClass,
	WND : null, // 实例化的日期
	WND_PARENT : null, // 打开日期的对象
	WND_DIA : null
// 实例化的窗体
}

__Cal.Pop = function(obj, havTime) {
	var popId = 'WND_PARENT/Pop/' + havTime;
	if (!__Cal[popId]) {
		__Cal[popId] = {};
	}
	var ins = __Cal[popId];
	ins.OBJ = obj;
	if (ins.WND == null) {
		// console.log('create instance');

		var o = ins.WND_DIA = new EWA_UI_DialogClass();
		o.Width = 172;
		o.Height = 200;
		o.ShadowColor = "";
		ins.WND = new EWA_CalendarClass();
		if (typeof _EWA_DialogWnd == 'undefined') {
			o.CreateWindow = window;
		} else { // pop window created
			o.CreateWindow = _EWA_DialogWnd._ParentWindow;
			_EWA_DialogWnd.OpendDialogs[_EWA_DialogWnd.OpendDialogs.length] = o;
		}
		o.CreateWindow._EWA_CALENDAR_ITEM = ins.WND;
		o.Create();
		ins.WND.CreateWindow = o.CreateWindow;
		ins.WND.SetDate(obj.value);
		var o1 = ins.WND.CreateCalendar(havTime);
		o.SetObject(o1);
		ins.WND.Dialog = o;
		// 自动设定高度和宽度
		$(o.GetFrameContent()).css('width','').css('height','');
		o = o1 = null;
	}
	// console.log('show instance');
	ins.WND.SetDate(obj.value);
	ins.WND._WriteDays(true);
	ins.WND.Dialog.SetZIndex(10);
	ins.WND.Object = obj;
	ins.WND_DIA.MoveBottom(obj);
	ins.WND_DIA.Show(true);
}
__Cal.PopTime = function(obj) {
	var popId = 'WND_PARENT/PopTime/';
	if (!__Cal[popId]) {
		__Cal[popId] = {};
	}
	var ins = __Cal[popId];
	ins.OBJ = obj;
	if (ins.WND == null) {
		var o = ins.WND_DIA = new EWA_UI_DialogClass();
		o.Width = 180;
		o.Height = 20;
		o.ShadowColor = "";
		ins.WND = new EWA_CalendarClass();
		if (typeof _EWA_DialogWnd == 'undefined') {
			o.CreateWindow = window;
		} else { // pop window created
			o.CreateWindow = _EWA_DialogWnd._ParentWindow;
			_EWA_DialogWnd.OpendDialogs[_EWA_DialogWnd.OpendDialogs.length] = o;
		}
		o.CreateWindow._EWA_CALENDAR_TIME_ITEM = ins.WND;
		o.Create();
		ins.WND.CreateWindow = o.CreateWindow;
		ins.WND.SetDate(obj.value);

		var o1 = ins.WND.CreateTime();
		o.SetObject(o1);
		ins.WND.Dialog = o;
		
		// 自动设定高度和宽度
		$(o.GetFrameContent()).css('width','').css('height','');
		
		o = o1 = null;
	}
	ins.WND.CreateWindow._EWA_CALENDAR_TIME_ITEM.Object = obj;
	ins.WND.CreateWindow._EWA_CALENDAR_TIME_ITEM.Dialog = ins.WND_DIA;
	ins.WND.SetDate(obj.value);
	ins.WND.Dialog.SetZIndex(10);
	ins.WND.Object = obj;
	ins.WND_DIA.MoveBottom(obj);
	ins.WND_DIA.Show(true);
}

EWA["UI"].Calendar = __Cal /* 日历 *//**
 * 提示消息框
 */
function EWA_UI_MsgClass(msg, isSelfWindow) {
	this._IsSelfWindow = isSelfWindow;
	this._Dialog = null;
	this._Msg = msg;
	this._Buttons = [];
	this._Caption = null;
	this._Icon = "MSG_ICON" // MSG_ICON,ERR_ICON,QUS_ICON;

	this.SetIcon = function(icon) {
		this._Icon = icon;
	}
	this.SetCaption = function(txtCap) {
		this._Caption = txtCap;
	}
	this.AddButton = function(text, event) {
		this._Buttons.push({
			Text : text,
			Event : event
		});
	}
	this.AddButtons = function(buts) {
		if (buts == null)
			return;
		for (var i = 0; i < buts.length; i++) {
			this._Buttons.push(buts[i]);
		}
	}
	this._Init = function() {
		var id = Math.random();
		this._Dialog = __Dialog.OpenWindow('about:blank', id, 500, 200,
				this._IsSelfWindow);
		this._Dialog._FromMsgClass = this;
		this._Dialog.SetHtml(this._CreateHtml());

		this._Dialog.SetCaption(this._Caption);
		var divCnt = this._Dialog._Dialog.GetFrameContent()
				.getElementsByTagName('table')[0];
		var divFrame = this._Dialog._Dialog.GetFrame();

		divFrame.style.width = divCnt.clientWidth + 'px';
		divFrame.style.height = divCnt.clientHeight + 'px';
	}
	this._CreateHtml = function() {
		var s = [];
		s.push("<table border=0 class='MSG_INFO'>");
		s.push("<tr><td rowspan=2 style='width:130px;' align='center'>");
		s.push("<div class='" + this._Icon + "'>&nbsp;</div></td>");
		s.push("<td class='MSG_TEXT'>");
		s.push(this._Msg);
		s.push("</td></tr>");
		s.push("<tr><td class='MSG_BUTS'>");

		var cjs = this._CloseWindowJs();
		if (this._Buttons.length > 0) {
			s.push("<hr><table><tr>")
			for (var i = 0; i < this._Buttons.length; i++) {
				var but = this._Buttons[i];
				s.push("<td>");
				var s1 = "<button _ewa_msg_default='" + (but.Default ? 1 : 0)
						+ "'  type='button' _ewa_dialog_='" + this._Dialog.Id
						+ "' ";

				if (but.Event && typeof but.Event == 'function') {
					s1 += " onclick=\"_EWA_UI_WINDOW_LIST[this.getAttribute('_ewa_dialog_')]._FromMsgClass.fire("
							+ i + ")\">" + but.Text + "</button>";
				} else {
					var evt = (!but.Event) ? cjs : but.Event + ";" + cjs;
					s1 += " onclick=\"" + evt + "\">" + but.Text + "</button>";
				}
				s.push(s1);
				s.push("</td>");
			}
			s.push("</tr></table>");
		}
		s.push("</td></tr></table>");
		return s.join('');
	};
	this.fire = function(buttonIndex) {
		var but = this._Buttons[buttonIndex];
		if (but && but.Event) {
			try {
				but.Event(this);
			} catch (e) {
				console.log(e);
			}
		}
		this.Hidden();
	};
	this._CloseWindowJs = function() {
		return "var a=this.getAttribute('_ewa_dialog_'); _EWA_UI_WINDOW_LIST[a].CloseWindow();";
	};
	this.Show = function(isShow, isInApp) {
		if (this._Dialog == null) {
			this._Init();
		}
		// this._Dialog.Show(isShow);

		if (isShow) {
			var buts = this._Dialog._ParentWindow.document
					.getElementsByTagName('button');

			if (isInApp) { // 在app中touch 事件会造成错误点击
				// 位置通过css定义
				var thisButs = [];
				// 隐含按钮
				for (var i = 0; i < buts.length; i++) {
					var but = $(buts[i]);
					if (but.attr('_ewa_dialog_') == this._Dialog.Id) {
						but.prop('disabled', true);
						thisButs.push(but);

					}
				}
				// 显示按钮
				setTimeout(function() {
					for ( var n in thisButs) {
						thisButs[n].prop('disabled', false);
					}
				}, 435);
			} else {
				this._Dialog.ResizeByContent();
				this._Dialog.MoveCenter();

				for (var i = 0; i < buts.length; i++) {
					if (buts[i].getAttribute('_ewa_msg_default') == 1
							&& buts[i].getAttribute('_ewa_dialog_') == this._Dialog.Id) {
						buts[i].focus();
						break;
					}
				}
			}

		}
	}
	this.Hidden = function() {
		this.Show(false);
		this._Dialog.CloseWindow();
	}
}

EWA.UI.Msg = {
	IS_IN_APP : false, // 是否在App中，外部定义，在app中touch 事件会造成错误点击
	C : EWA_UI_MsgClass,
	/**
	 * 显示消息
	 * 
	 * @param {}
	 *            txtMsg 消息内容
	 * @param {}
	 *            buttons 按键
	 * @param {}
	 *            txtCaption 标题
	 * @param {}
	 *            txtIcon 图标，css名称
	 * @return {}
	 */
	Show : function(txtMsg, buttons, txtCaption, txtIcon) {
		if (txtMsg.indexOf("(") > 0 && txtMsg.indexOf(")") > 0) {
			try {
				txtMsg = eval(txtMsg);
			} catch (e) {
				console.log(txtMsg);
			}
		}
		var msg = new EWA_UI_MsgClass(txtMsg);
		msg.SetCaption(txtCaption)
		msg.AddButtons(buttons);
		msg.SetIcon(txtIcon)

		// 在app中touch 事件会造成错误点击
		msg.Show(true, EWA.UI.Msg.IS_IN_APP);
		return msg;
	},
	ShowInfo : function(txtMsg, buttons, txtCaption) {
		__EWA_MSG__ = EWA.UI.Msg.Show(txtMsg, buttons, txtCaption, "MSG_ICON");
		$(__EWA_MSG__._Dialog._Dialog.GetFrame()).addClass('ewa-msg-info');
		return __EWA_MSG__;
	},
	ShowError : function(txtMsg, txtCaption) {
		var buts = [];
		buts[0] = {
			Text : _EWA_INFO_MSG['BUT.OK'],
			Event : null,
			Default : true
		};
		__EWA_MSG__ = EWA.UI.Msg.Show(txtMsg, buts, txtCaption, "ERR_ICON");
		$(__EWA_MSG__._Dialog._Dialog.GetFrame()).addClass('ewa-msg-err');
		return __EWA_MSG__;
	},
	Alter : function(txtMsg, txtCaption) {
		var buts = [];
		buts[0] = {
			Text : _EWA_INFO_MSG['BUT.OK'],
			Event : null,
			Default : true
		};
		__EWA_MSG__ = EWA.UI.Msg.Show(txtMsg, buts, txtCaption, "MSG_ICON");
		$(__EWA_MSG__._Dialog._Dialog.GetFrame()).addClass('ewa-msg-alert');
		return __EWA_MSG__;
	},
	Alert : function(txtMsg, txtCaption) {
		var buts = [];
		buts[0] = {
			Text : _EWA_INFO_MSG['BUT.OK'],
			Event : null,
			Default : true
		};
		__EWA_MSG__ = EWA.UI.Msg.Show(txtMsg, buts, txtCaption, "MSG_ICON");
		$(__EWA_MSG__._Dialog._Dialog.GetFrame()).addClass('ewa-msg-alert');
		return __EWA_MSG__;
	},
	Confirm : function(txtMsg, txtCaption, yesFunction, noFunction) {
		var buts = [];
		buts[0] = {
			Text : _EWA_INFO_MSG['BUT.YES'],
			Event : yesFunction
		};
		buts[1] = {
			Text : _EWA_INFO_MSG['BUT.NO'],
			Event : noFunction,
			Default : true
		};
		__EWA_MSG__ = EWA.UI.Msg.Show(txtMsg, buts, txtCaption, "QUS_ICON");
		$(__EWA_MSG__._Dialog._Dialog.GetFrame()).addClass('ewa-msg-confirm');
		return __EWA_MSG__;
	},
	_Tip : function(msg, cssBox, cssText, interval) {
		var obj = document.createElement('table');
		document.body.appendChild(obj);
		$(obj).css(cssBox);
		var td = obj.insertRow(-1).insertCell(-1);
		$(td).css(cssText);
		if (interval && interval instanceof Function) {
			td.innerHTML = '<i class="fa fa-refresh fa-spin"></i> ' + msg;
			// 定时检查function是否返回true
			var timer = setInterval(function() {
				if (interval()) {
					window.clearInterval(timer);

					$(obj).animate({
						opacity : 0
					}, 200, function() {
						$(obj).remove();
					});
				}
			}, 300);
		} else {
			td.innerHTML = msg;
			if (!interval || isNaN(interval)) {
				interval = 1500;// 1.5s
			}

			setTimeout(function() {
				$(obj).animate({
					opacity : 0
				}, 200, function() {
					$(obj).remove();
				});
			}, interval);
		}
	},
	Tip : function(msg, interval) {
		var z = window._EWA_UI_DIALOG_COVERINDEX ? window._EWA_UI_DIALOG_COVERINDEX + 10
				: 1000000;
		var css_box = {
			width : 300,
			height : 80,
			padding : 10,
			'background-color' : 'rgba(10,20,30,0.7)',
			position : 'fixed',
			top : '50%',
			left : '50%',
			'margin-left' : -150,
			'margin-top' : -40 - 10 - 10,
			'border-radius' : 10,
			'z-index' : z,
			'color' : '#fff'
		};
		if (EWA.B.IE && EWA.B.VERSION * 1 < 9) {
			css_box['filter'] = "progid:DXImageTransform.Microsoft.Gradient(GradientType=0,StartColorStr='#77000000',EndColorStr='#77000000')";
		}
		var css_text = {
			'text-align' : 'center',
			'font-size' : 16,
			'line-height' : 1.5
		};
		EWA.UI.Msg._Tip(msg, css_box, css_text, interval);
	},
	TipBR : function(msg, interval) {// 在页面底部显示消息
		var z = window._EWA_UI_DIALOG_COVERINDEX ? window._EWA_UI_DIALOG_COVERINDEX + 10
				: 1000000;
		var css_box = {
			height : 20,
			padding : 2,
			'background-color' : 'rgba(222,222,0,0.7)',
			position : 'fixed',
			bottom : 5,
			right : 5,
			'border-radius' : 1,
			'z-index' : z,
			'color' : '#111'
		};
		if (EWA.B.IE && EWA.B.VERSION * 1 < 9) {
			css_box['filter'] = "progid:DXImageTransform.Microsoft.Gradient(GradientType=0,StartColorStr='#66000000',EndColorStr='#66000000')";
		}
		var css_text = {
			'text-align' : 'center',
			'font-size' : 12,
			'line-height' : 1.5
		};
		EWA.UI.Msg._Tip(msg, css_box, css_text, interval);
	},
	TipBL : function(msg, interval) {// 在页面底部显示消息
		var z = window._EWA_UI_DIALOG_COVERINDEX ? window._EWA_UI_DIALOG_COVERINDEX + 10
				: 1000000;
		var css_box = {
			height : 20,
			padding : 2,
			'background-color' : 'rgba(222,222,0,0.7)',
			position : 'fixed',
			bottom : 5,
			left : 5,
			'border-radius' : 1,
			'z-index' : z,
			'color' : '#111'
		};
		if (EWA.B.IE && EWA.B.VERSION * 1 < 9) {
			css_box['filter'] = "progid:DXImageTransform.Microsoft.Gradient(GradientType=0,StartColorStr='#66000000',EndColorStr='#66000000')";
		}
		var css_text = {
			'text-align' : 'center',
			'font-size' : 12,
			'line-height' : 1.5
		};
		EWA.UI.Msg._Tip(msg, css_box, css_text, interval);
	},
	TipTL : function(msg, interval) {// 在页面底部显示消息
		var z = window._EWA_UI_DIALOG_COVERINDEX ? window._EWA_UI_DIALOG_COVERINDEX + 10
				: 1000000;
		var css_box = {
			height : 20,
			padding : 2,
			'background-color' : 'rgba(222,222,0,0.7)',
			position : 'fixed',
			top : 5,
			left : 5,
			'border-radius' : 1,
			'z-index' : z,
			'color' : '#111'
		};
		if (EWA.B.IE && EWA.B.VERSION * 1 < 9) {
			css_box['background-color'] = "filter:progid:DXImageTransform.Microsoft.Gradient(GradientType=0,StartColorStr='#00000000',EndColorStr='#66000000')";
		}
		var css_text = {
			'text-align' : 'center',
			'font-size' : 12,
			'line-height' : 1.5
		};
		EWA.UI.Msg._Tip(msg, css_box, css_text, interval);
	},
	TipTR : function(msg, interval) {// 在页面底部显示消息
		var z = window._EWA_UI_DIALOG_COVERINDEX ? window._EWA_UI_DIALOG_COVERINDEX + 10
				: 1000000;
		var css_box = {
			height : 20,
			padding : 2,
			'background-color' : 'rgba(222,222,0,0.7)',
			position : 'fixed',
			top : 5,
			right : 5,
			'border-radius' : 1,
			'z-index' : z,
			'color' : '#111'
		};
		if (EWA.B.IE && EWA.B.VERSION * 1 < 9) {
			css_box['background-color'] = "filter:progid:DXImageTransform.Microsoft.Gradient(GradientType=0,StartColorStr='#00000000',EndColorStr='#66000000')";
		}
		var css_text = {
			'text-align' : 'center',
			'font-size' : 12,
			'line-height' : 1.5
		};
		EWA.UI.Msg._Tip(msg, css_box, css_text, interval);
	}
};
/**
 * 用于标记对象，显示后showSeconds后消失
 * 
 * @param obj
 *            标记的对象/jq对象集合
 * @param showSeconds
 *            显示秒数
 */
$Mark = function(obj, showSeconds) {
	var se = showSeconds || 3;
	var ms = showSeconds * 1000 || 3000; // 默认3秒
	var s = "<div class='ewa-mark' style='transition-duration:" + se
			+ "s;'></div>";
	$(obj).each(function() {
		var o = $(s);
		var p = $(this).offset();
		var css = {
			left : p.left + 2,
			top : p.top - 2,
			width : $(this).outerWidth(),
			height : $(this).outerHeight()
		};
		o.css(css);
		$('body').append(o);
		setTimeout(function() {
			// 动画隐含
			o.css('opacity', 0);
		}, 10);
		setTimeout(function() {
			// 移除对象
			o.remove();
		}, ms + 10);
	});
};
$Confirm = EWA.UI.Msg.Confirm;
$Tip = EWA.UI.Msg.Tip;
$TipBR = EWA.UI.Msg.TipBR;
$TipBL = EWA.UI.Msg.TipBL;
$TipTR = EWA.UI.Msg.TipTR;
$TipTL = EWA.UI.Msg.TipTL;/**
 * 画横向流程
 */
function EWA_UI_FlowChartClass() {
	this.DEF_CHART_WIDTH = 200;
	this.DEF_CHART_HEIGHT = 50;
	this.DEF_BG_COLOR = '#08c';
	this.DEF_COLOR = '#fff';

	this.Create = function(pid, jsonArray, fieldId, filedText, width, height, bgcolor, color) {
		this.PID = pid;
		this.FIELD_ID = fieldId;
		this.FIELD_TEXT = filedText;
		this.CHART_WIDTH = width || this.DEF_CHART_WIDTH;
		this.CHART_HEIGHT = height || this.DEF_CHART_HEIGHT;
		this.BG_COLOR = bgcolor || this.DEF_BG_COLOR;
		this.COLOR = color || this.DEF_COLOR;
		// 箭头的偏移
		this.OFF = Math.round( this.CHART_HEIGHT * Math.sqrt(2) / 2);

		this._CreateCss();

		var main_width = (this.CHART_WIDTH) * jsonArray.length - (this.OFF -4) * (jsonArray.length-1) + 4;
		var ss = [ "<div style='z-index:1;padding-left:" + this.OFF + "px;height:" + this.CHART_HEIGHT
			+ "px;position:relative;margin:auto;width:" + (main_width) + "px'>" ];
		for (var i = 0; i < jsonArray.length; i++) {
			var d = jsonArray[i];
			var html = this._CreateChart(d, i, i == jsonArray.length - 1);
			ss.push(html);
		}
		ss.push("</div>");
		if ($X(pid)) {
			$($X(pid)).append(ss.join(''));
		} else {
			$('body').append(ss.join(''));
		}
	};
	this._CreateCss = function() {
		var pcolor = '#fff';
		// if ($X(this.PID)) {
		// pcolor = $($X(this.PID)).css('background-color');
		// } else {
		// pcolor = $('body').css('background-color');
		// }

		var h = this.CHART_HEIGHT;
		var w = this.CHART_WIDTH;
		var c = this.BG_COLOR;
		var off = this.OFF;
		var off1 = Math.round(off);
		var css = {
			main : "position:relative;margin-left:-" + (off - 4) + "px;float:left;z-index:[ZINDEX];height:" + h
				+ "px;width:[WIDTH]px;overflow:hidden;",
			leftbox : "background-color:[BGCOLOR];float:left;width:" + off1 + "px;height:" + h + "px;overflow:hidden",
			leftarrow : "background: " + pcolor + ";margin-left: -" + off + "px;width:" + h + "px;height:" + h
				+ "px;-webkit-transform: rotate(45deg);transform: rotate(45deg);",
			center : "height:" + h + "px;float:left;text-overflow: ellipsis;overflow: hidden;line-height:" + h
				+ "px;background-color:[BGCOLOR];width:" + (w - off1 * 2) + "px;text-align:center;font-size:16px",
			centertd : "color:[COLOR];text-overflow: ellipsis;overflow: hidden;width:100%;text-align:center;font-size:16px",
			rightbox : "float:right;width:" + off1 + "px;height:" + h + "px;overflow:hidden",
			rightarrow : "background:[BGCOLOR];margin-left: -" + off1 + "px;width:" + h + "px;height:" + h
				+ "px;-webkit-transform: rotate(45deg);transform: rotate(45deg);"
		};
		this.CSS = css;
	};
	this._CreateChart = function(d, idx, islast) {
		console.log(d)

		

		var ss = [];
		var cssMain = this.CSS.main.replace('[ZINDEX]', (1000 - idx)).replace('[LEFT]', (this.CHART_WIDTH - 20) * idx);
		cssMain = cssMain.replace('[WIDTH]', this.CHART_WIDTH);
		ss.push("<div id='" + d[this.FIELD_ID] + "' style='" + cssMain + "'>");

		var bgcolor = d.bgColor || this.BG_COLOR;
		var csslefbox = this.CSS.leftbox.replace('[BGCOLOR]', bgcolor);
		var csscenter = this.CSS.center.replace('[BGCOLOR]', bgcolor);
		var cssrightarrow = this.CSS.rightarrow.replace('[BGCOLOR]', bgcolor);

		var color=d.color||this.COLOR;
		var csscentertd=this.CSS.centertd.replace('[COLOR]', color);
		// 左箭头
		ss.push("<div style='" + csslefbox + "'>");
		ss.push("<div style='" + this.CSS.leftarrow + "'></div>");
		ss.push("</div>");

		// 中间文字
		ss.push("<table border=0 cellpadding=0 cellspacing=0  style='" + csscenter + "'><tr><td style='" + csscentertd
			+ "'>");
		if (typeof this.FIELD_TEXT == 'function') {
			var tmp = this.FIELD_TEXT(d, idx, islast);
			ss.push(tmp);
		} else {
			ss.push(d[this.FIELD_TEXT]);
		}
		ss.push("</td></tr></table>");

		// 右键头
		ss.push("<div style='" + this.CSS.rightbox + "'>");
		ss.push("<div style='" + cssrightarrow + "'></div>");
		ss.push("</div>");

		ss.push("</div>");

		return ss.join('');
	};
}
/*
 * aa = new EWA_UI_FlowChartClass(); var json = [ { id : 'a1', txt : '方式1' }, {
 * id : 'a2', txt : '方式2' }, {id : 'a3', txt : '方式3' }, { id : 'a4', txt : '方式4' }, {
 * id : 'a4', txt : '方式4' } ] aa.Create('EWA_FRAME_MAIN', json, 'id', 'txt',
 * 190, 80, '#000', 'red')
 */var EWA_UI_HtmlEditorConfig = {
	OPT_PopImgProperties : true,
	OPT_ImageResizes : null, // 800x600, 400x300
	fonts : [ {
		name : "微软雅黑",
		font : "Microsoft YaHei"
	}, {
		name : "宋体",
		font : "宋体"
	}, {
		name : "Arial",
		font : "Arial"
	}, {
		name : "STHeiti",
		font : "STHeiti"
	} ],
	formats : [ {
		name : "H1",
		format : "h1"
	}, {
		name : "H2",
		format : "h2"
	}, {
		name : "H3",
		format : "h3"
	}, {
		name : "H4",
		format : "h4"
	}, {
		name : "H5",
		format : "h5"
	}, {
		name : "普通",
		format : "p"
	} ],
	sizes : [ {
		name : "超大",
		size : '7'
	}, {
		name : "特大",
		size : '6'
	}, {
		name : "大",
		size : '5'
	}, {
		name : "标准",
		size : '4'
	}, {
		name : "小",
		size : '3'
	}, {
		name : "特小",
		size : '2'
	}, {
		name : "特小",
		size : '1'
	} ],
	css : "img{max-width:100%}html{background:#2f2f2f}body{width: 800px; padding:10px 20px; margin: auto;"
			+ " box-shadow: rgb(241, 241, 241) 1px 1px 13px; font-size:14px; box-sizing: border-box;"
			+ "overflow-y: scroll;   "
			+ "font-family: 'Microsoft YaHei', STHeiti, 微软雅黑, tahoma, Verdana, Arial, sans-serif, 宋体;"
			+ " background: rgb(255, 255, 255);}",
	colors : [ "#ffffff", "#000000", "#eeece1", "#1f497d", "#4f81bd",
			"#c0504d", "#9bbb59", "#8064a2", "#4bacc6", "#f79646", "#f2f2f2",
			"#7f7f7f", "#ddd9c3", "#c6d9f0", "#dbe5f1", "#f2dcdb", "#ebf1dd",
			"#e5e0ec", "#dbeef3", "#fdeada", "#d8d8d8", "#595959", "#c4bd97",
			"#8db3e2", "#b8cce4", "#e5b9b7", "#d7e3bc", "#ccc1d9", "#b7dde8",
			"#fbd5b5", "#bfbfbf", "#3f3f3f", "#938953", "#548dd4", "#95b3d7",
			"#d99694", "#c3d69b", "#b2a2c7", "#92cddc", "#fac08f", "#a5a5a5",
			"#262626", "#494429", "#17365d", "#366092", "#953734", "#76923c",
			"#5f497a", "#31859b", "#e36c09", "#7f7f7f", "#0c0c0c", "#1d1b10",
			"#0f243e", "#244061", "#632423", "#4f6128", "#3f3151", "#205867",
			"#974806", "#c00000", "#ff0000", "#ffc000", "#ffff00", "#92d050",
			"#00b050", "#00b0f0", "#0070c0", "#002060", "#7030a0" ],

	buts : {
		"FormatBlock" : {
			id : 'fn_FormatBlock',
			'cmd' : 'PopFormatBlock',
			title : "格式",
			'class' : 'fa fa-header'
		},
		"FontSize" : {
			id : 'fn_FontSize',
			'cmd' : 'PopFontSize',
			title : "字體大小",
			'class' : 'fa fa-text-height'
		},
		"FontName" : {
			id : 'fn_FontName',
			'cmd' : 'PopFont',
			title : "字体",
			'class' : 'fa fa-font'
		},
		"BOLD" : {
			"id" : "st_bold",
			"cmd" : "BOLD",
			"title" : "BOLD",
			"class" : "fa fa-bold"
		},
		"ITALIC" : {
			"id" : "st_italic",
			"cmd" : "ITALIC",
			"title" : "ITALIC",
			"class" : "fa fa-italic"
		},
		"UNDERLINE" : {
			"id" : "st_underline",
			"cmd" : "UNDERLINE",
			"title" : "UNDERLINE",
			"class" : "fa fa-underline"
		},
		"InsertOrderedList" : {
			"id" : "st_insertorderedlist",
			"cmd" : "InsertOrderedList",
			"title" : "InsertOrderedList",
			"class" : "fa fa-list-ol"
		},
		"InsertunOrderedList" : {
			"id" : "st_insertunorderedlist",
			"cmd" : "InsertunOrderedList",
			"title" : "InsertunOrderedList",
			"class" : "fa fa-list-ul"
		},
		"INDENT" : {
			"id" : "st_indent",
			"cmd" : "INDENT",
			"title" : "INDENT",
			"class" : "fa fa-indent"
		},
		"Outdent" : {
			"id" : "st_outdent",
			"cmd" : "Outdent",
			"title" : "Outdent",
			"class" : "fa fa-outdent"
		},
		"JustifyLEFT" : {
			"id" : "st_justifyleft",
			"cmd" : "JustifyLEFT",
			"title" : "左对齐",
			"class" : "fa fa-align-left"
		},
		"JustifyCENTER" : {
			"id" : "st_justifycenter",
			"cmd" : "JustifyCENTER",
			"title" : "居中",
			"class" : "fa fa-align-center"
		},
		"JustifyRIGHT" : {
			"id" : "st_justifyright",
			"cmd" : "JustifyRIGHT",
			"title" : "右对齐",
			"class" : "fa fa-align-right"
		},
		"CreateLink" : {
			"id" : "st_createlink",
			"cmd" : "CreateLink",
			"title" : "创建链接",
			"class" : "fa fa-chain"
		},
		"CODE_TXT" : {
			"id" : "code_txt",
			"cmd" : "CODE_TXT",
			"title" : "源代码",
			"class" : "fa fa-html5"
		},
		eraser : {
			id : 'eraser',
			cmd : 'eraser',
			title : '清除格式',
			"class" : "fa fa-eraser"
		},
		'ForColor' : {
			id : 'fn_ForColor',
			cmd : 'PopForColor',
			title : '字體顏色',
			'class' : 'fa fa-font ewa-editor-for'
		},
		'BackColor' : {
			id : 'fn_BackColor',
			cmd : 'PopBackColor',
			title : '背景顏色',
			'class' : 'fa fa-font ewa-editor-bg'
		},
		'Img' : {
			id : 'fn_Img',
			cmd : 'PopImg',
			title : '圖片',
			'class' : 'fa fa-camera'
		},
		FullScreen : {
			id : 'fn_FullScreen',
			cmd : 'FullScreen',
			title : '全屏',
			'class' : 'fa fa-square-o'
		},
		"Word2Html" : {
			id : 'fn_Word2Html',
			cmd : "Word2Html",
			title : "转换Word",
			'class' : 'fa fa-file-word-o'
		}
	},
	defaultConf : [ [ 'FontName', 'FormatBlock', 'FontSize' ],
			[ "BOLD", "ITALIC", "UNDERLINE" ],
			[ 'InsertOrderedList', 'InsertunOrderedList' ],
			[ "JustifyLEFT", "JustifyCENTER", "JustifyRIGHT" ],
			[ "INDENT", "Outdent" ], [ "CreateLink", "eraser" ],
			[ 'ForColor', 'BackColor' ], [ 'Word2Html', 'Img', "FullScreen" ],
			[ "CODE_TXT" ] ],
	pop : function(obj, cnt) {
		for ( var n in __Cal) {
			if (n.indexOf('EDITOR_Pop_') == 0) {
				__Cal[n].WND.Show(false);
			}
		}
		var popId = 'EDITOR_Pop_' + (obj ? obj.id : "");
		if (!__Cal[popId]) {
			__Cal[popId] = {};
		}
		var ins = __Cal[popId];
		ins.OBJ = obj;
		if (ins.WND == null) {
			var o = ins.WND = new EWA_UI_DialogClass();
			o.Width = 172;
			o.Height = 50;
			o.ShadowColor = "";

			o.CreateWindow = window;

			// if (typeof _EWA_DialogWnd == 'undefined') {
			// o.CreateWindow = window;
			// } else { // pop window created
			// o.CreateWindow = _EWA_DialogWnd._ParentWindow;
			// _EWA_DialogWnd.OpendDialogs[_EWA_DialogWnd.OpendDialogs.length] =
			// o;
			// }
			o.CreateWindow._EWA_CALENDAR_ITEM = ins.WND;
			o.Create();
			o.SetHtml(cnt);

			$(o.GetFrameContent()).find('a').attr('onclick',
					"__Cal[\"" + popId + "\"].WND.Show(false);");
			$('div[ewa_name="DIV_BACK1"]').hide();
		}
		ins.WND.SetZIndex(10);
		if (obj) {
			ins.WND.Object = obj;
			ins.WND.MoveBottom(obj);
		} else {
			ins.WND.MoveCenter();
		}
		ins.WND.Show(true);
		return ins;
	},
	pop1 : function(id, cnt, width, height) {
		var popId = 'EDITOR_Pop_' + id;
		if (!__Cal[popId]) {
			__Cal[popId] = {};
		}
		var ins = __Cal[popId];
		if (ins.WND == null) {
			var o = ins.WND = new EWA_UI_DialogClass();
			o.Width = width;
			o.Height = height;
			o.ShadowColor = "";
			if (typeof _EWA_DialogWnd == 'undefined') {
				o.CreateWindow = window;
			} else { // pop window created
				o.CreateWindow = _EWA_DialogWnd._ParentWindow;
				_EWA_DialogWnd.OpendDialogs[_EWA_DialogWnd.OpendDialogs.length] = o;
			}
			o.CreateWindow._EWA_CALENDAR_ITEM = ins.WND;
			o.Create();
		}
		ins.WND.SetHtml(cnt);

		$(ins.WND.GetFrameContent()).find('#butClose').attr('onclick',
				"__Cal[\"" + popId + "\"].WND.Show(false);")
		ins.WND.SetZIndex(10);
		ins.WND.MoveCenter();
		ins.WND.Show(true);

		return ins;
	}
};
/**
 * 
 */
function EWA_UI_HtmlEditorClass() {
	this.DEF_CHART_WIDTH = 200;
	this.DEF_CHART_HEIGHT = 50;
	this.DEF_BG_COLOR = '#08c';
	this.DEF_COLOR = '#fff';
	this.OBJ_REPLACE = null;
	this.pasteClass = new EWA_MiscPasteToolClass();
	this._CreateFonts = function() {
		var ss = [ "<table class='ewa-editor-pop'>" ];
		for (var i = 0; i < EWA_UI_HtmlEditorConfig.fonts.length; i++) {
			var f = EWA_UI_HtmlEditorConfig.fonts[i];
			ss.push("<tr><td>");
			ss
					.push("<a style='font-size:16px;line-height:1.5;font-family:"
							+ f.font
							+ "' href='javascript:"
							+ this.Id
							+ ".executeSetFont(\""
							+ f.font
							+ "\")'>"
							+ f.name
							+ "</a>")

			ss.push("</td></tr>");
		}
		ss.push("</table>");
		return ss.join('\n');
	};
	this._CreateFormats = function() {
		var ss = [ "<table class='ewa-editor-pop'>" ];
		for (var i = 0; i < EWA_UI_HtmlEditorConfig.formats.length; i++) {
			var f = EWA_UI_HtmlEditorConfig.formats[i];
			ss.push("<tr><td>");
			ss.push("<" + f.format + "><a href='javascript:" + this.Id
					+ ".executeSetFormat(\"" + f.format + "\")'>" + f.name
					+ "</a></" + f.format + ">")

			ss.push("</td></tr>");
		}
		ss.push("</table>");
		return ss.join('\n');
	};
	this._CreateFontSizes = function() {
		var ss = [ "<table class='ewa-editor-pop'>" ];
		for (var i = 0; i < EWA_UI_HtmlEditorConfig.sizes.length; i++) {
			var f = EWA_UI_HtmlEditorConfig.sizes[i];
			ss.push("<tr><td>");
			ss.push("<font size=" + f.size + "><a href='javascript:" + this.Id
					+ ".executeFontSize(\"" + f.size + "\")'>" + f.name
					+ "</a></font>")

			ss.push("</td></tr>");
		}
		ss.push("</table>");
		return ss.join('\n');
	};
	this.executeFontSize = function(fontsize) {
		var window_html = $('#' + this.BoxId + ' iframe:eq(0)')[0].contentWindow;
		this.execDocumentCommand("FontSize", false, fontsize);
	};
	this.executeSetFont = function(font) {
		var window_html = $('#' + this.BoxId + ' iframe:eq(0)')[0].contentWindow;
		this.execDocumentCommand("FontName", false, font);
	};
	this.executeSetFormat = function(format) {
		var window_html = $('#' + this.BoxId + ' iframe:eq(0)')[0].contentWindow;
		this.execDocumentCommand("FormatBlock", false, format);
	};
	this.executeForColor = function(color) {
		var window_html = $('#' + this.BoxId + ' iframe:eq(0)')[0].contentWindow;
		this.execDocumentCommand("ForeColor", false, color);
	};
	this.executeBackColor = function(color) {
		var window_html = $('#' + this.BoxId + ' iframe:eq(0)')[0].contentWindow;
		this.execDocumentCommand("BackColor", false, color);
		$(window_html.document.body).css('background', '#fff');
	};
	this.execDocumentCommand = function(command, truefalse, value) {
		var window_html = $('#' + this.BoxId + ' iframe:eq(0)')[0].contentWindow;
		window_html.document.execCommand(command, truefalse, value);
		this.executeAfterEvent(command, value);
	};
	// 上传文件
	this.executeImages = function(source) {
		var window_html = $('#' + this.BoxId + ' iframe:eq(0)')[0].contentWindow;
		var count = 0;
		var inc_ok = 0;
		var c = this;
		for (var i = 0; i < source.files.length; i++) {
			var file = source.files[i];

			if (file.type && file.type.indexOf('image/') == 0) {
				count++;

				var fr = new FileReader();
				fr.onloadend = function(e) {
					var img = new Image();
					img.src = e.target.result;
					img.style.maxWidth = '100%';
					window_html.document.body.appendChild(img);
					inc_ok++;
					if (inc_ok == count) {
						c.pasteClass.target = window_html.document.body;
						c.pasteClass.processAsHtml();
						c.pasteClass.process();
					}
					c.executeAfterEvent("executeImages", img);
				};
				fr.readAsDataURL(file);
			}
		}
	};
	this.executeWord = function(source) {
		var window_html = $('#' + this.BoxId + ' iframe:eq(0)')[0].contentWindow;
		var url = EWA.CP + (EWA.CP.endsWith("/") ? "" : "/")
				+ "EWA_STYLE/cgi-bin/_re_/?method=2Html";
		var c = this;
		for (var i = 0; i < source.files.length; i++) {
			var file = source.files[i];
			var loc0 = file.name.lastIndexOf(".");
			if (loc0 > 0) {
				var ext = file.name.substring(loc0).toLowerCase();
				if (!(ext == '.doc' || ext == '.docx' || ext == '.xls'
						|| ext == '.xlsx' || ext == '.odt')) {
					$Tip('仅支持 doc/docx/xls/xlsx/odt文件');
					return;
				}
			} else {
				$Tip('仅支持 doc/docx/xls/xlsx/odt文件');
				return;
			}
			var fr = new FileReader();
			fr.onloadend = function(e) {
				var data = {};
				data.src = e.target.result;
				url += "&name=" + file.name.toURL();
				var p = $X(c.BoxId).parentNode;
				var cover_id = c.BoxId + '_cover';
				var cover = '<div id="'
						+ cover_id
						+ '" style="width:100%;height:100%" class="ewa-ui-dialog-cover"></div>';
				$(p).css('position', 'relative').append(cover);
				$JP(url, data, function(rst) {
					if (rst.rst) {
						window_html.document.body.innerHTML = rst.cnt;
						$(window_html.document.body).find('img').each(
								function() {
									$(this).attr(
											"src",
											rst['img_root']
													+ $(this).attr("src"));
								});
						$('#' + cover_id).remove();
						$Tip("处理完成");
						c.executeAfterEvent("executeWord", rst);

					} else {
						$Tip(rst.msg);
					}
				});
			};
			fr.readAsDataURL(file);
		}
	}
	this.PopFontSize = function(from) {
		var ss = this._CreateFontSizes();
		EWA_UI_HtmlEditorConfig.pop(from, ss);
	};
	this.PopFont = function(from) {
		var ss = this._CreateFonts();
		EWA_UI_HtmlEditorConfig.pop(from, ss);
	};
	this.PopFormatBlock = function(from) {
		var ss = this._CreateFormats();
		EWA_UI_HtmlEditorConfig.pop(from, ss);
	};
	this.PopForColor = function(from) {
		var ss = this._CreateColorBox('executeForColor');
		EWA_UI_HtmlEditorConfig.pop(from, ss);
	};
	this.PopBackColor = function(from) {
		var ss = this._CreateColorBox('executeBackColor');
		EWA_UI_HtmlEditorConfig.pop(from, ss);
	};
	this.PopImg = function() {

	};
	this.FullScreen = function() {
		var o = $('#' + this.BoxId);
		var isfull = o.attr('isfull');
		if (isfull) {
			var old_css = o.attr('old_css');
			o.attr('style', old_css).attr('isfull', '');

		} else {
			var index;
			if (window._EWA_UI_DIALOG_COVERINDEX) {
				_EWA_UI_DIALOG_COVERINDEX++;
			} else {
				_EWA_UI_DIALOG_COVERINDEX = 999;
			}
			index = _EWA_UI_DIALOG_COVERINDEX;
			var old_css = o.attr('style');
			o.attr('old_css', old_css).attr('isfull', '1');
			o.css({
				position : 'fixed',
				left : 0,
				top : 0,
				right : 0,
				bottom : 0,
				width : '100%',
				height : '100%',
				"z-index" : index
			});
		}

	};
	this._CreateColorBox = function(fn) {
		var ss = [ "<table class='ewa-editor-pop'><tr>" ];
		for (var i = 0; i < EWA_UI_HtmlEditorConfig.colors.length; i++) {
			if (i > 0 && i % 10 == 0) {
				ss.push("</tr><tr>")
			}
			var c = EWA_UI_HtmlEditorConfig.colors[i];
			ss.push("<td><a href='javascript:" + this.Id + "." + fn + "(\"" + c
					+ "\")' class='ewa-edit-pop-color' style='background:" + c
					+ "'>&nbsp;</a></td>");
		}
		ss.push("</table>");
		return ss.join('\n');
	};
	this.Word2Html = function() {
		// nothing to do;
	}
	this.GetHtml = function() {
		var window_html = $('#' + this.BoxId + ' iframe:eq(0)')[0].contentWindow;
		var window_code = $('#' + this.BoxId + ' iframe:eq(1)')[0].contentWindow;

		if ($('#' + this.BoxId + ' iframe:eq(0)').css('display') == 'none') {
			return window_html.document.body.innerHTML = window_code.getText();
		}
		return window_html.document.body.innerHTML;
	};
	this.GetText = function() {
		var window_html = $('#' + this.BoxId + ' iframe:eq(0)')[0].contentWindow;
		var window_code = $('#' + this.BoxId + ' iframe:eq(1)')[0].contentWindow;

		if ($('#' + this.BoxId + ' iframe:eq(0)').css('display') == 'none') {
			return window_html.document.body.innerHTML = window_code.getText();
		}
		return window_html.document.body.innerText;
	};
	this.Create = function(objReplace) {
		this.OBJ_REPLACE = objReplace;

		this.Id = ("EWA_Html_" + Math.random()).replace('.', '_');
		this.BoxId = this.Id + 'box';
		// console.log('create edit ' + this.Id);
		// console.log('create edit (BOX)' + this.BoxId);

		window[this.Id] = this;
		EWA.F.FOS[this.Id] = this;

		var html = objReplace.value || objReplace.innerHTML;
		var height = $(objReplace).height();
		var width = $(objReplace).width();

		var css = {
			border : '1px solid #ccc',
			position : 'relative',
			width : width,
			height : height,
			overflow : 'hidden'
		};
		if (objReplace.getAttribute('EWA_DHTML') == '1') {
			css.width = '100%';
		}
		var obj = document.createElement('table');
		obj.id = this.BoxId;
		$(obj).css(css).addClass('ewa-editor').attr('cellpadding', 0).attr(
				'cellspacing', 0);
		var buts = obj.insertRow(-1).insertCell(-1);
		buts.className = 'ewa-editor-buts';

		var cnt = obj.insertRow(-1).insertCell(-1);
		$(cnt).css('position', 'static').css('opacity', 1).addClass(
				'ewa-ui-dialog-cover');
		var buts_html = [];
		var conf = EWA_UI_HtmlEditorConfig.defaultConf;
		for ( var n in conf) {
			if (n > 0)
				buts_html.push("<span class='ewa-editor-but-spt '>|</span>")
			for ( var m in conf[n]) {
				var o = EWA_UI_HtmlEditorConfig.buts[conf[n][m]];
				var s = this._CreateButton(o);
				buts_html.push(s);
			}
		}
		buts.innerHTML = buts_html.join('');

		objReplace.parentNode.insertBefore(obj, objReplace);
		objReplace.style.display = 'none';

		this._CreateIframe(cnt, html, objReplace);

		var file = "<input onchange='"
				+ this.Id
				+ ".executeImages(this)' multiple accept='image/jpeg,image/png,image/bmp' type=file "
				+ " style='width:30px;height:30px;position:absolute;top:4px;left:0px;opacity:0.0'>";
		$('#' + this.BoxId).find('a[id=fn_Img]').append(file);

		var fileWord = "<input onchange='"
				+ this.Id
				+ ".executeWord(this)' accept='doc,docx,odt' type=file "
				+ " style='width:30px;height:30px;position:absolute;top:4px;left:0px;opacity:0.0'>";
		$('#' + this.BoxId).find('a[id=fn_Word2Html]').append(fileWord);

		this.executeAfterEvent('init', 'ok');

		if (window.__Cal) { // 清除已经存在的Pop窗体，避免ajax多次加载出现找不到对象的问题 (this.Id会不一致)
			for ( var n in __Cal) {
				if (n.indexOf('EDITOR_Pop_') == 0) {
					delete window.__Cal[n];
				}
			}
		}
	};
	this._CreateIframe = function(cnt, html, objReplace) {
		cnt.innerHTML = "<iframe id='"
				+ this.Id
				+ "cntent' frameborder=0 width=100% height=100%></iframe>"
				+ "<iframe id='"
				+ this.Id
				+ "code' src0='"
				+ (EWA.RV_STATIC_PATH || "/EmpScriptV2")
				+ "/EWA_STYLE/editor/CodeMirror/index.html' style='display: none; width: 100%; height: 100%' frameborder=0></iframe>";

		var c = this;
		// 由于iframe创建需要时间，所以等待400ms
		setTimeout(function() {
			var iframe_obj = $('#' + c.BoxId + ' iframe:eq(0)');

			var window_html = iframe_obj[0].contentWindow;
			var doc = window_html.document;
			// firefox 设置最小高度
			doc.body.style.minHeight = iframe_obj.height() + 'px';

			// 设置新的宽度
			if (iframe_obj.width() < 840) {
				doc.body.style.boxSizing = 'border-box';
				doc.body.style.width = '100%';
			}
			var style = doc.createElement('style');
			style.textContent = EWA_UI_HtmlEditorConfig.css;
			doc.getElementsByTagName('head')[0].appendChild(style);

			var u = EWA.CP + (EWA.CP.endsWith('/') ? '' : '/')
					+ 'EWA_STYLE/cgi-bin/_re_/index.jsp?method=HtmlImages';
			// 图片缩放
			if (EWA_UI_HtmlEditorConfig.OPT_ImageResizes) {
				u += "&ImageReiszes="
						+ EWA_UI_HtmlEditorConfig.OPT_ImageResizes.toURL();
			}
			c.pasteClass.bind(window_html.document.body, u, function(rst) {
				c.executeAfterEvent("HtmlImages", rst);
			});

			// console.log(EWA_MiscPasteTool.target)

			doc.contentEditable = true;
			doc.designMode = "on";
			doc.body.innerHTML = html;

			$(doc.body).css(EWA_UI_HtmlEditorConfig.css);

			// 图片点击显示对话框
			if (EWA_UI_HtmlEditorConfig.OPT_PopImgProperties) {
				doc.onmousedown = function(evt) {
					var e = evt || event;
					var t = e.target || e.srcElement;
					if (t.tagName == 'IMG') {
						c.PopImgProperties(t)
					}
				};
			}
			$(doc.body).bind("cut", function() {
				setTimeout(function() {
					c.executeAfterEvent('cut');
				}, 10);
			});
			$(doc.body).bind("keyup", function() {
				c.executeAfterEvent('keyup');
			});
			$(doc.body).bind("paste", function() {
				setTimeout(function() {
					c.executeAfterEvent('paste');
				}, 10);
			});
			$(doc.body).bind("undo", function() {
				c.executeAfterEvent('undo');
			});
			$(doc.body).bind("redo", function() {
				c.executeAfterEvent('redo');
			});
		}, 411);
	};
	this.PopImgProperties = function(img) {
		var ss = [ "<table style='background:rgba(0,0,0,0.77);color:#f1f1f1;' border=0 width=300 height=140>" ];
		ss.push("</tr><td colspan=2 align=center>设定图片属性</td></tr>");

		ss.push("<tr><td>尺寸：</td><td><input name='width' value='" + img.width
				+ "' size=4 maxlength=4> x ");
		ss.push("<input name='height' value='" + img.height
				+ "' size=4 maxlength=4>");
		ss.push("</td></tr>");

		ss
				.push("<tr><td>浮动：</td><td><select name='float'><option value=''></option>");
		ss.push("<option value='left'>左</option>");
		ss.push("<option value='right'>右</option>");
		ss.push("</select></td></tr>");

		ss
				.push("<tr><td>边界：</td><td><input name='margin' value='2' size=4 maxlength=2> 像素 ");
		ss.push("</td></tr>");

		ss.push("<tr><td>边界：</td><td><input type='checkbox' name='bt'> 设为标题图 ");
		ss.push("</td></tr>");

		ss
				.push("</tr><td colspan=2 align=center><input type=button value='确定' id='butOk'>&nbsp;");
		ss
				.push("<input type=button onclick='$(this).parentsUntil(\"div[ewa_name=DIV_FRAME]\").last().parent().hide()' value='关闭'></td></tr>")
		ss.push("</table>");
		var ins = EWA_UI_HtmlEditorConfig.pop1(img.getAttribute('_tmp_id'), ss
				.join(''), 300, 150);

		var cnt = ins.WND.GetFrameContent();
		var c = this;
		$(cnt).find('#butOk').bind('click', function() {
			$(this.parentNode).find('#butClose').click();
			var w = $(cnt).find('[name=width]').val();
			if (w != '') {
				img.width = w;
			} else {
				$(img).attr('width', null);
			}
			var h = $(cnt).find('[name=height]').val();
			if (h != '') {
				img.height = h;
			} else {
				$(img).attr('height', null);
			}
			var f = $(cnt).find('[name=float]').val();
			$(img).css("float", f);
			$(img).css("margin", $(cnt).find('[name=margin]').val() + 'px');

			if ($(cnt).find('[name=bt]')[0].checked) {
				var ss = img.src.replace(location.origin, '');
				ss = ss.replace('//', '/');
				$('#NWS_HEAD_PIC').val(ss);
				if (c.userSetHeaderPic) {
					c.userSetHeaderPic(ss);
				}
			}
		});
	};
	this._CreateButton = function(o) {
		try {
			var s = "<a href='javascript:void(0)' class='btn " + o["class"]
					+ "' onclick='" + this.Id + ".execute(this)' id='" + o.id
					+ "' cmd='" + o.cmd + "' title='" + o.title + "'></a>";
			return s;
		} catch (e) {
			console.log(o)
			return "";
		}

	};
	this.showCode = function(o1) {

		var window_html = $('#' + this.BoxId + ' iframe:eq(0)')[0].contentWindow;
		var window_code = $('#' + this.BoxId + ' iframe:eq(1)')[0].contentWindow;

		var html = window_code.style_html(window_html.document.body.innerHTML,
				4, ' ', 80);

		o1.setAttribute('tag', 'txt');
		if (window_code.editor) {
			window_code.editor.setValue(html);
		} else {
			__VAL__ = html;
			__TYPE__ = 'html';
			window_code.aa();
		}
	};
	this.execute = function(o1) {
		var window_html = $('#' + this.BoxId + ' iframe:eq(0)')[0].contentWindow;
		var window_code = $('#' + this.BoxId + ' iframe:eq(1)')[0].contentWindow;

		var doc = window_html.document;
		var cmd = o1.getAttribute('cmd');

		if (o1.id.indexOf('st_') == 0) {
			if (cmd == 'CreateLink') {
				doc.execCommand(cmd, true, null);
			} else {
				doc.execCommand(cmd, false, null);
			}

		} else if (o1.id.indexOf('fn_') == 0) {
			this[cmd](o1);
		} else if (cmd == 'eraser') {
			this.executeEraser();
		} else if (cmd == 'CODE_TXT') {
			var tag = o1.getAttribute('tag');
			var frameEditor = $('#' + this.BoxId + ' iframe:eq(0)');
			var frameCode = $('#' + this.BoxId + ' iframe:eq(1)');

			if (!tag) {
				frameEditor.hide();
				frameCode.show();

				if (frameCode.attr('src0')) { // 初始化编辑器不加载url
					var u = frameCode.attr('src0');
					frameCode.attr('src', u);
					frameCode.removeAttr('src0');

					var c = this;
					this._WAIT_CODE_LOAD_COMPLETE = setInterval(function() {
						if (window_code.document.readyState == 'complete') {
							window.clearInterval(c._WAIT_CODE_LOAD_COMPLETE);
							c._WAIT_CODE_LOAD_COMPLETE = null;
							c.showCode(o1);
						}
					}, 100);

				} else {
					this.showCode(o1);
				}
			} else {
				frameEditor.show();
				frameCode.hide();
				o1.setAttribute('tag', '');
				window_html.document.body.innerHTML = window_code.getText();
			}
		} else if (o1.id == 'IMG') {
			insertImg(window);
		} else {
			if (o1.id == 'CreateLink') {
				window_html.document.execCommand(o1.id, true, null);
			} else {
				window_html.document.execCommand(o1.id, false, null);
			}
			window_html.document.body.focus();
		}
		this.executeAfterEvent(cmd);
	};
	this.executeEraser = function() {
		var bd = $('#' + this.BoxId + ' iframe:eq(0)')[0].contentWindow.document.body;
		$(bd).find('p,h1,h2,h3,h4,h5').each(function() {
			if ($(this).find('img').length == 0) {
				this.innerText = this.innerText;
				if (this.innerText.trimEx() == '') {
					$(this).remove();
				}
			}
		});
		$(bd).find('div,font,span,a').each(function() {
			if ($(this).find('img').length == 0) {
				if (this.innerText.trimEx() == '') {
					$(this).remove();
				}
			}

		});

		$(bd).find('script').remove();
		$(bd).find('style').remove();
		$(bd).find('link').remove();
		$(bd).find('meta').remove();
		$(bd).find('title').remove();
		$(bd).find('colgroup').remove();

		$(bd).find('*').attr('style', null).attr('class', null).attr('face',
				null).attr('size', null).attr('href', null).attr('onerror',
				null).attr('onload', null).attr('onclick', null).attr(
				'onmousedown', null).attr('onmouseover', null).attr(
				'onmouseout', null).attr('color', null).attr('className', null);

		// 重新写值
		var exp = /<!--[\w\W\r\n]*?-->/gim; // 注释的正则表达式
		this.OBJ_REPLACE.value = bd.innerHTML = bd.innerHTML.replace(exp, '');
	}
	this.executeAfterEvent = function(cmd, value) {
		var bd = $('#' + this.BoxId + ' iframe:eq(0)')[0].contentWindow.document.body;
		if (cmd == 'init' && value == 'ok') {
			// 初始化不改变值
		} else {
			this.OBJ_REPLACE.value = bd.innerHTML;
		}
		if (this.userAfterEvent) {
			this.userAfterEvent(cmd, value, bd);
		}
	};
	// define your function
	this.userAfterEvent = function(cmd, value, targetElement) {
		// console.log(cmd,value,targetElement);
	};
};
/**
 * 粘贴获取图片资源保存到本地 <br>
 * 提交地址 例如 ：xxx/EWA_STYLE/cgi-bin/_re_/index.jsp?method=HtmlImages<br>
 * method=HtmlImages 是标记<br>
 * 
 * 处理当编辑器粘贴网路图片(背景)，提交到后台获取图片保存到本地<br>
 * 当粘贴诸如 qq捕捉的图片时，提交base64内容到后台并转换成本地文件
 * 
 */
function EWA_MiscPasteToolClass() {
	this.target = document.body;
	this.handleUrl = null;
	this.images = [];
	this.paste = function(d) {
		d = d.originalEvent;
		if (!(d && d.clipboardData && d.clipboardData.items && d.clipboardData.items.length > 0)) {
			return;
		}
		for (var b = 0; b < d.clipboardData.items.length; b++) {
			var c = d.clipboardData.items[b];
			// console.log(c.type);
			if (c.type == "image/png") {
				// 粘贴图片处理
				this.processAsPaste(c);
			} else if (c.type == "text/html") {
				var me = this;
				if (d.clipboardData.getData("text/html")) {
					// 根据粘贴后的内容进行处理,延时300ms
					setTimeout(function() {
						me.processAsHtml();
						me.process();
					}, 311);
				}
				break;
			}
		}

	};
	this.processAsPaste = function(c) {
		var a = new FileReader();
		var me = this;
		a.onloadend = function() {
			var img = null;
			// img.src = this.result;
			// EWA_MiscPasteTool.target.appendChild(img);
			var prevImgs = {};
			$(me.target).find('img').each(function() {
				prevImgs[this.src] = true;
			});

			me.target.ownerDocument.execCommand("InsertImage", false,
					this.result);

			$(me.target).find('img').each(function() {
				if (img == null && !prevImgs[this.src]) {
					img = this;
				}
			});
			if (img) {
				var tmpid = me.tmpId(img);
				me.images.push({
					id : tmpid,
					src : img.src,
					mode : "base64"
				});
				me.process();
			} else {
				console.log('not img');
			}
		};
		a.readAsDataURL(c.getAsFile());
	};
	this.processAsHtml = function() {
		var obj = this.target;
		var me = this;
		$(obj)
				.find("img")
				.each(
						function() {
							if (!this.getAttribute("_tmp_id")) {
								var tmpid = me.tmpId(this);
								if (this.src
										&& this.src.indexOf(location.origin) != 0) {
									me.images
											.push({
												id : tmpid,
												src : this.src,
												mode : this.src
														.indexOf('data:image') == 0 ? "base64"
														: "normal"
											});
								}
							}
						});
		// 从body开始 清除备注
		this.processRemoveComments();

		$(obj).find('*').each(function() {
			var bg = $(this).css('background-image');
			if (bg) {
				bg = bg.replace('url(', '').replace(')', '');
				if (bg && bg.startsWith('http://')) {
					me.images.push({
						id : EWA_MiscPasteTool.tmpId(this),
						src : bg,
						mode : "background"
					});
				}
			}
			$(this).attr({
				onclick : null,
				onload : null,

				onkeydown : null,
				onkeyup : null,
				onerror : null,

				onmousedown : null,
				onmouseout : null,
				onmouseover : null,
				onkeypress : null,

				onblur : null,
				onscroll : null
			});
		});
	};
	this.processRemoveComments = function(parent) {
		if (parent == null) {
			parent = this.target;
		}
		// console.log(parent.innerHTML)
		var comments = [];
		for ( var n in parent.childNodes) {
			var o = parent.childNodes[n];
			if (o.nodeType == 8 || o.tagName == "SCRIPT" || o.tagName == "LINK"
					|| o.tagName == "STYLE" || o.tagName == "IFRAME") {
				comments.push(o);
			} else {
				if (o.tagName == "SPAN") {
					var v = GetInnerText(o);
					if (!v) {
						comments.push(o);
					}
				}
			}

		}

		for ( var n in comments) {
			parent.removeChild(comments[n]);
		}
		for ( var n in parent.childNodes) {
			var o = parent.childNodes[n];
			if (o.nodeType == 1 && o.childNodes) {
				this.processRemoveComments(o);
			}
		}
	};
	this.tmpId = function(obj) {
		if (!obj.getAttribute("_tmp_id")) {
			var tmpid = ("r_" + Math.random()).replace(".", "");
			obj.setAttribute("_tmp_id", tmpid);
			$(obj).css('max-width', '100%');
			return tmpid;
		} else {
			return obj.getAttribute("_tmp_id");
		}
	};
	this.process = function() {
		if (this.images.length == 0) {
			return;
		}
		// 提交到后台进行处理
		var data = {
			d : JSON.stringify(this.images)
		};
		this.images = [];
		var me = this;
		$JP(this.handleUrl, data, function(rst) {
			if (rst.rst) {
				for (var i = 0; i < rst.rsts.length; i++) {
					var d = rst.rsts[i];
					var id = d.id;
					var local = d.local;
					var mode = d.mode;
					if (mode == 'background') {
						$(me.target).find('[_tmp_id="' + id + '"]').css(
								'background-image', "url(" + local + ")");
					} else {
						$(me.target).find('img[_tmp_id="' + id + '"]').attr(
								'src', local);
					}
				}

			} else {
				$Tip('处理错误');
			}

			if (me.handleUrlAfterEvent) {
				me.handleUrlAfterEvent(rst);
			}
		});

	};
	this.bind = function(obj, handleUrl, handleUrlAfterEvent) {
		if (!handleUrl) {
			alert('请定义提交地址');
			return;
		}
		this.handleUrl = handleUrl;
		this.images = [];
		this.target = obj;
		var me = this;
		$(document).ready(function() {
			$(obj).bind("paste", function(e) {
				me.paste(e);
			});
		});

		if (handleUrlAfterEvent) {
			this.handleUrlAfterEvent = handleUrlAfterEvent;
		} else {
			this.handleUrlAfterEvent = null;
		}
	};
};

/**
 * 粘贴获取图片资源保存到本地 <br>
 * 提交地址 例如 ：xxx/EWA_STYLE/cgi-bin/_re_/index.jsp?method=HtmlImages<br>
 * method=HtmlImages 是标记<br>
 * 
 * 处理当编辑器粘贴网路图片(背景)，提交到后台获取图片保存到本地<br>
 * 当粘贴诸如 qq捕捉的图片时，提交base64内容到后台并转换成本地文件
 * 
 */

/*
var EWA_MiscPasteTool0000 = {
	target : document.body,
	handleUrl : null,
	images : [],
	paste : function(d) {
		d = d.originalEvent;
		if (d && d.clipboardData && d.clipboardData.items
				&& d.clipboardData.items.length > 0) {
			for (var b = 0; b < d.clipboardData.items.length; b++) {
				var c = d.clipboardData.items[b];
				// console.log(c.type);
				if (c.type == "image/png") {
					// 粘贴图片处理
					EWA_MiscPasteTool.processAsPaste(c);
				} else if (c.type == "text/html") {
					if (d.clipboardData.getData("text/html")) {
						// 根据粘贴后的内容进行处理,延时300ms
						setTimeout(function() {
							EWA_MiscPasteTool.processAsHtml();
							EWA_MiscPasteTool.process();
						}, 311);
					}
					break;
				}
			}
		}
	},
	processAsPaste : function(c) {
		var a = new FileReader();
		a.onloadend = function() {
			var img = null;
			// img.src = this.result;
			// EWA_MiscPasteTool.target.appendChild(img);
			var prevImgs = {};
			$(EWA_MiscPasteTool.target).find('img').each(function() {
				prevImgs[this.src] = true;
			});

			EWA_MiscPasteTool.target.ownerDocument.execCommand("InsertImage",
					false, this.result);

			$(EWA_MiscPasteTool.target).find('img').each(function() {
				if (img == null && !prevImgs[this.src]) {
					img = this;
				}
			});
			if (img) {
				var tmpid = EWA_MiscPasteTool.tmpId(img);
				EWA_MiscPasteTool.images.push({
					id : tmpid,
					src : img.src,
					mode : "base64"
				});
				EWA_MiscPasteTool.process();
			} else {
				console.log('not img');
			}
		};
		a.readAsDataURL(c.getAsFile());
	},
	processAsHtml : function() {
		var obj = this.target;

		$(obj)
				.find("img")
				.each(
						function() {
							if (!this.getAttribute("_tmp_id")) {
								var tmpid = EWA_MiscPasteTool.tmpId(this);
								if (this.src
										&& this.src.indexOf(location.origin) != 0) {
									EWA_MiscPasteTool.images
											.push({
												id : tmpid,
												src : this.src,
												mode : this.src
														.indexOf('data:image') == 0 ? "base64"
														: "normal"
											});
								}
							}
						});
		// 从body开始 清除备注
		this.processRemoveComments();

		$(obj).find('*').each(function() {
			var bg = $(this).css('background-image');
			if (bg) {
				bg = bg.replace('url(', '').replace(')', '');
				if (bg && bg.startsWith('http://')) {
					EWA_MiscPasteTool.images.push({
						id : EWA_MiscPasteTool.tmpId(this),
						src : bg,
						mode : "background"
					});
				}
			}
			$(this).attr({
				onclick : null,
				onload : null,

				onkeydown : null,
				onkeyup : null,
				onerror : null,

				onmousedown : null,
				onmouseout : null,
				onmouseover : null,
				onkeypress : null,

				onblur : null,
				onscroll : null
			});
		});
	},
	processRemoveComments : function(parent) {
		if (parent == null) {
			parent = this.target;
		}
		// console.log(parent.innerHTML)
		var comments = [];
		for ( var n in parent.childNodes) {
			var o = parent.childNodes[n];
			if (o.nodeType == 8 || o.tagName == "SCRIPT" || o.tagName == "LINK"
					|| o.tagName == "STYLE" || o.tagName == "IFRAME") {
				comments.push(o);
			} else {
				if (o.tagName == "SPAN") {
					var v = GetInnerText(o);
					if (!v) {
						comments.push(o);
					}
				}
			}

		}

		for ( var n in comments) {
			parent.removeChild(comments[n]);
		}
		for ( var n in parent.childNodes) {
			var o = parent.childNodes[n];
			if (o.nodeType == 1 && o.childNodes) {
				this.processRemoveComments(o);
			}
		}
	},
	tmpId : function(obj) {
		if (!obj.getAttribute("_tmp_id")) {
			var tmpid = ("r_" + Math.random()).replace(".", "");
			obj.setAttribute("_tmp_id", tmpid);
			$(obj).css('max-width', '100%');
			return tmpid;
		} else {
			return obj.getAttribute("_tmp_id");
		}
	},
	process : function() {
		if (EWA_MiscPasteTool.images.length == 0) {
			return;
		}
		// 提交到后台进行处理
		var data = {
			d : JSON.stringify(EWA_MiscPasteTool.images)
		};
		EWA_MiscPasteTool.images = [];
		$JP(this.handleUrl, data,
				function(rst) {
					if (rst.rst) {
						for (var i = 0; i < rst.rsts.length; i++) {
							var d = rst.rsts[i];
							var id = d.id;
							var local = d.local;
							var mode = d.mode;
							if (mode == 'background') {
								$(EWA_MiscPasteTool.target).find(
										'[_tmp_id="' + id + '"]').css(
										'background-image',
										"url(" + local + ")");
							} else {
								$(EWA_MiscPasteTool.target).find(
										'img[_tmp_id="' + id + '"]').attr(
										'src', local);
							}
						}

					} else {
						$Tip('处理错误');
					}

					if (EWA_MiscPasteTool.handleUrlAfterEvent) {
						EWA_MiscPasteTool.handleUrlAfterEvent(rst);
					}
				});

	},
	bind : function(obj, handleUrl, handleUrlAfterEvent) {
		if (!handleUrl) {
			alert('请定义提交地址');
			return;
		}
		EWA_MiscPasteTool.handleUrl = handleUrl;
		EWA_MiscPasteTool.images = [];
		EWA_MiscPasteTool.target = obj;
		$(document).ready(function() {
			$(obj).bind("paste", EWA_MiscPasteTool.paste);
		});

		if (handleUrlAfterEvent) {
			this.handleUrlAfterEvent = handleUrlAfterEvent;
		} else {
			this.handleUrlAfterEvent = null;
		}
	}
};
*//**
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
}/**
 * 用于App显示图片，支持缩放
 */
function EWA_UI_PicViewClass() {
	this.id = ('EWAUIPicView' + Math.random()).replace('.', 'Gdx');
	this.t_start = -1;
	this.dist_base = 0;
	this.is_move = false;
	this.table=null;
	this.prevIdx = -1;
	this.setImg = function(img) {
		$(img).attr('mw', img.width).attr('mh', img.height).css("margin-left", 0).css('margin-top', '0');
		// css('width', img.width).css('height', img.height)
		$(img).parent().css("background-image", "none");
	};
	this.addPic = function(pic_path) {
		var idx = this.table.rows[0].cells.length;
		var td = this.table.rows[0].insertCell(idx);
		td.align = 'center';
		var id = this.id + "_" + idx;
		var s = "<img style='max-width:100%;max-height:100%' onload='" + this.id + ".setImg(this)' id='" + id + "' ";
		s += " src1='" + pic_path + "'>";
		var css = {
			'background-image' : "url('/static/images/loading2.gif')",
			"background-position" : "center center",
			"background-repeat" : "no-repeat"
		}
		$(td).hide().css(css);
		td.innerHTML = s;
		$(this.table1).find('td').append('<b>&bull;</b>');
		if (idx == 0) {
			this.changePhoto(0);
		} else {
			$(this.table1).show();
		}
		this.total = idx + 1;
	};
	this.changePhoto = function(idx) {
		if (this.prevIdx == idx) {
			return;
		}
		if (this.prevIdx >= 0) {
			var img = $('#' + this.id + '_' + this.prevIdx);
			$(img).parent().hide();
			$(this.table1).find('b:eq(' + this.prevIdx + ')').css('color', '#ccc');
		}
		this.prevIdx = idx;
		var img = $('#' + this.id + '_' + idx);
		if (img.attr('src1')) {
			img.attr('src', img.attr('src1'));
			img.attr('scr1', "");
			img[0].setAttribute('src1', '');
		} else {
			try {
				if (img.attr('mw')) {
					var mw = img.attr('mw') * 1;
					var mh = img.attr('mh') * 1;
					img.css('width', mw).css('height'.mh);
				}
			} catch (e) {
				console.log(e);
			}
			img.css('margin-left', 0).css('margin-top', 0).attr('r', null).attr('rold', null).css('transform', 'scale(1)');
		}
		img.parent().show();
		$(this.table1).find('b:eq(' + idx + ')').css('color', 'yellow');
	};
	this.close = function() {
		$(this.table).parent().remove();
		delete window[this.id];
	};
	this.create = function() {
		window[this.id] = this;

		var main = document.createElement('div');

		var page = document.createElement('table');
		page.insertRow(-1);

		var page1 = document.createElement('table');
		page1.insertRow(-1).insertCell(-1).align = 'center'; // td

		var close = document.createElement('div');
		close.innerHTML = "<b class='fa fa-close'></b>";
		var css = {
			'position' : 'fixed',
			'top' : 0,
			left : 0,
			width : '100%',
			height : '100%',
			'z-index' : 99999999,
			background : 'rgba(0, 0, 0, 0.9)'
		};
		$(main).css(css);
		var p_css = {
			position : 'absolute',
			left : 0,
			top : 0,
			height : '100%',
			width : '100%',
			'table-layout' : 'fixed'
		};
		$(page).css(p_css);

		var p_css1 = {
			position : 'absolute',
			left : 0,
			height : 30,
			width : '100%',
			overflow : 'hidden',
			bottom : '5px',
			'z-index' : 3,
			color : '#ccc',
			'font-size' : '30px',
			display : "none"
		};
		$(page1).css(p_css1);

		var close_css = {
			position : 'absolute',
			right : 20,
			top : 30,
			height : 40,
			width : 40,
			'line-height' : '40px',
			overflow : 'hidden',
			'z-index' : 4,
			color : 'darkred',
			'font-size' : '30px',
			'text-align' : 'center',
			display : 'block'
		}
		$(close).css(close_css).attr('onclick', this.id + ".close()");
		this.table = page;
		this.table1 = page1;

		$(main).append(page);
		$(main).append(page1);
		$(main).append(close);
		$('body').append(main);

		var c = this;
		page.ontouchstart = function(event) {
			if (event.targetTouches.length == 1) {
				// console.log(event);
				c.t_start = event;
			} else if (event.targetTouches.length == 2) { // scale
				c.t_start1 = event;
				c.dist_base = 0;
			}
			c.is_move = false;
			event.preventDefault();
			event.stopPropagation();
		};
		page.ontouchmove = function(event) {
			if (event.targetTouches.length == 2) { // 双指头
				c.t_start1a = event;

				var dx = event.targetTouches[0].pageX - c.t_start1.pageX;
				var dy = event.targetTouches[0].pageY - c.t_start1.pageY;

				var dx1 = event.targetTouches[1].pageX - c.t_start1.pageX;
				var dy1 = event.targetTouches[1].pageY - c.t_start1.pageY;

				var dt = event.timeStamp - c.t_start1.timeStamp;

				var dist = Math.sqrt((dx - dx1) * (dx - dx1) + (dy - dy1) * (dy - dy1));
				// console.log(dx, dy, dx1, dy1, dist, dt);
				if (c.dist_base == 0) {
					c.dist_base = dist;
				} else {
					// console.log(c.dist_base, dist, dist / c.dist_base);
					var r = dist / c.dist_base;

					var r_old = $(event.target).attr('rold');
					if (!r_old) {
						r_old = 1;
					} else {
						r_old = r_old * 1;
					}
					r = r * r_old;
					if (r <= 1) {
						r = 1;
					}
					if (r > 5) {
						r = 5;
					}
					$(event.target).css("transform", 'scale(' + r + ')').attr('r', r);
					if (r == 1) {
						$(event.target).css('margin-left', 0).css('margin-top', 0);
					}
				}

			} else if (event.targetTouches.length == 1) {
				var r = $(event.target).attr('r');

				if (r == null || r == 1) {
					return;
				}
				var dx = event.pageX - c.t_start.pageX;
				var dy = event.pageY - c.t_start.pageY;

				var px = $(event.target).css('margin-left').replace('px', '') * 1;
				var py = $(event.target).css('margin-top').replace('px', '') * 1;

				var left = px + dx;
				var top = py + dy;
				$(event.target).css('margin-left', left).css('margin-top', top);

				c.t_start = event;
				c.is_move = true;
			}
			event.preventDefault();
			event.stopPropagation();
		};
		page.ontouchend = function(event) {
			event.preventDefault();
			event.stopPropagation();

			if (c.t_start) { // 单个指头
				// console.log(event);
				var dx = event.pageX - c.t_start.pageX;
				var dy = event.pageY - c.t_start.pageY;
				var dt = event.timeStamp - c.t_start.timeStamp;

				// console.log(dx, dy, dt);

				if (dx < -50 && dt < 244) {
					var idx = c.prevIdx;
					idx++;
					if (idx == c.total) {
						idx = 0;
					}
					c.changePhoto(idx);

				} else if (dx > 50 && dt < 244) {
					var idx = c.prevIdx;
					idx--;
					if (idx < 0) {
						idx = c.total - 1;
					}
					c.changePhoto(idx);

				} else if (Math.abs(dx) < 10 && dt < 150 && !c.is_move) {
					c.click_page();
				}
			}
			console.log(c.t_start1)
			if (c.t_start1) {

				var r = $(event.target).attr('r');
				console.log(r)
				$(event.target).attr('rold', r);
			}
			c.t_start = null;
			c.t_start1 = null;
		};
	};
}function EWA_UI_H5FrameSet() {
    this.Create = function (frameId, frameType) {
        this.Id = frameId;
        this.FrameType = frameType;

        this.LOC_ID = "EWA_UI_H5FrameSet_" + this.Id;

        this.ParentDiv = $('#F0_' + this.Id).parent();
        this.objOne = this.ParentDiv.find('.ewa-frameset-one');
        this.objTwo = this.ParentDiv.find('.ewa-frameset-two');
        this.objSplit = this.ParentDiv.find('.ewa-frameset-split');
        this.objCover = this.ParentDiv.find('.ewa-frameset-cover');

		// 当 h5 页面，需要指定高度		
		//$('#EWA_FRAME_MAIN').css('height', '100vh');
		$('body').css('height', '100vh');

        if (frameType == 'H5') {
            this.CreateMoveH5(); // 水平移动
        } else {
            this.CreateMoveV5(); // 上下移动
        }
        if (window.localStorage[this.LOC_ID]) {
            var left = window.localStorage[this.LOC_ID] * 1;
            this.ChangeLocation(left);
        }

		
    };

    /**
     * 获取已经存在的移动实例
     */
    this._GetMoveInstance = function () {
        var name = "__EWA_MOVE_EWA_UI_H5FrameSetInstance";
        if (window[name]) {
            return window[name];
        }

        window[name] = new EWA.UI.Move();
        window[name].NAME = "__EWA_MOVE_EWA_UI_H5FrameSetInstance";
        window[name].Init(window[name]);
        
        return window[name];
    };

    /**
     * 上下移动
     */
    this.CreateMoveV5 = function () {
        this.mv1 = this._GetMoveInstance();
        var obj = this.objSplit[0];

        var c = this;
        this.mv1.AddMoveObjectY(obj, obj, function (a) { // 鼠标抬起
            c.objCover.hide();
            c.objSplit.css('z-index', 1);
        }, document.body, function (a, b) {// 鼠标移动
            var top = $(a).css('top').replace('px', '') * 1;
            c.ChangeLocation(top);
            window.localStorage[c.LOC_ID] = top;
            // console.log(c)
        }, function () {// 鼠标按下
            c.objCover.show();
        });
    };
    /**
     * 水平移动
     */
    this.CreateMoveH5 = function () {
        this.mv1 = this._GetMoveInstance();
        var obj = this.objSplit[0];
        var c = this;
        this.mv1.AddMoveObjectX(obj, obj, function (a) { // 鼠标抬起
            c.objCover.hide();
            c.objSplit.css('z-index', 1);
        }, document.body, function (a, b) {// 鼠标移动
            var left = $(a).css('left').replace('px', '') * 1;
            c.ChangeLocation(left);
            window.localStorage[c.LOC_ID] = left;
            // console.log(c)
        }, function () {// 鼠标按下
            c.objCover.show();
        });
    };

    this.ChangeLocation = function (left) {
        if (this.FrameType == 'H5') {
            this.objOne.css('width', left);
            this.objTwo.css('left', left + 1);
            this.objSplit.css('left', left);
        } else {
            this.objOne.css('height', left);
            this.objTwo.css('top', left + 1);
            this.objSplit.css('top', left);
        }
    };
}var EWA_UI_Dock = {
	dockObj : null,
	dockTitleObj : null,
	menuMap : {},
	init : function (menus) {
		var ss = [ "<div class='ewa-dock'><table class='ewa-dock-table'><tr>" ];
		for ( var n in menus) {
			var menu = menus[n];
			var ref_id = EWA_Utils.tempId("_EWA_UI_Dock_");
			this.menuMap[ref_id] = menu;
			var txt = this.getMenuText(menu);
			var txt1 = this.filterHtml(txt);
			var s = "<td class='ewa-dock-item-td' ><div class='ewa-dock-item-div' id='" + ref_id + "' _title=\"" + txt1
					+ "\" onclick='EWA_UI_Dock.click(this)' onmouseover='EWA_UI_Dock.showTitle(this)' onmouseout='EWA_UI_Dock.hideTitle(this)'>"
					+ "<div class='ewa-dock-item-icon " + menu.ICON + "'></div></div></td>";
			ss.push(s);
		}
		ss.push("</tr></table></div>");
		this.dockObj = $(ss.join(""));

		var ss1 = '<div class="ewa-dock-title" style="display: none;"><div>--</div><p></p></div>';
		this.dockTitleObj = $(ss1);
		$('body').append(this.dockObj).append(this.dockTitleObj);
	},
	click : function (obj) {
		var menu = this.menuMap[obj.id];
		if(!menu){
			console.log('menu ['+obj.id+']?')
		}
		if(!menu.CMD){
			console.log('NO CMD in menu' , menu);
			return;
		}
		if(menu.CMD instanceof Function){
			menu.CMD(obj); 
		} else { //字符串调用
			eval(menu.CMD);
		}
	},
	getMenuText : function (menu) {
		return menu.TEXT;
	},
	filterHtml : function (s) {
		return s.replace(/</ig, "&lt;").replace(/>/ig, "&gt;").replace(/"/ig, "&quot;")
	},
	showTitle : function (obj) {
		if (obj.getAttribute('_title') == "" || obj.getAttribute('_title') == null) {
			var ttt = obj.title;
			if (ttt == "" || ttt == null) {
				return;
			}
			obj.setAttribute("_title", ttt);
			obj.title = "";
		}
		this.dockTitleObj.find("div:eq(0)").html(obj.getAttribute('_title'));

		var p = $(obj).offset();
		var w = $(obj).width();
		var h = this.dockTitleObj.height();
		var w1 = this.dockTitleObj.width();

		this.dockTitleObj.css('top', p.top - h - 8);
		this.dockTitleObj.show();
		this.dockTitleObj.css('left', p.left - (w1 - w) / 2);

	},
	hideTitle : function () {
		this.dockTitleObj.hide();
	}
};/**
 * 提交后的行为
 */
var EWA_Behavior = {};
EWA_Behavior.RELOAD_PARENTA = function(frameUnid) {
	var win = window.parent;
	try {
		if (win.EWA.F.FOS[frameUnid] && win.EWA.F.FOS[frameUnid].Reload) {
			win.EWA.F.FOS[frameUnid].Reload();
		} else {
			win.location = win.location.href;
		}
	} catch (e) {
		win.location = win.location.href;
	}
};
/**
 * 刷新父体列表的内容
 */
EWA_Behavior.RELOAD_PARENT = function(frameUnid) {
	if (window._EWA_DialogWnd == null) {
		return;
	}
	var win = _EWA_DialogWnd._OpenerWindow;
	if (win.EWA.F.FOS == null) {
		_EWA_DialogWnd.CloseWindow();
		win.location.href = win.location.href;
		return;
	}
	try {
		if (win.EWA.F.FOS[frameUnid] && win.EWA.F.FOS[frameUnid]) {
			// 参数url用于列表判断重新加载来源的调用 2019-03-01
			var url = window.location.href;
			win.EWA.F.FOS[frameUnid].Reload(url);
		} else {
			win.location = win.location.href;
		}
	} catch (e) {
		win.location = win.location.href;
	}
};
/**
 * 关闭自身的对话框
 */
EWA_Behavior.CLOSE_SELF = function() {
	if (window._EWA_DialogWnd == null) {
		self.close();
		return;
	}
	_EWA_DialogWnd.CloseWindow();
}
/**
 * 清除自身form的内容
 */
EWA_Behavior.CLEAR_SELF = function() {
	self.document.forms[0].reset();
};

/**
 * Frame提交后，刷新父体（ListFrame或其它）的数据
 * 
 * @param postBehavior
 * @param frameUnid
 *            父体的EWA对象 (EWA.F.FOS[frameUnid])
 * @returns
 */
function EWA_PostBehavior(postBehavior, frameUnid) {
	if (postBehavior.indexOf('RELOAD_PARENTA') < 0) {
		try {
			if (!window._EWA_DialogWnd) {
				console.log('not parent window');
				return;
			}

			if (window.STOP_RELOAD) {
				window.STOP_RELOAD = false;
				return;
			}

			var w = _EWA_DialogWnd._OpenerWindow;
			var o = w.__Dialog[frameUnid];

			if (o && o.AfterMsg != null && o.AfterMsg.length > 0) {
				w.EWA.UI.Msg.Alert(o.AfterMsg, _EWA_INFO_MSG['EWA.SYS.CHOOSE_ITEM_TITLE']);
			}
		} catch (e) {
			console.log(e);
		}
	}
	var behaviors = postBehavior.split(",");
	for (var i = 0; i < behaviors.length; i = i + 1) {
		EWA_Behavior[behaviors[i]](frameUnid);
	}
};/**
 * add new function
 */
EWA.UI.Ext = EWA.UI.Ext || {};

EWA.UI.Ext.initExtsMap = function() {
	if (this.mapImg) {
		return;
	}
	this.mapImg = { "def": "Edit.png" }; // 默认图片
	this.mapIcon = { "def": "fa fa-file-text-o" }; // 默认图标

	let me = this;
	function addMaps(exts, img, icon) {
		var arr = exts.split(",");
		for (let n in arr) {
			let ext = arr[n].trim().toLowerCase();
			me.mapImg[ext] = img;
			me.mapIcon[ext] = icon;
		}
	}

	addMaps(".doc,.docx,.rtf", "MSWD.png", "fa fa-file-word-o ewa-file-ext-color-word");
	addMaps(".xls,.xlsx", "XCEL.png", "fa fa-file-excel-o ewa-file-ext-color-excel");
	addMaps(".ppt,.pptx", "PPT3.png", "fa fa-file-powerpoint-o ewa-file-ext-color-powerpoint");
	addMaps(".txt,.cvs,.pom", "Edit.png", "fa fa-file-text-o ewa-file-ext-color-text");
	addMaps(".pdf", "ACR_App.png", "fa fa-file-pdf-o ewa-file-ext-color-pdf");
	addMaps(".7z,.zip,.rar,.arc,.gz,.tar", "zip.png", "fa fa-file-zip-o ewa-file-ext-color-zip");
	addMaps(".odt", "openoffice.png", "fa fa-file-text-o ewa-file-ext-color-text");
	addMaps(".html,.htm", "html.png", "fa fa-internet-explorer ewa-file-ext-color-html");
	addMaps(".mp3,.wav,.mid,.m4a,.oga,.flac,.weba,.opus,.ogg", "mp3.png", "fa fa-file-audio-o ewa-file-ext-color-audio");
	addMaps(".mp4,.mov,.flv,.vod,.ogm,.ogv,.wmv,.mpg,.mpeg,.m4v,.avi,.asx,.webm", "vod.png", "fa fa-file-video-o ewa-file-ext-color-video");
	addMaps(".jpg,.jpeg,.jiff,jfif,.png,.bmp,.webp,.tiff,.avif", "vod.png", "fa fa-file-image-o ewa-file-ext-color-image");
}
/**
 * 获取文件图标
 */
EWA.UI.Ext.getFileIco = function(ext) {
	this.initExtsMap();
	var path = (EWA.RV_STATIC_PATH || '/EmpScriptV2') + "/EWA_STYLE/images/file_png/";

	if (ext == null) {
		ext = "";
	}
	ext = ext.toLowerCase();
	if (ext.indexOf('.') < 0) {
		ext = "." + ext;
	}

	if (this.mapImg[ext]) {
		return path + this.mapImg[ext];
	} else {
		return path + this.mapImg.def; // 默认图片
	}
};
EWA.UI.Ext.FileIco = EWA.UI.Ext.getFileIco;
EWA.UI.Ext.getFileIcon = function(ext) {
	this.initExtsMap();

	if (ext == null) {
		ext = "";
	}
	ext = ext.toLowerCase();
	if (ext.indexOf('.') < 0) {
		ext = "." + ext;
	}

	if (this.mapIcon[ext]) {
		return this.mapIcon[ext];
	} else {
		return this.mapIcon.def; // 默认图标
	}
};
/**
 * 获取文件扩展名
 */
EWA.UI.Ext.FileExt = function(filename) {
	if (filename == null) {
		return "";
	}
	var fn = filename.toLowerCase();
	var loc = fn.lastIndexOf('.');
	var ext = "";
	if (loc > 0) {
		ext = fn.substring(loc);
	}
	return ext;
}
/**
 * 获取文件字节描述
 */
EWA.UI.Ext.getFileLen = function(v, precision) {
	if (v == null || isNaN(v)) {
		return v || "";
	}
	// 返回的计算精度
	if (precision == null || isNaN(precision)) {
		precision = 0;
	}
	if (v >= 1024 * 1024 * 1024 * 1024) {
		let v1 = v / (1024 * 1024 * 1024 * 1024);
		return v1.fm(precision) + "T";
	} else if (v >= 1024 * 1024 * 1024) {
		let v1 = v / (1024 * 1024 * 1024);
		return v1.fm(precision) + "G";
	} else if (v >= 1024 * 1024) {
		let v1 = v / (1024 * 1024);
		return v1.fm(precision) + "M";

	} else if (v >= 1024) {
		let v1 = v / (1024);
		return v1.fm(precision) + "K";
	} else {
		return v + "B";
	}
};
EWA.UI.Ext.FileLen = EWA.UI.Ext.getFileLen;
/**
 * 手机
 */
EWA.UI.Ext.Mobile = function(obj) {
	if (!obj) {// input
		return;
	}
	var id = obj.id || 'R' + Math.random();
	obj.id = id;
	var newid = '__mobile_' + id;
	$(obj).attr('mobile_id', newid);
	if (!$X(newid)) {
		var ss = [];
		ss.push("<table class='ewa-text-help-box' border=0 cellpadding=3 cellspacing=0 id='" + newid + "'>");
		ss.push("<tr><td>");
		ss.push(EWA.UI.Ext.IdCard1(3));
		ss.push("</td><td>-</td><td>");
		ss.push(EWA.UI.Ext.IdCard1(4));
		ss.push("</td><td>-</td><td>");
		ss.push(EWA.UI.Ext.IdCard1(4));
		ss.push("</td><td><i></i></td></tr></table>");

		$('body').append(ss.join(""));
		var o = $X(newid);
		$(o).find('td').css('background-color', '#fff').attr('align', 'center');
		$(obj).attr('maxLength', 11);
	}

	var o = $X(newid);
	addEvent(obj, 'focus', function() {
		var id1 = $(this).attr('mobile_id');
		var oo = $($X(id1)).show();
		oo.css('top', $(this).offset().top - oo.height() - 7);
		oo.css('left', $(this).offset().left);
		EWA.UI.Ext.Mobile2(this);
	});
	addEvent(obj, 'blur', function() {
		var id1 = $(this).attr('mobile_id');
		var oo = $($X(id1)).hide();
	});
	addEvent(obj, 'keyup', function() {
		EWA.UI.Ext.Mobile2(this)
	});
};
EWA.UI.Ext.Mobile2 = function(obj) {
	var id1 = $(obj).attr('mobile_id');
	var oo = $($X(id1));
	var v = obj.value;
	var divs = oo.find('div');
	divs.html("");
	var isok = true;
	for (var i = 0; i < v.length; i++) {
		var c = v.substring(i, i + 1);
		var color = '';
		if (isNaN(c)) {
			color = 'red';
			isok = false;
		}
		if (divs[i]) {
			divs[i].innerHTML = "<span style='font-size:16px;color:" + color + "'>" + c + "</span>";
		}
	}

	if (v.length == divs.length && isok) {
		oo.find('i').html("<font color=green>正确</font>");
	} else {
		oo.find('i').html("<font color=red>错误</font>");
	}
};
/**
 * 辅助身份证输入
 */
EWA.UI.Ext.IdCard = function(obj) {
	if (!obj) {// input
		return;
	}
	var id = obj.id || 'R' + Math.random();
	obj.id = id;
	var newid = '__sfz_' + id;
	$(obj).attr('sfz_id', newid);
	if (!$X(newid)) {
		var ss = [];
		ss.push("<table class='ewa-text-help-box' border=0 cellpadding=1 cellspacing=1 id='" + newid + "'>");
		ss.push("</tr><td height=18>地区</td><td >年</td><td>月</td><td>日</td><td>顺序号</td></tr>");
		ss.push("<tr><td>");
		ss.push(EWA.UI.Ext.IdCard1(6));
		ss.push("</td><td>");
		ss.push(EWA.UI.Ext.IdCard1(4));
		ss.push("</td><td>");
		ss.push(EWA.UI.Ext.IdCard1(2));
		ss.push("</td><td>");
		ss.push(EWA.UI.Ext.IdCard1(2));
		ss.push("</td><td>");
		ss.push(EWA.UI.Ext.IdCard1(4));
		ss.push("</td></tr><tr><td colspan=5>状态 <i></i></td></tr></table>");

		$('body').append(ss.join(""));

		var o = $X(newid);
		$(o).find('td').css('background-color', '#fff').attr('align', 'center');
		$(obj).attr('maxLength', 18);
	}

	var o = $X(newid);
	addEvent(obj, 'focus', function() {
		var id1 = $(this).attr('sfz_id');
		var oo = $($X(id1)).show();
		oo.css('top', $(this).offset().top - oo.height() - 8);
		oo.css('left', $(this).offset().left);
		EWA.UI.Ext.IdCard2(this);
	});
	addEvent(obj, 'blur', function() {
		var id1 = $(this).attr('sfz_id');
		var oo = $($X(id1)).hide();
	});
	addEvent(obj, 'keyup', function() {
		EWA.UI.Ext.IdCard2(this)
	});
};
EWA.UI.Ext.IdCard1 = function(len) {
	var cc = "<div></div>";
	var ss = [];
	for (var i = 0; i < len; i++) {
		ss.push(cc);
	}
	return ss.join('');
};
EWA.UI.Ext.IdCard2 = function(obj) {
	var mm = [1, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
	var id1 = $(obj).attr('sfz_id');
	var oo = $($X(id1)).show();
	var v = obj.value;
	var divs = oo.find('div');
	divs.html("");
	var isok = true;
	var dq = [];
	var year = [];
	var month = [];
	var day = [];
	for (var i = 0; i < v.length; i++) {
		var c = v.substring(i, i + 1);
		var color = '';
		if (i < 6) {
			dq.push(c);
		} else if (i >= 6 && i < 10) {
			year.push(c);
		} else if (i >= 10 && i < 12) {
			month.push(c);
		} else if (i >= 12 && i < 14) {
			day.push(c);
		}
		if (i < 17) {
			if (isNaN(c)) {
				color = 'red';
				isok = false;
			}
		} else {
			if (!(c == 'x' || c == 'X' || !isNaN(c))) {
				color = 'red';
				isok = false;
			}
		}
		if (divs[i]) {
			divs[i].innerHTML = "<span style='font-size:16px;color:" + color + "'>" + c + "</span>";
		}
	}
	var year1 = year.join('');
	var msg = [];
	if (!isNaN(year1)) {
		if (year1 < 1900 || year1 > 2100) {
			isok = false;
			for (var i = 6; i < 10; i++) {
				$(divs[i]).find('span').css('color', 'red');
			}
			msg.push("年:" + year1);
		}
		if ((year1 - 1996) % 4 == 0) { // 闰年
			mm[2] = 29;
		} else {
			mm[2] = 28;
		}
	} else {
		isok = false;
		msg.push("年:" + year1);
	}

	var month1 = month.join('');
	ismonth1 = true;
	if (!isNaN(month1)) {
		if (month1 < 1 || month1 > 12) {
			isok = false;
			ismonth1 = false;
			for (var i = 10; i < 12; i++) {
				$(divs[i]).find('span').css('color', 'red');
			}
			msg.push("月:" + month1);
		}
	} else {
		ismonth1 = false;
		isok = false;
		msg.push("月:" + month1);
	}
	var day1 = day.join('');
	if (!isNaN(day1)) {
		if (ismonth1 && (day1 < 1 || day1 > mm[month1 * 1])) {
			isok = false;
			for (var i = 12; i < 14; i++) {
				$(divs[i]).find('span').css('color', 'red');
			}
			msg.push("日:" + day1);
		}
	} else {
		isok = false;
	}
	if (v.length == divs.length && isok) {
		oo.find('i').html("<font color=green>正确</font>");
		var json = {
			YEAR: year1,
			MONTH: month1,
			DAY: day1,
			SEX: $(divs[16]).text() * 1 % 2
			// 0:female, 1: male
		};
		$(obj).attr('sfz_json', JSON.stringify(json));
	} else {
		oo.find('i').html("<font color=red>" + msg.join(", ") + "错误</font>");
	}
};

// if ($X('BAS_APP_NATIONAL_ID')) {
// sfz($X('BAS_APP_NATIONAL_ID'));
// }
