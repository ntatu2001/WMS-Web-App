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
import Pagination from '../../../../common/components/Pagination/Pagination.jsx';
import { AiOutlineDownload } from 'react-icons/ai';
import { exportTableToExcel, excelStamp } from '../../../../common/utils/exportTableToExcel.js';
import useTranslation from '../../../../common/hooks/useTranslation';
import { formatNumber } from '../../../../common/i18n/format';
import styles from './Goods.module.scss';

const errorTextStyle = { color: 'var(--status-error)', fontSize: '12px', marginTop: '4px' };

// Material/GetAllMaterials và Material/SearchMaterialsByMaterialId đều hỗ trợ phân trang thật
// (pageNumber/itemsPerPage), nên duyệt danh sách hay tìm kiếm đều chỉ tải đúng 1 trang.
const PAGE_SIZE = 7;

const fetchMaterials = async ({ pageNumber = 1, itemsPerPage = PAGE_SIZE } = {}) => {
  try {
    const response = await materialApi.getAllMaterials({ pageNumber, itemsPerPage });
    return { results: response.results || [], totalItems: response.totalItems || 0 };
  } catch (error) {
    console.error('Error fetching materials:', error);
    return { results: [], totalItems: 0 };
  }
};

const searchMaterials = async (materialId, materialClassId, { pageNumber = 1, itemsPerPage = PAGE_SIZE } = {}) => {
  try {
    const response = await materialApi.searchMaterialsByMaterialId(materialId || undefined, materialClassId || undefined, pageNumber, itemsPerPage);
    return { results: response.results || [], totalItems: response.totalItems || 0 };
  } catch (error) {
    console.error('Error searching materials:', error);
    return { results: [], totalItems: 0 };
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

const fetchMaterialClassNameId = async () => {
  try {
    const response = await materialClassApi.getAllMaterialClassNameId();
    return response || [];
  } catch (error) {
    console.error('Error fetching material class name/id list:', error);
    return [];
  }
};

const formatCurrency = (value, lang, t) => `${formatNumber(value, lang)} ${t('common.currencySuffix')}`;

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
  const { t, lang } = useTranslation();
  const roles = useSelector((state) => state.auth.roles);
  const isAdmin = roles.includes('Admin');
  const [formData, setFormData] = useState(emptyFormData);

  const [materialClasses, setMaterialClasses] = useState([]);
  // Danh sách rút gọn cho Selection box lọc theo Loại sản phẩm (backend GetAllMaterialClassNameId).
  const [materialClassFilterOptions, setMaterialClassFilterOptions] = useState([]);
  const [selectedMaterialClassFilter, setSelectedMaterialClassFilter] = useState("");
  const [searchCode, setSearchCode] = useState("");
  // Từ khóa thực sự dùng để gọi API — chỉ cập nhật khi bấm nút "Tìm kiếm"/Enter,
  // tránh gọi lại API theo từng ký tự gõ.
  const [appliedSearchCode, setAppliedSearchCode] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  // Tăng mỗi lần tạo mới sản phẩm thành công để buộc effect tải lại dữ liệu ngay cả khi
  // appliedSearchCode/page không đổi giá trị.
  const [refreshToken, setRefreshToken] = useState(0);
  const [isCreateSectionHidden, setCreateSectionHidden] = useState(true);
  const [isSearchSectionHidden, setSearchSectionHidden] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Đổi từ khóa đã áp dụng hoặc đổi bộ lọc Loại sản phẩm -> quay về trang 1
  useEffect(() => {
    setPage(1);
  }, [appliedSearchCode, selectedMaterialClassFilter]);

  const isFiltering = Boolean(appliedSearchCode || selectedMaterialClassFilter);

  useEffect(() => {
    const fetchData = async () => {
      const loadingSetter = isFiltering ? setIsSearching : setIsLoading;
      loadingSetter(true);
      try {
        const { results, totalItems: total } = isFiltering
          ? await searchMaterials(appliedSearchCode, selectedMaterialClassFilter, { pageNumber: page, itemsPerPage: PAGE_SIZE })
          : await fetchMaterials({ pageNumber: page, itemsPerPage: PAGE_SIZE });
        setTotalItems(total);
        setFilteredData(results);
      } catch (error) {
        console.error("Error fetching materials:", error);
      } finally {
        loadingSetter(false);
      }
    };

    fetchData();
  }, [appliedSearchCode, selectedMaterialClassFilter, isFiltering, page, refreshToken]);

  useEffect(() => {
    const fetchFilterOptions = async () => {
      const data = await fetchMaterialClassNameId();
      setMaterialClassFilterOptions(data);
    };
    fetchFilterOptions();
  }, []);

  // Chỉ gọi API danh sách Loại sản phẩm (cho dropdown của form Tạo mới) khi người dùng
  // thực sự bấm "Hiện" để mở mục Tạo mới, không tải sẵn lúc vào trang.
  useEffect(() => {
    if (isCreateSectionHidden || materialClasses.length > 0) return;

    const fetchMaterialClasses = async () => {
      try {
        const data = await fetchMaterialClass();
        setMaterialClasses(data || []);
      } catch (error) {
        console.error("Error fetching material classes:", error);
      }
    };

    fetchMaterialClasses();
  }, [isCreateSectionHidden, materialClasses.length]);

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
    if (!formData.goodName.trim()) nextFieldErrors.goodName = t('catalogue.goods.valName');
    if (!formData.goodCode.trim()) nextFieldErrors.goodCode = t('catalogue.goods.valCode');
    if (!formData.unit) nextFieldErrors.unit = t('catalogue.goods.valUom');
    if (!formData.goodType) nextFieldErrors.goodType = t('catalogue.goods.valType');
    if (formData.minimumStock === '' || Number(formData.minimumStock) < 0) nextFieldErrors.minimumStock = t('catalogue.goods.valMinStock');
    if (!formData.price || Number(formData.price) <= 0) nextFieldErrors.price = t('catalogue.goods.valPrice');
    const level = Number(formData.StorageLevel);
    if (!formData.StorageLevel || level < 1 || level > 4) nextFieldErrors.storageLevel = t('catalogue.goods.valStorageLevel');
    setFieldErrors(nextFieldErrors);
    return Object.keys(nextFieldErrors).length === 0;
  };

  const handleSave = async () => {
    setHasSubmitted(true);
    if (!validateForm()) {
      toast.error(t('catalogue.goods.checkMissingFields'), {
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
        toast.success(t('catalogue.goods.createOk'), {
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
        setSelectedMaterialClassFilter("");
        setPage(1);
        setRefreshToken((prev) => prev + 1);
      }

      setFormData(emptyFormData);
      setFieldErrors({});
      setHasSubmitted(false);
    } catch (error) {
      console.error("Error creating new product:", error);
      toast.error(getApiErrorMessage(error, t('catalogue.goods.createFail')), {
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

  // Xuất TOÀN BỘ sản phẩm khớp bộ lọc hiện tại (không chỉ trang đang xem) ra file .xlsx.
  const handleExportExcel = async () => {
    if (totalItems === 0 || isLoading || isSearching || isExporting) return;
    setIsExporting(true);
    try {
      const fetchPage = isFiltering
        ? (pn, ip) => searchMaterials(appliedSearchCode, selectedMaterialClassFilter, { pageNumber: pn, itemsPerPage: ip })
        : (pn, ip) => fetchMaterials({ pageNumber: pn, itemsPerPage: ip });

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
        toast.info(t('catalogue.goods.noProductsToExport'), { position: 'top-right', autoClose: 3000 });
        return;
      }

      const prop = (item, name) => item.properties?.find(p => p.propertyName?.trim() === name)?.propertyValue;
      const rows = all.map((item, i) => {
        const dimensions = [
          prop(item, 'Width') || '--',
          prop(item, 'Length') || '--',
          prop(item, 'Height') || '--',
        ].join(' x ') + ' (m)';
        const level = Number(prop(item, 'StorageLevel'));
        return [
          i + 1,
          item.materialName ?? '',
          item.materialId ?? '',
          item.materialClassName || item.materialClassId || '',
          prop(item, 'Unit') || '--',
          Number(prop(item, 'Price') || 0),
          prop(item, 'MinimumStockLevel') ?? '0',
          prop(item, 'DefaultStockLevel') ?? '0',
          dimensions,
          level >= 1 && level <= 4 ? t('catalogue.goods.floor', { n: level }) : '--',
        ];
      });

      await exportTableToExcel({
        headers: [t('catalogue.goods.colNo'), t('catalogue.goods.colName'), t('catalogue.goods.colCode'),
          t('catalogue.goods.colType'), t('catalogue.goods.colUom'), t('catalogue.goods.colPriceUnit'),
          t('catalogue.goods.colMinStock'), t('catalogue.goods.colStandardRate'), t('catalogue.goods.colDimensions'),
          t('catalogue.goods.colStorageLevel')],
        rows,
        columnMeta: [
          { width: 5, align: 'center' }, { width: 34 }, { width: 16 }, { width: 20 },
          { width: 8, align: 'center' }, { width: 16, align: 'right', numFmt: '#,##0' },
          { width: 16, align: 'center' }, { width: 16, align: 'center' },
          { width: 20 }, { width: 18, align: 'center' },
        ],
        sheetName: t('catalogue.goods.sheetName'),
        filename: `${t('catalogue.goods.exportFilename')}_${excelStamp()}.xlsx`,
      });
      toast.success(t('catalogue.goods.exportedCount', { count: rows.length }), { position: 'top-right', autoClose: 3000 });
    } catch (error) {
      console.error('Export excel error:', error);
      toast.error(t('catalogue.goods.exportFailRetry'), { position: 'top-right', autoClose: 3000 });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div style={{ padding: '0 0 20px' }}>
      {isAdmin && (
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <SectionTitle className={styles.cardTitle}>{t('catalogue.goods.createTitle')}</SectionTitle>
          <button
            onClick={() => setCreateSectionHidden(!isCreateSectionHidden)}
            className={styles.toggleButton}
          >
            {isCreateSectionHidden ? t('catalogue.show') : t('catalogue.hide')}
          </button>
        </div>
        {!isCreateSectionHidden && (
          <div>
            <div className={styles.fieldGrid}>
              <div className={styles.field}>
                <Label required>{t('catalogue.goods.productName')}</Label>
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
                <Label required>{t('catalogue.goods.productCode')}</Label>
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
                <Label required>{t('catalogue.goods.uom')}</Label>
                <SelectContainer>
                  <Select
                    value={formData.unit}
                    onChange={(e) => setFormData((prev) => ({ ...prev, unit: e.target.value }))}
                    placeholder={t('catalogue.goods.selectUom')}
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
                <Label required>{t('catalogue.goods.productType')}</Label>
                <SelectContainer>
                  <Select
                    value={formData.goodType}
                    onChange={(e) => setFormData((prev) => ({ ...prev, goodType: e.target.value }))}
                    placeholder={t('catalogue.goods.selectProductType')}
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
                <Label required>{t('catalogue.goods.minStock')}</Label>
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
                <Label>{t('catalogue.goods.standardRate')}</Label>
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
                <Label>{t('catalogue.goods.dimensions')}</Label>
                <input
                  type="text"
                  name="dimensions"
                  placeholder={t('catalogue.goods.dimensionsPlaceholder')}
                  value={formData.dimensions}
                  onChange={handleInputChange}
                  className={styles.input}
                />
              </div>

              <div className={styles.field}>
                <Label required>{t('catalogue.goods.price')}</Label>
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
                <Label required>{t('catalogue.goods.storageLevelLimit')}</Label>
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
                {t('catalogue.goods.createBtn')}
              </ActionButton>
            </div>
          </div>
        )}
      </div>
      )}

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <SectionTitle className={styles.cardTitle}>{t('catalogue.goods.listTitle')}</SectionTitle>
          <button
            onClick={() => setSearchSectionHidden(!isSearchSectionHidden)}
            className={styles.toggleButton}
          >
            {isSearchSectionHidden ? t('catalogue.show') : t('catalogue.hide')}
          </button>
        </div>
        {!isSearchSectionHidden && (
          <div>
            <div className={styles.searchBar}>
              <SelectContainer style={{ maxWidth: "220px" }}>
                <Select
                  value={selectedMaterialClassFilter}
                  onChange={(e) => setSelectedMaterialClassFilter(e.target.value)}
                  placeholder={t('catalogue.goods.allProductTypes')}
                >
                  <option value="">{t('catalogue.goods.allProductTypes')}</option>
                  {materialClassFilterOptions.map((item) => (
                    <option key={item.materialClassId} value={item.materialClassId}>
                      {item.materialClassName}
                    </option>
                  ))}
                </Select>
              </SelectContainer>
              <Label style={{ width: "120px", fontWeight: "bold" }}>{t('catalogue.goods.productCode')}</Label>
              <input
                type="text"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder={t('catalogue.goods.searchByCode')}
                className={styles.input}
                style={{ flex: 1 }}
              />
              <ActionButton
                onClick={handleSearch}
                disabled={isSearching}
                style={{ width: "130px", padding: "10px", fontSize: "14px", margin: 0 }}
              >
                {isSearching ? <ClipLoader size={18} color="#fff" /> : t('common.search')}
              </ActionButton>
              <Tag variant="accent">{t('catalogue.goods.countProducts', { count: totalItems })}</Tag>
              <ActionButton
                variant="secondary"
                onClick={handleExportExcel}
                disabled={isExporting || isLoading || isSearching || totalItems === 0}
                style={{ margin: 0, width: 'auto', padding: '10px 14px', fontSize: '14px', display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
              >
                <AiOutlineDownload size={16} /> {isExporting ? t('catalogue.goods.exporting') : t('catalogue.goods.exportExcel')}
              </ActionButton>
            </div>

            <div className={styles.tableWrapper}>
              {isLoading || isSearching ? (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "160px" }}>
                  <ClipLoader size={40} color="var(--color-teal)" />
                </div>
              ) : filteredData.length === 0 ? (
                <div className={styles.emptyState}>{t('catalogue.goods.notFound')}</div>
              ) : (
                <Table style={{ minWidth: '1200px' }}>
                  <thead>
                    <tr>
                      <TableHeader style={{ width: "48px" }}>{t('catalogue.goods.colNo')}</TableHeader>
                      <TableHeader style={{ width: "220px" }}>{t('catalogue.goods.colName')}</TableHeader>
                      <TableHeader style={{ width: "140px" }}>{t('catalogue.goods.colCode')}</TableHeader>
                      <TableHeader style={{ width: "140px" }}>{t('catalogue.goods.colType')}</TableHeader>
                      <TableHeader style={{ width: "80px" }}>{t('catalogue.goods.colUom')}</TableHeader>
                      <TableHeader style={{ width: "120px" }}>{t('catalogue.goods.colPrice')}</TableHeader>
                      <TableHeader style={{ width: "120px" }}>{t('catalogue.goods.colMinStock')}</TableHeader>
                      <TableHeader style={{ width: "120px" }}>{t('catalogue.goods.colStandardRate')}</TableHeader>
                      <TableHeader style={{ width: "140px" }}>{t('catalogue.goods.colDimensions')}</TableHeader>
                      <TableHeader style={{ width: "140px" }}>{t('catalogue.goods.colStorageLevel')}</TableHeader>
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
                          <TableCell>{(page - 1) * PAGE_SIZE + index + 1}</TableCell>
                          <TableCell>{item.materialName}</TableCell>
                          <TableCell>{item.materialId}</TableCell>
                          <TableCell>{item.materialClassName || item.materialClassId}</TableCell>
                          <TableCell>{unitProperty ? unitProperty.propertyValue : "--"}</TableCell>
                          <TableCell>{formatCurrency(priceProperty?.propertyValue, lang, t)}</TableCell>
                          <TableCell>{minimumStockLevelProperty ? minimumStockLevelProperty.propertyValue : "0"}</TableCell>
                          <TableCell>{defaultStockLevelProperty ? defaultStockLevelProperty.propertyValue : "0"}</TableCell>
                          <TableCell>{dimensions}</TableCell>
                          <TableCell>
                            {hasStorageLevel ? (
                              <span className={clsx(styles.storagePill)} style={{ backgroundColor: storageLevel[storageLevelValue] }}>
                                {t('catalogue.goods.floor', { n: storageLevelValue })}
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
            {!isLoading && !isSearching && (
              <Pagination
                currentPage={page}
                totalItems={totalItems}
                pageSize={PAGE_SIZE}
                onPageChange={setPage}
                itemLabel={t('catalogue.goods.itemLabel')}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Goods;
