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
import { getApiErrorMessage } from '../../../../api/apiError.js';
import { toast } from "react-toastify"; // Import toast for notifications
import "react-toastify/dist/ReactToastify.css";
import { ClipLoader } from 'react-spinners';
import styles from './StoreLocation.module.scss';

const errorTextStyle = { color: '#f43f5e', fontSize: '12px', marginTop: '4px' };

// Chỉ tải 100 dòng đầu mặc định để trang load nhanh; khi người dùng thực sự bấm Tìm kiếm
// mới tải toàn bộ (GetAllLocations không hỗ trợ tìm kiếm phía server, chỉ có phân trang).
const DEFAULT_PAGE_SIZE = 100;
const FULL_LOAD_SIZE = 100000;

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

const fetchLocations = async (itemsPerPage = DEFAULT_PAGE_SIZE) => {
  // GetAllLocations trả về QueryResult<LocationDTO> (results + totalItems)
  const response = await locationApi.getAllLocations({ pageNumber: 1, itemsPerPage });
  return (response?.results || []).map(mapLocation);
};

const StoreLocation = () => {
  const roles = useSelector((state) => state.auth.roles);
  const isAdmin = roles.includes('Admin');
  const [locations, setLocations] = useState([]);
  const [searchCode, setSearchCode] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [isCreateSectionHidden, setCreateSectionHidden] = useState(false);
  const [isSearchSectionHidden, setSearchSectionHidden] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isFullyLoaded, setIsFullyLoaded] = useState(false);
  const [formData, setFormData] = useState(emptyFormData);
  const [fieldErrors, setFieldErrors] = useState({});
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const mapped = await fetchLocations();
        setLocations(mapped);
        setFilteredData(mapped);
      } catch (error) {
        console.error("Error fetching locations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
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

        const mappedNewLocation = {
          ...newLocation,
          status: formData.status || "--",
          width: dimensionsArray[0] || "--",
          length: dimensionsArray[1] || "--",
          height: dimensionsArray[2] || "--",
        };
        setLocations((prev) => [...prev, mappedNewLocation]);
        setFilteredData((prev) => [...prev, mappedNewLocation]);

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

  const handleSearch = async () => {
    const normalized = searchCode.trim().toLowerCase();

    if (!normalized || isFullyLoaded) {
      setFilteredData(
        normalized ? locations.filter((item) => item.locationId?.toLowerCase().includes(normalized)) : locations
      );
      return;
    }

    setIsSearching(true);
    try {
      const fullList = await fetchLocations(FULL_LOAD_SIZE);
      setLocations(fullList);
      setIsFullyLoaded(true);
      setFilteredData(fullList.filter((item) => item.locationId?.toLowerCase().includes(normalized)));
    } catch (error) {
      console.error("Error fetching all locations for search:", error);
    } finally {
      setIsSearching(false);
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
          <SectionTitle className={styles.cardTitle}>Tìm kiếm vị trí lưu trữ</SectionTitle>
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
              <Tag variant="accent">{filteredData.length} vị trí</Tag>
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
                        <TableCell>{index + 1}</TableCell>
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
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreLocation;
