/**
 * Tree Node Class
 */
function EWA_TreeNodeClass() {
	this.Key = null;
	this.Text = null;
	this.MenuGroup = null;
	this.Parent = null;
	this.Prev = null;
	this.Next = null;
	this.AddParas = new Array();
	this.Children = new Array();
	this.ChildLast = null;
	this.Cmd = null;
	this.tagName = "TREE_NODE";
	this.Object = null;
	this.IsMoreChildren = false;

	this.Mark = function(isMark) {
		// var obj = this.GetObject().rows[0].cells[2];
		// if (isMark) {
		// obj.childNodes[0].style.backgroundColor = "blue";
		// obj.childNodes[0].style.color = "white";
		// } else {
		// obj.childNodes[0].style.backgroundColor = "";
		// obj.childNodes[0].style.color = "";
		// }
		var obj = $(this.GetObject().rows[0]);
		if (isMark) {
			$(obj).addClass('ewa-tree-node-marked');
		} else {
			$(obj).removeClass('ewa-tree-node-marked');
		}
	}
	/**
	 * 修改Key值，一般用于新增后将Key修改为数据库值
	 * 
	 * @param newKey
	 *            修改后的Key值
	 */
	this.SetKey = function(newKey) {
		var obj = this.GetObject();
		this.Key = newKey;
		obj.id = newKey;
	}
	this.SetText = function(newText) {
		this.Text = newText;
		var obj = this.GetObject();
		obj.rows[0].cells[2].childNodes[0].innerHTML = newText;
	}
	this.SetAddParameters = function(parameters) {
		this.AddParas = parameters.split(',');
		var obj = this.GetObject();
		for (var i = 0; i < this.AddParas.length; i += 1) {
			obj.rows[0].cells[2].childNodes[0].setAttribute('EWA_P' + i,
				this.AddParas[i].trim());
		}
	}
	this.SetMenuGroup = function(menuGroup) {
		var obj = this.GetObject();
		obj.setAttribute('EWA_MG', menuGroup);
	}
	this.AddChild = function(node) {
		node.Parent = this;
		this.Children[this.Children.length] = node;
		this.ChildLast = null;
		this.ChildLast = node;
		this.IsMoreChildren = false;
	};
	this.GetObject = function() {
		if (this.Object == null) {
			this.Object = document.getElementById(this.Key);
		}
		return this.Object;
	};
	this.AddBackground = function(src) {
		var tb = this.GetObject();
		tb.rows[1].cells[0].background = src;
	};
	this.SetBookIcon = function(css) {
		var tb = this.GetObject();
		tb.rows[0].cells[1].className = css;
	};
	/**
	 * 节点是否处于打开状态
	 */
	this.IsNodeOpen = function() {
		var tb = this.GetObject();
		var td = tb.rows[0].cells[0];
		tag = this._GetTag(td);
		return tag == "B";
	};
	this.NodeShow = function(isOpen) {
		if (this.Key == 'EWA_TREE_ROOT') {
			return;
		}
		var tb = this.GetObject();
		var td = tb.rows[0].cells[0];
		var tag;
		if (isOpen == null) {// 未定显示方式，取当前状态反值
			tag = this._GetTag(td);
			if (tag == "C" || tag == "D") {
				return;
			}

			tag = tag == "A" ? "B" : "A";
		} else {
			tag = isOpen ? "B" : "A";
		}

		var css = td.className.split(' ');
		var css1 = [this._GetClassNameNoTag(td) + tag];
		for (var i = 1; i < css.length; i++) {
			css1.push(css[i]);
		}
		td.className = css1.join(' ');

		if (tb.rows.length == 2 && tb.rows[1].cells[1].childNodes.length > 0) {
			tb.rows[1].style.display = tag == "B" ? "table-row" : "none";
		}
		this.BookShow(isOpen);
		td = tb = null;
		if (this.IsMoreChildren) { // 通过Ajax调用,显示更多的子节点
			this.Object.setAttribute("EWA_TREE_MORE", "0");
			var cmd = new EWA.F.Cmd();
			cmd.EWA_ACTION = "OnTreeNodeMore";
			cmd.EWA_TREE_KEY = this.Key;
			EWA.CurUI._PostChange(cmd);
		}

		if (this.ewa && this.ewa.OnBookShowAfter) {
			try {
				this.ewa.OnBookShowAfter(tag == 'B', this);
			} catch (e) {
				console.log(e);
			}
		}
	};
	this.BookShow = function(isOpen) {
		if (this.Key == 'EWA_TREE_ROOT') {
			return;
		}
		var tb = this.GetObject();
		var td = tb.rows[0].cells[1];
		if (isOpen == null) {// 未定显示方式，取当前状态反值
			tag = this._GetTag(td);
			tag = tag == "A" ? "B" : "A";
		} else {
			tag = isOpen ? "B" : "A";
		}
		var css = td.className.split(' ');
		var css1 = [this._GetClassNameNoTag(td) + tag];
		for (var i = 1; i < css.length; i++) {
			css1.push(css[i]);
		}
		td.className = css1.join(' ');
		td = tb = null;
	};
	this.NodeClose = function() {
		this.NodeShow(false);
	};
	this.NodeOpen = function() {
		this.NodeShow(true);
	};
	this.BookOpen = function() {
		this.BookShow(true);
	};
	this.BookClose = function() {
		this.BookShow(false);
	};
	this.NodeCross = function(isMust) {
		var tb = this.GetObject();
		var td = tb.rows[0].cells[0];
		var tag = this._GetTag(td);
		if (tag == "D" || isMust) {
			td.className = this._GetClassNameNoTag(td) + "C";
		}
		if (tb.rows.length == 1) {
			var tr = tb.insertRow(-1);
			tr.insertCell(-1);
			tr.insertCell(-1);
			tr.cells[1].colSpan = 2;
			tr.style.display = "none";
		}
		td = tb.rows[1].cells[0];
		td.className = "TD10B";
		td = tb = null;
	};
	this.NodeCrossEnd = function(isMust) {
		var tb = this.GetObject();
		var td = tb.rows[0].cells[0];
		var tag = this._GetTag(td);
		if (tb.rows.length == 1) {
			var tr = tb.insertRow(-1);
			tr.insertCell(-1);
			tr.insertCell(-1);
			tr.cells[1].colSpan = 2;
		}
		tb.rows[1].style.display = "none";
		if (tag == "C" || isMust) {
			td.className = this._GetClassNameNoTag(td) + "D";
		}
		td = tb.rows[1].cells[0];
		td.className = "TD10A";
		td = tb = null;
	};
	this._GetTag = function(obj) {
		var className = obj.className.split(' ')[0];
		var tag = className.substring(className.length - 1);
		return tag;
	};
	this._GetClassNameNoTag = function(obj) {
		var className = obj.className.split(' ')[0];
		return className.substring(0, className.length - 1);
	};
}

