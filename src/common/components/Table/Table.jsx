import clsx from 'clsx';
import styles from './Table.module.scss';


const Table = ({ children, className = "" }) => {
    return (
      <table className={clsx(styles.table, className)}>
        {children}
      </table>
    );
  };
  
  export default Table;
  