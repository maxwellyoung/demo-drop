"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePlayer } from "../../components/PersistentMiniPlayer";
import ShareButton from "../../components/ShareButton";
import AddToPlaylistButton from "../../components/AddToPlaylistButton";
import ArtworkGenerator from "../../components/ArtworkGenerator";
import {
  AnimatedCard,
  FadeIn,
  AnimatedButton,
  PulseBadge,
  cardHover,
  fadeInUp,
} from "../../components/animations/MotionComponents";

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

// Enhanced artwork generation with more sophisticated patterns
function generateDynamicArtwork(track: TrackWithMetadata) {
  const { title, artist, extendedMetadata } = track;
  const genre = extendedMetadata?.genre || "Music";
  const bpm = extendedMetadata?.bpm || 120;

  // Create a unique seed based on track properties
  const seed = title.length + artist.length + genre.length + (bpm % 100);

  // Generate visual patterns based on track characteristics
  const patterns = [
    // Geometric patterns
    "radial-gradient(circle at 30% 20%, var(--color1) 0%, transparent 50%), radial-gradient(circle at 70% 80%, var(--color2) 0%, transparent 50%)",
    "linear-gradient(45deg, var(--color1) 0%, transparent 30%, var(--color2) 70%, transparent 100%)",
    "conic-gradient(from 0deg at 50% 50%, var(--color1), var(--color2), var(--color1))",
    "repeating-linear-gradient(45deg, var(--color1) 0px, var(--color1) 10px, transparent 10px, transparent 20px)",
    // Organic patterns
    "radial-gradient(ellipse at 20% 30%, var(--color1) 0%, transparent 40%), radial-gradient(ellipse at 80% 70%, var(--color2) 0%, transparent 40%)",
    "linear-gradient(135deg, var(--color1) 0%, var(--color2) 25%, var(--color1) 50%, var(--color2) 75%, var(--color1) 100%)",
  ];

  const patternIndex = seed % patterns.length;
  const pattern = patterns[patternIndex];

  // Generate complementary colors based on genre and mood
  const colorPalettes = {
    electronic: ["#6366f1", "#ec4899", "#8b5cf6", "#06b6d4"],
    rock: ["#dc2626", "#ea580c", "#d97706", "#ca8a04"],
    jazz: ["#059669", "#0d9488", "#0891b2", "#7c3aed"],
    classical: ["#1e40af", "#3730a3", "#5b21b6", "#7c2d12"],
    hiphop: ["#991b1b", "#92400e", "#78350f", "#451a03"],
    pop: ["#be185d", "#a21caf", "#7c3aed", "#2563eb"],
    ambient: ["#064e3b", "#0f766e", "#1e3a8a", "#312e81"],
    folk: ["#166534", "#15803d", "#16a34a", "#22c55e"],
  };

  const palette =
    colorPalettes[genre.toLowerCase() as keyof typeof colorPalettes] ||
    colorPalettes.pop;
  const color1 = palette[seed % palette.length];
  const color2 = palette[(seed + 1) % palette.length];

  return {
    pattern: pattern
      .replace("var(--color1)", color1)
      .replace("var(--color2)", color2),
    color1,
    color2,
    intensity: (bpm / 200) * 0.8 + 0.2, // Higher BPM = more intense
  };
}

