import { Track } from '@/constants/types';

const SPOTIFY_CLIENT_ID = 'f7c59f34b27446b6a4be5dad9967c106';
const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

export interface SpotifyImage {
  url: string;
  height: number | null;
  width: number | null;
}

export interface SpotifyArtist {
  id: string;
  name: string;
  images: SpotifyImage[];
  popularity: number;
  genres: string[];
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  release_date: string;
  images: SpotifyImage[];
  total_tracks: number;
}

export interface SpotifyTrack {
  id: string;
  name: string;
  preview_url: string | null;
  duration_ms: number;
  track_number: number;
}

interface SpotifyAlbumTrack extends SpotifyTrack {
  _albumName: string;
  _albumArtwork: string | null;
}

async function spotifyFetch<T>(url: string, token: string): Promise<T | null> {
  try {
    console.log('[Spotify] Fetching:', url);
    const res = await fetch(url, {
      headers: { 'Authorization': 'Bearer ' + token },
    });
    if (!res.ok) {
      console.warn('[Spotify] API error:', res.status, await res.text().catch(() => ''));
      return null;
    }
    return await res.json() as T;
  } catch (err) {
    console.warn('[Spotify] Fetch error:', err);
    return null;
  }
}

export async function searchArtists(query: string, token: string): Promise<SpotifyArtist[]> {
  if (!token || !query.trim()) return [];
  try {
    const encoded = encodeURIComponent(query.trim());
    const data = await spotifyFetch<{ artists: { items: SpotifyArtist[] } }>(
      `${SPOTIFY_API_BASE}/search?type=artist&q=${encoded}&limit=10`,
      token
    );
    return data?.artists?.items ?? [];
  } catch (err) {
    console.warn('[Spotify] searchArtists error:', err);
    return [];
  }
}

export async function getArtistAlbums(artistId: string, token: string): Promise<SpotifyAlbum[]> {
  if (!token || !artistId) return [];
  try {
    const data = await spotifyFetch<{ items: SpotifyAlbum[] }>(
      `${SPOTIFY_API_BASE}/artists/${artistId}/albums?include_groups=album,single&limit=50&market=US`,
      token
    );
    return data?.items ?? [];
  } catch (err) {
    console.warn('[Spotify] getArtistAlbums error:', err);
    return [];
  }
}

export async function getAlbumTracks(albumId: string, token: string): Promise<SpotifyTrack[]> {
  if (!token || !albumId) return [];
  try {
    const data = await spotifyFetch<{ items: SpotifyTrack[] }>(
      `${SPOTIFY_API_BASE}/albums/${albumId}/tracks?limit=50&market=US`,
      token
    );
    return data?.items ?? [];
  } catch (err) {
    console.warn('[Spotify] getAlbumTracks error:', err);
    return [];
  }
}

export async function getArtistTopTracks(artistId: string, token: string): Promise<SpotifyTrack[]> {
  if (!token || !artistId) return [];
  try {
    const data = await spotifyFetch<{ tracks: SpotifyTrack[] }>(
      `${SPOTIFY_API_BASE}/artists/${artistId}/top-tracks?market=US`,
      token
    );
    return data?.tracks ?? [];
  } catch (err) {
    console.warn('[Spotify] getArtistTopTracks error:', err);
    return [];
  }
}

export async function generateStation(
  artistId: string,
  artistName: string,
  token: string
): Promise<Track[]> {
  if (!token || !artistId) {
    console.warn('[Spotify] generateStation: missing token or artistId');
    return [];
  }

  try {
    console.log('[Spotify] Generating station for:', artistName, artistId);

    const [topTracks, albums] = await Promise.all([
      getArtistTopTracks(artistId, token),
      getArtistAlbums(artistId, token),
    ]);

    const topTrackIds = new Set(topTracks.map(t => t.id));
    const topTrackNames = new Set(topTracks.map(t => t.name.toLowerCase().replace(/\s*\(.*?\)\s*/g, '').trim()));

    console.log('[Spotify] Top tracks to exclude:', topTracks.length);
    console.log('[Spotify] Albums found:', albums.length);

    const albumsToFetch = albums.slice(0, 10);

    const albumTrackResults = await Promise.all(
      albumsToFetch.map(async (album): Promise<SpotifyAlbumTrack[]> => {
        const tracks = await getAlbumTracks(album.id, token);
        return tracks.map(t => ({
          ...t,
          _albumName: album.name,
          _albumArtwork: album.images?.[0]?.url ?? null,
        }));
      })
    );

    const allAlbumTracks = albumTrackResults.flat();
    console.log('[Spotify] Total album tracks fetched:', allAlbumTracks.length);

    const deepCuts = allAlbumTracks.filter(track => {
      if (topTrackIds.has(track.id)) return false;
      const normalizedName = track.name.toLowerCase().replace(/\s*\(.*?\)\s*/g, '').trim();
      if (topTrackNames.has(normalizedName)) return false;
      return true;
    });

    console.log('[Spotify] Deep cuts after filtering:', deepCuts.length);

    const shuffled = [...deepCuts].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 15);

    const mapped: Track[] = selected.map(track => ({
      id: track.id,
      source_track_id: track.id,
      artist_name: artistName,
      title: track.name,
      album_name: track._albumName,
      stream_url: track.preview_url ?? '',
      artwork_url: track._albumArtwork ?? null,
      raw_json: null,
      updated_at: new Date().toISOString(),
    }));

    console.log('[Spotify] Station generated with', mapped.length, 'tracks');
    return mapped;
  } catch (err) {
    console.warn('[Spotify] generateStation error:', err);
    return [];
  }
}

export { SPOTIFY_CLIENT_ID };
