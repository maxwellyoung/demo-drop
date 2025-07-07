"use client";

import { useState } from "react";
import { log } from "../lib/logger";

interface ShareButtonProps {
  url: string;
  title: string;
  artist?: string;
  currentTime?: number;
  duration?: number;
  onShareWithTimestamp?: (timestamp: number) => void;
}

export default function ShareButton({
  url,
  title,
  artist,
  currentTime = 0,
  duration = 0,
  onShareWithTimestamp,
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [showSocialOptions, setShowSocialOptions] = useState(false);
  const [showCollaborationOptions, setShowCollaborationOptions] =
    useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      log.error("Failed to copy to clipboard", { error });
    }
  };

  const shareText = artist ? `${title} by ${artist}` : title;

  // Generate timestamp URL
  const generateTimestampUrl = (time: number) => {
    const timestamp = Math.floor(time);
    return `${url}#t=${timestamp}`;
  };

  // Generate current timestamp URL
  const currentTimestampUrl =
    currentTime > 0 ? generateTimestampUrl(currentTime) : url;

  // Format time for display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const socialShareUrls = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      currentTime > 0
        ? `Check out "${shareText}" at ${formatTime(currentTime)} on Demo Drop!`
        : `Check out "${shareText}" on Demo Drop!`
    )}&url=${encodeURIComponent(currentTimestampUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      currentTimestampUrl
    )}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      currentTimestampUrl
    )}`,
  };

  const handleSocialShare = (platform: keyof typeof socialShareUrls) => {
    window.open(socialShareUrls[platform], "_blank", "width=600,height=400");
  };

  const handleTimestampShare = () => {
    if (onShareWithTimestamp && currentTime > 0) {
      onShareWithTimestamp(currentTime);
    }
    copyToClipboard(currentTimestampUrl);
  };

  const handleCollaborationShare = () => {
    const collaborationUrl = `${url}?collab=true&t=${Math.floor(currentTime)}`;
    copyToClipboard(collaborationUrl);
  };

  return (
    <div className="relative">
      <div className="flex gap-2">
        {/* Main Share Button */}
        <button
          onClick={() => setShowSocialOptions(!showSocialOptions)}
          className="btn-secondary flex items-center gap-3 group"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="transition-transform group-hover:scale-110"
          >
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
          <span>Share</span>
        </button>

        {/* Collaboration Button */}
        <button
          onClick={() => setShowCollaborationOptions(!showCollaborationOptions)}
          className="btn-secondary flex items-center gap-3 group"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="transition-transform group-hover:scale-110"
          >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <span>Collaborate</span>
        </button>
      </div>

      {/* Social Share Options */}
      {showSocialOptions && (
        <div className="absolute bottom-full right-0 mb-2 bg-neutral-900/95 backdrop-blur-xl rounded-2xl border border-neutral-800/50 p-3 shadow-xl z-10">
          <div className="flex flex-col gap-2 min-w-[200px]">
            <button
              onClick={() => handleSocialShare("twitter")}
              className="social-share-btn twitter"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
              </svg>
              Share on Twitter
            </button>

            <button
              onClick={() => handleSocialShare("facebook")}
              className="social-share-btn facebook"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Share on Facebook
            </button>

            <button
              onClick={() => handleSocialShare("linkedin")}
              className="social-share-btn linkedin"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              Share on LinkedIn
            </button>

            <div className="border-t border-neutral-800/50 my-2"></div>

            <button
              onClick={() => copyToClipboard(currentTimestampUrl)}
              className="social-share-btn copy"
            >
              {copied ? (
                <>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="text-green-400"
                  >
                    <polyline
                      points="20,6 9,17 4,12"
                      strokeWidth="2"
                      stroke="currentColor"
                      fill="none"
                    />
                  </svg>
                  <span className="text-green-400">Copied!</span>
                </>
              ) : (
                <>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  {currentTime > 0
                    ? `Copy Link (${formatTime(currentTime)})`
                    : "Copy Link"}
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Collaboration Options */}
      {showCollaborationOptions && (
        <div className="absolute bottom-full right-0 mb-2 bg-neutral-900/95 backdrop-blur-xl rounded-2xl border border-neutral-800/50 p-3 shadow-xl z-10">
          <div className="flex flex-col gap-2 min-w-[250px]">
            <div className="text-sm text-neutral-400 mb-2 px-2">
              Collaboration Tools
            </div>

            <button
              onClick={handleCollaborationShare}
              className="social-share-btn copy"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
              </svg>
              Copy Collaboration Link
            </button>

            <button
              onClick={() =>
                copyToClipboard(
                  `🎵 ${shareText}\n\n${currentTimestampUrl}\n\nLet's collaborate on this track!`
                )
              }
              className="social-share-btn copy"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              Copy with Message
            </button>

            <button
              onClick={() =>
                copyToClipboard(
                  `Feedback needed on "${shareText}" at ${formatTime(
                    currentTime
                  )}: ${currentTimestampUrl}`
                )
              }
              className="social-share-btn copy"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14,2 14,8 20,8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10,9 9,9 8,9" />
              </svg>
              Request Feedback
            </button>

            <div className="border-t border-neutral-800/50 my-2"></div>

            <div className="text-xs text-neutral-500 px-2">
              {currentTime > 0
                ? `Current position: ${formatTime(currentTime)}`
                : "No timestamp selected"}
            </div>
          </div>
        </div>
      )}

      {/* Backdrop to close dropdowns */}
      {(showSocialOptions || showCollaborationOptions) && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => {
            setShowSocialOptions(false);
            setShowCollaborationOptions(false);
          }}
        />
      )}
    </div>
  );
}
