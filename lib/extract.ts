import axios from "axios"
import * as cheerio from "cheerio"

export async function extractContent(url: string) {
  try {
    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      timeout: 15000,
    })

    const $ = cheerio.load(response.data)

    // Remove non-content elements
    $("script, style, nav, footer, header, aside, noscript").remove()

    // Try common blog content containers first
    let text =
      $("article").text() ||
      $(".post-content").text() ||
      $(".entry-content").text() ||
      $(".content").text() ||
      $("main").text()

    // Fallback to full body
    if (!text || text.length < 300) {
      text = $("body").text()
    }

    const cleanedText = text
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 12000)

    if (!cleanedText || cleanedText.length < 300) {
      throw new Error("Could not extract sufficient content.")
    }

    return cleanedText

  } catch (error) {
    console.error("Extraction Error:", error)
    throw new Error("Failed to extract blog content.")
  }
}
