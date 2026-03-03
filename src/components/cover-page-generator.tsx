"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Edit3, Palette, Type, Image as ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface CoverPageData {
  title: string
  subtitle: string
  author: string
  illustrator: string
  genre: string
  description: string
  style: string
  layout: 'centered' | 'left' | 'right' | 'manga'
  colorScheme: 'dark' | 'light' | 'vibrant' | 'monochrome'
}

interface CoverPageGeneratorProps {
  onCoverGenerate: (coverData: CoverPageData) => void
  className?: string
}

export function CoverPageGenerator({ onCoverGenerate, className }: CoverPageGeneratorProps) {
  const [coverData, setCoverData] = useState<CoverPageData>({
    title: "Sweet Apocalypse",
    subtitle: "A Comic Journey",
    author: "Your Name",
    illustrator: "AI Assistant",
    genre: "Sci-Fi Adventure",
    description: "An epic tale of survival and discovery in a post-apocalyptic world.",
    style: "Comic book art with vibrant colors",
    layout: 'centered',
    colorScheme: 'vibrant'
  })

  const [isGenerating, setIsGenerating] = useState(false)

  const handleInputChange = (field: keyof CoverPageData, value: string) => {
    setCoverData(prev => ({ ...prev, [field]: value }))
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    
    // Simulate cover generation
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    onCoverGenerate(coverData)
    setIsGenerating(false)
  }

  const getLayoutPreview = () => {
    switch (coverData.layout) {
      case 'centered':
        return "Title and author centered on page"
      case 'left':
        return "Title aligned left with vertical layout"
      case 'right':
        return "Title aligned right with artistic elements"
      case 'manga':
        return "Japanese manga style with right-to-left reading"
      default:
        return "Standard centered layout"
    }
  }

  const getColorSchemePreview = () => {
    switch (coverData.colorScheme) {
      case 'dark':
        return "Dark background with bright text"
      case 'light':
        return "Light background with dark text"
      case 'vibrant':
        return "High contrast, saturated colors"
      case 'monochrome':
        return "Black and white with shades of gray"
      default:
        return "Standard color scheme"
    }
  }

  return (
    <div className={cn("space-y-6", className)}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5" />
            <span>Cover Page Generator</span>
          </CardTitle>
          <CardDescription>
            Create a professional cover page with title, author info, and styling
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center space-x-2">
                <Edit3 className="h-4 w-4" />
                <span>Basic Information</span>
              </h3>
              
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={coverData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter comic title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subtitle">Subtitle</Label>
                  <Input
                    id="subtitle"
                    value={coverData.subtitle}
                    onChange={(e) => handleInputChange('subtitle', e.target.value)}
                    placeholder="Enter subtitle (optional)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="author">Author *</Label>
                  <Input
                    id="author"
                    value={coverData.author}
                    onChange={(e) => handleInputChange('author', e.target.value)}
                    placeholder="Enter author name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="illustrator">Illustrator</Label>
                  <Input
                    id="illustrator"
                    value={coverData.illustrator}
                    onChange={(e) => handleInputChange('illustrator', e.target.value)}
                    placeholder="Enter illustrator name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="genre">Genre</Label>
                  <Select value={coverData.genre} onValueChange={(value) => handleInputChange('genre', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select genre" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sci-Fi Adventure">Sci-Fi Adventure</SelectItem>
                      <SelectItem value="Fantasy">Fantasy</SelectItem>
                      <SelectItem value="Mystery">Mystery</SelectItem>
                      <SelectItem value="Romance">Romance</SelectItem>
                      <SelectItem value="Horror">Horror</SelectItem>
                      <SelectItem value="Comedy">Comedy</SelectItem>
                      <SelectItem value="Drama">Drama</SelectItem>
                      <SelectItem value="Action">Action</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Style and Layout */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center space-x-2">
                <Palette className="h-4 w-4" />
                <span>Style & Layout</span>
              </h3>

              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={coverData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Brief description of the comic"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="style">Art Style</Label>
                  <Input
                    id="style"
                    value={coverData.style}
                    onChange={(e) => handleInputChange('style', e.target.value)}
                    placeholder="e.g., Comic book art, manga style, watercolor"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Layout</Label>
                  <Select value={coverData.layout} onValueChange={(value: any) => handleInputChange('layout', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select layout" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="centered">Centered</SelectItem>
                      <SelectItem value="left">Left Aligned</SelectItem>
                      <SelectItem value="right">Right Aligned</SelectItem>
                      <SelectItem value="manga">Manga Style</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">{getLayoutPreview()}</p>
                </div>

                <div className="space-y-2">
                  <Label>Color Scheme</Label>
                  <Select value={coverData.colorScheme} onValueChange={(value: any) => handleInputChange('colorScheme', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select color scheme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="vibrant">Vibrant</SelectItem>
                      <SelectItem value="monochrome">Monochrome</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">{getColorSchemePreview()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Preview Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center space-x-2">
              <Type className="h-4 w-4" />
              <span>Cover Preview</span>
            </h3>
            
            <Card className="bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
              <CardContent className="p-8">
                <div className={cn(
                  "text-center space-y-4 min-h-[400px] flex flex-col justify-center",
                  coverData.layout === 'left' && "text-left",
                  coverData.layout === 'right' && "text-right"
                )}>
                  <div className="space-y-2">
                    <h1 className="text-4xl font-bold text-primary">
                      {coverData.title || "Untitled"}
                    </h1>
                    {coverData.subtitle && (
                      <h2 className="text-xl text-muted-foreground">
                        {coverData.subtitle}
                      </h2>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium">By {coverData.author || "Unknown Author"}</p>
                    {coverData.illustrator && (
                      <p className="text-sm text-muted-foreground">
                        Illustrated by {coverData.illustrator}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-center">
                    <Badge variant="secondary">{coverData.genre}</Badge>
                  </div>

                  {coverData.description && (
                    <p className="text-sm text-muted-foreground max-w-md mx-auto italic">
                      "{coverData.description}"
                    </p>
                  )}

                  <div className="text-xs text-muted-foreground">
                    Style: {coverData.style} • {coverData.colorScheme} scheme
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Generate Button */}
          <div className="flex justify-center">
            <Button 
              onClick={handleGenerate}
              disabled={isGenerating || !coverData.title || !coverData.author}
              size="lg"
              className="flex items-center space-x-2"
            >
              <ImageIcon className="h-4 w-4" />
              <span>{isGenerating ? "Generating Cover..." : "Generate Cover Page"}</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
