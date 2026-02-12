import axios from "axios"
import { JSDOM } from "jsdom"
import { Readability } from "@mozilla/readability"

export async function extractContent(url: string) {
  try {
    // 1️⃣ Fetch raw HTML
    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    })

    // 2️⃣ Convert HTML into DOM
    const dom = new JSDOM(response.data, { url })

    // 3️⃣ Run Readability on DOM
    const reader = new Readability(dom.window.document)
    const article = reader.parse()

    if (!article || !article.textContent) {
      throw new Error("Could not extract readable content.")
    }

    // 4️⃣ Limit content length (important for AI token limits)
    const cleanedText = article.textContent.trim().slice(0, 12000)

    return cleanedText
  } catch (error) {
    console.error("Extraction Error:", error)
    throw new Error("Failed to extract blog content.")
  }
}
