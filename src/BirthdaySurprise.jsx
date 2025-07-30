import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import ChibiStory from './ChibiStory.jsx';
import { Terminal, TypingAnimation, AnimatedSpan } from './Terminal.jsx';
import './BirthdaySurprise.css';

const triggerStarExplosion = () => {
  const defaults = {
    spread: 360, ticks: 50, gravity: 0, decay: 0.94, startVelocity: 30,
    colors: ["#FF69B4", "#FFC0CB", "#FF1493", "#DB7093", "#FFF0F5"],
  };
  const shoot = () => {
    confetti({ ...defaults, particleCount: 40, scalar: 1.2, shapes: ["star"], });
    confetti({ ...defaults, particleCount: 10, scalar: 0.75, shapes: ["circle"], });
  };
  setTimeout(shoot, 0);
  setTimeout(shoot, 100);
  setTimeout(shoot, 200);
};

const fireFinaleConfetti = () => {
  confetti({
    particleCount: 150,
    spread: 180,
    origin: { y: 0.6 }
  });
};

const animationVariants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 25 } },
  exit: { opacity: 0, scale: 1.2, transition: { duration: 0.4, ease: 'easeIn' } }
};

function BirthdaySurprise() {
  const [surpriseStep, setSurpriseStep] = useState('greeting');
  const [storyIsFinished, setStoryIsFinished] = useState(false);

  useEffect(() => {
    if (surpriseStep === 'greeting') {
      triggerStarExplosion();
    }
    const toTerminalTimeout = setTimeout(() => setSurpriseStep('terminal'), 4500);
    const toChibiStoryTimeout = setTimeout(() => setSurpriseStep('chibiStory'), 10000);
    return () => {
      clearTimeout(toTerminalTimeout);
      clearTimeout(toChibiStoryTimeout);
    };
  }, []);

  const handleStoryComplete = () => {
    fireFinaleConfetti();
    if (!storyIsFinished) {
      setStoryIsFinished(true);
    }
  };

  const renderInitialSurprise = () => {
    switch (surpriseStep) {
      case 'terminal':
        return (
          <motion.div key="terminal" className="content-raised" variants={animationVariants} initial="initial" animate="animate" exit="exit">
            <Terminal className="birthday-terminal">
              <div className="flex">
                <span className="text-pink-400">annisa@birthday</span>
                <span className="text-white">:~$ </span>
                <TypingAnimation>./execute_birthday_wish.sh</TypingAnimation>
              </div>
              <AnimatedSpan delay={1500}>Initializing modules...</AnimatedSpan>
              <AnimatedSpan delay={1800}>Loading sweet memories...</AnimatedSpan>
              <AnimatedSpan delay={2100}>Compiling happiness protocols...</AnimatedSpan>
              <AnimatedSpan delay={2400} className="text-green-400">Protocols ready.</AnimatedSpan>
              <AnimatedSpan delay={2700}><span className="text-cyan-400">Target Acquired:</span> Annisa Nurul Islami</AnimatedSpan>
              <AnimatedSpan delay={3000}><span className="text-cyan-400">Status:</span> The Best Person Ever</AnimatedSpan>
              <AnimatedSpan delay={3500} className="text-green-400">All systems are go. Happy Birthday!</AnimatedSpan>
              <div className="flex" style={{ opacity: 0, animation: 'fadeIn 1s 4.5s forwards' }}>
                <span className="text-pink-400">annisa@birthday</span>
                <span className="text-white">:~$ </span>
                <span className="inline-block h-4 w-2 animate-pulse bg-white"></span>
              </div>
            </Terminal>
          </motion.div>
        );
      case 'chibiStory':
        return (
          <motion.div key="chibiStory" className="content-raised" variants={animationVariants} initial="initial" animate="animate" exit="exit">
            <ChibiStory onStoryComplete={handleStoryComplete} />
          </motion.div>
        );
      default:
        return (
          <motion.div key="greeting" className="content-raised" variants={animationVariants} initial="initial" animate="animate" exit="exit">
            <div className="title-wrapper">
              <h1 className="surprise-title">
                <span>S</span><span>E</span><span>L</span><span>A</span><span>M</span><span>A</span><span>T</span><br />
                <span>U</span><span>L</span><span>A</span><span>N</span><span>G</span><br />
                <span>T</span><span>A</span><span>H</span><span>U</span><span>N</span>
              </h1>
              <h2 className="surprise-name">Annisa!</h2>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div className="surprise-container">
      <AnimatePresence mode="wait">
        {renderInitialSurprise()}
      </AnimatePresence>
      {storyIsFinished && (
        <motion.p 
          className="final-message"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 0.5, duration: 1 } }}
        >
          Semoga kamu suka kejutannya!
        </motion.p>
      )}
    </div>
  );
}

export default BirthdaySurprise;