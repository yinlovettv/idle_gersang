console.log("game.js 已經成功載入！");
console.log("updateCharacterStats check:", typeof updateCharacterStats);
// 全域變數，用嚟記錄上一次嘅傭兵數量，避免重複渲染
let lastMercCount = -1;
let currentViewChar = null; // 順便幫你埋定埋呢個位，免得下次又話佢 undefined
let activeSlot = null; 
let player = {};
const NATION_MAP = { "japan": "日本", "korea": "朝鮮", "china": "中國", "taiwan": "台灣" };
const GENDER_MAP = { "male": "男", "female": "女" };


// =========遊戲啟動=========

function navigate(mapId, element) {
    // 1. 介面層：切換 UI 狀態 (setActive 可能來自 UI 模組)
    setActive(element);
    
    // 2. 邏輯層：切換地圖 (這通常會觸發數據層 00 的變動)
    changeMap(mapId); 
    
    // 3. 介面層：載入畫面內容 (例如渲染地圖 HTML)
    loadPage(mapId);
    
    // 4. 全局刷新：最後一步，確保所有狀態顯示一致
    updateUI(); 
}

// ==========================================
//  介面控制 (前台交互,重要!)
// ==========================================

// --------頁面切換控制------------

function switchPage(pageId) {

// 【核心邏輯】：切換頁面時，強制關閉自動戰鬥
    if (typeof stopAutoBattle === 'function') {
        stopAutoBattle(); 
        console.log("偵測到頁面切換，已強制停止自動戰鬥");
    }


    // 1. 定義所有頁面容器 ID
    const pageIds = ['start-menu', 'save-slot-menu', 'creation-menu', 'game-container'];
    
    // 2. 隱藏所有頁面及 UI 相關組件
    pageIds.forEach(id => {
        const page = document.getElementById(id);
        if (page) {
            page.classList.add('hidden');
            page.style.display = 'none';
        }
    });

    // --- 【新增核心邏輯】 ---
    // 如果切換到 game-container，顯示 UI；否則隱藏 UI
    const isGame = (pageId === 'game-container');
    const uiElements = document.querySelectorAll('.game-ui'); // 確保你嗰啲 HP/MP Bar 有 class="game-ui"
    uiElements.forEach(el => {
        el.style.display = isGame ? 'block' : 'none';
    });

    // 3. 顯示目標頁面
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.remove('hidden');
        targetPage.style.display = 'flex';
    } else {
        console.error("搵唔到頁面 ID:", pageId);
    }

    // 4. 存檔介面初始化
    if (pageId === 'save-slot-menu') {
        if (typeof initSaveSlots === 'function') initSaveSlots();
    }
}

// ==========================================
//  存檔介面初始化 (Save Slot Generator)
// ==========================================

window.addEventListener('DOMContentLoaded', () => {
    console.log("頁面載入完成，開始初始化...");
    
    // 1. 初始化存檔 (你原本就有既)
    initSaveSlots();
    
    // 2. 初始化角色標籤 (加埋呢句)
    renderCharacterTabs();
});

function initSaveSlots() {
    const container = document.getElementById('slot-container');
    if (!container) return;
    
    container.innerHTML = '';
    const maxSlots = 3;

    for (let i = 1; i <= maxSlots; i++) {
        const savedData = localStorage.getItem(`saveSlot_${i}`);
        let displayName = savedData ? JSON.parse(savedData).name : "(空)";

        const slotDiv = document.createElement('div');
        // 加咗 relative 方便定位，同埋加咗 hover 效果
        slotDiv.className = "relative bg-slate-800 p-4 rounded border border-slate-700 hover:border-yellow-500 transition mb-3 group";
        
	slotDiv.innerHTML = `
   	<div class="flex justify-between items-center">
        	<div>
            <div class="font-bold text-lg text-yellow-500">存檔 ${i}</div>
            <div class="text-sm text-slate-400 mt-1">角色: ${displayName}</div>
        </div>
        <div class="flex gap-2">
            <button onclick="handleSlotAction(${i})" class="px-4 py-2 ${savedData ? 'bg-green-600' : 'bg-blue-600'} hover:opacity-80 rounded font-bold">
                ${savedData ? '讀取進度' : '建立'}
            </button>
            
            ${savedData ? `
                <button onclick="deleteSave(${i})" class="px-3 py-2 bg-red-900 hover:bg-red-700 text-red-200 rounded text-sm font-bold">刪除</button>
            ` : ''}
        </div>
    </div>
`;
        
        container.appendChild(slotDiv);
    }
}

function deleteSave(slotId) {
    // 加個確認框，防止手殘刪錯
    if (confirm(`你確定要刪除「存檔 ${slotId}」嗎？此操作無法復原！`)) {
        localStorage.removeItem(`saveSlot_${slotId}`);
        console.log(`存檔 ${slotId} 已刪除`);
        
        // 刪完即刻刷新畫面
        initSaveSlots();
    }
}

// 處理撳完入去之後要做咩
function handleSlotAction(slotId) {
    const savedData = localStorage.getItem(`saveSlot_${slotId}`);

    if (savedData) {
        // 如果有存檔，就直接呼叫讀取函數
        loadGame(slotId);
    } else {
        // 如果是空的，才去創角頁面
        activeSlot = slotId; // 記住玩家選了哪個槽
        switchPage('creation-menu');
    }
}

// 記得：一入遊戲就要執行呢段生成函數
initSaveSlots();

// ==========================================
// 7. 創角選擇邏輯 (Creation Selector)
// ==========================================

let playerDraft = {
    name: "",
    nation: "",
    gender: "",
    stats: { str: 10, dex: 10, vit: 10, int: 10 }
};

let bonusPoints = 10;

function selectOption(btn, type) {
    // 1. 搵出同類型嘅所有按鈕
    const buttons = document.querySelectorAll(`.${type}-btn`);
    
    // 2. 清除所有按鈕嘅「選中樣式」
    buttons.forEach(b => {
        b.classList.remove('bg-yellow-500', 'border-yellow-200', 'text-black', 'shadow-[0_0_10px_rgba(234,179,8,0.6)]');
        b.classList.add('bg-slate-800', 'border-slate-700', 'text-white');
    });

    // 3. 套用選中效果
    btn.classList.remove('bg-slate-800', 'border-slate-700', 'text-white');
    btn.classList.add('bg-yellow-500', 'border-yellow-200', 'text-black', 'shadow-[0_0_10px_rgba(234,179,8,0.6)]');

    // 4. 更新數據 (加入判斷式，確保國家數據正確進入 progress)
    const value = btn.getAttribute('data-value') || btn.innerText;

    if (type === 'nation') {
        // 如果無 progress 物件就初始化一個
        if (!playerDraft.progress) {
            playerDraft.progress = { currentNation: "japan", currentCycleQuests: [] };
        }
        // 將值存入巢狀結構
        playerDraft.progress.currentNation = value;
    } else {
        // 其它屬性 (gender 等) 就照舊存入根目錄
        playerDraft[type] = value;
    }

    // 5. 更新 UI
    updateAvatar();
}

function updateAvatar() {
    // 1. 確保防禦性讀取，避免報錯
    const nation = playerDraft.progress?.currentNation || 'japan';
    const gender = playerDraft.gender || 'male';

    // 修改 log 內容，令你睇得清楚數據有無讀到
    console.log("偵測到的數據 (Nation):", nation, "Gender:", gender);

    const newSrc = `assets/character/${nation}_${gender}.png`;

    // 2. 更新 IMG 標籤
    const imgEl = document.getElementById('player-avatar');
    if (imgEl) imgEl.src = newSrc;

    // 3. 更新背景圖
    const cardEl = document.getElementById('info-card-bg');
    if (cardEl) {
        cardEl.style.backgroundImage = `url('${newSrc}')`;
        cardEl.style.backgroundSize = 'cover';
        cardEl.style.backgroundPosition = 'center';
        cardEl.style.backgroundRepeat = 'no-repeat';
        console.log("背景已更新為:", newSrc);
    }
}

