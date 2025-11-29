
import React, { useEffect, useState } from 'react';
import { dbService } from '../services/db';
import { Task, TaskStatus } from '../types';

interface EveningReviewProps {
  onFinished: () => void;
}

export const EveningReview: React.FC<EveningReviewProps> = ({ onFinished }) => {
  const [step, setStep] = useState(0);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [reflectionText, setReflectionText] = useState('');
  
  // Use dynamic date to handle day changes without reload
  const getToday = () => new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    const data = await dbService.getTasksByDate(getToday());
    setTasks(data.filter(t => t.timeSlot !== null));
  };

  const toggleComplete = async (task: Task) => {
    const newStatus = task.status === TaskStatus.COMPLETED ? TaskStatus.PLANNED : TaskStatus.COMPLETED;
    await dbService.saveTask({ ...task, status: newStatus });
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
  };

  const handleMigration = async (task: Task, action: 'tomorrow' | 'delete') => {
    if (action === 'delete') {
      await dbService.saveTask({ ...task, status: TaskStatus.DELETED });
    } else {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      const tomorrow = d.toISOString().split('T')[0];
      
      await dbService.saveTask({ 
        ...task, 
        plannedDate: tomorrow, 
        status: TaskStatus.PLANNED, 
        timeSlot: null 
      });
    }
    setTasks(prev => prev.filter(t => t.id !== task.id));
  };

  const saveReflection = async () => {
      if (!reflectionText.trim()) {
          alert("Por favor, escribe algo antes de terminar.");
          return;
      }
      await dbService.saveReflection({
          date: getToday(),
          text: reflectionText,
          createdAt: Date.now()
      });
      alert("Día completado y guardado. ¡Descansa bien!");
      onFinished();
  };

  const incompleteTasks = tasks.filter(t => t.status !== TaskStatus.COMPLETED && t.status !== TaskStatus.DELETED);

  return (
    <div className="max-w-2xl mx-auto h-full flex flex-col pt-8 pb-32 animate-fade-in">
      
      {/* Progress */}
      <div className="mb-12">
        <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-primary-500 mb-2">
            <span className={step >= 0 ? 'text-primary-800' : ''}>Celebración</span>
            <span className={step >= 1 ? 'text-primary-800' : ''}>Migración</span>
            <span className={step >= 2 ? 'text-primary-800' : ''}>Reflexión</span>
        </div>
        <div className="h-3 bg-primary-100 rounded-full overflow-hidden flex">
             <div className={`h-full bg-primary-600 transition-all duration-500 ease-out ${step === 0 ? 'w-1/3' : step === 1 ? 'w-2/3' : 'w-full'}`}></div>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
      {step === 0 && (
        <div className="animate-slide-up flex flex-col h-full">
          <div className="text-center mb-8 flex-shrink-0">
            <h2 className="text-3xl font-bold text-primary-950 mb-2">Victoria Diaria</h2>
            <p className="text-primary-600 font-medium">Reconoce lo que has hecho. El impulso se construye aquí.</p>
          </div>
          
          <div className="space-y-3 flex-1 overflow-y-auto pr-2 min-h-0">
            {tasks.map(task => (
              <div 
                key={task.id} 
                className={`group p-4 rounded-xl border transition-all duration-200 cursor-pointer flex items-center gap-4 select-none
                  ${task.status === TaskStatus.COMPLETED 
                    ? 'bg-primary-50 border-primary-300 shadow-sm' 
                    : 'bg-white border-primary-200 hover:border-primary-400 hover:shadow-sm'}`}
                onClick={() => toggleComplete(task)}
              >
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0
                  ${task.status === TaskStatus.COMPLETED ? 'border-primary-600 bg-primary-600 text-white' : 'border-primary-300 group-hover:border-primary-500'}`}>
                  {task.status === TaskStatus.COMPLETED && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                </div>
                <span className={`text-lg transition-colors ${task.status === TaskStatus.COMPLETED ? 'line-through text-primary-400' : 'text-primary-900 font-semibold'}`}>
                  {task.title}
                </span>
              </div>
            ))}
            {tasks.length === 0 && <div className="text-center py-12 text-primary-500 border-2 border-dashed border-primary-200 bg-primary-50/50 rounded-xl font-medium">No hay tareas programadas para hoy.</div>}
          </div>
          
          <div className="mt-6 flex justify-center flex-shrink-0 pt-4 pb-0">
             <div className="bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-sm">
                <button onClick={() => setStep(1)} className="px-8 py-4 bg-primary-900 text-white rounded-full font-bold hover:bg-primary-800 transition-colors shadow-lg shadow-primary-900/20 active:scale-95 text-lg min-w-[200px]">
                Continuar a Limpieza
                </button>
            </div>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="animate-slide-up flex flex-col h-full">
          <div className="text-center mb-8 flex-shrink-0">
            <h2 className="text-3xl font-bold text-primary-950 mb-2">Cerrar Ciclos</h2>
            <p className="text-primary-600 font-medium">Lo inacabado pesa en la mente. Decide ahora.</p>
          </div>
          
          <div className="space-y-4 flex-1 overflow-y-auto min-h-0">
            {incompleteTasks.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-primary-600 bg-primary-50 rounded-2xl border border-primary-200">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-12 h-12 mb-3"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span className="font-bold text-lg">Todas las tareas gestionadas. Excelente.</span>
                </div>
            ) : (
                incompleteTasks.map(task => (
                <div key={task.id} className="bg-white p-5 rounded-xl shadow-sm border border-primary-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <span className="font-bold text-lg text-primary-900">{task.title}</span>
                    <div className="flex gap-2 self-end sm:self-auto">
                    <button 
                        onClick={() => handleMigration(task, 'tomorrow')}
                        className="px-4 py-2 text-sm font-bold text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 border border-blue-200 transition-colors"
                    >
                        Mover a Mañana
                    </button>
                    <button 
                        onClick={() => handleMigration(task, 'delete')}
                        className="px-4 py-2 text-sm font-bold text-red-700 bg-red-50 rounded-lg hover:bg-red-100 border border-red-200 transition-colors"
                    >
                        Eliminar
                    </button>
                    </div>
                </div>
                ))
            )}
          </div>
          
          <div className="mt-6 flex justify-between items-center flex-shrink-0 pt-4 pb-0">
            <button onClick={() => setStep(0)} className="text-primary-500 hover:text-primary-800 font-bold px-4 transition-colors">Atrás</button>
             <div className="bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-sm">
                <button onClick={() => setStep(2)} className="px-8 py-4 bg-primary-900 text-white rounded-full font-bold hover:bg-primary-800 transition-colors shadow-lg shadow-primary-900/20 active:scale-95">
                Siguiente Paso
                </button>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="animate-slide-up flex flex-col h-full">
           <div className="text-center mb-8 flex-shrink-0">
            <h2 className="text-3xl font-bold text-primary-950 mb-2">Reflexión</h2>
            <p className="text-primary-600 font-medium">Captura la lección. Deja ir el resto.</p>
           </div>
           
           <div className="flex-1 min-h-0">
                <textarea 
                    className="w-full h-full p-6 rounded-2xl border-none bg-white shadow-sm ring-1 ring-primary-200 focus:ring-2 focus:ring-primary-600 outline-none resize-none text-lg leading-relaxed placeholder-primary-400 text-primary-900 transition-all font-medium"
                    placeholder="Hoy he aprendido..."
                    value={reflectionText}
                    onChange={(e) => setReflectionText(e.target.value)}
                ></textarea>
           </div>

           <div className="mt-6 flex justify-between items-center flex-shrink-0 pt-4 pb-0">
            <button onClick={() => setStep(1)} className="text-primary-500 hover:text-primary-800 font-bold px-4 transition-colors">Atrás</button>
            <div className="bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-sm">
                <button 
                    onClick={saveReflection} 
                    className="px-8 py-4 bg-primary-900 text-white rounded-full font-bold hover:bg-primary-800 transition-colors shadow-lg shadow-primary-900/20 active:scale-95"
                >
                Terminar Día
                </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};
