# EWA ListFrame 列表框架详解

## 概述

`EWA_ListFrameClass` 是 EWA 框架中用于展示和操作数据列表的核心组件，提供分页、排序、搜索、列控制、单元格编辑等丰富功能。

**文件位置**: `source/src/frames/EWA_04FrameListClass.js` (3607 行)

**相关组件**:
- `EWA_05FrameListFrame_ShowHideColumnsClass.js` - 列显示/隐藏控制
- `EWA_05FrameListFrame_CellResizeClass.js` - 列宽调整
- `EWA_04FrameListFrameResources.js` - 列表资源（已合并到主类）

## 类结构

### 主要属性

```javascript
function EWA_ListFrameClass() {
    // XML 和 AJAX
    this.Xml = null;
    this._Ajax = null;
    this.ItemList = new EWA_FrameCommonItems();
    this.Resources = {};
    
    // 分页相关
    this._PageCurrent = null;      // 当前页码
    this._PageSize = null;         // 每页大小
    this._PageCount = null;        // 总页数
    this._RecordCount = null;      // 总记录数
    this._PageCurrentName = null;  // 页码参数名
    this._PageSizeName = null;     // 页大小参数名
    this._PageCountName = null;    // 页数参数名
    this._RecordCountName = null;  // 记录数参数名
    
    // 排序相关
    this._Sort = null;             // 排序字段
    this._SortName = null;         // 排序参数名
    
    // 搜索相关
    this._SearchExp = "";          // 检索表达式
    this._SearchHtml = null;       // 搜索 HTML
    this._SearchFields = [];       // 搜索字段
    this._SearchDialog = null;     // 搜索对话框
    this._SearchJson = {};         // 搜索 JSON 配置
    
    // 行选择相关
    this._IsCheckedAll = true;     // 是否全选
    this._TrSelectMulti = true;    // 是否多选行
    this.IsTrSelect = false;       // 是否可以选择行
    this.IsNotMDownAutoChecked = false; // 是否自动选择 checkbox
    
    // 回调事件
    this.ReloadAfter = null;       // 刷新后的事件
    this.CheckedAllAfter = null;   // 全选后的事件
    
    // 功能开关
    this._isStickyHeaders = false;     // 是否启用表头固定
    this.REPLACE_HISTORY_STATE = false; // 列表查询更换网页 URL
    this._IsSearchGroup = true;        // 查询分组标记
}
```

### 核心方法分类

| 分类 | 方法 | 说明 |
|------|------|------|
| **分页** | `Goto(page, httpReferer)` | 跳转到指定页 |
| | `Reload(httpReferer)` | 重新加载数据 |
| | `NewPageSize(pageSize)` | 设置新的每页大小 |
| **搜索** | `SearchGetExpInit()` | 获取搜索表达式 |
| | `SearchMark()` | 标记搜索结果 |
| | `composeSearchTexts()` | 合并搜索文本 |
| **列操作** | `stickyHeaders()` | 固定表头 |
| | `stickyColumns(columns)` | 固定左侧列 |
| | `AddColumns()` | 动态添加列 |
| | `Merge()` | 合并单元格 |
| **行操作** | `AddRow()` | 添加行 |
| | `GetRow()` | 获取行对象 |
| | `DblClick()` | 双击行处理 |
| **数据操作** | `Delete()` | 删除选中记录 |
| | `DownlodData()` | 下载数据 |
| | `Calc()` | 计算列汇总 |
| **事件处理** | `_CallBack()` | AJAX 回调 |
| | `_CallBackJs()` | JS 回调 |

## 详细 API 说明

### 1. 分页功能

#### Goto - 跳转页面

