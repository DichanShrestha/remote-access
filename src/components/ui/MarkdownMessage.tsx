"use client";

import React from "react";
import { ExternalLink, Maximize2 } from "lucide-react";

interface MarkdownMessageProps {
  content: string;
  className?: string;
  isUser?: boolean;
  bookingLink?: string | null;
  onBookingClick?: (url: string) => void;
}

/**
 * Parses and renders inline markdown tokens:
 * - **bold** or __bold__
 * - *italic* or _italic_
 * - `code`
 * - [label](url)
 * - bare URLs (https://...)
 */
function renderInline(
  text: string, 
  isUser = false, 
  bookingLink?: string | null, 
  onBookingClick?: (url: string) => void
): React.ReactNode {
  // Regex pattern matching:
  // 1. `code`
  // 2. **bold** or __bold__
  // 3. [link](url)
  // 4. bare url: (https?:\/\/[^\s<)]+)
  // 5. *italic* or _italic_
  const tokenRegex = /(`[^`]+`|\*\*[^*]+\*\*|__[^_]+__|\[[^\]]+\]\(https?:\/\/[^\s)]+\)|https?:\/\/[^\s<)]+|\*[^*]+\*|_[^_]+_)/g;

  const parts = text.split(tokenRegex);

  const isBookingUrl = (testUrl: string) => {
    if (!testUrl) return false;
    if (bookingLink && (testUrl === bookingLink || testUrl.startsWith(bookingLink) || bookingLink.startsWith(testUrl))) {
      return true;
    }
    return false;
  };

  const handleLinkClick = (url: string) => {
    if (isBookingUrl(url)) {
      onBookingClick?.(url);
    }
  };

  return parts.map((part, index) => {
    if (!part) return null;

    // Inline code: `code`
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      return (
        <code
          key={index}
          className={`px-1.5 py-0.5 rounded font-mono text-[0.88em] ${
            isUser ? "bg-white/20 text-white" : "bg-black/10 dark:bg-white/10 text-inherit"
          }`}
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    // Bold: **text** or __text__
    if (
      (part.startsWith("**") && part.endsWith("**") && part.length >= 4) ||
      (part.startsWith("__") && part.endsWith("__") && part.length >= 4)
    ) {
      return (
        <strong key={index} className="font-semibold text-inherit">
          {part.slice(2, -2)}
        </strong>
      );
    }

    // Link: [text](url)
    const linkMatch = part.match(/^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/);
    if (linkMatch) {
      const [, label, url] = linkMatch;
      const isBooking = isBookingUrl(url);
      return (
        <a
          key={index}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => handleLinkClick(url)}
          className={`underline font-medium hover:opacity-80 transition-opacity break-all text-inherit ${
            isBooking ? "font-semibold underline decoration-2 underline-offset-2" : ""
          }`}
        >
          {label}
        </a>
      );
    }

    // Bare URL: https://...
    if (/^https?:\/\/[^\s<)]+$/.test(part)) {
      const isBooking = isBookingUrl(part);
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => handleLinkClick(part)}
          className={`underline font-medium hover:opacity-80 transition-opacity break-all text-inherit ${
            isBooking ? "font-semibold underline decoration-2 underline-offset-2" : ""
          }`}
        >
          {part}
        </a>
      );
    }

    // Italic: *text* or _text_
    if (
      (part.startsWith("*") && part.endsWith("*") && part.length >= 2) ||
      (part.startsWith("_") && part.endsWith("_") && part.length >= 2)
    ) {
      return (
        <em key={index} className="italic text-inherit">
          {part.slice(1, -1)}
        </em>
      );
    }

    // Regular plain text
    return <span key={index}>{part}</span>;
  });
}

/**
 * Extracts any <visualset> tags from the end of assistant messages
 * and returns clean text plus visual set cards.
 */
function extractVisualSets(rawText: string) {
  const visualSets: Array<{
    title: string;
    price?: string;
    currency?: string;
    redirectUrl?: string;
    images: Array<{ src: string; caption?: string }>;
  }> = [];

  // Match complete <visualset>...</visualset> OR unclosed <visualset...> until next <visualset> or end of string
  const visualSetPattern = /<visualset([^>]*)>([\s\S]*?)(?:<\/visualset>|(?=<visualset)|$)/gi;
  const matches = [...rawText.matchAll(visualSetPattern)];

  for (const match of matches) {
    const attrs = match[1] || "";
    const inner = match[2] || "";

    const titleMatch = attrs.match(/title="([^"]*)"/i);
    const priceMatch = attrs.match(/price="([^"]*)"/i);
    const currencyMatch = attrs.match(/currency="([^"]*)"/i);
    const redirectUrlMatch = attrs.match(/redirectUrl="([^"]*)"/i);

    const images: Array<{ src: string; caption?: string }> = [];
    // Match both complete <img ... /> and unclosed <img ...
    const imgPattern = /<img\s+([^>]*?)(?:\/?>|(?=<img)|$)/gi;
    for (const imgMatch of inner.matchAll(imgPattern)) {
      const imgAttrs = imgMatch[1] || "";
      const srcMatch = imgAttrs.match(/src="([^"]+)"/i);
      const captionMatch = imgAttrs.match(/caption="([^"]*)"/i);
      if (srcMatch && srcMatch[1]) {
        const src = srcMatch[1].trim();
        // Only accept if src is a valid web URL or path
        if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("/")) {
          images.push({ src, caption: captionMatch ? captionMatch[1] : undefined });
        }
      }
    }

    const title = titleMatch ? titleMatch[1] : "";
    if (images.length > 0 || title) {
      visualSets.push({
        title,
        price: priceMatch ? priceMatch[1] : undefined,
        currency: currencyMatch ? currencyMatch[1] : undefined,
        redirectUrl: redirectUrlMatch ? redirectUrlMatch[1] : undefined,
        images,
      });
    }
  }

  // Strip all <visualset...> markup (closed or unclosed) so raw XML never renders in markdown
  const cleanText = rawText.replace(/<visualset[\s\S]*$/i, "").trim();

  return { cleanText, visualSets };
}

export function MarkdownMessage({
  content,
  className = "",
  isUser = false,
  bookingLink = null,
  onBookingClick,
}: MarkdownMessageProps) {
  const [lightbox, setLightbox] = React.useState<{
    images: Array<{ src: string; caption?: string }>;
    title: string;
    index: number;
  } | null>(null);

  if (!content) return null;

  // Extract visualset blocks if assistant response
  const { cleanText, visualSets } = isUser ? { cleanText: content, visualSets: [] } : extractVisualSets(content);

  // Split into paragraphs / blocks by double newlines
  const blocks = cleanText.split(/\n\n+/);

  return (
    <div className={`space-y-2.5 break-words ${className}`}>
      {blocks.map((block, blockIndex) => {
        const lines = block.split(/\n/);

        // Check if block is a code block ```
        if (block.startsWith("```") && block.endsWith("```") && block.length >= 6) {
          const codeContent = block.replace(/^```[a-zA-Z0-9_-]*\n?/, "").replace(/\n?```$/, "");
          return (
            <pre
              key={blockIndex}
              className="p-3 my-2 rounded-xl bg-black/10 dark:bg-black/40 overflow-x-auto max-w-full font-mono text-xs"
            >
              <code>{codeContent}</code>
            </pre>
          );
        }

        // Check if all or most lines are bullet list items (- or * or •)
        const isBulletList = lines.length > 0 && lines.every((line) => /^(\s*[-*•]\s+)/.test(line.trim()));
        if (isBulletList) {
          return (
            <ul key={blockIndex} className="list-disc list-inside space-y-1 my-1">
              {lines.map((line, lineIndex) => {
                const itemText = line.replace(/^\s*[-*•]\s+/, "");
                return (
                  <li key={lineIndex} className="leading-relaxed">
                    {renderInline(itemText, isUser, bookingLink, onBookingClick)}
                  </li>
                );
              })}
            </ul>
          );
        }

        // Check if all lines are numbered list items (1. 2. 3.)
        const isNumberedList = lines.length > 0 && lines.every((line) => /^\s*\d+\.\s+/.test(line.trim()));
        if (isNumberedList) {
          return (
            <ol key={blockIndex} className="list-decimal list-inside space-y-1 my-1">
              {lines.map((line, lineIndex) => {
                const itemText = line.replace(/^\s*\d+\.\s+/, "");
                return (
                  <li key={lineIndex} className="leading-relaxed">
                    {renderInline(itemText, isUser, bookingLink, onBookingClick)}
                  </li>
                );
              })}
            </ol>
          );
        }

        // Standard paragraph with line breaks
        return (
          <p key={blockIndex} className="leading-relaxed whitespace-pre-wrap">
            {lines.map((line, lineIndex) => (
              <React.Fragment key={lineIndex}>
                {lineIndex > 0 && <br />}
                {renderInline(line, isUser, bookingLink, onBookingClick)}
              </React.Fragment>
            ))}
          </p>
        );
      })}

      {/* Render Visual Sets if provided */}
      {visualSets.length > 0 && (
        <div className="pt-2 flex flex-col gap-2.5">
          {visualSets.map((set, idx) => (
            <div
              key={idx}
              className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xs flex flex-col gap-2.5"
            >
              {set.images.length > 0 && (
                <div className="relative">
                  <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-slate-200">
                    {set.images.map((img, imgIdx) => (
                      <button
                        key={imgIdx}
                        type="button"
                        onClick={() => setLightbox({ images: set.images, title: set.title, index: imgIdx })}
                        className="relative flex-shrink-0 group/img cursor-pointer rounded-xl overflow-hidden border border-slate-100 dark:border-slate-700 hover:ring-2 hover:ring-slate-400/50 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img.src}
                          alt={img.caption || `${set.title} view ${imgIdx + 1}`}
                          className="w-24 h-24 sm:w-28 sm:h-28 object-cover group-hover/img:brightness-95 transition-all"
                        />
                        {set.images.length > 1 && (
                          <span className="absolute bottom-1 right-1 bg-black/60 backdrop-blur-xs text-white text-[9px] font-medium px-1.5 py-0.5 rounded-md">
                            {imgIdx + 1}/{set.images.length}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between text-xs pt-0.5">
                <span className="font-semibold text-slate-800 dark:text-slate-100 truncate mr-2">
                  {set.title}
                </span>
                {set.price && (
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 flex-shrink-0 px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/50 rounded-lg">
                    {set.currency || "$"}
                    {set.price}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 dark:border-slate-700/60 text-[11px] font-medium gap-2">
                {set.images.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setLightbox({ images: set.images, title: set.title, index: 0 })}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    <Maximize2 className="w-3 h-3" />
                    <span>View fullscreen</span>
                  </button>
                )}
                {set.redirectUrl && (
                  <a
                    href={set.redirectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors ml-auto no-underline cursor-pointer group/link"
                  >
                    <span>Visit link</span>
                    <ExternalLink className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Fullscreen Image Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[9999] bg-black/90 flex flex-col items-center justify-center animate-in fade-in duration-150"
          onClick={() => setLightbox(null)}
        >
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-3 z-10">
            <div className="text-white text-sm font-medium flex items-center gap-2">
              <span>{lightbox.title}</span>
              {lightbox.images.length > 1 && (
                <span className="text-white/60 text-xs">
                  {lightbox.index + 1} of {lightbox.images.length}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setLightbox(null)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {/* Image */}
          <div
            className="flex-1 flex items-center justify-center w-full px-14 py-16"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lightbox.images[lightbox.index].src}
              alt={lightbox.images[lightbox.index].caption || `${lightbox.title} view ${lightbox.index + 1}`}
              className="max-w-full max-h-full object-contain rounded-lg select-none"
              draggable={false}
            />
          </div>

          {/* Navigation arrows */}
          {lightbox.images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightbox(prev => prev ? {
                    ...prev,
                    index: prev.index === 0 ? prev.images.length - 1 : prev.index - 1,
                  } : null);
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer text-lg"
                aria-label="Previous image"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightbox(prev => prev ? {
                    ...prev,
                    index: prev.index === prev.images.length - 1 ? 0 : prev.index + 1,
                  } : null);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer text-lg"
                aria-label="Next image"
              >
                ›
              </button>
            </>
          )}

          {/* Caption */}
          {lightbox.images[lightbox.index].caption && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/80 text-xs bg-black/40 px-3 py-1.5 rounded-lg backdrop-blur-sm max-w-[80%] text-center">
              {lightbox.images[lightbox.index].caption}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
