# EWA Define JS 定义器 JavaScript 模块详解

## 概述

EWA_DEFINE 目录包含 EWA 框架定义器的 JavaScript 模块，用于配置管理、工作流设计、SQL 生成、图表绘制等功能。这些模块是 EWA 开发框架的核心工具集。

**目录位置**: `source/src/EWA_DEFINE/js/`

**文件列表** (20 个文件):

| 文件名 | 说明 | 行数 |
|--------|------|------|
| EWAC.js | 定义器核心功能 | 327 |
| EWAC$Class.js | 类定义生成 | 1504 |
| EWAC_CFG.js | 配置管理 | 417 |
| EWAC_CHARTS.js | 图表工具 | - |
| EWAC_CM.js | 配置管理 | - |
| EWAC_CONF_DESIGN.js | 配置设计器 | - |
| EWAC_CONF.js | 配置类 | - |
| EWAC_CONFIG.js | 配置 XML 生成 | 1200+ |
| EWAC_DDL.js | 下拉列表管理 | 445 |
| EWAC_DEFAULT.js | 默认值设置 | - |
| EWAC_DEFINE.js | 定义器主类 | 1504 |
| EWAC_FROM_TEMPLATE.js | 模板导入 | - |
| EWAC_FUNCTIONS.js | 函数管理 | - |
| EWAC_HorTableSql.js | 横向表 SQL | - |
| EWAC_JSON.js | JSON 类生成 | 196 |
| EWAC_PARAMETERS.js | 参数管理 | - |
| EWAC_SKIN.js | 皮肤管理 | - |
| EWAC_SQL_VIEW.js | SQL 视图生成 | - |
| EWAC_SQL.js | SQL 生成器 | 684 |
| EWAC_SYNATAX.js | 语法检查 | - |
| EWAC_WF.js | 工作流定义 | 1200 |

## 核心模块详解

### 1. EWAC.js - 定义器核心

```javascript
// 工作流创建类
function EWAC_WfCreate() {
    this.Name = "_";
    this.Cfg = eval('new EWAD$Class()');
    this.Cfg.Init();
    
    // 元素模板
    this._ElementsTemplate = {
        I: "<input map='input' type='text' id='[id]' name='[id]' class='EWA_INPUT' />",
        D: "<input map='datetime' type='text' id='[id]' name='[id]' size='8' maxlength='8' />",
        T: "<textarea map='textarea' class='EWA_TEXTAREA' id='[id]' name='[id]'></textarea>",
        O: "<select map='select' class='EWA_SELECT' id='[id]' name='[id]'></select>",
        A: "<span map='span' class='IX_SPAN' id='[id]' name='[id]'>[AUTO]</span>",
        H: "<div map='dHtml' class='ewa_wf_h' id='[id]' name='[id]'></div>",
        F: "<input map='file' type='file' class='EWA_INPUT' id='[id]' name='[id]'/>",
        S: "<div map='user' class='ewa_wf_s' id='[id]' name='[id]'>[SIGN]</div>"
    };
    
    // 创建配置 XML
    this.create = function() {
        var x1 = EWAC_CFG_XML.replace("[NAME]", this.Name);
        x = new EWA.C.Xml();
        var s = this._getElements();
        x1 = x1.replace('<XItems />', '<XItems>' + s + '</XItems>');
        x.LoadXml(x1);
    };
}

// 保存 XML
EWAC.SaveXml = function(xmlName, itemName, xml, isNew) {
    // 保存配置 XML 到服务器
};

// 添加项到树
EWAC.AddItemToTree = function() {
    // 添加配置项到树形结构
};

// 主题管理
EWAC.Theme = {
    get_theme: function() {
        // 获取当前主题
    },
    change_theme: function(theme) {
        // 切换主题 (dark/light)
    },
    mark_menu: function(theme) {
        // 标记菜单样式
    }
};
```

### 2. EWAC$Class.js - 类定义生成

