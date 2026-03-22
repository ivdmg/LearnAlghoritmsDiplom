## Как устроены статьи и где они хранятся

- **Источник данных**: все учебные статьи хранятся в файле `db.json` в корне проекта (рядом с папкой `front`).
- **API (мок‑бекенд)** поднимается через `json-server`:
  - команда запуска из папки `front`:  
    ```bash
    npm run mock:server
    ```  
  - статьи доступны по адресу `http://localhost:3001/articles`.
- **Фронтенд**:
  - типы статьи описаны в `front/src/entities/article/model/types.ts`;
  - загрузка статьи происходит через хук `useArticleByTopic` (`front/src/entities/article/model/use-article-by-topic.ts`);
  - отрисовка контента — через `ContentRenderer` (`front/src/shared/ui/content/content-renderer.tsx`);
  - сайдбар, который показывает статью, — `TopicSidebar` (`front/src/widgets/topic-sidebar/ui/topic-sidebar.tsx`).

## Структура сущностей статьи

### Article

Определено в `front/src/entities/article/model/types.ts`:

- **Article**:
  - `id: string` — уникальный идентификатор статьи;
  - `topicId?: string` — id темы из `ROADMAP` (например, `osnovy`, `rekursiya`, `sortirovki`, ...);
  - `subtopicId?: string` — id подтемы (например, `st-osn-2`, `st-rek-1` и т.д.);
  - `title: string` — заголовок статьи;
  - `blocks: ContentBlock[]` — массив блоков контента.

### ContentBlock и типы блоков

Каждый блок имеет базовые поля (`BaseContentBlock`):

- `id: string` — уникальный id блока внутри статьи;
- `type: 'heading' | 'paragraph' | 'subheading' | 'link' | 'code' | 'animation'`;
- `style?: React.CSSProperties` — локальный override стилей (inline‑стили);
- `className?: string` — дополнительный CSS‑класс для точечной настройки.

Подтипы:

- **HeadingBlock** (`type: 'heading'`):
  - `level: 1 | 2 | 3 | 4` — уровень заголовка (`<h1>`–`<h4>`);
  - `text: string` — текст заголовка.
- **ParagraphBlock** (`type: 'paragraph'`):
  - `text: string` — обычный абзац `<p>`.
- **LinkBlock** (`type: 'link'`):
  - `text: string` — текст ссылки;
  - `href: string` — адрес (можно использовать якоря `#section-id`);
  - `target?: '_self' | '_blank'`.
- **CodeBlock** (`type: 'code'`):
  - `language: string` — язык для подсветки (`'js'`, `'ts'`, `'python'` и т.д.);
  - `code: string` — исходный код;
  - `editable?: boolean` — если `true`, показывается простая редакторская textarea; если `false` — статичный подсвеченный блок.
- **AnimationBlock** (`type: 'animation'`):
  - `html: string` — HTML‑фрагмент (вставляется в iframe);
  - `css?: string` — CSS‑код (добавляется в `<style>` внутри iframe);
  - `js?: string` — JS‑код (выполняется внутри iframe, можно анимировать DOM);
  - `width?: string | number` — ширина iframe (по умолчанию `'100%'`);
  - `height?: string | number` — высота iframe (по умолчанию `220`);
  - `vizLayout?: 'default' | 'tall'` — режим укладки внутри iframe (высокие схемы: стек, дерево рекурсии и т.п.); базовые классы и палитра — в `front/src/shared/ui/content/viz-animation-base.css`, подключаются автоматически в `ContentRenderer`.
- **Правила визуализаций** (единый стиль, без «консоли», компоновка): см. **`rulesVizualization.md`** в корне репозитория.

## Как отрисовываются блоки

### Компонент `ContentRenderer`

Файл: `front/src/shared/ui/content/content-renderer.tsx`.

- Принимает пропсы:
  - `blocks: ContentBlock[]`;
  - `className?: string`;
  - `style?: React.CSSProperties`.
