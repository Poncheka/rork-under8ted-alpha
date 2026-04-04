import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { Profile, AuthStep } from '@/constants/types';
import { DEMO_INVITE_CODES, generateInviteCode } from '@/constants/mock-data';

const AUTH_KEY = '@under8ted_auth';
const INVITES_KEY = '@under8ted_invites';
const REDEEMED_KEY = '@under8ted_redeemed';

interface StoredAuth {
  profile: Profile;
  step: AuthStep;
}

interface StoredInvite {
  code: string;
  ownerId: string;
  redeemed: boolean;
}

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [authStep, setAuthStep] = useState<AuthStep>('invite');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userInviteCodes, setUserInviteCodes] = useState<string[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem(AUTH_KEY);
        if (stored) {
          const parsed: StoredAuth = JSON.parse(stored);
          setProfile(parsed.profile);
          setAuthStep(parsed.step);
        }
        const invites = await AsyncStorage.getItem(INVITES_KEY);
        if (invites) {
          setUserInviteCodes(JSON.parse(invites));
        }
      } catch (e) {
        console.log('Auth load error:', e);
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  }, []);

  const persistAuth = useCallback(async (p: Profile, step: AuthStep) => {
    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify({ profile: p, step }));
  }, []);

  const redeemInvite = useCallback(async (code: string): Promise<boolean> => {
    const trimmed = code.trim().toUpperCase();
    if (DEMO_INVITE_CODES.includes(trimmed)) {
      return true;
    }
    const redeemed = await AsyncStorage.getItem(REDEEMED_KEY);
    const redeemedList: string[] = redeemed ? JSON.parse(redeemed) : [];
    if (redeemedList.includes(trimmed)) {
      return false;
    }
    const allInvites = await AsyncStorage.getItem('@under8ted_all_invites');
    const allList: StoredInvite[] = allInvites ? JSON.parse(allInvites) : [];
    const found = allList.find(i => i.code === trimmed && !i.redeemed);
    if (found) {
      found.redeemed = true;
      await AsyncStorage.setItem('@under8ted_all_invites', JSON.stringify(allList));
      redeemedList.push(trimmed);
      await AsyncStorage.setItem(REDEEMED_KEY, JSON.stringify(redeemedList));
      return true;
    }
    return false;
  }, []);

  const signup = useCallback(async (email: string, _password: string) => {
    const newProfile: Profile = {
      id: `user_${Date.now()}`,
      email,
      username: '',
      created_at: new Date().toISOString(),
    };
    setProfile(newProfile);
    setAuthStep('onboarding');
    await persistAuth(newProfile, 'onboarding');

    const codes = [generateInviteCode(), generateInviteCode(), generateInviteCode()];
    setUserInviteCodes(codes);
    await AsyncStorage.setItem(INVITES_KEY, JSON.stringify(codes));

    const allInvites = await AsyncStorage.getItem('@under8ted_all_invites');
    const allList: StoredInvite[] = allInvites ? JSON.parse(allInvites) : [];
    codes.forEach(c => allList.push({ code: c, ownerId: newProfile.id, redeemed: false }));
    await AsyncStorage.setItem('@under8ted_all_invites', JSON.stringify(allList));
  }, [persistAuth]);

  const login = useCallback(async (email: string, _password: string) => {
    const stored = await AsyncStorage.getItem(AUTH_KEY);
    if (stored) {
      const parsed: StoredAuth = JSON.parse(stored);
      if (parsed.profile.email === email) {
        setProfile(parsed.profile);
        setAuthStep(parsed.step);
        return;
      }
    }
    const newProfile: Profile = {
      id: `user_${Date.now()}`,
      email,
      username: email.split('@')[0],
      created_at: new Date().toISOString(),
    };
    setProfile(newProfile);
    setAuthStep('ready');
    await persistAuth(newProfile, 'ready');
  }, [persistAuth]);

  const completeOnboarding = useCallback(async (username: string) => {
    if (!profile) return;
    const updated = { ...profile, username };
    setProfile(updated);
    setAuthStep('ready');
    await persistAuth(updated, 'ready');
  }, [profile, persistAuth]);

  const updateUsername = useCallback(async (username: string) => {
    if (!profile) return;
    const updated = { ...profile, username };
    setProfile(updated);
    await persistAuth(updated, 'ready');
  }, [profile, persistAuth]);

  const logout = useCallback(async () => {
    await AsyncStorage.multiRemove([AUTH_KEY, INVITES_KEY]);
    setProfile(null);
    setAuthStep('invite');
  }, []);

  const deleteAccount = useCallback(async () => {
    await AsyncStorage.multiRemove([AUTH_KEY, INVITES_KEY]);
    setProfile(null);
    setAuthStep('invite');
  }, []);

  return useMemo(() => ({
    profile,
    authStep,
    isLoading,
    userInviteCodes,
    redeemInvite,
    signup,
    login,
    completeOnboarding,
    updateUsername,
    logout,
    deleteAccount,
    setAuthStep,
  }), [profile, authStep, isLoading, userInviteCodes, redeemInvite, signup, login, completeOnboarding, updateUsername, logout, deleteAccount]);
});
