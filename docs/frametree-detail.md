# EWA FrameTree 树形框架详解

## 概述

`EWA_TreeClass` 是 EWA 框架中用于展示和操作树形结构数据的核心组件，支持节点展开/折叠、右键菜单、拖放、动态加载子节点等功能。

**文件位置**: `source/src/frames/EWA_07FrameTreeClass.js` (1310 行)

**相关类**:
- `EWA_TreeNodeClass` - 树节点类
- `EWA_TreeClass` - 树操作类

## 类结构

### 1. EWA_TreeNodeClass - 树节点类

#### 主要属性

```javascript
function EWA_TreeNodeClass() {
    this.Key = null;              // 节点唯一标识
    this.Text = null;             // 节点显示文本
    this.MenuGroup = null;        // 菜单组
    this.Parent = null;           // 父节点
    this.Prev = null;             // 前一个节点
    this.Next = null;             // 后一个节点
    this.AddParas = [];           // 附加参数数组
    this.Children = [];           // 子节点数组
    this.ChildLast = null;        // 最后一个子节点
    this.Cmd = null;              // 命令
    this.tagName = "TREE_NODE";   // 标签名
    this.Object = null;           // DOM 对象引用
    this.IsMoreChildren = false;  // 是否有更多子节点（异步加载）
}
```

#### 核心方法

| 方法 | 说明 |
|------|------|
| `Mark(isMark)` | 标记/取消标记节点 |
| `SetKey(newKey)` | 修改节点 Key 值 |
| `SetText(newText)` | 修改节点显示文本 |
| `SetAddParameters(parameters)` | 设置附加参数 |
| `SetMenuGroup(menuGroup)` | 设置菜单组 |
| `AddChild(node)` | 添加子节点 |
| `GetObject()` | 获取节点 DOM 对象 |
| `AddBackground(src)` | 设置背景图片 |
| `SetBookIcon(css)` | 设置书本图标 |
| `IsNodeOpen()` | 节点是否处于打开状态 |
| `NodeShow(isOpen)` | 显示/隐藏节点 |
| `NodeClose()` | 关闭节点 |
| `NodeOpen()` | 打开节点 |
| `BookShow(isOpen)` | 显示/隐藏书本图标 |
| `BookOpen()` | 打开书本图标 |
| `BookClose()` | 关闭书本图标 |
| `NodeCross(isMust)` | 设置交叉线 |
| `NodeCrossEnd(isMust)` | 设置交叉线结束 |

### 2. EWA_TreeClass - 树操作类

#### 主要属性

```javascript
function EWA_TreeClass(parentObject, className, url) {
    this.ParentObject = parentObject;   // 父容器对象
    this.ClassName = className;         // 类名称
    this._Url = url;                    // 提交 URL
    this.Url = url;                     // 公开 URL
    this.Resources = {};                // 资源
    this._Ajax = null;                  // AJAX 对象
    this.Menu = null;                   // 菜单对象
    this.Icons = null;                  // 图标配置
    this._CurNewNode = 0;               // 当前新节点计数
    this.Fields = {};                   // 字段表达式
    this._Id = null;                    // 树编号
    this._LastFocus = null;             // 最后选中的节点
    this._TempNode = document.createElement('DIV');  // 临时节点
    this._MoveNode = document.createElement('DIV');  // 移动节点
    
    // HTML 模板
    this._HtmlTemplate1 = "...";        // 主模板
    this._HtmlTemplate = "...";         // 节点模板
}
```

#### 核心方法分类

| 分类 | 方法 | 说明 |
|------|------|------|
| **节点操作** | `OpenAll()` | 打开所有节点 |
| | `CloseAll()` | 关闭所有节点 |
| | `Create(node, callback)` | 创建节点 |
| | `CreateByXml(xml)` | 从 XML 创建节点 |
| | `Delete(node)` | 删除节点 |
| | `GetNode(obj)` | 根据 DOM 获取节点 |
| | `GetNodeById(id)` | 根据 ID 获取节点 |
| | `GetFocusNode()` | 获取焦点节点 |
| **事件处理** | `Click(evt, notRunCmd)` | 点击事件 |
| | `ShowMenu(evt)` | 显示右键菜单 |
| | `_PostChange(cmd)` | 提交 AJAX 事件 |
| | `_PostChangeCallback()` | AJAX 回调 |
| **数据加载** | `LoadChildrenAfter(xmlString)` | 加载子节点 |
| | `LoadChildrenStatus(xmlString)` | 加载节点状态 |
| | `_CreateNodeFromXml(node, xml)` | 从 XML 创建节点 |
| **工具方法** | `TestIcon(node)` | 测试图标 |
| | `GetNodeLvl(node)` | 获取节点级别 |
| | `GetParentNode(node)` | 获取父节点 |
| | `DoAction(obj, action, confirm, tip, parasArray, afterJs)` | 执行动作 |

