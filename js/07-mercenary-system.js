// ==========================================
//  訓練所轉職介面設定
// ==========================================

// ====== 紅利計算========
function getBonusPointsFromMerc(merc) {
    // 關鍵修改：從 merc.stats 入面讀取屬性
    // 加上 || {} 係為了防備如果 merc.stats 唔存在嘅情況
    const s = (merc.stats && merc.stats.str) || 0;
    const d = (merc.stats && merc.stats.dex) || 0;
    const v = (merc.stats && merc.stats.vit) || 0;
    const i = (merc.stats && merc.stats.int) || 0;
    const b = merc.bonusPoints || 0; // 剩餘點數係直接喺 merc 底下，呢個啱

    const statsTotal = s + d + v + i + b;
    
    console.log("計算 debug:", { s, d, v, i, b, statsTotal });
    
    return Math.floor(statsTotal / 5);
}




/**
 * 專門用於轉職的 ID 產生器
 */
function promoGenerateNewId() {
    return 'promo_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
}

function executePromotion(index) {
    const oldMerc = player.mercenaries[index];
    const rule = DATA.promotionTable[oldMerc.baseId];
    const newbonusPoints = getBonusPointsFromMerc(oldMerc);

if (!rule) return;

const hasItems = Object.values(oldMerc.equipment).some(item => item !== null);

if (hasItems) {
    alert("轉職失敗：請先除晒身上所有裝備！");
    return;
}


    // --- 【唯一性檢查】 ---
const targetGroupId = Object.keys(DATA.promotionGroups).find(groupKey => 
        DATA.promotionGroups[groupKey].includes(rule.targetId)
    );

    if (targetGroupId) {
        // 1. 檢查出戰隊伍
        const hasConflictInTeam = player.mercenaries.some(merc => {
            return merc.id !== oldMerc.id && merc.baseId === rule.targetId;
        });

        // 2. 檢查客棧 (新增呢段)
        const hasConflictInBarracks = player.barracks.mercenaries.some(merc => {
            return merc.baseId === rule.targetId;
        });

        if (hasConflictInTeam || hasConflictInBarracks) {
            alert("轉職失敗：隊伍或客棧中已經有同樣將帥，唔可以重複轉職！");
            return;
        }
    }
    // -
    // ----------------------------

    // --- 轉職 ID 邏輯 ---
    const newId = promoGenerateNewId();
    console.log("舊傭兵 ID:", oldMerc.id);
    console.log("新傭兵 ID:", newId);

    player.gold -= rule.reqGold;

    const newTemplate = DATA.mercenary[rule.targetId];
    
    const newMerc = {
        ...newTemplate,
        id: newId,
        level: 1, 
        totalExp: 0,
	bonusPoints: newbonusPoints,
        status: "alive"
    };

    player.mercenaries.splice(index, 1, newMerc);
    
    renderTCmerclist();
    updateMercenaryUI();
    alert("轉職成功！");

    if (typeof refreshMercenaryList === 'function') {
        refreshMercenaryList();
    }
    
    document.getElementById('promotion-preview-area').innerHTML = '';
}



