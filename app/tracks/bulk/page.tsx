"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import BulkTrackTable from "../../../components/BulkTrackTable";
import { Trash2, Edit, Play, AlertTriangle } from "lucide-react";

interface Track {
  id: string;
  title: string;
  artist?: string;
  album?: string;
  duration?: number;
  filename: string;
  uploadedAt: string;
  metadata?: any;
}

export default function BulkTracksPage() {
  const router = useRouter();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [tracksToDelete, setTracksToDelete] = useState<string[]>([]);

  useEffect(() => {
    loadTracks();
  }, []);

  const loadTracks = async () => {
    try {
      const response = await fetch("/api/tracks/recent");
      const data = await response.json();
      setTracks(data.tracks || []);
    } catch (error) {
      console.error("Failed to load tracks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (trackIds: string[]) => {
    if (trackIds.length === 1) {
      // Single track delete
      await deleteTracks(trackIds);
    } else {
      // Bulk delete - show confirmation
      setTracksToDelete(trackIds);
      setShowDeleteConfirm(true);
    }
  };

  const deleteTracks = async (trackIds: string[]) => {
    try {
      const promises = trackIds.map((id) =>
        fetch(`/api/tracks/${id}`, { method: "DELETE" })
      );
      await Promise.all(promises);

      // Remove from local state
      setTracks((prev) => prev.filter((track) => !trackIds.includes(track.id)));

      if (showDeleteConfirm) {
        setShowDeleteConfirm(false);
        setTracksToDelete([]);
      }
    } catch (error) {
      console.error("Failed to delete tracks:", error);
    }
  };

  const handleEdit = (trackId: string) => {
    // Navigate to edit page or open edit modal
    router.push(`/track/${trackId}`);
  };

  const handleTrackClick = (trackId: string) => {
    router.push(`/track/${trackId}`);
  };

  const handlePlay = (trackId: string) => {
    // Implement play functionality
    console.log("Playing track:", trackId);
  };

  const handleBulkEdit = (trackIds: string[]) => {
    // Implement bulk edit functionality
    console.log("Bulk editing tracks:", trackIds);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Track Manager</h1>
        <p className="text-gray-600">
          Efficiently manage your tracks with bulk editing capabilities
        </p>
      </div>

      <BulkTrackTable
        tracks={tracks}
        onDelete={handleDelete}
        onEdit={handleEdit}
        onPlay={handlePlay}
        onBulkEdit={handleBulkEdit}
        onTrackClick={handleTrackClick}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="text-red-500" size={24} />
              <h3 className="text-lg font-semibold">Confirm Deletion</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete {tracksToDelete.length} track
              {tracksToDelete.length > 1 ? "s" : ""}? This action cannot be
              undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteTracks(tracksToDelete)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
              >
                <Trash2 size={16} />
                Delete {tracksToDelete.length} Track
                {tracksToDelete.length > 1 ? "s" : ""}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
