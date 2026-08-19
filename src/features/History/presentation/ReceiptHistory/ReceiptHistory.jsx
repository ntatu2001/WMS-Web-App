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
import styles from './ReceiptHistory.module.scss';
import ReceiptApi from '../../../../api/ReceiptApi.js';
import supplierApi from '../../../../api/supplierApi.js';
import { ClipLoader } from 'react-spinners';

const statusMapping = {
  Pending: { label: "Chờ xử lý", color: "#767676" },
  InProgress: { label: "Đang thực hiện", color: "#1D84C9" },
  Done: { label: "Hoàn thành", color: "#149117" },
  Cancelled: { label: "Đã hủy", color: "#F03B28" },
  HoldOn: { label: "Tạm hoãn", color: "#DC7010" },
  IsBlocked: { label: "Bị chặn", color: "#911C0F" },
};

const StatusTag = ({ status, style }) => (
  <span
    style={{
      borderRadius: '999px',
      backgroundColor: statusMapping[status]?.color || "#767676",
      padding: '3px 10px',
      color: 'white',
      fontWeight: 700,
      fontSize: '12px',
      whiteSpace: 'nowrap',
      ...style,
    }}
  >
    {statusMapping[status]?.label || "--"}
  </span>
);

const ReceiptHistory = () => {
  const [selectedDate1, setSelectedDate1] = useState(null);
  const [selectedDate2, setSelectedDate2] = useState(null);
  const [searchLotNumber, setSearchLotNumber] = useState('');
  const [searchSupplierName, setSearchSupplierName] = useState('');
  const [suppliers, setSuppliers] = useState([]);
  const [listReceiptHistory, setListReceiptHistory] = useState([]);
  const [listReceiptStorage, setListReceiptStorage] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const supplierList = await supplierApi.getAllSupplierNameId();
        setSuppliers(supplierList);
      } catch (error) {
        console.error("Error fetching suppliers:", error);
      }
    };

    fetchSuppliers();
  }, []);

  const mapReceiptEntriesToStorageRows = (entries) =>
    entries.flatMap((item, index) =>
      Array.isArray(item.receiptSubLots)
        ? item.receiptSubLots.map((sub, subIdx) => ({
            id: `${index + 1}.${subIdx + 1}`,
            materialName: item.materialName,
            materialId: item.materialId,
            unitOfMeasure: item.unitOfMeasure,
            warehouseID: item.warehouseID,
            importedQuantity: sub.importedQuantity,
            locationId: sub.locationId,
            lotNumber: item.lotNumber,
          }))
        : []
    );

  const handleSearch = async () => {
    const lotNumber = searchLotNumber.trim();
    const supplierName = searchSupplierName.trim();

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

    if (!lotNumber && !supplierName && !startTime && !endTime) {
      console.warn('Please enter at least one search criterion.');
      return;
    }

    setIsLoading(true);
    setSelectedItem(null);
    setListReceiptStorage([]);
    try {
      const response = await ReceiptApi.getAllReceipt(lotNumber, supplierName, startTime, endTime);
      setListReceiptHistory(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error("Error fetching receipt history:", error.message || error);
      setListReceiptHistory([]);
    } finally {
      setIsLoading(false);
    }
  };

  const selectLot = async (item) => {
    setSelectedItem(item);
    setIsDetailLoading(true);
    try {
      const response = await ReceiptApi.getAllReceipt(item.lotNumber);
      setListReceiptStorage(Array.isArray(response) ? mapReceiptEntriesToStorageRows(response) : []);
    } catch (error) {
      console.error("Error fetching lot detail:", error);
      setListReceiptStorage([]);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const totalQuantity = listReceiptStorage.reduce((sum, item) => sum + (Number(item.importedQuantity) || 0), 0);

  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: "20px", padding: "20px" }}>
      {/* Left Section - Search & lot list */}
      <FormSection style={{ flex: "0 0 380px", width: "380px" }}>
        <SectionTitle>Truy xuất lịch sử nhập kho</SectionTitle>

        <FormGroup>
          <Label>Mã lô/ Số PO:</Label>
          <SelectContainer>
            <SearchInput
              placeholder="Tìm kiếm theo Mã lô/ số PO"
              value={searchLotNumber}
              onChange={(e) => setSearchLotNumber(e.target.value)}
              style={{ width: "100%", margin: 0, boxSizing: "border-box" }}
            />
          </SelectContainer>
        </FormGroup>

        <FormGroup>
          <Label>Nhà cung cấp:</Label>
          <SelectContainer>
            <Select
              value={searchSupplierName}
              onChange={(e) => setSearchSupplierName(e.target.value)}
              placeholder="Tất cả nhà cung cấp"
            >
              <option value="">Tất cả nhà cung cấp</option>
              {suppliers.map((supplier, index) => (
                <option key={`supplier-${index}`} value={supplier.supplierName}>
                  {supplier.supplierName}
                </option>
              ))}
            </Select>
          </SelectContainer>
        </FormGroup>

        <FormGroup>
          <Label>Từ ngày:</Label>
          <SelectContainer>
            <DateInput selectedDate={selectedDate1} onChange={(date) => setSelectedDate1(date || null)} />
          </SelectContainer>
        </FormGroup>

        <FormGroup>
          <Label>Đến ngày:</Label>
          <SelectContainer>
            <DateInput selectedDate={selectedDate2} onChange={(date) => setSelectedDate2(date || null)} />
          </SelectContainer>
        </FormGroup>

        <ActionButton
          style={{ width: "100%", margin: "8px 0 20px", padding: "14px", fontSize: "14px" }}
          onClick={handleSearch}
          disabled={isLoading}
        >
          {isLoading ? <ClipLoader size={20} color="#fff" /> : "Tìm kiếm"}
        </ActionButton>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
          <SectionTitle style={{ fontSize: "16px", marginBottom: 0 }}>Danh sách lô nhập kho</SectionTitle>
          <Tag variant="neutral">{listReceiptHistory.length} lô</Tag>
        </div>

        <div style={{ maxHeight: "520px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px", paddingRight: "2px" }}>
          {listReceiptHistory.length === 0 ? (
            <div className={styles.emptyState}>Không có lô nhập kho phù hợp.</div>
          ) : (
            listReceiptHistory.map((item, index) => (
              <div
                key={index}
                className={clsx(styles.divOfList, selectedItem?.lotNumber === item.lotNumber && styles.selected)}
                onClick={() => selectLot(item)}
              >
                <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "4px 8px", fontSize: "13px" }}>
                  <span className={styles.mutedLabel}>Mã lô/ Số PO:</span>
                  <span className={styles.lotCode} style={{ textAlign: "right" }}>{item.lotNumber}</span>

                  <span className={styles.mutedLabel}>Thời gian nhập kho:</span>
                  <span style={{ textAlign: "right" }}>{item.receiptDate}</span>

                  <span className={styles.mutedLabel}>Nhân viên:</span>
                  <span style={{ textAlign: "right" }}>{item.personName}</span>

                  <span className={styles.mutedLabel}>Nhà cung cấp:</span>
                  <span style={{ textAlign: "right" }}>{item.supplierName}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "10px" }}>
                  <span className={styles.mutedLabel} style={{ fontSize: "13px" }}>Trạng thái:</span>
                  <StatusTag status={item.lotStatus} />
                </div>
              </div>
            ))
          )}
        </div>
      </FormSection>

      {/* Right Section - Selected lot detail */}
      <ListSection elevated style={{ flex: 1, minWidth: 0 }}>
        <SectionTitle>Thông tin nhập kho chi tiết</SectionTitle>

        {!selectedItem ? (
          <div className={styles.emptyDetail}>
            Chọn một lô ở danh sách bên trái để xem chi tiết
          </div>
        ) : (
          <>
            <SectionTitle style={{ fontSize: "16px", marginBottom: "12px" }}>Thông tin lô nhập kho</SectionTitle>
            <div className={styles.infoPanel}>
              <div className={styles.infoRow}><span className={styles.mutedLabel}>Kho hàng:</span><span>{selectedItem.warehouseName || "--"}</span></div>
              <div className={styles.infoRow}><span className={styles.mutedLabel}>Mã lô/ Số PO:</span><span style={{ fontWeight: 700 }}>{selectedItem.lotNumber || "--"}</span></div>
              <div className={styles.infoRow}><span className={styles.mutedLabel}>Khu vực:</span><span>{selectedItem.warehouseID || "--"}</span></div>
              <div className={styles.infoRow}><span className={styles.mutedLabel}>Nhà cung cấp:</span><span>{selectedItem.supplierName || "--"}</span></div>
              <div className={styles.infoRow}><span className={styles.mutedLabel}>Nhân viên nhập kho:</span><span>{selectedItem.personName || "--"}</span></div>
              <div className={styles.infoRow}><span className={styles.mutedLabel}>Ngày nhập kho:</span><span>{selectedItem.receiptDate || "--"}</span></div>
              <div className={styles.infoRow}><span className={styles.mutedLabel}>Tổng sản phẩm:</span><span style={{ fontWeight: 700 }}>{totalQuantity}</span></div>
              <div className={styles.infoRow}>
                <span className={styles.mutedLabel}>Trạng thái:</span>
                <StatusTag status={selectedItem.lotStatus} />
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "20px 0 12px" }}>
              <SectionTitle style={{ fontSize: "16px", marginBottom: 0 }}>Bảng phân bố vị trí lưu trữ</SectionTitle>
              <Tag variant="accent">Tổng SL nhập: {totalQuantity}</Tag>
            </div>

            <div style={{ overflowX: "auto" }}>
              {isDetailLoading ? (
                <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
                  <ClipLoader size={40} color="#0089D7" />
                </div>
              ) : (
                <Table style={{ minWidth: "760px" }}>
                  <thead>
                    <tr>
                      <TableHeader style={{ width: "6%" }}>STT</TableHeader>
                      <TableHeader>Tên sản phẩm</TableHeader>
                      <TableHeader>Mã sản phẩm</TableHeader>
                      <TableHeader style={{ width: "8%" }}>ĐVT</TableHeader>
                      <TableHeader>Vị trí lưu trữ</TableHeader>
                      <TableHeader>Số lượng nhập</TableHeader>
                    </tr>
                  </thead>
                  <tbody>
                    {listReceiptStorage.map((item, index) => (
                      <tr key={item.id || index}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{item.materialName || "--"}</TableCell>
                        <TableCell>{item.materialId || "--"}</TableCell>
                        <TableCell>{item.unitOfMeasure || "--"}</TableCell>
                        <TableCell>{item.locationId || "--"}</TableCell>
                        <TableCell>{item.importedQuantity || "--"}</TableCell>
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

export default ReceiptHistory;
