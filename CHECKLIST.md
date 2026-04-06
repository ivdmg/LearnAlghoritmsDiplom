# AlgoLearn — Полный чеклист задач

> **Контекст проекта:** Сервис для изучения алгоритмов и структур данных.
>
> **Стек фронтенда:** React 19 + TypeScript + Vite 7, FSD (Feature-Sliced Design), Redux Toolkit, React Router 7, Ant Design 6, Recharts 3.8, Pyodide (Python в браузере), React Flow, framer-motion, CodeMirror.
>
> **Стек бэкенда:** Node.js 20+ + Fastify 5 + Prisma 6 + SQLite (dev), JWT access (15 мин) + opaque refresh cookie (14 дней), bcrypt 2.4.3, rate-limit 300 req/мин.
>
> **Контент:** `db.json` → json-server :3001 (статьи + задачи). Vite proxy `/content-api` → `localhost:3001`.
>
> **Порты:** Front :5173, API (auth/stats) :3000, Content (json-server) :3001.
>
> **Без `VITE_API_URL`** — приложение работает без ЛК (статьи/задачи доступны всем).
>
> **Целевая нагрузка:** 50–100 одновременных пользователей (позже деплой на бесплатные хостинги).

---

## ГРУППА 1 — Бэкенд: БД, Prisma, Архитектура

### 1.1 Ревизия Prisma схемы
- **Файлы:** `server/prisma/schema.prisma`, `server/prisma/migrations/`
- **Что сейчас:** Модели `User` (id, email unique, passwordHash, displayName), `UserTaskProgress` (userId+taskId unique, difficulty, solvedAt, attemptsCount), `RefreshSession` (userId, tokenHash unique, expiresAt). SQLite.
- **Проблемы:**
  - `User`: нет поля `login`/`username` (требуется для полноценной регистрации)
  - `UserTaskProgress`: нет поля `firstSolvedAt`, нет поля для подсчёта попыток _до_ решения
  - SQLite не подходит для продакшена (нужен PostgreSQL для бесплатного деплоя — Neon/Supabase/Railway)
  - Нет таблицы `UserLoginHistory` / `UserSettings` (для расширения)
- **Задача:** Добавить `username` (unique, 3–24 символа), `firstSolvedAt` в юзер-прогресс или в `User` как отдельное поле. Добавить `updatedAt` в `UserTaskProgress`. Рассмотреть enum для `difficulty` (Easy/Medium/Hard).

### 1.2 Миграция на PostgreSQL (подготовка к деплою)
- **Файлы:** `server/prisma/schema.prisma`, `server/.env`, `server/.env.example`
- **Задача:** Изменить `provider = "sqlite"` → `provider = "postgresql"`. В `.env.example` показать оба варианта. Локально пока оставить SQLite (комментарий в файле).
- **Контекст:** Для бесплатного продакшена — Neon.tech / Supabase. При нагрузке 50–100 чел PostgreSQL обязателен.

### 1.3 Серверная валидация — продвинутая
- **Файлы:** `server/src/lib/validate.ts`
- **Что сейчас:** `validateEmail` (regex), `validatePassword` (8-128 символов).
- **Задача:** Добавить:
  - `validateUsername`: проверка 3–24 символов, только `a-zA-Z0-9_`, без дублей (через БД при регистрации)
  - Усиление пароля: хотя бы 1 буква + 1 цифра (рекомендация)
  - Проверка на утечку email (опционально, для будущего)

### 1.4 Бэкенд: защита от дублей
- **Файлы:** `server/src/routes/auth-routes.ts`, `server/src/lib/validate.ts`
- **Задача:** При регистрации проверить уникальность `username` И `email`. При регистрации ловить `P2002` Prisma (unique constraint violation) и возвращать понятное сообщение.

### 1.5 Сервер: корректные HTTP статусы
- **Файлы:** `server/src/routes/auth-routes.ts`, `server/src/routes/me-routes.ts`
- **Задача:** Убедиться, что:
  - 401 — неавторизован
  - 409 — конфликт (дубль email/username)
  - 422 — валидация
  - 500 — ошибка сервера (с логированием, без деталей)

