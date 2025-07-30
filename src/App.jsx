import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import CountdownTimer from './Countdown.jsx';
import TrueFocus from './TrueFocus.jsx';
import RotatingText from './RotatingText.jsx';
import StickerPeel from './StickerPeel.jsx';
import Ballpit from './Ballpit.jsx';
import BirthdaySurprise from './BirthdaySurprise.jsx';
import StarryNight from './StarryNight.jsx';
import './App.css';

import AnnisaSticker from './assets/annisa.png';
import NurulSticker from './assets/nurul.png';
import IslamiSticker from './assets/islami.png';

const magicalWords = [ "magical", "special", "awesome", "wonderful", "dreamy", "sparkling", "unforgettable", "fabulous", "perfect", "sweetest", "brightest", "happiest", "cutest", "loveliest", "craziest" ];
const ballpitColors = [ 0xfbc2eb, 0xa6c1ee, 0xee7752, 0xe73c7e ];

// --- FUNGSI BARU UNTUK MENGHITUNG ULANG TAHUN BERIKUTNYA ---
const getNextBirthday = () => {
  const now = new Date();
  const currentYear = now.getFullYear();
  
  // Ulang tahunnya adalah 13 September. Bulan di JavaScript dimulai dari 0 (Januari=0, Februari=1, ... September=8)
  const birthdayMonth = 8; 
  const birthdayDay = 13;

  // Buat tanggal ulang tahun untuk tahun ini
  let nextBirthday = new Date(currentYear, birthdayMonth, birthdayDay);

  // Ini adalah bagian paling penting.
  // Jika tanggal hari ini sudah melewati ulang tahun di tahun ini...
  if (now > nextBirthday) {
    // ...maka kita atur targetnya ke tahun depan.
    nextBirthday.setFullYear(currentYear + 1);
  }

  return nextBirthday;
};

function App() {
  const [isBirthdayTime, setIsBirthdayTime] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [showFinale, setShowFinale] = useState(false);

  // Gunakan fungsi baru untuk mendapatkan tanggal yang dinamis
  const targetDate = getNextBirthday();

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (showFinale) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }
  }, [showFinale]);

  // const [isBirthdayTime, setIsBirthdayTime] = useState(true);

  const handleCountdownComplete = () => {
    setIsBirthdayTime(true);
  };
  
  const handleFinaleStart = () => {
    setShowFinale(true);
  };

  return (
    <div className={`app-container ${showFinale ? 'finale-active' : ''}`}>
      {showFinale && <StarryNight />}
      {!showFinale && <Ballpit className="ballpit-canvas" count={20} colors={ballpitColors} gravity={0.1} followCursor={false} />}
      {isBirthdayTime && !showFinale && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={500}
          tweenDuration={12000}
          gravity={0.1}
          style={{ zIndex: 1 }}
          confettiSource={{ x: 0, y: 0, w: windowSize.width, h: 0 }}
        />
      )}

      <AnimatePresence mode="wait">
        {!isBirthdayTime ? (
          <motion.div key="countdown" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="content-wrapper">
            <div className="stickers-container" style={{ position: 'absolute', top: '-100px', left: '-280px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '10px', zIndex: 10 }}>
              <StickerPeel imageSrc={AnnisaSticker} width={200} rotate={-10} initialPosition={{ x: 0, y: 0 }}/>
              <StickerPeel imageSrc={NurulSticker} width={200} rotate={10} initialPosition={{ x: 0, y: 80 }}/>
              <StickerPeel imageSrc={IslamiSticker} width={200} rotate={5} initialPosition={{ x: 0, y: 150 }}/>
            </div>
            <TrueFocus sentence="A special wish is on its way..." borderColor="#FF69B4" glowColor="rgba(255, 105, 180, 0.8)" />
            <p className="subtitle">
              <span>Counting down to your&nbsp;</span>
              <RotatingText texts={magicalWords} />
              <span>&nbsp;day ✨</span>
            </p>
            <CountdownTimer targetDate={targetDate} onComplete={handleCountdownComplete} />
          </motion.div>
        ) : (
          <BirthdaySurprise key="surprise" onFinaleStart={handleFinaleStart} />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;