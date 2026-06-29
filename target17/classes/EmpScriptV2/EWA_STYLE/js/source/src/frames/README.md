# EWA Frames 框架模块

## 目录说明

`frames` 目录包含 EWA 框架的核心业务框架类，用于处理业务表单、列表、树形结构等复杂 UI 组件的渲染和交互。

## 文件列表

| 文件名 | 说明 |
|--------|------|
| `EWA_00FrameCommonClass.js` | 框架公共类 |
| `EWA_01FrameCommonItems.js` | 框架公共条目 |
| `EWA_02FrameResoures.js` | 框架资源管理 |
| `EWA_03FrameClass.js` | 主框架类 |
| `EWA_03FrameItemClass.js` | 框架条目类 |
| `EWA_03FrameMapToClass.js` | 框架映射类 |
| `EWA_04FrameListClass.js` | 列表框架类 |
| `EWA_04FrameListFrameResources.js` | 列表框架资源 |
| `EWA_05FrameListFrame_CellResizeClass.js` | 列表单元格调整大小 |
| `EWA_05FrameListFrame_ShowHideColumnsClass.js` | 列表列显示隐藏 |
| `EWA_06FrameMultiClass.js` | 多记录框架类 |
| `EWA_07FrameTreeClass.js` | 树形框架类 |
| `EWA_30Html5UploadClass.js` | HTML5 上传类 |
| `EWA_31Html5TakePhotoClass.js` | HTML5 拍照类 |
| `EWA_50UI_BoxClass.js` | UI 盒子类 |
| `EWA_51UI_LeftClass.js` | UI 左侧菜单类 |
| `EWA_52UI_ComplexClass.js` | UI 复杂组件类 |
| `EWA_53UI_ADListClass.js` | UI 自适应列表类 |
| `EWA_99CombineClass.js` | 组合类 |

## 核心 API

### EWA.F 命名空间

```javascript
EWA.F = {
    FOS: {},              // Frame 对象集合
    GetFOSOne: function() // 获取第一个对象
    getSubEwas: function(parent) // 获取父对象下的所有 EWA
    
    // 安装方法
    Install: function(parentId, xmlName, itemName, parameters, afterJs)
    InstallHtml: function(parentId, html, afterJs)
    
    // 工具方法
    replaceXmlName: function(refXmlFullPath, newOnlyXmlName)
    
    // 命令类
    Cmd: function() {
        this.EWA_ACTION = null;
        this.EWA_AJAX = "1";
        this.EWA_NO_CONTENT = "1";
        // ... 树形相关属性
    }
};
```

### Frame 对象集合管理

```javascript
// 获取所有 Frame 对象
EWA.F.FOS = {};

// 获取第一个对象
var firstFrame = EWA.F.GetFOSOne();

// 获取父容器下的所有 EWA 实例
var ewas = EWA.F.getSubEwas(parent);

// 注册 Frame 对象
EWA.F.FOS[frameUnid] = frameInstance;
```

### 安装 Frame

```javascript
// 通过 XML 配置安装 Frame
EWA.F.Install(parentId, xmlName, itemName, parameters, afterJs);

// 直接安装 HTML
EWA.F.InstallHtml(parentId, html, afterJs);

// 示例
EWA.F.Install('container', 'user/xml', 'user/list', 'userId=123', function() {
    console.log('Frame 安装完成');
});
```

### EWA_FrameClass (EWA_03FrameClass.js)

```javascript
// Frame 类主要属性和方法
function EWA_FrameClass() {
    this.Xml = null;                          // XML 配置
    this.ItemList = new EWA_FrameCommonItems(); // 条目列表
    this.Resources = {};                      // 资源
    this.Url = null;                          // 请求 URL
    this._Id = null;                          // Frame ID
    
    // 验证回调
    this._ValidExOk = null;    // 验证成功
    this._ValidExFail = null;  // 验证失败
    this._ValidExObj = null;   // 验证对象
    
    // POST 后回调
    this.doPostAfter = null;   // POST 完成后的回调
    this.isShowPostWaitting = true; // 是否显示提交等待框
    
    // 获取对象
    this.getObj = function(exp) {
        var tb = $('#EWA_FRAME_' + this._Id);
        if (exp) {
            return tb.find(exp);
        } else {
            return tb;
        }
    };
    
    // 设置为禁止修改状态
    this.setDisable = function() {
        // 禁用所有输入元素
    };
    
    // 开关按钮动作
    this.switchButtonAction = function(source, actionName) {
        // 处理开关变化并提交到后台
    };
    
    // Textarea 自动调整高度
    this.textareaAutoSize = function() {
        if (window.autosize) {
            autosize(this.getObj('textarea'));
        }
    };
}
```

