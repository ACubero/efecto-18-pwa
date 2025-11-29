
import React, { useEffect, useState } from 'react';
import { dbService } from '../services/db';
import { Category } from '../types';

export const MorningSetup: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const cats = await dbService.getCategories();
    const paddedCats = [...cats];
    while (paddedCats.length < 5) {
      paddedCats.push({ name: '', createdAt: Date.now() });
    }
    setCategories(paddedCats.slice(0, 5));
    setLoading(false);
  };

  const handleUpdate = async (index: number, value: string) => {
    const newCats = [...categories];
    const catToUpdate = { ...newCats[index], name: value };
    newCats[index] = catToUpdate;
    setCategories(newCats);

    if (catToUpdate.id || value.trim().length > 0) {
      await dbService.saveCategory(catToUpdate);
      const fresh = await dbService.getCategories();
       const paddedCats = [...fresh];
        while (paddedCats.length < 5) {
        paddedCats.push({ name: '', createdAt: Date.now() });
        }
        setCategories(paddedCats.slice(0, 5));
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-700 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto animate-slide-up pb-32">
      <header className="mb-10 text-center">
        <h2 className="text-4xl font-bold text-primary-950 mb-3 tracking-tight">Configuración Matutina</h2>
        <p className="text-primary-600 text-lg font-medium">Define las 5 restricciones inquebrantables de tu vida.</p>
      </header>

      <div className="grid gap-5">
        {categories.map((cat, idx) => (
          <div key={idx} className="group relative bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-primary-200 overflow-hidden ring-1 ring-primary-100 hover:ring-primary-300">
             <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-primary-600 to-primary-500"></div>
            <div className="p-6 pl-8 flex items-center">
                <span className="text-4xl font-bold text-primary-200 mr-6 select-none font-mono group-hover:text-primary-300 transition-colors">0{idx + 1}</span>
                <div className="flex-1">
                    <label className="block text-xs font-bold text-primary-500 mb-1 uppercase tracking-widest">
                    Área de Enfoque
                    </label>
                    <input
                    type="text"
                    value={cat.name}
                    onChange={(e) => handleUpdate(idx, e.target.value)}
                    placeholder={`Define objetivo principal #${idx + 1}`}
                    className="w-full text-xl font-semibold bg-transparent border-none p-0 placeholder-primary-300 focus:ring-0 text-primary-900 focus:placeholder-primary-200 transition-colors"
                    />
                </div>
            </div>
            
            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                <span className="text-xs font-medium text-primary-600 bg-primary-50 px-3 py-1.5 rounded-full border border-primary-200 shadow-sm">
                    ¿Es esto realmente tuyo?
                </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 p-6 rounded-2xl border-2 border-dashed border-primary-300 bg-primary-50/50 text-center transition-all opacity-70 hover:opacity-100 hover:bg-primary-50 hover:border-primary-400">
        <h3 className="text-primary-600 font-bold uppercase tracking-widest text-sm mb-1">El Otro 95%</h3>
        <p className="text-sm text-primary-500 font-semibold">Todo lo demás va aquí. Ignóralo por ahora.</p>
      </div>
    </div>
  );
};