---

## ГРУППА 2 — Регистрация / Авторизация / Профиль

### 2.1 Форма регистрации — три поля
- **Файл:** `front/src/pages/account/account-page.tsx`
- **Текущее состояние:** 2 поля — email + password + опциональный displayName (только в регистрации)
- **Задача:** Добавить поле `username` (логин):
  - 3–24 символа, `[a-zA-Z0-9_]` (без кириллицы, пробелов, спецсимволов)
  - Живая валидация на фронтенде (onBlur /实时 regex)
  - Показ ошибок валидации под полем
  - Username отправляется при `register({ email, password, username })`

### 2.2 Форма входа — email или username
- **Файл:** `front/src/pages/account/account-page.tsx`
- **Задача:** Позволить логиниться по email ИЛИ username. На бэкенде `POST /auth/login` принимает поле `identifier`, сервер определяет: если содержит `@` — ищем по email, иначе — по username.

### 2.3 Страница профиля — расширенная
- **Файл:** `front/src/pages/account/account-page.tsx`
- **Текущее состояние:** Профиль показывает email, displayName (если есть). Смена пароля.
- **Задача:**
  - Показать username, email, displayName
  - Редактирование: `displayName` (с валидацией ≤ 50 символов)
  - Смена email (с подтверждением текущего пароля)
  - Смена username (с подтверждением текущего пароля, проверка уникальности)
  - Смена пароля (текущее + новый + подтверждение нового)
  - Кнопка «Удалить аккаунт» (с подтверждением, CASCADE в БД)

### 2.4 Redux — обновление thunks
- **Файл:** `front/src/shared/store/slices/auth-slice.ts`
- **Задача:**
  - Добавить thunk `updateProfile({ displayName?, username?, email? })` → `PUT /me/profile`
  - Обновить `login` и `register` — поддержка `identifier` / `username` в payload
  - Обновить `AuthUser` type: добавить `username`

### 2.5 Бэкенд — новые эндпоинты профиля
- **Файлы:** `server/src/routes/me-routes.ts`
- **Задача:**
  - `PUT /me/profile` — обновление displayName, username, email (auth required)
    - Проверка уникальности username/email
    - Обновление требует ввода текущего пароля для безопасности (кроме displayName)
  - `GET /me` — уже возвращает базовый профиль, добавить `username`

### 2.6 Бэкенд — адаптация login (identifier)
- **Файл:** `server/src/routes/auth-routes.ts`
- **Задача:** `POST /auth/login` принимает `{ identifier: string, password: string }`. Если `identifier` содержит `@` — поиск по email, иначе — по username.

### 2.7 Бэкенд — адаптация register (username required)
- **Файл:** `server/src/routes/auth-routes.ts`
- **Задача:** `POST /auth/register` принимает `{ email, password, username, displayName? }`. Username обязателен, валидируется, unique constraint.

---

## ГРУППА 3 — Статистика пользователя (Бэкенд)

### 3.1 Эндпоинт статистики — расширенные данные
- **Файл:** `server/src/routes/me-routes.ts`
- **Текущие данные:** `solvedTotal`, `byDifficulty` (easy/medium/hard count), `lastSolved` (recent 12), `streakDays`, `firstSolvedAt`.
- **Задача добавить:**
  - `totalAttempts` — общее количество попыток (сумма attemptsCount)
  - `successRate` — процент задач, решённых с первой попытки (attemptsCount <= 1)
  - `byTopic` — разбивка решённых по темам (topicId → count)
  - `solveTimeByDifficulty` — среднее время решения по сложности (в будущем, если будем логировать время на странице задачи)
  - `longestStreak` — самая длинная серия дней
  - `weeklyActivity` — решено за последние 7 дней
  - `monthlyActivity` — решено за последние 30 дней
  - `calendarData` — массив `{ date, count }` за последние 12 месяцев (для heatmap-календаря)

### 3.2 Функция вычисления longestStreak
- **Файл:** `server/src/routes/me-routes.ts`
- **Задача:** Аналог `computeStreak()`, но считать максимальную непрерывную серию за всё время (не только текущую).

