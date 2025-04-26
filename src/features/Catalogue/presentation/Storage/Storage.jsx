import React, { useState } from 'react';
import SectionTitle from '../../../../common/components/Text/SectionTitle.jsx';
import FormGroup from '../../../../common/components/FormGroup/FormGroup.jsx';
import SelectContainer from '../../../../common/components/Selection/SelectContainer.jsx';
import ActionButton from '../../../../common/components/Button/ActionButton/ActionButton.jsx';
import Label from '../../../../common/components/Label/Label.jsx';

const Storage = () => {
  const [formData, setFormData] = useState({
    storageName: "",
    storageCode: "",
    location: "--",
    capacity: "",
    note: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (!formData.storageCode) {
      return; // Prevent updating information
    }
    console.log("New Storage Data:", formData); // Log the form data to the console
    setFormData({
      storageName: "",
      storageCode: "",
      location: "--",
      capacity: "",
      note: "",
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", padding: "0 20px" }}>
      <div style={{ backgroundColor: "white", padding: "20px", borderBottom: "2px solid #ccc", boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}>
        <SectionTitle
          style={{
            fontSize: "30px",
            marginBottom: "20px",
            width: "100%",
            textAlign: "center",
            borderBottom: "2px solid #ccc",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            position: "relative",
          }}
        >
          Tạo mới vị trí lưu trữ
        </SectionTitle>
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
            <FormGroup>
              <Label>Tên vị trí lưu trữ:</Label>
              <SelectContainer>
                <input
                  type="text"
                  name="storageName"
                  value={formData.storageName}
                  onChange={handleInputChange}
                  style={{ width: "100%", padding: "5px", border: "1px solid #ccc" }}
                />
              </SelectContainer>
            </FormGroup>
            <FormGroup>
              <Label>Mã vị trí lưu trữ:</Label>
              <SelectContainer>
                <input
                  type="text"
                  name="storageCode"
                  value={formData.storageCode}
                  onChange={handleInputChange}
                  style={{ width: "100%", padding: "5px", border: "1px solid #ccc" }}
                />
              </SelectContainer>
            </FormGroup>
            <FormGroup>
              <Label>Vị trí:</Label>
              <SelectContainer>
                <select
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  style={{ width: "100%", padding: "5px", border: "1px solid #ccc" }}
                >
                  <option value="--">--</option>
                  <option value="Khu A">Khu A</option>
                  <option value="Khu B">Khu B</option>
                  <option value="Khu C">Khu C</option>
                </select>
              </SelectContainer>
            </FormGroup>
            <FormGroup>
              <Label>Sức chứa:</Label>
              <SelectContainer>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  style={{ width: "100%", padding: "5px", border: "1px solid #ccc" }}
                />
              </SelectContainer>
            </FormGroup>
            <FormGroup>
              <Label>Ghi chú:</Label>
              <SelectContainer>
                <textarea
                  name="note"
                  value={formData.note}
                  onChange={handleInputChange}
                  style={{ width: "100%", padding: "5px", border: "1px solid #ccc" }}
                />
              </SelectContainer>
            </FormGroup>
          </div>
          <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
            <ActionButton
              onClick={handleSave}
              disabled={!formData.storageCode}
              style={{
                marginTop: "-10px",
                padding: "10px 20px",
                width: "240px",
                backgroundColor: formData.storageCode ? "#007bff" : "#ccc",
                cursor: formData.storageCode ? "pointer" : "not-allowed",
              }}
            >
              Tạo mới vị trí lưu trữ
            </ActionButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Storage;