const HeaderItem = ({ children, className = "" }) => {
    return <div className={`text-xl font-bold text-black ${className}`}>{children}</div>;
  };
  
  export default HeaderItem;
  