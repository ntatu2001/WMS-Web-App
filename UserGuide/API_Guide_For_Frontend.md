# API Guide cho Frontend Developer — WMS.Backend.Practice

> Tài liệu này liệt kê **toàn bộ API endpoint hiện có** trong backend `WMS.Practice.APIs`, kèm theo cách gọi, request body, response body để đội Frontend (ReactJS) điều chỉnh lại các API call cho phù hợp với backend hiện tại.
>
> Cập nhật lần cuối: 2026-07-19, dựa trên nhánh `main`.

---

## 1. Cấu hình chung

| Mục | Giá trị |
|---|---|
| Base URL (HTTP) | `http://localhost:5037` |
| Base URL (HTTPS) | `https://localhost:7066` |
| Route prefix của mọi controller | `/WarehouseAPI/{TenController}` |
| Swagger UI | `/swagger` (chỉ bật khi chạy ở môi trường Development, mở mặc định khi `dotnet run`) |
| Swagger JSON | `/swagger/v1/swagger.json` |
| CORS | Policy `AllowAll` — cho phép **mọi origin/header/method**, không cần cấu hình gì thêm ở FE |
| Authentication/Authorization | **Không có** — chưa có JWT/cookie/API key nào được cấu hình, không có `[Authorize]`. Mọi endpoint hiện đang public. FE **chưa cần** gắn access token vào header (sẽ cần bổ sung khi backend triển khai auth sau này) |
| API Versioning | Không có |
| Định dạng ngày giờ | `DateTime` chuẩn ISO 8601 khi serialize JSON |
| Enum | Serialize dưới dạng **string** (ví dụ `"Pending"`, `"Done"`), không phải số |

⚠️ Vì đây là project học tập/luyện tập, base URL, CORS và auth có thể thay đổi khi lên môi trường thật — cần xác nhận lại với BE trước khi build production.

---

## 2. Response Envelope & cách xử lý lỗi

### 2.1. Response thành công

**Không có envelope chung** (không có dạng `{ success, data, message }`). Mỗi endpoint trả thẳng:
- Một object DTO (ví dụ `LocationDTO`)
- Một mảng/list (`IEnumerable<T>` → JSON array)
- Một giá trị nguyên thủy (`bool`, `string`)
- Hoặc dạng phân trang `QueryResult<T>` (chỉ 2 endpoint dùng — xem mục 3)

Tất cả response thành công đều trả **HTTP 200 OK**.

### 2.2. Response lỗi

⚠️ **Quan trọng**: Backend **luôn trả HTTP 400 Bad Request cho MỌI loại lỗi**, kể cả "không tìm thấy record" (thường FE mong đợi 404) hay lỗi server (thường mong đợi 500). Không có phân biệt 404/409/500. FE **không thể dựa vào HTTP status code** để phân loại lỗi, mà phải đọc field `Code` trong body.

Cấu trúc lỗi (`ErrorResponse`):

```json
{
  "code": "string",
  "message": "string",
  "detail": { }
}
```

Bảng các loại lỗi thường gặp:

| Tình huống | `Code` | `Message` mẫu | `Detail` |
|---|---|---|---|
| Tạo record bị trùng khóa | `RecordDuplication.{EntityType}` | "The entity of type '{EntityType}' with ID '{EntityId}' already exists" | `{ entityType, entityId }` |
| Không tìm thấy record | `NotFound.{EntityType}` | "The entity of type {EntityType} with ID {EntityId} not found." | `{ entityType, entityId }` |
| Số lượng xuất kho vượt tồn kho | `InvalidProductQuantity` | "The quantity of ProductIssue cannot be greater than that of ProductInventory" | `{ itemId, unit, purchaseOrderNumber, productInventoryQuantity, productIssueQuantity }` |
| Item lot đã được xuất | `ExportedItemLot.{ItemLotId}` | "Itemlot with ID {ItemLotId} is exported" | `{ itemLotId }` |
| Lỗi khác không xác định | `"Unexpected"` | thông điệp exception gốc | message của inner exception (hoặc rỗng) |

**Gợi ý xử lý phía FE**: viết 1 hàm interceptor (axios interceptor/fetch wrapper) kiểm tra `response.status === 400` rồi đọc `error.code` để show message phù hợp (thay vì dựa vào status code như trước).

---

## 3. Phân trang (Pagination)

Chỉ áp dụng cho **2 endpoint** duy nhất trong toàn bộ API:
- `GET /WarehouseAPI/Location/GetAllLocations`
- `GET /WarehouseAPI/Material/GetAllMaterials`

**Query params (bắt buộc, không có giá trị mặc định):**
- `pageNumber` (int)
- `itemsPerPage` (int)

**Response `QueryResult<T>`:**

```json
{
  "results": [ /* danh sách item của trang hiện tại */ ],
  "totalItems": 0
}
```

