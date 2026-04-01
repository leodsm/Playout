'use client';

import { PlaylistItem } from '@/types/playlist';

interface InspectorPanelProps {
  item?: PlaylistItem;
  onPatchItem: (id: string, patch: Partial<PlaylistItem>) => void;
}

export function InspectorPanel({ item, onPatchItem }: InspectorPanelProps) {
  return (
    <aside className="w-full rounded-md border border-slate-700 bg-slate-800 p-4">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-300">Inspetor</h3>

      {!item ? (
        <p className="text-sm text-slate-500">Selecione um item na grelha para editar.</p>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wide text-slate-400">Título</label>
            <input
              value={item.title}
              onChange={(e) => onPatchItem(item.id, { title: e.target.value })}
              className="w-full rounded border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none ring-cyan-500 focus:ring"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wide text-slate-400">Caminho do ficheiro</label>
            <input
              value={item.filePath}
              onChange={(e) => onPatchItem(item.id, { filePath: e.target.value })}
              className="w-full rounded border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none ring-cyan-500 focus:ring"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={item.autoNext}
              onChange={(e) => onPatchItem(item.id, { autoNext: e.target.checked })}
            />
            Auto Next
          </label>
        </div>
      )}
    </aside>
  );
}
