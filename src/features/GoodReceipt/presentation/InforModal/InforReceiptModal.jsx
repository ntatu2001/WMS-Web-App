import React, { useState, useRef, useEffect } from "react";
import ActionButton from '../../../../common/components/Button/ActionButton/ActionButton';
import SectionTitle from '../../../../common/components/Text/SectionTitle';
import { AiOutlineClose } from 'react-icons/ai';
import clsx from 'clsx';
import styles from './InforReceiptModal.module.scss';
import Label from "../../../../common/components/Label/Label";
import { ClipLoader } from 'react-spinners';
import { storageLevel } from '../../../../app/mockData/StorageLevelData.js';
import useTranslation from '../../../../common/hooks/useTranslation';
import { cellStatusLabelKey, resolveLabel } from '../../../../common/i18n/labels';

const InforReceiptModal = ({ data, onClose, position, isLoading }) => {
    const { t } = useTranslation();
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
            <SectionTitle style={{margin: "0px", textAlign: "center", width: "100%", flex: 1}}>{t('storage.modalPosition', { pos: data.position })}</SectionTitle>
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
              <ClipLoader color="var(--color-teal)" size={40} />
            </div>
          ) : (
            <>
              <div style={{justifyItems: "center", marginRight: "7%", marginTop: "7%"}} >
                <div style={{marginBottom: "5%", width: "100%"}}>
                      <div style={{display: "flex", marginLeft: "7%",justifyContent: "space-between"}}>
                                <Label>{t('storage.modalLot')}</Label>
                                 <span style={{ fontSize: "14px", fontWeight: 600, marginTop : "1%"}}>{data.selectedDetails.lotNumber}</span>
                      </div>
                      <div style={{display: "flex", marginLeft: "7%",justifyContent: "space-between"}}>
                        <Label>{t('storage.modalQty')}</Label>
                        <span style={{ fontSize: "14px", fontWeight: 600, marginTop : "1%"}}>{data.selectedDetails.quantity}</span>
                      </div>

                      <div style={{display: "flex", marginLeft: "7%",justifyContent: "space-between"}}>
                                <Label>{t('storage.modalStatus')}</Label>
                                 <span style={{ fontSize: "14px", fontWeight: 600, marginTop : "1%", color: data.selectedDetails?.status === "Đang chứa hàng" ? "#0089D7" :
                                    data.selectedDetails?.status === "Được phân bổ" ? "#FF2115" : "#00294D"
                                 }}>{resolveLabel(cellStatusLabelKey, data.selectedDetails?.status, t)}</span>
                      </div>
                      <div style={{display: "flex", marginLeft: "7%", justifyContent: "space-between"}}>
                                <Label style={{width: "50%"}}>{t('storage.modalStorageRate')}</Label>
                                 <span style={{ fontSize: "14px", fontWeight: 600, marginTop : "1%"}}>{(data.selectedDetails?.storagePercentage * 100).toFixed(2)}%</span>
                      </div>
                      {data.selectedDetails?.storageLevel && (
                        <div style={{display: "flex", marginLeft: "7%", justifyContent: "space-between"}}>
                          <Label style={{width: "60%"}}>{t('storage.modalStorageLevelLimit')}</Label>
                          <span style={{
                                          backgroundColor: storageLevel[data.selectedDetails?.storageLevel],
                                          color: "white",
                                          fontWeight: "bold",
                                          fontSize: "14px",
                                          padding: "4px 8px",
                                          borderRadius: "4px",
                                          }}> {t('storage.modalFloor', { n: data.selectedDetails?.storageLevel })}
                          </span>
                        </div>
                      )}
                </div>
                
              </div>

            </>
          )}
        </div>
 
    );
  };

  export default InforReceiptModal;