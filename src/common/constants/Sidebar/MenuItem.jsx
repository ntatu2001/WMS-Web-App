import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const MenuItem = ({ to, children }) => {
  const location = useLocation();
  const [isActive, setIsActive] = useState(false);
  
  useEffect(() => {
    const active = location.pathname === to || 
                  (to !== '/' && location.pathname.startsWith(to));
    setIsActive(active);
  }, [location, to]);
  
  return (
    <Link
      to={to}
      className={`flex items-center px-4 py-4 font-bold text-xl transition-colors
      ${isActive 
        ? "bg-white text-black" 
        : "bg-transparent text-white hover:bg-white/10"}`}
    >
      {children}
    </Link>
  );
};

export default MenuItem;