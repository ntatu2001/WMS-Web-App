const SectionTitle = ({ children, className = "" }) => {
    return (
      <h2 className={`text-center text-xl font-bold mb-5 text-[#333] ${className}`}>
        {children}
      </h2>
    );
  };
  
  export default SectionTitle;
  