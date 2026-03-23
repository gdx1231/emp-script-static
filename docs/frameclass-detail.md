# EWA FrameClass 表单框架详解

## 概述

`EWA_FrameClass` 是 EWA 框架中用于展示和操作表单的核心组件，提供数据录入、验证、提交、分组导航等功能。

**文件位置**: `source/src/frames/EWA_03FrameClass.js` (3132 行)

**相关类**:
- `EWA_FrameCommonItems` - 表单项列表
- `EWA_FrameInstallClass` - 表单安装类

## 类结构

### 主要属性

```javascript
function EWA_FrameClass() {
    this.Xml = null;                    // XML 配置
    this._Ajax = null;                  // AJAX 对象
    this.ItemList = new EWA_FrameCommonItems(); // 表单项列表
    this.Resources = {};                // 资源
    this.Url = null;                    // 提交 URL
    this._Id = null;                    // 表单 ID
    
    // 验证扩展
    this._ValidExOk = null;             // 验证成功回调
    this._ValidExFail = null;           // 验证失败回调
    this._ValidExObj = null;            // 验证对象
    
    // 提交控制
    this.doPostAfter = null;            // POST 后的事件
    this.isShowPostWaitting = true;     // 是否显示提交等待框
    
    // 选择器筛选
    this._SelectFilters = {};           // Select 筛选器
    this.isSelectFilter = false;        // 是否正在筛选
    
    // 上传控制
    this.uploadProcess = false;         // 上传进行中
    this._stopPost = false;             // 停止提交
    this._stopPostError = null;         // 停止提交的错误信息
    
    // 触发验证
    this.triggerValids = {};            // 触发验证集合
    this.posting = false;               // 正在提交
    
    // 引导模式
    this.GuideShowBefore = null;        // 引导显示前回调
    this.GuideShowAfter = null;         // 引导显示后回调
    this.GroupShowBefore = null;        // 分组显示前回调
    this.GroupShowAfter = null;         // 分组显示后回调
    this.extSwitchCallBack = null;      // 开关按钮回调
}
```

### 核心方法分类

| 分类 | 方法 | 说明 |
|------|------|------|
| **状态控制** | `setDisable()` | 设置为禁止修改状态 |
| | `setEnable()` | 设置为允许修改状态 |
| | `setMust(name)` | 设置必填项 |
| | `setUnMust(name)` | 设置为非必填项 |
| **验证** | `CheckValid(obj, event)` | 检查对象值合法性 |
| | `CheckValidAll(objForm)` | 检查所有对象合法性 |
| | `GuideShowCheck(idx)` | 检查引导页合法性 |
| **数据提交** | `DoPost(objForm, url, isSkipDoPostBefore)` | 提交数据 |
| | `DoPostBefore()` | 提交前检查 |
| | `_uploadingFileCheck(ipt)` | 检查上传文件状态 |
| **UI 组件** | `textareaAutoSize()` | Textarea 自动高度 |
| | `switchButtonAction(source, actionName)` | 开关按钮动作 |
| | `convertFilterCheckbox()` | 转换复选框过滤器 |
| | `createFilterCheckbox()` | 创建带字母过滤的多选框 |
| **Select 筛选** | `InitSelectFilter()` | 初始化 Select 筛选 |
| | `_chCode(obj, filterType, filterFrom)` | 筛选代码变化处理 |
| **引导模式** | `GuideShow(idx)` | 显示引导页 |
| | `GroupShow(obj, grpIdx)` | 显示分组 |
| **加密显示** | `_InitEncyptions()` | 初始化加密字段 |
| **工具方法** | `getObj(exp)` | 获取 jQuery 对象 |
| | `getUrlClass()` | 获取 URL 对象 |

## 详细 API 说明

### 1. 状态控制

#### setDisable - 设置为禁止修改状态

```javascript
/**
 * 设置为禁止修改状态
 */
this.setDisable = function() {
    var tb = this.getObj();
    
    // 禁用表单元素
    tb.find("input,textarea,select,label").each(function() {
        if (!this.disabled && this.type != 'hidden') {
            this.disabled = true;
            this.setAttribute("ewadisabled", 1);
        }
    });
    
    // 禁用富文本编辑器
    tb.find(".EWA_DHTML").each(function() {
        if (this.tagName == "DIV") {
            // 老版本 DHTML
            var iframe = $(this).find("iframe")[0].contentWindow;
            var tt = setInterval(function() {
                if (iframe.document.readyState == 'complete') {
                    window.clearInterval(tt);
                    iframe.frames[0].document.body.contentEditable = false;
                    iframe.frames[0].document.body.style.backgroundColor = "#eee";
                    var o = iframe.document.getElementsByClassName('but')[0];
                    o.style.pointerEvents = 'none';
                    o.style.filter = "grayscale(1) opacity(0.8)";
                }
            }, 300);
        } else if (this.tagName == "TEXTAREA") {
            // 新版本 H5 编辑器
            var target = $(this).parent();
            var tt = setInterval(function() {
                var qiframe = target.find("iframe");
                if (qiframe.length > 0) {
                    var iframe = qiframe[0].contentWindow;
                    if (iframe && iframe.document.readyState == 'complete') {
                        window.clearInterval(tt);
                        iframe.document.body.contentEditable = false;
                        iframe.document.body.style.backgroundColor = "#eee";
                        target.find(".ewa-editor").attr('ewadisabled', 1);
                    }
                }
            }, 300);
        }
    });
};
```

