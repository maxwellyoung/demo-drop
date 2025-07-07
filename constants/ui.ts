// Artwork Generation Colors
export const ARTWORK_COLORS = [
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
] as const;

// Artwork Size Configurations
export const ARTWORK_SIZES = {
  small: { width: 200, height: 200 },
  medium: { width: 400, height: 400 },
  large: { width: 800, height: 800 },
} as const;

// Animation Durations
export const ANIMATION_DURATIONS = {
  fast: 150,
  normal: 300,
  slow: 500,
  verySlow: 1000,
} as const;

// Loading States
export const LOADING_STATES = {
  IDLE: "idle",
  LOADING: "loading",
  SUCCESS: "success",
  ERROR: "error",
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  MIN_PAGE_SIZE: 5,
} as const;

// Search and Filter
export const SEARCH_CONFIG = {
  DEBOUNCE_MS: 300,
  MIN_SEARCH_LENGTH: 2,
  MAX_SEARCH_LENGTH: 100,
} as const;

// File Upload
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE_MB: 100,
  MAX_FILES_PER_UPLOAD: 10,
  SUPPORTED_FORMATS: [".wav", ".mp3", ".m4a", ".flac"],
} as const;

// Brand Identity - Iridescent "Oil-Slick" Color Scheme
export const BRAND_COLORS = {
  primary: {
    50: "#f0f9ff",
    100: "#e0f2fe",
    200: "#bae6fd",
    300: "#7dd3fc",
    400: "#38bdf8",
    500: "#0ea5e9",
    600: "#0284c7",
    700: "#0369a1",
    800: "#075985",
    900: "#0c4a6e",
  },
  iridescent: {
    purple: "#8b5cf6",
    blue: "#3b82f6",
    cyan: "#06b6d4",
    teal: "#14b8a6",
    emerald: "#10b981",
    green: "#22c55e",
    yellow: "#eab308",
    orange: "#f97316",
    red: "#ef4444",
    pink: "#ec4899",
  },
  gradient: {
    primary: "linear-gradient(135deg, #8b5cf6 0%, #3b82f6 50%, #06b6d4 100%)",
    secondary: "linear-gradient(135deg, #f97316 0%, #eab308 50%, #22c55e 100%)",
    iridescent:
      "linear-gradient(135deg, #8b5cf6 0%, #3b82f6 25%, #06b6d4 50%, #14b8a6 75%, #10b981 100%)",
  },
  noise: {
    subtle:
      "radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.03) 0%, transparent 50%)",
    medium:
      "radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.05) 0%, transparent 50%)",
    strong:
      "radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.08) 0%, transparent 50%)",
  },
};

// Animation Presets
export const ANIMATIONS = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.3, ease: "easeOut" },
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: "easeOut" },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.3, ease: "easeOut" },
  },
  hover: {
    scale: 1.02,
    transition: { duration: 0.2, ease: "easeOut" },
  },
  tap: {
    scale: 0.98,
    transition: { duration: 0.1, ease: "easeOut" },
  },
  shimmer: {
    background:
      "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
    backgroundSize: "200% 100%",
    animation: "shimmer 2s infinite",
  },
};

// Micro-interaction Variants
export const MICRO_ANIMATIONS = {
  button: {
    hover: { scale: 1.02, boxShadow: "0 4px 12px rgba(139, 92, 246, 0.15)" },
    tap: { scale: 0.98 },
    transition: { duration: 0.2, ease: "easeOut" },
  },
  card: {
    hover: { y: -2, boxShadow: "0 8px 25px rgba(0, 0, 0, 0.1)" },
    transition: { duration: 0.3, ease: "easeOut" },
  },
  icon: {
    hover: { rotate: 5, scale: 1.1 },
    transition: { duration: 0.2, ease: "easeOut" },
  },
  wave: {
    hover: { scale: 1.05 },
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

// Generative Color Palette Function
export function generateColorPalette(seed: string): string[] {
  const colors = Object.values(BRAND_COLORS.iridescent);
  const hash = seed.split("").reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0);
    return a & a;
  }, 0);

  const startIndex = Math.abs(hash) % colors.length;
  const palette = [];

  for (let i = 0; i < 4; i++) {
    const index = (startIndex + i) % colors.length;
    palette.push(colors[index]);
  }

  return palette;
}

// CSS Keyframes for animations
export const KEYFRAMES = `
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  
  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 5px rgba(139, 92, 246, 0.3); }
    50% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.6); }
  }
  
  @keyframes iridescent-shift {
    0% { filter: hue-rotate(0deg); }
    100% { filter: hue-rotate(360deg); }
  }
`;
