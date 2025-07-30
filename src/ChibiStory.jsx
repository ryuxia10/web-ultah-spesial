import React, { useState } from 'react';
import { InteractiveHoverButton } from './InteractiveHoverButton.jsx';
import { coolModeClickHandler } from './CoolModeEffect.js';
import './ChibiStory.css';

import chibi01 from './assets/chibi/01.png';
import chibi02 from './assets/chibi/02.png';
import chibi03 from './assets/chibi/03.png';
import chibi04 from './assets/chibi/04.png';
import chibi05 from './assets/chibi/05.png';
import chibi06 from './assets/chibi/06.png';
import chibi07 from './assets/chibi/07.png';

const storyData = [
  { id: 1, image: chibi01, text: "Setiap aku mikirin kamu, entah kenapa aku selalu senyum-senyum sendiri kayak gini." },
  { id: 2, image: chibi02, text: "Terus keinget semua hal lucu yang pernah kita bahas... yang bikin ketawa sampai mata ilang." },
  { id: 3, image: chibi03, text: "Kamu itu sumber energi dan semangat buat aku, bikin aku selalu ceria kayak gini." },
  { id: 4, image: chibi04, text: "Dan tentu aja, inget semua momen 'gila' kita yang bikin ketawa sampai sakit perut!" },
  { id: 5, image: chibi05, text: "Tapi aku juga tahu, kadang ada hari-hari yang rasanya datar dan ngebosenin..." },
  { id: 6, image: chibi06, text: "...atau bahkan hari-hari yang bikin kita sedih dan rasanya berat banget." },
  { id: 7, image: chibi07, text: "Di saat-saat kayak gitu, aku mau kamu inget: kamu nggak sendirian. Aku di sini, siap jadi sandaranmu. Selamat ulang tahun, Annisa." }
];

function ChibiStory({ onStoryComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isFading, setIsFading] = useState(false);

  const handleNext = (event) => {
    coolModeClickHandler(event); // Selalu panggil efek bola-bola

    if (currentStep < storyData.length - 1) {
      setIsFading(true);
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setIsFading(false);
      }, 500);
    } else {
      onStoryComplete(); // Selalu panggil efek konfeti
    }
  };

  const currentStory = storyData[currentStep];
  const isLastStep = currentStep === storyData.length - 1;

  return (
    <div className="chibi-story-container">
      <div className={`chibi-content-wrapper ${isFading ? 'fading' : ''}`}>
        <img src={currentStory.image} alt={`Chibi expression ${currentStory.id}`} className="chibi-image" />
        <p className="chibi-text">{currentStory.text}</p>
      </div>

      <InteractiveHoverButton 
        onClick={(e) => handleNext(e)} 
        disabled={isFading} // Tombol hanya non-aktif saat transisi antar chibi
        className="disabled:opacity-50 mt-8"
      >
        {isLastStep ? "Happy Birthday! 🎉" : "Lanjut"}
      </InteractiveHoverButton>
    </div>
  );
}

export default ChibiStory;