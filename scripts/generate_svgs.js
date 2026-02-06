#!/usr/bin/env node

/**
 * 塔罗牌 SVG 生成器
 * 生成 78 张可商用的几何风格塔罗牌（无版权风险）
 */

const fs = require('fs');
const path = require('path');

// 颜色方案
const COLORS = {
  background: '#f8f9fa',
  border1: '#5b6cff',
  border2: '#7b5cff',
  accent: '#f2c14e',
  primary: '#5b6cff',
  secondary: '#7b5cff',
  tertiary: '#9b8cff'
};

// 大阿卡纳牌数据
const MAJOR_ARCANA = [
  { number: 0, name: 'The Fool', name_cn: '愚者' },
  { number: 1, name: 'The Magician', name_cn: '魔术师' },
  { number: 2, name: 'The High Priestess', name_cn: '女祭司' },
  { number: 3, name: 'The Empress', name_cn: '皇后' },
  { number: 4, name: 'The Emperor', name_cn: '皇帝' },
  { number: 5, name: 'The Hierophant', name_cn: '教皇' },
  { number: 6, name: 'The Lovers', name_cn: '恋人' },
  { number: 7, name: 'The Chariot', name_cn: '战车' },
  { number: 8, name: 'Strength', name_cn: '力量' },
  { number: 9, name: 'The Hermit', name_cn: '隐士' },
  { number: 10, name: 'Wheel of Fortune', name_cn: '命运之轮' },
  { number: 11, name: 'Justice', name_cn: '正义' },
  { number: 12, name: 'The Hanged Man', name_cn: '倒吊人' },
  { number: 13, name: 'Death', name_cn: '死神' },
  { number: 14, name: 'Temperance', name_cn: '节制' },
  { number: 15, name: 'The Devil', name_cn: '恶魔' },
  { number: 16, name: 'The Tower', name_cn: '高塔' },
  { number: 17, name: 'The Star', name_cn: '星星' },
  { number: 18, name: 'The Moon', name_cn: '月亮' },
  { number: 19, name: 'The Sun', name_cn: '太阳' },
  { number: 20, name: 'Judgement', name_cn: '审判' },
  { number: 21, name: 'The World', name_cn: '世界' }
];

// 小阿卡纳牌
const SUITS = {
  wands: { name: 'Wands', name_cn: '权杖', color: '#ff6b6b' },
  cups: { name: 'Cups', name_cn: '圣杯', color: '#4ecdc4' },
  swords: { name: 'Swords', name_cn: '宝剑', color: '#95a5a6' },
  pentacles: { name: 'Pentacles', name_cn: '星币', color: '#f39c12' }
};

const RANKS = [
  { name: 'Ace', name_cn: '王牌', value: 1 },
  { name: 'Two', name_cn: '二', value: 2 },
  { name: 'Three', name_cn: '三', value: 3 },
  { name: 'Four', name_cn: '四', value: 4 },
  { name: 'Five', name_cn: '五', value: 5 },
  { name: 'Six', name_cn: '六', value: 6 },
  { name: 'Seven', name_cn: '七', value: 7 },
  { name: 'Eight', name_cn: '八', value: 8 },
  { name: 'Nine', name_cn: '九', value: 9 },
  { name: 'Ten', name_cn: '十', value: 10 },
  { name: 'Page', name_cn: '侍从', value: 11 },
  { name: 'Knight', name_cn: '骑士', value: 12 },
  { name: 'Queen', name_cn: '王后', value: 13 },
  { name: 'King', name_cn: '国王', value: 14 }
];

// Seeded Random 生成器
class SeededRandom {
  constructor(seed) {
    this.seed = this.hashCode(seed);
  }

  hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  next() {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  nextInt(min, max) {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  nextFloat(min, max) {
    return this.next() * (max - min) + min;
  }

  choice(array) {
    return array[this.nextInt(0, array.length - 1)];
  }
}

// 生成几何图案
function generateGeometricPattern(seed, cardType) {
  const rng = new SeededRandom(seed);
  const patternType = rng.nextInt(0, 5);

  let pattern = '';

  switch(patternType) {
    case 0: // 圆形图案
      pattern = generateCirclePattern(rng);
      break;
    case 1: // 星形图案
      pattern = generateStarPattern(rng);
      break;
    case 2: // 三角形图案
      pattern = generateTrianglePattern(rng);
      break;
    case 3: // 线条图案
      pattern = generateLinePattern(rng);
      break;
    case 4: // 多边形图案
      pattern = generatePolygonPattern(rng);
      break;
    case 5: // 点阵图案
      pattern = generateDotPattern(rng);
      break;
  }

  return pattern;
}

function generateCirclePattern(rng) {
  const count = rng.nextInt(3, 7);
  const radius = rng.nextInt(20, 50);
  const centerX = 210;
  const centerY = 280;

  let circles = '';
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const distance = rng.nextInt(40, 100);
    const x = centerX + Math.cos(angle) * distance;
    const y = centerY + Math.sin(angle) * distance;
    const r = rng.nextInt(15, 35);
    const color = rng.choice([COLORS.primary, COLORS.secondary, COLORS.accent]);
    const opacity = rng.nextFloat(0.6, 0.9);

    circles += `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}" opacity="${opacity}" />`;
  }

  // 中心圆
  circles += `<circle cx="${centerX}" cy="${centerY}" r="${radius}" fill="none" stroke="${COLORS.accent}" stroke-width="3" />`;

  return circles;
}

function generateStarPattern(rng) {
  const points = rng.nextInt(5, 8);
  const outerRadius = rng.nextInt(60, 90);
  const innerRadius = outerRadius * rng.nextFloat(0.4, 0.6);
  const centerX = 210;
  const centerY = 280;

  let starPoints = '';
  for (let i = 0; i < points * 2; i++) {
    const angle = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    starPoints += `${x},${y} `;
  }

  const color = rng.choice([COLORS.primary, COLORS.secondary, COLORS.accent]);

  return `<polygon points="${starPoints}" fill="${color}" opacity="0.8" stroke="${COLORS.accent}" stroke-width="2" />`;
}

function generateTrianglePattern(rng) {
  const count = rng.nextInt(3, 6);
  const size = rng.nextInt(40, 70);

  let triangles = '';
  for (let i = 0; i < count; i++) {
    const x = rng.nextInt(100, 320);
    const y = rng.nextInt(200, 400);
    const rotation = rng.nextInt(0, 360);
    const color = rng.choice([COLORS.primary, COLORS.secondary, COLORS.tertiary]);

    triangles += `<polygon points="${x},${y - size / 2} ${x - size / 2},${y + size / 2} ${x + size / 2},${y + size / 2}"
                   fill="${color}" opacity="0.7" transform="rotate(${rotation} ${x} ${y})" />`;
  }

  return triangles;
}

function generateLinePattern(rng) {
  const count = rng.nextInt(5, 12);
  const centerX = 210;
  const centerY = 280;

  let lines = '';
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const length = rng.nextInt(60, 120);
    const x1 = centerX + Math.cos(angle) * 20;
    const y1 = centerY + Math.sin(angle) * 20;
    const x2 = centerX + Math.cos(angle) * length;
    const y2 = centerY + Math.sin(angle) * length;
    const color = rng.choice([COLORS.primary, COLORS.secondary, COLORS.accent]);
    const width = rng.nextInt(2, 4);

    lines += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${width}" opacity="0.8" />`;
  }

  return lines;
}

