// Core Track Types
export interface TrackMetadata {
  slug: string;
  originalName: string;
  filename: string;
  title: string;
  artist: string;
  uploadedAt: string;
  size: number;
  type: string;
  reactions: TrackReactions;
}

export interface TrackReactions {
  fire: number;
  cry: number;
  explode: number;
  broken: number;
}

export interface ExtendedTrackMetadata {
  description?: string;
  tags?: string[];
  credits?: string[];
  notes?: string;
  genre?: string;
  bpm?: number;
  key?: string;
  duration?: number;
}

export interface TrackWithMetadata extends TrackMetadata {
  extendedMetadata?: ExtendedTrackMetadata;
}

// Audio Player Types
export interface AudioPlayerProps {
  audioUrl: string;
  title: string;
  artist?: string;
  comments?: Comment[];
  onNextTrack?: () => void;
  onPreviousTrack?: () => void;
  onQueueChange?: (queue: TrackWithMetadata[]) => void;
}

export interface EQBand {
  frequency: number;
  gain: number;
  q: number;
}

export interface WaveSurferInstance {
  destroy: () => void;
  load: (url: string) => void;
  playPause: () => void;
  play: () => void;
  pause: () => void;
  getDuration: () => number;
  getCurrentTime: () => number;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
  on: (event: string, callback: Function) => void;
  off: (event: string, callback: Function) => void;
}

// Player State Types
export interface PlayerState {
  currentTrack: TrackWithMetadata | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  queue: TrackWithMetadata[];
  queueIndex: number;
}

// Comment Types
export interface Comment {
  id: string;
  trackSlug: string;
  author: string;
  content: string;
  timestamp: number;
  audioTimestamp?: number;
  parentId?: string;
  replies: Comment[];
  reactions: CommentReaction[];
  createdAt: string;
  updatedAt: string;
}

export interface CommentReaction {
  type: "like" | "love" | "laugh" | "wow" | "sad" | "angry";
  count: number;
  userReaction?: boolean;
}

// Playlist Types
export interface Playlist {
  id: string;
  name: string;
  description?: string;
  tracks: TrackWithMetadata[];
  createdAt: string;
  updatedAt: string;
  isCollaborative?: boolean;
  tags?: string[];
}

// Sync Types
export interface SyncStatus {
  filename: string;
  localPath: string;
  localSize: number;
  localModified: Date;
  cloudExists: boolean;
  cloudSize?: number;
  cloudModified?: Date;
  needsSync: boolean;
  syncReason?: "new" | "modified" | "missing" | "size_mismatch";
  lastSyncAttempt?: Date;
  syncError?: string;
}

export interface SyncProgress {
  total: number;
  synced: number;
  failed: number;
  pending: number;
  currentFile?: string;
  progress: number; // 0-100
}

export interface SyncResult {
  success: boolean;
  synced: string[];
  failed: string[];
  skipped: string[];
  totalTime: number;
  errors: string[];
}

// Storage Types
export interface StorageConfig {
  type: "local" | "cloud" | "hybrid";
  localPath?: string;
  cloudBucket?: string;
  autoSync?: boolean;
}

export interface TrackLocation {
  local?: string;
  cloud?: string;
  primary: "local" | "cloud";
}

export interface LocalTrack {
  filename: string;
  filePath: string;
  size: number;
  modifiedAt: Date;
  type: string;
}

// Filter Types
export interface Filters {
  search: string;
  genre: string;
  bpmRange: [number, number];
  sortBy: "newest" | "oldest" | "title" | "artist" | "reactions";
  tags: string[];
}

// Artwork Types
export interface ArtworkPattern {
  name: string;
  colors: string[];
  complexity: "simple" | "medium" | "complex";
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Utility Types
export type BulkAction = "delete" | "export" | "addToPlaylist" | "sync";
export type SortDirection = "asc" | "desc";
export type AudioQuality = "low" | "medium" | "high" | "lossless";
