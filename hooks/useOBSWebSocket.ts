'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import OBSWebSocket, { EventSubscription } from 'obs-websocket-js';

interface UseOBSWebSocketParams {
  url: string;
  password?: string;
  mediaInputName: string;
  programSceneName: string;
  reconnectIntervalMs?: number;
  onPlaybackEnded?: () => void;
}

export function useOBSWebSocket({
  url,
  password,
  mediaInputName,
  programSceneName,
  reconnectIntervalMs = 3000,
  onPlaybackEnded,
}: UseOBSWebSocketParams) {
  const obsRef = useRef<OBSWebSocket | null>(null);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const shouldReconnectRef = useRef(true);

  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const clearReconnectTimer = () => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  };

  const scheduleReconnect = useCallback(() => {
    clearReconnectTimer();
    if (!shouldReconnectRef.current) return;

    reconnectTimerRef.current = setTimeout(() => {
      void connect();
    }, reconnectIntervalMs);
  }, [reconnectIntervalMs]);

  const connect = useCallback(async () => {
    if (isConnecting) return;

    try {
      setIsConnecting(true);
      setLastError(null);

      if (!obsRef.current) {
        obsRef.current = new OBSWebSocket();
      }

      const obs = obsRef.current;
      obs.removeAllListeners();

      obs.on('ConnectionClosed', () => {
        setIsConnected(false);
        scheduleReconnect();
      });

      obs.on('MediaInputPlaybackEnded', (event) => {
        if (event.inputName === mediaInputName) {
          onPlaybackEnded?.();
        }
      });

      await obs.connect(url, password, {
        eventSubscriptions: EventSubscription.General | EventSubscription.Inputs,
      });

      setIsConnected(true);
    } catch (error) {
      setIsConnected(false);
      setLastError(error instanceof Error ? error.message : 'Erro ao ligar ao OBS');
      scheduleReconnect();
    } finally {
      setIsConnecting(false);
    }
  }, [isConnecting, mediaInputName, onPlaybackEnded, password, scheduleReconnect, url]);

  useEffect(() => {
    shouldReconnectRef.current = true;
    void connect();

    return () => {
      shouldReconnectRef.current = false;
      clearReconnectTimer();
      obsRef.current?.disconnect();
      obsRef.current = null;
    };
  }, [connect]);

  const setMediaFileAndTake = useCallback(
    async (filePath: string) => {
      if (!obsRef.current || !isConnected) {
        throw new Error('OBS desconectado.');
      }

      await obsRef.current.call('SetInputSettings', {
        inputName: mediaInputName,
        inputSettings: { local_file: filePath },
      });

      await obsRef.current.call('SetCurrentProgramScene', {
        sceneName: programSceneName,
      });
    },
    [isConnected, mediaInputName, programSceneName],
  );

  const value = useMemo(
    () => ({
      isConnected,
      isConnecting,
      lastError,
      reconnect: connect,
      setMediaFileAndTake,
    }),
    [connect, isConnected, isConnecting, lastError, setMediaFileAndTake],
  );

  return value;
}