**使用示例**:
```javascript
// 禁用表单
frame.setDisable();

// 外部定义回调
frame.extDisableCallback = function() {
    console.log('表单已禁用');
};
```

#### setEnable - 设置为允许修改状态

```javascript
/**
 * 设置为允许修改状态
 */
this.setEnable = function() {
    var tb = this.getObj();
    
    // 启用表单元素
    tb.find("input,textarea,select,label").each(function() {
        if (this.disabled && this.getAttribute("ewadisabled")) {
            this.disabled = false;
            this.removeAttribute("ewadisabled");
        }
    });
    
    // 启用富文本编辑器
    tb.find(".EWA_DHTML").each(function() {
        if (this.tagName == "DIV") {
            var iframe = $(this).find("iframe")[0].contentWindow;
            iframe.frames[0].document.body.contentEditable = true;
            iframe.frames[0].document.body.style.backgroundColor = "";
            var o = iframe.document.getElementsByClassName('but')[0];
            o.style.pointerEvents = '';
            o.style.filter = "";
        } else if (this.tagName == "TEXTAREA") {
            var target = $(this).parent();
            var qiframe = target.find("iframe");
            var iframe = qiframe[0].contentWindow;
            iframe.document.body.contentEditable = true;
            iframe.document.body.style.backgroundColor = "";
            target.find(".ewa-editor").removeAttr('ewadisabled');
        }
    });
};
```

**使用示例**:
```javascript
// 启用表单
frame.setEnable();
```

#### setMust / setUnMust - 设置必填项

```javascript
/**
 * 设置必填项
 * @param {String} name 字段名称
 */
this.setMust = function(name) {
    var a = this.ItemList.Items[name.toUpperCase()];
    if (a) {
        var b = a.getElementsByTagName("IsMustInput")[0]
                 .getElementsByTagName("Set")[0];
        b.setAttribute("IsMustInput", 1);
    }
};

/**
 * 设置为非必填项
 * @param {String} name 字段名称
 */
this.setUnMust = function(name) {
    var a = this.ItemList.Items[name.toUpperCase()];
    if (a) {
        var b = a.getElementsByTagName("IsMustInput")[0]
                 .getElementsByTagName("Set")[0];
        b.setAttribute("IsMustInput", 0);
    }
};
```

**使用示例**:
```javascript
// 设置字段为必填
frame.setMust('userName');

// 设置字段为非必填
frame.setUnMust('remark');
```

### 2. 验证功能

#### CheckValid - 检查对象值合法性

```javascript
/**
 * 检查对象值的合法性
 * @param {HTMLElement} obj 要检查的对象
 * @param {Event} event 事件对象
 * @returns {Boolean} 是否合法
 */
this.CheckValid = function(obj, event) {
    // 跳过特殊元素
    if (obj.tagName == 'SPAN' || obj.tagName == 'IMG') {
        return true;
    }
    
    // 避免点击 div 时背景先变化
    if (obj && event && obj.tagName == 'DIV' && 
        obj.getAttribute('tag') == 'REPT') {
        var tag = event.target.tagName;
        if (tag == 'LABEL' || tag == 'INPUT') {
            var c = this;
            setTimeout(function() {
                var v = c._GetObjectValue(obj);
                c.ItemList.CheckValid(obj, val);
            }, 10);
        }
        return true;
    }
    
    var val = this._GetObjectValue(obj);
    return this.ItemList.CheckValid(obj, val);
};

/**
 * 获取 Html 对象值
 * @param {HTMLElement} obj
 * @returns {Object} 值
 */
this._GetObjectValue = function(obj) {
    return this.ItemList.GetObjectValue(obj);
};
```

**使用示例**:
```javascript
// 检查单个字段
var obj = frame.getObj('#userName')[0];
var isValid = frame.CheckValid(obj);

if (!isValid) {
    obj.focus();
}
```

#### CheckValidAll - 检查所有对象合法性

```javascript
/**
 * 检查所有对象合法性
 * @param {HTMLElement} objForm 表单对象
 * @returns {Boolean} 是否全部合法
 */
this.CheckValidAll = function(objForm) {
    var nodeList = this.ItemList;
    var firstObj = null;
    var isOk = true;
    
    for (var name in this.ItemList.Items) {
        var node = this.ItemList.Items[name];
        var name1 = this.ItemList.GetItemValue(node, "Name", "Name");
        
        var obj = this.GetObject(name1, objForm);
        if (obj == null) {
            continue;
        }
        
        isOk = isOk & this.CheckValid(obj);
        if (!isOk && firstObj == null) {
            firstObj = obj;
        }
    }
    
    if (firstObj != null) {
        firstObj.focus();
    }
    return isOk;
};
```

**使用示例**:
```javascript
// 提交前验证
if (!frame.CheckValidAll()) {
    alert('请填写必填项');
    return false;
}
```

### 3. 数据提交

#### DoPost - 提交数据

