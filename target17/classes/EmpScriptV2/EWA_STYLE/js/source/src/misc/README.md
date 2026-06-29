# EWA Misc 杂项模块

## 目录说明

`misc` 目录包含 EWA 框架的辅助工具和杂项功能类，提供中文数字转换、HTML 遍历、工作流等实用功能。

## 文件列表

| 文件名 | 说明 |
|--------|------|
| `EWA_ChineseToNumber.js` | 中文数字转换器 |
| `EWA_MiscPasteTool.js` | 粘贴板工具 |
| `EWA_UT_TRANS.js` | 翻译工具（已迁移到 core） |
| `EWA_WF.js` | 工作流定义和可视化 |
| `html_walker.js` | HTML 遍历器 |
| `html_walker_odt.js` | ODT 文档 HTML 遍历器 |

## 核心 API

### 中文数字转换器 (EWA_ChineseToNumber.js)

将中文数字（包括大写、小写、阿拉伯数字混合）转换为数值。

```javascript
// 基本用法
EWA_Utils.chineseToNumber("一百二十三");      // 123
EWA_Utils.chineseToNumber("壹佰贰拾叁");      // 123
EWA_Utils.chineseToNumber("123");             // 123
EWA_Utils.chineseToNumber("一千二百三十四");   // 1234
EWA_Utils.chineseToNumber("壹仟贰佰叁拾肆");   // 1234

// 支持小数
EWA_Utils.chineseToNumber("三点一四");         // 3.14
EWA_Utils.chineseToNumber("3.14");            // 3.14

// 支持负数
EWA_Utils.chineseToNumber("负一百");           // -100
EWA_Utils.chineseToNumber("-100");            // -100

// 支持单位
EWA_Utils.chineseToNumber("一万");             // 10000
EWA_Utils.chineseToNumber("1 万");             // 10000
EWA_Utils.chineseToNumber("一百万");           // 1000000
EWA_Utils.chineseToNumber("1M");              // 1000000
EWA_Utils.chineseToNumber("1B");              // 1000000000

// 支持角分厘毫
EWA_Utils.chineseToNumber("三元五角");         // 3.5
EWA_Utils.chineseToNumber("3 元 5 角");         // 3.5
EWA_Utils.chineseToNumber("三元五角二分");      // 3.52

// 支持多种字符形式
EWA_Utils.chineseToNumber("〇一二三");         // 123
EWA_Utils.chineseToNumber("零一二三");         // 123
EWA_Utils.chineseToNumber("123");             // 123
EWA_Utils.chineseToNumber("123");             // 123

// 错误处理
try {
    EWA_Utils.chineseToNumber("非数字");
} catch (e) {
    console.log(e); // "非数字或单位：非"
}
```

#### 支持的数字字符

```javascript
// 数字字符映射
{
    '零': 0, '0': 0, '0': 0, 'o': 0, 'O': 0,
    '一': 1, '壹': 1, '1': 1, '1': 1,
    '二': 2, '贰': 2, '2': 2, '2': 2, '两': 2, '俩': 2,
    '三': 3, '叁': 3, '3': 3, '3': 3,
    '四': 4, '肆': 4, '4': 4, '4': 4,
    '五': 5, '伍': 5, '5': 5, '5': 5,
    '六': 6, '陆': 6, '6': 6, '6': 6,
    '七': 7, '柒': 7, '7': 7, '7': 7,
    '八': 8, '捌': 8, '8': 8, '8': 8,
    '九': 9, '玖': 9, '9': 9, '9': 9
}

// 单位字符映射
{
    '十': 10, '拾': 10, '什': 10,
    '百': 100, '佰': 100, '陌': 100,
    '千': 1000, '阡': 1000, '仟': 1000,
    'k': 1000, 'K': 1000,
    '万': 10000, '萬': 10000, 'w': 10000, 'W': 10000,
    'M': 1000000, 'm': 1000000,
    '亿': 100000000,
    'b': 1000000000, 'B': 1000000000
}
```

### 粘贴板工具 (EWA_MiscPasteTool.js)

提供剪贴板操作功能。

```javascript
// 复制文本到剪贴板
EWA_MiscPasteTool.copyText = function(text) {
    // 使用现代 Clipboard API 或 fallback 方案
};

// 从剪贴板粘贴文本
EWA_MiscPasteTool.pasteText = function(callback) {
    // 读取剪贴板内容并回调
};

// 使用示例
// 复制
EWA_MiscPasteTool.copyText("要复制的文本");

// 粘贴
EWA_MiscPasteTool.pasteText(function(text) {
    console.log("粘贴的内容:", text);
});
```

