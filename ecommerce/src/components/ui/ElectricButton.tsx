"use client";

import React, { useState } from "react";

interface ElectricButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
  disabled?: boolean;
}

export default function ElectricButton({
  children,
  onClick,
  type = "button",
  className = "",
  disabled = false,
}: ElectricButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  const baseStyles: React.CSSProperties = {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "14px 32px",
    fontSize: "16px",
    fontWeight: 600,
    color: "#ffffff",
    background:
      "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
    border: "none",
    borderRadius: "50px",
    cursor: disabled ? "not-allowed" : "pointer",
    overflow: "visible",
    transition: "all 0.3s ease",
    transform: isHovered ? "scale(1.05)" : "scale(1)",
    opacity: disabled ? 0.6 : 1,
  };

  const glowStyles: React.CSSProperties = {
    position: "absolute",
    top: "-4px",
    left: "-4px",
    right: "-4px",
    bottom: "-4px",
    background:
      "linear-gradient(45deg, #00d4ff, #6366f1, #a855f7, #ec4899, #f97316, #eab308, #00d4ff)",
    backgroundSize: "400% 400%",
    borderRadius: "54px",
    zIndex: -1,
    filter: isHovered ? "blur(2px)" : "blur(0px)",
    opacity: isHovered ? 1 : 0.7,
    animation: "electricGlow 3s ease infinite",
  };

  const innerStyles: React.CSSProperties = {
    position: "absolute",
    top: "2px",
    left: "2px",
    right: "2px",
    bottom: "2px",
    background:
      "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
    borderRadius: "48px",
    zIndex: 0,
  };

  return (
    <>
      <style>
        {`
          @keyframes electricGlow {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          @keyframes sparkle {
            0%, 100% { opacity: 0; transform: scale(0); }
            50% { opacity: 1; transform: scale(1); }
          }
        `}
      </style>
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={className}
        style={baseStyles}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <span style={glowStyles} />
        <span style={innerStyles} />
        <span
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          {children}
        </span>
      </button>
    </>
  );
}
