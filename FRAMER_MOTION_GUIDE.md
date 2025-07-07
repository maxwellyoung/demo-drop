# 🎬 Framer Motion Animation Guide

## Overview

This guide covers all the beautiful Framer Motion animations integrated into Demo Drop. These animations align with our design system and provide smooth, delightful user experiences.

## 🎯 Animation Philosophy

Our animations follow these principles:

- **Purposeful**: Every animation serves a function
- **Smooth**: Natural easing curves and appropriate durations
- **Delightful**: Micro-interactions that bring joy
- **Accessible**: Respect user motion preferences
- **Performance**: Optimized for 60fps animations

---

## 📦 Available Components

### 1. **MotionComponents** (`components/animations/MotionComponents.tsx`)

#### Basic Animation Variants

```tsx
import {
  fadeInUp,
  staggerContainer,
  cardHover,
  buttonTap,
  slideInFromRight,
  scaleIn,
} from "../components/animations/MotionComponents";
```

#### Reusable Components

```tsx
import {
  AnimatedCard,
  FadeIn,
  AnimatedButton,
  PulseBadge,
  StaggeredList,
  PageTransition,
  LoadingSpinner,
} from "../components/animations/MotionComponents";
```

### 2. **PageTransition** (`components/PageTransition.tsx`)

```tsx
import { PageTransition, StaggeredContent } from "../components/PageTransition";
```

### 3. **AnimatedLoader** (`components/AnimatedLoader.tsx`)

```tsx
import {
  AnimatedLoader,
  MusicLoader,
  WaveformLoader,
  UploadLoader,
} from "../components/AnimatedLoader";
```

---

## 🎨 Usage Examples

### Page Transitions

Wrap your page content with `PageTransition` for smooth page animations:

```tsx
export default function MyPage() {
  return (
    <PageTransition>
      <div className="container-wide">
        <StaggeredContent>
          <h1>My Page Title</h1>
          <p>Page content here...</p>
        </StaggeredContent>
      </div>
    </PageTransition>
  );
}
```

### Staggered Content Animations

Use `StaggeredList` for lists that animate in sequence:

```tsx
<StaggeredList className="grid grid-cols-1 md:grid-cols-3 gap-6">
  {items.map((item, index) => (
    <motion.div
      key={item.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    >
      <ItemCard item={item} />
    </motion.div>
  ))}
</StaggeredList>
```

### Interactive Cards

Use `AnimatedCard` for cards with hover effects:

```tsx
<AnimatedCard
  className="track-card-enhanced"
  onMouseEnter={() => setIsHovered(true)}
  onMouseLeave={() => setIsHovered(false)}
>
  <div className="card-content">{/* Your card content */}</div>
</AnimatedCard>
```

### Animated Buttons

Use `AnimatedButton` for buttons with tap feedback:

```tsx
<AnimatedButton onClick={handleClick} className="btn-primary" title="Click me">
  Click Me
</AnimatedButton>
```

### Loading States

Use various loader components for different contexts:

```tsx
// Spinner loader
<AnimatedLoader variant="spinner" size="md" />

// Music-themed loader
<MusicLoader />

// Waveform loader for audio contexts
<WaveformLoader />

// Upload progress
<UploadLoader progress={uploadProgress} />
```

### Pulse Animations

Use `PulseBadge` for attention-grabbing elements:

```tsx
<PulseBadge className="trending-badge">
  <span>Trending</span>
</PulseBadge>
```

---

## 🎭 Advanced Animation Patterns

### Hero Section Animations

```tsx
<motion.h1
  className="heading-xl"
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8, delay: 0.2 }}
>
  Demo Drop
</motion.h1>

<motion.p
  className="text-secondary"
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, delay: 0.4 }}
>
  Drop your demo.
</motion.p>
```

### Staggered Stats Animation

```tsx
<motion.div
  className="grid grid-cols-4 gap-4"
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, delay: 0.6 }}
>
  {stats.map((stat, index) => (
    <motion.div
      key={stat.label}
      className="stat-card"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
      whileHover={{ scale: 1.02 }}
    >
      <motion.div
        className="stat-number"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 + index * 0.1 }}
      >
        {stat.number}
      </motion.div>
      <div className="stat-label">{stat.label}</div>
    </motion.div>
  ))}
</motion.div>
```

### Conditional Animations with AnimatePresence

