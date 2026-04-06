import { useState, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import createContextHook from '@nkzw/create-context-hook';
import { Track, Station, StationHistory, Feedback } from '@/constants/types';
import { STAFF_PICKS } from '@/constants/mock-data';
import { generateStation } from '@/lib/spotify';

const LIKED_KEY = '@under8ted_liked';
const HISTORY_KEY = '@under8ted_history';
const FEEDBACK_KEY = '@under8ted_feedback';
const SPOTIFY_TOKEN_KEY = '@under8ted_spotify_token';

export const [MusicProvider, useMusic] = createContextHook(() => {
  const [station, setStation] = useState<Station | null>(null);
  const [isStationLoading, setIsStationLoading] = useState<boolean>(false);
  const [spotifyToken, setSpotifyTokenState] = useState<string>('');
  const queryClient = useQueryClient();

  useQuery({
    queryKey: ['spotify-token-restore'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(SPOTIFY_TOKEN_KEY);
      if (stored) {
        console.log('[Music] Restored Spotify token from storage');
        setSpotifyTokenState(stored);
      }
      return stored ?? '';
    },
  });

  const setSpotifyToken = useCallback(async (token: string) => {
    console.log('[Music] Setting Spotify token');
    setSpotifyTokenState(token);
    await AsyncStorage.setItem(SPOTIFY_TOKEN_KEY, token);
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

    if (spotifyToken && artistId) {
      tracks = await generateStation(artistId, artistName, spotifyToken);
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
  }, [historyQuery.data, queryClient, spotifyToken]);

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
  }), [
    station, currentTrack, isStationLoading, likedQuery.data,
    historyQuery.data, staffPicks, startStation, skipTrack,
    feedbackMutation.mutate, likeMutation.mutate, closeStation, isLiked,
    spotifyToken, setSpotifyToken,
  ]);
});
