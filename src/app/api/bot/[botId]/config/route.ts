import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const revalidate = 300;

export async function GET(
    request: Request,
    { params }: { params: Promise<{ botId: string }> }
) {
    const { botId } = await params;

    try {
        const bot = await prisma.bot.findUnique({
            where: { id: botId },
            select: {
                id: true,
                name: true,
                colorTheme: true,
                welcomeMessages: true,
                avatarEmoji: true,
                avatarUrl: true,
                welcomeMessage: true,
                collectLeads: true,
            }
        });

        if (!bot) {
            return NextResponse.json({ error: "Bot not found" }, { status: 404, headers: corsHeaders() });
        }

        return NextResponse.json({
            id: bot.id,
            name: bot.name,
            colorTheme: bot.colorTheme,
            welcomeMessages: bot.welcomeMessages,
            avatarEmoji: bot.avatarEmoji,
            avatarUrl: bot.avatarUrl,
            welcomeMessage: bot.welcomeMessage,
            collectLeads: bot.collectLeads,
        }, { headers: corsHeaders() });
    } catch (error: any) {
        console.error("Failed to fetch bot config:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500, headers: corsHeaders() });
    }
}

export async function OPTIONS() {
    return new Response(null, {
        status: 204,
        headers: corsHeaders(),
    });
}

function corsHeaders(): HeadersInit {
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Max-Age": "86400",
    };
}
