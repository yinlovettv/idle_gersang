// ==========================================
// 輔助技能判定專區
// ==========================================
function executeRestoreHp(attacker, skill, target) {
    // 讀取你在 DATA.skills 定義的 healRatio，沒有則預設為 6
    const ratio = skill.healRatio || 6;
    const missingHp = target.combat.maxHp - (target.combat.hp || 0); 


console.log("偵測:", {
        attackerName: attacker.name,
        targetName: target.name,
        missingHp: missingHp,
        ratio: ratio,
        attackerMp: attacker.combat.mp
    });
    // 計算目標缺損的 HP

    const requiredCost = Math.ceil(missingHp / ratio); 

    let finalCost = 0;
    let healAmount = 0;

    // 計算實際消耗與回復量
    // 如果 MP 足夠補滿，就消耗剛好足夠的 MP，否則耗盡所有 MP
    if ((attacker.combat.mp || 0) >= requiredCost) {
        finalCost = requiredCost;
        healAmount = missingHp;
    } else {
        finalCost = attacker.combat.mp || 0;
        if (finalCost <= 0) {
            addLog('battlemap_log-area', `${attacker.name} 的 MP 不足，無法施展治療！`);
            return;
        }
        healAmount = Math.floor(finalCost * ratio);
    }

    // 執行 MP 扣除與 HP 回復
    attacker.combat.mp -= finalCost;
    target.combat.hp = Math.min((target.combat.hp || 0) + healAmount, target.combat.maxHp);

    // 輸出紀錄
    if (target.combat.hp >= target.combat.maxHp) {
        addLog('battlemap_log-area', `${attacker.name} 消耗了 ${finalCost} MP，將 ${target.name} 的 HP 補滿了！`);
	updateUI();
    } else {
        addLog('battlemap_log-area', `${attacker.name} 消耗了 ${finalCost} MP，為 ${target.name} 回復了 ${healAmount} HP！`);
	updateUI();
    }
}


function executeRestoreMp(attacker, skill, target) {
    const ratio = skill.ratioMap[attacker.baseId] || 1.0;
    const missingMp = target.combat.maxMp - (target.combat.mp || 0); 
    const requiredCost = Math.ceil(missingMp / ratio); 

    let finalCost = 0;
    let healAmount = 0;

    if ((attacker.combat.mp || 0) >= requiredCost) {
        finalCost = requiredCost;
        healAmount = missingMp;
    } else {
        finalCost = attacker.combat.mp || 0;
        if (finalCost <= 0) return;
        healAmount = Math.floor(finalCost * ratio);
    }

    attacker.combat.mp -= finalCost;
    target.combat.mp += healAmount;

    if (target.combat.mp >= target.combat.maxMp) {
        target.combat.mp = target.combat.maxMp;
        addLog('battlemap_log-area', `${attacker.name} 消耗了 ${finalCost} MP，將 ${target.name} 的 MP 補滿了！`);
	updateUI();
    } else {
        addLog('battlemap_log-area', `${attacker.name} 消耗了 ${finalCost} MP，為 ${target.name} 回復了 ${healAmount} MP！`);
	updateUI();
    }
}


// ==========================================
// 輔助技能判定專區
// ==========================================
function handleSupportSkill(attacker, skillId, target) {
    const skill = DATA.skills[skillId];
    
    if (!target || target.team !== attacker.team || isInvalidTarget(target, attacker, skill.subType)) {
        target = findBestSupportTarget(attacker, skillId);
    }

    if (!target) return;

    if (skill.subType === 'mp') {
        executeRestoreMp(attacker, skill, target);
    } else if (skill.subType === 'heal') { // 這裡改了
        executeRestoreHp(attacker, skill, target);
    }
    
    updateUI();
}

// 必須要喺度定義返呢個過濾器，確保上面個 if 判斷同下面個管家同步
// 記得將 attacker 同 subType 都傳入嚟做判定
function isInvalidTarget(u, attacker, subType) {
    // 基礎安全檢查
    if (!u || !u.combat) return true;
    if (u.role === 'monster') return true;
    if (u.name && u.name.includes('山賊')) return true;

    // --- 回魔 (MP) 特有限制 ---
    if (subType === 'mp') {
        if (u.baseId === attacker.baseId) return true; // 不能回自己
        if (u.baseId && u.baseId.includes('china_taoist')) return true; // 不能回同類
    }

    // --- 回血 (HP) 邏輯 ---
    // 預設無限制，回血可以回自己及隊友 (除咗上面基礎檢查外)
    return false;
}

