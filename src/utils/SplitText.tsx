"use client";

import React from "react";

interface SplitTextProps {
  text: string;
  className?: string;
  wordClassName?: string;
  charClassName?: string;
}

export function SplitText({ text, className, wordClassName, charClassName }: SplitTextProps) {
  return (
    <span className={className} aria-label={text}>
      {text.split(" ").map((word, wordIndex) => (
        <span
          key={wordIndex}
          className={`inline-block whitespace-nowrap ${wordClassName || ""}`}
          style={{ overflow: "hidden" }}
        >
          {word.split("").map((char, charIndex) => (
            <span
              key={charIndex}
              className={`inline-block split-char ${charClassName || ""}`}
            >
              {char}
            </span>
          ))}
          <span className="inline-block">&nbsp;</span>
        </span>
      ))}
    </span>
  );
}
