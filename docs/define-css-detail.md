# EWA Define.css 定义器样式详解

## 概述

`define.css` 是 EWA 框架中用于定义器 (Define) 界面的样式文件，主要提供暗色 (dark) 和亮色 (light) 两种主题模式，以及工作流编辑器的特殊样式支持。

**文件位置**: `source/src/EWA_DEFINE/css/define.css` (769 行)

**配套文件**:
- `define.min.css` - 压缩版本
- `css/src/_0dark.css` - 暗色主题源文件
- `css/src/_1light.css` - 亮色主题源文件

## 样式结构

### 1. 暗色主题 (.dark)

```css
/* 基础暗色样式 */
.dark {
    color: #e1e1e1;              /* 浅灰色文字 */
    background-color: #303130;   /* 深灰色背景 */
    scrollbar-color: #aaa rgba(55, 55, 55, 0);
    scrollbar-width: none;
}
```

#### 1.1 工作流编辑器样式

```css
/* 工作流盒子 */
.dark .ewa_wf_box {
    background-color: white;
    color: #000;
    box-shadow: 1px 1px 11px #999;
    border: 0;
}

/* 工作流连接线 */
.dark table[gdx=LINE] img {
    display: block;
    filter: invert(100%);  /* 反色处理 */
}

.dark table[gdx=LINE] td {
    border-color: #fff !important;
}
```

#### 1.2 标签页和头部

```css
/* 标签容器 */
.dark #TABS {
    background-color: #363636;
    box-shadow: 0px 0px 1px #000;
}

/* 头部和标签 */
.dark #header, .dark .ewa_tab {
    background-color: #252525;
    box-shadow: 0 1px 0 0 #353535 inset;
    border-bottom: 1px solid #000000;
    border-top: 1px solid #000000;
}

/* 左侧 XML 树 */
.dark #xmls {
    border-right: 1px solid #000000;
    box-shadow: 0 1px 0 rgba(255, 255, 255, 0.06) inset;
}
```

#### 1.3 弹出菜单和对话框

```css
/* 弹出菜单 */
.dark .ewa_menu_m_mv1 {
    background-color: #303130;
}

/* 弹出主窗口和对话框 */
.dark .EWA_POP_MAIN, .dark .ewa-ui-dialog-box {
    color: #f1f1f1;
    outline: 5px solid #494949;
    -webkit-box-shadow: 0px 3px 15px 0px rgba(0, 0, 0, 0.65);
    -moz-box-shadow: 0px 3px 15px 0px rgba(0, 0, 0, 0.65);
    box-shadow: 0px 3px 15px 0px rgba(0, 0, 0, 0.65);
    background-color: #494949 !important;
    text-shadow: 0px 1px 0px #2c2c2c;
    border-color: transparent;
}

/* 标题栏 */
.dark .EWA_POP_TITLE_L, .dark .EWA_POP_TITLE_R, 
.dark .ewa-ui-dialog-title {
    background-image: none;
    background: #494949;
    text-shadow: none;
    font-size: 14px;
    color: #f1f1f1;
    height: 30px;
    border-bottom: 0;
}

/* 内容区域 */
.dark .EWA_POP_CNT, .dark .ewa-ui-dialog-content {
    background: transparent !important;
}

/* 遮罩层 */
.dark .ewa-ui-dialog-cover {
    background-color: #333;
    filter: alpha(opacity = 30);
    opacity: .3;
}

/* 分隔线 */
.dark .EWA_POP_MAIN hr {
    border: 0;
    border-bottom: 1px solid #00040a;
    height: 1px;
    margin: 0;
    padding: 0;
}
```

#### 1.4 标签页按钮

```css
/* 激活的标签 */
.dark .ewa_tab_act .bg_c, .dark .but1 {
    background: #303130;
    color: #e1e1e1;
    text-shadow: 1px 1px 11px whitesmoke;
}

/* 未激活的标签 */
.dark .ewa_tab_dact .bg_c, .dark .but0 {
    background: #444242;
    color: #bbb;
}
```

