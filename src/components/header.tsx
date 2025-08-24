import React from "react";
import Link from 'next/link';
import { Button } from "@/components/ui/button";

const Logo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M20 16.5C20 18.9853 17.9853 21 15.5 21H8.5C6.01472 21 4 18.9853 4 16.5V9.5C4 7.01472 6.01472 5 8.5 5H14"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 3L13.1213 7.37868L17.5 8.5L13.1213 9.62132L12 14L10.8787 9.62132L6.5 8.5L10.8787 7.37868L12 3Z"
      stroke="hsl(var(--primary))"
      fill="hsl(var(--primary) / 0.3)"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);


export function Header() {
  return (
    <header className="absolute top-0 left-0 right-0 z-20 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm">
      <Link href="/" className="flex items-center gap-2">
        <Logo className="text-foreground" />
        <h1 className="text-lg font-semibold text-foreground">Imagia AI</h1>
      </Link>
      <div className="flex items-center gap-4">
        <Button variant="ghost" asChild>
            <Link href="/docs">API Docs</Link>
        </Button>
         <Button variant="ghost" asChild>
            <a href="/api-examples.html" target="_blank">HTML Examples</a>
        </Button>
        <Button variant="ghost" asChild>
            <a href="/image-editor.html" target="_blank">Standalone Editor</a>
        </Button>
      </div>
    </header>
  );
}
