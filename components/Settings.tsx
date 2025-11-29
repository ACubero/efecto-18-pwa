
import React, { useEffect, useState } from 'react';
import { dbService } from '../services/db';

export const Settings: React.FC = () => {
  const [startHour, setStartHour] = useState('8');
  const [endHour, setEndHour] = useState('18');

  useEffect(() => {
    setStartHour(localStorage.getItem('setting_startHour') || '8');
    setEndHour(localStorage.getItem('setting_endHour') || '18');
  }, []);

  const handleSaveHours = () => {
    if (parseInt(startHour) >= parseInt(endHour)) {
        alert("La hora de inicio debe ser anterior a la hora de fin.");
        return;
    }
    localStorage.setItem('setting_startHour', startHour);
    localStorage.setItem('setting_endHour', endHour);
    alert('Horario actualizado. Los cambios se reflejarán en "Enfoque".');
  };

  const requestNotificationPermission = () => {
    Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
            alert('Notificaciones activadas.');
        } else {
            alert('Permiso denegado.');
        }
    });
  };

  const handleExport = async () => {
    const data = await dbService.exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `effect18-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (confirm("Esto sobrescribirá todos los datos actuales. ¿Estás seguro?")) {
            await dbService.restoreData(json);
            alert("Datos restaurados con éxito. Por favor, recarga.");
            window.location.reload();
        }
      } catch (err) {
        alert("Archivo de copia de seguridad inválido.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-xl mx-auto pt-8 animate-fade-in pb-32">
      <h2 className="text-3xl font-bold text-primary-900 mb-8">Ajustes</h2>
      
      <div className="space-y-6">
        
        {/* Work Hours Config */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-primary-100">
            <h3 className="text-lg font-semibold text-primary-900/50 mb-6">Horario de Enfoque</h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                    <label className="block text-[10px] font-bold text-primary-300 uppercase mb-2 tracking-wider">Inicio</label>
                    <div className="relative">
                        <select 
                            value={startHour} 
                            onChange={(e) => setStartHour(e.target.value)} 
                            className="w-full p-4 rounded-xl bg-gray-200 text-gray-900 font-bold border-none focus:ring-2 focus:ring-primary-400 outline-none appearance-none text-center transition-all cursor-pointer hover:bg-gray-300"
                        >
                            {Array.from({length: 24}).map((_, i) => (
                                <option key={i} value={i}>{i}:00</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-primary-300 uppercase mb-2 tracking-wider">Fin</label>
                    <div className="relative">
                        <select 
                            value={endHour} 
                            onChange={(e) => setEndHour(e.target.value)} 
                            className="w-full p-4 rounded-xl bg-gray-200 text-gray-900 font-bold border-none focus:ring-2 focus:ring-primary-400 outline-none appearance-none text-center transition-all cursor-pointer hover:bg-gray-300"
                        >
                             {Array.from({length: 24}).map((_, i) => (
                                <option key={i} value={i}>{i}:00</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
            <button 
                onClick={handleSaveHours} 
                className="w-full bg-primary-50 text-primary-800/80 hover:text-primary-900 font-bold py-4 rounded-xl hover:bg-primary-100 transition-colors"
            >
                Guardar Horario
            </button>
        </div>

         {/* Notifications */}
         <div className="bg-white p-8 rounded-2xl shadow-sm border border-primary-100">
             <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-primary-900">Notificaciones</h3>
                    <p className="text-sm text-primary-500">Recibe alertas del Centinela incluso minimizado.</p>
                </div>
                <button onClick={requestNotificationPermission} className="bg-primary-50 text-primary-600 p-2 rounded-lg hover:bg-primary-100 transition-colors">
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>
                </button>
             </div>
         </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-primary-100">
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-primary-900 mb-1">Exportar Datos</h3>
                    <p className="text-sm text-primary-500">Crea una copia de seguridad JSON portátil.</p>
                </div>
                <div className="bg-primary-50 p-2 rounded-lg text-primary-500">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
                </div>
            </div>
            <button 
            onClick={handleExport}
            className="w-full bg-primary-900 text-white px-4 py-3 rounded-xl hover:bg-primary-800 transition-all font-medium text-sm shadow-lg shadow-primary-900/10 active:scale-[0.99]"
            >
            Descargar Copia
            </button>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-primary-100">
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-primary-900 mb-1">Restaurar Datos</h3>
                    <p className="text-sm text-primary-500">Sobrescribir datos actuales.</p>
                </div>
                 <div className="bg-primary-50 p-2 rounded-lg text-primary-500">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
                </div>
            </div>
            
            <label className="block w-full cursor-pointer group">
                <input 
                    type="file" 
                    accept=".json"
                    onChange={handleRestore}
                    className="hidden"
                />
                <div className="w-full border-2 border-dashed border-primary-300 bg-primary-50/50 rounded-xl p-6 text-center group-hover:border-primary-500 group-hover:bg-primary-100 transition-all flex flex-col items-center gap-3">
                    <div className="bg-white p-2 rounded-full shadow-sm text-primary-600">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" /></svg>
                    </div>
                    <span className="text-sm text-primary-700 font-bold">Haz clic para seleccionar archivo</span>
                </div>
            </label>
        </div>
      </div>
    </div>
  );
};
