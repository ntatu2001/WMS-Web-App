import React, { useState, useRef, useEffect } from "react";
import ActionButton from '../../../../common/components/Button/ActionButton/ActionButton';
import SectionTitle from '../../../../common/components/Text/SectionTitle';
import { AiOutlineClose } from 'react-icons/ai';
import clsx from 'clsx';
import styles from './DetailModal.module.scss';
import Label from "../../../../common/components/Label/Label";
import { ClipLoader } from 'react-spinners';


const DetailModal = ({ data, onClose, position, onViewDetails, isLoading }) => {
    // State for handling draggable functionality
    const [isDragging, setIsDragging] = useState(false);
    const [modalPosition, setModalPosition] = useState({ 
        top: position.top, 
        left: position.left 
    });
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const modalRef = useRef(null);

    // Function to handle close button click
    const handleClose = (e) => {
        e.stopPropagation(); // Prevent event from bubbling up
        onClose();
    };

    // Start dragging
    const handleMouseDown = (e) => {
        if (modalRef.current && !e.target.closest('button')) {
            const rect = modalRef.current.getBoundingClientRect();
            setIsDragging(true);
            setDragOffset({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            });
        }
    };

    // Handle mouse movement while dragging
    const handleMouseMove = (e) => {
        if (isDragging) {
            setModalPosition({
                top: e.clientY - dragOffset.y,
                left: e.clientX - dragOffset.x
            });
        }
    };

    // End dragging
    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // Add event listeners for mouse move and mouse up
    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        } else {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);
  
    return (
        <div 
            ref={modalRef}
            className={clsx(styles.modal)} 
            style={{ 
                top: modalPosition.top, 
                left: modalPosition.left,
                cursor: isDragging ? 'grabbing' : 'grab',
                zIndex: 999
            }}
            onMouseDown={handleMouseDown}
        >
          <div className="flex justify-center items-center w-full">
            <SectionTitle style={{margin: "0px", textAlign: "center", width: "100%", flex: 1}}>Vị trí {data.position}</SectionTitle>
            <button 
              onClick={handleClose}
              className={clsx(styles.modalClose)}
            >
               <AiOutlineClose style={{ fontWeight: "bold" }} />
            </button>
          </div>
  
          {isLoading ? (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '200px',
              width: '100%'
            }}>
              <ClipLoader color="#0089D7" size={40} />
            </div>
          ) : (
            <>
              <div style={{justifyItems: "center", marginRight: "7%", marginTop: "7%"}} >
                <div style={{marginBottom: "5%", width: "100%"}}>
                      <div style={{display: "flex", marginLeft: "-4%",justifyContent: "space-between"}}>
                                <Label>Thiết bị:</Label>
                                 <span style={{ fontSize: "16px", fontWeight: 600}}>{data.selectedDetails?.equipmentName}</span>
                      </div>
                      <div style={{display: "flex", marginLeft: "-2.6%",justifyContent: "space-between"}}>
                                <Label>Khu vực:</Label>
                                 <span style={{ fontSize: "16px", fontWeight: 600}}>{data.selectedDetails?.warehouseId}</span>
                      </div>
                      <div style={{display: "flex", marginLeft: "0%", justifyContent: "space-between"}}>
                                <Label>Kho hàng:</Label>
                                 <span style={{ fontSize: "16px", fontWeight: 600}}>{data.selectedDetails?.warehouseName}</span>
                      </div>
                      <div style={{display: "flex", marginLeft: "1.5%", justifyContent: "space-between"}}>
                                <Label style={{width: "40%"}}>Kích thước:</Label>
                                 <span style={{ fontSize: "12px", fontWeight: 600, marginTop: "2%"}}>{data.selectedDetails?.length}m x {data.selectedDetails?.width}m x {data.selectedDetails?.height}m</span>
                      </div>
                      <div style={{display: "flex", justifyContent: "space-between", marginLeft: "1%"}}>
                        <Label style={{width: "40%"}}>Tình trạng:</Label> 
                        <span className={`ml-2 `} style={{color: "#0089D7"}}>
                          {data.selectedDetails?.status}
                        </span>
                      </div>
                </div>
                
                <div style={{marginTop: "10%", width: "100%"}}>
                      <div style={{display: "flex", marginLeft: "-2%", justifyContent: "space-between"}}>
                                <Label style={{width: "60%"}}>Lô hàng lưu trữ:</Label>
                                 <span style={{ fontSize: "16px", fontWeight: 600}}>{data.selectedDetails?.lotInfors[0]?.lotnumber}</span>
                      </div>
                      <div style={{display: "flex", justifyContent: "space-between"}}>
                                <Label style={{width: "60%"}}>Số lượng lưu trữ:</Label>
                                 <span style={{ fontSize: "16px", fontWeight: 600}}>{data.selectedDetails?.lotInfors[0]?.quantity}</span>
                      </div>
                      <div style={{display: "flex", justifyContent: "space-between"}}>
                                <Label style={{width: "60%"}}>Thể tích sử dụng:</Label>
                                 <span style={{ fontSize: "16px", fontWeight: 600}}>{Math.round(data.selectedDetails?.usableVolume * 100) / 100}</span>
                      </div>
                      <div style={{display: "flex", marginLeft: "-4.2%", justifyContent: "space-between"}}>
                                <Label style={{width: "60%"}}>Thể tích tối đa:</Label>
                                 <span style={{ fontSize: "16px", fontWeight: 600}}>{Math.round(data.selectedDetails?.maxVolume * 100) / 100}</span>
                      </div>
                </div>
              </div>
        
              <div className="pt-4">
                <ActionButton style={{width: "70%", padding: "5%"}}
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent event from bubbling up
                    onViewDetails();
                  }}
                  
                >
                  Xem chi tiết
                </ActionButton>
              </div>
            </>
          )}
        </div>
 
    );
  };

  export default DetailModal;