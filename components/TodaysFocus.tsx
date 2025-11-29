
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { dbService } from '../services/db';
import { Category, Task, TaskStatus } from '../types';

const TODAY = new Date().toISOString().split('T')[0];
const DEFAULT_TIMER_SECONDS = 300; // 5 minutes

export const TodaysFocus: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [bankTasks, setBankTasks] = useState<Task[]>([]);
  const [plannedTasks, setPlannedTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedCatId, setSelectedCatId] = useState<number | null>(null);
  
  // Timer State
  const [timeLeft, setTimeLeft] = useState(DEFAULT_TIMER_SECONDS);
  const [timerActive, setTimerActive] = useState(false);
  
  // Mobile Interaction State
  const [selectedTaskForMove, setSelectedTaskForMove] = useState<Task | null>(null);
  
  // Hours State
  const [hours, setHours] = useState<string[]>([]);

  const fetchData = useCallback(async () => {
    const cats = await dbService.getCategories();
    setCategories(cats.filter(c => c.name.trim() !== ''));
    
    const tasks = await dbService.getTasksByDate(TODAY);
    setBankTasks(tasks.filter(t => t.status === TaskStatus.BANK));
    setPlannedTasks(tasks.filter(t => t.status === TaskStatus.PLANNED || t.status === TaskStatus.COMPLETED));
  }, []);

  // Initialize Data & Settings
  useEffect(() => {
    fetchData();

    // Load Hours from Settings or Default
    const startHour = parseInt(localStorage.getItem('setting_startHour') || '8');
    const endHour = parseInt(localStorage.getItem('setting_endHour') || '18');
    const generatedHours = [];
    for (let i = startHour; i <= endHour; i++) {
        generatedHours.push(`${i.toString().padStart(2, '0')}:00`);
    }
    setHours(generatedHours);
  }, [fetchData]);

  // Persistent Timer Logic
  useEffect(() => {
    const checkTimer = () => {
      const storedTarget = localStorage.getItem('timer_target');
      if (storedTarget) {
        const targetTime = parseInt(storedTarget);
        const now = Date.now();
        const diff = Math.ceil((targetTime - now) / 1000);
        
        if (diff > 0) {
          setTimeLeft(diff);
          setTimerActive(true);
        } else {
          localStorage.removeItem('timer_target');
          setTimeLeft(0);
          setTimerActive(false);
          // Optional: Play sound or notification here
        }
      }
    };

    checkTimer();
    const interval = window.setInterval(() => {
        if (localStorage.getItem('timer_target')) {
            checkTimer();
        } else if (timerActive) {
           // Fallback if local storage cleared but state is active
           setTimerActive(false);
        }
    }, 1000);

    return () => clearInterval(interval);
  }, []); // Only run on mount to set up the interval poller

  const toggleTimer = () => {
    if (timerActive) {
      // Stop
      localStorage.removeItem('timer_target');
      setTimerActive(false);
      setTimeLeft(DEFAULT_TIMER_SECONDS);
    } else {
      // Start
      const targetTime = Date.now() + (timeLeft * 1000);
      localStorage.setItem('timer_target', targetTime.toString());
      setTimerActive(true);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !selectedCatId) return;

    const newTask: Task = {
      title: newTaskTitle,
      categoryId: selectedCatId,
      status: TaskStatus.BANK,
      plannedDate: null,
      timeSlot: null,
      createdAt: Date.now(),
    };

    await dbService.saveTask(newTask);
    setNewTaskTitle('');
    fetchData();
  };

  // Drag and Drop
  const handleDragStart = (e: React.DragEvent, task: Task) => {
    if (!task.id) return;
    e.dataTransfer.setData("taskId", task.id.toString());
    e.dataTransfer.effectAllowed = "move";
    // Also select for tap interaction
    setSelectedTaskForMove(task);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, timeSlot: string | null) => {
    e.preventDefault();
    const taskId = parseInt(e.dataTransfer.getData("taskId"));
    moveTask(taskId, timeSlot);
  };

  // Unified Move Logic (for DnD and Click)
  const moveTask = async (taskId: number | undefined, timeSlot: string | null) => {
    if (!taskId) return;
    const allTasks = [...bankTasks, ...plannedTasks];
    const task = allTasks.find(t => t.id === taskId);
    
    if (task) {
      const updatedTask: Task = {
        ...task,
        status: timeSlot ? TaskStatus.PLANNED : TaskStatus.BANK,
        plannedDate: timeSlot ? TODAY : null,
        timeSlot: timeSlot
      };
      await dbService.saveTask(updatedTask);
      setSelectedTaskForMove(null); // Clear selection
      fetchData();
    }
  };

  const handleTaskClick = (task: Task) => {
    if (selectedTaskForMove?.id === task.id) {
        setSelectedTaskForMove(null); // Deselect
    } else {
        setSelectedTaskForMove(task); // Select
    }
  };

  const handleSlotClick = (timeSlot: string) => {
      if (selectedTaskForMove) {
          moveTask(selectedTaskForMove.id, timeSlot);
      }
  };

  const handleReturnToBank = () => {
      if (selectedTaskForMove && selectedTaskForMove.status !== TaskStatus.BANK) {
          moveTask(selectedTaskForMove.id, null);
      }
  }

  const isOverCommitted = plannedTasks.length > 8;

  return (
    <div className="h-full flex flex-col animate-fade-in pb-32">
      {/* Header & Timer */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
        <div>
            <h2 className="text-3xl font-bold text-primary-950 tracking-tight">Enfoque de Hoy</h2>
            <p className="text-primary-600 font-semibold mt-1 capitalize">{new Date().toLocaleDateString('es-ES', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
        
        <div 
          onClick={toggleTimer}
          className={`group cursor-pointer bg-white px-6 py-3 rounded-2xl shadow-sm border border-primary-200 flex items-center gap-4 transition-all duration-300 hover:shadow-md hover:border-primary-400 ${timerActive ? 'ring-2 ring-primary-600 border-primary-600' : ''}`}
        >
          <div className="text-xs font-bold uppercase tracking-widest text-primary-500">Bloque de Tiempo</div>
          <div className={`text-3xl font-mono font-bold ${timerActive ? 'text-primary-900' : 'text-primary-500 group-hover:text-primary-700'}`}>
            {timeLeft === 0 ? "DONE" : formatTime(timeLeft)}
          </div>
          <button className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${timerActive ? 'bg-primary-600 text-white' : 'bg-primary-100 text-primary-600'}`}>
            {timerActive ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z" clipRule="evenodd" /></svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" /></svg>
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-8 overflow-hidden">
        
        {/* Left Column: Task Bank */}
        <div 
          className="flex-1 flex flex-col bg-white rounded-3xl shadow-sm border border-primary-200 overflow-hidden"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, null)}
          onClick={handleReturnToBank}
        >
          <div className="p-6 bg-primary-50 border-b border-primary-200" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xs font-bold uppercase text-primary-600 tracking-widest mb-4">Banco de Tareas</h3>
            
            <form onSubmit={handleAddTask} className="space-y-3">
              <select 
                className="w-full text-sm p-3 bg-white rounded-xl border border-primary-300 focus:ring-2 focus:ring-primary-600 focus:border-primary-600 outline-none transition-all text-primary-900 font-medium"
                value={selectedCatId || ''}
                onChange={(e) => setSelectedCatId(Number(e.target.value))}
              >
                <option value="">Seleccionar Categoría...</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="¿Qué hay que hacer?" 
                  className="flex-1 p-3 text-sm bg-white rounded-xl border border-primary-300 focus:ring-2 focus:ring-primary-600 focus:border-primary-600 outline-none transition-all placeholder-primary-400 text-primary-900"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  disabled={!selectedCatId}
                />
                <button 
                  type="submit"
                  disabled={!selectedCatId || !newTaskTitle}
                  className="px-4 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </button>
              </div>
            </form>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-background relative">
             {/* Selection Helper Overlay for Return to Bank */}
            {selectedTaskForMove && selectedTaskForMove.status !== TaskStatus.BANK && (
                 <div className="absolute inset-0 bg-primary-900/10 z-10 flex items-center justify-center backdrop-blur-[1px] cursor-pointer">
                    <div className="bg-white px-4 py-2 rounded-lg shadow-lg text-primary-800 font-bold text-sm pointer-events-none">
                        Toca aquí para devolver al banco
                    </div>
                 </div>
            )}

            {bankTasks.map(task => {
                const cat = categories.find(c => c.id === task.categoryId);
                const isSelected = selectedTaskForMove?.id === task.id;
                return (
                    <div 
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task)}
                        onClick={(e) => { e.stopPropagation(); handleTaskClick(task); }}
                        className={`group p-4 rounded-xl border shadow-sm cursor-move transition-all active:scale-95
                             ${isSelected 
                                ? 'bg-primary-100 border-primary-500 ring-2 ring-primary-500 z-20' 
                                : 'bg-white border-primary-200 hover:shadow-md hover:border-primary-400'
                             }`}
                    >
                        <div className="flex justify-between items-start mb-1">
                          <div className="text-sm font-semibold text-primary-900">{task.title}</div>
                          {isSelected ? (
                              <div className="text-xs font-bold text-primary-600 animate-pulse">Seleccionado</div>
                          ) : (
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-primary-400"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" /></svg>
                            </div>
                          )}
                        </div>
                        <div className="inline-block px-2.5 py-1 rounded-md bg-primary-100 text-[10px] font-bold text-primary-700 uppercase tracking-wide border border-primary-200">
                          {cat?.name || 'Desconocido'}
                        </div>
                    </div>
                );
            })}
            {bankTasks.length === 0 && (
                <div className="h-32 flex items-center justify-center text-primary-400 text-sm font-medium italic border-2 border-dashed border-primary-200 rounded-xl m-2 bg-white/50">
                  El banco está vacío
                </div>
            )}
          </div>
        </div>

        {/* Right Column: Schedule */}
        <div className={`flex-1 flex flex-col bg-white rounded-3xl border shadow-sm overflow-hidden transition-colors duration-500
            ${isOverCommitted ? 'border-red-200' : 'border-primary-200'}`}>
          <div className={`p-6 border-b ${isOverCommitted ? 'bg-red-50/50 border-red-100' : 'bg-primary-50 border-primary-200'}`}>
             <div className="flex justify-between items-center">
                <h3 className={`text-xs font-bold uppercase tracking-widest ${isOverCommitted ? 'text-red-500' : 'text-primary-600'}`}>
                    Agenda {isOverCommitted && '— Sobrecarga'}
                </h3>
                <span className="text-[10px] font-semibold text-primary-500 bg-white border border-primary-200 px-2 py-1 rounded-full shadow-sm">
                    {selectedTaskForMove ? "Toca una hora para mover" : "Arrastra o selecciona tareas"}
                </span>
             </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-1 bg-white">
            {hours.map(hour => {
              const task = plannedTasks.find(t => t.timeSlot === hour);
              const cat = task ? categories.find(c => c.id === task.categoryId) : null;
              const isSlotSelected = selectedTaskForMove && !task; // Highlight empty slots if task selected
              const isTaskSelected = task && selectedTaskForMove?.id === task.id;

              return (
                <div 
                    key={hour} 
                    className="flex items-stretch group min-h-[5rem]"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, hour)}
                    onClick={() => handleSlotClick(hour)}
                >
                  <div className="w-16 flex-shrink-0 flex flex-col items-center justify-start pt-3">
                    <span className="text-sm font-mono text-primary-400 font-bold">{hour}</span>
                  </div>
                  
                  <div className={`flex-1 rounded-xl border-2 transition-all duration-200 relative cursor-pointer
                    ${task 
                        ? (isTaskSelected ? 'bg-primary-100 border-primary-500 ring-2 ring-primary-500' : 'bg-primary-50 border-primary-100 shadow-sm')
                        : (isSlotSelected ? 'bg-primary-50 border-primary-400 animate-pulse' : 'bg-white border-dashed border-primary-200 hover:border-primary-400 hover:bg-primary-50/50')
                    }`}
                  >
                    {task ? (
                        <div 
                            draggable
                            onDragStart={(e) => handleDragStart(e, task)}
                            onClick={(e) => { e.stopPropagation(); handleTaskClick(task); }}
                            className="w-full h-full p-3 flex flex-col justify-center"
                        >
                            <div className="text-sm font-bold text-primary-900 leading-tight">{task.title}</div>
                            <div className="text-xs text-primary-600 font-medium mt-1">{cat?.name}</div>
                        </div>
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                            <span className="text-xs text-primary-500 font-bold uppercase tracking-wider">
                                {isSlotSelected ? 'Mover Aquí' : '+ Soltar aquí'}
                            </span>
                        </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
