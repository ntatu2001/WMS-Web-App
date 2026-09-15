import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import HeaderContainer from '../../../../common/components/Header/HeaderContainer.jsx';
import HeaderItem from '../../../../common/components/Header/HeaderItem.jsx';
import Separator from '../../../../common/components/Header/Separator.jsx';
import TabContainer from '../../../../common/components/Tab/TabContainer.jsx';
import TabButton from '../../../../common/components/Tab/TabButton.jsx';
import CreateTransfer from '../CreateTransfer/CreateTransfer.jsx';
import ManageTransfer from '../ManageTransfer/ManageTransfer.jsx';
import useTranslation from '../../../../common/hooks/useTranslation';

// Route /transfer chỉ mở cho Manager/Admin (RequireRole ở App.jsx), nên không cần
// logic canManage bên trong như GoodReceipt.jsx (nơi Staff cũng vào được nhưng bị ẩn tab).
const WarehouseTransfer = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTabState] = useState(() => {
    const tab = searchParams.get('tab');
    return tab === 'manage' ? 'manage' : 'create';
  });
  const setActiveTab = (tab) => {
    setActiveTabState(tab);
    setSearchParams({ tab }, { replace: true });
  };

  const headerText = activeTab === 'create' ? t('transfer.tabCreate') : t('transfer.tabManage');

  return (
    <div style={{ backgroundColor: 'var(--color-bg)' }}>
      <HeaderContainer>
        <HeaderItem>{t('transfer.heading')}</HeaderItem>
        <Separator />
        <HeaderItem>{headerText}</HeaderItem>
      </HeaderContainer>

      <TabContainer>
        <TabButton active={activeTab === 'create'} onClick={() => setActiveTab('create')}>
          {t('transfer.tabCreate')}
        </TabButton>
        <TabButton active={activeTab === 'manage'} onClick={() => setActiveTab('manage')}>
          {t('transfer.tabManage')}
        </TabButton>
      </TabContainer>

      {/* Giữ cả 2 tab mounted để không mất filter/list state của ManageTransfer khi chuyển qua lại. */}
      <div style={{ display: activeTab === 'create' ? 'block' : 'none' }}>
        <CreateTransfer />
      </div>
      <div style={{ display: activeTab === 'manage' ? 'block' : 'none' }}>
        <ManageTransfer />
      </div>
    </div>
  );
};

export default WarehouseTransfer;