```javascript
/**
 * 提交数据
 * @param {HTMLElement} objForm 表单对象
 * @param {String} url 提交 URL
 * @param {Boolean} isSkipDoPostBefore 是否跳过提交前检查
 * @returns {Boolean} 是否成功提交
 */
this.DoPost = function(objForm, url, isSkipDoPostBefore) {
    if (this.posting) {
        return false; // 正在提交中
    }
    
    if (this._cancelPostWait) {
        console.log('取消提交');
        this._cancelPostWait = null;
        return false;
    }
    
    var c = this;
    
    if (!isSkipDoPostBefore) {
        var rst = this.DoPostBefore();
        if (rst instanceof Array) {
            // rst = [是否完成，提示信息，是否用 Confirm 确认]
            this._checkStatusInc = 0;
            this._checkStatusFristResult = rst;
            
            // 用定时器检查状态
            this._checkStatusTimer = window.setInterval(function() {
                var rst = c._checkStatusInc == 0 ? 
                    c._checkStatusFristResult : c.DoPostBefore();
                c._checkStatusInc++;
                let result = rst[0];
                
                if (result === null || result === undefined) {
                    return;
                }
                
                window.clearInterval(c._checkStatusTimer);
                c._checkStatusTimer = null;
                c._checkStatusInc = null;
                c._checkStatusFristResult = null;
                
                let tipMsg = rst[1];
                let useTip = rst[2];
                
                if (result && !useTip) {
                    c.DoPost(objForm, url, true);
                    return;
                }
                if (result && useTip) {
                    $Confirm(tipMsg, tipMsg, function() {
                        c.DoPost(objForm, url, true);
                    });
                }
            }, 100);
            return false;
        }
    }
    
    // 执行提交
    this.posting = true;
    // ... 提交逻辑
};
```

**使用示例**:
```javascript
// 提交表单
frame.DoPost(document.getElementById('form1'), '/cgi-bin/submit');

// 自定义提交前检查
frame.DoPostBefore = function() {
    if (!this.CheckValidAll()) {
        return [false, '请检查必填项', false];
    }
    return [true]; // 可以通过
};
```

#### DoPostBefore - 提交前检查

```javascript
/**
 * 提交前检查
 * @returns {Array|Boolean} 
 *   - true: 可以通过
 *   - false: 不能通过
 *   - Array: [是否完成，提示信息，是否用 Confirm 确认]
 */
this.DoPostBefore = function() {
    // 1. 检查验证
    if (!this.CheckValidAll()) {
        return [false, '请检查必填项', false];
    }
    
    // 2. 检查上传文件
    var html5uploads = this.getObj('input[type=file]');
    for (var i = 0; i < html5uploads.length; i++) {
        var ipt = html5uploads[i];
        if (this._uploadingFileCheck(ipt)) {
            // 上传中，等待
            return [false, '文件上传中...', false];
        }
    }
    
    // 3. 检查触发验证
    if (!this._checkTriggerValids()) {
        return [false, '请完成验证', false];
    }
    
    return [true]; // 可以通过
};
```

#### _uploadingFileCheck - 检查上传文件状态

```javascript
/**
 * 检查上传文件状态
 * @param {HTMLElement} ipt 文件输入对象
 * @returns {Boolean} true=上传中，false=未上传
 */
this._uploadingFileCheck = function(ipt) {
    var ipt_name = ipt.id;
    var ht5 = window['h5u_' + this._Id + '$' + ipt_name];
    
    if (!ht5.haveFile()) {
        return false; // 没有文件
    }
    
    // 状态检查：start, ok, checking, nofile, error, abort
    if (ht5.UPLOAD_STATUS == 'ok') {
        // 上传完毕
        ht5.removeWaitBox();
        this.uploadProcess = false;
        return false;
    }
    
    if (ht5.UPLOAD_STATUS == 'nofile') {
        // 没有可用的上传文件
        this.uploadProcess = false;
        ht5.removeWaitBox();
        return false;
    }
    
    if (ht5.UPLOAD_STATUS == 'error' || ht5.UPLOAD_STATUS == 'abort') {
        // 错误或终止
        this._stopPost = true;
        this._stopPostError = EWA.LANG == 'enus' ? 
            'Upload file error or aborted' : '上传文件错误或被中止';
        return false;
    }
    
    if (ht5.UPLOAD_STATUS == 'start' || ht5.UPLOAD_STATUS == 'checking') {
        // 上传中
        return true;
    }
    
    // 开始上传
    ht5.submitUploads();
    this.uploadProcess = true;
    return true;
};
```

### 4. UI 组件

#### textareaAutoSize - Textarea 自动高度

```javascript
/**
 * Textarea 自动调整高度
 * 需要引入 /third-party/autosize-master/dist/autosize.min.js
 */
this.textareaAutoSize = function() {
    if (!window.autosize) {
        console.warn('autosize.js 没有引入');
        return;
    }
    autosize(this.getObj('textarea').addClass('ewa-textarea-auto-size'));
};
```

**使用示例**:
```javascript
// 初始化自动高度
frame.textareaAutoSize();
```

#### switchButtonAction - 开关按钮动作

