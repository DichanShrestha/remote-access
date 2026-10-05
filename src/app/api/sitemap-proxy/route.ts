import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const url = req.nextUrl.searchParams.get("url");

    if (!url) {
        return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
    }

    try {
        const parsed = new URL(url);
        if (!["http:", "https:"].includes(parsed.protocol)) {
            return NextResponse.json({ error: "Invalid URL protocol" }, { status: 400 });
        }

        const response = await fetch(url, {
            headers: { "User-Agent": "KnowChat-SitemapFetcher/1.0" },
            signal: AbortSignal.timeout(15000),
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: `Failed to fetch sitemap: ${response.status}` },
                { status: response.status }
            );
        }

        const contentType = response.headers.get("content-type") || "";
        if (!contentType.includes("xml") && !contentType.includes("text")) {
            return NextResponse.json(
                { error: "Response is not XML or text" },
                { status: 400 }
            );
        }

        const text = await response.text();
        return new NextResponse(text, {
            headers: {
                "Content-Type": contentType || "text/plain",
                "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
            },
        });
    } catch {
        return NextResponse.json(
            { error: "Failed to fetch the sitemap URL" },
            { status: 500 }
        );
    }
}
