import React, { useState, useEffect, useRef } from 'react';
import { AiFillCaretLeft } from 'react-icons/ai';
import 'react-datepicker/dist/react-datepicker.css';
import HeaderContainer from '../../../../common/components/Header/HeaderContainer.jsx';
import HeaderItem from '../../../../common/components/Header/HeaderItem.jsx';
import Separator from '../../../../common/components/Header/Separator.jsx';
import DateInput from '../../../../common/components/DateInput/DateInput.jsx';
import Table from '../../../../common/components/Table/Table.jsx';
import TableHeader from '../../../../common/components/Table/TableHeader.jsx';
import TableCell from '../../../../common/components/Table/TableCell.jsx';
import Image from '../../../../assets/image.png';
import locationApi from '../../../../api/locationApi';
import materiaLotApi from '../../../../api/materiaLotApi.js';
import materialApi from '../../../../api/materialApi.js';
import useTranslation from '../../../../common/hooks/useTranslation';
import { formatDate } from '../../../../common/i18n/format';
import { cellStatusLabelKey, resolveLabel } from '../../../../common/i18n/labels';
import styles from './Detail.module.scss';

const STATUS_COLORS = {
    'Đang chứa hàng': '#0089D7',
    'Đã đầy': '#00294D',
};

const getStatusColor = (status) => STATUS_COLORS[status] || '#98989b';

