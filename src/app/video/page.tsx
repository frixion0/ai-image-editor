"use client";

import React, { useState } from 'react';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Video } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';


export default function VideoGenerationPage() {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [videoDataUri, setVideoDataUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt) {
      toast({
        title: "Prompt is required",
        description: "Please enter a prompt to generate a video.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setVideoDataUri(null);

    try {
      const response = await fetch('/api/generate-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate video');
      }

      setVideoDataUri(data.videoDataUri);
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Video Generation Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen flex-col bg-background font-sans text-foreground">
      <Header />
      <main className="flex-1 pt-16 overflow-y-auto p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">AI Video Generator</CardTitle>
              <CardDescription>Enter a text prompt to create a unique video using AI.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., 'A majestic dragon soaring over a mystical forest at dawn.'"
                  disabled={isLoading}
                  className="text-base"
                />
                <Button type="submit" disabled={isLoading} className="w-full" size="lg">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Generating... (this may take a minute)
                    </>
                  ) : (
                    'Generate Video'
                  )}
                </Button>
              </form>

              <div className="mt-8">
                {isLoading && (
                   <div className="w-full aspect-video bg-muted rounded-lg flex flex-col items-center justify-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="mt-4 text-lg font-medium text-foreground">
                      The AI is creating your video...
                    </p>
                    <p className="text-sm text-muted-foreground">Please be patient, this can take up to a minute.</p>
                  </div>
                )}
                {error && !isLoading && (
                  <Alert variant="destructive">
                      <Terminal className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>
                          {error}
                      </AlertDescription>
                  </Alert>
                )}
                {videoDataUri && !isLoading && (
                  <div className="w-full aspect-video">
                    <video
                      src={videoDataUri}
                      controls
                      autoPlay
                      loop
                      className="w-full h-full rounded-lg bg-black"
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                )}
                 {!videoDataUri && !isLoading && !error && (
                    <div className="w-full aspect-video bg-muted/50 rounded-lg flex flex-col items-center justify-center text-center">
                        <Video className="h-16 w-16 text-muted-foreground" />
                        <p className="mt-4 text-muted-foreground">Your generated video will appear here.</p>
                    </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
