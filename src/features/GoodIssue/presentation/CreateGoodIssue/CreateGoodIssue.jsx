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
import inventoryIssueApi from '../../../../api/inventoryIssueApi.js';
import wareHouseApi from '../../../../api/wareHouseApi.js';
import customerApi from '../../../../api/customerApi.js';
import employeeApi from '../../../../api/employeeApi.js';
import materialApi from '../../../../api/materialApi.js';
import materiaLotApi from '../../../../api/materiaLotApi.js';
import { parseIssueExcel, parseDmY } from '../../utils/parseIssueExcel.js';
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

const errorTextStyle = { color: 'var(--status-error)', fontSize: '12px', marginTop: '4px' };

const CreateGoodIssue = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [selectedZone, setSelectedZone] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [wareHouses, setWareHouses] = useState([]);
  // Một số kho hàng trùng tên (do mở rộng thêm kho mới), nên chỉ hiển thị mỗi tên 1 lần
  // trên Select "Kho hàng"; việc phân biệt các kho trùng tên do người dùng chọn tiếp ở "Mã kho hàng"
  const uniqueWarehouseNames = useMemo(
    () => Array.from(new Set(wareHouses.map(w => w.warehouseName))),
    [wareHouses]
  );
  const [customers, setCustomers] = useState([]);
  const [people, setPeople] = useState([]);
  const [materialsList, setMaterialsList] = useState([]);
  const [materialOptionNames, setMaterialOptionNames] = useState([]);
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
        const customerList = await customerApi.getAllCustomerNameId();
        const employeeList = await employeeApi.getAllEmployeeNameId();
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
        const materialList = await materialApi.getMaterialsByWarehouseIdAndMaterialLot(selectedZone);
        setMaterialsList(materialList);

        // Lấy sẵn danh sách Lot Number đang chứa từng sản phẩm để hiển thị ngay trong
        // tên ở combo box, ví dụ "[ML_08, RL_15] Tên sản phẩm". Dùng allSettled để một
        // material lỗi không làm hỏng cả danh sách hiển thị.
        const lotResults = await Promise.allSettled(
          materialList.map(material => materiaLotApi.GetLotNumbersByMaterialId(material.materialId))
        );
        const options = materialList.map((material, index) => {
          const lotNumbers = lotResults[index].status === 'fulfilled' ? lotResults[index].value : [];
          const prefix = lotNumbers.length > 0 ? `[${lotNumbers.join(', ')}] ` : '';
          return { name: material.materialName, label: `${prefix}${material.materialName}` };
        });
        setMaterialOptionNames(options);
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
      const lotNumberList = await materiaLotApi.GetLotNumbersByMaterialId(material.materialId);
      updateRow(index, 'lotNumberList', lotNumberList);
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

  const downloadTemplate = () => {
    const a = document.createElement('a');
    a.href = '/Template_Xuat_Kho.xlsx';
    a.download = 'Template_Xuat_Kho.xlsx';
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  // Nhập phiếu + danh sách sản phẩm xuất kho từ file Excel theo mẫu Template_Xuat_Kho.xlsx.
  // Toàn bộ hoặc không: chỉ khi file hợp lệ 100% mới điền form; có bất kỳ lỗi nào thì
  // không đổi state form và hiện banner đỏ liệt kê lỗi.
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
      const parsed = await parseIssueExcel(file);
      if (parsed.errors) {
        setImportErrors(parsed.errors);
        return;
      }
      const { header, items } = parsed;

      if (!wareHouses.length || !customers.length || !people.length) {
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

      const customer = customers.find(c => c.customerName === header.customerName);
      if (!customer) {
        errors.push(`Mục A: khách hàng "${header.customerName}" không tồn tại trong hệ thống.`);
      }

      const employee = people.find(p => p.employeeName === header.employeeName);
      if (!employee) {
        errors.push(`Mục A: nhân viên "${header.employeeName}" không tồn tại trong hệ thống.`);
      }

      const issueDate = parseDmY(header.dateText);
      if (!issueDate) {
        errors.push(`Mục A: ngày xuất kho "${header.dateText}" không hợp lệ (định dạng dd/mm/yyyy).`);
      }

      if (items.length === 0) {
        errors.push('File không có dòng sản phẩm nào.');
      }

      // Danh sách vật tư lấy trực tiếp theo mã kho trong file (không dựa vào state hiện tại)
      let materialsForZone = [];
      if (codeMatch) {
        try {
          materialsForZone = await materialApi.getMaterialsByWarehouseIdAndMaterialLot(header.warehouseCode);
        } catch {
          errors.push('Không tải được danh sách sản phẩm cho kho này. Vui lòng thử lại.');
        }
      }

      // Cache danh sách lô theo materialId + tồn kho theo lotNumber để tránh gọi lặp
      const lotListByMat = {};
      const availByLot = {};
      const distinctMatIds = [
        ...new Set(
          items
            .map(it => materialsForZone.find(m => m.materialName === it.productName)?.materialId)
            .filter(Boolean)
        ),
      ];
      await Promise.all(
        distinctMatIds.map(async (mid) => {
          try {
            lotListByMat[mid] = await materiaLotApi.GetLotNumbersByMaterialId(mid);
          } catch {
            lotListByMat[mid] = [];
            errors.push('Không tải được danh sách mã lô của sản phẩm. Vui lòng thử lại.');
          }
        })
      );

      const resolved = [];
      for (const it of items) {
        const prefix = `Dòng ${it.rowNumber}: `;
        const mat = materialsForZone.find(m => m.materialName === it.productName);
        if (codeMatch && !mat) {
          errors.push(`${prefix}sản phẩm "${it.productName}" không có trong kho.`);
        }

        if (!it.lotNumber) {
          errors.push(`${prefix}thiếu Mã lô / Số PO.`);
        } else if (mat && !(lotListByMat[mat.materialId] || []).includes(it.lotNumber)) {
          errors.push(`${prefix}mã lô "${it.lotNumber}" không thuộc sản phẩm "${it.productName}" (hoặc đã hết tồn).`);
        }

        let q = NaN;
        if (it.quantity === '') {
          errors.push(`${prefix}thiếu SL xuất.`);
        } else {
          q = Number(it.quantity);
          if (!Number.isFinite(q)) {
            errors.push(`${prefix}SL xuất không phải số.`);
          } else if (!(q > 0)) {
            errors.push(`${prefix}SL xuất phải lớn hơn 0.`);
          }
        }

        const lotOk = mat && it.lotNumber && (lotListByMat[mat.materialId] || []).includes(it.lotNumber);
        let avail = null;
        if (lotOk && Number.isFinite(q) && q > 0) {
          if (availByLot[it.lotNumber] === undefined) {
            try {
              const info = await materiaLotApi.GetQuantityByMaterialLotId(it.lotNumber);
              availByLot[it.lotNumber] = info.availableQuantity;
            } catch {
              availByLot[it.lotNumber] = null;
              errors.push(`${prefix}không lấy được tồn kho của mã lô "${it.lotNumber}".`);
            }
          }
          avail = availByLot[it.lotNumber];
          if (avail !== null && avail !== undefined && q > avail) {
            errors.push(`${prefix}SL xuất vượt quá tồn kho (${avail}).`);
          }
        }

        if (lotOk && Number.isFinite(q) && q > 0 && avail !== null && avail !== undefined && q <= avail) {
          resolved.push({ mat, it, q, avail, lotList: lotListByMat[mat.materialId] || [] });
        }
      }

      if (errors.length) {
        setImportErrors(errors);
        return;
      }

      // ĐVT: dùng giá trị trong file nếu có, thiếu thì gọi API (giống luồng chọn tay)
      const finalRows = await Promise.all(
        resolved.map(async ({ mat, it, q, avail, lotList }) => {
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
            lotNumberList: lotList,
            purchaseOrderNumber: it.lotNumber,
            existingQuantity: avail,
            requestedQuantity: String(q),
          };
        })
      );

      setSelectedWarehouse(header.warehouseName);
      setSelectedZone(header.warehouseCode);
      setMaterialsList(materialsForZone);
      setMaterialOptionNames(materialsForZone.map(m => ({ name: m.materialName, label: m.materialName })));
      setSelectedCustomer(header.customerName);
      setSelectedPerson(header.employeeName);
      setSelectedDate(issueDate);
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
      setImportErrors(null);
      setImportNotice(null);
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
          <ClipLoader color="var(--color-teal)" loading={isLoading} size={50} />
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
              border: '1px solid var(--status-error)', background: 'var(--color-surface-2)', color: 'var(--status-error)',
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
              border: '1px solid var(--status-success)', background: 'var(--color-surface-2)', color: 'var(--status-success)',
              borderRadius: 8, padding: '12px 16px', marginBottom: 16, fontSize: 13,
            }}>
              {importNotice}
            </div>
          )}

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
                              // Danh sách mở ra vẫn hiển thị "[Lot Number] Tên sản phẩm" để dễ phân
                              // biệt, nhưng sau khi chọn xong ô đóng chỉ hiển thị tên sản phẩm cho gọn.
                              formatOptionLabel={(option, { context }) => context === 'menu' ? option.label : option.value}
                            >
                              {materialOptionNames.map((opt, i) => (
                                <option key={`material-${index}-${i}`} value={opt.name}>
                                  {opt.label}
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
                          {row.existingQuantity !== null && (
                            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                              Tồn kho: {row.existingQuantity}
                            </div>
                          )}
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
