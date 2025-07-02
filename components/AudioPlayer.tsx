"use client";

import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";

interface AudioPlayerProps {
  audioUrl: string;
  title: string;
}

export default function AudioPlayer({ audioUrl, title }: AudioPlayerProps) {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!waveformRef.current) return;

    // Initialize WaveSurfer with refined aesthetics
    wavesurfer.current = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: "#525252", // neutral-600
      progressColor: "#f5f5f5", // neutral-100
      cursorColor: "#f5f5f5",
      barWidth: 2,
      barRadius: 2,
      barGap: 1,
      responsive: true,
      height: 120,
      normalize: true,
      backend: "WebAudio",
    });

    // Load audio
    wavesurfer.current.load(audioUrl);

    // Event listeners
    wavesurfer.current.on("ready", () => {
      setDuration(wavesurfer.current?.getDuration() || 0);
      setIsLoading(false);
    });

    wavesurfer.current.on("play", () => setIsPlaying(true));
    wavesurfer.current.on("pause", () => setIsPlaying(false));

    wavesurfer.current.on("audioprocess", () => {
      setCurrentTime(wavesurfer.current?.getCurrentTime() || 0);
    });

    return () => {
      wavesurfer.current?.destroy();
    };
  }, [audioUrl]);

  const togglePlayPause = () => {
    if (wavesurfer.current) {
      wavesurfer.current.playPause();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (isLoading) {
    return (
      <div className="audio-player p-8">
        <div className="animate-pulse">
          <div className="h-32 bg-neutral-800/50 rounded-xl mb-6"></div>
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

  return (
    <div className="audio-player p-8">
      {/* Waveform - Rauno Freiberg inspired clean visualization */}
      <div className="mb-8">
        <div ref={waveformRef} className="rounded-lg overflow-hidden"></div>
      </div>

      {/* Controls - Jony Ive inspired minimal interface */}
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
                <polygon points="5,3 19,12 5,21" rx="2" />
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

        {/* Emil Kowalski inspired secondary controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              const currentVolume = wavesurfer.current?.getVolume() || 1;
              wavesurfer.current?.setVolume(currentVolume > 0 ? 0 : 1);
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
            onClick={() => wavesurfer.current?.seekTo(0)}
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
