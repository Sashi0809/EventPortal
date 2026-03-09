import { useState, useEffect } from 'react';
import { getTimeUntil } from '../utils/helpers';

const CountdownTimer = ({ targetDate }) => {
  const [time, setTime] = useState(getTimeUntil(targetDate));

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(getTimeUntil(targetDate));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (time.expired) {
    return <span className="tag" style={{ background: 'var(--danger)', color: 'white', border: 'none' }}>Event Started</span>;
  }

  return (
    <div className="countdown">
      <div className="countdown-unit">
        <div className="countdown-value">{time.days}</div>
        <div className="countdown-label">Days</div>
      </div>
      <div className="countdown-unit">
        <div className="countdown-value">{time.hours}</div>
        <div className="countdown-label">Hours</div>
      </div>
      <div className="countdown-unit">
        <div className="countdown-value">{time.minutes}</div>
        <div className="countdown-label">Min</div>
      </div>
      <div className="countdown-unit">
        <div className="countdown-value">{time.seconds}</div>
        <div className="countdown-label">Sec</div>
      </div>
    </div>
  );
};

export default CountdownTimer;
