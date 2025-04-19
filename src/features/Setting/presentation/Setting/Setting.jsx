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
  const headerText = activeTab === 'account' ? "Tài khoản" :
                     activeTab === 'update' ? "Cập nhật" : "Đăng xuất";

  return (
    <div style={{ padding: 0, backgroundColor: '#f5f5f5' }}>
      <HeaderContainer>
        <HeaderItem>Cài đặt</HeaderItem>
        <Separator />
        <HeaderItem>{headerText}</HeaderItem>
      </HeaderContainer>

      <TabContainer>
        <TabButton
          active={activeTab === 'account'}
          onClick={() => setActiveTab('account')}
        >
          Tài khoản
        </TabButton>
        <TabButton
          active={activeTab === 'update'}
          onClick={() => setActiveTab('update')}
        >
          Cập nhật
        </TabButton>
        <TabButton
          active={activeTab === 'logout'}
          onClick={() => setActiveTab('logout')}
        >
          Đăng xuất
        </TabButton>
      </TabContainer>

      {activeTab === 'account' ? <Account /> :
       activeTab === 'update' ? <Update /> : <Logout />}
    </div>
  );
};

export default Setting;