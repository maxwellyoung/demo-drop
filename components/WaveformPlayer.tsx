import React, { useEffect, useRef, useState, useCallback } from "react";
import WaveSurfer from "wavesurfer.js";
import { motion, AnimatePresence } from "framer-motion";

interface Comment {
  id: string;
  time: number;
  text: string;
  author: string;
  timestamp: string;
}

interface WaveformPlayerProps {
  audioUrl: string;
  peaksUrl?: string;
  duration?: number;
  onTimeUpdate?: (time: number) => void;
  onPlay?: () => void;
  onPause?: () => void;
  comments?: Comment[];
  onAddComment?: (time: number, text: string) => void;
  className?: string;
}

export default function WaveformPlayer({
  audioUrl,
  peaksUrl,
  duration,
  onTimeUpdate,
  onPlay,
  onPause,
  comments = [],
  onAddComment,
  className = "",
}: WaveformPlayerProps) {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration_, setDuration] = useState(duration || 0);
  const [volume, setVolume] = useState(1);
  const [loopStart, setLoopStart] = useState<number | null>(null);
  const [loopEnd, setLoopEnd] = useState<number | null>(null);
  const [isLooping, setIsLooping] = useState(false);
  const [showComments, setShowComments] = useState(true);

  // Initialize WaveSurfer
  useEffect(() => {
    if (!waveformRef.current) return;

    const wavesurfer = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: "rgba(255, 255, 255, 0.3)",
      progressColor: "rgba(255, 255, 255, 0.9)",
      cursorColor: "transparent",
      barWidth: 2,
      barRadius: 3,
      height: 80,
      barGap: 1,
      normalize: true,
      backend: "WebAudio",
    });

    wavesurferRef.current = wavesurfer;

    // Load audio
    wavesurfer.load(audioUrl);

    // Load peaks if available
    if (peaksUrl) {
      fetch(peaksUrl)
        .then((response) => response.json())
        .then((data) => {
          wavesurfer.load(audioUrl, data.peaks);
        })
        .catch((error) => {
          console.warn("Failed to load peaks, using default waveform:", error);
        });
    }

    // Event listeners
    wavesurfer.on("ready", () => {
      setDuration(wavesurfer.getDuration());
    });

    wavesurfer.on("audioprocess", (time) => {
      setCurrentTime(time);
      onTimeUpdate?.(time);
    });

    wavesurfer.on("play", () => {
      setIsPlaying(true);
      onPlay?.();
    });

    wavesurfer.on("pause", () => {
      setIsPlaying(false);
      onPause?.();
    });

    wavesurfer.on("finish", () => {
      setIsPlaying(false);
      if (isLooping && loopStart !== null && loopEnd !== null) {
        wavesurfer.setTime(loopStart);
        wavesurfer.play();
      }
    });

    return () => {
      wavesurfer.destroy();
    };
  }, [
    audioUrl,
    peaksUrl,
    onTimeUpdate,
    onPlay,
    onPause,
    isLooping,
    loopStart,
    loopEnd,
  ]);

  // Volume control
  useEffect(() => {
    if (wavesurferRef.current) {
      wavesurferRef.current.setVolume(volume);
    }
  }, [volume]);

  // Loop functionality
  useEffect(() => {
    if (wavesurferRef.current && loopStart !== null && loopEnd !== null) {
      wavesurferRef.current.setTime(loopStart);
    }
  }, [loopStart, loopEnd]);

  const togglePlay = useCallback(() => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
    }
  }, []);

  const setLoop = useCallback((start: number, end: number) => {
    setLoopStart(start);
    setLoopEnd(end);
    setIsLooping(true);
    if (wavesurferRef.current) {
      wavesurferRef.current.setTime(start);
    }
  }, []);

  const clearLoop = useCallback(() => {
    setLoopStart(null);
    setLoopEnd(null);
    setIsLooping(false);
  }, []);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleWaveformClick = useCallback(
    (e: React.MouseEvent) => {
      if (!wavesurferRef.current || !onAddComment) return;

      const rect = waveformRef.current?.getBoundingClientRect();
      if (!rect) return;

      const clickX = e.clientX - rect.left;
      const clickPercent = clickX / rect.width;
      const clickTime = clickPercent * duration_;

      const commentText = prompt("Add a comment at this timestamp:");
      if (commentText) {
        onAddComment(clickTime, commentText);
      }
    },
    [duration_, onAddComment]
  );

  return (
    <div className={`waveform-player ${className}`}>
      {/* Waveform */}
      <div className="relative">
        <div
          ref={waveformRef}
          className="waveform-container cursor-pointer"
          onClick={handleWaveformClick}
        />

        {/* Comments overlay */}
        <AnimatePresence>
          {showComments &&
            comments.map((comment) => {
              const position = (comment.time / duration_) * 100;
              return (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute top-0 w-4 h-4 -translate-x-2 cursor-pointer"
                  style={{ left: `${position}%` }}
                  title={`${comment.author}: ${comment.text}`}
                >
                  <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg" />
                </motion.div>
              );
            })}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mt-4 space-x-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={togglePlay}
            className="w-10 h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center transition-colors"
          >
            {isPlaying ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <rect x="6" y="4" width="3" height="12" rx="1" />
                <rect x="11" y="4" width="3" height="12" rx="1" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6 4l12 6-12 6V4z" />
              </svg>
            )}
          </button>

          <div className="text-sm text-gray-600">
            {formatTime(currentTime)} / {formatTime(duration_)}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Volume control */}
          <div className="flex items-center space-x-2">
            <svg
              className="w-4 h-4 text-gray-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.793L5.5 14H2a1 1 0 01-1-1V7a1 1 0 011-1h3.5l3.883-2.707zM12.861 7.515a1 1 0 011.414 0 6 6 0 010 8.485 1 1 0 01-1.414-1.414 4 4 0 000-5.657 1 1 0 010-1.414z" />
            </svg>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-20"
            />
          </div>

          {/* Loop controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                if (loopStart === null) {
                  setLoop(currentTime, Math.min(currentTime + 10, duration_));
                } else {
                  clearLoop();
                }
              }}
              className={`px-3 py-1 text-xs rounded ${
                isLooping
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-700"
              }`}
            >
              {isLooping ? "Clear Loop" : "Set Loop"}
            </button>
          </div>

          {/* Comments toggle */}
          <button
            onClick={() => setShowComments(!showComments)}
            className={`px-3 py-1 text-xs rounded ${
              showComments
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-gray-200 hover:bg-gray-300 text-gray-700"
            }`}
          >
            {showComments ? "Hide" : "Show"} Comments
          </button>
        </div>
      </div>

      {/* Loop indicator */}
      {isLooping && loopStart !== null && loopEnd !== null && (
        <div className="mt-2 p-2 bg-yellow-100 border border-yellow-300 rounded text-sm">
          <div className="flex items-center justify-between">
            <span>
              Loop: {formatTime(loopStart)} - {formatTime(loopEnd)}
            </span>
            <button
              onClick={clearLoop}
              className="text-yellow-700 hover:text-yellow-900"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