## 详细 API 说明

### 1. 节点操作

#### Mark - 标记节点

```javascript
/**
 * 标记或取消标记节点
 * @param {Boolean} isMark true=标记，false=取消标记
 */
this.Mark = function(isMark) {
    var obj = $(this.GetObject().rows[0]);
    if (isMark) {
        $(obj).addClass('ewa-tree-node-marked');
    } else {
        $(obj).removeClass('ewa-tree-node-marked');
    }
};
```

**使用示例**:
```javascript
// 标记节点
node.Mark(true);

// 取消标记
node.Mark(false);
```

#### SetKey - 修改节点 Key

```javascript
/**
 * 修改节点 Key 值，一般用于新增后将 Key 修改为数据库值
 * @param {String} newKey 新的 Key 值
 */
this.SetKey = function(newKey) {
    var obj = this.GetObject();
    this.Key = newKey;
    obj.id = newKey;
};
```

**使用示例**:
```javascript
// 新增节点后设置数据库返回的 ID
node.SetKey('DB_ID_123');
```

#### SetText - 修改节点文本

```javascript
/**
 * 修改节点显示文本
 * @param {String} newText 新的文本
 */
this.SetText = function(newText) {
    this.Text = newText;
    var obj = this.GetObject();
    obj.rows[0].cells[2].childNodes[0].innerHTML = newText;
};
```

**使用示例**:
```javascript
// 修改节点名称
node.SetText('新的部门名称');
```

#### SetAddParameters - 设置附加参数

```javascript
/**
 * 设置附加参数
 * @param {String} parameters 逗号分隔的参数列表
 */
this.SetAddParameters = function(parameters) {
    this.AddParas = parameters.split(',');
    var obj = this.GetObject();
    for (var i = 0; i < this.AddParas.length; i += 1) {
        obj.rows[0].cells[2].childNodes[0].setAttribute(
            'EWA_P' + i, this.AddParas[i].trim());
    }
};
```

**使用示例**:
```javascript
// 设置 3 个附加参数
node.SetAddParameters('param1,param2,param3');
```

#### AddChild - 添加子节点

```javascript
/**
 * 添加子节点
 * @param {EWA_TreeNodeClass} node 子节点对象
 */
this.AddChild = function(node) {
    node.Parent = this;
    this.Children[this.Children.length] = node;
    this.ChildLast = null;
    this.ChildLast = node;
    this.IsMoreChildren = false;
};
```

**使用示例**:
```javascript
// 创建子节点
var childNode = new EWA_TreeNodeClass();
childNode.Key = 'child1';
childNode.Text = '子节点 1';

// 添加到父节点
parentNode.AddChild(childNode);
```

#### NodeShow - 显示/隐藏节点

```javascript
/**
 * 显示或隐藏节点
 * @param {Boolean} isOpen true=打开，false=关闭，null=切换
 */
this.NodeShow = function(isOpen) {
    if (this.Key == 'EWA_TREE_ROOT') {
        return;
    }
    
    var tb = this.GetObject();
    var td = tb.rows[0].cells[0];
    var tag;
    
    if (isOpen == null) {
        // 未指定显示方式，取当前状态反值
        tag = this._GetTag(td);
        if (tag == "C" || tag == "D") {
            return; // 无子节点，不切换
        }
        tag = tag == "A" ? "B" : "A";
    } else {
        tag = isOpen ? "B" : "A";
    }
    
    // 更新 CSS 类名
    var css = td.className.split(' ');
    var css1 = [this._GetClassNameNoTag(td) + tag];
    for (var i = 1; i < css.length; i++) {
        css1.push(css[i]);
    }
    td.className = css1.join(' ');
    
    // 显示/隐藏子节点容器
    if (tb.rows.length == 2 && tb.rows[1].cells[1].childNodes.length > 0) {
        tb.rows[1].style.display = tag == "B" ? "table-row" : "none";
    }
    
    this.BookShow(isOpen);
    
    // 如果有更多子节点（异步加载）
    if (this.IsMoreChildren) {
        this.Object.setAttribute("EWA_TREE_MORE", "0");
        var cmd = new EWA.F.Cmd();
        cmd.EWA_ACTION = "OnTreeNodeMore";
        cmd.EWA_TREE_KEY = this.Key;
        EWA.CurUI._PostChange(cmd);
    }
    
    // 回调
    if (this.ewa && this.ewa.OnBookShowAfter) {
        try {
            this.ewa.OnBookShowAfter(tag == 'B', this);
        } catch (e) {
            console.log(e);
        }
    }
};
```

