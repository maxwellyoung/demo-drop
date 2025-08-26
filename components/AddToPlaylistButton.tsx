"use client";

import { useState, useEffect } from "react";
import { TrackWithMetadata, Playlist as PlaylistType } from "../types";

interface Track extends TrackWithMetadata {
  audioUrl: string;
}

type Playlist = PlaylistType;

interface AddToPlaylistButtonProps {
  track: Track;
}

export default function AddToPlaylistButton({
  track,
}: AddToPlaylistButtonProps) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [showMenu, setShowMenu] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");

  // Load playlists from localStorage
  useEffect(() => {
    const savedPlaylists = localStorage.getItem("demo-drop-playlists");
    if (savedPlaylists) {
      try {
        setPlaylists(JSON.parse(savedPlaylists));
      } catch (error) {
        console.error("Failed to load playlists:", error);
      }
    }
  }, []);

  const addTrackToPlaylist = (playlistId: string) => {
    const updatedPlaylists = playlists.map((playlist) => {
      if (playlist.id === playlistId) {
        // Check if track is already in playlist
        if (playlist.tracks.some((t) => t.slug === track.slug)) {
          return playlist;
        }
        return {
          ...playlist,
          tracks: [...playlist.tracks, track],
          updatedAt: new Date().toISOString(),
        };
      }
      return playlist;
    });

    setPlaylists(updatedPlaylists);
    localStorage.setItem(
      "demo-drop-playlists",
      JSON.stringify(updatedPlaylists)
    );
    setShowMenu(false);
  };

  const createPlaylistAndAdd = () => {
    if (!newPlaylistName.trim()) return;

    const newPlaylist: Playlist = {
      id: `playlist-${Date.now()}`,
      name: newPlaylistName.trim(),
      tracks: [track],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedPlaylists = [...playlists, newPlaylist];
    setPlaylists(updatedPlaylists);
    localStorage.setItem(
      "demo-drop-playlists",
      JSON.stringify(updatedPlaylists)
    );

    setNewPlaylistName("");
    setShowCreateForm(false);
    setShowMenu(false);
  };

  const isTrackInPlaylist = (playlist: Playlist) => {
    return playlist.tracks.some((t) => t.slug === track.slug);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="btn-secondary flex items-center gap-2 group"
        title="Add to playlist"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="transition-transform group-hover:scale-110"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
        <span>Add</span>
      </button>

      {/* Playlist Menu */}
      {showMenu && (
        <div className="absolute bottom-full right-0 mb-2 bg-neutral-900/95 backdrop-blur-xl rounded-2xl border border-neutral-800/50 p-3 shadow-xl z-10 min-w-[200px]">
          <div className="flex flex-col gap-2">
            <div className="text-sm text-neutral-400 mb-2 px-2">
              Add to playlist
            </div>

            {/* Existing Playlists */}
            {playlists.map((playlist) => (
              <button
                key={playlist.id}
                onClick={() => addTrackToPlaylist(playlist.id)}
                disabled={isTrackInPlaylist(playlist)}
                className={`social-share-btn copy text-left ${
                  isTrackInPlaylist(playlist)
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-neutral-800/50"
                }`}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M9 12l2 2 4-4" />
                  <path d="M21 12c-1 0-2-1-2-2s1-2 2-2 2 1 2 2-1 2-2 2z" />
                  <path d="M3 12c1 0 2-1 2-2s-1-2-2-2-2 1-2 2 1 2 2 2z" />
                  <path d="M12 3c0 1-1 2-2 2s-2-1-2-2 1-2 2-2 2 1 2 2z" />
                  <path d="M12 21c0-1 1-2 2-2s2 1 2 2-1 2-2 2-2-1-2-2z" />
                </svg>
                <span className="truncate">
                  {isTrackInPlaylist(playlist) ? "✓ " : ""}
                  {playlist.name}
                </span>
              </button>
            ))}

            <div className="border-t border-neutral-800/50 my-2"></div>

            {/* Create New Playlist */}
            {showCreateForm ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="Playlist name..."
                  className="form-input text-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      createPlaylistAndAdd();
                    }
                  }}
                />
                <div className="flex gap-2">
                  <button
                    onClick={createPlaylistAndAdd}
                    className="btn-primary text-sm flex-1"
                    disabled={!newPlaylistName.trim()}
                  >
                    Create
                  </button>
                  <button
                    onClick={() => {
                      setShowCreateForm(false);
                      setNewPlaylistName("");
                    }}
                    className="btn-secondary text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowCreateForm(true)}
                className="social-share-btn copy"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Create new playlist
              </button>
            )}
          </div>
        </div>
      )}

      {/* Backdrop to close menu */}
      {showMenu && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => {
            setShowMenu(false);
            setShowCreateForm(false);
            setNewPlaylistName("");
          }}
        />
      )}
    </div>
  );
}
