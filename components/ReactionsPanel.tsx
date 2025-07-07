"use client";

import { useState } from "react";
import { log } from "../lib/logger";

interface Reactions {
  fire: number;
  cry: number;
  explode: number;
  broken: number;
}

interface ReactionsPanelProps {
  slug: string;
  reactions: Reactions;
  userId: string;
}

const reactionEmojis = {
  fire: { emoji: "🔥", label: "Fire" },
  cry: { emoji: "😭", label: "Emotional" },
  explode: { emoji: "🤯", label: "Mind-blown" },
  broken: { emoji: "💔", label: "Heartbreaking" },
};

export default function ReactionsPanel({
  slug,
  reactions: initialReactions,
  userId,
}: ReactionsPanelProps) {
  const [reactions, setReactions] = useState(initialReactions);
  const [userReaction, setUserReaction] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleReaction = async (type: keyof Reactions) => {
    if (isUpdating) return;

    setIsUpdating(true);
    const wasActive = userReaction === type;

    // Optimistic update with better UX
    setReactions((prev) => ({
      ...prev,
      [type]: prev[type] + (wasActive ? -1 : 1),
    }));

    // Update user reaction
    setUserReaction(wasActive ? null : type);

    try {
      await fetch(`/api/reactions/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, userId }),
      });
    } catch (error) {
      log.error("Failed to update reaction", { error });
      // Revert optimistic update on error
      setReactions(initialReactions);
      setUserReaction(null);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-3">
      {Object.entries(reactionEmojis).map(([type, { emoji, label }]) => {
        const isActive = userReaction === type;
        const count = reactions[type as keyof Reactions];

        return (
          <button
            key={type}
            onClick={() => handleReaction(type as keyof Reactions)}
            disabled={isUpdating}
            className={`reaction-button group ${isActive ? "active" : ""}`}
            title={label}
          >
            <span className="text-lg transition-transform group-hover:scale-125 group-active:scale-110">
              {emoji}
            </span>
            <span className="text-sm font-medium min-w-[1.5rem] text-center">
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
