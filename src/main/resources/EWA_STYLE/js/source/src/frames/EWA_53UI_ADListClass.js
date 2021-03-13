/**
 * 轮播图片广告
 */
function EWA_UI_ADListClass() {
    this._TimeOut = 3000; // 3s
    this._Width = 515;
    this._Height = 223;
    this._List = [];
    this._Object = null;
    this._CurIndex = 0;
    this._GotoIndex = -1;
    this.ClassName = null;
    this.Timer = -1;
    this._CssSize = "";
    this.IsAutoPaly = true; // 默认自动播放

    this.SetSize = function(w, h) {
        this._Width = w;
        this._Height = h;

        var cssSize = "width:" + this._Width + (isNaN(this._Width) ? "" : 'px') + ";height:" + this._Height
        + (isNaN(this._Height) ? "" : 'px');
        this._CssSize = cssSize;
    }

    /**
     * 增加广告
     * 
     * @param {String}
     *            imgUrl 图片地址
     * @param {String}
     *            adUrl 广告地址
     * @param {String}
     *            adText 显示文字
     * @param {String}
     *            target 链接目标，默认是新开窗口
     */
    this.AddAd = function(imgUrl, adUrl, adText, target) {
        var o = {};
        o.ImgUrl = imgUrl;
        o.AdUrl = adUrl;
        o.AdText = adText;
        o.Target = target;

        this._List.push(o);
    }
    this.Change = function() {
        window.clearTimeout(this.Timer);
        var imgs = this._Object.getElementsByTagName('a');
        var tr = this._Object.getElementsByTagName('table')[0].rows[0];
        tr.cells[1].childNodes[this._CurIndex].style.backgroundColor = '#000';
        tr.cells[1].childNodes[this._CurIndex].style.color = '#fff';

        var objOut = imgs[this._CurIndex];
        if (this._GotoIndex == -1) {
            this._CurIndex++;
            if (this._CurIndex == this._List.length) {
                this._CurIndex = 0;
            }
        } else {
            this._CurIndex = this._GotoIndex;
            this._GotoIndex = -1;
        }
        var objIn = imgs[this._CurIndex];
        tr.cells[1].childNodes[this._CurIndex].style.backgroundColor = 'white';
        tr.cells[1].childNodes[this._CurIndex].style.color = '#000';

        EWA.UI.Utils.FadeIn(objIn, objOut, 10, 80, this);
    }
    this.ChangeAfter = function() {
        var tr = this._Object.getElementsByTagName('table')[0].rows[0];
        var a = tr.cells[0].childNodes[0];
        a.innerHTML = this._List[this._CurIndex].AdText;
        a.href = this._List[this._CurIndex].AdUrl;
        a.target = this._List[this._CurIndex].Target;

        if (this.IsAutoPaly) {
            window.clearTimeout(this.Timer);
            this.Timer = window.setTimeout(this.ClassName + '.Change()', this._TimeOut);
        }
    }

    this.CreateByUrl = function(url, pId) {
        this._ParentId = pId;
        EWA.UI.Utils.FADE_AJAX = new EWA.C.Ajax();
        EWA.UI.Utils.FADE_AJAX.Get(url, eval(this.ClassName + '.AjaxCallBack'));
        EWA.UI.Utils.FADE = this;
    // EWA.UI.Utils.FADE_AJAX.HiddenWaitting();
    }

    this.AjaxCallBack = function() {
        var ajax = EWA.UI.Utils.FADE_AJAX;
        if (ajax._Http.readyState != 4) {
            ajax = null;
            return;
        }
        ajax.HiddenWaitting();
        if (ajax._Http.status == 200) {
            var ret = ajax._Http.responseText;
            EWA.UI.Utils.FADE._List = eval(ret);
            EWA.UI.Utils.FADE.Create();
        } else {
            alert("ERROR:\r\n" + ajax._Http.statusText);
        }
        ajax = null;
        EWA["SHOW_ERROR"] = true; // 默认提示错误
    }

    this.Create = function(pId) {
        if (pId == null) {
            pId = this._ParentId;
        }
        var parent = $X(pId);
        if (parent == null) {
            alert('ID(' + pId + ') Not Exists!');
            return;
        }

        var o = document.createElement('DIV');
        o.style.width = this._Width + (isNaN(this._Width) ? "" : 'px');
        o.style.height = this._Height + (isNaN(this._Height) ? "" : 'px');
        o.style.overflow = 'hidden';
        var s = [];
        s.push('<div style="position: relative;' + this._CssSize + '">' + '<div style="z-index:0;position: absolute;'
            + this._CssSize + '"></div>');

        s.push('<div style="position: absolute; height: 20px; width: ' + this._Width + 'px; left: 0px; top:'
            + (this._Height - 22) + 'px; border: 1px black solid; ' + 'background-color: #000; filter: Alpha(Opacity=20); '
            + 'opacity: 0.2;z-index:1"></div>');
        s.push('<table style="z-index:2;position:absolute;height:20px; width:' + this._Width + (isNaN(this._Width) ? "" : "px")
            + '; left: 0px;top:' + (this._Height - 22) + 'px; font-size: 12px;'
            + 'color: white" cellpadding="0" cellspacing="0"><tr>' + '<td align="center"><a style="color:white"></a></td>'
            + '<td style="width:' + this._List.length * 24 + 'px;"></td></tr></table>');
        s.push('</div>');
        o.innerHTML = s.join('');
        parent.innerHTML = '';
        parent.appendChild(o);
        this._Object = o;

        this._CreateList();
        this.ChangeAfter();
    }

    this._CreateList = function() {
        var s = [];
        var tb = this._Object.getElementsByTagName('table')[0];
        var td = tb.rows[0].cells[1];

        var icon_css = "filter:Alpha(Opacity=70);width: 18px; height: 18px; float: left; "
            + "text-align: center; color: #fff; margin-right: 2px; font-family: arial; "
            + "cursor: pointer; opacity: 0.7; border-radius: 9px;line-height: 18px; background-color: #000;";
        for (var i = 0; i < this._List.length; i++) {
            var ad = this._List[i];
            var o = document.createElement('div');
            o.style.cssText = icon_css;
            o.innerHTML = (i + 1);
            td.appendChild(o);
            o.setAttribute('instancename', this.ClassName);
            o.onclick = function() {
                var instance = eval('window.' + this.getAttribute('instancename'));
                window.clearTimeout(instance.Timer);
                instance._GotoIndex = this.innerHTML * 1 - 1;
                instance.Change();
            }

            var img = document.createElement('div');
            var css_img = "background-image:url('"
                + ad.ImgUrl
                + "');  "
                + this._CssSize
                + ";background-repeat: no-repeat; background-size: cover;-moz-background-size: cover;-webkit-background-size: cover;background-position: center center;";

            img.style.cssText = css_img;
            // img.src = ad.ImgUrl;
            img.title = ad.AdText;
            var a = document.createElement('a');
            a.style.cssText = this._CssSize;
            a.style.position = 'absolute';
            a.style.top = '0em';
            a.style.left = '0em';
            if (i > 0) {
                a.style.display = 'none';
            }
            a.style.zIndex = i;
            a.href = ad.AdUrl;
            a.target = ad.Target == null ? '_blank' : ad.Target;
            a.appendChild(img);
            this._Object.childNodes[0].childNodes[0].appendChild(a);
        // a.style.display = 'none';
        }
    }
}

