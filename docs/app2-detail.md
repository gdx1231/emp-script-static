# EWA App2.js 移动端应用框架详解

## 概述

`app2.js` 是 EWA 框架中用于构建移动端 Web 应用的核心库，提供页面管理、场景切换、滚动控制、图片查看、微信集成等功能。

**文件位置**: `source/src/app2/js/app2.js` (4139 行)

**适用场景**:
- 移动 Web 应用
- 微信公众号应用
- 混合式 App (Hybrid App)
- 响应式移动网站

## 核心模块结构

```javascript
var EWA_App = {
    // 配置管理
    CFGS: null,              // 所有配置信息
    CFGS_CURRENT: null,      // 当前配置信息
    
    // 设备检测
    IS_IN_WEIXIN: boolean,   // 是否在微信中
    IS_IN_WEIXIN_MINI: boolean, // 是否在小程序中
    IS_IN_ANDROID: boolean,  // 是否安卓
    IS_IN_IPHONE: boolean,   // 是否 iPhone
    IS_IN_IPAD: boolean,     // 是否 iPad
    
    // 核心模块
    State: __State,          // 状态管理
    Section: __Section,      // 页面管理
    LocalStore: __LocalStore,// 本地存储
    PicsViewer: __PicsViewer,// 图片查看器
    MonitorResize: __MonitorResize, // 尺寸监控
    Ani: __Ani               // 动画效果
};
```

## 详细 API 说明

### 1. 配置管理

#### initCfgs - 初始化配置

```javascript
/**
 * 初始化配置信息
 * @param {Array} cfgs 配置信息列表
 */
EWA_App.initCfgs = function(cfgs) {
    var aa = {};
    for (var n in cfgs) {
        var c = cfgs[n];
        var id = c.ID;
        var c1 = this.convertCfg(c);
        aa[id] = c1;
    }
    this.CFGS = { "INIT": aa };
    this.CFGS_CURRENT = aa;
    __SECTIONS = this.CFGS_CURRENT;
};
```

**使用示例**:
```javascript
// 定义页面配置
var cfgs = [
    {
        ID: 'home',
        Title: '首页',
        U: 'home.html',
        IScroll: true,
        Refresh: true
    },
    {
        ID: 'user',
        Title: '用户中心',
        U: 'user.html',
        IScroll: true
    }
];

// 初始化配置
EWA_App.initCfgs(cfgs);
```

#### attatchCfgs - 附加配置

```javascript
/**
 * 附加配置信息
 * @param {String} tag 附加的标志
 * @param {Array} cfgs 配置信息列表
 */
EWA_App.attatchCfgs = function(tag, cfgs) {
    var aa = {};
    for (var n in cfgs) {
        var c = cfgs[n];
        var id = c.ID;
        var c1 = this.convertCfg(c);
        aa[id] = c1;
        this.CFGS_CURRENT[id] = c1;
    }
    this.CFGS[tag] = aa;
    __SECTIONS = this.CFGS_CURRENT;
};
```

**使用示例**:
```javascript
// 附加模块配置
EWA_App.attatchCfgs('module1', [
    {
        ID: 'list',
        Title: '列表',
        U: 'list.html'
    }
]);
```

#### convertCfg - 转换配置

```javascript
/**
 * 转换配置信息
 * - 布尔值转换 (Y -> true)
 * - JavaScript 函数转换 (字符串 -> Function)
 */
EWA_App.convertCfg = function(config) {
    var map_boolean = {
        IScroll: 1, PageFooter: 1, PageHeader: 1,
        Refresh: 1, ButtonOnFooter: 1, EWA: 1, IScrollMore: 1
    };
    var map_js = {
        Installed: 1, Losted: 1, RefreshAfter: 1, ShowCompleted: 1
    };
    
    var c1 = {};
    for (var m in config) {
        var v = config[m];
        if (v != null && typeof v == "string") {
            v = v.trim();
        }
        if (v) {
            if (map_boolean[m]) {
                c1[m] = (v == 'Y' ? true : false);
            } else if (map_js[m]) {
                try {
                    eval('window.______js=' + v);
                    c1[m] = window.______js;
                    delete window.______js;
                } catch (e) {
                    console.log(e);
                }
            } else {
                c1[m] = v;
            }
        }
    }
    return c1;
};
```

