import { NextRequest, NextResponse } from "next/server";
import pb from "@/lib/pocketbase";

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { type, userId } = await request.json(); // Assuming you send userId from client
    const trackId = params.slug;

    // Create a new reaction record
    const newReaction = await pb.collection("reactions").create({
      type: type,
      user: userId, // Link to the user who reacted
      track: trackId, // Link to the track
    });

    // Optionally, you can fetch the updated track with all reactions
    const updatedTrack = await pb
      .collection("tracks")
      .getOne(trackId, { expand: "reactions_" });

    const reactions = updatedTrack.expand?.reactions_ || [];

    // Count reactions by type
    const reactionCounts = reactions.reduce((acc: any, reaction: any) => {
      acc[reaction.type] = (acc[reaction.type] || 0) + 1;
      return acc;
    }, {});

    return NextResponse.json({ success: true, reactions: reactionCounts });
  } catch (error) {
    console.error("Reaction update error:", error);
    return NextResponse.json(
      { error: "Failed to update reaction" },
      { status: 500 }
    );
  }
}
