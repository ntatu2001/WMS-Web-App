import React, { useEffect, useState, useRef } from 'react';
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
import wareHouseApi from '../../../../api/wareHouseApi.js';
import { ClipLoader} from 'react-spinners';
import schedulingApi from '../../../../api/schedulingApi.js';
import { toast } from "react-toastify"; // Import toast for notifications
import "react-toastify/dist/ReactToastify.css";
import receiptSubLotApi from '../../../../api/receiptSubLotApi.js';

// import {receiptDetailScheduling as receiptDetailSchedulingData} from '../../../../app/mockData/LocationData.js';

const InCompleteReceipt = ({ onButtonClick, onWarehouseChange }) => {
    
    const [receiptLots, setReceiptLots] = useState([]);
    const [selectedWarehouse, setSelectedWarehouse] = useState(null);
    const [warehouses, setWarehouses] = useState([]);
    const [warehouseId, setWarehouseId] = useState(null);
    const [receiptDetailScheduling, setReceiptDetailScheduling] = useState([]);
    const [loadingScheduling, setLoadingScheduling] = useState(false);
    const [loadingReceiptLot, setLoadingReceiptLot] = useState(false);
    const [updatedItems, setUpdatedItems] = useState([]);
    const [isUpdating, setIsUpdating] = useState(false);
    console.log("receiptDetailScheduling", receiptDetailScheduling);
    console.log("updatedItems", updatedItems);
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

    // Function to fetch receipt detail scheduling
    const fetchReceiptDetailScheduling = async() => {
        if (!selectedWarehouse) return;
        
        const warehouseId = warehouses.find(warehouse => warehouse.warehouseName === selectedWarehouse)?.warehouseId;
        if (!warehouseId) return;
        
        // Skip if we already fetched data for this warehouse
        if (schedulingFetchedRef.current[warehouseId]) {
            return;
        }
        
        setLoadingScheduling(true);
        try {
            const receiptDetailScheduling = await schedulingApi.getReceiptDetailScheduling(warehouseId);
            setReceiptDetailScheduling(receiptDetailScheduling);
            // Initialize updated items with the fetched data
            const initialUpdatedItems = receiptDetailScheduling.map(item => ({
                receiptSubLotId: item.receiptSublotId || "",
                materialId: item.materialId || "",
                materialName: item.materialName || "",
                importedQuantity: item.importedQuantity || 0,
                locationId: item.locationId || "",
                lotNumber: item.lotNumber || ""
            }));
            setUpdatedItems(initialUpdatedItems);
            // Mark this warehouse's data as fetched
            schedulingFetchedRef.current[warehouseId] = true;
        } catch (error) {
            console.error("Error fetching receipt detail scheduling:", error);
        } finally {
            setLoadingScheduling(false);
        }
    };
    
   
    

    // Make the function available to parent component via prop
    useEffect(() => {
        if (onButtonClick) {
            onButtonClick(fetchReceiptDetailScheduling);
        }
    }, [onButtonClick, selectedWarehouse]);
    
    useEffect(() => {
        const fetchReceiptLot = async() => {
            if (!selectedWarehouse) return;
            
            setLoadingReceiptLot(true);
            try {
                const receiptLotList = await receiptLotApi.getReceiptLotByNotDone(warehouseId);
                setReceiptLots(receiptLotList);
            } catch (error) {
                console.error("Error fetching receipt lot data:", error);
            } finally {
                setLoadingReceiptLot(false);
            }
        };

        fetchReceiptLot();
    }, [warehouseId]); // Add selectedWarehouse as dependency

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
    
    
    // Handle warehouse selection change
    const handleWarehouseChange = (e) => {
        const warehouseName = e.target.value;
        setSelectedWarehouse(warehouseName);
    };
    
    // Handle changes to editable fields
    const handleItemChange = (index, field, value) => {
        // Update the data for API submission
        const updatedItemsList = [...updatedItems];
        updatedItemsList[index][field] = value;
        setUpdatedItems(updatedItemsList);
    };
    
    // Function to update receipt sublots
    const updateReceiptSublots = async () => {
        setIsUpdating(true);
        
        try {
            const updatedReceiptSubLot = {
                receiptSubLots: updatedItems.map(item => ({
                    receiptSubLotId: item.receiptSubLotId,
                    materialId: item.materialId,
                    locationId: item.locationId,
                    importedQuantity: item.importedQuantity,
                    lotNumber: item.lotNumber
                }))
            }
            console.log("updatedReceiptSubLot", updatedReceiptSubLot);
            // Call API to update the material lot adjustment
            await receiptSubLotApi.updateReceiptSubLot(updatedReceiptSubLot);
            toast.success("Duyệt danh sách nhập kho thành công!", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
        });
        }
        catch {
            toast.error("Duyệt thất bại", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        }
    };
        
    return (
                   <div style={{display: "flex"}}>
                   <ContentContainer style={{maxHeight: "700px"}}>
                        <FormSection style={{height: "100%", display: "flex", flexDirection: "column"}}>
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
                                            <option key = {`warehouse-${index}`} value= {warehouse.warehouseName}> 
                                            {warehouse.warehouseName}
                                            </option>
                                        ))}
                                        </Select>
                                </SelectContainer>
                            </FormGroup>

                            <SectionTitle style={{fontSize: "100%", padding: "10px", marginBottom: 0}} >Danh sách lô nhập kho chưa hoàn thành</SectionTitle>
                            
                            <div style={{flex: 1, overflow: "auto", minHeight: 0}}>
                                {loadingReceiptLot ? (
                                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                                        <ClipLoader size={35} color="#0066CC" />
                                    </div>
                                ) : (
                                    receiptLots.map((item) => (
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
                                    ))
                                )}
                            </div>
                        </FormSection>

                        <ListSection>
           
                                <SectionTitle>Kết quả phân bổ vị trí lưu kho cho các lô nhập kho</SectionTitle>

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
                                                <TableHeader style={{width: "20%"}}>Số lượng lưu trữ</TableHeader>
                                                <TableHeader style={{ width: '50px' }}></TableHeader>
                                            </tr>
                                        </thead>
                                        <tbody> 
                                            {updatedItems.map((item, index) => (
                                                <tr key={index}>
                                                    <TableCell>{index + 1}</TableCell>
                                                    <TableCell>
                                                        <input
                                                            type="text"
                                                            value={item.locationId || ''}
                                                            onChange={(e) => handleItemChange(index, 'locationId', e.target.value)}
                                                            style={{
                                                                width: '100%',
                                                                padding: '4px',
                                                                border: '1px solid #ccc',
                                                                borderRadius: '4px',
                                                                textAlign: 'center'
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell>{item.lotNumber}</TableCell>
                                                    <TableCell>{item.materialName}</TableCell>
                                                    <TableCell>{item.materialId}</TableCell>
                                                    <TableCell>
                                                        <input
                                                            type="number"
                                                            value={item.importedQuantity || 0}
                                                            onChange={(e) => handleItemChange(index, 'importedQuantity', parseInt(e.target.value) || 0)}
                                                            min="0"
                                                            style={{
                                                                width: '100%',
                                                                padding: '4px',
                                                                border: '1px solid #ccc',
                                                                borderRadius: '4px',
                                                                textAlign: 'center'
                                                            }}
                                                        />
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
                                )}
                                </div>

                                {/* Modal for additional information */}

                                <div style={{ display: 'flex', marginTop: "10%" }}>
                                    <ActionButton 
                                        onClick={updateReceiptSublots}
                                        disabled={isUpdating}
                                        >
                                            Duyệt danh sách nhập kho
                                    </ActionButton>
                                </div>
                            </ListSection>

                    </ContentContainer>
                   </div>



    
    );
};

export default InCompleteReceipt;