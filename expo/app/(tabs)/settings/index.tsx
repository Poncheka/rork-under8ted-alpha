import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Settings, User, LogOut, Trash2, Check, Edit2, Music, Unplug, RefreshCw } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { colors, spacing, radius } from '@/constants/theme';
import { useAuth } from '@/providers/AuthProvider';
import { useMusic } from '@/providers/MusicProvider';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { profile, updateUsername, logout, deleteAccount } = useAuth();
  const { spotifyToken, connectSpotify, disconnectSpotify, isConnecting, isTokenExpired } = useMusic();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [newUsername, setNewUsername] = useState<string>(profile?.username ?? '');

  const handleSaveUsername = useCallback(async () => {
    if (!newUsername.trim()) return;
    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    await updateUsername(newUsername.trim());
    setIsEditing(false);
  }, [newUsername, updateUsername]);

  const handleLogout = useCallback(() => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  }, [logout]);

  const handleDeleteAccount = useCallback(() => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Are you absolutely sure?',
              'Last chance. All your data will be gone forever.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Yes, Delete Everything',
                  style: 'destructive',
                  onPress: async () => {
                    await deleteAccount();
                  },
                },
              ]
            );
          },
        },
      ]
    );
  }, [deleteAccount]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Settings size={20} color={colors.textSecondary} />
          <Text style={styles.headerTitle}>SETTINGS</Text>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <User size={28} color={colors.electricViolet} />
          </View>
          <View style={styles.profileInfo}>
            {isEditing ? (
              <View style={styles.editRow}>
                <TextInput
                  style={styles.editInput}
                  value={newUsername}
                  onChangeText={setNewUsername}
                  placeholder="username"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="none"
                  autoCorrect={false}
                  maxLength={20}
                  autoFocus
                />
                <TouchableOpacity style={styles.saveBtn} onPress={handleSaveUsername} activeOpacity={0.7}>
                  <Check size={16} color={colors.bg} />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.usernameRow}>
                <Text style={styles.profileUsername}>@{profile?.username || 'unknown'}</Text>
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() => {
                    setNewUsername(profile?.username ?? '');
                    setIsEditing(true);
                  }}
                  activeOpacity={0.7}
                >
                  <Edit2 size={14} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
            )}
            <Text style={styles.profileEmail}>{profile?.email}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>SPOTIFY</Text>

          {spotifyToken ? (
            <>
              <View style={styles.spotifyConnected}>
                <Music size={20} color={colors.acidYellow} />
                <View style={styles.spotifyInfo}>
                  <Text style={styles.spotifyStatusText}>Connected to Spotify</Text>
                  {isTokenExpired && (
                    <Text style={styles.spotifyExpiredText}>Token expired</Text>
                  )}
                </View>
              </View>
              {isTokenExpired && (
                <TouchableOpacity
                  style={styles.settingRow}
                  onPress={() => void connectSpotify()}
                  activeOpacity={0.8}
                  disabled={isConnecting}
                >
                  <RefreshCw size={20} color={colors.icyBlue} />
                  <Text style={styles.settingText}>
                    {isConnecting ? 'Reconnecting...' : 'Reconnect Spotify'}
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.settingRow}
                onPress={() => void disconnectSpotify()}
                activeOpacity={0.8}
              >
                <Unplug size={20} color={colors.textSecondary} />
                <Text style={styles.settingText}>Disconnect Spotify</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={styles.spotifyConnectBtn}
              onPress={() => void connectSpotify()}
              activeOpacity={0.8}
              disabled={isConnecting}
            >
              <Music size={20} color={colors.bg} />
              <Text style={styles.spotifyConnectText}>
                {isConnecting ? 'Connecting...' : 'Connect Spotify'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ACCOUNT</Text>

          <TouchableOpacity
            style={styles.settingRow}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <LogOut size={20} color={colors.textSecondary} />
            <Text style={styles.settingText}>Log Out</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingRowDanger}
            onPress={handleDeleteAccount}
            activeOpacity={0.8}
          >
            <Trash2 size={20} color={colors.error} />
            <Text style={styles.settingTextDanger}>Delete Account</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.aboutSection}>
          <Text style={styles.aboutBrand}>UNDER8TED</Text>
          <Text style={styles.aboutVersion}>Alpha v0.1</Text>
          <Text style={styles.aboutTag}>No hits. No skips. Only deep cuts.</Text>
        </View>
      </ScrollView>
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
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.md,
    marginBottom: spacing.xl,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '900' as const,
    color: colors.offWhite,
    letterSpacing: 2,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginBottom: spacing.xl,
  },
  profileAvatar: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.electricViolet + '15',
    borderWidth: 1,
    borderColor: colors.electricViolet + '30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  profileUsername: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: colors.offWhite,
    letterSpacing: -0.5,
  },
  editBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  editInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  saveBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.acidYellow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileEmail: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
  },
  section: {
    gap: spacing.xs,
    marginBottom: spacing.xl,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800' as const,
    color: colors.textMuted,
    letterSpacing: 2,
    marginBottom: spacing.sm,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  settingText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.textPrimary,
  },
  settingRowDanger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.error + '08',
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.error + '20',
  },
  settingTextDanger: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.error,
  },
  aboutSection: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    gap: spacing.xs,
  },
  aboutBrand: {
    fontSize: 18,
    fontWeight: '900' as const,
    color: colors.textMuted,
    letterSpacing: 4,
  },
  aboutVersion: {
    fontSize: 12,
    color: colors.textMuted,
  },
  aboutTag: {
    fontSize: 12,
    color: colors.textMuted,
    fontStyle: 'italic',
    marginTop: spacing.sm,
  },
  spotifyConnected: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.acidYellow + '10',
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.acidYellow + '20',
  },
  spotifyInfo: {
    flex: 1,
  },
  spotifyStatusText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.acidYellow,
  },
  spotifyExpiredText: {
    fontSize: 12,
    color: colors.error,
    marginTop: 2,
  },
  spotifyConnectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.acidYellow,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  spotifyConnectText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.bg,
  },
});
