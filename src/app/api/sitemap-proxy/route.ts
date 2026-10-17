import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function isPrivateOrLocalHost(hostname: string): boolean {
    const lower = hostname.toLowerCase();
    if (
        lower === "localhost" ||
        lower === "127.0.0.1" ||
        lower === "::1" ||
        lower === "0.0.0.0" ||
        lower.endsWith(".local") ||
        lower.endsWith(".internal") ||
        lower.endsWith(".localhost")
    ) {
        return true;
    }

    // Check IPv4 private and link-local ranges
    const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    const match = lower.match(ipv4Regex);
    if (match) {
        const [_, o1, o2] = match.map(Number);
        if (o1 === 10) return true; // 10.0.0.0/8
        if (o1 === 127) return true; // 127.0.0.0/8
        if (o1 === 169 && o2 === 254) return true; // 169.254.0.0/16 (cloud metadata)
        if (o1 === 172 && o2 >= 16 && o2 <= 31) return true; // 172.16.0.0/12
        if (o1 === 192 && o2 === 168) return true; // 192.168.0.0/16
        if (o1 === 0) return true; // 0.0.0.0/8
    }

    return false;
}

export async function GET(req: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = req.nextUrl.searchParams.get("url");

    if (!url) {
        return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
    }

    try {
        const parsed = new URL(url);
        if (!["http:", "https:"].includes(parsed.protocol)) {
            return NextResponse.json({ error: "Invalid URL protocol" }, { status: 400 });
        }

        if (isPrivateOrLocalHost(parsed.hostname)) {
            return NextResponse.json({ error: "Access to private or local network addresses is prohibited" }, { status: 403 });
        }

        const response = await fetch(url, {
            headers: { "User-Agent": "KnowChat-SitemapFetcher/1.0" },
            signal: AbortSignal.timeout(15000),
            redirect: "error", // Prevent redirect bypass to internal IPs
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
                "Cache-Control": "private, no-cache",
            },
        });
    } catch {
        return NextResponse.json(
            { error: "Failed to fetch the sitemap URL" },
            { status: 500 }
        );
    }
}

