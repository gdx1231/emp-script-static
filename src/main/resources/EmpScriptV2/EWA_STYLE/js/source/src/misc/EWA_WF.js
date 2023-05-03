/**
 * Workflow defined
 */
var EWAC_WfOrg = function () {
    this.Depts = {};
    this.Posts = {};
    this.Users = {};

    this.GetMaster = function (usrId) {
        var u = this.Users[usrId];
        if (u == null) {
            console.log((EWA.LANG == 'enus' ? 'NONE of ' : '没有啊') + usrId);
            return;
        }
        var dep = u.Dept;

        for (var n in dep.Users) {
            var u1 = dep.Users[n];
            for (var n1 in u1.Posts) {
                var p = u1.Posts[n1];
                if (p.IsMaster) {
                    return u1;
                }
            }
        }
        console.log(EWA.LANG == 'enus' ? '	No manager' : '没有管理者');
    }

    this.IsMaster = function (usrId) {
        var u = this.GetMaster(usrId);
        if (u == null) {
            return false;
        }
        return u.Id == usrId;
    }

    this.InitDepts = function (datas, depId, depName, depLvl, depOrd, depPid) {
        for (var i = 0; i < datas.length; i++) {
            var d = datas[i];
            var deptId = d[depId];
            if (this.Depts[deptId] != null) {
                continue;
            }
            var dept = {};
            dept.Id = d[depId];
            dept.Name = d[depName];
            dept.Lvl = d[depLvl];
            dept.Ord = d[depOrd];
            dept.Pid = d[depPid];
            dept.Posts = {};
            dept.Users = {};
            dept.Children = {};
            this.Depts[dept.Id] = dept;
        }

        for (var n in this.Depts) {
            var d = this.Depts[n];
            if (this.Depts[d.Pid]) {
                var p = this.Depts[d.Pid];
                d.Parent = p;
                p.Children[d.Id] = d;
            } else {
                if (this.DeptRoot == null) {
                    this.DeptRoot = d;
                }
            }
        }
    }

    this.InitPosts = function (datas, posId, posName, posIsMaster, depId) {
        for (var i = 0; i < datas.length; i++) {
            var d = datas[i];
            var postId = d[posId];
            if (this.Posts[postId] != null) {
                continue;
            }
            var post = {};
            post.Id = postId;
            post.Name = d[posName];
            post.DeptId = d[depId];
            var master = d[posIsMaster];
            master = master == null ? "" : master.trim().toLowerCase();
            if (master == "y" || master == "yes" || master == "true" || master == "1") {
                post.IsMaster = true;
            } else {
                post.IsMaster = false;
            }

            if (this.Depts[post.DeptId]) {
                post.Dept = this.Depts[post.DeptId];
                if (post.Dept.Posts[post.Id] == null) {
                    post.Dept.Posts[post.Id] = post;
                }
            }
            this.Posts[postId] = post;
        }
    }

    this.InitUsers = function (datas, userId, userName, depId, posId) {
        for (var i = 0; i < datas.length; i++) {
            var d = datas[i];
            var uId = d[userId];
            var u;
            if (this.Users[uId] != null) {
                u = this.Users[uId];
            } else {
                u = {};
                u.Id = uId;
                u.Name = d[userName];
                u.DeptId = d[depId];
                u.Posts = {};
                if (this.Depts[u.DeptId]) {
                    u.Dept = this.Depts[u.DeptId];
                    if (u.Dept.Users[u.Id] == null) {
                        u.Dept.Users[u.Id] = u;
                    }
                }
                this.Users[uId] = u;
            }
            var userPostId = d[posId];

            if (this.Posts[userPostId]) {
                u.Posts[userPostId] = this.Posts[userPostId];
            }
        }
    }
};
(function () {
    var ss = [];
    ss
        .push("<table gdx=\"LINE\" style=\"border-collapse: collapse;width:100%;height:100%;font-size:0px\" cellspacing=\"0\" cellpadding=\"0\"><tr>");
    ss.push("<td style=\"font-size: 1px; width: 50%;\" valign=\"top\">&nbsp;</td>");
    ss.push("<td style=\"font-size: 1px;\" valign=\"top\">&nbsp;</td></tr>");
    ss.push("<tr><td style=\"font-size: 1px\" valign=\"bottom\">&nbsp;</td>");
    ss.push("<td style=\"font-size: 1px;\" valign=\"bottom\">&nbsp;</td></tr></table>");
    EWAC_WF_CNN_TMP = ss.join("");
})();

