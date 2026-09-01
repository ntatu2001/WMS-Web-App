import React, { useState } from 'react';
import SectionTitle from '../../../../common/components/Text/SectionTitle.jsx';
import Table from '../../../../common/components/Table/Table.jsx';
import TableHeader from '../../../../common/components/Table/TableHeader.jsx';
import TableCell from '../../../../common/components/Table/TableCell.jsx';
import FormGroup from '../../../../common/components/FormGroup/FormGroup.jsx';
import SelectContainer from '../../../../common/components/Selection/SelectContainer.jsx';
import SearchInput from '../../../../common/components/Input/SearchInput.jsx';
import ActionButton from '../../../../common/components/Button/ActionButton/ActionButton.jsx';
import DateInput from '../../../../common/components/DateInput/DateInput.jsx';
import Label from '../../../../common/components/Label/Label.jsx';
import FormSection from '../../../../common/components/Section/FormSection.jsx';
import ListSection from '../../../../common/components/Section/ListSection.jsx';
import Tag from '../../../../common/components/Tag/Tag.jsx';
import clsx from 'clsx';
import styles from './InventoryHistory.module.scss';
import InventoryApi from '../../../../api/inventoryApi.js';
import { ClipLoader } from 'react-spinners';
import { WORKFLOW_STATUS, STATUS_COLOR, SPINNER_COLOR, SPINNER_ON_ACCENT } from '../../../../common/constants/statusColors.js';

const statusMapping = WORKFLOW_STATUS;

const StatusTag = ({ status, style }) => (
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
    {statusMapping[status]?.label || "--"}
  </span>
);

