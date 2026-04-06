# AlgoLearn — Архитектура, запуск и деплой

> Сервис для изучения алгоритмов и структур данных с интерактивным roadmap, статьями, задачами (Pyodide) и личным кабинетом со статистикой.

---

## 1. Архитектура проекта

```
┌─────────────────────────────────────────────────┐
│                 ФРОНТЕНД (:5173)                │
│  React 19 + TS + Vite 7 + Redux + FSD          │
│                                                   │
│  ┌─────────┐ ┌──────────┐ ┌───────────────┐     │
│  │ Roadmap │ │  Tasks   │ │   Task Page   │     │
│  │ (статьи)│ │ (список) │ │ (Pyodide + UI)│     │
│  └─────────┘ └──────────┘ └───────────────┘     │
│  ┌──────────────────────────────┐              │
│  │   Account Page (дашборд)      │              │
│  │   KPI + Heatmap + Charts     │              │
│  └──────────────────────────────┘              │
└─────────┬──────────────────────┬──────────────┘
          │                      │
   /content-api            VITE_API_URL
          │                      │
┌─────────▼──────────┐  ┌───────────────────────┐
│  CONTENT API (:3001) │  │   API SERVER (:3000)  │
│  json-server        │  │  Fastify 5 + Prisma 6 │
│  db.json            │  │                       │
│  Статьи + Задачи    │  │  ┌─────────────────┐  │
│                    │  │  │  SQLite (dev)   │  │
│                    │  │  │  PostgreSQL(pg) │  │
│                    │  │  └─────────────────┘  │
└────────────────────┘  └───────────────────────┘
```

### Порты

| Сервис | Порт | Назначение |
|--------|------|------------|
| Frontend (Vite dev) | `:5173` | SPA, React |
| API Server (Fastify) | `:3000` | Auth, stats, profile |
| Content API (json-server) | `:3001` | Статьи, задачи |

### Безопасность авторизации

- **Access JWT** — 15 мин TTL, передаётся в `Authorization: Bearer`
- **Refresh Token** — 14 дней, хранится в `httpOnly`, `Secure`, `SameSite=lax` cookie
- Пароли хешированы через **bcrypt** (salt rounds: 10)
- Rate limiting: **300 req/мин** на все endpoints

---

## 2. Структура фронтенда (FSD)

```
front/src/
├── app/                  # Инициализация приложения
│   ├── index.tsx         # Корневой компонент, провайдеры
│   └── router/           # React Router конфигурация
│
├── pages/                # Страницы (маршруты)
│   ├── account/          # /account — личный кабинет
│   ├── tasks/            # /tasks — список задач
│   ├── task/             # /task/:id — страница задачи
│   ├── roadmap/          # /roadmap — roadmap со статьями
│   └── react-flow-roadmap/  # Интерактивная визуализация
│
├── widgets/              # Композитные блоки
│   ├── app-header/       # Шапка приложения
│   ├── topic-sidebar/    # Сайдбар с темой
│   ├── tasks-stats-snippet/  # Виджет статистики на TasksPage
│   ├── stats-dashboard/  # Графики в ЛК (Recharts)
│   └── stats-kpi/        # KPI-карточки в ЛК
│
├── entities/             # Доменные модели
│   ├── article/          # Статьи (useArticleByTopic)
│   ├── task/             # Задачи (types, data, hooks)
│   └── roadmap/          # Roadmap данные
│
├── features/             # Пользовательские действия (будущее)
│
└── shared/               # Переиспользуемый код
    ├── api/              # api-client.ts (fetch wrapper)
    ├── config/           # Конфигурация (URLs)
    ├── lib/              # Утилиты (hooks)
    ├── store/            # Redux store + slices
    └── ui/               # UI-компоненты (GlassButton, etc.)
```

**Правила слоёв FSD:**
- `app` → только провайдеры, роутер, конфиг
- `pages` → только страницы (импортируют из `widgets`/`entities`/`shared`)
- `widgets` → композитные блоки (импортируют из `entities`/`shared`)
- `entities` → доменные модели (импортируют из `shared`)
- `shared` → переиспользуемый код (никогда не импортирует из вышестоящих слоёв)

---

## 3. Переменные окружения

### Frontend (`front/.env.local`)

