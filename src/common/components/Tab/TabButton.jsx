const TabButton = ({ children, active, className = "", ...props }) => {
    return (
      <div
        className={`
          py-3 text-xl font-bold text-center cursor-pointer border border-gray-300 w-1/2 
          ${active ? "bg-[#005F73] text-white" : "bg-white text-black"} 
          ${className}
        `}
        {...props}
      >
        {children}
      </div>
    );
  };
  
  export default TabButton;
  