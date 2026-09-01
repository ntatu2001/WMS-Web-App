import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import 'react-datepicker/dist/react-datepicker.css';
import { BiCube } from 'react-icons/bi';
import { AiOutlineAppstore } from 'react-icons/ai';
import { FaCheckCircle } from 'react-icons/fa';
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

const headerActionButtonStyle = {
  borderRadius: "6px",
  minWidth: "220px",
  height: "44px",
  marginTop: 0,
  padding: "0 16px",
  fontSize: "15px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  whiteSpace: "nowrap",
};

const GoodReceipt = () => {
  const roles = useSelector((state) => state.auth.roles);
  const canManage = roles.includes('Manager') || roles.includes('Admin');
  const [searchParams, setSearchParams] = useSearchParams();
  // Đồng bộ tab đang chọn với query param ?tab= trên URL để reload trang vẫn
  // giữ đúng tab thay vì luôn quay về "Tạo phiếu nhập kho". "viewResult" là
  // bước xem tạm trong luồng phân bổ nên không lưu vào URL.
  const [activeTab, setActiveTabState] = useState(() => {
    const tab = searchParams.get('tab');
    if (tab === 'create') return 'create';
    if (canManage && (tab === 'incomplete' || tab === 'manage')) return tab;
    return 'create';
  });
  const setActiveTab = (tab) => {
    setActiveTabState(tab);
    if (tab !== 'viewResult') {
      setSearchParams({ tab }, { replace: true });
    }
  };
  const [incompleteReceiptMounted, setIncompleteReceiptMounted] = useState(false);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState(null);
  const [isComingFromViewResult, setIsComingFromViewResult] = useState(false);
  
  const headerText = activeTab === 'create' ? "Tạo phiếu nhập kho" :
                     activeTab === 'manage' ? "Quản lý nhập kho" :
                     activeTab === 'viewResult' ? "Kết quả phân bố vị trí lưu kho" : "Nhập kho chưa hoàn thành"
  
  // Reference to store the fetchReceiptDetailScheduling function
  const fetchReceiptDetailSchedulingRef = useRef(null);
  // Reference to store the updateReceiptSublots (approve) function
  const approveReceiptRef = useRef(null);
  const [isApproving, setIsApproving] = useState(false);

  // Function to handle the receipt distribution button click
  const handleReceiptDistributionClick = () => {
    setIsComingFromViewResult(false); // Reset the flag when clicking the button
    setActiveTab('incomplete');
    if (fetchReceiptDetailSchedulingRef.current) {
      fetchReceiptDetailSchedulingRef.current(false); // Pass false to force API call
    }
  };
  
  // Modify the tab change handler for the "Xem kết quả phân bổ" button
  const handleViewResultClick = () => {
    setIsComingFromViewResult(true);
    setActiveTab('viewResult');
  };

  // Function to receive the fetchReceiptDetailScheduling from InCompleteReceipt
  const setFetchFunction = (fetchFn) => {
    fetchReceiptDetailSchedulingRef.current = fetchFn;
  };

  // Function to receive the updateReceiptSublots (approve) function from InCompleteReceipt
  const setApproveFunction = (approveFn) => {
    approveReceiptRef.current = approveFn;
  };

  const handleApproveClick = () => {
    if (approveReceiptRef.current) {
      approveReceiptRef.current();
    }
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

  // Function to handle clicking the "Nhập kho chưa hoàn thành" tab
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
    <div style={{ backgroundColor: 'var(--color-bg)' }}>
        <div style={{display: "flex", width: "100%", alignItems: "center"}}>
            <HeaderContainer>
                <HeaderItem>Nhập kho</HeaderItem>
                <Separator />
                <HeaderItem>{headerText}</HeaderItem>
            </HeaderContainer>
           
          {(activeTab === 'incomplete' || activeTab === 'viewResult') && (
            <div style={{ display: 'flex', gap: '12px', marginLeft: 'auto', marginRight: '20px' }}>
                <ActionButton
                  active={activeTab === 'incomplete'}
                  variant={activeTab === 'incomplete' ? undefined : 'secondary'}
                  onClick={handleReceiptDistributionClick}
                  style={headerActionButtonStyle}
                >
                  <BiCube size={18} /> Phân bố vị trí lưu kho
                </ActionButton>
                <ActionButton
                  active={activeTab === 'viewResult'}
                  variant={activeTab === 'viewResult' ? undefined : 'secondary'}
                  onClick={handleViewResultClick}
                  style={headerActionButtonStyle}
                >
                  <AiOutlineAppstore size={18} /> Xem kết quả phân bổ
                </ActionButton>
                <ActionButton
                  variant="secondary"
                  onClick={handleApproveClick}
                  disabled={isApproving}
                  style={headerActionButtonStyle}
                >
                  <FaCheckCircle size={16} /> Duyệt danh sách nhập kho
                </ActionButton>
            </div>
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
                
                {canManage && (
                  <>
                    <TabButton
                      active={activeTab === 'incomplete'}
                      onClick={handleIncompleteTabClick}  // Changed this line
                    >
                      Nhập kho chưa hoàn thành
                    </TabButton>


                    <TabButton
                      active={activeTab === 'manage'}
                      onClick={() => setActiveTab('manage')}
                    >
                      Quản lý nhập kho
                    </TabButton>
                  </>
                )}


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
              isComingFromViewResult={isComingFromViewResult}
              onApproveButtonClick={setApproveFunction}
              onUpdatingChange={setIsApproving}
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