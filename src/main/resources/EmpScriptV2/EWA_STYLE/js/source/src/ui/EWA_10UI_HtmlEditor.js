var EWA_UI_HtmlEditorConfig = {
	OPT_PopImgProperties : true,
	OPT_ImageResizes : null, // 800x600, 400x300
	fonts : [ {
		name : "微软雅黑",
		font : "Microsoft YaHei"
	}, {
		name : "宋体",
		font : "宋体"
	}, {
		name : "Arial",
		font : "Arial"
	}, {
		name : "STHeiti",
		font : "STHeiti"
	} ],
	formats : [ {
		name : "H1",
		format : "h1"
	}, {
		name : "H2",
		format : "h2"
	}, {
		name : "H3",
		format : "h3"
	}, {
		name : "H4",
		format : "h4"
	}, {
		name : "H5",
		format : "h5"
	}, {
		name : "普通",
		format : "p"
	} ],
	sizes : [ {
		name : "超大",
		size : '7'
	}, {
		name : "特大",
		size : '6'
	}, {
		name : "大",
		size : '5'
	}, {
		name : "标准",
		size : '4'
	}, {
		name : "小",
		size : '3'
	}, {
		name : "特小",
		size : '2'
	}, {
		name : "特小",
		size : '1'
	} ],
	css : "img{max-width:100%}html{background:#2f2f2f}body{width: 800px; padding:10px 20px; margin: auto;"
			+ " box-shadow: rgb(241, 241, 241) 1px 1px 13px; font-size:14px; box-sizing: border-box;"
			+ "overflow-y: scroll;   "
			+ "font-family: 'Microsoft YaHei', STHeiti, 微软雅黑, tahoma, Verdana, Arial, sans-serif, 宋体;"
			+ " background: rgb(255, 255, 255);}",
	colors : [ "#ffffff", "#000000", "#eeece1", "#1f497d", "#4f81bd",
			"#c0504d", "#9bbb59", "#8064a2", "#4bacc6", "#f79646", "#f2f2f2",
			"#7f7f7f", "#ddd9c3", "#c6d9f0", "#dbe5f1", "#f2dcdb", "#ebf1dd",
			"#e5e0ec", "#dbeef3", "#fdeada", "#d8d8d8", "#595959", "#c4bd97",
			"#8db3e2", "#b8cce4", "#e5b9b7", "#d7e3bc", "#ccc1d9", "#b7dde8",
			"#fbd5b5", "#bfbfbf", "#3f3f3f", "#938953", "#548dd4", "#95b3d7",
			"#d99694", "#c3d69b", "#b2a2c7", "#92cddc", "#fac08f", "#a5a5a5",
			"#262626", "#494429", "#17365d", "#366092", "#953734", "#76923c",
			"#5f497a", "#31859b", "#e36c09", "#7f7f7f", "#0c0c0c", "#1d1b10",
			"#0f243e", "#244061", "#632423", "#4f6128", "#3f3151", "#205867",
			"#974806", "#c00000", "#ff0000", "#ffc000", "#ffff00", "#92d050",
			"#00b050", "#00b0f0", "#0070c0", "#002060", "#7030a0" ],

	buts : {
		"FormatBlock" : {
			id : 'fn_FormatBlock',
			'cmd' : 'PopFormatBlock',
			title : "格式",
			'class' : 'fa fa-header'
		},
		"FontSize" : {
			id : 'fn_FontSize',
			'cmd' : 'PopFontSize',
			title : "字體大小",
			'class' : 'fa fa-text-height'
		},
		"FontName" : {
			id : 'fn_FontName',
			'cmd' : 'PopFont',
			title : "字体",
			'class' : 'fa fa-font'
		},
		"BOLD" : {
			"id" : "st_bold",
			"cmd" : "BOLD",
			"title" : "BOLD",
			"class" : "fa fa-bold"
		},
		"ITALIC" : {
			"id" : "st_italic",
			"cmd" : "ITALIC",
			"title" : "ITALIC",
			"class" : "fa fa-italic"
		},
		"UNDERLINE" : {
			"id" : "st_underline",
			"cmd" : "UNDERLINE",
			"title" : "UNDERLINE",
			"class" : "fa fa-underline"
		},
		"InsertOrderedList" : {
			"id" : "st_insertorderedlist",
			"cmd" : "InsertOrderedList",
			"title" : "InsertOrderedList",
			"class" : "fa fa-list-ol"
		},
		"InsertunOrderedList" : {
			"id" : "st_insertunorderedlist",
			"cmd" : "InsertunOrderedList",
			"title" : "InsertunOrderedList",
			"class" : "fa fa-list-ul"
		},
		"INDENT" : {
			"id" : "st_indent",
			"cmd" : "INDENT",
			"title" : "INDENT",
			"class" : "fa fa-indent"
		},
		"Outdent" : {
			"id" : "st_outdent",
			"cmd" : "Outdent",
			"title" : "Outdent",
			"class" : "fa fa-outdent"
		},
		"JustifyLEFT" : {
			"id" : "st_justifyleft",
			"cmd" : "JustifyLEFT",
			"title" : "左对齐",
			"class" : "fa fa-align-left"
		},
		"JustifyCENTER" : {
			"id" : "st_justifycenter",
			"cmd" : "JustifyCENTER",
			"title" : "居中",
			"class" : "fa fa-align-center"
		},
		"JustifyRIGHT" : {
			"id" : "st_justifyright",
			"cmd" : "JustifyRIGHT",
			"title" : "右对齐",
			"class" : "fa fa-align-right"
		},
		"CreateLink" : {
			"id" : "st_createlink",
			"cmd" : "CreateLink",
			"title" : "创建链接",
			"class" : "fa fa-chain"
		},
		"CODE_TXT" : {
			"id" : "code_txt",
			"cmd" : "CODE_TXT",
			"title" : "源代码",
			"class" : "fa fa-html5"
		},
		eraser : {
			id : 'eraser',
			cmd : 'eraser',
			title : '清除格式',
			"class" : "fa fa-eraser"
		},
		'ForColor' : {
			id : 'fn_ForColor',
			cmd : 'PopForColor',
			title : '字體顏色',
			'class' : 'fa fa-font ewa-editor-for'
		},
		'BackColor' : {
			id : 'fn_BackColor',
			cmd : 'PopBackColor',
			title : '背景顏色',
			'class' : 'fa fa-font ewa-editor-bg'
		},
		'Img' : {
			id : 'fn_Img',
			cmd : 'PopImg',
			title : '圖片',
			'class' : 'fa fa-camera'
		},
		FullScreen : {
			id : 'fn_FullScreen',
			cmd : 'FullScreen',
			title : '全屏',
			'class' : 'fa fa-square-o'
		},
		"Word2Html" : {
			id : 'fn_Word2Html',
			cmd : "Word2Html",
			title : "转换Word",
			'class' : 'fa fa-file-word-o'
		}
	},
	defaultConf : [ [ 'FontName', 'FormatBlock', 'FontSize' ],
			[ "BOLD", "ITALIC", "UNDERLINE" ],
			[ 'InsertOrderedList', 'InsertunOrderedList' ],
			[ "JustifyLEFT", "JustifyCENTER", "JustifyRIGHT" ],
			[ "INDENT", "Outdent" ], [ "CreateLink", "eraser" ],
			[ 'ForColor', 'BackColor' ], [ 'Word2Html', 'Img', "FullScreen" ],
			[ "CODE_TXT" ] ],
	pop : function(obj, cnt) {
		for ( var n in __Cal) {
			if (n.indexOf('EDITOR_Pop_') == 0) {
				__Cal[n].WND.Show(false);
			}
		}
		var popId = 'EDITOR_Pop_' + (obj ? obj.id : "");
		if (!__Cal[popId]) {
			__Cal[popId] = {};
		}
		var ins = __Cal[popId];
		ins.OBJ = obj;
		if (ins.WND == null) {
			var o = ins.WND = new EWA_UI_DialogClass();
			o.Width = 172;
			o.Height = 50;
			o.ShadowColor = "";

			o.CreateWindow = window;

			// if (typeof _EWA_DialogWnd == 'undefined') {
			// o.CreateWindow = window;
			// } else { // pop window created
			// o.CreateWindow = _EWA_DialogWnd._ParentWindow;
			// _EWA_DialogWnd.OpendDialogs[_EWA_DialogWnd.OpendDialogs.length] =
			// o;
			// }
			o.CreateWindow._EWA_CALENDAR_ITEM = ins.WND;
			o.Create();
			o.SetHtml(cnt);

			$(o.GetFrameContent()).find('a').attr('onclick',
					"__Cal[\"" + popId + "\"].WND.Show(false);");
			$('div[ewa_name="DIV_BACK1"]').hide();
		}
		ins.WND.SetZIndex(10);
		if (obj) {
			ins.WND.Object = obj;
			ins.WND.MoveBottom(obj);
		} else {
			ins.WND.MoveCenter();
		}
		ins.WND.Show(true);
		return ins;
	},
	pop1 : function(id, cnt, width, height) {
		var popId = 'EDITOR_Pop_' + id;
		if (!__Cal[popId]) {
			__Cal[popId] = {};
		}
		var ins = __Cal[popId];
		if (ins.WND == null) {
			var o = ins.WND = new EWA_UI_DialogClass();
			o.Width = width;
			o.Height = height;
			o.ShadowColor = "";
			if (typeof _EWA_DialogWnd == 'undefined') {
				o.CreateWindow = window;
			} else { // pop window created
				o.CreateWindow = _EWA_DialogWnd._ParentWindow;
				_EWA_DialogWnd.OpendDialogs[_EWA_DialogWnd.OpendDialogs.length] = o;
			}
			o.CreateWindow._EWA_CALENDAR_ITEM = ins.WND;
			o.Create();
		}
		ins.WND.SetHtml(cnt);

		$(ins.WND.GetFrameContent()).find('#butClose').attr('onclick',
				"__Cal[\"" + popId + "\"].WND.Show(false);")
		ins.WND.SetZIndex(10);
		ins.WND.MoveCenter();
		ins.WND.Show(true);

		return ins;
	}
};
/**
 * 
 */
