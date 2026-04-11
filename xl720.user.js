// ==UserScript==
// @name         xl720 磁力链接汇总
// @namespace    https://www.xl720.com/
// @version      1.0.0
// @description  将 xl720.com 电视剧页面上所有磁力链接汇总展示，支持一键复制全部或单独复制
// @author       xiaowj
// @match        https://www.xl720.com/thunder/*.html
// @match        https://www.xl720.com/movie/*.html
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function () {
  'use strict';

  // ── 样式 ──────────────────────────────────────────────────────────────────
  const _style = document.createElement('style');
  _style.textContent = `
    #magnet-panel {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 420px;
      max-height: 70vh;
      background: #1a1a2e;
      color: #e0e0e0;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.5);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      font-size: 13px;
      z-index: 999999;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transition: all 0.3s ease;
    }
    #magnet-panel.collapsed {
      max-height: 48px;
    }
    #magnet-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      background: #16213e;
      cursor: move;
      user-select: none;
      flex-shrink: 0;
      border-bottom: 1px solid #0f3460;
    }
    #magnet-header .title {
      font-weight: 600;
      font-size: 14px;
      color: #e94560;
    }
    #magnet-header .count-badge {
      background: #e94560;
      color: #fff;
      border-radius: 10px;
      padding: 1px 8px;
      font-size: 11px;
      margin-left: 8px;
    }
    #magnet-header .header-btns {
      display: flex;
      gap: 6px;
    }
    #magnet-header button {
      background: none;
      border: 1px solid #0f3460;
      color: #a0a0c0;
      border-radius: 6px;
      padding: 2px 8px;
      cursor: pointer;
      font-size: 12px;
      transition: all 0.2s;
    }
    #magnet-header button:hover {
      background: #0f3460;
      color: #fff;
    }
    #magnet-toolbar {
      display: flex;
      gap: 8px;
      padding: 10px 16px;
      background: #16213e;
      flex-shrink: 0;
      flex-wrap: wrap;
    }
    #magnet-toolbar button {
      background: #0f3460;
      border: none;
      color: #e0e0e0;
      border-radius: 6px;
      padding: 5px 12px;
      cursor: pointer;
      font-size: 12px;
      transition: all 0.2s;
    }
    #magnet-toolbar button:hover {
      background: #e94560;
      color: #fff;
    }
    #magnet-search {
      flex: 1;
      min-width: 120px;
      background: #1a1a2e;
      border: 1px solid #0f3460;
      color: #e0e0e0;
      border-radius: 6px;
      padding: 4px 10px;
      font-size: 12px;
      outline: none;
    }
    #magnet-search:focus {
      border-color: #e94560;
    }
    #magnet-list {
      overflow-y: auto;
      flex: 1;
      padding: 8px 0;
    }
    #magnet-list::-webkit-scrollbar {
      width: 4px;
    }
    #magnet-list::-webkit-scrollbar-track {
      background: #1a1a2e;
    }
    #magnet-list::-webkit-scrollbar-thumb {
      background: #0f3460;
      border-radius: 2px;
    }
    .magnet-item {
      display: flex;
      align-items: center;
      padding: 6px 16px;
      gap: 8px;
      transition: background 0.15s;
    }
    .magnet-item:hover {
      background: #16213e;
    }
    .magnet-item .ep-label {
      flex-shrink: 0;
      width: 60px;
      color: #a0a0c0;
      font-size: 12px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .magnet-item .magnet-link {
      flex: 1;
      color: #4fc3f7;
      font-size: 11px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      cursor: pointer;
      text-decoration: none;
    }
    .magnet-item .magnet-link:hover {
      color: #e94560;
      text-decoration: underline;
    }
    .magnet-item .copy-btn {
      flex-shrink: 0;
      background: none;
      border: 1px solid #0f3460;
      color: #a0a0c0;
      border-radius: 4px;
      padding: 2px 6px;
      cursor: pointer;
      font-size: 11px;
      transition: all 0.2s;
    }
    .magnet-item .copy-btn:hover {
      background: #0f3460;
      color: #fff;
    }
    .magnet-item .copy-btn.copied {
      background: #2e7d32;
      border-color: #2e7d32;
      color: #fff;
    }
    #magnet-footer {
      padding: 8px 16px;
      background: #16213e;
      font-size: 11px;
      color: #606080;
      flex-shrink: 0;
      border-top: 1px solid #0f3460;
      text-align: center;
    }
    #magnet-toast {
      position: fixed;
      bottom: 100px;
      right: 20px;
      background: #2e7d32;
      color: #fff;
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 13px;
      z-index: 1000000;
      opacity: 0;
      transition: opacity 0.3s;
      pointer-events: none;
    }
    #magnet-toggle-btn {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #e94560;
      color: #fff;
      border: none;
      border-radius: 50%;
      width: 48px;
      height: 48px;
      font-size: 20px;
      cursor: pointer;
      z-index: 999998;
      box-shadow: 0 4px 16px rgba(233,69,96,0.5);
      display: none;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }
    #magnet-toggle-btn:hover {
      transform: scale(1.1);
    }
  `;
  document.head.appendChild(_style);

  // ── 收集磁力链接 ──────────────────────────────────────────────────────────
  function collectMagnets() {
    const seen = new Set();
    const results = [];

    // 优先从 #zdownload .download-link 结构提取（xl720 电视剧页面）
    const downloadLinks = document.querySelectorAll('#zdownload .download-link');
    if (downloadLinks.length > 0) {
      downloadLinks.forEach((div, idx) => {
        const a = div.querySelector('a[href^="magnet:"]');
        if (!a) return;
        const href = a.href;
        if (seen.has(href)) return;
        seen.add(href);
        const rawText = a.textContent.trim() || a.title || '';
        // 尝试从文件名中提取集数，如 "成何体统第1集.mp4.torrent"
        const epMatch = rawText.match(/第(\d+)集/) || rawText.match(/[Ee][Pp]?(\d+)/) || rawText.match(/(\d+)/);
        const epLabel = epMatch ? `第 ${parseInt(epMatch[1], 10)} 集` : `链接 ${idx + 1}`;
        results.push({ label: epLabel, href, name: rawText, sortKey: epMatch ? parseInt(epMatch[1], 10) : idx + 1 });
      });
    } else {
      // 通用回退：收集页面上所有磁力链接
      document.querySelectorAll('a[href^="magnet:"]').forEach((a, idx) => {
        const href = a.href;
        if (seen.has(href)) return;
        seen.add(href);
        const rawText = a.textContent.trim() || a.title || '';
        const epMatch = rawText.match(/第(\d+)集/) || rawText.match(/[Ee][Pp]?(\d+)/) || rawText.match(/(\d+)/);
        const epLabel = epMatch ? `第 ${parseInt(epMatch[1], 10)} 集` : `链接 ${idx + 1}`;
        results.push({ label: epLabel, href, name: rawText, sortKey: epMatch ? parseInt(epMatch[1], 10) : idx + 1 });
      });
    }

    // 按集数排序
    results.sort((a, b) => a.sortKey - b.sortKey);
    return results;
  }

  // ── Toast 提示 ────────────────────────────────────────────────────────────
  function showToast(msg) {
    const toast = document.getElementById('magnet-toast');
    toast.textContent = msg;
    toast.style.opacity = '1';
    setTimeout(() => { toast.style.opacity = '0'; }, 2000);
  }

  // ── 复制到剪贴板 ─────────────────────────────────────────────────────────
  function copyText(text, btn) {
    navigator.clipboard.writeText(text).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      document.execCommand('copy'); document.body.removeChild(ta);
    });
    if (btn) {
      const orig = btn.textContent;
      btn.textContent = '✓';
      btn.classList.add('copied');
      setTimeout(() => { btn.textContent = orig; btn.classList.remove('copied'); }, 1500);
    }
  }

  // ── 构建面板 ──────────────────────────────────────────────────────────────
  function buildPanel(magnets) {
    // Toast
    const toast = document.createElement('div');
    toast.id = 'magnet-toast';
    document.body.appendChild(toast);

    // 面板
    const panel = document.createElement('div');
    panel.id = 'magnet-panel';

    // 标题栏
    const header = document.createElement('div');
    header.id = 'magnet-header';
    header.innerHTML = `
      <div style="display:flex;align-items:center;gap:4px">
        <span class="title">🧲 磁力汇总</span>
        <span class="count-badge">${magnets.length} 集</span>
      </div>
      <div class="header-btns">
        <button id="magnet-collapse-btn">收起</button>
        <button id="magnet-close-btn">✕</button>
      </div>
    `;
    panel.appendChild(header);

    // 工具栏
    const toolbar = document.createElement('div');
    toolbar.id = 'magnet-toolbar';
    toolbar.innerHTML = `
      <button id="copy-all-btn">📋 复制全部</button>
      <button id="copy-hash-btn">🔑 仅复制 Hash</button>
      <input id="magnet-search" type="text" placeholder="搜索集数…" />
    `;
    panel.appendChild(toolbar);

    // 列表
    const list = document.createElement('div');
    list.id = 'magnet-list';

    function renderList(filter) {
      list.innerHTML = '';
      const filtered = filter
        ? magnets.filter(m => m.label.includes(filter) || m.name.includes(filter))
        : magnets;
      if (filtered.length === 0) {
        list.innerHTML = '<div style="padding:16px;color:#606080;text-align:center">无匹配结果</div>';
        return;
      }
      filtered.forEach(m => {
        const item = document.createElement('div');
        item.className = 'magnet-item';

        const label = document.createElement('span');
        label.className = 'ep-label';
        label.title = m.name;
        label.textContent = m.label;

        const link = document.createElement('a');
        link.className = 'magnet-link';
        link.href = m.href;
        link.title = m.href;
        // 只显示 hash 部分，更简洁
        const hashMatch = m.href.match(/btih:([a-fA-F0-9]+)/i);
        link.textContent = hashMatch ? `magnet:…${hashMatch[1].substring(0, 12)}…` : m.href.substring(0, 40) + '…';

        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-btn';
        copyBtn.textContent = '复制';
        copyBtn.addEventListener('click', () => copyText(m.href, copyBtn));

        item.appendChild(label);
        item.appendChild(link);
        item.appendChild(copyBtn);
        list.appendChild(item);
      });
    }

    renderList('');
    panel.appendChild(list);

    // 底部
    const footer = document.createElement('div');
    footer.id = 'magnet-footer';
    footer.textContent = `共 ${magnets.length} 条磁力链接 · xl720 磁力汇总脚本`;
    panel.appendChild(footer);

    document.body.appendChild(panel);

    // ── 事件绑定 ──────────────────────────────────────────────────────────
    // 搜索
    document.getElementById('magnet-search').addEventListener('input', function () {
      renderList(this.value.trim());
    });

    // 复制全部
    document.getElementById('copy-all-btn').addEventListener('click', () => {
      const text = magnets.map(m => m.href).join('\n');
      copyText(text);
      showToast(`✅ 已复制 ${magnets.length} 条磁力链接`);
    });

    // 仅复制 Hash
    document.getElementById('copy-hash-btn').addEventListener('click', () => {
      const hashes = magnets.map(m => {
        const match = m.href.match(/btih:([a-fA-F0-9]+)/i);
        return match ? match[1].toLowerCase() : m.href;
      }).join('\n');
      copyText(hashes);
      showToast(`✅ 已复制 ${magnets.length} 个 Hash`);
    });

    // 收起/展开
    let collapsed = false;
    document.getElementById('magnet-collapse-btn').addEventListener('click', () => {
      collapsed = !collapsed;
      panel.classList.toggle('collapsed', collapsed);
      document.getElementById('magnet-collapse-btn').textContent = collapsed ? '展开' : '收起';
    });

    // 关闭
    document.getElementById('magnet-close-btn').addEventListener('click', () => {
      panel.remove();
      toggleBtn.style.display = 'flex';
    });

    // ── 拖拽 ──────────────────────────────────────────────────────────────
    let isDragging = false, startX, startY, origRight, origBottom;
    header.addEventListener('mousedown', (e) => {
      if (e.target.tagName === 'BUTTON') return;
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      const rect = panel.getBoundingClientRect();
      origRight = window.innerWidth - rect.right;
      origBottom = window.innerHeight - rect.bottom;
      e.preventDefault();
    });
    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      panel.style.right = Math.max(0, origRight - dx) + 'px';
      panel.style.bottom = Math.max(0, origBottom - dy) + 'px';
    });
    document.addEventListener('mouseup', () => { isDragging = false; });
  }

  // ── 悬浮按钮（面板关闭后显示）────────────────────────────────────────────
  const toggleBtn = document.createElement('button');
  toggleBtn.id = 'magnet-toggle-btn';
  toggleBtn.title = '显示磁力汇总';
  toggleBtn.textContent = '🧲';
  toggleBtn.style.display = 'none';
  toggleBtn.addEventListener('click', () => {
    toggleBtn.style.display = 'none';
    buildPanel(magnets);
  });
  document.body.appendChild(toggleBtn);

  // ── 初始化 ────────────────────────────────────────────────────────────────
  const magnets = collectMagnets();
  if (magnets.length === 0) {
    console.log('[xl720 磁力汇总] 未找到磁力链接，脚本退出。');
    return;
  }

  buildPanel(magnets);
})();
