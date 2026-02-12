import { NextRequest, NextResponse } from "next/server"
import { extractContent } from "../../../lib/extract"
import OpenAI from "openai"

export const runtime = "nodejs" // REQUIRED for jsdom + axios

const tonePrompts: Record<string, string> = {
  professional: "Use a professional, authoritative tone with industry insights.",
  casual: "Use a friendly, conversational tone with relatability.",
  viral: "Use trendy, shareable language with strong hooks.",
  educational: "Use an informative, educational tone with detailed insights.",
  witty: "Use clever wordplay, subtle humor, and sharp observations.",
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)

    if (!body || !body.url) {
      return NextResponse.json(
        { success: false, error: "URL is required." },
        { status: 400 }
      )
    }

    const url: string = body.url
    const tone: string = body.tone || "professional"

    // 🔐 Ensure API key exists
    if (!process.env.GROQ_API_KEY) {
      console.error("Missing GROQ_API_KEY")
      return NextResponse.json(
        { success: false, error: "Server misconfiguration." },
        { status: 500 }
      )
    }

    // ✅ Initialize client INSIDE handler (prevents build crash)
    const client = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
    })

    // 1️⃣ Extract blog content
    const content = await extractContent(url)

    if (!content || content.length < 200) {
      return NextResponse.json(
        { success: false, error: "Could not extract valid blog content." },
        { status: 400 }
      )
    }

    // 2️⃣ Call LLM
    const completion = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      temperature: 0.7,
      max_tokens: 2048,
      messages: [
        {
          role: "system",
          content: `
You are a senior growth marketer writing for founders, CMOs, and marketing leaders.

Style:
- Sharp
- Insightful
- Human
- No robotic phrasing
- No filler phrases
- Strong hooks
- ${tonePrompts[tone] || tonePrompts.professional}

Return STRICTLY valid JSON.
Do NOT wrap in markdown.
Do NOT add explanation.
Only return JSON.
          `,
        },
        {
          role: "user",
          content: `
Here is the blog content:

${content}

Return this exact JSON structure:

{
  "linkedin": {
    "educational": "",
    "controversial": "",
    "personal": ""
  },
  "twitter": {
    "hook1": "",
    "hook2": "",
    "hook3": ""
  },
  "meta": {
    "title": "",
    "description": "",
    "keywords": ""
  },
  "youtube": {
    "title": "",
    "description": ""
  }
}
          `,
        },
      ],
    })

    const aiText = completion.choices?.[0]?.message?.content

    if (!aiText) {
      return NextResponse.json(
        { success: false, error: "AI returned empty response." },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      raw: aiText,
    })

  } catch (error) {
    console.error("API Error:", error)

    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    )
  }
}
