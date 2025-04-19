// import React from 'react';
// import { useLocation } from 'react-router-dom';
// import MenuItem from '../MenuItem/MenuItem';
// import clsx from 'clsx';
// import styles from './Sidebar.module.scss';
// import BKlogo from '../../../assets/bk_logo.png';
// // Import các icon
// import { AiOutlineSetting, AiOutlineHome, AiOutlineDatabase, AiOutlineImport, 
//          AiOutlineExport, AiOutlineCheckSquare, AiOutlineHistory, 
//          AiOutlineUnorderedList } from 'react-icons/ai';

// const Sidebar = () => {
//   const location = useLocation();
  
//   const menuItems = [
//     { id: 1, title: 'Tổng quan', icon: <AiOutlineHome />, path: '/dashboard' },
//     { id: 2, title: 'Lưu trữ', icon: <AiOutlineDatabase />, path: '/storage' },
//     { id: 3, title: 'Nhập kho', icon: <AiOutlineImport />, path: '/goodreceipt' },
//     { id: 4, title: 'Xuất kho', icon: <AiOutlineExport />, path: '/goodissue' },
//     { id: 5, title: 'Kiểm kê', icon: <AiOutlineCheckSquare />, path: '/inventory' },
//     { id: 6, title: 'Lịch sử', icon: <AiOutlineHistory />, path: '/history' },
//     { id: 7, title: 'Danh mục', icon: <AiOutlineUnorderedList />, path: '/catalogue' },
//     { id: 8, title: 'Cài đặt', icon: <AiOutlineSetting />, path: '/setting' },
//   ];

//   return (
//     <div className={clsx(styles.sidebar)}>
      
//       {/* Logo và tiêu đề */}
//       <div className={clsx(styles.sidebarHeader)}>
//         <div className={clsx(styles.sidebarLogo)}>
//           <img src={BKlogo} alt="BK Logo" className={clsx(styles.sidebarImg)} />
//         </div >
//         <h1 className={clsx(styles.sidebarTitle)}>WMS Portal</h1>
//       </div >
      
//       {/* Menu items */}
//       <nav className={clsx(styles.sidebarNav)}>
//         {menuItems.map((item) => (
//           <MenuItem 
//             key={item.id} 
//             to={item.path}
//             active={location.pathname === item.path ? 1 : 0}
//           >
//             <span className={clsx(styles.sidebarIcon)}>{item.icon}</span>
//             <span>{item.title}</span>
//           </MenuItem>
//         ))}
//       </nav>
//     </div>
//   );
// };

// export default Sidebar;