Lưu ý: response **không** trả lại `pageNumber`/`pageSize`/`totalPages`, FE phải tự tính `totalPages = Math.ceil(totalItems / itemsPerPage)`.

**Tất cả các endpoint "GetAll" còn lại đều KHÔNG phân trang** — trả thẳng mảng đầy đủ (`IEnumerable<T>`). Nếu FE cũ đang gọi các API này kèm `pageNumber`/`itemsPerPage`, các tham số đó sẽ bị bỏ qua vì backend không đọc.

---

## 4. Các Enum dùng chung (serialize dạng string)

| Enum | Giá trị |
|---|---|
| `LotStatus` | `InProgress`, `Pending`, `Cancelled`, `Done`, `HoldOn`, `IsBlocked` |
| `ReceiptStatus` | `Pending`, `Suspended`, `InProgress`, `Done`, `Cancelled` |
| `IssueStatus` | `Pending`, `Suspended`, `InProgress`, `Done`, `Cancelled` |
| `AdjustmentStatus` | `Pending`, `Suspended`, `InProgress`, `Done`, `Cancelled`, `Blocked` |
| `AdjustmentType` | `Periodic`, `Continuous`, `Random`, `Cycle` |
| `AdjustmentReason` | `Damaged`, `Expired`, `Missing`, `Overstock`, `Understock`, `Recount`, `QualityReassessment` |
| `TransactionType` | `Receipt`, `Issue`, `Adjustment`, `Transfer`, `Both` |
| `UnitOfMeasure` | `Millimeter`, `Meter`, `Centimeter`, `Inch`, `Kilogram`, `Tone`, `Gram`, `GramPerCubicCentimeter`, `GramPerTenMinutes`, ... (xem đầy đủ tại `WMS.Practice.Domain/Enum/UnitOfMeasure.cs`) |

---

## 5. ⚠️ Các điểm bất thường cần lưu ý khi tích hợp

1. **Mọi lỗi trả về HTTP 400** — không dùng status code để phân loại, phải đọc field `code` (xem mục 2.2).
2. **Chưa có authentication** — không cần gắn token; toàn bộ API đang public.
3. `DELETE /WarehouseAPI/InventoryReceiptEntry/DeleteReceiptEntries` và `DELETE /WarehouseAPI/InventoryIssueEntry/DeleteIssueEntries` nhận **request body JSON** thay vì chỉ route param — một số HTTP client (axios `delete()`) mặc định không gửi body, cần cấu hình rõ `data:` trong config.
4. Route có khoảng trắng: `POST /WarehouseAPI/Warehouse/Create New Warehouse Property` → khi gọi phải URL-encode thành `Create%20New%20Warehouse%20Property`.
5. Không đồng nhất chữ hoa/thường: `InventoryReceiptSublot` (chữ "l" thường) khác với `InventoryIssueSubLot`/`MaterialSubLot` (chữ "L" hoa) — route phân biệt hoa thường, gõ sai sẽ 404.
6. Phân trang chỉ có ở 2/~19 endpoint danh sách (xem mục 3).
7. `PUT /WarehouseAPI/MaterialLot/UpdateInventoryLogForIssue` thực chất dùng để **cập nhật Material Lot**, không liên quan đến Inventory Log — tên route gây nhầm lẫn nhưng chức năng đúng là update lot.
8. Một số field DTO có lỗi chính tả nhưng vẫn là hợp đồng dữ liệu chính thức, FE phải map đúng tên: `MaterialLotDTO.exisitingQuantity` (không phải "existingQuantity"), `EmployeeDTO.employeeCLassId` (chữ "L" hoa giữa từ).
9. Response JSON dùng camelCase theo convention mặc định của ASP.NET Core (`System.Text.Json`), ví dụ field C# `LocationId` → JSON `"locationId"`.

---

## 6. Danh sách chi tiết API theo Controller

