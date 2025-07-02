"use client";

import { useState, useEffect } from "react";

interface ExtendedTrackMetadata {
  description: string;
  tags: string[];
  credits: string[];
  notes: string;
  genre: string;
  bpm: number | null;
  key: string;
  duration: number | null;
}

interface MetadataEditorProps {
  trackSlug: string;
}

export default function MetadataEditor({ trackSlug }: MetadataEditorProps) {
  const [metadata, setMetadata] = useState<ExtendedTrackMetadata>({
    description: "",
    tags: [],
    credits: [],
    notes: "",
    genre: "",
    bpm: null,
    key: "",
    duration: null,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [newCredit, setNewCredit] = useState("");

  // Load existing metadata
  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const response = await fetch(`/api/metadata/${trackSlug}`);
        if (response.ok) {
          const data = await response.json();
          setMetadata(data);
        }
      } catch (error) {
        console.error("Error loading metadata:", error);
      }
    };

    loadMetadata();
  }, [trackSlug]);

  const saveMetadata = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/metadata/${trackSlug}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(metadata),
      });

      if (response.ok) {
        setIsEditing(false);
      } else {
        console.error("Failed to save metadata");
      }
    } catch (error) {
      console.error("Error saving metadata:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !metadata.tags.includes(newTag.trim())) {
      setMetadata({
        ...metadata,
        tags: [...metadata.tags, newTag.trim()],
      });
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setMetadata({
      ...metadata,
      tags: metadata.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const addCredit = () => {
    if (newCredit.trim() && !metadata.credits.includes(newCredit.trim())) {
      setMetadata({
        ...metadata,
        credits: [...metadata.credits, newCredit.trim()],
      });
      setNewCredit("");
    }
  };

  const removeCredit = (creditToRemove: string) => {
    setMetadata({
      ...metadata,
      credits: metadata.credits.filter((credit) => credit !== creditToRemove),
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === "Enter") {
      e.preventDefault();
      action();
    }
  };

  if (!isEditing) {
    return (
      <div className="track-info p-8 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3
            className="text-lg font-medium tracking-tight"
            style={{ fontVariationSettings: "'wght' 500" }}
          >
            Track Metadata
          </h3>
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 text-sm bg-neutral-800/50 hover:bg-neutral-700/50 rounded-lg transition-colors duration-200 flex items-center gap-2"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z" />
            </svg>
            Edit Metadata
          </button>
        </div>

        <div className="space-y-6">
          {metadata.description && (
            <div>
              <span className="text-secondary text-sm block mb-2">
                Description
              </span>
              <p className="text-sm leading-relaxed">{metadata.description}</p>
            </div>
          )}

          {metadata.tags.length > 0 && (
            <div>
              <span className="text-secondary text-sm block mb-2">Tags</span>
              <div className="flex flex-wrap gap-2">
                {metadata.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-neutral-800/50 rounded-full text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {metadata.credits.length > 0 && (
            <div>
              <span className="text-secondary text-sm block mb-2">Credits</span>
              <div className="space-y-1">
                {metadata.credits.map((credit, index) => (
                  <div key={index} className="text-sm">
                    {credit}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {metadata.genre && (
              <div>
                <span className="text-secondary text-sm block mb-1">Genre</span>
                <span className="text-sm font-medium">{metadata.genre}</span>
              </div>
            )}

            {metadata.bpm && (
              <div>
                <span className="text-secondary text-sm block mb-1">BPM</span>
                <span className="text-sm font-medium">{metadata.bpm}</span>
              </div>
            )}

            {metadata.key && (
              <div>
                <span className="text-secondary text-sm block mb-1">Key</span>
                <span className="text-sm font-medium">{metadata.key}</span>
              </div>
            )}
          </div>

          {metadata.notes && (
            <div>
              <span className="text-secondary text-sm block mb-2">Notes</span>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {metadata.notes}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="track-info p-8 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h3
          className="text-lg font-medium tracking-tight"
          style={{ fontVariationSettings: "'wght' 500" }}
        >
          Edit Track Metadata
        </h3>
        <div className="flex gap-3">
          <button
            onClick={() => setIsEditing(false)}
            className="px-4 py-2 text-sm text-neutral-400 hover:text-neutral-300 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={saveMetadata}
            disabled={isSaving}
            className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200 flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving && (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                className="animate-spin"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="opacity-25"
                />
                <path
                  fill="currentColor"
                  className="opacity-75"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            )}
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Description */}
        <div>
          <label className="text-secondary text-sm block mb-2">
            Description
          </label>
          <textarea
            value={metadata.description}
            onChange={(e) =>
              setMetadata({ ...metadata, description: e.target.value })
            }
            className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700/50 rounded-lg resize-y min-h-[100px] text-sm focus:outline-none focus:border-neutral-600 focus:bg-neutral-800"
            placeholder="Describe your track..."
          />
        </div>

        {/* Tags */}
        <div>
          <label className="text-secondary text-sm block mb-2">Tags</label>
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, addTag)}
                className="flex-1 px-4 py-2 bg-neutral-800/50 border border-neutral-700/50 rounded-lg text-sm focus:outline-none focus:border-neutral-600 focus:bg-neutral-800"
                placeholder="Add a tag..."
              />
              <button
                onClick={addTag}
                className="px-4 py-2 bg-neutral-700/50 hover:bg-neutral-600/50 rounded-lg text-sm transition-colors duration-200"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {metadata.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-neutral-800/50 rounded-full text-xs flex items-center gap-2"
                >
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="hover:text-red-400 transition-colors"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Credits */}
        <div>
          <label className="text-secondary text-sm block mb-2">Credits</label>
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={newCredit}
                onChange={(e) => setNewCredit(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, addCredit)}
                className="flex-1 px-4 py-2 bg-neutral-800/50 border border-neutral-700/50 rounded-lg text-sm focus:outline-none focus:border-neutral-600 focus:bg-neutral-800"
                placeholder="Producer, Vocalist, Engineer..."
              />
              <button
                onClick={addCredit}
                className="px-4 py-2 bg-neutral-700/50 hover:bg-neutral-600/50 rounded-lg text-sm transition-colors duration-200"
              >
                Add
              </button>
            </div>
            <div className="space-y-2">
              {metadata.credits.map((credit, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between px-3 py-2 bg-neutral-800/50 rounded-lg text-sm"
                >
                  {credit}
                  <button
                    onClick={() => removeCredit(credit)}
                    className="text-neutral-400 hover:text-red-400 transition-colors"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Genre, BPM, Key */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-secondary text-sm block mb-2">Genre</label>
            <input
              type="text"
              value={metadata.genre}
              onChange={(e) =>
                setMetadata({ ...metadata, genre: e.target.value })
              }
              className="w-full px-4 py-2 bg-neutral-800/50 border border-neutral-700/50 rounded-lg text-sm focus:outline-none focus:border-neutral-600 focus:bg-neutral-800"
              placeholder="Rock, Hip-Hop, Electronic..."
            />
          </div>
          <div>
            <label className="text-secondary text-sm block mb-2">BPM</label>
            <input
              type="number"
              value={metadata.bpm || ""}
              onChange={(e) =>
                setMetadata({
                  ...metadata,
                  bpm: e.target.value ? parseInt(e.target.value) : null,
                })
              }
              className="w-full px-4 py-2 bg-neutral-800/50 border border-neutral-700/50 rounded-lg text-sm focus:outline-none focus:border-neutral-600 focus:bg-neutral-800"
              placeholder="120"
              min="1"
              max="300"
            />
          </div>
          <div>
            <label className="text-secondary text-sm block mb-2">Key</label>
            <input
              type="text"
              value={metadata.key}
              onChange={(e) =>
                setMetadata({ ...metadata, key: e.target.value })
              }
              className="w-full px-4 py-2 bg-neutral-800/50 border border-neutral-700/50 rounded-lg text-sm focus:outline-none focus:border-neutral-600 focus:bg-neutral-800"
              placeholder="C major, A minor..."
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="text-secondary text-sm block mb-2">Notes</label>
          <textarea
            value={metadata.notes}
            onChange={(e) =>
              setMetadata({ ...metadata, notes: e.target.value })
            }
            className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700/50 rounded-lg resize-y min-h-[120px] text-sm focus:outline-none focus:border-neutral-600 focus:bg-neutral-800"
            placeholder="Recording notes, mixing details, inspiration..."
          />
        </div>
      </div>
    </div>
  );
}
