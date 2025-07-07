import { notFound } from "next/navigation";
import ShareButton from "@/components/ShareButton";
import ReactionsPanel from "@/components/ReactionsPanel";
import MetadataEditor from "@/components/MetadataEditor";
import TrackInteractions from "@/components/TrackInteractions";
import TrackActions from "@/components/TrackActions";
import pb, { POCKETBASE_URL } from "@/lib/pocketbase";
import { RecordModel } from "pocketbase";

interface Comment {
  id: string;
  author: string;
  message: string;
  timestamp: number;
  audioTimestamp?: number;
}

async function getTrackFromPocketBase(
  slug: string
): Promise<RecordModel | null> {
  try {
    const record = await pb.collection("tracks").getOne(slug);
    console.log("Fetched track record from PocketBase:", record);
    return record;
  } catch (error) {
    console.error("Error fetching track from PocketBase:", error);
    return null;
  }
}

async function getTrackComments(slug: string): Promise<Comment[]> {
  try {
    // For now, return empty comments since we're not storing them locally
    // You could implement a simple JSON file storage for comments if needed
    return [];
  } catch (error) {
    return [];
  }
}

export default async function TrackPage({
  params,
}: {
  params: { slug: string };
}) {
  const metadata = await getTrackFromPocketBase(params.slug);
  const comments = await getTrackComments(params.slug);

  if (!metadata) {
    notFound();
  }

  const audioUrl = `${POCKETBASE_URL}/api/files/${metadata.collectionId}/${metadata.id}/${metadata.audio}`;
  const shareUrl = `${
    process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  }/track/${metadata.id}`;

  return (
    <div className="container-narrow animate-fade-in">
      <div className="mb-6">
        <h1 className="heading-lg mb-2 bg-gradient-to-b from-neutral-50 to-neutral-400 bg-clip-text text-transparent">
          {metadata.title}
        </h1>
        <p
          className="text-secondary text-base mb-2"
          style={{ fontVariationSettings: "'wght' 400" }}
        >
          by {metadata.artist}
        </p>
        <p className="text-neutral-500 text-xs">
          Uploaded {new Date(metadata.created).toLocaleDateString("en-GB")}
        </p>
      </div>
      <TrackInteractions
        audioUrl={audioUrl}
        title={metadata.title}
        trackSlug={metadata.id}
        initialComments={comments}
      />
      <TrackActions
        shareUrl={shareUrl}
        title={metadata.title}
        artist={metadata.artist}
        trackSlug={metadata.id}
        reactions={{ fire: 0, cry: 0, explode: 0, broken: 0 }} // TODO: Implement reactions in PocketBase
      />
      <MetadataEditor trackSlug={metadata.id} />
      <div className="track-info p-4 mb-4">
        <h3
          className="text-base font-medium mb-4 tracking-tight"
          style={{ fontVariationSettings: "'wght' 500" }}
        >
          Track Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div>
              <span className="text-secondary text-xs block mb-1">
                Original filename
              </span>
              <span className="text-xs font-medium">{metadata.audio}</span>
            </div>
            <div>
              <span className="text-secondary text-xs block mb-1">
                File size
              </span>
              <span className="text-xs font-medium">
                {/* TODO: Get file size from PocketBase */}
                N/A
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <div>
              <span className="text-secondary text-xs block mb-1">Format</span>
              <span className="text-xs font-medium">
                {/* TODO: Get file type from PocketBase */}
                N/A
              </span>
            </div>
            <div>
              <span className="text-secondary text-xs block mb-1">
                Direct download
              </span>
              <a
                href={audioUrl}
                className="text-xs text-neutral-300 hover:text-neutral-100 transition-colors duration-200 hover-lift inline-flex items-center gap-2"
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