### 2. 设备检测

```javascript
// 设备检测属性
EWA_App.IS_IN_WEIXIN = /micromessenger/ig.test(navigator.userAgent);
EWA_App.IS_IN_WEIXIN_MINI = /miniprogram/ig.test(navigator.userAgent);
EWA_App.IS_IN_ANDROID = /android/ig.test(navigator.userAgent);
EWA_App.IS_IN_IPHONE = /iphone/ig.test(navigator.userAgent);
EWA_App.IS_IN_IPAD = /ipad/ig.test(navigator.userAgent);
```

**使用示例**:
```javascript
// 根据设备类型调整 UI
if (EWA_App.IS_IN_WEIXIN) {
    // 微信中显示分享按钮
    $('.wx-share').show();
}

if (EWA_App.IS_IN_IPHONE) {
    // iPhone 特殊处理
    $('body').addClass('ios');
}
```

### 3. 屏幕方向处理

#### getBodySize - 获取屏幕尺寸

```javascript
/**
 * 获取屏幕尺寸和方向
 * @returns {Object} { width, height, orientation: 'v'|'h' }
 */
EWA_App.getBodySize = function() {
    let vertical = false;
    let domWidth = document.documentElement.clientWidth;
    let domHeight = document.documentElement.clientHeight;
    
    if (screen.orientation) {
        if (screen.orientation.angle === 0 || screen.orientation.angle === 180) {
            vertical = true;
        }
    } else if (this.IS_IN_IPHONE || this.IS_IN_IPAD) {
        if (window.orientation === 180 || window.orientation === 0) {
            vertical = true;
        }
    } else {
        if (window.orientation === 180 || window.orientation === 0) {
            vertical = false;
        } else {
            vertical = true;
        }
    }
    
    if (vertical) {
        return { width: w < h ? w : h, height: w < h ? h : w, orientation: "v" };
    } else {
        return { height: w > h ? h : w, width: w > h ? w : h, orientation: "h" };
    }
};
```

#### changeBodyHeight - 调整窗体

```javascript
/**
 * 改变窗体高度，同时判断是否横屏
 * @param {Number} w 宽度
 * @param {Number} h 高度
 * @param {String} src 来源标记
 */
EWA_App.changeBodyHeight = function(w, h, src) {
    if (!w) {
        let s = this.getBodySize();
        w = s.width;
        h = s.height;
    }
    
    if (EWA_App.DEBUG)
        console.log("changeBodyHeight", w, h, src);
    
    $('body').css('height', h).css('width', w);
    $('section').css('width', w + 'px').attr('aw', w);
    
    if (w > h) {
        $('body').addClass('landscape');
    } else {
        $('body').removeClass('landscape');
    }
};
```

### 4. 应用启动

#### start - 启动应用

```javascript
/**
 * 启动应用
 * @param {String} fristId 第一个页面 id
 */
EWA_App.start = function(fristId) {
    if (!fristId) {
        $Tip('请定义 fristId《第一个页面 id》');
        return;
    }
    
    if (!__SECTIONS[fristId]) {
        alert(' fristId《第一个页面 id》对应配置项不存在__SECTIONS.' + fristId);
        return;
    }
    
    this.FirstId = fristId;
    var c = this;
    
    // 监听方向变化
    window.addEventListener('orientationchange', function(event) {
        setTimeout(function() {
            let s = c.getBodySize();
            EWA_App.changeBodyHeight(s.width, s.height, '延时 1');
        }, 501);
    });
    
    // 监听高度变化
    this._clientHeight = document.documentElement.clientHeight;
    window.setInterval(function() {
        let h = c.getBodySize().height;
        if (c._clientHeight == h) return;
        c._clientHeight = h;
        EWA_App.changeBodyHeight();
    }, 1000);
    
    EWA_App.changeBodyHeight();
    EWA_App.State.init('home');
    EWA_App.State._is_replace = true;
    
    // 处理 URL 参数
    var other_id = "";
    var curlocs = window.location.href.split('#');
    this.ENTRY_URL = curlocs[0];
    
    if (curlocs.length > 1) {
        other_id = curlocs[1];
        if (other_id == this.FirstId) {
            other_id = null;
        }
    }
    
    // 显示第一个页面
    EWA_App.Section.createIScroll(
        $('section#' + this.FirstId)[0],
        __SECTIONS[this.FirstId]
    );
    
    var title = __SECTIONS[this.FirstId].Title;
    EWA_App.State.state(title, curloc + '#' + this.FirstId);
    
    // 跳转到指定页面
    if (other_id) {
        EWA_App.State.state('', curloc + '#' + other_id);
    }
    
    // 启动后回调
    if (EWA_App.startAfter) {
        EWA_App.startAfter();
    }
};
```

