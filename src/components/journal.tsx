import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
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
  const [usdToPhpRate, setUsdToPhpRate] = useState<number>(56.50);
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [chartView, setChartView] = useState<'weekly' | 'monthly'>('weekly');
  const [formData, setFormData] = useState({
    date: '',
    pair: '',
    pnlUsd: '',
    usdToPhp: ''
  });

  // Load trades from API on mount
  useEffect(() => {
    const fetchTrades = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/journal', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (data.success) {
          const formattedTrades = data.data.map((trade: any) => ({
            id: trade.id.toString(),
            date: trade.date,
            pair: trade.pair,
            pnlUsd: parseFloat(trade.pnlUsd),
            usdToPhp: parseFloat(trade.usdToPhp),
          }));
          setTrades(formattedTrades);
        } else if (data.message === 'Unauthorized') {
          window.location.href = '/login';
        }
      } catch (error) {
        console.error('Error fetching trades:', error);
      }
    };

    fetchTrades();
  }, []);

  // Fetch real-time USD/PHP exchange rate
  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await response.json();
        if (data.rates && data.rates.PHP) {
          setUsdToPhpRate(data.rates.PHP);
          setFormData(prev => ({ ...prev, usdToPhp: data.rates.PHP.toString() }));
        }
      } catch (error) {
        console.error('Failed to fetch exchange rate, using default:', error);
      }
    };

    fetchExchangeRate();
  }, []);

  // Save trades to localStorage whenever they change (for backup)
  useEffect(() => {
    localStorage.setItem('tradingJournal', JSON.stringify(trades));
  }, [trades]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      
      if (editingId) {
        // Update existing trade via API
        const response = await fetch(`/api/journal/${editingId}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            date: formData.date,
            pair: formData.pair,
            pnlUsd: parseFloat(formData.pnlUsd),
            usdToPhp: usdToPhpRate,
          }),
        });
        const data = await response.json();
        if (data.success) {
          setTrades(trades.map(trade => 
            trade.id === editingId 
              ? {
                  ...trade,
                  date: formData.date,
                  pair: formData.pair.toUpperCase(),
                  pnlUsd: parseFloat(formData.pnlUsd),
                  usdToPhp: usdToPhpRate
                }
              : trade
          ));
          setEditingId(null);
        } else if (data.message === 'Unauthorized') {
          window.location.href = '/login';
        }
      } else {
        // Add new trade via API
        const response = await fetch('/api/journal', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            date: formData.date,
            pair: formData.pair,
            pnlUsd: parseFloat(formData.pnlUsd),
            usdToPhp: usdToPhpRate,
          }),
        });
        const data = await response.json();
        if (data.success) {
          const newTrade: Trade = {
            id: data.data.id.toString(),
            date: formData.date || new Date().toISOString().split('T')[0],
            pair: formData.pair.toUpperCase(),
            pnlUsd: parseFloat(formData.pnlUsd),
            usdToPhp: usdToPhpRate
          };
          setTrades([newTrade, ...trades]);
        } else if (data.message === 'Unauthorized') {
          window.location.href = '/login';
        }
      }

      setFormData({
        date: '',
        pair: '',
        pnlUsd: '',
        usdToPhp: usdToPhpRate.toString()
      });
      setShowForm(false);
    } catch (error) {
      console.error('Error saving trade:', error);
    }
  };

  const deleteTrade = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/journal/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setTrades(trades.filter(trade => trade.id !== id));
      } else if (data.message === 'Unauthorized') {
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Error deleting trade:', error);
    }
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get unique months from trades
  const getAvailableMonths = () => {
    const months = new Set(trades.map(trade => {
      const date = new Date(trade.date);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }));
    return Array.from(months).sort().reverse();
  };

  // Filter trades by selected month
  const getFilteredTrades = () => {
    if (selectedMonth === 'all') return trades;
    return trades.filter(trade => {
      const date = new Date(trade.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      return monthKey === selectedMonth;
    });
  };

  const filteredTrades = getFilteredTrades();

  // Calculate stats for filtered trades
  const calculateStats = (tradeList: Trade[]) => {
    if (tradeList.length === 0) {
      return { totalTrades: 0, totalPnlUsd: 0, totalUsd: 0, totalPhp: 0, winRate: 0 };
    }

    const totalPnlUsd = tradeList.reduce((sum, t) => sum + t.pnlUsd, 0);
    const totalUsd = totalPnlUsd;
    const avgUsdToPhp = tradeList.reduce((sum, t) => sum + t.usdToPhp, 0) / tradeList.length;
    const totalPhp = totalUsd * avgUsdToPhp;
    const wins = tradeList.filter(t => t.pnlUsd > 0).length;
    const winRate = (wins / tradeList.length) * 100;

    return {
      totalTrades: tradeList.length,
      totalPnlUsd,
      totalUsd,
      totalPhp,
      winRate
    };
  };

  const stats = calculateStats(filteredTrades);

  // Prepare weekly chart data
  const getWeeklyChartData = () => {
    const weeklyData: { [key: string]: { pnl: number } } = {};
    
    filteredTrades.forEach(trade => {
      const date = new Date(trade.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = { pnl: 0 };
      }
      weeklyData[weekKey].pnl += trade.pnlUsd;
    });

    return Object.entries(weeklyData)
      .map(([date, data]) => ({
        date: formatDate(date),
        pnl: data.pnl
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  // Prepare monthly chart data
  const getMonthlyChartData = () => {
    const monthlyData: { [key: string]: { pnl: number } } = {};
    
    trades.forEach(trade => {
      const date = new Date(trade.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { pnl: 0 };
      }
      monthlyData[monthKey].pnl += trade.pnlUsd;
    });

    return Object.entries(monthlyData)
      .map(([date, data]) => ({
        date: date,
        pnl: data.pnl
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const weeklyChartData = getWeeklyChartData();
  const monthlyChartData = getMonthlyChartData();

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
            <span className={styles.statLabel}>USD/PHP Rate:</span>
            <span className={styles.statValue}>{usdToPhpRate.toFixed(4)}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Win Rate:</span>
            <span className={styles.statValue}>{stats.winRate.toFixed(1)}%</span>
          </div>
        </div>

        {/* Month Filter and Chart Controls */}
        <div className={styles.controlsBar}>
          <div className={styles.filterSection}>
            <label className={styles.filterLabel}>Filter by Month:</label>
            <select 
              className={styles.monthSelect}
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              <option value="all">All Time</option>
              {getAvailableMonths().map(month => (
                <option key={month} value={month}>
                  {new Date(month + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.chartToggle}>
            <button 
              className={`${styles.chartButton} ${chartView === 'weekly' ? styles.active : ''}`}
              onClick={() => setChartView('weekly')}
            >
              Weekly
            </button>
            <button 
              className={`${styles.chartButton} ${chartView === 'monthly' ? styles.active : ''}`}
              onClick={() => setChartView('monthly')}
            >
              Monthly
            </button>
          </div>
        </div>

        {/* Chart Section */}
        <div className={styles.chartSection}>
          <h3 className={styles.chartTitle}>
            {chartView === 'weekly' ? 'Weekly PnL' : 'Monthly PnL'}
          </h3>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height={300}>
              {chartView === 'weekly' ? (
                <LineChart data={weeklyChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="pnl" 
                    stroke="#667eea" 
                    strokeWidth={2}
                    dot={{ fill: '#667eea' }}
                  />
                </LineChart>
              ) : (
                <BarChart data={monthlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="pnl" fill="#667eea" />
                </BarChart>
              )}
            </ResponsiveContainer>
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
              {filteredTrades.length === 0 ? (
                <tr>
                  <td colSpan={5} className={styles.noTrades}>
                    {selectedMonth === 'all' 
                      ? 'No trades recorded yet. Click "Add Trade" to start tracking.'
                      : 'No trades for this month. Select a different month or add a new trade.'}
                  </td>
                </tr>
              ) : (
                filteredTrades.map((trade) => (
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
