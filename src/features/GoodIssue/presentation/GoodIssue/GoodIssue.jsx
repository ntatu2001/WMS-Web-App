import React, { useState, useRef, useEffect } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import HeaderContainer from '../../../../common/components/Header/HeaderContainer.jsx';
import HeaderItem from '../../../../common/components/Header/HeaderItem.jsx';
import TabContainer from '../../../../common/components/Tab/TabContainer.jsx';
import TabButton from '../../../../common/components/Tab/TabButton.jsx';
import Separator from '../../../../common/components/Header/Separator.jsx';
import CreateGoodIssue from '../CreateGoodIssue/CreateGoodIssue.jsx';
import ManageGoodIssue from '../ManageGoodIssue/ManageGoodIssue.jsx';
import InCompleteIssue from '../InCompleteIssue/InCompleteIssue.jsx';
import IssueDistribution from '../InCompleteIssue/IssueDistribution/IssueDistribution.jsx';
import ActionButton from '../../../../common/components/Button/ActionButton/ActionButton.jsx';

const GoodIssue = () => {
  const [activeTab, setActiveTab] = useState('create');
  const [incompleteIssueMounted, setIncompleteIssueMounted] = useState(false);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState(null);
  const [isComingFromViewResult, setIsComingFromViewResult] = useState(false);
  
  const headerText = activeTab === 'create' ? "Tạo phiếu xuất kho" :
                     activeTab === 'manage' ? "Quản lý xuất kho" :
                     activeTab === 'viewResult' ? "Kết quả phân bố vị trí lấy hàng" : "Xuất kho chưa hoàn thành"
  
  // Reference to store the fetchIssueDetailScheduling function
  const fetchIssueDetailSchedulingRef = useRef(null);
  
  // Function to handle the issue distribution button click
  const handleIssueDistributionClick = () => {
    setIsComingFromViewResult(false); // Reset the flag when clicking the button
    setActiveTab('incomplete');
    if (fetchIssueDetailSchedulingRef.current) {
      fetchIssueDetailSchedulingRef.current(false); // Pass false to force API call
    }
  };
  
  // Function to receive the fetchIssueDetailScheduling from InCompleteIssue
  const setFetchFunction = (fetchFn) => {
    fetchIssueDetailSchedulingRef.current = fetchFn;
  };
  
  // Function to handle warehouse ID changes
  const handleWarehouseChange = (warehouseId) => {
    console.log("Selected warehouse ID in parent:", warehouseId);
    setSelectedWarehouseId(warehouseId);
  };

  // Mount InCompleteIssue when needed
  useEffect(() => {
    if (activeTab === 'incomplete' || activeTab === 'viewResult') {
      setIncompleteIssueMounted(true);
    }
  }, [activeTab]);

  // Modify the tab change handler for the "Xem kết quả phân bổ" button
  const handleViewResultClick = () => {
    setIsComingFromViewResult(true);
    setActiveTab('viewResult');
  };

  // Function to handle clicking the "Xuất kho chưa hoàn thành" tab
  const handleIncompleteTabClick = () => {
    if (activeTab === 'viewResult') {
      // Coming from viewResult tab - set flag to skip API call
      setIsComingFromViewResult(true);
    } else {
      // Coming from other tabs - clear flag to allow API call
      setIsComingFromViewResult(false);
    }
    setActiveTab('incomplete');
  };

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
                  onClick={handleIssueDistributionClick}
                  style={activeTab === 'incomplete' ? 
                    { backgroundColor: '#003366', borderRadius: "4px", width: "20%", height: "40px", marginTop: 0, padding: 0, marginRight: "2%" } : 
                    { backgroundColor: '#0099cc', borderRadius: "4px", width: "20%", height: "40px", marginTop: 0, padding: 0, marginRight: "2%" }
                  }
                >
                  Phân bố vị trí lấy hàng
                </ActionButton>
                <ActionButton
                  active={activeTab === 'viewResult'}
                  onClick={handleViewResultClick}
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
                  onClick={handleIncompleteTabClick}
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
      
      {/* Keep InCompleteIssue mounted but hide it when not active */}
      {incompleteIssueMounted && (
        <>
          <div style={{ display: activeTab === 'incomplete' ? 'block' : 'none' }}>
            <InCompleteIssue 
              onButtonClick={setFetchFunction} 
              onWarehouseChange={handleWarehouseChange}
              isComingFromViewResult={isComingFromViewResult}
            />
          </div>
          <div style={{ display: activeTab === 'viewResult' ? 'block' : 'none' }}>
            <IssueDistribution warehouseId={selectedWarehouseId} isActive={activeTab === 'viewResult'} />
          </div>
        </>
      )}
    </div>
  );
};

export default GoodIssue;