#### 1.5 属性面板

```css
/* 特殊标记颜色 */
.dark td[colspan="3"] b {
    color: orange !important;
    font-weight: normal;
}

.dark td[colspan="2"] b {
    color: orchid !important;
    font-weight: normal;
}

/* 属性面板 */
.dark #props {
    border-left: 1px solid #000;
}

.dark #props td {
    background: #363636;
}

/* 标签容器 */
.dark #tabs {
    border-top: 1px solid #000;
    overflow: hidden;
}
```

#### 1.6 表单元素

```css
/* 输入框 */
.dark input[ewa_value], .dark input[type=text], .dark input[type=password] {
    box-shadow: 0 1px 0 rgba(255, 255, 255, 0.1) inset, 0px 1px rgba(255, 255, 255, 0.1);
    border: 1px solid #010910 !important;
    border-radius: 3px !important;
    background: #ccc !important;
    height: 25px;
}

/* 文本域 */
.dark textarea {
    box-shadow: 0 1px 0 rgba(255, 255, 255, 0.1) inset, 0px 1px rgba(255, 255, 255, 0.1);
    border: 1px solid #010910 !important;
    border-radius: 3px !important;
    background: #ccc !important;
    outline-color: #c98309;
    outline-width: 1px;
    outline-style: solid;
}
```

#### 1.7 表格样式

```css
/* 主表格 */
.dark #tbMain td {
    white-space: nowrap;
    background: #363636;
}

.dark #divTbMain {
    background: #363636;
}

.dark #tbMain {
    background: #3d3d3d;
}

/* 表头行 */
.dark #tbMain>tbody>tr:first-child td {
    background: #313131;
    color: #f1f1f1 !important;
}

/* 编辑按钮区 */
.dark #define_edit_set_buts {
    background: #313131;
    border-top: 0 !important;
}
```

#### 1.8 下拉框和按钮

```css
.dark select, .dark input[type=button], .dark button, .dark input[type=submit] {
    box-shadow: 0 1px 0 rgba(255, 255, 255, 0.1) inset, 0px 1px rgba(255, 255, 255, 0.1);
    border: 1px solid #010910 !important;
    border-radius: 3px;
    color: orange;
    text-shadow: 0;
    height: 25px;
    line-height: 25px;
    text-align: center;
    font-weight: normal;
    padding: 0 11px;
    -webkit-font-smoothing: antialiased;
    background-image: -webkit-linear-gradient(top, #323232 0%, #292929 52%, #191919 52%, #2b2b2b 100%);
}

.dark select {
    text-align: left;
}

.dark select option {
    color: #000;
}

/* 悬停效果 */
.dark input[type=button]:hover, .dark button:hover, .dark input[type=submit]:hover {
    box-shadow: 0px 0px 11px #fff inset;
}

.dark select[size] {
    height: auto;
}
```

#### 1.9 列表框架

```css
/* 功能行 */
.dark #trFunc td {
    border-bottom: 1px solid #000 !important;
}

/* 表头 */
.dark .EWA_TD_H {
    background: #313131;
    color: #f1f1f1 !important;
    text-shadow: none;
}

/* 数据单元格 */
.dark .EWA_TD_L, .dark .EWA_TD_M, .dark .EWA_TD_R, .dark .EWA_TD_B,
.dark .EWA_TD_1, .dark .EWA_TD, .dark .STEP td, .dark .EWA_LF_GROUP,
.dark .ewa_redraw_info, .dark .ewa_redraw_ctl, .dark .ewa_msg_box {
    background: #363636;
}

/* 表格滑动浮动颜色 */
.dark .EWA_TD_M.ewa_grid_mover {
    background-color: #fffad8;
    color: #000;
}

/* 表格滑动选中颜色 */
.dark .EWA_TD_M.ewa_grid_down {
    background-color: #e1f6ff;
    color: #000;
}

/* 搜索框 */
.dark .ewa_lf_func, .dark .ewa-lf-search {
    background: #363636;
}

.dark .EWA_TD_HA, .dark .ewa_lf_func_act, .dark .ewa_lf_func_caption {
    color: #f1f1f1;
}
```

