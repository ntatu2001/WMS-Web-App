const TableCell = ({ children, className = "" }) => {
    return (
      <td className={`border-b border-[#ddd] px-2 py-2 font-medium text-center ${className}`}>
        {children}
      </td>
    );
  };
  
  export default TableCell;
  