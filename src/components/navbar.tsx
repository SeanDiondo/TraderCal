import React from "react";
import { Link } from "react-router-dom";
import styles from "./styles/Navbar.module.css";

const Navbar: React.FC = () => {
  return (
    <header className={styles.header}>
      <div className={`container ${styles.row}`}>
        <Link to="/" className={styles.logo} aria-label="TradeSmart">
          <img src="/logo.png" alt="TradeSmart" style={{ maxWidth: '200px', height: '40px', objectFit: 'contain' }} />TraderCal
        </Link>
        <nav className={styles.nav} aria-label="Primary">
          <a href="#tools">Tools</a>
          <Link to="/contact">Contact</Link>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
