"use client";

import React, { useRef, useEffect, useCallback } from "react";
import { Loader } from "lucide-react";

interface EditorCanvasProps {
  imageDataUrl: string | null;
  isLoading: boolean;
}

export function EditorCanvas({
  imageDataUrl,
  isLoading,
}: EditorCanvasProps) {
  const imageCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const drawImage = useCallback(() => {
    if (!imageDataUrl || !imageCanvasRef.current || !containerRef.current) return;

    const canvas = imageCanvasRef.current;
    const container = containerRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const image = new Image();
    image.src = imageDataUrl;
    image.onload = () => {
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;

      const imageAspectRatio = image.width / image.height;
      const containerAspectRatio = containerWidth / containerHeight;

      let scaledWidth, scaledHeight;
      if (imageAspectRatio > containerAspectRatio) {
        scaledWidth = containerWidth;
        scaledHeight = containerWidth / imageAspectRatio;
      } else {
        scaledHeight = containerHeight;
        scaledWidth = containerHeight * imageAspectRatio;
      }
      
      canvas.width = image.width;
      canvas.height = image.height;

      canvas.style.width = `${scaledWidth}px`;
      canvas.style.height = `${scaledHeight}px`;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    };
  }, [imageDataUrl]);

  useEffect(() => {
    drawImage();
    const resizeObserver = new ResizeObserver(drawImage);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, [drawImage]);

  return (
    <div ref={containerRef} className="relative h-full w-full flex items-center justify-center bg-muted/20 rounded-lg overflow-hidden">
      <canvas ref={imageCanvasRef} className="max-h-full max-w-full object-contain" />
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
          <Loader className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-lg font-medium text-foreground">
            Applying AI magic...
          </p>
        </div>
      )}
    </div>
  );
}
