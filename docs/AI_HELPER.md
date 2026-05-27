# EWAC_AI_HELPER.js — AI 辅助编程模块

## 设计思路

在 Ace Editor 中嵌入 AI 编程助手，覆盖**写代码前、写代码中、写代码后**三个阶段的交互：

| 阶段 | 功能 | 触发方式 |
|---|---|---|
| 写前 | 代码生成 | ⚡ 工具栏「生成代码」或 `Ctrl+K` 面板输入描述 |
| 写中 | 内联补全 | 🖊 输入代码后停顿 0.6 秒，AI 自动追加到光标处 |
| 写中 | 选中悬浮 | 选中代码 → 光标旁弹出「解释/修复/续写/生成」 |
| 写后 | 对话交互 | `Ctrl+K` 打开 AI 面板，流式对话 + 代码块「应用到编辑器」 |

## 文件位置

```
EmpScriptV2/EWA_DEFINE/js/EWAC_AI_HELPER.js
```

## 依赖

- **Ace Editor** v1.44+（`ace.js`）
- **markdown-it**（可选，AI 对话渲染 Markdown）
- `EWA.CP` / `$JP` / `$Tip`（EWA 框架提供，独立页面不需要）

## 快速上手

### 1. 引入

```html
<script src="../../../third-party/ace/v1.44.0/src-min/ace.js"></script>
<script src="../../../third-party/ace/v1.44.0/src-min/ext-language_tools.js"></script>
<!-- markdown-it 可选，用于 AI 对话 Markdown 渲染 -->
<script src="../../../third-party/markdown-editor-master/markdown-it.js"></script>
<script src="../../js/EWAC_AI_HELPER.js"></script>
```

### 2. 初始化

```js
EWAC_AI_HELPER.init(editor, {
    apiUrl: EWA.CP + '/EWA_DEFINE/cgi-bin/xml/?type=AI'
});
```

### 3. 配置 AI 供应商

两种方式：

**方式 A — 设置面板（推荐）**

点击工具栏 ⚙ 按钮或面板内 ⚙ → 选择供应商/模型/Key/连接方式 → 保存。

**方式 B — 代码预设**

```js
EWAC_AI_HELPER.init(editor, {
    apiUrl: EWA.CP + '/EWA_DEFINE/cgi-bin/xml/?type=AI',
    provider: 'openai',
    model: 'gpt-4o-mini',
    apiKey: 'sk-...'
});
```

## 内置供应商

所有供应商均兼容 OpenAI `/v1/chat/completions` 格式：

| 供应商 | 默认模型 | 需要 Key | Base URL |
|---|---|---|---|
| OpenAI | `gpt-4o-mini` | ✓ | `https://api.openai.com/v1` |
| DeepSeek | `deepseek-chat` | ✓ | `https://api.deepseek.com/v1` |
| 通义千问 | `qwen-plus` | ✓ | `https://dashscope.aliyuncs.com/compatible-mode/v1` |
| Ollama (本地) | `qwen2.5` | ✗ | `http://localhost:11434/v1` |
| 智谱 GLM | `glm-4-flash` | ✓ | `https://open.bigmodel.cn/api/paas/v4` |
| 自定义 | 手动输入 | ✓ | 手动输入 |

## 连接方式

### 后端代理（默认）

```js
EWAC_AI_HELPER.config.use_proxy = true;
```

所有 AI 请求走 EWA 后端 `/EWA_DEFINE/cgi-bin/xml/?type=AI`，后端转发到真实 AI API。

请求参数：

| 参数 | 说明 |
|---|---|
| `TYPE=AI` | 固定值 |
| `prompt` | 用户提示词 |
| `code` | 编辑器代码 |
| `selection` | 选中代码 |
| `mode` | 编辑器语言模式 |
| `action` | COMPLETE / EXPLAIN / FIX / GENERATE / REVIEW / CHAT |
| `provider` | 供应商标识 |
| `model` | 模型名称 |
| `api_key` | API Key |
| `base_url` | 自定义 Base URL |

响应支持两种格式：
- SSE 流式：`data: {"text":"Hello"}\n\n`
- JSON 一次性：`{"text":"Hello"}` 或 `{"RST":true,...}`

### 浏览器直连

```js
EWAC_AI_HELPER.config.use_proxy = false;
```

直接从浏览器请求供应商 API，支持 SSE 流式。需配置 CORS（Ollama 本地无需）。

## 5 个快捷操作

| 操作 | 选中文字行为 | 无选中行为 |
|---|---|---|
| **补全代码** | 续写选中代码 | 续写光标前代码 |
| **解释代码** | 解释选中代码（需选中） | 提示先选中 |
| **修复错误** | 修复选中代码 → 替换选区 | 修复全文 |
| **生成代码** | 输入框描述，上下文含选中 | 输入框描述 |
| **代码审查** | 审查选中代码 | 审查全文 |

## UI 组成

```
┌─ AI 面板（右侧 450px 滑出）──────────┐
│  AI 助手                    ⚙ ×     │  ← ⚙ 打开供应商设置
│─────────────────────────────────────│
│  [设置面板]（折叠）                  │
│  供应商: [下拉]  模型: [下拉]       │
│  API Key: [****]  Base URL: [...]   │
│  连接方式: [代理/直连]              │
│─────────────────────────────────────│
│  You: 解释以下代码...              │  ← 对话区
│  AI: 这段代码的作用是...  ```       │  ← Markdown 渲染
│  ┌─ js ─── [复制] [应用到编辑器] ─┐ │
│  │ code...                        │ │  ← 代码块卡片
│  └────────────────────────────────┘ │
│─────────────────────────────────────│
│  [__________________________] [发送] │  ← 输入框
│─────────────────────────────────────│
│  [补全代码] [解释] [修复] [生成] [审查] │  ← 快捷按钮
└─────────────────────────────────────┘
```

## API 速查

```js
// 显隐面板
EWAC_AI_HELPER.show();
EWAC_AI_HELPER.hide();
EWAC_AI_HELPER.toggle();  // Ctrl+K 触发

// 执行操作
EWAC_AI_HELPER.runAction('FIX');      // 修复
EWAC_AI_HELPER.runAction('EXPLAIN');  // 解释
EWAC_AI_HELPER.runAction('COMPLETE'); // 补全
EWAC_AI_HELPER.runAction('GENERATE'); // 生成
EWAC_AI_HELPER.runAction('REVIEW');   // 审查

// 自定义对话
EWAC_AI_HELPER.chat({
    prompt: '帮我写一个排序函数',
    action: 'CHAT',
    code: EWAC_AI_HELPER.editor.getValue()
});

// 配置
EWAC_AI_HELPER.config.provider  = 'deepseek';
EWAC_AI_HELPER.config.model     = 'deepseek-chat';
EWAC_AI_HELPER.config.use_proxy = false;    // 直连
EWAC_AI_HELPER._saveConfig();              // 持久化
```

## 配置持久化

所有配置存储在 `localStorage.EWA_AI_CONFIG`：

```json
{
    "provider": "openai",
    "model": "gpt-4o-mini",
    "api_key": "sk-...",
    "base_url": "",
    "use_proxy": true
}
```

## 参考示例

完整 Demo 页面：`EWA_DEFINE/js/CodeMirror/ai_demo.html`
