import { notFound } from "next/navigation";
import ShareButton from "@/components/ShareButton";
import ReactionsPanel from "@/components/ReactionsPanel";
import MetadataEditor from "@/components/MetadataEditor";
import TrackInteractions from "@/components/TrackInteractions";
import TrackActions from "@/components/TrackActions";
import pb, { POCKETBASE_URL } from "@demodrop/shared/src/pocketbase";
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
    const record = await pb
      .collection("tracks")
      .getOne(slug, { expand: "reactions_" });
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

  const reactions = metadata.expand?.reactions_ || [];
  const reactionCounts = reactions.reduce((acc: any, reaction: any) => {
    acc[reaction.type] = (acc[reaction.type] || 0) + 1;
    return acc;
  }, {});

  const initialReactions = {
    fire: reactionCounts.fire || 0,
    cry: reactionCounts.cry || 0,
    explode: reactionCounts.explode || 0,
    broken: reactionCounts.broken || 0,
  };

  return (
    <div className="container-narrow animate-fade-in py-8 md:py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl md:text-5xl font-bold mb-2 bg-gradient-to-b from-neutral-50 to-neutral-300 bg-clip-text text-transparent leading-tight tracking-tight">
          {metadata.title}
        </h1>
        <p
          className="text-neutral-400 text-base md:text-lg mb-2"
          style={{ fontVariationSettings: "'wght' 400" }}
        >
          by {metadata.artist || "Unknown Artist"}
        </p>
        <p className="text-neutral-500 text-xs">
          Uploaded{" "}
          {new Date(metadata.created).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-12">
        <div className="lg:col-span-2 mb-8 lg:mb-0">
          <div className="bg-neutral-900/40 rounded-3xl p-4 md:p-6 mb-8">
            <TrackInteractions
              audioUrl={audioUrl}
              title={metadata.title}
              artist={metadata.artist}
              trackSlug={metadata.id}
              initialComments={comments}
            />
          </div>
        </div>
        <div className="lg:col-span-1 space-y-6">
          <div className="sidebar-card">
            <h3 className="sidebar-title">Actions</h3>
            <TrackActions
              shareUrl={shareUrl}
              title={metadata.title}
              artist={metadata.artist}
              trackSlug={metadata.id}
              reactions={initialReactions}
            />
          </div>
          <div className="sidebar-card">
            <h3 className="sidebar-title">Edit Details</h3>
            <MetadataEditor trackSlug={metadata.id} />
          </div>
          <div className="sidebar-card">
            <h3 className="sidebar-title">Track Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-secondary text-xs block mb-1">
                  Duration
                </span>
                <span className="text-xs font-medium">
                  {metadata.duration
                    ? `${Math.round(metadata.duration)}s`
                    : "N/A"}
                </span>
              </div>
              <div>
                <span className="text-secondary text-xs block mb-1">
                  Bitrate
                </span>
                <span className="text-xs font-medium">
                  {metadata.bitrate
                    ? `${Math.round(metadata.bitrate / 1000)}kbps`
                    : "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
