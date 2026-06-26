import React, { useState, useEffect } from "react";
import styles from "./styles/CalculatorMock.module.css";

interface ForexCalculatorState {
  accountBalance: number;
  riskPercentage: number;
  stopLossPips: number;
  currencyPair: string;
  entryPrice: number;
  exitPrice: number;
  instrumentType: 'forex' | 'commodity';
  commodityType: 'gold' | 'silver' | 'oil' | 'indices';
}

const ForexCalculator: React.FC = () => {
  const [values, setValues] = useState<ForexCalculatorState>({
    accountBalance: 0,
    riskPercentage: 0,
    stopLossPips: 0,
    currencyPair: 'EUR/USD',
    entryPrice: 0,
    exitPrice: 0,
    instrumentType: 'forex',
    commodityType: 'gold',
  });

  const [results, setResults] = useState({
    lotSize: 0,
    standardLots: 0,
    miniLots: 0,
    microLots: 0,
    riskAmount: 0,
    pipValue: 0,
    pipsGainedLost: 0,
    profitLoss: 0,
  });

  // Pip values for different instruments
  const getPipValue = (pair: string): number => {
    if (pair.includes('JPY')) {
      return 0.01; // JPY pairs have different pip value
    }
    if (pair.includes('XAU') || pair.includes('GOLD')) {
      return 0.1; // Gold
    }
    if (pair.includes('XAG') || pair.includes('SILVER')) {
      return 0.001; // Silver
    }
    if (pair.includes('US30') || pair.includes('DOW')) {
      return 0.1; // Dow Jones
    }
    if (pair.includes('NAS100') || pair.includes('NASDAQ')) {
      return 0.1; // NASDAQ
    }
    if (pair.includes('US500') || pair.includes('S&P')) {
      return 0.25; // S&P 500
    }
    return 0.0001; // Standard forex pairs
  };

  const getContractSize = (instrumentType: string, commodityType?: string): number => {
    if (instrumentType === 'commodity') {
      switch (commodityType) {
        case 'gold': return 100; // 100 oz per lot
        case 'silver': return 5000; // 5000 oz per lot
        case 'oil': return 1000; // 1000 barrels per lot
        case 'indices': return 1; // 1 contract per lot
        default: return 100000;
      }
    }
    return 100000; // Standard lot size for forex
  };

  useEffect(() => {
    calculateResults();
  }, [values]);

  const calculateResults = () => {
    const { accountBalance, riskPercentage, stopLossPips, currencyPair, entryPrice, exitPrice, instrumentType, commodityType } = values;

    // Calculate risk amount
    const riskAmount = accountBalance * (riskPercentage / 100);

    // Get pip value based on instrument
    const pipValue = getPipValue(currencyPair);

    // Calculate lot size based on risk
    // Lot Size = Risk Amount / (Stop Loss in Pips × Pip Value × Contract Size)
    const contractSize = getContractSize(instrumentType, commodityType);
    let lotSize = 0;
    
    if (stopLossPips > 0 && pipValue > 0) {
      lotSize = riskAmount / (stopLossPips * pipValue * contractSize);
    }

    // Calculate standard, mini, and micro lots
    const standardLots = Math.floor(lotSize);
    const remainingAfterStandard = lotSize - standardLots;
    const miniLots = Math.floor(remainingAfterStandard * 10);
    const microLots = Math.round((remainingAfterStandard * 10 - miniLots) * 10);

    // Calculate pips gained/lost
    let pipsGainedLost = 0;
    if (entryPrice > 0 && exitPrice > 0) {
      if (currencyPair.includes('JPY')) {
        pipsGainedLost = (exitPrice - entryPrice) / 0.01;
      } else if (currencyPair.includes('XAU') || currencyPair.includes('GOLD')) {
        pipsGainedLost = (exitPrice - entryPrice) / 0.1;
      } else if (currencyPair.includes('XAG') || currencyPair.includes('SILVER')) {
        pipsGainedLost = (exitPrice - entryPrice) / 0.001;
      } else if (currencyPair.includes('US30') || currencyPair.includes('NAS100')) {
        pipsGainedLost = (exitPrice - entryPrice) / 0.1;
      } else if (currencyPair.includes('US500')) {
        pipsGainedLost = (exitPrice - entryPrice) / 0.25;
      } else {
        pipsGainedLost = (exitPrice - entryPrice) / 0.0001;
      }
    }

    // Calculate profit/loss
    const profitLoss = pipsGainedLost * pipValue * contractSize * lotSize;

    setResults({
      lotSize,
      standardLots,
      miniLots,
      microLots,
      riskAmount,
      pipValue,
      pipsGainedLost,
      profitLoss,
    });
  };

  const handleChange = (field: keyof ForexCalculatorState, value: string | number) => {
    setValues(prev => ({
      ...prev,
      [field]: typeof value === 'number' ? value : (value === '' ? 0 : parseFloat(value as string) || 0)
    }));
  };

  const formatNumber = (num: number, decimals: number = 2): string => {
    return num.toFixed(decimals);
  };

  const formatCurrency = (num: number): string => {
    return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const forexPairs = [
    'EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD', 
    'USD/CAD', 'NZD/USD', 'EUR/GBP', 'EUR/JPY', 'GBP/JPY'
  ];

  const commodityPairs = {
    gold: ['XAU/USD', 'GOLD'],
    silver: ['XAG/USD', 'SILVER'],
    oil: ['WTI', 'BRENT'],
    indices: ['US30', 'NAS100', 'US500']
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #ffffff 0%, #dcfce7 25%, #f3f4f6 50%, #fee2e2 75%, #f9fafb 100%)', padding: '20px 0' }}>
      <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '700', color: '#1a1a2e', marginBottom: '0.5rem', textAlign: 'center' }}>
          Forex & Commodities Calculator
        </h1>
        <p style={{ fontSize: '0.9rem', color: '#666', textAlign: 'center', marginBottom: '1.5rem' }}>
          Calculate lot sizes, pip values, and potential profit/loss
        </p>

        <div style={{ maxWidth: '1000px', margin: '0 auto 2rem', width: '100%' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0d1a26', marginBottom: '1.5rem', marginTop: 0, textAlign: 'center' }}>Understanding Forex & Indices Trading</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            <div style={{ padding: '1.5rem', background: '#f9fafb', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'black', marginBottom: '0.75rem', marginTop: 0 }}>Pips (Percentage in Point)</h4>
              <p style={{ fontSize: '0.95rem', color: '#333', lineHeight: '1.6', marginBottom: '0' }}>A pip is the standard unit for measuring price movements in forex. For most currency pairs (EUR/USD, GBP/USD), a pip equals 0.0001 (4th decimal place). For JPY pairs (USD/JPY, EUR/JPY), a pip equals 0.01 (2nd decimal place). Commodities like Gold (XAU/USD) use 0.10 increments, while indices vary by exchange.</p>
            </div>
            <div style={{ padding: '1.5rem', background: '#f9fafb', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'black', marginBottom: '0.75rem', marginTop: 0 }}>Lot Size</h4>
              <p style={{ fontSize: '0.95rem', color: '#333', lineHeight: '1.6', marginBottom: '0' }}>Determines your trading volume. Standard Lot = 100,000 units, Mini Lot = 10,000 units, Micro Lot = 1,000 units. Larger lots mean higher profit potential but also greater risk. Always calculate your position size based on your risk tolerance.</p>
            </div>
            <div style={{ padding: '1.5rem', background: '#f9fafb', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'black', marginBottom: '0.75rem', marginTop: 0 }}>Commodities & Indices</h4>
              <p style={{ fontSize: '0.95rem', color: '#333', lineHeight: '1.6', marginBottom: '0' }}>These instruments have different contract sizes and pip values. Gold (XAU) typically has a contract size of 100 oz per lot, Silver (XAG) 5,000 oz, and Oil 1,000 barrels. Indices trade in points with varying values. Always check your broker's specifications.</p>
            </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'center', flex: 1 }}>
          <div className={styles.frame} role="region" aria-label="Forex calculator">
            <div className={styles.colLeft}>
              <label className={styles.label}>Account Balance</label>
              <div className={styles.inputWithSymbol}>
                <span className={styles.symbolPrefix}>$</span>
                <input
                  type="number"
                  className={styles.valueGreen}
                  value={values.accountBalance || ''}
                  onChange={(e) => handleChange('accountBalance', e.target.value)}
                />
              </div>

              <label className={styles.label}>Risk %</label>
              <div className={styles.inputWithSymbol}>
                <input
                  type="number"
                  step="0.1"
                  className={styles.valueGreen}
                  value={values.riskPercentage || ''}
                  onChange={(e) => handleChange('riskPercentage', e.target.value)}
                />
                <span className={styles.symbol}>%</span>
              </div>

              <label className={styles.label}>Stop Loss (Pips)</label>
              <input
                type="number"
                className={styles.valueGreen}
                value={values.stopLossPips || ''}
                onChange={(e) => handleChange('stopLossPips', e.target.value)}
              />

              <label className={styles.label}>Instrument Type</label>
              <select
                className={styles.valueGreen}
                value={values.instrumentType}
                onChange={(e) => handleChange('instrumentType', e.target.value as 'forex' | 'commodity')}
              >
                <option value="forex">Forex</option>
                <option value="commodity">Commodities & Indices</option>
              </select>

              {values.instrumentType === 'forex' ? (
                <>
                  <label className={styles.label}>Currency Pair</label>
                  <select
                    className={styles.valueGreen}
                    value={values.currencyPair}
                    onChange={(e) => handleChange('currencyPair', e.target.value)}
                  >
                    {forexPairs.map(pair => (
                      <option key={pair} value={pair}>{pair}</option>
                    ))}
                  </select>
                </>
              ) : (
                <>
                  <label className={styles.label}>Commodity Type</label>
                  <select
                    className={styles.valueGreen}
                    value={values.commodityType}
                    onChange={(e) => handleChange('commodityType', e.target.value as any)}
                  >
                    <option value="gold">Gold (XAU/USD)</option>
                    <option value="silver">Silver (XAG/USD)</option>
                    <option value="oil">Oil (WTI/BRENT)</option>
                    <option value="indices">Indices</option>
                  </select>
                  <label className={styles.label}>Instrument</label>
                  <select
                    className={styles.valueGreen}
                    value={values.currencyPair}
                    onChange={(e) => handleChange('currencyPair', e.target.value)}
                  >
                    {commodityPairs[values.commodityType as keyof typeof commodityPairs]?.map(pair => (
                      <option key={pair} value={pair}>{pair}</option>
                    ))}
                  </select>
                </>
              )}

              <label className={styles.label}>Lot Size</label>
              <input
                type="text"
                className={styles.valueGreen}
                value={formatNumber(results.lotSize, 3)}
                readOnly
              />
            </div>

            <div className={styles.divider} />

            <div className={styles.colRight}>
              <div className={styles.inputRow}>
                <span>Entry Price</span>
                <input
                  type="number"
                  step="0.00001"
                  className={styles.inputBox}
                  value={values.entryPrice || ''}
                  onChange={(e) => handleChange('entryPrice', e.target.value)}
                />
              </div>

              <div className={styles.inputRow}>
                <span>Exit Price</span>
                <input
                  type="number"
                  step="0.00001"
                  className={styles.inputBox}
                  value={values.exitPrice || ''}
                  onChange={(e) => handleChange('exitPrice', e.target.value)}
                />
              </div>

              <div className={styles.inputRow}>
                <span>Risk Amount</span>
                <div className={styles.inputBox}>{formatCurrency(results.riskAmount)}</div>
              </div>

              <div className={styles.inputRow}>
                <span>Pip Value</span>
                <div className={styles.inputBox}>{formatCurrency(results.pipValue)}</div>
              </div>

              <div className={styles.inputRow}>
                <span>Pips Gained/Lost</span>
                <div className={`${styles.inputBox} ${results.pipsGainedLost >= 0 ? styles.profit : styles.loss}`}>
                  {results.pipsGainedLost > 0 ? '+' : ''}{formatNumber(results.pipsGainedLost, 1)}
                </div>
              </div>

              <div className={styles.inputRow}>
                <span>Profit/Loss</span>
                <div className={`${styles.inputBox} ${results.profitLoss >= 0 ? styles.profit : styles.loss}`}>
                  {results.profitLoss > 0 ? '+' : ''}{formatCurrency(results.profitLoss)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForexCalculator;
