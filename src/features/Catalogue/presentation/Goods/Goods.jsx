import React, { useState, useEffect } from 'react';
import SectionTitle from '../../../../common/components/Text/SectionTitle.jsx';
import FormGroup from '../../../../common/components/FormGroup/FormGroup.jsx';
import SelectContainer from '../../../../common/components/Selection/SelectContainer.jsx';
import ActionButton from '../../../../common/components/Button/ActionButton/ActionButton.jsx';
import Label from '../../../../common/components/Label/Label.jsx';
import materialApi from '../../../../api/materialApi.js'; // Ensure this import is correct
import materialClassApi from '../../../../api/materialClassApi.js';
import { toast } from "react-toastify"; // Import toast for notifications
import "react-toastify/dist/ReactToastify.css";
import { ClipLoader } from 'react-spinners';

const fetchMaterials = async () => {
  try {
    const response = await materialApi.getAllMaterials(); // Ensure this endpoint exists and is correct
    return response.items;
  } catch (error) {
    console.error('Error fetching materials:', error);
    return [];
  }
};

const fetchMaterialsById = async (id) => {
  try {
    const response = await materialApi.getMaterialById(id); // Ensure this endpoint exists and is correct
    return response;
  } catch (error) {
    console.error(`Error fetching material with ID ${id}:`, error);
    return null;
  }
};

const fetchMaterialClass = async () => {
  try {
    const response = await materialClassApi.getAllMaterialClass(); // Ensure this endpoint exists and is correct
    return response;
  } catch (error) {
    console.error(`Error fetching material classes:`, error);
    return null;
  }
};