// 呢個函數嘅內容，完全係你原本嗰段邏輯，一粒字都冇改過
function findBestSupportTarget(attacker, skillId) {
    const skill = DATA.skills[skillId];

    const needHelp = (u) => {
        if (skill.subType === 'mp') return (u.combat.mp || 0) < (u.combat.maxMp * 0.8);
        if (skill.subType === 'heal') return (u.combat.hp || 0) < (u.combat.maxHp * 0.8); // 這裡改了
        return false;
    };

    const allies = player.mercenaries.filter(u => 
        u && u.team === attacker.team && u.combat && 
        u.combat.hp > 0 && 
        !isInvalidTarget(u, attacker, skill.subType) && 
        needHelp(u)
    );

    if (skill.subType === 'mp') {
        return allies.sort((a, b) => (a.combat.mp / a.combat.maxMp) - (b.combat.mp / b.combat.maxMp))[0];
    } else { // 這裡預設就是 heal
        return allies.sort((a, b) => (a.combat.hp / a.combat.maxHp) - (b.combat.hp / b.combat.maxHp))[0];
    }
}


// ==========================================
// 3. 戰鬥計算邏輯 即傷害公式
// ==========================================

function getFinalCombatStats(unit) {
    // 確保所有必要物件存在
    const s = unit.stats || { str: 0, dex: 0, int: 0, vit: 0 };
    const e = unit.equipmentStat || { str: 0, dex: 0, int: 0, vit: 0, atk: 0, physRes: 0, magRes: 0, critRate: 0 };
    const c = unit.combat || { atk: [0, 0], physRes: 0, magRes: 0, critRate: 0 };

    // 處理 atk：確保一定係數字
    let baseAtk = 0;
    if (Array.isArray(c.atk)) {
        baseAtk = (Number(c.atk[0]) + Number(c.atk[1])) / 2;
    } else {
        baseAtk = Number(c.atk) || 0;
    }

    return {
        // 強制 Number 轉換，確保唔會出現 NaN
        str: Number(s.str || 0) + Number(e.str || 0),
        dex: Number(s.dex || 0) + Number(e.dex || 0),
        int: Number(s.int || 0) + Number(e.int || 0),
        vit: Number(s.vit || 0) + Number(e.vit || 0),
        
        physRes: Number(c.physRes || 0) + Number(e.physRes || 0),
        magRes: Number(c.magRes || 0) + Number(e.magRes || 0),
        
        // 確保 ATK 係完整數字
        atk: Math.floor(baseAtk + Number(e.atk || 0)),
        
        critRate: Number(c.critRate || 0) + Number(e.critRate || 0)
    };
}


/**
 * 計算技能的基礎威力
 * 邏輯：(攻擊力 + 屬性貢獻) * 技能系數
 */
function calculateBaseDamage(attacker, skillId, defender) {
    const skill = DATA.skills[skillId];
    if (!skill || !skill.formula) return 0;

    // --- 修正處：改用最終計算後的數值 ---
    const finalStats = getFinalCombatStats(attacker); 
    const level = attacker.level || 1;

    try {
        // --- 修正處：將 atk 變做 finalStats.atk ---
        const calc = new Function('atk', 'level', 'str', 'dex', 'int', 'vit', `return ${skill.formula}`);
        const base = calc(
            finalStats.atk, 
            level, 
            finalStats.str, 
            finalStats.dex, 
            finalStats.int, 
            finalStats.vit
        );
        return Math.floor(base);
    } catch (e) {
        console.error("公式計算錯誤:", skillId, e);
        return finalStats.atk;
    }
}

function getResistanceMultiplier(monsterResist, debuffSum) {
    let effectiveResist = (monsterResist || 0) - (debuffSum || 0);
    // 頂抗上限處理
    effectiveResist = Math.min(260, Math.max(0, effectiveResist));
    
    let reductionRate = 57 + (effectiveResist * 0.16);
    let multiplier = (100 - reductionRate) / 100;
    
    return Math.max(0.014, multiplier);
}

/**
 * 傷害公式 
 */

