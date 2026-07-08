// =================賣野======================
function sellItem(itemId) {
    const itemIndex = player.inventory.findIndex(i => i.id === itemId);
    
    if (itemIndex === -1) {
        console.error("搵唔到呢件嘢！");
        return;
    }

    const item = player.inventory[itemIndex];

    if (!item.price || item.price <= 0) {
        alert("呢件嘢賣唔到錢喎！");
        return;
    }

    // 處理交易
    player.gold += item.price;
    item.count--;
    updateLeftMainCharacterAllUI();
    
    // 如果數量歸 0 就直接移除
    if (item.count <= 0) {
        player.inventory.splice(itemIndex, 1);
    }
    
    // 關閉詳情並刷新
    closeDetail(); 
    
    // 刷新 UI
	
    if (typeof renderInventory === 'function') renderInventory();
    if (typeof updateStatsBar === 'function') updateStatsBar(); // 確保你有呢個函數用嚟顯示 Gold
}



// ============= 背包右邊角色資料=============
// 1. 開啟並渲染角色資訊
// 寫好呢個 function，每次你升咗 LV 或者換咗裝，就 call 呢個
// 徹底移除 window. 前綴
function updateStatsPanel(unit) {
    const content = document.getElementById('stats-content');
    
    // 檢查 content 是否存在，避免報錯
    if (!content) {
        console.error("找不到 stats-content 元素");
        return;
    }
    
    content.innerHTML = `
        <h3 style="color: #ffcc00; margin-top: 0;">${unit.name} 的狀態</h3>
        <div class="stat-row">等級: ${unit.lv}</div>
        <div class="stat-row">力量: ${unit.stats.str}</div>
        <div class="stat-row">敏捷: ${unit.stats.dex}</div>
        <div class="stat-row">體質: ${unit.stats.vit}</div>
        <div class="stat-row">智力: ${unit.stats.int}</div>
        <div class="stat-row">攻擊力: ${unit.stats.atk}</div>
        <div class="stat-row">防禦: ${unit.stats.def}</div>
        <div class="stat-row">物理抗性: ${unit.stats.physRes}</div>
        <div class="stat-row">魔法抗性: ${unit.stats.magRes}</div>
    `;
}


// ============== 背包右邊panel ===============
// 確保函數掛載到 window，咁邊度都呼叫到