function EWA_UI_ADFlagClass() {
    this._ClassName = null;
    this._List = [];
    this._Ads = [];
    /**
     * 添加广告
     * 
     * @param {}
     *            imgSrc 图片地址
     * @param {}
     *            url 链接地址
     * @param {}
     *            top 上
     * @param {}
     *            left 左
     * @param {}
     *            imgWidth 图片宽度
     * @param {}
     *            imgHeight 高度
     * @param {}
     *            isformCenter 是否从中心向左右辐射
     */
    this.AddAd = function(imgSrc, url, top, left, imgWidth, imgHeight, isformCenter) {
        var o = {};
        o["IMG_SRC"] = imgSrc;
        o["URL"] = url;
        o["TOP"] = top;
        o["LEFT"] = left;
        o["IMG_WIDTH"] = imgWidth;
        o["IMG_HEIGHT"] = imgHeight;
        o["IS_FROM_CENTER"] = isformCenter;
        this._List.push(o);
    }

    this.Create = function(isFlow) {
        for (var i = 0; i < this._List.length; i++) {
            this._CreateObj(this._List[i]);
        }
        if (isFlow) {
            var inst = this;
            document.onscroll = function() {
                var dy;
                if (typeof window.pageYOffset != 'undefined') {
                    dy = window.pageYOffset;
                } else if (typeof document.compatMode != 'undefined' && document.compatMode != 'BackCompat') {
                    dy = document.documentElement.scrollTop;
                } else if (typeof document.body != 'undefined') {
                    dy = document.body.scrollTop;
                }
                for (var i = 0; i < inst._Ads.length; i++) {
                    inst._Ads[i].style.top = inst._List[i]["TOP"] * 1 + dy + 'px';
                }
            }
        }
    }

    this._CreateObj = function(o) {
        var left = o["LEFT"] * 1;
        if (o["IS_FROM_CENTER"]) { // 从中心向左右辐射
            var w = window.document.body.offsetWidth;
            left = w / 2 + left;
        }
        var obj = document.createElement("div");
        obj.style.position = 'absolute';
        obj.style.left = left + 'px';
        obj.style.top = o["TOP"] + 'px';
        obj.style.width = o["IMG_WIDTH"] + 'px';
        obj.style.height = o["IMG_HEIGHT"] + 'px';
        var s = "<a href='" + o["URL"] + "' target='_blank'><img src='" + o["IMG_SRC"] + "' border='0' width='" + o["IMG_WIDTH"]
            + "px' height='" + o["IMG_HEIGHT"] + "px' /></a>";
        s += "<div style='cursor:pointer;font-size:12px;text-align:right;padding-top:2px'"
            + " onclick='this.parentNode.style.display=\"none\"'>关闭</div>"
        obj.innerHTML = s;
        document.body.appendChild(obj);

        this._Ads.push(obj);
    }
}