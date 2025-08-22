import { aiImageManipulation } from "@/ai/flows/ai-image-manipulation";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { photoDataUri, instructions } = await request.json();

    if (!photoDataUri || !instructions) {
      return NextResponse.json({ error: "photoDataUri and instructions are required" }, { status: 400 });
    }

    const result = await aiImageManipulation({ photoDataUri, instructions });

    if (result.editedPhotoDataUri) {
      return NextResponse.json({ editedPhotoDataUri: result.editedPhotoDataUri });
    } else {
      return NextResponse.json({ error: result.error || "Failed to manipulate image" }, { status: 500 });
    }
  } catch (error) {
    console.error("Error in /api/manipulate:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