function showItemDetail(item, p) {
    console.log("當前物品屬性:", item);
    const activePlayer = p || player;
    const playerLevel = activePlayer ? (activePlayer.level || 0) : 0;
    const isLevelEnough = (playerLevel >= (item.lv || 0));
    const levelColor = isLevelEnough ? "#ffffff" : "#ff4444"; 

    const equippableTypes = ['charm', 'head', 'glove', 'weapon', 'body', 'belt', 'ring1', 'boots', 'ring2'];
    
    // 檢查邏輯：如果 item.type 係陣列，睇下入面有無包含任何一個可裝備類型
    const isEquippable = Array.isArray(item.type) 
        ? item.type.some(t => equippableTypes.includes(t)) 
        : equippableTypes.includes(item.type);

    const detailPanel = document.getElementById('item-detail-panel');
    if (!detailPanel) return;
    
    detailPanel.style.display = 'block';
    
    // 生成裝備按鈕的 HTML
let equipButtonsHtml = '';
    if (isEquippable) {
        if (Array.isArray(item.type)) {
            // 如果係戒指陣列 ["ring1", "ring2"]，生成兩個裝備按鈕
            item.type.forEach(t => {
                // 修改位：保持原樣，因為戒指通常無技能
                equipButtonsHtml += `<button onclick="equipItemWithCurrent('${item.id}', '${t}')">裝備到 ${t}</button>`;
            });
        } else {
            // 【修改位】這裡改成這樣：傳入 slot 類型 (如果是 weapon 就會行 weapon 邏輯)
            // 為了讓 equipItemWithCurrent 知道係邊個位，我們傳入 item.type 作為 slot
            equipButtonsHtml = `<button onclick="equipItemWithCurrent('${item.id}', '${item.type}')">裝備</button>`;
        }
    }
    
    detailPanel.innerHTML = `
        <div style="display: flex; align-items: center; margin-bottom: 10px;">
            ${item.icon ? `<img src="${item.icon}" style="width: 48px; height: 48px; margin-right: 10px; border: 1px solid #555;">` : ''}
            <div class="item-name" style="color: #ffcc00; font-weight: bold; font-size: 16px;">${item.name}</div>
        </div>
        
        ${item.desc ? `<div style="font-size: 12px; color: #ccc; margin-bottom: 10px; font-style: italic;">${item.desc}</div>` : ''}

        <div class="item-stats">
            ${item.stats?.str ? `<div class="item-stat-line">力量 : ${item.stats.str}</div>` : ''}
            ${item.stats?.dex ? `<div class="item-stat-line">敏捷 : ${item.stats.dex}</div>` : ''}
            ${item.stats?.vit ? `<div class="item-stat-line">體質 : ${item.stats.vit}</div>` : ''}
            ${item.stats?.int ? `<div class="item-stat-line">智力 : ${item.stats.int}</div>` : ''}
            ${item.stats?.atk ? `<div class="item-stat-line">攻擊力 : ${item.stats.atk[0]}-${item.stats.atk[1]}</div>` : ''}
            ${item.stats?.def ? `<div class="item-stat-line">防禦 : ${item.stats.def}</div>` : ''}
            ${item.stats?.physRes ? `<div class="item-stat-line">物理抗性 : ${item.stats.physRes}</div>` : ''}
            ${item.stats?.magRes ? `<div class="item-stat-line">魔法抗性 : ${item.stats.magRes}</div>` : ''}
            ${item.stats?.critRate ? `<div class="item-stat-line">暴擊率 : ${item.stats.critRate}</div>` : ''}
            ${item.stats?.attributeValue ? `<div class="item-stat-line">屬性值 : ${item.stats.attributeValue}</div>` : ''}
        </div>
${item.skills && item.skills.length > 0 ? `
            <div class="item-skills" style="margin-top: 10px; border-top: 1px solid #444; padding-top: 5px;">
                <div style="font-size: 12px; color: #aaa; margin-bottom: 5px;">附帶技能:</div>
                ${item.skills.map(skillId => {
                    const skillData = DATA.skills ? DATA.skills[skillId] : null;
                    const skillName = skillData ? skillData.name : skillId;
                    return `<div style="font-size: 13px; color: #4af; margin-bottom: 2px;">• ${skillName}</div>`;
                }).join('')}
            </div>
        ` : ''}
        <div class="req-section" style="margin-top: 10px; border-top: 1px solid #444; padding-top: 5px;">
            <div style="font-size: 12px; color: #888;">-- 要求條件 --</div>
            <div style="color: ${levelColor}">等級 : ${item.lv || 0}</div>
            <div style="margin-top: 5px; color: #ffcc00; font-size: 13px;">賣出價值: ${item.price || 0} 金</div>
        </div>
        
        <div style="margin-top: 15px; display: flex; flex-wrap: wrap; gap: 5px;">
            ${equipButtonsHtml}
            
            ${item.type === 'special' ? `<button onclick="useItem(${JSON.stringify(item).replace(/"/g, '&quot;')})">使用</button>` : ''}
            
            <button class="action-btn" onclick="sellItem('${item.id}')" style="background-color: #8b4513;">出售</button>
            
            <button class="action-btn" onclick="closeDetail()">關閉</button>
        </div>
    `;
}

function closeDetail() {
    console.log("嘗試關閉視窗...");
    const detailPanel = document.getElementById('item-detail-panel');
    if (detailPanel) {
        detailPanel.style.display = 'none';
        console.log("視窗已關閉");
    } else {
        console.error("找不到 item-detail-panel");
    }
}


// ============== 背包右邊角色資料更新 ===============

function updateEquipmentStats(char) {
    // 先清空舊數值
    char.equipmentStat = { str: 0, dex: 0, vit: 0, int: 0, def: 0, physRes: 0, magRes: 0 };
    
    // 將裝備欄入面嘅每一個 item 數值加埋落去
    for (let slot in char.equipment) {
        const item = char.equipment[slot];
        if (item?.stats) {
            for (let s in char.equipmentStat) {
                if (item.stats[s]) char.equipmentStat[s] += item.stats[s];
            }
        }
    }
}


function renderStatsPanel(char) {
    if (!char) return;
    console.log("正在渲染此兵數據:", char);

    // 1. 處理頭像 (保留你原本嘅邏輯)
    const portraitDiv = document.getElementById('inv-portrait');
    if (portraitDiv) {
        portraitDiv.innerHTML = '';
        const img = document.createElement('img');
        img.src = char.icon || getPortraitPath(char);
        img.style.cssText = 'width: 100%; height: 100%; object-fit: cover;';
        img.onerror = () => { portraitDiv.innerText = '👤'; };
        portraitDiv.appendChild(img);
    }

    const content = document.getElementById('stats-content');
    if (!content) return;

    // 2. 獲取資料 (確保所有數字都有 default 0)
    const s = char.stats || { str: 0, dex: 0, vit: 0, int: 0 };
    const e = char.equipmentStat || { str: 0, dex: 0, vit: 0, int: 0, atk: 0, hp: 0, mp: 0, physRes: 0, magRes: 0, attributeValue: 0 };
    const c = char.combat || { hp: 0, maxHp: 0, mp: 0, maxMp: 0, atk: [0, 0], physRes: 0, magRes: 0, attributeValue: 0 };

    // 3. 通用顯示器
    const disp = (base, bonus) => {
        const b = Number(bonus) || 0;
        const bs = Number(base) || 0;
        const total = bs + b;
        return `${total}${b > 0 ? ` <span style="color: #00ff00;">(+${b})</span>` : ''}`;
    };

    // 4. 攻擊力顯示
    const baseAtk = Array.isArray(c.atk) ? c.atk : [0, 0];
    const bonusAtk = Number(e.atk) || 0;
    const atkStr = `${(Number(baseAtk[0]) || 0) + bonusAtk}-${(Number(baseAtk[1]) || 0) + bonusAtk}` + (bonusAtk > 0 ? ` <span style="color: #00ff00;">(+${bonusAtk})</span>` : '');

    // 5. 渲染 HTML (這裡已經修正為讀取 c.attributeValue)
    content.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 10px; color: #ffcc00;">${char.name || '未知'} 的狀態</div>
        <div>等級: ${char.level ?? 0}</div>
        <div style="color: #ff4d4d;">生命: ${c.hp || 0} / ${disp(c.maxHp, e.hp)}</div>
        <div style="color: #4d94ff;">魔力: ${c.mp || 0} / ${disp(c.maxMp, e.mp)}</div>
        <div style="margin-top: 5px;">力量: ${disp(s.str, e.str)}</div>
        <div>敏捷: ${disp(s.dex, e.dex)}</div>
        <div>體質: ${disp(s.vit, e.vit)}</div>
        <div>智力: ${disp(s.int, e.int)}</div>
        <div>攻擊力: ${atkStr}</div>
        <div>物理抗性: ${disp(c.physRes, e.physRes)}</div>
        <div>魔法抗性: ${disp(c.magRes, e.magRes)}</div>
        <div>屬性值: ${disp(c.attributeValue, e.attributeValue)}</div>
    `;
}



