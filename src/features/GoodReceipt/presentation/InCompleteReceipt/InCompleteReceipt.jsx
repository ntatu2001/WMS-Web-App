import React, { useEffect, useState } from 'react';
import { FaTrash } from 'react-icons/fa';
import 'react-datepicker/dist/react-datepicker.css';
import TabContainer from '../../../../common/components/Tab/TabContainer.jsx';
import ActionButton from '../../../../common/components/Button/ActionButton/ActionButton.jsx';
import ResultDistribution from './ReceiptDistribution/ReceiptDistribution.jsx';
import ContentContainer from '../../../../common/components/ContentContainer/ContentContainer.jsx';
import FormSection from '../../../../common/components/Section/FormSection.jsx';
import ListSection from '../../../../common/components/Section/ListSection.jsx';
import FormGroup from '../../../../common/components/FormGroup/FormGroup.jsx';
import Label from '../../../../common/components/Label/Label.jsx';
import LabelSmallSize from '../../../../common/components/Label/LabelSmallSize.jsx';
import SelectContainer from '../../../../common/components/Selection/SelectContainer.jsx';
import Select from '../../../../common/components/Selection/Select.jsx';
import DropdownIcon from '../../../../common/components/Icon/DropdownIcon.jsx';
import Table from '../../../../common/components/Table/Table.jsx';
import TableHeader from '../../../../common/components/Table/TableHeader.jsx';
import TableCell from '../../../../common/components/Table/TableCell.jsx';
import DeleteButton from '../../../../common/components/Button/DeleteButton/DeleteButton.jsx';
import { FaChevronDown } from 'react-icons/fa';
import SectionTitle from '../../../../common/components/Text/SectionTitle.jsx';
import clsx from 'clsx';
import styles from './InCompleteReceipt.module.scss'
import receiptLotApi from '../../../../api/receiptLotApi.js';
import { storageLevel } from '../../../../app/mockData/StorageLevelData.js';
import { LocationOfReceipt } from '../../../../app/mockData/LocationData.js';
import wareHouseApi from '../../../../api/wareHouseApi.js';