function generatePolygonPattern(rng) {
  const sides = rng.nextInt(5, 8);
  const radius = rng.nextInt(60, 100);
  const centerX = 210;
  const centerY = 280;

  let points = '';
  for (let i = 0; i < sides; i++) {
    const angle = (i / sides) * Math.PI * 2 - Math.PI / 2;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    points += `${x},${y} `;
  }

  const color = rng.choice([COLORS.primary, COLORS.secondary]);

  return `<polygon points="${points}" fill="none" stroke="${color}" stroke-width="3" />
          <polygon points="${points}" fill="${color}" opacity="0.2" />`;
}

function generateDotPattern(rng) {
  const count = rng.nextInt(15, 30);

  let dots = '';
  for (let i = 0; i < count; i++) {
    const x = rng.nextInt(80, 340);
    const y = rng.nextInt(180, 420);
    const r = rng.nextInt(3, 8);
    const color = rng.choice([COLORS.primary, COLORS.secondary, COLORS.accent]);

    dots += `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}" opacity="0.7" />`;
  }

  return dots;
}

// 生成背景纹理
function generateBackgroundPattern() {
  return `
    <defs>
      <pattern id="bgPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
        <line x1="0" y1="0" x2="20" y2="20" stroke="${COLORS.border1}" stroke-width="0.5" opacity="0.1" />
        <line x1="20" y1="0" x2="0" y2="20" stroke="${COLORS.border1}" stroke-width="0.5" opacity="0.1" />
      </pattern>
    </defs>
    <rect x="0" y="0" width="420" height="720" fill="${COLORS.background}" />
    <rect x="0" y="0" width="420" height="720" fill="url(#bgPattern)" />
  `;
}

