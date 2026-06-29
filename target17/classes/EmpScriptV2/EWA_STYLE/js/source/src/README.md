# EWA JavaScript 源代码结构说明

## 目录结构

```
source/src/
├── core/           # 核心类库
├── frames/         # 框架组件
├── misc/           # 杂项工具
├── ui/             # UI 组件
└── tmp.js          # 临时文件 (翻译引擎配置)
```

## 模块概述

### 1. Core 核心模块

**位置**: `source/src/core/`

核心模块包含 EWA 框架的基础类库，提供 AJAX、JSON、XML、URL、日期、翻译、图片处理、WebSocket 等基础功能。

**文件数量**: 10 个

**主要功能**:
- `EWA_00.js` - 核心命名空间和基础工具
- `EWA_01AjaxClass.js` - AJAX 通信
- `EWA_02JSONClass.js` - JSON 处理
- `EWA_03DateClass.js` - 日期处理
- `EWA_04XmlClass.js` - XML 处理
- `EWA_05UrlClass.js` - URL 处理
- `EWA_06TransClass.js` - 翻译功能
- `EWA_07ImageClass.js` - 图片处理
- `EWA_08WebSocket.js` - WebSocket 通信
- `EWA_99MqeClass.js` - 消息队列（已废弃）

**详细文档**: [core/README.md](core/README.md)

### 2. Frames 框架模块

**位置**: `source/src/frames/`

框架模块包含 EWA 的业务框架类，用于处理业务表单、列表、树形结构等复杂 UI 组件的渲染和交互。

**文件数量**: 19 个

**主要功能**:
- `EWA_00FrameCommonClass.js` - 框架公共类
- `EWA_03FrameClass.js` - 主框架类
- `EWA_04FrameListClass.js` - 列表框架
- `EWA_07FrameTreeClass.js` - 树形框架
- `EWA_30Html5UploadClass.js` - HTML5 上传
- `EWA_31Html5TakePhotoClass.js` - HTML5 拍照
- `EWA_50UI_BoxClass.js` - UI 盒子组件
- `EWA_51UI_LeftClass.js` - UI 左侧菜单
- `EWA_52UI_ComplexClass.js` - UI 复杂组件
- `EWA_53UI_ADListClass.js` - UI 自适应列表

**详细文档**: [frames/README.md](frames/README.md)

### 3. Misc 杂项模块

**位置**: `source/src/misc/`

杂项模块包含辅助工具和特殊功能，如中文数字转换、HTML 遍历、工作流可视化等。

**文件数量**: 6 个

**主要功能**:
- `EWA_ChineseToNumber.js` - 中文数字转换器
- `EWA_MiscPasteTool.js` - 粘贴板工具
- `EWA_UT_TRANS.js` - 翻译工具（已迁移到 core）
- `EWA_WF.js` - 工作流定义和可视化
- `html_walker.js` - HTML 遍历器
- `html_walker_odt.js` - ODT 文档遍历器

**详细文档**: [misc/README.md](misc/README.md)

### 4. UI 用户界面模块

**位置**: `source/src/ui/`

UI 模块包含丰富的用户界面组件，提供对话框、菜单、日历、消息提示等交互功能。

**文件数量**: 23 个

**主要功能**:
- `EWA_00UI.js` - UI 基础类和公共方法
- `EWA_06UI_DialogClass.js` - 对话框组件
- `EWA_02UI_MenuClass.js` - 菜单组件
- `EWA_03UI_TipClass.js` - 提示组件
- `EWA_05UI_TabsClass.js` - 标签页组件
- `EWA_07CalendarClass.js` - 日历组件
- `EWA_08UI_MsgClass.js` - 消息组件
- `EWA_10UI_HtmlEditor.js` - HTML 编辑器
- `EWA_12UI_PicViewClass.js` - 图片查看器
- `EWA_15UI_NavBarClass.js` - 导航栏组件

**详细文档**: [ui/README.md](ui/README.md)

## 文件汇总

| 目录 | 文件数量 | 说明 |
|------|----------|------|
| core | 10 | 核心类库 |
| frames | 19 | 框架组件 |
| misc | 6 | 杂项工具 |
| ui | 23 | UI 组件 |
| tmp.js | 1 | 翻译引擎配置（临时文件） |
| **总计** | **59** | **含 tmp.js** |

### tmp.js 说明

`tmp.js` 是一个临时文件，包含翻译引擎的提供程序配置。主要内容：

- **EWA_Tanslator_Providers**: 翻译服务提供者配置
  - BING: 微软必应翻译 API 配置
  - 包含 API Key、请求 URL 和回调处理

该文件在构建过程中可能会被其他文件引用或替代。

## 依赖关系