// =============更新左上角背景圖===========

/**
 * 更新左邊主介面所有 UI (包含頭像、數值、國家文字等)
 */
function updateLeftMainCharacterAllUI() {
    // 1. 更新數值、Bar 條、國家名、文字顯示
    updatePlayerUI();
    
    // 2. 更新頭像背景圖同樣式
    updateMainAvatar();
    
    console.log("左側 UI 已全面更新，目前國家:", player.progress.currentNation);
}





function updateMainAvatar() {
    if (typeof player === 'undefined') return;

    const nation = (player.progress && player.progress.currentNation) || 'japan';
    const gender = player.gender || 'male';
    const newSrc = `assets/character/${nation}_${gender}.png`;

    const cardEl = document.getElementById('info-card-bg');
    
    if (cardEl) {
        // 1. 關鍵：移除 filter: brightness，改用背景層控制亮度
        // 用 multiply 混合模式將圖壓暗，然後用更深色嘅遮罩疊上去
        cardEl.style.backgroundImage = `
            linear-gradient(rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.8)), 
            url('${newSrc}')
        `;
        cardEl.style.backgroundSize = 'cover';
        cardEl.style.backgroundPosition = 'center';
        cardEl.style.backgroundRepeat = 'no-repeat';
        
        // 2. 移除 cardEl.style.filter (呢個係導致字濛嘅元兇)
        cardEl.style.filter = 'none'; 

        // 3. 改強文字陰影：用銳利陰影，唔好用模糊
        // 改用 0 偏移 + 銳利嘅黑色邊框，字體會勁清晰
        cardEl.style.textShadow = '1px 1px 0px #000, -1px -1px 0px #000, 1px -1px 0px #000, -1px 1px 0px #000';

        // 4. 強制字體加粗，對比度會即刻返晒嚟
        cardEl.style.color = '#ffffff';
        cardEl.style.fontWeight = 'bold';
    }
}


function changePoint(attr, delta) {
    // 使用 playerDraft.stats 來進行運算
    if (delta > 0 && bonusPoints > 0) {
        playerDraft.stats[attr]++;
        bonusPoints--;
    } else if (delta < 0 && playerDraft.stats[attr] > 10) {
        playerDraft.stats[attr]--;
        bonusPoints++;
    }

    // 更新介面顯示
    document.getElementById('val-' + attr).innerText = playerDraft.stats[attr];
    document.getElementById('bonus-points').innerText = bonusPoints;
}


//==============經驗值計算系統===========

// 這個函數專門負責計算百分比
function calculateExpPercentage(totalExp, level) {
    const currentEntry = DATA.expTable.find(e => e.level === level);
    const nextEntry = DATA.expTable.find(e => e.level === level + 1);
    
    if (!nextEntry) return 100; // 滿級
    
    const totalNeeded = nextEntry.total - currentEntry.total;
    const progress = totalExp - currentEntry.total;
    
    // 加上我頭先講過嘅 Math.min，防止條 bar 爆錶
    let expPer = (totalNeeded > 0) ? (progress / totalNeeded) * 100 : 0;
    return Math.min(Math.max(expPer, 0), 100); 
}

//==============更新UI畫面 渲染===============


// 3. 渲染按鈕函數 (完美修正版)
function renderCharacterTabs() {
const container = document.getElementById('party-tabs-container');

    if (!container) {
                return;
    }

    // 後面原本嘅渲染邏輯保持不變
    container.innerHTML = ''; 
    const fragment = document.createDocumentFragment();

    // 插入主角
    const heroBtn = document.createElement('button');
    heroBtn.className = 'rpg-inv-btn' + (currentViewChar?.id === 'player' ? ' is-active' : '');
    heroBtn.innerText = '主角';
    heroBtn.setAttribute('data-id', 'player');
    heroBtn.onclick = () => window.switchCharacter('player');
    fragment.appendChild(heroBtn);

    // 插入傭兵
    if (Array.isArray(player.mercenaries)) {
        player.mercenaries.forEach(merc => {
            const btn = document.createElement('button');
            const isActive = currentViewChar?.id === merc.id ? ' is-active' : '';
            btn.className = 'rpg-inv-btn' + isActive;
            btn.innerText = merc.name || '未知傭兵';
            btn.setAttribute('data-id', merc.id);
            btn.onclick = () => window.switchCharacter(merc.id);
            fragment.appendChild(btn);
        });
    }

    container.appendChild(fragment);
    console.log("Tabs 渲染完成，共包含", container.children.length, "個按鈕");
}

//==============更新左上主角UI畫面 渲染===============

function updatePlayerUI() {
    if (!player || !player.combat) {
        console.log("updatePlayerUI: player 數據未準備好");
        return;
    }

    // --- 【修正一】：先計算好所有需要的數值 ---
    const expPer = calculateExpPercentage(player.totalExp, player.level);
    const hpPer = (player.combat.maxHp > 0) ? (player.combat.hp / player.combat.maxHp) * 100 : 0;
    const mpPer = (player.combat.maxMp > 0) ? (player.combat.mp / player.combat.maxMp) * 100 : 0;

    const nationName = NATION_MAP[player.progress.currentNation] || "未知";
    const genderName = GENDER_MAP[player.gender] || "未知";


    // --- 1. 基礎顯示更新 ---
    document.getElementById('display-name').textContent = player.name;
    document.getElementById('display-info').textContent = `${nationName} | ${genderName}`;

    document.getElementById('display-gold').textContent = player.gold.toLocaleString();

    // 屬性列表更新
    const updateList = [
        { id: 'player-level', value: player.level },
        { id: 'player-bonus', value: player.bonusPoints },
        { id: 'stat-str', value: player.stats.str },
        { id: 'stat-dex', value: player.stats.dex },
        { id: 'stat-con', value: player.stats.vit },
        { id: 'stat-int', value: player.stats.int }
    ];
    updateList.forEach(item => {
        const el = document.getElementById(item.id);
        if (el) el.textContent = item.value;
    });

    // --- 2. 更新 Bar 寬度 (現在 expPer 已經有值了，不會報錯) ---
    const hpBar = document.getElementById('player-hp-bar');
    const mpBar = document.getElementById('player-mp-bar');
    const expBar = document.getElementById('player-exp-bar');
    
    if(hpBar) hpBar.style.width = hpPer + "%";
    if(mpBar) mpBar.style.width = mpPer + "%";
    if(expBar) expBar.style.width = expPer + "%";

    // --- 3. 更新文字顯示 ---
    const hpText = document.getElementById('player-hp-text');
    const mpText = document.getElementById('player-mp-text');
    const expText = document.getElementById('player-exp-text');

    if (hpText) hpText.textContent = `${player.combat.hp}/${player.combat.maxHp}`;
    if (mpText) mpText.textContent = `${player.combat.mp}/${player.combat.maxMp}`;
    if (expText) expText.textContent = `${Math.round(expPer)}%`;

    // --- 4. 按鈕顯示邏輯 ---
    const btnIds = ['btn-str', 'btn-dex', 'btn-con', 'btn-int'];
    btnIds.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
            if (player.bonusPoints > 0) btn.classList.remove('invisible');
            else btn.classList.add('invisible');
        }
    });
}