function EWA_UI_HtmlEditorClass() {
	this.DEF_CHART_WIDTH = 200;
	this.DEF_CHART_HEIGHT = 50;
	this.DEF_BG_COLOR = '#08c';
	this.DEF_COLOR = '#fff';
	this.OBJ_REPLACE = null;
	this.pasteClass = new EWA_MiscPasteToolClass();
	this._CreateFonts = function() {
		var ss = [ "<table class='ewa-editor-pop'>" ];
		for (var i = 0; i < EWA_UI_HtmlEditorConfig.fonts.length; i++) {
			var f = EWA_UI_HtmlEditorConfig.fonts[i];
			ss.push("<tr><td>");
			ss
					.push("<a style='font-size:16px;line-height:1.5;font-family:"
							+ f.font
							+ "' href='javascript:"
							+ this.Id
							+ ".executeSetFont(\""
							+ f.font
							+ "\")'>"
							+ f.name
							+ "</a>")

			ss.push("</td></tr>");
		}
		ss.push("</table>");
		return ss.join('\n');
	};
	this._CreateFormats = function() {
		var ss = [ "<table class='ewa-editor-pop'>" ];
		for (var i = 0; i < EWA_UI_HtmlEditorConfig.formats.length; i++) {
			var f = EWA_UI_HtmlEditorConfig.formats[i];
			ss.push("<tr><td>");
			ss.push("<" + f.format + "><a href='javascript:" + this.Id
					+ ".executeSetFormat(\"" + f.format + "\")'>" + f.name
					+ "</a></" + f.format + ">")

			ss.push("</td></tr>");
		}
		ss.push("</table>");
		return ss.join('\n');
	};
	this._CreateFontSizes = function() {
		var ss = [ "<table class='ewa-editor-pop'>" ];
		for (var i = 0; i < EWA_UI_HtmlEditorConfig.sizes.length; i++) {
			var f = EWA_UI_HtmlEditorConfig.sizes[i];
			ss.push("<tr><td>");
			ss.push("<font size=" + f.size + "><a href='javascript:" + this.Id
					+ ".executeFontSize(\"" + f.size + "\")'>" + f.name
					+ "</a></font>")

			ss.push("</td></tr>");
		}
		ss.push("</table>");
		return ss.join('\n');
	};
	this.executeFontSize = function(fontsize) {
		var window_html = $('#' + this.BoxId + ' iframe:eq(0)')[0].contentWindow;
		this.execDocumentCommand("FontSize", false, fontsize);
	};
	this.executeSetFont = function(font) {
		var window_html = $('#' + this.BoxId + ' iframe:eq(0)')[0].contentWindow;
		this.execDocumentCommand("FontName", false, font);
	};
	this.executeSetFormat = function(format) {
		var window_html = $('#' + this.BoxId + ' iframe:eq(0)')[0].contentWindow;
		this.execDocumentCommand("FormatBlock", false, format);
	};
	this.executeForColor = function(color) {
		var window_html = $('#' + this.BoxId + ' iframe:eq(0)')[0].contentWindow;
		this.execDocumentCommand("ForeColor", false, color);
	};
	this.executeBackColor = function(color) {
		var window_html = $('#' + this.BoxId + ' iframe:eq(0)')[0].contentWindow;
		this.execDocumentCommand("BackColor", false, color);
		$(window_html.document.body).css('background', '#fff');
	};
	this.execDocumentCommand = function(command, truefalse, value) {
		var window_html = $('#' + this.BoxId + ' iframe:eq(0)')[0].contentWindow;
		window_html.document.execCommand(command, truefalse, value);
		this.executeAfterEvent(command, value);
	};
	// 上传文件
	this.executeImages = function(source) {
		var window_html = $('#' + this.BoxId + ' iframe:eq(0)')[0].contentWindow;
		var count = 0;
		var inc_ok = 0;
		var c = this;
		for (var i = 0; i < source.files.length; i++) {
			var file = source.files[i];

			if (file.type && file.type.indexOf('image/') == 0) {
				count++;

				var fr = new FileReader();
				fr.onloadend = function(e) {
					var img = new Image();
					img.src = e.target.result;
					img.style.maxWidth = '100%';
					window_html.document.body.appendChild(img);
					inc_ok++;
					if (inc_ok == count) {
						c.pasteClass.target = window_html.document.body;
						c.pasteClass.processAsHtml();
						c.pasteClass.process();
					}
					c.executeAfterEvent("executeImages", img);
				};
				fr.readAsDataURL(file);
			}
		}
	};
	this.executeWord = function(source) {
		var window_html = $('#' + this.BoxId + ' iframe:eq(0)')[0].contentWindow;
		var url = EWA.CP + (EWA.CP.endsWith("/") ? "" : "/")
				+ "EWA_STYLE/cgi-bin/_re_/?method=2Html";
		var c = this;
		for (var i = 0; i < source.files.length; i++) {
			var file = source.files[i];
			var loc0 = file.name.lastIndexOf(".");
			if (loc0 > 0) {
				var ext = file.name.substring(loc0).toLowerCase();
				if (!(ext == '.doc' || ext == '.docx' || ext == '.xls'
						|| ext == '.xlsx' || ext == '.odt')) {
					$Tip('仅支持 doc/docx/xls/xlsx/odt文件');
					return;
				}
			} else {
				$Tip('仅支持 doc/docx/xls/xlsx/odt文件');
				return;
			}
			var fr = new FileReader();
			fr.onloadend = function(e) {
				var data = {};
				data.src = e.target.result;
				url += "&name=" + file.name.toURL();
				var p = $X(c.BoxId).parentNode;
				var cover_id = c.BoxId + '_cover';
				var cover = '<div id="'
						+ cover_id
						+ '" style="width:100%;height:100%" class="ewa-ui-dialog-cover"></div>';
				$(p).css('position', 'relative').append(cover);
				$JP(url, data, function(rst) {
					if (rst.rst) {
						window_html.document.body.innerHTML = rst.cnt;
						$(window_html.document.body).find('img').each(
								function() {
									$(this).attr(
											"src",
											rst['img_root']
													+ $(this).attr("src"));
								});
						$('#' + cover_id).remove();
						$Tip("处理完成");
						c.executeAfterEvent("executeWord", rst);

					} else {
						$Tip(rst.msg);
					}
				});
			};
			fr.readAsDataURL(file);
		}
	}
	this.PopFontSize = function(from) {
		var ss = this._CreateFontSizes();
		EWA_UI_HtmlEditorConfig.pop(from, ss);
	};
	this.PopFont = function(from) {
		var ss = this._CreateFonts();
		EWA_UI_HtmlEditorConfig.pop(from, ss);
	};
	this.PopFormatBlock = function(from) {
		var ss = this._CreateFormats();
		EWA_UI_HtmlEditorConfig.pop(from, ss);
	};
	this.PopForColor = function(from) {
		var ss = this._CreateColorBox('executeForColor');
		EWA_UI_HtmlEditorConfig.pop(from, ss);
	};
	this.PopBackColor = function(from) {
		var ss = this._CreateColorBox('executeBackColor');
		EWA_UI_HtmlEditorConfig.pop(from, ss);
	};
	this.PopImg = function() {

	};
	this.FullScreen = function() {
		var o = $('#' + this.BoxId);
		var isfull = o.attr('isfull');
		if (isfull) {
			var old_css = o.attr('old_css');
			o.attr('style', old_css).attr('isfull', '');

		} else {
			var index;
			if (window._EWA_UI_DIALOG_COVERINDEX) {
				_EWA_UI_DIALOG_COVERINDEX++;
			} else {
				_EWA_UI_DIALOG_COVERINDEX = 999;
			}
			index = _EWA_UI_DIALOG_COVERINDEX;
			var old_css = o.attr('style');
			o.attr('old_css', old_css).attr('isfull', '1');
			o.css({
				position : 'fixed',
				left : 0,
				top : 0,
				right : 0,
				bottom : 0,
				width : '100%',
				height : '100%',
				"z-index" : index
			});
		}

	};
	this._CreateColorBox = function(fn) {
		var ss = [ "<table class='ewa-editor-pop'><tr>" ];
		for (var i = 0; i < EWA_UI_HtmlEditorConfig.colors.length; i++) {
			if (i > 0 && i % 10 == 0) {
				ss.push("</tr><tr>")
			}
			var c = EWA_UI_HtmlEditorConfig.colors[i];
			ss.push("<td><a href='javascript:" + this.Id + "." + fn + "(\"" + c
					+ "\")' class='ewa-edit-pop-color' style='background:" + c
					+ "'>&nbsp;</a></td>");
		}
		ss.push("</table>");
		return ss.join('\n');
	};
	this.Word2Html = function() {
		// nothing to do;
	}
	this.GetHtml = function() {
		var window_html = $('#' + this.BoxId + ' iframe:eq(0)')[0].contentWindow;
		var window_code = $('#' + this.BoxId + ' iframe:eq(1)')[0].contentWindow;

		if ($('#' + this.BoxId + ' iframe:eq(0)').css('display') == 'none') {
			return window_html.document.body.innerHTML = window_code.getText();
		}
		return window_html.document.body.innerHTML;
	};
	this.GetText = function() {
		var window_html = $('#' + this.BoxId + ' iframe:eq(0)')[0].contentWindow;
		var window_code = $('#' + this.BoxId + ' iframe:eq(1)')[0].contentWindow;

		if ($('#' + this.BoxId + ' iframe:eq(0)').css('display') == 'none') {
			return window_html.document.body.innerHTML = window_code.getText();
		}
		return window_html.document.body.innerText;
	};
	this.Create = function(objReplace) {
		this.OBJ_REPLACE = objReplace;

		this.Id = ("EWA_Html_" + Math.random()).replace('.', '_');
		this.BoxId = this.Id + 'box';
		// console.log('create edit ' + this.Id);
		// console.log('create edit (BOX)' + this.BoxId);

		window[this.Id] = this;
		EWA.F.FOS[this.Id] = this;

		var html = objReplace.value || objReplace.innerHTML;
		var height = $(objReplace).height();
		var width = $(objReplace).width();

		var css = {
			border : '1px solid #ccc',
			position : 'relative',
			width : width,
			height : height,
			overflow : 'hidden'
		};
		if (objReplace.getAttribute('EWA_DHTML') == '1') {
			css.width = '100%';
		}
		var obj = document.createElement('table');
		obj.id = this.BoxId;
		$(obj).css(css).addClass('ewa-editor').attr('cellpadding', 0).attr(
				'cellspacing', 0);
		var buts = obj.insertRow(-1).insertCell(-1);
		buts.className = 'ewa-editor-buts';

		var cnt = obj.insertRow(-1).insertCell(-1);
		$(cnt).css('position', 'static').css('opacity', 1).addClass(
				'ewa-ui-dialog-cover');
		var buts_html = [];
		var conf = EWA_UI_HtmlEditorConfig.defaultConf;
		for ( var n in conf) {
			if (n > 0)
				buts_html.push("<span class='ewa-editor-but-spt '>|</span>")
			for ( var m in conf[n]) {
				var o = EWA_UI_HtmlEditorConfig.buts[conf[n][m]];
				var s = this._CreateButton(o);
				buts_html.push(s);
			}
		}
		buts.innerHTML = buts_html.join('');

		objReplace.parentNode.insertBefore(obj, objReplace);
		objReplace.style.display = 'none';

		this._CreateIframe(cnt, html, objReplace);

		var file = "<input onchange='"
				+ this.Id
				+ ".executeImages(this)' multiple accept='image/jpeg,image/png,image/bmp' type=file "
				+ " style='width:30px;height:30px;position:absolute;top:4px;left:0px;opacity:0.0'>";
		$('#' + this.BoxId).find('a[id=fn_Img]').append(file);

		var fileWord = "<input onchange='"
				+ this.Id
				+ ".executeWord(this)' accept='doc,docx,odt' type=file "
				+ " style='width:30px;height:30px;position:absolute;top:4px;left:0px;opacity:0.0'>";
		$('#' + this.BoxId).find('a[id=fn_Word2Html]').append(fileWord);

		this.executeAfterEvent('init', 'ok');

		if (window.__Cal) { // 清除已经存在的Pop窗体，避免ajax多次加载出现找不到对象的问题 (this.Id会不一致)
			for ( var n in __Cal) {
				if (n.indexOf('EDITOR_Pop_') == 0) {
					delete window.__Cal[n];
				}
			}
		}
	};
	this._CreateIframe = function(cnt, html, objReplace) {
		cnt.innerHTML = "<iframe id='"
				+ this.Id
				+ "cntent' frameborder=0 width=100% height=100%></iframe>"
				+ "<iframe id='"
				+ this.Id
				+ "code' src0='"
				+ (EWA.RV_STATIC_PATH || "/EmpScriptV2")
				+ "/EWA_STYLE/editor/CodeMirror/index.html' style='display: none; width: 100%; height: 100%' frameborder=0></iframe>";

		var c = this;
		// 由于iframe创建需要时间，所以等待400ms
		setTimeout(function() {
			var iframe_obj = $('#' + c.BoxId + ' iframe:eq(0)');

			var window_html = iframe_obj[0].contentWindow;
			var doc = window_html.document;
			// firefox 设置最小高度
			doc.body.style.minHeight = iframe_obj.height() + 'px';

			// 设置新的宽度
			if (iframe_obj.width() < 840) {
				doc.body.style.boxSizing = 'border-box';
				doc.body.style.width = '100%';
			}
			var style = doc.createElement('style');
			style.textContent = EWA_UI_HtmlEditorConfig.css;
			doc.getElementsByTagName('head')[0].appendChild(style);

			var u = EWA.CP + (EWA.CP.endsWith('/') ? '' : '/')
					+ 'EWA_STYLE/cgi-bin/_re_/index.jsp?method=HtmlImages';
			// 图片缩放
			if (EWA_UI_HtmlEditorConfig.OPT_ImageResizes) {
				u += "&ImageReiszes="
						+ EWA_UI_HtmlEditorConfig.OPT_ImageResizes.toURL();
			}
			c.pasteClass.bind(window_html.document.body, u, function(rst) {
				c.executeAfterEvent("HtmlImages", rst);
			});

			// console.log(EWA_MiscPasteTool.target)

			doc.contentEditable = true;
			doc.designMode = "on";
			doc.body.innerHTML = html;

			$(doc.body).css(EWA_UI_HtmlEditorConfig.css);

			// 图片点击显示对话框
			if (EWA_UI_HtmlEditorConfig.OPT_PopImgProperties) {
				doc.onmousedown = function(evt) {
					var e = evt || event;
					var t = e.target || e.srcElement;
					if (t.tagName == 'IMG') {
						c.PopImgProperties(t)
					}
				};
			}
			$(doc.body).bind("cut", function() {
				setTimeout(function() {
					c.executeAfterEvent('cut');
				}, 10);
			});
			$(doc.body).bind("keyup", function() {
				c.executeAfterEvent('keyup');
			});
			$(doc.body).bind("paste", function() {
				setTimeout(function() {
					c.executeAfterEvent('paste');
				}, 10);
			});
			$(doc.body).bind("undo", function() {
				c.executeAfterEvent('undo');
			});
			$(doc.body).bind("redo", function() {
				c.executeAfterEvent('redo');
			});
		}, 411);
	};
	this.PopImgProperties = function(img) {
		var ss = [ "<table style='background:rgba(0,0,0,0.77);color:#f1f1f1;' border=0 width=300 height=140>" ];
		ss.push("</tr><td colspan=2 align=center>设定图片属性</td></tr>");

		ss.push("<tr><td>尺寸：</td><td><input name='width' value='" + img.width
				+ "' size=4 maxlength=4> x ");
		ss.push("<input name='height' value='" + img.height
				+ "' size=4 maxlength=4>");
		ss.push("</td></tr>");

		ss
				.push("<tr><td>浮动：</td><td><select name='float'><option value=''></option>");
		ss.push("<option value='left'>左</option>");
		ss.push("<option value='right'>右</option>");
		ss.push("</select></td></tr>");

		ss
				.push("<tr><td>边界：</td><td><input name='margin' value='2' size=4 maxlength=2> 像素 ");
		ss.push("</td></tr>");

		ss.push("<tr><td>边界：</td><td><input type='checkbox' name='bt'> 设为标题图 ");
		ss.push("</td></tr>");

		ss
				.push("</tr><td colspan=2 align=center><input type=button value='确定' id='butOk'>&nbsp;");
		ss
				.push("<input type=button onclick='$(this).parentsUntil(\"div[ewa_name=DIV_FRAME]\").last().parent().hide()' value='关闭'></td></tr>")
		ss.push("</table>");
		var ins = EWA_UI_HtmlEditorConfig.pop1(img.getAttribute('_tmp_id'), ss
				.join(''), 300, 150);

		var cnt = ins.WND.GetFrameContent();
		var c = this;
		$(cnt).find('#butOk').bind('click', function() {
			$(this.parentNode).find('#butClose').click();
			var w = $(cnt).find('[name=width]').val();
			if (w != '') {
				img.width = w;
			} else {
				$(img).attr('width', null);
			}
			var h = $(cnt).find('[name=height]').val();
			if (h != '') {
				img.height = h;
			} else {
				$(img).attr('height', null);
			}
			var f = $(cnt).find('[name=float]').val();
			$(img).css("float", f);
			$(img).css("margin", $(cnt).find('[name=margin]').val() + 'px');

			if ($(cnt).find('[name=bt]')[0].checked) {
				var ss = img.src.replace(location.origin, '');
				ss = ss.replace('//', '/');
				$('#NWS_HEAD_PIC').val(ss);
				if (c.userSetHeaderPic) {
					c.userSetHeaderPic(ss);
				}
			}
		});
	};
	this._CreateButton = function(o) {
		try {
			var s = "<a href='javascript:void(0)' class='btn " + o["class"]
					+ "' onclick='" + this.Id + ".execute(this)' id='" + o.id
					+ "' cmd='" + o.cmd + "' title='" + o.title + "'></a>";
			return s;
		} catch (e) {
			console.log(o)
			return "";
		}

	};
	this.showCode = function(o1) {

		var window_html = $('#' + this.BoxId + ' iframe:eq(0)')[0].contentWindow;
		var window_code = $('#' + this.BoxId + ' iframe:eq(1)')[0].contentWindow;

		var html = window_code.style_html(window_html.document.body.innerHTML,
				4, ' ', 80);

		o1.setAttribute('tag', 'txt');
		if (window_code.editor) {
			window_code.editor.setValue(html);
		} else {
			//__VAL__ = html;
			//__TYPE__ = 'html';
			// 调用初始化
			window_code.initEditor(html, 'html');
		}
	};
	this.execute = function(o1) {
		var window_html = $('#' + this.BoxId + ' iframe:eq(0)')[0].contentWindow;
		var window_code = $('#' + this.BoxId + ' iframe:eq(1)')[0].contentWindow;

		var doc = window_html.document;
		var cmd = o1.getAttribute('cmd');

		if (o1.id.indexOf('st_') == 0) {
			if (cmd == 'CreateLink') {
				doc.execCommand(cmd, true, null);
			} else {
				doc.execCommand(cmd, false, null);
			}

		} else if (o1.id.indexOf('fn_') == 0) {
			this[cmd](o1);
		} else if (cmd == 'eraser') {
			this.executeEraser();
		} else if (cmd == 'CODE_TXT') {
			var tag = o1.getAttribute('tag');
			var frameEditor = $('#' + this.BoxId + ' iframe:eq(0)');
			var frameCode = $('#' + this.BoxId + ' iframe:eq(1)');

			if (!tag) {
				frameEditor.hide();
				frameCode.show();

				if (frameCode.attr('src0')) { // 初始化编辑器不加载url
					var u = frameCode.attr('src0');
					frameCode.attr('src', u);
					frameCode.removeAttr('src0');

					var c = this;
					this._WAIT_CODE_LOAD_COMPLETE = setInterval(function() {
						if (window_code.document.readyState == 'complete') {
							window.clearInterval(c._WAIT_CODE_LOAD_COMPLETE);
							c._WAIT_CODE_LOAD_COMPLETE = null;
							c.showCode(o1);
						}
					}, 100);

				} else {
					this.showCode(o1);
				}
			} else {
				frameEditor.show();
				frameCode.hide();
				o1.setAttribute('tag', '');
				window_html.document.body.innerHTML = window_code.getText();
			}
		} else if (o1.id == 'IMG') {
			insertImg(window);
		} else {
			if (o1.id == 'CreateLink') {
				window_html.document.execCommand(o1.id, true, null);
			} else {
				window_html.document.execCommand(o1.id, false, null);
			}
			window_html.document.body.focus();
		}
		this.executeAfterEvent(cmd);
	};
	this.executeEraser = function() {
		var bd = $('#' + this.BoxId + ' iframe:eq(0)')[0].contentWindow.document.body;
		$(bd).find('p,h1,h2,h3,h4,h5').each(function() {
			if ($(this).find('img').length == 0) {
				this.innerText = this.innerText;
				if (this.innerText.trimEx() == '') {
					$(this).remove();
				}
			}
		});
		$(bd).find('div,font,span,a').each(function() {
			if ($(this).find('img').length == 0) {
				if (this.innerText.trimEx() == '') {
					$(this).remove();
				}
			}

		});

		$(bd).find('script').remove();
		$(bd).find('style').remove();
		$(bd).find('link').remove();
		$(bd).find('meta').remove();
		$(bd).find('title').remove();
		$(bd).find('colgroup').remove();

		/*var attrs={
			id:null,
			name:null,
			style:null,
			class:null,
			size:null,
			href:null,
			onload:null,
			onerror:null,
			onclick:null,
			onmousedown:null,
			onmousemove:null,
			onmouseout:null,
			onmouseover:null,
			ontouchstart:null,
			ontouch:null,
			contenteditable:null,
			color:null,
		}
		$(bd).find('*').attr(attrs);*/
		
		$(bd).find("*").each(function() {
			let removeAttrs={};
			for(let i=0;i<this.attributes.length;i++){
				let item = this.attributes[i].name;
				if(item != "src"){
					removeAttrs[item] = null;
				}
			}
			$(this).attr(removeAttrs);
		});

		// 重新写值
		var exp = /<!--[\w\W\r\n]*?-->/gim; // 注释的正则表达式
		this.OBJ_REPLACE.value = bd.innerHTML = bd.innerHTML.replace(exp, '');
	}
	this.executeAfterEvent = function(cmd, value) {
		var bd = $('#' + this.BoxId + ' iframe:eq(0)')[0].contentWindow.document.body;
		if (cmd == 'init' && value == 'ok') {
			// 初始化不改变值
		} else {
			this.OBJ_REPLACE.value = bd.innerHTML;
		}
		if (this.userAfterEvent) {
			this.userAfterEvent(cmd, value, bd);
		}
	};
	// define your function
	this.userAfterEvent = function(cmd, value, targetElement) {
		// console.log(cmd,value,targetElement);
	};
};
/**
 * 粘贴获取图片资源保存到本地 <br>
 * 提交地址 例如 ：xxx/EWA_STYLE/cgi-bin/_re_/index.jsp?method=HtmlImages<br>
 * method=HtmlImages 是标记<br>
 * 
 * 处理当编辑器粘贴网路图片(背景)，提交到后台获取图片保存到本地<br>
 * 当粘贴诸如 qq捕捉的图片时，提交base64内容到后台并转换成本地文件
 * 
 */
