import { generateVideo } from "@/ai/flows/video-generation";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const result = await generateVideo({ prompt });

    if (result.videoDataUri) {
      return NextResponse.json({ videoDataUri: result.videoDataUri });
    } else {
      return NextResponse.json({ error: result.error || "Failed to generate video" }, { status: 500 });
    }
  } catch (error) {
    console.error("Error in /api/generate-video:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
