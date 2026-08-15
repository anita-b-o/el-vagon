"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { GalleryImage } from "@/data/site";

const FOCUSABLE =
  'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])';

export function Gallery({ images }: { images: GalleryImage[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  const close = useCallback(() => {
    setActiveIndex(null);
    requestAnimationFrame(() => previousFocus.current?.focus());
  }, []);

  const goPrevious = useCallback(() => {
    setActiveIndex((current) =>
      current === null ? null : (current - 1 + images.length) % images.length,
    );
  }, [images.length]);

  const goNext = useCallback(() => {
    setActiveIndex((current) =>
      current === null ? null : (current + 1) % images.length,
    );
  }, [images.length]);

  useEffect(() => {
    if (activeIndex === null) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.querySelector<HTMLElement>("button")?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowLeft") goPrevious();
      if (event.key === "ArrowRight") goNext();

      if (event.key === "Tab" && dialogRef.current) {
        const focusable = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [activeIndex, close, goNext, goPrevious]);

  const open = (index: number, trigger: HTMLElement) => {
    previousFocus.current = trigger;
    setActiveIndex(index);
  };

  const activeImage = activeIndex === null ? null : images[activeIndex];

  return (
    <>
      <div className="gallery-grid">
        {images.map((image, index) => (
          <button
            key={image.src}
            className={`gallery-item gallery-${image.layout} reveal`}
            type="button"
            onClick={(event) => open(index, event.currentTarget)}
            aria-label={`Ampliar: ${image.caption}`}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 38vw"
            />
            <span className="gallery-caption">
              {image.caption}
              <Expand aria-hidden="true" />
            </span>
          </button>
        ))}
      </div>

      {activeImage && activeIndex !== null ? (
        <div
          ref={dialogRef}
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`Galería: ${activeImage.caption}`}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) close();
          }}
        >
          <button className="lightbox-close" type="button" onClick={close} aria-label="Cerrar galería">
            <X aria-hidden="true" />
          </button>
          <button
            className="lightbox-arrow lightbox-previous"
            type="button"
            onClick={goPrevious}
            aria-label="Fotografía anterior"
          >
            <ChevronLeft aria-hidden="true" />
          </button>
          <figure className="lightbox-figure">
            <div className="lightbox-image">
              <Image
                src={activeImage.src}
                alt={activeImage.alt}
                fill
                sizes="95vw"
              />
            </div>
            <figcaption>
              <span>{activeImage.caption}</span>
              <span>
                {activeIndex + 1} / {images.length}
              </span>
            </figcaption>
          </figure>
          <button
            className="lightbox-arrow lightbox-next"
            type="button"
            onClick={goNext}
            aria-label="Fotografía siguiente"
          >
            <ChevronRight aria-hidden="true" />
          </button>
        </div>
      ) : null}
    </>
  );
}
