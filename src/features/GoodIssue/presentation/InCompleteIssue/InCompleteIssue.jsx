import React, { useEffect, useState, useRef } from 'react';
import { FaTrash } from 'react-icons/fa';
import 'react-datepicker/dist/react-datepicker.css';
import TabContainer from '../../../../common/components/Tab/TabContainer.jsx';
import ActionButton from '../../../../common/components/Button/ActionButton/ActionButton.jsx';
import IssueDistribution from './IssueDistribution/IssueDistribution.jsx';
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
import { toast } from "react-toastify"; // Import toast for notifications
import "react-toastify/dist/ReactToastify.css";
import issueSubLotApi from '../../../../api/issueSubLotApi.js';

const InCompleteIssue = ({ onButtonClick, onWarehouseChange, isComingFromViewResult }) => {
    
    const [issueLots, setIssueLots] = useState([]);
    const [selectedWarehouse, setSelectedWarehouse] = useState(null);
    const [warehouses, setWarehouses] = useState([]);
    const [warehouseId, setWarehouseId] = useState(null);
    const [loadingScheduling, setLoadingScheduling] = useState(false);
    const [loadingIssueLot, setLoadingIssueLot] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    const [updatedItems, setUpdatedItems] = useState([]);
    const [isUpdating, setIsUpdating] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteIndex, setDeleteIndex] = useState(null);
    const [prevWarehouseId, setPrevWarehouseId] = useState(null);

    console.log("updatedItems", updatedItems);


    // Remove dataFetchedRef since we want to fetch data every time warehouse changes
    const schedulingFetchedRef = useRef({});

    // Update warehouse change effect
    useEffect(() => {
        if (selectedWarehouse && onWarehouseChange) {
            const warehouseId = warehouses.find(warehouse => warehouse.warehouseName === selectedWarehouse)?.warehouseId;
            setWarehouseId(warehouseId);
            if (warehouseId) {
                onWarehouseChange(warehouseId);
                // Save previous warehouse ID
                setPrevWarehouseId(warehouseId);
            }
        }
    }, [selectedWarehouse, warehouses, onWarehouseChange]);

    // Function to fetch issue detail scheduling
    const fetchIssueDetailScheduling = async(skipAPICall = false) => {
        if (!selectedWarehouse) return;
        
        const warehouseId = warehouses.find(warehouse => warehouse.warehouseName === selectedWarehouse)?.warehouseId;
        if (!warehouseId) return;

        // Skip API call if:
        // 1. Coming from viewResult AND
        // 2. We have data for this warehouse AND
        // 3. The warehouse hasn't changed
        if (isComingFromViewResult && 
            schedulingFetchedRef.current[warehouseId] && 
            warehouseId === prevWarehouseId) {
            return;
        }
        
        setLoadingScheduling(true);
        try {
            const issueDetailSchedulingData = await schedulingApi.getIssueDetailScheduling(warehouseId);
            
            // Initialize updated items with the fetched data
            const initialUpdatedItems = issueDetailSchedulingData.map(item => ({
                issueSublotId: item.issueSublotId || "",
                materialId: item.materialId || "",
                materialName: item.materialName || "",
                requestedQuantity: item.requestedQuantity || 0,
                locationId: item.locationId || "",
                lotNumber: item.lotNumber || "",
                materialSubLotId: item.materialSubLotId || "",
                issueLotId: item.issueLotId || "",
            }));
            setUpdatedItems(initialUpdatedItems);
            toast.success("Thực hiện giải thuật thành công!", {
                            position: "top-right",
                            autoClose: 3000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                        });
            // Mark this warehouse's data as fetched
            schedulingFetchedRef.current[warehouseId] = true;
        } catch {
                       toast.error("Thực hiện giải thuật thất bại", {
                           position: "top-right",
                           autoClose: 3000,
                           hideProgressBar: false,
                           closeOnClick: true,
                           pauseOnHover: true,
                           draggable: true,
                           progress: undefined,
                       });
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

    // Handle tab change
    const handleTabChange = (tabIndex) => {
        setActiveTab(tabIndex);
    };
    
    // Handle changes to editable fields
    const handleItemChange = (index, field, value) => {
        // Update the data for API submission
        const updatedItemsList = [...updatedItems];
        updatedItemsList[index][field] = value;
        setUpdatedItems(updatedItemsList);
    };
    
    // Function to delete an item from the list
    const deleteItem = (index) => {
        setDeleteIndex(index);
        setShowDeleteModal(true);
    };
    
    // Confirm deletion
    const confirmDelete = () => {
        if (deleteIndex !== null) {
            const updatedItemsList = [...updatedItems];
            updatedItemsList.splice(deleteIndex, 1);
            setUpdatedItems(updatedItemsList);
            setShowDeleteModal(false);
            setDeleteIndex(null);
        }
    };
    
    // Cancel deletion
    const cancelDelete = () => {
        setShowDeleteModal(false);
        setDeleteIndex(null);
    };
    
    // Function to update issue sublots
    const updateIssueSubLots = async () => {
        setIsUpdating(true);
        
        try {
            const updatedIssueSubLot = {
                issueSubLots: updatedItems.map(item => ({
                    issueSublotId: item.issueSublotId,
                    issueLotId: item.issueLotId,
                    requestedQuantity: item.requestedQuantity,
                    materialSubLotId: item.materialSubLotId,
                    lotNumber: item.lotNumber
                }))
            }
            
            // Call API to update the issue sublots
            await issueSubLotApi.updateIssueSubLot(updatedIssueSubLot);
            toast.success("Duyệt danh sách xuất kho thành công!", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
            
            // Reset all form values and data
            setUpdatedItems([]);
            setSelectedWarehouse(null);
            setWarehouseId(null);
            setIssueLots([]);
            setActiveTab(0);
            setDeleteIndex(null);
            setShowDeleteModal(false);
            // Reset the scheduling fetched reference to trigger new data fetch
            schedulingFetchedRef.current = {};
        } catch (error) {
            console.error("Error updating issue sublots:", error);
            toast.error("Duyệt thất bại", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        } finally {
            setIsUpdating(false);
        }
    };
        
    return (
        <div>
            <TabContainer
                tabs={[
                    { label: 'Danh sách xuất kho' },
                    { label: 'Sơ đồ phân bổ' }
                ]}
                activeTab={activeTab}
                onTabChange={handleTabChange}
            />

            {activeTab === 0 && (
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
                                            <option key={`warehouse-${index}`} value={warehouse.warehouseName}> 
                                                {warehouse.warehouseName}
                                            </option>
                                        ))}
                                    </Select>
                                </SelectContainer>
                            </FormGroup>

                            <SectionTitle style={{fontSize: "100%", padding: "10px", marginBottom: 0}}>
                                Danh sách lô xuất kho chưa hoàn thành
                            </SectionTitle>
                            
                            <div style={{flex: 1, overflow: "auto", minHeight: 0}}>
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
                            <SectionTitle>Kết quả phân bổ vị trí lấy hàng cho các lô xuất kho</SectionTitle>

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
                                                            value={item.requestedQuantity || 0}
                                                            onChange={(e) => handleItemChange(index, 'requestedQuantity', parseInt(e.target.value) || 0)}
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
                                                        <DeleteButton onClick={() => deleteItem(index)}>
                                                            <FaTrash size={15} color="#000" />
                                                        </DeleteButton>
                                                    </TableCell>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                )}
                            </div>

                            <div style={{ display: 'flex', marginTop: "10%" }}>
                                <ActionButton 
                                    onClick={updateIssueSubLots}
                                    disabled={isUpdating}
                                >
                                    Duyệt danh sách xuất kho
                                </ActionButton>
                            </div>
                        </ListSection>
                    </ContentContainer>
                    
                    {/* Delete Confirmation Modal */}
                    {showDeleteModal && (
                        <div style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            zIndex: 1000
                        }}>
                            <div style={{
                                backgroundColor: 'white',
                                padding: '20px',
                                borderRadius: '8px',
                                width: '300px',
                                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
                            }}>
                                <h4 style={{marginTop: 0}}>Xác nhận xóa</h4>
                                <p>Bạn có chắc chắn muốn xóa mục này không?</p>
                                <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px'}}>
                                    <button 
                                        onClick={cancelDelete}
                                        style={{
                                            padding: '8px 16px',
                                            border: '1px solid #ccc',
                                            borderRadius: '4px',
                                            backgroundColor: '#f5f5f5',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Hủy
                                    </button>
                                    <button 
                                        onClick={confirmDelete}
                                        style={{
                                            padding: '8px 16px',
                                            border: 'none',
                                            borderRadius: '4px',
                                            backgroundColor: '#dc3545',
                                            color: 'white',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Xóa
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 1 && (
                <IssueDistribution 
                    warehouseId={warehouseId} 
                    isActive={activeTab === 1}
                />
            )}
        </div>
    );
};

export default InCompleteIssue;