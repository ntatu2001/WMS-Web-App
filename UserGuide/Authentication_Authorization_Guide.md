# Authentication & Authorization Guide — WMS.Backend.Practice

> Tài liệu này giải thích cơ chế Authentication/Authorization vừa được bổ sung vào backend `WMS.Practice.APIs`, và hướng dẫn đội Frontend (ReactJS) tích hợp đăng nhập, gắn token, xử lý phân quyền theo role.
>
> Đọc kèm [`API_Guide_For_Frontend.md`](./API_Guide_For_Frontend.md) để biết chi tiết các API nghiệp vụ khác (Location, Material, Inventory...) — **lưu ý**: mục "Authentication/Authorization" trong file đó đã lỗi thời, quy tắc đúng là tài liệu này.
>
> Cập nhật lần cuối: 2026-07-20, dựa trên nhánh `main`.

---

## 1. Tổng quan cơ chế

| Mục | Giá trị |
|---|---|
| Cơ chế xác thực | JWT Bearer Access Token + Refresh Token |
| User store | ASP.NET Core Identity (bảng `AspNetUsers`, `AspNetRoles`...) |
| Phân quyền | Role-based (RBAC) — 3 role: `Admin`, `Manager`, `Staff` |
| Access Token hết hạn sau | 30 phút (`Jwt:AccessTokenExpiryMinutes` trong `appsettings.json`) |
| Refresh Token hết hạn sau | 7 ngày (`Jwt:RefreshTokenExpiryDays`), tự động rotate mỗi lần dùng |
| Tạo tài khoản mới | **Chỉ Admin** được gọi API tạo user — **không có** endpoint tự đăng ký (self-register) |
| Áp dụng cho endpoint nào | **Toàn bộ API** (tất cả controller trong [`API_Guide_For_Frontend.md`](./API_Guide_For_Frontend.md)) đều yêu cầu đăng nhập, trừ 3 endpoint `Login`/`Refresh`/`Logout` |

Kể từ khi tính năng này được triển khai, **mọi request tới API (trừ Login/Refresh/Logout) đều phải đính kèm access token hợp lệ**, nếu không sẽ nhận về `401 Unauthorized`.

---

## 2. Luồng hoạt động

```
1. FE gọi POST /WarehouseAPI/Auth/Login (username/password)
      ↓
2. BE trả về { accessToken, refreshToken, accessTokenExpiresAtUtc }
      ↓
3. FE lưu 2 token lại, gắn accessToken vào header Authorization cho MỌI request tiếp theo
      ↓
4. Khi accessToken hết hạn (API trả 401) → FE gọi POST /WarehouseAPI/Auth/Refresh với refreshToken cũ
      ↓
5. BE trả về CẶP TOKEN MỚI (accessToken mới + refreshToken mới), refreshToken cũ bị vô hiệu hoá
      ↓
6. FE lưu lại cặp token mới, retry lại request bị 401 lúc nãy
      ↓
7. Khi user đăng xuất → FE gọi POST /WarehouseAPI/Auth/Logout với refreshToken hiện tại, rồi xoá token khỏi FE
```

⚠️ **Refresh Token Rotation**: mỗi lần gọi `Refresh` thành công, refresh token cũ sẽ bị thu hồi (revoke) ngay lập tức và không thể dùng lại — BE luôn trả về refresh token **mới**. FE phải luôn cập nhật lại refresh token mới nhất sau mỗi lần refresh, nếu dùng refresh token cũ sẽ bị lỗi `InvalidRefreshToken`.

---

## 3. Chi tiết các API Auth — base: `/WarehouseAPI/Auth`

### 3.1. `POST /Login` — không cần token

**Request:**
```ts
{
  userName: string
  password: string
}
```

**Response `200 OK`:**
```ts
{
  accessToken: string
  refreshToken: string
  accessTokenExpiresAtUtc: string   // ISO 8601 DateTime (UTC)
  tokenType: "Bearer"
}
```

**Lỗi `400`:** sai username/password → `{ code: "InvalidCredentials", message: "The username or password is incorrect.", detail: "" }`

---

### 3.2. `POST /Refresh` — không cần Authorization header, chỉ cần refresh token trong body

**Request:**
```ts
{
  refreshToken: string
}
```

**Response `200 OK`:** giống hệt cấu trúc response của `Login` (cặp token hoàn toàn mới).

