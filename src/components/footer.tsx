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
              <strong>Risk Disclaimer:</strong> Trading involves substantial risk of loss. Our calculators provide
              educational estimates only. Past performance is not indicative of future results.
            </p>
          </div>
          <nav className={styles.links} aria-label="Footer">
            <a href="#privacy">Privacy</a>
            <a href="#terms">Terms</a>
            <a href="#contact" id="contact">Contact</a>
          </nav>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
