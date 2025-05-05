import React, { useState } from 'react';
import { FaCalendarAlt } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
// import 'react-datepicker/dist/react-datepicker.css';
import clsx from 'clsx';
import styles from './DateInput.module.scss'

const DateInput = ({ 
  selectedDate, 
  onChange = () => {}, 
  placeholder = "Chọn ngày", 
  className = "", 
  style
}) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  // Toggle calendar visibility
  const toggleCalendar = () => {
    setIsCalendarOpen(!isCalendarOpen);
  };
  
  // Handle date change
  const handleDateChange = (date) => {
    onChange(date);
    setIsCalendarOpen(false);
  };

  // Format date to local datetime string for input
  const formatDateForInput = (date) => {
    if (!date) return '';
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  return (
    <div className={clsx(styles.dateInput, className)} style={style}>
      <input
        type="datetime-local"
        placeholder={placeholder}
        value={formatDateForInput(selectedDate)}
        onChange={(e) => handleDateChange(new Date(e.target.value))}
        className={clsx(styles.input)}
        onClick={toggleCalendar}
      />
    </div>
  );
};

export default DateInput;
