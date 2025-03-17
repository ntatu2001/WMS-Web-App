const ActionButton = ({ children, onClick, className }) => {
    return (
      <button
        onClick={onClick}
        className={`bg-[#0288d1] text-white border-none rounded-md px-5 py-5 font-bold mt-5 cursor-pointer ${className}
        transition-colors duration-200 block mx-auto w-1/2 hover:bg-[#0277bd]`}
      >
        {children}
      </button>
    );
  };
  
  export default ActionButton;
  