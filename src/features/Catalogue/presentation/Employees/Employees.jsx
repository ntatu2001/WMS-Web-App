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
import DeleteButton from '../../../../common/components/Button/DeleteButton/DeleteButton.jsx';
import {listIssueStorage, listIssueHistory} from '../../../../app/mockData/HistoryData.js';
import SearchInput from '../../../../common/components/Input/SearchInput.jsx';
import LabelSmallSize from '../../../../common/components/Label/LabelSmallSize.jsx';
import clsx from 'clsx';
import styles from './Employees.module.scss';
import personApi from '../../../../api/personApi.js';

const InventoryHistory = () => {
  const [formData, setFormData] = useState({
      personName: "",
      personId: "",
      employeeType: "--",
      birthday: "",
      email: "",
      startTime: "",
      endTime: "",
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
    if (!formData.employeeCode) {
        return; // Prevent updating information
    }
    console.log("New Employee Data:", formData); // Log the form data to the console
    setFormData({
        personName: "",
        personId: "",
        employeeType: "--",
        birthday: "",
        email: "",
        startTime: "",
        endTime: "",
    });
  };

  const handleSearch = async () => {
    if (!searchCode.trim()) {
      setFilteredData([]); // Clear the table if the input is empty
      return;
    }
    try {
      // Fetch employee data from the API
      const response = await personApi.getAllPerson(); // Replace with your API endpoint
      const employees = response || [];

      // Filter employees based on the search code
      const result = employees.filter((item) => item.personId.includes(searchCode));
      setFilteredData(result);
    } catch (error) {
      console.error("Error fetching employees:", error);
      setFilteredData([]); // Clear the table on error
    }
  };

  const handleDelete = (employeeCode) => {
    setSavedData((prev) => prev.filter((item) => item.employeeCode !== employeeCode));
    setFilteredData((prev) => prev.filter((item) => item.employeeCode !== employeeCode));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", padding: "0 20px",}}>
        <div style={{backgroundColor:"white", padding:"20px", borderBottom:"2px solid #ccc", boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"}}>
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
            position: "relative"
          }}
        >
          Tạo mới nhân viên
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
            onMouseEnter={(e) => e.target.style.color = "#0056b3"} 
            onMouseLeave={(e) => e.target.style.color = "#007bff"} 
          >
            {isCreateSectionHidden ? "Hiện" : "Ẩn"}
          </button>
        </SectionTitle>
        
        </div>
        {!isCreateSectionHidden && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", }}>
              <FormGroup>
                <Label>Tên nhân viên:</Label>
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
                <Label>Mã nhân viên:</Label>
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
                <Label>Chức vụ:</Label>
                <SelectContainer>
                  <select 
                    name="position"
                    value={formData.position} 
                    onChange={handleInputChange}
                    style={{ width: "100%", padding: "5px", border: "1px solid #ccc" }}
                  >
                    <option value="--">--</option>
                    <option value="Quản lý kho">Quản lý kho</option>
                    <option value="Thủ kho">Thủ kho</option>
                    <option value="Nhân viên vận chuyển">Nhân viên vận chuyển</option>
                  </select>
                </SelectContainer>
              </FormGroup>
              <FormGroup>
                <Label>Ngày sinh:</Label>
                <SelectContainer>
                  <input 
                    type="date" 
                    name="birthday" 
                    value={formData.birthday} 
                    onChange={handleInputChange} 
                    style={{ width: "100%", padding: "5px", border: "1px solid #ccc" }} 
                  />
                </SelectContainer>
              </FormGroup>
              <FormGroup>
                <Label>Email:</Label>
                <SelectContainer>
                  <input 
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleInputChange} 
                    style={{ width: "100%", padding: "5px", border: "1px solid #ccc" }} 
                  />
                </SelectContainer>
              </FormGroup>
              <FormGroup>
                <Label>Thời gian làm việc:</Label>
                <SelectContainer>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <input 
                      type="time" 
                      name="startTime" 
                      value={formData.startTime} 
                      onChange={handleInputChange} 
                      style={{ width: "100%", padding: "5px", border: "1px solid #ccc" }} 
                    />
                    <span style={{ alignSelf: "center" }}>-</span>
                    <input 
                      type="time" 
                      name="endTime" 
                      value={formData.endTime} 
                      onChange={handleInputChange} 
                      style={{ width: "100%", padding: "5px", border: "1px solid #ccc" }} 
                    />
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
                Tạo mới nhân viên
              </ActionButton>
            </div>
          </div>
        )}
        </div>

      {/* Below Section */}
        <div style={{backgroundColor:"white", padding:"20px", boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"}}>
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
            position: "relative"
          }}
        >
          Tìm kiếm nhân viên
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
            onMouseEnter={(e) => e.target.style.color = "#0056b3"} 
            onMouseLeave={(e) => e.target.style.color = "#007bff"} 
          >
            {isSearchSectionHidden ? "Hiện" : "Ẩn"}
          </button>
        </SectionTitle>
        </div>
        {!isSearchSectionHidden && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent: "space-between", marginBottom: "20px" }}>
              <Label style={{ width: "110px", fontWeight: "bold" }}>Mã nhân viên:</Label>
              <input 
                type="text" 
                value={searchCode} 
                onChange={(e) => setSearchCode(e.target.value)} 
                placeholder="Tìm kiếm theo Mã nhân viên" 
                style={{ flex: 1, padding: "8px", border: "1px solid #ccc", borderRadius: "4px", width: "calc(100% - 200px)",borderBottom: "2px solid #ccc" }} 
              />
              <ActionButton 
                onClick={handleSearch} 
                style={{ padding: "8px 20px", backgroundColor: "#007bff", color: "#fff", border: "none", borderRadius: "4px", width: "130px", marginTop: "0px" }}
              >
                Tìm kiếm
              </ActionButton>
            </div>

            <div 
              style={{ 
                position: "relative", 
                overflowY: "auto", 
                maxHeight: "300px", 
                border: "1px solid #ccc" 
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
                    <th style={{ borderBottom: "1px solid #ccc", padding: "8px", textAlign: "center" }}>Tên nhân viên</th>
                    <th style={{ borderBottom: "1px solid #ccc", padding: "8px", textAlign: "center" }}>Mã nhân viên</th>
                    <th style={{ borderBottom: "1px solid #ccc", padding: "8px", textAlign: "center" }}>Chức vụ</th>
                    <th style={{ borderBottom: "1px solid #ccc", padding: "8px", textAlign: "center" }}>Ngày sinh</th>
                    <th style={{ borderBottom: "1px solid #ccc", padding: "8px", textAlign: "center" }}>Email</th>
                    <th style={{ borderBottom: "1px solid #ccc", padding: "8px", textAlign: "center" }}>Thời gian làm việc</th>
                    
                  </tr>
                </thead>
                <tbody>
                  {(searchCode ? filteredData : savedData).map((item, index) => (
                    <tr key={index} style={{ borderBottom: "1px solid #ccc" }}>
                      <td style={{ padding: "8px", textAlign: "center" }}>{index + 1}</td>
                      <td style={{ padding: "8px", textAlign: "center" }}>{item.employeeName}</td>
                      <td style={{ padding: "8px", textAlign: "center" }}>{item.employeeCode}</td>
                      <td style={{ padding: "8px", textAlign: "center" }}>{item.position}</td>
                      <td style={{ padding: "8px", textAlign: "center" }}>{item.birthday}</td>
                      <td style={{ padding: "8px", textAlign: "center" }}>{item.email}</td>
                      
                      
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