- Для каждого блока по `type` выбирается соответствующий подкомпонент:
  - `heading` → `<Heading />` (`<h1>`–`<h4>` с id и стилями);
  - `paragraph` → `<p>`;
  - `link` → `<a>`;
  - `code` → блок с подсветкой через `prism-react-renderer` (тема `themes.nightOwl`);
  - `animation` → `<iframe>` с собранным `srcDoc` (HTML + CSS + JS).
- Локальные `style` и `className` из блока накладываются поверх базовых стилей CSS‑модуля `content-renderer.module.css`.

### Настройка внешнего вида блоков

Основные стили лежат в:

- `front/src/shared/ui/content/content-renderer.module.css`:
  - классы `h1`, `h2`, `h3`, `paragraph`, `link`, `codeBlock`, `codeEditor`, `animationFrame` и т.д.;
  - здесь задаются размеры шрифтов, отступы, цвета, эффекты glassmorphism для кода и анимаций.

Если нужно точечно изменить какой‑то конкретный блок в статье:

- в `db.json` у блока можно задать:
  - `style`: объект с inline‑CSS (например, `"style": { "color": "#f97316", "marginTop": "24px" }`);
  - `className`: имя CSS‑класса, который вы потом определите в соответствующем CSS‑модуле.

## Как статья подцепляется в сайдбаре

### Хук `useArticleByTopic`

Файл: `front/src/entities/article/model/use-article-by-topic.ts`.

Подпись:

```ts
useArticleByTopic(topicId?: string, subtopicId?: string);
```

- строит запрос к `json-server`:
  - `GET /articles?topicId={topicId}` — для статьи по теме;
  - `GET /articles?topicId={topicId}&subtopicId={subtopicId}` — для статьи по конкретной подтеме.
- возвращает `{ article, loading, error }`.

### Встраивание в `TopicSidebar`

Файл: `front/src/widgets/topic-sidebar/ui/topic-sidebar.tsx`.

Ключевые моменты:

- Хук вызывается безусловно:

```ts
const topicId = node?.topic.id;
const subtopicId = node?.type === 'subtopic' ? node.subtopic.id : undefined;
const { article, loading, error } = useArticleByTopic(topicId, subtopicId);
```

- Для **темы** (`node.type === 'topic'`) сейчас пример для `osnovy`:

```ts
const hasArticle = !articleLoading && !articleError && article && article.blocks.length > 0;

children: hasArticle && node.topic.id === 'osnovy'
  ? <ContentRenderer blocks={article.blocks} />
  : <TheoryContent content={theoryContent} />,
```

- Для **подтемы** (`node.type === 'subtopic'`) пример для `st-osn-2` («Массивы и строки»):

```ts
const hasArticle = !articleLoading && !articleError && article && article.blocks.length > 0;

children: hasArticle && subtopic.id === 'st-osn-2'
  ? <ContentRenderer blocks={article.blocks} />
  : <TheoryContent content={theoryContent} />,
```

> В дальнейшем можно обобщить условие и показывать `ContentRenderer` для любой темы/подтемы, у которой нашлась статья, без жёстких `id`.

## Как добавить статью для темы «Рекурсия»

Допустим, вы хотите, чтобы при клике на тему `rekursiya` во вкладке «Теория» отображалась статья.

### Шаг 1. Добавить статью в `db.json`

Откройте `db.json` в корне и добавьте в массив `articles` новый объект, например:

