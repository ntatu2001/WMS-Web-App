import React, { useEffect, useState } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import ContentContainer from '../../../../../common/components/ContentContainer/ContentContainer.jsx';
import { ClipLoader } from 'react-spinners';
// import { getReceiptLayoutScheduling } from '../../../../../app/mockData/LocationData.js';
import schedulingApi from '../../../../../api/schedulingApi.js';
import InforReceiptModal from './../../InforModal/InforReceiptModal.jsx';
import Tag from '../../../../../common/components/Tag/Tag.jsx';
import styles from './ReceiptDistribution.module.scss';

const ReceiptDistribution = ({warehouseId, isActive}) => {
    const [loading, setLoading] = useState(false);
    const [dataTable, setDataTable] = useState({});
    const [dataFetched, setDataFetched] = useState(false);
    const DEFAULT_ROWS = 4;
    const [selectedCell, setSelectedCell] = useState(null);
    const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
    const [showModal, setShowModal] = useState(false);
    const [hoveredCellInfo, setHoveredCellInfo] = useState(null);

    // Reset dataFetched when warehouseId changes
    useEffect(() => {
        setDataFetched(false);
    }, [warehouseId]);

    useEffect(() => {
        const fetchData = async () => {
            // Only fetch data when the component is active and data hasn't been fetched yet
            if (isActive && !dataFetched) {
                setLoading(true);
                try {
                    const receiptLayoutScheduling = await schedulingApi.getReceiptLayoutScheduling(warehouseId);
                    // Process all locations data without filtering
                    const processedData = processLocationsData(receiptLayoutScheduling);
                    setDataTable(processedData);
                    setDataFetched(true);
                } catch (err) {
                    console.error("Error processing location data:", err);
                    setDataTable({});
                }
                setLoading(false);
            }
        };
        fetchData();
    }, [warehouseId, isActive, dataFetched]);

    // Function to handle cell click
    const handleCellClick = (cell, event) => {
        if (cell) {
            // Get the click position relative to the cell
            const cellRect = event.currentTarget.getBoundingClientRect();
            const relativeX = event.clientX - cellRect.left;
            const cellWidth = cellRect.width;
            
            // Calculate the percentage of the click position
            const clickPositionPercentage = relativeX / cellWidth;
            
            // Check if the click was on a material sublot
            let clickedMaterialSublot = null;
            let isOnMaterialPart = false;
            
            if (cell.allMaterialSubLots && cell.allMaterialSubLots.length > 0) {
                let startPosition = 0;
                
                for (let i = 0; i < cell.allMaterialSubLots.length; i++) {
                    const sublot = cell.allMaterialSubLots[i];
                    const endPosition = startPosition + sublot.storagePercentage;
                    
                    if (clickPositionPercentage > startPosition && clickPositionPercentage <= endPosition) {
                        clickedMaterialSublot = sublot;
                        isOnMaterialPart = true;
                        break;
                    }
                    
                    startPosition = endPosition;
                }
            }
            
            // Check which receipt sublot was clicked (if any)
            let clickedReceiptSublot = null;
            let isOnReceiptPart = false;
            
            if (cell.allReceiptSubLots && cell.allReceiptSubLots.length > 0 && !isOnMaterialPart) {
                let startPosition = cell.materialStoragePercentage;
                
                for (let i = 0; i < cell.allReceiptSubLots.length; i++) {
                    const sublot = cell.allReceiptSubLots[i];
                    const endPosition = startPosition + sublot.storagePercentage;
                    
                    if (clickPositionPercentage > startPosition && clickPositionPercentage <= endPosition) {
                        clickedReceiptSublot = sublot;
                        isOnReceiptPart = true;
                        break;
                    }
                    
                    startPosition = endPosition;
                }
            }
            
            // Check if this specific materialSubLot is full
            const isClickedMaterialSubLotFull = clickedMaterialSublot && clickedMaterialSublot.storagePercentage > 0.99;
            
            // Only proceed if the click was on a colored part (blue, red, or dark blue for full)
            if (isOnMaterialPart || isOnReceiptPart) {
                // Determine if the click was on material or receipt section
                let selectedDetails;
                
                if (isOnMaterialPart && clickedMaterialSublot) {
                    // Click was on the material section (blue or dark blue if full)
                    selectedDetails = {
                        locationId: cell.details.locationId,
                        status: isClickedMaterialSubLotFull ? "Đã đầy" : "Đang chứa hàng",
                        quantity: clickedMaterialSublot.existingQuantity,
                        lotNumber: clickedMaterialSublot.lotNumber,
                        storagePercentage: clickedMaterialSublot.storagePercentage,
                        warehouseId: cell.details.warehouseId,
                        warehouseName: cell.details.warehouseName,
                        equipmentName: cell.details.equipmentName,
                    };
                } else if (isOnReceiptPart && clickedReceiptSublot) {
                    // Click was on a receipt section (red)
                    selectedDetails = {
                        locationId: cell.details.locationId,
                        status: "Được phân bổ",
                        quantity: clickedReceiptSublot.importedQuantity,
                        lotNumber: clickedReceiptSublot.lotNumber,
                        storagePercentage: clickedReceiptSublot.storagePercentage,
                        storageLevel: clickedReceiptSublot.storageLevel,
                        warehouseId: cell.details.warehouseId,
                        warehouseName: cell.details.warehouseName,
                        equipmentName: cell.details.equipmentName,
                    };
                }
                
                setSelectedCell({
                    position: cell.details.locationId,
                    selectedDetails: selectedDetails
                });
                
                setModalPosition({
                    top: event.clientY - 100,
                    left: event.clientX - 150
                });
                setShowModal(true);
            }
            // If click was on white area, do nothing (no modal will show)
        }
    };

    // Function to close modal
    const handleCloseModal = () => {
        setShowModal(false);
    };
    
    // Function to process location data into visualization grid
    const processLocationsData = (locations) => {
        if (!Array.isArray(locations) || locations.length === 0) return {};

        // Group by section and rack
        const sections = {};
        
        // Structure: TP01.1.1.1.1 format where:
        // TP01 = warehouse prefix
        // 1 = section
        // 1 = rack
        // 1 = column
        // 1 = row
        locations.forEach(location => {
            const locParts = location.locationId.split('.');
            if (locParts.length < 4) return; // Skip if not properly formatted
            
            // Get section from first two parts (e.g., TP01.1)
            const sectionPrefix = locParts[0];
            const sectionNumber = locParts.length > 1 ? locParts[1] : '';
            const section = sectionNumber ? `${sectionPrefix}.${sectionNumber}` : sectionPrefix;
            const sectionId = section.replace('.', '_');
            
            // Get rack number (third part, e.g., 1 from TP01.1.1)
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
                    locationMap: {}
                };
                
                // For a format like TP01.1.1.1.7, we want columns from .1 to .7
                for (let i = 1; i <= 7; i++) {
                    // Create column header like TP01.1.1.i
                    sections[sectionId].racks[fullSectionId].columns.push(`${rackId}.${i}`);
                }
                
                // Initialize rows
                for (let i = 1; i <= DEFAULT_ROWS; i++) {
                    sections[sectionId].racks[fullSectionId].rows.push(Array(7).fill(null));
                }
            }
        });
        
        // Second pass: place locations in the grid based on correct column and row indices
        locations.forEach(location => {
            const locParts = location.locationId.split('.');
            if (locParts.length < 5) return; // We need all 5 parts: TP01.1.1.1.1
            
            // Extract section and rack for lookup
            const sectionPrefix = locParts[0];
            const sectionNumber = locParts[1];
            const section = `${sectionPrefix}.${sectionNumber}`;
            const sectionId = section.replace('.', '_');
            
            const rackNumber = locParts[2];
            const fullSectionId = `${sectionId}_${rackNumber}`;
            
            if (!sections[sectionId] || !sections[sectionId].racks[fullSectionId]) return;
            
            // Get column and row indices from location parts
            // For format like TP01.1.1.3.4:
            // Column index is the 4th part (3) - 1 = 2 (0-indexed)
            // Row index is the 5th part (4) - 1 = 3 (0-indexed)
            const colIndex = parseInt(locParts[3], 10) - 1;
            const rowIndex = parseInt(locParts[4], 10) - 1;
            
            // Validate indices
            if (isNaN(colIndex) || colIndex < 0 || colIndex >= 7) return;
            if (isNaN(rowIndex) || rowIndex < 0 || rowIndex >= DEFAULT_ROWS) return;
            
            // Calculate material storage percentage (from existing items)
            let materialStoragePercentage = 0;
            if (location.materialSubLots && location.materialSubLots.length > 0) {
                materialStoragePercentage += location.materialSubLots.reduce((sum, subLot) => 
                    sum + (subLot.storagePercentage || 0), 0);
            }
            
            // Check if there are receipt sublots (allocated items)
            const hasReceiptSubLots = location.receiptSubLots && 
                                     location.receiptSubLots.length > 0 && 
                                     location.receiptSubLots.some(subLot => subLot.storagePercentage > 0);
            
            // Calculate receipt storage percentage
            const receiptStoragePercentage = hasReceiptSubLots ? 
                location.receiptSubLots.reduce((sum, subLot) => sum + (subLot.storagePercentage || 0), 0) : 0;
            
            // Calculate total storage percentage (for full calculation)
            let totalStoragePercentage = materialStoragePercentage + receiptStoragePercentage;
            
            // Determine status based on receipt sublots and material percentage
            let status = "Trống"; // Default to empty
            
            // Check if any single materialSubLot has storagePercentage of 100%
            const hasFullMaterialSubLot = location.materialSubLots && 
                location.materialSubLots.some(subLot => subLot.storagePercentage > 0.95);
                
            if (hasFullMaterialSubLot) {
                status = "Đã đầy";
            } else if (materialStoragePercentage > 0) {
                status = "Đang chứa hàng";
            } else if (receiptStoragePercentage > 0) {
                status = "Được phân bổ";
            }
            
            // Get first material display value for status display
            let materialDisplayValue = "";
            if (location.materialSubLots && location.materialSubLots.length > 0) {
                const existingQuantity = location.materialSubLots[0].existingQuantity;
                const lotNumber = location.materialSubLots[0].lotNumber || "";
                materialDisplayValue = `${lotNumber} (${existingQuantity})`;
            }
            
            // Get receipt display value
            let receiptDisplayValue = "";
            if (hasReceiptSubLots) {
                const receiptSublot = location.receiptSubLots[0];
                const receiptQuantity = receiptSublot.importedQuantity;
                const receiptLotNumber = receiptSublot.lotNumber;
                receiptDisplayValue = `${receiptLotNumber} (${receiptQuantity})`;
            }
            
            // Create cell data
            const cell = {
                materialDisplayValue: materialDisplayValue,
                receiptDisplayValue: receiptDisplayValue,
                status: status,
                materialStoragePercentage: materialStoragePercentage,
                receiptStoragePercentage: receiptStoragePercentage,
                totalStoragePercentage: totalStoragePercentage,
                details: {
                    locationId: location.locationId,
                    status: status,
                    quantity: location.materialSubLots && location.materialSubLots.length > 0 
                        ? location.materialSubLots[0].existingQuantity 
                        : (location.receiptSubLots && location.receiptSubLots.length > 0 
                            ? location.receiptSubLots[0].importedQuantity 
                            : 0),
                    lotNumber: location.materialSubLots && location.materialSubLots.length > 0 
                        ? location.materialSubLots[0].lotNumber 
                        : (location.receiptSubLots && location.receiptSubLots.length > 0 
                            ? location.receiptSubLots[0].lotNumber 
                            : ""),
                    storagePercentage: location.materialSubLots && location.materialSubLots.length > 0 
                        ? location.materialSubLots[0].storagePercentage 
                        : (location.receiptSubLots && location.receiptSubLots.length > 0 
                            ? location.receiptSubLots[0].storagePercentage 
                            : 0),
                    warehouseId: location.warehouseId || "",
                    warehouseName: location.warehouseName || "",
                    equipmentName: location.equipmentName || "",
                    storageLevel: location.receiptSubLots && location.receiptSubLots.length > 0 
                        ? location.receiptSubLots[0].storageLevel 
                        : "",
                }
            };
            
            // Add all material sublots to the cell for rendering multiple sections
            if (location.materialSubLots && location.materialSubLots.length > 0) {
                cell.allMaterialSubLots = location.materialSubLots;
            }
            
            // Add all receipt sublots to the cell for rendering multiple sections
            if (location.receiptSubLots && location.receiptSubLots.length > 0) {
                cell.allReceiptSubLots = location.receiptSubLots;
            }
            
            // Place cell in the grid
            sections[sectionId].racks[fullSectionId].rows[rowIndex][colIndex] = cell;
        });
        
        // Clean up the locationMap from each rack
        Object.values(sections).forEach(section => {
            Object.values(section.racks).forEach(rack => {
                delete rack.locationMap;
            });
        });
        
        return sections;
    };

    // Function to check if mouse is over a colored part of a cell
    const isOverColoredPart = (cell, mousePositionPercentage) => {
        if (!cell) return false;
        
        // Check if over any material part
        let isOnMaterialPart = false;
        if (cell.allMaterialSubLots && cell.allMaterialSubLots.length > 0) {
            let startPosition = 0;
            
            for (let i = 0; i < cell.allMaterialSubLots.length; i++) {
                const sublot = cell.allMaterialSubLots[i];
                const endPosition = startPosition + sublot.storagePercentage;
                
                if (mousePositionPercentage > startPosition && mousePositionPercentage <= endPosition) {
                    isOnMaterialPart = true;
                    break;
                }
                
                startPosition = endPosition;
            }
        }
        
        // Check if over any receipt part
        let isOnReceiptPart = false;
        if (cell.allReceiptSubLots && cell.allReceiptSubLots.length > 0) {
            let startPosition = cell.materialStoragePercentage;
            
            for (let i = 0; i < cell.allReceiptSubLots.length; i++) {
                const sublot = cell.allReceiptSubLots[i];
                const endPosition = startPosition + sublot.storagePercentage;
                
                if (mousePositionPercentage > startPosition && mousePositionPercentage <= endPosition) {
                    isOnReceiptPart = true;
                    break;
                }
                
                startPosition = endPosition;
            }
        }
        
        return isOnMaterialPart || isOnReceiptPart;
    };
    
    // Mouse move handler for cell
    const handleCellMouseMove = (cell, event) => {
        if (!cell) return;
        
        const cellRect = event.currentTarget.getBoundingClientRect();
        const relativeX = event.clientX - cellRect.left;
        const cellWidth = cellRect.width;
        
        // Calculate the percentage of the mouse position
        const mousePositionPercentage = relativeX / cellWidth;
        
        setHoveredCellInfo({
            cellId: `${event.currentTarget.getAttribute('data-cell-id')}`,
            isOverColoredPart: isOverColoredPart(cell, mousePositionPercentage)
        });
    };
    
    // Handle mouse leave for cell
    const handleCellMouseLeave = () => {
        setHoveredCellInfo(null);
    };

    // Function to render a cell
    const renderCell = (cell, cellIndex, rowIndex) => {
        const cellId = `${cellIndex}-${rowIndex}`;
        const isHovered = hoveredCellInfo && hoveredCellInfo.cellId === cellId;
        const cursorStyle = !cell ? 'default' : 
                           (isHovered && hoveredCellInfo.isOverColoredPart) ? 'pointer' : 'default';
        
        return (
            <div
                key={cellId}
                data-cell-id={cellId}
                className={styles.cell}
                style={{ cursor: cursorStyle }}
                onClick={(e) => cell && handleCellClick(cell, e)}
                onMouseMove={(e) => handleCellMouseMove(cell, e)}
                onMouseLeave={handleCellMouseLeave}
            >
                {/* Background div for empty state or full state */}
                <div 
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        backgroundColor: "var(--color-surface)",
                        zIndex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        textAlign: "center"
                    }}
                />
                
                {/* Multiple Material storage percentage divs - blue */}
                {cell && cell.allMaterialSubLots && (
                    <>
                        {cell.allMaterialSubLots.map((subLot, index) => {
                            // Calculate the starting position for this sublot
                            const previousSublotsWidth = cell.allMaterialSubLots
                                .slice(0, index)
                                .reduce((sum, sl) => sum + (sl.storagePercentage || 0), 0);
                            
                            // Starting position after previous material sublots
                            const startPosition = previousSublotsWidth;
                            
                            // Check if total storage percentage is full
                            const totalStoragePercentage = cell.allMaterialSubLots.reduce((sum, sl) => sum + (sl.storagePercentage || 0), 0);
                            const isTotalFull = totalStoragePercentage > 0.95;
                            const backgroundColor = isTotalFull ? "#00294D" : "#0089D7";
                            
                            return subLot.storagePercentage > 0 ? (
                                <div
                                    key={subLot.materialSublotId || `material-${index}`}
                                    style={{
                                        position: "absolute",
                                        top: 0,
                                        left: `${Math.min(startPosition * 100, 100)}%`,
                                        width: `${Math.min(subLot.storagePercentage * 100, 100 - startPosition * 100)}%`,
                                        height: "100%",
                                        backgroundColor: backgroundColor,
                                        zIndex: 2,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        textAlign: "center",
                                        overflow: "hidden",
                                        fontSize: subLot.storagePercentage < 0.18 ? 
                                            "6px" : 
                                            (subLot.storagePercentage < 0.4 ? 
                                                `${Math.max(10, subLot.storagePercentage * 20)}px` : 
                                                "14px"),
                                        whiteSpace: "normal",
                                        wordBreak: "break-word",
                                        boxSizing: "border-box",
                                        padding: "0 2px",
                                        borderRight: "1px solid var(--color-border)",
                                    }}
                                >
                                    <span style={{ color: "#FFF" }}>
                                        {subLot.storagePercentage < 0.1 ? 
                                            subLot.lotNumber : 
                                            `${subLot.lotNumber} (${subLot.existingQuantity})`}
                                    </span>
                                </div>
                            ) : null;
                        })}
                    </>
                )}
                
                {/* Multiple Receipt storage percentage divs - red */}
                {cell && cell.allReceiptSubLots && (
                    <>
                        {cell.allReceiptSubLots.map((subLot, index) => {
                            // Calculate the starting position for this sublot
                            const previousSublotsWidth = cell.allReceiptSubLots
                                .slice(0, index)
                                .reduce((sum, sl) => sum + (sl.storagePercentage || 0), 0);
                            
                            // Starting position is after material storage + previous receipt sublots
                            const startPosition = cell.materialStoragePercentage + previousSublotsWidth;
                            
                            return subLot.storagePercentage > 0 ? (
                                <div
                                    key={subLot.receiptSublotId || `receipt-${index}`}
                                    style={{
                                        position: "absolute",
                                        top: 0,
                                        left: `${Math.min(startPosition * 100, 100)}%`,
                                        width: `${Math.min(subLot.storagePercentage * 100, 100 - startPosition * 100)}%`,
                                        height: "100%", 
                                        backgroundColor: "#FF2115",
                                        zIndex: 2,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        textAlign: "center",
                                        overflow: "hidden",
                                        fontSize: subLot.storagePercentage < 0.18 ? 
                                            "6px" :     
                                            (subLot.storagePercentage < 0.4 ? 
                                                `${Math.max(10, subLot.storagePercentage * 20)}px` : 
                                                "14px"),
                                        whiteSpace: "normal",
                                        wordBreak: "break-word",
                                        boxSizing: "border-box",
                                        padding: "0 2px",
                                        borderRight: "1px solid var(--color-border)",
                                    }}
                                >
                                    <span style={{ color: "#FFF" }}>
                                        {subLot.storagePercentage < 0.1 ? 
                                            subLot.lotNumber : 
                                            `${subLot.lotNumber} (${subLot.importedQuantity})`}
                                    </span>
                                </div>
                            ) : null;
                        })}
                    </>
                )}
            </div>
        );
    };

    return (
        <>
            {loading ? (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "200px" }}>
                    <ClipLoader size={35} color="var(--color-teal)" />
                </div>
            ) : (
                <div className={styles.wrapper}>
                    {/* Legend */}
                    <div className={styles.legend}>
                        <span className={styles.legendKicker}>Chú giải:</span>
                        <div className={styles.legendRow}>
                            <div className={styles.legendSwatch} style={{ backgroundColor: '#0089D7' }}></div>
                            <span>Đang chứa hàng</span>
                        </div>

                        <div className={styles.legendRow}>
                            <div className={styles.legendSwatch} style={{ backgroundColor: '#00294D' }}></div>
                            <span>Đã đầy</span>
                        </div>

                        <div className={styles.legendRow}>
                            <div className={styles.legendSwatch} style={{ backgroundColor: '#FF2115' }}></div>
                            <span>Được phân bổ</span>
                        </div>

                        <div className={styles.legendRow}>
                            <div className={styles.legendSwatch} style={{ backgroundColor: 'var(--color-surface)' }}></div>
                            <span>Đang trống</span>
                        </div>
                    </div>

                    <div className={styles.gridArea}>
                        {Object.entries(dataTable || {})
                            .sort(([sectionA], [sectionB]) => {
                                // Extract the number part from section IDs like "TP01_4", "TP01_3", etc.
                                const numA = parseInt(sectionA.split('_')[1] || '0', 10);
                                const numB = parseInt(sectionB.split('_')[1] || '0', 10);
                                // Sort in descending order (higher numbers first)
                                return numB - numA;
                            })
                            .map(([sectionId, sectionData]) => {
                                const { racks, parentSection } = sectionData;
                                // Get rack entries and sort them
                                const rackEntries = Object.entries(racks).sort(([rackIdA], [rackIdB]) => {
                                    const rackNumA = parseInt(rackIdA.split('_').pop(), 10);
                                    const rackNumB = parseInt(rackIdB.split('_').pop(), 10);
                                    return rackNumB - rackNumA;
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
                                                    const rackNumber = rack.rackId.split('.').pop();

                                                    return (
                                                        <div key={rackKey} className={styles.rack}>
                                                            <Tag variant="neutral" className={styles.rackLabel}>Dãy kệ {rackNumber}</Tag>

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
                                                                            {row.map((cell, cellIndex) => renderCell(cell, cellIndex, rowIndex))}
                                                                        </div>
                                                                    ))}
                                                                </div>

                                                                <div className={styles.floorColumn} style={{ gridTemplateRows: `repeat(${rowsCount}, 64px)` }}>
                                                                    {reversedRows.map((_, rowIndex) => (
                                                                        <div key={rowIndex} className={styles.floorCell}>{DEFAULT_ROWS - rowIndex}</div>
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

                    {/* Modal */}
                    {showModal && selectedCell && (
                        <InforReceiptModal
                            data={selectedCell}
                            onClose={handleCloseModal}
                            position={modalPosition}
                            isLoading={false}
                        />
                    )}
                </div>
            )}
        </>
    );
};

export default ReceiptDistribution;