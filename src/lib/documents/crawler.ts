// NOTE: Remember to populate JINA_API_KEY in your root .env.local file
import robotsParser from "robots-parser";

interface CrawlResult {
    url: string;
    content: string;
    title: string;
}

/**
 * Robust multi-page crawler using fetch + Jina AI Reader API.
 * Supports depth-limited Breadth-First Search (BFS).
 */
export async function crawlWebsite(
    startUrl: string,
    maxPages: number = 30,
    maxDepth: number = 2
): Promise<CrawlResult[]> {
    const results: CrawlResult[] = [];
    const visited = new Set<string>();
    const queue: Array<{ url: string; depth: number }> = [
        { url: startUrl, depth: 0 },
    ];

    const baseUrl = new URL(startUrl);
    const domain = baseUrl.origin;

    // Try to respect robots.txt (optional but good practice)
    let robots: any = null;
    try {
        const robotsRes = await fetch(`${domain}/robots.txt`);
        if (robotsRes.ok) {
            const robotsTxt = await robotsRes.text();
            robots = robotsParser(`${domain}/robots.txt`, robotsTxt);
        }
    } catch (e) {
        console.warn("Could not fetch robots.txt", e);
    }

    while (queue.length > 0 && results.length < maxPages) {
        const { url: currentUrl, depth } = queue.shift()!;

        if (visited.has(currentUrl) || depth > maxDepth) continue;
        visited.add(currentUrl);

        // Check robots.txt
        if (robots && !robots.isAllowed(currentUrl, "KnoChat-Crawler/1.0")) {
            console.log(`Skipping ${currentUrl} (disallowed by robots.txt)`);
            continue;
        }

        console.log(`Crawling: ${currentUrl} (depth: ${depth})`);

        try {
            if (!process.env.JINA_API_KEY) {
                console.warn("[INGESTION ERROR]: Jina API pipeline failed (API Key missing)");
                // Return what we have so far instead of crashing
                return results;
            }

            const response = await fetch(`https://r.jina.ai/${currentUrl}`, {
                headers: {
                    "Authorization": `Bearer ${process.env.JINA_API_KEY}`,
                    "Accept": "text/plain",
                },
                signal: AbortSignal.timeout(15000), // 15s timeout per page
            });

            if (!response.ok) {
                console.warn(`[INGESTION ERROR]: Jina API pipeline failed for ${currentUrl} with status ${response.status}`);
                continue;
            }

            const content = await response.text();

            // Jina returns clean Markdown. We can use the URL as the title since we don't parse the HTML title tag.
            // (Alternatively we could try to extract the first heading #, but URL is safer fallback).
            const titleMatch = content.match(/^#\s+(.*)/m);
            const title = titleMatch ? titleMatch[1].trim() : currentUrl;

            if (content.length > 200) {
                results.push({ url: currentUrl, content, title });
            }

            // Find more links if not at max depth by parsing Markdown links: [text](url)
            if (depth < maxDepth && results.length < maxPages) {
                const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
                let match;
                while ((match = linkRegex.exec(content)) !== null) {
                    const href = match[2];
                    if (!href) continue;

                    try {
                        const absoluteUrl = new URL(href, currentUrl);
                        const cleanUrl = absoluteUrl.origin + absoluteUrl.pathname;

                        // Only crawl same domain
                        if (
                            absoluteUrl.origin === domain &&
                            !visited.has(cleanUrl) &&
                            !cleanUrl.includes("#") &&
                            !/\.(jpg|jpeg|png|gif|pdf|zip|docx|csv|json|xml|css|js)$/i.test(cleanUrl)
                        ) {
                            queue.push({ url: cleanUrl, depth: depth + 1 });
                        }
                    } catch (e) {
                        // Ignore invalid URLs
                    }
                }
            }
        } catch (error) {
            // Log it silently but do not crash the entire crawl (Requirement: Error Handling)
            console.warn(`[INGESTION ERROR]: Jina API pipeline failed for ${currentUrl}. Skipping due to error:`, error instanceof Error ? error.message : error);
        }
    }

    return results;
}
