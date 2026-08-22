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
import styles from './Employees.module.scss';

const errorTextStyle = { color: '#f43f5e', fontSize: '12px', marginTop: '4px' };

// Chỉ hiển thị mặc định 100 dòng đầu (Employee/GetAllEmployees không hỗ trợ phân trang phía server).
const DEFAULT_PAGE_SIZE = 100;

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
  const [employees, setEmployees] = useState([]);
  const [employeeClasses, setEmployeeClasses] = useState([]);
  const [searchCode, setSearchCode] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [isCreateSectionHidden, setCreateSectionHidden] = useState(false);
  const [isSearchSectionHidden, setSearchSectionHidden] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState(emptyFormData);
  const [fieldErrors, setFieldErrors] = useState({});
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await employeeApi.getAllEmployees();
        const mapped = (response || []).map(mapEmployee);
        setEmployees(mapped);
        // Employee/GetAllEmployees không hỗ trợ phân trang (luôn trả về toàn bộ), nên chỉ giới hạn
        // số dòng hiển thị mặc định ở client; Tìm kiếm vẫn lọc trên toàn bộ `employees` đã tải.
        setFilteredData(mapped.slice(0, DEFAULT_PAGE_SIZE));
      } catch (error) {
        console.error("Error fetching employees:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchEmployeeClasses = async () => {
      try {
        const response = await employeeClassApi.getAllEmployeeClasses();
        setEmployeeClasses(response || []);
      } catch (error) {
        console.error("Error fetching employee classes:", error);
      }
    };

    fetchData();
    fetchEmployeeClasses();
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
    if (!formData.employeeName.trim()) nextFieldErrors.employeeName = 'Vui lòng nhập tên nhân viên';
    if (!formData.employeeId.trim()) nextFieldErrors.employeeId = 'Vui lòng nhập mã nhân viên';
    if (!formData.employeeClassId) nextFieldErrors.employeeClassId = 'Vui lòng chọn chức vụ';
    setFieldErrors(nextFieldErrors);
    return Object.keys(nextFieldErrors).length === 0;
  };

  const applyFilter = (list, term) => {
    const normalized = term.trim().toLowerCase();
    if (!normalized) return list;
    return list.filter((item) => item.employeeId?.toLowerCase().includes(normalized));
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

        const mappedNewEmployee = mapEmployee({
          ...newEmployee,
          employeePropertyDTOs: newEmployee.properties,
        });
        const updatedEmployees = [...employees, mappedNewEmployee];
        setEmployees(updatedEmployees);
        setFilteredData(applyFilter(updatedEmployees, searchCode));

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
    setFilteredData(applyFilter(employees, searchCode));
  };

  const employeeClassLabels = employeeClasses.reduce(
    (acc, item) => ({ ...acc, [item.employeeClassId]: item.employeeClassName }),
    {}
  );

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
              <Tag variant="accent">{filteredData.length} nhân viên</Tag>
            </div>

            <div className={styles.tableWrapper}>
              {isLoading ? (
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
                        <TableCell>{index + 1}</TableCell>
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
          </div>
        )}
      </div>
    </div>
  );
};

export default Employees;
