import React, { useState, useEffect } from 'react';
import { FaTrash } from 'react-icons/fa';
import { AiOutlinePlus } from 'react-icons/ai';
import SectionTitle from '../../../../common/components/Text/SectionTitle.jsx';
import Table from '../../../../common/components/Table/Table.jsx';
import TableHeader from '../../../../common/components/Table/TableHeader.jsx';
import TableCell from '../../../../common/components/Table/TableCell.jsx';
import SelectContainer from '../../../../common/components/Selection/SelectContainer.jsx';
import Select from '../../../../common/components/Selection/Select.jsx';
import FormGroup from '../../../../common/components/FormGroup/FormGroup.jsx';
import ActionButton from '../../../../common/components/Button/ActionButton/ActionButton.jsx';
import ContentContainer from '../../../../common/components/ContentContainer/ContentContainer.jsx';
import DateInput from '../../../../common/components/DateInput/DateInput.jsx';
import Label from '../../../../common/components/Label/Label.jsx';
import FormSection from '../../../../common/components/Section/FormSection.jsx';
import ListSection from '../../../../common/components/Section/ListSection.jsx';
import DeleteButton from '../../../../common/components/Button/DeleteButton/DeleteButton.jsx';
import Tag from '../../../../common/components/Tag/Tag.jsx';
import inventoryReceiptApi from '../../../../api/inventoryReceiptApi.js';
import wareHouseApi from '../../../../api/wareHouseApi.js';
import supplierApi from '../../../../api/supplierApi.js';
import employeeApi from '../../../../api/employeeApi.js';
import materialApi from '../../../../api/materialApi.js';
import receiptLotApi from '../../../../api/receiptLotApi.js';
import { getApiErrorMessage } from '../../../../api/apiError.js';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ClipLoader } from 'react-spinners';

let rowIdCounter = 0;
const createEmptyRow = () => ({
  id: `row-${++rowIdCounter}`,
  materialName: '',
  materialId: '',
  unit: '',
  lotNumber: '',
  importedQuantity: '',
});

const errorTextStyle = { color: '#f43f5e', fontSize: '12px', marginTop: '4px' };

