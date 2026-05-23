# 🎮 Game Design Workspace v2 | 游戏设计空间工作台

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![React Flow v12](https://img.shields.io/badge/React_Flow-v12-FF4081?style=flat-square&logo=react)](https://reactflow.dev/)
[![Gemini Enabled](https://img.shields.io/badge/Gemini_API-Auto-blue?style=flat-square&logo=google-gemini)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-MIT-lightgrey?style=flat-square)](LICENSE)

> **An AI-native spatial workspace for game design thinking and structural planning.**
>
> 这是一个基于 AI 原生架构、面向游戏设计师与系统策划的无限空间拖拽式工作台。针对游戏概念推演、机制构建、冲突梳理、数值原型验证、文档联动以及 AI 辅助头脑风暴，提供了一套工业级极简美学的高效生产力工具。

---

## 🎨 视觉美学与精细工业设计 (Industrial Aesthetics)

本项目严格贯彻极致优雅的 **工业极简美学 (Industrial Minimalism)**，拒绝华而不实的五彩渐变。通过精密负空间（Negative Space）与高精度微边框（Slight Borders）构筑富有呼吸感、专注感的设计环境。

- **多主题极致适配 (Dual-Theme System)**
  - **浅色模式 (Light Theme)**：采用极淡岩砂灰 (`bg-stone-50`) 与雪白 (`bg-white`) 对比，文本使用深木炭黑 (`text-stone-900`)，配有极柔和微细线 (`border-stone-200/50`)。
  - **深色模式 (Dark Theme)**：采用深夜深邃石炭黑 (`bg-stone-950` / `bg-stone-900`)，温和明亮的乳白文本 (`text-stone-100`)，搭配极为克制的超细发丝边框 (`border-white/10`)。
- **圆角与细腻阴影 (Chiseled Rounds & Shadows)**
  - 主体看板、弹出面板及操作卡片统一使用 `rounded-2xl` 指数量级大圆角与柔和微拟物阴影 (`shadow-2xl`)，并搭载高清晰毛玻璃层 (`backdrop-blur-2xl`)。
- **中线精密定位规则 (Center-Line Alignment Principle)**
  - 工具栏、功能组件库和设置弹窗统一遵循严格的中线对齐准则。弹窗菜单绝对定位在动作触发点上方，利用像素级精度偏移锁定垂直中线，并采用 `origin-bottom animate-in zoom-in-95 fade-in duration-200` 精雕细琢的动效回弹。

---

## 🚀 核心关键特性 (Key Features)

### 1. 无限拓扑设计画布 (Infinite Spatial Canvas)
基于前端最顶尖的 `@xyflow/react` (React Flow 12) 深度定制，支持大视图惯性缩放、位置微调、自适应布局视口锁定 (`FitView`)、背景微点阵网格，支持任意节点间的自由可画线、定向连线和跨节点关系梳理。

### 2. 八大专业特化游戏设计节点 (Specialized Node Architecture)
针对游戏策划的高频工作场景，开发了 9 类特异化语义节点。每个节点都配有精致的高保真细线线条图标 (14px SVG Line Icons) 并在视图中自适应，可以随双击自然从“查看态”无缝切换至“编辑态”：
*   💡 **想法 node (Idea)**：记录闪现的灵感、机制蓝图、玩法碎片。
*   ❓ **质疑 node (Question)**：标志设计盲区、未验证死角或用户体验坑点，供策划团队核心评审。
*   🔍 **发散 node (Expansion)**：承载分支剧情、分支技能机制、关卡可选策略的向外展开。
*   ⚡ **冲突 node (Contradiction)**：用于标记不相容规则、数值冗余或核心体验流割裂。
*   ✅ **解决 node (Solution)**：记录问题终结对策、机制打磨方案或破局手段。
*   🎯 **结论 node (Conclusion)**：锁定已敲定的黄金法则、里程碑规划与硬性开发参数。
*   🖼️ **媒体看板 (Image / Web / File)**：支持多格式拖放。直接嵌入外部图片进行视觉规划、载入实时网页 Preview、或拖入原始本地文件实施数据追踪。

### 3. 可拓展协作底座 (Built-in Blank Creator & Sandbox UI)
当节点处于原始或无内容状态时，展示精美的拖拽虚线区域 (`border-dashed border-stone-300`)。在配置选择面板底部，提供了一键快捷创建机制，可瞬间生成以下结构：
*   **富文本/Markdown 块**：采用 `.prose` 渲染，内置标题分级、高对比引用块、行距精准为经典的 `1.68` 黄金系数，呼吸度完美。
*   **简明 Text 提示**：快捷生成文本占位符。
*   **实时交互式在线表格 (Interactive Grid)**：支持高达 3x4 并可向外按需扩展的二维实时表格引擎。完美对接电子表格：
    *   双击任意单元格直接原位编辑、并支持外部 Excel 数据导入渲染。
    *   独创全方位列边缘、行边缘鼠标拖曳调整长宽 (Resize) 支持。
    *   边缘精美出现 `+` 悬浮按钮，完全悬浮由于表头外，一键追加整行或整列，免除传统菜单层层选取的繁杂感。
    *   全套右键行列头上下文菜单：一键删除行、删除列、正负插入等交互。

### 4. 零延迟长文档性能调优 (Zero-Lag Performance Engine)
在处理超过上万字的大规模设计文档与大量复杂节点时：
- 我们使用 `React.useMemo` 将内置的 Markdown 节点语法树编译过程进行高级别精细缓存 (`memoizedMarkdown`)。
- 当用户在画布进行拖拽、拉伸、缩放、甚至多选操作时，节点内容避免一切无意义重渲染 (AST 编译重新解析消耗降降为 0)。
- 通过严格对比属性纯度、监听主渲染死锁防止状态循环回流 (Anti-Infinite Loop Mode)，保障整张画布高达 100+ 节点时依然流畅至 60 FPS。

---

## 🛠️ 技术栈蓝图 (Tech Stack)

### 核心底座 & 渲染框架
*   **React 19 & Next.js 15 (App Router)** - 现代、轻敏、SSR 与客户端状态和谐交融。
*   **TypeScript 5.9** - 严格的强类型断言，确保复杂空间状态无懈可击。
*   **Tailwind CSS v4** - 采用 `@tailwindcss/postcss` 优雅集成的顶尖样式方案，实现 Stone-Slate 系统色谱高精还原。
*   **Motion (`motion/react`)** - 高可信微动变换、柔和回弹过渡曲线、极低重组代价。

### 拓扑与数据加工生态
*   **@xyflow/react (React Flow 12)** - 节点、连接线、视口状态及拖拉变换的核心底座。
*   **xlsx & mammoth** - 本地大表格无痕解析及复杂 Word `.docx` 格式文档的空间重构器。
*   **react-markdown & @tailwindcss/typography** - 格式精美的策划案文本排版解析层，支持标准的 Markdown GFM。
*   **lucide-react** - 极致统一的矢量流线图标库。

---

## 📂 项目架构与关键组件定位 (Project Architecture)

```bash
├── app/
│   ├── globals.css          # 全局样式配置 (Tailwind v4 极简导入)
│   ├── layout.tsx           # 主体视窗布局结构 (搭载 motion 过渡)
│   └── page.tsx             # 应用主入口 (处理 Landing / Management 状态机)
├── components/
│   ├── canvas/
│   │   ├── Workspace.tsx    # 空间主画布：管理 FlowState、连线、工具栏与弹层中轴对齐
│   │   └── CustomNode.tsx   # 核心组件节点：管理 9 种节点卡片形态，并集成高性能 markdown、表格及多媒体画布
│   ├── landing/
│   │   └── LandingPage.tsx  # 沙盒仓库页：提供最近画板概况、模板新建和资产管理
│   ├── layout/
│   │   └── Header.tsx       # 全局顶栏：深浅主题切换、画板命名及面包屑导航
│   └── management/
│       └── ManagementPage.tsx # 大画板配置视图
├── lib/
│   └── utils.ts             # 极简 Tailwind Merge & clsx 智能处理工具
├── AGENTS.md                # 游戏设计工作台底层视觉与 UI 排布最高规范指导
└── metadata.json            # 画板元数据、安全属性与 AI 顶层声明
```

---

## 💻 快速本地构建 & 开发 (Getting Started)

要将其克隆到本地并进行部署或本地开发，请执行以下步骤：

### 1. 克隆与依赖项安装
在你的终端中安装基础包依赖：
```bash
# 获取源码后，执行标准 npm 依赖构建
npm install
```

### 2. 本地开发服务器启动
启动 Next.js 快速反应开发服务器（将运行在 `http://localhost:3000`）：
```bash
npm run dev
```

### 3. 高质量代码构建
确保生成完美的生产包（不包括 HMR 的纯化输出，存储于 `dist/` 或 Next 编译层）：
```bash
npm run build
```

### 4. 代码规范验证
对整个工作台画布的 React 挂钩依赖（E.g. `useEffect` 循环项）、TypeScript 分级进行 Linting 审查：
```bash
npm run lint
```

---

## 🛡️ License

Este under standard [MIT License](LICENSE). 

欢迎利用 **Game Design Workspace** 打造属于你团队的独一无二的游戏世界！如有任何想法（Idea）、机制冲突（Contradiction）或者功能建议（Question），欢迎将我们的画布带进你的日常策划工作会，探索非线性的游戏想象力！
