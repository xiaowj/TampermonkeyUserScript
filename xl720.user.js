// ==UserScript==
// @name         XL720 磁力链接汇总
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  在 xl720.com / btdx8.net 下载页面汇总所有磁力链接，提供一键复制功能
// @author       wuyifei02
// @match        https://www.xl720.com/thunder/*.html
// @match        https://www.btdx8.net/torrent/*.html
// @grant        GM_setClipboard
// @grant        GM_addStyle
// ==/UserScript==

(function () {
    'use strict';

    // 提取页面中所有不重复的磁力链接
    function collectMagnets() {
        const links = document.querySelectorAll('a[href^="magnet:"]');
        const magnetSet = new Set();
        const magnets = [];

        links.forEach(link => {
            const href = link.getAttribute('href');
            if (!magnetSet.has(href)) {
                magnetSet.add(href);
                // 尝试从链接文本或 title 中提取文件名
                const text = link.textContent.trim() || link.getAttribute('title') || '';
                const name = text.replace(/磁力下载|迅雷下载/g, '').replace(/\.torrent$/i, '').trim();
                magnets.push({ name, url: href });
            }
        });

        return magnets;
    }

    // 获取页面标题（剧名）
    function getTitle() {
        const h1 = document.querySelector('h1');
        if (h1) {
            return h1.textContent.trim();
        }
        return document.title.split(' ')[0] || '磁力链接汇总';
    }

    // 创建浮动面板
    function createPanel(magnets) {
        const title = getTitle();

        const panel = document.createElement('div');
        panel.id = 'magnet-collector-panel';
        panel.innerHTML = `
            <div class="mc-header">
                <span class="mc-title">🧲 磁力汇总 (${magnets.length}条)</span>
                <div class="mc-actions">
                    <button id="mc-copy-all" title="复制全部磁力链接">📋 复制全部</button>
                    <button id="mc-toggle" title="收起/展开">▼</button>
                    <button id="mc-close" title="关闭面板">✕</button>
                </div>
            </div>
            <div class="mc-body">
                <div class="mc-subtitle">${title}</div>
                <div class="mc-list">
                    ${magnets.map((m, i) => `
                        <div class="mc-item">
                            <span class="mc-index">${String(i + 1).padStart(2, '0')}</span>
                            <span class="mc-name">${m.name || '第' + (i + 1) + '集'}</span>
                            <button class="mc-copy-btn" data-url="${m.url}" title="复制此条">📋</button>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="mc-toast" id="mc-toast">已复制到剪贴板!</div>
        `;

        document.body.appendChild(panel);

        // 事件绑定
        document.getElementById('mc-copy-all').addEventListener('click', () => {
            const allLinks = magnets.map(m => m.url).join('\n');
            GM_setClipboard(allLinks, 'text');
            showToast('已复制全部 ' + magnets.length + ' 条磁力链接!');
        });

        document.getElementById('mc-toggle').addEventListener('click', function () {
            const body = panel.querySelector('.mc-body');
            if (body.style.display === 'none') {
                body.style.display = 'block';
                this.textContent = '▼';
            } else {
                body.style.display = 'none';
                this.textContent = '▶';
            }
        });

        document.getElementById('mc-close').addEventListener('click', () => {
            panel.style.display = 'none';
        });

        panel.querySelectorAll('.mc-copy-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                const url = this.getAttribute('data-url');
                GM_setClipboard(url, 'text');
                showToast('已复制!');
            });
        });
    }

    function showToast(msg) {
        const toast = document.getElementById('mc-toast');
        toast.textContent = msg;
        toast.classList.add('mc-show');
        setTimeout(() => toast.classList.remove('mc-show'), 2000);
    }

    // 注入样式
    GM_addStyle(`
        #magnet-collector-panel {
            position: fixed;
            top: 80px;
            right: 20px;
            width: 380px;
            max-height: 80vh;
            background: #1a1a2e;
            border: 1px solid #16213e;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
            z-index: 99999;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            color: #eee;
            overflow: hidden;
        }
        .mc-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 16px;
            background: #16213e;
            border-bottom: 1px solid #0f3460;
        }
        .mc-title {
            font-size: 14px;
            font-weight: 600;
        }
        .mc-actions {
            display: flex;
            gap: 6px;
        }
        .mc-actions button {
            background: #0f3460;
            border: none;
            color: #eee;
            padding: 4px 10px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 12px;
            transition: background 0.2s;
        }
        .mc-actions button:hover {
            background: #533483;
        }
        .mc-body {
            max-height: 60vh;
            overflow-y: auto;
            padding: 12px 16px;
        }
        .mc-subtitle {
            font-size: 12px;
            color: #aaa;
            margin-bottom: 10px;
            padding-bottom: 8px;
            border-bottom: 1px solid #2a2a4a;
        }
        .mc-list {
            display: flex;
            flex-direction: column;
            gap: 6px;
        }
        .mc-item {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 10px;
            background: #0f3460;
            border-radius: 8px;
            transition: background 0.2s;
        }
        .mc-item:hover {
            background: #533483;
        }
        .mc-index {
            font-size: 11px;
            color: #888;
            min-width: 20px;
        }
        .mc-name {
            flex: 1;
            font-size: 13px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .mc-copy-btn {
            background: transparent;
            border: 1px solid #444;
            color: #eee;
            padding: 3px 8px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 11px;
            transition: all 0.2s;
        }
        .mc-copy-btn:hover {
            background: #e94560;
            border-color: #e94560;
        }
        .mc-toast {
            position: absolute;
            bottom: 16px;
            left: 50%;
            transform: translateX(-50%) translateY(20px);
            background: #e94560;
            color: #fff;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 12px;
            opacity: 0;
            transition: all 0.3s;
            pointer-events: none;
        }
        .mc-toast.mc-show {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
        .mc-body::-webkit-scrollbar {
            width: 6px;
        }
        .mc-body::-webkit-scrollbar-track {
            background: transparent;
        }
        .mc-body::-webkit-scrollbar-thumb {
            background: #533483;
            border-radius: 3px;
        }
    `);

    // 主逻辑
    const magnets = collectMagnets();
    if (magnets.length > 0) {
        createPanel(magnets);
    }
})();
