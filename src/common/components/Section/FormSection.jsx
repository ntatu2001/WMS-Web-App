const FormSection = ({ className = "", children }) => {
    return (
      <div className={`flex-1 border-b border-gray-300 shadow-md h-1/2 p-5 relative ${className}`}>
        {children}
      </div>
    );
  };
  
  export default FormSection;
  