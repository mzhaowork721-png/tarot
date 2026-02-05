// ==================== 全局状态管理 ====================
let tarotData = []; // 塔罗牌数据
let todayCards = []; // 今日抽取的4张牌

// ==================== 基于日期的伪随机数生成器 ====================
/**
 * 创建一个基于种子的伪随机数生成器
 * @param {number} seed - 种子值（使用日期生成）
 * @returns {function} 返回一个随机数生成函数
 */
function SeededRandom(seed) {
    this.seed = seed;

    this.next = function() {
        // 使用 Park-Miller 算法实现可复现的伪随机
        this.seed = (this.seed * 48271) % 2147483647;
        return (this.seed - 1) / 2147483646;
    };
}

/**
 * 根据日期字符串生成种子值
 * @param {string} dateStr - 格式：YYYY-MM-DD
 * @returns {number} 种子值
 */
function getDateSeed(dateStr) {
    const parts = dateStr.split('-');
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]);
    const day = parseInt(parts[2]);

    // 组合年月日生成唯一种子
    return year * 10000 + month * 100 + day;
}

/**
 * 获取今天的日期字符串
 * @returns {string} YYYY-MM-DD 格式
 */
function getTodayDateString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// ==================== 时间更新功能 ====================
/**
 * 更新开屏页的日期和时间显示
 */
function updateDateTime() {
    const now = new Date();

    // 更新日期
    const dateElement = document.getElementById('currentDate');
    dateElement.textContent = getTodayDateString();

    // 更新时间
    const timeElement = document.getElementById('currentTime');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    timeElement.textContent = `${hours}:${minutes}:${seconds}`;
}

// ==================== 页面切换功能 ====================
/**
 * 切换到指定页面
 * @param {string} pageId - 页面ID
 */
function switchToPage(pageId) {
    // 隐藏所有页面
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });

    // 显示目标页面
    document.getElementById(pageId).classList.add('active');
}

// ==================== 加载塔罗牌数据 ====================
/**
 * 从 tarot.json 加载塔罗牌数据
 */
async function loadTarotData() {
    try {
        const response = await fetch('tarot.json');
        tarotData = await response.json();
        console.log('塔罗牌数据加载成功:', tarotData.length, '张牌');
    } catch (error) {
        console.error('加载塔罗牌数据失败:', error);
        alert('加载塔罗牌数据失败，请确保 tarot.json 文件存在');
    }
}

// ==================== 抽牌功能 ====================
/**
 * 基于今日日期抽取4张不重复的牌
 * @returns {Array} 4张牌的数组
 */
function drawTodayCards() {
    const todayDate = getTodayDateString();
    const seed = getDateSeed(todayDate);
    const rng = new SeededRandom(seed);

    // 创建牌的索引数组
    const indices = Array.from({length: tarotData.length}, (_, i) => i);

    // Fisher-Yates 洗牌算法（使用伪随机数）
    for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(rng.next() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    // 取前4张
    const selectedIndices = indices.slice(0, 4);
    const cards = selectedIndices.map(index => tarotData[index]);

    // 定义牌位
    const positions = [
        { name: '过去', key: 'past' },
        { name: '现在', key: 'present' },
        { name: '建议', key: 'advice' },
        { name: '今日关键能量', key: 'energy' }
    ];

    return cards.map((card, index) => ({
        ...card,
        position: positions[index].name,
        positionKey: positions[index].key
    }));
}

// ==================== 显示卡片功能 ====================
/**
 * 在结果页面显示4张牌
 * @param {Array} cards - 4张牌的数组
 */
function displayCards(cards) {
    const cardsDisplay = document.getElementById('cardsDisplay');
    cardsDisplay.innerHTML = '';

    cards.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.className = 'tarot-card';

        const keywordsHTML = card.keywords
            .map(kw => `<span class="keyword-tag">${kw}</span>`)
            .join('');

        cardElement.innerHTML = `
            <div class="card-position">${card.position}</div>
            <div class="card-name">${card.name}</div>
            <div class="card-name-en">${card.name_en}</div>
            <div class="card-keywords">${keywordsHTML}</div>
            <div class="card-meaning">${card.meaning}</div>
        `;

        cardsDisplay.appendChild(cardElement);
    });
}

// ==================== AI 解读生成功能 ====================
/**
 * 基于抽取的4张牌生成 AI 塔罗师解读（本地 mock）
 * @param {Array} cards - 4张牌的数组
 * @returns {Object} 包含各部分解读的对象
 */
function generateReading(cards) {
    const [past, present, advice, energy] = cards;

    // 解读模板（基于牌的关键词和含义生成）
    const reading = {
        overall: generateOverallEnergy(cards),
        cardReadings: cards.map(card => generateCardReading(card)),
        actionAdvice: generateActionAdvice(cards),
        reminder: generateReminder(energy)
    };

    return reading;
}

/**
 * 生成今日总体能量解读
 */
