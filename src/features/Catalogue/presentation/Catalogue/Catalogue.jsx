import React, { useState } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import HeaderContainer from '../../../../common/components/Header/HeaderContainer.jsx';
import HeaderItem from '../../../../common/components/Header/HeaderItem.jsx';
import TabContainer from '../../../../common/components/Tab/TabContainer.jsx';
import TabButton from '../../../../common/components/Tab/TabButton.jsx';
import Separator from '../../../../common/components/Header/Separator.jsx';
import Employees from '../Employees/Employees.jsx';
import Goods from '../Goods/Goods.jsx';
import StoreLocation from '../StoreLocation/StoreLocation.jsx';

const History = () => {
  const [activeTab, setActiveTab] = useState('goods');
  const headerText = activeTab === 'employees' ? "Nhân viên" :
                     activeTab === 'storelocation' ? "Vị trí lưu trữ" : "Hàng hóa";

  return (
    <div style={{ padding: 0, backgroundColor: '#f5f5f5' }}>
      <HeaderContainer>
        <HeaderItem>Danh mục</HeaderItem>
        <Separator />
        <HeaderItem>{headerText}</HeaderItem>
      </HeaderContainer>

      <TabContainer>
        <TabButton
          active={activeTab === 'goods'}
          onClick={() => setActiveTab('goods')}
        >
          Hàng hóa
        </TabButton>
        <TabButton
          active={activeTab === 'employees'}
          onClick={() => setActiveTab('employees')}
        >
          Nhân viên
        </TabButton>
        <TabButton
          active={activeTab === 'inventory'}
          onClick={() => setActiveTab('inventory')}
        >
          Vị trí lưu trữ
        </TabButton>
      </TabContainer>

      {activeTab === 'goods' ? <Goods /> :
       activeTab === 'employees' ? <Employees /> : <StoreLocation/>}
    </div>
  );
};

export default History;