const InventoryHistory = () => {
  const [selectedDate1, setSelectedDate1] = useState(null);
  const [selectedDate2, setSelectedDate2] = useState(null);
  const [searchLotNumber, setSearchLotNumber] = useState('');
  const [listInventoryHistory, setListInventoryHistory] = useState([]);
  const [listInventoryStorage, setListInventoryStorage] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  const mapAdjustmentEntriesToStorageRows = (entries) =>
    entries.flatMap((item) => {
      const sublotData = item.stockTakeSubLotDTOs || [];
      if (sublotData.length === 0) {
        return [{
          id: 1,
          materialName: item.materialName || "--",
          materialId: item.materialId || "--",
          unitOfMeasure: item.unitOfMeasure || "--",
          locationId: "--",
          previousQuantity: "--",
          realAdjustmentQuantity: "--",
          quantityDifference: "--",
        }];
      }
      return sublotData.map((subItemDetail, subIndex) => ({
        id: subIndex + 1,
        materialName: item.materialName || "--",
        materialId: item.materialId || "--",
        unitOfMeasure: item.unitOfMeasure || "--",
        locationId: subItemDetail.locationId || "--",
        previousQuantity: subItemDetail.previousQuantity ?? "--",
        realAdjustmentQuantity: subItemDetail.realAdjustmentQuantity ?? "--",
        quantityDifference: subItemDetail.quantityDifference ?? "--",
      }));
    });

  const handleSearch = async () => {
    const lotNumber = searchLotNumber.trim();

    const toHanoiTime = (date) => {
      const utcDate = new Date(date);
      const hanoiOffset = 7 * 60; // Hanoi is UTC+7
      return new Date(utcDate.getTime() + hanoiOffset * 60 * 1000);
    };

    const startTime =
      selectedDate1 instanceof Date && !isNaN(selectedDate1.getTime())
        ? toHanoiTime(selectedDate1).toISOString()
        : ''; // Convert selectedDate1 to Hanoi timezone
    const endTime =
      selectedDate2 instanceof Date && !isNaN(selectedDate2.getTime())
        ? toHanoiTime(selectedDate2).toISOString()
        : (startTime ? toHanoiTime(new Date()).toISOString() : ''); // Convert current date to Hanoi timezone if needed

    if (!lotNumber && !startTime && !endTime) {
      console.warn('Please enter at least one search criterion.');
      return;
    }

    setIsLoading(true);
    setSelectedItem(null);
    setListInventoryStorage([]);
    try {
      const response = await InventoryApi.getAllAdjustment(lotNumber, startTime, endTime);
      if (Array.isArray(response)) {
        // Chỉ lọc thêm theo adjustmentDate khi người dùng thực sự đã chọn "Từ ngày" —
        // startTime rỗng sẽ tạo ra `new Date('')` (Invalid Date), khiến mọi so sánh
        // đều false và làm mất hết kết quả API trả về.
        const filteredData = startTime
          ? response.filter((item) => toHanoiTime(item.adjustmentDate) >= new Date(startTime))
          : response;
        setListInventoryHistory(filteredData);
      } else {
        setListInventoryHistory([]);
      }
    } catch (error) {
      console.error("Error fetching Issue history:", error.message || error);
      setListInventoryHistory([]);
    } finally {
      setIsLoading(false);
    }
  };

  const selectLot = async (item) => {
    setSelectedItem(item);
    setIsDetailLoading(true);
    try {
      const response = await InventoryApi.getAllAdjustment(item.lotNumber);
      setListInventoryStorage(Array.isArray(response) ? mapAdjustmentEntriesToStorageRows(response) : []);
    } catch (error) {
      console.error("Error fetching adjustment details:", error);
      setListInventoryStorage([]);
    } finally {
      setIsDetailLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: "20px", padding: "20px" }}>
      {/* Left Section - Search & lot list */}
      <FormSection style={{ flex: "0 0 380px", width: "380px" }}>
        <SectionTitle>Truy xuất lịch sử kiểm kê</SectionTitle>

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
          {isLoading ? <ClipLoader size={20} color={SPINNER_ON_ACCENT} /> : "Tìm kiếm"}
        </ActionButton>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
          <SectionTitle style={{ fontSize: "16px", marginBottom: 0 }}>Danh sách lô kiểm kê</SectionTitle>
          <Tag variant="neutral">{listInventoryHistory.length} lô</Tag>
        </div>

        <div style={{ maxHeight: "520px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px", paddingRight: "2px" }}>
          {listInventoryHistory.length === 0 ? (
            <div className={styles.emptyState}>Không có lô kiểm kê phù hợp.</div>
          ) : (
            listInventoryHistory.map((item, index) => (
              <div
                key={index}
                className={clsx(styles.divOfList, selectedItem?.lotNumber === item.lotNumber && styles.selected)}
                onClick={() => selectLot(item)}
              >
                <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "4px 8px", fontSize: "13px" }}>
                  <span className={styles.mutedLabel}>Mã lô/ Số PO:</span>
                  <span className={styles.lotCode} style={{ textAlign: "right" }}>{item.lotNumber}</span>

                  <span className={styles.mutedLabel}>Thời gian kiểm kê:</span>
                  <span style={{ textAlign: "right" }}>{item.adjustmentDate}</span>

                  <span className={styles.mutedLabel}>Nhân viên:</span>
                  <span style={{ textAlign: "right" }}>{item.personName}</span>

                  <span className={styles.mutedLabel}>Kho hàng:</span>
                  <span style={{ textAlign: "right" }}>{item.warehouseName}</span>
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
        <SectionTitle>Thông tin kiểm kê chi tiết</SectionTitle>

        {!selectedItem ? (
          <div className={styles.emptyDetail}>
            Chọn một lô ở danh sách bên trái để xem chi tiết
          </div>
        ) : (
          <>
            <SectionTitle style={{ fontSize: "16px", marginBottom: "12px" }}>Thông tin lô kiểm kê</SectionTitle>
            <div className={styles.infoPanel}>
              <div className={styles.infoRow}><span className={styles.mutedLabel}>Kho hàng:</span><span>{selectedItem.warehouseName || "--"}</span></div>
              <div className={styles.infoRow}><span className={styles.mutedLabel}>Mã lô/ Số PO:</span><span style={{ fontWeight: 700 }}>{selectedItem.lotNumber || "--"}</span></div>
              <div className={styles.infoRow}><span className={styles.mutedLabel}>Khu vực:</span><span>{selectedItem.warehouseID || "--"}</span></div>
              <div className={styles.infoRow}><span className={styles.mutedLabel}>Nhân viên kiểm kê:</span><span>{selectedItem.personName || "--"}</span></div>
              <div className={styles.infoRow}><span className={styles.mutedLabel}>Ngày thực hiện:</span><span>{selectedItem.adjustmentDate || "--"}</span></div>
              <div className={styles.infoRow}>
                <span className={styles.mutedLabel}>Trạng thái:</span>
                <StatusTag status={selectedItem.lotStatus} />
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "20px 0 12px" }}>
              <SectionTitle style={{ fontSize: "16px", marginBottom: 0 }}>Bảng kiểm kê</SectionTitle>
              <Tag variant="accent">{listInventoryStorage.length} vị trí</Tag>
            </div>

            <div style={{ overflowX: "auto" }}>
              {isDetailLoading ? (
                <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
                  <ClipLoader size={40} color={SPINNER_COLOR} />
                </div>
              ) : (
                <Table style={{ minWidth: "860px" }}>
                  <thead>
                    <tr>
                      <TableHeader style={{ width: "6%" }}>STT</TableHeader>
                      <TableHeader>Vị trí lưu trữ</TableHeader>
                      <TableHeader>Tên sản phẩm</TableHeader>
                      <TableHeader>Mã sản phẩm</TableHeader>
                      <TableHeader style={{ width: "8%" }}>ĐVT</TableHeader>
                      <TableHeader>Tồn kho</TableHeader>
                      <TableHeader>Thực tế</TableHeader>
                      <TableHeader>SL lệch</TableHeader>
                    </tr>
                  </thead>
                  <tbody>
                    {listInventoryStorage.map((item, index) => (
                      <tr key={item.id || index}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{item.locationId || "--"}</TableCell>
                        <TableCell>{item.materialName || "--"}</TableCell>
                        <TableCell>{item.materialId || "--"}</TableCell>
                        <TableCell>{item.unitOfMeasure || "--"}</TableCell>
                        <TableCell>{item.previousQuantity !== null && item.previousQuantity !== undefined ? item.previousQuantity : "--"}</TableCell>
                        <TableCell>{item.realAdjustmentQuantity !== null && item.realAdjustmentQuantity !== undefined ? item.realAdjustmentQuantity : "--"}</TableCell>
                        <TableCell>{item.quantityDifference !== null && item.quantityDifference !== undefined ? item.quantityDifference : "--"}</TableCell>
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

export default InventoryHistory;