```javascript
// 添加项类
function EWAC$Add() {
    this.Text;          // 文本
    this.XmlPath;       // XML 路径
    this.SetMethod;     // 设置方法 (CDATA/Attribute)
}

// 添加项集合
function EWAC$Adds() {
    this.Adds = new Array();
    this.AddNodes = [];
    
    // 从 XML 初始化
    this._InitFromXml = function(classXml, node) {
        var nl = classXml.GetElements("Adds/Add", node);
        for (var i = 0; i < nl.length; i++) {
            var add = new EWAC$Add();
            add.Text = classXml.GetElementText(nl[i]);
            add.XmlPath = classXml.GetElementAttribute(nl[i], "XmlPath");
            add.SetMethod = classXml.GetElementAttribute(nl[i], "SetMethod");
            this.Adds.push(add);
        }
    };
    
    // 创建添加项
    this.CreateAdds = function(classXml) {
        for (var i = 0; i < this.Adds.length; i++) {
            var add = this.Adds[i];
            var node = classXml.GetOrCreateElement(add.XmlPath);
            var t1 = this._CreateValue(add.Text, classXml);
            
            if (add.SetMethod == "CDATA") {
                classXml.SetCData(t1, node);
            } else {
                var set = node.ownerDocument.createElement("Set");
                node.appendChild(set);
            }
        }
    };
    
    // 创建值 (支持变量替换)
    this._CreateValue = function(text, classXml) {
        // {$XmlPath#Attribute} - XML 值
        // {@js 表达式} - JS 值
        var r = /\{.+\}/ig;
        var m = text.match(r);
        for (var i = 0; i < m.length; i++) {
            var v = this._QueryValue(m[i], classXml);
            t1 = t1.replace(m[i], v);
        }
        return t1;
    };
}

// 参数类
function EWAC$Para() {
    this.XmlPath = null;
    this.Val = null;
    this.Name = null;
}

// 参数集合
function EWAC$Paras() {
    this.Paras = new Array();
    
    this.CreateParas = function(classXml, curNode) {
        for (var i = 0; i < this.Paras.length; i++) {
            var para = this.Paras[i];
            var node = classXml.GetOrCreateElement(para.XmlPath, curNode);
            var val = this._EvalValue(para.Val);
            node.setAttribute(para.Name, val);
        }
    };
}

// 字段类
function EWAC$Field() {
    this.Name;
    this.Length;
    this.Description;
    this.IsPk = false;      // 是否主键
    this.IsFk = false;      // 是否外键
    this.FkTableName;
}
```

### 3. EWAC_WF.js - 工作流定义

