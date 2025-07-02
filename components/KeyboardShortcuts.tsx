"use client";

import { useEffect, useState, useCallback } from "react";

interface Shortcut {
  key: string;
  description: string;
  action: () => void;
  category: "playback" | "navigation" | "actions" | "search" | "system";
  modifier?: "ctrl" | "cmd" | "shift" | "alt";
}

interface KeyboardShortcutsProps {
  onPlayPause?: () => void;
  onNextTrack?: () => void;
  onPreviousTrack?: () => void;
  onVolumeUp?: () => void;
  onVolumeDown?: () => void;
  onToggleMute?: () => void;
  onAddToPlaylist?: () => void;
  onShareTrack?: () => void;
  onCopyLink?: () => void;
  onAddReaction?: () => void;
  onEditMetadata?: () => void;
  onQuickSearch?: () => void;
  onCloseModals?: () => void;
  onToggleMiniPlayer?: () => void;
  onToggleFullscreen?: () => void;
  onTogglePlaylist?: () => void;
  onToggleComments?: () => void;
  onToggleFilters?: () => void;
  onToggleHelp?: () => void;
}

export default function KeyboardShortcuts({
  onPlayPause,
  onNextTrack,
  onPreviousTrack,
  onVolumeUp,
  onVolumeDown,
  onToggleMute,
  onAddToPlaylist,
  onShareTrack,
  onCopyLink,
  onAddReaction,
  onEditMetadata,
  onQuickSearch,
  onCloseModals,
  onToggleMiniPlayer,
  onToggleFullscreen,
  onTogglePlaylist,
  onToggleComments,
  onToggleFilters,
  onToggleHelp,
}: KeyboardShortcutsProps) {
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [isMac] = useState(
    typeof window !== "undefined" &&
      navigator.platform.toUpperCase().indexOf("MAC") >= 0
  );

  // Visual feedback for keyboard shortcuts
  const showActionFeedback = useCallback((action: string) => {
    setLastAction(action);
    setTimeout(() => setLastAction(null), 1500);
  }, []);

  // Handle keyboard events
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return;
      }

      const { key, ctrlKey, metaKey, shiftKey, altKey } = event;
      const modifier =
        ctrlKey || metaKey ? (isMac ? "cmd" : "ctrl") : undefined;

      // Prevent default for our shortcuts
      const preventDefault = () => {
        event.preventDefault();
        event.stopPropagation();
      };

      // Playback shortcuts
      if (key === " " && !modifier) {
        preventDefault();
        onPlayPause?.();
        showActionFeedback("Play/Pause");
      } else if (key === "ArrowRight" && !modifier) {
        preventDefault();
        onNextTrack?.();
        showActionFeedback("Next Track");
      } else if (key === "ArrowLeft" && !modifier) {
        preventDefault();
        onPreviousTrack?.();
        showActionFeedback("Previous Track");
      } else if (key === "ArrowUp" && !modifier) {
        preventDefault();
        onVolumeUp?.();
        showActionFeedback("Volume Up");
      } else if (key === "ArrowDown" && !modifier) {
        preventDefault();
        onVolumeDown?.();
        showActionFeedback("Volume Down");
      } else if (key === "m" && !modifier) {
        preventDefault();
        onToggleMute?.();
        showActionFeedback("Toggle Mute");
      }

      // Action shortcuts
      else if (key === "a" && !modifier) {
        preventDefault();
        onAddToPlaylist?.();
        showActionFeedback("Add to Playlist");
      } else if (key === "s" && !modifier) {
        preventDefault();
        onShareTrack?.();
        showActionFeedback("Share Track");
      } else if (key === "c" && !modifier) {
        preventDefault();
        onCopyLink?.();
        showActionFeedback("Copy Link");
      } else if (key === "r" && !modifier) {
        preventDefault();
        onAddReaction?.();
        showActionFeedback("Add Reaction");
      } else if (key === "e" && !modifier) {
        preventDefault();
        onEditMetadata?.();
        showActionFeedback("Edit Metadata");
      }

      // Navigation shortcuts
      else if (key === "/" && !modifier) {
        preventDefault();
        onQuickSearch?.();
        showActionFeedback("Quick Search");
      } else if (key === "Escape" && !modifier) {
        preventDefault();
        onCloseModals?.();
        showActionFeedback("Close");
      } else if (key === "p" && modifier) {
        preventDefault();
        onTogglePlaylist?.();
        showActionFeedback("Toggle Playlist");
      } else if (key === "k" && modifier) {
        preventDefault();
        onToggleComments?.();
        showActionFeedback("Toggle Comments");
      } else if (key === "f" && modifier) {
        preventDefault();
        onToggleFilters?.();
        showActionFeedback("Toggle Filters");
      }

      // System shortcuts
      else if (key === "h" && modifier) {
        preventDefault();
        onToggleHelp?.();
        showActionFeedback("Toggle Help");
      } else if (key === "i" && modifier) {
        preventDefault();
        onToggleMiniPlayer?.();
        showActionFeedback("Toggle Mini Player");
      } else if (key === "Enter" && modifier) {
        preventDefault();
        onToggleFullscreen?.();
        showActionFeedback("Toggle Fullscreen");
      }

      // Power user shortcuts
      else if (key === "1" && !modifier) {
        preventDefault();
        // Jump to tracks page
        window.location.href = "/tracks";
        showActionFeedback("Go to Tracks");
      } else if (key === "2" && !modifier) {
        preventDefault();
        // Jump to playlists page
        window.location.href = "/playlists";
        showActionFeedback("Go to Playlists");
      } else if (key === "3" && !modifier) {
        preventDefault();
        // Jump to upload page
        window.location.href = "/";
        showActionFeedback("Go to Upload");
      } else if (key === "0" && !modifier) {
        preventDefault();
        // Jump to home
        window.location.href = "/";
        showActionFeedback("Go to Home");
      }
    },
    [
      isMac,
      onPlayPause,
      onNextTrack,
      onPreviousTrack,
      onVolumeUp,
      onVolumeDown,
      onToggleMute,
      onAddToPlaylist,
      onShareTrack,
      onCopyLink,
      onAddReaction,
      onEditMetadata,
      onQuickSearch,
      onCloseModals,
      onToggleMiniPlayer,
      onToggleFullscreen,
      onTogglePlaylist,
      onToggleComments,
      onToggleFilters,
      onToggleHelp,
      showActionFeedback,
    ]
  );

  // Register keyboard event listeners
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Toggle help overlay
  const toggleHelp = useCallback(() => {
    setShowShortcuts(!showShortcuts);
  }, [showShortcuts]);

  // Register help toggle shortcut
  useEffect(() => {
    const handleHelpShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "h") {
        event.preventDefault();
        toggleHelp();
      }
    };

    document.addEventListener("keydown", handleHelpShortcut);
    return () => document.removeEventListener("keydown", handleHelpShortcut);
  }, [toggleHelp]);

  const shortcuts: Shortcut[] = [
    // Playback
    {
      key: "Space",
      description: "Play/Pause",
      action: () => {},
      category: "playback",
    },
    {
      key: "→",
      description: "Next Track",
      action: () => {},
      category: "playback",
    },
    {
      key: "←",
      description: "Previous Track",
      action: () => {},
      category: "playback",
    },
    {
      key: "↑",
      description: "Volume Up",
      action: () => {},
      category: "playback",
    },
    {
      key: "↓",
      description: "Volume Down",
      action: () => {},
      category: "playback",
    },
    {
      key: "M",
      description: "Toggle Mute",
      action: () => {},
      category: "playback",
    },

    // Actions
    {
      key: "A",
      description: "Add to Playlist",
      action: () => {},
      category: "actions",
    },
    {
      key: "S",
      description: "Share Track",
      action: () => {},
      category: "actions",
    },
    {
      key: "C",
      description: "Copy Link",
      action: () => {},
      category: "actions",
    },
    {
      key: "R",
      description: "Add Reaction",
      action: () => {},
      category: "actions",
    },
    {
      key: "E",
      description: "Edit Metadata",
      action: () => {},
      category: "actions",
    },

    // Navigation
    {
      key: "/",
      description: "Quick Search",
      action: () => {},
      category: "search",
    },
    {
      key: "Esc",
      description: "Close Modals",
      action: () => {},
      category: "navigation",
    },
    {
      key: `${isMac ? "⌘" : "Ctrl"}+P`,
      description: "Toggle Playlist",
      action: () => {},
      category: "navigation",
    },
    {
      key: `${isMac ? "⌘" : "Ctrl"}+K`,
      description: "Toggle Comments",
      action: () => {},
      category: "navigation",
    },
    {
      key: `${isMac ? "⌘" : "Ctrl"}+F`,
      description: "Toggle Filters",
      action: () => {},
      category: "navigation",
    },

    // System
    {
      key: `${isMac ? "⌘" : "Ctrl"}+H`,
      description: "Toggle Help",
      action: () => {},
      category: "system",
    },
    {
      key: `${isMac ? "⌘" : "Ctrl"}+I`,
      description: "Toggle Mini Player",
      action: () => {},
      category: "system",
    },
    {
      key: `${isMac ? "⌘" : "Ctrl"}+Enter`,
      description: "Toggle Fullscreen",
      action: () => {},
      category: "system",
    },

    // Power User
    {
      key: "1",
      description: "Go to Tracks",
      action: () => {},
      category: "navigation",
    },
    {
      key: "2",
      description: "Go to Playlists",
      action: () => {},
      category: "navigation",
    },
    {
      key: "3",
      description: "Go to Upload",
      action: () => {},
      category: "navigation",
    },
    {
      key: "0",
      description: "Go to Home",
      action: () => {},
      category: "navigation",
    },
  ];

  const getCategoryIcon = (category: Shortcut["category"]) => {
    switch (category) {
      case "playback":
        return "🎵";
      case "navigation":
        return "🧭";
      case "actions":
        return "⚡";
      case "search":
        return "🔍";
      case "system":
        return "⚙️";
      default:
        return "⌨️";
    }
  };

  const getCategoryColor = (category: Shortcut["category"]) => {
    switch (category) {
      case "playback":
        return "text-blue-400";
      case "navigation":
        return "text-green-400";
      case "actions":
        return "text-purple-400";
      case "search":
        return "text-yellow-400";
      case "system":
        return "text-neutral-400";
      default:
        return "text-neutral-300";
    }
  };

  return (
    <>
      {/* Action Feedback Overlay */}
      {lastAction && (
        <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50 animate-shortcut-feedback">
          <div className="bg-neutral-900/90 backdrop-blur-xl border border-neutral-800/50 rounded-2xl px-6 py-3 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-neutral-100">
                {lastAction}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Help Button */}
      <button
        onClick={toggleHelp}
        className="fixed bottom-24 right-6 z-40 w-12 h-12 bg-neutral-900/80 backdrop-blur-xl border border-neutral-800/50 rounded-2xl text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/80 transition-all duration-300 ease-out shadow-xl hover:shadow-2xl hover:scale-110"
        title="Keyboard Shortcuts (Ctrl+H)"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </button>

      {/* Shortcuts Help Overlay */}
      {showShortcuts && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={toggleHelp}
          />

          {/* Modal */}
          <div className="relative w-full max-w-4xl max-h-[80vh] overflow-hidden bg-neutral-900/95 backdrop-blur-xl border border-neutral-800/50 rounded-3xl shadow-2xl animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between p-8 border-b border-neutral-800/50">
              <div>
                <h2 className="heading-lg mb-2">Keyboard Shortcuts</h2>
                <p className="text-secondary">
                  Power user controls for faster navigation and actions
                </p>
              </div>
              <button
                onClick={toggleHelp}
                className="btn-tertiary p-3"
                title="Close (Esc)"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-8 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {["playback", "actions", "navigation", "search", "system"].map(
                  (category) => (
                    <div key={category} className="space-y-4">
                      <h3
                        className={`text-lg font-medium flex items-center gap-2 ${getCategoryColor(
                          category as Shortcut["category"]
                        )}`}
                      >
                        {getCategoryIcon(category as Shortcut["category"])}
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </h3>
                      <div className="space-y-3">
                        {shortcuts
                          .filter((shortcut) => shortcut.category === category)
                          .map((shortcut) => (
                            <div
                              key={shortcut.key}
                              className="flex items-center justify-between p-3 bg-neutral-800/30 rounded-xl border border-neutral-700/30 hover:bg-neutral-800/50 transition-colors duration-200"
                            >
                              <span className="text-sm text-neutral-300">
                                {shortcut.description}
                              </span>
                              <kbd className="px-2 py-1 bg-neutral-700/50 border border-neutral-600/50 rounded-md text-xs font-mono text-neutral-200">
                                {shortcut.key}
                              </kbd>
                            </div>
                          ))}
                      </div>
                    </div>
                  )
                )}
              </div>

              {/* Power User Section */}
              <div className="mt-8 pt-8 border-t border-neutral-800/50">
                <h3 className="text-lg font-medium text-amber-400 mb-4 flex items-center gap-2">
                  ⚡ Power User Shortcuts
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {shortcuts
                    .filter((shortcut) => shortcut.key.match(/^[0-9]$/))
                    .map((shortcut) => (
                      <div
                        key={shortcut.key}
                        className="flex items-center justify-between p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl"
                      >
                        <span className="text-sm text-amber-300">
                          {shortcut.description}
                        </span>
                        <kbd className="px-2 py-1 bg-amber-500/20 border border-amber-500/30 rounded-md text-xs font-mono text-amber-200">
                          {shortcut.key}
                        </kbd>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