```javascript
/**
 * 开关元素变化后调用的 Action
 * @param {HTMLElement} source input[type=checkbox] 元素
 * @param {String} actionName 提交到后台的 action
 */
this.switchButtonAction = function(source, actionName) {
    if (!actionName) {
        return;
    }
    
    let u1 = this.getUrlClass();
    let data = {};
    data.ewa_switch_name = source.name;
    data.ewa_action = actionName;
    data.ewa_ajax = 'json';
    data.ewa_switch = source.checked ? 'on' : 'off';
    
    // 附加父元素的属性
    let parent = source.parentNode;
    let names = parent.getAttributeNames();
    for (let n in names) {
        let name = names[n];
        let val = parent.getAttribute(name);
        if (name.indexOf('on') == 0 || name == 'name' || 
            name == 'id' || name == 'class') {
            continue;
        }
        data[name] = val;
    }
    
    let that = this;
    let u = u1.GetUrl();
    
    $JP(u, data, function(rst) {
        // 可以外部定义回调函数 extSwitchCallBack
        if (that.extSwitchCallBack) {
            that.extSwitchCallBack(source, rst);
        }
    });
};
```

**使用示例**:
```javascript
// HTML
// <input type="checkbox" id="statusSwitch" name="status">
// <label for="statusSwitch" 
//   onclick="EWA.F.FOS['form1'].switchButtonAction(this, 'toggleStatus')">
//   启用
// </label>

// 外部定义回调
frame.extSwitchCallBack = function(source, rst) {
    if (rst.success) {
        $Tip('状态更新成功');
    }
};
```

### 5. 复选框过滤器

#### convertFilterCheckbox - 转换复选框过滤器

```javascript
/**
 * 将 checkbox 按照字母进行排序和筛选
 * @param {String} checkboxTargetId checkbox 的 id
 * @param {String} filterTargetId 放置 A-Z 字母的位置
 * @param {String} charFieldName 字母的 json 字段名称
 * @param {Boolean} isMergeCell 是否合并单元格
 * @param {Function} callBackConverted 转换完毕的回调
 * @param {Function} callBackDoFilter 点击字母的回调
 */
this.convertFilterCheckbox = function(checkboxTargetId, filterTargetId, 
    charFieldName, isMergeCell, callBackConverted, callBackDoFilter) {
    
    var map = {};
    var trCheckBox = this.getObj('.ewa-row-' + checkboxTargetId);
    var trfilter = this.getObj('.ewa-row-' + filterTargetId);
    
    // 放置已选择的 checkbox
    var oChecked = $("<div class='ewa-filter-checked'></div>");
    trCheckBox.find('#' + checkboxTargetId).prepend(oChecked)
              .addClass('ewa-filter-chks');
    
    // 移动函数
    function moveToChecked(obj) {
        var o = $('<nobr></nobr>');
        oChecked.append(o);
        oChecked.append(" ");
        var chkParent = $(obj).parent();
        var id = $(obj).attr('id') + "_" + mainID;
        chkParent.attr('ref_id', id);
        o.append(chkParent.children());
        o.attr('ref_id', id);
    }
    
    function moveToUnChecked(obj) {
        var chkParent = $(obj).parent();
        var ref_id = chkParent.attr('ref_id');
        if (ref_id) {
            $('#' + ref_id).append(chkParent.children());
            chkParent.remove();
        }
    }
    
    if (!charFieldName) {
        charFieldName = 'PY'; // 默认拼音首字母
    }
    
    // 遍历 checkbox，按字母分类
    trCheckBox.find('input[type=checkbox]').each(function() {
        var o = JSON.parse($(this).attr('json'));
        var py = o[charFieldName];
        if (!py) return;
        
        py = py.toUpperCase().trim().substring(0, 1);
        if (!map[py]) {
            map[py] = [];
        }
        map[py].push(this.id);
        
        if (this.checked) {
            moveToChecked(this);
        }
        
        $(this).on('change', function() {
            if (this.checked) {
                moveToChecked(this);
            } else {
                moveToUnChecked(this);
            }
        });
    });
    
    // 生成字母链接
    var codes = 'A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z'.split(',');
    var ss = ["<a class='ewa-filter-char ewa-filter-char-all' code=''>ALL</a>"];
    for (var n in codes) {
        var c = codes[n];
        var arr = map[c];
        if (!arr) continue;
        
        var s = "<a class='ewa-filter-char' code='" + c + "'>" + c + 
                "<span class='ewa-filter-char-num'>(" + arr.length + ")</span></a>";
        ss.push(s);
    }
    trfilter.find('.EWA_TD_M').html(ss.join(" "));
    
    // 合并单元格
    if (isMergeCell) {
        trCheckBox.find('.EWA_TD_L').hide();
        trCheckBox.find('.EWA_TD_M').attr('colspan', 2);
    }
    
    // 绑定点击事件
    trfilter.find('a.ewa-filter-char').on('click', function() {
        var c = $(this).attr('code');
        
        trCheckBox.find('input[type=checkbox]').each(function() {
            if (c) {
                if (!this.checked) {
                    if ($(this).parent().attr('ref_id')) {
                        moveToUnChecked(this);
                    }
                    $(this).parent().hide();
                } else {
                    oChecked.append($(this).parent());
                }
            } else {
                $(this).parent().show();
            }
        });
        
        if (!c) return;
        
        var arr = map[c];
        for (var i = 0; i < arr.length; i++) {
            trCheckBox.find('#' + arr[i]).parent().show();
        }
        
        if (callBackDoFilter) {
            callBackDoFilter(this, trCheckBox, trfilter);
        }
    });
    
    if (callBackConverted) {
        callBackConverted(trCheckBox, trfilter);
    }
};
```