### 6.1. LocationController — base: `/WarehouseAPI/Location`

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/GetAllLocations?pageNumber={int}&itemsPerPage={int}` | Danh sách location (có phân trang) → `QueryResult<LocationDTO>` |
| GET | `/GetLocationsByWarehouseId/{warehouseId}` | Danh sách location + trạng thái chiếm dụng theo kho → `List<LocationStatusInfoDTO>` |
| GET | `/GetLocationById/{locationId}` | Chi tiết 1 location → `LocationDTO` |
| GET | `/GetInforByLocationId/{locationId}` | Thông tin thể tích/sức chứa của location → `LocationStorageInfoDTO` |
| GET | `/GetStockLocationHistoriesByLocationId?locationId={string?}&startTime={DateTime?}&endTime={DateTime?}` | Lịch sử nhập/xuất tại location (tất cả query param optional) → `List<InventoryStorageTrackingDTO>` |
| POST | `/CreateNewLocation` | Tạo location mới. Body: `CreateLocationCommand` → `bool` |
| PUT | `/UpdateLocation` | Cập nhật location. Body: `UpdateLocationCommand` → `bool` |
| DELETE | `/DeleteLocation/{locationId}` | Xoá location → `bool` |
| GET | `/GetAllLocationProperties` | Danh sách toàn bộ thuộc tính location → `IEnumerable<LocationPropertyDTO>` |
| GET | `/GetLocationPropertyById/{locationPropertyId}` | Chi tiết thuộc tính → `LocationPropertyDTO` |
| POST | `/CreateLocationProperty` | Tạo thuộc tính. Body: `CreateLocationPropertyCommand` → `bool` |
| PUT | `/UpdateLocationProperty` | Cập nhật thuộc tính. Body: `UpdateLocationPropertyCommand` → `bool` |
| DELETE | `/DeleteLocationProperty/{locationPropertyId}` | Xoá thuộc tính → `bool` |

**Request Command:**
```ts
CreateLocationCommand {
  locationId: string
  warehouseId: string
  properties: CreateLocationPropertyCommand[]  // { propertyId, propertyName, propertyValue, unitOfMeasure, locationId }
}
UpdateLocationCommand { locationId: string, warehouseId: string }
CreateLocationPropertyCommand { propertyId: string, propertyName: string, propertyValue: string, unitOfMeasure: UnitOfMeasure, locationId: string }
UpdateLocationPropertyCommand { propertyId: string, propertyName: string, propertyValue: string, unitOfMeasure: UnitOfMeasure, locationId: string }
```

**Response DTO:**
```ts
LocationDTO {
  locationId: string
  warehouseId: string
  warehouseName: string
  equipmentName: string        // mặc định "Ô chứa kệ hàng"
  locationPropertyDTOs: LocationPropertyDTO[]
  materialSubLotDTOs: MaterialSubLotDTO[]
}
LocationPropertyDTO { propertyId, propertyName, propertyValue, unitOfMeasure, locationId }
LocationStatusInfoDTO {
  locationId: string
  storageStatus: string
  lotInfors: { lotnumber: string, quantity: number }[]
}
LocationStorageInfoDTO {
  equipmentName: string   // mặc định "Ô kệ chứa hàng"
  warehouseId, warehouseName: string
  length, width, height: number
  status: string
  storageRate: number
  lotInfors: { lotnumber, quantity }[]
  usableVolume: number
  maxVolume: number
}
InventoryStorageTrackingDTO {
  materialName: string
  lotNumber: string
  inboundQuantity?: number
  outboundQuantity?: number
  availableQuantity?: number
  receiptDate: string   // DateTime
  issueDate?: string
}
```

---

### 6.2. WarehouseController — base: `/WarehouseAPI/Warehouse`

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/GetAllWarehouses` | → `IEnumerable<WarehouseDTO>` |
| GET | `/GetWarehouseIdByWarehouseName/{warehouseName}` | → `List<string>` (danh sách warehouseId trùng tên) |
| GET | `/GetWarehouseById/{warehouseId}` | → `WarehouseDTO` |
| POST | `/CreateNewWarehouse` | Body: `CreateWarehouseCommand { warehouseId, warehouseName }` → `bool` |
| PUT | `/UpdateWarehouse` | Body: `UpdateWarehouseCommand { warehouseId, warehouseName }` → `bool` |
| DELETE | `/DeleteWarehouse/{warehouseId}` | → `bool` |
| POST | `/Create%20New%20Warehouse%20Property` | ⚠️ route có khoảng trắng, phải encode. Body: `CreateWarehousePropertyCommand { propertyId, propertyName, propertyValue, unitOfMeasure, warehouseId }` → `bool` |

**Response DTO:**
```ts
WarehouseDTO {
  warehouseId: string
  warehouseName: string
  properties: WarehousePropertyDTO[]
  locations: LocationDTO[]
}
WarehousePropertyDTO { propertyId, propertyName, propertyValue, unitOfMeasure, warehouseId }
```

---

### 6.3. CustomerController — base: `/WarehouseAPI/Customer`

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/GetAllCustomers` | → `IEnumerable<CustomerDTO>` |
| GET | `/GetCustomerById/{customerId}` | → `CustomerDTO` |
| POST | `/CreateNewCustomer` | Body: `CreateCustomerCommand { customerId, customerName, address, contactDetails }` → `bool` |
| PUT | `/UpdateCustomer` | Body: `UpdateCustomerCommand { customerId, customerName?, address?, contactDetails? }` → `bool` |
| DELETE | `/DeleteCustomer/{customerId}` | → `bool` |

```ts
CustomerDTO { customerId: string, customerName: string, address: string, contactDetails: string }
```

---

### 6.4. SupplierController — base: `/WarehouseAPI/Supplier`

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/GetAllSupplier` | → `IEnumerable<SupplierDTO>` |
| GET | `/GetSupplierById/{supplierId}` | → `SupplierDTO` |
| POST | `/CreateNewSupplier` | Body: `CreateSupplierCommand { supplierId, supplierName, address, contactDetails }` → `bool` |
| PUT | `/UpdateSupplier` | Body: `UpdateSupplierCommand { supplierId, supplierName, address, contactDetails }` → `bool` |
| DELETE | `/DeleteSupplier/{supplierId}` | → `bool` |