function calculateDamage(attacker, skillId, defender) {
    const skill = DATA.skills[skillId];

    // --- 第一階段：基礎傷害與增幅 ---
    // 基礎威力 (敏捷/攻擊/等級)
    let baseDmg = calculateBaseDamage(attacker, skillId, defender);
    
    // 增幅係數 (特性、陣法、被動、相剋) - 預留位
    let traitMultiplier = 1.0; 
    let buffMultiplier = 1.0; 
    let attrMultiplier = 1.0;
    
    let totalDmgBeforeResist = baseDmg * traitMultiplier * buffMultiplier * attrMultiplier;

    // --- 抗性減傷 (巨商核心) ---
    let resist = (skill.type === 'magic') ? (defender.magRes || 0) : (defender.physRes || 0);
    let resistMultiplier = getResistanceMultiplier(resist, attacker.debuffSum || 0);
    let dmgAfterResist = totalDmgBeforeResist * resistMultiplier;

    // --- 最終爆發 (暴擊與浮動) ---
    // 暴擊判定 (2倍)
    let dex = attacker.stats?.dex || 0;
    let critRate = Math.min(0.5, (dex / 1000) * 0.02 + (attacker.combat?.critRate || 0));
    let isCrit = Math.random() < critRate;
    let critMultiplier = isCrit ? 2.0 : 1.0;
    
    // 隨機浮動
    let variance = 0.9 + Math.random() * 0.2;
    
    // 最終計算
    let finalDmg = dmgAfterResist * critMultiplier * variance;

    return {
        damage: Math.max(1, Math.floor(finalDmg)),
        isCrit: isCrit
    };
}



//================戰鬥系統====================


function useSkill(attacker, skillId, target) {
    const skill = DATA.skills[skillId];

    // --- 終極防線：如果係支援技，一律將敵方目標轉為 null ---
    if (skill.type === "support" && target && target.team !== attacker.team) {
        target = null;
    }

    // --- 支援技分流 ---
    if (skill.type === "support") {
        handleSupportSkill(attacker, skillId, target);
        return; 
    }

    // --- 以下是你原本的攻擊邏輯，保持不動 ---
    const mpCost = skill.mpCost || 0;

    if (!skill.validTypes.includes(target.type)) {
        addLog('battlemap_log-area', `${attacker.name} 嘅 ${skill.name} 對 ${target.name} 無效！`);
        return; 
    }

    attacker.combat.mp = attacker.combat.mp || 0; 

    if (attacker.combat.mp < mpCost) {
        addLog('battlemap_log-area', `${attacker.name} MP 不足，無法使用 ${skill.name}！`)
        return; 
    }

    attacker.combat.mp -= mpCost;

    const result = calculateDamage(attacker, skillId, target);
    target.hp -= result.damage;

    if (target.hp <= 0) {
        target.hp = 0;
        addLog('battlemap_log-area', `${attacker.name} 使用了 ${skill.name}，造成了 ${result.damage} 點傷害！`);
        addLog('battlemap_log-area', `擊敗敵人！${target.name} 已經倒下。`);
        handleVictory(); 
    } else {
        addLog('battlemap_log-area', `${attacker.name} 使用了 ${skill.name}，造成了 ${result.damage} 點傷害！`);
    }
    
    updateUI(); 
}

// ========怪物反擊=======

function selectMonsterSkill(monster) {
    const rand = Math.random(); // 產生 0 到 1 之間嘅數字
    let cumulativeChance = 0;

    for (const skill of monster.skillPool) {
        cumulativeChance += skill.chance;
        if (rand < cumulativeChance) {
            return skill.id; // 命中該技能
        }
    }
    
    // 萬一 loop 完都冇命中 (例如機率加埋唔夠 1)，就出第一招
    return monster.skillPool[0].id;
}

/**
 * 怪物打人傷害計算 (現代高級版)
 * 核心：強制扣抗 -> 屬性結算 -> 抗性減傷
 */
