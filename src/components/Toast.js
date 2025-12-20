import React, { useEffect, useState } from 'react';
import './Toast.css';
import { useTheme } from '../context/ThemeContext';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
  const { isDarkMode } = useTheme();
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, 300);
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <i className="bi bi-check-circle-fill"></i>;
      case 'error':
        return <i className="bi bi-x-circle-fill"></i>;
      case 'warning':
        return <i className="bi bi-exclamation-triangle-fill"></i>;
      case 'info':
        return <i className="bi bi-info-circle-fill"></i>;
      default:
        return <i className="bi bi-check-circle-fill"></i>;
    }
  };

  if (!isVisible) return null;

  return (
    <div className={`toast-container ${isExiting ? 'toast-exit' : 'toast-enter'} ${type}`}>
      <div className="toast-content">
        <div className="toast-icon">{getIcon()}</div>
        <div className="toast-message">{message}</div>
        <button className="toast-close" onClick={handleClose} aria-label="Close">
          <i className="bi bi-x"></i>
        </button>
      </div>
    </div>
  );
};

export default Toast;