```javascript
// 工作流组织结构
var EWAC_WfOrg = function() {
    this.Depts = {};    // 部门
    this.Posts = {};    // 职位
    this.Users = {};    // 用户
    
    // 初始化部门
    this.InitDepts = function(datas, depId, depName, depLvl, depOrd, depPid) {
        for (var i = 0; i < datas.length; i++) {
            var d = datas[i];
            var dept = {
                Id: d[depId],
                Name: d[depName],
                Lvl: d[depLvl],
                Ord: d[depOrd],
                Pid: d[depPid],
                Posts: {},
                Users: {},
                Children: {}
            };
            this.Depts[dept.Id] = dept;
        }
        // 建立父子关系
        for (var n in this.Depts) {
            var d = this.Depts[n];
            if (this.Depts[d.Pid]) {
                var p = this.Depts[d.Pid];
                d.Parent = p;
                p.Children[d.Id] = d;
            }
        }
    };
    
    // 初始化职位
    this.InitPosts = function(datas, posId, posName, posIsMaster, depId) {
        for (var i = 0; i < datas.length; i++) {
            var post = {
                Id: datas[i][posId],
                Name: datas[i][posName],
                DeptId: datas[i][depId],
                IsMaster: (datas[i][posIsMaster] == "Y" || datas[i][posIsMaster] == "1")
            };
            this.Posts[post.Id] = post;
        }
    };
    
    // 初始化用户
    this.InitUsers = function(datas, userId, userName, depId, posId) {
        for (var i = 0; i < datas.length; i++) {
            var user = {
                Id: datas[i][userId],
                Name: datas[i][userName],
                DeptId: datas[i][depId],
                Posts: {}
            };
            user.Posts[datas[i][posId]] = this.Posts[datas[i][posId]];
            this.Users[user.Id] = user;
        }
    };
};

// 工作流单元
function EWAC_WfUnit(id) {
    this.Id = id;
    this.Type = "normal";  // normal, control, end
    this.IsSelected = false;
    this.tagName = 'wfunit';
    this.CnnsFrom = {};    // 连接来源
    this.CnnsTo = {};      // 连接目标
    
    // 改变类型
    this.ChangeType = function(type) {
        var css = 'ewa_wf_unit_img';
        if (type == 'control') css = 'ewa_wf_unit_img1';
        else if (type == 'end') css = 'ewa_wf_unit_img2';
        obj.getElementsByTagName('img')[0].className = css;
    };
    
    // 改变描述
    this.ChangeDes = function(des) {
        var obj = $X(this.Id);
        SetInnerText(obj.getElementsByTagName('td')[1].childNodes[0], des);
    };
    
    // 获取描述
    this.GetDes = function() {
        return GetInnerText($X(this.Id).getElementsByTagName('td')[1]).trimEx();
    };
    
    // 删除单元
    this.Delete = function() {
        for (var id in this.CnnsFrom) {
            this.CnnsFrom[id].Delete();
        }
        for (var id in this.CnnsTo) {
            this.CnnsTo[id].Delete();
        }
        var obj = $X(this.Id);
        obj.parentNode.removeChild(obj);
    };
    
    // 创建单元
    this.Create = function(CurID) {
        var tb = document.createElement('TABLE');
        tb.id = this.Id;
        tb.className = 'ewa_wf_box';
        // ... 创建 HTML 结构
    };
}

// 工作流连接线
function EWAC_WfCnn() {
    this.IsSelect = false;
    this.Id = null;
    this.Type = null;
    this.From = null;
    this.To = null;
    this.tagName = 'wfcnn';
    
    // 创建连接
    this.Create = function(o1, o2) {
        this.Id = o1.Id + "G" + o2.Id;
        this.From = o1.Id;
        this.To = o2.Id;
        // ... 创建连接线 HTML
    };
    
    // 显示连接
    this.Show = function() {
        // 计算连接线的坐标和类型
        // 绘制连接线
    };
}

// 工作流管理器
function EWAC_Wf() {
    this.Ids = null;
    this._CurIdx = 0;
    this.Units = {};
    this.Cnns = {};
    
    // 获取唯一 ID
    this.GetUnid = function() {
        return this.Ids[this._CurIdx++];
    };
    
    // 创建单元
    this.CreateUnit = function(id) {
        var unit = new EWAC_WfUnit(id || this.GetUnid());
        unit.Create(this._CurIdx);
        this.Units[unit.Id] = unit;
        return unit;
    };
    
    // 创建连接
    this.CreateCnn = function() {
        var cnn = new EWAC_WfCnn();
        cnn.Create(TWO[0], TWO[1]);
        this.Cnns[cnn.Id] = cnn;
    };
}

// 工作流工具
var EWAC_WfUtil = {
    CUR_OBJ: null,
    TWO: [null, null],
    SELECTED: null,
    
    MouseDown: function(evt) {
        // 鼠标按下处理
    },
    MouseUp: function(evt) {
        // 鼠标释放处理
    },
    MouseMove: function(evt) {
        // 鼠标移动处理
    },
    Delete: function() {
        // 删除选中对象
    }
};
```

### 4. EWAC_SQL.js - SQL 生成器

