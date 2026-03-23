# EWA MenuClass 菜单组件详解

## 概述

`EWA_UI_MenuClass` 是 EWA 框架中用于创建和展示菜单的组件，支持顶部菜单、左侧菜单、下拉菜单、多级菜单和 Metro 风格菜单等多种展示方式。

**文件位置**: `source/src/ui/EWA_02UI_MenuClass.js` (860 行)

**相关类**:
- `EWA_UI_MenuItemClass` - 菜单项类
- `EWA_UI_DialogClass` - 对话框类（用于下拉菜单）
- `EWA_UI_Metro` - Metro 风格菜单

## 类结构

### 1. EWA_UI_MenuItemClass - 菜单项类

```javascript
function EWA_UI_MenuItemClass() {
    this.Img = null;    // 图片
    this.Txt = null;    // 显示文字
    this.Cmd = null;    // 脚本
    this.Group = null;  // 菜单组
}
```

### 2. EWA_UI_MenuClass - 菜单类

#### 主要属性

```javascript
function EWA_UI_MenuClass(className) {
    this.ClassName = className;     // 类名
    this.MenuShowType = "";         // 菜单展示类型 (TOP/LEFT/METRO)
    this.Dialog = null;             // 主对话框
    this.Dialogs = new Array();     // 子对话框数组
    this._LastObj = null;           // 上一个操作对象
    this._ItemsDiv = null;          // 菜单项容器
    this.clickedItem = null;        // 被点击的菜单项
    this.IsOut = false;             // 鼠标是否移出
}
```

#### 核心方法分类

| 分类 | 方法 | 说明 |
|------|------|------|
| **初始化** | `Create(menuItems)` | 创建菜单 |
| | `InstallMenus(menusId, parentId, showType)` | 安装菜单 |
| **事件处理** | `Click(e, obj)` | 点击处理 |
| | `OnClick(event, obj)` | 点击事件 |
| | `OnMouseOver(obj)` | 鼠标悬停 |
| **下拉菜单** | `_ShowPullDownMenu(obj, dia)` | 显示下拉菜单 |
| | `_CheckChildren(id)` | 检查子菜单 |
| | `_CalcLevel(obj)` | 计算菜单级别 |
| **显示控制** | `ShowByObject(obj, dia, lvl)` | 根据对象显示 |
| | `ShowByMouse(evt, group)` | 根据鼠标位置显示 |
| | `_HiddenDialogs()` | 隐藏对话框 |
| | `AutoHidden()` | 自动隐藏 |
| **左侧菜单** | `_InstallMenusLeft(tb, ms, al, menusId)` | 安装左侧菜单 |
| **工具方法** | `_CreateDialog()` | 创建对话框 |
| | `_InitEvent()` | 初始化事件 |

### 3. EWA_UI_Metro - Metro 风格菜单

```javascript
var EWA_UI_Metro = {
    // 属性
    g_menu_cols: 6,           // 列数
    g_menu_rows: 3,           // 行数
    menuLoadInRight: false,   // 是否在右侧加载
    
    // 方法
    show_title: function(obj),           // 显示标题
    item_click: function(obj),           // 项点击
    add_menus: function(menus, pid, className, cols, rows, isShowBlank),
    add_menu_item: function(tr, item, isShowBlank, idx, className, hid),
    css: function(),                     // 加载 CSS
    right_show_menu_sub: function(obj, evt),  // 右侧显示子菜单
    right_add_menu_subs: function(pobj),      // 添加子菜单
    right_item_click: function(obj)           // 右侧项点击
};
```

## 详细 API 说明

### 1. 菜单创建

#### Create - 创建菜单

