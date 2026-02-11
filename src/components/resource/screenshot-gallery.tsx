"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface Screenshot {
  id: string;
  url: string;
  alt?: string | null;
  displayOrder: number;
}

interface ScreenshotGalleryProps {
  screenshots: Screenshot[];
}

export function ScreenshotGallery({ screenshots }: ScreenshotGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const goNext = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex + 1) % screenshots.length);
  }, [lightboxIndex, screenshots.length]);

  const goPrev = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex(
      (lightboxIndex - 1 + screenshots.length) % screenshots.length
    );
  }, [lightboxIndex, screenshots.length]);

  useEffect(() => {
    if (lightboxIndex === null) return;

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    }

    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [lightboxIndex, goNext, goPrev]);

  if (screenshots.length === 0) return null;

  return (
    <>
      {/* Thumbnail grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {screenshots.map((shot, i) => (
          <button
            key={shot.id}
            onClick={() => openLightbox(i)}
            className="relative aspect-video rounded-lg overflow-hidden border border-border hover:border-primary transition-colors cursor-pointer group"
          >
            <Image
              src={shot.url}
              alt={shot.alt || `Screenshot ${i + 1}`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
              sizes="(max-width: 640px) 50vw, 33vw"
            />
          </button>
        ))}
      </div>

      {/* Lightbox modal */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors z-10 cursor-pointer"
            aria-label="Close lightbox"
          >
            <X size={28} />
          </button>

          {/* Counter */}
          <div className="absolute top-4 left-4 text-white/80 text-sm z-10">
            {lightboxIndex + 1} / {screenshots.length}
          </div>

          {/* Prev button */}
          {screenshots.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white transition-colors z-10 cursor-pointer"
              aria-label="Previous screenshot"
            >
              <ChevronLeft size={36} />
            </button>
          )}

          {/* Image */}
          <div
            className="relative max-w-[90vw] max-h-[85vh] w-full h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={screenshots[lightboxIndex].url}
              alt={
                screenshots[lightboxIndex].alt ||
                `Screenshot ${lightboxIndex + 1}`
              }
              fill
              className="object-contain"
              sizes="90vw"
              priority
            />
          </div>

          {/* Next button */}
          {screenshots.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white transition-colors z-10 cursor-pointer"
              aria-label="Next screenshot"
            >
              <ChevronRight size={36} />
            </button>
          )}
        </div>
      )}
    </>
  );
}
