import { useState, useCallback, useMemo, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import createContextHook from '@nkzw/create-context-hook';
import { Track, Station, StationHistory, Feedback } from '@/constants/types';
import { STAFF_PICKS } from '@/constants/mock-data';
import { generateStation } from '@/lib/spotify';
import { spotifyLogin, spotifyRefreshToken, SpotifyTokenResult } from '@/lib/spotify-auth';

const LIKED_KEY = '@under8ted_liked';
const HISTORY_KEY = '@under8ted_history';
const FEEDBACK_KEY = '@under8ted_feedback';
const SPOTIFY_TOKEN_KEY = '@under8ted_spotify_token';
const SPOTIFY_REFRESH_KEY = '@under8ted_spotify_refresh';
const SPOTIFY_EXPIRES_KEY = '@under8ted_spotify_expires';

export const [MusicProvider, useMusic] = createContextHook(() => {
  const [station, setStation] = useState<Station | null>(null);
  const [isStationLoading, setIsStationLoading] = useState<boolean>(false);
  const [spotifyToken, setSpotifyTokenState] = useState<string>('');
  const [refreshTokenValue, setRefreshTokenValue] = useState<string>('');
  const [tokenExpiresAt, setTokenExpiresAt] = useState<number>(0);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const refreshingRef = useRef<boolean>(false);
  const queryClient = useQueryClient();

  useQuery({
    queryKey: ['spotify-token-restore'],
    queryFn: async () => {
      try {
        const [storedToken, storedRefresh, storedExpires] = await Promise.all([
          AsyncStorage.getItem(SPOTIFY_TOKEN_KEY),
          AsyncStorage.getItem(SPOTIFY_REFRESH_KEY),
          AsyncStorage.getItem(SPOTIFY_EXPIRES_KEY),
        ]);
        if (storedToken) {
          console.log('[Music] Restored Spotify token from storage');
          setSpotifyTokenState(storedToken);
        }
        if (storedRefresh) {
          setRefreshTokenValue(storedRefresh);
        }
        if (storedExpires) {
          setTokenExpiresAt(parseInt(storedExpires, 10));
        }
        return storedToken ?? '';
      } catch (err) {
        console.warn('[Music] Error restoring Spotify tokens:', err);
        return '';
      }
    },
  });

  const saveTokens = useCallback(async (result: SpotifyTokenResult) => {
    setSpotifyTokenState(result.accessToken);
    setRefreshTokenValue(result.refreshToken);
    setTokenExpiresAt(result.expiresAt);
    await Promise.all([
      AsyncStorage.setItem(SPOTIFY_TOKEN_KEY, result.accessToken),
      AsyncStorage.setItem(SPOTIFY_REFRESH_KEY, result.refreshToken),
      AsyncStorage.setItem(SPOTIFY_EXPIRES_KEY, result.expiresAt.toString()),
    ]);
  }, []);

  const ensureValidToken = useCallback(async (): Promise<string> => {
    if (!spotifyToken || !refreshTokenValue) return spotifyToken;

    const buffer = 5 * 60 * 1000;
    if (tokenExpiresAt > 0 && Date.now() > tokenExpiresAt - buffer) {
      if (refreshingRef.current) return spotifyToken;
      refreshingRef.current = true;
      console.log('[Music] Token expiring soon, refreshing...');
      try {
        const result = await spotifyRefreshToken(refreshTokenValue);
        if (result) {
          await saveTokens(result);
          console.log('[Music] Token refreshed successfully');
          refreshingRef.current = false;
          return result.accessToken;
        }
      } catch (err) {
        console.warn('[Music] Token refresh failed:', err);
      }
      refreshingRef.current = false;
    }
    return spotifyToken;
  }, [spotifyToken, refreshTokenValue, tokenExpiresAt, saveTokens]);

  const setSpotifyToken = useCallback(async (token: string) => {
    console.log('[Music] Setting Spotify token');
    setSpotifyTokenState(token);
    await AsyncStorage.setItem(SPOTIFY_TOKEN_KEY, token);
  }, []);

  const connectSpotify = useCallback(async (): Promise<boolean> => {
    console.log('[Music] Starting Spotify OAuth flow...');
    setIsConnecting(true);
    try {
      const result = await spotifyLogin();
      if (result) {
        await saveTokens(result);
        console.log('[Music] Spotify connected successfully');
        setIsConnecting(false);
        return true;
      }
      console.log('[Music] Spotify auth was cancelled or failed');
      setIsConnecting(false);
      return false;
    } catch (err) {
      console.warn('[Music] connectSpotify error:', err);
      setIsConnecting(false);
      return false;
    }
  }, [saveTokens]);

  const disconnectSpotify = useCallback(async () => {
    console.log('[Music] Disconnecting Spotify...');
    setSpotifyTokenState('');
    setRefreshTokenValue('');
    setTokenExpiresAt(0);
    await Promise.all([
      AsyncStorage.removeItem(SPOTIFY_TOKEN_KEY),
      AsyncStorage.removeItem(SPOTIFY_REFRESH_KEY),
      AsyncStorage.removeItem(SPOTIFY_EXPIRES_KEY),
    ]);
  }, []);

  const likedQuery = useQuery({
    queryKey: ['liked-songs'],
    queryFn: async (): Promise<Track[]> => {
      const stored = await AsyncStorage.getItem(LIKED_KEY);
      return stored ? JSON.parse(stored) : [];
    },
  });

  const historyQuery = useQuery({
    queryKey: ['station-history'],
    queryFn: async (): Promise<StationHistory[]> => {
      const stored = await AsyncStorage.getItem(HISTORY_KEY);
      return stored ? JSON.parse(stored) : [];
    },
  });

  const feedbackQuery = useQuery({
    queryKey: ['feedback'],
    queryFn: async (): Promise<Feedback[]> => {
      const stored = await AsyncStorage.getItem(FEEDBACK_KEY);
      return stored ? JSON.parse(stored) : [];
    },
  });

  const likeMutation = useMutation({
    mutationFn: async (track: Track) => {
      const current = likedQuery.data ?? [];
      const exists = current.find(t => t.source_track_id === track.source_track_id);
      if (exists) return current;
      const updated = [track, ...current];
      await AsyncStorage.setItem(LIKED_KEY, JSON.stringify(updated));
      return updated;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['liked-songs'], data);
    },
  });

  const feedbackMutation = useMutation({
    mutationFn: async ({ track, type }: { track: Track; type: 'like' | 'dislike' | 'skip' }) => {
      const current = feedbackQuery.data ?? [];
      const entry: Feedback = {
        id: `fb_${Date.now()}`,
        user_id: '',
        source_track_id: track.source_track_id,
        vote_type: type,
        created_at: new Date().toISOString(),
      };
      const updated = [entry, ...current];
      await AsyncStorage.setItem(FEEDBACK_KEY, JSON.stringify(updated));
      if (type === 'like') {
        void likeMutation.mutateAsync(track);
      }
      return updated;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['feedback'], data);
    },
  });

  const startStation = useCallback(async (artistName: string, artistId?: string) => {
    console.log('[Music] Starting station for:', artistName, 'id:', artistId);
    setIsStationLoading(true);

    let tracks: Track[] = [];

    const validToken = await ensureValidToken();

    if (validToken && artistId) {
      tracks = await generateStation(artistId, artistName, validToken);
    }

    if (tracks.length === 0) {
      console.log('[Music] No tracks from Spotify, using fallback empty state');
      setIsStationLoading(false);
      return false;
    }

    const newStation: Station = {
      seed_artist_name: artistName,
      tracks,
      currentIndex: 0,
    };
    setStation(newStation);
    setIsStationLoading(false);

    const historyEntry: StationHistory = {
      id: `sh_${Date.now()}`,
      user_id: '',
      seed_artist_name: artistName,
      created_at: new Date().toISOString(),
    };
    const current = historyQuery.data ?? [];
    const existingIdx = current.findIndex(h => h.seed_artist_name.toLowerCase() === artistName.toLowerCase());
    let updated: StationHistory[];
    if (existingIdx >= 0) {
      updated = [historyEntry, ...current.filter((_, i) => i !== existingIdx)];
    } else {
      updated = [historyEntry, ...current].slice(0, 20);
    }
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    queryClient.setQueryData(['station-history'], updated);

    return true;
  }, [historyQuery.data, queryClient, ensureValidToken]);

  const skipTrack = useCallback(() => {
    if (!station) return;
    const nextIndex = station.currentIndex + 1;
    if (nextIndex >= station.tracks.length) {
      const reshuffled = [...station.tracks].sort(() => Math.random() - 0.5);
      setStation({ ...station, tracks: reshuffled, currentIndex: 0 });
    } else {
      setStation({ ...station, currentIndex: nextIndex });
    }
  }, [station]);

  const closeStation = useCallback(() => setStation(null), []);

  const isLiked = useCallback((trackId: string) => {
    return (likedQuery.data ?? []).some(t => t.source_track_id === trackId);
  }, [likedQuery.data]);

  const currentTrack = useMemo(() => {
    if (!station) return null;
    return station.tracks[station.currentIndex] ?? null;
  }, [station]);

  const staffPicks = STAFF_PICKS;

  const isTokenExpired = useMemo(() => {
    if (!spotifyToken || tokenExpiresAt === 0) return false;
    return Date.now() > tokenExpiresAt;
  }, [spotifyToken, tokenExpiresAt]);

  return useMemo(() => ({
    station,
    currentTrack,
    isStationLoading,
    likedSongs: likedQuery.data ?? [],
    recentStations: historyQuery.data ?? [],
    staffPicks,
    startStation,
    skipTrack,
    recordFeedback: feedbackMutation.mutate,
    likeTrack: likeMutation.mutate,
    isLiked,
    closeStation,
    spotifyToken,
    setSpotifyToken,
    connectSpotify,
    disconnectSpotify,
    isConnecting,
    isTokenExpired,
  }), [
    station, currentTrack, isStationLoading, likedQuery.data,
    historyQuery.data, staffPicks, startStation, skipTrack,
    feedbackMutation.mutate, likeMutation.mutate, closeStation, isLiked,
    spotifyToken, setSpotifyToken, connectSpotify, disconnectSpotify,
    isConnecting, isTokenExpired,
  ]);
});
