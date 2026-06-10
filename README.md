# 简程 — AI 简历与岗位匹配

上传简历，AI 帮你找到最匹配的岗位，并给出具体的简历改写建议。

## 技术栈

- **前端**: Next.js 16 + React 19 + TypeScript + Tailwind CSS
- **后端**: Next.js API Routes
- **数据库**: SQLite (本地) / PostgreSQL (生产) + Prisma ORM
- **AI**: DeepSeek API (deepseek-v4-flash / deepseek-v4-pro)
- **部署**: Vercel

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env` 文件，填入你的 DeepSeek API Key：

```
DEEPSEEK_API_KEY="你的DeepSeek-API-Key"
DATABASE_URL="file:./dev.db"
```

### 3. 初始化数据库

```bash
npx prisma generate
npx prisma db push
```

### 4. 启动开发服务器

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看。

## 项目结构

```
src/
├── app/
│   ├── layout.tsx          # 全局布局（导航栏 + 页脚）
│   ├── page.tsx            # 首页（上传简历 + 偏好输入）
│   ├── globals.css         # 全局样式（苹果风格设计系统）
│   ├── results/page.tsx    # 匹配结果页（5 个岗位卡片）
│   ├── job/[id]/page.tsx   # 岗位详情页（JD 要点 + AI 分析）
│   ├── rewrite/[id]/page.tsx # 简历改写页（三区块建议）
│   └── api/
│       ├── parse-resume/   # PDF 解析 + LLM 结构化提取
│       ├── match-jobs/     # 语义匹配 + 三维度评分
│       ├── rewrite-resume/ # 针对性改写建议生成
│       └── job-detail/     # JD 提炼 + 推荐分析
├── components/             # 可复用组件
├── lib/
│   ├── deepseek.ts         # DeepSeek API 客户端（JSON Mode）
│   ├── pdf-parser.ts       # PDF 文本提取
│   ├── prompts.ts          # LLM Prompt 工程（三层约束）
│   └── prisma.ts           # Prisma 客户端
├── data/
│   └── jobs.json           # 30 条 Mock 岗位数据
└── types/
    └── index.ts            # TypeScript 类型定义
```

## 核心设计

### Prompt 工程 — 三层约束

1. **角色锚定**: 模型扮演「资深面试官」，不是「职业规划顾问」
2. **禁用词表**: 禁止「建议」「努力」「可以考虑」等模糊动词
3. **格式约束**: 强制输出「位置 + 修改内容 + 理由」三元结构 + Few-shot 范例

### 结构化输出兜底

- **Prompt 层**: Few-shot 嵌入标准输出范例
- **预处理层**: API 响应统一清洗（去 Markdown 标记、补全残缺 JSON）
- **降级兜底**: 解析失败显示友好提示，保留用户输入

## 部署

```bash
npm run build
npm start
```

或一键部署到 Vercel。
