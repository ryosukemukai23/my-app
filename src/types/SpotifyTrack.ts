// types/SpotifyTrack.ts
export interface SpotifyTrack {
  id: string;
  name: string;
  artists: {
    id: string;
    name: string;
    uri: string;
  }[];
  album: {
    id: string;
    name: string;
    images: {
      url: string;
      height: number;
      width: number;
    }[];
    release_date: string;
  };
  duration_ms: number;
  popularity: number;
  preview_url: string | null;
  external_urls: {
    spotify: string;
  };
  uri: string;
}

export interface SpotifySearchResponse {
  tracks: {
    items: SpotifyTrack[];
    total: number;
    limit: number;
    offset: number;
  };
}

export interface SpotifyPlaylistTrack {
  track: SpotifyTrack;
  added_at: string;
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  tracks: {
    items: SpotifyPlaylistTrack[];
    total: number;
  };
  images: {
    url: string;
    height: number;
    width: number;
  }[];
  external_urls: {
    spotify: string;
  };
}

export interface SpotifyAuthToken {
  access_token: string;
  token_type: string;
  expires_in: number;
}
