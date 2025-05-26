import React, { useState, useEffect } from 'react';
import { FaTrash, FaChevronDown } from 'react-icons/fa';
import SectionTitle from '../../../../common/components/Text/SectionTitle.jsx';
import Table from '../../../../common/components/Table/Table.jsx';
import TableHeader from '../../../../common/components/Table/TableHeader.jsx';
import TableCell from '../../../../common/components/Table/TableCell.jsx';
import SelectContainer from '../../../../common/components/Selection/SelectContainer.jsx';
import Select from '../../../../common/components/Selection/Select.jsx';
import FormGroup from '../../../../common/components/FormGroup/FormGroup.jsx';
import CreateButton from '../../../../common/components/Button/CreateButton/CreateButton.jsx';
import ActionButton from '../../../../common/components/Button/ActionButton/ActionButton.jsx';
import ContentContainer from '../../../../common/components/ContentContainer/ContentContainer.jsx';
import DropdownIcon from '../../../../common/components/Icon/DropdownIcon.jsx';
import DateInput from '../../../../common/components/DateInput/DateInput.jsx';
import Label from '../../../../common/components/Label/Label.jsx';
import FormSection from '../../../../common/components/Section/FormSection.jsx';
import ListSection from '../../../../common/components/Section/ListSection.jsx';
import DeleteButton from '../../../../common/components/Button/DeleteButton/DeleteButton.jsx';
// import inventoryReceiptEntryApi from '../../../../api/inventoryReceiptEntryApi.js';
import inventoryReceiptApi from '../../../../api/inventoryReceiptApi.js';
import {AiOutlinePlus} from 'react-icons/ai'
import wareHouseApi from '../../../../api/wareHouseApi.js';
import supplierApi from '../../../../api/supplierApi.js';
import personApi from '../../../../api/personApi.js';
import materialApi from '../../../../api/materialApi.js';
import { toast } from "react-toastify"; // Import toast for notifications
import "react-toastify/dist/ReactToastify.css";


