"use client";

import React from "react";
import type { Tool } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { enhanceImage } from "@/ai/flows/enhance-image";
import { objectRemoval } from "@/ai/flows/object-removal";
import { styleTransfer } from "@/ai/flows/style-transfer";
import { recolorImage } from "@/ai/flows/image-recoloring";
import { aiImageManipulation } from "@/ai/flows/ai-image-manipulation";

interface ToolOptionsProps {
  activeTool: Tool;
  imageDataUrl: string | null;
  styleImageDataUrl: string | null;
  setStyleImageDataUrl: (url: string | null) => void;
  setImageDataUrl: (url: string | null) => void;
  setIsLoading: (loading: boolean) => void;
  brushSize: number;
  setBrushSize: (size: number) => void;
  maskCanvasRef: React.RefObject<HTMLCanvasElement>;
}

export function ToolOptions({
  activeTool,
  imageDataUrl,
  setImageDataUrl,
  setIsLoading,
  styleImageDataUrl,
  setStyleImageDataUrl,
  brushSize,
  setBrushSize,
  maskCanvasRef,
}: ToolOptionsProps) {
  const { toast } = useToast();
  const [prompt, setPrompt] = React.useState("");

  const handleAIAction = async (
    action: (input: any) => Promise<any>,
    input: any,
    outputKey: string
  ) => {
    setIsLoading(true);
    try {
      const result = await action(input);
      if (result.error) {
        toast({
          title: "AI Operation Failed",
          description: result.error,
          variant: "destructive",
        });
      } else if (result && result[outputKey]) {
        setImageDataUrl(result[outputKey]);
      } else {
        throw new Error("AI operation failed to return an image.");
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "An error occurred",
        description:
          "The AI operation failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearMask = () => {
    const canvas = maskCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleStyleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setStyleImageDataUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const renderOptions = () => {
    switch (activeTool) {
      case "enhance":
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-muted-foreground mb-4">Automatically improve image quality using AI</p>
            <Button size="lg" onClick={() => handleAIAction(enhanceImage, { photoDataUri: imageDataUrl }, "enhancedPhotoDataUri")}>
              Enhance Image
            </Button>
          </div>
        );
      case "object-removal":
        return (
          <div className="grid grid-cols-3 gap-4 items-center h-full">
            <div className="col-span-2 flex items-center gap-4">
              <Label htmlFor="brush-size" className="min-w-fit">Brush Size</Label>
              <Slider
                id="brush-size"
                min={1}
                max={100}
                step={1}
                value={[brushSize]}
                onValueChange={(value) => setBrushSize(value[0])}
              />
            </div>
            <div className="flex gap-2">
                <Button variant="outline" onClick={clearMask}>Clear Mask</Button>
                <Button onClick={() => handleAIAction(objectRemoval, { photoDataUri: imageDataUrl, maskDataUri: maskCanvasRef.current?.toDataURL() }, "editedPhotoDataUri")}>Apply</Button>
            </div>
          </div>
        );
      case "style-transfer":
        return (
          <div className="flex items-center justify-center gap-8 h-full">
             {styleImageDataUrl && <img src={styleImageDataUrl} alt="Style" className="h-24 w-24 object-cover rounded-lg border" data-ai-hint="artistic pattern" />}
            <Input type="file" accept="image/*" onChange={handleStyleImageUpload} className="max-w-xs"/>
            <Button size="lg" disabled={!styleImageDataUrl} onClick={() => handleAIAction(styleTransfer, { contentImage: imageDataUrl, styleImage: styleImageDataUrl }, "styledImage")}>Apply Style</Button>
          </div>
        );
      case "recoloring":
      case "ai-manipulation":
        const isRecolor = activeTool === "recoloring";
        const placeholder = isRecolor ? "e.g., 'make the dress red' or 'colorize the photo'" : "e.g., 'add a cat sitting on the bench'";
        const actionFn = isRecolor ? recolorImage : aiImageManipulation;
        const inputKey = isRecolor ? "recolorPrompt" : "instructions";
        const outputKey = isRecolor ? "recoloredPhotoDataUri" : "editedPhotoDataUri";

        return (
          <div className="flex items-center gap-4 h-full">
            <Input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={placeholder}
              className="flex-grow"
            />
            <Button onClick={() => handleAIAction(actionFn, { photoDataUri: imageDataUrl, [inputKey]: prompt }, outputKey)}>Apply</Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full w-full">
      {renderOptions()}
    </div>
  );
}
