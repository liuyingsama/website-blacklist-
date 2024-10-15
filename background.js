// background.js

// 监听浏览器启动事件
chrome.runtime.onStartup.addListener(() => {
    console.log("插件已启动");
});

// 监听浏览器安装事件
chrome.runtime.onInstalled.addListener(() => {
    console.log("插件已安装");
});

// 监听消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getBlacklist") {
        chrome.storage.sync.get({ blacklist: [] }, (data) => {
            sendResponse({ blacklist: data.blacklist });
        });
        return true; // 表示异步响应
    }
    if (request.action === "openCustomize") {
        // 打开自定义页面
        chrome.tabs.create({ url: 'customize.html' });
    }
    return true; // 表示异步响应
});