// 核心：創建並儲存
function createAndSave() {
    // 1. 補齊名字數據 (因為 input 唔喺 playerDraft 入面)
    const nameInput = document.getElementById('player-name-input').value;

    // --- 新增：檢查點數是否分配完 ---
    if (bonusPoints > 0) {
        alert("你還有剩餘的點數沒有分配！");
        return; 
    }
    
    // 2. 檢查數據
    if (!nameInput || !playerDraft.progress.currentNation || !playerDraft.gender) {
        alert("請確保名字、國家、性別都已經選好！");
        return;
    }

    // 3. 【核心改動】：將模板「複製」入 player，然後填入玩家數據
    // JSON.parse(JSON.stringify(...)) 確保完整繼承裝備、背包等結構
    player = JSON.parse(JSON.stringify(playerTemplate));

    // 填入玩家資料
    player.name = nameInput;
    player.progress.currentNation = playerDraft.progress.currentNation;
    player.gender = playerDraft.gender;
    player.stats = { ...playerDraft.stats }; // 把分配好的點數填入

    // 4. 計算戰鬥數據 
   updateCharacterStats(player);

    // 5. 存入 LocalStorage
    if (activeSlot !== null) {

        // 先儲存，再更新 UI，最後跳轉
        localStorage.setItem(`saveSlot_${activeSlot}`, JSON.stringify(player));
        console.log(`成功儲存！`, player);
        updateCharacterStats(player);
        updatePlayerUI(); 
	updateMainAvatar();
	switchPage('game-container');
	loadPage('menu_village');
    }

}

function loadGame(slotId) {
    const savedData = localStorage.getItem(`saveSlot_${slotId}`);
    if (!savedData) return alert("找不到存檔！");

    player = JSON.parse(savedData);
    activeSlot = slotId;
    
    // 1. 切換顯示
    switchPage('game-container'); 
    loadPage('menu_village');
    
    // 2. 【關鍵修改】：用 setTimeout 延遲 100ms 更新 UI
    // 確保 HTML 已經被 loadPage 插入到 main-content 入面
    setTimeout(() => {
        updateCharacterStats(player);
        updatePlayerUI();
        updateMainAvatar();
        
        // --- 這裡一定要加上這一句 ---
        if (typeof updateMercenaryUI === 'function') {
            updateMercenaryUI();
            console.log("傭兵 UI 已自動刷新");
        }



        if (typeof renderCharacterTabs === 'function') {
            renderCharacterTabs();
	    initTabSystem();
            console.log("傭兵 Tab 按鈕已生成");
        }

    }, 100);

    console.log("讀檔完成，正在載入介面...");
}

window.onload = function() {
	updateMainAvatar();
    if (localStorage.getItem(`saveSlot_${activeSlot}`)) {

        // 如果有存檔，載入
        loadGame(activeSlot);
	
    } else {
        // 如果係新開，至少先更新一次 UI
        updatePlayerUI();
    }
};

// ==========================================
// 儲存進度 
// ==========================================

function saveGame() {
    if (!activeSlot) {
        console.error("未選定存檔位，無法儲存！");
        return;
    }

    // 1. 將目前的 player 物件轉做字串
    const dataToSave = JSON.stringify(player);

    // 2. 存入 localStorage
    localStorage.setItem(`saveSlot_${activeSlot}`, dataToSave);

    // 3. (選用) 給玩家一個回饋，確保佢知道存咗檔
    showSaveNotification();
    
    console.log(`存檔完成 (Slot ${activeSlot})`);
}

// 簡單嘅存檔成功提示 (Toast Notification)
function showSaveNotification() {
    // 建立一個臨時 div
    const toast = document.createElement('div');
    toast.innerText = "遊戲已自動儲存";
    toast.className = "fixed bottom-5 right-5 bg-green-800 text-white px-4 py-2 rounded shadow-lg z-50 text-sm";
    document.body.appendChild(toast);

    // 2秒後自動消失
    setTimeout(() => {
        toast.remove();
    }, 2000);
}



// ==========================================
// 8. 主頁畫面轉換 
// ==========================================


function setActive(element) {
    if (!element) return;
    // 1. 關鍵步驟：選取所有 nav-link，先將佢哋全部嘅 active 樣式清空
    const allLinks = document.querySelectorAll('.nav-link');
    allLinks.forEach(link => {
        link.classList.remove('text-slate-100', 'border-blue-400', 'border-green-400', 'border-amber-400', 'border-slate-100');
        link.classList.add('text-slate-400', 'border-transparent');
    });

    // 2. 幫你啱啱點擊嗰個 element 加返 active 樣式
    element.classList.remove('text-slate-400', 'border-transparent');
    element.classList.add('text-slate-100');

    // 根據文字內容補返對應顏色嘅底線
    const text = element.textContent.trim();
    if (text === '村莊') element.classList.add('border-blue-400');
    else if (text === '戰鬥') element.classList.add('border-green-400');
    else if (text === '背包') element.classList.add('border-amber-400');
    else if (text === '商店') element.classList.add('border-slate-100');
}