### 3.3 Функция calendarData
- **Файл:** `server/src/routes/me-routes.ts`
- **Задача:** Сгенерировать массив `[ { date: "YYYY-MM-DD", count: N }, ... ]` за последние 12 месяцев. Для дней без решений — `count: 0`.

### 3.4 Функция byTopic
- **Файл:** `server/src/routes/me-routes.ts`
- **Задача:** Вернуть `{ [topicId]: number }` или `[{ topicId, topicTitle, solved, total }]`. Потребуется маппинг taskId → topicId (передавать с фронта или хранить на сервере).

> **Решение:** При `POST /me/progress/solved` фронт уже шлёт `taskId, difficulty`. Сервер по `taskId` находит в `db.json` topicId (или фронт шлёт его). Лучше — фронт шлёт `{ taskId, topicId, difficulty }`.

---

## ГРУППА 4 — Фронтенд: Account Page (переработка)

### 4.1 Разделение экрана Account на две зоны
- **Файл:** `front/src/pages/account/account-page.tsx`, `front/src/pages/account/account-page.module.css`
- **Задача:**
  - Если НЕ залогинен: форма входа/регистрации (как сейчас, но с username)
  - Если залогинен: левая колонка — карточки профиля и настроек, правая колонка — дашборд статистики
  - Либо вертикальный layout: сверху профиль/настройки, снизу — большие графики

### 4.2 Карточка профиля
- **Файл:** `front/src/pages/account/account-page.tsx`
- **Задача:**
  - Avatar (инициалы или emoji-заглушка)
  - Username (жирным), email (мелким)
  - Серия дней (streak) — бейдж с огоньком 🔥
  - Кнопка «Редактировать профиль» → раскрывает форму

### 4.3 Карточка настроек аккаунта
- **Задача:**
  - Изменить username (с проверкой на уникальность, требует текущий пароль)
  - Изменить email (требует текущий пароль)
  - Изменить пароль (текущий + новый + подтверждение)
  - Кнопка «Удалить аккаунт» (модальное подтверждение, требует ввести "DELETE")

### 4.4 Валидация форм
- **Файл:** `front/src/pages/account/account-page.tsx`
- **Задача:**
  - Все поля валидируются в реальном времени
  - Ошибки подсвечиваются красным под полями
  - Пустая кнопка submit при наличии ошибок
  - Глобальная ошибка — сверху формы (с сервера)
  - Успех — зелёное сообщение (автоочистка через 5 сек)

---

## ГРУППА 5 — Дашборд статистики (Recharts)

### 5.1 Календарь-heatmap активности
- **Библиотека:** Recharts (или react-calendar-heatmap)
- **Файл:** `front/src/pages/account/account-page.tsx` (или отдельный компонент)
- **Задача:**
  - Отобразить heatmap за последние 12 месяцев (стиль GitHub contributions)
  - Цвета: серый (0) → светло-жёлтый (1-2) → жёлтый (3-5) → тёмно-жёлтый/зелёный (6+)
  - Tooltip при наведении с `N задач на YYYY-MM-DD`
  - Легенда внизу

> **Рекомендация:** Recharts не имеет встроенного heatmap. Варианты:
> 1. `react-calendar-heatmap` — специализированная либа (легко, красиво)
> 2. Recharts `ScatterChart` — можно имитировать (гибко, но сложно)
> 3. Кастомный грид на CSS Grid — полный контроль
> **Решение:** Кастомный CSS Grid heatmap — полный контроль стилей, тем, анимаций.

### 5.2 Круговая диаграмма по сложности
- **Библиотека:** Recharts (`PieChart`)
- **Задача:**
  - Donut-чурт (innerRadius > 0)
  - Easy: зелёный, Medium: жёлтый, Hard: красный
  - В центре — общее число решённых
  - Справа/снизу — легенда с процентами

### 5.3 Столбчатая диаграмма по темам
- **Библиотека:** Recharts (`BarChart`)
- **Задача:**
  - Горизонтальный BarChart
  - Каждая тема (topicTitle) — столбец
  - Цвет зависит от % решённых (красный <25%, жёлтый 25-75%, зелёный >75%)
  - Показывать `X / Y задач`

