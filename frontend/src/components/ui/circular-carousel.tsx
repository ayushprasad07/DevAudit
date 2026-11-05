"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CarouselItem {
  id: string;
  title: string;
  description: string;
  tag?: string;
  image?: string;
}

export interface CircularCarouselProps {
  items: CarouselItem[];
  activeIndex?: number;
  onActiveChange?: (index: number) => void;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  className?: string;
}

const VISIBLE_COUNT = 5;
const RADIUS_X = 520;
const RADIUS_Y = 30;

function getItemPosition(index: number, activeIndex: number, total: number) {
  const offset = index - activeIndex;
  const half = Math.min(Math.floor(VISIBLE_COUNT / 2), Math.floor(total / 2));
  let adjustedOffset = offset;

  if (offset > half) adjustedOffset = offset - total;
  if (offset < -half) adjustedOffset = offset + total;

  if (Math.abs(adjustedOffset) > half) return null;

  const angle = (adjustedOffset / VISIBLE_COUNT) * Math.PI;
  const x = Math.sin(angle) * RADIUS_X;
  const y = -Math.cos(angle) * RADIUS_Y;

  const distance = Math.abs(adjustedOffset);
  const maxDistance = half + 1;
  const scale = Math.max(0, 1 - (distance / maxDistance) * 0.3);
  const opacity = Math.max(0.3, 1 - (distance / maxDistance) * 0.7);
  const zIndex = VISIBLE_COUNT - distance;

  return { x, y, scale, opacity, zIndex, adjustedOffset };
}

export function CircularCarousel({
  items,
  activeIndex: controlledIndex,
  onActiveChange,
  autoPlay = true,
  autoPlayInterval = 2000,
  className,
}: CircularCarouselProps) {
  const [internalIndex, setInternalIndex] = useState(0);
  // Turns false permanently once the user clicks the left/right button
  const [autoPlaying, setAutoPlaying] = useState(autoPlay);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const activeIndex = controlledIndex ?? internalIndex;
  const total = items.length;

  // Keep the latest values in refs so goTo (and the timer) stay stable
  const activeRef = useRef(activeIndex);
  const controlledRef = useRef(controlledIndex);
  const onChangeRef = useRef(onActiveChange);
  activeRef.current = activeIndex;
  controlledRef.current = controlledIndex;
  onChangeRef.current = onActiveChange;

  const goTo = useCallback(
    (index: number) => {
      if (total === 0) return;
      const newIndex = ((index % total) + total) % total;
      if (controlledRef.current === undefined) setInternalIndex(newIndex);
      onChangeRef.current?.(newIndex);
    },
    [total],
  );

  // Manual arrow navigation: move, then stop autoplay for good
  const next = useCallback(() => {
    setAutoPlaying(false);
    goTo(activeRef.current + 1);
  }, [goTo]);

  const prev = useCallback(() => {
    setAutoPlaying(false);
    goTo(activeRef.current - 1);
  }, [goTo]);

  // Auto-advance every `autoPlayInterval` ms until the user clicks an arrow
  useEffect(() => {
    if (!autoPlaying || total < 2) return;
    const id = setInterval(() => goTo(activeRef.current + 1), autoPlayInterval);
    return () => clearInterval(id);
  }, [autoPlaying, autoPlayInterval, total, goTo]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    const el = containerRef.current;
    el?.addEventListener("keydown", handler);
    return () => el?.removeEventListener("keydown", handler);
  }, [next, prev]);

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      role="region"
      aria-label="Circular carousel"
      aria-roledescription="carousel"
      className={cn(
        "relative flex flex-col items-center justify-center gap-8 outline-none",
        className,
      )}
    >
      {/* Circular track */}
      <div className="relative h-[520px] w-full max-w-6xl">
        <AnimatePresence mode="popLayout">
          {items.map((item, i) => {
            const pos = getItemPosition(i, activeIndex, total);
            if (!pos) return null;
            const isActive = i === activeIndex;

            return (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  x: pos.x,
                  y: pos.y,
                  scale: pos.scale,
                  opacity: pos.opacity,
                  zIndex: pos.zIndex,
                }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                onClick={() => goTo(i)}
                aria-label={item.title}
                aria-selected={isActive}
                role="option"
                className={cn(
                  "absolute left-1/2 top-1/2 flex h-[480px] w-96 -translate-x-1/2 -translate-y-1/2 cursor-pointer flex-col overflow-hidden rounded-2xl border bg-neutral-950 text-left transition-shadow duration-300",
                  isActive
                    ? "border-orange-500/40 shadow-[0_0_50px_-12px_rgba(249,115,22,0.5)]"
                    : "border-white/10 shadow-[0_8px_24px_-4px_rgba(0,0,0,0.5)]",
                )}
                style={{ transformOrigin: "center center" }}
              >
                {/* Image */}
                {item.image && (
                  <div className="relative h-56 w-full shrink-0">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent" />
                  </div>
                )}

                {/* Text */}
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-center gap-3">
                    {item.tag && (
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-orange-500/40 bg-orange-500/10 text-xs font-medium text-orange-400 shadow-[0_0_16px_-4px_rgba(249,115,22,0.6)]">
                        {item.tag}
                      </span>
                    )}
                    <div className="h-px flex-1 bg-gradient-to-r from-orange-500/40 to-transparent" />
                  </div>
                  <h3
                    className={cn(
                      "mt-4 font-medium leading-tight transition-colors duration-300",
                      isActive ? "text-xl text-white" : "text-lg text-white/80",
                    )}
                  >
                    {item.title}
                  </h3>
                  <p
                    className={cn(
                      "mt-2 text-sm leading-relaxed transition-colors duration-300",
                      isActive ? "text-neutral-400" : "text-neutral-500",
                    )}
                  >
                    {item.description}
                  </p>
                </div>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={prev}
          aria-label="Previous item"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 backdrop-blur-sm transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-orange-400/40"
        >
          <ChevronLeft className="size-5" />
        </motion.button>

        <div className="flex items-center gap-1.5" role="tablist">
          {items.map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === activeIndex}
              onClick={() => goTo(i)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === activeIndex
                  ? "w-6 bg-orange-400"
                  : "w-1.5 bg-white/20 hover:bg-white/40",
              )}
              aria-label={`Go to item ${i + 1}`}
            />
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={next}
          aria-label="Next item"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 backdrop-blur-sm transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-orange-400/40"
        >
          <ChevronRight className="size-5" />
        </motion.button>
      </div>
    </div>
  );
}

export default CircularCarousel;