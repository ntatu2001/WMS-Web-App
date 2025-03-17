const Label = ({ className = "", children }) => {
    return <div className={`w-[40%] font-medium ${className}`}>{children}</div>;
  };
  
  export default Label;
  