```env
# URL API сервера (auth, статистика, прогресс)
VITE_API_URL=http://localhost:3000

# URL контент API (статьи, задачи из db.json)
# В dev: не задавайте — запросы идут через Vite proxy /content-api → localhost:3001
# В prod: укажите URL json-server, например http://your-domain:3001
# Пустая строка = только встроенные TASKS/THEORIES (без API)
# VITE_CONTENT_API_URL=
```

### Backend (`server/.env`)

```env
# ===== БАЗА ДАННЫХ =====
# Локальная разработка (SQLite)
DATABASE_URL="file:./dev.db"

# Продакшен (PostgreSQL): раскомментируйте
# DATABASE_URL="postgresql://user:password@host:5432/dbname?schema=public&sslmode=require"

# ===== СЕРВЕР =====
PORT=3000
# Разделённый запятыми список допустимых фронтенд-орижинов
CORS_ORIGINS=http://localhost:5173

# ===== JWT =====
# Генерация: node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
JWT_ACCESS_SECRET=local_dev_access_secret_change_me_32chars_min
JWT_REFRESH_SECRET=local_dev_refresh_secret_change_me_32chars_m

# ===== ОПЦИОНАЛЬНО =====
# NODE_ENV=production   # для prod-режима (secure cookie, логирование)
# LOG_LEVEL=info        # 'debug' (dev) или 'info' / 'warn' / 'error'
```

---

## 4. API Endpoints

### Auth

| Метод | Путь | Body | Ответ | Описание |
|-------|------|------|-------|----------|
| POST | `/auth/register` | `{ email, password, username, displayName? }` | `{ accessToken, user }` | Регистрация нового пользователя |
| POST | `/auth/login` | `{ identifier: email\|username, password }` | `{ accessToken, user }` | Вход по email или username |
| POST | `/auth/refresh` | (cookie: refreshToken) | `{ accessToken, user }` | Обновление access токена |
| POST | `/auth/logout` | — | `{ ok }` | Выход (очистка cookie) |
| POST | `/auth/password` | `{ currentPassword, newPassword }` | `{ ok, message }` | Смена пароля |

### Profile & Stats (требуют авторизации)

| Метод | Путь | Body | Ответ | Описание |
|-------|------|------|-------|----------|
| GET | `/me` | — | `{ user }` | Данные текущего пользователя |
| PUT | `/me/profile` | `{ displayName?, username?, email?, currentPassword? }` | `{ user }` | Обновление профиля |
| DELETE | `/me/account` | `{ currentPassword }` | `{ ok }` | Удаление аккаунта (CASCADE) |
| GET | `/me/stats` | — | `{ solvedTotal, byDifficulty, byTopic, lastSolved, streakDays, longestStreak, firstSolvedAt, totalAttempts, firstAttemptRate, solvedLast7, solvedLast30, calendarData }` | Полная статистика |
| POST | `/me/progress/solved` | `{ taskId, difficulty, topicId? }` | `{ ok }` | Отметить задачу решённой |

### Health

| Метод | Путь | Ответ | Описание |
|-------|------|-------|----------|
| GET | `/health` | `{ ok: true }` | Проверка работоспособности |

---

## 5. Первый запуск (локально)

### Предусловия
- Node.js 20+ установлен
- npm установлен

### Сервер

```bash
cd server
cp .env.example .env
npm install
npx prisma migrate deploy    # Применить миграции
npm run dev                  # Запуск на :3000
```

### Контент API (json-server)

```bash
cd front
npm run mock:server          # Запуск на :3001
# или: npx json-server --watch ../db.json --port 3001
```

### Фронтенд

```bash
cd front
cp .env.local.example .env.local
npm install
npm run dev                  # Запуск на :5173
```

Откройте `http://localhost:5173`, перейдите на `/account` и зарегистрируйтесь.

---

## 6. План деплоя (бесплатные хостинги)

### Рекомендуемый стек: $0

