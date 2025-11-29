
import React from 'react';

export const TheMethod: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto pt-8 animate-fade-in pb-32">
      <h1 className="text-3xl font-bold mb-6 text-primary-950">La Filosofía Efecto 18</h1>
      <p className="mb-6 text-lg text-primary-900/90 leading-relaxed">
          ¿Te resulta difícil concentrarte? No eres el único. En un mundo lleno de notificaciones, anhelamos atención. Esta aplicación no es una lista de tareas más; es una herramienta para luchar contra las distracciones basada en el libro <em>"18 Minutos"</em> de Peter Bregman.
      </p>

      <h2 className="text-2xl font-bold mt-10 mb-4 text-primary-600">1. La Regla de los 5 Objetivos (La Paradoja de la Mermelada)</h2>
      <p className="mb-3 text-primary-900/80 text-lg">
          La ciencia demuestra que demasiadas opciones nos paralizan. Por eso, esta app <strong>bloquea estrictamente</strong> tus áreas de enfoque a solo 5.
      </p>
      <ul className="list-disc pl-5 mb-6 space-y-2 text-primary-900/80 marker:text-primary-500">
          <li>Debes aceptar que no puedes hacerlo todo.</li>
          <li>Asegúrate de que tus objetivos sean realmente tuyos, no lo que otros esperan de ti.</li>
      </ul>

      <h2 className="text-2xl font-bold mt-10 mb-4 text-primary-600">2. El Ritual de 18 Minutos</h2>
      <p className="mb-6 text-primary-900/80 text-lg">
          El éxito no requiere mucho tiempo, solo requiere intención.
      </p>
      
      <div className="bg-white p-6 rounded-xl border-l-4 border-primary-500 shadow-sm mb-4">
          <h3 className="font-bold text-primary-900 text-lg mb-1">5 Minutos (Mañana): Planificar</h3>
          <p className="text-primary-700">Antes de encender el ordenador, decide qué harás. Si no está en tu calendario, no se hará.</p>
      </div>
      
      <div className="bg-white p-6 rounded-xl border-l-4 border-yellow-500 shadow-sm mb-4">
          <h3 className="font-bold text-primary-900 text-lg mb-1">1 Minuto (Cada Hora): Re-enfocar</h3>
          <p className="text-primary-700">Pon una alarma. Cuando suene, respira y pregúntate: "¿Estoy haciendo lo que dije que haría?". Es tu "Centinela Horario".</p>
      </div>
      
      <div className="bg-white p-6 rounded-xl border-l-4 border-primary-800 shadow-sm mb-4">
          <h3 className="font-bold text-primary-900 text-lg mb-1">5 Minutos (Noche): Revisar</h3>
          <p className="text-primary-700">Revisa qué lograste, qué aprendiste y limpia tu lista para mañana. Cierra el día con gratitud.</p>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4 text-primary-600">3. El Botón de Pausa (La Lección de Gmail)</h2>
      <p className="mb-4 text-primary-900/80 text-lg">
          Al igual que la función "deshacer envío" de Gmail nos salva de errores impulsivos, necesitamos una pausa en la vida real.
      </p>
      <p className="mb-4 text-primary-900/80 text-lg">
          Si sientes que pierdes el control, usa el botón de <strong>Pausa</strong> en la app. Te obligará a detenerte 10 segundos para reducir tu reactividad emocional y volver a tu centro.
      </p>
    </div>
  );
};
