import React, { useState } from 'react';
import { FaTrash, FaChevronDown } from 'react-icons/fa';
import SectionTitle from '../../../../common/components/Text/SectionTitle.jsx';
import Table from '../../../../common/components/Table/Table.jsx';
import TableHeader from '../../../../common/components/Table/TableHeader.jsx';
import TableCell from '../../../../common/components/Table/TableCell.jsx';
import SelectContainer from '../../../../common/components/Selection/SelectContainer.jsx';
import Select from '../../../../common/components/Selection/Select.jsx';
import FormGroup from '../../../../common/components/FormGroup/FormGroup.jsx';
import CreateButton from '../../../../common/components/Button/CreateButton/CreateButton.jsx';
import ActionButton from '../../../../common/components/Button/ActionButton/ActionButton.jsx';
import ContentContainer from '../../../../common/components/ContentContainer/ContentContainer.jsx';
import DropdownIcon from '../../../../common/components/Icon/DropdownIcon.jsx';
import DateInput from '../../../../common/components/DateInput/DateInput.jsx';
import Label from '../../../../common/components/Label/Label.jsx';
import FormSection from '../../../../common/components/Section/FormSection.jsx';
import ListSection from '../../../../common/components/Section/ListSection.jsx';
import DeleteButton from '../../../../common/components/Button/DeleteButton/DeleteButton.jsx';
import clsx from 'clsx';
import styles from './CreateGoodIssue.module.scss';
import InforIssueModal from '../InforModal/InforIssueModal.jsx';
import { listIssueMaterials } from '../../../../app/mockData/InventoryIssueData.js';
import { listCustomers } from '../../../../app/mockData/CustomerData.js';
import { listPersons } from '../../../../app/mockData/PersonData.js';
import { listWarehouses } from '../../../../app/mockData/WarehouseData.js';
import { listZones } from '../../../../app/mockData/ZoneData.js';
import {AiOutlineDelete} from 'react-icons/ai'

const CreateGoodIssue = () => {
    const [selectedDate, setSelectedDate] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    return (
        <ContentContainer >
            {/* Left Section - Import Form */}
            <FormSection>
                <SectionTitle>Phiếu xuất kho</SectionTitle>

                <FormGroup>
                    <Label>Kho hàng:</Label>
                    <SelectContainer>
                        <Select defaultValue="">
                            <option value="" disabled>Chọn loại kho hàng</option>
                            {listWarehouses.map((warehouse, index) => (
                                <option value={`warehouse${index}`}>
                                    {warehouse}
                                </option>
                            ))}
                        </Select>
                        <DropdownIcon><FaChevronDown size={12} /></DropdownIcon>
                    </SelectContainer>
                </FormGroup>

                <FormGroup>
                    <Label>Khu vực:</Label>
                    <SelectContainer>
                        <Select defaultValue="">
                            <option value="" disabled>Chọn loại khu vực</option>
                            {listZones.map((zone, index) => (
                                <option value={`zone${index}`}>
                                    {zone}
                                </option>
                            ))}
                        </Select>
                        <DropdownIcon><FaChevronDown size={12} /></DropdownIcon>
                    </SelectContainer>
                </FormGroup>

                <FormGroup>
                    <Label>Khách hàng:</Label>
                    <SelectContainer>
                        <Select defaultValue="">
                            <option value="" disabled>Chọn khách hàng</option>
                            {listCustomers.map((customer, index) => (
                                <option value={`customer${index}`}>
                                    {customer}
                                </option>
                            ))}
                        </Select>
                        <DropdownIcon><FaChevronDown size={12} /></DropdownIcon>
                    </SelectContainer>
                </FormGroup>

                <FormGroup>
                    <Label>Nhân viên:</Label>
                    <SelectContainer>
                        <Select defaultValue="">
                            <option value="" disabled>Chọn nhân viên</option>
                            {listPersons.map((person, index) => (
                                <option value={`person${index}`}>
                                    {person}
                                </option>
                            ))}
                        </Select>
                        <DropdownIcon><FaChevronDown size={12} /></DropdownIcon>
                    </SelectContainer>
                </FormGroup>

                <FormGroup>
                    <Label>Ngày xuất kho:</Label>
                    <SelectContainer>
                        <DateInput
                            selectedDate={selectedDate}
                            onChange={setSelectedDate}
                        />
                    </SelectContainer>
                </FormGroup>

                <ActionButton style={{

                }}>Tạo phiếu</ActionButton>
            </FormSection>

            {/* Right Section - Import List */}
            <ListSection>
           
                <SectionTitle>Danh sách xuất kho</SectionTitle>

                <div style={{maxHeight: "400px", overflowY: "scroll"}}>
               <Table>
                    <thead>
                        <tr>
                            <TableHeader style={{ width: '40px' }}>STT</TableHeader>
                            <TableHeader>Tên sản phẩm</TableHeader>
                            <TableHeader>Mã sản phẩm</TableHeader>
                            <TableHeader style={{ width: '60px' }}>ĐVT</TableHeader>
                            <TableHeader>Mã lô/Số PO</TableHeader>
                            <TableHeader>Số lượng xuất</TableHeader>
                            <TableHeader style={{ width: '120px' }}>Chi tiết xuất kho</TableHeader>
                            <TableHeader style={{ width: '50px' }}></TableHeader>
                        </tr>
                    </thead>
                    <tbody>
                        {listIssueMaterials.map(item => (
                            <tr key={item.id}>
                                <TableCell>{item.id}</TableCell>
                                <TableCell>{item.name}</TableCell>
                                <TableCell>{item.code}</TableCell>
                                <TableCell>{item.unit}</TableCell>
                                <TableCell>{item.lotPo}</TableCell>
                                <TableCell>{item.quantity}</TableCell>
                                <TableCell>
                                    <CreateButton className={clsx(styles.createButton)} onClick={openModal}>
                                        Thêm thông tin
                                    </CreateButton>
                                </TableCell>
                                <TableCell>
                                    <DeleteButton>
                                        <FaTrash size={15} color="#000" />
                                    </DeleteButton>
                                </TableCell>
                            </tr>
                        ))}
                    </tbody>
                </Table>

               </div>

                {/* Modal for additional information */}
                <InforIssueModal isModalOpen={isModalOpen} closeModal={closeModal} style={{ width: '50%' }} />

                <ActionButton style={{ marginTop: '2rem' }}>Duyệt danh sách xuất kho</ActionButton>
            </ListSection>
        </ContentContainer>
    );
};

export default CreateGoodIssue; 