function EWA_MiscPasteToolClass() {
	this.target = document.body;
	this.handleUrl = null;
	this.images = [];
	this.paste = function(d) {
		d = d.originalEvent;
		if (!(d && d.clipboardData && d.clipboardData.items && d.clipboardData.items.length > 0)) {
			return;
		}
		for (var b = 0; b < d.clipboardData.items.length; b++) {
			var c = d.clipboardData.items[b];
			// console.log(c.type);
			if (c.type == "image/png") {
				// 粘贴图片处理
				this.processAsPaste(c);
			} else if (c.type == "text/html") {
				var me = this;
				if (d.clipboardData.getData("text/html")) {
					// 根据粘贴后的内容进行处理,延时300ms
					setTimeout(function() {
						me.processAsHtml();
						me.process();
					}, 311);
				}
				break;
			}
		}

	};
	this.processAsPaste = function(c) {
		var a = new FileReader();
		var me = this;
		var prevImgs = {};
		$(me.target).find('img').each(function() {
			prevImgs[this] = true;
		});
		a.onloadend = function() {
			var img = null;
			// 检查是否图形已经插入
			$(me.target).find('img').each(function() {
				if (img == null && !prevImgs[this]) {
					img = this;
				}
			});
			if(!img){
				// 执行插入图片
				me.target.ownerDocument.execCommand("InsertImage", false,
					this.result);
			}
			$(me.target).find('img').each(function() {
				if (img == null && !prevImgs[this]) {
					img = this;
				}
			});
			if (img) {
				var tmpid = me.tmpId(img);
				me.images.push({
					id : tmpid,
					src : img.src,
					mode : "base64"
				});
				me.process();
			} else {
				console.log('not img');
			}
		};
		a.readAsDataURL(c.getAsFile());
	};
	this.processAsHtml = function() {
		var obj = this.target;
		var me = this;
		$(obj)
				.find("img")
				.each(
						function() {
							if (!this.getAttribute("_tmp_id")) {
								var tmpid = me.tmpId(this);
								if (this.src
										&& this.src.indexOf(location.origin) != 0) {
									me.images
											.push({
												id : tmpid,
												src : this.src,
												mode : this.src
														.indexOf('data:image') == 0 ? "base64"
														: "normal"
											});
								}
							}
						});
		// 从body开始 清除备注
		this.processRemoveComments();

		$(obj).find('*').each(function() {
			var bg = $(this).css('background-image');
			if (bg) {
				bg = bg.replace('url(', '').replace(')', '');
				if (bg && bg.startsWith('http://')) {
					me.images.push({
						id : EWA_MiscPasteTool.tmpId(this),
						src : bg,
						mode : "background"
					});
				}
			}
			$(this).attr({
				onclick : null,
				onload : null,

				onkeydown : null,
				onkeyup : null,
				onerror : null,

				onmousedown : null,
				onmouseout : null,
				onmouseover : null,
				onkeypress : null,

				onblur : null,
				onscroll : null
			});
		});
	};
	this.processRemoveComments = function(parent) {
		if (parent == null) {
			parent = this.target;
		}
		// console.log(parent.innerHTML)
		var comments = [];
		for ( var n in parent.childNodes) {
			var o = parent.childNodes[n];
			if (o.nodeType == 8 || o.tagName == "SCRIPT" || o.tagName == "LINK"
					|| o.tagName == "STYLE" || o.tagName == "IFRAME") {
				comments.push(o);
			} else {
				if (o.tagName == "SPAN") {
					var v = GetInnerText(o);
					if (!v) {
						comments.push(o);
					}
				}
			}

		}

		for ( var n in comments) {
			parent.removeChild(comments[n]);
		}
		for ( var n in parent.childNodes) {
			var o = parent.childNodes[n];
			if (o.nodeType == 1 && o.childNodes) {
				this.processRemoveComments(o);
			}
		}
	};
	this.tmpId = function(obj) {
		if (!obj.getAttribute("_tmp_id")) {
			var tmpid = ("r_" + Math.random()).replace(".", "");
			obj.setAttribute("_tmp_id", tmpid);
			$(obj).css('max-width', '100%');
			return tmpid;
		} else {
			return obj.getAttribute("_tmp_id");
		}
	};
	this.process = function() {
		if (this.images.length == 0) {
			return;
		}
		// 提交到后台进行处理
		var data = {
			d : JSON.stringify(this.images)
		};
		this.images = [];
		var me = this;
		$JP(this.handleUrl, data, function(rst) {
			if (rst.rst) {
				for (var i = 0; i < rst.rsts.length; i++) {
					var d = rst.rsts[i];
					var id = d.id;
					var local = d.local;
					var mode = d.mode;
					if (mode == 'background') {
						$(me.target).find('[_tmp_id="' + id + '"]').css(
								'background-image', "url(" + local + ")");
					} else {
						$(me.target).find('img[_tmp_id="' + id + '"]').attr(
								'src', local);
					}
				}

			} else {
				$Tip('处理错误');
			}

			if (me.handleUrlAfterEvent) {
				me.handleUrlAfterEvent(rst);
			}
		});

	};
	this.bind = function(obj, handleUrl, handleUrlAfterEvent) {
		if (!handleUrl) {
			alert('请定义提交地址');
			return;
		}
		this.handleUrl = handleUrl;
		this.images = [];
		this.target = obj;
		var me = this;
		$(document).ready(function() {
			$(obj).bind("paste", function(e) {
				me.paste(e);
			});
		});

		if (handleUrlAfterEvent) {
			this.handleUrlAfterEvent = handleUrlAfterEvent;
		} else {
			this.handleUrlAfterEvent = null;
		}
	};
};

