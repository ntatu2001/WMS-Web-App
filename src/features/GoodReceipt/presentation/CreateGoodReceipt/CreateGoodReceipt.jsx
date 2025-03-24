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
import InforReceiptModal from '../InforModal/InforReceiptModal.jsx';
import { listReceiptMaterials } from '../../../../app/mockData/InventoryReceiptData.js';
import { listWarehouses } from '../../../../app/mockData/WarehouseData.js';
import { listZones } from '../../../../app/mockData/ZoneData.js';
import { listPersons } from '../../../../app/mockData/PersonData.js';
import { listSuppliers } from '../../../../app/mockData/SupplierData.js';

const CreateGoodReceipt = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
          <Label>Nhà cung cấp:</Label>
          <SelectContainer>
            <Select defaultValue="">
              <option value="" disabled>Chọn nhà cung cấp</option>
              {listSuppliers.map((supplier, index) => (
                <option value={`supplier${index}`}>
                  {supplier}
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
              <TableHeader style={{ width: '40px' }}>STT</TableHeader>
              <TableHeader>Tên sản phẩm</TableHeader>
              <TableHeader>Mã sản phẩm</TableHeader>
              <TableHeader style={{ width: '60px' }}>ĐVT</TableHeader>
              <TableHeader>Mã lô/Số PO</TableHeader>
              <TableHeader>Số lượng nhập</TableHeader>
              <TableHeader style={{ width: '120px' }}>Chi tiết nhập kho</TableHeader>
              <TableHeader style={{ width: '50px' }}></TableHeader>
            </tr>
          </thead>
          <tbody>
            {listReceiptMaterials.map(item => (
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
        <InforReceiptModal isModalOpen={isModalOpen} closeModal={closeModal} style={{ width: '50%' }} />

        <ActionButton style={{ marginTop: '2.75rem' }}>Duyệt danh sách nhập kho</ActionButton>
      </ListSection>
    </ContentContainer>
  );
};

export default CreateGoodReceipt; 