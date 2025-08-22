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
import { aiImageManipulation } from "@/ai/flows/ai-image-manipulation";

interface ToolOptionsProps {
  activeTool: Tool;
  imageDataUrl: string | null;
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
    if (!imageDataUrl) return;
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
        // Clear the mask after a successful operation
        if (activeTool === 'object-removal') {
          clearMask();
        }
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

  const getProcessedMask = (): string | undefined => {
    const canvas = maskCanvasRef.current;
    if (!canvas) return undefined;

    // Check if the mask is empty
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const hasDrawing = Array.from(imageData.data).some(channel => channel !== 0);

    if (!hasDrawing) {
      toast({
        title: "Empty Mask",
        description: "Please mark the areas you want to remove before applying.",
        variant: "destructive",
      });
      return undefined;
    }

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return undefined;

    // Create a black background
    tempCtx.fillStyle = 'black';
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    
    // Draw the (white) mask from the original mask canvas
    tempCtx.drawImage(canvas, 0, 0);

    return tempCanvas.toDataURL('image/png');
  };

  const onObjectRemovalApply = () => {
    const maskDataUri = getProcessedMask();
    if (maskDataUri && imageDataUrl) {
      handleAIAction(objectRemoval, { photoDataUri: imageDataUrl, maskDataUri }, "editedPhotoDataUri");
    }
  }

  const renderOptions = () => {
    switch (activeTool) {
      case "enhance":
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-muted-foreground mb-4">Automatically improve image quality using AI</p>
            <Button size="lg" onClick={() => {
              if (imageDataUrl) {
                handleAIAction(enhanceImage, { photoDataUri: imageDataUrl }, "enhancedPhotoDataUri")
              }
            }}>
              Enhance Image
            </Button>
          </div>
        );
      case "object-removal":
        return (
          <div className="flex items-center justify-between h-full w-full gap-8">
            <div className="flex-grow flex items-center gap-4">
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
                <Button onClick={onObjectRemovalApply}>Apply</Button>
            </div>
          </div>
        );
      case "ai-manipulation":
        const placeholder = "e.g., 'add a cat sitting on the bench'";
        const actionFn = aiImageManipulation;
        const inputKey = "instructions";
        const outputKey = "editedPhotoDataUri";

        return (
          <div className="flex items-center gap-4 h-full">
            <Input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={placeholder}
              className="flex-grow"
            />
            <Button onClick={() => {
              if (imageDataUrl) {
                handleAIAction(actionFn, { photoDataUri: imageDataUrl, [inputKey]: prompt }, outputKey)
              }
            }}>Apply</Button>
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
