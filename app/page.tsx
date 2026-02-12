"use client"

import { useState } from "react"
import { Copy, Check, Sparkles, Loader2 } from "lucide-react"

type AIResult = {
  linkedin: {
    educational: unknown
    controversial: unknown
    personal: unknown
  }
  twitter: {
    hook1: unknown
    hook2: unknown
    hook3: unknown
  }
  meta: unknown
  youtube: {
    title: unknown
    description: unknown
  }
}

export default function Home() {
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AIResult | null>(null)
  const [error, setError] = useState("")
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const formatContent = (value: unknown): string => {
    if (!value) return ""
    if (typeof value === "string") return value
    if (typeof value === "object") {
      return Object.entries(value)
        .map(([key, val]) => `${key.toUpperCase()}: ${val}`)
        .join("\n\n")
    }
    return String(value)
  }

  const normalizeMeta = (meta: unknown) => {
    if (!meta) {
      return { title: "", description: "", keywords: "" }
    }

    if (typeof meta === "string") {
      return {
        title: "",
        description: meta,
        keywords: "",
      }
    }

    const metaObj = meta as Record<string, unknown>

    return {
      title: (metaObj.title || metaObj["Meta Title"] || "") as string,
      description:
        (metaObj.description || metaObj["Meta Description"] || "") as string,
      keywords:
        (metaObj.keywords || metaObj["Meta Keywords"] || "") as string,
    }
  }

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      console.error("Copy failed:", err)
    }
  }

  const handleGenerate = async () => {
    if (!url) return

    setError("")
    setResult(null)

    try {
      setLoading(true)

      const response = await fetch("/api/repurpose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      })

      // ✅ Handle non-200 responses safely
      if (!response.ok) {
        const errText = await response.text()
        console.error("API Error Response:", errText)
        setError("Server error occurred. Please try another URL.")
        return
      }

      const text = await response.text()
      console.log("Raw API response:", text)

      if (!text) {
        setError("Empty response from server.")
        return
      }

      const data = JSON.parse(text)

      if (!data.success) {
        setError("Failed to generate content.")
        return
      }

      let rawText = data.raw?.trim()

      if (!rawText) {
        setError("No content generated.")
        return
      }

      if (rawText.startsWith("```")) {
        rawText = rawText.replace(/```json|```/g, "").trim()
      }

      const firstBrace = rawText.indexOf("{")
      const lastBrace = rawText.lastIndexOf("}")

      if (firstBrace !== -1 && lastBrace !== -1) {
        rawText = rawText.slice(firstBrace, lastBrace + 1)
      }

      const parsed = JSON.parse(rawText)
      setResult(parsed)

    } catch (err) {
      console.error("Frontend Error:", err)
      setError("Something went wrong. Please try another URL.")
    } finally {
      setLoading(false)
    }
  }

  const Card = ({
    title,
    content,
    id,
  }: {
    title: string
    content: string
    id: string
  }) => (
    <div className="card-premium group">
      <div className="flex items-start justify-between gap-4 mb-4">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
          {title}
        </h3>
        <button
          onClick={() => copyToClipboard(content, id)}
          className="btn-copy flex-shrink-0"
        >
          {copiedId === id ? <Check size={16} /> : <Copy size={16} />}
        </button>
      </div>
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
        {content}
      </p>
    </div>
  )

  const SectionHeader = ({
    title,
    emoji,
  }: {
    title: string
    emoji: string
  }) => (
    <div className="stagger-item">
      <div className="flex items-center gap-3 mb-6">
        <div className="text-2xl">{emoji}</div>
        <h2 className="text-2xl font-bold">{title}</h2>
      </div>
    </div>
  )

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="gradient-mesh fixed inset-0 -z-10" />

      <div className="relative flex flex-col items-center justify-start min-h-screen p-6 md:p-8">
        <div className="w-full max-w-4xl mx-auto pt-8 pb-16 text-center">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-secondary/50 border border-border">
            <Sparkles size={16} className="text-primary" />
            <span className="text-xs font-medium text-muted-foreground">
              AI-Powered Content Repurposing
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Transform Your Blog Into Multi-Platform Gold
          </h1>

          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
            Generate LinkedIn posts, Twitter hooks, SEO meta tags, and YouTube content instantly.
          </p>

          <div className="w-full max-w-2xl mx-auto space-y-4 mb-8">
            <input
              type="text"
              placeholder="Paste your blog URL here..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="input-glow"
            />

            <button
              onClick={handleGenerate}
              disabled={loading || !url}
              className="btn-glow w-full flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Extracting & Generating...</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>Generate Content</span>
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="text-red-400">{error}</div>
          )}
        </div>

        {result && (
          <div className="w-full max-w-4xl mx-auto space-y-12 pb-16">

            <section>
              <SectionHeader title="LinkedIn Posts" emoji="💼" />
              <div className="space-y-3">
                <Card id="l1" title="Educational" content={formatContent(result.linkedin.educational)} />
                <Card id="l2" title="Controversial" content={formatContent(result.linkedin.controversial)} />
                <Card id="l3" title="Personal Story" content={formatContent(result.linkedin.personal)} />
              </div>
            </section>

            <section>
              <SectionHeader title="Twitter Hooks" emoji="𝕏" />
              <div className="space-y-3">
                <Card id="t1" title="Hook 1" content={formatContent(result.twitter.hook1)} />
                <Card id="t2" title="Hook 2" content={formatContent(result.twitter.hook2)} />
                <Card id="t3" title="Hook 3" content={formatContent(result.twitter.hook3)} />
              </div>
            </section>

            <section>
              <SectionHeader title="SEO Meta Tags" emoji="🏷️" />
              {(() => {
                const meta = normalizeMeta(result.meta)
                return (
                  <>
                    <Card id="m1" title="Meta Title" content={meta.title} />
                    <Card id="m2" title="Meta Description" content={meta.description} />
                    <Card id="m3" title="Meta Keywords" content={meta.keywords} />
                  </>
                )
              })()}
            </section>

            <section>
              <SectionHeader title="YouTube Version" emoji="▶️" />
              <div className="space-y-3">
                <Card id="y1" title="Video Title" content={formatContent(result.youtube.title)} />
                <Card id="y2" title="Video Description" content={formatContent(result.youtube.description)} />
              </div>
            </section>

          </div>
        )}
      </div>
    </main>
  )
}
