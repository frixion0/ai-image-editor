import React from "react";

const Logo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 256 256"
    width="28"
    height="28"
    {...props}
  >
    <path fill="none" d="M0 0h256v256H0z" />
    <path
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="16"
      d="M96 216V88a32 32 0 0 1 64 0v128m-96-80h128"
    />
    <path
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="16"
      d="M32 128h192"
    />
    <path
      d="M128 52a24 24 0 1 1-24-24 24 24 0 0 1 24 24Z"
      fill="hsl(var(--primary))"
    />
  </svg>
);

export function Header() {
  return (
    <header className="absolute top-0 left-0 right-0 z-20 flex h-16 items-center border-b bg-background/80 px-4 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <Logo className="text-primary" />
        <h1 className="text-lg font-semibold text-primary-foreground">Imagia AI</h1>
      </div>
    </header>
  );
}
