import {
  AiOutlineSetting,
  AiOutlineHome,
  AiOutlineDatabase,
  AiOutlineImport,
  AiOutlineExport,
  AiOutlineCheckSquare,
  AiOutlineHistory,
  AiOutlineUnorderedList,
  AiOutlineTeam,
  AiOutlineClose,
} from 'react-icons/ai';

// Nguồn dữ liệu menu dùng chung cho Sidebar và cho việc tính route mặc định theo role.
// Mục không có `roles` nghĩa là mở cho mọi role đã đăng nhập.
export const menuItems = [
  { id: 1, title: 'Tổng quan', icon: AiOutlineHome, path: '/dashboard', roles: ['Admin'] },
  { id: 2, title: 'Lưu trữ', icon: AiOutlineDatabase, path: '/storage', roles: ['Manager', 'Admin'] },
  { id: 3, title: 'Nhập kho', icon: AiOutlineImport, path: '/goodreceipt' },
  { id: 4, title: 'Xuất kho', icon: AiOutlineExport, path: '/goodissue' },
  { id: 5, title: 'Kiểm kê', icon: AiOutlineCheckSquare, path: '/inventory' },
  { id: 6, title: 'Lịch sử', icon: AiOutlineHistory, path: '/history', roles: ['Manager', 'Admin'] },
  { id: 7, title: 'Danh mục', icon: AiOutlineUnorderedList, path: '/catalogue', roles: ['Manager', 'Admin'] },
  {
    id: 8,
    title: 'Cài đặt',
    icon: AiOutlineSetting,
    path: '/setting',
    isParent: true,
    subItems: [
      // Tài khoản/Cập nhật tạm ẩn vì đăng nhập bằng JWT không còn trả về employeeId để tra cứu Employee
      { id: 8.1, title: 'Quản lý tài khoản', icon: AiOutlineTeam, path: '/setting/users', roles: ['Admin'] },
      { id: 8.2, title: 'Đăng xuất', icon: AiOutlineClose, path: '/setting/logout' },
    ],
  },
];

export const isMenuItemVisible = (item, roles) => !item.roles || item.roles.some((role) => roles.includes(role));

const FALLBACK_ROUTE = '/dashboard';

// Trả về route đầu tiên (theo thứ tự Sidebar) mà role hiện tại được phép xem — dùng làm trang mặc định
// sau đăng nhập, ở route "/", và cho nút "Về trang chủ" ở trang 403 (bỏ qua mục "Cài đặt", không phải trang nội dung).
export function getDefaultRouteForRoles(roles) {
  const firstAccessible = menuItems.find((item) => !item.isParent && isMenuItemVisible(item, roles));
  return firstAccessible ? firstAccessible.path : FALLBACK_ROUTE;
}
