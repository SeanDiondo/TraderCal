import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "./styles/navbar.module.css";

const Navbar: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
          <Link to="/contact">Feedback</Link>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
