import React, { useState, useRef, useEffect } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import HeaderContainer from '../../../../common/components/Header/HeaderContainer.jsx';
import HeaderItem from '../../../../common/components/Header/HeaderItem.jsx';
import TabContainer from '../../../../common/components/Tab/TabContainer.jsx';
import TabButton from '../../../../common/components/Tab/TabButton.jsx';
import Separator from '../../../../common/components/Header/Separator.jsx';
import CreateGoodReceipt from '../CreateGoodReceipt/CreateGoodReceipt.jsx';
import ManageGoodReceipt from '../ManageGoodReceipt/ManageGoodReceipt.jsx';
import InCompleteReceipt from '../InCompleteReceipt/InCompleteReceipt.jsx';
import ReceiptDistribution from '../InCompleteReceipt/ReceiptDistribution/ReceiptDistribution.jsx'
import ActionButton from '../../../../common/components/Button/ActionButton/ActionButton.jsx';

const GoodReceipt = () => {
  const [activeTab, setActiveTab] = useState('create');
  const [incompleteReceiptMounted, setIncompleteReceiptMounted] = useState(false);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState(null);
  
  const headerText = activeTab === 'create' ? "Tạo phiếu nhập kho" :
                     activeTab === 'manage' ? "Quản lý nhập kho" :
                     activeTab === 'viewResult' ? "Kết quả phân bố vị trí lưu kho" : "Nhập kho chưa hoàn thành"
  
  // Reference to store the fetchReceiptDetailScheduling function
  const fetchReceiptDetailSchedulingRef = useRef(null);
  
  // Function to handle the receipt distribution button click
  const handleReceiptDistributionClick = () => {
    setActiveTab('incomplete');
    // Call the fetchReceiptDetailScheduling function when the button is clicked
    if (fetchReceiptDetailSchedulingRef.current) {
      fetchReceiptDetailSchedulingRef.current();
    }
  };
  
  // Function to receive the fetchReceiptDetailScheduling from InCompleteReceipt
  const setFetchFunction = (fetchFn) => {
    fetchReceiptDetailSchedulingRef.current = fetchFn;
  };
  
  // Function to handle warehouse ID changes
  const handleWarehouseChange = (warehouseId) => {
    console.log("Selected warehouse ID in parent:", warehouseId);
    setSelectedWarehouseId(warehouseId);
  };

  // Mount InCompleteReceipt when needed
  useEffect(() => {
    if (activeTab === 'incomplete' || activeTab === 'viewResult') {
      setIncompleteReceiptMounted(true);
    }
  }, [activeTab]);

  return (
    <div style={{ backgroundColor: '#f5f5f5' }}>
        <div style={{display: "flex", width: "100%", alignItems: "center"}}>
            <HeaderContainer>
                <HeaderItem>Nhập kho</HeaderItem>
                <Separator />
                <HeaderItem>{headerText}</HeaderItem>
            </HeaderContainer>
           
          {(activeTab === 'incomplete' || activeTab === 'viewResult') && (
            <>
                <ActionButton
                  active={activeTab === 'incomplete'}
                  onClick={handleReceiptDistributionClick}
                  style={activeTab === 'incomplete' ? 
                    { backgroundColor: '#003366', borderRadius: "4px", width: "20%", height: "40px", marginTop: 0, padding: 0, marginRight: "2%" } : 
                    { backgroundColor: '#0099cc', borderRadius: "4px", width: "20%", height: "40px", marginTop: 0, padding: 0, marginRight: "2%" }
                  }
                >
                  Phân bố vị trí lưu kho
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
                  Tạo phiếu nhập kho
                </TabButton>
                
                <TabButton
                  active={activeTab === 'incomplete'}
                  onClick={() => setActiveTab('incomplete')}
                >
                  Nhập kho chưa hoàn thành
                </TabButton>


                <TabButton
                  active={activeTab === 'manage'}
                  onClick={() => setActiveTab('manage')}
                >
                  Quản lý nhập kho
                </TabButton>

                
              </TabContainer>
            </>
          )}

      {activeTab === 'create' && <CreateGoodReceipt />}
      {activeTab === 'manage' && <ManageGoodReceipt />}
      
      {/* Keep InCompleteReceipt mounted but hide it when not active */}
      {incompleteReceiptMounted && (
        <>
          <div style={{ display: activeTab === 'incomplete' ? 'block' : 'none' }}>
            <InCompleteReceipt 
              onButtonClick={setFetchFunction} 
              onWarehouseChange={handleWarehouseChange}
            />
          </div>
          <div style={{ display: activeTab === 'viewResult' ? 'block' : 'none' }}>
            <ReceiptDistribution warehouseId={selectedWarehouseId} isActive={activeTab === 'viewResult'} />
          </div>
        </>
      )}
    </div>
  );
};

export default GoodReceipt;