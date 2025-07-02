"use client";

import Link from "next/link";
import { usePlayer } from "../../components/PersistentMiniPlayer";

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

interface TrackCardProps {
  track: TrackWithMetadata;
  gradientFrom: string;
  gradientTo: string;
}

export function TrackCard({ track, gradientFrom, gradientTo }: TrackCardProps) {
  const { playTrack, addToQueue } = usePlayer();

  const totalReactions = Object.values(track.reactions).reduce(
    (sum, count) => sum + count,
    0
  );

  const handlePlayClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

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
  };

  return (
    <Link href={`/track/${track.slug}`} className="group block">
      <div className="track-card">
        {/* Artwork */}
        <div className="track-artwork">
          <div
            className={`w-full h-full bg-gradient-to-br ${gradientFrom} ${gradientTo} opacity-80`}
          >
            <div className="w-full h-full flex items-center justify-center backdrop-blur-[2px]">
              <div className="text-center">
                <div className="text-4xl mb-2 opacity-90">🎵</div>
                <div className="text-white/80 text-sm font-medium tracking-wide">
                  {track.extendedMetadata?.genre || "Music"}
                </div>
              </div>
            </div>
          </div>

          {/* Trending Badge */}
          {totalReactions >= 10 && (
            <div className="absolute top-3 left-3">
              <div className="trending-badge">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span>Trending</span>
              </div>
            </div>
          )}

          {/* Hover Overlay with Play Button */}
          <div className="track-overlay">
            <button
              onClick={handlePlayClick}
              className="play-button-mini"
              title="Play track"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Track Info */}
        <div className="track-details">
          <h3 className="track-title">{track.title}</h3>
          <p className="track-artist">{track.artist}</p>

          {track.extendedMetadata?.description && (
            <p className="track-description">
              {track.extendedMetadata.description}
            </p>
          )}

          {/* Tags */}
          {track.extendedMetadata?.tags &&
            track.extendedMetadata.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {track.extendedMetadata.tags.slice(0, 2).map((tag, index) => (
                  <span key={index} className="track-tag">
                    {tag}
                  </span>
                ))}
                {track.extendedMetadata.tags.length > 2 && (
                  <span className="track-tag-more">
                    +{track.extendedMetadata.tags.length - 2}
                  </span>
                )}
              </div>
            )}

          {/* Metadata Row */}
          <div className="track-metadata">
            <div className="flex items-center gap-3 text-xs text-neutral-500">
              <span>
                {new Date(track.uploadedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
              {track.extendedMetadata?.bpm && (
                <span className="flex items-center gap-1">
                  <span className="w-1 h-1 bg-neutral-500 rounded-full"></span>
                  {track.extendedMetadata.bpm} BPM
                </span>
              )}
              {totalReactions > 0 && (
                <span className="flex items-center gap-1">
                  <span className="w-1 h-1 bg-neutral-500 rounded-full"></span>
                  ❤️ {totalReactions}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