function loadPage(pageName) {
    const contentDiv = document.getElementById('main-content');

    switch(pageName) {


case 'menu_village':
            contentDiv.innerHTML = `
                <h2 class="text-2xl text-white font-bold">歡迎回到村莊</h2>
                <p class="text-slate-400 mt-2">測試版本 有咩Discord井低</p>
            `;
            break;


case 'menu_battle':
    contentDiv.innerHTML = `

<div class="border-b border-[#2d3a4f] py-2 px-4 flex items-center justify-between bg-[#0f1218] -mt-[32px] -mx-[32px] mb-5 w-[calc(100%+62px)]">
    <div class="flex items-center gap-6">
        <span class="text-[#6ee7b7] font-mono text-base font-bold tracking-[0.1em] uppercase">冒險地圖</span>
        <select id="map-selector" class="bg-[#1e293b] text-white text-base py-1 px-3 border border-[#334155] w-64 focus:border-[#6ee7b7] outline-none transition-colors">
            <option value="">--請選擇地圖--</option>
            <option value="battlemap_beginnermap">新手地圖</option>
            <option value="battlemap_gosuCave">高手洞穴</option>
	    <option value="battlemap_mtHalla">漢拏山</option>
            <option value="battlemap_geojeUnderseaTunnel">巨濟海底洞穴</option>
	    <option value="battlemap_evilLake">千年湖</option>
	    <option value="battlemap_test">測試地圖</option>
        </select>



	<select id="floor-selector" class="hidden bg-[#1e293b] text-white text-base py-1 px-3 border border-[#334155] w-64 ml-2">
   		<option value="">-請選擇樓層-</option>
	</select>
    </div>


    <div class="text-[9px] text-[#475569] font-mono tracking-widest uppercase italic">System Ready</div>
</div>

<div class="flex gap-3 h-[530px] p-3 bg-[#0f1218]">

    <div class="flex flex-col flex-[3] gap-3">
        <div class="flex-[3] border border-[#2d3a4f] bg-[#131720] p-4 relative group">
            <h3 class="text-[#6ee7b7] text-[10px] uppercase tracking-[0.2em] mb-4 border-b border-[#2d3a4f] pb-2">Battle</h3>

<div id="enemy-display" class="w-3/4 flex gap-4 p-4 border border-[#2d3a4f] bg-[#1a1e28] rounded-lg">
    <div id="enemy-slot-1" class="flex-1">
        <div id="enemy-name" class="font-bold text-[#facc15] mb-2">敵人: 載入中...</div>
        <div class="w-full h-4 bg-[#0d1117] border border-[#2d3a4f] rounded overflow-hidden">
            <div id="enemy-hp-fill" class="h-full bg-[#e11d48] w-full transition-all duration-300" style="width: 100%;"></div>
        </div>
        <div id="enemy-hp" class="text-[12px] text-gray-300 mt-1">HP: 0/0</div>
    </div>

    <div id="enemy-slot-2" class="flex-1 border-l border-[#2d3a4f] pl-4 flex items-center justify-center text-gray-500">
        <span class="text-[10px]">預留欄位</span>
    </div>
</div>

<div class="absolute top-4 right-4 w-1/4 h-[90%] border-l border-[#2d3a4f] pl-4 bg-[#131720]">
        <h3 class="text-[#3b82f6] text-[10px] uppercase tracking-[0.2em] mb-4 border-b border-[#2d3a4f] pb-2">Map.Info</h3>
        <div id="battlemap-info" class="text-[11px] text-gray-400 space-y-2">
            <p>怪物：(等待數據...)</p>
            <p>掉寶：(等待數據...)</p>
        </div>
    </div>
</div>



        <div class="flex-[1] border border-[#2d3a4f] bg-[#131720] p-4">
            <h3 class="text-[#f59e0b] text-[12px] uppercase tracking-[0.2em] mb-4 border-b border-[#2d3a4f] pb-2">戰利品記錄</h3>
<div id="battlemap_log-drop" class="text-[12px] text-gray-300 space-y-1">
        <!-- 呢度會自動顯示掉落物 -->
    </div>
        </div>
    </div>


    <div class="flex flex-col flex-[1] gap-3">
        <div id="battlemap_log-area" class="flex-[2] border border-[#2d3a4f] bg-[#131720] p-4 h-48 overflow-y-auto">
            <h3 class="text-white/70 text-[12px] uppercase tracking-[0.2em] mb-4 border-b border-[#2d3a4f] pb-2">戰鬥日誌</h3>
        </div>


<div class="control-section">

<div id="battle-skill-box">
    <h4 class="section-title">技能</h4>
    <!-- 按鈕按下後觸發設定視窗 -->
    <button onclick="openSkillSettingModal()">設定隊伍技能</button>
</div>

    <div class="auto-battle-area">
        <h4 class="section-title">自動掛機系統</h4>
        <button id="auto-battle-btn" onclick="toggleAutoBattle()">開啟自動掛機</button>
    </div>
</div>





        </div>
    </div>
</div>
`;


break;

case 'menu_trainingCenter':
contentDiv.innerHTML = `
<div class="p-4 bg-[#0f0e0d] min-h-[300px] text-[#d1c7ac] font-serif border border-[#3d3625]">
    
    <!-- 頂部功能 Tab (保持簡潔) -->
    <div id="function-tabs" class="flex border-b border-[#3d3625] mb-4">
        <button onclick="switchTCTab('train', this)" class="func-btn px-4 py-2 text-[#d4af37] border-b-2 border-[#d4af37] font-bold text-sm bg-[#1a1a1a]">轉職強化</button>
        <button onclick="switchTCTab('deploy', this)" class="func-btn px-4 py-2 text-[#7a7a7a] hover:text-[#d4af37] text-sm transition-all">編隊換位</button>
        <button onclick="switchTCTab('dismiss', this)" class="func-btn px-4 py-2 text-[#7a7a7a] hover:text-[#d4af37] text-sm transition-all">解雇處理</button>
    </div>

    <!-- 內容區域 (這裡加入了 image_2.png 的內框風格) -->
    <div class="relative bg-gradient-to-br from-[#1e1c1a] to-[#0f0e0d] p-6 border border-[#4a402a] shadow-[inset_0_0_60px_rgba(0,0,0,0.7)] min-h-[200px]">
        
        <!-- 內層的細框 (模擬 image_2.png 裡面的幼細邊框) -->
        <div class="absolute inset-3 border border-[#2a2416] pointer-events-none"></div>

        <!-- 傭兵顯示區 (放在內框裡面) -->
        <div id="merc-grid" class="relative z-10 flex flex-wrap gap-3 p-2">
            <!-- JS 動態生成 11 格卡片，例如： -->
            <!-- <button class="mercenary-card w-16 h-16 bg-[#1a1a1a] border border-[#3d3625] hover:border-[#d4af37]"></button> -->
        </div>
    </div>

    <!-- 底部行動區 (按鈕靠右) -->
    <div class="flex justify-end border-t border-[#3d3625] pt-3 mt-4">

    </div>
</div>

`;



const trainBtn = document.querySelector('[onclick*="switchTCTab(\'train\'"]');
    if (trainBtn) {
        // 設定預設模式並渲染
        window.currentMode = 'train';
        renderTCmerclist();
    }



break;





case 'menu_mercenaryShop':

contentDiv.innerHTML = `
<div class="p-8 bg-[#0f0e0d] min-h-[300px] text-[#d1c7ac] font-serif">
    <!-- Tab 選單 -->
    <div id="nation-tabs" class="flex border-b border-[#3d3625] mb-1">
        <button onclick="switchNationMenu('korea', this)" class="nation-btn px-8 py-3 text-[#d4af37] border-b-2 border-[#d4af37] font-bold">朝鮮</button>
        <button onclick="switchNationMenu('japan', this)" class="nation-btn px-8 py-3 text-[#7a7a7a] hover:text-[#d4af37]">日本</button>
        <button onclick="switchNationMenu('china', this)" class="nation-btn px-8 py-3 text-[#7a7a7a] hover:text-[#d4af37]">中國</button>
        <button onclick="switchNationMenu('taiwan', this)" class="nation-btn px-8 py-3 text-[#7a7a7a] hover:text-[#d4af37]">台灣</button>
    </div>

    <div class="flex gap-6 mt-4">
        <!-- 左邊：招募列表區 -->
        <div id="nation-content" class="flex-1 bg-gradient-to-br from-[#1e1c1a] to-[#0f0e0d] p-6 border border-[#4a402a]">
            <!-- 朝鮮 -->
            <div id="korea" class="nation-tab relative">
                <h2 class="text-2xl text-[#d4af37] mb-6 border-b border-[#3d3625] pb-2">朝鮮傭兵</h2>
                <div id="merc-list-korea" class="flex flex-wrap gap-3"></div>
            </div>
            <!-- 日本 -->
            <div id="japan" class="nation-tab relative hidden">
                <h2 class="text-2xl text-[#d4af37] mb-6 border-b border-[#3d3625] pb-2">日本傭兵</h2>
                <div id="merc-list-japan" class="flex flex-wrap gap-3"></div>
            </div>
            <!-- 中國 -->
            <div id="china" class="nation-tab relative hidden">
                <h2 class="text-2xl text-[#d4af37] mb-6 border-b border-[#3d3625] pb-2">中國傭兵</h2>
                <div id="merc-list-china" class="flex flex-wrap gap-3"></div>
            </div>
            <!-- 台灣 -->
            <div id="taiwan" class="nation-tab relative hidden">
                <h2 class="text-2xl text-[#d4af37] mb-6 border-b border-[#3d3625] pb-2">台灣傭兵</h2>
                <div id="merc-list-taiwan" class="flex flex-wrap gap-3"></div>
            </div>
        </div>

        <!-- 右邊：詳細資訊 -->
        <div class="w-64">
            <div id="mercShop_mercDetails" class="p-4 bg-[#1a1a1a] border border-[#d4af37] text-[#d1c7ac]">
                <h3 id="mercShop_name" class="text-xl text-[#d4af37] font-bold">請選擇傭兵</h3>
                <p class="mt-2">招募費用: <span id="mercShop_cost" class="text-white">--</span> 金</p>
                <div class="grid grid-cols-2 gap-2 mt-4 text-sm">
                    <p>力量: <span id="mercShop_str">0</span></p>
                    <p>敏捷: <span id="mercShop_dex">0</span></p>
                    <p>體力: <span id="mercShop_vit">0</span></p>
                    <p>智力: <span id="mercShop_int">0</span></p>
                </div>
            </div>
        </div>
    </div>
    
    <button onclick="confirmRecruit()" class="mt-4 px-6 py-2 bg-[#3d3625] text-[#d4af37] border border-[#d4af37]">確認招募</button>
</div>





`;
renderNation('korea');
initRecruitmentShop();

break;


case 'menu_shop':

contentDiv.innerHTML = `
        <div class="geishang-shop-wrapper">
            <!-- 上方分頁 Tab (像巨商的國籍選擇) -->
            <div class="geishang-tabs">
                <button class="geishang-tab-btn active" onclick="renderGeishangTab('special', this)">特殊物品</button>
                <button class="geishang-tab-btn" onclick="renderGeishangTab('spirit', this)">精靈</button>
                <button class="geishang-tab-btn" onclick="renderGeishangTab('gear', this)">裝備</button>
            </div>

            <!-- 內容區域 (像巨商的傭兵資料框) -->
            <div id="geishang-shop-content" class="geishang-panel">
                <!-- 預設顯示內容 -->
                <div class="shop-item-row">
                    <span class="item-name">歡迎來到銀兩商店</span>
                </div>
                <div class="shop-item-row">
                    <span class="item-desc">請點選上方分頁</span>
                </div>
            </div>
        </div>
    `;


break;

case 'menu_barracks':

contentDiv.innerHTML = `
<div id="BarracksMainFrame" style="background: #111; border: 1px solid #333; padding: 20px; width: 95%; max-width: 1200px; margin: 20px auto; box-shadow: 0 0 10px rgba(0,0,0,0.5); box-sizing: border-box;">
    
    <div id="BarracksInnerWrapper" style="border: 1px solid #444; padding: 10px;">
        
<div id="BarracksStatusBar" style="border: 1px solid #f1c40f; color: #f1c40f; padding: 12px; margin-bottom: 10px; background: #1a1a1a; display: flex; justify-content: space-around; font-weight: bold; font-size: 15px;">
    </div>

        <div id="BarracksTabContainer" style="display: flex; gap: 5px; margin-bottom: 10px;">
            <button class="BarracksTabBtn" onclick="renderBarracksContent('mercenary')" style="background: #222; border: 1px solid #555; color: #aaa; padding: 8px 25px; cursor: pointer;">傭兵管理</button>
            <button class="BarracksTabBtn" onclick="renderBarracksContent('inventory')" style="background: #222; border: 1px solid #555; color: #aaa; padding: 8px 25px; cursor: pointer;">背包倉庫</button>
        </div>

        <div id="BarracksSubContent" style="border: 1px solid #f1c40f; min-height: 400px; padding: 20px; color: #ccc; background: #0d0d0d;">
            </div>
        
    </div>
</div>
    `;

    // 預設顯示傭兵管理
    renderBarracksContent('mercenary');
renderBarracksStatusBar();

break;





case 'menu_inventory':
contentDiv.innerHTML = `
        <div class="rpg-inv-wrapper">
            <div class="rpg-inv-party-container" id="party-tabs-container"></div>
            </div>
    `;

    // 關鍵修正：確保 DOM 已經被 Browser 寫入，先進行渲染
    setTimeout(() => {
        renderCharacterTabs();
    }, 0);

            contentDiv.innerHTML = `
<div class="rpg-inv-wrapper">


<div class="rpg-inv-party-container" id="party-tabs-container">
    </div>

<div class="rpg-inv-main-content">

<div class="rpg-inv-left-column">
    <div class="rpg-inv-profile-header">
        <div class="rpg-inv-portrait-square" id="inv-portrait"></div>
        <div class="rpg-inv-stats-container">
        <!-- 你漏咗呢個 container 嘅 closing tag </div> -->
    </div>
</div>
            

<div class="rpg-inv-left-column">
<div class="rpg-inv-equip-tabs">
    <button class="rpg-inv-btn is-active">基礎</button>
    <button class="rpg-inv-btn">外觀</button>
</div>



<div class="rpg-inv-equip-grid">
<div class="rpg-inv-slot"></div>
<div class="rpg-inv-slot"></div>
<div class="rpg-inv-slot"></div>
<div class="rpg-inv-slot"></div>
<div class="rpg-inv-slot"></div>
<div class="rpg-inv-slot"></div>
<div class="rpg-inv-slot"></div>
<div class="rpg-inv-slot"></div>
<div class="rpg-inv-slot"></div>
</div>



</div>
</div>





<div class="rpg-inv-right-column" style="display: flex; flex-direction: column;">
    <div class="rpg-inv-category-tabs">
        <button class="rpg-inv-btn is-active">全部</button>
        <button class="rpg-inv-btn">裝備</button>
        <button class="rpg-inv-btn">消耗</button>
        <button class="rpg-inv-btn">素材</button>
</div>





<div class="rpg-inv-right-content-wrapper" style="display: flex; gap: 20px; padding: 20px;"> 
                
                <!-- 【重點】一定要加返呢行，否則你寫幾多 CSS 都冇用 -->
                <div id="rpg-inv-inventory-grid"></div>





<div id="inv-char-stats-panel">
        <div id="stats-content">
            <!-- JavaScript 會自動填入內容 -->
        </div>
</div>


</div>


</div>


            `;
            break;



        // 其他 case...
        default:

            contentDiv.innerHTML = `<h2 class="text-white">敬請期待...</h2>`;
    }
}