#### 1.10 树形展开/折叠图标

```css
/* 展开状态 (TD00A) */
.dark .TD00A {
    background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9...");
    background-position: center;
}

/* 折叠状态 (TD00B) */
.dark .TD00B {
    background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9...");
    background-position: center;
}

/* 无子节点 */
.dark .TD10B, .dark .TD00D, .dark .TD00C {
    background-image: none;
}
```

### 2. 亮色主题 (.light)

```css
/* 基础亮色样式 */
.light {
    color: #222222;
    background-color: #fff;
    scrollbar-color: #aaa rgba(55, 55, 55, 0);
    scrollbar-width: none;
}
```

#### 2.1 标签页和头部

```css
.light #TABS {
    background-color: #f1f1f1;
    box-shadow: 0px 0px 1px #111;
}

.light #header, .light .ewa_tab {
    background-color: #f1f1f1;
    box-shadow: 0 1px 0 0 transparent inset;
    border-bottom: 1px solid #dedede;
    border-top: 0px solid transparent;
}

.light #xmls {
    background-color: #fbfbfb;
    border-right: 1px solid #dedede;
    box-shadow: 0 1px 0 transparent inset;
}
```

#### 2.2 弹出菜单和对话框

```css
.light .ewa_menu_m_mv1 {
    background-color: #fff;
}

.light .EWA_POP_MAIN .ewa_menu_m_mv1 {
    background-color: #63acff;
    color: #fff;
}

.light .EWA_POP_MAIN .ewa_menu_m_mv1 .ewa_menu_m1 {
    color: #fff;
}

.light .EWA_POP_MAIN {
    border: 1px solid #dfdfdf;
    -webkit-box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.09);
    -moz-box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.09);
    box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.09);
    background-color: #ffffff;
    text-shadow: none;
    border-radius: 0 4px 4px 4px;
    line-height: 24px;
}

.light .EWA_POP_TITLE_L, .light .EWA_POP_TITLE_R {
    background-image: none;
    background: #fff;
    text-shadow: none;
    font-size: 14px;
    color: #333;
    height: 30px;
    border-bottom: 0;
}

.light .ewa-ui-dialog-cover {
    background-color: #333;
    filter: alpha(opacity = 30);
    opacity: .3;
}

.light .EWA_POP_MAIN hr {
    border: 0;
    border-bottom: 1px solid #dedede;
    height: 1px;
    margin: 0;
    padding: 0;
}
```

#### 2.3 标签页按钮

```css
.light .ewa_tab_act .bg_c, .light .but1 {
    background: #dedede;
    color: #222;
    text-shadow: 1px 1px 11px whitesmoke;
}

.light .ewa_tab_dact .bg_c, .light .but0 {
    background: #fff;
    color: #4a4a4a;
}
```

#### 2.4 属性面板

```css
.light #props {
    border-left: 1px solid #dadada;
}

.light #props td {
    background: #f1f1f1;
    border-bottom: 1px solid #dadada;
}

.light #tabs {
    border-top: 1px solid #dadada;
    background: #f1f1f1;
}
```

#### 2.5 表单元素

```css
.light input[ewa_value], .light input[type=text] {
    box-shadow: 0 1px 0 rgba(255, 255, 255, 0.1) inset, 0px 1px rgba(255, 255, 255, 0.1);
    border: 1px solid #dadada !important;
    border-radius: 3px !important;
    background: #fff !important;
    height: 25px;
}

.light textarea {
    box-shadow: 0 1px 0 rgba(255, 255, 255, 0.1) inset, 0px 1px rgba(255, 255, 255, 0.1);
    border: 1px solid #dadada !important;
    border-radius: 3px !important;
    background: #fff !important;
}

.light #tbMain td {
    white-space: nowrap;
    background: #f1f1f1;
}

.light #divTbMain {
    background: #f1f1f1;
}

.light #tbMain {
    background: #f1f1f1;
}

.light #tbMain>tbody>tr:first-child td {
    background: #FBFBFB;
    color: #333 !important;
}

.light #define_edit_set_buts {
    background: #FBFBFB;
    border-top: 0 !important;
}
```

