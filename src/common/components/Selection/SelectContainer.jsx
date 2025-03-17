const SelectContainer = ({ children, className = "" }) => {
    return <div className={`relative flex-1 ${className}`}>{children}</div>;
  };
  
  export default SelectContainer;
  