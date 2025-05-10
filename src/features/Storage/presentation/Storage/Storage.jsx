import React, { useState, useEffect } from 'react';
import DetailModal from '../Modal/DetailModal.jsx';
import Detail from '../Detail/Detail.jsx';
import { FaChevronDown } from 'react-icons/fa';
import HeaderContainer from '../../../../common/components/Header/HeaderContainer.jsx';
import HeaderItem from '../../../../common/components/Header/HeaderItem.jsx';
import Separator from '../../../../common/components/Header/Separator.jsx';
import Label from '../../../../common/components/Label/Label.jsx';
import SelectContainer from '../../../../common/components/Selection/SelectContainer.jsx';
import Select from '../../../../common/components/Selection/Select.jsx';
import DropdownIcon from '../../../../common/components/Icon/DropdownIcon.jsx';
import locationApi from '../../../../api/locationApi.js';
import wareHouseApi from '../../../../api/wareHouseApi.js';
import { ClipLoader } from 'react-spinners';

const Storage = () => {
    const [activeTab, setActiveTab] = useState('storage'); // Trạng thái tab hiện tại
    const [selectedDetails, setSelectedDetails] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const DEFAULT_ROWS = 4;
    const [curPoint,setCurPoint] =useState()
    const [modalPosition,setModalPosition] = useState()
    const [wareHouse,setWareHouse] = useState([])
    const [selectedWareHouse,setSelectedWareHouse] = useState('Kho Ban thanh pham')
    const [warehouseId,setWarehouseId] = useState(null)
    const [selectedZone,setSelectedZone] = useState('BTP01')
    const [dataTable, setDataTable] = useState({})
    const [locationId, SetLocationId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const GetInforByLocationId = async() => {
            setIsLoading(true);
            try {
                const dataDetail = await locationApi.GetInforByLocationId(locationId);
                setSelectedDetails(dataDetail);
            } catch (error) {
                console.error("Error fetching location info:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (locationId) {
            GetInforByLocationId();
        }
    }, [locationId]);

    useEffect(() => {
        const GetWarehouses = async() => {
            setIsLoading(true);
            try {
                const wareHouseList = await wareHouseApi.getAllWareHouses();
                setWareHouse(wareHouseList);
            } catch (error) {
                console.error("Error fetching warehouses:", error);
            } finally {
                setIsLoading(false);
            }
        };

        GetWarehouses();
    }, []);
   
    useEffect(() => {
        const GetWarehouseId = async() => {
            setIsLoading(true);
            try {
                const warehouseId = await wareHouseApi.getWarehouseIdByWarehouseName(selectedWareHouse);
                setWarehouseId(warehouseId[0]);
            } catch (error) {
                console.error("Error fetching warehouse ID:", error);
            } finally {
                setIsLoading(false);
            }
        };

        GetWarehouseId();
    }, [selectedWareHouse]);

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
      setActiveTab('detail'); // Cập nhật trạng thái tab
      setShowModal(false); // Đóng modal
  };

    const handleCellClick = (cell, point, e, locationId) => {
      if (cell && cell.details && cell.status !== "Trống") {
        const rect = e.currentTarget.getBoundingClientRect(); // Lấy vị trí của ô
        setModalPosition({
          top: rect.bottom + window.scrollY - 300, // Vị trí dưới ô
          left: rect.left + window.scrollX // Vị trí bên trái ô
        });
        
        setCurPoint(point);
        // Store cell position data
        SetLocationId(locationId);
        
        // For debugging - log the position
        console.log("locationId:", locationId);
        
        setShowModal(true);
      }
    };
  

    // Process warehouse data to create visualization grid
    useEffect(() => {
        setDataTable({});

        if (warehouseId === selectedZone) {
            try {
                const GetLocations = async() => {
                    setIsLoading(true);
                    try {
                        const locationList = await locationApi.GetLocationsByWarehouseId(selectedZone);
                        console.log(locationList)
                        if (Array.isArray(locationList) && locationList.length > 0) {
                            const filteredLocations = locationList.filter(location => 
                                location.locationId.includes(selectedZone)
                            );
                            const processedData = processWarehouseLocations(filteredLocations);
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
        }
    }, [warehouseId, selectedZone]);

    // Function to process location data into visualization grid
    const processWarehouseLocations = (locations) => {
        if (!Array.isArray(locations) || locations.length === 0) return {};

        // Group by section and rack
        const sections = {};
        
        // Structure: BB01.1.1.1.3 format where:
        // BB01 = warehouse
        // 1 = section
        // 1 = rack
        // 1 = column
        // 3 = row
        locations.forEach(location => {
            const locParts = location.locationId.split('.');
            if (locParts.length < 3) return; // Skip if not properly formatted
            
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
        
        // Second pass: place locations in the grid based on correct column and row indices
        locations.forEach(location => {
            const locParts = location.locationId.split('.');
            if (locParts.length < 5) return; // We need all 5 parts: BB01.1.1.1.1
            
            // Extract section and rack for lookup
            const sectionPrefix = locParts[0];
            const sectionNumber = locParts[1];
            const section = `${sectionPrefix}.${sectionNumber}`;
            const sectionId = section.replace('.', '_');
            
            const rackNumber = locParts[2];
            const fullSectionId = `${sectionId}_${rackNumber}`;
            
            if (!sections[sectionId] || !sections[sectionId].racks[fullSectionId]) return;
            
            // Get column and row indices from location parts
            // For format like BB01.1.1.3.4:
            // Column index is the 4th part (3) - 1 = 2 (0-indexed)
            // Row index is the 5th part (4) - 1 = 3 (0-indexed)
            const colIndex = parseInt(locParts[3], 10) - 1;
            const rowIndex = parseInt(locParts[4], 10) - 1;
            
            // Validate indices
            if (isNaN(colIndex) || colIndex < 0 || colIndex >= 7) return;
            if (isNaN(rowIndex) || rowIndex < 0 || rowIndex >= DEFAULT_ROWS) return;
            
            // Create cell data
            const cell = {
                value: locParts[locParts.length - 1], // Display the last part of location ID
                status: location.storageStatus || "Trống",
                details: {
                    locationId: location.locationId,
                    status: location.storageStatus || "Trống",
                    lotInfors: location.lotInfors || [],
                    warehouseId: selectedZone, 
                    equipmentName: "Ô kệ chứa hàng"
                }
            };

            // Show lotnumber in cell if available
            if (location.lotInfors && location.lotInfors.length > 0) {
                cell.lotnumber = location.lotInfors[0].lotnumber;
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

    return (
      <>
      {activeTab === 'storage' && (
        <div style={{
          backgroundColor: '#f5f5f5', 
          width: "100%", 
          height: "100vh", 
          position: "relative",
        }}>
            {isLoading && (
                <div style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 1000,
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    padding: '20px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                    <ClipLoader color="#0089D7" size={50} />
                </div>
            )}
            <div style={{
              display: "flex", 
              padding: "10px",
              top: 0,
              backgroundColor: '#f5f5f5',
              zIndex: 100
            }}>
                <HeaderContainer style={{marginRight: "5%"}}>
                    <HeaderItem>Lưu trữ</HeaderItem>
                    <Separator />
                    <HeaderItem>Sơ đồ kho</HeaderItem>
                </HeaderContainer>

                <Label style={{fontSize: "25px", width: "10%"}}>Kho hàng:</Label>
                <SelectContainer>
                    <Select style={{width: "90%", fontWeight: "500"}} 
                            onChange={(e) => setSelectedWareHouse(e.target.value)} 
                            value={selectedWareHouse}>
                        {wareHouse.map((warehouse, index) => (
                        <option key = {`warehouse-${index}`} value= {warehouse.warehouseName}> 
                        {warehouse.warehouseName}
                        </option>
                        ))}
                    </Select>
                </SelectContainer>

                <Label style={{fontSize: "25px", width: "13%"}}>Mã kho hàng:</Label>
                <SelectContainer>
                    <Select style={{width: "85%", fontWeight: "500"}} 
                            onChange={(e) => setSelectedZone(e.target.value)} 
                            value={selectedZone}>
                            {wareHouse.map((wareHouses, index) => (
                            <option key = {`wareHouses-${index}`} value= {wareHouses.warehouseId}>
                            {wareHouses.warehouseId}
                            </option>
                        ))}
                    </Select>
                </SelectContainer>
            </div>
      
            <div  style={{
              width: "100%",
              boxSizing: "border-box"
            }}>
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
                    // Get rack entries and sort them
                    const rackEntries = Object.entries(racks).sort(([rackIdA], [rackIdB]) => {
                    const rackNumA = parseInt(rackIdA.split('_').pop(), 10);
                    const rackNumB = parseInt(rackIdB.split('_').pop(), 10);
                    return rackNumA - rackNumB;
                    });
                    
                    return (
                    <div key={sectionId} className="mb-8">
                        <div style={{display: "flex", alignItems: "center"}}>
                            <h2  style={{ width: '100px', textAlign: "center", fontWeight: "bold", fontSize: "20px", marginRight: "2%"}}>{parentSection}</h2>
                            {/* Render racks in a column with the section header on the left between tables */}
                            <div className="flex flex-col">
                                {/* First rack table */}
                                {rackEntries.length > 0 && (
                                <div key={rackEntries[0][0]} className="mb-2 flex items-center">
                                    <div style={{overflowX: "visible"}}>
                                    <table className="w-full min-w-max">
                                        <thead>
                                        <tr>
                                            {rackEntries[0][1].columns.map((col, index) => (
                                            <th 
                                                key={index}
                                                className="px-4 py-2 bg-gray-100 border-b border-gray-300 text-left min-w-[100px] text-center"
                                            >
                                                {col}
                                            </th>
                                            ))}
                                            {/* Add empty header for row numbers column */}
                                            <th className="px-4 py-2 bg-gray-100 border-b border-gray-300 text-center" style={{width: "30px"}}></th>
                                        </tr>
                                        </thead>
                                        
                                        <tbody>
                                        {rackEntries[0][1].rows.slice().reverse().map((row, rowIndex) => (
                                            <tr key={rowIndex}>
                                            {row.map((cell, cellIndex) => {
                                            // Calculate the real row number (reverse the index)
                                            const realRowNum = DEFAULT_ROWS - rowIndex;
                                            // Create position info for this cell
                                            const colNum = cellIndex + 1;
                                            const locationId = `${rackEntries[0][1].rackId}.${colNum}.${realRowNum}`;
                     
                                        
                                            
                                            return (
                                            <td
                                                key={`${cellIndex}-${rowIndex}`}
                                                className={`... cursor-pointer`}
                                                onClick={(e) => handleCellClick(cell, `${rackEntries[0][0]}-${cellIndex}-${rowIndex}`, e, locationId)}
                                                style={{
                                                backgroundColor: cell && cell.status === "Đang chứa hàng" ? "#0089D7" 
                                                : cell && cell.status === "Đã đầy" ? "#00294D" : "#FFF",
                                           
                                                color: "#FFF",
                                                border: "2px solid #000",
                                                cursor: "pointer",
                                                position: "relative",
                                                minWidth: "130px",
                                                height: "50px",
                                                textAlign: "center",
                                                }}
                                                >
                                                {cell ? cell.lotnumber || "" : ""}
                                                {(curPoint === `${rackEntries[0][0]}-${cellIndex}-${rowIndex}` && showModal) && (
                                                    <DetailModal 
                                                    data={{selectedDetails, position: locationId}}
                                                    onClose={() => setShowModal(false)}
                                                    position={modalPosition}
                                                    onViewDetails={handleViewDetails}
                                                    />
                                                )}
                                            </td>
                                            );
                                            })}
                                            {/* Add row number cell */}
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
                                </div>
                                )}
                                
                                {/* Second rack table - Header moved to bottom */}
                                {rackEntries.length > 1 && (
                                <div key={rackEntries[1][0]} className="mt-0 flex items-center">
                                    <div style={{overflowX: "visible"}}>
                                    <table className="w-full min-w-max">
                                        <tbody>
                                        {rackEntries[1][1].rows.slice().reverse().map((row, rowIndex) => (
                                            <tr key={rowIndex}>
                                            {row.map((cell, cellIndex) => {
                                            // Calculate the real row number (reverse the index)
                                            const realRowNum = DEFAULT_ROWS - rowIndex;
                                            // Create position info for this cell
                                            const colNum = cellIndex + 1;
                                            const locationId =  `${rackEntries[1][1].rackId}.${colNum}.${realRowNum}`
                                               
                                            
                                            
                                            return (
                                            <td
                                                key={`${cellIndex}-${rowIndex}`}
                                                className={`... cursor-pointer`}
                                                onClick={(e) => handleCellClick(cell, `${rackEntries[1][0]}-${cellIndex}-${rowIndex}`, e, locationId)}
                                                style={{
                                                backgroundColor: cell && cell.status === "Đang chứa hàng" ? "#0089D7" 
                                                : cell && cell.status === "Đã đầy" ? "#00294D"
                                                : cell && cell.status === "Được phân bổ" ? "#FF2115" : "#FFF",
                                                color: "#FFF",
                                                border: "2px solid #000",
                                                cursor: "pointer",
                                                position: "relative",
                                                minWidth: "130px",
                                                height: "50px",
                                                textAlign: "center",
                                                }}
                                                >
                                                {cell ? cell.lotnumber || "" : ""}
                                                {(curPoint === `${rackEntries[1][0]}-${cellIndex}-${rowIndex}` && showModal) && (
                                                    <DetailModal 
                                                    data={{selectedDetails, position: locationId}}
                                                    onClose={() => setShowModal(false)}
                                                    position={modalPosition}
                                                    onViewDetails={handleViewDetails}
                                                    />
                                                )}
                                            </td>
                                            );
                                            })}
                                            {/* Add row number cell */}
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
                                                className="px-4 py-2 bg-gray-100 border-t border-gray-300 text-left min-w-[100px] text-center"
                                            >
                                                {col}
                                            </th>
                                            ))}
                                            {/* Add empty header for row numbers column */}
                                            <th className="px-4 py-2 bg-gray-100 border-t border-gray-300 text-center" style={{width: "30px"}}></th>
                                        </tr>
                                        </tfoot>
                                    </table>
                                    </div>
                                </div>
                                )}
                            </div>

                        </div>
                        
                    </div>
                    );
                })}
                
                <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    right: "3%", 
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

                    <div style={{display: 'flex', alignItems: "center", marginBottom: "10px"}}>
                        <div style={{ backgroundColor: '#FFFFFF', height: '40px', width: '40px', borderRadius: "6px", marginRight: "10px" }}></div>
                        <span>Trống</span>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Hiển thị trang Detail nếu activeTab là 'detail' */}
      {activeTab === 'detail' && <Detail data={{selectedDetails, position: locationId}} activeTab={setActiveTab} />}
      </>
    );
  };
  
  export default Storage;