```javascript
function EWAC_SqlCreator() {
    this._TableName;
    this._Fields = new Array();
    this._ClassName;
    this._HtmlTable = null;
    this.IsCopy = true;
    this.isCreateSwaggerAnnotations = false;
    
    // 获取 HTML 表格对象
    this.GetHtmlTable = function() {
        var o = document.createElement("table");
        o.style.border = '1px solid gray';
        o.style.fontSize = '10px';
        o.cellSpacing = 1;
        o.id = 'TABLE#' + this._TableName;
        
        // 添加表头
        var tr = o.insertRow(-1);
        tr.innerHTML = '<td colspan="4">' + this._TableName + '</td>';
        
        // 添加字段行
        for (var i = 0; i < this._Fields.length; i++) {
            var tr = o.insertRow(-1);
            tr.id = 'ROW#' + this._TableName + "#" + this._Fields[i].Name;
            // 添加复选框、字段名、类型、描述
        }
        return o;
    };
    
    // 从 JSON 加载
    this.LoadFromJson = function(json) {
        for (var i = 0; i < json.length; i++) {
            var f = json[i];
            if (i == 0) this._TableName = f['tablename'];
            var field = {
                Name: f.name,
                Type: f.databasetype,
                Description: f.description,
                IsPk: f.pk == 'true'
            };
            this._Fields.push(field);
        }
    };
    
    // 创建 Java 类
    this.CreateClass = function() {
        var s0 = [];
        s0.push("import java.util.*;");
        s0.push("import com.gdxsoft.easyweb.datasource.ClassBase;");
        
        // 生成类定义、字段、getter/setter
        for (var i = 0; i < this._Fields.length; i++) {
            var f = this._Fields[i];
            // 生成字段和属性
        }
        return s0.join('\n');
    };
}
```

### 5. EWAC_JSON.js - JSON 类生成

```javascript
var clss = [];

// JSON 转类
function jsonMap(nameSpace, clsName, jsonStr, isNet) {
    clss = [];
    var o;
    eval('o=' + jsonStr);
    jsonWalk(clsName, o);
    
    var ss = [];
    if (isNet) {
        ss.push('using System;');
        ss.push('using System.Collections.Generic;');
        ss.push('using LitJson;');
        ss.push('namespace ' + nameSpace + '{');
    }
    
    for (var i = 0; i < clss.length; i++) {
        ss.push(clss[i].ToCode(isNet));
    }
    
    if (isNet) ss.push('}');
    return ss.join('\n');
}

// 遍历 JSON 对象
function jsonWalk(name, obj) {
    var cls = new JsonClass(name);
    clss.push(cls);
    
    for (var n in obj) {
        var o1 = obj[n];
        var type = jsonType(o1);
        if (type == 'Object') {
            jsonWalk(n, o1);
            cls.AddField(n, cls._Name);
        } else if (type == 'Array') {
            jsonWalk(n, o1[0]);
            cls.AddField(n, cls._Name, true);
        } else {
            cls.AddField(n, type);
        }
    }
    return cls;
}

// 判断 JSON 类型
function jsonType(obj) {
    if (obj == null) return 'String';
    if (typeof(obj) == "string") return "String";
    if (typeof(obj) == "number") return "Double";
    if (typeof(obj) == "boolean") return "Boolean";
    if (obj.constructor === Array) return 'Array';
    return "Object";
}

// JSON 类
function JsonClass(name) {
    this._Name = 'cls' + fixName(name);
    this._Fields = {};
    
    this.AddField = function(name, type, isArray) {
        var f = new JsonField(name, type);
        f._IsArray = isArray;
        this._Fields[name] = f;
    };
    
    this.ToCode = function(isNet) {
        var ss = [];
        ss.push('public class ' + this._Name + '{');
        // 生成字段和属性
        for (var n in this._Fields) {
            ss.push(this._Fields[n].ToCode(isNet));
        }
        ss.push('}');
        return ss.join('\n');
    };
}
```

### 6. EWAC_DDL.js - 下拉列表管理