const CreateGoodReceipt = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [materialName, setMaterialName] = useState('');
  const [materialId, setMaterialId] = useState('');
  const [unit, setUnit] = useState('');
  const [lotNumber, setLotNumber] = useState('');
  const [importedQuantity, setImportedQuantity] = useState(0);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [selectedZone, setSelectedZone] = useState(null);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [count, setCount] = useState(1);
  const [error, setError] = useState('');
  const [wareHouses, setWareHouses] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [people, setPeople] = useState([]);
  const [materialOptionNames, setMaterialOptionNames] = useState([]);
  const [materialOptionIds, setMaterialOptionIds] = useState(null);
  const [materialOptionUnits, setMaterialOptionUnits] = useState(null); 
  const [MaterialsList, setMaterialsList] = useState([]);
  // console.log(materialName);
  // // console.log(materialOptions)
  // console.log(materialOptionUnits)
  console.log(materialOptionIds)
  useEffect(() => {
    const GetApi = async() => {
        const wareHouseList = await wareHouseApi.getAllWareHouses();
        const supplierList = await supplierApi.getAllSupplier();
        const personList = await personApi.getAllPerson();
        
        setPeople(personList);
        setWareHouses(wareHouseList);
        setSuppliers(supplierList);
    };

    GetApi();
  }, []);
  
  // Separate useEffect to handle material fetching when zone changes
  useEffect(() => {
    const fetchMaterials = async () => {
      if (selectedZone) {
        try {
          const materialList = await materialApi.getMaterialsByWarehouseId(selectedZone);

          const optionNameList = materialList.map(material => material.materialName);
          // const optionIdList = materialList.map(material => material.materialId);
          // const optionPropertyList = materialList.map(material => material.properties);
          
          // Extract unit values from properties where propertyName is "Unit"
          // const optionUnitList = optionPropertyList.map(properties => {
          //   const unitProperty = properties.find(prop => prop.propertyName === "Unit");
          //   return unitProperty ? unitProperty.propertyValue : "";
          // });

          // Filter unique propertyValues for units
          // const uniqueUnits = [...new Set(optionUnitList)];

          // console.log(optionPropertyList)
          setMaterialsList(materialList);
          setMaterialOptionNames(optionNameList);
          // setMaterialOptionIds(optionIdList);
          // setMaterialOptionUnits(uniqueUnits);
        } catch (error) {
          console.error('Error fetching materials:', error);
        }
      }
    };
    const getMaterialIdAndUnit = async() => {
      if(materialName) {
        try {
          const material = MaterialsList.find(material => material.materialName === materialName );
          const optionMaterialId = material.materialId;
          const optionMaterialUnit = await materialApi.getUnitByMaterialId(optionMaterialId);
          setMaterialOptionIds(optionMaterialId);
          setMaterialOptionUnits(optionMaterialUnit);
        }
        catch (error){
          console.error('Error fetching:', error);
        }
       
      }
    }

    fetchMaterials();
    getMaterialIdAndUnit();

  }, [selectedZone, materialName]);

  // Update materialId when materialOptionIds changes
  useEffect(() => {
      setMaterialId(materialOptionIds);
      setUnit(materialOptionUnits);
  }, [materialOptionIds, materialOptionUnits]);

  // Add useEffect to clear error when any required field changes
  useEffect(() => {
    if (error && (selectedWarehouse || selectedZone || selectedSupplier || selectedPerson || selectedDate)) {
      setError('');
    }
  }, [selectedWarehouse, selectedZone, selectedSupplier, selectedPerson, selectedDate]);

  const createReceipt = async () => {
    if (!selectedWarehouse || !selectedZone || !selectedSupplier || !selectedPerson || !selectedDate) {
      setError('Vui lòng chọn tất cả các trường bắt buộc.');
      toast.error("Tạo phiếu nhập kho thất bại!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return;
    }

    setError('');

    try {
      const supplierId = suppliers.find(x => x.supplierName === selectedSupplier).supplierId;
      const personId = people.find(x => x.personName === selectedPerson).personId;
      const newReceipt = {
        warehouseId: selectedZone,
        supplierId: supplierId,
        personId: personId,
        receiptDate: selectedDate,
        entries: materials
      }
      console.log(newReceipt);
      await inventoryReceiptApi.createReceipt(newReceipt);
      // Show success notification
      toast.success("Tạo phiếu nhập kho thành công!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      
      // Clear all form data after successful creation
      setSelectedWarehouse(null);
      setSelectedZone(null);
      setSelectedSupplier(null);
      setSelectedPerson(null);
      setSelectedDate(null);
      setMaterials([]);
      setCount(1);
      setMaterialName('');
      setMaterialId('');
      setUnit('');
      setLotNumber('');
      setImportedQuantity(0);
      setMaterialOptionIds(null);
      setMaterialOptionUnits(null);
    } catch (err) {
      setError(err.message || 'An error occurred while creating the receipt.');
    }
    
  };
  
  const addMaterial = () => {
    if (!materialName || !lotNumber || !importedQuantity) {
      toast.error("Vui lòng chọn đủ tên sản phẩm, nhập Mã lô/số PO và số lượng nhập!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return false;
    }
    
    const newMaterial = { materialName, materialId, unit, lotNumber, importedQuantity };
    setMaterials([...materials, newMaterial]);
    // Reset input fields
    setMaterialName('');
    setMaterialId('');
    setMaterialOptionIds('');
    setMaterialOptionUnits('');
    setUnit('');
    setLotNumber('');
    setImportedQuantity(0);
    return true;
  };
  const removeMaterial = (index) => {
    const updatedMaterials = materials.filter((_, i) => i !== index);
    setMaterials(updatedMaterials);
    setCount(count - 1);
  };
  
  const handleAddMaterial = () => {
     const success = addMaterial();
     if (success) {
       setCount(count + 1);
     }
  }
  
  return (
    <ContentContainer style = {{display: "block"}}>
      {/* Left Section - Import Form */}
        <div style={{display: "flex"}}>
        <FormSection>
        <SectionTitle>Phiếu nhập kho</SectionTitle>

        <FormGroup>
          <Label>Kho hàng:</Label>
          <SelectContainer>
            <Select 
              value={selectedWarehouse} 
              onChange={(e) => setSelectedWarehouse(e.target.value)}
              placeholder="Chọn loại kho hàng"
            >
              {wareHouses.map((warehouse, index) => (
                <option key = {`warehouse-${index}`} value= {warehouse.warehouseName}> 
                  {warehouse.warehouseName}
                </option>
              ))}
            </Select>
          </SelectContainer>
        </FormGroup>

        <FormGroup>
          <Label>Mã kho hàng:</Label>
          <SelectContainer>
            <Select 
              value={selectedZone} 
              onChange={(e) => setSelectedZone(e.target.value)}
              placeholder="Chọn mã kho hàng"
            >
              {wareHouses.map((wareHouses, index) => (
                <option key = {`wareHouses-${index}`} value= {wareHouses.warehouseId}>
                  {wareHouses.warehouseId}
                </option>
              ))}
            </Select>
          </SelectContainer>
        </FormGroup>

        <FormGroup>
          <Label>Nhà cung cấp:</Label>
          <SelectContainer>
            <Select 
              value={selectedSupplier} 
              onChange={(e) => setSelectedSupplier(e.target.value)}
              placeholder="Chọn nhà cung cấp"
            >
              {suppliers.map((supplier, index) => (
                <option key = {`supplier-${index}`} value= {supplier.supplierName}>
                  {supplier.supplierName}
                </option>
              ))}
            </Select>
          </SelectContainer>
        </FormGroup>

        <FormGroup>
          <Label>Nhân viên:</Label>
          <SelectContainer>
            <Select 
              value={selectedPerson} 
              onChange={(e) => setSelectedPerson(e.target.value)}
              placeholder="Chọn nhân viên"
            >
              {people.map((person, index) => (
                <option key = {`person-${index}`} value={person.personName}>
                  {person.personName}
                </option>
              ))}
            </Select>
          </SelectContainer>
        </FormGroup>

        <FormGroup>
          <Label>Ngày nhập kho:</Label>
          <SelectContainer>
            <DateInput
              selectedDate={selectedDate}
              onChange={setSelectedDate}
            />
          </SelectContainer>
        </FormGroup>

        {error && <div style={{ color: 'red' }}>{error}</div>}

      </FormSection>

      {/* Right Section - Import List */}
      <ListSection style={{width: "50%"}}>
        <SectionTitle>Danh sách nhập kho</SectionTitle>

        <div style={{maxHeight: "400px", overflowY: "scroll"}}>
          <Table style={{ tableLayout: "fixed", width: "100%"}}> 
            <thead>
              <tr>
                <TableHeader style={{ width: "7%" }}>STT</TableHeader>
                <TableHeader style={{ width: "31%" }}>Tên sản phẩm</TableHeader>
                <TableHeader style={{ width: "30%" }}>Mã sản phẩm</TableHeader>
                <TableHeader style={{ width: "20%" }}>ĐVT</TableHeader>
                <TableHeader style={{ width: "20%" }}>Mã lô/Số PO</TableHeader>
                <TableHeader style={{ width: "25%" }}>Số lượng nhập</TableHeader>
                <TableHeader style={{ width: "10%" }}></TableHeader>
              </tr>
            </thead>
            <tbody>
              {materials.map((material, index) => (
                <tr key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{material.materialName}</TableCell>
                  <TableCell>{material.materialId}</TableCell>
                  <TableCell>{material.unit}</TableCell>
                  <TableCell>{material.lotNumber}</TableCell>
                  <TableCell>{material.importedQuantity}</TableCell>
                  <TableCell>
                    <DeleteButton onClick={() => removeMaterial(index)}>
                      <FaTrash size={18} color="#FF2115"/>
                    </DeleteButton>
                  </TableCell>
                </tr>
              ))}
              <tr>
                <TableCell>{count}</TableCell>
                <TableCell>
    
                    <SelectContainer>
                    <Select 
                      value={materialName} 
                      onChange={(e) => setMaterialName(e.target.value)}
                      placeholder="Tên sản phẩm"
                      style = {{fontSize: "90%"}}
                    >
                      {materialOptionNames.map((materialOptionName, index) => (
                        <option key = {`materialOptionName-${index}`} value= {materialOptionName}> 
                          {materialOptionName}
                        </option>
                      ))}
                    </Select>
                  </SelectContainer>

                </TableCell>
                <TableCell>
                  <SelectContainer >
                     <span style={{color: materialOptionIds? "#000" : "#767676", fontSize: "90%"}}>
                        {materialOptionIds || "Mã sản phẩm"}
                     </span>
                  </SelectContainer>
                </TableCell>
                
                <TableCell>
                  <SelectContainer >
                    <span style={{color: materialOptionUnits? "#000" : "#767676", fontSize: "90%"}}>
                        {materialOptionUnits || "ĐVT"}
                    </span>
                  </SelectContainer>
                </TableCell>

                <TableCell>
                  <input style={{textAlign: "center", width: "100%", fontSize: "90%"}}
                    type="text" 
                    placeholder="Mã lô/Số PO" 
                    value={lotNumber}
                    onChange={(e) => setLotNumber(e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <input style={{textAlign: "center", width: "100%", paddingLeft: "12%", fontSize: "90%"}}
                    type="number"
                    min="0"
                    step="1"
                    placeholder="Số lượng nhập" 
                    value={importedQuantity}
                    onChange={(e) => setImportedQuantity(e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <button 
                    onClick={handleAddMaterial} 
                    style={{
                      paddingRight: "70%", 
                      opacity: (!materialName || !lotNumber || !importedQuantity) ? 0.5 : 1,
                      cursor: (!materialName || !lotNumber || !importedQuantity) ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <AiOutlinePlus size={18}/>
                  </button>
                </TableCell>
              </tr>
            </tbody>
          </Table>
        </div>

        {/* Modal for additional information */}

      
      </ListSection>
        </div>
       <ActionButton style={{ marginTop: '2rem' }} onClick={createReceipt}>Tạo phiếu nhập kho</ActionButton >
     
    </ContentContainer>
  );
};

export default CreateGoodReceipt; 