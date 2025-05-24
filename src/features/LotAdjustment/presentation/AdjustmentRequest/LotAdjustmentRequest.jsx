import React, { useState, useEffect } from 'react';
import { FaTrash, FaChevronDown } from 'react-icons/fa';
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
import wareHouseApi from '../../../../api/wareHouseApi.js';
import personApi from '../../../../api/personApi.js';
import materialApi from '../../../../api/materialApi.js';
import materialLotApi from '../../../../api/materiaLotApi.js';
import { reasonData } from '../../../../app/mockData/reasonData.js';
import lotAdjustmentApi from '../../../../api/lotAdjustmentApi.js';
import { reasonMapData } from '../../../../app/mockData/reasonData.js';
import { adjustmentTypeMap, AdjustmentType } from '../../../../app/mockData/AdjustmentType.js';
import materialSubLotApi from '../../../../api/materialSubLotApi.js';
import { toast } from "react-toastify"; // Import toast for notifications
import "react-toastify/dist/ReactToastify.css";
import { ClipLoader} from 'react-spinners';


const RequestLotAdjustment = () => {
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedWarehouse, setSelectedWarehouse] = useState(null);
    const [selectedZone, setSelectedZone] = useState(null);
    const [selectedPerson, setSelectedPerson] = useState(null);
    const [selectedLotNumber, setSelectedLotNumber] = useState(null);
    const [selectedReason, setSelectedReason] = useState(null);
    const [selectedLotAdjustmentType, setSelectedLotAdjustmentType] = useState(null);
    const [wareHouses, setWareHouses] = useState([]);
    const [people, setPeople] = useState([]);
    const [lotNumbers, setLotNumbers] = useState([]);
    const [isDetailsVisible, setIsDetailsVisible] = useState(false);
    const [error, setError] = useState('');
    const [materialLotById, setMaterialLotById] = useState(null);
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

    console.log(realQuantities)
    useEffect(() => {
        const GetApi = async() => {
            setIsInitialLoading(true);
            try {
                const wareHouseList = await wareHouseApi.getAllWareHouses();
                const personList = await personApi.getAllPerson();
 
                setPeople(personList);
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

    useEffect(() => {
        const getMaterialLotList = async() => {
            if (!selectedZone) return;
            
            setIsLotLoading(true);
            try {
                const materialLotList = await materialLotApi.GetMaterialLotsByWarehouseId(selectedZone);
                const lotNumberList = await materialLotList.map(lotNumberList => lotNumberList.lotNumber);
                
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
                    const result = await materialLotApi.getMaterialLotById(selectedLotNumber);
                    const materialSubLotsByLotNumber = await materialSubLotApi.getMaterialSubLotsByLotNumber(selectedLotNumber);
                    const materialById = await materialApi.getMaterialById(result.materialId);
                    const unitByMaterialId = await materialApi.getUnitByMaterialId(result.materialId);
                    const note = materialById?.properties?.find(prop => prop.propertyName === "Note")?.propertyValue || "";

                    // Initialize real quantities array with objects containing realQuantity and locationId
                    const initialRealQuantities = materialSubLotsByLotNumber.map(subLot => ({
                        materialSubLotId: subLot.materialSubLotId,
                        previousQuantity: subLot.existingQuality,
                        realQuantity: subLot.realTimeQuality || 0,
                        locationId: subLot.locationId
                    }));

                    setRealQuantities(initialRealQuantities);
                    setNote(note);
                    setUnit(unitByMaterialId)
                    setSubLots(materialSubLotsByLotNumber);
                    setMaterial(materialById);
                    setMaterialLotById(result);
                }
            } catch (error) {
                console.error("Error fetching material lot by ID:", error);
                setMaterialLotById(null);
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
                realQuantity: value
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
      }, [selectedWarehouse, selectedZone, selectedLotNumber, selectedPerson, selectedDate, selectedReason, selectedLotAdjustmentType]);

      const createLotAdjustment = async () => {

        if (!selectedWarehouse || !selectedZone || !selectedLotNumber || !selectedPerson || !selectedDate || !selectedReason || !selectedLotAdjustmentType) {
          setError('Vui lòng chọn tất cả các trường bắt buộc.');
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
          const personId = people.find(x => x.personName === selectedPerson).personId;
          const newLotAdjustment = {
            warehouseId: selectedZone,
            personId: personId,
            adjustmentDate: selectedDate,
            lotNumber : selectedLotNumber,
            reason : reasonMapData[selectedReason],
            adjustmentType : adjustmentTypeMap[selectedLotAdjustmentType],
            note: '--'
          }
          console.log(newLotAdjustment);
          const lotAdjustmentId = await lotAdjustmentApi.createNewMaterialLotAdjustment(newLotAdjustment);
          setLotAdjustmentId(lotAdjustmentId);
          console.log(lotAdjustmentId);
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
          setError(err.message || 'An error occurred while creating the receipt.');
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
                materialSubLots: realQuantities,
                lotNumber: selectedLotNumber,
                materialLotAdjustmentId: lotAdjustmentId,
            }
            console.log(updatedMaterialLotAdjustment)
            // Call API to update the material lot adjustment
            await lotAdjustmentApi.updateMaterialLotAdjustment(updatedMaterialLotAdjustment);
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
            setMaterialLotById(null);
            setMaterial(null);
            setUnit(null);
            setNote(null);
            setSubLots([]);
            setRealQuantities([]);
            setLotAdjustmentId(null);
            setIsDetailsVisible(false);
            setError('');
        }
        catch (err) {
            setError(err.message || 'An error occurred while updating the material lot adjustment.');
        } finally {
            setIsUpdateLoading(false);
        }
      }
    return (
        <ContentContainer>
            {/* Left Section - Import Form */}
            <FormSection>
                <SectionTitle>Yêu cầu kiểm kê</SectionTitle>

                {isInitialLoading && (
                    <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
                        <ClipLoader color="#4A90E2" size={35} />
                    </div>
                )}

                {!isInitialLoading && (
                    <>
                        <FormGroup>
                            <Label>Kho hàng:</Label>
                            <SelectContainer>
                            <Select 
                                value={selectedWarehouse} 
                                onChange={(e) => setSelectedWarehouse(e.target.value)}
                                placeholder="Chọn loại kho hàng"
                                >
                                {wareHouses.map((warehouse, index) => (
                                    <option key = {`warehouse-${index}`} value= {warehouse.warehouseName}> 
                                    {warehouse.warehouseName}
                                    </option>
                                ))}
                            </Select>
                            </SelectContainer>
                        </FormGroup>

                        <FormGroup>
                            <Label>Mã kho hàng:</Label>
                            <SelectContainer>
                            <Select 
                                value={selectedZone} 
                                onChange={(e) => setSelectedZone(e.target.value)}
                                placeholder="Chọn mã kho hàng"
                                >
                                {wareHouses.map((wareHouses, index) => (
                                    <option key = {`wareHouses-${index}`} value= {wareHouses.warehouseId}>
                                    {wareHouses.warehouseId}
                                    </option>
                                ))}
                            </Select>
                            </SelectContainer>
                        </FormGroup>

                        <FormGroup>
                            <Label>Lô kiểm kê:</Label>
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
                                        <ClipLoader color="#4A90E2" size={15} />
                                    </div>
                                )}
                            </SelectContainer>
                        </FormGroup>
                        
                        <FormGroup>
                            <Label>Loại kiểm kê:</Label>
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
                                
                        <FormGroup>
                            <Label>Lý do:</Label>
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


                        <FormGroup>
                            <Label>Nhân viên:</Label>
                            <SelectContainer>
                            <Select 
                                value={selectedPerson} 
                                onChange={(e) => setSelectedPerson(e.target.value)}
                                placeholder="Chọn nhân viên"
                                >
                                {people.map((person, index) => (
                                    <option key = {`person-${index}`} value={person.personName}>
                                    {person.personName}
                                    </option>
                                ))}
                            </Select>
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

                        {error && <div style={{ color: 'red' }}>{error}</div>}

                        <ActionButton onClick={createLotAdjustment} disabled={isCreateLoading}>
                            {isCreateLoading ? (
                                <ClipLoader color="#ffffff" size={20} />
                            ) : (
                                "Tạo yêu cầu"
                            )}
                        </ActionButton>
                    </>
                )}
            </FormSection>

            {/* Right Section - Import List */}
            <ListSection>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #000", marginBottom: "2%"}}>
                    <SectionTitle style={{width: "100%", marginBottom: 0}}>Thông tin kiểm kê chi tiết</SectionTitle>
                    <button 
                        onClick={() => setIsDetailsVisible(!isDetailsVisible)}
                        style={{
                            padding: "1%",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                        }}
                    >
                        <FaChevronDown size={20} />
                    </button>
                </div>

                {isDetailsVisible && (
                    <>
                    {isLotDetailsLoading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                            <ClipLoader color="#4A90E2" size={40} />
                        </div>
                    ) : (
                        <>
                        <div style={{ display: "flex" }}>

                            <div style={{ display: "flex", flexDirection: "column", width: "50%" }}>

                                <FormGroup style={{ position: "relative", marginBottom: 0 }}>
                                    <Label style={{ width: "35%", marginLeft: "30px" }}>Mã lô kiểm kê:</Label>
                                    <span type="text" style={{
                                        border: "1px solid #767676",
                                        borderRadius: "6px",
                                        padding: "0px 5%",
                                        height: "35px",
                                        width: "50.3%",
                                        display: "flex",
                                        alignItems: "center",
                                        fontSize: "13px"
                                    }}
                                    >{selectedLotNumber || ""}</span>
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
                                    <span type="text" style={{
                                        border: "1px solid #767676",
                                        borderRadius: "6px",
                                        padding: "0px 5%",
                                        height: "35px",
                                        width: "50.3%",
                                        display: "flex",
                                        alignItems: "center",
                                        fontSize: "13px"
                                    }}
                                    >{selectedLotAdjustmentType || ""}</span>
                                </FormGroup>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", width: "50%" }}>
                                <FormGroup style={{ position: "relative" }}>
                                    <Label style={{ width: "36.3%", marginLeft: "10px" }}>Tổng số lượng:</Label>
                                    <span type="text" style={{
                                        border: "1px solid #767676",
                                        borderRadius: "6px",
                                        padding: "0px 5%",
                                        height: "35px",
                                        width: "50.3%",
                                        display: "flex",
                                        alignItems: "center",
                                        fontSize: "13px"
                                    }}
                                    >{materialLotById?.exisitingQuantity || " "}</span>
                                </FormGroup>
                                
                                <FormGroup>
                                    <Label style={{ width: "36.3%", marginLeft: "10px" }}>Ngày thực hiện:</Label>
                                    <span type="text" style={{
                                        border: "1px solid #767676",
                                        borderRadius: "6px",
                                        padding: "0px 5%",
                                        height: "35px",
                                        width: "50.3%",
                                        display: "flex",
                                        alignItems: "center",
                                        fontSize: "13px"
                                    }}
                                    >{selectedDate ? new Date(selectedDate).toLocaleString() : ""}</span>
                                </FormGroup>
                            </div>
                        </div>

                        <SectionTitle style={{ textAlign: 'left', margin: "0px 30px" }}>Thông tin sản phẩm</SectionTitle>

                        <FormSection style={{ margin: "0px 10px 10px", backgroundColor: "#F5F5F5", height: "120px", padding: "10px" }}>
                            <div style={{ marginBottom: 0, display: "flex" }}>
                                <div style={{ display: "flex", flexDirection: "column", width: "50%" }}>
                                    <FormGroup style={{ marginLeft: "10px" }}>
                                        <Label style={{ width: "38%" }}>Sản phẩm:</Label>
                                        <span type="text" style={{
                                        border: "1px solid #767676",
                                        borderRadius: "6px",
                                        padding: "0px 5%",
                                        height: "40px",
                                        width: "55%",
                                        display: "flex",
                                        alignItems: "center",
                                        textAlign: "left",
                                        backgroundColor: "#FFF",
                                        fontSize: "13px"
                                        }}
                                        >{material?.materialName || ""}</span>
                                    </FormGroup>

                                    <FormGroup style={{ marginLeft: "10px" }}>
                                        <Label style={{ width: "38%" }}>Đơn vị tính:</Label>
                                            <span type="text" style={{
                                            border: "1px solid #767676",
                                            borderRadius: "6px",
                                            padding: "0px 5%",
                                            height: "35px",
                                            width: "55%",
                                            display: "flex",
                                            alignItems: "center",
                                            backgroundColor: "#FFF",
                                            fontSize: "11px"
                                            }}
                                            >{unit || ""}</span>
                                    </FormGroup>

              

                                </div>

                                <div style={{ display: "flex", flexDirection: "column", width: "50%" }}>
                                    <FormGroup style={{ marginLeft: "10px" }}>
                                        <Label style={{ width: "39%" }}>Mã sản phẩm:</Label>
                                        <span type="text" style={{
                                        border: "1px solid #767676",
                                        borderRadius: "6px",
                                        padding: "0px 5%",
                                        height: "38px",
                                        width: "55%",
                                        display: "flex",
                                        alignItems: "center",
                                        backgroundColor: "#FFF",
                                        fontSize: "11px"
                                        
                                        }}
                                        >{material?.materialId || ""}</span>
                                    </FormGroup>

                                    <FormGroup style={{ position: "relative" }}>
                                        <Label style={{ width: "37.6%", marginLeft: "10px" }}>Ghi chú:</Label>
                                        <span type="text" style={{
                                        border: "1px solid #767676",
                                        borderRadius: "6px",
                                        padding: "0px 5%",
                                        height: "38px",
                                        width: "55%",
                                        display: "flex",
                                        alignItems: "center",
                                        backgroundColor: "#FFF",
                                        fontSize: "11px"
                                        }}
                                        >{note === "None" ? "--" : note}</span>
                                    </FormGroup>

                  
                                </div>
                            </div>
                        </FormSection>

                        <SectionTitle style={{ textAlign: 'left', margin: "0px 30px" }}>Kiểm kê tại vị trí lưu trữ</SectionTitle>

                        <ListSection style={{ padding: 0, margin: "1.5%" }}>
                            <div style={{ overflowY: 'auto', height: "300px" }}>
                                <Table>
                                    <thead>
                                        <tr>
                                            <TableHeader>STT</TableHeader>
                                            <TableHeader style={{width: "20%"}}>Vị trí lưu trữ</TableHeader>
                                            <TableHeader>Tồn kho</TableHeader>
                                            <TableHeader style={{width: "20%"}}>Thực tế</TableHeader>
                                            <TableHeader>Chênh lệch</TableHeader>
                                            <TableHeader>Ghi chú</TableHeader>
                                            <TableHeader></TableHeader>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {subLots.map((item, index) => (
                                            <tr key={index}>
                                                <TableCell>{index + 1}</TableCell>
                                                <TableCell>{item.locationId}</TableCell>
                                                <TableCell>{item.existingQuality}</TableCell>
                                                <TableCell>
                                                <input style={{textAlign: "center", width: "50%", border: "1px solid #767676", borderRadius: "6px"}}
                                                    type="number"
                                                    min="0"
                                                    step="1"
                                                    value={realQuantities[index]?.realQuantity || 0}
                                                    onChange={(e) => handleRealQuantityChange(index, e.target.value)}
                                                />
                                                </TableCell>
                                                <TableCell>{item.existingQuality - (realQuantities[index]?.realQuantity || 0)}</TableCell>
                                                <TableCell>
                                                    {(() => {
                                                        const diff = item.existingQuality - (realQuantities[index]?.realQuantity || 0);
                                                        if (diff > 0) return "Thiếu";
                                                        if (diff < 0) return "Dư";
                                                        return "Đủ";
                                                    })()}
                                                </TableCell>
                                                <TableCell>
                                                    <DeleteButton onClick={() => deleteItem(index)}>
                                                        <FaTrash size={25} color="#000" />
                                                    </DeleteButton>
                                                </TableCell>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        </ListSection>
                        
                        <ActionButton 
                            style={{ width: "35%", height: "10%" }} 
                            onClick={updateMaterialLotAdjustment}
                            disabled={isUpdateLoading}
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
        </ContentContainer>
    );
};

export default RequestLotAdjustment; 