```javascript
/**
 * @param {Number} gotoPage 目标页码
 * @param {String} httpReferer 跳转发起的页面
 */
this.Goto = function(gotoPage, httpReferer) {
    EWA.F.CID = this._Id;
    this._PageCurrent = gotoPage;
    this._Ajax = this.CreateAjax();
    
    var url = new EWA_UrlClass();
    url.SetUrl(this.Url == null ? document.location.href : this.Url);
    url.RemoveParameter("EWA_AJAX");
    
    this._Ajax.PostNew(url.GetUrl(), function() {
        c._CallBack(httpReferer);
    });
    
    // 可选：替换浏览器历史状态
    if (this.REPLACE_HISTORY_STATE) {
        this.replaceHistoryState();
    }
};
```

**使用示例**:
```javascript
// 跳转到第 2 页
listFrame.Goto(2);

// 从 Frame 调用跳转
listFrame.Goto(1, 'frameParent');
```

#### Reload - 重新加载

```javascript
this.Reload = function(httpReferer) {
    this.Goto(this._PageCurrent, httpReferer);
};
```

**使用示例**:
```javascript
// 重新加载当前页数据
listFrame.Reload();

// 重新加载并指定来源
listFrame.Reload('userForm');
```

#### NewPageSize - 设置每页大小

```javascript
this.NewPageSize = function(pageSize) {
    if (this._PageSize == pageSize) {
        return;
    }
    this._PageSize = pageSize;
    this.Goto(1); // 重置到第一页
};
```

**使用示例**:
```javascript
// 设置每页显示 50 条
listFrame.NewPageSize(50);
```

### 2. 搜索功能

#### 搜索表达式

```javascript
// 搜索字段配置
this._SearchFields = [];
this._SearchExp = ""; // 检索表达式
this._SearchJson = {}; // 搜索配置 JSON

// 获取搜索表达式
this.SearchGetExpInit = function() {
    // 从搜索表单收集条件
    // 返回格式化的搜索表达式
};
```

#### 合并搜索文本

```javascript
/**
 * 合并多个搜索字段到第一个 input 中
 * @returns {jQuery} 搜索对象列表
 */
this.composeSearchTexts = function() {
    var titles = [];
    var names = [];
    var objs = $('#EWA_RESHOW_' + this._Id + ' .ewa-lf-search-type-text');
    
    objs.each(function(index) {
        var txt = $(this).find('.ewa-lf-search-item-title').text();
        txt = txt.replace(":", "").replace("：", "")
                .replace("包含", "").replace("Like", "").trim();
        
        var name = $(this).find('input[type=text]').attr('name');
        titles.push(txt);
        names.push(name);
        
        if (index > 0) {
            $(this).hide(); // 隐藏其他搜索项
        }
    });
    
    // 设置第一个搜索框的 placeholder
    searchTable.find('input[type=text]')
        .attr('name', names.join(','))
        .attr('placeholder', titles.join(", "));
    
    return objs;
};
```

**使用示例**:
```javascript
// 合并搜索字段为综合搜索
listFrame.composeSearchTexts();
// 效果：将多个搜索框合并为一个，placeholder 显示所有字段名
```

### 3. 列控制功能

#### 固定表头 (stickyHeaders)

```javascript
/**
 * 启用表头固定功能
 * 将功能行、搜索行、表头固定在滚动容器顶部
 */
this.stickyHeaders = function() {
    if (this._isStickyColumns) {
        console.warn("stickyColumns is enabled, stickyHeaders will not work properly.");
        return;
    }
    this._isStickyHeaders = true;
    
    const mainTable = $('#EWA_RESHOW_' + this._Id);
    const scrollParent = EWA.UI.findScrollParent(mainTable[0]);
    
    // 固定功能行
    const trFunc = mainTable.find('.ewa_lf_func').parent();
    if (trFunc.length == 1 && !trFunc.hasClass('ewa-lf-sticky-func')) {
        trFunc.css('position', 'sticky')
              .css('top', trFunc.offset().top)
              .addClass('ewa-lf-sticky-func');
    }
    
    // 固定搜索行
    const divSearch = mainTable.find('.ewa-lf-search');
    if (divSearch.length == 1 && !divSearch.hasClass('ewa-lf-sticky-search')) {
        divSearch.css('position', 'sticky')
                 .css('top', divSearch.offset().top)
                 .addClass('ewa-lf-sticky-search');
    }
    
    // 固定表头
    const lfHeader = mainTable.find('.ewa-lf-header');
    if (lfHeader.length == 1 && !lfHeader.hasClass('ewa-lf-sticky-header')) {
        lfHeader.css('position', 'sticky')
                .css('top', lfHeader.offset().top)
                .addClass('ewa-lf-sticky-header');
    }
    
    // 监听滚动事件
    $(scrollDom).on('scroll', function() {
        const css = 'ewa-lf-sticky-scroll-vertical';
        if (scrollTopDom.scrollTop === 0) {
            $(scrollParent).removeClass(css);
        } else if (!$(scrollParent).hasClass(css)) {
            $(scrollParent).addClass(css);
        }
    });
};
```