function calculateMonsterDamage(monster, player, skillId) {
    const skill = DATA.monsterSkills[skillId];
    if (!skill) {
        console.error("找不到此技能數據:", skillId);
        return 0;
    }
    
    // 1. 怪物基礎底傷 (平均攻擊力 * 技能倍率)
    let monsterAtk = Array.isArray(monster.combat.atk) 
        ? (monster.combat.atk[0] + monster.combat.atk[1]) / 2 
        : monster.combat.atk;
    
    let baseDmg = monsterAtk * (skill.multiplier || 1.0);

    // 2. 屬性結算 (這裡假設你有一個對應的屬性係數函數)
    // 如果你還沒寫，這裡會預設為 1.0 (無屬性增幅)
    let attrMultiplier = (typeof calculateAttrDamageMultiplier === 'function') 
        ? calculateAttrDamageMultiplier(monster.attribute, player.attribute) 
        : 1.0;
    
    // 3. 【關鍵】抗性減傷結算
    // 根據技能類型選擇玩家的抗性類型
    let playerRes = (skill.type === 'magic') ? player.magRes : player.physRes;
    
    // 強制扣除 30 點抗性 (或是技能定義的 debuffRes)
    // 這裡用 skill.debuffRes 變數，你可以在 monsterSkills 裡面設定 30 或 0
    let effectiveRes = playerRes - (skill.debuffRes || 0); 
    
    // 套用你那套強大的巨商抗性公式 (包含頂抗 260 的限制)
    let resistMultiplier = getResistanceMultiplier(effectiveRes, 0); 
    
    // 4. 最終計算：底傷 * 屬性加成 * 抗性減傷
    let finalDmg = baseDmg * attrMultiplier * resistMultiplier;
    
    // 5. 加入隨機浮動 (0.9 - 1.1)
    let variance = 0.9 + Math.random() * 0.2;
    
    return Math.max(1, Math.floor(finalDmg * variance));
}





function monsterTurn() {
    if (!currentEnemy || currentEnemy.hp <= 0) return;

    // 1. 傭兵係優先目標陣列，主角係最後防線
    // 假設 player 係你嘅全局變數
    let targets = [...player.mercenaries, player]; // 陣列順序：傭兵先，主角最後

    // 2. 搵出第一個仲活着嘅目標
    let target = targets.find(u => u.combat && u.combat.hp > 0);

    // 3. 如果搵到人，就打佢
    if (target) {
        const skillId = selectMonsterSkill(currentEnemy);
        const skill = DATA.monsterSkills[skillId] || { name: "普通攻擊" };

        const finalDamage = calculateMonsterDamage(currentEnemy, target, skillId);
        
        target.combat.hp = Math.max(0, target.combat.hp - finalDamage);

        addLog('battlemap_log-area', `<span class="text-red-400 font-bold">${currentEnemy.name} 使用了 ${skill.name}，對 ${target.name} 造成了 ${finalDamage} 點傷害！</span>`);
        
        if (typeof checkUnitStatus === 'function') checkUnitStatus(target);
        if (typeof updateUI === 'function') updateUI();
        if (typeof updateBattleUI === 'function') updateBattleUI();
    }
}

// =========玩家攻擊流程==========
function getTeamQueue() {
    // 1. 初始化名單，確保主角一定在，且主角必須有 combat 屬性 (防止主角本身資料都唔齊)
    let queue = [];
    if (player && player.status !== "dead" && player.combat) {
        queue.push(player);
    }

    // 2. 檢查 mercs 是否存在 (防止沒有請兵時程式報錯)
    if (player.mercenaries && Array.isArray(player.mercenaries)) {
        player.mercenaries.forEach(merc => {
            // 嚴格過濾：
            // a. 傭兵本身必須存在 (merc)
            // b. 狀態必須係活著 (merc.status !== "dead")
            // c. 必須要有 combat 物件 (這是最關鍵的，確保之後不會出現「不明單位」)
            if (merc && merc.status !== "dead" && merc.combat) {
                queue.push(merc);
            }
        });
    }
    
    return queue;
}

// ==========怪物攻擊流程=========

async function startFullTurn() {
    let team = getTeamQueue();
    
    // 1. 隊伍每個人輪流出招
    for (let unit of team) {
        // 假設每個單位都有個預設技能，或者你指定一個 skillId
        // 呢度就係用到你嗰個「萬能版 useSkill」嘅時候！
        unitUseSkill(unit, unit.skills[0], currentEnemy);
        
        // 加個 delay 令戰鬥有節奏感，唔會所有傷害一秒鐘彈晒出來
        await new Promise(r => setTimeout(r, 800));
        
        // 如果怪物喺期間已經死咗，就唔使打落去
        if (currentEnemy.hp <= 0) return;
    }

    // 2. 全部人打完，怪物先至反擊 (只有怪物仲生存)
    if (currentEnemy.hp > 0) {
        monsterTurn();
	updateMercenaryUI();
    }
}

// =========自動打怪系統=========

