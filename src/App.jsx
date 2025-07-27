import React from 'react';
import CountdownTimer from './Countdown.jsx';
import TrueFocus from './TrueFocus.jsx';
import RotatingText from './RotatingText.jsx';
import StickerPeel from './StickerPeel.jsx'; // 1. Impor komponen stiker
import './App.css';

// 2. Impor gambar stiker dari folder assets
import AnnisaSticker from './assets/annisa.png';
import NurulSticker from './assets/nurul.png';
import IslamiSticker from './assets/islami.png';

const magicalWords = [ "magical", "special", "awesome", "wonderful", "dreamy", "sparkling", "unforgettable", "fabulous", "perfect", "sweetest", "brightest", "happiest", "cutest", "loveliest", "craziest" ];

function App() {
  const birthdayDate = '2025-09-13T00:00:00';

  return (
    <div className="app-container">
      <div className="content-wrapper">
        <TrueFocus sentence="A special wish is on its way..." borderColor="#FF69B4" glowColor="rgba(255, 105, 180, 0.8)" />
        <p className="subtitle">
          <span>Counting down to your&nbsp;</span>
          <RotatingText texts={magicalWords} />
          <span>&nbsp;day ✨</span>
        </p>
        <CountdownTimer targetDate={birthdayDate} />
      </div>
      <div className="stickers-container">
          <StickerPeel imageSrc={AnnisaSticker} width={150} rotate={-15} />
          <StickerPeel imageSrc={NurulSticker} width={150} rotate={5} />
          <StickerPeel imageSrc={IslamiSticker} width={150} rotate={15} />
        </div>
    </div>
  );
}

export default App;