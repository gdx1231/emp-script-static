# EWA App.css 移动端样式详解

## 概述

`app.css` 是 EWA 移动端应用框架的核心样式文件，为移动 Web 应用提供完整的 UI 样式支持，包括页面布局、导航栏、底部菜单、滚动条、图标等组件的样式定义。

**文件位置**: `source/src/app2/css/app.css` (955 行)

**配套文件**:
- `app_ewa.css` (1697 行) - EWA 组件移动端样式
- `app.min.css` - 压缩版本
- `app_ewa.min.css` - 压缩版本

## 样式结构

### 1. 基础样式

```css
/* HTML 和 BODY 基础 */
html {
    height: 100%;
    width: 100%;
}

body {
    min-width: 320px;
    height: 100%;
    margin: 0;
    padding: 0;
    overflow: hidden;
    font-family: Verdana;
    position: relative;
}

/* 链接样式 */
a {
    text-decoration: none;
    color: #000;
}

a:hover {
    color: red;
}

/* 移除点击高亮 */
html, body, a, button, input, textarea {
    -webkit-tap-highlight-color: transparent;
}

/* 标题样式 */
h1 {
    font-size: 24px;
    font-weight: normal;
}

h2 {
    font-size: 18px;
    font-weight: normal;
}
```

### 2. iScroll 滚动条样式

```css
/* section 滚动条的宽度 */
.iScrollVerticalScrollbar {
    width: 4px !important;
}

/* PointerEvent cause iScroll can't work. */
.iscroller {
    touch-action: none;
}
```

### 3. 导航栏按钮

```css
/* 导航栏按钮基础样式 */
.ewa-app-btn {
    display: none;
    position: absolute;
    top: 22px;
    font-size: 35px;
    color: #fff;
    z-index: 200;
    width: 40px;
    font-family: FontAwesome;
    line-height: 38px;
    height: 38px;
}

.ewa-app-btn a {
    display: block;
    left: 0;
    top: 0;
    position: absolute;
    width: 100%;
    height: 100%;
}

/* 返回按钮 */
.ewa-app-btn-back {
    text-align: left;
    padding-left: 10px;
    display: block;
}

.ewa-app-btn-back:before {
    content: "\f104"; /* FontAwesome 左箭头 */
}

/* 小程序上的返回按钮 */
.xcx .ewa-app-btn-back {
    display: none;
}

/* 新增和更多按钮 */
.ewa-app-btn-add, .ewa-app-btn-more {
    text-align: right;
    padding-right: 15px;
    right: 0;
    font-size: 25px;
}

.ewa-app-btn-add:before {
    content: "\f067"; /* FontAwesome 加号 */
}

.ewa-app-btn-more:before {
    content: "\f0c9"; /* FontAwesome 菜单图标 */
}

/* 横屏和安卓调整 */
.landscape .ewa-app-btn {
    top: 5px;
}

.android .ewa-app-btn {
    top: 5px;
}

.landscape .ewa-app-btn-back, .android .ewa-app-btn-back {
    top: 3px;
}

/* 弹出窗体返回按钮 */
section.ewa-app-pop .ewa-app-btn-back {
    top: 3px;
    left: initial;
    right: 0;
    text-align: right;
    padding-right: 5px;
    font-size: 25px;
    display: block;
}

section.ewa-app-pop .ewa-app-btn-back:before {
    content: "\f00d"; /* FontAwesome 关闭图标 */
    background: none;
    box-shadow: none;
}

/* 微信下的按钮样式 */
.wechat .ewa-app-btn:before {
    width: 35px;
    height: 35px;
    line-height: 35px;
    border-radius: 100%;
    background: rgba(196, 179, 238, 0.58);
    box-shadow: 1px 1px 11px #ccc;
    text-align: center;
    padding: 0;
    margin: 0;
    display: block;
}
```

### 4. 头部导航栏