### 动态下拉框 (DropList)

```javascript
// 创建动态下拉框
EWA.F.I.DropList = function(obj) {
    // obj: SELECT 元素
    // 功能：选择和修改输入内容
};

// 使用示例
// <select id="mySelect" onchange="EWA.F.I.DropList(this)">
//     <option>选项 1</option>
// </select>
```

### 动态日期选择器 (Date)

```javascript
// 创建日期选择器
EWA.F.I.Date = function(obj, havTime) {
    // obj: INPUT 元素
    // havTime: 是否包含时间
};

// 使用示例
// <input type="text" id="dateInput" onclick="EWA.F.I.Date(this, false)">
// <input type="text" id="datetimeInput" onclick="EWA.F.I.Date(this, true)">
```

### 文件上传

```javascript
// 文件上传
EWA.F.U.Upload = function(xmlName, itemName, fromItem) {
    // xmlName: 来源配置文件
    // itemName: 来源配置项
    // fromItem: 来源条目
};

// 使用示例
EWA.F.U.Upload('user/xml', 'user/upload', document.getElementById('fileInput'));
```

### 列表框架 (EWA_04FrameListClass.js)

列表框架用于展示和管理数据列表，支持以下功能：

- 单元格调整大小 (`EWA_05FrameListFrame_CellResizeClass.js`)
- 列显示/隐藏 (`EWA_05FrameListFrame_ShowHideColumnsClass.js`)
- 资源管理 (`EWA_04FrameListFrameResources.js`)

```javascript
// 列表框架功能
function EWA_FrameListClass() {
    // 调整列宽
    this.resizeColumn = function(columnIndex, width) {};
    
    // 显示/隐藏列
    this.showColumn = function(columnIndex, show) {};
    this.hideColumn = function(columnIndex) {};
    
    // 获取/设置数据
    this.getData = function(rowIndex, columnIndex) {};
    this.setData = function(rowIndex, columnIndex, value) {};
}
```

### 树形框架 (EWA_07FrameTreeClass.js)

树形框架用于展示树形结构数据：

```javascript
// 树形框架功能
function EWA_FrameTreeClass() {
    // 展开/折叠节点
    this.expandNode = function(nodeId) {};
    this.collapseNode = function(nodeId) {};
    this.toggleNode = function(nodeId) {};
    
    // 获取选中节点
    this.getSelectedNode = function() {};
    
    // 加载子节点
    this.loadChildNodes = function(parentId) {};
}
```

### HTML5 上传 (EWA_30Html5UploadClass.js)

```javascript
// HTML5 文件上传
function EWA_Html5UploadClass() {
    // 选择文件
    this.selectFile = function(acceptTypes) {};
    
    // 上传文件
    this.upload = function(file, url, progressCallback, completeCallback) {};
    
    // 取消上传
    this.cancel = function() {};
}
```

### HTML5 拍照 (EWA_31Html5TakePhotoClass.js)

```javascript
// HTML5 拍照功能
function EWA_Html5TakePhotoClass() {
    // 打开摄像头
    this.openCamera = function(videoElement, callback) {};
    
    // 拍照
    this.takePhoto = function(canvasElement) {};
    
    // 关闭摄像头
    this.closeCamera = function() {};
}
```

### UI 组件类

#### Box 类 (EWA_50UI_BoxClass.js)

```javascript
// Box 组件 - 用于布局容器
function EWA_UI_BoxClass() {
    // 展开/折叠
    this.expand = function() {};
    this.collapse = function() {};
    
    // 最大化/还原
    this.maximize = function() {};
    this.restore = function() {};
}
```

#### 左侧菜单类 (EWA_51UI_LeftClass.js)