function EWAC_WfUnit(id) {
    this.Id = id;
    this.Type = "normal";
    this.IsSelected = false;
    this.tagName = 'wfunit';

    this.CnnsFrom = {}; // 连接来源
    this.CnnsFromLength = 0;
    this.CnnsTo = {}; // 连接目标
    this.CnnsToLength = 0;
    this.IsDelete = false;
    this.ChangeType = function (type) {
        var obj = $X(this.Id);
        var css = 'ewa_wf_unit_img';
        if (type == 'control') {
            css = 'ewa_wf_unit_img1';
        } else if (type == 'end') {
            css = 'ewa_wf_unit_img2';
        }
        obj.getElementsByTagName('img')[0].className = css;
    }
    this.ChangeDes = function (des) {
        var obj = $X(this.Id);
        SetInnerText(obj.getElementsByTagName('td')[1].childNodes[0], des);
    };
    this.GetDes = function () {
        return GetInnerText($X(this.Id).getElementsByTagName('span')[0]).trimEx();
    };
    this.Delete = function () {
        if (!this.IsDelete) {
            for (var id in this.CnnsFrom) {
                this.CnnsFrom[id].Delete();
            }
            for (var id in this.CnnsTo) {
                this.CnnsTo[id].Delete();
            }
            var obj = $X(this.Id);
            obj.parentNode.removeChild(obj);
        }
        this.IsDelete = true;
    }
    this.Log = function (adm, date, text) {
        var imgSrc = EWA.RV_STATIC_PATH == null ? EWA.CP : EWA.RV_STATIC_PATH;
        imgSrc += "/EWA_STYLE/";
        var obj = $X(this.Id);
        var img = obj.getElementsByTagName('img')[0];
        // img.style.display = 'none';
        img.src = imgSrc + "images/workflow/wf_ok.png?a=1";
        img.style.width = '38px';
        img.style.height = '38px';
        img.className = '';
        var o = img.nextSibling;
        if (text != null && text.trim().length > 0) {
            obj.title = text;
        }
        var dt = "";
        try {
            var aa = new EWA_Utils.Date(date);
            // 中英文转换
            dt = aa.FormatDate();
        } catch (e) {

        }
        o.innerHTML += '<div style="font-size:9px;color:darkblue">' + adm + '<br><nobr>' + dt + '</nobr></div>';
        obj.style.backgroundColor = 'lightyellow'
    }
    this.LogCur = function (pid) {
        var obj = $X(this.Id);
        var img = obj.getElementsByTagName('img')[0];

        var o = img.nextSibling;

        var parentObj = null;
        if (pid && window.parent && window.parent.$X(pid)) {
            parentObj = window.parent.$X(pid);
            parentObj.options.length = 0;
            parentObj.options[parentObj.options.length] = new Option('', '');
        }

        var isEnd = true;
        for (var n in this.CnnsFrom) {
            isEnd = false;
            var cnn = this.CnnsFrom[n];
            if (cnn.IsStop) {
                continue;
            }
            cnn.Selected();
            var unitTo = EWAC_WfUtil["WF"].Units[cnn.To];
            unitTo.LogTo();
            if (parentObj) {
                parentObj.options[parentObj.options.length] = new Option(unitTo.GetDes(), unitTo.Id);
            }
        }
        img.style.width = '38px';
        img.style.height = '38px';
        img.className = '';
        var imgSrc = EWA.RV_STATIC_PATH == null ? EWA.CP : EWA.RV_STATIC_PATH;
        imgSrc += "/EWA_STYLE/";
        if (isEnd) {
            if (EWA.LANG == 'enus') {
                o.innerHTML += '<i><b>Finished</b></i>';
            } else {
                o.innerHTML += '<i><b>执行结束</b></i>';
            }
            // parentObj.parentNode.innerHTML = o.innerHTML;
            img.src = imgSrc + "images/workflow/wf_no.png?A=1";

        } else {
            if (EWA.LANG == 'enus') {
                o.innerHTML += '<i><b>Current</b></i>';
            } else {
                o.innerHTML += '<i><b>当前节点</b></i>';
            }
            if (parentObj && parentObj.options.length == 2) {
                parentObj.selectedIndex = 1;
            }
            obj.style.backgroundColor = 'lightblue';
            obj.style.color = 'white';
            img.src = imgSrc + "images/workflow/wf_cur.png?A=1";
        }
    }
    this.LogTo = function () {
        var imgSrc = EWA.RV_STATIC_PATH == null ? EWA.CP : EWA.RV_STATIC_PATH;
        imgSrc += "/EWA_STYLE/";
        var obj = $X(this.Id);
        obj.style.backgroundColor = 'lightyellow'
        var img = obj.getElementsByTagName('img')[0];
        img.src = imgSrc + "images/workflow/wf_next.png?A=2";
        img.style.width = '38px';
        img.style.height = '38px';
        img.className = '';
    }
    this.Create = function (CurID) {
        var obj = EWAC_WfUtil["CUR_OBJ"];

        var tb = document.createElement('TABLE');
        tb.id = this.Id;
        tb.className = 'ewa_wf_box';

        var tr = tb.insertRow(-1);
        var td = tr.insertCell(-1);
        var imgSrc = EWA.RV_STATIC_PATH == null ? EWA.CP : EWA.RV_STATIC_PATH;
        imgSrc += "/EWA_STYLE/";
        td.innerHTML = '<img style="cursor:pointer" class="ewa_wf_unit_img" src="' + imgSrc
            + '/images/transparent.png" id="Atom_Img_' + id + '"><div a=1></div>';
        td.align = 'center';

        tr = tb.insertRow(-1);
        td = tr.insertCell(-1);
        td.align = 'center';
        td.innerHTML = '<span onselectstart="return true" onkeypress="EWAC_WfUtil.AtomNameKeyPress(this)"'
            + ' onblur="EWAC_WfUtil.AtomChangedName(this)"' + ' ondblclick="EWAC_WfUtil.AtomChangeName(this)">业务元' + CurID
            + '</span>';

        document.body.appendChild(tb);

        tb.style.position = 'absolute';
        tb.style.left = obj ? obj.style.left : CurID * 120 + 'px';
        tb.style.top = obj ? obj.style.top : '90px';

        // 回到原点
        if (obj) {
            obj.style.position = 'static';
        }
        tb = null;
    };
    this.MoveTo = function (dx, dy) {
        var obj = this.GetObj();
        obj.style.left = obj.style.left.replace('px', '') * 1 + dx + 'px';
        obj.style.top = obj.style.top.replace('px', '') * 1 + dy + 'px';

        // 显示连接
        for (var id in this.CnnsFrom) {
            if (!this.CnnsFrom[id].IsDelete) {
                this.CnnsFrom[id].Show();
                this.CnnsFrom[id].Disp();
            }
        }
        for (var id in this.CnnsTo) {
            if (!this.CnnsTo[id].IsDelete) {
                this.CnnsTo[id].Show();
                this.CnnsTo[id].Disp();
            }
        }
    };
    this.GetObj = function () {
        return $X(this.Id);
    };
    /**
     * 未选择
     */
    this.UnSelect = function () {
        var obj = $X(this.Id);
        obj.getElementsByTagName('img')[0].className = 'ewa_wf_unit_img';
        this.IsSelected = false;
        EWAC_WfUtil["SELECTED"] = null;
    };
    /**
     * 选中了
     */
    this.Selected = function () {
        var obj = $X(this.Id);
        obj.getElementsByTagName('img')[0].className = 'ewa_wf_unit_img1';
        this.IsSelected = true;
        EWAC_WfUtil["SELECTED"] = this;
    };
}
function EWAC_WfCnn() {
    this.IsSelect = false;
    this.Id = null;
    this.Type = null;
    this.From = null;
    this.To = null;
    this.tagName = 'wfcnn';
    this.IsDelete = false;

    this.ChangeStyle = function (color, width) {
        var obj = $X(this.Id);
        var tds = obj.getElementsByTagName('td');
        for (var i = 0; i < tds.length; i++) {
            var td = tds[i];
            // uncomplete;
        }

    };
    this.Delete = function () {
        var obj = $X(this.Id);
        if (!this.IsDelete) {
            obj.parentNode.removeChild(obj);
        }
        this.IsDelete = true;
    }
    this._CreateObject = function (o1, o2) {
        var oo = document.createElement('div');
        oo.id = this.Id;
        oo.style.width = 10;
        oo.style.height = 10;
        oo.style.position = 'absolute';
        oo.style.zIndex = 0;
        oo.innerHTML = EWAC_WF_CNN_TMP;
        document.body.appendChild(oo);
    };

    this.Create = function (o1, o2) {
        var id = o1.Id + "G" + o2.Id;
        this.Id = id;
        this.From = o1.Id;
        this.To = o2.Id;

        o1.CnnsFrom[this.Id] = this;
        o1.CnnsFromLength++;

        o2.CnnsTo[this.Id] = this;
        o2.CnnsToLength++;

        this._CreateObject(o1, o2);

        this.Show();
    }

    this.Show = function () {
        var objLine = $X(this.Id); // html element

        var o1 = $X(this.From); // html element
        var o2 = $X(this.To); // html element

        var x1L = o1.offsetLeft; // left
        var x1R = x1L + o1.offsetWidth; // left+width
        var y1T = o1.offsetTop; // top
        var y1B = y1T + o1.offsetHeight; // top+height

        var x2L = o2.offsetLeft; // left
        var x2R = x2L + o2.offsetWidth; // left+width
        var y2T = o2.offsetTop; // top
        var y2B = y2T + o2.offsetHeight; // top+height

        var type;
        var x, y, w, h, k = 0;
        if (x1R < x2L) { // o1的右边 < o2的左边
            x = x1R;
            w = x2L - x1R;
            if (y1B < y2T) {
                y = y1B;
                h = y2T - y1B;
                type = '0T,1L,3LBA';
            } else if (y1B > y2T && y1B < y2B) { // o1比o2高 ，但有交叉
                y = y1T;
                h = y2B - y1T;
                type = '0T,1L,3LBA';
            } else if (y1T > y2B) {
                y = y2B;
                h = y1T - y2B;
                type = '2B,3L,1LTA';
            } else {
                y = y2T;
                h = y1B - y2T;
                type = '2B,3L,1LTA';
            }
            type += '第一'
        } else if (x2R < x1L) {// o2的右边 > o1的左边
            x = x2R;
            w = x1L - x2R;
            if (y1B < y2T) {
                y = y1B;
                h = y2T - y1B;
                type = '1T,0R,2RBA';
            } else if (y1B > y2T && y1B < y2B) { // o2比o1高 ，但有交叉
                y = y1T;
                h = y2B - y1T;
                type = '2BA,3L,1LT';
            } else if (y1T > y2B) {
                y = y2B;
                h = y1T - y2B;
                type = '0TA,1L,3LB(三)';
            } else {
                y = y2T;
                h = y1B - y2T;
                type = '0TA,1L,3LB(四)';
            }
            type += '第二'
        } else if (x1L > x2L && x1L < x2R) {
            x = x2R;
            w = x1R - x2R + 20;
            if (y1B < y2T) {
                y = y1B;
                h = y2T - y1B;
                k = 20;
                type = '1TR,3RB,2BA(大)';
            } else {
                y = y2B;
                h = y1T - y2B;
                k = 20;
                type = '0TA,1TR,3RB(##)';
            }
        } else {
            x = x1R;
            w = x2R - x1R + 20;
            if (y1B < y2T) {
                y = y1B;
                h = y2T - y1B;
                k = 20;
                type = '0T,1TR,3RBA(士)';
            } else {
                y = y2B;
                h = y1T - y2B;
                k = 20;
                type = '1TRA,3RB,2B(#)';
            }
        }
        if (type == null) {
            type = '未发现'
        }
        document.title = type
        this.Drawline(type, x, y, w, h, k);
        this.Disp(1);

    };

    this.Drawline = function (type, x, y, w, h, k) {
        var obj = $X(this.Id);
        if (w < 0 || h < 0) {
            return;
        }
        obj.setAttribute('type', type);
        obj.style.left = x + 'px';
        obj.style.top = y + 'px';
        obj.style.height = h + 'px';
        obj.style.width = w + 'px';
        if (w == 0 || w - k < 0) {
            return;
        }
        var cell0 = obj.childNodes[0].rows[0].cells[0];
        var cell1 = obj.childNodes[0].rows[0].cells[1];
        if (k > 0) {
            cell1.style.width = k + 'px';
            cell0.style.width = (w - k) + 'px';

        } else {
            cell1.style.width = '50%';
            cell0.style.width = '50%';
        }
    }

    this.Disp = function (width, color) {
        var o1 = $X(this.Id);
        var w = width == null ? 1 : width;

        var o1Type = o1.getAttribute("type");
        var w0 = o1.getAttribute("w");

        // 类型和宽度一致
        if (1 > 2 && o1Type == o1.childNodes[0].getAttribute("type") && w0 == w) {
            return;
        }

        o1.childNodes[0].setAttribute("type", o1Type);
        o1.childNodes[0].setAttribute("w", w0);

        // 先隐藏所有元素
        var objs = o1.getElementsByTagName('img');
        while (objs.length > 0) {
            objs[0].parentNode.removeChild(objs[0])
            objs = o1.getElementsByTagName('img');
        }
        for (var i = 0; i < objs.length; i++) {
            objs[i].style.display = 'none';
        }

        objs = o1.getElementsByTagName('td');
        for (var i = 0; i < objs.length; i++) {
            objs[i].style.border = '0px';
        }
        var colour = color == null ? '#000' : color;
        var bd = colour + ' ' + w + 'px solid';
        var td;
        var tdIdx;
        for (var i = 0; i < o1Type.length; i++) {
            var c = o1Type.substring(i, i + 1);
            if (c.trim() == "") {
                continue;
            }
            if (!isNaN(c)) { // 数字
                td = objs[c * 1];
                tdIdx = c;
            } else if (c == 'T') {
                td.style.borderTop = bd;
            } else if (c == 'L') {
                td.style.borderLeft = bd;
            } else if (c == 'R') {
                td.style.borderRight = bd;
            } else if (c == 'B') {
                td.style.borderBottom = bd;
            } else if (c == 'A') { // arrow
                var arrow;
                if (tdIdx == 3) {
                    if (td.style.borderLeftWidth != '0px') {
                        arrow = 'arraw_t00.gif';
                        td.style.textAlign = 'right';
                    } else {
                        arrow = 'arraw_t01.gif';
                        td.style.textAlign = 'left';
                    }
                } else if (tdIdx == 2) {
                    arrow = 'arraw_t01.gif';
                    td.style.textAlign = 'left';
                } else if (tdIdx == 1) {
                    if (td.style.borderLeftWidth != '0px') {
                        arrow = 'arraw_t10.gif';
                        td.style.textAlign = 'right';
                    } else {
                        arrow = 'arraw_t11.gif';
                        td.style.textAlign = 'left';
                    }
                } else {
                    arrow = 'arraw_t11.gif';
                    td.style.textAlign = 'left';
                }
                var imgSrc = EWA.RV_STATIC_PATH == null ? EWA.CP : EWA.RV_STATIC_PATH;
                imgSrc += "/EWA_STYLE/";
                td.innerHTML = '<img src="' + imgSrc + 'images/workflow/' + arrow + '" />';
            }
        }

    };

    /**
     * 未选择
     */
    this.UnSelect = function () {
        this.Disp(1);
        this.IsSelected = false;
        EWAC_WfUtil["SELECTED"] = null;
    };
    /**
     * 选中了
     */
    this.Selected = function () {
        this.Disp(3);
        this.IsSelected = true;
        EWAC_WfUtil["SELECTED"] = this;
    };
}