// 呢個係純粹處理一次回合攻擊嘅函數 (無延遲，適合放入 loop)
function autoExecuteTurn() {
    if (!currentEnemy || currentEnemy.hp <= 0) return;

    const attackers = getTeamQueue(); 

    attackers.forEach((action) => {
        if (currentEnemy && currentEnemy.hp > 0 && action.unit) {
            const unit = action.unit;
            
            // 1. 關鍵改動：唔好再用 index 搵 localStorage
            // 改為直接用 unit.activeSkill (因為 startAutoBattle 已經幫你 sync 咗)
            // 如果 unit.activeSkill 都冇，先 fallback 去 default 或者普攻
            const defaultFallback = (unit.skills && unit.skills.length > 0) ? unit.skills[0] : 'normal_strike';
            const skillId = unit.activeSkill || defaultFallback;
            
            // 2. 檢查技能是否存在
            const finalSkillId = (DATA.skills[skillId]) ? skillId : defaultFallback;
            
            // 3. 檢查 MP (罰機制：唔夠藍直接 return 唔打)
            const skillData = DATA.skills[finalSkillId];
            if (skillData && skillData.mpCost && unit.combat.mp < skillData.mpCost) {
                console.log(`${unit.name} MP不足，無法施放 ${skillData.name}，本回合罰企！`);
                return; // 唔夠藍就直接跳過呢個人嘅攻擊
            }

            // 4. 執行技能
            useSkill(unit, finalSkillId, currentEnemy);
        }
    });

    // ... 之後邏輯不變
    if (currentEnemy && currentEnemy.hp > 0) {
        monsterTurn();
    }
    updateBattleUI();
    if (currentEnemy && currentEnemy.hp <= 0) {
        handleVictory();
    }
}

let gameLoopInterval = null;

// 啟動自動掛機
function startAutoBattle() {
    // 1. 防止重複啟動
    if (gameLoopInterval) {
        console.log("已經掛緊機啦！");
        return;
    }

    // --- 在啟動 Loop 之前，先執行一次技能同步 ---
    console.log("正在載入掛機技能設定...");
    syncSkillsToBattle(); 
    // ----------------------------------------

    console.log("開始掛機...");
    
    // 2. 呢度係你原本嘅 Loop，完全無改到任何嘢
    gameLoopInterval = setInterval(() => {
        // 如果無怪，生一隻
        if (!currentEnemy) {
            currentEnemy = spawnNewEnemy();
            if (currentEnemy) updateBattleUI();
        } 
        // 如果有怪，就執行自動回合
        else {
	    
            autoExecuteTurn();
        }
    }, 1000); 
}

// 用一個陣列記住所有 active 的 interval ID，確保唔會漏
let activeIntervals = [];

// 改寫標準的 setInterval，令佢自動加入監控
const originalSetInterval = window.setInterval;
window.setInterval = function(callback, delay) {
    const id = originalSetInterval(callback, delay);
    activeIntervals.push(id);
    return id;
};

// 改寫標準的 clearInterval，令佢自動喺監控陣列剔除
const originalClearInterval = window.clearInterval;
window.clearInterval = function(id) {
    originalClearInterval(id);
    activeIntervals = activeIntervals.filter(i => i !== id);
};

// 停止自動掛機
function stopAutoBattle() {
    console.log("正在執行全域清理...");
    
    // 清除監控陣列入面所有嘅 ID
    activeIntervals.forEach(id => originalClearInterval(id));
    activeIntervals = [];
    
    // 順手清埋你原本個變數
    gameLoopInterval = null;
    
    console.log("所有 Loop 已徹底強制終止");
}

// 開啟自動掛機

function toggleAutoBattle() {
    const btn = document.getElementById('auto-battle-btn');
    
    // 防護：檢查按鈕是否存在
    if (!btn) {
        console.error("找不到 auto-battle-btn 按鈕");
        return;
    }

    if (!gameLoopInterval) {
        startAutoBattle();
        btn.innerText = "停止掛機";
        btn.classList.add('active');
    } else {
        stopAutoBattle();
        btn.innerText = "開啟自動掛機";
        btn.classList.remove('active');
    }

    // 防護：檢查 status-dot 是否存在，有先改顏色
    const dot = document.getElementById('status-dot');
    if (dot) {
        // 注意：這裡的 gameLoopInterval 狀態要在 stopAutoBattle 後更新
        // 或者直接根據 btn 的 class 來判斷
        dot.style.color = btn.classList.contains('active') ? "#ff0000" : "#00ffcc";
    }
}

//=============技能介面控制===============

