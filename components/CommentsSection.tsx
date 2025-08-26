"use client";

import { useState, useEffect } from "react";
import { Comment } from "../types";

interface CommentsSectionProps {
  trackSlug: string;
  onCommentsUpdate?: (comments: Comment[]) => void;
}

export default function CommentsSection({
  trackSlug,
  onCommentsUpdate,
}: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [author, setAuthor] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pendingTimestamp, setPendingTimestamp] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] =
    useState<"feedback" | "question" | "suggestion" | "bug" | "general">("feedback");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [showReplies, setShowReplies] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchComments();
  }, [trackSlug]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/comments/${trackSlug}`);
      const data = await response.json();
      const newComments = data.comments || [];
      setComments(newComments);

      if (onCommentsUpdate) {
        onCommentsUpdate(newComments);
      }
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
        const updatedComments = [...comments, newComment].sort((a, b) => {
          if (
            a.audioTimestamp !== undefined &&
            b.audioTimestamp !== undefined
          ) {
            return a.audioTimestamp - b.audioTimestamp;
          }
          if (a.audioTimestamp !== undefined) return -1;
          if (b.audioTimestamp !== undefined) return 1;
          return a.timestamp - b.timestamp;
        });

        setComments(updatedComments);
        setMessage("");
        setPendingTimestamp(null);

        if (onCommentsUpdate) {
          onCommentsUpdate(updatedComments);
        }
      }
    } catch (error) {
      console.error("Error posting comment:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReply = async (parentId: string) => {
    if (!replyMessage.trim()) return;

    try {
      const response = await fetch(`/api/comments/${trackSlug}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          author: author.trim(),
          message: replyMessage.trim(),
          parentId,
        }),
      });

      if (response.ok) {
        const newReply = await response.json();
        const updatedComments = comments.map((comment) => {
          if (comment.id === parentId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), newReply],
            };
          }
          return comment;
        });

        setComments(updatedComments);
        setReplyMessage("");
        setReplyingTo(null);

        if (onCommentsUpdate) {
          onCommentsUpdate(updatedComments);
        }
      }
    } catch (error) {
      console.error("Error posting reply:", error);
    }
  };

  const handleReaction = async (
    commentId: string,
    reactionType: "like" | "love" | "laugh" | "wow" | "sad" | "angry"
  ) => {
    try {
      const response = await fetch(`/api/comments/${trackSlug}/reactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          commentId,
          reactionType,
        }),
      });

      if (response.ok) {
        const updatedComments = comments.map((comment) => {
          if (comment.id === commentId) {
            return {
              ...comment,
                          reactions: [
              ...comment.reactions,
              { type: reactionType as any, count: 1, userReaction: true }
            ],
            };
          }
          return comment;
        });

        setComments(updatedComments);
      }
    } catch (error) {
      console.error("Error adding reaction:", error);
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
    if (typeof window !== "undefined" && (window as any).seekToAudioTime) {
      (window as any).seekToAudioTime(time);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    try {
      const response = await fetch(`/api/comments/${trackSlug}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ commentId }),
      });

      if (response.ok) {
        const updatedComments = comments.filter(
          (comment) => comment.id !== commentId
        );
        setComments(updatedComments);

        if (onCommentsUpdate) {
          onCommentsUpdate(updatedComments);
        }
      } else {
        const error = await response.json();
        alert(error.message || "Failed to delete comment");
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert("Failed to delete comment");
    }
  };

  const getCategoryIcon = (category: "feedback" | "question" | "suggestion" | "bug" | "general") => {
    switch (category) {
      case "feedback":
        return "💬";
      case "question":
        return "❓";
      case "suggestion":
        return "💡";
      case "bug":
        return "🐛";
      default:
        return "💬";
    }
  };

  const getCategoryColor = (category: "feedback" | "question" | "suggestion" | "bug" | "general") => {
    switch (category) {
      case "feedback":
        return "text-blue-400 bg-blue-900/20 border-blue-800/50";
      case "question":
        return "text-yellow-400 bg-yellow-900/20 border-yellow-800/50";
      case "suggestion":
        return "text-green-400 bg-green-900/20 border-green-800/50";
      case "bug":
        return "text-red-400 bg-red-900/20 border-red-800/50";
      default:
        return "text-neutral-400 bg-neutral-900/20 border-neutral-800/50";
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).setCommentTimestamp = (time: number) => {
        setPendingTimestamp(time);
      };
    }
  }, []);

  const renderComment = (comment: Comment, isReply = false) => (
    <div
      key={comment.id}
      className={`bg-neutral-900/30 border border-neutral-800/50 rounded-xl p-4 hover:bg-neutral-900/50 transition-colors ${
        isReply ? "ml-8 border-l-2 border-l-blue-500/30" : ""
      }`}
    >
      <div className="flex flex-col sm:flex-row items-start justify-between mb-2 gap-2">
        <div className="flex items-center gap-3 flex-wrap">
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
        <div className="flex items-center gap-2 self-start sm:self-center">
          <span className="text-neutral-500 text-xs">
            {formatRelativeTime(comment.timestamp)}
          </span>
          <button
            onClick={() => handleDeleteComment(comment.id)}
            className="p-1 hover:bg-red-900/30 rounded text-neutral-500 hover:text-red-400 transition-all duration-200"
            title="Delete comment"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M3 6h18" />
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
              <path d="M8 6V4c0-1 1-2 2-2h4c0-1 1-2 2-2v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
          </button>
        </div>
      </div>

      <p className="text-sm text-neutral-300 leading-relaxed mb-3">
        {comment.content}
      </p>

      {/* Reactions */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={() => handleReaction(comment.id, "like")}
          className="flex items-center gap-1 px-2 py-1 bg-neutral-800/50 hover:bg-neutral-700/50 rounded-md text-xs text-neutral-400 hover:text-red-400 transition-all duration-200"
        >
          👍 {comment.reactions.filter(r => r.type === "like").reduce((sum, r) => sum + r.count, 0)}
        </button>
        <button
          onClick={() => handleReaction(comment.id, "love")}
          className="flex items-center gap-1 px-2 py-1 bg-neutral-800/50 hover:bg-neutral-700/50 rounded-md text-xs text-neutral-400 hover:text-green-400 transition-all duration-200"
        >
          ❤️ {comment.reactions.filter(r => r.type === "love").reduce((sum, r) => sum + r.count, 0)}
        </button>
        <button
          onClick={() => handleReaction(comment.id, "wow")}
          className="flex items-center gap-1 px-2 py-1 bg-neutral-800/50 hover:bg-neutral-700/50 rounded-md text-xs text-neutral-400 hover:text-blue-400 transition-all duration-200"
        >
          😮 {comment.reactions.filter(r => r.type === "wow").reduce((sum, r) => sum + r.count, 0)}
        </button>
      </div>

      {/* Reply Section */}
      {!isReply && (
        <div className="border-t border-neutral-800/50 pt-3">
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() =>
                setShowReplies((prev) => {
                  const newSet = new Set(prev);
                  if (newSet.has(comment.id)) {
                    newSet.delete(comment.id);
                  } else {
                    newSet.add(comment.id);
                  }
                  return newSet;
                })
              }
              className="text-xs text-neutral-400 hover:text-neutral-300 transition-colors"
            >
              {showReplies.has(comment.id) ? "Hide" : "Show"} replies (
              {comment.replies?.length || 0})
            </button>
            <button
              onClick={() => setReplyingTo(comment.id)}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              Reply
            </button>
          </div>

          {/* Reply Form */}
          {replyingTo === comment.id && (
            <div className="mb-3 p-3 bg-neutral-800/30 rounded-lg">
              <textarea
                placeholder="Write a reply..."
                className="w-full px-3 py-2 bg-neutral-900/50 border border-neutral-700/50 rounded-md text-sm placeholder:text-neutral-500 focus:outline-none focus:border-neutral-600 transition-colors resize-none"
                rows={2}
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleReply(comment.id)}
                  disabled={!replyMessage.trim()}
                  className="btn-primary text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Reply
                </button>
                <button
                  onClick={() => {
                    setReplyingTo(null);
                    setReplyMessage("");
                  }}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Replies */}
          {showReplies.has(comment.id) &&
            comment.replies &&
            comment.replies.length > 0 && (
              <div className="space-y-2">
                {comment.replies.map((reply) => renderComment(reply, true))}
              </div>
            )}
        </div>
      )}
    </div>
  );

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

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Your name"
              className="flex-1 px-4 py-3 bg-neutral-900/50 border border-neutral-700/50 rounded-xl text-sm placeholder:text-neutral-500 focus:outline-none focus:border-neutral-600 transition-colors"
              maxLength={50}
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
            />
            <select
              value={selectedCategory}
              onChange={(e) =>
                setSelectedCategory(e.target.value as "feedback" | "question" | "suggestion" | "bug" | "general")
              }
              className="px-4 py-3 bg-neutral-900/50 border border-neutral-700/50 rounded-xl text-sm text-neutral-300 focus:outline-none focus:border-neutral-600 transition-colors"
            >
              <option value="feedback">💬 Feedback</option>
              <option value="question">❓ Question</option>
              <option value="suggestion">💡 Suggestion</option>
              <option value="bug">🐛 Bug Report</option>
              <option value="general">💬 General</option>
            </select>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
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
              className="btn-primary self-stretch sm:self-end disabled:opacity-50 disabled:cursor-not-allowed"
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
          comments.map((comment) => renderComment(comment))
        )}
      </div>
    </div>
  );
}
