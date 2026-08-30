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
import employeeApi from '../../../../api/employeeApi.js';
import employeeClassApi from '../../../../api/employeeClassApi.js';
import { getApiErrorMessage } from '../../../../api/apiError.js';
import { toast } from "react-toastify"; // Import toast for notifications
import "react-toastify/dist/ReactToastify.css";
import { ClipLoader } from 'react-spinners';
import Pagination from '../../../../common/components/Pagination/Pagination.jsx';
import { AiOutlineDownload } from 'react-icons/ai';
import { exportTableToExcel, excelStamp } from '../../../../common/utils/exportTableToExcel.js';
import styles from './Employees.module.scss';

const errorTextStyle = { color: '#f43f5e', fontSize: '12px', marginTop: '4px' };

// Employee/GetAllEmployees và Employee/SearchEmployeesByEmployeeId đều hỗ trợ phân trang thật
// (pageNumber/itemsPerPage), nên duyệt danh sách hay tìm kiếm đều chỉ tải đúng 1 trang.
const PAGE_SIZE = 7;

const fetchEmployees = async ({ pageNumber = 1, itemsPerPage = PAGE_SIZE } = {}) => {
  try {
    const response = await employeeApi.getAllEmployees({ pageNumber, itemsPerPage });
    return { results: (response?.results || []).map(mapEmployee), totalItems: response?.totalItems || 0 };
  } catch (error) {
    console.error('Error fetching employees:', error);
    return { results: [], totalItems: 0 };
  }
};

const searchEmployees = async (employeeId, employeeClassId, { pageNumber = 1, itemsPerPage = PAGE_SIZE } = {}) => {
  try {
    const response = await employeeApi.searchEmployeesByEmployeeId(employeeId || undefined, employeeClassId || undefined, pageNumber, itemsPerPage);
    return { results: (response?.results || []).map(mapEmployee), totalItems: response?.totalItems || 0 };
  } catch (error) {
    console.error('Error searching employees:', error);
    return { results: [], totalItems: 0 };
  }
};

const emptyFormData = {
  employeeName: "",
  employeeId: "",
  employeeClassId: "",
  DateOfBirth: "",
  Email: "",
  startTime: "",
  endTime: "",
};

const mapEmployee = (employee) => {
  const dateOfBirth = employee.employeePropertyDTOs?.find(
    (prop) => prop.propertyName?.trim() === "DateOfBirth"
  )?.propertyValue || "--";

  const email = employee.employeePropertyDTOs?.find(
    (prop) => prop.propertyName?.trim() === "Email"
  )?.propertyValue || "--";

  const dailyWorkingTime = employee.employeePropertyDTOs?.find(
    (prop) => prop.propertyName?.trim() === "DailyWorkingTime"
  )?.propertyValue || "--";

  return {
    ...employee,
    employeeClassId: employee.employeeCLassId ?? employee.employeeClassId, // ⚠️ EmployeeDTO.employeeCLassId (chữ "L" hoa) theo API Guide
    dateOfBirth,
    email,
    dailyWorkingTime,
  };
};

