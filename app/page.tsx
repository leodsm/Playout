'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { InspectorPanel } from '@/components/InspectorPanel';
import { PreviewProgramPanel } from '@/components/PreviewProgramPanel';
import { RundownTable } from '@/components/RundownTable';
import { TopBar } from '@/components/TopBar';
import { useOBSWebSocket } from '@/hooks/useOBSWebSocket';
import { PlaylistItem } from '@/types/playlist';

const PROGRAM_SCENE_NAME = 'PROGRAM';
const MEDIA_INPUT_NAME = 'PLAYOUT_MEDIA';

const INITIAL_PLAYLIST: PlaylistItem[] = [
  {
    id: '1',
    type: 'video',
    title: 'Abertura Jornal Local',
    filePath: 'D:/Videos/abertura_jornal.mp4',
    duration: 45,
    status: 'ready',
    autoNext: true,
  },
  {
    id: '2',
    type: 'video',
    title: 'Comercial Loja Centro',
    filePath: 'D:/Videos/comercial_loja.mp4',
    duration: 30,
    status: 'queued',
    autoNext: true,
  },
  {
    id: '3',
    type: 'live',
    title: 'Entrada ao Vivo - Estúdio A',
    filePath: '',
    duration: 600,
    status: 'queued',
    autoNext: false,
  },
];

export default function Page() {
  const [obsUrl, setObsUrl] = useState('ws://127.0.0.1:4455');
  const [obsPassword, setObsPassword] = useState('');
  const [playlist, setPlaylist] = useState<PlaylistItem[]>(INITIAL_PLAYLIST);
  const [selectedId, setSelectedId] = useState<string | undefined>(INITIAL_PLAYLIST[0]?.id);
  const [busyId, setBusyId] = useState<string | null>(null);

  const { connected, connecting, lastError, call, on, connect, disconnect } = useOBSWebSocket({
    config: { url: obsUrl, password: obsPassword },
    autoConnect: false,
  });

  const selectedItem = useMemo(() => playlist.find((item) => item.id === selectedId), [playlist, selectedId]);
  const currentIndex = useMemo(() => playlist.findIndex((item) => item.status === 'playing'), [playlist]);
  const currentItem = currentIndex >= 0 ? playlist[currentIndex] : undefined;
  const nextItem = currentIndex >= 0 ? playlist[currentIndex + 1] : playlist[0];

  const patchItem = useCallback((id: string, patch: Partial<PlaylistItem>) => {
    setPlaylist((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }, []);

  const markPlaying = useCallback((playingId: string) => {
    setPlaylist((prev) =>
      prev.map((item) => {
        if (item.id === playingId) return { ...item, status: 'playing' };
        if (item.status === 'playing') return { ...item, status: 'played' };
        if (item.status === 'ready') return { ...item, status: 'queued' };
        return item;
      }),
    );
  }, []);

  const takeItem = useCallback(
    async (item: PlaylistItem) => {
      if (!connected) return;

      setBusyId(item.id);
      try {
        if (item.type === 'video') {
          await call('SetInputSettings', {
            inputName: MEDIA_INPUT_NAME,
            inputSettings: { local_file: item.filePath },
            overlay: false,
          });
        }

        await call('SetCurrentProgramScene', {
          sceneName: PROGRAM_SCENE_NAME,
        });

        markPlaying(item.id);
      } finally {
        setBusyId(null);
      }
    },
    [call, connected, markPlaying],
  );

  const cueItem = useCallback(
    async (item: PlaylistItem) => {
      if (!connected || item.type !== 'video') return;

      setBusyId(item.id);
      try {
        await call('SetInputSettings', {
          inputName: MEDIA_INPUT_NAME,
          inputSettings: { local_file: item.filePath },
          overlay: false,
        });

        setPlaylist((prev) => prev.map((entry) => (entry.id === item.id ? { ...entry, status: 'ready' } : entry)));
      } finally {
        setBusyId(null);
      }
    },
    [call, connected],
  );

  const playNextAutomatic = useCallback(async () => {
    setPlaylist((prev) => {
      const nowPlaying = prev.find((item) => item.status === 'playing');
      if (!nowPlaying || !nowPlaying.autoNext) return prev;

      const currentIdxLocal = prev.findIndex((item) => item.id === nowPlaying.id);
      const candidate = prev.slice(currentIdxLocal + 1).find((item) => item.type === 'video' || item.type === 'graphic');
      if (!candidate) return prev;

      void takeItem(candidate);
      return prev;
    });
  }, [takeItem]);

  useEffect(() => {
    const unsubscribe = on('MediaInputPlaybackEnded', () => {
      void playNextAutomatic();
    });

    return unsubscribe;
  }, [on, playNextAutomatic]);

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100">
      <TopBar connected={connected} />

      <div className="grid grid-cols-12 gap-4 p-4">
        <section className="col-span-9 space-y-4">
          <div className="rounded-md border border-slate-700 bg-slate-800 p-3">
            <div className="grid grid-cols-[1fr_1fr_auto_auto] gap-3">
              <input
                value={obsUrl}
                onChange={(e) => setObsUrl(e.target.value)}
                placeholder="ws://127.0.0.1:4455"
                className="rounded border border-slate-600 bg-slate-900 px-3 py-2 text-sm"
              />
              <input
                value={obsPassword}
                onChange={(e) => setObsPassword(e.target.value)}
                placeholder="Password"
                type="password"
                className="rounded border border-slate-600 bg-slate-900 px-3 py-2 text-sm"
              />
              <button onClick={() => void connect()} className="rounded bg-emerald-700 px-3 py-2 text-xs font-semibold uppercase">
                {connecting ? 'Ligando...' : 'Conectar'}
              </button>
              <button onClick={() => void disconnect()} className="rounded bg-slate-600 px-3 py-2 text-xs font-semibold uppercase">
                Desligar
              </button>
            </div>
            {lastError ? (
              <p className="mt-2 inline-flex items-center gap-2 text-xs text-amber-300">
                <AlertTriangle size={14} />
                {lastError}
              </p>
            ) : null}
          </div>

          <PreviewProgramPanel currentItem={currentItem} nextItem={nextItem} />

          <RundownTable
            items={playlist}
            selectedId={selectedId}
            busyId={busyId}
            onSelectItem={(item) => setSelectedId(item.id)}
            onTakeItem={takeItem}
            onCueItem={cueItem}
          />
        </section>

        <section className="col-span-3">
          <InspectorPanel item={selectedItem} onPatchItem={patchItem} />
        </section>
      </div>
    </main>
  );
}
