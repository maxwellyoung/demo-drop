"use client";

import { useState, useEffect } from "react";
import {
  Trash2,
  Edit,
  Play,
  Pause,
  MoreHorizontal,
  Check,
  X,
} from "lucide-react";

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

interface BulkTrackTableProps {
  tracks: Track[];
  onDelete?: (trackIds: string[]) => void;
  onEdit?: (trackId: string) => void;
  onPlay?: (trackId: string) => void;
  onBulkEdit?: (trackIds: string[]) => void;
  onTrackClick?: (trackId: string) => void;
}

export default function BulkTrackTable({
  tracks,
  onDelete,
  onEdit,
  onPlay,
  onBulkEdit,
  onTrackClick,
}: BulkTrackTableProps) {
  const [selectedTracks, setSelectedTracks] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<keyof Track>("uploadedAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSelectAll, setIsSelectAll] = useState(false);

  // Sort tracks
  const sortedTracks = [...tracks].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  // Filter tracks
  const filteredTracks = sortedTracks.filter(
    (track) =>
      track.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      track.artist?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      track.album?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSort = (field: keyof Track) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleSelectAll = () => {
    if (isSelectAll) {
      setSelectedTracks(new Set());
      setIsSelectAll(false);
    } else {
      setSelectedTracks(new Set(filteredTracks.map((track) => track.id)));
      setIsSelectAll(true);
    }
  };

  const handleSelectTrack = (trackId: string) => {
    const newSelected = new Set(selectedTracks);
    if (newSelected.has(trackId)) {
      newSelected.delete(trackId);
    } else {
      newSelected.add(trackId);
    }
    setSelectedTracks(newSelected);
    setIsSelectAll(newSelected.size === filteredTracks.length);
  };

  const handleBulkDelete = () => {
    if (selectedTracks.size > 0 && onDelete) {
      onDelete(Array.from(selectedTracks));
      setSelectedTracks(new Set());
      setIsSelectAll(false);
    }
  };

  const handleBulkEdit = () => {
    if (selectedTracks.size > 0 && onBulkEdit) {
      onBulkEdit(Array.from(selectedTracks));
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB");
  };

  return (
    <div className="w-full">
      {/* Search and Bulk Actions */}
      <div className="flex items-center justify-between mb-4 gap-4">
        <div className="flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search tracks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {selectedTracks.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {selectedTracks.size} selected
            </span>
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <Trash2 size={16} />
              Delete
            </button>
            <button
              onClick={handleBulkEdit}
              className="flex items-center gap-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Edit size={16} />
              Edit
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={isSelectAll}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300"
                  />
                </th>
                <th
                  className="px-4 py-3 text-left cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("title")}
                >
                  <div className="flex items-center gap-1">
                    Title
                    {sortField === "title" && (
                      <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("artist")}
                >
                  <div className="flex items-center gap-1">
                    Artist
                    {sortField === "artist" && (
                      <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("album")}
                >
                  <div className="flex items-center gap-1">
                    Album
                    {sortField === "album" && (
                      <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("duration")}
                >
                  <div className="flex items-center gap-1">
                    Duration
                    {sortField === "duration" && (
                      <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("uploadedAt")}
                >
                  <div className="flex items-center gap-1">
                    Uploaded
                    {sortField === "uploadedAt" && (
                      <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTracks.map((track) => (
                <tr
                  key={track.id}
                  className="hover:bg-blue-50 transition-colors cursor-pointer group"
                  onClick={() =>
                    onTrackClick?.(track.id) ||
                    (window.location.href = `/track/${track.id}`)
                  }
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedTracks.has(track.id)}
                      onChange={() => handleSelectTrack(track.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="px-4 py-3 font-medium group-hover:text-blue-600 transition-colors">
                    <div className="flex items-center gap-2">
                      <span>{track.title}</span>
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-500">
                        →
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {track.artist || "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {track.album || "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {formatDuration(track.duration)}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {formatDate(track.uploadedAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div
                      className="flex items-center gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => onPlay?.(track.id)}
                        className="p-1 text-gray-600 hover:text-blue-600 transition-colors"
                        title="Play"
                      >
                        <Play size={16} />
                      </button>
                      <button
                        onClick={() => onEdit?.(track.id)}
                        className="p-1 text-gray-600 hover:text-green-600 transition-colors"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => onDelete?.([track.id])}
                        className="p-1 text-gray-600 hover:text-red-600 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTracks.length === 0 && (
          <div className="px-4 py-8 text-center text-gray-500">
            {searchTerm
              ? "No tracks found matching your search."
              : "No tracks available."}
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="mt-4 text-sm text-gray-600">
        Showing {filteredTracks.length} of {tracks.length} tracks
        {searchTerm && ` matching "${searchTerm}"`}
      </div>
    </div>
  );
}
