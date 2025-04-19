import React, { useState } from 'react';
import { FaEye, FaTrash } from 'react-icons/fa';
import SectionTitle from '../../../../common/components/Text/SectionTitle.jsx';
import Table from '../../../../common/components/Table/Table.jsx';
import TableHeader from '../../../../common/components/Table/TableHeader.jsx';
import TableCell from '../../../../common/components/Table/TableCell.jsx';
import FormGroup from '../../../../common/components/FormGroup/FormGroup.jsx';
import SelectContainer from '../../../../common/components/Selection/SelectContainer.jsx';
import ActionButton from '../../../../common/components/Button/ActionButton/ActionButton.jsx';
import DateInput from '../../../../common/components/DateInput/DateInput.jsx';
import Label from '../../../../common/components/Label/Label.jsx';
import FormSection from '../../../../common/components/Section/FormSection.jsx';
import ListSection from '../../../../common/components/Section/ListSection.jsx';
import FaEyeButton from '../../../../common/components/Button/FaEyeButton/FaEyeButton.jsx';
import { listReceiptStorage, listReceiptHistory } from '../../../../app/mockData/HistoryData.js';
import SearchInput from '../../../../common/components/Input/SearchInput.jsx';
import LabelSmallSize from '../../../../common/components/Label/LabelSmallSize.jsx';
import clsx from 'clsx';
import styles from './StoreLocation.module.scss';