export function TrackCard({ track, gradientFrom, gradientTo }: TrackCardProps) {
  const { playTrack, addToQueue, playerState } = usePlayer();
  const { currentTrack, currentTime } = playerState;
  const [isHovered, setIsHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [artworkUrl, setArtworkUrl] = useState<string | null>(null);

  const totalReactions = Object.values(track.reactions).reduce(
    (sum, count) => sum + count,
    0
  );

  // Generate dynamic artwork
  const artwork = useMemo(() => generateDynamicArtwork(track), [track]);

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
    setIsPlaying(true);

    // Reset playing state after animation
    setTimeout(() => setIsPlaying(false), 300);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on interactive elements
    const target = e.target as HTMLElement;
    if (
      target.closest(".play-button-enhanced") ||
      target.closest(".track-actions-enhanced") ||
      target.closest(".ShareButton") ||
      target.closest(".AddToPlaylistButton")
    ) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
  };

  // Check if this track is currently playing
  const isCurrentlyPlaying = currentTrack?.slug === track.slug;

  // Calculate card height based on content
  const hasDescription = track.extendedMetadata?.description;
  const hasTags =
    track.extendedMetadata?.tags && track.extendedMetadata.tags.length > 0;
  const cardHeight = hasDescription || hasTags ? "h-auto" : "h-80";

  // Handle artwork generation
  const handleArtworkGenerated = (url: string) => {
    setArtworkUrl(url);
  };

  return (
    <FadeIn delay={0.1} className={`group relative ${cardHeight}`}>
      <Link href={`/track/${track.slug}`} onClick={handleCardClick}>
        <AnimatedCard
          className="track-card-enhanced"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Generated Artwork */}
          <div className="track-artwork-enhanced">
            <ArtworkGenerator
              title={track.title}
              artist={track.artist}
              genre={track.extendedMetadata?.genre}
              size="medium"
              onArtworkGenerated={handleArtworkGenerated}
              className="track-artwork"
            />

            {/* Playing Indicator */}
            {isCurrentlyPlaying && (
              <div className="playing-indicator">
                <div className="playing-animation">
                  <div className="playing-bar"></div>
                  <div className="playing-bar"></div>
                  <div className="playing-bar"></div>
                </div>
              </div>
            )}

            {/* Trending Badge */}
            {totalReactions >= 10 && (
              <PulseBadge className="trending-badge-enhanced">
                <div className="trending-icon">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </div>
                <span className="trending-text">Trending</span>
              </PulseBadge>
            )}

            {/* Play Button Overlay */}
            <motion.div
              className="play-overlay"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: isHovered ? 1 : 0,
                scale: isHovered ? 1 : 0.8,
              }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <AnimatedButton
                onClick={handlePlayClick}
                className={`play-button-enhanced ${
                  isPlaying ? "play-button-animate" : ""
                }`}
                title="Play Track"
              >
                <motion.svg
                  width="24"
                  height="24"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  animate={isPlaying ? { scale: [1, 1.1, 1] } : {}}
                  transition={{
                    duration: 0.3,
                    repeat: isPlaying ? Infinity : 0,
                  }}
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                    clipRule="evenodd"
                  />
                </motion.svg>
              </AnimatedButton>
            </motion.div>
          </div>

          {/* Track Info */}
          <div className="track-info-enhanced">
            <div className="track-header">
              <h3 className="track-title-enhanced">{track.title}</h3>
              <p className="track-artist-enhanced">{track.artist}</p>
            </div>

            {/* Extended Metadata */}
            {track.extendedMetadata && (
              <div className="track-metadata">
                {track.extendedMetadata.genre && (
                  <span className="genre-badge">
                    {track.extendedMetadata.genre}
                  </span>
                )}
                {track.extendedMetadata.bpm && (
                  <span className="bpm-badge">
                    {track.extendedMetadata.bpm} BPM
                  </span>
                )}
                {track.extendedMetadata.key && (
                  <span className="key-badge">
                    {track.extendedMetadata.key}
                  </span>
                )}
              </div>
            )}

            {/* Description */}
            {track.extendedMetadata?.description && (
              <p className="track-description">
                {track.extendedMetadata.description}
              </p>
            )}

            {/* Tags */}
            {track.extendedMetadata?.tags &&
              track.extendedMetadata.tags.length > 0 && (
                <div className="track-tags">
                  {track.extendedMetadata.tags.slice(0, 3).map((tag, index) => (
                    <span key={index} className="tag">
                      #{tag}
                    </span>
                  ))}
                  {track.extendedMetadata.tags.length > 3 && (
                    <span className="tag-more">
                      +{track.extendedMetadata.tags.length - 3}
                    </span>
                  )}
                </div>
              )}

            {/* Reactions */}
            <div className="track-reactions">
              <div className="reaction-stats">
                <span className="reaction-count">
                  {totalReactions} reactions
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div
              className="track-actions-enhanced"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="action-group">
                <ShareButton
                  url={`/track/${track.slug}`}
                  title={track.title}
                  artist={track.artist}
                  currentTime={isCurrentlyPlaying ? currentTime : undefined}
                />

                {/* <AddToPlaylistButton
                  track={{
                    slug: track.slug,
                    title: track.title,
                    artist: track.artist,
                    audioUrl: `/uploads/${track.filename}`,
                    genre: track.extendedMetadata?.genre,
                  }}
                /> */}
              </div>
            </div>
          </div>
        </AnimatedCard>
      </Link>
    </FadeIn>
  );
}
