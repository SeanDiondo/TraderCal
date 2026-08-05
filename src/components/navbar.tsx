import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./styles/navbar.module.css";

const Navbar: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    navigate('/');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className={styles.header}>
      <div className={`container ${styles.row}`}>
        <Link to="/" className={styles.logo} aria-label="TradeSmart">
          <img src="/logo.png" alt="TradeSmart" style={{ maxWidth: '200px', height: '40px', objectFit: 'contain' }} />TraderCal
        </Link>
        
        <button 
          className={styles.hamburger}
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
          aria-expanded={isMobileMenuOpen}
        >
          <span className={`${styles.hamburgerLine} ${isMobileMenuOpen ? styles.hamburgerLineOpen : ''}`}></span>
          <span className={`${styles.hamburgerLine} ${isMobileMenuOpen ? styles.hamburgerLineOpen : ''}`}></span>
          <span className={`${styles.hamburgerLine} ${isMobileMenuOpen ? styles.hamburgerLineOpen : ''}`}></span>
        </button>

        <nav className={`${styles.nav} ${isMobileMenuOpen ? styles.navOpen : ''}`} aria-label="Primary">
          <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
          <div className={styles.dropdown} ref={dropdownRef}>
            <button 
              className={styles.dropdownToggle}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              aria-expanded={isDropdownOpen}
            >
              Calculator
              <span className={`${styles.arrow} ${isDropdownOpen ? styles.arrowOpen : ''}`}>▼</span>
            </button>
            <div className={`${styles.dropdownMenu} ${isDropdownOpen ? styles.dropdownMenuOpen : ''}`}>
              <Link to="/leverage-calculator" onClick={() => { setIsDropdownOpen(false); setIsMobileMenuOpen(false); }}>Leverage Calculator</Link>
              <Link to="/calculator" onClick={() => { setIsDropdownOpen(false); setIsMobileMenuOpen(false); }}>Forex/Indices Calculator</Link>
            </div>
          </div>
          <Link to="/news" onClick={() => setIsMobileMenuOpen(false)}>News</Link>
          {isLoggedIn && <Link to="/journal" onClick={() => setIsMobileMenuOpen(false)}>Journal</Link>}
          <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)}>Feedback</Link>
          {isLoggedIn ? (
            <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className={styles.logoutButton}>Logout</button>
          ) : (
            <>
              <Link to="/login" className={styles.authLink} onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
              <Link to="/register" className={styles.authLink} onClick={() => setIsMobileMenuOpen(false)}>Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