### 工作流 (EWA_WF.js)

提供工作流的定义、可视化和操作功能。

#### 工作流组织结构

```javascript
// 创建组织结构
var org = new EWAC_WfOrg();

// 初始化部门
org.InitDepts(datas, depId, depName, depLvl, depOrd, depPid);

// 初始化职位
org.InitPosts(datas, posId, posName, posIsMaster, depId);

// 初始化用户
org.InitUsers(datas, userId, userName, depId, posId);

// 查询
org.GetMaster(usrId);    // 获取用户的主管
org.IsMaster(usrId);     // 判断是否为主管
```

#### 工作流单元

```javascript
// 创建工作流单元
var unit = new EWAC_WfUnit(id);

// 单元类型
unit.Type = "normal";    // 普通节点
unit.Type = "control";   // 控制节点
unit.Type = "end";       // 结束节点

// 单元操作
unit.ChangeType(type);   // 改变类型
unit.ChangeDes(des);     // 改变描述
unit.GetDes();           // 获取描述
unit.Delete();           // 删除单元
unit.Create(CurID);      // 创建单元
unit.MoveTo(dx, dy);     // 移动单元
unit.Selected();         // 选中
unit.UnSelect();         // 取消选中

// 日志记录
unit.Log(adm, date, text);      // 记录日志
unit.LogCur(pid);               // 记录当前节点
unit.LogTo();                   // 记录到下一节点
```

#### 工作流连接

```javascript
// 创建工作流连接
var cnn = new EWAC_WfCnn();

// 连接操作
cnn.Create(o1, o2);      // 创建连接
cnn.Delete();            // 删除连接
cnn.Show();              // 显示连接
cnn.Disp(width, color);  // 设置显示样式
cnn.Selected();          // 选中
cnn.UnSelect();          // 取消选中
cnn.ChangeStyle(color, width); // 改变样式
```

#### 工作流管理器

```javascript
// 创建工作流管理器
var wf = new EWAC_Wf();

// 获取唯一 ID
var unid = wf.GetUnid();

// 创建单元
var unit = wf.CreateUnit(id);

// 创建连接
wf.CreateCnn();

// 获取单元
var unit = wf.GetUnit(obj);

// 获取连接
var cnn = wf.GetCnn(obj);

// 清除选择
wf.ClearSelects();
```

#### 工作流工具

```javascript
// 鼠标事件处理
EWAC_WfUtil["MouseDown"] = function(evt) {};
EWAC_WfUtil["MouseUp"] = function(evt) {};
EWAC_WfUtil["MouseMove"] = function(evt) {};

// 删除对象
EWAC_WfUtil["Delete"] = function() {};

// 对象选择
EWAC_WfUtil["objSelectedDown"] = function(unit) {};

// 原子名称编辑
EWAC_WfUtil["AtomChangeName"] = function(o1) {};
EWAC_WfUtil["AtomChangedName"] = function(o1) {};
EWAC_WfUtil["AtomNameKeyPress"] = function(o1, evt) {};

// 显示单元参数
EWAC_WfUtil["ShowUnitPara"] = function(unit) {};
```

### HTML 遍历器 (html_walker.js)

提供 HTML 文档的遍历和解析功能。

```javascript
// HTML 遍历器
function html_walker() {
    // 遍历 HTML 节点
    this.walk = function(node, callback) {
        // 递归遍历节点树
    };
    
    // 获取节点文本
    this.getText = function(node) {
        // 提取节点文本内容
    };
    
    // 获取节点属性
    this.getAttribute = function(node, name) {
        // 获取指定属性值
    };
    
    // 设置节点属性
    this.setAttribute = function(node, name, value) {
        // 设置属性值
    };
}

// 使用示例
var walker = new html_walker();
walker.walk(document.body, function(node) {
    if (node.nodeType === 1) { // 元素节点
        console.log(node.tagName, walker.getText(node));
    }
});
```

### ODT 文档遍历器 (html_walker_odt.js)

专门用于处理 ODT (OpenDocument Text) 格式文档的 HTML 遍历器。

