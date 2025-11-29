import React, { useEffect, useState } from 'react';

interface PauseOverlayProps {
  isActive: boolean;
  onClose: () => void;
}

export const PauseOverlay: React.FC<PauseOverlayProps> = ({ isActive, onClose }) => {
  const [countdown, setCountdown] = useState(10);
  const [canDismiss, setCanDismiss] = useState(false);

  useEffect(() => {
    if (isActive) {
      setCountdown(10);
      setCanDismiss(false);
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setCanDismiss(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-white/60 backdrop-blur-xl flex flex-col items-center justify-center animate-fade-in">
      <div className="relative mb-16">
        {/* Breathing Circle */}
        <div className="w-80 h-80 bg-gradient-to-tr from-primary-900 to-primary-800 rounded-full animate-breathe flex items-center justify-center shadow-2xl shadow-primary-900/30">
           <span className="text-white text-8xl font-thin font-mono tabular-nums">
             {countdown > 0 ? countdown : ''}
           </span>
        </div>
        {countdown > 0 && (
            <p className="absolute -bottom-12 left-0 right-0 text-center text-primary-500 font-medium tracking-widest uppercase text-sm animate-pulse">
                Inhala... Exhala
            </p>
        )}
      </div>

      <div className="text-center h-24 flex items-center justify-center">
        {canDismiss ? (
          <div className="animate-slide-up flex flex-col items-center">
             <h2 className="text-2xl text-primary-900 font-light mb-8">¿Es urgente o solo ruido?</h2>
             <button 
                onClick={onClose}
                className="px-10 py-4 bg-primary-900 text-white rounded-full hover:bg-primary-800 transition-all font-semibold uppercase tracking-widest text-sm shadow-xl hover:shadow-2xl hover:scale-105"
             >
                Volver al Enfoque
             </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};