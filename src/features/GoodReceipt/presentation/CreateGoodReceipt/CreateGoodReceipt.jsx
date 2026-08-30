import React, { useState, useEffect, useMemo, useRef } from 'react';
import { FaTrash } from 'react-icons/fa';
import { AiOutlinePlus, AiOutlineUpload, AiOutlineDownload } from 'react-icons/ai';
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
import { parseReceiptExcel, parseDmY } from '../../utils/parseReceiptExcel.js';
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
  // Một số kho hàng trùng tên (do mở rộng thêm kho mới), nên chỉ hiển thị mỗi tên 1 lần
  // trên Select "Kho hàng"; việc phân biệt các kho trùng tên do người dùng chọn tiếp ở "Mã kho hàng"
  const uniqueWarehouseNames = useMemo(
    () => Array.from(new Set(wareHouses.map(w => w.warehouseName))),
    [wareHouses]
  );
  const [suppliers, setSuppliers] = useState([]);
  const [people, setPeople] = useState([]);
  const [materialsList, setMaterialsList] = useState([]);
  const [materialOptionNames, setMaterialOptionNames] = useState([]);
  const [receiptLotIdList, setReceiptLotIdList] = useState([]);
  const [rows, setRows] = useState([createEmptyRow()]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [rowErrors, setRowErrors] = useState({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const fileInputRef = useRef(null);
  const [importing, setImporting] = useState(false);
  const [importErrors, setImportErrors] = useState(null); // string[] | null -> banner đỏ
  const [importNotice, setImportNotice] = useState(null); // string | null -> banner xanh

  useEffect(() => {
    const GetApi = async () => {
      try {
        setIsLoading(true);
        const wareHouseList = await wareHouseApi.getAllWarehouseNameId();
        const supplierList = await supplierApi.getAllSupplierNameId();
        const employeeList = await employeeApi.getAllEmployeeNameId();
        const receiptLotIdList = await receiptLotApi.getAllReceiptLotIds();
        setPeople(employeeList);
        setWareHouses(wareHouseList);
        setSuppliers(supplierList);
        setReceiptLotIdList(receiptLotIdList);
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
    // Giữ nguyên mã kho hiện tại nếu nó vẫn thuộc kho vừa chọn (cần cho luồng import
    // khi mã kho lấy từ file không phải mã đầu tiên trùng tên); nếu không thì chọn mã đầu.
    setSelectedZone(prev =>
      prev && codesForSelectedWarehouse.includes(prev)
        ? prev
        : (codesForSelectedWarehouse[0] || null)
    );
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

  // Nhập phiếu + danh sách lô hàng từ file Excel theo mẫu Template_Nhap_Kho.xlsx.
  // Toàn bộ hoặc không: chỉ khi file hợp lệ 100% mới điền form; có bất kỳ lỗi nào thì
  // không đổi state form và hiện banner đỏ liệt kê lỗi.
  const downloadTemplate = () => {
    const a = document.createElement('a');
    a.href = '/Template_Nhap_Kho.xlsx';
    a.download = 'Template_Nhap_Kho.xlsx';
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleImportFile = async (file) => {
    if (!/\.(xlsx|xls)$/i.test(file.name)) {
      setImportNotice(null);
      setImportErrors(['Vui lòng dùng file .xlsx theo mẫu.']);
      toast.error('Vui lòng dùng file .xlsx theo mẫu.', { position: 'top-right', autoClose: 3000 });
      return;
    }

    setImporting(true);
    setImportErrors(null);
    setImportNotice(null);
    try {
      const parsed = await parseReceiptExcel(file);
      if (parsed.errors) {
        setImportErrors(parsed.errors);
        return;
      }
      const { header, items } = parsed;

      if (!wareHouses.length || !suppliers.length || !people.length) {
        toast.error('Dữ liệu chưa tải xong, vui lòng thử lại.', { position: 'top-right', autoClose: 3000 });
        return;
      }

      const errors = [];

      const nameMatches = wareHouses.filter(w => w.warehouseName === header.warehouseName);
      if (nameMatches.length === 0) {
        errors.push(`Mục A: kho hàng "${header.warehouseName}" không tồn tại trong hệ thống.`);
      }
      const codeMatch = wareHouses.find(w => w.warehouseId === header.warehouseCode);
      if (!codeMatch) {
        errors.push(`Mục A: mã kho hàng "${header.warehouseCode}" không tồn tại trong hệ thống.`);
      } else if (codeMatch.warehouseName !== header.warehouseName) {
        errors.push(`Mục A: mã kho hàng "${header.warehouseCode}" không thuộc kho hàng "${header.warehouseName}".`);
      }

      const supplier = suppliers.find(s => s.supplierName === header.supplierName);
      if (!supplier) {
        errors.push(`Mục A: nhà cung cấp "${header.supplierName}" không tồn tại trong hệ thống.`);
      }

      const employee = people.find(p => p.employeeName === header.employeeName);
      if (!employee) {
        errors.push(`Mục A: nhân viên "${header.employeeName}" không tồn tại trong hệ thống.`);
      }

      const receiptDate = parseDmY(header.dateText);
      if (!receiptDate) {
        errors.push(`Mục A: ngày nhập kho "${header.dateText}" không hợp lệ (định dạng dd/mm/yyyy).`);
      }

      if (items.length === 0) {
        errors.push('File không có dòng sản phẩm nào.');
      }

      // Danh sách vật tư lấy trực tiếp theo mã kho trong file (không dựa vào state hiện tại)
      let materialsForZone = [];
      if (codeMatch) {
        try {
          materialsForZone = await materialApi.getMaterialsByWarehouseId(header.warehouseCode);
        } catch {
          errors.push('Không tải được danh sách sản phẩm cho kho này. Vui lòng thử lại.');
        }
      }

      const resolved = [];
      const seenLots = new Set();
      items.forEach((it) => {
        const prefix = `Dòng ${it.rowNumber}: `;
        const mat = materialsForZone.find(m => m.materialName === it.productName);
        if (codeMatch && !mat) {
          errors.push(`${prefix}sản phẩm "${it.productName}" không có trong kho.`);
        }

        let q = NaN;
        if (it.quantity === '') {
          errors.push(`${prefix}thiếu SL nhập.`);
        } else {
          q = Number(it.quantity);
          if (!Number.isFinite(q)) {
            errors.push(`${prefix}SL nhập không phải số.`);
          } else if (!(q > 0)) {
            errors.push(`${prefix}SL nhập phải lớn hơn 0.`);
          }
        }

        if (it.lotNumber && receiptLotIdList.includes(it.lotNumber)) {
          errors.push(`${prefix}mã lô "${it.lotNumber}" đã tồn tại trong hệ thống.`);
        }
        if (it.lotNumber) {
          if (seenLots.has(it.lotNumber)) {
            errors.push(`${prefix}mã lô "${it.lotNumber}" bị trùng trong file.`);
          } else {
            seenLots.add(it.lotNumber);
          }
        }

        if (mat && Number.isFinite(q) && q > 0) {
          resolved.push({ mat, it, q });
        }
      });

      if (errors.length) {
        setImportErrors(errors);
        return;
      }

      // ĐVT: dùng giá trị trong file nếu có, thiếu thì gọi API (giống luồng chọn tay)
      const finalRows = await Promise.all(
        resolved.map(async ({ mat, it, q }) => {
          let unit = it.unit;
          if (!unit) {
            try {
              unit = await materialApi.getUnitByMaterialId(mat.materialId);
            } catch {
              unit = '';
            }
          }
          return {
            id: `row-${++rowIdCounter}`,
            materialName: mat.materialName,
            materialId: mat.materialId,
            unit,
            lotNumber: it.lotNumber,
            importedQuantity: String(q),
          };
        })
      );

      setSelectedWarehouse(header.warehouseName);
      setSelectedZone(header.warehouseCode);
      setMaterialsList(materialsForZone);
      setMaterialOptionNames(materialsForZone.map(m => m.materialName));
      setSelectedSupplier(header.supplierName);
      setSelectedPerson(header.employeeName);
      setSelectedDate(receiptDate);
      setRows(finalRows);
      setFieldErrors({});
      setRowErrors({});
      setHasSubmitted(false);
      setImportErrors(null);
      setImportNotice(
        `Đã nhập phiếu và ${finalRows.length} dòng sản phẩm từ "${file.name}". Vui lòng kiểm tra lại trước khi tạo phiếu.`
      );
    } finally {
      setImporting(false);
    }
  };

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
      setImportErrors(null);
      setImportNotice(null);
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
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <ActionButton
              variant="secondary"
              disabled={importing}
              onClick={() => fileInputRef.current?.click()}
              style={{ width: 'auto', margin: 0, padding: '10px 16px', fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <AiOutlineUpload size={16} /> {importing ? 'Đang đọc file...' : 'Nhập từ Excel'}
            </ActionButton>
            <ActionButton
              variant="secondary"
              onClick={downloadTemplate}
              style={{ width: 'auto', margin: 0, padding: '10px 16px', fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <AiOutlineDownload size={16} /> Tải file Excel mẫu
            </ActionButton>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              style={{ display: 'none' }}
              onChange={(e) => {
                const f = e.target.files?.[0];
                e.target.value = '';
                if (f) handleImportFile(f);
              }}
            />
          </div>

          {importErrors && (
            <div style={{
              border: '1px solid #f43f5e', background: '#fff1f2', color: '#b91c1c',
              borderRadius: 8, padding: '12px 16px', marginBottom: 16, fontSize: 13,
            }}>
              <strong>Không thể nhập file. Chưa thay đổi dữ liệu trên form:</strong>
              <ul style={{ margin: '8px 0 0', paddingLeft: 20 }}>
                {importErrors.map((msg, i) => <li key={i}>{msg}</li>)}
              </ul>
            </div>
          )}

          {importNotice && (
            <div style={{
              border: '1px solid #10b981', background: '#ecfdf5', color: '#047857',
              borderRadius: 8, padding: '12px 16px', marginBottom: 16, fontSize: 13,
            }}>
              {importNotice}
            </div>
          )}

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
                    {uniqueWarehouseNames.map((warehouseName, index) => (
                      <option key={`warehouse-${index}`} value={warehouseName}>
                        {warehouseName}
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
