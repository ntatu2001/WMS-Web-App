import React, { useState } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import HeaderContainer from '../../../../common/components/Header/HeaderContainer.jsx';
import HeaderItem from '../../../../common/components/Header/HeaderItem.jsx';
import TabContainer from '../../../../common/components/Tab/TabContainer.jsx';
import TabButton from '../../../../common/components/Tab/TabButton.jsx';
import Separator from '../../../../common/components/Header/Separator.jsx';
import CreateGoodReceipt from '../CreateGoodReceipt/CreateGoodReceipt.jsx';
import ManageGoodReceipt from '../ManageGoodReceipt/ManageGoodReceipt.jsx';

const GoodReceipt = () => {
  const [activeTab, setActiveTab] = useState('create');

  return (
    <div style = {{padding: 0, backgroundColor: '#f5f5f5'}}>
      <HeaderContainer>
        <HeaderItem>Nhập kho</HeaderItem>
        <Separator />
        <HeaderItem>Tạo phiếu nhập kho</HeaderItem>
      </HeaderContainer>
      
      <TabContainer>
        <TabButton 
          active={activeTab === 'create'} 
          onClick={() => setActiveTab('create')}
        >
          Tạo phiếu nhập kho
        </TabButton>
        <TabButton 
          active={activeTab === 'manage'} 
          onClick={() => setActiveTab('manage')}
        >
          Quản lý nhập kho
        </TabButton>
      </TabContainer>
      
      {activeTab === 'create' ? <CreateGoodReceipt /> : <ManageGoodReceipt />}
    </div>
  );
};

export default GoodReceipt;