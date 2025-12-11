import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    let imageUrl: URL;
    try {
      imageUrl = new URL(url);
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 },
      );
    }

    const response = await fetch(imageUrl.toString(), {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to download image: ${response.statusText}` },
        { status: 400 },
      );
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.startsWith("image/")) {
      return NextResponse.json(
        { error: "URL does not point to an image" },
        { status: 400 },
      );
    }

    const contentLength = response.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Image size exceeds 5MB limit" },
        { status: 400 },
      );
    }

    const extension = contentType.split("/")[1].split(";")[0];
    const validExtensions = ["jpeg", "jpg", "png", "gif", "webp"];
    if (!validExtensions.includes(extension)) {
      return NextResponse.json(
        { error: `Unsupported image format: ${extension}` },
        { status: 400 },
      );
    }

    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const filename = `image-${timestamp}-${randomStr}.${extension === "jpeg" ? "jpg" : extension}`;

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const publicPath = join(process.cwd(), "public", "urlProducts", filename);
    await writeFile(publicPath, buffer);

    const publicUrl = `/urlProducts/${filename}`;

    return NextResponse.json({ path: publicUrl }, { status: 200 });
  } catch (error) {
    console.error("Error uploading image from URL:", error);
    return NextResponse.json(
      {
        error: `Failed to upload image: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 },
    );
  }
}
