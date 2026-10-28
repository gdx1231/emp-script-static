if (typeof EWA == 'undefined') {
	EWA = {};
}

/* 界面 */
EWA["UI"] = EWA["UI"] || {};

EWA.UI.findScrollParent = function(element) {
	if (!element || element === document.body) {
		return document.body;
	}

	const style = window.getComputedStyle(element);
	const isScrollable = (style.overflowY === 'auto' || style.overflowY === 'scroll') &&
		element.scrollHeight > element.clientHeight ||
		(style.overflowX === 'auto' || style.overflowX === 'scroll') &&
		element.scrollWidth > element.clientWidth;

	if (isScrollable) {
		return element;
	}

	return this.findScrollParent(element.parentElement);
};
/**
 * 计算位置
 * 
 * @param {}
 *            obj 要计算位置的对象
 * @return {Object} X 左<br>
 *         Y bottom<br>
 *         Left 左<br>
 *         Top 头<br>
 *         Width 宽<br>
 *         Height 高<br>
 *         Right 右<br>
 *         Bottom 底<br>
 */
EWA.UI.Postion = function(obj) {
	if (obj == null) {
		return null;
	}
	var o1 = obj;
	var x,
		y;
	x = y = 0;
	do {
		x += o1.offsetLeft * 1;
		y += o1.offsetTop * 1;
		if (o1.tagName == "DIV") {
			x -= o1.scrollLeft;
			y -= o1.scrollTop;
		}
		o1 = o1.offsetParent;
	} while (o1 != null && o1.tagName != "BODY" && o1.tagName != "HTML");
	var y1 = y + obj.offsetHeight * 1;
	return {
		X: x, // 左
		Y: y1, // bottom
		Left: x, // 左
		Top: y, // 头
		Width: obj.offsetWidth, // 宽
		Height: obj.offsetHeight, // 高
		Right: x + obj.offsetWidth, // 右
		Bottom: y1
		// 底
	};
}

