"use client";

import React from "react";
import {
  Wand2,
  Eraser,
  Palette,
  Paintbrush,
  Sparkles,
  Download,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import type { Tool, ToolDefinition } from "@/lib/types";

interface ToolSidebarProps {
  activeTool: Tool;
  setActiveTool: (tool: Tool) => void;
  handleDownload: () => void;
  handleReset: () => void;
}

const tools: ToolDefinition[] = [
  { id: "enhance", name: "Enhance", icon: Wand2 },
  { id: "object-removal", name: "Object Removal", icon: Eraser },
  { id: "style-transfer", name: "Style Transfer", icon: Paintbrush },
  { id: "recoloring", name: "Recoloring", icon: Palette },
  { id: "ai-manipulation", name: "AI Manipulation", icon: Sparkles },
];

export function ToolSidebar({
  activeTool,
  setActiveTool,
  handleDownload,
  handleReset,
}: ToolSidebarProps) {
  return (
    <aside className="fixed top-16 left-0 z-10 flex h-[calc(100vh-4rem)] w-20 flex-col items-center border-r bg-background py-4">
      <div className="flex flex-col items-center gap-2">
        {tools.map((tool) => (
          <Tooltip key={tool.id}>
            <TooltipTrigger asChild>
              <Button
                variant={activeTool === tool.id ? "secondary" : "ghost"}
                size="icon"
                className="h-14 w-14 flex-col gap-1 rounded-xl text-xs"
                onClick={() => setActiveTool(tool.id)}
                aria-label={tool.name}
              >
                <tool.icon className="h-6 w-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{tool.name}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
      <div className="mt-auto flex flex-col items-center gap-2">
        <Separator className="my-2 w-10" />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-14 w-14"
              onClick={handleDownload}
              aria-label="Download Image"
            >
              <Download className="h-6 w-6" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Download</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-14 w-14 text-destructive hover:text-destructive"
              onClick={handleReset}
              aria-label="Reset and start over"
            >
              <Trash2 className="h-6 w-6" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Start Over</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </aside>
  );
}
