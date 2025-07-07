import Link from "next/link";
import { usePlayer } from "../../components/PersistentMiniPlayer";
import ShareButton from "../../components/ShareButton";
import AddToPlaylistButton from "../../components/AddToPlaylistButton";
import ArtworkGenerator from "../../components/ArtworkGenerator";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

interface TrackRowProps {
  track: any;
  index?: number;
  focused?: boolean;
  onFocus?: (e: React.FocusEvent) => void;
  onPlay?: () => void;
  onAddToQueue?: () => void;
}

export function TrackRow({
  track,
  index,
  focused,
  onFocus,
  onPlay,
  onAddToQueue,
}: TrackRowProps) {
  const { playTrack, addToQueue, playerState } = usePlayer();
  const { currentTrack, currentTime } = playerState;
  const isPlaying = currentTrack?.slug === track.slug;
  const [syncStatus, setSyncStatus] = useState<
    "synced" | "pending" | "failed" | null
  >(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const linkRef = useRef<HTMLAnchorElement>(null);

  // Check sync status for this track
  useEffect(() => {
    const checkSyncStatus = async () => {
      try {
        const response = await fetch("/api/sync");
        const data = await response.json();
        const trackStatus = data.status?.find(
          (s: any) => s.filename === track.filename
        );
        if (trackStatus) {
          if (trackStatus.syncError) setSyncStatus("failed");
          else if (trackStatus.needsSync) setSyncStatus("pending");
          else setSyncStatus("synced");
        }
      } catch (error) {
        console.error("Failed to check sync status:", error);
      }
    };
    checkSyncStatus();
  }, [track.filename]);

  // Focus management
  useEffect(() => {
    if (focused && linkRef.current) {
      linkRef.current.focus();
    }
  }, [focused]);

  // Handle dropdown positioning and click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showDropdown]);

  const handleDropdownToggle = () => {
    if (!showDropdown && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.right + window.scrollX - 192, // 192px = w-48
      });
    }
    setShowDropdown(!showDropdown);
  };

  const handlePlayClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (onPlay) {
      onPlay();
    } else {
      const audioUrl = `/uploads/${track.filename}`;
      const playerTrack = {
        slug: track.slug,
        title: track.title,
        artist: track.artist,
        audioUrl,
        genre: track.extendedMetadata?.genre,
      };
      playTrack(playerTrack);
      addToQueue(playerTrack);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "Enter":
      case " ":
        e.preventDefault();
        handlePlayClick(e as any);
        break;
      case "ArrowDown":
      case "ArrowUp":
        // Let parent handle navigation
        e.preventDefault();
        break;
    }
  };

  return (
    <>
      <Link
        ref={linkRef}
        href={`/track/${track.slug}`}
        className={`track-row group ${
          focused ? "ring-2 ring-blue-500/50" : ""
        }`}
        tabIndex={0}
        onFocus={onFocus}
        onKeyDown={handleKeyDown}
      >
        {/* Artwork */}
        <div className="track-artwork">
          <ArtworkGenerator
            title={track.title}
            artist={track.artist}
            genre={track.extendedMetadata?.genre}
            size="small"
          />
        </div>
        {/* Info */}
        <div className="track-info">
          <div className="track-title">{track.title}</div>
          <div className="track-artist">{track.artist}</div>
          <div className="track-meta">
            {/* Enhanced metadata display */}
            {track.audioMetadata?.duration && (
              <span className="text-xs text-gray-500">
                {Math.floor(track.audioMetadata.duration / 60)}:
                {(track.audioMetadata.duration % 60)
                  .toFixed(0)
                  .padStart(2, "0")}
              </span>
            )}
            {track.audioMetadata?.bitrate && (
              <span className="hidden md:inline text-xs text-gray-500">
                {Math.round(track.audioMetadata.bitrate / 1000)}kbps
              </span>
            )}
            {track.extendedMetadata?.genre && (
              <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                {track.extendedMetadata.genre}
              </span>
            )}
            {track.extendedMetadata?.bpm && (
              <span className="hidden md:inline text-xs bg-blue-100 px-2 py-1 rounded">
                {track.extendedMetadata.bpm} BPM
              </span>
            )}
            {track.extendedMetadata?.key && (
              <span className="hidden md:inline text-xs bg-purple-100 px-2 py-1 rounded">
                {track.extendedMetadata.key}
              </span>
            )}
            {/* Upload date */}
            <span className="text-xs text-gray-400">
              {new Date(track.uploadedAt).toLocaleDateString("en-GB")}
            </span>
          </div>
        </div>
        {/* Actions */}
        <div className="track-actions" onClick={(e) => e.stopPropagation()}>
          {/* Primary Actions */}
          <div className="flex items-center space-x-2">
            <button
              className={`play-button ${
                isPlaying ? "ring-2 ring-green-400" : ""
              }`}
              title={isPlaying ? "Pause" : "Play"}
              onClick={handlePlayClick}
              tabIndex={-1}
            >
              {isPlaying ? (
                <svg
                  width="24"
                  height="24"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <rect x="6" y="4" width="3" height="12" rx="1" />
                  <rect x="11" y="4" width="3" height="12" rx="1" />
                </svg>
              ) : (
                <svg
                  width="24"
                  height="24"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M6 4l12 6-12 6V4z" />
                </svg>
              )}
            </button>

            <ShareButton
              url={`/track/${track.slug}`}
              title={track.title}
              artist={track.artist}
              currentTime={isPlaying ? currentTime : undefined}
            />

            {/* Enhanced Sync Status Indicator */}
            {syncStatus && (
              <div
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-all duration-200 ${
                  syncStatus === "failed"
                    ? "bg-red-500/20 text-red-400 border border-red-500/30"
                    : syncStatus === "pending"
                    ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                    : "bg-green-500/20 text-green-400 border border-green-500/30"
                }`}
                title={
                  syncStatus === "failed"
                    ? "Sync failed"
                    : syncStatus === "pending"
                    ? "Needs sync"
                    : "Synced to cloud"
                }
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full ${
                    syncStatus === "failed"
                      ? "bg-red-400"
                      : syncStatus === "pending"
                      ? "bg-yellow-400 animate-pulse"
                      : "bg-green-400"
                  }`}
                />
                <span className="font-mono text-[10px]">
                  {syncStatus === "failed"
                    ? "!"
                    : syncStatus === "pending"
                    ? "↑"
                    : "✓"}
                </span>
              </div>
            )}
          </div>

          {/* Secondary Actions - Kebab Menu */}
          <div className="relative">
            <button
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              title="More actions"
              tabIndex={-1}
              ref={buttonRef}
              onClick={handleDropdownToggle}
            >
              <svg
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
          </div>
        </div>
      </Link>

      {/* Portal for dropdown menu */}
      {showDropdown &&
        typeof window !== "undefined" &&
        createPortal(
          <div
            ref={dropdownRef}
            className="fixed w-48 bg-neutral-900/95 backdrop-blur-xl border border-neutral-800/50 rounded-2xl shadow-2xl z-[9999]"
            style={{
              top: dropdownPosition.top,
              left: dropdownPosition.left,
            }}
          >
            <div className="py-1">
              <button className="w-full px-4 py-2 text-left text-sm text-neutral-300 hover:bg-neutral-800/50 flex items-center space-x-2 transition-colors">
                <svg
                  width="14"
                  height="14"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Add to Playlist</span>
              </button>
              <button className="w-full px-4 py-2 text-left text-sm text-neutral-300 hover:bg-neutral-800/50 flex items-center space-x-2 transition-colors">
                <svg
                  width="14"
                  height="14"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
                <span>Edit Metadata</span>
              </button>
              <button className="w-full px-4 py-2 text-left text-sm text-neutral-300 hover:bg-neutral-800/50 flex items-center space-x-2 transition-colors">
                <svg
                  width="14"
                  height="14"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
                </svg>
                <span>Generate Artwork</span>
              </button>
              <hr className="my-1 border-neutral-700/50" />
              <button className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center space-x-2 transition-colors">
                <svg
                  width="14"
                  height="14"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Delete Track</span>
              </button>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