function EWAC_Wf() {
    this.Ids = null; // 100个 GUNID
    this._CurIdx = 0;
    this.Units = {};
    this.Cnns = {};

    this.GetUnid = function () {
        var s = this.Ids[this._CurIdx];
        this._CurIdx++;
        return s;
    }
    /**
     * 加载100个GUNIDS
     */
    this._LodIds = function () {
        var c = this;
        var u = EWA.CP + "/EWA_DEFINE/cgi-bin/xml/?TYPE=GUNID&NUM=100";
        var ajax = new EWA_AjaxClass();
        ajax.Get(u, function () {
            if (!ajax.IsRunEnd()) {
                return;
            }
            eval('c.Ids=' + ajax.GetRst());
        });
    };
    /**
     * 清除所有选择
     */
    this.ClearSelects = function () {
        for (var id in this.Units) {
            this.Units[id].UnSelect();
        }
        EWAC_WfUtil["CUR_OBJ"] = null;
        EWAC_WfUtil["TWO"] = [null, null];
    };
    this.GetUnit = function (obj) {
        var id;
        if (obj.className == 'ewa_wf_box') {
            id = obj.id;
        } else if (obj.id.indexOf('Atom_Img_') > -1) {
            id = obj.id.replace('Atom_Img_', '');
        }
        if (id) {
            return this.Units[id];
        } else {
            return null;
        }
    };
    this.CreateUnit = function (id) {
        if (!id) {
            id = this.GetUnid();
        } else {

        }
        var unit = new EWAC_WfUnit(id);
        unit.Create(this._CurIdx);
        this.Units[id] = unit;
        var obj = EWAC_WfUtil["CUR_OBJ"];
        // unit.Move(obj.offsetLeft, obj.offsetHeight);
        return unit;
    };
    this.CreateCnn = function () {
        var o1 = EWAC_WfUtil["TWO"][0];
        var o2 = EWAC_WfUtil["TWO"][1];
        if (o1 == null || o2 == null) {
            alert("需要两个业务元");
            return;
        }
        var cnn = new EWAC_WfCnn();
        cnn.Create(o1, o2);
        this.Cnns[cnn.Id] = cnn;
    };
    this.GetCnn = function (obj) {
        return this.Cnns[obj.parentNode.id];
    };

}
var EWAC_WfUtil = {};