```javascript
/**
 * 创建菜单
 * @param {Array} menuItems 菜单项数组
 */
this.Create = function(menuItems) {
    if (menuItems == null || menuItems.length == 0) {
        return;
    }
    
    this.Dialog = new EWA_UI_DialogClass();
    this.Dialog.Create();
    
    var ss = [];
    ss.push("<div class='ewa_menu_box' " +
        "onmousemove='window." + this.ClassName + ".IsOut=false;' " +
        "onmouseout='window." + this.ClassName + ".IsOut=true; " +
        "var t1=new Date().getTime(); " +
        "if(t1-$(this).attr(\"open_time\")>1000){ " +
        "window.setTimeout(function(){ " +
        "var a=window." + this.ClassName + ";a.AutoHidden(this);},1410);}' " +
        "onselectstart='return false' " +
        "style='width:120px;cursor:pointer;-moz-user-select:none;'>");
    
    // 生成菜单项
    for (var i = 0; i < menuItems.length; i += 1) {
        var o = menuItems[i];
        ss.push("<div class='ewa_menu_m' " +
            "EWA_MG=\"" + o.Group + "\" " +
            "style='cursor:pointer' " +
            "EWA_CMD=\"" + o.Cmd + "\">" +
            o.Txt + "</div>");
    }
    
    ss.push("</div>");
    this.Dialog.SetHtml(ss.join(''));
};
```

**使用示例**:
```javascript
// 创建菜单项
var menuItems = [
    { Img: 'fa fa-home', Txt: '首页', Cmd: 'goHome()', Group: 'main' },
    { Img: 'fa fa-user', Txt: '用户', Cmd: 'goUser()', Group: 'main' },
    { Img: 'fa fa-cog', Txt: '设置', Cmd: 'goSettings()', Group: 'main' }
];

// 创建菜单
var menu = new EWA_UI_MenuClass('myMenu');
menu.Create(menuItems);

// 显示菜单
menu.ShowByMouse(event, 'main');
```

#### InstallMenus - 安装菜单

```javascript
/**
 * 安装菜单
 * @param {String} menusId 菜单定义容器 ID
 * @param {String} parentId 菜单安装位置 ID
 * @param {String} showType 展示类型 (TOP/LEFT/METRO)
 */
this.InstallMenus = function(menusId, parentId, showType) {
    // Metro 风格特殊处理
    if (showType == 'METRO') {
        var menus = [];
        var map = {};
        
        $('.ewa_menu_m').each(function() {
            var o = $(this);
            var d = {};
            d.id = o.attr('id');
            d.pid = o.attr('EWA_MF_PID');
            d.url = o.attr('EWA_CMD');
            d.icon = o.find('.ewa_menu_m0').attr('class');
            d.title = o.text().trim();
            
            if (d.icon) {
                d.icon = d.icon.replace('ewa_menu_m0', '').trim();
            }
            
            if (d.pid == "") {
                d.pid = "0";
                d.subs = [];
                map[d.id] = d;
                menus.push(d);
            } else {
                map[d.pid].subs.push(d);
            }
        });
        
        EWA_UI_Metro.menus = menus;
        EWA_UI_Metro.add_menus(menus, 'EWA_FRAME_MAIN', 'item', null, null, true);
        return;
    }
    
    this.MenuShowType = showType;
    
    var ms = $X(menusId);
    var p = $X(parentId);
    
    if (p == null) {
        alert('MenuShow defined error (' + parentId + ')');
        return;
    }
    
    this._ItemsDiv = ms;
    
    var s1 = "<table onselectstart='return false' " +
        "style='cursor:pointer;-moz-user-select:none;' " +
        "border=0 cellspacing=0 cellpadding=0>";
    s1 += "</table>";
    
    var al = [];
    p.innerHTML = s1;
    var tb = p.childNodes[0];
    
    // 获取第一层菜单
    for (var i = 0; i < ms.childNodes.length; i++) {
        var o = ms.childNodes[i];
        if (o.tagName == 'DIV' && o.getAttribute('EWA_MF_PID') == "") {
            al.push(o);
        }
    }
    
    // 顶部菜单
    if (this.MenuShowType == '' || this.MenuShowType == 'TOP') {
        tb.insertRow(-1);
        for (var i = 0; i < al.length; i++) {
            var td = tb.rows[0].insertCell(-1);
            td.appendChild(al[i]);
        }
    } else {
        // 左侧菜单
        this._InstallMenusLeft(tb, ms, al, menusId);
    }
};
```