```css
/* 老的导航按钮样式 */
#header_but_back, .header_but_back_fack_home {
    position: absolute;
    left: 10px;
    top: 22px;
    font-size: 35px;
    display: none;
    color: #fff;
    z-index: 2;
    width: 40px;
}

.landscape #header_but_back, .landscape .header_but_back_fack_home,
.android #header_but_back, .android .header_but_back_fack_home {
    top: 3px;
}

/* 添加按钮 */
#header_but_plus, .header-right-func {
    position: absolute;
    right: 10px;
    top: 22px;
    z-index: 2;
    width: 40px;
    text-align: center;
    display: none;
}

.header-right-func {
    color: #fff;
    display: block;
    line-height: 35px;
    text-align: right;
    padding-right: 5px;
}

#header_but_plus a, #header_but_back a {
    font-size: 25px;
    color: #fff;
    display: block;
    line-height: 35px;
}

/* 微信下的导航按钮 */
.wechat #header_but_plus, .wechat #header_but_back,
.wechat .header_but_back_fack_home, .wechat .header-right-func {
    width: 35px;
    height: 35px;
    line-height: 35px;
    border-radius: 100%;
    background: rgba(196, 179, 238, 0.58);
    box-shadow: 1px 1px 11px #ccc;
    text-align: center;
    padding: 0;
    margin: 0;
}
```

### 5. 滚动条

```css
#slider_bar {
    position: fixed;
    right: 2px;
    width: 3px;
    background: rgba(121, 121, 121, 0.9);
    height: 0px;
    top: 0;
    z-index: 199999;
}
```

### 6. Header 头部

```css
header {
    width: 100%;
    height: 60px;
    background-color: #6f5499; /* 紫色 */
    color: #fff;
    text-align: center;
}

.landscape header {
    height: 40px;
}

header h1 {
    margin: 0;
    padding: 0;
    line-height: 60px;
}

.landscape header h1 {
    line-height: 40px;
}

header table {
    margin: 0;
    height: 100%;
    border-spacing: 0;
    width: 100%;
}

header td {
    padding: 0;
}
```

### 7. Section 页面容器

```css
section {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    background-color: #f0f0f0;
    display: none;
    flex-direction: column;
    overflow: hidden;
}

section.ewa-app-pop {
    /* 弹出式页面 */
}

section > div.content {
    flex: 1;
    overflow: hidden;
    position: relative;
    -webkit-overflow-scrolling: touch;
}

section > div.content > div.add-div {
    min-height: 100%;
    padding-bottom: 50px; /* 底部菜单高度 */
    box-sizing: border-box;
}
```

### 8. Footer 底部菜单

```css
footer {
    width: 100%;
    height: 50px;
    background-color: #6f5499;
    border-top: 1px solid #6f5499;
    position: relative;
    z-index: 101;
    box-sizing: border-box;
}

section.ewa-app-pop footer {
    height: 45px;
}

footer table, header table {
    margin: 0;
    height: 100%;
    border-spacing: 0;
    width: 100%;
}

footer td, header td {
    padding: 0;
}

/* 5 列布局 */
footer table.p5 > tbody > tr > td {
    width: 20%;
}

/* 3 列布局 */
footer table.p3 > tbody > tr > td {
    width: 33.3333%;
}

/* 菜单项 */
footer .ft-item {
    color: #fff;
    text-align: center;
    margin: 0;
    padding: 0;
    display: block;
    height: 100%;
    width: 100%;
    position: relative;
}

/* 当前选中的菜单项 */
footer .ft-item-cur:before {
    content: "";
    width: 10px;
    height: 10px;
    display: block;
    background-color: #6f5499;
    position: absolute;
    left: 50%;
    margin-left: -5px;
    top: -5px;
    transform: rotate(45deg);
}

/* 图标 */
footer .fa {
    font-size: 25px;
    margin-top: 7px;
}

/* 文字 */
footer .ft-item-txt {
    font-size: 10px;
    display: block;
    width: 100%;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
}

/* 底部徽章 */
footer .footer-badges {
    color: red;
    display: none;
}

footer .footer-badges:after {
    content: "";
    display: block;
    width: 10px;
    height: 10px;
    background: red;
    border-radius: 50%;
    position: absolute;
    top: 5px;
    right: 10px;
}
```

### 9. 大型添加按钮