// ----------------移动对象-----------------------
var EWA$UI$COMMON$Move = {
	OnMouseDown: function(obj, evt, objMove, isX, isY) {
		obj.setAttribute("D", 1);
		var e = EWA$UI$COMMON.Move._Event(obj, evt);
		var xy = EWA$UI$COMMON.Move._EventXY(e);
		if (isX == null || isX) {
			obj.setAttribute("X", xy.X);
			obj.setAttribute("SX", xy.X);
		}
		if (isY == null || isY) {
			obj.setAttribute("Y", xy.Y);
			obj.setAttribute("SY", xy.Y);
		}
		if (typeof e.preventDefault != "undefined") {
			e.preventDefault();
		}
		typeof e.stopPropagation != "undefined" ? e.stopPropagation() : e.cancelBubble = true;
	},
	OnMouseUp: function(obj) {
		obj.setAttribute("D", 0);
	},
	OnMouseOut: function(obj) {
		if (obj.getAttribute("D") == "1") {
			obj.setAttribute("D", 0);
		}
	},
	OnMouseMove: function(obj, evt) {
		if (obj.getAttribute("D") != "1") {
			return;
		}
		var e = EWA$UI$COMMON.Move._Event(obj, evt);
		var xy = EWA$UI$COMMON.Move._EventXY(e);
		if (obj.getAttribute("X") != null) {
			var x0 = obj.getAttribute("X") * 1;
			var dx = xy.X - x0;
			obj.style.left = obj.style.left.replace("px", "") * 1 + dx + "px";
			obj.setAttribute("X", xy.X);
		}
		if (obj.getAttribute("Y") != null) {
			var y0 = obj.getAttribute("Y") * 1;
			var dy = xy.Y - y0;
			obj.style.top = obj.style.top.replace("px", "") * 1 + dy + "px";
			obj.setAttribute("Y", xy.Y);
		}
		if (typeof e.preventDefault != "undefined") {
			e.preventDefault();
		}
		typeof e.stopPropagation != "undefined" ? e.stopPropagation() : e.cancelBubble = true;
	},
	_Event: function(obj, evt) {
		if (evt) {
			return evt;
		} else {
			return obj.ownerDocument.parentWindow.event;
		}
	},
	_EventXY: function(e) {
		if (EWA.B.IE) {
			return {
				X: e.x,
				Y: e.y
			};
		} else {
			return {
				X: e.pageX,
				Y: e.pageY
			};
		}
	}
};
// ---------------UI公共方法------------------------
var EWA$UI$COMMON = {
	Move: EWA$UI$COMMON$Move,
	/**
	 * 获取鼠标位置
	 * 
	 * @return {}
	 */
	GetMousePosition: function(e) {
		if (e == null) {
			e = event;
		}
		if (EWA.B.IE) {
			return {
				X: e.x,
				Y: e.y
			};
		} else {
			return {
				X: e.pageX,
				Y: e.pageY
			};
		}
	},
	/**
	 * 
	 * @param {}
	 *            objWindow
	 * @param {}
	 *            objTag
	 * @param {}
	 *            objStyle
	 * @param {}
	 *            objParent
	 * @return {}
	 */
	CreateObject: function(objWindow, objTag, objStyle, objParent) { // 生成新对象
		/**
		 * 在指定的目标窗口(objWindow)中生成新对象 objWindow 生成对象的窗体 objTag 对象的 tagName
		 * objStyle 对象的样式 objParent 对象的母体
		 */
		var obj = objWindow.document.createElement(objTag);
		if (objStyle != null && objStyle.trim().length > 0) {
			if (EWA.B.IE) {
				obj.style.cssText = objStyle;
			} else {
				obj.setAttribute("style", objStyle);
			}
		}
		if (objParent != null) {
			objParent.appendChild(obj);
		}
		return obj;
	},
	SetStyle: function(obj, style) {
		if (EWA.B.IE) {
			obj.style.cssText = style;
		} else {
			obj.setAttribute("style", style);
		}
	},
	GetPosition: function(obj) { // 计算位置
		var o1 = obj;
		var x,
			y;
		x = y = 0;
		do {
			x += o1.offsetLeft * 1;
			y += o1.offsetTop * 1;
			if (o1.tagName == "DIV") {
				x -= o1.scrollLeft;
				y -= o1.scrollTop;
			}
			o1 = o1.offsetParent;
		} while (o1 != null && o1.tagName != "BODY" && o1.tagName != "HTML");
		y += obj.offsetHeight * 1;
		var location = {
			X: x,
			Y: y
		};
		return location;
	},
	Dispose: function(obj) { // 注销对象和子对象方法，避免IE内存泄露
		if (!EWA.B.IE) {
			return;
		}
		if (obj.attributes != null) {
			for (var i = 0; i < obj.attributes.length; i += 1) {
				if (obj.attributes[i] != null && typeof obj.attributes[i] == "function") {
					obj.attributes[i] = null;
				}
			}
		}
		for (var i = 0; i < obj.childNodes.length; i += 1) {
			EWA$UI$COMMON.Dispose(obj.childNodes[i]);
		}
	},
	Drop: function(obj) {
		EWA$UI$COMMON.Dispose(obj);
		obj.parentNode.removeChild(obj);
	},
	/**
	 * 动画扩展对象，开始大小，目标大小
	 * 
	 * @param {}
	 *            obj
	 * @param {Integer}
	 *            expandedWidth
	 * @param {Integer}
	 *            expandedHeight
	 * @param {Integer}
	 *            inc
	 */
	AniExpand: function(obj, expandedWidth, expandedHeight, inc, expandType) {
		if (inc == null || inc <= 0) {
			inc = 10;
		}
		var incc = 0;
		var dx = expandedWidth / (inc * 1.0);
		var dy = expandedHeight / (inc * 1.0);
		var maxX = obj.clientWidth + expandedWidth;
		var maxY = obj.clientHeight + expandedHeight;
		// document.title=maxX+','+maxY+','+obj.clientWidth+','+obj.clientHeight;
		var t = window.setInterval(function() {
			var size = EWA$UI$COMMON.GetObjSize(obj);
			if (incc < inc - 1) {
				var h = size.H + dy;
				var w = size.W + dx;
				if (h > maxY) {
					h = maxY;
				}
				if (w > maxX) {
					w = maxX;
				}
				EWA$UI$COMMON.SetSize(obj, w, h);
			} else {
				EWA$UI$COMMON.SetSize(obj, maxX, maxY);
			}
			var size1 = EWA$UI$COMMON.GetObjSize(obj);
			var ddx = size1.W - size.W;
			var ddy = size1.H - size.H;

			var loc = EWA$UI$COMMON.GetPosition(obj);
			loc.Y = loc.Y - obj.clientHeight - obj.style.borderTopWidth.replace('px', '') * 1
				- obj.style.borderBottomWidth.replace('px', '') * 1;
			if (expandType == 'LEFT_TOP') {
				// nothing to do;
			} else if (expandType == 'LEFT_BOTTOM') {
				var top = loc.Y - ddy;
				var left = loc.X;
				EWA$UI$COMMON.MoveTo(obj, left, top);
			} else if (expandType == 'RIGHT_TOP') {
				var top = loc.Y;
				var left = loc.X - ddx;
				EWA$UI$COMMON.MoveTo(obj, left, top);
			} else if (expandType == 'RIGHT_BOTTOM') {
				var top = loc.Y - ddy;
				var left = loc.X - ddx;
				EWA$UI$COMMON.MoveTo(obj, left, top);
			} else {
				var top = loc.Y * 1 - ddy / 2;
				var left = loc.X * 1 - ddx / 2;
				// obj.innerHTML=obj.innerHTML+'<br>'+left+','+top+','+ddx+','+ddy+','+loc.Y;
				EWA$UI$COMMON.MoveTo(obj, left, top);
				EWA._TmpAniObj = obj;
			}
			incc++;
			if (incc >= inc) {
				window.clearInterval(t);
				if (EWA.UI.Utils.AniExpandCompleateFunction) {
					EWA.UI.Utils.AniExpandCompleateFunction();
					EWA.UI.Utils.AniExpandCompleateFunction = null;
				}
			}
		}, 12);
	},
	AniExpandTo: function(obj, dW, dH, inc, expandType) {
		if (inc == null || inc <= 0) {
			inc = 10;
		}
		var size = EWA$UI$COMMON.GetObjSize(obj);
		var expW = dW - size.W;
		var expH = dH - size.H;
		this.AniExpand(obj, expW, expH, inc, expandType);
	},
	SetSize: function(obj, width, height) {
		obj.style.width = width + 'px';
		obj.style.height = height + 'px';
	},
	MoveTo: function(obj, x, y) {
		obj.style.left = x + 'px';
		obj.style.top = y + 'px';
	},
	MoveCenter: function(obj) {
		// var xy = this.GetPosition(obj);
		var win = this._GetOwnerWindow(obj);

		var size = this.GetObjSize(obj);
		var docSize = this.GetDocSize(win);
		var dx = (docSize.W - size.W) / 2;
		var dy = (docSize.H - size.H) / 2;
		this.MoveTo(obj, dx, dy);
	},
	GetObjSize: function(obj) {
		var w = obj.clientWidth;
		var h = obj.clientHeight;
		return {
			H: h,
			W: w
		};
	},
	/**
	 * 获取窗体尺寸
	 * 
	 * @param {}
	 *            win
	 * @return {}
	 */
	GetDocSize: function(win) {
		if (win == null) {
			win = window;
		}
		var doc = win.document;
		var w = doc.body.clientWidth;
		var h = doc.compatMode == "CSS1Compat" ? doc.documentElement.clientHeight : doc.body.clientHeight;
		var h3 = win.document.body.scrollTop;
		var w3 = win.document.body.scrollLeft;
		return {
			W: w,
			H: h,
			SH: h3, // 滚动条高度
			SW: w3
			// 滚动条宽度
		};
	},
	_GetOwnerWindow: function(obj) {
		return EWA.B.IE ? obj.ownerDocument.parentWindow : obj.ownerDocument.defaultView;
	}
};
// ---------------------------------------

