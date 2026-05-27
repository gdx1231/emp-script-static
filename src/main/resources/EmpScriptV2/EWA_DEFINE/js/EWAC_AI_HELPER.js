/**
 * EWAC_AI_HELPER.js — AI 辅助编程模块
 * 依赖：EWA.js（提供 EWA.CP, EWA_UrlClass, $JP, $Tip）
 * Ace Editor 已加载
 */
var EWAC_AI_HELPER = {
	API_URL: null,

	/** 内置供应商定义（均兼容 OpenAI /v1/chat/completions 格式） */
	providers: {
		openai: {
			name: 'OpenAI',
			base: 'https://api.openai.com/v1',
			models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
			model: 'gpt-4o-mini',
			key: true,
			reqHeaders: function(key) { return { 'Authorization': 'Bearer ' + key }; }
		},
		deepseek: {
			name: 'DeepSeek',
			base: 'https://api.deepseek.com/v1',
			models: ['deepseek-chat', 'deepseek-reasoner'],
			model: 'deepseek-chat',
			key: true,
			reqHeaders: function(key) { return { 'Authorization': 'Bearer ' + key }; }
		},
		qwen: {
			name: '通义千问',
			base: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
			models: ['qwen-plus', 'qwen-max', 'qwen-turbo', 'qwen-coder-plus'],
			model: 'qwen-plus',
			key: true,
			reqHeaders: function(key) { return { 'Authorization': 'Bearer ' + key }; }
		},
		ollama: {
			name: 'Ollama (本地)',
			base: 'http://localhost:11434/v1',
			models: ['llama3', 'codellama', 'qwen2.5', 'deepseek-r1'],
			model: 'qwen2.5',
			key: false,
			reqHeaders: function() { return {}; }
		},
		zhipu: {
			name: '智谱 GLM',
			base: 'https://open.bigmodel.cn/api/paas/v4',
			models: ['glm-4-plus', 'glm-4-flash', 'glm-4-air'],
			model: 'glm-4-flash',
			key: true,
			reqHeaders: function(key) { return { 'Authorization': 'Bearer ' + key }; }
		},
		custom: {
			name: '自定义',
			base: '',
			models: [],
			model: '',
			key: true,
			reqHeaders: function(key) { return { 'Authorization': 'Bearer ' + key }; }
		}
	},

	/** 运行时配置 */
	config: {
		provider: 'openai',
		model: 'gpt-4o-mini',
		api_key: '',
		base_url: '',
		use_proxy: true
	},

	actions: {
		COMPLETE: { label: '补全代码', desc: '在光标处续写代码' },
		EXPLAIN:  { label: '解释代码', desc: '解释选中的代码' },
		FIX:      { label: '修复错误', desc: '检查并修复代码问题' },
		GENERATE: { label: '生成代码', desc: '根据描述生成代码' },
		REVIEW:   { label: '代码审查', desc: '审查并优化代码' }
	},

	_panel: null,
	_input: null,
	_output: null,
	_sendBtn: null,
	_settingsBtn: null,
	_settingsPanel: null,
	_isStreaming: false,
	_lastAction: null,
	_lastOriginalCode: '',

	/* ======================== 初始化 ======================== */

	init: function(editor, opts) {
		this.editor = editor;
		opts = opts || {};
		this.API_URL = opts.apiUrl || (typeof EWA !== 'undefined' ? EWA.CP : '') + '/EWA_DEFINE/cgi-bin/xml/?type=AI';
		this._loadConfig();
		if (opts.provider) { this.config.provider = opts.provider; }
		if (opts.model)    { this.config.model    = opts.model; }
		if (opts.apiKey)   { this.config.api_key  = opts.apiKey; }
		this._saveConfig();
		this._initMarkdown();
		this._buildPanel();
		this._buildSettingsPanel();
		this._buildDiffOverlay();
		this._buildSelectionToolbar();
		this._bindKeys();
		this._bindSelectionListener();
		this._startInlineCompletion();
		return this;
	},

	/* ======================== 配置持久化 ======================== */

	_loadConfig: function() {
		try {
			var s = window.localStorage['EWA_AI_CONFIG'];
			if (s) {
				var c = JSON.parse(s);
				for (var k in c) { if (c.hasOwnProperty(k)) { this.config[k] = c[k]; } }
			}
		} catch (e) {}
	},

	_saveConfig: function() {
		try { window.localStorage['EWA_AI_CONFIG'] = JSON.stringify(this.config); }
		catch (e) {}
	},

	_getProviderDef: function() {
		return this.providers[this.config.provider] || this.providers.custom;
	},

	_getBaseUrl: function() {
		if (this.config.base_url) { return this.config.base_url; }
		return this._getProviderDef().base;
	},

	_isKeyRequired: function() {
		return this._getProviderDef().key;
	},

	/* ======================== Markdown 渲染 ======================== */

	_initMarkdown: function() {
		var self = this;
		if (typeof window.markdownit !== 'undefined') {
			this._initMarkdownInstance();
		} else {
			this._loadMarkdownIt();
		}
	},

	_loadMarkdownIt: function() {
		var self = this;
		this._tryLoadScript([
			'../../../third-party/markdown-editor-master/markdown-it.js',
			'../../third-party/markdown-editor-master/markdown-it.js'
		], 0);
	},

	_tryLoadScript: function(paths, idx) {
		var self = this;
		if (idx >= paths.length) { return; }
		var s = document.createElement('script');
		s.src = paths[idx];
		s.onload = function() { self._initMarkdownInstance(); };
		s.onerror = function() { self._tryLoadScript(paths, idx + 1); };
		document.head.appendChild(s);
	},

	_initMarkdownInstance: function() {
		if (this._md || typeof window.markdownit === 'undefined') { return; }
		this._md = window.markdownit({
			html: false,
			linkify: true,
			typographer: false,
			highlight: function(code, lang) {
				return '<pre><code>' + EWAC_AI_HELPER._escapeHtml(code) + '</code></pre>';
			}
		});
	},

	_mdRender: function(text) {
		if (this._md) {
			try { return this._md.render(text); } catch (e) { return this._escapeHtml(text); }
		}
		return this._escapeHtml(text).replace(/\n/g, '<br>');
	},

	/* ======================== 主面板 ======================== */

	_buildPanel: function() {
		if (document.getElementById('ewa_ai_panel')) { return; }

		var p = document.createElement('div');
		p.id = 'ewa_ai_panel';
		p.innerHTML =
			'<div id="ewa_ai_header">' +
			'  <span id="ewa_ai_title">AI 助手</span>' +
			'  <span><span id="ewa_ai_settings_btn" title="供应商设置">&#9881;</span>' +
			'  <span id="ewa_ai_close">&times;</span></span>' +
			'</div>' +
			'<div id="ewa_ai_output"></div>' +
			'<div id="ewa_ai_input_wrap">' +
			'  <textarea id="ewa_ai_input" rows="2" placeholder="输入问题或指令..."></textarea>' +
			'  <button id="ewa_ai_send">发送</button>' +
			'</div>' +
			'<div id="ewa_ai_actions"></div>';
		document.body.appendChild(p);

		this._panel        = p;
		this._output       = document.getElementById('ewa_ai_output');
		this._input        = document.getElementById('ewa_ai_input');
		this._sendBtn      = document.getElementById('ewa_ai_send');
		this._settingsBtn  = document.getElementById('ewa_ai_settings_btn');

		var self = this;
		document.getElementById('ewa_ai_close').onclick = function() { self.hide(); };
		this._settingsBtn.onclick = function(e) { e.stopPropagation(); self._toggleSettings(); };

		this._sendBtn.onclick = function() {
			var msg = self._input.value.trim();
			if (!msg) { return; }
			var sel = self.editor.getSelectedText();
			self._appendMessage('user', msg);
			self.chat({ prompt: msg, action: self._lastAction || 'GENERATE', code: sel || undefined });
			self._input.value = '';
		};
		this._input.onkeydown = function(e) {
			if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); self._sendBtn.click(); }
			else if (e.key === 'Escape') { self.hide(); }
		};
		this._buildActionButtons();
		this._injectStyles();
	},

	_buildActionButtons: function() {
		var w = document.getElementById('ewa_ai_actions');
		var self = this, h = [];
		for (var k in this.actions) {
			var a = this.actions[k];
			h.push('<button class="ewa_ai_btn" data-action="' + k + '" title="' + a.desc + '">' + a.label + '</button>');
		}
		w.innerHTML = h.join('');
		var btns = w.querySelectorAll('.ewa_ai_btn');
		for (var i = 0; i < btns.length; i++) {
			btns[i].onclick = function() {
				self._lastAction = this.getAttribute('data-action');
				self.runAction(self._lastAction);
			};
		}
	},

	/* ======================== 供应商设置面板 ======================== */

	_buildSettingsPanel: function() {
		if (document.getElementById('ewa_ai_settings')) { return; }
		var self = this;
		var dd = document.createElement('div');
		dd.id = 'ewa_ai_settings';
		dd.style.display = 'none';
		dd.innerHTML =
			'<div class="ewa_ai_setting_row"><label>供应商</label><select id="ews_provider"></select></div>' +
			'<div class="ewa_ai_setting_row"><label>模型</label><select id="ews_model"></select></div>' +
			'<div class="ewa_ai_setting_row" id="ews_key_row"><label>API Key</label><input id="ews_api_key" type="password" placeholder="sk-..."></div>' +
			'<div class="ewa_ai_setting_row" id="ews_base_row"><label>Base URL</label><input id="ews_base_url" type="text" placeholder="https://api.openai.com/v1"></div>' +
			'<div class="ewa_ai_setting_row"><label>连接方式</label><select id="ews_use_proxy"><option value="1">后端代理</option><option value="0">浏览器直连</option></select></div>' +
			'<div class="ewa_ai_setting_btns"><button id="ews_save">保存</button><button id="ews_cancel">取消</button></div>';
		this._panel.insertBefore(dd, document.getElementById('ewa_ai_output'));
		this._settingsPanel = dd;

		document.getElementById('ews_provider').onchange = function() { self._refreshModelList(); self._refreshKeyVisibility(); self._refreshBaseUrl(); };
		document.getElementById('ews_save').onclick = function() { self._saveSettings(); self._hideSettings(); };
		document.getElementById('ews_cancel').onclick = function() { self._hideSettings(); };
	},

	_refreshProviderList: function() {
		var sel = document.getElementById('ews_provider');
		sel.innerHTML = '';
		for (var k in this.providers) {
			if (k === 'custom') { continue; }
			sel.innerHTML += '<option value="' + k + '">' + this.providers[k].name + '</option>';
		}
		sel.innerHTML += '<option value="custom">自定义</option>';
		sel.value = this.config.provider;
	},

	_refreshModelList: function() {
		var prov = document.getElementById('ews_provider').value;
		var def = this.providers[prov] || this.providers.custom;
		var sel = document.getElementById('ews_model');
		sel.innerHTML = '';
		for (var i = 0; i < def.models.length; i++) {
			var m = def.models[i];
			var selAttr = (m === this.config.model) ? ' selected' : '';
			sel.innerHTML += '<option value="' + m + '"' + selAttr + '>' + m + '</option>';
		}
		if (def.models.length === 0 && this.config.model) {
			sel.innerHTML += '<option value="' + this.config.model + '">' + this.config.model + '</option>';
		}
		if (prov === 'custom') {
			document.getElementById('ews_base_row').style.display = 'flex';
			document.getElementById('ews_key_row').style.display = 'flex';
		}
	},

	_refreshKeyVisibility: function() {
		var prov = document.getElementById('ews_provider').value;
		var def = this.providers[prov] || this.providers.custom;
		document.getElementById('ews_key_row').style.display = def.key ? 'flex' : 'none';
	},

	_refreshBaseUrl: function() {
		var prov = document.getElementById('ews_provider').value;
		var def = this.providers[prov] || this.providers.custom;
		document.getElementById('ews_base_url').value = this.config.base_url || def.base;
	},

	_showSettings: function() {
		this._refreshProviderList();
		this._refreshModelList();
		this._refreshKeyVisibility();
		this._refreshBaseUrl();
		document.getElementById('ews_api_key').value = this.config.api_key;
		document.getElementById('ews_use_proxy').value = this.config.use_proxy ? '1' : '0';
		this._settingsPanel.style.display = 'block';
	},

	_toggleSettings: function() {
		this._settingsPanel.style.display === 'block' ? this._hideSettings() : this._showSettings();
	},

	_hideSettings: function() { this._settingsPanel.style.display = 'none'; },

	_saveSettings: function() {
		this.config.provider  = document.getElementById('ews_provider').value;
		this.config.model     = document.getElementById('ews_model').value;
		this.config.api_key   = document.getElementById('ews_api_key').value;
		this.config.base_url  = document.getElementById('ews_base_url').value;
		this.config.use_proxy = document.getElementById('ews_use_proxy').value === '1';
		this._saveConfig();
		this._appendMessage('sys', '配置已保存: ' + this._getProviderDef().name + ' / ' + this.config.model);
	},

	/* ======================== Diff 覆盖层 ======================== */

	_buildDiffOverlay: function() {
		if (document.getElementById('ewa_ai_diff_overlay')) { return; }
		var d = document.createElement('div');
		d.id = 'ewa_ai_diff_overlay';
		d.innerHTML =
			'<div id="ewa_ai_diff_dialog">' +
			'  <div class="diff_header"><span>代码变更预览</span><span class="diff_close">&times;</span></div>' +
			'  <div class="diff_content"><pre id="ewa_ai_diff_body"></pre></div>' +
			'  <div class="diff_btns">' +
			'    <button id="ewa_diff_accept" class="btn_primary">确认替换</button>' +
			'    <button class="diff_cancel">取消</button>' +
			'  </div>' +
			'</div>';
		document.body.appendChild(d);

		d.querySelector('.diff_close').onclick = function() { EWAC_AI_HELPER._hideDiff(); };
		d.querySelector('.diff_cancel').onclick = function() { EWAC_AI_HELPER._hideDiff(); };
		d.onclick = function(e) { if (e.target === d) { EWAC_AI_HELPER._hideDiff(); } };
		document.getElementById('ewa_diff_accept').onclick = function(e) {
			e.stopPropagation();
			var code = this._ewaCode;
			var action = this._ewaAction;
			if (!code) { alert('未获取到代码内容'); return; }
			EWAC_AI_HELPER._doApply(code, action);
			EWAC_AI_HELPER._hideDiff();
		};
	},

	_showDiff: function(oldCode, newCode, action) {
		var acceptBtn = document.getElementById('ewa_diff_accept');
		acceptBtn._ewaCode = newCode;
		acceptBtn._ewaAction = action;

		var body = document.getElementById('ewa_ai_diff_body');
		var lines = this._computeDiff(oldCode, newCode);
		var html = '';
		for (var i = 0; i < lines.length; i++) {
			var cls = lines[i].t === '+' ? 'diff_add' : (lines[i].t === '-' ? 'diff_del' : '');
			var prefix = lines[i].t === '+' ? '+ ' : (lines[i].t === '-' ? '- ' : '  ');
			html += '<div class="' + cls + '"><span class="ln">' + (lines[i].n || '') + '</span>' +
				prefix + this._escapeHtml(lines[i].text) + '</div>';
		}
		body.innerHTML = html;
		document.getElementById('ewa_ai_diff_overlay').classList.add('show');
	},

	_hideDiff: function() {
		document.getElementById('ewa_ai_diff_overlay').classList.remove('show');
	},

	/** 简单行级 diff（LCS 算法） */
	_computeDiff: function(oldStr, newStr) {
		var oldLines = oldStr.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
		var newLines = newStr.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');

		var m = oldLines.length, n = newLines.length;
		var dp = [];
		for (var i = 0; i <= m; i++) { dp[i] = []; for (var j = 0; j <= n; j++) { dp[i][j] = 0; } }
		for (var i2 = 1; i2 <= m; i2++) {
			for (var j2 = 1; j2 <= n; j2++) {
				if (oldLines[i2 - 1] === newLines[j2 - 1]) {
					dp[i2][j2] = dp[i2 - 1][j2 - 1] + 1;
				} else {
					dp[i2][j2] = Math.max(dp[i2 - 1][j2], dp[i2][j2 - 1]);
				}
			}
		}

		var result = [];
		var oi = m, ni = n;
		var stack = [];
		while (oi > 0 || ni > 0) {
			if (oi > 0 && ni > 0 && oldLines[oi - 1] === newLines[ni - 1]) {
				stack.push({ t: ' ', text: oldLines[oi - 1] });
				oi--; ni--;
			} else if (ni > 0 && (oi === 0 || dp[oi][ni - 1] >= dp[oi - 1][ni])) {
				stack.push({ t: '+', text: newLines[ni - 1] });
				ni--;
			} else if (oi > 0) {
				stack.push({ t: '-', text: oldLines[oi - 1] });
				oi--;
			} else {
				break;
			}
		}
		for (var k = stack.length - 1; k >= 0; k--) {
			result.push(stack[k]);
		}
		return result;
	},

	/** 执行代码替换 */
	_doApply: function(code, action) {
		if (!code && code !== '') { return; }
		var trimmed = code.trim();
		if (!trimmed && action !== 'COMPLETE') { return; }
		if (action === 'COMPLETE') {
			var cursor = this.editor.getCursorPosition();
			this.editor.session.insert(cursor, '\n' + trimmed);
		} else if (this._lastSelectionRange) {
			this.editor.session.replace(this._lastSelectionRange, trimmed);
			this._lastSelectionRange = null;
		} else {
			this.editor.setValue(trimmed, 1);
		}
		this.editor.selection.clearSelection();
		this.editor.focus();
	},

	/* ======================== 样式 ======================== */

	_injectStyles: function() {
		if (document.getElementById('ewa_ai_styles')) { return; }
		var css = document.createElement('style');
		css.id = 'ewa_ai_styles';
		css.textContent =
			'#ewa_ai_panel{position:fixed;top:0;right:-460px;width:450px;height:100%;z-index:100000;background:#1e1e1e;color:#d4d4d4;font-size:13px;font-family:"Microsoft YaHei",宋体,sans-serif;display:flex;flex-direction:column;transition:right .25s ease;box-shadow:-4px 0 16px rgba(0,0,0,.5);}' +
			'#ewa_ai_panel.open{right:0;}' +
			'#ewa_ai_header{padding:10px 14px;background:#252526;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #3c3c3c;}' +
			'#ewa_ai_title{font-weight:bold;font-size:15px;}' +
			'#ewa_ai_settings_btn{cursor:pointer;font-size:18px;color:#888;padding:0 8px;}' +
			'#ewa_ai_settings_btn:hover{color:#fff;}' +
			'#ewa_ai_close{cursor:pointer;font-size:20px;color:#888;padding:0 6px;}' +
			'#ewa_ai_close:hover{color:#fff;}' +
			'#ewa_ai_output{flex:1;overflow-y:auto;padding:10px 14px;line-height:1.6;white-space:pre-wrap;word-break:break-word;}' +
			'#ewa_ai_output .msg-user{color:#569cd6;margin-bottom:8px;}' +
			'#ewa_ai_output .msg-ai{color:#ce9178;margin-bottom:12px;}' +
			'#ewa_ai_output .msg-ai .msg-text{white-space:pre-wrap;}' +
			'#ewa_ai_output .msg-sys{color:#6a9955;margin-bottom:8px;font-style:italic;}' +
			'#ewa_ai_output .msg-label{font-size:11px;color:#6a6a6a;margin-bottom:2px;}' +
			'#ewa_ai_setting_btns{display:flex;gap:6px;justify-content:flex-end;margin-top:4px;}' +
			'#ewa_ai_setting_btns button{padding:4px 16px;border-radius:3px;border:1px solid #555;cursor:pointer;font-size:12px;}' +
			'#ews_save{background:#0e639c;color:#fff;}' +
			'#ews_save:hover{background:#1177bb;}' +
			'#ews_cancel{background:#3c3c3c;color:#ccc;}' +
			'#ews_cancel:hover{background:#555;}' +
			'#ewa_ai_settings{background:#252526;padding:10px 14px;border-bottom:1px solid #3c3c3c;}' +
			'.ewa_ai_setting_row{display:flex;align-items:center;margin-bottom:8px;gap:8px;}' +
			'.ewa_ai_setting_row label{width:60px;font-size:12px;color:#888;text-align:right;flex-shrink:0;}' +
			'.ewa_ai_setting_row select,.ewa_ai_setting_row input{flex:1;background:#3c3c3c;color:#d4d4d4;border:1px solid #555;border-radius:3px;padding:4px 6px;font-size:12px;outline:none;}' +
			'.ewa_ai_setting_row select:focus,.ewa_ai_setting_row input:focus{border-color:#007acc;}' +
			'#ewa_ai_input_wrap{display:flex;padding:8px 10px;border-top:1px solid #3c3c3c;gap:6px;}' +
			'#ewa_ai_input{flex:1;resize:none;background:#3c3c3c;color:#d4d4d4;border:1px solid #555;border-radius:4px;padding:6px 8px;font-size:13px;outline:none;font-family:monospace;}' +
			'#ewa_ai_input:focus{border-color:#007acc;}' +
			'#ewa_ai_send{padding:4px 14px;background:#0e639c;color:#fff;border:none;border-radius:4px;cursor:pointer;}' +
			'#ewa_ai_send:hover{background:#1177bb;}' +
			'#ewa_ai_send:disabled{opacity:.5;cursor:not-allowed;}' +
			'#ewa_ai_actions{display:flex;flex-wrap:wrap;gap:4px;padding:6px 10px;border-top:1px solid #3c3c3c;}' +
			'.ewa_ai_btn{padding:3px 10px;background:#333;color:#ccc;border:1px solid #555;border-radius:3px;cursor:pointer;font-size:12px;}' +
			'.ewa_ai_btn:hover{background:#0e639c;color:#fff;border-color:#0e639c;}' +
			'.ewa_ai_code_block{background:#1e1e1e;border:1px solid #3c3c3c;border-radius:4px;margin:6px 0;overflow:hidden;}' +
			'.ewa_ai_code_header{display:flex;justify-content:space-between;align-items:center;padding:4px 10px;background:#333;font-size:11px;color:#888;}' +
			'.ewa_ai_code_header span{color:#4ec9b0;}' +
			'.ewa_ai_code_header .cx_btns{display:flex;gap:4px;}' +
			'.ewa_ai_code_header button{padding:1px 8px;border:1px solid #555;border-radius:2px;background:#2a2a2a;color:#c0c0c0;cursor:pointer;font-size:11px;}' +
			'.ewa_ai_code_header button:hover{background:#0e639c;color:#fff;border-color:#0e639c;}' +
			'.ewa_ai_code_header button.btn_apply{background:#0e639c;color:#fff;border-color:#0e639c;font-weight:bold;}' +
			'.ewa_ai_code_pre{margin:0;padding:8px 10px;overflow-x:auto;font-family:Consolas,monospace;font-size:12px;line-height:1.5;color:#d4d4d4;white-space:pre;}' +
			'#ewa_ai_diff_overlay{display:none;position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.6);z-index:300000;justify-content:center;align-items:center;}' +
			'#ewa_ai_diff_overlay.show{display:flex;}' +
			'#ewa_ai_diff_dialog{background:#1e1e1e;border:1px solid #3c3c3c;border-radius:8px;width:85vw;max-height:85vh;display:flex;flex-direction:column;box-shadow:0 8px 32px rgba(0,0,0,.6);}' +
			'#ewa_ai_diff_dialog .diff_header{display:flex;justify-content:space-between;align-items:center;padding:12px 18px;border-bottom:1px solid #3c3c3c;font-size:14px;font-weight:bold;color:#d4d4d4;}' +
			'#ewa_ai_diff_dialog .diff_close{font-size:20px;color:#888;cursor:pointer;}' +
			'#ewa_ai_diff_dialog .diff_close:hover{color:#fff;}' +
			'#ewa_ai_diff_dialog .diff_content{flex:1;overflow:auto;padding:8px 0;}' +
			'#ewa_ai_diff_body{margin:0;font-family:Consolas,monospace;font-size:12px;line-height:1.6;color:#d4d4d4;white-space:pre;}' +
			'#ewa_ai_diff_body .ln{display:inline-block;width:36px;text-align:right;margin-right:8px;color:#6a6a6a;font-size:11px;user-select:none;}' +
			'#ewa_ai_diff_body .diff_add{background:rgba(30,120,30,.25);}' +
			'#ewa_ai_diff_body .diff_del{background:rgba(180,40,40,.25);}' +
			'#ewa_ai_diff_dialog .diff_btns{display:flex;gap:8px;justify-content:flex-end;padding:12px 18px;border-top:1px solid #3c3c3c;}' +
			'#ewa_ai_diff_dialog .diff_btns button{padding:6px 20px;border-radius:4px;border:1px solid #555;cursor:pointer;font-size:13px;}' +
			'#ewa_ai_diff_dialog .btn_primary{background:#0e639c;color:#fff;border-color:#0e639c;}' +
			'#ewa_ai_diff_dialog .btn_primary:hover{background:#1177bb;}' +
			'#ewa_ai_diff_dialog .diff_cancel{background:#3c3c3c;color:#ccc;}' +
			'#ewa_ai_diff_dialog .diff_cancel:hover{background:#555;}' +
			'#ewa_ai_output::-webkit-scrollbar{width:6px;}' +
			'#ewa_ai_output::-webkit-scrollbar-track{background:#1e1e1e;}' +
			'#ewa_ai_output::-webkit-scrollbar-thumb{background:#555;}' +
			'body.ai-panel-open #code{right:450px !important;}' +
			'#ewa_ai_sel_bar{position:fixed;z-index:99999;display:flex;gap:2px;' +
			'background:#2d2d2d;border:1px solid #4a4a4a;border-radius:6px;padding:4px;' +
			'box-shadow:0 4px 14px rgba(0,0,0,.5);transition:opacity .15s ease,transform .15s ease;}' +
			'#ewa_ai_sel_bar button{padding:3px 10px;background:#3a3a3a;color:#ccc;border:none;' +
			'border-radius:4px;cursor:pointer;font-size:12px;white-space:nowrap;}' +
			'#ewa_ai_sel_bar button:hover{background:#0e639c;color:#fff;}' +
			'#ewa_ai_sel_bar:after{content:"";position:absolute;top:-6px;left:50%;margin-left:-6px;' +
			'border:6px solid transparent;border-bottom-color:#2d2d2d;}' +
			'.md-body p{margin:4px 0;}' +
			'.md-body ul,.md-body ol{margin:4px 0;padding-left:20px;}' +
			'.md-body li{margin:2px 0;}' +
			'.md-body code{background:#333;padding:1px 4px;border-radius:3px;font-size:12px;color:#ce9178;}' +
			'.md-body pre{background:#1e1e1e;border:1px solid #3c3c3c;border-radius:4px;padding:8px 10px;overflow-x:auto;margin:6px 0;}' +
			'.md-body pre code{background:transparent;padding:0;color:#d4d4d4;}' +
			'.md-body blockquote{border-left:3px solid #0e639c;margin:6px 0;padding:2px 12px;color:#888;}' +
			'.md-body table{border-collapse:collapse;margin:6px 0;}' +
			'.md-body th,.md-body td{border:1px solid #3c3c3c;padding:4px 8px;font-size:12px;}' +
			'.md-body a{color:#569cd6;text-decoration:none;}' +
			'.md-body strong{color:#e0e0e0;}' +
			'.md-body h1,.md-body h2,.md-body h3{color:#d4d4d4;margin:8px 0 4px;font-size:14px;}' +
			'.md-body hr{border:0;border-top:1px solid #3c3c3c;margin:8px 0;}';
		document.head.appendChild(css);
	},

	/* ======================== 面板显隐 ======================== */

	show: function() {
		this._panel.classList.add('open');
		document.body.classList.add('ai-panel-open');
		this._scrollOutput();
	},

	hide: function() {
		this._panel.classList.remove('open');
		document.body.classList.remove('ai-panel-open');
	},

	toggle: function() {
		this._panel.classList.contains('open') ? this.hide() : this.show();
	},

	/* ======================== 键盘绑定 ======================== */

	_bindKeys: function() {
		var self = this;
		if (typeof key !== 'undefined' && typeof key === 'function') {
			key('ctrl+k, command+k', function() { self.toggle(); setTimeout(function() { self._input.focus(); }, 100); return false; });
		}
		document.addEventListener('keydown', function(e) {
			if ((e.ctrlKey || e.metaKey) && e.key === 'k' && !e.shiftKey) { e.preventDefault(); self.toggle(); setTimeout(function() { self._input.focus(); }, 100); }
			if (e.key === 'Escape') {
				if (self._settingsPanel && self._settingsPanel.style.display === 'block') { self._hideSettings(); }
				else if (document.getElementById('ewa_ai_diff_overlay').classList.contains('show')) { self._hideDiff(); }
				else { self.hide(); }
			}
		});
	},

	/* ======================== 选中文字悬浮工具栏 ======================== */

	_buildSelectionToolbar: function() {
		if (document.getElementById('ewa_ai_sel_bar')) { return; }
		var bar = document.createElement('div');
		bar.id = 'ewa_ai_sel_bar';
		bar.style.display = 'none';
		bar.innerHTML =
			'<button data-sa="EXPLAIN" title="解释选中代码">解释</button>' +
			'<button data-sa="FIX" title="修复选中代码">修复</button>' +
			'<button data-sa="COMPLETE" title="续写选中代码">续写</button>' +
			'<button data-sa="GENERATE" title="根据选中内容生成">生成</button>';
		document.body.appendChild(bar);

		var self = this;
		var btns = bar.querySelectorAll('button');
		for (var i = 0; i < btns.length; i++) {
			btns[i].onclick = function(e) {
				e.stopPropagation();
				var action = this.getAttribute('data-sa');
				self._lastAction = action;
				self.runAction(action);
			};
		}
	},

	_bindSelectionListener: function() {
		var self = this;
		this.editor.getSession().selection.on('changeSelection', function() {
			var sel = self.editor.getSelectedText();
			var bar = document.getElementById('ewa_ai_sel_bar');
			if (!bar) { return; }
			if (!sel || !sel.trim()) {
				bar.style.display = 'none';
				return;
			}
			self._positionSelectionToolbar(bar);
		});
	},

	_positionSelectionToolbar: function(bar) {
		var range = this.editor.getSelectionRange();
		var end = range.end;
		var renderer = this.editor.renderer;
		var pos = renderer.textToScreenCoordinates(end.row, end.column);

		if (!pos) { bar.style.display = 'none'; return; }

		var editorEl = renderer.container;
		var rect = editorEl.getBoundingClientRect();
		var top = rect.top + pos.pageY - editorEl.scrollTop + 18;
		var left = rect.left + pos.pageX;

		var barW = bar.offsetWidth || 200;
		if (left + barW > rect.right) { left = rect.right - barW - 6; }

		bar.style.top = top + 'px';
		bar.style.left = left + 'px';
		bar.style.display = 'flex';

		bar.style.opacity = '0';
		bar.style.transform = 'translateY(-4px)';
		setTimeout(function() {
			bar.style.opacity = '1';
			bar.style.transform = 'translateY(0)';
		}, 10);
	},

	/* ======================== 内联代码补全 (Copilot 风格) ======================== */

	_inlineTimer: null,
	_inlineBusy: false,
	_inlineEnabled: true,
	_inlineSuppress: false,
	_inlineWarmup: true,

	_startInlineCompletion: function() {
		var self = this;
		setTimeout(function() { self._inlineWarmup = false; }, 2000);
		this.editor.getSession().on('change', function(delta) {
			if (!self._inlineEnabled || self._inlineBusy || self._inlineSuppress || self._inlineWarmup) { return; }
			if (delta.action !== 'insert') { return; }
			var text = (delta.lines || []).join('\n');
			if (!text || !/[a-zA-Z0-9\u4e00-\u9fff\u3400-\u4dbf\u3000-\u303f\uff00-\uffef!-/:-@\[-`{-~]/.test(text)) { return; }
			if (/^\s*\}[\s\S]*$/.test(text)) { return; }
			clearTimeout(self._inlineTimer);
			self._inlineTimer = setTimeout(function() {
				self._onEditorPause();
			}, 600);
		});
	},

	_onEditorPause: function() {
		var self = this;
		var cursor = this.editor.getCursorPosition();
		var session = this.editor.session;
		var doc = session.getDocument();
		var fullCode = this.editor.getValue();
		var cursorIndex = doc.positionToIndex(cursor);
		var beforeCode = fullCode.substring(Math.max(0, cursorIndex - 3000), cursorIndex);
		var afterCode = fullCode.substring(cursorIndex, cursorIndex + 1);

		if (beforeCode.trim().length < 3) { return; }
		if (afterCode && afterCode !== '\n') { return; }

		var mode = session.getMode().$id;

		this._inlineBusy = true;
		var cb = function(suggestion) {
			self._inlineBusy = false;
			if (suggestion) {
				self._inlineSuppress = true;
				self.editor.session.insert(self.editor.getCursorPosition(), suggestion);
				self.editor.focus();
				setTimeout(function() { self._inlineSuppress = false; }, 800);
			}
		};

		if (!this.config.use_proxy) {
			var msgs = [
				{ role: 'system', content: '你是一个代码补全助手。根据上下文续写代码，只输出补全部分，不要解释，不要包裹代码块，直接输出连续代码。最多输出2行。' },
				{ role: 'user', content: '请续写以下 ' + mode + ' 代码:\n```\n' + beforeCode + '\n...' }
			];
			this._inlineRequest(msgs, cb);
		} else {
			var xhr = new XMLHttpRequest();
			xhr.open('POST', this.API_URL, true);
			xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
			xhr.onload = function() {
				self._inlineBusy = false;
				try {
					var r = JSON.parse(xhr.responseText);
					cb(r.text || '');
				} catch (e) { cb(''); }
			};
			xhr.onerror = function() { self._inlineBusy = false; cb(''); };
			var p = 'TYPE=AI&action=COMPLETE&prompt=续写&mode=' + encodeURIComponent(mode) +
				'&code=' + encodeURIComponent(beforeCode.substring(Math.max(0, beforeCode.length - 2000))) +
				'&provider=' + encodeURIComponent(this.config.provider) +
				'&model=' + encodeURIComponent(this.config.model);
			xhr.send(p);
		}
	},

	_inlineRequest: function(msgs, callback) {
		var self = this;
		var def = this._getProviderDef();
		var base = this._getBaseUrl();
		var url = base.replace(/\/+$/, '') + '/chat/completions';
		var headers = {};
		if (def.reqHeaders) {
			var h = def.reqHeaders(this.config.api_key);
			for (var k in h) { headers[k] = h[k]; }
		}
		headers['Content-Type'] = 'application/json';

		var xhr = new XMLHttpRequest();
		xhr.open('POST', url, true);
		for (var kh in headers) { xhr.setRequestHeader(kh, headers[kh]); }
		xhr.onload = function() {
			try {
				var r = JSON.parse(xhr.responseText);
				var text = '';
				if (r.choices && r.choices[0]) {
					text = (r.choices[0].message && r.choices[0].message.content) || r.choices[0].text || '';
				}
				text = text.replace(/```[\s\S]*?```/g, '').replace(/{{/g, '').replace(/^[\s\n]+/, '');
				var lines = text.split('\n');
				var trim = '';
				for (var i = 0; i < Math.min(lines.length, 3); i++) {
					if (lines[i].trim()) { trim += (trim ? '\n' : '') + lines[i]; }
				}
				callback(trim || '');
			} catch (e) { callback(''); }
		};
		xhr.onerror = function() { callback(''); };
		xhr.send(JSON.stringify({
			model: self.config.model,
			messages: msgs,
			max_tokens: 120,
			temperature: 0.1,
			stop: ['\n\n\n', '```'],
			stream: false
		}));
	},

	/* ======================== AI 操作 ======================== */

	runAction: function(action) {
		var self = this;
		this._lastAction = action;
		this.show();

		var code = this.editor.getValue();
		var sel  = this.editor.getSelectedText();
		var mode = this.editor.session.getMode().$id;
		var targetCode = sel || code;

		this._lastSelectionRange = sel ? this.editor.getSelectionRange() : null;

		if (action === 'EXPLAIN') {
			if (!sel) { this._appendMessage('ai', '请先选中需要解释的代码段'); return; }
			this._appendMessage('user', '解释以下 ' + mode + ' 代码：\n' + sel.substring(0, 500));
			this.chat({ prompt: '请解释以下 ' + mode + ' 代码的作用和逻辑', action: action, code: sel });
		} else if (action === 'FIX') {
			this._appendMessage('user', (sel ? '修复选中代码' : '检查并修复以下 ' + mode + ' 代码'));
			this.chat({ prompt: '请检查以下 ' + mode + ' 代码的错误并给出修复后的完整代码，如果没问题就说明没问题。请用 Markdown 代码块包裹你的修复代码。', action: action, code: targetCode });
		} else if (action === 'REVIEW') {
			this._appendMessage('user', (sel ? '审查选中代码' : '审查以下 ' + mode + ' 代码'));
			this.chat({ prompt: '请审查以下 ' + mode + ' 代码，列出潜在问题和优化建议', action: action, code: targetCode });
		} else if (action === 'COMPLETE') {
			if (sel) {
				this._appendMessage('user', '续写代码');
				this.chat({ prompt: '请续写以下 ' + mode + ' 代码，保持风格一致，只输出续写的代码部分。请用 Markdown 代码块包裹。', action: action, code: sel });
			} else {
				var cursor = this.editor.getCursorPosition();
				var before = code.substring(0, this.editor.getSession().getDocument().positionToIndex(cursor));
				before = before.substring(Math.max(0, before.length - 2000));
				this._appendMessage('user', '续写代码（光标处）');
				this.chat({ prompt: '请续写以下 ' + mode + ' 代码，只输出续写的代码部分。请用 Markdown 代码块包裹。', action: action, code: before });
			}
		} else if (action === 'GENERATE') {
			this._input.focus();
			this._input.placeholder = sel ? '根据选中的代码描述你想要生成的...' : '描述你想要生成的代码...';
		}
	},

	/* ======================== 网络请求 ======================== */

	_buildMessages: function(prompt, code) {
		var mode = this.editor.session.getMode().$id;
		var msgs = [
			{ role: 'system', content: '你是一个专业的编程助手。当前编辑器语言是 ' + mode + '。回答简洁、直接，代码用 Markdown 代码块包裹。' }
		];
		if (code) {
			msgs.push({ role: 'user', content: prompt + '\n\n```\n' + code + '\n```' });
		} else {
			msgs.push({ role: 'user', content: prompt });
		}
		return msgs;
	},

	_directChat: function(messages, msgEl) {
		var self = this;
		var def = this._getProviderDef();
		var base = this._getBaseUrl();
		var url = base.replace(/\/+$/, '') + '/chat/completions';
		var headers = {};
		if (def.reqHeaders) {
			var h = def.reqHeaders(this.config.api_key);
			for (var k in h) { headers[k] = h[k]; }
		}
		headers['Content-Type'] = 'application/json';

		var body = JSON.stringify({ model: this.config.model, messages: messages, stream: true });

		var xhr = new XMLHttpRequest();
		xhr.open('POST', url, true);
		for (var kh in headers) { xhr.setRequestHeader(kh, headers[kh]); }

		var lastIdx = 0;
		xhr.onprogress = function() {
			var newText = xhr.responseText.substring(lastIdx);
			lastIdx = xhr.responseText.length;
			self._parseSSE(newText, msgEl);
		};

		xhr.onload = function() {
			self._isStreaming = false;
			self._sendBtn.disabled = false;
			self._sendBtn.textContent = '发送';
			if (!xhr.responseText) {
				if (msgEl && !msgEl.textContent) { msgEl.textContent = '[空响应]'; }
			}
			self._finalizeMessage(msgEl);
			self._scrollOutput();
		};

		xhr.onerror = function() {
			self._isStreaming = false;
			self._sendBtn.disabled = false;
			self._sendBtn.textContent = '发送';
			self._appendMessage('sys', '[直连失败: ' + url + '，请检查网络或 Base URL / API Key]');
		};

		xhr.send(body);
	},

	_proxyChat: function(data, msgEl) {
		var self = this;
		var xhr = new XMLHttpRequest();
		xhr.open('POST', this.API_URL, true);
		xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

		var parts = [];
		for (var k in data) {
			if (data[k] !== null && data[k] !== undefined) {
				parts.push(encodeURIComponent(k) + '=' + encodeURIComponent(data[k]));
			}
		}

		var lastIdx = 0;
		xhr.onprogress = function() {
			var newText = xhr.responseText.substring(lastIdx);
			lastIdx = xhr.responseText.length;
			self._parseSSE(newText, msgEl);
		};

		xhr.onload = function() {
			self._isStreaming = false;
			self._sendBtn.disabled = false;
			self._sendBtn.textContent = '发送';
			if (!xhr.responseText || xhr.responseText.indexOf('data:') === -1) {
				try {
					var r = JSON.parse(xhr.responseText);
					if (msgEl) { msgEl.textContent = r.text || r.RST || r.ERR || JSON.stringify(r); }
				} catch (e) {
					if (msgEl && xhr.responseText) { msgEl.textContent = xhr.responseText; }
				}
			}
			self._finalizeMessage(msgEl);
			self._scrollOutput();
		};

		xhr.onerror = function() {
			self._isStreaming = false;
			self._sendBtn.disabled = false;
			self._sendBtn.textContent = '发送';
			self._appendMessage('sys', '[后端请求失败，请检查网络]');
		};

		xhr.send(parts.join('&'));
	},

	_parseSSE: function(text, msgEl) {
		var lines = text.split('\n');
		for (var i = 0; i < lines.length; i++) {
			var line = lines[i];
			if (line.indexOf('data:') !== 0) { continue; }
			var chunk = line.substring(5).trim();
			if (chunk === '[DONE]') { continue; }
			try {
				var json = JSON.parse(chunk);
				if (json.text) {
					if (msgEl) { msgEl.textContent += json.text; }
				} else if (json.choices && json.choices[0] && json.choices[0].delta && json.choices[0].delta.content) {
					if (msgEl) { msgEl.textContent += json.choices[0].delta.content; }
				}
			} catch (e) {
				if (msgEl && chunk) { msgEl.textContent += chunk; }
			}
		}
		this._scrollOutput();
	},

	_scrollOutput: function() {
		var o = document.getElementById('ewa_ai_output');
		if (o) { o.scrollTop = o.scrollHeight; }
	},

	/**
	 * 将原始文本中的 ```code``` 替换为带操作按钮的代码块
	 */
	_finalizeMessage: function(msgEl) {
		if (!msgEl) { return; }
		var raw = (msgEl.textContent || '');
		if (raw.indexOf('```') === -1) {
			msgEl.innerHTML = '<span class="msg-label">AI</span><br><span class="msg-text md-body">' + this._mdRender(raw) + '</span>';
			return;
		}

		var self = this;
		var html = '';
		var parts = raw.split(/```(\w*)\n?/);
		var inCode = false, codeLang = '';

		for (var i = 0; i < parts.length; i++) {
			if (i % 2 === 0) {
				if (inCode) {
					var code = parts[i] || '';
					if (code.trim() || codeLang) {
						html += self._buildCodeBlockHTML(code, codeLang);
					}
					inCode = false;
					codeLang = '';
				} else {
					html += self._mdRender(parts[i]);
				}
			} else {
				inCode = true;
				codeLang = parts[i] || '';
			}
		}
		if (inCode) {
			var tailCode = parts[parts.length - 1] || '';
			if (tailCode.trim()) {
				html += self._buildCodeBlockHTML(tailCode, codeLang);
			}
		}

		msgEl.innerHTML = '<span class="msg-label">AI</span><br><span class="msg-text md-body">' + html + '</span>';
		this._bindCodeButtons(msgEl);
	},

	_buildCodeBlockHTML: function(code, lang) {
		var id = 'cb_' + Math.random().toString(36).substr(2, 8);
		var langDisplay = lang || 'code';
		return '<div class="ewa_ai_code_block">' +
			'<div class="ewa_ai_code_header">' +
			'<span>' + langDisplay + '</span>' +
			'<span class="cx_btns">' +
			'<button class="cb_copy" data-id="' + id + '">复制</button>' +
			'<button class="btn_apply" data-id="' + id + '">应用到编辑器</button>' +
			'</span></div>' +
			'<pre class="ewa_ai_code_pre" id="' + id + '">' + this._escapeHtml(code) + '</pre>' +
			'</div>';
	},

	_bindCodeButtons: function(container) {
		var self = this;
		var btns = container.querySelectorAll('.btn_apply');
		for (var i = 0; i < btns.length; i++) {
			(function(btn) {
				btn.onclick = function() {
					var id = btn.getAttribute('data-id');
					var preEl = document.getElementById(id);
					var code = preEl ? (preEl.textContent || '').trim() : '';
					if (!code) { return; }
					self._showDiff(self._lastOriginalCode || self.editor.getValue(), code, self._lastAction);
				};
			})(btns[i]);
		}
		var copyBtns = container.querySelectorAll('.cb_copy');
		for (var j = 0; j < copyBtns.length; j++) {
			(function(btn) {
				btn.onclick = function() {
					var id = btn.getAttribute('data-id');
					var preEl = document.getElementById(id);
					var code = preEl ? (preEl.textContent || '') : '';
					self._copyToClipboard(code);
					btn.textContent = '已复制';
					setTimeout(function() { btn.textContent = '复制'; }, 1500);
				};
			})(copyBtns[j]);
		}
	},

	_copyToClipboard: function(text) {
		var ta = document.createElement('textarea');
		ta.value = text;
		ta.style.position = 'fixed'; ta.style.left = '-9999px';
		document.body.appendChild(ta);
		ta.select();
		try { document.execCommand('copy'); } catch (e) {}
		document.body.removeChild(ta);
	},

	/* ======================== 对话入口 ======================== */

	chat: function(params) {
		var self = this;
		this._isStreaming = true;
		this._sendBtn.disabled = true;
		this._sendBtn.textContent = '...';

		var code = params.code || this.editor.getValue();
		this._lastOriginalCode = code;
		this._lastAction = params.action;

		if (!this.config.use_proxy) {
			this._appendMessage('ai', '');
			var msgEl = this._output.lastChild;
			var msgs = this._buildMessages(params.prompt, code);
			this._directChat(msgs, msgEl);
		} else {
			var data = {
				TYPE: 'AI',
				prompt: params.prompt,
				action: params.action || 'CHAT',
				code: code,
				selection: this.editor.getSelectedText(),
				mode: this.editor.session.getMode().$id,
				provider: this.config.provider,
				model: this.config.model,
				api_key: this.config.api_key,
				base_url: this.config.base_url
			};
			this._appendMessage('ai', '');
			var msgEl2 = this._output.lastChild;
			this._proxyChat(data, msgEl2);
		}
	},

	/* ======================== 消息输出 ======================== */

	_appendMessage: function(role, text) {
		var d = document.createElement('div');
		d.className = 'msg-' + role;
		var label = role === 'user' ? 'You' : (role === 'sys' ? 'System' : 'AI');
		var body = (role === 'ai') ? this._escapeHtml(text) : this._mdRender(text);
		d.innerHTML = '<span class="msg-label">' + label + '</span><br><span class="msg-text md-body">' + body + '</span>';
		this._output.appendChild(d);
		this._output.scrollTop = this._output.scrollHeight;
	},

	_escapeHtml: function(s) {
		if (!s) { return ''; }
		return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
	}
};