```css
/* section 页面里的大型添加按钮 */
.ewa-app-large-add-btn {
    display: block;
    text-align: center;
    line-height: 200px;
    position: absolute;
    left: 0;
    right: 0;
    top: 100px;
    color: green;
    font-size: 20px;
    height: 200px;
    margin-top: 40px;
}

.ewa-app-large-add-btn:before {
    content: "+";
    display: block;
    position: absolute;
    left: 50%;
    top: 0;
    font-size: 30px;
    border-radius: 100%;
    background: darkgreen;
    width: 60px;
    line-height: 60px;
    text-align: center;
    color: #fff;
    margin-left: -30px;
}
```

### 10. 徽章提示

```css
/* 图标上红色提示图标 */
.ewa-app-badges {
    display: block;
    min-width: 18px;
    height: 18px;
    position: absolute;
    background: red;
    right: -9px;
    top: -9px;
    border-radius: 9px;
    padding: 0;
    margin: 0;
    text-align: center;
    overflow: hidden;
    line-height: 18px;
    background-color: red;
    color: #fff;
    font-size: 12px;
    padding-left: 2px;
    padding-right: 2px;
    box-sizing: border-box;
}
```

### 11. 列表相关样式

```css
/* 列表分组 */
tr[ewa_tag='group'] {
    display: block;
    width: 100%;
    margin: 10px 0 0 0;
    clear: both;
}

.EWA_LF_GROUP {
    display: block;
    width: 100%;
    line-height: 40px;
    padding: 18px 20px 5px 20px;
    background-color: #fff;
    box-sizing: border-box;
}

.EWA_LF_GROUP > div {
    position: relative;
    box-sizing: border-box;
    font-size: 19px;
    font-weight: 700;
}

/* 左侧绿色竖线 */
.EWA_LF_GROUP > div::before {
    width: 20px;
    border-left: 4px solid #28cdbc;
    box-sizing: border-box;
    content: "";
    display: block;
    left: 0px;
    position: absolute;
    top: 50%;
    line-height: 20px;
    height: 20px;
    margin-top: -10px;
}

/* 右侧"更多"文字 */
.EWA_LF_GROUP > div::after {
    content: "更多";
    font-size: 14px;
    color: #afafaf;
    text-align: right;
    right: 0px;
    display: block;
    position: absolute;
    top: 50%;
    line-height: 20px;
    height: 20px;
    margin-top: -6px;
}

.enus .EWA_LF_GROUP > div::after {
    content: "more";
}

.EWA_LF_GROUP span {
    margin-left: 9px;
}
```

### 12. 列表排序

```css
/* 列表排序 */
.ewa-app-lf-order {
    box-sizing: border-box;
    display: block;
    padding: 0px;
    float: left;
}

.ewa-app-lf-order a {
    display: block;
    font-size: 12px;
    text-align: center;
    line-height: 30px;
    overflow: hidden;
    text-overflow: ellipsis;
}

/* 排序图标 */
.ewa-app-lf-order a:before {
    font-family: FontAwesome;
    content: "\f0dc"; /* 未排序 */
    color: #ccc;
    margin-right: 1px;
}

.ewa-app-lf-order a.asc:before {
    content: "\f0de"; /* 升序 */
    color: darkorange;
}

.ewa-app-lf-order a.desc:before {
    content: "\f0dd"; /* 降序 */
    color: darkorange;
}
```

### 13. 加载状态

```css
/* 数据加载中 */
section .reloading {
    padding-top: 30px;
}

section .reloading:before {
    content: '数据加载中...';
    position: absolute;
    display: block;
    top: 0;
    line-height: 30px;
    left: 0;
    width: 100%;
    text-align: center;
    font-size: 12px;
}

.enus section .reloading:before {
    content: 'Loading...';
}

/* 加载更多 */
section .loadingmore {
    margin-top: -30px;
}

section .loadingmore:after {
    content: '数据加载中...';
    position: absolute;
    display: block;
    bottom: 0;
    line-height: 30px;
    left: 0;
    width: 100%;
    text-align: center;
    font-size: 12px;
}

.enus section .loadingmore:after {
    content: 'Loading...';
}
```

