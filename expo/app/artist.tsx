import React, { useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Zap, Radio, Disc3 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { colors, spacing, radius } from '@/constants/theme';
import { useMusic } from '@/providers/MusicProvider';
import { getTracksForArtist } from '@/constants/mock-data';

export default function ArtistScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { name } = useLocalSearchParams<{ name: string }>();
  const { startStation, isStationLoading } = useMusic();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  const artistName = name || 'Unknown Artist';
  const tracks = getTracksForArtist(artistName);

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
    await startStation(artistName);
    router.push('/station');
  }, [artistName, startStation, router]);

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
          <View style={styles.avatarShape}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>

          <Text style={styles.artistName}>{artistName}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaChip}>
              <Disc3 size={12} color={colors.electricViolet} />
              <Text style={styles.metaText}>{tracks.length} deep cuts found</Text>
            </View>
            <View style={styles.metaChip}>
              <Radio size={12} color={colors.icyBlue} />
              <Text style={styles.metaText}>AI curated</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.description}>
            Under8ted will scan this artist's catalog and surface only the deep cuts — no obvious hits, no filler. Pure hidden gems.
          </Text>

          <View style={styles.trackPreview}>
            <Text style={styles.trackPreviewLabel}>SAMPLE TRACKS</Text>
            {tracks.slice(0, 3).map((track, idx) => (
              <View key={track.id} style={styles.trackPreviewRow}>
                <Text style={styles.trackPreviewNum}>{String(idx + 1).padStart(2, '0')}</Text>
                <Text style={styles.trackPreviewTitle} numberOfLines={1}>{track.title}</Text>
                <Text style={styles.trackPreviewAlbum} numberOfLines={1}>{track.album_name}</Text>
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.startBtn, isStationLoading && styles.startBtnLoading]}
          onPress={handleStartStation}
          disabled={isStationLoading}
          activeOpacity={0.85}
          testID="start-station-btn"
        >
          <Zap size={20} color={colors.bg} />
          <Text style={styles.startBtnText}>
            {isStationLoading ? 'BUILDING STATION...' : 'START UNDER8TED STATION'}
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
    marginBottom: spacing.lg,
  },
  trackPreview: {
    gap: spacing.sm,
  },
  trackPreviewLabel: {
    fontSize: 10,
    fontWeight: '800' as const,
    color: colors.textMuted,
    letterSpacing: 2,
    marginBottom: spacing.xs,
  },
  trackPreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  trackPreviewNum: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: colors.textMuted,
    width: 20,
  },
  trackPreviewTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.textPrimary,
    flex: 1,
  },
  trackPreviewAlbum: {
    fontSize: 12,
    color: colors.textMuted,
    maxWidth: 100,
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
  startBtnText: {
    fontSize: 15,
    fontWeight: '900' as const,
    color: colors.bg,
    letterSpacing: 1,
  },
});
