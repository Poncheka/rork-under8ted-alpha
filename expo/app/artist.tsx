import React, { useRef, useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Zap, Radio, Disc3, AlertCircle, Search } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { colors, spacing, radius } from '@/constants/theme';
import { useMusic } from '@/providers/MusicProvider';
import { searchArtists } from '@/lib/spotify';

export default function ArtistScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { name, artistId: paramArtistId, imageUrl } = useLocalSearchParams<{ name: string; artistId?: string; imageUrl?: string }>();
  const { startStation, isStationLoading, spotifyToken } = useMusic();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const [resolvedArtistId, setResolvedArtistId] = useState<string>(paramArtistId ?? '');
  const [resolvedImage, setResolvedImage] = useState<string>(imageUrl ?? '');
  const [isResolving, setIsResolving] = useState<boolean>(false);
  const [stationError, setStationError] = useState<string>('');

  const artistName = name || 'Unknown Artist';
  const hasToken = spotifyToken.length > 0;

  useEffect(() => {
    if (!paramArtistId && hasToken && artistName !== 'Unknown Artist') {
      setIsResolving(true);
      console.log('[Artist] Resolving artist ID for:', artistName);
      searchArtists(artistName, spotifyToken).then(results => {
        if (results.length > 0) {
          const match = results.find(a => a.name.toLowerCase() === artistName.toLowerCase()) ?? results[0];
          console.log('[Artist] Resolved to:', match.name, match.id);
          setResolvedArtistId(match.id);
          if (match.images?.[0]?.url) {
            setResolvedImage(match.images[0].url);
          }
        }
        setIsResolving(false);
      }).catch(() => setIsResolving(false));
    }
  }, [paramArtistId, hasToken, artistName, spotifyToken]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 8, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  const handleStartStation = useCallback(async () => {
    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
    setStationError('');

    if (!hasToken) {
      setStationError('Connect Spotify to start a station. Set your token in settings.');
      return;
    }

    if (!resolvedArtistId) {
      setStationError('Could not find this artist on Spotify. Try searching from the home screen.');
      return;
    }

    const success = await startStation(artistName, resolvedArtistId);
    if (success) {
      router.push('/station');
    } else {
      setStationError('No deep cuts found for this artist. Try another one.');
    }
  }, [artistName, resolvedArtistId, startStation, router, hasToken]);

  const initials = artistName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => router.back()}
        activeOpacity={0.7}
      >
        <ArrowLeft size={20} color={colors.textSecondary} />
      </TouchableOpacity>

      <Animated.View
        style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}
      >
        <View style={styles.artistCard}>
          {resolvedImage ? (
            <Image source={{ uri: resolvedImage }} style={styles.artistImage} />
          ) : (
            <View style={styles.avatarShape}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          )}

          <Text style={styles.artistName}>{artistName}</Text>

          <View style={styles.metaRow}>
            {isResolving ? (
              <View style={styles.metaChip}>
                <ActivityIndicator size={12} color={colors.electricViolet} />
                <Text style={styles.metaText}>Looking up artist...</Text>
              </View>
            ) : resolvedArtistId ? (
              <>
                <View style={styles.metaChip}>
                  <Disc3 size={12} color={colors.electricViolet} />
                  <Text style={styles.metaText}>Spotify linked</Text>
                </View>
                <View style={styles.metaChip}>
                  <Radio size={12} color={colors.icyBlue} />
                  <Text style={styles.metaText}>AI curated</Text>
                </View>
              </>
            ) : (
              <View style={styles.metaChip}>
                <Search size={12} color={colors.textMuted} />
                <Text style={styles.metaText}>
                  {hasToken ? 'Artist not found on Spotify' : 'Spotify not connected'}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.divider} />

          <Text style={styles.description}>
            Under8ted will scan this artist's catalog and surface only the deep cuts — no obvious hits, no filler. Pure hidden gems.
          </Text>
        </View>

        {stationError.length > 0 && (
          <View style={styles.errorBanner}>
            <AlertCircle size={16} color={colors.error} />
            <Text style={styles.errorText}>{stationError}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.startBtn,
            (isStationLoading || isResolving) && styles.startBtnLoading,
            (!hasToken || !resolvedArtistId) && !isResolving && styles.startBtnDisabled,
          ]}
          onPress={handleStartStation}
          disabled={isStationLoading || isResolving}
          activeOpacity={0.85}
          testID="start-station-btn"
        >
          {isStationLoading ? (
            <ActivityIndicator size={18} color={colors.bg} />
          ) : (
            <Zap size={20} color={colors.bg} />
          )}
          <Text style={styles.startBtnText}>
            {isStationLoading ? 'BUILDING STATION...' : isResolving ? 'LOOKING UP ARTIST...' : 'START UNDER8TED STATION'}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.lg,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: spacing.xxl,
  },
  artistCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  artistImage: {
    width: 72,
    height: 72,
    borderRadius: 20,
    marginBottom: spacing.lg,
    backgroundColor: colors.surface,
  },
  avatarShape: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: colors.electricViolet + '20',
    borderWidth: 2,
    borderColor: colors.electricViolet + '40',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '900' as const,
    color: colors.electricViolet,
    letterSpacing: -1,
  },
  artistName: {
    fontSize: 30,
    fontWeight: '900' as const,
    color: colors.offWhite,
    letterSpacing: -1.5,
    marginBottom: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    flexWrap: 'wrap',
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
  },
  metaText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.surfaceBorder,
    marginBottom: spacing.md,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 21,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.error + '15',
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.error + '30',
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: colors.error,
    fontWeight: '500' as const,
    lineHeight: 18,
  },
  startBtn: {
    backgroundColor: colors.acidYellow,
    height: 60,
    borderRadius: radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  startBtnLoading: {
    opacity: 0.6,
  },
  startBtnDisabled: {
    opacity: 0.4,
  },
  startBtnText: {
    fontSize: 15,
    fontWeight: '900' as const,
    color: colors.bg,
    letterSpacing: 1,
  },
});
