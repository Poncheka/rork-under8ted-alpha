import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, Zap, Clock, ChevronRight, Disc3 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { colors, spacing, radius } from '@/constants/theme';
import { useAuth } from '@/providers/AuthProvider';
import { useMusic } from '@/providers/MusicProvider';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { profile } = useAuth();
  const { staffPicks, recentStations, likedSongs } = useMusic();
  const [searchText, setSearchText] = useState<string>('');
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleSearch = useCallback(() => {
    if (!searchText.trim()) return;
    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    router.push({ pathname: '/artist', params: { name: searchText.trim() } });
  }, [searchText, router]);

  const handleStaffPick = useCallback((artistName: string) => {
    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push({ pathname: '/artist', params: { name: artistName } });
  }, [router]);

  const handleRecentStation = useCallback((artistName: string) => {
    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push({ pathname: '/artist', params: { name: artistName } });
  }, [router]);

  const handleLikedSongTap = useCallback((artistName: string) => {
    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push({ pathname: '/artist', params: { name: artistName } });
  }, [router]);

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.logoMark}>U8</Text>
            <View style={styles.headerRight}>
              <Text style={styles.greeting}>
                {profile?.username ? `@${profile.username}` : 'Welcome'}
              </Text>
            </View>
          </View>

          <View style={styles.heroSection}>
            <Text style={styles.heroTitle}>FIND YOUR{'\n'}DEEP CUTS</Text>
            <Text style={styles.heroSub}>AI-curated underrated songs only</Text>
          </View>

          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Search size={20} color={colors.textMuted} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search an artist..."
                placeholderTextColor={colors.textMuted}
                value={searchText}
                onChangeText={setSearchText}
                onSubmitEditing={handleSearch}
                returnKeyType="search"
                autoCapitalize="none"
                autoCorrect={false}
                testID="artist-search-input"
              />
            </View>
            {searchText.trim().length > 0 && (
              <TouchableOpacity
                style={styles.searchBtn}
                onPress={handleSearch}
                activeOpacity={0.8}
                testID="search-button"
              >
                <Zap size={18} color={colors.bg} />
                <Text style={styles.searchBtnText}>GO</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>STAFF PICKS</Text>
              <View style={styles.sectionBadge}>
                <Disc3 size={12} color={colors.acidYellow} />
              </View>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.picksRow}
            >
              {staffPicks.map((pick, idx) => (
                <TouchableOpacity
                  key={pick.id}
                  style={[
                    styles.pickCard,
                    idx === 0 && styles.pickCardFirst,
                  ]}
                  onPress={() => handleStaffPick(pick.artist_name)}
                  activeOpacity={0.85}
                >
                  <View style={[styles.pickAccent, { backgroundColor: idx % 2 === 0 ? colors.electricViolet : colors.icyBlue }]} />
                  <Text style={styles.pickArtist}>{pick.artist_name}</Text>
                  <Text style={styles.pickBlurb} numberOfLines={2}>{pick.blurb}</Text>
                  <View style={styles.pickCta}>
                    <ChevronRight size={14} color={colors.acidYellow} />
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {recentStations.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>RECENT STATIONS</Text>
                <Clock size={14} color={colors.textSecondary} />
              </View>
              {recentStations.slice(0, 5).map((station) => (
                <TouchableOpacity
                  key={station.id}
                  style={styles.recentRow}
                  onPress={() => handleRecentStation(station.seed_artist_name)}
                  activeOpacity={0.8}
                >
                  <View style={styles.recentDot} />
                  <View style={styles.recentInfo}>
                    <Text style={styles.recentArtist}>{station.seed_artist_name}</Text>
                    <Text style={styles.recentTime}>
                      {new Date(station.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                  <ChevronRight size={16} color={colors.textMuted} />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {likedSongs.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>LIKED SONGS</Text>
                <Text style={styles.sectionCount}>{likedSongs.length}</Text>
              </View>
              {likedSongs.slice(0, 4).map((track) => (
                <TouchableOpacity
                  key={track.source_track_id}
                  style={styles.likedRow}
                  onPress={() => handleLikedSongTap(track.artist_name)}
                  activeOpacity={0.8}
                >
                  <View style={styles.likedIcon}>
                    <Text style={styles.likedEmoji}>♫</Text>
                  </View>
                  <View style={styles.likedInfo}>
                    <Text style={styles.likedTitle} numberOfLines={1}>{track.title}</Text>
                    <Text style={styles.likedArtist} numberOfLines={1}>{track.artist_name}</Text>
                  </View>
                </TouchableOpacity>
              ))}
              {likedSongs.length > 4 && (
                <TouchableOpacity
                  style={styles.seeAllBtn}
                  onPress={() => router.push('/(tabs)/liked')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.seeAllText}>See all {likedSongs.length} liked songs</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          <Animated.View style={[styles.inviteBanner, { transform: [{ scale: pulseAnim }] }]}>
            <TouchableOpacity
              style={styles.inviteBannerInner}
              onPress={() => router.push('/(tabs)/invite')}
              activeOpacity={0.85}
            >
              <Text style={styles.inviteBannerTitle}>INVITE YOUR CIRCLE</Text>
              <Text style={styles.inviteBannerSub}>You have 3 invite codes. Share the cult.</Text>
            </TouchableOpacity>
          </Animated.View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  logoMark: {
    fontSize: 28,
    fontWeight: '900' as const,
    color: colors.acidYellow,
    letterSpacing: -2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600' as const,
  },
  heroSection: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  heroTitle: {
    fontSize: 42,
    fontWeight: '900' as const,
    color: colors.offWhite,
    letterSpacing: -2,
    lineHeight: 44,
  },
  heroSub: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    fontWeight: '500' as const,
    letterSpacing: 0.5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    height: 52,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
    marginLeft: spacing.sm,
    fontWeight: '500' as const,
  },
  searchBtn: {
    backgroundColor: colors.acidYellow,
    height: 52,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  searchBtnText: {
    fontSize: 14,
    fontWeight: '900' as const,
    color: colors.bg,
    letterSpacing: 1,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800' as const,
    color: colors.textSecondary,
    letterSpacing: 2,
  },
  sectionBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionCount: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: colors.acidYellow,
  },
  picksRow: {
    gap: spacing.md,
    paddingRight: spacing.lg,
  },
  pickCard: {
    width: SCREEN_WIDTH * 0.6,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.lg,
    padding: spacing.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  pickCardFirst: {
    borderColor: colors.electricViolet,
    borderWidth: 1,
  },
  pickAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 4,
    height: '100%',
  },
  pickArtist: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: colors.offWhite,
    letterSpacing: -0.5,
    marginBottom: spacing.xs,
  },
  pickBlurb: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  pickCta: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    gap: spacing.md,
  },
  recentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.electricViolet,
  },
  recentInfo: {
    flex: 1,
  },
  recentArtist: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.textPrimary,
  },
  recentTime: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  likedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  likedIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  likedEmoji: {
    fontSize: 16,
  },
  likedInfo: {
    flex: 1,
  },
  likedTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.textPrimary,
  },
  likedArtist: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  seeAllBtn: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: 13,
    color: colors.icyBlue,
    fontWeight: '600' as const,
  },
  inviteBanner: {
    marginTop: spacing.md,
  },
  inviteBannerInner: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.acidYellow,
    borderStyle: 'dashed',
  },
  inviteBannerTitle: {
    fontSize: 16,
    fontWeight: '900' as const,
    color: colors.acidYellow,
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  inviteBannerSub: {
    fontSize: 13,
    color: colors.textSecondary,
  },
});
