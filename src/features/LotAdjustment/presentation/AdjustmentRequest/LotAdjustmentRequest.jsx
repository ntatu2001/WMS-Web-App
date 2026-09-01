import React, { useState, useEffect, useMemo } from 'react';
import { FaTrash, FaChevronDown } from 'react-icons/fa';
import clsx from 'clsx';
import SectionTitle from '../../../../common/components/Text/SectionTitle.jsx';
import Table from '../../../../common/components/Table/Table.jsx';
import TableHeader from '../../../../common/components/Table/TableHeader.jsx';
import TableCell from '../../../../common/components/Table/TableCell.jsx';
import SelectContainer from '../../../../common/components/Selection/SelectContainer.jsx';
import Select from '../../../../common/components/Selection/Select.jsx';
import FormGroup from '../../../../common/components/FormGroup/FormGroup.jsx';
import ActionButton from '../../../../common/components/Button/ActionButton/ActionButton.jsx';
import ContentContainer from '../../../../common/components/ContentContainer/ContentContainer.jsx';
import DateInput from '../../../../common/components/DateInput/DateInput.jsx';
import Label from '../../../../common/components/Label/Label.jsx';
import FormSection from '../../../../common/components/Section/FormSection.jsx';
import ListSection from '../../../../common/components/Section/ListSection.jsx';
import DeleteButton from '../../../../common/components/Button/DeleteButton/DeleteButton.jsx';
import Tag from '../../../../common/components/Tag/Tag.jsx';
import wareHouseApi from '../../../../api/wareHouseApi.js';
import employeeApi from '../../../../api/employeeApi.js';
import materialApi from '../../../../api/materialApi.js';
import materialLotApi from '../../../../api/materiaLotApi.js';
import { reasonData, reasonMapData } from '../../../../app/mockData/reasonData.js';
import lotAdjustmentApi from '../../../../api/lotAdjustmentApi.js';
import { adjustmentTypeMap, AdjustmentType } from '../../../../app/mockData/AdjustmentType.js';
import { stockTakeStatusColor } from '../../../../app/mockData/StockTakeStatusData.js';
import materialSubLotApi from '../../../../api/materialSubLotApi.js';
import { getApiErrorMessage } from '../../../../api/apiError.js';
import { toast } from "react-toastify"; // Import toast for notifications
import "react-toastify/dist/ReactToastify.css";
import { ClipLoader} from 'react-spinners';
import styles from './LotAdjustmentRequest.module.scss';

const errorTextStyle = { color: 'var(--status-error)', fontSize: '12px', marginTop: '4px' };

const getVariance = (existingQuantity, realQuantity) => (Number(realQuantity) || 0) - (Number(existingQuantity) || 0);
const getVarianceStatus = (variance) => (variance === 0 ? 'Khớp' : variance < 0 ? 'Thiếu' : 'Dư');

