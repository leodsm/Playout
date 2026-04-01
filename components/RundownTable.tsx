'use client';

import { AlertTriangle, CheckCircle2, Clock3, Play, SkipForward } from 'lucide-react';
import { formatDuration, PlaylistItem } from '@/types/playlist';

interface RundownTableProps {
  items: PlaylistItem[];
  onTake: (item: PlaylistItem) => void;
  onCue: (item: PlaylistItem) => void;
  selectedId: string | null;
  onSelect: (item: PlaylistItem) => void;
}

const statusStyles: Record<PlaylistItem['status'], string> = {
  played: 'text-slate-500',
  playing: 'text-red-400',
  ready: 'text-emerald-400',
  queued: 'text-sky-400',
};

const statusIcon = (status: PlaylistItem['status']) => {
  if (status === 'playing') return <AlertTriangle className="h-4 w-4" />;
  if (status === 'played') return <CheckCircle2 className="h-4 w-4" />;
  if (status === 'queued') return <SkipForward className="h-4 w-4" />;
  return <Clock3 className="h-4 w-4" />;
};

export function RundownTable({ items, onTake, onCue, selectedId, onSelect }: RundownTableProps) {
  const now = new Date();
  let elapsed = 0;

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/70 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-800 text-slate-300 uppercase tracking-wide text-xs">
          <tr>
            <th className="p-3 text-left">Estado</th>
            <th className="p-3 text-left">Nome</th>
            <th className="p-3 text-left">Duração</th>
            <th className="p-3 text-left">Início Est.</th>
            <th className="p-3 text-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const start = new Date(now.getTime() + elapsed * 1000);
            elapsed += item.duration;
            const isSelected = selectedId === item.id;

            return (
              <tr
                key={item.id}
                className={`border-t border-slate-800 hover:bg-slate-800/60 cursor-pointer ${
                  isSelected ? 'bg-slate-800/80' : ''
                }`}
                onClick={() => onSelect(item)}
              >
                <td className={`p-3 ${statusStyles[item.status]}`}>
                  <span className="inline-flex items-center gap-2">
                    {statusIcon(item.status)} {item.status.toUpperCase()}
                  </span>
                </td>
                <td className="p-3 font-medium text-slate-100">{item.title}</td>
                <td className="p-3 text-slate-300">{formatDuration(item.duration)}</td>
                <td className="p-3 text-slate-300">{start.toLocaleTimeString('pt-BR')}</td>
                <td className="p-3">
                  <div className="flex justify-end gap-2">
                    <button
                      className="inline-flex items-center gap-1 rounded-md bg-slate-700 px-3 py-1.5 text-xs text-slate-100 hover:bg-slate-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCue(item);
                      }}
                    >
                      CUE
                    </button>
                    <button
                      className="inline-flex items-center gap-1 rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        onTake(item);
                      }}
                    >
                      <Play className="h-3.5 w-3.5" /> TAKE
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
