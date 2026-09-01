import React, { useState, useEffect } from 'react';
import SectionTitle from '../../../../common/components/Text/SectionTitle.jsx';
import Table from '../../../../common/components/Table/Table.jsx';
import TableHeader from '../../../../common/components/Table/TableHeader.jsx';
import TableCell from '../../../../common/components/Table/TableCell.jsx';
import FormGroup from '../../../../common/components/FormGroup/FormGroup.jsx';
import SelectContainer from '../../../../common/components/Selection/SelectContainer.jsx';
import Select from '../../../../common/components/Selection/Select.jsx';
import SearchInput from '../../../../common/components/Input/SearchInput.jsx';
import ActionButton from '../../../../common/components/Button/ActionButton/ActionButton.jsx';
import DateInput from '../../../../common/components/DateInput/DateInput.jsx';
import Label from '../../../../common/components/Label/Label.jsx';
import FormSection from '../../../../common/components/Section/FormSection.jsx';
import ListSection from '../../../../common/components/Section/ListSection.jsx';
import Tag from '../../../../common/components/Tag/Tag.jsx';
import clsx from 'clsx';
import styles from './IssueHistory.module.scss';
import IssueApi from '../../../../api/IssueApi.js';
import customerApi from '../../../../api/customerApi.js';
import { ClipLoader } from 'react-spinners';
import { WORKFLOW_STATUS, STATUS_COLOR, SPINNER_COLOR, SPINNER_ON_ACCENT } from '../../../../common/constants/statusColors.js';
import useTranslation from '../../../../common/hooks/useTranslation';

const statusMapping = WORKFLOW_STATUS;

const StatusTag = ({ status, style, t }) => (
  <span
    style={{
      borderRadius: '999px',
      backgroundColor: statusMapping[status]?.color || STATUS_COLOR.neutral,
      padding: '3px 10px',
      color: 'white',
      fontWeight: 700,
      fontSize: '12px',
      whiteSpace: 'nowrap',
      ...style,
    }}
  >
    {statusMapping[status]?.labelKey ? t(statusMapping[status].labelKey) : "--"}
  </span>
);

