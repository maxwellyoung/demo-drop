"use client";

import { usePlayer } from "./PersistentMiniPlayer";
import ShareButton from "./ShareButton";
import ReactionsPanel from "./ReactionsPanel";
import { log } from "@/lib/logger";

interface TrackActionsProps {
  shareUrl: string;
  title: string;
  artist: string;
  trackSlug: string;
  reactions: {
    fire: number;
    cry: number;
    explode: number;
    broken: number;
  };
}

export default function TrackActions({
  shareUrl,
  title,
  artist,
  trackSlug,
  reactions,
}: TrackActionsProps) {
  const { playerState } = usePlayer();
  const { currentTrack } = playerState;

  // TODO: Replace with actual logged-in user ID
  const userId = "USER_ID_PLACEHOLDER";

  // Check if this track is currently playing
  const isCurrentlyPlaying = currentTrack?.slug === trackSlug;

  return (
    <div>
      <div className="flex items-center gap-4">
        <ReactionsPanel
          slug={trackSlug}
          reactions={reactions}
          userId={userId}
        />
      </div>
    </div>
  );
}