| Слой | Провайдер | Бесплатный лимит |
|------|-----------|------------------|
| **База данных** | [Neon](https://neon.tech) | 0.5 GB, serverless, scale-to-zero |
| **API сервер** | [Render](https://render.com) Web Service | 512 MB, 0.1 CPU, засыпает после простоя |
| **API сервер (альт.)** | [Fly.io](https://fly.io) | 3 shared VMs, 256 MB RAM |
| **Фронтенд** | [Cloudflare Pages](https://pages.cloudflare.com) / [Vercel](https://vercel.com) / [Netlify](https://netlify.com) | Безлимитные сборки, custom domain |
| **Контент** | json-server на том же Render/Fly | Или статический fallback на фронте |

### Шаги деплоя

#### 1. База данных — Neon

1. Создать аккаунт на Neon.tech
2. Создать новый проект → скопировать connection string
3. Установить в `server/.env`:
   ```
   DATABASE_URL="postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"
   ```
4. `npx prisma generate` и `npx prisma migrate deploy`

#### 2. API сервер — Render

1. Создать Web Service, подключить GitHub репозиторий
2. Build command: `cd server && npm install && npx prisma generate && npm run build`
3. Start command: `cd server && node dist/index.js`
4. Environment Variables:
   - `DATABASE_URL` — из Neon
   - `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` — сгенерированные секреты
   - `NODE_ENV=production`
   - `CORS_ORIGINS=https://your-domain.com`

#### 3. Фронтенд — Vercel/Cloudflare Pages

1. Подключить репозиторий
2. Build command: `cd front && npm install && vite build`
3. Output directory: `front/dist`
4. Environment Variables:
   - `VITE_API_URL=https://your-api.onrender.com`
   - `VITE_CONTENT_API_URL=` (пусто для статического контента)

#### 4. Миграции (после деплоя)

```bash
# Локально, указав production DATABASE_URL
cd server
DATABASE_URL="postgresql://..." npx prisma migrate deploy
```

### Переход с SQLite на PostgreSQL

В `server/prisma/schema.prisma` изменить:
```diff
- provider = "sqlite"
+ provider = "postgresql"
```

Затем `npx prisma generate` и `npx prisma migrate deploy`.

---

## 7. Логирование

Сервер использует **pino** + **pino-pretty** (dev) для структурированного логирования:

- **info** — все входящие запросы, завершение, auth события (login/register/logout)
- **warn** — неудачные попытки входа (user_not_found, wrong_password)
- **error** — внутренние ошибки сервера
- **debug** — детальный вывод (режим разработки)

Примеры auth логов:
```
auth:register      { userId: "xxx", username: "john" }
auth:login:ok      { userId: "xxx" }
auth:login:fail    { identifier: "...", reason: "wrong_password" }
auth:logout        { }
auth:password:changed { userId: "xxx" }
```

---

## 8. Статистика и дашборд

### KPI-карточки (6 шт.)

| Карточка | Данные | Цвет |
|----------|--------|------|
| 🔥 Серия дней | Текущий streak (дни подряд) | Оранжевый |
| 📊 Всего решено | Общее число решённых | Фиолетовый |
| ⚡ С первой попытки | % задач решённых с 1-й попытки | Зелёный |
| 📅 Дней активности | Дней с первого решения | Синий |
| 🏆 Самый длинный streak | Рекорд streak | Янтарный |
| 📈 За 7 дней | Решено за последнюю неделю | Розовый |

### Графики

| График | Библиотека | Данные |
|--------|-----------|--------|
| Calendar Heatmap | CSS Grid (кастомный) | 12 мес., задачи за каждый день |
| Donut по сложности | Recharts PieChart | Easy/Medium/Hard |
| Bar по темам | Recharts BarChart | Решено/Всего по каждой теме |
| AreaChart активность | Recharts AreaChart | Решения за 30 дней |

### События фронт → бэк

- `POST /me/progress/solved` — вызывается при успешном прохождении всех тестов задачи
- Только для авторизованных пользователей и при активном `VITE_API_URL`
- Без API — запуск кода работает, но прогресс не сохраняется

---

## 9. Обработка ошибок (фронтенд)

`apiFetch` бросает типизированные ошибки:

| Класс | Когда | Что делать |
|-------|-------|------------|
| `ApiNotConfiguredError` | `VITE_API_URL` не задан | Не показывать ЛК |
| `ApiAuthError` (401) | Токен истёк | Logout пользователя |
| `ApiServerError` (5xx) | Сервер недоступен | Показать «Сервер недоступен» |
| `ApiNetworkError` | Network недоступен | Показать «Проверьте соединение» |

---

## 10. Итог

- **PostgreSQL** — production-ready, бесплатные managed-инстансы (Neon)
- **JWT + refresh cookie** — надёжная auth-схема
- **FSD** — чёткая архитектура фронтенда
- **Без API** — контент доступен всем (статьи, задачи)
- **Почти бесплатно:** Neon + Render + Vercel/Cloudflare Pages
