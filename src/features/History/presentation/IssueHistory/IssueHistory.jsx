import React, { useState } from 'react';
import { FaEye } from 'react-icons/fa';
import SectionTitle from '../../../../common/components/Text/SectionTitle.jsx';
import Table from '../../../../common/components/Table/Table.jsx';
import TableHeader from '../../../../common/components/Table/TableHeader.jsx';
import TableCell from '../../../../common/components/Table/TableCell.jsx';
import FormGroup from '../../../../common/components/FormGroup/FormGroup.jsx';
import SelectContainer from '../../../../common/components/Selection/SelectContainer.jsx';
import ActionButton from '../../../../common/components/Button/ActionButton/ActionButton.jsx';
import DateInput from '../../../../common/components/DateInput/DateInput.jsx';
import Label from '../../../../common/components/Label/Label.jsx';
import FormSection from '../../../../common/components/Section/FormSection.jsx';
import ListSection from '../../../../common/components/Section/ListSection.jsx';
import DeleteButton from '../../../../common/components/Button/DeleteButton/DeleteButton.jsx';
import {listIssueStorage, listIssueHistory} from '../../../../app/mockData/HistoryData.js';
import SearchInput from '../../../../common/components/Input/SearchInput.jsx';
import LabelSmallSize from '../../../../common/components/Label/LabelSmallSize.jsx';
import clsx from 'clsx';
import styles from './IssueHistory.module.scss';
import { lotStatusData } from '../../../../app/mockData/LotStatusData.js';