**使用示例**:
```javascript
// HTML
// <tr class="ewa-row-usrSelect"><td id="usrSelect">...checkboxes...</td></tr>
// <tr class="ewa-row-usrFilter"><td class="EWA_TD_M">...filter letters...</td></tr>

// 初始化过滤器
frame.convertFilterCheckbox(
    'usrSelect',      // checkbox 容器 ID
    'usrFilter',      // 字母过滤器容器 ID
    'PY',             // 拼音字段名
    true,             // 合并单元格
    function(trChk, trFilter) {
        console.log('转换完成');
    },
    function(link, trChk, trFilter) {
        console.log('筛选：', $(link).attr('code'));
    }
);
```

#### createFilterCheckbox - 创建带字母过滤的多选框

```javascript
/**
 * 通过 ajax 创建带字母过滤器的多选框
 * @param {String} checkboxTarget 放 checkbox 的对象
 * @param {String} filterTarget 放字母筛选的对象
 * @param {String} initvals 用","分割的初始化值
 * @param {String} ajaxUrl 获取数据的 ajax 请求地址
 * @param {String} idName 值的字段名称
 * @param {String} textName 显示的字段名称
 * @param {String} pyName 用于筛选的字母字段
 */
this.createFilterCheckbox = function(checkboxTarget, filterTarget, initvals, 
    ajaxUrl, idName, textName, pyName) {
    
    var c = this;
    $J(ajaxUrl, function(rst) {
        c.createFilterCheckboxByData(checkboxTarget, filterTarget, initvals, 
            rst, idName, textName, pyName);
    });
};
```

**使用示例**:
```javascript
// 创建人员选择器
frame.createFilterCheckbox(
    'usrSelect',                    // checkbox 容器
    'usrFilter',                    // 字母过滤器
    '1,2,3',                        // 初始选中值
    '/cgi-bin/user/list',           // 数据接口
    'USR_ID',                       // ID 字段
    'USR_NAME',                     // 名称字段
    'USR_NAME_PY'                   // 拼音字段
);
```

### 6. Select 筛选

#### InitSelectFilter - 初始化 Select 筛选

```javascript
/**
 * 初始化 Select 筛选器
 * @param {String} obj_id Select 的 ID
 * @param {String} filterType 筛选类型 (json/text/value)
 * @param {String} filterFrom 筛选字段
 * @param {String} codeJsonFrom 代码 JSON 来源
 */
this.InitSelectFilter = function(obj_id, filterType, filterFrom, codeJsonFrom) {
    if (this["INIT_SELECT_FILTER" + obj_id]) {
        return; // 已初始化
    }
    this["INIT_SELECT_FILTER" + obj_id] = true;
    
    var target = this.getObj("select#" + obj_id);
    var td = target.parent();
    
    var id1 = "initSelectFilter" + this._Id + "-" + obj_id + "-filter";
    var id2 = "initSelectFilter" + this._Id + "-" + obj_id + "-filter2";
    var id_tb = "initSelectFilter" + this._Id + "-" + obj_id + "-filter-table";
    
    // 如果已存在，先移除
    if ($X(id_tb)) {
        td.append(target);
        $($X(id_tb)).remove();
    }
    
    td.addClass('ewa-select-filter');
    
    // 创建表格：第一个单元格放字母 select，第二个单元格放目标 select
    var ss = ["<table id='" + id_tb + "' cellpadding=0 cellspacing=0 width=100%><tr>" +
        "<td class='ewa-select-filter-char'>" +
        "<select class='EWA_SELECT' style='margin-right:4px' id='" + id1 + "' " +
        "onchange='EWA.F.FOS[\"" + this._Id + "\"]._chCode(this,\"" + filterType + 
        "\",\"" + filterFrom + "\")'>"];
    
    // 生成代码选项
    var options = this._initSelectFilterCreateCode(codeJsonFrom || filterFrom, target);
    ss.push(options);
    ss.push("</select>" +
        "<select id='" + id2 + "' style='display:none'></select></td>" +
        "<td class='ewa-select-filter-target'></td></tr></table>");
    
    td.prepend(ss.join(''));
    td.find('.ewa-select-filter-target').append(target);
    
    // 保存原始 HTML
    if (!this._SelectFilters) {
        this._SelectFilters = {};
    }
    var o = {};
    o.html = target.html();
    o.id = obj_id;
    o.filterType = filterType;
    o.filterFrom = filterFrom;
    o.codeJsonFrom = codeJsonFrom;
    
    this._SelectFilters[o.id] = o;
};
```

**使用示例**:
```javascript
// HTML
// <select id="userSelect" name="userId">
//   <option value="">请选择</option>
//   <option value="1" json='{"USR_NAME":"张三","PY":"ZS"}'>张三</option>
//   <option value="2" json='{"USR_NAME":"李四","PY":"LS"}'>李四</option>
// </select>

// 初始化筛选器
frame.InitSelectFilter('userSelect', 'json', 'PY');
```