// ================背包 UI 渲染=================

//主角頭像

function getPortraitPath(char) {
    const nation = char.isPlayer ? (char.progress?.currentNation || 'japan') : (char.mercNation || 'korea');
    const gender = char.gender || 'male';
    const rank = char.promotion?.level ?? 0;
    return `assets/icons/mainCharacter/${nation}_${gender}_${rank}.gif`;
}


function renderInventory() {
    const grid = document.getElementById('rpg-inv-inventory-grid');
    
    if (!grid) {
        setTimeout(renderInventory, 100); 
        return;
    }

    grid.innerHTML = ''; 
    const INVENTORY_SLOTS = 120;

    for (let i = 0; i < INVENTORY_SLOTS; i++) {
        const slot = document.createElement('div');
        slot.className = 'rpg-inv-item-slot';
        slot.style.position = 'relative'; // 確保數量 badge 能正確定位

        const item = (typeof player !== 'undefined' && player.inventory) ? player.inventory[i] : null;
        
        if (item) {
            // --- 修改點 1: 處理圖片顯示 ---
            if (item.icon) {
                const img = document.createElement('img');
                img.src = item.icon;
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.objectFit = 'contain';
                img.onerror = () => { img.remove(); slot.innerText = item.name; }; // 載入失敗則轉文字
                slot.appendChild(img);
            } else {
                slot.innerText = item.name;
            }

            // 點擊事件
            slot.onclick = () => {
                if (typeof showItemDetail === 'function') {
                    showItemDetail(item, player); 
                }
            };

            // 滑鼠移入邏輯 (保持不變)
            slot.onmouseover = (e) => {
                let tooltip = document.getElementById('item-tooltip');
                if (!tooltip) {
                    tooltip = document.createElement('div');
                    tooltip.id = 'item-tooltip';
                    Object.assign(tooltip.style, {
                        position: 'fixed', background: 'rgba(0, 0, 0, 0.9)',
                        color: 'white', padding: '10px', border: '1px solid #ffcc00',
                        pointerEvents: 'none', zIndex: '9999', fontSize: '12px', borderRadius: '4px'
                    });
                    document.body.appendChild(tooltip);
                }
                
                tooltip.style.display = 'block';
                tooltip.style.left = (e.clientX + 15) + 'px';
                tooltip.style.top = (e.clientY + 15) + 'px';
                
                const playerLvl = (typeof player !== 'undefined') ? player.level : 0;
                tooltip.innerHTML = `
                    <div style="color: #ffcc00; font-weight: bold;">${item.name}</div>
                    <div>類型: ${item.type}</div>
                    ${item.stats?.atk ? `<div>攻擊: ${item.stats.atk[0]}-${item.stats.atk[1]}</div>` : ''}
                    ${item.stats?.def ? `<div>防禦: ${item.stats.def}</div>` : ''}
                    <div style="color: ${item.lv > playerLvl ? '#ff4444' : '#00ff00'}">
                        需求等級: ${item.lv || 1}
                    </div>
                `;
            };

            slot.onmouseout = () => {
                const tooltip = document.getElementById('item-tooltip');
                if (tooltip) tooltip.style.display = 'none';
            };

            slot.onmousemove = (e) => {
                const tooltip = document.getElementById('item-tooltip');
                if (tooltip) {
                    tooltip.style.left = (e.clientX + 15) + 'px';
                    tooltip.style.top = (e.clientY + 15) + 'px';
                }
            };

            // --- 修改點 2: 強制顯示數量 (即使只有 1 份) ---
            if (item.count !== undefined) {
                const countBadge = document.createElement('span');
                countBadge.innerText = item.count;
                Object.assign(countBadge.style, {
                    position: 'absolute', bottom: '2px', right: '4px',
                    fontSize: '10px', color: '#fff', backgroundColor: 'rgba(0,0,0,0.6)',
                    padding: '0 3px', borderRadius: '3px', pointerEvents: 'none'
                });
                slot.appendChild(countBadge);
            }
        }
        grid.appendChild(slot);
    }
}



