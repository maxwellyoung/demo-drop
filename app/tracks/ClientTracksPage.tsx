"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Filter, LayoutGrid, List } from "lucide-react";
import { TrackRow } from "./TrackRow";
import PowerUserFeatures from "../../components/PowerUserFeatures";
import { log } from "../../lib/logger";
import CloudManager from "../../components/CloudManager";
import { useDebounce } from "../../components/hooks/useDebounce";
import { usePlayer } from "../../components/PersistentMiniPlayer";
import { useRouter } from "next/navigation";
import { TrackCard } from "./TrackCard";
import EnhancedSearchBar from "@/components/EnhancedSearchBar";
import CloudSyncStatusBar from "@/components/CloudSyncStatusBar";
import { RecordModel } from "pocketbase";

interface Filters {
  search: string;
  genre: string;
  bpmRange: [number, number];
  sortBy: "newest" | "oldest" | "title" | "artist" | "reactions";
  tags: string[];
}

const BPM_RANGES = [
  { label: "All BPM", value: [0, 999] as [number, number] },
  { label: "Slow (60-90)", value: [60, 90] as [number, number] },
  { label: "Medium (90-120)", value: [90, 120] as [number, number] },
  { label: "Fast (120-140)", value: [120, 140] as [number, number] },
  { label: "Very Fast (140+)", value: [140, 999] as [number, number] },
];

import { ARTWORK_COLORS } from "../../constants/ui";

// Generate vibrant gradient for track artwork
function generateTrackGradient(title: string, artist: string, genre?: string) {
  const colors = ARTWORK_COLORS;

  // Simple hash function to consistently pick colors based on track info
  const hash = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  };

  const colorIndex = hash(title + artist + (genre || "")) % colors.length;
  return colors[colorIndex];
}

interface ClientTracksPageProps {
  tracks: RecordModel[];
}

