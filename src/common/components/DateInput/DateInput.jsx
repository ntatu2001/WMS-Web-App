import React, { useState, useRef } from 'react';
import { FaCalendarAlt } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import clsx from 'clsx';
import styles from './DateInput.module.scss'
const DateInput = ({ 
  selectedDate, 
  onChange, 
  placeholder = "Chọn ngày", 
  className = "", 
  dateFormat 
}) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const datePickerRef = useRef(null);
  
  // Format date as dd/MM/yyyy with weekday name
  const formatDate = (date) => {
    if (!date) return '';
    
    if (dateFormat) {
      return dateFormat(date);
    }
    
    const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    const day = days[date.getDay()];
    
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    
    return `${day} - ${dd}/${mm}/${yyyy}`;
  };
  
  // Toggle calendar visibility
  const toggleCalendar = () => {
    setIsCalendarOpen(!isCalendarOpen);
  };
  
  // Handle date change
  const handleDateChange = (date) => {
    onChange(date);
    setIsCalendarOpen(false);
  };

  return (
    <div className={clsx(styles.div, className)}>
      <input
        type="text"
        placeholder={placeholder}
        value={formatDate(selectedDate)}
        readOnly
        className={clsx(styles.input)}
      />
      <button 
        className={clsx(styles.button)}
        onClick={toggleCalendar}
      >
        <FaCalendarAlt size={16} />
      </button>
      {isCalendarOpen && (
        <DatePicker
          ref={datePickerRef}
          selected={selectedDate}
          onChange={handleDateChange}
          inline
          popperPlacement="bottom-end"
          onClickOutside={() => setIsCalendarOpen(false)}
        />
      )}
    </div>
  );
};

export default DateInput;