const IssueHistory = () => {
  const [selectedDate1, setSelectedDate1] = useState(null);
  const [selectedDate2, setSelectedDate2] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  return (
    <div style={{display: "flex", height: "100vh"}}>
      
      <FormSection style={{width: "25%", margin:"0px 20px", height:"100%"}}>
        <SectionTitle style={{fontSize: "24px", padding: "0 10px", marginBottom: 0}} >Truy xuất lịch sử xuất kho</SectionTitle>
            <div>
                <SectionTitle style={{ textAlign: 'left', fontSize: "16px", marginBottom: 0, marginLeft: "20px"}}>Mã lô/ Số PO:</SectionTitle>

                <SearchInput placeholder="Tìm kiếm theo Mã lô/ số PO"></SearchInput>

                <SectionTitle style={{ textAlign: 'left', fontSize: "16px", marginBottom: 0, marginLeft: "20px" }}>Nhà cung cấp:</SectionTitle>

                <SearchInput placeholder="Tìm kiếm theo nhà cung cấp"></SearchInput>

                <div style={{display: "flex", marginBottom: "5px"}}>
                    <FormGroup>
                            <SelectContainer >
                                <DateInput style={{width: "80%", left: "9%"}}
                                    selectedDate={selectedDate1}
                                    onChange={setSelectedDate1}
                                />
                            </SelectContainer>
                    </FormGroup>

                    <FormGroup >
                            <SelectContainer>
                                <DateInput style={{width: "80%", right: "9%"}}
                                    selectedDate={selectedDate2}
                                    onChange={setSelectedDate2}
                                />
                            </SelectContainer>
                    </FormGroup>
                

                </div>


                <ActionButton style={{padding: "5px", marginTop: 0}}>Tìm kiếm</ActionButton>
            </div>
            
        
        <SectionTitle style={{fontSize: "24px", padding: "10px", marginBottom: 0}} >Danh sách lô xuất kho</SectionTitle>
            <div style={{height: "50%", overflow: "auto"}}> 
                {listIssueHistory.map((item) => (
                    <div className={clsx(styles.divOfList)}
                         key={item.lotNumber}
                         onClick={() => setSelectedItem(item)}
                         style={{backgroundColor: selectedItem === item ? '#ccc' : '#FFF'}}
                    >
                        <div style={{display: "flex", marginRight: "3%", justifyContent: "space-between"}}>
                            <LabelSmallSize>Mã lô/ Số PO:</LabelSmallSize>
                             <span style={{marginTop: "2px", fontSize: "14px", fontWeight: 500}}>{item.lotNumber}</span>
                        </div>

                        <div style={{display: "flex", marginRight: "3%", justifyContent: "space-between"}}>
                            <LabelSmallSize>Thời gian xuất kho:</LabelSmallSize>
                             <span style={{marginTop: "2px", fontSize: "14px", fontWeight: 500}}>{item.date}</span>
                        </div>

                        <div style={{display: "flex", marginRight: "3%", justifyContent: "space-between"}}>
                            <LabelSmallSize>Nhân viên:</LabelSmallSize>
                             <span style={{marginTop: "2px", fontSize: "14px", fontWeight: 500}}>{item.receiver}</span>
                        </div>

                        <div style={{display: "flex", marginRight: "3%", justifyContent: "space-between"}}>
                            <LabelSmallSize>Nhà cung cấp:</LabelSmallSize>
                             <span style={{marginTop: "2px", fontSize: "14px", fontWeight: 500}}>{item.supplier}</span>
                        </div>

                        <div style={{display: "flex", marginRight: "3%", justifyContent: "space-between"}}>
                            <LabelSmallSize>Trạng thái:</LabelSmallSize>
                                <div
                                    style={{
                                        width: '40%',
                                        textAlign: 'center',
                                        borderRadius: '8px',
                                        backgroundColor: lotStatusData[item.status],
                                        padding: '2%',
                                        margin: '0',
                                        color: 'white',
                                        fontWeight: 'bold',
                                        fontSize: '12px',
                                    }}
                                    >
                                    {item.status}  
                                </div>
                        </div>

                    </div>
                ))}
            </div>






      </FormSection>

      {/* Right Section */}
      <FormSection style={{flex: 2, marginRight: 0, right: "0.5%", height:"100%"}}>
        <SectionTitle style={{fontSize: "24px"}}>Thông tin xuất kho chi tiết</SectionTitle>

        <SectionTitle style={{ textAlign: 'left', fontSize: "18px", margin: "10px 0px" }}>Thông tin lô xuất kho</SectionTitle>
        
        <FormSection style={{ margin: "0px 10px 30px", backgroundColor: "#F5F5F5", height: "190px", padding: "10px", display: "flex"}}>
        <div style={{ flexDirection: "column", width: "50%", marginTop: "10px", marginLeft: "15px"}}>
                <FormGroup style={{justifyContent: "space-between", marginRight: "15%"}}>
                    <Label style={{width: "30%"}}>Kho hàng:</Label>
                    <span>{selectedItem?.warehouse}</span>
                </FormGroup>

                <FormGroup style={{justifyContent: "space-between", marginRight: "15%"}}>
                    <Label style={{width: "30%"}}>Khu vực:</Label>
                    <span>{selectedItem?.zone}</span>

                </FormGroup>

                <FormGroup style={{justifyContent: "space-between", marginRight: "15%"}}>
                    <Label style={{width: "60%"}}>Nhân viên xuất kho:</Label>
                    <span>{selectedItem?.receiver}</span>
                </FormGroup>

                <FormGroup style={{justifyContent: "space-between", marginRight: "15%"}}>
                    <Label style={{width: "50%"}}>Tổng sản phẩm:</Label>
                    <span>{selectedItem?.quantity}</span>
                </FormGroup>

            </div>
        

            <div style={{ flexDirection: "column", width: "50%", marginTop: "10px", marginLeft: "15px"}}>
                <FormGroup style={{justifyContent: "space-between", marginRight: "5%"}}>
                    <Label style={{width: "40%"}}>Mã lô/ Số PO:</Label>
                    <span>{selectedItem?.lotNumber}</span>
                </FormGroup>

                <FormGroup style={{justifyContent: "space-between", marginRight: "5%"}}>
                    <Label style={{width: "40%"}}>Nhà cung cấp:</Label>
                    <span>{selectedItem?.supplier}</span>

                </FormGroup>

                <FormGroup style={{justifyContent: "space-between", marginRight: "5%"}}>
                    <Label style={{width: "40%"}}>Ngày xuất kho:</Label>
                    <span>{selectedItem?.date}</span>
                </FormGroup>

                <FormGroup style={{justifyContent: "space-between", marginRight: "5%"}}>
                    <Label style={{width: "50%"}}>Trạng thái:</Label>
                    <div
                                style={{
                                    width: '40%',
                                    textAlign: 'center',
                                    borderRadius: '8px',
                                    backgroundColor: lotStatusData[selectedItem?.status],
                                    padding: '2%',
                                    margin: '0',
                                    color: 'white',
                                    fontWeight: 'bold',
                                    fontSize: '12px',
                                }}
                                >
                                {selectedItem?.status}  
                    </div>
                </FormGroup>

            </div>
        </FormSection>

        <SectionTitle style={{ textAlign: 'left', fontSize: "18px", margin: "10px 0px" }}>Bảng phân bố vị trí lưu trữ</SectionTitle>

         <ListSection style={{ padding: 0, margin: "0px 10px" }}>
                <div style={{ overflowX: 'auto' }}>
                    <Table>
                        <thead>
                            <tr>
                                <TableHeader>STT</TableHeader>
                                <TableHeader>Tên sản phẩm</TableHeader>
                                <TableHeader>Mã sản phẩm</TableHeader>
                                <TableHeader>ĐVT</TableHeader>
                                <TableHeader>Vị trí lưu trữ</TableHeader>
                                <TableHeader>Số lượng xuất</TableHeader>
                                <TableHeader>Ghi chú</TableHeader> 
                                <TableHeader></TableHeader>
                            </tr>
                        </thead>
                        <tbody>
                            {listIssueStorage.map((item) => (
                                <tr key={item.id}>
                                    <TableCell>{item.id}</TableCell>
                                    <TableCell>{item.name}</TableCell>
                                    <TableCell>{item.code}</TableCell>
                                    <TableCell>{item.unit}</TableCell>
                                    <TableCell>{item.location}</TableCell>
                                    <TableCell>{item.quantity}</TableCell>
                                    <TableCell>{item.note}</TableCell>
                                    <TableCell>
                                        <DeleteButton>
                                            <FaEye size={25} color="#000" />
                                        </DeleteButton>
                                    </TableCell>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            </ListSection>


            
      </FormSection>
    </div>
  );
};

export default IssueHistory; 