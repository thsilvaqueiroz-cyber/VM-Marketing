
import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const SaoPauloClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(time);

  const formattedTime = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(time);

  return (
    <div className="mx-4 mt-2 mb-4 p-4 bg-gradient-to-br from-indigo-900 to-indigo-800 rounded-xl text-white shadow-lg border border-indigo-700/50">
      <div className="flex items-center gap-2 mb-2 text-indigo-200 text-xs font-medium uppercase tracking-wider">
        <Clock size={12} /> Horário de Brasília
      </div>
      <p className="text-3xl font-bold tabular-nums tracking-tight leading-none mb-1">
        {formattedTime}
      </p>
      <p className="text-xs text-indigo-100 capitalize font-medium opacity-90">
        {formattedDate}
      </p>
    </div>
  );
};

export default SaoPauloClock;
