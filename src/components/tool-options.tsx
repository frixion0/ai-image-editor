"use client";

import React from "react";
import type { Tool } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { enhanceImage } from "@/ai/flows/enhance-image";
import { aiImageManipulation } from "@/ai/flows/ai-image-manipulation";

interface ToolOptionsProps {
  activeTool: Tool;
  imageDataUrl: string | null;
  updateImageDataUrl: (url: string) => void;
  setIsLoading: (loading: boolean) => void;
}

export function ToolOptions({
  activeTool,
  imageDataUrl,
  updateImageDataUrl,
  setIsLoading,
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
        updateImageDataUrl(result[outputKey]);
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

  const renderOptions = () => {
    switch (activeTool) {
      case "enhance":
        return (
          <div className="flex flex-col items-center justify-center space-y-4">
            <p className="text-muted-foreground text-sm text-center">Automatically improve image quality using AI.</p>
            <Button size="lg" onClick={() => {
              if (imageDataUrl) {
                handleAIAction(enhanceImage, { photoDataUri: imageDataUrl }, "enhancedPhotoDataUri")
              }
            }}>
              Enhance Image
            </Button>
          </div>
        );
      case "ai-manipulation":
        const placeholder = "e.g., 'add a cat sitting on the bench'";
        const actionFn = aiImageManipulation;
        const inputKey = "instructions";
        const outputKey = "editedPhotoDataUri";

        return (
          <div className="flex flex-col gap-4 h-full">
             <p className="text-muted-foreground text-sm">Describe the changes you want to make to the image.</p>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={placeholder}
              className="flex-grow min-h-[120px]"
            />
            <Button onClick={() => {
              if (imageDataUrl) {
                handleAIAction(actionFn, { photoDataUri: imageDataUrl, [inputKey]: prompt }, outputKey)
              }
            }}>Apply Manipulation</Button>
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