const InventoryHistory = () => {
  const [formData, setFormData] = useState({
    goodName: "",
    goodCode: "",
    unit: "--",
    goodType: "--",
    minimumStock: "",
    standardRate: "",
    dimensions: "",
    price: "",
    StorageLevel: "", // Changed from note to StorageLevel
  });

  const [materialClasses, setMaterialClasses] = useState([]); // Store material classes
  const [savedData, setSavedData] = useState([]);
  const [searchCode, setSearchCode] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [isCreateSectionHidden, setCreateSectionHidden] = useState(false);
  const [isSearchSectionHidden, setSearchSectionHidden] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Add loading state

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchMaterials(); // Fetch data from the API
        setSavedData(data); // Store the fetched data in savedData
      } catch (error) {
        console.error("Error fetching materials:", error);
      }
    };

    const fetchMaterialClasses = async () => {
      try {
        const data = await fetchMaterialClass(); // Fetch material classes
        setMaterialClasses(data || []); // Store material classes
      } catch (error) {
        console.error("Error fetching material classes:", error);
      }
    };

    fetchData();
    fetchMaterialClasses();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!formData.goodCode) {
      return; // Prevent saving if goodCode is empty
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
            propertyValue: "80", // Example value, replace as needed
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

      console.log("New Product Data:", newProduct);

      const response = await materialApi.createMaterial(newProduct);
      if (response) {
        console.log("New Product Created:", response);

        // Show success notification
        toast.success("Sản phẩm đã được tạo thành công!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });

        // Do not update savedData or filteredData to prevent showing the new product in the table
      }

      setFormData({
        goodName: "",
        goodCode: "",
        unit: "--",
        goodType: "--",
        minimumStock: "",
        standardRate: "",
        dimensions: "",
        price: "",
        StorageLevel: "", // Changed from note to StorageLevel
      });
    } catch (error) {
      console.error("Error creating new product:", error);

      // Show failure notification
      toast.error("Tạo sản phẩm thất bại. Vui lòng thử lại!", {
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
      const result = await fetchMaterialsById(searchCode); // Fetch data by MaterialId
      console.log("Fetched Material Data:", result); // Log the fetched data

      if (!result) {
        // Show notification if no data is returned
        toast.error("Không tìm thấy dữ liệu sản phẩm!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        setFilteredData([]); // Clear the table
        return;
      }

      setFilteredData([result]); // Update the table with the fetched data
    } catch (error) {
      console.error('Error fetching material by ID:', error); // Log the error

      // Show failure notification
      toast.error("Không thể tìm kiếm sản phẩm. Vui lòng thử lại!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });

      setFilteredData([]); // Clear the table on error
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  const handleDelete = (goodCode) => {
    // Ensure savedData and filteredData are arrays before filtering
    setSavedData((prev) => Array.isArray(prev) ? prev.filter((item) => item.goodCode !== goodCode) : []);
    setFilteredData((prev) => Array.isArray(prev) ? prev.filter((item) => item.goodCode !== goodCode) : []);
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
            Tạo mới sản phẩm
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
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px",marginLeft: "25px",}}>
              <FormGroup style={{ display: "flex", alignItems: "center",}}>
                <Label style={{ flex: "0 0 150px" }}>Tên sản phẩm:</Label>
                <SelectContainer style={{ flex: "1" }}>
                  <input
                    type="text"
                    name="goodName"
                    value={formData.goodName}
                    onChange={handleInputChange}
                    style={{ width: "100%", padding: "5px", border: "1px solid #ccc", marginLeft: "-30px" }}
                  />
                </SelectContainer>
              </FormGroup>
              <FormGroup style={{ display: "flex", alignItems: "center",}}>
                <Label style={{ flex: "0 0 150px",marginLeft:"-20px"  }}>Mã sản phẩm:</Label>
                <SelectContainer style={{ flex: "1" }}>
                  <input
                    type="text"
                    name="goodCode"
                    value={formData.goodCode}
                    onChange={handleInputChange}
                    style={{ width: "100%", padding: "5px", border: "1px solid #ccc",marginLeft: "-10px" }}
                  />
                </SelectContainer>
              </FormGroup>
              <FormGroup style={{ display: "flex", alignItems: "center",  }}>
                <Label style={{ flex: "0 0 150px", marginLeft:"" }}>Đơn vị tính:</Label>
                <SelectContainer style={{ flex: "1" }}>
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleInputChange}
                    style={{ width: "100%", padding: "5px", border: "1px solid #ccc",marginLeft: "-30px" }}
                  >
                    <option value="--">--</option>
                    <option value="PCS">PCS</option>
                    <option value="Kg">Kg</option>
                    <option value="Mét">Mét</option>
                    <option value="TAM">TAM</option>
                    <option value="CAI">CAI</option>
                    <option value="SET">SET</option>
                    <option value="Roll">Roll</option>
                    <option value="Cuon">Cuon</option>
                    <option value="BO">BO</option>
                    <option value="CAY">CAY</option>
                  </select>
                </SelectContainer>
              </FormGroup>
              <FormGroup style={{ display: "flex", alignItems: "center",}}>
                <Label style={{ flex: "0 0 150px" }}>Loại sản phẩm:</Label>
                <SelectContainer style={{ flex: "1" }}>
                  <select
                    name="goodType"
                    value={formData.goodType}
                    onChange={handleInputChange}
                    style={{ width: "100%", padding: "5px", border: "1px solid #ccc",marginLeft: "-30px" }}
                  >
                    <option value="--">--</option>
                    {materialClasses.map((materialClass) => (
                      <option key={materialClass.materialClassId} value={materialClass.materialClassId}>
                        {materialClass.className}
                      </option>
                    ))}
                  </select>
                </SelectContainer>
              </FormGroup>
              <FormGroup style={{ display: "flex", alignItems: "center" }}>
                <Label style={{ flex: "0 0 150px",marginLeft:"-20px" }}>Tồn kho tối thiểu:</Label>
                <SelectContainer style={{ flex: "1" }}>
                  <input
                    type="number"
                    name="minimumStock"
                    value={formData.minimumStock || ""}
                    onChange={handleInputChange}
                    style={{ width: "100%", padding: "5px", border: "1px solid #ccc",marginLeft: "-10px" }}
                  />
                </SelectContainer>
              </FormGroup>
              <FormGroup style={{ display: "flex", alignItems: "center" }}>
                <Label style={{ flex: "0 0 150px" }}>Định mức:</Label>
                <SelectContainer style={{ flex: "1" }}>
                  <input
                    type="number"
                    name="standardRate"
                    value={formData.standardRate || ""}
                    onChange={handleInputChange}
                    style={{ width: "100%", padding: "5px", border: "1px solid #ccc",marginLeft: "-30px" }}
                  />
                </SelectContainer>
              </FormGroup>
              <FormGroup style={{ display: "flex", alignItems: "center",}}>
                <Label style={{ flex: "0 0 150px" }}>Kích thước:</Label>
                <SelectContainer style={{ flex: "1", position: "relative" }}>
                  <input
                    type="text"
                    name="dimensions"
                    value={formData.dimensions || ""}
                    onChange={handleInputChange}
                    style={{ width: "100%", padding: "5px 30px 5px 5px", border: "1px solid #ccc",marginLeft: "-30px" }}
                  />
                  <span
                    style={{
                      position: "absolute",
                      right: "40px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#888",
                      
                    }}
                  >
                    m
                  </span>
                </SelectContainer>
              </FormGroup>
              <FormGroup style={{ display: "flex", alignItems: "center" }}>
                <Label style={{ flex: "0 0 150px", marginLeft:"-20px"  }}>Đơn giá:</Label>
                <SelectContainer style={{ flex: "1", position: "relative" }}>
                  <input
                    type="number"
                    name="price"
                    value={formData.price || ""}
                    onChange={handleInputChange}
                    style={{ width: "100%", padding: "5px 30px 5px 5px", border: "1px solid #ccc",marginLeft: "-10px" }}
                  />
                  <span
                    style={{
                      position: "absolute",
                      right: "20px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#888",
                    }}
                  >
                    đ
                  </span>
                </SelectContainer>
              </FormGroup>
              <FormGroup style={{ display: "flex", alignItems: "center" }}>
                <Label style={{ flex: "0 0 150px", whiteSpace: "normal", wordBreak: "break-word" }}>
                  Giới hạn tầng<br />lưu trữ:
                </Label>
                <SelectContainer style={{ flex: "1", position: "relative" }}>
                  <input
                    type="number"
                    name="StorageLevel" // Changed from note to StorageLevel
                    value={formData.StorageLevel || ""}
                    onChange={handleInputChange}
                    style={{ width: "100%", padding: "5px", border: "1px solid #ccc",marginLeft: "-30px" }}
                  />
                </SelectContainer>
              </FormGroup>
            </div>
            <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
              <ActionButton
                onClick={handleSave}
                disabled={!formData.goodCode}
                style={{
                  marginTop: "-10px",
                  padding: "10px 20px",
                  width: "240px",
                  backgroundColor: formData.goodCode ? "#007bff" : "#ccc",
                  cursor: formData.goodCode ? "pointer" : "not-allowed",
                  
                }}
              >
                Tạo mới sản phẩm
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
            Tìm kiếm sản phẩm
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
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", width: "100%", marginLeft: "20px" }}>
              <Label style={{ width: "110px", fontWeight: "bold", }}>Mã sản phẩm:</Label>
              <input
                type="text"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                placeholder="Tìm kiếm theo Mã sản phẩm"
                style={{
                  flex: 1,
                  padding: "8px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  width: "calc(100% - 200px)",
                  borderBottom: "2px solid #ccc",
                  marginRight: "10px",
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
                  marginRight: "40px",
                }}
                disabled={isLoading} // Disable button while loading
              >
                {isLoading ? <ClipLoader size={20} color="#fff" /> : "Tìm kiếm"}
              </ActionButton>
            </div>

            <div
              style={{
                position: "relative",
                overflowY: "auto",
                maxHeight: "300px",
                border: "1px solid #ccc",
                marginLeft: "20px",
                marginRight: "20px",
              }}
              onWheel={(e) => {
                e.stopPropagation();
                const container = e.currentTarget;
                container.scrollTop += e.deltaY;
              }}
            >
              {isLoading ? (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", }}>
                  <ClipLoader size={50} color="#007bff" />
                </div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", borderRight: "1px solid #ccc", borderLeft: "1px solid #ccc", }}>
                  <thead>
                    <tr>
                      <th style={{ borderBottom: "1px solid #ccc", padding: "8px", textAlign: "center" }}>STT</th>
                      <th style={{ borderBottom: "1px solid #ccc", padding: "8px", textAlign: "center" }}>Tên sản phẩm</th>
                      <th style={{ borderBottom: "1px solid #ccc", padding: "8px", textAlign: "center" }}>Mã sản phẩm</th>
                      <th style={{ borderBottom: "1px solid #ccc", padding: "8px", textAlign: "center" }}>Loại sản phẩm</th>
                      <th style={{ borderBottom: "1px solid #ccc", padding: "8px", textAlign: "center" }}>ĐVT</th>
                      <th style={{ borderBottom: "1px solid #ccc", padding: "8px", textAlign: "center" }}>Đơn giá</th>
                      <th style={{ borderBottom: "1px solid #ccc", padding: "8px", textAlign: "center" }}>Tồn kho tối thiểu</th>
                      <th style={{ borderBottom: "1px solid #ccc", padding: "8px", textAlign: "center" }}>Định mức tồn kho</th>
                      <th style={{ borderBottom: "1px solid #ccc", padding: "8px", textAlign: "center" }}>Kích thước</th>
                      <th style={{ borderBottom: "1px solid #ccc", padding: "8px", textAlign: "center" }}>Giới hạn tầng lưu trữ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((item, index) => {
                      const unitProperty = item.properties?.find((prop) => prop.propertyName === "Unit");
                      const priceProperty = item.properties?.find((prop) => prop.propertyName === "Price");
                      const unitOfMeasureProperty = item.properties?.find((prop) => prop.propertyName === "unitOfMeasure");
                      const minimumStockLevelProperty = item.properties?.find((prop) => prop.propertyName === "MinimumStockLevel");
                      const defaultStockLevelProperty = item.properties?.find((prop) => prop.propertyName === "DefaultStockLevel");
                      const widthProperty = item.properties?.find((prop) => prop.propertyName === "Width");
                      const lengthProperty = item.properties?.find((prop) => prop.propertyName === "Length");
                      const heightProperty = item.properties?.find((prop) => prop.propertyName === "Height");
                      const StorageLevelProperty = item.properties?.find((prop) => prop.propertyName === "StorageLevel"); // Changed from note to StorageLevel

                      const dimensions = [
                        widthProperty?.propertyValue || "--",
                        lengthProperty?.propertyValue || "--",
                        heightProperty?.propertyValue || "--",
                      ].join("x") + "(m)";

                      const StorageLevelValue = StorageLevelProperty?.propertyValue === "None" ? "Không" : StorageLevelProperty?.propertyValue || "--";

                      return (
                        <tr key={index} style={{ borderBottom: "1px solid #ccc" }}>
                          <td style={{ padding: "8px", textAlign: "center" }}>{index + 1}</td>
                          <td style={{ padding: "8px", textAlign: "center" }}>{item.materialName}</td>
                          <td style={{ padding: "8px", textAlign: "center" }}>{item.materialId}</td>
                          <td style={{ padding: "8px", textAlign: "center" }}>{item.materialClassId}</td>
                          <td style={{ padding: "8px", textAlign: "center" }}>
                            {unitProperty ? unitProperty.propertyValue : "--"}
                          </td>
                          <td style={{ padding: "8px", textAlign: "center" }}>
                            {priceProperty ? priceProperty.propertyValue : "0"}(đ)
                          </td>
                          <td style={{ padding: "8px", textAlign: "center" }}>
                            {minimumStockLevelProperty ? minimumStockLevelProperty.propertyValue : "0"}
                          </td>
                          <td style={{ padding: "8px", textAlign: "center" }}>
                            {defaultStockLevelProperty ? defaultStockLevelProperty.propertyValue : "0"}
                          </td>
                          <td style={{ padding: "8px", textAlign: "center" }}>{dimensions}</td>
                          <td style={{ padding: "8px", textAlign: "center" }}>{StorageLevelValue}</td>
                        </tr>
                      );
                    })}
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

export default InventoryHistory;