EWAC_WfUtil["CUR_OBJ"] = null;
EWAC_WfUtil["TWO"] = [null, null];
EWAC_WfUtil["SELECTED"] = null;

EWAC_WfUtil["MouseDown"] = function (evt) {
    var e = evt ? evt : event;
    var target = EWA.B.IE ? e.srcElement : e.target;
    var tagName = target.tagName.toUpperCase();
    if (tagName == 'TD' && target.parentNode.parentNode.parentNode.id == 'Test1') {
        EWAC_WfUtil["WF"].ClearSelects();
        return;
    }
    var loc = EWA.UI.Utils.GetMousePosition(e);

    EWAC_WfUtil["M_X"] = loc.X;
    EWAC_WfUtil["M_Y"] = loc.Y;

    if (tagName == 'IMG') {
        if (target.id == 'TEMP') {
            EWAC_WfUtil["CUR_OBJ"] = target;
        } else {
            var unit = EWAC_WfUtil["WF"].GetUnit(target);
            EWAC_WfUtil["CUR_OBJ"] = unit;
            if (unit) {
                var loc = EWA.UI.Utils.GetMousePosition(e);
                // unit.Move(loc.X, loc.Y);

                EWAC_WfUtil.objSelectedDown(unit);
                EWAC_WfUtil["ShowUnitPara"](unit);
            }

        }
    } else if (tagName == 'TD') {
        var tb = target.parentNode.parentNode.parentNode;
        if (tb.getAttribute('gdx') == 'LINE') { // cnn
            var cnn = EWAC_WfUtil["WF"].GetCnn(tb);
            if (cnn.IsSelected) {
                cnn.UnSelect();
            } else {
                cnn.Selected();
            }
        }
    }

}
EWAC_WfUtil["MouseUp"] = function (evt) {
    var obj = EWAC_WfUtil["CUR_OBJ"];
    if (obj == null)
        return;

    if (obj.id == 'TEMP') { // 模板
        EWAC_WfUtil["WF"].CreateUnit();
    }
    EWAC_WfUtil["CUR_OBJ"] = null;
}
EWAC_WfUtil["MouseMove"] = function (evt) {
    var obj = EWAC_WfUtil["CUR_OBJ"];
    if (obj == null)
        return;

    var e = evt ? evt : event;
    var loc = EWA.UI.Utils.GetMousePosition(e);
    ;

    var dx = loc.X - EWAC_WfUtil["M_X"];
    var dy = loc.Y - EWAC_WfUtil["M_Y"];

    EWAC_WfUtil["M_X"] = loc.X;
    EWAC_WfUtil["M_Y"] = loc.Y;

    if (obj.tagName == 'IMG') {
        obj.style.position = 'absolute';
        obj.style.left = loc.X + 'px';
        obj.style.top = loc.Y + 'px';
    } else if (obj.tagName == 'wfunit') {
        obj.MoveTo(dx, dy);
    }
}
/**
 * 删除对象
 */
