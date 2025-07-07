import { motion, AnimatePresence, Variants } from "framer-motion";
import { ReactNode } from "react";

// Animation variants that align with design guidelines
export const fadeInUp: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94], // Custom easing for natural feel
      staggerChildren: 0.1,
    },
  },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

export const cardHover: Variants = {
  initial: {
    scale: 1,
    y: 0,
    boxShadow:
      "0 4px 12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1)",
  },
  hover: {
    scale: 1.02,
    y: -4,
    boxShadow:
      "0 20px 40px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.15)",
    transition: {
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

export const buttonTap: Variants = {
  initial: { scale: 1 },
  tap: {
    scale: 0.98,
    transition: {
      duration: 0.1,
      ease: "easeOut",
    },
  },
};

export const slideInFromRight: Variants = {
  hidden: {
    opacity: 0,
    x: 20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

export const scaleIn: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

// Reusable motion components
export const MotionDiv = motion.div;
export const MotionButton = motion.button;
export const MotionCard = motion.div;

// Staggered list component
interface StaggeredListProps {
  children: ReactNode;
  className?: string;
}

export const StaggeredList = ({ children, className }: StaggeredListProps) => (
  <motion.div
    variants={staggerContainer}
    initial="hidden"
    animate="visible"
    className={className}
  >
    {children}
  </motion.div>
);

// Animated card component
interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const AnimatedCard = ({
  children,
  className,
  delay = 0,
  onMouseEnter,
  onMouseLeave,
}: AnimatedCardProps) => (
  <motion.div
    variants={cardHover}
    initial="initial"
    whileHover="hover"
    whileTap="tap"
    className={className}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
    style={{
      transformOrigin: "center",
      willChange: "transform",
    }}
    transition={{
      delay,
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94],
    }}
  >
    {children}
  </motion.div>
);

// Fade in component
interface FadeInProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
}

export const FadeIn = ({
  children,
  className,
  delay = 0,
  duration = 0.6,
}: FadeInProps) => (
  <motion.div
    variants={fadeInUp}
    initial="hidden"
    animate="visible"
    className={className}
    transition={{
      delay,
      duration,
      ease: [0.25, 0.46, 0.45, 0.94],
    }}
  >
    {children}
  </motion.div>
);

// Animated button component
interface AnimatedButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  disabled?: boolean;
  title?: string;
}

export const AnimatedButton = ({
  children,
  className,
  onClick,
  disabled,
  title,
}: AnimatedButtonProps) => (
  <motion.button
    variants={buttonTap}
    initial="initial"
    whileTap="tap"
    whileHover={{
      scale: 1.02,
      transition: { duration: 0.2 },
    }}
    className={className}
    onClick={onClick}
    disabled={disabled}
    title={title}
    style={{
      transformOrigin: "center",
      willChange: "transform",
    }}
  >
    {children}
  </motion.button>
);

// Page transition component
interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

export const PageTransition = ({
  children,
  className,
}: PageTransitionProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
    }}
    className={className}
  >
    {children}
  </motion.div>
);

// Loading spinner component
export const LoadingSpinner = () => (
  <motion.div
    animate={{ rotate: 360 }}
    transition={{
      duration: 1,
      repeat: Infinity,
      ease: "linear",
    }}
    className="w-6 h-6 border-2 border-neutral-700 border-t-neutral-100 rounded-full"
  />
);

// Pulse animation for trending badges
export const PulseBadge = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <motion.div
    animate={{
      scale: [1, 1.05, 1],
      opacity: [1, 0.8, 1],
    }}
    transition={{
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    }}
    className={className}
  >
    {children}
  </motion.div>
);

// Slide in from bottom for modals/panels
export const SlideInFromBottom = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 50 }}
    transition={{
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94],
    }}
    className={className}
  >
    {children}
  </motion.div>
);

// Scale in for popups/notifications
export const ScaleIn = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <motion.div
    variants={scaleIn}
    initial="hidden"
    animate="visible"
    exit="hidden"
    className={className}
  >
    {children}
  </motion.div>
);

// Hook for scroll progress (if you want to use parallax)
import { useScroll, useTransform } from "framer-motion";

export const useScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  return scrollYProgress;
};

// Parallax scroll effect
export const ParallaxContainer = ({
  children,
  className,
  speed = 0.5,
}: {
  children: ReactNode;
  className?: string;
  speed?: number;
}) => {
  const { scrollYProgress } = useScroll();

  return (
    <motion.div
      style={{
        y: useTransform(scrollYProgress, [0, 1], [0, -100 * speed]),
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
