import React, { useState } from 'react';
import Modal from 'react-modal';
import { FaEye } from 'react-icons/fa';
import clsx from 'clsx';
import styles from './InforIssueModal.module.scss';
import { AiOutlineClose } from 'react-icons/ai';
import SectionTitle from '../../../../common/components/Text/SectionTitle';
import Label from '../../../../common/components/Label/Label';
import FormGroup from '../../../../common/components/FormGroup/FormGroup';
import FormSection from '../../../../common/components/Section/FormSection';
import ListSection from '../../../../common/components/Section/ListSection';
import Table from '../../../../common/components/Table/Table';
import TableHeader from '../../../../common/components/Table/TableHeader';
import TableCell from '../../../../common/components/Table/TableCell';
import FaEyeButton from '../../../../common/components/Button/FaEyeButton/FaEyeButton';
import SelectContainer from '../../../../common/components/Selection/SelectContainer';
import Select from '../../../../common/components/Selection/Select';
import DropdownIcon from '../../../../common/components/Icon/DropdownIcon';
import DateInput from '../../../../common/components/DateInput/DateInput';
import TextNote from '../../../../common/components/Text/TextNote';
import ActionButton from '../../../../common/components/Button/ActionButton/ActionButton';
import { FaChevronDown } from 'react-icons/fa';
import QRicon from '../../../../assets/QRicon.png';
import { listIssueStorageMaterials } from '../../../../app/mockData/InventoryIssueData.js';
import { listUnitOfMeasures } from '../../../../app/mockData/UnitOfMeasure.js';
import { listCustomers } from '../../../../app/mockData/CustomerData.js';
import { listMaterials } from '../../../../app/mockData/MaterialData.js';

