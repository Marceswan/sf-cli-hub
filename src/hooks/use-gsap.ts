"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Reusable hook for GSAP scroll-triggered animations.
 * Respects prefers-reduced-motion.
 */
export function useGsapFadeIn(
  options: {
    y?: number;
    duration?: number;
    stagger?: number;
    delay?: number;
    start?: string;
    childSelector?: string;
    once?: boolean;
  } = {}
) {
  const ref = useRef<HTMLDivElement>(null);
  const {
    y = 30,
    duration = 0.7,
    stagger = 0.1,
    delay = 0,
    start = "top 85%",
    childSelector,
    once = true,
  } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respect prefers-reduced-motion
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) return;

    const targets = childSelector ? el.querySelectorAll(childSelector) : el;

    gsap.set(targets, { y, opacity: 0 });

    const ctx = gsap.context(() => {
      gsap.to(targets, {
        y: 0,
        opacity: 1,
        duration,
        stagger,
        delay,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start,
          once,
        },
      });
    }, el);

    return () => ctx.revert();
  }, [y, duration, stagger, delay, start, childSelector, once]);

  return ref;
}

/**
 * Hook for immediate GSAP entrance animations (no scroll trigger).
 * Used for above-the-fold content like the hero section.
 */
export function useGsapEntrance(
  options: {
    y?: number;
    duration?: number;
    stagger?: number;
    delay?: number;
    childSelector?: string;
  } = {}
) {
  const ref = useRef<HTMLDivElement>(null);
  const {
    y = 30,
    duration = 0.7,
    stagger = 0.12,
    delay = 0.1,
    childSelector,
  } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) return;

    const targets = childSelector ? el.querySelectorAll(childSelector) : el;

    gsap.set(targets, { y, opacity: 0 });

    const ctx = gsap.context(() => {
      gsap.to(targets, {
        y: 0,
        opacity: 1,
        duration,
        stagger,
        delay,
        ease: "power2.out",
      });
    }, el);

    return () => ctx.revert();
  }, [y, duration, stagger, delay, childSelector]);

  return ref;
}