EWAC_WfUtil["Delete"] = function () {
    var obj = EWAC_WfUtil["SELECTED"];
    if (obj == null) {
        return;
    }
    if (obj.tagName.indexOf('wf') == 0) {
        obj.Delete();
        EWAC_WfUtil["TWO"] = [null, null];
        EWAC_WfUtil["SELECTED"] = null;
    }
    EWAC_WfUtil["CUR_OBJ"] = null;
}
EWAC_WfUtil["objSelectedDown"] = function (unit) {
    if (!unit.IsSelected) { // 未选择
        if (EWAC_WfUtil["TWO"][1] != null) {
            // 连个都选择了
            return;
        }
        unit.Selected();
        if (EWAC_WfUtil["TWO"][0] == null) {
            EWAC_WfUtil["TWO"][0] = unit;
        } else {
            EWAC_WfUtil["TWO"][1] = unit;
        }
    } else { // 已选择
        unit.UnSelect();
        if (EWAC_WfUtil["TWO"][0] == unit) { // 交换位置
            EWAC_WfUtil["TWO"][0] = EWAC_WfUtil["TWO"][1];
        }
        EWAC_WfUtil["TWO"][1] = null;
    }
}

EWAC_WfUtil["AtomChangeName"] = function (o1) {
    o1.contentEditable = true;
    o1.style.border = "1px solid black";
}
EWAC_WfUtil["AtomChangedName"] = function (o1) {
    o1.contentEditable = false;
    o1.style.border = '';
    // o1.innerHTML = GetInnerText(o1).trim();
    // var id = o1.parentNode.parentNode.parentNode.parentNode.sid;
    // arrayAtoms[id][2] = o1.innerText;
}

EWAC_WfUtil["AtomNameKeyPress"] = function (o1) {
    if (event.keyCode == 13) {
        AtomChangedName(o1);
    }
}
/**
 * 
 * @param {EWAC_WfUnit}
 *            unit
 */
EWAC_WfUtil["ShowUnitPara"] = function (unit) {
    return;
    // if (window.parent != window && window.parent.frames.length < 2) {
    // return;
    // }
    // var w = window.parent.frames[1];
    // w.$X('Id').innerHTML = unit.Id;
    // w.$X('Name').value = GetInnerText($X(unit.Id)).trim();
}

function Init() {
    EWAC_WfUtil["WF"] = new EWAC_Wf();
    EWAC_WfUtil["WF"]._LodIds();
}
/**
 * 
 * @param {}
 *            units 节点
 * @param {}
 *            cnns 连接
 * @param {}
 *            sts 状态
 * @param {}
 *            logic 逻辑
 * @param {}
 *            pid 父节点
 * @param {}
 *            admId 用户编号
 * @param {}
 *            deptId 部门编号
 * @param {}
 *            postId 岗位编号
 * @param {}
 *            curUnitId 当前节点
 * @param {}
 *            curLogicVal 当前值
 */
