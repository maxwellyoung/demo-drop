# Demo Drop UX Improvements TODO

## 🚨 Critical Priority (Implement First)

### 1. Search & Filter System

- [ ] Add search bar to track list with real-time filtering
- [ ] Implement basic filters: date range, file format, upload status
- [ ] Add sorting options: name, date, file size, duration
- [ ] Add "filter by playlist" functionality
- [ ] Show active filter count and clear all filters button

### 2. Upload Experience Overhaul

- [ ] Add progress bars inside file rows during upload
- [ ] Implement drag-anywhere drop target (global drop zone)
- [ ] Add post-upload "Next: add to playlist?" prompt
- [ ] Show upload queue with individual file progress
- [ ] Add retry mechanism for failed uploads

### 3. Navigation & IA Fixes

- [ ] Move "Upload" to floating CTA button (like Notion's "+ New")
- [ ] Add quick-start wizard for empty states
- [ ] Fix empty-state loop between Playlists and All Tracks
- [ ] Add "Quick Start — drag a track anywhere" global drop target

## 🔥 High Priority

### 4. Track List Improvements

- [ ] Replace color squares with status indicators (uploaded, processing, failed)
- [ ] Increase row density or adopt two-line layout (title/artist)
- [ ] Add bulk selection and actions
- [ ] Implement virtualized scrolling for performance
- [ ] Add file format and bitrate display in list view

### 5. Mobile & Performance

- [ ] Implement virtualized scrolling (React Window/ViewportList)
- [ ] Cache waveforms → CDN
- [ ] Mobile-responsive table → card grid
- [ ] Touch-friendly row actions
- [ ] Optimize for low-end mobile performance

### 6. Collaboration Layer

- [ ] Sticky comment identity (no more "Name" field each time)
- [ ] Role-based sharing permissions (comment-only, download, private)
- [ ] Inline timestamp comments (SoundCloud-style)
- [ ] Comment reactions integration

## 🎨 Medium Priority

### 7. Track Detail Page

- [ ] Move keyboard shortcuts to "⌘ ?" cheat-sheet overlay
- [ ] Add tabs for waveform/spectrum toggle
- [ ] Improve player controls layout
- [ ] Add download options and sharing controls

### 8. Playlists

- [ ] Remove duplicate CTAs (keep only one "Create Playlist")
- [ ] Add auto-playlist suggestions ("Tracks uploaded this week", "Needs feedback")
- [ ] Bulk add tracks to playlists
- [ ] Playlist sharing and collaboration

### 9. Micro-polish

- [ ] Fix keyboard focus rings for dark theme (WCAG compliance)
- [ ] Add whimsical emoji to empty states with next action links
- [ ] Improve file size and format display
- [ ] Add loading states and better error handling

## 🔮 Future Enhancements

### 10. Advanced Features

- [ ] Bulk accept/reject for submission management
- [ ] Export CSV functionality
- [ ] Webhook integrations
- [ ] Advanced analytics and insights
- [ ] Custom themes and branding

---

## Implementation Notes

### Technical Debt to Address

- [ ] Implement proper error boundaries
- [ ] Add comprehensive loading states
- [ ] Optimize bundle size
- [ ] Add proper TypeScript types
- [ ] Implement proper state management

### Accessibility Improvements

- [ ] WCAG 2.1 AA compliance
- [ ] Screen reader support
- [ ] Keyboard navigation
- [ ] High contrast mode
- [ ] Focus management

### Performance Budget

- [ ] First Contentful Paint < 1.5s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Cumulative Layout Shift < 0.1
- [ ] First Input Delay < 100ms

---

## Current Status

- **Started**: [Date]
- **Last Updated**: [Date]
- **Priority Focus**: Search & Filter System
