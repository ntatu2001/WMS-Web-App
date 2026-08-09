import React, { useState, useRef, useEffect } from "react";
import ActionButton from '../../../../common/components/Button/ActionButton/ActionButton';
import { AiOutlineClose } from 'react-icons/ai';
import clsx from 'clsx';
import styles from './DetailModal.module.scss';
import { ClipLoader } from 'react-spinners';

const STATUS_COLORS = {
    'Đang chứa hàng': '#0089D7',
    'Đã đầy': '#00294D',
};

const getStatusColor = (status) => STATUS_COLORS[status] || 'inherit';

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
            e.stopPropagation(); // Prevent event bubbling to avoid triggering parent click events
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
            e.stopPropagation(); // Prevent event bubbling while dragging
            setModalPosition({
                top: e.clientY - dragOffset.y,
                left: e.clientX - dragOffset.x
            });
        }
    };

    // End dragging
    const handleMouseUp = (e) => {
        if (isDragging) {
            e.stopPropagation(); // Prevent event bubbling when ending drag
        }
        setIsDragging(false);
    };

    // Add event listeners for mouse move and mouse up
    useEffect(() => {
        const mouseMoveHandler = (e) => handleMouseMove(e);
        const mouseUpHandler = (e) => handleMouseUp(e);

        if (isDragging) {
            document.addEventListener('mousemove', mouseMoveHandler);
            document.addEventListener('mouseup', mouseUpHandler);
        } else {
            document.removeEventListener('mousemove', mouseMoveHandler);
            document.removeEventListener('mouseup', mouseUpHandler);
        }

        return () => {
            document.removeEventListener('mousemove', mouseMoveHandler);
            document.removeEventListener('mouseup', mouseUpHandler);
        };
    }, [isDragging]);

    const details = data.selectedDetails;
    const lotInfors = details?.lotInfors || [];
    const hasStock = lotInfors.length > 0;
    const selectedLot = data.selectedLotNumber
        ? lotInfors.find(lot => lot.lotnumber === data.selectedLotNumber)
        : lotInfors[0];
    const maxVolume = details?.maxVolume;
    const usableVolume = details?.usableVolume;
    // Dùng storageRate do backend tính sẵn (LocationStorageInfoDTO.storageRate) thay vì tự suy ra từ
    // usableVolume/maxVolume — 2 field đó có thể không phản ánh đúng thể tích đã dùng thực tế.
    const fillRate = details?.storageRate ?? 0;

    return (
        <div
            ref={modalRef}
            className={clsx(styles.modal)}
            style={{
                top: modalPosition.top,
                left: modalPosition.left,
                cursor: isDragging ? 'grabbing' : 'grab',
            }}
            onMouseDown={handleMouseDown}
            onClick={(e) => e.stopPropagation()} // Prevent clicks from bubbling to parent
        >
            <div className={styles.modalHeader}>
                <h3 className={styles.modalTitle}>Vị trí {data.position}</h3>
                <button onClick={handleClose} className={styles.modalClose} aria-label="Đóng">
                    <AiOutlineClose />
                </button>
            </div>

            {isLoading ? (
                <div className={styles.loading}>
                    <ClipLoader color="#0089D7" size={40} />
                </div>
            ) : (
                <>
                    <div className={styles.infoGrid}>
                        <span className={styles.infoLabel}>Thiết bị:</span>
                        <span className={styles.infoValue}>{details?.equipmentName}</span>

                        <span className={styles.infoLabel}>Khu vực:</span>
                        <span className={styles.infoValue}>{details?.warehouseId}</span>

                        <span className={styles.infoLabel}>Kho hàng:</span>
                        <span className={styles.infoValue}>{details?.warehouseName}</span>

                        <span className={styles.infoLabel}>Kích thước:</span>
                        <span className={styles.infoValue}>{details?.length}m x {details?.width}m x {details?.height}m</span>

                        <span className={styles.infoLabel}>Tình trạng:</span>
                        <span className={styles.statusValue} style={{ color: getStatusColor(details?.status) }}>{details?.status}</span>
                    </div>

                    {hasStock && (
                        <div className={styles.infoGrid}>
                            <span className={styles.infoLabel}>Lô hàng lưu trữ:</span>
                            <span className={styles.infoValue}>{selectedLot?.lotnumber}</span>

                            <span className={styles.infoLabel}>Số lượng lưu trữ:</span>
                            <span className={styles.infoValue}>{selectedLot?.quantity}</span>

                            <span className={styles.infoLabel}>Thể tích sử dụng:</span>
                            <span className={styles.infoValue}>{usableVolume >= maxVolume ? maxVolume?.toFixed(2) : usableVolume?.toFixed(2)}</span>

                            <span className={styles.infoLabel}>Thể tích tối đa:</span>
                            <span className={styles.infoValue}>{maxVolume?.toFixed(2)}</span>

                            <span className={styles.infoLabel}>Tỷ lệ lấp đầy:</span>
                            <span className={styles.infoValue}>{fillRate.toFixed(2)}%</span>
                        </div>
                    )}

                    <ActionButton
                        style={{ width: '100%', margin: '8px 0 0', padding: '14px', fontSize: '14px' }}
                        onClick={(e) => {
                            e.stopPropagation(); // Prevent event from bubbling up
                            onViewDetails();
                        }}
                    >
                        Xem chi tiết
                    </ActionButton>
                </>
            )}
        </div>

    );
};

export default DetailModal;
