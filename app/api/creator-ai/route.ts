import { NextResponse } from "next/server";
import { creatorAI } from "@/lib/creator-ai";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const prompt = typeof body?.prompt === "string" ? body.prompt : "";

    if (!prompt.trim()) {
      return NextResponse.json({ error: "Tell CreatorHub what you are making." }, { status: 400 });
    }

    return NextResponse.json({ result: creatorAI(prompt) });
  } catch {
    return NextResponse.json({ error: "CreatorHub AI could not process that request." }, { status: 400 });
  }
}
