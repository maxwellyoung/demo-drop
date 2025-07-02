"use client";

import { useEffect, useRef, useState } from "react";

interface AudioPlayerProps {
  audioUrl: string;
  title: string;
}

export default function AudioPlayer({ audioUrl, title }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurfer = useRef<any>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasWaveform, setHasWaveform] = useState(false);

  // Initialize HTML5 audio first (always works)
  useEffect(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
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

  // Try to enhance with WaveSurfer (optional)
  useEffect(() => {
    let isMounted = true;

    const tryWaveSurfer = async () => {
      try {
        // Only try WaveSurfer after HTML5 audio is loaded
        if (isLoading) return;

        const WaveSurfer = (await import("wavesurfer.js")).default;

        if (!waveformRef.current || !isMounted) return;

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
          if (isMounted) {
            setHasWaveform(true);
          }
        });

        wavesurfer.current.on("error", (error: any) => {
          console.warn("WaveSurfer failed, using HTML5 player:", error);
        });
      } catch (error) {
        console.warn("WaveSurfer not available, using HTML5 player:", error);
      }
    };

    // Try WaveSurfer after a short delay to ensure HTML5 audio loads first
    const timeout = setTimeout(tryWaveSurfer, 1000);

    return () => {
      isMounted = false;
      clearTimeout(timeout);
      if (wavesurfer.current) {
        wavesurfer.current.destroy();
      }
    };
  }, [audioUrl, isLoading]);

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  const seek = (percentage: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = (percentage / 100) * duration;
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (isLoading) {
    return (
      <div className="audio-player p-8">
        <div className="animate-pulse">
          <div className="h-20 bg-neutral-800/50 rounded-xl mb-6"></div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-neutral-800/50 rounded-full"></div>
              <div>
                <div className="h-4 bg-neutral-800/50 rounded w-32 mb-2"></div>
                <div className="h-3 bg-neutral-800/50 rounded w-20"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="audio-player p-8">
      {/* Hidden HTML5 audio element */}
      <audio
        ref={audioRef}
        src={audioUrl}
        preload="metadata"
        className="hidden"
      />

      {/* Waveform or Progress Bar */}
      <div className="mb-8">
        {hasWaveform ? (
          <div ref={waveformRef} className="rounded-lg overflow-hidden"></div>
        ) : (
          <div className="bg-neutral-800/30 rounded-xl p-6">
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">🎵</div>
              <p className="text-sm text-neutral-400">Audio Player</p>
            </div>

            {/* Custom Progress Bar */}
            <div
              className="w-full bg-neutral-700/50 rounded-full h-2 cursor-pointer group"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const percentage = ((e.clientX - rect.left) / rect.width) * 100;
                seek(percentage);
              }}
            >
              <div
                className="bg-neutral-300 h-2 rounded-full transition-all duration-100 group-hover:bg-neutral-200"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}
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
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>
        </div>

        {/* Secondary controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (audioRef.current) {
                audioRef.current.volume = audioRef.current.volume > 0 ? 0 : 1;
              }
            }}
            className="p-3 hover:bg-neutral-800/50 rounded-xl transition-all duration-200 hover:scale-105 group"
            title="Toggle Volume"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="text-neutral-400 group-hover:text-neutral-300 transition-colors"
            >
              <polygon points="11,5 6,9 2,9 2,15 6,15 11,19" />
              <path d="M19.07 4.93C20.94 6.8 20.94 9.9 19.07 11.77M15.54 8.46C16.17 9.09 16.17 10.1 15.54 10.73" />
            </svg>
          </button>

          <button
            onClick={() => {
              if (audioRef.current) {
                audioRef.current.currentTime = 0;
              }
            }}
            className="p-3 hover:bg-neutral-800/50 rounded-xl transition-all duration-200 hover:scale-105 group"
            title="Restart"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="text-neutral-400 group-hover:text-neutral-300 transition-colors"
            >
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
