import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import SectionTitle from '../../../../common/components/Text/SectionTitle.jsx';
import SelectContainer from '../../../../common/components/Selection/SelectContainer.jsx';
import Select from '../../../../common/components/Selection/Select.jsx';
import ActionButton from '../../../../common/components/Button/ActionButton/ActionButton.jsx';
import Label from '../../../../common/components/Label/Label.jsx';
import Table from '../../../../common/components/Table/Table.jsx';
import TableHeader from '../../../../common/components/Table/TableHeader.jsx';
import TableCell from '../../../../common/components/Table/TableCell.jsx';
import Tag from '../../../../common/components/Tag/Tag.jsx';
import locationApi from '../../../../api/locationApi.js';
import wareHouseApi from '../../../../api/wareHouseApi.js';
import { getApiErrorMessage } from '../../../../api/apiError.js';
import { toast } from "react-toastify"; // Import toast for notifications
import "react-toastify/dist/ReactToastify.css";
import { ClipLoader } from 'react-spinners';
import Pagination from '../../../../common/components/Pagination/Pagination.jsx';
import { AiOutlineDownload } from 'react-icons/ai';
import { exportTableToExcel, excelStamp } from '../../../../common/utils/exportTableToExcel.js';
import styles from './StoreLocation.module.scss';

const errorTextStyle = { color: '#f43f5e', fontSize: '12px', marginTop: '4px' };

// Location/GetAllLocations và Location/SearchLocationsByLocationId đều hỗ trợ phân trang thật
// (pageNumber/itemsPerPage), nên duyệt danh sách hay tìm kiếm đều chỉ tải đúng 1 trang.
const PAGE_SIZE = 7;

const warehouseOptions = [
  "Kho thành phẩm",
  "Kho bán thành phẩm",
  "Kho bao bì",
  "Kho nguyên vật liệu",
  "Kho vật tư",
];

const emptyFormData = {
  equipmentName: "",
  locationId: "",
  status: "",
  warehouseName: "",
  warehouseId: "",
  dimensions: "",
};

const mapLocation = (location) => {
  const status = location.locationPropertyDTOs?.find(
    (prop) => prop.propertyName?.trim() === "Status"
  )?.propertyValue || "--";

  const height = location.locationPropertyDTOs?.find(
    (prop) => prop.propertyName?.trim() === "Height"
  )?.propertyValue || "--";

  const width = location.locationPropertyDTOs?.find(
    (prop) => prop.propertyName?.trim() === "Width"
  )?.propertyValue || "--";

  const length = location.locationPropertyDTOs?.find(
    (prop) => prop.propertyName?.trim() === "Length"
  )?.propertyValue || "--";

  return { ...location, status, height, width, length };
};

const fetchLocations = async ({ pageNumber = 1, itemsPerPage = PAGE_SIZE } = {}) => {
  // GetAllLocations trả về QueryResult<LocationDTO> (results + totalItems)
  const response = await locationApi.getAllLocations({ pageNumber, itemsPerPage });
  return { results: (response?.results || []).map(mapLocation), totalItems: response?.totalItems || 0 };
};

const searchLocations = async (locationId, warehouseId, { pageNumber = 1, itemsPerPage = PAGE_SIZE } = {}) => {
  const response = await locationApi.searchLocationsByLocationId(locationId || undefined, warehouseId || undefined, pageNumber, itemsPerPage);
  return { results: (response?.results || []).map(mapLocation), totalItems: response?.totalItems || 0 };
};

