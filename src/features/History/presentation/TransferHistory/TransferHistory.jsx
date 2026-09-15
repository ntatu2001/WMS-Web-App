import React, { useState, useEffect } from 'react';
import SectionTitle from '../../../../common/components/Text/SectionTitle.jsx';
import Table from '../../../../common/components/Table/Table.jsx';
import TableHeader from '../../../../common/components/Table/TableHeader.jsx';
import TableCell from '../../../../common/components/Table/TableCell.jsx';
import FormGroup from '../../../../common/components/FormGroup/FormGroup.jsx';
import SelectContainer from '../../../../common/components/Selection/SelectContainer.jsx';
import Select from '../../../../common/components/Selection/Select.jsx';
import ActionButton from '../../../../common/components/Button/ActionButton/ActionButton.jsx';
import DateInput from '../../../../common/components/DateInput/DateInput.jsx';
import Label from '../../../../common/components/Label/Label.jsx';
import FormSection from '../../../../common/components/Section/FormSection.jsx';
import ListSection from '../../../../common/components/Section/ListSection.jsx';
import Tag from '../../../../common/components/Tag/Tag.jsx';
import clsx from 'clsx';
import styles from './TransferHistory.module.scss';
import transferApi from '../../../../api/transferApi.js';
import wareHouseApi from '../../../../api/wareHouseApi.js';
import { ClipLoader } from 'react-spinners';
import { SPINNER_COLOR, SPINNER_ON_ACCENT } from '../../../../common/constants/statusColors.js';
import useTranslation from '../../../../common/hooks/useTranslation';
import { formatDate } from '../../../../common/i18n/format';
import TransferProgress from '../../../WarehouseTransfer/presentation/TransferProgress/TransferProgress.jsx';

