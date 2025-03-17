const CreateButton = ({ children, onClick, className}) => {
    return (
      <button
        onClick={onClick}
        className={`"bg-[#003f5c] text-white border-none rounded-md px-2 py-1.5 text-xs cursor-pointer inline-flex items-center justify-center gap-1.5 ${className}"`}
      >
        {children}
      </button>
    );
  };
  export default CreateButton;
  