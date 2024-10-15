// 确认脚本运行
console.log('Content script is running');

// 获取所有链接
const links = document.querySelectorAll('a'); // 获取所有链接
console.log(`Found ${links.length} links on the page.`); // 输出找到的链接数量

// 检查 chrome.storage 中的 blacklist
chrome.storage.sync.get(['blacklist'], (result) => {
    const blacklist = result.blacklist || []; // 获取黑名单，默认为空数组
    console.log('Blacklist found:', blacklist); // 输出 blacklist 列表

    // 遍历每个链接并检查是否在黑名单中
    links.forEach(link => {
        const url = new URL(link.href); // 创建 URL 对象以获取域名
        const domain = url.hostname; // 获取域名

        // 检查黑名单中的一级域名是否在当前链接的域名中
        const blacklistedItem = blacklist.find(item => domain.endsWith(item.domain));
        
        if (blacklistedItem) {
            const warning = document.createElement('span'); // 创建一个新的<span>元素
            warning.textContent = ` ${blacklistedItem.displayTag}`; // 设置文本为对应的 displayTag
            warning.style.color = 'red'; // 设置文本颜色为红色
            warning.style.fontWeight = 'bold'; // 加粗文本
            warning.style.marginLeft = '5px'; // 设置左侧间距
            warning.style.fontSize = 'inherit'; // 继承父元素的字体大小

            // 将<span>元素添加到链接后面
            link.appendChild(warning);
            console.log('Warning added to link:', link.href); // 输出已添加警告的链接
        }
    });
});
