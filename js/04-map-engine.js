// 測試用函數
// ✅ 正確嘅寫法
function manualSpawn() {
    if (currentEnemy) {
        console.log("戰場仲有怪，唔準亂出！");
        return;
    }
    
    // 關鍵：將回傳嘅怪物物件，賦值俾 currentEnemy
    currentEnemy = spawnNewEnemy(); 
    
    if (currentEnemy) {
        updateBattleUI(); // 之後再更新 UI
    }
}


//-----怪物生成----
let currentMapId = 'battlemap_beginnermap';

function spawnNewEnemy() {
    // 實時讀取畫面選單 ID
    const selector = document.getElementById('floor-selector');
    const mapId = (selector && selector.value) ? selector.value : window.currentMapId;
    
    let mapData;
    let parentMapData = null; // 用來存父級地圖，以防子樓層冇怪
    
    // 1. 查找邏輯
    if (DATA.maps[mapId]) {
        mapData = DATA.maps[mapId];
    } else {
        for (const key in DATA.maps) {
            const m = DATA.maps[key];
            if (m.floors) {
                const foundFloor = m.floors.find(f => f.id === mapId);
                if (foundFloor) {
                    mapData = foundFloor;
                    parentMapData = m; // 記錄父級
                    break;
                }
            }
        }
    }
    
    if (!mapData) {
        console.warn("spawnNewEnemy 搵唔到地圖數據:", mapId);
        return null;
    }

    // 2. 【關鍵修正】：如果該樓層無怪，嘗試繼承父級地圖的怪物列表
    let monsterList = mapData.monsters;
    if ((!monsterList || monsterList.length === 0) && parentMapData && parentMapData.monsters) {
        monsterList = parentMapData.monsters;
    }

    if (!monsterList || monsterList.length === 0) {
        console.warn("呢個地方無怪出喎:", mapId);
        return null;
    }

    // 3. 生成怪物
    const randomKey = monsterList[Math.floor(Math.random() * monsterList.length)];
    const template = DATA.monsters[randomKey];

    if (!template) return null;

    const enemy = { 
        id: randomKey,
        ...template, 
        maxHp: template.hp,
        hp: template.hp,
        stats: {
            str: (template.stats?.str) ?? (template.str || 0),
            dex: (template.stats?.dex) ?? (template.dex || 0),
            int: (template.stats?.int) ?? (template.int || 0),
            vit: (template.stats?.vit) ?? (template.vit || 0)
        },
        combat: {
            atk: (template.combat?.atk) ?? (template.atk || 10),
            def: (template.combat?.def) ?? (template.def || 0),
            mdef: (template.combat?.mdef) ?? (template.mdef || 0)
        },
        skills: template.skills || [], 
        drops: template.drops || []        
    };

    // 4. 更新 UI 與介面
console.log("DEBUG: 準備更新UI，怪物資料:", enemy);
console.log("DEBUG: 準備更新UI，地圖資料:", mapData);
    updateBattleMapInfo(enemy, mapData);
    updateUI();
    
    console.log("新怪物已生成:", enemy.name);
    addLog('battlemap_log-area', `野生 ${enemy.name} 出現了！`);

    return enemy;
}





// ==============全隊恢復=========
function healAllUnits() {
    console.log("--- 偵錯：使用強制指標恢復 ---");
    
    // 玩家恢復
    player.combat.hp = player.combat.maxHp;
    player.combat.mp = player.combat.maxMp;
    player.status = "alive";

    // 【修正】：唔用 forEach，直接用 for 迴圈去修改 player 物件本身
    if (player.mercenaries) {
        for (let i = 0; i < player.mercenaries.length; i++) {
            // 直接操作 player.mercenaries[i]，確保係改緊同一個物件
            if (player.mercenaries[i] && player.mercenaries[i].combat) {
                player.mercenaries[i].combat.hp = player.mercenaries[i].combat.maxHp;
                player.mercenaries[i].combat.mp = player.mercenaries[i].combat.maxMp;
                player.mercenaries[i].status = "alive";
            }
        }
    }
    // 恢復後即刻更新 UI
    updateMercenaryUI();
}

//===========地圖切換============

function changeMap(mapId) {
    stopAutoBattle();
    window.currentMapId = mapId;
    currentEnemy = null;

    // 1. 在轉地圖嗰下，強制先從 localStorage 讀取一次最新資料
    // 確保 player 物件入面嘅 exp 係最新，唔係舊嘅或者暫存的
    if (typeof loadPlayerData === 'function') {
        loadPlayerData(); 
    }

    // 2. 處理地圖邏輯...
    const map = DATA.maps[mapId];
    if (map && map.type === 'safe') {
        healAllUnits();
        updateMercenaryUI();
    }

    // 3. 最後先更新 UI
    refreshAllStats();
    updateUI(); 
    setupMapSelector();
    
}

function updateBattleMapInfo(enemy, mapData) {
    const infoArea = document.getElementById('battlemap-info');
    if (!infoArea) return;

    // 【終極改法】：唔再理會地圖 type 係咩，只要有 enemy 呢隻變數，就一律顯示資料！
    if (enemy) {
        infoArea.innerHTML = `
            <p>怪物：${enemy.name}</p>
            <p>技能：${enemy.skills?.map(sId => (DATA.skills[sId] ? DATA.skills[sId].name : sId)).join(', ') || '無'}</p>
            <p>經驗：${enemy.exp}</p>
            <p>掉落：${enemy.drops?.map(d => {
                if (d.type === 'gold') return d.amount + ' 銀兩';
                if (d.type === 'item') {
                    const itemData = DATA.items.equipment?.[d.itemId] || DATA.items.consumables?.[d.itemId];
                    return itemData ? itemData.name : d.itemId;
                }
                return d.type;
            }).join(', ') || '無'}</p>
        `;
    } else {
        infoArea.innerHTML = `<p>休息中</p>`;
    }
}