**使用示例**:
```html
<!-- HTML 菜单定义 -->
<div id="menuDefs" style="display:none">
    <div id="menu1" EWA_CMD="goHome()">首页</div>
    <div id="menu2" EWA_CMD="goUser()">用户</div>
    <div id="menu3" EWA_CMD="goSettings()">设置</div>
</div>

<!-- 菜单容器 -->
<div id="menuContainer"></div>

<script>
// 安装顶部菜单
var menu = new EWA_UI_MenuClass('mainMenu');
menu.InstallMenus('menuDefs', 'menuContainer', 'TOP');
</script>
```

### 2. 事件处理

#### Click - 点击处理

```javascript
/**
 * 点击处理
 * @param {Event} e 事件对象
 * @param {HTMLElement} obj 菜单项对象
 */
this.Click = function(e, obj) {
    // 点击前事件
    if (this.clickBeforeEvent) {
        this.clickBeforeEvent(e, obj);
    }
    
    if (this.MenuShowType == 'LEFT') {
        // 左侧菜单处理
    } else {
        // 其他菜单处理
        if (this._LastObj != null) {
            this._LastObj.className = this._LastObj.className.replace('_mv1', '');
        }
        this._LastObj = null;
        
        typeof e.stopPropagation != "undefined" ? 
            e.stopPropagation() : e.cancelBubble = true;
        
        this._HiddenDialogs();
    }
    
    // 执行命令
    EWA.C.Utils.RunCmd(obj);
    
    // 点击后事件
    if (this.clickAfterEvent) {
        this.clickAfterEvent(e, obj);
    }
};
```

**使用示例**:
```javascript
// 设置点击前事件
menu.clickBeforeEvent = function(e, obj) {
    console.log('即将点击:', obj.innerHTML);
};

// 设置点击后事件
menu.clickAfterEvent = function(e, obj) {
    console.log('已点击:', obj.innerHTML);
};
```

#### OnClick - 点击事件

```javascript
/**
 * 点击事件
 * @param {Event} event 事件对象
 * @param {HTMLElement} obj 菜单项对象
 */
this.OnClick = function(event, obj) {
    this.clickedItem = obj;
    
    if (this.MenuShowType == 'LEFT') {
        // 左侧菜单处理
        var menuDiv = obj.parentNode.parentNode;
        var po = obj.parentNode;
        var co = obj.parentNode.parentNode.childNodes[1];
        
        if (co == null) {
            return;
        }
        
        if (co.childNodes.length == 0) {
            // 没有子菜单，直接选中
            if (this._LastCkObj) {
                this._LastCkObj.style.backgroundColor = '';
            }
            po.style.backgroundColor = '#ccc';
            this._LastCkObj = po;
        } else {
            // 有子菜单，切换显示
            if (co.style.display == 'none') {
                co.style.display = '';
                $(menuDiv).addClass('ewa-lmenu-show');
            } else {
                $(menuDiv).removeClass('ewa-lmenu-show');
                co.style.display = 'none';
            }
            
            if (window.event) {
                event.cancelBubble = true;
            } else {
                event.stopPropagation();
            }
        }
        
        this.Click(event, obj);
    } else {
        // 其他菜单处理
        if (obj.getAttribute('EWA_MF_PID') == "") {
            this._HiddenDialogs();
            
            var lvl = 0;
            if (this.Dialogs.length <= lvl) {
                this.Dialogs.push(this._CreateDialog());
            }
            
            var items = this._ShowPullDownMenu(obj, this.Dialogs[lvl]);
            if (items > 0) {
                this.ShowByObject(obj, this.Dialogs[lvl], lvl);
                return;
            }
        }
        
        this.Click(event, obj);
    }
};
```

