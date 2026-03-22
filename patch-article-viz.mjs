/**
 * Одноразовый патч: обновляет блоки animation для тем osnovy и rekursiya в db.json
 * Запуск: node patch-article-viz.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, 'db.json');

const patches = {
  'anim-array': {
    html: '<div class="viz-col"><div class="viz-caption">Массив: значение и индекс</div><div class="viz-row" id="viz-array"></div></div>',
    css: '',
    js: "(function(){var root=document.getElementById('viz-array');var values=[4,8,1,7,3,9];values.forEach(function(v,i){var el=document.createElement('div');el.className='viz-cell';el.innerHTML='<span class=\"viz-cell__main\">'+v+'</span><span class=\"viz-cell__sub\">i = '+i+'</span>';root.appendChild(el);});})();",
    width: '100%',
    height: 220,
    showPlayButton: true,
    vizLayout: 'default',
  },
  anim2: {
    html: '<div class="viz-col"><div class="viz-caption">Линейный проход</div><div class="viz-hint" id="viz-loop-hint"></div><div class="viz-row" id="viz-loop"></div></div>',
    css: '',
    js: "(function(){var root=document.getElementById('viz-loop');var hint=document.getElementById('viz-loop-hint');var values=[3,5,7,2,6];var nodes=[];values.forEach(function(v){var el=document.createElement('div');el.className='viz-cell';el.innerHTML='<span class=\"viz-cell__main\">'+v+'</span>';root.appendChild(el);nodes.push(el);});var i=0;function tick(){nodes.forEach(function(n){n.classList.remove('viz-cell--active');});nodes[i].classList.add('viz-cell--active');hint.textContent='Шаг '+(i+1)+' / '+values.length+' — смотрим элемент '+values[i];i=(i+1)%values.length;}tick();setInterval(tick,850);})();",
    width: '100%',
    height: 240,
    showPlayButton: true,
    vizLayout: 'default',
  },
  'anim-time': {
    html: '<div class="viz-col"><div class="viz-caption">Операций всё больше при росте n</div><div class="viz-bars" id="viz-bars"></div><div class="viz-hint" id="viz-bar-hint"></div></div>',
    css: '',
    js: "(function(){var root=document.getElementById('viz-bars');var hint=document.getElementById('viz-bar-hint');var n=12;for(var i=1;i<=n;i++){var el=document.createElement('div');el.className='viz-bar';el.style.height=(12+i*6)+'px';el.style.opacity=String(0.35+i/(n+3));root.appendChild(el);}hint.textContent='Каждый столбец — больший n, выше «стоимость» шагов';})();",
    width: '100%',
    height: 220,
    showPlayButton: true,
    vizLayout: 'default',
  },
  'anim-memory': {
    html: '<div class="viz-col"><div class="viz-caption">Подряд в памяти</div><div class="viz-row" id="viz-mem"></div></div>',
    css: '',
    js: "(function(){var root=document.getElementById('viz-mem');var values=[10,14,7,3,8,21];values.forEach(function(v,i){var el=document.createElement('div');el.className='viz-cell';el.innerHTML='<span class=\"viz-cell__main\">'+v+'</span><span class=\"viz-cell__sub\">i = '+i+'</span>';root.appendChild(el);});})();",
    width: '100%',
    height: 220,
    showPlayButton: true,
    vizLayout: 'default',
  },
  'anim-iteration': {
    html: '<div class="viz-col"><div class="viz-caption">Суммирование по элементам</div><div class="viz-hint" id="viz-sum-hint"></div><div class="viz-row" id="viz-sum-row"></div><div class="viz-badge" id="viz-sum-total">Σ = 0</div></div>',
    css: '',
    js: "(function(){var row=document.getElementById('viz-sum-row');var hint=document.getElementById('viz-sum-hint');var totalEl=document.getElementById('viz-sum-total');var values=[4,7,1,9,3];var nodes=[];var acc=0;values.forEach(function(v){var el=document.createElement('div');el.className='viz-cell';el.innerHTML='<span class=\"viz-cell__main\">'+v+'</span>';row.appendChild(el);nodes.push(el);});var i=0;function step(){nodes.forEach(function(n){n.classList.remove('viz-cell--active');});nodes[i].classList.add('viz-cell--active');acc+=values[i];totalEl.textContent='Σ = '+acc;hint.textContent='Добавляем arr['+i+'] = '+values[i];i=(i+1)%values.length;if(i===0)acc=0;}step();setInterval(step,900);})();",
    width: '100%',
    height: 260,
    showPlayButton: true,
    vizLayout: 'default',
  },
  'anim-search': {
    html: '<div class="viz-col"><div class="viz-caption">Линейный поиск</div><div class="viz-hint" id="viz-find-hint"></div><div class="viz-row" id="viz-find"></div><div class="viz-badge" id="viz-find-badge">ищем: 9</div></div>',
    css: '',
    js: "(function(){var arr=[3,7,1,9,5];var target=9;var root=document.getElementById('viz-find');var hint=document.getElementById('viz-find-hint');var nodes=[];arr.forEach(function(v){var el=document.createElement('div');el.className='viz-cell';el.innerHTML='<span class=\"viz-cell__main\">'+v+'</span>';root.appendChild(el);nodes.push(el);});var i=0;var timer=setInterval(function(){if(i>=arr.length){clearInterval(timer);hint.textContent='Не найдено';return;}nodes.forEach(function(n){n.classList.remove('viz-cell--active','viz-cell--compare','viz-cell--success');});nodes[i].classList.add('viz-cell--compare');hint.textContent='Сравниваем с индексом '+i;if(arr[i]===target){nodes[i].classList.remove('viz-cell--compare');nodes[i].classList.add('viz-cell--success');hint.textContent='Найдено на позиции '+i;clearInterval(timer);return;}i++;},750);})();",
    width: '100%',
    height: 240,
    showPlayButton: true,
    vizLayout: 'default',
  },
  'anim-insert': {
    html: '<div class="viz-col"><div class="viz-caption">Вставка в середину</div><div class="viz-hint" id="viz-ins-hint"></div><div class="viz-row" id="viz-ins"></div></div>',
    css: '',
    js: "(function(){var root=document.getElementById('viz-ins');var hint=document.getElementById('viz-ins-hint');var arr=[1,2,4,5];function render(){root.innerHTML='';arr.forEach(function(v,idx){var el=document.createElement('div');el.className='viz-cell';el.innerHTML='<span class=\"viz-cell__main\">'+v+'</span><span class=\"viz-cell__sub\">'+idx+'</span>';root.appendChild(el);});}render();hint.textContent='До вставки 3 на позицию 2';setTimeout(function(){arr.splice(2,0,3);render();hint.textContent='После вставки: элементы сдвинулись вправо';var cells=root.querySelectorAll('.viz-cell');if(cells[2]){cells[2].classList.add('viz-cell--success');}},1400);})();",
    width: '100%',
    height: 240,
    showPlayButton: true,
    vizLayout: 'default',
  },
  'anim-hash': {
    html: '<div class="viz-col"><div class="viz-caption">Ключ → индекс (учебная функция)</div><div class="viz-hint" id="viz-hash-hint"></div><div class="viz-row" id="viz-hash"></div></div>',
    css: '',
    js: "(function(){var keys=['apple','banana','cat','dog'];var root=document.getElementById('viz-hash');var hint=document.getElementById('viz-hash-hint');var buckets=[];for(var b=0;b<6;b++){var el=document.createElement('div');el.className='viz-cell';el.innerHTML='<span class=\"viz-cell__main\">'+b+'</span><span class=\"viz-cell__sub\">bucket</span>';root.appendChild(el);buckets.push(el);}var i=0;var timer=setInterval(function(){if(i>=keys.length){clearInterval(timer);hint.textContent='Готово';return;}var k=keys[i];var idx=k.length%buckets.length;buckets.forEach(function(n){n.classList.remove('viz-cell--active','viz-cell--success');});buckets[idx].classList.add('viz-cell--active');hint.textContent='«'+k+'» → индекс '+idx;buckets[idx].querySelector('.viz-cell__sub').textContent=k;i++;},900);})();",
    width: '100%',
    height: 240,
    showPlayButton: true,
    vizLayout: 'default',
  },
  'anim-stack': {
    html: '<div class="viz-col"><div class="viz-caption">Стек: push наверх</div><div class="viz-hint" id="viz-st-hint"></div><div class="viz-stack-v" id="viz-st"></div></div>',
    css: '',
    js: "(function(){var root=document.getElementById('viz-st');var hint=document.getElementById('viz-st-hint');var n=1;var timer=setInterval(function(){if(n>5){clearInterval(timer);hint.textContent='Вершина — последний push';return;}var el=document.createElement('div');el.className='viz-cell';el.innerHTML='<span class=\"viz-cell__main\">'+n+'</span><span class=\"viz-cell__sub\">push</span>';root.appendChild(el);hint.textContent='push('+n+')';n++;},700);})();",
    width: '100%',
    height: 260,
    showPlayButton: true,
    vizLayout: 'tall',
  },
  'anim-queue': {
    html: '<div class="viz-col"><div class="viz-caption">Очередь: FIFO</div><div class="viz-hint" id="viz-q-hint"></div><div class="viz-row" id="viz-q"></div></div>',
    css: '',
    js: "(function(){var root=document.getElementById('viz-q');var hint=document.getElementById('viz-q-hint');var n=1;var timer=setInterval(function(){if(n>5){clearInterval(timer);hint.textContent='Слева — голова, новые элементы справа';return;}var el=document.createElement('div');el.className='viz-cell';el.innerHTML='<span class=\"viz-cell__main\">'+n+'</span><span class=\"viz-cell__sub\">enqueue</span>';root.appendChild(el);if(n===1)el.classList.add('viz-cell--success');hint.textContent='enqueue('+n+')';n++;},700);})();",
    width: '100%',
    height: 240,
    showPlayButton: true,
    vizLayout: 'default',
  },
  'anim-factorial-trace': {
    html: '<div class="viz-split"><div class="viz-panel"><div class="viz-caption">Стек вызовов</div><div class="viz-stack-v" id="viz-f-stack"></div></div><div class="viz-panel"><div class="viz-caption">Текущий шаг</div><p class="viz-hint" id="viz-f-hint"></p><div class="viz-badge" id="viz-f-badge">n = 5</div></div></div>',
    css: '',
    js: "(function(){var n=5;var stackEl=document.getElementById('viz-f-stack');var hint=document.getElementById('viz-f-hint');var badge=document.getElementById('viz-f-badge');function sleep(ms){return new Promise(function(r){setTimeout(r,ms);});}var stack=[];function render(){stackEl.innerHTML='';for(var i=stack.length-1;i>=0;i--){var fr=stack[i];var d=document.createElement('div');d.className='viz-cell'+(fr.phase==='base'?' viz-cell--success':'');d.innerHTML='<span class=\"viz-cell__main\">f('+fr.k+')</span><span class=\"viz-cell__sub\">'+(fr.phase==='base'?'база':'ожидание')+'</span>';stackEl.appendChild(d);}}function fact(k){return new Promise(function(resolve){hint.textContent='Вызов factorial('+k+')';stack.push({k:k,phase:'wait'});render();sleep(400).then(function(){if(k<=1){stack[stack.length-1].phase='base';hint.textContent='База: factorial('+k+') = 1';render();sleep(320).then(function(){stack.pop();render();resolve(1);});return;}fact(k-1).then(function(sub){var r=k*sub;hint.textContent=k+' × '+sub+' = '+r;sleep(300).then(function(){stack.pop();render();hint.textContent='Возврат factorial('+k+') = '+r;sleep(280).then(function(){resolve(r);});});});});});}fact(n).then(function(ans){badge.textContent='Итог: '+ans;hint.textContent='Готово';});})();",
    width: '100%',
    height: 300,
    showPlayButton: true,
    vizLayout: 'tall',
  },
  'anim-sum-trace': {
    html: '<div class="viz-split"><div class="viz-panel"><div class="viz-caption">Активные вызовы</div><div class="viz-stack-v" id="viz-s-stack"></div></div><div class="viz-panel"><div class="viz-caption">Шаг</div><p class="viz-hint" id="viz-s-hint"></p><div class="viz-badge" id="viz-s-badge">sumRec</div></div></div>',
    css: '',
    js: "(function(){var arr=[1,2,3,4];var stackEl=document.getElementById('viz-s-stack');var hint=document.getElementById('viz-s-hint');var badge=document.getElementById('viz-s-badge');function sleep(ms){return new Promise(function(r){setTimeout(r,ms);});}var stack=[];function render(){stackEl.innerHTML='';for(var i=stack.length-1;i>=0;i--){var fr=stack[i];var d=document.createElement('div');d.className='viz-cell'+(fr.base?' viz-cell--success':'');d.innerHTML='<span class=\"viz-cell__main\">i = '+fr.i+'</span><span class=\"viz-cell__sub\">'+fr.note+'</span>';stackEl.appendChild(d);}}function sumTrace(i){return new Promise(function(res){hint.textContent='Заходим в sumRec('+i+')';stack.push({i:i,note:'сумма суффикса'});render();sleep(360).then(function(){if(i>=arr.length){stack[stack.length-1].base=true;stack[stack.length-1].note='пусто';render();hint.textContent='База: пустой суффикс → 0';sleep(260).then(function(){stack.pop();render();res(0);});return;}sumTrace(i+1).then(function(rest){var v=arr[i]+rest;hint.textContent='arr['+i+'] + '+rest+' = '+v;badge.textContent='Частично '+v;stack.pop();render();sleep(260).then(function(){res(v);});});});});}sumTrace(0).then(function(ans){hint.textContent='Итог';badge.textContent='Σ = '+ans;});})();",
    width: '100%',
    height: 300,
    showPlayButton: true,
    vizLayout: 'tall',
  },
  'anim-fib-memo': {
    html: '<div class="viz-col"><div class="viz-caption">Таблица memo[i]</div><div class="viz-hint" id="viz-fib-hint"></div><div class="viz-grid" id="viz-fib-grid"></div></div>',
    css: '',
    js: "(function(){var n=7;var memo=new Array(n+1);memo.fill(undefined);var grid=document.getElementById('viz-fib-grid');var hint=document.getElementById('viz-fib-hint');var cur=-1;function paint(){grid.innerHTML='';for(var i=0;i<=n;i++){var c=document.createElement('div');c.className='viz-cell'+(memo[i]!==undefined?' viz-cell--success':'')+(i===cur?' viz-cell--active':'');c.innerHTML='<span class=\"viz-cell__sub\">i='+i+'</span><span class=\"viz-cell__main\">'+(memo[i]===undefined?'?':String(memo[i]))+'</span>';grid.appendChild(c);}}function sleep(ms){return new Promise(function(r){setTimeout(r,ms);});}function fib(k){return sleep(280).then(function(){cur=k;paint();hint.textContent='Запрос F('+k+')';return sleep(280).then(function(){if(k<=1){memo[k]=k;paint();hint.textContent='База: F('+k+') = '+k;return sleep(240).then(function(){return memo[k];});}if(memo[k]!==undefined){hint.textContent='Уже в таблице: F('+k+') = '+memo[k];return sleep(220).then(function(){return memo[k];});}hint.textContent='F('+k+') = F('+(k-1)+') + F('+(k-2)+')';return fib(k-1).then(function(a){return fib(k-2).then(function(b){memo[k]=a+b;paint();hint.textContent='Записали F('+k+') = '+memo[k];return sleep(260).then(function(){return memo[k];});});});});});}paint();fib(n).then(function(){cur=-1;paint();hint.textContent='Готово: без повторных пересчётов';});})();",
    width: '100%',
    height: 280,
    showPlayButton: true,
    vizLayout: 'default',
  },
  'anim-factorial-tail': {
    html: '<div class="viz-col"><div class="viz-caption">Хвостовая форма: аккумулятор</div><p class="viz-hint" id="viz-t-hint"></p><div class="viz-badge" id="viz-t-state"></div><div class="viz-row" id="viz-t-steps"></div></div>',
    css: '',
    js: "(function(){var n0=6;var n=n0;var acc=1;var hint=document.getElementById('viz-t-hint');var state=document.getElementById('viz-t-state');var steps=document.getElementById('viz-t-steps');function sleep(ms){return new Promise(function(r){setTimeout(r,ms);});}function addStep(label){var d=document.createElement('div');d.className='viz-cell';d.innerHTML='<span class=\"viz-cell__main\">'+label+'</span>';steps.appendChild(d);}function run(){state.textContent='n = '+n+', acc = '+acc;hint.textContent='Старт';return sleep(400).then(function loop(){if(n<=1){hint.textContent='База: возвращаем acc';state.textContent='ответ = '+acc;return sleep(300);}var next=acc*n;hint.textContent='Шаг: acc ← acc × n';addStep(acc+' × '+n+' = '+next);acc=next;n=n-1;state.textContent='n = '+n+', acc = '+acc;return sleep(520).then(loop);});}run();})();",
    width: '100%',
    height: 280,
    showPlayButton: true,
    vizLayout: 'default',
  },
  'anim-merge-sort': {
    html: '<div class="viz-col"><div class="viz-caption">Merge sort — этапы</div><p class="viz-hint" id="viz-ms-hint"></p><div id="viz-ms-levels"></div></div>',
    css: '#viz-ms-levels{display:flex;flex-direction:column;gap:10px;width:100%;max-width:100%;align-items:center;}',
    js: "(function(){var stages=[{hint:'Исходный массив',parts:[[5,3,8,1]]},{hint:'Делим пополам',parts:[[5,3],[8,1]]},{hint:'База: по одному элементу',parts:[[5],[3],[8],[1]]},{hint:'Сливаем пары',parts:[[3,5],[1,8]]},{hint:'Финальное слияние',parts:[[1,3,5,8]]}];var hintEl=document.getElementById('viz-ms-hint');var levelsEl=document.getElementById('viz-ms-levels');function sleep(ms){return new Promise(function(r){setTimeout(r,ms);});}function render(parts){levelsEl.innerHTML='';parts.forEach(function(sub){var g=document.createElement('div');g.className='viz-group';sub.forEach(function(x){var c=document.createElement('div');c.className='viz-cell';c.innerHTML='<span class=\"viz-cell__main\">'+x+'</span>';g.appendChild(c);});levelsEl.appendChild(g);});}(function run(){var i=0;function next(){if(i>=stages.length)return;var s=stages[i];hintEl.textContent=s.hint;render(s.parts);i++;return sleep(700).then(next);}return next();})();})();",
    width: '100%',
    height: 320,
    showPlayButton: true,
    vizLayout: 'tall',
  },
};

const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
let count = 0;
for (const article of db.articles) {
  if (article.topicId !== 'osnovy' && article.topicId !== 'rekursiya') continue;
  for (const block of article.blocks) {
    if (block.type !== 'animation') continue;
    const p = patches[block.id];
    if (!p) continue;
    Object.assign(block, { id: block.id, type: 'animation' }, p);
    count++;
  }
}
fs.writeFileSync(dbPath, JSON.stringify(db, null, 2) + '\n', 'utf8');
console.log('Patched animation blocks:', count);
