"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import SmartCollections from "@/components/SmartCollections";
import {
  IridescentButton,
  IridescentCard,
  IridescentIcon,
  NoiseBackground,
  generateColorPalette,
} from "../../components/BrandIdentity";

interface Comment {
  id: string;
  time: number;
  text: string;
  author: string;
  timestamp: string;
}

interface Collection {
  id: string;
  name: string;
  type: "smart" | "manual";
  filter: string;
  color: string;
  count: number;
}

const WaveformPlayer = dynamic(
  () => import("../../components/WaveformPlayer"),
  { ssr: false }
);

export default function DemoPage() {
  const [comments, setComments] = useState<Comment[]>([
    {
      id: "1",
      time: 15.5,
      text: "Great bass line here!",
      author: "Maxwell",
      timestamp: "2024-01-15T10:30:00Z",
    },
    {
      id: "2",
      time: 45.2,
      text: "Mix needs more compression",
      author: "Maxwell",
      timestamp: "2024-01-15T10:31:00Z",
    },
  ]);

  const [collections, setCollections] = useState<Collection[]>([
    {
      id: "client-mixes",
      name: "Client Mixes",
      type: "manual",
      filter: "tag:client",
      color: "#10b981",
      count: 12,
    },
    {
      id: "personal-projects",
      name: "Personal Projects",
      type: "manual",
      filter: "tag:personal",
      color: "#8b5cf6",
      count: 8,
    },
  ]);

  const [activeCollection, setActiveCollection] = useState<string | null>(null);

  const handleAddComment = (time: number, text: string) => {
    const newComment: Comment = {
      id: Date.now().toString(),
      time,
      text,
      author: "Maxwell",
      timestamp: new Date().toISOString(),
    };
    setComments([...comments, newComment]);
  };

  const handleCreateCollection = (
    name: string,
    filter: string,
    color: string
  ) => {
    const newCollection: Collection = {
      id: Date.now().toString(),
      name,
      type: "manual",
      filter,
      color,
      count: 0,
    };
    setCollections([...collections, newCollection]);
  };

  const handleDeleteCollection = (collectionId: string) => {
    setCollections(collections.filter((c) => c.id !== collectionId));
  };

  return (
    <div className="min-h-screen">
      <NoiseBackground className="absolute inset-0" />
      <div className="relative z-10 max-w-7xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent mb-8">
            DemoDrop v2 - New Features Demo
          </h1>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Smart Collections Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-96">
              <SmartCollections
                collections={collections}
                activeCollection={activeCollection}
                onCollectionSelect={setActiveCollection}
                onCreateCollection={handleCreateCollection}
                onDeleteCollection={handleDeleteCollection}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Waveform Player Demo */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Waveform Player with Comments
              </h2>
              <p className="text-gray-600 mb-4">
                Click on the waveform to add timestamped comments. Use the loop
                controls for A/B comparison.
              </p>

              <WaveformPlayer
                audioUrl="/uploads/sample-track.mp3"
                peaksUrl="/uploads/sample-track-peaks.json"
                duration={180}
                comments={comments}
                onAddComment={handleAddComment}
                className="w-full"
              />

              {/* Comments List */}
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Comments
                </h3>
                <div className="space-y-2">
                  {comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-medium text-gray-900">
                            {comment.author}
                          </span>
                          <span className="text-xs text-gray-500">
                            {Math.floor(comment.time / 60)}:
                            {(comment.time % 60).toFixed(1).padStart(4, "0")}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{comment.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Enhanced Track Row Demo */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Enhanced Track Row
              </h2>
              <p className="text-gray-600 mb-4">
                Track rows now show duration, bitrate, and have better action
                hierarchy.
              </p>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-4">
                  {/* Artwork */}
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                    DD
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      Demo Track v2
                    </div>
                    <div className="text-sm text-gray-600">Maxwell</div>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-gray-500">3:45</span>
                      <span className="text-xs text-gray-500">192kbps</span>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        Electronic
                      </span>
                      <span className="text-xs bg-blue-100 px-2 py-1 rounded">
                        128 BPM
                      </span>
                      <span className="text-xs bg-purple-100 px-2 py-1 rounded">
                        C Major
                      </span>
                      <span className="text-xs text-gray-400">1/15/2024</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <button className="w-10 h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center transition-colors">
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M6 4l12 6-12 6V4z" />
                      </svg>
                    </button>

                    <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                      </svg>
                    </button>

                    <div className="relative group">
                      <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Brand Identity Demo */}
            <IridescentCard className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Brand Identity - Iridescent Design System
              </h2>
              <p className="text-gray-600 mb-6">
                New iridescent color scheme and micro-animations for a unique
                brand identity.
              </p>

              <div className="space-y-6">
                {/* Buttons */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    Iridescent Buttons
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    <IridescentButton variant="primary" size="sm">
                      Primary Small
                    </IridescentButton>
                    <IridescentButton variant="primary" size="md">
                      Primary Medium
                    </IridescentButton>
                    <IridescentButton variant="secondary" size="md">
                      Secondary
                    </IridescentButton>
                    <IridescentButton variant="ghost" size="md">
                      Ghost
                    </IridescentButton>
                  </div>
                </div>

                {/* Color Palette */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    Generative Color Palettes
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {["Track 1", "Track 2", "Track 3", "Track 4"].map(
                      (track, index) => {
                        const palette = generateColorPalette(track);
                        return (
                          <div key={index} className="text-center">
                            <div className="flex h-16 rounded-lg overflow-hidden mb-2">
                              {palette.map((color, colorIndex) => (
                                <div
                                  key={colorIndex}
                                  className="flex-1"
                                  style={{ backgroundColor: color }}
                                />
                              ))}
                            </div>
                            <p className="text-xs text-gray-600">{track}</p>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>

                {/* Icons */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    Animated Icons
                  </h3>
                  <div className="flex gap-4">
                    <IridescentIcon color="#8b5cf6" className="w-8 h-8">
                      <svg fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6 4l12 6-12 6V4z" />
                      </svg>
                    </IridescentIcon>
                    <IridescentIcon color="#3b82f6" className="w-8 h-8">
                      <svg fill="currentColor" viewBox="0 0 20 20">
                        <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                      </svg>
                    </IridescentIcon>
                    <IridescentIcon color="#06b6d4" className="w-8 h-8">
                      <svg fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </IridescentIcon>
                    <IridescentIcon color="#10b981" className="w-8 h-8">
                      <svg fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                      </svg>
                    </IridescentIcon>
                  </div>
                </div>
              </div>
            </IridescentCard>

            {/* Upload Pipeline Info */}
            <IridescentCard>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Upload Pipeline v2
              </h2>
              <p className="text-gray-600 mb-4">
                New uploads now automatically generate:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">
                    Audio Processing
                  </h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• 192k MP3 for streaming</li>
                    <li>• Metadata extraction</li>
                    <li>• Waveform peaks generation</li>
                    <li>• Spectral thumbnails</li>
                  </ul>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-medium text-green-900 mb-2">
                    Enhanced Metadata
                  </h3>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• Duration & bitrate</li>
                    <li>• Sample rate & channels</li>
                    <li>• File format detection</li>
                    <li>• Upload timestamps</li>
                  </ul>
                </div>
              </div>
            </IridescentCard>
          </div>
        </div>
      </div>
    </div>
  );
}
