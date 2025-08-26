import { readdir, readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import PlaylistManager from "@/components/PlaylistManager";
import { TrackWithMetadata, ExtendedTrackMetadata } from "@/types";



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
        const metadata: TrackWithMetadata = JSON.parse(data);

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
    ...track,
    audioUrl: `/uploads/${track.filename}`,
  }));

  return (
    <div className="container-wide animate-fade-in">
      <PlaylistManager allTracks={playlistTracks} />
    </div>
  );
}
