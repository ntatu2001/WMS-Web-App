# Role Authorization Requirements — hướng dẫn cho Backend Developer

> Tài liệu này liệt kê **role tối thiểu cần thiết cho từng API endpoint** của `WMS.Practice.APIs`, dựa trên yêu cầu phân quyền UI/UX mới ở Frontend (ReactJS). Đọc kèm [`Authentication_Authorization_Guide.md`](./Authentication_Authorization_Guide.md) (cơ chế JWT, 3 role `Admin`/`Manager`/`Staff`) và [`API_Guide_For_Frontend.md`](./API_Guide_For_Frontend.md) (chi tiết từng API).
>
> Cập nhật lần cuối: 2026-07-21.

---

## 1. Bối cảnh — quy tắc phân quyền theo trang FE

Frontend đã ẩn/chặn các trang sau theo role (ở tầng route + UI), nhưng **Backend cần tự bảo vệ dữ liệu ở tầng API** vì FE chỉ kiểm soát được hành vi qua giao diện, không ngăn được request gọi trực tiếp (Postman/Swagger/script...):

| Trang FE | Route | Role được phép |
|---|---|---|
| Tổng quan | `/dashboard` | `Admin` |
| Lưu trữ | `/storage` | `Manager`, `Admin` |
| Nhập kho | `/goodreceipt` | Tất cả role (nhưng `Staff` chỉ thấy tab "Tạo phiếu nhập kho"; `Manager`/`Admin` thấy thêm "Nhập kho chưa hoàn thành" + "Quản lý nhập kho") |
| Xuất kho | `/goodissue` | Tất cả role (tương tự Nhập kho, thay "nhập" bằng "xuất") |
| Kiểm kê | `/inventory` | Tất cả role |
| Lịch sử | `/history` | `Manager`, `Admin` |
| Danh mục | `/catalogue` | `Manager`, `Admin` — trong đó chức năng **"Tạo mới"** (sản phẩm/nhân viên/vị trí lưu trữ) chỉ dành riêng cho `Admin`; `Manager` chỉ được **"Tìm kiếm"** |
| Cài đặt → Quản lý tài khoản | `/setting/users` | `Admin` (đã áp dụng từ trước, `POST Auth/CreateUser`) |

**Nguyên tắc quan trọng khi áp dụng**: nhiều endpoint được **dùng chung** bởi cả trang bị giới hạn (vd. Lưu trữ, Danh mục) lẫn trang mở cho `Staff` (vd. Nhập kho, Xuất kho, Kiểm kê). Nếu khoá những endpoint dùng chung này theo role của trang giới hạn, sẽ **làm hỏng** luồng "Tạo phiếu nhập/xuất kho"/"Kiểm kê" của `Staff`. Vì vậy endpoint được chia làm 3 nhóm rõ ràng ở mục 2 — chỉ nhóm A và B nên áp role, nhóm C **giữ nguyên** (chỉ cần đăng nhập, không phân biệt role).

---

## 2. Phân loại endpoint theo role tối thiểu

### Nhóm A — Chỉ `Admin`

Các endpoint ghi dữ liệu (create) chỉ được gọi từ chức năng "Tạo mới" trong trang Danh mục (Admin-only theo yêu cầu), và các endpoint Overview (nếu/khi được triển khai) phục vụ riêng trang Tổng quan:

| Method | Endpoint | Trang FE gọi |
|---|---|---|
| POST | `/WarehouseAPI/Material/CreateMaterial` | Danh mục → Tạo mới sản phẩm |
| POST | `/WarehouseAPI/Employee/CreateNewEmployee` | Danh mục → Tạo mới nhân viên |
| POST | `/WarehouseAPI/Location/CreateNewLocation` | Danh mục → Tạo mới vị trí lưu trữ |
| GET | `/WarehouseAPI/Overview/GetInventoryActivityStats` | Tổng quan (⚠ xem ghi chú bên dưới) |
| GET | `/WarehouseAPI/Overview/GetWarehouseInventoryMovementStats` | Tổng quan (⚠ xem ghi chú bên dưới) |

⚠️ **Ghi chú về Overview**: theo `API_Guide_For_Frontend.md`, controller `Overview` hiện **không tồn tại** trong danh sách API đã triển khai — Frontend vẫn gọi 2 endpoint trên nhưng trang Tổng quan hiện không hoạt động (chờ Backend triển khai). Ghi vào đây để nếu/khi Backend làm `OverviewController`, áp luôn role `Admin` ngay từ đầu.

### Nhóm B — `Manager` hoặc `Admin`

Các endpoint này, theo khảo sát code Frontend hiện tại, **chỉ được gọi từ các trang/tab đã giới hạn Manager+Admin** (Lưu trữ, Lịch sử, Danh mục → Tìm kiếm, và các tab "chưa hoàn thành"/"Quản lý" của Nhập kho & Xuất kho) — an toàn để áp role mà không ảnh hưởng luồng của `Staff`:

