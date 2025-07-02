"use client";

import { useState, useEffect } from "react";

interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
}

interface CommentsSectionProps {
  trackSlug: string;
}

export default function CommentsSection({ trackSlug }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [trackSlug]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/comments/${trackSlug}`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    }
  };

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !authorName.trim() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/comments/${trackSlug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author: authorName.trim(),
          content: newComment.trim(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setComments(data.comments);
        setNewComment("");
        // Keep author name for convenience
      }
    } catch (error) {
      console.error("Failed to submit comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  return (
    <div className="track-info p-8">
      <h3
        className="text-lg font-medium mb-6 tracking-tight"
        style={{ fontVariationSettings: "'wght' 500" }}
      >
        Comments ({comments.length})
      </h3>

      {/* Comment Form */}
      <form onSubmit={submitComment} className="mb-8">
        <div className="flex flex-col gap-4">
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Your name"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="flex-1 px-4 py-3 bg-neutral-900/50 border border-neutral-700/50 rounded-xl text-sm placeholder:text-neutral-500 focus:outline-none focus:border-neutral-600 transition-colors"
              maxLength={50}
            />
          </div>
          <div className="flex gap-3">
            <textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1 px-4 py-3 bg-neutral-900/50 border border-neutral-700/50 rounded-xl text-sm placeholder:text-neutral-500 focus:outline-none focus:border-neutral-600 transition-colors resize-none"
              rows={3}
              maxLength={500}
            />
            <button
              type="submit"
              disabled={
                !newComment.trim() || !authorName.trim() || isSubmitting
              }
              className="btn-primary self-end disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Posting..." : "Post"}
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
              className="bg-neutral-900/30 rounded-xl p-4 border border-neutral-800/30"
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className="font-medium text-sm"
                  style={{ fontVariationSettings: "'wght' 500" }}
                >
                  {comment.author}
                </span>
                <span className="text-xs text-neutral-500">
                  {formatTimestamp(comment.timestamp)}
                </span>
              </div>
              <p className="text-sm text-neutral-200 leading-relaxed">
                {comment.content}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