```ts
SupplierDTO { supplierId: string, supplierName: string, address: string, contactDetails: string }
```

---

### 6.5. EmployeeController — base: `/WarehouseAPI/Employee`

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/GetAllEmployees` | → `IEnumerable<EmployeeDTO>` |
| GET | `/GetEmployeeById/{employeeId}` | → `EmployeeDTO` |
| POST | `/CreateNewEmployee` | Body: `CreateEmployeeCommand` → `bool` |
| PUT | `/UpdateEmployee` | Body: `UpdateEmployeeCommand` → `bool` |
| DELETE | `/DeleteEmployee/{employeeId}` | → `bool` |
| GET | `/GetAllEmployeeProperties` | → `IEnumerable<EmployeePropertyDTO>` |
| GET | `/GetEmployeePropertyById/{propertyId}` | → `EmployeePropertyDTO` |
| POST | `/CreateNewEmployeeProperty` | Body: `CreateEmployeePropertyCommand { propertyName, propertyValue, unitOfMeasure, employeeId }` → `bool` |
| PUT | `/UpdateEmployeeProperty` | Body: `UpdateEmployeePropertyCommand { propertyId, propertyName, propertyValue, unitOfMeasure, employeeId }` → `bool` |
| DELETE | `/DeleteEmployeeProperty/{propertyId}` | → `bool` |

```ts
CreateEmployeeCommand {
  employeeId: string, employeeName: string, employeeClassId: string
  properties: CreateEmployeePropertyCommand[]
}
UpdateEmployeeCommand {
  employeeId: string, employeeName?: string
  properties: { propertyName: string, propertyValue: string }[]
}
EmployeeDTO {
  employeeId: string
  employeeName: string
  employeeCLassId: string     // ⚠️ chữ "L" hoa — lỗi chính tả nhưng là field thật trên wire
  employeePropertyDTOs: EmployeePropertyDTO[]
}
EmployeePropertyDTO { propertyId, propertyName, propertyValue, unitOfMeasure, employeeId }
```

---

### 6.6. MaterialClassController — base: `/WarehouseAPI/MaterialClass`

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/GetAllMaterialClass` | → `IEnumerable<MaterialClassDTO>` |
| GET | `/GetMaterialClassById/{materialClassId}` | → `MaterialClassDTO` |
| POST | `/CreateMaterialClass` | Body: `CreateMaterialClassCommand { materialClassId, className }` → `bool` |
| PUT | `/UpdateMaterialClass` | Body: `UpdateMaterialClassCommand { materialClassId, className?, properties: UpdateMaterialClassPropertyCommand[] }` → `bool` |
| DELETE | `/DeleteMaterialClass/{materialClassId}` | → `bool` |
| GET | `/GetAllProperties` | → `IEnumerable<MaterialClassPropertyDTO>` |
| GET | `/GetMaterialClassPropertyById/{materialClassPropertyId}` | → `MaterialClassPropertyDTO` |
| POST | `/CreateMaterialClassProperty` | Body: `CreateMaterialClassPropertyCommand { propertyId, propertyName, propertyValue, unitOfMeasure, materialClassId }` → `bool` |
| PUT | `/UpdateMaterialClassProperty` | Body: `UpdateMaterialClassPropertyCommand { propertyId, propertyName, propertyValue, unitOfMeasure, materialClassId }` → `bool` |
| DELETE | `/DeleteMaterialClassProperty/{materialClassPropertyId}` | → `bool` |

```ts
MaterialClassDTO {
  materialClassId: string, className: string
  properties: MaterialClassPropertyDTO[]
  materials: MaterialDTO[]
}
MaterialClassPropertyDTO { propertyId, propertyName, propertyValue, unitOfMeasure, materialClassId }
```

---

