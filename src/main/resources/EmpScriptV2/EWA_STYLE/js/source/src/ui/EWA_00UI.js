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
};