/**
 * 粘贴获取图片资源保存到本地 <br>
 * 提交地址 例如 ：xxx/EWA_STYLE/cgi-bin/_re_/index.jsp?method=HtmlImages<br>
 * method=HtmlImages 是标记<br>
 * 
 * 处理当编辑器粘贴网路图片(背景)，提交到后台获取图片保存到本地<br>
 * 当粘贴诸如 qq捕捉的图片时，提交base64内容到后台并转换成本地文件
 * 
 */

/*
var EWA_MiscPasteTool0000 = {
	target : document.body,
	handleUrl : null,
	images : [],
	paste : function(d) {
		d = d.originalEvent;
		if (d && d.clipboardData && d.clipboardData.items
				&& d.clipboardData.items.length > 0) {
			for (var b = 0; b < d.clipboardData.items.length; b++) {
				var c = d.clipboardData.items[b];
				// console.log(c.type);
				if (c.type == "image/png") {
					// 粘贴图片处理
					EWA_MiscPasteTool.processAsPaste(c);
				} else if (c.type == "text/html") {
					if (d.clipboardData.getData("text/html")) {
						// 根据粘贴后的内容进行处理,延时300ms
						setTimeout(function() {
							EWA_MiscPasteTool.processAsHtml();
							EWA_MiscPasteTool.process();
						}, 311);
					}
					break;
				}
			}
		}
	},
	processAsPaste : function(c) {
		var a = new FileReader();
		a.onloadend = function() {
			var img = null;
			// img.src = this.result;
			// EWA_MiscPasteTool.target.appendChild(img);
			var prevImgs = {};
			$(EWA_MiscPasteTool.target).find('img').each(function() {
				prevImgs[this.src] = true;
			});

			EWA_MiscPasteTool.target.ownerDocument.execCommand("InsertImage",
					false, this.result);

			$(EWA_MiscPasteTool.target).find('img').each(function() {
				if (img == null && !prevImgs[this.src]) {
					img = this;
				}
			});
			if (img) {
				var tmpid = EWA_MiscPasteTool.tmpId(img);
				EWA_MiscPasteTool.images.push({
					id : tmpid,
					src : img.src,
					mode : "base64"
				});
				EWA_MiscPasteTool.process();
			} else {
				console.log('not img');
			}
		};
		a.readAsDataURL(c.getAsFile());
	},
	processAsHtml : function() {
		var obj = this.target;

		$(obj)
				.find("img")
				.each(
						function() {
							if (!this.getAttribute("_tmp_id")) {
								var tmpid = EWA_MiscPasteTool.tmpId(this);
								if (this.src
										&& this.src.indexOf(location.origin) != 0) {
									EWA_MiscPasteTool.images
											.push({
												id : tmpid,
												src : this.src,
												mode : this.src
														.indexOf('data:image') == 0 ? "base64"
														: "normal"
											});
								}
							}
						});
		// 从body开始 清除备注
		this.processRemoveComments();

		$(obj).find('*').each(function() {
			var bg = $(this).css('background-image');
			if (bg) {
				bg = bg.replace('url(', '').replace(')', '');
				if (bg && bg.startsWith('http://')) {
					EWA_MiscPasteTool.images.push({
						id : EWA_MiscPasteTool.tmpId(this),
						src : bg,
						mode : "background"
					});
				}
			}
			$(this).attr({
				onclick : null,
				onload : null,

				onkeydown : null,
				onkeyup : null,
				onerror : null,

				onmousedown : null,
				onmouseout : null,
				onmouseover : null,
				onkeypress : null,

				onblur : null,
				onscroll : null
			});
		});
	},
	processRemoveComments : function(parent) {
		if (parent == null) {
			parent = this.target;
		}
		// console.log(parent.innerHTML)
		var comments = [];
		for ( var n in parent.childNodes) {
			var o = parent.childNodes[n];
			if (o.nodeType == 8 || o.tagName == "SCRIPT" || o.tagName == "LINK"
					|| o.tagName == "STYLE" || o.tagName == "IFRAME") {
				comments.push(o);
			} else {
				if (o.tagName == "SPAN") {
					var v = GetInnerText(o);
					if (!v) {
						comments.push(o);
					}
				}
			}

		}

		for ( var n in comments) {
			parent.removeChild(comments[n]);
		}
		for ( var n in parent.childNodes) {
			var o = parent.childNodes[n];
			if (o.nodeType == 1 && o.childNodes) {
				this.processRemoveComments(o);
			}
		}
	},
	tmpId : function(obj) {
		if (!obj.getAttribute("_tmp_id")) {
			var tmpid = ("r_" + Math.random()).replace(".", "");
			obj.setAttribute("_tmp_id", tmpid);
			$(obj).css('max-width', '100%');
			return tmpid;
		} else {
			return obj.getAttribute("_tmp_id");
		}
	},
	process : function() {
		if (EWA_MiscPasteTool.images.length == 0) {
			return;
		}
		// 提交到后台进行处理
		var data = {
			d : JSON.stringify(EWA_MiscPasteTool.images)
		};
		EWA_MiscPasteTool.images = [];
		$JP(this.handleUrl, data,
				function(rst) {
					if (rst.rst) {
						for (var i = 0; i < rst.rsts.length; i++) {
							var d = rst.rsts[i];
							var id = d.id;
							var local = d.local;
							var mode = d.mode;
							if (mode == 'background') {
								$(EWA_MiscPasteTool.target).find(
										'[_tmp_id="' + id + '"]').css(
										'background-image',
										"url(" + local + ")");
							} else {
								$(EWA_MiscPasteTool.target).find(
										'img[_tmp_id="' + id + '"]').attr(
										'src', local);
							}
						}

					} else {
						$Tip('处理错误');
					}

					if (EWA_MiscPasteTool.handleUrlAfterEvent) {
						EWA_MiscPasteTool.handleUrlAfterEvent(rst);
					}
				});

	},
	bind : function(obj, handleUrl, handleUrlAfterEvent) {
		if (!handleUrl) {
			alert('请定义提交地址');
			return;
		}
		EWA_MiscPasteTool.handleUrl = handleUrl;
		EWA_MiscPasteTool.images = [];
		EWA_MiscPasteTool.target = obj;
		$(document).ready(function() {
			$(obj).bind("paste", EWA_MiscPasteTool.paste);
		});

		if (handleUrlAfterEvent) {
			this.handleUrlAfterEvent = handleUrlAfterEvent;
		} else {
			this.handleUrlAfterEvent = null;
		}
	}
};
*/