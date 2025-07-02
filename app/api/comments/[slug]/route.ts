import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
}

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
      const commentsData: CommentsData = JSON.parse(data);
      return NextResponse.json(commentsData);
    } catch (error) {
      // File doesn't exist yet, return empty comments
      return NextResponse.json({ comments: [] });
    }
  } catch (error) {
    console.error("Comments fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { author, content } = await request.json();

    if (!author?.trim() || !content?.trim()) {
      return NextResponse.json(
        { error: "Author and content are required" },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedAuthor = author.trim().substring(0, 50);
    const sanitizedContent = content.trim().substring(0, 500);

    const commentsPath = path.join(
      process.cwd(),
      "public",
      "uploads",
      `${params.slug}-comments.json`
    );

    // Read existing comments or create new structure
    let commentsData: CommentsData = { comments: [] };
    try {
      const existingData = await readFile(commentsPath, "utf-8");
      commentsData = JSON.parse(existingData);
    } catch (error) {
      // File doesn't exist, use empty structure
    }

    // Add new comment
    const newComment: Comment = {
      id: uuidv4(),
      author: sanitizedAuthor,
      content: sanitizedContent,
      timestamp: new Date().toISOString(),
    };

    commentsData.comments.unshift(newComment); // Add to beginning for newest first

    // Save updated comments
    await writeFile(commentsPath, JSON.stringify(commentsData, null, 2));

    return NextResponse.json(commentsData);
  } catch (error) {
    console.error("Comment submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit comment" },
      { status: 500 }
    );
  }
}