```javascript
// 左侧菜单组件
function EWA_UI_LeftClass() {
    // 展开/收起菜单
    this.toggle = function() {};
    this.expand = function() {};
    this.collapse = function() {};
    
    // 选中菜单项
    this.selectItem = function(itemId) {};
}
```

#### 复杂组件类 (EWA_52UI_ComplexClass.js)

```javascript
// 复杂组件 - 组合多个 UI 元素
function EWA_UI_ComplexClass() {
    // 初始化组件
    this.init = function(config) {};
    
    // 刷新组件
    this.refresh = function() {};
    
    // 销毁组件
    this.destroy = function() {};
}
```

#### 自适应列表类 (EWA_53UI_ADListClass.js)

```javascript
// 自适应列表 - 根据容器大小自动调整
function EWA_UI_ADListClass() {
    // 重新计算布局
    this.relayout = function() {};
    
    // 获取/设置数据
    this.getData = function() {};
    this.setData = function(data) {};
}
```

## Frame 状态保存

```javascript
// 保存 Frame 状态
EWA.F.ST.SaveStatus = function(id, frameTag) {
    // 保存当前 Frame 的状态到服务器
};

// 获取 Frame 状态
EWA.F.ST.GetStatus = function(frameTag, frameClass) {
    // 从服务器获取 Frame 状态并恢复
};

// 使用示例
EWA.F.ST.SaveStatus('frame1', 'FRAME');
EWA.F.ST.GetStatus('FRAME', myFrameClass);
```

## 依赖关系

```
EWA_00FrameCommonClass.js (基础)
    ├── EWA_01FrameCommonItems.js (公共条目)
    ├── EWA_02FrameResoures.js (资源)
    ├── EWA_03FrameClass.js (主框架)
    │   ├── EWA_03FrameItemClass.js (条目)
    │   └── EWA_03FrameMapToClass.js (映射)
    ├── EWA_04FrameListClass.js (列表)
    │   ├── EWA_04FrameListFrameResources.js
    │   ├── EWA_05FrameListFrame_CellResizeClass.js
    │   └── EWA_05FrameListFrame_ShowHideColumnsClass.js
    ├── EWA_06FrameMultiClass.js (多记录)
    ├── EWA_07FrameTreeClass.js (树形)
    ├── EWA_30Html5UploadClass.js (上传)
    ├── EWA_31Html5TakePhotoClass.js (拍照)
    ├── EWA_50UI_BoxClass.js (Box UI)
    ├── EWA_51UI_LeftClass.js (左侧菜单)
    ├── EWA_52UI_ComplexClass.js (复杂组件)
    ├── EWA_53UI_ADListClass.js (自适应列表)
    └── EWA_99CombineClass.js (组合)
```

## 使用示例

### 创建 Frame

```javascript
// 方法 1: 通过 XML 配置创建
EWA.F.Install('container', 'user/xml', 'user/form', 'userId=123');

// 方法 2: 直接创建 Frame 实例
var frame = new EWA_FrameClass();
frame._Id = 'myFrame';
frame.getObj().appendTo('#container');
```

### 操作 Frame 数据

```javascript
// 获取 Frame 对象
var frame = EWA.F.FOS['frameId'];

// 设置为只读
frame.setDisable();

// 获取表单数据
var formData = frame.getFormData();

// 提交数据
frame.submit(function(result) {
    console.log('提交完成', result);
});
```

### 列表操作

```javascript
// 获取列表 Frame
var listFrame = EWA.F.FOS['listFrameId'];

// 调整列宽
listFrame.resizeColumn(0, 200);

// 隐藏列
listFrame.hideColumn(2);

// 获取选中行数据
var selectedData = listFrame.getSelectedData();
```

### 树形操作

```javascript
// 获取树形 Frame
var treeFrame = EWA.F.FOS['treeFrameId'];

// 展开节点
treeFrame.expandNode('node1');

// 获取选中节点
var selectedNode = treeFrame.getSelectedNode();

// 加载子节点
treeFrame.loadChildNodes('parentNodeId');
```

## 注意事项

1. Frame 对象通过 `EWA.F.FOS` 进行全局管理
2. 使用 `setDisable()` 可以将表单设置为只读状态
3. 列表和树形组件支持状态保存和恢复
4. HTML5 上传和拍照功能需要浏览器支持相应 API
5. UI 组件类需要配合相应的 CSS 样式使用
