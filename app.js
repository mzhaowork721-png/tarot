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
    checkTodayReading();
    drawButton.addEventListener('click', drawCards);
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

// 获取今天的日期种子
function getTodaySeed() {
    const today = new Date();
    const dateString = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
    return dateString;
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
            if (data.date === getTodaySeed()) {
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

    // 保存到本地存储
    localStorage.setItem('tarot_daily_reading', JSON.stringify({
        date: seed,
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

    let imageHTML = '';
    if (card.image && card.image.trim() !== '') {
        const imageClass = card.isReversed ? 'card-image reversed' : 'card-image';
        imageHTML = `<img src="${card.image}" alt="${card.name}" class="${imageClass}" onerror="this.parentElement.innerHTML='<div class=\\'card-placeholder\\'>🃏</div>'">`;
    } else {
        imageHTML = '<div class="card-placeholder">🃏</div>';
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

    // 模拟AI处理延迟
    setTimeout(() => {
        const interpretation = createMockInterpretation(cards);
        interpretationContent.innerHTML = interpretation;
    }, 2000);
}

// 创建模拟的AI解读（识别正逆位）
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

// 工具函数：生成随机索引
function getRandomIndex(seed, max) {
    const rng = new SeededRandom(seed);
    return rng.nextInt(max);
}
