"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { log } from "../lib/logger";
import {
  SPEED_OPTIONS,
  EQ_BANDS,
  AUDIO_CONSTANTS,
  WAVEFORM_CONFIG,
  SPECTRUM_CONFIG,
} from "../constants/audio";

interface AudioPlayerProps {
  audioUrl: string;
  title: string;
  artist?: string;
  comments?: Array<{ id: string; audioTimestamp?: number }>;
  onNextTrack?: () => void;
  onPreviousTrack?: () => void;
  onQueueChange?: (queue: any[]) => void;
}

interface EQBand {
  frequency: number;
  gain: number;
  q: number;
}

export default function AudioPlayer({
  audioUrl,
  title,
  artist,
  comments = [],
  onNextTrack,
  onPreviousTrack,
  onQueueChange,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const waveformRef = useRef<HTMLDivElement>(null);
  const spectrumRef = useRef<HTMLCanvasElement>(null);
  const wavesurfer = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const eqNodesRef = useRef<BiquadFilterNode[]>([]);

  // Basic playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hasWaveform, setHasWaveform] = useState(false);
  const [volume, setVolume] = useState<number>(AUDIO_CONSTANTS.DEFAULT_VOLUME);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(
    AUDIO_CONSTANTS.DEFAULT_PLAYBACK_SPEED
  );
  const [showSpeedDropdown, setShowSpeedDropdown] = useState(false);

  // Advanced features
  const [isLooping, setIsLooping] = useState(false);
  const [loopStart, setLoopStart] = useState<number | null>(null);
  const [loopEnd, setLoopEnd] = useState<number | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<number | null>(null);
  const [showEQ, setShowEQ] = useState(false);
  const [showSpectrum, setShowSpectrum] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [queue, setQueue] = useState<any[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

  // EQ settings
  const [eqBands, setEqBands] = useState<EQBand[]>([...EQ_BANDS]);

  const speedOptions = SPEED_OPTIONS;

  // Reset settings when audio URL changes
  useEffect(() => {
    setPlaybackSpeed(AUDIO_CONSTANTS.DEFAULT_PLAYBACK_SPEED);
    setShowSpeedDropdown(false);
    clearLoop();
    resetEQ();
  }, [audioUrl]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      // Cleanup WaveSurfer
      if (wavesurfer.current) {
        try {
          wavesurfer.current.destroy();
        } catch (error) {
          log.warn("Error destroying WaveSurfer on unmount", { error });
        }
        wavesurfer.current = null;
      }

      // Cleanup audio context
      if (audioContextRef.current) {
        try {
          audioContextRef.current.close();
        } catch (error) {
          log.warn("Error closing audio context", { error });
        }
        audioContextRef.current = null;
      }
    };
  }, []);

  // Initialize Web Audio API
  useEffect(() => {
    if (typeof window !== "undefined" && !audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = SPECTRUM_CONFIG.fftSize;

      // Create EQ nodes
      eqNodesRef.current = eqBands.map((band) => {
        const filter = audioContextRef.current!.createBiquadFilter();
        filter.type = "peaking";
        filter.frequency.value = band.frequency;
        filter.gain.value = band.gain;
        filter.Q.value = band.q;
        return filter;
      });
    }
  }, []);

  // HTML5 audio setup with Web Audio integration
  useEffect(() => {
    if (!audioRef.current || !audioContextRef.current) return;

    const audio = audioRef.current;
    const audioContext = audioContextRef.current;
    const analyser = analyserRef.current!;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
      audio.playbackRate = playbackSpeed;

      // Connect audio to Web Audio API
      const source = audioContext.createMediaElementSource(audio);

      // Connect through EQ chain
      let currentNode: AudioNode = source;
      eqNodesRef.current.forEach((filter) => {
        currentNode.connect(filter);
        currentNode = filter;
      });

      // Connect to analyser and output
      currentNode.connect(analyser);
      analyser.connect(audioContext.destination);
    };

    const handleTimeUpdate = () => {
      const time = audio.currentTime;
      setCurrentTime(time);

      // Handle looping
      if (
        isLooping &&
        loopStart !== null &&
        loopEnd !== null &&
        time >= loopEnd
      ) {
        audio.currentTime = loopStart;
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      setIsPlaying(false);
      if (queue.length > 0 && currentTrackIndex < queue.length - 1) {
        playNextTrack();
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
  }, [audioUrl, isLooping, loopStart, loopEnd, queue, currentTrackIndex]);

  // Spectrum analyzer animation
  useEffect(() => {
    if (!showSpectrum || !spectrumRef.current || !analyserRef.current) return;

    const canvas = spectrumRef.current;
    const ctx = canvas.getContext("2d")!;
    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const drawSpectrum = () => {
      if (!showSpectrum) return;

      requestAnimationFrame(drawSpectrum);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * canvas.height;

        // Create gradient based on frequency
        const gradient = ctx.createLinearGradient(
          0,
          canvas.height - barHeight,
          0,
          canvas.height
        );
        const hue = (i / bufferLength) * 360;
        gradient.addColorStop(0, `hsl(${hue}, 70%, 60%)`);
        gradient.addColorStop(1, `hsl(${hue}, 70%, 30%)`);

        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }
    };

    drawSpectrum();
  }, [showSpectrum]);

  // Queue management
  const addToQueue = useCallback(
    (track: any) => {
      setQueue((prev) => [...prev, track]);
      onQueueChange?.([...queue, track]);
    },
    [queue, onQueueChange]
  );

  const removeFromQueue = useCallback((index: number) => {
    setQueue((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const playNextTrack = useCallback(() => {
    if (currentTrackIndex < queue.length - 1) {
      setCurrentTrackIndex((prev) => prev + 1);
      onNextTrack?.();
    }
  }, [currentTrackIndex, queue.length, onNextTrack]);

  const playPreviousTrack = useCallback(() => {
    if (currentTrackIndex > 0) {
      setCurrentTrackIndex((prev) => prev - 1);
      onPreviousTrack?.();
    }
  }, [currentTrackIndex, onPreviousTrack]);

  // EQ controls
  const updateEQBand = useCallback((index: number, gain: number) => {
    setEqBands((prev) => {
      const newBands = [...prev];
      newBands[index].gain = gain;
      return newBands;
    });

    if (eqNodesRef.current[index]) {
      eqNodesRef.current[index].gain.value = gain;
    }
  }, []);

  const resetEQ = useCallback(() => {
    setEqBands((prev) => prev.map((band) => ({ ...band, gain: 0 })));
    eqNodesRef.current.forEach((node) => {
      node.gain.value = 0;
    });
  }, []);

  // Enhanced seek function
  const seekToTime = useCallback(
    (time: number) => {
      if (hasWaveform && wavesurfer.current) {
        wavesurfer.current.seekTo(time / duration);
      } else if (audioRef.current) {
        audioRef.current.currentTime = time;
      }
    },
    [hasWaveform, duration]
  );

  // Expose functions globally for keyboard shortcuts
  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).seekToAudioTime = seekToTime;
      (window as any).togglePlayPause = togglePlayPause;
      (window as any).nextTrack = playNextTrack;
      (window as any).previousTrack = playPreviousTrack;
      (window as any).volumeUp = () => adjustVolume(0.1);
      (window as any).volumeDown = () => adjustVolume(-0.1);
      (window as any).toggleMute = toggleMute;
      (window as any).restart = restart;
      (window as any).changePlaybackSpeed = changePlaybackSpeed;
      (window as any).toggleFullscreen = () => setIsFullscreen(!isFullscreen);
    }
  }, [seekToTime, playNextTrack, playPreviousTrack, isFullscreen]);

  // WaveSurfer setup (enhanced)
  useEffect(() => {
    let isMounted = true;
    let wavesurferInstance: any = null;

    const initWaveSurfer = async () => {
      try {
        if (!waveformRef.current) return;

        const WaveSurfer = (await import("wavesurfer.js")).default;

        // Safely destroy existing instance
        if (wavesurfer.current) {
          try {
            wavesurfer.current.destroy();
          } catch (error) {
            console.warn(
              "Error destroying previous WaveSurfer instance:",
              error
            );
          }
          wavesurfer.current = null;
        }

        // Create new instance
        wavesurferInstance = WaveSurfer.create({
          container: waveformRef.current,
          waveColor: "#525252",
          progressColor: "#f5f5f5",
          cursorColor: "#f5f5f5",
          barWidth: 2,
          barRadius: 2,
          barGap: 1,
          height: 120,
          normalize: true,
          interact: true,
          hideScrollbar: true,
          autoCenter: true,
        });

        wavesurfer.current = wavesurferInstance;

        // Load audio with error handling
        try {
          await wavesurferInstance.load(audioUrl);
        } catch (loadError) {
          console.error("Error loading audio:", loadError);
          return;
        }

        wavesurferInstance.on("ready", () => {
          if (isMounted && wavesurferInstance) {
            setHasWaveform(true);
            setDuration(wavesurferInstance.getDuration());
            addCommentMarkers();
          }
        });

        wavesurferInstance.on("audioprocess", () => {
          if (isMounted && wavesurferInstance) {
            try {
              const time = wavesurferInstance.getCurrentTime();
              setCurrentTime(time);

              if (
                isLooping &&
                loopStart !== null &&
                loopEnd !== null &&
                time >= loopEnd
              ) {
                wavesurferInstance.seekTo(loopStart / duration);
              }
            } catch (error) {
              console.warn("Error in audioprocess:", error);
            }
          }
        });

        wavesurferInstance.on("play", () => {
          if (isMounted) setIsPlaying(true);
        });

        wavesurferInstance.on("pause", () => {
          if (isMounted) setIsPlaying(false);
        });

        wavesurferInstance.on("error", (error: any) => {
          console.error("WaveSurfer error:", error);
        });

        // Enhanced click handling
        wavesurferInstance.on("click", (progress: number) => {
          if (isMounted) {
            const clickTime = progress * duration;

            if (
              typeof window !== "undefined" &&
              (window as any).setCommentTimestamp
            ) {
              (window as any).setCommentTimestamp(clickTime);
            }
          }
        });
      } catch (error) {
        console.error("Failed to initialize WaveSurfer:", error);
      }
    };

    initWaveSurfer();

    return () => {
      isMounted = false;

      // Safely destroy WaveSurfer instance
      if (wavesurferInstance) {
        try {
          wavesurferInstance.destroy();
        } catch (error) {
          console.warn("Error destroying WaveSurfer instance:", error);
        }
        wavesurferInstance = null;
      }

      if (wavesurfer.current) {
        wavesurfer.current = null;
      }
    };
  }, [audioUrl, duration, isLooping, loopStart, loopEnd]);

  // Comment markers
  const addCommentMarkers = useCallback(() => {
    if (!wavesurfer.current || !hasWaveform) return;

    comments.forEach((comment, index) => {
      if (comment.audioTimestamp !== undefined && duration > 0) {
        const position = comment.audioTimestamp / duration;
        wavesurfer.current.addMarker({
          time: comment.audioTimestamp,
          color: "#3b82f6",
          position: "top",
        });
      }
    });
  }, [comments, duration, hasWaveform]);

  // Loop functionality
  const loopStateRef = useRef({ isLooping, loopStart, loopEnd });

  useEffect(() => {
    loopStateRef.current = { isLooping, loopStart, loopEnd };
  }, [isLooping, loopStart, loopEnd]);

  const clearLoop = useCallback(() => {
    setIsLooping(false);
    setLoopStart(null);
    setLoopEnd(null);
    setIsSelecting(false);
    setSelectionStart(null);
  }, []);

  const handleLoopSelection = useCallback(
    (time: number) => {
      if (!isSelecting) {
        setIsSelecting(true);
        setSelectionStart(time);
        setLoopStart(time);
      } else {
        setIsSelecting(false);
        setLoopEnd(time);
        if (selectionStart !== null && time > selectionStart) {
          setIsLooping(true);
        }
      }
    },
    [isSelecting, selectionStart]
  );

  // Enhanced keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const { key, ctrlKey, metaKey, shiftKey } = event as any;
      const modifier = ctrlKey || metaKey;

      switch (key) {
        case " ":
          e.preventDefault();
          togglePlayPause();
          break;
        case "ArrowRight":
          e.preventDefault();
          if (modifier) {
            seekRelative(10);
          } else {
            playNextTrack();
          }
          break;
        case "ArrowLeft":
          e.preventDefault();
          if (modifier) {
            seekRelative(-10);
          } else {
            playPreviousTrack();
          }
          break;
        case "ArrowUp":
          e.preventDefault();
          adjustVolume(0.1);
          break;
        case "ArrowDown":
          e.preventDefault();
          adjustVolume(-0.1);
          break;
        case "m":
          e.preventDefault();
          toggleMute();
          break;
        case "l":
          e.preventDefault();
          setIsLooping(!isLooping);
          break;
        case "r":
          e.preventDefault();
          restart();
          break;
        case "f":
          e.preventDefault();
          setIsFullscreen(!isFullscreen);
          break;
        case "e":
          e.preventDefault();
          setShowEQ(!showEQ);
          break;
        case "s":
          e.preventDefault();
          setShowSpectrum(!showSpectrum);
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isLooping, isFullscreen, showEQ, showSpectrum]);

  // Utility functions
  const seekRelative = useCallback(
    (seconds: number) => {
      const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
      seekToTime(newTime);
    },
    [currentTime, duration, seekToTime]
  );

  const adjustVolume = useCallback(
    (delta: number) => {
      const newVolume = Math.max(0, Math.min(1, volume + delta));
      setVolume(newVolume);

      if (hasWaveform && wavesurfer.current) {
        wavesurfer.current.setVolume(newVolume);
      } else if (audioRef.current) {
        audioRef.current.volume = newVolume;
      }
    },
    [volume, hasWaveform]
  );

  const togglePlayPause = useCallback(() => {
    if (hasWaveform && wavesurfer.current) {
      wavesurfer.current.playPause();
    } else if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  }, [hasWaveform, isPlaying]);

  const seek = useCallback(
    (percentage: number) => {
      if (hasWaveform && wavesurfer.current) {
        wavesurfer.current.seekTo(percentage / 100);
      } else if (audioRef.current && duration) {
        audioRef.current.currentTime = (percentage / 100) * duration;
      }
    },
    [hasWaveform, duration]
  );

  const handleProgressBarClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const percentage = ((e.clientX - rect.left) / rect.width) * 100;
      const clickTime = (percentage / 100) * duration;

      if (e.altKey) {
        handleLoopSelection(clickTime);
      } else if (
        e.shiftKey &&
        typeof window !== "undefined" &&
        (window as any).setCommentTimestamp
      ) {
        (window as any).setCommentTimestamp(clickTime);
      } else {
        seek(percentage);
      }
    },
    [duration, handleLoopSelection, seek]
  );

  const toggleMute = useCallback(() => {
    const newVolume = volume > 0 ? 0 : 1;
    setVolume(newVolume);

    if (hasWaveform && wavesurfer.current) {
      wavesurfer.current.setVolume(newVolume);
    } else if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  }, [volume, hasWaveform]);

  const restart = useCallback(() => {
    if (hasWaveform && wavesurfer.current) {
      wavesurfer.current.seekTo(0);
    } else if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  }, [hasWaveform]);

  const changePlaybackSpeed = useCallback(
    (speed: number) => {
      setPlaybackSpeed(speed);
      setShowSpeedDropdown(false);

      if (hasWaveform && wavesurfer.current) {
        wavesurfer.current.setPlaybackRate(speed);
      } else if (audioRef.current) {
        audioRef.current.playbackRate = speed;
      }
    },
    [hasWaveform]
  );

  const formatTime = useCallback((seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, []);

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className={`audio-player-enhanced ${isFullscreen ? "fullscreen" : ""}`}
    >
      {/* Hidden HTML5 audio */}
      <audio
        ref={audioRef}
        src={audioUrl}
        preload="metadata"
        className="hidden"
      />

      {/* Enhanced Player Interface */}
      <div className="player-container">
        {/* Header with track info and controls */}
        <div className="player-header">
          <div className="track-info">
            <h2 className="track-title">{title}</h2>
            {artist && <p className="track-artist">{artist}</p>}
          </div>

          <div className="header-controls">
            <button
              onClick={() => setShowEQ(!showEQ)}
              className={`control-btn ${showEQ ? "active" : ""}`}
              title="Toggle EQ (E)"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M3 6h18M7 12h10M9 18h6" />
              </svg>
            </button>

            <button
              onClick={() => setShowSpectrum(!showSpectrum)}
              className={`control-btn ${showSpectrum ? "active" : ""}`}
              title="Toggle Spectrum (S)"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M3 3v18h18M7 7l3 3-3 3M14 7l3 3-3 3" />
              </svg>
            </button>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="control-btn"
              title="Toggle Fullscreen (F)"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
              </svg>
            </button>
          </div>
        </div>

        {/* Main player area */}
        <div className="player-main">
          {/* Waveform */}
          <div className="waveform-container">
            <div
              ref={waveformRef}
              className="waveform"
              style={{ minHeight: "120px" }}
            />

            {/* Fallback progress bar */}
            {!hasWaveform && (
              <div className="progress-fallback">
                <div
                  className="progress-bar"
                  onClick={handleProgressBarClick}
                  title="Click to seek, Alt+Click for loop selection, Shift+Click for timestamp comment"
                >
                  <div
                    className="progress-fill"
                    style={{ width: `${progressPercentage}%` }}
                  />

                  {/* Loop region overlay */}
                  {loopStart !== null && loopEnd !== null && duration > 0 && (
                    <div
                      className="loop-overlay"
                      style={{
                        left: `${(loopStart / duration) * 100}%`,
                        width: `${((loopEnd - loopStart) / duration) * 100}%`,
                      }}
                    />
                  )}
                </div>

                <div className="time-display">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
              </div>
            )}
          </div>

          {/* Spectrum Analyzer */}
          {showSpectrum && (
            <div className="spectrum-container">
              <canvas
                ref={spectrumRef}
                className="spectrum-canvas"
                width={800}
                height={60}
              />
            </div>
          )}

          {/* EQ Panel */}
          {showEQ && (
            <div className="eq-panel">
              <div className="eq-header">
                <h3>Equalizer</h3>
                <button onClick={resetEQ} className="reset-btn">
                  Reset
                </button>
              </div>
              <div className="eq-controls">
                {eqBands.map((band, index) => (
                  <div key={index} className="eq-band">
                    <input
                      type="range"
                      min="-12"
                      max="12"
                      step="0.1"
                      value={band.gain}
                      onChange={(e) =>
                        updateEQBand(index, parseFloat(e.target.value))
                      }
                      className="eq-slider"
                    />
                    <span className="eq-label">{band.frequency}Hz</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Control Bar */}
        <div className="control-bar">
          {/* Transport Controls */}
          <div className="transport-controls">
            <button
              onClick={playPreviousTrack}
              className="control-btn"
              disabled={currentTrackIndex === 0}
              title="Previous Track (Ctrl+←)"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polygon points="19,20 9,12 19,4" />
                <line x1="5" y1="19" x2="5" y2="5" />
              </svg>
            </button>

            <button
              onClick={togglePlayPause}
              className="play-btn"
              title="Play/Pause (Space)"
            >
              <svg
                width="24"
                height="24"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
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

            <button
              onClick={playNextTrack}
              className="control-btn"
              disabled={currentTrackIndex >= queue.length - 1}
              title="Next Track (Ctrl+→)"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polygon points="5,4 15,12 5,20" />
                <line x1="19" y1="5" x2="19" y2="19" />
              </svg>
            </button>

            <button
              onClick={restart}
              className="control-btn"
              title="Restart (R)"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                <path d="M3 21v-5h5" />
              </svg>
            </button>
          </div>

          {/* Playback Controls */}
          <div className="playback-controls">
            <div className="speed-control">
              <button
                onClick={() => setShowSpeedDropdown(!showSpeedDropdown)}
                className="speed-btn"
                title="Playback Speed"
              >
                {playbackSpeed}x
              </button>

              {showSpeedDropdown && (
                <div className="speed-dropdown">
                  {speedOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => changePlaybackSpeed(option.value)}
                      className={`speed-option ${
                        playbackSpeed === option.value ? "active" : ""
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setIsLooping(!isLooping)}
              className={`control-btn ${isLooping ? "active" : ""}`}
              title="Toggle Loop (L)"
            >
              <svg
                width="20"
                height="20"
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
          </div>

          {/* Volume and Time */}
          <div className="volume-time-controls">
            <div className="volume-control">
              <button
                onClick={toggleMute}
                className="control-btn"
                title="Toggle Mute (M)"
              >
                <svg
                  width="20"
                  height="20"
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

              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) =>
                  adjustVolume(parseFloat(e.target.value) - volume)
                }
                className="volume-slider"
                title="Volume"
              />
            </div>

            <div className="time-display">
              <span>{formatTime(currentTime)}</span>
              <span className="time-separator">/</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>

        {/* Queue Panel */}
        {queue.length > 0 && (
          <div className="queue-panel">
            <h3>Queue ({queue.length})</h3>
            <div className="queue-list">
              {queue.map((track, index) => (
                <div
                  key={index}
                  className={`queue-item ${
                    index === currentTrackIndex ? "current" : ""
                  }`}
                >
                  <span className="queue-title">{track.title}</span>
                  <span className="queue-artist">{track.artist}</span>
                  <button
                    onClick={() => removeFromQueue(index)}
                    className="remove-btn"
                    title="Remove from queue"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Hints */}
      <div className="player-hints">
        <p>
          Space: Play/Pause • ←→: Seek • ↑↓: Volume • L: Loop • R: Restart • F:
          Fullscreen • E: EQ • S: Spectrum
        </p>
      </div>
    </div>
  );
}
