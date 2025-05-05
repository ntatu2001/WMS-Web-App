import React, { useState } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import HeaderContainer from '../../../../common/components/Header/HeaderContainer.jsx';
import HeaderItem from '../../../../common/components/Header/HeaderItem.jsx';
import TabContainer from '../../../../common/components/Tab/TabContainer.jsx';
import TabButton from '../../../../common/components/Tab/TabButton.jsx';
import Separator from '../../../../common/components/Header/Separator.jsx';
import CreateGoodIssue from '../CreateGoodIssue/CreateGoodIssue.jsx';
import ManageGoodIssue from '../ManageGoodIssue/ManageGoodIssue.jsx';
import IssueDistribution from '../InCompleteIssue/IssueDistribution/IssueDistribution.jsx';
import InCompleteIssue from '../InCompleteIssue/InCompleteIssue.jsx';
import ActionButton from '../../../../common/components/Button/ActionButton/ActionButton.jsx';


const GoodIssue = () => {
    const [activeTab, setActiveTab] = useState('create');
    const headerText = activeTab === 'create' ? "Tạo phiếu xuất kho" :
                       activeTab === 'manage' ? "Quản lý xuất kho" :
                       activeTab === 'viewResult' ? "Kết quả phân bố vị trí lấy hàng" : "Xuất kho chưa hoàn thành"

    return (
        <div style={{ backgroundColor: '#f5f5f5' }}>
        <div style={{display: "flex", width: "100%", alignItems: "center"}}>
            <HeaderContainer>
                <HeaderItem>Xuất kho</HeaderItem>
                <Separator />
                <HeaderItem>{headerText}</HeaderItem>
            </HeaderContainer>
           
          {(activeTab === 'incomplete' || activeTab === 'viewResult') && (
            <>
                <ActionButton
                  active={activeTab === 'incomplete'}
                  onClick={() => setActiveTab('incomplete')}
                  style={activeTab === 'incomplete' ? 
                    { backgroundColor: '#003366', borderRadius: "4px", width: "20%", height: "40px", marginTop: 0, padding: 0, marginRight: "2%" } : 
                    { backgroundColor: '#0099cc', borderRadius: "4px", width: "20%", height: "40px", marginTop: 0, padding: 0, marginRight: "2%" }
                  }
                >
                  Phân bố vị trí lấy hàng
                </ActionButton>
                <ActionButton
                  active={activeTab === 'viewResult'}
                  onClick={() => setActiveTab('viewResult')}
                  style={activeTab === 'viewResult' ? 
                    { backgroundColor: '#003366', borderRadius: "4px", width: "20%", height: "40px", marginTop: 0, padding: 0, marginLeft: 0} : 
                    { backgroundColor: '#0099cc', borderRadius: "4px", width: "20%", height: "40px", marginTop: 0, padding: 0, marginLeft: 0}
                  }
                >
                  Xem kết quả phân bổ
                </ActionButton>
            </>
          )}

          
           
             
        </div>

          {activeTab !== 'viewResult' && (
            <>
                <TabContainer>
                <TabButton
                  active={activeTab === 'create'}
                  onClick={() => setActiveTab('create')}
                >
                  Tạo phiếu xuất kho
                </TabButton>
                
                <TabButton
                  active={activeTab === 'incomplete'}
                  onClick={() => setActiveTab('incomplete')}
                >
                  Xuất kho chưa hoàn thành
                </TabButton>


                <TabButton
                  active={activeTab === 'manage'}
                  onClick={() => setActiveTab('manage')}
                >
                  Quản lý xuất kho
                </TabButton>

                
              </TabContainer>
            </>
          )}

      {activeTab === 'create' && <CreateGoodIssue />}
      {activeTab === 'manage' && <ManageGoodIssue />}
      
      {(activeTab === 'incomplete' || activeTab === 'viewResult') && (
        <>
          <div style={{ display: activeTab === 'incomplete' ? 'block' : 'none' }}>
            <InCompleteIssue />
          </div>
          <div style={{ display: activeTab === 'viewResult' ? 'block' : 'none' }}>
            <IssueDistribution />
          </div>
        </>
      )}
    </div>
    );
};

export default GoodIssue;