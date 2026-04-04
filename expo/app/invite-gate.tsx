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
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Lock, ArrowRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { colors, spacing, radius } from '@/constants/theme';
import { useAuth } from '@/providers/AuthProvider';

export default function InviteGateScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { redeemInvite } = useAuth();
  const [code, setCode] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const logoAnim = useRef(new Animated.Value(0)).current;
  const formAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(logoAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(formAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [logoAnim, formAnim]);

  const handleSubmit = async () => {
    if (!code.trim()) {
      setError('Enter an invite code');
      return;
    }
    setIsChecking(true);
    setError('');

    try {
      const valid = await redeemInvite(code);
      if (valid) {
        if (Platform.OS !== 'web') {
          void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        router.push('/signup');
      } else {
        if (Platform.OS !== 'web') {
          void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
        setError('Invalid or already used invite code');
        Animated.sequence([
          Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 8, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: -8, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
        ]).start();
      }
    } catch (e) {
      console.log('Invite check error:', e);
      setError('Something went wrong. Try again.');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <KeyboardAvoidingView
        style={styles.inner}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Animated.View
          style={[
            styles.logoSection,
            {
              opacity: logoAnim,
              transform: [{ translateY: logoAnim.interpolate({ inputRange: [0, 1], outputRange: [-30, 0] }) }],
            },
          ]}
        >
          <View style={styles.lockBadge}>
            <Lock size={24} color={colors.acidYellow} />
          </View>
          <Text style={styles.brand}>UNDER</Text>
          <Text style={styles.brandAccent}>8TED</Text>
          <View style={styles.taglineRow}>
            <View style={styles.taglineDot} />
            <Text style={styles.tagline}>INVITE ONLY</Text>
            <View style={styles.taglineDot} />
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.formSection,
            {
              opacity: formAnim,
              transform: [
                { translateY: formAnim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) },
                { translateX: shakeAnim },
              ],
            },
          ]}
        >
          <Text style={styles.formLabel}>ENTER INVITE CODE</Text>
          <TextInput
            style={[styles.codeInput, error ? styles.codeInputError : null]}
            value={code}
            onChangeText={(t) => {
              setCode(t.toUpperCase());
              setError('');
            }}
            placeholder="U8-XXXXXX"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={20}
            testID="invite-code-input"
          />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.submitBtn, (!code.trim() || isChecking) && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={!code.trim() || isChecking}
            activeOpacity={0.85}
            testID="invite-submit-btn"
          >
            {isChecking ? (
              <ActivityIndicator color={colors.bg} />
            ) : (
              <>
                <Text style={styles.submitBtnText}>ENTER</Text>
                <ArrowRight size={18} color={colors.bg} />
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => router.push('/login')}
            activeOpacity={0.7}
          >
            <Text style={styles.loginLinkText}>Already have an account? <Text style={styles.loginLinkAccent}>Log in</Text></Text>
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Alpha v0.1 — For invited friends only</Text>
        </View>
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
    paddingHorizontal: spacing.xl,
    justifyContent: 'center',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: spacing.xxl + 16,
  },
  lockBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.acidYellow + '40',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  brand: {
    fontSize: 52,
    fontWeight: '900' as const,
    color: colors.offWhite,
    letterSpacing: -3,
    lineHeight: 56,
  },
  brandAccent: {
    fontSize: 52,
    fontWeight: '900' as const,
    color: colors.acidYellow,
    letterSpacing: -3,
    lineHeight: 56,
    marginTop: -8,
  },
  taglineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  taglineDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.electricViolet,
  },
  tagline: {
    fontSize: 11,
    fontWeight: '800' as const,
    color: colors.textSecondary,
    letterSpacing: 4,
  },
  formSection: {
    gap: spacing.md,
  },
  formLabel: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: colors.textMuted,
    letterSpacing: 2,
    marginBottom: spacing.xs,
  },
  codeInput: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1.5,
    borderColor: colors.surfaceBorder,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    height: 56,
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.offWhite,
    letterSpacing: 3,
    textAlign: 'center',
  },
  codeInputError: {
    borderColor: colors.error,
  },
  errorText: {
    fontSize: 13,
    color: colors.error,
    textAlign: 'center',
    fontWeight: '600' as const,
  },
  submitBtn: {
    backgroundColor: colors.acidYellow,
    height: 56,
    borderRadius: radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  submitBtnDisabled: {
    opacity: 0.4,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '900' as const,
    color: colors.bg,
    letterSpacing: 2,
  },
  loginLink: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  loginLinkText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  loginLinkAccent: {
    color: colors.icyBlue,
    fontWeight: '700' as const,
  },
  footer: {
    position: 'absolute',
    bottom: spacing.lg,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
});
