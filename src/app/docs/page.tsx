"use client";

import React, { useState } from 'react';
import { Header } from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ImageUpload } from '@/components/image-upload';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

const CodeBlock = ({ code, className }: { code: string, className?: string }) => {
  const [hasCopied, setHasCopied] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code).then(() => {
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
      toast({
        title: "Copied!",
        description: "The code has been copied to your clipboard.",
      });
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      toast({
        title: "Error",
        description: "Failed to copy code to clipboard.",
        variant: "destructive",
      });
    });
  };

  return (
    <div className={cn("relative", className)}>
      <pre className="bg-muted p-4 pr-12 rounded-lg text-sm overflow-x-auto">
        <code>{code}</code>
      </pre>
      <Button
        size="icon"
        variant="ghost"
        className="absolute top-2 right-2 h-8 w-8"
        onClick={copyToClipboard}
      >
        {hasCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
        <span className="sr-only">Copy code</span>
      </Button>
    </div>
  );
};

const APITester = ({ endpoint, fields, fullApiUrl: initialFullApiUrl }: { endpoint: string; fields: { name: string; type: string; placeholder: string }[]; fullApiUrl: string; }) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [fullApiUrl, setFullApiUrl] = useState(initialFullApiUrl);
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
    setApiError(null);

    try {
      const response = await fetch(fullApiUrl, {
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
        setApiError(error.message);
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
         <div className="space-y-2">
            <label htmlFor="apiUrl" className="text-sm font-medium">API Endpoint URL</label>
            <Input
                id="apiUrl"
                value={fullApiUrl}
                onChange={(e) => setFullApiUrl(e.target.value)}
                placeholder="Enter the full API URL"
            />
        </div>
        
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
        ) : apiError ? (
            <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                    {apiError}
                </AlertDescription>
            </Alert>
        ) : (
          <p className="text-muted-foreground">API response will be displayed here</p>
        )}
      </div>
    </div>
  );
};


export default function DocsPage() {
  const deploymentUrl = 'https://ai-image-editor-eta.vercel.app';
  
  const enhanceUrl = `${deploymentUrl}/api/enhance`;
  const manipulateUrl = `${deploymentUrl}/api/manipulate`;
  const telegramWebhookUrl = `${deploymentUrl}/api/telegram/webhook`;

  const enhanceExample = `fetch('${enhanceUrl}', {
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

  const enhanceSuccessResponse = `{
  "enhancedPhotoDataUri": "data:image/png;base64,..."
}`;
  const enhanceErrorResponse = `{
  "error": "Failed to enhance image"
}`;

  const manipulateExample = `fetch('${manipulateUrl}', {
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

  const manipulateSuccessResponse = `{
  "editedPhotoDataUri": "data:image/png;base64,..."
}`;
  const manipulateErrorResponse = `{
  "error": "The AI failed to generate an image. This might be due to safety settings or other restrictions. Please try a different prompt."
}`;

  const setWebhookCurl = `curl -F "url=${telegramWebhookUrl}" "https://api.telegram.org/bot<YOUR_TELEGRAM_BOT_TOKEN>/setWebhook"`;
  
  const webhookTestPayload = `{
  "update_id": 12345678,
  "message": {
    "message_id": 123,
    "from": {
      "id": 1234567,
      "is_bot": false,
      "first_name": "John",
      "last_name": "Doe",
      "username": "johndoe",
      "language_code": "en"
    },
    "chat": {
      "id": 1234567,
      "first_name": "John",
      "last_name": "Doe",
      "username": "johndoe",
      "type": "private"
    },
    "date": 1678886400,
    "text": "Hello bot!"
  }
}`;


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
              <TabsTrigger value="telegram-webhook">Telegram Webhook</TabsTrigger>
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
                  <div className="space-y-4">
                    <h3 className="font-semibold mb-2">Example</h3>
                    <div>
                        <h4 className="font-semibold text-xs mb-2 uppercase text-muted-foreground">Code (JavaScript Fetch)</h4>
                        <CodeBlock code={enhanceExample} />
                    </div>
                    <div>
                        <h4 className="font-semibold text-xs mt-4 mb-2 uppercase text-muted-foreground">Success Response (200)</h4>
                        <CodeBlock code={enhanceSuccessResponse} className="json" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-xs mt-4 mb-2 uppercase text-muted-foreground">Error Response (500)</h4>
                        <CodeBlock code={enhanceErrorResponse} className="json" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mt-8 mb-4">API Tester</h3>
                    <APITester endpoint="enhance" fields={[{ name: 'photoDataUri', type: 'file', placeholder: '' }]} fullApiUrl={enhanceUrl} />
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
                  <div className="space-y-4">
                    <h3 className="font-semibold mb-2">Example</h3>
                    <div>
                        <h4 className="font-semibold text-xs mb-2 uppercase text-muted-foreground">Code (JavaScript Fetch)</h4>
                        <CodeBlock code={manipulateExample} />
                    </div>
                    <div>
                        <h4 className="font-semibold text-xs mt-4 mb-2 uppercase text-muted-foreground">Success Response (200)</h4>
                        <CodeBlock code={manipulateSuccessResponse} className="json" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-xs mt-4 mb-2 uppercase text-muted-foreground">Error Response (500)</h4>
                        <CodeBlock code={manipulateErrorResponse} className="json" />
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mt-8 mb-4">API Tester</h3>
                    <APITester 
                      endpoint="manipulate" 
                      fields={[
                        { name: 'photoDataUri', type: 'file', placeholder: '' },
                        { name: 'instructions', type: 'textarea', placeholder: 'e.g., "add a hat on the person"' }
                      ]} 
                      fullApiUrl={manipulateUrl}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

             <TabsContent value="telegram-webhook">
              <Card>
                <CardHeader>
                  <CardTitle>Telegram Bot Webhook</CardTitle>
                  <CardDescription>
                    Use our AI image editor directly from Telegram. Send a photo with a caption to the bot.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2">Webhook URL</h3>
                    <p className="font-mono text-sm bg-muted p-2 rounded">{telegramWebhookUrl}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Setup Command</h3>
                    <p className="text-sm text-muted-foreground mb-2">Run the following command in your terminal to set the webhook for your bot. Replace `&lt;YOUR_TELEGRAM_BOT_TOKEN&gt;` with your actual bot token.</p>
                    <CodeBlock code={setWebhookCurl} />
                  </div>
                   <div>
                    <h3 className="font-semibold mb-2">Test Webhook</h3>
                     <p className="text-sm text-muted-foreground mb-2">You can test the endpoint by sending a POST request with a payload like the one below.</p>
                     <CodeBlock code={webhookTestPayload} className="json" />
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
