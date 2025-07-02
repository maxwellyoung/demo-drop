"use client";

import { useState, useEffect, useMemo } from "react";
import { useDebounce } from "./hooks/useDebounce";

interface SearchFiltersProps {
  tracks: any[];
  onFilteredTracksChange: (filteredTracks: any[]) => void;
}

interface Filters {
  search: string;
  genre: string;
  bpmRange: [number, number];
  sortBy: "newest" | "oldest" | "title" | "artist" | "reactions";
  tags: string[];
}

const BPM_RANGES = [
  { label: "Any BPM", value: [0, 999] as [number, number] },
  { label: "Slow (60-90)", value: [60, 90] as [number, number] },
  { label: "Medium (90-120)", value: [90, 120] as [number, number] },
  { label: "Fast (120-140)", value: [120, 140] as [number, number] },
  { label: "Very Fast (140+)", value: [140, 999] as [number, number] },
];

export function SearchFilters({
  tracks,
  onFilteredTracksChange,
}: SearchFiltersProps) {
  const [filters, setFilters] = useState<Filters>({
    search: "",
    genre: "",
    bpmRange: [0, 999],
    sortBy: "newest",
    tags: [],
  });

  const [isExpanded, setIsExpanded] = useState(false);
  const debouncedSearch = useDebounce(filters.search, 300);

  // Extract unique genres and tags from tracks
  const { availableGenres, availableTags } = useMemo(() => {
    const genres = new Set<string>();
    const tags = new Set<string>();

    tracks.forEach((track) => {
      if (track.extendedMetadata?.genre) {
        genres.add(track.extendedMetadata.genre);
      }
      if (track.extendedMetadata?.tags) {
        track.extendedMetadata.tags.forEach((tag: string) => tags.add(tag));
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
          track.extendedMetadata?.description
            ?.toLowerCase()
            .includes(searchTerm) ||
          track.extendedMetadata?.tags?.some((tag: string) =>
            tag.toLowerCase().includes(searchTerm)
          );

        if (!matchesSearch) return false;
      }

      // Genre filter
      if (filters.genre && track.extendedMetadata?.genre !== filters.genre) {
        return false;
      }

      // BPM filter
      if (track.extendedMetadata?.bpm) {
        const bpm = track.extendedMetadata.bpm;
        if (bpm < filters.bpmRange[0] || bpm > filters.bpmRange[1]) {
          return false;
        }
      }

      // Tags filter
      if (filters.tags.length > 0) {
        const trackTags = track.extendedMetadata?.tags || [];
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
          return (
            new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
          );
        case "oldest":
          return (
            new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime()
          );
        case "title":
          return a.title.localeCompare(b.title);
        case "artist":
          return a.artist.localeCompare(b.artist);
        case "reactions":
          const aReactions = Object.values(a.reactions).reduce(
            (sum: number, count: any) => sum + count,
            0
          );
          const bReactions = Object.values(b.reactions).reduce(
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

  // Notify parent component of filtered tracks
  useEffect(() => {
    onFilteredTracksChange(filteredTracks);
  }, [filteredTracks, onFilteredTracksChange]);

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

  return (
    <div className="search-filters">
      {/* Search Bar */}
      <div className="search-bar-container">
        <div className="search-bar">
          <svg
            className="search-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search tracks, artists, tags..."
            value={filters.search}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, search: e.target.value }))
            }
            className="search-input"
          />
          {filters.search && (
            <button
              onClick={() => setFilters((prev) => ({ ...prev, search: "" }))}
              className="search-clear"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="filter-toggle"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z"
            />
          </svg>
          Filters
          {hasActiveFilters && (
            <span className="filter-badge">{filteredTracks.length}</span>
          )}
        </button>
      </div>

      {/* Advanced Filters */}
      {isExpanded && (
        <div className="filters-panel">
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
                    setFilters((prev) => ({ ...prev, bpmRange: range.value }));
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
        </div>
      )}

      {/* Results Summary */}
      <div className="results-summary">
        Showing {filteredTracks.length} of {tracks.length} tracks
        {hasActiveFilters && (
          <span className="filter-indicator">• Filtered</span>
        )}
      </div>
    </div>
  );
}
