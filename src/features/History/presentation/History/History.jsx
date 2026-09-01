import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import 'react-datepicker/dist/react-datepicker.css';
import HeaderContainer from '../../../../common/components/Header/HeaderContainer.jsx';
import HeaderItem from '../../../../common/components/Header/HeaderItem.jsx';
import TabContainer from '../../../../common/components/Tab/TabContainer.jsx';
import TabButton from '../../../../common/components/Tab/TabButton.jsx';
import Separator from '../../../../common/components/Header/Separator.jsx';
import ReceiptHistory from '../ReceiptHistory/ReceiptHistory.jsx';
import IssueHistory from '../IssueHistory/IssueHistory.jsx';
import InventoryHistory from '../InventoryHistory/InventoryHistory.jsx';

const VALID_TABS = ['receipt', 'issue', 'inventory'];

const History = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  // Đồng bộ tab đang chọn với query param ?tab= trên URL để reload trang vẫn giữ
  // đúng tab thay vì luôn quay về "Lịch sử nhập kho".
  const [activeTab, setActiveTabState] = useState(() => {
    const tab = searchParams.get('tab');
    return VALID_TABS.includes(tab) ? tab : 'receipt';
  });
  const setActiveTab = (tab) => {
    setActiveTabState(tab);
    setSearchParams({ tab }, { replace: true });
  };
  const headerText = activeTab === 'receipt' ? "Lịch sử nhập kho" :
                     activeTab === 'issue' ? "Lịch sử xuất kho" : "Lịch sử kiểm kê";

  return (
    <div style={{ padding: 0, backgroundColor: 'var(--color-bg)' }}>
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