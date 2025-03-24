import React, { useState } from 'react';
import { FaEye, FaChevronDown } from 'react-icons/fa';
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
import FaEyeButton from '../../../../common/components/Button/FaEyeButton/FaEyeButton.jsx';
import clsx from 'clsx';
import styles from './CreateGoodReceipt.module.scss';
import InforModal from '../InforModal/InforModal.jsx';

const CreateGoodReceipt = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Mock data for the table
  const importItems = [
    { id: 1, name: 'Keo chemtok 250', code: 'AD01001', unit: 'Kg', lotPo: 'NVL02', quantity: 15 },
    { id: 2, name: 'Hạt nhựa PP AV161', code: 'PLPP001', unit: 'Kg', lotPo: 'NAM104', quantity: 100 },
    { id: 3, name: 'Dầu Tuclalen 13W', code: 'PO04001', unit: 'Kg', lotPo: 'PETRO21', quantity: 30 },
    { id: 4, name: 'Cao Su EPDM 512F', code: 'RB01004', unit: 'Kg', lotPo: 'CS202', quantity: 200 },
    { id: 5, name: 'Nhựa thông', code: 'PA01003', unit: 'Kg', lotPo: 'NT331', quantity: 5 },
    { id: 6, name: 'Chất hóa dẻo', code: 'PA02001', unit: 'Kg', lotPo: 'HCD41', quantity: 50 },
    { id: 7, name: 'Dây dại xanh 2.0', code: 'SD01B20', unit: 'Met', lotPo: 'STD17', quantity: 150 },
  ];

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <ContentContainer>
      {/* Left Section - Import Form */}
      <FormSection>
        <SectionTitle>Phiếu nhập kho</SectionTitle>
        
        <FormGroup>
          <Label>Kho hàng:</Label>
          <SelectContainer>
            <Select defaultValue="">
              <option value="" disabled>Chọn loại kho hàng</option>
              <option value="warehouse1">Kho nguyên liệu</option>
              <option value="warehouse2">Kho thành phẩm</option>
              
            </Select>
            <DropdownIcon><FaChevronDown size={12} /></DropdownIcon>
          </SelectContainer>
        </FormGroup>
        
        <FormGroup>
          <Label>Khu vực:</Label>
          <SelectContainer>
            <Select defaultValue="">
              <option value="" disabled>Chọn loại khu vực</option>
              <option value="area1">Khu A</option>
              <option value="area2">Khu B</option>
              <option value="area3">Khu C</option>
            </Select>
            <DropdownIcon><FaChevronDown size={12} /></DropdownIcon>
          </SelectContainer>
        </FormGroup>
        
        <FormGroup>
          <Label>Nhà cung cấp:</Label>
          <SelectContainer>
            <Select defaultValue="">
              <option value="" disabled>Chọn nhà cung cấp</option>
              <option value="supplier1">Công ty ABC</option>
              <option value="supplier2">Công ty XYZ</option>
            </Select>
            <DropdownIcon><FaChevronDown size={12} /></DropdownIcon>
          </SelectContainer>
        </FormGroup>
        
        <FormGroup>
          <Label>Nhân viên:</Label>
          <SelectContainer>
            <Select defaultValue="">
              <option value="" disabled>Chọn nhân viên</option>
              <option value="employee1">Nguyễn Văn A</option>
              <option value="employee2">Trần Thị B</option>
            </Select>
            <DropdownIcon><FaChevronDown size={12} /></DropdownIcon>
          </SelectContainer>
        </FormGroup>
        
        <FormGroup>
          <Label>Ngày nhập kho:</Label>
          <SelectContainer>
            <DateInput 
              selectedDate={selectedDate}
              onChange={setSelectedDate}
            />
          </SelectContainer>
        </FormGroup>
        
        <ActionButton>Tạo phiếu</ActionButton>
      </FormSection>
      
      {/* Right Section - Import List */}
      <ListSection>
        <SectionTitle>Danh sách nhập kho</SectionTitle>
        
        <Table>
          <thead>
            <tr>
              <TableHeader style={{width: '40px'}}>STT</TableHeader>
              <TableHeader>Tên sản phẩm</TableHeader>
              <TableHeader>Mã sản phẩm</TableHeader>
              <TableHeader style={{width: '60px'}}>ĐVT</TableHeader>
              <TableHeader>Mã lô/Số PO</TableHeader>
              <TableHeader>Số lượng nhập</TableHeader>
              <TableHeader style={{width: '120px'}}>Chi tiết nhập kho</TableHeader>
              <TableHeader style={{width: '50px'}}></TableHeader>
            </tr>
          </thead>
          <tbody>
            {importItems.map(item => (
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
                  <FaEyeButton>
                    <FaEye size={25} color="#000" />
                  </FaEyeButton>
                </TableCell>
              </tr>
            ))}
          </tbody>
        </Table>
        
        {/* Modal for additional information */}
        <InforModal isModalOpen = {isModalOpen} closeModal = {closeModal} style={{width: '50%'}}/>

        <ActionButton style={{ marginTop: '2.75rem'}}>Duyệt danh sách nhập kho</ActionButton>
      </ListSection>
    </ContentContainer>
  );
};

export default CreateGoodReceipt; 