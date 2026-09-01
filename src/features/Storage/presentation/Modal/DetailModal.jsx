import React, { useState, useRef, useEffect } from "react";
import ActionButton from '../../../../common/components/Button/ActionButton/ActionButton';
import clsx from 'clsx';
import styles from './DetailModal.module.scss';
import { ClipLoader } from 'react-spinners';
import useTranslation from '../../../../common/hooks/useTranslation';
import { cellStatusLabelKey, resolveLabel } from '../../../../common/i18n/labels';

const STATUS_COLORS = {
    'Đang chứa hàng': '#0089D7',
    'Đã đầy': '#00294D',
};

const getStatusColor = (status) => STATUS_COLORS[status] || 'inherit';

const DetailModal = ({ data, onClose, position, onViewDetails, isLoading }) => {
    const { t } = useTranslation();
    // State for handling draggable functionality
    const [isDragging, setIsDragging] = useState(false);
    const [modalPosition, setModalPosition] = useState({
        top: position.top,
        left: position.left
    });
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const modalRef = useRef(null);

    // Kéo popup vào lại bên trong màn hình nếu nó tràn ra ngoài viewport. Chạy lại
    // khi isLoading chuyển từ true -> false vì lúc đó chiều cao thật của popup mới
    // xác định được (phần "Lô hàng lưu trữ"/"Xem chi tiết" chỉ render sau khi có data).
    useEffect(() => {
        if (!modalRef.current) return;
        const margin = 12;
        const rect = modalRef.current.getBoundingClientRect();

        setModalPosition((prev) => {
            let top = prev.top;
            let left = prev.left;

            if (rect.bottom > window.innerHeight - margin) {
                top -= rect.bottom - (window.innerHeight - margin);
            }
            if (top < margin) top = margin;

            if (rect.right > window.innerWidth - margin) {
                left -= rect.right - (window.innerWidth - margin);
            }
            if (left < margin) left = margin;

            return (top === prev.top && left === prev.left) ? prev : { top, left };
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoading]);

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
    const maxVolume = details?.maxVolume;
    // Dùng storageRate do backend tính sẵn (LocationStorageInfoDTO.storageRate) thay vì tự suy ra từ
    // usedVolume/maxVolume — có thể không phản ánh đúng thể tích đã dùng thực tế.
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
                <h3 className={styles.modalTitle}>{t('storage.modalPosition', { pos: data.position })}</h3>
            </div>

            {isLoading ? (
                <div className={styles.loading}>
                    <ClipLoader color="var(--color-teal)" size={40} />
                </div>
            ) : (
                <>
                    <div className={styles.infoGrid}>
                        <span className={styles.infoLabel}>{t('storage.device')}</span>
                        <span className={styles.infoValue}>{details?.equipmentName}</span>

                        <span className={styles.infoLabel}>{t('storage.zoneLabel')}</span>
                        <span className={styles.infoValue}>{details?.warehouseId}</span>

                        <span className={styles.infoLabel}>{t('storage.warehouseLabel')}</span>
                        <span className={styles.infoValue}>{details?.warehouseName}</span>

                        <span className={styles.infoLabel}>{t('storage.dimensionsLabel')}</span>
                        <span className={styles.infoValue}>{details?.length}m x {details?.width}m x {details?.height}m</span>

                        <span className={styles.infoLabel}>{t('storage.conditionLabel')}</span>
                        <span className={styles.statusValue} style={{ color: getStatusColor(details?.status) }}>{resolveLabel(cellStatusLabelKey, details?.status, t)}</span>

                        <span className={styles.infoLabel}>{t('storage.maxVolumeLabel')}</span>
                        <span className={styles.infoValue}>{maxVolume?.toFixed(2)}m³</span>

                        <span className={styles.infoLabel}>{t('storage.fillRate')}</span>
                        <span className={styles.infoValue}>{fillRate.toFixed(2)}%</span>
                    </div>

                    {lotInfors.map((lot, index) => (
                        <div className={styles.infoGrid} key={`${lot.lotnumber}-${index}`}>
                            <span className={styles.infoLabel}>{t('storage.storedLot')}</span>
                            <span className={styles.infoValue}>{lot.lotnumber}</span>

                            <span className={styles.infoLabel}>{t('storage.storedQty')}</span>
                            <span className={styles.infoValue}>{lot.quantity} {lot.unitOfMeasure}</span>

                            <span className={styles.infoLabel}>{t('storage.usedVolume')}</span>
                            <span className={styles.infoValue}>{lot.usedVolume?.toFixed(2)}m³ ({maxVolume ? ((lot.usedVolume / maxVolume) * 100).toFixed(2) : '0.00'}%)</span>
                        </div>
                    ))}

                    <ActionButton
                        style={{ width: '100%', margin: '8px 0 0', padding: '14px', fontSize: '14px' }}
                        onClick={(e) => {
                            e.stopPropagation(); // Prevent event from bubbling up
                            onViewDetails();
                        }}
                    >
                        {t('storage.viewDetails')}
                    </ActionButton>

                    <ActionButton
                        variant="secondary"
                        style={{ width: '100%', margin: '8px 0 0', padding: '14px', fontSize: '14px' }}
                        onClick={handleClose}
                    >
                        {t('common.close')}
                    </ActionButton>
                </>
            )}
        </div>

    );
};

export default DetailModal;
