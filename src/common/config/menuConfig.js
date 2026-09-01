import {
  AiOutlineSetting,
  AiOutlineHome,
  AiOutlineDatabase,
  AiOutlineImport,
  AiOutlineExport,
  AiOutlineCheckSquare,
  AiOutlineHistory,
  AiOutlineUnorderedList,
  AiOutlineUserAdd,
  AiOutlineUser,
  AiOutlineLogout,
  AiOutlineBgColors,
} from 'react-icons/ai';

// Nguồn dữ liệu menu dùng chung cho Sidebar và cho việc tính route mặc định theo role.
// Mục không có `roles` nghĩa là mở cho mọi role đã đăng nhập.
// `titleKey` được Sidebar resolve qua i18n (useTranslation) — routing chỉ dùng `path`.
export const menuItems = [
  { id: 1, titleKey: 'menu.overview', icon: AiOutlineHome, path: '/dashboard', roles: ['Admin'] },
  { id: 2, titleKey: 'menu.storage', icon: AiOutlineDatabase, path: '/storage', roles: ['Manager', 'Admin'] },
  { id: 3, titleKey: 'menu.receipt', icon: AiOutlineImport, path: '/goodreceipt' },
  { id: 4, titleKey: 'menu.issue', icon: AiOutlineExport, path: '/goodissue' },
  { id: 5, titleKey: 'menu.inventory', icon: AiOutlineCheckSquare, path: '/inventory' },
  { id: 6, titleKey: 'menu.history', icon: AiOutlineHistory, path: '/history', roles: ['Manager', 'Admin'] },
  { id: 7, titleKey: 'menu.catalogue', icon: AiOutlineUnorderedList, path: '/catalogue', roles: ['Manager', 'Admin'] },
  {
    id: 8,
    titleKey: 'menu.settings',
    icon: AiOutlineSetting,
    path: '/setting',
    isParent: true,
    subItems: [
      { id: 8.1, titleKey: 'menu.createUser', icon: AiOutlineUserAdd, path: '/setting/users', roles: ['Admin'] },
      { id: 8.2, titleKey: 'menu.account', icon: AiOutlineUser, path: '/setting/account' },
      { id: 8.4, titleKey: 'menu.appearanceLanguage', icon: AiOutlineBgColors, path: '/setting/appearance' },
      { id: 8.3, titleKey: 'menu.logout', icon: AiOutlineLogout, path: '/setting/logout', danger: true },
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
