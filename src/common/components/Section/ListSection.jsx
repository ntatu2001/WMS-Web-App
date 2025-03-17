const ListSection = ({ className = "", children }) => {
    return (
      <div className={`flex-[2] ml-5 border-b border-gray-300 shadow-md p-5 relative ${className}`}>
        {children}
      </div>
    );
  };
  
  export default ListSection;
  