**使用示例**:
```javascript
// 切换节点状态
node.NodeShow();

// 打开节点
node.NodeShow(true);
node.NodeOpen();

// 关闭节点
node.NodeShow(false);
node.NodeClose();
```

#### IsNodeOpen - 检查节点状态

```javascript
/**
 * 节点是否处于打开状态
 * @returns {Boolean}
 */
this.IsNodeOpen = function() {
    var tb = this.GetObject();
    var td = tb.rows[0].cells[0];
    var tag = this._GetTag(td);
    return tag == "B";
};
```

**使用示例**:
```javascript
if (node.IsNodeOpen()) {
    console.log('节点已打开');
} else {
    console.log('节点已关闭');
}
```

### 2. 树操作

#### CreateByXml - 从 XML 创建树

```javascript
/**
 * 从 XML 创建节点树
 * @param {EWA.C.Xml} xml XML 对象
 */
this.CreateByXml = function(xml) {
    var nl = xml.GetElements("FrameData/Row");
    var oNodes = {};
    var firstNode;
    
    // 创建所有节点
    for (var i = 0; i < nl.length; i += 1) {
        var treeNode = this._CreateNodeFromXml(nl[i], xml);
        oNodes[treeNode.Key] = treeNode;
        
        if (i == 0) {
            firstNode = treeNode;
        } else {
            // 建立父子关系
            var key = treeNode.ParentKey == "" ? "EWA_TREE_ROOT" : treeNode.ParentKey;
            var treeNodeParent = oNodes[key];
            if (treeNodeParent != null) {
                treeNodeParent.AddChild(treeNode);
            }
        }
    }
    
    treeFirstNode = firstNode;
    this.Create(firstNode);
};
```

**使用示例**:
```javascript
// 从 XML 创建树
var xml = new EWA.C.Xml();
xml.LoadXml(xmlString);
tree.CreateByXml(xml);
```

#### Create - 创建节点

```javascript
/**
 * 创建节点
 * @param {EWA_TreeNodeClass} node 要创建的节点
 * @param {Function} callback 创建完成后的回调
 */
this.Create = function(node, callback) {
    if (node == null) {
        return;
    }
    
    // 如果是第一个节点
    if (node.Parent == null) {
        this._CreateFirst(node);
        return;
    }
    
    // 生成 HTML
    var html = this._HtmlTemplate.replace("[ID]", "id=\"" + node.Key + "\"");
    
    // 替换附加字段
    var addColsHtml = this.AddCols || "";
    html = html.replace("[TEMP_NODE_ADD_FIELDS]", addColsHtml);
    
    // 替换附加参数
    var paras = "";
    for (var i = 0; i < node.AddParas.length; i += 1) {
        if (node.AddParas[i]) {
            let v = node.AddParas[i] + "";
            paras += "EWA_P" + i + "=\"" + v.replace(/"/ig, "&quot;") + "\" ";
        }
    }
    html = html.replace("[TMP_ADD_PARAS]", paras);
    html = html.replace("[EWA_MENU_GROUP]", node.MenuGroup);
    
    // 替换图标
    var icon = this.TestIcon(node);
    html = html.replace("[B]", icon);
    html = html.replace("[C]", node.Text);
    
    // 替换更多子节点标记
    if (node.IsMoreChildren) {
        html = html.replace("[EWA_MORE_CHILDREN]", "EWA_TREE_MORE='1'");
    } else {
        html = html.replace("[EWA_MORE_CHILDREN]", "");
    }
    
    // 替换展开/折叠图标类名
    if (node.Children.length > 0 || node.IsMoreChildren) {
        html = html.replace("[A]", "TD00A");
        if (node != node.Parent.ChildLast) {
            html = html.replace("[A1]", "TD10B");
        } else {
            html = html.replace("[A1]", "TD10A");
        }
    } else {
        if (node == node.Parent.ChildLast) {
            html = html.replace("[A]", "TD00D");
        } else {
            html = html.replace("[A]", "TD00C");
        }
    }
    
    // 插入到 DOM
    var objParent = node.Parent.GetObject();
    if (objParent.rows.length == 1) {
        var tr = objParent.insertRow(-1);
        tr.insertCell(-1);
        tr.insertCell(-1);
        tr.cells[1].colSpan = 2;
    }
    
    // 设置节点级别
    var parentLvl = this.GetNodeLvl(node.Parent);
    html = html.replace("[LVL]", parentLvl + 1);
    
    this._TempNode.innerHTML = html;
    var newNodeTable = this._TempNode.childNodes[0];
    objParent.rows[1].cells[objParent.rows[1].cells.length - 1]
        .appendChild(newNodeTable);
    
    if (objParent.parentNode.childNodes[objParent.parentNode.childNodes.length - 1] != objParent) {
        objParent.rows[1].cells[0].className = "TD10B";
    }
    
    // 打开父节点
    node.Parent.NodeShow(true);
    
    if (callback) {
        callback(newNodeTable, this);
    }
    
    // 递归创建子节点
    for (var i = 0; i < node.Children.length; i += 1) {
        this.Create(node.Children[i], callback);
    }
};
```

