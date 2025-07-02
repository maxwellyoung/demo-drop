import { readdir, readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import Link from "next/link";

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

async function getAllTracks(): Promise<TrackMetadata[]> {
  try {
    const uploadsDir = path.join(process.cwd(), "public", "uploads");

    if (!existsSync(uploadsDir)) {
      return [];
    }

    const files = await readdir(uploadsDir);
    const jsonFiles = files.filter(
      (file) => file.endsWith(".json") && !file.includes("-comments")
    );

    const tracks: TrackMetadata[] = [];

    for (const file of jsonFiles) {
      try {
        const filePath = path.join(uploadsDir, file);
        const data = await readFile(filePath, "utf-8");
        const metadata: TrackMetadata = JSON.parse(data);
        tracks.push(metadata);
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

  return (
    <div className="container-narrow animate-fade-in">
      <div className="mb-12">
        <h1 className="heading-lg mb-3 bg-gradient-to-b from-neutral-50 to-neutral-400 bg-clip-text text-transparent">
          All Tracks
        </h1>
        <p className="text-secondary text-lg font-light">
          {tracks.length} demo{tracks.length !== 1 ? "s" : ""} uploaded
        </p>
      </div>

      {tracks.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-6">🎵</div>
          <h2 className="text-xl mb-3 font-light">No tracks yet</h2>
          <p className="text-secondary mb-8">
            Upload your first demo to get started!
          </p>
          <Link href="/" className="btn-primary">
            Upload Track
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {tracks.map((track) => {
            const totalReactions = Object.values(track.reactions).reduce(
              (sum, count) => sum + count,
              0
            );

            return (
              <Link
                key={track.slug}
                href={`/track/${track.slug}`}
                className="block group"
              >
                <div className="track-info p-6 hover:bg-neutral-900/50 transition-all duration-200 group-hover:scale-[1.01]">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3
                        className="text-lg font-medium mb-1 tracking-tight group-hover:text-neutral-100 transition-colors"
                        style={{ fontVariationSettings: "'wght' 500" }}
                      >
                        {track.title}
                      </h3>
                      <p className="text-secondary text-sm mb-2">
                        by {track.artist}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-neutral-500">
                        <span>
                          {new Date(track.uploadedAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </span>
                        <span>{(track.size / 1024 / 1024).toFixed(1)} MB</span>
                        <span>
                          {track.type.replace("audio/", "").toUpperCase()}
                        </span>
                        {totalReactions > 0 && (
                          <span className="flex items-center gap-1">
                            <span>❤️</span>
                            <span>{totalReactions}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-neutral-400"
                      >
                        <polygon points="5,3 19,12 5,21" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
