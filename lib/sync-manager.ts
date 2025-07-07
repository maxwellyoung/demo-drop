import { readdir, stat, readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { storageManager } from "./storage-manager";
import { fileExistsInR2, getR2FileMetadata } from "./r2-client";
import { log } from "./logger";

export interface SyncStatus {
  filename: string;
  localPath: string;
  localSize: number;
  localModified: Date;
  cloudExists: boolean;
  cloudSize?: number;
  cloudModified?: Date;
  needsSync: boolean;
  syncReason?: "new" | "modified" | "missing" | "size_mismatch";
  lastSyncAttempt?: Date;
  syncError?: string;
}

export interface SyncProgress {
  total: number;
  synced: number;
  failed: number;
  pending: number;
  currentFile?: string;
  progress: number; // 0-100
}

export interface SyncResult {
  success: boolean;
  synced: string[];
  failed: string[];
  skipped: string[];
  totalTime: number;
  errors: string[];
}

export class SyncManager {
  private syncHistory: Map<string, Date> = new Map();
  private syncErrors: Map<string, string> = new Map();

  // Get comprehensive sync status for all files
  async getSyncStatus(): Promise<SyncStatus[]> {
    const localTracks = await storageManager.getLocalTracks();
    const status: SyncStatus[] = [];

    for (const track of localTracks) {
      const cloudExists = await fileExistsInR2(`tracks/${track.filename}`);
      let cloudMetadata = null;

      if (cloudExists) {
        cloudMetadata = await getR2FileMetadata(`tracks/${track.filename}`);
      }

      const needsSync = this.needsSync(track, cloudExists, cloudMetadata);
      const syncReason = this.getSyncReason(track, cloudExists, cloudMetadata);

      status.push({
        filename: track.filename,
        localPath: track.filePath,
        localSize: track.size,
        localModified: track.modifiedAt,
        cloudExists,
        cloudSize: cloudMetadata?.size,
        cloudModified: cloudMetadata?.lastModified,
        needsSync,
        syncReason,
        lastSyncAttempt: this.syncHistory.get(track.filename),
        syncError: this.syncErrors.get(track.filename),
      });
    }

    return status.sort((a, b) => {
      // Sort by sync priority: failed > needs sync > synced
      if (a.syncError && !b.syncError) return -1;
      if (!a.syncError && b.syncError) return 1;
      if (a.needsSync && !b.needsSync) return -1;
      if (!a.needsSync && b.needsSync) return 1;
      return a.filename.localeCompare(b.filename);
    });
  }

  // Check if a file needs syncing
  private needsSync(
    localTrack: { filename: string; size: number; modifiedAt: Date },
    cloudExists: boolean,
    cloudMetadata: { size?: number; lastModified?: Date } | null
  ): boolean {
    // File doesn't exist in cloud
    if (!cloudExists) return true;

    // Size mismatch
    if (cloudMetadata?.size !== localTrack.size) return true;

    // Local file is newer (with 1 second tolerance)
    if (cloudMetadata?.lastModified) {
      const localTime = localTrack.modifiedAt.getTime();
      const cloudTime = new Date(cloudMetadata.lastModified).getTime();
      if (localTime > cloudTime + 1000) return true;
    }

    // Previous sync failed
    if (this.syncErrors.has(localTrack.filename)) return true;

    return false;
  }

  // Get reason for sync
  private getSyncReason(
    localTrack: { filename: string; size: number; modifiedAt: Date },
    cloudExists: boolean,
    cloudMetadata: { size?: number; lastModified?: Date } | null
  ): "new" | "modified" | "missing" | "size_mismatch" | undefined {
    if (!cloudExists) return "new";
    if (cloudMetadata?.size !== localTrack.size) return "size_mismatch";
    if (this.syncErrors.has(localTrack.filename)) return "missing";
    if (cloudMetadata?.lastModified) {
      const localTime = localTrack.modifiedAt.getTime();
      const cloudTime = new Date(cloudMetadata.lastModified).getTime();
      if (localTime > cloudTime + 1000) return "modified";
    }
    return undefined;
  }

  // Sync files with progress reporting
  async syncFiles(
    onProgress?: (progress: SyncProgress) => void,
    forceSync?: boolean
  ): Promise<SyncResult> {
    const startTime = Date.now();
    const status = await this.getSyncStatus();

    const filesToSync = forceSync ? status : status.filter((s) => s.needsSync);

    const result: SyncResult = {
      success: true,
      synced: [],
      failed: [],
      skipped: [],
      totalTime: 0,
      errors: [],
    };

    let synced = 0;
    let failed = 0;

    for (let i = 0; i < filesToSync.length; i++) {
      const fileStatus = filesToSync[i];

      // Report progress
      if (onProgress) {
        onProgress({
          total: filesToSync.length,
          synced,
          failed,
          pending: filesToSync.length - i,
          currentFile: fileStatus.filename,
          progress: Math.round((i / filesToSync.length) * 100),
        });
      }

      try {
        // Upload to R2
        await storageManager.uploadToR2(
          fileStatus.localPath,
          fileStatus.filename
        );

        // Update sync history
        this.syncHistory.set(fileStatus.filename, new Date());
        this.syncErrors.delete(fileStatus.filename);

        result.synced.push(fileStatus.filename);
        synced++;

        log.info(`File synced successfully`, { filename: fileStatus.filename });
      } catch (error: any) {
        log.error(`Failed to sync file`, {
          filename: fileStatus.filename,
          error,
        });

        this.syncErrors.set(fileStatus.filename, error.message);
        result.failed.push(fileStatus.filename);
        result.errors.push(`${fileStatus.filename}: ${error.message}`);
        failed++;

        result.success = false;
      }
    }

    result.totalTime = Date.now() - startTime;
    result.skipped = status.filter((s) => !s.needsSync).map((s) => s.filename);

    return result;
  }

  // Sync specific files
  async syncSpecificFiles(filenames: string[]): Promise<SyncResult> {
    const startTime = Date.now();
    const result: SyncResult = {
      success: true,
      synced: [],
      failed: [],
      skipped: [],
      totalTime: 0,
      errors: [],
    };

    for (const filename of filenames) {
      try {
        const localPath = path.join(
          storageManager["config"].localPath!,
          filename
        );

        if (!existsSync(localPath)) {
          result.failed.push(filename);
          result.errors.push(`${filename}: File not found locally`);
          continue;
        }

        await storageManager.uploadToR2(localPath, filename);
        this.syncHistory.set(filename, new Date());
        this.syncErrors.delete(filename);

        result.synced.push(filename);
        log.info(`File synced successfully`, { filename });
      } catch (error: any) {
        log.error(`Failed to sync file`, { filename, error });

        this.syncErrors.set(filename, error.message);
        result.failed.push(filename);
        result.errors.push(`${filename}: ${error.message}`);
        result.success = false;
      }
    }

    result.totalTime = Date.now() - startTime;
    return result;
  }

  // Remove files from cloud that no longer exist locally
  async cleanupCloudFiles(): Promise<{ removed: string[]; errors: string[] }> {
    const localTracks = await storageManager.getLocalTracks();
    const localFilenames = new Set(localTracks.map((t) => t.filename));

    // This would require listing all files in R2 bucket
    // For now, we'll just return empty arrays
    // TODO: Implement R2 list operation
    return { removed: [], errors: [] };
  }

  // Get sync statistics
  async getSyncStats() {
    const status = await this.getSyncStatus();

    return {
      total: status.length,
      synced: status.filter((s) => !s.needsSync && !s.syncError).length,
      needsSync: status.filter((s) => s.needsSync).length,
      failed: status.filter((s) => s.syncError).length,
      lastSync:
        status.length > 0
          ? Math.max(...status.map((s) => s.lastSyncAttempt?.getTime() || 0))
          : null,
    };
  }

  // Clear sync errors for retry
  clearSyncErrors(filenames?: string[]) {
    if (filenames) {
      filenames.forEach((filename) => this.syncErrors.delete(filename));
    } else {
      this.syncErrors.clear();
    }
  }
}

// Create singleton instance
export const syncManager = new SyncManager();
