import React from 'react';
import Countdown from 'react-countdown';

const renderer = ({ days, hours, minutes, seconds, completed }) => {
  if (completed) {
    return <h1 className="main-title">SELAMAT ULANG TAHUN! 🎉</h1>;
  } else {
    return (
      <div className="countdown-container">
        <div className="time-box">
          <span className="time-value">{days}</span>
          <p className="time-label">Hari</p>
        </div>
        <div className="time-box">
          <span className="time-value">{hours}</span>
          <p className="time-label">Jam</p>
        </div>
        <div className="time-box">
          <span className="time-value">{minutes}</span>
          <p className="time-label">Menit</p>
        </div>
        <div className="time-box">
          <span className="time-value">{seconds}</span>
          <p className="time-label">Detik</p>
        </div>
      </div>
    );
  }
};

const CountdownTimer = ({ targetDate }) => {
  return <Countdown date={targetDate} renderer={renderer} />;
};

export default CountdownTimer;