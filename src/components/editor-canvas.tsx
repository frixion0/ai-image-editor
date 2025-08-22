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

      let canvasWidth, canvasHeight;
      if (imageAspectRatio > containerAspectRatio) {
        canvasWidth = containerWidth;
        canvasHeight = containerWidth / imageAspectRatio;
      } else {
        canvasHeight = containerHeight;
        canvasWidth = containerHeight * imageAspectRatio;
      }
      
      canvas.width = image.width;
      canvas.height = image.height;
      
      const maskCanvas = maskCanvasRef.current;
      if (maskCanvas) {
        maskCanvas.width = image.width;
        maskCanvas.height = image.height;
      }

      // We set the canvas style to scale it down, but keep the drawing resolution sharp
      canvas.style.width = `${canvasWidth}px`;
      canvas.style.height = `${canvasHeight}px`;

      if (maskCanvas) {
        maskCanvas.style.width = `${canvasWidth}px`;
        maskCanvas.style.height = `${canvasHeight}px`;
      }


      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    };
  }, [imageDataUrl, maskCanvasRef]);

  useEffect(() => {
    drawImage();
    window.addEventListener('resize', drawImage);
    return () => {
      window.removeEventListener('resize', drawImage);
    };
  }, [drawImage]);

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const canvas = maskCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    return {
        x: (e.clientX - rect.left) * (canvas.width / rect.width),
        y: (e.clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const pos = getMousePos(e);
    const maskCtx = maskCanvasRef.current?.getContext("2d");
    if (maskCtx && lastPos) {
      maskCtx.beginPath();
      maskCtx.strokeStyle = "rgba(255, 255, 255, 0.7)";
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
    const maskCtx = maskCanvasRef.current?.getContext("2d");
    if (!maskCtx) return;

    setIsDrawing(true);
    const pos = getMousePos(e);
    setLastPos(pos);
    
    // Start drawing immediately
    const event = new MouseEvent('mousemove', {
      clientX: e.clientX,
      clientY: e.clientY,
    });
    e.currentTarget.dispatchEvent(event);
  };
  
  const stopDrawing = () => {
    setIsDrawing(false);
    setLastPos(null);
  };

  return (
    <div ref={containerRef} className="relative h-full w-full flex items-center justify-center bg-muted/20 rounded-lg overflow-hidden">
      <canvas ref={imageCanvasRef} className="max-h-full max-w-full object-contain" />
      {activeTool === "object-removal" && (
        <canvas
          ref={maskCanvasRef}
          className="absolute cursor-crosshair"
          style={{
            width: imageCanvasRef.current?.style.width,
            height: imageCanvasRef.current?.style.height,
          }}
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