function showPromotionPreview(index) {
    const merc = player.mercenaries[index];
    const rule = DATA.promotionTable[merc.baseId];

    if (!rule) {
        document.getElementById('promotion-preview-area').innerHTML = `<p>此兵種暫無轉職資料</p>`;
        return;
    }

    const nextData = DATA.mercenary[rule.targetId];
    const targetName = nextData ? nextData.name : "未知轉職";
    
    // --- 【修正：加入孫子兵法計算上限】 ---
    const isTargetGeneral = nextData.role === 'general';
    const currentGeneralCount = player.mercenaries.filter(m => m.role === 'general').length;
    
    // 關鍵修正：加上 (player.sunziBooksUsed || 0)
    const maxGeneral = DATA.rules.mercenaryLimits.general.base + (player.sunziBooksUsed || 0);
    const remainingSlots = maxGeneral - currentGeneralCount;
    // ------------------------------------------
    
    const isSlotsOk = !isTargetGeneral || (remainingSlots > 0);

    const bonusPoints = getBonusPointsFromMerc(merc);
    
    const isLevelOk = merc.level >= rule.reqLv;
    const isGoldOk = player.gold >= rule.reqGold;
    const isItemOk = rule.reqItem === null || player.inventory.includes(rule.reqItem);
    
    const canPromote = isLevelOk && isGoldOk && isItemOk && isSlotsOk;

    const previewArea = document.getElementById('promotion-preview-area');
    
    previewArea.innerHTML = `
        <div class="text-white">
            <h3 class="text-lg font-bold mb-2">轉職預覽：${merc.name} -> ${targetName}</h3>
            
            ${isTargetGeneral ? `
                <div class="mb-4 font-bold ${remainingSlots > 0 ? 'text-blue-400' : 'text-red-500'}">
                    將帥名額：${currentGeneralCount} / ${maxGeneral} (剩餘: ${remainingSlots})
                </div>
            ` : ''}
            
            <p>轉職要求：</p>
            <ul class="text-xs mb-4">
                <li class="${isLevelOk ? 'text-green-500' : 'text-red-500'}">
                    ${isLevelOk ? '✅' : '❌'} 等級達到 ${rule.reqLv}
                </li>
                <li class="${isGoldOk ? 'text-green-500' : 'text-red-500'}">
                    ${isGoldOk ? '✅' : '❌'} 金幣 ${rule.reqGold}
                </li>
                ${rule.reqItem ? `
                <li class="${isItemOk ? 'text-green-500' : 'text-red-500'}">
                    ${isItemOk ? '✅' : '❌'} 需要道具：${rule.reqItem}
                </li>` : ''}
            </ul>

            <div class="bg-yellow-900/50 p-2 mb-4 rounded border border-yellow-600 text-yellow-300 font-bold text-sm">
                轉職後獲得紅利點數：${bonusPoints} 點
            </div>

            ${isTargetGeneral && !isSlotsOk ? `
                <div class="bg-red-900/80 p-3 rounded text-center text-red-200 font-bold border border-red-600">
                    ⚠️ 將帥名額已滿，無法轉職！
                </div>
            ` : `
                <button 
                    onclick="executePromotion(${index})" 
                    ${canPromote ? '' : 'disabled'}
                    class="px-4 py-2 ${canPromote ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-500 cursor-not-allowed'} text-white rounded font-bold w-full">
                    ${canPromote ? '執行轉職' : '條件未滿足'}
                </button>
            `}
        </div>
    `;
}

// ==========================================
//  訓練所炒人設定
// ==========================================
function confirmDismiss(index) {
    const merc = player.mercenaries[index];
    // 嚴肅嘅確認提示
    const confirmed = confirm(`你確定要永久解雇「${merc.name}」嗎？\n此操作無法撤銷。`);
    
    if (confirmed) {
        player.mercenaries.splice(index, 1);
        renderTCmerclist();
	updateMercenaryUI();
        console.log(`傭兵 ${merc.name} 已被解雇。`);
    }
}

// ==========================================
//  訓練所切換兵位設定
// ==========================================
function TC_moveMercenary(index, direction) {
    event.stopPropagation();
    
    const list = player.mercenaries;
    const newIndex = index + direction;

    if (newIndex >= 0 && newIndex < list.length) {
        // 交換位置
        [list[index], list[newIndex]] = [list[newIndex], list[index]];
        
        // 1. 更新訓練所列表
        renderTCmerclist();
        
        // 2. 更新 UI
        if (typeof updateMercenaryUI === 'function') {
            updateMercenaryUI();
        }
        
        // 3. 更新統計面板 (如果存在)
        if (typeof renderStatsPanel === 'function') {
            renderStatsPanel(currentViewChar); // 順便確保統計面板同步
        }
    }
}

// ==========================================
//  訓練所設定
// ==========================================

function selectTCMerc(mercId, element) {
    console.log("選中了傭兵:", mercId);
    // 簡單的視覺回饋：移除其他人的 active，幫自己加上去
    document.querySelectorAll('.mercenary-card').forEach(btn => {
        btn.classList.remove('border-[#d4af37]', 'bg-[#2a2416]');
        btn.classList.add('border-[#3d3625]', 'bg-[#1a1a1a]');
    });
    element.classList.remove('border-[#3d3625]', 'bg-[#1a1a1a]');
    element.classList.add('border-[#d4af37]', 'bg-[#2a2416]');
}

