import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react-native';
import { colors, spacing, radius } from '@/constants/theme';
import { useAuth } from '@/providers/AuthProvider';

export default function SignupScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signup } = useAuth();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleSignup = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords don\'t match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await signup(email.trim(), password);
      router.replace('/onboarding');
    } catch (e) {
      console.log('Signup error:', e);
      setError('Signup failed. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isValid = email.trim().length > 0 && password.length >= 6 && password === confirmPassword;

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => router.back()}
        activeOpacity={0.7}
      >
        <ArrowLeft size={20} color={colors.textSecondary} />
      </TouchableOpacity>

      <KeyboardAvoidingView
        style={styles.inner}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.headerSection}>
          <View style={styles.iconRow}>
            <Sparkles size={20} color={colors.acidYellow} />
          </View>
          <Text style={styles.title}>CREATE{'\n'}ACCOUNT</Text>
          <Text style={styles.subtitle}>You're in. Let's set up your account.</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>EMAIL</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={(t) => { setEmail(t); setError(''); }}
              placeholder="you@example.com"
              placeholderTextColor={colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              testID="signup-email"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>PASSWORD</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={(t) => { setPassword(t); setError(''); }}
              placeholder="Min 6 characters"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              testID="signup-password"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>CONFIRM PASSWORD</Text>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={(t) => { setConfirmPassword(t); setError(''); }}
              placeholder="Repeat password"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              testID="signup-confirm"
            />
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.submitBtn, (!isValid || isLoading) && styles.submitBtnDisabled]}
            onPress={handleSignup}
            disabled={!isValid || isLoading}
            activeOpacity={0.85}
            testID="signup-submit"
          >
            {isLoading ? (
              <ActivityIndicator color={colors.bg} />
            ) : (
              <>
                <Text style={styles.submitBtnText}>CREATE ACCOUNT</Text>
                <ArrowRight size={18} color={colors.bg} />
              </>
            )}
          </TouchableOpacity>
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
  backBtn: {
    position: 'absolute',
    top: 60,
    left: spacing.lg,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  inner: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    justifyContent: 'center',
  },
  headerSection: {
    marginBottom: spacing.xxl,
  },
  iconRow: {
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 38,
    fontWeight: '900' as const,
    color: colors.offWhite,
    letterSpacing: -2,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  form: {
    gap: spacing.md,
  },
  inputGroup: {
    gap: spacing.xs,
  },
  label: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: colors.textMuted,
    letterSpacing: 2,
  },
  input: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 52,
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: '500' as const,
  },
  errorText: {
    fontSize: 13,
    color: colors.error,
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
    marginTop: spacing.sm,
  },
  submitBtnDisabled: {
    opacity: 0.4,
  },
  submitBtnText: {
    fontSize: 15,
    fontWeight: '900' as const,
    color: colors.bg,
    letterSpacing: 2,
  },
});
