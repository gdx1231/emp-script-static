// ---------------------class of common Frame define items ------------
function EWA_FrameCommonItems() {
    this._ClassXml = null;
    this.Items = {};
    // 默认的提示信息，当热更新 _EWA_JS_ALERT 出现不完整或错误时，调用此信息
    this._EWA_JS_ALERT_DEFAULT = {
        "MaxMinLength" : "长度应在{MinLength}-{MaxLength}之间 ",
        "MaxMinValue" : "值应在({MinValue} - {MaxValue})之间",
        "IsMustInput" : "*"
    };
    this.Init = function(classXml) {
        this._ClassXml = classXml;
        var nl = classXml.GetElements("root/XItem");
        var isModify = false;
        if (this.F) {
            var u = new EWA_UrlClass();
            u.SetUrl(this.F.Url);
            if (u.GetParameter('EWA_MTYPE') == 'M') {
                isModify = true;
            }
        }
        for (var i = 0; i < nl.length; i++) {
            var name1 = this.GetItemValue(nl[i], "Name", "Name")
            var name = name1.toUpperCase();
            var node = nl[i];
            this.Items[name] = node;
            var valid = this.GetItemValue(node, 'DataItem', 'Valid');
            if (valid && valid.toUpperCase() == 'MOBILE') {
                EWA.UI.Ext.Mobile($X(name));
            } else if (valid && valid.toUpperCase() == 'IDCARD') {
                EWA.UI.Ext.IdCard($X(name));
            }
            if (isModify) {
                // 修改时禁用
                var DisableOnModify = this.GetItemValue(node, 'DataItem',
                        'DisableOnModify');
                if (DisableOnModify && DisableOnModify.toUpperCase() == 'YES') {
                    var o = $X(name1);
                    if (o) {
                        o.setAttribute('disabled', 'disabled');
                        if (o.getAttribute('DlsShow')) {
                            // droplist设置显示的对象禁用
                            $(o).prev().attr('disabled', 'disabled');
                        }
                    }
                }
            }
        }
    };
    this.GetItem = function(itemName) {
        var name = itemName.toUpperCase().trim();
        return this.Items[name];
    };
    this.GetItemValue = function(itemNode, tag, para) {
        if (itemNode == null)
            return null;

        var chd = this._ClassXml.GetElement(tag + "/Set", itemNode);
        if (chd == null)
            return null;
        return chd.getAttribute(para);
    };
    this.GetDescription = function(name) {
        var o = $(this.GetItem(name)).find(
                "DescriptionSet Set[Lang=" + EWA.LANG + "]");
        return {
            Info : o.attr("Info"),
            Memo : o.attr("Memo")
        };
    }
    this.GetValue = function(itemName, tag, para) {
        var item = this.GetItem(itemName);
        return this.GetItemValue(item, tag, para);
    }

    this.CheckValid = function(obj, val) {
        if (obj.tagName == 'SPAN' || obj.tagName == 'IMG') {
            return true;
        }
        var nodeItem = this.GetItem(obj.id);
        var errorInfos = [];

        if (val == null) {
            return true;
        }
        var isok = true;

        // 必须输入
        var errorInfo = this._CheckMustInput(obj, val, nodeItem);
        if (errorInfo)
            errorInfos.push(errorInfo);
        else
            EWA_FrameRemoveAlert(obj);

        // 检查最大最小长度
        errorInfo = this._CheckMaxMinLength(obj, val, nodeItem);
        if (errorInfo)
            errorInfos.push(errorInfo);
        else
            EWA_FrameRemoveAlert(obj);

        // 合法性检查
        errorInfo = this._CheckDataValid(obj, val, nodeItem);
        if (errorInfo)
            errorInfos.push(errorInfo);
        else
            EWA_FrameRemoveAlert(obj);

        // 验证输入类型
        errorInfo = this._CheckDataType(obj, val, nodeItem);
        if (errorInfo)
            errorInfos.push(errorInfo);
        else
            EWA_FrameRemoveAlert(obj);

        // 最大最小值检查
        errorInfo = this._CheckMaxMinValue(obj, val, nodeItem);
        if (errorInfo)
            errorInfos.push(errorInfo);
        else
            EWA_FrameRemoveAlert(obj);
        // 检查密码
        errorInfo = this._CheckPassword(obj, val, nodeItem);
        if (errorInfo)
            errorInfos.push(errorInfo);
        else
            EWA_FrameRemoveAlert(obj);

        // 扩展验证
        errorInfo = this._CheckExtent(obj, val, nodeItem);
        if (errorInfo)
            errorInfos.push(errorInfo);
        else
            EWA_FrameRemoveAlert(obj);

        if (errorInfos.length == 0) {
            EWA_FrameRemoveAlert(obj);
            return true;
        } else {
            EWA_FrameShowAlert(obj, errorInfos.join(", "));
            return false;
        }
    };
    /**
     * 检查扩展
     * 
     * @param {}
     *            obj
     * @param {}
     *            val
     * @param {}
     *            nodeItem
     */
    this._CheckExtent = function(obj, val, nodeItem) {
        var errorInfo = null;

        var validEx = obj.getAttribute("EWA_VALID_EX");
        validEx = validEx == null ? "" : validEx;
        if (validEx.length > 0) {
            errorInfo = validEx;
        }
        return errorInfo;
    }

    /**
     * 验证输入类型
     * 
     * @param {}
     *            obj
     * @param {}
     *            val
     * @param {}
     *            nodeItem
     * @return {}
     */
    this._CheckDataType = function(obj, val, nodeItem) {
        if (val.trim() == "") {
            return null;
        }
        var errorInfo = null;
        var dataType = this.GetItemValue(nodeItem, "DataItem", "DataType");
        if (dataType != null
                && (dataType.toUpperCase() == "NUMBER" || dataType
                        .toUpperCase() == "INT")) {
            if (val.indexOf(",") >= 0) {
                val = val.replace(/,/ig, '');
                obj.value = val;
            }
            var test = /^[0-9.-]{0,120}$/;
            if (!test.test(val)) {
                errorInfo = _EWA_INFO_MSG['EWA.SYS.INVALID_NUMBER_FORMAT'];
            }
        }
        return errorInfo;
    }

    /**
     * 检查两次输入密码是否一致
     * 
     * @param {}
     *            obj
     * @param {}
     *            val
     * @param {}
     *            nodeItem
     * @return {}
     */
    this._CheckPassword = function(obj, val, nodeItem) {
        if (obj.tagName.toLowerCase() != 'input'
                || obj.type.toLowerCase() != 'password') { // password
            // check
            return null;
        }
        // 郭磊 2017-09-19 检查两个密码是否一致只检查本form下的
        var objs = $('#USR_PWD').parentsUntil('form').last().find(
                'input[type=password]');
        // var objs = document.getElementsByTagName('input');

        var pass1 = null;
        var id0 = obj.id;
        for (var i = 0; i < objs.length; i += 1) {
            if (objs[i].type != 'password' || objs[i] == obj)
                continue;
            if (objs[i].id == id0 + "1") {// 第二个密码的id =
                // 第一个id+1，例如usr_pwd1对应usr_pwd
                pass1 = objs[i];
                break;
            }
        }
        var errorInfo = null;
        if (pass1 != null) {
            if (pass1.value != obj.value) {
                isok = false;
                errorInfo = _EWA_INFO_MSG["EWA.F.PASSWORD"];
            } else {
                EWA_FrameRemoveAlert(pass1);
            }
        }
        return errorInfo;

    }

    /**
     * 检查必须输入
     */
    this._CheckMustInput = function(obj, val, nodeItem) {
        var mustInput = this.GetItemValue(nodeItem, "IsMustInput",
                "IsMustInput");
        var errorInfo = null;
        if (mustInput == "1") {// 检查必填项是否输入
            if (val.length == 0) {
                errorInfo = _EWA_JS_ALERT["IsMustInput"];
                if (errorInfo) {
                    errorInfo = errorInfo.replace("{Name}", obj.id);
                } else {
                    errorInfo = "*";
                }
            }
        }
        return errorInfo;
    }
    /**
     * 检查最大最小长度
     * 
     * @param {}
     *            obj
     * @param {}
     *            val
     * @param {}
     *            nodeItem
     */
    this._CheckMaxMinLength = function(obj, val, nodeItem) {
        if (!val) { // 没有值的情况不判断 2016-8-15 郭磊
            return null;
        }
        var maxLen = this.GetItemValue(nodeItem, "MaxMinLength", "MaxLength");
        var minLen = this.GetItemValue(nodeItem, "MaxMinLength", "MinLength");

        maxLen = maxLen == null ? -1 : parseInt(maxLen);
        minLen = minLen == null ? -1 : parseInt(minLen);

        var isOk = true;
        if (!isNaN(maxLen) && maxLen > 0 && val.length > maxLen) {
            isOk = false;
        }

        if (isOk && !isNaN(minLen) && minLen > 0 && val.length < minLen) {
            isOk = false;
        }

        var errorInfo = null;
        if (!isOk) {
            errorInfo = _EWA_JS_ALERT["MaxMinLength"]
                    || this._EWA_JS_ALERT_DEFAULT["MaxMinLength"];// 默认的提示信息，当热更新
                                                                  // _EWA_JS_ALERT
                                                                  // 出现不完整或错误时，调用此信息
            errorInfo = errorInfo.replace("{Name}", obj.id);
            errorInfo = errorInfo.replace("{MaxLength}", maxLen);
            errorInfo = errorInfo.replace("{MinLength}", minLen);
        }
        return errorInfo;
    }
    /**
     * 检查数据合法性
     * 
     * @param {}
     *            obj
     * @param {}
     *            val
     * @param {}
     *            nodeItem
     * @return {String}
     */
    this._CheckDataValid = function(obj, val, nodeItem) {
        var valid = this.GetItemValue(nodeItem, "DataItem", "Valid");
        if (valid == null || valid.trim() == "") {
            return "";
        }
        if (val.length > 0) {
            // 不是必填项但输入了内容
            var o = _EWA_VALIDS[valid.toUpperCase().trim()];
            if (o == null) {
                return "";
            }
            if (o.REGEX.test(val)) {
                return "";
            } else {
                return o.MSG;
            }
        }
    }
    /**
     * 检查最大最小值
     * 
     * @param {}
     *            val
     * @param {}
     *            nodeItem
     * @return {String} 提示信息
     */
    this._CheckMaxMinValue = function(obj, val, nodeItem) {
        var maxVal = this.GetItemValue(nodeItem, "MaxMinValue", "MaxValue");
        var minVal = this.GetItemValue(nodeItem, "MaxMinValue", "MinValue");
        var max = maxVal == null || maxVal.trim() == "" ? null : maxVal * 1;
        var min = minVal == null || minVal.trim() == "" ? null : minVal * 1;
        var isok = true;
        if (max != null) {
            if (val * 1 <= max) {
                isok = true;
            } else {
                isok = false;
            }
        }
        if (min != null) {
            if (val * 1 >= min) {
                isok = isok & true;
            } else {
                isok = false;
            }
        }
        if (!isok) {
            errorInfo = _EWA_JS_ALERT["MaxMinValue"]
                    || this._EWA_JS_ALERT_DEFAULT["MaxMinValue"]; // 默认的提示信息，当热更新
            // _EWA_JS_ALERT
            // 出现不完整或错误时，调用此信息
            errorInfo = errorInfo.replace("{MaxValue}", maxVal);
            errorInfo = errorInfo.replace("{MinValue}", minVal);
            return errorInfo
        } else {
            return "";
        }
    }

    /**
     * 获取Html对象值
     * 
     * @param {}
     *            obj
     * @return {}
     */
    this.GetObjectValue = function(obj) {
        var tagName = obj.tagName.toUpperCase();
        var o1 = obj;
        var s1 = "";
        if (tagName == "DIV" && obj.getAttribute("TAG") == 'REPT') {
            var objs = obj.getElementsByTagName("input");
            for (var i = 0; i < objs.length; i = i + 1) {
                if (objs[i].checked) {
                    if (s1.length > 0) {
                        s1 += ",";
                    }
                    s1 += objs[i].value;
                }
            }
            return s1;
        }
        if (tagName == "DIV" && obj.getAttribute('EWA_DHTML') == "1") {// dhtml
            var w = obj.getElementsByTagName("iframe")[0].contentWindow;
            var ts = w.document.getElementsByTagName('textarea');
            if (ts.length > 0 && ts[0].style.display != 'none') {
                // 获取textarea的值
                s1 = ts[0].value;
            } else {
                s1 = w.frames[0].document.body.innerHTML;
            }
            // 参数 EWA_DHTML_HOST，是否替换域名
            if (location.search != null
                    && location.search.toUpperCase().indexOf("EWA_DHTML_HOST") < 0) {
                var s2 = "http:\\/\\/" + eval('document.location.host');
            }
            var s3 = eval('/' + s2 + "/ig");
            s1 = s1.replace(s3, '');
            var obj = obj.getElementsByTagName("input")[0];
            obj.value = s1;
            return obj.value;
        }
        if (tagName == "SELECT") {
            var selectedValue = "";
            if (o1.options.selectedIndex >= 0) {
                selectedValue = o1.options[o1.options.selectedIndex].value;
            }
            s1 = selectedValue;
            return s1;
        }
        if (tagName == "TEXTAREA" && o1.style.display == "none") {
            // s1 = __EMP_AJAX_CHANGE_IMG(id);
            s1 = obj.value;
        } else {
            if (tagName == "INPUT"
                    && o1.getAttribute('ewa_tag') == 'IMG_UPLOAD') {
                // upload image
                if (EWA.CP != '/') {
                    s1 = o1.value.replace(EWA.CP, "");
                } else {
                    s1 = o1.value;
                }
                s1 = s1.replace('//', '/');
            } else if (tagName == "INPUT"
                    && o1.getAttribute('ewa_tag') == 'ht5upload') {
                // html5 upload
                var ref_val = o1.getAttribute('val_ref');
                try {
                    var rst = eval('(function(){var a=' + ref_val
                            + ";return a;})()");
                    s1 = rst;
                } catch (e) {
                    console.log(ref_val);
                    console.log(e);
                    s1 = "";
                }
            } else if (tagName == "INPUT"
                    && (o1.type == 'checkbox' || o1.type == 'radio')) {
                // 对于复选内容只出现一个对象的处理
                if (o1.checked) {
                    s1 = o1.value;
                } else {
                    s1 = "";
                }
            } else {
                s1 = o1.value;
            }
        }
        return s1;
    };
}