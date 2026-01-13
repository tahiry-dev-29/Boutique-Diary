"use client";

import { useEffect, useRef, ReactNode } from "react";
import anime from "animejs";
import { cn } from "@/lib/utils";

interface ScrollRevealProps {
  children: ReactNode;
  animation?:
    | "fade-up"
    | "fade-down"
    | "fade-left"
    | "fade-right"
    | "scale-up"
    | "zoom-in";
  delay?: number;
  duration?: number;
  threshold?: number;
  className?: string;
  stagger?: number;
  selector?: string;
}

export default function ScrollReveal({
  children,
  animation = "fade-up",
  delay = 0,
  duration = 1000,
  threshold = 0.15,
  className = "",
  stagger = 0,
  selector,
}: ScrollRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const targets = selector
              ? element.querySelectorAll(selector)
              : element;

            if (targets instanceof NodeList && targets.length === 0) {
              if (selector) {
                element.style.opacity = "1";
              }
              observer.unobserve(element);
              return;
            }

            if (selector) {
              anime.set(targets, { opacity: 0 });
            }

            let animeConfig: any = {
              targets,
              opacity: [0, 1],
              delay: anime.stagger(stagger, { start: delay }),
              duration,
              easing: "easeOutExpo",
              complete: () => {
                if (selector) {
                  const items = element.querySelectorAll(selector);
                  items.forEach((item: any) => (item.style.opacity = "1"));
                }
              },
            };

            switch (animation) {
              case "fade-up":
                animeConfig.translateY = [30, 0];
                break;
              case "fade-down":
                animeConfig.translateY = [-30, 0];
                break;
              case "fade-left":
                animeConfig.translateX = [30, 0];
                break;
              case "fade-right":
                animeConfig.translateX = [-30, 0];
                break;
              case "scale-up":
                animeConfig.scale = [0.95, 1];
                break;
              case "zoom-in":
                animeConfig.scale = [0.8, 1];
                break;
            }

            anime(animeConfig);

            if (selector) {
              element.style.opacity = "1";
            }

            observer.unobserve(element);
          }
        });
      },
      { threshold },
    );

    observer.observe(element);

    const failsafe = setTimeout(() => {
      if (element.style.opacity !== "1") {
        element.style.opacity = "1";
        if (selector) {
          const items = element.querySelectorAll(selector);
          items.forEach((item: any) => (item.style.opacity = "1"));
        }
      }
    }, 3000);

    return () => {
      observer.disconnect();
      clearTimeout(failsafe);
    };
  }, [animation, delay, duration, threshold, selector, stagger]);

  return (
    <div ref={containerRef} className={cn(!selector && "opacity-0", className)}>
      {children}
    </div>
  );
}
