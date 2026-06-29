function EWA_ColorMark(colorType, object) {
	this._ColorType = colorType.toUpperCase();
	this._Object = object;
	this.Select = document.createElement("div");
	this._LastValue = "";
	this._KeyUpEvent = true;
	this._Undo = new Array();
	this._Redo = new Array();
	this._Keys=[];
	this._Init = function() {
		var s1 = "<select onkeydown='if (event.keyCode == 13){";
		s1 += "sel.text = this.options[this.selectedIndex].value;editor.replaceSelection(this.options[this.selectedIndex].value);";
		s1 += "this.parentNode.style.display=\"none\";_EWA_COLOR_MARK_WND._Object.focus();";
		s1 += "}else if(event.keyCode == 27 || event.keyCode == 8){this.parentNode.style.display=\"none\";_EWA_COLOR_MARK_WND._Object.focus();}' size=6>";
		s1 += "</select>";
		document.body.appendChild(this.Select);
		this.Select.innerHTML = s1;
		_EWA_COLOR_MARK_WND = this;
	};
	this.KeyDown = function(evt) {
		var e = evt ? evt : event;
		var code = e.keyCode;
		if (EWA.B.IE) {
			sel = this._Object.ownerDocument.selection.createRange();
		} else {
			sel = this._Object.ownerDocument.defaultView.getSelection()
					.getRangeAt(0);
		}
		var left = sel.offsetLeft;
		var top = sel.offsetTop;
		// var o1 = window.parent.document.getElementById('aaa');
		// o1.innerHTML = "U=" + this._Undo.length + ", T=" + left + ", L=" +
		// top + ", C=" + code;
		switch (code) {
			case 83 : // s
				if (!e.altKey) {// ctrl
					break;
				}
				window.parent.ok();
			case 90 : // z
				if (!e.ctrlKey) {// ctrl
					break;
				}
				if (this._Undo.length > 0) {
					var s1 = this._Undo.pop();
					while (this._Object.innerHTML == s1) {
						s1 = this._Undo.pop();
					}
					if (s1 != null) {
						this._Object.innerHTML = s1;
						sel.moveToPoint(left, top);
						sel.select();
						this._Object.focus();
						this._KeyUpEvent = false;
					}
				}
				e.returnValue = false;
				break;
			case 9 : // tab
				if (EWA.B.IE) {
					if (sel.getClientRects().length > 1) {
						var tmp = sel.duplicate();
						tmp.moveToElementText(this._Object);
						tmp.setEndPoint('EndToEnd', sel);
						sel.text = "&nbsp;&nbsp;"
								+ sel.text.replace(/\r\n/g, "\r&nbsp;&nbsp;");
						tmp.moveStart("character", tmp.text.length
										- sel.text.length);
						tmp.setEndPoint("EndToStart", sel);
						tmp.select();
					} else {
						sel.text = "&nbsp;&nbsp;";
						sel.select();
					}
					e.returnValue = false;
				} else {
					var aa = sel.startContainer.parentNode;
					if (sel.collapsed) {
						aa.innerHTML = '&nbsp;&nbsp;' + aa.innerHTML;
					} else {
						do {
							if (aa.nodeType != 3) {
								aa.innerHTML = '&nbsp;&nbsp;' + aa.innerHTML;
							}
							if (aa == sel.endContainer.parentNode) {
								break;
							}
							aa = aa.nextSibling;
						} while (aa != null)
					}
				}
				break;
			case 13 : // enter
				if (EWA.B.IE) {
					var sel2 = document.selection.createRange();
					sel2.moveStart("character", -99999);
					var s1 = sel2.text;
					var s2 = s1.split("\r\n");
					var s3 = s2[s2.length - 1];
					var s4 = "";
					for (var i = 0; i < s3.length; i += 1) {
						if (s3.substring(i, i + 1) == "&nbsp;") {
							s4 += "&nbsp;";
						} else {
							break;
						}
					}
					if (s4.length > 0) {
						sel.text = "\n" + s4;
						e.returnValue = false;
					}
				} else {

				}
				break;
		}
		this._LastKeyCode = code;
	};
	this.KeyUp = function(evt) {
		if (!this._KeyUpEvent) {
			this._KeyUpEvent = true;
			return;
		}
		var e = evt ? evt : event;
		window._OBJ_ = e.srcElement ? e.srcElement : e.target;
		var code = e.keyCode;
		var sel2 = EWA.B.IE ? document.selection.createRange() : window
				.getSelection().getRangeAt(0);
		var left = sel2.offsetLeft;
		var top = sel2.offsetTop;
		if (code == 190) { // .
			this.ShowFunction(left, top);
		}else{
			this._Keys.push(code)
		}
		return;
		if (code == 190111 || code == 32 || code == 57 || code == 13111) {
			var html = this.MarkColor(this._GetEditText());
			if (EWA.B.IE) {
				this._Object.innerHTML = html;
				var rng = this._Object.ownerDocument.selection.createRange();
				rng.moveToPoint(left, top);
				rng.select();
			} else {
				sel = window.getSelection();
				var aaa = sel.getRangeAt(0);
				var node = sel.anchorNode;
				var cnt = document.getElementById('content');
				var n1 = node;
				var s0 = aaa.startContainer.nodeValue.substring(0,
						aaa.startOffset);
				var s1 = "";
				do {
					var n2 = n1.previousSibling
					while (n2 != null) {
						s1 = n2.textContent + '\n' + s1;
						n2 = n2.previousSibling;
					}
					n1 = n1.parentNode;
				} while (n1 != this._Object);
				var off = sel.anchorOffset;
				this._Object.innerHTML = html;
				this._FireFoxFoundSelectionObj(this._Object, s1, s0);
				var ss1 = window.getSelection();
				ss1.collapse(this._FfObj, off);
				ss1.collapseToEnd();
			}
		}
		var nowVal = this._Object.innerText;
		if (this._LastValue != nowVal) {
			this._Undo.push(this._Object.innerHTML);
			this._LastValue = nowVal;
		}
	};
	this._FireFoxFoundSelectionObj = function(obj, s2, s1) {
		s3 = s2.split('\n');
		// p-> nobr -> #text
		this._FfObj = obj.childNodes[s3.length - 1].childNodes[0].childNodes[0];
	}
	this._GetEditText = function() {
		if (EWA.B.IE) {
			return this._Object.innerText;
		}
		var s2 = "";
		for (var i = 0; i < this._Object.childNodes.length; i++) {
			var o = this._Object.childNodes[i];
			if (o.nodeType != 3) {
				s2 += o.textContent + '\n';
			}
		}
		return s2;
	}
	this.ShowFunction = function(left, top) {
		var token = this._GetToken();
		token = token.replace(/&nbsp;/ig, "");
		if (window.parent == null || window.parent.EWA_FUN == null
				|| window.parent.EWA_FUN.FunctionTable == null) {
			return;
		}
		var ft = window.parent.EWA_FUN.FunctionTable;
		var c = /EWA.F.FOS\[.*\]/ig;
		var t = token.substring(0, token.length - 1);
		t = t.replace(c, window.parent.EWA_FUN.Tag);
		t = t.toUpperCase();
		// window.parent.aaa.innerText = window.parent.EWA_FUN.Tag + "," + t;
		var f = ft[t];
		if (f != null && f.Properites.length > 0) {
			sel = document.selection.createRange();
			this.Select.style.position = "absolute";
			this.Select.style.left = left + "px";
			this.Select.style.top = top + "px";
			this.Select.style.display = "";
			if (this.Select.childNodes.length == 0) {
				this._Init();
			} else {
				this.Select.childNodes[0].options.length = 0;
			}
			for (var i = 0; i < f.Properites.length; i += 1) {
				var b = f.Properites[i];
				var v = b.Name;
				if (b.Parameters.length > 0) {
					v += b.Parameters;
				}
				this.Select.childNodes[0].options[i] = new Option(b.Name
								+ "   " + b.Type, v);
			}
			this.Select.childNodes[0].focus();
		}
	};
	this._GetToken = function() {
		var sel = this._Object.ownerDocument.selection.createRange();
		sel.moveStart("character", -99999);

		// token由连续字母数字、下划线、点号、括号、引号构成
		var tokens = sel.text.split(/[\s\+\-\*\/]/);
		return tokens[tokens.length - 1];
	};
	this.MarkColor = function(s1) {
		switch (this._ColorType) {
			case "JS" :
			case "JSCRIPT" :
				return this.MarkJs(s1);
			case "HTML" :
				return this.MarkHtml(s1);
			case "SQL" :
				return this.MarkSql(s1);
			case "CLASS" :
				return this.MarkClass(s1);
			default :
				return s1;
		}
	};
	this.ReplaceEnter = function(s1) {
		var mm = /\r\n/ig;
		var s2 = s1.replace(mm, "\n");
		return s2;
	};
	this.MarkJs = function(s1) {
		var mm = /&/ig;
		var m0 = />/ig;
		var m1 = /</ig;
		var m2 = / /ig;
		var m3 = /\r\n|\r|\n/ig;
		var m4 = /&lt;(\w+)/ig;
		var m5 = /&lt;\/(\w+)/ig;
		var m6 = /"([^"]*)"/ig;
		var m6a = /'([^']*)'/ig;
		var m7 = /\t/g;
		var mjs = /\b(function|indexOf|replace|$|continue|break|return|var|new|this|if|else|do|while|for|length)\b/g;
		var mjs1 = /\b(getElementsByTagName|parentNode|innerHTML|alert|document|window|getElementById|body|innerHTML|getAttribute|setAttribute|location|confirm|forms|frames|insertCell|insertRow)\b/g;
		var mmemo = /(\/\/.+\r\n)/ig;
		var s2 = s1.replace(mm, "&amp;");
		s2 = s2.replace(m0, "&gt;");
		s2 = s2.replace(m1, "&lt;");
		s2 = s2.replace(m2, "&nbsp;");
		s2 = s2.replace(m4, "&lt;<font color=darkred>$1</font>");
		s2 = s2.replace(m5, "&lt;/<font color=darkred>$1</font>");
		s2 = s2.replace(m6, "\"<font color=red>$1</font>\"");
		s2 = s2.replace(m6a, "'<font color=red>$1</font>'");
		s2 = s2.replace(mmemo, "<font color=gray>$1</font>");
		s2 = s2.replace(m3, "</nobr></p><p><nobr>");
		s2 = s2.replace(m7, "&nbsp;&nbsp;&nbsp;&nbsp;");
		s2 = s2.replace(mjs, "<font color=blue>$1</font>");
		s2 = s2.replace(mjs1, "<font color=green><b>$1</b></font>");
		s2 = "<p><nobr>" + s2 + "</nobr></p>";
		s2 = s2.replace(m3, "");
		return s2;
	};
	this.MarkHtml = function(s1) {
		var blank = /<TBODY>|<\/TBODY>/ig;
		s1 = s1.replace(blank, "");
		// var zzz = /></ig;
		// s1 = s1.replace(zzz, ">\r\n<");
		var mm = /&/ig;
		var m0 = />/ig;
		var m1 = /</ig;
		var m2 = / /ig;
		var m3 = /\r\n|\r|\n/ig;
		var m4 = /&lt;(\w+)/ig;
		var m5 = /&lt;\/(\w+)/ig;
		var m6 = /"([^"]*)"/ig;
		var m6a = /'([^']*)'/ig;
		var m7 = /\t/g;
		var mjs = /\b(id|valign|src|title|cellpadding|cellspacing|class|COLSPAN|rowspan|align|type|onclick|res|value|size|style|width|height|bgcolor|border)\b/ig;
		var mmemo = /(\/\/.+\r\n)/ig;
		var s2 = s1.replace(mm, "&amp;");
		s2 = s2.replace(m0, "&gt;");
		s2 = s2.replace(m1, "&lt;");
		s2 = s2.replace(m2, "&nbsp;");
		s2 = s2.replace(m4, "&lt;<font color=darkred>$1</font>");
		s2 = s2.replace(m5, "&lt;/<font color=darkred>$1</font>");
		s2 = s2.replace(m6, "\"<font color=red>$1</font>\"");
		s2 = s2.replace(m6a, "'<font color=red>$1</font>'");
		s2 = s2.replace(mmemo, "<font color=gray>$1</font>");
		s2 = s2.replace(m3, "</nobr></p><p><nobr>");
		s2 = s2.replace(m7, "&nbsp;&nbsp;");
		s2 = s2.replace(mjs, "<font color=blue>$1</font>");
		s2 = "<p><nobr>" + s2 + "</nobr></p>";

		s2 = s2.replace(m3, "");
		return s2;
	};
	this.MarkSql = function(s1) {
		var m0 = />/ig;
		var m1 = /</ig;
		var m2 = /\b(WHERE|LEFT|INNER|JOIN|RIGHT|OUTER|AS|OUTER|FULL|IS|EXISTS|UPDATE|DELETE|FROM|SELECT|INSERT|INTO|SET|VALUES|IN|ON|OR|AND|GROUP|ORDER|BY|NULL|CASE|WHEN|BEGIN|END|EXISTS|IF|IS|NOT)\b/ig;
		var m3 = /\r\n|\r|\n/ig;
		var m4 = / /ig;
		var m5 = /(@\w+)/ig;
		var m6a = /'([^']*)'/ig;
		var m7 = /\t/g;
		var s2 = s1.replace(m0, "&gt;");
		s2 = s2.replace(m1, "&lt;");
		s2 = s2.replace(m3, "</nobr></p><p><nobr>");
		s2 = s2.replace(m4, " ");
		s2 = s2.replace(m5, "<font color=green>$1</font>");
		s2 = s2.replace(m2, "<font color=blue>$1</font>");
		s2 = s2.replace(m6a, "'<font color=red>$1</font>'");
		s2 = s2.replace(m7, "&nbsp;&nbsp;");
		s2 = "<p><nobr>" + s2 + "</nobr></p>";
		s2 = s2.replace(m3, "");
		return s2;
	};
	this.MarkClass = function(s1) {
		var m0 = />/ig;
		var m1 = /</ig;
		var m2 = /\b(PUBLIC|PRIVATE|String|int|import|boolean|class|date|extends|static|return|this|void)\b/ig;
		var m3 = /\n/ig;
		var m4 = /  /ig;
		var m5 = /\t/ig;
		var m6 = /"([^"]*)"/ig;
		var mmemo = /(\/\/.+\n)/g;
		var mmemo1 = /(\/\*[^\/]*\*\/)/g;
		var s2 = s1.replace(m0, "&gt;");
		s2 = s2.replace(m1, "&lt;");
		s2 = s2.replace(m4, " &nbsp;");
		s2 = s2.replace(m5, "&nbsp;&nbsp;");
		s2 = s2.replace(mmemo1, "<font color=gray>$1</font>");
		s2 = s2.replace(m6, "\"<font color=red>$1</font>\"");
		s2 = s2.replace(m2, "<font color=blue>$1</font>");
		s2 = s2.replace(mmemo, "<font color=gray>$1</font>");
		s2 = s2.replace(m3, "<br>");
		return s2;
	};
}