```javascript
// ODT 文档遍历器
function html_walker_odt() {
    // 继承自 html_walker
    
    // 解析 ODT 特定元素
    this.parseOdtElement = function(node) {
        // 处理 ODT 特有的标签和属性
    };
    
    // 提取 ODT 元数据
    this.extractMetadata = function(doc) {
        // 提取作者、创建时间等元数据
    };
}
```

## 使用示例

### 中文数字转换

```javascript
// 财务报表中的金额转换
var amountStr = "壹万贰仟叁佰肆拾伍元陆角柒分";
var amount = EWA_Utils.chineseToNumber(amountStr);
console.log(amount); // 12345.67

// 表单输入验证
function validateAmount(input) {
    try {
        var num = EWA_Utils.chineseToNumber(input.value);
        if (isNaN(num)) {
            alert("请输入有效的数字或中文数字");
            return false;
        }
        return true;
    } catch (e) {
        alert(e);
        return false;
    }
}
```

### 工作流可视化

```javascript
// 初始化工作流编辑器
function initWorkflowEditor() {
    var wf = new EWAC_Wf();
    EWAC_WfUtil["WF"] = wf;
    
    // 绑定事件
    document.addEventListener('mousedown', EWAC_WfUtil["MouseDown"]);
    document.addEventListener('mouseup', EWAC_WfUtil["MouseUp"]);
    document.addEventListener('mousemove', EWAC_WfUtil["MouseMove"]);
    
    // 创建模板单元
    var tempUnit = document.getElementById('TEMP');
    tempUnit.onclick = function() {
        EWAC_WfUtil["CUR_OBJ"] = this;
        wf.CreateUnit();
    };
}

// 保存工作流
function saveWorkflow() {
    var wf = EWAC_WfUtil["WF"];
    var data = {
        units: {},
        cnns: {}
    };
    
    // 收集所有单元
    for (var id in wf.Units) {
        var unit = wf.Units[id];
        var obj = unit.GetObj();
        data.units[id] = {
            type: unit.Type,
            des: unit.GetDes(),
            left: obj.style.left,
            top: obj.style.top
        };
    }
    
    // 收集所有连接
    for (var id in wf.Cnns) {
        var cnn = wf.Cnns[id];
        data.cnns[id] = {
            from: cnn.From,
            to: cnn.To
        };
    }
    
    // 发送到服务器
    $JP('/workflow/save', data, function(result) {
        console.log('保存成功', result);
    });
}
```

### HTML 遍历

```javascript
// 提取页面所有链接
function extractAllLinks() {
    var walker = new html_walker();
    var links = [];
    
    walker.walk(document.body, function(node) {
        if (node.tagName === 'A') {
            links.push({
                href: walker.getAttribute(node, 'href'),
                text: walker.getText(node)
            });
        }
    });
    
    return links;
}

// 统计页面文本长度
function countTextLength() {
    var walker = new html_walker();
    var totalLength = 0;
    
    walker.walk(document.body, function(node) {
        if (node.nodeType === 3) { // 文本节点
            totalLength += node.nodeValue.length;
        }
    });
    
    return totalLength;
}
```

## 依赖关系

```
misc/
├── EWA_ChineseToNumber.js (中文数字转换)
├── EWA_MiscPasteTool.js (粘贴板工具)
├── EWA_UT_TRANS.js (翻译工具 → 已迁移到 core/EWA_06TransClass.js)
├── EWA_WF.js (工作流)
│   ├── EWAC_WfOrg (组织结构)
│   ├── EWAC_WfUnit (工作流单元)
│   ├── EWAC_WfCnn (工作流连接)
│   ├── EWAC_Wf (工作流管理器)
│   └── EWAC_WfUtil (工作流工具)
├── html_walker.js (HTML 遍历器)
└── html_walker_odt.js (ODT 遍历器)
```

## 注意事项

1. **EWA_UT_TRANS.js** 已迁移到 `core/EWA_06TransClass.js`，建议使用新的位置
2. 中文数字转换器支持多种输入格式，包括大写、小写、阿拉伯数字混合
3. 工作流可视化功能需要配合 CSS 样式使用
4. HTML 遍历器支持递归遍历 DOM 树
5. ODT 遍历器专门处理 OpenDocument 格式的文档

## 相关文档

- [Core 模块](../core/README.md) - 核心类库
- [Frames 模块](../frames/README.md) - 框架组件
- [UI 模块](../ui/README.md) - UI 组件