**使用示例**:
```javascript
// 启用表头固定
listFrame.stickyHeaders();
```

#### 固定左侧列 (stickyColumns)

```javascript
/**
 * 固定左侧的 columns，从 0 开始
 * @param {Number} columns 要固定的列数
 */
this.stickyColumns = function(columns) {
    if (this._isStickyHeaders) {
        console.warn("stickyHeaders is enabled, stickyColumns will not work properly.");
        return;
    }
    this._isStickyColumns = true;
    
    var tb = $X('EWA_LF_' + this._Id);
    for (let i = 0; i < columns; i++) {
        this.stickyColumn(i, i == columns - 1, tb);
    }
    
    // 监听水平滚动
    $(scrollDom).on('scroll', function() {
        const css = 'ewa-lf-sticky-last-hide';
        if (scrollTopDom.scrollLeft === 0) {
            $(scrollParent).addClass(css);
        } else if ($(scrollParent).hasClass(css)) {
            $(scrollParent).removeClass(css);
        }
    });
};

/**
 * 固定单个列
 * @param {Number} index 列索引
 * @param {Boolean} isLast 是否为最后一列
 * @param {HTMLElement} tb 表格对象
 */
this.stickyColumn = function(index, isLast, tb) {
    let row0 = tb.rows[0];
    let cell = row0.cells[index];
    
    let left = $(cell).position().left;
    let width = $(cell).width();
    let css = { left: left, width: width };
    
    for (let m = 0; m < tb.rows.length; m++) {
        let c = $(tb.rows[m].cells[index]);
        c.css(css)
         .addClass('ewa-lf-sticky');
        if (isLast) {
            c.addClass('ewa-lf-sticky-last')
             .css('overflow', 'initial');
        }
    }
};
```

**使用示例**:
```javascript
// 固定前 2 列
listFrame.stickyColumns(2);
```

#### 动态添加列

```javascript
/**
 * 动态添加列
 * @param {Array} datas 列数据数组
 * @param {String} colId 列 ID 字段名
 * @param {String} colText 列标题字段名
 * @param {String} colMemo 列提示字段名
 * @param {String} colHtml 列 HTML 模板
 * @param {String} colType 列类型 (SELECT/DATE/TIME/STRING/NUMBER)
 * @param {String} addAttrs 附加属性
 * @param {Number} startCellIndex 开始插入的列索引
 */
this.AddColumns = function(datas, colId, colText, colMemo, colHtml, colType, addAttrs, startCellIndex) {
    var tb = $X('EWA_LF_' + this._Id);
    
    if (startCellIndex == null) {
        startCellIndex = tb.rows[0].cells.length;
    }
    
    for (var i = 0; i < datas.length; i++) {
        var d = datas[i];
        var idx = startCellIndex + i;
        
        for (var m = 0; m < tb.rows.length; m++) {
            var td = tb.rows[m].insertCell(idx);
            
            if (m == 0) {
                // 表头
                td.className = "EWA_TD_H ewa-add-column ewa-col-" + d[colId];
                td.innerHTML = '<nobr cellIdx="' + (idx) + '" id="' + d[colId] + '">' 
                              + d[colText] + '</nobr>';
            } else {
                // 数据行
                var rowId = tb.rows[m].getAttribute('EWA_KEY');
                td.className = "EWA_TD_M ewa-add-column ewa-col-" + d[colId];
                
                var id = rowId + '_' + d[colId];
                var h = this._GetAddControl(d[colType], d[colText], d[colMemo]);
                
                if (h == null) {
                    h = colHtml;
                }
                
                td.innerHTML = h;
                td.childNodes[0].id = id;
            }
        }
    }
};
```

