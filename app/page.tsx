'use client';

import { useEffect, useMemo, useState } from 'react';
import { Activity, Link2, Link2Off, RadioTower, Tv } from 'lucide-react';
import { RundownTable } from '@/components/RundownTable';
import { useOBSWebSocket } from '@/hooks/useOBSWebSocket';
import { PlaylistItem } from '@/types/playlist';

const OBS_CONFIG = {
  url: 'ws://127.0.0.1:4455',
  password: '',
  mediaInputName: 'VIDEO_PLAYER_A',
  programSceneName: 'PGM_MAIN',
};

const initialPlaylist: PlaylistItem[] = [
  {
    id: '1',
    type: 'video',
    title: 'Abertura Jornal Local',
    filePath: 'D:/Videos/abertura_jornal.mp4',
    duration: 37,
    status: 'ready',
    autoNext: true,
  },
  {
    id: '2',
    type: 'video',
    title: 'Bloco Comercial 01',
    filePath: 'D:/Videos/comercial_bloco_01.mp4',
    duration: 180,
    status: 'queued',
    autoNext: true,
  },
  {
    id: '3',
    type: 'live',
    title: 'Live Estúdio Câmera 1',
    filePath: '',
    duration: 900,
    status: 'queued',
    autoNext: false,
  },
];

export default function HomePage() {
  const [playlist, setPlaylist] = useState<PlaylistItem[]>(initialPlaylist);
  const [selectedId, setSelectedId] = useState<string | null>(playlist[0]?.id ?? null);
  const [clock, setClock] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const playItem = async (item: PlaylistItem) => {
    if (item.type !== 'video') return;

    await setMediaFileAndTake(item.filePath);
    setPlaylist((prev) =>
      prev.map((entry) => ({
        ...entry,
        status:
          entry.id === item.id ? 'playing' : entry.status === 'playing' ? 'played' : entry.status,
      })),
    );
  };

  const playNextAuto = async () => {
    const currentIndex = playlist.findIndex((item) => item.status === 'playing');
    const nextItem = playlist[currentIndex + 1];

    if (nextItem && nextItem.autoNext && nextItem.type === 'video') {
      await playItem(nextItem);
    }
  };

  const { isConnected, isConnecting, lastError, reconnect, setMediaFileAndTake } = useOBSWebSocket({
    ...OBS_CONFIG,
    onPlaybackEnded: () => {
      void playNextAuto();
    },
  });

  const selectedItem = useMemo(
    () => playlist.find((item) => item.id === selectedId) ?? null,
    [playlist, selectedId],
  );

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <header className="h-16 border-b border-slate-800 bg-slate-900 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Tv className="h-6 w-6 text-red-500" />
          <div>
            <p className="font-semibold">TV Marília · Canal 15</p>
            <p className="text-xs text-slate-400">Web Playout Controller</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <p className="font-mono text-xl">{clock.toLocaleTimeString('pt-BR')}</p>
          <button
            className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm ${
              isConnected ? 'bg-emerald-700/50 text-emerald-300' : 'bg-red-700/50 text-red-300'
            }`}
            onClick={() => void reconnect()}
          >
            {isConnected ? <Link2 className="h-4 w-4" /> : <Link2Off className="h-4 w-4" />}
            {isConnecting ? 'A ligar...' : isConnected ? 'Conectado ao OBS' : 'Desconectado'}
          </button>
        </div>
      </header>

      <section className="grid grid-cols-12 gap-4 p-4">
        <div className="col-span-9 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">
              <div className="flex items-center justify-between text-slate-300 text-xs uppercase">
                <span>Program · No Ar</span>
                <RadioTower className="h-4 w-4 text-red-500" />
              </div>
              <p className="mt-3 text-lg font-semibold text-red-400">
                {playlist.find((item) => item.status === 'playing')?.title ?? '---'}
              </p>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">
              <div className="flex items-center justify-between text-slate-300 text-xs uppercase">
                <span>Preview · Próximo</span>
                <Activity className="h-4 w-4 text-sky-400" />
              </div>
              <p className="mt-3 text-lg font-semibold text-sky-300">
                {playlist.find((item) => item.status === 'queued')?.title ?? '---'}
              </p>
            </div>
          </div>

          <RundownTable
            items={playlist}
            selectedId={selectedId}
            onSelect={(item) => setSelectedId(item.id)}
            onCue={(item) => {
              setPlaylist((prev) =>
                prev.map((entry) => ({
                  ...entry,
                  status: entry.id === item.id ? 'ready' : entry.status,
                })),
              );
            }}
            onTake={(item) => {
              void playItem(item);
            }}
          />
        </div>

        <aside className="col-span-3 rounded-xl border border-slate-700 bg-slate-900 p-4">
          <h2 className="mb-4 text-sm uppercase tracking-wide text-slate-300">Inspector</h2>
          {selectedItem ? (
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-slate-400">Título</p>
                <p className="font-medium">{selectedItem.title}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Tipo</p>
                <p className="font-medium uppercase">{selectedItem.type}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Caminho do ficheiro</p>
                <input
                  className="mt-1 w-full rounded-md border border-slate-700 bg-slate-800 p-2 text-xs"
                  value={selectedItem.filePath}
                  onChange={(e) => {
                    const value = e.target.value;
                    setPlaylist((prev) =>
                      prev.map((entry) =>
                        entry.id === selectedItem.id ? { ...entry, filePath: value } : entry,
                      ),
                    );
                  }}
                />
              </div>
              {lastError && <p className="rounded-md bg-red-900/40 p-2 text-red-300">{lastError}</p>}
            </div>
          ) : (
            <p className="text-slate-400">Selecione um item da grelha para editar.</p>
          )}
        </aside>
      </section>
    </main>
  );
}
