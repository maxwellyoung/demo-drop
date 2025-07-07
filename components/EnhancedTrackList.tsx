"use client";

import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { FixedSizeList as List } from "react-window";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  Grid3X3,
  List as ListIcon,
  MoreHorizontal,
  Play,
  Pause,
  Clock,
  Calendar,
  Music,
  Zap,
  Tag,
  SortAsc,
  SortDesc,
  X,
} from "lucide-react";
import { usePlayer } from "./PersistentMiniPlayer";
import ArtworkGenerator from "./ArtworkGenerator";

interface Track {
  slug: string;
  originalName: string;
  filename: string;
  title: string;
  artist: string;
  uploadedAt: string;
  size: number;
  type: string;
  reactions: {
    fire: number;
    cry: number;
    explode: number;
    broken: number;
  };
  extendedMetadata?: {
    description?: string;
    tags?: string[];
    credits?: string[];
    notes?: string;
    genre?: string;
    bpm?: number;
    key?: string;
    duration?: number;
  };
  audioMetadata?: {
    duration: number;
    bitrate: number;
    sampleRate: number;
    channels: number;
  };
}

type ViewMode = "ultra-compact" | "list" | "grid";
type SortField = "title" | "artist" | "uploadedAt" | "reactions" | "bpm";
type SortDirection = "asc" | "desc";

interface EnhancedTrackListProps {
  tracks: Track[];
}

// Ultra-compact row component (30px height)
const UltraCompactRow = React.memo(({ index, style, data }: any) => {
  const { tracks, playTrack, currentTrack } = data;
  const track = tracks[index];
  const isPlaying = currentTrack?.slug === track.slug;

  const handlePlay = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      playTrack({
        slug: track.slug,
        title: track.title,
        artist: track.artist,
        audioUrl: `/uploads/${track.filename}`,
        genre: track.extendedMetadata?.genre,
      });
    },
    [track, playTrack]
  );

  return (
    <div style={style} className="px-3">
      <motion.div
        initial={{ opacity: 0, y: 2 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15, delay: index * 0.01 }}
        className={`
          flex items-center h-[28px] px-2 rounded-md group
          hover:bg-neutral-800/30 transition-all duration-150
          ${isPlaying ? "bg-blue-500/10 border-l-2 border-blue-500" : ""}
        `}
        onClick={handlePlay}
      >
        {/* Play indicator/button */}
        <button
          onClick={handlePlay}
          className="w-5 h-5 mr-3 flex items-center justify-center rounded opacity-0 group-hover:opacity-100 hover:bg-neutral-700/50 transition-all"
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <Pause className="w-3 h-3 text-blue-400" />
          ) : (
            <Play className="w-3 h-3 text-neutral-400" />
          )}
        </button>

        {/* Track info - minimal design */}
        <div className="flex-1 min-w-0 flex items-center text-xs">
          <span className="font-medium text-neutral-200 truncate max-w-[200px]">
            {track.title}
          </span>
          <span className="mx-2 text-neutral-600">·</span>
          <span className="text-neutral-400 truncate max-w-[150px]">
            {track.artist}
          </span>
        </div>

        {/* Minimal metadata */}
        <div className="flex items-center gap-3 text-xs text-neutral-500">
          {track.extendedMetadata?.bpm && (
            <span className="font-mono">{track.extendedMetadata.bpm}</span>
          )}
          {track.audioMetadata?.duration && (
            <span className="font-mono">
              {Math.floor(track.audioMetadata.duration / 60)}:
              {(track.audioMetadata.duration % 60).toFixed(0).padStart(2, "0")}
            </span>
          )}
          {track.extendedMetadata?.genre && (
            <span className="px-1.5 py-0.5 bg-neutral-800/50 rounded text-[10px] font-medium">
              {track.extendedMetadata.genre}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="p-1 hover:bg-neutral-700/50 rounded">
            <MoreHorizontal className="w-3 h-3 text-neutral-400" />
          </button>
        </div>
      </motion.div>
    </div>
  );
});