### 6.7. MaterialController — base: `/WarehouseAPI/Material`

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/GetAllMaterials?pageNumber={int}&itemsPerPage={int}` | Có phân trang → `QueryResult<MaterialDTO>` |
| GET | `/GetMaterialsByClassIdQuery/{materialClassId}` | → `IEnumerable<MaterialDTO>` |
| GET | `/GetMaterialsByWarehouseId/{warehouseId}` | → `IEnumerable<MaterialByWarehouseIdDTO>` |
| GET | `/GetMaterialsByWarehouseIdAndMaterialLot/{warehouseId}` | → `IEnumerable<MaterialByWarehouseIdDTO>` |
| GET | `/GetMaterialById/{materialId}` | → `MaterialDTO` |
| GET | `/GetUnitByMaterialId/{materialId}` | → `string` (đơn vị tính) |
| POST | `/CreateMaterial` | Body: `CreateMaterialCommand` → `bool` |
| PUT | `/UpdateMaterial` | Body: `UpdateMaterialCommand` → `bool` |
| DELETE | `/DeleteMaterial/{materialId}` | → `bool` |
| GET | `/GetAllMaterialProperties` | → `IEnumerable<MaterialPropertyDTO>` |
| GET | `/GetMaterialPropertyById/{propertyId}` | → `MaterialPropertyDTO` |
| POST | `/CreateMaterialProperty` | Body: `CreateMaterialPropertyCommand` → `bool` (`propertyId` do server tự sinh GUID, FE không cần truyền) |
| PUT | `/UpdateMaterialProperty` | Body: `UpdateMaterialPropertyCommand` → `bool` |
| DELETE | `/DeleteMaterialProperty/{propertyId}` | → `bool` |

```ts
CreateMaterialCommand {
  materialId: string, materialName: string, materialClassId: string
  properties: CreateMaterialPropertyCommand[]
}
UpdateMaterialCommand {
  materialId: string, materialName: string, materialClassId: string
  properties: UpdateMaterialPropertyCommand[]
}
MaterialDTO {
  materialId: string, materialName: string
  materialClassId: string, materialClassName: string
  properties: MaterialPropertyDTO[]
}
MaterialPropertyDTO { propertyId, propertyName, propertyValue, unitOfMeasure, materialId }
MaterialByWarehouseIdDTO { materialId: string, materialName: string }
```

---

### 6.8. MaterialLotController — base: `/WarehouseAPI/MaterialLot`

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/GetAllMaterialLots` | → `IEnumerable<MaterialLotDTO>` |
| GET | `/GetMaterialLotsByMaterialId/{materialId}` | → `IEnumerable<MaterialLotDTO>` |
| GET | `/GetMaterialLotbyLotStatus/{status}` | `status` khớp giá trị enum `LotStatus` → `IEnumerable<MaterialLotDTO>` |
| GET | `/GetMaterialLotById/{lotNumber}` | → `MaterialLotDTO` |
| GET | `/GetQuantityByMaterialLotId/{lotNumber}` | → `MaterialLotQuantityDTO { lotNumber, availableQuantity }` |
| GET | `/GetMaterialLotsByWarehouseId/{warehouseId}` | → `IEnumerable<MaterialLotDTO>` |
| POST | `/CreateMaterialLot` | Body: `CreateMaterialLotCommand` → `bool` |
| PUT | `/UpdateInventoryLogForIssue` | ⚠️ Tên route gây nhầm lẫn — thực chất **cập nhật Material Lot**. Body: `UpdateMaterialLotCommand` → `bool` |
| PUT | `/UpdateQuantityMaterialLots` | Body: `UpdateMaterialLotQuantityCommand { materialLotId }` → `bool` |
| DELETE | `/DeleteMaterialLot/{lotNumber}` | → `bool` |
| GET | `/GetAllMaterialLotProperties` | → `IEnumerable<MaterialLotPropertyDTO>` |
| GET | `/GetMaterialLotPropertyById/{propertyId}` | → `MaterialLotPropertyDTO` |
| POST | `/CreateMaterialLotProperty` | Body: `CreateMaterialLotPropertyCommand { propertyId, propertyName, propertyValue, unitOfMeasure, materialLotId }` → `bool` |
| PUT | `/UpdateMaterialLotProperty` | Body: `UpdateMaterialLotPropertyCommand { propertyId, propertyName, propertyValue, unitOfMeasure, materialLotId }` → `bool` |
| DELETE | `/DeleteMaterialLotProperty/{propertyId}` | → `bool` |

```ts
CreateMaterialLotCommand {
  lotNumber: string, lotStatus: LotStatus, materialId: string
  exisitingQuantity: number     // ⚠️ lỗi chính tả "Exisiting" — field thật
  properties: CreateMaterialLotPropertyCommand[]
  subLots: CreateMaterialSubLotCommand[]
}
UpdateMaterialLotCommand {
  lotNumber: string, lotStatus: LotStatus, materialId: string
  exisitingQuantity: number
  properties: CreateMaterialLotPropertyCommand[]
  subLots: CreateMaterialSubLotCommand[]
}
MaterialLotDTO {
  lotNumber: string, lotStatus: LotStatus, materialId: string
  exisitingQuantity?: number    // ⚠️ lỗi chính tả
  properties: MaterialLotPropertyDTO[]
  subLots: MaterialSubLotDTO[]
}
MaterialLotPropertyDTO { propertyId, propertyName, propertyValue, unitOfMeasure, lotNumber }
```

---

