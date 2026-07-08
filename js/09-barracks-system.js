//==================倉庫UI渲染

// 每次切換到 Barracks 頁面時執行
function showBarracksPage() {
    // 1. 渲染內容
    renderBarracksContent('mercenary');
    
    // 2. 渲染狀態欄 (這句好重要！)
    renderBarracksStatusBar();
}

function renderBarracksStatusBar() {
    if (typeof DATA === 'undefined' || !DATA.rules) return;

    // 1. 計算總數
    const currentTotal = player.mercenaries.length;
    const maxTotal = DATA.rules.totalSlots;

    // 2. 計算將帥數 (用 role 判斷)
    const generalCount = player.mercenaries.filter(m => m.role === 'general').length;
    const generalMax = DATA.rules.mercenaryLimits.general.base + (player.sunziBooksUsed || 0);

    const statusBar = document.getElementById('BarracksStatusBar');
    if (!statusBar) return;

    statusBar.innerHTML = `
        <span>部隊: ${currentTotal}/${maxTotal}</span>
        <span>將帥: ${generalCount}/${generalMax}</span>
        <span style="display: flex; align-items: center; gap: 5px;">
            孫子兵法: [${player.sunziBooks || 0}] 
            <button onclick="alert('孫子兵法研讀功能尚在開發中，敬請期待！')" 
                    style="background:#222; color:#777; border:1px solid #444; cursor:not-allowed; padding:0 5px; font-size:12px;">
                未開放
            </button>
        </span>
    `;
}

function renderBarracksContent(type) {
    const subContent = document.getElementById('BarracksSubContent');
    if (!subContent) return;

    if (!player.barracks) {
        player.barracks = { mercenaries: [], items: [] };
    }

    if (type === 'mercenary') {
        subContent.innerHTML = `
            <div class="flex gap-4 p-4 h-[400px]">
                <div class="w-1/2 flex flex-col border-r border-[#3d3625] pr-4">
                    <h4 class="text-[#d4af37] mb-2">出戰隊伍 (${(player.mercenaries || []).length}/11)</h4>
                    <div class="flex flex-wrap content-start gap-2 overflow-y-auto">
                        ${(player.mercenaries || []).map((m, index) => `
                            <button onclick="confirmDepositMercenary(${index})" class="w-16 h-16 bg-[#1a1a1a] border border-[#3d3625] hover:border-[#d4af37] transition-all flex-none relative group">
                                <img src="${m.icon}" class="w-full h-full object-cover">
                                <span class="absolute bottom-0 left-0 bg-black/70 text-[10px] text-white w-full">入宿</span>
                            </button>
                        `).join('')}
                    </div>
                </div>
                <div class="w-1/2 flex flex-col">
                    <h4 class="text-[#d4af37] mb-2">客棧休息區</h4>
                    <div class="flex flex-wrap content-start gap-2 overflow-y-auto">
                        ${(player.barracks.mercenaries || []).map((m, index) => `
                            <button onclick="moveMercenary(${index}, 'toParty')" class="w-16 h-16 bg-[#1a1a1a] border border-[#3d3625] hover:border-[#d4af37] transition-all flex-none relative group">
                                <img src="${m.icon}" class="w-full h-full object-cover">
                                <span class="absolute bottom-0 left-0 bg-black/70 text-[10px] text-white w-full">出戰</span>
                            </button>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    } else if (type === 'inventory') {
        subContent.innerHTML = `
            <div class="flex gap-4 p-2 h-[400px]">
                <div class="w-1/2 flex flex-col border-r border-[#3d3625] pr-2">
                    <h4 class="text-[#d4af37] mb-2 text-sm">隨身背包</h4>
                    <div class="grid grid-cols-8 gap-1 h-[350px] overflow-y-auto pr-1">
                        ${(player.inventory || []).map((item, index) => `
                            <button onclick="BarracksopenQuantityDialog(${index}, 'inventory')" class="w-12 h-12 bg-[#1a1a1a] border border-[#3d3625] hover:border-[#d4af37] transition-all flex-none relative group" title="${item.name}">
                                <img src="${item.icon}" class="w-full h-full object-cover">
                                <span class="absolute bottom-0 right-0 bg-black/70 text-[9px] text-[#d4af37] px-0.5">${item.count}</span>
                            </button>
                        `).join('')}
                    </div>
                </div>
                <div class="w-1/2 flex flex-col">
                    <h4 class="text-[#d4af37] mb-2 text-sm">倉庫</h4>
                    <div class="grid grid-cols-8 gap-1 h-[350px] overflow-y-auto pr-1">
                        ${(player.barracks.items || []).map((item, index) => `
                            <button onclick="BarracksopenQuantityDialog(${index}, 'storage')" class="w-12 h-12 bg-[#1a1a1a] border border-[#3d3625] hover:border-[#d4af37] transition-all flex-none relative group" title="${item.name}">
                                <img src="${item.icon}" class="w-full h-full object-cover">
                                <span class="absolute bottom-0 right-0 bg-black/70 text-[9px] text-[#d4af37] px-0.5">${item.count}</span>
                            </button>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }
}

