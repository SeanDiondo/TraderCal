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
              Featuring our Leverage Calculator. You should not guess your leverage or trading is just a Gamble, 
              Calculate your Risk and Protect your Capital.
            </p>
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
