import React, { useState, useEffect } from 'react';
import { FaEye } from 'react-icons/fa';
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
import SearchInput from '../../../../common/components/Input/SearchInput.jsx';
import materialApi from '../../../../api/materialApi.js'; // Ensure this import is correct
import materialClassApi from '../../../../api/materialClassApi.js';

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
    note: "",
  });

  const [materialClasses, setMaterialClasses] = useState([]); // Store material classes
  const [savedData, setSavedData] = useState([]);
  const [searchCode, setSearchCode] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [isCreateSectionHidden, setCreateSectionHidden] = useState(false);
  const [isSearchSectionHidden, setSearchSectionHidden] = useState(false);

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

      const newProduct = {
        materialId: formData.goodCode,
        materialName: formData.goodName,
        materialClassId: formData.goodType,
        materialClassName: selectedMaterialClass.className, // Ensure className exists in the API response
        properties: [
          {
            propertyName: "Height",
            propertyValue: formData.dimensions.split("x")[2] || "",
            unitOfMeasure: "Meter",
            materialId: formData.goodCode,
          },
          {
            propertyName: "Length",
            propertyValue: formData.dimensions.split("x")[1] || "",
            unitOfMeasure: "Meter",
            materialId: formData.goodCode,
          },
          {
            propertyName: "Width",
            propertyValue: formData.dimensions.split("x")[0] || "",
            unitOfMeasure: "Meter",
            materialId: formData.goodCode,
          },
          {
            propertyName: "Price",
            propertyValue: formData.price,
            unitOfMeasure: "VND",
            materialId: formData.goodCode,
          },
          {
            propertyName: "MinimumStockLevel",
            propertyValue: formData.minimumStock,
            unitOfMeasure: "None",
            materialId: formData.goodCode,
          },
          {
            propertyName: "Unit",
            propertyValue: formData.unit,
            unitOfMeasure: "None",
            materialId: formData.goodCode,
          },
          {
            propertyName: "Note",
            propertyValue: formData.note,
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
            propertyValue: formData.goodType,
            unitOfMeasure: "None",
            materialId: formData.goodCode,
          },
        ],
      };

      console.log("New Product Data:", newProduct);

      const response = await materialApi.createMaterial(newProduct); // Ensure this endpoint exists and is correct
      if (response) {
        console.log("New Product Created:", response);

        setSavedData((prev) => [...prev, response]);
        setFilteredData((prev) => [...prev, response]);
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
        note: "",
      });
    } catch (error) {
      console.error("Error creating new product:", error);
    }
  };

  const handleSearch = async () => {
    if (!searchCode.trim()) {
      setFilteredData([]); // Clear the table if the input is empty
      return;
    }
    try {
      const result = await fetchMaterialsById(searchCode); // Fetch data by MaterialId
      console.log("Fetched Material Data:", result); // Log the fetched data
      if (result) {
        setFilteredData([result]); // Update the table with the fetched data
      } else {
        setFilteredData([]); // Clear the table if no data is found
        console.warn(`No material found with ID: ${searchCode}`);
      }
    } catch (error) {
      console.error('Error fetching material by ID:', error); // Log the error
      setFilteredData([]); // Clear the table on error
    }
  };

  const handleDelete = (goodCode) => {
    setSavedData((prev) => prev.filter((item) => item.goodCode !== goodCode));
    setFilteredData((prev) => prev.filter((item) => item.goodCode !== goodCode));
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
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
              
              <FormGroup>
                <Label>Tên sản phẩm:</Label>
                <SelectContainer>
                  <input
                    type="text"
                    name="goodName"
                    value={formData.goodName}
                    onChange={handleInputChange}
                    style={{ width: "100%", padding: "5px", border: "1px solid #ccc" }}
                  />
                </SelectContainer>
              </FormGroup>
              <FormGroup>
                <Label>Mã sản phẩm:</Label>
                <SelectContainer>
                  <input
                    type="text"
                    name="goodCode"
                    value={formData.goodCode}
                    onChange={handleInputChange}
                    style={{ width: "100%", padding: "5px", border: "1px solid #ccc" }}
                  />
                </SelectContainer>
              </FormGroup>
              <FormGroup>
                <Label>Đơn vị tính:</Label>
                <SelectContainer>
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleInputChange}
                    style={{ width: "100%", padding: "5px", border: "1px solid #ccc" }}
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
              <FormGroup>
                <Label>Loại sản phẩm:</Label>
                <SelectContainer>
                  <select
                    name="goodType"
                    value={formData.goodType}
                    onChange={handleInputChange}
                    style={{ width: "100%", padding: "5px", border: "1px solid #ccc" }}
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
              <FormGroup>
                <Label>Tồn kho tối thiểu:</Label>
                <SelectContainer>
                  <input
                    type="number"
                    name="minimumStock"
                    value={formData.minimumStock || ""}
                    onChange={handleInputChange}
                    style={{ width: "100%", padding: "5px", border: "1px solid #ccc" }}
                  />
                </SelectContainer>
              </FormGroup>
              <FormGroup>
                <Label>Định mức:</Label>
                <SelectContainer>
                  <input
                    type="number"
                    name="standardRate"
                    value={formData.standardRate || ""}
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
              <FormGroup>
                <Label>Đơn giá:</Label>
                <SelectContainer style={{ position: "relative" }}>
                  <input
                    type="number"
                    name="price"
                    value={formData.price || ""}
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
                    đ
                  </span>
                </SelectContainer>
              </FormGroup>
              <FormGroup>
                <Label>Ghi chú:</Label>
                <SelectContainer style={{ position: "relative" }}>
                  <input
                    type="text"
                    name="note"
                    value={formData.note || ""}
                    onChange={handleInputChange}
                    placeholder="--"
                    style={{
                      width: "100%",
                      padding: "5px",
                      border: "1px solid #ccc",
                      textAlign: "center",
                    }}
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
            <div style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent: "space-between", marginBottom: "20px" }}>
              <Label style={{ width: "110px", fontWeight: "bold" }}>Mã sản phẩm:</Label>
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
                    <th style={{ borderBottom: "1px solid #ccc", padding: "8px", textAlign: "center" }}>Tên sản phẩm</th>
                    <th style={{ borderBottom: "1px solid #ccc", padding: "8px", textAlign: "center" }}>Mã sản phẩm</th>
                    <th style={{ borderBottom: "1px solid #ccc", padding: "8px", textAlign: "center" }}>Loại sản phẩm</th>
                    <th style={{ borderBottom: "1px solid #ccc", padding: "8px", textAlign: "center" }}>ĐVT</th>
                    <th style={{ borderBottom: "1px solid #ccc", padding: "8px", textAlign: "center" }}>Đơn giá</th>
                    <th style={{ borderBottom: "1px solid #ccc", padding: "8px", textAlign: "center" }}>Tồn kho tối thiểu</th>
                    <th style={{ borderBottom: "1px solid #ccc", padding: "8px", textAlign: "center" }}>Định mức tồn kho</th>
                    <th style={{ borderBottom: "1px solid #ccc", padding: "8px", textAlign: "center" }}>Kích thước</th>
                    <th style={{ borderBottom: "1px solid #ccc", padding: "8px", textAlign: "center" }}>Ghi chú</th>
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
                    const noteProperty = item.properties?.find((prop) => prop.propertyName === "Note");

                    const dimensions = [
                      widthProperty?.propertyValue || "--",
                      lengthProperty?.propertyValue || "--",
                      heightProperty?.propertyValue || "--",
                    ].join("x") + " Meter";

                    return (
                      <tr key={index} style={{ borderBottom: "1px solid #ccc" }}>
                        <td style={{ padding: "8px", textAlign: "center" }}>{index + 1}</td>
                        <td style={{ padding: "8px", textAlign: "center" }}>{item.materialName}</td>
                        <td style={{ padding: "8px", textAlign: "center" }}>{item.materialId}</td>
                        <td style={{ padding: "8px", textAlign: "center" }}>{item.materialClassId}</td>
                        <td style={{ padding: "8px", textAlign: "center" }}>
                          {unitProperty ? unitProperty.propertyValue : item.Unit}
                        </td>
                        <td style={{ padding: "8px", textAlign: "center" }}>
                          {priceProperty ? priceProperty.propertyValue : item.Price} VND{" "}
                          {unitOfMeasureProperty ? `(${unitOfMeasureProperty.propertyValue})` : ""}
                        </td>
                        <td style={{ padding: "8px", textAlign: "center" }}>
                          {minimumStockLevelProperty ? minimumStockLevelProperty.propertyValue : item.MinimumStockLevel}
                        </td>
                        <td style={{ padding: "8px", textAlign: "center" }}>
                          {defaultStockLevelProperty ? defaultStockLevelProperty.propertyValue : item.DefaultStockLevel}
                        </td>
                        <td style={{ padding: "8px", textAlign: "center" }}>{dimensions}</td>
                        <td style={{ padding: "8px", textAlign: "center" }}>
                          {noteProperty ? noteProperty.propertyValue : item.Note}
                        </td>
                      </tr>
                    );
                  })}
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