# MathLand: A Math Level-Up Practice Site for Primary Grades 1–6

## 1. Product overview

MathLand is an online math practice platform for primary school students in grades 1–6. Each grade is organized into **topics**. Every topic offers a **concept guide plus smart tricks** so kids learn first, then practice through **5 levels of rising difficulty**. Questions are **rotated at random** by generators (a level never shows the same questions twice), the **timer length changes with the level**, and every result is saved to a **result history** and rolled up into a **personal profile**.

- Target users: primary school students in grades 1–6 (ages 6–12), plus parents and teachers who want to see learning records
- Core experience: learn (concepts + smart tricks) → practice (levels) → review (result history + profile stats)
- Visual style: Claymorphism, bright and playful, with thick rounded corners and strong feedback animations

## 2. Core features

### 2.1 Grade and topic system (Grade × Topic)
- 6 grades with 6 topics each, for **36 topics** in total
- Each topic contains:
  - `name` / `icon` / `summary`
  - `explanation`: concept explanations (sections with examples)
  - `smartMethods`: **3 smart tricks** (name + idea + worked example)
  - `levels`: 5 levels (Starter / Intermediate / Skilled / Challenge / Master)
- Level progression: wider number ranges, more calculation steps, a shift from multiple choice to fill-in-the-blank, and stronger distractors

### 2.2 Question rotation (Task Rotation)
- Each level's `generator` is a **parameterized random generator** that builds questions from a random seed every time the level is entered
- No repeats within one round (the same question never appears twice)
- Multiple-choice options are shuffled, and the numbers in fill-in-the-blank prompts are random
- Supported question kinds: `choice` (pick one of four), `fill` (type a number), `judge` (true or false)

### 2.3 Timer (changes with the level)
- Each level defines `questionCount` and `secondsPerQuestion`
- Total time = `questionCount × secondsPerQuestion`. Higher levels give less time per question, which raises the excitement
- A "relax mode" switch turns the timer off so kids can focus on learning (parents can turn it on for younger kids)
- When less than 20% of the time remains, the progress bar turns red and pulses gently

### 2.4 Concepts and smart tricks (Study Section)
- The topic detail page has two tabs: **Concepts** and **Smart tricks**
- Each smart trick card has the method name, when to use it, the step-by-step breakdown, and an example
- After a level ends, each wrong-answer explanation **links back** to the matching smart trick

### 2.5 Result history (Result History)
- Every level played creates a record: grade, topic, level, score, number correct, time taken, accuracy, star rating and date
- The history page can filter by grade and topic, sorts newest first, and shows a trend of the most recent N results
- For each topic you can see your personal best and your progress trend

### 2.6 User profile (User Profile)
- Switch between multiple profiles (one browser can hold several children's profiles). There are no passwords. Profiles are private to the browser that created them: the browser creates a random device id, sends it with every request, and the server only returns profiles and results owned by that id
- Profile fields: nickname, avatar (animal emoji or icon + color) and current grade
- Stats: total levels played, total questions answered, average accuracy, total stars and practice streak in days
- Achievement badges: first level cleared, 10 correct answers in a row, three stars on every level of a topic, 100 questions practiced, and so on

## 3. Page structure

| Route | Page | Description |
|---|---|---|
| `/` | Home | Hero, grade picker cards, featured topics, how to play |
| `/grades/:grade` | Grade page | The 6 topic cards for that grade plus a progress overview |
| `/study/:grade/:topicId` | Study page | Concepts / Smart tricks tabs |
| `/levels/:grade/:topicId` | Level map | 5 level cards showing stars and best score, with level-locking logic |
| `/play/:grade/:topicId/:level` | Play page | Timer, progress bar, question card and instant feedback |
| `/result/:sessionId` | Result page | Stars, score, and a question-by-question review with explanations |
| `/history` | Result history | List + filters + trend chart |
| `/profile` | My profile | Profile editing, stats, badges and profile switching |

## 4. Data model

### 4.1 Postgres tables

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

### 4.2 Frontend local state (localStorage)
- `mathland.profileId`: the id of the currently selected profile
- The current level session is kept in memory (TanStack Query / React state)

## 5. API endpoints (JSON protocol, all POST with a JSON body)

| Method | Path | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| POST | `/api/profiles/list` | List all profiles |
| POST | `/api/profiles/create` | Create a profile `{name, avatar, color, grade}` |
| POST | `/api/profiles/get` | Get one profile `{id}` |
| POST | `/api/profiles/update` | Update a profile `{id, ...}` |
| POST | `/api/profiles/delete` | Delete a profile `{id}` |
| POST | `/api/results/create` | Save the result of one level |
| POST | `/api/results/get` | Details of one result `{id}` |
| POST | `/api/results/list` | Result history `{userId, grade?, topicId?, limit}` |
| POST | `/api/results/stats` | Profile stats `{userId}`: totals, accuracy, stars, streak days and topic progress |
| POST | `/api/results/topic-progress` | Best star rating for each topic `{userId, grade}` |
| POST | `/api/results/level-progress` | Best star rating for each level of each topic `{userId, grade}` (used to decide unlocking) |
| POST | `/api/results/delete` | Delete one result `{id}` |

## 6. User stories

1. As a grade 1 student, I want to understand "make a ten" before I practice, so I do not have to guess.
2. As a grade 3 student, I want the questions to be different every time I open a level, so I can practice again and again.
3. As a parent, I want to see how my child's accuracy changed over the last 10 practice sessions.
4. As a student, I want stars and badges so I feel motivated to keep playing levels.
5. As a younger student, I want to turn off the timer so I can think slowly.

## 7. Level and timer parameters

| Level | Name | Questions | Seconds per question | Difficulty factor |
|---|---|---|---|---|
| L1 | Starter | 8 | 20 | 1 |
| L2 | Intermediate | 10 | 18 | 2 |
| L3 | Skilled | 12 | 15 | 3 |
| L4 | Challenge | 14 | 13 | 4 |
| L5 | Master | 16 | 12 | 5 |

For lower grades (1–2), the question count is 2 lower and each question gets 5 more seconds. For upper grades (5–6), the question count is unchanged and each question gets 2 fewer seconds.
