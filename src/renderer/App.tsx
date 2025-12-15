import { Route, MemoryRouter as Router, Routes } from 'react-router';
import { useRef, useEffect } from 'react';

import './App.css';
import { Home, Settings } from './screens';
import { RENDERER_ROUTE } from '../constants';
import { AppLayout } from './layouts';

export default function App() {
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const rafId = useRef<number | null>(null);
  const pendingMove = useRef({ dx: 0, dy: 0, hasPending: false });

  useEffect(() => {
    const applyMove = () => {
      if (pendingMove.current.hasPending) {
        window.electron.ipcRenderer.move(
          pendingMove.current.dx,
          pendingMove.current.dy
        );
        pendingMove.current = { dx: 0, dy: 0, hasPending: false };
      }
      rafId.current = null;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging.current) {
        e.preventDefault();

        const dx = e.screenX - dragStart.current.x;
        const dy = e.screenY - dragStart.current.y;

        dragStart.current = { x: e.screenX, y: e.screenY };

        // Accumulate moves
        pendingMove.current.dx += dx;
        pendingMove.current.dy += dy;
        pendingMove.current.hasPending = true;

        // Schedule update using requestAnimationFrame
        if (rafId.current === null) {
          rafId.current = requestAnimationFrame(applyMove);
        }
      }
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      // Apply any pending move
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
        applyMove();
      }
    };

    document.addEventListener('mousemove', handleMouseMove, { capture: true });
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove, { capture: true });
      document.removeEventListener('mouseup', handleMouseUp);
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    dragStart.current = { x: e.screenX, y: e.screenY };
  };

  return (
    <div className="widget">
      <div
        className="drag-bar"
        onMouseDown={handleMouseDown}
      >
        <div className="drag-handle">
          <span className="drag-dots"></span>
          <span className="drag-dots"></span>
          <span className="drag-dots"></span>
        </div>
      </div>
      <Router>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route path={RENDERER_ROUTE.ROOT} element={<Home />} />
            <Route path={RENDERER_ROUTE.SETTINGS} element={<Settings />} />
          </Route>
        </Routes>
      </Router>
    </div>
  );
}
