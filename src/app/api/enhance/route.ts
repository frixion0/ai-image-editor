import { enhanceImage } from "@/ai/flows/enhance-image";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { photoDataUri } = await request.json();

    if (!photoDataUri) {
      return NextResponse.json({ error: "photoDataUri is required" }, { status: 400 });
    }

    const result = await enhanceImage({ photoDataUri });
    
    if (result.enhancedPhotoDataUri) {
      return NextResponse.json({ enhancedPhotoDataUri: result.enhancedPhotoDataUri });
    } else {
      return NextResponse.json({ error: "Failed to enhance image" }, { status: 500 });
    }
  } catch (error) {
    console.error("Error in /api/enhance:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