function loadWfShow(units, cnns, sts, logics, pid, admId, deptId, postId, curUnitId, curLogicVal) {
    if (_EWA_WF && _EWA_WF.EN) {
        _EWA_WF.EN1 = $J2MAP(_EWA_WF.EN, 'WF_UNIT_ID');
    }
    var div = document.createElement("div");
    div.style.position = 'absolute';
    div.style.zIndex = 123;
    div.innerHTML = "ver: " + _EWA_WF.WF_DLV_VER;
    document.body.appendChild(div);

    var wf = EWAC_WfUtil["WF"];
    var minX = 1000012;
    var minY = 1000011;
    for (var i = 0; i < units.length; i++) {
        var d1 = units[i];
        var x = d1.WF_UNIT_X;
        var y = d1.WF_UNIT_Y;
        if (x != null && x * 1 < minX) {
            minX = x * 1;
        }
        if (y != null && y * 1 < minY) {
            minY = y * 1;
        }
    }
    if (minX == 1000012) {
        minX = 0;
    }
    if (minY == 1000011) {
        minY = 0;
    }
    minX -= 10;
    minY -= 10;
    var _tmp_units = {};
    var startUnit;
    for (var i = 0; i < units.length; i++) {
        var d1 = units[i];
        wf.Ids[i] = d1.WF_UNIT_ID;
        var unit = wf.CreateUnit();
        _tmp_units[d1.WF_UNIT_ID] = unit;

        var unit_name1 = d1.WF_UNIT_NAME;
        if (EWA.LANG == 'enus' && _EWA_WF.EN1 && _EWA_WF.EN1[d1.WF_UNIT_ID] && _EWA_WF.EN1[d1.WF_UNIT_ID].WF_UNIT_NAME_EN) {
            unit_name1 = _EWA_WF.EN1[d1.WF_UNIT_ID].WF_UNIT_NAME_EN;
        }
        unit.ChangeDes(unit_name1);
        unit.ChangeType(d1.WF_UNIT_TYPE);

        // 操作人
        unit.WF_UNIT_ADM = d1.WF_UNIT_ADM;
        unit.WF_UNIT_ADM_LST = d1.WF_UNIT_ADM_LST;

        var x = d1.WF_UNIT_X;
        var y = d1.WF_UNIT_Y;
        var obj = $X(d1.WF_UNIT_ID);
        if (x != null) {
            obj.style.left = (x - minX) + 'px';
        }
        if (y != null) {
            obj.style.top = (y - minY) + 'px';
        }
    }
    // 先映射连接的From
    var cnnsMap = {};
    for (var i = 0; i < cnns.length; i++) {
        var d1 = cnns[i];
        var fromId = d1.WF_UNIT_FROM;
        if (!cnnsMap[fromId]) {
            cnnsMap[fromId] = [];
        }
        cnnsMap[fromId].push(d1);
    }

    for (var i = 0; i < cnns.length; i++) {
        var d1 = cnns[i];

        var toId = d1.WF_UNIT_TO;
        var fromId = d1.WF_UNIT_FROM;

        var o1 = wf.Units[fromId];
        var o2 = wf.Units[toId];

        var cnn = new EWAC_WfCnn();
        cnn.Create(o1, o2);
        wf.Cnns[cnn.Id] = cnn;
        if (d1.IsHaveLogic) {
            if (!d1.IsLogicOk) {
                cnn.IsStop = true;
            }
        }
    }
    for (var n in wf.Units) {
        var u = wf.Units[n];
        if (startUnit == null && u.CnnsToLength == 0) {
            // 当没有连接到节点为启动
            startUnit = u;
        }
    }
    if (startUnit == null) {
        var msg = EWA.LANG == 'enus' ? "No startup node was found, process definition error" : '未发现启动节点,流程定义错误';
        alert(msg);
        return;
    }
    if (sts.length == 0) {
        wf.CurUnit = startUnit; // 当前节点
    }
    var mapBack = []; // 回退的节点
    var map1 = {};
    for (var i = 0; i < sts.length; i++) {
        var st = sts[i];
        var tag = st.SYS_STA_TAG;
        var unit = _tmp_units[tag];
        if (unit == null) {
            continue;
        }

        var adm_name = st.ADM_NAME;
        if (EWA.LANG == 'enus' && st.ADM_NAME_EN) {
            adm_name = st.ADM_NAME_EN
        }

        unit.Log(adm_name, st.SYS_STA_CDATE, st.SYS_STA_MEMO);
        if (!map1[tag]) { // 过滤重复的节点
            map1[tag] = 1;
            mapBack.push({
                "ID": tag,
                "DES": unit.GetDes()
            });
        }
        var cnnId = st.SYS_STA_TAG + 'G' + st.SYS_STA_VAL;
        if (!EWAC_WfUtil["WF"].Cnns[cnnId]) {
            // 流程被修改了
            continue;
        }
        EWAC_WfUtil["WF"].Cnns[cnnId].Disp(3, 'blue');

        if (unit == startUnit) {
            unit.ADM_ID = st.ADM_ID;
        }
        if (i == sts.length - 1) {
            var next1 = st.SYS_STA_VAL;
            var unitNext = _tmp_units[next1];
            // 设置当前可操作用户为状态表的ID列表,原则上一致,但是当手动调整流程时进行转换
            unitNext.WF_UNIT_ADM_LST = st.ROLE_IDS;
            // 审批类型为用户定义的审批类型,原则上一致,但是当手动调整流程时进行转换
            unitNext.WF_UNIT_ADM = st.ROLE_TYPE;

            EWAC_WfUtil["WF"].CurUnit = unitNext; // 当前节点
        }
    }

    // 指定当前节点
    if (curUnitId != null && curUnitId.length > 0) {
        if (_tmp_units[curUnitId]) {
            EWAC_WfUtil["WF"].CurUnit = _tmp_units[curUnitId]
        }
    }

    EWAC_WfUtil["WF"].CurUnit.LogCur(pid);

    // 操作权限
    var canOpr = false;
    var unit = EWAC_WfUtil["WF"].CurUnit;
    // alert(startUnit.Id+','+ unit.Id)

    var ss = [];
    if (startUnit == unit) {
        canOpr = true;
    } else if (unit.WF_UNIT_ADM == 'WF_ADM_ADM') {
        var s = ',' + unit.WF_UNIT_ADM_LST + ',';
        if (s.indexOf(',' + admId + ',') >= 0) {
            canOpr = true;
        } else {
            var map2 = $J2MAP1(top.org, 'ADM_ID');
            var ids = unit.WF_UNIT_ADM_LST.split(',');

            for (var i in ids) {
                var adms = map2[ids[i]];
                for (var m in adms) {
                    ss.push(adms[m].ADM_NAME);
                }
            }

        }
    } else if (unit.WF_UNIT_ADM == 'WF_ADM_DEPT') {
        var s = ',' + unit.WF_UNIT_ADM_LST + ',';
        if (s.indexOf(',' + deptId + ',') >= 0) {
            canOpr = true;
        } else {
            var map2 = $J2MAP1(top.org, 'DEP_ID');
            var ids = unit.WF_UNIT_ADM_LST.split(',');

            for (var i in ids) {
                var adms = map2[ids[i]];
                for (var m in adms) {
                    ss.push(adms[m].ADM_NAME);
                }
            }

        }
    } else if (unit.WF_UNIT_ADM == 'WF_ADM_POST') {
        var s = ',' + unit.WF_UNIT_ADM_LST + ',';
        // 一个人拥有多个岗位
        let posts = postId.split(',');
        for (let m = 0; m < posts.length; m++) {
            if (s.indexOf(',' + posts[m] + ',') >= 0) {
                //console.log('WF_ADM_POST', "unit.WF_UNIT_ADM_LST="+unit.WF_UNIT_ADM_LST, "postId="+ postId )
                canOpr = true;
                break;
            }
        }
        if (!canOpr) {
            var map2 = $J2MAP1(top.org, 'DEP_POS_ID');
            var ids = unit.WF_UNIT_ADM_LST.split(',');
            let names = {};//避免重复
            for (var i in ids) {
                let depPostId = ids[i]
                var adms = map2[depPostId];
                for (var m in adms) {
                    let admId = adms[m];
                    if (names[admId]) { //避免重复
                        continue;
                    }
                    names[admId] = true;
                    ss.push(adms[m].ADM_NAME);
                }
            }
        }
    } else if (unit.WF_UNIT_ADM == 'WF_ADM_START') { // 启动人
        if (startUnit == unit || admId == startUnit.ADM_ID) {
            canOpr = true;
        }
    } else if (unit.WF_UNIT_ADM == 'WF_ADM_MANAGER') { // 管理者
        var startAdmId = startUnit.ADM_ID;
        if (!top && !top.ORG) {
            var msg = EWA.LANG == 'enus' ? "No organization" : "没有组织机构";
            alert(msg);
            canOpr = false;

        }
        // 本部门经理
        var master = top.ORG.GetMaster(startAdmId);
        if (master.Id == admId) {
            canOpr = true;
        } else {
            canOpr = false;
        }
    }
    if (pid && window.parent && window.parent.$X(pid)) {
        var tb = window.parent.$X(pid).parentNode.parentNode.parentNode;
        if (!canOpr) {
            if (ss.length == 0) {
                var msg = EWA.LANG == 'enus' ? "Only view" : "您只能查看";
                window.parent.$X(pid).parentNode.innerHTML = '<b>' + msg + '</b>';
            } else {
                var msg = EWA.LANG == 'enus' ? "Waitting" : "等待";
                var msg1 = EWA.LANG == 'enus' ? 'or' : "或";
                window.parent.$X(pid).parentNode.innerHTML = '<b>' + msg + ':<span style="color:blue">'
                    + ss.join('</span> ' + msg1 + ' <span style="color:blue">') + '</span></b>';
            }
            window.parent.$X('butOk').style.display = 'none';
        } else if (mapBack.length > 0) {
            var td = tb.rows[tb.rows.length - 1].cells[0];
            var back = window.parent.document.createElement('input');
            back.type = 'button';
            back.value = EWA.LANG == 'enus' ? 'Back' : '打回';
            back.onclick = function () {
                var s = window.parent.$X(pid);
                s.options.length = 1;
                for (var i = 0; i < mapBack.length; i++) {
                    var o = mapBack[i];
                    s.options[s.length] = new Option(o.DES, o.ID);
                    this.style.display = 'none';
                }
                s.parentNode.parentNode.cells[0].innerHTML = EWA.LANG == 'enus' ? '<div style="color:red">Back steps</div>'
                    : '<div style="color:red">返回步骤</div>';
            }
            td.insertBefore(back, td.getElementsByTagName('input')[1]);
        }
        var xitems = _EWA_WF.WF_SHOW;
        if(xitems){
            showControls(tb, xitems);
        }
    }
}
function showControls(tb, xitems) {

    for (var i = tb.rows.length - 5; i >= 0; i--) {
        if (tb.rows[i].id.indexOf('_ewa_tr$EWA_WF_') == 0) {
            continue;
        }
        tb.rows[i].style.display = 'none';
    }

    var ids = {};
    var isHave = false;
    for (var i = 0; i < xitems.length; i++) {
        var a = xitems[i].XITEMS.split(',');
        for (var k = 0; k < a.length; k++) {
            var id = a[k].trim();
            if (id == '') {
                continue;
            }
            if (!ids[id]) {
                ids[id] = 1;
                isHave = true;
            }
        }
    }
    if (!isHave) {
        return;
    }

    for (var n in ids) {
        var o = tb.ownerDocument.getElementById('_ewa_tr$' + n);
        if (o) {
            o.style.display = '';
        }
    }

}
function loadWf(units, cnns) {
    var wf = EWAC_WfUtil["WF"];
    var minX = 1000012;
    var minY = 1000011;
    for (var i = 0; i < units.length; i++) {
        var d1 = units[i];
        var x = d1.WF_UNIT_X;
        var y = d1.WF_UNIT_Y;
        if (x < minX) {
            minX = x;
        }
        if (y < minY) {
            minY = y;
        }

    }
    for (var i = 0; i < units.length; i++) {
        var d1 = units[i];
        wf.Ids[i] = d1.WF_UNIT_ID;
        var unit = wf.CreateUnit();
        unit.ChangeDes(d1.WF_UNIT_NAME);
        unit.ChangeType(d1.WF_UNIT_TYPE);
        var x = d1.WF_UNIT_X;
        var y = d1.WF_UNIT_Y;
        var obj = $X(d1.WF_UNIT_ID);
        if (x != null) {
            obj.style.left = x + 'px';
        }
        if (y != null) {
            obj.style.top = y + 'px';
        }
    }

    for (var i = 0; i < cnns.length; i++) {
        var d1 = cnns[i];
        var o1 = wf.Units[d1.WF_UNIT_FROM];
        var o2 = wf.Units[d1.WF_UNIT_TO];
        var cnn = new EWAC_WfCnn();
        try {
            cnn.Create(o1, o2);
            wf.Cnns[cnn.Id] = cnn;
        } catch (e) {
            alert(e)
        }
    }
}