### 3. 下拉菜单

#### _ShowPullDownMenu - 显示下拉菜单

```javascript
/**
 * 显示下拉菜单
 * @param {HTMLElement} obj 触发对象
 * @param {EWA_UI_DialogClass} dia 对话框对象
 * @returns {Number} 菜单项数量
 */
this._ShowPullDownMenu = function(obj, dia) {
    // 清空当前内容
    var o = $X(dia.FrameContent).childNodes[0].rows[0].cells[0];
    while (o.childNodes.length > 0) {
        var menuItem = o.childNodes[0];
        this._ItemsDiv.appendChild(menuItem);
    }
    
    var al = new Array();
    
    // 查找子菜单项
    for (var i = 0; i < this._ItemsDiv.childNodes.length; i++) {
        var o2 = this._ItemsDiv.childNodes[i];
        
        if (o2.innerHTML.toUpperCase().indexOf('<HR') > 0) {
            // 分隔线
        } else {
            o2.style.paddingRight = '10px';
        }
        
        if (o2.getAttribute('EWA_MF_PID') == obj.id) {
            al.push(o2);
        }
    }
    
    var len = al.length;
    
    // 添加到对话框
    for (var i = 0; i < al.length; i++) {
        o.appendChild(al[i]);
        
        // 检查是否有子菜单
        var isHaveChildren = this._CheckChildren(al[i].id);
        if (isHaveChildren) {
            var tdd = al[i].childNodes[0].rows[0].cells[2];
            if (tdd.getAttribute('gdx') == null || 
                tdd.getAttribute('gdx') == '') {
                tdd.innerHTML += " +";
                tdd.setAttribute('gdx', 'gdx');
            }
            al[i].setAttribute('EWA_MF_CHILD', "1");
        } else {
            al[i].setAttribute('EWA_MF_CHILD', "0");
        }
        
        al[i] = null;
    }
    
    al.length = 0;
    al = null;
    
    // 设置高度
    $X(dia.FrameContent).childNodes[0].style.height = 'auto';
    
    return len;
};
```

#### _CheckChildren - 检查子菜单

```javascript
/**
 * 检查是否有子菜单
 * @param {String} id 菜单项 ID
 * @returns {Boolean} 是否有子菜单
 */
this._CheckChildren = function(id) {
    for (var i = 0; i < this._ItemsDiv.childNodes.length; i++) {
        var o2 = this._ItemsDiv.childNodes[i];
        if (o2.getAttribute('EWA_MF_PID') == id) {
            return true;
        }
    }
    return false;
};
```

#### _CalcLevel - 计算菜单级别

```javascript
/**
 * 计算菜单级别
 * @param {HTMLElement} obj 菜单项对象
 * @returns {Number} 菜单级别
 */
this._CalcLevel = function(obj) {
    var lvl = 0;
    var o1 = obj;
    
    while (o1.getAttribute('EWA_MF_PID') != "") {
        lvl += 1;
        o1 = document.getElementById(o1.getAttribute('EWA_MF_PID'));
        if (o1 == null) {
            return null;
        }
    }
    
    return lvl;
};
```

### 4. 显示控制

#### ShowByObject - 根据对象显示