**使用示例**:
```javascript
// 创建根节点
var rootNode = new EWA_TreeNodeClass();
rootNode.Key = 'EWA_TREE_ROOT';
rootNode.Text = '根节点';

// 创建子节点
var childNode = new EWA_TreeNodeClass();
childNode.Key = 'node1';
childNode.Text = '节点 1';
rootNode.AddChild(childNode);

// 创建树
tree.Create(rootNode, function(newNodeTable, treeInstance) {
    console.log('节点创建完成', newNodeTable);
});
```

#### OpenAll / CloseAll - 展开/折叠所有节点

```javascript
/**
 * 打开所有节点
 */
this.OpenAll = function() {
    this._OpenOrClose('.TD00A');
};

/**
 * 关闭所有节点
 */
this.CloseAll = function() {
    this._OpenOrClose('.TD00B');
};

/**
 * 内部方法：打开或关闭节点
 * @param {String} className 节点的类名称
 */
this._OpenOrClose = function(className) {
    var p = $('#EWA_TREE_' + this._Id);
    var c = this;
    p.find(className).each(function() {
        var fakeEvt = { srcElement: this };
        c.Click(fakeEvt);
    });
};
```

**使用示例**:
```javascript
// 展开所有节点
tree.OpenAll();

// 折叠所有节点
tree.CloseAll();
```

### 3. 事件处理

#### Click - 点击事件

```javascript
/**
 * 点击事件处理
 * @param {Event} evt 事件对象
 * @param {Boolean} notRunCmd 是否不执行命令（用于右键菜单）
 */
this.Click = function(evt, notRunCmd) {
    if (this.IsPostChange) {
        return;
    }
    
    EWA.CurUI = this;
    var obj = evt.srcElement ? evt.srcElement : evt.target;
    
    // INPUT 元素不处理
    if (obj.tagName == "INPUT") {
        return;
    }
    
    // 展开/折叠节点
    if (obj.tagName == "TD" && obj.className.indexOf("TD00") == 0) {
        var node = this.GetNode(obj);
        node.NodeShow();
        return;
    }
    
    // 查找 SPAN 元素
    while (!(obj.tagName == "SPAN" && 
             (obj.getAttribute("EWA_CMD") != null || 
              obj.getAttribute('EWA_TREE_TOP') == '1'))) {
        obj = obj.parentNode;
        if (obj.tagName == "BODY") {
            return;
        }
    }
    
    var node = this.GetNode(obj);
    
    if (obj.tagName == "SPAN" && 
        (obj.getAttribute("EWA_CMD") != null || 
         obj.getAttribute('EWA_TREE_TOP') == '1')) {
        
        // 取消上一个焦点节点的标记
        if (this._LastFocus != null) {
            var lastNode = this.GetNode(this._LastFocus);
            lastNode.Mark(false);
            this._LastFocus = null;
        }
        
        // 标记当前节点
        if (obj.getAttribute('EWA_TREE_TOP') != '1') {
            node.Mark(true);
        }
        this._LastFocus = obj;
        
        if (!notRunCmd) {
            // 保存状态
            if (this.Url.toUpperCase().indexOf('EWA_TREE_SKIP_GET_STATUS') < 0) {
                EWA.F.ST.SaveStatus(node.Key, 'TREE');
            }
            this._RunCmd(node);
        } else {
            return obj;
        }
        this.MoveNode(node.GetObject());
    }
};
```