```tsx
<AnimatePresence mode="wait">
  {isUploading ? (
    <motion.div
      key="uploading"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
    >
      <UploadLoader progress={uploadProgress} />
    </motion.div>
  ) : (
    <motion.div
      key="dropzone"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6 }}
    >
      <DropZone />
    </motion.div>
  )}
</AnimatePresence>
```

### Interactive Hover Effects

```tsx
<motion.div
  className="drop-zone"
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  transition={{ duration: 0.2 }}
>
  <motion.div
    className="text-7xl"
    whileHover={{ scale: 1.1, rotate: 5 }}
    transition={{ duration: 0.3 }}
  >
    🎵
  </motion.div>
</motion.div>
```

---

## 🎨 Custom Animation Variants

### Creating Custom Variants

```tsx
const customVariants = {
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
      ease: [0.25, 0.46, 0.45, 0.94],
      staggerChildren: 0.1,
    },
  },
};

// Usage
<motion.div variants={customVariants} initial="hidden" animate="visible">
  {/* Content */}
</motion.div>;
```

### Custom Easing Curves

```tsx
// Natural easing curve used throughout the app
const naturalEase = [0.25, 0.46, 0.45, 0.94];

<motion.div
  animate={{ scale: 1.1 }}
  transition={{
    duration: 0.3,
    ease: naturalEase,
  }}
>
  {/* Content */}
</motion.div>;
```

---

## ⚡ Performance Best Practices

### 1. Use `transform` and `opacity` for animations

```tsx
// ✅ Good - GPU accelerated
<motion.div animate={{ scale: 1.1, opacity: 0.8 }} />

// ❌ Avoid - causes layout thrashing
<motion.div animate={{ width: "200px", height: "200px" }} />
```

### 2. Use `will-change` sparingly

```tsx
<motion.div style={{ willChange: "transform" }} animate={{ scale: 1.1 }}>
  {/* Content */}
</motion.div>
```

### 3. Optimize for reduced motion

```tsx
// Respect user preferences
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 4. Use `AnimatePresence` for conditional rendering

```tsx
<AnimatePresence mode="wait">
  {condition && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Content */}
    </motion.div>
  )}
</AnimatePresence>
```

---

## 🎯 Animation Timing Guidelines

### Duration Scale

- **Quick feedback**: 150ms - 200ms
- **Standard interactions**: 200ms - 300ms
- **Page transitions**: 400ms - 600ms
- **Complex animations**: 600ms - 800ms

### Delay Patterns

- **Immediate**: 0ms
- **Subtle stagger**: 100ms - 200ms
- **Section breaks**: 400ms - 600ms
- **Page load**: 200ms - 400ms

### Easing Curves

- **Natural**: `[0.25, 0.46, 0.45, 0.94]`
- **Bounce**: `[0.68, -0.55, 0.265, 1.55]`
- **Smooth**: `[0.4, 0, 0.2, 1]`
- **Sharp**: `[0.4, 0, 0.6, 1]`

---

## 🔧 Troubleshooting

### Common Issues

1. **Animations not working**

   - Check if Framer Motion is installed
   - Verify import statements
   - Ensure components are client-side

2. **Performance issues**

   - Use `transform` instead of layout properties
   - Reduce animation complexity
   - Check for layout thrashing

3. **Stagger not working**
   - Ensure parent has `variants` prop
   - Check `staggerChildren` timing
   - Verify child components have `variants`

### Debug Tips

```tsx
// Add debug logging
<motion.div
  onAnimationStart={() => console.log("Animation started")}
  onAnimationComplete={() => console.log("Animation completed")}
>
  {/* Content */}
</motion.div>
```

---

## 📚 Additional Resources

- [Framer Motion Documentation](https://www.framer.com/motion/)
- [Animation Principles](https://motion-gallery.net/)
- [Easing Functions](https://easings.net/)
- [Performance Guide](https://www.framer.com/motion/performance/)

---

## 🎨 Design System Integration

All animations are designed to work seamlessly with our design system:

- **Colors**: Use semantic color classes
- **Spacing**: Follow established spacing scale
- **Typography**: Respect font weights and sizes
- **Shadows**: Use consistent shadow patterns
- **Borders**: Maintain border radius consistency

---

_This guide ensures consistent, performant, and delightful animations across the Demo Drop platform._
