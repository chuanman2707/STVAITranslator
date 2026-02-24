# Overview
The goal is to create a Tampermonkey userscript to hijack the client-side translation requests on `sangtacviet.com` (or similar story website). The script will intercept the translation triggers, prevent the original network request, route the text to a local proxy API (`CLIProxyAPI`), and inject the translated text back into the DOM.

# Project Type
**WEB** (Client-side Tampermonkey Script)

# Success Criteria
- Primary: The script overrides `fetch`/`XMLHttpRequest` to accurately intercept original translation payloads containing the source text.
- Fallback: If network override fails, the script uses DOM scraping to extract the source text.
- The original network requests to the site's backend (`/io/aitranslate2/passContext...`) are blocked to prevent quota usage and trace.
- The extracted text is sent to the user's custom local endpoint (`http://localhost:8317/v1/chat/completions`) using `GM_xmlhttpRequest` to bypass CORS.
- The translated response is injected back into the DOM seamlessly (waiting for the full translation before injecting).

# Tech Stack
- **Language:** JavaScript (Vanilla, ES6+)
- **Environment:** Tampermonkey (Browser Extension)
- **Techniques:** 
  - Overriding `window.fetch` and/or `XMLHttpRequest.prototype.open/send` to intercept requests.
  - DOM Scraping & querying as a fallback (`document.querySelectorAll`).
  - `GM_xmlhttpRequest` for cross-origin requests to local proxy.

# File Structure
```
STVTranslate/
├── scripts/
│   └── stv-ai-hijack.user.js   # The main Tampermonkey userscript file
```

# Task Breakdown
| Task ID | Name | Agent | Skills | Priority | Dependencies | Details (INPUT → OUTPUT → VERIFY) |
|---------|------|-------|--------|----------|--------------|--------------------------------|
| T1 | Implement Network Interceptor | `frontend-specialist` | `javascript-patterns` | P0 | None | **IN:** Browser's native `fetch` / `XHR`. **OUT:** Overridden network methods that catch requests to `14.225.254.182/io/aitranslate2`. **VERIFY:** Payload is parsed and text is extracted without firing the real network request; original function is called for other requests. |
| T2 | Implement DOM Scraper (Fallback) | `frontend-specialist` | `javascript-patterns` | P0 | None | **IN:** Story page DOM. **OUT:** Function that extracts text arrays from standard selectors if T1 fails. **VERIFY:** Returns correct story content when called manually. |
| T3 | CLIProxyAPI Integration | `backend-specialist` | `api-patterns` | P1 | T1, T2 | **IN:** Extracted text. **OUT:** A function utilizing `GM_xmlhttpRequest` to POST to `http://localhost:8317/v1/chat/completions`. **VERIFY:** Local proxy receives the OpenAI-format request and returns the translation. |
| T4 | Fake Response & DOM Injection | `frontend-specialist` | `frontend-design` | P1 | T3 | **IN:** Translated text from T3. **OUT:** 1. Return fake success response to original intercepted fetch/XHR. 2. Replace the source DOM text with the translated text (non-streaming). **VERIFY:** Page displays translated text without console errors from the web's own scripts. |
| T5 | Add UI Controls (Optional) | `frontend-specialist` | `frontend-design` | P2 | T4 | **IN:** Running script. **OUT:** Floating button for manual trigger (Fallback mode) and simple config saving (endpoint URL) via `GM_setValue`. **VERIFY:** Button appears and triggers the flow. |

# Phase X: Verification
- [ ] No purple/violet hex codes
- [ ] No standard template layouts
- [ ] Socratic Gate was respected
- [ ] Script installs in Tampermonkey.
- [ ] Primary Hook: Script successfully intercepts text via fetch/XHR API.
- [ ] Fallback Hook: DOM scraping accurately picks up text.
- [ ] Proxy Call: Successfully calls `CLIProxyAPI` at localhost:8317.
- [ ] Injection: Wait for full text and inject gracefully into DOM.
