"use client";

import { useState, useEffect } from "react";
import { usePlayer } from "./PersistentMiniPlayer";

interface Track {
  slug: string;
  title: string;
  artist: string;
  audioUrl: string;
  genre?: string;
  extendedMetadata?: {
    description?: string;
    tags?: string[];
    genre?: string;
    bpm?: number;
    key?: string;
    duration?: number;
  };
}

interface Playlist {
  id: string;
  name: string;
  description?: string;
  tracks: Track[];
  createdAt: string;
  updatedAt: string;
  isCollaborative?: boolean;
  tags?: string[];
}

interface PlaylistManagerProps {
  allTracks: Track[];
  onPlaylistUpdate?: (playlists: Playlist[]) => void;
}

export default function PlaylistManager({
  allTracks,
  onPlaylistUpdate,
}: PlaylistManagerProps) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPlaylist, setNewPlaylist] = useState({
    name: "",
    description: "",
    isCollaborative: false,
  });

  const { playTrack, addToQueue } = usePlayer();

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

  // Save playlists to localStorage
  useEffect(() => {
    localStorage.setItem("demo-drop-playlists", JSON.stringify(playlists));
    onPlaylistUpdate?.(playlists);
  }, [playlists, onPlaylistUpdate]);

  const createPlaylist = () => {
    if (!newPlaylist.name.trim()) return;

    const playlist: Playlist = {
      id: `playlist-${Date.now()}`,
      name: newPlaylist.name.trim(),
      description: newPlaylist.description.trim(),
      tracks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isCollaborative: newPlaylist.isCollaborative,
    };

    setPlaylists((prev) => [...prev, playlist]);
    setNewPlaylist({ name: "", description: "", isCollaborative: false });
    setShowCreateForm(false);
  };

  const addTrackToPlaylist = (playlistId: string, track: Track) => {
    setPlaylists((prev) =>
      prev.map((playlist) => {
        if (playlist.id === playlistId) {
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
      })
    );
  };

  const removeTrackFromPlaylist = (playlistId: string, trackSlug: string) => {
    setPlaylists((prev) =>
      prev.map((playlist) => {
        if (playlist.id === playlistId) {
          return {
            ...playlist,
            tracks: playlist.tracks.filter((t) => t.slug !== trackSlug),
            updatedAt: new Date().toISOString(),
          };
        }
        return playlist;
      })
    );
  };

  const deletePlaylist = (playlistId: string) => {
    setPlaylists((prev) => prev.filter((p) => p.id !== playlistId));
  };

  const playPlaylist = (playlist: Playlist) => {
    if (playlist.tracks.length === 0) return;
    playTrack(playlist.tracks[0]);
    playlist.tracks.slice(1).forEach((track) => addToQueue(track));
  };

  const formatDuration = (tracks: Track[]) => {
    const totalSeconds = tracks.reduce((acc, track) => {
      return acc + (track.extendedMetadata?.duration || 0);
    }, 0);

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    if (minutes === 0) return `${seconds}s`;
    return `${minutes}m ${seconds}s`;
  };

  return (
    <div className="playlist-manager">
      {/* Header - Inspired by Jeremy Blake's precise typography */}
      <div className="flex items-center justify-between mb-12">
        <div>
          <h2 className="heading-lg mb-3">Playlists</h2>
          <p className="text-secondary text-base">
            Organize your tracks into meaningful collections for better
            collaboration
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="btn-primary flex items-center gap-3"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Playlist
        </button>
      </div>

      {/* Create Playlist Form - Inspired by Dieter Rams' essential functionality */}
      {showCreateForm && (
        <div className="mb-12 p-8 bg-neutral-900/30 backdrop-blur-xl rounded-3xl border border-neutral-800/30 animate-fade-in">
          <h3 className="heading-md mb-6">Create New Playlist</h3>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-3 text-neutral-300">
                Name
              </label>
              <input
                type="text"
                value={newPlaylist.name}
                onChange={(e) =>
                  setNewPlaylist((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="e.g., Project Alpha - Mix 1"
                className="form-input w-full"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-3 text-neutral-300">
                Description
              </label>
              <textarea
                value={newPlaylist.description}
                onChange={(e) =>
                  setNewPlaylist((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Optional description..."
                className="form-textarea w-full"
                rows={3}
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={newPlaylist.isCollaborative}
                  onChange={(e) =>
                    setNewPlaylist((prev) => ({
                      ...prev,
                      isCollaborative: e.target.checked,
                    }))
                  }
                  className="form-checkbox"
                />
                <span className="text-sm text-neutral-300 group-hover:text-neutral-200 transition-colors">
                  Collaborative playlist
                </span>
              </label>
            </div>
            <div className="flex gap-4 pt-4">
              <button
                onClick={createPlaylist}
                className="btn-primary"
                disabled={!newPlaylist.name.trim()}
              >
                Create Playlist
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Playlists Grid - Inspired by Benji Taylor's modern minimalism */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {playlists.map((playlist) => (
          <div key={playlist.id} className="playlist-card group">
            {/* Playlist Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1 min-w-0">
                <h3 className="playlist-title">{playlist.name}</h3>
                {playlist.description && (
                  <p className="playlist-description mt-2">
                    {playlist.description}
                  </p>
                )}
              </div>
              <div className="flex-shrink-0 flex items-center gap-3">
                {playlist.isCollaborative && (
                  <span className="collaborative-badge">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    Collaborative
                  </span>
                )}
                <button
                  onClick={() => deletePlaylist(playlist.id)}
                  className="opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out text-neutral-400 hover:text-red-400 p-2 hover:bg-red-500/10 rounded-xl"
                  title="Delete playlist"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="3,6 5,6 21,6" />
                    <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Playlist Stats - Inspired by Jason Yuan's sophisticated minimalism */}
            <div className="flex items-center gap-6 text-sm text-neutral-400 mb-6">
              <span className="flex items-center gap-2">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 18V5l12-2v13" />
                  <circle cx="6" cy="18" r="3" />
                  <circle cx="18" cy="16" r="3" />
                </svg>
                {playlist.tracks.length} tracks
              </span>
              {playlist.tracks.length > 0 && (
                <span className="flex items-center gap-2">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12,6 12,12 16,14" />
                  </svg>
                  {formatDuration(playlist.tracks)}
                </span>
              )}
              <span className="flex items-center gap-2">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                {new Date(playlist.updatedAt).toLocaleDateString("en-GB")}
              </span>
            </div>

            {/* Playlist Actions - Inspired by Jony Ive's intuitive interaction */}
            <div className="flex gap-3">
              <button
                onClick={() => playPlaylist(playlist)}
                className="btn-secondary flex-1 flex items-center justify-center gap-2"
                disabled={playlist.tracks.length === 0}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  stroke="currentColor"
                  strokeWidth="0"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
                Play All
              </button>
              <button className="btn-tertiary" title="Share playlist">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State - Inspired by Mariana Castilho's human-centered design */}
      {playlists.length === 0 && !showCreateForm && (
        <div className="text-center py-20">
          <div className="text-8xl mb-8 opacity-30">📝</div>
          <h3 className="heading-md mb-4 text-neutral-300">No playlists yet</h3>
          <p className="text-secondary mb-10 max-w-lg mx-auto text-base leading-relaxed">
            Create your first playlist to organize tracks by project, mood, or
            collaboration. Build collections that make sense for your creative
            workflow.
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn-primary"
          >
            Create Your First Playlist
          </button>
        </div>
      )}
    </div>
  );
}
