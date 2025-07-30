import React from 'react';
import Countdown from 'react-countdown';
import PixelTransition from './PixelTransition.jsx';

const renderer = ({ days, hours, minutes, seconds, completed, props }) => { // Tambahkan 'props'
  if (completed) {
    // Panggil fungsi onComplete saat selesai
    props.onComplete();
    return null; // Kosongkan, karena App.jsx akan mengambil alih
  }

  const pixelColor = "#FF69B4";

  const renderContent = (value, label) => (
    <>
      <span className="time-value">{value}</span>
      <p className="time-label">{label}</p>
    </>
  );

  const renderLetter = (letter) => (
    <span className="hidden-letter">{letter}</span>
  );

  return (
    <div className="countdown-container">
      <PixelTransition className="time-box" pixelColor={pixelColor} firstContent={renderContent(days, 'Hari')} secondContent={renderLetter('N')} />
      <PixelTransition className="time-box" pixelColor={pixelColor} firstContent={renderContent(hours, 'Jam')} secondContent={renderLetter('I')} />
      <PixelTransition className="time-box" pixelColor={pixelColor} firstContent={renderContent(minutes, 'Menit')} secondContent={renderLetter('S')} />
      <PixelTransition className="time-box" pixelColor={pixelColor} firstContent={renderContent(seconds, 'Detik')} secondContent={renderLetter('A')} />
    </div>
  );
};

// Terima prop onComplete dan teruskan ke renderer
const CountdownTimer = ({ targetDate, onComplete }) => {
  return <Countdown date={targetDate} renderer={renderer} onComplete={onComplete} />;
};

export default CountdownTimer;