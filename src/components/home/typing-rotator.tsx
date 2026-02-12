"use client";

import { useEffect, useState, useCallback } from "react";

const DEFAULT_WORDS = [
  "Architect",
  "Admin",
  "Developer",
  "Superuser",
  "DevOps",
  "Consultant",
  "Agentforce",
];

const TYPE_SPEED = 90;
const DELETE_SPEED = 50;
const PAUSE_AFTER_TYPE = 2000;
const PAUSE_AFTER_DELETE = 400;

interface TypingRotatorProps {
  words?: string[];
}

export function TypingRotator({ words }: TypingRotatorProps) {
  const WORDS = words && words.length > 0 ? words : DEFAULT_WORDS;
  const [wordIndex, setWordIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [deleting, setDeleting] = useState(false);

  const tick = useCallback(() => {
    const currentWord = WORDS[wordIndex];

    if (!deleting) {
      // Typing
      if (displayed.length < currentWord.length) {
        return {
          next: currentWord.slice(0, displayed.length + 1),
          delay: TYPE_SPEED,
          deleting: false,
          wordIndex,
        };
      }
      // Finished typing — pause, then start deleting
      return {
        next: displayed,
        delay: PAUSE_AFTER_TYPE,
        deleting: true,
        wordIndex,
      };
    }

    // Deleting
    if (displayed.length > 0) {
      return {
        next: displayed.slice(0, -1),
        delay: DELETE_SPEED,
        deleting: true,
        wordIndex,
      };
    }
    // Finished deleting — pause, then move to next word
    return {
      next: "",
      delay: PAUSE_AFTER_DELETE,
      deleting: false,
      wordIndex: (wordIndex + 1) % WORDS.length,
    };
  }, [displayed, deleting, wordIndex]);

  useEffect(() => {
    const result = tick();
    const timer = setTimeout(() => {
      setDisplayed(result.next);
      setDeleting(result.deleting);
      setWordIndex(result.wordIndex);
    }, result.delay);

    return () => clearTimeout(timer);
  }, [tick]);

  return (
    <>
      <span className="gradient-text">{displayed}</span>
      <span className="inline-block w-[3px] h-[0.85em] bg-primary align-middle ml-0.5 animate-blink" />
    </>
  );
}
