import React, { useState } from 'react';
import { FaEye } from 'react-icons/fa';
import ContentContainer from '../../../../common/components/ContentContainer/ContentContainer';
import ListSection from '../../../../common/components/Section/ListSection';
import HeaderItem from '../../../../common/components/Header/HeaderItem';
import Table from '../../../../common/components/Table/Table';
import TableHeader from '../../../../common/components/Table/TableHeader';
import TableCell from '../../../../common/components/Table/TableCell';
import FaEyeButton from '../../../../common/components/Button/FaEyeButton/FaEyeButton';
import ProgressOption from '../ProgressOption/ProgressOption';
import { listTodayReceipts, listRecentReceipts } from '../../../../app/mockData/InventoryReceiptData.js';

const ManageGoodReceipt = () => {
  const [todayReceipts, setTodayReceipts] = useState(listTodayReceipts);

  const handleStatusChange = (id, newStatus) => {
    setTodayReceipts(
      todayReceipts.map((item) =>
        item.id === id ? { ...item, status: newStatus } : item
      )
    );
  };

  return (
    <>
      <ContentContainer>
        <div style={{ width: '100%' }}>
          <ListSection>
            <HeaderItem>Lô nhập kho trong ngày</HeaderItem>
            <div style={{ marginTop: '1rem', overflowX: 'auto' }}>
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
                  {todayReceipts.map((item) => (
                    <tr key={item.id}>
                      <TableCell>{item.id}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.code}</TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell>{item.poNumber}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{item.receiver}</TableCell>
                      <TableCell>{item.note}</TableCell>
                      <TableCell>
                        <ProgressOption
                          item={item}
                          handleStatusChange={handleStatusChange}
                        />
                      </TableCell>
                      <TableCell>
                        <FaEyeButton>
                          <FaEye size={25} color="#000" />
                        </FaEyeButton>
                      </TableCell>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </ListSection>
          <ListSection style={{ marginTop: '2rem' }}>
            <HeaderItem>Lô nhập kho gần đây</HeaderItem>
            <div style={{ marginTop: '1rem', overflowX: 'auto' }}>
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
                  {listRecentReceipts.map((item) => (
                    <tr key={item.id}>
                      <TableCell>{item.id}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.code}</TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell>{item.poNumber}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{item.receiver}</TableCell>
                      <TableCell>{item.date}</TableCell>
                      <TableCell>{item.type}</TableCell>
                      <TableCell>
                        <FaEyeButton>
                          <FaEye size={25} color="#000" />
                        </FaEyeButton>
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