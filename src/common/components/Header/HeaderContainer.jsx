const HeaderContainer = ({ children, className = "" }) => {
    return (
      <div className={`ml-5 flex items-center pb-1 mb-5 border-b border-black w-[350px] ${className}`}>
        {children}
      </div>
    );
  };
  
  export default HeaderContainer;
  