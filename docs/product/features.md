# 数学乐园 MathLand — 小学 1–6 年级数学闯关练习网站

## 1. 产品概述

面向小学 1–6 年级学生的数学在线练习平台。每个年级按**专题**分类，每个专题提供**讲解 + 巧算方法**供孩子先学后练，再进入 **5 个渐进关卡** 的闯关练习。题目由生成器**随机轮换**（每次进入关卡题目都不同），**计时器时长随关卡等级变化**，完成后记录**成绩历史**并沉淀到**个人档案**。

- 目标用户：小学 1–6 年级学生（6–12 岁），以及家长/老师查看学习记录
- 核心体验：先学（讲解 + 巧算） → 后练（闯关） → 复盘（成绩历史 + 档案统计）
- 视觉风格：Claymorphism（黏土拟态），明亮活泼、圆角厚重、强反馈动效

## 2. 核心功能

### 2.1 年级与专题体系（Grade × Topic）
- 6 个年级，每年级 6 个专题，共 **36 个专题**
- 每个专题包含：
  - `name` / `icon` / `summary`
  - `explanation`：知识点讲解（分段落 + 示例）
  - `smartMethods`：**巧算方法** 3 条（名称 + 思路 + 示例算式）
  - `levels`：5 个关卡（入门 / 进阶 / 熟练 / 挑战 / 大师）
- 关卡递进：数值范围扩大、运算步数增加、题型从选择过渡到填空、干扰项变强

### 2.2 题目轮换（Task Rotation）
- 每个关卡的 `generator` 是**参数化随机生成器**，每次进入按随机种子出题
- 同一轮内去重（同题不重复出现）
- 选择题选项顺序随机打乱；填空题题干数值随机
- 支持题型：`choice`（四选一）、`fill`（填数字）、`judge`（判断对错）

### 2.3 计时器（随关卡变化）
- 每个关卡定义 `questionCount` 与 `secondsPerQuestion`
- 总时长 = `questionCount × secondsPerQuestion`，等级越高单题时间越紧（更刺激）
- 支持「放松模式」开关：关闭计时，专注学习（家长可为低年级开启）
- 剩余时间 < 20% 时进度条变红 + 轻微脉冲提示

### 2.4 讲解与巧算方法（Study Section）
- 专题详情页分两个 Tab：**知识讲解** / **巧算方法**
- 巧算方法卡片含：方法名、适用情形、步骤拆解、示例
- 答题结束后，每道题的错误解析里会**回链**到对应巧算方法

### 2.5 成绩历史（Result History）
- 每次闯关生成一条记录：年级、专题、关卡、得分、正确数、用时、正确率、星级、日期
- 历史页支持按年级/专题筛选、按时间倒序、查看最近 N 次成绩曲线
- 同一专题可看到历史最佳与进步趋势

### 2.6 用户档案（User Profile）
- 多档案切换（一个浏览器可建多个孩子档案），无密码，友好安全
- 档案字段：昵称、头像（动物 emoji/图标 + 颜色）、当前年级
- 统计：总闯关次数、总答题数、平均正确率、总星星、连续练习天数
- 成就徽章：首次通关、连续答对 10 题、某专题全关卡三星、练习满 100 题等

## 3. 页面结构

| 路由 | 页面 | 说明 |
|---|---|---|
| `/` | 首页 Home | Hero、年级选择卡片、明星专题、如何玩 |
| `/grades/:grade` | 年级页 | 该年级 6 个专题卡片 + 进度概览 |
| `/study/:grade/:topicId` | 学习页 | 知识讲解 / 巧算方法 双 Tab |
| `/levels/:grade/:topicId` | 关卡地图 | 5 个关卡卡片，显示星级与最佳成绩、锁关逻辑 |
| `/play/:grade/:topicId/:level` | 答题页 | 计时器、进度条、题目卡、即时反馈 |
| `/result/:sessionId` | 结果页 | 星级、得分、逐题回顾与解析 |
| `/history` | 成绩历史 | 列表 + 筛选 + 趋势图 |
| `/profile` | 个人中心 | 档案编辑、统计、徽章、档案切换 |

## 4. 数据模型

### 4.1 Postgres 表

```sql
CREATE TABLE users (
  id           SERIAL PRIMARY KEY,
  name         VARCHAR(40)  NOT NULL,
  avatar       VARCHAR(20)  NOT NULL DEFAULT 'panda',
  color        VARCHAR(20)  NOT NULL DEFAULT 'indigo',
  grade        INT          NOT NULL DEFAULT 1,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE game_results (
  id            SERIAL PRIMARY KEY,
  user_id       INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  grade         INT NOT NULL,
  topic_id      VARCHAR(60) NOT NULL,
  level         INT NOT NULL,
  correct       INT NOT NULL,
  total         INT NOT NULL,
  score         INT NOT NULL,
  stars         INT NOT NULL,
  duration_ms   INT NOT NULL,
  timed         BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_results_user ON game_results(user_id, created_at DESC);
CREATE INDEX idx_results_topic ON game_results(user_id, topic_id);
```

### 4.2 前端本地结构（localStorage）
- `mathland.profileId`：当前选中的档案 id
- 当前闯关会话（Session）保存在内存（TanStack Query / React state）

## 5. API 端点（JSON 协议，全部 POST + JSON body）

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/health` | 健康检查 |
| POST | `/api/profiles/list` | 列出所有档案 |
| POST | `/api/profiles/create` | 创建档案 `{name, avatar, color, grade}` |
| POST | `/api/profiles/get` | 获取单个档案 `{id}` |
| POST | `/api/profiles/update` | 更新档案 `{id, ...}` |
| POST | `/api/profiles/delete` | 删除档案 `{id}` |
| POST | `/api/results/create` | 保存一次闯关成绩 |
| POST | `/api/results/get` | 单条成绩详情 `{id}` |
| POST | `/api/results/list` | 成绩历史 `{userId, grade?, topicId?, limit}` |
| POST | `/api/results/stats` | 档案统计 `{userId}`：总数、正确率、星星、连续天数、专题进度 |
| POST | `/api/results/topic-progress` | 各专题最佳星级 `{userId, grade}` |
| POST | `/api/results/level-progress` | 各专题各关卡最佳星级 `{userId, grade}`（用于解锁判断） |
| POST | `/api/results/delete` | 删除一条成绩 `{id}` |

## 6. 用户故事

1. 作为一年级学生，我想先看懂"凑十法"再做题，这样不会乱猜。
2. 作为三年级学生，我希望每次点开关卡题目都不一样，可以反复练。
3. 作为家长，我想看到孩子最近 10 次练习的正确率变化。
4. 作为学生，我想要星星和徽章，让我有动力继续闯关。
5. 作为低年级学生，我希望可以关掉计时，慢慢想。

## 7. 关卡与计时参数表

| 关卡 | 名称 | 题量 | 单题时间(秒) | 难度系数 |
|---|---|---|---|---|
| L1 | 入门 | 8 | 20 | 1 |
| L2 | 进阶 | 10 | 18 | 2 |
| L3 | 熟练 | 12 | 15 | 3 |
| L4 | 挑战 | 14 | 13 | 4 |
| L5 | 大师 | 16 | 12 | 5 |

低年级（1–2）题量 -2 且单题时间 +5 秒；高年级（5–6）题量 +0 且单题时间 -2 秒。
