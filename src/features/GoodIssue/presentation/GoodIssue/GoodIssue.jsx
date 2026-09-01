import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import 'react-datepicker/dist/react-datepicker.css';
import { BiCube } from 'react-icons/bi';
import { AiOutlineAppstore, AiFillCheckCircle } from 'react-icons/ai';
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

const GoodIssue = () => {
  const roles = useSelector((state) => state.auth.roles);
  const canManage = roles.includes('Manager') || roles.includes('Admin');
  const [searchParams, setSearchParams] = useSearchParams();
  // Đồng bộ tab đang chọn với query param ?tab= trên URL để reload trang vẫn
  // giữ đúng tab thay vì luôn quay về "Tạo phiếu xuất kho". "viewResult" là
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
  const [incompleteIssueMounted, setIncompleteIssueMounted] = useState(false);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState(null);
  const [isComingFromViewResult, setIsComingFromViewResult] = useState(false);

  const headerText = activeTab === 'create' ? "Tạo phiếu xuất kho" :
                     activeTab === 'manage' ? "Quản lý xuất kho" :
                     activeTab === 'viewResult' ? "Kết quả phân bố vị trí lấy hàng" : "Xuất kho chưa hoàn thành"

  // Reference to store the fetchIssueDetailScheduling function
  const fetchIssueDetailSchedulingRef = useRef(null);
  // Reference to store the updateIssueSubLots (approve) function
  const approveIssueRef = useRef(null);
  const [isApproving, setIsApproving] = useState(false);

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

  // Function to receive the updateIssueSubLots (approve) function from InCompleteIssue
  const setApproveFunction = (approveFn) => {
    approveIssueRef.current = approveFn;
  };

  const handleApproveClick = () => {
    if (approveIssueRef.current) {
      approveIssueRef.current();
    }
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
    <div style={{ backgroundColor: 'var(--color-bg)' }}>
        <div style={{display: "flex", width: "100%", alignItems: "center"}}>
            <HeaderContainer>
                <HeaderItem>Xuất kho</HeaderItem>
                <Separator />
                <HeaderItem>{headerText}</HeaderItem>
            </HeaderContainer>

          {(activeTab === 'incomplete' || activeTab === 'viewResult') && (
            <div style={{ display: 'flex', gap: '12px', marginLeft: 'auto', marginRight: '20px' }}>
                <ActionButton
                  active={activeTab === 'incomplete'}
                  variant={activeTab === 'incomplete' ? undefined : 'secondary'}
                  onClick={handleIssueDistributionClick}
                  style={headerActionButtonStyle}
                >
                  <BiCube size={18} /> Phân bố vị trí lấy hàng
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
                  <AiFillCheckCircle size={18} /> Duyệt danh sách xuất kho
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
                  Tạo phiếu xuất kho
                </TabButton>

                {canManage && (
                  <>
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
                  </>
                )}


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
              onApproveButtonClick={setApproveFunction}
              onUpdatingChange={setIsApproving}
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
