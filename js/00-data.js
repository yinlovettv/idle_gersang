/* 傭兵格式備忘 (每個新兵都要 check):
   { name, classType, level, totalExp, bonusPoints, attribute, stats, equipment, combat, skills, status }
*/

// ==========================================
// 遊戲資料庫 (角色創始化)
// ==========================================

const playerTemplate = {
    name: "",
    baseId: "player_0",
    gender: "male",
    attribute: "none",
    credit: 0,
    sunziBooksUsed: 0,
    gold: 50000,
    level: 1,
    totalExp: 0,
    bonusPoints: 0,
    isPlayer: true,
    stats: { str: 10, dex: 10, vit: 10, int: 10 },
    defaultSkill: ["normal_strike"],
    skills: ["normal_strike"],
    spiritSlot: null,
    equipment: {
    charm: null, head: null, glove: null,
    weapon: null, body: null, belt: null,
    ring1: null, boots: null, ring2: null,

    lDeco1: null, lDeco2: null, lDeco3: null, lDeco4: null, lDeco5: null,
    rDeco6: null, rDeco7: null, rDeco8: null, rDeco9: null
    },
    combat: { hp: 10, maxHp: 10, mp: 10, maxMp: 10, atk: [0, 0], def: 0, mdef: 0, critRate: 0, physRes: 0, magRes: 0,attributeValue: 0 },

    equipmentStat: { 
    str: 0, dex: 0, vit: 0, int: 0, 
    atk: 0, def: 0, physRes: 0, magRes: 0, 
    critRate: 0, attributeValue: 0 
    },

    promotion: {
        level: 0,          // 0, 1, 2
        unlockedSkills: [] // 存放已解鎖的技能 ID
    },
    promotionBonus:0,
    classType: "mainplayer",
    mercenaries: [],
    inventory: [],

    barracks: {
    mercenaries: [], // 休息的兵
    items: []        // 倉庫裡的裝備/材料
              },

    progress: {
        currentNation: "japan",
        currentCycleQuests: []
    },
    specialAbility: null,
    is260Unlocked: false,
    buffs:[],
    status: "alive"
};

const mercenaryTemplate = {
    id:"",
    baseId: "",	
    name: "",
    level: 1,
    rank: 0,
    mercNation: "japan",
    totalExp: 0,
    bonusPoints: 0,
    role: "soldier",
    classType: "warrior",
    attribute: "none",
    stats: { str: 10, dex: 10, vit: 10, int: 10 },
    equipment: {
    charm: null, head: null, glove: null,
    weapon: null, body: null, belt: null,
    ring1: null, boots: null, ring2: null,

    lDeco1: null, lDeco2: null, lDeco3: null, lDeco4: null, lDeco5: null,
    rDeco6: null, rDeco7: null, rDeco8: null, rDeco9: null
    },
    combat: { hp: 10, maxHp: 10, mp: 10, maxMp: 10, atk: [0, 0] , def: 0, mdef: 0, critRate: 0, physRes: 0, magRes: 0 ,attributeValue: 0 },
    equipmentStat: { 
    str: 0, dex: 0, vit: 0, int: 0, 
    atk: 0, def: 0, physRes: 0, magRes: 0, 
    critRate: 0, attributeValue: 0 
    },
    defaultSkill: [],
    skills: [],
    status: "alive",
    specialAbility: null,
    buffs: [],
    promotionBonus:0,
    is260Unlocked: false,
    icon:""
};


// ==========================================
// 遊戲資料庫 (Data,玩家,物件,怪物,技能,等)
// ==========================================


