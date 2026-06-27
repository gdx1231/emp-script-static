# EWA_App MOBILE APP 使用说明

`EWA_App` 是 EWA 框架的移动端核心库，提供页面切换、滚动、下拉刷新、图片浏览、分享等功能。

---

## 目录

1. [快速入门](#1-快速入门)
2. [配置项说明](#2-配置项说明)
3. [核心方法](#3-核心方法)
4. [页面切换与导航](#4-页面切换与导航)
5. [滚动与加载更多](#5-滚动与加载更多)
6. [图片浏览 (PicsViewer)](#6-图片浏览-picsviewer)
7. [本地存储 (LocalStore)](#7-本地存储-localstore)
8. [自动登录 (EWA_AppAutoLoginClass)](#8-自动登录-ewa_appautologinclass)
9. [工具类](#9-工具类)

---

## 1. 快速入门

### 基本用法

```html
<script src="EWA_STYLE/app2/js/app2.js"></script>
<script src="EWA_STYLE/js/ewa.js"></script>

<script>
// 1. 定义页面配置
var configs = [
  {
    ID: "home",          // section 的 id
    Title: "首页",        // 页面标题
    EWA: false,          // 是否是 EWA 接口
    U: "home.html",       // 非 EWA 时的 URL
    IScroll: true,        // 启用 IScroll 滚动
    PageHeader: true,     // 显示页头
    PageFooter: true,     // 显示页脚
    Refresh: false        // 是否每次进入都刷新
  },
  {
    ID: "list",
    Title: "列表",
    EWA: true,
    X: "mydata/list.xml",   // xmlname
    I: "FRAME.ListFrame",   // itemname
    IScroll: true,
    IScrollMore: true,       // 启用上拉加载更多
    PageHeader: true,
    Refresh: true
  }
];

// 2. 初始化配置
EWA_App.initCfgs(configs);

// 3. 启动 App，指定第一个页面
EWA_App.start("home");
</script>
```

### 环境检测属性

| 属性 | 说明 |
|------|------|
| `EWA_App.IS_IN_WEIXIN` | 是否在微信中 |
| `EWA_App.IS_IN_WEIXIN_MINI` | 是否在微信小程序中 |
| `EWA_App.IS_IN_ANDROID` | 是否在安卓 |
| `EWA_App.IS_IN_IPHONE` | 是否在 iPhone |
| `EWA_App.IS_IN_IPAD` | 是否在 iPad |

---

## 2. 配置项说明

### 基础配置

| 属性 | 类型 | 说明 |
|------|------|------|
| `ID` | String | section 的 DOM id（必填） |
| `Title` | String | 页面标题 |
| `EWA` | Boolean | 是否为 EWA 接口 |
| `X` | String | EWA 的 xmlname（`EWA: true` 时） |
| `I` | String | EWA 的 itemname（`EWA: true` 时） |
| `U` | String | 非 EWA 时的请求 URL |
| `Css` | String | 附加的 CSS class |

### 页面结构配置

| 属性 | 类型 | 说明 |
|------|------|------|
| `PageHeader` | Boolean | 是否显示页头 `<header>` |
| `PageFooter` | Boolean | 是否显示页脚 `<footer>` |
| `ButtonOnFooter` | Boolean | 将 Frame 按钮移到页脚 |
| `Footer` | String | 指定 footer 的来源 section id |

### 滚动配置

| 属性 | 类型 | 说明 |
|------|------|------|
| `IScroll` | Boolean/Function | 是否启用 IScroll 滚动 |
| `IScrollMore` | Boolean | 是否启用上拉加载更多 |
| `IScrollScale` | String | 下拉时关联图片缩放的 CSS 选择器 |

### 数据刷新配置

| 属性 | 类型 | 说明 |
|------|------|------|
| `Refresh` | Boolean | 每次进入是否刷新数据 |
| `RefreshBackAction` | Boolean | 返回时强制刷新（动态设置） |
| `CONTENT_PATH` | String | 指定调用路径，如 `/pf/app-2017` |

### 搜索与排序配置

| 属性 | 类型 | 说明 |
|------|------|------|
| `USE_EWA_LF` | Boolean | 使用 ListFrame 模式 |
| `SHOW_ORDERS` | Boolean | 显示排序头 |
| `SHOW_LF_MENUS` | Boolean | 显示底部弹起菜单 |
| `SHOW_LF_ADD` | Boolean | 显示添加按钮 |
| `RE_SHOW_LF_FILTER` | Boolean | 重绘搜索框 |
| `SHOW_MSG` | Boolean | 显示消息 |
| `AddParas` | Object | 附加请求参数 |

### 回调事件

| 属性 | 类型 | 说明 |
|------|------|------|
| `Installed` | Function | 数据加载完成后执行 |
| `ShowCompleted` | Function | 页面切换动画完成后执行 |
| `RefreshAfter` | Function | IScroll 刷新后执行 |
| `Losted` | Function | 页面隐藏后执行 |
| `backBeforeEvent` | Function | 返回按钮点击前执行 |
| `backAfterEvent` | Function | 返回按钮点击后执行 |
| `noMoreData` | Function | 加载更多时无数据的回调，返回 `false` 则不显示提示 |
| `swap` | String | 切换方式：`"pop"` 从下弹出，`"direct"` 直接切换 |

---

## 3. 核心方法

### `EWA_App.initCfgs(cfgs)`

初始化配置信息。

```javascript
EWA_App.initCfgs([
  { ID: "home", Title: "首页", IScroll: true, ... },
  { ID: "list", Title: "列表", EWA: true, X: "a.xml", I: "B", ... }
]);
```

### `EWA_App.attatchCfgs(tag, cfgs)`

附加额外的配置（用于多模块应用）。

```javascript
EWA_App.attatchCfgs("module2", [
  { ID: "module2_page1", TITLE: "模块2", ... }
]);
// 使用时切换到模块2
EWA_App.changeCfgs("module2");
```

### `EWA_App.changeCfgs(tag)`

切换配置组，默认切换回 `"INIT"` 组。

### `EWA_App.start(firstId)`

启动应用，指定第一个页面 ID。

```javascript
EWA_App.start("home");
```

### `EWA_App.back()`

返回上一页（调用 `window.history.back()`）。

```javascript
EWA_App.back();
```

### `EWA_App.getBodySize()`

获取当前视口尺寸和方向。

```javascript
var size = EWA_App.getBodySize();
console.log(size.width, size.height, size.orientation); // "v" 竖屏 "h" 横屏
```

### `EWA_App.changeBodyHeight(w, h)`

动态调整 body 尺寸，自动判断横竖屏。

---

## 4. 页面切换与导航

### URL 规范

页面通过 URL hash 进行导航：

```
http://example.com/app.html#sectionId?param1=value1&param2=value2
```

### `EWA_App.State.state(title, url, isinit, isReplace)`

手动切换页面状态。

| 参数 | 说明 |
|------|------|
| `title` | 页面标题 |
| `url` | 目标 URL，如 `#page2?name=xxx` |
| `isinit` | 是否初始化（仅改变 URL 不触发切换） |
| `isReplace` | 是否替换当前历史记录 |

```javascript
// 跳转到 list 页面
EWA_App.State.state("列表", "#list?category=1");

// 替换当前页面（不产生历史记录）
EWA_App.State.state("刷新", "#home", false, true);
```

### `EWA_App.handleAClickBefore`

全局钩子，在链接点击前执行自定义逻辑。

```javascript
EWA_App.handleAClickBefore = function(urls, href, title, callback) {
  if (!isLogin()) {
    $Tip("请先登录");
    return;
  }
  callback(); // 继续执行跳转
};
```

### `EWA_App.startAfter`

启动后的回调。

```javascript
EWA_App.startAfter = function() {
  console.log("App 启动完成");
};
```

---

## 5. 滚动与加载更多

### IScroll 配置

在配置中设置：

```javascript
{
  ID: "list",
  IScroll: true,       // 启用 IScroll
  IScrollMore: true,   // 启用上拉加载更多
  Refresh: true        // 进入页面时刷新
}
```

### 下拉刷新

当 `IScrollMore: true` 时，下拉超过 33px 触发刷新。

### 上拉加载更多

当滚动到底部距离 < 247px 时，自动调用 `loadMore()`。

### `EWA_App.Section.reload()`

手动刷新当前页面数据。

```javascript
EWA_App.Section.reload();
```

### `EWA_App.Section.loadMore(isNotShowTip)`

手动加载下一页。

```javascript
EWA_App.Section.loadMore(true); // 不显示提示
```

### `EWA_App.MonitorResize.add(obj, func)`

监听 DOM 尺寸变化，自动刷新 IScroll。

---

## 6. 图片浏览 (PicsViewer)

### `EWA_App.PicsViewer.showPics(urls, showIndex)`

显示图片浏览器。

| 参数 | 说明 |
|------|------|
| `urls` | 图片 URL 数组或单个 URL |
| `showIndex` | 初始显示的图片索引（默认 0） |

```javascript
// 显示单张图片
EWA_App.PicsViewer.showPics("/images/photo.jpg");

// 显示多张图片，从第 3 张开始
EWA_App.PicsViewer.showPics([
  "/images/1.jpg",
  "/images/2.jpg",
  "/images/3.jpg",
  "/images/4.jpg"
], 2);
```

### 手势操作

- **单指左滑** → 下一张
- **单指右滑** → 上一张
- **双指捏合** → 缩放图片
- **双指拖动** → 移动已缩放的图片

### `EWA_App.PicsViewer.showFile(url)`

显示 HTML 文件内容。

```javascript
EWA_App.PicsViewer.showFile("/docs/article.html");
```

### 微信分享

```javascript
// 设置分享内容
EWA_App.PicsViewer.FILE_META = {
  NAME: "分享标题",
  DES: "分享描述",
  URL: "/images/share.jpg",
  ICON: "/images/icon.jpg",
  DOWNLOAD_URL: "/download/123"
};

// 分享给朋友
EWA_App.PicsViewer.re();

// 分享到朋友圈
EWA_App.PicsViewer.timeline();
```

---

## 7. 本地存储 (LocalStore)

基于 `localStorage` 的数据持久化，key 为 `"EX_APP"`。

### 基础操作

```javascript
// 获取 JSON 数据
var data = EWA_App.LocalStore.getJson();

// 保存
EWA_App.LocalStore.save();
```

### 城市选择记录

```javascript
// 添加默认城市（最多保留 10 个）
EWA_App.LocalStore.addDefaultCity("北京", "北京市");

// 获取选择过的城市
var cities = EWA_App.LocalStore.selectCitys();
```

### 认证信息

```javascript
// 保存认证凭证
EWA_App.LocalStore.addRz(userId, code);

// 读取凭证
var rz = EWA_App.LocalStore.loadRz();
// { uid: "xxx", code: "xxx" }

// 删除凭证
EWA_App.LocalStore.removeRz();
```

---

## 8. 自动登录 (EWA_AppAutoLoginClass)

```javascript
var autoLogin = new EWA_AppAutoLoginClass(
  "my_token",                    // localStorage 存储 key
  "/api/auto_login",             // 登录接口 URL
  function(rst) {                // 登录成功回调
    console.log("登录成功", rst);
  },
  function(rst) {                // 登录失败回调
    console.log("登录失败", rst);
    window.location.href = "/login.html";
  }
);

// 执行自动登录
autoLogin.autoLogin(function(rst) {
  if (rst.RST) {
    console.log("已恢复登录状态");
  }
});

// 获取凭证
var code = autoLogin.getCode();

// 手动保存凭证
autoLogin.saveCode("new_token");

// 删除凭证
autoLogin.removeCode();

// 距离上次登录的分钟数
var minutes = autoLogin.getPastMinutes();
```

---

## 9. 工具类

### `EWA_UrlClass` - URL 参数操作

```javascript
var u = new EWA_UrlClass();
u.SetUrl("http://example.com/page?a=1&b=2");

u.AddParameter("c", "3");           // 添加参数
u.RemoveParameter("a");             // 移除参数
var url = u.GetUrl();               // 获取完整 URL
var val = u.GetParameter("B");      // 获取参数值（不区分大小写）
var paras = u.GetParas();           // 获取所有参数字符串
```

### `$X(id)` - 全局元素查找

在当前显示的 section 中查找，找不到再查全局。

```javascript
var obj = $X("myButton");
```

### `$U(islower)` - 获取当前 URL 参数

去除 EWA 参数后返回。

```javascript
var params = $U();       // "a=1&b=2"
var params = $U(true);   // "a=1&b=2" (全部小写)
```

### `EWA_Utils.JsRegisterSrc(src, onlyonce)`

动态加载 JS 文件。

```javascript
EWA_Utils.JsRegisterSrc("/js/module.js", true); // 只加载一次
```

### `EWA_Utils.JsRegister(js)`

执行动态 JS 代码。

```javascript
EWA_Utils.JsRegister("console.log('dynamic code')");
```

### `EWA_FrameShowAlert(obj, errorInfo)`

显示输入框错误提示（移动端优化）。

```javascript
EWA_FrameShowAlert(inputObj, "请输入正确的手机号");
```

### `EWA_FrameRemoveAlert(obj)`

清除输入框错误提示。

```javascript
EWA_FrameRemoveAlert(inputObj);
```

---

## 完整示例

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <title>移动端应用</title>
  <link rel="stylesheet" href="EWA_STYLE/app2/css/app2.css">
</head>
<body>

<!-- 首页 -->
<section id="home">
  <header><h1>首页</h1></header>
  <div class="content">
    <div class="iscroller">
      <a href="#list?cat=1">查看列表</a>
      <a href="#detail?id=100">查看详情</a>
    </div>
  </div>
  <footer>
    <a href="#home" class="ft-item ft-item-cur">首页</a>
    <a href="#list" class="ft-item">列表</a>
    <a href="#my" class="ft-item">我的</a>
  </footer>
</section>

<!-- 列表页 -->
<section id="list" style="display:none">
  <header><h1>列表</h1></header>
  <div class="content"></div>
  <footer>
    <a href="#home" class="ft-item">首页</a>
    <a href="#list" class="ft-item ft-item-cur">列表</a>
    <a href="#my" class="ft-item">我的</a>
  </footer>
</section>

<script src="EWA_STYLE/thrid-party/jquery.min.js"></script>
<script src="EWA_STYLE/thrid-party/iscroll.js"></script>
<script src="EWA_STYLE/js/ewa.js"></script>
<script src="EWA_STYLE/app2/js/app2.js"></script>

<script>
var configs = [
  {
    ID: "home",
    Title: "首页",
    EWA: false,
    U: "home_content.html",
    IScroll: true,
    PageHeader: true,
    PageFooter: true,
    Refresh: false,
    ShowCompleted: function(show) {
      console.log("首页显示完成");
    }
  },
  {
    ID: "list",
    Title: "列表",
    EWA: true,
    X: "mydata/list.xml",
    I: "FRAME.List",
    IScroll: true,
    IScrollMore: true,
    PageHeader: true,
    PageFooter: true,
    Refresh: true,
    Installed: function(show) {
      console.log("列表数据加载完成");
    },
    ShowCompleted: function(show) {
      EWA_App.Section.reShowFilter();
    }
  }
];

EWA_App.initCfgs(configs);
EWA_App.start("home");
</script>
</body>
</html>
```

---

## 注意事项

1. **微信兼容**：在微信中自动隐藏 `PageHeader`，返回时刷新标题
2. **iOS 高度**：每秒检测视口高度变化，兼容微信底部导航栏
3. **横竖屏**：自动检测方向，添加 `landscape` class 到 body
4. **防连击**：所有按钮/链接内置 300ms 防重复点击
5. **返回历史**：基于 `history.pushState`，支持浏览器后退按钮
6. **左滑删除**：ListFrame 中带删除按钮的行支持左滑显示删除
7. **下拉缩放**：通过 `IScrollScale` 配置下拉时图片/标题的缩放效果
