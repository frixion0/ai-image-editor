"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { Loader } from "lucide-react";

interface EditorCanvasProps {
  imageDataUrl: string | null;
  activeTool: string;
  isLoading: boolean;
  brushSize: number;
  maskCanvasRef: React.RefObject<HTMLCanvasElement>;
}

export function EditorCanvas({
  imageDataUrl,
  activeTool,
  isLoading,
  brushSize,
  maskCanvasRef,
}: EditorCanvasProps) {
  const imageCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState<{ x: number; y: number } | null>(null);

  const drawImage = useCallback(() => {
    if (!imageDataUrl || !imageCanvasRef.current || !maskCanvasRef.current || !containerRef.current) return;
    
    const image = new Image();
    image.src = imageDataUrl;
    image.onload = () => {
      const canvas = imageCanvasRef.current!;
      const maskCanvas = maskCanvasRef.current!;
      const container = containerRef.current!;
      
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      
      const imageAspectRatio = image.width / image.height;
      const containerAspectRatio = containerWidth / containerHeight;
      
      let canvasWidth, canvasHeight;
      
      if (imageAspectRatio > containerAspectRatio) {
        canvasWidth = containerWidth;
        canvasHeight = containerWidth / imageAspectRatio;
      } else {
        canvasHeight = containerHeight;
        canvasWidth = containerHeight * imageAspectRatio;
      }
      
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      maskCanvas.width = canvasWidth;
      maskCanvas.height = canvasHeight;
      
      const ctx = canvas.getContext("2d");
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      ctx?.drawImage(image, 0, 0, canvasWidth, canvasHeight);
    };
  }, [imageDataUrl, maskCanvasRef]);

  useEffect(() => {
    drawImage();
    window.addEventListener('resize', drawImage);
    return () => window.removeEventListener('resize', drawImage);
  }, [drawImage, imageDataUrl]);

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };
  
  const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const pos = getMousePos(e);
    const maskCtx = maskCanvasRef.current?.getContext("2d");
    if (maskCtx && lastPos) {
      maskCtx.beginPath();
      maskCtx.strokeStyle = "rgba(255, 255, 255, 1)";
      maskCtx.lineWidth = brushSize;
      maskCtx.lineCap = "round";
      maskCtx.lineJoin = "round";
      maskCtx.moveTo(lastPos.x, lastPos.y);
      maskCtx.lineTo(pos.x, pos.y);
      maskCtx.stroke();
    }
    setLastPos(pos);
  }, [isDrawing, lastPos, brushSize, maskCanvasRef]);
  
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool !== 'object-removal') return;
    setIsDrawing(true);
    setLastPos(getMousePos(e));
  };
  
  const stopDrawing = () => {
    setIsDrawing(false);
    setLastPos(null);
  };

  return (
    <div ref={containerRef} className="relative h-full w-full flex items-center justify-center bg-muted/20 rounded-lg overflow-hidden">
      <canvas ref={imageCanvasRef} className="max-h-full max-w-full object-contain rounded-lg shadow-md" />
      {activeTool === "object-removal" && (
        <canvas
          ref={maskCanvasRef}
          className="absolute top-0 left-0 right-0 bottom-0 m-auto cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
      )}
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
