# Whisp Features

> Empowering language to transform human words into action.

---

## Chrome Extension

The Whisp Chrome Extension adds an AI assistant side panel to any Chromium-based browser (Chrome, Edge, Brave, Opera, Vivaldi).

### Chat & Assistant

| Feature | Description |
|---------|-------------|
| **AI Chat** | Conversational interface with streaming responses, thinking visualization, and markdown rendering |
| **Multi-model support** | OpenAI, Anthropic Claude, Google Gemini, Azure OpenAI, Amazon Bedrock, OpenRouter, any OpenAI-compatible API |
| **Model failover** | Automatically tries backup models if the primary is unavailable |
| **File upload** | Attach images, PDFs, DOCX, XLSX, TXT, MD, JSON files as context for the AI |
| **Web search** | Real-time web search via Exa AI integration |
| **Webpage QA** | Ask questions about the current browser tab's content |
| **Copy response** | One-click copy of AI responses to clipboard |
| **Regenerate** | Quickly re-send the last user prompt to get a new response |
| **Token usage** | Footer shows cumulative prompt/completion token counts per session |
| **Keyboard shortcut** | `Ctrl+Enter` (or `Cmd+Enter`) to send messages |
| **Message history** | Session management with history stored in IndexedDB |

### Multi-Agent Planning

| Feature | Description |
|---------|-------------|
| **Workflow generation** | Natural language task decomposed into an XML-based multi-agent workflow |
| **Parallel execution** | Agents run in parallel when dependencies allow (via `dependsOn` attribute) |
| **Sequential execution** | Agents run in order when explicit dependencies exist |
| **Dynamic replanning** | "Expert" mode checks mid-execution whether the remaining plan is optimal and replans if needed |
| **Human-in-the-loop** | Agents can pause to request user confirmation, text input, option selection, or assistance (login, captcha, etc.) |
| **Streaming visualization** | Real-time UI updates for agent thoughts, tool calls, results, and execution status |
| **Workflow confirmation** | Review and approve/cancel the generated plan before execution |

### Tools & Automation

| Feature | Description |
|---------|-------------|
| **Browser automation** | Navigate, click, type, scroll, hover, select elements via Chrome DevTools Protocol with DOM fallback |
| **Visual DOM labeling** | Interactive elements labeled with numbered bounding boxes on screenshots for precise targeting |
| **Screenshot capture** | Full-page and viewport screenshots with optional element highlighting |
| **Tab management** | Query open tabs, switch tabs, extract page content |
| **File writing** | Save generated content (code, docs, etc.) via `chrome.downloads.download` |
| **MCP (Model Context Protocol)** | SSE and HTTP client implementations for dynamic tool discovery from MCP servers |
| **A2A (Agent-to-Agent)** | Google's Agent-to-Agent protocol integration for external agent discovery |
| **Foreach loops** | Iterate over items in a workflow task |
| **Watch triggers** | DOM/watch event triggers for reactive automation |

### Memory & Context

| Feature | Description |
|---------|-------------|
| **Conversation memory** | Automatic token estimation and capacity management |
| **Message compression** | Long text and tool results are automatically compressed |
| **Context management** | Discontinuity fixing ensures clean conversation flow |
| **Session persistence** | All conversations saved to IndexedDB via `idb` wrapper |

### UI & Experience

| Feature | Description |
|---------|-------------|
| **Theme-aware** | Adapts to Chrome's light/dark mode via `chrome.themeColors` API (Material Design 3 colors) |
| **Side panel** | Persistent side panel with separate icon in the toolbar |
| **Session history** | Browse, select, and delete past conversations via modal |
| **Tab mentions** | Type `@` in the input to reference open browser tabs by title/URL |
| **Suggestion chips** | Quick-start suggestions: Summarize page, Draft email, Explain code, Research topic |
| **Settings page** | Configure provider, model, API key, base URL, web search, and theme mode |
| **Smooth animations** | Fade-in message entry, hover-reveal action buttons, streaming cursor blink |
| **Model indicator** | Current model name displayed in the header |
| **Empty state** | Clean start screen with helpful suggestion chips |

### Architect & Developer Features

