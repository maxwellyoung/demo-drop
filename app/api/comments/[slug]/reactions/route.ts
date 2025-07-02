import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import path from "path";

interface Comment {
  id: string;
  author: string;
  message: string;
  timestamp: number;
  audioTimestamp?: number;
  category?: "feedback" | "question" | "suggestion" | "bug" | "general";
  reactions?: {
    like?: number;
    helpful?: number;
    agree?: number;
  };
  replies?: Comment[];
  parentId?: string;
}

interface CommentsData {
  comments: Comment[];
}

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { commentId, reactionType } = await request.json();

    if (!commentId || !reactionType) {
      return NextResponse.json(
        { error: "Comment ID and reaction type are required" },
        { status: 400 }
      );
    }

    if (!["like", "helpful", "agree"].includes(reactionType)) {
      return NextResponse.json(
        { error: "Invalid reaction type" },
        { status: 400 }
      );
    }

    const commentsPath = path.join(
      process.cwd(),
      "public",
      "uploads",
      `${params.slug}-comments.json`
    );

    // Read existing comments
    let commentsData: CommentsData = { comments: [] };
    try {
      const existingData = await readFile(commentsPath, "utf-8");
      commentsData = JSON.parse(existingData);
    } catch (error) {
      return NextResponse.json(
        { error: "Comments file not found" },
        { status: 404 }
      );
    }

    // Find the comment and update its reaction
    let commentFound = false;

    // Check top-level comments
    commentsData.comments.forEach((comment) => {
      if (comment.id === commentId) {
        if (!comment.reactions) {
          comment.reactions = { like: 0, helpful: 0, agree: 0 };
        }
        comment.reactions[reactionType as keyof typeof comment.reactions] =
          (comment.reactions[reactionType as keyof typeof comment.reactions] ||
            0) + 1;
        commentFound = true;
      }
    });

    // Check replies if not found in top-level
    if (!commentFound) {
      commentsData.comments.forEach((comment) => {
        if (comment.replies) {
          comment.replies.forEach((reply) => {
            if (reply.id === commentId) {
              if (!reply.reactions) {
                reply.reactions = { like: 0, helpful: 0, agree: 0 };
              }
              reply.reactions[reactionType as keyof typeof reply.reactions] =
                (reply.reactions[
                  reactionType as keyof typeof reply.reactions
                ] || 0) + 1;
              commentFound = true;
            }
          });
        }
      });
    }

    if (!commentFound) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    // Write back to file
    await writeFile(commentsPath, JSON.stringify(commentsData, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating reaction:", error);
    return NextResponse.json(
      { error: "Failed to update reaction" },
      { status: 500 }
    );
  }
}
