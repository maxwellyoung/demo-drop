"use client";

import { useState, useEffect } from "react";

interface Comment {
  id: string;
  author: string;
  message: string;
  timestamp: number;
  audioTimestamp?: number;
}

interface CommentsSectionProps {
  trackSlug: string;
}

export default function CommentsSection({ trackSlug }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [author, setAuthor] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pendingTimestamp, setPendingTimestamp] = useState<number | null>(null);

  useEffect(() => {
    fetchComments();
  }, [trackSlug]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/comments/${trackSlug}`);
      const data = await response.json();
      setComments(data.comments || []);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!author.trim() || !message.trim()) return;

    setIsLoading(true);

    try {
      const response = await fetch(`/api/comments/${trackSlug}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          author: author.trim(),
          message: message.trim(),
          audioTimestamp: pendingTimestamp,
        }),
      });

      if (response.ok) {
        const newComment = await response.json();
        setComments((prev) =>
          [...prev, newComment].sort((a, b) => {
            if (
              a.audioTimestamp !== undefined &&
              b.audioTimestamp !== undefined
            ) {
              return a.audioTimestamp - b.audioTimestamp;
            }
            if (a.audioTimestamp !== undefined) return -1;
            if (b.audioTimestamp !== undefined) return 1;
            return a.timestamp - b.timestamp;
          })
        );
        setMessage("");
        setPendingTimestamp(null);

        // Refresh the page to update comment markers
        window.location.reload();
      }
    } catch (error) {
      console.error("Error posting comment:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatRelativeTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "just now";
  };

  const handleSeekToTime = (time: number) => {
    // Send seek command to audio player via global function
    if (typeof window !== "undefined" && (window as any).seekToAudioTime) {
      (window as any).seekToAudioTime(time);
    }
  };

  // Listen for timestamp setting from audio player
  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).setCommentTimestamp = (time: number) => {
        setPendingTimestamp(time);
      };
    }
  }, []);

  return (
    <div className="track-info p-8">
      <h3
        className="text-lg font-medium mb-6 tracking-tight"
        style={{ fontVariationSettings: "'wght' 500" }}
      >
        Comments ({comments.length})
      </h3>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="mb-8">
        {pendingTimestamp !== null && (
          <div className="mb-4 p-3 bg-blue-900/20 border border-blue-800/50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-blue-400 text-sm">
                💬 Commenting at {formatTime(pendingTimestamp)}
              </span>
              <button
                type="button"
                onClick={() => setPendingTimestamp(null)}
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                Remove timestamp
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-4">
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Your name"
              className="flex-1 px-4 py-3 bg-neutral-900/50 border border-neutral-700/50 rounded-xl text-sm placeholder:text-neutral-500 focus:outline-none focus:border-neutral-600 transition-colors"
              maxLength={50}
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            <textarea
              placeholder={
                pendingTimestamp !== null
                  ? `Add a comment at ${formatTime(pendingTimestamp)}...`
                  : "Add a comment..."
              }
              className="flex-1 px-4 py-3 bg-neutral-900/50 border border-neutral-700/50 rounded-xl text-sm placeholder:text-neutral-500 focus:outline-none focus:border-neutral-600 transition-colors resize-none"
              rows={3}
              maxLength={500}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button
              type="submit"
              disabled={!author.trim() || !message.trim() || isLoading}
              className="btn-primary self-end disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Posting..." : "Post"}
            </button>
          </div>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">💬</div>
            <p className="text-secondary">
              No comments yet. Be the first to share your thoughts!
            </p>
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-neutral-900/30 border border-neutral-800/50 rounded-xl p-4 hover:bg-neutral-900/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-sm">{comment.author}</span>
                  {comment.audioTimestamp !== undefined && (
                    <button
                      onClick={() => handleSeekToTime(comment.audioTimestamp!)}
                      className="px-2 py-1 bg-blue-900/30 border border-blue-800/50 rounded-md text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-900/50 transition-all duration-200 flex items-center gap-1"
                      title="Jump to this moment"
                    >
                      🎵 {formatTime(comment.audioTimestamp)}
                    </button>
                  )}
                </div>
                <span className="text-neutral-500 text-xs">
                  {formatRelativeTime(comment.timestamp)}
                </span>
              </div>
              <p className="text-sm text-neutral-300 leading-relaxed">
                {comment.message}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
