"use client";

import React from "react";
import { Check, ExternalLink, Maximize2 } from "lucide-react";

interface MarkdownMessageProps {
  content: string;
  className?: string;
  isUser?: boolean;
  bookingLink?: string | null;
  onBookingClick?: (url: string) => void;
}

type InlineContext = {
  isUser: boolean;
  bookingLink?: string | null;
  onBookingClick?: (url: string) => void;
};

type ListItemNode = {
  text: string;
  ordered: boolean;
  checked?: boolean;
  children: ListItemNode[];
};

type Alignment = "left" | "center" | "right";

type Block =
  | { type: "paragraph"; lines: string[] }
  | { type: "heading"; level: number; text: string }
  | { type: "code"; language: string; code: string }
  | { type: "quote"; lines: string[] }
  | { type: "list"; items: ListItemNode[] }
  | { type: "table"; header: string[]; alignments: Alignment[]; rows: string[][] }
  | { type: "hr" };

/* -------------------------------------------------------------------------- */
/* Inline formatting                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Parses inline markdown tokens:
 * - `code`
 * - ***bold italic***, **bold**, __bold__
 * - *italic*, _italic_
 * - ~~strikethrough~~
 * - [label](url)
 * - bare https:// URLs (with trailing punctuation preserved)
 */
function renderInline(text: string, context: InlineContext): React.ReactNode {
  const { isUser, bookingLink, onBookingClick } = context;

  const isBookingUrl = (testUrl: string) => {
    if (!testUrl) return false;
    if (
      bookingLink &&
      (testUrl === bookingLink || testUrl.startsWith(bookingLink) || bookingLink.startsWith(testUrl))
    ) {
      return true;
    }
    return false;
  };

  const handleLinkClick = (url: string) => {
    if (isBookingUrl(url)) {
      onBookingClick?.(url);
    }
  };

  const tokenRegex =
    /(`[^`]+`|\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|__[^_]+__|~~[^~]+~~|\[[^\]]+\]\(https?:\/\/[^\s)]+\)|https?:\/\/[^\s<)]+|\*[^*\s][^*]*\*|_[^_\s][^_]*_)/g;

  const parts = text.split(tokenRegex);

  const linkClass = isUser
    ? "font-medium text-inherit underline decoration-white/40 underline-offset-2 transition hover:decoration-white"
    : "font-medium text-inherit underline decoration-current/30 underline-offset-2 transition hover:decoration-current";

  return parts.map((part, index) => {
    if (!part) return null;

    // Inline code
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      return (
        <code
          key={index}
          className={`rounded-md px-1.5 py-0.5 font-mono text-[0.88em] ${
            isUser
              ? "bg-white/20 text-white"
              : "bg-black/[0.06] text-slate-800 dark:bg-white/10 dark:text-slate-100"
          }`}
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    // Bold italic
    if (part.startsWith("***") && part.endsWith("***") && part.length > 6) {
      return (
        <strong key={index} className="font-semibold">
          <em>{renderInline(part.slice(3, -3), context)}</em>
        </strong>
      );
    }

    // Bold
    if (
      (part.startsWith("**") && part.endsWith("**") && part.length >= 4) ||
      (part.startsWith("__") && part.endsWith("__") && part.length >= 4)
    ) {
      return (
        <strong key={index} className="font-semibold text-inherit">
          {renderInline(part.slice(2, -2), context)}
        </strong>
      );
    }

    // Strikethrough
    if (part.startsWith("~~") && part.endsWith("~~") && part.length >= 4) {
      return (
        <span key={index} className="line-through opacity-75">
          {renderInline(part.slice(2, -2), context)}
        </span>
      );
    }

    // [label](url)
    const linkMatch = part.match(/^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/);
    if (linkMatch) {
      const [, label, url] = linkMatch;
      return (
        <a
          key={index}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => handleLinkClick(url)}
          className={`${linkClass} break-words ${isBookingUrl(url) ? "font-semibold underline-offset-[3px]" : ""}`}
        >
          {renderInline(label, context)}
        </a>
      );
    }

    // Bare URL, keeping trailing punctuation outside the link
    if (/^https?:\/\/[^\s<)]+$/.test(part)) {
      const trailingMatch = part.match(/[.,;:!?]+$/);
      const trailing = trailingMatch ? trailingMatch[0] : "";
      const url = trailing ? part.slice(0, -trailing.length) : part;
      return (
        <React.Fragment key={index}>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleLinkClick(url)}
            className={`${linkClass} break-all`}
          >
            {url}
          </a>
          {trailing}
        </React.Fragment>
      );
    }

    // Italic
    if (
      (part.startsWith("*") && part.endsWith("*") && part.length >= 3) ||
      (part.startsWith("_") && part.endsWith("_") && part.length >= 3)
    ) {
      return (
        <em key={index} className="italic text-inherit">
          {renderInline(part.slice(1, -1), context)}
        </em>
      );
    }

    return <span key={index}>{part}</span>;
  });
}

/* -------------------------------------------------------------------------- */
/* Block parsing                                                              */
/* -------------------------------------------------------------------------- */

function matchListItem(line: string): { indent: number; ordered: boolean; content: string } | null {
  const match = line.match(/^(\s*)([-*+•]|\d{1,3}[.)])\s+(.*)$/);
  if (!match) return null;
  return {
    indent: match[1].replace(/\t/g, "    ").length,
    ordered: /^\d/.test(match[2]),
    content: match[3].trimEnd(),
  };
}

function splitTableRow(line: string): string[] {
  let value = line.trim();
  if (value.startsWith("|")) value = value.slice(1);
  if (value.endsWith("|")) value = value.slice(0, -1);
  return value.split("|").map((cell) => cell.trim());
}

function isTableSeparator(line: string): boolean {
  const cells = splitTableRow(line);
  return cells.length > 0 && cells.every((cell) => /^:?-{3,}:?$/.test(cell));
}

function isBlockStart(lines: string[], index: number): boolean {
  const line = lines[index];
  if (!line.trim()) return true;
  if (/^\s*```/.test(line)) return true;
  if (/^#{1,6}\s+/.test(line)) return true;
  if (/^\s*>/.test(line)) return true;
  if (matchListItem(line)) return true;
  if (/^\s*(?:[-*_]\s*){3,}$/.test(line)) return true;
  if (index + 1 < lines.length && line.includes("|") && isTableSeparator(lines[index + 1])) return true;
  return false;
}

