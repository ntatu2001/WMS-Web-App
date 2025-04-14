import React from "react";
import ActionButton from '../../../../common/components/Button/ActionButton/ActionButton';
import SectionTitle from '../../../../common/components/Text/SectionTitle';
import { AiOutlineClose } from 'react-icons/ai';
import clsx from 'clsx';
import styles from './DetailModal.module.scss';
import Label from "../../../../common/components/Label/Label";


const DetailModal = ({ data, onClose, position, onViewDetails }) => {
  
    return (
      
        <div className={clsx(styles.modal)} style={{ top: position.top, left: position.left }} 
        
              >
          <div className="flex" 
                  >
            <SectionTitle style={{margin: "0px 0px 2% 25%"}}>Vị trí {data.position}</SectionTitle>
            <button 
              onClick={onClose}
              className={clsx(styles.modalClose)}
            >
               <AiOutlineClose style={{ fontWeight: "bold" }} />
            </button>
          </div>
  
          <div style={{justifyItems: "center", marginRight: "6%"}} >
            <div style={{marginBottom: "5%", width: "90%"}}>
                  <div style={{display: "flex", margin: 0,justifyContent: "space-between"}}>
                            <Label>Thiết bị:</Label>
                             <span style={{ fontSize: "16px", fontWeight: 600}}>{data.equipment}</span>
                  </div>
                  <div style={{display: "flex", marginLeft: "1%",justifyContent: "space-between"}}>
                            <Label>Khu vực:</Label>
                             <span style={{ fontSize: "16px", fontWeight: 600}}>{data.zone}</span>
                  </div>
                  <div style={{display: "flex", marginLeft: "4%", justifyContent: "space-between"}}>
                            <Label>Kho hàng:</Label>
                             <span style={{ fontSize: "16px", fontWeight: 600}}>{data.warehouse}</span>
                  </div>
                  <div style={{display: "flex", marginLeft: "6%", justifyContent: "space-between"}}>
                            <Label style={{width: "40%"}}>Kích thước:</Label>
                             <span style={{ fontSize: "16px", fontWeight: 600}}>{data.dimensions}</span>
                  </div>
                  <div style={{display: "flex", justifyContent: "space-between", marginLeft: "5%"}}>
                    <Label style={{width: "40%"}}>Tình trạng:</Label> 
                    <span className={`ml-2 `} style={{color: "#0089D7"}}>
                      {data.status}
                    </span>
                  </div>
            </div>
            
            <div style={{marginTop: "10%", width: "90%"}}>
                  <div style={{display: "flex", marginLeft: "3%", justifyContent: "space-between"}}>
                            <Label style={{width: "60%"}}>Lô hàng lưu trữ:</Label>
                             <span style={{ fontSize: "16px", fontWeight: 600}}>{data.lot}</span>
                  </div>
                  <div style={{display: "flex", marginLeft: "5%", justifyContent: "space-between"}}>
                            <Label style={{width: "60%"}}>Số lượng lưu trữ:</Label>
                             <span style={{ fontSize: "16px", fontWeight: 600}}>{data.quantity}</span>
                  </div>
                  <div style={{display: "flex", marginLeft: "5.5%", justifyContent: "space-between"}}>
                            <Label style={{width: "60%"}}>Thể tích sử dụng:</Label>
                             <span style={{ fontSize: "16px", fontWeight: 600}}>{data.usedVolume}</span>
                  </div>
                  <div style={{display: "flex", marginLeft: "0.5%", justifyContent: "space-between"}}>
                            <Label style={{width: "60%"}}>Thể tích tối đa:</Label>
                             <span style={{ fontSize: "16px", fontWeight: 600}}>{data.maxVolume}</span>
                  </div>
            </div>
          </div>
  
          <div className="pt-4">
            <ActionButton style={{width: "50%", padding: "5%"}}
              onClick={onViewDetails}
              
              
            >
              Xem chi tiết
            </ActionButton>
          </div>
   
        </div>
 
    );
  };

  export default DetailModal;