#### 2.6 下拉框和按钮

```css
.light select, .light input[type=button], .light button, .light input[type=submit] {
    box-shadow: 0 1px 0 rgba(255, 255, 255, 0.1) inset, 0px 1px rgba(255, 255, 255, 0.1);
    border: 1px solid #dadada !important;
    border-radius: 3px;
    color: #313131;
    text-shadow: none;
    height: 25px;
    font-weight: normal;
    padding: 0 11px;
    -webkit-font-smoothing: antialiased;
    background-image: -webkit-linear-gradient(top, #fff 0%, #f1f1f1 52%, #f2f2f2 52%, #fff 100%);
}

/* 悬停效果 */
.light select:hover, .light input[type=button]:hover, 
.light button:hover, .light input[type=submit]:hover {
    box-shadow: 0px 0px 11px #ccc inset;
}

.light select[size] {
    height: auto;
}
```

#### 2.7 列表框架

```css
.light #trFunc td {
    border-bottom: 1px solid #dadada !important;
}

.light .EWA_TD_H {
    background: #dadada;
    color: #222 !important;
    text-shadow: none;
}

.light .EWA_TD_L, .light .EWA_TD_M, .light .EWA_TD_R, 
.light .EWA_TD_B, .light .EWA_TD, .light .STEP td {
    background: #f1f1f1;
}

/* 表格滑动浮动颜色 */
.light .EWA_TD_M.ewa_grid_mover {
    background-color: #fffad8;
}

/* 表格滑动选中颜色 */
.light .EWA_TD_M.ewa_grid_down {
    background-color: #e1f6ff;
}
```

#### 2.8 树形展开/折叠图标

```css
/* 展开状态 (TD00A) */
.light .TD00A {
    background-image: url("data:image/gif;base64,R0lGODlhCgAKALMIAPPz8+Hh4cTExKKiovLy8tDQ0ICAgHZ2dv///wAAAAAAAAAAAAAAAAAAAAAAAAAAACH/C1hNUCBEYXRhWE1Q...");
    background-position: center;
}

/* 折叠状态 (TD00B) */
.light .TD00B {
    background-image: url("data:image/gif;base64,R0lGODlhCgAKAMQSAH9/f5+fn4GBgfPz8/Hx8eHh4cPDw/T09H5+fqOjo8fHx4CAgM3NzdHR0fLy8t/f33d3d3Z2dv///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH/C1hNUCBEYXRhWE1Q...");
    background-position: center;
}

/* 无子节点 */
.light .TD10B, .light .TD00D, .light .TD00C {
    background-image: none;
}
```

### 3. 通用样式

#### 3.1 布局结构

```css
/* 表格基础 */
tr[ewa_id]>td:first-child {
    width: 10px;
}

input, select {
    box-sizing: border-box;
}

/* 标签容器 */
#TABS {
    height: 30px;
    vertical-align: bottom;
}

/* 不可选择 */
.unselect {
    position: relative;
    -webkit-user-select: none;
    user-select: none;
    -moz-user-select: none;
}
```

#### 3.2 头部和侧边栏

```css
/* 头部 */
#header {
    height: 29px;
    overflow: hidden;
    padding: 0 14px 0 12px;
    margin: 0;
}

/* XML 树侧边栏 */
#xmls {
    position: absolute;
    left: 0;
    top: 30px;
    bottom: 0px;
    width: 200px;
    overflow: auto;
    z-index: 0;
}

#xmls #EWA_FRAME_MAIN {
    margin: 10px;
}

/* 主内容区 */
#tabsmain {
    position: absolute;
    left: 201px;
    top: 30px;
    bottom: 0px;
    right: 0px;
    overflow: hidden;
    z-index: 0;
}

#tabsmain #EWA_FRAME_MAIN {
    margin: 0px;
    height: 100%;
}
```

