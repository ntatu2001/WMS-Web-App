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


const GoodReceipt = () => {
  const [activeTab, setActiveTab] = useState('create');
  const headerText = activeTab === 'create' ? "Tạo phiếu nhập kho" :
                     activeTab === 'manage' ? "Quản lý nhập kho" : "Nhập kho chưa hoàn thành";

  return (
    <div style={{ padding: 0, backgroundColor: '#f5f5f5' }}>
      <HeaderContainer>
        <HeaderItem>Nhập kho</HeaderItem>
        <Separator />
        <HeaderItem>{headerText}</HeaderItem>
      </HeaderContainer>

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

      {activeTab === 'create' ? <CreateGoodReceipt /> :
       activeTab === 'manage' ? <ManageGoodReceipt /> : <InCompleteReceipt />}
    </div>
  );
};

export default GoodReceipt;