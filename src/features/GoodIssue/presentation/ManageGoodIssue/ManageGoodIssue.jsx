import React, { useEffect, useState } from 'react';
import ContentContainer from '../../../../common/components/ContentContainer/ContentContainer';
import ListSection from '../../../../common/components/Section/ListSection';
import HeaderItem from '../../../../common/components/Header/HeaderItem';
import Table from '../../../../common/components/Table/Table';
import TableHeader from '../../../../common/components/Table/TableHeader';
import TableCell from '../../../../common/components/Table/TableCell';
import { lotStatusChangeData } from '../../../../app/mockData/LotStatusData.js';
import inventoryIssueEntryApi from '../../../../api/inventoryIssueEntryApi.js';
import { ClipLoader} from 'react-spinners';
import IssueProgress from '../Progress/IssueProgress';
import issueLotApi from '../../../../api/issueLotApi.js';
import { toast } from "react-toastify"; // Import toast for notifications
import "react-toastify/dist/ReactToastify.css";


const ManageGoodIssue = () => {
  const [issueEntries, setIssueEntries] = useState([]);
  const [todayIssueEntries, setTodayIssueEntries] = useState([]);
  const [lastWeekIssueEntries, setLastWeekIssueEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [getAllIssueLots, setGetAllIssueLots] = useState([]);
  useEffect(() => {
    const GetApi = async() => {
      try {
        setLoading(true);
        const issueEntryList = await inventoryIssueEntryApi.getAllIssueEntries();
        const getAllIssueLots = await issueLotApi.getAllIssueLots();
        setGetAllIssueLots(getAllIssueLots);
        const issueEntryNotPending = issueEntryList.filter(entry => entry.issueLot.issueLotStatus !== "Pending");
        setIssueEntries(issueEntryNotPending);
        
        // Filter entries for today
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to beginning of day
        
        const todayEntries = issueEntryNotPending.filter(entry => {
          const entryDate = new Date(entry.issueDate);
          entryDate.setHours(0, 0, 0, 0); // Set to beginning of day
          return entryDate.getTime() === today.getTime();
        });

        // Sort last week entries by date in descending order
        const sortedTodayEntries = [...todayEntries].sort((a, b) => 
          new Date(b.issueDate) - new Date(a.issueDate)
        );
      
        setTodayIssueEntries(sortedTodayEntries);
        
        // Filter entries for last week (keeping existing code structure)
        const lastWeekEntries = issueEntryNotPending.filter(entry => {
          const entryDate = new Date(entry.issueDate);
          const lastWeek = new Date();
          lastWeek.setDate(lastWeek.getDate() - 7);
          return entryDate >= lastWeek && entryDate < today;
        });
        
        // Sort last week entries by date in descending order
        const sortedLastWeekEntries = [...lastWeekEntries].sort((a, b) => 
          new Date(b.issueDate) - new Date(a.issueDate)
        );
        
        setLastWeekIssueEntries(sortedLastWeekEntries);
      } catch (error) {
        console.error("Error fetching issue entries:", error);
      } finally {
        setLoading(false);
      }
    };

    GetApi();
  },[])

  const LoadingSpinner = () => (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
      <ClipLoader color="#3498db" size={60} speedMultiplier={0.8} />
      <div style={{ marginTop: '15px', fontSize: '20px', color: '#666', fontWeight: 'bold' }}>
        Đang tải dữ liệu...
      </div>
    </div>
  );
  
  const handleStatusChange = async (itemId, newStatus) => {
    try {
      // Find the issue entry to check its current status
      const entryToUpdate = [...issueEntries, ...todayIssueEntries, ...lastWeekIssueEntries]
        .find(entry => entry.lotNumber === itemId);
      
      // If the status is already Done, don't allow changing it
      if (entryToUpdate && entryToUpdate.issueLot.issueLotStatus === "Done") {
        console.log("Cannot modify completed issue lots");
        return;
      }
      
      // Find the reverse mapping for the new status (from UI display status to backend status)
      const reversedStatus = Object.keys(lotStatusChangeData).find(
        key => lotStatusChangeData[key] === newStatus
      );
      
      if (!reversedStatus) {
        console.error("Invalid status mapping");
        return;
      }
    

      const issueLot = getAllIssueLots.find(lot => lot.materialLotId === itemId);
      const updateIssueLotStatus = {
        issueLotId: issueLot.issueLotId,
        issueLotStatus: reversedStatus
      }
      console.log(updateIssueLotStatus)
      // Make API call to update the status
      await issueLotApi.updateIssueLotStatus(updateIssueLotStatus);
      
      // Update local state
      const updateEntries = entries => {
        return entries.map(entry => {
          if (entry.lotNumber === itemId) {
            return {
              ...entry,
              issueLot: {
                ...entry.issueLot,
                issueLotStatus: reversedStatus
              }
            };
          }
          return entry;
        });
      };
      
      setIssueEntries(updateEntries(issueEntries));
      setTodayIssueEntries(updateEntries(todayIssueEntries));
      setLastWeekIssueEntries(updateEntries(lastWeekIssueEntries));
      toast.success("Cập nhật trạng thái lô thành công!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } catch (error) {
      console.error("Error updating issue lot status:", error);
      toast.error("Cập nhật trạng thái lô thất bại!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };
  
  return (
    <>
      <ContentContainer>
        <div style={{ width: '100%', height: "50%"}}>
          <ListSection>
            <HeaderItem>Lô xuất kho trong ngày</HeaderItem>
            <div style={{ marginTop: '1rem', overflowY: 'scroll', height: "300px"}}>
              {loading ? (
                <LoadingSpinner />
              ) : todayIssueEntries.length > 0 ? (
                <Table>
                  <thead>
                    <tr>
                      <TableHeader>STT</TableHeader>
                      <TableHeader>Tên sản phẩm</TableHeader>
                      <TableHeader>Mã sản phẩm</TableHeader>
                      <TableHeader>ĐVT</TableHeader>
                      <TableHeader>Mã lô/Số PO</TableHeader>
                      <TableHeader>Số lượng xuất</TableHeader>
                      <TableHeader>Nhân viên</TableHeader>
                      <TableHeader>Ghi chú</TableHeader>
                      <TableHeader style={{width: "15%"}}>Tiến độ</TableHeader>
                      <TableHeader></TableHeader> 
                    </tr>
                  </thead>
                  <tbody>
                    {todayIssueEntries.map((item, index) => (
                      <tr key={index}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{item.materialName}</TableCell>
                        <TableCell>{item.materialId}</TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell>{item.lotNumber}</TableCell>
                        <TableCell>{item.issueLot.requestedQuantity}</TableCell>
                        <TableCell>{item.personName}</TableCell>
                        <TableCell>{item.note === "None" ? "--" : item.note}</TableCell>
                        <TableCell style={{ textAlign: 'center' }}>
                          <IssueProgress 
                            item={{
                              id: item.lotNumber,
                              status: lotStatusChangeData[item.issueLot.issueLotStatus]
                            }}
                            handleStatusChange={handleStatusChange}
                          />
                        </TableCell>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', color: '#666' }}>
                  Không có dữ liệu trong ngày
                </div>
              )}
            </div>
          </ListSection>
          <ListSection style={{ marginTop: '2rem' }}>
            <HeaderItem>Lô xuất kho gần đây</HeaderItem>
            <div style={{ marginTop: '1rem', overflowY: 'scroll', height: "300px"}}>
              {loading ? (
                <LoadingSpinner />
              ) : lastWeekIssueEntries.length > 0 ? (
                <Table>
                  <thead>
                    <tr>
                      <TableHeader>STT</TableHeader>
                      <TableHeader style={{width: "15%"}}>Tên sản phẩm</TableHeader>
                      <TableHeader style={{width: "5%"}}>Mã sản phẩm</TableHeader>
                      <TableHeader>ĐVT</TableHeader>
                      <TableHeader style={{width: "10%"}}>Mã lô/Số PO</TableHeader>
                      <TableHeader style={{width: "10%"}}>Số lượng xuất</TableHeader>
                      <TableHeader style={{width: "10%"}}>Nhân viên</TableHeader>
                      <TableHeader style={{width: "10%"}}>Ngày xuất kho</TableHeader>
                      <TableHeader>Kho hàng</TableHeader>
                      <TableHeader style={{width: "15%"}}>Tiến độ</TableHeader>
                    </tr>
                  </thead>
                  <tbody>
                    {lastWeekIssueEntries.map((item, index) => (
                      <tr key={item.id || index}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{item.materialName}</TableCell>
                        <TableCell>{item.materialId}</TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell>{item.lotNumber}</TableCell>
                        <TableCell>{item.issueLot.requestedQuantity}</TableCell>
                        <TableCell>{item.personName}</TableCell>
                        <TableCell>{new Date(item.issueDate).toLocaleDateString()}</TableCell>
                        <TableCell>{item.warehouseName}</TableCell>
                        <TableCell style={{ textAlign: 'center' }}>
                          <IssueProgress 
                            item={{
                              id: item.lotNumber,
                              status: lotStatusChangeData[item.issueLot.issueLotStatus]
                            }}
                            handleStatusChange={handleStatusChange}
                          />
                        </TableCell>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', color: '#666' }}>
                  Không có dữ liệu kho gần đây
                </div>
              )}
            </div>
          </ListSection>
        </div>
      </ContentContainer>
    </>
  );
};

export default ManageGoodIssue; 