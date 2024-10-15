document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed");

    // 检查元素是否存在
    const manageButton = document.getElementById('manageButton');
    console.log(manageButton); // 输出元素以检查是否存在

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentUrl = new URL(tabs[0].url);
        const domain = currentUrl.hostname; // 当前页面的域名

        // 获取一级域名
        const baseDomain = domain.split('.').slice(-2).join('.'); // 获取一级域名

        chrome.storage.sync.get(['blacklist'], (data) => {
            // 确保 blacklist 存在
            const blacklist = data.blacklist || [];
            const isBlacklisted = blacklist.some(item => item.domain === baseDomain);

            if (isBlacklisted) {
                document.getElementById('modalMessage').innerHTML = "你已拉黑该网站，<br>是否移出黑名单？";
                document.getElementById('confirmButton').textContent = "移出";
            } else {
                document.getElementById('modalMessage').innerHTML = "要拉黑该网站吗？";
                document.getElementById('confirmButton').textContent = "拉黑";
            }

            document.getElementById('closeModalButton').textContent = "取消";
            document.getElementById('manageButton').textContent = "管理";

            document.getElementById('confirmButton').onclick = () => {
                if (isBlacklisted) {
                    removeFromBlacklist(baseDomain);
                } else {
                    // 获取一级域名的官方名称
                    fetch(`https://${baseDomain}`)
                        .then(response => response.text())
                        .then(html => {
                            const parser = new DOMParser();
                            const doc = parser.parseFromString(html, 'text/html');
                            const siteName = doc.title || baseDomain; // 使用 title 或一级域名作为后备
                            addToBlacklist(baseDomain, siteName); // 使用一级域名的官方名称
                        })
                        .catch(error => {
                            addToBlacklist(baseDomain, baseDomain); // 如果失败，使用一级域名作为后备
                        });
                }
            };

            document.getElementById('closeModalButton').onclick = () => {
                window.close();
            };

            document.getElementById('manageButton').onclick = () => {
                // 打开黑名单管理页面
                chrome.tabs.create({ url: chrome.runtime.getURL('blacklist.html') });
                window.close();
            };
        });
    });
});

function addToBlacklist(domain, siteName) {
    chrome.storage.sync.get({ blacklist: [] }, (data) => {
        const newBlacklist = [...data.blacklist, { domain, siteName, hateLevel: 1, reason: '', showReason: false, displayTag: '雷' }]; // 添加所有字段
        chrome.storage.sync.set({ blacklist: newBlacklist }, () => {
            alert("已成功将该网站添加至黑名单，我讨厌你！");
            window.close();
        });
    });
}

function removeFromBlacklist(domain) {
    chrome.storage.sync.get({ blacklist: [] }, (data) => {
        const newBlacklist = data.blacklist.filter(item => item.domain !== domain);
        chrome.storage.sync.set({ blacklist: newBlacklist }, () => {
            alert("已成功移出黑名单，放他一马！");
            window.close();
        });
    });
}