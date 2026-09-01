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
import useTranslation from '../../../../common/hooks/useTranslation';

const History = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('goods');
  const headerText = activeTab === 'employees' ? t('catalogue.tabEmployees') :
                     activeTab === 'storelocation' ? t('catalogue.tabStoreLocation') : t('catalogue.tabGoods');

  return (
    <div style={{ padding: 0, backgroundColor: 'var(--color-bg)' }}>
      <HeaderContainer>
        <HeaderItem>{t('catalogue.heading')}</HeaderItem>
        <Separator />
        <HeaderItem>{headerText}</HeaderItem>
      </HeaderContainer>

      <TabContainer>
        <TabButton
          active={activeTab === 'goods'}
          onClick={() => setActiveTab('goods')}
        >
          {t('catalogue.tabGoods')}
        </TabButton>
        <TabButton
          active={activeTab === 'employees'}
          onClick={() => setActiveTab('employees')}
        >
          {t('catalogue.tabEmployees')}
        </TabButton>
        <TabButton
          active={activeTab === 'storelocation'}
          onClick={() => setActiveTab('storelocation')}
        >
          {t('catalogue.tabStoreLocation')}
        </TabButton>
      </TabContainer>

      {activeTab === 'goods' ? <Goods /> :
       activeTab === 'employees' ? <Employees /> : <StoreLocation/>}
    </div>
  );
};

export default History;