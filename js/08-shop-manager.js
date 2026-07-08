//=====================買野===================
// 全域變數用嚟暫存邊個 item 準備緊交易
// 全域變數用嚟暫存邊個 item 準備緊交易
let pendingItemId = null;

function openBuyDialog(itemId) {
    pendingItemId = itemId;
    const item = DATA.items.specialItem[itemId] || DATA.items.equipment[itemId];
    
    document.getElementById('dialog-item-name').innerText = item.name;
    document.getElementById('dialog-item-price').innerText = item.price.toLocaleString();
    document.getElementById('buy-amount').value = 1;
    
    document.getElementById('buy-dialog').showModal();
}

function confirmPurchase() {
    const amount = parseInt(document.getElementById('buy-amount').value);
    
    // 防呆處理：確保數量係有效數字
    if (isNaN(amount) || amount <= 0) {
        alert("請輸入有效的數量！");
        return;
    }

    const itemId = pendingItemId;
    const item = DATA.items.specialItem[itemId] || DATA.items.equipment[itemId];
    const totalCost = item.price * amount;

    // 檢查錢夠唔夠
    if (player.gold < totalCost) {
        alert("銀兩不足，無法購買！");
        return;
    }

    // 執行扣錢
    player.gold -= totalCost;
    
    // 執行加入背包
    for(let i = 0; i < amount; i++) {
        addItemToInventory(itemId, 1);
    }

    document.getElementById('buy-dialog').close();
    
    // --- 這裡就是你要的成功提示 ---
    alert(`購買成功！\n\n物品：${item.name}\n數量：${amount}\n總共消費：${totalCost.toLocaleString()} 兩`);
    
    updateLeftMainCharacterAllUI(); // 更新畫面上嘅銀兩顯示
}



//==================== 商店UI=================


function renderGeishangTab(tabName, btnElement) {
    // 1. 處理按鈕 Active 狀態
    // 先移除所有按鈕的 active
    const tabs = document.querySelectorAll('.geishang-tab-btn');
    tabs.forEach(t => t.classList.remove('active'));
    // 再為當前按鈕加上 active
    btnElement.classList.add('active');

    // 2. 更改內容區域
    const contentArea = document.getElementById('geishang-shop-content');
    
    switch(tabName) {
case 'special':
contentArea.innerHTML = ''; 
    
console.log("當前全局 DATA:", typeof DATA !== 'undefined' ? DATA : "DATA 仍然未定義");
    
    const items = (typeof DATA !== 'undefined' && DATA.items) ? DATA.items.specialItem : null;
    
    if (!items) {
        contentArea.innerHTML = "<p>錯誤：找不到商城資料。</p>";
        console.error("DATA.items.specialItem 未定義！");
        return; // 這裡改成 return 更好，避免繼續執行
    }
    
    for (const [id, item] of Object.entries(items)) {
        const row = document.createElement('div');
        row.className = 'shop-item-row';
        row.innerHTML = `
            <div style="display: flex; align-items: center;">
                <img src="${item.icon}" style="width: 30px; height: 30px; margin-right: 10px;">
                <span class="item-name">${item.name}</span>
            </div>
            <div>
                <span class="item-price">${item.price.toLocaleString()} 兩</span>
		<button class="item-buy-btn" onclick="openBuyDialog('${id}')">購買</button>
            </div>
        `;
        contentArea.appendChild(row);
    }
    break;

        case 'spirit':
            contentArea.innerHTML = `
                <div class="shop-item-row">
                    <span class="item-name">精靈 (目前未開放)</span>
                    <span class="item-price">--</span>
                    <button class="item-buy-btn" disabled>敬請期待</button>
                </div>
            `;
            break;

        case 'gear':
             contentArea.innerHTML = `
                <div class="shop-item-row">
                    <span class="item-name">生鏽的鐵劍 (無你要既野呀望)</span>
                </div>
            `;
            break;
    }
}