"use client";

import { useState, useEffect, useRef } from "react";

interface ArtworkGeneratorProps {
  title: string;
  artist?: string;
  genre?: string;
  size?: "small" | "medium" | "large";
  onArtworkGenerated?: (artworkUrl: string) => void;
  className?: string;
}

interface ArtworkPattern {
  id: string;
  name: string;
  className: string;
  colors: string[];
  complexity: "simple" | "medium" | "complex";
}

const ARTWORK_PATTERNS: ArtworkPattern[] = [
  {
    id: "gradient-1",
    name: "Ocean Waves",
    className: "artwork-pattern-1",
    colors: ["#667eea", "#764ba2"],
    complexity: "medium",
  },
  {
    id: "gradient-2",
    name: "Sunset",
    className: "artwork-pattern-2",
    colors: ["#f093fb", "#f5576c"],
    complexity: "simple",
  },
  {
    id: "gradient-3",
    name: "Aurora",
    className: "artwork-pattern-3",
    colors: ["#4facfe", "#00f2fe"],
    complexity: "medium",
  },
  {
    id: "gradient-4",
    name: "Forest",
    className: "artwork-pattern-4",
    colors: ["#43e97b", "#38f9d7"],
    complexity: "simple",
  },
  {
    id: "gradient-5",
    name: "Neon",
    className: "artwork-pattern-5",
    colors: ["#fa709a", "#fee140"],
    complexity: "complex",
  },
];

const GENRE_PATTERNS: Record<string, ArtworkPattern> = {
  electronic: {
    id: "electronic",
    name: "Electronic",
    className: "artwork-genre-electronic",
    colors: ["#667eea", "#764ba2"],
    complexity: "medium",
  },
  rock: {
    id: "rock",
    name: "Rock",
    className: "artwork-genre-rock",
    colors: ["#f093fb", "#f5576c"],
    complexity: "medium",
  },
  jazz: {
    id: "jazz",
    name: "Jazz",
    className: "artwork-genre-jazz",
    colors: ["#4facfe", "#00f2fe"],
    complexity: "complex",
  },
  classical: {
    id: "classical",
    name: "Classical",
    className: "artwork-genre-classical",
    colors: ["#43e97b", "#38f9d7"],
    complexity: "simple",
  },
  hiphop: {
    id: "hiphop",
    name: "Hip Hop",
    className: "artwork-genre-hiphop",
    colors: ["#fa709a", "#fee140"],
    complexity: "medium",
  },
  pop: {
    id: "pop",
    name: "Pop",
    className: "artwork-genre-pop",
    colors: ["#a8edea", "#fed6e3"],
    complexity: "simple",
  },
};