```javascript
/**
 * 根据对象显示菜单
 * @param {HTMLElement} obj 触发对象
 * @param {EWA_UI_DialogClass} dia 对话框对象
 * @param {Number} lvl 菜单级别
 */
this.ShowByObject = function(obj, dia, lvl) {
    var p = obj;
    var x = 0, y = 0;
    
    do {
        x += p.offsetLeft;
        y += p.offsetTop;
        p = p.offsetParent;
    } while (p);
    
    var w = dia.GetFrame().offsetWidth;
    var h = dia.GetFrame().offsetHeight;
    
    var bw = document.body.clientWidth;
    var bh = document.body.clientHeight;
    
    // 计算显示位置
    if (lvl == 0) {
        // 第一级菜单
        dia.Move(x, y + obj.offsetHeight);
    } else {
        // 子菜单
        if (x + w > bw) {
            dia.Move(x - w, y);
        } else {
            dia.Move(x + obj.offsetWidth, y);
        }
    }
    
    dia.Show(true);
    
    // 设置打开时间
    $(dia.getMain()).attr('open_time', new Date().getTime());
};
```

#### ShowByMouse - 根据鼠标位置显示

```javascript
/**
 * 根据鼠标位置显示菜单
 * @param {Event} evt 事件对象
 * @param {String} group 菜单组
 */
this.ShowByMouse = function(evt, group) {
    var e = evt || window.event;
    var x = e.clientX || e.pageX;
    var y = e.clientY || e.pageY;
    
    this.Dialog.Move(x, y);
    this.Dialog.Show(true);
};
```

#### _HiddenDialogs - 隐藏对话框

```javascript
/**
 * 隐藏所有对话框
 */
this._HiddenDialogs = function() {
    if (this.Dialog != null) {
        this.Dialog.Show(false);
    }
    
    for (var i = 0; i < this.Dialogs.length; i++) {
        this.Dialogs[i].Show(false);
        
        // 移动菜单项回容器
        var o = $X(this.Dialogs[i].FrameContent)
                    .childNodes[0].rows[0].cells[0];
        while (o.childNodes.length > 0) {
            this._ItemsDiv.appendChild(o.childNodes[0]);
        }
    }
};
```

#### AutoHidden - 自动隐藏

```javascript
/**
 * 自动隐藏菜单
 */
this.AutoHidden = function() {
    if (this.IsOut) {
        this._HiddenDialogs();
    }
};
```

### 5. 左侧菜单

#### _InstallMenusLeft - 安装左侧菜单

```javascript
/**
 * 安装左侧菜单
 * @param {HTMLElement} tb 表格对象
 * @param {HTMLElement} ms 菜单定义容器
 * @param {Array} al 第一层菜单项
 * @param {String} menusId 菜单定义容器 ID
 */
this._InstallMenusLeft = function(tb, ms, al, menusId) {
    $(tb).addClass('ewa-lmenu');
    
    // 生成第一层菜单
    for (var i = 0; i < al.length; i++) {
        var tr = tb.insertRow(-1);
        var td = tr.insertCell(-1);
        
        var div = document.createElement('div');
        div.innerHTML = '<div class="ewa_lmenu_bar" des="rq1"></div>' +
                       '<div des="rq2" style="padding-left:5px"></div>';
        
        al[i].style.height = '100%';
        div.childNodes[0].appendChild(al[i]);
        
        if (i == 0) {
            $(div).addClass('ewa-lmenu-show');
        } else {
            div.childNodes[1].style.display = 'none';
        }
        
        td.appendChild(div);
    }
    
    // 处理子菜单
    var subMenus = ms.childNodes;
    while (ms.childNodes.length > 0) {
        var o = subMenus[0];
        var pid = o.getAttribute('EWA_MF_PID');
        
        var div = document.createElement('div');
        div.innerHTML = '<div class="ewa_lmenu_bar1"></div>' +
                       '<div style="padding-left:4px;display:none"></div>';
        
        if (!$X(pid)) {
            console.warn('not found pid', pid, o);
            $(o).remove();
            continue;
        }
        
        var menu0 = $X(pid).parentNode.parentNode;
        $(menu0).addClass('ewa-lmenu-children');
        menu0.childNodes[1].appendChild(div);
        div.childNodes[0].appendChild(o);
    }
};
```

### 6. Metro 风格菜单

#### add_menus - 添加 Metro 菜单