### 5.4 Line chart активности по дням
- **Библиотека:** Recharts (`LineChart`) или `AreaChart`
- **Задача:**
  - Линейный график за последние 30 дней
  - Ось X — даты, Ось Y — количество решённых задач
  - Area fill под линией (gradient)
  - Пиковые значения с точками

### 5.5 Метрики-карточки (KPI)
- **Задача:** Ряд из 4-6 карточек сверху дашборда:
  - 🔥 Текущая серия (streak)
  - 📊 Всего решено
  - ⚡ Процент успеха с первой попытки
  - 📅 Дней с первым решением
  - 🏆 Самый длинный streak
  - 📈 Решено за последние 7 дней

### 5.6 Дашборд-виджет на TasksPage
- **Файл:** `front/src/widgets/tasks-stats-snippet/ui/tasks-stats-snippet.tsx`
- **Что сейчас:** PieChart + summary + кнопка «Подробная статистика»
- **Задача:**
  - Оставить компактный вид (уже работает)
  - Добавить KPI: решено из общего, streak
  - Mini donut-чарта по сложности (как сейчас)
  - Кнопка «Подробная статистика» → `/account`
  - Если не залогинен — приглашение войти
  - Если API не подключён — сообщение об этом

---

## ГРУППА 6 — Доступность контента без регистрации

### 6.1 Проверка: статьи доступны всем
- **Файлы:** `front/src/entities/article/model/use-article-by-topic.ts`, `front/src/widgets/topic-sidebar/ui/topic-sidebar.tsx`
- **Текущее состояние:** Используют `getContentApiBaseUrl()`. Если API не настроен — fallback на встроенные `THEORIES`. Если настроен — запрос к json-server.
- **Статус:** ✅ Работает корректно. Не требует изменений.

### 6.2 Проверка: задачи доступны всем
- **Файлы:** `front/src/entities/task/model/use-task-by-id.ts`, `front/src/entities/task/model/use-tasks-by-topic.ts`
- **Текущее состояние:** Fallback на `TASKS` из bundle если API не настроен или ошибка.
- **Статус:** ✅ Работает корректно.

### 6.3 Проверка: запуск задач только для авторизованных
- **Файл:** `front/src/pages/task/index.tsx`
- **Текущее состояние:** Если `apiOn && !accessToken` — блокируется кнопка «Run», показывается предупреждение.
- **Статус:** ✅ Работает корректно, но проверить визуально и протестировать.

---

## ГРУППА 7 — Прочие улучшения

### 7.1 Бэкенд: DELETE /me/account
- **Файл:** `server/src/routes/me-routes.ts`
- **Задача:** Эндпоинт удаления аккаунта. Требует auth + подтверждение (передаётся в body). Prisma CASCADE удалит прогресс и сессии.

### 7.2 Бэкенд: логирование
- **Файл:** `server/src/index.ts`
- **Задача:** Добавить pino-logger (установлен как dev dep через fastify), логировать:
  - Все запросы (level: info)
  - Ошибки (level: error)
  - Auth события (login success/fail, register)

### 7.3 Бэкенд: CORS настройка
- **Файл:** `server/src/index.ts`
- **Текущее состояние:** CORS с `credentials: true` и `origin` из env.
- **Задача:** Убедиться что `origin` принимает несколько значений (для dev + preview).

### 7.4 Фронтенд: удалить неиспользуемые файлы
- **Задачи:** Проверить что `front/src/pages/auth/`, `front/src/pages/profile/` удалены (удалены при merge). Проверить орфанные импорты.

### 7.5 FSD: проверка структуры
- **Задача:** Убедиться, что все слои FSD корректны:
  - `app` → только провайдеры, роутер, конфиг
  - `pages` → только страницы (импортируют из widgets/entities/features)
  - `widgets` → композитные блоки (импортируют из entities/features/shared)
  - `entities` → доменные модели (импортируют из shared)
  - `features` → пользовательские действия (импортируют из entities/shared)
  - `shared` → переиспользуемый код (никогда не импортирует из вышестоящих слоёв)

