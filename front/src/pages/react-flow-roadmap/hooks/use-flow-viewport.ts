import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import type { ReactFlowInstance } from '@xyflow/react';
import {
  GRAPH_MIN_Y,
  GRAPH_MAX_Y,
  VIEWPORT_PAD_TOP,
  clamp,
  SCROLL_SPEED,
  SMOOTH_FACTOR,
} from '../model/constants';

export function useFlowViewport() {
  const [ready, setReady] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const flowInstanceRef = useRef<ReactFlowInstance | null>(null);
  const viewportXRef = useRef(0);
  const zoomRef = useRef(1);
  const targetYRef = useRef(0);
  const currentYRef = useRef(0);
  const minViewportYRef = useRef(0);
  const maxViewportYRef = useRef(0);
  const rafIdRef = useRef<number>(0);
  const animatingRef = useRef(false);

  const graphExtent = useMemo(
    (): [[number, number], [number, number]] => [
      [-Infinity, GRAPH_MIN_Y - 20],
      [Infinity, GRAPH_MAX_Y + 20],
    ],
    [],
  );

  const onInit = useCallback((instance: ReactFlowInstance) => {
    flowInstanceRef.current = instance;
    const adjust = () => {
      const allNodes = instance.getNodes();
      const container = containerRef.current;
      if (!allNodes.length || !container) return;

      let minX = Infinity,
        maxX = -Infinity,
        minY = Infinity;
      for (const n of allNodes) {
        const w = n.measured?.width ?? (n.type === 'topicNode' ? 250 : 400);
        const h = n.measured?.height ?? (n.type === 'topicNode' ? 50 : 40);
        const left = n.position.x - w / 2;
        const right = n.position.x + w / 2;
        const top = n.position.y - h / 2;
        minX = Math.min(minX, left);
        maxX = Math.max(maxX, right);
        minY = Math.min(minY, top);
      }

      const cw = container.clientWidth;
      const ch = container.clientHeight;
      const padX = 20;
      // Center the "main column" (topics with x=0) in the container.
      // The overall bounds can be asymmetric because subtopics alternate left/right.
      const centerX = 0;
      const halfWidth = Math.max(Math.abs(minX - centerX), Math.abs(maxX - centerX)) || 1;
      const graphWidth = halfWidth * 2;
      const zoom = (cw - padX * 2) / graphWidth;
      const initialX = cw / 2 - centerX * zoom;
      const initialY = -minY * zoom + VIEWPORT_PAD_TOP;

      viewportXRef.current = initialX;
      zoomRef.current = zoom;
      currentYRef.current = initialY;
      targetYRef.current = initialY;
      maxViewportYRef.current = -GRAPH_MIN_Y * zoom + VIEWPORT_PAD_TOP;
      minViewportYRef.current = ch - GRAPH_MAX_Y * zoom;

      instance.setViewport({ x: initialX, y: initialY, zoom });
      setReady(true);
    };

    setTimeout(adjust, 50);
  }, []);

  const tick = useCallback(() => {
    const instance = flowInstanceRef.current;
    if (!instance) {
      animatingRef.current = false;
      rafIdRef.current = 0;
      return;
    }

    const minY = minViewportYRef.current;
    const maxY = maxViewportYRef.current;
    const targetY = clamp(targetYRef.current, minY, maxY);
    const currentY = currentYRef.current;
    const diff = targetY - currentY;

    if (Math.abs(diff) > 0.5) {
      currentYRef.current = clamp(currentY + diff * SMOOTH_FACTOR, minY, maxY);
      instance.setViewport({
        x: viewportXRef.current,
        y: currentYRef.current,
        zoom: zoomRef.current,
      });
      rafIdRef.current = requestAnimationFrame(tick);
      return;
    }

    // Snap to target and stop animating
    currentYRef.current = targetY;
    animatingRef.current = false;
    rafIdRef.current = 0;
  }, []);

  const startTick = useCallback(() => {
    if (animatingRef.current) return;
    animatingRef.current = true;
    rafIdRef.current = requestAnimationFrame(tick);
  }, [tick]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !ready) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const minY = minViewportYRef.current;
      const maxY = maxViewportYRef.current;
      targetYRef.current = clamp(targetYRef.current - e.deltaY * SCROLL_SPEED, minY, maxY);
      startTick();
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [ready, startTick]);

  useEffect(() => {
    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = 0;
      animatingRef.current = false;
    };
  }, []);

  return { containerRef, onInit, graphExtent, ready };
}
