"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface StoreTypewriterProps {
  text: string;
  speed?: number;
  delay?: number;
  className?: string;
}

export default function StoreTypewriter({
  text,
  speed = 30,
  delay = 500,
  className,
}: StoreTypewriterProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [isStarted, setIsStarted] = useState(false);

  useEffect(() => {
    const startTimeout = setTimeout(() => {
      setIsStarted(true);
    }, delay);

    return () => clearTimeout(startTimeout);
  }, [delay]);

  useEffect(() => {
    if (!isStarted) return;

    if (displayedText.length < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(text.slice(0, displayedText.length + 1));
      }, speed);
      return () => clearTimeout(timeout);
    }
  }, [displayedText, text, isStarted, speed]);

  return (
    <span className={cn("relative inline-block", className)}>
      {}
      <span
        className="invisible opacity-0 select-none pointer-events-none"
        aria-hidden="true"
      >
        {text}
        <span className="inline-block w-0.5 h-[1em] ml-1 bg-current align-middle" />
      </span>

      {}
      <span className="absolute left-0 top-0 w-full h-full">
        {displayedText}
        {displayedText.length < text.length && (
          <span className="inline-block w-0.5 h-[1em] ml-1 bg-current animate-pulse align-middle" />
        )}
      </span>
    </span>
  );
}
