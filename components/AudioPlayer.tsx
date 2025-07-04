"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface AudioPlayerProps {
  audioUrl: string;
  title: string;
  comments?: Array<{ id: string; audioTimestamp?: number }>;
}

export default function AudioPlayer({
  audioUrl,
  title,
  comments = [],
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurfer = useRef<any>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hasWaveform, setHasWaveform] = useState(false);
  const [volume, setVolume] = useState(1);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSpeedDropdown, setShowSpeedDropdown] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);

  // Loop functionality
  const [isLooping, setIsLooping] = useState(false);
  const [loopStart, setLoopStart] = useState<number | null>(null);
  const [loopEnd, setLoopEnd] = useState<number | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<number | null>(null);

  const speedOptions = [
    { value: 0.5, label: "0.5x" },
    { value: 0.75, label: "0.75x" },
    { value: 1, label: "1x" },
    { value: 1.25, label: "1.25x" },
    { value: 1.5, label: "1.5x" },
    { value: 2, label: "2x" },
  ];

  // Reset speed and loop when audio URL changes
  useEffect(() => {
    setPlaybackSpeed(1);
    setShowSpeedDropdown(false);
    clearLoop();
  }, [audioUrl]);

  // HTML5 audio setup
  useEffect(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
      audio.playbackRate = playbackSpeed;
    };

    const handleTimeUpdate = () => {
      const time = audio.currentTime;
      setCurrentTime(time);

      // Handle looping - use ref for current state
      const currentLoopState = loopStateRef.current;
      if (
        currentLoopState.isLooping &&
        currentLoopState.loopStart !== null &&
        currentLoopState.loopEnd !== null &&
        time >= currentLoopState.loopEnd
      ) {
        console.log("Loop: jumping to start");
        audio.currentTime = currentLoopState.loopStart;
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

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
  }, [audioUrl]);

  // Create seek function for comments
  const seekToTime = (time: number) => {
    if (hasWaveform && wavesurfer.current) {
      wavesurfer.current.seekTo(time / duration);
    } else if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  // Expose seek function globally for comments
  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).seekToAudioTime = seekToTime;
    }
  }, [hasWaveform, duration]);

  // WaveSurfer setup
  useEffect(() => {
    let isMounted = true;

    const initWaveSurfer = async () => {
      try {
        console.log("Loading WaveSurfer...");

        if (!waveformRef.current) {
          console.log("Container not ready");
          return;
        }

        const WaveSurfer = (await import("wavesurfer.js")).default;

        if (wavesurfer.current) {
          wavesurfer.current.destroy();
        }

        wavesurfer.current = WaveSurfer.create({
          container: waveformRef.current,
          waveColor: "#525252",
          progressColor: "#f5f5f5",
          cursorColor: "#f5f5f5",
          barWidth: 2,
          barRadius: 2,
          barGap: 1,
          height: 80,
          normalize: true,
        });

        wavesurfer.current.load(audioUrl);

        wavesurfer.current.on("ready", () => {
          console.log("WaveSurfer ready!");
          if (isMounted) {
            setHasWaveform(true);
            setDuration(wavesurfer.current.getDuration());
            addCommentMarkers();
          }
        });

        wavesurfer.current.on("audioprocess", () => {
          if (isMounted) {
            const time = wavesurfer.current.getCurrentTime();
            setCurrentTime(time);

            // Handle looping for WaveSurfer - use ref for current state
            const currentLoopState = loopStateRef.current;
            if (
              currentLoopState.isLooping &&
              currentLoopState.loopStart !== null &&
              currentLoopState.loopEnd !== null &&
              time >= currentLoopState.loopEnd
            ) {
              console.log("Loop: jumping to start");
              wavesurfer.current.seekTo(currentLoopState.loopStart / duration);
            }
          }
        });

        wavesurfer.current.on("play", () => {
          if (isMounted) setIsPlaying(true);
        });

        wavesurfer.current.on("pause", () => {
          if (isMounted) setIsPlaying(false);
        });

        wavesurfer.current.on("error", (error: any) => {
          console.error("WaveSurfer error:", error);
        });

        // Note: Alt+Click handler will be added in separate useEffect to ensure fresh handleLoopSelection reference

        wavesurfer.current.on("click", (progress: number) => {
          if (isMounted) {
            const clickTime = progress * duration;
            console.log("WaveSurfer click at time:", clickTime);

            // Only handle timestamp comments if Alt is not pressed
            // (Alt+Click is handled by mousedown event above)
            if (
              typeof window !== "undefined" &&
              (window as any).setCommentTimestamp
            ) {
              console.log("Handling timestamp comment");
              (window as any).setCommentTimestamp(clickTime);
            } else {
              console.log("Regular WaveSurfer click - no special action");
            }
          }
        });
      } catch (error) {
        console.error("Failed to load WaveSurfer:", error);
      }
    };

    const timeout = setTimeout(initWaveSurfer, 100);

    return () => {
      isMounted = false;
      clearTimeout(timeout);
      if (wavesurfer.current) {
        wavesurfer.current.destroy();
      }
    };
  }, [audioUrl, duration]);

  // Add comment markers to waveform
  const addCommentMarkers = () => {
    if (!hasWaveform || !wavesurfer.current || !duration) return;

    comments.forEach((comment, index) => {
      if (comment.audioTimestamp !== undefined) {
        const position = (comment.audioTimestamp / duration) * 100;

        // Create marker element
        const marker = document.createElement("div");
        marker.style.position = "absolute";
        marker.style.left = `${position}%`;
        marker.style.top = "0";
        marker.style.bottom = "0";
        marker.style.width = "2px";
        marker.style.backgroundColor = "#3b82f6";
        marker.style.zIndex = "10";
        marker.style.cursor = "pointer";
        marker.style.opacity = "0.8";
        marker.title = `Comment at ${formatTime(comment.audioTimestamp)}`;

        // Add hover effect
        marker.addEventListener("mouseenter", () => {
          marker.style.backgroundColor = "#60a5fa";
          marker.style.width = "3px";
        });
        marker.addEventListener("mouseleave", () => {
          marker.style.backgroundColor = "#3b82f6";
          marker.style.width = "2px";
        });

        waveformRef.current?.appendChild(marker);
      }
    });
  };

  // Add loop overlay to waveform
  const addLoopOverlay = () => {
    if (
      !hasWaveform ||
      !wavesurfer.current ||
      !duration ||
      loopStart === null ||
      loopEnd === null
    )
      return;

    // Remove existing loop overlay
    const existingOverlay = waveformRef.current?.querySelector(".loop-overlay");
    if (existingOverlay) {
      existingOverlay.remove();
    }

    const startPercent = (loopStart / duration) * 100;
    const endPercent = (loopEnd / duration) * 100;
    const width = endPercent - startPercent;

    // Create loop overlay element
    const overlay = document.createElement("div");
    overlay.className = "loop-overlay";
    overlay.style.position = "absolute";
    overlay.style.left = `${startPercent}%`;
    overlay.style.top = "0";
    overlay.style.bottom = "0";
    overlay.style.width = `${width}%`;
    overlay.style.backgroundColor = isLooping
      ? "rgba(34, 197, 94, 0.2)"
      : "rgba(234, 179, 8, 0.2)";
    overlay.style.border = isLooping
      ? "1px solid rgba(34, 197, 94, 0.5)"
      : "1px solid rgba(234, 179, 8, 0.5)";
    overlay.style.zIndex = "5";
    overlay.style.pointerEvents = "none";
    overlay.title = `Loop: ${formatTime(loopStart)} - ${formatTime(loopEnd)}`;

    waveformRef.current?.appendChild(overlay);
  };

  // Update markers when comments change
  useEffect(() => {
    if (hasWaveform) {
      // Clear existing markers
      const markers = waveformRef.current?.querySelectorAll(
        '[title*="Comment at"]'
      );
      markers?.forEach((marker) => marker.remove());

      // Add new markers
      addCommentMarkers();
    }
  }, [comments, hasWaveform, duration]);

  // Update loop overlay when loop state changes
  useEffect(() => {
    if (hasWaveform) {
      addLoopOverlay();
    }
  }, [hasWaveform, duration, loopStart, loopEnd, isLooping]);

  // Close speed dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showSpeedDropdown) {
        const target = event.target as HTMLElement;
        if (!target.closest(".relative")) {
          setShowSpeedDropdown(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showSpeedDropdown]);

  // Apply playback speed when WaveSurfer is ready
  useEffect(() => {
    if (hasWaveform && wavesurfer.current && playbackSpeed !== 1) {
      wavesurfer.current.setPlaybackRate(playbackSpeed);
    }
  }, [hasWaveform, playbackSpeed]);

  // Use ref to track current state and bypass React timing
  const loopStateRef = useRef({ loopStart, loopEnd, isLooping });

  useEffect(() => {
    loopStateRef.current = { loopStart, loopEnd, isLooping };
  }, [loopStart, loopEnd, isLooping]);

  // Loop functions - using useCallback to avoid stale closure issues
  const handleLoopSelection = useCallback(
    (time: number) => {
      // Use ref values to avoid stale closure
      const currentState = loopStateRef.current;

      if (currentState.loopStart === null) {
        // First click - set start
        console.log("Setting loop start:", time);
        setLoopStart(time);
        setLoopEnd(null);
        setIsLooping(false);
      } else if (currentState.loopEnd === null) {
        // Second click - set end and enable loop
        const start = Math.min(currentState.loopStart, time);
        const end = Math.max(currentState.loopStart, time);
        console.log("Setting loop end and enabling:", start, "to", end);
        setLoopStart(start);
        setLoopEnd(end);
        setIsLooping(true);
      } else {
        // Third click - clear loop
        console.log("Clearing loop");
        setLoopStart(null);
        setLoopEnd(null);
        setIsLooping(false);
      }
    },
    [loopStart, loopEnd, isLooping]
  );

  const toggleLoop = useCallback(() => {
    console.log("toggleLoop called", { loopStart, loopEnd, isLooping });
    if (loopStart !== null && loopEnd !== null) {
      const newLoopState = !isLooping;
      console.log("Toggling loop to:", newLoopState);
      setIsLooping(newLoopState);
    } else {
      console.log("Cannot toggle loop - no loop points set");
    }
  }, [loopStart, loopEnd, isLooping]);

  const clearLoop = useCallback(() => {
    setLoopStart(null);
    setLoopEnd(null);
    setIsLooping(false);
  }, []);

  // Separate useEffect for Alt+Click handler to ensure fresh handleLoopSelection reference
  useEffect(() => {
    const waveformContainer = waveformRef.current;
    if (!waveformContainer || !hasWaveform) return;

    const handleAltClick = (e: MouseEvent) => {
      if (e.altKey) {
        e.preventDefault();
        const rect = waveformContainer.getBoundingClientRect();
        const progress = (e.clientX - rect.left) / rect.width;
        const clickTime = progress * duration;
        console.log("Alt+Click at time:", clickTime);
        handleLoopSelection(clickTime);
      }
    };

    waveformContainer.addEventListener("mousedown", handleAltClick);
    return () =>
      waveformContainer.removeEventListener("mousedown", handleAltClick);
  }, [hasWaveform, duration, handleLoopSelection]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input/textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement ||
        (e.target as HTMLElement)?.contentEditable === "true"
      ) {
        return;
      }

      switch (e.code) {
        case "Space":
          e.preventDefault();
          togglePlayPause();
          break;

        case "ArrowLeft":
          e.preventDefault();
          seekRelative(-10); // Seek back 10 seconds
          break;

        case "ArrowRight":
          e.preventDefault();
          seekRelative(10); // Seek forward 10 seconds
          break;

        case "ArrowUp":
          e.preventDefault();
          adjustVolume(0.1); // Increase volume
          break;

        case "ArrowDown":
          e.preventDefault();
          adjustVolume(-0.1); // Decrease volume
          break;

        case "Digit1":
          e.preventDefault();
          changePlaybackSpeed(0.5);
          break;

        case "Digit2":
          e.preventDefault();
          changePlaybackSpeed(0.75);
          break;

        case "Digit3":
          e.preventDefault();
          changePlaybackSpeed(1);
          break;

        case "Digit4":
          e.preventDefault();
          changePlaybackSpeed(1.25);
          break;

        case "Digit5":
          e.preventDefault();
          changePlaybackSpeed(1.5);
          break;

        case "Digit6":
          e.preventDefault();
          changePlaybackSpeed(2);
          break;

        case "KeyR":
          e.preventDefault();
          restart();
          break;

        case "KeyM":
          e.preventDefault();
          toggleMute();
          break;

        case "KeyL":
          e.preventDefault();
          toggleLoop();
          break;

        case "KeyC":
          if (e.shiftKey) {
            e.preventDefault();
            clearLoop();
          }
          break;

        case "Slash":
          if (e.shiftKey) {
            // Shift + / = ?
            e.preventDefault();
            setShowKeyboardHelp(!showKeyboardHelp);
          }
          break;

        case "Escape":
          e.preventDefault();
          setShowKeyboardHelp(false);
          setShowSpeedDropdown(false);
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    hasWaveform,
    duration,
    volume,
    isPlaying,
    toggleLoop,
    clearLoop,
    showKeyboardHelp,
  ]);

  // Helper functions for keyboard shortcuts
  const seekRelative = (seconds: number) => {
    if (hasWaveform && wavesurfer.current && duration) {
      const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
      wavesurfer.current.seekTo(newTime / duration);
    } else if (audioRef.current && duration) {
      const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
      audioRef.current.currentTime = newTime;
    }
  };

  const adjustVolume = (delta: number) => {
    const newVolume = Math.max(0, Math.min(1, volume + delta));
    setVolume(newVolume);

    if (hasWaveform && wavesurfer.current) {
      wavesurfer.current.setVolume(newVolume);
    } else if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const togglePlayPause = () => {
    if (hasWaveform && wavesurfer.current) {
      wavesurfer.current.playPause();
    } else if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  };

  const seek = (percentage: number) => {
    if (hasWaveform && wavesurfer.current) {
      wavesurfer.current.seekTo(percentage / 100);
    } else if (audioRef.current && duration) {
      audioRef.current.currentTime = (percentage / 100) * duration;
    }
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percentage = ((e.clientX - rect.left) / rect.width) * 100;
    const clickTime = (percentage / 100) * duration;

    console.log(
      "Progress bar click at time:",
      clickTime,
      "altKey:",
      e.altKey,
      "shiftKey:",
      e.shiftKey
    );

    // If alt is held, handle loop selection
    if (e.altKey) {
      console.log("Handling loop selection for progress bar click");
      handleLoopSelection(clickTime);
    }
    // If shift is held, add timestamp comment
    else if (
      e.shiftKey &&
      typeof window !== "undefined" &&
      (window as any).setCommentTimestamp
    ) {
      console.log("Handling timestamp comment");
      (window as any).setCommentTimestamp(clickTime);
    } else {
      console.log("Regular progress bar click - seeking");
      seek(percentage);
    }
  };

  const toggleMute = () => {
    const newVolume = volume > 0 ? 0 : 1;
    setVolume(newVolume);

    if (hasWaveform && wavesurfer.current) {
      wavesurfer.current.setVolume(newVolume);
    } else if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const restart = () => {
    if (hasWaveform && wavesurfer.current) {
      wavesurfer.current.seekTo(0);
    } else if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  };

  const changePlaybackSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    setShowSpeedDropdown(false);

    if (hasWaveform && wavesurfer.current) {
      wavesurfer.current.setPlaybackRate(speed);
    } else if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="audio-player p-8">
      {/* Hidden HTML5 audio */}
      <audio
        ref={audioRef}
        src={audioUrl}
        preload="metadata"
        className="hidden"
      />

      {/* Player Interface */}
      <div className="mb-8">
        <div className="bg-neutral-800/30 rounded-xl p-6 relative">
          {/* Waveform Container - Always Present */}
          <div
            ref={waveformRef}
            className="w-full h-20 mb-4 relative cursor-pointer"
            style={{ minHeight: "80px" }}
            title={hasWaveform ? "Click to add timestamp comment" : undefined}
          />

          {/* Fallback when no waveform */}
          {!hasWaveform && (
            <div className="absolute inset-6 flex flex-col items-center justify-center">
              <div className="text-4xl mb-2">🎵</div>
              <p className="text-sm text-neutral-400 mb-4">
                Loading waveform...
              </p>

              {/* Basic progress bar */}
              <div className="w-full">
                <div
                  className="w-full bg-neutral-700/50 rounded-full h-2 cursor-pointer group mb-4 relative"
                  onClick={handleProgressBarClick}
                  title="Click to seek, Shift+Click to add timestamp comment"
                >
                  <div
                    className="bg-neutral-300 h-2 rounded-full transition-all duration-100 group-hover:bg-neutral-200"
                    style={{ width: `${progressPercentage}%` }}
                  />

                  {/* Loop region overlay for basic player */}
                  {loopStart !== null && loopEnd !== null && duration > 0 && (
                    <div
                      className="absolute top-0 bottom-0 border-2 pointer-events-none"
                      style={{
                        left: `${(loopStart / duration) * 100}%`,
                        width: `${((loopEnd - loopStart) / duration) * 100}%`,
                        backgroundColor: isLooping
                          ? "rgba(34, 197, 94, 0.15)"
                          : "rgba(234, 179, 8, 0.15)",
                        borderColor: isLooping
                          ? "rgba(34, 197, 94, 0.4)"
                          : "rgba(234, 179, 8, 0.4)",
                      }}
                      title={`Loop: ${formatTime(loopStart)} - ${formatTime(
                        loopEnd
                      )}`}
                    />
                  )}

                  {/* Comment markers for basic player */}
                  {comments.map((comment, index) => {
                    if (comment.audioTimestamp !== undefined && duration > 0) {
                      const position =
                        (comment.audioTimestamp / duration) * 100;
                      return (
                        <div
                          key={`marker-${index}`}
                          className="absolute top-0 bottom-0 w-0.5 bg-blue-400 opacity-80 hover:opacity-100"
                          style={{ left: `${position}%` }}
                          title={`Comment at ${formatTime(
                            comment.audioTimestamp
                          )}`}
                        />
                      );
                    }
                    return null;
                  })}
                </div>

                <div className="text-center text-xs text-neutral-400">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Hints */}
        <div className="text-xs text-neutral-500 text-center mt-2 space-y-1">
          <p>
            {hasWaveform
              ? "Click: timestamp comment • Alt+Click: loop selection"
              : "Shift+Click: timestamp comment • Alt+Click: loop selection"}
          </p>
          <p className="text-neutral-600">
            Press{" "}
            <kbd className="px-1 py-0.5 bg-neutral-800 rounded text-[10px]">
              ?
            </kbd>{" "}
            for keyboard shortcuts
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button onClick={togglePlayPause} className="play-button group">
            {isPlaying ? (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="transition-transform group-hover:scale-110"
              >
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="ml-0.5 transition-transform group-hover:scale-110"
              >
                <polygon points="5,3 19,12 5,21" />
              </svg>
            )}
          </button>

          <div className="text-sm">
            <div
              className="font-medium mb-1 tracking-tight"
              style={{ fontVariationSettings: "'wght' 500" }}
            >
              {title}
            </div>
            <div className="text-secondary text-xs tracking-wide">
              {hasWaveform ? "Waveform active" : "Loading..."}
            </div>
          </div>
        </div>

        {/* Secondary controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleMute}
            className="p-3 hover:bg-neutral-800/50 rounded-xl transition-all duration-200 hover:scale-105 group"
            title={volume > 0 ? "Mute" : "Unmute"}
          >
            {volume > 0 ? (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-neutral-400 group-hover:text-neutral-300 transition-colors"
              >
                <polygon points="11,5 6,9 2,9 2,15 6,15 11,19" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
              </svg>
            ) : (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-neutral-400 group-hover:text-neutral-300 transition-colors"
              >
                <polygon points="11,5 6,9 2,9 2,15 6,15 11,19" />
                <line x1="23" y1="9" x2="17" y2="15" />
                <line x1="17" y1="9" x2="23" y2="15" />
              </svg>
            )}
          </button>

          <button
            onClick={restart}
            className="p-3 hover:bg-neutral-800/50 rounded-xl transition-all duration-200 hover:scale-105 group"
            title="Restart"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-neutral-400 group-hover:text-neutral-300 transition-colors"
            >
              <path d="M1 4v6h6" />
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
            </svg>
          </button>

          {/* Loop Control */}
          <button
            onClick={toggleLoop}
            disabled={loopStart === null || loopEnd === null}
            className={`p-3 rounded-xl transition-all duration-200 hover:scale-105 group ${
              isLooping
                ? "bg-green-600/20 hover:bg-green-600/30"
                : loopStart !== null && loopEnd !== null
                ? "hover:bg-neutral-800/50"
                : "opacity-50 cursor-not-allowed"
            }`}
            title={
              loopStart === null || loopEnd === null
                ? "Alt+Click to select loop region"
                : isLooping
                ? `Loop active: ${formatTime(loopStart)} - ${formatTime(
                    loopEnd
                  )}`
                : `Loop ready: ${formatTime(loopStart)} - ${formatTime(
                    loopEnd
                  )}`
            }
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={`transition-colors ${
                isLooping
                  ? "text-green-400"
                  : loopStart !== null && loopEnd !== null
                  ? "text-neutral-400 group-hover:text-neutral-300"
                  : "text-neutral-600"
              }`}
            >
              <path d="M11 19H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5" />
              <path d="M13 5h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-5" />
              <circle cx="12" cy="12" r="3" />
              <path d="M16 8l-4-4-4 4" />
              <path d="M8 16l4 4 4-4" />
            </svg>
          </button>

          {/* Speed Control */}
          <div className="relative">
            <button
              onClick={() => setShowSpeedDropdown(!showSpeedDropdown)}
              className="px-3 py-2 hover:bg-neutral-800/50 rounded-xl transition-all duration-200 hover:scale-105 group flex items-center gap-1 min-w-[60px] justify-center"
              title="Playback Speed"
            >
              <span className="text-sm font-medium text-neutral-400 group-hover:text-neutral-300 transition-colors">
                {
                  speedOptions.find((option) => option.value === playbackSpeed)
                    ?.label
                }
              </span>
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={`text-neutral-400 group-hover:text-neutral-300 transition-all duration-200 ${
                  showSpeedDropdown ? "rotate-180" : ""
                }`}
              >
                <polyline points="6,9 12,15 18,9" />
              </svg>
            </button>

            {/* Speed Dropdown */}
            {showSpeedDropdown && (
              <div className="absolute bottom-full right-0 mb-2 bg-neutral-800 border border-neutral-700 rounded-xl shadow-xl z-50 min-w-[80px] overflow-hidden">
                {speedOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => changePlaybackSpeed(option.value)}
                    className={`w-full px-4 py-2 text-sm text-left hover:bg-neutral-700 transition-colors ${
                      playbackSpeed === option.value
                        ? "bg-neutral-700 text-neutral-200"
                        : "text-neutral-400"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Help Modal */}
      {showKeyboardHelp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-neutral-900 border border-neutral-700 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-neutral-200">
                Keyboard Shortcuts
              </h3>
              <button
                onClick={() => setShowKeyboardHelp(false)}
                className="p-1 hover:bg-neutral-800 rounded-lg transition-colors"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-neutral-400"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400">Play/Pause</span>
                    <kbd className="px-2 py-1 bg-neutral-800 rounded text-xs">
                      Space
                    </kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400">Seek Back</span>
                    <kbd className="px-2 py-1 bg-neutral-800 rounded text-xs">
                      ←
                    </kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400">Seek Forward</span>
                    <kbd className="px-2 py-1 bg-neutral-800 rounded text-xs">
                      →
                    </kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400">Volume Up</span>
                    <kbd className="px-2 py-1 bg-neutral-800 rounded text-xs">
                      ↑
                    </kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400">Volume Down</span>
                    <kbd className="px-2 py-1 bg-neutral-800 rounded text-xs">
                      ↓
                    </kbd>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400">Restart</span>
                    <kbd className="px-2 py-1 bg-neutral-800 rounded text-xs">
                      R
                    </kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400">Mute/Unmute</span>
                    <kbd className="px-2 py-1 bg-neutral-800 rounded text-xs">
                      M
                    </kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400">Toggle Loop</span>
                    <kbd className="px-2 py-1 bg-neutral-800 rounded text-xs">
                      L
                    </kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400">Clear Loop</span>
                    <kbd className="px-2 py-1 bg-neutral-800 rounded text-xs">
                      Shift+C
                    </kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400">0.5x Speed</span>
                    <kbd className="px-2 py-1 bg-neutral-800 rounded text-xs">
                      1
                    </kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400">0.75x Speed</span>
                    <kbd className="px-2 py-1 bg-neutral-800 rounded text-xs">
                      2
                    </kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400">1x Speed</span>
                    <kbd className="px-2 py-1 bg-neutral-800 rounded text-xs">
                      3
                    </kbd>
                  </div>
                </div>
              </div>

              <div className="border-t border-neutral-700 pt-3 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400">1.25x Speed</span>
                    <kbd className="px-2 py-1 bg-neutral-800 rounded text-xs">
                      4
                    </kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400">1.5x Speed</span>
                    <kbd className="px-2 py-1 bg-neutral-800 rounded text-xs">
                      5
                    </kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400">2x Speed</span>
                    <kbd className="px-2 py-1 bg-neutral-800 rounded text-xs">
                      6
                    </kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400">Toggle Help</span>
                    <kbd className="px-2 py-1 bg-neutral-800 rounded text-xs">
                      ?
                    </kbd>
                  </div>
                </div>
              </div>

              <div className="text-xs text-neutral-500 text-center mt-4 pt-3 border-t border-neutral-700">
                Shortcuts work when not typing in text fields • Press Esc to
                close
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
