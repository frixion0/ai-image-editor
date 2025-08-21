"use client";

import React, { useCallback, useState } from "react";
import { UploadCloud } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

interface ImageUploadProps {
  onImageUpload: (dataUrl: string) => void;
  setIsLoading: (isLoading: boolean) => void;
}

export function ImageUpload({ onImageUpload, setIsLoading }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const handleFile = useCallback((file: File) => {
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/gif"].includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a JPEG, PNG, or GIF image.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === "string") {
        onImageUpload(e.target.result);
      }
      setIsLoading(false);
    };
    reader.onerror = () => {
      toast({
        title: "Error Reading File",
        description: "There was an issue processing your image.",
        variant: "destructive",
      });
      setIsLoading(false);
    };
    reader.readAsDataURL(file);
  }, [onImageUpload, setIsLoading, toast]);

  const onDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="flex h-full w-full items-center justify-center p-4">
      <div
        className={`flex w-full max-w-2xl flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-card p-12 text-center transition-colors duration-300 ${isDragging ? "border-primary bg-primary/10" : ""}`}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        <div className="mb-6 rounded-full bg-primary/10 p-4 text-primary">
          <UploadCloud className="h-12 w-12" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-card-foreground">
          Drag & Drop Your Image
        </h2>
        <p className="mt-2 text-muted-foreground">
          or click below to select a file from your computer
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Supports: PNG, JPG, GIF
        </p>
        <input
          type="file"
          id="file-upload"
          className="sr-only"
          accept="image/png, image/jpeg, image/gif"
          onChange={onFileSelect}
        />
        <Button asChild className="mt-6" size="lg">
          <label htmlFor="file-upload">Choose a File</label>
        </Button>
      </div>
    </div>
  );
}
