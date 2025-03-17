import React from 'react';
import Sidebar from '../Sidebar/Sidebar.jsx';
import { Outlet } from 'react-router-dom';

const MainLayout = () => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 p-6 bg-[#f5f5f5] min-h-screen overflow-y-auto">
        <Outlet />
      </main>
    </div >
  );
};

export default MainLayout; 