**使用示例**:
```javascript
// 添加操作列
var columns = [{
    COL_ID: 'action',
    COL_TEXT: '操作',
    COL_MEMO: '操作列'
}];

listFrame.AddColumns(
    columns,
    'COL_ID',    // ID 字段
    'COL_TEXT',  // 标题字段
    'COL_MEMO',  // 提示字段
    '<button onclick="edit(\'[ID]\')">编辑</button>', // HTML
    'STRING',    // 类型
    'class="action-col"', // 属性
    5             // 从第 5 列开始
);
```

### 4. 单元格合并

```javascript
/**
 * 合并单元格
 * @param {String} from 来源对象的 id
 * @param {String} to 合并到的对象的 id
 * @param {String} mergeStr 合并添加的字符
 * @param {Function} funcEachRow 每行合并完成后执行的方法
 * @param {Boolean} isMergeHeader 是否合并头部标题
 */
this.Merge = function(from, to, mergeStr, funcEachRow, isMergeHeader) {
    let tb = $('#EWA_LF_' + this._Id);
    
    if (mergeStr == null) {
        mergeStr = "";
    } else if (mergeStr.indexOf('<') == -1) {
        mergeStr = "<span class='ewa-merge-str ewa-mearge-str'>" + mergeStr + "</span>";
    }
    
    // 遍历所有数据行
    tb.find('tr[ewa_key],tr.ewa-lf-sub-tr').each(function() {
        let toObj = $(this).find('[id="' + to + '"]');
        let toParent = toObj.parentsUntil('tr').last();
        
        if (toParent.attr('ewa-merged') == 'yes') {
            return; // 已合并
        }
        toParent.attr('ewa-merged', 'yes');
        
        let fromobj = $(this).find('[id="' + from + '"]');
        let fromobjParent = fromobj.parentsUntil('tr').last();
        fromobjParent.hide().addClass('ewa-row-merge-hide');
        
        // 添加分割字符
        toParent.append(mergeStr);
        toParent.append(fromobj);
        
        if (funcEachRow) {
            funcEachRow(toParent, this); // td, tr
        }
    });
    
    // 合并表头
    if (isMergeHeader) {
        let headerHtml = "<span class='ewa-lf-merge-header-split'></span>"
                        + tb.find('tr[ewa_tag="HEADER"] [id="' + from + '"]').html();
        tb.find('tr[ewa_tag="HEADER"] [id="' + to + '"]').append(headerHtml);
        tb.find('tr[ewa_tag="HEADER"] [id="' + from + '"]').parent().hide();
    }
    
    tb.find('td#ADD_ROW_' + from).hide();
};
```

**使用示例**:
```javascript
// 简单合并
listFrame.Merge('col1', 'col2', ' - ');

// 带回调的合并
listFrame.Merge('name', 'address', '<br>', function(td, tr) {
    td.addClass('merged-cell');
});

// 合并表头
listFrame.Merge('phone', 'mobile', '/', null, true);

// 批量合并
listFrame.Merges([
    { from: 'col1', to: 'col2', str: ' - ' },
    { from: 'col3', to: 'col4', str: ' / ' }
]);
```

### 5. 行操作

#### 添加行

