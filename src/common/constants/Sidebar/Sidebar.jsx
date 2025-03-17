import React from 'react';
import { useLocation } from 'react-router-dom';
import MenuItem from './MenuItem';

// Import các icon
import { AiOutlineHome, AiOutlineDatabase, AiOutlineImport, 
         AiOutlineExport, AiOutlineCheckSquare, AiOutlineHistory, 
         AiOutlineUnorderedList } from 'react-icons/ai';

const Sidebar = () => {
  const location = useLocation();
  
  const menuItems = [
    { id: 1, title: 'Tổng quan', icon: <AiOutlineHome />, path: '/dashboard' },
    { id: 2, title: 'Lưu trữ', icon: <AiOutlineDatabase />, path: '/storage' },
    { id: 3, title: 'Nhập kho', icon: <AiOutlineImport />, path: '/goodreceipt' },
    { id: 4, title: 'Xuất kho', icon: <AiOutlineExport />, path: '/goodissue' },
    { id: 5, title: 'Kiểm kê', icon: <AiOutlineCheckSquare />, path: '/inventory' },
    { id: 6, title: 'Lịch sử', icon: <AiOutlineHistory />, path: '/history' },
    { id: 7, title: 'Danh mục', icon: <AiOutlineUnorderedList />, path: '/catalogue' },
  ];

  return (
    <div className="h-screen w-[200px] bg-[#001f2f] text-white flex flex-col">
      
      {/* Logo và tiêu đề */}
      <div className="bg-[#001f2f] p-8 flex flex-col items-center justify-center">
        <div className="text-[#a887f3] text-[0.9rem] text-center mb-2">
          <img src="/bk_logo.png" alt="BK Logo" className="w-full h-auto" />
        </div >
        <h1 className="text-2xl font-bold text-center">WMS Portal</h1>
      </div >
      
      {/* Menu items */}
      <nav className="flex-1 bg-[#005F73]">
        {menuItems.map((item) => (
          <MenuItem 
            key={item.id} 
            to={item.path}
            active={location.pathname === item.path ? 1 : 0}
          >
            <span className="mr-3 text-[1.2rem] flex items-center">{item.icon}</span>
            <span>{item.title}</span>
          </MenuItem>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar; 