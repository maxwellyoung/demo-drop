"use client";

import { useState, useCallback, useEffect } from "react";
import { useKeyboardShortcuts } from "./KeyboardShortcutsProvider";

interface PowerUserFeaturesProps {
  tracks?: any[];
  onBulkAction?: (action: string, trackIds: string[]) => void;
  onAdvancedSearch?: (query: string, filters: any) => void;
  onExportData?: (format: string) => void;
  onImportData?: (data: any) => void;
}

export default function PowerUserFeatures({
  tracks = [],
  onBulkAction,
  onAdvancedSearch,
  onExportData,
  onImportData,
}: PowerUserFeaturesProps) {
  const [showPanel, setShowPanel] = useState(false);
  const [selectedTracks, setSelectedTracks] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFilters, setSearchFilters] = useState({
    genre: "",
    artist: "",
    dateRange: "",
    duration: "",
    hasComments: false,
    hasReactions: false,
  });
  const [bulkAction, setBulkAction] = useState("");
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showDataTools, setShowDataTools] = useState(false);

  const { toggleShortcuts } = useKeyboardShortcuts();

  // Keyboard shortcuts for power user features
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger when typing in inputs
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const { key, ctrlKey, metaKey, shiftKey } = event;
      const modifier = ctrlKey || metaKey;

      if (modifier && key === "b") {
        event.preventDefault();
        setShowBulkActions(!showBulkActions);
      } else if (modifier && key === "s") {
        event.preventDefault();
        setShowAdvancedSearch(!showAdvancedSearch);
      } else if (modifier && key === "e") {
        event.preventDefault();
        setShowDataTools(!showDataTools);
      } else if (modifier && key === "a") {
        event.preventDefault();
        if (selectedTracks.size === tracks.length) {
          setSelectedTracks(new Set());
        } else {
          setSelectedTracks(new Set(tracks.map((track) => track.slug)));
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    showBulkActions,
    showAdvancedSearch,
    showDataTools,
    selectedTracks,
    tracks,
  ]);

  const toggleTrackSelection = useCallback((trackId: string) => {
    setSelectedTracks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(trackId)) {
        newSet.delete(trackId);
      } else {
        newSet.add(trackId);
      }
      return newSet;
    });
  }, []);

  const handleBulkAction = useCallback(
    (action: string) => {
      if (selectedTracks.size === 0) return;

      onBulkAction?.(action, Array.from(selectedTracks));
      setBulkAction(action);

      // Clear selection after action
      setTimeout(() => {
        setSelectedTracks(new Set());
        setBulkAction("");
      }, 2000);
    },
    [selectedTracks, onBulkAction]
  );

  const handleAdvancedSearch = useCallback(() => {
    onAdvancedSearch?.(searchQuery, searchFilters);
  }, [searchQuery, searchFilters, onAdvancedSearch]);

  const exportTracks = useCallback(
    (format: string) => {
      const selectedTracksData = tracks.filter(
        (track) => selectedTracks.size === 0 || selectedTracks.has(track.slug)
      );

      if (format === "json") {
        const dataStr = JSON.stringify(selectedTracksData, null, 2);
        const dataBlob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `tracks-export-${
          new Date().toISOString().split("T")[0]
        }.json`;
        link.click();
        URL.revokeObjectURL(url);
      } else if (format === "csv") {
        const headers = [
          "Title",
          "Artist",
          "Genre",
          "Duration",
          "Upload Date",
          "Comments",
          "Reactions",
        ];
        const csvData = selectedTracksData.map((track) => [
          track.title,
          track.artist,
          track.extendedMetadata?.genre || "",
          track.extendedMetadata?.duration || "",
          new Date(track.uploadedAt).toLocaleDateString(),
          track.comments?.length || 0,
          Object.values(track.reactions || {}).reduce((a, b) => {
            const aNum = typeof a === "number" ? a : 0;
            const bNum = typeof b === "number" ? b : 0;
            return aNum + bNum;
          }, 0),
        ]);

        const csvContent = [headers, ...csvData]
          .map((row) => row.map((cell) => `"${cell}"`).join(","))
          .join("\n");

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `tracks-export-${
          new Date().toISOString().split("T")[0]
        }.csv`;
        link.click();
        URL.revokeObjectURL(url);
      }
    },
    [tracks, selectedTracks]
  );

  const importTracks = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          onImportData?.(data);
        } catch (error) {
          console.error("Failed to parse import file:", error);
          alert("Invalid import file format");
        }
      };
      reader.readAsText(file);
    },
    [onImportData]
  );

  return (
    <>
      {/* Power User Panel Toggle */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="fixed bottom-36 right-6 z-40 w-12 h-12 bg-neutral-900/80 backdrop-blur-xl border border-neutral-800/50 rounded-2xl text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/80 transition-all duration-300 ease-out shadow-xl hover:shadow-2xl hover:scale-110"
        title="Power User Features (Ctrl+P)"
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
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      </button>

      {/* Power User Panel */}
      {showPanel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowPanel(false)}
          />

          {/* Panel */}
          <div className="relative w-full max-w-6xl max-h-[90vh] overflow-hidden bg-neutral-900/95 backdrop-blur-xl border border-neutral-800/50 rounded-3xl shadow-2xl animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between p-8 border-b border-neutral-800/50">
              <div>
                <h2 className="heading-lg mb-2">Power User Features</h2>
                <p className="text-secondary">
                  Advanced tools for power users and bulk operations
                </p>
              </div>
              <button
                onClick={() => setShowPanel(false)}
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
            <div className="p-8 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Bulk Actions */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-purple-400 flex items-center gap-2">
                      ⚡ Bulk Actions
                    </h3>
                    <button
                      onClick={() => setShowBulkActions(!showBulkActions)}
                      className="text-sm text-neutral-400 hover:text-neutral-200"
                    >
                      {showBulkActions ? "Hide" : "Show"}
                    </button>
                  </div>

                  {showBulkActions && (
                    <div className="space-y-4">
                      {/* Selection Summary */}
                      <div className="bg-neutral-800/30 rounded-xl p-4 border border-neutral-700/30">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm text-neutral-300">
                            {selectedTracks.size} of {tracks.length} tracks
                            selected
                          </span>
                          <button
                            onClick={() => setSelectedTracks(new Set())}
                            className="text-xs text-neutral-500 hover:text-neutral-300"
                          >
                            Clear
                          </button>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          <button
                            onClick={() =>
                              setSelectedTracks(
                                new Set(tracks.map((t) => t.slug))
                              )
                            }
                            className="btn-secondary text-xs px-3 py-1"
                          >
                            Select All
                          </button>
                          <button
                            onClick={() =>
                              setSelectedTracks(
                                new Set(
                                  tracks
                                    .filter(
                                      (t) =>
                                        t.reactions &&
                                        Object.values(t.reactions).some(
                                          (v) => v > 0
                                        )
                                    )
                                    .map((t) => t.slug)
                                )
                              )
                            }
                            className="btn-secondary text-xs px-3 py-1"
                          >
                            Select with Reactions
                          </button>
                          <button
                            onClick={() =>
                              setSelectedTracks(
                                new Set(
                                  tracks
                                    .filter(
                                      (t) => t.comments && t.comments.length > 0
                                    )
                                    .map((t) => t.slug)
                                )
                              )
                            }
                            className="btn-secondary text-xs px-3 py-1"
                          >
                            Select with Comments
                          </button>
                        </div>
                      </div>

                      {/* Bulk Action Buttons */}
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => handleBulkAction("addToPlaylist")}
                          disabled={selectedTracks.size === 0}
                          className="btn-secondary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Add to Playlist
                        </button>
                        <button
                          onClick={() => handleBulkAction("export")}
                          disabled={selectedTracks.size === 0}
                          className="btn-secondary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Export Selected
                        </button>
                        <button
                          onClick={() => handleBulkAction("share")}
                          disabled={selectedTracks.size === 0}
                          className="btn-secondary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Share Selected
                        </button>
                        <button
                          onClick={() => handleBulkAction("delete")}
                          disabled={selectedTracks.size === 0}
                          className="btn-secondary text-sm disabled:opacity-50 disabled:cursor-not-allowed text-red-400 hover:text-red-300"
                        >
                          Delete Selected
                        </button>
                      </div>

                      {/* Action Feedback */}
                      {bulkAction && (
                        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="text-sm text-green-300">
                              {bulkAction} completed for {selectedTracks.size}{" "}
                              tracks
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Advanced Search */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-blue-400 flex items-center gap-2">
                      🔍 Advanced Search
                    </h3>
                    <button
                      onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                      className="text-sm text-neutral-400 hover:text-neutral-200"
                    >
                      {showAdvancedSearch ? "Hide" : "Show"}
                    </button>
                  </div>

                  {showAdvancedSearch && (
                    <div className="space-y-4">
                      <input
                        type="text"
                        placeholder="Search tracks..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-neutral-800/50 border border-neutral-700/50 rounded-xl px-4 py-3 text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                      />

                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Genre filter"
                          value={searchFilters.genre}
                          onChange={(e) =>
                            setSearchFilters((prev) => ({
                              ...prev,
                              genre: e.target.value,
                            }))
                          }
                          className="bg-neutral-800/50 border border-neutral-700/50 rounded-xl px-3 py-2 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                        <input
                          type="text"
                          placeholder="Artist filter"
                          value={searchFilters.artist}
                          onChange={(e) =>
                            setSearchFilters((prev) => ({
                              ...prev,
                              artist: e.target.value,
                            }))
                          }
                          className="bg-neutral-800/50 border border-neutral-700/50 rounded-xl px-3 py-2 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                      </div>

                      <div className="flex gap-3">
                        <label className="flex items-center gap-2 text-sm text-neutral-300">
                          <input
                            type="checkbox"
                            checked={searchFilters.hasComments}
                            onChange={(e) =>
                              setSearchFilters((prev) => ({
                                ...prev,
                                hasComments: e.target.checked,
                              }))
                            }
                            className="rounded border-neutral-600 bg-neutral-800 text-blue-500 focus:ring-blue-500/50"
                          />
                          Has Comments
                        </label>
                        <label className="flex items-center gap-2 text-sm text-neutral-300">
                          <input
                            type="checkbox"
                            checked={searchFilters.hasReactions}
                            onChange={(e) =>
                              setSearchFilters((prev) => ({
                                ...prev,
                                hasReactions: e.target.checked,
                              }))
                            }
                            className="rounded border-neutral-600 bg-neutral-800 text-blue-500 focus:ring-blue-500/50"
                          />
                          Has Reactions
                        </label>
                      </div>

                      <button
                        onClick={handleAdvancedSearch}
                        className="w-full btn-primary"
                      >
                        Search
                      </button>
                    </div>
                  )}
                </div>

                {/* Data Tools */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-green-400 flex items-center gap-2">
                      📊 Data Tools
                    </h3>
                    <button
                      onClick={() => setShowDataTools(!showDataTools)}
                      className="text-sm text-neutral-400 hover:text-neutral-200"
                    >
                      {showDataTools ? "Hide" : "Show"}
                    </button>
                  </div>

                  {showDataTools && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => exportTracks("json")}
                          className="btn-secondary text-sm"
                        >
                          Export JSON
                        </button>
                        <button
                          onClick={() => exportTracks("csv")}
                          className="btn-secondary text-sm"
                        >
                          Export CSV
                        </button>
                      </div>

                      <div className="bg-neutral-800/30 rounded-xl p-4 border border-neutral-700/30">
                        <label className="block text-sm text-neutral-300 mb-2">
                          Import Tracks
                        </label>
                        <input
                          type="file"
                          accept=".json"
                          onChange={importTracks}
                          className="w-full text-sm text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-neutral-700 file:text-neutral-300 hover:file:bg-neutral-600"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Keyboard Shortcuts */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-yellow-400 flex items-center gap-2">
                      ⌨️ Power Shortcuts
                    </h3>
                    <button
                      onClick={toggleShortcuts}
                      className="text-sm text-neutral-400 hover:text-neutral-200"
                    >
                      View All
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-neutral-800/30 rounded-xl border border-neutral-700/30">
                      <span className="text-sm text-neutral-300">
                        Toggle Bulk Actions
                      </span>
                      <kbd className="px-2 py-1 bg-neutral-700/50 border border-neutral-600/50 rounded-md text-xs font-mono text-neutral-200">
                        Ctrl+B
                      </kbd>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-neutral-800/30 rounded-xl border border-neutral-700/30">
                      <span className="text-sm text-neutral-300">
                        Toggle Advanced Search
                      </span>
                      <kbd className="px-2 py-1 bg-neutral-700/50 border border-neutral-600/50 rounded-md text-xs font-mono text-neutral-200">
                        Ctrl+S
                      </kbd>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-neutral-800/30 rounded-xl border border-neutral-700/30">
                      <span className="text-sm text-neutral-300">
                        Toggle Data Tools
                      </span>
                      <kbd className="px-2 py-1 bg-neutral-700/50 border border-neutral-600/50 rounded-md text-xs font-mono text-neutral-200">
                        Ctrl+E
                      </kbd>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-neutral-800/30 rounded-xl border border-neutral-700/30">
                      <span className="text-sm text-neutral-300">
                        Select All Tracks
                      </span>
                      <kbd className="px-2 py-1 bg-neutral-700/50 border border-neutral-600/50 rounded-md text-xs font-mono text-neutral-200">
                        Ctrl+A
                      </kbd>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
