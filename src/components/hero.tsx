import React from "react";
import styles from "./styles/Hero.module.css";

const Hero: React.FC = () => {
  return (
    <section className={styles.hero}>
      <div className="container">
        <div className={styles.left}>
          <h1 className={styles.title}>Trading as a Business</h1>
          <p className={styles.subtitle}>
            Professional trading tools for Futures, Forex, and Commodities. Calculate your Risk and Protect your Capital,
            Every trade should be calculated before execution.
          </p>
          <div className={styles.howToUse}>
            <h2 className={styles.howToUseTitle}>Our Calculators</h2>
            <ul className={styles.steps}>           
              <li className={styles.step}>
                <span className={styles.stepNumber}>1</span>
                <span className={styles.stepText}><strong>Leverage Calculator</strong> - Calculate optimal leverage and position size for futures trading</span>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber}>2</span>
                <span className={styles.stepText}><strong>Forex/Indices Calculator</strong> - Lot size and pip calculations for forex and commodities</span>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber}>3</span>
                <span className={styles.stepText}><strong>Risk Management</strong> - Protect your capital with proper risk calculations</span>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber}>4</span>
                <span className={styles.stepText}><strong>Professional Tools</strong> - Trade like a professional with our business-grade calculators</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