```javascript
var EWAC_DDL = {
    init: function() {
        this.map = {};
        this.lst = [];
        
        // 整理 DDL 配置
        for (var n in ddls) {
            var d = ddls[n];
            var key = (d.CallXmlName + "," + d.CallItemName).toUpperCase();
            if (key.indexOf('|') != 0) key = '|' + key;
            
            if (this.map[key]) {
                this.map[key].push(d);
            } else {
                this.map[key] = [d];
                this.lst.push(key);
            }
        }
        this.lst.sort();
        
        // 生成 HTML 表格
        var ss = ["<table id='EWA_LF_EWA_C_DDL' class='EWA_TABLE'>"];
        ss.push("<tr><th>CallXmlName</th><th>CallItemName</th>");
        ss.push("<th>DlsShow</th><th>DlsAction</th><th>CallPara</th>");
        ss.push("<th>Use it!</th></tr>");
        
        for (var n in this.lst) {
            var arr = this.map[this.lst[n]];
            for (var m in arr) {
                var d = arr[m];
                ss.push("<tr>");
                ss.push("<td>" + d.CallXmlName + "</td>");
                ss.push("<td>" + d.CallItemName + "</td>");
                ss.push("<td>" + d.DlsShow + "</td>");
                ss.push("<td>" + d.DlsAction + "</td>");
                ss.push("<td>" + d.CallPara + "</td>");
                ss.push("<td><input type=button value='Use It' onclick='EWAC_DDL.useIt(this)'></td>");
                ss.push("</tr>");
            }
        }
        ss.push("</table>");
    },
    
    // 显示 DDL 选择对话框
    show: function(fromObj) {
        var tr = $(fromObj).parentsUntil('tr').parent();
        this.tr_id = tr.attr('id');
        this.tr = tr;
        this.dia = $DialogHtml(this.html, 'DropList', 1000, 400);
    },
    
    // 使用选中的 DDL
    useIt: function(fromObj) {
        var tr = $(fromObj).parent().parent()[0];
        // 获取选中的 DDL 配置
        var CallXmlName = tr.cells[0].innerHTML;
        var CallItemName = tr.cells[1].innerHTML;
        var DlsShow = tr.cells[2].innerHTML;
        var DlsAction = tr.cells[3].innerHTML;
        var CallPara = tr.cells[4].innerHTML;
        
        // 填充到表单
        var tb = this.tr.parent();
        tb.find('input[id="ITEMS$Frame$CallXmlName"]').val(CallXmlName);
        tb.find('input[id="ITEMS$Frame$CallItemName"]').val(CallItemName);
        // ...
        
        this.dia.Close();
    }
};
```

### 7. EWAC_CFG.js - 配置管理

```javascript
var EwaCUtils = {};
EwaCUtils.Refs = {};

// 初始化面板值
EwaCUtils.initPanelValues = function(proxy) {
    var xmlNode = proxy.xmlNode;
    var sets = xmlNode.getElementsByTagName('Set');
    for (var i = 0; i < sets.length; i++) {
        var node = sets[i];
        for (var m = 0; m < node.attributes.length; m++) {
            var att = node.attributes[m];
            var uiValue = proxy.getUIValue(node.parentNode.tagName, att.name);
            if (uiValue.CLASS_NAME == 'EwaUIRow') {
                uiValue.UISetInfo.xmlNode = node.parentNode;
                EwaCUtils.initSetInfo(uiValue.UISetInfo);
            } else {
                uiValue.initValue(att.value);
                uiValue.xmlNode = node;
            }
        }
    }
};

// 初始化 Set 信息
EwaCUtils.initSetInfo = function(ewaUiSetInfo) {
    var nodes = ewaUiSetInfo.xmlNode.getElementsByTagName('Set');
    ewaUiSetInfo.UISetItems = [];
    for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        var item = new EwaUISetItem();
        item.id = "item_" + i;
        item.text = EwaCUtils.getXmlInfo(node);
        item.xmlNode = node;
        ewaUiSetInfo.UISetItems.push(item);
    }
};

// 获取 XML 信息
EwaCUtils.getXmlInfo = function(node) {
    var s = [];
    for (var i = 0; i < node.attributes.length; i++) {
        var n = node.attributes[i];
        s.push(n.name, "=", n.value, ";");
    }
    return s.join("");
};

// 加载配置 XML
EwaCUtils.loadCfgXml = function(xmlName) {
    var url = "XMLNAME=" + xmlName + "&TYPE=CFG_XML";
    return EwaCUtils.loadXml(url);
};

// 加载 XML
EwaCUtils.loadXml = function(url) {
    EWA.CP = '/EmpScriptV2/';
    var oXml = new EWA.C.Xml();
    oXml.LoadXmlFile(EWA.CP + '/EWA_DEFINE/cgi-bin/xml/?' + url);
    return oXml;
};

// 加载描述信息
EwaCUtils.loadDescription = function(xmlClass, node) {
    var info = { Lang: EWA.LANG, Info: "", Memo: "" };
    var nodes = xmlClass.GetElements('DescriptionSet', node);
    if (nodes.length == 0) return info;
    
    var nodeSets = xmlClass.GetElements('Set', nodes[0]);
    // 查找匹配语言的描述
    for (var i = 0; i < nodeSets.length; i++) {
        var node = nodeSets[i];
        var lang = xmlClass.GetElementAttribute(node, "Lang");
        if (lang == EWA.LANG) {
            node1 = node;
            break;
        }
    }
    
    info.Info = xmlClass.GetElementAttribute(node1, "Info");
    info.Memo = xmlClass.GetElementAttribute(node1, "Memo");
    return info;
};
```

