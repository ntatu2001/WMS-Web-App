import React, { useState } from 'react';
import { lotStatusData } from '../../../../app/mockData/LotStatusData';

const ReceiptProgress = ({ item, handleStatusChange }) => {
  const [isOpen, setIsOpen] = useState(false); // State để kiểm soát hiển thị dropdown

  // Hàm xử lý khi chọn một option
  const handleSelect = (status) => {
    handleStatusChange(item.id, status); // Gọi hàm xử lý thay đổi status
    setIsOpen(false); // Đóng dropdown sau khi chọn
  };

  // Check if status is "Hoàn thành" to disable dropdown
  const isCompleted = item.status === "Hoàn thành";

  return (
    <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
      {/* Nút để mở dropdown */}
      <div
        onClick={() => !isCompleted && setIsOpen(!isOpen)}
        style={{
          backgroundColor: lotStatusData[item.status],
          color: "white",
          fontWeight: "bold",
          fontSize: "14px",
          padding: "4px 8px",
          borderRadius: "8px",
          cursor: isCompleted ? "default" : "pointer", // Change cursor if completed
          textAlign: "center",
          width: '100%',
          margin: '0 auto',
        }}
      >
        {item.status}
      </div>

      {/* Dropdown menu - only show if not completed */}
      {isOpen && !isCompleted && (
        <ul
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            overflow: "scroll",
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