function parseList(lines: string[], start: number): { items: ListItemNode[]; next: number } {
  const first = matchListItem(lines[start]);
  const items: ListItemNode[] = [];
  const stack: Array<{ indent: number; items: ListItemNode[] }> = [
    { indent: first ? first.indent : 0, items },
  ];
  let index = start;

  while (index < lines.length) {
    const line = lines[index];

    if (!line.trim()) {
      // A single blank line between list items should not split the list.
      if (index + 1 < lines.length && matchListItem(lines[index + 1])) {
        index += 1;
        continue;
      }
      break;
    }

    const item = matchListItem(line);
    if (!item) {
      if (isBlockStart(lines, index)) break;
      // Wrapped continuation of the previous item.
      const level = stack[stack.length - 1];
      const last = level.items[level.items.length - 1];
      if (!last) break;
      last.text = `${last.text} ${line.trim()}`;
      index += 1;
      continue;
    }

    while (stack.length > 1 && item.indent < stack[stack.length - 1].indent) {
      stack.pop();
    }

    let level = stack[stack.length - 1];
    if (item.indent > level.indent) {
      const parent = level.items[level.items.length - 1];
      if (parent) {
        stack.push({ indent: item.indent, items: parent.children });
        level = stack[stack.length - 1];
      } else {
        level.indent = item.indent;
      }
    }

    const task = item.content.match(/^\[([ xX])\]\s+(.*)$/);
    level.items.push({
      text: task ? task[2] : item.content,
      ordered: item.ordered,
      checked: task ? task[1].toLowerCase() === "x" : undefined,
      children: [],
    });
    index += 1;
  }

  return { items, next: index };
}