#### _chCode - 筛选代码变化处理

```javascript
/**
 * Select 筛选发生变化时，显示不同的 options
 * @param {HTMLElement} obj 触发变化的 select
 * @param {String} filterType 筛选类型
 * @param {String} filterFrom 筛选字段
 */
this._chCode = function(obj, filterType, filterFrom) {
    this.isSelectFilter = true;
    
    var hide = $(obj).next(); // 隐藏的 select（备份）
    var target = $(obj).parent().parent()
                    .find(".ewa-select-filter-target select");
    
    // 如果备份为空，先备份
    if (hide[0].options.length == 0) {
        hide.html(target.html());
    }
    
    // 如果选择全部，恢复所有选项
    if (obj.value == '') {
        target.html(hide.html());
        return;
    }
    
    // 筛选选项
    var ss = ['<option></option>'];
    for (var i = 1; i < hide[0].options.length; i++) {
        var opt = hide[0].options[i];
        if (this._chCodeFilter(opt, filterType, filterFrom, obj.value)) {
            ss.push(GetOuterHTML(opt));
        }
    }
    
    target.html(ss.join(''));
    this._SelectFilters[target[0].id].html = target.html();
    this.isSelectFilter = false;
};

/**
 * 检查 option 的首字母是否匹配
 */
this._chCodeFilter = function(opt, filterType, filterFrom, chkValue) {
    var id;
    if (filterType == 'json') {
        var json = JSON.parse(opt.getAttribute('json'));
        id = json[filterFrom];
    } else if (filterType == 'text') {
        id = opt.text;
    } else {
        id = opt.value;
    }
    
    if (id) {
        var len = chkValue.length;
        if (id.substring(0, len).toUpperCase() == chkValue.toUpperCase()) {
            return true;
        }
    }
    return false;
};
```

### 7. 引导模式

#### GuideShow - 显示引导页

```javascript
/**
 * 显示引导页
 * @param {Number} idx 引导页索引（从 0 开始）
 */
this.GuideShow = function(idx) {
    this.GuideShowTitle(idx);
    
    var tb = $X('EWA_FRAME_' + this._Id);
    var curIdx = tb.getAttribute('EWA_GUIDE_IDX');
    
    if (curIdx == idx) {
        return;
    }
    
    var maxIdx = tb.getAttribute('EWA_GUIDE_IDX_MAX');
    var idPrev = tb.getAttribute('EWA_GUIDE_ID_PREV');
    var idNext = tb.getAttribute('EWA_GUIDE_ID_NEXT');
    
    // 设置按钮文本
    if (idx == maxIdx) {
        $X(idNext).value = EWA.LANG == 'enus' ? "Confirm" : '确定';
        $X(idNext).setAttribute('ewa_guide_method', 'ok');
    } else {
        $X(idNext).value = EWA.LANG == 'enus' ? "Next" : '下一步';
        $X(idNext).setAttribute('ewa_guide_method', '');
    }
    
    // 设置上一页按钮
    if (idx == 0) {
        $X(idPrev).style.display = 'none';
    } else {
        $X(idPrev).style.display = '';
    }
    
    tb.setAttribute('EWA_GUIDE_IDX', idx);
    this._ShowHidenGroup(tb, idx);
};

/**
 * 显示/隐藏分组
 */
this._ShowHidenGroup = function(tb, newIdx) {
    for (var i = 0; i < tb.rows.length - 1; i++) {
        var row = tb.rows[i];
        var idx = 0;
        
        if (row.getAttribute('groupIndex') != null && 
            row.getAttribute('groupIndex') != '') {
            idx = row.getAttribute('groupIndex') * 1;
            
            if (newIdx == idx) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        }
    }
};
```

**使用示例**:
```javascript
// 显示第 1 页（索引从 0 开始）
frame.GuideShow(0);

// 下一页
frame.GuideShow(1);

// 外部定义回调
frame.GuideShowBefore = function(obj, grpIdx) {
    // 切换前验证
    if (!frame.GuideShowCheck(grpIdx)) {
        alert('请填写完当前页');
        return false;
    }
};

frame.GuideShowAfter = function(obj, grpIdx) {
    console.log('切换到第', grpIdx, '页');
};
```

#### GroupShow - 显示分组

```javascript
/**
 * 显示分组
 * @param {HTMLElement} obj 触发对象
 * @param {Number} grpIdx 分组索引
 */
this.GroupShow = function(obj, grpIdx) {
    if (obj.className.indexOf('1') > 0) {
        return; // 已经选中
    }
    
    // 切换前处理
    if (this.GroupShowBefore) {
        this.GroupShowBefore(obj, grpIdx);
    }
    
    var tb = $X('EWA_FRAME_' + this._Id);
    var objParentTr = obj.parentNode.parentNode;
    
    for (var i = 0; i < tb.rows.length; i++) {
        var row = tb.rows[i];
        
        // 跳过按钮行和隐含行
        if (row.cells.length == 1 && 
            row.cells[0].className.indexOf('EWA_TD_B') >= 0) {
            continue;
        }
        if (row.getAttribute('hiddennocontentrow') == '1') {
            continue;
        }
        
        var idx = 0;
        if (row.getAttribute('groupIndex') != null && 
            row.getAttribute('groupIndex') != '') {
            idx = row.getAttribute('groupIndex') * 1;
        }
        
        if (grpIdx == idx) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    }
    
    // 更新按钮状态
    var objs = objParentTr.getElementsByTagName('div');
    for (var i = 0; i < objs.length; i++) {
        var o = objs[i];
        if (o == obj) {
            o.className = o.className + '1';
        } else {
            o.className = o.className.replace('1', '');
        }
    }
    
    // 切换后处理
    if (this.GroupShowAfter) {
        this.GroupShowAfter(obj, grpIdx);
    }
};
```

