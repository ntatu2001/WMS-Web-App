import React, { useState, useEffect, useRef } from 'react';
import { lotStatusData } from '../../../../app/mockData/LotStatusData';

const ReceiptProgress = ({ item, handleStatusChange }) => {
  const [isOpen, setIsOpen] = useState(false); // State để kiểm soát hiển thị dropdown
  const [currentStatus, setCurrentStatus] = useState(item.status); // State lưu trữ trạng thái hiện tại
  const dropdownRef = useRef(null); // Ref để tham chiếu đến dropdown

  // Cập nhật lại currentStatus khi prop item.status thay đổi
  useEffect(() => {
    setCurrentStatus(item.status);
  }, [item.status]);

  // Xử lý click bên ngoài dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    // Thêm event listener khi dropdown mở
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // Cleanup event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Hàm xử lý khi chọn một option
  const handleSelect = (status) => {
    // Chỉ gọi API khi người dùng chọn trạng thái khác với trạng thái hiện tại
    if (status !== currentStatus) {
      handleStatusChange(item.id, status); // Gọi hàm xử lý thay đổi status
    }
    
    // Luôn cập nhật state local ngay lập tức để hiển thị UI
    setCurrentStatus(status);
    setIsOpen(false); // Đóng dropdown sau khi chọn
  };

  // Check if status is "Hoàn thành" to disable dropdown
  const isCompleted = currentStatus === "Hoàn thành";

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block', width: '100%'}}>
      {/* Nút để mở dropdown */}
      <div
        onClick={() => !isCompleted && setIsOpen(!isOpen)}
        style={{
          backgroundColor: lotStatusData[currentStatus],
          color: "white",
          fontWeight: "bold",
          fontSize: "14px",
          padding: "4px 8px",
          borderRadius: "8px",
          cursor: isCompleted ? "default" : "pointer", // Change cursor if completed
          textAlign: "center",
          width: '100%',
          margin: '0 5%',
        }}
      >
        {currentStatus}
      </div>

      {/* Dropdown menu - only show if not completed */}
      {isOpen && !isCompleted && (
        <ul
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            maxHeight: '150px', // Giới hạn chiều cao của dropdown
            overflowY: 'auto', // Cho phép scroll theo chiều dọc khi cần
            backgroundColor: '#767676',
            border: '1px solid #000',
            borderRadius: '4px',
            listStyle: 'none',
            padding: 0,
            margin: '2px 0 0 0',
            zIndex: 1000,
            width: '100%',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
          }}
        >
          {Object.entries(lotStatusData).map(([status, color]) => (
            <li
              key={status}
              onClick={() => handleSelect(status)}
              style={{
                padding: '8px',
                cursor: 'pointer',
                backgroundColor: color,
                color: "white",
                fontWeight: "bold",
                margin: '2px 0',
                borderRadius: '4px',
                textAlign: 'center',
              }}
            >
              {status}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ReceiptProgress;