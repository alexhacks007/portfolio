import React, { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import './CustomCursor.css';

const CustomCursor = () => {
  const { isDarkMode } = useTheme();
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Check if device supports hover (desktop)
    const isDesktop = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!isDesktop) {
      setIsVisible(false);
      return;
    }

    let animationFrameId;
    let lastX = 0;
    let lastY = 0;

    const updateCursor = (e) => {
      lastX = e.clientX;
      lastY = e.clientY;
      
      // Use requestAnimationFrame for smooth animation
      if (!animationFrameId) {
        animationFrameId = requestAnimationFrame(() => {
          setPosition({ x: lastX, y: lastY });
          animationFrameId = null;
        });
      }
    };

    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => setIsVisible(false);

    // Check for hoverable elements
    const handleMouseOver = (e) => {
      const target = e.target;
      if (
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        target.closest('a') ||
        target.closest('button') ||
        target.closest('.project') ||
        target.closest('.skill') ||
        target.closest('.contact-icon') ||
        target.closest('.cv-icon-btn') ||
        target.closest('.theme-toggle-switch') ||
        target.closest('.nav-link') ||
        target.closest('.sidebar-nav-link') ||
        target.closest('input') ||
        target.closest('textarea') ||
        target.closest('select') ||
        target.style.cursor === 'pointer' ||
        window.getComputedStyle(target).cursor === 'pointer'
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', updateCursor, { passive: true });
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseover', handleMouseOver, { passive: true });

    // Hide default cursor
    document.body.style.cursor = 'none';

    return () => {
      window.removeEventListener('mousemove', updateCursor);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseover', handleMouseOver);
      document.body.style.cursor = 'auto';
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  if (!isVisible) return null;

  return (
    <>
      <div
        className={`custom-cursor ${isHovering ? 'hover' : ''} ${isDarkMode ? 'dark' : 'light'}`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
      >
        <div className="cursor-outer"></div>
        <div className="cursor-inner"></div>
      </div>
      <div
        className={`custom-cursor-trail ${isDarkMode ? 'dark' : 'light'}`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
      ></div>
    </>
  );
};

export default CustomCursor;