```javascript
this.AddRow = function(arrRowTxt) {
    var tb = $X('EWA_LF_' + this._Id);
    var tr = tb.insertRow(-1);
    
    for (var i = 0; i < tb.rows[0].cells.length; i++) {
        var td = tr.insertCell(-1);
        var hCell = tb.rows[0].cells[i];
        
        td.className = "EWA_TD_M";
        if (arrRowTxt[i] != null) {
            td.innerHTML = arrRowTxt[i];
        }
        td.style.display = hCell.style.display;
        td.id = 'ADD_ROW_' + hCell.childNodes[0].id;
    }
    return tr;
};
```

**使用示例**:
```javascript
// 添加一行数据
var newRow = ['张三', '男', '25', '北京'];
listFrame.AddRow(newRow);
```

#### 获取行对象

```javascript
this.GetRow = function(obj) {
    // 从子对象向上查找直到 TR
    while (obj && obj.tagName != 'TR') {
        obj = obj.parentNode;
    }
    return obj;
};
```

**使用示例**:
```javascript
// 获取按钮所在行
var row = listFrame.GetRow(clickButton);
```

### 6. 数据操作

#### 删除记录

```javascript
this.Delete = function(confirmMsg, action) {
    // 获取选中的行
    var selectedRows = this.GetSelectedRows();
    if (selectedRows.length == 0) {
        alert('请选择要删除的记录');
        return;
    }
    
    // 构建删除参数
    var keys = [];
    $(selectedRows).each(function() {
        var key = $(this).attr('ewa_key');
        keys.push(key);
    });
    
    // 发送到服务器
    var u1 = this.getUrlClass();
    u1.AddParameter("ewa_action", action || "delete");
    u1.AddParameter("ewa_keys", keys.join(','));
    
    var c = this;
    this._Ajax.PostNew(u1.GetUrl(), function() {
        c._CallBackJs();
    });
};
```

**使用示例**:
```javascript
// 删除选中记录
listFrame.Delete('确定要删除选中的记录吗？', 'deleteUser');
```

#### 下载数据

```javascript
/**
 * 下载数据
 * @param {String} t 类型 (excel/csv/pdf)
 * @param {String} action 后台 action
 */
this.DownlodData = function(t, action) {
    EWA.F.CID = this._Id;
    this._Ajax = new EWA.C.Ajax();
    this._Ajax.LoadingType = "image";
    
    if (this._Sort != null) {
        this._Ajax.AddParameter(this._SortName, this._Sort);
    }
    if (this._SearchExp != null && this._SearchExp != "") {
        this._Ajax.AddParameter("EWA_LF_SEARCH", this._SearchExp);
    }
    
    this._Ajax.AddParameter("EWA_AJAX", "DOWN_DATA");
    this._Ajax.AddParameter("EWA_AJAX_DOWN_TYPE", t);
    if (action) {
        this._Ajax.AddParameter("EWA_ACTION", action);
    }
    
    var url = new EWA_UrlClass();
    url.SetUrl(this.Url == null ? document.location.href : this.Url);
    
    var c = this;
    this._Ajax.PostNew(url.GetUrl(), function() {
        c._CallBack();
    });
};
```

**使用示例**:
```javascript
// 下载 Excel
listFrame.DownlodData('excel', 'exportUser');

// 下载 CSV
listFrame.DownlodData('csv', 'exportUser');
```

### 7. 计算汇总

```javascript
/**
 * 计算列汇总
 * @param {Array} arrCols 要计算的列索引
 * @param {Number} rowIdxStart 起始行索引
 * @param {Number} rowIdxEnd 结束行索引
 * @param {Number} rowSum 汇总行索引
 */
this.Calc = function(arrCols, rowIdxStart, rowIdxEnd, rowSum) {
    var tb = $X('EWA_LF_' + this._Id);
    var sums = {};
    
    // 初始化汇总
    for (var i = 0; i < arrCols.length; i++) {
        sums[arrCols[i]] = 0;
    }
    
    // 累加数据
    for (var i = rowIdxStart; i < rowIdxEnd; i++) {
        var tr = tb.rows[i];
        for (var m = 0; m < tr.cells.length; m++) {
            if (sums[m] == null) continue;
            
            var td = tr.cells[m];
            var inputs = td.getElementsByTagName('input');
            
            if (inputs.length > 0) {
                sums[m] += inputs[0].value * 1;
            } else {
                var v = GetInnerText(td);
                if (v == '') v = 0;
                sums[m] += v * 1;
            }
        }
    }
    
    // 更新汇总行
    var trSum = tb.rows[rowSum];
    for (var i = 0; i < trSum.cells.length; i++) {
        if (sums[i] != null) {
            var v = Math.round(sums[i] * 100) / 100;
            trSum.cells[i].innerHTML = v.fm(); // 格式化为货币
        }
    }
};
```

