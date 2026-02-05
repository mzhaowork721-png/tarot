# 🔮 塔罗日运 - Tarot Daily Reading

一个纯前端的塔罗牌日运占卜应用，支持正逆位解读、翻牌动画和AI智能解读。

## ✨ 功能特性

### A. 牌背显示
- 抽牌前显示4张牌背占位区，对应「过去」「现在」「建议」「今日关键能量」
- 支持自定义牌背图片（`assets/card-back.png`）
- 无图片时自动使用CSS渐变牌背作为fallback

### B. 翻牌与正逆位系统
- 每张牌随机确定正位或逆位（50/50概率）
- 基于日期的seed机制，确保同一天结果固定
- 3D翻牌动画效果（CSS transform）
- 逆位时图片自动旋转180度
- 显示正/逆位标识、关键词和含义

### C. 数据结构
- 支持新版数据格式：
  - `keywords_upright` / `keywords_reversed`
  - `meaning_upright` / `meaning_reversed`
  - `image`（可选）
- 兼容旧版数据格式（`keywords` / `meaning`）

### D. AI塔罗师解读
- 智能识别每张牌的正逆位
- 提供综合解读和逐张分析
- 根据正逆位给出不同的建议

## 📁 项目结构

```
tarot/
├── index.html          # 主页面
├── styles.css          # 样式文件（含翻牌动画）
├── app.js              # 核心逻辑（正逆位、seed机制）
├── tarot.json          # 塔罗牌数据
├── assets/             # 资源文件夹
│   └── card-back.png   # 牌背图片（可选）
└── README.md           # 说明文档
```

## 🎨 如何添加牌背图片

### 方法1：添加自定义牌背
1. 准备一张牌背图片（建议尺寸：280x480px 或等比例）
2. 将图片重命名为 `card-back.png`
3. 放置到 `assets/` 文件夹中
4. 刷新页面即可看到效果

### 方法2：使用CSS渐变牌背（默认）
- 如果不添加图片，系统会自动使用蓝金色渐变牌背
- 你可以在 `styles.css` 中修改 `.card-back-design` 的样式自定义颜色

### 牌背图片示例设计
推荐的牌背设计元素：
- 神秘的几何图案
- 星星、月亮、太阳等符号
- 深蓝、紫色、金色等神秘色调
- 对称的装饰性图案

## 📝 如何添加牌面图片

在 `tarot.json` 中为每张牌添加 `image` 字段：

```json
{
  "name": "The Fool",
  "name_cn": "愚者",
  "keywords_upright": "新开始、冒险、自由、天真",
  "keywords_reversed": "鲁莽、冲动、逃避责任、恐惧",
  "meaning_upright": "代表全新的开始...",
  "meaning_reversed": "可能过于冲动...",
  "image": "assets/cards/fool.jpg"
}
```

## 🚀 使用方法

1. **本地运行**
   - 直接打开 `index.html` 或使用本地服务器
   - 推荐使用 VS Code 的 Live Server 插件

2. **抽牌**
   - 点击「抽取今日四张牌」按钮
   - 观看翻牌动画
   - 查看正逆位解读

3. **每日限制**
   - 每天只能抽一次牌
   - 结果保存在浏览器本地存储
   - 隔天自动重置

## 🔧 自定义配置

### 修改牌阵位置
在 `app.js` 中修改 `CARD_POSITIONS` 数组：
```javascript
const CARD_POSITIONS = ['过去', '现在', '建议', '今日关键能量'];
```

### 调整正逆位概率
在 `drawCards()` 函数中修改：
```javascript
const isReversed = rng.next() < 0.5;  // 0.5 = 50%概率
```

### 修改翻牌动画速度
在 `styles.css` 中调整：
```css
.card-flip-inner {
    transition: transform 0.8s;  /* 调整这个值 */
}
```

## 📊 数据格式说明

### 新版格式（推荐）
```json
{
  "name": "The Magician",
  "name_cn": "魔术师",
  "number": 1,
  "arcana": "major",
  "keywords_upright": "创造力、技能、意志力、显化",
  "keywords_reversed": "操纵、欺骗、才能未发挥、缺乏信心",
  "meaning_upright": "你拥有将想法变为现实的所有资源...",
  "meaning_reversed": "可能在滥用才能或感到能力不足...",
  "image": "assets/cards/magician.jpg"
}
```

### 旧版格式（兼容）
```json
{
  "name": "The Magician",
  "name_cn": "魔术师",
  "keywords": "创造力、技能、意志力",
  "meaning": "你拥有将想法变为现实的能力..."
}
```

## 🎯 技术实现

### Seed机制
- 使用日期字符串作为随机数种子
- 保证同一天的结果完全一致
- 刷新页面不会改变当天结果

### 翻牌动画
- CSS 3D transform实现
- `transform-style: preserve-3d`
- `backface-visibility: hidden`

### 正逆位逻辑
- 每张牌独立判定正逆位
- 基于seeded random确保可重现性
- 逆位图片自动旋转180度

## 🌐 浏览器兼容性

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- 移动端浏览器均支持

## 📱 响应式设计

- 自适应桌面、平板、手机
- 卡片布局自动调整
- 触摸友好的交互

## ⚠️ 注意事项

1. **图片路径**：确保 `assets/` 文件夹和图片路径正确
2. **CORS问题**：某些浏览器本地打开HTML可能有跨域限制，建议使用本地服务器
3. **本地存储**：清除浏览器数据会重置抽牌记录

## 📄 开源协议

MIT License - 自由使用、修改和分发

## 🙏 致谢

感谢所有塔罗爱好者的支持！

---

✨ 祝你每天都能获得有益的指引！ ✨
