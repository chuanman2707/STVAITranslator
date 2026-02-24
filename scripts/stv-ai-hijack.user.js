// ==UserScript==
// @name         STV AI Translate
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Hijack story text and translate with your own AI endpoint
// @author       BinHan
// @match        *://sangtacviet.com/*
// @match        *://sangtacvietcdn.xyz/*
// @match        *://*.sangtacviet.com/*
// @match        *://14.225.254.182/*
// @include      https://14.225.254.182/*
// @include      http://14.225.254.182/*
// @include      *sangtacviet*
// @run-at       document-idle
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @connect      localhost
// @connect      14.225.254.182
// @connect      generativelanguage.googleapis.com
// @connect      *
// ==/UserScript==

(function () {
    'use strict';

    // ==========================================
    // CONFIGURATION STORAGE
    // ==========================================
    const DEFAULT_CONFIG = {
        endpointUrl: 'http://localhost:8317/v1/chat/completions',
        apiKey: '',
        modelName: 'gemini/gemini-3.0-flash',
        systemPrompt: 'Bạn là một dịch giả chuyên nghiệp đam mê truyện kiếm hiệp, tiên hiệp. Hãy dịch đoạn văn bản tiếng Trung sau sang tiếng Việt. Văn phong mượt mà, đậm chất kiếm hiệp/tiên hiệp (sử dụng từ Hán Việt hợp lý như: huynh đệ, tại hạ, bảo bối, linh lực...). Tuyệt đối KHÔNG dịch theo nghĩa phụ, KHÔNG giải thích, KHÔNG thêm bớt nội dung, CHỈ trả về đoạn text đã dịch hoàn chỉnh.'
    };

    function getConfig() {
        return {
            endpointUrl: GM_getValue('stv_ai_endpoint', DEFAULT_CONFIG.endpointUrl),
            apiKey: GM_getValue('stv_ai_apikey', DEFAULT_CONFIG.apiKey),
            modelName: GM_getValue('stv_ai_model', DEFAULT_CONFIG.modelName),
            systemPrompt: GM_getValue('stv_ai_prompt', DEFAULT_CONFIG.systemPrompt)
        };
    }

    function saveConfig(config) {
        GM_setValue('stv_ai_endpoint', config.endpointUrl);
        GM_setValue('stv_ai_apikey', config.apiKey);
        GM_setValue('stv_ai_model', config.modelName);
        GM_setValue('stv_ai_prompt', config.systemPrompt);
        alert('Đã lưu cấu hình thành công!');
    }

    // ==========================================
    // 1. DOM SCRAPING METHOD
    // ==========================================
    function getRawChineseText() {
        // The first .contentbox on the page is actually a hidden placeholder.
        // The safest way is to just grab all <i> tags with a 't' attribute globally.
        const allITags = document.querySelectorAll('i[t]');

        if (allITags.length === 0) {
            console.error('[STV AI] Could not find any i[t] tags on the page.');
            return null;
        }

        const rawChinese = Array.from(allITags)
            .map(el => el.getAttribute('t'))
            .filter(text => text !== null && text.trim() !== '')
            .join('');

        return rawChinese;
    }

    // ==========================================
    // 2. TRANSLATION LOGIC
    // ==========================================
    function translateWithCLIProxy(text, btnElement) {
        if (!text) {
            console.error('[STV AI] No text to translate.');
            return;
        }

        const config = getConfig();
        if (!config.endpointUrl || !config.modelName) {
            alert('Vui lòng thiết lập Endpoint và Model Name trong phần Cấu hình AI!');
            if (btnElement) { btnElement.innerText = '🤖 Dịch bằng AI'; btnElement.disabled = false; }
            return;
        }

        console.log('[STV AI] Beginning translation of length: ' + text.length);

        const headers = { 'Content-Type': 'application/json' };
        if (config.apiKey) {
            headers['Authorization'] = 'Bearer ' + config.apiKey;
        }

        GM_xmlhttpRequest({
            method: 'POST',
            url: config.endpointUrl,
            headers: headers,
            data: JSON.stringify({
                model: config.modelName,
                messages: [
                    { role: 'system', content: config.systemPrompt },
                    { role: 'user', content: text }
                ],
                stream: false
            }),
            onload: function (response) {
                if (response.status >= 200 && response.status < 300) {
                    try {
                        const json = JSON.parse(response.responseText);
                        const translatedText = json.choices[0].message.content;
                        console.log('[STV AI] Translation received!');
                        injectTranslation(translatedText);
                        if (btnElement) {
                            btnElement.innerText = 'Dịch xong!';
                            setTimeout(() => { btnElement.innerText = '🤖 Dịch bằng AI'; btnElement.disabled = false; }, 3000);
                        }
                    } catch (e) {
                        console.error('[STV AI] Error parsing JSON response', e);
                        if (btnElement) { btnElement.innerText = 'Lỗi JS!'; btnElement.disabled = false; }
                    }
                } else {
                    console.error('[STV AI] Proxy returned status: ' + response.status, response.responseText);
                    let errorMsg = 'Lỗi API!';
                    try {
                        const errJson = JSON.parse(response.responseText);
                        if (errJson.error && errJson.error.message) errorMsg = errJson.error.message;
                    } catch (e) { }
                    if (btnElement) {
                        btnElement.innerText = errorMsg.substring(0, 15) + '...';
                        setTimeout(() => { btnElement.innerText = '🤖 Dịch bằng AI'; btnElement.disabled = false; }, 4000);
                    }
                    alert('Lỗi khi gọi API:\\n' + response.responseText);
                }
            },
            onerror: function (err) {
                console.error('[STV AI] Network error when calling proxy', err);
                if (btnElement) { btnElement.innerText = 'Lỗi Mạng!'; btnElement.disabled = false; }
            }
        });
    }

    // ==========================================
    // 3. INJECT TO DOM
    // ==========================================
    function injectTranslation(translatedText) {
        // ... logic
        const contentContainers = document.querySelectorAll('.contentbox[id]');
        if (contentContainers.length > 0) {
            const container = contentContainers[0];
            const formattedHTML = translatedText
                .split('\\n')
                .filter(p => p.trim() !== '')
                .map(p => `<p>${p}</p>`)
                .join('');

            container.innerHTML = `<div style="color: #4CAF50; font-style: italic; margin-bottom: 20px;">[Đã dịch bởi STV AI Script]</div>` + formattedHTML;
        } else {
            console.error('[STV AI] Unable to find content container to inject text. Check the selector.');
        }
    }

    // ==========================================
    // 4. UI CONTROLS
    // ==========================================
    function createSettingsModal() {
        const modalId = 'stv-ai-settings-modal';
        if (document.getElementById(modalId)) return;

        const config = getConfig();

        const modalHtml = `
            <div id="${modalId}" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); z-index:2147483647; display:flex; justify-content:center; align-items:center; font-family:sans-serif;">
                <div style="background:#fff; padding:25px; border-radius:12px; width:450px; max-width:90%; box-shadow:0 10px 25px rgba(0,0,0,0.2);">
                    <h2 style="margin-top:0; color:#333; font-size:20px; border-bottom:1px solid #eee; padding-bottom:10px;">⚙️ Cấu hình AI Dịch Truyện</h2>
                    
                    <div style="margin-bottom:15px;">
                        <label style="display:block; margin-bottom:5px; font-weight:bold; color:#555; font-size:14px;">API Endpoint URL</label>
                        <input type="text" id="stv-setting-endpoint" value="${config.endpointUrl}" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px; box-sizing:border-box;">
                    </div>

                    <div style="margin-bottom:15px;">
                        <label style="display:block; margin-bottom:5px; font-weight:bold; color:#555; font-size:14px;">API Key (Bearer Token)</label>
                        <input type="password" id="stv-setting-apikey" value="${config.apiKey}" placeholder="Nhập API Key nếu cần..." style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px; box-sizing:border-box;">
                    </div>

                    <div style="margin-bottom:15px;">
                        <label style="display:block; margin-bottom:5px; font-weight:bold; color:#555; font-size:14px;">Model Name</label>
                        <input type="text" id="stv-setting-model" value="${config.modelName}" placeholder="Vd: gemini/gemini-1.5-flash" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px; box-sizing:border-box;">
                    </div>

                    <div style="margin-bottom:20px;">
                        <label style="display:block; margin-bottom:5px; font-weight:bold; color:#555; font-size:14px;">System Prompt (Văn phong)</label>
                        <textarea id="stv-setting-prompt" style="width:100%; height:100px; padding:8px; border:1px solid #ccc; border-radius:4px; box-sizing:border-box; resize:vertical;">${config.systemPrompt}</textarea>
                    </div>

                    <div style="display:flex; justify-content:flex-end; gap:10px;">
                        <button id="stv-setting-close" style="padding:8px 15px; border:none; background:#eee; color:#333; border-radius:4px; cursor:pointer; font-weight:bold;">Đóng</button>
                        <button id="stv-setting-save" style="padding:8px 15px; border:none; background:#4CAF50; color:white; border-radius:4px; cursor:pointer; font-weight:bold;">Lưu Cấu Hình</button>
                    </div>
                </div>
            </div>
        `;

        const div = document.createElement('div');
        div.innerHTML = modalHtml;
        document.body.appendChild(div);

        document.getElementById('stv-setting-close').onclick = () => div.remove();
        document.getElementById('stv-setting-save').onclick = () => {
            saveConfig({
                endpointUrl: document.getElementById('stv-setting-endpoint').value.trim(),
                apiKey: document.getElementById('stv-setting-apikey').value.trim(),
                modelName: document.getElementById('stv-setting-model').value.trim(),
                systemPrompt: document.getElementById('stv-setting-prompt').value.trim()
            });
            div.remove();
        };
    }

    function addUIControls() {
        // Container for buttons to keep them together
        const btnContainer = document.createElement('div');
        btnContainer.style.cssText = `
            position: fixed !important;
            bottom: 20px !important;
            right: 20px !important;
            z-index: 2147483647 !important;
            display: flex !important;
            gap: 10px !important;
            align-items: center !important;
            opacity: 1 !important;
            visibility: visible !important;
        `;

        // Setting Button
        const settingBtn = document.createElement('button');
        settingBtn.innerText = '⚙️';
        settingBtn.title = 'Cấu hình AI';
        settingBtn.style.cssText = `
            padding: 10px !important;
            background: #fff !important;
            color: #333 !important;
            border: 1px solid #ccc !important;
            border-radius: 50% !important;
            font-size: 16px !important;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1) !important;
            cursor: pointer !important;
            transition: all 0.2s ease !important;
            width: 44px !important;
            height: 44px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            opacity: 1 !important;
            visibility: visible !important;
        `;
        settingBtn.onmouseover = () => settingBtn.style.transform = 'scale(1.1)';
        settingBtn.onmouseout = () => settingBtn.style.transform = 'scale(1)';
        settingBtn.onclick = createSettingsModal;

        // Translate Button
        const translateBtn = document.createElement('button');
        translateBtn.innerText = '🤖 Dịch bằng AI';
        translateBtn.style.cssText = `
            padding: 12px 20px !important;
            background: linear-gradient(135deg, #FF6B6B, #C0392B) !important;
            color: white !important;
            border: none !important;
            border-radius: 8px !important;
            font-weight: bold !important;
            font-family: sans-serif !important;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3) !important;
            cursor: pointer !important;
            transition: all 0.3s ease !important;
            height: 44px !important;
            display: block !important;
            opacity: 1 !important;
            visibility: visible !important;
        `;

        translateBtn.onmouseover = () => translateBtn.style.transform = 'scale(1.05)';
        translateBtn.onmouseout = () => translateBtn.style.transform = 'scale(1)';

        translateBtn.onclick = () => {
            translateBtn.innerText = 'Đang bóc text...';
            translateBtn.disabled = true;
            try {
                const text = getRawChineseText();
                if (text) {
                    translateBtn.innerText = 'Đang gọi AI...';
                    translateWithCLIProxy(text, translateBtn);
                } else {
                    translateBtn.innerText = 'Lỗi: Không tìm thấy Text';
                    setTimeout(() => { translateBtn.innerText = '🤖 Dịch bằng AI'; translateBtn.disabled = false; }, 3000);
                }
            } catch (err) {
                console.error(err);
                translateBtn.innerText = 'Lỗi Bóc Text!';
                setTimeout(() => { translateBtn.innerText = '🤖 Dịch bằng AI'; translateBtn.disabled = false; }, 3000);
            }
        };

        btnContainer.appendChild(settingBtn);
        btnContainer.appendChild(translateBtn);

        // If body doesn't exist yet, append to html, else append to document element
        (document.body || document.documentElement).appendChild(btnContainer);
        console.log('[STV AI] UI Controls added to DOM.');
    }

    // Initialize - handle both cases: page already loaded OR still loading
    function init() {
        console.log('[STV AI] Script activated! readyState:', document.readyState);
        if (document.body) {
            addUIControls();
        } else {
            // If body doesn't exist yet, wait for DOMContentLoaded
            document.addEventListener('DOMContentLoaded', addUIControls);
        }
    }

    // Since @run-at is document-idle, the page should be ready
    // But add a small safety delay just in case
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(init, 500);
    } else {
        window.addEventListener('load', init);
    }

})();
