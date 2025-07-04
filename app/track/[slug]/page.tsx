import { readFile } from "fs/promises";
import { notFound } from "next/navigation";
import path from "path";
import ShareButton from "@/components/ShareButton";
import ReactionsPanel from "@/components/ReactionsPanel";
import MetadataEditor from "@/components/MetadataEditor";
import TrackInteractions from "@/components/TrackInteractions";
import TrackActions from "@/components/TrackActions";

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

interface Comment {
  id: string;
  author: string;
  message: string;
  timestamp: number;
  audioTimestamp?: number;
}

async function getTrackMetadata(slug: string): Promise<TrackMetadata | null> {
  try {
    const metadataPath = path.join(
      process.cwd(),
      "public",
      "uploads",
      `${slug}.json`
    );
    const data = await readFile(metadataPath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return null;
  }
}

async function getTrackComments(slug: string): Promise<Comment[]> {
  try {
    const commentsPath = path.join(
      process.cwd(),
      "public",
      "uploads",
      `${slug}-comments.json`
    );
    const data = await readFile(commentsPath, "utf-8");
    const commentsData = JSON.parse(data);
    return commentsData.comments || [];
  } catch (error) {
    return [];
  }
}

export default async function TrackPage({
  params,
}: {
  params: { slug: string };
}) {
  const metadata = await getTrackMetadata(params.slug);
  const comments = await getTrackComments(params.slug);

  if (!metadata) {
    notFound();
  }

  const audioUrl = `/uploads/${metadata.filename}`;
  const shareUrl = `${
    process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  }/track/${metadata.slug}`;

  return (
    <div className="container-narrow animate-fade-in">
      {/* Dieter Rams inspired information hierarchy */}
      <div className="mb-12">
        <h1 className="heading-lg mb-3 bg-gradient-to-b from-neutral-50 to-neutral-400 bg-clip-text text-transparent">
          {metadata.title}
        </h1>
        <p
          className="text-secondary text-lg mb-3"
          style={{ fontVariationSettings: "'wght' 400" }}
        >
          by {metadata.artist}
        </p>
        <p className="text-neutral-500 text-sm">
          Uploaded{" "}
          {new Date(metadata.uploadedAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Track Interactions - Audio Player and Comments */}
      <TrackInteractions
        audioUrl={audioUrl}
        title={metadata.title}
        trackSlug={metadata.slug}
        initialComments={comments}
      />

      {/* Actions - Jordan Singer inspired layout */}
      <TrackActions
        shareUrl={shareUrl}
        title={metadata.title}
        artist={metadata.artist}
        trackSlug={metadata.slug}
        reactions={metadata.reactions}
      />

      {/* Track Metadata Editor */}
      <MetadataEditor trackSlug={metadata.slug} />

      {/* Track Info - Michael Bierut inspired information design */}
      <div className="track-info p-8 mb-8">
        <h3
          className="text-lg font-medium mb-6 tracking-tight"
          style={{ fontVariationSettings: "'wght' 500" }}
        >
          Track Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <span className="text-secondary text-sm block mb-1">
                Original filename
              </span>
              <span className="text-sm font-medium">
                {metadata.originalName}
              </span>
            </div>
            <div>
              <span className="text-secondary text-sm block mb-1">
                File size
              </span>
              <span className="text-sm font-medium">
                {(metadata.size / 1024 / 1024).toFixed(2)} MB
              </span>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <span className="text-secondary text-sm block mb-1">Format</span>
              <span className="text-sm font-medium">
                {metadata.type.replace("audio/", "").toUpperCase()}
              </span>
            </div>
            <div>
              <span className="text-secondary text-sm block mb-1">
                Direct download
              </span>
              <a
                href={audioUrl}
                className="text-sm text-neutral-300 hover:text-neutral-100 transition-colors duration-200 hover-lift inline-flex items-center gap-2"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>Download file</span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7,10 12,15 17,10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
