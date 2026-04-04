import React, { useRef, useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  X,
  Heart,
  ThumbsDown,
  SkipForward,
  Disc3,
  Radio,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { colors, spacing, radius } from '@/constants/theme';
import { useMusic } from '@/providers/MusicProvider';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function StationScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { station, currentTrack, skipTrack, recordFeedback, isLiked, closeStation } = useMusic();
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [score] = useState<number>(() => Math.floor(Math.random() * 15) + 78);

  useEffect(() => {
    const rotation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 8000,
        useNativeDriver: true,
      })
    );
    rotation.start();
    return () => rotation.stop();
  }, [rotateAnim]);

  useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 9, useNativeDriver: true }),
    ]).start();
  }, [currentTrack?.source_track_id, fadeAnim, slideAnim]);

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handleLike = useCallback(() => {
    if (!currentTrack) return;
    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    recordFeedback({ track: currentTrack, type: 'like' });
  }, [currentTrack, recordFeedback]);

  const handleDislike = useCallback(() => {
    if (!currentTrack) return;
    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    recordFeedback({ track: currentTrack, type: 'dislike' });
    skipTrack();
  }, [currentTrack, recordFeedback, skipTrack]);

  const handleSkip = useCallback(() => {
    if (!currentTrack) return;
    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    recordFeedback({ track: currentTrack, type: 'skip' });
    skipTrack();
  }, [currentTrack, recordFeedback, skipTrack]);

  const handleClose = useCallback(() => {
    closeStation();
    router.back();
  }, [closeStation, router]);

  if (!station || !currentTrack) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No station active</Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={() => router.back()}>
            <Text style={styles.emptyBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const trackLiked = isLiked(currentTrack.source_track_id);
  const trackInitials = currentTrack.title.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.closeBtn} onPress={handleClose} activeOpacity={0.7}>
          <X size={20} color={colors.textSecondary} />
        </TouchableOpacity>
        <View style={styles.stationLabel}>
          <Radio size={12} color={colors.acidYellow} />
          <Text style={styles.stationLabelText}>{station.seed_artist_name} Station</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.mainContent}>
        <Animated.View style={[styles.discContainer, { transform: [{ scale: pulseAnim }] }]}>
          <Animated.View style={[styles.disc, { transform: [{ rotate: spin }] }]}>
            <View style={styles.discInner}>
              <View style={styles.discCenter}>
                <Text style={styles.discText}>{trackInitials}</Text>
              </View>
              <View style={styles.discRing1} />
              <View style={styles.discRing2} />
              <View style={styles.discRing3} />
            </View>
          </Animated.View>
        </Animated.View>

        <Animated.View
          style={[
            styles.trackInfo,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Text style={styles.trackTitle} numberOfLines={2}>{currentTrack.title}</Text>
          <Text style={styles.trackArtist}>{currentTrack.artist_name}</Text>
          <Text style={styles.trackAlbum}>{currentTrack.album_name}</Text>

          <View style={styles.scoreBadge}>
            <Disc3 size={14} color={colors.acidYellow} />
            <Text style={styles.scoreText}>Under8ted Score: {score}</Text>
          </View>
        </Animated.View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.controlBtn}
          onPress={handleDislike}
          activeOpacity={0.75}
          testID="dislike-btn"
        >
          <ThumbsDown size={24} color={colors.textSecondary} />
          <Text style={styles.controlLabel}>NOPE</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlBtnMain, trackLiked && styles.controlBtnLiked]}
          onPress={handleLike}
          activeOpacity={0.75}
          testID="like-btn"
        >
          <Heart
            size={28}
            color={trackLiked ? colors.hotPink : colors.offWhite}
            fill={trackLiked ? colors.hotPink : 'transparent'}
          />
          <Text style={[styles.controlLabel, styles.controlLabelMain, trackLiked && styles.controlLabelLiked]}>
            {trackLiked ? 'LIKED' : 'LIKE'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlBtn}
          onPress={handleSkip}
          activeOpacity={0.75}
          testID="skip-btn"
        >
          <SkipForward size={24} color={colors.textSecondary} />
          <Text style={styles.controlLabel}>SKIP</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.progressRow}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${((station.currentIndex + 1) / station.tracks.length) * 100}%` },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {station.currentIndex + 1} / {station.tracks.length}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stationLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  stationLabelText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  discContainer: {
    marginBottom: spacing.xl,
  },
  disc: {
    width: SCREEN_WIDTH * 0.55,
    height: SCREEN_WIDTH * 0.55,
    borderRadius: SCREEN_WIDTH * 0.275,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surfaceBorder,
  },
  discInner: {
    width: '100%',
    height: '100%',
    borderRadius: SCREEN_WIDTH * 0.275,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  discCenter: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.bg,
    borderWidth: 2,
    borderColor: colors.acidYellow + '50',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  discText: {
    fontSize: 18,
    fontWeight: '900' as const,
    color: colors.acidYellow,
    letterSpacing: -1,
  },
  discRing1: {
    position: 'absolute',
    width: '70%',
    height: '70%',
    borderRadius: 999,
    borderWidth: 0.5,
    borderColor: colors.surfaceBorder,
  },
  discRing2: {
    position: 'absolute',
    width: '85%',
    height: '85%',
    borderRadius: 999,
    borderWidth: 0.5,
    borderColor: colors.surfaceBorder + '60',
  },
  discRing3: {
    position: 'absolute',
    width: '95%',
    height: '95%',
    borderRadius: 999,
    borderWidth: 0.5,
    borderColor: colors.surfaceBorder + '30',
  },
  trackInfo: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  trackTitle: {
    fontSize: 26,
    fontWeight: '900' as const,
    color: colors.offWhite,
    letterSpacing: -1,
    textAlign: 'center',
    lineHeight: 30,
  },
  trackArtist: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.textSecondary,
    marginTop: 2,
  },
  trackAlbum: {
    fontSize: 13,
    color: colors.textMuted,
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
    backgroundColor: colors.acidYellow + '12',
    borderWidth: 1,
    borderColor: colors.acidYellow + '25',
  },
  scoreText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: colors.acidYellow,
    letterSpacing: 0.5,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl + 8,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
  },
  controlBtn: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  controlBtnMain: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 2,
    borderColor: colors.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlBtnLiked: {
    borderColor: colors.hotPink + '60',
    backgroundColor: colors.hotPink + '15',
  },
  controlLabel: {
    fontSize: 9,
    fontWeight: '800' as const,
    color: colors.textMuted,
    letterSpacing: 1.5,
    marginTop: 2,
  },
  controlLabelMain: {
    position: 'absolute',
    bottom: -18,
  },
  controlLabelLiked: {
    color: colors.hotPink,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  progressBar: {
    flex: 1,
    height: 3,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.electricViolet,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: colors.textMuted,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '600' as const,
  },
  emptyBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceElevated,
  },
  emptyBtnText: {
    fontSize: 14,
    color: colors.offWhite,
    fontWeight: '600' as const,
  },
});