const TransferHistory = () => {
  const { t, lang } = useTranslation();
  const [warehouses, setWarehouses] = useState([]);
  const [selectedDate1, setSelectedDate1] = useState(null);
  const [selectedDate2, setSelectedDate2] = useState(null);
  const [warehouseFilter, setWarehouseFilter] = useState('');
  const [listTransfers, setListTransfers] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

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

  const handleSearch = async () => {
    setIsLoading(true);
    setSelectedItem(null);
    setSelectedDetail(null);
    try {
      const response = await transferApi.getAllTransfers({
        fromWarehouseId: warehouseFilter || undefined,
        fromDate: selectedDate1 instanceof Date && !isNaN(selectedDate1) ? selectedDate1.toISOString() : undefined,
        toDate: selectedDate2 instanceof Date && !isNaN(selectedDate2) ? selectedDate2.toISOString() : undefined,
      });
      setListTransfers(response?.results || []);
    } catch (error) {
      console.error('Error fetching transfer history:', error);
      setListTransfers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const selectTransfer = async (item) => {
    setSelectedItem(item);
    setIsDetailLoading(true);
    try {
      const detail = await transferApi.getTransferById(item.transferId);
      setSelectedDetail(detail);
    } catch (error) {
      console.error('Error fetching transfer detail:', error);
      setSelectedDetail(null);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const detailRows = (selectedDetail?.entries || []).flatMap((entry) =>
    (entry.subLots || []).map((subLot, index) => ({
      id: `${entry.transferEntryId || entry.materialId}-${index}`,
      materialName: entry.materialName,
      materialId: entry.materialId,
      lotNumber: subLot.lotNumber,
      quantity: subLot.quantity,
      fromLocationId: subLot.fromLocationId,
      toLocationId: subLot.toLocationId,
    }))
  );

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', padding: '20px' }}>
      <FormSection style={{ flex: '0 0 380px', width: '380px' }}>
        <SectionTitle>{t('history.tabTransfer')}</SectionTitle>

        <FormGroup>
          <Label>{t('transfer.fieldFromWarehouse')}</Label>
          <SelectContainer>
            <Select value={warehouseFilter} onChange={(e) => setWarehouseFilter(e.target.value)} placeholder={t('transfer.allWarehouses')}>
              <option value="">{t('transfer.allWarehouses')}</option>
              {warehouses.map((w, index) => (
                <option key={`warehouse-${index}`} value={w.warehouseId}>{w.warehouseName} ({w.warehouseId})</option>
              ))}
            </Select>
          </SelectContainer>
        </FormGroup>

        <FormGroup>
          <Label>{t('history.fromDate')}</Label>
          <SelectContainer>
            <DateInput selectedDate={selectedDate1} onChange={(date) => setSelectedDate1(date || null)} />
          </SelectContainer>
        </FormGroup>

        <FormGroup>
          <Label>{t('history.toDate')}</Label>
          <SelectContainer>
            <DateInput selectedDate={selectedDate2} onChange={(date) => setSelectedDate2(date || null)} />
          </SelectContainer>
        </FormGroup>

        <ActionButton
          style={{ width: '100%', margin: '8px 0 20px', padding: '14px', fontSize: '14px' }}
          onClick={handleSearch}
          disabled={isLoading}
        >
          {isLoading ? <ClipLoader size={20} color={SPINNER_ON_ACCENT} /> : t('common.search')}
        </ActionButton>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <SectionTitle style={{ fontSize: '16px', marginBottom: 0 }}>{t('transfer.tabManage')}</SectionTitle>
          <Tag variant="neutral">{listTransfers.length}</Tag>
        </div>

        <div style={{ maxHeight: '520px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '2px' }}>
          {listTransfers.length === 0 ? (
            <div className={styles.emptyState}>{t('transfer.noMatchingTransfer')}</div>
          ) : (
            listTransfers.map((item, index) => (
              <div
                key={item.transferId || index}
                className={clsx(styles.divOfList, selectedItem?.transferId === item.transferId && styles.selected)}
                onClick={() => selectTransfer(item)}
              >
                <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '4px 8px', fontSize: '13px' }}>
                  <span className={styles.mutedLabel}>{t('transfer.colTransferId')}</span>
                  <span className={styles.lotCode} style={{ textAlign: 'right' }}>{item.transferId}</span>

                  <span className={styles.mutedLabel}>{t('transfer.colTransferDate')}</span>
                  <span style={{ textAlign: 'right' }}>{formatDate(item.transferDate, lang)}</span>

                  <span className={styles.mutedLabel}>{t('transfer.colFromWarehouse')}</span>
                  <span style={{ textAlign: 'right' }}>{item.fromWarehouseId}</span>

                  <span className={styles.mutedLabel}>{t('transfer.colToWarehouse')}</span>
                  <span style={{ textAlign: 'right' }}>{item.toWarehouseId}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
                  <span className={styles.mutedLabel} style={{ fontSize: '13px' }}>{t('transfer.colStatus')}</span>
                  <TransferProgress status={item.status} />
                </div>
              </div>
            ))
          )}
        </div>
      </FormSection>

      <ListSection elevated style={{ flex: 1, minWidth: 0 }}>
        <SectionTitle>{t('transfer.createTitle')}</SectionTitle>

        {!selectedItem ? (
          <div className={styles.emptyDetail}>{t('history.selectLotHint')}</div>
        ) : (
          <>
            <div className={styles.infoPanel}>
              <div className={styles.infoRow}><span className={styles.mutedLabel}>{t('transfer.colTransferId')}</span><span style={{ fontWeight: 700 }}>{selectedItem.transferId}</span></div>
              <div className={styles.infoRow}><span className={styles.mutedLabel}>{t('transfer.colFromWarehouse')}</span><span>{selectedItem.fromWarehouseId}</span></div>
              <div className={styles.infoRow}><span className={styles.mutedLabel}>{t('transfer.colToWarehouse')}</span><span>{selectedItem.toWarehouseId}</span></div>
              <div className={styles.infoRow}><span className={styles.mutedLabel}>{t('transfer.colTransferDate')}</span><span>{formatDate(selectedItem.transferDate, lang)}</span></div>
              <div className={styles.infoRow}>
                <span className={styles.mutedLabel}>{t('transfer.colStatus')}</span>
                <TransferProgress status={selectedItem.status} />
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              {isDetailLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
                  <ClipLoader size={40} color={SPINNER_COLOR} />
                </div>
              ) : (
                <Table style={{ minWidth: '760px' }}>
                  <thead>
                    <tr>
                      <TableHeader style={{ width: '6%' }}>{t('transfer.colNo')}</TableHeader>
                      <TableHeader>{t('transfer.colProductName')}</TableHeader>
                      <TableHeader>{t('transfer.colLotNumber')}</TableHeader>
                      <TableHeader>{t('transfer.colFromLocation')}</TableHeader>
                      <TableHeader>{t('transfer.colToLocation')}</TableHeader>
                      <TableHeader>{t('transfer.colQuantity')}</TableHeader>
                    </tr>
                  </thead>
                  <tbody>
                    {detailRows.map((row, index) => (
                      <tr key={row.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{row.materialName || row.materialId || '--'}</TableCell>
                        <TableCell>{row.lotNumber || '--'}</TableCell>
                        <TableCell>{row.fromLocationId || '--'}</TableCell>
                        <TableCell>{row.toLocationId || '--'}</TableCell>
                        <TableCell>{row.quantity ?? '--'}</TableCell>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </div>
          </>
        )}
      </ListSection>
    </div>
  );
};

export default TransferHistory;
