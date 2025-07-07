"use client";

import { motion } from "framer-motion";

interface AnimatedLoaderProps {
  size?: "sm" | "md" | "lg";
  variant?: "spinner" | "dots" | "bars" | "pulse";
  className?: string;
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
};

export const AnimatedLoader = ({
  size = "md",
  variant = "spinner",
  className = "",
}: AnimatedLoaderProps) => {
  const sizeClass = sizeClasses[size];

  if (variant === "spinner") {
    return (
      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear",
        }}
        className={`${sizeClass} border-2 border-neutral-700 border-t-neutral-100 rounded-full ${className}`}
      />
    );
  }

  if (variant === "dots") {
    return (
      <div className={`flex space-x-1 ${className}`}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className={`${sizeClass} bg-neutral-100 rounded-full`}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.4,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === "bars") {
    return (
      <div className={`flex space-x-1 ${className}`}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className={`${sizeClass} bg-neutral-100 rounded-sm`}
            animate={{
              scaleY: [1, 2, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.15,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === "pulse") {
    return (
      <motion.div
        className={`${sizeClass} bg-neutral-100 rounded-full ${className}`}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.7, 1, 0.7],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    );
  }

  return null;
};

// Music-themed loader
export const MusicLoader = ({ className = "" }: { className?: string }) => (
  <motion.div
    className={`flex items-center justify-center space-x-1 ${className}`}
  >
    {["🎵", "🎶", "🎵"].map((emoji, i) => (
      <motion.div
        key={i}
        animate={{
          y: [0, -10, 0],
          rotate: [0, 5, 0],
        }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          delay: i * 0.2,
          ease: "easeInOut",
        }}
        className="text-2xl"
      >
        {emoji}
      </motion.div>
    ))}
  </motion.div>
);

// Waveform loader
export const WaveformLoader = ({ className = "" }: { className?: string }) => (
  <div className={`flex items-end space-x-1 h-8 ${className}`}>
    {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
      <motion.div
        key={i}
        className="w-1 bg-neutral-100 rounded-full"
        animate={{
          height: ["20%", "100%", "20%"],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          delay: i * 0.1,
          ease: "easeInOut",
        }}
      />
    ))}
  </div>
);

// Upload progress loader
export const UploadLoader = ({
  progress,
  className = "",
}: {
  progress: number;
  className?: string;
}) => (
  <div className={`w-full ${className}`}>
    <div className="w-full bg-neutral-800 rounded-full h-2 overflow-hidden">
      <motion.div
        className="h-full bg-gradient-to-r from-neutral-100 to-neutral-300 rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      />
    </div>
    <motion.p
      className="text-xs text-neutral-500 mt-2 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      {progress}% complete
    </motion.p>
  </div>
);
