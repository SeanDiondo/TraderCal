import React, { useState, useEffect } from "react";
import styles from "./styles/Journal.module.css";

interface Trade {
  id: string;
  date: string;
  pair: string;
  pnlUsd: number;
  usdToPhp: number;
}

const Journal: React.FC = () => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [usdToPhpRate, setUsdToPhpRate] = useState<number>(56.50); // Default rate
  const [formData, setFormData] = useState({
    date: '',
    pair: '',
    pnlUsd: '',
    usdToPhp: ''
  });

  // Load trades from localStorage on mount
  useEffect(() => {
    const savedTrades = localStorage.getItem('tradingJournal');
    if (savedTrades) {
      setTrades(JSON.parse(savedTrades));
    }
  }, []);

  // Fetch real-time USD/PHP exchange rate
  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        // Using free exchange rate API
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await response.json();
        if (data.rates && data.rates.PHP) {
          setUsdToPhpRate(data.rates.PHP);
          setFormData(prev => ({ ...prev, usdToPhp: data.rates.PHP.toString() }));
        }
      } catch (error) {
        console.error('Failed to fetch exchange rate, using default:', error);
        // Keep default rate if API fails
      }
    };

    fetchExchangeRate();
  }, []);

  // Save trades to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('tradingJournal', JSON.stringify(trades));
  }, [trades]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      // Update existing trade
      setTrades(trades.map(trade => 
        trade.id === editingId 
          ? {
              ...trade,
              date: formData.date,
              pair: formData.pair.toUpperCase(),
              pnlUsd: parseFloat(formData.pnlUsd),
              usdToPhp: parseFloat(formData.usdToPhp)
            }
          : trade
      ));
      setEditingId(null);
    } else {
      // Add new trade
      const newTrade: Trade = {
        id: Date.now().toString(),
        date: formData.date || new Date().toISOString().split('T')[0],
        pair: formData.pair.toUpperCase(),
        pnlUsd: parseFloat(formData.pnlUsd),
        usdToPhp: parseFloat(formData.usdToPhp)
      };

      setTrades([newTrade, ...trades]);
    }

    setFormData({
      date: '',
      pair: '',
      pnlUsd: '',
      usdToPhp: usdToPhpRate.toString()
    });
    setShowForm(false);
  };

  const deleteTrade = (id: string) => {
    setTrades(trades.filter(trade => trade.id !== id));
  };

  const editTrade = (trade: Trade) => {
    setFormData({
      date: trade.date,
      pair: trade.pair,
      pnlUsd: trade.pnlUsd.toString(),
      usdToPhp: trade.usdToPhp.toString()
    });
    setEditingId(trade.id);
    setShowForm(true);
  };

  const calculateStats = () => {
    if (trades.length === 0) {
      return { totalTrades: 0, totalPnlUsd: 0, totalUsd: 0, totalPhp: 0, winRate: 0 };
    }

    const totalPnlUsd = trades.reduce((sum, t) => sum + t.pnlUsd, 0);
    const totalUsd = totalPnlUsd; // Total USD is the sum of all PnL
    const avgUsdToPhp = trades.reduce((sum, t) => sum + t.usdToPhp, 0) / trades.length;
    const totalPhp = totalUsd * avgUsdToPhp;
    const wins = trades.filter(t => t.pnlUsd > 0).length;
    const winRate = (wins / trades.length) * 100;

    return {
      totalTrades: trades.length,
      totalPnlUsd,
      totalUsd,
      totalPhp,
      winRate
    };
  };

  const stats = calculateStats();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className={styles.journal}>
      <div className="container">
        <h1 className={styles.title}>Trading Journal</h1>
        <p className={styles.subtitle}>Track your trades and performance</p>

        {/* Stats Bar */}
        <div className={styles.statsBar}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Total Trades:</span>
            <span className={styles.statValue}>{stats.totalTrades}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Total P/L USD:</span>
            <span className={`${styles.statValue} ${stats.totalPnlUsd >= 0 ? styles.profit : styles.loss}`}>
              ${stats.totalPnlUsd.toFixed(2)}
            </span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Total USD:</span>
            <span className={styles.statValue}>${stats.totalUsd.toFixed(2)}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Total PHP:</span>
            <span className={styles.statValue}>₱{stats.totalPhp.toFixed(2)}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Win Rate:</span>
            <span className={styles.statValue}>{stats.winRate.toFixed(1)}%</span>
          </div>
        </div>

        {/* Add Trade Button */}
        <button 
          className={styles.addButton}
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({
              date: '',
              pair: '',
              pnlUsd: '',
              usdToPhp: usdToPhpRate.toString()
            });
          }}
        >
          {showForm ? 'Cancel' : '+ Add Trade'}
        </button>

        {/* Trade Form */}
        {showForm && (
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.formRow}>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                required
                className={styles.formInput}
              />
              <input
                type="text"
                placeholder="Pair (e.g., EURUSD)"
                value={formData.pair}
                onChange={(e) => setFormData({...formData, pair: e.target.value})}
                required
                className={styles.formInput}
              />
              <input
                type="number"
                step="0.01"
                placeholder="PnL USD"
                value={formData.pnlUsd}
                onChange={(e) => setFormData({...formData, pnlUsd: e.target.value})}
                required
                className={styles.formInput}
              />
              <input
                type="number"
                step="0.0001"
                placeholder="USD/PHP"
                value={formData.usdToPhp}
                onChange={(e) => setFormData({...formData, usdToPhp: e.target.value})}
                required
                className={styles.formInput}
              />
              <button type="submit" className={styles.submitButton}>
                {editingId ? 'Update' : 'Add'}
              </button>
            </div>
          </form>
        )}

        {/* Excel-like Table */}
        <div className={styles.tableContainer}>
          <table className={styles.spreadsheet}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Pair</th>
                <th>PnL USD</th>
                <th>USD/PHP</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {trades.length === 0 ? (
                <tr>
                  <td colSpan={5} className={styles.noTrades}>
                    No trades recorded yet. Click "Add Trade" to start tracking.
                  </td>
                </tr>
              ) : (
                trades.map((trade) => (
                  <tr key={trade.id} className={trade.pnlUsd >= 0 ? styles.profitRow : styles.lossRow}>
                    <td>{formatDate(trade.date)}</td>
                    <td className={styles.pairCell}>{trade.pair}</td>
                    <td className={trade.pnlUsd >= 0 ? styles.profit : styles.loss}>
                      ${trade.pnlUsd.toFixed(2)}
                    </td>
                    <td>{trade.usdToPhp.toFixed(4)}</td>
                    <td className={styles.actionsCell}>
                      <button 
                        className={styles.editButton}
                        onClick={() => editTrade(trade)}
                      >
                        Edit
                      </button>
                      <button 
                        className={styles.deleteButton}
                        onClick={() => deleteTrade(trade.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Journal;
