
import React, { useEffect, useState } from 'react';
import { dbService } from '../services/db';
import { Reflection } from '../types';

export const History: React.FC = () => {
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
        const refs = await dbService.getReflections();
        setReflections(refs);
        setLoading(false);
    };
    loadData();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-700 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto pt-8 animate-fade-in pb-32">
      <h2 className="text-3xl font-bold text-primary-900 mb-8">Historial de Reflexiones</h2>
      
      <div className="space-y-6">
        {reflections.length === 0 ? (
            <div className="text-center py-12 text-primary-500 border-2 border-dashed border-primary-200 bg-primary-50/50 rounded-xl font-medium">
                Aún no has completado ninguna revisión nocturna.
            </div>
        ) : (
            reflections.map((ref) => (
                <div key={ref.id} className="bg-white p-6 rounded-2xl shadow-sm border border-primary-100 hover:border-primary-300 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-primary-900 capitalize">
                            {new Date(ref.date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </h3>
                         <span className="text-xs font-medium text-primary-500 bg-primary-50 px-2 py-1 rounded-md">
                            Día Completado
                        </span>
                    </div>
                    <div className="bg-primary-50/50 p-4 rounded-xl">
                        <p className="text-primary-800 italic leading-relaxed whitespace-pre-wrap">"{ref.text}"</p>
                    </div>
                </div>
            ))
        )}
      </div>
    </div>
  );
};