/**
 * 树操作类
 * 
 * @param {Object}
 *            parentObject 父节点
 * @param {Object}
 *            className 类名称
 * @param {Object}
 *            url 提交URL
 */
function EWA_TreeClass(parentObject, className, url) {
	this.ParentObject = parentObject;
	this.ClassName = className;
	this._Url = url;
	this.Url = url;
	this.Resources = {}; // 资源
	this._Ajax = null; // = new EWA.C.Ajax();
	this.Menu = null; // EWA_UI_MenuClass(className + ".Menu");
	this.Icons = null;
	this._CurNewNode = 0;
	this.Fields = {}; // 字段表达式
	this._Id = null; // 类编号
	this._LastFocus = null; // 最后选中的节点
	this._TempNode = document.createElement('DIV');
	this._MoveNode = document.createElement('DIV');
	// 主模板
	this._HtmlTemplate1 = "<div oncontextmenu='"
		+ this.ClassName
		+ ".ShowMenu(event);return false;' onclick='"
		+ this.ClassName
		+ ".Click(event)'><table border=0 cellspacing=0 [ID] cellpadding=0 width=100% style='table-layout:fiexed'>";
	this._HtmlTemplate1 += "<tr><TD></TD><td class=CAPTION>&nbsp;&nbsp;&nbsp;</td><td width=99%><SPAN style='padding-left:4px'>[B]</SPAN></td></tr>";
	this._HtmlTemplate1 += "<tr><td></td><td colspan=2></td></tr></table></div>";
	this._HtmlTemplate1 += "<div style='display:none'><input style='margin:0px' type=text onblur='"
		+ this.ClassName + ".RenameBlur(this)'></div>";

	// 节点模板
	this._HtmlTemplate = "<table class='ewa-tree-node ewa-tree-lvl-[LVL]' border=0 EWA_MG=\"[EWA_MENU_GROUP]\" EWA_T=1 [EWA_MORE_CHILDREN] cellspacing=0 [ID] cellpadding=0 width=100%>";
	this._HtmlTemplate += "<tr class='ewa-node-row-0'><td nowrap class='[A] ewa-node-open-close'><div>&nbsp;</div></td>"
		+ "<td nowrap class='[B] ewa-node-icon'><div>&nbsp;</div></td>"
		+ "<td class='ewa-node-caption'><SPAN EWA_CMD=1 [TMP_ADD_PARAS]>[C]</SPAN></td>"
		+ "[TEMP_NODE_ADD_FIELDS]" // 附加字段替换;
	this._HtmlTemplate += "</tr><tr class='ewa-node-row-1' style='display:none'><td class='[A1]'></td><td colspan=13></td></tr></table>";

	/**
	 * 打开所有节点
	 */
	this.OpenAll = function() {
		this._OpenOrClose('.TD00A');
	};
	/**
	 * 关闭所有节点
	 */
	this.CloseAll = function() {
		this._OpenOrClose('.TD00B');
	};

	/**
	 * 打开或关闭节点
	 * 
	 * @param className
	 *            节点的类名称
	 */
	this._OpenOrClose = function(className) {
		var p = $('#EWA_TREE_' + this._Id);
		var c = this;
		p.find(className).each(function() {
			var fackevt = {
				srcElement: this
			};
			c.Click(fackevt);
		});
	}

	this.DoAction = function(obj, action, confirm, tip, parasArray, afterJs) {
		EWA.F.CID = this._Id;
		if (action == null || action.trim() == "") {
			alert("action not value");
			return;
		}

		if (confirm != null && confirm.trim().length > 0) {
			var msg = _EWA_INFO_MSG[confirm];
			if (!(msg == null || msg == "")) {
				if (!window.confirm(msg)) {
					return;
				}
			} else {
				if (!window.confirm(confirm)) {
					return;
				}
			}
		}

		this._Ajax = new EWA.C.Ajax();
		this._Ajax.LoadingType = "image";
		this._Ajax.AddParameter("EWA_AJAX", "1");
		this._Ajax.AddParameter("EWA_ACTION", action);
		this._Ajax.AddParameter("EWA_ID", this._Id);
		this._Ajax.AddParameter("EWA_NO_CONTENT", "1");
		this._Ajax.AddParameter("EWA_ACTION_TIP", tip);

		if (afterJs != null && afterJs.trim().length > 0) {
			this._Ajax.AddParameter("EWA_AFTER_EVENT", afterJs);
			// DoAction 指定了提交后的脚本，阻止页面重新加载
			this.StopAjaxAfterReload = true;
			this._Ajax.AddParameter("EWA_ACTION_RELOAD", "0");
		} else {
			this.StopAjaxAfterReload = false;
		}

		if (parasArray != null && parasArray.length > 0) { // 附加的参数
			for (var i = 0; i < parasArray.length; i += 1) {
				this._Ajax
					.AddParameter(parasArray[i].Name, parasArray[i].Value);
			}
		}
		var url = new EWA.C.Url();
		url.SetUrl(this.Url);
		var u = url.RemoveParameter("EWA_ACTION");
		this._Ajax.PostNew(u, EWA.F.FOS[EWA.F.CID]._PostChangeCallback);
	};

	this.OnMouseDown = function(evt) {
		// if (EWA.B.IE) {
		// }
	}
	this.OnMouseUp = function(evt) {

	}
	this.OnMouseMove = function(evt) {

	}
	this.OnMouseOut = function(evt) {

	}

	this.MoveNode = function(node) {
		/*
		 * this._MoveNode.innerHTML=""; this._MoveNode.id='Test1';
		 * this._MoveNode.appendChild(node.cloneNode(true));
		 * document.body.appendChild(this._MoveNode);
		 * with(this._MoveNode.style){ border='1px #DDD dotted';
		 * display='block'; position='absolute'; left=event.x; top=event.y;
		 * position='absolute'; }
		 */
	}
	this.GetParentNode = function(node) {
		if (node == null || node.Key == 'EWA_TREE_ROOT') {
			return null;
		}
		var obj = node.GetObject().parentNode;
		var n = this.GetNode(obj);
		if (n == null) {
			return null;
		}
		if (n.Key == 'EWA_TREE_ROOT') {
			return null;
		} else {
			return n;
		}
	}
	/**
	 * 通过XML生产节点
	 * 
	 * @param xml
	 *            XML类(EWA.C.Xml())
	 */
	this.CreateByXml = function(xml) {
		var nl = xml.GetElements("FrameData/Row");
		var oNodes = new Object();
		var firstNode;
		for (var i = 0; i < nl.length; i += 1) {
			var treeNode = this._CreateNodeFromXml(nl[i], xml);
			oNodes[treeNode.Key] = treeNode;
			if (i == 0) {
				firstNode = treeNode;
			} else {
				var key = treeNode.ParentKey == "" ? "EWA_TREE_ROOT"
					: treeNode.ParentKey;
				var treeNodeParent = oNodes[key];
				if (treeNodeParent != null) {
					treeNodeParent.AddChild(treeNode);
				}
			}
		}
		treeFirstNode = firstNode;
		this.Create(firstNode);
	};
	/**
	 * 确定是否可以选择
	 * 
	 * @param evt
	 *            event
	 */
	this.OnSelect = function(evt) {
		var obj = evt.srcElement;
		if (obj.tagName != "INPUT") {
			return false;
		} else {
			return true;
		}
	};

	/**
	 * 初始化菜单
	 * 
	 * @param {EWA_UI_MenuItemClass[]}
	 *            menus
	 */
	this.InitMenu = function(menus) {
		if (menus != null) {
			this.Menu = new EWA_UI_MenuClass(className + ".Menu");
			this.Menu.Create(menus); // 生成菜单
		}
	};
	/**
	 * 提交AJAX事件
	 * 
	 * @param cmd
	 *            事件
	 */
	this._PostChange = function(cmd) {// EWA UI TreeChange
		this.PostChangeType = cmd.EWA_ACTION;
		this.PostChangeKey = cmd.EWA_TREE_KEY;

		EWA.CurUI = this;
		this._Ajax = new EWA.C.Ajax();
		if (this.PostChangeType == "OnTreeNodeMore") {
			cmd.EWA_AJAX = "XML";
			cmd.EWA_TREE_MORE = "1"; // 更多的节点
		}
		for (var a in cmd) {
			this._Ajax.AddParameter(a, cmd[a]);
		}
		this._Ajax.PostNew(this._Url, EWA.CurUI._PostChangeCallback);
		this.IsPostChange = true;
	};

	/**
	 * 事件提交后的处理
	 */
	this._PostChangeCallback = function() {
		var ajax = EWA.CurUI._Ajax;
		if (ajax._Http.readyState != 4) {
			ajax = null;
			return;
		}
		ajax.HiddenWaitting();
		if (ajax._Http.status == 200) {
			var ret = ajax._Http.responseText;
			// 检查是否错误提示
			var isRightResponse = EWA.F.CheckCallBack(ret);
			if (isRightResponse) {
				// 更多的节点或初始化选中节点
				if (EWA.CurUI.PostChangeType == "OnTreeNodeMore") {
					EWA.CurUI.LoadChildrenAfter(ret);
				} else if (EWA.CurUI.PostChangeType == "OnTreeNodeStatus") {
					EWA.CurUI.LoadChildrenStatus(ret);
				} else if (EWA.CurUI.PostChangeType == "OnTreeNodeDelete") {
					EWA.CurUI.DeleteAfter();
				} else {
					eval(ret);
				}
			}
		} else {
			alert("ERROR:\r\n" + ajax._Http.statusText);
		}
		ajax = null;
		EWA.CurUI.IsPostChange = false;
		EWA["SHOW_ERROR"] = true;// 默认提示错误
	};

	this.LoadChildrenStatus = function(xmlString) {
		var xml = new EWA.C.Xml();
		xml.LoadXml(xmlString);
		var nl = xml.GetElements("FrameData/Row");
		if (nl == null) {
			return;
		}

		var nodes = new Array();
		var o1 = {};
		for (var i = 0; i < nl.length; i = 1 + i) {
			var treeNode = this._CreateNodeFromXml(nl[i], xml);
			if (treeNode.Key == "") {
				continue;
			}
			if ($[treeNode.ParentKey]) {
				continue;
			}
			nodes.push(treeNode);
			o1[treeNode.Key] = treeNode;
		}
		if (nodes.length == 0) {
			return;
		}
		var n0 = this.GetNodeById(nodes[0].ParentKey);
		if (n0 == null)
			return;

		o1[n0.Key] = n0;
		for (var i = 0; i < nodes.length; i += 1) {
			var p = o1[nodes[i].ParentKey];
			p.AddChild(nodes[i]);
		}

		n0.GetObject().setAttribute("EWA_TREE_MORE", "0");
		n0.IsMoreChildren = false;
		for (var i = 0; i < n0.Children.length; i += 1) {
			this.Create(n0.Children[i]);
		}
		n0.NodeShow(true);
		this.ShowNode(this.PostChangeKey);
	};

	/**
	 * 加载节点
	 * 
	 * @param {String}
	 *            xmlString
	 */
	this.LoadChildrenAfter = function(xmlString) {
		var xml = new EWA.C.Xml();
		xml.LoadXml(xmlString);
		var nl = xml.GetElements("FrameData/Row");
		if (nl == null || nl.length == 0) {
			return;
		}
		var firstNode = this.GetNodeById(this.PostChangeKey);

		var oNodes = new Object();
		oNodes[firstNode.Key] = firstNode;
		var parentNodes = new Array();
		var parentNodesTable = {};
		for (var i = 0; i < nl.length; i = 1 + i) {
			var treeNode = this._CreateNodeFromXml(nl[i], xml);
			if (treeNode.Key == "EWA_TREE_ROOT") {
				continue;
			}
			if (treeNode.ParentKey == null || treeNode.ParentKey == "") {
				treeNode.ParentKey = firstNode.Key;
			}
			oNodes[treeNode.Key] = treeNode;
			var pkey = treeNode.ParentKey;
			if (oNodes[pkey] != null) {
				oNodes[pkey].AddChild(treeNode);
			}
		}
		if (firstNode.Children.length > 0) {
			for (var i = 0; i < firstNode.Children.length; i = 1 + i) {
				this.Create(firstNode.Children[i]);
			}
		}
		firstNode.NodeShow(true);
	};

	/**
	 * 从XML文件中生成节点
	 * 
	 * @param {Object}
	 *            node
	 * @param {Object}
	 *            xml
	 * @return {EWA_TreeNodeClass} treeNode
	 */
	this._CreateNodeFromXml = function(node, xml) {
		var treeNode = new EWA_TreeNodeClass();
		treeNode.ewa = this;
		treeNode.Key = xml.GetElementAttribute(node, "Key");
		treeNode.ParentKey = xml.GetElementAttribute(node, "ParentKey");
		treeNode.Text = xml.GetElementAttribute(node, "Text");
		treeNode.IsMoreChildren = xml.GetElementAttribute(node,
			"IsMoreChildren") == "1" ? true : false;
		treeNode.MenuGroup = xml.GetElementAttribute(node, "MenuGroup");
		for (var i = 0; i < 3; i += 1) {
			treeNode.AddParas[treeNode.AddParas.length] = xml
				.GetElementAttribute(node, "AddPara" + i);
		}
		return treeNode;
	};

	/**
	 * 修改节点名称
	 * 
	 * @param obj
	 *            节点的对象
	 * @param actionCommand
	 *            节点调用的命令体
	 * @param nodeText
	 *            节点名称的测试表达式
	 * @param infoName
	 *            试不成功的提示信息
	 */
	this.Rename = function(obj, actionCommand, nodeRegex, infoName) {
		if (obj == null) {
			obj = this._LastFocus;
		}
		if (obj == null) {
			return;
		}
		this._RenameActionCmd = actionCommand;
		this._RenameRegex = nodeRegex;
		this._RenameInfo = infoName;
		this._RenameNode = obj.tagName == 'TREE_NODE' ? obj : this.GetNode(obj);
		if (this._RenameNode.Key == 'EWA_TREE_ROOT') {
			this._RenameNode = null;
			return;
		}
		var tb = this._RenameNode.GetObject();
		var oNode = tb.rows[0].cells[tb.rows[0].cells.length - 1].childNodes[0];
		var oldVal = GetInnerText(oNode);
		oNode.style.display = "none";
		var oInput = this._GetInput();
		oNode.parentNode.appendChild(oInput);
		oInput.value = oldVal;
		oInput.setAttribute("EWA_OLD_VAL", oldVal);
		oInput.style.width = "300px";
		oInput.focus();
	};

	/**
	 * 获取输入框
	 */
	this._GetInput = function() {
		var ipts = this.ParentObject.getElementsByTagName('INPUT');
		for (var i = ipts.length - 1; i >= 0; i--) {
			var ipt = ipts[i];
			if (ipt.getAttribute('onblur') && ipt.getAttribute('onblur').indexOf('RenameBlur(') > 0) {
				this._InputDiv = ipt.parentNode;
				// console.log(ipt)
				return ipt;
			}
		}
	};

	/**
	 * 修改节点名称离开输入框焦点后事件
	 * 
	 * @param obj
	 *            输入框
	 */
	this.RenameBlur = function(obj) {
		let t0 = this._RenameBlurT0 || 0;
		let t1 = (new Date()).getTime();
		if (t1 - t0 < 100) {
			// 阻止多重调用
			return;
		}
		this._RenameBlurT0 = t1;

		var oldVal = obj.getAttribute("EWA_OLD_VAL");
		var node = this._RenameNode;
		var pNode = this.GetNode(node.GetObject().parentNode);
		for (var i = 0; i < pNode.Children.length; i += 1) {
			var c1 = pNode.Children[i];
			if (c1.Key != node.Key && c1.Text.trim() == obj.value.trim()) {
				alert(_EWA_EVENT_MSG["OnTreeNodeNameRepeat"]);
				obj.focus();
				return;
			}
		}
		//
		var oNode = obj.parentNode.childNodes[0];
		this._InputDiv.appendChild(obj);
		oNode.style.display = "";
		if (node.RenameType != "NEW" && (oldVal == obj.value)) {
			return;// 名称没有变化
		}

		oNode.innerHTML = obj.value;
		var cmd = this._RenameActionCmd;
		if (cmd == null) {
			var cmd = new EWA.F.Cmd();
		}
		if (cmd.EWA_ACTION == null || cmd.EWA_ACTION.trim() == "") {
			if (node.RenameType == "NEW") {// new item
				cmd.EWA_ACTION = "OnTreeNodeNew"; // 默认的Action
			} else {
				cmd.EWA_ACTION = "OnTreeNodeRename"; // 默认的Action
			}
		}
		if (node.RenameType == "NEW") {// new item
			if (cmd.EWA_AFTER_EVENT == "") {
				// 执行完后在页面执行的脚本, 修改Id,addpara,menu_group等
				cmd.EWA_AFTER_EVENT = 'EWA.F.FOS["' + this._Id
					+ '"].NewNodeAfter;';
			}
			var nodeParent = this.GetNode(node.GetObject().parentNode);
			cmd.EWA_TREE_PARENT_KEY = nodeParent.Key;
		}
		cmd.EWA_TREE_TEXT = obj.value;
		cmd.EWA_TREE_KEY = node.Key;
		this._PostChange(cmd);
		this._RenameActionCmd = null;
	};

	/**
	 * 重命名键判断
	 * 
	 * @param {Object}
	 *            evt
	 * @param {Object}
	 *            obj
	 */
	this.RenameKeyDown = function(evt, obj) {
		var code = evt.keyCode ? evt.keyCode : evt.which;
		if (code == 13) {// enter
			this.RenameBlur(obj);
		}
		if (code == 27) {// esc
			var oldVal = obj.getAttribute("EWA_OLD_VAL");
			obj.value = oldVal;
			this.RenameBlur(obj);
		}
	};

	/**
	 * 删除节点
	 * 
	 * @param isDeep
	 *            是否鉴别是否存在子节点
	 * @param actionCommand
	 *            删除调用的actionCommand
	 */
	this.Delete = function(isDeep, actionCommand) {
		var node = this.GetNode(this._LastFocus);
		if (node == null || node.Key == 'EWA_TREE_ROOT') {
			return;
		}
		if (!window.confirm(_EWA_EVENT_MSG["OnTreeNodeDelete"])) {
			return;
		}
		if (!isDeep && (node.Children.length > 0 || node.IsMoreChildren)) {
			node.NodeShow(true);
			alert(_EWA_EVENT_MSG["OnTreeNodeDeleteHaveChildren"]);
			return;
		}
		var cmd = actionCommand;
		if (cmd == null) {
			cmd = new EWA.F.Cmd();
			cmd.EWA_ACTION = "OnTreeNodeDelete";
		}
		if (cmd.EWA_AFTER_EVENT == "") {
			cmd.EWA_AFTER_EVENT = 'EWA.F.FOS["' + this._Id
				+ '"].DeleteAfter();';
		}
		cmd.EWA_TREE_KEY = node.Key;
		this._PostChange(cmd);
	};
	// 删除指定ID的节点，无论是否有子节点，不提交后台
	this.DeleteNoConfirmById = function(id, evt) {
		if(evt){
			evt.cancelBubble = true;
			evt.stopPropagation();
		}
		var node = this.GetNodeById(id);
		if (node == null || node.Key == 'EWA_TREE_ROOT') {
			return;
		}
		this._LastFocus = node.GetObject();
		this.DeleteAfter();
	};
	this.DeleteAfter = function() {
		var node = this.GetNode(this._LastFocus);
		var tbNode = node.GetObject();
		var tbParent = tbNode.parentNode;
		tbParent.removeChild(tbNode);
		var nodeParent = this.GetNode(tbParent);
		if (nodeParent.Children.length == 0) {
			var nodeParentParent = this
				.GetNode(nodeParent.GetObject().parentNode);
			if (nodeParentParent.ChildLast.Key == nodeParent.Key) {
				nodeParent.NodeCrossEnd(true);
			} else {
				nodeParent.NodeCross(true);
			}
		} else {
			nodeParent.ChildLast.NodeCrossEnd();
		}
		this._LastFocus = null;
	};
	/**
	 * 新节点
	 * 
	 * @param nodeText
	 *            新节点的文字
	 * @param actionCommand
	 *            新节点调用的actionCommand
	 * @param nodeText
	 *            新节点名称的测试表达式
	 * @param infoName
	 *            测试不成功的提示信息
	 */
	this.NewNode = function(nodeText, actionCommand, nodeRegex, infoName) {
		if (this._LastFocus == null) {
			return;
		}
		this._NewNodeTemp = {
			TEXT: nodeText,
			CMD: actionCommand,
			REGEX: nodeRegex,
			INFO: infoName
		};

		var nodeParent = this.GetNode(this._LastFocus);
		nodeParent.NodeShow(true);
		if (this.IsPostChange) { // 调用更多子节点
			this._NewNodeTimer = window.setInterval(function() {
				if (EWA.CurUI.IsPostChange) {
					return;
				}
				window.clearInterval(EWA.CurUI._NewNodeTimer);
				EWA.CurUI._NewNode();
			}, 100);
		} else {
			this._NewNode();
		}
	};

	this._NewNode = function() {
		var nodeText = this._NewNodeTemp.TEXT;
		var actionCommand = this._NewNodeTemp.CMD;
		var nodeRegex = this._NewNodeTemp.REGEX;
		var infoName = this._NewNodeTemp.INFO;
		this._NewNodeTemp = null;

		var node = new EWA_TreeNodeClass();
		node.ewa = this;
		this._CurNewNode += 1;
		node.Key = "NEW_NODE_" + this._Id + "__" + this._CurNewNode;
		node.RenameType = "NEW";
		var txt = _EWA_EVENT_MSG["OnTreeNodeNew"] + this._CurNewNode;
		if (nodeText != null && nodeText.trim().length > 0) {
			txt = nodeText.trim();
		}
		node.Text = txt;

		var nodeParent = this.GetNode(this._LastFocus);
		if (nodeParent.Children.length > 0) {
			var prevIndex = nodeParent.Children.length - 1;
			var nodePerv = nodeParent.Children[prevIndex];
			nodePerv.NodeCross();// 将最后一个节点修改为交叉线
		}
		nodeParent.AddChild(node);
		this.Create(node);
		nodeParent.NodeShow(true);
		this.Rename(node, actionCommand, nodeRegex, infoName);
	}

	/**
	 * 新节点调用后执行
	 * 
	 * @param newId
	 *            新节点的ID
	 * @param parameters
	 *            新节点调用的附加参数, 用“,”分割
	 * @param menuGroup
	 *            新节点菜单组
	 */
	this.NewNodeAfter = function(newId, parameters, menuGroup) {
		var id = "NEW_NODE_" + this._Id + "__" + this._CurNewNode;
		var node = this.GetNodeById(id);
		node.SetKey(newId);
		node.SetAddParameters(parameters == null ? "" : parameters);
		node.SetMenuGroup(menuGroup == null ? "" : menuGroup);
		var c = this.TestIcon(node);
		node.SetBookIcon(c);
	};
	/**
	 * 根据ID获取节点(Node)
	 * 
	 * @param id
	 *            节点的Key
	 */
	this.GetNodeById = function(id) {
		var obj = $('#EWA_TREE_' + this._Id + ' .ewa-tree-node[id="' + id + '"]');
		if (obj.length == 0) {
			return null;
		}
		return this.GetNode(obj[0]);
	};
	/**
	 * 获取焦点节点
	 */
	this.GetFocusNode = function() {
		return this.GetNode(this._LastFocus);
	}
	/**
	 * 根据对象获取节点(Node)
	 * 
	 * @param obj
	 *            节点下的任意DOM对象
	 */
	this.GetNode = function(obj) {
		if (obj == null || obj.tagName == null) {
			return null;
		}
		var o1 = obj;
		var inc = 0;
		// EWA_T 表示是节点的表标记
		while (!(o1.tagName == "TABLE" && (o1.getAttribute("EWA_T") == "1") || o1.id == "EWA_TREE_ROOT")) {
			o1 = o1.parentNode;
			inc++;
			if (inc > 33) {
				return null;
			}
			if (o1.tagName == "BODY") {
				return null;
			}
		}
		var node = new EWA_TreeNodeClass();
		node.ewa = this;

		node.Key = o1.id;
		node.MenuGroup = o1.getAttribute("EWA_MG");
		node.Object = o1;
		var oNodeTd = o1.rows[0].cells[2];
		node.Text = GetInnerText(oNodeTd);
		for (var i = 0; i < 3; i += 1) {// 附加参数
			node.AddParas[i] = oNodeTd.childNodes[0].getAttribute("EWA_P" + i);
		}
		var moreChild = o1.getAttribute("EWA_TREE_MORE");
		node.IsMoreChildren = moreChild == "1" ? true : false;
		if (o1.rows.length > 1) {
			var td = o1.rows[1].cells[o1.rows[1].cells.length - 1];
			for (var i = 0; i < td.childNodes.length; i = 1 + i) {
				var chd = td.childNodes[i];
				if (chd.nodeType == 3) {
					continue;
				}
				if (chd.tagName == 'TABLE' && chd.getAttribute("EWA_T") == "1") {
					node.Children.push(this.GetNode(chd));
				}
			}
			if (node.Children.length > 0) {
				node.ChildLast = node.Children[node.Children.length - 1];
			}
		}

		return node;
	};

	//
	this.Click = function(evt, notRunCmd) {
		if (this.IsPostChange) {
			return;
		}
		EWA.CurUI = this;
		var obj = evt.srcElement ? evt.srcElement : evt.target;
		if (obj.tagName == "INPUT") {
			return;
		}
		if (obj.tagName == 'DIV') {
			obj = obj.parentNode;
		}
		if (obj.tagName == "TD" && obj.className.indexOf("TD00") == 0) {
			var node = this.GetNode(obj);
			node.NodeShow();
			return;
		}
		while (!(obj.tagName == "SPAN" && (obj.getAttribute("EWA_CMD") != null) || obj
			.getAttribute('EWA_TREE_TOP') == '1')) {
			obj = obj.parentNode;
			if (obj.tagName == "BODY") {
				return;
			}
		}
		var node = this.GetNode(obj);
		if (obj.tagName == "SPAN"
			&& (obj.getAttribute("EWA_CMD") != null || obj
				.getAttribute('EWA_TREE_TOP') == '1')) {
			if (this._LastFocus != null) {
				var lastNode = this.GetNode(this._LastFocus);
				lastNode.Mark(false);
				this._LastFocus = null;
			}
			if (obj.getAttribute('EWA_TREE_TOP') != '1') {
				node.Mark(true);
			}
			this._LastFocus = obj;
			if (!notRunCmd) {// 非右键
				if (this.Url.toUpperCase().indexOf('EWA_TREE_SKIP_GET_STATUS') < 0) {
					EWA.F.ST.SaveStatus(node.Key, 'TREE');
				}
				this._RunCmd(node);// 执行cmd
			} else {
				return obj;
			}
			this.MoveNode(node.GetObject());
		}
		node = null;
	};
	this._RunCmd = function(node) {
		var nodeParent = this.GetNode(node.GetObject().parentNode);
		if (this.link) {
			// 本身定义了连接方式，新增加 20190226 郭磊
			// 建议采用新的方式
			this.link(node.Key, node);
		} else {
			// 传统的调用方式
			console
				.warn('建议采用定义 EWA.F.FOS["xx"].link = function(nodeKey, node){}');
			var cmd = "link(\""
				+ node.Key
				+ "\",\""
				+ nodeParent.Key
				+ "\",\""
				+ node.Text.replace(/\n/mig, '\\n').replace(/\r/mig, '\\r')
					.replace(/\"/mig, '&quot;') + "\"";
			for (var i = 0; i < node.AddParas.length; i += 1) {
				if (node.AddParas[i] == null) {
					cmd += ",null";
				} else {
					cmd += ",\"" + node.AddParas[i] + "\"";
				}
			}
			cmd += ");";
			EWA.C.Utils.RunCmd(cmd);// 执行cmd
		}
	}
	this.ShowMenu = function(evt) {
		EWA.CurUI = this;
		var obj = this.Click(evt, true);
		if (this.Menu != null && obj != null) {
			var node = this.GetNode(obj);
			this.Menu.ShowByMouse(evt, node.MenuGroup);
		}
	};
	/**
	 * 测试图标
	 * 
	 * @param {EWA_TreeNodeClass}
	 *            node
	 * @return {String}
	 */
	this.TestIcon = function(node) {
		if (this.Icons == null) {
			return "TD01A";
		}
		for (var a in this.Icons) {
			var b = this.Icons[a];
			var val = null;
			switch (b.TEST.toUpperCase()) {
				case 'KEY':
					val = node.Key;
					break;
				case 'PARENTKEY':
					val = node.Parent.Key;
					break;
				case 'TEXT':
					val = node.Text;
					break;
				case 'P0':
					val = node.AddParas[0];
					break;
				case 'P1':
					val = node.AddParas[1];
					break;
				case 'P2':
					val = node.AddParas[2];
					break;
				case 'MG':
					val = node.MenuGroup;
					break;
			}
			if (val == null) {
				continue;
			}
			var c = eval('/' + b.FILTER + '/ig');
			if (c.test(val)) {
				return b.NAME + "A";
			}
		}
		return "TD01A";

	}
	/**
	 * 
	 * @param {EWA_TreeNodeClass}
	 *            node
	 */
	this.Create = function(node, callback) {
		if (node == null) {
			return;
		}
		if (node.Parent == null) {
			this._CreateFirst(node);
			return;
		}
		var html = this._HtmlTemplate
			.replace("[ID]", "id=\"" + node.Key + "\"");

		// 附加的字段 2019-03-26
		var addColsHtml = this.AddCols || "";
		html = html.replace("[TEMP_NODE_ADD_FIELDS]", addColsHtml);

		var paras = "";
		for (var i = 0; i < node.AddParas.length; i += 1) {
			if (node.AddParas[i]) {
				let v = node.AddParas[i] + ""; //避免数字造成替换出错
				paras += "EWA_P" + i + "=\"" + v.replace(/"/ig, "&quot;").replace(/</ig, "&lt;").replace(/</ig, "&gt;") + "\" ";
			}
		}
		html = html.replace("[TMP_ADD_PARAS]", paras);
		html = html.replace("[EWA_MENU_GROUP]", node.MenuGroup);
		var icon = this.TestIcon(node);
		html = html.replace("[B]", icon);
		html = html.replace("[C]", node.Text);
		if (node.IsMoreChildren) {
			html = html.replace("[EWA_MORE_CHILDREN]", "EWA_TREE_MORE='1'");
		} else {
			html = html.replace("[EWA_MORE_CHILDREN]", "");
		}
		if (node.Children.length > 0 || node.IsMoreChildren) {
			html = html.replace("[A]", "TD00A");
			if (node != node.Parent.ChildLast) {
				html = html.replace("[A1]", "TD10B");
			} else {
				html = html.replace("[A1]", "TD10A");
			}
		} else {
			if (node == node.Parent.ChildLast) {
				html = html.replace("[A]", "TD00D");
			} else {
				html = html.replace("[A]", "TD00C");
			}
		}
		var objParent = node.Parent.GetObject();
		if (objParent.rows.length == 1) {
			var tr = objParent.insertRow(-1);
			tr.insertCell(-1);
			tr.insertCell(-1);
			tr.cells[1].colSpan = 2;
		}
		// 节点所在的级别
		var parentLvl = this.GetNodeLvl(node.Parent);
		html = html.replace("[LVL]", parentLvl + 1);

		this._TempNode.innerHTML = html;
		// 新创建的对象
		var newNodeTable = this._TempNode.childNodes[0];
		objParent.rows[1].cells[objParent.rows[1].cells.length - 1]
			.appendChild(newNodeTable);
		if (objParent.parentNode.childNodes[objParent.parentNode.childNodes.length - 1] != objParent) {
			objParent.rows[1].cells[0].className = "TD10B";
		}

		node.Parent.NodeShow(true);
		if (callback) {
			callback(newNodeTable, this);
		}
		for (var i = 0; i < node.Children.length; i += 1) {
			this.Create(node.Children[i], callback);
		}
	};
	/**
	 * 获取此node所在的级别
	 */
	this.GetNodeLvl = function(node) {
		var n = node;
		if (node.Object.getAttribute('tree_lvl')) {
			// 增加了 tree_lvl属性在 tree node上，避免添加多个子项目是重复执行造成严重的延时
			return node.Object.getAttribute('tree_lvl') * 1;
		}
		for (var i = 0; i < 100; i++) {
			var p = this.GetParentNode(n);
			if (p == null) {
				node.Object.setAttribute('tree_lvl', i + 1);
				return i + 1;
			} else {
				n = p;
			}
		}
	};
	this._CreateFirst = function(nodeFirst, callback) {
		var html = this._HtmlTemplate1.replace("[ID]", "id='" + nodeFirst.Key
			+ "'");
		html = html.replace("[B]", nodeFirst.Text);
		this.ParentObject.innerHTML = html;
		for (var i = 0; i < nodeFirst.Children.length; i += 1) {
			this.Create(nodeFirst.Children[i], callback);
		}
	};
	this.Init = function(xmlString) {
		var xml = new EWA.C.Xml();
		xml.LoadXml(xmlString);
		this.Resources = new EWA_FrameResoures();
		this.Resources.Init(xml);
		// 如果EWA_TREE_INIT_KEY存在则表示已经设定初始化值，不用调用上次状态
		if (this.Url.toUpperCase().indexOf('EWA_TREE_INIT_KEY') == -1) {
			if (this.Url.toUpperCase().indexOf('EWA_TREE_SKIP_GET_STATUS') > 0) {
				return;
			}
			// 获取上次点击的节点
			EWA.F.ST.GetStatus('TREE', this);
		}
	};
	this.LoadStatus = function() {
		EWA["SHOW_ERROR"] = false; // 不提示执行错误，避免误报
		this.ShowNode(_EWA_STATUS_VALUE);
	};
	/**
	 * 初始化显示节点
	 * 
	 * @param {String}
	 *            id
	 */
	this.ShowNode = function(id) {
		if (id == null || id == '' || id == 'EWA_TREE_ROOT') {
			return;
		}
		var node = this.GetNodeById(id);
		if (node == null) {
			var cmd = new EWA.F.Cmd();
			cmd.EWA_ACTION = "OnTreeNodeStatus";
			cmd.EWA_TREE_KEY = this.Key;
			cmd.EWA_AJAX = "XML";
			cmd.EWA_TREE_KEY = id;
			cmd.EWA_TREE_STATUS = "1";
			this._PostChange(cmd);
			return;
		} else {
			this._StatusNode = node;
			this.ShowNodeA();
		}
	}
	this.ShowNodeA = function() {
		var node = this._StatusNode;
		this._StatusNode = null;

		var p = node.GetObject().parentNode;
		var np = this.GetNode(p);
		while (np.Key != 'EWA_TREE_ROOT') {
			np.NodeShow(true);
			np = this.GetNode(np.GetObject().parentNode);
		}
		node.Mark(true);
		this._LastFocus = node.GetObject();
		this._RunCmd(node);
		window.setTimeout(function() {
			p.focus();
		}, 0);
	};

	this.getUrlClass = function() {
		var u = new EWA_UrlClass();
		u.SetUrl(this.Url);
		return u;
	};
	this.Reload = function() {
		// for EWA_Behavior.RELOAD_PARENT
	};
	// mv = new EWA.UI.Move();
	// mv.Init(mv);
	// mv.AddMoveObject(this._MoveNode);
}

/**
 * 初始化的Tree默认点击事件，仅显示信息，通过重写覆盖改方法
 * 
 * @param key
 *            主键
 * @param parentKey
 *            父键
 * @param text
 *            显示文本
 * @param addPara1
 *            附加参数一
 * @param addPara2
 *            附加参数二
 * @param addPara3
 *            附加参数三
 */
function EWA_Treelink(key, parentKey, text, addPara1, addPara2, addPara3) {
	var s1 = "key=" + key + "\r\nparentKey=" + parentKey + "\r\ntext=" + text
		+ "\r\naddPara1=" + addPara1 + "\r\naddPara2=" + addPara2
		+ "\r\naddPara3=" + addPara3;
	s1 += "\r\n\r\n您需要覆盖这个方法\r\nlink(key, parentKey, text, addPara1, addPara2, addPara3)";
	alert(s1);
}

if (typeof link == 'undefined') {
	link = EWA_Treelink;
}

/* Tree */
EWA.F.T = {
	CUR: null,
	C: EWA_TreeClass,
	Node: EWA_TreeNodeClass
};
