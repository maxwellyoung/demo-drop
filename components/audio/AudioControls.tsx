"use client";

import { useCallback } from "react";
import { SPEED_OPTIONS, AUDIO_CONSTANTS } from "../../constants/audio";

interface AudioControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playbackSpeed: number;
  showSpeedDropdown: boolean;
  isLooping: boolean;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onSpeedChange: (speed: number) => void;
  onSpeedDropdownToggle: () => void;
  onLoopToggle: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  disabled?: boolean;
}

export default function AudioControls({
  isPlaying,
  currentTime,
  duration,
  volume,
  playbackSpeed,
  showSpeedDropdown,
  isLooping,
  onPlayPause,
  onSeek,
  onVolumeChange,
  onSpeedChange,
  onSpeedDropdownToggle,
  onLoopToggle,
  onPrevious,
  onNext,
  disabled = false,
}: AudioControlsProps) {
  const formatTime = useCallback((time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }, []);

  const handleSeek = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newTime = parseFloat(e.target.value);
      onSeek(newTime);
    },
    [onSeek]
  );

  const handleVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newVolume = parseFloat(e.target.value);
      onVolumeChange(newVolume);
    },
    [onVolumeChange]
  );

  return (
    <div className="audio-controls bg-neutral-900/50 backdrop-blur-xl rounded-xl border border-neutral-800/50 p-4">
      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-sm text-neutral-400 min-w-[3rem]">
            {formatTime(currentTime)}
          </span>
          <div className="flex-1 relative">
            <input
              type="range"
              min={0}
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              disabled={disabled}
              className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
          <span className="text-sm text-neutral-400 min-w-[3rem]">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Main Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Previous Button */}
          {onPrevious && (
            <button
              onClick={onPrevious}
              disabled={disabled}
              className="p-2 text-neutral-400 hover:text-white transition-colors disabled:opacity-50"
              title="Previous Track"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
              </svg>
            </button>
          )}

          {/* Play/Pause Button */}
          <button
            onClick={onPlayPause}
            disabled={disabled}
            className="p-3 bg-white text-black rounded-full hover:bg-neutral-200 transition-colors disabled:opacity-50"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {/* Next Button */}
          {onNext && (
            <button
              onClick={onNext}
              disabled={disabled}
              className="p-2 text-neutral-400 hover:text-white transition-colors disabled:opacity-50"
              title="Next Track"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
              </svg>
            </button>
          )}
        </div>

        {/* Secondary Controls */}
        <div className="flex items-center gap-4">
          {/* Loop Button */}
          <button
            onClick={onLoopToggle}
            disabled={disabled}
            className={`p-2 transition-colors disabled:opacity-50 ${
              isLooping
                ? "text-blue-400 hover:text-blue-300"
                : "text-neutral-400 hover:text-white"
            }`}
            title={isLooping ? "Disable Loop" : "Enable Loop"}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z" />
            </svg>
          </button>

          {/* Speed Control */}
          <div className="relative">
            <button
              onClick={onSpeedDropdownToggle}
              disabled={disabled}
              className="px-3 py-1 text-sm bg-neutral-800 hover:bg-neutral-700 rounded transition-colors disabled:opacity-50"
              title="Playback Speed"
            >
              {playbackSpeed}x
            </button>
            {showSpeedDropdown && (
              <div className="absolute bottom-full right-0 mb-2 bg-neutral-800 rounded-lg border border-neutral-700 shadow-lg z-10">
                {SPEED_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => onSpeedChange(option.value)}
                    className={`block w-full px-4 py-2 text-sm text-left hover:bg-neutral-700 transition-colors ${
                      playbackSpeed === option.value
                        ? "text-blue-400 bg-neutral-700"
                        : "text-neutral-300"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-2">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="text-neutral-400"
            >
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
            </svg>
            <input
              type="range"
              min={AUDIO_CONSTANTS.MIN_VOLUME}
              max={AUDIO_CONSTANTS.MAX_VOLUME}
              step={0.1}
              value={volume}
              onChange={handleVolumeChange}
              disabled={disabled}
              className="w-20 h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
