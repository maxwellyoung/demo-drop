"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function HomePage() {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [recentTracks, setRecentTracks] = useState([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Fetch recent tracks
  useEffect(() => {
    const fetchRecentTracks = async () => {
      try {
        const response = await fetch("/api/tracks/recent");
        if (response.ok) {
          const tracks = await response.json();
          setRecentTracks(tracks.slice(0, 3)); // Show only 3 most recent
        }
      } catch (error) {
        console.error("Failed to fetch recent tracks:", error);
      }
    };

    fetchRecentTracks();
  }, []);

  const acceptedTypes = [".mp3", ".wav", ".m4a", ".flac"];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const audioFile = files.find((file) =>
      acceptedTypes.some((type) =>
        file.name.toLowerCase().endsWith(type.substring(1))
      )
    );

    if (audioFile) {
      uploadFile(audioFile);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadFile(file);
    }
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);

    // Show progress simulation for better UX
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => Math.min(prev + 10, 90));
    }, 200);

    const formData = new FormData();
    formData.append("audio", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.ok) {
        const { slug } = await response.json();
        router.push(`/track/${slug}`);
      } else {
        const error = await response.json();
        alert(`Upload failed: ${error.error || "Unknown error"}`);
      }
    } catch (error) {
      clearInterval(progressInterval);
      console.error("Upload error:", error);
      alert("Upload failed. Please check your connection and try again.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center">
      <div className="text-center mb-20 container-narrow">
        <h1 className="heading-xl mb-6 bg-gradient-to-b from-neutral-50 to-neutral-400 bg-clip-text text-transparent">
          Demo Drop
        </h1>
        <p className="text-secondary text-lg md:text-xl font-light">
          Drop your demo.
        </p>
      </div>

      {isUploading ? (
        <div className="container-narrow w-full max-w-md">
          <div className="audio-player p-10 text-center">
            <div className="text-4xl mb-6 animate-pulse">🎵</div>
            <p className="text-secondary mb-6 font-light">
              Uploading your demo...
            </p>
            <div className="upload-progress">
              <div
                className="upload-progress-bar"
                style={{
                  width: `${uploadProgress}%`,
                  transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              />
            </div>
            <p className="text-xs text-neutral-500 mt-3">
              {uploadProgress}% complete
            </p>
          </div>
        </div>
      ) : (
        <div className="container-narrow w-full max-w-lg">
          <div
            className={`drop-zone group ${isDragOver ? "drag-over" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="text-7xl mb-8 transition-transform duration-300 group-hover:scale-110">
              🎵
            </div>
            <p className="text-xl md:text-2xl mb-3 font-light tracking-tight">
              Drop your audio file here
            </p>
            <p className="text-secondary text-sm mb-8 font-light">
              or click to browse files
            </p>

            <div className="flex flex-wrap justify-center gap-2 text-xs text-neutral-600">
              {acceptedTypes.map((type, index) => (
                <span
                  key={type}
                  className="px-2 py-1 bg-neutral-900/50 rounded-md border border-neutral-800/50"
                >
                  {type.toUpperCase()}
                </span>
              ))}
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedTypes.join(",")}
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}

      {/* Recently Added Section */}
      {recentTracks.length > 0 && (
        <div className="mt-24 container-narrow">
          <div className="text-center mb-12">
            <h2 className="heading-lg mb-4 text-neutral-200">Recently Added</h2>
            <p className="text-secondary">Latest demos from the community</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentTracks.map((track: any) => (
              <Link
                key={track.slug}
                href={`/track/${track.slug}`}
                className="recent-track-card group"
              >
                <div className="recent-track-artwork">
                  <div className="w-full h-32 bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-xl flex items-center justify-center">
                    <div className="text-2xl opacity-60">🎵</div>
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-neutral-100 group-hover:text-neutral-50 transition-colors">
                    {track.title}
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1">
                    {track.artist}
                  </p>
                  <p className="text-xs text-neutral-500 mt-2">
                    {new Date(track.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link href="/tracks" className="btn-secondary">
              View All Tracks
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
