import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./styles/navbar.module.css";

const Navbar: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
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

  return (
    <header className={styles.header}>
      <div className={`container ${styles.row}`}>
        <Link to="/" className={styles.logo} aria-label="TradeSmart">
          <img src="/logo.png" alt="TradeSmart" style={{ maxWidth: '200px', height: '40px', objectFit: 'contain' }} />TraderCal
        </Link>
        <nav className={styles.nav} aria-label="Primary">
          <Link to="/">Home</Link>
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
              <Link to="/leverage-calculator" onClick={() => setIsDropdownOpen(false)}>Leverage Calculator</Link>
              <Link to="/calculator" onClick={() => setIsDropdownOpen(false)}>Forex/Indices Calculator</Link>
            </div>
          </div>
          <Link to="/news">News</Link>
          {isLoggedIn && <Link to="/journal">Journal</Link>}
          <Link to="/contact">Feedback</Link>
          {isLoggedIn ? (
            <button onClick={handleLogout} className={styles.logoutButton}>Logout</button>
          ) : (
            <>
              <Link to="/login" className={styles.authLink}>Login</Link>
              <Link to="/register" className={styles.authLink}>Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
