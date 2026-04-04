import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Zap, ArrowRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { colors, spacing, radius } from '@/constants/theme';
import { useAuth } from '@/providers/AuthProvider';

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { completeOnboarding } = useAuth();
  const [username, setUsername] = useState<string>('');
  const [step, setStep] = useState<'username' | 'intro'>('username');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, [step, fadeAnim, slideAnim]);

  const handleUsernameNext = () => {
    if (!username.trim()) return;
    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    fadeAnim.setValue(0);
    slideAnim.setValue(30);
    setStep('intro');
  };

  const handleFinish = async () => {
    if (Platform.OS !== 'web') {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    await completeOnboarding(username.trim());
    router.replace('/(tabs)/(home)');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <KeyboardAvoidingView
        style={styles.inner}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {step === 'username' ? (
          <Animated.View
            style={[
              styles.content,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>01</Text>
            </View>
            <Text style={styles.title}>CHOOSE YOUR{'\n'}HANDLE</Text>
            <Text style={styles.subtitle}>This is how you'll be known on Under8ted</Text>

            <View style={styles.usernameRow}>
              <Text style={styles.atSign}>@</Text>
              <TextInput
                style={styles.usernameInput}
                value={username}
                onChangeText={setUsername}
                placeholder="username"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={20}
                testID="onboarding-username"
              />
            </View>

            <TouchableOpacity
              style={[styles.nextBtn, !username.trim() && styles.nextBtnDisabled]}
              onPress={handleUsernameNext}
              disabled={!username.trim()}
              activeOpacity={0.85}
            >
              <Text style={styles.nextBtnText}>NEXT</Text>
              <ArrowRight size={18} color={colors.bg} />
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <Animated.View
            style={[
              styles.content,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <View style={styles.introIconWrap}>
              <Zap size={40} color={colors.acidYellow} />
            </View>

            <Text style={styles.introHeadline}>NO HITS.{'\n'}NO SKIPS.</Text>

            <View style={styles.introDivider} />

            <Text style={styles.introBody}>
              AI-picked underrated songs only.{'\n'}
              Every station surfaces deep cuts{'\n'}
              you'll actually want to defend.
            </Text>

            <View style={styles.introTags}>
              {['DEEP CUTS', 'AI CURATED', 'NO FILLER'].map((tag) => (
                <View key={tag} style={styles.introTag}>
                  <Text style={styles.introTagText}>{tag}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={styles.startBtn}
              onPress={handleFinish}
              activeOpacity={0.85}
              testID="onboarding-finish"
            >
              <Zap size={18} color={colors.bg} />
              <Text style={styles.startBtnText}>START DISCOVERING</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  content: {
    gap: spacing.md,
  },
  stepBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.electricViolet + '25',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  stepBadgeText: {
    fontSize: 14,
    fontWeight: '800' as const,
    color: colors.electricViolet,
  },
  title: {
    fontSize: 36,
    fontWeight: '900' as const,
    color: colors.offWhite,
    letterSpacing: -2,
    lineHeight: 38,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1.5,
    borderColor: colors.surfaceBorder,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    height: 56,
  },
  atSign: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: colors.electricViolet,
    marginRight: spacing.xs,
  },
  usernameInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600' as const,
    color: colors.textPrimary,
  },
  nextBtn: {
    backgroundColor: colors.acidYellow,
    height: 56,
    borderRadius: radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  nextBtnDisabled: {
    opacity: 0.4,
  },
  nextBtnText: {
    fontSize: 16,
    fontWeight: '900' as const,
    color: colors.bg,
    letterSpacing: 2,
  },
  introIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.acidYellow + '15',
    borderWidth: 1,
    borderColor: colors.acidYellow + '30',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    alignSelf: 'center',
  },
  introHeadline: {
    fontSize: 44,
    fontWeight: '900' as const,
    color: colors.offWhite,
    letterSpacing: -2,
    lineHeight: 46,
    textAlign: 'center',
  },
  introDivider: {
    width: 40,
    height: 3,
    backgroundColor: colors.acidYellow,
    borderRadius: 2,
    alignSelf: 'center',
    marginVertical: spacing.md,
  },
  introBody: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  introTags: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  introTag: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  introTagText: {
    fontSize: 10,
    fontWeight: '800' as const,
    color: colors.textSecondary,
    letterSpacing: 1.5,
  },
  startBtn: {
    backgroundColor: colors.acidYellow,
    height: 56,
    borderRadius: radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  startBtnText: {
    fontSize: 15,
    fontWeight: '900' as const,
    color: colors.bg,
    letterSpacing: 1,
  },
});
