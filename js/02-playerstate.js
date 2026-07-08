// ==========================================
//  角色邏輯 (後台處理)
// ==========================================

function initializePlayer(name, nation) {
    player.name = name;
    player.nation = nation;
    // 這裡放入你的屬性加成邏輯
    updatePlayerStats();
}

// ==========================================
//  角色藍圖 & 玩家遊戲狀態
// ==========================================

/**
 * 通用屬性更新函數
 * 適用於：主角 player 或 任何傭兵 mercenary
 */
function updateCharacterStats(character) {
    if (!character) return;
    
    // A. 確保裝備數值最新 (保持順序)
    if (typeof updateEquipmentStats === 'function') {
        updateEquipmentStats(character);
    }

    // B. 獲取 stats 與 equipmentStat (補上缺少的屬性確保不報錯)
    const s = character.stats || { str: 0, dex: 0, vit: 0, int: 0 };
    const e = character.equipmentStat || { str: 0, dex: 0, vit: 0, int: 0, atk: 0, physRes: 0, magRes: 0, critRate: 0 };
    
    // C. 計算最終總屬性 (保留你所有屬性計算)
    const finalVit = (Number(s.vit) || 0) + (Number(e.vit) || 0);
    const finalInt = (Number(s.int) || 0) + (Number(e.int) || 0);
    const finalStr = (Number(s.str) || 0) + (Number(e.str) || 0);
    
    // D. 同步至 combat (核心邏輯：MP/HP 公式與攻擊力公式)
    character.combat.maxHp = finalVit * 4;
    character.combat.maxMp = finalInt * 4;
    
    // 【保留你嘅攻擊力公式】：STR 總和 + 裝備攻
    const totalAtk = finalStr + (Number(e.atk) || 0);
    character.combat.atk = [totalAtk, totalAtk]; 
    
    // 保留你原本定義的防禦與抗性同步
    character.combat.def = finalStr; 
    character.combat.physRes = (Number(character.combat.physRes) || 0);
    character.combat.magRes = (Number(character.combat.magRes) || 0);
    character.combat.critRate = (Number(character.combat.critRate) || 0);

    // E. 防爆與補正 (確保數值正確)
    if (character.combat.hp <= 0 || character.combat.hp > character.combat.maxHp) {
        character.combat.hp = character.combat.maxHp;
    }
    if (character.combat.mp <= 0 || character.combat.mp > character.combat.maxMp) {
        character.combat.mp = character.combat.maxMp;
    }
    
    console.log("更新後的戰鬥數值:", character.combat);
}




// 備用確應血量不會突破血上限
function clampStats() {
    player.combat.hp = Math.min(player.combat.hp, player.combat.maxHp);
    player.combat.mp = Math.min(player.combat.mp, player.combat.maxMp);
    updateUI(); // 順便更新埋畫面
}

function checkUnitStatus(unit) {
    // 如果已經係 "dead"，直接唔做嘢
    if (unit.status === "dead") {
        return false; 
    }

    // 檢查血量
    if (unit.combat.hp <= 0) {
        unit.combat.hp = 0;
        unit.status = "dead"; // 標記為死亡
        
        // 用 unit.name 令訊息更靈活
        addLog('battlemap_log-area', `<span class="text-red-600 font-bold">${unit.name} 已經倒下！</span>`);
        
        updateUI(); // 更新介面
        return false;
    }
    
    return true; // 仲生存緊
}

function performSystemUpdate() {
    // 1. 處理主角升級
    updateUnitLevel(player);
    
    // 2. 處理所有傭兵升級 (假設你有一個陣列叫 player.mercenaries)
    if (player.mercenaries) {
        player.mercenaries.forEach(merc => {
            updateUnitLevel(merc);
        });
    }

    // 3. 最後統一更新 UI
    updatePlayerUI();
    // 如果你有 updateMercenaryUI 都可以喺呢度加埋
}

function checkPlayerStatus() {
    // 簡單一句話，將原本嘅檢查功能轉交俾萬能版去處理
    return checkUnitStatus(player);
}

// 即時玩家遊戲狀態

// 等級換算連傭兵升級版，改做接收任何 unit (player 或 merc)
function updateUnitLevel(unit) {
    // 1. 跑升級迴圈
    while (true) {
        const nextEntry = DATA.expTable.find(e => e.level === unit.level + 1);
        if (nextEntry && unit.totalExp >= nextEntry.total) {
            unit.level++;
            
            // 2. 當升級時，只將該級的 bonus 累加到現有的 bonusPoints
            // 咁樣你轉職嗰 461 點就會一直保留，只會越升越多
            const levelBonus = nextEntry.bonus || 0;
            unit.bonusPoints = (unit.bonusPoints || 0) + levelBonus;
            
            console.log(`${unit.name} 升至 Lv.${unit.level}，獲得紅利: ${levelBonus}，總剩餘: ${unit.bonusPoints}`);
        } else {
            break;
        }
    }
}

// 計算指定等級應該有幾多紅利
function calculateTotalBonus(targetLevel) {
    let total = 0;
    for (let i = 2; i <= targetLevel; i++) {
        const entry = DATA.expTable.find(e => e.level === i);
        if (entry) {
            total += (entry.bonus || 0);
        }
    }
    return total;
}

// 檢查剩餘紅利

function addStat(statType) {
    if (player.bonusPoints > 0) {
        player.stats[statType]++;
        player.bonusPoints--;
        player.spentPoints = (player.spentPoints || 0) + 1;

        updateCharacterStats(player);
        
        // 【核心修改】：強制告訴 UI 只更新主角 player，不要碰 currentViewChar
        if (typeof window.updatePlayerUI === 'function') {
            updatePlayerUI(); // 確保呢個函數入面係寫死讀 player 的
        }

	if (typeof window.renderStatsPanel === 'function') {
            renderStatsPanel(player); 
        }
        
        // 關鍵點：這兩個函數如果不帶參數，就讓它們只處理 player
        // 如果它們內部會讀取 window.currentViewChar，你需要改寫那兩個函數，
        // 或者在這裏強制不執行它們，直到切換回主角
        renderCharacterTabs(); 

    }
}