### 14. 表单元素

```css
/* 移除 iOS 默认样式 */
input[type=button], input[type=submit] {
    -webkit-appearance: none;
    appearance: none;
}

select, input, textarea {
    font-size: inherit;
}

section select, section input {
    -webkit-appearance: none;
    appearance: none;
}

section {
    font-size: 16px;
}
```

### 15. 动画过渡

```css
.duration {
    transition-duration: 0.6s;
}
```

### 16. 图片查看器

```css
#bbs-pic-view-box {
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.9);
    z-index: 9999;
    display: none;
}

#bbs-pic-view-box header {
    position: absolute;
    left: 0;
    top: 0;
    height: 40px;
    width: 100%;
    background: rgba(0, 0, 0, 0.8);
    z-index: 2;
}

#bbs-pic-view-box header h1 {
    line-height: 40px;
    font-size: 18px;
}

#bbs-pic-view-box .content {
    position: absolute;
    left: 0;
    top: 40px;
    bottom: 0;
    width: 100%;
    overflow: hidden;
}

/* 分享按钮 */
#bbs-pic-view-box a.bbs-pic-view-share {
    position: absolute;
    right: 10px;
    top: 10px;
    width: 50px;
    height: 50px;
    line-height: 50px;
    border-radius: 100%;
    background: rgba(78, 177, 197, 0.3);
    text-align: center;
    box-shadow: 0px 0px 11px #999;
}

/* 小程序下隐藏分享 */
.xcx #bbs-pic-view-box a.bbs-pic-view-share {
    display: none;
}

#bbs-pic-view-box1 {
    width: 100%;
    height: 100%;
    overflow: auto;
}

#bbs-pic-view-file {
    width: 100%;
    height: 100%;
}

/* PPT 和图片查看 */
.file-view-ppt img, .oa-doc-view img {
    max-width: 100%;
    max-height: 100%;
    width: auto;
    height: auto;
}

#bbs-pic-view-box .loadingInProgress {
    width: 100%;
    height: 100%;
}

#bbs-pic-view-box .oa-doc-view {
    background: #fff;
    padding: 10px;
}
```

### 17. 微信分享菜单

```css
/* 文件分享到朋友圈 */
a.ewa-app-lf-menu-item.ref-id-timeline:before {
    content: "a";
    display: inline-block;
    width: 32px;
    height: 40px;
    color: transparent;
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    background-image: url(/static/images/share/icon_res_download_moments.png);
}

/* 文件分享给微信朋友 */
a.ewa-app-lf-menu-item.ref-id-session:before {
    content: "a";
    display: inline-block;
    width: 32px;
    height: 40px;
    color: transparent;
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    background-image: url(/static/images/share/icon64_wx_logo.png);
}
```

### 18. 全屏模式 (iPhone X 适配)

```css
/* iPhone X 等全面屏适配 */
.fullscreen .header_but_back_fack_home,
.fullscreen #header_but_back,
.fullscreen #header_but_plus,
.fullscreen .header-right-func,
.fullscreen .ewa-app-btn {
    top: 36px;
}

.fullscreen header {
    height: 74px;
}

.fullscreen header > div {
    padding-top: 30px;
}

.fullscreen header h1 {
    margin-top: 44px;
}

.fullscreen section > div.content {
    bottom: 74px;
    top: 0;
}

.fullscreen footer {
    height: 74px;
    padding-bottom: 24px;
}

.fullscreen section.ewa-app-pop footer {
    height: 70px;
}

.fullscreen .ewa-app-lf-menu.ewa-ddl-box {
    padding-bottom: constant(safe-area-inset-bottom); /* 34px */
}
```

### 19. 设备特定样式

```css
/* 横屏模式 */
.landscape {
    /* 横屏时的调整 */
}

/* 安卓设备 */
.android {
    /* 安卓特定样式 */
}

/* 微信环境 */
.wechat {
    /* 微信特定样式 */
}

/* 小程序环境 */
.xcx {
    /* 小程序特定样式 */
}

/* 英文环境 */
.enus {
    /* 英文特定样式 */
}
```