// Normal list row component (48px height)
const ListRow = React.memo(({ index, style, data }: any) => {
  const { tracks, playTrack, currentTrack } = data;
  const track = tracks[index];
  const isPlaying = currentTrack?.slug === track.slug;

  const handlePlay = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      playTrack({
        slug: track.slug,
        title: track.title,
        artist: track.artist,
        audioUrl: `/uploads/${track.filename}`,
        genre: track.extendedMetadata?.genre,
      });
    },
    [track, playTrack]
  );

  return (
    <div style={style} className="px-3">
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: index * 0.02 }}
        className={`
          flex items-center h-[46px] px-3 rounded-lg group
          hover:bg-neutral-800/40 transition-all duration-200
          ${isPlaying ? "bg-blue-500/10 ring-1 ring-blue-500/30" : ""}
        `}
        onClick={handlePlay}
      >
        {/* Artwork */}
        <div className="w-8 h-8 mr-3 rounded-md overflow-hidden bg-neutral-800 flex-shrink-0">
          <ArtworkGenerator
            title={track.title}
            artist={track.artist}
            genre={track.extendedMetadata?.genre}
            size="small"
          />
        </div>

        {/* Track info */}
        <div className="flex-1 min-w-0">
          <div className="font-medium text-neutral-100 truncate text-sm">
            {track.title}
          </div>
          <div className="text-neutral-400 truncate text-xs">
            {track.artist}
          </div>
        </div>

        {/* Metadata */}
        <div className="flex items-center gap-4 text-xs text-neutral-500">
          {track.extendedMetadata?.bpm && (
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3" />
              <span className="font-mono">{track.extendedMetadata.bpm}</span>
            </div>
          )}
          {track.audioMetadata?.duration && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span className="font-mono">
                {Math.floor(track.audioMetadata.duration / 60)}:
                {(track.audioMetadata.duration % 60)
                  .toFixed(0)
                  .padStart(2, "0")}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={handlePlay}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-neutral-800/50 hover:bg-blue-500 transition-all group"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 text-blue-400" />
            ) : (
              <Play className="w-4 h-4 text-neutral-400 group-hover:text-white" />
            )}
          </button>
          <button className="p-1.5 hover:bg-neutral-700/50 rounded opacity-0 group-hover:opacity-100 transition-all">
            <MoreHorizontal className="w-4 h-4 text-neutral-400" />
          </button>
        </div>
      </motion.div>
    </div>
  );
});

// Grid item component
const GridItem = React.memo(({ track, playTrack, currentTrack }: any) => {
  const isPlaying = currentTrack?.slug === track.slug;

  const handlePlay = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      playTrack({
        slug: track.slug,
        title: track.title,
        artist: track.artist,
        audioUrl: `/uploads/${track.filename}`,
        genre: track.extendedMetadata?.genre,
      });
    },
    [track, playTrack]
  );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`
        relative group p-3 rounded-xl bg-neutral-900/30 backdrop-blur-xl
        border border-neutral-800/30 hover:border-neutral-700/50
        transition-all duration-300 hover:scale-[1.02] hover:shadow-lg
        ${isPlaying ? "ring-1 ring-blue-500/50 bg-blue-500/5" : ""}
      `}
    >
      {/* Artwork */}
      <div className="aspect-square rounded-lg overflow-hidden mb-3 bg-neutral-800">
        <ArtworkGenerator
          title={track.title}
          artist={track.artist}
          genre={track.extendedMetadata?.genre}
          size="medium"
        />

        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button
            onClick={handlePlay}
            className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 text-white" />
            ) : (
              <Play className="w-6 h-6 text-white ml-0.5" />
            )}
          </button>
        </div>
      </div>

      {/* Track info */}
      <div className="space-y-1">
        <h3 className="font-medium text-neutral-100 truncate text-sm">
          {track.title}
        </h3>
        <p className="text-neutral-400 truncate text-xs">{track.artist}</p>

        {/* Metadata */}
        <div className="flex items-center gap-2 text-xs text-neutral-500">
          {track.extendedMetadata?.bpm && (
            <span className="px-1.5 py-0.5 bg-neutral-800/50 rounded font-mono">
              {track.extendedMetadata.bpm}
            </span>
          )}
          {track.extendedMetadata?.genre && (
            <span className="px-1.5 py-0.5 bg-neutral-800/50 rounded">
              {track.extendedMetadata.genre}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
});

