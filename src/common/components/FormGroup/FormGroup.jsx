const FormGroup = ({ children, className = "" }) => {
    return <div className={`mb-[15px] flex items-center ${className}`}>{children}</div>;
  };
  
  export default FormGroup;
  