function switchTCTab(mode, btnElement) {
    // 【核心修改】記錄當前模式，方便 renderTCmerclist 判斷
    window.currentMode = mode; 

    // 1. 更新 Tab 樣式
    document.querySelectorAll('.func-btn').forEach(btn => {
        btn.classList.remove('text-[#d4af37]', 'border-b-2', 'border-[#d4af37]', 'bg-[#1a1a1a]');
        btn.classList.add('text-[#7a7a7a]');
    });
    btnElement.classList.add('text-[#d4af37]', 'border-b-2', 'border-[#d4af37]', 'bg-[#1a1a1a]');
    btnElement.classList.remove('text-[#7a7a7a]');

    // 2. 更新按鈕文字
    //const actionBtn = document.getElementById('action-btn');
    //if (mode === 'train') actionBtn.innerText = '確認轉職';
    //else if (mode === 'deploy') actionBtn.innerText = '確認編隊';
    //else if (mode === 'dismiss') actionBtn.innerText = '確認解雇';

    // 3. 重新渲染傭兵列表
    renderTCmerclist();
}

// ==========================================
//  訓練所自動入兵系統
// ==========================================

function initRecruitmentShop() {
console.log("當前 DATA 物件:", DATA); // 睇下 console 出咩
    console.log("當前 MerRecruitment:", DATA.MerRecruitment); 
    const nations = ['korea', 'japan', 'china', 'taiwan'];
    
    // 檢查 DATA 係咪已經 load 咗
    if (typeof DATA === 'undefined' || !DATA.MerRecruitment) {
        console.error("DATA 數據未定義，請檢查 00-data.js 是否正確載入！");
        return;
    }

    nations.forEach(nation => {
        const container = document.getElementById(`merc-list-${nation}`);
        
        // 【重要】如果搵唔到 HTML 容器，直接跳過，唔好搞到 crash
        if (!container) {
            console.warn(`搵唔到 ID 為 merc-list-${nation} 嘅容器`);
            return;
        }

        const mercs = DATA.MerRecruitment[nation] || [];
        
        // 渲染
        container.innerHTML = mercs.map(merc => `
            <button onclick="highlightMerc(this)" 
                    data-key="${merc.id}" 
                    class="mercenary-card w-16 h-16 bg-[#1a1a1a] border border-[#3d3625] transition-all hover:border-[#d4af37] focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]">
                <img src="${merc.icon}" class="w-full h-full object-cover" title="${merc.name}">
            </button>
        `).join('');
    });
}


