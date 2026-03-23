# EWA UI 用户界面模块

## 目录说明

`ui` 目录包含 EWA 框架的用户界面组件类，提供对话框、菜单、日历、消息提示等丰富的 UI 交互功能。

## 文件列表

| 文件名 | 说明 |
|--------|------|
| `EWA_00UI.js` | UI 基础类和公共方法 |
| `EWA_01UI_ExcelClass.js` | Excel 风格组件 |
| `EWA_01UI_Move.js` | 拖动功能 |
| `EWA_02UI_MenuClass.js` | 菜单组件 |
| `EWA_03UI_TipClass.js` | 提示组件 |
| `EWA_04UI_LinkClass.js` | 链接组件 |
| `EWA_05UI_TabsClass.js` | 标签页组件 |
| `EWA_06UI_DialogClass.js` | 对话框组件 |
| `EWA_06UI_DialogNewClass.js` | 新对话框组件 |
| `EWA_071UI_CalendarYear.js` | 年历组件 |
| `EWA_071UI_CalendarYearGroup.js` | 年历组组件 |
| `EWA_07CalendarClass.js` | 日历组件 |
| `EWA_08UI_MsgClass.js` | 消息组件 |
| `EWA_09UI_FlowChartClass.js` | 流程图组件 |
| `EWA_10UI_HtmlEditor.js` | HTML 编辑器 |
| `EWA_11UI_MapClass.js` | 地图组件 |
| `EWA_12UI_PicViewClass.js` | 图片查看器 |
| `EWA_13UI_H5FrameSet.js` | HTML5 框架集 |
| `EWA_14UI_Dock.js` | 停靠组件 |
| `EWA_15UI_NavBarClass.js` | 导航栏组件 |
| `EWA_50Behavior.js` | 行为定义 |
| `EWA_UI_NewFunc.js` | 新功能扩展 |
| `EWA_UI_SildePuzzle.js` | 滑动拼图 |

## 核心 API

### EWA.UI 命名空间 (EWA_00UI.js)

```javascript
EWA.UI = {
    // 查找滚动父容器
    findScrollParent: function(element) {},
    
    // 计算位置
    Postion: function(obj) {
        return {
            X: x, Left: x,      // 左
            Y: y1, Top: y,      // 上
            Width: width,       // 宽
            Height: height,     // 高
            Right: right,       // 右
            Bottom: bottom      // 底
        };
    }
};
```

### UI 公共方法

```javascript
// 获取鼠标位置
EWA$UI$COMMON.GetMousePosition = function(e) {
    return { X: e.pageX, Y: e.pageY };
};

// 创建对象
EWA$UI$COMMON.CreateObject = function(objWindow, objTag, objStyle, objParent) {
    // 在指定窗口创建 DOM 元素
};

// 设置样式
EWA$UI$COMMON.SetStyle = function(obj, style) {};

// 获取位置
EWA$UI$COMMON.GetPosition = function(obj) {};

// 设置尺寸
EWA$UI$COMMON.SetSize = function(obj, width, height) {};

// 移动到指定位置
EWA$UI$COMMON.MoveTo = function(obj, x, y) {};

// 移动到中心
EWA$UI$COMMON.MoveCenter = function(obj) {};

// 获取对象尺寸
EWA$UI$COMMON.GetObjSize = function(obj) {
    return { H: height, W: width };
};

// 获取窗口尺寸
EWA$UI$COMMON.GetDocSize = function(win) {
    return { W: width, H: height, SH: scrollTop, SW: scrollLeft };
};

// 动画展开
EWA$UI$COMMON.AniExpand = function(obj, expandedWidth, expandedHeight, inc, expandType) {};
EWA$UI$COMMON.AniExpandTo = function(obj, dW, dH, inc, expandType) {};

// 淡入效果
EWA.UI.Utils.FadeIn = function(objIn, objOut, step, timeSpan, afterFunction) {};
```

### 对话框组件 (EWA_06UI_DialogClass.js)