| Method | Endpoint | Trang FE gọi |
|---|---|---|
| GET | `/WarehouseAPI/Location/GetInforByLocationId/{locationId}` | Lưu trữ |
| GET | `/WarehouseAPI/Location/GetLocationsByWarehouseId/{warehouseId}` | Lưu trữ |
| GET | `/WarehouseAPI/Location/GetStockLocationHistoriesByLocationId` | Lưu trữ (Chi tiết vị trí) |
| GET | `/WarehouseAPI/Warehouse/GetWarehouseIdByWarehouseName/{warehouseName}` | Lưu trữ |
| GET | `/WarehouseAPI/Location/GetLocationById/{locationId}` | Danh mục → Tìm kiếm vị trí lưu trữ |
| GET | `/WarehouseAPI/MaterialClass/GetAllMaterialClass` | Danh mục → Tạo mới/Tìm kiếm sản phẩm (dropdown loại sản phẩm) |
| GET | `/WarehouseAPI/InventoryLog/GetLotAdjustmentsTracking` | Lịch sử → Lịch sử kiểm kê |
| GET | `/WarehouseAPI/InventoryLog/GetAllReceiptLotsTracking` | Lịch sử → Lịch sử nhập kho |
| GET | `/WarehouseAPI/InventoryLog/GetAllIssueLotsTracking` | Lịch sử → Lịch sử xuất kho |
| GET | `/WarehouseAPI/InventoryReceiptLot/GetReceiptLotByNotDone` | Nhập kho → tab "Nhập kho chưa hoàn thành" |
| PUT | `/WarehouseAPI/InventoryReceiptLot/UpdateReceiptLotStatus` | Nhập kho → tab "Quản lý nhập kho" |
| PUT | `/WarehouseAPI/InventoryReceiptSublot/UpdateReceiptSublot` | Nhập kho → tab "Nhập kho chưa hoàn thành" |
| GET | `/WarehouseAPI/InventoryReceiptEntry/GetAllReceiptEntries` | Nhập kho → tab "Quản lý nhập kho" |
| GET | `/WarehouseAPI/InventoryReceiptEntry/GetReceiptEntryById/{id}` | Nhập kho → tab "Quản lý nhập kho" |
| GET | `/WarehouseAPI/InventoryIssueLot/GetAllIssueLots` | Xuất kho → tab "Quản lý xuất kho" |
| GET | `/WarehouseAPI/InventoryIssueLot/GetIssueLotsNotDone` | Xuất kho → tab "Xuất kho chưa hoàn thành" |
| PUT | `/WarehouseAPI/InventoryIssueLot/UpdateIssueLotStatus` | Xuất kho → tab "Xuất kho chưa hoàn thành"/"Quản lý xuất kho" |
| PUT | `/WarehouseAPI/InventoryIssueSubLot/UpdateIssueSubLot` | Xuất kho → tab "Xuất kho chưa hoàn thành" |
| GET | `/WarehouseAPI/InventoryIssueEntry/GetAllIssueEntries` | Xuất kho → tab "Quản lý xuất kho" |
| GET | `/WarehouseAPI/InventoryIssueEntry/GetIssueEntryById/{id}` | Xuất kho → tab "Xuất kho chưa hoàn thành"/"Quản lý xuất kho" |
| GET | `ReceiptScheduling/GetReceiptDetailScheduling`, `GetReceiptLayoutScheduling` | Nhập kho → tab "Nhập kho chưa hoàn thành" (sơ đồ phân bổ) |
| GET | `IssueScheduling/GetIssueDetailScheduling`, `GetIssueLayoutScheduling` | Xuất kho → tab "Xuất kho chưa hoàn thành" (sơ đồ phân bổ) |

⚠️ **Ghi chú về `ReceiptScheduling`/`IssueScheduling`**: 2 endpoint này nằm trên **service SLAP Scheduling riêng** (base URL khác với `WarehouseAPI`, xem `API_Guide_For_Frontend.md` mục 1), không phải cùng backend `WMS.Practice.APIs`. Frontend hiện **chưa gắn JWT Authorization header** khi gọi service này. Nếu muốn áp role ở đây, cần phối hợp để Frontend bổ sung gắn token trước — **việc này nằm ngoài phạm vi đợt cập nhật Frontend hiện tại**, chỉ ghi chú lại để theo dõi.

### Nhóm C — ⚠️ Dùng chung, KHÔNG được giới hạn theo Manager/Admin

Các endpoint dưới đây được gọi **cả từ trang mở cho `Staff`** (Tạo phiếu nhập/xuất kho, Kiểm kê) **lẫn** từ trang giới hạn Manager+Admin. Nếu áp role Manager/Admin vào đây sẽ làm **Staff không thể tạo phiếu nhập/xuất kho hoặc kiểm kê được nữa** — chỉ nên yêu cầu "đã đăng nhập" (JWT hợp lệ), không phân biệt role:

| Method | Endpoint | Lý do dùng chung |
|---|---|---|
| GET | `/WarehouseAPI/Warehouse/GetAllWarehouses` | Dùng ở Tạo phiếu Nhập/Xuất kho, Kiểm kê (Staff) VÀ Lưu trữ, Nhập/Xuất kho chưa hoàn thành (Manager/Admin) |
| GET | `/WarehouseAPI/Employee/GetAllEmployees` | Dùng ở Tạo phiếu Nhập/Xuất kho, Kiểm kê (Staff) VÀ Danh mục, Quản lý tài khoản (Manager/Admin) |
| GET | `/WarehouseAPI/Material/GetAllMaterials` | Dùng ở Tạo phiếu Nhập/Xuất kho (Staff) VÀ Danh mục → Tìm kiếm sản phẩm (Manager/Admin) |
| GET | `/WarehouseAPI/Material/GetMaterialById/{id}` | Dùng ở Kiểm kê (Staff) VÀ Danh mục → Tìm kiếm sản phẩm (Manager/Admin) |
| GET | `/WarehouseAPI/Material/GetMaterialsByWarehouseId/{id}` | Tạo phiếu Nhập kho (Staff) |
| GET | `/WarehouseAPI/Material/GetMaterialsByWarehouseIdAndMaterialLot/{id}` | Tạo phiếu Xuất kho (Staff) |
| GET | `/WarehouseAPI/Material/GetUnitByMaterialId/{id}` | Tạo phiếu Nhập/Xuất kho, Kiểm kê (Staff) |
| GET | `/WarehouseAPI/MaterialLot/GetAllMaterialLots`, `GetMaterialLotById`, `GetMaterialLotsByMaterialId`, `GetMaterialLotsByWarehouseId`, `GetQuantityByMaterialLotId` | Tạo phiếu Xuất kho, Kiểm kê (Staff) |
| GET | `/WarehouseAPI/MaterialSubLot/GetMaterialSubLotsByLotNumber/{id}` | Kiểm kê (Staff) |
| PUT | `/WarehouseAPI/MaterialSubLot/UpdateMaterialSubLot` | Kiểm kê → duyệt kiểm kê (mọi role) |
| POST | `/WarehouseAPI/InventoryReceipt/CreateReceipt` | Tạo phiếu nhập kho (Staff) |
| GET | `/WarehouseAPI/InventoryReceiptLot/GetAllReceiptLots` | Tạo phiếu nhập kho — kiểm tra trùng mã lô (Staff) VÀ tab "Nhập kho chưa hoàn thành" (Manager/Admin) |
| POST | `/WarehouseAPI/InventoryIssue/CreateInventoryIssue` | Tạo phiếu xuất kho (Staff) |
| POST | `/WarehouseAPI/StockTake/CreateNewStockTake` | Kiểm kê — tạo yêu cầu kiểm kê (mọi role) |
| POST, PUT, DELETE | `/WarehouseAPI/Auth/Login`, `/Auth/Refresh`, `/Auth/Logout` | Public — không cần token/role (đã đúng theo `Authentication_Authorization_Guide.md`) |

---

## 3. Không thay đổi

- `POST /WarehouseAPI/Auth/CreateUser` — đã là `Admin`-only từ trước, giữ nguyên.
- Mọi endpoint không được liệt kê ở mục 2 (vd. `Customer`, `Supplier`, `MaterialClass` CRUD ngoài phần đã nêu...) — Frontend hiện chưa có yêu cầu phân quyền riêng, chỉ cần theo quy tắc chung hiện có ("đăng nhập là gọi được", theo `Authentication_Authorization_Guide.md` mục 4).

---

## 4. Checklist cho Backend Developer

- [ ] Áp `[Authorize(Roles = "Admin")]` cho các endpoint ở **Nhóm A**.
- [ ] Áp `[Authorize(Roles = "Manager,Admin")]` cho các endpoint ở **Nhóm B** (trừ `ReceiptScheduling`/`IssueScheduling` — cần trao đổi thêm với FE trước khi áp, xem ghi chú mục 2).
- [ ] **Không** thêm role-check cho các endpoint ở **Nhóm C** — giữ nguyên "chỉ cần đăng nhập" như hiện tại.
- [ ] Trả về `401`/`403` không kèm body (đúng convention hiện có của `CreateUser`, xem `Authentication_Authorization_Guide.md` mục 3.4/6) khi role không đủ, để Frontend xử lý nhất quán qua interceptor sẵn có.
- [ ] Test lại qua Swagger UI (`/swagger`) với JWT của cả 3 role trước khi bàn giao cho Frontend tích hợp/kiểm thử.