// ==========================================
//  訓練所UI
// ==========================================
// 渲染傭兵格子的函數
// 渲染訓練與傭兵管理系統的列表
function renderTCmerclist() {
    const grid = document.getElementById('merc-grid');
    if (!grid) return;

    // 取得當前模式
    const isTrainMode = (window.currentMode === 'train');
    const isDeployMode = (window.currentMode === 'deploy');
    const isDismissMode = (window.currentMode === 'dismiss');

    // --- 轉職模式的獨立 UI ---
if (isTrainMode) {
    grid.innerHTML = `
        <div class="p-4 bg-black border border-[#3d3625] text-white h-[350px] w-full"> 
            <h2 class="text-[#d4af37] text-lg mb-4 border-b border-[#3d3625] pb-2">轉職中心</h2>
            
            <!-- 核心：加咗 w-full 同埋確保入面兩個 div 闊度固定 -->
            <div class="flex gap-4 h-[250px] w-full"> 
                
                <!-- 左邊選人區：強制寬度 33% -->
                <div class="w-[33%] flex flex-wrap content-start gap-2 overflow-y-auto">
                    ${player.mercenaries.map((merc, index) => `
                        <button onclick="showPromotionPreview(${index})" class="w-16 h-16 bg-[#1a1a1a] border border-[#3d3625] hover:border-[#d4af37] transition-all flex-none">
                            <img src="${merc.icon}" class="w-full h-full object-cover">
                        </button>
                    `).join('')}
                </div>

                <!-- 右邊預覽區：強制寬度 66% 加上 flex-none 防止被壓縮 -->
                <div id="promotion-preview-area" class="w-[66%] p-4 bg-[#111] border border-[#d4af37] h-[270px] flex-none overflow-hidden">
                    <p class="text-gray-500">請選擇一名傭兵進行轉職預覽...</p>
                </div>
            </div>
        </div>
    `;
    return; // 【重要】轉職模式渲染完就走，唔好行下面嗰段網格代碼
    }

    // --- 原本編隊/解雇模式的網格渲染 (保持不變，超穩) ---
    let displayList = [...player.mercenaries];
    while (displayList.length < 11) {
        displayList.push({ empty: true });
    }

    grid.innerHTML = displayList.map((merc, index) => {
        if (merc.empty) {
            return `<div class="w-16 h-16 bg-[#1a1a1a] border border-[#3d3625] flex items-center justify-center text-[#2a2416] text-xs">空</div>`;
        } else {
            let overlay = '';
            if (isDeployMode) {
                overlay = `
                    <div class="absolute top-0 left-0 z-10 flex flex-row p-0.5 gap-0.5 pointer-events-none">
                        <button onclick="TC_moveMercenary(${index}, -1)" class="pointer-events-auto bg-black/80 text-white w-6 h-5 text-[10px] hover:bg-[#d4af37] border border-white/20">◀</button>
                        <button onclick="TC_moveMercenary(${index}, 1)" class="pointer-events-auto bg-black/80 text-white w-6 h-5 text-[10px] hover:bg-[#d4af37] border border-white/20">▶</button>
                    </div>`;
            } else if (isDismissMode) {
                overlay = `
                    <div class="absolute top-0 right-0 z-10 bg-red-900/80 text-white w-5 h-5 flex items-center justify-center text-[12px] font-bold cursor-pointer hover:bg-red-700" 
                         onclick="event.stopPropagation(); confirmDismiss(${index})">×</div>`;
            }

            return `
                <div class="relative w-16 h-16">
                    ${overlay}
                    <button onclick="selectTCMerc('${merc.id}', this)" class="w-full h-full bg-[#1a1a1a] border border-[#3d3625] ${isDismissMode ? 'hover:border-red-600' : 'hover:border-[#d4af37]'} transition-all overflow-hidden relative group">
                        <img src="${merc.icon}" onerror="this.src='assets/icons/default.png'" class="w-full h-full object-cover">
                        <div class="absolute bottom-0 right-0 bg-black/60 text-[9px] text-[#d4af37] px-0.5">Lv.${merc.level || 1}</div>
                    </button>
                </div>
            `;
        }
    }).join('');
}




// ==========================================
//  招募所設定
// ==========================================


function showMercShopDetails(mercKey) {
    // ... 找尋目標兵種邏輯 (同之前一樣) ...
    let targetMerc = null;
    for (let nation in DATA.MerRecruitment) {
        let found = DATA.MerRecruitment[nation].find(m => m.id === mercKey);
        if (found) { targetMerc = found; break; }
    }
    if (!targetMerc) return;

    // 更新 UI (使用新 ID)
    document.getElementById('mercShop_mercDetails').classList.remove('hidden');
    document.getElementById('mercShop_name').innerText = targetMerc.name;
    document.getElementById('mercShop_cost').innerText = targetMerc.cost.toLocaleString();
    
    // 假設你數據結構係 targetMerc.stats.str ...
    document.getElementById('mercShop_str').innerText = targetMerc.stats.str;
    document.getElementById('mercShop_dex').innerText = targetMerc.stats.dex;
    document.getElementById('mercShop_vit').innerText = targetMerc.stats.vit;
    document.getElementById('mercShop_int').innerText = targetMerc.stats.int;
}


function switchNationMenu(nationId, clickedBtn) {
    // 1. 隱藏所有內容
    document.querySelectorAll('.nation-tab').forEach(tab => tab.classList.add('hidden'));
    
    // 防錯檢查：確定個 ID 存在先去 remove hidden
    const targetTab = document.getElementById(nationId);
    if (targetTab) {
        targetTab.classList.remove('hidden');
    }

    // 2. 重置所有按鈕樣式
    document.querySelectorAll('.nation-btn').forEach(btn => {
        btn.classList.remove('text-[#d4af37]', 'border-[#d4af37]', 'bg-[#1a1a1a]', 'shadow-[0_-2px_10px_rgba(212,175,55,0.2)]', 'font-bold');
        btn.classList.add('text-[#7a7a7a]', 'border-transparent');
    });

    // 3. 激活目標按鈕
    if (clickedBtn) {
        clickedBtn.classList.add('text-[#d4af37]', 'border-[#d4af37]', 'bg-[#1a1a1a]', 'shadow-[0_-2px_10px_rgba(212,175,55,0.2)]', 'font-bold');
        clickedBtn.classList.remove('text-[#7a7a7a]', 'border-transparent');
    }

    // 4. 【修正位】用返你定義嘅 nationId
    renderNation(nationId);
}

