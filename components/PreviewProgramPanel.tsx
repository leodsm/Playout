import { PlaylistItem } from '@/types/playlist';

interface PreviewProgramPanelProps {
  currentItem?: PlaylistItem;
  nextItem?: PlaylistItem;
}

export function PreviewProgramPanel({ currentItem, nextItem }: PreviewProgramPanelProps) {
  return (
    <section className="grid grid-cols-2 gap-4">
      <article className="rounded-md border border-rose-700/60 bg-slate-800 p-4">
        <p className="mb-2 text-xs uppercase tracking-wider text-rose-300">Program • No Ar</p>
        <h2 className="truncate text-lg font-semibold text-slate-100">{currentItem?.title ?? 'Sem item no ar'}</h2>
        <p className="mt-2 text-xs text-slate-400">{currentItem?.filePath ?? '—'}</p>
      </article>

      <article className="rounded-md border border-cyan-700/60 bg-slate-800 p-4">
        <p className="mb-2 text-xs uppercase tracking-wider text-cyan-300">Preview • Próximo</p>
        <h2 className="truncate text-lg font-semibold text-slate-100">{nextItem?.title ?? 'Sem próximo item'}</h2>
        <p className="mt-2 text-xs text-slate-400">{nextItem?.filePath ?? '—'}</p>
      </article>
    </section>
  );
}