**使用示例**:
```javascript
// 点击事件会自动触发，无需手动调用
// 可以通过定义 link 方法处理点击
tree.link = function(nodeKey, node) {
    console.log('点击节点:', nodeKey, node.Text);
    // 加载详情页面等
};
```

#### ShowMenu - 显示右键菜单

```javascript
/**
 * 显示右键菜单
 * @param {Event} evt 事件对象
 */
this.ShowMenu = function(evt) {
    EWA.CurUI = this;
    var obj = this.Click(evt, true); // 不执行命令
    
    if (this.Menu != null && obj != null) {
        var node = this.GetNode(obj);
        this.Menu.ShowByMouse(evt, node.MenuGroup);
    }
};
```

**使用示例**:
```javascript
// 初始化菜单
var menus = [
    { Id: 'add', Text: '新增', Group: 'root' },
    { Id: 'edit', Text: '编辑', Group: 'node' },
    { Id: 'delete', Text: '删除', Group: 'node' }
];
tree.InitMenu(menus);

// 右键点击节点时自动显示对应菜单
```

#### DoAction - 执行动作

```javascript
/**
 * 执行 AJAX 动作
 * @param {Object} obj 触发对象
 * @param {String} action 动作名称
 * @param {String} confirm 确认提示
 * @param {String} tip 操作提示
 * @param {Array} parasArray 附加参数数组
 * @param {String} afterJs 执行后的 JS
 */
this.DoAction = function(obj, action, confirm, tip, parasArray, afterJs) {
    EWA.F.CID = this._Id;
    
    if (action == null || action.trim() == "") {
        alert("action not value");
        return;
    }
    
    // 确认对话框
    if (confirm != null && confirm.trim().length > 0) {
        var msg = _EWA_INFO_MSG[confirm];
        if (!(msg == null || msg == "")) {
            if (!window.confirm(msg)) return;
        } else {
            if (!window.confirm(confirm)) return;
        }
    }
    
    // 创建 AJAX 对象
    this._Ajax = new EWA.C.Ajax();
    this._Ajax.LoadingType = "image";
    this._Ajax.AddParameter("EWA_AJAX", "1");
    this._Ajax.AddParameter("EWA_ACTION", action);
    this._Ajax.AddParameter("EWA_ID", this._Id);
    this._Ajax.AddParameter("EWA_NO_CONTENT", "1");
    this._Ajax.AddParameter("EWA_ACTION_TIP", tip);
    
    if (afterJs != null && afterJs.trim().length > 0) {
        this._Ajax.AddParameter("EWA_AFTER_EVENT", afterJs);
        this.StopAjaxAfterReload = true;
        this._Ajax.AddParameter("EWA_ACTION_RELOAD", "0");
    } else {
        this.StopAjaxAfterReload = false;
    }
    
    // 附加参数
    if (parasArray != null && parasArray.length > 0) {
        for (var i = 0; i < parasArray.length; i += 1) {
            this._Ajax.AddParameter(parasArray[i].Name, parasArray[i].Value);
        }
    }
    
    var url = new EWA.C.Url();
    url.SetUrl(this.Url);
    var u = url.RemoveParameter("EWA_ACTION");
    
    this._Ajax.PostNew(u, EWA.F.FOS[EWA.F.CID]._PostChangeCallback);
};
```

**使用示例**:
```javascript
// 删除节点
tree.DoAction(
    node.GetObject(),           // 触发对象
    'deleteNode',               // 动作名称
    'CONFIRM_DELETE',           // 确认提示
    '正在删除...',              // 操作提示
    [                           // 附加参数
        { Name: 'nodeKey', Value: node.Key }
    ],
    'afterDelete()'             // 执行后的 JS
);
```

### 4. 数据加载

#### LoadChildrenAfter - 加载子节点

