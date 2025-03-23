import React, { useState } from 'react';
import { FaEye } from 'react-icons/fa';
import ContentContainer from '../../../common/components/ContentContainer/ContentContainer';
import ListSection from '../../../common/components/Section/ListSection';
import HeaderItem from '../../../common/components/Header/HeaderItem';
import Table from '../../../common/components/Table/Table';
import TableHeader from '../../../common/components/Table/TableHeader';
import TableCell from '../../../common/components/Table/TableCell';
import FaEyeButton from '../../../common/components/Button/FaEyeButton/FaEyeButton';
import IssueProgress from './IssueProgress';
import { listTodayIssues, listRecentIssues } from '../../../app/mockData/InventoryIssueData.js';


const ManageGoodIssue = () => {
    const [issues, setIssues] = useState(listTodayIssues);

    const handleStatusChange = (id, newStatus) => {
        setIssues(
            issues.map((item) =>
                item.id === id ? { ...item, status: newStatus } : item
            )
        );
    };

    return (
        <>
            <ContentContainer>
                <div style={{ width: '100%' }}>
                    <ListSection>
                        <HeaderItem>Lô xuất kho trong ngày</HeaderItem>
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
                                    {issues.map((item) => (
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
                                                <IssueProgress
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
                        <HeaderItem>Lô xuất kho gần đây</HeaderItem>
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
                                    {listRecentIssues.map((item) => (
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

export default ManageGoodIssue; 