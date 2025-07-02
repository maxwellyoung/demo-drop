"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createContext, useContext } from "react";

interface Track {
  slug: string;
  title: string;
  artist: string;
  audioUrl: string;
  genre?: string;
}

interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  queue: Track[];
  queueIndex: number;
}

interface PlayerContextType {
  playerState: PlayerState;
  playTrack: (track: Track) => void;
  togglePlayPause: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
  addToQueue: (track: Track) => void;
  clearQueue: () => void;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurfer = useRef<any>(null);

  const [playerState, setPlayerState] = useState<PlayerState>({
    currentTrack: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    queue: [],
    queueIndex: -1,
  });

  const [hasWaveform, setHasWaveform] = useState(false);

  // Initialize WaveSurfer
  useEffect(() => {
    if (!playerState.currentTrack || !waveformRef.current) return;

    const initWaveSurfer = async () => {
      try {
        const WaveSurfer = (await import("wavesurfer.js")).default;

        if (wavesurfer.current) {
          wavesurfer.current.destroy();
        }

        wavesurfer.current = WaveSurfer.create({
          container: waveformRef.current!,
          waveColor: "#525252",
          progressColor: "#f5f5f5",
          cursorColor: "transparent",
          barWidth: 1,
          barRadius: 1,
          barGap: 1,
          height: 40,
          normalize: true,
          interact: false,
        });

        wavesurfer.current.load(playerState.currentTrack!.audioUrl);

        wavesurfer.current.on("ready", () => {
          setHasWaveform(true);
          setPlayerState((prev) => ({
            ...prev,
            duration: wavesurfer.current.getDuration(),
          }));
        });

        wavesurfer.current.on("audioprocess", () => {
          setPlayerState((prev) => ({
            ...prev,
            currentTime: wavesurfer.current.getCurrentTime(),
          }));
        });

        wavesurfer.current.on("play", () => {
          setPlayerState((prev) => ({ ...prev, isPlaying: true }));
        });

        wavesurfer.current.on("pause", () => {
          setPlayerState((prev) => ({ ...prev, isPlaying: false }));
        });
      } catch (error) {
        console.error("Failed to initialize WaveSurfer:", error);
      }
    };

    initWaveSurfer();

    return () => {
      if (wavesurfer.current) {
        wavesurfer.current.destroy();
      }
    };
  }, [playerState.currentTrack]);

  const playTrack = useCallback((track: Track) => {
    setPlayerState((prev) => ({
      ...prev,
      currentTrack: track,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
    }));
  }, []);

  const togglePlayPause = useCallback(() => {
    if (hasWaveform && wavesurfer.current) {
      wavesurfer.current.playPause();
    } else if (audioRef.current) {
      if (playerState.isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  }, [hasWaveform, playerState.isPlaying]);

  const nextTrack = useCallback(() => {
    const { queue, queueIndex } = playerState;
    if (queueIndex < queue.length - 1) {
      const nextTrack = queue[queueIndex + 1];
      setPlayerState((prev) => ({
        ...prev,
        currentTrack: nextTrack,
        queueIndex: queueIndex + 1,
        isPlaying: false,
        currentTime: 0,
      }));
    }
  }, [playerState]);

  const previousTrack = useCallback(() => {
    const { queue, queueIndex } = playerState;
    if (queueIndex > 0) {
      const prevTrack = queue[queueIndex - 1];
      setPlayerState((prev) => ({
        ...prev,
        currentTrack: prevTrack,
        queueIndex: queueIndex - 1,
        isPlaying: false,
        currentTime: 0,
      }));
    }
  }, [playerState]);

  const seekTo = useCallback(
    (time: number) => {
      if (hasWaveform && wavesurfer.current) {
        wavesurfer.current.seekTo(time / playerState.duration);
      } else if (audioRef.current) {
        audioRef.current.currentTime = time;
      }
    },
    [hasWaveform, playerState.duration]
  );

  const setVolume = useCallback(
    (volume: number) => {
      setPlayerState((prev) => ({ ...prev, volume }));
      if (hasWaveform && wavesurfer.current) {
        wavesurfer.current.setVolume(volume);
      } else if (audioRef.current) {
        audioRef.current.volume = volume;
      }
    },
    [hasWaveform]
  );

  const addToQueue = useCallback((track: Track) => {
    setPlayerState((prev) => ({
      ...prev,
      queue: [...prev.queue, track],
    }));
  }, []);

  const clearQueue = useCallback(() => {
    setPlayerState((prev) => ({
      ...prev,
      queue: [],
      queueIndex: -1,
    }));
  }, []);

  const contextValue: PlayerContextType = {
    playerState,
    playTrack,
    togglePlayPause,
    nextTrack,
    previousTrack,
    seekTo,
    setVolume,
    addToQueue,
    clearQueue,
  };

  return (
    <PlayerContext.Provider value={contextValue}>
      {children}
      {playerState.currentTrack && (
        <PersistentMiniPlayer
          waveformRef={waveformRef}
          hasWaveform={hasWaveform}
        />
      )}
      <audio
        ref={audioRef}
        src={playerState.currentTrack?.audioUrl}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            setPlayerState((prev) => ({
              ...prev,
              duration: audioRef.current!.duration,
            }));
          }
        }}
        onTimeUpdate={() => {
          if (audioRef.current) {
            setPlayerState((prev) => ({
              ...prev,
              currentTime: audioRef.current!.currentTime,
            }));
          }
        }}
        onPlay={() => setPlayerState((prev) => ({ ...prev, isPlaying: true }))}
        onPause={() =>
          setPlayerState((prev) => ({ ...prev, isPlaying: false }))
        }
      />
    </PlayerContext.Provider>
  );
}

interface MiniPlayerProps {
  waveformRef: React.RefObject<HTMLDivElement>;
  hasWaveform: boolean;
}

function PersistentMiniPlayer({ waveformRef, hasWaveform }: MiniPlayerProps) {
  const player = useContext(PlayerContext);
  if (!player) return null;

  const { playerState, togglePlayPause, nextTrack, previousTrack } = player;
  const { currentTrack, isPlaying, currentTime, duration } = playerState;

  if (!currentTrack) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="mini-player">
      <div className="mini-player-content">
        {/* Track Info */}
        <div className="mini-player-info">
          <div className="mini-player-artwork">
            <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 opacity-80 rounded-lg">
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-white text-lg">🎵</span>
              </div>
            </div>
          </div>
          <div className="mini-player-details">
            <h4 className="mini-player-title">{currentTrack.title}</h4>
            <p className="mini-player-artist">{currentTrack.artist}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="mini-player-controls">
          <button
            onClick={previousTrack}
            className="mini-control-btn"
            disabled={playerState.queueIndex <= 0}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 9H17a1 1 0 110 2h-5.586l4.293 4.293a1 1 0 010 1.414zM7 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          <button onClick={togglePlayPause} className="mini-play-button">
            {isPlaying ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>

          <button
            onClick={nextTrack}
            className="mini-control-btn"
            disabled={playerState.queueIndex >= playerState.queue.length - 1}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414-1.414L8.586 11H3a1 1 0 110-2h5.586L4.293 5.707a1 1 0 010-1.414zM13 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {/* Waveform */}
        <div className="mini-player-waveform">
          {hasWaveform ? (
            <div ref={waveformRef} className="w-full h-full" />
          ) : (
            <div className="mini-progress-bar">
              <div
                className="mini-progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>

        {/* Time Display */}
        <div className="mini-player-time">
          <span className="text-xs text-neutral-400">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
      </div>
    </div>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
}
