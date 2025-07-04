import { readdir, readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { ClientTracksPage } from "./ClientTracksPage";

interface TrackMetadata {
  slug: string;
  originalName: string;
  filename: string;
  title: string;
  artist: string;
  uploadedAt: string;
  size: number;
  type: string;
  reactions: {
    fire: number;
    cry: number;
    explode: number;
    broken: number;
  };
}

interface ExtendedTrackMetadata {
  description?: string;
  tags?: string[];
  credits?: string[];
  notes?: string;
  genre?: string;
  bpm?: number;
  key?: string;
  duration?: number;
}

interface TrackWithMetadata extends TrackMetadata {
  extendedMetadata?: ExtendedTrackMetadata;
}

// Generate vibrant gradient for track artwork
function generateTrackGradient(title: string, artist: string, genre?: string) {
  const colors = [
    ["from-purple-500", "to-pink-500"],
    ["from-blue-500", "to-cyan-500"],
    ["from-green-500", "to-emerald-500"],
    ["from-red-500", "to-orange-500"],
    ["from-indigo-500", "to-purple-500"],
    ["from-pink-500", "to-rose-500"],
    ["from-cyan-500", "to-blue-500"],
    ["from-orange-500", "to-red-500"],
    ["from-emerald-500", "to-teal-500"],
    ["from-violet-500", "to-purple-500"],
    ["from-amber-500", "to-orange-500"],
    ["from-teal-500", "to-cyan-500"],
  ];

  // Simple hash function to consistently pick colors based on track info
  const hash = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  };

  const colorIndex = hash(title + artist + (genre || "")) % colors.length;
  return colors[colorIndex];
}

async function getAllTracks(): Promise<TrackWithMetadata[]> {
  try {
    const uploadsDir = path.join(process.cwd(), "public", "uploads");

    if (!existsSync(uploadsDir)) {
      return [];
    }

    const files = await readdir(uploadsDir);
    const jsonFiles = files.filter(
      (file) =>
        file.endsWith(".json") &&
        !file.includes("-comments") &&
        !file.includes("-metadata")
    );

    const tracks: TrackWithMetadata[] = [];

    for (const file of jsonFiles) {
      try {
        const filePath = path.join(uploadsDir, file);
        const data = await readFile(filePath, "utf-8");
        const metadata: TrackMetadata = JSON.parse(data);

        // Try to load extended metadata
        let extendedMetadata: ExtendedTrackMetadata | undefined;
        try {
          const extendedFilePath = path.join(
            uploadsDir,
            `${metadata.slug}-metadata.json`
          );
          const extendedData = await readFile(extendedFilePath, "utf-8");
          extendedMetadata = JSON.parse(extendedData);
        } catch {
          // Extended metadata doesn't exist, that's fine
        }

        tracks.push({ ...metadata, extendedMetadata });
      } catch (error) {
        console.error(`Failed to read metadata for ${file}:`, error);
      }
    }

    // Sort by upload date, newest first
    return tracks.sort(
      (a, b) =>
        new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );
  } catch (error) {
    console.error("Failed to load tracks:", error);
    return [];
  }
}

export default async function TracksPage() {
  const tracks = await getAllTracks();
  return <ClientTracksPage tracks={tracks} />;
}
