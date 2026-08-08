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
import inventoryIssueApi from '../../../../api/inventoryIssueApi.js';
import wareHouseApi from '../../../../api/wareHouseApi.js';
import customerApi from '../../../../api/customerApi.js';
import employeeApi from '../../../../api/employeeApi.js';
import materialApi from '../../../../api/materialApi.js';
import materiaLotApi from '../../../../api/materiaLotApi.js';
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
  lotNumberList: [],
  purchaseOrderNumber: '',
  existingQuantity: null,
  requestedQuantity: '',
});

const errorTextStyle = { color: '#f43f5e', fontSize: '12px', marginTop: '4px' };

const CreateGoodIssue = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [selectedZone, setSelectedZone] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [wareHouses, setWareHouses] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [people, setPeople] = useState([]);
  const [materialsList, setMaterialsList] = useState([]);
  const [materialOptionNames, setMaterialOptionNames] = useState([]);
  const [rows, setRows] = useState([createEmptyRow()]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [rowErrors, setRowErrors] = useState({});
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    const GetApi = async () => {
      try {
        setIsLoading(true);
        const wareHouseList = await wareHouseApi.getAllWareHouses();
        const customerList = await customerApi.getAllCustomers();
        const employeeList = await employeeApi.getAllEmployees();
        setPeople(employeeList);
        setWareHouses(wareHouseList);
        setCustomers(customerList);
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
        const materialList = await materialApi.getMaterialsByWarehouseIdAndMaterialLot(selectedZone);
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
  }, [selectedWarehouse, selectedZone, selectedCustomer, selectedPerson, selectedDate]);

  const updateRow = (index, field, value) => {
    setRows(prev => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  };

  const handleMaterialNameChange = async (index, materialName) => {
    updateRow(index, 'materialName', materialName);
    updateRow(index, 'purchaseOrderNumber', '');
    updateRow(index, 'existingQuantity', null);
    updateRow(index, 'requestedQuantity', '');
    updateRow(index, 'lotNumberList', []);

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
    try {
      const materialLotList = await materiaLotApi.GetMaterialLotsByMaterialId(material.materialId);
      updateRow(index, 'lotNumberList', materialLotList.map(lot => lot.lotNumber));
    } catch (error) {
      updateRow(index, 'lotNumberList', []);
    }
  };

  const handleLotNumberChange = async (index, lotNumber) => {
    updateRow(index, 'purchaseOrderNumber', lotNumber);
    updateRow(index, 'requestedQuantity', '');
    if (!lotNumber) {
      updateRow(index, 'existingQuantity', null);
      return;
    }
    try {
      const materialLot = await materiaLotApi.GetQuantityByMaterialLotId(lotNumber);
      updateRow(index, 'existingQuantity', materialLot.availableQuantity);
    } catch (error) {
      console.error('Error fetching lot quantity:', error);
    }
  };

  const addRow = () => {
    setRows(prev => [...prev, createEmptyRow()]);
  };

  const removeRow = (index) => {
    setRows(prev => prev.filter((_, i) => i !== index));
  };

  const totalQuantity = rows.reduce((sum, row) => sum + (Number(row.requestedQuantity) || 0), 0);

  const validate = () => {
    const nextFieldErrors = {};
    if (!selectedWarehouse) nextFieldErrors.warehouse = 'Vui lòng chọn kho hàng';
    if (!selectedZone) nextFieldErrors.zone = 'Vui lòng chọn mã kho hàng';
    if (!selectedCustomer) nextFieldErrors.customer = 'Vui lòng chọn khách hàng';
    if (!selectedPerson) nextFieldErrors.person = 'Vui lòng chọn nhân viên';
    if (!selectedDate) nextFieldErrors.date = 'Vui lòng chọn ngày xuất kho';

    const nextRowErrors = {};
    rows.forEach((row, index) => {
      const errors = {};
      if (!row.materialName) errors.materialName = 'Chọn sản phẩm';
      if (!row.purchaseOrderNumber) errors.purchaseOrderNumber = 'Chọn mã lô/số PO';
      if (!(Number(row.requestedQuantity) > 0)) {
        errors.requestedQuantity = 'SL > 0';
      } else if (row.existingQuantity !== null && Number(row.requestedQuantity) > row.existingQuantity) {
        errors.requestedQuantity = `Vượt quá tồn kho (${row.existingQuantity})`;
      }
      if (Object.keys(errors).length > 0) nextRowErrors[index] = errors;
    });

    setFieldErrors(nextFieldErrors);
    setRowErrors(nextRowErrors);
    return Object.keys(nextFieldErrors).length === 0 && Object.keys(nextRowErrors).length === 0;
  };

  const createIssue = async () => {
    setHasSubmitted(true);
    if (!validate()) {
      toast.error("Vui lòng kiểm tra các dòng sản phẩm còn thiếu thông tin!", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    try {
      const customerId = customers.find(x => x.customerName === selectedCustomer).customerId;
      const employeeId = people.find(x => x.employeeName === selectedPerson).employeeId;
      const newIssue = {
        warehouseId: selectedZone,
        customerId: customerId,
        employeeId: employeeId,
        issueDate: selectedDate,
        entries: rows.map(({ materialName, materialId, unit, purchaseOrderNumber, requestedQuantity }) => ({
          materialName, materialId, unit, purchaseOrderNumber, requestedQuantity,
        })),
      };
      await inventoryIssueApi.createIssue(newIssue);
      toast.success("Tạo phiếu xuất kho thành công!", {
        position: "top-right",
        autoClose: 3000,
      });

      setSelectedWarehouse(null);
      setSelectedZone(null);
      setSelectedCustomer(null);
      setSelectedPerson(null);
      setSelectedDate(null);
      setRows([createEmptyRow()]);
      setFieldErrors({});
      setRowErrors({});
      setHasSubmitted(false);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Tạo phiếu xuất kho thất bại!'), {
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
              <SectionTitle>Phiếu xuất kho</SectionTitle>

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
                <Label required>Khách hàng:</Label>
                <SelectContainer>
                  <Select
                    value={selectedCustomer}
                    onChange={(e) => setSelectedCustomer(e.target.value)}
                    placeholder="Chọn khách hàng"
                  >
                    {customers.map((customer, index) => (
                      <option key={`customer-${index}`} value={customer.customerName}>
                        {customer.customerName}
                      </option>
                    ))}
                  </Select>
                </SelectContainer>
              </FormGroup>
              {fieldErrors.customer && <div style={errorTextStyle}>{fieldErrors.customer}</div>}

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
                <Label required>Ngày xuất kho:</Label>
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
                <SectionTitle style={{ marginBottom: 0 }}>Danh sách xuất kho</SectionTitle>
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
                      <TableHeader style={{ width: "27%" }}>Tên sản phẩm</TableHeader>
                      <TableHeader style={{ width: "17%" }}>Mã sản phẩm</TableHeader>
                      <TableHeader style={{ width: "10%" }}>ĐVT</TableHeader>
                      <TableHeader style={{ width: "20%" }}>Mã lô/Số PO</TableHeader>
                      <TableHeader style={{ width: "17%" }}>SL xuất</TableHeader>
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
                          <SelectContainer>
                            <Select
                              value={row.purchaseOrderNumber}
                              onChange={(e) => handleLotNumberChange(index, e.target.value)}
                              placeholder="Mã lô/Số PO"
                              style={{ fontSize: "90%" }}
                            >
                              {row.lotNumberList.map((lotNumber, i) => (
                                <option key={`lotNumber-${index}-${i}`} value={lotNumber}>
                                  {lotNumber}
                                </option>
                              ))}
                            </Select>
                          </SelectContainer>
                          {rowErrors[index]?.purchaseOrderNumber && (
                            <div style={errorTextStyle}>{rowErrors[index].purchaseOrderNumber}</div>
                          )}
                        </TableCell>
                        <TableCell>
                          <input
                            style={{ textAlign: "center", width: "100%", fontSize: "90%" }}
                            type="number"
                            min="0"
                            step="1"
                            placeholder="SL xuất"
                            value={row.requestedQuantity}
                            onChange={(e) => updateRow(index, 'requestedQuantity', e.target.value)}
                          />
                          {rowErrors[index]?.requestedQuantity && (
                            <div style={errorTextStyle}>{rowErrors[index].requestedQuantity}</div>
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
            onClick={createIssue}
          >
            Tạo phiếu xuất kho
          </ActionButton>
        </>
      )}
    </ContentContainer>
  );
};

export default CreateGoodIssue;
