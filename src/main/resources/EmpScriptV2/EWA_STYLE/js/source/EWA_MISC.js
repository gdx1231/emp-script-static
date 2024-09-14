(function (global, factory) {
	if (typeof module === "object" && typeof module.exports === "object") {
		module.exports = factory();
	} else {
		factory(global);
	}
})(typeof window !== "undefined" ? window : this, function (global) {
	let chnNumChar = {
		'零': 0, '0': 0, "０": 0, 'o': 0, 'O': 0,
		'一': 1, '壹': 1, '1': 1, "１": 1,
		'二': 2, '贰': 2, '2': 2, "２": 2, '两': 2, '俩': 2,
		'三': 3, '叁': 3, '3': 3, "３": 3,
		'四': 4, '肆': 4, '4': 4, "４": 4,
		'五': 5, '伍': 5, '5': 5, "５": 5,
		'六': 6, '陆': 6, '6': 6, "６": 6,
		'七': 7, '柒': 7, '7': 7, "７": 7,
		'八': 8, '捌': 8, '8': 8, "８": 8,
		'九': 9, '玖': 9, '9': 9, "９": 9
	};
	let chnNameValue = {
		'十': { value: 10, first: true },
		'拾': { value: 10, first: true },
		'什': { value: 10, first: true },
		'百': { value: 100 },
		'佰': { value: 100 },
		'陌': { value: 100 },
		
		'千': { value: 1000 },
		'阡': { value: 1000 },
		'仟': { value: 1000 },
		'k': { value: 1000, stop: true },
		'K': { value: 1000, stop: true },
		
		'万': { value: 10000, stop: true },
		'萬': { value: 10000, stop: true },
		'w': { value: 10000, stop: true },
		'W': { value: 10000, stop: true },
		
		'M': { value: 1000 * 1000, stop: true }, // million
		'm': { value: 1000 * 1000, stop: true },
		'亿': { value: 100000000, stop: true },
		'b': { value: 1000 * 1000 * 1000, stop: true }, //billion
		'B': { value: 1000 * 1000 * 1000, stop: true }
	};
	let negatives = {
		'-': true,
		'负': true,
		'－': true
	};
	let positives = {
		'+': true,
		'正': true
	};
	let skipTails = {
		'整': true
	};
	function newPart() {
		return { number: 0, scale: 1, items: [] };
	}

	function convertToParts(strs) {
		let parts = [newPart()];
		let prevName = null;
		for (let i = 0; i < strs.length; i++) {
			let alpha = strs[i];

			let name = chnNameValue[alpha];
			let num = chnNumChar[alpha];
			parts[parts.length - 1].items.push([alpha, name, num]);
			if (name) {
				if ((i == 0) && name.first) { //十
					let number = 10;
					parts[parts.length - 1].number = number;
				} else if (name.stop) {
					parts[parts.length - 1].scale = name.value || 1;
					// 创建新的片段
					parts.push(newPart());
					scale = 1;
					prevName = null;
				} else {
					if (i == strs.length - 1) {
						console.log(name)
						parts[parts.length - 1].number.scale = name.value;
					}
					prevName = name;
				}
				continue;
			}

			if (num == null) {
				throw '非数字或单位：' + alpha;
			}
			num = (num);

			let nextChar = i == strs.length - 1 ? null : strs[i + 1];
			let nextName = i == strs.length - 1 ? null : chnNameValue[nextChar];
			let nextNum = chnNumChar[nextChar];

			if (nextName && nextName.stop) {
				nextName = null;
			}
			let lastNum = parts[parts.length - 1].number;
			let number;

			let items = parts[parts.length - 1].items;
			let itemPre = items[items.length - 2];//上一个
			let itemPrePre = items[items.length - 3];// 上上个
			if (nextName == null) {
				if (prevName == null) {//连续的数字，例如 203
					let skipTen = false;
					if (itemPre && itemPre[2] === 0) {
						if (itemPrePre && itemPrePre[1] != null/*是单位 */) {//捌仟零六 的零
							skipTen = true;
						}
					} else if (itemPre && itemPre[1] && itemPre[1].value === 10) { //十六
						skipTen = true;
					}

					if (skipTen) {
						number = lastNum + num;
					} else {
						number = lastNum * 10 + num;
					}
				} else {// 例如 二千五，运算到五
					if (itemPre && itemPre[1] && itemPre[1].value === 10 && (itemPrePre == null || itemPrePre[2] === 0 || itemPrePre[1] != null)) { //十六
						number = lastNum + num + 10;
					} else {
						number = lastNum + num;
					}
				}
			} else {
				if (prevName == null) { // 例如 二千零五十
					number = lastNum + num * (nextName.value);
				} else {
					number = lastNum + num * (nextName.value);
				}
			}
			parts[parts.length - 1].number = number;
			prevName = null;
			//console.log(`num=${num},  number=${number}`);
		}
		//console.log(parts)
		return parts;
	}
	function convertJflhNum(strs, alpha, loc) {
		let fenv = strs[loc - 1];
		let fenNum = chnNumChar[fenv];
		if (!fenNum) {
			return -1;
		}
		//一元=10角，一元=100分，一元=1000厘，一元=10000毫
		if (alpha == '角') {
			return ("0." + fenNum) * 1;
		} else if (alpha == '分') {
			return ("0.0" + fenNum) * 1;
		} else if (alpha == '厘') {
			return ("0.00" + fenNum) * 1;
		} else if (alpha == '毫') {
			return ("0.000" + fenNum) * 1;
		} else {
			return -1;
		}
	}
	function convertJflh(strs) { // 角分厘毫
		let sum = 0;
		let inc = 0;
		for (let i = strs.length - 1; i >= 0; i -= 2) {
			let alpha = strs[i];
			let num = convertJflhNum(strs, alpha, i);
			if (num === -1) {
				break;

			} else {
				sum += num;
				inc++;
			}
		}
		return {
			sum: sum,
			inc: inc,
			strs: strs.splice(0, strs.length - inc * 2)
		};
	}
	/**
	 * 处理整数部分
	 * @param {*} strs 字符串
	 * @returns 整数
	 */
	function convert(strs) {
		let jiaofen = convertJflh(strs);
		// console.log(jiaofen);

		strs = jiaofen.strs;

		let parts = convertToParts(strs);
		let last = 0;
		let scale1 = 1;
		for (let i = parts.length - 1; i >= 0; i--) {
			let part = parts[i];
			let p = part.number;
			scale1 = scale1 * part.scale;
			last += p * scale1;
		}
		return last + jiaofen.sum;
	}
	/**
	 * 处理·小数部分
	 * @param {*} strs 字符串
	 * @returns 小数
	 */
	function convertDot(strs) {
		let scale = 1;
		let skip = 0;
		for (let i = strs.length - 1; i >= 0; i--) {
			let alpha = strs[i];
			let name = chnNameValue[alpha]; // 结尾的连续单位，例如 0.35百万
			if (!name) {
				break;
			}
			scale *= name.value;
			skip++;
		}
		let newStrs = scale == 1 ? strs : strs.splice(0, strs.length - skip);

		let parts = convertToParts(newStrs);
		let last = 0;
		let scale1 = 1;
		for (let i = parts.length - 1; i >= 0; i--) {
			let part = parts[i];
			let p = part.number;
			scale1 = scale1 * part.scale;
			last += p * scale1;
		}
		let last1 = ("0." + last) * 1;

		return [last1, scale, newStrs.length];
	}
	function chineseToNumber(chnStr) {
		if (!chnStr) {
			return chnStr;
		}
		if (!isNaN(chnStr.toString())) {
			return chnStr.toString() * 1;
		}
		let chnStrs = chnStr.replace(/，|,| |元|圆/ig, '').replace(/点|。/ig, '.').split('.');
		if (chnStrs.length > 2) {
			throw '非数字表达式：' + chnStr;
		}
		let strs = chnStrs[0].split('');
		let dots = (chnStrs.length == 2 ? chnStrs[1] : "").split('');

		let isNegative = false;
		let alpha = strs[0];
		if (negatives[alpha]) { // 负，- 
			isNegative = true;
			strs = strs.splice(1);
		} else if (positives[alpha]) { // 正，+
			isNegative = false;
			strs = strs.splice(1);
		}

		let lastAlpha = strs[strs.length - 1];
		if (skipTails[lastAlpha]) { //整
			strs = strs.splice(0, strs.length - 1);
		} else if (dots.length > 1) {
			lastAlpha = dots[dots.length - 1];
			if (skipTails[lastAlpha]) { //整
				dots = dots.splice(0, dots.length - 1);
			}
		}

		let number = convert(strs); // 
		let number1 = dots.length > 0 ? convertDot(dots) : 0;
		if (number1 == 0) { // 没有小数
			return number * (isNegative ? -1 : 1);
		}

		// console.log(number, number1)

		let fixed = number1[2] < 0 ? 0 : number1[2];
		let scale = number1[1];
		return ((number + number1[0]) * scale).toFixed(fixed) * (isNegative ? -1 : 1);

	}
	if (typeof window != 'undefined' && window.EWA && window.EWA_Utils) {
		window.EWA_Utils.chineseToNumber = chineseToNumber;
	} else if (global) {
		global.chineseToNumber = chineseToNumber;
	} else {
		return chineseToNumber;
	}
});/* move to EWA_06TransClass *//**
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
};
function EWA_DocWordClass() {
    this.docks = [];
    this.pics = [];
    this.liNum = 0;// numering.xml defined
    this.defaultFontEnglish = "Century Gothic";
    this.defaultFontChinese = "Microsoft YaHei";
    this.walker = function(obj, pNode) {
        if (obj.nodeType == 3) {
            this.walkerTxt(obj)
        } else if (obj.nodeType == 1) {
            this.walkerEle(obj)
        }
    };
    this.walkerEle = function(obj) {
        if (obj.style.display == 'none') {
            return;
        }
        var t = obj.tagName;
        var endPop = false;
        var o;
        if (t == 'LI') {
            o = this.createP(obj);
            var p = this.getDockTable();
            p.appendChild(o);
            this.docks.push(o);
            endPop = true;
            this.createLi(obj);
        } else if (t == 'BR') {
            o = this.createBr(obj);
            var p = this.getDock();
            // var o = this.createSpan(obj);
            if (p.tagName != 'w:p') { // td
                var p0 = this.createP(obj.parentNode);
                var wr = this.createSpan(obj.parentNode);
                p0.appendChild(wr);
                p0.appendChild(o);
                p.appendChild(p0);
                this.docks.push(p0);

            } else {
                p.appendChild(o);
            }
            this.lastWR = null;
        } else if (t == 'IMG') {
            var p = this.getDock();
            o = this.createPic(obj);
            if (p.tagName != 'w:p') { // td
                var p0 = this.createP(obj.parentNode);
                var wr = this.createSpan(obj.parentNode);
                p0.appendChild(wr);
                p0.appendChild(o);
                p.appendChild(p0);
                this.docks.push(p0);
                
                endPop = true; // 完成后弹出附体
                o = p0; // 交换父体 2022-01-02
            } else {
                p.appendChild(o);
            }
            this.lastWR = null;
        } else if (t == 'TABLE') {
            var prt = this.getDockTable();
            var prev = obj.previousElementSibling;
            if (prev != null && prev.tagName == "TABLE") {
                var p = this.createPVanish();
                prt.appendChild(p[0]);
            }
            o = this.createTable(obj);
            // jzp
            if (o != null) {
                endPop = true;
                prt.appendChild(o);
                this.docks.push(o);
            }
        } else if (t == 'TBODY') {
            o = this.createTbody(obj);
            this.getDock().appendChild(o);
        } else if (t == 'TR') {
            o = this.createTr(obj);
            this.getDock().appendChild(o);
            this.docks.push(o);
            endPop = true;
        } else if (t == 'TD') {
            o = this.createTd(obj);
            this.getDock().appendChild(o);
            this.docks.push(o);

            endPop = true;
        } else if (t == 'HR') {
            var p = this.getDockTable();
            o = this.createP(obj);
            var wr = this.createSpan(obj);
            o.appendChild(wr);
            var hr = this.createHr();
            wr.appendChild(hr);
            this.lastWR = null;
            p.appendChild(o);
        } else if (obj.parentNode.tagName != 'LI'
                && (t == 'H1' || t == 'H2' || t == 'H3' || t == 'P'
                        || t == 'CENTER' || t == 'DIV')) {
            var p = this.getDockTable();
            o = this.createP(obj);

            p.appendChild(o);
            this.docks.push(o);
            endPop = true;
        } else if (t == 'SCRIPT') {
            return;
        } else if (t == 'BODY' || t == 'OL' || t == 'UL') {

        } else {
            var p = this.getDock();
            o = this.createSpan(obj);
            if (p.tagName != 'w:p') { // td
                var p0 = this.createP(obj.parentNode);
                p0.appendChild(o);
                p.appendChild(p0);
                this.docks.push(p0);
            } else {
                p.appendChild(o);
            }
        }
        for (var i = 0; i < obj.childNodes.length; i++) {
            var ochild = obj.childNodes[i];
            this.walker(ochild);
        }
        if (endPop) {
            this.docksPop(o);
            this.lastWR = null;
        }
        if (t == 'TD' && o.childNodes.length == 1) {
            var p0 = this.createEle('w:p')
            o.appendChild(p0);
        } else if (t == 'TABLE' && o.nextSibling == null
                && o.parentNode.tagName == 'w:tc') {
            var p0 = this.createEle('w:p')
            o.parentNode.appendChild(p0);
        }
    }
    this.walkerTxt = function(obj) {
        if (obj.nodeValue.trimEx() == "") {
            this.lastWR = null;
            return;
        }
        var eleTxt = this.createText(obj);
        var p = this.getDock();
        if (p.tagName != 'w:p') { // td
            var p0 = this.createP(obj.parentNode);
            var wr = this.createSpan(obj.parentNode);
            p0.appendChild(wr);
            wr.appendChild(eleTxt);

            p.appendChild(p0);
            this.docks.push(p0);
        } else {
            if (!this.lastWR) {
                var wr = this.createSpan(obj.parentNode);
                p.appendChild(wr)
            }
            this.lastWR.parentNode.appendChild(eleTxt);
        }
        this.lastWR = null;
    }
    this.createEle = function(tag) {
        var ele8 = this.doc.XmlDoc.createElement(tag);
        return ele8;
    };
    this.createEles = function(tags) {
        var tt = tags.split(',');
        var rts = [];
        for (var i = 0; i < tt.length; i++) {
            var ele8 = this.createEle(tt[i].trim());
            rts.push(ele8);
            if (i > 0) {
                rts[0].appendChild(ele8);
            }
        }
        return rts;
    };
    this.createElesLvl = function(tags) {
        var tt = tags.split(',');
        var rts = [];
        for (var i = 0; i < tt.length; i++) {
            var ele8 = this.createEle(tt[i].trim());
            rts.push(ele8);
            if (i > 0) {
                rts[i - 1].appendChild(ele8);
            }
        }
        return rts;
    };
    this.createElesSameLvl = function(tags, pNode) {
        var tt = tags.split(',');
        var rts = [];
        for (var i = 0; i < tt.length; i++) {
            var ele8 = this.createEle(tt[i].trim());
            rts.push(ele8);
            pNode.appendChild(ele8);
        }
        return rts;
    }
    this.createText = function(obj) {
        if (obj.nodeValue.trim() == "") {
            return;
        }
        var t = this.createEle("w:t");
        if (EWA.B.IE) {
            t.text = obj.nodeValue;
        } else {
            t.textContent = obj.nodeValue;
        }
        return t;
    };
    this.createHr = function() {
        // <w:pict w14:anchorId="0C1134BF">
        // <v:rect id="_x0000_i1037" style="width:.05pt;height:1pt"
        // o:hralign="center" o:hrstd="t"
        // o:hrnoshade="t" o:hr="t" fillcolor="black [3213]" stroked="f"/>
        // </w:pict>
        var hr = this.createElesLvl('w:pict,v:rect');
        hr[0].setAttribute('w14:anchorId', this.getParaId());
        this.setAtts(hr[1], {
            style : "width:.05pt;height:1pt",
            "o:hralign" : "center",
            "o:hrstd" : "t",
            "o:hrnoshade" : "t",
            "o:hr" : "t",
            fillcolor : "black [3213]",
            stroked : "f"
        });
        return hr[0];
    }
    this.createLi = function(obj) {
        // <w:numPr> <w:ilvl w:val="0"/> <w:numId w:val="8"/></w:numPr>
        // <w:spacing w:line="270" w:lineRule="atLeast"/>
        var numPrs = this.createEles('w:numPr,w:ilvl,w:numId');
        if (obj.parentNode.tagName == 'OL') {
            if (obj == obj.parentNode.getElementsByTagName('li')[0]) {
                this.liNum++;
            }
            numPrs[1].setAttribute('w:val', 0);
            numPrs[2].setAttribute('w:val', this.liNum);
        } else {
            numPrs[1].setAttribute('w:val', 0);
            numPrs[2].setAttribute('w:val', 22);
        }
        var wSpace = this.createEle('w:spacing');
        wSpace.setAttribute('w:line', 270);
        wSpace.setAttribute('w:lineRule', "atLeast");

        var p = this.getDock();
        p.getElementsByTagName('w:pPr')[0].appendChild(numPrs[0]);
        p.getElementsByTagName('w:pPr')[0].appendChild(wSpace);
    }
    this.createSpan = function(obj) {
        var r = this.createEle("w:r");
        var o = $(obj);
        var wrpr = this.createEle("w:rPr");

        this.lastWR = wrpr;

        r.appendChild(wrpr);
        if (o.css('color') != '') {// color
            var c = this.createEle('w:color');
            var c1 = this.rgb1(o.css('color'));
            c.setAttribute("w:val", c1);
            wrpr.appendChild(c);
        }
        if (o.css('font-family') != '') {// color
            // <w:rFonts w:ascii="宋体" w:eastAsia="宋体" w:hAnsi="宋体" w:cs="Times
            // New Roman" w:hint="eastAsia"/>
            var f = o.css('font-family').replace(/\'/ig, "").split(',');
            var c = this.createEle('w:rFonts');
            // var exp = /[a-z]/ig;
            // var f1 = (exp.test(f[0])) ? '宋体' : f[0].trim();
            var re = /[\u4E00-\u9FA5]|[\uFE30-\uFFA0]/gi;
            // var f1=(re.test(o.text()))?"宋体":"Times New Roman";
            var f1 = (re.test(o.text())) ? this.defaultFontChinese
                    : this.defaultFontEnglish;

            // var f2 = (exp.test(f[0])) ? f[0].trim() : 'Times New Roman';
            var f2 = this.defaultFontEnglish;
            this.setAtts(c, {
                "w:ascii" : f1,
                "w:eastAsia" : f1,
                "w:hAnsi" : f1,
                "w:hint" : "eastAsia",
                "w:cs" : f2
            });
            wrpr.appendChild(c);
        }
        if (o.css('font-size') != '') {// color
            var f = o.css('font-size');
            var f1 = this.fontSize(f);// <w:sz w:val="36" /><w:szCs w:val="36"
            // />
            // console.log(f1)
            if (f1 != null) {
                var c = this.createEle('w:sz');
                c.setAttribute("w:val", f1 * 2);
                wrpr.appendChild(c);

                var c1 = this.createEle('w:szCs');
                c1.setAttribute("w:val", f1 * 2);
                wrpr.appendChild(c1);
            }
        }
        var b = o.css('font-weight');
        if (o.tagName == 'B' || !(b == '' || b == 'normal' || b == '400')) {
            var c = this.createEle('w:b');
            wrpr.appendChild(c);
        }
        if (o.tagName == 'I') {
            var c = this.createEle('w:i');
            wrpr.appendChild(c);
        }

        return r;

    };
    this.createBr = function(obj) {
        var bele = this.createEle("w:r");
        var bele1 = this.createEle("w:br");
        bele.appendChild(bele1);

        return bele;
    };
    this.createTable = function(obj) {
        var bele = this.createEle("w:tbl");

        var tblPr = this.createEle("w:tblPr");
        var tblStyle = this.createEle("w:tblStyle");
        tblStyle.setAttribute("w:val", "a4");

        tblPr.appendChild(tblStyle);
        // <w:tblW w:w="8702" w:type="dxa" />
        var tbW = this.createWidth(obj, 'tblW');
        tblPr.appendChild(tbW);
        // if (this.getDockTable().tagName == 'w:body') {
        // tbW.setAttribute('w:type', 'pct'); //100%
        // tbW.setAttribute('w:w', 5000);
        // //console.log(tbW)
        // }
        obj.setAttribute('ww', tbW.getAttribute('w:w'));
        bele.appendChild(tblPr);

        return bele;
    };
    this.createTbody = function() {
        var bele = this.createEle("w:tblGrid");
        return bele;
    };
    this.createTr = function(obj) {
        var trs = this.createElesLvl("w:tr,w:trPr");
        this.setAtts(trs[0], {
            "w:rsidR" : "003D2D54",
            "w14:textId" : "77777777",
            "w14:paraId" : this.getParaId()
        });
        var h = this.createHeight(obj, 'trHeight');
        trs[1].appendChild(h);
        return trs[0];
    };
    this.paraId = 0;
    this.getParaId = function() {
        var v = "0000" + this.paraId;
        v = v.substring(v.length - 4);
        this.paraId++;
        return "F0C0" + v;
    }
    this.createTd = function(obj) {
        thisTr = obj.parentNode;
        var tb = thisTr.parentNode.parentNode;
        var vm = obj.getAttribute('vmerge');
        var refTdww = 0;
        if (vm != null && vm != '') {
            var bele = this.createEle("w:tc");
            var tcPr = this.createEle("w:tcPr");
            var vMerge = this.createEle("w:vMerge");
            tcPr.appendChild(vMerge);
            bele.appendChild(tcPr);
            this.getDock().appendChild(bele);

            var p = this.createEle('w:p');
            bele.appendChild(p);
            var refIdx = vm.split(',');
            var refTd = tb.rows[refIdx[0]].cells[refIdx[1]];
            tcPr.appendChild(this.createTdBorders(refTd));
            refTdww = refTd.getAttribute('wwtd') * 1;
        }

        var bele = this.createEle("w:tc");
        var tcPr = this.createEle("w:tcPr");
        bele.appendChild(tcPr);

        if (obj.rowSpan > 1) {
            // <w:vMerge w:val="restart" />
            var vMerge = this.createEle("w:vMerge");
            vMerge.setAttribute("w:val", "restart");
            tcPr.appendChild(vMerge);
            for (var i = 0; i < obj.rowSpan - 1; i++) {
                var tr = tb.rows[i + 1 + thisTr.rowIndex];
                if (tr) {
                    var td = tr.cells[obj.cellIndex];
                    if (td) {
                        td.setAttribute('vmerge', thisTr.rowIndex + ','
                                + obj.cellIndex);
                    }
                }

            }
        }
        if (obj.colSpan > 1) {
            // <w:gridSpan w:val="2"/>
            var colSpan = this.createEle('w:gridSpan');
            colSpan.setAttribute('w:val', obj.colSpan);
            tcPr.appendChild(colSpan);
        }
        tcPr.appendChild(this.createTdBorders(obj));

        var tcW = this.createWidth(obj, 'tcW');
        var tr = obj.parentNode;

        var trww = tr.getAttribute('wwtr');
        if (trww == null || trww == '') {
            var tb = tr.parentNode.parentNode;
            var ww = tb.getAttribute('ww');
            trww = ww;
        }
        var w = tcW.getAttribute("w:w");
        if (obj != obj.parentNode.cells[obj.parentNode.cells.length - 1]) {
            // <w:tcW w:w="2901" w:type="dxa" />
            obj.setAttribute('wwtd', w);
            var w1 = trww * 1 - w * 1 - refTdww;
            tr.setAttribute('wwtr', w1);
        } else {
            // 最后一个单元格不设置宽度
            // obj.setAttribute('wwtd', trww * 1 - refTdww);
            tcW.setAttribute("w:w", 0);
            tcW.setAttribute("w:type", "auto");
        }
        tcPr.appendChild(tcW);

        var o = $(obj);
        var vAlign = o.css("vertical-align");
        if (vAlign == 'middle') {
            // <w:vAlign w:val="bottom"/>
            var e1 = this.createEle('w:vAlign');
            e1.setAttribute('w:val', 'center');
            tcPr.appendChild(e1);
        } else if (vAlign == 'bottom') {
            var e1 = this.createEle('w:vAlign');
            e1.setAttribute('w:val', 'bottom');
            tcPr.appendChild(e1);
        }
        return bele;
    };
    this.createWidth = function(obj, tag) {
        // <w:tblW w:w="8702" w:type="dxa" />
        var e = this.createEle('w:' + tag);
        var w = $(obj).width() * 15; // px-->word width
        e.setAttribute('w:w', w);
        e.setAttribute('w:type', "dxa");
        return e;
    };
    this.createHeight = function(obj, tag) {
        // <w:trHeight w:val="10121"/>
        var e = this.createEle('w:' + tag);
        var h = $(obj).height() * 15; // px-->word width
        e.setAttribute('w:val', h);
        return e;
    };
    /*
     * <w:tcBorders> <w:top w:val="nil" /> <w:left w:val="single" w:sz="8"
     * w:space="0" w:color="000000" /> <w:bottom w:val="single" w:sz="8"
     * w:space="0" w:color="000000" /> <w:right w:val="single" w:sz="8"
     * w:space="0" w:color="000000" /> </w:tcBorders> @param {Object} obj
     */
    this.createTdBorders = function(obj) {
        var e = this.createEle('w:tcBorders');
        for (var i = 0; i < this.EWA_DocTmp.borders.length; i++) {
            var b1 = this.createBorder(obj, this.EWA_DocTmp.borders[i]);
            e.appendChild(b1);
        }
        return e;
    };
    this.createBorder = function(obj, a) {
        var v = $(obj).css('border-' + a + '-width');
        var e = this.createEle('w:' + a);
        if (v == '0px') {
            e.setAttribute('w:val', 'nil');
        } else {
            e.setAttribute('w:val', 'single');
            var c = $(obj).css('border-' + a + '-color');
            var c1 = this.rgb1(c);
            e.setAttribute('w:color', c1);
            e.setAttribute('w:sz', 6);
        }
        return e;
    };
    /**
     * 不可见的分割，用于两个紧连的表分割等
     * 
     * @param {Object}
     *            obj
     * @memberOf {TypeName}
     * @return {TypeName}
     */
    this.createPVanish = function() {
        var elep = this.createElesLvl("w:p,w:pPr,w:rPr,w:vanish");
        return elep;
    };
    this.createP = function(obj) {
        var elep = this.createEle("w:p");
        // <w:pPr>
        // <w:pStyle w:val="a7"/>
        // <w:jc w:val="left"/>
        // <w:rPr>
        // <w:rFonts w:hint="eastAsia"/>
        // </w:rPr>
        // </w:pPr>
        //
        var elepPr = this.createEle("w:pPr");
        elep.appendChild(elepPr);

        var pPrs = this.createElesSameLvl("w:pStyle,w:jc", elepPr);
        var elejc = pPrs[1];

        var al = $(obj).css('text-align');
        al = al == null ? "" : al;
        if (al.indexOf('center') >= 0) {
            elejc.setAttribute("w:val", "center");// 左对齐
        } else if (al.indexOf('right') >= 0) {
            elejc.setAttribute("w:val", "right");// 左对齐
        } else {
            elejc.setAttribute("w:val", "left");// 左对齐
        }

        var eleH = pPrs[0];
        eleH.setAttribute("w:val", "a");

        if (obj.tagName.indexOf('H') == 0) { // head
            eleH.setAttribute("w:val", obj.tagName.replace('H', ''));
        }
        var f = this.createElesLvl("w:rFonts", pPrs[2])[0];
        f.setAttribute("w:hint", "eastAsia");
        this.lastWR = null;

        this.setAtts(elep, {
            "w:rsidR" : "003D2D54",
            "w14:textId" : "77777777",
            "w14:paraId" : this.getParaId(),
            "w:rsidRDefault" : "0057281A"
        });
        return elep;
    };
    /**
     * <w:r> <w:rPr> <w:rFonts w:hint="eastAsia"/> <w:noProof/> </w:rPr>
     * <w:drawing> <wp:inline distT="0" distB="0" distL="0" distR="0"
     * wp14:anchorId="271B1DC6" wp14:editId="7E056E7F"> <wp:extent cx="358820"
     * cy="360000"/> <wp:effectExtent l="0" t="0" r="0" b="0"/> <wp:docPr id="1"
     * name="图片 1"/> <wp:cNvGraphicFramePr> <a:graphicFrameLocks
     * xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
     * noChangeAspect="1"/> </wp:cNvGraphicFramePr> <a:graphic
     * xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
     * <a:graphicData
     * uri="http://schemas.openxmlformats.org/drawingml/2006/picture"> <pic:pic
     * xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
     * <pic:nvPicPr> <pic:cNvPr id="0" name="1.gif"/> <pic:cNvPicPr/>
     * </pic:nvPicPr> <pic:blipFill rotWithShape="1"> <a:blip r:embed="rId8">
     * <a:extLst> <a:ext uri="{28A0092B-C50C-407E-A947-70E740481C1C}">
     * <a14:useLocalDpi
     * xmlns:a14="http://schemas.microsoft.com/office/drawing/2010/main"
     * val="0"/> </a:ext> </a:extLst> </a:blip> <a:srcRect l="-301" t="-466"
     * r="-301" b="-466"/> <a:stretch/> </pic:blipFill> <pic:spPr bwMode="auto">
     * <a:xfrm> <a:off x="0" y="0"/> <a:ext cx="362156" cy="363346"/> </a:xfrm>
     * <a:prstGeom prst="rect"> <a:avLst/> </a:prstGeom> <a:ln> <a:noFill/>
     * </a:ln> <a:extLst> <a:ext uri="{53640926-AAD7-44d8-BBD7-CCE9431645EC}">
     * <a14:shadowObscured
     * xmlns:a14="http://schemas.microsoft.com/office/drawing/2010/main"/>
     * </a:ext> </a:extLst> </pic:spPr> </pic:pic> </a:graphicData> </a:graphic>
     * </wp:inline> </w:drawing> </w:r>
     * 
     * @param {Object}
     *            obj
     * @memberOf {TypeName}
     */
    this.createPic = function(obj) {
        var o = $(obj);
        var picName = obj.src;
        this.pics.push(obj.src);

        var idx = picName.lastIndexOf('/');
        picName = picName.substring(idx + 1);
        var emuX = this.px2emu(o.width());
        var emuY = this.px2emu(o.height());

        var rs = this.createElesLvl("w:r,w:rPr,w:noProof");
        var wr = rs[0];
        var wdraws = this.createElesLvl("w:drawing,wp:inline,wp:extent");
        wr.appendChild(wdraws[0]);
        wExtent = wdraws[2];
        this.setAtts(wExtent, {
            'cx' : emuX,
            'cy' : emuY
        });

        var wpInline = wdraws[1];
        this.setAtts(wpInline, {
            distT : "0",
            distB : "0",
            distL : "0",
            distR : "0"
        });
        var eles = this.createElesSameLvl(
                'wp:effectExtent,wp:docPr,wp:cNvGraphicFramePr', wpInline);
        this.setAtts(eles[0], {
            l : "0",
            t : "0",
            r : "0",
            b : "0"
        });
        this.setAtts(eles[1], {
            id : "0",
            name : picName
        });
        var a_graphicFrameLocks = this.createEleNs('a:graphicFrameLocks',
                'http://schemas.openxmlformats.org/drawingml/2006/main');
        eles[2].appendChild(a_graphicFrameLocks);
        this.setAtts(a_graphicFrameLocks, {
            noChangeAspect : 1
        });
        // <a:graphic
        // xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
        // <a:graphicData
        // uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
        // <pic:pic
        // xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">

        var a_graphic = this.createEleNs('a:graphic',
                "http://schemas.openxmlformats.org/drawingml/2006/main");
        var a_graphicData = this.createEle('a:graphicData');
        a_graphicData.setAttribute('uri',
                "http://schemas.openxmlformats.org/drawingml/2006/picture");
        var pic_pic = this.createEleNs('pic:pic',
                "http://schemas.openxmlformats.org/drawingml/2006/picture");
        a_graphic.appendChild(a_graphicData);
        a_graphicData.appendChild(pic_pic);
        wpInline.appendChild(a_graphic);

        var pics = this.createElesSameLvl('pic:nvPicPr,pic:blipFill,pic:spPr',
                pic_pic);
        this.setAtts(pics[1], {
            'rotWithShape' : "1"
        });
        this.setAtts(pics[2], {
            'bwMode' : "auto"
        });
        // <pic:nvPicPr>
        // <pic:cNvPr id="0" name="1.gif"/>
        // <pic:cNvPicPr/>
        var nvPicPrs = this
                .createElesSameLvl('pic:cNvPr,pic:cNvPicPr', pics[0]);
        this.setAtts(nvPicPrs[0], {
            id : "0",
            name : picName
        });
        // <a:blip r:embed="rId8">
        // <a:extLst>
        // <a:ext uri="{28A0092B-C50C-407E-A947-70E740481C1C}">
        // <a14:useLocalDpi
        // xmlns:a14="http://schemas.microsoft.com/office/drawing/2010/main"
        // val="0"/>
        // </a:ext>
        // </a:extLst>
        // </a:blip>
        // <a:srcRect l="-301" t="-466" r="-301" b="-466"/>
        // <a:stretch/>
        var pic_blipFills = this.createElesSameLvl(
                'a:blip,a:srcRect,a:stretch', pics[1]);
        this.setAtts(pic_blipFills[0], {
            'r:embed' : "pic" + (this.pics.length - 1)
        });
        this.setAtts(pic_blipFills[1], {
            l : "0",
            t : "0",
            r : "0",
            b : "0"
        });
        var a_extLsts = this.createEles('a:extLst,a:ext');
        pic_blipFills[0].appendChild(a_extLsts[0]);
        a_extLsts[1].setAttribute('uri',
                "{28A0092B-C50C-407E-A947-70E740481C1C}");

        var a14_useLocalDpi = this.createEleNs('a14:useLocalDpi',
                'http://schemas.microsoft.com/office/drawing/2010/main');
        a14_useLocalDpi.setAttribute('val', 0);
        a_extLsts[1].appendChild(a14_useLocalDpi);
        // <a:xfrm>
        // <a:off x="0" y="0"/>
        // <a:ext cx="362156" cy="363346"/>
        // </a:xfrm>
        // <a:prstGeom prst="rect">
        // <a:avLst/>
        // </a:prstGeom>
        // <a:ln>
        // <a:noFill/>
        // </a:ln>
        // <a:extLst>
        // <a:ext uri="{53640926-AAD7-44d8-BBD7-CCE9431645EC}">
        // <a14:shadowObscured
        // xmlns:a14="http://schemas.microsoft.com/office/drawing/2010/main"/>
        // </a:ext>
        // </a:extLst>

        var pic_spPrs = this.createElesSameLvl(
                'a:xfrm,a:prstGeom,a:ln,a:extLst', pics[2]);
        this.setAtts(pic_spPrs[1], {
            prst : "rect"
        });
        var axfrms = this.createElesSameLvl('a:off,a:ext', pic_spPrs[0]);
        this.setAtts(axfrms[0], {
            x : 0,
            y : 0
        });
        this.setAtts(axfrms[1], {
            cx : emuX,
            cy : emuY
        });
        this.createElesSameLvl('a:avLst', pic_spPrs[1]);
        this.createElesSameLvl('a:noFill', pic_spPrs[2]);
        // var a_ext = this.createElesSameLvl('a:ext', pic_spPrs[3])[0];
        // a_ext.setAttribute('uri', '{53640926-AAD7-44d8-BBD7-CCE9431645EC}');
        // var a14_shadowObscured = this.createEleNs("a14:shadowObscured",
        // "http://schemas.microsoft.com/office/drawing/2010/main");
        // a_ext.appendChild(a14_shadowObscured);

        return wr;
    };
    this.createEleNs = function(tag, ns) {
        var ele8 = this.doc.XmlDoc.createElementNS(ns, tag);
        return ele8;
    }
    this.setAtts = function(node, params) {
        for ( var n in params) {
            node.setAttribute(n, params[n]);
        }
    }
    this.fontSize = function(f) {

        if (f.indexOf('px') > 0) {
            var f0 = this.EWA_DocTmp.f[f];
            if (f0 == null) {
                f = '9pt';
            } else {
                f = f0;
            }

        }

        var f1 = f.replace('pt', '');
        return f1;
    };
    this.rgb1 = function(s1) {
        var s = s1.replace('rgb(', '').replace(')', '');
        var ss = s.split(',');
        return this.rgb(ss[0] * 1, ss[1] * 1, ss[2] * 1).toUpperCase();
    };
    this.rgb = function(r, g, b) {
        var r1 = r.toString(16);
        var g1 = g.toString(16);
        var b1 = b.toString(16);
        return (r1.length < 2 ? "0" : "") + r1 + (g1.length < 2 ? "0" : "")
                + g1 + (b1.length < 2 ? "0" : "") + b1;
    };

    this.init = function() {
        this.doc = new EWA_XmlClass();
        this.doc.LoadXml(this.EWA_DocTmp.document);
        if (EWA.B.IE) {
            this.docks.push(this.doc.XmlDoc.getElementsByTagName('w:body')[0]);
        } else {
            this.docks.push(this.doc.XmlDoc.childNodes[0].childNodes[0]);
        }
    };
    this.getDock = function() {
        return this.docks[this.docks.length - 1];
    };
    this.idx = 0
    this.docksPop = function(o) {
        while (1 == 1) {
            if (this.docks.length == 1) {
                break;
            }
            var o1 = this.docks.pop();
            if (o1 == o) {
                // console.log(this.docks);
                break;
            }
        }
    };
    this.getDockTable = function() {
        for (var i = this.docks.length - 1; i >= 0; i--) {
            var o = this.docks[i];
            if (o.tagName == 'w:body' || o.tagName == 'w:tc') {
                return o;
            }
        }
    };
    /**
     * 包括英制单位（914,400 个 EMU 单位为 1 英寸）
     * 
     * @param {Object}
     *            v
     * @return {TypeName}
     */
    this.px2emu = function(v) {
        return parseInt(v / 96 * 914400);
    }
    this.EWA_DocTmp = {
        document : '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
                + '<w:document'
                + '				xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas"'
                + '				xmlns:mo="http://schemas.microsoft.com/office/mac/office/2008/main"'
                + '				xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"'
                + '				xmlns:mv="urn:schemas-microsoft-com:mac:vml" xmlns:o="urn:schemas-microsoft-com:office:office"'
                + '				xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"'
                + '				xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"'
                + '				xmlns:v="urn:schemas-microsoft-com:vml"'
                + '				xmlns:wp14="http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing"'
                + '				xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"'
                + '				xmlns:w10="urn:schemas-microsoft-com:office:word"'
                + '				xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"'
                + '				xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml"'
                + '				xmlns:wpg="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup"'
                + '				xmlns:wpi="http://schemas.microsoft.com/office/word/2010/wordprocessingInk"'
                + '				xmlns:wne="http://schemas.microsoft.com/office/word/2006/wordml"'
                + '				xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape"'
                + '				mc:Ignorable="w14 wp14"><w:body></w:body></w:document>',
        r : '<w:r w:rsidR="00A0061C" w:rsidRPr="00A0061C"><w:rPr>'
                + '<w:rFonts w:ascii="[FONT]" w:eastAsia="[FONT]" w:hAnsi="[FONT]" w:hint="eastAsia" />'
                + '<w:b /><w:i /><w:color w:val="FF0000" />'
                + '<w:sz w:val="36" /><w:szCs w:val="36" />'
                + '<w:u w:val="single" /></w:rPr><w:t>看看</w:t></w:r>',
        f : {
            "9px" : "7pt",
            "10px" : "7.5pt",
            "11px" : "8.5pt",
            "12px" : "9pt",
            "13px" : "10pt",
            "14px" : "10.5pt",
            "15px" : "11.5pt",
            "16px" : "12pt",
            "17px" : "13pt",
            "18px" : "13.5pt",
            "19px" : "14.5pt",
            "20px" : "15pt",
            "21px" : "16pt",
            "22px" : "16.5pt",
            "23px" : "17.5pt",
            "24px" : "18pt",
            "25px" : "19pt",
            "26px" : "19.5pt",
            "27px" : "20.5pt",
            "28px" : "21pt",
            "29px" : "22pt",
            "30px" : "22.5pt",
            "31px" : "23.5pt",
            "32px" : "24pt",
            "33px" : "25pt",
            "34px" : "25.5pt",
            "35px" : "26.5pt",
            "36px" : "27pt",
            "37px" : "28pt",
            "38px" : "28.5pt",
            "39px" : "29.5pt",
            "40px" : "30pt",
            "41px" : "31pt",
            "42px" : "31.5pt",
            "43px" : "32.5pt",
            "44px" : "33pt",
            "45px" : "34pt",
            "46px" : "34.5pt",
            "47px" : "35.5pt",
            "48px" : "36pt",
            "49px" : "37pt",
            "50px" : "37.5pt",
            "51px" : "38.5pt",
            "52px" : "39pt",
            "53px" : "40pt",
            "54px" : "40.5pt",
            "55px" : "41.5pt",
            "56px" : "42pt",
            "57px" : "43pt",
            "58px" : "43.5pt",
            "59px" : "44.5pt",
            "60px" : "45pt",
            "61px" : "46pt",
            "62px" : "46.5pt",
            "63px" : "47.5pt",
            "64px" : "48pt",
            "65px" : "49pt",
            "66px" : "49.5pt",
            "67px" : "50.5pt",
            "68px" : "51pt",
            "69px" : "52pt",
            "70px" : "52.5pt",
            "71px" : "53.5pt",
            "72px" : "54pt",
            "73px" : "55pt",
            "74px" : "55.5pt",
            "75px" : "56.5pt",
            "76px" : "57pt",
            "77px" : "58pt",
            "78px" : "58.5pt",
            "79px" : "59.5pt",
            "80px" : "60pt",
            "81px" : "61pt",
            "82px" : "61.5pt",
            "83px" : "62.5pt",
            "84px" : "63pt",
            "85px" : "64pt",
            "86px" : "64.5pt",
            "87px" : "65.5pt",
            "88px" : "66pt",
            "89px" : "67pt",
            "90px" : "67.5pt",
            "91px" : "68.5pt",
            "92px" : "69pt",
            "93px" : "70pt",
            "94px" : "70.5pt",
            "95px" : "71.5pt",
            "96px" : "72pt",
            "97px" : "73pt",
            "98px" : "73.5pt",
            "99px" : "74.5pt"
        },
        borders : [ 'top', 'bottom', 'right', 'left' ]
    };
    this.postData = function() {
        var data = {
            xml : this.xml(),
            pics : this.pics.join(','),
            ols : this.liNum
        };
        return data;
    }
    this.init();
    this.xml = function() {
        return this.doc.GetXml();
    };
};
// var word = new EWA_DocWordClass();
// word.walker(oo);
// word.xml();
;
function EWA_OdtDocWordClass() {
    this.docks = [];
    this.pics = [];
    this.liNum = 0;// numering.xml defined
    this.start = false;
    this.defaultFontEnglish = "Century Gothic";
    this.defaultFontChinese = "Microsoft YaHei";
    this.walker = function (obj) {

        this.fixTable();
        this.walker1(obj);
        this.unFixTable();
    };
    this.walker1 = function (obj) {

        if (obj.nodeType == 3) {
            this.walkerTxt(obj)
        } else if (obj.nodeType == 1) {
            this.walkerEle(obj)
        }
    };
    this.walkerEle = function (obj) {
        if (obj.style.display == 'none') {
            return;
        }
        if (obj.id == 'pp' && obj.tagName == 'CENTER') {
            console.log("skip->", obj.outerHTML);
            return;
        }
        var t = obj.tagName;
        var endPop = false;
        var o;
        if (t == 'DIV' && (obj.className.indexOf('page-next-before') >= 0 || obj.className
            .indexOf('page-next-after') >= 0)) {
            // 分页符号
            o = this.createBreak();
            var p = this.docks[0];
            console.log('break', o)
            p.appendChild(o);
            endPop = true;
        } else if (t == 'UL' || t == 'OL') {
            o = this.createUl(obj);
            var p = this.getDockTable();
            p.appendChild(o);
            this.docks.push(o);
            endPop = true;
        } else if (t == 'LI') {
            o = this.createLi(obj);
            var p = this.getDock();
            p.appendChild(o);
            this.docks.push(o);
            endPop = true;
        } else if (t == 'BR') {
            o = this.createBr(obj);
            var p = this.getDock();
            if (p.tagName != 'text:p') { // td
                var p0 = this.createP(obj.parentNode);
                this.docks.push(p0);
                p0.appendChild(o);
            } else {
                p.appendChild(o);
            }
            this.lastWR = null;
        } else if (t == 'IMG') {
            var p = this.getDock();
            console.log(p);
            o = this.createPic(obj);
            if (p.tagName != 'text:p') { // td
                var p0 = this.createP(obj.parentNode);
                p0.appendChild(o);
                p.appendChild(p0);
                this.docks.push(p0);
                endPop = true;
                o = p0; // 交换父体 2022-01-02
            } else {
                p.appendChild(o);
            }
            this.lastWR = null;
        } else if (t == 'TABLE') {
            var prt = this.getDockTable();
            o = this.createTable(obj);
            endPop = true;
            prt.appendChild(o);
            this.docks.push(o);
        } else if (t == 'TBODY') {

        } else if (t == 'TR') {
            o = this.createTr(obj);
            this.getDock().appendChild(o);
            this.docks.push(o);
            endPop = true;
        } else if (t == 'TD') {
            o = this.createTd(obj);
            this.getDock().appendChild(o);
            if (o.tagName == 'table:covered-table-cell') {
                return;
            }
            this.docks.push(o);

            endPop = true;
        } else if (t == 'HR') {
            var p = this.getDockTable();
            o = this.createP(obj);
            var wr = this.createSpan(obj);
            o.appendChild(wr);
            var hr = this.createHr();
            wr.appendChild(hr);
            this.lastWR = null;
            p.appendChild(o);
        } else if (t == 'H1' || t == 'H2' || t == 'H3' || t == 'P'
            || t == 'CENTER' || t == 'DIV') {
            var p = this.getDockTable();
            o = this.createP(obj);

            p.appendChild(o);
            this.docks.push(o);
            endPop = true;
        } else if (t == 'SCRIPT') {
            return;
        }// else if (t == 'BODY' || t == 'OL' || t == 'UL') {

        // } else {

        // }
        for (var i = 0; i < obj.childNodes.length; i++) {
            var ochild = obj.childNodes[i];
            this.walker1(ochild);
        }
        if (endPop) {
            this.docksPop(o);
            this.lastWR = null;
        }
    };
    /**
     * 遍历文本节点并处理其中的中文全角空格
     * @param {Object} obj - 文本节点对象
     */
    this.walkerTxt = function (obj) {
        let zwkg = '　'; // 中文全角空格 &#12288;
        // 如果节点值为空或者不包含中文全角空格，则不做处理
        if (obj.nodeValue.trimEx() == "" && obj.nodeValue.indexOf(zwkg) == -1) {
            this.lastWR = null;
            return;
        } 

        // 创建一个span元素用于包裹处理后的文本
        var eleTxt = this.createSpan(obj.parentNode);
        // 将节点值中的普通空格替换为标准空格
        var v = obj.nodeValue.replace(/ /ig, ' ');

        // 如果父节点是TD或P标签，则去除文本首尾的空格
        if (obj.parentNode.tagName == 'TD' || obj.parentNode.tagName == 'P') {
            let zwkgTh = '【zwer中，wer,文_全`角=空格werwe】'; // 用于替换中文全角空格的临时字符串
            // 检查节点值中是否包含中文全角空格
            let hasZwkg = obj.nodeValue.indexOf(zwkg) >= 0;
            // 如果包含中文全角空格，则进行替换处理
            if (hasZwkg) {

                let exp1 = eval('/' + zwkg + '/g');
                v = v.replace(exp1, zwkgTh);
            }
            v = v.trim();
            // 将临时替换字符串还原为中文全角空格
            if (hasZwkg) {
                let exp = eval('/' + zwkgTh + '/g');
                v = v.replace(exp, zwkg);
            }
        }

        // 根据浏览器类型设置文本内容
        if (EWA.B.IE) {
            eleTxt.text = v;
        } else {
            eleTxt.textContent = v;
        }

        // 获取当前节点的父级P元素
        var p = this.getDock();

        // 如果父级不是P元素，则创建一个新的P元素并添加到文档中
        if (p.tagName != 'text:p') {
            var p0 = this.createP(obj.parentNode);
            p0.appendChild(eleTxt);
            p.appendChild(p0);
            this.docks.push(p0);
        } else {
            // 如果父级已经是P元素，则直接添加到文档中
            p.appendChild(eleTxt);
        }
    };

    this.fixTable = function () {
        var objs = $('td[colspan]').toArray();
        for (var m = 0; m < objs.length; m++) {
            var o = objs[m];
            var tr = o.parentNode;
            var a = o.colSpan;
            o.setAttribute('m_colspan', a);
            for (var i = 0; i < a - 1; i++) {
                var td = tr.insertCell(o.cellIndex + i + 1);
                td.innerHTML = i;
                td.bgColor = 'blue';
                td.className = 'colspan';
                td.setAttribute('fixed', '1');
                td.style.display = 'none';
            }
            // o.colSpan = "";
        }

        $('td[rowspan]').each(
            function () {
                var a = this.rowSpan;
                var tr = this.parentNode;
                var tb = tr.parentNode.parentNode;
                for (var i = 0; i < a - 1; i++) {
                    var td = tb.rows[tr.rowIndex + i + 1]
                        .insertCell(this.cellIndex);
                    td.innerHTML = i;
                    td.bgColor = 'green';
                    td.className = 'rowspan';
                    td.setAttribute('fixed', '1');
                }
                $(this).attr('m_rowspan', a);
                this.rowSpan = "";
            });

    };
    this.unFixTable = function () {
        $('td[fixed]').each(function () {
            this.parentNode.removeChild(this);
        });
        $('td[m_colspan]').each(function () {
            this.colSpan = this.getAttribute('m_colspan');
        });
        $('td[m_rowspan]').each(function () {
            this.rowSpan = this.getAttribute('m_rowspan');
        });
    }
    this.createEle = function (tag) {
        var ele8 = this.doc.XmlDoc.createElement(tag);
        return ele8;
    };
    this.createEles = function (tags) {
        var tt = tags.split(',');
        var rts = [];
        for (var i = 0; i < tt.length; i++) {
            var ele8 = this.createEle(tt[i].trim());
            rts.push(ele8);
            if (i > 0) {
                rts[0].appendChild(ele8);
            }
        }
        return rts;
    };
    this.createElesLvl = function (tags) {
        var tt = tags.split(',');
        var rts = [];
        for (var i = 0; i < tt.length; i++) {
            var ele8 = this.createEle(tt[i].trim());
            rts.push(ele8);
            if (i > 0) {
                rts[i - 1].appendChild(ele8);
            }
        }
        return rts;
    };
    this.createElesSameLvl = function (tags, pNode) {
        var tt = tags.split(',');
        var rts = [];
        for (var i = 0; i < tt.length; i++) {
            var ele8 = this.createEle(tt[i].trim());
            rts.push(ele8);
            pNode.appendChild(ele8);
        }
        return rts;
    }

    this.createHr = function () {
        // <w:pict w14:anchorId="0C1134BF">
        // <v:rect id="_x0000_i1037" style="width:.05pt;height:1pt"
        // o:hralign="center" o:hrstd="t"
        // o:hrnoshade="t" o:hr="t" fillcolor="black [3213]" stroked="f"/>
        // </w:pict>
        var hr = this.createElesLvl('w:pict,v:rect');
        hr[0].setAttribute('w14:anchorId', this.getParaId());
        this.setAtts(hr[1], {
            style: "width:.05pt;height:1pt",
            "o:hralign": "center",
            "o:hrstd": "t",
            "o:hrnoshade": "t",
            "o:hr": "t",
            fillcolor: "black [3213]",
            stroked: "f"
        });
        return hr[0];
    };
    this.createUl = function (obj) {
        // <text:list xml:id="list6985372980825310444" text:style-name="L1">
        var ul = this.createEle('text:list');
        var stName = obj.tagName == 'OL' ? 'L1' : 'L2';
        ul.setAttribute('text:style-name', stName);
        return ul;
    }
    this.createLi = function (obj) {
        var li = this.createEle('text:list-item');
        return li;
    };
    this.createStyle = function (obj) {
        // <style:style style:name="P5" style:family="paragraph"
        // style:parent-style-name="Standard">
        // <style:paragraph-properties fo:text-align="end"
        // style:justify-single-word="false"/>
        // <style:text-properties style:font-name="黑体" fo:font-size="16pt"
        // style:font-name-asian="黑体" style:font-size-asian="16pt"
        // style:font-size-complex="16pt"/>
        // </style:style>
        var st = this.createEle("style:style");
        st.setAttribute('style:family', "text");
        var o = $(obj);

        // font family && font size
        var tp = this.createEle("style:text-properties");
        st.appendChild(tp);

        if (o.css('font-family') != '') {// color
            var fontlist = o.css('font-family').replace(/\'/ig, "").split(',');

            var f1 = this.defaultFontEnglish;
            var f2 = this.defaultFontChinese;
            var fs = this.fontSize(o.css('font-size'));
            var css = {
                "style:font-name": f1,
                "style:font-name-asian": f2,
                "fo:font-size": fs,
                "style:font-size-complex": fs,
                "style:font-size-asian": fs
            }
            this.setAtts(tp, css);
        }

        if (o.css('color') != '') {// color
            var c1 = '#' + this.rgb1(o.css('color')).toLowerCase();
            tp.setAttribute("fo:color", c1);
        }
        var b = o.css('font-weight');
        if (o.tagName == 'B' || !(b == '' || b == 'normal' || b == '400')) {
            tp.setAttribute("fo:font-weight", "bold");
            tp.setAttribute("style:font-weight-complex", "bold");
            tp.setAttribute("style:font-weight-asian", "bold");
        }
        if (o.tagName == 'I') {
            tp.setAttribute("fo:font-style", "italic");
            tp.setAttribute("style:font-style-complex", "italic");
            tp.setAttribute("style:font-style-asian", "italic")
        }
        return this.checkExistsStyle(st);
    };
    this.createStyleBreak = function () {
        /*
         * <style:style style:name="P1" style:family="paragraph"
         * style:parent-style-name="Standard"> <style:paragraph-properties
         * fo:break-before="page" /> </style:style>
         */
        var st = this.createEle("style:style");
        st.setAttribute('style:family', "paragraph");
        var stpp = this.createEle("style:paragraph-properties");
        st.appendChild(stpp);
        this.setAtts(stpp, {
            "fo:break-before": "page"
        });
        return this.checkExistsStyle(st);
    };
    this.createStyleP = function (obj) {
        // <style:style style:name="P5" style:family="paragraph"
        // style:parent-style-name="Standard">
        // <style:paragraph-properties fo:text-align="end"
        // style:justify-single-word="false" fo:margin-left="1.482cm"
        // fo:margin-right="0cm" fo:line-height="150%"/>
        // </style:style>
        var st = this.createEle("style:style");
        st.setAttribute('style:family', "paragraph");
        var stpp = this.createEle("style:paragraph-properties");
        st.appendChild(stpp);
        var o = $(obj);
        var al = o.css('text-align');
        al = al == null ? "" : al;
        if (al.indexOf('center') >= 0) {
            al = "center";// 左对齐
        } else if (al.indexOf('right') >= 0) {
            al = "end";// 左对齐
        } else {
            al = "";
        }
        // align
        if (al != "") {
            this.setAtts(stpp, {
                "fo:text-align": al
            });
        }
        var ml = o.css('margin-left').replace('px', '');
        var mr = o.css('margin-right').replace('px', '');

        var mlcm = this.px2cm(ml) + 'cm';
        var mrcm = this.px2cm(mr) + 'cm';

        this.setAtts(stpp, {
            "fo:margin-left": mlcm,
            "fo:margin-right": mrcm,
            "fo:text-indent": "0cm",
            "style:justify-single-word": "false"
        });
        // var mt = o.css('margin-top').replace('px', '');
        // var mb = o.css('margin-bottom').replace('px', '');
        // var lh = o.css('font-size').replace('px', '');
        // var lh1 = ((mt * 1.0 + mb * 1 + lh * 1) / lh -1)* 100;
        // this.setAtts(stpp, {
        // "fo:margin-left" : mlcm,
        // "fo:margin-right" : mrcm,
        // "fo:line-height" : lh1 + "%"
        // });
        return this.checkExistsStyle(st);
    };
    /**
     * 字体是否已经存在
     * 
     * @param {Object}
     *            st
     * @memberOf {TypeName}
     * @return {TypeName}
     */
    this.checkExistsStyle = function (st) {
        var s = st.outerHTML;
        if (this.fontMap[s]) {
            return this.fontMap[s];
        }
        var stName = this.getStyleName();
        this.setAtts(st, {
            "style:name": stName
        });
        this.fontMap[s] = stName;
        var parent = this.doc.XmlDoc.getElementsByTagName("automatic-styles");
        if (parent.length == 0) {// chrome 60+
            parent = this.doc.XmlDoc
                .getElementsByTagName("office:automatic-styles");
        }
        parent[0].appendChild(st);
        return stName;
    }
    this.createStyleTd = function (obj) {
        // <style:style style:name="表格1.A1" style:family="table-cell"
        // style:data-style-name="N0">
        // <style:table-cell-properties fo:padding="0.097cm"
        // fo:border-left="0.002cm solid #000000"
        // style:vertical-align="middle" fo:background-color="transparent"
        // fo:border-right="none" fo:border-top="0.002cm solid #000000"
        // fo:border-bottom="0.002cm solid #000000"/>
        // </style:style>
        var st = this.createEle("style:style");
        this.setAtts(st, {
            "style:family": "table-cell",
            "style:data-style-name": "NO"
        });
        var stpp = this.createEle("style:table-cell-properties");
        st.appendChild(stpp);
        this.setAtts(stpp, {
            "fo:background-color": "transparent",
            "fo:padding": "0.097cm"
        });
        for (var i = 0; i < this.EWA_DocTmp.borders.length; i++) {
            var n = this.EWA_DocTmp.borders[i];
            var b1 = this.createBorder(obj, n);
            stpp.setAttribute("fo:border-" + n, b1);
        }
        var o = $(obj);
        var vAlign = o.css("vertical-align");
        if (vAlign == 'middle') {
            stpp.setAttribute('style:vertical-align', 'middle');
        } else if (vAlign == 'bottom') {
            stpp.setAttribute('style:vertical-align', 'bottom');
        }
        return this.checkExistsStyle(st);
    };
    this.createStyleCol = function (obj) {
        // <style:style style:name="表格1.A" style:family="table-column">
        // <style:table-column-properties style:column-width="8.498cm"/>
        // </style:style>
        var st = this.createEle("style:style");
        this.setAtts(st, {
            "style:family": "table-column"
        });
        var stpp = this.createEle("style:table-column-properties");
        st.appendChild(stpp);
        var w = $(obj).width();
        var w1 = this.px2cm(w);
        stpp.setAttribute('style:column-width', w1 + 'cm');
        var st1 = this.checkExistsStyle(st);
        // console.log(st)
        return st1;
    };
    this.createStyleTable = function (obj) {
        //
        // <style:style style:name="表格1" style:family="table">
        // <style:table-properties style:width="17cm" table:align="center"
        // style:shadow="none"/>
        // </style:style>
        var st = this.createEle("style:style");
        this.setAtts(st, {
            "style:family": "table"
        });
        var stpp = this.createEle("style:table-properties");
        st.appendChild(stpp);
        var w = $(obj).width();
        var w1 = this.px2cm(w);
        stpp.setAttribute('style:width', w1 + 'cm');
        stpp.setAttribute("style:shadow", "none");
        return this.checkExistsStyle(st);
    };

    this.getStyleName = function () {
        this.fontIndex++;
        return "ST" + this.fontIndex;
    };
    this.fontIndex = 0;
    this.fontMap = {};
    this.createSpan = function (obj) {
        // <text:span text:style-name="T5">
        var r = this.createEle("text:span");
        var stName = this.createStyle(obj);
        r.setAttribute("text:style-name", stName);
        return r;
    };
    this.createBr = function (obj) {
        var bele = this.createEle("text:line-break");
        return bele;
    };
    this.createTable = function (obj) {
        var bele = this.createEle("table:table");
        // <table:table table:name="表格1" table:style-name="表格1">
        bele.setAttribute('table:name', 'gdx' + Math.random());
        var maxCellsTr = {
            row: null,
            num: -1
        };
        if (obj.id == 'EWA_FRAME_G1375752461') {
            var zzzzzzzz = 1;
        }
        for (var i = 0; i < obj.rows.length; i++) {
            var tr = obj.rows[i];
            var num = 0;
            for (var m = 0; m < tr.cells.length; m++) {
                var td = tr.cells[m];
                if (td.getAttribute('fixed')) { // 生成前补充的td
                    continue;
                }
                num++;
            }
            if (num > maxCellsTr.num) {
                maxCellsTr.num = num;
                maxCellsTr.row = tr;
            }
        }
        // console.log(maxCellsTr)
        if (maxCellsTr.row) {
            for (var i = 0; i < maxCellsTr.row.cells.length; i++) {
                var col = this.createEle("table:table-column");
                var colSt = this.createStyleCol(maxCellsTr.row.cells[i]);
                col.setAttribute('table:style-name', colSt);
                bele.appendChild(col);
            }
            // console.log(bele)
        }
        var tbSt = this.createStyleTable(obj);
        bele.setAttribute('table:style-name', tbSt);
        return bele;
    };

    this.createTr = function (obj) {
        // table:table-row
        var tr = this.createEle("table:table-row");
        return tr;
    };
    this.paraId = 0;
    this.getParaId = function () {
        var v = "0000" + this.paraId;
        v = v.substring(v.length - 4);
        this.paraId++;
        return "F0C0" + v;
    }
    this.createTd = function (obj) {
        // <table:table-cell table:style-name="A2" office:value-type="string">
        if (obj.className == 'rowspan' || obj.className == 'colspan') {
            return this.createEle('table:covered-table-cell');
        }
        var bele = this.createEle("table:table-cell");
        if (obj.getAttribute("m_rowspan") > 1) {
            bele.setAttribute('table:number-rows-spanned', obj
                .getAttribute("m_rowspan"));
        }
        if (obj.getAttribute("m_colspan") > 1) {
            bele.setAttribute('table:number-columns-spanned', obj
                .getAttribute("m_colspan"));
        }
        bele.setAttribute('office:value-type', "string");

        var stName = this.createStyleTd(obj);
        bele.setAttribute('table:style-name', stName);
        return bele;
    };
    this.createWidth = function (obj, tag) {
        // <w:tblW w:w="8702" w:type="dxa" />
        var e = this.createEle('w:' + tag);
        var w = $(obj).width() * 15; // px-->word width
        e.setAttribute('w:w', w);
        e.setAttribute('w:type', "dxa");
        return e;
    };
    this.createHeight = function (obj, tag) {
        // <w:trHeight w:val="10121"/>
        var e = this.createEle('w:' + tag);
        var h = $(obj).height() * 15; // px-->word width
        e.setAttribute('w:val', h);
        return e;
    };
    /*
     * <style:table-cell-properties fo:padding="0.097cm" fo:border-left="0.002cm
     * solid #000000" fo:border-right="none" fo:border-top="0.002cm solid
     * #000000" fo:border-bottom="0.002cm solid #000000"/>
     */
    this.createBorder = function (obj, a) {
        // "0.002cm solid #000000"
        var v1 = "";
        var v = $(obj).css('border-' + a + '-width');
        var e = this.createEle('w:' + a);
        if (v == '0px') {
            v1 = "none";
        } else {
            v1 = "0.002cm ";
            v1 += $(obj).css('border-' + a + '-style');
            var c = $(obj).css('border-' + a + '-color');
            var c1 = this.rgb1(c).toLowerCase();
            v1 += " #" + c1;
        }
        return v1;
    };
    /**
     * 不可见的分割，用于两个紧连的表分割等
     * 
     * @param {Object}
     *            obj
     * @memberOf {TypeName}
     * @return {TypeName}
     */
    this.createPVanish = function () {
        var elep = this.createElesLvl("w:p,w:pPr,w:rPr,w:vanish");
        return elep;
    };
    this.createP = function (obj) {
        // <text:p text:style-name="Standard"/>
        var elep = this.createEle("text:p");

        var stName = this.createStyleP(obj);
        elep.setAttribute("text:style-name", stName);
        return elep;
    };
    /**
     * 创建分页
     */
    this.createBreak = function () {
        var elep = this.createEle("text:p");
        var stName = this.createStyleBreak();
        elep.setAttribute("text:style-name", stName);
        return elep;
    };
    this.createPic = function (obj) {
        /*
         * <draw:frame draw:style-name="fr1" draw:name="图形1"
         * text:anchor-type="as-char" svg:width="4.233cm" svg:height="4.233cm"
         * draw:z-index="0"> <draw:image
         * xlink:href="Pictures/10000201000000A0000000A0214A9447.png"
         * xlink:type="simple" xlink:show="embed" xlink:actuate="onLoad"/>
         * </draw:frame>
         */
        var o = $(obj);
        var picName = obj.src;
        this.pics.push(obj.src);

        var idx = picName.lastIndexOf('/');
        picName = picName.substring(idx + 1);
        var emuX = this.px2cm(o.width());
        var emuY = this.px2cm(o.height());

        var rs = this.createElesLvl("draw:frame,draw:image");
        this.setAtts(rs[0], {
            'svg:width': emuX + 'cm',
            'svg:height': emuY + 'cm',
            "draw:z-index": "0",
            "draw:style-name": "fr1",
            "text:anchor-type": "as-char"
        });
        this.setAtts(rs[1], {
            'xlink:type': 'simple',
            'xlink:show': 'embed',
            "xlink:actuate": "onLoad",
            "xlink:href": "{[PIC" + (this.pics.length - 1) + "]}"
        });

        return rs[0];
    };
    this.createEleNs = function (tag, ns) {
        var ele8 = this.doc.XmlDoc.createElementNS(ns, tag);
        return ele8;
    }
    this.setAtts = function (node, params) {
        for (var n in params) {
            node.setAttribute(n, params[n]);
        }
    }
    this.fontSize = function (f) {
        if (f.indexOf('px') > 0) {
            var f0 = this.EWA_DocTmp.f[f];
            if (f0 == null) {
                f = '9pt';
            } else {
                f = f0;
            }
        }
        var f1 = f.replace('pt', '');
        return f1;
    };
    this.rgb1 = function (s1) {
        var s = s1.replace('rgb(', '').replace(')', '');
        var ss = s.split(',');
        return this.rgb(ss[0] * 1, ss[1] * 1, ss[2] * 1).toUpperCase();
    };
    this.rgb = function (r, g, b) {
        var r1 = r.toString(16);
        var g1 = g.toString(16);
        var b1 = b.toString(16);
        return (r1.length < 2 ? "0" : "") + r1 + (g1.length < 2 ? "0" : "")
            + g1 + (b1.length < 2 ? "0" : "") + b1;
    };

    this.init = function () {
        this.doc = new EWA_XmlClass();
        this.doc.LoadXml(this.EWA_DocTmp.document);
        var firstDock = this.doc.XmlDoc.getElementsByTagName('text');
        if (firstDock.length == 0) { // chrome 60+
            firstDock = this.doc.XmlDoc.getElementsByTagName('office:text');
        }
        this.docks.push(firstDock[0]);
    };
    this.getDock = function () {
        return this.docks[this.docks.length - 1];
    };
    this.idx = 0
    this.docksPop = function (o) {
        // console.log(o);
        while (1 == 1) {
            if (this.docks.length == 1) {
                break;
            }
            var o1 = this.docks.pop();
            // console.log(o1, o);
            if (o1 == o) {
                break;
            }
        }
    };
    this.getDockTable = function () {
        for (var i = this.docks.length - 1; i >= 0; i--) {
            var o = this.docks[i];
            if (o
                && (o.tagName == 'office:text'
                    || o.tagName == 'table:table-cell' || o.tagName == 'text:list-item')) {
                return o;
            }
        }
    };
    /**
     * 包括英制单位（914,400 个 EMU 单位为 1 英寸）
     * 
     * @param {Object}
     *            v
     * @return {TypeName}
     */
    this.px2cm = function (v) {
        if (v == null || v == '') {
            return 0;
        }
        return v / 96 * 2.539999918;
    }
    this.EWA_DocTmp = {
        document: [
            '<?xml version="1.0" encoding="UTF-8"?>',
            '<office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"',
            '   xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0"',
            '   xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0"',
            '  xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0"',
            '   xmlns:draw="urn:oasis:names:tc:opendocument:xmlns:drawing:1.0"',
            ' xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0"',
            ' xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:dc="http://purl.org/dc/elements/1.1/"',
            ' xmlns:meta="urn:oasis:names:tc:opendocument:xmlns:meta:1.0"',
            ' xmlns:number="urn:oasis:names:tc:opendocument:xmlns:datastyle:1.0"',
            ' xmlns:svg="urn:oasis:names:tc:opendocument:xmlns:svg-compatible:1.0"',
            ' xmlns:chart="urn:oasis:names:tc:opendocument:xmlns:chart:1.0"',
            ' xmlns:dr3d="urn:oasis:names:tc:opendocument:xmlns:dr3d:1.0"',
            '  xmlns:math="http://www.w3.org/1998/Math/MathML"',
            ' xmlns:form="urn:oasis:names:tc:opendocument:xmlns:form:1.0"',
            '  xmlns:script="urn:oasis:names:tc:opendocument:xmlns:script:1.0"',
            ' xmlns:ooo="http://openoffice.org/2004/office" xmlns:ooow="http://openoffice.org/2004/writer"',
            ' xmlns:oooc="http://openoffice.org/2004/calc" xmlns:dom="http://www.w3.org/2001/xml-events"',
            ' xmlns:xforms="http://www.w3.org/2002/xforms" xmlns:xsd="http://www.w3.org/2001/XMLSchema"',
            ' xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"',
            ' xmlns:rpt="http://openoffice.org/2005/report"',
            ' xmlns:of="urn:oasis:names:tc:opendocument:xmlns:of:1.2"',
            ' xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:grddl="http://www.w3.org/2003/g/data-view#"',
            ' xmlns:tableooo="http://openoffice.org/2009/table"',
            ' xmlns:field="urn:openoffice:names:experimental:ooo-ms-interop:xmlns:field:1.0"',
            ' office:version="1.2"><office:scripts/>',
            ' <office:font-face-decls>',
            '<style:font-face style:name="OpenSymbol" svg:font-family="OpenSymbol"/>',
            '<style:font-face style:name="微软雅黑" svg:font-family="微软雅黑"/>',
            '<style:font-face style:name="Lucida Sans1" svg:font-family="&apos;Lucida Sans&apos;"',
            ' style:font-family-generic="swiss"/><style:font-face style:name="宋体" svg:font-family="宋体" style:font-pitch="variable"/>',
            '<style:font-face style:name="黑体" svg:font-family="黑体" style:font-pitch="variable"/>',
            '<style:font-face style:name="Times New Roman" svg:font-family="&apos;Times New Roman&apos;"',
            '  style:font-family-generic="roman" style:font-pitch="variable"/>',
            '<style:font-face style:name="Century Gothic" svg:font-family="Century Gothic" style:font-family-generic="swiss"',
            ' style:font-pitch="variable"/>',
            '<style:font-face style:name="Lucida Sans" svg:font-family="&apos;Lucida Sans&apos;"',
            ' style:font-family-generic="system" style:font-pitch="variable"/>',
            '<style:font-face style:name="微软雅黑1" svg:font-family="微软雅黑" style:font-family-generic="system"',
            ' style:font-pitch="variable"/>',
            '</office:font-face-decls>',
            '<office:automatic-styles><style:style style:name="fr1" style:family="graphic" style:parent-style-name="Graphics">',
            '<style:graphic-properties style:vertical-pos="top" style:vertical-rel="baseline"',
            ' style:horizontal-pos="center" style:horizontal-rel="paragraph" style:shadow="none"',
            ' style:mirror="none" fo:clip="rect(0cm, 0cm, 0cm, 0cm)" draw:luminance="0%"',
            ' draw:contrast="0%" draw:red="0%" draw:green="0%" draw:blue="0%" draw:gamma="100%"',
            ' draw:color-inversion="false" draw:image-opacity="100%"',
            ' draw:color-mode="standard"/></style:style><text:list-style style:name="L1">',
            '<text:list-level-style-number text:level="1" text:style-name="Numbering_20_Symbols" style:num-suffix="."',
            ' style:num-format="1">',
            '<style:list-level-properties text:list-level-position-and-space-mode="label-alignment">',
            '<style:list-level-label-alignment text:label-followed-by="listtab"',
            ' text:list-tab-stop-position="1.27cm" fo:text-indent="-0.635cm"',
            ' fo:margin-left="1.27cm"/>',
            '</style:list-level-properties>',
            '</text:list-level-style-number>',
            '<text:list-level-style-number text:level="2" text:style-name="Numbering_20_Symbols" style:num-suffix="."',
            ' style:num-format="1">',
            '<style:list-level-properties text:list-level-position-and-space-mode="label-alignment">',
            ' <style:list-level-label-alignment text:label-followed-by="listtab"',
            ' text:list-tab-stop-position="1.905cm" fo:text-indent="-0.635cm"',
            ' fo:margin-left="1.905cm"/>',
            '</style:list-level-properties>',
            '</text:list-level-style-number>',
            '<text:list-level-style-number text:level="3" text:style-name="Numbering_20_Symbols" style:num-suffix="."',
            ' style:num-format="1">',
            ' <style:list-level-properties text:list-level-position-and-space-mode="label-alignment">',
            '<style:list-level-label-alignment text:label-followed-by="listtab"',
            ' text:list-tab-stop-position="2.54cm" fo:text-indent="-0.635cm" fo:margin-left="2.54cm"/>',
            '</style:list-level-properties>',
            '</text:list-level-style-number>',
            '<text:list-level-style-number text:level="4" text:style-name="Numbering_20_Symbols" style:num-suffix="." style:num-format="1">',
            '<style:list-level-properties text:list-level-position-and-space-mode="label-alignment">',
            '<style:list-level-label-alignment text:label-followed-by="listtab"',
            ' text:list-tab-stop-position="3.175cm" fo:text-indent="-0.635cm"  fo:margin-left="3.175cm"/>',
            '</style:list-level-properties>',
            '</text:list-level-style-number>',
            '<text:list-level-style-number text:level="5" text:style-name="Numbering_20_Symbols" style:num-suffix="."',
            ' style:num-format="1">',
            '<style:list-level-properties text:list-level-position-and-space-mode="label-alignment">',
            ' <style:list-level-label-alignment text:label-followed-by="listtab"',
            '  text:list-tab-stop-position="3.81cm" fo:text-indent="-0.635cm" fo:margin-left="3.81cm"/>',
            '</style:list-level-properties>',
            '</text:list-level-style-number>',
            '<text:list-level-style-number text:level="6" text:style-name="Numbering_20_Symbols" style:num-suffix="."',
            ' style:num-format="1">',
            ' <style:list-level-properties text:list-level-position-and-space-mode="label-alignment">',
            ' <style:list-level-label-alignment text:label-followed-by="listtab"',
            ' text:list-tab-stop-position="4.445cm" fo:text-indent="-0.635cm" fo:margin-left="4.445cm"/>',
            ' </style:list-level-properties>',
            '</text:list-level-style-number>',
            '<text:list-level-style-number text:level="7" text:style-name="Numbering_20_Symbols" style:num-suffix="."',
            ' style:num-format="1">',
            '<style:list-level-properties text:list-level-position-and-space-mode="label-alignment">',
            '<style:list-level-label-alignment text:label-followed-by="listtab"',
            ' text:list-tab-stop-position="5.08cm" fo:text-indent="-0.635cm"  fo:margin-left="5.08cm"/>',
            ' </style:list-level-properties>',
            '</text:list-level-style-number>',
            '<text:list-level-style-number text:level="8" text:style-name="Numbering_20_Symbols" style:num-suffix="."',
            ' style:num-format="1">',
            '<style:list-level-properties text:list-level-position-and-space-mode="label-alignment">',
            '<style:list-level-label-alignment text:label-followed-by="listtab"',
            ' text:list-tab-stop-position="5.715cm" fo:text-indent="-0.635cm" fo:margin-left="5.715cm"/>',
            ' </style:list-level-properties>',
            '</text:list-level-style-number>',
            '<text:list-level-style-number text:level="9" text:style-name="Numbering_20_Symbols" style:num-suffix="."',
            ' style:num-format="1">',
            ' <style:list-level-properties text:list-level-position-and-space-mode="label-alignment">',
            '<style:list-level-label-alignment text:label-followed-by="listtab"',
            ' text:list-tab-stop-position="6.35cm" fo:text-indent="-0.635cm" fo:margin-left="6.35cm"/>',
            ' </style:list-level-properties>',
            '</text:list-level-style-number>',
            '<text:list-level-style-number text:level="10" text:style-name="Numbering_20_Symbols" style:num-suffix="."',
            ' style:num-format="1">',
            '<style:list-level-properties text:list-level-position-and-space-mode="label-alignment">',
            '<style:list-level-label-alignment text:label-followed-by="listtab"',
            ' text:list-tab-stop-position="6.985cm" fo:text-indent="-0.635cm"',
            ' fo:margin-left="6.985cm"/>',
            '</style:list-level-properties>',
            '</text:list-level-style-number>',
            '</text:list-style>',
            '<text:list-style style:name="L2">',
            '<text:list-level-style-bullet text:level="1" text:style-name="Bullet_20_Symbols" text:bullet-char="•">',
            '<style:list-level-properties text:list-level-position-and-space-mode="label-alignment">',
            '<style:list-level-label-alignment text:label-followed-by="listtab"',
            ' text:list-tab-stop-position="1.27cm" fo:text-indent="-0.635cm"',
            ' fo:margin-left="1.27cm"/>',
            '</style:list-level-properties>',
            '</text:list-level-style-bullet>',
            ' <text:list-level-style-bullet text:level="2" text:style-name="Bullet_20_Symbols" text:bullet-char="◦">',
            '     <style:list-level-properties text:list-level-position-and-space-mode="label-alignment">',
            '         <style:list-level-label-alignment text:label-followed-by="listtab"',
            ' text:list-tab-stop-position="1.905cm" fo:text-indent="-0.635cm"',
            ' fo:margin-left="1.905cm"/>',
            '     </style:list-level-properties>',
            ' </text:list-level-style-bullet>',
            ' <text:list-level-style-bullet text:level="3" text:style-name="Bullet_20_Symbols" text:bullet-char="▪">',
            '     <style:list-level-properties text:list-level-position-and-space-mode="label-alignment">',
            '         <style:list-level-label-alignment text:label-followed-by="listtab"',
            ' text:list-tab-stop-position="2.54cm" fo:text-indent="-0.635cm"',
            ' fo:margin-left="2.54cm"/>',
            '     </style:list-level-properties>',
            ' </text:list-level-style-bullet>',
            ' <text:list-level-style-bullet text:level="4" text:style-name="Bullet_20_Symbols" text:bullet-char="•">',
            '     <style:list-level-properties text:list-level-position-and-space-mode="label-alignment">',
            '         <style:list-level-label-alignment text:label-followed-by="listtab"',
            ' text:list-tab-stop-position="3.175cm" fo:text-indent="-0.635cm"',
            ' fo:margin-left="3.175cm"/>',
            '     </style:list-level-properties>',
            ' </text:list-level-style-bullet>',
            ' <text:list-level-style-bullet text:level="5" text:style-name="Bullet_20_Symbols" text:bullet-char="◦">',
            '     <style:list-level-properties text:list-level-position-and-space-mode="label-alignment">',
            '         <style:list-level-label-alignment text:label-followed-by="listtab"',
            ' text:list-tab-stop-position="3.81cm" fo:text-indent="-0.635cm"',
            ' fo:margin-left="3.81cm"/>',
            '     </style:list-level-properties>',
            ' </text:list-level-style-bullet>',
            ' <text:list-level-style-bullet text:level="6" text:style-name="Bullet_20_Symbols" text:bullet-char="▪">',
            '     <style:list-level-properties text:list-level-position-and-space-mode="label-alignment">',
            '         <style:list-level-label-alignment text:label-followed-by="listtab"',
            ' text:list-tab-stop-position="4.445cm" fo:text-indent="-0.635cm"',
            ' fo:margin-left="4.445cm"/>',
            '     </style:list-level-properties>',
            ' </text:list-level-style-bullet>',
            ' <text:list-level-style-bullet text:level="7" text:style-name="Bullet_20_Symbols" text:bullet-char="•">',
            '     <style:list-level-properties text:list-level-position-and-space-mode="label-alignment">',
            '         <style:list-level-label-alignment text:label-followed-by="listtab"',
            ' text:list-tab-stop-position="5.08cm" fo:text-indent="-0.635cm"',
            ' fo:margin-left="5.08cm"/>',
            '     </style:list-level-properties>',
            ' </text:list-level-style-bullet>',
            ' <text:list-level-style-bullet text:level="8" text:style-name="Bullet_20_Symbols" text:bullet-char="◦">',
            '     <style:list-level-properties text:list-level-position-and-space-mode="label-alignment">',
            '         <style:list-level-label-alignment text:label-followed-by="listtab"',
            ' text:list-tab-stop-position="5.715cm" fo:text-indent="-0.635cm"',
            ' fo:margin-left="5.715cm"/>',
            '     </style:list-level-properties>',
            ' </text:list-level-style-bullet>',
            ' <text:list-level-style-bullet text:level="9" text:style-name="Bullet_20_Symbols" text:bullet-char="▪">',
            '     <style:list-level-properties text:list-level-position-and-space-mode="label-alignment">',
            '         <style:list-level-label-alignment text:label-followed-by="listtab"',
            ' text:list-tab-stop-position="6.35cm" fo:text-indent="-0.635cm"',
            ' fo:margin-left="6.35cm"/>',
            '     </style:list-level-properties>',
            ' </text:list-level-style-bullet>',
            ' <text:list-level-style-bullet text:level="10" text:style-name="Bullet_20_Symbols" text:bullet-char="•">',
            '     <style:list-level-properties text:list-level-position-and-space-mode="label-alignment">',
            '         <style:list-level-label-alignment text:label-followed-by="listtab"',
            ' text:list-tab-stop-position="6.985cm" fo:text-indent="-0.635cm"',
            ' fo:margin-left="6.985cm"/>',
            '     </style:list-level-properties>',
            ' </text:list-level-style-bullet>',
            '        </text:list-style>',
            '<number:number-style style:name="N0">',
            ' <number:number number:min-integer-digits="1"/>',
            '</number:number-style></office:automatic-styles>',
            '<office:body><office:text /></office:body></office:document-content>'].join(''),
        f: {
            "9px": "7pt",
            "10px": "7.5pt",
            "11px": "8.5pt",
            "12px": "9pt",
            "13px": "10pt",
            "14px": "10.5pt",
            "14.8px": "10.5pt",
            "15px": "11.5pt",
            "16px": "12pt",
            "17px": "13pt",
            "18px": "13.5pt",
            "19px": "14.5pt",
            "20px": "15pt",
            "21px": "16pt",
            "22px": "16.5pt",
            "23px": "17.5pt",
            "24px": "18pt",
            "25px": "19pt",
            "26px": "19.5pt",
            "27px": "20.5pt",
            "28px": "21pt",
            "29px": "22pt",
            "30px": "22.5pt",
            "31px": "23.5pt",
            "32px": "24pt",
            "33px": "25pt",
            "34px": "25.5pt",
            "35px": "26.5pt",
            "36px": "27pt",
            "37px": "28pt",
            "38px": "28.5pt",
            "39px": "29.5pt",
            "40px": "30pt",
            "41px": "31pt",
            "42px": "31.5pt",
            "43px": "32.5pt",
            "44px": "33pt",
            "45px": "34pt",
            "46px": "34.5pt",
            "47px": "35.5pt",
            "48px": "36pt",
            "49px": "37pt",
            "50px": "37.5pt",
            "51px": "38.5pt",
            "52px": "39pt",
            "53px": "40pt",
            "54px": "40.5pt",
            "55px": "41.5pt",
            "56px": "42pt",
            "57px": "43pt",
            "58px": "43.5pt",
            "59px": "44.5pt",
            "60px": "45pt",
            "61px": "46pt",
            "62px": "46.5pt",
            "63px": "47.5pt",
            "64px": "48pt",
            "65px": "49pt",
            "66px": "49.5pt",
            "67px": "50.5pt",
            "68px": "51pt",
            "69px": "52pt",
            "70px": "52.5pt",
            "71px": "53.5pt",
            "72px": "54pt",
            "73px": "55pt",
            "74px": "55.5pt",
            "75px": "56.5pt",
            "76px": "57pt",
            "77px": "58pt",
            "78px": "58.5pt",
            "79px": "59.5pt",
            "80px": "60pt",
            "81px": "61pt",
            "82px": "61.5pt",
            "83px": "62.5pt",
            "84px": "63pt",
            "85px": "64pt",
            "86px": "64.5pt",
            "87px": "65.5pt",
            "88px": "66pt",
            "89px": "67pt",
            "90px": "67.5pt",
            "91px": "68.5pt",
            "92px": "69pt",
            "93px": "70pt",
            "94px": "70.5pt",
            "95px": "71.5pt",
            "96px": "72pt",
            "97px": "73pt",
            "98px": "73.5pt",
            "99px": "74.5pt"
        },
        borders: ['top', 'bottom', 'right', 'left']
    };
    this.postData = function () {
        var data = {
            xml: this.xml(),
            pics: this.pics.join(','),
            ols: this.liNum
        };
        return data;
    }
    this.init();
    this.xml = function () {
        return this.doc.GetXml();
    };
};
// var word = new EWA_DocWordClass();
// word.walker(oo);
// word.xml();
