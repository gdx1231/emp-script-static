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
}