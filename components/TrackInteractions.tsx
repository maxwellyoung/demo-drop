"use client";

import { useState, useEffect } from "react";
import AudioPlayer from "./AudioPlayer";
import CommentsSection from "./CommentsSection";

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
  trackSlug: string;
  initialComments: Comment[];
}

export default function TrackInteractions({
  audioUrl,
  title,
  trackSlug,
  initialComments,
}: TrackInteractionsProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);

  // Update comments when initial data changes (if needed)
  useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  const handleCommentsUpdate = (updatedComments: Comment[]) => {
    setComments(updatedComments);
  };

  return (
    <>
      {/* Audio Player with Comments Integration */}
      <div className="mb-12">
        <AudioPlayer audioUrl={audioUrl} title={title} comments={comments} />
      </div>

      {/* Comments Section with Timestamp Support */}
      <CommentsSection
        trackSlug={trackSlug}
        onCommentsUpdate={handleCommentsUpdate}
      />
    </>
  );
}
