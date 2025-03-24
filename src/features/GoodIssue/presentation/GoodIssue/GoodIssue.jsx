import React, { useState } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import HeaderContainer from '../../../../common/components/Header/HeaderContainer.jsx';
import HeaderItem from '../../../../common/components/Header/HeaderItem.jsx';
import TabContainer from '../../../../common/components/Tab/TabContainer.jsx';
import TabButton from '../../../../common/components/Tab/TabButton.jsx';
import Separator from '../../../../common/components/Header/Separator.jsx';
import CreateGoodIssue from '../CreateGoodIssue/CreateGoodIssue.jsx';
import ManageGoodIssue from '../ManageGoodIssue/ManageGoodIssue.jsx';

const GoodIssue = () => {
    const [activeTab, setActiveTab] = useState('create');
    const headerText = activeTab === 'create' ? 'Tạo phiếu xuất kho' : 'Quản lý xuất kho';

    return (
        <div style={{ padding: 0, backgroundColor: '#f5f5f5' }}>
            <HeaderContainer>
                <HeaderItem>Xuất kho</HeaderItem>
                <Separator />
                <HeaderItem>{headerText}</HeaderItem>
            </HeaderContainer>

            <TabContainer>
                <TabButton
                    active={activeTab === 'create'}
                    onClick={() => setActiveTab('create')}
                >
                    Tạo phiếu xuất kho
                </TabButton>
                <TabButton
                    active={activeTab === 'manage'}
                    onClick={() => setActiveTab('manage')}
                >
                    Quản lý xuất kho
                </TabButton>
            </TabContainer>

            {activeTab === 'create' ? <CreateGoodIssue /> : <ManageGoodIssue />}
        </div>
    );
};

export default GoodIssue;