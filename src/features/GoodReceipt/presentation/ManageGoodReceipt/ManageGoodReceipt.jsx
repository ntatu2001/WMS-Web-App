import React, { useEffect, useState } from 'react';
import { FaTrash } from 'react-icons/fa';
import ContentContainer from '../../../../common/components/ContentContainer/ContentContainer';
import ListSection from '../../../../common/components/Section/ListSection';
import HeaderItem from '../../../../common/components/Header/HeaderItem';
import Table from '../../../../common/components/Table/Table';
import TableHeader from '../../../../common/components/Table/TableHeader';
import TableCell from '../../../../common/components/Table/TableCell';
import DeleteButton from '../../../../common/components/Button/DeleteButton/DeleteButton';
import ReceiptProgress from '../Progress/ReceiptProgress.jsx';
import { lotStatusData } from '../../../../app/mockData/LotStatusData.js';
import inventoryReceiptApi from '../../../../api/inventoryReceiptApi.js';
import inventoryReceiptEntryApi from '../../../../api/inventoryReceiptEntryApi.js';

const ManageGoodReceipt = () => {

  const [receipts, setReceipts] = useState([]);
  const [todayReceipts, setTodayReceipts] = useState([]);
  const [receiptEntries, setReceiptEntries] = useState([]);
  const [todayReceiptEntries, setTodayReceiptEntries] = useState([]);

  
  useEffect(() => {
    const GetApi = async() => {
        const receiptList = await inventoryReceiptApi.getAllReceipts();
        const receiptEntryList = await inventoryReceiptEntryApi.getAllReceiptEntries();
        setReceipts(receiptList);
        setReceiptEntries(receiptEntryList);
        
        // Filter receipts for today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const filteredTodayReceipts = receiptList.filter(receipt => {
          const receiptDate = new Date(receipt.receiptDate);
          receiptDate.setHours(0, 0, 0, 0);
          return receiptDate.getTime() === today.getTime();
        });
        
        setTodayReceipts(filteredTodayReceipts);
        
        // Filter receiptEntries that match todayReceipts inventoryReceiptId
        if (filteredTodayReceipts.length > 0) {
          const todayReceiptIds = filteredTodayReceipts.map(receipt => 
            receipt.inventoryReceiptId
          );
          console.log(todayReceiptIds)
          const filteredEntries = receiptEntryList.filter(entry => 
            todayReceiptIds.includes(entry.inventoryReceiptId)
          );
          setTodayReceiptEntries(filteredEntries);
        }
    };

    GetApi();
  },[])

  // console.log(todayReceipts)
  // console.log(receiptEntries)
  // console.log("Today's Receipt Entries:", todayReceiptEntries)
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
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{item.receiver}</TableCell>
                      <TableCell>{item.note}</TableCell>
                      <TableCell style={{ textAlign: 'center' }}>
                        <div
                          style={{
                            width: '70%',
                            textAlign: 'center',
                            borderRadius: '8px',
                            backgroundColor: lotStatusData[item.status],
                            padding: '2% 5%',
                            margin: '0 auto',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '14px',
                          }}
                        >
                          {item.status}  
                        </div>
                      </TableCell>
                      <TableCell>
                        <DeleteButton>
                          <FaTrash size={25} color="#000" />
                        </DeleteButton>
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
                    <TableHeader>Tên sản phẩm</TableHeader>
                    <TableHeader>Mã sản phẩm</TableHeader>
                    <TableHeader>ĐVT</TableHeader>
                    <TableHeader>Mã lô/Số PO</TableHeader>
                    <TableHeader>Số lượng nhập</TableHeader>
                    <TableHeader>Nhân viên</TableHeader>
                    <TableHeader>Ngày nhập kho</TableHeader>
                    <TableHeader>Kho hàng</TableHeader>
                    <TableHeader></TableHeader>
                  </tr>
                </thead>
                <tbody>
                  {receiptEntries.filter(item => !todayReceiptEntries.includes(item)).slice(0, 10).map((item, index) => (
                    <tr key={item.id || index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.code}</TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell>{item.poNumber}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{item.receiver}</TableCell>
                      <TableCell>{new Date(item.receiptDate).toLocaleDateString()}</TableCell>
                      <TableCell>{item.type}</TableCell>
                      <TableCell>
                        <DeleteButton>
                          <FaTrash size={25} color="#000" />
                        </DeleteButton>
                      </TableCell>
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