function renderNation(nation) {
    // 1. 先安全地找到容器
    const container = document.getElementById(`merc-list-${nation}`);
    
    // 【關鍵修改】如果找不到容器，不要往下執行，並在控制台報警
    if (!container) {
        console.error(`找不到 ID 為 merc-list-${nation} 的容器，請檢查 HTML 是否包含此 ID`);
        return;
    }

    // 2. 獲取數據
    const mercs = DATA.MerRecruitment[nation] || [];
    
    // 3. 渲染
    container.innerHTML = mercs.map(merc => `
        <button onclick="highlightMerc(this)" data-key="${merc.id}"
                class="mercenary-card w-16 h-16 bg-[#1a1a1a] border border-[#3d3625] transition-all hover:border-[#d4af37] focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]">
            <img src="${merc.icon}" class="w-full h-full object-cover" title="${merc.name}">
        </button>
    `).join('');
}


function highlightMerc(buttonElement) {
    // 1. 移除選中狀態
    const currentTab = buttonElement.closest('.nation-tab');
    currentTab.querySelectorAll('.mercenary-card').forEach(btn => {
        btn.classList.remove('border-[#d4af37]', 'ring-2', 'ring-[#d4af37]');
    });

    // 2. 為自己加上高光
    buttonElement.classList.add('border-[#d4af37]', 'ring-2', 'ring-[#d4af37]');

    // 3. 記低選中嘅 Key
    selectedMercKey = buttonElement.getAttribute('data-key');
    
    // 4. 【修改位】呼叫新命名嘅詳細資訊顯示功能
    // 注意：確保你個函數名係 showMercShopDetails
    if (typeof showMercShopDetails === 'function') {
        showMercShopDetails(selectedMercKey);
    }
    
    console.log("玩家揀咗:", selectedMercKey);
}

function confirmRecruit() {
    // 1. 檢查選取
    if (!selectedMercKey) {
        alert("請先揀一隻兵！");
        return;
    }
    
    // 2. 搵出傭兵數據 (只係為咗睇價錢)
    let selectedMerc = null;
    for (let nation in DATA.MerRecruitment) {
        selectedMerc = DATA.MerRecruitment[nation].find(m => m.id === selectedMercKey);
        if (selectedMerc) break;
    }


    const playerNation = player.progress.currentNation;
    if (selectedMerc && selectedMerc.mercNation !== playerNation) {
        alert("滾！你不是本國人，請回去自己國家！");
        return;
    }

    // 檢查兵位與分類上限 (假設 role 屬性在 selectedMerc 裡面)
    if (!canRecruit(selectedMerc.role)) {
        return; // canRecruit 裡面已經有 alert 了，直接 return 就不會扣錢
    }

    // 3. 檢查錢 (夠錢先做嘢)
    const cost = selectedMerc ? (selectedMerc.cost || 0) : 0;
    if (player.gold < cost) {
        alert("錢唔夠呀！");
        return;
    }
    
    // 4. 扣錢
    player.gold -= cost;
    
    // 5. 呼叫你原本嗰個 recruit 函數 (唔郁佢)
    updateLeftMainCharacterAllUI() ;
    recruit(selectedMercKey); 
}

function canRecruit(role) {
    // 1. 檢查總數 (11隻)
    if (player.mercenaries.length >= DATA.rules.totalSlots) {
        alert("總隊伍欄位已滿 (11/11)！");
        return false;
    }

    // 2. 檢查分類上限 (例如將帥)
    const rule = DATA.rules.mercenaryLimits[role];
    if (rule) {
        const currentCount = player.mercenaries.filter(m => m.role === role).length;
        // 計算總上限 = base + 道具加成 (假設 player 有 sunziBooksUsed)
        const limit = rule.base + Math.min(player.sunziBooksUsed || 0, rule.bonusLimit);
        
        if (currentCount >= limit) {
            alert(`${rule.name} 數量已達上限 (${currentCount}/${limit})！`);
            return false;
        }
    }
    
    return true; // 通過檢查
}