// 網頁完全載入後，自動載入村莊
window.onload = function() {
    // 檢查是否有存檔位被選擇 (如果是從頭開始則為 null)
    if (activeSlot !== null && localStorage.getItem(`saveSlot_${activeSlot}`)) {
        loadGame(activeSlot);
    } else {
        // 如果沒有存檔，確保初始介面是 start-menu
        switchPage('start-menu');
    }
};

// ==========================================
//  右邊兵欄UI Upadte 數值
// ==========================================

// 全域變數，用嚟記住依家開緊邊個，同埋對應邊個元素
// 全域變數，多加一個 pos 嚟存儲位置
let activeMercSession = { mercId: null, element: null, fixedPos: null };

function showMercDetail(mercId, element) {
    // 1. 如果撳返同一隻，關閉
    if (activeMercSession.mercId === mercId) {
        const existing = document.getElementById('active-merc-panel');
        if (existing) existing.remove();
        activeMercSession = { mercId: null, element: null, fixedPos: null };
        return;
    }

    // 2. 撳第二隻，先清空舊的
    const existing = document.getElementById('active-merc-panel');
    if (existing) existing.remove();

    // 3. 第一次點擊時，記錄下個位置
    const rect = element.getBoundingClientRect();
    activeMercSession = { 
        mercId, 
        element, 
        fixedPos: { left: rect.right + 10, top: rect.top } 
    };

    // 4. 建立面板
    let panel = document.createElement('div');
    panel.className = 'merc-details-panel';
    panel.id = 'active-merc-panel';
    document.body.appendChild(panel);

    // 5. 初始渲染一次
    updateMercPanelContent();
}

