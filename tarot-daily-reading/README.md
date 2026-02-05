# 塔罗日运 - Tarot Daily Reading

> 一个纯前端实现的塔罗日运网页应用，每日抽取4张牌并提供AI解读。

---

## ✨ 功能特点

- **每日固定结果**：同一天内多次访问，抽到的牌都相同（基于日期的伪随机算法）
- **纯前端实现**：无需后端、无需安装框架，双击即可运行
- **精美UI设计**：渐变背景、卡片动画、响应式布局
- **AI塔罗师解读**：本地生成的专业塔罗解读（4个维度）
- **22张大阿卡纳**：完整的大阿卡纳牌库，可扩展至78张

---

## 🚀 快速开始

### 方法一：直接运行
1. 下载整个 `tarot-daily-reading` 文件夹
2. 双击打开 `index.html`
3. 开始使用！

### 方法二：本地服务器（可选）
```bash
# 进入项目目录
cd tarot-daily-reading

# 使用 Python 启动本地服务器
python -m http.server 8000

# 或使用 Node.js
npx http-server
```

然后在浏览器访问：`http://localhost:8000`

---

## 📂 项目结构

```
tarot-daily-reading/
├── index.html          # 主页面（包含3个页面状态）
├── styles.css          # 完整样式文件
├── app.js              # 核心逻辑（时间更新、抽牌、解读生成）
├── tarot.json          # 塔罗牌数据库（22张大阿卡纳）
└── README.md           # 使用说明
```

---

## 🎴 使用流程

### 1. 开屏页
- 显示当前日期和实时时间（每秒更新）
- 点击「继续」按钮进入抽牌页面

### 2. 抽牌页
- 显示塔罗牌背面的牌堆效果
- 点击「抽取今日四张牌」按钮
- 系统基于今日日期抽取4张不重复的牌

### 3. 结果页
- 展示4张牌的详细信息：
  - **过去**：回顾过去的影响
  - **现在**：当下的状态
  - **建议**：未来的指引
  - **今日关键能量**：整体能量核心

- 显示AI塔罗师解读（4个部分）：
  - 🌟 今日总体能量
  - 🔮 四张牌逐张解读
  - ✨ 今日行动建议（3条）
  - 💫 今日提醒

- 可以点击「重新抽取」返回抽牌页

---

## 🔑 核心技术原理

### 每日固定结果的实现
使用 **Park-Miller 伪随机数生成器** + **日期种子**：

```javascript
// 1. 根据日期生成种子
const seed = getDateSeed('2026-02-05'); // 例如：20260205

// 2. 创建伪随机数生成器
const rng = new SeededRandom(seed);

// 3. 使用伪随机数进行洗牌
// 相同种子 → 相同随机序列 → 相同抽牌结果
```

**优势**：
- 同一天内结果完全一致
- 不同日期结果不同
- 无需服务器存储
- 可复现、可验证

---

## 🎨 数据结构

### tarot.json 格式

```json
{
  "id": 0,
  "name": "愚者",
  "name_en": "The Fool",
  "arcana": "major",
  "keywords": ["新开始", "冒险", "天真"],
  "meaning": "愚者代表人生旅程的开始...",
  "image": ""
}
```

### 字段说明
- `id`: 牌的唯一标识
- `name`: 中文牌名
- `name_en`: 英文牌名
- `arcana`: 牌的类型（major/minor）
- `keywords`: 关键词数组（3-5个）
- `meaning`: 牌义说明（1-2句）
- `image`: 牌的图片路径（预留字段）

---

## 🔧 扩展开发

### 添加更多塔罗牌
编辑 `tarot.json`，按照现有格式添加：
- 小阿卡纳：权杖、圣杯、宝剑、星币各14张（共56张）
- 完整牌库：22 + 56 = 78张

### 添加牌面图片
1. 将图片放入 `assets/images/` 目录
2. 在 `tarot.json` 中更新 `image` 字段：
   ```json
   "image": "assets/images/fool.jpg"
   ```
3. 在 `app.js` 的 `displayCards()` 函数中添加图片显示逻辑

### 接入真实AI API（可选）
如果要接入 ChatGPT/Claude API：

1. 在 `app.js` 中找到 `generateReading()` 函数
2. 替换为 API 调用：
   ```javascript
   async function generateReading(cards) {
       const response = await fetch('YOUR_API_ENDPOINT', {
           method: 'POST',
           body: JSON.stringify({ cards })
       });
       return await response.json();
   }
   ```

---

## 📱 响应式设计

支持以下设备：
- 💻 桌面端（> 768px）
- 📱 平板（768px - 480px）
- 📱 手机（< 480px）

所有元素自动适配屏幕尺寸。

---

## 🎯 技术栈

- **HTML5**：语义化结构
- **CSS3**：渐变、动画、Grid/Flexbox
- **Vanilla JavaScript**：ES6+，无依赖

---

## 📝 注意事项

1. **浏览器兼容性**：
   - 建议使用 Chrome/Firefox/Safari/Edge 最新版本
   - 不支持 IE 浏览器

2. **本地文件访问**：
   - 直接双击 HTML 在大部分浏览器都能正常运行
   - 如果遇到 CORS 错误，使用本地服务器运行

3. **数据加载**：
   - 首次加载需要读取 `tarot.json`
   - 确保 JSON 文件和 HTML 在同一目录

---

## 🌟 未来计划

- [ ] 添加78张完整牌库
- [ ] 添加牌面图片
- [ ] 支持正位/逆位
- [ ] 添加更多牌阵（三角牌阵、凯尔特十字等）
- [ ] 保存历史记录
- [ ] 分享功能
- [ ] PWA支持（离线可用）

---

## 📄 许可证

MIT License - 自由使用和修改

---

## 💬 联系方式

如有问题或建议，欢迎反馈！

---

**享受你的塔罗日运之旅！ 🔮✨**
