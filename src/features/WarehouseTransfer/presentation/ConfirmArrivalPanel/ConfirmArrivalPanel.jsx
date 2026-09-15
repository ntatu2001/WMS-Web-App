import React, { useEffect, useState } from 'react';
import Table from '../../../../common/components/Table/Table.jsx';
import TableHeader from '../../../../common/components/Table/TableHeader.jsx';
import TableCell from '../../../../common/components/Table/TableCell.jsx';
import SelectContainer from '../../../../common/components/Selection/SelectContainer.jsx';
import Select from '../../../../common/components/Selection/Select.jsx';
import { ClipLoader } from 'react-spinners';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import transferApi from '../../../../api/transferApi.js';
import locationApi from '../../../../api/locationApi.js';
import employeeApi from '../../../../api/employeeApi.js';
import { getTransferErrorMessage } from '../../utils/transferErrorMessages.js';
import ConfirmOverlay from '../ConfirmOverlay/ConfirmOverlay.jsx';
import useTranslation from '../../../../common/hooks/useTranslation';
import styles from './ConfirmArrivalPanel.module.scss';

const errorTextStyle = { color: 'var(--status-error)', fontSize: '12px', marginTop: '4px' };

// Bảng chọn vị trí lưu trữ tại kho đích cho từng sub-lot của 1 phiếu đang InTransit —
// mô phỏng InCompleteReceipt.jsx (rút gọn, chỉ xử lý 1 phiếu tại 1 thời điểm).
const ConfirmArrivalPanel = ({ transferId, onClose, onSuccess }) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [transfer, setTransfer] = useState(null);
  const [rows, setRows] = useState([]);
  const [toLocations, setToLocations] = useState([]);
  const [people, setPeople] = useState([]);
  const [receivedBy, setReceivedBy] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRowErrors, setShowRowErrors] = useState(false);

  useEffect(() => {
    const loadDetail = async () => {
      setIsLoading(true);
      try {
        const [detail, employeeList] = await Promise.all([
          transferApi.getTransferById(transferId),
          employeeApi.getAllEmployeeNameId(),
        ]);
        setTransfer(detail);
        setPeople(Array.isArray(employeeList) ? employeeList : []);

        const flattened = (detail.entries || []).flatMap((entry) =>
          (entry.subLots || []).map((subLot) => ({
            transferSubLotId: subLot.transferSubLotId,
            materialId: entry.materialId,
            materialName: entry.materialName,
            lotNumber: subLot.lotNumber,
            quantity: subLot.quantity,
            toLocationId: '',
          }))
        );
        setRows(flattened);

        if (detail.toWarehouseId) {
          const locations = await locationApi.GetLocationsByWarehouseId(detail.toWarehouseId);
          setToLocations(Array.isArray(locations) ? locations : []);
        }
      } catch (error) {
        console.error('Error loading transfer detail:', error);
        toast.error(getTransferErrorMessage(error, t), { position: 'top-right', autoClose: 3000 });
        onClose();
      } finally {
        setIsLoading(false);
      }
    };

    loadDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transferId]);

  const updateRowLocation = (index, toLocationId) => {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, toLocationId } : row)));
  };

  const allPlaced = rows.length > 0 && rows.every((row) => row.toLocationId);

  const handleSubmit = async () => {
    setShowRowErrors(true);
    if (!receivedBy) {
      toast.error(t('transfer.valRequestedBy'), { position: 'top-right', autoClose: 3000 });
      return;
    }
    if (!allPlaced) {
      toast.error(t('transfer.valArrivalIncomplete'), { position: 'top-right', autoClose: 3000 });
      return;
    }

    const receivedByEmployeeId = people.find((p) => p.employeeName === receivedBy)?.employeeId;
    const payload = {
      transferId,
      receivedByEmployeeId,
      subLotPlacements: rows.map(({ transferSubLotId, toLocationId }) => ({ transferSubLotId, toLocationId })),
    };

    setIsSubmitting(true);
    try {
      await transferApi.confirmArrival(payload);
      toast.success(t('transfer.confirmArrivalSuccess'), { position: 'top-right', autoClose: 3000 });
      onSuccess();
    } catch (error) {
      toast.error(getTransferErrorMessage(error, t), { position: 'top-right', autoClose: 3000 });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ConfirmOverlay
      title={t('transfer.confirmArrivalTitle')}
      onCancel={onClose}
      onConfirm={handleSubmit}
      isProcessing={isSubmitting}
      confirmLabel={t('transfer.btnConfirmArrival')}
      wide
    >
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '24px' }}>
          <ClipLoader color="var(--color-teal)" size={40} />
        </div>
      ) : (
        <>
          <p>{t('transfer.confirmArrivalBody', { toWarehouse: transfer?.toWarehouseId })}</p>

          <label style={{ display: 'block', margin: '8px 0', fontSize: '13px' }}>
            {t('transfer.fieldReceivedBy')}
            <SelectContainer style={{ marginTop: '4px' }}>
              <Select value={receivedBy} onChange={(e) => setReceivedBy(e.target.value)} placeholder={t('transfer.selectEmployee')}>
                {people.map((person, i) => (
                  <option key={`received-by-${i}`} value={person.employeeName}>{person.employeeName}</option>
                ))}
              </Select>
            </SelectContainer>
          </label>

          <div className={styles.tableWrap}>
            <Table style={{ width: '100%' }}>
              <thead>
                <tr>
                  <TableHeader style={{ width: '30%' }}>{t('transfer.colProductName')}</TableHeader>
                  <TableHeader style={{ width: '20%' }}>{t('transfer.colLotNumber')}</TableHeader>
                  <TableHeader style={{ width: '15%' }}>{t('transfer.colQuantity')}</TableHeader>
                  <TableHeader style={{ width: '35%' }}>{t('transfer.fieldToLocation')}</TableHeader>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={row.transferSubLotId}>
                    <TableCell>{row.materialName || row.materialId}</TableCell>
                    <TableCell>{row.lotNumber}</TableCell>
                    <TableCell>{row.quantity}</TableCell>
                    <TableCell>
                      <SelectContainer>
                        <Select
                          value={row.toLocationId}
                          onChange={(e) => updateRowLocation(index, e.target.value)}
                          placeholder={t('transfer.selectToLocation')}
                          style={{ fontSize: '90%' }}
                        >
                          {toLocations.map((loc, i) => (
                            <option key={`to-loc-${index}-${i}`} value={loc.locationId}>{loc.locationId}</option>
                          ))}
                        </Select>
                      </SelectContainer>
                      {showRowErrors && !row.toLocationId && (
                        <div style={errorTextStyle}>{t('transfer.valArrivalIncomplete')}</div>
                      )}
                    </TableCell>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </>
      )}
    </ConfirmOverlay>
  );
};

export default ConfirmArrivalPanel;