const InCompleteReceipt = () => {
    
    const [receiptLots, setReceiptLots] = useState([]);
    const [selectedWarehouse, setSelectedWarehouse] = useState(null);
    const [locationReceipt, setLocationReceipt] = useState([]);
    const [warehouses, setWarehouses] = useState([]);

    useEffect(() => {
        const fetchReceiptLot = async() => {
            const receiptLotList = await receiptLotApi.getReceiptLotByNotDone();
            const wareHouseList = await wareHouseApi.getAllWareHouses();
            setReceiptLots(receiptLotList);
            setLocationReceipt(LocationOfReceipt);
            setWarehouses(wareHouseList);
        };

        fetchReceiptLot();
    }, []);
    
    // Lọc receiptLots dựa trên selectedWarehouse
    const filteredReceiptLots = selectedWarehouse 
        ? receiptLots.filter(item => item.warehouseName === selectedWarehouse)
        : receiptLots;
        
    return (
                   <div style={{display: "flex"}}>
                   <ContentContainer style={{maxHeight: "700px"}}>
                        <FormSection style={{height: "100%"}}>
                            <FormGroup>
                                <Label style={{fontWeight: "bold"}}>Kho hàng:</Label>
                                <SelectContainer>
                                        <Select value={selectedWarehouse} onChange={(e) => setSelectedWarehouse(e.target.value)} required>
                                        <option value="" disabled selected>Chọn loại kho hàng</option>
                                        {warehouses.map((warehouse, index) => (
                                            <option key = {`warehouse-${index}`} value= {warehouse.warehouseName}> 
                                            {warehouse.warehouseName}
                                            </option>
                                        ))}
                                        </Select>
                                        <DropdownIcon><FaChevronDown size={12} /></DropdownIcon>
                                </SelectContainer>
                            </FormGroup>

                            <SectionTitle style={{fontSize: "18px", padding: "10px", marginBottom: 0}} >Danh sách lô nhập kho chưa hoàn thành</SectionTitle>
                            
                            <div style={{height: "85%", overflow: "auto"}}>
                                {filteredReceiptLots.map((item) => (
                                    <div className={clsx(styles.divOfList)}
                                        key={item.receiptLotId}
                                        
                                    >
                                        <div style={{display: "flex", marginRight: "3%", justifyContent: "space-between"}}>
                                            <LabelSmallSize>Mã lô:</LabelSmallSize>
                                            <span style={{marginTop: "2px", fontSize: "14px", fontWeight: 500}}>{item.receiptLotId}</span>
                                        </div>

                                        <div style={{display: "flex", marginRight: "3%", justifyContent: "space-between"}}>
                                            <LabelSmallSize>Sản phẩm:</LabelSmallSize>
                                            <span style={{marginTop: "2px", fontSize: "14px", fontWeight: 500}}>{item.materialName}</span>
                                        </div>

                                        <div style={{display: "flex", marginRight: "3%", justifyContent: "space-between"}}>
                                            <LabelSmallSize>Mã sản phẩm:</LabelSmallSize>
                                            <span style={{marginTop: "2px", fontSize: "14px", fontWeight: 500}}>{item.materialId}</span>
                                        </div>

                                        <div style={{display: "flex", marginRight: "3%", justifyContent: "space-between"}}>
                                            <LabelSmallSize>Số lượng nhập kho:</LabelSmallSize>
                                            <span style={{marginTop: "2px", fontSize: "14px", fontWeight: 500}}>{item.importedQuantity}</span>
                                        </div>  

                                        <div style={{display: "flex", marginRight: "3%", justifyContent: "space-between"}}>
                                            <LabelSmallSize>Giới hạn tầng lưu trữ:</LabelSmallSize>
                                            <span style={{
                                                backgroundColor: storageLevel[item.storageLevel],
                                                color: "white",
                                                fontWeight: "bold",
                                                fontSize: "12px",
                                                padding: "4px 8px",
                                                borderRadius: "4px",
                                                }}> Tầng {item.storageLevel}
                                            </span>
                                        </div>

                                    </div>
                                ))}

                            </div>
                        </FormSection>

                        <ListSection>
           
                                <SectionTitle>Vị trí lưu kho cho các lô nhập kho</SectionTitle>

                                <div style={{maxHeight: "400px", overflowY: "scroll"}}>
                                <Table>
                                    <thead>
                                        <tr>
                                            <TableHeader style={{ width: '1%' }}>STT</TableHeader>
                                            <TableHeader>Vị trí lưu trữ</TableHeader>
                                            <TableHeader>Mã lô</TableHeader>
                                            <TableHeader style={{ width: '25%' }}>Tên sản phẩm</TableHeader>
                                            <TableHeader style={{width : "15%"}}>Mã sản phẩm</TableHeader>
                                            <TableHeader style={{width: "20%"}}>Số lượng lưu trữ</TableHeader>
                                            <TableHeader style={{ width: '50px' }}></TableHeader>
                                        </tr>
                                    </thead>
                                    <tbody> 
                                        {locationReceipt.map((item, index) => (
                                            <tr key={index}>
                                                <TableCell>{index + 1}</TableCell>
                                                <TableCell>{item.locationId}</TableCell>
                                                <TableCell>{item.lotNumber}</TableCell>
                                                <TableCell>{item.materialName}</TableCell>
                                                <TableCell>{item.materialId}</TableCell>
                                                <TableCell>{item.importedQuantity}</TableCell>
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

                                <ActionButton style={{ marginTop: "10%" }}>Duyệt danh sách xuất kho</ActionButton>
                            </ListSection>

                    </ContentContainer>
                   </div>



    
    );
};

export default InCompleteReceipt;