export default function ArtworkGenerator({
  title,
  artist,
  genre,
  size = "medium",
  onArtworkGenerated,
  className = "",
}: ArtworkGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentArtwork, setCurrentArtwork] = useState<string | null>(null);
  const [selectedPattern, setSelectedPattern] = useState<ArtworkPattern | null>(
    null
  );
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Size configurations
  const sizeConfig = {
    small: { width: 200, height: 200 },
    medium: { width: 400, height: 400 },
    large: { width: 800, height: 800 },
  };

  const { width, height } = sizeConfig[size];

  // Generate artwork based on title, artist, and genre
  const generateArtwork = async () => {
    setIsGenerating(true);

    try {
      // Select pattern based on genre or random
      let pattern: ArtworkPattern;
      if (genre && GENRE_PATTERNS[genre.toLowerCase()]) {
        pattern = GENRE_PATTERNS[genre.toLowerCase()];
      } else {
        // Use title hash to consistently select pattern
        const titleHash = title
          .split("")
          .reduce((acc, char) => acc + char.charCodeAt(0), 0);
        pattern = ARTWORK_PATTERNS[titleHash % ARTWORK_PATTERNS.length];
      }

      setSelectedPattern(pattern);

      // Simulate generation time
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 + Math.random() * 2000)
      );

      // Generate canvas artwork
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Set canvas size
      canvas.width = width;
      canvas.height = height;

      // Create gradient background
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      pattern.colors.forEach((color, index) => {
        gradient.addColorStop(index / (pattern.colors.length - 1), color);
      });

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Add geometric patterns based on complexity
      if (pattern.complexity === "complex") {
        addComplexPatterns(ctx, width, height, pattern);
      } else if (pattern.complexity === "medium") {
        addMediumPatterns(ctx, width, height, pattern);
      } else {
        addSimplePatterns(ctx, width, height, pattern);
      }

      // Add text overlay
      addTextOverlay(ctx, width, height, title, artist);

      // Convert to data URL
      const artworkUrl = canvas.toDataURL("image/png");
      setCurrentArtwork(artworkUrl);

      // Call callback
      onArtworkGenerated?.(artworkUrl);
    } catch (error) {
      console.error("Error generating artwork:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Add simple geometric patterns
  const addSimplePatterns = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    pattern: ArtworkPattern
  ) => {
    ctx.globalAlpha = 0.3;

    // Add circles
    for (let i = 0; i < 3; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const radius = Math.random() * 100 + 50;

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle =
        pattern.colors[Math.floor(Math.random() * pattern.colors.length)];
      ctx.fill();
    }

    ctx.globalAlpha = 1;
  };

  // Add medium complexity patterns
  const addMediumPatterns = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    pattern: ArtworkPattern
  ) => {
    ctx.globalAlpha = 0.2;

    // Add overlapping shapes
    for (let i = 0; i < 5; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * 150 + 50;

      if (Math.random() > 0.5) {
        // Circle
        ctx.beginPath();
        ctx.arc(x, y, size / 2, 0, Math.PI * 2);
        ctx.fillStyle =
          pattern.colors[Math.floor(Math.random() * pattern.colors.length)];
        ctx.fill();
      } else {
        // Rectangle
        ctx.fillStyle =
          pattern.colors[Math.floor(Math.random() * pattern.colors.length)];
        ctx.fillRect(x - size / 2, y - size / 2, size, size);
      }
    }

    // Add lines
    ctx.strokeStyle = pattern.colors[0];
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * width, Math.random() * height);
      ctx.lineTo(Math.random() * width, Math.random() * height);
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
  };

  // Add complex patterns
  const addComplexPatterns = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    pattern: ArtworkPattern
  ) => {
    ctx.globalAlpha = 0.15;

    // Add multiple layers of shapes
    for (let layer = 0; layer < 3; layer++) {
      for (let i = 0; i < 8; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() * 200 + 30;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(Math.random() * Math.PI * 2);

        if (Math.random() > 0.7) {
          // Triangle
          ctx.beginPath();
          ctx.moveTo(0, -size / 2);
          ctx.lineTo(-size / 2, size / 2);
          ctx.lineTo(size / 2, size / 2);
          ctx.closePath();
          ctx.fillStyle =
            pattern.colors[Math.floor(Math.random() * pattern.colors.length)];
          ctx.fill();
        } else if (Math.random() > 0.5) {
          // Circle
          ctx.beginPath();
          ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
          ctx.fillStyle =
            pattern.colors[Math.floor(Math.random() * pattern.colors.length)];
          ctx.fill();
        } else {
          // Rectangle
          ctx.fillStyle =
            pattern.colors[Math.floor(Math.random() * pattern.colors.length)];
          ctx.fillRect(-size / 2, -size / 2, size, size);
        }

        ctx.restore();
      }
    }

    // Add wave patterns
    ctx.strokeStyle = pattern.colors[0];
    ctx.lineWidth = 1;
    for (let i = 0; i < 2; i++) {
      ctx.beginPath();
      for (let x = 0; x < width; x += 10) {
        const y = height / 2 + Math.sin(x * 0.02 + i * Math.PI) * 50;
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
  };

  // Add text overlay
  const addTextOverlay = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    title: string,
    artist?: string
  ) => {
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
    ctx.lineWidth = 2;

    // Title
    const titleFontSize = Math.min(width / 15, 48);
    ctx.font = `bold ${titleFontSize}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
    ctx.textAlign = "center";

    const titleY = height - (artist ? 80 : 40);
    ctx.strokeText(title, width / 2, titleY);
    ctx.fillText(title, width / 2, titleY);

    // Artist
    if (artist) {
      const artistFontSize = Math.min(width / 20, 32);
      ctx.font = `${artistFontSize}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;

      const artistY = height - 20;
      ctx.strokeText(artist, width / 2, artistY);
      ctx.fillText(artist, width / 2, artistY);
    }
  };

  // Download artwork
  const downloadArtwork = () => {
    if (!currentArtwork) return;

    const link = document.createElement("a");
    link.download = `${title}-artwork.png`;
    link.href = currentArtwork;
    link.click();
  };

  // Regenerate artwork
  const regenerateArtwork = () => {
    setCurrentArtwork(null);
    generateArtwork();
  };

  // Generate on mount
  useEffect(() => {
    generateArtwork();
  }, [title, artist, genre]);

  return (
    <div className={`artwork-container ${className}`} style={{ width, height }}>
      {/* Hidden canvas for generation */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Generated artwork */}
      {currentArtwork && !isGenerating && (
        <>
          <img
            src={currentArtwork}
            alt={`Artwork for ${title}`}
            className="artwork-generated"
          />
          <div className="artwork-overlay" />
          <div className="artwork-badge">
            {selectedPattern?.name || "Generated"}
          </div>
          <div className="artwork-actions">
            <button
              onClick={downloadArtwork}
              className="artwork-download"
              title="Download Artwork"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7,10 12,15 17,10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </button>
            <button
              onClick={regenerateArtwork}
              className="artwork-regenerate"
              title="Regenerate Artwork"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                <path d="M3 21v-5h5" />
              </svg>
            </button>
          </div>
        </>
      )}

      {/* Loading state */}
      {isGenerating && (
        <div className="artwork-loading">
          <div className="artwork-spinner" />
        </div>
      )}

      {/* Placeholder */}
      {!currentArtwork && !isGenerating && (
        <div className="artwork-placeholder">
          <div className="artwork-icon">🎵</div>
        </div>
      )}
    </div>
  );
}
