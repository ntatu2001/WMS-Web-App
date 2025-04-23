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

  
  // const createReceipt = async() => {
  //    const receipt = {}
  //    await inventoryReceiptApi.createReceipt()
  // }
  useEffect(() => {
    const GetApi = async() => {
        const wareHouseList = await wareHouseApi.getAllWareHouses();
        const supplierList = await supplierApi.getAllSupplier();
        const personList = await personApi.getAllPeople();
        setPeople(personList);
        setWareHouses(wareHouseList);
        setSuppliers(supplierList);
    };

    GetApi();
  }, []);

  const createReceipt = async () => {
    if (!selectedWarehouse || !selectedZone || !selectedSupplier || !selectedPerson || !selectedDate) {
      setError('Vui lòng chọn tất cả các trường bắt buộc.');
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
    } catch (err) {
      setError(err.message || 'An error occurred while creating the receipt.');
    }
    
  };
  
  const addMaterial = () => {
    const newMaterial = { materialName, materialId, unit, lotNumber, importedQuantity };
    setMaterials([...materials, newMaterial]);
    // Reset input fields
    setMaterialName('');
    setMaterialId('');
    setUnit('');
    setLotNumber('');
    setImportedQuantity(0);
  
  };
  const removeMaterial = (index) => {
    const updatedMaterials = materials.filter((_, i) => i !== index);
    setMaterials(updatedMaterials);
    setCount(count - 1);
  };
  
  const handleAddMaterial = () => {
     addMaterial();
     setCount(count + 1);
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
            <Select value={selectedWarehouse} onChange={(e) => setSelectedWarehouse(e.target.value)} required>
              <option value="" disabled selected>Chọn loại kho hàng</option>
              {wareHouses.map((warehouse, index) => (
                <option key = {`warehouse-${index}`} value= {warehouse.warehouseName}> 
                  {warehouse.warehouseName}
                </option>
              ))}
            </Select>
            <DropdownIcon><FaChevronDown size={12} /></DropdownIcon>
          </SelectContainer>
        </FormGroup>

        <FormGroup>
          <Label>Mã kho hàng:</Label>
          <SelectContainer>
            <Select value={selectedZone} onChange={(e) => setSelectedZone(e.target.value)}>
              <option value="" disabled selected>Chọn mã kho hàng</option>
              {wareHouses.map((wareHouses, index) => (
                <option key = {`wareHouses-${index}`} value= {wareHouses.warehouseId}>
                  {wareHouses.warehouseId}
                </option>
              ))}
            </Select>
            <DropdownIcon><FaChevronDown size={12} /></DropdownIcon>
          </SelectContainer>
        </FormGroup>

        <FormGroup>
          <Label>Nhà cung cấp:</Label>
          <SelectContainer>
            <Select value={selectedSupplier} onChange={(e) => setSelectedSupplier(e.target.value)}>
              <option value="" disabled selected>Chọn nhà cung cấp</option>
              {suppliers.map((supplier, index) => (
                <option key = {`supplier-${index}`} value= {supplier.supplierName}>
                  {supplier.supplierName}
                </option>
              ))}
            </Select>
            <DropdownIcon><FaChevronDown size={12} /></DropdownIcon>
          </SelectContainer>
        </FormGroup>

        <FormGroup>
          <Label>Nhân viên:</Label>
          <SelectContainer>
            <Select value={selectedPerson} onChange={(e) => setSelectedPerson(e.target.value)}>
              <option value="" disabled selected>Chọn nhân viên</option>
              {people.map((person, index) => (
                <option key = {`person-${index}`} value={person.personName}>
                  {person.personName}
                </option>
              ))}
            </Select>
            <DropdownIcon><FaChevronDown size={12} /></DropdownIcon>
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
                <TableHeader style={{ width: "10%" }}>STT</TableHeader>
                <TableHeader style={{ width: "20%" }}>Tên sản phẩm</TableHeader>
                <TableHeader style={{ width: "15%" }}>Mã sản phẩm</TableHeader>
                <TableHeader style={{ width: "15%" }}>ĐVT</TableHeader>
                <TableHeader style={{ width: "15%" }}>Mã lô/Số PO</TableHeader>
                <TableHeader style={{ width: "20%" }}>Số lượng nhập</TableHeader>
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
                  <input style={{textAlign: "center", width: "100%"}}
                    type="text" 
                    placeholder="Tên sản phẩm" 
                    value={materialName}
                    onChange={(e) => setMaterialName(e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <input style={{textAlign: "center", width: "100%"}}
                    type="text" 
                    placeholder="Mã sản phẩm" 
                    value={materialId}
                    onChange={(e) => setMaterialId(e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <input style={{textAlign: "center", width: "100%"}}
                    type="text" 
                    placeholder="ĐVT" 
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <input style={{textAlign: "center", width: "100%"}}
                    type="text" 
                    placeholder="Mã lô/Số PO" 
                    value={lotNumber}
                    onChange={(e) => setLotNumber(e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <input style={{textAlign: "center", width: "100%", paddingLeft: "12%"}}
                    type="number"
                    min="0"
                    step="1"
                    placeholder="Số lượng nhập" 
                    value={importedQuantity}
                    onChange={(e) => setImportedQuantity(e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <button onClick={handleAddMaterial} style={{paddingRight: "70%"}}>
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