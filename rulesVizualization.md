# Правила визуализации алгоритмов (статьи / сайдбар)

Документ описывает единый подход к анимациям в учебных статьях. Контент статей хранится в `db.json`; блоки с `"type": "animation"` рендерятся как **iframe** через `ContentRenderer`.

## Инфраструктура

1. **Базовые стили** подключаются автоматически: `front/src/shared/ui/content/viz-animation-base.css` (через `VIZ_ANIMATION_BASE_CSS` в `content-renderer.tsx`).
2. **Рантайм iframe** (пауза и скорость): `front/src/shared/ui/content/viz-iframe-runtime.ts` — выполняется **до** хелперов и пользовательского `js`, патчит `setTimeout` / `setInterval`. Родитель шлёт в iframe сообщения:
   - `{ __learnAlgoViz: 1, cmd: 'speed', value: 0.25 | 0.5 | 1 | 1.5 | 2 }`
   - `{ __learnAlgoViz: 1, cmd: 'pause' }` / `{ cmd: 'resume' }`
3. **Хелперы для столбчатых диаграмм**: `front/src/shared/ui/content/viz-iframe-helpers.ts` → `VIZ_IFRAME_HELPERS_JS` подключается **после** рантайма, **до** `block.js`. В iframe доступен `window.VizBars`: `render`, `refresh`, `setState`, `clearStates`, `swap` / `swapSlide`, `maxOf`, **`heightPxForValue`** — высота столбца **линейно от значения** (базово `value * 10px`, параметр `opts.pxPerUnit`), с масштабом так, чтобы максимум по массиву помещался в область диаграммы. Для массивов чисел — контейнер `.viz-chart`.
4. **Разметка iframe** всегда оборачивается в:
   - `.viz-viewport` — внешний контейнер: **центрирование**, `overflow: hidden`, без скролла.
   - `.viz-stage` — внутренняя сцена: **максимум площади**, `flex`, укладка контента.
5. **Вертикально «высокие» схемы** (стек, глубокая рекурсия, колонка этапов): `"vizLayout": "tall"` — компактнее ячейки стека (`clamp` в базе), контент должен **умещаться**; при нехватке места увеличить `"height"` блока в `db.json`.
6. **Тулбар** над iframe: перезапуск ⟲, пауза ⏸, продолжить ▶, кнопки скорости **0.25× … 2×** (`GlassButton` с `variant="toolbar"`). Скрыть: `"showPlayButton": false`.

## Визуальный язык (4 цвета)

Палитра только **голубой, оранжевый, зелёный, красный** (переменные и классы в `viz-animation-base.css`):

| Смысл | Класс | Цвет |
|--------|--------|------|
| Нейтральная ячейка (кадр в стеке, хеш-бакет, DP-ячейка) | `.viz-cell` | голубой |
| Нейтральный столбец массива (число как высота) | `.viz-bar-fill` внутри `.viz-chart` | голубой |
| Текущий шаг, фокус, проверяемый индекс, вершина стека | `.viz-cell--active` / `.viz-bar-fill--active` | янтарь |
| Явное «сравниваем с этим» | `.viz-cell--compare` / `.viz-bar-fill--compare` | янтарь |
| База рекурсии, успех, «да», найдено, заполнено в DP | `.viz-cell--success` / `.viz-bar-fill--success` | зелёный |
| «Нет», не найдено, отрицательный исход сравнения | `.viz-cell--fail` / `.viz-bar-fill--fail` | красный |

- **Не вводить** произвольные hex в `css` блока статьи — расширять базу при необходимости.
- У групп **`box-shadow: none`** (без «внутренних» теней); градиенты — из переменных `--viz-blue-*`, `--viz-amber-*`, `--viz-green-*`, `--viz-red-*` (см. `.viz-bar-fill`, `.viz-cell`, `.viz-group`).

## Оформление вне iframe

У блока `.animationFrame` **не использовать** `backdrop-filter` на самом iframe — иначе у содержимого визуально появляется «внутренняя» тень/ореол.

## Что показываем (и что нет)

- **Нет «консоли»**: не имитировать терминал, списки логов, прокручиваемые `logLine` и т.п.
- **Да** визуальные состояния структуры данных: массив, стек, очередь, таблица DP, этапы divide-and-conquer.
- **Да** короткие подписи: `.viz-hint`, `.viz-badge`, `.viz-caption`.
- **Псевдокод** — в блоках `code` статьи, не дублировать длинным текстом внутри iframe.

## Компоновка

- **Массив чисел**: `.viz-chart` + `VizBars.render` — **число над столбцом** (`.viz-bar-val-outer`), **прямоугольник** только цвет/высота, **индекс** под осью. Высота в px от значения: `heightPxForValue` (масштаб под контейнер; кэш `dataset.vizMaxBarPx` на `.viz-chart` стабилизирует высоту). Обмен соседей: **`swapSlide`**. Произвольные индексы (quicksort): **`swapValues`**. Зоны половин (merge): **`clearZones`**, **`setZone`** + классы `viz-bar-col--zone-a` / `zone-b`. Блок только с диаграммой: обёртка **`viz-col--viz-only`** без caption/hint.
- Ряды: `.viz-row` + ячейки или `.viz-chart`.
- Очередь (горизонтально): `.viz-row.viz-row--queue` + `.viz-cell` — фиксированная ширина ячеек, **enqueue**: классы `viz-cell--enter-right` → после кадра `viz-cell--shown`; **dequeue**: `viz-cell--exit-left` и удаление после `transition`.
- Стек: `.viz-stack-v` + `.viz-cell`; **push**: `viz-cell--enter-right` → `viz-cell--shown`; **pop**: `viz-cell--exit-up`.
- Две зоны: `.viz-split` + `.viz-panel`.
- Группы (этапы merge / D&C): `.viz-group` + внутри одна `.viz-chart` на подмассив.
- Демо роста n (сложность): `.viz-bars` + `.viz-bar` или одна `.viz-chart` с искусственными высотами.
- Сетка DP: `.viz-grid` + `.viz-cell`.

## Анимация и укладка

- **Без скролла** внутри iframe: `html, body { overflow: hidden }` в базе.
- Если не влезает: увеличить `height`, `vizLayout: tall`, уменьшить число элементов или шагов.
- Тайминги **300–600 ms** на шаг; перезапуск — новый iframe (⟲).

## Соответствие блока в `db.json`

```json
{
  "id": "anim-example",
  "type": "animation",
  "html": "<div class=\"viz-col\">...</div>",
  "css": "",
  "js": "(function(){ ... })();",
  "width": "100%",
  "height": 320,
  "vizLayout": "default",
  "showPlayButton": true
}
```

---

Файлы: `db.json`, `viz-animation-base.css`, `viz-iframe-runtime.ts`, `viz-iframe-helpers.ts`, `content-renderer.tsx`, `content-renderer.module.css`.
