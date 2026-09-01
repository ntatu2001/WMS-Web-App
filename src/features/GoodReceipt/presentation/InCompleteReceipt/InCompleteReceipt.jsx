import React, { useEffect, useState, useRef, useMemo } from 'react';
import { FaTrash } from 'react-icons/fa';
import 'react-datepicker/dist/react-datepicker.css';
import TabContainer from '../../../../common/components/Tab/TabContainer.jsx';
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
import Tag from '../../../../common/components/Tag/Tag.jsx';
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

const InCompleteReceipt = ({ onButtonClick, onWarehouseChange, isComingFromViewResult, onApproveButtonClick, onUpdatingChange }) => {
    
    const [receiptLots, setReceiptLots] = useState([]);
    const [selectedWarehouse, setSelectedWarehouse] = useState(null);
    const [warehouses, setWarehouses] = useState([]);
    const [warehouseId, setWarehouseId] = useState(null);
    const [receiptDetailScheduling, setReceiptDetailScheduling] = useState([]);
    const [loadingScheduling, setLoadingScheduling] = useState(false);
    const [loadingReceiptLot, setLoadingReceiptLot] = useState(false);
    const [updatedItems, setUpdatedItems] = useState([]);
    const [isUpdating, setIsUpdating] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteIndex, setDeleteIndex] = useState(null);
    const [prevWarehouseId, setPrevWarehouseId] = useState(null);
    const [checkedLotIds, setCheckedLotIds] = useState(new Set());

    // Default: chọn tất cả các lô mỗi khi danh sách lô pending thay đổi (đổi kho / reload / reset sau khi duyệt)
    useEffect(() => {
        setCheckedLotIds(new Set(receiptLots.map(lot => lot.receiptLotId)));
    }, [receiptLots]);

    const toggleLotChecked = (lotId) => {
        setCheckedLotIds(prev => {
            const next = new Set(prev);
            if (next.has(lotId)) {
                next.delete(lotId);
            } else {
                next.add(lotId);
            }
            return next;
        });
    };

    const locationColorPalette = ['#2dd4bf', '#0a1830', '#5980a6', '#dc7010'];
    const locationOrder = useMemo(() => {
        const map = new Map();
        updatedItems.forEach((item) => {
            if (item.locationId && !map.has(item.locationId)) {
                map.set(item.locationId, map.size);
            }
        });
        return map;
    }, [updatedItems]);
    const getLocationColor = (locationId) => {
        if (!locationId || !locationOrder.has(locationId)) return 'transparent';
        return locationColorPalette[locationOrder.get(locationId) % locationColorPalette.length];
    };
    console.log("receiptDetailScheduling", receiptDetailScheduling);
    console.log("updatedItems", updatedItems);
    // Remove dataFetchedRef since we want to fetch data every time warehouse changes
    const schedulingFetchedRef = useRef({});
    
    // Update the parent component when selected warehouse changes
    useEffect(() => {
        if (selectedWarehouse && onWarehouseChange) {
            setWarehouseId(selectedWarehouse);
            onWarehouseChange(selectedWarehouse);
            // Save previous warehouse ID
            setPrevWarehouseId(selectedWarehouse);
        }
    }, [selectedWarehouse, onWarehouseChange]);

    // Function to fetch receipt detail scheduling
    const fetchReceiptDetailScheduling = async(skipAPICall = false) => {
        if (!selectedWarehouse) return;

        const warehouseId = selectedWarehouse;

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
            const receiptDetailScheduling = await schedulingApi.getReceiptDetailScheduling(warehouseId);
            // Chỉ giữ lại kết quả phân bổ của các lô đang được tick chọn ở panel trái
            const filteredScheduling = receiptDetailScheduling.filter(item => checkedLotIds.has(item.lotNumber));
            setReceiptDetailScheduling(filteredScheduling);
            // Initialize updated items with the fetched data
            const initialUpdatedItems = filteredScheduling.map(item => ({
                receiptSubLotId: item.receiptSublotId || "",
                materialId: item.materialId || "",
                materialName: item.materialName || "",
                importedQuantity: item.importedQuantity || 0,
                locationId: item.locationId || "",
                lotNumber: item.lotNumber || ""
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
            onButtonClick(fetchReceiptDetailScheduling);
        }
    }, [onButtonClick, selectedWarehouse, checkedLotIds]);

    // Make the approve action available to parent component via prop
    useEffect(() => {
        if (onApproveButtonClick) {
            onApproveButtonClick(updateReceiptSublots);
        }
    }, [onApproveButtonClick, updatedItems]);

    // Let parent know when the approve action is in flight (to disable its button)
    useEffect(() => {
        if (onUpdatingChange) {
            onUpdatingChange(isUpdating);
        }
    }, [onUpdatingChange, isUpdating]);

    useEffect(() => {
        const fetchReceiptLot = async() => {
            if (!selectedWarehouse) return;
            
            setLoadingReceiptLot(true);
            try {
                const receiptLotList = await receiptLotApi.getReceiptLotsPending(warehouseId);
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
                const wareHouseList = await wareHouseApi.getAllWarehouseNameId();
                setWarehouses(wareHouseList);
            } catch (error) {
                console.error("Error fetching warehouse data:", error);
            }
        };

        fetchWarehouses();
    }, []); // Only fetch warehouses once on component mount
    
    
    // Handle warehouse selection change
    const handleWarehouseChange = (e) => {
        setSelectedWarehouse(e.target.value);
    };

    // Một số kho hàng có thể trùng tên (do mở rộng thêm kho mới), nên cần bổ sung
    // mã kho vào nhãn hiển thị để phân biệt các lựa chọn trùng tên trên Selection Box
    const warehouseNameCounts = useMemo(() => {
        const counts = new Map();
        warehouses.forEach(w => counts.set(w.warehouseName, (counts.get(w.warehouseName) || 0) + 1));
        return counts;
    }, [warehouses]);
    const getWarehouseLabel = (warehouse) =>
        warehouseNameCounts.get(warehouse.warehouseName) > 1
            ? `${warehouse.warehouseName} (${warehouse.warehouseId})`
            : warehouse.warehouseName;
    
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

            // Sau khi phân bổ vị trí xong, chuyển các lô ĐÃ THỰC SỰ được phân bổ trong lượt này
            // (lotNumber xuất hiện trong updatedItems) từ "Pending" sang "InProgress" để chúng
            // hiển thị trong "Quản lý nhập kho". Chỉ xử lý các lô đó, không phải toàn bộ
            // receiptLots đang chờ của kho hàng, vì có thể còn lô chưa được giải thuật phân bổ.
            const approvedLotIds = new Set(updatedItems.map(item => item.lotNumber));
            const lotsToTransition = receiptLots.filter(lot => approvedLotIds.has(lot.receiptLotId));
            const statusResults = await Promise.allSettled(
                lotsToTransition.map(lot =>
                    receiptLotApi.updateReceiptLotStatus({
                        receiptLotId: lot.receiptLotId,
                        receiptLotStatus: "InProgress"
                    })
                )
            );
            statusResults.forEach((result, index) => {
                if (result.status === 'rejected' || result.value === false) {
                    console.error("Failed to update receipt lot status:", lotsToTransition[index]?.receiptLotId, result);
                }
            });

            toast.success("Duyệt danh sách nhập kho thành công!", {
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
            setReceiptLots([]);
            setReceiptDetailScheduling([]);
            setDeleteIndex(null);
            setShowDeleteModal(false);
            // Reset the scheduling fetched reference to trigger new data fetch
            schedulingFetchedRef.current = {};
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
        } finally {
            setIsUpdating(false);
        }
    };
        
    return (
                   <div style={{display: "flex"}}>
                   <ContentContainer style={{maxHeight: "700px"}}>
                        <FormSection style={{height: "100%", display: "flex", flexDirection: "column", flex: "0 0 380px", width: "380px"}}>
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
                                            <option key = {`warehouse-${index}`} value= {warehouse.warehouseId}>
                                            {getWarehouseLabel(warehouse)}
                                            </option>
                                        ))}
                                        </Select>
                                </SelectContainer>
                            </FormGroup>

                            <div style={{display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 10px"}}>
                                <SectionTitle style={{fontSize: "100%", marginBottom: 0}}>Danh sách lô nhập kho</SectionTitle>
                                <Tag variant="neutral">{checkedLotIds.size}/{receiptLots.length} lô</Tag>
                            </div>

                            <div style={{flex: 1, overflow: "auto", minHeight: 0}}>
                                {loadingReceiptLot ? (
                                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                                        <ClipLoader size={35} color="var(--color-teal)" />
                                    </div>
                                ) : (
                                    receiptLots.map((item) => (
                                        <div className={clsx(styles.divOfList)}
                                            key={item.receiptLotId}
                                            
                                        >
                                            <div style={{display: "flex", alignItems: "center", gap: "8px", marginRight: "3%"}}>
                                                <input
                                                    type="checkbox"
                                                    className={styles.lotCheckbox}
                                                    checked={checkedLotIds.has(item.receiptLotId)}
                                                    onChange={() => toggleLotChecked(item.receiptLotId)}
                                                    aria-label={`Chọn lô ${item.receiptLotId}`}
                                                />
                                                <span className={clsx(styles.lotCode)} style={{fontSize: "14px"}}>{item.receiptLotId}</span>
                                            </div>

                                            <div style={{display: "flex", marginRight: "3%", justifyContent: "space-between"}}>
                                                <LabelSmallSize style={{width: "auto", whiteSpace: "nowrap"}}>Sản phẩm:</LabelSmallSize>
                                                <span style={{marginTop: "2px", fontSize: "14px", fontWeight: 500, textAlign: "right"}}>{item.materialName}</span>
                                            </div>

                                            <div style={{display: "flex", marginRight: "3%", justifyContent: "space-between"}}>
                                                <LabelSmallSize>Mã sản phẩm:</LabelSmallSize>
                                                <span style={{marginTop: "2px", fontSize: "14px", fontWeight: 500}}>{item.materialId}</span>
                                            </div>

                                            <div style={{display: "flex", marginRight: "3%", justifyContent: "space-between"}}>
                                                <LabelSmallSize style={{width: "auto", whiteSpace: "nowrap"}}>Số lượng nhập kho:</LabelSmallSize>
                                                <span style={{marginTop: "2px", fontSize: "14px", fontWeight: 500}}>{item.importedQuantity}</span>
                                            </div>

                                            <div style={{display: "flex", marginRight: "3%", justifyContent: "space-between", alignItems: "center"}}>
                                                <LabelSmallSize style={{width: "auto", whiteSpace: "nowrap"}}>Giới hạn tầng lưu trữ:</LabelSmallSize>
                                                <span style={{
                                                    backgroundColor: storageLevel[item.storageLevel],
                                                    color: "white",
                                                    fontWeight: "bold",
                                                    fontSize: "12px",
                                                    padding: "4px 10px",
                                                    borderRadius: "999px",
                                                    }}> Tầng {item.storageLevel}
                                                </span>
                                            </div>

                                        </div>
                                    ))
                                )}
                            </div>
                        </FormSection>

                        <ListSection elevated style={{ height: "100%", display: "flex", flexDirection: "column", flex: "1 1 auto", minWidth: 0 }}>

                                <div style={{display: "flex", alignItems: "center", justifyContent: "space-between"}}>
                                    <SectionTitle style={{marginBottom: 0}}>Kết quả phân bổ vị trí lưu kho cho các lô nhập kho</SectionTitle>
                                    <Tag variant="accent">
                                        Tổng SL lưu trữ: {updatedItems.reduce((sum, item) => sum + (Number(item.importedQuantity) || 0), 0)}
                                    </Tag>
                                </div>

                                <div className={styles.resultTableWrapper} style={{flex: 1, overflow: "auto", minHeight: 0, marginTop: "12px"}}>
                                {loadingScheduling ? (
                                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "200px" }}>
                                        <ClipLoader size={35} color="var(--color-teal)" />
                                    </div>
                                ) : updatedItems.length === 0 ? (
                                    <div className={styles.emptyState}>
                                        Chưa có kết quả phân bổ. Nhấn "Phân bố vị trí lưu kho" để bắt đầu.
                                    </div>
                                ) : (
                                    <Table style={{ minWidth: '900px' }}>
                                        <thead>
                                            <tr>
                                                <TableHeader style={{ width: '48px' }}>STT</TableHeader>
                                                <TableHeader style={{ width: '140px' }}>Vị trí lưu trữ</TableHeader>
                                                <TableHeader style={{ width: '100px' }}>Mã lô</TableHeader>
                                                <TableHeader style={{ width: '260px' }}>Tên sản phẩm</TableHeader>
                                                <TableHeader style={{ width: '150px' }}>Mã sản phẩm</TableHeader>
                                                <TableHeader style={{ width: '150px' }}>Số lượng lưu trữ</TableHeader>
                                                <TableHeader style={{ width: '50px' }}></TableHeader>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {updatedItems.map((item, index) => (
                                                <tr key={index}>
                                                    <TableCell>{index + 1}</TableCell>
                                                    <TableCell style={{ borderLeft: `4px solid ${getLocationColor(item.locationId)}` }}>
                                                        <input
                                                            type="text"
                                                            value={item.locationId || ''}
                                                            onChange={(e) => handleItemChange(index, 'locationId', e.target.value)}
                                                            style={{
                                                                width: '100%',
                                                                padding: '4px',
                                                                border: '1px solid var(--color-border)',
                                                                borderRadius: '4px',
                                                                textAlign: 'center'
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell>{item.lotNumber}</TableCell>
                                                    <TableCell style={{whiteSpace: 'normal'}}>{item.materialName}</TableCell>
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
                                                                border: '1px solid var(--color-border)',
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
                            backgroundColor: 'var(--color-overlay)',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            zIndex: 1000
                        }}>
                            <div style={{
                                backgroundColor: 'var(--color-surface)',
                                padding: '20px',
                                borderRadius: '8px',
                                width: '300px',
                                boxShadow: 'var(--shadow-lg)'
                            }}>
                                <h4 style={{marginTop: 0}}>Xác nhận xóa</h4>
                                <p>Bạn có chắc chắn muốn xóa mục này không?</p>
                                <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px'}}>
                                    <button 
                                        onClick={cancelDelete}
                                        style={{
                                            padding: '8px 16px',
                                            border: '1px solid var(--color-border)',
                                            borderRadius: '4px',
                                            backgroundColor: 'var(--color-surface-2)',
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
                                            backgroundColor: 'var(--status-error)',
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



    
    );
};

export default InCompleteReceipt;