const Detail = ({ data, activeTab }) => {
    const { t, lang } = useTranslation();
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedDate1, setSelectedDate1] = useState(null);
    const [stockLocationHistories, setStockLocationHistories] = useState([]);
    const [currentLotRows, setCurrentLotRows] = useState([]);
    const pageRef = useRef(null);

    // Trang này thường được mở khi người dùng đã cuộn sâu trong lưới "Sơ đồ kho" — vì cả 2
    // đều render bên trong cùng vùng cuộn của layout, vị trí cuộn cũ bị giữ nguyên và che mất
    // tiêu đề. Tự tìm ancestor có thể cuộn gần nhất và đưa về đầu khi trang này vừa mount.
    useEffect(() => {
        let node = pageRef.current?.parentElement;
        while (node) {
            const style = window.getComputedStyle(node);
            if (/(auto|scroll)/.test(style.overflowY) && node.scrollHeight > node.clientHeight) {
                node.scrollTop = 0;
                break;
            }
            node = node.parentElement;
        }
    }, []);

    useEffect(() => {
        const fetchStockLocationHistories = async () => {
            try {
                const response = await locationApi.getStockLocationHistoriesByLocationId(data.position, '', '');
                setStockLocationHistories(response || []);
            } catch (error) {
                console.error('Error fetching stock location histories:', error);
                setStockLocationHistories([]);
            }
        };
        fetchStockLocationHistories();
    }, []);

    useEffect(() => {
        if (!selectedDate || !selectedDate1) return;

        const fetchStockLocationHistories = async () => {
            try {
                const response = await locationApi.getStockLocationHistoriesByLocationId(
                    data.position,
                    new Date(selectedDate).toISOString(),
                    new Date(selectedDate1).toISOString()
                );
                setStockLocationHistories(response || []);
            } catch (error) {
                console.error('Error fetching stock location histories:', error);
                setStockLocationHistories([]);
            }
        };
        fetchStockLocationHistories();
    }, [selectedDate, selectedDate1]);

    // Lô đang lưu trữ tại vị trí này (nếu có) chưa chắc đã xuất hiện trong lịch sử nhập/xuất
    // (còn đang mở, chưa có giao dịch xuất) — hiển thị mặc định khi chưa lọc theo ngày, để người
    // dùng luôn thấy thông tin lô hiện tại mà không cần chọn Từ ngày/Đến ngày.
    useEffect(() => {
        const lotInfors = data.selectedDetails?.lotInfors || [];
        if (lotInfors.length === 0) {
            setCurrentLotRows([]);
            return;
        }

        let cancelled = false;

        const fetchCurrentLotRows = async () => {
            const rows = await Promise.all(lotInfors.map(async (lot) => {
                const lotNumber = lot.lotnumber;
                let materialName = '--';
                try {
                    const lotDetail = await materiaLotApi.getMaterialLotById(lotNumber);
                    if (lotDetail?.materialId) {
                        const material = await materialApi.getMaterialById(lotDetail.materialId);
                        materialName = material?.materialName || '--';
                    }
                } catch (error) {
                    console.error('Error fetching current lot material info:', error);
                }
                return {
                    materialName,
                    lotNumber,
                    inboundQuantity: '--',
                    outboundQuantity: '--',
                    availableQuantity: lot.quantity,
                    receiptDate: null,
                    issueDate: null,
                };
            }));
            if (!cancelled) setCurrentLotRows(rows);
        };

        fetchCurrentLotRows();
        return () => { cancelled = true; };
    }, [data.selectedDetails]);

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
    const storageRate = details?.storageRate ?? 0;

    // Chưa chọn Từ ngày/Đến ngày => ghép thêm thông tin lô đang lưu trữ (nếu có) lên đầu bảng,
    // bỏ qua lô nào đã có sẵn trong lịch sử để tránh hiển thị trùng.
    const isFilteringByDate = Boolean(selectedDate && selectedDate1);
    const historyLotNumbers = new Set(stockLocationHistories.map((item) => item.lotNumber));
    const displayedRows = isFilteringByDate
        ? stockLocationHistories
        : [
            ...currentLotRows.filter((row) => !historyLotNumbers.has(row.lotNumber)),
            ...stockLocationHistories,
        ];

    return (
        <div className={styles.page} ref={pageRef}>
            <div className={styles.headerRow}>
                <div className={styles.headerLeft}>
                    <button className={styles.backButton} onClick={() => activeTab('storage')} aria-label={t('storage.back')}>
                        <AiFillCaretLeft />
                    </button>
                    <HeaderContainer style={{ width: 'auto', whiteSpace: 'nowrap' }}>
                        <HeaderItem>{t('storage.heading')}</HeaderItem>
                        <Separator />
                        <HeaderItem>{t('storage.detailHeading')}</HeaderItem>
                    </HeaderContainer>
                </div>

                <div className={styles.dateFilters}>
                    <div className={styles.filterField}>
                        <span className={styles.filterLabel}>{t('storage.fromDate')}</span>
                        <DateInput selectedDate={selectedDate} onChange={setSelectedDate} />
                    </div>
                    <div className={styles.filterField}>
                        <span className={styles.filterLabel}>{t('storage.toDate')}</span>
                        <DateInput selectedDate={selectedDate1} onChange={setSelectedDate1} />
                    </div>
                </div>
            </div>

            <div className={styles.content}>
                <div className={styles.infoCard}>
                    <h2 className={styles.infoTitle}>{t('storage.modalPosition', { pos: data.position })}</h2>

                    <img src={Image} alt={t('storage.storageEquipmentAlt')} className={styles.photo} />

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
                        <span className={styles.statusTag} style={{ backgroundColor: getStatusColor(details?.status) }}>
                            {resolveLabel(cellStatusLabelKey, details?.status, t)}
                        </span>

                        <span className={styles.infoLabel}>{t('storage.storageRateLabel')}</span>
                        <span className={styles.infoValue}>{storageRate.toFixed(2)}%</span>
                    </div>

                    {hasStock && (
                        <div className={styles.infoGrid}>
                            <span className={styles.infoLabel}>{t('storage.storedLot')}</span>
                            <span className={styles.infoValue}>{selectedLot?.lotnumber}</span>

                            <span className={styles.infoLabel}>{t('storage.storedQty')}</span>
                            <span className={styles.infoValue}>{selectedLot?.quantity}</span>

                            <span className={styles.infoLabel}>{t('storage.usedVolume')}</span>
                            <span className={styles.infoValue}>{usableVolume >= maxVolume ? maxVolume?.toFixed(2) : usableVolume?.toFixed(2)}</span>

                            <span className={styles.infoLabel}>{t('storage.maxVolumeLabel')}</span>
                            <span className={styles.infoValue}>{maxVolume?.toFixed(2)}</span>
                        </div>
                    )}
                </div>

                <div className={styles.historyCard}>
                    <h2 className={styles.historyTitle}>{t('storage.storageHistory')}</h2>

                    {displayedRows.length === 0 ? (
                        <div className={styles.emptyState}>{t('storage.noHistory')}</div>
                    ) : (
                        <div className={styles.tableWrapper}>
                            <Table className={styles.tableInner}>
                                <thead>
                                    <tr>
                                        <TableHeader style={{ width: '5%' }}>{t('storage.colNo')}</TableHeader>
                                        <TableHeader style={{ width: '30%' }}>{t('storage.colProduct')}</TableHeader>
                                        <TableHeader style={{ width: '10%' }}>{t('storage.colLot')}</TableHeader>
                                        <TableHeader style={{ width: '10%' }}>{t('storage.colInQty')}</TableHeader>
                                        <TableHeader style={{ width: '10%' }}>{t('storage.colOutQty')}</TableHeader>
                                        <TableHeader style={{ width: '10%' }}>{t('storage.colOnHandQty')}</TableHeader>
                                        <TableHeader style={{ width: '10%' }}>{t('storage.colInDate')}</TableHeader>
                                        <TableHeader style={{ width: '10%' }}>{t('storage.colOutDate')}</TableHeader>
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayedRows.map((item, index) => (
                                        <tr key={index}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>{item.materialName}</TableCell>
                                            <TableCell>{item.lotNumber}</TableCell>
                                            <TableCell>{item.inboundQuantity}</TableCell>
                                            <TableCell>{item.outboundQuantity}</TableCell>
                                            <TableCell>{item.availableQuantity}</TableCell>
                                            <TableCell>{item.receiptDate ? formatDate(item.receiptDate, lang) : '--'}</TableCell>
                                            <TableCell>{item.issueDate ? formatDate(item.issueDate, lang) : '--'}</TableCell>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Detail;
