"use client";

import React, { useState, useCallback } from "react";
import { Header } from "@/components/header";
import { ImageUpload } from "@/components/image-upload";
import { ToolSidebar } from "@/components/tool-sidebar";
import { EditorCanvas } from "@/components/editor-canvas";
import { ToolOptions } from "@/components/tool-options";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import type { Tool } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Undo, Redo } from "lucide-react";

export default function Home() {
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTool, setActiveTool] = useState<Tool>("enhance");

  const { toast } = useToast();

  const handleImageUpload = (dataUrl: string) => {
    setImageDataUrl(dataUrl);
    setIsLoading(false);
  };

  const handleReset = useCallback(() => {
    setImageDataUrl(null);
    setActiveTool("enhance");
  }, []);

  const handleDownload = () => {
    if (!imageDataUrl) {
      toast({
        title: "No image to download",
        description: "Please upload and edit an image first.",
        variant: "destructive",
      });
      return;
    }
    const link = document.createElement("a");
    link.href = imageDataUrl;
    link.download = `imagia-ai-edit-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <TooltipProvider>
      <div className="flex h-screen w-screen flex-col bg-background font-sans text-foreground">
        <Header />
        <main className="flex flex-1 pt-16 overflow-hidden">
          {imageDataUrl ? (
            <>
              <ToolSidebar
                activeTool={activeTool}
                setActiveTool={setActiveTool}
                handleDownload={handleDownload}
                handleReset={handleReset}
              />
              <div className="flex flex-1 flex-col pl-20">
                <div className="flex-1 p-4 flex gap-4">
                   <div className="flex-1 flex flex-col gap-4">
                    <EditorCanvas
                      imageDataUrl={imageDataUrl}
                      isLoading={isLoading}
                    />
                   </div>
                </div>
                <div className="h-40 border-t bg-background p-4">
                  <ToolOptions
                    activeTool={activeTool}
                    imageDataUrl={imageDataUrl}
                    updateImageDataUrl={setImageDataUrl}
                    setIsLoading={setIsLoading}
                  />
                </div>
              </div>
            </>
          ) : (
            <ImageUpload onImageUpload={handleImageUpload} setIsLoading={setIsLoading} />
          )}
        </main>
      </div>
    </TooltipProvider>
  );
}
