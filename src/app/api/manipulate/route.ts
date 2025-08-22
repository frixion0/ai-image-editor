import { aiImageManipulation } from "@/ai/flows/ai-image-manipulation";
import { NextResponse } from "next/server";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function POST(request: Request) {
  try {
    const { photoDataUri, instructions } = await request.json();

    if (!photoDataUri || !instructions) {
      return NextResponse.json({ error: "photoDataUri and instructions are required" }, { status: 400, headers: corsHeaders });
    }

    const result = await aiImageManipulation({ photoDataUri, instructions });

    if (result.editedPhotoDataUri) {
      return NextResponse.json({ editedPhotoDataUri: result.editedPhotoDataUri }, { headers: corsHeaders });
    } else {
      return NextResponse.json({ error: result.error || "Failed to manipulate image" }, { status: 500, headers: corsHeaders });
    }
  } catch (error) {
    console.error("Error in /api/manipulate:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500, headers: corsHeaders });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}