function loadByDefined() {
    var data = window.parent._EWAC_User.WorkflowTableSet;
    var wf = EWAC_WfUtil["WF"];
    for (var i = 0; i < data.Count(); i++) {
        var d1 = data.GetItem(i);
        wf.Ids[i] = d1.Name;
        var unit = wf.CreateUnit();
        var des = d1.Tables.GetItem('descriptionset').SearchValue('lang=zhcn', 'info')
        unit.ChangeDes(des);
        var actType = d1.Tables.GetItem('WfType').GetSingleValue();
        unit.ChangeType(actType);
    }
    for (var i = 0; i < data.Count(); i++) {
        var d0 = data.GetItem(i);

        var actType = d0.Tables.GetItem('WfType').GetSingleValue();
        if (actType == 'end') {
            continue;
        }

        EWAC_WfUtil["TWO"][0] = wf.Units[d0.Name];
        var d0Act = d0.Tables.GetItem('WfAction');

        var nxt = d0Act.GetValue('WFANextYes');
        if (nxt == null || nxt == '') {
            var d1 = data.GetItem(i + 1);
            EWAC_WfUtil["TWO"][1] = wf.Units[d1.Name];
        } else {
            alert(nxt);
            EWAC_WfUtil["TWO"][1] = wf.Units[nxt];
        }
        wf.CreateCnn();
        var nxtNo = d0Act.GetValue('WFANextNo');
        if (nxtNo != null && nxtNo != '') {
            alert(nxtNo);
            EWAC_WfUtil["TWO"][1] = wf.Units[nxtNo];
        }
        wf.CreateCnn();
    }
    EWAC_WfUtil["TWO"][0] = EWAC_WfUtil["TWO"][1] = null;
}

function CreateExp() {
    var x = new EWA_XmlClass();
    x.LoadXml("<EwaWf><Units /><Cnns /><Draw /></EwaWf>");
    var rootUnits = x.GetElement("Units");
    var rootCnns = x.GetElement("Cnns");
    var tbs = document.getElementsByTagName('TABLE')
    var s = [];
    for (var i = 0; i < tbs.length; i++) {
        var tb = tbs[i];
        if (tb.id.indexOf('Atom_Table_') != 0 && tb.style.display != 'none') {
            continue;
        }
        var node = x.NewChild("Unit", rootUnits);
        node.setAttribute("Unid", tb.getAttribute("sid"));
        node.setAttribute("Type", tb.getAttribute("type"));
        node.setAttribute("Des", GetInnerText(tb).trim());

        s.push(GetOuterHTML(tb));
    }
    var divs = document.getElementsByTagName('DIV')
    for (i = 0; i < divs.length; i++) {
        var div = divs[i];
        if (div.id.indexOf('Atom_Table_') != 0) {
            continue;
        }
        var ids = div.id.split('G');
        var idFrom = ids[0].replace('Atom_Table_', '');
        var idTo = ids[1].replace('Atom_Table_', '');
        var node = x.NewChild("Cnn", rootCnns);
        node.setAttribute("Unid", div.id);
        node.setAttribute("From", idFrom);
        node.setAttribute("To", idTo);
        node.setAttribute("Logic", "");

        s.push(GetOuterHTML(div));
    }
    var rootDraw = x.GetElement("Draw");
    x.SetCData(s.join('\r\n'), rootDraw);
    alert(x.GetXml());
}

