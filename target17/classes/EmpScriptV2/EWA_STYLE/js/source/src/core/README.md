# EWA Core 核心模块

## 目录说明

`core` 目录包含 EWA (Easy Web Application) 框架的核心 JavaScript 类库，提供基础的工具类和功能模块。

## 文件列表

| 文件名 | 说明 |
|--------|------|
| `EWA_00.js` | 核心命名空间和基础工具 |
| `EWA_01AjaxClass.js` | AJAX 通信类 |
| `EWA_02JSONClass.js` | JSON 处理类 |
| `EWA_03DateClass.js` | 日期处理类 |
| `EWA_04XmlClass.js` | XML 处理类 |
| `EWA_05UrlClass.js` | URL 处理类 |
| `EWA_06TransClass.js` | 翻译功能类 |
| `EWA_07ImageClass.js` | 图片处理类 |
| `EWA_08WebSocket.js` | WebSocket 通信类 |
| `EWA_99MqeClass.js` | 消息队列类（已废弃） |

## 核心 API

### EWA 命名空间 (EWA_00.js)

```javascript
// 全局命名空间
window.EWA = {
    VERSION: '1.1.8',
    LANG: 'zhcn',           // 当前语言代码
    SHOW_ERROR: true,       // 是否提示执行错误
    CP: "/",                // EWA 根目录
    B: {}                   // 浏览器类型检测
};

// 工具类
EWA.C = {
    Utils: EWA_Utils,       // 公共工具
    Ajax: EWA_AjaxClass,    // AJAX
    Xml: EWA_XmlClass,      // XML
    Url: EWA_UrlClass       // URL 工具
};
```

### 常用工具函数

```javascript
// DOM 选择器
$X(id)              // 根据 ID 获取元素
$N(name)            // 根据 name 获取元素列表
$T(tagName, obj)    // 根据 tagName 获取元素
$F(sourceObj, findTagName, findAttribute, findValue) // 高级查找

// URL 工具
$U()                // 获取当前页面 URL 参数
$U2(xmlname, itemname, parameters, isAppendUrlParas)  // 构造 EWA URL

// AJAX 请求
$J(url, func)       // 异步获取 JSON
$JA(url, func)      // 同步获取 JSON
$J2(url, func)      // 异步获取 HTML
$JP(url, postData, func) // POST 方式请求 JSON

// 字符串扩展
String.prototype.trimEx()    // 去除全角和半角空格
String.prototype.toURL()     // URL 编码
String.prototype.toMoney()   // 格式化为货币
String.prototype.hashCode()  // 获取字符串哈希

// 数字格式化
Number.prototype.fm(places, symbol, thousand, decimal) // 格式化为货币
```

### EWA_AjaxClass (EWA_01AjaxClass.js)

```javascript
// 创建 AJAX 对象
var ajax = new EWA_AjaxClass(isAsync);

// GET 请求
ajax.Get(url, callback);

// POST 请求
ajax.Post(url, sinfo, callback);
ajax.PostNew(url, callback);  // 使用 Parameters

// 安装模式（直接渲染到指定容器）
ajax.Install(url, parameters, parentId, afterJs, notShowWaitting);

// 常用方法
ajax.AddParameter(name, val, notEncode);  // 添加参数
ajax.GetReturnValue();                     // 获取返回值
ajax.IsRunEnd();                           // 是否执行完毕
ajax.IsError();                            // 是否错误
ajax.GetRst();                             // 获取结果
ajax.HiddenWaitting();                     // 隐藏等待提示
```

### EWA_JSONClass (EWA_02JSONClass.js)

```javascript
// JSON 序列化
var json = new EWA_JSONClass();
var jsonStr = json.ToJSON(obj);

// JSON 解析
var obj = json.Parse(jsonStr);

// 使用原生 JSON（如果浏览器支持）
JSON.stringify(obj);
JSON.parse(jsonStr);
```

### EWA_DateClass (EWA_03DateClass.js)

```javascript
// 创建日期对象
var date = new EWA_DateClass(dateStr);
var date = EWA_Utils.Date(dateStr);

// 日期操作
date.GetYear();           // 获取年
date.GetMonth();          // 获取月
date.GetDay();            // 获取日
date.GetBenYear();        // 获取本年范围 [年初，年末]
date.GetBenMonth();       // 获取本月范围
date.GetBenWeek(isSundayIsFirstDay); // 获取本周范围
date.GetBenQ();           // 获取本季度范围
date.AddDays(days);       // 增加天数
date.GetDateDiff(bDate);  // 计算日期差

// 格式化
date.FormatDate(format);         // 格式化日期
date.GetDateTimeString(format);  // 格式化日期时间
```