function EWA_FunctionProperty() {
	this.Name;
	this.FullName;
	this.Properites = new Array();
	this.Parent;
	this.Type;
	this.Level;
	this.Parameters = "";
	this.Dispose = function() {
		for (var i = 0; i < this.Properites.length; i += 1) {
			this.Properites[i].Dispose();
			this.Properites[i] = null;
		}
		this.Name = null;
		this.FullName = null;
		this.Parent = null;
		this.Type = null;
		this.Level = null;
		this.Parameters = null;
	};
}

function EWA_Function() {
	this.Functions = new Array();
	this.FunctionTable = {};
	this.Dispose = function() {
		for (var i = 0; i < this.Functions.length; i += 1) {
			this.Functions[i].Dispose();
		}
		for (a in this.FunctionTable) {
			this.FunctionTable[a] = null;
		}
		this.Functions = null;
		this.FunctionTable = null;
	};
	this.AddTopObject = function(obj, objName) {
		var topProp = new EWA_FunctionProperty();
		topProp.Name = objName;
		topProp.Object = obj;
		topProp.Level = 0;
		topProp.Type = typeof obj;
		topProp.FullName = objName;
		this.Functions[this.Functions.length] = topProp;
	};
	this.LoadFunctions = function() {
		for (var i = 0; i < this.Functions.length; i += 1) {
			var prop0 = this.Functions[i];
			this.GetFuncs(prop0.Object, 0, false, prop0);
			this.FunctionTable[prop0.FullName] = prop0;
		}
	};
	this.LoadResources = function(tableSet, tagName) {
		this.Tag = "EWA.F.F.C";
		if (tagName.toUpperCase() == "ListFrame".toUpperCase()) {
			this.Tag = "EWA.F.L.C";
		} else {
			if (tagName.toUpperCase() == "Tree".toUpperCase()) {
				this.Tag = "EWA.F.T.C";
			}
		}
		var r = this.FunctionTable[(this.Tag + ".Resources").toUpperCase()];
		for (var i = 0; i < tableSet.Count(); i += 1) {
			var tbs = tableSet.GetItem(i);
			var propChild = new EWA_FunctionProperty();
			propChild.Name = tbs.Name;
			propChild.Parent = r;
			propChild.Level = r.Level + 1;
			propChild.FullName = r.FullName + "." + propChild.Name;
			var tb = tbs.Tables.GetItem("DescriptionSet");
			propChild.Type = tb.SearchValue("Lang=" + EWA.LANG, "Info") + ", "
					+ tb.SearchValue("Lang=" + EWA.LANG, "Memo");

			// getinfo
			var pc0 = new EWA_FunctionProperty();
			pc0.Name = "GetInfo";
			pc0.FullName = propChild.FullName + "." + pc0.Name;
			pc0.Level = r.Level + 2;
			pc0.Parent = propChild;
			pc0.Type = "function";
			pc0.Parameters = "()";
			propChild.Properites[0] = pc0;

			// getmemo
			var pc1 = new EWA_FunctionProperty();
			pc1.Name = "GetMemo";
			pc1.FullName = propChild.FullName + "." + pc1.Name;
			pc1.Level = r.Level + 2;
			pc1.Parent = propChild;
			pc1.Type = "function";
			pc1.Parameters = "()";
			propChild.Properites[1] = pc1;
			this.FunctionTable[propChild.FullName.toUpperCase()] = propChild;
			r.Properites[i] = propChild;
		}
	};
	this.GetFuncs = function(obj, lvl, isFunc, prop) {
		try {
			for (a in obj) {
				var b = obj[a];
				var c = typeof b;
				var propChild = new EWA_FunctionProperty();
				propChild.Level = lvl;
				propChild.Name = a;
				propChild.FullName = prop.FullName + "." + a;
				propChild.Parent = prop;
				propChild.Type = c;
				prop.Properites[prop.Properites.length] = propChild;
				this.FunctionTable[propChild.FullName.toUpperCase()] = propChild;
				if (c == "function") {
					var b1 = b.toString();
					var a1 = b1.indexOf('(');
					var a2 = b1.indexOf(')');
					var s1 = b1.substring(a1 + 1, a2);
					propChild.Parameters = "(" + s1 + ");";
				}
				if (propChild.FullName == "EWA.F.FOS") {
					propChild.Parameters = "[\"@SYS_FRAME_UNID\"]";
				}
				if (isFunc) {
					continue;
				}
				if (c == "object") {
					this.GetFuncs(b, lvl + 1, false, propChild);
				}
				if (c == "function" && b.toString().indexOf("this.") > 0) {
					propChild.Type = "class";
					try {
						var d = new b();
						this.GetFuncs(d, lvl + 1, true, propChild);
						d = null;
					} catch (e) {
					}
				}
				a = b = c = null;
			}
			prop.Properites.sort(function(a, b) {
						return a.Name >= b.Name ? 1 : -1;
					});
		} catch (e) {

		}
	};
	this.List = function() {
		var b = new Array();
		for (var a1 in this.FunctionTable) {
			var a = this.FunctionTable[a1];
			var s2 = "";
			for (var i = 0; i < a.Level; i += 1) {
				s2 += "&nbsp;&nbsp;&nbsp;&nbsp;";
			}
			s2 += a.FullName + ", " + a.Type + "<br>";
			b[b.length] = s2;
		}
		return b.join("");
	};
}
