import React, { useEffect, useState } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import ContentContainer from '../../../../../common/components/ContentContainer/ContentContainer.jsx';
import { ClipLoader } from 'react-spinners';
// import { getReceiptLayoutScheduling } from '../../../../../app/mockData/LocationData.js';
import schedulingApi from '../../../../../api/schedulingApi.js';
import InforReceiptModal from './../../InforModal/InforReceiptModal.jsx';

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
            
            // Check if the click was on material part
            const isOnMaterialPart = clickPositionPercentage <= cell.materialStoragePercentage;
            const isFullCell = cell.status === "Đã đầy";
            
            // Check which receipt sublot was clicked (if any)
            let clickedReceiptSublot = null;
            let isOnReceiptPart = false;
            
            if (cell.allReceiptSubLots && cell.allReceiptSubLots.length > 0 && !isOnMaterialPart && !isFullCell) {
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
            
            // Only proceed if the click was on a colored part (blue, red, or dark blue for full)
            if (isOnMaterialPart || isOnReceiptPart || isFullCell) {
                // Determine if the click was on material or receipt section
                let selectedDetails;
                
                if (isFullCell) {
                    // If the cell is full, always use material details
                    selectedDetails = {
                        locationId: cell.details.locationId,
                        status: "Đã đầy",
                        quantity: cell.details.quantity,
                        lotNumber: cell.details.lotNumber,
                        storagePercentage: cell.details.storagePercentage,
                        warehouseId: cell.details.warehouseId,
                        warehouseName: cell.details.warehouseName,
                        equipmentName: cell.details.equipmentName,
                    };
                } else if (isOnMaterialPart) {
                    // Click was on the material section (blue)
                    selectedDetails = {
                        locationId: cell.details.locationId,
                        status: "Đang chứa hàng",
                        quantity: cell.details.quantity,
                        lotNumber: cell.details.lotNumber,
                        storagePercentage: cell.materialStoragePercentage,
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
            
            // If material storage nearly 100%, mark as full
            if (materialStoragePercentage >= 0.95) {
                status = "Đã đầy";
            } else if (materialStoragePercentage > 0 ) {
                status = "Đang chứa hàng";
            } else if (receiptStoragePercentage > 0) {
                status = "Được phân bổ";
            }
            
            // Get material display value
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
                }
            };
            
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
        
        // Check if over material part
        const isOnMaterialPart = mousePositionPercentage <= cell.materialStoragePercentage;
        
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
        
        const isFullCell = cell.status === "Đã đầy";
        
        return isOnMaterialPart || isOnReceiptPart || isFullCell;
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
            <td
                key={cellId}
                data-cell-id={cellId}
                style={{
                    position: "relative",
                    border: "2px solid #000",
                    minWidth: "130px",
                    height: "50px",
                    overflow: "hidden",
                    padding: 0,
                    cursor: cursorStyle
                }}
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
                        backgroundColor: cell && cell.status === "Đã đầy" ? "#00294D" : "#FFF",
                        zIndex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        textAlign: "center"
                    }}
                >
                    {cell && cell.status === "Đã đầy" && (
                        <div style={{ color: "#FFF", whiteSpace: "normal", wordBreak: "break-word", padding: "2px" }}>
                            {cell.materialDisplayValue}
                        </div>
                    )}
                </div>
                
                {/* Material storage percentage div - blue */}
                {cell && cell.materialStoragePercentage > 0 && cell.status !== "Đã đầy" && (
                    <div
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: `${Math.min(cell.materialStoragePercentage * 100, 100)}%`,
                            height: "100%",
                            backgroundColor: "#0089D7",
                            zIndex: 2,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            textAlign: "center",
                            overflow: "hidden",
                            fontSize: cell.materialStoragePercentage < 0.18 ? 
                                "6px" : 
                                (cell.materialStoragePercentage < 0.4 ? 
                                    `${Math.max(10, cell.materialStoragePercentage * 20)}px` : 
                                    "14px"),
                            whiteSpace: "normal",
                            wordBreak: "break-word",
                            boxSizing: "border-box",
                            padding: "0 2px",
                            borderRight: "1px solid #000",
                        }}
                    >
                        <span style={{ color: "#FFF" }}>
                            {cell.materialStoragePercentage < 0.1 ? 
                                cell.materialDisplayValue.split(' ')[0] : 
                                cell.materialDisplayValue}
                        </span>
                    </div>
                )}
                
                {/* Multiple Receipt storage percentage divs - red */}
                {cell && cell.allReceiptSubLots && cell.status !== "Đã đầy" && (
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
                                    key={subLot.receiptSublotId}
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
                                        borderRight: "1px solid #000",
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
            </td>
        );
    };

    return (
        <>
            {loading ? (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "200px" }}>
                    <ClipLoader size={35} color="#0066CC" />
                </div>
            ) : (
                <div style={{
                    backgroundColor: '#f5f5f5', 
                    width: "100%",
                    minHeight: "100vh",
                }}>
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
                                return rackNumA - rackNumB;
                            });
                            
                            return (
                                <div key={sectionId} style={{ marginBottom: "20px" }}>
                                    <div style={{display: "flex", alignItems: "center"}}>
                                        <h2 style={{ width: '100px', textAlign: "center", fontWeight: "bold", fontSize: "20px", marginRight: "2%"}}>{parentSection}</h2>
                <div>
                                            {/* First rack table */}
                                            {rackEntries.length > 0 && (
                                                <div key={rackEntries[0][0]} style={{ marginBottom: "10px" }}>
                                                    <table>
                                                        <thead>
                                                            <tr>
                                                                {rackEntries[0][1].columns.map((col, index) => (
                                                                    <th 
                                                                        key={index}
                                                                        style={{ padding: "8px 16px", backgroundColor: "#f0f0f0", borderBottom: "1px solid #ccc", minWidth: "100px", textAlign: "center" }}
                                                                    >
                                                                        {col}
                                                                    </th>
                                                                ))}
                                                                <th style={{ width: "30px", padding: "8px", backgroundColor: "#f0f0f0", borderBottom: "1px solid #ccc", textAlign: "center" }}></th>
                                                            </tr>
                                                        </thead>
                                                        
                                                        <tbody>
                                                            {rackEntries[0][1].rows.slice().reverse().map((row, rowIndex) => (
                                                                <tr key={rowIndex}>
                                                                    {row.map((cell, cellIndex) => 
                                                                        renderCell(cell, cellIndex, rowIndex)
                                                                    )}
                                                                    <td 
                                                                        style={{
                                                                            textAlign: "center",
                                                                            height: "40px",
                                                                            width: "30px"
                                                                        }}
                                                                    >
                                                                        {DEFAULT_ROWS - rowIndex}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                            
                                            {/* Second rack table - Header moved to bottom */}
                                            {rackEntries.length > 1 && (
                                                <div key={rackEntries[1][0]}>
                                                    <table>
                                                        <tbody>
                                                            {rackEntries[1][1].rows.slice().reverse().map((row, rowIndex) => (
                                                                <tr key={rowIndex}>
                                                                    {row.map((cell, cellIndex) => 
                                                                        renderCell(cell, cellIndex, rowIndex)
                                                                    )}
                                                                    <td 
                                                                        style={{
                                                                            textAlign: "center",
                                                                            height: "40px",
                                                                            width: "30px"
                                                                        }}
                                                                    >
                                                                        {DEFAULT_ROWS - rowIndex}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                        <tfoot>
                                                            <tr>
                                                                {rackEntries[1][1].columns.map((col, index) => (
                                                                    <th 
                                                                        key={index}
                                                                        style={{ padding: "8px 16px", backgroundColor: "#f0f0f0", borderTop: "1px solid #ccc", minWidth: "100px", textAlign: "center" }}
                                                                    >
                                                                        {col}
                                                                    </th>
                                                                ))}
                                                                <th style={{ width: "30px", padding: "8px", backgroundColor: "#f0f0f0", borderTop: "1px solid #ccc", textAlign: "center" }}></th>
                                                            </tr>
                                                        </tfoot>
                                                    </table>
                        </div>
                    )}
                </div>
                                    </div>
                                </div>
                            );
                        })}
                    
                    {/* Legend */}
                    <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        right: "1%", 
                        top: '30%', 
                        width: "auto", 
                        backgroundColor: "rgba(245, 245, 245, 0.9)",
                        padding: "10px",
                        borderRadius: "8px",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                        position: "fixed",
                    }}>
                        <div style={{display: 'flex', alignItems: "center", marginBottom: "20%"}}>
                            <div style={{ backgroundColor: '#0089D7', height: '40px', width: '40px', borderRadius: "6px", marginRight: "10px"}}></div>
                            <span>Đang chứa hàng</span>
                        </div>
                        
                        <div style={{display: 'flex', alignItems: "center", marginBottom: "20%"}}>
                            <div style={{ backgroundColor: '#00294D', height: '40px', width: '40px', borderRadius: "6px", marginRight: "10px" }}></div>
                            <span>Đã đầy</span>
                        </div>
                        
                        <div style={{display: 'flex', alignItems: "center", marginBottom: "20%"}}>
                            <div style={{ backgroundColor: '#FF2115', height: '40px', width: '40px', borderRadius: "6px", marginRight: "10px" }}></div>
                            <span>Được phân bổ</span>
                        </div>

                        <div style={{display: 'flex', alignItems: "center", marginBottom: "10px"}}>
                            <div style={{ backgroundColor: '#FFFFFF', height: '40px', width: '40px', borderRadius: "6px", marginRight: "10px" }}></div>
                            <span>Đang trống</span>
                        </div>
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