import React, { useState, useEffect } from "react";
import styles from "./styles/News.module.css";

interface EconomicEvent {
  country: string;
  name: string;
  actual: number | null;
  estimate: number | null;
  previous: number | null;
  date: string;
  time: string;
  impact: string;
  currency: string;
}

// Mock economic calendar data as fallback
const mockEconomicEvents: EconomicEvent[] = [
  {
    country: "US",
    name: "Consumer Price Index (CPI) m/m",
    actual: null,
    estimate: 0.3,
    previous: 0.4,
    date: "2026-07-18",
    time: "08:30",
    impact: "high",
    currency: "USD"
  },
  {
    country: "US",
    name: "Core CPI m/m",
    actual: null,
    estimate: 0.3,
    previous: 0.3,
    date: "2026-07-18",
    time: "08:30",
    impact: "high",
    currency: "USD"
  },
  {
    country: "US",
    name: "Building Permits m/m",
    actual: null,
    estimate: 1.5,
    previous: 3.0,
    date: "2026-07-18",
    time: "08:30",
    impact: "medium",
    currency: "USD"
  },
  {
    country: "US",
    name: "Housing Starts m/m",
    actual: null,
    estimate: 2.0,
    previous: -5.5,
    date: "2026-07-18",
    time: "08:30",
    impact: "medium",
    currency: "USD"
  },
  {
    country: "US",
    name: "Initial Jobless Claims",
    actual: null,
    estimate: 235,
    previous: 233,
    date: "2026-07-18",
    time: "08:30",
    impact: "medium",
    currency: "USD"
  },
  {
    country: "EU",
    name: "ECB Monetary Policy Meeting",
    actual: null,
    estimate: null,
    previous: null,
    date: "2026-07-17",
    time: "07:15",
    impact: "high",
    currency: "EUR"
  },
  {
    country: "US",
    name: "Retail Sales m/m",
    actual: null,
    estimate: 0.2,
    previous: 0.0,
    date: "2026-07-16",
    time: "08:30",
    impact: "high",
    currency: "USD"
  },
  {
    country: "US",
    name: "Core Retail Sales m/m",
    actual: null,
    estimate: 0.3,
    previous: 0.4,
    date: "2026-07-16",
    time: "08:30",
    impact: "medium",
    currency: "USD"
  },
  {
    country: "US",
    name: "Import Price Index m/m",
    actual: null,
    estimate: 0.2,
    previous: -0.4,
    date: "2026-07-16",
    time: "08:30",
    impact: "low",
    currency: "USD"
  },
  {
    country: "JP",
    name: "Trade Balance",
    actual: null,
    estimate: -0.5,
    previous: -0.6,
    date: "2026-07-17",
    time: "23:50",
    impact: "medium",
    currency: "JPY"
  },
  {
    country: "UK",
    name: "GDP m/m",
    actual: null,
    estimate: 0.2,
    previous: 0.1,
    date: "2026-07-16",
    time: "02:00",
    impact: "high",
    currency: "GBP"
  },
  {
    country: "AU",
    name: "Employment Change",
    actual: null,
    estimate: 20,
    previous: 38,
    date: "2026-07-18",
    time: "01:30",
    impact: "high",
    currency: "AUD"
  },
  {
    country: "AU",
    name: "Unemployment Rate",
    actual: null,
    estimate: 4.0,
    previous: 4.0,
    date: "2026-07-18",
    time: "01:30",
    impact: "high",
    currency: "AUD"
  },
  {
    country: "CA",
    name: "CPI m/m",
    actual: null,
    estimate: 0.2,
    previous: 0.3,
    date: "2026-07-17",
    time: "08:30",
    impact: "high",
    currency: "CAD"
  },
  {
    country: "CN",
    name: "GDP q/q",
    actual: null,
    estimate: 1.0,
    previous: 1.2,
    date: "2026-07-16",
    time: "02:00",
    impact: "high",
    currency: "CNY"
  }
];

