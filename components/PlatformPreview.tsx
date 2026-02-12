import { Linkedin, Twitter, Youtube } from "lucide-react"

interface PlatformPreviewProps {
  platform: "linkedin" | "twitter" | "youtube"
  content: string
  characterLimit: number
}

const platformStyles = {
  linkedin: {
    bgColor: "bg-blue-900/20",
    borderColor: "border-blue-600",
    icon: <Linkedin size={20} className="text-blue-500" />,
    name: "LinkedIn",
  },
  twitter: {
    bgColor: "bg-blue-400/20",
    borderColor: "border-blue-400",
    icon: <Twitter size={20} className="text-blue-400" />,
    name: "Twitter/X",
  },
  youtube: {
    bgColor: "bg-red-900/20",
    borderColor: "border-red-600",
    icon: <Youtube size={20} className="text-red-600" />,
    name: "YouTube",
  },
}

export function PlatformPreview({
  platform,
  content,
  characterLimit,
}: PlatformPreviewProps) {
  const style = platformStyles[platform]
  const charCount = content.length
  const percentage = (charCount / characterLimit) * 100
  const isOverLimit = charCount > characterLimit

  return (
    <div
      className={`rounded-lg border-2 ${style.borderColor} ${style.bgColor} p-4 backdrop-blur-sm`}
    >
      <div className="flex items-center gap-2 mb-3">
        {style.icon}
        <span className="font-semibold text-sm text-foreground">{style.name}</span>
      </div>
      <p className="text-sm text-foreground/80 mb-4 line-clamp-3">{content}</p>
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Characters</span>
          <span className={isOverLimit ? "text-destructive font-semibold" : "text-primary"}>
            {charCount}/{characterLimit}
          </span>
        </div>
        <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              isOverLimit
                ? "bg-destructive"
                : percentage > 80
                  ? "bg-yellow-500"
                  : "bg-primary"
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>
    </div>
  )
}
