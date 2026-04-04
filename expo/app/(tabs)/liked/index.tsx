import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Heart, Radio } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { colors, spacing, radius } from '@/constants/theme';
import { useMusic } from '@/providers/MusicProvider';
import { Track } from '@/constants/types';

export default function LikedScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { likedSongs } = useMusic();

  const handleTrackPress = useCallback((track: Track) => {
    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push({ pathname: '/artist', params: { name: track.artist_name } });
  }, [router]);

  const renderTrack = useCallback(({ item, index }: { item: Track; index: number }) => (
    <TouchableOpacity
      style={styles.trackRow}
      onPress={() => handleTrackPress(item)}
      activeOpacity={0.8}
    >
      <View style={[styles.trackIndex, index < 3 && styles.trackIndexTop]}>
        <Text style={[styles.trackIndexText, index < 3 && styles.trackIndexTextTop]}>
          {String(index + 1).padStart(2, '0')}
        </Text>
      </View>
      <View style={styles.trackInfo}>
        <Text style={styles.trackTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.trackArtist} numberOfLines={1}>{item.artist_name}</Text>
      </View>
      <View style={styles.trackAction}>
        <Radio size={16} color={colors.electricViolet} />
      </View>
    </TouchableOpacity>
  ), [handleTrackPress]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Heart size={20} color={colors.hotPink} fill={colors.hotPink} />
        <Text style={styles.headerTitle}>LIKED SONGS</Text>
      </View>
      <Text style={styles.headerSub}>
        Tap any track to start a station from that artist
      </Text>

      {likedSongs.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Heart size={40} color={colors.textMuted} />
          </View>
          <Text style={styles.emptyTitle}>No liked songs yet</Text>
          <Text style={styles.emptySub}>
            Start a station and like tracks{'\n'}to build your collection
          </Text>
        </View>
      ) : (
        <FlatList
          data={likedSongs}
          keyExtractor={(item) => item.source_track_id}
          renderItem={renderTrack}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '900' as const,
    color: colors.offWhite,
    letterSpacing: 2,
  },
  headerSub: {
    fontSize: 12,
    color: colors.textMuted,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.surfaceBorder,
  },
  trackIndex: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackIndexTop: {
    backgroundColor: colors.electricViolet + '25',
  },
  trackIndexText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: colors.textMuted,
  },
  trackIndexTextTop: {
    color: colors.electricViolet,
  },
  trackInfo: {
    flex: 1,
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.textPrimary,
  },
  trackArtist: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  trackAction: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: colors.offWhite,
    marginBottom: spacing.sm,
  },
  emptySub: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
