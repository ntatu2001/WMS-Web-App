import React, { useState } from 'react';
import { FaEye } from 'react-icons/fa';
import SectionTitle from '../../../../common/components/Text/SectionTitle.jsx';
import Table from '../../../../common/components/Table/Table.jsx';
import TableHeader from '../../../../common/components/Table/TableHeader.jsx';
import TableCell from '../../../../common/components/Table/TableCell.jsx';
import FormGroup from '../../../../common/components/FormGroup/FormGroup.jsx';
import SelectContainer from '../../../../common/components/Selection/SelectContainer.jsx';
import ActionButton from '../../../../common/components/Button/ActionButton/ActionButton.jsx';
import DateInput from '../../../../common/components/DateInput/DateInput.jsx';
import Label from '../../../../common/components/Label/Label.jsx';
import FormSection from '../../../../common/components/Section/FormSection.jsx';
import ListSection from '../../../../common/components/Section/ListSection.jsx';
import DeleteButton from '../../../../common/components/Button/DeleteButton/DeleteButton.jsx';
import clsx from 'clsx';
import styles from './InventoryHistory.module.scss';
import InventoryApi from '../../../../api/inventoryApi.js';
import { ClipLoader } from 'react-spinners';

const statusMapping = {
  Pending: { label: "Chờ xử lý", color: "#767676" },
  InProgress: { label: "Đang thực hiện", color: "#1D84C9" },
  Done: { label: "Hoàn thành", color: "#149117" },
  Cancelled: { label: "Đã hủy", color: "#F03B28" },
  Suspended: { label: "Tạm hoãn", color: "#DC7010" },
  Blocked: { label: "Bị chặn", color: "#911C0F" },
};

