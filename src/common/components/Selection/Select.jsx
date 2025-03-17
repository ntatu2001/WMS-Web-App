const Select = ({ children, className = "", ...props }) => {
    return (
      <select
        className={`w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm appearance-none ${className}`}
        {...props}
      >
        {children}
      </select>
    );
  };
  
  export default Select;
  