```javascript
/**
 * 加载子节点（异步加载后调用）
 * @param {String} xmlString XML 字符串
 */
this.LoadChildrenAfter = function(xmlString) {
    var xml = new EWA.C.Xml();
    xml.LoadXml(xmlString);
    var nl = xml.GetElements("FrameData/Row");
    
    if (nl == null || nl.length == 0) {
        return;
    }
    
    var firstNode = this.GetNodeById(this.PostChangeKey);
    var oNodes = {};
    oNodes[firstNode.Key] = firstNode;
    
    // 创建子节点
    for (var i = 0; i < nl.length; i += 1) {
        var treeNode = this._CreateNodeFromXml(nl[i], xml);
        if (treeNode.Key == "EWA_TREE_ROOT") {
            continue;
        }
        if (treeNode.ParentKey == null || treeNode.ParentKey == "") {
            treeNode.ParentKey = firstNode.Key;
        }
        oNodes[treeNode.Key] = treeNode;
        
        var pkey = treeNode.ParentKey;
        if (oNodes[pkey] != null) {
            oNodes[pkey].AddChild(treeNode);
        }
    }
    
    // 创建 DOM
    if (firstNode.Children.length > 0) {
        for (var i = 0; i < firstNode.Children.length; i += 1) {
            this.Create(firstNode.Children[i]);
        }
    }
    
    firstNode.NodeShow(true);
};
```

**使用示例**:
```javascript
// 异步加载子节点
// 当节点有 IsMoreChildren=true 时，点击会自动触发 AJAX 加载
```

### 5. 工具方法

#### GetNode - 根据 DOM 获取节点

```javascript
/**
 * 根据 DOM 对象获取节点
 * @param {HTMLElement} obj 节点下的任意 DOM 对象
 * @returns {EWA_TreeNodeClass}
 */
this.GetNode = function(obj) {
    if (obj == null || obj.tagName == null) {
        return null;
    }
    
    var o1 = obj;
    var inc = 0;
    
    // 向上查找直到找到 TABLE 节点
    while (!(o1.tagName == "TABLE" && 
             (o1.getAttribute("EWA_T") == "1" || o1.id == "EWA_TREE_ROOT"))) {
        o1 = o1.parentNode;
        inc++;
        if (inc > 33) return null;
        if (o1.tagName == "BODY") return null;
    }
    
    var node = new EWA_TreeNodeClass();
    node.ewa = this;
    node.Key = o1.id;
    node.MenuGroup = o1.getAttribute("EWA_MG");
    node.Object = o1;
    
    // 获取文本
    var oNodeTd = o1.rows[0].cells[2];
    node.Text = GetInnerText(oNodeTd);
    
    // 获取附加参数
    for (var i = 0; i < 3; i += 1) {
        node.AddParas[i] = oNodeTd.childNodes[0].getAttribute("EWA_P" + i);
    }
    
    // 获取更多子节点标记
    var moreChild = o1.getAttribute("EWA_TREE_MORE");
    node.IsMoreChildren = moreChild == "1" ? true : false;
    
    // 获取子节点
    if (o1.rows.length > 1) {
        var td = o1.rows[1].cells[o1.rows[1].cells.length - 1];
        for (var i = 0; i < td.childNodes.length; i += 1) {
            var chd = td.childNodes[i];
            if (chd.nodeType == 3) continue;
            if (chd.tagName == 'TABLE' && chd.getAttribute("EWA_T") == "1") {
                node.Children.push(this.GetNode(chd));
            }
        }
        if (node.Children.length > 0) {
            node.ChildLast = node.Children[node.Children.length - 1];
        }
    }
    
    return node;
};
```

**使用示例**:
```javascript
// 从点击的元素获取节点
var node = tree.GetNode(clickElement);
console.log('节点 Key:', node.Key);
console.log('节点文本:', node.Text);
```

#### GetNodeLvl - 获取节点级别

```javascript
/**
 * 获取节点所在的级别
 * @param {EWA_TreeNodeClass} node 节点
 * @returns {Number} 级别（从 1 开始）
 */
this.GetNodeLvl = function(node) {
    var n = node;
    
    // 检查是否有缓存
    if (node.Object.getAttribute('tree_lvl')) {
        return node.Object.getAttribute('tree_lvl') * 1;
    }
    
    // 向上查找父节点计算级别
    for (var i = 0; i < 100; i++) {
        var p = this.GetParentNode(n);
        if (p == null) {
            node.Object.setAttribute('tree_lvl', i + 1);
            return i + 1;
        } else {
            n = p;
        }
    }
};
```