```json
{
  "id": "rekursiya-intro",
  "topicId": "rekursiya",
  "title": "Рекурсия: основные идеи и примеры",
  "blocks": [
    {
      "id": "h1",
      "type": "heading",
      "level": 1,
      "text": "Рекурсия"
    },
    {
      "id": "p1",
      "type": "paragraph",
      "text": "Рекурсия — это способ определения функции через саму себя. Главное — иметь базовый случай и шаг перехода."
    },
    {
      "id": "code1",
      "type": "code",
      "language": "js",
      "editable": false,
      "code": "function factorial(n) {\n  if (n === 0) return 1; // базовый случай\n  return n * factorial(n - 1); // рекурсивный шаг\n}"
    },
    {
      "id": "p2",
      "type": "paragraph",
      "text": "Важно следить за глубиной рекурсии и избегать бесконечной рекурсии. Часто рекурсивное решение можно переписать в итеративное."
    },
    {
      "id": "anim1",
      "type": "animation",
      "html": "<div id=\"rec-demo\"></div>",
      "css": "#rec-demo { padding: 16px; font-family: system-ui, sans-serif; }\n.step { margin-bottom: 4px; color: #e5e7eb; }\n.step span { color: #a5b4fc; }",
      "js": "const root = document.getElementById('rec-demo');\nconst n = 5;\nfor (let i = n; i >= 1; i--) {\n  const el = document.createElement('div');\n  el.className = 'step';\n  el.textContent = `factorial(${i}) вызывает factorial(${i - 1})`;\n  root.appendChild(el);\n}",
      "width": "100%",
      "height": 140
    }
  ]
}
```

Главное:

- `topicId` должен совпадать с id темы из `ROADMAP` (`rekursiya`).
- `subtopicId` можно не указывать, чтобы статья относилась ко **всей теме**, а не к конкретной подтеме.

### Шаг 2. Убедиться, что сервер запущен

Из папки `front`:

```bash
npm run mock:server
```

Проверьте, что статья доступна:  
`http://localhost:3001/articles?topicId=rekursiya`.

### Шаг 3. Подключить статью в `TopicSidebar`

В `front/src/widgets/topic-sidebar/ui/topic-sidebar.tsx` уже есть вызов `useArticleByTopic(topicId, subtopicId)`.  
Для темы `rekursiya` достаточно расширить условие для вкладки «Теория»:

```ts
const hasArticle = !articleLoading && !articleError && article && article.blocks.length > 0;

children:
  hasArticle && (node.topic.id === 'osnovy' || node.topic.id === 'rekursiya')
    ? <ContentRenderer blocks={article.blocks} />
    : <TheoryContent content={theoryContent} />,
```

После этого:

- при клике на ноду темы **«Рекурсия»** в roadmap;
- в сайдбаре, во вкладке **«Теория»**;
- будет подхвачена статья `rekursiya-intro` из `db.json` и отрисована через `ContentRenderer`.

## Как добавить статью для конкретной подтемы

Пример уже реализован для подтемы **«Массивы и строки»** (`st-osn-2`):

- в `db.json` у статьи есть:

```json
"topicId": "osnovy",
"subtopicId": "st-osn-2"
```

- в `TopicSidebar` для подтемы:

```ts
const subtopicId = node?.type === 'subtopic' ? node.subtopic.id : undefined;
const { article, loading, error } = useArticleByTopic(topicId, subtopicId);

const hasArticle = !loading && !error && article && article.blocks.length > 0;

children: hasArticle && subtopic.id === 'st-osn-2'
  ? <ContentRenderer blocks={article.blocks} />
  : <TheoryContent content={theoryContent} />,
```

Чтобы добавить статью для другой подтемы (например, `st-rek-1` «Базовые примеры»):

1. Добавьте объект статьи в `db.json` c `topicId: "rekursiya"` и `subtopicId: "st-rek-1"`.
2. В `TopicSidebar` обновите условие, например:

```ts
children: hasArticle
  ? <ContentRenderer blocks={article.blocks} />
  : <TheoryContent content={theoryContent} />,
```

(или добавьте проверку по `subtopic.id === 'st-rek-1'`, если хотите включать поэтапно).

Так вы получите полностью универсальный механизм: бэкенд присылает массив `blocks`, а фронтенд через `ContentRenderer` автоматически рисует заголовки, абзацы, ссылки, код с подсветкой и анимации, с возможностью тонкой настройки через `style` и `className`.

