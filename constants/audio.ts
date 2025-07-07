// Audio Player Constants
export const AUDIO_CONSTANTS = {
  DEFAULT_VOLUME: 1,
  DEFAULT_PLAYBACK_SPEED: 1,
  MIN_VOLUME: 0,
  MAX_VOLUME: 1,
  SYNC_TOLERANCE_MS: 1000, // 1 second tolerance for file sync
} as const;

// Playback Speed Options
export const SPEED_OPTIONS = [
  { value: 0.25, label: "0.25x" },
  { value: 0.5, label: "0.5x" },
  { value: 0.75, label: "0.75x" },
  { value: 1, label: "1x" },
  { value: 1.25, label: "1.25x" },
  { value: 1.5, label: "1.5x" },
  { value: 2, label: "2x" },
  { value: 4, label: "4x" },
] as const;

// EQ Band Configuration
export const EQ_BANDS = [
  { frequency: 60, gain: 0, q: 1, label: "Low" },
  { frequency: 170, gain: 0, q: 1, label: "Low-Mid" },
  { frequency: 310, gain: 0, q: 1, label: "Mid" },
  { frequency: 600, gain: 0, q: 1, label: "Mid-High" },
  { frequency: 1000, gain: 0, q: 1, label: "High" },
  { frequency: 3000, gain: 0, q: 1, label: "High-Mid" },
  { frequency: 6000, gain: 0, q: 1, label: "Presence" },
  { frequency: 12000, gain: 0, q: 1, label: "Brilliance" },
  { frequency: 14000, gain: 0, q: 1, label: "Air" },
  { frequency: 16000, gain: 0, q: 1, label: "Ultra High" },
] as const;

// Audio File Types
export const SUPPORTED_AUDIO_FORMATS = [
  ".wav",
  ".mp3",
  ".m4a",
  ".flac",
] as const;

// MIME Types
export const MIME_TYPES = {
  ".wav": "audio/wav",
  ".mp3": "audio/mpeg",
  ".m4a": "audio/mp4",
  ".flac": "audio/flac",
} as const;

// Waveform Configuration
export const WAVEFORM_CONFIG = {
  waveColor: "#525252",
  progressColor: "#f5f5f5",
  cursorColor: "transparent",
  barWidth: 1,
  barRadius: 1,
  barGap: 1,
  height: 40,
  normalize: true,
  interact: false,
} as const;

// Spectrum Analyzer Configuration
export const SPECTRUM_CONFIG = {
  fftSize: 256,
  smoothingTimeConstant: 0.8,
  minDecibels: -90,
  maxDecibels: -10,
} as const;
