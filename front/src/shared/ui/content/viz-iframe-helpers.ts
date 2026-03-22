/**
 * Выполняется в iframe после viz-iframe-runtime: `window.VizBars` для столбчатых диаграмм и обмена.
 */
export const VIZ_IFRAME_HELPERS_JS = `(function (w) {
  var VizBars = {
    maxOf: function (a) {
      var m = 0;
      for (var i = 0; i < a.length; i++) m = Math.max(m, Math.abs(Number(a[i])) || 0);
      return m || 1;
    },
    clearStates: function (root) {
      if (!root) return;
      root.querySelectorAll('.viz-bar-fill').forEach(function (f) {
        f.className = 'viz-bar-fill';
      });
    },
    setState: function (root, i, state) {
      var cols = root.querySelectorAll('.viz-bar-col');
      var f = cols[i] && cols[i].querySelector('.viz-bar-fill');
      if (!f) return;
      f.className = 'viz-bar-fill' + (state ? ' viz-bar-fill--' + state : '');
    },
    /** Одна строка-диаграмма: root = .viz-chart */
    render: function (root, arr, opts) {
      opts = opts || {};
      var maxV = opts.max != null ? opts.max : this.maxOf(arr);
      root.innerHTML = '';
      for (var i = 0; i < arr.length; i++) {
        var v = arr[i];
        var col = document.createElement('div');
        col.className = 'viz-bar-col';
        col.dataset.i = String(i);
        var track = document.createElement('div');
        track.className = 'viz-bar-track';
        var fill = document.createElement('div');
        fill.className = 'viz-bar-fill';
        var num = typeof v === 'number' && !isNaN(v) ? v : 0;
        var pct = Math.max(12, (num / maxV) * 100);
        fill.style.height = pct + '%';
        var lab = document.createElement('div');
        lab.className = 'viz-bar-val';
        lab.textContent = v === undefined || v === null ? '?' : String(v);
        var idx = document.createElement('div');
        idx.className = 'viz-bar-idx';
        idx.textContent = String(i);
        track.appendChild(fill);
        col.appendChild(track);
        col.appendChild(lab);
        col.appendChild(idx);
        root.appendChild(col);
      }
    },
    /** Обновить высоты и подписи из массива (после перестановки данных) */
    refresh: function (root, arr, opts) {
      opts = opts || {};
      var maxV = opts.max != null ? opts.max : this.maxOf(arr);
      var cols = root.querySelectorAll('.viz-bar-col');
      for (var i = 0; i < arr.length && i < cols.length; i++) {
        var fill = cols[i].querySelector('.viz-bar-fill');
        var lab = cols[i].querySelector('.viz-bar-val');
        var v = arr[i];
        var num = typeof v === 'number' && !isNaN(v) ? v : 0;
        fill.style.height = Math.max(12, (num / maxV) * 100) + '%';
        lab.textContent = String(v);
      }
    },
    /** Плавный обмен двух столбцов (высоты + значения в arr) */
    swap: function (root, arr, i, j, maxV, done) {
      var cols = root.querySelectorAll('.viz-bar-col');
      if (!cols[i] || !cols[j]) {
        if (done) done();
        return;
      }
      var fi = cols[i].querySelector('.viz-bar-fill');
      var fj = cols[j].querySelector('.viz-bar-fill');
      var li = cols[i].querySelector('.viz-bar-val');
      var lj = cols[j].querySelector('.viz-bar-val');
      var m = maxV != null ? maxV : this.maxOf(arr);
      var hi = fi.style.height;
      var hj = fj.style.height;
      fi.style.height = hj;
      fj.style.height = hi;
      var t = arr[i];
      arr[i] = arr[j];
      arr[j] = t;
      setTimeout(function () {
        var ni = arr[i];
        var nj = arr[j];
        li.textContent = String(ni);
        lj.textContent = String(nj);
        fi.style.height = Math.max(12, (ni / m) * 100) + '%';
        fj.style.height = Math.max(12, (nj / m) * 100) + '%';
        if (done) done();
      }, 420);
    }
  };
  w.VizBars = VizBars;
})(window);`;
