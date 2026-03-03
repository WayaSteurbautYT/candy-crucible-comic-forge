"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { StoryManager } from "@/components/story-manager"
import { AIModelManager } from "@/components/ai-model-manager"
import { CoverPageGenerator } from "@/components/cover-page-generator"
import { ComicLayoutSelector, ComicLayoutType } from "@/components/comic-layout-selector"
import { StoryGenerationLoading, ImageGenerationLoading } from "@/components/ui/loading-animation"
import { OstrisToolkit } from "@/components/ostris-toolkit"
import { ModelDownloadManager } from "@/components/model-download-manager"
import { 
  BookOpen, 
  Brain, 
  Palette, 
  Layout, 
  Zap, 
  Download,
  Settings,
  Sparkles,
  Rocket
} from "lucide-react"
import { cn } from "@/lib/utils"

interface EnhancedDashboardProps {
  className?: string
}

export function EnhancedDashboard({ className }: EnhancedDashboardProps) {
  const [activeTab, setActiveTab] = useState("story")
  const [selectedStory, setSelectedStory] = useState("")
  const [selectedModel, setSelectedModel] = useState<any>({
    id: 'flux-minecraft-movie',
    name: 'FLUX Minecraft Movie',
    type: 'image',
    provider: 'flux',
    status: 'ready',
    description: 'Specialized FLUX model for Minecraft-style movie scenes and comic generation',
    apiEndpoint: 'https://huggingface.co/fofr/flux-minecraft-movie',
    requiresApiKey: false,
    isLocal: false
  })
  const [selectedLayout, setSelectedLayout] = useState<ComicLayoutType>("flat-page")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationStep, setGenerationStep] = useState<'story' | 'cover' | 'images' | null>(null)

  const handleStorySelect = (story: string) => {
    setSelectedStory(story)
  }

  const handleModelSelect = (model: any) => {
    setSelectedModel(model)
  }

  const handleCoverGenerate = (coverData: any) => {
    console.log("Cover generated:", coverData)
  }

  const handleLayoutSelect = (layout: ComicLayoutType) => {
    setSelectedLayout(layout)
  }

  const handleStartGeneration = async () => {
    if (!selectedStory || !selectedModel) {
      alert("Please select a story and AI model first")
      return
    }

    setIsGenerating(true)
    
    // Step 1: Generate story
    setGenerationStep('story')
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Step 2: Generate cover
    setGenerationStep('cover')
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Step 3: Generate images
    setGenerationStep('images')
    await new Promise(resolve => setTimeout(resolve, 5000))
    
    setIsGenerating(false)
    setGenerationStep(null)
  }

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'story':
        return <BookOpen className="h-4 w-4" />
      case 'ai':
        return <Brain className="h-4 w-4" />
      case 'cover':
        return <Palette className="h-4 w-4" />
      case 'layout':
        return <Layout className="h-4 w-4" />
      case 'generate':
        return <Rocket className="h-4 w-4" />
      case 'downloads':
        return <Download className="h-4 w-4" />
      default:
        return <Sparkles className="h-4 w-4" />
    }
  }

  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-purple-950 dark:via-pink-950 dark:to-orange-950", className)}>
      {/* Header */}
      <div className="border-b bg-background/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Sweet Apocalypse Comic Factory
                </h1>
                <p className="text-sm text-muted-foreground">
                  Your version of comics factory with extra features
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {selectedStory && (
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <BookOpen className="h-3 w-3" />
                  <span>Story Loaded</span>
                </Badge>
              )}
              {selectedModel && (
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <Brain className="h-3 w-3" />
                  <span>{selectedModel.name}</span>
                </Badge>
              )}
              {selectedLayout && (
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <Layout className="h-3 w-3" />
                  <span>{selectedLayout}</span>
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 h-auto p-1 bg-background/80 backdrop-blur-sm">
            <TabsTrigger value="story" className="flex items-center space-x-2 p-3">
              {getTabIcon('story')}
              <span>Story</span>
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center space-x-2 p-3">
              {getTabIcon('ai')}
              <span>AI Models</span>
            </TabsTrigger>
            <TabsTrigger value="cover" className="flex items-center space-x-2 p-3">
              {getTabIcon('cover')}
              <span>Cover</span>
            </TabsTrigger>
            <TabsTrigger value="layout" className="flex items-center space-x-2 p-3">
              {getTabIcon('layout')}
              <span>Layout</span>
            </TabsTrigger>
            <TabsTrigger value="generate" className="flex items-center space-x-2 p-3">
              {getTabIcon('generate')}
              <span>Generate</span>
            </TabsTrigger>
            <TabsTrigger value="downloads" className="flex items-center space-x-2 p-3">
              {getTabIcon('downloads')}
              <span>Downloads</span>
            </TabsTrigger>
          </TabsList>

          <div className="mt-8">
            <TabsContent value="story" className="space-y-6">
              <StoryManager onStorySelect={handleStorySelect} />
            </TabsContent>

            <TabsContent value="ai" className="space-y-6">
              <AIModelManager 
                onModelSelect={handleModelSelect}
                selectedModel={selectedModel}
              />
            </TabsContent>

            <TabsContent value="cover" className="space-y-6">
              <CoverPageGenerator onCoverGenerate={handleCoverGenerate} />
            </TabsContent>

            <TabsContent value="layout" className="space-y-6">
              <ComicLayoutSelector 
                onLayoutSelect={handleLayoutSelect}
                selectedLayout={selectedLayout}
              />
            </TabsContent>

            <TabsContent value="generate" className="space-y-6">
              <Card className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Rocket className="h-5 w-5" />
                    <span>Comic Generation</span>
                  </CardTitle>
                  <CardDescription>
                    Generate your complete comic with AI-powered story and images
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Status Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className={cn(
                      "border-2 transition-all",
                      selectedStory ? "border-green-500 bg-green-50 dark:bg-green-950" : "border-muted-foreground/20"
                    )}>
                      <CardContent className="p-4 text-center">
                        <BookOpen className="h-8 w-8 mx-auto mb-2 text-green-600" />
                        <h3 className="font-medium">Story</h3>
                        <p className="text-sm text-muted-foreground">
                          {selectedStory ? "Ready" : "Not selected"}
                        </p>
                      </CardContent>
                    </Card>

                    <Card className={cn(
                      "border-2 transition-all",
                      selectedModel ? "border-green-500 bg-green-50 dark:bg-green-950" : "border-muted-foreground/20"
                    )}>
                      <CardContent className="p-4 text-center">
                        <Brain className="h-8 w-8 mx-auto mb-2 text-green-600" />
                        <h3 className="font-medium">AI Model</h3>
                        <p className="text-sm text-muted-foreground">
                          {selectedModel ? selectedModel.name : "Not selected"}
                        </p>
                      </CardContent>
                    </Card>

                    <Card className={cn(
                      "border-2 transition-all",
                      selectedLayout ? "border-green-500 bg-green-50 dark:bg-green-950" : "border-muted-foreground/20"
                    )}>
                      <CardContent className="p-4 text-center">
                        <Layout className="h-8 w-8 mx-auto mb-2 text-green-600" />
                        <h3 className="font-medium">Layout</h3>
                        <p className="text-sm text-muted-foreground">
                          {selectedLayout ? selectedLayout : "Not selected"}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Generation Progress */}
                  {isGenerating && (
                    <Card className="border-primary">
                      <CardContent className="p-6">
                        {generationStep === 'story' && <StoryGenerationLoading />}
                        {generationStep === 'cover' && (
                          <div className="text-center space-y-4">
                            <div className="mx-auto w-16 h-16 border-4 border-primary/20 rounded-full">
                              <div className="w-16 h-16 border-4 border-primary rounded-full animate-spin border-t-transparent" />
                            </div>
                            <h3 className="text-lg font-medium">Generating Cover</h3>
                            <p className="text-sm text-muted-foreground">Creating cover page with AI...</p>
                          </div>
                        )}
                        {generationStep === 'images' && <ImageGenerationLoading />}
                      </CardContent>
                    </Card>
                  )}

                  {/* Generate Button */}
                  <div className="flex justify-center">
                    <Button
                      onClick={handleStartGeneration}
                      disabled={isGenerating || !selectedStory || !selectedModel}
                      size="lg"
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium px-8 py-3"
                    >
                      {isGenerating ? (
                        <>
                          <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Zap className="h-4 w-4 mr-2" />
                          Generate Comic
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Quick Actions */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button variant="outline" className="flex items-center space-x-2">
                      <Download className="h-4 w-4" />
                      <span>Download Templates</span>
                    </Button>
                    <Button variant="outline" className="flex items-center space-x-2">
                      <Settings className="h-4 w-4" />
                      <span>Advanced Settings</span>
                    </Button>
                    <Button variant="outline" className="flex items-center space-x-2">
                      <BookOpen className="h-4 w-4" />
                      <span>View Tutorial</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="downloads" className="space-y-6">
              <ModelDownloadManager />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
