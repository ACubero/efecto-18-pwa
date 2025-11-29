
import React, { useEffect, useState } from 'react';
import { dbService } from '../services/db';
import { Task } from '../types';

interface SentinelProps {
  onCheckIn: (success: boolean) => void;
}

export const Sentinel: React.FC<SentinelProps> = ({ onCheckIn }) => {
  const [visible, setVisible] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [lastCheckInHour, setLastCheckInHour] = useState<number | null>(null);

  useEffect(() => {
    const checkTime = async () => {
      const now = new Date();
      const minutes = now.getMinutes();
      const hour = now.getHours();
      
      const startHour = parseInt(localStorage.getItem('setting_startHour') || '8');
      const endHour = parseInt(localStorage.getItem('setting_endHour') || '18');

      // Check if top of the hour, not already checked this hour, and within working hours
      if (minutes === 0 && hour !== lastCheckInHour && hour >= startHour && hour <= endHour) {
        const today = now.toISOString().split('T')[0];
        const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
        const tasks = await dbService.getTasksByDate(today);
        const task = tasks.find(t => t.timeSlot === timeSlot) || null;
        
        setCurrentTask(task);
        setVisible(true);
        setLastCheckInHour(hour);

        // Native Notification
        if (Notification.permission === 'granted') {
            new Notification('Sentinel Check-in', {
                body: task ? `¿Estás haciendo: ${task.title}?` : '¿Estás concentrado en lo que debes?',
                icon: '/icon.png' // Would need a real icon, but browser default is okay
            });
        }
      }
    };

    const interval = setInterval(checkTime, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, [lastCheckInHour]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-primary-950 z-50 flex items-center justify-center p-6 animate-fade-in">
      <div className="text-center max-w-2xl text-white">
        <div className="mb-12 space-y-4">
            <h1 className="text-4xl md:text-6xl font-light leading-tight tracking-tight text-primary-50">
            ¿Estás concentrado?
            </h1>
            <p className="text-primary-300 text-lg font-medium">La hora ha cambiado.</p>
        </div>
        
        {currentTask ? (
          <div className="bg-white/5 backdrop-blur-sm p-8 rounded-2xl mb-16 border border-white/10 shadow-2xl">
            <p className="text-primary-300 text-xs font-bold uppercase tracking-widest mb-4">Acordaste hacer esto</p>
            <p className="text-3xl font-serif italic text-white">{currentTask.title}</p>
          </div>
        ) : (
           <div className="mb-16 p-8 rounded-2xl border border-dashed border-white/10 text-primary-400 italic font-medium">No hay tarea específica programada para esta hora.</div> 
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-lg mx-auto">
          <button 
            onClick={() => { setVisible(false); onCheckIn(true); }}
            className="group relative px-8 py-5 bg-primary-600 border border-primary-500 rounded-xl text-white font-bold text-lg hover:bg-primary-500 hover:scale-[1.02] transition-all overflow-hidden shadow-lg shadow-primary-900/50"
          >
            <span className="relative z-10">Sí, estoy concentrado</span>
          </button>
          <button 
            onClick={() => { setVisible(false); onCheckIn(false); }}
            className="group relative px-8 py-5 bg-rose-900/30 border border-rose-500/50 rounded-xl text-rose-300 font-bold text-lg hover:bg-rose-600 hover:text-white transition-all overflow-hidden"
          >
            <span className="relative z-10">No, distraído</span>
          </button>
        </div>
      </div>
    </div>
  );
};
