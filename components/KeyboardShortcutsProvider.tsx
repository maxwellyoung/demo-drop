"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import KeyboardShortcuts from "./KeyboardShortcuts";

interface KeyboardShortcutsContextType {
  showShortcuts: boolean;
  toggleShortcuts: () => void;
  registerShortcut: (key: string, action: () => void) => void;
  unregisterShortcut: (key: string) => void;
}

const KeyboardShortcutsContext = createContext<
  KeyboardShortcutsContextType | undefined
>(undefined);

export function useKeyboardShortcuts() {
  const context = useContext(KeyboardShortcutsContext);
  if (!context) {
    throw new Error(
      "useKeyboardShortcuts must be used within a KeyboardShortcutsProvider"
    );
  }
  return context;
}

interface KeyboardShortcutsProviderProps {
  children: ReactNode;
}

export default function KeyboardShortcutsProvider({
  children,
}: KeyboardShortcutsProviderProps) {
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [shortcuts, setShortcuts] = useState<Map<string, () => void>>(
    new Map()
  );

  const toggleShortcuts = useCallback(() => {
    setShowShortcuts(!showShortcuts);
  }, [showShortcuts]);

  const registerShortcut = useCallback((key: string, action: () => void) => {
    setShortcuts((prev) => new Map(prev).set(key, action));
  }, []);

  const unregisterShortcut = useCallback((key: string) => {
    setShortcuts((prev) => {
      const newMap = new Map(prev);
      newMap.delete(key);
      return newMap;
    });
  }, []);

  // Global shortcut handlers
  const handlePlayPause = useCallback(() => {
    // Trigger play/pause on the current audio player
    if (typeof window !== "undefined" && (window as any).togglePlayPause) {
      (window as any).togglePlayPause();
    }
  }, []);

  const handleNextTrack = useCallback(() => {
    if (typeof window !== "undefined" && (window as any).nextTrack) {
      (window as any).nextTrack();
    }
  }, []);

  const handlePreviousTrack = useCallback(() => {
    if (typeof window !== "undefined" && (window as any).previousTrack) {
      (window as any).previousTrack();
    }
  }, []);

  const handleVolumeUp = useCallback(() => {
    if (typeof window !== "undefined" && (window as any).volumeUp) {
      (window as any).volumeUp();
    }
  }, []);

  const handleVolumeDown = useCallback(() => {
    if (typeof window !== "undefined" && (window as any).volumeDown) {
      (window as any).volumeDown();
    }
  }, []);

  const handleToggleMute = useCallback(() => {
    if (typeof window !== "undefined" && (window as any).toggleMute) {
      (window as any).toggleMute();
    }
  }, []);

  const handleAddToPlaylist = useCallback(() => {
    // Trigger add to playlist action
    if (typeof window !== "undefined" && (window as any).addToPlaylist) {
      (window as any).addToPlaylist();
    }
  }, []);

  const handleShareTrack = useCallback(() => {
    // Trigger share action
    if (typeof window !== "undefined" && (window as any).shareTrack) {
      (window as any).shareTrack();
    }
  }, []);

  const handleCopyLink = useCallback(() => {
    // Copy current page URL
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
    }
  }, []);

  const handleAddReaction = useCallback(() => {
    // Trigger reaction action
    if (typeof window !== "undefined" && (window as any).addReaction) {
      (window as any).addReaction();
    }
  }, []);

  const handleEditMetadata = useCallback(() => {
    // Trigger metadata editing
    if (typeof window !== "undefined" && (window as any).editMetadata) {
      (window as any).editMetadata();
    }
  }, []);

  const handleQuickSearch = useCallback(() => {
    // Focus search input
    const searchInput = document.querySelector(
      'input[type="search"], input[placeholder*="search" i]'
    ) as HTMLInputElement;
    if (searchInput) {
      searchInput.focus();
      searchInput.select();
    }
  }, []);

  const handleCloseModals = useCallback(() => {
    // Close any open modals or overlays
    const modals = document.querySelectorAll('[data-modal="true"]');
    modals.forEach((modal) => {
      const closeEvent = new CustomEvent("closeModal");
      modal.dispatchEvent(closeEvent);
    });
  }, []);

  const handleToggleMiniPlayer = useCallback(() => {
    // Toggle mini player visibility
    if (typeof window !== "undefined" && (window as any).toggleMiniPlayer) {
      (window as any).toggleMiniPlayer();
    }
  }, []);

  const handleToggleFullscreen = useCallback(() => {
    // Toggle fullscreen mode
    if (typeof window !== "undefined") {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    }
  }, []);

  const handleTogglePlaylist = useCallback(() => {
    // Toggle playlist panel
    if (typeof window !== "undefined" && (window as any).togglePlaylist) {
      (window as any).togglePlaylist();
    }
  }, []);

  const handleToggleComments = useCallback(() => {
    // Toggle comments panel
    if (typeof window !== "undefined" && (window as any).toggleComments) {
      (window as any).toggleComments();
    }
  }, []);

  const handleToggleFilters = useCallback(() => {
    // Toggle filters panel
    if (typeof window !== "undefined" && (window as any).toggleFilters) {
      (window as any).toggleFilters();
    }
  }, []);

  const contextValue: KeyboardShortcutsContextType = {
    showShortcuts,
    toggleShortcuts,
    registerShortcut,
    unregisterShortcut,
  };

  return (
    <KeyboardShortcutsContext.Provider value={contextValue}>
      {children}
      <KeyboardShortcuts
        onPlayPause={handlePlayPause}
        onNextTrack={handleNextTrack}
        onPreviousTrack={handlePreviousTrack}
        onVolumeUp={handleVolumeUp}
        onVolumeDown={handleVolumeDown}
        onToggleMute={handleToggleMute}
        onAddToPlaylist={handleAddToPlaylist}
        onShareTrack={handleShareTrack}
        onCopyLink={handleCopyLink}
        onAddReaction={handleAddReaction}
        onEditMetadata={handleEditMetadata}
        onQuickSearch={handleQuickSearch}
        onCloseModals={handleCloseModals}
        onToggleMiniPlayer={handleToggleMiniPlayer}
        onToggleFullscreen={handleToggleFullscreen}
        onTogglePlaylist={handleTogglePlaylist}
        onToggleComments={handleToggleComments}
        onToggleFilters={handleToggleFilters}
        onToggleHelp={toggleShortcuts}
      />
    </KeyboardShortcutsContext.Provider>
  );
}
