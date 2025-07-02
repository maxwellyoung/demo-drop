"use client";

import { useState } from "react";
import Link from "next/link";
import { TrackCard } from "./TrackCard";
import { SearchFilters } from "../../components/SearchFilters";

interface TrackMetadata {
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
}

interface ExtendedTrackMetadata {
  description?: string;
  tags?: string[];
  credits?: string[];
  notes?: string;
  genre?: string;
  bpm?: number;
  key?: string;
  duration?: number;
}

interface TrackWithMetadata extends TrackMetadata {
  extendedMetadata?: ExtendedTrackMetadata;
}

// Generate vibrant gradient for track artwork
function generateTrackGradient(title: string, artist: string, genre?: string) {
  const colors = [
    ["from-purple-500", "to-pink-500"],
    ["from-blue-500", "to-cyan-500"],
    ["from-green-500", "to-emerald-500"],
    ["from-red-500", "to-orange-500"],
    ["from-indigo-500", "to-purple-500"],
    ["from-pink-500", "to-rose-500"],
    ["from-cyan-500", "to-blue-500"],
    ["from-orange-500", "to-red-500"],
    ["from-emerald-500", "to-teal-500"],
    ["from-violet-500", "to-purple-500"],
    ["from-amber-500", "to-orange-500"],
    ["from-teal-500", "to-cyan-500"],
  ];

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
  tracks: TrackWithMetadata[];
}

export function ClientTracksPage({ tracks }: ClientTracksPageProps) {
  const [filteredTracks, setFilteredTracks] = useState(tracks);

  // Calculate quick stats
  const stats = {
    totalTracks: tracks.length,
    totalReactions: tracks.reduce(
      (sum, track) =>
        sum + Object.values(track.reactions).reduce((a, b) => a + b, 0),
      0
    ),
    uniqueArtists: new Set(tracks.map((track) => track.artist)).size,
    genres: new Set(
      tracks.map((track) => track.extendedMetadata?.genre).filter(Boolean)
    ).size,
  };

  return (
    <div className="container-wide animate-fade-in">
      {/* Hero Header */}
      <div className="mb-16 text-center">
        <h1 className="heading-xl mb-6 bg-gradient-to-b from-neutral-50 via-neutral-200 to-neutral-500 bg-clip-text text-transparent">
          Discover
        </h1>
        <p className="text-secondary text-xl font-light max-w-2xl mx-auto leading-relaxed">
          {filteredTracks.length} demo{filteredTracks.length !== 1 ? "s" : ""}{" "}
          ready to be discovered
        </p>
      </div>

      {/* Quick Stats */}
      {tracks.length > 0 && (
        <div className="mb-12">
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

      {tracks.length === 0 ? (
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
      ) : (
        <>
          {/* Search Filters */}
          <div className="mb-12">
            <SearchFilters
              tracks={tracks}
              onFilteredTracksChange={setFilteredTracks}
            />
          </div>

          {/* Results Count */}
          {filteredTracks.length !== tracks.length && (
            <div className="mb-8 text-center">
              <p className="text-secondary">
                Showing {filteredTracks.length} of {tracks.length} tracks
              </p>
            </div>
          )}

          {/* Gallery Grid */}
          {filteredTracks.length > 0 ? (
            <div className="masonry-grid">
              {filteredTracks.map((track) => {
                const [gradientFrom, gradientTo] = generateTrackGradient(
                  track.title,
                  track.artist,
                  track.extendedMetadata?.genre
                );

                return (
                  <TrackCard
                    key={track.slug}
                    track={track}
                    gradientFrom={gradientFrom}
                    gradientTo={gradientTo}
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center py-24">
              <div className="text-6xl mb-6 opacity-40">🔍</div>
              <h2 className="heading-lg mb-4 text-neutral-300">
                No tracks found
              </h2>
              <p className="text-secondary text-lg max-w-md mx-auto leading-relaxed">
                Try adjusting your search criteria or filters to find what
                you're looking for.
              </p>
            </div>
          )}

          {/* Load More (Future Implementation) */}
          {filteredTracks.length > 0 && (
            <div className="text-center mt-16 mb-8">
              <button className="btn-secondary">Load More Tracks</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