### 8. EWAC_CHARTS.js - 图表工具

```javascript
var EWAC_ChartUtils = {
    // 图表工具方法
};

// 柱状图
function EWAC_ChartBar() {
    // 柱状图实现
}

// 图表基类
function EWAC_Chart() {
    // 图表基类实现
}
```

## 使用示例

### 1. 创建工作流

```javascript
// 初始化工作流
var wf = new EWAC_Wf();
wf.Ids = ['WF001', 'WF002', 'WF003'];

// 创建单元
var unit1 = wf.CreateUnit();
unit1.ChangeDes('开始节点');

var unit2 = wf.CreateUnit();
unit2.ChangeDes('审批节点');

// 创建连接
wf.CreateCnn();

// 绑定事件
document.onmousedown = EWAC_WfUtil.MouseDown;
document.onmouseup = EWAC_WfUtil.MouseUp;
document.onmousemove = EWAC_WfUtil.MouseMove;
```

### 2. 生成 SQL 类

```javascript
// 创建 SQL 生成器
var sqlCreator = new EWAC_SqlCreator();
sqlCreator.Init('USER_TABLE', fields);

// 生成 Java 类
var javaCode = sqlCreator.CreateClass();
console.log(javaCode);

// 生成 HTML 表格
var htmlTable = sqlCreator.GetHtmlTable();
document.body.appendChild(htmlTable);
```

### 3. JSON 转类

```javascript
// JSON 字符串
var jsonStr = '{"name":"John","age":30,"address":{"city":"NYC"}}';

// 生成 Java 类
var javaCode = jsonMap('com.example', 'User', jsonStr, false);
console.log(javaCode);

// 生成 C# 类
var csharpCode = jsonMap('Example', 'User', jsonStr, true);
console.log(csharpCode);
```

### 4. 配置管理

```javascript
// 加载配置 XML
var cfgXml = EwaCUtils.loadCfgXml('user/xml');

// 初始化面板
var panel = new EwaCPanel();
panel.cfgXml = cfgXml;
panel.init();

// 获取描述信息
var desc = EwaCUtils.loadDescription(cfgXml, node);
console.log(desc.Info);
```

## CSS 类名说明

| CSS 类 | 说明 |
|--------|------|
| ewa_wf_box | 工作流单元盒子 |
| ewa_wf_unit_img | 工作流单元图标 (普通) |
| ewa_wf_unit_img1 | 工作流单元图标 (控制) |
| ewa_wf_unit_img2 | 工作流单元图标 (结束) |
| EWA_TABLE | 标准表格 |
| EWA_TD_H | 表头单元格 |
| EWA_TD_M | 数据单元格 |
| ewa-lf-frame | 列表框架 |

## 注意事项

1. **工作流编辑器**: 需要绑定鼠标事件来处理拖放操作
2. **SQL 生成**: 支持多种数据库类型的字段映射
3. **JSON 转换**: 自动识别嵌套对象和数组
4. **配置管理**: 支持多语言描述信息
5. **主题切换**: 支持 dark/light 两种主题

## 相关文档

- [Define.css](define-css-detail.md) - 定义器样式
- [FrameTree 详解](frametree-detail.md) - 树形框架
- [UI 模块](ui-module.md) - UI 组件