### 7.6 Обработка ошибок на фронте
- **Файлы:** `front/src/shared/api/api-client.ts`
- **Задача:** Central error handling. При 401 — автоматический logout. При 500 — показать «Сервер недоступен». При network error — «Проверьте соединение».

---

## ГРУППА 8 — Тестирование (Manual QA)

### 8.1 Регистрация
- [ ] Регистрация с валидным email + username + password
- [ ] Регистрация с существующим email → ошибка
- [ ] Регистрация с существующим username → ошибка
- [ ] Регистрация со слабым паролем (< 8) → ошибка
- [ ] Регистрация с невалидным email → ошибка
- [ ] Регистрация с невалидным username (спецсимволы, < 3 символов) → ошибка

### 8.2 Вход
- [ ] Вход по email + пароль → успех
- [ ] Вход по username + пароль → успех
- [ ] Неправильный пароль → ошибка
- [ ] Невалидный email → ошибка
- [ ] После входа — редирект на профиль, отображение данных

### 8.3 Авторизация-зависимые функции
- [ ] Run задачи без авторизации (с включённым API) → блокировка
- [ ] Run задачи с авторизацией → запуск + сохранение прогресса
- [ ] Решение задачи → прогресс отобразился в статистике
- [ ] Refresh токена → работает после перезагрузки страницы

### 8.4 Контент без авторизации
- [ ] Открыть roadmap → статьи показываются (через json-server или fallback)
- [ ] Открыть /tasks → список задач виден
- [ ] Открыть /task/:id → задача видна, условие/тесты видны

### 8.5 Статистика
- [ ] Pie chart на TasksPage показывает корректные данные
- [ ] Account page дашборд загружается
- [ ] Heatmap активности показывает данные после нескольких решений
- [ ] Bar chart по темам корректен
- [ ] Line chart активности за 30 дней
- [ ] KPI карточки с корректными числами

### 8.6 Профиль настройки
- [ ] Смена displayName → успех
- [ ] Смена username → проверка уникальности
- [ ] Смена email → проверка уникальности
- [ ] Смена пароля → вход с новым паролем
- [ ] Удаление аккаунта → данные удалены

---

## ГРУППА 9 — Документация

### 9.1 Обновить docs/COMMERCIAL_STACK_AUTH_AND_DEPLOY.md
- Добавить секцию с архитектурой
- Описать env vars для фронта и сервера
- Описать API endpoints (OpenAPI/Swagger формат или таблица)
- Добавить инструкция по первому запуску
- Добавить секцию с планом деплоя (Neon + Render/Railway + Vercel)

### 9.2 Обновить `.env.local.example` (front)
- Показать `VITE_API_URL`
- Показать `VITE_CONTENT_API_URL` (закомментирован)
- Добавить комментарии

### 9.3 Обновить `.env.example` (server)
- Показать `DATABASE_URL` для PostgreSQL
- Показать все JWT секреты
- Добавить `NODE_ENV`

---

## ПРИОРИТЕТЫ ВЫПОЛНЕНИЯ

```
Фаза 1 (КРИТИЧНО):
  1.1 → 1.5       — Бэкенд: БД, валидация, username, unique constraints
  2.1, 2.4, 2.5, 2.6, 2.7 — Авторизация: register + login с username
  6.1 → 6.3       — Проверка доступности контента

Фаза 2 (ДАШБОРД):
  3.1 → 3.4       — Бэкенд: расширенная статистика
  4.1 → 4.4       — Фронтенд: переработка Account Page
  5.1 → 5.6       — Recharts дашборд (heatmap, pie, bar, line, KPI)
  6.4             — TasksPage виджет

Фаза 3 (ПОЛИРОВКА):
  2.2             — Login по username/email
  2.3             — Расширенный профиль с редактированием
  7.1 → 7.6       — Удаление аккаунта, логирование, CORS, FSD, error handling
  8.1 → 8.6       — Тестирование всего
  9.1 → 9.3       — Документация
```

---

> **Формат использования:** Копируйте задачу из чеклиста по одному или группами и вставляйте в чат. Каждая задача содержит контекст, файлы и что нужно сделать.
