import { NextRequest, NextResponse } from "next/server"
import { extractContent } from "../../../lib/extract"
import OpenAI from "openai"

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
})


export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json()

    if (!url) {
      return NextResponse.json(
        { success: false, error: "URL is required" },
        { status: 400 }
      )
    }

    // 1️⃣ Extract blog content
    const content = await extractContent(url)

    if (!content || content.length < 200) {
      return NextResponse.json(
        { success: false, error: "Could not extract valid blog content." },
        { status: 400 }
      )
    }

    // 2️⃣ Send to Groq LLM
    const completion = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      temperature: 0.7,
      max_tokens: 2048,
      messages: [
        {
          role: "system",
          content: `
You are a senior growth marketer writing for founders, CMOs, and marketing leaders.

Your writing style:
- Sharp
- Insightful
- Non-generic
- No robotic phrasing
- No filler like "In today's fast-paced world"
- Use strong hooks
- Sound like a real LinkedIn creator

You must return STRICTLY valid JSON.
Do NOT include explanation.
Do NOT wrap in markdown.
Do NOT add commentary.
Return only the JSON object.
          `,
        },
        {
          role: "user",
          content: `
Here is the blog content:

${content}

Repurpose it into the following structured JSON format:

{
  "linkedin": {
    "educational": "150-250 words, actionable insights",
    "controversial": "Strong opinion that challenges assumptions",
    "personal": "Story-driven hook with lesson"
  },
  "twitter": {
    "hook1": "Under 280 characters, curiosity-driven",
    "hook2": "Under 280 characters, bold framing",
    "hook3": "Under 280 characters, insight-focused"
  },
  "meta": {
    "title": "SEO meta title under 60 characters",
    "description": "SEO meta description under 160 characters",
    "keywords": "Comma-separated SEO keywords"
  },
  "youtube": {
    "title": "Curiosity-driven, clickable title",
    "description": "Compelling YouTube description"
  }
}
          `,
        },
      ],
    })

    const aiText = completion.choices[0]?.message?.content

    if (!aiText) {
      return NextResponse.json(
        { success: false, error: "AI did not return content." },
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
      { success: false, error: "Failed to generate content." },
      { status: 500 }
    )
  }
}
