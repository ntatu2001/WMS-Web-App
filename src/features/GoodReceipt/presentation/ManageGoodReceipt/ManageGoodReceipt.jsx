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
const ManageGoodReceipt = () => {
  const [receipts, setReceipts] = useState([
    { id: 1, name: 'Keo chemiok 250', code: 'AO01001', unit: 'Kg', poNumber: 'NVL205', quantity: 15, receiver: 'Anh Tú', note: '--', status: 'Đang kiểm tra' },
    { id: 2, name: 'Hạt nhựa PP AY161', code: 'PLPP001', unit: 'Kg', poNumber: 'NAM104', quantity: 100, receiver: 'Văn Bảo', note: '--', status: 'Đang lấy hàng' },
  ]);

  const recentReceipts = [
    { id: 1, name: 'Cao Su EPDM 512F', code: 'RB01004', unit: 'Kg', poNumber: 'CS202', quantity: 200, receiver: 'Hoàng Thành', date: '26/02/2025', type: 'Vật tư' },
    { id: 2, name: 'Chất hóa dẻo', code: 'PA02001', unit: 'Kg', poNumber: 'NT331', quantity: 350, receiver: 'Văn Khang', date: '25/02/2025', type: 'Nguyên vật liệu' },
    { id: 3, name: 'Dầu Tuolein 13W', code: 'PO04001', unit: 'Kg', poNumber: 'HCD41', quantity: 50, receiver: 'Phát Huy', date: '25/02/2025', type: 'Nguyên vật liệu' },
    { id: 4, name: 'Medium Drive Ceramic', code: 'NLSQ097', unit: 'Cuộn', poNumber: '690912', quantity: 500, receiver: 'Phát Huy', date: '24/02/2025', type: 'Thành phẩm' },
    { id: 5, name: 'Sứ Block lớn Tấc', code: 'CR04001', unit: 'PCS', poNumber: 'R6120', quantity: 80, receiver: 'Hùng Vạn', date: '24/02/2025', type: 'Bao Bì' },
  ];

  const handleStatusChange = (id, newStatus) => {
    setReceipts(
      receipts.map((item) => 
        item.id === id ? { ...item, status: newStatus } : item
      )
    );
  };

  return (
    <>
      <ContentContainer>
        <div style = {{width: '100%'}}>
        <ListSection>
        <HeaderItem>Lô nhập kho trong ngày</HeaderItem>
            <div style={{marginTop: '1rem', overflowX: 'auto'}}>
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
                  {receipts.map((item) => (
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
        <ListSection style = {{marginTop: '2rem'}}>
          <HeaderItem>Lô nhập kho gần đây</HeaderItem>
            <div style={{marginTop: '1rem', overflowX: 'auto'}}>
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
                  {recentReceipts.map((item) => (
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