```javascript
// 创建对话框
function EWA_UI_DialogClass() {
    this.zIndex = 999;
    this.Id = null;
    this.Width = "200px";
    this.Height = "200px";
    this.Left = "-1000px";
    this.Top = "-1000px";
    this.Offset = "5";
    this.ShadowColor = "#777777";
    this.IsShowTitle = false;
    this.IsCanMove = true;
    this.IsCover = false;
    this.AutoSize = false;
    this.DisposeOnClose = true;
    
    // 获取对象
    this.GetFrame = function() {};
    this.GetFrameContent = function() {};
    this.GetFrameTitle = function() {};
    
    // 设置内容
    this.SetHtml = function(html) {};
    this.SetObject = function(obj) {};
    this.SetTitle = function(title) {};
    
    // 移动
    this.Move = function(x, y) {};
    this.MoveBottom = function(obj) {};  // 移动到对象下部
    this.MoveCenter = function() {};     // 移动到屏幕中心
    
    // 显示/隐藏
    this.Show = function() {};
    this.Hide = function() {};
    this.Close = function() {};
    
    // 销毁
    this.Dispose = function() {};
}

// 打开对话框
EWA.UI.Dialog.OpenWindow = function(url, title, width, height, isModal, parent, retCmd) {
    // url: 对话框内容 URL
    // title: 标题
    // width, height: 尺寸
    // isModal: 是否模态
    // parent: 父窗口
    // retCmd: 返回命令
};

// 使用示例
var dialog = new EWA_UI_DialogClass();
dialog.Width = "400px";
dialog.Height = "300px";
dialog.SetTitle("标题");
dialog.SetHtml("<div>内容</div>");
dialog.Show();
```

### 菜单组件 (EWA_02UI_MenuClass.js)

```javascript
// 创建菜单
function EWA_UI_MenuClass() {
    // 显示菜单
    this.Show = function(x, y, items) {};
    
    // 隐藏菜单
    this.Hide = function() {};
    
    // 添加菜单项
    this.AddItem = function(text, icon, callback) {};
    
    // 添加分隔符
    this.AddSeparator = function() {};
}

// 使用示例
var menu = new EWA_UI_MenuClass();
menu.AddItem("保存", "save.png", function() {
    console.log("保存");
});
menu.AddSeparator();
menu.AddItem("退出", "exit.png", function() {
    console.log("退出");
});
menu.Show(100, 100);
```

### 提示组件 (EWA_03UI_TipClass.js)

```javascript
// 显示提示
$Tip = function(msg, checkFunc, timeout) {
    // msg: 提示信息
    // checkFunc: 检查函数（返回 true 时关闭提示）
    // timeout: 超时时间（毫秒）
};

// 使用示例
$Tip("正在加载...", function() {
    return loadingComplete; // 当 loadingComplete 为 true 时关闭
}, 5000);

// 简单提示
$Tip("操作成功");
```

### 标签页组件 (EWA_05UI_TabsClass.js)

```javascript
// 创建标签页
function EWA_UI_TabsClass() {
    // 添加标签
    this.AddTab = function(id, title, content) {};
    
    // 移除标签
    this.RemoveTab = function(id) {};
    
    // 激活标签
    this.ActivateTab = function(id) {};
    
    // 获取当前标签
    this.GetActiveTab = function() {};
    
    // 获取所有标签
    this.GetTabs = function() {};
}

// 使用示例
var tabs = new EWA_UI_TabsClass();
tabs.AddTab("tab1", "标签 1", "<div>内容 1</div>");
tabs.AddTab("tab2", "标签 2", "<div>内容 2</div>");
tabs.ActivateTab("tab1");
```

### 日历组件 (EWA_07CalendarClass.js)

```javascript
// 弹出日历
function EWA_UI_Calendar_Pop(obj, havTime) {
    // obj: 输入框元素
    // havTime: 是否包含时间
}

// 使用示例
// <input type="text" id="dateInput" onclick="new EWA.UI.Calendar.Pop(this, false)">
// <input type="text" id="datetimeInput" onclick="new EWA.UI.Calendar.Pop(this, true)">

// 日历配置
EWA.UI.Calendar.Config = {
    firstDayOfWeek: 1,  // 每周第一天 (0=周日，1=周一)
    dateFormat: "yyyy-MM-dd",
    timeFormat: "HH:mm:ss"
};
```