// 生成SVG卡片
function generateSVG(cardName, cardNameCN, seed, suitColor = null) {
  const pattern = generateGeometricPattern(seed, 'major');
  const bgPattern = generateBackgroundPattern();

  // 如果有花色颜色，混入装饰
  const accentColor = suitColor || COLORS.accent;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 720" width="420" height="720">
  ${bgPattern}

  <!-- 外边框 -->
  <rect x="10" y="10" width="400" height="700" rx="20" ry="20"
        fill="none" stroke="${COLORS.border1}" stroke-width="3" />
  <rect x="18" y="18" width="384" height="684" rx="16" ry="16"
        fill="none" stroke="${COLORS.border2}" stroke-width="2" />

  <!-- 顶部装饰 -->
  <rect x="30" y="30" width="360" height="2" fill="${accentColor}" opacity="0.5" />
  <circle cx="210" cy="60" r="8" fill="${accentColor}" />

  <!-- 中央图案区域 -->
  <g id="centralPattern">
    ${pattern}
  </g>

  <!-- 底部装饰 -->
  <rect x="30" y="688" width="360" height="2" fill="${accentColor}" opacity="0.5" />

  <!-- 卡片名称 -->
  <text x="210" y="650" font-family="Arial, sans-serif" font-size="20" font-weight="bold"
        text-anchor="middle" fill="${COLORS.border1}">${cardName}</text>
  <text x="210" y="675" font-family="Arial, sans-serif" font-size="16"
        text-anchor="middle" fill="${COLORS.border2}">${cardNameCN}</text>
</svg>`;
}

// 生成数字符号（小阿卡纳）
function generateMinorArcanaPattern(suit, rank, seed) {
  const rng = new SeededRandom(seed);
  const suitData = SUITS[suit];
  const rankData = RANKS.find(r => r.name === rank);
  const count = rankData.value;

  let pattern = '';

  if (count <= 10) {
    // 数字牌：显示对应数量的符号
    const symbol = getSuitSymbol(suit);
    const positions = getSymbolPositions(count, rng);

    positions.forEach(pos => {
      pattern += `<g transform="translate(${pos.x}, ${pos.y})">${symbol}</g>`;
    });
  } else {
    // 宫廷牌：使用特殊图案
    pattern = generateCourtCardPattern(suit, rank, rng);
  }

  return pattern;
}

function getSuitSymbol(suit) {
  const size = 40;

  switch(suit) {
    case 'wands':
      return `<rect x="-5" y="-${size/2}" width="10" height="${size}" fill="${SUITS[suit].color}" rx="5" />
              <circle cx="0" cy="-${size/2 - 5}" r="8" fill="${COLORS.accent}" />`;
    case 'cups':
      return `<ellipse cx="0" cy="0" rx="20" ry="15" fill="none" stroke="${SUITS[suit].color}" stroke-width="3" />
              <path d="M -15,0 Q 0,20 15,0" fill="${SUITS[suit].color}" opacity="0.5" />`;
    case 'swords':
      return `<line x1="0" y1="-${size/2}" x2="0" y2="${size/2}" stroke="${SUITS[suit].color}" stroke-width="4" />
              <polygon points="-15,-${size/2} 0,-${size/2+15} 15,-${size/2}" fill="${SUITS[suit].color}" />`;
    case 'pentacles':
      return `<circle cx="0" cy="0" r="20" fill="none" stroke="${SUITS[suit].color}" stroke-width="3" />
              <polygon points="0,-20 6,-6 20,-6 9,6 15,20 0,12 -15,20 -9,6 -20,-6 -6,-6" fill="${COLORS.accent}" opacity="0.7" />`;
    default:
      return '';
  }
}

function getSymbolPositions(count, rng) {
  const centerX = 210;
  const centerY = 280;
  const positions = [];

  if (count === 1) {
    positions.push({ x: centerX, y: centerY });
  } else if (count === 2) {
    positions.push({ x: centerX, y: centerY - 50 });
    positions.push({ x: centerX, y: centerY + 50 });
  } else if (count === 3) {
    positions.push({ x: centerX, y: centerY - 60 });
    positions.push({ x: centerX, y: centerY });
    positions.push({ x: centerX, y: centerY + 60 });
  } else if (count === 4) {
    positions.push({ x: centerX - 50, y: centerY - 50 });
    positions.push({ x: centerX + 50, y: centerY - 50 });
    positions.push({ x: centerX - 50, y: centerY + 50 });
    positions.push({ x: centerX + 50, y: centerY + 50 });
  } else if (count === 5) {
    positions.push({ x: centerX, y: centerY });
    positions.push({ x: centerX - 60, y: centerY - 60 });
    positions.push({ x: centerX + 60, y: centerY - 60 });
    positions.push({ x: centerX - 60, y: centerY + 60 });
    positions.push({ x: centerX + 60, y: centerY + 60 });
  } else {
    // 6-10: 圆形排列
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
      const radius = 80;
      positions.push({
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius
      });
    }
  }

  return positions;
}

function generateCourtCardPattern(suit, rank, rng) {
  const suitColor = SUITS[suit].color;
  const centerX = 210;
  const centerY = 280;

  // 宫廷牌使用复杂几何图案
  let pattern = `<circle cx="${centerX}" cy="${centerY}" r="80" fill="none" stroke="${suitColor}" stroke-width="4" />`;
  pattern += `<circle cx="${centerX}" cy="${centerY}" r="60" fill="${suitColor}" opacity="0.2" />`;

  // 根据级别添加不同装饰
  if (rank === 'Page') {
    pattern += `<rect x="${centerX - 30}" y="${centerY - 30}" width="60" height="60" fill="none" stroke="${COLORS.accent}" stroke-width="3" />`;
  } else if (rank === 'Knight') {
    const points = `${centerX},${centerY - 50} ${centerX + 43},${centerY + 25} ${centerX - 43},${centerY + 25}`;
    pattern += `<polygon points="${points}" fill="none" stroke="${COLORS.accent}" stroke-width="3" />`;
  } else if (rank === 'Queen') {
    pattern += `<circle cx="${centerX}" cy="${centerY}" r="40" fill="${COLORS.accent}" opacity="0.5" />`;
    pattern += `<circle cx="${centerX}" cy="${centerY - 50}" r="15" fill="${suitColor}" />`;
  } else if (rank === 'King') {
    pattern += `<rect x="${centerX - 40}" y="${centerY - 40}" width="80" height="80" fill="${COLORS.accent}" opacity="0.3" />`;
    pattern += `<circle cx="${centerX}" cy="${centerY}" r="30" fill="${suitColor}" />`;
  }

  return pattern;
}

// 生成小阿卡纳SVG
function generateMinorArcanaSVG(suit, rank, seed) {
  const suitData = SUITS[suit];
  const rankData = RANKS.find(r => r.name === rank);
  const cardName = `${rank} of ${suitData.name}`;
  const cardNameCN = `${suitData.name_cn}${rankData.name_cn}`;

  const pattern = generateMinorArcanaPattern(suit, rank, seed);
  const bgPattern = generateBackgroundPattern();

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 720" width="420" height="720">
  ${bgPattern}

  <!-- 外边框 -->
  <rect x="10" y="10" width="400" height="700" rx="20" ry="20"
        fill="none" stroke="${COLORS.border1}" stroke-width="3" />
  <rect x="18" y="18" width="384" height="684" rx="16" ry="16"
        fill="none" stroke="${suitData.color}" stroke-width="2" />

  <!-- 顶部装饰 -->
  <rect x="30" y="30" width="360" height="2" fill="${suitData.color}" opacity="0.5" />
  <circle cx="210" cy="60" r="8" fill="${suitData.color}" />

  <!-- 中央图案区域 -->
  <g id="centralPattern">
    ${pattern}
  </g>

  <!-- 底部装饰 -->
  <rect x="30" y="688" width="360" height="2" fill="${suitData.color}" opacity="0.5" />

  <!-- 卡片名称 -->
  <text x="210" y="650" font-family="Arial, sans-serif" font-size="18" font-weight="bold"
        text-anchor="middle" fill="${COLORS.border1}">${cardName}</text>
  <text x="210" y="675" font-family="Arial, sans-serif" font-size="16"
        text-anchor="middle" fill="${COLORS.border2}">${cardNameCN}</text>
</svg>`;
}