**使用示例**:
```javascript
// 启动应用，首页为 home
EWA_App.start('home');

// 启动后回调
EWA_App.startAfter = function() {
    console.log('应用启动完成');
    // 初始化其他组件
};
```

### 5. 状态管理 (__State)

```javascript
var __State = {
    /**
     * 初始化状态
     */
    init: function(homeState) {
        // 初始化首页状态
    },
    
    /**
     * 设置状态
     * @param {String} title 标题
     * @param {String} url URL
     */
    state: function(title, url) {
        // 使用 history.replaceState 或 history.pushState
        if (this._is_replace) {
            history.replaceState({}, title, url);
        } else {
            history.pushState({}, title, url);
        }
        this._is_replace = false;
    }
};
```

**使用示例**:
```javascript
// 设置页面状态
EWA_App.State.state('用户中心', '#user');

// 替换当前状态（不添加历史记录）
EWA_App.State._is_replace = true;
EWA_App.State.state('首页', '#home');
```

### 6. 页面管理 (__Section)

#### createIScroll - 创建滚动

```javascript
/**
 * 创建 iScroll 滚动
 * @param {HTMLElement} section section 元素
 * @param {Object} opt 配置选项
 */
EWA_App.Section.createIScroll = function(section, opt) {
    var content = $(section).find('.content');
    var addDiv = $(section).find('.add-div');
    
    // 创建滚动容器
    opt.myScroll = new IScroll(section, {
        scrollX: false,
        scrollY: true,
        freeScroll: false,
        probeType: 3,
        click: true
    });
    
    // 监听滚动事件
    opt.myScroll.on('scroll', function() {
        if (opt.IScrollMore) {
            // 加载更多逻辑
            if (opt.myScroll.directionY == -1) {
                var dist = (opt.myScroll.y - opt.myScroll.maxScrollY);
                if (dist < 247 && dist > 100) {
                    EWA_App.Section.loadMore(true);
                }
            }
        }
    });
    
    // 监听尺寸变化
    EWA_App.MonitorResize.add(addDiv, function(d, currentTime) {
        if (opt.myScroll) {
            opt.myScroll.refresh();
        }
        if (opt.RefreshAfter) {
            opt.RefreshAfter(opt);
        }
    });
};
```

#### loadMore - 加载更多

```javascript
/**
 * 加载更多数据
 * @param {Boolean} isNotShowTip 是否不显示提示
 */
EWA_App.Section.loadMore = function(isNotShowTip) {
    var id = $(EWA_App.SECTION_SHOW).attr('id');
    var opt = __SECTIONS[id];
    
    if (opt._is_reloadding) {
        return; // 数据加载中
    }
    
    opt._is_reloadding = true;
    opt.loaded = true;
    
    var ewa_obj = opt._ewa_load_more_obj;
    var ewa_id = ewa_obj.attr('id').replace('EWA_LF_', '');
    var ewa = EWA.F.FOS[ewa_id];
    
    if (!ewa) {
        opt._is_reloadding = false;
        return;
    }
    
    ewa._PageCurrent++;
    if (ewa._PageCurrent > ewa._PageCount) {
        if (!isNotShowTip) {
            $Tip('没有更多数据了');
        }
        opt._is_reloadding = false;
        return;
    }
    
    // 执行加载
    ewa.Goto(ewa._PageCurrent);
};
```

#### ajaxLoadedAfter - AJAX 加载完成

