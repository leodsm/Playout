'use client';

import { useEffect, useState } from 'react';
import { Plug, PlugZap } from 'lucide-react';

interface TopBarProps {
  connected: boolean;
  channelName?: string;
}

export function TopBar({ connected, channelName = 'TV Marília • Canal 15' }: TopBarProps) {
  const [clock, setClock] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="flex items-center justify-between border-b border-slate-700 bg-slate-900 px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded bg-red-600/90" />
        <div>
          <h1 className="text-sm font-semibold uppercase tracking-wide text-slate-100">{channelName}</h1>
          <p className="text-xs text-slate-400">Web Playout Controller</p>
        </div>
      </div>

      <div className="text-2xl font-mono tracking-widest text-slate-100">
        {clock.toLocaleTimeString('pt-BR', { hour12: false })}
      </div>

      <div
        className={`flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-medium uppercase tracking-wide ${
          connected
            ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300'
            : 'border-rose-500/50 bg-rose-500/10 text-rose-300'
        }`}
      >
        {connected ? <PlugZap size={14} /> : <Plug size={14} />}
        {connected ? 'OBS Conectado' : 'OBS Desconectado'}
      </div>
    </header>
  );
}
