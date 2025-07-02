"use client";

import { usePlayer } from "./PersistentMiniPlayer";
import ShareButton from "./ShareButton";
import ReactionsPanel from "./ReactionsPanel";

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
  const { currentTrack, currentTime } = playerState;

  // Check if this track is currently playing
  const isCurrentlyPlaying = currentTrack?.slug === trackSlug;

  return (
    <div className="flex flex-col sm:flex-row justify-center items-center gap-8 my-8">
      <ShareButton
        url={shareUrl}
        title={title}
        artist={artist}
        currentTime={isCurrentlyPlaying ? currentTime : 0}
      />
      <ReactionsPanel slug={trackSlug} reactions={reactions} />
    </div>
  );
}
