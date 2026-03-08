import { NextRequest, NextResponse } from "next/server";

const BEDROCK_API_KEY = process.env.OPENAI_API_KEY || '';
const BEDROCK_BASE_URL = process.env.OPENAI_BASE_URL || 'https://bedrock-mantle.eu-north-1.api.aws/v1';

export async function POST(request: NextRequest) {
    try {
        if (!BEDROCK_API_KEY) {
            return NextResponse.json(
                { error: "Bedrock API key not configured" },
                { status: 500 }
            );
        }

        const body = await request.json();

        const response = await fetch(`${BEDROCK_BASE_URL}/chat/completions`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${BEDROCK_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorText = await response.text();
            return NextResponse.json(
                { error: `Bedrock API error: ${errorText}` },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data, {
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            },
        });
    } catch (error: any) {
        console.error("Proxy error:", error);
        return NextResponse.json(
            { error: error.message || "Proxy failed" },
            { status: 500 }
        );
    }
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        },
    });
}
