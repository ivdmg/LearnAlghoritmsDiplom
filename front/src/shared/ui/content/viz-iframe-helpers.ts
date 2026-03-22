/**
 * Столбцы: значение над прямоугольником, индекс под осью. Без анимации height (убирает мигание).
 */
export const VIZ_IFRAME_HELPERS_JS = `(function (w) {
  var SW = 0.52;
  var DEFAULT_PX_PER_UNIT = 10;
  var MIN_BAR_PX = 6;
  var CHART_RESERVED_PX = 42;

  var VizBars = {
    maxOf: function (a) {
      var m = 0;
      for (var i = 0; i < a.length; i++) m = Math.max(m, Math.abs(Number(a[i])) || 0);
      return m || 1;
    },
    heightPxForValue: function (value, maxV, maxBarPx, opts) {
      opts = opts || {};
      var pxPer = opts.pxPerUnit != null ? opts.pxPerUnit : DEFAULT_PX_PER_UNIT;
      var minPx = opts.minPx != null ? opts.minPx : MIN_BAR_PX;
      var num = typeof value === 'number' && !isNaN(value) ? value : 0;
      if (num < 0) num = 0;
      var m = maxV > 0 ? maxV : 1;
      var raw = num * pxPer;
      var cap = m * pxPer;
      var mb = maxBarPx > 0 ? maxBarPx : 160;
      var scale = cap > mb ? mb / cap : 1;
      var h = raw * scale;
      return Math.max(minPx, h);
    },
    _readCachedMaxBarPx: function (root) {
      if (!root || !root.dataset || !root.dataset.vizMaxBarPx) return null;
      var v = parseFloat(root.dataset.vizMaxBarPx, 10);
      return isNaN(v) ? null : v;
    },
    _getMaxBarPx: function (root) {
      var chart = root && root.classList && root.classList.contains('viz-chart') ? root : root && root.closest ? root.closest('.viz-chart') : null;
      if (!chart) chart = root;
      if (!chart) return 160;
      var h = chart.clientHeight;
      if (!h || h < 24) {
        var br = chart.getBoundingClientRect();
        if (br.height > 24) h = br.height;
      }
      if (!h || h < 24) h = 160;
      return Math.max(52, h - CHART_RESERVED_PX);
    },
    clearStates: function (root) {
      if (!root) return;
      root.querySelectorAll('.viz-bar-fill').forEach(function (f) {
        f.className = 'viz-bar-fill';
      });
    },
    clearZones: function (root) {
      if (!root) return;
      root.querySelectorAll('.viz-bar-col').forEach(function (c) {
        c.classList.remove('viz-bar-col--zone-a', 'viz-bar-col--zone-b');
      });
    },
    setZone: function (root, lo, hi, className) {
      var cols = root.querySelectorAll('.viz-bar-col');
      for (var i = lo; i <= hi; i++) {
        if (cols[i]) cols[i].classList.add(className);
      }
    },
    setState: function (root, i, state) {
      var cols = root.querySelectorAll('.viz-bar-col');
      var f = cols[i] && cols[i].querySelector('.viz-bar-fill');
      if (!f) return;
      f.className = 'viz-bar-fill' + (state ? ' viz-bar-fill--' + state : '');
    },
    _applyCol: function (col, v, idx, maxV, opts, maxBarPxFixed) {
      opts = opts || {};
      var root = col.closest ? col.closest('.viz-chart') : null;
      var fill = col.querySelector('.viz-bar-fill');
      var lab = col.querySelector('.viz-bar-val-outer .viz-bar-val');
      var idxEl = col.querySelector('.viz-bar-idx');
      if (!fill || !lab || !idxEl) return;
      var maxBarPx = maxBarPxFixed != null ? maxBarPxFixed : this._readCachedMaxBarPx(root) || this._getMaxBarPx(root || col.parentNode);
      var num = typeof v === 'number' && !isNaN(v) ? v : 0;
      fill.style.height = this.heightPxForValue(num, maxV, maxBarPx, opts) + 'px';
      lab.textContent = v === undefined || v === null ? '?' : String(v);
      idxEl.textContent = String(idx);
      col.dataset.i = String(idx);
    },
    render: function (root, arr, opts) {
      opts = opts || {};
      var maxV = opts.max != null ? opts.max : this.maxOf(arr);
      root.innerHTML = '';
      root.dataset.vizMaxBarPx = '';
      for (var i = 0; i < arr.length; i++) {
        var v = arr[i];
        var col = document.createElement('div');
        col.className = 'viz-bar-col';
        col.dataset.i = String(i);
        var track = document.createElement('div');
        track.className = 'viz-bar-track';
        var outer = document.createElement('div');
        outer.className = 'viz-bar-val-outer';
        var lab = document.createElement('span');
        lab.className = 'viz-bar-val';
        lab.textContent = v === undefined || v === null ? '?' : String(v);
        outer.appendChild(lab);
        var fill = document.createElement('div');
        fill.className = 'viz-bar-fill';
        var foot = document.createElement('div');
        foot.className = 'viz-bar-foot';
        var idx = document.createElement('div');
        idx.className = 'viz-bar-idx';
        idx.textContent = String(i);
        foot.appendChild(idx);
        track.appendChild(outer);
        track.appendChild(fill);
        col.appendChild(track);
        col.appendChild(foot);
        root.appendChild(col);
      }
      var self = this;
      requestAnimationFrame(function () {
        var mb = self._getMaxBarPx(root);
        root.dataset.vizMaxBarPx = String(mb);
        self.refresh(root, arr, opts);
      });
    },
    refresh: function (root, arr, opts) {
      opts = opts || {};
      var maxV = opts.max != null ? opts.max : this.maxOf(arr);
      var mb = this._readCachedMaxBarPx(root);
      if (mb == null) {
        mb = this._getMaxBarPx(root);
        root.dataset.vizMaxBarPx = String(mb);
      }
      var cols = root.querySelectorAll('.viz-bar-col');
      for (var i = 0; i < arr.length && i < cols.length; i++) {
        this._applyCol(cols[i], arr[i], i, maxV, opts, mb);
      }
    },
    /** Мгновенный обмен значений (без слайда) — для quicksort и т.п. */
    swapValues: function (root, arr, i, j, maxV, done) {
      var cols = root.querySelectorAll('.viz-bar-col');
      var ci = cols[i];
      var cj = cols[j];
      if (!ci || !cj) {
        if (done) done();
        return;
      }
      var t = arr[i];
      arr[i] = arr[j];
      arr[j] = t;
      var m = maxV != null ? maxV : this.maxOf(arr);
      var mb = this._readCachedMaxBarPx(root) || this._getMaxBarPx(root);
      root.dataset.vizMaxBarPx = String(mb);
      this._applyCol(ci, arr[i], i, m, {}, mb);
      this._applyCol(cj, arr[j], j, m, {}, mb);
      if (done) setTimeout(done, 48);
    },
    swapSlide: function (root, arr, i, j, maxV, done) {
      var cols = root.querySelectorAll('.viz-bar-col');
      var ci = cols[i];
      var cj = cols[j];
      if (!ci || !cj) {
        if (done) done();
        return;
      }
      var m = maxV != null ? maxV : this.maxOf(arr);
      var mb = this._readCachedMaxBarPx(root) || this._getMaxBarPx(root);
      var ri = ci.getBoundingClientRect();
      var rj = cj.getBoundingClientRect();
      var dx = rj.left - ri.left;
      ci.style.zIndex = '5';
      cj.style.zIndex = '5';
      ci.style.transition = 'transform ' + SW + 's cubic-bezier(0.4, 0, 0.2, 1)';
      cj.style.transition = 'transform ' + SW + 's cubic-bezier(0.4, 0, 0.2, 1)';
      ci.style.transform = 'translateX(' + dx + 'px)';
      cj.style.transform = 'translateX(' + (-dx) + 'px)';
      var self = this;
      setTimeout(function () {
        var t = arr[i];
        arr[i] = arr[j];
        arr[j] = t;
        ci.style.transition = 'none';
        cj.style.transition = 'none';
        ci.style.transform = '';
        cj.style.transform = '';
        ci.style.zIndex = '';
        cj.style.zIndex = '';
        root.dataset.vizMaxBarPx = String(mb);
        self._applyCol(ci, arr[i], i, m, {}, mb);
        self._applyCol(cj, arr[j], j, m, {}, mb);
        requestAnimationFrame(function () {
          ci.style.transition = '';
          cj.style.transition = '';
        });
        if (done) done();
      }, Math.ceil(SW * 1000) + 50);
    },
    swap: function (root, arr, i, j, maxV, done) {
      this.swapSlide(root, arr, i, j, maxV, done);
    }
  };
  w.VizBars = VizBars;
})(window);`;