**使用示例**:
```javascript
var lvl = tree.GetNodeLvl(node);
console.log('节点级别:', lvl); // 1=根节点，2=一级子节点...
```

#### TestIcon - 测试图标

```javascript
/**
 * 根据配置测试返回图标类名
 * @param {EWA_TreeNodeClass} node 节点
 * @returns {String} 图标类名
 */
this.TestIcon = function(node) {
    if (this.Icons == null) {
        return "TD01A"; // 默认图标
    }
    
    for (var a in this.Icons) {
        var b = this.Icons[a];
        var val = null;
        
        // 根据 TEST 类型获取值
        switch (b.TEST.toUpperCase()) {
            case 'KEY': val = node.Key; break;
            case 'PARENTKEY': val = node.Parent.Key; break;
            case 'TEXT': val = node.Text; break;
            case 'P0': val = node.AddParas[0]; break;
            case 'P1': val = node.AddParas[1]; break;
            case 'P2': val = node.AddParas[2]; break;
            case 'MG': val = node.MenuGroup; break;
        }
        
        if (val == null) continue;
        
        // 正则匹配
        var c = eval('/' + b.FILTER + '/ig');
        if (c.test(val)) {
            return b.NAME + "A";
        }
    }
    return "TD01A";
};
```

**使用示例**:
```javascript
// 配置图标规则
tree.Icons = {
    'folder': {
        TEST: 'PARENTKEY',
        FILTER: '^ROOT',
        NAME: 'TD02' // 文件夹图标
    },
    'file': {
        TEST: 'TEXT',
        FILTER: '\\.doc$',
        NAME: 'TD03' // Word 文档图标
    }
};

// 创建节点时会自动应用匹配的图标
```

## 使用示例

### 完整示例

```javascript
// 1. 创建树实例
var tree = new EWA_TreeClass(
    document.getElementById('treeContainer'), // 父容器
    'myTree',                                  // 类名称
    '/cgi-bin/tree/xml'                        // URL
);
tree._Id = 'deptTree';

// 2. 配置图标
tree.Icons = {
    'dept': {
        TEST: 'P0',
        FILTER: '^DEPT',
        NAME: 'TD02'
    },
    'person': {
        TEST: 'P0',
        FILTER: '^PERSON',
        NAME: 'TD03'
    }
};

// 3. 初始化菜单
var menus = [
    { Id: 'addDept', Text: '新增部门', Group: 'dept' },
    { Id: 'editDept', Text: '编辑部门', Group: 'dept' },
    { Id: 'deleteDept', Text: '删除部门', Group: 'dept' },
    { Id: 'addPerson', Text: '新增人员', Group: 'person' },
    { Id: 'editPerson', Text: '编辑人员', Group: 'person' },
    { Id: 'deletePerson', Text: '删除人员', Group: 'person' }
];
tree.InitMenu(menus);

// 4. 定义点击处理
tree.link = function(nodeKey, node) {
    console.log('点击节点:', nodeKey);
    // 加载详情
    loadDetail(nodeKey);
};

// 5. 定义节点展开后的回调
tree.OnBookShowAfter = function(isOpen, node) {
    if (isOpen) {
        console.log('节点展开:', node.Key);
    }
};

// 6. 从 XML 创建树
var xml = new EWA.C.Xml();
xml.LoadXml(xmlString);
tree.CreateByXml(xml);

// 7. 注册到全局对象
EWA.F.FOS['deptTree'] = tree;
```

### 动态添加节点

```javascript
// 获取父节点
var parentNode = tree.GetNodeById('parent123');

// 创建新节点
var newNode = new EWA_TreeNodeClass();
newNode.Key = 'new_node_' + Date.now();
newNode.Text = '新节点';
newNode.ParentKey = parentNode.Key;
newNode.AddParas = ['PERSON', '', ''];

// 添加到父节点
parentNode.AddChild(newNode);

// 创建 DOM
tree.Create(newNode, function(newNodeTable, treeInstance) {
    console.log('节点创建完成');
});
```

### 删除节点

```javascript
// 获取选中节点
var node = tree.GetFocusNode();

if (node) {
    // 执行删除动作
    tree.DoAction(
        node.GetObject(),
        'deleteNode',
        'CONFIRM_DELETE',
        '正在删除...',
        [{ Name: 'nodeKey', Value: node.Key }],
        'afterDelete()'
    );
}
```

### 展开/折叠到指定级别