## 使用示例

### HTML 结构

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
    <title>EWA App</title>
    <link rel="stylesheet" href="app.css">
    <link rel="stylesheet" href="app_ewa.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
</head>
<body class="">
    <!-- 首页 -->
    <section id="home">
        <header>
            <table>
                <tr>
                    <td style="width:50px">
                        <div class="ewa-app-btn ewa-app-btn-back">
                            <a href="javascript:EWA_App.back()"></a>
                        </div>
                    </td>
                    <td>
                        <div>
                            <h1>首页</h1>
                        </div>
                    </td>
                    <td style="width:50px">
                        <div class="ewa-app-btn ewa-app-btn-add">
                            <a href="javascript:add()"></a>
                        </div>
                    </td>
                </tr>
            </table>
        </header>
        
        <div class="content">
            <div class="add-div">
                <!-- 内容区域 -->
                <div id="homeList"></div>
            </div>
        </div>
        
        <footer>
            <table class="p5">
                <tr>
                    <td>
                        <a href="#home" class="ft-item ft-item-cur">
                            <i class="fa fa-home"></i>
                            <span class="ft-item-txt">首页</span>
                        </a>
                    </td>
                    <td>
                        <a href="#news" class="ft-item">
                            <i class="fa fa-newspaper-o"></i>
                            <span class="ft-item-txt">新闻</span>
                        </a>
                    </td>
                    <td>
                        <a href="#user" class="ft-item">
                            <i class="fa fa-user"></i>
                            <span class="ft-item-txt">我的</span>
                        </a>
                    </td>
                </tr>
            </table>
        </footer>
    </section>
</body>
</html>
```

### 自定义 Radio/Checkbox

```html
<!-- 原始 checkbox -->
<input type="checkbox" id="chk1" style="display:none">
<label for="chk1">选项 1</label>

<!-- 重绘后的样式由 JS 自动生成 -->
<!-- <a class="ewa-app-radio-box" rid="chk1"> -->
<!--     <i class="fa"></i>选项 1 -->
<!-- </a> -->
```

### 列表分组

```html
<table class="EWA_TABLE">
    <!-- 分组头 -->
    <tr ewa_tag="group">
        <td class="EWA_LF_GROUP">
            <div>基本信息</div>
        </td>
    </tr>
    <!-- 数据行 -->
    <tr class="ewa-lf-data-row">
        <td>内容 1</td>
    </tr>
</table>
```

## CSS 类名总览

| CSS 类 | 说明 |
|--------|------|
| ewa-app-btn | 导航栏按钮 |
| ewa-app-btn-back | 返回按钮 |
| ewa-app-btn-add | 添加按钮 |
| ewa-app-btn-more | 更多按钮 |
| ewa-app-large-add-btn | 大型添加按钮 |
| ewa-app-badges | 徽章提示 |
| ft-item | 底部菜单项 |
| ft-item-cur | 当前选中的菜单项 |
| ft-item-txt | 菜单项文字 |
| footer-badges | 底部徽章 |
| EWA_LF_GROUP | 列表分组头 |
| ewa-app-lf-order | 列表排序 |
| reloading | 加载中状态 |
| loadingmore | 加载更多状态 |
| landscape | 横屏模式 |
| android | 安卓设备 |
| wechat | 微信环境 |
| xcx | 小程序环境 |
| enus | 英文环境 |
| fullscreen | 全屏模式 (iPhone X) |

## 注意事项

1. **字体图标**: 需要引入 FontAwesome 图标库
2. **滚动优化**: 使用 iScroll 时需要配合特定样式
3. **设备适配**: 针对微信、小程序、iOS、安卓有特殊样式
4. **横屏处理**: 横屏时导航栏高度会调整
5. **全面屏适配**: iPhone X 等全面屏设备使用 fullscreen 类适配

## 相关文档

- [App2 移动端框架](app2-detail.md) - JavaScript 核心库
- [UI 模块](ui-module.md) - UI 组件
- [Core 模块](core-module.md) - 核心类库
