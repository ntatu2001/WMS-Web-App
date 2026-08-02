import { useCallback, useRef } from 'react';
import clsx from 'clsx';
import styles from './Table.module.scss';

const MIN_COLUMN_WIDTH = 40;

const TableHeader = ({ children, className = "", style, resizable = true }) => {
    const thRef = useRef(null);
    const handleRef = useRef(null);

    const handleMouseDown = useCallback((e) => {
      e.preventDefault();
      e.stopPropagation();
      const th = thRef.current;
      if (!th) return;

      const startX = e.clientX;
      const startWidth = th.getBoundingClientRect().width;
      handleRef.current?.classList.add(styles.resizing);

      const handleMouseMove = (moveEvent) => {
        const newWidth = Math.max(MIN_COLUMN_WIDTH, startWidth + (moveEvent.clientX - startX));
        th.style.width = `${newWidth}px`;
        th.style.minWidth = `${newWidth}px`;
        th.style.maxWidth = `${newWidth}px`;
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
    }, []);

    return (
      <th ref={thRef} className={clsx(styles.tableHeader, className)} style={style}>
        {children}
        {resizable && (
          <span
            ref={handleRef}
            className={styles.resizeHandle}
            onMouseDown={handleMouseDown}
            onClick={(e) => e.stopPropagation()}
          />
        )}
      </th>
    );
  };

  export default TableHeader;
