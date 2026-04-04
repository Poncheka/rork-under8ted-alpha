export interface Profile {
  id: string;
  email: string;
  username: string;
  created_at: string;
}

export interface InviteCode {
  code: string;
  owner_user_id: string;
  redeemed_by_user_id: string | null;
  redeemed_at: string | null;
  created_at: string;
}

export interface Track {
  id: string;
  source_track_id: string;
  artist_name: string;
  title: string;
  album_name: string;
  stream_url: string;
  artwork_url: string | null;
  raw_json: Record<string, unknown> | null;
  updated_at: string;
}

export interface ArtistResult {
  source_artist_id: string;
  name: string;
  track_count?: number;
}

export interface StationHistory {
  id: string;
  user_id: string;
  seed_artist_name: string;
  created_at: string;
}

export interface Feedback {
  id: string;
  user_id: string;
  source_track_id: string;
  vote_type: 'like' | 'dislike' | 'skip';
  created_at: string;
}

export interface StaffPick {
  id: string;
  artist_name: string;
  blurb: string;
  priority: number;
}

export type AuthStep = 'invite' | 'login' | 'signup' | 'onboarding' | 'ready';

export interface Station {
  seed_artist_name: string;
  tracks: Track[];
  currentIndex: number;
}