// 呢個函數負責更新，會強制用第一次記住嘅 fixedPos
function updateMercPanelContent() {
    const panel = document.getElementById('active-merc-panel');
    const { mercId, fixedPos } = activeMercSession;
    
    if (!panel || !mercId || !fixedPos) return;

    const merc = player.mercenaries.find(m => m.id == mercId);
    if (!merc) return;

    // 設定固定位置 (使用第一次記住嘅座標)
    panel.style.position = 'fixed';
    panel.style.left = fixedPos.left + 'px';
    panel.style.top = fixedPos.top + 'px';

    // 計算 EXP
    const currentEntry = DATA.expTable.find(e => e.level === merc.level);
    const nextEntry = DATA.expTable.find(e => e.level === merc.level + 1);
    const displayExp = merc.totalExp - (currentEntry ? currentEntry.total : 0);
    const neededExp = nextEntry ? (nextEntry.total - currentEntry.total) : "MAX";
    const expP = typeof neededExp === 'number' ? (displayExp / neededExp * 100) : 100;

    // 更新 HTML
    panel.innerHTML = `
        <div class="stat-label"><span>EXP</span><span>${displayExp}/${neededExp}</span></div>
        <div class="bar-bg"><div class="exp-fill" style="width: ${expP}%"></div></div>

	<div id="merc-stats-assignment">
        <div class="stats-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px;">
            <div>力量: ${merc.stats.str} ${renderSingleButton(merc, 'str')}</div>
            <div>敏捷: ${merc.stats.dex} ${renderSingleButton(merc, 'dex')}</div>
            <div>體質: ${merc.stats.vit} ${renderSingleButton(merc, 'vit')}</div>
            <div>智力: ${merc.stats.int} ${renderSingleButton(merc, 'int')}</div>
        </div>
	</div>

    `;
}



// ==========================================
//  數據同步系統
// ==========================================

// ===============生生死死===============


// 確保呢個函數係最外層，唔好包喺任何嘢入面
window.revive = function() {
    player.status = "alive";
    window.currentEnemy = null; 
    document.getElementById('death-overlay').classList.add('hidden');
    changeMap('menu_village');

    
    // 【暴力強制 UI 切換】：
    // 唔再等 updateUI 慢慢做，直接硬改 HTML
    document.querySelector('body').classList.remove('grayscale'); // 強制移除灰階
    document.getElementById('enemy-display').innerHTML = '<div class="text-green-400">已返回村莊，戰鬥結束。</div>';
    
    navigate('menu_village', null);

    console.log("復活邏輯已走完，如果你見唔到變化，證明係 CSS 鎖死咗");
};


// UpdateUI保護機制

// 輔助函數：如果元素存在就更新，唔存在就跳過，唔好報錯
function safeSetText(id, value) {
    const el = document.getElementById(id);
    if (el) {
        el.innerText = value;
    }
}



function updateUI() {
    // 檢查浮動面板是否需要更新
    if (document.getElementById('active-merc-panel')) {
        updateMercPanelContent();
    }

    const safeSet = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.innerText = value;
    };

    // =========背包即時更新========
    const currentMercCount = player.mercenaries ? player.mercenaries.length : 0;
    if (currentMercCount !== lastMercCount) {
        if (typeof renderCharacterTabs === 'function') renderCharacterTabs();
        lastMercCount = currentMercCount;
    }

    // 1. 基礎 UI 渲染
    const gameContainer = document.getElementById('game-container');
    const deathOverlay = document.getElementById('death-overlay');
    if (player && player.status === "dead") {
        if (gameContainer) gameContainer.classList.add('grayscale', 'brightness-50', 'pointer-events-none');
        if (deathOverlay) deathOverlay.classList.remove('hidden');
    } else {
        if (gameContainer) gameContainer.classList.remove('grayscale', 'brightness-50', 'pointer-events-none');
        if (deathOverlay) deathOverlay.classList.add('hidden');
    }

    if (!player) return;

    const target = (typeof currentViewChar !== 'undefined' ? currentViewChar : null) || player;

    try {
        // --- 背包介面數值更新 ---

        // --- 主畫面玩家基礎屬性更新 ---
        const nameEl = document.getElementById('display-name');
        if (nameEl) nameEl.textContent = player.name || '無名';
        
        safeSet('stat-str', player.stats?.str ?? 0);
        safeSet('stat-dex', player.stats?.dex ?? 0);
        safeSet('stat-con', player.stats?.vit ?? 0);
        safeSet('stat-int', player.stats?.int ?? 0);
        safeSet('display-gold', (player.gold || 0).toLocaleString());
        safeSet('player-bonus', player.bonusPoints ?? 0);

        // 3. 經驗條
        const expPercent = calculateExpPercentage(player.totalExp, player.level);
        safeSet('player-exp-text', `${Math.floor(expPercent)}%`);
        const expBarMain = document.getElementById('player-exp-bar');
        if (expBarMain) expBarMain.style.width = `${expPercent}%`;

        // 4. 血條與魔條 (主畫面專用)
        const currentHp = player.combat?.hp ?? 0;
        const maxHp = player.combat?.maxHp ?? 1;
        const hpBarMain = document.getElementById('player-hp-bar');
        if (hpBarMain) {
            hpBarMain.style.width = `${(currentHp / maxHp) * 100}%`;
            safeSet('player-hp-text', `${currentHp}/${maxHp}`);
        }

        const currentMp = player.combat?.mp ?? 0;
        const maxMp = player.combat?.maxMp ?? 1;
        const mpBarMain = document.getElementById('player-mp-bar');
        if (mpBarMain) {
            mpBarMain.style.width = `${(currentMp / maxMp) * 100}%`;
            safeSet('player-mp-text', `${currentMp}/${maxMp}`);
        }

        // 5. 戰鬥怪物資訊 (保留原本的敵人血條更新邏輯，刪除了 battlemap-info 的 HTML 生成)
        const enemy = (typeof currentEnemy !== 'undefined') ? currentEnemy : null;
        const enemyNameEl = document.getElementById('enemy-name');
        const enemyHpEl = document.getElementById('enemy-hp');
        const enemyHpBar = document.getElementById('enemy-hp-fill');
        const enemyArea = document.getElementById('enemy-display');
        const mapData = DATA.maps[currentMapId];

        if (mapData?.type === 'safe') {
            if (enemyArea) enemyArea.innerHTML = `<p class="text-green-500">這裡很安全，不用戰鬥。</p>`;
        } else if (enemy) {
            if (enemyNameEl) enemyNameEl.innerText = `敵人: ${enemy.name}`;
            if (enemyHpEl) enemyHpEl.innerText = `HP: ${enemy.hp} / ${enemy.maxHp}`;
            if (enemyHpBar && enemy.maxHp > 0) enemyHpBar.style.width = (enemy.hp / enemy.maxHp * 100) + "%";
        } else {
            if (enemyNameEl) enemyNameEl.innerText = "無目標";
            if (enemyHpEl) enemyHpEl.innerText = "HP: 0/0";
            if (enemyHpBar) enemyHpBar.style.width = "0%";
        }
        
    } catch (e) {
        console.error("UI 更新失敗 (已捕獲):", e);
    }
    
    if (typeof updateMercenaryUI === 'function') {
        updateMercenaryUI();
    }
    openInventoryView();
}

// ==========================================
// 9. 戰鬥地圖切換及怪物系統
// ==========================================

function setupMapSelector() {
    const mapSelector = document.getElementById('map-selector');
    const floorSelector = document.getElementById('floor-selector');
    
    if (mapSelector) {
        mapSelector.removeEventListener('change', onMapChange);
        mapSelector.addEventListener('change', onMapChange);
        
        if (floorSelector) {
            floorSelector.removeEventListener('change', onFloorChange);
            floorSelector.addEventListener('change', onFloorChange);
        }
    } else {
        setTimeout(setupMapSelector, 500);
    }
}

// 3. 將個處理函數獨立出來
function onMapChange(e) {
    const mapId = e.target.value;
    const floorSelector = document.getElementById('floor-selector');
    
    if (!mapId) {
        changeMap(mapId);
        floorSelector.classList.add('hidden');
        floorSelector.innerHTML = '';
        return;
    }

    const mapData = DATA.maps[mapId];

    if (mapData && mapData.floors && mapData.floors.length > 0) {
        // 顯示樓層選單，暫時唔好執行 changeMap
        floorSelector.innerHTML = '<option value="">-請選擇樓層-</option>';
        mapData.floors.forEach(f => {
            floorSelector.innerHTML += `<option value="${f.id}">${f.name}</option>`;
        });
        floorSelector.classList.remove('hidden');
    } else {
        // 無樓層先直接執行
        floorSelector.classList.add('hidden');
        floorSelector.innerHTML = '';
        changeMap(mapId);
    }
}