**使用示例**:
```javascript
// 计算第 2-10 行的第 3、4 列汇总，结果显示在第 11 行
listFrame.Calc([2, 3], 1, 10, 10);
```

## 列显示/隐藏控制

### EWA_ListFrame_ShowHideColumnsClass

**文件位置**: `source/src/frames/EWA_05FrameListFrame_ShowHideColumnsClass.js` (253 行)

```javascript
function EWA_ListFrame_ShowHideColumns(instanceName) {
    this._name = instanceName;
    this.frameUnid = "";
    this.storageId = "";
    this.inited = false;
    this.notHideColsArr = []; // 禁止隐藏的列
    this.defHideCols = "";    // 默认隐藏的列
    this.wrap = "";           // 容器 ID
    
    /**
     * 初始化
     * @param {String} fraUnid Frame 唯一 ID
     * @param {String} notHideCols 不隐藏的列（逗号分隔）
     * @param {String} defHideCols 默认隐藏的列
     */
    this.init = function(fraUnid, notHideCols, defHideCols) {
        this.frameUnid = fraUnid;
        this.wrap = "#" + fraUnid + "_RESHOW";
        this.defHideCols = defHideCols;
        this.storageId = "LF_HIDE_COLS_" + this.frameUnid;
        
        if (notHideCols) {
            this.notHideColsArr = notHideCols.split(",");
        }
        
        // 从 localStorage 读取隐藏配置
        if (defHideCols && !window.localStorage.hasOwnProperty(this.storageId)) {
            window.localStorage[this.storageId] = defHideCols;
        }
        
        // 创建齿轮按钮
        var caption = $(this.wrap + " .ewa_lf_func_caption").parent();
        var but = "<div class='ewa_lf_func_dact ewa-lf-func-recycle but-shc-gear'>"
                 + "<b class='fa fa-gear'></b></div>";
        caption.append(but);
        
        // 绑定点击事件
        caption.find(".but-shc-gear").on("click", function() {
            _self.togglePanel();
        });
        
        // 读取已隐藏的列
        var hideIds = window.localStorage[this.storageId];
        if (hideIds) {
            var arrHideIds = hideIds.split(",");
            for (var i = 0; i < arrHideIds.length; i++) {
                this.hide(arrHideIds[i]);
            }
        }
    };
    
    /**
     * 显示/隐藏面板
     */
    this.togglePanel = function() {
        $(".custom-cols-panel-box[data-fid!=\"" + this.frameUnid + "\"]").hide();
        $(this.wrap + " .custom-cols-panel-box").toggle();
        this.adjustPanel();
    };
    
    /**
     * 隐藏列
     */
    this.hide = function(id) {
        $("#EWA_LF_" + this.frameUnid + " .ewa-col-" + id).hide();
        $("#EWA_LF_" + this.frameUnid + " #ADD_ROW_" + id).hide();
        $("#EWA_LF_" + this.frameUnid + " #INS_ROW_" + id).hide();
    };
    
    /**
     * 显示列
     */
    this.show = function(id) {
        $("#EWA_LF_" + this.frameUnid + " .ewa-col-" + id).show();
        $("#EWA_LF_" + this.frameUnid + " #ADD_ROW_" + id).show();
        $("#EWA_LF_" + this.frameUnid + " #INS_ROW_" + id).show();
    };
    
    /**
     * 设置列的显示/隐藏状态
     */
    this.setCol = function(id) {
        var ids = window.localStorage[this.storageId];
        if (!ids) {
            window.localStorage[this.storageId] = id;
            this.hide(id);
            return;
        }
        
        var arrIds = ids.split(",");
        var newArrIds = [];
        for (var i = 0; i < arrIds.length; i++) {
            if (id == arrIds[i]) {
                this.show(id);
            } else {
                newArrIds.push(arrIds[i]);
            }
        }
        
        if (arrIds.length == newArrIds.length) {
            newArrIds.push(id);
            this.hide(id);
        }
        
        window.localStorage[this.storageId] = newArrIds.join(",");
    };
    
    /**
     * 恢复默认设置
     */
    this.setDefault = function() {
        this.togglePanel();
        window.localStorage[this.storageId] = this.defHideCols;
        EWA.F.FOS[this.frameUnid].Reload();
    };
}
```