### EWA_XmlClass (EWA_04XmlClass.js)

```javascript
// 创建 XML 对象
var xml = new EWA_XmlClass();

// 加载 XML
xml.LoadXmlFile(url);     // 从 URL 加载
xml.LoadXml(strXml);      // 从字符串加载

// 获取节点
xml.GetElement(path, element);       // 获取单个节点
xml.GetElements(path, element);      // 获取节点列表
xml.GetText(path, element);          // 获取节点文本
xml.GetAttributeValue(path, attributeName, element); // 获取属性值

// 创建节点
xml.NewChild(tagName, elementParent);        // 创建子节点
xml.NewChilds(tagNames, elementParent);      // 创建多级子节点
xml.AppendText(text, element);               // 添加文本节点
xml.SetCData(text, element);                 // 添加 CDATA 节点
```

### EWA_UrlClass (EWA_05UrlClass.js)

```javascript
// 创建 URL 对象
var url = new EWA_UrlClass(init_url);

// URL 操作
url.SetUrl(url);                    // 设置 URL
url.GetUrl(islower);                // 获取 URL
url.GetParameter(paraName);         // 获取参数
url.AddParameter(paraName, paraValue, notEncode); // 添加参数
url.RemoveParameter(paraName);      // 移除参数
url.RemoveEwa();                    // 移除所有 EWA 相关参数
url.GetParas(islower);              // 获取所有参数
```

### EWA_TransClass (EWA_06TransClass.js)

```javascript
// 创建翻译对象
var trans = new EWA_TransClass();

// 翻译配置
trans.transProvider = 'azure';  // 翻译引擎：azure, bing, youdao

// 翻译方法
trans.TransToEn(hz, func);      // 中文翻译为英文
trans.TransToCn(english, func); // 英文翻译为中文

// 批量翻译
var translator = new EWA_TanslatorCalss();
translator.transAll(objs_ch, objs_en, transCompleteItemCallBack, transCompleteCallback);
translator.transAllToCn(objs_ch, objs_en, transCompleteItemCallBack, transCompleteCallback);
```

### EWA_ImageCalss (EWA_07ImageClass.js)

```javascript
// 图片缩放
var resizedSrc = EWA_ImageCalss.resize(img, width, height, format, ratio);

// 转换为 Blob
var blob = EWA_ImageCalss.dataURItoBlob(dataURI);

// 缩放为 Blob
var blob = EWA_ImageCalss.resizeAsBlob(img, width, height, format, ratio);
```

### EWA_WebSocketClass (EWA_08WebSocket.js)

```javascript
// 创建 WebSocket 连接
var ws = new EWA_WebSocketClass(wsUrl);

// 初始化
ws.init(cb, debug);

// 发送消息
ws.send(command, cb);

// 注册回调
ws.registerHandleBroadMsg(handleId, func);     // 广播消息
ws.registerOnReconnected(handleId, func);      // 重连回调
ws.registerOnOffline(handleId, func);          // 断线回调

// 取消注册
ws.unRegisterHandleBroadMsg(handleId);
ws.unRegisterOnReconnected(handleId);
ws.unRegisterOnOffline(handleId);
```

## 浏览器检测

```javascript
EWA.B = {
    VERSION: "...",      // 浏览器版本
    SAFAIR: true/false,  // 是否 Safari
    OPERA: true/false,   // 是否 Opera
    IE: true/false,      // 是否 IE
    MOZILLA: true/false, // 是否 Mozilla
    GOOGLE: true/false,  // 是否 Chrome
    PAD: true/false,     // 是否移动设备
    IS_ANDROID: true/false // 是否 Android
};
```

## 依赖关系

```
EWA_00.js (基础)
    ├── EWA_01AjaxClass.js (AJAX)
    ├── EWA_02JSONClass.js (JSON)
    ├── EWA_03DateClass.js (日期)
    ├── EWA_04XmlClass.js (XML)
    ├── EWA_05UrlClass.js (URL)
    ├── EWA_06TransClass.js (翻译)
    ├── EWA_07ImageClass.js (图片)
    ├── EWA_08WebSocket.js (WebSocket)
    └── EWA_99MqeClass.js (消息队列 - 已废弃)
```

## 注意事项

1. **EWA_99MqeClass.js** 已废弃，不再推荐使用
2. 翻译功能需要配置相应的 API Key（Azure/Bing/有道）
3. WebSocket 支持断线重连机制
4. AJAX 类支持同步和异步两种模式
5. 日期格式化支持多种格式：`yyyy-MM-dd`, `MM/dd/yyyy`, `dd/MM/yyyy` 等
