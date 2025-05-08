import React, { useEffect, useState, useRef } from 'react';
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
import issueLotApi from '../../../../api/issueLotApi.js';
import inventoryIssueEntryApi from '../../../../api/inventoryIssueEntryApi.js';
import wareHouseApi from '../../../../api/wareHouseApi.js';
import { ClipLoader} from 'react-spinners';
import schedulingApi from '../../../../api/schedulingApi.js';

const InCompleteIssue = ({ onButtonClick, onWarehouseChange }) => {
    
    const [issueLots, setIssueLots] = useState([]);
    const [selectedWarehouse, setSelectedWarehouse] = useState(null);
    const [warehouses, setWarehouses] = useState([]);
    const [warehouseId, setWarehouseId] = useState(null);
    const [issueDetailScheduling, setIssueDetailScheduling] = useState([]);
    const [loadingScheduling, setLoadingScheduling] = useState(false);
    const [loadingIssueLot, setLoadingIssueLot] = useState(false);
    
    // Remove dataFetchedRef since we want to fetch data every time warehouse changes
    const schedulingFetchedRef = useRef({});

    // Update the parent component when selected warehouse changes
    useEffect(() => {
        if (selectedWarehouse && onWarehouseChange) {
            const warehouseId = warehouses.find(warehouse => warehouse.warehouseName === selectedWarehouse)?.warehouseId;
            setWarehouseId(warehouseId);
            if (warehouseId) {
                onWarehouseChange(warehouseId);
            }
        }
    }, [selectedWarehouse, warehouses, onWarehouseChange]);

    // Function to fetch issue detail scheduling
    const fetchIssueDetailScheduling = async() => {
        if (!warehouseId) return;
        
        // Skip if we already fetched data for this warehouse
        if (schedulingFetchedRef.current[warehouseId]) {
            return;
        }
        
        setLoadingScheduling(true);
        try {
            const issueDetailScheduling = await schedulingApi.getIssueDetailScheduling(warehouseId);
            setIssueDetailScheduling(issueDetailScheduling);
            // Mark this warehouse's data as fetched
            schedulingFetchedRef.current[warehouseId] = true;
        } catch (error) {
            console.error("Error fetching issue detail scheduling:", error);
        } finally {
            setLoadingScheduling(false);
        }
    };

    // Make the function available to parent component via prop
    useEffect(() => {
        if (onButtonClick) {
            onButtonClick(fetchIssueDetailScheduling);
        }
    }, [onButtonClick, warehouseId]);
    
    useEffect(() => {
        const fetchIssueLot = async() => {
            if (!warehouseId) return;
            
            setLoadingIssueLot(true);
            try {
                const issueLotList = await issueLotApi.getIssueLotsNotDone(warehouseId);
                const issueOptionsList = await issueLotList.map(x => x.inventoryIssueEntryId);
                const issueEntryOptions = await Promise.all(issueOptionsList.map(id => inventoryIssueEntryApi.getIssueEntryById(id)));
                setIssueLots(issueEntryOptions);
            } catch (error) {
                console.error("Error fetching issue lot data:", error);
            } finally {
                setLoadingIssueLot(false);
            }
        };

        fetchIssueLot();
    }, [warehouseId]); // Add warehouseId as dependency

    // Separate useEffect for initial warehouse list fetch
    useEffect(() => {
        const fetchWarehouses = async() => {
            try {
                const wareHouseList = await wareHouseApi.getAllWareHouses();
                setWarehouses(wareHouseList);
            } catch (error) {
                console.error("Error fetching warehouse data:", error);
            }
        };

        fetchWarehouses();
    }, []); // Only fetch warehouses once on component mount
    
    // Filter issueLots based on selectedWarehouse
    const filteredIssueLots = selectedWarehouse 
        ? issueLots.filter(item => item.warehouseName === selectedWarehouse)
        : issueLots;
        
    // Handle warehouse selection change
    const handleWarehouseChange = (e) => {
        const warehouseName = e.target.value;
        setSelectedWarehouse(warehouseName);
    };
        
    return (
        <div style={{display: "flex"}}>
            <ContentContainer style={{maxHeight: "700px"}}>
                <FormSection style={{height: "100%"}}>
                    <FormGroup>
                        <Label style={{fontWeight: "bold"}}>Kho hàng:</Label>
                        <SelectContainer>
                            <Select 
                                value={selectedWarehouse} 
                                onChange={handleWarehouseChange} 
                                required
                            >
                                <option value="" disabled selected>Chọn loại kho hàng</option>
                                {warehouses.map((warehouse, index) => (
                                    <option key={`warehouse-${index}`} value={warehouse.warehouseName}> 
                                        {warehouse.warehouseName}
                                    </option>
                                ))}
                            </Select>
                            <DropdownIcon><FaChevronDown size={12} /></DropdownIcon>
                        </SelectContainer>
                    </FormGroup>

                    <SectionTitle style={{fontSize: "18px", padding: "10px", marginBottom: 0}}>
                        Danh sách lô xuất kho chưa hoàn thành
                    </SectionTitle>
                    
                    <div style={{height: "85%", overflow: "auto"}}>
                        {loadingIssueLot ? (
                            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                                <ClipLoader size={35} color="#0066CC" />
                            </div>
                        ) : (
                            filteredIssueLots.map((item) => (
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
                            ))
                        )}
                    </div>
                </FormSection>

                <ListSection>
                    <SectionTitle>Vị trí lấy hàng cho các lô xuất kho</SectionTitle>

                    <div style={{maxHeight: "400px", overflowY: "scroll"}}>
                        {loadingScheduling ? (
                            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "200px" }}>
                                <ClipLoader size={35} color="#0066CC" />
                            </div>
                        ) : (
                            <Table>
                                <thead>
                                    <tr>
                                        <TableHeader style={{ width: '1%' }}>STT</TableHeader>
                                        <TableHeader>Vị trí lưu trữ</TableHeader>
                                        <TableHeader>Mã lô</TableHeader>
                                        <TableHeader style={{ width: '25%' }}>Tên sản phẩm</TableHeader>
                                        <TableHeader style={{width : "15%"}}>Mã sản phẩm</TableHeader>
                                        <TableHeader style={{width: "20%"}}>Số lượng lấy</TableHeader>
                                        <TableHeader style={{ width: '50px' }}></TableHeader>
                                    </tr>
                                </thead>
                                <tbody> 
                                    {issueDetailScheduling.map((item, index) => (
                                        <tr key={index}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>{item.locationId}</TableCell>
                                            <TableCell>{item.lotNumber}</TableCell>
                                            <TableCell>{item.materialName}</TableCell>
                                            <TableCell>{item.materialId}</TableCell>
                                            <TableCell>{item.requestedQuantity}</TableCell>
                                            <TableCell>
                                                <DeleteButton>
                                                    <FaTrash size={15} color="#000" />
                                                </DeleteButton>
                                            </TableCell>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        )}
                    </div>

                    <ActionButton style={{ marginTop: "10%" }}>Duyệt danh sách xuất kho</ActionButton>
                </ListSection>
            </ContentContainer>
        </div>
    );
};

export default InCompleteIssue;