function onFloorChange(e) {
    const floorId = e.target.value;
    if (!floorId) return;

    for (const key in DATA.maps) {
        const map = DATA.maps[key];
        if (map.floors) {
            const floor = map.floors.find(f => f.id === floorId);
            if (floor) {
                // 同步 ID 同 數據
                window.currentMapId = floorId;
                window.activeFloorData = floor; 
                
                console.log("已切換至:", floor.name);
                changeMap(key); 
                return;
            }
        }
    }
}




// 呢段係專屬你 DATA 結構的更新函數
// 用呢個方法將所有野包住，確保 HTML Load 晒先執行
document.addEventListener('DOMContentLoaded', () => {
    

function updateMapInfo() {
    const selector = document.getElementById('map-selector');
    if (!selector) return;

    const mapKey = selector.value;
    const mapData = DATA.maps[mapKey];
    if (!mapData || !mapData.monsters) return;

    const monsterId = mapData.monsters[0];
    const monsterData = DATA.monsters[monsterId];

    // 2. 更新左邊 BATTLE 區 (你想要出怪物嘅位)
    // 假設你原本 Battle 嗰區個 ID 叫 battle-display
    const battleArea = document.querySelector('.group'); // 根據你 HTML，這應該是 BATTLE 的容器
    // 或者如果你想指定位置，請確保 HTML 有 ID，例如 id="battle-display"
    
    // 這裡我直接用你 HTML 結構裡面的那個容器來顯示
    const battleDisplay = document.getElementById('enemy-display'); 
    if (battleDisplay) {
        battleDisplay.innerHTML = `
            <div class="text-white text-xl">
                正在戰鬥中：${monsterData.name}
                <br>HP: ${monsterData.hp} / ${monsterData.hp}
            </div>
        `;
    }
}

    // 綁定事件
    const selector = document.getElementById('map-selector');
    if (selector) {
        selector.addEventListener('change', updateMapInfo);
        updateMapInfo(); // 初始化
    }
});
if (typeof setupMapSelector === 'function') {
    setupMapSelector();
}

// ==========================================
// 戰鬥系統UI更新
// ==========================================

// =============傭兵加點==============
function addMercenaryStat(mercId, attr) {
    const merc = player.mercenaries.find(m => m.id === mercId);
    
    // 檢查點數是否充足
    if (merc && merc.bonusPoints > 0) {
        merc.stats[attr]++;
        merc.bonusPoints--; 
        
        // 確保數據已更新
        updateCharacterStats(merc);

        // 刷新 UI
        updateMercenaryUI();
        
        const statsAssignmentDiv = document.getElementById('merc-stats-assignment'); 
        if (statsAssignmentDiv) {
            renderMercStatsAssignment(merc); 
        }

        renderStatsPanel(merc);

        // --- 【核心優化：點數用完時強制斬斷】 ---
        // 只要加完點後發現無晒點，即刻執行 stopHoldAdd()
        if (merc.bonusPoints <= 0) {
            console.log("點數耗盡，強制停止連續加點。");
            stopHoldAdd(); 
        }
    } else {
        // 如果進來時就已經沒點了，也順便停掉，防止意外
        stopHoldAdd();
    }
}

function renderSingleButton(merc, statName) {
    if (!merc.bonusPoints || merc.bonusPoints <= 0) return '';
    
    // 綁定三個事件：按住、鬆手、移出範圍，全部都會觸發停機邏輯
    return `
        <button 
            onmousedown="startHoldAdd('${merc.id}', '${statName}')" 
            onmouseup="stopHoldAdd()" 
            onmouseleave="stopHoldAdd()"
            class="bg-blue-600 px-2 rounded text-white text-xs ml-2">
            +
        </button>
    `;
}

let holdInterval = null;

// 通用版 startHoldAdd
function startHoldAdd(targetId, attr) {
    // 判斷係咪 Player
    const isPlayer = (targetId === 'player');
    
    // 第一次先手動呼叫一次 (睇你係點緊邊個)
    if (isPlayer) {
        addStat(attr); 
    } else {
        addMercenaryStat(targetId, attr);
    }
    
    // 開始 Loop
    holdInterval = setInterval(() => {
        if (isPlayer) {
            // Player 檢查點數
            if (player.points <= 0) { stopHoldAdd(); return; }
            addStat(attr);
        } else {
            // Mercenary 檢查點數
            const merc = player.mercenaries.find(m => m.id === targetId);
            if (!merc || merc.bonusPoints <= 0) { stopHoldAdd(); return; }
            addMercenaryStat(targetId, attr);
        }
    }, 100); 
}

function stopHoldAdd() {
    if (holdInterval) {
        clearInterval(holdInterval);
        holdInterval = null;
    }
}

// 寫好呢個函數，擺喺你原本嘅 JS 入面
function renderMercStatsAssignment(merc) {
    const container = document.getElementById('merc-stats-assignment');
    if (!container) return; // 安全檢查，搵唔到 div 就唔好行

    container.innerHTML = `
        <div class="stats-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px;">
            <div>力量: ${merc.stats.str} ${renderSingleButton(merc, 'str')}</div>
            <div>敏捷: ${merc.stats.dex} ${renderSingleButton(merc, 'dex')}</div>
            <div>體質: ${merc.stats.vit} ${renderSingleButton(merc, 'vit')}</div>
            <div>智力: ${merc.stats.int} ${renderSingleButton(merc, 'int')}</div>
        </div>
    `;
}

// ============戰鬥畫面怪物UI===================

function updateBattleUI() {


if (!currentEnemy) {
        //console.trace("邊個叫我變 0%？"); // 喺 Console 睇 trace，睇下係邊個 function 觸發
    }
    // 檢查元素是否在 DOM 中
    const enemyNameEl = document.getElementById('enemy-name');
    const enemyHpEl = document.getElementById('enemy-hp');
    const hpBar = document.getElementById('enemy-hp-fill');
    
    // 如果這三個元素其中任何一個不見了，直接忽略，什麼都不做
    if (!enemyNameEl || !enemyHpEl || !hpBar) {
        return; 
    }

    // 防護：檢查 currentEnemy
    if (!currentEnemy) {
        enemyNameEl.innerText = "敵人: 無";
        enemyHpEl.innerText = "HP: 0 / 0";
        hpBar.style.width = "0%";
        return;
    }

    // 更新內容
    enemyNameEl.innerText = `敵人: ${currentEnemy.name}`;
    enemyHpEl.innerText = `HP: ${currentEnemy.hp} / ${currentEnemy.maxHp}`;
    
    // 更新血條長度 (檢查一下 maxHp 是否大於 0 防止除以 0)
    const maxHp = currentEnemy.maxHp || 1; 
    const percent = Math.max(0, Math.min(100, (currentEnemy.hp / maxHp) * 100));
    hpBar.style.width = percent + "%";
}


/**
 * @param {string} containerId - 你想加入嘅 div ID (例如 'battle-log' 或 'loot-log')
 * @param {string} message - 要顯示嘅文字
 */
