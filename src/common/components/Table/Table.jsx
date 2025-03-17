const Table = ({ children, className = "" }) => {
    return (
      <table className={`w-full border-collapse shadow-md text-xs ${className}`}>
        {children}
      </table>
    );
  };
  
  export default Table;
  