const IssueHistory = () => {
  const { t } = useTranslation();
  const [selectedDate1, setSelectedDate1] = useState(null);
  const [selectedDate2, setSelectedDate2] = useState(null);
  const [searchLotNumber, setSearchLotNumber] = useState('');
  const [searchCustomerName, setSearchCustomerName] = useState('');
  const [customers, setCustomers] = useState([]);
  const [listIssueHistory, setListIssueHistory] = useState([]);
  const [listIssueStorage, setListIssueStorage] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const customerList = await customerApi.getAllCustomerNameId();
        setCustomers(customerList);
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };

    fetchCustomers();
  }, []);

  const mapIssueEntriesToStorageRows = (entries) =>
    entries.flatMap((item, index) =>
      Array.isArray(item.issueSubLotDTOs)
        ? item.issueSubLotDTOs.map((sub, subIdx) => ({
            id: `${index + 1}.${subIdx + 1}`,
            materialName: item.materialName,
            materialId: item.materialId,
            unitOfMeasure: item.unitOfMeasure,
            warehouseID: item.warehouseID,
            requestedQuantity: sub.requestedQuantity,
            locationId: sub.materialSublot?.locationId,
            lotNumber: item.lotNumber,
          }))
        : []
    );

  const handleSearch = async () => {
    const lotNumber = searchLotNumber.trim();
    const customerName = searchCustomerName.trim();

    const toHanoiTime = (date) => {
      const utcDate = new Date(date);
      const hanoiOffset = 7 * 60; // Hanoi is UTC+7
      return new Date(utcDate.getTime() + hanoiOffset * 60 * 1000);
    };

    const startTime =
      selectedDate1 instanceof Date && !isNaN(selectedDate1)
        ? toHanoiTime(selectedDate1).toISOString()
        : ''; // Convert selectedDate1 to Hanoi timezone
    const endTime =
      selectedDate2 instanceof Date && !isNaN(selectedDate2)
        ? toHanoiTime(selectedDate2).toISOString()
        : (startTime ? toHanoiTime(new Date()).toISOString() : ''); // Convert current date to Hanoi timezone if needed

    if (!lotNumber && !customerName && !startTime && !endTime) {
      console.warn('Please enter at least one search criterion.');
      return;
    }

    setIsLoading(true);
    setSelectedItem(null);
    setListIssueStorage([]);
    try {
      const response = await IssueApi.getAllIssue(lotNumber, customerName, startTime, endTime);
      setListIssueHistory(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error("Error fetching Issue history:", error.message || error);
      setListIssueHistory([]);
    } finally {
      setIsLoading(false);
    }
  };

  const selectLot = async (item) => {
    setSelectedItem(item);
    setIsDetailLoading(true);
    try {
      const response = await IssueApi.getAllIssue(item.lotNumber);
      setListIssueStorage(Array.isArray(response) ? mapIssueEntriesToStorageRows(response) : []);
    } catch (error) {
      console.error("Error fetching lot detail:", error);
      setListIssueStorage([]);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const totalQuantity = listIssueStorage.reduce((sum, item) => sum + (Number(item.requestedQuantity) || 0), 0);

  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: "20px", padding: "20px" }}>
      {/* Left Section - Search & lot list */}
      <FormSection style={{ flex: "0 0 380px", width: "380px" }}>
        <SectionTitle>{t('history.retrieveIssue')}</SectionTitle>

        <FormGroup>
          <Label>{t('history.lotOrPo')}</Label>
          <SelectContainer>
            <SearchInput
              placeholder={t('history.searchLotOrPo')}
              value={searchLotNumber}
              onChange={(e) => setSearchLotNumber(e.target.value)}
              style={{ width: "100%", margin: 0, boxSizing: "border-box" }}
            />
          </SelectContainer>
        </FormGroup>

        <FormGroup>
          <Label>{t('history.customer')}</Label>
          <SelectContainer>
            <Select
              value={searchCustomerName}
              onChange={(e) => setSearchCustomerName(e.target.value)}
              placeholder={t('history.allCustomers')}
            >
              <option value="">{t('history.allCustomers')}</option>
              {customers.map((customer, index) => (
                <option key={`customer-${index}`} value={customer.customerName}>
                  {customer.customerName}
                </option>
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
          style={{ width: "100%", margin: "8px 0 20px", padding: "14px", fontSize: "14px" }}
          onClick={handleSearch}
          disabled={isLoading}
        >
          {isLoading ? <ClipLoader size={20} color={SPINNER_ON_ACCENT} /> : t('common.search')}
        </ActionButton>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
          <SectionTitle style={{ fontSize: "16px", marginBottom: 0 }}>{t('history.issueLotList')}</SectionTitle>
          <Tag variant="neutral">{listIssueHistory.length} {t('history.lotUnit')}</Tag>
        </div>

        <div style={{ maxHeight: "520px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px", paddingRight: "2px" }}>
          {listIssueHistory.length === 0 ? (
            <div className={styles.emptyState}>{t('history.noIssueLot')}</div>
          ) : (
            listIssueHistory.map((item, index) => (
              <div
                key={index}
                className={clsx(styles.divOfList, selectedItem?.lotNumber === item.lotNumber && styles.selected)}
                onClick={() => selectLot(item)}
              >
                <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "4px 8px", fontSize: "13px" }}>
                  <span className={styles.mutedLabel}>{t('history.lotOrPo')}</span>
                  <span className={styles.lotCode} style={{ textAlign: "right" }}>{item.lotNumber}</span>

                  <span className={styles.mutedLabel}>{t('history.issueTime')}</span>
                  <span style={{ textAlign: "right" }}>{item.issueDate}</span>

                  <span className={styles.mutedLabel}>{t('history.employee')}</span>
                  <span style={{ textAlign: "right" }}>{item.personName}</span>

                  <span className={styles.mutedLabel}>{t('history.customer')}</span>
                  <span style={{ textAlign: "right" }}>{item.customerName}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "10px" }}>
                  <span className={styles.mutedLabel} style={{ fontSize: "13px" }}>{t('history.statusLabel')}</span>
                  <StatusTag status={item.lotStatus} t={t} />
                </div>
              </div>
            ))
          )}
        </div>
      </FormSection>

      {/* Right Section - Selected lot detail */}
      <ListSection elevated style={{ flex: 1, minWidth: 0 }}>
        <SectionTitle>{t('history.issueDetailTitle')}</SectionTitle>

        {!selectedItem ? (
          <div className={styles.emptyDetail}>
            {t('history.selectLotHint')}
          </div>
        ) : (
          <>
            <SectionTitle style={{ fontSize: "16px", marginBottom: "12px" }}>{t('history.issueLotInfo')}</SectionTitle>
            <div className={styles.infoPanel}>
              <div className={styles.infoRow}><span className={styles.mutedLabel}>{t('history.warehouse')}</span><span>{selectedItem.warehouseName || "--"}</span></div>
              <div className={styles.infoRow}><span className={styles.mutedLabel}>{t('history.lotOrPo')}</span><span style={{ fontWeight: 700 }}>{selectedItem.lotNumber || "--"}</span></div>
              <div className={styles.infoRow}><span className={styles.mutedLabel}>{t('history.zone')}</span><span>{selectedItem.warehouseID || "--"}</span></div>
              <div className={styles.infoRow}><span className={styles.mutedLabel}>{t('history.customer')}</span><span>{selectedItem.customerName || "--"}</span></div>
              <div className={styles.infoRow}><span className={styles.mutedLabel}>{t('history.issueEmployee')}</span><span>{selectedItem.personName || "--"}</span></div>
              <div className={styles.infoRow}><span className={styles.mutedLabel}>{t('history.issueDate')}</span><span>{selectedItem.issueDate || "--"}</span></div>
              <div className={styles.infoRow}><span className={styles.mutedLabel}>{t('history.totalProducts')}</span><span style={{ fontWeight: 700 }}>{totalQuantity}</span></div>
              <div className={styles.infoRow}>
                <span className={styles.mutedLabel}>{t('history.statusLabel')}</span>
                <StatusTag status={selectedItem.lotStatus} t={t} />
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "20px 0 12px" }}>
              <SectionTitle style={{ fontSize: "16px", marginBottom: 0 }}>{t('history.locationTable')}</SectionTitle>
              <Tag variant="accent">{t('history.totalIssued', { count: totalQuantity })}</Tag>
            </div>

            <div style={{ overflowX: "auto" }}>
              {isDetailLoading ? (
                <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
                  <ClipLoader size={40} color={SPINNER_COLOR} />
                </div>
              ) : (
                <Table style={{ minWidth: "760px" }}>
                  <thead>
                    <tr>
                      <TableHeader style={{ width: "6%" }}>{t('history.colNo')}</TableHeader>
                      <TableHeader>{t('history.colProductName')}</TableHeader>
                      <TableHeader>{t('history.colProductId')}</TableHeader>
                      <TableHeader style={{ width: "8%" }}>{t('history.colUom')}</TableHeader>
                      <TableHeader>{t('history.colLocation')}</TableHeader>
                      <TableHeader>{t('history.colIssuedQty')}</TableHeader>
                    </tr>
                  </thead>
                  <tbody>
                    {listIssueStorage.map((item, index) => (
                      <tr key={item.id || index}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{item.materialName || "--"}</TableCell>
                        <TableCell>{item.materialId || "--"}</TableCell>
                        <TableCell>{item.unitOfMeasure || "--"}</TableCell>
                        <TableCell>{item.locationId || "--"}</TableCell>
                        <TableCell>{item.requestedQuantity || "--"}</TableCell>
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

export default IssueHistory;