```javascript
/**
 * 添加 Metro 风格菜单
 * @param {Array} menus 菜单数组
 * @param {String} pid 父容器 ID
 * @param {String} className 类名
 * @param {Number} cols 列数
 * @param {Number} rows 行数
 * @param {Boolean} isShowBlank 是否显示空白项
 */
add_menus: function(menus, pid, className, cols, rows, isShowBlank) {
    this.g_menu_cols = window.g_menu_cols || 6;  // 列数
    this.g_menu_rows = window.g_menu_rows || 3; // 行数
    this.menuLoadInRight = window.menuLoadInRight || false;
    
    cols = cols || this.g_menu_cols;
    rows = rows || this.g_menu_rows;
    
    // 将系统管理菜单移到最后一个位置
    for (var i = 0; i < menus.length; i++) {
        var item = menus[i];
        if (item && item.icon && item.icon.indexOf('gear') > 0) {
            menus[i] = null;
            menus[cols * rows - 1] = item;
            break;
        }
    }
    
    var table = document.createElement('table');
    $X(pid).innerHTML = "";
    $X(pid).className = 'ewa-metro-menu';
    $X(pid).appendChild(table);
    
    // 添加标题提示框
    $($X(pid)).append('<div class="pop_title" style="display:none">' +
                     '<div>-</div><p></p></div>');
    $($X(pid)).css('background', 'transparent').css('border', 0);
    
    table.align = 'center';
    var idx = 0;
    var ss = [];
    
    for (var i = 0; i < rows; i++) {
        var hid = pid + '_htr_' + i;
        
        // 隐藏行（用于子菜单）
        var tr1 = table.insertRow(-1);
        tr1.id = hid;
        var td1 = tr1.insertCell(-1);
        td1.colSpan = cols;
        tr1.style.display = 'none';
        td1.id = hid + 'a';
        
        // 菜单行
        var tr = table.insertRow(-1);
        
        for (var m = 0; m < cols; m++) {
            var item = menus[idx];
            idx++;
            
            var td = this.add_menu_item(tr, item, isShowBlank, idx, className, hid);
            
            if (item) {
                td.id = "M_" + item.id;
            }
            
            if (td && item && (item.all == null || item.all == true)) {
                var s1 = td.innerHTML;
                ss.push(s1);
            }
        }
    }
}
```

#### add_menu_item - 添加菜单项

```javascript
/**
 * 添加菜单项
 * @param {HTMLElement} tr 行对象
 * @param {Object} item 菜单项对象
 * @param {Boolean} isShowBlank 是否显示空白项
 * @param {Number} idx 索引
 * @param {String} className 类名
 * @param {String} hid 隐藏行 ID
 */
add_menu_item: function(tr, item, isShowBlank, idx, className, hid) {
    var td = tr.insertCell(-1);
    
    if (item == null) {
        if (isShowBlank) {
            td.className = className;
            td.innerHTML = "<div class='" + className + "'>" +
                          "<i class=''></i><div></div></div>";
        }
        return td;
    }
    
    td.className = className;
    td.title = item.title;
    td.setAttribute('_title', item.title);
    td.setAttribute('u', item.url);
    
    // 鼠标悬停显示标题
    td.onmouseover = function() {
        EWA_UI_Metro.show_title(this);
    };
    
    // 点击事件
    td.onclick = function() {
        EWA_UI_Metro.item_click(this);
    };
    
    var icon = item.icon || 'fa fa-home';
    td.innerHTML = "<div class='" + className + "'>" +
                  "<i class='" + icon + "'></i><div>" + item.title + "</div></div>";
    
    // 处理子菜单
    if (item.subs && item.subs.length > 0) {
        td.setAttribute('subs', JSON.stringify(item.subs));
        
        if (this.menuLoadInRight) {
            td.onclick = function(evt) {
                EWA_UI_Metro.right_show_menu_sub(this, evt);
            };
        }
    }
    
    return td;
}
```

