import { readdir, stat, readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { r2Client, fileExistsInR2, getR2PresignedUrl } from "./r2-client";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { log } from "./logger";
import { SUPPORTED_AUDIO_FORMATS, MIME_TYPES } from "../constants/audio";

export interface StorageConfig {
  type: "local" | "cloud" | "hybrid";
  localPath?: string;
  cloudBucket?: string;
  autoSync?: boolean;
}

export interface TrackLocation {
  local?: string;
  cloud?: string;
  primary: "local" | "cloud";
}

export class StorageManager {
  private config: StorageConfig;

  constructor(config: StorageConfig) {
    this.config = config;
  }

  // Get tracks from local storage
  async getLocalTracks(): Promise<any[]> {
    if (!this.config.localPath || !existsSync(this.config.localPath)) {
      return [];
    }

    const files = await readdir(this.config.localPath);
    const tracks = [];

    for (const file of files) {
      const filePath = path.join(this.config.localPath!, file);
      const fileExtension = path.extname(file).toLowerCase();

      if (SUPPORTED_AUDIO_FORMATS.includes(fileExtension as any)) {
        try {
          const stats = await stat(filePath);
          if (stats.isFile()) {
            tracks.push({
              filename: file,
              filePath,
              size: stats.size,
              modifiedAt: stats.mtime,
              type: this.getMimeType(fileExtension),
            });
          }
        } catch (error) {
          log.error(`Error processing file`, { file, error });
        }
      }
    }

    return tracks;
  }

  // Check if track exists in cloud
  async isTrackInCloud(filename: string): Promise<boolean> {
    if (this.config.type === "local") return false;

    const key = `tracks/${filename}`;
    return await fileExistsInR2(key);
  }

  // Upload track to R2
  async uploadToR2(filePath: string, filename: string): Promise<string> {
    if (this.config.type === "local") {
      throw new Error("Cloud storage not configured");
    }

    const key = `tracks/${filename}`;
    const fileBuffer = await readFile(filePath);
    const contentType = this.getMimeType(path.extname(filename));

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
      Metadata: {
        originalPath: filePath,
        uploadedAt: new Date().toISOString(),
      },
    });

    await r2Client.send(command);
    log.info(`File uploaded to R2 successfully`, { filename });
    return key;
  }

  // Get audio URL (local or cloud)
  async getAudioUrl(filename: string): Promise<string> {
    // If local storage is available and file exists locally
    if (this.config.localPath && this.config.type !== "cloud") {
      const localPath = path.join(this.config.localPath, filename);
      if (existsSync(localPath)) {
        return `/api/audio/${encodeURIComponent(filename)}`;
      }
    }

    // If cloud storage is configured
    if (this.config.type !== "local") {
      const key = `tracks/${filename}`;
      if (await fileExistsInR2(key)) {
        return await getR2PresignedUrl(key);
      }
    }

    throw new Error(`Audio file not found: ${filename}`);
  }

  // Sync local files to cloud
  async syncToCloud(): Promise<void> {
    if (this.config.type === "local" || !this.config.autoSync) {
      return;
    }

    const localTracks = await this.getLocalTracks();

    for (const track of localTracks) {
      const existsInCloud = await this.isTrackInCloud(track.filename);

      if (!existsInCloud) {
        try {
          await this.uploadToR2(track.filePath, track.filename);
          log.info(`Track synced to cloud successfully`, {
            filename: track.filename,
          });
        } catch (error) {
          log.error(`Failed to sync track to cloud`, {
            filename: track.filename,
            error,
          });
        }
      }
    }
  }

  // Get track location info
  async getTrackLocation(filename: string): Promise<TrackLocation> {
    const localExists =
      this.config.localPath &&
      existsSync(path.join(this.config.localPath, filename));

    const cloudExists = await this.isTrackInCloud(filename);

    if (localExists && cloudExists) {
      return {
        local: path.join(this.config.localPath!, filename),
        cloud: `tracks/${filename}`,
        primary: this.config.type === "hybrid" ? "local" : "cloud",
      };
    } else if (localExists) {
      return {
        local: path.join(this.config.localPath!, filename),
        primary: "local",
      };
    } else if (cloudExists) {
      return {
        cloud: `tracks/${filename}`,
        primary: "cloud",
      };
    }

    throw new Error(`Track not found: ${filename}`);
  }

  // Get MIME type from file extension
  private getMimeType(extension: string): string {
    return MIME_TYPES[extension as keyof typeof MIME_TYPES] || "audio/wav";
  }
}

// Default storage configuration
export const defaultStorageConfig: StorageConfig = {
  type: "hybrid",
  localPath: "/Users/maxwellyoung/music/Projects/2025",
  cloudBucket: process.env.R2_BUCKET_NAME,
  autoSync: true,
};

// Create storage manager instance
export const storageManager = new StorageManager(defaultStorageConfig);