function parseBlocks(source: string): Block[] {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];

    if (!line.trim()) {
      index += 1;
      continue;
    }

    // Fenced code block
    const fence = line.match(/^\s*```\s*([A-Za-z0-9_+-]*)\s*$/);
    if (fence) {
      const codeLines: string[] = [];
      index += 1;
      while (index < lines.length && !/^\s*```\s*$/.test(lines[index])) {
        codeLines.push(lines[index]);
        index += 1;
      }
      if (index < lines.length) index += 1;
      blocks.push({ type: "code", language: fence[1] || "", code: codeLines.join("\n") });
      continue;
    }

    // Table
    if (index + 1 < lines.length && line.includes("|") && isTableSeparator(lines[index + 1])) {
      const header = splitTableRow(line);
      const alignments: Alignment[] = splitTableRow(lines[index + 1]).map((cell) => {
        const left = cell.startsWith(":");
        const right = cell.endsWith(":");
        if (left && right) return "center";
        if (right) return "right";
        return "left";
      });
      const rows: string[][] = [];
      index += 2;
      while (
        index < lines.length &&
        lines[index].trim() &&
        lines[index].includes("|") &&
        !isTableSeparator(lines[index])
      ) {
        rows.push(splitTableRow(lines[index]));
        index += 1;
      }
      blocks.push({ type: "table", header, alignments, rows });
      continue;
    }

    // Heading
    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      blocks.push({ type: "heading", level: heading[1].length, text: heading[2].trim() });
      index += 1;
      continue;
    }

    // Horizontal rule
    if (/^\s*(?:[-*_]\s*){3,}$/.test(line)) {
      blocks.push({ type: "hr" });
      index += 1;
      continue;
    }

    // Blockquote
    if (/^\s*>/.test(line)) {
      const quoteLines: string[] = [];
      while (index < lines.length && /^\s*>/.test(lines[index])) {
        quoteLines.push(lines[index].replace(/^\s*>\s?/, ""));
        index += 1;
      }
      blocks.push({ type: "quote", lines: quoteLines });
      continue;
    }

    // List
    if (matchListItem(line)) {
      const { items, next } = parseList(lines, index);
      if (items.length > 0) {
        blocks.push({ type: "list", items });
        index = next;
        continue;
      }
    }

    // Paragraph
    const paragraph: string[] = [];
    while (index < lines.length && lines[index].trim() && !isBlockStart(lines, index)) {
      paragraph.push(lines[index]);
      index += 1;
    }
    if (paragraph.length > 0) {
      blocks.push({ type: "paragraph", lines: paragraph });
    }
  }

  return blocks;
}

/* -------------------------------------------------------------------------- */
/* Block rendering                                                            */
/* -------------------------------------------------------------------------- */

function alignmentClass(alignment: Alignment | undefined): string {
  if (alignment === "center") return "text-center";
  if (alignment === "right") return "text-right";
  return "text-left";
}

