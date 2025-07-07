"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Repeat,
  Shuffle,
  Cloud,
  CloudOff,
  AlertCircle,
} from "lucide-react";

interface Comment {
  id: string;
  author: string;
  message: string;
  timestamp: number;
  audioTimestamp?: number;
}

interface CloudSyncStatus {
  isEnabled: boolean;
  isSync: boolean;
  hasError: boolean;
  lastSync?: Date;
  status: "synced" | "pending" | "error" | "disabled";
}

interface UnifiedAudioPlayerProps {
  audioUrl: string;
  title: string;
  artist?: string;
  comments?: Comment[];
  onTimeUpdate?: (time: number) => void;
  cloudSync?: CloudSyncStatus;
  className?: string;
}

export default function UnifiedAudioPlayer({
  audioUrl,
  title,
  artist,
  comments = [],
  onTimeUpdate,
  cloudSync = {
    isEnabled: false,
    isSync: false,
    hasError: false,
    status: "disabled",
  },
  className = "",
}: UnifiedAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<any>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  // Core player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);

  // Waveform state
  const [waveformReady, setWaveformReady] = useState(false);
  const [waveformError, setWaveformError] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // UI state
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Initialize WaveSurfer with proper error handling
  useEffect(() => {
    let mounted = true;
    let wavesurfer: any = null;

    const initWaveform = async () => {
      try {
        if (!waveformRef.current || !audioUrl) return;

        // Dynamic import to avoid SSR issues
        const WaveSurfer = (await import("wavesurfer.js")).default;

        // Clean up previous instance
        if (wavesurferRef.current) {
          wavesurferRef.current.destroy();
          wavesurferRef.current = null;
        }

        // Create new instance with minimal config
        wavesurfer = WaveSurfer.create({
          container: waveformRef.current,
          waveColor: "rgba(255, 255, 255, 0.3)",
          progressColor: "rgba(255, 255, 255, 0.8)",
          cursorColor: "rgba(255, 255, 255, 0.9)",
          barWidth: 1,
          barRadius: 0,
          cursorWidth: 1,
          height: 60,
          barGap: 1,
          normalize: true,
          interact: true,
          hideScrollbar: true,
        });

        wavesurferRef.current = wavesurfer;

        // Load audio
        await wavesurfer.load(audioUrl);

        // Setup event listeners
        wavesurfer.on("ready", () => {
          if (mounted) {
            setWaveformReady(true);
            setWaveformError(false);
            setDuration(wavesurfer.getDuration());
          }
        });

        wavesurfer.on("audioprocess", (time: number) => {
          if (mounted) {
            setCurrentTime(time);
            onTimeUpdate?.(time);
          }
        });

        wavesurfer.on("play", () => {
          if (mounted) setIsPlaying(true);
        });

        wavesurfer.on("pause", () => {
          if (mounted) setIsPlaying(false);
        });

        wavesurfer.on("finish", () => {
          if (mounted) {
            setIsPlaying(false);
            if (isLooping) {
              setTimeout(() => wavesurfer?.play(), 100);
            }
          }
        });

        wavesurfer.on("error", (error: any) => {
          console.error("WaveSurfer error:", error);
          if (mounted) {
            setWaveformError(true);
            setWaveformReady(false);
          }
        });
      } catch (error) {
        console.error("Failed to initialize WaveSurfer:", error);
        if (mounted) {
          setWaveformError(true);
          setWaveformReady(false);
        }
      }
    };

    initWaveform();

    return () => {
      mounted = false;
      if (wavesurfer) {
        try {
          wavesurfer.destroy();
        } catch (e) {
          console.warn("Error destroying WaveSurfer:", e);
        }
      }
    };
  }, [audioUrl, isLooping, onTimeUpdate]);

  // Fallback audio element for when waveform fails
  useEffect(() => {
    if (!audioRef.current || waveformReady) return;

    const audio = audioRef.current;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      onTimeUpdate?.(audio.currentTime);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      setIsPlaying(false);
      if (isLooping) {
        audio.currentTime = 0;
        audio.play();
      }
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [waveformReady, isLooping, onTimeUpdate]);

  // Control functions
  const togglePlayPause = useCallback(() => {
    if (waveformReady && wavesurferRef.current) {
      wavesurferRef.current.playPause();
    } else if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  }, [waveformReady, isPlaying]);

  const seekTo = useCallback(
    (percentage: number) => {
      if (waveformReady && wavesurferRef.current) {
        wavesurferRef.current.seekTo(percentage / 100);
      } else if (audioRef.current && duration) {
        audioRef.current.currentTime = (percentage / 100) * duration;
      }
    },
    [waveformReady, duration]
  );

  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!progressRef.current) return;

      const rect = progressRef.current.getBoundingClientRect();
      const percentage = ((e.clientX - rect.left) / rect.width) * 100;
      seekTo(percentage);
    },
    [seekTo]
  );

  const toggleVolume = useCallback(() => {
    if (isMuted) {
      setIsMuted(false);
      if (waveformReady && wavesurferRef.current) {
        wavesurferRef.current.setVolume(volume);
      } else if (audioRef.current) {
        audioRef.current.volume = volume;
      }
    } else {
      setIsMuted(true);
      if (waveformReady && wavesurferRef.current) {
        wavesurferRef.current.setVolume(0);
      } else if (audioRef.current) {
        audioRef.current.volume = 0;
      }
    }
  }, [isMuted, volume, waveformReady]);

  const handleVolumeChange = useCallback(
    (newVolume: number) => {
      setVolume(newVolume);
      setIsMuted(newVolume === 0);

      if (waveformReady && wavesurferRef.current) {
        wavesurferRef.current.setVolume(newVolume);
      } else if (audioRef.current) {
        audioRef.current.volume = newVolume;
      }
    },
    [waveformReady]
  );

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  const cloudSyncIcon = () => {
    switch (cloudSync.status) {
      case "synced":
        return <Cloud className="w-4 h-4 text-green-400" />;
      case "pending":
        return <Cloud className="w-4 h-4 text-yellow-400 animate-pulse" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return <CloudOff className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className={`unified-audio-player ${className}`}>
      {/* Hidden audio element fallback */}
      <audio ref={audioRef} src={audioUrl} loop={isLooping} />

      {/* Header with track info and cloud sync */}
      <div className="player-header">
        <div className="track-info">
          <h3 className="track-title">{title}</h3>
          {artist && <p className="track-artist">{artist}</p>}
        </div>

        <div
          className="cloud-sync-indicator"
          title={`Cloud sync: ${cloudSync.status}`}
        >
          {cloudSyncIcon()}
        </div>
      </div>

      {/* Waveform or progress bar */}
      <div className="waveform-section">
        <div
          className="relative w-full h-[60px] bg-neutral-800/50 rounded-lg overflow-hidden"
          ref={progressRef}
          onClick={handleProgressClick}
        >
          <AnimatePresence>
            {waveformReady && (
              <motion.div
                ref={waveformRef}
                className="w-full h-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            )}
          </AnimatePresence>
          <AnimatePresence>
            {isClient && !waveformReady && (
              <motion.div
                className="absolute inset-0 flex items-center justify-between px-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {[...Array(60)].map((_, i) => (
                  <div
                    key={i}
                    className="w-0.5 bg-neutral-600/50 rounded-full"
                    style={{
                      height: `${Math.random() * 70 + 10}%`,
                      opacity: 0.3,
                    }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Comment markers */}
        {comments.map((comment) => {
          if (!comment.audioTimestamp || !duration) return null;
          const position = (comment.audioTimestamp / duration) * 100;
          return (
            <motion.div
              key={comment.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="comment-marker"
              style={{ left: `${position}%` }}
              title={`${comment.author}: ${comment.message}`}
            />
          );
        })}
      </div>

      {/* Controls */}
      <div className="player-controls">
        <div className="transport-controls">
          <button
            className="control-btn"
            onClick={() =>
              seekTo(Math.max(0, ((currentTime - 10) / duration) * 100))
            }
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button className="play-button" onClick={togglePlayPause}>
            {isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5" />
            )}
          </button>

          <button
            className="control-btn"
            onClick={() =>
              seekTo(Math.min(100, ((currentTime + 10) / duration) * 100))
            }
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        <div className="time-display">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>

        <div className="secondary-controls">
          <button
            className={`control-btn ${isLooping ? "active" : ""}`}
            onClick={() => setIsLooping(!isLooping)}
          >
            <Repeat className="w-4 h-4" />
          </button>

          <div
            className="volume-control"
            onMouseEnter={() => setShowVolumeSlider(true)}
            onMouseLeave={() => setShowVolumeSlider(false)}
          >
            <button className="control-btn" onClick={toggleVolume}>
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>

            <AnimatePresence>
              {showVolumeSlider && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="volume-slider"
                >
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={isMuted ? 0 : volume}
                    onChange={(e) =>
                      handleVolumeChange(parseFloat(e.target.value))
                    }
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
