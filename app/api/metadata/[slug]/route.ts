import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import path from "path";

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

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const metadataPath = path.join(
      process.cwd(),
      "public",
      "uploads",
      `${params.slug}-metadata.json`
    );

    const data = await readFile(metadataPath, "utf-8");
    const metadata = JSON.parse(data);

    return NextResponse.json(metadata);
  } catch (error) {
    // Return empty metadata if file doesn't exist
    return NextResponse.json({
      description: "",
      tags: [],
      credits: [],
      notes: "",
      genre: "",
      bpm: null,
      key: "",
      duration: null,
    });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const body = await request.json();

    // Validate the metadata
    const metadata: ExtendedTrackMetadata = {
      description: body.description || "",
      tags: Array.isArray(body.tags)
        ? body.tags.filter((tag: any) => typeof tag === "string" && tag.trim())
        : [],
      credits: Array.isArray(body.credits)
        ? body.credits.filter(
            (credit: any) => typeof credit === "string" && credit.trim()
          )
        : [],
      notes: body.notes || "",
      genre: body.genre || "",
      bpm: typeof body.bpm === "number" && body.bpm > 0 ? body.bpm : null,
      key: body.key || "",
      duration:
        typeof body.duration === "number" && body.duration > 0
          ? body.duration
          : null,
    };

    const metadataPath = path.join(
      process.cwd(),
      "public",
      "uploads",
      `${params.slug}-metadata.json`
    );

    await writeFile(metadataPath, JSON.stringify(metadata, null, 2));

    return NextResponse.json({ success: true, metadata });
  } catch (error) {
    console.error("Error saving metadata:", error);
    return NextResponse.json(
      { error: "Failed to save metadata" },
      { status: 500 }
    );
  }
}