**使用示例**:
```javascript
// HTML
// <div onclick="EWA.F.FOS['form1'].GroupShow(this, 0)">基本信息</div>
// <div onclick="EWA.F.FOS['form1'].GroupShow(this, 1)">详细信息</div>

// 外部定义回调
frame.GroupShowBefore = function(obj, grpIdx) {
    // 验证当前分组
    if (!frame.CheckValidAll()) {
        alert('请先填写完当前分组');
        return false;
    }
};

frame.GroupShowAfter = function(obj, grpIdx) {
    console.log('切换到分组:', grpIdx);
};
```

### 8. 加密显示

#### _InitEncyptions - 初始化加密字段

```javascript
/**
 * 添加加密的样式
 */
this._InitEncyptions = function() {
    var tb = this.getObj();
    var nodeList = this.ItemList;
    var c = this;
    
    for (var name in this.ItemList.Items) {
        var node = this.ItemList.Items[name];
        var name1 = this.ItemList.GetItemValue(node, "Name", "Name");
        var enc = $(node).find('DispEnc Set');
        
        if (enc.length == 0) continue;
        
        var obj = tb.find('#' + name1);
        if (obj.length == 0) continue;
        
        var EncType = enc.attr('EncType');
        if (!EncType) continue;
        
        // 禁用输入框
        if (obj[0].tagName == 'INPUT' || obj[0].tagName == 'TEXTAREA') {
            if (!obj.val()) continue;
            obj.prop('disabled', true);
            obj.attr('ewa_encyrption', 'yes');
        }
        
        // 添加遮罩层
        var o1 = $("<div class='ewa-enc-cover' " +
            "style='position:absolute;left:0;top:0;width:100%;height:100%;'>" +
            "<div></div></div>");
        obj.parent().append(o1);
        obj.parent().css('position', 'relative');
        
        // 设置查看按钮
        var enc_url = enc.attr('EncShowUrl');
        if (!enc_url) continue;
        
        var css = {
            position: 'absolute',
            height: 30,
            'line-height': '30px',
            'top': '50%',
            'margin-top': '-15px',
            right: 10,
            'text-align': 'right'
        };
        o1.find('div').html("点击查看").css(css);
        
        // 绑定点击事件
        o1.click(function() {
            var u1 = new EWA_UrlClass(enc_url);
            var u2 = new EWA_UrlClass(c.Url);
            
            // 附加 URL 参数
            for (var n in u2._Paras) {
                if (!u1.GetParameter(n)) {
                    var v = u2._Paras[n];
                    if (v != null) {
                        v = v.unURL();
                    }
                    u1.AddParameter(n, v);
                }
            }
            
            // 打开查看窗口
            var dia = $DialogUrl(u1.GetUrl(), '查看加密内容', 500, 300);
        });
    }
};
```

**使用示例**:
```javascript
// XML 配置
// <DataItem>
//   <DispEnc EncType="AES" EncShowUrl="/cgi-bin/viewEnc"/>
// </DataItem>

// 自动初始化，无需手动调用
// 表单加载时会自动调用 _InitEncyptions()
```

## 工具方法

### getObj - 获取 jQuery 对象

```javascript
/**
 * 获取 jQuery 对象
 * @param {String} exp jQuery 选择器表达式
 * @returns {jQuery} jQuery 对象
 */
this.getObj = function(exp) {
    var tb = $('#EWA_FRAME_' + this._Id);
    if (exp) {
        return tb.find(exp);
    } else {
        return tb;
    }
};
```

**使用示例**:
```javascript
// 获取整个表单
var $form = frame.getObj();

// 获取特定字段
var $userName = frame.getObj('#userName');
var $inputs = frame.getObj('input[type=text]');
```

### getUrlClass - 获取 URL 对象

```javascript
/**
 * 获取 URL 对象
 * @returns {EWA_UrlClass}
 */
this.getUrlClass = function() {
    var u = new EWA_UrlClass();
    u.SetUrl(this.Url);
    return u;
};
```

**使用示例**:
```javascript
// 获取当前 URL
var url = frame.getUrlClass();

// 添加参数
url.AddParameter('extra', 'value');

// 发起请求
$J(url.GetUrl(), function(rst) {
    console.log(rst);
});
```

## 使用示例

### 完整示例

