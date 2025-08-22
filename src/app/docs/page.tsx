"use client";

import React, { useState } from 'react';
import { Header } from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ImageUpload } from '@/components/image-upload';

const CodeBlock = ({ code }: { code: string }) => (
  <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
    <code>{code}</code>
  </pre>
);

const APITester = ({ endpoint, fields }: { endpoint: string; fields: { name: string; type: string; placeholder: string }[] }) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = (dataUrl: string) => {
    setImageDataUrl(dataUrl);
    setFormData(prev => ({ ...prev, photoDataUri: dataUrl }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch(`/api/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'API request failed');
      }

      if (data.enhancedPhotoDataUri) {
        setResult(data.enhancedPhotoDataUri);
      } else if (data.editedPhotoDataUri) {
        setResult(data.editedPhotoDataUri);
      } else {
        throw new Error('No image data in API response');
      }

    } catch (error: any) {
      toast({
        title: "API Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="font-mono text-sm">POST /api/{endpoint}</p>
        
        <Card>
          <CardContent className="pt-6">
            {!imageDataUrl ? (
                <ImageUpload onImageUpload={handleFileChange} setIsLoading={setIsLoading}/>
            ) : (
                <div className="space-y-4">
                    <img src={imageDataUrl} alt="Uploaded preview" className="rounded-lg max-h-60" />
                    <Button variant="outline" onClick={() => setImageDataUrl(null)}>Change Image</Button>
                </div>
            )}
          </CardContent>
        </Card>

        {fields.filter(f => f.name !== 'photoDataUri').map(field => (
          <div key={field.name}>
             {field.type === 'textarea' ? (
              <Textarea
                name={field.name}
                placeholder={field.placeholder}
                onChange={handleChange}
                required
                className="min-h-[100px]"
              />
            ) : (
              <Input
                name={field.name}
                type={field.type}
                placeholder={field.placeholder}
                onChange={handleChange}
                required
              />
            )}
          </div>
        ))}
        <Button type="submit" disabled={isLoading || !imageDataUrl}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Test Endpoint
        </Button>
      </form>
      <div className="bg-muted/50 rounded-lg p-4 flex items-center justify-center">
        {isLoading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p>Processing...</p>
          </div>
        ) : result ? (
          <img src={result} alt="API Result" className="rounded-lg max-h-full max-w-full" />
        ) : (
          <p className="text-muted-foreground">API response will be displayed here</p>
        )}
      </div>
    </div>
  );
};


export default function DocsPage() {
  const baseUrl = "https://9000-firebase-studio-1755789802422.cluster-73qgvk7hjjadkrjeyexca5ivva.cloudworkstations.dev";

  const enhanceExample = `fetch('${baseUrl}/api/enhance', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    photoDataUri: 'data:image/jpeg;base64,...' // Your base64 encoded image data URI
  }),
})
.then(response => response.json())
.then(data => console.log(data));`;

  const manipulateExample = `fetch('${baseUrl}/api/manipulate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    photoDataUri: 'data:image/jpeg;base64,...', // Your base64 encoded image data URI
    instructions: 'Make the sky blue'
  }),
})
.then(response => response.json())
.then(data => console.log(data));`;

  return (
    <div className="flex h-screen w-screen flex-col bg-background font-sans text-foreground">
      <Header />
      <main className="flex-1 pt-16 overflow-y-auto p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">Imagia AI API</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Integrate our powerful AI image editing capabilities into your own applications.
          </p>

          <Tabs defaultValue="enhance">
            <TabsList className="mb-4">
              <TabsTrigger value="enhance">Enhance Image</TabsTrigger>
              <TabsTrigger value="ai-manipulation">AI Manipulation</TabsTrigger>
            </TabsList>
            
            <TabsContent value="enhance">
              <Card>
                <CardHeader>
                  <CardTitle>Enhance Image API</CardTitle>
                  <CardDescription>
                    Automatically improve image quality using AI. This endpoint sharpens, denoises, and improves the overall visual appeal of an image.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2">HTTP Request</h3>
                    <p className="font-mono text-sm bg-muted p-2 rounded">POST /api/enhance</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Request Body (JSON)</h3>
                    <ul className="list-disc pl-5 font-mono text-sm">
                        <li><span className="font-semibold">photoDataUri</span> (string, required): A data URI of the image to enhance.</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Example Code (JavaScript Fetch)</h3>
                    <CodeBlock code={enhanceExample} />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">API Tester</h3>
                    <APITester endpoint="enhance" fields={[{ name: 'photoDataUri', type: 'file', placeholder: '' }]} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ai-manipulation">
              <Card>
                <CardHeader>
                  <CardTitle>AI Manipulation API</CardTitle>
                  <CardDescription>
                    Manipulate an image based on natural language instructions.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2">HTTP Request</h3>
                    <p className="font-mono text-sm bg-muted p-2 rounded">POST /api/manipulate</p>
                  </div>
                    <div>
                        <h3 className="font-semibold mb-2">Request Body (JSON)</h3>
                        <ul className="list-disc pl-5 font-mono text-sm">
                            <li><span className="font-semibold">photoDataUri</span> (string, required): A data URI of the image to manipulate.</li>
                            <li><span className="font-semibold">instructions</span> (string, required): Text description of the manipulation to perform.</li>
                        </ul>
                    </div>
                  <div>
                    <h3 className="font-semibold mb-2">Example Code (JavaScript Fetch)</h3>
                    <CodeBlock code={manipulateExample} />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">API Tester</h3>
                    <APITester endpoint="manipulate" fields={[
                      { name: 'photoDataUri', type: 'file', placeholder: '' },
                      { name: 'instructions', type: 'textarea', placeholder: 'e.g., "add a hat on the person"' }
                    ]} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
