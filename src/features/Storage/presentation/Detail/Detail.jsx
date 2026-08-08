import React, { useState, useEffect } from 'react';
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
import styles from './Detail.module.scss';

const STATUS_COLORS = {
    'Đang chứa hàng': '#0089D7',
    'Đã đầy': '#00294D',
};

const getStatusColor = (status) => STATUS_COLORS[status] || '#98989b';

const Detail = ({ data, activeTab }) => {
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedDate1, setSelectedDate1] = useState(null);
    const [stockLocationHistories, setStockLocationHistories] = useState([]);

    useEffect(() => {
        const fetchStockLocationHistories = async () => {
            const response = await locationApi.getStockLocationHistoriesByLocationId(data.position, '', '');
            setStockLocationHistories(response);
        };
        fetchStockLocationHistories();
    }, []);

    useEffect(() => {
        const fetchStockLocationHistories = async () => {
            if (selectedDate && selectedDate1) {
                const response = await locationApi.getStockLocationHistoriesByLocationId(
                    data.position,
                    new Date(selectedDate).toISOString(),
                    new Date(selectedDate1).toISOString()
                );
                setStockLocationHistories(response);
            }
        };
        if (selectedDate && selectedDate1) {
            fetchStockLocationHistories();
        }
    }, [selectedDate, selectedDate1]);

    const details = data.selectedDetails;
    const lotInfors = details?.lotInfors || [];
    const hasStock = lotInfors.length > 0;
    const selectedLot = data.selectedLotNumber
        ? lotInfors.find(lot => lot.lotnumber === data.selectedLotNumber)
        : lotInfors[0];
    const maxVolume = details?.maxVolume;
    const usableVolume = details?.usableVolume;
    const storageRate = maxVolume ? (usableVolume >= maxVolume ? 100 : (usableVolume / maxVolume) * 100) : 0;

    return (
        <div className={styles.page}>
            <div className={styles.headerRow}>
                <div className={styles.headerLeft}>
                    <button className={styles.backButton} onClick={() => activeTab('storage')} aria-label="Quay lại">
                        <AiFillCaretLeft />
                    </button>
                    <HeaderContainer style={{ width: 'auto', whiteSpace: 'nowrap' }}>
                        <HeaderItem>Lưu trữ</HeaderItem>
                        <Separator />
                        <HeaderItem>Chi tiết vị trí lưu trữ</HeaderItem>
                    </HeaderContainer>
                </div>

                <div className={styles.dateFilters}>
                    <div className={styles.filterField}>
                        <span className={styles.filterLabel}>Từ ngày</span>
                        <DateInput selectedDate={selectedDate} onChange={setSelectedDate} />
                    </div>
                    <div className={styles.filterField}>
                        <span className={styles.filterLabel}>Đến ngày</span>
                        <DateInput selectedDate={selectedDate1} onChange={setSelectedDate1} />
                    </div>
                </div>
            </div>

            <div className={styles.content}>
                <div className={styles.infoCard}>
                    <h2 className={styles.infoTitle}>Vị trí {data.position}</h2>

                    <img src={Image} alt="Thiết bị lưu trữ" className={styles.photo} />

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
                        <span className={styles.statusTag} style={{ backgroundColor: getStatusColor(details?.status) }}>
                            {details?.status}
                        </span>

                        <span className={styles.infoLabel}>Tỷ lệ lưu trữ:</span>
                        <span className={styles.infoValue}>{storageRate.toFixed(2)}%</span>
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
                        </div>
                    )}
                </div>

                <div className={styles.historyCard}>
                    <h2 className={styles.historyTitle}>Lịch sử lưu trữ</h2>

                    {stockLocationHistories.length === 0 ? (
                        <div className={styles.emptyState}>Không có lịch sử lưu trữ trong khoảng thời gian đã chọn.</div>
                    ) : (
                        <div className={styles.tableWrapper}>
                            <Table className={styles.tableInner}>
                                <thead>
                                    <tr>
                                        <TableHeader style={{ width: '5%' }}>STT</TableHeader>
                                        <TableHeader style={{ width: '30%' }}>Sản phẩm</TableHeader>
                                        <TableHeader style={{ width: '10%' }}>Lô hàng</TableHeader>
                                        <TableHeader style={{ width: '10%' }}>Số lượng nhập</TableHeader>
                                        <TableHeader style={{ width: '10%' }}>Số lượng xuất</TableHeader>
                                        <TableHeader style={{ width: '10%' }}>Số lượng tồn</TableHeader>
                                        <TableHeader style={{ width: '10%' }}>Ngày nhập</TableHeader>
                                        <TableHeader style={{ width: '10%' }}>Ngày xuất</TableHeader>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stockLocationHistories.map((item, index) => (
                                        <tr key={index}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>{item.materialName}</TableCell>
                                            <TableCell>{item.lotNumber}</TableCell>
                                            <TableCell>{item.inboundQuantity}</TableCell>
                                            <TableCell>{item.outboundQuantity}</TableCell>
                                            <TableCell>{item.availableQuantity}</TableCell>
                                            <TableCell>{new Date(item.receiptDate).toLocaleDateString()}</TableCell>
                                            <TableCell>{item.issueDate ? new Date(item.issueDate).toLocaleDateString() : '--'}</TableCell>
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
