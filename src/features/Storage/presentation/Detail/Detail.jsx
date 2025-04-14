import React, { useState } from 'react';
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

const Detail = ({data}) => {
        const [selectedDate, setSelectedDate] = useState(null);
        const [selectedDate1, setSelectedDate1] = useState(null);
        return (
                <div style={{ padding: 0, backgroundColor: '#f5f5f5' }}>
                        <div style={{display: "flex"}}>
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
                                        <SectionTitle style={{fontSize: "24px", padding: "0 10px", marginBottom : 0}} >Vị trí {data.position}</SectionTitle>  
                                                <div>
                                                        <img src={data.image} alt="Image" style={{height: "30%", width: "50%", marginLeft: "25%"}}/>
                                                        
                                                        <div style={{display: "flex", margin: "2% 0px 0px 12.5%", justifyContent: "space-between", width: "75%"}}>
                                                                <Label style={{fontSize: "16px"}}>Thiết bị:</Label>
                                                                <span style={{fontSize: "16px", fontWeight: 500}}>{data.equipment}</span>
                                                        </div> 
                                                        <div style={{display: "flex", margin: "2% 0px 0px 12.5%", justifyContent: "space-between", width: "75%"}}>
                                                                <Label style={{fontSize: "16px"}}>Khu vực:</Label>
                                                                <span style={{fontSize: "16px", fontWeight: 500}}>{data.zone}</span>
                                                        </div> 
                                                        <div style={{display: "flex", margin: "2% 0px 0px 12.5%", justifyContent: "space-between", width: "75%"}}>
                                                                <Label style={{fontSize: "16px"}}>Kho hàng:</Label>
                                                                <span style={{fontSize: "16px", fontWeight: 500}}>{data.warehouse}</span>
                                                        </div>  
                                                        <div style={{display: "flex", margin: "2% 0px 0px 12.5%", justifyContent: "space-between", width: "75%"}}>
                                                                <Label style={{fontSize: "16px"}}>Kích thước:</Label>
                                                                <span style={{fontSize: "16px", fontWeight: 500}}>{data.dimensions}</span>
                                                        </div>  
                                                        <div style={{display: "flex", margin: "2% 0px 0px 12.5%", justifyContent: "space-between", width: "75%"}}>
                                                                <Label style={{fontSize: "16px"}}>Tình trạng:</Label>
                                                                <span style={{fontSize: "16px", fontWeight: 500, color: "#0089D7"}}>{data.status}</span>
                                                        </div> 
                                                        <div style={{display: "flex", margin: "2% 0px 0px 12.5%", justifyContent: "space-between", width: "75%"}}>
                                                                <Label style={{fontSize: "16px"}}>Tỷ lệ lưu trữ:</Label>
                                                                <span style={{fontSize: "16px", fontWeight: 500}}>{data.storageRate}</span>
                                                        </div>  

                                                </div>
                                        
                                                <div style={{marginTop: "10%"}}>
                                                        <div div style={{display: "flex", margin: "2% 0px 0px 12.5%", justifyContent: "space-between", width: "75%"}}>
                                                                <Label style={{fontSize: "16px", width: "45%"}}>Lô hàng lưu trữ:</Label>
                                                                <span style={{fontSize: "16px", fontWeight: 500}}>{data.lot}</span>
                                                        </div>
                                                        <div div style={{display: "flex", margin: "2% 0px 0px 12.5%", justifyContent: "space-between", width: "75%"}}>
                                                                <Label style={{fontSize: "16px", width: "45%"}}>Số lượng lưu trữ:</Label>
                                                                <span style={{fontSize: "16px", fontWeight: 500}}>{data.quantity}</span>
                                                        </div>
                                                        <div div style={{display: "flex", margin: "2% 0px 0px 12.5%", justifyContent: "space-between", width: "75%"}}>
                                                                <Label style={{fontSize: "16px", width: "45%"}}>Thể tích sử dụng:</Label>
                                                                <span style={{fontSize: "16px", fontWeight: 500}}>{data.usedVolume}</span>
                                                        </div> 
                                                        <div div style={{display: "flex", margin: "2% 0px 0px 12.5%", justifyContent: "space-between", width: "75%"}}>
                                                                <Label style={{fontSize: "16px", width: "45%"}}>Thể tích tối đa:</Label>
                                                                <span style={{fontSize: "16px", fontWeight: 500}}>{data.maxVolume}</span>
                                                        </div>      
                                                </div>
                        
                                </FormSection>
                                
                                <ListSection>
                                        <SectionTitle style={{fontSize: "24px"}}>Lịch sử lưu trữ</SectionTitle>

                                        <Table>
                                        <thead>
                                        <tr>
                                        <TableHeader style={{ width: '40px' }}>STT</TableHeader>
                                        <TableHeader>Sản phẩm</TableHeader>
                                        <TableHeader>Lô hàng</TableHeader>
                                        <TableHeader style={{ width: '60px' }}>Số lượng nhập</TableHeader>
                                        <TableHeader>Số lượng xuất</TableHeader>
                                        <TableHeader>Số lượng tồn</TableHeader>
                                        <TableHeader style={{ width: '120px' }}>Ngày nhập</TableHeader>
                                        <TableHeader style={{ width: '50px' }}>Ngày xuất</TableHeader>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {data.storageHistory.map(item => (
                                        <tr key={item.id}>
                                                <TableCell>{item.id}</TableCell>
                                                <TableCell>{item.name}</TableCell>
                                                <TableCell>{item.lot}</TableCell>
                                                <TableCell>{item.importQty}</TableCell>
                                                <TableCell>{item.exportQty}</TableCell>
                                                <TableCell>{item.stockQty}</TableCell>
                                                <TableCell>{item.importDate}</TableCell>
                                                <TableCell>{item.exportDate}</TableCell>

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