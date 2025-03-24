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

  return (
    <div className={clsx(styles.dateInput, className)} style={style}>
      <input
        type="datetime-local"
        placeholder={placeholder}
        value={selectedDate ? selectedDate.toISOString().slice(0, 16) : ''}
        onChange={(e) => handleDateChange(new Date(e.target.value))}
        className={clsx(styles.input)}
        onClick={toggleCalendar}
      />
    </div>
  );
};

export default DateInput;
