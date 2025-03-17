const DropdownIcon = ({ className = "", children }) => {
    return (
      <div
        className={`absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${className}`}
      >
        {children}
      </div>
    );
  };
  
  export default DropdownIcon;
  