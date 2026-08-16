import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import DetailModal from '../Modal/DetailModal.jsx';
import Detail from '../Detail/Detail.jsx';
import HeaderContainer from '../../../../common/components/Header/HeaderContainer.jsx';
import HeaderItem from '../../../../common/components/Header/HeaderItem.jsx';
import Separator from '../../../../common/components/Header/Separator.jsx';
import SelectContainer from '../../../../common/components/Selection/SelectContainer.jsx';
import Select from '../../../../common/components/Selection/Select.jsx';
import Tag from '../../../../common/components/Tag/Tag.jsx';
import locationApi from '../../../../api/locationApi.js';
import wareHouseApi from '../../../../api/wareHouseApi.js';
import { ClipLoader } from 'react-spinners';
import styles from './Storage.module.scss';

const STATUS_COLORS = {
    'Đang chứa hàng': '#0089D7',
    'Đã đầy': '#00294D',
};

const getCellColor = (status) => STATUS_COLORS[status] || '#FFFFFF';

const Storage = () => {
    const [activeTab, setActiveTab] = useState('storage'); // Trạng thái tab hiện tại
    const [selectedDetails, setSelectedDetails] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const DEFAULT_ROWS = 4;
    const [curPoint, setCurPoint] = useState();
    const [modalPosition, setModalPosition] = useState();
    const [wareHouse, setWareHouse] = useState([]);
    const [selectedWareHouse, setSelectedWareHouse] = useState('Kho Ban thanh pham');
    const [selectedZone, setSelectedZone] = useState('BTP01');
    const [dataTable, setDataTable] = useState({});
    const [locationId, SetLocationId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalLoading, setIsModalLoading] = useState(false);
    const [selectedLotNumber, setSelectedLotNumber] = useState(null);
    const [selectedLotForDetail, setSelectedLotForDetail] = useState(null);

    useEffect(() => {
        const GetInforByLocationId = async () => {
            setIsModalLoading(true);
            try {
                const dataDetail = await locationApi.GetInforByLocationId(locationId);
                setSelectedDetails(dataDetail);
            } catch (error) {
                console.error("Error fetching location info:", error);
            } finally {
                setIsModalLoading(false);
            }
        };

        if (locationId) {
            GetInforByLocationId();
        }
    }, [locationId]);

    useEffect(() => {
        const GetWarehouses = async () => {
            setIsLoading(true);
            try {
                const wareHouseList = await wareHouseApi.getAllWarehouseNameId();
                setWareHouse(wareHouseList);
            } catch (error) {
                console.error("Error fetching warehouses:", error);
            } finally {
                setIsLoading(false);
            }
        };

        GetWarehouses();
    }, []);

    // Khi đổi Kho hàng (hoặc khi danh sách kho vừa tải xong), tự động chọn Mã kho hàng
    // đầu tiên thuộc kho đó để hiển thị ngay Sơ đồ kho, không bắt người dùng chọn thêm.
    useEffect(() => {
        const codesForSelectedWarehouse = wareHouse
            .filter(w => w.warehouseName === selectedWareHouse)
            .map(w => w.warehouseId);

        if (codesForSelectedWarehouse.length > 0 && !codesForSelectedWarehouse.includes(selectedZone)) {
            setSelectedZone(codesForSelectedWarehouse[0]);
        }
    }, [selectedWareHouse, wareHouse, selectedZone]);

    // Add useEffect to fix body overflow
    useEffect(() => {
        // Add a style tag to handle global overflow
        const style = document.createElement('style');
        style.textContent = `
            html, body {
            overflow: hidden !important;
            height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            }
        `;
        document.head.appendChild(style);

        return () => {
            document.head.removeChild(style);
        };
    }, []);

    const handleViewDetails = () => {
        setSelectedLotForDetail(selectedLotNumber); // Lưu lại lotNumber được chọn khi chuyển sang Detail
        setActiveTab('detail');
        setShowModal(false);
    };

    const handleCellClick = (cell, point, e, locationId, selectedLot = null) => {
        // Cho phép mở popup cho cả ô Trống (chỉ hiển thị thông tin cơ bản trong modal)
        if (cell && cell.details) {
            if (!showModal || selectedLot) {
                setSelectedLotNumber(selectedLot);
            }

            const rect = e.currentTarget.getBoundingClientRect();
            setModalPosition({
                top: rect.bottom + window.scrollY - 300,
                left: rect.left + window.scrollX
            });

            setCurPoint(point);
            SetLocationId(locationId);

            setShowModal(true);
        }
    };


    // Process warehouse data to create visualization grid
    useEffect(() => {
        setDataTable({});

        if (!selectedZone) return;

        try {
            const GetLocations = async () => {
                setIsLoading(true);
                try {
                    const locationList = await locationApi.GetLocationsByWarehouseId(selectedZone);
                    if (Array.isArray(locationList) && locationList.length > 0) {
                        const filteredLocations = locationList.filter(location =>
                            location.locationId.includes(selectedZone)
                        );
                        const processedData = processLocationsData(filteredLocations);
                        setDataTable(processedData);
                    }
                } catch (error) {
                    console.error("Error fetching locations:", error);
                } finally {
                    setIsLoading(false);
                }
            }

            GetLocations();
        } catch (err) {
            console.error("Error processing warehouse data:", err);
            setDataTable({});
        }
    }, [selectedZone]);

    // Function to process location data into visualization grid
    const processLocationsData = (locations) => {
        if (!Array.isArray(locations) || locations.length === 0) return {};

        // Group by section and rack
        const sections = {};

        locations.forEach(location => {
            const locParts = location.locationId.split('.');
            if (locParts.length < 4) return; // Skip if not properly formatted

            // Get section from first two parts (e.g., BB01.1)
            const sectionPrefix = locParts[0];
            const sectionNumber = locParts.length > 1 ? locParts[1] : '';
            const section = sectionNumber ? `${sectionPrefix}.${sectionNumber}` : sectionPrefix;
            const sectionId = section.replace('.', '_');

            // Get rack number (third part, e.g., 1 from BB01.1.1)
            const rackNumber = locParts.length > 2 ? locParts[2] : '1';
            const rackId = `${section}.${rackNumber}`;
            const fullSectionId = `${sectionId}_${rackNumber}`;

            // Initialize parent section if not exists
            if (!sections[sectionId]) {
                sections[sectionId] = {
                    racks: {},
                    parentSection: section
                };
            }

            // Initialize rack if not exists
            if (!sections[sectionId].racks[fullSectionId]) {
                sections[sectionId].racks[fullSectionId] = {
                    columns: [],
                    rows: [],
                    rackId: rackId,
                    rackNumber,
                    locationMap: {}
                };

                // For a format like BB01.1.1.1.7, we want columns from .1 to .7
                for (let i = 1; i <= 7; i++) {
                    // Create column header like BB01.1.1.i
                    sections[sectionId].racks[fullSectionId].columns.push(`${rackId}.${i}`);
                }

                // Initialize rows
                for (let i = 1; i <= DEFAULT_ROWS; i++) {
                    sections[sectionId].racks[fullSectionId].rows.push(Array(7).fill(null));
                }
            }
        });

        // Second pass: place locations in the grid
        locations.forEach(location => {
            const locParts = location.locationId.split('.');
            if (locParts.length < 5) return;

            const sectionPrefix = locParts[0];
            const sectionNumber = locParts[1];
            const section = `${sectionPrefix}.${sectionNumber}`;
            const sectionId = section.replace('.', '_');

            const rackNumber = locParts[2];
            const fullSectionId = `${sectionId}_${rackNumber}`;

            if (!sections[sectionId] || !sections[sectionId].racks[fullSectionId]) return;

            const colIndex = parseInt(locParts[3], 10) - 1;
            const rowIndex = parseInt(locParts[4], 10) - 1;

            if (isNaN(colIndex) || colIndex < 0 || colIndex >= 7) return;
            if (isNaN(rowIndex) || rowIndex < 0 || rowIndex >= DEFAULT_ROWS) return;

            // Calculate equal division width for each lotInfo
            const lotInfors = location.lotInfors || [];
            const hasLotInfors = lotInfors.length > 0;
            const equalDivisionWidth = hasLotInfors ? (1 / lotInfors.length) : 1;

            // Create cell data
            const cell = {
                value: hasLotInfors ? lotInfors[0].lotNumber : "",
                status: location.storageStatus,
                details: {
                    locationId: location.locationId,
                    lotInfors: lotInfors,
                    warehouseId: location.warehouseId || "",
                    equipmentName: "Ô kệ chứa hàng"
                }
            };

            // Add all lotInfors to the cell for rendering multiple sections
            if (hasLotInfors) {
                cell.allLotInfors = lotInfors.map((lot, index) => ({
                    lotNumber: lot.lotnumber,
                    quantity: lot.quantity,
                    startPosition: index * equalDivisionWidth,
                    width: equalDivisionWidth
                }));
            }

            sections[sectionId].racks[fullSectionId].rows[rowIndex][colIndex] = cell;
        });

        return sections;
    };

    // Function to render a cell
    const renderCell = (cell, cellIndex, rowIndex, rackId, rowsCount) => {
        const realRowNum = rowsCount - rowIndex;
        const colNum = cellIndex + 1;
        const cellLocationId = cell?.details?.locationId || `${rackId}.${colNum}.${realRowNum}`;
        const isClickable = Boolean(cell && cell.details);
        const pointKey = `${rackId}-${cellIndex}-${rowIndex}`;

        return (
            <div
                key={pointKey}
                className={clsx(styles.cell, isClickable && styles.cellClickable)}
                onClick={(e) => handleCellClick(cell, pointKey, e, cellLocationId, null)}
                style={{ backgroundColor: cell ? getCellColor(cell.status) : '#FFFFFF' }}
                title={cellLocationId}
            >
                {cell && cell.allLotInfors && cell.allLotInfors.map((lot, index) => (
                    <div
                        key={`lot-${index}`}
                        className={styles.cellLot}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleCellClick(cell, pointKey, e, cellLocationId, lot.lotNumber);
                        }}
                        style={{
                            left: `${lot.startPosition * 100}%`,
                            width: `${lot.width * 100}%`,
                            backgroundColor: cell.status === "Đã đầy" ? "#00294D" : "#0089D7",
                            borderRight: index < cell.allLotInfors.length - 1 ? "1px solid #000" : "none",
                            fontSize: lot.width < 0.18 ?
                                "6px" :
                                (lot.width < 0.4 ?
                                    `${Math.max(10, lot.width * 20)}px` :
                                    "14px"),
                            padding: "0 2px"
                        }}
                    >
                        <span className={styles.cellLotLabel}>{lot.lotNumber}</span>
                    </div>
                ))}
                {(curPoint === pointKey && showModal) && (
                    <DetailModal
                        data={{ selectedDetails, position: cellLocationId, selectedLotNumber }}
                        onClose={() => {
                            setShowModal(false);
                            setSelectedLotNumber(null);
                        }}
                        position={modalPosition}
                        onViewDetails={handleViewDetails}
                        isLoading={isModalLoading}
                    />
                )}
            </div>
        );
    };

    const warehouseNameOptions = Array.from(new Set(wareHouse.map(w => w.warehouseName)));
    const zoneOptionsForSelectedWarehouse = wareHouse.filter(w => w.warehouseName === selectedWareHouse);

    return (
        <>
            {activeTab === 'storage' && (
                <div className={styles.page}>
                    {isLoading && (
                        <div className={styles.loadingOverlay}>
                            <ClipLoader color="#0089D7" size={50} />
                        </div>
                    )}

                    <div className={styles.headerRow}>
                        <HeaderContainer style={{ width: 'auto', whiteSpace: 'nowrap' }}>
                            <HeaderItem>Lưu trữ</HeaderItem>
                            <Separator />
                            <HeaderItem>Sơ đồ kho</HeaderItem>
                        </HeaderContainer>

                        <div className={styles.filters}>
                            <div className={styles.filterField}>
                                <span className={styles.filterLabel}>Kho hàng</span>
                                <SelectContainer>
                                    <Select
                                        onChange={(e) => setSelectedWareHouse(e.target.value)}
                                        value={selectedWareHouse}
                                    >
                                        {warehouseNameOptions.map((warehouseName, index) => (
                                            <option key={`warehouse-${index}`} value={warehouseName}>
                                                {warehouseName}
                                            </option>
                                        ))}
                                    </Select>
                                </SelectContainer>
                            </div>

                            <div className={styles.filterField}>
                                <span className={styles.filterLabel}>Mã kho hàng</span>
                                <SelectContainer>
                                    <Select
                                        onChange={(e) => setSelectedZone(e.target.value)}
                                        value={selectedZone}
                                    >
                                        {zoneOptionsForSelectedWarehouse.map((wareHouseEntry, index) => (
                                            <option key={`wareHouseCode-${index}`} value={wareHouseEntry.warehouseId}>
                                                {wareHouseEntry.warehouseId}
                                            </option>
                                        ))}
                                    </Select>
                                </SelectContainer>
                            </div>
                        </div>
                    </div>

                    <div className={styles.legend}>
                        <span className={styles.legendKicker}>Chú giải:</span>
                        <span className={styles.legendItem}>
                            <i className={styles.legendSwatch} style={{ backgroundColor: STATUS_COLORS['Đang chứa hàng'] }}></i>
                            Đang chứa hàng
                        </span>
                        <span className={styles.legendItem}>
                            <i className={styles.legendSwatch} style={{ backgroundColor: STATUS_COLORS['Đã đầy'] }}></i>
                            Đã đầy
                        </span>
                        <span className={styles.legendItem}>
                            <i className={styles.legendSwatch} style={{ backgroundColor: '#FFFFFF' }}></i>
                            Trống
                        </span>
                    </div>

                    <div className={styles.zoneList}>
                        {Object.entries(dataTable || {})
                            .sort(([sectionA], [sectionB]) => {
                                // Extract the number part from section IDs like "BB01_4", "BB01_3", etc.
                                const numA = parseInt(sectionA.split('_')[1] || '0', 10);
                                const numB = parseInt(sectionB.split('_')[1] || '0', 10);
                                // Sort in descending order (higher numbers first)
                                return numB - numA;
                            })
                            .map(([sectionId, sectionData]) => {
                                const { racks, parentSection } = sectionData;
                                // Get rack entries and sort them (highest rack number on top)
                                const rackEntries = Object.entries(racks).sort(([, rackA], [, rackB]) => {
                                    return parseInt(rackB.rackNumber, 10) - parseInt(rackA.rackNumber, 10);
                                });

                                return (
                                    <div key={sectionId} className={styles.zoneCard}>
                                        <div className={styles.zoneCardHeader}>
                                            <span className={styles.zoneKicker}>Khu vực</span>
                                            <h2 className={styles.zoneTitle}>{parentSection}</h2>
                                        </div>

                                        <div className={styles.rackScroll}>
                                            <div className={styles.rackList}>
                                                {rackEntries.map(([rackKey, rack], rackIndex) => {
                                                    const colsCount = rack.columns.length;
                                                    const rowsCount = rack.rows.length;
                                                    const isFirstRack = rackIndex === 0;
                                                    const isLastRack = rackIndex === rackEntries.length - 1;
                                                    const reversedRows = rack.rows.slice().reverse();

                                                    return (
                                                        <div key={rackKey} className={styles.rack}>
                                                            <Tag variant="neutral" className={styles.rackLabel}>Dãy kệ {rack.rackNumber}</Tag>

                                                            <div className={styles.rackGrid} style={{ gridTemplateColumns: '1fr 34px' }}>
                                                                {isFirstRack && (
                                                                    <>
                                                                        <div className={styles.colHeaderRow} style={{ gridTemplateColumns: `repeat(${colsCount}, 1fr)` }}>
                                                                            {rack.columns.map((col) => (
                                                                                <div key={col} className={styles.colHeaderCell}>{col}</div>
                                                                            ))}
                                                                        </div>
                                                                        <div className={styles.colHeaderSpacer}></div>
                                                                    </>
                                                                )}

                                                                <div className={styles.cellsColumn} style={{ gridTemplateRows: `repeat(${rowsCount}, 64px)` }}>
                                                                    {reversedRows.map((row, rowIndex) => (
                                                                        <div key={rowIndex} className={styles.cellRow} style={{ gridTemplateColumns: `repeat(${colsCount}, 1fr)` }}>
                                                                            {row.map((cell, cellIndex) => renderCell(cell, cellIndex, rowIndex, rack.rackId, rowsCount))}
                                                                        </div>
                                                                    ))}
                                                                </div>

                                                                <div className={styles.floorColumn} style={{ gridTemplateRows: `repeat(${rowsCount}, 64px)` }}>
                                                                    {reversedRows.map((_, rowIndex) => (
                                                                        <div key={rowIndex} className={styles.floorCell}>{rowsCount - rowIndex}</div>
                                                                    ))}
                                                                </div>

                                                                {isLastRack && (
                                                                    <>
                                                                        <div className={styles.colHeaderRow} style={{ gridTemplateColumns: `repeat(${colsCount}, 1fr)` }}>
                                                                            {rack.columns.map((col) => (
                                                                                <div key={col} className={styles.colHeaderCell}>{col}</div>
                                                                            ))}
                                                                        </div>
                                                                        <div className={styles.colHeaderSpacer}></div>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                </div>
            )}

            {/* Hiển thị trang Detail nếu activeTab là 'detail' */}
            {activeTab === 'detail' &&
                <Detail
                    data={{
                        selectedDetails,
                        position: locationId,
                        selectedLotNumber: selectedLotForDetail
                    }}
                    activeTab={setActiveTab}
                />
            }
        </>
    );
};

export default Storage;
