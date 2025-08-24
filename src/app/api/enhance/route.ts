
import { enhanceImage } from "@/ai/flows/enhance-image";
import { NextResponse } from "next/server";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function POST(request: Request) {
  try {
    const { photoDataUri } = await request.json();

    if (!photoDataUri) {
      return NextResponse.json({ error: "photoDataUri is required" }, { status: 400, headers: corsHeaders });
    }

    const result = await enhanceImage({ photoDataUri });
    
    if (result.enhancedPhotoDataUri) {
      return NextResponse.json({ enhancedPhotoDataUri: result.enhancedPhotoDataUri }, { headers: corsHeaders });
    } else {
      return NextResponse.json({ error: "Failed to enhance image" }, { status: 500, headers: corsHeaders });
    }
  } catch (error) {
    console.error("Error in /api/enhance:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMessage }, { status: 500, headers: corsHeaders });
  }
}

export async function OPTIONS(request: Request) {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
}
