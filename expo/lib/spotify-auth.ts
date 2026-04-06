import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
WebBrowser.maybeCompleteAuthSession();

const SPOTIFY_CLIENT_ID = 'f7c59f34b27446b6a4be5dad9967c106';
const SPOTIFY_AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize';
const SPOTIFY_TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token';

const SCOPES = [
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing',
  'streaming',
  'app-remote-control',
];

export interface SpotifyTokenResult {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

function getRedirectUri(): string {
  return AuthSession.makeRedirectUri({
    scheme: 'under8ted',
    path: 'spotify-login-callback',
  });
}

export async function spotifyLogin(): Promise<SpotifyTokenResult | null> {
  try {
    const redirectUri = getRedirectUri();
    console.log('[SpotifyAuth] Redirect URI:', redirectUri);

    const discovery: AuthSession.DiscoveryDocument = {
      authorizationEndpoint: SPOTIFY_AUTH_ENDPOINT,
      tokenEndpoint: SPOTIFY_TOKEN_ENDPOINT,
    };

    const request = new AuthSession.AuthRequest({
      clientId: SPOTIFY_CLIENT_ID,
      scopes: SCOPES,
      redirectUri,
      usePKCE: true,
      responseType: AuthSession.ResponseType.Code,
    });

    const response = await request.promptAsync(discovery);
    console.log('[SpotifyAuth] Auth response type:', response.type);

    if (response.type !== 'success' || !response.params?.code) {
      console.log('[SpotifyAuth] Auth was not successful:', response.type);
      return null;
    }

    const code = response.params.code;
    const codeVerifier = request.codeVerifier;

    if (!codeVerifier) {
      console.warn('[SpotifyAuth] Missing PKCE code verifier');
      return null;
    }

    console.log('[SpotifyAuth] Exchanging code for tokens...');

    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: SPOTIFY_CLIENT_ID,
      code_verifier: codeVerifier,
    }).toString();

    const tokenRes = await fetch(SPOTIFY_TOKEN_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text().catch(() => '');
      console.warn('[SpotifyAuth] Token exchange failed:', tokenRes.status, errText);
      return null;
    }

    const tokenData = await tokenRes.json() as {
      access_token: string;
      refresh_token: string;
      expires_in: number;
    };

    console.log('[SpotifyAuth] Token exchange successful, expires in:', tokenData.expires_in, 'seconds');

    return {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt: Date.now() + (tokenData.expires_in * 1000),
    };
  } catch (err) {
    console.warn('[SpotifyAuth] spotifyLogin error:', err);
    return null;
  }
}

export async function spotifyRefreshToken(refreshToken: string): Promise<SpotifyTokenResult | null> {
  try {
    console.log('[SpotifyAuth] Refreshing token...');

    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: SPOTIFY_CLIENT_ID,
    }).toString();

    const res = await fetch(SPOTIFY_TOKEN_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      console.warn('[SpotifyAuth] Token refresh failed:', res.status, errText);
      return null;
    }

    const data = await res.json() as {
      access_token: string;
      refresh_token?: string;
      expires_in: number;
    };

    console.log('[SpotifyAuth] Token refreshed successfully');

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token ?? refreshToken,
      expiresAt: Date.now() + (data.expires_in * 1000),
    };
  } catch (err) {
    console.warn('[SpotifyAuth] spotifyRefreshToken error:', err);
    return null;
  }
}
