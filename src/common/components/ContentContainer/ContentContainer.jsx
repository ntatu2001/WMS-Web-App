const ContentContainer = ({ children, className = "" }) => {
    return (
      <div
        className={`w-[98%] bg-white flex p-5 ml-5 shadow-md ${className}`}
      >
        {children}
      </div>
    );
  };
  
  export default ContentContainer;
  