```javascript
/**
 * 页面切换后 ajax 数据加载完成事件
 * @param {HTMLElement} hide 隐藏的 section
 * @param {HTMLElement} show 显示的 section
 * @param {Object} opt 配置
 * @param {String} content 加载的内容
 * @param {Boolean} isback 是否是返回
 * @param {Boolean} isloadMore 是否是加载更多
 */
EWA_App.Section.ajaxLoadedAfter = function(hide, show, opt, content, isback, isloadMore) {
    var tb = $(show).find('.EWA_TABLE');
    var ewas = this.getEWAS(); // 获取所有的 ewa
    
    // 设置标题
    if (opt.Title) {
        this.setTitle(opt.Title);
    } else if (ewas.length > 0) {
        this.setTitle(ewas[0].Title);
    }
    
    // 处理 EWA 组件
    for (var i = 0; i < ewas.length; i++) {
        var ewa = ewas[i];
        ewa.SECTION_CFG = opt;
        
        if (ewa instanceof EWA_FrameClass) {
            this.frameUIAndEvents(ewa);
        } else if (ewa instanceof EWA_ListFrameClass) {
            this.listFrameUIAndEvents(ewa);
        }
    }
    
    // 创建滚动
    var is_scroll = opt.IScroll instanceof Function ? 
        opt.IScroll(show) : opt.IScroll;
    
    if (is_scroll && !isloadMore) {
        EWA_App.IS_STOP_TOUCH_MOVE = true;
        this.createIScroll(show, opt);
    } else {
        EWA_App.IS_STOP_TOUCH_MOVE = false;
        $('#slider_bar').hide();
        $(show).find('.content').css('overflow', 'auto');
    }
    
    // 美化搜索框
    this.beautfyFilter();
    
    // 重绘 Radio/Checkbox
    this.reShowRadios();
};
```

### 7. UI 美化

#### beautfyFilter - 美化搜索框

```javascript
/**
 * 美化搜索框
 * @param {HTMLElement} ewaLfSearch 搜索框
 */
EWA_App.beautfyFilter = function(ewaLfSearch) {
    var filter;
    if (!ewaLfSearch) {
        var section_id = EWA_App.SECTION_SHOW.id;
        filter = $('section#' + section_id + ' .ewa-lf-search');
    } else {
        filter = $(ewaLfSearch);
    }
    
    if (filter.length == 0 || filter.attr('beautfyFilter')) {
        return;
    }
    
    filter.attr('beautfyFilter', 1);
    
    filter.find('.ewa-lf-search-item').each(function() {
        var title = $(this).find('.ewa-lf-search-item-title');
        title.hide();
        var txt = title.text().replace(":", "");
        var ipts = $(this).find('.ewa-lf-search-item-ctl input');
        
        if (ipts.length > 0) {
            ipts.each(function() {
                // 日期选择转换为原生
                if ($(this).attr('onclick') && 
                    $(this).attr('onclick').indexOf('EWA.UI.Calendar.Pop') >= 0) {
                    $(this).attr('onclick', '').attr('type', 'date');
                }
            });
            ipts.attr('placeholder', txt);
            
            if (ipts.length == 1) {
                $(this).addClass('ewa-app-lf-search-compose');
            }
        } else {
            $(this).find('select').each(function() {
                this.options[0].text = "-- " + txt + " --";
                this.options[0].value = "";
            });
        }
    });
};
```

#### reShowRadio - 重绘 Radio/Checkbox

```javascript
/**
 * 重绘 Radio/Checkbox
 * @param {HTMLElement} obj 输入对象
 */
EWA_App.reShowRadio = function(obj) {
    var r = $(obj);
    if (r.length == 0) return;
    
    if (r.attr('reshowradio')) {
        // 已存在，更新状态
        var a = $('a.ewa-app-radio-box[rid="' + obj.id + '"]');
        if (obj.checked) {
            $(a).find('i').addClass('fa-check');
        } else {
            $(a).find("i").removeClass("fa-check");
        }
        return;
    }
    
    obj = r[0];
    var id = r.attr('id');
    
    if (!id) {
        id = EWA_Utils.tempId('reShowRadio');
        r.attr('id', id);
    }
    
    var nobr = r.parent();
    var label = nobr.find('label[for="' + id + '"]');
    var txt = label.length == 0 ? "" : label.html();
    
    // 创建自定义样式
    var html = '<a class="ewa-app-radio-box" rid="' + id + '">' +
               '<i class="fa"></i>' + txt + '</a>';
    
    nobr.after(html);
    r.hide();
    r.attr('reshowradio', 1);
};
```

### 8. 图片查看器 (__PicsViewer)

