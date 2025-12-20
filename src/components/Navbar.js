import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Navbar.css';
import logo from './logo3.png';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [activeSection, setActiveSection] = useState('profile');
  const [isCVDropdownOpen, setIsCVDropdownOpen] = useState(false);
  const [isCVModalOpen, setIsCVModalOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // Close sidebar when clicking on a link
  const handleLinkClick = () => {
    setIsSidebarOpen(false);
  };

  // Close sidebar on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        if (isSidebarOpen) {
          closeSidebar();
        }
        if (isCVModalOpen) {
          closeCVModal();
        }
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isSidebarOpen, isCVModalOpen]);

  // Prevent body scroll when sidebar or CV modal is open
  useEffect(() => {
    if (isSidebarOpen || isCVModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isSidebarOpen, isCVModalOpen]);

  // Handle navbar visibility on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show navbar at the top
      if (currentScrollY < 10) {
        setIsNavbarVisible(true);
      } 
      // Hide navbar when scrolling down, show when scrolling up
      else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsNavbarVisible(false);
      } 
      // Show navbar when scrolling up
      else if (currentScrollY < lastScrollY) {
        setIsNavbarVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Track active section on scroll
  useEffect(() => {
    const sections = ['profile', 'about', 'skills', 'educations', 'projects', 'contacts'];
    
    const handleScrollActive = () => {
      const scrollPosition = window.scrollY + 150; // Offset for better detection

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i]);
        if (section) {
          const sectionTop = section.offsetTop;
          const sectionHeight = section.offsetHeight;
          
          if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            setActiveSection(sections[i]);
            break;
          }
        }
      }

      // Handle top of page
      if (window.scrollY < 100) {
        setActiveSection('profile');
      }
    };

    window.addEventListener('scroll', handleScrollActive, { passive: true });
    handleScrollActive(); // Check on mount
    
    return () => window.removeEventListener('scroll', handleScrollActive);
  }, []);

  // Handle CV dropdown toggle
  const toggleCVDropdown = (e) => {
    e.stopPropagation();
    setIsCVDropdownOpen(!isCVDropdownOpen);
  };

  // Close CV dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isCVDropdownOpen && !e.target.closest('.cv-dropdown-container')) {
        setIsCVDropdownOpen(false);
      }
    };

    if (isCVDropdownOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isCVDropdownOpen]);

  // Handle CV actions
  const handleViewCV = () => {
    setIsCVModalOpen(true);
    setIsCVDropdownOpen(false);
  };

  const closeCVModal = () => {
    setIsCVModalOpen(false);
  };

  const handleDownloadCV = () => {
    const link = document.createElement('a');
    link.href = '/PATCHAIYAPPAN K CV.pdf';
    link.download = 'PATCHAIYAPPAN K CV.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsCVDropdownOpen(false);
  };

  return (
    <>
      <nav className={`navbar navbar-expand-lg ${isNavbarVisible ? 'navbar-visible' : 'navbar-hidden'}`}>
      <div className="container-fluid">
        <a className="navbar-brand" href="/"><img src={logo} alt='logo'></img></a>
        <button
            className={`navbar-toggler ${isSidebarOpen ? 'active' : ''}`}
          type="button"
            onClick={toggleSidebar}
          aria-label="Toggle navigation"
        >
            <span className="navbar-toggler-icon">
              <span></span>
              <span></span>
              <span></span>
            </span>
        </button>
          <div className="collapse navbar-collapse desktop-nav" id="navbarNav">
          <ul className="navbar-nav ms-auto">
              <li className={`nav-item ${activeSection === 'profile' ? 'active' : ''}`}>
                <a className={`nav-link ${activeSection === 'profile' ? 'active' : ''}`} href="#profile">Home</a>
              </li>
              <li className={`nav-item ${activeSection === 'about' ? 'active' : ''}`}>
                <a className={`nav-link ${activeSection === 'about' ? 'active' : ''}`} href="#about">About</a>
              </li>
              <li className={`nav-item ${activeSection === 'skills' ? 'active' : ''}`}>
                <a className={`nav-link ${activeSection === 'skills' ? 'active' : ''}`} href="#skills">Skills</a>
              </li>
              <li className={`nav-item ${activeSection === 'educations' ? 'active' : ''}`}>
                <a className={`nav-link ${activeSection === 'educations' ? 'active' : ''}`} href="#educations">Education</a>
              </li>
              <li className={`nav-item ${activeSection === 'projects' ? 'active' : ''}`}>
                <a className={`nav-link ${activeSection === 'projects' ? 'active' : ''}`} href="#projects">Projects</a>
              </li>
              <li className={`nav-item ${activeSection === 'contacts' ? 'active' : ''}`}>
                <a className={`nav-link ${activeSection === 'contacts' ? 'active' : ''}`} href="#contacts">Contact</a>
              </li>
              <li className="nav-item cv-dropdown-item cv-dropdown-container">
                <button 
                  className="cv-icon-btn"
                  onClick={toggleCVDropdown}
                  aria-label="CV Options"
                >
                  <i className="bi bi-file-earmark-person"></i>
                </button>
                <div className={`cv-dropdown ${isCVDropdownOpen ? 'open' : ''}`}>
                  <button className="cv-dropdown-item-btn" onClick={handleViewCV}>
                    <i className="bi bi-eye"></i>
                    <span>View CV</span>
                  </button>
                  <button className="cv-dropdown-item-btn" onClick={handleDownloadCV}>
                    <i className="bi bi-download"></i>
                    <span>Download CV</span>
                  </button>
                </div>
              </li>
              <li className="nav-item theme-toggle-item">
                <button 
                  className={`theme-toggle-switch ${isDarkMode ? 'dark' : 'light'}`}
                  onClick={toggleTheme}
                  aria-label="Toggle theme"
                >
                  <span className="toggle-slider">
                    <i className={`toggle-icon ${isDarkMode ? 'bi bi-moon-stars-fill' : 'bi bi-sun-fill'}`}></i>
                  </span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      <div className={`sidebar-overlay ${isSidebarOpen ? 'active' : ''}`} onClick={closeSidebar}></div>
      <aside className={`mobile-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <img src={logo} alt='logo' className="sidebar-logo"></img>
          <button className="sidebar-close" onClick={closeSidebar}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
        <nav className="sidebar-nav">
          <ul className="sidebar-nav-list">
            <li className="sidebar-nav-item">
              <a className={`sidebar-nav-link ${activeSection === 'profile' ? 'active' : ''}`} href="#profile" onClick={handleLinkClick}>
                <i className="bi bi-house-door"></i>
                <span>Home</span>
              </a>
            </li>
            <li className="sidebar-nav-item">
              <a className={`sidebar-nav-link ${activeSection === 'about' ? 'active' : ''}`} href="#about" onClick={handleLinkClick}>
                <i className="bi bi-person"></i>
                <span>About</span>
              </a>
            </li>
            <li className="sidebar-nav-item">
              <a className={`sidebar-nav-link ${activeSection === 'skills' ? 'active' : ''}`} href="#skills" onClick={handleLinkClick}>
                <i className="bi bi-code-slash"></i>
                <span>Skills</span>
              </a>
            </li>
            <li className="sidebar-nav-item">
              <a className={`sidebar-nav-link ${activeSection === 'educations' ? 'active' : ''}`} href="#educations" onClick={handleLinkClick}>
                <i className="bi bi-mortarboard"></i>
                <span>Education</span>
              </a>
            </li>
            <li className="sidebar-nav-item">
              <a className={`sidebar-nav-link ${activeSection === 'projects' ? 'active' : ''}`} href="#projects" onClick={handleLinkClick}>
                <i className="bi bi-folder"></i>
                <span>Projects</span>
              </a>
            </li>
            <li className="sidebar-nav-item">
              <a className={`sidebar-nav-link ${activeSection === 'contacts' ? 'active' : ''}`} href="#contacts" onClick={handleLinkClick}>
                <i className="bi bi-envelope"></i>
                <span>Contact</span>
              </a>
            </li>
            <li className="sidebar-nav-item sidebar-cv-item">
              <div className="sidebar-cv-options">
                <span>CV</span>
                <div className="sidebar-cv-buttons">
                  <button className="sidebar-cv-btn" onClick={handleViewCV}>
                    <i className="bi bi-eye"></i>
                    <span>View</span>
                  </button>
                  <button className="sidebar-cv-btn" onClick={handleDownloadCV}>
                    <i className="bi bi-download"></i>
                    <span>Download</span>
                  </button>
                </div>
              </div>
            </li>
            <li className="sidebar-nav-item theme-toggle-sidebar">
              <div className="sidebar-theme-toggle">
                <span>Theme</span>
                <button 
                  className={`theme-toggle-switch ${isDarkMode ? 'dark' : 'light'}`}
                  onClick={toggleTheme}
                  aria-label="Toggle theme"
                >
                  <span className="toggle-slider">
                    <i className={`toggle-icon ${isDarkMode ? 'bi bi-moon-stars-fill' : 'bi bi-sun-fill'}`}></i>
                  </span>
                </button>
              </div>
            </li>
          </ul>
        </nav>
      </aside>

      {/* CV Modal */}
      {isCVModalOpen && (
        <div className="cv-modal-overlay" onClick={closeCVModal}>
          <div className="cv-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="cv-modal-header">
              <h3>My CV</h3>
              <div className="cv-modal-actions">
                <button className="cv-modal-download-btn" onClick={handleDownloadCV} title="Download CV">
                  <i className="bi bi-download"></i>
                </button>
                <button className="cv-modal-close-btn" onClick={closeCVModal} aria-label="Close CV">
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>
            </div>
            <div className="cv-modal-content">
              <iframe
                src="/PATCHAIYAPPAN K CV.pdf"
                title="CV Viewer"
                className="cv-iframe"
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
