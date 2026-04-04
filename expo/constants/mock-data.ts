import { Track, StaffPick } from './types';

export const STAFF_PICKS: StaffPick[] = [
  {
    id: '1',
    artist_name: 'Ravyn Lenae',
    blurb: 'Silky R&B deep cuts that never got the spotlight they deserved.',
    priority: 1,
  },
  {
    id: '2',
    artist_name: 'Smino',
    blurb: 'St. Louis flow with hidden gems buried in every project.',
    priority: 2,
  },
  {
    id: '3',
    artist_name: 'Rema',
    blurb: 'Afrobeats beyond the singles. The album cuts go crazy.',
    priority: 3,
  },
  {
    id: '4',
    artist_name: 'Dijon',
    blurb: 'Raw, emotional, and completely overlooked by the mainstream.',
    priority: 4,
  },
  {
    id: '5',
    artist_name: 'Mk.gee',
    blurb: 'Guitar-driven experimentalism that sounds like nothing else.',
    priority: 5,
  },
];

export const MOCK_TRACKS: Record<string, Track[]> = {
  'Ravyn Lenae': [
    { id: 'rl1', source_track_id: 'rl1', artist_name: 'Ravyn Lenae', title: 'Closer (Ode 2 U)', album_name: 'Hypnos', stream_url: '', artwork_url: null, raw_json: null, updated_at: '' },
    { id: 'rl2', source_track_id: 'rl2', artist_name: 'Ravyn Lenae', title: 'Venom', album_name: 'Hypnos', stream_url: '', artwork_url: null, raw_json: null, updated_at: '' },
    { id: 'rl3', source_track_id: 'rl3', artist_name: 'Ravyn Lenae', title: 'Computer Luv', album_name: 'Crush EP', stream_url: '', artwork_url: null, raw_json: null, updated_at: '' },
    { id: 'rl4', source_track_id: 'rl4', artist_name: 'Ravyn Lenae', title: 'Skin Tight', album_name: 'Midnight Moonlight', stream_url: '', artwork_url: null, raw_json: null, updated_at: '' },
    { id: 'rl5', source_track_id: 'rl5', artist_name: 'Ravyn Lenae', title: 'Baby Girl', album_name: 'Hypnos', stream_url: '', artwork_url: null, raw_json: null, updated_at: '' },
  ],
  'Smino': [
    { id: 'sm1', source_track_id: 'sm1', artist_name: 'Smino', title: 'Klink', album_name: 'blkswn', stream_url: '', artwork_url: null, raw_json: null, updated_at: '' },
    { id: 'sm2', source_track_id: 'sm2', artist_name: 'Smino', title: 'Anita', album_name: 'blkswn', stream_url: '', artwork_url: null, raw_json: null, updated_at: '' },
    { id: 'sm3', source_track_id: 'sm3', artist_name: 'Smino', title: 'Glass Flows', album_name: 'NOIR', stream_url: '', artwork_url: null, raw_json: null, updated_at: '' },
    { id: 'sm4', source_track_id: 'sm4', artist_name: 'Smino', title: 'Kolors', album_name: 'Luv 4 Rent', stream_url: '', artwork_url: null, raw_json: null, updated_at: '' },
    { id: 'sm5', source_track_id: 'sm5', artist_name: 'Smino', title: '90 Proof', album_name: 'blkswn', stream_url: '', artwork_url: null, raw_json: null, updated_at: '' },
  ],
  'Rema': [
    { id: 're1', source_track_id: 're1', artist_name: 'Rema', title: 'Wine', album_name: 'Rave & Roses', stream_url: '', artwork_url: null, raw_json: null, updated_at: '' },
    { id: 're2', source_track_id: 're2', artist_name: 'Rema', title: 'FYN', album_name: 'Rave & Roses', stream_url: '', artwork_url: null, raw_json: null, updated_at: '' },
    { id: 're3', source_track_id: 're3', artist_name: 'Rema', title: 'Addicted', album_name: 'Rema', stream_url: '', artwork_url: null, raw_json: null, updated_at: '' },
    { id: 're4', source_track_id: 're4', artist_name: 'Rema', title: 'Corny', album_name: 'Rave & Roses', stream_url: '', artwork_url: null, raw_json: null, updated_at: '' },
    { id: 're5', source_track_id: 're5', artist_name: 'Rema', title: 'Oroma', album_name: 'Rave & Roses Ultra', stream_url: '', artwork_url: null, raw_json: null, updated_at: '' },
  ],
  'Dijon': [
    { id: 'dj1', source_track_id: 'dj1', artist_name: 'Dijon', title: 'Big Mike\'s', album_name: 'Absolutely', stream_url: '', artwork_url: null, raw_json: null, updated_at: '' },
    { id: 'dj2', source_track_id: 'dj2', artist_name: 'Dijon', title: 'Rodeo Clown', album_name: 'Absolutely', stream_url: '', artwork_url: null, raw_json: null, updated_at: '' },
    { id: 'dj3', source_track_id: 'dj3', artist_name: 'Dijon', title: 'Talk Down', album_name: 'Absolutely', stream_url: '', artwork_url: null, raw_json: null, updated_at: '' },
    { id: 'dj4', source_track_id: 'dj4', artist_name: 'Dijon', title: 'Annie', album_name: 'Sci Fi 1', stream_url: '', artwork_url: null, raw_json: null, updated_at: '' },
    { id: 'dj5', source_track_id: 'dj5', artist_name: 'Dijon', title: 'Scratching', album_name: 'Absolutely', stream_url: '', artwork_url: null, raw_json: null, updated_at: '' },
  ],
  'Mk.gee': [
    { id: 'mk1', source_track_id: 'mk1', artist_name: 'Mk.gee', title: 'Alesis', album_name: 'Two Star & The Dream Police', stream_url: '', artwork_url: null, raw_json: null, updated_at: '' },
    { id: 'mk2', source_track_id: 'mk2', artist_name: 'Mk.gee', title: 'DNM', album_name: 'Two Star & The Dream Police', stream_url: '', artwork_url: null, raw_json: null, updated_at: '' },
    { id: 'mk3', source_track_id: 'mk3', artist_name: 'Mk.gee', title: 'I Want', album_name: 'Two Star & The Dream Police', stream_url: '', artwork_url: null, raw_json: null, updated_at: '' },
    { id: 'mk4', source_track_id: 'mk4', artist_name: 'Mk.gee', title: 'Rockman', album_name: 'Fool', stream_url: '', artwork_url: null, raw_json: null, updated_at: '' },
    { id: 'mk5', source_track_id: 'mk5', artist_name: 'Mk.gee', title: 'Every Night', album_name: 'Fool', stream_url: '', artwork_url: null, raw_json: null, updated_at: '' },
  ],
};

export const DEMO_INVITE_CODES = ['UNDER8-ALPHA', 'UNDER8-BETA', 'UNDER8-GAMMA'];

export function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'U8-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function getTracksForArtist(artistName: string): Track[] {
  const key = Object.keys(MOCK_TRACKS).find(
    k => k.toLowerCase() === artistName.toLowerCase()
  );
  if (key) return MOCK_TRACKS[key];

  const genericTracks: Track[] = [];
  for (let i = 1; i <= 5; i++) {
    genericTracks.push({
      id: `gen-${artistName}-${i}`,
      source_track_id: `gen-${artistName}-${i}`,
      artist_name: artistName,
      title: `Deep Cut #${i}`,
      album_name: 'Unknown Album',
      stream_url: '',
      artwork_url: null,
      raw_json: null,
      updated_at: '',
    });
  }
  return genericTracks;
}
