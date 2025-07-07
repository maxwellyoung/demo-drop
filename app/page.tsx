"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { PageTransition, StaggeredContent } from "../components/PageTransition";
import {
  FadeIn,
  AnimatedButton,
} from "../components/animations/MotionComponents";
import pb from "@demodrop/shared/src/pocketbase";

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

    const formData = new FormData();
    formData.append("audio", file);
    formData.append("title", file.name.replace(/\.[^/.]+$/, ""));

    try {
      const createdRecord = await pb.collection("tracks").create(formData, {
        onUploadProgress: (progress: { loaded: number; total: number }) => {
          setUploadProgress(
            Math.round((progress.loaded / progress.total) * 100)
          );
        },
      });

      router.push(`/track/${createdRecord.id}`);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed. Please check the console for details.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-[85vh] flex flex-col items-center justify-center">
        <StaggeredContent>
          <div className="text-center mb-20 container-narrow">
            <motion.h1
              className="heading-xl mb-6 bg-gradient-to-b from-neutral-50 to-neutral-400 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Demo Drop
            </motion.h1>
            <motion.p
              className="text-secondary text-lg md:text-xl font-light"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Drop your demo.
            </motion.p>
          </div>
        </StaggeredContent>

        <AnimatePresence mode="wait">
          {isUploading ? (
            <motion.div
              key="uploading"
              className="container-narrow w-full max-w-md"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <div className="audio-player p-10 text-center">
                <motion.div
                  className="text-4xl mb-6"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  🎵
                </motion.div>
                <p className="text-secondary mb-6 font-light">
                  Uploading your demo...
                </p>
                <div className="upload-progress">
                  <motion.div
                    className="upload-progress-bar"
                    style={{ width: `${uploadProgress}%` }}
                    transition={{ duration: 0.1 }}
                  />
                </div>
                <p className="text-xs text-neutral-500 mt-3">
                  {uploadProgress}% complete
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="dropzone"
              className="container-narrow w-full max-w-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <motion.div
                className={`drop-zone group ${isDragOver ? "drag-over" : ""}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                <motion.div
                  className="text-7xl mb-8"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  🎵
                </motion.div>
                <p className="text-xl md:text-2xl mb-3 font-light tracking-tight">
                  Drop your audio file here
                </p>
                <p className="text-secondary text-sm mb-8 font-light">
                  or click to browse files
                </p>

                <div className="flex flex-wrap justify-center gap-2 text-xs text-neutral-600">
                  {acceptedTypes.map((type, index) => (
                    <motion.span
                      key={type}
                      className="px-2 py-1 bg-neutral-900/50 rounded-md border border-neutral-800/50"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.8 + index * 0.1 }}
                    >
                      {type.toUpperCase()}
                    </motion.span>
                  ))}
                </div>
              </motion.div>

              <input
                ref={fileInputRef}
                type="file"
                accept={acceptedTypes.join(",")}
                onChange={handleFileSelect}
                className="hidden"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
