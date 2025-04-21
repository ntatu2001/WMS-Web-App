import React, { useState } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import HeaderContainer from '../../../../common/components/Header/HeaderContainer.jsx';
import HeaderItem from '../../../../common/components/Header/HeaderItem.jsx';
import TabContainer from '../../../../common/components/Tab/TabContainer.jsx';
import TabButton from '../../../../common/components/Tab/TabButton.jsx';
import Separator from '../../../../common/components/Header/Separator.jsx';
import CreateGoodReceipt from '../CreateGoodReceipt/CreateGoodReceipt.jsx';
import ManageGoodReceipt from '../ManageGoodReceipt/ManageGoodReceipt.jsx';
import InCompleteReceipt from '../InCompleteReceipt/InCompleteReceipt.jsx';
import ResultDistribution from '../InCompleteReceipt/ResultDistribution/ResultDistribution.jsx';
import ActionButton from '../../../../common/components/Button/ActionButton/ActionButton.jsx';

const GoodReceipt = () => {
  const [activeTab, setActiveTab] = useState('create');
  const headerText = activeTab === 'create' ? "Tạo phiếu nhập kho" :
                     activeTab === 'manage' ? "Quản lý nhập kho" :
                     activeTab === 'viewResult' ? "Kết quả phân bố vị trí lưu kho" : "Nhập kho chưa hoàn thành"

  return (
    <div style={{ backgroundColor: '#f5f5f5' }}>
        <div style={{display: "flex", width: "100%", alignItems: "center"}}>
            <HeaderContainer>
                <HeaderItem>Nhập kho</HeaderItem>
                <Separator />
                <HeaderItem>{headerText}</HeaderItem>
            </HeaderContainer>
           
          {(activeTab === 'incomplete' || activeTab === 'viewResult') && (
            <>
                <ActionButton
                  active={activeTab === 'incomplete'}
                  onClick={() => setActiveTab('incomplete')}
                  style={{ backgroundColor: '#003366', borderRadius: "4px", width: "20%", marginTop: 0, padding: 0, marginRight: "2%"}}
                >
                  Phân bố vị trí lưu kho
                </ActionButton>
                <ActionButton
                  active={activeTab === 'viewResult'}
                  onClick={() => setActiveTab('viewResult')}
                  style={{ backgroundColor: '#0099cc', borderRadius: "4px", width: "20%", marginTop: 0, padding: 0, marginLeft: 0}}
                >
                  Xem kết quả phân bổ
                </ActionButton>
            </>
          )}

          
           
             
        </div>

          {activeTab !== 'viewResult' && (
            <>
                <TabContainer>
                <TabButton
                  active={activeTab === 'create'}
                  onClick={() => setActiveTab('create')}
                >
                  Tạo phiếu nhập kho
                </TabButton>
                
                <TabButton
                  active={activeTab === 'incomplete'}
                  onClick={() => setActiveTab('incomplete')}
                >
                  Nhập kho chưa hoàn thành
                </TabButton>


                <TabButton
                  active={activeTab === 'manage'}
                  onClick={() => setActiveTab('manage')}
                >
                  Quản lý nhập kho
                </TabButton>

                
              </TabContainer>
            </>
          )}

      {activeTab === 'create' ? <CreateGoodReceipt /> :
       activeTab === 'manage' ? <ManageGoodReceipt /> :
       activeTab === 'incomplete' ? <InCompleteReceipt/> : <ResultDistribution/>}
    </div>
  );
};

export default GoodReceipt;