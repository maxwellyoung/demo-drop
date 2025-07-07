"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X } from "lucide-react";
import pb from "../lib/pocketbase";

interface GlobalUploadZoneProps {
  children: React.ReactNode;
}

export default function GlobalUploadZone({ children }: GlobalUploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showUploadButton, setShowUploadButton] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const acceptedTypes = [".mp3", ".wav", ".m4a", ".flac"];

  // Show upload button when scrolling down
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setShowUploadButton(scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Global drag and drop handlers
  const handleGlobalDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer?.types.includes("Files")) {
      setIsDragOver(true);
    }
  }, []);

  const handleGlobalDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    // Only hide if we're leaving the window entirely
    if (
      e.clientX <= 0 ||
      e.clientY <= 0 ||
      e.clientX >= window.innerWidth ||
      e.clientY >= window.innerHeight
    ) {
      setIsDragOver(false);
    }
  }, []);

  const handleGlobalDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer?.files || []);
    const audioFile = files.find((file) =>
      acceptedTypes.some((type) =>
        file.name.toLowerCase().endsWith(type.substring(1))
      )
    );

    if (audioFile) {
      uploadFile(audioFile);
    }
  }, []);

  // Set up global event listeners
  useEffect(() => {
    document.addEventListener("dragover", handleGlobalDragOver);
    document.addEventListener("dragleave", handleGlobalDragLeave);
    document.addEventListener("drop", handleGlobalDrop);

    return () => {
      document.removeEventListener("dragover", handleGlobalDragOver);
      document.removeEventListener("dragleave", handleGlobalDragLeave);
      document.removeEventListener("drop", handleGlobalDrop);
    };
  }, [handleGlobalDragOver, handleGlobalDragLeave, handleGlobalDrop]);

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
    <>
      {children}

      {/* Global Drag Overlay */}
      <AnimatePresence>
        {isDragOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-blue-500/20 backdrop-blur-sm border-2 border-dashed border-blue-400/50"
          >
            <div className="flex items-center justify-center h-full">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="text-center p-12 bg-neutral-900/90 backdrop-blur-xl rounded-3xl border border-blue-400/30"
              >
                <motion.div
                  className="text-8xl mb-6"
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  🎵
                </motion.div>
                <h2 className="text-3xl font-light text-white mb-4">
                  Drop your audio file here
                </h2>
                <p className="text-blue-200 text-lg">
                  Release to upload your demo
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Upload Button */}
      <AnimatePresence>
        {showUploadButton && !isUploading && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            onClick={() => fileInputRef.current?.click()}
            className="fixed bottom-20 right-6 z-40 w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full shadow-2xl border border-white/20 backdrop-blur-xl flex items-center justify-center transition-all duration-200 hover:scale-110"
            title="Upload new track"
          >
            <Upload className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Upload Progress Overlay */}
      <AnimatePresence>
        {isUploading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-40 w-80 bg-neutral-900/95 backdrop-blur-xl rounded-2xl border border-neutral-800/50 p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-medium">Uploading...</h3>
              <button
                onClick={() => setIsUploading(false)}
                className="text-neutral-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="w-full bg-neutral-800 rounded-full h-2">
                <motion.div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
              <p className="text-sm text-neutral-400">
                {uploadProgress}% complete
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(",")}
        onChange={handleFileSelect}
        className="hidden"
      />
    </>
  );
}
