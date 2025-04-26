import React, { useEffect, useState } from 'react';
import ContentContainer from '../../../../common/components/ContentContainer/ContentContainer';
import ListSection from '../../../../common/components/Section/ListSection';
import HeaderItem from '../../../../common/components/Header/HeaderItem';
import Table from '../../../../common/components/Table/Table';
import TableHeader from '../../../../common/components/Table/TableHeader';
import TableCell from '../../../../common/components/Table/TableCell';
import { lotStatusData, lotStatusChangeData } from '../../../../app/mockData/LotStatusData.js';
import inventoryIssueEntryApi from '../../../../api/inventoryIssueEntryApi.js';



const ManageGoodIssue = () => {

  const [issueEntries, setIssueEntries] = useState([]);
  const [todayIssueEntries, setTodayIssueEntries] = useState([]);
  const [lastWeekIssueEntries, setLastWeekIssueEntries] = useState([]);
  
  useEffect(() => {
    const GetApi = async() => {
        const issueEntryList = await inventoryIssueEntryApi.getAllIssueEntries();

        setIssueEntries(issueEntryList);
        
        // Filter entries for today
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to beginning of day
        
        const todayEntries = issueEntryList.filter(entry => {
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
        const lastWeekEntries = issueEntryList.filter(entry => {
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
    };

    GetApi();
  },[])

  console.log(issueEntries)
  console.log("Today's Issue Entries:", todayIssueEntries)
  console.log("Last Week's Issue Entries:", lastWeekIssueEntries)
  
  return (
    <>
      <ContentContainer>
        <div style={{ width: '100%', height: "50%"}}>
          <ListSection>
            <HeaderItem>Lô xuất kho trong ngày</HeaderItem>
            <div style={{ marginTop: '1rem', overflowY: 'scroll', height: "300px"}}>
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
                    <TableHeader>Tiến độ</TableHeader>
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
                      <TableCell>{item.note}</TableCell>
                      <TableCell style={{ textAlign: 'center' }}>
                        <div
                          style={{
                            width: '100%',
                            textAlign: 'center',
                            borderRadius: '8px',
                            backgroundColor: lotStatusData[lotStatusChangeData[item.issueLot.issueLotStatus]],
                            padding: '2% 5%',
                            margin: '0 auto',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '14px',
                          }}
                        >
                          {lotStatusChangeData[item.issueLot.issueLotStatus]}
                        </div>
                      </TableCell>
        
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </ListSection>
          <ListSection style={{ marginTop: '2rem' }}>
            <HeaderItem>Lô xuất kho gần đây</HeaderItem>
            <div style={{ marginTop: '1rem', overflowY: 'scroll', height: "300px"}}>
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
                    <TableHeader>Ngày xuất kho</TableHeader>
                    <TableHeader>Kho hàng</TableHeader>
                    <TableHeader></TableHeader>
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
            
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </ListSection>
        </div>
      </ContentContainer>
    </>
  );
};

export default ManageGoodIssue; 