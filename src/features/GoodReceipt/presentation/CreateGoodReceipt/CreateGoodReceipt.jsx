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
import useTranslation from '../../../../common/hooks/useTranslation';
import useMediaQuery from '../../../../common/hooks/useMediaQuery';

let rowIdCounter = 0;
const createEmptyRow = () => ({
  id: `row-${++rowIdCounter}`,
  materialName: '',
  materialId: '',
  unit: '',
  lotNumber: '',
  importedQuantity: '',
});

const errorTextStyle = { color: 'var(--status-error)', fontSize: '12px', marginTop: '4px' };

const CreateGoodReceipt = () => {
  const { t } = useTranslation();
  // Stack the form + product-list columns vertically on tablet/mobile
  // (includes iPad Pro portrait at 1024px).
  const stackSections = useMediaQuery('(max-width: 1024px)');
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
        toast.error(t('toast.loadError'));
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
      setImportErrors([t('receipt.impUseXlsx')]);
      toast.error(t('receipt.impUseXlsx'), { position: 'top-right', autoClose: 3000 });
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
        toast.error(t('receipt.impDataLoading'), { position: 'top-right', autoClose: 3000 });
        return;
      }

      const errors = [];

      const nameMatches = wareHouses.filter(w => w.warehouseName === header.warehouseName);
      if (nameMatches.length === 0) {
        errors.push(t('receipt.impWarehouseNotExist', { name: header.warehouseName }));
      }
      const codeMatch = wareHouses.find(w => w.warehouseId === header.warehouseCode);
      if (!codeMatch) {
        errors.push(t('receipt.impWarehouseCodeNotExist', { code: header.warehouseCode }));
      } else if (codeMatch.warehouseName !== header.warehouseName) {
        errors.push(t('receipt.impWarehouseCodeMismatch', { code: header.warehouseCode, name: header.warehouseName }));
      }

      const supplier = suppliers.find(s => s.supplierName === header.supplierName);
      if (!supplier) {
        errors.push(t('receipt.impSupplierNotExist', { name: header.supplierName }));
      }

      const employee = people.find(p => p.employeeName === header.employeeName);
      if (!employee) {
        errors.push(t('receipt.impEmployeeNotExist', { name: header.employeeName }));
      }

      const receiptDate = parseDmY(header.dateText);
      if (!receiptDate) {
        errors.push(t('receipt.impDateInvalid', { value: header.dateText }));
      }

      if (items.length === 0) {
        errors.push(t('receipt.impNoItems'));
      }

      // Danh sách vật tư lấy trực tiếp theo mã kho trong file (không dựa vào state hiện tại)
      let materialsForZone = [];
      if (codeMatch) {
        try {
          materialsForZone = await materialApi.getMaterialsByWarehouseId(header.warehouseCode);
        } catch {
          errors.push(t('receipt.impMaterialsLoadFail'));
        }
      }

      const resolved = [];
      const seenLots = new Set();
      items.forEach((it) => {
        const prefix = t('receipt.impRowPrefix', { row: it.rowNumber });
        const mat = materialsForZone.find(m => m.materialName === it.productName);
        if (codeMatch && !mat) {
          errors.push(`${prefix}${t('receipt.impRowProductNotInWarehouse', { name: it.productName })}`);
        }

        let q = NaN;
        if (it.quantity === '') {
          errors.push(`${prefix}${t('receipt.impRowMissingQty')}`);
        } else {
          q = Number(it.quantity);
          if (!Number.isFinite(q)) {
            errors.push(`${prefix}${t('receipt.impRowQtyNotNumber')}`);
          } else if (!(q > 0)) {
            errors.push(`${prefix}${t('receipt.impRowQtyNotPositive')}`);
          }
        }

        if (it.lotNumber && receiptLotIdList.includes(it.lotNumber)) {
          errors.push(`${prefix}${t('receipt.impRowLotExists', { lot: it.lotNumber })}`);
        }
        if (it.lotNumber) {
          if (seenLots.has(it.lotNumber)) {
            errors.push(`${prefix}${t('receipt.impRowLotDup', { lot: it.lotNumber })}`);
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
        t('receipt.importedRows', { count: finalRows.length, file: file.name })
      );
    } finally {
      setImporting(false);
    }
  };

  const validate = () => {
    const nextFieldErrors = {};
    if (!selectedWarehouse) nextFieldErrors.warehouse = t('validation.selectWarehouse');
    if (!selectedZone) nextFieldErrors.zone = t('validation.selectWarehouseCode');
    if (!selectedSupplier) nextFieldErrors.supplier = t('validation.selectSupplier');
    if (!selectedPerson) nextFieldErrors.person = t('validation.selectEmployee');
    if (!selectedDate) nextFieldErrors.date = t('validation.selectReceiptDate');

    const nextRowErrors = {};
    rows.forEach((row, index) => {
      const errors = {};
      if (!row.materialName) errors.materialName = t('receipt.rowSelectProduct');
      if (row.lotNumber && receiptLotIdList.includes(row.lotNumber)) errors.lotNumber = t('receipt.rowLotExists');
      if (!(Number(row.importedQuantity) > 0)) errors.importedQuantity = t('receipt.rowQtyGtZero');
      if (Object.keys(errors).length > 0) nextRowErrors[index] = errors;
    });

    setFieldErrors(nextFieldErrors);
    setRowErrors(nextRowErrors);
    return Object.keys(nextFieldErrors).length === 0 && Object.keys(nextRowErrors).length === 0;
  };

  const createReceipt = async () => {
    setHasSubmitted(true);
    if (!validate()) {
      toast.error(t('toast.checkMissingRows'), {
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
      toast.success(t('toast.createReceiptOk'), {
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
      toast.error(getApiErrorMessage(err, t('toast.createReceiptFail')), {
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
              <AiOutlineUpload size={16} /> {importing ? t('receipt.importExcelReading') : t('receipt.importExcel')}
            </ActionButton>
            <ActionButton
              variant="secondary"
              onClick={downloadTemplate}
              style={{ width: 'auto', margin: 0, padding: '10px 16px', fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <AiOutlineDownload size={16} /> {t('receipt.downloadTemplate')}
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
              <strong>{t('receipt.importErrorTitle')}</strong>
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

          <div style={{ display: "flex", flexDirection: stackSections ? "column" : "row", gap: stackSections ? 20 : 0 }}>
            <FormSection style={stackSections ? { width: "100%", marginRight: 0 } : undefined}>
              <SectionTitle>{t('receipt.slipTitle')}</SectionTitle>

              <FormGroup>
                <Label required>{t('receipt.warehouse')}</Label>
                <SelectContainer>
                  <Select
                    value={selectedWarehouse}
                    onChange={(e) => setSelectedWarehouse(e.target.value)}
                    placeholder={t('receipt.selectWarehouseType')}
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
                <Label required>{t('receipt.warehouseCode')}</Label>
                <SelectContainer>
                  <Select
                    value={selectedZone}
                    onChange={(e) => setSelectedZone(e.target.value)}
                    placeholder={t('receipt.selectWarehouseCode')}
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
                <Label required>{t('receipt.supplier')}</Label>
                <SelectContainer>
                  <Select
                    value={selectedSupplier}
                    onChange={(e) => setSelectedSupplier(e.target.value)}
                    placeholder={t('receipt.selectSupplier')}
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
                <Label required>{t('receipt.employee')}</Label>
                <SelectContainer>
                  <Select
                    value={selectedPerson}
                    onChange={(e) => setSelectedPerson(e.target.value)}
                    placeholder={t('receipt.selectEmployee')}
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
                <Label required>{t('receipt.receiptDate')}</Label>
                <SelectContainer>
                  <DateInput
                    selectedDate={selectedDate}
                    onChange={setSelectedDate}
                  />
                </SelectContainer>
              </FormGroup>
              {fieldErrors.date && <div style={errorTextStyle}>{fieldErrors.date}</div>}
            </FormSection>

            <ListSection style={{ width: stackSections ? "100%" : "50%" }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <SectionTitle style={{ marginBottom: 0 }}>{t('receipt.productListTitle')}</SectionTitle>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Tag variant="neutral">{t('receipt.rows', { count: rows.length })}</Tag>
                  <Tag variant="accent">{t('receipt.totalQty', { count: totalQuantity })}</Tag>
                </div>
              </div>

              {Object.keys(rowErrors).length > 0 && (
                <div style={{ ...errorTextStyle, marginBottom: '8px' }}>
                  {t('receipt.checkMissingRows')}
                </div>
              )}

              <div style={{ maxHeight: "400px", overflowY: "scroll" }}>
                <Table style={{ tableLayout: "fixed", width: "100%" }}>
                  <thead>
                    <tr>
                      <TableHeader style={{ width: "7%" }}>{t('receipt.colNo')}</TableHeader>
                      <TableHeader style={{ width: "28%" }}>{t('receipt.colProductName')}</TableHeader>
                      <TableHeader style={{ width: "18%" }}>{t('receipt.colProductId')}</TableHeader>
                      <TableHeader style={{ width: "12%" }}>{t('receipt.colUom')}</TableHeader>
                      <TableHeader style={{ width: "18%" }}>{t('receipt.colLotOrPo')}</TableHeader>
                      <TableHeader style={{ width: "17%" }}>{t('receipt.colReceiptQty')}</TableHeader>
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
                              placeholder={t('receipt.phProductName')}
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
                          <span style={{ color: row.materialId ? "var(--color-text)" : "var(--color-text-muted)", fontSize: "90%" }}>
                            {row.materialId || t('receipt.phProductId')}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span style={{ color: row.unit ? "var(--color-text)" : "var(--color-text-muted)", fontSize: "90%" }}>
                            {row.unit || t('receipt.colUom')}
                          </span>
                        </TableCell>
                        <TableCell>
                          <input
                            style={{ textAlign: "center", width: "100%", fontSize: "90%" }}
                            type="text"
                            placeholder={t('receipt.phLotOrPo')}
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
                            placeholder={t('receipt.phReceiptQty')}
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
                <AiOutlinePlus size={16} /> {t('receipt.addRow')}
              </ActionButton>
            </ListSection>
          </div>
          <ActionButton
            style={{ marginTop: '2rem', width: '35%', padding: '14px', fontSize: '14px' }}
            onClick={createReceipt}
          >
            {t('receipt.submit')}
          </ActionButton>
        </>
      )}
    </ContentContainer>
  );
};

export default CreateGoodReceipt;
