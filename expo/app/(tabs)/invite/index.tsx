import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  Share,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Send, Copy, Check, Users } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import { colors, spacing, radius } from '@/constants/theme';
import { useAuth } from '@/providers/AuthProvider';
import { useState } from 'react';

export default function InviteScreen() {
  const insets = useSafeAreaInsets();
  const { userInviteCodes } = useAuth();
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const handleCopy = useCallback(async (code: string, idx: number) => {
    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    await Clipboard.setStringAsync(code);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  }, []);

  const handleShare = useCallback(async (code: string) => {
    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    const message = `You're invited to Under8ted — an invite-only AI music discovery app.\n\nNo hits. No skips. Only deep cuts.\n\nUse this code: ${code}`;
    try {
      if (Platform.OS === 'web') {
        await Clipboard.setStringAsync(message);
        Alert.alert('Copied', 'Invite message copied to clipboard');
      } else {
        await Share.share({ message });
      }
    } catch (e) {
      console.log('Share error:', e);
    }
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Send size={20} color={colors.acidYellow} />
        <Text style={styles.headerTitle}>INVITE FRIENDS</Text>
      </View>

      <View style={styles.heroCard}>
        <View style={styles.heroIconWrap}>
          <Users size={32} color={colors.electricViolet} />
        </View>
        <Text style={styles.heroTitle}>Grow the cult</Text>
        <Text style={styles.heroSub}>
          You have {userInviteCodes.length} invite{userInviteCodes.length !== 1 ? 's' : ''} to share.{'\n'}
          Each code works once. Choose wisely.
        </Text>
      </View>

      <View style={styles.codesSection}>
        <Text style={styles.codesLabel}>YOUR INVITE CODES</Text>
        {userInviteCodes.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No invite codes available</Text>
            <Text style={styles.emptySub}>Create an account to get your codes</Text>
          </View>
        ) : (
          userInviteCodes.map((code, idx) => (
            <View key={code} style={styles.codeRow}>
              <View style={styles.codeNumBadge}>
                <Text style={styles.codeNum}>{idx + 1}</Text>
              </View>
              <Text style={styles.codeText}>{code}</Text>
              <TouchableOpacity
                style={styles.codeAction}
                onPress={() => handleCopy(code, idx)}
                activeOpacity={0.7}
              >
                {copiedIdx === idx ? (
                  <Check size={16} color={colors.success} />
                ) : (
                  <Copy size={16} color={colors.textSecondary} />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.shareBtn}
                onPress={() => handleShare(code)}
                activeOpacity={0.8}
              >
                <Send size={14} color={colors.bg} />
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>

      <View style={styles.rulesCard}>
        <Text style={styles.rulesTitle}>INVITE RULES</Text>
        <View style={styles.ruleRow}>
          <View style={styles.ruleDot} />
          <Text style={styles.ruleText}>Each code can only be used once</Text>
        </View>
        <View style={styles.ruleRow}>
          <View style={styles.ruleDot} />
          <Text style={styles.ruleText}>New members also get 3 invites</Text>
        </View>
        <View style={styles.ruleRow}>
          <View style={styles.ruleDot} />
          <Text style={styles.ruleText}>Keep Under8ted exclusive & quality</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.md,
    marginBottom: spacing.lg,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '900' as const,
    color: colors.offWhite,
    letterSpacing: 2,
  },
  heroCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginBottom: spacing.xl,
  },
  heroIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.electricViolet + '15',
    borderWidth: 1,
    borderColor: colors.electricViolet + '30',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '900' as const,
    color: colors.offWhite,
    letterSpacing: -0.5,
    marginBottom: spacing.xs,
  },
  heroSub: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  codesSection: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  codesLabel: {
    fontSize: 10,
    fontWeight: '800' as const,
    color: colors.textMuted,
    letterSpacing: 2,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  codeNumBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.electricViolet + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeNum: {
    fontSize: 12,
    fontWeight: '800' as const,
    color: colors.electricViolet,
  },
  codeText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.offWhite,
    letterSpacing: 1,
  },
  codeAction: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.acidYellow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  emptySub: {
    fontSize: 13,
    color: colors.textMuted,
  },
  rulesCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  rulesTitle: {
    fontSize: 10,
    fontWeight: '800' as const,
    color: colors.textMuted,
    letterSpacing: 2,
    marginBottom: spacing.xs,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  ruleDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.acidYellow,
  },
  ruleText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500' as const,
  },
});
