import { NextRequest, NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { r2Client } from "@/lib/r2-client";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const filename = decodeURIComponent(params.filename);
    const key = `tracks/${filename}`;

    // Get range header for streaming
    const range = request.headers.get("range");

    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      ...(range && { Range: range }),
    });

    const response = await r2Client.send(command);

    if (!response.Body) {
      return NextResponse.json(
        { error: "Audio file not found" },
        { status: 404 }
      );
    }

    // Convert stream to buffer
    const chunks: Uint8Array[] = [];
    const reader = response.Body.transformToWebStream().getReader();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }

    const buffer = Buffer.concat(chunks);

    // Determine content type
    const ext = filename.split(".").pop()?.toLowerCase();
    const mimeTypes: { [key: string]: string } = {
      wav: "audio/wav",
      mp3: "audio/mpeg",
      m4a: "audio/mp4",
      flac: "audio/flac",
    };
    const contentType = mimeTypes[ext || ""] || "audio/wav";

    // Create response headers
    const headers: { [key: string]: string } = {
      "Content-Type": contentType,
      "Content-Length": buffer.length.toString(),
      "Accept-Ranges": "bytes",
      "Cache-Control": "public, max-age=3600",
    };

    // Handle range requests
    if (range && response.ContentRange) {
      headers["Content-Range"] = response.ContentRange;
      return new NextResponse(buffer, {
        status: 206,
        headers,
      });
    }

    return new NextResponse(buffer, {
      status: 200,
      headers,
    });
  } catch (error: any) {
    console.error("Error streaming from R2:", error);

    if (error.name === "NoSuchKey") {
      return NextResponse.json(
        { error: "Audio file not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Failed to stream audio file" },
      { status: 500 }
    );
  }
}
