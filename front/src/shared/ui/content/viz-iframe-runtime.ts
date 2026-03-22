/**
 * Выполняется в iframe до пользовательского JS: скорость и пауза через postMessage
 * (родитель шлёт { __learnAlgoViz: 1, cmd, value }).
 * Патчит setTimeout/setInterval — работает с существующими анимациями на таймерах и sleep().
 */
export const VIZ_IFRAME_RUNTIME_JS = `(function () {
  var state = { speed: 1, paused: false };
  window.addEventListener('message', function (e) {
    var d = e.data;
    if (!d || d.__learnAlgoViz !== 1) return;
    if (d.cmd === 'speed') {
      var v = Number(d.value);
      state.speed = v >= 0.25 && v <= 2 ? v : 1;
    }
    if (d.cmd === 'pause') state.paused = true;
    if (d.cmd === 'resume') state.paused = false;
  });

  var _st = window.setTimeout.bind(window);
  var _ct = window.clearTimeout.bind(window);

  var UID = 1;
  var handles = Object.create(null);

  function ct(t) {
    if (t != null) _ct(t);
    return null;
  }

  function waitUnpaused(rec, then) {
    rec.pauseTid = ct(rec.pauseTid);
    function loop() {
      if (rec.cancelled) return;
      if (!state.paused) {
        rec.pauseTid = null;
        then();
        return;
      }
      rec.pauseTid = _st(loop, 32);
    }
    loop();
  }

  function scheduleDelay(ms, rec, cb) {
    rec.delayTid = ct(rec.delayTid);
    ms = Math.max(0, (+ms || 0) / state.speed);
    var target = performance.now() + ms;
    function step() {
      if (rec.cancelled) return;
      waitUnpaused(rec, function () {
        if (rec.cancelled) return;
        var now = performance.now();
        if (now >= target) {
          rec.delayTid = null;
          cb();
        } else {
          rec.delayTid = _st(step, Math.min(48, target - now));
        }
      });
    }
    rec.delayTid = _st(step, 0);
  }

  function clearHandle(id) {
    var rec = handles[id];
    if (!rec) return;
    rec.cancelled = true;
    rec.delayTid = ct(rec.delayTid);
    rec.pauseTid = ct(rec.pauseTid);
    delete handles[id];
  }

  window.setTimeout = function (fn, delay) {
    var args = Array.prototype.slice.call(arguments, 2);
    var id = UID++;
    var rec = { cancelled: false, delayTid: null, pauseTid: null };
    handles[id] = rec;
    var d = delay == null ? 0 : +delay;
    scheduleDelay(d, rec, function () {
      if (rec.cancelled) return;
      clearHandle(id);
      if (typeof fn === 'function') fn.apply(window, args);
    });
    return id;
  };

  window.clearTimeout = function (id) {
    clearHandle(id);
  };

  window.setInterval = function (fn, delay) {
    var id = UID++;
    var rec = { cancelled: false, delayTid: null, pauseTid: null };
    handles[id] = rec;
    function tick() {
      if (rec.cancelled) return;
      var d = Math.max(0, +delay || 0);
      scheduleDelay(d, rec, function () {
        if (rec.cancelled) return;
        if (typeof fn === 'function') {
          try {
            fn();
          } catch (err) {}
        }
        tick();
      });
    }
    tick();
    return id;
  };

  window.clearInterval = window.clearTimeout;
})();`;
