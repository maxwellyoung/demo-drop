"use client";

import { useState, useEffect } from "react";

export default function CloudManager() {
  const [files, setFiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Set<string>>(new Set());

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

  const uploadFiles = async (filenames: string[]) => {
    setUploading(new Set(filenames));
    try {
      await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ specificFiles: filenames }),
      });
      await loadFiles();
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(new Set());
      setSelected(new Set());
    }
  };

  const deleteFiles = async (filenames: string[]) => {
    setDeleting(new Set(filenames));
    try {
      await fetch("/api/cloud/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files: filenames }),
      });
      await loadFiles();
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setDeleting(new Set());
      setSelected(new Set());
    }
  };

  const toggleSelection = (filename: string) => {
    const newSelected = new Set(selected);
    if (newSelected.has(filename)) {
      newSelected.delete(filename);
    } else {
      newSelected.add(filename);
    }
    setSelected(newSelected);
  };

  useEffect(() => {
    loadFiles();
  }, []);

  const localFiles = files.filter((f) => !f.cloudExists);
  const cloudFiles = files.filter((f) => f.cloudExists);

  return (
    <div className="bg-neutral-900/30 backdrop-blur-sm rounded-xl border border-neutral-800/30 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-neutral-100">Cloud Storage</h3>
        <button
          onClick={() => loadFiles()}
          disabled={isLoading}
          className="p-2 text-xs bg-neutral-800/50 hover:bg-neutral-800 rounded"
        >
          {isLoading ? "⟳" : "↻"}
        </button>
      </div>

      {/* Local Files */}
      {localFiles.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-medium text-neutral-300">
              Local Files ({localFiles.length})
            </h4>
            {selected.size > 0 && (
              <button
                onClick={() => uploadFiles(Array.from(selected))}
                disabled={uploading.size > 0}
                className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded"
              >
                Upload Selected
              </button>
            )}
          </div>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {localFiles.slice(0, 5).map((file) => (
              <div
                key={file.filename}
                className="flex items-center gap-2 p-2 rounded border border-blue-500/30 bg-blue-500/10 text-xs"
              >
                <input
                  type="checkbox"
                  checked={selected.has(file.filename)}
                  onChange={() => toggleSelection(file.filename)}
                  className="rounded"
                />
                <div className="flex-1 truncate text-neutral-200">
                  {file.filename}
                </div>
                {uploading.has(file.filename) && (
                  <div className="text-blue-400">Uploading...</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cloud Files */}
      {cloudFiles.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-medium text-neutral-300">
              Cloud Files ({cloudFiles.length})
            </h4>
            {selected.size > 0 && (
              <button
                onClick={() => deleteFiles(Array.from(selected))}
                disabled={deleting.size > 0}
                className="px-2 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded"
              >
                Delete Selected
              </button>
            )}
          </div>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {cloudFiles.slice(0, 5).map((file) => (
              <div
                key={file.filename}
                className="flex items-center gap-2 p-2 rounded border border-green-500/30 bg-green-500/10 text-xs"
              >
                <input
                  type="checkbox"
                  checked={selected.has(file.filename)}
                  onChange={() => toggleSelection(file.filename)}
                  className="rounded"
                />
                <div className="flex-1 truncate text-neutral-200">
                  {file.filename}
                </div>
                {deleting.has(file.filename) ? (
                  <div className="text-red-400">Deleting...</div>
                ) : (
                  <div className="text-green-400">✓ Synced</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
