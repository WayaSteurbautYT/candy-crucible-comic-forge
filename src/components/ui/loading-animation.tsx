"use client"

import { cn } from "@/lib/utils"

interface LoadingAnimationProps {
  className?: string
  size?: "sm" | "md" | "lg"
  text?: string
}

export function LoadingAnimation({ className, size = "md", text }: LoadingAnimationProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8"
  }

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <div className="flex space-x-1">
        <div className={cn(
          "bg-primary rounded-full animate-bounce",
          sizeClasses[size]
        )} style={{ animationDelay: '0ms' }} />
        <div className={cn(
          "bg-primary rounded-full animate-bounce",
          sizeClasses[size]
        )} style={{ animationDelay: '150ms' }} />
        <div className={cn(
          "bg-primary rounded-full animate-bounce", 
          sizeClasses[size]
        )} style={{ animationDelay: '300ms' }} />
      </div>
      {text && (
        <span className="text-sm text-muted-foreground animate-pulse">
          {text}
        </span>
      )}
    </div>
  )
}

export function ChatGPTLoadingAnimation({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
      </div>
      <span className="text-sm text-gray-500">Thinking...</span>
    </div>
  )
}

export function StoryGenerationLoading({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col items-center space-y-4 p-8", className)}>
      <div className="relative">
        <div className="w-16 h-16 border-4 border-primary/20 rounded-full" />
        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-primary rounded-full animate-spin border-t-transparent" />
      </div>
      <div className="text-center space-y-2">
        <h3 className="text-lg font-medium">Generating Story</h3>
        <p className="text-sm text-muted-foreground">AI is creating your comic storyline...</p>
        <div className="flex items-center justify-center space-x-2">
          <LoadingAnimation size="sm" />
          <span className="text-xs text-muted-foreground">Analyzing narrative structure</span>
        </div>
      </div>
    </div>
  )
}

export function ImageGenerationLoading({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col items-center space-y-4 p-8", className)}>
      <div className="grid grid-cols-3 gap-2">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/40 rounded-lg animate-pulse"
            style={{ animationDelay: `${i * 100}ms` }}
          />
        ))}
      </div>
      <div className="text-center space-y-2">
        <h3 className="text-lg font-medium">Generating Images</h3>
        <p className="text-sm text-muted-foreground">Creating comic panels with AI...</p>
        <div className="flex items-center justify-center space-x-2">
          <LoadingAnimation size="sm" />
          <span className="text-xs text-muted-foreground">Rendering artwork</span>
        </div>
      </div>
    </div>
  )
}
