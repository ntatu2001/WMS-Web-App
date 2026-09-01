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
import useTranslation from '../../../../common/hooks/useTranslation';

const VALID_TABS = ['receipt', 'issue', 'inventory'];

const History = () => {
  const { t } = useTranslation();
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
  const headerText = activeTab === 'receipt' ? t('history.tabReceipt') :
                     activeTab === 'issue' ? t('history.tabIssue') : t('history.tabInventory');

  return (
    <div style={{ padding: 0, backgroundColor: 'var(--color-bg)' }}>
      <HeaderContainer>
        <HeaderItem>{t('history.heading')}</HeaderItem>
        <Separator />
        <HeaderItem>{headerText}</HeaderItem>
      </HeaderContainer>

      <TabContainer>
        <TabButton
          active={activeTab === 'receipt'}
          onClick={() => setActiveTab('receipt')}
        >
          {t('history.tabReceipt')}
        </TabButton>
        <TabButton
          active={activeTab === 'issue'}
          onClick={() => setActiveTab('issue')}
        >
          {t('history.tabIssue')}
        </TabButton>
        <TabButton
          active={activeTab === 'inventory'}
          onClick={() => setActiveTab('inventory')}
        >
          {t('history.tabInventory')}
        </TabButton>
      </TabContainer>

      {activeTab === 'receipt' ? <ReceiptHistory /> :
       activeTab === 'issue' ? <IssueHistory /> : <InventoryHistory/>}
    </div>
  );
};

export default History;