### 年历组件 (EWA_071UI_CalendarYear.js)

```javascript
// 创建年历
function EWA_UI_CalendarYear() {
    // 显示年历
    this.Show = function(year, callback) {};
    
    // 隐藏年历
    this.Hide = function() {};
    
    // 选择年份
    this.SelectYear = function(year) {};
}
```

### 消息组件 (EWA_08UI_MsgClass.js)

```javascript
// 显示消息
$Msg = function(type, msg, callback) {
    // type: success, error, warning, info
    // msg: 消息内容
    // callback: 回调函数
};

// 确认对话框
$Confirm = function(msg, callback) {
    // msg: 确认内容
    // callback: 回调函数 (confirmed: true/false)
};

// 使用示例
$Msg("success", "操作成功");
$Msg("error", "操作失败");

$Confirm("确定要删除吗？", function(confirmed) {
    if (confirmed) {
        // 执行删除
    }
});
```

### 链接组件 (EWA_04UI_LinkClass.js)

```javascript
// 创建链接
function EWA_UI_LinkClass() {
    // 设置链接
    this.SetLink = function(url, text, target) {};
    
    // 获取链接
    this.GetLink = function() {};
    
    // 禁用链接
    this.Disable = function() {};
    
    // 启用链接
    this.Enable = function() {};
}
```

### Excel 风格组件 (EWA_01UI_ExcelClass.js)

```javascript
// Excel 风格表格
function EWA_UI_ExcelClass() {
    // 初始化
    this.Init = function(container, data) {};
    
    // 设置数据
    this.SetData = function(data) {};
    
    // 获取数据
    this.GetData = function() {};
    
    // 设置单元格
    this.SetCell = function(row, col, value) {};
    
    // 获取单元格
    this.GetCell = function(row, col) {};
    
    // 合并单元格
    this.MergeCells = function(row, col, rowspan, colspan) {};
}
```

### 流程图组件 (EWA_09UI_FlowChartClass.js)

```javascript
// 流程图
function EWA_UI_FlowChartClass() {
    // 初始化
    this.Init = function(container) {};
    
    // 添加节点
    this.AddNode = function(id, x, y, text) {};
    
    // 添加连接
    this.AddConnection = function(fromId, toId) {};
    
    // 删除节点
    this.RemoveNode = function(id) {};
    
    // 删除连接
    this.RemoveConnection = function(fromId, toId) {};
    
    // 获取流程图数据
    this.GetData = function() {};
}
```

### HTML 编辑器 (EWA_10UI_HtmlEditor.js)

```javascript
// HTML 编辑器
function EWA_UI_HtmlEditor() {
    // 初始化
    this.Init = function(container) {};
    
    // 设置内容
    this.SetContent = function(html) {};
    
    // 获取内容
    this.GetContent = function() {};
    
    // 执行命令
    this.ExecCommand = function(command, value) {};
    
    // 销毁
    this.Destroy = function() {};
}

// 使用示例
var editor = new EWA_UI_HtmlEditor();
editor.Init(document.getElementById('editor'));
editor.SetContent("<p>Hello World</p>");
var html = editor.GetContent();
```

### 地图组件 (EWA_11UI_MapClass.js)

```javascript
// 地图组件
function EWA_UI_MapClass() {
    // 初始化地图
    this.Init = function(container, options) {};
    
    // 设置中心点
    this.SetCenter = function(lat, lng) {};
    
    // 添加标记
    this.AddMarker = function(lat, lng, title) {};
    
    // 添加信息窗口
    this.AddInfoWindow = function(lat, lng, content) {};
    
    // 清除标记
    this.ClearMarkers = function() {};
}
```

### 图片查看器 (EWA_12UI_PicViewClass.js)