// 文件名转换
function toFileName(name) {
  return name.toLowerCase().replace(/\s+/g, '-');
}

// 主函数
function generateAllCards() {
  const outputDir = path.join(__dirname, '..', 'assets', 'cards');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('开始生成 78 张塔罗牌 SVG...\n');

  let count = 0;

  // 生成大阿卡纳
  console.log('生成大阿卡纳 (22张)...');
  MAJOR_ARCANA.forEach(card => {
    const fileName = `${String(card.number).padStart(2, '0')}-${toFileName(card.name)}.svg`;
    const filePath = path.join(outputDir, fileName);
    const seed = `major-${card.number}-${card.name}`;
    const svg = generateSVG(card.name, card.name_cn, seed);

    fs.writeFileSync(filePath, svg, 'utf8');
    count++;
    console.log(`  ✓ ${fileName}`);
  });

  // 生成小阿卡纳
  console.log('\n生成小阿卡纳 (56张)...');
  Object.keys(SUITS).forEach(suit => {
    console.log(`  ${SUITS[suit].name} (${SUITS[suit].name_cn}):`);
    RANKS.forEach(rank => {
      const fileName = `${suit}-${toFileName(rank.name)}.svg`;
      const filePath = path.join(outputDir, fileName);
      const seed = `minor-${suit}-${rank.name}`;
      const svg = generateMinorArcanaSVG(suit, rank.name, seed);

      fs.writeFileSync(filePath, svg, 'utf8');
      count++;
      console.log(`    ✓ ${fileName}`);
    });
  });

  console.log(`\n✨ 成功生成 ${count} 张塔罗牌 SVG！`);
  console.log(`📁 输出目录: ${outputDir}`);
}

// 运行
if (require.main === module) {
  generateAllCards();
}

module.exports = { generateAllCards };