function generateOverallEnergy(cards) {
    const energy = cards[3];
    const keywords = energy.keywords.slice(0, 2).join('与');

    const templates = [
        `今天的整体能量聚焦在「${keywords}」上。${energy.meaning}这是一个充满${energy.keywords[0]}的日子，适合关注内心的声音。`,
        `今日的宇宙能量带来了「${energy.name}」的影响力。${energy.meaning}让我们以开放的心态迎接今天的挑战与机遇。`,
        `「${energy.name}」成为今天的主导能量。${energy.meaning}这提醒我们在行动中保持${keywords}的平衡。`
    ];

    return templates[Math.floor(Math.random() * templates.length)];
}

/**
 * 生成单张牌的解读
 */
function generateCardReading(card) {
    const positionContext = {
        '过去': '回顾过去',
        '现在': '审视当下',
        '建议': '未来指引',
        '今日关键能量': '能量核心'
    };

    const context = positionContext[card.position];

    return {
        position: card.position,
        text: `【${card.name}】在「${card.position}」位置出现，代表${context}时需要关注${card.keywords[0]}的主题。${card.meaning}这张牌提醒你${card.keywords.slice(0, 2).join('和')}是当前阶段的重要课题。`
    };
}

/**
 * 生成今日行动建议
 */
function generateActionAdvice(cards) {
    const advice = cards[2]; // 建议位
    const energy = cards[3]; // 能量位

    return [
        `${advice.keywords[0]}：${advice.meaning.split('。')[0]}`,
        `${energy.keywords[1] || energy.keywords[0]}：保持对${energy.name}能量的觉察，让它指引你的决策`,
        `整合行动：将「${advice.name}」的智慧与「${energy.name}」的能量结合，采取平衡的行动`
    ];
}

/**
 * 生成今日提醒
 */
function generateReminder(energyCard) {
    const reminders = [
        `记住：${energyCard.name}的能量会陪伴你一整天，保持觉察与开放。`,
        `今日关键：${energyCard.keywords[0]}不仅是挑战，更是成长的机会。`,
        `温馨提示：${energyCard.meaning.split('。')[0]}，这是今天最重要的领悟。`
    ];

    return reminders[Math.floor(Math.random() * reminders.length)];
}

/**
 * 在页面上显示解读内容
 */
function displayReading(reading) {
    const readingContent = document.getElementById('readingContent');

    // 构建卡片解读HTML
    const cardReadingsHTML = reading.cardReadings.map(cr =>
        `<p class="reading-text">${cr.text}</p>`
    ).join('');

    // 构建行动建议HTML
    const adviceHTML = reading.actionAdvice.map(advice =>
        `<li>${advice}</li>`
    ).join('');

    readingContent.innerHTML = `
        <div class="reading-section-title">🌟 今日总体能量</div>
        <p class="reading-text">${reading.overall}</p>

        <div class="reading-section-title">🔮 四张牌解读</div>
        ${cardReadingsHTML}

        <div class="reading-section-title">✨ 今日行动建议</div>
        <ul class="advice-list">
            ${adviceHTML}
        </ul>

        <div class="reminder-box">
            💫 ${reading.reminder}
        </div>
    `;
}

// ==================== 执行抽牌流程 ====================
/**
 * 执行完整的抽牌和解读流程
 */
function performDrawing() {
    // 抽取今日4张牌
    todayCards = drawTodayCards();

    // 显示卡片
    displayCards(todayCards);

    // 生成并显示解读
    const reading = generateReading(todayCards);
    displayReading(reading);

    // 切换到结果页
    switchToPage('resultPage');
}

// ==================== 事件监听器 ====================
/**
 * 初始化所有事件监听器
 */
function initEventListeners() {
    // 开屏页：继续按钮
    document.getElementById('continueBtn').addEventListener('click', () => {
        switchToPage('drawPage');
    });

    // 抽牌页：抽牌按钮
    document.getElementById('drawBtn').addEventListener('click', () => {
        if (tarotData.length === 0) {
            alert('塔罗牌数据尚未加载完成，请稍候再试');
            return;
        }
        performDrawing();
    });

    // 结果页：重新抽取按钮
    document.getElementById('redrawBtn').addEventListener('click', () => {
        switchToPage('drawPage');
    });
}

// ==================== 应用初始化 ====================
/**
 * 应用启动时执行的初始化函数
 */
async function init() {
    console.log('塔罗日运应用启动...');

    // 加载塔罗牌数据
    await loadTarotData();

    // 初始化事件监听器
    initEventListeners();

    // 启动时间更新（每秒更新一次）
    updateDateTime();
    setInterval(updateDateTime, 1000);

    // 显示开屏页
    switchToPage('lockscreen');

    console.log('应用初始化完成');
}

// ==================== 启动应用 ====================
// 等待 DOM 加载完成后启动
document.addEventListener('DOMContentLoaded', init);
