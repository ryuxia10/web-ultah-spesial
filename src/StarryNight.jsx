import React from 'react';
import './StarryNight.css';

function StarryNight() {
  const hearts = Array.from({ length: 50 }).map((_, i) => {
    const style = {
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 5}s`,
      animationDuration: `${Math.random() * 3 + 2}s`,
      fontSize: `${Math.random() * 10 + 10}px`
    };
    return <div key={i} className="heart" style={style}>💖</div>;
  });

  return (
    <div className="starry-night-container">
      {hearts}
    </div>
  );
}

export default StarryNight;