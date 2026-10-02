# 数学乐园 MathLand

面向小学 **1–6 年级** 的数学闯关学习网站。每个年级按知识点分成专题，每个专题有 **5 个渐进关卡**，每关题目随机轮换、按关卡难度计时，答错即时讲解，成绩与星星全部记录在档案里。

## 功能

| 功能 | 说明 |
| --- | --- |
| 分年级分专题 | 6 个年级 × 6 个专题 = **36 个专题**（一年级 20 以内加减法，六年级分数百分数、比例、圆柱圆锥…） |
| 渐进关卡 | 每个专题 5 关，题量与速度随关卡递增；上一关拿到 ≥1 星才解锁下一关 |
| 题目轮换 | 每次进入关卡重新生成题目，并避开最近做过的题干，不会刷到同一套题 |
| 先学后练 | 每个专题都有「知识讲解」与「巧算方法」两个板块；答题答错时直接弹出对应解析和巧算提示 |
| 关卡计时 | L1 = 8 题 × 20 秒 → L5 = 16 题 × 12 秒；一二年级题量 −2、每题 +5 秒，五六年级每题 −2 秒；倒计时归零自动交卷。另有「不限时练习」模式 |
| 成绩历史 | 每轮记录分数、正确率、用时、星级；历史页有统计卡片、专题掌握度、按年级/专题筛选、删除记录 |
| 用户档案 | 支持多个孩子档案（昵称 / 头像 / 主题色 / 年级），随时切换、编辑、删除；档案页展示各年级闯关分布与连续练习天数 |

## 技术栈

- **前端**：React 19 + TypeScript + Vite + Tailwind CSS v4 + TanStack Query，Claymorphism 童趣设计（Baloo 2 字体、圆润卡片、柔和阴影）
- **后端**：Node.js + Express + TypeScript（zod 校验）+ PostgreSQL（pg）
- **出题引擎**：`frontend/src/curriculum/` 下 36 个参数化随机出题器，产出 `choice` / `fill` / `judge` 三类题型

## 本地运行

前置：Node.js 20+、pnpm、PostgreSQL。

```bash
# 1. 启动数据库并建库
docker run -d --name postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres
docker exec postgres psql -U postgres -c "CREATE DATABASE mathland;"

# 2. 后端
cd backend
pnpm install
cp .env.example .env        # 按需修改 DATABASE_URL
pnpm dev                    # http://localhost:3000

# 3. 前端（新开终端）
cd frontend
pnpm install
pnpm dev                    # http://localhost:5173
```

首次打开会引导创建档案，之后即可选年级 → 看讲解/巧算 → 闯关。

> 数据库表（`users`、`game_results`）在后端启动时自动创建，无需手动迁移。

## 项目结构

```
backend/src
  config/       环境变量与数据库连接池
  modules/      profiles / results / system 路由
  types/        zod 校验schema
frontend/src
  curriculum/   36 个专题的讲解、巧算方法与出题器
  pages/        首页、年级页、学习方法页、关卡页、闯关页、成绩页、历史页、档案页
  components/   顶栏、星星、头像、MotionPrimitives
  context/      档案状态
docs/
  product/features.md   产品需求文档
```

## 主要接口

所有接口均为 `POST` + JSON：

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| POST | `/api/profiles/list` `/create` `/get` `/update` `/delete` | 档案 CRUD |
| POST | `/api/results/create` | 保存一轮成绩 |
| POST | `/api/results/get` `/list` `/delete` | 成绩详情 / 历史 / 删除 |
| POST | `/api/results/stats` | 档案统计：总场次、正确率、星星、连续天数、专题进度 |
| POST | `/api/results/topic-progress` `/level-progress` | 专题最佳星级 / 关卡最佳成绩 |
| GET | `/api/health/ready` | 健康检查（含数据库连通性） |