const DATA = {
    // 遊戲機制規則

rules: {
        mercenaryLimits: {
	    soldier   : { base: 11, name: '士兵' },
            general   : { base: 3 , generalbonusLimit: 4, name: '將帥' },
            king      : { base: 1 , bonusLimit: 0, name: '天王' },
            underworld: { base: 3 , bonusLimit: 0, name: '冥王' }
        },
        totalSlots: 11
    },
    
monsters: {

    "bandit2": { 
        name: "手然_俾大家測試傷害", hp: 28000000, atk: 20, def: 12 ,attribute: "none",attributeValue: 0, physRes: 0, magRes: 120, 
	exp: 10, 
	type:"ground",
	role: "monster",
        skillPool: [
                   { id: "monsterBasic_slash", chance: 0.7 },   // 70% 機率用普攻
                   { id: "monsterBasic_inferno", chance: 0.3 },  // 30% 機率用煉獄術
                  ],
	drops: [
    		{ type: "gold", chance: 0.95, amount: 100000 } // 80%掉率
	       ],
    },


    "chawoo": {
        name: "喬喬狗", hp: 52, atk: 15, def: 23, attribute: "none",attributeValue: 0, physRes: 0, magRes: 0,
 	exp: 15,
        type:"ground",
	role: "monster",
        skillPool: [
                   { id: "monsterBasic_slash", chance: 1 },   // 70% 機率用普攻
                  ],
	drops: [
    		{ type: "gold", chance: 0.88, amount: 12 }, // 80%掉率
    		{ type: "item", itemId: "wood_sword_normal", chance: 0.12, amount: 1 }, // 20%掉率
	       ],
    },

    "deer": { 
        name: "鹿", hp: 28, atk: 15, def: 12, attribute: "none",attributeValue: 0, physRes: 0, magRes: 0, 
	exp: 8,
	type:"ground",
	role: "monster",
        skillPool: [
                   { id: "monsterBasic_slash", chance: 1 },   // 70% 機率用普攻  // 30% 機率用煉獄術
                  ],
	drops: [
    		{ type: "gold", chance: 0.88, amount: 14 }, // 80%掉率
    		{ type: "item", itemId: "glove_001", chance: 0.12, amount: 1 }, // 20%掉率
	       ],
    },

    "bandit": { 
        name: "山賊", hp: 28, atk: 10, def: 12,attribute: "none",attributeValue: 0, physRes: 50, magRes: 0, 
	exp: 10, 
	type:"ground",
	role: "monster",
        skillPool: [
                   { id: "monsterBasic_slash", chance: 1 },   // 70% 機率用普攻  // 30% 機率用煉獄術
                  ],
	drops: [
    		{ type: "gold", chance: 0.88, amount: 11 }, // 80%掉率
    		{ type: "item", itemId: "head_001", chance: 0.12, amount: 1 }, // 20%掉率
	       ],
    },


    "butterfly": { 
        name: "毒蛾", hp: 28, atk: 10, def: 12,attribute: "none",attributeValue: 0, physRes: 0, magRes: 0, 
	exp: 10, 
	type: "air",
	role: "monster",
        skillPool: [
                   { id: "monsterBasic_slash", chance: 1 },   // 70% 機率用普攻  
                  ],
	drops: [
    		{ type: "gold", chance: 0.88, amount: 16 }, // 80%掉率
    		{ type: "item", itemId: "boots_001", chance: 0.12, amount: 1 }, // 20%掉率
	       ], 
    },


// mtHalla 漢拏山

    "mtHalla_frog": { 
        name: "毒蟾蜍", hp: 116, atk: 32, def: 31,attribute: "none",attributeValue: 0, physRes: 0, magRes: 0, 
	exp: 45, 
	type: "ground", 
	role: "monster",
        skillPool: [
                   { id: "monsterBasic_slash", chance: 1 },   // 70% 機率用普攻  
                  ],
	drops: [
    		{ type: "gold", chance: 0.88, amount: 89 }, // 80%掉率
    		{ type: "item", itemId: "ring_001", chance: 0.08, amount: 1 },// 20%掉率
		{ type: "item", itemId: "body_002", chance: 0.12, amount: 1 },
	       ], 
    },

    "mtHalla_dokkaebi": { 
        name: "獨角鬼", hp: 196, atk: 46, def: 55,attribute: "none",attributeValue: 0, physRes: 0, magRes: 0, 
	exp: 45, 
	type:"ground", 
	role: "monster",
        skillPool: [
                   { id: "monsterBasic_slash", chance: 1 },   // 70% 機率用普攻  
                  ],
	drops: [
    		{ type: "gold", chance: 0.9, amount: 137 }, // 80%掉率
    		{ type: "item", itemId: "boots_002", chance: 0.15, amount: 1 },// 20%掉率
		{ type: "item", itemId: "ring_002", chance: 0.10, amount: 1 }, 
	       ], 
    },

    "mtHalla_haruBang": { 
        name: "石娃娃", hp: 456, atk: 78, def: 92,attribute: "none",attributeValue: 0, physRes: 40, magRes: 0, 
	exp: 110, 
	type:"ground", 
	role: "monster",
        skillPool: [
                   { id: "monsterBasic_slash", chance: 1 },   // 70% 機率用普攻  
                  ],
	drops: [
    		{ type: "gold", chance: 0.9, amount: 337 }, // 80%掉率
    		{ type: "item", itemId: "boots_003", chance: 0.15, amount: 1 },// 20%掉率
		{ type: "item", itemId: "ring_003", chance: 0.10, amount: 1 }, 
	       ], 
    },

    "mtHalla_goldDragon": { 
        name: "黃龍", hp: 2000, atk: 244, def: 261,attribute: "none",attributeValue: 0, physRes: 150, magRes: 80, 
	exp: 1300, 
	type:"air", 
	role: "monster",
        skillPool: [
                   { id: "monsterBasic_slash", chance: 0.7 },   // 70% 機率用普攻
                   { id: "monsterBasic_inferno", chance: 0.3 },   // 70% 機率用普攻  
                  ],
	drops: [
    		{ type: "gold", chance: 0.9, amount: 1337 }, // 80%掉率
    		{ type: "item", itemId: "bow_002_advance", chance: 0.08, amount: 1 },// 20%掉率
		{ type: "item", itemId: "ring_004", chance: 0.15, amount: 1 }, 
	       ], 
    },

// 巨濟海底洞

    "geojeUnderseaTunnel_bat": { 
        name: "蝙蝠", hp: 80, atk: 16, def: 21,attribute: "none",attributeValue: 0, physRes: 0, magRes: 0, 
	exp: 55, 
	type: "air",
	role: "monster",
        skillPool: [
                   { id: "monsterBasic_slash", chance: 1 },   // 70% 機率用普攻  
                  ],
	drops: [
    		{ type: "gold", chance: 0.8, amount: 58 }, // 80%掉率
    		{ type: "item", itemId: "ring_001", chance: 0.12, amount: 1 }, // 20%掉率
	       ], 
    },

    "geojeUnderseaTunnel_frog": { 
        name: "毒蟾蜍", hp: 116, atk: 32, def: 31,attribute: "none",attributeValue: 0, physRes: 0, magRes: 0, 
	exp: 45, 
	type: "ground", 
	role: "monster",
        skillPool: [
                   { id: "monsterBasic_slash", chance: 1 },   // 70% 機率用普攻  
                  ],
	drops: [
    		{ type: "gold", chance: 0.88, amount: 89 }, // 80%掉率
    		{ type: "item", itemId: "ring_001", chance: 0.08, amount: 1 },// 20%掉率
		{ type: "item", itemId: "body_002", chance: 0.12, amount: 1 },
	       ], 
    },

    "geojeUnderseaTunnel_seahorse": { 
        name: "海馬", hp: 320, atk: 213, def: 63,attribute: "none",attributeValue: 0, physRes: 10, magRes: 10, 
	exp: 100, 
	type: "ground", 
	role: "monster",
        skillPool: [
                   { id: "monsterBasic_slash", chance: 1 },   // 70% 機率用普攻  
                  ],
	drops: [
    		{ type: "gold", chance: 0.88, amount: 208 }, // 80%掉率
    		{ type: "item", itemId: "ring_003", chance: 0.09, amount: 1 },// 20%掉率
		{ type: "item", itemId: "body_002", chance: 0.12, amount: 1 },
	       ], 
    },

    "geojeUnderseaTunnel_turtle": { 
        name: "海龜", hp: 416, atk: 48, def: 70,attribute: "none",attributeValue: 0, physRes: 30, magRes: 0, 
	exp: 110, 
	type: "ground", 
	role: "monster",
        skillPool: [
                   { id: "monsterBasic_slash", chance: 0.81 },
		   { id: "monster_turtleShockWave", chance: 0.19 },   
                  ],
	drops: [
    		{ type: "gold", chance: 0.88, amount: 262 }, // 80%掉率
    		{ type: "item", itemId: "bow_002_old", chance: 0.08, amount: 1 }, // 20%掉率
		{ type: "item", itemId: "body_003", chance: 0.10, amount: 1 },
	       ], 
    },

    "geojeUnderseaTunnel_seahorseBoss": { 
        name: "海底王", hp: 3236, atk: 368, def: 496,attribute: "none",attributeValue: 0, physRes: 90, magRes: 90, 
	exp: 1400, 
	type: "ground", 
	role: "monster",
        skillPool: [
                   { id: "monsterBasic_slash", chance: 1 },   // 70% 機率用普攻  
                  ],
	drops: [
    		{ type: "gold", chance: 0.90, amount: 1589 }, // 80%掉率
    		{ type: "item", itemId: "ring_003", chance: 0.08, amount: 1 }, // 20%掉率
	       ], 
    },

// 千年湖

    "evilLake_juck": { 
        name: "赤賊", hp: 80, atk: 17, def: 21,attribute: "none",attributeValue: 0, physRes: 0, magRes: 0, 
	exp: 25, 
	type: "ground", 
	role: "monster",
        skillPool: [
                   { id: "monsterBasic_slash", chance: 1 },   // 70% 機率用普攻  
                  ],
	drops: [
    		{ type: "gold", chance: 0.90, amount: 88 }, // 80%掉率
		{ type: "item", itemId: "head_002", chance: 0.09, amount: 1 },
    		{ type: "item", itemId: "glove_002", chance: 0.18, amount: 1 }, // 20%掉率
	       ], 
    },

    "evilLake_queen": { 
        name: "司令巫女", hp: 1400, atk: 222, def: 201,attribute: "none",attributeValue: 0, physRes: 50, magRes: 80, 
	exp: 550, 
	type: "ground", 
	role: "monster",
        skillPool: [
                   { id: "monsterBasic_slash", chance: 0.8 },   // 70% 機率用普攻
                   { id: "monsterBasic_inferno", chance: 0.2 },  // 30% 機率用煉獄術   
                  ],
	drops: [
    		{ type: "gold", chance: 0.90, amount: 1589 }, // 80%掉率
    		{ type: "item", itemId: "belt_002", chance: 0.15, amount: 1 },
    		{ type: "item", itemId: "body_004", chance: 0.06, amount: 1 },
    		{ type: "item", itemId: "ring_003", chance: 0.07, amount: 1 }, // 20%掉率
	       ], 
    },

    "evilLake_femaleshaman": { 
        name: "巫女", hp: 800, atk: 208, def: 171,attribute: "none",attributeValue: 0, physRes: 30, magRes: 80, 
	exp: 375, 
	type: "ground", 
	role: "monster",
        skillPool: [
                   { id: "monsterBasic_slash", chance: 1 },   // 70% 機率用普攻   
                  ],
	drops: [
    		{ type: "gold", chance: 0.90, amount: 789 }, // 80%掉率
    		{ type: "item", itemId: "belt_002", chance: 0.15, amount: 1 },
    		{ type: "item", itemId: "body_003", chance: 0.07, amount: 1 },
    		{ type: "item", itemId: "boots_003", chance: 0.10, amount: 1 }, // 20%掉率
	       ], 
    },

    "evilLake_auta": { 
        name: "阿魯塔", hp: 6000, atk: 620, def: 601,attribute: "none",attributeValue: 0, physRes: 170, magRes: 180, 
	exp: 3300, 
	type: "ground", 
	role: "monster",
        skillPool: [
                   { id: "monsterBasic_slash", chance: 0.8 },   // 70% 機率用普攻
                   { id: "monster_windBlade", chance: 0.2 },  // 30% 機率用煉獄術  // 30% 機率用煉獄術   
                  ],
	drops: [
    		{ type: "gold", chance: 0.90, amount: 4789 }, // 80%掉率
    		{ type: "item", itemId: "belt_002", chance: 0.15, amount: 1 },
    		{ type: "item", itemId: "head_008", chance: 0.02, amount: 1 },
    		{ type: "item", itemId: "ring_007", chance: 0.05, amount: 1 }, // 20%掉率
	       ], 
    },

//高手洞穴

    "gosuCave_bat": { 
        name: "蝙蝠", hp: 80, atk: 16, def: 21,attribute: "none",attributeValue: 0, physRes: 0, magRes: 0, 
	exp: 55, 
	type: "air",
	role: "monster",
        skillPool: [
                   { id: "monsterBasic_slash", chance: 1 },   // 70% 機率用普攻  
                  ],
	drops: [
    		{ type: "gold", chance: 0.8, amount: 58 }, // 80%掉率
    		{ type: "item", itemId: "ring_001", chance: 0.12, amount: 1 }, // 20%掉率
	       ], 
    },

    "gosuCave_dokkaebi": { 
        name: "獨角鬼", hp: 196, atk: 46, def: 55,attribute: "none",attributeValue: 0, physRes: 0, magRes: 0, 
	exp: 45, 
	type:"ground", 
	role: "monster",
        skillPool: [
                   { id: "monsterBasic_slash", chance: 1 },   // 70% 機率用普攻  
                  ],
	drops: [
    		{ type: "gold", chance: 0.9, amount: 137 }, // 80%掉率
    		{ type: "item", itemId: "boots_002", chance: 0.15, amount: 1 },// 20%掉率
		{ type: "item", itemId: "ring_002", chance: 0.10, amount: 1 }, 
	       ], 
    },

    "gosuCave_frog": { 
        name: "毒蟾蜍", hp: 116, atk: 32, def: 31,attribute: "none",attributeValue: 0, physRes: 0, magRes: 0, 
	exp: 45, 
	type: "ground", 
	role: "monster",
        skillPool: [
                   { id: "monsterBasic_slash", chance: 1 },   // 70% 機率用普攻  
                  ],
	drops: [
    		{ type: "gold", chance: 0.88, amount: 89 }, // 80%掉率
    		{ type: "item", itemId: "ring_001", chance: 0.08, amount: 1 }, // 20%掉率
		{ type: "item", itemId: "body_002", chance: 0.12, amount: 1 },
	       ], 
    },

    "gosuCave_Starfish": { 
        name: "四不像", hp: 176, atk: 14, def: 21,attribute: "none",attributeValue: 0, physRes: 0, magRes: 0, 
	exp: 60, 
	type: "ground", 
	role: "monster",
        skillPool: [
                   { id: "monsterBasic_slash", chance: 1 },   // 70% 機率用普攻  
                  ],
	drops: [
    		{ type: "gold", chance: 0.88, amount: 117 }, // 80%掉率
    		{ type: "item", itemId: "ring_002", chance: 0.08, amount: 1 }, // 20%掉率
		{ type: "item", itemId: "body_003", chance: 0.12, amount: 1 },

	       ], 
    }
  
},

    // 技能數據
skills: {

	"normal_strike": { name: "普通攻擊", type: "phys", validTypes: ["ground"], 
        formula: "atk"                 // 意思：傷害 = (攻擊力 * 1.0) + 0
        },

        "normal_shot": { name: "普通射擊", type: "phys", validTypes: ["ground","air"],
        formula: "atk"                 // 意思：傷害 = (攻擊力 * 1.0) + 0
        },

        "restoreMp_normal": { name: "補給術", type: "support",subType: "mp", validTypes: ["ground"], 
	mpCost: 1 ,
	mode: "full",
	ratioMap: {
            "china_taoist": 1.2,"china_taoist_1": 2.0} 
        },

        "restoreHp_normal": { name: "治療術", type: "support",subType: "heal", validTypes: ["ground"], 
	mpCost: 1 ,
	healRatio: 6
        },

        "fire_arrow": { name: "火箭術", type: "phys", validTypes: ["ground","air"],
        formula: "(atk) * 1.5",              
        },

        "magicefire_arrow": { name: "魔法火箭", type: "phys", validTypes: ["ground","air"],
	mpCost: 2 ,
        formula: "(atk) * 7",                 
        },

       "thrust": { name: "刺擊術", type: "phys", validTypes: ["ground"],
	mpCost: 2 ,
        formula: "(atk) * 7",                 
        },

        "energy_blast": { name: "氣功神炮", type: "magic", validTypes: ["ground"], 
	mpCost: 50, 
        formula: "(atk + level) * 15" 
        }

},

monsterSkills: {

        "monsterBasic_slash": { name: "普通攻擊", type: "phys", multiplier: 1.0, debuffRes: 0
        },

        "monsterBasic_inferno": { name: "煉獄術", type: "magic", multiplier: 1.5, debuffRes: 0
        },

        "monster_windBlade": { name: "風刃術", type: "magic", multiplier: 1.8, debuffRes: 0
        },
	
        "monster_turtleShockWave": { name: "衝擊波", type: "magic", multiplier: 1.7, debuffRes: 0
        }
},
    
    // 全物品數據
items: {
        // 裝備類：武器, 頭, 甲, 手套, 腰帶, 鞋, 戒指, 符
	equipment: {
    		// 武器
                // 劍
		"wood_sword_old": { 
    			name: "舊木棒", type: "weapon", classType: ["warrior_sword", "mainplayer"], lv: 2, price: 400, isTradable: true, isQuestItem: false,
			grade: "old",	
    			stats:  { atk: [1, 1] },
    			skills: ["normal_strike"],
			icon: 'assets/icons/equipments/sword_001.jpg'
		},

		"wood_sword_normal": { 
    			name: "木棒", type: "weapon", classType: ["warrior_sword", "mainplayer"], lv: 2, price: 400, isTradable: true, isQuestItem: false,
			grade: "normal",	
    			stats:  { atk: [1, 2] },
    			skills: ["normal_strike"],
			icon: 'assets/icons/equipments/sword_001.jpg'
		},

		"wood_sword_advance": { 
    			name: "高級木棒", type: "weapon", classType: ["warrior_sword", "mainplayer"], lv: 2, price: 400, isTradable: true, isQuestItem: false,
			grade: "advanced",	
    			stats:  { atk: [2, 3] },
    			skills: ["normal_strike"],
			icon: 'assets/icons/equipments/sword_001.jpg'
		},

                //弓

		"bow_001_old": { 
    			name: "舊長弓", type: "weapon", classType: ["archer", "mainplayer"], lv: 40, price: 40578, isTradable: true, isQuestItem: false,
			grade: "old",	
    			stats:  { atk: [19, 29] },
    			skills: ["normal_shot"],
			icon: 'assets/icons/equipments/bow_001.jpg'
		},

		"bow_001_normal": { 
    			name: "長弓", type: "weapon", classType: ["archer", "mainplayer"], lv: 43, price: 49905, isTradable: true, isQuestItem: false,
			grade: "normal",	
    			stats:  { atk: [21, 31] },
    			skills: ["normal_shot"],
			icon: 'assets/icons/equipments/bow_001.jpg'
		},

		"bow_001_advance": { 
    			name: "高級長弓", type: "weapon", classType: ["archer", "mainplayer"], lv: 46, price: 53540, isTradable: true, isQuestItem: false,
			grade: "advanced",	
    			stats:  { atk: [22, 33] },
    			skills: ["normal_shot","fire_arrow"],
			icon: 'assets/icons/equipments/bow_001.jpg'
		},

		"bow_002_old": { 
    			name: "舊環弓", type: "weapon", classType: ["archer", "mainplayer"], lv: 49, price: 82578, isTradable: true, isQuestItem: false,
			grade: "old",	
    			stats:  { atk: [23, 35] },
    			skills: ["normal_shot"],
			icon: 'assets/icons/equipments/bow_002.jpg'
		},

		"bow_002_normal": { 
    			name: "環弓", type: "weapon", classType: ["archer", "mainplayer"], lv: 52 , price: 89905, isTradable: true, isQuestItem: false,
			grade: "normal",	
    			stats:  { atk: [25, 38] },
    			skills: ["normal_shot"],
			icon: 'assets/icons/equipments/bow_002.jpg'
		},

		"bow_002_advance": { 
    			name: "高級環弓", type: "weapon", classType: ["archer", "mainplayer"], lv: 55, price: 103540, isTradable: true, isQuestItem: false,
			grade: "advanced",	
    			stats:  { atk: [26, 40] },
    			skills: ["normal_shot","magicfire_arrow"],
			icon: 'assets/icons/equipments/bow_002.jpg'
		},


    		// 頭部
		"head_001": { 
			name: "麻布頭巾", type: "head", classType: ["all"], lv: 2, price: 52, isTradable: true, isQuestItem: false,
			grade: "normal",
    			stats:  { def: 1 },
    			skills: [],
			icon: 'assets/icons/equipments/head_001.jpg'
		},

		"head_002": { 
			name: "狼皮頭盔", type: "head", classType: ["all"], lv: 13, price: 5329, isTradable: true, isQuestItem: false,
			grade: "normal",
    			stats:  { def: 7, physRes: 5 },
    			skills: [],
			icon: 'assets/icons/equipments/head_002.jpg'
		},

		"head_003": { 
			name: "竹子頭盔", type: "head", classType: ["all"], lv: 28, price: 9452, isTradable: true, isQuestItem: false,
			grade: "normal",
    			stats:  { def: 15, physRes: 5 },
    			skills: [],
			icon: 'assets/icons/equipments/head_003.jpg'
		},

		"head_004": { 
			name: "藍鐵頭盔", type: "head", classType: ["all"], lv: 40, price: 19638, isTradable: true, isQuestItem: false,
			grade: "normal",
    			stats:  { def: 21, physRes: 10 },
    			skills: [],
			icon: 'assets/icons/equipments/head_004.jpg'
		},

		"head_005": { 
			name: "紅鐵頭盔", type: "head", classType: ["all"], lv: 47, price: 29452, isTradable: true, isQuestItem: false,
			grade: "normal",
    			stats:  { def: 24, physRes: 10 },
    			skills: [],
			icon: 'assets/icons/equipments/head_005.jpg'
		},

		"head_006": { 
			name: "黑鐵頭盔", type: "head", classType: ["all"], lv: 50, price: 62382, isTradable: true, isQuestItem: false,
			grade: "normal",
    			stats:  { def: 26, physRes: 20 },
    			skills: [],
			icon: 'assets/icons/equipments/head_006.jpg'
		},

		"head_007": { 
			name: "飛虎頭盔", type: "head", classType: ["all"], lv: 70, price: 168376, isTradable: true, isQuestItem: false,
			grade: "normal",
    			stats:  { def: 25, dex: 10 ,physRes: 20 },
    			skills: [],
			icon: 'assets/icons/equipments/head_007.jpg'
		},

		"head_008": { 
			name: "水龍頭盔", type: "head", classType: ["all"], lv: 80, price: 348376, isTradable: true, isQuestItem: false,
			grade: "normal",
    			stats:  { def: 40, int: 15 ,physRes:10 , magRes:10 },
    			skills: [],
			icon: 'assets/icons/equipments/head_007.jpg'
		},

    		// 身體/盔甲
		"body_001": { 
			name: "牛皮盔甲", type: "body", classType: ["all"], lv: 3, price: 554, isTradable: true, isQuestItem: false,
			grade: "normal",
    			stats:  { def: 5 },
    			skills: [],
			icon: 'assets/icons/equipments/body_001.jpg'
		},

		"body_002": { 
			name: "狼皮盔甲", type: "body", classType: ["all"], lv: 13, price: 1554, isTradable: true, isQuestItem: false,
			grade: "normal",
    			stats:  { def: 16 },
    			skills: [],
			icon: 'assets/icons/equipments/body_002.jpg'
		},

		"body_003": { 
			name: "竹子盔甲", type: "body", classType: ["all"], lv: 28, price: 12893, isTradable: true, isQuestItem: false,
			grade: "normal",
    			stats:  { def: 32, physRes:1, magRes:1 },
    			skills: [],
			icon: 'assets/icons/equipments/body_003.jpg'
		},

		"body_004": { 
			name: "藍鐵盔甲", type: "body", classType: ["all"], lv: 40, price: 23493, isTradable: true, isQuestItem: false,
			grade: "normal",
    			stats:  { def: 43, dex: -2, physRes:2, magRes:2 },
    			skills: [],
			icon: 'assets/icons/equipments/body_004.jpg'
		},

		"body_005": { 
			name: "紅鐵盔甲", type: "body", classType: ["all"], lv: 47, price: 42815, isTradable: true, isQuestItem: false,
			grade: "normal",
    			stats:  { def: 50, dex: -2, physRes:2, magRes:2 },
    			skills: [],
			icon: 'assets/icons/equipments/body_005.jpg'
		},

		"body_006": { 
			name: "黑鐵盔甲", type: "body", classType: ["all"], lv: 50, price: 67815, isTradable: true, isQuestItem: false,
			grade: "normal",
    			stats:  { def: 54, dex: -4, physRes:3, magRes:3 },
    			skills: [],
			icon: 'assets/icons/equipments/body_006.jpg'
		},

		"body_007": { 
			name: "飛虎盔甲", type: "body", classType: ["all"], lv: 70, price: 167813, isTradable: true, isQuestItem: false,
			grade: "normal",
    			stats:  { def: 62, dex: 10, physRes:10, magRes:10 },
    			skills: [],
			icon: 'assets/icons/equipments/body_007.jpg'
		},

		"body_008": { 
			name: "水龍盔甲", type: "body", classType: ["all"], lv: 80, price: 223895, isTradable: true, isQuestItem: false,
			grade: "normal",
    			stats:  { def: 81, int: 20, physRes:30, magRes:30 },
    			skills: [],
			icon: 'assets/icons/equipments/body_008.jpg'
		},

    		// 手部
		"glove_001": { 
			name: "麻布手套", type: "glove", classType: ["all"], lv: 1, price: 48, isTradable: true, isQuestItem: false,
			grade: "normal",
    			stats:  { def: 1 },
    			skills: [],
			icon: 'assets/icons/equipments/hand_001.jpg'
		},

		"glove_002": { 
			name: "銅製手套", type: "glove", classType: ["all"], lv: 21, price: 948, isTradable: true, isQuestItem: false,
			grade: "normal",
    			stats:  { def: 6 },
    			skills: [],
			icon: 'assets/icons/equipments/hand_002.jpg'
		},

		"glove_003": { 
			name: "鐵製手套", type: "glove", classType: ["all"], lv: 25, price: 948, isTradable: true, isQuestItem: false,
			grade: "normal",
    			stats:  { def: 7, str: 2 },
    			skills: [],
			icon: 'assets/icons/equipments/hand_003.jpg'
		},

		"glove_004": { 
			name: "藍鐵手套", type: "glove", classType: ["all"], lv: 29, price: 1998, isTradable: true, isQuestItem: false,
			grade: "normal",
    			stats:  { def: 8, str: 4 },
    			skills: [],
			icon: 'assets/icons/equipments/hand_004.jpg'
		},

		"glove_005": { 
			name: "紅鐵手套", type: "glove", classType: ["all"], lv: 33, price: 3548, isTradable: true, isQuestItem: false,
			grade: "normal",
    			stats:  { def: 9, str: 4, physRes:1, magRes:1 },
    			skills: [],
			icon: 'assets/icons/equipments/hand_005.jpg'
		},

		"glove_006": { 
			name: "化天手套", type: "glove", classType: ["all"], lv: 57, price: 23548, isTradable: true, isQuestItem: false,
			grade: "normal",
    			stats:  { def: 14, str: 6, physRes:2, magRes:2 },
    			skills: [],
			icon: 'assets/icons/equipments/hand_006.jpg'
		},

    		// 腰部
    		"belt_001": {
			name: "麻布腰带", type: "belt", classType: ["all"], lv: 1, price: 53, isTradable: true, isQuestItem: false,
			grade: "normal",
    			stats:  { def: 1 },
    			skills: [],
			icon: 'assets/icons/equipments/belt_001.jpg'
		},

    		"belt_002": {
			name: "鐵製腰带", type: "belt", classType: ["all"], lv: 21, price: 853, isTradable: true, isQuestItem: false,
			grade: "normal",
    			stats:  { def: 5, magRes: 2 },
    			skills: [],
			icon: 'assets/icons/equipments/belt_002.jpg'
		},

    		"belt_003": {
			name: "火紅腰带", type: "belt", classType: ["all"], lv: 49, price: 18053, isTradable: true, isQuestItem: false,
			grade: "normal",
    			stats:  { def: 12, magRes: 16 },
    			skills: [],
			icon: 'assets/icons/equipments/belt_001.jpg'
		},

    		"belt_004": {
			name: "射天腰带", type: "belt", classType: ["all"], lv: 57, price: 30453, isTradable: true, isQuestItem: false,
			grade: "normal",
    			stats:  { def: 14, magRes: 20 },
    			skills: [],
			icon: 'assets/icons/equipments/belt_001.jpg'
		},


    		// 鞋子
    		"boots_001": {
			name: "草鞋", type: "boots", classType: ["all"], lv: 1, price: 46, isTradable: true, isQuestItem: false,
			grade: "normal",
    			stats:  { def: 1 },
    			skills: [],
			icon: 'assets/icons/equipments/boots_001.jpg'
		},

    		"boots_002": {
			name: "唐鞋", type: "boots", classType: ["all"], lv: 20, price: 1046, isTradable: true, isQuestItem: false,
			grade: "normal",
    			stats:  { dex: 10 },
    			skills: [],
			icon: 'assets/icons/equipments/boots_002.jpg'
		},

    		"boots_003": {
			name: "草履鞋", type: "boots", classType: ["all"], lv: 30, price: 3546, isTradable: true, isQuestItem: false,
			grade: "normal",
    			stats:  { dex: 12, vit: 2 },
    			skills: [],
			icon: 'assets/icons/equipments/boots_003.jpg'
		},

    		"boots_004": {
			name: "木屐", type: "boots", classType: ["all"], lv: 40, price: 5726, isTradable: true, isQuestItem: false,
			grade: "normal",
    			stats:  { dex: 14, vit: 3 },
    			skills: [],
			icon: 'assets/icons/equipments/boots_004.jpg'
		},

    		"boots_005": {
			name: "極鞋", type: "boots", classType: ["all"], lv: 50, price: 10746, isTradable: true, isQuestItem: false,
			grade: "normal",
    			stats:  { dex: 16, vit: 4 },
    			skills: [],
			icon: 'assets/icons/equipments/boots_005.jpg'
		},

    		"boots_006": {
			name: "繡花鞋", type: "boots", classType: ["all"], lv: 60, price: 210746, isTradable: true, isQuestItem: false,
			grade: "normal",
    			stats:  { dex: 16, vit: 4 },
    			skills: [],
			icon: 'assets/icons/equipments/boots_006.jpg'
		},

    		"boots_007": {
			name: "軍鞋", type: "boots", classType: ["all"], lv: 70, price: 383496, isTradable: true, isQuestItem: false,
			grade: "normal",
    			stats:  { str: 5, dex: 15, vit: 6 },
    			skills: [],
			icon: 'assets/icons/equipments/boots_007.jpg'
		},

    		// 飾品/戒指
    		"ring_001": {
			name: "梧桐指環", type: ["ring1","ring2"], classType: ["all"], lv: 5, price: 248, isTradable: true, isQuestItem: false,
			grade: "normal",
    			stats:  { int: 2},
    			skills: [],
			icon: 'assets/icons/equipments/ring_001.jpg'
		},

    		"ring_002": {
			name: "銀指環", type: ["ring1","ring2"], classType: ["all"], lv: 30, price: 1279, isTradable: true, isQuestItem: false,
			grade: "normal",
    			stats:  { int: 8},
    			skills: [],
			icon: 'assets/icons/equipments/ring_002.jpg'
		},

    		"ring_003": {
			name: "金指環", type: ["ring1","ring2"], classType: ["all"], lv: 40, price: 2482, isTradable: true, isQuestItem: false,
			grade: "normal",
    			stats:  { int: 10},
    			skills: [],
			icon: 'assets/icons/equipments/ring_003.jpg'
		},

    		"ring_004": {
			name: "紫水晶指環", type: ["ring1","ring2"], classType: ["all"], lv: 50, price: 12482, isTradable: true, isQuestItem: false,
			grade: "normal",
    			stats:  { int: 10, dex: 2},
    			skills: [],
			icon: 'assets/icons/equipments/ring_004.jpg'
		},

    		"ring_005": {
			name: "黑曜石指環", type: ["ring1","ring2"], classType: ["all"], lv: 70, price: 48491, isTradable: true, isQuestItem: false,
			grade: "normal",
    			stats:  { dex: 4, vit: 3 ,int: 10},
    			skills: [],
			icon: 'assets/icons/equipments/ring_005.jpg'
		},

    		"ring_006": {
			name: "虎眼石指環", type: ["ring1","ring2"], classType: ["all"], lv: 80, price: 132482, isTradable: true, isQuestItem: false,
			grade: "normal",
    			stats:  { str: 1, dex: 5, vit: 4, int: 13},
    			skills: [],
			icon: 'assets/icons/equipments/ring_006.jpg'
		},

    		"ring_007": {
			name: "紫雲妃指環", type: ["ring1","ring2"], classType: ["all"], lv: 80, price: 200000, isTradable: true, isQuestItem: false,
			grade: "normal",
    			stats:  { str: 5, dex: 5, int: 15},
    			skills: [],
			icon: 'assets/icons/equipments/ring_007.jpg'
		},

    		// 特殊/符咒
    		"charm_001": {
			name: "護身符子（鼠）", type: "charm", classType: ["all"], lv: 1, price: 3, isTradable: true, isQuestItem: false,
			grade: "normal",
    			stats:  {},
    			skills: [],
			icon: 'assets/icons/equipments/charm_001.jpg'
		}
 
        },


        // 消耗品類,點品,商城,藥
	specialItem: {

            		"NaturalizationPaper_Korea": {
			 name: "歸化誓約(朝鮮)", price: 2000000 , isTradable: true, isQuestItem: false,
			 type: "special",
			 tags: ["special"],
			 grade: "rare",       
			 icon: 'assets/icons/specialItem/NaturalizationPaper_Korea.jpg',
			 desc: "使用後，將當前國籍變更為 朝鮮。", // 加呢度
    			 lv: 1		
			},

            		"NaturalizationPaper_Japan": {
			 name: "歸化誓約(日本)", price: 2000000 , isTradable: true, isQuestItem: false,
			 type: "special",
			 tags: ["special"],
			 grade: "rare", 
			 icon: 'assets/icons/specialItem/NaturalizationPaper_Japan.jpg',
			 desc: "使用後，將當前國籍變更為 日本。", // 加呢度
    			 lv: 1 
			},

            		"NaturalizationPaper_Taiwan": {
			 name: "歸化誓約(台灣)", price: 2000000 , isTradable: true, isQuestItem: false,
			 type: "special",
			 tags: ["special"],
			 grade: "rare",   
			 icon: 'assets/icons/specialItem/NaturalizationPaper_Taiwan.jpg',
			 desc: "使用後，將當前國籍變更為 台灣。", // 加呢度
    			 lv: 1     		
			},

            		"NaturalizationPaper_China": {
			 name: "歸化誓約(中國)", price: 2000000 , isTradable: true, isQuestItem: false,
			 type: "special",
			 tags: ["special"],
			 grade: "rare",      
			 icon: 'assets/icons/specialItem/NaturalizationPaper_China.jpg',
			 desc: "使用後，將當前國籍變更為 中國。", // 加呢度
    			 lv: 1  		
			}


		    		
	},
        	consumables: {

            		"con_test_item": {
			 name: "測試物品", price: 50 , isTradable: true, isQuestItem: false,
			 type: "consumables",
			 tags: ["common", "shop"],
			 grade: "normal"
        		}
    		
	},


		material: {

            		"mat_soul_stone": {
			 name: "測試物品2", type: "material", price: 50 , isTradable: true, isQuestItem: false,
			 type: "material",
			 tags: ["common"],
			 grade: "normal"
        		
			}
    		}
	},


promotionGroups: {
        "korea_archer": ["korea_archer", "korea_archer_1"]
     },

promotionTable: {
        "korea_archer": { targetId: "korea_archer_1", reqLv: 40, reqItem: null, reqGold: 0 },
        "korea_butcher": { targetId: "korea_butcher_1", reqLv: 40, reqItem: null, reqGold: 5000 }
    },


    	
mercenary:{

           //------ 朝鮮 -------

      "korea_archer": { 
	   
	   id: "",
	   baseId: "korea_archer",
	   rank: 0,
	   role: "soldier",
           name: "弓箭手", classType: "archer", mercNation: "korea",level: 1, totalExp: 0, bonusPoints: 0, attribute: "none",attributeValue: 0,
	   stats: { str: 20, dex: 20, vit: 10, int: 0 },
           equipment: {
    		charm: null, head: null, glove: null,
    		weapon: null, body: null, belt: null,
    		ring1: null, boots: null, ring2: null,
		
		// 新增欄位
   		 lDeco1: null, lDeco2: null, lDeco3: null, lDeco4: null, lDeco5: null,
   		 rDeco6: null, rDeco7: null, rDeco8: null, rDeco9: null
		},
	   equipmentStat: { str: 0, dex: 0, vit: 0, int: 0, atk: 0, def: 0, physRes: 0, magRes: 0, critRate: 0},
           combat: { hp: 10, maxHp: 10, mp: 10, maxMp: 10, atk: [0, 0], def: 0, mdef: 0, critRate: 0, physRes: 0, magRes: 0,attributeValue: 0 },
	   defaultSkill: ["normal_shot"],
           skills: [], 
	   status: "alive",
           is260Unlocked: false,
	   icon: 'assets/icons/mercenaries/korea_archer.gif'
           },

      "korea_archer_1": { 

           id: "",
           level:1,
	   baseId: "korea_archer_1",
	   rank: 1,
	   role: "general",
           name: "李舜臣", classType: "archer", mercNation: "korea",level: 1, totalExp: 0, bonusPoints: 0, attribute: "none",
	   stats: { str: 40, dex: 60, vit: 50, int: 20 },
           equipment: {
    		charm: null, head: null, glove: null,
    		weapon: null, body: null, belt: null,
    		ring1: null, boots: null, ring2: null,
		
		// 新增欄位
   		 lDeco1: null, lDeco2: null, lDeco3: null, lDeco4: null, lDeco5: null,
   		 rDeco6: null, rDeco7: null, rDeco8: null, rDeco9: null
		},
	   equipmentStat: { str: 0, dex: 0, vit: 0, int: 0, atk: 0, def: 0, physRes: 0, magRes: 0, critRate: 0, attributeValue: 0 },
           combat: { hp: 10, maxHp: 10, mp: 10, maxMp: 10, atk: [0, 0], def: 0, mdef: 0, critRate: 0, physRes: 0, magRes: 0 ,attributeValue: 0},
	   defaultSkill: ["normal_shot","energy_blast"],
           skills: [], 
	   status: "alive",
	   buffs: [],
	   specialAbility: null,
	   is260Unlocked: false,
	   icon: 'assets/icons/mercenaries/korea_archer_1.gif'
           },

       "korea_butcher": { 

	   id: "",
	   baseId: "korea_butcher",
	   rank: 0,
	   role: "soldier",
           name: "刀手", classType: "warrior_sword", mercNation: "korea", level: 1, totalExp: 0, bonusPoints: 0, attribute: "none",
	   stats: { str: 30, dex: 21, vit: 20, int: 0 },
           equipment: {
    		charm: null, head: null, glove: null,
    		weapon: null, body: null, belt: null,
    		ring1: null, boots: null, ring2: null,
		// 新增欄位
   		 lDeco1: null, lDeco2: null, lDeco3: null, lDeco4: null, lDeco5: null,
   		 rDeco6: null, rDeco7: null, rDeco8: null, rDeco9: null
		},
	   equipmentStat: { str: 0, dex: 0, vit: 0, int: 0, atk: 0, def: 0, physRes: 0, magRes: 0, critRate: 0, attributeValue: 0 },
           combat: { hp: 10, maxHp: 10, mp: 10, maxMp: 10, atk: [0, 0], def: 0, mdef: 0, critRate: 0, physRes: 0, magRes: 0 ,attributeValue: 0},
	   defaultSkill: ["normal_strike"],
           skills: [], 
	   status: "alive",
	   is260Unlocked: false,
	   icon: 'assets/icons/mercenaries/korea_butcher.gif'
           },

      "korea_mountedarcher": { 
	   
	   id: "",
	   baseId: "korea_mountedarcher",
	   rank: 0,
	   role: "soldier",
           name: "騎馬弓手", classType: "archer", mercNation: "korea",level: 1, totalExp: 0, bonusPoints: 0, attribute: "none",
	   stats: { str: 18, dex: 18, vit: 12, int: 0 },
           equipment: {
    		charm: null, head: null, glove: null,
    		weapon: null, body: null, belt: null,
    		ring1: null, boots: null, ring2: null,
		
		// 新增欄位
   		 lDeco1: null, lDeco2: null, lDeco3: null, lDeco4: null, lDeco5: null,
   		 rDeco6: null, rDeco7: null, rDeco8: null, rDeco9: null
		},
	   equipmentStat: { str: 0, dex: 0, vit: 0, int: 0, atk: 0, def: 0, physRes: 0, magRes: 0, critRate: 0, attributeValue: 0 },
           combat: { hp: 10, maxHp: 10, mp: 10, maxMp: 10, atk: [0, 0], def: 0, mdef: 0, critRate: 0, physRes: 0, magRes: 0 ,attributeValue: 0},
	   defaultSkill: ["normal_shot"],
           skills: [], 
	   status: "alive",
           is260Unlocked: false,
	   icon: 'assets/icons/mercenaries/korea_mountedarcher.gif'
           },

      "korea_confucianist": { 
	   
	   id: "",
	   baseId: "korea_confucianist",
	   rank: 0,
	   role: "soldier",
           name: "儒生", classType: "scholar", mercNation: "korea",level: 1, totalExp: 0, bonusPoints: 0, attribute: "none",
	   stats: { str: 15, dex: 20, vit: 15, int: 6 },
           equipment: {
    		charm: null, head: null, glove: null,
    		weapon: null, body: null, belt: null,
    		ring1: null, boots: null, ring2: null,
		
		// 新增欄位
   		 lDeco1: null, lDeco2: null, lDeco3: null, lDeco4: null, lDeco5: null,
   		 rDeco6: null, rDeco7: null, rDeco8: null, rDeco9: null
		},
	   equipmentStat: { str: 0, dex: 0, vit: 0, int: 0, atk: 0, def: 0, physRes: 0, magRes: 0, critRate: 0, attributeValue: 0 },
           combat: { hp: 10, maxHp: 10, mp: 10, maxMp: 10, atk: [0, 0], def: 0, mdef: 0, critRate: 0, physRes: 0, magRes: 0 ,attributeValue: 0},
	   defaultSkill: ["normal_shot"],
           skills: [], 
	   status: "alive",
           is260Unlocked: false,
	   icon: 'assets/icons/mercenaries/korea_confucianist.gif'
           },

      "korea_monk": { 
	   
	   id: "",
	   baseId: "korea_monk",
	   rank: 0,
	   role: "soldier",
           name: "破戒憎", classType: "doctor_woodenfish", mercNation: "korea",level: 1, totalExp: 0, bonusPoints: 0, attribute: "none",
	   stats: { str: 25, dex: 20, vit: 10, int: 5 },
           equipment: {
    		charm: null, head: null, glove: null,
    		weapon: null, body: null, belt: null,
    		ring1: null, boots: null, ring2: null,
		
		// 新增欄位
   		 lDeco1: null, lDeco2: null, lDeco3: null, lDeco4: null, lDeco5: null,
   		 rDeco6: null, rDeco7: null, rDeco8: null, rDeco9: null
		},
	   equipmentStat: { str: 0, dex: 0, vit: 0, int: 0, atk: 0, def: 0, physRes: 0, magRes: 0, critRate: 0, attributeValue: 0 },
           combat: { hp: 10, maxHp: 10, mp: 10, maxMp: 10, atk: [0, 0], def: 0, mdef: 0, critRate: 0, physRes: 0, magRes: 0,attributeValue: 0 },
	   defaultSkill: ["normal_shot","restoreHp_normal"],
           skills: [], 
	   status: "alive",
           is260Unlocked: false,
	   icon: 'assets/icons/mercenaries/korea_monk.gif'
           },

      "korea_lancer": { 
	   
	   id: "",
	   baseId: "korea_lancer",
	   rank: 0,
	   role: "soldier",
           name: "槍兵", classType: "warrior_spear", mercNation: "korea",level: 1, totalExp: 0, bonusPoints: 0, attribute: "none",
	   stats: { str: 34, dex: 20, vit: 16, int: 0 },
           equipment: {
    		charm: null, head: null, glove: null,
    		weapon: null, body: null, belt: null,
    		ring1: null, boots: null, ring2: null,
		
		// 新增欄位
   		 lDeco1: null, lDeco2: null, lDeco3: null, lDeco4: null, lDeco5: null,
   		 rDeco6: null, rDeco7: null, rDeco8: null, rDeco9: null
		},
	   equipmentStat: { str: 0, dex: 0, vit: 0, int: 0, atk: 0, def: 0, physRes: 0, magRes: 0, critRate: 0, attributeValue: 0 },
           combat: { hp: 10, maxHp: 10, mp: 10, maxMp: 10, atk: [0, 0], def: 0, mdef: 0, critRate: 0, physRes: 0, magRes: 0 ,attributeValue: 0},
	   defaultSkill: ["normal_strike"],
           skills: [], 
	   status: "alive",
           is260Unlocked: false,
	   icon: 'assets/icons/mercenaries/korea_lancer.gif'
           },

      "korea_doctor": { 
	   
	   id: "",
	   baseId: "korea_doctor",
	   rank: 0,
	   role: "soldier",
           name: "醫術師", classType: "doctor_needle", mercNation: "korea",level: 1, totalExp: 0, bonusPoints: 0, attribute: "none",
	   stats: { str: 34, dex: 20, vit: 16, int: 0 },
           equipment: {
    		charm: null, head: null, glove: null,
    		weapon: null, body: null, belt: null,
    		ring1: null, boots: null, ring2: null,
		
		// 新增欄位
   		 lDeco1: null, lDeco2: null, lDeco3: null, lDeco4: null, lDeco5: null,
   		 rDeco6: null, rDeco7: null, rDeco8: null, rDeco9: null
		},
	   equipmentStat: { str: 0, dex: 0, vit: 0, int: 0, atk: 0, def: 0, physRes: 0, magRes: 0, critRate: 0, attributeValue: 0 },
           combat: { hp: 10, maxHp: 10, mp: 10, maxMp: 10, atk: [0, 0], def: 0, mdef: 0, critRate: 0, physRes: 0, magRes: 0 ,attributeValue: 0},
	   defaultSkill: ["normal_shot"],
           skills: [], 
	   status: "alive",
           is260Unlocked: false,
	   icon: 'assets/icons/mercenaries/korea_doctor.gif'
           },
		

		//------ 日本 -------
      "japan_gunner": { 
	   
	   id: "",
	   baseId: "japan_gunner",
	   rank: 0,
	   role: "soldier",
           name: "鐵砲浪人", classType: "gunner", mercNation: "japan",level: 1, totalExp: 0, bonusPoints: 0, attribute: "none",
	   stats: { str: 18, dex: 25, vit: 12, int: 0 },
           equipment: {
    		charm: null, head: null, glove: null,
    		weapon: null, body: null, belt: null,
    		ring1: null, boots: null, ring2: null,
		
		// 新增欄位
   		 lDeco1: null, lDeco2: null, lDeco3: null, lDeco4: null, lDeco5: null,
   		 rDeco6: null, rDeco7: null, rDeco8: null, rDeco9: null
		},
	   equipmentStat: { str: 0, dex: 0, vit: 0, int: 0, atk: 0, def: 0, physRes: 0, magRes: 0, critRate: 0, attributeValue: 0 },
           combat: { hp: 10, maxHp: 10, mp: 10, maxMp: 10, atk: [0, 0], def: 0, mdef: 0, critRate: 0, physRes: 0, magRes: 0,attributeValue: 0 },
	   defaultSkill: ["normal_shot"],
           skills: [], 
	   status: "alive",
           is260Unlocked: false,
	   icon: 'assets/icons/mercenaries/japan_gunner.gif'
           },

      "japan_sorceress": { 
	   
	   id: "",
	   baseId: "japan_sorceress",
	   rank: 0,
	   role: "soldier",
           name: "陰陽師", classType: "magDebuff", mercNation: "japan",level: 1, totalExp: 0, bonusPoints: 0, attribute: "none",
	   stats: { str: 25, dex: 15, vit: 10, int: 10 },
           equipment: {
    		charm: null, head: null, glove: null,
    		weapon: null, body: null, belt: null,
    		ring1: null, boots: null, ring2: null,
		
		// 新增欄位
   		 lDeco1: null, lDeco2: null, lDeco3: null, lDeco4: null, lDeco5: null,
   		 rDeco6: null, rDeco7: null, rDeco8: null, rDeco9: null
		},
	   equipmentStat: { str: 0, dex: 0, vit: 0, int: 0, atk: 0, def: 0, physRes: 0, magRes: 0, critRate: 0, attributeValue: 0 },
           combat: { hp: 10, maxHp: 10, mp: 10, maxMp: 10, atk: [0, 0], def: 0, mdef: 0, critRate: 0, physRes: 0, magRes: 0 ,attributeValue: 0},
	   defaultSkill: ["normal_strike"],
           skills: [], 
	   status: "alive",
           is260Unlocked: false,
	   icon: 'assets/icons/mercenaries/japan_sorceress.gif'
           },

      "japan_sword": { 
	   
	   id: "",
	   baseId: "japan_sword",
	   rank: 0,
	   role: "soldier",
           name: "用劍浪人", classType: "warrior_sword", mercNation: "japan",level: 1, totalExp: 0, bonusPoints: 0, attribute: "none",
	   stats: { str: 38, dex: 25, vit: 8, int: 0 },
           equipment: {
    		charm: null, head: null, glove: null,
    		weapon: null, body: null, belt: null,
    		ring1: null, boots: null, ring2: null,
		
		// 新增欄位
   		 lDeco1: null, lDeco2: null, lDeco3: null, lDeco4: null, lDeco5: null,
   		 rDeco6: null, rDeco7: null, rDeco8: null, rDeco9: null
		},
	   equipmentStat: { str: 0, dex: 0, vit: 0, int: 0, atk: 0, def: 0, physRes: 0, magRes: 0, critRate: 0, attributeValue: 0 },
           combat: { hp: 10, maxHp: 10, mp: 10, maxMp: 10, atk: [0, 0], def: 0, mdef: 0, critRate: 0, physRes: 0, magRes: 0,attributeValue: 0 },
	   defaultSkill: ["normal_strike"],
           skills: [], 
	   status: "alive",
           is260Unlocked: false,
	   icon: 'assets/icons/mercenaries/japan_sword.gif'
           },

      "japan_ninja": { 
	   
	   id: "",
	   baseId: "japan_ninja",
	   rank: 0,
	   role: "soldier",
           name: "忍者", classType: "ninja", mercNation: "japan",level: 1, totalExp: 0, bonusPoints: 0, attribute: "none",
	   stats: { str: 30, dex: 40, vit: 10, int: 0 },
           equipment: {
    		charm: null, head: null, glove: null,
    		weapon: null, body: null, belt: null,
    		ring1: null, boots: null, ring2: null,
		
		// 新增欄位
   		 lDeco1: null, lDeco2: null, lDeco3: null, lDeco4: null, lDeco5: null,
   		 rDeco6: null, rDeco7: null, rDeco8: null, rDeco9: null
		},
	   equipmentStat: { str: 0, dex: 0, vit: 0, int: 0, atk: 0, def: 0, physRes: 0, magRes: 0, critRate: 0, attributeValue: 0 },
           combat: { hp: 10, maxHp: 10, mp: 10, maxMp: 10, atk: [0, 0], def: 0, mdef: 0, critRate: 0, physRes: 0, magRes: 0 ,attributeValue: 0},
	   defaultSkill: ["normal_strike"],
           skills: [], 
	   status: "alive",
           is260Unlocked: false,
	   icon: 'assets/icons/mercenaries/japan_ninja.gif'
           },

      "japan_doctor": { 
	   
	   id: "",
	   baseId: "japan_doctor",
	   rank: 0,
	   role: "soldier",
           name: "退魔師", classType: "doctor_woodenfish", mercNation: "japan",level: 1, totalExp: 0, bonusPoints: 0, attribute: "none",
	   stats: { str: 18, dex: 20, vit: 13, int: 10 },
           equipment: {
    		charm: null, head: null, glove: null,
    		weapon: null, body: null, belt: null,
    		ring1: null, boots: null, ring2: null,
		
		// 新增欄位
   		 lDeco1: null, lDeco2: null, lDeco3: null, lDeco4: null, lDeco5: null,
   		 rDeco6: null, rDeco7: null, rDeco8: null, rDeco9: null
		},
	   equipmentStat: { str: 0, dex: 0, vit: 0, int: 0, atk: 0, def: 0, physRes: 0, magRes: 0, critRate: 0, attributeValue: 0 },
           combat: { hp: 10, maxHp: 10, mp: 10, maxMp: 10, atk: [0, 0], def: 0, mdef: 0, critRate: 0, physRes: 0, magRes: 0 ,attributeValue: 0},
	   defaultSkill: ["normal_shot","restoreHp_normal"],
           skills: [], 
	   status: "alive",
           is260Unlocked: false,
	   icon: 'assets/icons/mercenaries/japan_doctor.gif'
           },

      "japan_wolfrider": { 
	   
	   id: "",
	   baseId: "japan_wolfrider",
	   rank: 0,
	   role: "soldier",
           name: "騎狼浪人", classType: "warrior_spear", mercNation: "japan",level: 1, totalExp: 0, bonusPoints: 0, attribute: "none",
	   stats: { str: 30, dex: 30, vit: 10, int: 0 },
           equipment: {
    		charm: null, head: null, glove: null,
    		weapon: null, body: null, belt: null,
    		ring1: null, boots: null, ring2: null,
		
		// 新增欄位
   		 lDeco1: null, lDeco2: null, lDeco3: null, lDeco4: null, lDeco5: null,
   		 rDeco6: null, rDeco7: null, rDeco8: null, rDeco9: null
		},
	   equipmentStat: { str: 0, dex: 0, vit: 0, int: 0, atk: 0, def: 0, physRes: 0, magRes: 0, critRate: 0, attributeValue: 0 },
           combat: { hp: 10, maxHp: 10, mp: 10, maxMp: 10, atk: [0, 0], def: 0, mdef: 0, critRate: 0, physRes: 0, magRes: 0 ,attributeValue: 0},
	   defaultSkill: ["normal_strike"],
           skills: [], 
	   status: "alive",
           is260Unlocked: false,
	   icon: 'assets/icons/mercenaries/japan_wolfrider.gif'
           },

      "japan_rider": { 
	   
	   id: "",
	   baseId: "japan_rider",
	   rank: 0,
	   role: "soldier",
           name: "騎馬武士", classType: "warrior_doublesword", mercNation: "japan",level: 1, totalExp: 0, bonusPoints: 0, attribute: "none",
	   stats: { str: 40, dex: 25, vit: 6, int: 0 },
           equipment: {
    		charm: null, head: null, glove: null,
    		weapon: null, body: null, belt: null,
    		ring1: null, boots: null, ring2: null,
		
		// 新增欄位
   		 lDeco1: null, lDeco2: null, lDeco3: null, lDeco4: null, lDeco5: null,
   		 rDeco6: null, rDeco7: null, rDeco8: null, rDeco9: null
		},
	   equipmentStat: { str: 0, dex: 0, vit: 0, int: 0, atk: 0, def: 0, physRes: 0, magRes: 0, critRate: 0, attributeValue: 0 },
           combat: { hp: 10, maxHp: 10, mp: 10, maxMp: 10, atk: [0, 0], def: 0, mdef: 0, critRate: 0, physRes: 0, magRes: 0 ,attributeValue: 0},
	   defaultSkill: ["normal_strike"],
           skills: [], 
	   status: "alive",
           is260Unlocked: false,
	   icon: 'assets/icons/mercenaries/japan_rider.gif'
           },

		//------ 台灣 -------

      "taiwan_beastwarrior": { 
	   
	   id: "",
	   baseId: "taiwan_beastwarrior",
	   rank: 0,
	   role: "soldier",
           name: "野獸戰士", classType: "warrior_axe", mercNation: "taiwan",level: 1, totalExp: 0, bonusPoints: 0, attribute: "none",
	   stats: { str: 40, dex: 15, vit: 16, int: 0 },
           equipment: {
    		charm: null, head: null, glove: null,
    		weapon: null, body: null, belt: null,
    		ring1: null, boots: null, ring2: null,
		
		// 新增欄位
   		 lDeco1: null, lDeco2: null, lDeco3: null, lDeco4: null, lDeco5: null,
   		 rDeco6: null, rDeco7: null, rDeco8: null, rDeco9: null
		},
	   equipmentStat: { str: 0, dex: 0, vit: 0, int: 0, atk: 0, def: 0, physRes: 0, magRes: 0, critRate: 0, attributeValue: 0 },
           combat: { hp: 10, maxHp: 10, mp: 10, maxMp: 10, atk: [0, 0], def: 0, mdef: 0, critRate: 0, physRes: 0, magRes: 0,attributeValue: 0 },
	   defaultSkill: ["normal_strike"],
           skills: [], 
	   status: "alive",
           is260Unlocked: false,
	   icon: 'assets/icons/mercenaries/taiwan_beastwarrior.gif'
           },

      "taiwan_amazon": { 
	   
	   id: "",
	   baseId: "taiwan_amazon",
	   rank: 0,
	   role: "soldier",
           name: "原住民戰士", classType: "warrior_slingshot", mercNation: "taiwan",level: 1, totalExp: 0, bonusPoints: 0, attribute: "none",
	   stats: { str: 22, dex: 22, vit: 10, int: 0 },
           equipment: {
    		charm: null, head: null, glove: null,
    		weapon: null, body: null, belt: null,
    		ring1: null, boots: null, ring2: null,
		
		// 新增欄位
   		 lDeco1: null, lDeco2: null, lDeco3: null, lDeco4: null, lDeco5: null,
   		 rDeco6: null, rDeco7: null, rDeco8: null, rDeco9: null
		},
	   equipmentStat: { str: 0, dex: 0, vit: 0, int: 0, atk: 0, def: 0, physRes: 0, magRes: 0, critRate: 0, attributeValue: 0 },
           combat: { hp: 10, maxHp: 10, mp: 10, maxMp: 10, atk: [0, 0], def: 0, mdef: 0, critRate: 0, physRes: 0, magRes: 0,attributeValue: 0 },
	   defaultSkill: ["normal_strike"],
           skills: [], 
	   status: "alive",
           is260Unlocked: false,
	   icon: 'assets/icons/mercenaries/taiwan_amazon.gif'
           },

      "taiwan_doctor": { 
	   
	   id: "",
	   baseId: "taiwan_doctor",
	   rank: 0,
	   role: "soldier",
           name: "咒術士", classType: "doctor_prayerbeads", mercNation: "taiwan",level: 1, totalExp: 0, bonusPoints: 0, attribute: "none",
	   stats: { str: 23, dex: 23, vit: 10, int: 5 },
           equipment: {
    		charm: null, head: null, glove: null,
    		weapon: null, body: null, belt: null,
    		ring1: null, boots: null, ring2: null,
		
		// 新增欄位
   		 lDeco1: null, lDeco2: null, lDeco3: null, lDeco4: null, lDeco5: null,
   		 rDeco6: null, rDeco7: null, rDeco8: null, rDeco9: null
		},
	   equipmentStat: { str: 0, dex: 0, vit: 0, int: 0, atk: 0, def: 0, physRes: 0, magRes: 0, critRate: 0, attributeValue: 0 },
           combat: { hp: 10, maxHp: 10, mp: 10, maxMp: 10, atk: [0, 0], def: 0, mdef: 0, critRate: 0, physRes: 0, magRes: 0 ,attributeValue: 0},
	   defaultSkill: ["normal_shot","restoreHp_normal"],
           skills: [], 
	   status: "alive",
           is260Unlocked: false,
	   icon: 'assets/icons/mercenaries/taiwan_doctor.gif'
           },

      "taiwan_stafffighter": { 
	   
	   id: "",
	   baseId: "taiwan_stafffighter",
	   rank: 0,
	   role: "soldier",
           name: "棒術師", classType: "warrior_staff", mercNation: "taiwan",level: 1, totalExp: 0, bonusPoints: 0, attribute: "none",
	   stats: { str: 35, dex: 25, vit: 20, int: 0 },
           equipment: {
    		charm: null, head: null, glove: null,
    		weapon: null, body: null, belt: null,
    		ring1: null, boots: null, ring2: null,
		
		// 新增欄位
   		 lDeco1: null, lDeco2: null, lDeco3: null, lDeco4: null, lDeco5: null,
   		 rDeco6: null, rDeco7: null, rDeco8: null, rDeco9: null
		},
	   equipmentStat: { str: 0, dex: 0, vit: 0, int: 0, atk: 0, def: 0, physRes: 0, magRes: 0, critRate: 0, attributeValue: 0 },
           combat: { hp: 10, maxHp: 10, mp: 10, maxMp: 10, atk: [0, 0], def: 0, mdef: 0, critRate: 0, physRes: 0, magRes: 0 ,attributeValue: 0},
	   defaultSkill: ["normal_strike"],
           skills: [], 
	   status: "alive",
           is260Unlocked: false,
	   icon: 'assets/icons/mercenaries/taiwan_stafffighter.gif'
           },

      "taiwan_barbarian": { 
	   
	   id: "",
	   baseId: "taiwan_barbarian",
	   rank: 0,
	   role: "soldier",
           name: "斧頭巨漢", classType: "warrior_axe", mercNation: "taiwan",level: 1, totalExp: 0, bonusPoints: 0, attribute: "none",
	   stats: { str: 45, dex: 10, vit: 20, int: 0 },
           equipment: {
    		charm: null, head: null, glove: null,
    		weapon: null, body: null, belt: null,
    		ring1: null, boots: null, ring2: null,
		
		// 新增欄位
   		 lDeco1: null, lDeco2: null, lDeco3: null, lDeco4: null, lDeco5: null,
   		 rDeco6: null, rDeco7: null, rDeco8: null, rDeco9: null
		},
	   equipmentStat: { str: 0, dex: 0, vit: 0, int: 0, atk: 0, def: 0, physRes: 0, magRes: 0, critRate: 0, attributeValue: 0 },
           combat: { hp: 10, maxHp: 10, mp: 10, maxMp: 10, atk: [0, 0], def: 0, mdef: 0, critRate: 0, physRes: 0, magRes: 0,attributeValue: 0 },
	   defaultSkill: ["normal_strike"],
           skills: [], 
	   status: "alive",
           is260Unlocked: false,
	   icon: 'assets/icons/mercenaries/taiwan_barbarian.gif'
           },

      "taiwan_gunner": { 
	   
	   id: "",
	   baseId: "taiwan_gunner",
	   rank: 0,
	   role: "soldier",
           name: "西洋槍手", classType: "gunner", mercNation: "taiwan",level: 1, totalExp: 0, bonusPoints: 0, attribute: "none",
	   stats: { str: 15, dex: 30, vit: 15, int: 0 },
           equipment: {
    		charm: null, head: null, glove: null,
    		weapon: null, body: null, belt: null,
    		ring1: null, boots: null, ring2: null,
		
		// 新增欄位
   		 lDeco1: null, lDeco2: null, lDeco3: null, lDeco4: null, lDeco5: null,
   		 rDeco6: null, rDeco7: null, rDeco8: null, rDeco9: null
		},
	   equipmentStat: { str: 0, dex: 0, vit: 0, int: 0, atk: 0, def: 0, physRes: 0, magRes: 0, critRate: 0, attributeValue: 0 },
           combat: { hp: 10, maxHp: 10, mp: 10, maxMp: 10, atk: [0, 0], def: 0, mdef: 0, critRate: 0, physRes: 0, magRes: 0 ,attributeValue: 0},
	   defaultSkill: ["normal_strike"],
           skills: [], 
	   status: "alive",
           is260Unlocked: false,
	   icon: 'assets/icons/mercenaries/taiwan_gunner.gif'
           },

      "taiwan_sorcerer": { 
	   
	   id: "",
	   baseId: "taiwan_sorcerer",
	   rank: 0,
	   role: "soldier",
           name: "念力師", classType: "phyDebuff", mercNation: "taiwan",level: 1, totalExp: 0, bonusPoints: 0, attribute: "none",
	   stats: { str: 25, dex: 20, vit: 10, int: 5 },
           equipment: {
    		charm: null, head: null, glove: null,
    		weapon: null, body: null, belt: null,
    		ring1: null, boots: null, ring2: null,
		
		// 新增欄位
   		 lDeco1: null, lDeco2: null, lDeco3: null, lDeco4: null, lDeco5: null,
   		 rDeco6: null, rDeco7: null, rDeco8: null, rDeco9: null
		},
	   equipmentStat: { str: 0, dex: 0, vit: 0, int: 0, atk: 0, def: 0, physRes: 0, magRes: 0, critRate: 0, attributeValue: 0 },
           combat: { hp: 10, maxHp: 10, mp: 10, maxMp: 10, atk: [0, 0], def: 0, mdef: 0, critRate: 0, physRes: 0, magRes: 0 ,attributeValue: 0},
	   defaultSkill: ["normal_shot"],
           skills: [], 
	   status: "alive",
           is260Unlocked: false,
	   icon: 'assets/icons/mercenaries/taiwan_sorcerer.gif'
           },

		//------ 中國 -------

     "china_cannoneer": { 

           id: "",
           level:1,
	   baseId: "china_cannoneer",
	   rank: 1, 
           role: "soldier",
           name: "火砲手", classType: "cannon", mercNation: "china",level: 1, totalExp: 0, bonusPoints: 0, attribute: "none",
	   stats: { str: 37, dex: 10, vit: 19, int: 0 },
           equipment: {
    		charm: null, head: null, glove: null,
    		weapon: null, body: null, belt: null,
    		ring1: null, boots: null, ring2: null,
		
		// 新增欄位
   		 lDeco1: null, lDeco2: null, lDeco3: null, lDeco4: null, lDeco5: null,
   		 rDeco6: null, rDeco7: null, rDeco8: null, rDeco9: null
		},
	   equipmentStat: { str: 0, dex: 0, vit: 0, int: 0, atk: 0, def: 0, physRes: 0, magRes: 0, critRate: 0, attributeValue: 0 },
           combat: { hp: 10, maxHp: 10, mp: 10, maxMp: 10, atk: [0, 0], def: 0, mdef: 0, critRate: 0, physRes: 0, magRes: 0,attributeValue: 0 },
	   defaultSkill: ["normal_shot"],
           skills: [], 
	   status: "alive",
	   buffs: [],
	   specialAbility: null,
	   is260Unlocked: false,
	   icon: 'assets/icons/mercenaries/china_cannoneer.gif'
           },

     "china_explorer": { 

           id: "",
           level:1,
	   baseId: "china_explorer",
	   rank: 1,
           role: "soldier", 
           name: "冒險家", classType: "scholar", mercNation: "china",level: 1, totalExp: 0, bonusPoints: 0, attribute: "none",
	   stats: { str: 26, dex: 25, vit: 15, int: 0 },
           equipment: {
    		charm: null, head: null, glove: null,
    		weapon: null, body: null, belt: null,
    		ring1: null, boots: null, ring2: null,
		
		// 新增欄位
   		 lDeco1: null, lDeco2: null, lDeco3: null, lDeco4: null, lDeco5: null,
   		 rDeco6: null, rDeco7: null, rDeco8: null, rDeco9: null
		},
	   equipmentStat: { str: 0, dex: 0, vit: 0, int: 0, atk: 0, def: 0, physRes: 0, magRes: 0, critRate: 0, attributeValue: 0 },
           combat: { hp: 10, maxHp: 10, mp: 10, maxMp: 10, atk: [0, 0], def: 0, mdef: 0, critRate: 0, physRes: 0, magRes: 0,attributeValue: 0 },
	   defaultSkill: ["normal_shot"],
           skills: [], 
	   status: "alive",
	   buffs: [],
	   specialAbility: null,
	   is260Unlocked: false,
	   icon: 'assets/icons/mercenaries/china_explorer.gif'
           },

     "china_bigsword": { 

           id: "",
           level:1,
	   baseId: "china_bigsword",
	   rank: 1, 
           role: "soldier",
           name: "大刀武士", classType: "warrior_sword", mercNation: "china",level: 1, totalExp: 0, bonusPoints: 0, attribute: "none",
	   stats: { str: 38, dex: 22, vit: 19, int: 0 },
           equipment: {
    		charm: null, head: null, glove: null,
    		weapon: null, body: null, belt: null,
    		ring1: null, boots: null, ring2: null,
		
		// 新增欄位
   		 lDeco1: null, lDeco2: null, lDeco3: null, lDeco4: null, lDeco5: null,
   		 rDeco6: null, rDeco7: null, rDeco8: null, rDeco9: null
		},
	   equipmentStat: { str: 0, dex: 0, vit: 0, int: 0, atk: 0, def: 0, physRes: 0, magRes: 0, critRate: 0, attributeValue: 0 },
           combat: { hp: 10, maxHp: 10, mp: 10, maxMp: 10, atk: [0, 0], def: 0, mdef: 0, critRate: 0, physRes: 0, magRes: 0,attributeValue: 0 },
	   defaultSkill: ["normal_strike"],
           skills: [], 
	   status: "alive",
	   buffs: [],
	   specialAbility: null,
	   is260Unlocked: false,
	   icon: 'assets/icons/mercenaries/china_bigsword.gif'
           },

     "china_martialartist": { 

           id: "",
           level:1,
	   baseId: "china_martialartist",
	   rank: 1, 
           role: "soldier",
           name: "武道家", classType: "martialartist", mercNation: "china",level: 1, totalExp: 0, bonusPoints: 0, attribute: "none",
	   stats: { str: 35, dex: 20, vit: 18, int: 0 },
           equipment: {
    		charm: null, head: null, glove: null,
    		weapon: null, body: null, belt: null,
    		ring1: null, boots: null, ring2: null,
		
		// 新增欄位
   		 lDeco1: null, lDeco2: null, lDeco3: null, lDeco4: null, lDeco5: null,
   		 rDeco6: null, rDeco7: null, rDeco8: null, rDeco9: null
		},
	   equipmentStat: { str: 0, dex: 0, vit: 0, int: 0, atk: 0, def: 0, physRes: 0, magRes: 0, critRate: 0, attributeValue: 0 },
           combat: { hp: 10, maxHp: 10, mp: 10, maxMp: 10, atk: [0, 0], def: 0, mdef: 0, critRate: 0, physRes: 0, magRes: 0,attributeValue: 0 },
	   defaultSkill: ["normal_strike"],
           skills: [], 
	   status: "alive",
	   buffs: [],
	   specialAbility: null,
	   is260Unlocked: false,
	   icon: 'assets/icons/mercenaries/china_martialartist.gif'
           },

     "china_spear": { 

           id: "",
           level:1,
	   baseId: "china_spear",
	   rank: 1, 
           role: "soldier",
           name: "長槍武士", classType: "warrior_spear", mercNation: "china",level: 1, totalExp: 0, bonusPoints: 0, attribute: "none",
	   stats: { str: 30, dex: 30, vit: 10, int: 0 },
           equipment: {
    		charm: null, head: null, glove: null,
    		weapon: null, body: null, belt: null,
    		ring1: null, boots: null, ring2: null,
		
		// 新增欄位
   		 lDeco1: null, lDeco2: null, lDeco3: null, lDeco4: null, lDeco5: null,
   		 rDeco6: null, rDeco7: null, rDeco8: null, rDeco9: null
		},
	   equipmentStat: { str: 0, dex: 0, vit: 0, int: 0, atk: 0, def: 0, physRes: 0, magRes: 0, critRate: 0, attributeValue: 0 },
           combat: { hp: 10, maxHp: 10, mp: 10, maxMp: 10, atk: [0, 0], def: 0, mdef: 0, critRate: 0, physRes: 0, magRes: 0 ,attributeValue: 0},
	   defaultSkill: ["normal_strike"],
           skills: [], 
	   status: "alive",
	   buffs: [],
	   specialAbility: null,
	   is260Unlocked: false,
	   icon: 'assets/icons/mercenaries/china_spear.gif'
           },

     "china_doctor": { 

           id: "",
           level:1,
	   baseId: "china_doctor",
	   rank: 1, 
           role: "soldier",
           name: "修道憎", classType: "doctor_woodenfish", mercNation: "china",level: 1, totalExp: 0, bonusPoints: 0, attribute: "none",
	   stats: { str: 15, dex: 23, vit: 10, int: 10 },
           equipment: {
    		charm: null, head: null, glove: null,
    		weapon: null, body: null, belt: null,
    		ring1: null, boots: null, ring2: null,
		
		// 新增欄位
   		 lDeco1: null, lDeco2: null, lDeco3: null, lDeco4: null, lDeco5: null,
   		 rDeco6: null, rDeco7: null, rDeco8: null, rDeco9: null
		},
	   equipmentStat: { str: 0, dex: 0, vit: 0, int: 0, atk: 0, def: 0, physRes: 0, magRes: 0, critRate: 0, attributeValue: 0 },
           combat: { hp: 10, maxHp: 10, mp: 10, maxMp: 10, atk: [0, 0], def: 0, mdef: 0, critRate: 0, physRes: 0, magRes: 0,attributeValue: 0 },
	   defaultSkill: ["normal_shot","restoreHp_normal"],
           skills: [], 
	   status: "alive",
	   buffs: [],
	   specialAbility: null,
	   is260Unlocked: false,
	   icon: 'assets/icons/mercenaries/china_doctor.gif'
           },

     "china_taoist": { 

           id: "",
           level:1,
	   baseId: "china_taoist",
	   rank: 1, 
           role: "soldier",
           name: "道術師", classType: "supportMp", mercNation: "china",level: 1, totalExp: 0, bonusPoints: 0, attribute: "none",
	   stats: { str: 10, dex: 15, vit: 15, int: 31 },
           equipment: {
    		charm: null, head: null, glove: null,
    		weapon: null, body: null, belt: null,
    		ring1: null, boots: null, ring2: null,
		
		// 新增欄位
   		 lDeco1: null, lDeco2: null, lDeco3: null, lDeco4: null, lDeco5: null,
   		 rDeco6: null, rDeco7: null, rDeco8: null, rDeco9: null
		},
	   equipmentStat: { str: 0, dex: 0, vit: 0, int: 0, atk: 0, def: 0, physRes: 0, magRes: 0, critRate: 0, attributeValue: 0 },
           combat: { hp: 10, maxHp: 10, mp: 10, maxMp: 10, atk: [0, 0], def: 0, mdef: 0, critRate: 0, physRes: 0, magRes: 0,attributeValue: 0 },
	   defaultSkill: ["normal_strike","restoreMp_normal"],
           skills: [], 
	   status: "alive",
	   buffs: [],
	   specialAbility: null,
	   is260Unlocked: false,
	   icon: 'assets/icons/mercenaries/china_taoist.gif'
           }		





 
},

    
    maps: {
        'menu_village': { name: '村莊', type: 'safe' }, // 設定為安全
	'menu_battle': { name: '戰鬥', type: 'safe', }, // 指向一個戰鬥地圖
    	'menu_inventory': { name: '背包', type: 'safe' },
    	'menu_mercenary': { name: '傭兵', type: 'safe' },
   	'menu_shop': { name: '商店', type: 'safe' },
        'menu_settings': { name: '設定', type: 'safe' },


    	'battlemap_test'       : {name: '測試地圖',type: 'battle',monsters: ['bandit2']},
    	'battlemap_beginnermap': {name: '新手地圖',type: 'battle',monsters: ['chawoo', 'deer','bandit','butterfly']},
	'battlemap_evilLake'   : {name: '千年湖'  ,type: 'battle', 
        		floors: [
            			{ id: 'evilLake_1', name: '一樓', monsters: ['evilLake_juck','evilLake_queen'] },
            			{ id: 'evilLake_2', name: '二樓', monsters: ['evilLake_femaleshaman','evilLake_auta'] }
        			]
	},

    	'battlemap_mtHalla': {name: '漢拏山',type: 'battle',monsters: ['mtHalla_frog','mtHalla_dokkaebi','mtHalla_haruBang','mtHalla_goldDragon']},

	'battlemap_geojeUnderseaTunnel'   : {name: '巨濟海底洞穴'  ,type: 'battle', 
        		floors: [
            			{ id: 'geojeUnderseaTunnel_1', name: '一樓', monsters: ['geojeUnderseaTunnel_bat','geojeUnderseaTunnel_frog','geojeUnderseaTunnel_seahorse','geojeUnderseaTunnel_turtle'] },
            			{ id: 'geojeUnderseaTunnel_2', name: '二樓', monsters: ['geojeUnderseaTunnel_seahorse','geojeUnderseaTunnel_turtle','geojeUnderseaTunnel_seahorseBoss'] }
        			]
	},

	'battlemap_gosuCave'   : {name: '高手洞穴'  ,type: 'battle', 
        		floors: [
            			{ id: 'gosuCave_1', name: '一樓', monsters: ['gosuCave_bat','gosuCave_frog'] },
            			{ id: 'gosuCave_2', name: '二樓', monsters: ['gosuCave_dokkaebi','gosuCave_Starfish','gosuCave_frog'] },
				{ id: 'gosuCave_3', name: '三樓(未開放)', monsters: ['bandit2'] } 
        			]
	


      
      }
    },

MerRecruitment: {
        // 國家代號 -> 兵種列表
        "korea": [
            { id: "korea_archer", name: "弓手", cost: 4800, icon: 'assets/icons/mercenaries/korea_archer.gif',
		 mercNation: "korea", stats: { str: 20, dex: 20, vit: 10, int: 0 }},

            { id: "korea_butcher", name: "刀手", cost: 9000, icon: 'assets/icons/mercenaries/korea_butcher.gif', 
		mercNation: "korea", stats: { str: 30, dex: 21, vit: 20, int: 0 }},

            { id: "korea_mountedarcher", name: "騎馬弓手", cost: 9000, icon: 'assets/icons/mercenaries/korea_mountedarcher.gif', 
		mercNation: "korea", stats: { str: 18, dex: 18, vit: 12, int: 0 }},

            { id: "korea_doctor", name: "醫術師", cost: 6300, icon: 'assets/icons/mercenaries/korea_doctor.gif', 
		mercNation: "korea", stats: { str: 20, dex: 15, vit: 10, int: 15 }},

            { id: "korea_monk", name: "破戒憎", cost: 6000, icon: 'assets/icons/mercenaries/korea_monk.gif', 
		mercNation: "korea", stats: { str: 25, dex: 20, vit: 10, int: 5 }},

            { id: "korea_lancer", name: "槍兵", cost: 5400, icon: 'assets/icons/mercenaries/korea_lancer.gif', 
		mercNation: "korea", stats: { str: 34, dex: 20, vit: 16, int: 0 }},

            { id: "korea_confucianist", name: "儒生", cost: 7500, icon: 'assets/icons/mercenaries/korea_confucianist.gif', 
		mercNation: "korea", stats: { str: 15, dex: 20, vit: 15, int: 6 }}

        ],

        "japan": [
            { id: "japan_gunner", name: "鐵砲浪人", cost: 4800, icon: 'assets/icons/mercenaries/japan_gunner.gif',
		mercNation: "japan", stats: { str: 18, dex: 25, vit: 12, int: 0 }}, 

            { id: "japan_sorceress", name: "陰陽師", cost: 6300, icon: 'assets/icons/mercenaries/japan_sorceress.gif',
		mercNation: "japan", stats: { str: 25, dex: 15, vit: 10, int: 0 }},

            { id: "japan_sword", name: "用劍浪人", cost: 6000, icon: 'assets/icons/mercenaries/japan_sword.gif',
		mercNation: "japan", stats: { str: 38, dex: 25, vit: 8, int: 0 }},

            { id: "japan_ninja", name: "忍者", cost: 7200, icon: 'assets/icons/mercenaries/japan_ninja.gif',
		mercNation: "japan", stats: { str: 30, dex: 40, vit: 10, int: 0 }},

            { id: "japan_doctor", name: "退魔師", cost: 6300, icon: 'assets/icons/mercenaries/japan_doctor.gif',
		mercNation: "japan", stats: { str: 18, dex: 20, vit: 13, int: 10 }},

            { id: "japan_wolfrider", name: "騎狼浪人", cost: 9000, icon: 'assets/icons/mercenaries/japan_wolfrider.gif',
		mercNation: "japan", stats: { str: 30, dex: 30, vit: 10, int: 0 }},

            { id: "japan_rider", name: "騎馬武士", cost: 9000, icon: 'assets/icons/mercenaries/japan_rider.gif',
		mercNation: "japan", stats: { str: 40, dex: 25, vit: 6, int: 0 }}
        ],

        "taiwan": [
            { id: "taiwan_beastwarrior", name: "野獸戰士", cost: 9000, icon: 'assets/icons/mercenaries/taiwan_beastwarrior.gif',
		mercNation: "taiwan", stats: { str: 40, dex: 15, vit: 16, int: 0 }}, 

            { id: "taiwan_amazon", name: "原住民戰士", cost: 8500, icon: 'assets/icons/mercenaries/taiwan_amazon.gif',
		mercNation: "taiwan", stats: { str: 22, dex: 22, vit: 10, int: 0 }},

            { id: "taiwan_doctor", name: "咒術士", cost: 6000, icon: 'assets/icons/mercenaries/taiwan_doctor.gif',
		mercNation: "taiwan", stats: { str: 23, dex: 23, vit: 10, int: 5 }},

            { id: "taiwan_stafffighter", name: "棒術師", cost: 8500, icon: 'assets/icons/mercenaries/taiwan_stafffighter.gif',
		mercNation: "taiwan", stats: { str: 35, dex: 25, vit: 20, int: 0 }},

            { id: "taiwan_barbarian", name: "斧頭巨漢", cost: 6500, icon: 'assets/icons/mercenaries/taiwan_barbarian.gif',
		mercNation: "taiwan", stats: { str: 45, dex: 10, vit: 20, int: 0 }},

            { id: "taiwan_gunner", name: "西洋槍手", cost: 5000, icon: 'assets/icons/mercenaries/taiwan_gunner.gif',
		mercNation: "taiwan", stats: { str: 15, dex: 30, vit: 15, int: 0 }},

            { id: "taiwan_sorcerer", name: "念力師", cost: 6300, icon: 'assets/icons/mercenaries/taiwan_sorcerer.gif',
		mercNation: "taiwan", stats: { str: 25, dex: 20, vit: 10, int: 5 }}
        ],

        "china": [
            { id: "china_taoist", name: "道術師", cost: 9000, icon: 'assets/icons/mercenaries/china_taoist.gif',
		 mercNation: "china", stats: { str: 10, dex: 15, vit: 15, int: 31 }},

            { id: "china_cannoneer", name: "火砲手", cost: 7200, icon: 'assets/icons/mercenaries/china_cannoneer.gif',
		 mercNation: "china", stats: { str: 37, dex: 10, vit: 19, int: 0 }},

            { id: "china_explorer", name: "冒險家", cost: 6200, icon: 'assets/icons/mercenaries/china_explorer.gif',
		 mercNation: "china", stats: { str: 26, dex: 25, vit: 15, int: 0 }},

            { id: "china_bigsword", name: "大刀武士", cost: 6300, icon: 'assets/icons/mercenaries/china_bigsword.gif',
		 mercNation: "china", stats: { str: 38, dex: 22, vit: 19, int: 0 }},

            { id: "china_martialartist", name: "武道家", cost: 5800, icon: 'assets/icons/mercenaries/china_martialartist.gif',
		 mercNation: "china", stats: { str: 35, dex: 20, vit: 18, int: 0 }},

            { id: "china_spear", name: "長槍武士", cost: 9000, icon: 'assets/icons/mercenaries/china_spear.gif',
		 mercNation: "china", stats: { str: 30, dex: 30, vit: 10, int: 0 }},

            { id: "china_doctor", name: "修道憎", cost: 4600, icon: 'assets/icons/mercenaries/china_doctor.gif',
		 mercNation: "china", stats: { str: 15, dex: 23, vit: 10, int: 10 }}
        ]

    },



	expTable: [
        { level: 1, total: 0, bonus: 0 },
        { level: 2, total: 20, bonus: 4 },
        { level: 3, total: 50, bonus: 4 },
        { level: 4, total: 100, bonus: 4 },
        { level: 5, total: 180, bonus: 4 },
        { level: 6, total: 300, bonus: 4 },
        { level: 7, total: 470, bonus: 4 },
        { level: 8, total: 700, bonus: 4 },
        { level: 9, total: 1000, bonus: 4 },
        { level: 10, total: 1380, bonus: 4 },
        { level: 11, total: 1850, bonus: 4 },
        { level: 12, total: 2430, bonus: 4 },
        { level: 13, total: 3210, bonus: 4 },
        { level: 14, total: 4280, bonus: 4 },
        { level: 15, total: 5730, bonus: 4 },
        { level: 16, total: 7650, bonus: 4 },
        { level: 17, total: 10130, bonus: 4 },
        { level: 18, total: 13260, bonus: 4 },
        { level: 19, total: 17130, bonus: 4 },
        { level: 20, total: 21830, bonus: 4 },
        { level: 21, total: 27450, bonus: 4 },
        { level: 22, total: 34080, bonus: 4 },
        { level: 23, total: 41810, bonus: 4 },
        { level: 24, total: 50740, bonus: 4 },
        { level: 25, total: 60970, bonus: 4 },
        { level: 26, total: 72600, bonus: 4 },
        { level: 27, total: 85730, bonus: 4 },
        { level: 28, total: 100460, bonus: 4 },
        { level: 29, total: 116890, bonus: 4 },
        { level: 30, total: 135120, bonus: 4 },
	{ level: 31, total: 155250, bonus: 4 },
        { level: 32, total: 177380, bonus: 4 },
        { level: 33, total: 201660, bonus: 4 },
        { level: 34, total: 228240, bonus: 4 },
        { level: 35, total: 257270, bonus: 4 },
        { level: 36, total: 288900, bonus: 4 },
        { level: 37, total: 323280, bonus: 4 },
        { level: 38, total: 360560, bonus: 4 },
        { level: 39, total: 400890, bonus: 4 },
        { level: 40, total: 444420, bonus: 4 },
        { level: 41, total: 491330, bonus: 4 },
        { level: 42, total: 541680, bonus: 4 },
        { level: 43, total: 595760, bonus: 4 },
        { level: 44, total: 653740, bonus: 4 },
        { level: 45, total: 715820, bonus: 4 },
        { level: 46, total: 782200, bonus: 4 },
        { level: 47, total: 853080, bonus: 4 },
        { level: 48, total: 928660, bonus: 4 },
        { level: 49, total: 1009140, bonus: 4 },
        { level: 50, total: 1094720, bonus: 4 },
        { level: 51, total: 1185600, bonus: 4 },
        { level: 52, total: 1281980, bonus: 4 },
        { level: 53, total: 1384110, bonus: 4 },
        { level: 54, total: 1492240, bonus: 4 },
        { level: 55, total: 1606620, bonus: 4 },
        { level: 56, total: 1727500, bonus: 4 },
        { level: 57, total: 1855130, bonus: 4 },
        { level: 58, total: 1989760, bonus: 4 },
        { level: 59, total: 2131640, bonus: 4 },
        { level: 60, total: 2281020, bonus: 4 },
        { level: 61, total: 2438150, bonus: 4 },
        { level: 62, total: 2603280, bonus: 4 },
        { level: 63, total: 2776710, bonus: 4 },
        { level: 64, total: 2958740, bonus: 4 },
        { level: 65, total: 3169670, bonus: 4 },
        { level: 66, total: 3349800, bonus: 4 },
        { level: 67, total: 3559430, bonus: 4 },
        { level: 68, total: 3778860, bonus: 4 },
        { level: 69, total: 4008390, bonus: 4 },
        { level: 70, total: 4248320, bonus: 4 },
	{ level: 71, total: 4498950, bonus: 4 },
        { level: 72, total: 4760580, bonus: 4 },
        { level: 73, total: 5033610, bonus: 4 },
        { level: 74, total: 5318440, bonus: 4 },
        { level: 75, total: 5615470, bonus: 4 },
        { level: 76, total: 5925100, bonus: 4 },
        { level: 77, total: 6247730, bonus: 4 },
        { level: 78, total: 6583760, bonus: 4 },
        { level: 79, total: 6933590, bonus: 4 },
        { level: 80, total: 7297620, bonus: 4 },
        { level: 81, total: 7676250, bonus: 4 },
        { level: 82, total: 8069880, bonus: 4 },
        { level: 83, total: 8479010, bonus: 4 },
        { level: 84, total: 8904140, bonus: 4 },
        { level: 85, total: 9345770, bonus: 4 },
        { level: 86, total: 9804400, bonus: 4 },
        { level: 87, total: 10280530, bonus: 4 },
        { level: 88, total: 10774660, bonus: 4 },
        { level: 89, total: 11287290, bonus: 4 },
        { level: 90, total: 11818920, bonus: 4 },
        { level: 91, total: 12370050, bonus: 4 },
        { level: 92, total: 12941180, bonus: 4 },
        { level: 93, total: 13533310, bonus: 4 },
        { level: 94, total: 14147440, bonus: 4 },
        { level: 95, total: 14784570, bonus: 4 },
        { level: 96, total: 15445700, bonus: 4 },
        { level: 97, total: 16131830, bonus: 4 },
        { level: 98, total: 16843960, bonus: 4 },
        { level: 99, total: 17583090, bonus: 4 },
        { level: 100, total: 18350220, bonus: 4 },
        { level: 101, total: 19146350, bonus: 4 },
        { level: 102, total: 19972480, bonus: 4 },
        { level: 103, total: 20829610, bonus: 4 },
        { level: 104, total: 21718740, bonus: 4 },
        { level: 105, total: 22640870, bonus: 4 },
        { level: 106, total: 23597000, bonus: 4 },
        { level: 107, total: 24588130, bonus: 4 },
        { level: 108, total: 25615260, bonus: 4 },
        { level: 109, total: 26679390, bonus: 4 },
        { level: 110, total: 27781520, bonus: 4 },
	{ level: 111, total: 28922650, bonus: 4 },
        { level: 112, total: 30103780, bonus: 4 },
        { level: 113, total: 31326410, bonus: 4 },
        { level: 114, total: 32592040, bonus: 4 },
        { level: 115, total: 33902170, bonus: 4 },
        { level: 116, total: 35258300, bonus: 4 },
        { level: 117, total: 36661930, bonus: 4 },
        { level: 118, total: 38114560, bonus: 4 },
        { level: 119, total: 39617690, bonus: 4 },
        { level: 120, total: 41172820, bonus: 5 },
        { level: 121, total: 42781450, bonus: 5 },
        { level: 122, total: 44445080, bonus: 5 },
        { level: 123, total: 46165210, bonus: 5 },
        { level: 124, total: 47943340, bonus: 5 },
        { level: 125, total: 49780970, bonus: 5 },
        { level: 126, total: 51679600, bonus: 5 },
        { level: 127, total: 53640730, bonus: 5 },
        { level: 128, total: 55665860, bonus: 5 },
        { level: 129, total: 57756490, bonus: 5 },
        { level: 130, total: 59914120, bonus: 6 },
        { level: 131, total: 62140250, bonus: 6 },
        { level: 132, total: 64436380, bonus: 6 },
        { level: 133, total: 66804510, bonus: 6 },
        { level: 134, total: 69246640, bonus: 6 },
        { level: 135, total: 71764770, bonus: 7 },
        { level: 136, total: 74360900, bonus: 7 },
        { level: 137, total: 77037030, bonus: 7 },
        { level: 138, total: 79795160, bonus: 7 },
        { level: 139, total: 82637290, bonus: 7 },
        { level: 140, total: 85565420, bonus: 8 },
        { level: 141, total: 88581550, bonus: 8 },
        { level: 142, total: 91687680, bonus: 8 },
        { level: 143, total: 94885810, bonus: 8 },
        { level: 144, total: 98117940, bonus: 8 },
        { level: 145, total: 101566070, bonus: 9 },
        { level: 146, total: 105052200, bonus: 9 },
        { level: 147, total: 108638330, bonus: 9 },
        { level: 148, total: 112326460, bonus: 9 },
        { level: 149, total: 116118590, bonus: 9 },
        { level: 150, total: 120016720, bonus: 10 },
        { level: 151, total: 124022850, bonus: 10 },
        { level: 152, total: 128138980, bonus: 10 },
        { level: 153, total: 132385110, bonus: 10 },
        { level: 154, total: 136781240, bonus: 10 },
        { level: 155, total: 141347370, bonus: 10 },
        { level: 156, total: 146103500, bonus: 10 },
        { level: 157, total: 151069630, bonus: 10 },
        { level: 158, total: 156265760, bonus: 10 },
        { level: 159, total: 161711890, bonus: 10 },
        { level: 160, total: 167428020, bonus: 11 },
	{ level: 161, total: 173434150, bonus: 11 },
        { level: 162, total: 179640280, bonus: 11 },
        { level: 163, total: 186436410, bonus: 11 },
        { level: 164, total: 193492540, bonus: 11 },
        { level: 165, total: 200958670, bonus: 11 },
        { level: 166, total: 208864800, bonus: 11 },
        { level: 167, total: 217240930, bonus: 11 },
        { level: 168, total: 226117060, bonus: 11 },
        { level: 169, total: 235523190, bonus: 11 },
        { level: 170, total: 245489320, bonus: 12 },
        { level: 171, total: 256045450, bonus: 12 },
        { level: 172, total: 267231580, bonus: 12 },
        { level: 173, total: 279087710, bonus: 12 },
        { level: 174, total: 291653840, bonus: 12 },
        { level: 175, total: 304969970, bonus: 13 },
        { level: 176, total: 319076100, bonus: 13 },
        { level: 177, total: 334012230, bonus: 13 },
        { level: 178, total: 349818360, bonus: 13 },
        { level: 179, total: 366534490, bonus: 13 },
        { level: 180, total: 384200620, bonus: 14 },
        { level: 181, total: 402856750, bonus: 14 },
        { level: 182, total: 422552880, bonus: 14 },
        { level: 183, total: 443359010, bonus: 14 },
        { level: 184, total: 467325140, bonus: 14 },
        { level: 185, total: 492981270, bonus: 14 },
        { level: 186, total: 522237400, bonus: 14 },
        { level: 187, total: 555693530, bonus: 14 },
        { level: 188, total: 593949660, bonus: 14 },
        { level: 189, total: 637605790, bonus: 14 },
        { level: 190, total: 688261920, bonus: 14 },
        { level: 191, total: 747918050, bonus: 14 },
        { level: 192, total: 818574180, bonus: 14 },
        { level: 193, total: 902230310, bonus: 14 },
        { level: 194, total: 1000886440, bonus: 14 },
        { level: 195, total: 1116542570, bonus: 14 },
        { level: 196, total: 1251198700, bonus: 15 },
        { level: 197, total: 1405854830, bonus: 15 },
        { level: 198, total: 1580510960, bonus: 15 },
        { level: 199, total: 1775167090, bonus: 15 },
        { level: 200, total: 1989823220, bonus: 15 },
        { level: 201, total: 2212479350, bonus: 16 },
        { level: 202, total: 2443135480, bonus: 16 },
        { level: 203, total: 2681791610, bonus: 16 },
        { level: 204, total: 2928447740, bonus: 16 },
        { level: 205, total: 3183103870, bonus: 16 },
        { level: 206, total: 3445760000, bonus: 17 },
        { level: 207, total: 3717416130, bonus: 17 },
        { level: 208, total: 3998072260, bonus: 17 },
        { level: 209, total: 4287728390, bonus: 17 },
        { level: 210, total: 4586384520, bonus: 17 },
        { level: 211, total: 4894040650, bonus: 18 },
        { level: 212, total: 5210696780, bonus: 18 },
        { level: 213, total: 5537352910, bonus: 18 },
        { level: 214, total: 5874009040, bonus: 18 },
        { level: 215, total: 6220665170, bonus: 18 },
        { level: 216, total: 6577321300, bonus: 18 },
        { level: 217, total: 6943977430, bonus: 19 },
        { level: 218, total: 7322633560, bonus: 19 },
        { level: 219, total: 7713289690, bonus: 19 },
        { level: 220, total: 8115945820, bonus: 19 },
	{ level: 221, total: 8530601950, bonus: 20 },
        { level: 222, total: 8957258080, bonus: 20 },
        { level: 223, total: 9398914210, bonus: 20 },
        { level: 224, total: 9855570340, bonus: 20 },
        { level: 225, total: 10327226470, bonus: 20 },
        { level: 226, total: 10813882600, bonus: 20 },
        { level: 227, total: 11315538730, bonus: 20 },
        { level: 228, total: 11835194860, bonus: 20 },
        { level: 229, total: 12372850990, bonus: 20 },
        { level: 230, total: 12928507120, bonus: 20 },
        { level: 231, total: 13502163250, bonus: 20 },
        { level: 232, total: 14093819380, bonus: 20 },
        { level: 233, total: 14708475510, bonus: 20 },
        { level: 234, total: 15346131640, bonus: 20 },
        { level: 235, total: 16006787770, bonus: 20 },
        { level: 236, total: 16690443900, bonus: 20 },
        { level: 237, total: 17397100030, bonus: 20 },
        { level: 238, total: 18133756160, bonus: 20 },
        { level: 239, total: 18900411290, bonus: 20 },
        { level: 240, total: 19697068420, bonus: 20 },
        { level: 241, total: 20523724550, bonus: 20 },
        { level: 242, total: 21380380680, bonus: 20 },
        { level: 243, total: 22277036810, bonus: 20 },
        { level: 244, total: 23213692940, bonus: 20 },
        { level: 245, total: 24190349070, bonus: 20 },
        { level: 246, total: 25217005200, bonus: 20 },
        { level: 247, total: 26303661330, bonus: 20 },
        { level: 248, total: 27460317460, bonus: 20 },
        { level: 249, total: 28686973590, bonus: 20 },
        { level: 250, total: 30000000000, bonus: 20 },
        { level: 251, total: 32313026410, bonus: 21 },
        { level: 252, total: 36846052820, bonus: 21 },
        { level: 253, total: 44829079230, bonus: 21 },
        { level: 254, total: 57452105640, bonus: 21 },
        { level: 255, total: 75965132050, bonus: 21 },
        { level: 256, total: 101578158460, bonus: 21 },
        { level: 257, total: 135511184870, bonus: 21 },
        { level: 258, total: 178984211280, bonus: 21 },
        { level: 259, total: 233217237690, bonus: 21 },
        { level: 260, total: 300000000000, bonus: 21 }

    ]
 };


// 模版
//"id_name": { 
//  name: "名字", type: "weapon", lv: 1, price: 0, isTradable: true, isQuestItem: false,
//  stats:  { atk: [min, max] },
//  skills: []
//},