### 6.9. MaterialSubLotController — base: `/WarehouseAPI/MaterialSubLot`

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/GetAllMaterialSubLots` | → `IEnumerable<MaterialSubLotDTO>` |
| GET | `/GetMaterialSubLotsByLocationId/{LocationId}` | → `IEnumerable<MaterialSubLotDTO>` |
| GET | `/GetMaterialSubLotsByLotNumber/{lotNumber}` | → `IEnumerable<MaterialSubLotDTO>` |
| GET | `/GetMaterialSubLotsByStatus/{status}` | → `IEnumerable<MaterialSubLotDTO>` |
| GET | `/GetMaterialSubLotById/{sublotId}` | → `MaterialSubLotDTO` |
| POST | `/CreateMaterialSubLot` | Body: `CreateMaterialSubLotCommand { subLotId, subLotStatus, existingQuantity, unitOfMeasure, locationId, lotNumber }` → `bool` |
| PUT | `/UpdateMaterialSubLot` | Body: `UpdateMaterialSubLotsCommand` → `bool` |
| PUT | `/UpdateMaterialSubLotQuantity` | Body: `UpdateMaterialSubLotQuantityCommand { lotNumber, requestQuantity }` → `bool` |
| DELETE | `/DeleteMaterialSubLot/{sublotId}` | → `bool` |

```ts
UpdateMaterialSubLotsCommand {
  lotNumber: string, materialLotAdjustmentId: string
  materialSubLots: {
    materialSubLotId: string, previousQuantity: number, realQuantity: number
    locationId: string, subLotStatus: LotStatus, unitOfMeasure: UnitOfMeasure
  }[]
}
MaterialSubLotDTO {
  materialSubLotId: string, subLotStatus: LotStatus
  existingQuantity: number, unitOfMeasure: UnitOfMeasure
  locationId: string, lotNumber: string
}
```

---

### 6.10. InventoryReceiptController — base: `/WarehouseAPI/InventoryReceipt`

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/GetAllReceipts` | → `IEnumerable<InventoryReceiptDTO>` |
| GET | `/GetReceiptById/{receiptId}` | → `InventoryReceiptDTO` |
| POST | `/CreateReceipt` | Body: `CreateInventoryReceiptCommand` → `string` (id phiếu nhập mới) |
| PUT | `/UpdateReceipt` | Body: `UpdateInventoryReceiptCommand { inventoryReceiptId, supplierId?, employeeId?, warehouseId?, status? }` → `bool` |
| DELETE | `/DeleteReceipt/{receiptId}` | → `bool` |

```ts
CreateInventoryReceiptCommand {
  receiptDate?: string   // DateTime
  supplierId: string, employeeId: string, warehouseId: string
  entries: {
    materialId: string, materialName?: string, purchaseOrderNumber?: string
    importedQuantity?: number, note?: string, lotNumber: string, unit?: string
  }[]
}
InventoryReceiptDTO {
  inventoryReceiptId: string, receiptDate: string, receiptStatus: ReceiptStatus
  supplierName: string, personName: string, warehouseName: string
  entries: InventoryReceiptEntryDTO[]
}
```

---

### 6.11. InventoryReceiptEntryController — base: `/WarehouseAPI/InventoryReceiptEntry`

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/GetAllReceiptEntries` | → `IEnumerable<InventoryReceiptEntryDTO>` |
| GET | `/GetReceiptEntryById/{receiptEntryId}` | → `InventoryReceiptEntryDTO` |
| POST | `/CreateInventoryReceiptEntry` | Body: `CreateInventoryReceiptEntryCommand` → `bool` |
| POST | `/CreateInventoryReceiptEntries` | Tạo nhiều entry cùng lúc. Body: `CreateInventoryReceiptEntriesCommand { inventoryReceiptId, entries: [...] }` → `List<string>` (danh sách id entry vừa tạo) |
| PUT | `/UpdateInventoryReceiptEntry` | Body: `UpdateInventoryReceiptEntryCommand` → `bool` |
| DELETE | `/DeleteReceiptEntries` | ⚠️ DELETE có body. Body: `DeleteInventoryReceiptEntriesCommand { entryId }` → `bool` |

```ts
CreateInventoryReceiptEntryCommand {
  materialId: string, materialName?: string, purchaseOrderNumber?: string
  importedQuantity?: number, note?: string, lotNumber: string, inventoryReceiptId: string
}
InventoryReceiptEntryDTO {
  inventoryReceiptEntryId: string, purchaseOrderNumber: string
  materialName: string, materialId: string, note: string
  inventoryReceiptId: string, lotNumber: string
  warehouseName: string, personName: string, unit: string
  receiptDate: string
  receiptLot: ReceiptLotDTO
}
```

---

### 6.12. InventoryReceiptLotController — base: `/WarehouseAPI/InventoryReceiptLot`

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/GetAllReceiptLots` | → `IEnumerable<ReceiptLotDTO>` |
| GET | `/GetReceiptLotByNotDone?warehouseId={string}` | `warehouseId` mặc định `"TP01"` nếu không truyền → `IEnumerable<ReceiptLotDTO>` |
| GET | `/GetReceiptLotById/{receiptLotId}` | → `ReceiptLotDTO` |
| PUT | `/UpdateReceiptLotStatus` | Body: `UpdateReceiptLotStatusCommand { receiptLotId, receiptLotStatus }` → `bool` |

