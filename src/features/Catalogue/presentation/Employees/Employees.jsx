import React, { useState } from 'react';
import SectionTitle from '../../../../common/components/Text/SectionTitle.jsx';
import FormGroup from '../../../../common/components/FormGroup/FormGroup.jsx';
import SelectContainer from '../../../../common/components/Selection/SelectContainer.jsx';
import ActionButton from '../../../../common/components/Button/ActionButton/ActionButton.jsx';
import Label from '../../../../common/components/Label/Label.jsx';
import personApi from '../../../../api/personApi.js';
import { toast } from "react-toastify"; // Import toast for notifications
import "react-toastify/dist/ReactToastify.css";
const InventoryHistory = () => {
  const [savedData, setSavedData] = useState([]);
  const [searchCode, setSearchCode] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [isCreateSectionHidden, setCreateSectionHidden] = useState(false);
  const [isSearchSectionHidden, setSearchSectionHidden] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Add loading state
  const [formData, setFormData] = useState({
    personName: "",
    personId: "",
    personClassId: "--",
    DateOfBirth: "",
    Email: "",
    startTime: "",
    endTime: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!formData.personId) {
      return; // Prevent saving if personId is empty
    }

    // Set default value for personClassId if not selected
    const personClassId = formData.personClassId === "--" ? "QLK" : formData.personClassId;

    // Prepare the newEmployee object for the API
    const newEmployee = {
      personName: formData.personName,
      personId: formData.personId,
      personClassId: personClassId, // Use the default or selected value
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
      console.log("New Employee Data to POST:", newEmployee); // Log the data being sent to the API

      // POST the newEmployee data to the API
      const response = await personApi.createPerson(newEmployee); // Ensure the API method is correct
      if (response) {
        // Show success notification
        toast.success("Nhân viên đã được tạo thành công!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });

        // Reset form data
        setFormData({
          personName: "",
          personId: "",
          personClassId: "--",
          DateOfBirth: "",
          Email: "",
          startTime: "",
          endTime: "",
        });
      }
    } catch (error) {
      console.error("Error creating new employee:", error);

      // Show failure notification
      toast.error("Tạo nhân viên thất bại. Vui lòng thử lại!", {
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
    if (!searchCode.trim()) {
      setFilteredData([]); // Clear the table if the input is empty
      return;
    }
    setIsLoading(true); // Start loading
    try {
      // Fetch employee data from the API
      const response = await personApi.getAllPerson(); // Replace with your API endpoint
      const employees = response || [];

      // Map and extract properties from personPropertyDTOs
      const mappedEmployees = employees.map((employee) => {
        const dateOfBirth = employee.personPropertyDTOs.find(
          (prop) => prop.propertyName === "DateOfBirth"
        )?.propertyValue || "--";

        const email = employee.personPropertyDTOs.find(
          (prop) => prop.propertyName === "Email"
        )?.propertyValue || "--";

        const dailyWorkingTime = employee.personPropertyDTOs.find(
          (prop) => prop.propertyName === "DailyWorkingTime"
        )?.propertyValue || "--";

        return {
          ...employee,
          personClassId: employee.personCLassId, // Corrected to use the correct property
          dateOfBirth,
          email,
          dailyWorkingTime,
        };
      });

      // Filter employees based on the search code
      const result = mappedEmployees.filter((item) =>
        item.personId.includes(searchCode)
      );
      setFilteredData(result);
    } catch (error) {
      console.error("Error fetching employees:", error);
      setFilteredData([]); // Clear the table on error
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  const handleDelete = (personId) => {
    setSavedData((prev) => prev.filter((item) => item.personId !== personId));
    setFilteredData((prev) => prev.filter((item) => item.personId !== personId));
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
                    name="personName"
                    value={formData.personName}
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
                    name="personId"
                    value={formData.personId}
                    onChange={handleInputChange}
                    style={{ width: "100%", padding: "5px", border: "1px solid #ccc" }} 
                  />
                </SelectContainer>
              </FormGroup>
              <FormGroup>
                <Label>Chức vụ:</Label>
                <SelectContainer>
                  <select 
                    name="personClassId"
                    value={formData.personClassId} 
                    onChange={handleInputChange}
                    style={{ width: "100%", padding: "5px", border: "1px solid #ccc" }}
                  >
                    <option value="QLK">Quản lý kho</option>
                    <option value="TK">Thủ kho</option>
                    <option value="NVK">Nhân viên vận chuyển</option>
                  </select>
                </SelectContainer>
              </FormGroup>
              <FormGroup>
                <Label>Ngày sinh:</Label>
                <SelectContainer>
                  <input 
                    type="date" 
                    name="DateOfBirth" 
                    value={formData.DateOfBirth} 
                    onChange={handleInputChange} 
                    style={{ width: "100%", padding: "5px", border: "1px solid #ccc" }} 
                  />
                </SelectContainer>
              </FormGroup>
              <FormGroup>
                <Label>Email:</Label>
                <SelectContainer>
                  <input 
                    type="Email" 
                    name="Email" 
                    value={formData.Email} 
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
                disabled={!formData.personId} 
                style={{ 
                  marginTop: "-10px",
                  padding: "10px 20px", 
                  width: "240px", 
                  backgroundColor: formData.personId ? "#007bff" : "#ccc", 
                  cursor: formData.personId ? "pointer" : "not-allowed",
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
                disabled={isLoading} // Disable button while loading
              >
                {"Tìm kiếm"} {/* Show loading text */}
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
              {isLoading ? ( // Show loading spinner while loading
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                  <div style={{ display: "flex", gap: "5px" }}>
                    <div style={{
                      width: "10px",
                      height: "10px",
                      backgroundColor: "#007bff",
                      borderRadius: "50%",
                      animation: "loadingDots 1.5s infinite ease-in-out",
                      animationDelay: "0s"
                    }}></div>
                    <div style={{
                      width: "10px",
                      height: "10px",
                      backgroundColor: "#007bff",
                      borderRadius: "50%",
                      animation: "loadingDots 1.5s infinite ease-in-out",
                      animationDelay: "0.2s"
                    }}></div>
                    <div style={{
                      width: "10px",
                      height: "10px",
                      backgroundColor: "#007bff",
                      borderRadius: "50%",
                      animation: "loadingDots 1.5s infinite ease-in-out",
                      animationDelay: "0.4s"
                    }}></div>
                  </div>
                </div>
              ) : (
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
                        <td style={{ padding: "8px", textAlign: "center" }}>{item.personName}</td>
                        <td style={{ padding: "8px", textAlign: "center" }}>{item.personId}</td>
                        <td style={{ padding: "8px", textAlign: "center" }}>{item.personClassId}</td>
                        <td style={{ padding: "8px", textAlign: "center" }}>{item.dateOfBirth}</td>
                        <td style={{ padding: "8px", textAlign: "center" }}>{item.email}</td>
                        <td style={{ padding: "8px", textAlign: "center" }}>{item.dailyWorkingTime}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
        </div>
    </div>
  );
};
<style>
</style>
export default InventoryHistory;