const InventoryHistory = () => {
  const [formData, setFormData] = useState({
    employeeName: "",
    employeeCode: "",
    position: "--",
    birthday: "",
    email: "",
    startTime: "",
    endTime: "",
    description: "",
    warehouse: "",
    area: "",
    size: "",
  });

  const [savedData, setSavedData] = useState([]);
  const [searchCode, setSearchCode] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [isCreateSectionHidden, setCreateSectionHidden] = useState(false);
  const [isSearchSectionHidden, setSearchSectionHidden] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setSavedData((prev) => [...prev, formData]);
    setFormData({
      employeeName: "",
      employeeCode: "",
      position: "--",
      birthday: "",
      email: "",
      startTime: "",
      endTime: "",
      description: "",
      warehouse: "",
      area: "",
      size: "",
    });
  };

  const handleSearch = () => {
    const result = savedData.filter((item) => item.employeeCode.includes(searchCode));
    setFilteredData(result);
  };

  const handleDelete = (employeeCode) => {
    setSavedData((prev) => prev.filter((item) => item.employeeCode !== employeeCode));
    setFilteredData((prev) => prev.filter((item) => item.employeeCode !== employeeCode));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", padding: "0 20px" }}>
      <div style={{ backgroundColor: "white", padding: "20px", borderBottom: "2px solid #ccc", boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 20px" }}>
          <SectionTitle
            style={{
              fontSize: "30px",
              marginBottom: "20px",
              width: "100%",
              textAlign: "center",
              borderBottom: "2px solid #ccc",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              flex: "1",
              position: "relative",
            }}
          >
            Tạo mới vị trí lưu trữ
            <button
              onClick={() => setCreateSectionHidden(!isCreateSectionHidden)}
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "16px",
                color: "#007bff",
                transition: "color 0.3s ease, transform 0.3s ease",
              }}
              onMouseEnter={(e) => (e.target.style.color = "#0056b3")}
              onMouseLeave={(e) => (e.target.style.color = "#007bff")}
            >
              {isCreateSectionHidden ? "Hiện" : "Ẩn"}
            </button>
          </SectionTitle>
        </div>
        {!isCreateSectionHidden && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
              <FormGroup>
                <Label>Tên thiết bị:</Label>
                <SelectContainer>
                  <input
                    type="text"
                    name="employeeName"
                    value={formData.employeeName}
                    onChange={handleInputChange}
                    style={{ width: "100%", padding: "5px", border: "1px solid #ccc" }}
                  />
                </SelectContainer>
              </FormGroup>
              <FormGroup>
                <Label>Mã vị trí:</Label>
                <SelectContainer>
                  <input
                    type="text"
                    name="employeeCode"
                    value={formData.employeeCode}
                    onChange={handleInputChange}
                    style={{ width: "100%", padding: "5px", border: "1px solid #ccc" }}
                  />
                </SelectContainer>
              </FormGroup>
              <FormGroup>
                <Label>Mô tả:</Label>
                <SelectContainer>
                  <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    style={{ width: "100%", padding: "5px", border: "1px solid #ccc" }}
                  />
                </SelectContainer>
              </FormGroup>
              <FormGroup>
                <Label>Kho hàng:</Label>
                <SelectContainer>
                  <select
                    name="warehouse"
                    value={formData.warehouse}
                    onChange={handleInputChange}
                    style={{ width: "100%", padding: "5px", border: "1px solid #ccc" }}
                  >
                    <option value="--">--</option>
                    <option value="Kho B">Kho B</option>
                    <option value="Kho C">Kho C</option>
                    <option value="Kho D">Kho D</option>
                  </select>
                </SelectContainer>
              </FormGroup>
              <FormGroup>
                <Label>Khu vực:</Label>
                <SelectContainer>
                  <select
                    name="area"
                    value={formData.area}
                    onChange={handleInputChange}
                    style={{ width: "100%", padding: "5px", border: "1px solid #ccc" }}
                  >
                    <option value="--">--</option>
                    <option value="Khu B">Khu B</option>
                    <option value="Khu C">Khu C</option>
                    <option value="Khu D">Khu D</option>
                  </select>
                </SelectContainer>
              </FormGroup>
              <FormGroup>
                <Label>Kích thước:</Label>
                <SelectContainer>
                  <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                    <input
                      type="text"
                      name="size"
                      value={formData.size}
                      onChange={handleInputChange}
                      style={{ width: "100%", padding: "5px 30px 5px 5px", border: "1px solid #ccc" }}
                    />
                    <span style={{ position: "absolute", right: "10px", color: "#888" }}>mm</span>
                  </div>
                </SelectContainer>
              </FormGroup>
            </div>
            <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
              <ActionButton
                onClick={handleSave}
                disabled={!formData.employeeCode}
                style={{
                  marginTop: "-10px",
                  padding: "10px 20px",
                  width: "240px",
                  backgroundColor: formData.employeeCode ? "#007bff" : "#ccc",
                  cursor: formData.employeeCode ? "pointer" : "not-allowed",
                }}
              >
                Tạo mới vị trí
              </ActionButton>
            </div>
          </div>
        )}
      </div>

      {/* Below Section */}
      <div style={{ backgroundColor: "white", padding: "20px", boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 20px" }}>
          <SectionTitle
            style={{
              fontSize: "30px",
              marginBottom: "20px",
              width: "100%",
              textAlign: "center",
              borderBottom: "2px solid #ccc",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              flex: "1",
              position: "relative",
            }}
          >
            Tìm kiếm vị trí lưu trữ
            <button
              onClick={() => setSearchSectionHidden(!isSearchSectionHidden)}
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "16px",
                color: "#007bff",
                transition: "color 0.3s ease, transform 0.3s ease",
              }}
              onMouseEnter={(e) => (e.target.style.color = "#0056b3")}
              onMouseLeave={(e) => (e.target.style.color = "#007bff")}
            >
              {isSearchSectionHidden ? "Hiện" : "Ẩn"}
            </button>
          </SectionTitle>
        </div>
        {!isSearchSectionHidden && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent: "space-between", marginBottom: "20px" }}>
              <Label style={{ width: "110px", fontWeight: "bold" }}>Mã vị trí:</Label>
              <input
                type="text"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                placeholder="Tìm kiếm theo Mã vị trí"
                style={{
                  flex: 1,
                  padding: "8px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  width: "calc(100% - 200px)",
                  borderBottom: "2px solid #ccc",
                }}
              />
              <ActionButton
                onClick={handleSearch}
                style={{
                  padding: "8px 20px",
                  backgroundColor: "#007bff",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  width: "130px",
                  marginTop: "0px",
                }}
              >
                Tìm kiếm
              </ActionButton>
            </div>

            <div
              style={{
                position: "relative",
                overflowY: "auto",
                maxHeight: "300px",
                border: "1px solid #ccc",
              }}
              onWheel={(e) => {
                e.stopPropagation();
                const container = e.currentTarget;
                container.scrollTop += e.deltaY;
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse", borderRight: "1px solid #ccc", borderLeft: "1px solid #ccc" }}>
                <thead>
                  <tr>
                    <th style={{ borderBottom: "1px solid #ccc", padding: "8px", textAlign: "center" }}>STT</th>
                    <th style={{ borderBottom: "1px solid #ccc", padding: "8px", textAlign: "center" }}>Tên thiết bị</th>
                    <th style={{ borderBottom: "1px solid #ccc", padding: "8px", textAlign: "center" }}>Mã vị trí</th>
                    <th style={{ borderBottom: "1px solid #ccc", padding: "8px", textAlign: "center" }}>Mô tả</th>
                    <th style={{ borderBottom: "1px solid #ccc", padding: "8px", textAlign: "center" }}>Kho hàng</th>
                    <th style={{ borderBottom: "1px solid #ccc", padding: "8px", textAlign: "center" }}>Khu vực</th>
                    <th style={{ borderBottom: "1px solid #ccc", padding: "8px", textAlign: "center" }}>Kích thước</th>
                    <th style={{ borderBottom: "1px solid #ccc", padding: "8px", textAlign: "center" }}></th>
                  </tr>
                </thead>
                <tbody>
                  {(searchCode ? filteredData : savedData).map((item, index) => (
                    <tr key={index} style={{ borderBottom: "1px solid #ccc" }}>
                      <td style={{ padding: "8px", textAlign: "center" }}>{index + 1}</td>
                      <td style={{ padding: "8px", textAlign: "center" }}>{item.employeeName}</td>
                      <td style={{ padding: "8px", textAlign: "center" }}>{item.employeeCode}</td>
                      <td style={{ padding: "8px", textAlign: "center" }}>{item.description}</td>
                      <td style={{ padding: "8px", textAlign: "center" }}>{item.warehouse}</td>
                      <td style={{ padding: "8px", textAlign: "center" }}>{item.area}</td>
                      <td style={{ padding: "8px", textAlign: "center" }}>{item.size} mm</td>
                      <td style={{ padding: "8px", textAlign: "center" }}>
                        <button
                          onClick={() => handleDelete(item.employeeCode)}
                          style={{ padding: "5px", backgroundColor: "transparent", border: "none", cursor: "pointer", color: "#ff4d4f" }}
                        >
                          <FaTrash size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryHistory;