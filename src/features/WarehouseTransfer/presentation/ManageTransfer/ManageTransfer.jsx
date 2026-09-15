import React, { useEffect, useState } from 'react';
import ContentContainer from '../../../../common/components/ContentContainer/ContentContainer.jsx';
import ListSection from '../../../../common/components/Section/ListSection.jsx';
import HeaderItem from '../../../../common/components/Header/HeaderItem.jsx';
import Table from '../../../../common/components/Table/Table.jsx';
import TableHeader from '../../../../common/components/Table/TableHeader.jsx';
import TableCell from '../../../../common/components/Table/TableCell.jsx';
import SelectContainer from '../../../../common/components/Selection/SelectContainer.jsx';
import Select from '../../../../common/components/Selection/Select.jsx';
import ActionButton from '../../../../common/components/Button/ActionButton/ActionButton.jsx';
import Tag from '../../../../common/components/Tag/Tag.jsx';
import Pagination from '../../../../common/components/Pagination/Pagination.jsx';
import { ClipLoader } from 'react-spinners';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import transferApi from '../../../../api/transferApi.js';
import wareHouseApi from '../../../../api/wareHouseApi.js';
import { getTransferErrorMessage } from '../../utils/transferErrorMessages.js';
import TransferProgress from '../TransferProgress/TransferProgress.jsx';
import ConfirmOverlay from '../ConfirmOverlay/ConfirmOverlay.jsx';
import ConfirmArrivalPanel from '../ConfirmArrivalPanel/ConfirmArrivalPanel.jsx';
import useTranslation from '../../../../common/hooks/useTranslation';
import { formatDate } from '../../../../common/i18n/format';

const PERIOD_OPTIONS = [
  { value: 'today', labelKey: 'receipt.periodToday' },
  { value: 'week', labelKey: 'receipt.periodWeek' },
  { value: 'month', labelKey: 'receipt.periodMonth' },
  { value: 'year', labelKey: 'receipt.periodYear' },
  { value: 'all', labelKey: 'receipt.periodAll' },
];

const getDateRange = (period) => {
  const toDate = new Date();
  toDate.setHours(23, 59, 59, 999);
  const fromDate = new Date();
  fromDate.setHours(0, 0, 0, 0);
  if (period === 'all') fromDate.setFullYear(2000, 0, 1);
  if (period === 'week') fromDate.setDate(fromDate.getDate() - 6);
  if (period === 'month') fromDate.setDate(fromDate.getDate() - 29);
  if (period === 'year') fromDate.setDate(fromDate.getDate() - 364);
  return { fromDate, toDate };
};

const STATUS_OPTIONS = ['Pending', 'InTransit', 'Done', 'Cancelled'];
const PAGE_SIZE = 5;
const periodButtonStyle = { margin: 0, width: 'auto', padding: '8px 24px', fontSize: '14px' };

