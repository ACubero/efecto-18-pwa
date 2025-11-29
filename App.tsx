
import React, { useState } from 'react';
import { ViewState } from './types';
import { MorningSetup } from './components/MorningSetup';
import { TodaysFocus } from './components/TodaysFocus';
import { EveningReview } from './components/EveningReview';
import { Settings } from './components/Settings';
import { Sentinel } from './components/Sentinel';
import { PauseOverlay } from './components/PauseOverlay';
import { TheMethod } from './components/TheMethod';
import { History } from './components/History';

// Icons
const Icons = {
  Sun: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 21v-2.25m-6.364-.386l1.591-1.591M3 12h2.25m.386-6.364l1.591 1.591M12 8.25a3.75 3.75 0 100 7.5 3.75 3.75 0 000-7.5z" /></svg>,
  List: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>,
  Moon: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" /></svg>,
  Cog: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  Pause: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" /></svg>,
  Info: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg>,
  Clock: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
};

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('focus');
  const [pauseActive, setPauseActive] = useState(false);

  const handleSentinelCheckIn = (success: boolean) => {
    if (!success) {
      setPauseActive(true);
    }
  };

  const navItems = [
    { id: 'setup', label: 'Config', icon: Icons.Sun },
    { id: 'focus', label: 'Enfoque', icon: Icons.List },
    { id: 'review', label: 'Repaso', icon: Icons.Moon },
    { id: 'history', label: 'Historial', icon: Icons.Clock },
    { id: 'method', label: 'Método', icon: Icons.Info },
    { id: 'settings', label: 'Ajustes', icon: Icons.Cog },
  ];

  return (
    <div className="h-full flex flex-col bg-background font-sans">
      {/* Global Overlays */}
      <Sentinel onCheckIn={handleSentinelCheckIn} />
      <PauseOverlay isActive={pauseActive} onClose={() => setPauseActive(false)} />

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative">
        <div className="h-full overflow-y-auto no-scrollbar scroll-smooth">
          <div className="max-w-7xl mx-auto h-full p-4 md:p-8">
            {view === 'setup' && <MorningSetup />}
            {view === 'focus' && <TodaysFocus />}
            {view === 'review' && <EveningReview onFinished={() => setView('history')} />}
            {view === 'settings' && <Settings />}
            {view === 'method' && <TheMethod />}
            {view === 'history' && <History />}
          </div>
        </div>

        {/* Floating Action Button (FAB) for Pause */}
        {view === 'focus' && (
            <button 
                onClick={() => setPauseActive(true)}
                className="absolute bottom-24 right-6 md:bottom-12 md:right-12 w-16 h-16 bg-primary-900 text-white rounded-full shadow-xl hover:bg-primary-800 hover:shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 z-20 group"
                aria-label="Pause"
            >
                <div className="group-hover:animate-pulse">
                  <Icons.Pause />
                </div>
            </button>
        )}
      </main>

      {/* Modern Floating Navigation Dock */}
      <div className="fixed bottom-6 left-0 right-0 flex justify-center z-30 pointer-events-none">
        <nav className="bg-white/90 backdrop-blur-xl border border-white/20 shadow-lg shadow-primary-900/5 rounded-2xl px-2 py-2 flex gap-1 pointer-events-auto max-w-[95%] md:max-w-xl overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = view === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id as ViewState)}
                className={`relative px-4 md:px-4 py-3 rounded-xl flex flex-col items-center justify-center transition-all duration-300 ease-out group min-w-[4rem]
                  ${isActive ? 'bg-primary-50 text-primary-900 shadow-sm' : 'text-primary-400 hover:text-primary-600 hover:bg-white/50'}`}
              >
                <span className={`transition-transform duration-300 ${isActive ? '-translate-y-0.5 scale-110' : 'group-hover:-translate-y-0.5'}`}>
                  <Icon />
                </span>
                <span className={`text-[9px] font-medium mt-1 transition-opacity duration-300 whitespace-nowrap ${isActive ? 'opacity-100' : 'opacity-0 hidden md:block'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default App;
