import clsx from 'clsx';
import styles from './Table.module.scss';

const TableCell = ({ children, className = "" }) => {
    return (
      <td className={clsx(styles.tableCell, className)}>
        {children}
      </td>
    );
  };
  
  export default TableCell;
  