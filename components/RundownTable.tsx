'use client';

import { Play, SkipForward, CheckCircle2, Dot, LoaderCircle } from 'lucide-react';
import { PlaylistItem } from '@/types/playlist';

interface RundownTableProps {
  items: PlaylistItem[];
  selectedId?: string;
  onSelectItem: (item: PlaylistItem) => void;
  onTakeItem: (item: PlaylistItem) => void;
  onCueItem: (item: PlaylistItem) => void;
  busyId?: string | null;
}

const statusStyles: Record<PlaylistItem['status'], string> = {
  played: 'text-slate-500',
  playing: 'text-rose-400',
  queued: 'text-cyan-300',
  ready: 'text-emerald-300',
};

function formatDuration(totalSeconds: number) {
  const mins = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const secs = (totalSeconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

export function RundownTable({
  items,
  selectedId,
  onSelectItem,
  onTakeItem,
  onCueItem,
  busyId,
}: RundownTableProps) {
  return (
    <div className="rounded-md border border-slate-700 bg-slate-800/80">
      <div className="grid grid-cols-[120px_1fr_110px_170px_170px] border-b border-slate-700 px-4 py-3 text-xs uppercase tracking-wide text-slate-400">
        <span>Estado</span>
        <span>Nome</span>
        <span>Duração</span>
        <span>Início Est.</span>
        <span>Ações</span>
      </div>

      <div className="max-h-[460px] overflow-y-auto">
        {items.map((item, index) => (
          <div
            key={item.id}
            onClick={() => onSelectItem(item)}
            className={`grid cursor-pointer grid-cols-[120px_1fr_110px_170px_170px] items-center border-b border-slate-700/50 px-4 py-3 transition-colors ${
              selectedId === item.id ? 'bg-slate-700/50' : 'hover:bg-slate-700/30'
            }`}
          >
            <div className={`flex items-center gap-2 text-xs font-semibold uppercase ${statusStyles[item.status]}`}>
              {item.status === 'playing' ? <LoaderCircle className="animate-spin" size={14} /> : item.status === 'played' ? <CheckCircle2 size={14} /> : <Dot size={16} />}
              {item.status}
            </div>
            <span className="truncate text-sm text-slate-100">{item.title}</span>
            <span className="text-sm text-slate-300">{formatDuration(item.duration)}</span>
            <span className="text-sm text-slate-300">{`+${index * 2} min`}</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onTakeItem(item);
                }}
                disabled={busyId === item.id}
                className="inline-flex items-center gap-1 rounded bg-rose-600 px-2 py-1 text-xs font-medium text-white hover:bg-rose-500 disabled:opacity-50"
              >
                <Play size={12} />
                TAKE
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onCueItem(item);
                }}
                disabled={busyId === item.id}
                className="inline-flex items-center gap-1 rounded bg-cyan-700 px-2 py-1 text-xs font-medium text-white hover:bg-cyan-600 disabled:opacity-50"
              >
                <SkipForward size={12} />
                CUE
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