```ts
ReceiptLotDTO {
  receiptLotId: string, importedQuantity?: number, receiptLotStatus: LotStatus
  inventoryReceiptEntryId: string, materialId: string, materialName: string
  storageLevel: string, warehouseId: string, warehouseName: string
  receiptSublots: ReceiptSubLotDTO[]
}
```

---

### 6.13. InventoryReceiptSublotController — base: `/WarehouseAPI/InventoryReceiptSublot`

⚠️ Route segment là `InventoryReceiptSublot` (chữ "l" thường, khác với `InventoryIssueSubLot`/`MaterialSubLot` viết hoa "L") — gõ nhầm sẽ bị 404.

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/GetAllReceiptSublots` | → `IEnumerable<ReceiptSubLotDTO>` |
| GET | `/GetReceiptSubLotById/{receiptSublotId}` | → `ReceiptSubLotDTO` |
| PUT | `/UpdateReceiptSublot` | Body: `UpdateReceiptSubLotsCommand { receiptSubLots: [{ receiptSubLotId, materialId, importedQuantity, locationId, lotNumber }] }` → `bool` |

```ts
ReceiptSubLotDTO {
  receiptSublotId: string, importedQuantity: number
  subLotStatus: LotStatus, unitOfMeasure: UnitOfMeasure
  locationId: string, receiptLotId: string
}
```

---

### 6.14. InventoryIssueController — base: `/WarehouseAPI/InventoryIssue`

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/GetAllIssues` | → `IEnumerable<InventoryIssueDTO>` |
| GET | `/GetIssueById/{InventoryIssueId}` | → `InventoryIssueDTO` |
| POST | `/CreateInventoryIssue` | Body: `CreateInventoryIssueCommand` → `string` (id phiếu xuất mới) |
| PUT | `/UpdateInventoryIssue` | Body: `UpdateInventoryIssueCommand { inventoryIssueId, customerId, employeeId, warehouseId }` → `bool` |
| DELETE | `/DeleteInventoryIssue/{IssueId}` | → `bool` |

```ts
CreateInventoryIssueCommand {
  issueDate?: string
  customerId: string, employeeId: string, warehouseId: string
  entries: {
    materialId: string, materialName?: string, purchaseOrderNumber: string
    requestedQuantity?: number, note?: string, unit?: string
  }[]
}
InventoryIssueDTO {
  inventoryIssueId: string, issueDate: string, issueStatus: IssueStatus
  customerName: string, employeeName: string, warehouseName: string
  entries: InventoryIssueEntryDTO[]
}
```

---

### 6.15. InventoryIssueEntryController — base: `/WarehouseAPI/InventoryIssueEntry`

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/GetAllIssueEntries` | → `IEnumerable<InventoryIssueEntryDTO>` |
| GET | `/GetIssueEntryById/{IssueEntryId}` | → `InventoryIssueEntryDTO` |
| POST | `/CreateIssueEntry` | Body: `CreateInventoryIssueEntryCommand` → `bool` |
| PUT | `/UpdateIssueEntry` | Body: `UpdateInventoryIssueEntryCommand` → `bool` |
| DELETE | `/DeleteIssueEntries` | ⚠️ DELETE có body. Body: `DeleteInventoryIssueEntriesCommand { inventoryEntryId }` → `bool` |

```ts
CreateInventoryIssueEntryCommand {
  purchaseOrderNumber: string, requestedQuantity?: number, note?: string
  materialId: string, materialName?: string
  inventoryIssueId: string, issueLotId: string
}
InventoryIssueEntryDTO {
  inventoryIssueEntryId: string, purchaseOrderNumber: string
  requestedQuantity?: number, note: string
  materialName: string, materialId: string, unit: string
  inventoryIssueId: string, warehouseId: string, warehouseName: string
  personId: string, personName: string, lotNumber: string, issueDate?: string
  issueLot: IssueLotDTO
}
```

---

### 6.16. InventoryIssueLotController — base: `/WarehouseAPI/InventoryIssueLot`

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/GetAllIssueLots` | → `IEnumerable<IssueLotDTO>` |
| GET | `/GetIssueLotsNotDone?warehouseId={string}` | `warehouseId` mặc định `"TP01"` → `IEnumerable<IssueLotDTO>` |
| GET | `/GetIssueLotById/{IssueLotId}` | → `IssueLotDTO` |
| PUT | `/UpdateIssueLotStatus` | Body: `UpdateIssueLotStatusCommand { issueLotId, issueLotStatus }` → `bool` |