function SetAtomName(v1) {
    if (CurSelectedID == '')
        return;
    window.arrayAtoms[CurSelectedID][2] = v1;
    var o1 = $X('Atom_Table_' + CurSelectedID);
    o1.rows[1].cells[0].innerText = v1;
}

function SetAtomType(v1) {
    if (CurSelectedID == '')
        return;
    var imgSrc = EWA.RV_STATIC_PATH == null ? EWA.CP : EWA.RV_STATIC_PATH;
    imgSrc += "/EWA_STYLE/";
    window.arrayAtoms[CurSelectedID][1] = v1;
    var o1 = $X('Atom_Table_' + CurSelectedID);
    o1.type = v1;
    if (v1 == 0) {
        o1.rows[0].cells[0].childNodes[0].src = imgSrc + 'images/workflow/nulla.gif';
    } else {
        o1.rows[0].cells[0].childNodes[0].src = imgSrc + 'images/workflow/nullaico.gif';
    }
}
function loadParentInfoJson(w, fjson, tbMe) {
    var cfg = w[fjson];
    for (var n in cfg) {
        var r0 = tbMe.insertRow(0);
        var td0 = r0.insertCell(-1);
        td0.className = 'EWA_TD_L';
        var td1 = r0.insertCell(-1);
        td1.className = 'EWA_TD_M';

        var caption = cfg[n].DES;
        var text = cfg[n].VAL;

        td0.innerHTML = '<span style="color:111"><i>' + caption + "</i></span>";
        td1.innerHTML = text;
    }
}
function loadParentInfo() {
    EWA.OW.Load();
    if (!EWA.OW.PWin) {
        window.setTimeout(loadParentInfo, 300);
        return;
    }

    var tbMe;
    var objs = document.getElementsByTagName('table');
    for (var i = 0; i < objs.length; i++) {
        var o = objs[i];
        if (o.id.indexOf('EWA_FRAME_') == 0) {
            tbMe = o;
            break;
        }
    }

    if (tbMe == null) {
        return;
    }

    var p = tbMe.parentNode.parentNode;
    var h = p.offsetHeight;
    var h1 = tbMe.offsetHeight;

    var div = document.createElement("div");
    div.style.height = (h - h1) + 'px';
    div.style.overflow = 'auto';

    div.innerHTML = "<table broder=0 cellpadding=1 cellspacing=1 class=EWA_TABLE></table>";

    tbMe.parentNode.insertBefore(div, tbMe);

    tbMe = div.childNodes[0];

    var w = EWA.OW.PWin;
    var u = new EWA_UrlClass();
    u.SetUrl(window.location.href);
    var fjson = u.GetParameter("fjson");
    if (fjson != null) {
        loadParentInfoJson(w, fjson, tbMe);
        return;
    }

    if (u._Paras['COMBINE_ID']) {
        w.$('#' + u._Paras['COMBINE_ID']).find('li').each(function (idx) {
            if (idx % 2 == 0) {
                r0 = tbMe.insertRow(0);
                td0 = r0.insertCell(-1);
                td0.className = 'EWA_TD_L';
                td0.innerHTML = '<span style="color:111"><i>' + $(this).text() + "</i></span>";
            }
            if (idx % 2 == 1) {
                var td1 = r0.insertCell(-1);
                td1.className = 'EWA_TD_M';
                td1.innerHTML = $(this).text();
            }
        });
    }

    var frame;
    for (var n in w.EWA.F.FOS) {
        if (n == u.GetParameter('EWA_PARENT_FRAME')) {
            frame = w.EWA.F.FOS[n];
            break;
        }
    }
    if (!frame) {
        return;
    }

    var rows = frame.SelectCheckedRows();
    if (rows.length == 0) {
        return;
    }
    var r = rows[0];
    var rH = r.parentNode.rows[0];

    for (var i = r.cells.length - 1; i >= 0; i--) {
        if (r.cells[i].getElementsByTagName('input') > 0) {
            continue;
        }

        var caption = GetInnerText(rH.cells[i]);
        var text = GetInnerText(r.cells[i]);
        if (caption == null || caption.trim() == "" || text == null || text.trim() == "") {
            continue;
        }
        caption = caption.replace("?", "").trim();
        if (caption.trim() == text.trim()) {
            continue;
        }

        var r0 = tbMe.insertRow(0);
        var td0 = r0.insertCell(-1);
        td0.className = 'EWA_TD_L';
        var td1 = r0.insertCell(-1);
        td1.className = 'EWA_TD_M';

        td0.innerHTML = '<span style="color:111"><i>' + caption + "</i></span>";
        td1.innerHTML = text;
    }
}

function getSpJson() {
    var tb = null;
    var tbs = document.getElementsByTagName("table");
    for (var i = 0; i < tbs.length; i++) {
        if (tbs[i].id.indexOf("EWA_FRAME_") == 0) {
            tb = tbs[i];
            break;
        }
    }
    var id = "EWA_ITEMS_XML_" + tb.id.replace("EWA_FRAME_", "");

    var s = [];
    s.push("[");
    var xml = new EWA_XmlClass();
    xml.LoadXml(window[id]);
    var nl = xml.XmlDoc.getElementsByTagName("XItem");
    for (var i = 0; i < nl.length; i++) {
        if (i > 0) {
            s.push(",");
        }
        var s1 = getSpItem(nl[i]);
        var o;
        eval("o=" + s1 + "");
        if (o.TAG == "select") {
            var obj = $X(o.NAME);
            var ss = [];
            for (var k = 0; k < obj.options.length; k++) {
                var opt = obj.options[k];
                ss.push(opt.text + "gdx|z" + opt.value.replace(/"/ig, ""));
            }
            s1 = s1.replace("\"} ", "\"A\":\"" + ss.join("!@1`") + "}");
            $X("EWA_WF_UMSG").value = s1;
        }
        s.push(s1);
    }
    s.push("]");
    alert(s.join(""));

}
function getSpItem(node) {
    var tag = node.getElementsByTagName("Tag")[0].getElementsByTagName("Set")[0].getAttribute("Tag");
    var name = node.getElementsByTagName("Name")[0].getElementsByTagName("Set")[0].getAttribute("Name");
    var des = node.getElementsByTagName("DescriptionSet")[0].getElementsByTagName("Set")[0].getAttribute("Info");
    var s = "{\"TAG\":\"" + tag + "\", \"NAME\":\"" + name.replace(/"/ig, "") + "\", \"DES\":\"" + des.replace(/"/ig, "")
        + "\"} ";
    return s;
}