export function ClientTracksPage({ tracks }: ClientTracksPageProps) {
  const { playTrack, addToQueue, playerState } = usePlayer();
  const [isExpanded, setIsExpanded] = useState(false);
  const [focusedTrackIndex, setFocusedTrackIndex] = useState(-1);
  const trackListRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filters, setFilters] = useState<Filters>({
    search: "",
    genre: "",
    bpmRange: [0, 999],
    sortBy: "newest",
    tags: [],
  });

  const debouncedSearch = useDebounce(filters.search, 300);

  // Extract unique genres and tags from tracks
  const { availableGenres, availableTags } = useMemo(() => {
    const genres = new Set<string>();
    const tags = new Set<string>();

    tracks.forEach((track) => {
      if (track.genre) {
        genres.add(track.genre);
      }
      if (track.tags) {
        track.tags.forEach((tag: string) => tags.add(tag));
      }
    });

    return {
      availableGenres: Array.from(genres).sort(),
      availableTags: Array.from(tags).sort(),
    };
  }, [tracks]);

  // Filter and sort tracks
  const filteredTracks = useMemo(() => {
    let result = tracks.filter((track) => {
      // Search filter
      if (debouncedSearch) {
        const searchTerm = debouncedSearch.toLowerCase();
        const matchesSearch =
          track.title.toLowerCase().includes(searchTerm) ||
          track.artist.toLowerCase().includes(searchTerm) ||
          track.description?.toLowerCase().includes(searchTerm) ||
          track.tags?.some((tag: string) =>
            tag.toLowerCase().includes(searchTerm)
          );

        if (!matchesSearch) return false;
      }

      // Genre filter
      if (filters.genre && track.genre !== filters.genre) {
        return false;
      }

      // BPM filter
      if (track.bpm) {
        const bpm = track.bpm;
        if (bpm < filters.bpmRange[0] || bpm > filters.bpmRange[1]) {
          return false;
        }
      }

      // Tags filter
      if (filters.tags.length > 0) {
        const trackTags = track.tags || [];
        const hasMatchingTag = filters.tags.some((filterTag) =>
          trackTags.includes(filterTag)
        );
        if (!hasMatchingTag) return false;
      }

      return true;
    });

    // Sort tracks
    result.sort((a, b) => {
      switch (filters.sortBy) {
        case "newest":
          return new Date(b.created).getTime() - new Date(a.created).getTime();
        case "oldest":
          return new Date(a.created).getTime() - new Date(b.created).getTime();
        case "title":
          return a.title.localeCompare(b.title);
        case "artist":
          return a.artist.localeCompare(b.artist);
        case "reactions":
          const aReactions = Object.values(a.reactions || {}).reduce(
            (sum: number, count: any) => sum + count,
            0
          );
          const bReactions = Object.values(b.reactions || {}).reduce(
            (sum: number, count: any) => sum + count,
            0
          );
          return bReactions - aReactions;
        default:
          return 0;
      }
    });

    return result;
  }, [tracks, debouncedSearch, filters]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return; // Don't interfere with search input

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setFocusedTrackIndex((prev) =>
            prev < filteredTracks.length - 1 ? prev + 1 : prev
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setFocusedTrackIndex((prev) => (prev > 0 ? prev - 1 : prev));
          break;
        case "Home":
          e.preventDefault();
          setFocusedTrackIndex(0);
          break;
        case "End":
          e.preventDefault();
          setFocusedTrackIndex(filteredTracks.length - 1);
          break;
        case "Escape":
          setFocusedTrackIndex(-1);
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [filteredTracks.length]);

  // Reset focused index when tracks change
  useEffect(() => {
    setFocusedTrackIndex(-1);
  }, [filteredTracks]);

  const createPlayerTrack = (track: RecordModel) => ({
    slug: track.id,
    title: track.title,
    artist: track.artist,
    audioUrl: `/api/stream/${track.audio}`,
  });

  const handleTagToggle = (tag: string) => {
    setFilters((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      genre: "",
      bpmRange: [0, 999],
      sortBy: "newest",
      tags: [],
    });
  };

  const hasActiveFilters =
    filters.search ||
    filters.genre ||
    filters.tags.length > 0 ||
    filters.bpmRange[0] !== 0 ||
    filters.bpmRange[1] !== 999 ||
    filters.sortBy !== "newest";

  // Calculate quick stats
  const stats = useMemo(() => {
    return {
      totalTracks: tracks.length,
      totalReactions: tracks.reduce((sum: number, track: RecordModel) => {
        const reactions = track.reactions || {};
        const reactionCount = Object.values(reactions).reduce(
          (a: number, b: number) => a + b,
          0
        );
        return sum + (reactionCount || 0);
      }, 0),
      uniqueArtists: new Set(tracks.map((track) => track.artist)).size,
      genres: new Set(tracks.map((track) => track.genre).filter(Boolean)).size,
    };
  }, [tracks]);

  // Power user feature handlers
  const handleBulkAction = useCallback((action: string, trackIds: string[]) => {
    log.info(`Bulk action initiated`, { action, trackCount: trackIds.length });
    // TODO: Implement bulk actions
    alert(`${action} action completed for ${trackIds.length} tracks`);
  }, []);

  const handleAdvancedSearch = useCallback((query: string, filters: any) => {
    log.info("Advanced search initiated", { query, filters });
    // TODO: Implement advanced search
    alert(
      `Advanced search: "${query}" with filters: ${JSON.stringify(filters)}`
    );
  }, []);

  const handleExportData = useCallback((format: string) => {
    log.info("Data export initiated", { format });
    // TODO: Implement data export
    alert(`Exporting data in ${format} format`);
  }, []);

  const handleImportData = useCallback((data: any) => {
    log.info("Data import initiated", { trackCount: data.length });
    // TODO: Implement data import
    alert(`Importing ${data.length} tracks`);
  }, []);

  return (
    <div className="container-wide animate-fade-in">
      {/* Hero Header */}
      <div className="mb-12 text-center">
        <h1 className="heading-xl mb-6 bg-gradient-to-b from-neutral-50 via-neutral-200 to-neutral-500 bg-clip-text text-transparent">
          Discover
        </h1>
        <p className="text-secondary text-xl font-light max-w-2xl mx-auto leading-relaxed">
          {filteredTracks.length} demo{filteredTracks.length !== 1 ? "s" : ""}{" "}
          ready to be discovered
        </p>
      </div>

      {/* Cloud Sync Status */}
      {/* <CloudSyncStatusBar /> */}

      {/* Quick Stats */}
      {tracks.length > 0 && (
        <div className="mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="stat-card">
              <div className="stat-number">{stats.totalTracks}</div>
              <div className="stat-label">Total Tracks</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.totalReactions}</div>
              <div className="stat-label">Total Reactions</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.uniqueArtists}</div>
              <div className="stat-label">Unique Artists</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.genres}</div>
              <div className="stat-label">Genres</div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Search & Filters */}
      <div className="mb-8">
        <div className="enhanced-search-container">
          <div className="enhanced-search-bar">
            <div className="search-input-wrapper">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Search tracks, artists, tags... (⌘K)"
                value={filters.search}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, search: e.target.value }))
                }
                className="enhanced-search-input"
              />
              {filters.search && (
                <button
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, search: "" }))
                  }
                  className="search-clear-btn"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="search-actions">
              <button
                onClick={() => setViewMode("list")}
                className={`filter-btn ${
                  viewMode === "list" ? "bg-neutral-700/50" : ""
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`filter-btn ${
                  viewMode === "grid" ? "bg-neutral-700/50" : ""
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="filter-btn"
                title="Toggle filters"
              >
                <Filter className="w-4 h-4" />
              </button>

              <div className="search-shortcut">
                <kbd className="shortcut-key">⌘</kbd>
                <kbd className="shortcut-key">K</kbd>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="filters-panel mt-4"
          >
            <div className="filters-grid">
              {/* Genre Filter */}
              <div className="filter-group">
                <label className="filter-label">Genre</label>
                <select
                  value={filters.genre}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, genre: e.target.value }))
                  }
                  className="filter-select"
                >
                  <option value="">All Genres</option>
                  {availableGenres.map((genre) => (
                    <option key={genre} value={genre}>
                      {genre}
                    </option>
                  ))}
                </select>
              </div>

              {/* BPM Filter */}
              <div className="filter-group">
                <label className="filter-label">BPM</label>
                <select
                  value={`${filters.bpmRange[0]}-${filters.bpmRange[1]}`}
                  onChange={(e) => {
                    const range = BPM_RANGES.find(
                      (r) => `${r.value[0]}-${r.value[1]}` === e.target.value
                    );
                    if (range) {
                      setFilters((prev) => ({
                        ...prev,
                        bpmRange: range.value,
                      }));
                    }
                  }}
                  className="filter-select"
                >
                  {BPM_RANGES.map((range) => (
                    <option
                      key={range.label}
                      value={`${range.value[0]}-${range.value[1]}`}
                    >
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div className="filter-group">
                <label className="filter-label">Sort By</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      sortBy: e.target.value as any,
                    }))
                  }
                  className="filter-select"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="title">Title A-Z</option>
                  <option value="artist">Artist A-Z</option>
                  <option value="reactions">Most Reactions</option>
                </select>
              </div>
            </div>

            {/* Tags Filter */}
            {availableTags.length > 0 && (
              <div className="filter-group">
                <label className="filter-label">Tags</label>
                <div className="tags-grid">
                  {availableTags.slice(0, 12).map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleTagToggle(tag)}
                      className={`tag-filter ${
                        filters.tags.includes(tag) ? "active" : ""
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button onClick={clearFilters} className="clear-filters">
                Clear All Filters
              </button>
            )}
          </motion.div>
        )}
      </div>

      {/* Results Count */}
      {filteredTracks.length !== tracks.length && (
        <div className="mb-4 text-center">
          <p className="text-secondary">
            Showing {filteredTracks.length} of {tracks.length} tracks
          </p>
        </div>
      )}

      {/* List View */}
      {filteredTracks.length > 0 ? (
        <>
          {viewMode === "list" && (
            <div className="tracks-list" ref={trackListRef}>
              {filteredTracks.map((track, index) => (
                <TrackRow
                  key={track.id}
                  track={track}
                  index={index}
                  focused={focusedTrackIndex === index}
                  onFocus={(e) => {
                    e.preventDefault();
                    setFocusedTrackIndex(index);
                  }}
                  onPlay={() => playTrack(createPlayerTrack(track))}
                  onAddToQueue={() => addToQueue(createPlayerTrack(track))}
                />
              ))}
            </div>
          )}
          {viewMode === "grid" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {filteredTracks.map((track) => {
                const [from, to] = generateTrackGradient(
                  track.title,
                  track.artist,
                  track.genre
                );
                return (
                  <TrackCard
                    key={track.id}
                    track={track}
                    gradientFrom={from}
                    gradientTo={to}
                  />
                );
              })}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-24">
          <div className="text-8xl mb-8 opacity-40">🎵</div>
          <h2 className="heading-lg mb-6 text-neutral-300">No tracks yet</h2>
          <p className="text-secondary mb-12 text-lg max-w-md mx-auto leading-relaxed">
            Upload your first demo to start building your collection and get
            discovered by the community.
          </p>
          <Link href="/" className="btn-primary text-lg px-8 py-4">
            Upload Your First Track
          </Link>
        </div>
      )}

      {/* Cloud Storage Section */}
      <div className="mt-8 mb-8">
        <h2 className="text-lg font-medium text-neutral-100 mb-4">
          Cloud Storage
        </h2>
        <CloudManager />
      </div>

      {/* Power User Features */}
      <PowerUserFeatures
        tracks={tracks}
        onBulkAction={handleBulkAction}
        onAdvancedSearch={handleAdvancedSearch}
        onExportData={handleExportData}
        onImportData={handleImportData}
      />
    </div>
  );
}
