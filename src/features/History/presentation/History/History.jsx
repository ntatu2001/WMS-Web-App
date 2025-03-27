import React, { useState } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import HeaderContainer from '../../../../common/components/Header/HeaderContainer.jsx';
import HeaderItem from '../../../../common/components/Header/HeaderItem.jsx';
import TabContainer from '../../../../common/components/Tab/TabContainer.jsx';
import TabButton from '../../../../common/components/Tab/TabButton.jsx';
import Separator from '../../../../common/components/Header/Separator.jsx';
import ReceiptHistory from '../ReceiptHistory/ReceiptHistory.jsx';
import IssueHistory from '../IssueHistory/IssueHistory.jsx';
import InventoryHistory from '../InventoryHistory/InventoryHistory.jsx';

const History = () => {
  const [activeTab, setActiveTab] = useState('receipt');
  const headerText = activeTab === 'receipt' ? "Lịch sử nhập kho" :
                     activeTab === 'issue' ? "Lịch sử xuất kho" : "Lịch sử kiểm kê";

  return (
    <div style={{ padding: 0, backgroundColor: '#f5f5f5' }}>
      <HeaderContainer>
        <HeaderItem>Lịch sử</HeaderItem>
        <Separator />
        <HeaderItem>{headerText}</HeaderItem>
      </HeaderContainer>

      <TabContainer>
        <TabButton
          active={activeTab === 'receipt'}
          onClick={() => setActiveTab('receipt')}
        >
          Lịch sử nhập kho
        </TabButton>
        <TabButton
          active={activeTab === 'issue'}
          onClick={() => setActiveTab('issue')}
        >
          Lịch sử xuất kho
        </TabButton>
        <TabButton
          active={activeTab === 'inventory'}
          onClick={() => setActiveTab('inventory')}
        >
          Lịch sử kiểm kê
        </TabButton>
      </TabContainer>

      {activeTab === 'receipt' ? <ReceiptHistory /> :
       activeTab === 'issue' ? <IssueHistory /> : <InventoryHistory/>}
    </div>
  );
};

export default History;