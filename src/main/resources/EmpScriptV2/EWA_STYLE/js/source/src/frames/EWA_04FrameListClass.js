// --------------------class of listFrame----------------
function EWA_ListFrameClass() {

	this.Xml = null;
	this._Ajax = null;
	this.ItemList = new EWA_FrameCommonItems();
	this._PageCurrent = null;
	this._PageSize = null;
	this._PageCount = null;
	this._RecordCount = null;
	this._PageCurrentName = null;
	this._PageSizeName = null;
	this._PageCountName = null;
	this._RecordCountName = null;
	this._Sort = null;
	this._SortName = null;
	this._SearchExp = ""; // 检索表达式
	this._SearchHtml = null;
	this._SearchFields = new Array();
	this._Id = null;
	this._IsCheckedAll = true;
	this._SearchDialog = null;
	this._SearchJson = {};
	this.Resources = {}; // EWA_FrameResoure
	this.GotoParas = [];
	this._CurTr = null;
	this._TrSelectMulti = true; // 是否多选
	this.IsTrSelect = false; // 是否可以选择行
	this.ReloadAfter = null; // Ajax刷新后的事件，用户定义
	this.CheckedAllAfter = null; // 全选后的时间，用户定义
	this.IsNotMDownAutoChecked = false; // 自动选择checkbox radio;

	/**
	* 根据ajax请求，替换当前表中对应的行数据
	 */
	this.replaceRowsData = function(searchExp, replaceFuntion) {
		let u = this.getUrlClass();
		u.AddParameter("EWA_AJAX", "LF_RELOAD");
		u.AddParameter("EWA_IS_SPLIT_PAGE", "no");
		u.AddParameter("EWA_IS_HIDDEN_CAPTION", "yes");

		let url = u.GetUrl();
		if (searchExp) {
			url += "&" + searchExp;
		}

		let tb = $('#EWA_LF_' + this._Id);
		$J2(url, function(resultHtml) {
			$(resultHtml).find('tr.ewa-lf-data-row').each(function() {
				let key = $(this).attr('ewa_key');
				// 当前行数据
				let tr = tb.find('tr[ewa_key="' + key + '"]');
				// console.log(obj);
				$(this).find('td').each(function() {
					let name = $(this).children(0).attr("name");
					if (!name) {
						return;
					}
					// 查找对应的 td
					let td = tr.find('.ewa-col-' + name);
					if (td.length == 0) {
						return;
					}
					if (replaceFuntion) {
						// replaceFuntion (ajaxTD, TD)
						replaceFuntion(this, td[0]);
					} else {
						td.html($(this).html());
					}
				});
			});
		});
	};

	/**
	 * 添加回收站标志
	 */
	this.ShowRecycle = function() {
		var tb = $X('EWA_LF_' + this._Id);
		if (tb == null) {
			// console.log('not found table[#EWA_LF_' + this._Id + "]");
			return;
		}
		var t = $(tb).parentsUntil('table').last().find('.ewa_lf_func_caption');
		if (t.length == 0) {
			// console.log('not found table[#EWA_LF_' + this._Id + "]
			// .ewa_lf_func_caption");
			return;

		}
		var recycle_name = '回收站';
		if (window._EWA_INFO_MSG && window._EWA_INFO_MSG.RECYCLE) {
			recycle_name = window._EWA_INFO_MSG.RECYCLE;
		}
		var s = "<div class='ewa_lf_func_dact ewa-lf-func-recycle' onclick='EWA.F.FOS[\"" + this._Id + "\"].ShowRecycle1(this)' ><b class='fa fa-recycle'></b>"
			+ recycle_name + "</div>";
		t.parent().append(s);
	};
	/**
	 * 切换回收站内容
	 */
	this.ShowRecycle1 = function(obj) {
		var u1 = new EWA_UrlClass(this.Url);
		var u;
		if ($(obj).attr('recycle')) {
			u = u1.RemoveParameter("ewa_recycle");
			$(obj).attr('recycle', null).removeClass('ewa-lf-func-recycle-yes');
		} else {
			u = u1.AddParameter("ewa_recycle", "1");
			$(obj).attr('recycle', 1).addClass('ewa-lf-func-recycle-yes');
		}
		this.Url = u;
		this.Goto(1);
	};
	this.BindButton = function(from, to) {
		$('#EWA_LF_' + this._Id + ' tr[ewa_key] [id="' + from + '"]').each(function() {
			$(this).attr('onclick', '$(this).parent().parent().find(\'[id="' + to + '"]\')[0].click()');
			$(this).addClass('ewa-map-button');
		});
	};
	/**
	 * 合并单元格内容, 同时隐含来源的格子
	 */
	this.Merge = function(from, to, meargeStr, func) {
		$('#EWA_LF_' + this._Id + ' tr[ewa_key]').each(function() {
			var fromobj = $(this).find('[id="' + from + '"]');
			fromobj.parent().hide();
			var t = $(this).find('[id="' + to + '"]');

			var p = t.parentsUntil('tr').last();
			if (!meargeStr) {
				meargeStr = "<br>"
			}
			if (meargeStr.indexOf('<') >= 0) {
				p.append(meargeStr);
			} else {
				p.append("<span class='ewa-mearge-str'>" + meargeStr + "</span>");
			}
			p.append(fromobj);
			if (func) {
				func(p, this); // td, tr
			}
		});
		$('#EWA_LF_' + this._Id + ' tr[ewa_tag="HEADER"] [id="' + from + '"]').parent().hide();
	};
	this.Mearge = function(from, to, meargeStr) {
		console.log('拼写错误，请用 Merge')
		this.Merge(from, to, meargeStr);
	};
	/**
	 * 根据表达式合并单元格
	 * 
	 * @param toParent
	 *            合并到的对象的id
	 * @param mergeExp
	 *            表达式
	 * @param isAddMemo
	 *            是否添加备注
	 * @param funcEachRow
	 *            每行合并完成后执行的方法
	 */
	this.MergeExp = function(toParent, mergeExp, isAddMemo, funcEachRow) {
		if (!mergeExp) {
			console.log("mergeExp 没有设置");
			return;
		}
		// meargeExp="@id1 x @id2 = @id3 (@id4)"
		var r1 = /\@\@[a-zA-Z0-9\-\._:]*\b/ig;
		var m1 = mergeExp.match(r1);
		var paras = [];
		var tmp_html = mergeExp;
		var memos = {};
		for (var i = 0; i < m1.length; i++) {
			var key = m1[i];
			paras.push(key);
			var id = key.replace('@@', '');
			tmp_html = tmp_html.replace(key, "<span class='ewa-lf-mearge ewa-lf-mearge-" + id + "' mid=\"" + id + "\"></span>");
			if (id != toParent) {
				$('#EWA_LF_' + this._Id + ' tr[ewa_tag="HEADER"] [id="' + id + '"]').parent().hide();
			}
			memos[id] = $('#EWA_LF_' + this._Id + ' tr[ewa_tag="HEADER"] [id="' + id + '"]').html();
		}

		$('#EWA_LF_' + this._Id + ' tr[ewa_key]').each(function() {
			var o1 = document.createElement('div');
			o1.style.display = 'none';
			o1.innerHTML = tmp_html;
			document.body.appendChild(o1);

			var target = $(this).find('[id="' + toParent + '"]');
			if (target.length == 0) {
				console.log('not find ' + toParent);
				return;
			}
			// td
			var p = $(this).find('[id="' + toParent + '"]').parent();
			var tmp = mergeExp;
			for (var n in paras) {
				var exp = paras[n];
				var key = exp.replace('@@', '');
				var o = $(this).find('[id="' + key + "\"]");
				if (o.length == 0) {
					continue;
				}
				if (key != toParent) {
					o.parent().hide();
				}
				var t = $(o1).find('span[mid="' + key + '"]');
				if (isAddMemo) {
					t.append("<span class='ewa-lf-mearge-memo'></span>");
					t.find('.ewa-lf-mearge-memo').html(memos[key]);
				}
				t.append(o);
			}
			while (o1.childNodes.length > 0) {
				p.append(o1.childNodes[0]);
			}
			$(o1).remove();
			if (funcEachRow) {
				funcEachRow(p, this); // td, tr
			}
		});
	};
	this.MeargeExp = function(toParent, meargeExp, isAddMemo, func) {
		console.log('拼写错误，请用 MereExp');
		this.MergeExp(toParent, meargeExp, isAddMemo, func);
	}
	/**
	 * 在页面底部添加合计数
	 */
	this.SubBottoms = function(ids) {
		this.SubBottomsArray = ids.split(',');
		this._SubBottoms();
	}
	this._SubBottoms = function() {
		var r = this.AddRow([]);
		$(r).find('td').addClass('ewa-lf-sub-td');
		var fm_length = 0;
		for (var i in this.SubBottomsArray) {
			var id = this.SubBottomsArray[i];
			var total = 0;
			var exp = '#EWA_LF_' + this._Id + ' .ewa-col-' + id + '';
			$(exp).each(function() {
				var v = GetInnerText(this).replace(/,/ig, '');
				if (!isNaN(v)) {
					total += v * 1;
					if (v.indexOf(".") > 0) {
						fm_length = 2;
					}
				}
			});
			$(r).find('td[id=ADD_ROW_' + id + "]").html("<nobr class='ewa-lf-sub'>" + total.fm(fm_length) + "</nobr>");
		}
	};

	this.ChangeRowStyle = function(checkColIdx, atttName, styleJson) {
		var tb = $X('EWA_LF_' + this._Id);
		for (var i = 1; i < tb.rows.length; i++) {
			var r = tb.rows[i];
			if (r.cells.length == 0 || r.cells.length <= checkColIdx) {
				continue;
			}
			var v = r.cells[checkColIdx].childNodes[0].getAttribute(atttName);
			if (v == null) {
				continue;
			}
			if (styleJson[v]) {
				for (var m = 0; m < r.cells.length; m++) {
					r.cells[m].style.cssText = r.cells[m].style.cssText + ';' + styleJson[v];
				}
			}
		}
		if (this.ReloadAfter == null) {
			var c = this;
			this.ReloadAfter = function() {
				c.ChangeRowStyle(checkColIdx, atttName, styleJson);
			}
		}

	}
	this.MDownEvent = function(tr, evt) {
		// change to your event
	};
	/**
	 * 加载配置文件的JSON
	 * 
	 * @param {}
	 *            actionName 执行的加载名称
	 * @param {}
	 *            func 回调的方法名称
	 */
	this.LoadJson = function(actionName, func) {
		if (actionName == null) {
			return;
		}
		var u = this.Url + '&EWA_ACTION=' + actionName + '&EWA_AJAX=JSON';
		$J(u, func);
	};

	/**
	 * 调用工作流
	 * 
	 * @param {}
	 *            unitType 单元类型
	 * @param {}
	 *            name 名称
	 * @param {}
	 *            obj 来源对象
	 * @param {}
	 *            keyValue 当前行的Key值
	 * @param {}
	 *            uOk 是否用户同意
	 * @param {}
	 *            uMsg 附加用户信息
	 */
	this.Workflow = function(unitType, name, obj, keyValue, uOk, uMsg) {
		EWA.F.CID = this._Id;

		this._Ajax = this.CreateAjax();

		this._Ajax.AddParameter("EWA_AJAX", "WORKFLOW");
		this._Ajax.AddParameter("EWA_ID", this._Id);
		this._Ajax.AddParameter("EWA_WF_NAME", name);

		// this.StopAjaxAfterReload = true;
		// this._Ajax.AddParameter("EWA_ACTION_RELOAD", "0");
		var inc = 0;
		if (obj != null) { // ListFrame每行的主键值
			var key = this.GetRowKey(obj);
			this._Ajax.AddParameter("EWA_ACTION_KEY", key);
			if (obj.getAttribute('ewa_wf_control') == 'true') {
				this._Ajax.AddParameter("EWA_WF_CTRL", 1);
			} else {
				this._Ajax.AddParameter("EWA_WF_CTRL", 0);
			}
		} else {
			// 从Frame中调用
			this._Ajax.AddParameter("EWA_WF_CTRL", 1);
		}
		if (keyValue != null) {
			this._Ajax.AddParameter("EWA_ACTION_KEY", keyValue);

		}
		if (uOk) {
			this._Ajax.AddParameter("EWA_WF_UOK", uOk);
		}
		if (uMsg) {
			this._Ajax.AddParameter("EWA_WF_UMSG", uMsg);
		}
		var c = this;
		this._Ajax.PostNew(this.Url, function() {
			c._CallBackJs();
		});
	}
	/**
	 * ListFrame每行的主键值
	 * 
	 * @param {}
	 *            obj
	 * @return {}
	 */
	this.GetRowKey = function(obj) {
		var tr = this.GetRow(obj);
		if (tr != null) {
			var key = tr.getAttribute("EWA_KEY");
			return key;
		}
		return null;
	}

	this.GetRow = function(obj) {
		if (obj == null || obj.tagName == null || obj.tagName == '') {
			return null;
		}
		var inc = 0;
		var tr = obj.parentNode;
		while (!(tr.tagName == 'TR' && tr.getAttribute('EWA_KEY') != null)) {
			tr = tr.parentNode;
			if (tr.tagName == 'BODY') {
				tr = null;
				break;
			}
			inc++;
			if (inc > 100) {
				alert('循环100次，未发现TR');
				break;
			}
		}
		return tr;

	}
	this.RecordModify = function(xmlName, itemName, addParas) {
		var ids = this.SelectChecked();
		if (ids.length == 0) {
			EWA.UI.Msg.Alter("请先选择", "修改");
			return;
		}
		var id = ids;
		var q = window.location.search;
		// alert(q);
		var ps = "EWA_MTYPE=M";
		if (addParas != null && addParas.trim().length > 0) {
			ps += "&" + addParas;
		}
		ps += id;
		EWA.UI.Dialog.OpenReloadClose(this._Id, xmlName, itemName, false, ps);
	};
	this.RecordNew = function(xmlName, itemName, addParas) {
		var ps = "EWA_MTYPE=N";
		if (addParas != null && addParas.trim().length > 0) {
			ps += "&" + addParas;
		}
		EWA.UI.Dialog.OpenReloadClose(this._Id, xmlName, itemName, false, ps);
	};
	this.SelectSingle = function() {
		this.IsTrSelect = true;
		this._TrSelectMulti = false;
	};
	this.SelectMulti = function() {
		this.IsTrSelect = true;
		this._TrSelectMulti = true;
	};
	this.MOver = function(tr, evt) {
		if (!this.IsTrSelect)
			return;
		if (this._CurTr == tr) {
			return;
		}
		if (this._CurTr != null) {
			if (this._CurTr.getAttribute('__ewa_lf_mdown') != '1') {
				this._MSetBg(this._CurTr, '');
			} else {
				this._MSetBg(this._CurTr, 'down');
			}
		}
		if (tr.getAttribute('__ewa_lf_mdown') != '1') {
			this._MSetBg(tr, 'over');
		} else {
			this._MSetBg(tr, 'down');
		}
		this._CurTr = tr;
		if (this.MOverEvent) {
			try {
				this.MOverEvent(tr, evt);
			} catch (e) {
				console.log(e, this.MOverEvent);
			}
		}
	};

	this.MOut = function(evt) {
		if (!this.IsTrSelect)
			return;

		if (this._CurTr == null) {
			return;
		}

		var className = 'EWA_TD_M';
		if (this._CurTr.getAttribute('__ewa_lf_mdown') == '1') {
			return;
		}
		// for (var i = 0; i < this._CurTr.cells.length; i++) {
		// $(this._CurTr.cells[i]).removeClass('ewa_grid_down')
		// }
		this._MSetBg(this._CurTr, 'out');
		if (this.MOutEvent) {
			try {
				this.MOutEvent(this._CurTr, evt);
			} catch (e) {
				console.log(e, this.MOutEvent);
			}
		}
		this._CurTr = null;

	};
	/**
	 * 检查是否可以进行行点击事件，用户可以注册此事件
	 */
	this.MDownEnableCheck = function(tr, evt) {
		return true
	};
	this.MDown = function(tr, evt) {
		if (!this.IsTrSelect)
			return;
		var evt = evt == null ? event : evt;
		if (!this.MDownEnableCheck(tr)) {
			return;
		}
		if (evt) {// 如果没有event,则不检测
			var target = evt.srcElement ? evt.srcElement : evt.target;
			if (target
				&& (target.tagName == 'A' || target.tagName == 'INPUT' || target.tagName == 'SELECT' || target.tagName == 'BUTTON'
					|| target.tagName == 'TEXTAREA' || target.className.indexOf("EWA_LF_EDIT") >= 0 || target.className.indexOf("ewa-lf-edit") >= 0
					|| target.className.indexOf("ewa-lf-search-text-click") >= 0
					|| target.parentNode.className.indexOf("ewa-lf-search-text-click") >= 0 || target.parentNode.parentNode.className
						.indexOf("ewa-lf-search-text-click") >= 0)) {
				return;
			}
		}
		var t = new Date().getTime();
		var ot = $(tr).attr('mdown_time_last');
		if (ot != null && t - ot < 500) {// 两次事件间隔小余0.5s
			return;
		}
		$(tr).attr('mdown_time_last', t);
		var chk = null;
		if (!this.IsNotMDownAutoChecked) {// 允许自动选择
			var objs = tr.getElementsByTagName('input');
			if (target.tagName != 'INPUT' && objs.length > 0) {
				for (var i = 0; i < objs.length; i++) {
					if (objs[i].type.toUpperCase() == 'RADIO') {
						chk = objs[i];
						chk.click();
						break;
					}
					if (objs[i].type.toUpperCase() == 'CHECKBOX') {
						// switch 开关不执行
						if (objs[i].parentNode.className.indexOf('ewa-switch') < 0) {
							chk = objs[i];
							chk.click();
							break;
						}
					}
				}
			}
		}
		if (tr.getAttribute('__ewa_lf_mdown') == '1') {
			if (this._TrSelectMulti) { // 多选取消选择
				if (chk && chk.type.toUpperCase() == 'CHECKBOX') {
					chk.checked = false;
				}
				this._MSetBg(tr, '');
				tr.removeAttribute('__ewa_lf_mdown');
				$(tr).removeClass('ewa-lf-mdown');
			} else {
				// 单选保持状态
			}
		} else {
			if (chk) {
				chk.checked = true;
			}
			this._MSetBg(tr, 'down');
			tr.setAttribute('__ewa_lf_mdown', 1);
			$(tr).addClass('ewa-lf-mdown');
			if (!this._TrSelectMulti) {
				var tb = tr.parentNode;
				if (tb && tb.rows) { // tr有可能被挪走了
					for (var i = 0; i < tb.rows.length; i++) {
						var tr1 = tb.rows[i];
						if (tr1.getAttribute('__ewa_lf_mdown') == '1' && tr1 != tr) {
							tr1.removeAttribute('__ewa_lf_mdown');
							$(tr1).removeClass('ewa-lf-mdown');
							this._MSetBg(tr1, '');
						}
					}
				}
			}
			if (this.IsReShow) {
				for (var i = 0; i < objs.length; i++) {
					if (objs[i].type.toUpperCase() == 'BUTTON') {
						var o = objs[i];
						if (o.getAttribute('disabled') == 'true' || o.getAttribute('disabled') == true || o.parentNode.getAttribute('disabled') == 'true'
							|| o.parentNode.getAttribute('disabled') == true) {
							this._ReshowButs[o.value].disabled = true;
							this._ReshowButs[o.value].style.display = 'none';
						} else {
							this._ReshowButs[o.value].disabled = false;
							this._ReshowButs[o.value].style.display = '';
						}
					}
				}
			}
		}
		if (this._IsAddPreRow) {
			var aid = tr.getAttribute('ewa_key');
			if (!this.AddPreRowCheck(tr, aid, evt)) {
				// 检查触发对象，用户改写，默认为true
				return;
			}
			var nextTr = tr.parentNode.rows[tr.rowIndex + 1];
			if (nextTr == null || nextTr.getAttribute('add_pre_row') != 1) {
				var o = tr.parentNode.parentNode; // tb
				var colspan = o.rows[0].cells.length;

				nextTr = o.insertRow(tr.rowIndex + 1);
				nextTr.setAttribute('add_pre_row', 1);
				var td = nextTr.insertCell(-1);
				td.innerHTML = "";
				td.colSpan = colspan;
				td.className = '';
				nextTr.style.display = 'none';
				td.id = ('EWA_LF_NR_' + this._Id + '_' + Math.random()).replace(".", "G");
				$(nextTr).addClass('ewa-lf-add-pre-row');
			}

			if (this.prevTr) {
				if (this.AddPreRowCloseBeforeEvent) {
					// 关闭前触发事件
					// 参数：FrameUnid, 当前行，当前行的key，下一行(要放置东西的行)，鼠标事件
					this.AddPreRowCloseBeforeEvent(this._Id, tr, aid, this.prevTr, evt);
				}
				this.prevTr.style.display = 'none';
				this.prevTr.cells[0].innerHTML = '';
				if (this.AddPreRowCloseEvent) {
					// 关闭显示触发事件
					// 参数：FrameUnid, 当前行，当前行的key，下一行(要放置东西的行)，鼠标事件
					this.AddPreRowCloseEvent(this._Id, tr, aid, this.prevTr, evt);
				}
			}

			if (this.prevTr == nextTr) {
				this.prevTr = null;
				return;
			}
			this.prevTr = nextTr;
			this.prevTr.style.display = '';
			// 参数：FrameUnid, 当前行，当前行的key，下一行(要放置东西的行)，鼠标事件
			this.MDownEvent(this._Id, tr, aid, this.prevTr, evt);
		} else {
			this.MDownEvent(tr, evt);
		}
	};
	/**
	 * 添加点击当前行，触发的在之后行显示的内容方法
	 * 
	 * @param func
	 *            function(frameUnid, tr, key, newTr, evt)
	 */
	this.AddPreRow = function(func) {
		if (!this._IsAddPreRow) {
			this.MDownEvent = func;
		}
		this._IsAddPreRow = true;
	};
	/**
	 * 检查是否可以执行 AddPreRow 的方法，返回true执行，false不执行<br>
	 * 用于覆盖
	 * 
	 * @param tr
	 *            事件当前行
	 * @param key
	 *            事件当前行的key(ewa_key)
	 * @param evt
	 *            event事件
	 * @returns true/false
	 */
	this.AddPreRowCheck = function(tr, key, evt) {
		// 检查触发对象，用户需要改写此方法
		return true;
	};
	/**
	 * 关闭显示之前触发事件
	 * 
	 * @param frameUnid
	 *            配置项的 unid
	 * @param tr
	 *            事件当前行
	 * @param key
	 *            当前行的key
	 * @param newTr
	 *            下一行(要放置东西的行)，只有一个单元格，其id是随机数，调用采用 newTr.cells[0]
	 * @param evt
	 *            event事件
	 */
	this.AddPreRowCloseBeforeEvent = function(frameUnid, tr, key, newTr, evt) {
		// 用户需要改写此方法
	};
	/**
	 * 关闭显示后触发事件
	 * 
	 * @param frameUnid
	 *            配置项的 unid
	 * @param tr
	 *            事件当前行
	 * @param key
	 *            当前行的key
	 * @param newTr
	 *            下一行(要放置东西的行)，只有一个单元格，其id是随机数，调用采用 newTr.cells[0]
	 * @param evt
	 *            event事件
	 */
	this.AddPreRowCloseEvent = function(frameUnid, tr, key, newTr, evt) {
		// 用户需要改写此方法
	};

	this._MSetBg = function(tr, type) {
		var className = 'EWA_TD_M';
		if (type == 'down') {
			className = 'ewa_grid_down';
		} else if (type == 'over') {
			className = 'ewa_grid_mover';
		}
		for (var i = 0; i < tr.cells.length; i++) {
			$(tr.cells[i]).removeClass('ewa_grid_mover ewa_grid_down EWA_TD_M').addClass(className);
		}
	};
	/**
	 * 用于检索辅助快速点击
	 */
	this._ReShowSearchQuick = function() {
		var c = this;

		var items = EWA_ListFrameClass.prototype.RESOURCES.search_text_items;
		var eq_item, lk_item; // 文字检索的 标签
		for (var n in items) {
			var item = items[n];
			if (item.Id == 'eq') { // 等于
				eq_item = item;
			}
			if (item.Id == 'lk') {// like
				lk_item = item;
			}
		}

		for (var n in this._SearchJson) {
			var o = this._SearchJson[n];
			if (!o.isSearchQuick) {
				continue;
			}

			var objs = $('#EWA_LF_' + this.Id + ' .ewa-lf-data-row [id="' + n + '"]');
			objs.bind('click', function(event) {
				event.stopPropagation();

				// 检索方式
				var search_tag = $(this).attr('search_tag');
				var search_value = $(this).text();
				var search_value1 = search_value;

				var ipt = $('table#EWA_SEARCH_ITEM_' + c.Id + ' .ewa-lf-search-item-ctl [name="' + this.id.toUpperCase() + '"]');

				if (search_tag == 'number' || search_tag == 'date') { // 日期和数字为2个输入框
					ipt = ipt.parentsUntil('.ewa-lf-search-item').last().find('input');
				}
				var q_obj = ipt.parentsUntil('.ewa-lf-search-item').last().find('a');

				console.log(event);
				if (search_tag == 'date') {
					search_value = search_value.split(' ')[0];
					search_value1 = search_value + " 23:59:59";
				} else if (search_tag == 'fix') {
					var findOptionValue = null;
					ipt.find('option').each(function() {
						if (this.text == search_value) {
							findOptionValue = this.value;
						}
					});
					if (findOptionValue === null) {
						search_value = "";
					} else {
						search_value = findOptionValue;
					}
				}
				console.log(search_value, search_value1);
				if (ipt.val() == search_value) {
					// 已经赋值，清除赋值
					if (search_tag == 'text' && lk_item && q_obj.length > 0) {
						q_obj.attr('tag', lk_item.Id);
						q_obj.html(EWA.LANG == 'enus' ? lk_item.TxtEn : lk_item.Txt);
					}
					ipt.val("");
					return;
				}
				// 设定检索值
				if (search_tag == 'text' && eq_item && q_obj.length > 0) {
					q_obj.attr('tag', eq_item.Id);
					q_obj.html(EWA.LANG == 'enus' ? eq_item.TxtEn : eq_item.Txt);
				}
				ipt.val(search_value);
				if (search_tag == 'date') {
					ipt[1].value = search_value1;
				}
			});
			objs.each(function() {
				if ($(this).text()) { // 空白字符不添加
					$(this).addClass('ewa-lf-search-text-click').attr('search_tag', o.T);
				}
			});

		}
	};
	this.ReShowWithNoButtons = function() {
		var gridTable = $X('EWA_LF_' + this._Id);
		var rowIndexes = [];
		for (var name in this.ItemList.Items) {
			var node = this.ItemList.Items[name];
			var s = this._GetSubValue("Tag", "Tag", node);
			if (s == null || s.trim().toLowerCase() != 'button') {
				continue;
			}
			for (var i = 0; i < gridTable.rows[0].cells.length; i++) {
				var cell = gridTable.rows[0].cells[i];
				if (cell.childNodes[0].id.toUpperCase() == name) {
					rowIndexes.push(i);
					node.setAttribute("but_show", "1");
					break;
				}
			}
		}
		this.ShowHiddenColumns(rowIndexes, false);

	};
	this.ReShowButtonsInDailogTitle = function() {
		EWA.OW.Load();
		if (!EWA.OW.Dia) {
			return;
		}
		var titleTd = $(EWA.OW.Dia._Dialog.GetFrameTitle());
		var id = "EWA_RESHOW_" + this._Id;
		var buttonsTd = $($X(id)).find('td.ewa_lf_func:eq(0)');
		var c = this;
		buttonsTd.find('.ewa_lf_func_dact').each(function() {
			var id = EWA_Utils.tempId('gDx_' + c._Id + "_");
			this.id = id;
		});
		titleTd.html(buttonsTd.html());
		titleTd.find('.ewa_lf_func_dact').each(function() {
			this.onclick = function() {
				var id = this.id;
				buttonsTd.find('div[id="' + id + '"]').click();
			};
		});
		buttonsTd.parent().hide();

		$(EWA.OW.Dia._Dialog.GetFrame()).addClass('ewa-lf-btns-in-title');
	};
	this.ReShow = function(notReDrawButtons) {
		this.IsReShow = true;
		var obj = document.createElement('table');
		obj.id = "EWA_RESHOW_" + this._Id;
		var cssObj = 'width:100%;height:100%;';
		obj.cellSpacing = '0';
		obj.cellPadding = '0';
		var isFrame = !(this.Url.toUpperCase().indexOf('EWA_AJAX=INSTALL') > 0 || this.Url.toUpperCase().indexOf('EWA_CALL_METHOD=INNER_CALL') > 0 || this.Url
			.toUpperCase().indexOf('.JSP') > 0);

		if (isFrame) {
			// EWA.UI.Utils.SetStyle(document.body,
			// "margin:0px;overflow:hidden");
			EWA.UI.Utils.SetStyle(obj, cssObj);
		} else {
			EWA.UI.Utils.SetStyle(obj, "width:100%");
		}

		var tr = obj.insertRow(-1);
		var td = tr.insertCell(-1);

		var tr0 = obj.insertRow(-1);
		var td00 = tr0.insertCell(-1);
		td00.className = 'ewa_lf_func';
		td00.innerHTML = '<div style="display:none"></div><div></div>';

		var tr1 = obj.insertRow(-1);
		var td10 = tr1.insertCell(-1);
		var cssTd10 = 'width:100%;';
		td10.vAlign = 'top';
		EWA.UI.Utils.SetStyle(td10, cssTd10);
		css = "";
		if (isFrame) {
			// css = "width:100%;height:100%;overflow:auto;position: absolute";
		}
		td10.innerHTML = '<div id="_G_' + this._Id + '" style="' + css + '"></div>';

		var gridTable = $X('EWA_LF_' + this._Id);

		var objMain = gridTable.parentNode.parentNode.parentNode; // table->div->table|test1->div|EWA_FRAME_MAIN

		var objList = gridTable.parentNode;
		td10.childNodes[0].appendChild(objList);
		// debug info
		var newDivId = '_G_' + this._Id;
		this.NewDivId = newDivId;

		if (isFrame) {
			window.setTimeout(function() {
				if ($X('__EWA_DEBUG')) {
					td10.childNodes[0].appendChild($X('__EWA_DEBUG'));
				}
				var o = $X(newDivId);
				var tb = o.getElementsByTagName("table")[0];
				var size = EWA.UI.Utils.GetDocSize(window);
				var h1 = o.parentNode.parentNode.previousSibling.offsetHeight;
				o.style.top = h1 + 'px'
				o.style.height = size.H - h1 + 'px';
				// tb.style.position='absolute';
				// tb.parentNode.style.position='absolute';
				// tb.style.width=o.offsetWidth;
			}, 100);
			addEvent(window, "resize", function() {
				var o = $X(newDivId);
				var size = EWA.UI.Utils.GetDocSize(window);
				var h1 = o.parentNode.parentNode.previousSibling.offsetHeight;
				o.style.top = h1 + 'px'
				o.style.height = size.H - h1 + 'px';
				// tb.style.width=o.offsetWidth;
			});
		}

		while (objMain.childNodes.length > 0) {
			td00.childNodes[0].appendChild(objMain.childNodes[0]);
		}

		// first block
		var st = 'cursor:pointer';
		var o1 = EWA.UI.Utils.CreateObject(window, 'div', st, td00.childNodes[1]);
		o1.className = 'ewa_lf_func_caption';
		var captionDiv = o1;

		// defined buttons
		var rowIndexes = [];
		var isDefinedButton = false;

		var txtCaption = GetInnerText(td00);
		txtCaption = txtCaption.trim();
		this._ReshowButs = {};
		for (var name in this.ItemList.Items) {
			var node = this.ItemList.Items[name];
			var s = this._GetSubValue("Tag", "Tag", node);

			if (s == null || !(s.trim().toLowerCase() == 'button' || s.trim().toLowerCase() == 'butflow')) {
				continue;
			}
			for (var i = 0; i < gridTable.rows[0].cells.length; i++) {
				var cell = gridTable.rows[0].cells[i];
				if (cell.childNodes[0].id.toUpperCase() != name) {
					continue;
				}
				rowIndexes.push(i);
				isDefinedButton = true;

				var text = this._GetSubValue("DescriptionSet", "Info", node);
				var title = this._GetSubValue("DescriptionSet", "Memo", node);

				var ewa_click = this._GetSubValue("EventSet", 'EventName', node);
				var evt = '';
				if (ewa_click != null && ewa_click.toLowerCase().trim() == 'ewa_click') {
					evt = this._GetSubValue("EventSet", 'EventValue', node);

				}

				txtCaption = txtCaption.replace(text, '');

				var o1 = this._ReShowButton(text, title, null);
				this._ReshowButs[text] = o1;
				o1.setAttribute('f_id', this._Id);
				td00.childNodes[1].appendChild(o1);

				if (evt == '') {
					o1.onclick = function() {
						var fId = this.getAttribute('f_id');
						var rows = EWA.F.FOS[fId].SelectCheckedRows();
						if (rows == null || rows.length == 0) {
							EWA.UI.Msg.Alert(_EWA_INFO_MSG["EWA.SYS.CHOOSE_ITEM"], _EWA_INFO_MSG['EWA.SYS.CHOOSE_ITEM_TITLE']);
							return;
						}
						var r = rows[0];
						var buts = r.getElementsByTagName('input');
						for (var i = 0; i < buts.length; i++) {
							var but = buts[i];
							if (but.type == 'button' && but.value == this.childNodes[0].innerHTML) {
								but.click();
								return;
							}
						}
					}
				} else {
					o1.setAttribute('ewa_click', evt);
					o1.onclick = function() {
						eval(this.getAttribute('ewa_click'));
					}
				}
				break;
			}

		}

		// if exists defined buttons ,show split
		if (isDefinedButton) {
			this._ReShowSplit(td00.childNodes[1]);
		}

		var objs = td00.getElementsByTagName('input');
		var radios = {};
		for (var i = 0; i < objs.length; i++) {
			var o = objs[i];
			o.style.display = 'none';
			if (o.id == null || o.id == '') {
				o.id = ('_tmp_' + Math.random()).replace('.', '_');
			}
			var o1;
			if (o.type == 'button') {
				o1 = this._ReShowButton(o.value, o.title, o.id);
				var o2 = o.nextSibling;
				if (o2) {
					var txt = "";
					if (o2.nodeType == 3) {
						txt = o2.nodeValue.trimEx();
					}
					if (txt == "|") {
						this._ReShowSplit(td00.childNodes[1]);
					}
				}
			} else { // radios
				var o2 = o.nextSibling;
				var txt;
				if (o2) {
					if (o2.nodeType == 3) {
						txt = o2.nodeValue.replace('|', '');
					} else {
						txt = o2.innerHTML;
					}
				}
				o1 = this._ReShowButton(txt.trimEx(), o.title, o.id);
				o1.id = ('_tmp_' + Math.random()).replace('.', '_');
				if (!radios[o.name]) {
					radios[o.name] = [];
				}
				radios[o.name].push(o1.id);
			}
			td00.childNodes[1].appendChild(o1);
		}
		txtCaption = txtCaption.replace(/ /ig, '').replace(/\|/ig, '').trimEx();
		if (txtCaption != '') {
			if (txtCaption.indexOf('if') >= 0) {
				tr.style.display = 'none';
			} else {
				td.innerHTML = txtCaption.replace(/ /, '');
			}
		} else {
			tr.style.display = 'none';
		}
		objMain.appendChild(obj);

		// this.ShowHiddenColumns(rowIndexes, false);
		for (var name in radios) {
			var ids = radios[name];
			for (var i = 0; i < ids.length; i++) {
				var o = $X(ids[i]);
				o.setAttribute('_r_ids', ids.join(','));
				o.onclick = function() {
					var id = this.getAttribute('_ewa_event_id');
					$X(id).click();
					var ids = this.getAttribute('_r_ids').split(',');
					for (var i = 0; i < ids.length; i++) {
						if (o.id == ids[i]) {
							continue;
						}
						$X(ids[i]).style.fontWeight = '';
						$X(ids[i]).style.color = '';
					}
					this.style.fontWeight = 'bold';
					this.style.color = 'blue';
				}
			}
		}
		captionDiv.innerHTML = '<b>[<i class="fa fa-star-o"></i>&nbsp;' + this.Description + "]</b>";

		// 将按钮挪到对话框的标题
		if (this.Url.toUpperCase().indexOf('EWA_BTNS_IN_TITLE') > 0) {
			var c = this;
			var inc = 0;
			var t = setInterval(function() {
				inc++;
				if (inc > 1000) { // 10s
					window.clearInterval(t);
				}
				EWA.OW.Load();
				if (!EWA.OW.Dia) {
					return;
				}
				window.clearInterval(t);
				c.ReShowButtonsInDailogTitle();
			}, 10);

		}
	};
	this._ReShowSplit = function(parentObj) {
		var o3 = EWA.UI.Utils.CreateObject(window, 'div', '', parentObj);
		o3.className = 'ewa_lf_func_split';
		o3 = null;
	}
	this._ReShowButton = function(text, title, eventId) {
		var st = 'cursor:pointer';
		var o1 = EWA.UI.Utils.CreateObject(window, 'div', st, document.body);
		o1.innerHTML = '<nobr>' + text + '</nobr>';
		if (eventId != null) {
			o1.setAttribute('_ewa_event_id', eventId);
			o1.onclick = function() {
				var id = this.getAttribute('_ewa_event_id');
				$X(id).click();
			};
		}
		if (EWA.B.IE) {
			o1.onselectstart = function() {
				return false;
			};
		}
		o1.className = 'ewa_lf_func_dact';
		o1.title = title;
		return o1;
	}

	/**
	 * 检查输入合法性
	 * 
	 * @param {}
	 *            obj
	 * @return {Boolean}
	 */
	this.CheckValid = function(obj) {
		var tagName = obj.tagName.toLowerCase();
		if (tagName == 'span' || tagName == 'img' || tagName == 'div') {
			return true;
		}
		var val = this.ItemList.GetObjectValue(obj);
		return this.ItemList.CheckValid(obj, val);
	}

	/**
	 * 显示编辑框
	 * 
	 * @param {}
	 *            obj
	 */
	this.ShowEdit = function(obj) {
		obj.parentNode.style.width = obj.clientWidth + 'px';

		obj.style.display = 'none';
		__show_obj__ = obj.nextSibling;
		__show_obj__.style.display = '';

		var chd = __show_obj__.childNodes[0];
		if (chd.nodeType == 3) {
			chd = __show_obj__.childNodes[1];
		}
		chd.setAttribute('old', chd.value);
		if (chd.tagName == 'SELECT' && !chd.getAttribute("func")) {
			chd.setAttribute("func", 1);
			chd.onchange = function() {
				EWA.F.FOS[this.getAttribute('__ewa_fid__')].EditAfter(this);
			}
		}
		if (chd.getAttribute('__ewa_fid__') == null) {
			chd.setAttribute('__ewa_fid__', this._Id);
			chd.onblur = function() {
				EWA.F.FOS[this.getAttribute('__ewa_fid__')].EditAfter(this);
			}
			chd.onkeydown = function(event) {
				var evt = event == null ? window.event : event;
				var obj = evt.target ? evt.target : evt.srcElement;
				if (evt.keyCode == 13 && obj.tagName == 'INPUT') {
					EWA.F.FOS[this.getAttribute('__ewa_fid__')].EditAfter(this);
				}
				if (evt.keyCode == 27) {
					EWA.F.FOS[this.getAttribute('__ewa_fid__')].EditReset(this);
				}
			}
		}
		setTimeout(function() {
			chd.focus();
		}, 10);
	};
	this.EditReset = function(obj) {
		obj.parentNode.style.display = 'none';
		var o1 = obj.parentNode.previousSibling;
		o1.style.display = '';

		o1.innerHTML = obj.getAttribute('old');
		if (obj.tagName.toLowerCase() == "select") {
			o1.innerHTML = obj.options[obj.selectedIndex].text;
		} else {
			obj.value = obj.getAttribute('old').replace(/</ig, '&lt;').replace(/>/ig, '&gt;');
		}

	};
	/**
	 * 编辑框离开后事件
	 * 
	 * @param {}
	 *            obj
	 */
	this.EditAfter = function(obj) {
		if (!this.CheckValid(obj)) {
			obj.focus();
			return;
		}
		if (obj.getAttribute('old') == obj.value) {
			this.EditReset(obj);
			return;
		}

		obj.parentNode.style.display = 'none';
		var o1 = obj.parentNode.previousSibling;
		o1.style.display = '';

		var id, val;
		if (obj.getAttribute("ewa_class") == "droplist") {
			id = $(obj.parentNode.getElementsByTagName('input')[1]).attr('name');
			val = obj.parentNode.getElementsByTagName('input')[1].value;
			o1.innerHTML = obj.parentNode.getElementsByTagName('input')[0].value;
		} else if (obj.tagName.toLowerCase() == "select") {
			id = $(obj).attr("name");
			o1.innerHTML = obj.options[obj.selectedIndex].text;
			val = obj.value;
		} else {
			var sss = obj.value.replace(/</ig, '&lt;').replace(/>/ig, '&gt;').replace(/\n/ig, '<br>');
			o1.innerHTML = sss;
			id = $(obj).attr("name");
			val = obj.value;
		}
		// alert('id='+id+',val='+val);
		var actionName = obj.getAttribute('action_name');
		if (actionName == '' || actionName == null) {
			actionName = 'OnListFrameUpdateCell';
		}
		// 执行前提示
		var confirm = obj.getAttribute("action_confirm");
		confirm = confirm == null ? "" : confirm;

		// 执行后提示
		var tip = obj.getAttribute("action_tip");
		if (tip == null)
			tip = "";
		// 执行后脚本
		var js = obj.getAttribute("action_js");
		var dt = this.ItemList.GetValue(id, "DataItem", "DataType");
		var paras = [{
			Name: "EWA_FIELD_ID",
			Value: id
		}, {
			Name: "EWA_FIELD_VAL",
			Value: val
		}, {
			Name: "EWA_ACTION_RELOAD",
			Value: "0"
		}, {
			Name: id,
			Value: val
		}, {
			Name: "EWA_DATA_TYPE",
			Value: dt
		}, {
			Name: "EWA_FIELD_VAL_OLD",
			Value: obj.getAttribute('old')
		}];
		this.EditEvent = {
			FROM: obj,
			OLD_VAL: obj.getAttribute('old'),
			NEW_VAL: obj.value
		};
		this.DoAction(obj, actionName, confirm, tip, paras, js);
	};

	/**
	 * 覆盖Frame的提示信息
	 * 
	 * @param {Array}
	 *            infoJson 信息对象
	 * @param {String}
	 *            idName id名称
	 * @param {String}
	 *            infoName info字段名称
	 * @param {String}
	 *            memoName memo字段名称
	 */
	this.RewriteInfo = function(infoJson, idName, infoName, memoName) {
		var tb = $X('EWA_LF_' + this._Id);
		if (this._INFO == null) {
			this._INFO = {};
			this._INFO.INFO = infoJson;
			this._INFO.ID_NAME = idName;
			this._INFO.INFO_NAME = infoName;
			this._INFO.INFO_MEMO = memoName;
		}
		if (this._INFO.INFO == null) {
			return;
		}
		for (var i = 0; i < this._INFO.INFO.length; i++) {
			var v = this._INFO.INFO[i];
			var id = v[this._INFO.ID_NAME];
			if (!$X(id)) {
				continue;
			}
			if (v[this._INFO.INFO_NAME] == null || v[this._INFO.INFO_NAME].trim() == '') {
				var td = $X(id).parentNode.tagName == 'TD' ? $X(id).parentNode : $X(id).parentNode.parentNode;
				for (var m = 0; m < td.parentNode.cells.length; m++) {
					if (td.parentNode.cells[m] == td) {
						this.ShowHiddenColumn(m, false);
					}
				}
			} else {
				$X(id).innerHTML = v[this._INFO.INFO_NAME];
			}
		}
	};
	/**
	 * 显示或隐藏列，默认显示
	 * 
	 * @param {Int}
	 *            colIndex
	 * @param {Boolean}
	 *            dispMethod
	 */
	this.ShowHiddenColumn = function(colIndex, dispMethod) {
		var tb = $X('EWA_LF_' + this._Id);
		var dsp = '';
		if (dispMethod == null || dispMethod == false || dispMethod == 'none') {
			dsp = 'none';
		}
		for (var ii = 0; ii < tb.rows.length; ii++) {
			if (tb.rows[ii].cells.length == tb.rows[0].cells.length)
				tb.rows[ii].cells[colIndex].style.display = dsp;
		}
	};
	/**
	 * 显示或隐藏列，默认显示
	 * 
	 * @param {Array}
	 *            colIndexes 要隐含的列序号集合
	 * @param {Boolean}
	 *            dispMethod 显示模式
	 */
	this.ShowHiddenColumns = function(colIndexes, dispMethod) {
		var tb = $X('EWA_LF_' + this._Id);
		var dsp = '';
		if (dispMethod == null || dispMethod == false || dispMethod == 'none') {
			dsp = 'none';
		}
		var len = tb.rows[0].cells.length;
		for (var ii = 0; ii < tb.rows.length; ii++) {
			var tr = tb.rows[ii];
			if (tr.cells.length != len) {
				continue;
			}

			for (var m = 0; m < colIndexes.length; m++) {
				tr.cells[colIndexes[m]].style.display = dsp;
			}
		}
	};

	/**
	 * 显示或隐含分组
	 */
	this.GroupShowHidden = function(obj) {
		var t = $(obj).attr('t');
		var t0 = new Date().getTime();
		if (t) {// 避免连击，333毫秒内返回
			if (t0 - t < 333) {
				return;
			}
		}
		$(obj).attr('t', t0);
		var tr = obj.parentNode.parentNode;
		var show = tr.getAttribute('ewa_group');
		if (show == '') {
			show = 'none';
			obj.childNodes[0].innerHTML = ' + ';
		} else {
			show = '';
			obj.childNodes[0].innerHTML = ' - ';
		}
		tr.setAttribute('ewa_group', show);

		var tb = tr.parentNode.parentNode;
		var m = 0;
		for (var i = tr.rowIndex + 1; i < tb.rows.length; i++) {
			var t = tb.rows[i];
			if (t.getAttribute('ewa_tag') == 'group') {
				break;
			}
			t.style.display = show;
			m++;
		}
		obj.childNodes[obj.childNodes.length - 1].innerHTML = ' (' + m + ')';
	};

	this.Sort = function(sortName) {
		var last_sort_timer = this._last_sort_timer || 0;
		var last_sort_name = this._Sort || "";
		var t = new Date().getTime();
		if (last_sort_name == sortName && t - last_sort_timer < 500) {
			// 500ms不重复执行
			return;
		}
		this._last_sort_timer = t;
		this._Sort = sortName;
		this.Goto(1);
	};

	this.SearchClear = function(obj) {
		var tb = obj.parentNode.parentNode.parentNode.parentNode;
		for (var i = 0; i < tb.rows.length; i += 1) {
			var inputs = tb.rows[i].getElementsByTagName('input');
			for (var m = 0; m < inputs.length; m++) {
				var oo = inputs[m];
				if (oo.type == 'text') {
					oo.value = "";
				} else if (oo.type == 'radio' || oo.type == 'checkbox') {
					oo.checked = false;
				}
			}
		}
	};
	this.SearchGetExp = function(tb) {
		var s2 = [];
		$(tb).find('.ewa-lf-search-item').each(function() {
			// 不用$(this).find('input,select')
			// 会造成debug状态不停的闪烁，怀疑jq添加属性又删除
			var inputs = $(this).find('input');
			if (inputs.length == 0) {
				inputs = $(this).find('select');
				if (inputs.length == 0) {
					return;
				}
			}
			var input0 = inputs[0];
			var search_type = $(input0).attr('t');
			if (inputs.length == 1) {
				var v = input0.value;
				if (input0.value.trim() == '') {
					return;
				}
				if (search_type == 'text') {
					var tag1 = $(input0.parentNode.parentNode).find('a').attr('tag');
					if (tag1) {
						search_type = tag1;
					}
				}
				s2.push("@!@" + input0.name + "~!~" + search_type + "~!~" + v);
				return;
			}
			if ((search_type == 'date' || search_type == 'number') && inputs.length == 2) {
				var v = input0.value;
				var v1 = inputs[1].value;
				if (v1 == '' && v == '') {
					return;
				}
				s2.push("@!@" + input0.name + "~!~" + search_type + "~!~" + v + "~!~" + v1);
				return;
			}
			if (search_type == 'fix' && input0.tagName == 'INPUT') {
				var vs = [''];
				$(this).find('input').each(function() {
					if (this.checked) {
						vs.push(this.value);
					}
				});
				if (vs.length == 1) {// 没有数据
					return;
				}
				s2.push("@!@" + input0.name + "~!~" + search_type + vs.join('~!~'));
			}
		});
		return s2.join('');
	};
	this.DoSearch = function(obj) {
		var tb;
		var isDialog = false;
		if (obj.id == 'EWA_SEARCH_ITEM_' + this.Id) {
			tb = $X('EWA_SEARCH_ITEM_' + this.Id).childNodes[0];
		} else {
			tb = obj.parentNode.parentNode.parentNode.parentNode;
			isDialog = true;
		}
		var s1 = this.SearchGetExp(tb);
		this._SearchExp = s1;
		if (isDialog) {
			this._SearchHtml = tb.parentNode.innerHTML;
			this._SearchDialog.Show(false);
		}
		// 数据调用来源于搜索
		this.Goto(1);
	};
	this.Search = function(search) {
		if (this._SearchHtml == null) {
			this._SearchCreate();
			this._SearchDialog = new EWA.UI.Dialog.OpenWindow('about:blank', 'aa', 400, 100, true, null, null, false);
			this._SearchDialog.SetCaption(_EWA_INFO_MSG["EWA.LF.SEARCH.BUT.TITLE"]);
			this._SearchDialog._Dialog.AutoSize = true;
			this._SearchDialog._Dialog.SetHtml(this._SearchHtml);
			this._SearchDialog._Dialog.Show(true);
			this._SearchDialog._Dialog.GetFrame().focus();
			this._SearchDialog.MoveCenter();
		} else {
			this._SearchDialog._Dialog.AutoSize = false;
			this._SearchDialog.Show(true);

		}

	};
	/**
	 * 在页面上将Search显示出来
	 */
	this.ShowSearch = function() {
		var id = 'EWA_SEARCH_ITEM_' + this.Id;
		if (!$X(id)) {
			this._SearchCreateItm();
		}
		this._ReShowSearchQuick();
	};
	this.ChangeSearchTextType = function(obj) {
		if (this._MENU_DATE_RANGE)
			this._MENU_DATE_RANGE.HiddenMemu();
		this._MENU_TEXT_TYPE.ShowByObject(obj, null, 0);
	};
	/**
	 * 检索日期显示日期范围列表
	 */
	this.ChangeSearchDateType = function(obj) {
		if (this._MENU_TEXT_TYPE)
			this._MENU_TEXT_TYPE.HiddenMemu();
		this._MENU_DATE_RANGE.ShowByObject(obj, null, 0);
	};

	this.ChangeSearchTextTypeIt = function(tag) {
		var targetObject = this._MENU_TEXT_TYPE.SHOW_BY_OBJECT;
		var search_item_table = $(targetObject).parentsUntil(".ewa-lf-search-item").last();
		var text_seach_type_map = $J2MAP(this.RESOURCES.search_text_items, 'Id');
		var item = text_seach_type_map[tag];
		var txt = EWA.LANG == 'enus' ? item.TxtEn : item.Txt;
		search_item_table.find('a').attr('tag', tag).html(txt);
	};

	/**
	 * 获取初始化查询数据
	 */
	this._GetInitSearchMap = function() {
		var u1 = new EWA_UrlClass(this.Url);
		var map = {};
		// ewa_search=bas_tag_grp[eq]ACC_SRC,bas_tag[rlk]Z1
		// ewa_search=POS_CDATE[gte]2011-09-20,POS_CDATE[lte]2011-09-30,POS_ID[gte]11,POS_ID[lt]12
		var search_paras = u1.GetParameter("ewa_search");
		if (!search_paras) {
			return map;
		}
		this.Url = u1.RemoveParameter("ewa_search");
		search_paras = search_paras.unURL();
		var ss = search_paras.split(',');
		for (var n in ss) {
			var s = ss[n]; // bas_tag[rlk]Z1
			var exp_start_loc = s.indexOf("[");
			var exp_end_loc = s.indexOf("]");

			if (exp_start_loc < 0 || exp_end_loc < exp_start_loc) {
				continue;
			}

			var name = s.substring(0, exp_start_loc).trim();
			if (name.length == 0) {
				continue;
			}

			var tag = s.substring(exp_start_loc + 1, exp_end_loc).trim().toLowerCase();

			if (tag.length == 0) {
				continue;
			}

			var para1 = s.substring(exp_end_loc + 1).trim();

			if (para1 == "") {
				continue;
			}
			if (!map[name.toUpperCase()]) {
				map[name.toUpperCase()] = {
					"name": name,
					"tag": tag
				};
			}
			var o = map[name.toUpperCase()];
			if (tag == 'lt' || tag == 'lte') {
				o.para2 = para1.unURL();
			} else {
				o.para1 = para1.unURL();
			}
		}
		return map;
	};

	/**
	 * 设置检索日期范围
	 */
	this.SearchFilterDate = function(t) {
		var targetObject = this._MENU_DATE_RANGE.SHOW_BY_OBJECT;

		var search_item_table = $(targetObject).parentsUntil(".ewa-lf-search-item").last();
		var input_date0 = search_item_table.find('input')[0];
		var input_date1 = search_item_table.find('input')[1];

		if (t == "Clear") {
			$(input_date0).val("");
			$(input_date1).val("");
			return;
		}
		var td = EWA_Utils.Date();
		var d1 = "";
		var d2 = "";
		if (t == "Today") {
			d1 = td.GetDateString();
			d2 = d1;
		} else if (t == "Week") {
			var tt = td.GetBenWeek();
			d1 = tt[0];
			d2 = tt[1];
		} else if (t == "Today-Weekend") {
			var tt = td.GetBenWeek();
			d1 = tt[td.GetDateString()];
			d2 = tt[1];
		} else if (t == "Month") {
			var tt = td.GetBenMonth();
			d1 = tt[0];
			d2 = tt[1];
		} else if (t == "Today-EOM") {
			var tt = td.GetBenMonth();
			d1 = tt[td.GetDateString()];
			d2 = tt[1];
		} else if (t == "Quarter") {
			var tt = td.GetBenQ();
			d1 = tt[0];
			d2 = tt[1];
		} else if (t == "Today-EOQ") {
			var tt = td.GetBenQ();
			d1 = tt[td.GetDateString()];
			d2 = tt[1];
		} else if (t == "Year") {
			var tt = td.GetBenYear();
			d1 = tt[0];
			d2 = tt[1];
		} else if (t == "Today-EOY") {
			var tt = td.GetBenYear();
			d1 = tt[td.GetDateString()];
			d2 = tt[1];
		}
		var ft_d1 = EWA_Utils.Date(d1).FormatDate();
		var ft_d2 = EWA_Utils.Date(d2).FormatDate();
		ft_d2 = ft_d2 + " 23:59:59";
		$(input_date0).val(ft_d1);
		$(input_date1).val(ft_d2);
	};
	/**
	 * 创建日期范围列表
	 * 
	 * @return String
	 */
	this._SearchCreateDateRange = function() {
		var id = '_MENU_DATE_RANGE' + this._Id;
		$('.' + id).remove(); // 清除已经存在的
		var idx = EWA.LANG.toLowerCase() == "enus" ? "TxtEn" : "Txt";
		var items = JSON.parse(JSON.stringify(this.RESOURCES.search_date_items));
		var ewa_js = "EWA.F.FOS[&quot;" + this._Id + "&quot;].SearchFilterDate";
		for (var n in items) {
			var itm = items[n];
			itm.Txt = itm[idx];
			itm.Cmd = ewa_js + "(&quot;" + itm.Id + "&quot;)";
		}
		var name = 'EWA.F.FOS[&quot;' + this._Id + '&quot;]._MENU_DATE_RANGE';

		this._MENU_DATE_RANGE = new EWA_UI_MenuClass(name);
		this._MENU_DATE_RANGE.Create(items);
		$(this._MENU_DATE_RANGE.Dialog.GetFrame()).addClass('ewa-lf-search-menu ' + id);
		return name;
	};
	this._SearchCreateTextType = function() {
		var id = '_MENU_TEXT_TYPE' + this._Id;
		$('.' + id).remove(); // 清除已经存在的
		var idx = EWA.LANG.toLowerCase() == "enus" ? "TxtEn" : "Txt";
		// clone resources
		var items = JSON.parse(JSON.stringify(this.RESOURCES.search_text_items));
		var ewa_js = "EWA.F.FOS[&quot;" + this._Id + "&quot;].ChangeSearchTextTypeIt";
		for (var n in items) {
			var itm = items[n];
			itm.Txt = itm[idx];
			itm.Cmd = ewa_js + "(&quot;" + itm.Id + "&quot;)";
		}
		var name = "EWA.F.FOS[&quot;" + this._Id + "&quot;]._MENU_TEXT_TYPE";

		this._MENU_TEXT_TYPE = new EWA_UI_MenuClass(name);
		this._MENU_TEXT_TYPE.Create(items);
		$(this._MENU_TEXT_TYPE.Dialog.GetFrame()).addClass('ewa-lf-search-menu ' + id);
		return name;
	}
	/**
	 * 创建搜索框
	 */
	this._SearchCreateItm = function() {
		var id = 'EWA_SEARCH_ITEM_' + this.Id;
		var ss = [];

		var ssFix = [];
		var ssOth = [];
		var jsonFix = {};
		for (var name in this._SearchJson) {
			this._SearchJson[name].ORI_NAME = name;
			jsonFix[name.toUpperCase()] = this._SearchJson[name];
		}
		this._SearchJson = jsonFix;
		var ewa_js = "EWA.F.FOS[&quot;" + this._Id + "&quot;].ChangeSearchTextType(this)";
		var ewa_js_date = "EWA.F.FOS[&quot;" + this._Id + "&quot;].ChangeSearchDateType(this)";

		var default_text_seach_type = 'lk'; // like;

		var text_seach_type_map = $J2MAP(this.RESOURCES.search_text_items, 'Id');
		var init_search_type_map = this._GetInitSearchMap();

		var is_have_date_search = false; // 是否由日期搜索
		var is_have_text_search = false; // 是否由日期搜索
		for (var name in this.ItemList.Items) {
			if (this._SearchJson[name] == null) {
				continue;
			}
			var tmp = [];
			var node = this.ItemList.Items[name];
			var searchItem = this._SearchJson[name];
			var search = searchItem.T;
			var des = this._GetSubValue('DescriptionSet', 'Info', node);
			var fixM = search == "fix" ? ("ewa-lf-search-fix-m" + (searchItem.M || "0")) : "";
			tmp.push("<table class='ewa-lf-search-item ewa-ref-" + name + " ewa-lf-search-type-" + search + " " + fixM + "' cellspacing=0 cellpadding=0>");
			tmp.push("<tr><td class='ewa-lf-search-item-title' style='position:relative'><nobr><b>");
			tmp.push(des);

			var text_val = "";
			var text_val2 = "";
			var ini_tag = default_text_seach_type;
			if (init_search_type_map[name.toUpperCase()]) {
				var s_item = init_search_type_map[name.toUpperCase()];
				ini_tag = s_item.tag;
				text_val = s_item.para1;
				text_val2 = s_item.para2;
			}

			if (search == "text") {
				var this_tag_text_type = text_seach_type_map[ini_tag] || text_seach_type_map[default_text_seach_type];
				var tag_text = EWA.LANG == 'enus' ? this_tag_text_type.TxtEn : this_tag_text_type.Txt;
				tmp.push("<a class='ewa-lf-search-type' tag='" + ini_tag + "' href='javascript:void(0)' onclick='" + ewa_js + "'>");
				tmp.push(tag_text);
				tmp.push("</a>");
				is_have_text_search = true;
			} else if (search == 'date') {
				tmp.push("<a  href='javascript:void(0)' class='fa fa-calendar-check-o'  onclick='" + ewa_js_date + "'></a>");
				is_have_date_search = true;
			}

			tmp.push(": </b></nobr></td><td class='ewa-lf-search-item-ctl'>");
			if (search == "text") {
				tmp.push(this._SearchSingle(name, text_val));

			} else if (search == "date") {
				tmp.push(this._SearchDate(name, text_val, text_val2));
			} else if (search == "number") {
				tmp.push(this._SearchNumber(name, text_val, text_val2));
			} else if (search == "fix") {
				var ttt = "<div >" + this._SearchFix(name, searchItem, 'span', text_val) + "</div>";
				tmp.push(ttt);
			}
			tmp.push("</td></tr></table>");
			if (search == "fix") {
				ssFix.push(tmp.join(''));
			} else {
				ssOth.push(tmp.join(''));
			}
		}
		if ((ssOth.length + ssFix.length) == 0) {
			return;
		}
		var title = _EWA_INFO_MSG["EWA.SYS.DATASEARCH"];
		ss.push('<table class="ewa-lf-search-main" id="' + id + '" cellspacing="0" cellpadding="0" style="width:100%">');
		ss.push("<tr><td class='ewa-lf-search-des'></td><td>");
		if (ssOth.length > 0) {
			ss.push(" " + ssOth.join('') + " ");
		}
		if (ssFix.length > 0) {
			for (var i = 0; i < ssFix.length; i++) {
				ss.push(" " + ssFix[i] + " ");
			}
		}
		ss.push("</td></tr></table>")

		var rq = document.createElement('div');
		this._SEARCH_BOX = rq;
		rq.className = 'ewa-lf-search';
		rq.innerHTML = ss.join('');

		var obj = $X('EWA_LF_' + this.Id);
		var o1 = obj.parentNode
		o1.parentNode.insertBefore(rq, o1);

		var id = 'EWA_SEARCH_ITEM_' + this.Id;
		var c = this;

		// 附加日期范围菜单
		if (is_have_date_search) {
			this._SearchCreateDateRange();
		}
		// 附加文字搜索类型菜单
		if (is_have_text_search) {
			this._SearchCreateTextType();
		}
		c._SEARCH_ITEM_EXP = this.SearchGetExp(rq);
		// 检查初始默认值
		if (JSON.stringify(init_search_type_map) != "{}") {
			c._SearchExp = c._SEARCH_ITEM_EXP;
		}
		
		$(rq).find('input[type=text]').on('compositionstart', function(){
			// 输入法打开输入
			c._is_search_composition = true;
		}).on('compositionend', function(){
			// 输入法输入完毕
			c._is_search_composition = false;
		});
		// 检测搜索内容是否发生变化
		this._TIMER_SEARCH = window.setInterval(function() {
			if(c._is_search_composition){
				return;
			}
			
			try { // 避免窗口关闭出现的异常
				if (!$X(id)) {
					window.clearInterval(c._TIMER_SEARCH);
					return;
				}
			} catch (e) {
				window.clearInterval(c._TIMER_SEARCH);
				return;
			}

			var s = c.SearchGetExp(rq);
			if (s != c._SEARCH_ITEM_EXP) {
				c._SEARCH_ITEM_EXP = s;
				c.DoSearch($X(id));
			}
		}, 700);
	};
	this._SearchSingle = function(name, value) {
		var ss = [];
		ss.push('<input t="text" type="text" autocomplete="off" class="EWA_INPUT" maxlength="40" name="');
		ss.push(name.toInputValue());
		ss.push('"');
		if (value != null) {
			ss.push(" value=\"");
			var v = value.toInputValue();
			ss.push(v);
			ss.push("\" ");
		}
		ss.push(' />');
		return ss.join('');
	};
	this._SearchDate = function(name, val1, val2) {
		var ss = [];
		var tmp = '<td  ><input type="text" autocomplete="off" class="EWA_INPUT" t="date" readonly maxlength="8" onclick="EWA.UI.Calendar.Pop(this)" name="';
		ss.push('<table border=0 cellpadding=0 cellspacing=0>')
		ss.push(tmp);
		ss.push(name);
		ss.push('"');
		if (val1) {
			var v = val1.toInputValue();
			ss.push(' value="');
			ss.push(v);
			ss.push('"');
		}
		ss.push(' /></td><td><span class="ewa-lf-search-split"> - </span></td>');
		ss.push(tmp);
		ss.push(name);
		ss.push('1"');
		if (val2) {
			var v = val2.toInputValue();
			ss.push(' value="');
			ss.push(v);
			ss.push('"');
		}
		ss.push('/></td></tr></table>');

		return ss.join('');
	};

	this._SearchNumber = function(name, val1, val2) {
		var ss = [];
		var tmp = '<input type="text" t="number" size="10" name="';
		ss.push(tmp);
		ss.push(name);
		ss.push('"');
		if (val1) {
			var v = val1 * 1;
			ss.push(' value="');
			ss.push(v);
			ss.push('"');
		}
		ss.push(' /><span class="ewa-lf-search-split"> - </span>');
		ss.push(tmp);
		ss.push(name);
		ss.push('1"');
		if (val2) {
			var v = val2 * 1;
			ss.push(' value="');
			ss.push(v);
			ss.push('"');
		}
		ss.push('/>');

		return ss.join('');
	};
	// radio/checkbox
	this._SearchFix = function(name, searchItem, tag, value) {
		var ss = [];
		var tp = 'radio';
		if (searchItem.M == "1") {
			tp = "checkbox";
		} else if (searchItem.M == "2") { // select
			return this._SearchFix1(name, searchItem, tag, value);
		}
		var tmp = "<" + tag + "><nobr><input t='fix' [@CHK] id='@ID' value=\"@V\" type='" + tp + "' name='" + name + "' /><label for='@ID'>@T</label></nobr></"
			+ tag + "> ";
		// ewa_search值
		var map = {};
		if (value) {
			var vals = value.split(';');
			for (var n in vals) {
				map[vals[n].trim().toUpperCase()] = 1;
			}
		}
		for (var i = 0; i < searchItem.D.length; i++) {
			var item = searchItem.D[i];
			var val = item[0];
			var txt = item[1];
			var id = this.Id + "_" + name + "_SearchFix_" + i;
			var tmp1 = tmp.replace("@ID", id);
			tmp1 = tmp1.replace("@ID", id);
			tmp1 = tmp1.replace("@V", val);
			if (map[val.toUpperCase().trim()]) {
				tmp1 = tmp1.replace("[@CHK]", "checked");
			} else {
				tmp1 = tmp1.replace("[@CHK]", "");
			}

			var tmp1 = tmp1.replace("@T", txt);
			ss.push(tmp1);
		}

		return ss.join('');
	};
	// select
	this._SearchFix1 = function(name, searchItem, tag, value) {
		var ss = [];
		// console.log(value)
		ss.push("<select t='fix' name='" + name + "'><option></option>")
		var tmp = "<option @CKD t='fix' id='@ID' value=\"@V\">@T</option> ";

		for (var i = 0; i < searchItem.D.length; i++) {
			var item = searchItem.D[i];
			var id = this.Id + "_" + name + "_SearchFix_" + i;
			var tmp1 = tmp.replace("@ID", id);
			tmp1 = tmp1.replace("@V", item[0]);
			tmp1 = tmp1.replace("@T", item[1]);
			if (value && item[0] == value) {
				tmp1 = tmp1.replace("@CKD", "selected");
			} else {
				tmp1 = tmp1.replace("@CKD", "");
			}
			ss.push(tmp1);
		}
		ss.push("</select>");
		return ss.join('');
	};

	this._SearchCreate = function() {
		var ss = [];
		var s1 = "<div><table border=0 style='margin:0px;' class=EWA_TABLE cellspacing=1>";
		ss.push(s1);
		for (var name in this.ItemList.Items) {
			if (this._SearchJson[name] == null) {
				continue;
			}
			var node = this.ItemList.Items[name];
			var searchItem = this._SearchJson[name];

			var search = searchItem.T;

			var des = this._GetSubValue('DescriptionSet', 'Info', node);
			ss.push("<tr><td class=EWA_TD_L width=140><nobr>" + des + "<nobr></td><td width=350 class=EWA_TD_M>");
			if (search == "text") {
				ss.push(this._SearchSingle(name));
			} else if (search == "date") {
				ss.push(this._SearchDate(name));
			} else if (search == "number") {
				ss.push(this._SearchNumber(name));
			} else if (search == "fix") {
				ss.push(this._SearchFix(name, searchItem, 'div'))
			}

			ss.push("</td></tr>");
		}
		ss.push("<tr><td class=EWA_TD_B colspan=2 align=right>" + "<input onclick='EWA.F.FOS[\"" + this._Id + "\"].SearchClear(this);' type=button value='"
			+ _EWA_INFO_MSG["EWA.LF.SEARCH.BUT.CLEAR"] + "'> " + "<input type=submit value='" + _EWA_INFO_MSG["EWA.LF.SEARCH.BUT.SEARCH"]
			+ "' onclick='EWA.F.FOS[\"" + this._Id + "\"].DoSearch(this);'> " + "<input type=button value='" + _EWA_INFO_MSG["EWA.LF.SEARCH.BUT.CLOSE"]
			+ "' " + "onclick='EWA.F.FOS[\"" + this.Id + "\"]._SearchDialog.Show(false);'></td></tr>");
		ss.push("</table></div>");
		this._SearchHtml = ss.join('');
	};
	/**
	 * 检索关键字标红
	 */
	this.SearchMark = function() {
		var s1 = this._SearchExp.split('@!@');
		var tb = $X('EWA_LF_' + this._Id);

		for (var i = 0; i < s1.length; i += 1) {
			var s2 = s1[i].split('~!~');
			if (s2.length < 3) {
				continue;
			}
			for (var m = 2; m < s2.length; m++) {
				var exp = s2[m];
				if (exp == "") {
					continue;
				}
				if (s2[1] == 'fix') {
					// 固定检索，检索关键字替换为select的根据option的value获取text文字
					var id = s2[0];
					var val = s2[2];
					var select_fix = $('table#EWA_SEARCH_ITEM_' + this.Id + ' [name="' + id + '"]');
					select_fix.find('option').each(function() {
						if (this.value == val) {
							exp = this.text; // 获取text文字
							return;
						}
					});
				}
				// console.log(s2);
				var ss = [];
				for (var i1 = 0; i1 < exp.length; i1++) {
					var c = exp[i1];
					if ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9')) {
						ss.push(c);
					} else {
						ss.push('\\' + c); // 字符转义，避免正则表达式出错
					}
				}
				exp = ss.join('');
				// console.log(exp);
				var id = s2[0];
				if (this._SearchJson[id]) {
					id = this._SearchJson[id].ORI_NAME; // 原来的名称（没有被大写之前的名称，在
					// SearchCreateItm生成）
				}
				try {
					var exp = eval('/(' + exp + ')/ig');
					// console.log(exp);
					$(tb).find('.EWA_TD_M [id="' + id + '"]').each(function() {
						if (this.children.length == 0) {
							this.innerHTML = this.innerHTML.replace(exp, '<font color=red><b>$1</b></font>');
						}
					});
				} catch (e) {
					console.log(e);
				}
			}
		}
	};
	/**
	 * 是否双击
	 * 
	 * @param {Object}
	 *            butIdx
	 * @memberOf {TypeName}
	 */
	this.DblClick = function(butIdx) {
		this._IsDblClick = butIdx;
		var tb = $X('EWA_LF_' + this._Id);
		for (var i = 1; i < tb.rows.length; i++) {
			tb.rows[i].ondblclick = function() {
				var inputs = this.getElementsByTagName('input');
				if (inputs.length > butIdx && inputs[butIdx].disabled == false)
					inputs[butIdx].click();
			}
		}
	};
	this.Init = function(xmlString) {
		this.Xml = new EWA.C.Xml();
		this.Xml.LoadXml(xmlString);
		this.ItemList.Init(this.Xml);
		this.Resources = new EWA_FrameResoures();
		this.Resources.Init(this.Xml);
		var tb = $X('EWA_LF_' + this._Id);
		if (!tb || tb.tagName != 'table' || tb.rows.length <= 1) {
			return;
		}
		var objs = tb.rows[1].getElementsByTagName('input');
		for (var i = 0; i < objs.length; i++) {
			if (objs[i].type.toUpperCase() == 'RADIO') {
				this._TrSelectMulti = false;
				break;
			}
		}

	};
	this.SetPageParameters = function(pageCurrent, pageCount, pageSize, recordCount, sort) {
		this._PageCurrent = pageCurrent;
		this._PageSize = pageSize;
		this._PageCount = pageCount;
		this._RecordCount = recordCount;
		this._Sort = sort;
	};
	this.SetPageParametersName = function(pageCurrentName, pageCountName, pageSizeName, recordCountName, sortName) {
		this._PageCurrentName = pageCurrentName;
		this._PageSizeName = pageSizeName;
		this._PageCountName = pageCountName;
		this._RecordCountName = recordCountName;
		this._SortName = sortName;
	};

	/**
	 * 全选
	 */
	this.CheckedAll = function() {
		var obj = document.getElementById("EWA_LF_" + this._Id);
		if (obj.rows.length <= 1) {
			return;
		}

		for (var i = 0; i < obj.rows.length; i += 1) {
			var objs = obj.rows[i].getElementsByTagName("input");
			if (objs.length == 0)
				continue;
			objs[0].checked = this._IsCheckedAll;

		}
		if (this._IsCheckedAll) {
			this._IsCheckedAll = false;
		} else {
			this._IsCheckedAll = true;
		}
		if (this.CheckedAllAfter) {
			this.CheckedAllAfter(obj);
		}
	};
	/**
	 * 返回选中的值，用“,”分割
	 * 
	 * @return {String}
	 */
	this.SelectChecked = function() {
		var obj = $X("EWA_LF_" + this._Id);
		if (!obj || obj.rows.length < 1) {
			return "";
		}
		var ids = [];
		var objs = $F(obj, 'input', 'type', 'radio,checkbox');
		if (objs.length > 0) {
			for (var i = 0; i < objs.length; i++) {
				if (objs[i].checked) {
					ids.push(objs[i].value);
				}
			}
		} else {
			for (var i = 0; i < obj.rows.length; i++) {
				var tr = obj.rows[i];
				if (tr.getAttribute('__ewa_lf_mdown') == 1) {
					ids.push(tr.getAttribute('EWA_KEY'));
				}
			}
		}
		return ids.join(',');
	};
	/**
	 * 返回选中的checkbox 或 RADIO
	 * 
	 * @return {}
	 */
	this.SelectCheckedInputs = function() {
		var ids = [];
		var obj = $X("EWA_LF_" + this._Id);
		if (obj.rows.length < 1) {
			return ids;
		}
		var objs = obj.getElementsByTagName("input");
		var ids = [];
		for (var i = 0; i < objs.length; i++) {
			if (!(objs[i].type.toUpperCase() == "CHECKBOX" || objs[i].type.toUpperCase() == "RADIO")) {
				continue;
			}
			if (objs[i].checked) {
				ids.push(objs[i]);
			}

		}
		return ids;
	};
	/**
	 * 返回选择选中的行
	 * 
	 * @return {}
	 */
	this.SelectCheckedRows = function() {
		var trs = [];
		var obj = $X("EWA_LF_" + this._Id);
		for (var i = 0; i < obj.rows.length; i++) {
			var tr = obj.rows[i];
			var objs = tr.getElementsByTagName("input");
			if (objs.length == 0) {
				continue;
			}
			
			if (objs[0].checked  ) {
				if(objs[0].parentNode.className.indexOf('ewa-switch')== -1){
					// not ewa-switch ui
					trs.push(tr);
				}
			}
		}
		if (trs.length == 0) {
			for (var i = 0; i < obj.rows.length; i++) {
				var tr = obj.rows[i];
				if (tr.getAttribute('__ewa_lf_mdown') == 1) {
					trs.push(tr);
				}
			}
		}
		return trs;
	};
	/**
	 * 重新刷新当前页面
	 * 
	 * @param httpReferer
	 *            跳转发起的页面，例如Frame，通常是EWA_PostBehavior调用
	 */
	this.Reload = function(httpReferer) {
		if (this.StopAjaxAfterReload) {
			// DoAction 指定了提交后的脚本，阻止页面重新加载
			this.StopAjaxAfterReload = false;
			return;
		}
		this.Goto(this._PageCurrent, httpReferer);
	};
	/**
	 * 调用ACTION
	 * 
	 * @param obj
	 *            调用DoAction的HTML对象
	 * @param action
	 *            调用的Action名称
	 * @param confirm
	 *            执行前确认的信息 _EWA_INFO_MSG定义
	 * @param tip
	 *            执行后提示的信息 _EWA_INFO_MSG定义
	 * @param parasArray
	 *            附加的参数数组, 参数用对象表示para.Name, para.Value
	 * @param afterJs
	 *            执行后调用的脚本
	 */
	this.DoAction = function(obj, action, confirm, tip, parasArray, afterJs) {
		EWA.F.CID = this._Id;
		if (!action) {
			return;
		}
		// app模式下，touch会出现连击的情况，为了避免，设置时间阀值，1000毫秒之内的点击视为无效
		// EWA_App.Section.ajaxLoadedAfter 设置 scroll-delete
		if (obj && $(obj).parent().hasClass('scroll-delete')) {
			var last_t = $(obj).attr('do-action-time') || 0;
			var t1 = (new Date()).getTime();
			if (t1 - last_t < 1000) {
				return;
			}
			$(obj).attr('do-action-time', t1);

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
		if (obj && obj.getAttribute && obj.getAttribute("box_menu_item") == "yes") {// 来自box的调用
			this._Ajax.AddParameter("___CALL__FROM__", "box");
			var p = obj.parentNode;
			if (p) {
				var json_ref = p.getAttribute('json_ref'); // 调用对象的数据
				var json = JSON.parse(json_ref);
				if (json.EWA_KEY) {
					this._Ajax.AddParameter("EWA_ACTION_KEY", json.EWA_KEY);
				}
			}
		} else {

			var key = this.GetRowKey(obj);
			if (key) {
				this._Ajax.AddParameter("EWA_ACTION_KEY", key);
			}
		}
		// 所有被选择的行
		var idsSplit = this.SelectChecked();
		this._Ajax.AddParameter("IDS_SPLIT", idsSplit);

		if (parasArray != null && parasArray.length > 0) { // 附加的参数
			for (var i = 0; i < parasArray.length; i += 1) {
				this._Ajax.AddParameter(parasArray[i].Name, parasArray[i].Value);
			}
		}
		var url = new EWA.C.Url();
		url.SetUrl(this.Url);
		var u = url.RemoveParameter("EWA_ACTION");
		var c = this;
		if (confirm) {
			var msg = _EWA_INFO_MSG[confirm];
			if (!msg) {
				msg = confirm;
			}
			$Confirm(msg, 'Confirm', function() {
				c._Ajax.PostNew(u, function() {
					c._CallBackJs();
				});
			});

		} else {
			this._Ajax.PostNew(u, function() {
				c._CallBackJs();
			});
		}
	};
	this.NewPageSize = function(pageSize) {
		if (this._PageSize == pageSize) {
			return;
		}
		this._PageSize = pageSize;
		this.Goto(1);
	};
	/**
	 * 跳转的页面
	 * 
	 * @param gotoPage
	 *            到第几页
	 * @param httpReferer
	 *            跳转发起的页面，例如Frame，通常是EWA_PostBehavior调用
	 */
	this.Goto = function(gotoPage, httpReferer) {
		EWA.F.CID = this._Id;

		this._PageCurrent = gotoPage;
		this._Ajax = this.CreateAjax();

		var url = new EWA_UrlClass();
		url.SetUrl(this.Url == null ? document.location.href : this.Url);
		url.RemoveParameter("EWA_AJAX");
		var c = this;
		this._Ajax.PostNew(url.GetUrl(), function() {
			c._CallBack(httpReferer);
		});
	};
	this.CreateAjax = function() {
		var ajax = new EWA.C.Ajax();
		ajax.LoadingType = "image";

		ajax.AddParameter(this._PageCurrentName, this._PageCurrent);

		if (this._PageSize) {
			ajax.AddParameter(this._PageSizeName, this._PageSize);
		}
		if (this._Sort != null) {
			ajax.AddParameter(this._SortName, this._Sort);
		}
		if (this._SearchExp != null && this._SearchExp != "") {
			ajax.AddParameter("EWA_LF_SEARCH", this._SearchExp);
		}
		ajax.AddParameter("EWA_AJAX", "LF_RELOAD");
		if (this.GotoParas != null && this.GotoParas.length > 0) {
			for (var i = 0; i < this.GotoParas.length; i += 1) {
				ajax.AddParameter(this.GotoParas[i].Name, this.GotoParas[i].Value);
			}
		}
		return ajax;
	};
	/**
	 * 下载数据
	 * 
	 * @param {String}
	 *            t 类型
	 */
	this.DownlodData = function(t, action) {
		EWA.F.CID = this._Id;
		this._Ajax = new EWA.C.Ajax();
		this._Ajax.LoadingType = "image";

		if (this._Sort != null) {
			this._Ajax.AddParameter(this._SortName, this._Sort);
		}
		if (this._SearchExp != null && this._SearchExp != "") {
			this._Ajax.AddParameter("EWA_LF_SEARCH", this._SearchExp);
		}
		this._Ajax.AddParameter("EWA_AJAX", "DOWN_DATA");
		this._Ajax.AddParameter("EWA_AJAX_DOWN_TYPE", t);
		if (action) {
			this._Ajax.AddParameter("EWA_ACTION", action);
		}
		if (this.GotoParas != null && this.GotoParas.length > 0) {
			for (var i = 0; i < this.GotoParas.length; i += 1) {
				this._Ajax.AddParameter(this.GotoParas[i].Name, this.GotoParas[i].Value);
			}
		}
		this._AjaxType = "DOWN_DATA";

		var url = new EWA_UrlClass();
		url.SetUrl(this.Url == null ? document.location.href : this.Url);
		var c = this;
		this._Ajax.PostNew(url.GetUrl(), function() {
			c._CallBack()
		});
	};
	this.Get = function(url) {
		EWA.F.CID = this._Id;
		this._Ajax = new EWA.C.Ajax();
		this._Ajax.LoadingType = "image";
		var c = this;
		this._Ajax.Get(url, function() {
			c._CallBack()
		});
	};
	this.Post = function(url, info) {
		EWA.F.CID = this._Id;
		this._Ajax = new EWA.C.Ajax();
		this._Ajax.LoadingType = "image";
		var c = this;
		this._Ajax.Post(url, info, function() {
			c._CallBackJs()
		});
	};
	/**
	 * 刷新数据后的回调
	 * 
	 * @param httpReferer
	 *            回调发起的页面，例如Frame
	 */
	this._CallBack = function(httpReferer) {
		var ajax = this._Ajax;
		if (ajax._Http.readyState != 4) {
			ajax = null;
			return;
		}
		ajax.HiddenWaitting();
		if (top.EWA && top.EWA.MQE) {
			var mqe = new EWA_MqeClass();
			mqe.Data = ajax.GetRst();
			mqe.FromId = EWA.F.CID;
			mqe.Type = "POST";
			top.EWA.MQE.AddMqe(mqe);
		}
		// console.log(ajax._Http.status);

		if (ajax._Http.status == 200) {
			var ret = ajax._Http.responseText;

			if (EWA.F.CheckCallBack(ret)) {
				if (this._AjaxType == "DOWN_DATA") { // 下载数据
					this._AjaxType = null;
					if (ret.trim() == 'DENY') {
						alert(_EWA_INFO_MSG["EWA.LF.DOWN_DATA.DENY"]);
					} else {
						window.location.href = ret.trim();
					}
				} else {
					var obj = $X("EWA_LF_" + this._Id);
					var pNode = obj.parentNode;
					// console.log(pNode);
					obj = null;
					// pNode.innerHTML = ret;
					$(pNode).replaceWith(ret); // 避免出现多重div
					var c = this;
					c.SearchMark();
					if (c.IsReShow) {
						c.ReShowWithNoButtons();
					}
					c._ReShowSearchQuick();
					if (c._IsDblClick != null) {
						c.DblClick(c._IsDblClick);
					}
					if (c._IsAddPreRow) {
						c.AddPreRow();
					}
					if (c.SubBottomsArray) {
						c._SubBottoms();
					}
					if (c.ReloadAfter) {
						c.ReloadAfter(httpReferer);
					}
					if (c.ReloadAfterApp) {
						// app中定义
						c.ReloadAfterApp(httpReferer);
					}
				}
			}
		} else {
			alert("ERROR:\r\n" + ajax._Http.statusText);
		}
		ajax = null;
		this.RewriteInfo();
	};

	this._CallBackJs = function() {
		var ajax = this._Ajax;
		if (ajax._Http.readyState != 4) {
			ajax = null;
			return;
		}
		if (top.EWA && top.EWA.MQE) {
			var mqe = new EWA_MqeClass();
			mqe.Data = ajax.GetRst();
			mqe.FromId = EWA.F.CID;
			mqe.Type = "POST";
			top.EWA.MQE.AddMqe(mqe);
		}
		ajax.HiddenWaitting();
		if (ajax._Http.status == 200) {
			var ret = ajax._Http.responseText;
			if (EWA.F.CheckCallBack(ret)) {
				eval(ret);
			}
		} else {
			alert("ERROR:\r\n" + ajax._Http.statusText);
		}
		ajax = null;
		if (this.EditAfterEvent) {
			this.EditAfterEvent();
		}
	};
	// 编辑框输入后自定义触发事件
	this.EditAfterEvent = function() {
		return;
	};
	this._GetItem = function(name) {
		var nodeList = this.ItemList;
		for (var i = 0; i < nodeList.length; i = i + 1) {
			var node = nodeList[i];
			var nameNode = this._GetSubItem("Name", node);
			var name1 = this.Xml.GetElementAttribute(nameNode, "Name");
			if (name1 == name) {
				return node;
			}
		}
	};
	this._GetSubItem = function(subName, itemNode) {
		var nodes = this.Xml.GetElements(subName + "/Set", itemNode);
		if (nodes == null || nodes.length == 0) {
			return null;
		}
		if (subName == 'DescriptionSet') {
			for (var i = 0; i < nodes.length; i += 1) {
				var l = nodes[i].getAttribute('Lang');
				if (l != null && l.trim().toUpperCase() == EWA.LANG.trim().toUpperCase()) {
					return nodes[i];
				}
			}
			return nodes[0];
		} else {
			return nodes[0];
		}
	};
	this._GetSubValue = function(subName, subAttName, itemNode) {
		var subItem = this._GetSubItem(subName, itemNode);
		if (subItem == null) {
			return null;
		}
		var val = this.Xml.GetElementAttribute(subItem, subAttName);
		subItem = null;
		return val;
	};

	/**
	 * 动态添加列
	 * 
	 * @param {Object}
	 *            datas 列的数据
	 * @param {Object}
	 *            colId 列编号
	 * @param {Object}
	 *            colText 列头
	 * @param {Object}
	 *            colMemo 列提示
	 * @param {Object}
	 *            colHtml 列的HTML
	 * @memberOf {TypeName}
	 */
	this.AddColumns = function(datas, colId, colText, colMemo, colHtml, colType, addAttrs, startCellIndex) {
		var tb = $X('EWA_LF_' + this._Id);
		var loc = {};
		if (startCellIndex == null) {
			startCellIndex = tb.rows[0].cells.length;
		}
		for (var i = 0; i < datas.length; i++) {
			var d = datas[i];
			var idx = startCellIndex + i;
			for (var m = 0; m < tb.rows.length; m++) {
				var td = tb.rows[m].insertCell(idx);
				if (m == 0) {
					td.className = "EWA_TD_H";
					td.innerHTML = '<nobr cellIdx="' + (idx) + '" id="' + d[colId] + '">' + d[colText] + '</nobr>';
					td.title = d[colMemo];
					td.width = 100;
					loc[d[colId]] = idx;

				} else {
					var rowId = tb.rows[m].getAttribute('EWA_KEY');
					td.className = "EWA_TD_M";
					var id = rowId + '_' + d[colId];
					var h = this._GetAddControl(d[colType]);
					if (h == null) {
						h = colHtml;
					} else {

					}
					var atts = addAttrs.replace('[ID]', d[colId]);
					if (h.indexOf('<select') >= 0) {
						h = h.replace('!!', atts.replace('onblur=', 'onchange='));
					} else {
						h = h.replace('!!', atts);
					}
					td.innerHTML = h;
					td.childNodes[0].id = id;
				}
			}
		}
	};
	this._GetAddControl = function(type) {
		if (type == null)
			return null;

		var t = type.toUpperCase().trim();
		if (t == 'SELECT') {
			return '<select !!></select>';
		} else if (t == 'DATE') {
			return '<input type=text class=EWA_INPUT onclick="EWA.UI.Calendar.Pop(this,false);" readonly !!>';
		} else if (t == 'TIME') {
			return '<input type=text class=EWA_INPUT onclick="EWA.UI.Calendar.Pop(this,true);" readonly !!>';
		} else if (t == 'STRING' || t == 'NUMBER') {
			return '<input type=text class=EWA_INPUT !!>';
		}
		return null;
	};
	this.AddedValues = function(colVals, rowId, colId, colValName, isChecked) {
		for (var i = 0; i < colVals.length; i++) {
			var v0 = colVals[i];
			var id = v0[rowId] + '_' + v0[colId];
			var obj = $X(id);
			if (!obj) {
				return;
			}
			var tag = obj.tagName.toUpperCase();
			if (tag == 'INPUT' || tag == 'SELECT' || tag == 'TEXTAREA') {
				obj.value = v0[colValName];
			} else {
				obj.innerHTML = v0[colValName];
			}
			if (isChecked) {
				var tr = this.GetRow(obj);
				tr.getElementsByTagName('input')[0].checked = true;
			}
		}
	};
	this.AddRow = function(arrRowTxt) {
		var tb = $X('EWA_LF_' + this._Id);
		var tr = tb.insertRow(-1);
		for (var i = 0; i < tb.rows[0].cells.length; i++) {
			var td = tr.insertCell(-1);
			var hCell = tb.rows[0].cells[i];
			td.className = "EWA_TD_M";
			if (arrRowTxt[i] != null) {
				td.innerHTML = arrRowTxt[i]
			}
			td.style.display = hCell.style.display;
			td.id = 'ADD_ROW_' + hCell.childNodes[0].id;
		}
		return tr;
	};

	this.Calc = function(arrCols, rowIdxStart, rowIdxEnd, rowSum) {
		var tb = $X('EWA_LF_' + this._Id);
		var sums = {};
		for (var i = 0; i < arrCols.length; i++) {
			sums[arrCols[i]] = 0;
		}
		for (var i = rowIdxStart; i < rowIdxEnd; i++) {
			var tr = tb.rows[i];
			for (var m = 0; m < tr.cells.length; m++) {
				if (sums[m] == null) {
					continue;
				}
				var td = tr.cells[m];
				var inputs = td.getElementsByTagName('input');
				if (inputs.length > 0) {
					sums[m] += inputs[0].value * 1;
				} else {
					var v = GetInnerText(td);
					if (v == '') {
						v = 0;
					}
					sums[m] += v * 1
				}
			}
		}
		var trSum = tb.rows[rowSum];
		for (var i = 0; i < trSum.cells.length; i++) {
			if (sums[i] != null) {
				var v = Math.round(sums[i] * 100) / 100;
				var v1 = GetInnerText(trSum.cells[i]);
				if (v != v1 * 1) {
					this.IsCalcChanged = true;
				}
				trSum.cells[i].innerHTML = v.fm();
			}
		}
	};
	/**
	 * 合并表头
	 * 
	 * @param formId
	 *            开始的字段id
	 * @param mergeText
	 *            合并的文字
	 * @param rowNums
	 *            从formId开始 合并的字段数量
	 */
	this.mergeHeaders = function(fromId, mergeText, rowNums) {
		var tb = $($X('EWA_LF_' + this._Id));
		var tr = tb.find('tr[ewa_tag="HEADER"]');
		if (tr.length == 0) {
			return;
		}
		var tdstart = tr.find('nobr[id="' + fromId + '"]').parent();
		if (tdstart.length == 0) {
			return;
		}
		var meargeTr = tb.find('tr[ewa_mearge]');
		if (meargeTr.length == 0) {
			meargeTr = $(tb[0].insertRow(1));
			meargeTr.attr("ewa_mearge", "gdx");
		}
		var i_start = -1;
		var new_td = null;
		for (var i = 0; i < tr[0].cells.length; i++) {
			var td = tr[0].cells[i];
			if (td == tdstart[0]) { // 合并开始的td
				i_start = i;
				td.colSpan = rowNums;
			}
			if (i_start == -1) {// 不是合并的td
				if ($(td).attr('ewa_tdmearged') != "1") {
					td.rowSpan = 2;
				}
			} else {
				if (i_start + rowNums == i) {
					// 合并结束后的第一个的td
					i_start = -1;
					td.rowSpan = 2;
				} else {
					td.rowSpan = 1;
					var td1 = meargeTr[0].insertCell(-1);
					td1.innerHTML = td.innerHTML;
					td1.className = td.className;
					td1.style.cssText = td.style.cssText;

					td.style.display = 'none';
					$(td).attr('ewa_tdmearged', 1);
				}
			}
			if (td == tdstart[0]) {
				td.innerHTML = mergeText;
				td.style.display = '';
				td.style.width = ''; // 取消宽度限制
			}
		}
	};
	/**
	 * 合并头部
	 */
	this.MeargeHeader = function(fromId, meargeText, rowNums) {
		console.log('拼写错误，请用 mergeHeaders');
		this.mergeHeaders(fromId, meargeText, rowNums);
	};

	this.getUrlClass = function() {
		var u = new EWA_UrlClass();
		u.SetUrl(this.Url);
		return u;
	};
};

