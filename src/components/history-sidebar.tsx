"use client";

import React from "react";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface HistorySidebarProps {
  history: string[];
  currentIndex: number;
  onSelectHistoryItem: (index: number) => void;
}

export function HistorySidebar({
  history,
  currentIndex,
  onSelectHistoryItem,
}: HistorySidebarProps) {
  return (
    <aside className="w-64 border-l bg-background p-2">
      <h3 className="text-lg font-semibold p-2">History</h3>
      <ScrollArea className="h-[calc(100%-2rem)]">
        <div className="flex flex-col gap-2 p-2">
          {history.map((imageDataUrl, index) => (
            <button
              key={index}
              onClick={() => onSelectHistoryItem(index)}
              className={cn(
                "rounded-md border-2 p-1 transition-all",
                index === currentIndex
                  ? "border-primary"
                  : "border-transparent hover:border-primary/50"
              )}
            >
              <Image
                src={imageDataUrl}
                alt={`History item ${index + 1}`}
                width={200}
                height={150}
                className="object-contain rounded-sm"
              />
              <p className="text-xs text-center mt-1 text-muted-foreground">
                {index === 0 ? "Original" : `Edit ${index}`}
              </p>
            </button>
          ))}
        </div>
      </ScrollArea>
    </aside>
  );
}