#### 3.3 分割条

```css
/* 分割条 */
#split {
    position: absolute;
    left: 200px;
    top: 30px;
    bottom: 0px;
    width: 5px;
    cursor: ew-resize;
    z-index: 1;
    background: rgba(111, 111, 111, 0.1);
}

#split:hover {
    background: rgba(111, 111, 111, 0.9);
}

/* 分割条覆盖层 */
#split_cover {
    position: absolute;
    left: 0px;
    top: 0px;
    bottom: 0px;
    right: 0;
    z-index: 4;
    background: transparent;
    display: none;
}
```

#### 3.4 菜单样式

```css
/* 菜单图标 */
.ewa_menu_m0 {
    margin-left: 4px;
    background-size: cover;
    background-position: center;
    margin-right: 1px;
}

/* 菜单项 */
.ewa_menu_m, .ewa_menu_m1, .ewa_menu_m_mv1 {
    padding: 0;
    line-height: 29px;
}

.ewa_menu_table .ewa_menu_m, 
.ewa_menu_table .ewa_menu_m1, 
.ewa_menu_table .ewa_menu_m_mv1 {
    height: 29px;
}

/* 图标灰度处理 */
.ewa_menu_m0 img {
    width: 12px;
    height: 12px;
    margin-right: 4px;
    margin-left: 4px;
    -webkit-filter: grayscale(100%);
    -moz-filter: grayscale(100%);
    -ms-filter: grayscale(100%);
    -o-filter: grayscale(100%);
    filter: grayscale(100%);
}

/* FontAwesome 图标 */
.ewa_menu_m0.fa {
    line-height: 16px;
    font-size: 14px;
    text-align: right;
}

/* 菜单表格 */
table.ewa_menu_table {
    margin-right: 5px;
}

/* 激活状态去除灰度 */
.ewa_menu_m_mv1 .ewa_menu_m0 img {
    -webkit-filter: grayscale(0%);
    -moz-filter: grayscale(0%);
    -ms-filter: grayscale(0%);
    -o-filter: grayscale(0%);
    filter: grayscale(0%);
}
```

#### 3.5 对话框

```css
/* 隐藏默认对话框 */
.ewa-dialog>div {
    display: none;
}

/* 显示弹出主窗口 */
.ewa-dialog>div.EWA_POP_MAIN {
    display: block;
}

/* 隐藏背景元素 */
.bg_l, .bg_r {
    display: none;
}

.bg_c {
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
}
```

#### 3.6 标签页

```css
/* 标签激活状态 */
.ewa_tab_act .bg_c span {
    max-width: 100px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: inline-block;
    float: left;
}

/* 按钮样式 */
.but0, .but1 {
    border-top: 0 !important;
    display: block;
    float: left;
    padding: 0 5px;
    margin-left: 5px;
    line-height: 25px;
    cursor: pointer;
    min-width: 70px;
    text-align: center;
}

.but0:hover {
    color: red !important;
}
```

#### 3.7 属性面板

```css
/* 通用边框 */
table, td, input, select, span, body {
    border: 0;
}

#tabs {
    padding-bottom: 4px;
}

td#props tr, #props table {
    background: transparent;
}

#props {
    width: 278px;
}

/* 等宽字体 */
#props *, #xmls * {
    font-family: monospace;
    white-space: nowrap;
}

/* 树节点 */
.ewa-tree-node {
    table-layout: fixed;
}

#props #aa {
    margin: 0px;
    overflow-x: hidden;
}

#props input[type=button] {
    padding: 0;
}

#props input[ewa_value] {
    width: 100% !important;
}
```

#### 3.8 列表框架功能

