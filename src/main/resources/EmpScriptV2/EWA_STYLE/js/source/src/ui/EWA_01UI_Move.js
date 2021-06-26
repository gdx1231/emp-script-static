/**
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
}