```ts
IssueLotDTO {
  issueLotId: string, requestedQuantity?: number, issueLotStatus?: LotStatus
  materialLotId: string, inventoryIssueEntryId: string
  issueSublots: IssueSubLotDTO[]
}
```

---

### 6.17. InventoryIssueSubLotController — base: `/WarehouseAPI/InventoryIssueSubLot`

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/GetAllIssueSubLots` | → `IEnumerable<IssueSubLotDTO>` |
| GET | `/GetIssueSubLotById/{issueSublotId}` | → `IssueSubLotDTO` |
| PUT | `/UpdateIssueSubLot` | Body: `UpdateIssueSubLotsCommand { issueSubLots: [{ issueSublotId, issueLotId, requestedQuantity, materialSubLotId, lotNumber }] }` → `bool` |

```ts
IssueSubLotDTO {
  issueSublotId: string, requestedQuantity: number
  materialSublot: MaterialSubLotDTO, issueLotId: string
}
```

---

### 6.18. InventoryLogController — base: `/WarehouseAPI/InventoryLog`

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/GetAllInventoryLogs?transactionType={string}` | `transactionType` mặc định `"Both"`, khớp enum `TransactionType` → `IEnumerable<InventoryLogDTO>` |
| GET | `/GetInventoryLogByLotNumber/{lotNumber}?transactionType={string}` | `transactionType` mặc định `"Both"` → `IEnumerable<InventoryLogDTO>` |
| GET | `/GetAllReceiptLotsTracking?lotNumber&supplierId&startTime&endTime` | Tất cả query param optional → `List<ReceiptLotsTrackingDTO>` |
| GET | `/GetAllIssueLotsTracking?lotNumber&customerId&startTime&endTime` | Tất cả optional → `List<IssueLotsTrackingDTO>` |
| GET | `/GetLotAdjustmentsTracking?lotNumber&materialId&startTime&endTime` | Tất cả optional → `List<StockTakeLotTrackingDTO>` |

```ts
InventoryLogDTO {
  inventoryLogId: string, transactionType: TransactionType, transactionDate: string
  previousQuantity: number, changedQuantity: number, afterQuantity: number
  note: string, lotNumber: string, warehouseId: string
}
```

---

### 6.19. StockTakeController — base: `/WarehouseAPI/StockTake`

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/GetAllStockTakes` | → `IEnumerable<StockTakeLotDTO>` |
| GET | `/GetStockTakeById/{stockTakeId}` | → `StockTakeLotDTO` |
| POST | `/CreateNewStockTake` | Body: `CreateStockTakeCommand` → `string` (id phiếu kiểm kê mới) |
| PUT | `/UpdateStockTakeCommand` | ⚠️ route trùng tên với class command. Body: `UpdateStockTakeCommand` → `bool` |

*(Không có endpoint DELETE cho StockTake.)*

```ts
CreateStockTakeCommand {
  adjustmentDate?: string
  reason: AdjustmentReason, adjustmentType: AdjustmentType, note?: string
  lotNumber: string, warehouseId: string, employeeId: string
}
StockTakeLotDTO {
  stockTakeId: string, adjustmentDate: string
  previousQuantity?: number, adjustedQuantity?: number
  reason: string, status: string, adjustmentType: string, note: string
  lotNumber: string, warehouseId: string, warehouseName: string
  personId: string, personName: string
  stockTakeSubLots: StockTakeSubLotDTO[]
}
```

---

## 7. Checklist cho Frontend Developer khi migrate

- [ ] Đổi base URL API sang `http://localhost:5037` hoặc `https://localhost:7066` (hoặc URL môi trường thật tương ứng)
- [ ] Xoá bỏ header Authorization/Bearer token nếu FE cũ đang gắn cứng (backend hiện chưa check)
- [ ] Viết lại error handler: không dựa vào HTTP status (404/500...), luôn check `error.response.data.code`
- [ ] Với 2 API `GetAllLocations`, `GetAllMaterials`: cập nhật lại UI phân trang để đọc `results` + `totalItems`
- [ ] Với các API `GetAll...` khác: không gửi `pageNumber`/`itemsPerPage` (không có tác dụng), xử lý phân trang ở client nếu cần
- [ ] Cấu hình HTTP client cho phép gửi body trong request DELETE (`DeleteReceiptEntries`, `DeleteIssueEntries`)
- [ ] Encode route có khoảng trắng (`Create New Warehouse Property`)
- [ ] Map đúng tên field có lỗi chính tả: `exisitingQuantity`, `employeeCLassId`
- [ ] Đối chiếu lại từng field DTO ở mục 6 với model FE hiện có, cập nhật interface/type tương ứng (khuyến khích dùng TypeScript interface như các block code mẫu ở trên)
- [ ] Test lại toàn bộ luồng CRUD qua Swagger UI (`/swagger`) trước khi tích hợp vào UI thật