```javascript
// 1. 创建表单实例
var frame = new EWA_FrameClass();
frame._Id = 'userForm';
frame.Url = '/cgi-bin/user/save';

// 2. 设置验证回调
frame._ValidExOk = function(obj) {
    $(obj).css('border-color', 'green');
};
frame._ValidExFail = function(obj) {
    $(obj).css('border-color', 'red');
};

// 3. 设置提交后回调
frame.doPostAfter = function() {
    $Tip('保存成功');
    // 关闭对话框或跳转
};

// 4. 设置提交前验证
frame.DoPostBefore = function() {
    if (!this.CheckValidAll()) {
        return [false, '请检查必填项', false];
    }
    return [true];
};

// 5. 初始化 UI 组件
frame.textareaAutoSize();

// 6. 初始化加密字段（自动调用）
// frame._InitEncyptions();

// 7. 初始化 Select 筛选器
frame.InitSelectFilter('userSelect', 'json', 'PY');

// 8. 创建复选框过滤器
frame.createFilterCheckbox(
    'usrSelect',
    'usrFilter',
    '1,2,3',
    '/cgi-bin/user/list',
    'USR_ID',
    'USR_NAME',
    'USR_NAME_PY'
);

// 9. 注册到全局对象
EWA.F.FOS['userForm'] = frame;
```

### 引导模式示例

```javascript
// 1. 设置引导模式
var tb = $('#EWA_FRAME_userForm');
tb.attr('EWA_GUIDE_IDX', '0');
tb.attr('EWA_GUIDE_IDX_MAX', '2');
tb.attr('EWA_GUIDE_ID_PREV', 'btnPrev');
tb.attr('EWA_GUIDE_ID_NEXT', 'btnNext');

// 2. 设置分组索引
// <tr groupIndex="0">...基本信息...</tr>
// <tr groupIndex="1">...详细信息...</tr>
// <tr groupIndex="2">...确认信息...</tr>

// 3. 设置回调
frame.GuideShowBefore = function(obj, grpIdx) {
    if (!frame.GuideShowCheck(grpIdx)) {
        alert('请填写完当前页');
        return false;
    }
};

frame.GuideShowAfter = function(obj, grpIdx) {
    console.log('当前页:', grpIdx);
};

// 4. 显示第一页
frame.GuideShow(0);

// 5. 按钮绑定
$('#btnPrev').click(function() {
    var idx = tb.attr('EWA_GUIDE_IDX') * 1;
    if (idx > 0) {
        frame.GuideShow(idx - 1);
    }
});

$('#btnNext').click(function() {
    var idx = tb.attr('EWA_GUIDE_IDX') * 1;
    var maxIdx = tb.attr('EWA_GUIDE_IDX_MAX') * 1;
    if (idx < maxIdx) {
        frame.GuideShow(idx + 1);
    } else {
        // 提交
        frame.DoPost(document.getElementById('f_userForm'));
    }
});
```

### 分组切换示例

```javascript
// HTML
// <div class="group-tabs">
//   <div class="group-tab" onclick="EWA.F.FOS['form1'].GroupShow(this, 0)">
//     基本信息
//   </div>
//   <div class="group-tab" onclick="EWA.F.FOS['form1'].GroupShow(this, 1)">
//     详细信息
//   </div>
//   <div class="group-tab" onclick="EWA.F.FOS['form1'].GroupShow(this, 2)">
//     附件信息
//   </div>
// </div>

// 设置回调
frame.GroupShowBefore = function(obj, grpIdx) {
    // 验证当前分组
    var currentIdx = getCurrentGroupIndex();
    if (!validateGroup(currentIdx)) {
        alert('请先填写完当前分组');
        return false;
    }
};

frame.GroupShowAfter = function(obj, grpIdx) {
    // 加载分组数据
    loadGroupData(grpIdx);
};
```

## CSS 类名说明

| CSS 类 | 说明 |
|--------|------|
| ewa-row-must | 必填项所在行 |
| ewa-row-item-must | 必填项元素 |
| ewa-filter-chks | 带过滤器的 checkbox 容器 |
| ewa-filter-checked | 已选择的 checkbox 容器 |
| ewa-filter-char | 字母过滤器链接 |
| ewa-filter-char-all | 全部字母链接 |
| ewa-select-filter | Select 筛选容器 |
| ewa-select-filter-char | 字母 Select 容器 |
| ewa-select-filter-target | 目标 Select 容器 |
| ewa-enc-cover | 加密遮罩层 |
| ewa-textarea-auto-size | 自动高度 Textarea |
| ewa-guide-nav | 引导导航栏 |

## 注意事项

1. **表单 ID**: 表单必须有唯一的 `_Id`，用于生成 DOM ID
2. **验证顺序**: 提交前会自动调用 `DoPostBefore()` 进行验证
3. **文件上传**: 如果有文件上传，会等待上传完成后再提交
4. **触发验证**: 可以配置拼图等触发验证，验证通过后才允许提交
5. **引导模式**: 需要设置 `EWA_GUIDE_IDX` 等属性
6. **加密字段**: 需要配置 `DispEnc` 节点和 `EncShowUrl`
7. **内存管理**: 注意清理定时器，避免内存泄漏

## 相关文档

- [Frames 模块](frames-module.md) - 框架组件总览
- [FrameList 详解](framelist-detail.md) - 列表框架详解
- [FrameTree 详解](frametree-detail.md) - 树形框架详解
- [Core 模块](core-module.md) - 核心类库