```javascript
// 图片查看器
function EWA_UI_PicViewClass() {
    // 显示图片
    this.Show = function(src, title) {};
    
    // 隐藏图片
    this.Hide = function() {};
    
    // 上一张
    this.Prev = function() {};
    
    // 下一张
    this.Next = function() {};
    
    // 缩放
    this.Zoom = function(level) {};
}

// 使用示例
var picView = new EWA_UI_PicViewClass();
picView.Show("image1.jpg", "图片 1");
picView.Next();
```

### HTML5 框架集 (EWA_13UI_H5FrameSet.js)

```javascript
// HTML5 框架集
function EWA_UI_H5FrameSet() {
    // 初始化
    this.Init = function(config) {};
    
    // 添加框架
    this.AddFrame = function(id, src) {};
    
    // 移除框架
    this.RemoveFrame = function(id) {};
    
    // 调整框架大小
    this.ResizeFrame = function(id, width, height) {};
}
```

### 停靠组件 (EWA_14UI_Dock.js)

```javascript
// 停靠组件
function EWA_UI_Dock() {
    // 初始化
    this.Init = function(container) {};
    
    // 添加停靠项
    this.AddItem = function(id, title, content) {};
    
    // 停靠到指定位置
    this.Dock = function(id, position) {};
    
    // 浮动
    this.Float = function(id) {};
    
    // 关闭
    this.Close = function(id) {};
}
```

### 导航栏组件 (EWA_15UI_NavBarClass.js)

```javascript
// 导航栏
function EWA_UI_NavBarClass() {
    // 初始化
    this.Init = function(container) {};
    
    // 添加导航项
    this.AddItem = function(id, title, url, icon) {};
    
    // 激活导航项
    this.ActivateItem = function(id) {};
    
    // 获取当前导航项
    this.GetActiveItem = function() {};
}
```

### 拖动功能 (EWA_01UI_Move.js)

```javascript
// 鼠标按下
EWA$UI$COMMON$Move.OnMouseDown = function(obj, evt, objMove, isX, isY) {
    // obj: 触发事件的对象
    // evt: 事件对象
    // objMove: 要移动的对象
    // isX, isY: 是否允许 X/Y 方向移动
};

// 鼠标移动
EWA$UI$COMMON$Move.OnMouseMove = function(obj, evt) {};

// 鼠标释放
EWA$UI$COMMON$Move.OnMouseUp = function(obj) {};

// 鼠标移出
EWA$UI$COMMON$Move.OnMouseOut = function(obj) {};

// 使用示例
// <div onmousedown="EWA$UI$COMMON$Move.OnMouseDown(this, event, this)">
//     拖动我
// </div>
```

### 行为定义 (EWA_50Behavior.js)

```javascript
// 行为定义
EWA.Behavior = {
    // 点击行为
    Click: function(obj, action) {},
    
    // 双击行为
    DblClick: function(obj, action) {},
    
    // 悬停行为
    Hover: function(obj, action) {},
    
    // 焦点行为
    Focus: function(obj, action) {},
    
    // 变化行为
    Change: function(obj, action) {}
};
```

### 滑动拼图 (EWA_UI_SildePuzzle.js)

```javascript
// 滑动拼图验证
function EWA_UI_SlidePuzzle() {
    // 初始化
    this.Init = function(container, callback) {};
    
    // 重置
    this.Reset = function() {};
    
    // 验证结果
    this.Verify = function() {};
}

// 使用示例
var puzzle = new EWA_UI_SlidePuzzle();
puzzle.Init(document.getElementById('puzzle'), function(success) {
    if (success) {
        console.log("验证通过");
    } else {
        console.log("验证失败");
    }
});
```

## 使用示例

### 对话框使用

```javascript
// 简单对话框
var dialog = new EWA_UI_DialogClass();
dialog.Width = "400px";
dialog.Height = "300px";
dialog.SetTitle("提示");
dialog.SetHtml("<div>这是一段提示信息</div>");
dialog.IsCanMove = true;
dialog.Show();

// 模态对话框
EWA.UI.Dialog.OpenWindow(
    "/page/form.html",  // URL
    "表单",             // 标题
    600,                // 宽度
    400,                // 高度
    true,               // 模态
    null,               // 父窗口
    null                // 返回命令
);

// 在对象下方显示对话框
dialog.MoveBottom(someElement);
```

