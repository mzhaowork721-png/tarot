// Tarot Daily Reading App

// 全局变量
let tarotDeck = [];
let todayCards = null;

// 四张牌的位置含义
const CARD_POSITIONS = ['过去', '现在', '建议', '今日关键能量'];

// DOM 元素
const drawButton = document.getElementById('drawButton');
const resultsSection = document.getElementById('resultsSection');
const cardsGrid = document.getElementById('cardsGrid');
const interpretationSection = document.getElementById('interpretationSection');
const interpretationContent = document.getElementById('interpretationContent');
const cardBacksContainer = document.getElementById('cardBacksContainer');

// 初始化
document.addEventListener('DOMContentLoaded', async () => {
    await loadTarotDeck();
    checkCardBackImage();
    initializeDeviceId();
    checkTodayReading();
    drawButton.addEventListener('click', drawCards);

    // 添加隐藏的重置按钮（用于测试）
    setupResetButton();
});

// 加载塔罗牌数据
async function loadTarotDeck() {
    try {
        const response = await fetch('tarot.json');
        tarotDeck = await response.json();
        console.log(`已加载 ${tarotDeck.length} 张塔罗牌`);
    } catch (error) {
        console.error('加载塔罗牌数据失败:', error);
        alert('加载塔罗牌数据失败，请刷新页面重试');
    }
}

// 检查牌背图片是否存在
function checkCardBackImage() {
    const img = new Image();
    img.onload = function() {
        // 图片存在，更新所有牌背
        const cardBackDesigns = document.querySelectorAll('.card-back-design');
        cardBackDesigns.forEach(design => {
            design.classList.add('has-image');
            design.style.setProperty('--card-back-image', 'url(assets/card-back.png)');
        });
    };
    img.onerror = function() {
        console.log('未找到 assets/card-back.png，使用CSS渐变牌背');
    };
    img.src = 'assets/card-back.png';
}

// 获取或生成设备唯一ID
function getDeviceId() {
    let deviceId = localStorage.getItem('tarot_device_id');

    if (!deviceId) {
        // 生成新的设备ID（使用时间戳 + 随机数确保唯一性）
        deviceId = generateUUID();
        localStorage.setItem('tarot_device_id', deviceId);
        console.log('生成新的设备ID:', deviceId);
    }

    return deviceId;
}

// 生成UUID（简化版）
function generateUUID() {
    // 使用时间戳和随机数生成唯一ID
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 15);
    const randomStr2 = Math.random().toString(36).substring(2, 15);
    return `${timestamp}-${randomStr}-${randomStr2}`;
}

// 初始化设备ID（确保在使用前已生成）
function initializeDeviceId() {
    const deviceId = getDeviceId();
    console.log('当前设备ID:', deviceId);
}

// 获取今天的日期 + 设备ID 种子
function getTodaySeed() {
    const today = new Date();
    const dateString = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
    const deviceId = getDeviceId();
    // 组合日期和设备ID作为种子
    return `${dateString}-${deviceId}`;
}

