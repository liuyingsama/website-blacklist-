document.addEventListener('DOMContentLoaded', () => {
    const blacklistElement = document.getElementById('blacklist');

    // 从浏览器同步存储中获取黑名单和自定义标签
    chrome.storage.sync.get({ blacklist: [], starValues: {} }, (data) => {
        // 清空黑名单元素以避免示例行
        blacklistElement.innerHTML = '';
        data.blacklist.forEach((item, index) => {
            const listItem = document.createElement('tr');
            listItem.innerHTML = `
                <td><input type="checkbox" class="blacklist-checkbox" data-domain="${item.domain}"></td>
                <td>${item.siteName}</td>
                <td>${item.domain}</td>
                <td class="hate-level" data-index="${index}">
                    ${[1, 2, 3, 4, 5].map(star => `
                        <span class="star" data-value="${star}">${star <= (item.hateLevel || 1) ? '★' : '☆'}</span>
                    `).join('')}
                </td>
                <td><input type="text" class="reason-input" placeholder="拉黑他！因为 我讨厌他！" value="${item.reason || ''}" data-index="${index}"></td>
                <td class="show-reason"><input type="checkbox" class="reason-checkbox" data-index="${index}" ${item.showReason ? 'checked' : ''}></td>
                <td class="hidden-display-tag">${item.displayTag || '雷'}</td>
            `;
            blacklistElement.appendChild(listItem);
        });

        console.log("初始黑名单:", data.blacklist); // 调试输出

        // 读取并显示自定义标签
        const starValues = data.starValues;

        // 设置默认值
        document.getElementById('star1').value = starValues.star1 || '雷';
        document.getElementById('star2').value = starValues.star2 || '很雷';
        document.getElementById('star3').value = starValues.star3 || '超级雷';
        document.getElementById('star4').value = starValues.star4 || '超级大雷';
        document.getElementById('star5').value = starValues.star5 || '宇宙终极雷';

        // 监听全选框的变化
        const selectAllCheckbox = document.getElementById('selectAllCheckbox');
        selectAllCheckbox.addEventListener('change', () => {
            const checkboxes = document.querySelectorAll('.blacklist-checkbox');
            checkboxes.forEach(checkbox => {
                checkbox.checked = selectAllCheckbox.checked; // 全选或全不选
            });
        });

        // 监听星级评分的点击事件
        document.querySelectorAll('.star').forEach(star => {
            star.addEventListener('click', () => {
                const index = star.parentElement.dataset.index;
                const hateLevel = parseInt(star.dataset.value);

                // 更新黑名单中的厌恶程度
                data.blacklist[index].hateLevel = hateLevel;

                // 更新 displayTag
                updateDisplayTag(data.blacklist[index], index, data.starValues);

                // 保存更新后的黑名单
                chrome.storage.sync.set({ blacklist: data.blacklist }, () => {
                    console.log("黑名单已保存:", data.blacklist); // 调试输出
                    // 更新星级显示
                    const stars = star.parentElement.querySelectorAll('.star');
                    stars.forEach(s => {
                        s.textContent = s.dataset.value <= hateLevel ? '★' : '☆';
                    });
                });
            });
        });

        // 监听输入框的变化
        document.querySelectorAll('.reason-input').forEach(input => {
            input.addEventListener('blur', () => {
                const index = input.dataset.index;
                const reason = input.value;

                // 更新黑名单中的原因
                data.blacklist[index].reason = reason;

                // 更新 displayTag
                updateDisplayTag(data.blacklist[index], index, data.starValues);

                // 保存更新后的黑名单
                chrome.storage.sync.set({ blacklist: data.blacklist }, () => {
                    console.log("拉黑原因已保存:", data.blacklist); // 调试输出
                });
            });
        });

        // 监听是否显示拉黑原因的变化
        document.querySelectorAll('.reason-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                const index = checkbox.dataset.index;
                const showReason = checkbox.checked;

                // 更新黑名单中的显示状态
                data.blacklist[index].showReason = showReason;

                // 更新 displayTag
                updateDisplayTag(data.blacklist[index], index, data.starValues);

                // 保存更新后的黑名单
                chrome.storage.sync.set({ blacklist: data.blacklist }, () => {
                    console.log("显示状态已保存:", data.blacklist); // 调试输出
                });
            });
        });

        // 自定义按钮点击事件
        document.getElementById('customizeButton').addEventListener('click', () => {
            const customizeSection = document.getElementById('customizeSection');
            customizeSection.style.display = customizeSection.style.display === 'none' ? 'block' : 'none'; // 切换显示状态
        });

        // 确认自定义标签按钮点击事件
        document.getElementById('confirmButton').addEventListener('click', () => {
            const star1 = document.getElementById('star1').value;
            const star2 = document.getElementById('star2').value;
            const star3 = document.getElementById('star3').value;
            const star4 = document.getElementById('star4').value;
            const star5 = document.getElementById('star5').value;

            // 更新 starValues
            chrome.storage.sync.set({
                starValues: {
                    star1,
                    star2,
                    star3,
                    star4,
                    star5
                }
            }, () => {
                // 关闭自定义部分
                document.getElementById('customizeSection').style.display = 'none';

                // 输出更新后的 starValues 到控制台
                console.log("自定义标签已更新:", {
                    star1,
                    star2,
                    star3,
                    star4,
                    star5
                });

                // 更新所有现有条目的 displayTag
                data.blacklist.forEach((item, index) => {
                    updateDisplayTag(item, index, {
                        star1,
                        star2,
                        star3,
                        star4,
                        star5
                    });
                });

                // 保存更新后的黑名单
                chrome.storage.sync.set({ blacklist: data.blacklist }, () => {
                    console.log("所有条目的 displayTag 已更新:", data.blacklist); // 调试输出
                });
            });
        });

        // 移除选中的网站
        document.getElementById('removeSelectedButton').addEventListener('click', () => {
            const checkboxes = document.querySelectorAll('.blacklist-checkbox:checked');
            const domainsToRemove = Array.from(checkboxes).map(checkbox => checkbox.dataset.domain);

            chrome.storage.sync.get({ blacklist: [] }, (data) => {
                const newBlacklist = data.blacklist.filter(item => !domainsToRemove.includes(item.domain));
                chrome.storage.sync.set({ blacklist: newBlacklist }, () => {
                    location.reload(); // 刷新页面以更新列表
                    console.log("移除后的黑名单:", newBlacklist); // 调试输出
                });
            });
        });

        // 导出选中网站的黑名单为 XML 格式
        document.getElementById('exportButton').addEventListener('click', () => {
            const checkboxes = document.querySelectorAll('.blacklist-checkbox:checked');
            const selectedItems = Array.from(checkboxes).map(checkbox => {
                const row = checkbox.closest('tr');
                return {
                    siteName: row.cells[1].textContent,
                    domain: row.cells[2].textContent,
                    hateLevel: Array.from(row.cells[3].querySelectorAll('.star')).filter(star => star.textContent === '★').length, // 获取正确的厌恶等级
                    reason: row.cells[4].querySelector('.reason-input').value,
                    showReason: row.cells[5].querySelector('.reason-checkbox').checked, // 获取是否显示拉黑原因
                    displayTag: row.cells[6].textContent // 获取 displayTag
                };
            });

            const xmlContent = `
                <blacklist>
                    ${selectedItems.map(item => `
                        <item>
                            <siteName>${item.siteName}</siteName>
                            <domain>${item.domain}</domain>
                            <hateLevel>${item.hateLevel}</hateLevel>
                            <reason>${item.reason}</reason>
                            <showReason>${item.showReason}</showReason>
                            <displayTag>${item.displayTag}</displayTag>
                        </item>
                    `).join('')}
                </blacklist>
                <starValues>
                    <star1>${data.starValues.star1 || '雷'}</star1>
                    <star2>${data.starValues.star2 || '很雷'}</star2>
                    <star3>${data.starValues.star3 || '超级雷'}</star3>
                    <star4>${data.starValues.star4 || '超级大雷'}</star4>
                    <star5>${data.starValues.star5 || '宇宙终极雷'}</star5>
                </starValues>
            `;

            const blob = new Blob([xmlContent], { type: 'application/xml' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'blacklist.xml';
            a.click();
            URL.revokeObjectURL(url);
        });

        // 导入黑名单功能
        document.getElementById('importButton').addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.xml';
            input.addEventListener('change', (event) => {
                const file = event.target.files[0];
                const reader = new FileReader();
                reader.onload = (e) => {
                    const parser = new DOMParser();
                    const xmlDoc = parser.parseFromString(e.target.result, 'application/xml');
                    const items = xmlDoc.getElementsByTagName('item');
                    const newBlacklist = [];

                    for (let i = 0; i < items.length; i++) {
                        const siteName = items[i].getElementsByTagName('siteName')[0].textContent;
                        const domain = items[i].getElementsByTagName('domain')[0].textContent;
                        const hateLevel = parseInt(items[i].getElementsByTagName('hateLevel')[0].textContent);
                        const reason = items[i].getElementsByTagName('reason')[0].textContent;
                        const showReason = items[i].getElementsByTagName('showReason')[0].textContent === 'true'; // 解析是否显示拉黑原因
                        const displayTag = items[i].getElementsByTagName('displayTag')[0]?.textContent || ''; // 读取 displayTag

                        newBlacklist.push({ siteName, domain, hateLevel, reason, showReason, displayTag }); // 确保这里包含所有字段
                    }

                    // 读取 starValues
                    const starValues = xmlDoc.getElementsByTagName('starValues')[0];
                    const newStarValues = {
                        star1: starValues.getElementsByTagName('star1')[0].textContent,
                        star2: starValues.getElementsByTagName('star2')[0].textContent,
                        star3: starValues.getElementsByTagName('star3')[0].textContent,
                        star4: starValues.getElementsByTagName('star4')[0].textContent,
                        star5: starValues.getElementsByTagName('star5')[0].textContent,
                    };

                    chrome.storage.sync.get({ blacklist: [] }, (data) => {
                        const updatedBlacklist = [...data.blacklist, ...newBlacklist];
                        chrome.storage.sync.set({ blacklist: updatedBlacklist, starValues: newStarValues }, () => {
                            console.log("黑名单导入成功！", updatedBlacklist); // 调试输出
                            location.reload(); // 刷新页面以更新列表
                            console.log("导入后的黑名单:", updatedBlacklist); // 调试输出
                        });
                    });
                };
                reader.readAsText(file);
            });
            input.click();
        });
    });

    // 更新 displayTag 的函数
    function updateDisplayTag(item, index, starValues) {
        const reasonInput = document.querySelector(`.reason-input[data-index="${index}"]`);
        const showReasonCheckbox = document.querySelector(`.reason-checkbox[data-index="${index}"]`);

        if (showReasonCheckbox.checked && reasonInput.value) {
            // 1. 如果 show-reason 为真，同时 reason-input 中有用户自定义原因
            item.displayTag = reasonInput.value; // 更新为用户自定义原因
        } else {
            // 2. 如果 show-reason 不为真，或 reason-input 中没有用户自定义原因
            if (item.hateLevel) {
                // 2.1 如果 hateLevel 评分改变，更新为对应的 starValues
                item.displayTag = starValues[`star${item.hateLevel}`] || '雷'; // 默认值为 '雷'
            }
        }
    }
});