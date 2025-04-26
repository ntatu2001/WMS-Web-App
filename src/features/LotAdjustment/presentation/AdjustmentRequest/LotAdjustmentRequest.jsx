import React, { useState } from 'react';
import { FaEye, FaChevronDown } from 'react-icons/fa';
import SectionTitle from '../../../../common/components/Text/SectionTitle.jsx';
import Table from '../../../../common/components/Table/Table.jsx';
import TableHeader from '../../../../common/components/Table/TableHeader.jsx';
import TableCell from '../../../../common/components/Table/TableCell.jsx';
import SelectContainer from '../../../../common/components/Selection/SelectContainer.jsx';
import Select from '../../../../common/components/Selection/Select.jsx';
import FormGroup from '../../../../common/components/FormGroup/FormGroup.jsx';
import ActionButton from '../../../../common/components/Button/ActionButton/ActionButton.jsx';
import ContentContainer from '../../../../common/components/ContentContainer/ContentContainer.jsx';
import DropdownIcon from '../../../../common/components/Icon/DropdownIcon.jsx';
import DateInput from '../../../../common/components/DateInput/DateInput.jsx';
import Label from '../../../../common/components/Label/Label.jsx';
import FormSection from '../../../../common/components/Section/FormSection.jsx';
import ListSection from '../../../../common/components/Section/ListSection.jsx';
import DeleteButton from '../../../../common/components/Button/DeleteButton/DeleteButton.jsx';
import QRicon from '../../../../assets/QRicon.png';
import TextNote from '../../../../common/components/Text/TextNote';
import { AdjustmentType } from '../AdjustmentType/AdjustmentType.jsx';
import { listMaterialLots } from '../../../../app/mockData/MaterialLotData.js';
import { UnitOfMeasure } from '../../../../common/constants/UnitOfMeasure/UnitOfMeasure.js';
import { listMaterials } from '../../../../app/mockData/MaterialData.js';
import { listPersons } from '../../../../app/mockData/PersonData.js';
import { listWarehouses } from '../../../../app/mockData/WarehouseData.js';
import { listZones } from '../../../../app/mockData/ZoneData.js';
import { listLotAdjustments } from '../../../../app/mockData/LotAdjustmentData.js';

const RequestLotAdjustment = () => {
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedDate1, setSelectedDate1] = useState(null);
    const [selectedDate2, setSelectedDate2] = useState(null);
    const [selectedDate3, setSelectedDate3] = useState(null);

    return (
        <ContentContainer>
            {/* Left Section - Import Form */}
            <FormSection>
                <SectionTitle>Yêu cầu kiểm kê</SectionTitle>

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
                    <Label>Lô kiểm kê:</Label>
                    <SelectContainer>
                        <Select defaultValue="">
                            <option value="" disabled>Chọn lô hàng kiểm kê</option>
                            {listMaterialLots.map((materialLot, index) => (
                                <option value={`materiallot${index}`}>
                                    {materialLot}
                                </option>
                            ))}
                        </Select>
                        <DropdownIcon><FaChevronDown size={12} /></DropdownIcon>
                    </SelectContainer>
                </FormGroup>
                
                <FormGroup>
                    <Label>Loại kiểm kê:</Label>
                    <SelectContainer>
                        <Select defaultValue="">
                            <option value="" disabled>Chọn loại kiểm kê</option>
                                    {Object.values(AdjustmentType).map((adjustmentType, index) => (
                                        <option value={`adjustmenttype${index}`}>
                                            {adjustmentType}
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
                    <Label>Ngày thực hiện:</Label>
                    <SelectContainer>
                        <DateInput
                            selectedDate={selectedDate}
                            onChange={setSelectedDate}
                        />
                    </SelectContainer>
                </FormGroup>

                <ActionButton style={{

                }}>Tạo yêu cầu</ActionButton>
            </FormSection>

            {/* Right Section - Import List */}
            <ListSection>
                <SectionTitle>Thông tin kiểm kê chi tiết</SectionTitle>

                <div style={{ display: "flex" }}>

                    <div style={{ display: "flex", flexDirection: "column", width: "50%" }}>

                        <FormGroup style={{ position: "relative", marginBottom: 0 }}>
                            <Label style={{ width: "35%", marginLeft: "30px" }}>Mã lô kiểm kê:</Label>
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
                            <Label style={{ width: "35%", marginLeft: "30px" }}>Loại kiểm kê:</Label>
                            <SelectContainer>
                                <Select defaultValue="" style={{ width: "88.5%" }}>
                                    <option value="" disabled>Chọn loại kiểm kê</option>
                                    {Object.values(AdjustmentType).map((adjustmentType, index) => (
                                        <option value={`adjustmenttype${index}`}>
                                            {adjustmentType}
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
                            <Label style={{ width: "35%", marginLeft: "10px" }}>Ngày thực hiện:</Label>
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
                                        {Object.values(UnitOfMeasure).map((unitOfMeasure, index) => (
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

                <SectionTitle style={{ textAlign: 'left', margin: "0px 30px" }}>Kiểm kê tại vị trí lưu trữ</SectionTitle>

                <ListSection style={{ padding: 0, margin: "1.5%" }}>
                    <div style={{ overflowX: 'auto' }}>
                        <Table>
                            <thead>
                                <tr>
                                    <TableHeader>STT</TableHeader>
                                    <TableHeader>Vị trí lưu trữ</TableHeader>
                                    <TableHeader>Tồn kho</TableHeader>
                                    <TableHeader>Thực tế</TableHeader>
                                    <TableHeader>Chênh lệch</TableHeader>
                                    <TableHeader>Ghi chú</TableHeader>
                                    <TableHeader></TableHeader>
                                </tr>
                            </thead>
                            <tbody>
                                {listLotAdjustments.map((item) => (
                                    <tr key={item.id}>
                                        <TableCell>{item.id}</TableCell>
                                        <TableCell>{item.location}</TableCell>
                                        <TableCell>{item.storedQuantity}</TableCell>
                                        <TableCell>{item.actualQuantity}</TableCell>
                                        <TableCell>{item.differQuantity}</TableCell>
                                        <TableCell>{item.note}</TableCell>
                                        <TableCell>
                                            <DeleteButton>
                                                <FaEye size={25} color="#000" />
                                            </DeleteButton>
                                        </TableCell>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                </ListSection>

                <ActionButton style={{ width: "35%", height: "10%" }}>Duyệt kiểm kê</ActionButton>
            </ListSection>
        </ContentContainer>
    );
};

export default RequestLotAdjustment; 