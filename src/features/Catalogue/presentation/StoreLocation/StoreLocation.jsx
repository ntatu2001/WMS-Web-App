import React, { useState } from 'react';
import SectionTitle from '../../../../common/components/Text/SectionTitle.jsx';
import FormGroup from '../../../../common/components/FormGroup/FormGroup.jsx';
import SelectContainer from '../../../../common/components/Selection/SelectContainer.jsx';
import ActionButton from '../../../../common/components/Button/ActionButton/ActionButton.jsx';
import Label from '../../../../common/components/Label/Label.jsx';
import locationApi from '../../../../api/locationApi.js';
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
    equipmentName: "",
    locationId: "",
    status: "",
    warehouseName: "",
    warehouseId: "",
    dimensions: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!formData.locationId) {
      return; // Prevent saving if locationId is empty
    }

    // Parse dimensions input
    const dimensionsArray = formData.dimensions.split("x").map((dim) => dim.trim());

    // Prepare the newLocation object for the API
    const newLocation = {
      locationId: formData.locationId,
      warehouseId: formData.warehouseId,
      warehouseName: formData.warehouseName,
      equipmentName: formData.equipmentName,
      properties: [
        {
          propertyName: "Height",
          propertyValue: dimensionsArray[2] || "--", // Height from dimensions[2]
          unitOfMeasure: "Meter",
        },
        {
          propertyName: "Width",
          propertyValue: dimensionsArray[0] || "--", // Width from dimensions[0]
          unitOfMeasure: "Meter",
        },
        {
          propertyName: "Length",
          propertyValue: dimensionsArray[1] || "--", // Length from dimensions[1]
          unitOfMeasure: "Meter",
        },
        {
          propertyName: "Status",
          propertyValue: formData.Status || "--",
          unitOfMeasure: "None",
        },
      ],
    };

    try {
      console.log("New Location Data to POST:", newLocation); // Log the data being sent to the API

      // POST the newLocation data to the API
      const response = await locationApi.createLocation(newLocation); // Ensure the API method is correct
      if (response) {
        // Show success notification
        toast.success("Vị trí lưu trữ đã được tạo thành công!", {
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
          equipmentName: "",
          locationId: "",
          status: "",
          warehouseName: "",
          warehouseId: "",
          dimensions: "",
        });
      }
    } catch (error) {
      console.error("Error creating new location:", error);

      // Show failure notification
      toast.error("Tạo vị trí lưu trữ thất bại. Vui lòng thử lại!", {
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
    console.log("Search Code:", searchCode); // Log the searchCode value
    setIsLoading(true); // Start loading
    try {
      // Fetch data from the specified URL
      const response = await fetch(
        `https://wmsapis20250504173355.azurewebsites.net/WarehouseAPI/Location/GetLocationById/${searchCode}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch location data');
      }

      const location = await response.json();

      // Map and extract properties from locationPropertyDTOs
      const status = location.locationPropertyDTOs.find(
        (prop) => prop.propertyName === "Status"
      )?.propertyValue || "--"; // Correctly extract Status

      const height = location.locationPropertyDTOs.find(
        (prop) => prop.propertyName === "Height"
      )?.propertyValue || "--";

      const width = location.locationPropertyDTOs.find(
        (prop) => prop.propertyName === "Width"
      )?.propertyValue || "--";

      const length = location.locationPropertyDTOs.find(
        (prop) => prop.propertyName === "Length"
      )?.propertyValue || "--";

      const mappedLocation = {
        ...location,
        status, // Map the extracted Status
        height,
        width,
        length,
      };

      setFilteredData([mappedLocation]); // Set the filtered data with the fetched location
    } catch (error) {
      console.error("Error fetching location:", error);
      setFilteredData([]); // Clear the table on error
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  const handleDelete = (locationId) => {
    setSavedData((prev) => prev.filter((item) => item.locationId !== locationId));
    setFilteredData((prev) => prev.filter((item) => item.locationId !== locationId));
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
                <Label>Tên thiết bị:</Label>
                <SelectContainer>
                  <input 
                    type="text" 
                    name="equipmentName"
                    value={formData.equipmentName}
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
                    name="locationId"
                    value={formData.locationId}
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
                    name="Status"
                    value={formData.Status}
                    onChange={handleInputChange}
                    style={{ width: "100%", padding: "5px", border: "1px solid #ccc" }} 
                  />
                </SelectContainer>
              </FormGroup>
              <FormGroup>
                <Label>Kho hàng:</Label>
                <SelectContainer>
                  <select 
                    name="warehouseName"
                    value={formData.warehouseName} 
                    onChange={handleInputChange}
                    style={{ width: "100%", padding: "5px", border: "1px solid #ccc" }}
                  >
                    <option value="Kho thành phẩm">Kho thành phẩm</option>
                    <option value="Kho bán thành phẩm">Kho bán thành phẩm</option>
                    <option value="Kho bao bì">Kho bao bì</option>
                    <option value="Kho nguyên vật liệu">Kho nguyên vật liệu</option>
                    <option value="Kho vật tư">Kho vật tư</option>
                  </select>
                </SelectContainer>
              </FormGroup>
              <FormGroup>
                <Label>Khu vực:</Label>
                <SelectContainer>
                  <input 
                    type="text" 
                    name="warehouseId"
                    value={formData.warehouseId}
                    onChange={handleInputChange}
                    style={{ width: "100%", padding: "5px", border: "1px solid #ccc" }} 
                  />
                </SelectContainer>
              </FormGroup>
              <FormGroup>
                <Label>Kích thước:</Label>
                <SelectContainer style={{ position: "relative" }}>
                  <input
                    type="text"
                    name="dimensions"
                    value={formData.dimensions || ""}
                    onChange={handleInputChange}
                    style={{ width: "100%", padding: "5px 30px 5px 5px", border: "1px solid #ccc" }}
                  />
                  <span
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#888",
                    }}
                  >
                    Meter
                  </span>
                </SelectContainer>
              </FormGroup>
              
            </div>
            <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
              <ActionButton
                onClick={handleSave} 
                disabled={!formData.locationId} 
                style={{ 
                  marginTop: "-10px",
                  padding: "10px 20px", 
                  width: "240px", 
                  backgroundColor: formData.locationId ? "#007bff" : "#ccc", 
                  cursor: formData.locationId ? "pointer" : "not-allowed",
                }}
              >
                Tạo mới vị trí
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
              <Label style={{ width: "110px", fontWeight: "bold" }}>Mã vị trí:</Label>
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
                      <th style={{ borderBottom: "1px solid #ccc", padding: "8px", textAlign: "center" }}>Tên thiết bị</th>
                      <th style={{ borderBottom: "1px solid #ccc", padding: "8px", textAlign: "center" }}>Mã vị trí</th>
                      <th style={{ borderBottom: "1px solid #ccc", padding: "8px", textAlign: "center" }}>Mô tả</th>
                      <th style={{ borderBottom: "1px solid #ccc", padding: "8px", textAlign: "center" }}>Kho hàng</th>
                      <th style={{ borderBottom: "1px solid #ccc", padding: "8px", textAlign: "center" }}>Khu vực</th>
                      <th style={{ borderBottom: "1px solid #ccc", padding: "8px", textAlign: "center" }}>Kích thước</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(searchCode ? filteredData : savedData).map((item, index) => (
                      <tr key={index} style={{ borderBottom: "1px solid #ccc" }}>
                        <td style={{ padding: "8px", textAlign: "center" }}>{index + 1}</td>
                        <td style={{ padding: "8px", textAlign: "center" }}>{item.equipmentName}</td>
                        <td style={{ padding: "8px", textAlign: "center" }}>{item.locationId}</td>
                        <td style={{ padding: "8px", textAlign: "center" }}>{item.status}</td>
                        <td style={{ padding: "8px", textAlign: "center" }}>{item.warehouseName}</td>
                        <td style={{ padding: "8px", textAlign: "center" }}>{item.warehouseId}</td>
                        <td style={{ padding: "8px", textAlign: "center" }}>
                          {`${item.width || "--"}x${item.length || "--"}x${item.height || "--"} meter`}
                        </td>
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

