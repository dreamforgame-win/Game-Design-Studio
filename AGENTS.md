# 游戏设计工作台 (Game Design Workspace) 视觉与交互设计规范指南

本指南是设计与代码实现的最高规范蓝图，后续所有新增 UI、组件及功能界面在修改或创建时**必须严格遵守本规范**，以确保设计质量及其底层实现的一致性，防止布局错位、反复修改或代码回归。

---

## 一、 核心视觉美学理 (Core Aesthetics)

1. **至简克制，精细打磨 (Industrial Minimalism)**
   - 杜绝粗俗无趣的渐变色组合，全面采用经典的温和灰度石元素（Stone Line/Slate）。
   - 让负空间（Negative Space）和精确的边框微调（Borders）来塑造视觉重点与层次。

2. **多主题极致适配 (Dual-Theme Adaptation)**
   - **浅色模式 (Light Theme)**：背景主要采用极淡石岩灰 (`bg-stone-50`) 与雪白 (`bg-white`)，文字采用深炭灰 (`text-stone-900`/`text-stone-700`)，配有非常柔和的 `stone-200/50` 浅线。
   - **深色模式 (Dark Theme)**：采用深夜石炭黑 (`bg-stone-950`/`bg-stone-900`)，文字使用珍珠白或乳白 (`text-stone-100`/`text-stone-200`)，搭配极为克制的细边框 (`border-white/10`)。

3. **圆角与投影规范 (Rounds & Shadows)**
   - 主体卡片/菜单：使用大圆角 `rounded-2xl` (16px) 或 `rounded-xl` (12px)。
   - 悬浮菜单：自带大柔和阴影 `shadow-2xl` 并配有极细毛玻璃边框 `backdrop-blur-2xl border border-stone-200/50 dark:border-white/10`。

---

## 二、 工具栏与弹窗菜单定位规范 (Toolbar & Menu Alignment)

这是控制整条底部操作栏及附属菜单排布的黄金定律：

1. **绝对对齐一致性 (Absolute Bottom Spacing & Elevation)**
   - 所有弹出式菜单（“功能组件”菜单、“设置”菜单、“文档”菜单等）必须统一在工具栏上方浮起，底部距离边界保持绝对一致，如底部定位统一为 `bottom-24`。
   - 所有菜单的弹出动画均需采用一致的入场特效：`origin-bottom animate-in zoom-in-95 fade-in duration-200`，保证视觉联动流畅自然。

2. **中线精密对齐规则 (Center Line Alignment Principle)**
   - 严禁弹窗菜单出现无章法的侧向偏移。
   - 菜单水平中心线必须与对应触发按钮的水平中心线在像素级上精确对齐：
     - **技术原理**：通过在主体使用相对于屏幕/视图的 `absolute left-1/2 -translate-x-1/2` 主轴定位，并利用 `ml-[X px]`（正负偏差值）来锁定特定触发按钮的中线。
     - **当前实测数据 (保持严密同步)**：
       - **“功能组件”菜单 (Library Menu)**：偏差定位为 `ml-[88px] -translate-x-1/2`，使其完美垂直对齐“功能组件”按钮。
       - **“设置”菜单 (Settings Menu)**：偏差定位为 `ml-[149px] -translate-x-1/2`，使其完美垂直对齐“设置”按钮。
     - 新增任何弹窗菜单时，必须根据触发按钮的位置精准计算偏移像素量，并保证其中线完美重合。

---

## 三、 功能性画布卡片规范 (Custom Card & Sandbox UI)

1. **节点视觉构成**
   - 每一个节点头部配有精致的小标识（如 Lightbulb、Zip 等 14px 优雅线条图标）以及清晰的中文标题。
   - 内容输入区域应随点击无缝转化，在查看与编辑态之间自然过渡。

2. **内置空白新建与文件区规范 (Empty State & File Creation)**
   - 节点拖进或处于原始无文件状态时，须展现富有设计感的拖拽虚线区（如 `border-dashed border-stone-300 dark:border-white/10`），配备点击或拖拽上传指示。
   - **快捷新建空白文件 (Quick Blank Creation)**：在选择区底部，以对称网格（如 3 列 `grid-cols-3`）的形式，提供一键快捷创建同等格式文件功能：
     - **Markdown**：默认填充适当占位头标题与排版指引（绿色文字标识）。
     - **纯文本 (txt)**：提供初始简明提示（蓝色文字标识）。
     - **在线表格**：提供 3x4 实用的在线二维表格结构，包括默认表格列头 A、B、C（琥珀色文字标识）。

---

## 四、 页面交互与状态控制规范 (State & Re-renders Precautions)

1. **状态更新防环死锁 (Anti-Infinite Loop Checks)**
   - 任何同步属性变更到内部状态的操作，严禁直接在组件主渲染流程中调用没有进行新旧值对比的 `setState`。
   - 使用单调递增性对比（例如 `data.content !== prevContent`），当且仅当属性切实变化、且用户不处于编辑焦点时，才写回状态。以此保障输入态（isEditing）顺畅无阻，并决不触发 `React limits the number of renders` 异常。

2. **图标库约束 (Unified Icons)**
   - 一律自外层引入 `lucide-react`，杜绝任何自定义、不规则色块或冗余的内联 SVG 形状。

3. **动画强度 (Animation Rigor)**
   - 所有悬浮动效必须统一采用细微的缩放或底色轻微渐变反馈。例如 `hover:bg-opacity-80 transition-all` 或组件卡片的柔和弹性位移，为工作台画布等复杂层构建出纵深与质感。

---

## 五、 排版与 Markdown 渲染规范 (Typography & Markdown Styling Guidelines)

为确保整个工作台画布、文件节点、预览页面的视觉延续性与极限的可读性平衡，排版设计严格遵循以下准则：

1. **全局行距统一 (Unified Line-Height)**
   - 全局 Markdown 卡片与文档流采用经典的 `.prose` 渲染。为了在大片文字与紧凑空间之间保持完美的空气感，全局行距设定为：
     - **正文流行间距**：固定为 `line-height: 1.68` (`leading-relaxed` 极佳过渡态)。
     - **列表行间距**：列表项 (.prose li) 统一为 `line-height: 1.62`，垂直外间距为 `margin-top: 0.25rem` / `margin-bottom: 0.25rem`，杜绝传统组件中常见的过度挤压与松散。

2. **标题梯度与呼吸空间 (Heading Scale & Breathing Room)**
   - **大标题 (H1)**: `1.35rem` (21.6px)，并提供 `margin-top: 1.35rem` 保证与上一节点的独立空间。
   - **中标题 (H2)**: `1.15rem` (18.4px)，配有 `margin-top: 1.15rem` 呼吸。
   - **小标题 (H3/H4)**: 分别为 `1.025rem` (16.4px) 及 `0.925rem` (14.8px)。

3. **零卡顿与性能增强 (Zero-Lag Performance Tuning)**
   - 对于大规模 Markdown 渲染（如 >10k 的长文档文件），节点严禁重复解析 Markdown 树。
   - **优化实现**：使用 `React.useMemo` 将 `<ReactMarkdown ...>` 组件进行依赖项精细缓存 (`memoizedMarkdown`)，只有当 `content` 发生实质修改时才重新生成 AST 语法树。配合 `React.memo(CustomNode)`，将画布在节点拖曳、拉伸或缩放时的渲染消耗降为 0，根治大文章卡顿。

---

*后续的代码迭代与 UI 扩展均须依据以上定义。在此规则框架下进行，既可以极大提高开发效率。*
