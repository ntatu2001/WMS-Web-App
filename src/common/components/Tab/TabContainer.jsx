const TabContainer = ({ children, className = "" }) => {
    return <div className={`m-5 flex w-[98%] ${className}`}>{children}</div>;
  };
  
  export default TabContainer;
  