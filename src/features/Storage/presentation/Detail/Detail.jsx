import React, { useState, useEffect } from 'react';
import {AiFillCaretLeft} from 'react-icons/ai'
import 'react-datepicker/dist/react-datepicker.css';
import HeaderContainer from '../../../../common/components/Header/HeaderContainer.jsx';
import HeaderItem from '../../../../common/components/Header/HeaderItem.jsx';
import Separator from '../../../../common/components/Header/Separator.jsx';
import SelectContainer from '../../../../common/components/Selection/SelectContainer.jsx';
import DateInput from '../../../../common/components/DateInput/DateInput.jsx';
import FormSection from '../../../../common/components/Section/FormSection.jsx';
import ListSection from '../../../../common/components/Section/ListSection.jsx';
import SectionTitle from '../../../../common/components/Text/SectionTitle.jsx';
import Table from '../../../../common/components/Table/Table.jsx';
import TableHeader from '../../../../common/components/Table/TableHeader.jsx';
import TableCell from '../../../../common/components/Table/TableCell.jsx';
import Label from '../../../../common/components/Label/Label.jsx';
import Image from '../../../../assets/image.png';
import locationApi from '../../../../api/locationApi';

const Detail = ({data, activeTab}) => {
        const [selectedDate, setSelectedDate] = useState(null);
        const [selectedDate1, setSelectedDate1] = useState(null);
        const [stockLocationHistories, setStockLocationHistories] = useState([]);
        console.log(stockLocationHistories)
        useEffect(() => {
                const fetchStockLocationHistories = async () => {
                        const response = await locationApi.getStockLocationHistoriesByLocationId(data.position, new Date(selectedDate).toISOString(), new Date(selectedDate1).toISOString());
                        setStockLocationHistories(response);
                };
                fetchStockLocationHistories();
        }, [data.position, selectedDate, selectedDate1]);
        return (
                <div style={{ padding: 0, backgroundColor: '#f5f5f5' }}>
                        <div style={{display: "flex"}}>
                                <button onClick={() => activeTab('storage')}>
                                        <AiFillCaretLeft style={{fontSize: "24px"}}/>
                                </button>
                                <HeaderContainer>
                                        <HeaderItem>Lưu trữ</HeaderItem>
                                        <Separator />
                                        <HeaderItem>Chi tiết vị trí lưu trữ</HeaderItem>
                                </HeaderContainer>

                                <div style={{position: "relative", right: "-10%", width: "20%"}}>
                                        <DateInput 
                                        selectedDate={selectedDate}
                                        onChange={setSelectedDate}
                                        />
                                </div>
                                <div style={{position: "relative", right: "-20%", width: "20%"}}>
                                        <DateInput
                                        selectedDate={selectedDate1}
                                        onChange={setSelectedDate1}
                                        />
                                </div>
                            
                        </div>
                        <div style={{display: "flex", height: "85vh"}}>
                                <FormSection style={{width: "25%", margin:"0px 20px", height:"100%", padding: "0.5rem"}}>
                                        <div>
                                                <button>

                                                </button>
                                                <SectionTitle style={{fontSize: "24px", padding: "0 10px", marginBottom : 0}} >Vị trí {data.position}</SectionTitle>
                
                                        </div>  
                                                <div>
                                                        <img src={Image} alt="Image" style={{height: "30%", width: "50%", marginLeft: "25%"}}/>
                                                        
                                                        <div style={{display: "flex", margin: "2% 0px 0px 12.5%", justifyContent: "space-between", width: "75%"}}>
                                                                <Label style={{fontSize: "16px"}}>Thiết bị:</Label>
                                                                <span style={{fontSize: "16px", fontWeight: 500}}>{data.selectedDetails?.equipmentName}</span>
                                                        </div> 
                                                        <div style={{display: "flex", margin: "2% 0px 0px 12.5%", justifyContent: "space-between", width: "75%"}}>
                                                                <Label style={{fontSize: "16px"}}>Khu vực:</Label>
                                                                <span style={{fontSize: "16px", fontWeight: 500}}>{data.selectedDetails?.warehouseId}</span>
                                                        </div> 
                                                        <div style={{display: "flex", margin: "2% 0px 0px 12.5%", justifyContent: "space-between", width: "75%"}}>
                                                                <Label style={{fontSize: "16px"}}>Kho hàng:</Label>
                                                                <span style={{fontSize: "16px", fontWeight: 500}}>{data.selectedDetails?.warehouseName}</span>
                                                        </div>  
                                                        <div style={{display: "flex", margin: "2% 0px 0px 12.5%", justifyContent: "space-between", width: "75%"}}>
                                                                <Label style={{fontSize: "16px"}}>Kích thước:</Label>
                                                                <span style={{fontSize: "16px", fontWeight: 500}}>{data.selectedDetails?.length}m x {data.selectedDetails?.width}m x {data.selectedDetails?.height}m</span>
                                                        </div>  
                                                        <div style={{display: "flex", margin: "2% 0px 0px 12.5%", justifyContent: "space-between", width: "75%"}}>
                                                                <Label style={{fontSize: "16px"}}>Tình trạng:</Label>
                                                                <span style={{fontSize: "16px", fontWeight: 500, color: "#0089D7"}}>{data.selectedDetails?.status}</span>
                                                        </div> 
                                                        <div style={{display: "flex", margin: "2% 0px 0px 12.5%", justifyContent: "space-between", width: "75%"}}>
                                                                <Label style={{fontSize: "16px"}}>Tỷ lệ lưu trữ:</Label>
                                                                <span style={{fontSize: "16px", fontWeight: 500}}>{Math.round(data.selectedDetails?.storageRate * 100) / 100}%</span>
                                                        </div>  

                                                </div>
                                        
                                                <div style={{marginTop: "10%"}}>
                                                        <div div style={{display: "flex", margin: "2% 0px 0px 12.5%", justifyContent: "space-between", width: "75%"}}>
                                                                <Label style={{fontSize: "16px", width: "45%"}}>Lô hàng lưu trữ:</Label>
                                                                <span style={{fontSize: "16px", fontWeight: 500}}>{data.selectedDetails?.lotInfors[0]?.lotnumber}</span>
                                                        </div>
                                                        <div div style={{display: "flex", margin: "2% 0px 0px 12.5%", justifyContent: "space-between", width: "75%"}}>
                                                                <Label style={{fontSize: "16px", width: "45%"}}>Số lượng lưu trữ:</Label>
                                                                <span style={{fontSize: "16px", fontWeight: 500}}>{data.selectedDetails?.lotInfors[0]?.quantity}</span>
                                                        </div>
                                                        <div div style={{display: "flex", margin: "2% 0px 0px 12.5%", justifyContent: "space-between", width: "75%"}}>
                                                                <Label style={{fontSize: "16px", width: "45%"}}>Thể tích sử dụng:</Label>
                                                                <span style={{fontSize: "16px", fontWeight: 500}}>{Math.round(data.selectedDetails?.usableVolume * 100) / 100}</span>
                                                        </div> 
                                                        <div div style={{display: "flex", margin: "2% 0px 0px 12.5%", justifyContent: "space-between", width: "75%"}}>
                                                                <Label style={{fontSize: "16px", width: "45%"}}>Thể tích tối đa:</Label>
                                                                <span style={{fontSize: "16px", fontWeight: 500}}>{Math.round(data.selectedDetails?.maxVolume * 100) / 100}</span>
                                                        </div>      
                                                </div>
                        
                                </FormSection>
                                
                                <ListSection>
                                        <SectionTitle style={{fontSize: "24px"}}>Lịch sử lưu trữ</SectionTitle>

                                        <Table>
                                        <thead>
                                        <tr>
                                        <TableHeader style={{ width: '5%' }}>STT</TableHeader>
                                        <TableHeader>Sản phẩm</TableHeader>
                                        <TableHeader>Lô hàng</TableHeader>
                                        <TableHeader style={{ width: '20%' }}>Số lượng nhập</TableHeader>
                                        <TableHeader>Số lượng xuất</TableHeader>
                                        <TableHeader style={{ width: '10%' }}>Số lượng tồn</TableHeader>
                                        <TableHeader style={{ width: '120px' }}>Ngày nhập</TableHeader>
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
                                </ListSection>

                        </div>





                
                </div>
                
        );
};

export default Detail;