const ManageTransfer = () => {
  const { t, lang } = useTranslation();

  const [transfers, setTransfers] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [warehouses, setWarehouses] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [fromWarehouseFilter, setFromWarehouseFilter] = useState('');
  const [toWarehouseFilter, setToWarehouseFilter] = useState('');
  const [period, setPeriod] = useState('all');
  const [page, setPage] = useState(1);

  // { type: 'departure' | 'cancel', transfer } | null
  const [pendingAction, setPendingAction] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [arrivalTransfer, setArrivalTransfer] = useState(null);

  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const list = await wareHouseApi.getAllWarehouseNameId();
        setWarehouses(Array.isArray(list) ? list : []);
      } catch (error) {
        console.error('Error fetching warehouses:', error);
      }
    };
    fetchWarehouses();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, fromWarehouseFilter, toWarehouseFilter, period]);

  const fetchTransfers = async () => {
    try {
      setLoading(true);
      const { fromDate, toDate } = getDateRange(period);
      const response = await transferApi.getAllTransfers({
        status: statusFilter || undefined,
        fromWarehouseId: fromWarehouseFilter || undefined,
        toWarehouseId: toWarehouseFilter || undefined,
        fromDate: fromDate.toISOString(),
        toDate: toDate.toISOString(),
        pageNumber: page,
        itemsPerPage: PAGE_SIZE,
      });
      setTransfers(response.results || []);
      setTotalItems(response.totalItems || 0);
    } catch (error) {
      console.error('Error fetching transfers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransfers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, fromWarehouseFilter, toWarehouseFilter, period, page]);

  const closePendingAction = () => {
    if (isProcessing) return;
    setPendingAction(null);
    setCancelReason('');
  };

  const handleConfirmPendingAction = async () => {
    if (!pendingAction) return;
    setIsProcessing(true);
    try {
      if (pendingAction.type === 'departure') {
        await transferApi.confirmDeparture(pendingAction.transfer.transferId);
        toast.success(t('transfer.confirmDepartureSuccess'), { position: 'top-right', autoClose: 3000 });
      } else {
        await transferApi.cancelTransfer(pendingAction.transfer.transferId, cancelReason || undefined);
        toast.success(t('transfer.cancelSuccess'), { position: 'top-right', autoClose: 3000 });
      }
      setPendingAction(null);
      setCancelReason('');
      await fetchTransfers();
    } catch (error) {
      toast.error(getTransferErrorMessage(error, t), { position: 'top-right', autoClose: 3000 });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleArrivalSuccess = () => {
    setArrivalTransfer(null);
    fetchTransfers();
  };

  return (
    <ContentContainer>
      <div style={{ width: '100%' }}>
        <ListSection style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <SelectContainer style={{ maxWidth: '220px' }}>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} placeholder={t('transfer.allStatuses')}>
              <option value="">{t('transfer.allStatuses')}</option>
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>{t(`status.${status.charAt(0).toLowerCase()}${status.slice(1)}`)}</option>
              ))}
            </Select>
          </SelectContainer>
          <SelectContainer style={{ maxWidth: '240px' }}>
            <Select value={fromWarehouseFilter} onChange={(e) => setFromWarehouseFilter(e.target.value)} placeholder={t('transfer.fieldFromWarehouse')}>
              <option value="">{t('transfer.allWarehouses')}</option>
              {warehouses.map((w) => (
                <option key={`from-${w.warehouseId}`} value={w.warehouseId}>{w.warehouseName} ({w.warehouseId})</option>
              ))}
            </Select>
          </SelectContainer>
          <SelectContainer style={{ maxWidth: '240px' }}>
            <Select value={toWarehouseFilter} onChange={(e) => setToWarehouseFilter(e.target.value)} placeholder={t('transfer.fieldToWarehouse')}>
              <option value="">{t('transfer.allWarehouses')}</option>
              {warehouses.map((w) => (
                <option key={`to-${w.warehouseId}`} value={w.warehouseId}>{w.warehouseName} ({w.warehouseId})</option>
              ))}
            </Select>
          </SelectContainer>
        </ListSection>

        <ListSection elevated>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <HeaderItem>{t('transfer.tabManage')}</HeaderItem>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                {PERIOD_OPTIONS.map((opt) => (
                  <ActionButton
                    key={opt.value}
                    active={period === opt.value}
                    variant={period === opt.value ? undefined : 'secondary'}
                    onClick={() => setPeriod(opt.value)}
                    style={periodButtonStyle}
                  >
                    {t(opt.labelKey)}
                  </ActionButton>
                ))}
              </div>
              <Tag variant="accent">{totalItems}</Tag>
            </div>
          </div>

          <div style={{ marginTop: '1rem', overflowX: 'auto' }}>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                <ClipLoader color="var(--color-teal)" size={50} />
              </div>
            ) : transfers.length > 0 ? (
              <Table style={{ minWidth: '900px' }}>
                <thead>
                  <tr>
                    <TableHeader style={{ width: '14%' }}>{t('transfer.colTransferId')}</TableHeader>
                    <TableHeader style={{ width: '12%' }}>{t('transfer.colTransferDate')}</TableHeader>
                    <TableHeader style={{ width: '16%' }}>{t('transfer.colFromWarehouse')}</TableHeader>
                    <TableHeader style={{ width: '16%' }}>{t('transfer.colToWarehouse')}</TableHeader>
                    <TableHeader style={{ width: '12%' }}>{t('transfer.colStatus')}</TableHeader>
                    <TableHeader style={{ width: '30%' }}>{t('transfer.colActions')}</TableHeader>
                  </tr>
                </thead>
                <tbody>
                  {transfers.map((item) => (
                    <tr key={item.transferId}>
                      <TableCell>{item.transferId}</TableCell>
                      <TableCell>{formatDate(item.transferDate, lang)}</TableCell>
                      <TableCell>{item.fromWarehouseId}</TableCell>
                      <TableCell>{item.toWarehouseId}</TableCell>
                      <TableCell><TransferProgress status={item.status} /></TableCell>
                      <TableCell>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {item.status === 'Pending' && (
                            <>
                              <ActionButton
                                onClick={() => setPendingAction({ type: 'departure', transfer: item })}
                                style={{ width: 'auto', margin: 0, padding: '6px 12px', fontSize: '13px' }}
                              >
                                {t('transfer.btnConfirmDeparture')}
                              </ActionButton>
                              <ActionButton
                                variant="secondary"
                                onClick={() => setPendingAction({ type: 'cancel', transfer: item })}
                                style={{ width: 'auto', margin: 0, padding: '6px 12px', fontSize: '13px' }}
                              >
                                {t('transfer.btnCancel')}
                              </ActionButton>
                            </>
                          )}
                          {item.status === 'InTransit' && (
                            <>
                              <ActionButton
                                onClick={() => setArrivalTransfer(item)}
                                style={{ width: 'auto', margin: 0, padding: '6px 12px', fontSize: '13px' }}
                              >
                                {t('transfer.btnConfirmArrival')}
                              </ActionButton>
                              <ActionButton
                                variant="secondary"
                                onClick={() => setPendingAction({ type: 'cancel', transfer: item })}
                                style={{ width: 'auto', margin: 0, padding: '6px 12px', fontSize: '13px' }}
                              >
                                {t('transfer.btnCancel')}
                              </ActionButton>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', color: 'var(--color-text-muted)' }}>
                {t('transfer.noMatchingTransfer')}
              </div>
            )}
          </div>

          {!loading && (
            <Pagination currentPage={page} totalItems={totalItems} pageSize={PAGE_SIZE} onPageChange={setPage} />
          )}
        </ListSection>
      </div>

      {pendingAction && (
        <ConfirmOverlay
          title={pendingAction.type === 'departure' ? t('transfer.confirmDepartureTitle') : t('transfer.cancelTitle')}
          onCancel={closePendingAction}
          onConfirm={handleConfirmPendingAction}
          isProcessing={isProcessing}
        >
          {pendingAction.type === 'departure' ? (
            <p>{t('transfer.confirmDepartureBody', {
              fromWarehouse: pendingAction.transfer.fromWarehouseId,
              transferId: pendingAction.transfer.transferId,
            })}</p>
          ) : (
            <>
              <p>{t('transfer.cancelBody', { transferId: pendingAction.transfer.transferId })}</p>
              <label style={{ display: 'block', marginTop: '12px', fontSize: '13px' }}>
                {t('transfer.cancelReasonLabel')}
                <input
                  style={{ width: '100%', marginTop: '4px' }}
                  type="text"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  disabled={isProcessing}
                />
              </label>
            </>
          )}
        </ConfirmOverlay>
      )}

      {arrivalTransfer && (
        <ConfirmArrivalPanel
          transferId={arrivalTransfer.transferId}
          onClose={() => setArrivalTransfer(null)}
          onSuccess={handleArrivalSuccess}
        />
      )}
    </ContentContainer>
  );
};

export default ManageTransfer;
