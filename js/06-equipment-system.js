function equipItemWithCurrent(itemId, slot) {
    if (!currentViewChar) {
        alert("請先選擇一個角色！");
        return;
    }
    
    const itemIndex = player.inventory.findIndex(i => i.id === itemId);
    if (itemIndex === -1) {
        console.error("搵唔到呢件裝備");
        return;
    }

    const originalItem = player.inventory[itemIndex];
    
    // 1. 處理槽位
    const targetSlot = slot || (Array.isArray(originalItem.type) ? originalItem.type[0] : originalItem.type);

    // 2. 職業檢查
    const classTypes = originalItem.classType || ["all"];
    const isGeneral = classTypes.includes("all");
    const isCompatible = isGeneral || classTypes.includes(currentViewChar.classType);
    
    if (!isCompatible) {
        alert("此職業無法裝備該道具！");
        return;
    }

    // --- 【修正版：改用你既有嘅 'lv' 屬性做檢查】 ---
    const requiredLv = originalItem.lv || 0; 
    if (currentViewChar.level < requiredLv) {
        alert(`裝備失敗：需要等級 ${requiredLv}，你目前等級只有 ${currentViewChar.level}！`);
        return;
    }
    // ------------------------------------------

    // 3. 卸下舊裝備前嘅邏輯... (其餘部分保持不變)
    if (targetSlot === 'weapon' && currentViewChar.equipment.weapon) {
        const oldWeaponData = DATA.items[currentViewChar.equipment.weapon.id];
        if (oldWeaponData && oldWeaponData.skills) {
            currentViewChar.skills = currentViewChar.skills.filter(s => !oldWeaponData.skills.includes(s));
        }
    }

    if (currentViewChar.equipment[targetSlot]) {
        unequipItem(currentViewChar.id || 'player', targetSlot);
    }

    const equipItemObj = { ...originalItem, count: 1 };
    currentViewChar.equipment[targetSlot] = equipItemObj;

    if (targetSlot === 'weapon' && originalItem.skills) {
        originalItem.skills.forEach(skillId => {
            if (!currentViewChar.skills.includes(skillId)) {
                currentViewChar.skills.push(skillId);
            }
        });
        currentViewChar.skills = [...new Set(currentViewChar.skills)];
    }

    if (originalItem.count && originalItem.count > 1) {
        originalItem.count -= 1;
    } else {
        player.inventory.splice(itemIndex, 1);
    }
    
    updateEquipmentStats(currentViewChar); 
    renderEquipmentUI(currentViewChar);
    updateCharacterStats(currentViewChar); 
    renderStatsPanel(currentViewChar);
    renderInventory();
    closeDetail();
    
    console.log(`成功裝備 ${originalItem.name} 到 ${targetSlot}`);
}



function renderEquipmentUI(merc) {
    const grid = document.querySelector('.rpg-inv-equip-grid');
    if (!grid) return;

    const slots = ['charm', 'head', 'glove', 'weapon', 'body', 'belt', 'ring1', 'boots', 'ring2'];
    const slotDivs = grid.querySelectorAll('.rpg-inv-slot');

    slots.forEach((slotName, index) => {
        if (slotDivs[index]) {
            const item = merc.equipment[slotName];
            
            // --- 修改點：判斷有無圖 ---
            if (item) {
                // 如果有 icon 就顯示圖片，冇就顯示文字 (item.name)
                const displayContent = item.icon 
                    ? `<img src="${item.icon}" style="width: 100%; height: 100%; object-fit: contain;">` 
                    : item.name;
                
                slotDivs[index].innerHTML = `<div class="item-icon">${displayContent}</div>`;
            } else {
                // 冇裝備時清空
                slotDivs[index].innerHTML = '';
            }
            
            // 綁定點擊事件 (邏輯保持不變)
            slotDivs[index].onclick = () => {
                const currentItem = merc.equipment[slotName];
                if (currentItem) {
                    unequipItem(merc.id || 'player', slotName);
                } else {
                    console.log(`位置 ${slotName} 目前是空的`);
                }
            };
        }
    });
}



// ==========除裝============

function unequipItem(charId, slot) {
    let char = (charId === 'player') ? player : player.mercenaries.find(m => m.id === charId);
    if (!char || !char.equipment[slot]) return;

    const itemToUnequip = char.equipment[slot];

    // --- 終極穩定版：技能移除邏輯 ---
    if (slot === 'weapon') {
        // 直接由 DATA.items 用 ID 撈，如果撈唔到，睇下 itemToUnequip 本身有無 skills
        const weaponData = DATA.items[itemToUnequip.id] || itemToUnequip;
        
        console.log("正在卸下，準備移除技能，武器數據:", weaponData);
        
        if (weaponData && weaponData.skills && Array.isArray(weaponData.skills)) {
            console.log("移除前技能池:", char.skills);
            console.log("目標移除技能:", weaponData.skills);
            
            // 使用 filter 進行精準移除
            char.skills = char.skills.filter(s => !weaponData.skills.includes(s));
            
            console.log("移除後技能池:", char.skills);
        } else {
            console.warn("注意：無法從 DATA.items 或裝備屬性中找到技能資料，請確認該裝備是否正確定義了 'skills' 陣列。");
            // 兜底方案：如果你確定把武係 wood_sword_advance，強制清除
            if (itemToUnequip.id === 'wood_sword_advance') {
                char.skills = char.skills.filter(s => s !== 'energy_blast' && s !== 'normal_strike');
                console.log("已執行兜底方案清理木棒技能");
            }
        }
    }
    // --------------------------------

    // 把裝備放回背包
    const existingItem = player.inventory.find(i => i.id === itemToUnequip.id);
    if (existingItem) {
        existingItem.count = (existingItem.count || 1) + 1;
    } else {
        itemToUnequip.count = 1;
        player.inventory.push(itemToUnequip);
    }
    
    // 從裝備欄移除
    delete char.equipment[slot];

    // 重算屬性並刷新 UI
    updateEquipmentStats(currentViewChar); 
    renderEquipmentUI(currentViewChar);
    updateCharacterStats(currentViewChar); 
    renderStatsPanel(currentViewChar);
    renderInventory();
    
    
    console.log(`已成功卸下 ${slot}: ${itemToUnequip.name}`);
}