**Lỗi `400`:** refresh token không tồn tại / đã hết hạn / đã bị revoke (dùng lại token cũ) → `{ code: "InvalidRefreshToken", message: "The refresh token is invalid, expired or revoked.", detail: "" }`. Khi gặp lỗi này, FE phải coi như phiên đăng nhập đã hết, **buộc đăng nhập lại** (không thể refresh tiếp).

---

### 3.3. `POST /Logout` — không cần Authorization header, chỉ cần refresh token trong body

**Request:**
```ts
{
  refreshToken: string
}
```

**Response `200 OK`:** `true`

Endpoint này chỉ thu hồi **refresh token**. Access token đã phát hành trước đó (nếu FE có lỡ giữ lại) vẫn còn hiệu lực kỹ thuật cho tới khi hết hạn tự nhiên (tối đa 30 phút) — vì JWT là stateless, server không "hủy" được access token đã ký. FE **phải tự xoá access token khỏi bộ nhớ/storage** khi logout để tránh dùng nhầm.

---

### 3.4. `POST /CreateUser` — **chỉ role `Admin`** được gọi, cần Authorization header

**Request:**
```ts
{
  userName: string
  email: string
  password: string
  roles: string[]        // vd: ["Staff"], ["Manager"], có thể gán nhiều role cùng lúc
  employeeId?: string     // optional — liên kết tài khoản với 1 Employee đã tồn tại trong hệ thống
}
```

**Response `200 OK`:**
```ts
{
  userId: string
  userName: string
  roles: string[]
  employeeId?: string
}
```

**Lỗi có thể gặp:**

| Tình huống | HTTP | `code` |
|---|---|---|
| Không đính kèm token, hoặc token hết hạn/sai | `401` | *(không có body `ErrorResponse`, đây là lỗi ở tầng middleware, không tới được Controller)* |
| Có token hợp lệ nhưng **không phải role Admin** | `403` | *(không có body `ErrorResponse`)* |
| `employeeId` không tồn tại | `400` | `NotFound.Employee` |
| Role trong `roles` không tồn tại (chỉ có `Admin`/`Manager`/`Staff`) | `400` | `NotFound.AppRole` |
| Username/email trùng, password không đạt yêu cầu (tối thiểu 8 ký tự) | `400` | `IdentityOperationFailed` — `detail` là mảng string mô tả từng lỗi |

⚠️ Đây là endpoint **duy nhất** để tạo tài khoản mới. Không có form đăng ký công khai — về mặt sản phẩm, chỉ Admin (qua màn hình quản trị) mới tạo được tài khoản cho nhân viên khác.

---

## 4. Cách gắn token vào các API nghiệp vụ khác

Mọi endpoint còn lại (Employee, Warehouse, Material, InventoryReceipt, ...) đều yêu cầu header:

```
Authorization: Bearer <accessToken>
```

**Ví dụ:**
```
GET /WarehouseAPI/Employee/GetAllEmployees
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Nếu thiếu header này hoặc token hết hạn/sai chữ ký → **`401 Unauthorized`** (không có body `ErrorResponse` kiểu JSON như các lỗi nghiệp vụ khác — response rỗng, chỉ có status code). Hiện tại **không có** phân quyền chi tiết theo role cho các API nghiệp vụ này (chỉ cần đăng nhập là gọi được, không phân biệt Admin/Manager/Staff) — trừ riêng `CreateUser` (mục 3.4) yêu cầu đúng role `Admin`.

---

## 5. Hướng dẫn tích hợp vào ReactJS

### 5.1. Lưu trữ token

Backend trả token qua JSON body (không set cookie), nên việc lưu trữ hoàn toàn do FE quyết định. Gợi ý đơn giản cho project này:

- `accessToken`: lưu trong bộ nhớ (state/context), **không cần** localStorage vì thời gian sống ngắn (30 phút) — mất khi F5 thì tự động refresh lại từ `refreshToken`.
- `refreshToken`: lưu `localStorage` để giữ phiên đăng nhập qua các lần F5/đóng mở tab.

> ⚠️ Lưu ý bảo mật: lưu token trong `localStorage` có rủi ro bị đánh cắp qua XSS. Với project học tập/luyện tập thì chấp nhận được; nếu triển khai thật, nên cân nhắc lưu refresh token trong cookie `HttpOnly` (cần BE hỗ trợ thêm, hiện chưa có).

### 5.2. Axios instance tự động gắn token + tự động refresh khi hết hạn

```ts
// src/api/axiosClient.ts
import axios from "axios";