```
EWA.js (主入口)
    ├── core/ (核心依赖)
    │   ├── EWA_00.js
    │   ├── EWA_01AjaxClass.js
    │   ├── EWA_02JSONClass.js
    │   ├── EWA_03DateClass.js
    │   ├── EWA_04XmlClass.js
    │   ├── EWA_05UrlClass.js
    │   ├── EWA_06TransClass.js
    │   ├── EWA_07ImageClass.js
    │   ├── EWA_08WebSocket.js
    │   └── EWA_99MqeClass.js
    │
    ├── ui/ (UI 依赖)
    │   └── EWA_00UI.js
    │
    └── frames/ (框架依赖)
        └── EWA_00FrameCommonClass.js
```

## 构建说明

根据 `compress/js.sh` 脚本，源代码按以下方式合并：

```bash
# 合并核心模块
cat core/*.js > EWA.js

# 合并 UI 模块
cat ui/*.js > EWA_UI.js

# 合并框架模块
cat frames/*.js > EWA_FRAME.js

# 合并杂项模块
cat misc/*.js > EWA_MISC.js

# 合并所有模块
cat EWA.js EWA_UI.js EWA_FRAME.js EWA_MISC.js > EWA_ALL.js

# 使用 Google Closure Compiler 压缩
java -jar compiler.jar --js EWA_ALL.js --js_output_file EWA_ALL.min.js
```

## 全局对象和函数

### 全局命名空间

```javascript
window.EWA = {
    VERSION: '1.1.8',
    LANG: 'zhcn',
    SHOW_ERROR: true,
    CP: "/",                // EWA 根目录
    B: {},                  // 浏览器检测
    C: {},                  // 核心工具
    F: {},                  // 框架
    UI: {},                 // UI 组件
    JSON: {}                // JSON 工具
};
```

### 全局函数

```javascript
// DOM 操作
$X(id)                      // 根据 ID 获取元素
$N(name)                    // 根据 name 获取元素列表
$T(tagName, obj)            // 根据 tagName 获取元素
$F(source, tagName, attr, value) // 高级查找

// URL 操作
$U()                        // 获取 URL 参数
$U2(xmlname, itemname, ...) // 构造 EWA URL

// AJAX 请求
$J(url, func)               // 异步 JSON
$JA(url, func)              // 同步 JSON
$J2(url, func)              // 异步 HTML
$JP(url, postData, func)    // POST JSON

// 安装
$Install(url, pid, func)    // 安装 Frame

// 提示和消息
$Tip(msg, checkFunc)        // 提示
$Msg(type, msg, callback)   // 消息
$Confirm(msg, callback)     // 确认

// 工具
GetUrlParas(isUpper)        // 获取 URL 参数
GetTopWin()                 // 获取顶层窗口
addEvent(obj, name, event)  // 添加事件
```

## 浏览器兼容性

EWA 框架支持多种浏览器：

| 浏览器 | 支持情况 |
|--------|----------|
| Internet Explorer | IE8+ |
| Chrome | 所有版本 |
| Firefox | 所有版本 |
| Safari | 所有版本 |
| Opera | 所有版本 |
| Android | 支持 |
| iPad/iPhone | 支持 |

浏览器检测通过 `EWA.B` 对象实现：

```javascript
EWA.B = {
    IE: true/false,       // 是否 IE
    MOZILLA: true/false,  // 是否 Firefox
    GOOGLE: true/false,   // 是否 Chrome
    SAFAIR: true/false,   // 是否 Safari
    OPERA: true/false,    // 是否 Opera
    PAD: true/false,      // 是否移动设备
    IS_ANDROID: true/false // 是否 Android
};
```

## 编码规范

### 命名约定

- **类名**: 大驼峰命名，如 `EWA_AjaxClass`
- **方法名**: 小驼峰命名，如 `getParameter`
- **常量**: 全大写，如 `EWA_ACTION`
- **私有成员**: 下划线前缀，如 `_InitXmlDoc`

### 注释规范

```javascript
/**
 * 函数说明
 *
 * @param {类型} 参数名 说明
 * @return {类型} 返回值说明
 */
function myFunction(param1, param2) {
    // 实现
}
```

### 文件包含

```javascript
/**
 * @include "EWA.js"
 * @include "EWA_UI.js"
 */
```

## 第三方依赖

| 库 | 用途 | 位置 |
|----|------|------|
| jQuery | DOM 操作 | third-party/jquery/ |
| Bootstrap | UI 样式 | third-party/bootstrap/ |
| Font Awesome | 图标 | third-party/font-awesome/ |
| Ace | 代码编辑器 | third-party/ace/ |
| autosize | Textarea 自动调整 | third-party/autosize-master/ |

## 相关文档

- [Core 模块详细文档](core/README.md)
- [Frames 模块详细文档](frames/README.md)
- [Misc 模块详细文档](misc/README.md)
- [UI 模块详细文档](ui/README.md)

## 版本信息

- **当前版本**: 1.1.8
- **更新日期**: 2026
- **开发者**: gdxsoft (郭磊、靳朝鹏)
- **许可证**: MIT License
- **官方网站**: https://www.gdxsoft.com
- **GitHub**: https://github.com/gdx1231/emp-script-static