### 菜单使用

```javascript
// 右键菜单
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    
    var menu = new EWA_UI_MenuClass();
    menu.AddItem("复制", null, function() {
        document.execCommand('copy');
    });
    menu.AddItem("粘贴", null, function() {
        document.execCommand('paste');
    });
    menu.AddSeparator();
    menu.AddItem("属性", null, function() {
        console.log("属性");
    });
    menu.Show(e.pageX, e.pageY);
});
```

### 提示使用

```javascript
// 简单提示
$Tip("操作成功");

// 带检查的提示
$Tip("正在保存...", function() {
    return saveComplete; // 当保存完成时关闭提示
});

// 带超时的提示
$Tip("加载中...", null, 5000); // 5 秒后自动关闭
```

### 日历使用

```javascript
// HTML 中直接使用
// <input type="text" onclick="new EWA.UI.Calendar.Pop(this, false)">

// 代码中创建
var calendar = new EWA.UI.Calendar.Pop(dateInput, true); // true 表示包含时间
```

### 消息提示

```javascript
// 成功消息
$Msg("success", "保存成功", function() {
    console.log("用户已关闭消息");
});

// 错误消息
$Msg("error", "保存失败，请重试");

// 确认对话框
$Confirm("确定要删除这条记录吗？", function(confirmed) {
    if (confirmed) {
        // 执行删除操作
        deleteRecord();
    }
});
```

### 标签页使用

```javascript
// 创建标签页
var tabs = new EWA_UI_TabsClass();
tabs.Init(document.getElementById('tabsContainer'));

// 添加标签
tabs.AddTab("tab1", "基本信息", "<div>内容 1</div>");
tabs.AddTab("tab2", "详细信息", "<div>内容 2</div>");

// 激活标签
tabs.ActivateTab("tab1");

// 获取当前标签
var activeTab = tabs.GetActiveTab();
```

## 依赖关系

```
EWA_00UI.js (基础)
    ├── EWA_01UI_ExcelClass.js (Excel)
    ├── EWA_01UI_Move.js (拖动)
    ├── EWA_02UI_MenuClass.js (菜单)
    ├── EWA_03UI_TipClass.js (提示)
    ├── EWA_04UI_LinkClass.js (链接)
    ├── EWA_05UI_TabsClass.js (标签页)
    ├── EWA_06UI_DialogClass.js (对话框)
    │   └── EWA_06UI_DialogNewClass.js (新对话框)
    ├── EWA_07CalendarClass.js (日历)
    │   ├── EWA_071UI_CalendarYear.js (年历)
    │   └── EWA_071UI_CalendarYearGroup.js (年历组)
    ├── EWA_08UI_MsgClass.js (消息)
    ├── EWA_09UI_FlowChartClass.js (流程图)
    ├── EWA_10UI_HtmlEditor.js (编辑器)
    ├── EWA_11UI_MapClass.js (地图)
    ├── EWA_12UI_PicViewClass.js (图片查看)
    ├── EWA_13UI_H5FrameSet.js (HTML5 框架集)
    ├── EWA_14UI_Dock.js (停靠)
    ├── EWA_15UI_NavBarClass.js (导航栏)
    ├── EWA_50Behavior.js (行为)
    ├── EWA_UI_NewFunc.js (新功能)
    └── EWA_UI_SildePuzzle.js (滑动拼图)
```

## 注意事项

1. 对话框组件支持模态和非模态两种模式
2. 菜单组件支持右键菜单和下拉菜单
3. 日历组件支持日期和日期时间两种模式
4. 消息组件支持多种类型：success, error, warning, info
5. 所有 UI 组件都支持动态创建和销毁
6. 拖动功能支持限制 X/Y 方向移动
7. 部分组件需要 jQuery 支持

## 相关文档

- [Core 模块](core-module.md) - 核心类库
- [Frames 模块](frames-module.md) - 框架组件
- [Misc 模块](misc-module.md) - 杂项工具