EWA.UI.Utils = EWA$UI$COMMON;

EWA.UI.ImgResize = function(oImg, width, height) { }



// 检查Iframe是否加载完毕;
function EWA_ChkIframeOk(f, func) {
	var w = f.contentWindow;
	if (w.location && w.location.href != 'about:blank' && w.document && w.document.readyState == 'complete') {
		if (func) {
			func(w, f);
		}
	} else {
		setTimeout(function() {
			EWA_ChkIframeOk(f, func)
		}, 111);
	}
}
// 从 ewa_ad 挪过来
EWA.UI.Utils.FadeIn = function(objIn, objOut, step, timeSpan, afterFunction) {
	if (objIn == objOut) {
		return;
	}
	objOut.setAttribute('alpha', 100);
	objIn.style.display = '';
	objIn.style.zIndex = -1000;
	objIn.style.filter = 'Alpha(Opacity=100)';
	objIn.style.opacity = 1;

	objOut.style.zIndex = 1000;
	objOut.style.display = '';
	objOut.style.filter = 'Alpha(Opacity=100)';
	objOut.style.opacity = 1;

	EWA.UI.Utils.FADE_IN_OBJ = objIn;
	EWA.UI.Utils.FADE_OUT_OBJ = objOut;
	EWA.UI.Utils.FADE_STEP = step;
	EWA.UI.Utils.FADE_TIME_SPAN = timeSpan;
	EWA.UI.Utils.FADE_AFTER = afterFunction;

	window.setTimeout(EWA.UI.Utils.FadeInTimer, EWA.UI.Utils.FADE_TIME_SPAN);
};
EWA.UI.Utils.FadeInTimer = function() {
	try {
		var alpha = EWA.UI.Utils.FADE_OUT_OBJ.getAttribute('alpha') * 1 - EWA.UI.Utils.FADE_STEP;
		EWA.UI.Utils.FADE_OUT_OBJ.setAttribute('alpha', alpha);
		if (alpha <= 0) {
			EWA.UI.Utils.FADE_OUT_OBJ.style.display = 'none';
			EWA.UI.Utils.FADE_OUT_OBJ.setAttribute('alpha', 0);

			EWA.UI.Utils.FADE_OUT_OBJ.style.filter = 'Alpha(Opacity=100)';
			EWA.UI.Utils.FADE_OUT_OBJ.style.opacity = 1;

			EWA.UI.Utils.FADE_AFTER.ChangeAfter();

			EWA.UI.Utils.FADE_IN_OBJ = null;
			EWA.UI.Utils.FADE_OUT_OBJ = null;
			EWA.UI.Utils.FADE_STEP = null;
			EWA.UI.Utils.FADE_TIME_SPAN = null;
			EWA.UI.Utils.FADE_AFTER = null;
			return;
		}
		EWA.UI.Utils.FADE_OUT_OBJ.style.filter = 'Alpha(Opacity=' + alpha + ')';
		EWA.UI.Utils.FADE_OUT_OBJ.style.opacity = alpha * 1.0 / 100.0;
	} catch (e) { }
	window.setTimeout(EWA.UI.Utils.FadeInTimer, EWA.UI.Utils.FADE_TIME_SPAN);
};
/**
 * iframe 自适应高度
 *
 * 用法：EWA.UI.Iframe.autoHeight(iframes, cb);
 *
 * iframes 传 iframe 元素本身，支持：单个元素、数组、NodeList、HTMLCollection、
 * jQuery 对象、选择器字符串（内部用 document.querySelectorAll）。
 * 高度设置到 iframe.parentNode 上，不是 iframe 自身：iframe 通常 height:100%，
 * 父元素撑开后 iframe 自然铺满，不会出现内部滚动条。
 *
 * 所有已注册 iframe 共用一个 500ms 定时器；内容变化在下一轮询生效。
 * 不可见（display:none、祖先隐藏、visibility:hidden）时跳过，不测高度、不改父元素、不回调。
 *
 * 多个 iframe 可以共用同一个父元素（按钮先后创建 iframe、tab 切换）：
 * 谁可见就按谁的内容高度设置父元素；从隐藏恢复时会重新应用高度，
 * 避免沿用另一个 iframe 留下的高度。
 */
