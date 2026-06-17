import React from "react";
import styles from "./styles/Hero.module.css";
import CalculatorMock from "./calculatorMock";

const Hero: React.FC = () => {
  return (
    <section className={styles.hero}>
      <div className="container">
        <div className={styles.grid}>
          <div className={styles.left}>
            <h1 className={styles.title}>Trading as a Business</h1>
            <p className={styles.subtitle}>
              Featuring our Leverage Calculator for Futures Trading. Calculate your Risk and Protect your Capital,
              Every trade should be calculated before execution.
            </p>
            <div className={styles.howToUse}>
              <h2 className={styles.howToUseTitle}>How to Use</h2>
              <ul className={styles.steps}>           
                <li className={styles.step}>
                  <span className={styles.stepNumber}>1</span>
                  <span className={styles.stepText}>Input <strong>Stoploss limit %</strong> - The allowed percentage of loss of the trader</span>
                </li>
                <li className={styles.step}>
                  <span className={styles.stepNumber}>2</span>
                  <span className={styles.stepText}>Input <strong>Capital funds</strong></span>
                </li>
                <li className={styles.step}>
                  <span className={styles.stepNumber}>3</span>
                  <span className={styles.stepText}>Input <strong>Risk %</strong> - The Risk Percentage of your capital per trade</span>
                </li>
                <li className={styles.step}>
                  <span className={styles.stepNumber}>4</span>
                  <span className={styles.stepText}>Input <strong>Planned prices</strong> - The prices you plan to enter and exit for your Trading Pairs</span>
                </li>
              </ul>
            </div>
          </div>
          <div className={styles.right} aria-hidden="true">
            <CalculatorMock />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
