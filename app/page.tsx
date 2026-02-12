"use client"

import { useState, useRef, useEffect } from "react"
import { Copy, Check, Sparkles, Loader2, Heart, Share2, Zap, Target, Lightbulb, TrendingUp, Star, Flame } from "lucide-react"

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

type Tone = "professional" | "casual" | "viral" | "educational" | "witty"

const toneDescriptions: Record<Tone, { label: string; icon: React.ReactNode; desc: string }> = {
  professional: { label: "Professional", icon: <Target size={18} />, desc: "Corporate & authority" },
  casual: { label: "Casual", icon: <Sparkles size={18} />, desc: "Friendly & conversational" },
  viral: { label: "Viral", icon: <Flame size={18} />, desc: "Trendy & shareable" },
  educational: { label: "Educational", icon: <Lightbulb size={18} />, desc: "Informative & deep" },
  witty: { label: "Witty", icon: <Zap size={18} />, desc: "Clever & humorous" },
}

const platformLimits = {
  twitter: { max: 280, label: "Twitter/X" },
  linkedin: { max: 3000, label: "LinkedIn" },
  youtube: { max: 5000, label: "YouTube" },
}

export default function Home() {
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AIResult | null>(null)
  const [error, setError] = useState("")
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [tone, setTone] = useState<Tone>("professional")
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dragOverRef = useRef(false)

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
      keywords: (metaObj.keywords || metaObj["Meta Keywords"] || "") as string,
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

  const toggleFavorite = (id: string) => {
    const newFavorites = new Set(favorites)
    if (newFavorites.has(id)) {
      newFavorites.delete(id)
    } else {
      newFavorites.add(id)
    }
    setFavorites(newFavorites)
  }

  const getQualityScore = (text: string): number => {
    if (!text) return 0
    const wordCount = text.split(/\s+/).length
    const hasEmojis = /[\p{Emoji}]/u.test(text)
    const hasCaps = /[A-Z]{2,}/.test(text)
    const hasNumbers = /\d+/.test(text)
    let score = Math.min(wordCount / 20 * 25, 25)
    if (hasEmojis) score += 15
    if (hasCaps) score += 15
    if (hasNumbers) score += 15
    return Math.min(score, 100)
  }

  const getCharacterColor = (current: number, max: number): string => {
    const percentage = (current / max) * 100
    if (percentage > 100) return "text-destructive"
    if (percentage > 80) return "text-yellow-500"
    return "text-primary"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    dragOverRef.current = true
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    dragOverRef.current = false
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    dragOverRef.current = false
    const droppedText = e.dataTransfer.getData("text/plain")
    if (droppedText) {
      setUrl(droppedText)
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
        body: JSON.stringify({ url, tone }),
      })

      const data = await response.json()

      if (!data.success) {
        setError("Failed to generate content.")
        return
      }

      let rawText = data.raw.trim()

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
    platform,
  }: {
    title: string
    content: string
    id: string
    platform?: keyof typeof platformLimits
  }) => {
    const qualityScore = getQualityScore(content)
    const isLiked = favorites.has(id)
    const charLimit = platform ? platformLimits[platform].max : null
    const charCount = content.length
    const isOverLimit = charLimit && charCount > charLimit

    return (
      <div className="card-premium group relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
        
        <div className="relative z-10 flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">{title}</h3>
            {platform && charLimit && (
              <p className={`text-xs mt-1 font-medium ${getCharacterColor(charCount, charLimit)}`}>
                {charCount}/{charLimit} characters
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => toggleFavorite(id)}
              className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
            >
              <Heart size={16} fill={isLiked ? "currentColor" : "none"} className={isLiked ? "text-destructive" : "text-muted-foreground"} />
            </button>
            <button
              onClick={() => copyToClipboard(content, id)}
              className="btn-copy flex-shrink-0"
            >
              {copiedId === id ? (
                <Check size={16} />
              ) : (
                <Copy size={16} />
              )}
            </button>
          </div>
        </div>

        <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90 mb-4">
          {content}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Zap size={14} className="text-primary" />
              <span className="text-xs font-medium text-muted-foreground">Quality Score</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                style={{ width: `${qualityScore}%` }}
              />
            </div>
          </div>
          <span className="text-xs font-bold text-primary ml-3">{Math.round(qualityScore)}%</span>
        </div>
      </div>
    )
  }

  const SectionHeader = ({ title, emoji }: { title: string; emoji: string }) => (
    <div className="stagger-item">
      <div className="flex items-center gap-3 mb-6">
        <div className="text-2xl">{emoji}</div>
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {title}
          </h2>
        </div>
      </div>
    </div>
  )

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Animated background */}
      <div className="gradient-mesh fixed inset-0 -z-10" />
      
      {/* Main content */}
      <div className="relative flex flex-col items-center justify-start min-h-screen p-6 md:p-8">
        
        {/* Hero Section */}
        <div className="w-full max-w-5xl mx-auto pt-8 pb-12 text-center fade-in">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-secondary/50 border border-border">
            <Sparkles size={16} className="text-primary" />
            <span className="text-xs font-medium text-muted-foreground">AI-Powered Content Repurposing</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight text-balance">
            Transform Your Blog Into <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Multi-Platform Gold</span>
          </h1>
          
          <p className="text-lg text-muted-foreground mb-10 text-balance max-w-2xl mx-auto">
            One article. Unlimited potential. Generate LinkedIn posts, Twitter hooks, meta tags, and YouTube content instantly.
          </p>

          {/* Input Section */}
          <div className="w-full max-w-2xl mx-auto space-y-5 mb-10">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative transition-all duration-300 rounded-lg border-2 border-dashed ${dragOverRef.current ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
            >
              <input
                type="text"
                placeholder="Paste or drag your blog URL here..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleGenerate()}
                className="input-glow border-0 rounded-none"
              />
              {dragOverRef.current && (
                <div className="absolute inset-0 flex items-center justify-center bg-primary/10 rounded-lg pointer-events-none">
                  <span className="text-sm font-medium text-primary">Drop your URL here</span>
                </div>
              )}
            </div>

            {/* Tone Selector */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground uppercase tracking-wide">Choose Your Tone</label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {(Object.entries(toneDescriptions) as Array<[Tone, typeof toneDescriptions[Tone]]>).map(([toneKey, toneData]) => (
                  <button
                    key={toneKey}
                    onClick={() => setTone(toneKey)}
                    className={`p-3 rounded-lg border-2 transition-all duration-300 flex flex-col items-center gap-1.5 ${
                      tone === toneKey
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                    }`}
                  >
                    {toneData.icon}
                    <span className="text-xs font-semibold">{toneData.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || !url}
              className="btn-glow w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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

          {/* Error State */}
          {error && (
            <div className="w-full max-w-2xl mx-auto p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive fade-in">
              {error}
            </div>
          )}
        </div>

        {/* Results Section */}
        {result && (
          <div className="w-full max-w-4xl mx-auto space-y-12 pb-16">
            
            {/* Quick Stats */}
            <section className="grid grid-cols-3 gap-3 mb-12">
              <div className="card-premium p-4 text-center">
                <Star size={24} className="text-primary mx-auto mb-2" />
                <div className="text-sm font-semibold text-foreground">{Object.keys(result).length}</div>
                <div className="text-xs text-muted-foreground">Platforms</div>
              </div>
              <div className="card-premium p-4 text-center">
                <TrendingUp size={24} className="text-primary mx-auto mb-2" />
                <div className="text-sm font-semibold text-foreground">{favorites.size}</div>
                <div className="text-xs text-muted-foreground">Saved</div>
              </div>
              <div className="card-premium p-4 text-center">
                <Zap size={24} className="text-primary mx-auto mb-2" />
                <div className="text-sm font-semibold text-foreground capitalize">{tone}</div>
                <div className="text-xs text-muted-foreground">Tone</div>
              </div>
            </section>

            {/* LinkedIn Posts */}
            <section className="space-y-4">
              <SectionHeader title="LinkedIn Posts" emoji="💼" />
              <div className="space-y-3">
                <Card
                  id="linkedin-educational"
                  platform="linkedin"
                  title="Educational"
                  content={formatContent(result.linkedin.educational)}
                />
                <Card
                  id="linkedin-controversial"
                  platform="linkedin"
                  title="Controversial Take"
                  content={formatContent(result.linkedin.controversial)}
                />
                <Card
                  id="linkedin-personal"
                  platform="linkedin"
                  title="Personal Story"
                  content={formatContent(result.linkedin.personal)}
                />
              </div>
            </section>

            {/* Twitter Hooks */}
            <section className="space-y-4">
              <SectionHeader title="Twitter Hooks" emoji="𝕏" />
              <div className="space-y-3">
                <Card
                  id="twitter-hook1"
                  platform="twitter"
                  title="Hook 1"
                  content={formatContent(result.twitter.hook1)}
                />
                <Card
                  id="twitter-hook2"
                  platform="twitter"
                  title="Hook 2"
                  content={formatContent(result.twitter.hook2)}
                />
                <Card
                  id="twitter-hook3"
                  platform="twitter"
                  title="Hook 3"
                  content={formatContent(result.twitter.hook3)}
                />
              </div>
            </section>

            {/* Meta Tags */}
            <section className="space-y-4">
              <SectionHeader title="SEO Meta Tags" emoji="🏷️" />
              {(() => {
                const meta = normalizeMeta(result.meta)
                return (
                  <>
                    <Card
                      id="meta-title"
                      title="Meta Title"
                      content={meta.title}
                    />
                    <Card
                      id="meta-description"
                      title="Meta Description"
                      content={meta.description}
                    />
                    <Card
                      id="meta-keywords"
                      title="Meta Keywords"
                      content={meta.keywords}
                    />
                    <div className="p-4 rounded-lg bg-secondary/20 border border-border">
                      <p className="text-xs text-muted-foreground">
                        Description Length: <span className="font-semibold text-foreground">{meta.description.length}</span> characters
                        <span className={meta.description.length > 160 ? " text-destructive" : " text-primary"}>
                          {meta.description.length > 160 ? " (too long)" : " (optimal)"}
                        </span>
                      </p>
                    </div>
                  </>
                )
              })()}
            </section>

            {/* YouTube Content */}
            <section className="space-y-4">
              <SectionHeader title="YouTube Version" emoji="▶️" />
              <div className="space-y-3">
                <Card
                  id="youtube-title"
                  title="Video Title"
                  content={formatContent(result.youtube.title)}
                />
                <Card
                  id="youtube-description"
                  platform="youtube"
                  title="Video Description"
                  content={formatContent(result.youtube.description)}
                />
              </div>
            </section>

          </div>
        )}
      </div>
    </main>
  )
}
