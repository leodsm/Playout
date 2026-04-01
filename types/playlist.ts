export type PlaylistItemType = 'video' | 'live' | 'graphic';
export type PlaylistItemStatus = 'played' | 'playing' | 'ready' | 'queued';

export interface PlaylistItem {
  id: string;
  type: PlaylistItemType;
  title: string;
  filePath: string;
  duration: number;
  status: PlaylistItemStatus;
  autoNext: boolean;
}