const News: React.FC = () => {
  const [events, setEvents] = useState<EconomicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchEconomicCalendar = async () => {
      try {
        // Using EconPulse API via RapidAPI
        const apiKey = import.meta.env.VITE_RAPIDAPI_KEY;
        
        if (!apiKey || apiKey === 'your_rapidapi_key_here') {
          console.log('Using fallback data - no valid RapidAPI key');
          setErrorMessage('No valid API key configured. Please add your RapidAPI key to .env.local');
          throw new Error('NO_API_KEY');
        }
        
        // Get current date and date 7 days from now
        const today = new Date();
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);
        
        const startDate = today.toISOString().split('T')[0];
        const endDate = nextWeek.toISOString().split('T')[0];
        
        const response = await fetch(
          `https://multilingual-economic-calendar-api-by-truedata.p.rapidapi.com/economic-events/filter?date_from=${startDate}&date_to=${endDate}&lang=en`,
          {
            headers: {
              'x-rapidapi-host': 'multilingual-economic-calendar-api-by-truedata.p.rapidapi.com',
              'x-rapidapi-key': apiKey
            }
          }
        );
        
        if (!response.ok) {
          if (response.status === 401) {
            setErrorMessage('API authentication failed. Please check your RapidAPI key.');
            throw new Error('API_AUTH_FAILED');
          } else if (response.status === 403) {
            setErrorMessage('API access forbidden. You may need to subscribe to the API on RapidAPI.');
            throw new Error('API_FORBIDDEN');
          } else if (response.status === 429) {
            setErrorMessage('API rate limit exceeded. Please wait a moment and try again.');
            throw new Error('API_RATE_LIMIT');
          }
          throw new Error(`API_ERROR_${response.status}`);
        }
        
        const data = await response.json();
        
        if (data && Array.isArray(data)) {
          // Map EconPulse response to our interface
          const mappedEvents: EconomicEvent[] = data.map((event: any) => ({
            country: event.country_code || event.country || 'US',
            name: event.event_name || event.name || 'Economic Event',
            actual: event.actual !== null && event.actual !== undefined ? parseFloat(event.actual) : null,
            estimate: event.forecast !== null && event.forecast !== undefined ? parseFloat(event.forecast) : null,
            previous: event.previous !== null && event.previous !== undefined ? parseFloat(event.previous) : null,
            date: event.date || new Date().toISOString().split('T')[0],
            time: event.time || '00:00',
            impact: event.importance || 'medium',
            currency: event.currency || 'USD'
          }));
          
          // Sort events by date and time
          const sortedEvents = mappedEvents.sort((a: EconomicEvent, b: EconomicEvent) => {
            const dateA = new Date(`${a.date} ${a.time || '00:00'}`);
            const dateB = new Date(`${b.date} ${b.time || '00:00'}`);
            return dateA.getTime() - dateB.getTime();
          });
          
          setEvents(sortedEvents);
          setLoading(false);
        } else {
          throw new Error('NO_DATA');
        }
      } catch (err) {
        console.error('Error fetching economic calendar, using fallback data:', err);
        
        // Use mock data as fallback
        const sortedEvents = mockEconomicEvents.sort((a: EconomicEvent, b: EconomicEvent) => {
          const dateA = new Date(`${a.date} ${a.time || '00:00'}`);
          const dateB = new Date(`${b.date} ${b.time || '00:00'}`);
          return dateA.getTime() - dateB.getTime();
        });
        
        setEvents(sortedEvents);
        setUsingFallback(true);
        setLoading(false);
      }
    };

    fetchEconomicCalendar();
  }, []);

  const getImpactColor = (impact: string) => {
    switch (impact?.toLowerCase()) {
      case 'high':
        return styles.highImpact;
      case 'medium':
        return styles.mediumImpact;
      case 'low':
        return styles.lowImpact;
      default:
        return styles.unknownImpact;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr) return 'TBA';
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  const formatNumber = (num: number | null) => {
    if (num === null) return 'N/A';
    return num.toFixed(2);
  };

  if (loading) {
    return (
      <div className={styles.news}>
        <div className="container">
          <h1 className={styles.title}>Economic Calendar</h1>
          <div className={styles.loading}>Loading economic events...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.news}>
      <div className="container">
        <h1 className={styles.title}>Economic Calendar</h1>
        <p className={styles.subtitle}>
          Stay informed about upcoming economic events that impact financial markets
        </p>

        <div className={styles.legend}>
          <span className={styles.legendItem}>
            <span className={`${styles.impactDot} ${styles.highImpact}`}></span>
            High Impact
          </span>
          <span className={styles.legendItem}>
            <span className={`${styles.impactDot} ${styles.mediumImpact}`}></span>
            Medium Impact
          </span>
          <span className={styles.legendItem}>
            <span className={`${styles.impactDot} ${styles.lowImpact}`}></span>
            Low Impact
          </span>
        </div>

        {usingFallback && (
          <div className={styles.fallbackNotice}>
            <p>
              <strong>Note:</strong> Currently displaying sample data. 
              {errorMessage && <span> Error: {errorMessage}</span>}
              <br /><br />
              To get real-time data:
              <br />
              1. Go to <a href="https://rapidapi.com/siavashmoh/api/multilingual-economic-calendar-api-by-truedata" target="_blank" rel="noopener noreferrer">RapidAPI</a> and subscribe to the Basic plan (Free)
              <br />
              2. Copy your API key
              <br />
              3. Add it to <code>.env.local</code> file: <code>VITE_RAPIDAPI_KEY=your_key</code>
              <br />
              4. Restart the dev server
            </p>
          </div>
        )}

        {events.length === 0 ? (
          <div className={styles.noEvents}>
            No economic events scheduled for the next 7 days.
          </div>
        ) : (
          <div className={styles.eventsList}>
            {events.map((event, index) => (
              <div key={index} className={styles.eventCard}>
                <div className={styles.eventHeader}>
                  <span className={`${styles.impactBadge} ${getImpactColor(event.impact)}`}>
                    {event.impact || 'Low'}
                  </span>
                  <span className={styles.country}>{event.country}</span>
                  <span className={styles.currency}>{event.currency}</span>
                </div>
                
                <h3 className={styles.eventName}>{event.name}</h3>
                
                <div className={styles.eventTime}>
                  <span className={styles.date}>{formatDate(event.date)}</span>
                  <span className={styles.time}>{formatTime(event.time)}</span>
                </div>
                
                <div className={styles.eventData}>
                  <div className={styles.dataPoint}>
                    <span className={styles.dataLabel}>Actual</span>
                    <span className={styles.dataValue}>{formatNumber(event.actual)}</span>
                  </div>
                  <div className={styles.dataPoint}>
                    <span className={styles.dataLabel}>Forecast</span>
                    <span className={styles.dataValue}>{formatNumber(event.estimate)}</span>
                  </div>
                  <div className={styles.dataPoint}>
                    <span className={styles.dataLabel}>Previous</span>
                    <span className={styles.dataValue}>{formatNumber(event.previous)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className={styles.note}>
          <p>
            <strong>Note:</strong> This data is provided by Finnhub API. For the most accurate and up-to-date 
            information, please verify with official sources. High-impact events like CPI, NFP, and interest 
            rate decisions can cause significant market volatility.
          </p>
        </div>
      </div>
    </div>
  );
};

export default News;
