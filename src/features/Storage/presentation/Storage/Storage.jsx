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
import { listWarehouses } from '../../../../app/mockData/WarehouseData.js';
import { listZones } from '../../../../app/mockData/ZoneData.js';

import {warehouseData} from '../../../../app/mockData/WarehouseData.js';

const Storage = () => {
    const [activeTab, setActiveTab] = useState('storage'); // Trạng thái tab hiện tại
    const [selectedDetails, setSelectedDetails] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const DEFAULT_ROWS = 4;
    const [curPoint,setCurPoint] =useState()
    const [modalPosition,setModalPosition] = useState()
    const [wareHouse,setWareHouse] = useState()
    const [zone,setZone] = useState()
    const [dataTable, setDataTable] = useState([])
    

    const handleViewDetails = () => {
      setActiveTab('detail'); // Cập nhật trạng thái tab
      setShowModal(false); // Đóng modal
  };

    const handleCellClick = (cell, point, e) => {
      // console.log(e.target.__reactFiber$ynu53ve5y.key)

      if (cell.details) {
      
        const rect = e.currentTarget.getBoundingClientRect(); // Lấy vị trí của ô
    setModalPosition({
      top: rect.bottom + window.scrollY - 100, // Vị trí dưới ô
      left: rect.left + window.scrollX // Vị trí bên trái ô
    });
        setCurPoint(point)
        setSelectedDetails(cell.details);
        setShowModal(true);
      }
    };
    // console.log(modalPosition)
  
    const handleWareHouseChange = (e) =>{
        // setWareHouse(e)
        // console.log(e.target.value);
        setWareHouse(e.target.value);
    }

    const handleZoneChange = (z) =>{
    
        // console.log(z.target.value);
        setZone(z.target.value);
    }

    // console.log(wareHouse)
    useEffect(() => {
      if (Array.isArray(warehouseData)) {
          const foundData = warehouseData.find(item => 
              item.wareHouse === wareHouse && item.zone === zone
          );
          // console.log(foundData)
          // Kiểm tra nếu foundData không phải là undefined
          if (foundData) {
              setDataTable(foundData.data); // Cập nhật trạng thái với dữ liệu tìm thấy
          } else {
              setDataTable(null); // Hoặc gán giá trị mặc định nếu cần
          }
      } else {
          console.error('warehouseData không phải là một mảng:', warehouseData);
      }

      
  }, [wareHouse, zone]);

   
    return (
      <>
      {activeTab === 'storage' && (
        <div style={{backgroundColor: '#f5f5f5', width: "100%", height: "100%"}}>
             
                  <div style={{display: "flex"}}>
                      <HeaderContainer style={{marginRight: "5%"}}>
                          <HeaderItem>Lưu trữ</HeaderItem>
                          <Separator />
                          <HeaderItem>Sơ đồ kho</HeaderItem>
                      </HeaderContainer>

                      <Label style={{fontSize: "28px", width: "13%"}}>Kho hàng:</Label>
                      <SelectContainer>
                          <Select style={{width: "70%", fontWeight: "500"}} onChange={handleWareHouseChange} value = {wareHouse}>
                              {/* <option value="" disabled>Chọn kho hàng</option> */}
                              <option value="" disabled selected>Chọn kho hàng</option>
                              {listWarehouses.map((warehouse, index) => (
                              <option key = {`warehouse-${index}`} value={warehouse}>
                                  {warehouse}
                              </option>
                              ))}
                          </Select>
                          <DropdownIcon style={{right: "35%", top: "40%"}}><FaChevronDown size={12} /></DropdownIcon>
                      </SelectContainer>

                      <Label style={{fontSize: "28px", width: "13%"}}>Khu vực:</Label>
                      <SelectContainer>
                          <Select style={{width: "70%", fontWeight: "500"}} onChange={handleZoneChange} value = {zone}>
                              <option value="" disabled selected>Chọn khu vực</option>
                              {listZones.map((zone, index) => (
                              <option key = {`zone-${index}`} value={zone}>
                                  {zone}
                              </option>
                              ))}
                          </Select>
                          <DropdownIcon style={{right: "35%", top: "40%"}}><FaChevronDown size={12} /></DropdownIcon>
                      </SelectContainer>

           
        </div>
         
      
                  <div className="p-4" style={{flexDirection: "column", width: "100%"}} >
                {Object.entries(dataTable || {}).map(([section, { columns, rows }]) => {
                  const paddedRows = [...rows];
                  while (paddedRows.length < DEFAULT_ROWS) {
                    paddedRows.push(Array(columns.length).fill(""));
                  }

                  const normalizedRows = paddedRows.map(row => 
                    [...row, ...Array(columns.length - row.length).fill("")]
                  );
                  console.log(normalizedRows)
                  return (
                    <div key={section} className="mb-8" style={{display: "flex"}}>
                      <h2 className="font-bold text-lg mb-2 mr-10 mt-20">{section.replace("_", ".")}</h2>
                      
                      {/* Container scroll */}
                      <div className="overflow-x-auto  border-gray-300 rounded-lg max-w-[902px]">
                      
                          <table className="w-full min-w-max">
                            <thead>
                              <tr>
                                {columns.map((col, index) => (
                                  <th 
                                    key={index}
                                    className="px-4 py-2 bg-gray-100 border-b border-gray-300 text-left min-w-[100px] text-center"
                                  >
                                    {col}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            
                            <tbody>
                              {normalizedRows.map((row, rowIndex) => (
                                <tr key={rowIndex}>
                                {row.map((cell, cellIndex) => (
                                  <>
                                  <td
                                    key={`${cellIndex}-${rowIndex}`}
                                    className={`... cursor-pointer`}
                                    onClick={(e) => handleCellClick(cell,`${cellIndex}${rowIndex}`,e)}
                                    style={{
                                      backgroundColor: cell.status === "Đang chứa hàng" ? "#0089D7" 
                                      : cell.status === "Đã đầy" ? "#00294D"
                                      : cell.status === "Được phân bổ" ? "#FF2115" : "#FFF",
                                      color: "#FFF",
                                      border: "2px solid #000",
                                      cursor: "pointer",
                                      position: "relative",
                                      minWidth: "100px",
                                      height: "40px",
                                      textAlign: "center",
                                    
                                      // position: "relative

                                    }}
                                    >
                                    {cell.value}
                                    {(curPoint === `${cellIndex}${rowIndex}` && showModal) && (
                                        <DetailModal 
                                          data={selectedDetails}
                                          onClose={() => setShowModal(false)}
                                          position={modalPosition}
                                          onViewDetails = {handleViewDetails}
                                        />
                                      )}
                              
                                  </td>
                            
            
                                    </>
                                  
                                ))}
                              </tr>
                              ))}
                            </tbody>
                          </table>
            
                      </div>

                    </div>
                  );
                })}
                  

                  <div style={{ display: 'flex', flexDirection: 'column',right: "-5%", top: '20%', width: "20%", position: "absolute"}}>
                      <div style={{display: 'flex',justifyContent: "space-between", width: "30%", marginBottom: "5%", alignItems: "center"}}>
                          <div style={{ backgroundColor: '#0089D7', height: '40px', width: '40px', borderRadius: "6px"}}></div>
                          <span style={{textAlign: "left"}}>In Use</span>
                      </div>
                      <div style={{display: 'flex',justifyContent: "space-between", width: "23.5%", marginBottom: "5%", alignItems: "center"}}>
                          <div style={{ backgroundColor: '#00294D', height: '40px', width: '40px', borderRadius: "6px" }}></div>
                          <span span>Full</span>
                      </div>
                      <div style={{display: 'flex',justifyContent: "space-between", width: "41.5%", marginBottom: "5%", alignItems: "center"}}>
                          <div style={{ backgroundColor: '#FF2115', height: '40px', width: '40px', borderRadius: "6px" }}></div>
                          <span>Is Assigned</span>
                      </div>

                      <div style={{display: 'flex',justifyContent: "space-between", width: "30%", marginBottom: "5%", alignItems: "center"}}>
                          <div style={{ backgroundColor: '#FFFFFF', height: '40px', width: '40px', borderRadius: "6px" }}></div>
                          <span>Empty</span>
                  </div>
                    
                    
              </div>

              
                
              </div>
              


       
        
    
    </div>
    

    )}

    {/* Hiển thị trang Detail nếu activeTab là 'detail' */}
    {activeTab === 'detail' && <Detail data={selectedDetails} />}

    </>
    );
  };
  
  export default Storage;