EWA.UI.Iframe = EWA.UI.Iframe || {};
(function() {
	var INTERVAL = 500; // 轮询间隔（毫秒）
	var items = []; // 注册表：{ iframe, cb, height }
	var timer = null; // 共享定时器，注册表为空时置空

	/**
	 * 统一整理为可按 length/下标遍历的集合
	 *
	 * 选择器字符串交给 querySelectorAll；单个 DOM 包成数组；
	 * 数组、NodeList、HTMLCollection、jQuery 对象本身已满足遍历条件，原样返回。
	 */
	function toList(iframes) {
		if (typeof iframes == 'string') {
			return document.querySelectorAll(iframes);
		}
		if (iframes && iframes.tagName) {
			return [ iframes ];
		}
		return iframes || [];
	}

	/**
	 * 获取 iframe 内容高度（不含 iframe 自身的边框和内边距）
	 *
	 * 用 body.scrollHeight 加 body 上下 margin；不能用 documentElement.scrollHeight，
	 * 因为它等于 max(内容高度, 当前 iframe 视口高度)，父元素一旦被撑高就缩不回来。
	 * 跨域、文档未加载完成或内容为空时返回 0。
	 */
	function getContentHeight(iframe) {
		var doc;
		try {
			doc = iframe.contentDocument
					|| (iframe.contentWindow && iframe.contentWindow.document);
		} catch (e) {
			return 0; // 跨域
		}
		if (!doc || !doc.body) {
			return 0;
		}
		// 不用 documentElement.scrollHeight：它包含当前 iframe 视口高度，会导致只能变高不能变矮
		var h = doc.body.scrollHeight;
		var style = doc.defaultView && doc.defaultView.getComputedStyle
				? doc.defaultView.getComputedStyle(doc.body, null) : null;
		if (style) {
			h += (parseFloat(style.marginTop) || 0)
					+ (parseFloat(style.marginBottom) || 0);
		}
		if (h <= 0 && doc.documentElement) {
			h = doc.documentElement.scrollHeight;
		}
		return h > 0 ? Math.ceil(h) : 0;
	}

	/**
	 * iframe 是否可见
	 *
	 * getClientRects().length == 0 覆盖 display:none、祖先 display:none、尚未参与布局；
	 * visibility:hidden 会继承，用计算样式判断。opacity:0 仍占布局，按可见处理。
	 */
	function isVisible(o) {
		if (o.getClientRects && o.getClientRects().length == 0) {
			return false; // display:none 或尚未参与布局
		}
		var win = o.ownerDocument && o.ownerDocument.defaultView || window;
		var style = win && win.getComputedStyle
				? win.getComputedStyle(o, null) : null;
		return !style || style.visibility != 'hidden';
	}

	/**
	 * 测量并更新 iframe 父元素高度
	 *
	 * 只在可见、能取到内容高度且父元素可写时处理；不可见时保留注册信息，
	 * 等下次可见再测量，避免隐藏的 iframe 反复触发布局计算。
	 *
	 * 从不可见恢复为可见时，即使内容高度没变也重新写一次父元素高度并回调：
	 * 多个 iframe 可能共用同一个父元素（切换显示的 tab / 先后创建的 iframe），
	 * 父元素高度可能已被另一个可见 iframe 改掉，不能只看自己缓存的高度。
	 */
	function update(item) {
		var o = item.iframe;
		if (!isVisible(o)) {
			item.visible = false;
			return; // 不可见时不处理，等下次可见再测量
		}
		var p = o.parentNode;
		if (!p || !p.style) {
			return;
		}
		var h = getContentHeight(o);
		if (h <= 0) {
			return; // 跨域、未加载完成或内容为空
		}
		var justShown = !item.visible; // 隐藏期间父元素高度可能已被别的 iframe 覆盖
		item.visible = true;
		var changed = h != item.height;
		if (changed || justShown) {
			item.height = h;
			// 设置父元素高度，iframe 以 100% 高度撑满后不再出现滚动条
			p.style.height = h + 'px';
		}
		if (changed || justShown || !item.notified) {
			item.notified = true; // 先标记，避免回调报错后每个周期重复通知
			if (item.cb) {
				item.cb(o, h);
			}
		}
	}

	/**
	 * 定时轮询入口
	 *
	 * 从后往前遍历，便于原地删除已从 DOM 移除的 iframe；
	 * 注册表为空时停掉定时器，避免空转。
	 */
	function tick() {
		for (var i = items.length - 1; i >= 0; i--) {
			var item = items[i];
			if (!item.iframe.parentNode) { // 已从文档移除
				items.splice(i, 1);
				continue;
			}
			update(item);
		}
		if (items.length == 0) {
			clearInterval(timer);
			timer = null;
		}
	}

	/**
	 * 开始监控 iframe，并把内容高度设置到 iframe 的父元素上
	 *
	 * @param {Object}
	 *            iframes 单个 iframe 元素 / 数组 / NodeList / HTMLCollection /
	 *            jQuery 对象 / 选择器字符串；非 IFRAME 节点会忽略
	 * @param {Function}
	 *            cb 可选，高度变化回调，参数为(iframeDom, height)；
	 *            注册时若 iframe 可见会立即回调一次。同一 iframe 重复注册时，
	 *            新 cb 会替换旧 cb，并以当前高度补一次回调（传同一个函数不会重复回调）
	 * @example
	 *            EWA.UI.Iframe.autoHeight($('#box').find('iframe'), function(f, h) {
	 *                console.log(f.id, h);
	 *            });
	 */
	EWA.UI.Iframe.autoHeight = function(iframes, cb) {
		var list = toList(iframes);
		for (var i = 0; i < list.length; i++) {
			var o = list[i];
			if (!o || !o.tagName || o.tagName.toUpperCase() != 'IFRAME') {
				continue;
			}
			// 同一个 iframe 重复注册时只更新回调，避免重复登记和多个定时器
			var item = null;
			for (var k = 0; k < items.length; k++) {
				if (items[k].iframe == o) {
					item = items[k];
					break;
				}
			}
			if (!item) {
				item = {
					iframe : o,
					cb : null,
					height : -1,
					notified : false,
					visible : false
				};
				items.push(item);
			}
			if (typeof cb == 'function' && cb !== item.cb) {
				item.cb = cb;
				item.notified = false; // 新回调需要补一次当前高度
			}
			// 注册后立即测一次，不用等第一个 500ms 周期
			update(item);
		}
		if (items.length > 0 && !timer) {
			timer = setInterval(tick, INTERVAL);
		}
	};
	/**
	 * 停止监控
	 *
	 * @param {Object}
	 *            iframes 同 autoHeight 的参数；不传则停止全部。
	 *            传选择器时会在调用时重新查询，元素已被移除时请改传元素引用。
	 */
	EWA.UI.Iframe.stop = function(iframes) {
		if (iframes == null) {
			items.length = 0;
		} else {
			var list = toList(iframes);
			for (var i = 0; i < list.length; i++) {
				for (var k = items.length - 1; k >= 0; k--) {
					if (items[k].iframe == list[i]) {
						items.splice(k, 1);
					}
				}
			}
		}
		if (items.length == 0 && timer) {
			clearInterval(timer);
			timer = null;
		}
	};
})();