function renderList(
  items: ListItemNode[],
  context: InlineContext,
  key: React.Key,
  depth = 0,
): React.ReactNode {
  const hasTasks = items.some((item) => item.checked !== undefined);
  const ordered = items.some((item) => item.ordered);
  const listClass = `my-1 space-y-1.5 ${hasTasks ? "list-none pl-0" : `pl-4 ${ordered ? "list-decimal" : "list-disc"} ${
    context.isUser
      ? "marker:text-white/55"
      : "marker:text-slate-400 dark:marker:text-slate-500"
  }`}`;

  const children = items.map((item, index) => (
    <li key={index} className="break-words pl-0.5 leading-relaxed">
      {item.checked !== undefined ? (
        <span className="flex items-start gap-2">
          <span
            className={`mt-[3px] grid h-3.5 w-3.5 flex-none place-items-center rounded-[4px] border ${
              context.isUser
                ? item.checked
                  ? "border-white/70 bg-white/20 text-white"
                  : "border-white/40 text-transparent"
                : item.checked
                  ? "border-emerald-500 bg-emerald-500 text-white"
                  : "border-slate-300 text-transparent dark:border-slate-600"
            }`}
          >
            {item.checked && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
          </span>
          <span className="min-w-0">{renderInline(item.text, context)}</span>
        </span>
      ) : (
        renderInline(item.text, context)
      )}
      {item.children.length > 0 && renderList(item.children, context, `nested-${index}`, depth + 1)}
    </li>
  ));

  return ordered ? (
    <ol key={key} className={listClass}>
      {children}
    </ol>
  ) : (
    <ul key={key} className={listClass}>
      {children}
    </ul>
  );
}

function renderBlock(block: Block, context: InlineContext, key: React.Key): React.ReactNode {
  const { isUser } = context;

  switch (block.type) {
    case "paragraph":
      return (
        <p key={key} className="whitespace-pre-wrap leading-relaxed">
          {block.lines.map((line, lineIndex) => (
            <React.Fragment key={lineIndex}>
              {lineIndex > 0 && <br />}
              {renderInline(line, context)}
            </React.Fragment>
          ))}
        </p>
      );

    case "heading": {
      const headingClass = `font-semibold tracking-[-0.01em] ${
        isUser ? "text-white" : "text-slate-900 dark:text-white"
      }`;
      const sizeClass =
        block.level <= 2
          ? "text-[14px] leading-5"
          : block.level === 3
            ? "text-[13.5px] leading-5"
            : "text-[13px] leading-5";

      if (block.level <= 2) {
        return (
          <h3 key={key} className={`${headingClass} ${sizeClass}`}>
            {renderInline(block.text, context)}
          </h3>
        );
      }
      if (block.level === 3) {
        return (
          <h4 key={key} className={`${headingClass} ${sizeClass}`}>
            {renderInline(block.text, context)}
          </h4>
        );
      }
      return (
        <h5 key={key} className={`${headingClass} ${sizeClass}`}>
          {renderInline(block.text, context)}
        </h5>
      );
    }

    case "code":
      return (
        <div key={key} className="my-1.5">
          {block.language && (
            <div
              className={`mb-1 text-[9px] font-semibold uppercase tracking-[0.12em] ${
                isUser ? "text-white/60" : "text-slate-400 dark:text-slate-500"
              }`}
            >
              {block.language}
            </div>
          )}
          <pre
            className={`bot-scroll overflow-x-auto rounded-xl p-3 font-mono text-[11px] leading-5 ${
              isUser
                ? "bg-black/20 text-white"
                : "bg-black/[0.045] text-slate-800 dark:bg-white/[0.06] dark:text-slate-100"
            }`}
          >
            <code>{block.code}</code>
          </pre>
        </div>
      );

    case "quote":
      return (
        <blockquote
          key={key}
          className={`my-1 border-l-2 pl-3 ${
            isUser
              ? "border-white/30 text-white/85"
              : "border-black/10 text-slate-600 dark:border-white/15 dark:text-slate-300"
          }`}
        >
          <div className="space-y-2">
            {parseBlocks(block.lines.join("\n")).map((child, index) =>
              renderBlock(child, context, index),
            )}
          </div>
        </blockquote>
      );

    case "list":
      return renderList(block.items, context, key);

    case "table": {
      const borderClass = isUser ? "border-white/20" : "border-black/[0.08] dark:border-white/10";
      const headClass = isUser ? "text-white/90" : "text-slate-700 dark:text-slate-200";
      const cellClass = isUser ? "text-white/85" : "text-slate-600 dark:text-slate-300";

      return (
        <div key={key} className="bot-scroll my-1.5 w-full overflow-x-auto">
          <table className="w-full min-w-[220px] border-collapse text-left text-[11.5px]">
            <thead>
              <tr>
                {block.header.map((cell, cellIndex) => (
                  <th
                    key={cellIndex}
                    className={`border-b ${borderClass} px-2 py-1.5 font-semibold ${headClass} ${alignmentClass(
                      block.alignments[cellIndex],
                    )}`}
                  >
                    {renderInline(cell, context)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={isUser ? "" : "even:bg-black/[0.015] dark:even:bg-white/[0.02]"}
                >
                  {block.header.map((_, cellIndex) => (
                    <td
                      key={cellIndex}
                      className={`border-b ${borderClass} px-2 py-1.5 align-top ${cellClass} ${alignmentClass(
                        block.alignments[cellIndex],
                      )}`}
                    >
                      {renderInline(row[cellIndex] ?? "", context)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    case "hr":
      return (
        <hr
          key={key}
          className={`my-3 border-0 border-t ${
            isUser ? "border-white/25" : "border-black/[0.08] dark:border-white/10"
          }`}
        />
      );
  }
}

/* -------------------------------------------------------------------------- */
/* Visual sets (product / image cards)                                        */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/* Message                                                                    */
/* -------------------------------------------------------------------------- */

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

  const context: InlineContext = { isUser, bookingLink, onBookingClick };
  const { cleanText, visualSets } = isUser
    ? { cleanText: content, visualSets: [] }
    : extractVisualSets(content);
  const blocks = parseBlocks(cleanText);

  return (
    <div className={`space-y-2.5 break-words ${className}`}>
      {blocks.map((block, blockIndex) => renderBlock(block, context, blockIndex))}

      {/* Render Visual Sets if provided */}
      {visualSets.length > 0 && (
        <div className="flex flex-col gap-2.5 pt-2">
          {visualSets.map((set, idx) => (
            <div
              key={idx}
              className="flex flex-col gap-2.5 rounded-2xl border border-black/[0.07] bg-[#fbfaf6] p-3 dark:border-white/10 dark:bg-white/[0.04]"
            >
              {set.images.length > 0 && (
                <div className="relative">
                  <div className="bot-scroll flex gap-2 overflow-x-auto pb-1.5">
                    {set.images.map((img, imgIdx) => (
                      <button
                        key={imgIdx}
                        type="button"
                        onClick={() => setLightbox({ images: set.images, title: set.title, index: imgIdx })}
                        className="group/img relative flex-shrink-0 cursor-pointer overflow-hidden rounded-xl border border-black/[0.06] transition-all hover:ring-2 hover:ring-slate-400/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 dark:border-white/10"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img.src}
                          alt={img.caption || `${set.title} view ${imgIdx + 1}`}
                          className="h-24 w-24 object-cover transition-all group-hover/img:brightness-95 sm:h-28 sm:w-28"
                        />
                        {set.images.length > 1 && (
                          <span className="absolute bottom-1 right-1 rounded-md bg-black/60 px-1.5 py-0.5 text-[9px] font-medium text-white backdrop-blur-xs">
                            {imgIdx + 1}/{set.images.length}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between pt-0.5 text-xs">
                <span className="mr-2 truncate font-semibold text-slate-800 dark:text-slate-100">
                  {set.title}
                </span>
                {set.price && (
                  <span className="flex-shrink-0 rounded-lg bg-emerald-50 px-2 py-0.5 font-bold text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                    {set.currency || "$"}
                    {set.price}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between gap-2 border-t border-black/[0.06] pt-1.5 text-[11px] font-medium dark:border-white/10">
                {set.images.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setLightbox({ images: set.images, title: set.title, index: 0 })}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-black/[0.05] px-2.5 py-1 text-slate-700 transition-colors hover:bg-black/[0.08] dark:bg-white/[0.07] dark:text-slate-200 dark:hover:bg-white/[0.11]"
                  >
                    <Maximize2 className="h-3 w-3" />
                    <span>View fullscreen</span>
                  </button>
                )}
                {set.redirectUrl && (
                  <a
                    href={set.redirectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/link ml-auto inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1 text-blue-600 no-underline transition-colors hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/40"
                  >
                    <span>Visit link</span>
                    <ExternalLink className="h-3 w-3 transition-transform group-hover/link:translate-x-0.5" />
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
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/90"
          onClick={() => setLightbox(null)}
        >
          <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-medium text-white">
              <span>{lightbox.title}</span>
              {lightbox.images.length > 1 && (
                <span className="text-xs text-white/60">
                  {lightbox.index + 1} of {lightbox.images.length}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setLightbox(null)}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <div
            className="flex w-full flex-1 items-center justify-center px-14 py-16"
            onClick={(event) => event.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lightbox.images[lightbox.index].src}
              alt={lightbox.images[lightbox.index].caption || `${lightbox.title} view ${lightbox.index + 1}`}
              className="max-h-full max-w-full select-none rounded-lg object-contain"
              draggable={false}
            />
          </div>

          {lightbox.images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setLightbox((previous) =>
                    previous
                      ? {
                          ...previous,
                          index:
                            previous.index === 0 ? previous.images.length - 1 : previous.index - 1,
                        }
                      : null,
                  );
                }}
                className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/10 text-lg text-white transition-colors hover:bg-white/20"
                aria-label="Previous image"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setLightbox((previous) =>
                    previous
                      ? {
                          ...previous,
                          index:
                            previous.index === previous.images.length - 1 ? 0 : previous.index + 1,
                        }
                      : null,
                  );
                }}
                className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/10 text-lg text-white transition-colors hover:bg-white/20"
                aria-label="Next image"
              >
                ›
              </button>
            </>
          )}

          {lightbox.images[lightbox.index].caption && (
            <div className="absolute bottom-4 left-1/2 max-w-[80%] -translate-x-1/2 rounded-lg bg-black/40 px-3 py-1.5 text-center text-xs text-white/80 backdrop-blur-sm">
              {lightbox.images[lightbox.index].caption}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
