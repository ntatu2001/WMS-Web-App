import clsx from 'clsx';
import styles from './Header.module.scss';

const HeaderContainer = ({ children, className = "" }) => {
    return (
      <div className={clsx(styles.headerContainer, className)}>
        {children}
      </div>
    );
  };
  
  export default HeaderContainer;
  