const InforIssueModal = ({ isModalOpen, closeModal }) => {
    const [selectedDate1, setSelectedDate1] = useState(null);
    const [selectedDate2, setSelectedDate2] = useState(null);
    const [selectedDate3, setSelectedDate3] = useState(null);

    return (
        <Modal isOpen={isModalOpen}
            onRequestClose={closeModal}
            className={clsx(styles.modal)}
            ariaHideApp={false}
        >
            <SectionTitle style={{ fontSize: "24px" }}>Thông tin xuất kho chi tiết</SectionTitle>
            {/* Thêm nội dung modal ở đây */}
            <button className={clsx(styles.modalClose)} onClick={closeModal}>
                <AiOutlineClose style={{ fontWeight: "bold" }} />
            </button>
            <div style={{ display: "flex" }}>

                <div style={{ display: "flex", flexDirection: "column", width: "50%" }}>

                    <FormGroup style={{ position: "relative", marginBottom: 0 }}>
                        <Label style={{ width: "35%", marginLeft: "30px" }}>Mã lô xuất kho:</Label>
                        <input type="text" style={{
                            border: "1px solid #767676",
                            borderRadius: "6px",
                            padding: "5px 50px 5px 10px",
                            width: "50.3%"
                        }}
                        />
                        <button style={{
                            width: "20px",
                            position: "absolute",
                            right: "0",
                            marginRight: "10%"
                        }}>
                            <img src={QRicon} alt="QR Icon" />
                        </button>

                    </FormGroup>

                    <TextNote>*Nhập hoặc quét mã lô hàng</TextNote>

                    <FormGroup>
                        <Label style={{ width: "35%", marginLeft: "30px" }}>Khách hàng:</Label>
                        <SelectContainer>
                            <Select defaultValue="" style={{ width: "88.5%" }}>
                                <option value="" disabled>Chọn khách hàng</option>
                                {listCustomers.map((customer, index) => (
                                    <option value={`customer${index}`}>
                                        {customer}
                                    </option>
                                ))}
                            </Select>
                            <DropdownIcon style={{ right: "15%" }}><FaChevronDown size={12} /></DropdownIcon>
                        </SelectContainer>
                    </FormGroup>

                </div>

                <div style={{ display: "flex", flexDirection: "column", width: "50%" }}>
                    <FormGroup style={{ position: "relative" }}>
                        <Label style={{ width: "36.3%", marginLeft: "10px" }}>Tổng số lượng:</Label>
                        <input type="text" style={{
                            border: "1px solid #767676",
                            borderRadius: "6px",
                            padding: "5px 50px 8px 10px",
                            width: "53.5%"
                        }}
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label style={{ width: "35%", marginLeft: "10px" }}>Ngày xuất kho:</Label>
                        <SelectContainer>
                            <DateInput style={{ width: "86%", left: "2%" }}
                                selectedDate={selectedDate1}
                                onChange={setSelectedDate1}
                            />
                        </SelectContainer>
                    </FormGroup>

                </div>

            </div>

            <SectionTitle style={{ textAlign: 'left', margin: "0px 30px" }}>Thông tin sản phẩm</SectionTitle>

            <FormSection style={{ margin: "0px 10px 10px", backgroundColor: "#F5F5F5", height: "182px", padding: "10px" }}>
                <div style={{ marginBottom: 0, display: "flex" }}>
                    <div style={{ display: "flex", flexDirection: "column", width: "50%" }}>
                        <FormGroup style={{ marginLeft: "10px" }}>
                            <Label style={{ width: "38%" }}>Sản phẩm:</Label>
                            <SelectContainer>
                                <Select defaultValue="" style={{ width: "88.5%" }}>
                                    <option value="" disabled>Chọn sản phẩm</option>
                                    {listMaterials.map((material, index) => (
                                        <option value={`material${index}`}>
                                            {material.name}
                                        </option>
                                    ))}
                                </Select>
                                <DropdownIcon style={{ right: "15%" }}><FaChevronDown size={12} /></DropdownIcon>
                            </SelectContainer>
                        </FormGroup>

                        <FormGroup style={{ marginLeft: "10px" }}>
                            <Label style={{ width: "38%" }}>Đơn vị tính:</Label>
                            <SelectContainer>
                                <Select defaultValue="" style={{ width: "88.5%" }}>
                                    <option value="" disabled>Chọn ĐVT</option>
                                    {listUnitOfMeasures.map((unitOfMeasure, index) => (
                                        <option value={`unitOfMeasures${index}`}>
                                            {unitOfMeasure}
                                        </option>
                                    ))}
                                </Select>
                                <DropdownIcon style={{ right: "15%" }}><FaChevronDown size={12} /></DropdownIcon>
                            </SelectContainer>
                        </FormGroup>

                        <FormGroup style={{ marginLeft: "10px" }}>
                            <Label style={{ width: "36.6%" }}>Ngày sản xuất:</Label>
                            <SelectContainer>
                                <DateInput style={{ width: "86.5%", left: "2%" }}
                                    selectedDate={selectedDate2}
                                    onChange={setSelectedDate2}
                                />
                            </SelectContainer>
                        </FormGroup>

                    </div>

                    <div style={{ display: "flex", flexDirection: "column", width: "50%" }}>
                        <FormGroup style={{ marginLeft: "10px" }}>
                            <Label style={{ width: "39%" }}>Mã sản phẩm:</Label>
                            <SelectContainer>
                                <Select defaultValue="" style={{ width: "96.5%" }}>
                                    <option value="" disabled>Chọn mã sản phẩm</option>
                                    {listMaterials.map((material, index) => (
                                        <option value={`material${index}`}>
                                            {material.code}
                                        </option>
                                    ))}
                                </Select>
                                <DropdownIcon style={{ right: "15%" }}><FaChevronDown size={12} /></DropdownIcon>
                            </SelectContainer>
                        </FormGroup>

                        <FormGroup style={{ position: "relative" }}>
                            <Label style={{ width: "37.6%", marginLeft: "10px" }}>Ghi chú:</Label>
                            <input type="text" style={{
                                border: "1px solid #767676",
                                borderRadius: "6px",
                                padding: "5px 50px 8px 10px",
                                width: "57.7%"
                            }}
                            />
                        </FormGroup>

                        <FormGroup>
                            <Label style={{ width: "36.5%", marginLeft: "10px" }}>Hạn sử dụng:</Label>
                            <SelectContainer>
                                <DateInput style={{ width: "95%", left: "2%" }}
                                    selectedDate={selectedDate3}
                                    onChange={setSelectedDate3}
                                />
                            </SelectContainer>
                        </FormGroup>
                    </div>
                </div>
            </FormSection>

            <SectionTitle style={{ textAlign: 'left', margin: "0px 30px" }}>Phân bố vị trí lấy hàng</SectionTitle>

            <ListSection style={{ padding: 0 }}>
                <div style={{ overflowX: 'auto' }}>
                    <Table>
                        <thead>
                            <tr>
                                <TableHeader>STT</TableHeader>
                                <TableHeader>Mã lô hàng</TableHeader>
                                <TableHeader>Vị trí lưu trữ</TableHeader>
                                <TableHeader>Số lượng hiện có</TableHeader>
                                <TableHeader>Số lượng xuất kho</TableHeader>
                                <TableHeader></TableHeader>
                            </tr>
                        </thead>
                        <tbody>
                            {listIssueStorageMaterials.map((item) => (
                                <tr key={item.id}>
                                    <TableCell>{item.id}</TableCell>
                                    <TableCell>{item.poNumber}</TableCell>
                                    <TableCell>{item.location}</TableCell>
                                    <TableCell>{item.storeQuantity}</TableCell>
                                    <TableCell>{item.issueQuantity}</TableCell>
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

            <ActionButton style={{ width: "35%", height: "10%" }}>Chấp nhận</ActionButton>

        </Modal>
    );
};

export default InforIssueModal;