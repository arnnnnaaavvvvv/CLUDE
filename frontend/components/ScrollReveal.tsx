"use client";

import React, { useEffect, useRef, useState } from "react";

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  direction?: "up" | "down" | "left" | "right" | "fade" | "zoom";
  delay?: number; // in milliseconds
  duration?: number; // in milliseconds
  threshold?: number;
  once?: boolean;
}

export function ScrollReveal({
  children,
  className = "",
  direction = "up",
  delay = 0,
  duration = 650,
  threshold = 0.1,
  once = false, // Set to false so it animates continuously every time you scroll up or down
}: ScrollRevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Respect prefers-reduced-motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once && elementRef.current) {
            observer.unobserve(elementRef.current);
          }
        } else {
          // Re-trigger every time the element leaves and re-enters viewport
          if (!once) {
            setIsVisible(false);
          }
        }
      },
      {
        threshold,
        rootMargin: "0px 0px -60px 0px",
      }
    );

    const currentElem = elementRef.current;
    if (currentElem) {
      observer.observe(currentElem);
    }

    return () => {
      if (currentElem) {
        observer.unobserve(currentElem);
      }
    };
  }, [threshold, once]);

  // Initial hidden transform offsets
  let initialTransform = "translate3d(0, 28px, 0)";
  if (direction === "down") initialTransform = "translate3d(0, -28px, 0)";
  if (direction === "left") initialTransform = "translate3d(30px, 0, 0)";
  if (direction === "right") initialTransform = "translate3d(-30px, 0, 0)";
  if (direction === "zoom") initialTransform = "scale(0.94) translate3d(0, 16px, 0)";
  if (direction === "fade") initialTransform = "translate3d(0, 0, 0)";

  const style: React.CSSProperties = {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? "translate3d(0, 0, 0) scale(1)" : initialTransform,
    transitionProperty: "opacity, transform",
    transitionDuration: `${duration}ms`,
    transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
    transitionDelay: isVisible ? `${delay}ms` : "0ms", // Instantly reset when leaving, delayed when entering
    willChange: "opacity, transform",
  };

  return (
    <div ref={elementRef} style={style} className={className}>
      {children}
    </div>
  );
}
