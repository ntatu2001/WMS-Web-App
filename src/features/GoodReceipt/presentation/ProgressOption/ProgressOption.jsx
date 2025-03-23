import React, { useState } from 'react';

const ProgressOption = ({ item, handleStatusChange }) => {
  const [isOpen, setIsOpen] = useState(false); // State để kiểm soát hiển thị dropdown

  // Hàm xử lý khi chọn một option
  const handleSelect = (status) => {
    handleStatusChange(item.id, status); // Gọi hàm xử lý thay đổi status
    setIsOpen(false); // Đóng dropdown sau khi chọn
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {/* Nút để mở dropdown */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          backgroundColor: item.status === "Đang kiểm tra" ? "#0052cc" : "#ff9800",
          color: "white",
          fontWeight: "bold",
          fontSize: "12px",
          padding: "4px 8px",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        {item.status}
      </div>

      {/* Dropdown menu */}
      {isOpen && (
        <ul
          style={{
            // position: 'absolute',
            top: '100%',
            left: 0,
            backgroundColor: 'white',
            border: '1px solid #000',
            borderRadius: '4px',
            listStyle: 'none',
            padding: 0,
            margin: 0,
            zIndex: 1000,
            width: '100%',
          }}
        >
          <li
            onClick={() => handleSelect("Đang kiểm tra")}
            style={{
              padding: '8px',
              cursor: 'pointer',
              backgroundColor: "#0052cc",
              color:  "white",
              fontWeight: "bold",
            }}
          >
            Đang kiểm tra
          </li>
          <li
            onClick={() => handleSelect("Đang lấy hàng")}
            style={{
              padding: '8px',
              cursor: 'pointer',
              backgroundColor: "#ff9800",
              color:"white",
              fontWeight: "bold",
            }}
          >
            Đang lấy hàng
          </li>
        </ul>
      )}
    </div>
  );
};

export default ProgressOption;