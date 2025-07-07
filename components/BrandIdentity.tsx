import React from "react";
import { motion, easeInOut } from "framer-motion";

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
};

// Micro-interaction Variants
export const MICRO_ANIMATIONS = {
  button: {
    hover: { scale: 1.02, boxShadow: "0 4px 12px rgba(139, 92, 246, 0.15)" },
    tap: { scale: 0.98 },
    transition: { duration: 0.2, ease: easeInOut },
  },
  card: {
    hover: { y: -2, boxShadow: "0 8px 25px rgba(0, 0, 0, 0.1)" },
    transition: { duration: 0.3, ease: easeInOut },
  },
  icon: {
    hover: { rotate: 5, scale: 1.1 },
    transition: { duration: 0.2, ease: easeInOut },
  },
  wave: {
    hover: { scale: 1.05 },
    transition: { duration: 0.3, ease: easeInOut },
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

// Iridescent Button Component
interface IridescentButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  disabled?: boolean;
}

export function IridescentButton({
  children,
  onClick,
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
}: IridescentButtonProps) {
  const baseClasses =
    "relative overflow-hidden rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variants = {
    primary:
      "bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 text-white shadow-lg hover:shadow-xl",
    secondary:
      "bg-gradient-to-r from-orange-500 via-yellow-500 to-green-500 text-white shadow-lg hover:shadow-xl",
    ghost:
      "bg-transparent text-gray-700 hover:bg-gray-100 border border-gray-200",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      whileHover={disabled ? {} : MICRO_ANIMATIONS.button.hover}
      whileTap={disabled ? {} : MICRO_ANIMATIONS.button.tap}
      transition={MICRO_ANIMATIONS.button.transition}
    >
      <div className="relative z-10">{children}</div>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
    </motion.button>
  );
}

// Iridescent Card Component
interface IridescentCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function IridescentCard({
  children,
  className = "",
  hover = true,
}: IridescentCardProps) {
  return (
    <motion.div
      className={`bg-white rounded-xl border border-gray-200 shadow-sm ${className}`}
      whileHover={hover ? MICRO_ANIMATIONS.card.hover : {}}
      transition={MICRO_ANIMATIONS.card.transition}
    >
      <div className="relative overflow-hidden rounded-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 via-blue-50/30 to-cyan-50/50" />
        <div className="relative z-10 p-6">{children}</div>
      </div>
    </motion.div>
  );
}

// Iridescent Icon Component
interface IridescentIconProps {
  children: React.ReactNode;
  className?: string;
  color?: string;
}

export function IridescentIcon({
  children,
  className = "",
  color,
}: IridescentIconProps) {
  return (
    <motion.div
      className={`inline-flex items-center justify-center ${className}`}
      style={{ color }}
      whileHover={MICRO_ANIMATIONS.icon.hover}
      transition={MICRO_ANIMATIONS.icon.transition}
    >
      {children}
    </motion.div>
  );
}

// Noise Background Component
export function NoiseBackground({ className = "" }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50/20 via-blue-50/10 to-cyan-50/20" />
      <div className="absolute inset-0 opacity-[0.015] bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.1)_0%,transparent_50%)]" />
    </div>
  );
}
