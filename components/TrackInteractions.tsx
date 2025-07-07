"use client";

import { useState, useEffect } from "react";
import UnifiedAudioPlayer from "./UnifiedAudioPlayer";
import CommentsSection from "./CommentsSection";
import CloudSyncStatusBar from "./CloudSyncStatusBar";

interface Comment {
  id: string;
  author: string;
  message: string;
  timestamp: number;
  audioTimestamp?: number;
}

interface TrackInteractionsProps {
  audioUrl: string;
  title: string;
  artist?: string;
  trackSlug: string;
  initialComments: Comment[];
}

export default function TrackInteractions({
  audioUrl,
  title,
  artist,
  trackSlug,
  initialComments,
}: TrackInteractionsProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [cloudSyncStatus, setCloudSyncStatus] = useState({
    isEnabled: true,
    isSync: false,
    hasError: false,
    status: "pending" as "synced" | "pending" | "error" | "disabled",
  });

  // Update comments when initial data changes (if needed)
  useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  // Load cloud sync status for this track
  useEffect(() => {
    const loadSyncStatus = async () => {
      try {
        const response = await fetch("/api/sync");
        const data = await response.json();
        const trackStatus = data.status?.find(
          (s: any) =>
            s.filename.includes(trackSlug) || s.localPath.includes(trackSlug)
        );

        if (trackStatus) {
          setCloudSyncStatus({
            isEnabled: true,
            isSync: false,
            hasError: !!trackStatus.syncError,
            status: trackStatus.syncError
              ? "error"
              : trackStatus.needsSync
              ? "pending"
              : "synced",
          });
        }
      } catch (error) {
        console.error("Failed to load sync status:", error);
      }
    };

    loadSyncStatus();
  }, [trackSlug]);

  const handleCommentsUpdate = (updatedComments: Comment[]) => {
    setComments(updatedComments);
  };

  return (
    <>
      {/* Cloud Sync Status */}
      <CloudSyncStatusBar className="mb-6" />

      {/* Unified Audio Player */}
      <div className="mb-12">
        <UnifiedAudioPlayer
          audioUrl={audioUrl}
          title={title}
          artist={artist}
          comments={comments}
          cloudSync={cloudSyncStatus}
        />
      </div>

      {/* Comments Section with Timestamp Support */}
      <CommentsSection
        trackSlug={trackSlug}
        onCommentsUpdate={handleCommentsUpdate}
      />
    </>
  );
}
