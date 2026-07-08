// ================掉寶/經驗值功能==================

function getPlayerStatus(totalExp) {
    let exp = Math.max(0, totalExp);
    let currentLevel = 1;
    let totalBonus = 0;

    // 檢查數據是否載入
    if (!DATA.expTable || DATA.expTable.length === 0) {
        console.error("錯誤：DATA.expTable 無數據！");
        return { level: 1, bonusPoints: 0 };
    }

    for (let i = 0; i < DATA.expTable.length; i++) {
        let entry = DATA.expTable[i];
        
        // 【除錯重點】如果這裡 output 睇到 total 係 undefined，就係你陣列入面個 key 名打錯咗
        if (entry.total === undefined) {
             console.error("錯誤：找不到 total 欄位，請檢查第", i, "項數據");
             break;
        }

        if (exp >= entry.total) {
            currentLevel = entry.level;
            totalBonus = entry.bonus;
        } else {
            break; // 已經超過咗嗰個 level 嘅門檻，跳出
        }
    }
    return { level: currentLevel, bonusPoints: totalBonus };
}

function updateExpBar() {
    const status = getPlayerStatus(player.totalExp);
    const currentLevel = status.level;
    
    // 搵返當前同下一級嘅界線
    const currentEntry = DATA.expTable.find(e => e.level === currentLevel);
    const nextEntry = DATA.expTable.find(e => e.level === currentLevel + 1);
    
    if (nextEntry) {
        const progress = player.totalExp - currentEntry.total;
        const totalNeeded = nextEntry.total - currentEntry.total;
        const percentage = Math.floor((progress / totalNeeded) * 100);
        
        // 更新 UI (假設你個 bar 嘅 id 係 expBar)
        const bar = document.getElementById('expBar'); 
        bar.style.width = percentage + "%";
        bar.innerText = percentage + "%";
    } else {
        // 滿級狀態
        document.getElementById('expBar').style.width = "100%";
        document.getElementById('expBar').innerText = "MAX";
    }
}


/**
 * 掉落物處理 背包功能
 * @param {string} monsterId - 怪物 ID (例如 'chawoo')
 */


function handleDrops(monsterInfo) {
    // 【容錯】如果傳入係物件，拎佢個 .id；否則直接當 ID 用
    const monsterId = (monsterInfo && typeof monsterInfo === 'object') ? monsterInfo.id : monsterInfo;
    
    console.log(`[監控] 開始嘗試掉寶，目標怪物 ID: ${monsterId}`); 
    
    // 如果連 ID 都無，直接彈出嚟，唔好畀佢繼續行落去
    if (!monsterId) {
        return;
    }
    
    const monster = DATA.monsters[monsterId];

    // 檢查怪物數據
    if (!monster) {
        return;
    }
    
    if (!monster.drops || monster.drops.length === 0) {
        return;
    }

    monster.drops.forEach((drop, index) => {
        
        if (Math.random() < drop.chance) {
            
            if (drop.type === "gold") {
                player.gold += drop.amount;
                addLog('battlemap_log-drop', `獲得銀兩: ${drop.amount}！`);
            } 
            else if (drop.type === "item") {
                addItemToInventory(drop.itemId, drop.amount);
                // 注意：確保 getItemName 呢個函數係正常運作嘅
                const itemName = getItemName({ type: "item", itemId: drop.itemId });
                addLog('battlemap_log-drop', `獲得物品: ${itemName} x${drop.amount}！`);
            }
        } else {
            console.log(`[失敗] 冇抽中 ${drop.type} (機率 ${drop.chance})`);
        }
    });
}

function getItemName(item) {
    // 1. 【新增】處理技能 ID (字串)
    if (typeof item === 'string') {
        return DATA.skills[item] ? DATA.skills[item].name : item;
    }

    // 2. 處理掉落物 (原本嗰套邏輯)
    if (typeof item === 'object' && item !== null) {
        if (item.type === 'gold') return `${item.amount} 金幣`;
        
        if (item.type === 'item') {
            // 優先搵 equipment，搵唔到就搵 consumables
            const foundItem = (DATA.items && DATA.items.equipment && DATA.items.equipment[item.itemId]) 
                           || (DATA.items && DATA.items.consumables && DATA.items.consumables[item.itemId]);
            
            return foundItem ? foundItem.name : item.itemId;
        }
    }
    
    // 如果乜都唔係，回傳原樣
    return item;
}

function addItemToInventory(itemId, amount) {
    // 1. 先搵出件物品嘅完整資料 (同之前 getItemName 邏輯一樣)
const itemData = (DATA.items.equipment && DATA.items.equipment[itemId]) 
               || (DATA.items.consumables && DATA.items.consumables[itemId])
               || (DATA.items.specialItem && DATA.items.specialItem[itemId]);

    if (!itemData) {
        console.error(`Error: 搵唔到 ID 為 ${itemId} 嘅物品資料！`);
        return;
    }

    // 2. 檢查背包入面係咪已經有呢件嘢 (疊加邏輯)
    // 假設你係想疊加數量，而唔係每件都獨立一格
    const existingItem = player.inventory.find(item => item.id === itemId);

    if (existingItem) {
        // 如果有，就加數量
        existingItem.count += amount;
        console.log(`[背包] ${itemData.name} 數量增加至 ${existingItem.count}`);
    } else {
        // 如果未有，就整一個新 Object 入去
        player.inventory.push({
            id: itemId,
            name: itemData.name, // 記低個名，方便之後 Display
            type: itemData.type, // 記低類型
            count: amount,       // 初始數量
            ...itemData          // 把原本 itemData 嗰堆 stats, def, etc. 全部帶埋過去
        });
        console.log(`[背包] 獲得新物品: ${itemData.name} x${amount}`);
    }
}