// ==========================================
//  招募傭兵/怪/神獸/怪物入庫Data設定
// ==========================================


function recruit(key) {
    // 直接存取 DATA 物件，確保在調用前 DATA 已經掛載
    const mercData = DATA?.mercenary ? DATA.mercenary[key] : null;
    
    if (!mercData) {
        console.error("【嚴重錯誤】找不到這隻兵的數據，key:", key);
        alert("招募失敗：數據庫找不到這隻兵！");
        return;
    }

    // 檢查 player 是否存在
    if (typeof player === 'undefined' || !player) {
        console.error("【嚴重錯誤】player 物件不存在！");
        alert("招募失敗：無法找到玩家資料。");
        return;
    }

    // 1. 檢查總欄位 (11格)
    if (!player.mercenaries) player.mercenaries = [];
    if (player.mercenaries.length >= DATA.rules.totalSlots) {
        alert("總隊伍欄位已滿 (11/11)！");
        return;
    }

    // 2. 檢查分類限制
    const role = mercData.role || 'soldier'; 
    const rule = DATA.rules.mercenaryLimits ? DATA.rules.mercenaryLimits[role] : null;

    if (rule) {
        const currentCount = player.mercenaries.filter(m => m.role === role).length;
        const limit = rule.base + Math.min(player.sunziBooksUsed || 0, rule.bonusLimit);
        
        if (currentCount >= limit) {
            alert(`${rule.name} 數量已達上限 (${currentCount}/${limit})！`);
            return;
        }
    }

    // 3. 複製數據並初始化
    let newMerc = JSON.parse(JSON.stringify(mercData));
    newMerc.id = "merc_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
    
    if (!newMerc.combat) newMerc.combat = { hp: 0, mp: 0, atk: 0, def: 0 };
    
    // 呼叫核心公式引擎
    if (typeof updateCharacterStats === 'function') {
        updateCharacterStats(newMerc);
    }

    // 4. 加入隊伍
    player.mercenaries.push(newMerc);
    
    // 5. 更新 UI
    if (typeof updateMercenaryUI === 'function') {
        updateMercenaryUI();
    }
    
    console.log("招募成功！", newMerc);
    alert(newMerc.name + " 已加入隊伍！");
}



// ==========================================
//  UI 更新位
// ==========================================


function updateMercenaryUI() {
    const container = document.getElementById('merc-container');
    if (!container) return;
    container.innerHTML = '';

    for (let i = 0; i < DATA.rules.totalSlots; i++) {
        let merc = player.mercenaries[i];
        let slotDiv = document.createElement('div');
        slotDiv.className = 'slot'; 
        slotDiv.id = `merc-slot-${i}`;

        if (merc) {
            let hpP = (merc.combat.maxHp > 0) ? (merc.combat.hp / merc.combat.maxHp) * 100 : 0;
            // 【修改點】：計算 MP 百分比
            let mpP = (merc.combat.maxMp > 0) ? (merc.combat.mp / merc.combat.maxMp) * 100 : 0;

            slotDiv.innerHTML = `
                <div class="merc-card" onclick="showMercDetail('${merc.id}', this)" style="cursor: pointer;">
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                        <span style="font-size: 13px;">${merc.name} <span style="color: #666;">L.${merc.level}</span></span>
                        ${merc.bonusPoints > 0 ? `<span style="color: #4ade80; font-size: 11px;">紅利:${merc.bonusPoints}</span>` : ''}
                        
                        <div style="display: flex; flex-direction: column; gap: 2px;">
                            <!-- HP 條 -->
                            <div style="width: 40px; height: 6px; background: #300;"><div class="hp-fill" style="width: ${hpP}%"></div></div>
                            <!-- MP 條 (新增) -->
                            <div style="width: 40px; height: 6px; background: #003;"><div class="mp-fill" style="width: ${mpP}%; background: #3b82f6;"></div></div>
                        </div>
                    </div>
                </div>
            `;
        } else {
            slotDiv.innerHTML = `<div class="empty-slot">空位</div>`;
        }
        container.appendChild(slotDiv);
    }
}


