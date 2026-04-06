import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { Profile, AuthStep } from '@/constants/types';
import { DEMO_INVITE_CODES, generateInviteCode } from '@/constants/mock-data';
import { supabase } from '@/lib/supabase';

const ONBOARDING_KEY = '@under8ted_onboarding_complete';
const INVITES_KEY = '@under8ted_invites';

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [authStep, setAuthStep] = useState<AuthStep>('invite');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userInviteCodes, setUserInviteCodes] = useState<string[]>([]);

  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !data) {
        console.log('Failed to fetch profile:', error?.message);
        return null;
      }
      return data as Profile;
    } catch (e) {
      console.log('fetchProfile error:', e);
      return null;
    }
  }, []);

  const fetchUserInviteCodes = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('invite_codes')
        .select('code')
        .eq('owner_user_id', userId);

      if (!error && data) {
        const codes = data.map((row: { code: string }) => row.code);
        setUserInviteCodes(codes);
        await AsyncStorage.setItem(INVITES_KEY, JSON.stringify(codes));
      }
    } catch (e) {
      console.log('fetchUserInviteCodes error:', e);
    }
  }, []);

  const determineAuthStep = useCallback(async (p: Profile): Promise<AuthStep> => {
    if (!p.username || p.username.trim() === '') {
      return 'onboarding';
    }
    const onboardingDone = await AsyncStorage.getItem(ONBOARDING_KEY);
    if (onboardingDone === 'true') {
      return 'ready';
    }
    return 'ready';
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          const p = await fetchProfile(session.user.id);
          if (p) {
            setProfile(p);
            const step = await determineAuthStep(p);
            setAuthStep(step);
            await fetchUserInviteCodes(session.user.id);
          } else {
            setAuthStep('onboarding');
          }
        }
      } catch (e) {
        console.log('Auth init error:', e);
      } finally {
        setIsLoading(false);
      }
    };

    void initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event);

      if (event === 'SIGNED_IN' && session?.user) {
        const p = await fetchProfile(session.user.id);
        if (p) {
          setProfile(p);
          const step = await determineAuthStep(p);
          setAuthStep(step);
          await fetchUserInviteCodes(session.user.id);
        }
      } else if (event === 'SIGNED_OUT') {
        setProfile(null);
        setAuthStep('invite');
        setUserInviteCodes([]);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile, determineAuthStep, fetchUserInviteCodes]);

  const redeemInvite = useCallback(async (code: string): Promise<boolean> => {
    const trimmed = code.trim().toUpperCase();

    if (DEMO_INVITE_CODES.includes(trimmed)) {
      return true;
    }

    try {
      const { data, error } = await supabase
        .from('invite_codes')
        .select('*')
        .eq('code', trimmed)
        .is('redeemed_by_user_id', null)
        .single();

      if (error || !data) {
        console.log('Invite code not found or already redeemed:', error?.message);
        return false;
      }
      return true;
    } catch (e) {
      console.log('redeemInvite error:', e);
      return false;
    }
  }, []);

  const signup = useCallback(async (email: string, password: string) => {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      console.log('Signup auth error:', authError.message);
      throw new Error(authError.message);
    }

    if (!authData.user) {
      throw new Error('Signup failed: no user returned');
    }

    const userId = authData.user.id;

    const newProfile: Profile = {
      id: userId,
      email,
      username: '',
      created_at: new Date().toISOString(),
    };

    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email,
        username: '',
        created_at: new Date().toISOString(),
      });

    if (profileError) {
      console.log('Profile insert error:', profileError.message);
      throw new Error('Failed to create profile: ' + profileError.message);
    }

    setProfile(newProfile);
    setAuthStep('onboarding');

    const codes = [generateInviteCode(), generateInviteCode(), generateInviteCode()];
    setUserInviteCodes(codes);
    await AsyncStorage.setItem(INVITES_KEY, JSON.stringify(codes));

    const inviteRows = codes.map(c => ({
      code: c,
      owner_user_id: userId,
      redeemed_by_user_id: null,
      redeemed_at: null,
      created_at: new Date().toISOString(),
    }));

    const { error: inviteError } = await supabase
      .from('invite_codes')
      .insert(inviteRows);

    if (inviteError) {
      console.log('Invite codes insert error:', inviteError.message);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.log('Login error:', error.message);
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('Login failed: no user returned');
    }

    const p = await fetchProfile(data.user.id);
    if (p) {
      setProfile(p);
      const step = await determineAuthStep(p);
      setAuthStep(step);
      await fetchUserInviteCodes(data.user.id);
    } else {
      setProfile({
        id: data.user.id,
        email: data.user.email ?? email,
        username: '',
        created_at: new Date().toISOString(),
      });
      setAuthStep('onboarding');
    }
  }, [fetchProfile, determineAuthStep, fetchUserInviteCodes]);

  const completeOnboarding = useCallback(async (username: string) => {
    if (!profile) return;

    const { error } = await supabase
      .from('profiles')
      .update({ username })
      .eq('id', profile.id);

    if (error) {
      console.log('Update username error:', error.message);
      throw new Error('Failed to update username: ' + error.message);
    }

    const updated = { ...profile, username };
    setProfile(updated);
    setAuthStep('ready');
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
  }, [profile]);

  const updateUsername = useCallback(async (username: string) => {
    if (!profile) return;

    const { error } = await supabase
      .from('profiles')
      .update({ username })
      .eq('id', profile.id);

    if (error) {
      console.log('Update username error:', error.message);
      throw new Error('Failed to update username: ' + error.message);
    }

    const updated = { ...profile, username };
    setProfile(updated);
  }, [profile]);

  const logout = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.log('Logout error:', error.message);
    }
    await AsyncStorage.removeItem(INVITES_KEY);
    await AsyncStorage.removeItem(ONBOARDING_KEY);
    setProfile(null);
    setAuthStep('invite');
    setUserInviteCodes([]);
  }, []);

  const deleteAccount = useCallback(async () => {
    if (profile) {
      try {
        await supabase.from('feedback').delete().eq('user_id', profile.id);
        await supabase.from('station_history').delete().eq('user_id', profile.id);
        await supabase.from('invite_codes').delete().eq('owner_user_id', profile.id);
        await supabase.from('profiles').delete().eq('id', profile.id);
      } catch (e) {
        console.log('Delete account data error:', e);
      }
    }

    const { error } = await supabase.auth.signOut();
    if (error) {
      console.log('Signout after delete error:', error.message);
    }
    await AsyncStorage.removeItem(INVITES_KEY);
    await AsyncStorage.removeItem(ONBOARDING_KEY);
    setProfile(null);
    setAuthStep('invite');
    setUserInviteCodes([]);
  }, [profile]);

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
