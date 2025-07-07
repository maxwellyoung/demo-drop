import { NextRequest, NextResponse } from "next/server";
import { r2Client } from "@/lib/r2-client";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";

export const runtime = "nodejs";

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { files } = body;

    if (!files || !Array.isArray(files)) {
      return NextResponse.json(
        { error: "Files array is required" },
        { status: 400 }
      );
    }

    const results = {
      deleted: [] as string[],
      failed: [] as string[],
      errors: [] as string[],
    };

    for (const filename of files) {
      try {
        const key = `tracks/${filename}`;
        const command = new DeleteObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME!,
          Key: key,
        });

        await r2Client.send(command);
        results.deleted.push(filename);
        console.log(`✅ Deleted from cloud: ${filename}`);
      } catch (error: any) {
        console.error(`❌ Failed to delete ${filename}:`, error);
        results.failed.push(filename);
        results.errors.push(`${filename}: ${error.message}`);
      }
    }

    return NextResponse.json({
      success: results.failed.length === 0,
      message: `Deleted ${results.deleted.length} files, ${results.failed.length} failed`,
      results,
    });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete files from cloud" },
      { status: 500 }
    );
  }
}
