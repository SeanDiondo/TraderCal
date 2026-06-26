import React from "react";
import styles from "./styles/Footer.module.css";

const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.grid}>
          <div className={styles.copy}>
            <div className={styles.brand}>©2026 TraderCal. All rights reserved</div>
            <p className={styles.disclaimer}>
            </p>
          </div>
          <nav className={styles.links} aria-label="Footer">
            <a href="#feedback" id="contact">Feedback</a>
          </nav>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
