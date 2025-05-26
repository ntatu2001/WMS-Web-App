import React, { useEffect, useState } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import ContentContainer from '../../../../../common/components/ContentContainer/ContentContainer.jsx';
import { ClipLoader } from 'react-spinners';
import schedulingApi from '../../../../../api/schedulingApi.js';
import InforIssueModal from './../../InforModal/InforIssueModal.jsx';

const IssueDistribution = ({warehouseId, isActive}) => {
    const [loading, setLoading] = useState(false);
    const [dataTable, setDataTable] = useState({});
    const [dataFetched, setDataFetched] = useState(false);
    const DEFAULT_ROWS = 4;
    const [selectedCell, setSelectedCell] = useState(null);
    const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
    const [showModal, setShowModal] = useState(false);
    const [hoveredCellInfo, setHoveredCellInfo] = useState(null);
    // Reset dataFetched when warehouseId changes
    console.log(dataTable)
    useEffect(() => {
        setDataFetched(false);
    }, [warehouseId]);

    useEffect(() => {
        const fetchData = async () => {
            // Only fetch data when the component is active and data hasn't been fetched yet
            if (isActive && !dataFetched) {
                setLoading(true);
                try {
                    const issueLayoutScheduling = await schedulingApi.getIssueLayoutScheduling(warehouseId);
                    // Process all locations data without filtering
                    const processedData = processLocationsData(issueLayoutScheduling);
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
            
            // Check if the click was on an issue sublot
            let clickedIssueSublot = null;
            let isOnIssuePart = false;
            
            if (cell.allIssueSubLots && cell.allIssueSubLots.length > 0 && !isOnMaterialPart) {
                let startPosition = cell.materialStoragePercentage;
                
                for (let i = 0; i < cell.allIssueSubLots.length; i++) {
                    const sublot = cell.allIssueSubLots[i];
                    const endPosition = startPosition + sublot.storagePercentage;
                    
                    if (clickPositionPercentage > startPosition && clickPositionPercentage <= endPosition) {
                        clickedIssueSublot = sublot;
                        isOnIssuePart = true;
                        break;
                    }
                    
                    startPosition = endPosition;
                }
            }
            
            const isFullCell = cell.status === "Đã đầy";
            
            // Only proceed if the click was on a colored part (blue, red, or dark blue for full)
            if (isOnMaterialPart || isOnIssuePart || isFullCell) {
                // Determine if the click was on material or issue section
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
                } else if (isOnMaterialPart && clickedMaterialSublot) {
                    // Click was on the material section (blue)
                    selectedDetails = {
                        locationId: cell.details.locationId,
                        status: "Đang chứa hàng",
                        quantity: clickedMaterialSublot.existingQuantity,
                        lotNumber: clickedMaterialSublot.lotNumber,
                        storagePercentage: clickedMaterialSublot.storagePercentage,
                        warehouseId: cell.details.warehouseId,
                        warehouseName: cell.details.warehouseName,
                        equipmentName: cell.details.equipmentName,
                    };
                } else if (isOnIssuePart && clickedIssueSublot) {
                    // Click was on the issue section (red)
                    selectedDetails = {
                        locationId: cell.details.locationId,
                        status: "Được phân bổ",
                        quantity: clickedIssueSublot.requestedQuantity,
                        lotNumber: clickedIssueSublot.lotNumber,
                        storagePercentage: clickedIssueSublot.storagePercentage,
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
            
            // Check if there are issue sublots (allocated items)
            const hasIssueSubLots = location.issueSubLots && 
                                     location.issueSubLots.length > 0 && 
                                     location.issueSubLots.some(subLot => subLot.storagePercentage > 0);
            
            // Calculate issue storage percentage
            const issueStoragePercentage = hasIssueSubLots ? 
                location.issueSubLots.reduce((sum, subLot) => sum + (subLot.storagePercentage || 0), 0) : 0;
            
            // Calculate total storage percentage
            let totalStoragePercentage = materialStoragePercentage + issueStoragePercentage;
            
            // Determine status based on issue sublots and material percentage
            let status = "Trống"; // Default to empty
            
            // Check total material storage percentage for full status
            const totalMaterialStoragePercentage = location.materialSubLots ? 
                location.materialSubLots.reduce((sum, subLot) => sum + (subLot.storagePercentage || 0), 0) : 0;
                
            if (totalMaterialStoragePercentage > 0.95) {
                status = "Đã đầy";
            } else if (materialStoragePercentage > 0) {
                status = "Đang chứa hàng";
            } else if (issueStoragePercentage > 0) {
                status = "Được phân bổ";
            }
            
            // Get first material display value for status display
            let materialDisplayValue = "";
            if (location.materialSubLots && location.materialSubLots.length > 0) {
                const existingQuantity = location.materialSubLots[0].existingQuantity;
                const lotNumber = location.materialSubLots[0].lotNumber || "";
                materialDisplayValue = `${lotNumber} (${existingQuantity})`;
            }
            
            // Get first issue display value for status display
            let issueDisplayValue = "";
            if (hasIssueSubLots) {
                const issueSublot = location.issueSubLots[0];
                const issueQuantity = issueSublot.requestedQuantity;
                const issueLotNumber = issueSublot.lotNumber;
                issueDisplayValue = `${issueLotNumber} (${issueQuantity})`;
            }
            
            // Create cell data
            const cell = {
                materialDisplayValue: materialDisplayValue,
                issueDisplayValue: issueDisplayValue,
                status: status,
                materialStoragePercentage: materialStoragePercentage,
                issueStoragePercentage: issueStoragePercentage,
                totalStoragePercentage: totalStoragePercentage,
                details: {
                    locationId: location.locationId,
                    status: status,
                    quantity: location.materialSubLots && location.materialSubLots.length > 0 
                        ? location.materialSubLots[0].existingQuantity 
                        : (location.issueSubLots && location.issueSubLots.length > 0 
                            ? location.issueSubLots[0].requestedQuantity 
                            : 0),
                    lotNumber: location.materialSubLots && location.materialSubLots.length > 0 
                        ? location.materialSubLots[0].lotNumber 
                        : (location.issueSubLots && location.issueSubLots.length > 0 
                            ? location.issueSubLots[0].lotNumber 
                            : ""),
                    storagePercentage: location.materialSubLots && location.materialSubLots.length > 0 
                        ? location.materialSubLots[0].storagePercentage 
                        : (location.issueSubLots && location.issueSubLots.length > 0 
                            ? location.issueSubLots[0].storagePercentage 
                            : 0),
                    warehouseId: location.warehouseId || "",
                    warehouseName: location.warehouseName || "",
                    equipmentName: location.equipmentName || "",
                }
            };
            
            // Add all material sublots to the cell for rendering multiple sections
            if (location.materialSubLots && location.materialSubLots.length > 0) {
                cell.allMaterialSubLots = location.materialSubLots;
            }
            
            // Add all issue sublots to the cell for rendering multiple sections
            if (location.issueSubLots && location.issueSubLots.length > 0) {
                cell.allIssueSubLots = location.issueSubLots;
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
        
        // Check if over any issue part
        let isOnIssuePart = false;
        if (cell.allIssueSubLots && cell.allIssueSubLots.length > 0) {
            let startPosition = cell.materialStoragePercentage;
            
            for (let i = 0; i < cell.allIssueSubLots.length; i++) {
                const sublot = cell.allIssueSubLots[i];
                const endPosition = startPosition + sublot.storagePercentage;
                
                if (mousePositionPercentage > startPosition && mousePositionPercentage <= endPosition) {
                    isOnIssuePart = true;
                    break;
                }
                
                startPosition = endPosition;
            }
        }
        
        const isFullCell = cell.status === "Đã đầy";
        
        return isOnMaterialPart || isOnIssuePart || isFullCell;
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
                
                {/* Multiple Material storage percentage divs - blue */}
                {cell && cell.allMaterialSubLots && cell.status !== "Đã đầy" && (
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
                                        borderRight: "1px solid #000",
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
                
                {/* Multiple Issue storage percentage divs - red */}
                {cell && cell.allIssueSubLots && cell.status !== "Đã đầy" && (
                    <>
                        {cell.allIssueSubLots.map((subLot, index) => {
                            // Calculate the starting position for this sublot
                            const previousSublotsWidth = cell.allIssueSubLots
                                .slice(0, index)
                                .reduce((sum, sl) => sum + (sl.storagePercentage || 0), 0);
                            
                            // Starting position is after material storage + previous issue sublots
                            const startPosition = cell.materialStoragePercentage + previousSublotsWidth;
                            
                            return subLot.storagePercentage > 0 ? (
                                <div
                                    key={subLot.issueSublotId || `issue-${index}`}
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
                                            `${subLot.lotNumber} (${subLot.requestedQuantity})`}
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
                            const numA = parseInt(sectionA.split('_')[1] || '0', 10);
                            const numB = parseInt(sectionB.split('_')[1] || '0', 10);
                            return numB - numA;
                        })
                        .map(([sectionId, sectionData]) => {
                            const { racks, parentSection } = sectionData;
                            const rackEntries = Object.entries(racks).sort(([rackIdA], [rackIdB]) => {
                                const rackNumA = parseInt(rackIdA.split('_').pop(), 10);
                                const rackNumB = parseInt(rackIdB.split('_').pop(), 10);
                                return rackNumB - rackNumA;
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
                        <InforIssueModal 
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

export default IssueDistribution;