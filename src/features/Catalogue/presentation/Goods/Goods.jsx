import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import clsx from 'clsx';
import SectionTitle from '../../../../common/components/Text/SectionTitle.jsx';
import SelectContainer from '../../../../common/components/Selection/SelectContainer.jsx';
import Select from '../../../../common/components/Selection/Select.jsx';
import ActionButton from '../../../../common/components/Button/ActionButton/ActionButton.jsx';
import Label from '../../../../common/components/Label/Label.jsx';
import Table from '../../../../common/components/Table/Table.jsx';
import TableHeader from '../../../../common/components/Table/TableHeader.jsx';
import TableCell from '../../../../common/components/Table/TableCell.jsx';
import Tag from '../../../../common/components/Tag/Tag.jsx';
import materialApi from '../../../../api/materialApi.js';
import materialClassApi from '../../../../api/materialClassApi.js';
import { getApiErrorMessage } from '../../../../api/apiError.js';
import { listUnitOfMeasures } from '../../../../app/mockData/UnitOfMeasure.js';
import { storageLevel } from '../../../../app/mockData/StorageLevelData.js';
import { toast } from "react-toastify"; // Import toast for notifications
import "react-toastify/dist/ReactToastify.css";
import { ClipLoader } from 'react-spinners';
import styles from './Goods.module.scss';

const errorTextStyle = { color: '#f43f5e', fontSize: '12px', marginTop: '4px' };

const fetchMaterials = async () => {
  try {
    // Material/GetAllMaterials is paginated and requires pageNumber/itemsPerPage (API Guide mục 3)
    const response = await materialApi.getAllMaterials({ pageNumber: 1, itemsPerPage: 1000 });
    return response.results;
  } catch (error) {
    console.error('Error fetching materials:', error);
    return [];
  }
};

const fetchMaterialClass = async () => {
  try {
    const response = await materialClassApi.getAllMaterialClass();
    return response;
  } catch (error) {
    console.error(`Error fetching material classes:`, error);
    return null;
  }
};

const formatCurrency = (value) => `${Number(value || 0).toLocaleString('vi-VN')} đ`;

const emptyFormData = {
  goodName: "",
  goodCode: "",
  unit: "",
  goodType: "",
  minimumStock: "",
  standardRate: "",
  dimensions: "",
  price: "",
  StorageLevel: "",
};

