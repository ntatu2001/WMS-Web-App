import React, { useState, useEffect, useMemo } from 'react';
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
import transferApi from '../../../../api/transferApi.js';
import wareHouseApi from '../../../../api/wareHouseApi.js';
import employeeApi from '../../../../api/employeeApi.js';
import locationApi from '../../../../api/locationApi.js';
import materialSubLotApi from '../../../../api/materialSubLotApi.js';
import { getTransferErrorMessage } from '../../utils/transferErrorMessages.js';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ClipLoader } from 'react-spinners';
import useTranslation from '../../../../common/hooks/useTranslation';
import useMediaQuery from '../../../../common/hooks/useMediaQuery';

let rowIdCounter = 0;
const createEmptyRow = () => ({
  id: `row-${++rowIdCounter}`,
  locationId: '',
  subLotOptions: [],
  loadingSubLots: false,
  materialSubLotId: '',
  materialId: '',
  materialName: '',
  lotNumber: '',
  unit: '',
  availableQuantity: null,
  quantity: '',
});

// MaterialSubLot có thể trả field số lượng khả dụng dưới vài tên khác nhau tuỳ endpoint
// (xem ghi chú lỗi chính tả DTO ở API_Guide_For_Frontend.md mục 5) — đọc phòng thủ.
const readAvailableQuantity = (subLot) =>
  subLot?.existingQuantity ?? subLot?.exisitingQuantity ?? subLot?.quantity ?? 0;

const errorTextStyle = { color: 'var(--status-error)', fontSize: '12px', marginTop: '4px' };

const CreateTransfer = () => {
  const { t } = useTranslation();
  const stackSections = useMediaQuery('(max-width: 1024px)');
  const [isLoading, setIsLoading] = useState(true);

  const [warehouses, setWarehouses] = useState([]);
  const uniqueWarehouseNames = useMemo(
    () => Array.from(new Set(warehouses.map((w) => w.warehouseName))),
    [warehouses]
  );

  const [selectedFromWarehouse, setSelectedFromWarehouse] = useState(null);
  const [selectedFromZone, setSelectedFromZone] = useState(null);
  const [selectedToWarehouse, setSelectedToWarehouse] = useState(null);
  const [selectedToZone, setSelectedToZone] = useState(null);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [note, setNote] = useState('');

  const [people, setPeople] = useState([]);
  const [fromLocations, setFromLocations] = useState([]);

  const [rows, setRows] = useState([createEmptyRow()]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [rowErrors, setRowErrors] = useState({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadLookups = async () => {
      try {
        setIsLoading(true);
        const [warehouseList, employeeList] = await Promise.all([
          wareHouseApi.getAllWarehouseNameId(),
          employeeApi.getAllEmployeeNameId(),
        ]);
        setWarehouses(warehouseList);
        setPeople(employeeList);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error(t('toast.loadError'));
      } finally {
        setIsLoading(false);
      }
    };

    loadLookups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cascade tên kho -> mã kho, giống pattern CreateGoodReceipt.jsx, áp dụng độc lập cho kho nguồn/đích.
  useEffect(() => {
    if (!selectedFromWarehouse) {
      setSelectedFromZone(null);
      return;
    }
    const codes = warehouses.filter((w) => w.warehouseName === selectedFromWarehouse).map((w) => w.warehouseId);
    setSelectedFromZone((prev) => (prev && codes.includes(prev) ? prev : codes[0] || null));
  }, [selectedFromWarehouse, warehouses]);

  useEffect(() => {
    if (!selectedToWarehouse) {
      setSelectedToZone(null);
      return;
    }
    const codes = warehouses.filter((w) => w.warehouseName === selectedToWarehouse).map((w) => w.warehouseId);
    setSelectedToZone((prev) => (prev && codes.includes(prev) ? prev : codes[0] || null));
  }, [selectedToWarehouse, warehouses]);

  // Danh sách vị trí trong kho nguồn, dùng chung cho mọi dòng entry.
  useEffect(() => {
    const fetchLocations = async () => {
      if (!selectedFromZone) {
        setFromLocations([]);
        return;
      }
      try {
        const locationList = await locationApi.GetLocationsByWarehouseId(selectedFromZone);
        setFromLocations(Array.isArray(locationList) ? locationList : []);
      } catch (error) {
        console.error('Error fetching locations:', error);
        setFromLocations([]);
      }
    };

    fetchLocations();
    // Đổi kho nguồn thì các dòng đã chọn location/lô phụ không còn hợp lệ nữa.
    setRows([createEmptyRow()]);
  }, [selectedFromZone]);

  useEffect(() => {
    if (hasSubmitted) setFieldErrors({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFromWarehouse, selectedFromZone, selectedToWarehouse, selectedToZone, selectedPerson, selectedDate]);

  const updateRow = (index, patch) => {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const handleRowLocationChange = async (index, locationId) => {
    updateRow(index, {
      locationId,
      subLotOptions: [],
      loadingSubLots: true,
      materialSubLotId: '',
      materialId: '',
      materialName: '',
      lotNumber: '',
      unit: '',
      availableQuantity: null,
      quantity: '',
    });
    if (!locationId) {
      updateRow(index, { loadingSubLots: false });
      return;
    }
    try {
      const subLots = await materialSubLotApi.getMaterialSubLotsByLocationId(locationId);
      updateRow(index, { subLotOptions: Array.isArray(subLots) ? subLots : [] });
    } catch (error) {
      console.error('Error fetching sub-lots:', error);
    } finally {
      updateRow(index, { loadingSubLots: false });
    }
  };

  const handleRowSubLotChange = (index, materialSubLotId) => {
    const row = rows[index];
    const subLot = row.subLotOptions.find(
      (s) => String(s.materialSubLotId) === String(materialSubLotId)
    );
    if (!subLot) {
      updateRow(index, { materialSubLotId: '', materialId: '', materialName: '', lotNumber: '', unit: '', availableQuantity: null, quantity: '' });
      return;
    }
    const available = readAvailableQuantity(subLot);
    updateRow(index, {
      materialSubLotId,
      materialId: subLot.materialId || '',
      materialName: subLot.materialName || '',
      lotNumber: subLot.lotNumber || '',
      unit: subLot.unitOfMeasure || subLot.unit || '',
      availableQuantity: available,
      quantity: String(available),
    });
  };

  const addRow = () => setRows((prev) => [...prev, createEmptyRow()]);
  const removeRow = (index) => setRows((prev) => prev.filter((_, i) => i !== index));

  const totalQuantity = rows.reduce((sum, row) => sum + (Number(row.quantity) || 0), 0);

  const validate = () => {
    const nextFieldErrors = {};
    if (!selectedFromWarehouse || !selectedFromZone) nextFieldErrors.fromWarehouse = t('transfer.valFromWarehouse');
    if (!selectedToWarehouse || !selectedToZone) nextFieldErrors.toWarehouse = t('transfer.valToWarehouse');
    if (selectedFromZone && selectedToZone && selectedFromZone === selectedToZone) {
      nextFieldErrors.toWarehouse = t('transfer.valSameWarehouse');
    }
    if (!selectedPerson) nextFieldErrors.person = t('transfer.valRequestedBy');
    if (!selectedDate) nextFieldErrors.date = t('transfer.valDate');

    const nextRowErrors = {};
    if (rows.length === 0) {
      nextFieldErrors.rows = t('transfer.valNoEntries');
    }
    rows.forEach((row, index) => {
      const errors = {};
      if (!row.materialSubLotId) errors.subLot = t('transfer.valRowSubLot');
      const qty = Number(row.quantity);
      if (!(qty > 0)) {
        errors.quantity = t('transfer.valRowQtyGtZero');
      } else if (row.availableQuantity != null && qty > row.availableQuantity) {
        errors.quantity = t('transfer.valRowQtyOverAvailable');
      }
      if (Object.keys(errors).length > 0) nextRowErrors[index] = errors;
    });

    setFieldErrors(nextFieldErrors);
    setRowErrors(nextRowErrors);
    return Object.keys(nextFieldErrors).length === 0 && Object.keys(nextRowErrors).length === 0;
  };

  const resetForm = () => {
    setSelectedFromWarehouse(null);
    setSelectedFromZone(null);
    setSelectedToWarehouse(null);
    setSelectedToZone(null);
    setSelectedPerson(null);
    setSelectedDate(null);
    setNote('');
    setRows([createEmptyRow()]);
    setFieldErrors({});
    setRowErrors({});
    setHasSubmitted(false);
  };

  const handleSubmit = async () => {
    setHasSubmitted(true);
    if (!validate()) {
      toast.error(t('toast.checkMissingRows'), { position: 'top-right', autoClose: 3000 });
      return;
    }

    const requestedByEmployeeId = people.find((p) => p.employeeName === selectedPerson)?.employeeId;

    const payload = {
      fromWarehouseId: selectedFromZone,
      toWarehouseId: selectedToZone,
      requestedByEmployeeId,
      transferDate: selectedDate,
      note: note || undefined,
      entries: rows.map(({ materialId, materialSubLotId, lotNumber, quantity }) => ({
        materialId,
        materialSubLotId,
        lotNumber,
        quantity: Number(quantity),
      })),
    };

    setIsSubmitting(true);
    try {
      await transferApi.createTransfer(payload);
      toast.success(t('transfer.createSuccess'), { position: 'top-right', autoClose: 3000 });
      resetForm();
    } catch (err) {
      toast.error(getTransferErrorMessage(err, t), { position: 'top-right', autoClose: 3000 });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ContentContainer style={{ display: 'block' }}>
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <ClipLoader color="var(--color-teal)" loading={isLoading} size={50} />
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: stackSections ? 'column' : 'row', gap: stackSections ? 20 : 0 }}>
            <FormSection style={stackSections ? { width: '100%', marginRight: 0 } : undefined}>
              <SectionTitle>{t('transfer.createTitle')}</SectionTitle>

              <FormGroup>
                <Label required>{t('transfer.fieldFromWarehouse')}</Label>
                <SelectContainer>
                  <Select
                    value={selectedFromWarehouse}
                    onChange={(e) => setSelectedFromWarehouse(e.target.value)}
                    placeholder={t('transfer.selectFromWarehouse')}
                  >
                    {uniqueWarehouseNames.map((name, index) => (
                      <option key={`from-warehouse-${index}`} value={name}>{name}</option>
                    ))}
                  </Select>
                </SelectContainer>
              </FormGroup>
              {fieldErrors.fromWarehouse && <div style={errorTextStyle}>{fieldErrors.fromWarehouse}</div>}

              <FormGroup>
                <Label required>{t('transfer.fieldToWarehouse')}</Label>
                <SelectContainer>
                  <Select
                    value={selectedToWarehouse}
                    onChange={(e) => setSelectedToWarehouse(e.target.value)}
                    placeholder={t('transfer.selectToWarehouse')}
                  >
                    {uniqueWarehouseNames.map((name, index) => (
                      <option key={`to-warehouse-${index}`} value={name}>{name}</option>
                    ))}
                  </Select>
                </SelectContainer>
              </FormGroup>
              {fieldErrors.toWarehouse && <div style={errorTextStyle}>{fieldErrors.toWarehouse}</div>}

              <FormGroup>
                <Label required>{t('transfer.fieldRequestedBy')}</Label>
                <SelectContainer>
                  <Select
                    value={selectedPerson}
                    onChange={(e) => setSelectedPerson(e.target.value)}
                    placeholder={t('transfer.selectEmployee')}
                  >
                    {people.map((person, index) => (
                      <option key={`person-${index}`} value={person.employeeName}>{person.employeeName}</option>
                    ))}
                  </Select>
                </SelectContainer>
              </FormGroup>
              {fieldErrors.person && <div style={errorTextStyle}>{fieldErrors.person}</div>}

              <FormGroup>
                <Label required>{t('transfer.fieldTransferDate')}</Label>
                <SelectContainer>
                  <DateInput selectedDate={selectedDate} onChange={setSelectedDate} />
                </SelectContainer>
              </FormGroup>
              {fieldErrors.date && <div style={errorTextStyle}>{fieldErrors.date}</div>}

              <FormGroup>
                <Label>{t('transfer.fieldNote')}</Label>
                <input
                  style={{ width: '100%' }}
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </FormGroup>
            </FormSection>

            <ListSection style={{ width: stackSections ? '100%' : '50%' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <SectionTitle style={{ marginBottom: 0 }}>{t('transfer.createTitle')}</SectionTitle>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Tag variant="neutral">{t('transfer.rows', { count: rows.length })}</Tag>
                  <Tag variant="accent">{t('transfer.totalQty', { count: totalQuantity })}</Tag>
                </div>
              </div>

              {fieldErrors.rows && <div style={{ ...errorTextStyle, marginBottom: '8px' }}>{fieldErrors.rows}</div>}

              <div style={{ maxHeight: '400px', overflowY: 'scroll' }}>
                <Table style={{ tableLayout: 'fixed', width: '100%' }}>
                  <thead>
                    <tr>
                      <TableHeader style={{ width: '6%' }}>{t('transfer.colNo')}</TableHeader>
                      <TableHeader style={{ width: '24%' }}>{t('transfer.fieldFromLocation')}</TableHeader>
                      <TableHeader style={{ width: '26%' }}>{t('transfer.fieldSubLot')}</TableHeader>
                      <TableHeader style={{ width: '18%' }}>{t('transfer.fieldQuantity')}</TableHeader>
                      <TableHeader style={{ width: '18%' }}></TableHeader>
                      <TableHeader style={{ width: '8%' }}></TableHeader>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, index) => (
                      <tr key={row.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          <SelectContainer>
                            <Select
                              value={row.locationId}
                              onChange={(e) => handleRowLocationChange(index, e.target.value)}
                              placeholder={t('transfer.selectFromLocation')}
                              style={{ fontSize: '90%' }}
                            >
                              {fromLocations.map((loc, i) => (
                                <option key={`loc-${index}-${i}`} value={loc.locationId}>{loc.locationId}</option>
                              ))}
                            </Select>
                          </SelectContainer>
                        </TableCell>
                        <TableCell>
                          <SelectContainer>
                            <Select
                              value={row.materialSubLotId}
                              onChange={(e) => handleRowSubLotChange(index, e.target.value)}
                              placeholder={row.loadingSubLots ? t('common.loading') : t('transfer.selectSubLot')}
                              style={{ fontSize: '90%' }}
                            >
                              {row.subLotOptions.map((subLot, i) => (
                                <option key={`sublot-${index}-${i}`} value={subLot.materialSubLotId}>
                                  {(subLot.materialName || subLot.materialId || '')} — {subLot.lotNumber}
                                </option>
                              ))}
                            </Select>
                          </SelectContainer>
                          {rowErrors[index]?.subLot && <div style={errorTextStyle}>{rowErrors[index].subLot}</div>}
                          {row.availableQuantity != null && (
                            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                              {t('transfer.fieldAvailableQty', { qty: row.availableQuantity })}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <input
                            style={{ textAlign: 'center', width: '100%', fontSize: '90%' }}
                            type="number"
                            min="0"
                            step="1"
                            value={row.quantity}
                            onChange={(e) => updateRow(index, { quantity: e.target.value })}
                          />
                          {rowErrors[index]?.quantity && <div style={errorTextStyle}>{rowErrors[index].quantity}</div>}
                        </TableCell>
                        <TableCell>
                          <span style={{ fontSize: '90%', color: 'var(--color-text-muted)' }}>{row.unit}</span>
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

              <ActionButton
                variant="secondary"
                onClick={addRow}
                disabled={!selectedFromZone}
                style={{ width: 'auto', margin: '16px 0 0', padding: '10px 16px', fontSize: '14px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <AiOutlinePlus size={16} /> {t('transfer.addRow')}
              </ActionButton>
            </ListSection>
          </div>

          <ActionButton
            style={{ marginTop: '2rem', width: '35%', padding: '14px', fontSize: '14px' }}
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? t('transfer.processing') : t('transfer.submit')}
          </ActionButton>
        </>
      )}
    </ContentContainer>
  );
};

export default CreateTransfer;
