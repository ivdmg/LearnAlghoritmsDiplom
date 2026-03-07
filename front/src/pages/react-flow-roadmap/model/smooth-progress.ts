import { useLayoutEffect, useEffect, useSyncExternalStore } from 'react';
import { useStore } from '@xyflow/react';
import {
  GRAPH_MIN_Y,
  GRAPH_MAX_Y,
  VIEWPORT_PAD_TOP,
  clamp,
  SMOOTH_LERP,
} from './constants';

let _smoothProgress = 0;
let _targetProgress = 0;
let _rafId = 0;
const _smoothSubs = new Set<() => void>();

function _notifySmooth() {
  for (const fn of _smoothSubs) fn();
}

function _smoothTick() {
  const d = _targetProgress - _smoothProgress;
  if (Math.abs(d) < 0.0005) {
    _smoothProgress = _targetProgress;
    _rafId = 0;
    _notifySmooth();
    return;
  }
  if (_targetProgress >= 0.999) {
    _smoothProgress = 1;
    _rafId = 0;
    _notifySmooth();
    return;
  }
  _smoothProgress += d * SMOOTH_LERP;
  _notifySmooth();
  _rafId = requestAnimationFrame(_smoothTick);
}

function _setSmoothTarget(v: number) {
  _targetProgress = v;
  if (!_rafId) _rafId = requestAnimationFrame(_smoothTick);
}

/** Сырой прогресс из viewport (обновляется рывками на wheel) */
export function useRawProgress(): number {
  const transform = useStore((s) => s.transform);
  const containerH = useStore((s) => s.height);
  const [, ty, zoom] = transform;
  const yTop = -GRAPH_MIN_Y * zoom + VIEWPORT_PAD_TOP;
  const yBottom = -GRAPH_MAX_Y * zoom + containerH;
  const range = yTop - yBottom;
  return range > 0 ? clamp((yTop - ty) / range, 0, 1) : 0;
}

/** Сглаженный прогресс (0..1), подписка — ререндер при изменении */
export function useSmoothProgress(): number {
  return useSyncExternalStore(
    (cb) => {
      _smoothSubs.add(cb);
      return () => {
        _smoothSubs.delete(cb);
      };
    },
    () => _smoothProgress,
    () => _smoothProgress,
  );
}

/** Текущий сглаженный прогресс без подписки (для handleNodeClick) */
export function getSmoothProgress(): number {
  return _smoothProgress;
}

/** Драйвер: синхронизирует сырой прогресс viewport с RAF-сглаживанием. Рендерить внутри ReactFlow. */
export function SmoothProgressDriver() {
  const raw = useRawProgress();
  useLayoutEffect(() => {
    _setSmoothTarget(raw);
  }, [raw]);
  useEffect(
    () => () => {
      if (_rafId) cancelAnimationFrame(_rafId);
      _rafId = 0;
    },
    [],
  );
  return null;
}
