'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import OBSWebSocket, { EventSubscription, OBSRequestTypes } from 'obs-websocket-js';

export interface OBSConnectionConfig {
  url: string;
  password?: string;
}

interface UseOBSWebSocketOptions {
  config: OBSConnectionConfig;
  autoConnect?: boolean;
  reconnectIntervalMs?: number;
  maxReconnectAttempts?: number;
  eventSubscriptions?: number;
}

export function useOBSWebSocket({
  config,
  autoConnect = true,
  reconnectIntervalMs = 3000,
  maxReconnectAttempts = Number.POSITIVE_INFINITY,
  eventSubscriptions = EventSubscription.General | EventSubscription.Inputs | EventSubscription.Scenes,
}: UseOBSWebSocketOptions) {
  const obsRef = useRef<OBSWebSocket | null>(null);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);

  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const clearReconnectTimer = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  }, []);

  const disconnect = useCallback(async () => {
    clearReconnectTimer();
    reconnectAttemptsRef.current = 0;

    if (!obsRef.current) return;

    try {
      await obsRef.current.disconnect();
    } catch {
      // noop
    }

    setConnected(false);
    setConnecting(false);
  }, [clearReconnectTimer]);

  const connect = useCallback(async () => {
    if (connecting || connected) return;

    setConnecting(true);

    try {
      if (!obsRef.current) {
        obsRef.current = new OBSWebSocket();
      }

      await obsRef.current.connect(config.url, config.password, {
        eventSubscriptions,
      });

      reconnectAttemptsRef.current = 0;
      setConnected(true);
      setLastError(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha desconhecida ao ligar ao OBS';
      setLastError(message);
      setConnected(false);

      if (reconnectAttemptsRef.current < maxReconnectAttempts) {
        reconnectAttemptsRef.current += 1;
        clearReconnectTimer();
        reconnectTimerRef.current = setTimeout(() => {
          setConnecting(false);
          void connect();
        }, reconnectIntervalMs);
      }
    } finally {
      setConnecting(false);
    }
  }, [clearReconnectTimer, config.password, config.url, connected, connecting, eventSubscriptions, maxReconnectAttempts, reconnectIntervalMs]);

  useEffect(() => {
    if (!obsRef.current) {
      obsRef.current = new OBSWebSocket();
    }

    const obs = obsRef.current;

    const onClosed = () => {
      setConnected(false);

      if (reconnectAttemptsRef.current < maxReconnectAttempts) {
        reconnectAttemptsRef.current += 1;
        clearReconnectTimer();
        reconnectTimerRef.current = setTimeout(() => {
          void connect();
        }, reconnectIntervalMs);
      }
    };

    obs.on('ConnectionClosed', onClosed);

    if (autoConnect) {
      void connect();
    }

    return () => {
      obs.off('ConnectionClosed', onClosed);
      void disconnect();
    };
  }, [autoConnect, clearReconnectTimer, connect, disconnect, maxReconnectAttempts, reconnectIntervalMs]);

  const call = useCallback(
    async <T extends keyof OBSRequestTypes>(requestType: T, requestData?: OBSRequestTypes[T]) => {
      if (!obsRef.current) {
        throw new Error('Cliente OBS não inicializado');
      }

      return obsRef.current.call(requestType, requestData);
    },
    [],
  );

  const on = useCallback((eventName: string, callback: (data: unknown) => void) => {
    if (!obsRef.current) return () => {};

    obsRef.current.on(eventName, callback);
    return () => {
      obsRef.current?.off(eventName, callback);
    };
  }, []);

  return useMemo(
    () => ({
      connected,
      connecting,
      lastError,
      connect,
      disconnect,
      call,
      on,
    }),
    [call, connect, connected, connecting, disconnect, lastError, on],
  );
}