const Goods = () => {
  const roles = useSelector((state) => state.auth.roles);
  const isAdmin = roles.includes('Admin');
  const [formData, setFormData] = useState(emptyFormData);

  const [materialClasses, setMaterialClasses] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchCode, setSearchCode] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [isCreateSectionHidden, setCreateSectionHidden] = useState(false);
  const [isSearchSectionHidden, setSearchSectionHidden] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await fetchMaterials();
        setProducts(data || []);
        setFilteredData(data || []);
      } catch (error) {
        console.error("Error fetching materials:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchMaterialClasses = async () => {
      try {
        const data = await fetchMaterialClass();
        setMaterialClasses(data || []);
      } catch (error) {
        console.error("Error fetching material classes:", error);
      }
    };

    fetchData();
    fetchMaterialClasses();
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
    if (!formData.goodName.trim()) nextFieldErrors.goodName = 'Vui lòng nhập tên sản phẩm';
    if (!formData.goodCode.trim()) nextFieldErrors.goodCode = 'Vui lòng nhập mã sản phẩm';
    if (!formData.unit) nextFieldErrors.unit = 'Vui lòng chọn đơn vị tính';
    if (!formData.goodType) nextFieldErrors.goodType = 'Vui lòng chọn loại sản phẩm';
    if (formData.minimumStock === '' || Number(formData.minimumStock) < 0) nextFieldErrors.minimumStock = 'Tồn kho tối thiểu phải lớn hơn hoặc bằng 0';
    if (!formData.price || Number(formData.price) <= 0) nextFieldErrors.price = 'Đơn giá phải lớn hơn 0';
    const level = Number(formData.StorageLevel);
    if (!formData.StorageLevel || level < 1 || level > 4) nextFieldErrors.storageLevel = 'Giới hạn tầng phải từ 1 đến 4';
    setFieldErrors(nextFieldErrors);
    return Object.keys(nextFieldErrors).length === 0;
  };

  const applyFilter = (list, term) => {
    const normalized = term.trim().toLowerCase();
    if (!normalized) return list;
    return list.filter((item) => item.materialId?.toLowerCase().includes(normalized));
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
    try {
      const selectedMaterialClass = materialClasses.find(
        (item) => item.materialClassId === formData.goodType
      );

      if (!selectedMaterialClass) {
        console.error("Invalid material class selected.");
        return;
      }

      const dimensions = formData.dimensions.split("x");
      const newProduct = {
        materialId: formData.goodCode,
        materialName: formData.goodName,
        materialClassId: formData.goodType,
        materialClassName: selectedMaterialClass.className,
        properties: [
          {
            propertyName: "Height",
            propertyValue: dimensions[2] || "--",
            unitOfMeasure: "Meter",
            materialId: formData.goodCode,
          },
          {
            propertyName: "Length",
            propertyValue: dimensions[1] || "--",
            unitOfMeasure: "Meter",
            materialId: formData.goodCode,
          },
          {
            propertyName: "Width",
            propertyValue: dimensions[0] || "--",
            unitOfMeasure: "Meter",
            materialId: formData.goodCode,
          },
          {
            propertyName: "Price",
            propertyValue: formData.price || "0",
            unitOfMeasure: "VND",
            materialId: formData.goodCode,
          },
          {
            propertyName: "MinimumStockLevel",
            propertyValue: formData.minimumStock || "0",
            unitOfMeasure: "None",
            materialId: formData.goodCode,
          },
          {
            propertyName: "Unit",
            propertyValue: formData.unit || "--",
            unitOfMeasure: "None",
            materialId: formData.goodCode,
          },
          {
            propertyName: "StorageLevel",
            propertyValue: formData.StorageLevel || "--",
            unitOfMeasure: "None",
            materialId: formData.goodCode,
          },
          {
            propertyName: "DefaultStockLevel",
            propertyValue: formData.standardRate || "0",
            unitOfMeasure: "None",
            materialId: formData.goodCode,
          },
          {
            propertyName: "Type",
            propertyValue: formData.goodType || "--",
            unitOfMeasure: "None",
            materialId: formData.goodCode,
          },
        ],
      };

      const response = await materialApi.createMaterial(newProduct);
      if (response) {
        toast.success("Sản phẩm đã được tạo thành công!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });

        const updatedProducts = [...products, newProduct];
        setProducts(updatedProducts);
        setFilteredData(applyFilter(updatedProducts, searchCode));
      }

      setFormData(emptyFormData);
      setFieldErrors({});
      setHasSubmitted(false);
    } catch (error) {
      console.error("Error creating new product:", error);
      toast.error(getApiErrorMessage(error, "Tạo sản phẩm thất bại. Vui lòng thử lại!"), {
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
    setFilteredData(applyFilter(products, searchCode));
  };

  return (
    <div style={{ padding: '0 0 20px' }}>
      {isAdmin && (
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <SectionTitle className={styles.cardTitle}>Tạo mới sản phẩm</SectionTitle>
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
                <Label required>Tên sản phẩm:</Label>
                <input
                  type="text"
                  name="goodName"
                  value={formData.goodName}
                  onChange={handleInputChange}
                  className={styles.input}
                />
                {fieldErrors.goodName && <div style={errorTextStyle}>{fieldErrors.goodName}</div>}
              </div>

              <div className={styles.field}>
                <Label required>Mã sản phẩm:</Label>
                <input
                  type="text"
                  name="goodCode"
                  value={formData.goodCode}
                  onChange={handleInputChange}
                  className={styles.input}
                />
                {fieldErrors.goodCode && <div style={errorTextStyle}>{fieldErrors.goodCode}</div>}
              </div>

              <div className={styles.field}>
                <Label required>Đơn vị tính:</Label>
                <SelectContainer>
                  <Select
                    value={formData.unit}
                    onChange={(e) => setFormData((prev) => ({ ...prev, unit: e.target.value }))}
                    placeholder="Chọn đơn vị tính"
                  >
                    {listUnitOfMeasures.map((unitOption, index) => (
                      <option key={`unit-${index}`} value={unitOption}>
                        {unitOption}
                      </option>
                    ))}
                  </Select>
                </SelectContainer>
                {fieldErrors.unit && <div style={errorTextStyle}>{fieldErrors.unit}</div>}
              </div>

              <div className={styles.field}>
                <Label required>Loại sản phẩm:</Label>
                <SelectContainer>
                  <Select
                    value={formData.goodType}
                    onChange={(e) => setFormData((prev) => ({ ...prev, goodType: e.target.value }))}
                    placeholder="Chọn loại sản phẩm"
                  >
                    {materialClasses.map((materialClass) => (
                      <option key={materialClass.materialClassId} value={materialClass.materialClassId}>
                        {materialClass.className}
                      </option>
                    ))}
                  </Select>
                </SelectContainer>
                {fieldErrors.goodType && <div style={errorTextStyle}>{fieldErrors.goodType}</div>}
              </div>

              <div className={styles.field}>
                <Label required>Tồn kho tối thiểu:</Label>
                <input
                  type="number"
                  name="minimumStock"
                  min="0"
                  value={formData.minimumStock}
                  onChange={handleInputChange}
                  className={styles.input}
                />
                {fieldErrors.minimumStock && <div style={errorTextStyle}>{fieldErrors.minimumStock}</div>}
              </div>

              <div className={styles.field}>
                <Label>Định mức:</Label>
                <input
                  type="number"
                  name="standardRate"
                  min="0"
                  value={formData.standardRate}
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

              <div className={styles.field}>
                <Label required>Đơn giá (đ):</Label>
                <input
                  type="number"
                  name="price"
                  min="0"
                  value={formData.price}
                  onChange={handleInputChange}
                  className={styles.input}
                />
                {fieldErrors.price && <div style={errorTextStyle}>{fieldErrors.price}</div>}
              </div>

              <div className={styles.field}>
                <Label required>Giới hạn tầng lưu trữ (1-4):</Label>
                <input
                  type="number"
                  name="StorageLevel"
                  min="1"
                  max="4"
                  value={formData.StorageLevel}
                  onChange={handleInputChange}
                  className={styles.input}
                />
                {fieldErrors.storageLevel && <div style={errorTextStyle}>{fieldErrors.storageLevel}</div>}
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "center", marginTop: "24px" }}>
              <ActionButton
                onClick={handleSave}
                style={{ width: "240px", padding: "14px", fontSize: "15px" }}
              >
                Tạo mới sản phẩm
              </ActionButton>
            </div>
          </div>
        )}
      </div>
      )}

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <SectionTitle className={styles.cardTitle}>Tìm kiếm sản phẩm</SectionTitle>
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
              <Label style={{ width: "120px", fontWeight: "bold" }}>Mã sản phẩm:</Label>
              <input
                type="text"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Tìm kiếm theo Mã sản phẩm"
                className={styles.input}
                style={{ flex: 1 }}
              />
              <ActionButton
                onClick={handleSearch}
                style={{ width: "130px", padding: "10px", fontSize: "14px", margin: 0 }}
              >
                Tìm kiếm
              </ActionButton>
              <Tag variant="accent">{filteredData.length} sản phẩm</Tag>
            </div>

            <div className={styles.tableWrapper}>
              {isLoading ? (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "160px" }}>
                  <ClipLoader size={40} color="#0066CC" />
                </div>
              ) : filteredData.length === 0 ? (
                <div className={styles.emptyState}>Không tìm thấy sản phẩm phù hợp.</div>
              ) : (
                <Table style={{ minWidth: '1200px' }}>
                  <thead>
                    <tr>
                      <TableHeader style={{ width: "48px" }}>STT</TableHeader>
                      <TableHeader style={{ width: "220px" }}>Tên sản phẩm</TableHeader>
                      <TableHeader style={{ width: "140px" }}>Mã sản phẩm</TableHeader>
                      <TableHeader style={{ width: "140px" }}>Loại sản phẩm</TableHeader>
                      <TableHeader style={{ width: "80px" }}>ĐVT</TableHeader>
                      <TableHeader style={{ width: "120px" }}>Đơn giá</TableHeader>
                      <TableHeader style={{ width: "120px" }}>Tồn kho tối thiểu</TableHeader>
                      <TableHeader style={{ width: "120px" }}>Định mức tồn kho</TableHeader>
                      <TableHeader style={{ width: "140px" }}>Kích thước</TableHeader>
                      <TableHeader style={{ width: "140px" }}>Giới hạn tầng lưu trữ</TableHeader>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((item, index) => {
                      const unitProperty = item.properties?.find((prop) => prop.propertyName?.trim() === "Unit");
                      const priceProperty = item.properties?.find((prop) => prop.propertyName?.trim() === "Price");
                      const minimumStockLevelProperty = item.properties?.find((prop) => prop.propertyName?.trim() === "MinimumStockLevel");
                      const defaultStockLevelProperty = item.properties?.find((prop) => prop.propertyName?.trim() === "DefaultStockLevel");
                      const widthProperty = item.properties?.find((prop) => prop.propertyName?.trim() === "Width");
                      const lengthProperty = item.properties?.find((prop) => prop.propertyName?.trim() === "Length");
                      const heightProperty = item.properties?.find((prop) => prop.propertyName?.trim() === "Height");
                      const storageLevelProperty = item.properties?.find((prop) => prop.propertyName?.trim() === "StorageLevel");

                      const dimensions = [
                        widthProperty?.propertyValue || "--",
                        lengthProperty?.propertyValue || "--",
                        heightProperty?.propertyValue || "--",
                      ].join(" x ") + " (m)";

                      const storageLevelValue = Number(storageLevelProperty?.propertyValue);
                      const hasStorageLevel = storageLevelValue >= 1 && storageLevelValue <= 4;

                      return (
                        <tr key={index}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{item.materialName}</TableCell>
                          <TableCell>{item.materialId}</TableCell>
                          <TableCell>{item.materialClassName || item.materialClassId}</TableCell>
                          <TableCell>{unitProperty ? unitProperty.propertyValue : "--"}</TableCell>
                          <TableCell>{formatCurrency(priceProperty?.propertyValue)}</TableCell>
                          <TableCell>{minimumStockLevelProperty ? minimumStockLevelProperty.propertyValue : "0"}</TableCell>
                          <TableCell>{defaultStockLevelProperty ? defaultStockLevelProperty.propertyValue : "0"}</TableCell>
                          <TableCell>{dimensions}</TableCell>
                          <TableCell>
                            {hasStorageLevel ? (
                              <span className={clsx(styles.storagePill)} style={{ backgroundColor: storageLevel[storageLevelValue] }}>
                                Tầng {storageLevelValue}
                              </span>
                            ) : "--"}
                          </TableCell>
                        </tr>
                      );
                    })}
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

export default Goods;