| Feature | Description |
|---------|-------------|
| **Configurable modes** | `fast` (no screenshots), `normal`, `expert` (with replanning) |
| **Custom prompts** | Template-based prompt system with conditional blocks and variable substitution |
| **Service interfaces** | Pluggable `ChatService`, `BrowserService`, `ExaSearchService` abstractions |
| **Extensible agents** | Add new capabilities by extending the `Agent` class or implementing `Tool` |
| **Retry language model** | Multi-provider, multi-model with configurable timeouts and failover |
| **Streaming API** | Real-time callbacks for text, thinking, tool calls, workflow progress, and agent execution |
| **Message converter** | Converts backend message format to UI-friendly chat message format |
| **Tool name mapping** | User-friendly display names for internal tool names |

---

## Full Whisp Browser

The full Whisp Browser is a **customized Chromium build** with the AI assistant compiled in as a component extension.

### Everything from the Chrome Extension, plus:

### Built-in Integration

| Feature | Description |
|---------|-------------|
| **Component extension** | The Whisp Assistant ships as a built-in component extension — loads at startup, cannot be uninstalled |
| **Auto-pinned toolbar** | Assistant button is permanently pinned to the browser toolbar on first run |
| **Side panel** | Dedicated side panel entry (400px wide) with no corner rounding for flush integration |
| **Custom toolbar button** | Themed icon with Material Design 3 styling, rounded corners, and hover states |
| **Extension ID** | `cbjnlnglpbmhbeekoalifpaallpcmelp` |

### Theme Colors API

| Feature | Description |
|---------|-------------|
| **`chrome.themeColors.get()`** | Retrieve 150+ Material Design 3 color tokens (primary, secondary, surface, error palettes) |
| **`chrome.themeColors.onChanged`** | Listen for light/dark mode switches and update UI in real time |
| **No permissions required** | Unprivileged API — no manifest permission needed |
| **CSS variable mapping** | Map theme colors to CSS custom properties for seamless integration |

### Chromium Modifications (20 files, +252 lines)

| Area | Files | Changes |
|------|-------|---------|
| Extension system | 4 | Component loader, allowlist, constants, manifest resource |
| Resource management | 2 | 80+ extension assets embedded as BINDATA |
| Toolbar integration | 5 | Auto-pin preference, button creation, click handler |
| Button styling | 2 | Themed icon, rounded corners, hover states |
| Side panel | 5 | Entry registration, WebView creation, header icon, display logic |
| Panel behavior | 2 | Pinning controller, corner rounding override |

### Resource Embedding

| Resource | Count |
|----------|-------|
| Extension files (JS, HTML, icons) | 13 |
| KaTeX font files (TTF + WOFF + WOFF2) | 72 |
| Toolbar icons | Multiple sizes + theme variants |
| **Total embedded resources** | **85+** |

### Build & Packaging

| Platform | Package formats |
|----------|----------------|
| Linux | `.deb`, `.rpm`, `.AppImage` |
| macOS | `.app` bundle, `.dmg` installer |
| Windows | `.exe` (NSIS), `.msi` (WiX) |

### Performance

| Metric | Value |
|--------|-------|
| Extension memory footprint | ~3.5-4 MB fully loaded |
| Startup impact | < 50 ms |
| API call latency (`themeColors.get`) | < 1 ms |
| KaTeX font loading | Lazy — loads on first math expression |

### Security

| Feature | Detail |
|---------|--------|
| Component extension | Cannot be uninstalled or modified by users |
| BINDATA resources | Embedded in binary, integrity guaranteed by signature |
| Extension permissions | `tabs`, `activeTab`, `sidePanel`, `storage`, `scripting`, `host_permissions: <all_urls>` |
| Content Security Policy | `script-src 'self'; object-src 'self'` |
| Theme Colors API | Read-only, no user data exposure |

---

## Comparison

| Capability | Chrome Extension | Full Whisp Browser |
|------------|:----------------:|:------------------:|
| Install time | 2 minutes | 1-3 hours |
| Disk space | ~50 MB | 20 GB+ |
| Works in any Chrome | Yes | No |
| Auto-loads on startup | Manual pin | Built-in |
| Theme Colors API | Full | Full |
| Toolbar integration | Via extension pin | Deep Chromium integration |
| Cannot be uninstalled | No | Yes |
| Platform support | Linux, Windows, macOS | Linux, Windows, macOS |
| Package formats | `.zip` | `.deb`, `.rpm`, `.AppImage`, `.dmg`, `.exe`, `.msi` |
