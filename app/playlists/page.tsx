import { readdir, readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import PlaylistManager from "@/components/PlaylistManager";

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

export default async function PlaylistsPage() {
  const tracks = await getAllTracks();

  // Convert tracks to the format expected by PlaylistManager
  const playlistTracks = tracks.map((track) => ({
    slug: track.slug,
    title: track.title,
    artist: track.artist,
    audioUrl: `/uploads/${track.filename}`,
    genre: track.extendedMetadata?.genre,
    extendedMetadata: track.extendedMetadata,
  }));

  return (
    <div className="container-wide animate-fade-in">
      <PlaylistManager allTracks={playlistTracks} />
    </div>
  );
}