const CreateGoodReceipt = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [selectedZone, setSelectedZone] = useState(null);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [wareHouses, setWareHouses] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [people, setPeople] = useState([]);
  const [materialsList, setMaterialsList] = useState([]);
  const [materialOptionNames, setMaterialOptionNames] = useState([]);
  const [receiptLotIdList, setReceiptLotIdList] = useState([]);
  const [rows, setRows] = useState([createEmptyRow()]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [rowErrors, setRowErrors] = useState({});
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    const GetApi = async () => {
      try {
        setIsLoading(true);
        const wareHouseList = await wareHouseApi.getAllWareHouses();
        const supplierList = await supplierApi.getAllSupplier();
        const employeeList = await employeeApi.getAllEmployees();
        const receiptLotList = await receiptLotApi.getAllReceiptLots();
        setPeople(employeeList);
        setWareHouses(wareHouseList);
        setSuppliers(supplierList);
        setReceiptLotIdList(receiptLotList.map(lot => lot.receiptLotId));
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error("Lỗi khi tải dữ liệu!");
      } finally {
        setIsLoading(false);
      }
    };

    GetApi();
  }, []);

  // Khi đổi Kho hàng, tự động chọn Mã kho hàng đầu tiên thuộc kho đó và loại bỏ
  // các mã thuộc kho khác khỏi combo box Mã kho hàng (xem renderOptions bên dưới).
  useEffect(() => {
    if (!selectedWarehouse) {
      setSelectedZone(null);
      return;
    }
    const codesForSelectedWarehouse = wareHouses
      .filter(w => w.warehouseName === selectedWarehouse)
      .map(w => w.warehouseId);
    setSelectedZone(codesForSelectedWarehouse[0] || null);
  }, [selectedWarehouse, wareHouses]);

  useEffect(() => {
    const fetchMaterials = async () => {
      if (!selectedZone) return;
      try {
        const materialList = await materialApi.getMaterialsByWarehouseId(selectedZone);
        setMaterialsList(materialList);
        setMaterialOptionNames(materialList.map(material => material.materialName));
      } catch (error) {
        console.error('Error fetching materials:', error);
      }
    };

    fetchMaterials();
  }, [selectedZone]);

  useEffect(() => {
    if (hasSubmitted) {
      setFieldErrors({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedWarehouse, selectedZone, selectedSupplier, selectedPerson, selectedDate]);

  const updateRow = (index, field, value) => {
    setRows(prev => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  };

  const handleMaterialNameChange = async (index, materialName) => {
    updateRow(index, 'materialName', materialName);
    const material = materialsList.find(m => m.materialName === materialName);
    if (!material) {
      updateRow(index, 'materialId', '');
      updateRow(index, 'unit', '');
      return;
    }
    updateRow(index, 'materialId', material.materialId);
    try {
      const unit = await materialApi.getUnitByMaterialId(material.materialId);
      updateRow(index, 'unit', unit);
    } catch (error) {
      console.error('Error fetching unit:', error);
    }
  };

  const handleLotNumberChange = (index, value) => {
    updateRow(index, 'lotNumber', value);
  };

  const addRow = () => {
    setRows(prev => [...prev, createEmptyRow()]);
  };

  const removeRow = (index) => {
    setRows(prev => prev.filter((_, i) => i !== index));
  };

  const totalQuantity = rows.reduce((sum, row) => sum + (Number(row.importedQuantity) || 0), 0);

  const validate = () => {
    const nextFieldErrors = {};
    if (!selectedWarehouse) nextFieldErrors.warehouse = 'Vui lòng chọn kho hàng';
    if (!selectedZone) nextFieldErrors.zone = 'Vui lòng chọn mã kho hàng';
    if (!selectedSupplier) nextFieldErrors.supplier = 'Vui lòng chọn nhà cung cấp';
    if (!selectedPerson) nextFieldErrors.person = 'Vui lòng chọn nhân viên';
    if (!selectedDate) nextFieldErrors.date = 'Vui lòng chọn ngày nhập kho';

    const nextRowErrors = {};
    rows.forEach((row, index) => {
      const errors = {};
      if (!row.materialName) errors.materialName = 'Chọn sản phẩm';
      if (row.lotNumber && receiptLotIdList.includes(row.lotNumber)) errors.lotNumber = 'Mã lô này đã tồn tại!';
      if (!(Number(row.importedQuantity) > 0)) errors.importedQuantity = 'SL > 0';
      if (Object.keys(errors).length > 0) nextRowErrors[index] = errors;
    });

    setFieldErrors(nextFieldErrors);
    setRowErrors(nextRowErrors);
    return Object.keys(nextFieldErrors).length === 0 && Object.keys(nextRowErrors).length === 0;
  };

  const createReceipt = async () => {
    setHasSubmitted(true);
    if (!validate()) {
      toast.error("Vui lòng kiểm tra các dòng sản phẩm còn thiếu thông tin!", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    try {
      const supplierId = suppliers.find(x => x.supplierName === selectedSupplier).supplierId;
      const employeeId = people.find(x => x.employeeName === selectedPerson).employeeId;
      const newReceipt = {
        warehouseId: selectedZone,
        supplierId: supplierId,
        employeeId: employeeId,
        receiptDate: selectedDate,
        entries: rows.map(({ materialName, materialId, unit, lotNumber, importedQuantity }) => ({
          materialName, materialId, unit, lotNumber, importedQuantity,
        })),
      };
      await inventoryReceiptApi.createReceipt(newReceipt);
      toast.success("Tạo phiếu nhập kho thành công!", {
        position: "top-right",
        autoClose: 3000,
      });

      setSelectedWarehouse(null);
      setSelectedZone(null);
      setSelectedSupplier(null);
      setSelectedPerson(null);
      setSelectedDate(null);
      setRows([createEmptyRow()]);
      setFieldErrors({});
      setRowErrors({});
      setHasSubmitted(false);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Tạo phiếu nhập kho thất bại!'), {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  return (
    <ContentContainer style={{ display: "block" }}>
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <ClipLoader color="#36D7B7" loading={isLoading} size={50} />
        </div>
      ) : (
        <>
          <div style={{ display: "flex" }}>
            <FormSection>
              <SectionTitle>Phiếu nhập kho</SectionTitle>

              <FormGroup>
                <Label required>Kho hàng:</Label>
                <SelectContainer>
                  <Select
                    value={selectedWarehouse}
                    onChange={(e) => setSelectedWarehouse(e.target.value)}
                    placeholder="Chọn loại kho hàng"
                  >
                    {wareHouses.map((warehouse, index) => (
                      <option key={`warehouse-${index}`} value={warehouse.warehouseName}>
                        {warehouse.warehouseName}
                      </option>
                    ))}
                  </Select>
                </SelectContainer>
              </FormGroup>
              {fieldErrors.warehouse && <div style={errorTextStyle}>{fieldErrors.warehouse}</div>}

              <FormGroup>
                <Label required>Mã kho hàng:</Label>
                <SelectContainer>
                  <Select
                    value={selectedZone}
                    onChange={(e) => setSelectedZone(e.target.value)}
                    placeholder="Chọn mã kho hàng"
                  >
                    {wareHouses
                      .filter((warehouse) => warehouse.warehouseName === selectedWarehouse)
                      .map((warehouse, index) => (
                        <option key={`wareHouseId-${index}`} value={warehouse.warehouseId}>
                          {warehouse.warehouseId}
                        </option>
                      ))}
                  </Select>
                </SelectContainer>
              </FormGroup>
              {fieldErrors.zone && <div style={errorTextStyle}>{fieldErrors.zone}</div>}

              <FormGroup>
                <Label required>Nhà cung cấp:</Label>
                <SelectContainer>
                  <Select
                    value={selectedSupplier}
                    onChange={(e) => setSelectedSupplier(e.target.value)}
                    placeholder="Chọn nhà cung cấp"
                  >
                    {suppliers.map((supplier, index) => (
                      <option key={`supplier-${index}`} value={supplier.supplierName}>
                        {supplier.supplierName}
                      </option>
                    ))}
                  </Select>
                </SelectContainer>
              </FormGroup>
              {fieldErrors.supplier && <div style={errorTextStyle}>{fieldErrors.supplier}</div>}

              <FormGroup>
                <Label required>Nhân viên:</Label>
                <SelectContainer>
                  <Select
                    value={selectedPerson}
                    onChange={(e) => setSelectedPerson(e.target.value)}
                    placeholder="Chọn nhân viên"
                  >
                    {people.map((person, index) => (
                      <option key={`person-${index}`} value={person.employeeName}>
                        {person.employeeName}
                      </option>
                    ))}
                  </Select>
                </SelectContainer>
              </FormGroup>
              {fieldErrors.person && <div style={errorTextStyle}>{fieldErrors.person}</div>}

              <FormGroup>
                <Label required>Ngày nhập kho:</Label>
                <SelectContainer>
                  <DateInput
                    selectedDate={selectedDate}
                    onChange={setSelectedDate}
                  />
                </SelectContainer>
              </FormGroup>
              {fieldErrors.date && <div style={errorTextStyle}>{fieldErrors.date}</div>}
            </FormSection>

            <ListSection style={{ width: "50%" }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <SectionTitle style={{ marginBottom: 0 }}>Danh sách sản phẩm nhập kho</SectionTitle>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Tag variant="neutral">Số dòng: {rows.length}</Tag>
                  <Tag variant="accent">Tổng SL: {totalQuantity}</Tag>
                </div>
              </div>

              {Object.keys(rowErrors).length > 0 && (
                <div style={{ ...errorTextStyle, marginBottom: '8px' }}>
                  Vui lòng kiểm tra các dòng sản phẩm còn thiếu thông tin
                </div>
              )}

              <div style={{ maxHeight: "400px", overflowY: "scroll" }}>
                <Table style={{ tableLayout: "fixed", width: "100%" }}>
                  <thead>
                    <tr>
                      <TableHeader style={{ width: "7%" }}>STT</TableHeader>
                      <TableHeader style={{ width: "28%" }}>Tên sản phẩm</TableHeader>
                      <TableHeader style={{ width: "18%" }}>Mã sản phẩm</TableHeader>
                      <TableHeader style={{ width: "12%" }}>ĐVT</TableHeader>
                      <TableHeader style={{ width: "18%" }}>Mã lô/Số PO</TableHeader>
                      <TableHeader style={{ width: "17%" }}>SL nhập</TableHeader>
                      <TableHeader style={{ width: "8%" }}></TableHeader>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, index) => (
                      <tr key={row.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          <SelectContainer>
                            <Select
                              value={row.materialName}
                              onChange={(e) => handleMaterialNameChange(index, e.target.value)}
                              placeholder="Tên sản phẩm"
                              style={{ fontSize: "90%" }}
                            >
                              {materialOptionNames.map((name, i) => (
                                <option key={`material-${index}-${i}`} value={name}>
                                  {name}
                                </option>
                              ))}
                            </Select>
                          </SelectContainer>
                          {rowErrors[index]?.materialName && (
                            <div style={errorTextStyle}>{rowErrors[index].materialName}</div>
                          )}
                        </TableCell>
                        <TableCell>
                          <span style={{ color: row.materialId ? "#000" : "#767676", fontSize: "90%" }}>
                            {row.materialId || "Mã sản phẩm"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span style={{ color: row.unit ? "#000" : "#767676", fontSize: "90%" }}>
                            {row.unit || "ĐVT"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <input
                            style={{ textAlign: "center", width: "100%", fontSize: "90%" }}
                            type="text"
                            placeholder="Mã lô/Số PO"
                            value={row.lotNumber}
                            onChange={(e) => handleLotNumberChange(index, e.target.value)}
                          />
                          {rowErrors[index]?.lotNumber && (
                            <div style={errorTextStyle}>{rowErrors[index].lotNumber}</div>
                          )}
                        </TableCell>
                        <TableCell>
                          <input
                            style={{ textAlign: "center", width: "100%", fontSize: "90%" }}
                            type="number"
                            min="0"
                            step="1"
                            placeholder="SL nhập"
                            value={row.importedQuantity}
                            onChange={(e) => updateRow(index, 'importedQuantity', e.target.value)}
                          />
                          {rowErrors[index]?.importedQuantity && (
                            <div style={errorTextStyle}>{rowErrors[index].importedQuantity}</div>
                          )}
                        </TableCell>
                        <TableCell>
                          <DeleteButton onClick={() => removeRow(index)} disabled={rows.length === 1}>
                            <FaTrash size={16} color="#FF2115" />
                          </DeleteButton>
                        </TableCell>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              <ActionButton variant="secondary" onClick={addRow} style={{ width: 'auto', margin: '16px 0 0', padding: '10px 16px', fontSize: '14px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <AiOutlinePlus size={16} /> Thêm dòng sản phẩm
              </ActionButton>
            </ListSection>
          </div>
          <ActionButton
            style={{ marginTop: '2rem', width: '35%', padding: '14px', fontSize: '14px' }}
            onClick={createReceipt}
          >
            Tạo phiếu nhập kho
          </ActionButton>
        </>
      )}
    </ContentContainer>
  );
};

export default CreateGoodReceipt;