#### show_title - 显示标题提示

```javascript
/**
 * 显示标题提示
 * @param {HTMLElement} obj 菜单项对象
 */
show_title: function(obj) {
    if (obj.getAttribute('_title') == "" || 
        obj.getAttribute('_title') == null) {
        var ttt = obj.title;
        if (ttt == "" || ttt == null) {
            return;
        }
        obj.setAttribute("_title", ttt);
        obj.title = "";
    }
    
    $(".pop_title div").html(obj.getAttribute('_title'));
    
    var p = $(obj).offset();
    var w = $(obj).width();
    var h = $(".pop_title").height();
    var w1 = $(".pop_title").width();
    
    $(".pop_title").css('top', p.top - h - 8);
    $(".pop_title").show();
    $(".pop_title").css('left', p.left - (w1 - w) / 2);
}
```

#### item_click - 菜单项点击

```javascript
/**
 * 菜单项点击
 * @param {HTMLElement} obj 菜单项对象
 */
item_click: function(obj) {
    var item = $(obj);
    var u = item.attr("u");
    var t = item.attr("_title");
    
    if (u) {
        if (u.startsWith("js:")) {
            var u1 = u.replace("js:", "");
            eval(u1);
            return;
        }
        
        if (u.indexOf('/') > 0) {
            u = u;
        } else if (u.indexOf('?') >= 0) {
            u = EWA.CP + "/EWA_STYLE/cgi-bin/" + u;
        } else {
            u = EWA.CP + "/EWA_STYLE/cgi-bin/?" + u;
        }
        
        top.AddTab(u, t);
    }
}
```

## 使用示例

### 1. 顶部菜单

```html
<!-- 菜单定义 -->
<div id="menuDefs" style="display:none">
    <div id="home" EWA_CMD="goHome()">首页</div>
    <div id="user" EWA_CMD="goUser()">用户管理</div>
    <div id="settings" EWA_CMD="goSettings()">系统设置</div>
</div>

<!-- 菜单容器 -->
<div id="topMenu"></div>

<script>
// 创建并安装菜单
var menu = new EWA_UI_MenuClass('topMenu');
menu.InstallMenus('menuDefs', 'topMenu', 'TOP');
</script>
```

### 2. 左侧菜单

```html
<!-- 菜单定义 -->
<div id="menuDefs" style="display:none">
    <div id="module1">模块一</div>
    <div id="module2">模块二</div>
    <div id="module3">模块三</div>
    
    <!-- 子菜单 -->
    <div id="menu1_1" EWA_MF_PID="module1">功能 1-1</div>
    <div id="menu1_2" EWA_MF_PID="module1">功能 1-2</div>
    <div id="menu2_1" EWA_MF_PID="module2">功能 2-1</div>
</div>

<!-- 菜单容器 -->
<div id="leftMenu"></div>

<script>
// 创建并安装左侧菜单
var menu = new EWA_UI_MenuClass('leftMenu');
menu.InstallMenus('menuDefs', 'leftMenu', 'LEFT');
</script>
```

### 3. 右键菜单

```html
<!-- 右键菜单定义 -->
<div id="contextMenu" style="display:none">
    <div id="edit" EWA_CMD="edit()">编辑</div>
    <div id="delete" EWA_CMD="delete()">删除</div>
    <hr/>
    <div id="refresh" EWA_CMD="refresh()">刷新</div>
</div>

<script>
// 创建右键菜单
var menu = new EWA_UI_MenuClass('contextMenu');
menu.Create([
    { Txt: '编辑', Cmd: 'edit()', Group: 'context' },
    { Txt: '删除', Cmd: 'delete()', Group: 'context' },
    { Txt: '刷新', Cmd: 'refresh()', Group: 'context' }
]);

// 绑定右键事件
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    menu.ShowByMouse(e, 'context');
});
</script>
```

### 4. Metro 风格菜单

