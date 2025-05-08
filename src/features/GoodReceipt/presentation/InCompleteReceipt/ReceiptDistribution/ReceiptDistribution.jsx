import React, { useEffect, useState } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import ContentContainer from '../../../../../common/components/ContentContainer/ContentContainer.jsx';
import { ClipLoader } from 'react-spinners';
// import { getReceiptLayoutScheduling } from '../../../../../app/mockData/LocationData.js';
import schedulingApi from '../../../../../api/schedulingApi.js';

const ReceiptDistribution = ({warehouseId, isActive}) => {
    const [loading, setLoading] = useState(false);
    const [dataTable, setDataTable] = useState({});
    const [dataFetched, setDataFetched] = useState(false);
    const DEFAULT_ROWS = 4;

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
            } else if (materialStoragePercentage > 0 || receiptStoragePercentage > 0) {
                status = "Đang chứa hàng";
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
                    materialSubLots: location.materialSubLots || [],
                    receiptSubLots: location.receiptSubLots || []
                }
            };
            
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
                                                                    {row.map((cell, cellIndex) => (
                                                                        <td
                                                                            key={`${cellIndex}-${rowIndex}`}
                                                                            style={{
                                                                                position: "relative",
                                                                                border: "2px solid #000",
                                                                                minWidth: "130px",
                                                                                height: "50px",
                                                                                overflow: "hidden",
                                                                                padding: 0,
                                                                            }}
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
                                                                            
                                                                            {/* Receipt storage percentage div - red */}
                                                                            {cell && cell.receiptStoragePercentage > 0 && cell.status !== "Đã đầy" && (
                                                                                <div
                                                                                    style={{
                                                                                        position: "absolute",
                                                                                        top: 0,
                                                                                        left: `${Math.min(cell.materialStoragePercentage * 100, 100)}%`,
                                                                                        width: `${Math.min(cell.receiptStoragePercentage * 100, 100 - cell.materialStoragePercentage * 100)}%`,
                                                                                        height: "100%", 
                                                                                        backgroundColor: "#FF2115",
                                                                                        zIndex: 2,
                                                                                        display: "flex",
                                                                                        alignItems: "center",
                                                                                        justifyContent: "center",
                                                                                        textAlign: "center",
                                                                                        overflow: "hidden",
                                                                                        fontSize: cell.receiptStoragePercentage < 0.18 ? 
                                                                                            "6px" :     
                                                                                            (cell.receiptStoragePercentage < 0.4 ? 
                                                                                                `${Math.max(10, cell.receiptStoragePercentage * 20)}px` : 
                                                                                                "14px"),
                                                                                        whiteSpace: "normal",
                                                                                        wordBreak: "break-word",
                                                                                        boxSizing: "border-box",
                                                                                        padding: "0 2px",
                                                                                        borderRight: "1px solid #000",
                                                                          
                                                                                    }}
                                                                                >
                                                                                    <span style={{ color: "#FFF" }}>
                                                                                        {cell.receiptStoragePercentage < 0.1 ? 
                                                                                            cell.receiptDisplayValue.split(' ')[0] : 
                                                                                            cell.receiptDisplayValue}
                                                                                    </span>
                                                                                </div>
                                                                            )}
                                                                        </td>
                                                                    ))}
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
                                                                    {row.map((cell, cellIndex) => (
                                                                        <td
                                                                            key={`${cellIndex}-${rowIndex}`}
                                                                            style={{
                                                                                position: "relative",
                                                                                border: "2px solid #000",
                                                                                minWidth: "130px",
                                                                                height: "50px",
                                                                                overflow: "hidden",
                                                                                padding: 0,
                                                                            }}
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
                                                                            
                                                                            {/* Receipt storage percentage div - red */}
                                                                            {cell && cell.receiptStoragePercentage > 0 && cell.status !== "Đã đầy" && (
                                                                                <div
                                                                                    style={{
                                                                                        position: "absolute",
                                                                                        top: 0,
                                                                                        left: `${Math.min(cell.materialStoragePercentage * 100, 100)}%`,
                                                                                        width: `${Math.min(cell.receiptStoragePercentage * 100, 100 - cell.materialStoragePercentage * 100)}%`,
                                                                                        height: "100%", 
                                                                                        backgroundColor: "#FF2115",
                                                                                        zIndex: 2,
                                                                                        display: "flex",
                                                                                        alignItems: "center",
                                                                                        justifyContent: "center",
                                                                                        textAlign: "center",
                                                                                        overflow: "hidden",
                                                                                        fontSize: cell.receiptStoragePercentage < 0.18 ? 
                                                                                            "6px" : 
                                                                                            (cell.receiptStoragePercentage < 0.4 ? 
                                                                                                `${Math.max(10, cell.receiptStoragePercentage * 20)}px` : 
                                                                                                "14px"),
                                                                                        whiteSpace: "normal",
                                                                                        wordBreak: "break-word",
                                                                                        boxSizing: "border-box",
                                                                                        padding: "0 2px",
                                                                                        borderRight: "1px solid #000",
                                                                           
                                                                                    }}
                                                                                >
                                                                                    <span style={{ color: "#FFF" }}>
                                                                                        {cell.receiptStoragePercentage < 0.1 ? 
                                                                                            cell.receiptDisplayValue.split(' ')[0] : 
                                                                                            cell.receiptDisplayValue}
                                                                                    </span>
                                                                                </div>
                                                                            )}
                                                                        </td>
                                                                    ))}
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
                        right: "2%", 
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
                </div>
            )}
        </>
    );
};

export default ReceiptDistribution;