// ================背包系統整合版=================


// 1. 資料獲取核心
function getCharacterData(charID) {
    // 檢查 player 係咪存在
    if (typeof player === 'undefined' || !player) {
        console.error("【嚴重錯誤】player 變數未定義！");
        return null;
    }
    
    // 情況 A：搵主角
    if (charID === 'player') return player;
    
    // 情況 B：搵傭兵 (檢查 mercenaries 是否存在)
    if (player.mercenaries && Array.isArray(player.mercenaries)) {
        const found = player.mercenaries.find(m => m.id === charID);
        if (found) return found;
    }
    
    console.warn("找不到角色 ID:", charID);
    return null;
}

// 2. 核心切換函數 (修正了按鈕樣式)
// 你可以直接咁寫：
function switchCharacter(charID) {
    console.log("切換角色至:", charID);
    
    const target = getCharacterData(charID);
    if (!target) return;
    
    // 直接用個變數
    currentViewChar = target; 
    
    renderStatsPanel(target);
    
    // --- 加呢行就得 ---
    renderEquipmentUI(target); 
    // ------------------
    
    // ... 其他邏輯
}



let isTabsInitialized = false;

function initTabSystem() {
    if (isTabsInitialized) return;

    const container = document.getElementById('party-tabs-container');
    if (container) {
        // 確保 renderCharacterTabs 有定義
        if (typeof renderCharacterTabs === 'function') {
            renderCharacterTabs();
            isTabsInitialized = true;
            console.log("背包標籤頁已成功初始化");
            
            // 加入呢句：渲染完 Tabs 後，自動預設切換至主角
            if (typeof switchCharacter === 'function') {
                switchCharacter('player');
            }
        }
    } else {
        setTimeout(initTabSystem, 200); 
    }
}


