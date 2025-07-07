"use client";

import { useState, useEffect } from "react";
import { SyncStatus } from "@/lib/sync-manager";

interface CloudStorageManagerProps {
  onUploadComplete?: () => void;
}

export default function CloudStorageManager({
  onUploadComplete,
}: CloudStorageManagerProps) {
  const [files, setFiles] = useState<SyncStatus[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());
  const [deletingFiles, setDeletingFiles] = useState<Set<string>>(new Set());
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());

  // Load file status
  const loadFiles = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/sync");
      const data = await response.json();
      setFiles(data.status || []);
    } catch (error) {
      console.error("Failed to load files:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Upload files to cloud
  const uploadFiles = async (filenames: string[]) => {
    setUploadingFiles(new Set(filenames));
    try {
      const response = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ specificFiles: filenames }),
      });

      if (response.ok) {
        await loadFiles();
        onUploadComplete?.();
      }
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploadingFiles(new Set());
      setSelectedFiles(new Set());
    }
  };

  // Delete files from cloud
  const deleteFiles = async (filenames: string[]) => {
    setDeletingFiles(new Set(filenames));
    try {
      const response = await fetch("/api/cloud/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files: filenames }),
      });

      if (response.ok) {
        await loadFiles();
      }
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setDeletingFiles(new Set());
      setSelectedFiles(new Set());
    }
  };

  // Handle file selection
  const toggleFileSelection = (filename: string) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(filename)) {
      newSelected.delete(filename);
    } else {
      newSelected.add(filename);
    }
    setSelectedFiles(newSelected);
  };

  // Select all files of a certain type
  const selectAll = (type: "local" | "cloud" | "failed") => {
    const filesToSelect = files
      .filter((file) => {
        if (type === "local") return !file.cloudExists;
        if (type === "cloud") return file.cloudExists;
        if (type === "failed") return file.syncError;
        return false;
      })
      .map((f) => f.filename);
    setSelectedFiles(new Set(filesToSelect));
  };

  useEffect(() => {
    loadFiles();
  }, []);

  const localFiles = files.filter((f) => !f.cloudExists);
  const cloudFiles = files.filter((f) => f.cloudExists);
  const failedFiles = files.filter((f) => f.syncError);

  return (
    <div className="bg-neutral-900/30 backdrop-blur-sm rounded-xl border border-neutral-800/30 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-neutral-100">Cloud Storage</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => loadFiles()}
            disabled={isLoading}
            className="p-2 text-xs bg-neutral-800/50 hover:bg-neutral-800 rounded transition-colors disabled:opacity-50"
          >
            {isLoading ? "⟳" : "↻"}
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="flex items-center gap-4 mb-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span className="text-blue-400">{localFiles.length} local only</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-green-400">{cloudFiles.length} in cloud</span>
        </div>
        {failedFiles.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-red-400">{failedFiles.length} failed</span>
          </div>
        )}
      </div>

      {/* Local Files Section */}
      {localFiles.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-medium text-neutral-300">
              Local Files
            </h4>
            <div className="flex items-center gap-2">
              <button
                onClick={() => selectAll("local")}
                className="text-xs text-blue-400 hover:text-blue-300"
              >
                Select All
              </button>
              {selectedFiles.size > 0 && (
                <button
                  onClick={() => uploadFiles(Array.from(selectedFiles))}
                  disabled={uploadingFiles.size > 0}
                  className="px-2 py-1 text-xs bg-blue-600/80 hover:bg-blue-600 text-white rounded transition-colors disabled:opacity-50"
                >
                  Upload Selected ({selectedFiles.size})
                </button>
              )}
            </div>
          </div>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {localFiles.slice(0, 5).map((file) => (
              <div
                key={file.filename}
                className="flex items-center gap-2 p-2 rounded border border-blue-500/30 bg-blue-500/10 text-xs"
              >
                <input
                  type="checkbox"
                  checked={selectedFiles.has(file.filename)}
                  onChange={() => toggleFileSelection(file.filename)}
                  className="rounded border-neutral-600 bg-neutral-800"
                />
                <div className="flex-1 truncate text-neutral-200">
                  {file.filename}
                </div>
                <div className="text-neutral-400">
                  {(file.localSize / 1024 / 1024).toFixed(1)} MB
                </div>
                {uploadingFiles.has(file.filename) && (
                  <div className="text-blue-400">Uploading...</div>
                )}
              </div>
            ))}
            {localFiles.length > 5 && (
              <div className="text-center text-xs text-neutral-400 py-1">
                ... and {localFiles.length - 5} more local files
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cloud Files Section */}
      {cloudFiles.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-medium text-neutral-300">
              Cloud Files
            </h4>
            <div className="flex items-center gap-2">
              <button
                onClick={() => selectAll("cloud")}
                className="text-xs text-green-400 hover:text-green-300"
              >
                Select All
              </button>
              {selectedFiles.size > 0 && (
                <button
                  onClick={() => deleteFiles(Array.from(selectedFiles))}
                  disabled={deletingFiles.size > 0}
                  className="px-2 py-1 text-xs bg-red-600/80 hover:bg-red-600 text-white rounded transition-colors disabled:opacity-50"
                >
                  Delete Selected ({selectedFiles.size})
                </button>
              )}
            </div>
          </div>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {cloudFiles.slice(0, 5).map((file) => (
              <div
                key={file.filename}
                className="flex items-center gap-2 p-2 rounded border border-green-500/30 bg-green-500/10 text-xs"
              >
                <input
                  type="checkbox"
                  checked={selectedFiles.has(file.filename)}
                  onChange={() => toggleFileSelection(file.filename)}
                  className="rounded border-neutral-600 bg-neutral-800"
                />
                <div className="flex-1 truncate text-neutral-200">
                  {file.filename}
                </div>
                <div className="text-neutral-400">
                  {file.cloudSize
                    ? `${(file.cloudSize / 1024 / 1024).toFixed(1)} MB`
                    : "Unknown size"}
                </div>
                {deletingFiles.has(file.filename) && (
                  <div className="text-red-400">Deleting...</div>
                )}
              </div>
            ))}
            {cloudFiles.length > 5 && (
              <div className="text-center text-xs text-neutral-400 py-1">
                ... and {cloudFiles.length - 5} more cloud files
              </div>
            )}
          </div>
        </div>
      )}

      {/* Failed Files Section */}
      {failedFiles.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-medium text-neutral-300">
              Failed Uploads
            </h4>
            <div className="flex items-center gap-2">
              <button
                onClick={() => selectAll("failed")}
                className="text-xs text-red-400 hover:text-red-300"
              >
                Select All
              </button>
              {selectedFiles.size > 0 && (
                <button
                  onClick={() => uploadFiles(Array.from(selectedFiles))}
                  disabled={uploadingFiles.size > 0}
                  className="px-2 py-1 text-xs bg-red-600/80 hover:bg-red-600 text-white rounded transition-colors disabled:opacity-50"
                >
                  Retry Selected ({selectedFiles.size})
                </button>
              )}
            </div>
          </div>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {failedFiles.slice(0, 5).map((file) => (
              <div
                key={file.filename}
                className="flex items-center gap-2 p-2 rounded border border-red-500/30 bg-red-500/10 text-xs"
              >
                <input
                  type="checkbox"
                  checked={selectedFiles.has(file.filename)}
                  onChange={() => toggleFileSelection(file.filename)}
                  className="rounded border-neutral-600 bg-neutral-800"
                />
                <div className="flex-1 truncate text-neutral-200">
                  {file.filename}
                </div>
                <div
                  className="text-red-400 text-xs truncate max-w-24"
                  title={file.syncError}
                >
                  {file.syncError}
                </div>
                {uploadingFiles.has(file.filename) && (
                  <div className="text-red-400">Retrying...</div>
                )}
              </div>
            ))}
            {failedFiles.length > 5 && (
              <div className="text-center text-xs text-neutral-400 py-1">
                ... and {failedFiles.length - 5} more failed files
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {files.length === 0 && !isLoading && (
        <div className="text-center py-8 text-neutral-400">
          <div className="text-2xl mb-2">☁️</div>
          <div className="text-sm">No files found</div>
        </div>
      )}
    </div>
  );
}
