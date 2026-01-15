"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  variant?: "light" | "dark";
}

export default function BrandLogo({
  className,
  variant = "dark",
}: BrandLogoProps) {
  const isDark = variant === "dark";

  return (
    <div className={cn("w-32 h-auto overflow-visible", className)}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 400 250"
        className="w-full h-auto overflow-visible"
      >
        <defs>
          <linearGradient id="brandGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop
              offset="0%"
              style={{ stopColor: "var(--store-primary)", stopOpacity: 1 }}
            />
            <stop
              offset="50%"
              style={{ stopColor: "var(--store-secondary)", stopOpacity: 1 }}
            />
            <stop
              offset="100%"
              style={{ stopColor: "var(--store-primary)", stopOpacity: 1 }}
            />
          </linearGradient>
        </defs>

        <style>
          {`
            .path-draw {
              stroke-dasharray: 450;
              stroke-dashoffset: 450;
              animation: drawLine 2.5s cubic-bezier(0.25, 1, 0.5, 1) forwards;
            }

            .title-anim {
              opacity: 0;
              transform: translateY(20px);
              animation: slideUpFade 1.2s ease-out 1s forwards;
            }

            .subtitle-anim {
              opacity: 0;
              letter-spacing: 0.1em;
              animation: expandTracking 1.5s ease-out 1.8s forwards;
            }

            .dot-anim {
              opacity: 0;
              transform: scale(0);
              transform-origin: center;
              animation: popIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) 2.2s forwards;
            }

            @keyframes drawLine {
              to { stroke-dashoffset: 0; }
            }

            @keyframes slideUpFade {
              to { 
                opacity: 1; 
                transform: translateY(0);
              }
            }

            @keyframes expandTracking {
              from { opacity: 0; letter-spacing: 0.1em; }
              to { opacity: 1; letter-spacing: 0.4em; }
            }

            @keyframes popIn {
              to { opacity: 1; transform: scale(1); }
            }
          `}
        </style>

        <g transform="translate(200, 100)">
          <path
            className="path-draw"
            d="M-60,-40 C-60,-40 -30,-70 0,-45 C30,-20 60,-70 60,-40 C60,-10 10,20 -60,10"
            fill="none"
            stroke="url(#brandGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <path
            className="path-draw"
            style={{ animationDelay: "0.5s" }}
            d="M-50,20 C-20,35 20,35 50,20"
            fill="none"
            stroke={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}
            strokeWidth="2"
            strokeLinecap="round"
          />

          <text
            x="0"
            y="60"
            textAnchor="middle"
            className="title-anim"
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "52px",
              fill: isDark ? "#ffffff" : "var(--foreground)",
              fontStyle: "italic",
            }}
          >
            Diary
          </text>

          <text
            x="0"
            y="90"
            textAnchor="middle"
            className="subtitle-anim"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "12px",
              fill: isDark
                ? "rgba(255,255,255,0.4)"
                : "var(--muted-foreground)",
              fontWeight: 400,
            }}
          >
            BOUTIQUE
          </text>

          <circle
            cx="0"
            cy="105"
            r="2"
            fill="url(#brandGradient)"
            className="dot-anim"
          />
        </g>
      </svg>
    </div>
  );
}