**使用示例**:
```javascript
// 创建列控制实例
var colControl = new EWA_ListFrame_ShowHideColumns('myListFrame');

// 初始化（第 0 列和复选列不隐藏，默认隐藏第 3、4 列）
colControl.init('listFrame123', '0,CHECKED', '3,4');

// 或者使用简化初始化
colControl.initPart('listFrame123', '0,CHECKED', '3,4');
```

## 列宽调整

### EWA_ListFrame_CellResizeClass

**文件位置**: `source/src/frames/EWA_05FrameListFrame_CellResizeClass.js` (192 行)

```javascript
function EWA_ListFrame_CellResizeClass(instanceName) {
    this._Name = instanceName;
    this._Table = null;
    this._Cover = null;
    this._CellResize = new Array();
    
    /**
     * 初始化
     * @param {HTMLElement} objTable 目标表格对象
     */
    this.Init = function(objTable) {
        this._Table = objTable;
        this._Table.style.tableLayout = 'fixed';
        this._Table.style.width = this._Table.clientWidth + 'px';
        
        // 创建覆盖层
        this._Cover = this._CreateElement('div', 
            "width:100%; height:100%; background-color:blue; position:absolute; " +
            "top:0px; left:0px; display:block; " +
            "filter:alpha(opacity=0); opacity:0", 
            document.body);
        
        // 为每列创建调整标记
        for (var i = 0; i < this._Table.rows[0].cells.length - 1; i++) {
            this._CreateMarker(i);
        }
        this._SetLocation();
    };
    
    /**
     * 创建调整标记
     */
    this._CreateMarker = function(tdIndex) {
        var otd = this._Table.rows[0].cells[tdIndex];
        var style = 'width:40px; height:' + this._Table.clientHeight 
                   + 'px; position:absolute; cursor:e-resize';
        var obj = this._CreateElement('div', style, document.body);
        
        obj.setAttribute('TDINDEX', tdIndex);
        obj.setAttribute('instanceName', instanceName);
        
        // 绑定事件
        obj.onmouseover = function() { /* 显示覆盖层 */ };
        obj.onmousedown = function(event) { /* 开始拖动 */ };
        obj.onmouseup = function(event) { /* 结束拖动 */ };
        obj.onmousemove = function(event) { /* 拖动中 */ };
        
        this._CellResize[tdIndex] = obj;
    };
    
    /**
     * 鼠标按下事件
     */
    this._OnMouseDown = function(obj, evt) {
        this._ShowCover(true);
        obj.childNodes[0].style.borderLeft = '1px solid black';
        obj.setAttribute('D', 1);
        
        var e = evt ? evt : event;
        var x = this._EventX(e);
        obj.setAttribute('X', x);
        obj.setAttribute('SX', x);
    };
    
    /**
     * 鼠标移动事件
     */
    this._OnMouseMove = function(obj, evt) {
        if (obj.getAttribute('D') != '1') return;
        
        var e = evt ? evt : event;
        var x = this._EventX(e);
        var x0 = obj.getAttribute('X') * 1;
        var dx = x - x0;
        
        obj.style.left = obj.style.left.replace('px', '') * 1 + dx + 'px';
        obj.setAttribute('X', x);
    };
    
    /**
     * 鼠标释放事件
     */
    this._OnMouseUp = function(obj, evt) {
        obj.setAttribute('D', 0);
        var e = evt ? evt : event;
        var x = this._EventX(e);
        var dx = x - obj.getAttribute('SX') * 1;
        var tdIndex = obj.getAttribute('TDINDEX');
        
        // 调整列宽
        var td = this._Table.rows[0].cells[tdIndex];
        var px = td.clientWidth + dx;
        td.style.width = px < 4 ? 4 : px + 'px';
        
        this._SetLocation();
    };
}
```