function openSkillSettingModal() {
    const popup = document.getElementById('skill-setting-popup');
    if (!popup) return;
    
    // 設定彈出框樣式
    popup.style.display = 'block';
    popup.style.width = '600px';
    popup.style.padding = '20px';
    popup.style.backgroundColor = '#1a1a1a';
    popup.style.color = 'white';
    popup.style.border = '1px solid #444';
    popup.style.borderRadius = '8px';

    // 將主角放第一個，後面接傭兵
    const allUnits = [player, ...player.mercenaries];

    popup.innerHTML = `
        <h3 style="margin-top:0; border-bottom: 1px solid #444; padding-bottom: 10px;">設定隊伍掛機技能</h3>
        <div id="skill-list" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 15px 0;"></div>
        <div style="margin-top: 20px; text-align: center; border-top: 1px solid #444; padding-top: 10px;">
            <button onclick="saveAndClose()">儲存並關閉</button>
            <button onclick="closeModal()">取消</button>
        </div>
    `;

    const skillListDiv = document.getElementById('skill-list');

    allUnits.forEach((unit, index) => {
        // 1. 確保可用技能列表存在
        const availableSkills = (unit.skills && unit.skills.length > 0) ? unit.skills : (unit.defaultSkill || []);
        
        // 2. 關鍵修正：讀取 localStorage 時改用 unit.id (跟人唔跟位)
        // 順序: 記憶中的 activeSkill > localStorage > 第一招技能
        const savedSkill = unit.activeSkill || localStorage.getItem(`merc_skill_${unit.id}`) || availableSkills[0];

        // 生成選項
        let optionsHTML = availableSkills.map(skillId => {
            const isSelected = (skillId === savedSkill) ? 'selected' : '';
            const skillName = (DATA.skills && DATA.skills[skillId]) ? DATA.skills[skillId].name : skillId;
            return `<option value="${skillId}" ${isSelected}>${skillName}</option>`;
        }).join('');

        let div = document.createElement('div');
        div.style.display = "flex";
        div.style.alignItems = "center";
        
        // 3. ID 命名保持與 saveAndClose 對應 (使用 index 來對應 DOM select)
        div.innerHTML = `
            <span style="width: 80px; font-size: 14px;">${index + 1}. ${unit.name}: </span>
            <select id="skill-select-${index}" style="background-color: #333; color: white; padding: 5px; border-radius: 4px; flex-grow: 1;">
                ${optionsHTML}
            </select>
        `;
        skillListDiv.appendChild(div);
    });
}

// 確保你有埋呢兩個輔助 function
function saveAndClose() {
    const allUnits = [player, ...player.mercenaries];
    console.log("--- 技能設定儲存紀錄 (跟隨 Unit ID) ---");
    
    allUnits.forEach((unit, index) => {
        // 搵返對應嗰個選單
        const selectElement = document.getElementById(`skill-select-${index}`);
        
        if (selectElement) {
            const skillId = selectElement.value;
            
            // 1. 核心改動：改用 unit.id 做 Key，唔再用 index
            localStorage.setItem(`merc_skill_${unit.id}`, skillId);
            
            // 2. 同步更新入去 unit 物件入面 (方便掛機戰鬥系統直接攞)
            unit.activeSkill = skillId;
            
            // 3. Log 檢查
            const skillName = (DATA.skills && DATA.skills[skillId]) ? DATA.skills[skillId].name : skillId;
            console.log(`${unit.name} (ID:${unit.id}) 已儲存技能: ${skillName} (${skillId})`);
        }
    });
    
    console.log("------------------------");
    closeModal();
    alert("隊伍技能設定已成功儲存！");
}

function closeModal() {
    document.getElementById('skill-setting-popup').style.display = 'none';
}

function syncSkillsToBattle() {
    const allUnits = [player, ...player.mercenaries];
    allUnits.forEach(unit => {
        // 確保個單位有佢應該要出嘅技，唔係亂 random
        // 優先順序: unit.activeSkill (你 UI 設好的) > localStorage > 普攻
        const skillId = unit.activeSkill || localStorage.getItem(`merc_skill_${unit.id}`) || (unit.skills && unit.skills[0]) || "normal_strike";
        
        // 呢度好關鍵：直接將呢個 skillId 鎖死入去 unit 入面，
        // 之後 autoExecuteTurn() 嗰陣就直接用 unit.activeSkill
        unit.activeSkill = skillId;
        
        console.log(`${unit.name} 已鎖定技能: ${skillId}`);
    });
}