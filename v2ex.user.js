// ==UserScript==
// @name         V2EX 链接新标签页打开
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  在 V2EX 网站上，所有链接都在新标签页中打开，不在当前页面跳转
// @author       You
// @match        *://www.v2ex.com/*
// @match        *://v2ex.com/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    // 处理页面上已有的链接
    function processLinks() {
        document.querySelectorAll('a[href]').forEach(function(link) {
            if (!link.getAttribute('target')) {
                link.setAttribute('target', '_blank');
                link.setAttribute('rel', 'noopener noreferrer');
            }
        });
    }

    // DOM 加载完成后处理已有链接
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', processLinks);
    } else {
        processLinks();
    }

    // 监听 DOM 变化，处理动态加载的链接
    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            mutation.addedNodes.forEach(function(node) {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    if (node.tagName === 'A' && node.getAttribute('href')) {
                        if (!node.getAttribute('target')) {
                            node.setAttribute('target', '_blank');
                            node.setAttribute('rel', 'noopener noreferrer');
                        }
                    }
                    // 处理子元素中的链接
                    node.querySelectorAll && node.querySelectorAll('a[href]').forEach(function(link) {
                        if (!link.getAttribute('target')) {
                            link.setAttribute('target', '_blank');
                            link.setAttribute('rel', 'noopener noreferrer');
                        }
                    });
                }
            });
        });
    });

    // 尽早开始观察
    if (document.documentElement) {
        observer.observe(document.documentElement, { childList: true, subtree: true });
    } else {
        document.addEventListener('DOMContentLoaded', function() {
            observer.observe(document.documentElement, { childList: true, subtree: true });
        });
    }

    // 兜底：拦截点击事件，确保即使有遗漏的链接也能在新标签页打开
    document.addEventListener('click', function(e) {
        var link = e.target.closest('a[href]');
        if (link && !link.getAttribute('target')) {
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
        }
    }, true);
})();
