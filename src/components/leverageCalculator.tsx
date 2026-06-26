import React, { useState, useEffect } from "react";
import styles from "./styles/CalculatorMock.module.css";

interface CalculatorState {
  stoplossLimit: number;
  capital: number;
  riskPercent: number;
  position: 'long' | 'short' | '';
  entryPrice: number;
  targetPrice: number;
  cutlossPrice: number;
}

const LeverageCalculator: React.FC = () => {
  const [values, setValues] = useState<CalculatorState>({
    stoplossLimit: 0,
    capital: 0,
    riskPercent: 0,
    position: '',
    entryPrice: 0,
    targetPrice: 0,
    cutlossPrice: 0,
  });

  const [results, setResults] = useState({
    leverage: 0,
    riskPercentage: 0,
    rewardPercentage: 0,
    positionSize: 0,
    contractSize: 0,
  });

  useEffect(() => {
    calculateResults();
  }, [values]);

  const calculateResults = () => {
    const { capital, stoplossLimit, riskPercent, entryPrice, targetPrice, cutlossPrice, position } = values;

    // Calculate price difference between entry and cutloss
    const priceDiff = Math.abs(entryPrice - cutlossPrice);

    // Calculate leverage based on stoploss limit percentage
    // Leverage = (Stoploss Limit % / 100) * (Entry Price / Price Difference)
    let leverage = 0;
    if (priceDiff > 0 && stoplossLimit > 0 && entryPrice > 0) {
      leverage = (stoplossLimit / 100) * (entryPrice / priceDiff);
    }

    // Calculate position size based on capital, risk percentage, and stoploss limit
    // Position Size = Capital * (Risk % / 50) * (Stoploss Limit % / 50)
    // Add small decimal adjustment based on planned prices
    const basePositionSize = capital * (riskPercent / 50) * (stoplossLimit / 50);
    const priceAdjustment = entryPrice > 0 && priceDiff > 0 ? (priceDiff / entryPrice) * 0.1 : 0;
    const positionSize = basePositionSize + (basePositionSize * priceAdjustment);

    // Calculate contract size (position size / entry price)
    const contractSize = entryPrice > 0 ? positionSize / entryPrice : 0;

    // Calculate risk percentage based on position
    let riskPercentage = 0;
    let rewardPercentage = 0;

    if (position === 'long') {
      // For long: risk if price goes down to cutloss
      const priceDiffRisk = cutlossPrice - entryPrice;
      riskPercentage = entryPrice > 0 ? (priceDiffRisk / entryPrice) * 100 * leverage : 0;

      // Reward if price goes up to target
      const priceDiffReward = targetPrice - entryPrice;
      rewardPercentage = entryPrice > 0 ? (priceDiffReward / entryPrice) * 100 * leverage : 0;
    } else {
      // For short: risk if price goes up to cutloss
      const priceDiffRisk = cutlossPrice - entryPrice;
      riskPercentage = entryPrice > 0 ? (priceDiffRisk / entryPrice) * 100 * leverage : 0;

      // Reward if price goes down to target
      const priceDiffReward = entryPrice - targetPrice;
      rewardPercentage = entryPrice > 0 ? (priceDiffReward / entryPrice) * 100 * leverage : 0;
    }

    setResults({
      leverage: leverage,
      riskPercentage: riskPercentage,
      rewardPercentage: rewardPercentage,
      positionSize: positionSize,
      contractSize: contractSize,
    });
  };

  const handleChange = (field: keyof CalculatorState, value: string | number | 'long' | 'short') => {
    setValues(prev => ({
      ...prev,
      [field]: field === 'position' ? value : (typeof value === 'number' ? value : (value === '' ? 0 : parseFloat(value as string) || 0))
    }));
  };

  const formatNumber = (num: number, decimals: number = 2): string => {
    return num.toFixed(decimals);
  };

  const formatCurrency = (num: number): string => {
    return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #ffffff 0%, #dcfce7 25%, #f3f4f6 50%, #fee2e2 75%, #f9fafb 100%)', padding: '20px 0' }}>
      <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '700', color: '#1a1a2e', marginBottom: '0.5rem', textAlign: 'center' }}>
          Futures Leverage Calculator
        </h1>
        <p style={{ fontSize: '0.9rem', color: '#666', textAlign: 'center', marginBottom: '1.5rem' }}>
          Calculate your leverage, position size, and risk/reward ratios for futures trading
        </p>
        
        <div style={{ display: 'flex', justifyContent: 'center', flex: 1 }}>
          <div className={styles.frame} role="region" aria-label="Leverage calculator">
          <div className={styles.colLeft}>
            <label className={styles.label}>Stoploss limit</label>
            <div className={styles.inputWithSymbol}>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                className={styles.valueGreen}
                value={values.stoplossLimit || ''}
                onChange={(e) => handleChange('stoplossLimit', e.target.value)}
              />
              <span className={styles.symbol}>%</span>
            </div>

            <label className={styles.label}>Capital/Funds</label>
            <div className={styles.inputWithSymbol}>
              <span className={styles.symbolPrefix}>$</span>
              <input
                type="number"
                className={styles.valueGreen}
                value={values.capital || ''}
                onChange={(e) => handleChange('capital', e.target.value)}
              />
            </div>

            <label className={styles.label}>Risk % Per Trade</label>
            <div className={styles.inputWithSymbol}>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                className={styles.valueGreen}
                value={values.riskPercent || ''}
                onChange={(e) => handleChange('riskPercent', e.target.value)}
              />
              <span className={styles.symbol}>%</span>
            </div>

            <label className={styles.label}>Position Size $</label>
            <input
              type="text"
              className={styles.valueGreen}
              value={formatCurrency(results.positionSize)}
              readOnly
            />
          </div>

          <div className={styles.divider} />

          <div className={styles.colRight}>
            <div className={styles.toggleRow}>
              <span>Long</span>
              <div
                className={`${styles.checkbox} ${values.position === 'long' ? styles.checkedLong : ''}`}
                onClick={() => handleChange('position', 'long')}
              />
            </div>
            <div className={styles.toggleRow}>
              <span>Short</span>
              <div
                className={`${styles.checkbox} ${values.position === 'short' ? styles.checkedShort : ''}`}
                onClick={() => handleChange('position', 'short')}
              />
            </div>

            <div className={styles.inputRow}>
              <span>Leverage</span>
              <div className={styles.inputBox}>{formatNumber(results.leverage, 2)}x</div>
            </div>

            <div className={styles.inputRow}>
              <span>Planned ENTRY price</span>
              <input
                type="number"
                step="0.01"
                className={styles.inputBox}
                value={values.entryPrice || ''}
                onChange={(e) => handleChange('entryPrice', e.target.value)}
              />
            </div>
            <div className={styles.inputRow}>
              <span>Planned TARGET price</span>
              <input
                type="number"
                step="0.01"
                className={styles.inputBox}
                value={values.targetPrice || ''}
                onChange={(e) => handleChange('targetPrice', e.target.value)}
              />
            </div>
            <div className={styles.inputRow}>
              <span>Planned CUTLOSS price</span>
              <input
                type="number"
                step="0.01"
                className={styles.inputBox}
                value={values.cutlossPrice || ''}
                onChange={(e) => handleChange('cutlossPrice', e.target.value)}
              />
            </div>

            <div className={styles.inputRow}>
              <span>Risk Percentage</span>
              <div className={styles.inputBox}>{formatNumber(results.riskPercentage, 2)}%</div>
            </div>
            <div className={styles.inputRow}>
              <span>Reward Percentage</span>
              <div className={styles.inputBox}>{formatNumber(results.rewardPercentage, 2)}%</div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default LeverageCalculator;
