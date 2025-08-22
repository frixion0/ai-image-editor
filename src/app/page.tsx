"use client";

import React, { useState, useCallback } from "react";
import { Header } from "@/components/header";
import { ImageUpload } from "@/components/image-upload";
import { ToolSidebar } from "@/components/tool-sidebar";
import { EditorCanvas } from "@/components/editor-canvas";
import { ToolOptions } from "@/components/tool-options";
import { HistorySidebar } from "@/components/history-sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import type { Tool } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Undo, Redo } from "lucide-react";

export default function Home() {
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTool, setActiveTool] = useState<Tool>("enhance");

  const { toast } = useToast();

  const currentImageDataUrl = history[historyIndex];

  const updateImageDataUrl = (newUrl: string) => {
    // When updating the image, we truncate the history at the current index
    // and add the new image state.
    const newHistory = [...history.slice(0, historyIndex + 1), newUrl];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleImageUpload = (dataUrl: string) => {
    setHistory([dataUrl]);
    setHistoryIndex(0);
    setIsLoading(false);
  };

  const handleReset = useCallback(() => {
    setHistory([]);
    setHistoryIndex(0);
    setActiveTool("enhance");
  }, []);
  
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
    }
  }, [historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
    }
  }, [historyIndex, history]);

  const handleDownload = () => {
    if (!currentImageDataUrl) {
      toast({
        title: "No image to download",
        description: "Please upload and edit an image first.",
        variant: "destructive",
      });
      return;
    }
    const link = document.createElement("a");
    link.href = currentImageDataUrl;
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
          {currentImageDataUrl ? (
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
                    <div className="flex items-center justify-end gap-2">
                       <Button variant="outline" size="icon" onClick={handleUndo} disabled={historyIndex === 0}>
                         <Undo />
                       </Button>
                       <Button variant="outline" size="icon" onClick={handleRedo} disabled={historyIndex === history.length - 1}>
                         <Redo />
                       </Button>
                    </div>
                    <EditorCanvas
                      imageDataUrl={currentImageDataUrl}
                      isLoading={isLoading}
                    />
                   </div>
                  <HistorySidebar
                    history={history}
                    currentIndex={historyIndex}
                    onSelectHistoryItem={setHistoryIndex}
                  />
                </div>
                <div className="h-40 border-t bg-background p-4">
                  <ToolOptions
                    activeTool={activeTool}
                    imageDataUrl={currentImageDataUrl}
                    updateImageDataUrl={updateImageDataUrl}
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