function openInventoryView() {
    // 確保 Tabs 存在
    initTabSystem(); 
    
    // 每次入去都重新 Render 格仔
    renderInventory();
    
    // 每次入去都強制預設切換至主角
    // 呢度唔需要怕，因為 switchCharacter 有邏輯處理，唔會錯
    switchCharacter('player'); 
    
    console.log("背包介面已更新並切換至主角");
}

//=======使用物品功能效果=======

const ItemEffects = {
    // 歸化系列
    'NaturalizationPaper_Korea': (item) => {
        if (player.progress.currentNation === 'korea') return { success: false, msg: "你已經係 朝鮮！" };
        player.progress.currentNation = 'korea';
        return { success: true, msg: "成功歸化至 朝鮮！" };
    },
    'NaturalizationPaper_Japan': (item) => {
        if (player.progress.currentNation === 'japan') return { success: false, msg: "你已經係 日本！" };
        player.progress.currentNation = 'japan';
        return { success: true, msg: "成功歸化至 日本！" };
    },
    'NaturalizationPaper_Taiwan': (item) => {
        if (player.progress.currentNation === 'taiwan') return { success: false, msg: "你已經係 台灣！" };
        player.progress.currentNation = 'taiwan';
        return { success: true, msg: "成功歸化至 台灣！" };
    },
    'NaturalizationPaper_China': (item) => {
        if (player.progress.currentNation === 'china') return { success: false, msg: "你已經係 中國！" };
        player.progress.currentNation = 'china';
        return { success: true, msg: "成功歸化至 中國！" };
    }
};

function useItem(item) {
    const invItem = player.inventory.find(i => i.id === item.id);
    if (!invItem) return;

    // 1. 搵效果，如果搵唔到即係件物品無設定效果
    const effectFn = ItemEffects[invItem.id];
    if (!effectFn) {
        alert("此物品無法使用。");
        return;
    }

    // 2. 執行效果
    const result = effectFn(invItem);
    alert(result.msg);

    // 3. 只有成功執行效果先扣數
    if (result.success) {
        invItem.count -= 1;
        if (invItem.count <= 0) {
            player.inventory = player.inventory.filter(i => i.count > 0);
        }
        
        // 4. 更新 UI
        if (typeof updateLeftMainCharacterAllUI === 'function') updateLeftMainCharacterAllUI();
        renderInventory();
	renderStatsPanel(player);
        renderEquipmentUI(player); 
        if (typeof closeDetail === 'function') closeDetail();
    }
}