EWA_ListFrameClass.prototype.RESOURCES = {
	search_text_items : [ {
		Id : "lk",
		Txt : "包含",
		TxtEn : "Like"
	}, {
		Id : "llk",
		Txt : "左包含",
		TxtEn : "Left like"
	}, {
		Id : "rlk",
		Txt : "右包含",
		TxtEn : "Right like"
	}, {
		Id : "eq",
		Txt : "等于",
		TxtEn : "Equals"
	} ],
	search_date_items : [ {
		Id : "Clear",
		Txt : "清空",
		TxtEn : "Clear",
		Img : "fa fa-eraser"
	}, {
		Id : "Today",
		Txt : "今天",
		TxtEn : "Today"
	}, {
		Id : "Week",
		Txt : "本周",
		TxtEn : "Week"
	}, {
		Id : "Today-Weekend",
		Txt : "今天至周日",
		TxtEn : "Today-Weekend"
	}, {
		Id : "Month",
		Txt : "本月",
		TxtEn : "This Month"
	}, {
		Id : "Today-EOM",
		Txt : "今天至月底",
		TxtEn : "Today-EOM"
	}, {
		Id : "Quarter",
		Txt : "本季度",
		TxtEn : "This Quarter"
	}, {
		Id : "Today-EOQ",
		Txt : "今天至季末",
		TxtEn : "Today-EOQ"
	}, {
		Id : "Year",
		Txt : "本年度",
		TxtEn : "This Year"
	}, {
		Id : "Today-EOY",
		Txt : "今天至年底",
		TxtEn : "Today-EOY"
	} ]
};

EWA.F.L = {/* ListFrame */
	CUR: null,
	C: EWA_ListFrameClass
};