export default function EnhancedTrackList({ tracks }: EnhancedTrackListProps) {
  const { playTrack, playerState } = usePlayer();
  const { currentTrack } = playerState;

  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("uploadedAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const listRef = useRef<any>(null);

  // Extract unique genres and tags
  const { availableGenres, availableTags } = useMemo(() => {
    const genres = new Set<string>();
    const tags = new Set<string>();

    tracks.forEach((track) => {
      if (track.extendedMetadata?.genre) {
        genres.add(track.extendedMetadata.genre);
      }
      if (track.extendedMetadata?.tags) {
        track.extendedMetadata.tags.forEach((tag) => tags.add(tag));
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
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          track.title.toLowerCase().includes(query) ||
          track.artist.toLowerCase().includes(query) ||
          track.extendedMetadata?.description?.toLowerCase().includes(query) ||
          track.extendedMetadata?.tags?.some((tag) =>
            tag.toLowerCase().includes(query)
          );
        if (!matchesSearch) return false;
      }

      // Genre filter
      if (selectedGenres.length > 0) {
        if (
          !track.extendedMetadata?.genre ||
          !selectedGenres.includes(track.extendedMetadata.genre)
        ) {
          return false;
        }
      }

      // Tags filter
      if (selectedTags.length > 0) {
        const trackTags = track.extendedMetadata?.tags || [];
        const hasMatchingTag = selectedTags.some((tag) =>
          trackTags.includes(tag)
        );
        if (!hasMatchingTag) return false;
      }

      return true;
    });

    // Sort tracks
    result.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
        case "artist":
          comparison = a.artist.localeCompare(b.artist);
          break;
        case "uploadedAt":
          comparison =
            new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
          break;
        case "reactions":
          const aReactions = Object.values(a.reactions).reduce(
            (sum, count) => sum + count,
            0
          );
          const bReactions = Object.values(b.reactions).reduce(
            (sum, count) => sum + count,
            0
          );
          comparison = aReactions - bReactions;
          break;
        case "bpm":
          const aBpm = a.extendedMetadata?.bpm || 0;
          const bBpm = b.extendedMetadata?.bpm || 0;
          comparison = aBpm - bBpm;
          break;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    return result;
  }, [
    tracks,
    searchQuery,
    selectedGenres,
    selectedTags,
    sortField,
    sortDirection,
  ]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedGenres([]);
    setSelectedTags([]);
    setSortField("uploadedAt");
    setSortDirection("desc");
  };

  const hasActiveFilters =
    searchQuery || selectedGenres.length > 0 || selectedTags.length > 0;

  // Get row height based on view mode
  const getRowHeight = () => {
    switch (viewMode) {
      case "ultra-compact":
        return 30;
      case "list":
        return 48;
      default:
        return 48;
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search tracks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 h-9 pl-10 pr-4 bg-neutral-900/50 border border-neutral-800/50 rounded-lg text-neutral-100 placeholder-neutral-500 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`
              flex items-center gap-2 px-3 h-9 rounded-lg border transition-all
              ${
                hasActiveFilters
                  ? "bg-blue-500/20 border-blue-500/50 text-blue-400"
                  : "bg-neutral-900/50 border-neutral-800/50 text-neutral-400 hover:border-neutral-700/50"
              }
            `}
          >
            <Filter className="w-4 h-4" />
            <span className="text-sm">Filters</span>
            {hasActiveFilters && (
              <span className="ml-1 px-1.5 py-0.5 bg-blue-500 text-white text-xs rounded">
                {selectedGenres.length +
                  selectedTags.length +
                  (searchQuery ? 1 : 0)}
              </span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex items-center bg-neutral-900/50 border border-neutral-800/50 rounded-lg p-1">
            <button
              onClick={() => setViewMode("ultra-compact")}
              className={`p-1.5 rounded transition-all ${
                viewMode === "ultra-compact"
                  ? "bg-neutral-700 text-neutral-100"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
              title="Ultra Compact"
            >
              <div className="w-4 h-4 flex flex-col gap-0.5">
                <div className="h-0.5 bg-current rounded"></div>
                <div className="h-0.5 bg-current rounded"></div>
                <div className="h-0.5 bg-current rounded"></div>
                <div className="h-0.5 bg-current rounded"></div>
              </div>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded transition-all ${
                viewMode === "list"
                  ? "bg-neutral-700 text-neutral-100"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
              title="List"
            >
              <ListIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded transition-all ${
                viewMode === "grid"
                  ? "bg-neutral-700 text-neutral-100"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
              title="Grid"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
          </div>

          {/* Results count */}
          <span className="text-sm text-neutral-500">
            {filteredTracks.length} track
            {filteredTracks.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-neutral-900/30 border border-neutral-800/30 rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-neutral-200">
                  Filters
                </h3>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-neutral-400 hover:text-neutral-200 transition-colors"
                  >
                    Clear all
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Sort */}
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-2">
                    Sort by
                  </label>
                  <div className="flex gap-1">
                    {[
                      {
                        key: "uploadedAt" as SortField,
                        label: "Date",
                        icon: Calendar,
                      },
                      {
                        key: "title" as SortField,
                        label: "Title",
                        icon: Music,
                      },
                      { key: "bpm" as SortField, label: "BPM", icon: Zap },
                    ].map(({ key, label, icon: Icon }) => (
                      <button
                        key={key}
                        onClick={() => handleSort(key)}
                        className={`
                          flex items-center gap-1 px-2 py-1 rounded text-xs transition-all
                          ${
                            sortField === key
                              ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                              : "bg-neutral-800/50 text-neutral-400 hover:bg-neutral-700/50"
                          }
                        `}
                      >
                        <Icon className="w-3 h-3" />
                        <span>{label}</span>
                        {sortField === key &&
                          (sortDirection === "asc" ? (
                            <SortAsc className="w-3 h-3" />
                          ) : (
                            <SortDesc className="w-3 h-3" />
                          ))}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Genres */}
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-2">
                    Genres
                  </label>
                  <div className="flex flex-wrap gap-1">
                    {availableGenres.slice(0, 6).map((genre) => (
                      <button
                        key={genre}
                        onClick={() =>
                          setSelectedGenres((prev) =>
                            prev.includes(genre)
                              ? prev.filter((g) => g !== genre)
                              : [...prev, genre]
                          )
                        }
                        className={`
                          px-2 py-1 text-xs rounded transition-all
                          ${
                            selectedGenres.includes(genre)
                              ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                              : "bg-neutral-800/50 text-neutral-400 hover:bg-neutral-700/50"
                          }
                        `}
                      >
                        {genre}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-2">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-1">
                    {availableTags.slice(0, 6).map((tag) => (
                      <button
                        key={tag}
                        onClick={() =>
                          setSelectedTags((prev) =>
                            prev.includes(tag)
                              ? prev.filter((t) => t !== tag)
                              : [...prev, tag]
                          )
                        }
                        className={`
                          flex items-center gap-1 px-2 py-1 text-xs rounded transition-all
                          ${
                            selectedTags.includes(tag)
                              ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                              : "bg-neutral-800/50 text-neutral-400 hover:bg-neutral-700/50"
                          }
                        `}
                      >
                        <Tag className="w-3 h-3" />
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Track List/Grid */}
      <div className="min-h-[400px]">
        {filteredTracks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-neutral-500">
            <Music className="w-12 h-12 mb-4 opacity-50" />
            <p className="text-lg font-medium">No tracks found</p>
            <p className="text-sm">
              Try adjusting your filters or search query
            </p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredTracks.map((track) => (
                <GridItem
                  key={track.slug}
                  track={track}
                  playTrack={playTrack}
                  currentTrack={currentTrack}
                />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <List
            ref={listRef}
            height={Math.min(600, filteredTracks.length * getRowHeight())}
            itemCount={filteredTracks.length}
            itemSize={getRowHeight()}
            itemData={{
              tracks: filteredTracks,
              playTrack,
              currentTrack,
            }}
            width={"100%"}
          >
            {viewMode === "ultra-compact" ? UltraCompactRow : ListRow}
          </List>
        )}
      </div>
    </div>
  );
}