//============搬前確認==============
// ============= 搬運物品核心邏輯 =============
// 顯示純資訊 (取代 Alert)
function showBarracksInfo(message) {
    const modal = document.getElementById('BarracksModal');
    document.getElementById('BarracksModalContent').innerHTML = `<p>${message}</p>`;
    document.getElementById('BarracksModalYes').style.display = 'none'; 
    modal.style.display = 'block';
}

function showBarracksConfirm(message, onConfirm) {
    const modal = document.getElementById('BarracksModal');
    document.getElementById('BarracksModalContent').innerHTML = `<p>${message.replace(/\n/g, '<br>')}</p>`;
    document.getElementById('BarracksModalYes').style.display = 'inline-block';
    document.getElementById('BarracksModalYes').onclick = () => { onConfirm(); closeBarracksModal(); };
    modal.style.display = 'block';
}

function closeBarracksModal() {
    document.getElementById('BarracksModal').style.display = 'none';
}

// ============= 2. 搬運物品系統 =============
function performMove(index, amount, source, target) {
    let sourceArray = (source === 'inventory') ? player.inventory : player.barracks.items;
    let targetArray = (target === 'inventory') ? player.inventory : player.barracks.items;

    let item = sourceArray[index];

    if (amount >= item.count) {
        let movedItem = sourceArray.splice(index, 1)[0];
        targetArray.push(movedItem);
    } else {
        item.count -= amount;
        targetArray.push({ ...item, count: amount });
    }

    renderBarracksContent('inventory');
    updateUI();
}

function BarracksopenQuantityDialog(index, source) {
    let sourceArray = (source === 'inventory') ? player.inventory : player.barracks.items;
    let item = sourceArray[index];

    if (!item) return;

    if (item.count <= 1) {
        performMove(index, item.count, source, (source === 'inventory' ? 'storage' : 'inventory'));
        return;
    }

    const modal = document.getElementById('BarracksModal');
    
    // 呢度先係彈窗內容嘅地方
    document.getElementById('BarracksModalContent').innerHTML = `
        <p>物品: ${item.name}</p>
        <p>目前數量: ${item.count}</p>
        <input type="number" id="qty-input" value="${item.count}" max="${item.count}" min="1" 
               style="background: #1a1a1a; color: white; border: 1px solid #f1c40f; padding: 5px; width: 80px; font-size: 16px;">
    `;
    
    document.getElementById('BarracksModalYes').style.display = 'inline-block';
    document.getElementById('BarracksModalYes').onclick = () => {
        let q = parseInt(document.getElementById('qty-input').value);
        if (q > 0 && q <= item.count) {
            let target = (source === 'inventory') ? 'storage' : 'inventory';
            performMove(index, q, source, target);
            closeBarracksModal();
        } else {
            showBarracksInfo("數量無效！");
        }
    };
    
    modal.style.display = 'block';
}

// ============= 3. 搬運士兵系統 =============
function moveMercenary(index, direction) {
    if (direction === 'toBarracks') {
        // --- 移去倉庫：呢度唔需要限制 ---
        let merc = player.mercenaries.splice(index, 1)[0];
        player.barracks.mercenaries.push(merc);
    } else {
        // --- 移去出戰隊伍：加入將帥檢查 ---
        let merc = player.barracks.mercenaries[index]; // 先預覽隻兵

        // 檢查如果係將帥，係咪達到上限
        if (merc.role === 'general') {
            const generalMax = DATA.rules.mercenaryLimits.general.base + (player.sunziBooksUsed || 0);
            const currentGeneralCount = player.mercenaries.filter(m => m.role === 'general').length;

            if (currentGeneralCount >= generalMax) {
                alert(`將帥出戰名額已滿 (${currentGeneralCount}/${generalMax})！\n請先研讀更多「孫子兵法」以增加出戰上限。`);
                return; // 終止動作，唔畀佢移入去
            }
        }

        // 檢查出戰總數上限 (totalSlots)
        if (player.mercenaries.length >= DATA.rules.totalSlots) {
            alert("出戰隊伍已滿，無法再加入傭兵！");
            return;
        }

        // 檢查通過，正式執行移入
        let movedMerc = player.barracks.mercenaries.splice(index, 1)[0];
        player.mercenaries.push(movedMerc);
    }

    renderBarracksStatusBar();
    renderBarracksContent('mercenary');
    updateUI();
}

function confirmDepositMercenary(index) {
    let merc = player.mercenaries[index];
    let info = `確認要將此兵放入客棧？<br>` +
               `名稱: ${merc.name}<br>` +
               `戰力: ${merc.combat.atk[0]}-${merc.combat.atk[1]}<br>` +
               `等級: ${merc.level}`;

    showBarracksConfirm(info, () => {
        moveMercenary(index, 'toBarracks');
        showBarracksInfo(`${merc.name} 已成功入宿！`);
    });
}