const StoreLocation = () => {
  const roles = useSelector((state) => state.auth.roles);
  const isAdmin = roles.includes('Admin');
  const [searchCode, setSearchCode] = useState("");
  // Từ khóa thực sự dùng để gọi API — chỉ cập nhật khi bấm nút "Tìm kiếm"/Enter,
  // tránh gọi lại API theo từng ký tự gõ.
  const [appliedSearchCode, setAppliedSearchCode] = useState("");
  // Danh sách rút gọn cho Selection box lọc theo Kho hàng (backend GetAllWarehouseNameId).
  const [warehouseFilterOptions, setWarehouseFilterOptions] = useState([]);
  const [selectedWarehouseFilter, setSelectedWarehouseFilter] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  // Tăng mỗi lần tạo mới vị trí thành công để buộc effect tải lại dữ liệu ngay cả khi
  // appliedSearchCode/page không đổi giá trị.
  const [refreshToken, setRefreshToken] = useState(0);
  const [isCreateSectionHidden, setCreateSectionHidden] = useState(true);
  const [isSearchSectionHidden, setSearchSectionHidden] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [formData, setFormData] = useState(emptyFormData);
  const [fieldErrors, setFieldErrors] = useState({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Đổi từ khóa đã áp dụng hoặc đổi bộ lọc Kho hàng -> quay về trang 1
  useEffect(() => {
    setPage(1);
  }, [appliedSearchCode, selectedWarehouseFilter]);

  const isFiltering = Boolean(appliedSearchCode || selectedWarehouseFilter);

  useEffect(() => {
    const fetchData = async () => {
      const loadingSetter = isFiltering ? setIsSearching : setIsLoading;
      loadingSetter(true);
      try {
        const { results, totalItems: total } = isFiltering
          ? await searchLocations(appliedSearchCode, selectedWarehouseFilter, { pageNumber: page, itemsPerPage: PAGE_SIZE })
          : await fetchLocations({ pageNumber: page, itemsPerPage: PAGE_SIZE });
        setTotalItems(total);
        setFilteredData(results);
      } catch (error) {
        console.error("Error fetching locations:", error);
      } finally {
        loadingSetter(false);
      }
    };

    fetchData();
  }, [appliedSearchCode, selectedWarehouseFilter, isFiltering, page, refreshToken]);

  useEffect(() => {
    const fetchWarehouseFilterOptions = async () => {
      try {
        const response = await wareHouseApi.getAllWarehouseNameId();
        setWarehouseFilterOptions(response || []);
      } catch (error) {
        console.error("Error fetching warehouse name/id list:", error);
      }
    };

    fetchWarehouseFilterOptions();
  }, []);

  useEffect(() => {
    if (hasSubmitted) {
      setFieldErrors({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const nextFieldErrors = {};
    if (!formData.equipmentName.trim()) nextFieldErrors.equipmentName = 'Vui lòng nhập tên thiết bị';
    if (!formData.locationId.trim()) nextFieldErrors.locationId = 'Vui lòng nhập mã vị trí';
    if (!formData.warehouseName) nextFieldErrors.warehouseName = 'Vui lòng chọn kho hàng';
    setFieldErrors(nextFieldErrors);
    return Object.keys(nextFieldErrors).length === 0;
  };

  const handleSave = async () => {
    setHasSubmitted(true);
    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra các trường còn thiếu thông tin!", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    const dimensionsArray = formData.dimensions.split("x").map((dim) => dim.trim());

    const newLocation = {
      locationId: formData.locationId,
      warehouseId: formData.warehouseId,
      warehouseName: formData.warehouseName,
      equipmentName: formData.equipmentName,
      properties: [
        {
          propertyName: "Height",
          propertyValue: dimensionsArray[2] || "--",
          unitOfMeasure: "Meter",
        },
        {
          propertyName: "Width",
          propertyValue: dimensionsArray[0] || "--",
          unitOfMeasure: "Meter",
        },
        {
          propertyName: "Length",
          propertyValue: dimensionsArray[1] || "--",
          unitOfMeasure: "Meter",
        },
        {
          propertyName: "Status",
          propertyValue: formData.status || "--",
          unitOfMeasure: "None",
        },
      ],
    };

    try {
      const response = await locationApi.createLocation(newLocation);
      if (response) {
        toast.success("Vị trí lưu trữ đã được tạo thành công!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });

        // Quay về trang 1 chế độ duyệt và tải lại từ server để totalItems/phân trang đúng
        setSearchCode("");
        setAppliedSearchCode("");
        setSelectedWarehouseFilter("");
        setPage(1);
        setRefreshToken((prev) => prev + 1);

        setFormData(emptyFormData);
        setFieldErrors({});
        setHasSubmitted(false);
      }
    } catch (error) {
      console.error("Error creating new location:", error);
      toast.error(getApiErrorMessage(error, "Tạo vị trí lưu trữ thất bại. Vui lòng thử lại!"), {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  const handleSearch = () => {
    setAppliedSearchCode(searchCode.trim());
  };

  // Xuất TOÀN BỘ vị trí lưu trữ khớp bộ lọc hiện tại (không chỉ trang đang xem) ra file .xlsx.
  const handleExportExcel = async () => {
    if (totalItems === 0 || isLoading || isSearching || isExporting) return;
    setIsExporting(true);
    try {
      const fetchPage = isFiltering
        ? (pn, ip) => searchLocations(appliedSearchCode, selectedWarehouseFilter, { pageNumber: pn, itemsPerPage: ip })
        : (pn, ip) => fetchLocations({ pageNumber: pn, itemsPerPage: ip });

      const first = await fetchPage(1, totalItems || PAGE_SIZE);
      let all = first.results;
      if (all.length < (first.totalItems || 0)) {
        const pages = Math.ceil((first.totalItems || 0) / PAGE_SIZE);
        const rest = await Promise.all(
          Array.from({ length: pages }, (_, i) => fetchPage(i + 1, PAGE_SIZE))
        );
        all = rest.flatMap(r => r.results);
      }
      if (!all.length) {
        toast.info('Không có vị trí nào để xuất.', { position: 'top-right', autoClose: 3000 });
        return;
      }

      const rows = all.map((item, i) => [
        i + 1,
        item.equipmentName ?? '',
        item.locationId ?? '',
        item.warehouseName ?? '',
        item.warehouseId ?? '',
        `${item.width || '--'} x ${item.length || '--'} x ${item.height || '--'} (m)`,
      ]);

      await exportTableToExcel({
        headers: ['STT', 'Tên thiết bị', 'Mã vị trí', 'Kho hàng', 'Khu vực', 'Kích thước'],
        rows,
        columnMeta: [
          { width: 5, align: 'center' }, { width: 24 }, { width: 18 },
          { width: 22 }, { width: 14, align: 'center' }, { width: 22 },
        ],
        sheetName: 'Vị trí lưu trữ',
        filename: `Danh_muc_Vi_tri_luu_tru_${excelStamp()}.xlsx`,
      });
      toast.success(`Đã xuất ${rows.length} vị trí ra file Excel.`, { position: 'top-right', autoClose: 3000 });
    } catch (error) {
      console.error('Export excel error:', error);
      toast.error('Xuất file Excel thất bại. Vui lòng thử lại.', { position: 'top-right', autoClose: 3000 });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div style={{ padding: '0 0 20px' }}>
      {isAdmin && (
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <SectionTitle className={styles.cardTitle}>Tạo mới vị trí lưu trữ</SectionTitle>
          <button
            onClick={() => setCreateSectionHidden(!isCreateSectionHidden)}
            className={styles.toggleButton}
          >
            {isCreateSectionHidden ? "Hiện" : "Ẩn"}
          </button>
        </div>
        {!isCreateSectionHidden && (
          <div>
            <div className={styles.fieldGrid}>
              <div className={styles.field}>
                <Label required>Tên thiết bị:</Label>
                <input
                  type="text"
                  name="equipmentName"
                  value={formData.equipmentName}
                  onChange={handleInputChange}
                  className={styles.input}
                />
                {fieldErrors.equipmentName && <div style={errorTextStyle}>{fieldErrors.equipmentName}</div>}
              </div>

              <div className={styles.field}>
                <Label required>Mã vị trí:</Label>
                <input
                  type="text"
                  name="locationId"
                  value={formData.locationId}
                  onChange={handleInputChange}
                  className={styles.input}
                />
                {fieldErrors.locationId && <div style={errorTextStyle}>{fieldErrors.locationId}</div>}
              </div>

              <div className={styles.field}>
                <Label>Mô tả:</Label>
                <input
                  type="text"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className={styles.input}
                />
              </div>

              <div className={styles.field}>
                <Label required>Kho hàng:</Label>
                <SelectContainer>
                  <Select
                    value={formData.warehouseName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, warehouseName: e.target.value }))}
                    placeholder="Chọn kho hàng"
                  >
                    {warehouseOptions.map((name) => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </Select>
                </SelectContainer>
                {fieldErrors.warehouseName && <div style={errorTextStyle}>{fieldErrors.warehouseName}</div>}
              </div>

              <div className={styles.field}>
                <Label>Khu vực:</Label>
                <input
                  type="text"
                  name="warehouseId"
                  value={formData.warehouseId}
                  onChange={handleInputChange}
                  className={styles.input}
                />
              </div>

              <div className={styles.field}>
                <Label>Kích thước (m):</Label>
                <input
                  type="text"
                  name="dimensions"
                  placeholder="Dài x Rộng x Cao"
                  value={formData.dimensions}
                  onChange={handleInputChange}
                  className={styles.input}
                />
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "center", marginTop: "24px" }}>
              <ActionButton
                onClick={handleSave}
                style={{ width: "240px", padding: "14px", fontSize: "15px" }}
              >
                Tạo mới vị trí
              </ActionButton>
            </div>
          </div>
        )}
      </div>
      )}

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <SectionTitle className={styles.cardTitle}>Danh sách vị trí lưu trữ</SectionTitle>
          <button
            onClick={() => setSearchSectionHidden(!isSearchSectionHidden)}
            className={styles.toggleButton}
          >
            {isSearchSectionHidden ? "Hiện" : "Ẩn"}
          </button>
        </div>
        {!isSearchSectionHidden && (
          <div>
            <div className={styles.searchBar}>
              <SelectContainer style={{ maxWidth: "220px" }}>
                <Select
                  value={selectedWarehouseFilter}
                  onChange={(e) => setSelectedWarehouseFilter(e.target.value)}
                  placeholder="Tất cả kho hàng"
                >
                  <option value="">Tất cả kho hàng</option>
                  {warehouseFilterOptions.map((item) => (
                    <option key={item.warehouseId} value={item.warehouseId}>
                      {item.warehouseName} ({item.warehouseId})
                    </option>
                  ))}
                </Select>
              </SelectContainer>
              <Label style={{ width: "120px", fontWeight: "bold" }}>Mã vị trí:</Label>
              <input
                type="text"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Tìm kiếm theo Mã vị trí"
                className={styles.input}
                style={{ flex: 1 }}
              />
              <ActionButton
                onClick={handleSearch}
                disabled={isSearching}
                style={{ width: "130px", padding: "10px", fontSize: "14px", margin: 0 }}
              >
                {isSearching ? <ClipLoader size={18} color="#fff" /> : "Tìm kiếm"}
              </ActionButton>
              <Tag variant="accent">{totalItems} vị trí</Tag>
              <ActionButton
                variant="secondary"
                onClick={handleExportExcel}
                disabled={isExporting || isLoading || isSearching || totalItems === 0}
                style={{ margin: 0, width: 'auto', padding: '10px 14px', fontSize: '14px', display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
              >
                <AiOutlineDownload size={16} /> {isExporting ? 'Đang xuất...' : 'Xuất file Excel'}
              </ActionButton>
            </div>

            <div className={styles.tableWrapper}>
              {isLoading || isSearching ? (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "160px" }}>
                  <ClipLoader size={40} color="#0066CC" />
                </div>
              ) : filteredData.length === 0 ? (
                <div className={styles.emptyState}>Không tìm thấy vị trí phù hợp.</div>
              ) : (
                <Table style={{ minWidth: '1000px' }}>
                  <thead>
                    <tr>
                      <TableHeader style={{ width: "48px" }}>STT</TableHeader>
                      <TableHeader style={{ width: "160px" }}>Tên thiết bị</TableHeader>
                      <TableHeader style={{ width: "140px" }}>Mã vị trí</TableHeader>
                      <TableHeader style={{ width: "180px" }}>Kho hàng</TableHeader>
                      <TableHeader style={{ width: "140px" }}>Khu vực</TableHeader>
                      <TableHeader style={{ width: "160px" }}>Kích thước</TableHeader>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((item, index) => (
                      <tr key={index}>
                        <TableCell>{(page - 1) * PAGE_SIZE + index + 1}</TableCell>
                        <TableCell>{item.equipmentName}</TableCell>
                        <TableCell>{item.locationId}</TableCell>
                        <TableCell>{item.warehouseName}</TableCell>
                        <TableCell>{item.warehouseId}</TableCell>
                        <TableCell>{`${item.width || "--"} x ${item.length || "--"} x ${item.height || "--"} (m)`}</TableCell>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </div>
            {!isLoading && !isSearching && (
              <Pagination
                currentPage={page}
                totalItems={totalItems}
                pageSize={PAGE_SIZE}
                onPageChange={setPage}
                itemLabel="vị trí"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreLocation;
