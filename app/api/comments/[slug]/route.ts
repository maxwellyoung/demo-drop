import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { Comment } from "../../../../types";

interface CommentsData {
  comments: Comment[];
}

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const commentsPath = path.join(
      process.cwd(),
      "public",
      "uploads",
      `${params.slug}-comments.json`
    );

    try {
      const data = await readFile(commentsPath, "utf-8");
      return NextResponse.json(JSON.parse(data));
    } catch (error) {
      // File doesn't exist, return empty comments
      return NextResponse.json({ comments: [] });
    }
  } catch (error) {
    // TODO: Implement proper error logging
    return NextResponse.json(
      { error: "Failed to read comments" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { author, message, audioTimestamp, category, parentId } =
      await request.json();

    if (!author || !message) {
      return NextResponse.json(
        { error: "Author and message are required" },
        { status: 400 }
      );
    }

    // Validate input lengths
    if (author.length > 50) {
      return NextResponse.json(
        { error: "Author name too long" },
        { status: 400 }
      );
    }

    if (message.length > 500) {
      return NextResponse.json({ error: "Message too long" }, { status: 400 });
    }

    // Validate audio timestamp if provided
    if (
      audioTimestamp !== undefined &&
      (audioTimestamp < 0 || audioTimestamp > 3600)
    ) {
      return NextResponse.json(
        { error: "Invalid audio timestamp" },
        { status: 400 }
      );
    }

    // Validate category if provided
    if (
      category &&
      !["feedback", "question", "suggestion", "bug", "general"].includes(
        category
      )
    ) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
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
      // File doesn't exist, start with empty array
    }

    // Create new comment
    const newComment: Comment = {
      id: uuidv4(),
      trackSlug: params.slug,
      author: author.trim(),
      content: message.trim(),
      timestamp: Date.now(),
      audioTimestamp: audioTimestamp,
      reactions: [],
      replies: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (parentId) {
      // This is a reply - add it to the parent comment
      const parentComment = commentsData.comments.find(
        (c) => c.id === parentId
      );
      if (!parentComment) {
        return NextResponse.json(
          { error: "Parent comment not found" },
          { status: 404 }
        );
      }

      if (!parentComment.replies) {
        parentComment.replies = [];
      }

      newComment.parentId = parentId;
      parentComment.replies!.push(newComment);
    } else {
      // This is a top-level comment
      commentsData.comments.push(newComment);
    }

    // Sort top-level comments by audio timestamp first, then by post timestamp
    commentsData.comments.sort((a, b) => {
      if (a.audioTimestamp !== undefined && b.audioTimestamp !== undefined) {
        return a.audioTimestamp - b.audioTimestamp;
      }
      if (a.audioTimestamp !== undefined) return -1;
      if (b.audioTimestamp !== undefined) return 1;
      return a.timestamp - b.timestamp;
    });

    // Write back to file
    await writeFile(commentsPath, JSON.stringify(commentsData, null, 2));

    return NextResponse.json(newComment);
  } catch (error) {
    // TODO: Implement proper error logging
    return NextResponse.json(
      { error: "Failed to save comment" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { commentId } = await request.json();

    if (!commentId) {
      return NextResponse.json(
        { error: "Comment ID is required" },
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

    // Find and remove the comment (including from replies)
    const initialLength = commentsData.comments.length;

    // Remove from top-level comments
    commentsData.comments = commentsData.comments.filter(
      (comment) => comment.id !== commentId
    );

    // Remove from replies
    commentsData.comments.forEach((comment) => {
      if (comment.replies) {
        comment.replies = comment.replies.filter(
          (reply) => reply.id !== commentId
        );
      }
    });

    if (commentsData.comments.length === initialLength) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    // Write back to file
    await writeFile(commentsPath, JSON.stringify(commentsData, null, 2));

    return NextResponse.json({ success: true, message: "Comment deleted" });
  } catch (error) {
    // TODO: Implement proper error logging
    return NextResponse.json(
      { error: "Failed to delete comment" },
      { status: 500 }
    );
  }
}
