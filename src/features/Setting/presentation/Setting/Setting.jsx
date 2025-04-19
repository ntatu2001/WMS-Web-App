import React, { useState } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import HeaderContainer from '../../../../common/components/Header/HeaderContainer.jsx';
import HeaderItem from '../../../../common/components/Header/HeaderItem.jsx';
import TabContainer from '../../../../common/components/Tab/TabContainer.jsx';
import TabButton from '../../../../common/components/Tab/TabButton.jsx';
import Separator from '../../../../common/components/Header/Separator.jsx';
import Account from '../Account/Account.jsx';
import Update from '../Update/Update.jsx';
import Logout from '../Logout/Logout.jsx';

const Setting = () => {
  const [activeTab, setActiveTab] = useState('account');

  return (
    <div>
      <HeaderContainer>
        <HeaderItem title="Cài đặt" />
        <Separator />
      </HeaderContainer>
      <TabContainer>
        <TabButton active={activeTab === 'account'} onClick={() => setActiveTab('account')}>
          Tài khoản
        </TabButton>
        <TabButton active={activeTab === 'update'} onClick={() => setActiveTab('update')}>
          Cập nhật
        </TabButton>
        <TabButton active={activeTab === 'logout'} onClick={() => setActiveTab('logout')}>
          Đăng xuất
        </TabButton>
      </TabContainer>
      <div>
        {activeTab === 'account' && <Account />}
        {activeTab === 'update' && <Update />}
        {activeTab === 'logout' && <Logout />}
      </div>
    </div>
  );
};

export default Setting;