import React, { useEffect, useState } from 'react';
import { FaTrash } from 'react-icons/fa';
import 'react-datepicker/dist/react-datepicker.css';
import TabContainer from '../../../../common/components/Tab/TabContainer.jsx';
import ActionButton from '../../../../common/components/Button/ActionButton/ActionButton.jsx';
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
import styles from './InCompleteIssue.module.scss'
import { listIssueMaterials } from '../../../../app/mockData/InventoryIssueData.js';
import issueLotApi from '../../../../api/issueLotApi.js';
import inventoryIssueEntryApi from '../../../../api/inventoryIssueEntryApi.js';
import wareHouseApi from '../../../../api/wareHouseApi.js';

const InCompleteIssue = () => {
    
    const [issueEntries, setIssueEntries] = useState([]);
    const [selectedWarehouse, setSelectedWarehouse] = useState(null);
    const [warehouses, setWarehouses] = useState([]);

    useEffect(() => {
        const fetchIssueLot = async() => {
            const issueLotList = await issueLotApi.getIssueLotsNotDone();
            const issueOptionsList = await issueLotList.map(x => x.inventoryIssueEntryId);
            const issueEntryOptions = await Promise.all(issueOptionsList.map(id => inventoryIssueEntryApi.getIssueEntryById(id)));
            const wareHouseList = await wareHouseApi.getAllWareHouses();
            setIssueEntries(issueEntryOptions);
            setWarehouses(wareHouseList);
            
        };

        fetchIssueLot();
    }, []);
    console.log(issueEntries);
    // Lọc receiptLots dựa trên selectedWarehouse
    const filteredIssueLots = selectedWarehouse 
        ? issueEntries.filter(item => item.warehouseName === selectedWarehouse)
        : issueEntries;
        
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

                            <SectionTitle style={{fontSize: "18px", padding: "10px", marginBottom: 0}} >Danh sách lô xuất kho chưa hoàn thành</SectionTitle>
                            
                            <div style={{height: "85%", overflow: "auto"}}>
                                {filteredIssueLots.map((item) => (
                                    <div className={clsx(styles.divOfList)}
                                        key={item.issueLotId}
                                        
                                    >
                                        <div style={{display: "flex", marginRight: "3%", justifyContent: "space-between"}}>
                                            <LabelSmallSize>Mã lô:</LabelSmallSize>
                                            <span style={{marginTop: "2px", fontSize: "14px", fontWeight: 500}}>{item.lotNumber}</span>
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
                                            <LabelSmallSize>Số lượng xuất kho:</LabelSmallSize>
                                            <span style={{marginTop: "2px", fontSize: "14px", fontWeight: 500}}>{item.requestedQuantity}</span>
                                        </div>  

    
                                    </div>
                                ))}

                            </div>
                        </FormSection>

                        <ListSection>
           
                                <SectionTitle>Vị trí lưu kho cho các lô xuất kho</SectionTitle>

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
                                        {listIssueMaterials.map(item => (
                                            <tr key={item.id}>
                                                <TableCell>{item.id}</TableCell>
                                                <TableCell>{item.name}</TableCell>
                                                <TableCell>{item.code}</TableCell>
                                                <TableCell>{item.unit}</TableCell>
                                                <TableCell>{item.lotPo}</TableCell>
                                                <TableCell>{item.quantity}</TableCell>
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

export default InCompleteIssue;