```css
/* 功能标题 */
.ewa_lf_func_caption {
    padding: 0px 5px;
    font-size: 14px;
    line-height: 30px;
}

/* 功能按钮 */
.ewa_lf_func_dact, .ewa_lf_func_act {
    padding: 0px 5px;
    font-size: 14px;
    line-height: 30px;
}
```

#### 3.9 滚动条

```css
/* 滚动条整体 */
::-webkit-scrollbar {
    width: 8px;
    height: 10px;
}

/* 滑轨背景 */
::-webkit-scrollbar-track {
    background-color: transparent;
}

/* 滑块 */
::-webkit-scrollbar-thumb {
    background-color: rgba(77, 77, 77, 0.4);
    border: 1px solid #afafaf;
    border-radius: 5px;
}

/* 滑轨两头的监听按钮 */
::-webkit-scrollbar-button {
    /* 空白 */
}

/* 横向和纵向滚动条相交处 */
::-webkit-scrollbar-corner {
    background-color: rgba(77, 77, 77, 0.4);
}
```

#### 3.10 调试

```css
/* 隐藏调试面板 */
#__EWA_DEBUG {
    display: none;
}
```

## 使用示例

### 切换主题

```javascript
// 切换到暗色主题
$('body').removeClass('light').addClass('dark');

// 切换到亮色主题
$('body').removeClass('dark').addClass('light');
```

### 工作流编辑器

```html
<!-- 工作流单元 -->
<table class="ewa_wf_box" id="node1">
    <tr>
        <td align="center">
            <img class="ewa_wf_unit_img" src="transparent.png">
            <div></div>
        </td>
    </tr>
    <tr>
        <td align="center">
            <span>业务元 1</span>
        </td>
    </tr>
</table>

<!-- 工作流连接线 -->
<table gdx="LINE">
    <tr>
        <td style="font-size:1px;width:50%" valign="top">&nbsp;</td>
        <td style="font-size:1px" valign="top">&nbsp;</td>
    </tr>
    <tr>
        <td style="font-size:1px" valign="bottom">&nbsp;</td>
        <td style="font-size:1px" valign="bottom">&nbsp;</td>
    </tr>
</table>
```

## CSS 类名总览

| CSS 类 | 说明 |
|--------|------|
| dark | 暗色主题 |
| light | 亮色主题 |
| ewa_wf_box | 工作流单元盒子 |
| ewa_wf_unit_img | 工作流单元图标 |
| TD00A | 树节点展开图标 |
| TD00B | 树节点折叠图标 |
| TD00C/TD00D | 无子节点图标 |
| TD10B | 交叉线图标 |
| EWA_POP_MAIN | 弹出主窗口 |
| EWA_POP_TITLE_L/R | 弹出窗口标题 |
| ewa-ui-dialog-box | 对话框盒子 |
| ewa_menu_m | 菜单项 |
| ewa_menu_m0 | 菜单图标 |
| ewa_menu_m_mv1 | 激活的菜单项 |
| ewa_tab_act | 激活的标签 |
| ewa_tab_dact | 未激活的标签 |
| but0/but1 | 按钮 |
| #props | 属性面板 |
| #xmls | XML 树侧边栏 |
| #tabs | 标签容器 |
| #split | 分割条 |
| ewa_grid_mover | 表格滑动浮动 |
| ewa_grid_down | 表格滑动选中 |

## 注意事项

1. **主题切换**: 通过给 body 添加 dark/light 类来切换主题
2. **工作流样式**: 工作流编辑器有特殊的反色处理
3. **图标灰度**: 菜单图标默认灰度，激活后恢复彩色
4. **滚动条**: 自定义了 Webkit 滚动条样式
5. **等宽字体**: 属性面板使用等宽字体便于对齐

## 相关文档

- [FrameTree 详解](frametree-detail.md) - 树形框架
- [UI 模块](ui-module.md) - UI 组件
- [App.css](app-css-detail.md) - 移动端样式