const InventoryHistory = () => {
  const [selectedDate1, setSelectedDate1] = useState(null);
  const [selectedDate2, setSelectedDate2] = useState(null);
  const [searchLotNumber, setSearchLotNumber] = useState('');
  const [searchSupplierId, setSearchSupplierId] = useState('');
  const [listInventoryHistory, setListInventoryHistory] = useState([]);
  const [listIssueStorage, setListIssueStorage] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Add loading state

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

    // Log startTime and endTime for debugging
    console.log("Start Time (Hanoi):", startTime);
    console.log("End Time (Hanoi):", endTime);

    if (!lotNumber && !startTime && !endTime) {
      console.warn('Please enter at least one search criterion.');
      return;
    }

    console.log("Searching with criteria:", { lotNumber, startTime, endTime });

    setIsLoading(true); // Start loading
    try {
      const response = await InventoryApi.getAllAdjustment(lotNumber, startTime, endTime);
      console.log("API response:", response); // Debug log to inspect the response structure

      if (response && Array.isArray(response)) {
        // Filter data based on adjustmentDate comparison with startTime
        const filteredData = response.filter((item) => {
          const adjustmentDate = toHanoiTime(item.adjustmentDate); // Convert adjustmentDate to Hanoi timezone
          return adjustmentDate >= new Date(startTime); // Compare adjustmentDate with startTime
        });

        setListInventoryHistory(filteredData); // Update with filtered data
        console.log("Filtered listInventoryHistory:", filteredData); // Debug log to verify state update

        const storageData = filteredData.flatMap((item, index) =>
          (item.stockTakeSublotDTOs || []).map((subItem) => ({
            id: index + 1,
            materialName: item.materialName,
            materialId: item.materialId,
            unitOfMeasure: item.unitOfMeasure,
            warehouseID: item.warehouseID,
            locationId: subItem.locationId || "--",
            previousQuantity: subItem.previousQuantity ?? "--",
            realAdjustmentQuantity: subItem.realAdjustmentQuantity ?? "--",
            quantityDifference: subItem.quantityDifference ?? "--",
          }))
        );
        setListIssueStorage(storageData);
        console.log("Updated listIssueStorage:", storageData); // Debug log to verify state update
      } else {
        console.warn("No valid data received from API.");
        setListInventoryHistory([]); // Clear the list if no valid data is received
        setListIssueStorage([]); // Clear the storage list if no valid data is received
      }
    } catch (error) {
      console.error("Error fetching Issue history:", error.message || error);
      if (error.response) {
        console.error("Error response status:", error.response.status); // Log HTTP status
        console.error("Error response data:", error.response.data); // Log error data
      }
      setListInventoryHistory([]);
      setListIssueStorage([]);
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <FormSection style={{ width: "25%", margin: "0px 20px", height: "100%" }}>
        <SectionTitle style={{ fontSize: "24px", padding: "0 10px", marginBottom: 0 }}>Truy xuất lịch sử kiểm kê</SectionTitle>
        <div>
          <SectionTitle style={{ textAlign: 'left', fontSize: "16px", marginBottom: 0, marginLeft: "20px" }}>Mã lô/ Số PO:</SectionTitle>
          <input
            type="text"
            placeholder="Tìm kiếm theo Mã lô/ số PO"
            value={searchLotNumber}
            onChange={(e) => setSearchLotNumber(e.target.value)}
            style={{ width: "90%", marginLeft:"20px", padding: "5px", marginBottom: "10px", border: "1px solid #ccc", borderRadius: "4px" }}
          />
          <div style={{ display: "flex", marginBottom: "5px" }}>
            <FormGroup>
              <SelectContainer>
                <DateInput
                  style={{ width: "80%", left: "9%" }}
                  selectedDate={selectedDate1}
                  onChange={(date) => setSelectedDate1(date || null)} // Reset to null when cleared
                />
              </SelectContainer>
            </FormGroup>
            <FormGroup>
              <SelectContainer>
                <DateInput
                  style={{ width: "80%", right: "9%" }}
                  selectedDate={selectedDate2}
                  onChange={(date) => setSelectedDate2(date || null)} // Reset to null when cleared
                />
              </SelectContainer>
            </FormGroup>
          </div>
          <ActionButton 
            style={{ padding: "5px", marginTop: 0, fontSize: "16px" }} 
            onClick={handleSearch}
            disabled={isLoading} // Disable button while loading
          >
            {isLoading ? <ClipLoader size={20} color="#fff" /> : "Tìm kiếm"}
          </ActionButton>
        </div>
        <SectionTitle style={{ fontSize: "20px", padding: "10px", marginBottom: 0 }}>Danh sách lô kiểm kê</SectionTitle>
        <div style={{ height: "60%", overflow: "auto" }}>
          {listInventoryHistory.length > 0 ? (
            listInventoryHistory.map((item, index) => (
              <div
                className={clsx(styles.divOfList)}
                key={index}
                onClick={async () => {
                  setSelectedItem(item); // Set selected item for "Thông tin lô kiểm kê"
                  try {
                    const response = await InventoryApi.getAllAdjustment(item.lotNumber); // Fetch data by lotNumber
                    console.log("API response for adjustment details:", response); // Debug log
                    if (response && Array.isArray(response)) {
                      const storageData = response.flatMap((subItem) => {
                        const sublotData = subItem.stockTakeSublotDTOs || [];
                        if (sublotData.length === 0) {
                          // Handle case where stockTakeSublotDTOs is empty
                          return [{
                            id: 1,
                            materialName: subItem.materialName || "--",
                            materialId: subItem.materialId || "--",
                            unitOfMeasure: subItem.unitOfMeasure || "--",
                            locationId: "--",
                            previousQuantity: "--",
                            realAdjustmentQuantity: "--",
                            quantityDifference: "--",
                          }];
                        }
                        return sublotData.map((subItemDetail, subIndex) => ({
                          id: subIndex + 1,
                          materialName: subItem.materialName || "--",
                          materialId: subItem.materialId || "--",
                          unitOfMeasure: subItem.unitOfMeasure || "--",
                          locationId: subItemDetail.locationId || "--",
                          previousQuantity: subItemDetail.previousQuantity ?? "--",
                          realAdjustmentQuantity: subItemDetail.realAdjustmentQuantity ?? "--",
                          quantityDifference: subItemDetail.quantityDifference ?? "--",
                        }));
                      });
                      setListIssueStorage(storageData); // Update table data with API response
                    } else {
                      console.warn("No valid adjustment details received from API.");
                      setListIssueStorage([]); // Clear table data if no valid data is received
                    }
                  } catch (error) {
                    console.error("Error fetching adjustment details:", error.message || error);
                    setListIssueStorage([]); // Clear table data on error
                  }
                }}
                style={{
                  backgroundColor: selectedItem === item ? '#f5f5f5' : '#FFF',
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  padding: "15px",
                  marginBottom: "10px",
                  fontSize: "12px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <div style={{ fontWeight: "500",  width: "40%" }}>Mã lô/ Số PO:</div>
                  <span style={{ width: "60%", textAlign: "right", fontSize: "13px" }}>{item.lotNumber || "--"}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <div style={{ fontWeight: "500",  width: "40%" }}>Thời gian kiểm kê:</div>
                  <span style={{ width: "60%", textAlign: "right" , fontSize: "13px"}}>{item.adjustmentDate || "--"}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <div style={{ fontWeight: "500",  width: "40%" }}>Nhân viên:</div>
                  <span style={{ width: "60%", textAlign: "right", fontSize: "13px" }}>{item.personName || "--"}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <div style={{ fontWeight: "500",  width: "40%" }}>Kho hàng:</div>
                  <span style={{ width: "60%", textAlign: "right", fontSize: "13px" }}>{item.warehouseName || "--"}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <div style={{ fontWeight: "500",  width: "40%", fontSize: "13px" }}>Trạng thái:</div>
                  <div
                    style={{
                      textAlign: 'center',
                      borderRadius: '8px',
                      backgroundColor: statusMapping[item.lotStatus]?.color || "#ccc",
                      padding: '5px 10px',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '14px',
                      width: "50%",
                    }}
                  >
                    {statusMapping[item.lotStatus]?.label || "--"}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div
              className={clsx(styles.divOfList)}
              style={{
                backgroundColor: '#FFF',
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "15px",
                marginBottom: "10px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0px" }}>
                <div style={{ fontWeight: "500", fontSize: "12px", width: "40%" }}>Mã lô/ Số PO:</div>
                <span style={{ width: "60%", textAlign: "right" }}>--</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0px" }}>
                <div style={{ fontWeight: "500", fontSize: "12px", width: "40%" }}>Thời gian kiểm kê:</div>
                <span style={{ width: "60%", textAlign: "right" }}>--</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0px" }}>
                <div style={{ fontWeight: "500", fontSize: "12px", width: "40%" }}>Nhân viên:</div>
                <span style={{ width: "60%", textAlign: "right" }}>--</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0px" }}>
                <div style={{ fontWeight: "500", fontSize: "12px", width: "40%" }}>Kho hàng:</div>
                <span style={{ width: "60%", textAlign: "right" }}>--</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0px" }}>
                <div style={{ fontWeight: "500", fontSize: "12px", width: "40%" }}>Trạng thái:</div>
                <div
                  style={{
                    textAlign: 'center',
                    borderRadius: '8px',
                    backgroundColor: "white",
                    padding: '5px 10px',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    width: "30%",
                  }}
                >
                  --
                </div>
              </div>
            </div>
          )}
        </div>
      </FormSection>
      {/* Right Section */}
      <FormSection style={{ flex: 2, marginRight: 0, right: "0.5%", height: "100%" }}>
        <SectionTitle style={{ fontSize: "24px" }}>Thông tin kiểm kê chi tiết</SectionTitle>
        <h1 style={{marginLeft:"10px", marginBottom:"10px",fontWeight:"Bold", fontSize:"20px"}}>Thông tin lô kiểm kê</h1>
        {selectedItem ? (
          <FormSection style={{ margin: "0px 10px 30px", backgroundColor: "#F5F5F5", height: "20%", padding: "10px", display: "flex" }}>
            <div style={{ flexDirection: "column", width: "50%", marginTop: "10px", marginLeft: "15px" }}>
              <FormGroup style={{ justifyContent: "space-between", marginRight: "15%", fontSize: "14px" }}>
                <Label style={{ width: "30%" }}>Kho hàng:</Label>
                <span>{selectedItem.warehouseName || "--"}</span>
              </FormGroup>
              <FormGroup style={{ justifyContent: "space-between", marginRight: "15%", fontSize: "14px" }}>
                <Label style={{ width: "100%" }}>Mã kho hàng:</Label>
                <span>{selectedItem.materialId || "--"}</span>
              </FormGroup>
              <FormGroup style={{ justifyContent: "space-between", marginRight: "15%", fontSize: "14px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                <Label style={{ width: "55%" }}>Ngày thực hiện:</Label>
                <span style={{ width: "70%", textAlign: "right" }}>{selectedItem.adjustmentDate || "--"}</span>
              </FormGroup>
              
            </div>

            <div style={{ flexDirection: "column", width: "50%", marginTop: "10px", marginLeft: "15px" }}>
              <FormGroup style={{ justifyContent: "space-between", marginRight: "5%", fontSize: "14px" }}>
                <Label style={{ width: "40%" }}>Mã lô/ Số PO:</Label>
                <span>{selectedItem.lotNumber || "--"}</span>
              </FormGroup>
              <FormGroup style={{ justifyContent: "space-between", marginRight: "5%", fontSize: "14px" }}>
                <Label style={{ width: "40%" }}>Nhân viên kiểm kê:</Label>
                <span>{selectedItem.personName || "--"}</span>
              </FormGroup>
              <FormGroup style={{ justifyContent: "space-between", marginRight: "5%", fontSize: "14px" }}>
                <Label style={{ width: "50%" }}>Trạng thái:</Label>
                <div
                  style={{
                    width: '40%',
                    textAlign: 'center',
                    borderRadius: '8px',
                    backgroundColor: statusMapping[selectedItem.lotStatus]?.color || "#ccc",
                    padding: '2%',
                    margin: '0',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '12px',
                  }}
                >
                  {statusMapping[selectedItem.lotStatus]?.label || "--"}
                </div>
              </FormGroup>
            </div>
          </FormSection>
        ) : (
          <div style={{ textAlign: "center", marginTop: "20px", color: "#888" }}>Chọn một mục để xem chi tiết</div>
        )}
        <h1 style={{marginLeft:"10px", marginBottom:"10px",fontWeight:"Bold", fontSize:"20px"}}>Bảng kiểm kê</h1>
        <ListSection style={{ padding: 0, margin: "0px 10px", maxHeight: "calc(90% - 250px)", overflowY: "auto" }}>
          {isLoading ? (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
              <ClipLoader size={50} color="#007bff" />
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <Table>
                <thead>
                  <tr>
                    <TableHeader>STT</TableHeader>
                    <TableHeader>Vị trí lưu trữ</TableHeader>
                    <TableHeader>Tên sản phẩm</TableHeader>
                    <TableHeader>Mã sản phẩm</TableHeader>
                    <TableHeader>ĐVT</TableHeader>
                    <TableHeader>Tồn kho</TableHeader>
                    <TableHeader>Thực tế</TableHeader>
                    <TableHeader>SL lệch</TableHeader>
                    <TableHeader>Ghi chú</TableHeader>
                  </tr>
                </thead>
                <tbody>
                  {listIssueStorage.map((item, index) => (
                    <tr
                      key={index}
                      style={{
                        cursor: "pointer",
                        backgroundColor: selectedItem?.lotNumber === item.lotNumber ? "#f5f5f5" : "#FFF",
                      }}
                    >
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{item.locationId || "--"}</TableCell>
                      <TableCell>{item.materialName || "--"}</TableCell>
                      <TableCell>{item.materialId || "--"}</TableCell> {/* Ensure materialId is rendered */}
                      <TableCell>{item.unitOfMeasure || "--"}</TableCell>
                      <TableCell>{item.previousQuantity !== null && item.previousQuantity !== undefined ? item.previousQuantity : "--"}</TableCell> {/* Render 0 if value is 0 */}
                      <TableCell>{item.realAdjustmentQuantity !== null && item.realAdjustmentQuantity !== undefined ? item.realAdjustmentQuantity : "--"}</TableCell> {/* Render 0 if value is 0 */}
                      <TableCell>{item.quantityDifference !== null && item.quantityDifference !== undefined ? item.quantityDifference : "--"}</TableCell> {/* Render 0 if value is 0 */}
                      <TableCell>--</TableCell>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </ListSection>
      </FormSection>
    </div>
  );
};

export default InventoryHistory;