const RequestLotAdjustment = () => {
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedWarehouse, setSelectedWarehouse] = useState(null);
    const [selectedZone, setSelectedZone] = useState(null);
    const [selectedPerson, setSelectedPerson] = useState(null);
    const [selectedLotNumber, setSelectedLotNumber] = useState(null);
    const [selectedReason, setSelectedReason] = useState(null);
    const [selectedLotAdjustmentType, setSelectedLotAdjustmentType] = useState(null);
    const [wareHouses, setWareHouses] = useState([]);
    // Một số kho hàng trùng tên (do mở rộng thêm kho mới), nên chỉ hiển thị mỗi tên 1 lần
    // trên Select "Kho hàng"; việc phân biệt các kho trùng tên do người dùng chọn tiếp ở "Mã kho hàng"
    const uniqueWarehouseNames = useMemo(
        () => Array.from(new Set(wareHouses.map(w => w.warehouseName))),
        [wareHouses]
    );
    const [people, setPeople] = useState([]);
    const [lotNumbers, setLotNumbers] = useState([]);
    const [isDetailsVisible, setIsDetailsVisible] = useState(true);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [material, setMaterial] = useState(null);
    const [unit, setUnit] = useState(null);
    const [note, setNote] = useState(null);
    const [subLots, setSubLots] = useState([]);
    const [realQuantities, setRealQuantities] = useState([]);
    const [lotAdjustmentId, setLotAdjustmentId] = useState(null);
    // Add loading states for different API operations
    const [isInitialLoading, setIsInitialLoading] = useState(false);
    const [isLotLoading, setIsLotLoading] = useState(false);
    const [isLotDetailsLoading, setIsLotDetailsLoading] = useState(false);
    const [isCreateLoading, setIsCreateLoading] = useState(false);
    const [isUpdateLoading, setIsUpdateLoading] = useState(false);
    // Add state for delete confirmation modal
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteIndex, setDeleteIndex] = useState(null);

    useEffect(() => {
        const GetApi = async() => {
            setIsInitialLoading(true);
            try {
                const wareHouseList = await wareHouseApi.getAllWarehouseNameId();
                const employeeList = await employeeApi.getAllEmployeeNameId();

                setPeople(employeeList);
                setWareHouses(wareHouseList);
            } catch (error) {
                console.error("Error fetching initial data:", error);
                toast.error("Không thể tải dữ liệu ban đầu");
            } finally {
                setIsInitialLoading(false);
            }
        };

        GetApi();
      }, []);

    // Khi đổi Kho hàng, tự động chọn Mã kho hàng đầu tiên thuộc kho đó và loại bỏ
    // các mã thuộc kho khác khỏi combo box Mã kho hàng (xem renderOptions bên dưới).
    useEffect(() => {
        if (!selectedWarehouse) {
            setSelectedZone(null);
            return;
        }
        const codesForSelectedWarehouse = wareHouses
            .filter(w => w.warehouseName === selectedWarehouse)
            .map(w => w.warehouseId);
        setSelectedZone(codesForSelectedWarehouse[0] || null);
    }, [selectedWarehouse, wareHouses]);

    useEffect(() => {
        const getMaterialLotList = async() => {
            if (!selectedZone) return;

            setIsLotLoading(true);
            try {
                const lotNumberList = await materialLotApi.GetLotNumbersByWarehouseId(selectedZone);

                setLotNumbers(lotNumberList);
            } catch (error) {
                console.error("Error fetching material lots:", error);
                toast.error("Không thể tải danh sách lô vật tư");
            } finally {
                setIsLotLoading(false);
            }
        }
        getMaterialLotList();
    }, [selectedZone])

    useEffect(() => {
        const getMaterialLotById = async() => {
            try {
                if (selectedLotNumber) {
                    setIsLotDetailsLoading(true);
                    const materialId = await materialLotApi.getMaterialIdByLotNumber(selectedLotNumber);
                    const materialSubLotsByLotNumber = await materialSubLotApi.getMaterialSubLotsByLotNumber(selectedLotNumber);
                    const materialById = await materialApi.getMaterialById(materialId);
                    const unitByMaterialId = await materialApi.getUnitByMaterialId(materialId);
                    const note = materialById?.properties?.find(prop => prop.propertyName?.trim() === "Note")?.propertyValue || "";

                    // Initialize real quantities array with objects containing realQuantity and locationId
                    const initialRealQuantities = materialSubLotsByLotNumber.map(subLot => ({
                        materialSubLotId: subLot.materialSubLotId,
                        previousQuantity: subLot.existingQuantity,
                        realQuantity: subLot.realTimeQuality || subLot.existingQuantity || 0,
                        locationId: subLot.locationId
                    }));

                    setRealQuantities(initialRealQuantities);
                    setNote(note);
                    setUnit(unitByMaterialId)
                    setSubLots(materialSubLotsByLotNumber);
                    setMaterial(materialById);
                }
            } catch (error) {
                console.error("Error fetching material lot by ID:", error);
                toast.error("Không thể tải thông tin chi tiết lô vật tư");
            } finally {
                setIsLotDetailsLoading(false);
            }
        }

        getMaterialLotById();
    }, [selectedLotNumber])

    // Handle change for a specific sublot's real quantity
    const handleRealQuantityChange = (index, value) => {
        setRealQuantities(prev => {
            const newQuantities = [...prev];
            newQuantities[index] = {
                ...newQuantities[index],
                realQuantity: parseInt(value) || 0
            };
            return newQuantities;
        });
    };

    // Function to initiate row deletion by showing confirmation modal
    const deleteItem = (index) => {
        setDeleteIndex(index);
        setShowDeleteModal(true);
    };

    // Confirm deletion
    const confirmDelete = () => {
        if (deleteIndex !== null) {
            // Remove the sublot at the specified index
            setSubLots(prev => prev.filter((_, i) => i !== deleteIndex));
            // Remove the corresponding real quantity
            setRealQuantities(prev => prev.filter((_, i) => i !== deleteIndex));
            // Close modal and reset index
            setShowDeleteModal(false);
            setDeleteIndex(null);
        }
    };

    // Cancel deletion
    const cancelDelete = () => {
        setShowDeleteModal(false);
        setDeleteIndex(null);
    };

    useEffect(() => {
        if (error && (selectedWarehouse || selectedZone || selectedLotNumber || selectedPerson || selectedDate || selectedReason || selectedLotAdjustmentType)) {
          setError('');
        }
        if (hasSubmitted) {
          setFieldErrors({});
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [selectedWarehouse, selectedZone, selectedLotNumber, selectedPerson, selectedDate, selectedReason, selectedLotAdjustmentType]);

      const validateRequestForm = () => {
        const nextFieldErrors = {};
        if (!selectedWarehouse) nextFieldErrors.warehouse = 'Vui lòng chọn kho hàng';
        if (!selectedZone) nextFieldErrors.zone = 'Vui lòng chọn mã kho hàng';
        if (!selectedLotNumber) nextFieldErrors.lot = 'Vui lòng chọn lô kiểm kê';
        if (!selectedLotAdjustmentType) nextFieldErrors.type = 'Vui lòng chọn loại kiểm kê';
        if (!selectedReason) nextFieldErrors.reason = 'Vui lòng chọn lý do';
        if (!selectedPerson) nextFieldErrors.person = 'Vui lòng chọn nhân viên';
        if (!selectedDate) nextFieldErrors.date = 'Vui lòng chọn ngày thực hiện';
        setFieldErrors(nextFieldErrors);
        return Object.keys(nextFieldErrors).length === 0;
      };

      const createLotAdjustment = async () => {
        setHasSubmitted(true);
        if (!validateRequestForm()) {
          toast.error("Tạo yêu cầu kiểm kê thất bại!", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
          return;
        }

        setError('');

        try {
          setIsCreateLoading(true);
          const employeeId = people.find(x => x.employeeName === selectedPerson).employeeId;
          const newLotAdjustment = {
            warehouseId: selectedZone,
            employeeId: employeeId,
            adjustmentDate: selectedDate,
            lotNumber : selectedLotNumber,
            reason : reasonMapData[selectedReason],
            adjustmentType : adjustmentTypeMap[selectedLotAdjustmentType],
            note: '--'
          }
          const lotAdjustmentId = await lotAdjustmentApi.createNewStockTake(newLotAdjustment);
          setLotAdjustmentId(lotAdjustmentId);
          toast.success("Tạo yêu cầu kiểm kê thành công!", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
        } catch (err) {
          setError(getApiErrorMessage(err, 'An error occurred while creating the receipt.'));
        } finally {
          setIsCreateLoading(false);
        }

      };

      const updateMaterialLotAdjustment = async() => {
        const hasChanges = subLots.some((subLot, index) => {
            const currentRealQuantity = realQuantities[index]?.realQuantity || 0;
            return currentRealQuantity !== (subLot.realTimeQuality || 0);
        });

        if (!hasChanges) {
            toast.info("Không có thay đổi nào để duyệt kiểm kê", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
            return;
        }

        try {
            setIsUpdateLoading(true);
            const updatedMaterialLotAdjustment = {
                lotNumber: selectedLotNumber,
                stockTakeId: lotAdjustmentId,
                materialSubLots: realQuantities.map((item, index) => ({
                    ...item,
                    subLotStatus: subLots[index]?.subLotStatus,
                    unitOfMeasure: subLots[index]?.unitOfMeasure,
                })),
            }
            // Call API to update the stock take with the entered real quantities
            await lotAdjustmentApi.updateStockTake(updatedMaterialLotAdjustment);
            toast.success("Duyệt kiểm kê thành công!", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });

            // Reset all form values and data
            setSelectedDate(null);
            setSelectedWarehouse(null);
            setSelectedZone(null);
            setSelectedPerson(null);
            setSelectedLotNumber(null);
            setSelectedReason(null);
            setSelectedLotAdjustmentType(null);
            setMaterial(null);
            setUnit(null);
            setNote(null);
            setSubLots([]);
            setRealQuantities([]);
            setLotAdjustmentId(null);
            setIsDetailsVisible(true);
            setError('');
            setFieldErrors({});
            setHasSubmitted(false);
        }
        catch (err) {
            setError(getApiErrorMessage(err, 'An error occurred while updating the material lot adjustment.'));
        } finally {
            setIsUpdateLoading(false);
        }
      }

      const totalQuantity = subLots.reduce((sum, item) => sum + (Number(item.existingQuantity) || 0), 0);

    return (
        <ContentContainer>
            {/* Left Section - Request Form */}
            <FormSection style={{ flex: "0 0 380px", width: "380px" }}>
                <SectionTitle>Yêu cầu kiểm kê</SectionTitle>

                {isInitialLoading && (
                    <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
                        <ClipLoader color="var(--color-teal)" size={35} />
                    </div>
                )}

                {!isInitialLoading && (
                    <>
                        <FormGroup>
                            <Label required>Kho hàng:</Label>
                            <SelectContainer>
                            <Select
                                value={selectedWarehouse}
                                onChange={(e) => setSelectedWarehouse(e.target.value)}
                                placeholder="Chọn loại kho hàng"
                                >
                                {uniqueWarehouseNames.map((warehouseName, index) => (
                                    <option key = {`warehouse-${index}`} value= {warehouseName}>
                                    {warehouseName}
                                    </option>
                                ))}
                            </Select>
                            </SelectContainer>
                        </FormGroup>
                        {fieldErrors.warehouse && <div style={errorTextStyle}>{fieldErrors.warehouse}</div>}

                        <FormGroup>
                            <Label required>Mã kho hàng:</Label>
                            <SelectContainer>
                            <Select
                                value={selectedZone}
                                onChange={(e) => setSelectedZone(e.target.value)}
                                placeholder="Chọn mã kho hàng"
                                >
                                {wareHouses
                                    .filter((warehouse) => warehouse.warehouseName === selectedWarehouse)
                                    .map((warehouse, index) => (
                                        <option key = {`wareHouses-${index}`} value= {warehouse.warehouseId}>
                                        {warehouse.warehouseId}
                                        </option>
                                    ))}
                            </Select>
                            </SelectContainer>
                        </FormGroup>
                        {fieldErrors.zone && <div style={errorTextStyle}>{fieldErrors.zone}</div>}

                        <FormGroup>
                            <Label required>Lô kiểm kê:</Label>
                            <SelectContainer>
                                <Select
                                value={selectedLotNumber}
                                onChange={(e) => setSelectedLotNumber(e.target.value)}
                                placeholder="Chọn lô hàng kiểm kê"
                                disabled={isLotLoading}
                                >
                                {isLotLoading ? (
                                    <option>Đang tải...</option>
                                ) : (
                                    lotNumbers.map((lotNumber, index) => (
                                        <option key = {`lotNumber-${index}`} value= {lotNumber}>
                                        {lotNumber}
                                        </option>
                                    ))
                                )}
                                </Select>
                                {isLotLoading && (
                                    <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)' }}>
                                        <ClipLoader color="var(--color-teal)" size={15} />
                                    </div>
                                )}
                            </SelectContainer>
                        </FormGroup>
                        {fieldErrors.lot && <div style={errorTextStyle}>{fieldErrors.lot}</div>}

                        <FormGroup>
                            <Label required>Loại kiểm kê:</Label>
                            <SelectContainer>
                                <Select placeholder="Chọn loại kiểm kê"
                                        value={selectedLotAdjustmentType}
                                        onChange={(e) => setSelectedLotAdjustmentType(e.target.value)}
                                >
                                        {AdjustmentType.map((adjustmentType, index) => (
                                        <option key = {`adjustmentType-${index}`} value= {adjustmentType}>
                                        {adjustmentType}
                                        </option>
                                    ))}

                                </Select>
                            </SelectContainer>
                        </FormGroup>
                        {fieldErrors.type && <div style={errorTextStyle}>{fieldErrors.type}</div>}

                        <FormGroup>
                            <Label required>Lý do:</Label>
                            <SelectContainer>
                            <Select
                                value={selectedReason}
                                onChange={(e) => setSelectedReason(e.target.value)}
                                placeholder="Chọn lý do kiểm kê"
                                >
                                {reasonData.map((reason, index) => (
                                    <option key = {`reason-${index}`} value={reason}>
                                    {reason}
                                    </option>
                                ))}
                            </Select>
                            </SelectContainer>
                        </FormGroup>
                        {fieldErrors.reason && <div style={errorTextStyle}>{fieldErrors.reason}</div>}

                        <FormGroup>
                            <Label required>Nhân viên:</Label>
                            <SelectContainer>
                            <Select
                                value={selectedPerson}
                                onChange={(e) => setSelectedPerson(e.target.value)}
                                placeholder="Chọn nhân viên"
                                >
                                {people.map((person, index) => (
                                    <option key = {`person-${index}`} value={person.employeeName}>
                                    {person.employeeName}
                                    </option>
                                ))}
                            </Select>
                            </SelectContainer>
                        </FormGroup>
                        {fieldErrors.person && <div style={errorTextStyle}>{fieldErrors.person}</div>}

                        <FormGroup>
                            <Label required>Ngày thực hiện:</Label>
                            <SelectContainer>
                                <DateInput
                                    selectedDate={selectedDate}
                                    onChange={setSelectedDate}
                                />
                            </SelectContainer>
                        </FormGroup>
                        {fieldErrors.date && <div style={errorTextStyle}>{fieldErrors.date}</div>}

                        {error && <div style={{ color: 'red', marginTop: '8px' }}>{error}</div>}

                        <ActionButton
                            onClick={createLotAdjustment}
                            disabled={isCreateLoading}
                            style={{ marginTop: '1.5rem', width: '37.5%', padding: '15px', fontSize: '15px' }}
                        >
                            {isCreateLoading ? (
                                <ClipLoader color="#ffffff" size={20} />
                            ) : (
                                "Tạo yêu cầu"
                            )}
                        </ActionButton>
                    </>
                )}
            </FormSection>

            {/* Right Section - Check Detail */}
            <ListSection elevated style={{ flex: "1 1 auto", minWidth: 0 }}>
                <div className={styles.detailHeader}>
                    <SectionTitle style={{width: "100%", marginBottom: 0}}>Thông tin kiểm kê chi tiết</SectionTitle>
                    <button
                        onClick={() => setIsDetailsVisible(!isDetailsVisible)}
                        className={styles.chevronButton}
                    >
                        <FaChevronDown size={18} className={clsx(styles.chevronIcon, isDetailsVisible && styles.chevronOpen)} />
                    </button>
                </div>

                {isDetailsVisible && (
                    <>
                    {isLotDetailsLoading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                            <ClipLoader color="var(--color-teal)" size={40} />
                        </div>
                    ) : (
                        <>
                        <div style={{ display: "flex" }}>

                            <div style={{ display: "flex", flexDirection: "column", width: "50%" }}>

                                <FormGroup style={{ position: "relative"}}>
                                    <Label style={{ width: "35%", marginLeft: "30px" }}>Mã lô kiểm kê:</Label>
                                    <span className={styles.readOnlyField}>{selectedLotNumber || ""}</span>
                                </FormGroup>

                                <FormGroup>
                                    <Label style={{ width: "35%", marginLeft: "30px" }}>Loại kiểm kê:</Label>
                                    <span className={styles.readOnlyField}>{selectedLotAdjustmentType || ""}</span>
                                </FormGroup>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", width: "50%" }}>
                                <FormGroup style={{ position: "relative" }}>
                                    <Label style={{ width: "36.3%", marginLeft: "10px" }}>Tổng số lượng:</Label>
                                    <span className={styles.readOnlyField}>{subLots.length > 0 ? totalQuantity : ""}</span>
                                </FormGroup>

                                <FormGroup>
                                    <Label style={{ width: "36.3%", marginLeft: "10px" }}>Ngày thực hiện:</Label>
                                    <span className={styles.readOnlyField}>{selectedDate ? new Date(selectedDate).toLocaleString() : ""}</span>
                                </FormGroup>
                            </div>
                        </div>

                        <SectionTitle style={{ textAlign: 'left', margin: "0px 30px" }}>Thông tin sản phẩm</SectionTitle>

                        <FormSection className={styles.accentPanel} style={{ margin: "0px 10px 10px", height: "120px", padding: "10px", boxShadow: "none" }}>
                            <div style={{ marginBottom: 0, display: "flex" }}>
                                <div style={{ display: "flex", flexDirection: "column", width: "50%" }}>
                                    <FormGroup style={{ marginLeft: "10px" }}>
                                        <Label style={{ width: "38%" }}>Sản phẩm:</Label>
                                        <span className={styles.readOnlyField} style={{ width: "55%", height: "40px", textAlign: "left" }}>{material?.materialName || ""}</span>
                                    </FormGroup>

                                    <FormGroup style={{ marginLeft: "10px" }}>
                                        <Label style={{ width: "38%" }}>Đơn vị tính:</Label>
                                        <span className={styles.readOnlyField} style={{ width: "55%", fontSize: "11px" }}>{unit || ""}</span>
                                    </FormGroup>
                                </div>

                                <div style={{ display: "flex", flexDirection: "column", width: "50%" }}>
                                    <FormGroup style={{ marginLeft: "10px" }}>
                                        <Label style={{ width: "39%" }}>Mã sản phẩm:</Label>
                                        <span className={styles.readOnlyField} style={{ width: "55%", height: "38px", fontSize: "11px" }}>{material?.materialId || ""}</span>
                                    </FormGroup>

                                    <FormGroup style={{ position: "relative" }}>
                                        <Label style={{ width: "37.6%", marginLeft: "10px" }}>Ghi chú:</Label>
                                        <span className={styles.readOnlyField} style={{ width: "55%", height: "38px", fontSize: "11px" }}>{note === "None" ? "--" : note}</span>
                                    </FormGroup>
                                </div>
                            </div>
                        </FormSection>

                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "0px 30px" }}>
                            <SectionTitle style={{ textAlign: 'left', marginBottom: 0 }}>Kiểm kê tại vị trí lưu trữ</SectionTitle>
                            <Tag variant="neutral">{subLots.length} vị trí</Tag>
                        </div>

                        <ListSection style={{ padding: 0, margin: "1.5%", boxShadow: "none", border: "none" }}>
                            <div style={{ overflowY: 'auto', height: "300px" }}>
                                {subLots.length === 0 ? (
                                    <div className={styles.emptyState}>Không còn vị trí nào để kiểm kê.</div>
                                ) : (
                                <Table>
                                    <thead>
                                        <tr>
                                            <TableHeader style={{ width: "48px" }}>STT</TableHeader>
                                            <TableHeader style={{width: "20%"}}>Vị trí lưu trữ</TableHeader>
                                            <TableHeader>Tồn kho</TableHeader>
                                            <TableHeader style={{width: "20%"}}>Thực tế</TableHeader>
                                            <TableHeader>Chênh lệch</TableHeader>
                                            <TableHeader>Ghi chú</TableHeader>
                                            <TableHeader style={{ width: "50px" }}></TableHeader>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {subLots.map((item, index) => {
                                            const realQuantity = realQuantities[index]?.realQuantity || 0;
                                            const variance = getVariance(item.existingQuantity, realQuantity);
                                            const status = getVarianceStatus(variance);
                                            return (
                                            <tr key={index}>
                                                <TableCell>{index + 1}</TableCell>
                                                <TableCell>{item.locationId}</TableCell>
                                                <TableCell>{item.existingQuantity}</TableCell>
                                                <TableCell>
                                                <input style={{textAlign: "center", width: "50%", border: "1px solid var(--color-border)", borderRadius: "6px"}}
                                                    type="number"
                                                    min="0"
                                                    step="1"
                                                    value={realQuantity}
                                                    onChange={(e) => handleRealQuantityChange(index, e.target.value)}
                                                />
                                                </TableCell>
                                                <TableCell>
                                                    <span style={{ color: stockTakeStatusColor[status], fontWeight: 700 }}>
                                                        {variance > 0 ? `+${variance}` : variance}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className={styles.statusPill} style={{ backgroundColor: stockTakeStatusColor[status] }}>
                                                        {status}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <DeleteButton onClick={() => deleteItem(index)}>
                                                        <FaTrash size={16} color="#FF2115" />
                                                    </DeleteButton>
                                                </TableCell>
                                            </tr>
                                            );
                                        })}
                                    </tbody>
                                </Table>
                                )}
                            </div>
                        </ListSection>

                        <ActionButton
                            style={{ width: "35%", padding: "14px", fontSize: "14px" }}
                            onClick={updateMaterialLotAdjustment}
                            disabled={isUpdateLoading || !lotAdjustmentId}
                        >
                            {isUpdateLoading ? (
                                <ClipLoader color="#ffffff" size={20} />
                            ) : (
                                "Duyệt kiểm kê"
                            )}
                        </ActionButton>
                        </>
                    )}
                    </>
                )}
            </ListSection>

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
        </ContentContainer>
    );
};

export default RequestLotAdjustment;
