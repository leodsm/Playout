export interface PlaylistItem {
  id: string;
  type: 'video' | 'live' | 'graphic';
  title: string;
  filePath: string;
  duration: number;
  status: 'played' | 'playing' | 'ready' | 'queued';
  autoNext: boolean;
}

export const formatDuration = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  if (h > 0) {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};