```html
<!-- Metro 菜单定义 -->
<div class="ewa_menu_m" id="home" EWA_CMD="goHome()">
    <span class="ewa_menu_m0 fa fa-home"></span>
    首页
</div>
<div class="ewa_menu_m" id="user" EWA_CMD="goUser()">
    <span class="ewa_menu_m0 fa fa-user"></span>
    用户管理
</div>
<div class="ewa_menu_m" id="settings" EWA_CMD="goSettings()">
    <span class="ewa_menu_m0 fa fa-cog"></span>
    系统设置
</div>

<!-- 菜单容器 -->
<div id="metroMenu"></div>

<script>
// 安装 Metro 菜单
var menu = new EWA_UI_MenuClass('metroMenu');
menu.InstallMenus('', 'metroMenu', 'METRO');
</script>
```

### 5. 多级下拉菜单

```html
<!-- 多级菜单定义 -->
<div id="menuDefs" style="display:none">
    <div id="file">文件</div>
    <div id="edit">编辑</div>
    <div id="help">帮助</div>
    
    <!-- 文件子菜单 -->
    <div id="file_new" EWA_MF_PID="file">新建</div>
    <div id="file_open" EWA_MF_PID="file">打开</div>
    <div id="file_save" EWA_MF_PID="file">保存</div>
    
    <!-- 新建子菜单 -->
    <div id="file_new_doc" EWA_MF_PID="file_new">文档</div>
    <div id="file_new_xls" EWA_MF_PID="file_new">表格</div>
</div>

<script>
// 创建多级菜单
var menu = new EWA_UI_MenuClass('multiMenu');
menu.InstallMenus('menuDefs', 'multiMenu', 'TOP');
</script>
```

### 6. 动态菜单

```javascript
// 动态创建菜单项
var menuItems = [];

// 从服务器加载菜单数据
$J('/cgi-bin/menu/list', function(rst) {
    for (var i = 0; i < rst.length; i++) {
        var item = rst[i];
        menuItems.push({
            Img: item.icon,
            Txt: item.name,
            Cmd: item.cmd,
            Group: item.group
        });
    }
    
    // 创建菜单
    var menu = new EWA_UI_MenuClass('dynamicMenu');
    menu.Create(menuItems);
    
    // 显示菜单
    menu.ShowByMouse(event, 'main');
});
```

## CSS 类名说明

| CSS 类 | 说明 |
|--------|------|
| ewa_menu_box | 菜单容器 |
| ewa_menu_m | 菜单项 |
| ewa_menu_down | 下拉菜单 |
| ewa-lmenu | 左侧菜单表格 |
| ewa-lmenu-show | 左侧菜单显示 |
| ewa-lmenu-children | 左侧子菜单 |
| ewa_lmenu_bar | 左侧菜单条 |
| ewa_lmenu_bar1 | 左侧菜单条 1 |
| ewa-metro-menu | Metro 菜单容器 |
| ewa_menu_m0 | Metro 菜单图标 |
| pop_title | Metro 菜单标题提示 |

## 注意事项

1. **菜单 ID 唯一性**: 所有菜单项的 ID 必须唯一
2. **父子关系**: 子菜单通过 `EWA_MF_PID` 属性关联父菜单
3. **命令执行**: 菜单命令通过 `EWA_CMD` 属性定义，支持 JavaScript 代码
4. **菜单组**: 右键菜单通过 `Group` 区分不同菜单组
5. **自动隐藏**: 鼠标移出后会自动隐藏菜单（延迟约 1.4 秒）
6. **Metro 风格**: 需要引入 Font Awesome 图标库
7. **内存管理**: 注意清理不再使用的菜单对话框

## 相关文档

- [UI 模块](ui-module.md) - UI 组件总览
- [DialogClass](ui-module.md#对话框组件) - 对话框组件
- [Core 模块](core-module.md) - 核心类库