const Employees = () => {
  const roles = useSelector((state) => state.auth.roles);
  const isAdmin = roles.includes('Admin');
  const [employeeClasses, setEmployeeClasses] = useState([]);
  // Danh sách rút gọn cho Selection box lọc theo Chức vụ (backend GetAllEmployeeClassNameId).
  const [employeeClassFilterOptions, setEmployeeClassFilterOptions] = useState([]);
  const [selectedEmployeeClassFilter, setSelectedEmployeeClassFilter] = useState("");
  const [searchCode, setSearchCode] = useState("");
  // Từ khóa thực sự dùng để gọi API — chỉ cập nhật khi bấm nút "Tìm kiếm"/Enter,
  // tránh gọi lại API theo từng ký tự gõ.
  const [appliedSearchCode, setAppliedSearchCode] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  // Tăng mỗi lần tạo mới nhân viên thành công để buộc effect tải lại dữ liệu ngay cả khi
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

  // Đổi từ khóa đã áp dụng hoặc đổi bộ lọc Chức vụ -> quay về trang 1
  useEffect(() => {
    setPage(1);
  }, [appliedSearchCode, selectedEmployeeClassFilter]);

  const isFiltering = Boolean(appliedSearchCode || selectedEmployeeClassFilter);

  useEffect(() => {
    const fetchData = async () => {
      const loadingSetter = isFiltering ? setIsSearching : setIsLoading;
      loadingSetter(true);
      try {
        const { results, totalItems: total } = isFiltering
          ? await searchEmployees(appliedSearchCode, selectedEmployeeClassFilter, { pageNumber: page, itemsPerPage: PAGE_SIZE })
          : await fetchEmployees({ pageNumber: page, itemsPerPage: PAGE_SIZE });
        setTotalItems(total);
        setFilteredData(results);
      } catch (error) {
        console.error("Error fetching employees:", error);
      } finally {
        loadingSetter(false);
      }
    };

    fetchData();
  }, [appliedSearchCode, selectedEmployeeClassFilter, isFiltering, page, refreshToken]);

  useEffect(() => {
    const fetchEmployeeClassFilterOptions = async () => {
      try {
        const response = await employeeClassApi.getAllEmployeeClassNameId();
        setEmployeeClassFilterOptions(response || []);
      } catch (error) {
        console.error("Error fetching employee class name/id list:", error);
      }
    };

    fetchEmployeeClassFilterOptions();
  }, []);

  // Chỉ gọi API danh sách Chức vụ (cho dropdown của form Tạo mới) khi người dùng
  // thực sự bấm "Hiện" để mở mục Tạo mới, không tải sẵn lúc vào trang.
  useEffect(() => {
    if (isCreateSectionHidden || employeeClasses.length > 0) return;

    const fetchEmployeeClasses = async () => {
      try {
        const response = await employeeClassApi.getAllEmployeeClasses();
        setEmployeeClasses(response || []);
      } catch (error) {
        console.error("Error fetching employee classes:", error);
      }
    };

    fetchEmployeeClasses();
  }, [isCreateSectionHidden, employeeClasses.length]);

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
    if (!formData.employeeName.trim()) nextFieldErrors.employeeName = 'Vui lòng nhập tên nhân viên';
    if (!formData.employeeId.trim()) nextFieldErrors.employeeId = 'Vui lòng nhập mã nhân viên';
    if (!formData.employeeClassId) nextFieldErrors.employeeClassId = 'Vui lòng chọn chức vụ';
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

    const newEmployee = {
      employeeName: formData.employeeName,
      employeeId: formData.employeeId,
      employeeClassId: formData.employeeClassId,
      properties: [
        {
          propertyName: "DateOfBirth",
          propertyValue: formData.DateOfBirth || "--",
          unitOfMeasure: "None",
        },
        {
          propertyName: "Email",
          propertyValue: formData.Email || "--",
          unitOfMeasure: "None",
        },
        {
          propertyName: "DailyWorkingTime",
          propertyValue: `${formData.startTime || "--"} - ${formData.endTime || "--"}`,
          unitOfMeasure: "None",
        },
      ],
    };

    try {
      const response = await employeeApi.createEmployee(newEmployee);
      if (response) {
        toast.success("Nhân viên đã được tạo thành công!", {
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
        setSelectedEmployeeClassFilter("");
        setPage(1);
        setRefreshToken((prev) => prev + 1);

        setFormData(emptyFormData);
        setFieldErrors({});
        setHasSubmitted(false);
      }
    } catch (error) {
      console.error("Error creating new employee:", error);
      toast.error(getApiErrorMessage(error, "Tạo nhân viên thất bại. Vui lòng thử lại!"), {
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

  const employeeClassLabels = {
    ...employeeClassFilterOptions.reduce(
      (acc, item) => ({ ...acc, [item.employeeClassId]: item.employeeClassName }),
      {}
    ),
    ...employeeClasses.reduce(
      (acc, item) => ({ ...acc, [item.employeeClassId]: item.employeeClassName }),
      {}
    ),
  };

  // Xuất TOÀN BỘ nhân viên khớp bộ lọc hiện tại (không chỉ trang đang xem) ra file .xlsx.
  const handleExportExcel = async () => {
    if (totalItems === 0 || isLoading || isSearching || isExporting) return;
    setIsExporting(true);
    try {
      const fetchPage = isFiltering
        ? (pn, ip) => searchEmployees(appliedSearchCode, selectedEmployeeClassFilter, { pageNumber: pn, itemsPerPage: ip })
        : (pn, ip) => fetchEmployees({ pageNumber: pn, itemsPerPage: ip });

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
        toast.info('Không có nhân viên nào để xuất.', { position: 'top-right', autoClose: 3000 });
        return;
      }

      const rows = all.map((item, i) => [
        i + 1,
        item.employeeName ?? '',
        item.employeeId ?? '',
        employeeClassLabels[item.employeeClassId] || item.employeeClassId || '',
        item.dateOfBirth ?? '--',
        item.email ?? '--',
        item.dailyWorkingTime ?? '--',
      ]);

      await exportTableToExcel({
        headers: ['STT', 'Tên nhân viên', 'Mã nhân viên', 'Chức vụ', 'Ngày sinh', 'Email', 'Thời gian làm việc'],
        rows,
        columnMeta: [
          { width: 5, align: 'center' }, { width: 28 }, { width: 16 }, { width: 22 },
          { width: 16, align: 'center' }, { width: 28 }, { width: 20, align: 'center' },
        ],
        sheetName: 'Nhân viên',
        filename: `Danh_muc_Nhan_vien_${excelStamp()}.xlsx`,
      });
      toast.success(`Đã xuất ${rows.length} nhân viên ra file Excel.`, { position: 'top-right', autoClose: 3000 });
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
          <SectionTitle className={styles.cardTitle}>Tạo mới nhân viên</SectionTitle>
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
                <Label required>Tên nhân viên:</Label>
                <input
                  type="text"
                  name="employeeName"
                  value={formData.employeeName}
                  onChange={handleInputChange}
                  className={styles.input}
                />
                {fieldErrors.employeeName && <div style={errorTextStyle}>{fieldErrors.employeeName}</div>}
              </div>

              <div className={styles.field}>
                <Label required>Mã nhân viên:</Label>
                <input
                  type="text"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleInputChange}
                  className={styles.input}
                />
                {fieldErrors.employeeId && <div style={errorTextStyle}>{fieldErrors.employeeId}</div>}
              </div>

              <div className={styles.field}>
                <Label required>Chức vụ:</Label>
                <SelectContainer>
                  <Select
                    value={formData.employeeClassId}
                    onChange={(e) => setFormData((prev) => ({ ...prev, employeeClassId: e.target.value }))}
                    placeholder="Chọn chức vụ"
                  >
                    {employeeClasses.map((opt) => (
                      <option key={opt.employeeClassId} value={opt.employeeClassId}>{opt.employeeClassName}</option>
                    ))}
                  </Select>
                </SelectContainer>
                {fieldErrors.employeeClassId && <div style={errorTextStyle}>{fieldErrors.employeeClassId}</div>}
              </div>

              <div className={styles.field}>
                <Label>Ngày sinh:</Label>
                <input
                  type="date"
                  name="DateOfBirth"
                  value={formData.DateOfBirth}
                  onChange={handleInputChange}
                  className={styles.input}
                />
              </div>

              <div className={styles.field}>
                <Label>Email:</Label>
                <input
                  type="email"
                  name="Email"
                  value={formData.Email}
                  onChange={handleInputChange}
                  className={styles.input}
                />
              </div>

              <div className={styles.field}>
                <Label>Thời gian làm việc:</Label>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    className={styles.input}
                  />
                  <span>-</span>
                  <input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleInputChange}
                    className={styles.input}
                  />
                </div>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "center", marginTop: "24px" }}>
              <ActionButton
                onClick={handleSave}
                style={{ width: "240px", padding: "14px", fontSize: "15px" }}
              >
                Tạo mới nhân viên
              </ActionButton>
            </div>
          </div>
        )}
      </div>
      )}

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <SectionTitle className={styles.cardTitle}>Danh sách nhân viên</SectionTitle>
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
                  value={selectedEmployeeClassFilter}
                  onChange={(e) => setSelectedEmployeeClassFilter(e.target.value)}
                  placeholder="Tất cả chức vụ"
                >
                  <option value="">Tất cả chức vụ</option>
                  {employeeClassFilterOptions.map((item) => (
                    <option key={item.employeeClassId} value={item.employeeClassId}>
                      {item.employeeClassName}
                    </option>
                  ))}
                </Select>
              </SelectContainer>
              <Label style={{ width: "120px", fontWeight: "bold" }}>Mã nhân viên:</Label>
              <input
                type="text"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Tìm kiếm theo Mã nhân viên"
                className={styles.input}
                style={{ flex: 1 }}
              />
              <ActionButton
                onClick={handleSearch}
                style={{ width: "130px", padding: "10px", fontSize: "14px", margin: 0 }}
              >
                Tìm kiếm
              </ActionButton>
              <Tag variant="accent">{totalItems} nhân viên</Tag>
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
                <div className={styles.emptyState}>Không tìm thấy nhân viên phù hợp.</div>
              ) : (
                <Table style={{ minWidth: '1000px' }}>
                  <thead>
                    <tr>
                      <TableHeader style={{ width: "48px" }}>STT</TableHeader>
                      <TableHeader style={{ width: "200px" }}>Tên nhân viên</TableHeader>
                      <TableHeader style={{ width: "140px" }}>Mã nhân viên</TableHeader>
                      <TableHeader style={{ width: "180px" }}>Chức vụ</TableHeader>
                      <TableHeader style={{ width: "140px" }}>Ngày sinh</TableHeader>
                      <TableHeader style={{ width: "180px" }}>Email</TableHeader>
                      <TableHeader style={{ width: "160px" }}>Thời gian làm việc</TableHeader>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((item, index) => (
                      <tr key={index}>
                        <TableCell>{(page - 1) * PAGE_SIZE + index + 1}</TableCell>
                        <TableCell>{item.employeeName}</TableCell>
                        <TableCell>{item.employeeId}</TableCell>
                        <TableCell>{employeeClassLabels[item.employeeClassId] || item.employeeClassId}</TableCell>
                        <TableCell>{item.dateOfBirth}</TableCell>
                        <TableCell>{item.email}</TableCell>
                        <TableCell>{item.dailyWorkingTime}</TableCell>
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
                itemLabel="nhân viên"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Employees;