// 获取今天的日期字符串（用于存储标识）
function getTodayDateString() {
    const today = new Date();
    return `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
}

// 基于种子的伪随机数生成器 (Seeded Random)
class SeededRandom {
    constructor(seed) {
        this.seed = this.hashCode(seed);
    }

    hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash);
    }

    next() {
        this.seed = (this.seed * 9301 + 49297) % 233280;
        return this.seed / 233280;
    }

    nextInt(max) {
        return Math.floor(this.next() * max);
    }

    shuffle(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = this.nextInt(i + 1);
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
}

// 检查今天是否已经抽过牌
function checkTodayReading() {
    const saved = localStorage.getItem('tarot_daily_reading');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            const todayDateString = getTodayDateString();
            const currentDeviceId = getDeviceId();

            // 检查是否是同一天且同一设备
            if (data.date === todayDateString && data.deviceId === currentDeviceId) {
                todayCards = data.cards;
                displayCards(todayCards);
                generateInterpretation(todayCards);
                drawButton.textContent = '今日已抽牌';
                drawButton.disabled = true;
            }
        } catch (error) {
            console.error('读取本地存储失败:', error);
        }
    }
}

// 抽牌
function drawCards() {
    if (tarotDeck.length === 0) {
        alert('塔罗牌数据尚未加载完成，请稍候再试');
        return;
    }

    const seed = getTodaySeed();
    const rng = new SeededRandom(seed);

    // 洗牌并抽取4张
    const shuffled = rng.shuffle(tarotDeck);
    const drawnCards = shuffled.slice(0, 4);

    // 为每张牌确定正逆位（50/50概率）
    todayCards = drawnCards.map((card, index) => {
        const isReversed = rng.next() < 0.5;
        return {
            ...card,
            position: CARD_POSITIONS[index],
            isReversed: isReversed,
            // 兼容旧数据：如果没有分开的正逆位字段，使用通用字段
            keywords: isReversed
                ? (card.keywords_reversed || card.keywords || '')
                : (card.keywords_upright || card.keywords || ''),
            meaning: isReversed
                ? (card.meaning_reversed || card.meaning || '')
                : (card.meaning_upright || card.meaning || '')
        };
    });

    // 保存到本地存储（包含日期和设备ID）
    localStorage.setItem('tarot_daily_reading', JSON.stringify({
        date: getTodayDateString(),
        deviceId: getDeviceId(),
        cards: todayCards
    }));

    // 显示结果
    displayCards(todayCards);
    generateInterpretation(todayCards);

    // 更新按钮状态
    drawButton.textContent = '今日已抽牌';
    drawButton.disabled = true;
}

// 显示卡片（带翻牌动画）
function displayCards(cards) {
    cardsGrid.innerHTML = '';
    resultsSection.style.display = 'block';

    cards.forEach((card, index) => {
        // 创建翻牌容器
        const flipContainer = document.createElement('div');
        flipContainer.className = 'card-flip-container';

        const flipInner = document.createElement('div');
        flipInner.className = 'card-flip-inner';

        // 牌背
        const flipBack = document.createElement('div');
        flipBack.className = 'card-flip-back';
        flipBack.innerHTML = `
            <div class="card-back">
                <div class="card-back-design"></div>
            </div>
        `;

        // 牌面
        const flipFront = document.createElement('div');
        flipFront.className = 'card-flip-front';

        const cardElement = createCardElement(card);
        flipFront.appendChild(cardElement);

        flipInner.appendChild(flipBack);
        flipInner.appendChild(flipFront);
        flipContainer.appendChild(flipInner);
        cardsGrid.appendChild(flipContainer);

        // 延迟翻牌动画
        setTimeout(() => {
            flipContainer.classList.add('flipped');
        }, index * 300 + 500);
    });

    // 检查并应用牌背图片
    checkCardBackImage();
}

// 创建单张卡片元素
function createCardElement(card) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'tarot-card';

    const orientationText = card.isReversed ? '逆位' : '正位';
    const orientationClass = card.isReversed ? 'reversed' : 'upright';

    // 创建图片容器
    let imageHTML = '';
    if (card.image && card.image.trim() !== '') {
        const imageRotation = card.isReversed ? 'transform: rotate(180deg);' : '';
        imageHTML = `
            <img src="${card.image}"
                 alt="${card.name}"
                 class="card-image"
                 style="${imageRotation} object-fit: contain;"
                 onerror="this.parentElement.innerHTML='<div class=\\'card-text-fallback\\'><div class=\\'fallback-name\\'>${card.name_cn}</div><div class=\\'fallback-orientation\\'>${orientationText}</div></div>'">
        `;
    } else {
        imageHTML = `<div class="card-text-fallback"><div class="fallback-name">${card.name_cn}</div><div class="fallback-orientation">${orientationText}</div></div>`;
    }

    cardDiv.innerHTML = `
        <div class="card-position">${card.position}</div>
        <div class="card-image-container">
            ${imageHTML}
        </div>
        <div class="card-name">${card.name}</div>
        <div class="card-name-cn">${card.name_cn || ''}</div>
        <div class="card-orientation ${orientationClass}">${orientationText}</div>
        <div class="card-keywords">关键词: ${card.keywords}</div>
        <div class="card-meaning">${card.meaning}</div>
    `;

    return cardDiv;
}

// 生成 AI 解读
function generateInterpretation(cards) {
    interpretationSection.style.display = 'block';
    interpretationContent.innerHTML = '<div class="loading">正在解读中...</div>';

    // 模拟处理延迟
    setTimeout(() => {
        const interpretation = generateRationalReading(cards);
        interpretationContent.innerHTML = interpretation;
    }, 2000);
}

// 【理性引导型塔罗师】解读生成器
function generateRationalReading(cards) {
    const past = cards[0];
    const present = cards[1];
    const advice = cards[2];
    const energy = cards[3];

    // 使用seeded RNG选择模板（确保同设备同日固定）
    const seed = getTodaySeed();
    const rng = new SeededRandom(seed);
    const templateIndex = rng.nextInt(6); // 6组模板

    // 辅助函数：格式化牌名
    const formatCard = (card) => {
        return `【${card.name_cn}（${card.isReversed ? '逆位' : '正位'}）】`;
    };

    // 辅助函数：判断牌是否负面
    const isNegativeCard = (card) => {
        const negativeKeywords = ['困境', '阻碍', '焦虑', '失败', '痛苦', '冲突', '混乱', '停滞', '失去', '悲伤'];
        const keywords = card.keywords.toLowerCase();
        return negativeKeywords.some(keyword => keywords.includes(keyword));
    };

    // 1. 整体判断模板（6种）
    const openingTemplates = [
        () => {
            const theme = present.isReversed ? '正在经历某种转折' : '处于相对稳定的状态';
            return `今天的牌阵显示你${theme}。`;
        },
        () => {
            return `从牌面看，${formatCard(past)}与${formatCard(present)}之间存在明显的因果关系。`;
        },
        () => {
            const tension = (past.isReversed !== present.isReversed) ? '形成了一种对比' : '延续了某种趋势';
            return `过去到现在的能量${tension}，需要关注这个变化。`;
        },
        () => {
            return `今天的核心议题围绕着${formatCard(energy)}所代表的能量展开。`;
        },
        () => {
            return `牌阵揭示了一个从${past.name_cn}到${present.name_cn}的演变过程。`;
        },
        () => {
            const focus = isNegativeCard(present) ? '如何应对当下的挑战' : '如何把握现有的机会';
            return `今天的重点在于${focus}。`;
        }
    ];

    // 2. 串联解读模板（6种，过去→现在→建议→能量）
    const narrativeTemplates = [
        () => {
            return `${formatCard(past)}说明之前你${past.keywords.split('、')[0]}，这直接影响了当下${formatCard(present)}所体现的${present.keywords.split('、')[0]}状态。面对这种情况，${formatCard(advice)}给出的方向是${advice.keywords.split('、')[0]}，而${formatCard(energy)}则提醒你今天的关键在于${energy.keywords.split('、')[0]}。`;
        },
        () => {
            const pastAction = past.isReversed ? '没能完全发挥' : '充分体现了';
            const presentState = present.isReversed ? '出现了一些需要调整的信号' : '延续了这种势头';
            return `过去${pastAction}${past.name_cn}的能量，导致现在${presentState}。${formatCard(advice)}建议你采取${advice.keywords.split('、')[0]}的策略，同时借助${formatCard(energy)}的${energy.keywords.split('、')[0]}力量。`;
        },
        () => {
            return `回顾${formatCard(past)}，你经历了${past.meaning.substring(0, 20)}...这让你进入了${formatCard(present)}的现状。要突破当前局面，${formatCard(advice)}和${formatCard(energy)}共同指向：${advice.keywords.split('、')[0]}与${energy.keywords.split('、')[0]}的结合。`;
        },
        () => {
            return `${past.name_cn}到${present.name_cn}的转变并非偶然。${formatCard(advice)}提示你通过${advice.keywords.split('、')[0]}来应对，${formatCard(energy)}则强调今天${energy.keywords.split('、')[0]}的重要性。`;
        },
        () => {
            const chain = `${past.keywords.split('、')[0]} → ${present.keywords.split('、')[0]} → ${advice.keywords.split('、')[0]}`;
            return `从${formatCard(past)}到${formatCard(present)}，能量链条是：${chain}。${formatCard(energy)}作为今日关键能量，要求你把注意力放在${energy.keywords.split('、')[0]}上。`;
        },
        () => {
            return `${formatCard(past)}奠定了基础，${formatCard(present)}反映了当前处境，${formatCard(advice)}指明了方向，${formatCard(energy)}则是今天最需要调动的资源——${energy.keywords.split('、')[0]}。`;
        }
    ];

    // 3. 可执行建议模板（6种）
    const actionTemplates = [
        () => {
            const actions = [];
            if (isNegativeCard(present)) {
                actions.push(`承认当前${present.keywords.split('、')[0]}的状态，不要强行乐观`);
                actions.push(`具体行动：${advice.keywords.split('、')[0]}，从小事开始`);
            } else {
                actions.push(`趁${present.keywords.split('、')[0]}的势头，推进重要事项`);
                actions.push(`保持${advice.keywords.split('、')[0]}的态度，但避免过度`);
            }
            return `今天可以做的：• ${actions.join('；• ')}。`;
        },
        () => {
            const primary = advice.keywords.split('、')[0];
            const secondary = energy.keywords.split('、')[0];
            return `具体建议：把${primary}作为行动原则，在处理具体事务时调用${secondary}的能量。避免被${present.keywords.split('、')[1] || present.keywords.split('、')[0]}牵着走。`;
        },
        () => {
            if (isNegativeCard(present) || isNegativeCard(energy)) {
                return `面对${present.name_cn}${present.isReversed ? '逆位' : ''}的状况，不要急于"解决"，而是先${advice.keywords.split('、')[0]}。今天不适合强推，适合${energy.keywords.split('、')[0]}。`;
            } else {
                return `今天的行动指南：以${advice.keywords.split('、')[0]}为核心，配合${energy.keywords.split('、')[0]}。可以尝试之前搁置的计划。`;
            }
        },
        () => {
            return `两条建议：一是${advice.keywords.split('、')[0]}（${formatCard(advice)}的提示），二是关注${energy.keywords.split('、')[0]}（${formatCard(energy)}的要求）。不要在${present.keywords.split('、')[1] || '无关紧要的事'}上消耗精力。`;
        },
        () => {
            const warning = isNegativeCard(energy) ? `，但要警惕${energy.keywords.split('、')[1] || '过度'}` : '';
            return `行动方案：用${advice.keywords.split('、')[0]}的方式处理手头的事，借助${energy.keywords.split('、')[0]}的力量推进${warning}。`;
        },
        () => {
            return `• ${advice.keywords.split('、')[0]}是今天的方法论\n• ${energy.keywords.split('、')[0]}是今天的燃料\n• 避开${present.isReversed ? present.keywords.split('、')[1] : '冲动行事'}的陷阱`;
        }
    ];

    // 4. 收尾模板（6种，克制、不给预言）
    const closingTemplates = [
        () => '牌面到此为止，剩下的由你自己书写。',
        () => '塔罗只是提供视角，具体怎么做仍然是你的选择。',
        () => `${formatCard(energy)}的能量会持续到今晚，用或不用取决于你。`,
        () => '以上解读仅供参考，不构成对未来的承诺。',
        () => '牌意已明，行动与否在你。',
        () => '这是一天的提示，不是一生的判决。'
    ];

    // 组合四段
    const opening = openingTemplates[templateIndex % 6]();
    const narrative = narrativeTemplates[templateIndex % 6]();
    const action = actionTemplates[templateIndex % 6]();
    const closing = closingTemplates[templateIndex % 6]();

    // 组装最终输出
    const fullText = `
        <div class="interpretation-summary">
            <p>${opening} ${narrative}</p>
            <p>${action}</p>
            <p style="margin-top: 15px; color: #888; font-size: 0.95rem;">${closing}</p>
        </div>
    `;

    return fullText;
}

// 创建模拟的AI解读（识别正逆位）- 保留作为备用
function createMockInterpretation(cards) {
    const pastCard = cards[0];
    const presentCard = cards[1];
    const adviceCard = cards[2];
    const energyCard = cards[3];

    // 综合解读
    let summary = `
        <div class="interpretation-summary">
            <h3>✨ 综合解读</h3>
            <p>今天的塔罗牌揭示了一个完整的故事。`;

    // 根据正逆位调整总结
    if (pastCard.isReversed) {
        summary += `过去的${pastCard.name_cn}（逆位）表明你正在从某些限制或挑战中走出。`;
    } else {
        summary += `过去的${pastCard.name_cn}（正位）为你今天的状态打下了基础。`;
    }

    if (presentCard.isReversed) {
        summary += `当下的${presentCard.name_cn}（逆位）提醒你注意某些需要调整的地方。`;
    } else {
        summary += `当下的${presentCard.name_cn}（正位）显示你正处于良好的状态。`;
    }

    summary += `</p></div>`;

    // 逐张解读
    let cardInterpretations = '';

    cards.forEach(card => {
        const orientationNote = card.isReversed
            ? '（逆位状态提示你关注潜在的挑战或需要调整的方面）'
            : '（正位状态表明能量流动顺畅）';

        cardInterpretations += `
            <div class="card-interpretation">
                <h4>${card.position}：${card.name_cn} - ${card.name} ${card.isReversed ? '逆位' : '正位'}</h4>
                <p><strong>能量状态：</strong>${orientationNote}</p>
                <p><strong>关键提示：</strong>${card.keywords}</p>
                <p><strong>详细解读：</strong>${card.meaning}</p>
                <p><strong>塔罗师建议：</strong>${getMockAdvice(card)}</p>
            </div>
        `;
    });

    return summary + cardInterpretations;
}

// 根据牌和正逆位生成模拟建议
function getMockAdvice(card) {
    const adviceTemplates = {
        upright: [
            `${card.name_cn}的正位能量正在支持你，保持这种积极的态度和方向。`,
            `这是一个有利的信号，继续你当前的道路，信任自己的直觉。`,
            `正位的${card.name_cn}鼓励你充分发挥这张牌的正面特质。`,
            `把握当前的机会，${card.name_cn}的能量会引导你走向成功。`
        ],
        reversed: [
            `${card.name_cn}的逆位提醒你需要重新审视这个领域，可能需要做出一些调整。`,
            `注意${card.name_cn}逆位带来的警示，这是一个反思和改变的机会。`,
            `逆位不是坏事，而是提醒你以不同的方式处理这个情况。`,
            `${card.name_cn}逆位要求你更加谨慎，避免这张牌的负面特质显现。`
        ]
    };

    const templates = card.isReversed ? adviceTemplates.reversed : adviceTemplates.upright;
    const seed = getTodaySeed() + card.name;
    const rng = new SeededRandom(seed);
    const index = rng.nextInt(templates.length);

    return templates[index];
}

// 重置今日抽牌结果
function resetTodayReading() {
    // 清除今日抽牌缓存
    localStorage.removeItem('tarot_daily_reading');

    // 重置全局变量
    todayCards = null;

    // 重置UI
    resultsSection.style.display = 'none';
    interpretationSection.style.display = 'none';
    cardsGrid.innerHTML = '';
    interpretationContent.innerHTML = '';

    // 恢复按钮状态
    drawButton.textContent = '抽取今日四张牌';
    drawButton.disabled = false;

    console.log('已重置今日抽牌结果');
}

// 重置设备ID（慎用，会改变所有历史记录）
function resetDeviceId() {
    const oldId = getDeviceId();
    localStorage.removeItem('tarot_device_id');
    const newId = getDeviceId();
    console.log('已重置设备ID:', oldId, '->', newId);

    // 自动重置今日抽牌
    resetTodayReading();
}

// 设置重置按钮（隐藏的测试功能）
function setupResetButton() {
    // 添加键盘快捷键：按 Ctrl+Shift+R 重置今日抽牌
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'R') {
            e.preventDefault();
            if (confirm('确定要重置今日抽牌结果吗？')) {
                resetTodayReading();
                alert('已重置今日抽牌，可以重新抽牌了！');
            }
        }

        // 按 Ctrl+Shift+D 重置设备ID（更彻底的重置）
        if (e.ctrlKey && e.shiftKey && e.key === 'D') {
            e.preventDefault();
            if (confirm('确定要重置设备ID吗？这会让你的抽牌结果与其他设备不同！')) {
                resetDeviceId();
                alert('已重置设备ID并清除今日抽牌！');
            }
        }
    });

    // 可选：在控制台暴露重置函数供测试
    window.tarotDebug = {
        resetToday: resetTodayReading,
        resetDevice: resetDeviceId,
        getDeviceId: getDeviceId,
        getSeed: getTodaySeed
    };

    console.log('🎴 塔罗牌调试功能已启用：');
    console.log('  - Ctrl+Shift+R: 重置今日抽牌');
    console.log('  - Ctrl+Shift+D: 重置设备ID');
    console.log('  - window.tarotDebug: 调试函数');
}

// 工具函数：生成随机索引
function getRandomIndex(seed, max) {
    const rng = new SeededRandom(seed);
    return rng.nextInt(max);
}
