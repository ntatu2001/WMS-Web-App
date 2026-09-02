import { useCallback, useRef } from 'react';
import clsx from 'clsx';
import styles from './Table.module.scss';

const MIN_COLUMN_WIDTH = 40;

const TableHeader = ({ children, className = "", style, resizable = true }) => {
    const thRef = useRef(null);
    const handleRef = useRef(null);

    // Shared by mouse and touch: applies the clamped width to the <th> as the
    // pointer moves, given the drag's starting X and starting width.
    const applyResize = useCallback((th, startX, startWidth, clientX) => {
      const newWidth = Math.max(MIN_COLUMN_WIDTH, startWidth + (clientX - startX));
      th.style.width = `${newWidth}px`;
      th.style.minWidth = `${newWidth}px`;
      th.style.maxWidth = `${newWidth}px`;
    }, []);

    const handleMouseDown = useCallback((e) => {
      e.preventDefault();
      e.stopPropagation();
      const th = thRef.current;
      if (!th) return;

      const startX = e.clientX;
      const startWidth = th.getBoundingClientRect().width;
      handleRef.current?.classList.add(styles.resizing);

      const handleMouseMove = (moveEvent) => {
        applyResize(th, startX, startWidth, moveEvent.clientX);
      };

      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        handleRef.current?.classList.remove(styles.resizing);
      };

      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }, [applyResize]);

    // Touch parity for tablet: same clamp logic, driven by the first touch point.
    const handleTouchStart = useCallback((e) => {
      e.stopPropagation();
      const th = thRef.current;
      const touch = e.touches[0];
      if (!th || !touch) return;

      const startX = touch.clientX;
      const startWidth = th.getBoundingClientRect().width;
      handleRef.current?.classList.add(styles.resizing);

      const handleTouchMove = (moveEvent) => {
        const moveTouch = moveEvent.touches[0];
        if (!moveTouch) return;
        applyResize(th, startX, startWidth, moveTouch.clientX);
      };

      const handleTouchEnd = () => {
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
        document.removeEventListener('touchcancel', handleTouchEnd);
        handleRef.current?.classList.remove(styles.resizing);
      };

      document.addEventListener('touchmove', handleTouchMove, { passive: true });
      document.addEventListener('touchend', handleTouchEnd);
      document.addEventListener('touchcancel', handleTouchEnd);
    }, [applyResize]);

    return (
      <th ref={thRef} className={clsx(styles.tableHeader, className)} style={style}>
        {children}
        {resizable && (
          <span
            ref={handleRef}
            className={styles.resizeHandle}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onClick={(e) => e.stopPropagation()}
          />
        )}
      </th>
    );
  };

  export default TableHeader;
