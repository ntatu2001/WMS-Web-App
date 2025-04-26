import React, { useEffect, useState } from 'react';
import ContentContainer from '../../../../common/components/ContentContainer/ContentContainer';
import ListSection from '../../../../common/components/Section/ListSection';
import HeaderItem from '../../../../common/components/Header/HeaderItem';
import Table from '../../../../common/components/Table/Table';
import TableHeader from '../../../../common/components/Table/TableHeader';
import TableCell from '../../../../common/components/Table/TableCell';
import { lotStatusData, lotStatusChangeData } from '../../../../app/mockData/LotStatusData.js';
import inventoryReceiptEntryApi from '../../../../api/inventoryReceiptEntryApi.js';



const ManageGoodReceipt = () => {

  const [receiptEntries, setReceiptEntries] = useState([]);
  const [todayReceiptEntries, setTodayReceiptEntries] = useState([]);
  const [lastWeekReceiptEntries, setLastWeekReceiptEntries] = useState([]);
  
  useEffect(() => {
    const GetApi = async() => {
        const receiptEntryList = await inventoryReceiptEntryApi.getAllReceiptEntries();

        setReceiptEntries(receiptEntryList);
        
        // Filter entries for today
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to beginning of day
        
        const todayEntries = receiptEntryList.filter(entry => {
          const entryDate = new Date(entry.receiptDate);
          entryDate.setHours(0, 0, 0, 0); // Set to beginning of day
          return entryDate.getTime() === today.getTime();
        });
        
        setTodayReceiptEntries(todayEntries);
        
        // Filter entries for last week (keeping existing code structure)
        const lastWeekEntries = receiptEntryList.filter(entry => {
          const entryDate = new Date(entry.receiptDate);
          const lastWeek = new Date();
          lastWeek.setDate(lastWeek.getDate() - 7);
          return entryDate >= lastWeek && entryDate < today;
        });
        
        // Sort last week entries by date in descending order
        const sortedLastWeekEntries = [...lastWeekEntries].sort((a, b) => 
          new Date(b.receiptDate) - new Date(a.receiptDate)
        );
        
        setLastWeekReceiptEntries(sortedLastWeekEntries);
    };

    GetApi();
  },[])

  console.log(receiptEntries)
  console.log("Today's Receipt Entries:", todayReceiptEntries)
  console.log("Last Week's Receipt Entries:", lastWeekReceiptEntries)
  
  return (
    <>
      <ContentContainer>
        <div style={{ width: '100%', height: "50%"}}>
          <ListSection>
            <HeaderItem>Lô nhập kho trong ngày</HeaderItem>
            <div style={{ marginTop: '1rem', overflowY: 'scroll', height: "300px"}}>
              <Table>
                <thead>
                  <tr>
                    <TableHeader>STT</TableHeader>
                    <TableHeader>Tên sản phẩm</TableHeader>
                    <TableHeader>Mã sản phẩm</TableHeader>
                    <TableHeader>ĐVT</TableHeader>
                    <TableHeader>Mã lô/Số PO</TableHeader>
                    <TableHeader>Số lượng nhập</TableHeader>
                    <TableHeader>Nhân viên</TableHeader>
                    <TableHeader>Ghi chú</TableHeader>
                    <TableHeader>Tiến độ</TableHeader>
                    <TableHeader></TableHeader> 
                  </tr>
                </thead>
                <tbody>
                  {todayReceiptEntries.map((item, index) => (
                    <tr key={index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{item.materialName}</TableCell>
                      <TableCell>{item.materialId}</TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell>{item.lotNumber}</TableCell>
                      <TableCell>{item.receiptLot.importedQuantity}</TableCell>
                      <TableCell>{item.personName}</TableCell>
                      <TableCell>{item.note}</TableCell>
                      <TableCell style={{ textAlign: 'center' }}>
                        <div
                          style={{
                            width: '100%',
                            textAlign: 'center',
                            borderRadius: '8px',
                            backgroundColor: lotStatusData[lotStatusChangeData[item.receiptLot.receiptLotStatus]],
                            padding: '2% 5%',
                            margin: '0 auto',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '14px',
                          }}
                        >
                          {lotStatusChangeData[item.receiptLot.receiptLotStatus]}
                        </div>
                      </TableCell>
        
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </ListSection>
          <ListSection style={{ marginTop: '2rem' }}>
            <HeaderItem>Lô nhập kho gần đây</HeaderItem>
            <div style={{ marginTop: '1rem', overflowY: 'scroll', height: "300px"}}>
              <Table>
                <thead>
                  <tr>
                    <TableHeader>STT</TableHeader>
                    <TableHeader style={{width: "30%"}}>Tên sản phẩm</TableHeader>
                    <TableHeader style={{width: "5%"}}>Mã sản phẩm</TableHeader>
                    <TableHeader>ĐVT</TableHeader>
                    <TableHeader style={{width: "10%"}}>Mã lô/Số PO</TableHeader>
                    <TableHeader style={{width: "15%"}}>Số lượng nhập</TableHeader>
                    <TableHeader>Nhân viên</TableHeader>
                    <TableHeader style={{width: "10%"}}>Ngày nhập kho</TableHeader>
                    <TableHeader>Kho hàng</TableHeader>
                    <TableHeader></TableHeader>
                  </tr>
                </thead>
                <tbody>
                  {lastWeekReceiptEntries.map((item, index) => (
                    <tr key={item.id || index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{item.materialName}</TableCell>
                      <TableCell>{item.materialId}</TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell>{item.lotNumber}</TableCell>
                      <TableCell>{item.receiptLot.importedQuantity}</TableCell>
                      <TableCell>{item.personName}</TableCell>
                      <TableCell>{new Date(item.receiptDate).toLocaleDateString()}</TableCell>
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

export default ManageGoodReceipt; 