**使用示例**:
```javascript
// 创建列宽调整实例
var resize = new EWA_ListFrame_CellResizeClass('myResize');

// 初始化
var table = document.getElementById('EWA_LF_listFrame123');
resize.Init(table);
```

## 回调事件

### ReloadAfter - 刷新后回调

```javascript
// 定义刷新后的回调函数
listFrame.ReloadAfter = function(httpReferer) {
    console.log('数据刷新完成', httpReferer);
    
    // 重新初始化某些功能
    initTooltips();
    bindEvents();
};
```

### CheckedAllAfter - 全选后回调

```javascript
// 定义全选后的回调函数
listFrame.CheckedAllAfter = function(checked) {
    console.log('全选状态变更', checked);
    
    // 根据全选状态执行操作
    if (checked) {
        enableBatchActions();
    } else {
        disableBatchActions();
    }
};
```

## 使用示例

### 完整示例

```javascript
// 1. 创建列表框架实例
var listFrame = new EWA_ListFrameClass();
listFrame._Id = 'userList';
listFrame.Url = '/cgi-bin/?xmlName=user/xml&itemName=user/list';

// 2. 配置分页
listFrame._PageCurrent = 1;
listFrame._PageSize = 20;
listFrame._PageSizeName = 'pageSize';
listFrame._PageCurrentName = 'page';

// 3. 启用表头固定
listFrame.stickyHeaders();

// 4. 配置列控制
var colControl = new EWA_ListFrame_ShowHideColumns('userList');
colControl.init('userList', '0,CHECKED', '3,4');

// 5. 设置刷新回调
listFrame.ReloadAfter = function() {
    // 重新绑定事件
    $('.edit-btn').on('click', function() {
        var row = listFrame.GetRow(this);
        var key = $(row).attr('ewa_key');
        openEditDialog(key);
    });
};

// 6. 合并单元格
listFrame.Merge('province', 'city', ' - ', null, true);

// 7. 添加操作列
listFrame.AddColumns(
    [{ COL_ID: 'action', COL_TEXT: '操作', COL_MEMO: '操作列' }],
    'COL_ID', 'COL_TEXT', 'COL_MEMO',
    '<button onclick="edit(\'[ID]\')">编辑</button>',
    'STRING',
    'class="action-col"',
    10
);

// 8. 加载数据
listFrame.Goto(1);
```

## 注意事项

1. **表头固定与列固定冲突**: `stickyHeaders()` 和 `stickyColumns()` 不能同时使用，会有样式冲突
2. **LocalStorage 使用**: 列显示/隐藏配置保存在 localStorage，注意清理
3. **AJAX 回调**: 确保在 `_CallBack` 中处理完所有状态后再执行自定义回调
4. **内存管理**: 列表刷新时注意清理旧的事件绑定
5. **分页参数**: 确保后端支持分页参数（page, pageSize, sort 等）

## 相关文档

- [Frames 模块](frames-module.md) - 框架组件总览
- [Core 模块](core-module.md) - 核心类库
- [UI 模块](ui-module.md) - UI 组件