```javascript
// 展开所有节点
tree.OpenAll();

// 折叠所有节点
tree.CloseAll();

// 展开到指定级别
function expandToLevel(level) {
    $('#EWA_TREE_' + tree._Id).find('.ewa-tree-node').each(function() {
        var lvl = $(this).attr('ewa-tree-lvl');
        if (lvl && lvl <= level) {
            var node = tree.GetNode(this);
            if (node) {
                node.NodeOpen();
            }
        }
    });
}

expandToLevel(2); // 展开到第 2 级
```

## HTML 模板

### 主模板

```javascript
this._HtmlTemplate1 = 
    "<div oncontextmenu='myTree.ShowMenu(event);return false;' " +
    "onclick='myTree.Click(event)'>" +
    "<table border=0 cellspacing=0 [ID] cellpadding=0 width=100% " +
    "style='table-layout:fiexed'>" +
    "<tr><TD></TD><td class=CAPTION>&nbsp;&nbsp;&nbsp;</td>" +
    "<td width=99%><SPAN style='padding-left:4px'>[B]</SPAN></td></tr>" +
    "<tr><td></td><td colspan=2></td></tr></table></div>" +
    "<div style='display:none'>" +
    "<input style='margin:0px' type=text " +
    "onblur='myTree.RenameBlur(this)'></div>";
```

### 节点模板

```javascript
this._HtmlTemplate = 
    "<table class='ewa-tree-node ewa-tree-lvl-[LVL]' border=0 " +
    "EWA_MG=\"[EWA_MENU_GROUP]\" EWA_T=1 [EWA_MORE_CHILDREN] " +
    "cellspacing=0 [ID] cellpadding=0 width=100%>" +
    "<tr class='ewa-node-row-0'>" +
    "<td nowrap class='[A] ewa-node-open-close'><div>&nbsp;</div></td>" +
    "<td nowrap class='[B] ewa-node-icon'><div>&nbsp;</div></td>" +
    "<td class='ewa-node-caption'>" +
    "<SPAN EWA_CMD=1 [TMP_ADD_PARAS]>[C]</SPAN></td>" +
    "[TEMP_NODE_ADD_FIELDS]" +
    "</tr>" +
    "<tr class='ewa-node-row-1' style='display:none'>" +
    "<td class='[A1]'></td><td colspan=13></td></tr></table>";
```

**模板占位符说明**:
- `[ID]` - 节点 ID
- `[A]` - 展开/折叠图标类名（TD00A/B/C/D）
- `[B]` - 节点图标类名
- `[C]` - 节点文本
- `[A1]` - 子节点容器图标类名
- `[LVL]` - 节点级别
- `[EWA_MENU_GROUP]` - 菜单组
- `[EWA_MORE_CHILDREN]` - 更多子节点标记
- `[TMP_ADD_PARAS]` - 附加参数
- `[TEMP_NODE_ADD_FIELDS]` - 附加字段

## CSS 类名说明

### 展开/折叠图标

| 类名 | 说明 |
|------|------|
| TD00A | 有子节点，已展开 |
| TD00B | 有子节点，已折叠 |
| TD00C | 无子节点，最后一个 |
| TD00D | 无子节点，非最后一个 |

### 交叉线图标

| 类名 | 说明 |
|------|------|
| TD10A | 交叉线结束 |
| TD10B | 交叉线继续 |

### 节点状态

| CSS 类 | 说明 |
|--------|------|
| ewa-tree-node-marked | 选中的节点 |
| ewa-node-row-0 | 节点行 |
| ewa-node-row-1 | 子节点容器行 |
| ewa-tree-lvl-N | 节点级别（N=1,2,3...） |

## 注意事项

1. **节点 Key 唯一性**: 所有节点的 Key 必须唯一
2. **根节点**: 根节点的 Key 固定为 `EWA_TREE_ROOT`
3. **异步加载**: 设置 `IsMoreChildren=true` 可启用异步加载子节点
4. **菜单组**: 右键菜单通过 `MenuGroup` 区分不同节点类型的菜单
5. **图标配置**: 通过 `Icons` 配置可以根据节点属性动态设置图标
6. **内存管理**: 删除节点时注意清理事件绑定
7. **状态保存**: 节点展开状态会自动保存到服务器

## 相关文档

- [Frames 模块](frames-module.md) - 框架组件总览
- [FrameList 详解](framelist-detail.md) - 列表框架详解
- [Core 模块](core-module.md) - 核心类库