```javascript
EWA_App.PicsViewer = {
    IS_IN_IOS_NATIVE_APP: navigator.userAgent.toLowerCase().indexOf('/classroom') > 0,
    IS_IN_WEIXIN: navigator.userAgent.toLowerCase().indexOf('micromessenger') > 0,
    IS_MINIPROGRAM: navigator.userAgent.toLowerCase().indexOf('miniprogram') > 0,
    
    /**
     * 收藏文件
     */
    collect: function() {
        if (!this.FILE_META) {
            alert('没有文件可以收藏');
            return;
        }
        if (this.collectCallback) {
            this.collectCallback(this.FILE_META);
        }
    },
    
    /**
     * 分享到微信朋友圈
     */
    timeline: function() {
        if (!this.FILE_META) {
            alert('没有文件可以分享');
            return;
        }
        this.shareToWeiXin(this.FILE_META, 'timeline');
    },
    
    /**
     * 分享给微信朋友
     */
    re: function() {
        if (!this.FILE_META) {
            alert('没有文件可以转发');
            return;
        }
        this.shareToWeiXin(this.FILE_META, 'session');
    },
    
    /**
     * 分享文件到微信
     */
    shareToWeiXin: function(fileMeta, session) {
        var root = location.protocol + "//" + location.host +
                   (location.port ? ":" + location.port : "");
        var cur_context = window.location.pathname.substring(0,
            location.pathname.lastIndexOf('/')) + "/";
        
        if (this.IS_IN_IOS_NATIVE_APP) {
            // 原生 App 分享
            if (fileMeta.CMD == 'pic') {
                var url = root + fileMeta.URL + '?DOWNLOAD=1';
                this.shareToWxCommand(session, 'pic', null, null, null, url, null);
            } else {
                var url = root + fileMeta.DOWNLOAD_URL;
                var icon = root + fileMeta.ICON;
                this.shareToWxCommand(session, 'link', fileMeta.NAME,
                    fileMeta.DES, url, null, icon);
            }
        } else if (this.IS_IN_WEIXIN) {
            // 微信公众号分享
            this.FILE_META = fileMeta;
            if (session == 'session') {
                this.createWx_onMenuShareAppMessage();
            } else {
                this.createWx_onMenuShareTimeline();
            }
        } else {
            $Tip("只能在微信公众号和 App 下进行操作");
        }
    },
    
    /**
     * 分享到微信命令
     */
    shareToWxCommand: function(session, cmd, title, description, url, dataurl, icon) {
        var t = new Date().getTime();
        var t0 = this.asldfskfsldfksdlfksldkfsldjdfnkvndfkj || 0;
        if (t - t0 < 1000) return; // 防重复
        this.asldfskfsldfksdlfksldkfsldjdfnkvndfkj = t;
        
        var search = [];
        search.push("cmd=" + cmd);
        if (title) search.push("title=" + title.toURL());
        if (description) search.push("description=" + description.toURL());
        if (icon) search.push("icon=" + icon.toURL());
        if (url) search.push("url=" + url.toURL());
        if (dataurl) search.push("dataUrl=" + dataurl.toURL());
        
        var q = search.join("&");
        var u = "gdx://weixinshare/" + session + "?" + q;
        loadNativeURL(u);
    }
};
```

### 9. 动画效果 (__Ani)

```javascript
var __Ani = {
    /**
     * 获取动画 CSS
     * @param {String} swapType 切换类型
     * @returns {Object} CSS 配置
     */
    getCss: function(swapType) {
        if (!swapType) swapType = 'slide';
        
        if (EWA_App.DEBUG) console.log(swapType);
        
        switch (swapType) {
            case 'slide':
                return {
                    INIT: { '-webkit-transform': 'translate3d(100%,0,0)' },
                    INIT_BACK: { '-webkit-transform': 'translate3d(-100%,0,0)' },
                    SHOW: { '-webkit-transform': 'translate3d(0,0,0)' },
                    HIDE: { '-webkit-transform': 'translate3d(-100%,0,0)' },
                    BACK_SHOW: { '-webkit-transform': 'translate3d(0,0,0)' },
                    BACK_HIDE: { '-webkit-transform': 'translate3d(100%,0,0)' }
                };
            case 'pop':
                return {
                    INIT: { '-webkit-transform': 'scale(0.8)', opacity: 0 },
                    SHOW: { '-webkit-transform': 'scale(1)', opacity: 1 },
                    HIDE: { '-webkit-transform': 'scale(1)', opacity: 1 },
                    BACK_HIDE: { '-webkit-transform': 'scale(0.8)', opacity: 0 }
                };
            case 'fade':
                return {
                    INIT: { opacity: 0 },
                    SHOW: { opacity: 1 },
                    HIDE: { opacity: 1 },
                    BACK_HIDE: { opacity: 0 }
                };
            default:
                return {
                    INIT: {}, SHOW: {}, HIDE: {}, BACK_SHOW: {}, BACK_HIDE: {}
                };
        }
    }
};
```

