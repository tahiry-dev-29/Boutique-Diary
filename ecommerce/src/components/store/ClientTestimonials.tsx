"use client";

import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import anime from "animejs";
import { cn } from "@/lib/utils";

interface Testimonial {
  id: number | string;
  name: string;
  date: string;
  rating: number;
  title: string;
  review: string;
}

interface ClientTestimonialsProps {
  testimonials: Testimonial[];
}

export default function ClientTestimonials({
  testimonials,
}: ClientTestimonialsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          anime({
            targets: ".testimonial-card",
            translateY: [50, 0],
            opacity: [0, 1],
            delay: anime.stagger(150),
            easing: "easeOutExpo",
            duration: 1200,
          });
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [testimonials]);

  if (!testimonials || testimonials.length === 0) return null;

  const nextSlide = () => {
    setCurrentIndex(prev => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setCurrentIndex(
      prev => (prev - 1 + testimonials.length) % testimonials.length,
    );
  };

  return (
    <section
      ref={sectionRef}
      className="py-24 px-4 md:px-6 mb-16 overflow-hidden"
    >
      <div className="max-w-[1400px] mx-auto">
        <div className="text-center mb-16 space-y-4">
          <span className="text-xs font-black uppercase tracking-[0.3em] text-primary">
            Témoignages
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-foreground tracking-tighter uppercase">
            Nos clients satisfaits
          </h2>
          <div className="w-20 h-1.5 bg-primary mx-auto rounded-full" />
        </div>

        <div className="relative flex items-center gap-4">
          <button
            onClick={prevSlide}
            className="hidden md:flex w-14 h-14 rounded-full bg-background border border-border items-center justify-center hover:bg-foreground hover:text-background transition-all shadow-xl active:scale-90 group z-10"
          >
            <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
          </button>

          <div className="flex-1 overflow-hidden">
            <div
              ref={containerRef}
              className="flex transition-transform duration-700 ease-in-out gap-6 px-4"
              style={{
                transform: `translateX(calc(-${currentIndex * (100 / (window?.innerWidth < 768 ? 1 : 2))}%))`,
              }}
            >
              {testimonials.map((item, index) => (
                <div
                  key={item.id}
                  className={cn(
                    "testimonial-card min-w-full md:min-w-[calc(50%-12px)] bg-card border border-border p-10 rounded-[40px] text-left shadow-[var(--card-shadow)] relative group hover:shadow-[var(--card-shadow)] transition-all duration-500",
                    index === currentIndex
                      ? "scale-100 opacity-100"
                      : "scale-95 opacity-50",
                  )}
                >
                  <Quote className="absolute top-8 right-10 w-12 h-12 text-muted-foreground opacity-10 group-hover:scale-110 transition-transform duration-500" />

                  <div className="flex justify-between items-start mb-8">
                    <div className="flex gap-4">
                      <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-border shadow-inner">
                        <img
                          src={`https://i.pravatar.cc/150?u=${item.id}`}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-black text-[15px] text-foreground uppercase tracking-tight">
                          {item.name}
                        </h4>
                        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                          {item.date}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "w-4 h-4",
                            i < item.rating
                              ? "fill-amber-400 text-amber-400"
                              : "fill-muted text-muted",
                          )}
                        />
                      ))}
                    </div>
                  </div>

                  <h3 className="font-black text-lg mb-3 text-foreground leading-tight uppercase tracking-tight italic">
                    {item.title}
                  </h3>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed font-medium line-clamp-4 italic">
                    "{item.review}"
                  </p>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={nextSlide}
            className="hidden md:flex w-14 h-14 rounded-full bg-background border border-border items-center justify-center hover:bg-foreground hover:text-background transition-all shadow-xl active:scale-90 group z-10"
          >
            <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="flex justify-center gap-2 mt-12">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                i === currentIndex
                  ? "w-10 bg-primary"
                  : "w-2 bg-muted hover:bg-muted-foreground",
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
