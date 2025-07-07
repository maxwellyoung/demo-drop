import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import slugify from "slugify";
import { AudioProcessor } from "../../../lib/audio-processor";

// Configure the route to handle large files
export const runtime = "nodejs";
export const maxDuration = 30; // 30 seconds timeout

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("audio") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Check file size (limit to 50MB)
    const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 50MB." },
        { status: 400 }
      );
    }

    // Enhanced file validation - check both MIME type and file extension
    const allowedMimeTypes = [
      "audio/mpeg", // MP3
      "audio/mp3", // MP3 (alternative)
      "audio/wav", // WAV
      "audio/wave", // WAV (alternative)
      "audio/x-wav", // WAV (legacy)
      "audio/mp4", // M4A
      "audio/x-m4a", // M4A (alternative)
      "audio/m4a", // M4A (alternative)
      "audio/flac", // FLAC
      "audio/x-flac", // FLAC (alternative)
      "application/octet-stream", // Sometimes audio files are detected as this
    ];

    const allowedExtensions = [".mp3", ".wav", ".m4a", ".flac"];
    const fileExtension = path.extname(file.name).toLowerCase();

    // Validate either by MIME type or file extension
    const isValidMimeType = allowedMimeTypes.includes(file.type);
    const isValidExtension = allowedExtensions.includes(fileExtension);

    console.log(
      `File validation - Name: ${file.name}, Type: ${file.type}, Extension: ${fileExtension}`
    );

    if (!isValidMimeType && !isValidExtension) {
      return NextResponse.json(
        {
          error: `Invalid file type. Detected: ${file.type}. Please upload MP3, WAV, M4A, or FLAC files.`,
        },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate slug from filename
    const nameWithoutExt = path.parse(file.name).name;
    const extension = path.extname(file.name);
    const baseSlug = slugify(nameWithoutExt, { lower: true, strict: true });
    const timestamp = Date.now();
    const slug = `${baseSlug}-${timestamp}`;

    // Save original file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = `${slug}${extension}`;
    const filepath = path.join(uploadsDir, filename);

    await writeFile(filepath, buffer);

    // Process audio file with enhanced pipeline
    const audioProcessor = new AudioProcessor();
    let processedData;

    try {
      processedData = await audioProcessor.processAudioFile(
        filepath,
        uploadsDir,
        slug
      );
    } catch (error) {
      console.error("Audio processing failed:", error);
      // Continue with basic upload if processing fails
      processedData = null;
    }

    // Create enhanced metadata file
    const metadata = {
      slug,
      originalName: file.name,
      filename,
      streamingFilename: processedData ? `${slug}-streaming.mp3` : filename,
      thumbnailFilename: processedData ? `${slug}-spectral.png` : null,
      peaksFilename: processedData ? `${slug}-peaks.json` : null,
      title: nameWithoutExt,
      artist: "Maxwell", // Default artist
      uploadedAt: new Date().toISOString(),
      size: file.size,
      type: file.type,
      // Enhanced audio metadata
      audioMetadata: processedData
        ? {
            duration: processedData.metadata.duration,
            bitrate: processedData.metadata.bitrate,
            sampleRate: processedData.metadata.sampleRate,
            channels: processedData.metadata.channels,
            format: processedData.metadata.format,
          }
        : null,
      reactions: {
        fire: 0,
        cry: 0,
        explode: 0,
        broken: 0,
      },
    };

    const metadataPath = path.join(uploadsDir, `${slug}.json`);
    await writeFile(metadataPath, JSON.stringify(metadata, null, 2));

    console.log(`Successfully uploaded: ${filename}`);
    return NextResponse.json({ slug, filename });
  } catch (error) {
    console.error("Upload error:", error);

    // More specific error handling
    if (error instanceof Error) {
      if (error.message.includes("aborted")) {
        return NextResponse.json(
          { error: "Upload was interrupted. Please try again." },
          { status: 408 }
        );
      }
      if (error.name === "PayloadTooLargeError") {
        return NextResponse.json({ error: "File too large" }, { status: 413 });
      }
    }

    return NextResponse.json(
      { error: "Upload failed. Please try again." },
      { status: 500 }
    );
  }
}