const BASE_URL = "http://localhost:5037"; // đổi theo môi trường

const axiosClient = axios.create({ baseURL: BASE_URL });

// ---- Gắn access token vào mọi request ----
axiosClient.interceptors.request.use((config) => {
  const accessToken = authStore.getAccessToken(); // đọc từ state/context của bạn
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// ---- Tự động refresh khi gặp 401, có hàng đợi tránh gọi refresh nhiều lần song song ----
let isRefreshing = false;
let pendingQueue: Array<(token: string) => void> = [];

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Đã có 1 request khác đang refresh — xếp hàng chờ token mới
      return new Promise((resolve) => {
        pendingQueue.push((newAccessToken: string) => {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          resolve(axiosClient(originalRequest));
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = authStore.getRefreshToken();
      const { data } = await axios.post(`${BASE_URL}/WarehouseAPI/Auth/Refresh`, {
        refreshToken,
      });

      authStore.setTokens(data.accessToken, data.refreshToken);

      pendingQueue.forEach((callback) => callback(data.accessToken));
      pendingQueue = [];

      originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
      return axiosClient(originalRequest);
    } catch (refreshError) {
      // Refresh token cũng hết hạn/không hợp lệ -> bắt buộc đăng nhập lại
      authStore.clearTokens();
      window.location.href = "/login";
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default axiosClient;
```

### 5.3. AuthContext quản lý trạng thái đăng nhập

```tsx
// src/contexts/AuthContext.tsx
import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import axiosClient from "../api/axiosClient";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  roles: string[];
  userName: string | null;
}

interface AuthContextValue extends AuthState {
  login: (userName: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Claim "role" trong JWT dùng URI đầy đủ của ClaimTypes.Role — không phải "role"
const ROLE_CLAIM = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";

function decodeRoles(accessToken: string): string[] {
  const payload = JSON.parse(atob(accessToken.split(".")[1]));
  const roleClaim = payload[ROLE_CLAIM];
  if (!roleClaim) return [];
  return Array.isArray(roleClaim) ? roleClaim : [roleClaim]; // 1 role -> string, nhiều role -> string[]
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    accessToken: null,
    refreshToken: localStorage.getItem("refreshToken"),
    roles: [],
    userName: null,
  });

  const login = useCallback(async (userName: string, password: string) => {
    const { data } = await axiosClient.post("/WarehouseAPI/Auth/Login", { userName, password });
    localStorage.setItem("refreshToken", data.refreshToken);
    setState({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      roles: decodeRoles(data.accessToken),
      userName,
    });
  }, []);

  const logout = useCallback(async () => {
    if (state.refreshToken) {
      await axiosClient.post("/WarehouseAPI/Auth/Logout", { refreshToken: state.refreshToken }).catch(() => {});
    }
    localStorage.removeItem("refreshToken");
    setState({ accessToken: null, refreshToken: null, roles: [], userName: null });
  }, [state.refreshToken]);

  const hasRole = useCallback((role: string) => state.roles.includes(role), [state.roles]);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
```

*(Trong `axiosClient.ts` ở mục 5.2, thay `authStore.getAccessToken()`/`setTokens()`/`clearTokens()` bằng cách đọc/ghi state của `AuthContext` này — ví dụ giữ token mới nhất trong một `ref` module-level để interceptor đọc được ngoài React component, hoặc dùng thư viện quản lý state như Zustand/Redux nếu dự án đã có sẵn.)*

### 5.4. Ẩn/hiện chức năng và chặn route theo role

```tsx
// src/components/RequireRole.tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export function RequireRole({ role, children }: { role: string; children: JSX.Element }) {
  const { accessToken, hasRole } = useAuth();

  if (!accessToken) return <Navigate to="/login" replace />;
  if (!hasRole(role)) return <Navigate to="/403" replace />;

  return children;
}
```

```tsx
// Ví dụ dùng trong router — chỉ Admin vào được trang quản lý user
<Route
  path="/admin/users"
  element={
    <RequireRole role="Admin">
      <UserManagementPage />
    </RequireRole>
  }
/>
```

Với các nút bấm/khu vực UI cần ẩn theo role (không phải cả trang), dùng trực tiếp `hasRole("Admin")` từ `useAuth()` để render có điều kiện, ví dụ nút "Tạo tài khoản mới" chỉ hiện với Admin.

---

## 6. Bảng lỗi liên quan đến Auth

| Tình huống | HTTP | `code` (nếu có body) |
|---|---|---|
| Không gắn header `Authorization`, hoặc token sai định dạng/hết hạn/sai chữ ký | `401` | *(không có body)* |
| Có token hợp lệ nhưng role không đủ quyền (hiện chỉ áp dụng cho `CreateUser`) | `403` | *(không có body)* |
| Sai username/password khi Login | `400` | `InvalidCredentials` |
| Refresh token sai/hết hạn/đã bị revoke | `400` | `InvalidRefreshToken` |
| Tạo user: `employeeId` không tồn tại | `400` | `NotFound.Employee` |
| Tạo user: role không tồn tại | `400` | `NotFound.AppRole` |
| Tạo user: username/email trùng, password yếu... | `400` | `IdentityOperationFailed` |

Lưu ý khác biệt so với các lỗi nghiệp vụ khác trong [`API_Guide_For_Frontend.md`](./API_Guide_For_Frontend.md) mục 2.2: **lỗi 401/403 không có body JSON** (đây là lỗi do middleware Authentication/Authorization chặn trước khi vào tới Controller/MediatR, nên `ErrorResponse` không được tạo ra). Chỉ các lỗi nghiệp vụ bên trong handler (Invalid credentials, Invalid refresh token, Identity operation...) mới trả `400` kèm body `ErrorResponse` như bảng trên.

---

## 7. Câu hỏi thường gặp

**Access token sống bao lâu, có cần tự động refresh liên tục không?**
30 phút. Không cần tự refresh theo lịch — chỉ cần bắt lỗi `401` ở interceptor (mục 5.2) và refresh "on demand" khi thực sự gặp lỗi.

**Vì sao gọi `Refresh` xong, `refreshToken` cũ dùng lại lại báo lỗi?**
Đây là chủ đích (refresh token rotation, chống replay attack) — mỗi lần refresh thành công, token cũ bị vô hiệu hoá ngay. FE **luôn phải lưu lại refresh token mới nhất** sau mỗi lần gọi `Refresh`.

**Có cần cấu hình CORS ở FE không?**
Không. Backend đã bật policy `AllowAll` (mọi origin/header/method) — không cần thêm gì.

**Muốn tạo tài khoản mới thì làm sao?**
Không có form tự đăng ký. Phải đăng nhập bằng tài khoản `Admin`, gọi `POST /WarehouseAPI/Auth/CreateUser` (mục 3.4).

**Vì sao đôi lúc tất cả token cũ đột nhiên không dùng được nữa dù chưa hết 30 phút?**
Nếu BE đổi `Jwt:SigningKey` trong `appsettings.json` (hoặc restart với key khác), toàn bộ access token đã phát hành trước đó sẽ mất hiệu lực ngay vì chữ ký không còn khớp — FE cần bắt `401` và điều hướng về trang đăng nhập.

---

## 8. Checklist tích hợp cho Frontend Developer

- [ ] Thêm màn hình Login gọi `POST /WarehouseAPI/Auth/Login`, lưu `accessToken`/`refreshToken`
- [ ] Tạo axios instance dùng chung, tự gắn header `Authorization: Bearer <accessToken>` cho mọi request (mục 5.2)
- [ ] Thêm interceptor tự động gọi `Refresh` khi gặp `401`, retry lại request gốc
- [ ] Khi `Refresh` cũng thất bại (`InvalidRefreshToken`) → xoá token, điều hướng về `/login`
- [ ] Thêm nút/luồng Logout gọi `POST /WarehouseAPI/Auth/Logout`, xoá token khỏi FE
- [ ] Với các trang/chức năng chỉ dành cho Admin (vd. quản lý user) → dùng `RequireRole`/kiểm tra `hasRole("Admin")` (mục 5.4)
- [ ] Không tự ý thêm form đăng ký công khai — mọi tài khoản phải qua `CreateUser` bởi Admin
- [ ] Kiểm tra lại toàn bộ API call cũ (trước khi có auth) — chắc chắn đã đi qua axios instance có gắn token, tránh gọi thẳng `fetch`/axios trần dẫn đến bị `401`
- [ ] Test lại toàn bộ luồng Login → gọi API → hết hạn token → auto refresh → Logout qua Swagger UI (`/swagger`) hoặc Postman trước khi tích hợp UI thật
