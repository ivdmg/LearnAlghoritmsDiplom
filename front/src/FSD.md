# Feature-Sliced Design (FSD) — структура проекта

Импорты только через **публичный API** слоя (например `@/entities/roadmap`, `@/features/run-python`).  
Внутри слоя — по своей структуре; снаружи — только через `index.ts`.

## Слои (сверху вниз)

| Слой       | Путь        | Назначение |
|-----------|-------------|------------|
| **app**   | `src/app/`  | Инициализация приложения: провайдеры, роутер, глобальные стили. |
| **pages** | `src/pages/`| Страницы-композиции: собирают виджеты и фичи, минимум логики. |
| **widgets** | `src/widgets/` | Крупные блоки UI: AppHeader, Roadmap, TopicSidebar, ThemeToggle. |
| **features** | `src/features/` | Поведение и фичи: run-python (Pyodide). |
| **entities** | `src/entities/` | Доменные сущности и данные: roadmap (темы/подтемы), task (задачи, теории). |
| **shared** | `src/shared/` | Переиспользуемое: store, lib (hooks), config (реэкспорт entities). |

## Правила импортов

- **pages** → widgets, features, entities, shared  
- **widgets** → features, entities, shared  
- **features** → entities, shared  
- **entities** → shared (и другие entities при необходимости)  
- **shared** — без импортов из app/pages/widgets/features/entities  

## Публичные API

- `@/app` — точка входа приложения  
- `@/entities/roadmap` — ROADMAP, типы RoadmapTopic, RoadmapSubtopic, RoadmapNode  
- `@/entities/task` — TASKS, THEORIES, getOrderedTaskIds, ROADMAP_TOPICS, Task  
- `@/features/run-python` — usePyodide  
- `@/widgets/app-header` — AppHeader  
- `@/shared/store` — store, RootState, AppDispatch  
- `@/shared/lib` — useAppSelector, useAppDispatch  
- `@/shared/config` — реэкспорт из entities (предпочтительно импорт из `@/entities/*`)  
