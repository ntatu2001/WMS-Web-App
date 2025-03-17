const TableHeader = ({ children, className = "" }) => {
    return (
      <th className={`border-b border-[#ddd] px-2 py-3 text-center font-bold text-[#333] text-sm ${className}`}>
        {children}
      </th>
    );
  };
  
  export default TableHeader;
  