## 使用示例

### 完整应用示例

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
    <title>EWA App</title>
    <link rel="stylesheet" href="app2.css">
</head>
<body>
    <!-- 页面容器 -->
    <section id="home">
        <header>
            <h1>首页</h1>
        </header>
        <div class="content">
            <div class="add-div">
                <!-- 内容区域 -->
                <div id="homeList"></div>
            </div>
        </div>
        <footer>
            <a href="#home" class="ft-item ft-item-cur">首页</a>
            <a href="#user" class="ft-item">我的</a>
        </footer>
    </section>
    
    <section id="user">
        <header>
            <h1>用户中心</h1>
        </header>
        <div class="content">
            <div class="add-div">
                <div id="userForm"></div>
            </div>
        </div>
        <footer>
            <a href="#home" class="ft-item">首页</a>
            <a href="#user" class="ft-item ft-item-cur">我的</a>
        </footer>
    </section>
    
    <script src="app2.js"></script>
    <script>
        // 定义页面配置
        var cfgs = [
            {
                ID: 'home',
                Title: '首页',
                X: 'home/xml',
                I: 'home/list',
                IScroll: 'Y',
                Refresh: 'Y'
            },
            {
                ID: 'user',
                Title: '用户中心',
                X: 'user/xml',
                I: 'user/form',
                IScroll: 'Y'
            }
        ];
        
        // 初始化配置
        EWA_App.initCfgs(cfgs);
        
        // 启动应用
        EWA_App.start('home');
        
        // 启动后回调
        EWA_App.startAfter = function() {
            console.log('应用启动完成');
        };
    </script>
</body>
</html>
```

### 页面切换示例

```javascript
// 跳转到用户页面
EWA_App.State.state('用户中心', '#user');

// 带动画切换
var showCfg = __SECTIONS['user'];
showCfg.swap = 'slide'; // slide, pop, fade

// 返回上一页
EWA_App.back();
```

### 加载更多示例

```javascript
// 配置加载更多
var cfgs = [
    {
        ID: 'news',
        Title: '新闻',
        X: 'news/xml',
        I: 'news/list',
        IScroll: 'Y',
        IScrollMore: 'Y',  // 启用滚动加载更多
        RefreshAfter: function(opt) {
            console.log('刷新完成');
        }
    }
];
```

### 微信分享示例

```javascript
// 配置微信分享
EWA_App.PicsViewer.collectCallback = function(fileMeta) {
    console.log('收藏:', fileMeta);
};

// 分享到朋友圈
EWA_App.PicsViewer.timeline();

// 分享给朋友
EWA_App.PicsViewer.re();
```

## CSS 类名说明

| CSS 类 | 说明 |
|--------|------|
| ewa-app-lf-search-compose | 合并的搜索框 |
| ewa-app-radio-box | 自定义 Radio 样式 |
| ewa-app-radio-checked | 选中的 Radio |
| ft-item | 底部导航项 |
| ft-item-cur | 当前选中的导航项 |
| landscape | 横屏模式 |
| content | 内容区域 |
| add-div | 添加内容区域 |

## 注意事项

1. **配置转换**: 布尔值用 'Y'/'N' 表示，函数用字符串表示
2. **屏幕方向**: 自动监听方向变化并调整布局
3. **滚动优化**: 使用 iScroll 实现流畅滚动
4. **微信兼容**: 特殊处理微信中的标题设置
5. **内存管理**: 注意清理不再使用的滚动实例
6. **性能优化**: 使用 MonitorResize 监控尺寸变化

## 相关文档

- [UI 模块](ui-module.md) - UI 组件
- [Core 模块](core-module.md) - 核心类库
- [Frames 模块](frames-module.md) - 框架组件