function addLog(containerId, message) {
    // 戰鬥地圖限制檢查
    if (containerId === 'battlemap_log-area') {
        const currentMap = DATA.maps[currentMapId];
        if (!currentMap || currentMap.type !== 'battle') {
            return;
        }
    }

    const logArea = document.getElementById(containerId);
    if (!logArea) {
        setTimeout(() => addLog(containerId, message), 100);
        console.warn(`找不到 ID 為 ${containerId} 的容器！`);
        return;
    }

    // 注入捲軸樣式 (只會執行一次)
   if (!document.getElementById('styled-scrollbar')) {
        const style = document.createElement('style');
        style.id = 'styled-scrollbar';
        style.innerText = `
            /* 這兩個容器固定高度，確保不走位 */
            #battlemap_log-area, #battlemap_log-drop {
                height: 60px;        /* 根據你 2 條 log 的高度來調，假設每條 30px */
                overflow-y: auto;    /* 內容超出即顯示捲軸 */
            }

            ::-webkit-scrollbar { width: 6px; background-color: transparent; }
            ::-webkit-scrollbar-thumb { border-radius: 10px; background: linear-gradient(180deg, #60a5fa, #c084fc); }
            ::-webkit-scrollbar-thumb:hover { background: linear-gradient(180deg, #93c5fd, #d8b4fe); }
        `;
        document.head.appendChild(style);
    }

    // 插入新訊息
    logArea.insertAdjacentHTML('beforeend', `<p class="text-[12px] text-white p-1 border-b border-gray-800">${message}</p>`);

    // 動態限制數量 (由你建議的配置決定)
    const limits = {
        'battlemap_log-area': 50,
        'battlemap_log-drop': 10,
        'default': 10
    };
    const maxLogs = limits[containerId] || limits['default'];

    while (logArea.children.length > maxLogs) {
        logArea.removeChild(logArea.firstChild); 
    }

    // 自動捲動
    logArea.scrollTop = logArea.scrollHeight;
}

function selectSkill(skillId) {
    selectedSkillId = skillId;
    console.log("已選取技能:", skillId);
    
    // 選項視覺反饋 (加埋呢段，你個按鈕撳完會變色)
    const buttons = document.querySelectorAll('#skill-buttons button');
    buttons.forEach(btn => {
        // 簡單判斷：睇下個按鈕個 onclick 字串入面有無嗰個 skillId
        if (btn.getAttribute('onclick').includes(skillId)) {
            btn.style.backgroundColor = "#3b82f6"; // 選中變藍色
            btn.style.color = "white";
        } else {
            btn.style.backgroundColor = ""; // 未選還原
            btn.style.color = "";
        }
    });
}

window.handleAttack = function() {
    // 1. 檢查同防護
    if (!selectedSkillId) { alert("請先選擇一招技能！"); return; }
    if (!currentEnemy || currentEnemy.hp <= 0) return;

    // 2. 透過「點名官」拎到出戰名單
    const attackers = getTeamQueue(); 

    // 3. 順序執行：大家一齊打
    attackers.forEach((action, index) => {
        setTimeout(() => {
            if (currentEnemy && currentEnemy.hp > 0) {
                useSkill(action.unit, action.skillId, currentEnemy);
                
                // 【加入呢度】：每個人攻擊完，都更新一次 UI
                updateBattleUI(); 
            }
        }, index * 400); 
    });

    // 4. 怪物反擊
    setTimeout(() => {
        if (currentEnemy && currentEnemy.hp > 0) {
            monsterTurn();
            
            // 【加入呢度】：怪物反擊完，更新一次 UI (顯示玩家角色 HP 變動)
            updateBattleUI(); 
        }
    }, attackers.length * 400 + 200);
}

// 這是外掛的「點名官」函數
function getTeamQueue() {
    let queue = [];
    
    // 玩家：繼續用玩家揀嗰招
    if (player.status !== "dead") {
        queue.push({ unit: player, skillId: selectedSkillId });
    }
    
    // 傭兵：佢哋用自己嘅「招牌技」(假設每個傭兵都有一個 skills 陣列)
    player.mercenaries.forEach(merc => {
        if (merc.status !== "dead") {
            // 拎傭兵第一招技，如果冇就預設用普攻(假設 id 係 'attack')
            let mercSkillId = (merc.skills && merc.skills.length > 0) ? merc.skills[0] : 'attack';
            queue.push({ unit: merc, skillId: mercSkillId });
        }
    });
    
    return queue;
}

let selectedSkillId = null;

function renderSkillButtons() {
    const container = document.getElementById('skill-buttons');
    container.innerHTML = ''; 

    player.skills.forEach(skillId => {
        const skill = DATA.skills[skillId];
        const btn = document.createElement('button');
        btn.innerText = skill.name;
        
        // 樣式：揀咗變黃色
        btn.className = (selectedSkillId === skillId) ? "bg-yellow-600" : "bg-blue-600";

        btn.onclick = () => {
            selectedSkillId = skillId; // 記低個 ID
            renderSkillButtons();      // 刷新按鈕顏色
            console.log("你選取了:", skill.name);
        };
        container.appendChild(btn);
    });
}


//==============勝利與戰鬥流程控制==================

// 這個函數回傳「目前該兵種的等級上限」
function getLevelCap(merc) {
    if (merc.is260Unlocked) return 260;
    return 250;
}


// 1. 定義一個戰鬥狀態鎖
function handleVictory() {

    console.log("現在檢查戰鬥對象:", currentEnemy); 
    
    if (document.getElementById('active-merc-panel')) {
       updateMercPanelContent();
    }
    if (!currentEnemy) {
        console.error("警告：handleVictory 執行時 currentEnemy 已經係空！");
        return; // 呢度直接停止，唔好再跑下面，避免再報 error
    }


    // 1. 處理戰鬥結束後的獎勵
    addLog('battlemap_log-area', `擊敗了 ${currentEnemy.name}！獲得經驗 ${currentEnemy.exp}！`);
    
    // --- 掉寶掉錢結算 (新加入) ---
    // 將 currentEnemy.id 傳入去處理掉寶
    handleDrops(currentEnemy.id); 
    // ----------------------------
    
    const rewardExp = currentEnemy.exp || 100;
    
    // --- 主角加經驗 (加入等級上限判斷) ---
    // 防呆：確保主角有 is260Unlocked 屬性
    if (player.is260Unlocked === undefined) player.is260Unlocked = false;
    const playerCap = player.is260Unlocked ? 260 : 250;
    
    if (player.level < playerCap) {
        player.totalExp += rewardExp;
    }
    
    // --- 傭兵加經驗 (加入等級上限判斷) ---
    if (player.mercenaries && player.mercenaries.length > 0) {
        player.mercenaries.forEach(merc => {
            if (merc.combat.hp > 0) {
                // 防呆：確保每隻兵都有 is260Unlocked 屬性
                if (merc.is260Unlocked === undefined) merc.is260Unlocked = false;
                
                // 定義上限：有解鎖就 260，冇就 250
                const mercCap = merc.is260Unlocked ? 260 : 250;

                // 只有未到上限先加 EXP
                if (merc.level < mercCap) {
                    merc.totalExp += rewardExp;
                }
            }
        });
    }
    
    // 執行系統更新
    performSystemUpdate();

    // 2. 關鍵：把怪物變做 null
    currentEnemy = null;
    
    // 3. 更新 UI (一定要擺最後，咁樣玩家先會見到背包更新左)
    updateBattleUI();
}

// 全域變數，紀錄玩家喺邊個地圖

// 全域玩家傭兵數值更新
function refreshAllStats() {
    updateCharacterStats(player); // 處理主角
    if (Array.isArray(player.mercenaries)) {
        player.mercenaries.forEach(merc => updateCharacterStats(merc)); // 處理所有傭兵
    }
    console.log("全隊數值已同步完畢");
}

// ==========================================
//  背包UI渲染
// ==========================================

// ==========================================
// 測試區
// ==========================================
