import { NextRequest, NextResponse } from "next/server";
import { syncManager } from "@/lib/sync-manager";

export const runtime = "nodejs";

// GET: Get detailed sync status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeStats = searchParams.get("stats") === "true";

    // Get detailed sync status
    const syncStatus = await syncManager.getSyncStatus();

    const response: any = {
      status: syncStatus,
      summary: {
        total: syncStatus.length,
        synced: syncStatus.filter((s) => !s.needsSync && !s.syncError).length,
        needsSync: syncStatus.filter((s) => s.needsSync).length,
        failed: syncStatus.filter((s) => s.syncError).length,
        pending: syncStatus.filter((s) => s.needsSync && !s.syncError).length,
      },
    };

    // Include detailed stats if requested
    if (includeStats) {
      response.stats = await syncManager.getSyncStats();
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error getting sync status:", error);
    return NextResponse.json(
      { error: "Failed to get sync status" },
      { status: 500 }
    );
  }
}

// POST: Start sync operation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { forceSync = false, specificFiles = null } = body;

    console.log("Starting sync to R2...", { forceSync, specificFiles });

    let result;

    if (specificFiles && Array.isArray(specificFiles)) {
      // Sync specific files
      result = await syncManager.syncSpecificFiles(specificFiles);
    } else {
      // Sync all files (or just those that need syncing)
      result = await syncManager.syncFiles(undefined, forceSync);
    }

    console.log("Sync completed:", {
      success: result.success,
      synced: result.synced.length,
      failed: result.failed.length,
      skipped: result.skipped.length,
      totalTime: result.totalTime,
    });

    return NextResponse.json({
      success: result.success,
      message: result.success
        ? `Sync completed successfully in ${(result.totalTime / 1000).toFixed(
            1
          )}s`
        : "Sync completed with errors",
      result,
    });
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json(
      { error: "Failed to sync files to R2" },
      { status: 500 }
    );
  }
}

// DELETE: Clear sync errors for retry
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filenames = searchParams.get("files");

    if (filenames) {
      // Clear errors for specific files
      const fileList = filenames.split(",").map((f) => f.trim());
      syncManager.clearSyncErrors(fileList);
    } else {
      // Clear all sync errors
      syncManager.clearSyncErrors();
    }

    return NextResponse.json({
      success: true,
      message: "Sync errors cleared",
    });
  } catch (error) {
    console.error("Error clearing sync errors:", error);
    return NextResponse.json(
      { error: "Failed to clear sync errors" },
      { status: 500 }
    );
  }
}
