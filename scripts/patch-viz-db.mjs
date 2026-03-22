/**
 * Одноразовый патч: столбчатые диаграммы (VizBars), стек/очередь с pop/dequeue и slide-in.
 * Запуск: node scripts/patch-viz-db.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..', 'db.json');
const data = JSON.parse(fs.readFileSync(root, 'utf8'));

function patch(articleId, blockId, fields) {
  const art = data.articles.find((a) => a.id === articleId);
  if (!art) throw new Error(`article not found: ${articleId}`);
  const b = art.blocks.find((x) => x.id === blockId && x.type === 'animation');
  if (!b) throw new Error(`animation block not found: ${articleId} / ${blockId}`);
  Object.assign(b, fields);
}

const patches = [
  [
    'osnovy-intro',
    'anim-array',
    {
      html:
        '<div class="viz-col"><div class="viz-caption">Массив: значение и индекс</div><div class="viz-chart" id="viz-array"></div></div>',
      js: `(function(){
  var root=document.getElementById('viz-array');
  var values=[4,8,1,7,3,9];
  var maxV=VizBars.maxOf(values);
  VizBars.render(root,values,{max:maxV});
})();`,
    },
  ],
  [
    'osnovy-intro',
    'anim2',
    {
      html:
        '<div class="viz-col"><div class="viz-caption">Линейный проход</div><div class="viz-hint" id="viz-loop-hint"></div><div class="viz-chart" id="viz-loop"></div></div>',
      js: `(function(){
  var root=document.getElementById('viz-loop');
  var hint=document.getElementById('viz-loop-hint');
  var values=[3,5,7,2,6];
  var maxV=VizBars.maxOf(values);
  VizBars.render(root,values,{max:maxV});
  var i=0;
  function tick(){
    VizBars.clearStates(root);
    VizBars.setState(root,i,'active');
    hint.textContent='Шаг '+(i+1)+' / '+values.length+' — смотрим элемент '+values[i];
    i=(i+1)%values.length;
  }
  tick();
  setInterval(tick,850);
})();`,
    },
  ],
  [
    'osnovy-complexity',
    'anim-time',
    {
      html:
        '<div class="viz-col"><div class="viz-caption">Операций всё больше при росте n</div><div class="viz-chart" id="viz-time-chart"></div><div class="viz-hint" id="viz-bar-hint"></div></div>',
      js: `(function(){
  var root=document.getElementById('viz-time-chart');
  var hint=document.getElementById('viz-bar-hint');
  var costs=[];
  for(var i=1;i<=12;i++) costs.push(i);
  VizBars.render(root,costs,{max:12});
  hint.textContent='Высота столбца — относительная «стоимость» шагов при данном n';
})();`,
    },
  ],
  [
    'osnovy-arrays-strings',
    'anim-memory',
    {
      html:
        '<div class="viz-col"><div class="viz-caption">Подряд в памяти</div><div class="viz-chart" id="viz-mem"></div></div>',
      js: `(function(){
  var root=document.getElementById('viz-mem');
  var values=[10,14,7,3,8,21];
  var maxV=VizBars.maxOf(values);
  VizBars.render(root,values,{max:maxV});
})();`,
    },
  ],
  [
    'osnovy-arrays-strings',
    'anim-iteration',
    {
      html:
        '<div class="viz-col"><div class="viz-caption">Суммирование по элементам</div><div class="viz-hint" id="viz-sum-hint"></div><div class="viz-chart" id="viz-sum-row"></div><div class="viz-badge" id="viz-sum-total">Σ = 0</div></div>',
      js: `(function(){
  var row=document.getElementById('viz-sum-row');
  var hint=document.getElementById('viz-sum-hint');
  var totalEl=document.getElementById('viz-sum-total');
  var values=[4,7,1,9,3];
  var maxV=VizBars.maxOf(values);
  VizBars.render(row,values,{max:maxV});
  var i=0;
  var acc=0;
  function step(){
    VizBars.clearStates(row);
    VizBars.setState(row,i,'active');
    acc+=values[i];
    totalEl.textContent='Σ = '+acc;
    hint.textContent='Добавляем arr['+i+'] = '+values[i];
    i=(i+1)%values.length;
    if(i===0) acc=0;
  }
  step();
  setInterval(step,900);
})();`,
    },
  ],
  [
    'osnovy-array-ops',
    'anim-search',
    {
      html:
        '<div class="viz-col"><div class="viz-caption">Линейный поиск</div><div class="viz-hint" id="viz-find-hint"></div><div class="viz-chart" id="viz-find"></div><div class="viz-badge" id="viz-find-badge">ищем: 9</div></div>',
      js: `(function(){
  var arr=[3,7,1,9,5];
  var target=9;
  var root=document.getElementById('viz-find');
  var hint=document.getElementById('viz-find-hint');
  var maxV=VizBars.maxOf(arr);
  VizBars.render(root,arr,{max:maxV});
  var i=0;
  var timer=setInterval(function(){
    if(i>=arr.length){
      clearInterval(timer);
      hint.textContent='Не найдено';
      VizBars.clearStates(root);
      for(var j=0;j<arr.length;j++) VizBars.setState(root,j,'fail');
      return;
    }
    VizBars.clearStates(root);
    VizBars.setState(root,i,'compare');
    hint.textContent='Сравниваем с индексом '+i;
    if(arr[i]===target){
      VizBars.clearStates(root);
      VizBars.setState(root,i,'success');
      hint.textContent='Найдено на позиции '+i;
      clearInterval(timer);
      return;
    }
    i++;
  },750);
})();`,
    },
  ],
  [
    'osnovy-array-ops',
    'anim-insert',
    {
      html:
        '<div class="viz-col"><div class="viz-caption">Вставка в середину</div><div class="viz-hint" id="viz-ins-hint"></div><div class="viz-chart" id="viz-ins"></div></div>',
      js: `(function(){
  var root=document.getElementById('viz-ins');
  var hint=document.getElementById('viz-ins-hint');
  var arr=[1,2,4,5];
  var maxV=VizBars.maxOf(arr);
  VizBars.render(root,arr,{max:maxV});
  hint.textContent='До вставки 3 на позицию 2';
  setTimeout(function(){
    arr.splice(2,0,3);
    maxV=VizBars.maxOf(arr);
    VizBars.refresh(root,arr,{max:maxV});
    VizBars.clearStates(root);
    VizBars.setState(root,2,'success');
    hint.textContent='После вставки: элементы сдвинулись вправо';
  },1400);
})();`,
    },
  ],
  [
    'osnovy-stack-queue',
    'anim-stack',
    {
      html:
        '<div class="viz-col"><div class="viz-caption">Стек: push и pop</div><div class="viz-hint" id="viz-st-hint"></div><div class="viz-stack-v" id="viz-st"></div></div>',
      js: `(function(){
  var root=document.getElementById('viz-st');
  var hint=document.getElementById('viz-st-hint');
  function sleep(ms){return new Promise(function(r){setTimeout(r,ms);});}
  function pushCell(n,sub){
    var d=document.createElement('div');
    d.className='viz-cell viz-cell--enter-right';
    d.innerHTML='<span class="viz-cell__main">'+n+'</span><span class="viz-cell__sub">'+(sub||'push')+'</span>';
    root.appendChild(d);
    requestAnimationFrame(function(){
      requestAnimationFrame(function(){ d.classList.add('viz-cell--shown'); });
    });
  }
  function popCell(){
    var top=root.lastElementChild;
    if(!top) return Promise.resolve();
    top.classList.add('viz-cell--exit-up');
    return new Promise(function(res){
      setTimeout(function(){ if(top.parentNode) top.parentNode.removeChild(top); res(); }, 380);
    });
  }
  async function run(){
    hint.textContent='push(1)';
    pushCell(1);
    await sleep(600);
    hint.textContent='push(2)';
    pushCell(2);
    await sleep(600);
    hint.textContent='push(3)';
    pushCell(3);
    await sleep(700);
    hint.textContent='pop() — снимаем с вершины';
    await sleep(400);
    await popCell();
    await sleep(280);
    hint.textContent='pop()';
    await popCell();
    await sleep(280);
    hint.textContent='pop()';
    await popCell();
    await sleep(450);
    hint.textContent='Стек пуст; push(4)';
    pushCell(4,'снова');
    await sleep(550);
    hint.textContent='Вершина — последний push (LIFO)';
  }
  run();
})();`,
    },
  ],
  [
    'osnovy-stack-queue',
    'anim-queue',
    {
      html:
        '<div class="viz-col"><div class="viz-caption">Очередь: enqueue и dequeue</div><div class="viz-hint" id="viz-q-hint"></div><div class="viz-row viz-row--queue" id="viz-q"></div></div>',
      js: `(function(){
  var root=document.getElementById('viz-q');
  var hint=document.getElementById('viz-q-hint');
  function sleep(ms){return new Promise(function(r){setTimeout(r,ms);});}
  function enqueue(n){
    var d=document.createElement('div');
    d.className='viz-cell viz-cell--enter-right';
    d.innerHTML='<span class="viz-cell__main">'+n+'</span><span class="viz-cell__sub">enqueue</span>';
    root.appendChild(d);
    requestAnimationFrame(function(){
      requestAnimationFrame(function(){ d.classList.add('viz-cell--shown'); });
    });
    return d;
  }
  function dequeue(){
    var first=root.firstElementChild;
    if(!first) return Promise.resolve();
    first.classList.remove('viz-cell--success');
    first.classList.add('viz-cell--exit-left');
    return new Promise(function(res){
      setTimeout(function(){ if(first.parentNode) first.parentNode.removeChild(first); res(); }, 380);
    });
  }
  async function run(){
    hint.textContent='enqueue(1)';
    var c1=enqueue(1);
    c1.classList.add('viz-cell--success');
    await sleep(550);
    hint.textContent='enqueue(2)';
    enqueue(2);
    await sleep(550);
    hint.textContent='enqueue(3)';
    enqueue(3);
    await sleep(650);
    hint.textContent='dequeue() — извлекаем с головы';
    await dequeue();
    await sleep(320);
    hint.textContent='dequeue()';
    await dequeue();
    await sleep(400);
    hint.textContent='Голова очереди — слева (FIFO)';
    if(root.firstElementChild) root.firstElementChild.classList.add('viz-cell--success');
  }
  run();
})();`,
    },
  ],
  [
    'rekursiya-intro',
    'anim-factorial-trace',
    {
      js: `(function(){
  var n=5;
  var stackEl=document.getElementById('viz-f-stack');
  var hint=document.getElementById('viz-f-hint');
  var badge=document.getElementById('viz-f-badge');
  function sleep(ms){return new Promise(function(r){setTimeout(r,ms);});}
  var stack=[];
  function revealAll(){
    var ch=stackEl.children;
    for(var j=0;j<ch.length;j++){
      (function(node,delay){ setTimeout(function(){ node.classList.add('viz-cell--shown'); },delay); })(ch[j],j*45);
    }
  }
  function render(){
    stackEl.innerHTML='';
    for(var i=stack.length-1;i>=0;i--){
      var fr=stack[i];
      var d=document.createElement('div');
      d.className='viz-cell viz-cell--enter-right'+(fr.phase==='base'?' viz-cell--success':(i===stack.length-1?' viz-cell--active':''));
      d.innerHTML='<span class="viz-cell__main">f('+fr.k+')</span><span class="viz-cell__sub">'+(fr.phase==='base'?'база':'ожидание')+'</span>';
      stackEl.appendChild(d);
    }
    requestAnimationFrame(function(){ requestAnimationFrame(revealAll); });
  }
  function fact(k){
    return new Promise(function(resolve){
      hint.textContent='Вызов factorial('+k+')';
      stack.push({k:k,phase:'wait'});
      render();
      sleep(400).then(function(){
        if(k<=1){
          stack[stack.length-1].phase='base';
          hint.textContent='База: factorial('+k+') = 1';
          render();
          sleep(320).then(function(){
            stack.pop();
            render();
            resolve(1);
          });
          return;
        }
        fact(k-1).then(function(sub){
          var r=k*sub;
          hint.textContent=k+' × '+sub+' = '+r;
          sleep(300).then(function(){
            stack.pop();
            render();
            hint.textContent='Возврат factorial('+k+') = '+r;
            sleep(280).then(function(){ resolve(r); });
          });
        });
      });
    });
  }
  fact(n).then(function(ans){
    badge.textContent='Итог: '+ans;
    hint.textContent='Готово';
  });
})();`,
    },
  ],
  [
    'rekursiya-basic-examples',
    'anim-sum-trace',
    {
      js: `(function(){
  var arr=[1,2,3,4];
  var stackEl=document.getElementById('viz-s-stack');
  var hint=document.getElementById('viz-s-hint');
  var badge=document.getElementById('viz-s-badge');
  function sleep(ms){return new Promise(function(r){setTimeout(r,ms);});}
  var stack=[];
  function revealAll(){
    var ch=stackEl.children;
    for(var j=0;j<ch.length;j++){
      (function(node,delay){ setTimeout(function(){ node.classList.add('viz-cell--shown'); },delay); })(ch[j],j*45);
    }
  }
  function render(){
    stackEl.innerHTML='';
    for(var i=stack.length-1;i>=0;i--){
      var fr=stack[i];
      var d=document.createElement('div');
      d.className='viz-cell viz-cell--enter-right'+(fr.base?' viz-cell--success':(i===stack.length-1?' viz-cell--active':''));
      d.innerHTML='<span class="viz-cell__main">i = '+fr.i+'</span><span class="viz-cell__sub">'+fr.note+'</span>';
      stackEl.appendChild(d);
    }
    requestAnimationFrame(function(){ requestAnimationFrame(revealAll); });
  }
  function sumTrace(i){
    return new Promise(function(res){
      hint.textContent='Заходим в sumRec('+i+')';
      stack.push({i:i,note:'сумма суффикса'});
      render();
      sleep(360).then(function(){
        if(i>=arr.length){
          stack[stack.length-1].base=true;
          stack[stack.length-1].note='пусто';
          render();
          hint.textContent='База: пустой суффикс → 0';
          sleep(260).then(function(){
            stack.pop();
            render();
            res(0);
          });
          return;
        }
        sumTrace(i+1).then(function(rest){
          var v=arr[i]+rest;
          hint.textContent='arr['+i+'] + '+rest+' = '+v;
          badge.textContent='Частично '+v;
          stack.pop();
          render();
          sleep(260).then(function(){ res(v); });
        });
      });
    });
  }
  sumTrace(0).then(function(ans){
    hint.textContent='Итог';
    badge.textContent='Σ = '+ans;
  });
})();`,
    },
  ],
  [
    'rekursiya-tail',
    'anim-factorial-tail',
    {
      js: `(function(){
  var n0=6;
  var n=n0;
  var acc=1;
  var hint=document.getElementById('viz-t-hint');
  var state=document.getElementById('viz-t-state');
  var steps=document.getElementById('viz-t-steps');
  function sleep(ms){return new Promise(function(r){setTimeout(r,ms);});}
  function addStep(label){
    var d=document.createElement('div');
    d.className='viz-cell viz-cell--enter-right';
    d.innerHTML='<span class="viz-cell__main">'+label+'</span>';
    steps.appendChild(d);
    requestAnimationFrame(function(){
      requestAnimationFrame(function(){ d.classList.add('viz-cell--shown'); });
    });
  }
  function run(){
    state.textContent='n = '+n+', acc = '+acc;
    hint.textContent='Старт';
    return sleep(400).then(function loop(){
      if(n<=1){
        hint.textContent='База: возвращаем acc';
        state.textContent='ответ = '+acc;
        return sleep(300);
      }
      var next=acc*n;
      hint.textContent='Шаг: acc ← acc × n';
      addStep(acc+' × '+n+' = '+next);
      acc=next;
      n=n-1;
      state.textContent='n = '+n+', acc = '+acc;
      return sleep(520).then(loop);
    });
  }
  run();
})();`,
    },
  ],
  [
    'rekursiya-divide-conquer',
    'anim-merge-sort',
    {
      js: `(function(){
  var stages=[
    {hint:'Исходный массив',parts:[[5,3,8,1]]},
    {hint:'Делим пополам',parts:[[5,3],[8,1]]},
    {hint:'База: по одному элементу',parts:[[5],[3],[8],[1]]},
    {hint:'Сливаем пары',parts:[[3,5],[1,8]]},
    {hint:'Финальное слияние',parts:[[1,3,5,8]]}
  ];
  var hintEl=document.getElementById('viz-ms-hint');
  var levelsEl=document.getElementById('viz-ms-levels');
  function sleep(ms){return new Promise(function(r){setTimeout(r,ms);});}
  function render(parts){
    levelsEl.innerHTML='';
    var flat=[];
    parts.forEach(function(sub){ sub.forEach(function(x){ flat.push(x); }); });
    var globalMax=Math.max(VizBars.maxOf(flat),1);
    parts.forEach(function(sub){
      var g=document.createElement('div');
      g.className='viz-group';
      var ch=document.createElement('div');
      ch.className='viz-chart';
      VizBars.render(ch,sub,{max:globalMax});
      g.appendChild(ch);
      levelsEl.appendChild(g);
    });
  }
  (function run(){
    var i=0;
    function next(){
      if(i>=stages.length) return;
      var s=stages[i];
      hintEl.textContent=s.hint;
      render(s.parts);
      i++;
      return sleep(720).then(next);
    }
    return next();
  })();
})();`,
    },
  ],
  [
    'sortirovki-n2-simple',
    'anim-bubble',
    {
      html:
        '<div class="viz-col"><div class="viz-caption">Пузырёк: сравнение и обмен соседей</div><div class="viz-hint" id="vb-h"></div><div class="viz-chart" id="vb-r"></div></div>',
      js: `(function(){
  var r=document.getElementById('vb-r');
  var h=document.getElementById('vb-h');
  var a=[5,2,8,1];
  var maxV=VizBars.maxOf(a);
  VizBars.render(r,a,{max:maxV});
  function sleep(ms){return new Promise(function(res){setTimeout(res,ms);});}
  async function bubble(){
    var n=a.length;
    for(var i=0;i<n-1;i++){
      for(var j=0;j<n-1-i;j++){
        VizBars.clearStates(r);
        VizBars.setState(r,j,'compare');
        VizBars.setState(r,j+1,'compare');
        h.textContent='Сравниваем '+a[j]+' и '+a[j+1];
        await sleep(520);
        if(a[j]>a[j+1]){
          h.textContent='Меняем местами';
          await new Promise(function(res){
            VizBars.swap(r,a,j,j+1,maxV,function(){ res(); });
          });
          await sleep(220);
        }
      }
    }
    VizBars.clearStates(r);
    for(var k=0;k<n;k++) VizBars.setState(r,k,'success');
    h.textContent='Отсортировано';
  }
  h.textContent='Пузырьковая сортировка';
  bubble();
})();`,
    },
  ],
  [
    'sortirovki-n2-simple',
    'anim-insert',
    {
      html:
        '<div class="viz-col"><div class="viz-caption">Вставки: отсортированный префикс</div><div class="viz-hint" id="vi-h"></div><div class="viz-chart" id="vi-r"></div></div>',
      js: `(function(){
  var r=document.getElementById('vi-r');
  var h=document.getElementById('vi-h');
  var steps=[
    {a:[3,1,4,2],t:'Префикс [0] упорядочен, ключ arr[1]=1'},
    {a:[1,3,4,2],t:'Вставили 1 в префикс'},
    {a:[1,3,4,2],t:'Ключ 4 на месте'},
    {a:[1,2,3,4],t:'Вставили 2 в отсортированный префикс'}
  ];
  var maxV=4;
  function sleep(ms){return new Promise(function(res){setTimeout(res,ms);});}
  async function run(){
    VizBars.render(r,steps[0].a,{max:maxV});
    h.textContent=steps[0].t;
    await sleep(900);
    for(var i=1;i<steps.length;i++){
      VizBars.refresh(r,steps[i].a,{max:maxV});
      VizBars.clearStates(r);
      if(i===1){ VizBars.setState(r,0,'compare'); VizBars.setState(r,1,'compare'); }
      if(i===steps.length-1){
        VizBars.setState(r,0,'success');
        VizBars.setState(r,1,'compare');
        VizBars.setState(r,2,'compare');
        VizBars.setState(r,3,'active');
      }
      h.textContent=steps[i].t;
      await sleep(950);
    }
    VizBars.clearStates(r);
    for(var k=0;k<4;k++) VizBars.setState(r,k,'success');
    h.textContent='Готово';
  }
  run();
})();`,
    },
  ],
  [
    'sortirovki-quicksort',
    'anim-q',
    {
      html:
        '<div class="viz-col"><div class="viz-caption">Разбиение вокруг опорного (идея)</div><div class="viz-hint" id="vq-h"></div><div class="viz-chart" id="vq-r"></div></div>',
      js: `(function(){
  var r=document.getElementById('vq-r');
  var h=document.getElementById('vq-h');
  var a=[7,2,5,1,8,3];
  var maxV=VizBars.maxOf(a);
  VizBars.render(r,a,{max:maxV});
  function sleep(ms){return new Promise(function(res){setTimeout(res,ms);});}
  async function run(){
    h.textContent='Опорный — последний элемент';
    VizBars.clearStates(r);
    VizBars.setState(r,a.length-1,'compare');
    await sleep(900);
    h.textContent='После partition (учебный кадр): pivot на месте';
    var after=[2,1,3,7,8,5];
    maxV=VizBars.maxOf(after);
    VizBars.refresh(r,after,{max:maxV});
    VizBars.clearStates(r);
    VizBars.setState(r,2,'success');
    await sleep(400);
    h.textContent='Слева от pivot — не больше, справа — не меньше';
  }
  run();
})();`,
    },
  ],
  [
    'sortirovki-merge',
    'anim-m',
    {
      js: `(function(){
  var stages=[
    {hint:'Исходный массив',parts:[[5,3,8,1]]},
    {hint:'Делим пополам',parts:[[5,3],[8,1]]},
    {hint:'База: по одному',parts:[[5],[3],[8],[1]]},
    {hint:'Сливаем пары',parts:[[3,5],[1,8]]},
    {hint:'Финальное слияние',parts:[[1,3,5,8]]}
  ];
  var hintEl=document.getElementById('vm-h');
  var levelsEl=document.getElementById('vm-l');
  function sleep(ms){return new Promise(function(r){setTimeout(r,ms);});}
  function render(parts){
    levelsEl.innerHTML='';
    var flat=[];
    parts.forEach(function(sub){ sub.forEach(function(x){ flat.push(x); }); });
    var globalMax=Math.max(VizBars.maxOf(flat),1);
    parts.forEach(function(sub){
      var g=document.createElement('div');
      g.className='viz-group';
      var ch=document.createElement('div');
      ch.className='viz-chart';
      VizBars.render(ch,sub,{max:globalMax});
      g.appendChild(ch);
      levelsEl.appendChild(g);
    });
  }
  (function run(){
    var i=0;
    function next(){
      if(i>=stages.length) return;
      var s=stages[i];
      hintEl.textContent=s.hint;
      render(s.parts);
      i++;
      return sleep(720).then(next);
    }
    return next();
  })();
})();`,
    },
  ],
  [
    'sortirovki-heapsort',
    'anim-h',
    {
      html:
        '<div class="viz-col"><div class="viz-caption">Массив как куча: корень — максимум</div><div class="viz-hint" id="vh-h"></div><div class="viz-chart" id="vh-r"></div></div>',
      js: `(function(){
  var a=[4,10,3,5,1];
  var r=document.getElementById('vh-r');
  var h=document.getElementById('vh-h');
  var maxV=VizBars.maxOf(a);
  VizBars.render(r,a,{max:maxV});
  h.textContent='Индекс 0 — корень max-heap (идея)';
  VizBars.setState(r,0,'success');
  setTimeout(function(){
    h.textContent='Дети узла i: индексы 2i+1 и 2i+2';
    VizBars.clearStates(r);
    VizBars.setState(r,0,'compare');
    VizBars.setState(r,1,'compare');
    VizBars.setState(r,2,'compare');
  },1100);
})();`,
    },
  ],
  [
    'sortirovki-counting-radix',
    'anim-c',
    {
      html:
        '<div class="viz-col"><div class="viz-caption">Подсчёт частот ключей 0..k</div><div class="viz-hint" id="vc-h"></div><div class="viz-chart" id="vc-r"></div></div>',
      js: `(function(){
  var cnt=[0,2,1,0,1,0];
  var r=document.getElementById('vc-r');
  var h=document.getElementById('vc-h');
  var maxV=Math.max(VizBars.maxOf(cnt),1);
  VizBars.render(r,cnt,{max:maxV});
  h.textContent='Высота столбца — сколько раз встретился ключ (подпись — значение)';
})();`,
    },
  ],
  [
    'poisk-linear',
    'anim-lin',
    {
      html:
        '<div class="viz-col"><div class="viz-caption">Линейный поиск цели</div><div class="viz-hint" id="vl-h"></div><div class="viz-chart" id="vl-r"></div></div>',
      js: `(function(){
  var arr=[3,7,1,9,5];
  var target=9;
  var r=document.getElementById('vl-r');
  var h=document.getElementById('vl-h');
  var maxV=VizBars.maxOf(arr);
  VizBars.render(r,arr,{max:maxV});
  var i=0;
  var timer=setInterval(function(){
    if(i>=arr.length){
      clearInterval(timer);
      h.textContent='Не найдено';
      VizBars.clearStates(r);
      for(var j=0;j<arr.length;j++) VizBars.setState(r,j,'fail');
      return;
    }
    VizBars.clearStates(r);
    VizBars.setState(r,i,'compare');
    h.textContent='Сравниваем индекс '+i;
    if(arr[i]===target){
      VizBars.clearStates(r);
      VizBars.setState(r,i,'success');
      h.textContent='Найдено: индекс '+i;
      clearInterval(timer);
      return;
    }
    i++;
  },750);
})();`,
    },
  ],
  [
    'poisk-binary',
    'anim-bin',
    {
      html:
        '<div class="viz-col"><div class="viz-caption">Бинарный поиск: сужение отрезка</div><div class="viz-hint" id="vb2-h"></div><div class="viz-chart" id="vb2-r"></div></div>',
      js: `(function(){
  var arr=[1,3,4,7,9,12];
  var target=7;
  var r=document.getElementById('vb2-r');
  var h=document.getElementById('vb2-h');
  var maxV=VizBars.maxOf(arr);
  VizBars.render(r,arr,{max:maxV});
  var lo=0,hi=arr.length,step=0;
  function tick(){
    VizBars.clearStates(r);
    if(lo>=hi){
      h.textContent='Готово: индекс '+lo;
      if(lo<arr.length&&arr[lo]===target) VizBars.setState(r,lo,'success');
      return;
    }
    var mid=(lo+hi)>>1;
    VizBars.setState(r,mid,'compare');
    h.textContent='Шаг '+(++step)+': mid='+mid+' lo='+lo+' hi='+hi;
    if(arr[mid]<target) lo=mid+1;
    else hi=mid;
    setTimeout(tick,950);
  }
  h.textContent='Ищем '+target;
  setTimeout(tick,400);
})();`,
    },
  ],
  [
    'poisk-bounds',
    'anim-bnd',
    {
      html:
        '<div class="viz-col"><div class="viz-caption">Массив с повторениями: x = 2</div><div class="viz-hint" id="vbd-h"></div><div class="viz-chart" id="vbd-r"></div></div>',
      js: `(function(){
  var arr=[1,2,2,2,5];
  var r=document.getElementById('vbd-r');
  var h=document.getElementById('vbd-h');
  var maxV=VizBars.maxOf(arr);
  VizBars.render(r,arr,{max:maxV});
  for(var i=1;i<=3;i++) VizBars.setState(r,i,'success');
  h.textContent='Индексы 1..3 — все равны 2; lower_bound → 1, upper_bound → 4';
})();`,
    },
  ],
];

for (const [articleId, blockId, fields] of patches) {
  patch(articleId, blockId, fields);
}

fs.writeFileSync(root, JSON.stringify(data, null, 2) + '\n', 'utf8');
console.log('Patched', patches.length, 'animation blocks in db.json');
