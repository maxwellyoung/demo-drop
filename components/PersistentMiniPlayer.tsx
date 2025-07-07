"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createContext, useContext } from "react";
import { motion, PanInfo } from "framer-motion";

interface Track {
  slug: string;
  title: string;
  artist?: string;
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
  isExpanded: boolean;
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
  removeFromQueue: (index: number) => void;
  toggleExpand: () => void;
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
    isExpanded: false,
  });

  const [hasWaveform, setHasWaveform] = useState(false);

  // Initialize WaveSurfer
  useEffect(() => {
    if (
      !playerState.isExpanded ||
      !playerState.currentTrack ||
      !waveformRef.current
    ) {
      return;
    }

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

        wavesurfer.current.on("finish", () => {
          // Auto-play next track if available
          const { queue, queueIndex } = playerState;
          if (queueIndex < queue.length - 1) {
            nextTrack();
          }
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
  }, [playerState.currentTrack, playerState.isExpanded]);

  const playTrack = useCallback(
    (track: Track) => {
      setPlayerState((prev) => ({
        ...prev,
        currentTrack: track,
        isPlaying: true,
        currentTime: 0,
        duration: 0,
      }));

      setTimeout(() => {
        if (hasWaveform && wavesurfer.current) {
          wavesurfer.current.play();
        } else if (audioRef.current) {
          audioRef.current?.play().catch(() => {
            /* Browser might block autoplay; user will need to click */
          });
        }
      }, 0);
    },
    [hasWaveform]
  );

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
        isPlaying: true,
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
        isPlaying: true,
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

  const removeFromQueue = useCallback((index: number) => {
    setPlayerState((prev) => ({
      ...prev,
      queue: prev.queue.filter((_, i) => i !== index),
      queueIndex:
        prev.queueIndex > index ? prev.queueIndex - 1 : prev.queueIndex,
    }));
  }, []);

  const clearQueue = useCallback(() => {
    setPlayerState((prev) => ({
      ...prev,
      queue: [],
      queueIndex: -1,
    }));
  }, []);

  const toggleExpand = useCallback(() => {
    setPlayerState((prev) => ({ ...prev, isExpanded: !prev.isExpanded }));
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
    removeFromQueue,
    clearQueue,
    toggleExpand,
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
  const player = usePlayer();
  const [showVolume, setShowVolume] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);

  if (!player || !player.playerState.currentTrack) return null;

  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    queue,
    queueIndex,
    isExpanded,
  } = player.playerState;

  // Auto-hide volume slider
  useEffect(() => {
    if (showVolume) {
      const timer = setTimeout(() => setShowVolume(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showVolume]);

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;
  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const percentage = (e.clientX - rect.left) / rect.width;
    const newTime = percentage * duration;
    player.seekTo(newTime);
  };

  const handleDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    const swipeThreshold = 50;
    if (info.offset.y < -swipeThreshold) {
      // Swiped up
      if (!isExpanded) {
        player.toggleExpand();
      }
    } else if (info.offset.y > swipeThreshold) {
      // Swiped down
      if (isExpanded) {
        player.toggleExpand();
      }
    }
  };

  return (
    <motion.div
      className={`mini-player ${isExpanded ? "expanded" : ""}`}
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.1}
      onDragEnd={handleDragEnd}
    >
      {/* Progress Bar */}
      <div className="mini-progress">
        <div
          ref={progressRef}
          className="progress-track"
          onClick={handleProgressClick}
        >
          <div
            className="progress-fill"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Main Player */}
      <div className="mini-player-main">
        {/* Track Info */}
        <div className="mini-track-info" onClick={() => player.toggleExpand()}>
          <div className="mini-cover">
            <div className="cover-gradient" />
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
          </div>

          <div className="mini-details">
            <div className="mini-title">{currentTrack.title}</div>
            {currentTrack.artist && (
              <div className="mini-artist">{currentTrack.artist}</div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="mini-controls">
          {queueIndex > 0 && (
            <button
              onClick={player.previousTrack}
              className="mini-btn"
              title="Previous Track"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polygon points="19,20 9,12 19,4" />
                <line x1="5" y1="19" x2="5" y2="5" />
              </svg>
            </button>
          )}

          <button
            onClick={player.togglePlayPause}
            className="mini-play-btn"
            title={isPlaying ? "Pause" : "Play"}
          >
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 20 20">
              {isPlaying ? (
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              ) : (
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                  clipRule="evenodd"
                />
              )}
            </svg>
          </button>

          {queueIndex < queue.length - 1 && (
            <button
              onClick={player.nextTrack}
              className="mini-btn"
              title="Next Track"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polygon points="5,4 15,12 5,20" />
                <line x1="19" y1="5" x2="19" y2="19" />
              </svg>
            </button>
          )}
        </div>

        {/* Time Display */}
        <div className="mini-time">
          <span>{formatTime(currentTime)}</span>
          <span className="time-separator">/</span>
          <span>{formatTime(duration)}</span>
        </div>

        {/* Volume Control */}
        <div className="mini-volume">
          <button
            onClick={() => setShowVolume(!showVolume)}
            className="mini-btn"
            title="Volume"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              {volume > 0 ? (
                <>
                  <polygon points="11,5 6,9 2,9 2,15 6,15 11,19 11,5" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                </>
              ) : (
                <>
                  <polygon points="11,5 6,9 2,9 2,15 6,15 11,19 11,5" />
                  <line x1="23" y1="9" x2="17" y2="15" />
                  <line x1="17" y1="9" x2="23" y2="15" />
                </>
              )}
            </svg>
          </button>

          {showVolume && (
            <div className="volume-popup">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => player.setVolume(parseFloat(e.target.value))}
                className="volume-slider"
                title="Volume"
              />
            </div>
          )}
        </div>
      </div>

      {/* Expanded View */}
      {isExpanded && (
        <div className="mini-expanded">
          <div className="expanded-waveform">
            {hasWaveform ? (
              <div ref={waveformRef} className="mini-waveform" />
            ) : (
              <div className="waveform-placeholder">
                <div className="waveform-bars">
                  <div className="waveform-bar" style={{ height: "40%" }} />
                  <div className="waveform-bar" style={{ height: "70%" }} />
                  <div className="waveform-bar" style={{ height: "50%" }} />
                  <div className="waveform-bar" style={{ height: "30%" }} />
                  <div className="waveform-bar" style={{ height: "60%" }} />
                </div>
              </div>
            )}
          </div>

          <div className="expanded-controls">
            <button className="expanded-btn" title="Loop">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M17 2a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4h10z" />
                <path d="M7 8l3 3-3 3" />
                <path d="M17 8l-3 3 3 3" />
              </svg>
            </button>

            <button className="expanded-btn" title="Shuffle">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="16,3 21,3 21,8" />
                <line x1="4" y1="20" x2="21" y2="3" />
                <polyline points="21,16 21,21 16,21" />
                <line x1="15" y1="15" x2="21" y2="21" />
                <line x1="4" y1="4" x2="9" y2="9" />
              </svg>
            </button>

            <button className="expanded-btn" title="Queue">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
}
