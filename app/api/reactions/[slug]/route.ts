import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import path from "path";

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { type, action } = await request.json();
    const metadataPath = path.join(
      process.cwd(),
      "public",
      "uploads",
      `${params.slug}.json`
    );

    // Read current metadata
    const data = await readFile(metadataPath, "utf-8");
    const metadata = JSON.parse(data);

    // Update reaction count
    if (action === "add") {
      metadata.reactions[type] = (metadata.reactions[type] || 0) + 1;
    } else if (action === "remove") {
      metadata.reactions[type] = Math.max(
        0,
        (metadata.reactions[type] || 0) - 1
      );
    }

    // Save updated metadata
    await writeFile(metadataPath, JSON.stringify(metadata, null, 2));

    return NextResponse.json({ success: true, reactions: metadata.reactions });
  } catch (error) {
    console.error("Reaction update error:", error);
    return NextResponse.json(
      { error: "Failed to update reaction" },
      { status: 500 }
    );
  }
}
