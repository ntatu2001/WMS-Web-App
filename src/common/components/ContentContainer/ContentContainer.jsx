import clsx from 'clsx';
import styles from './ContentContainer.module.scss'
const ContentContainer = ({ children, className = "" }) => {
    return (
      <div
        className={clsx(styles.contentContainer, className)}
      >
        {children}
      </div>
    );
  };
  
  export default ContentContainer;
  