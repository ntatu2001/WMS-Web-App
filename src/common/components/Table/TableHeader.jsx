import clsx from 'clsx';
import styles from './Table.module.scss';

const TableHeader = ({ children, className = "" }) => {
    return (
      <th className={clsx(styles.tableHeader, className)}>
        {children}
      </th>
    );
  };
  
  export default TableHeader;
  