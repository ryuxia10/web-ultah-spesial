import React from 'react';
import Countdown from 'react-countdown';
import PixelTransition from './PixelTransition.jsx';

const renderer = ({ days, hours, minutes, seconds, completed }) => {
  const pixelColor = "#FF69B4"; // Warna pink untuk efek pixel

  const renderContent = (value, label) => (
    <>
      <span className="time-value">{value}</span>
      <p className="time-label">{label}</p>
    </>
  );

  const renderLetter = (letter) => (
    <span className="hidden-letter">{letter}</span>
  );

  if (completed) {
    return <h1 className="main-title">SELAMAT ULANG TAHUN! 🎉</h1>;
  } else {
    return (
      <div className="countdown-container">
        <PixelTransition
          className="time-box"
          pixelColor={pixelColor}
          firstContent={renderContent(days, 'Hari')}
          secondContent={renderLetter('N')}
        />
        <PixelTransition
          className="time-box"
          pixelColor={pixelColor}
          firstContent={renderContent(hours, 'Jam')}
          secondContent={renderLetter('I')}
        />
        <PixelTransition
          className="time-box"
          pixelColor={pixelColor}
          firstContent={renderContent(minutes, 'Menit')}
          secondContent={renderLetter('S')}
        />
        <PixelTransition
          className="time-box"
          pixelColor={pixelColor}
          firstContent={renderContent(seconds, 'Detik')}
          secondContent={renderLetter('A')}
        />
      </div>
    );
  }
};

const CountdownTimer = ({ targetDate }) => {
  return <Countdown date={targetDate} renderer={renderer} />;
};

export default CountdownTimer;