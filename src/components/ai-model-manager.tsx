"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, Cpu, Zap, Settings, Download, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface AIModel {
  id: string
  name: string
  type: 'image' | 'text' | 'multimodal'
  provider: 'stable-diffusion' | 'qwen' | 'openrouter' | 'ostris' | 'flux'
  status: 'available' | 'downloading' | 'ready' | 'error'
  size?: string
  description: string
  apiEndpoint?: string
  requiresApiKey?: boolean
  isLocal?: boolean
}

interface AIModelManagerProps {
  onModelSelect: (model: AIModel) => void
  selectedModel?: AIModel
  className?: string
}

export function AIModelManager({ onModelSelect, selectedModel, className }: AIModelManagerProps) {
  const [activeTab, setActiveTab] = useState("available")
  const [downloadingModels, setDownloadingModels] = useState<Set<string>>(new Set())
  
  const [availableModels]: AIModel[] = [
    {
      id: 'flux-minecraft-movie',
      name: 'FLUX Minecraft Movie',
      type: 'image',
      provider: 'flux',
      status: 'ready',
      size: '12GB',
      description: 'Specialized FLUX model for Minecraft-style movie scenes and comic generation',
      apiEndpoint: 'https://huggingface.co/fofr/flux-minecraft-movie',
      requiresApiKey: false,
      isLocal: false
    },
    {
      id: 'flux-dev',
      name: 'FLUX Dev',
      type: 'image',
      provider: 'flux',
      status: 'available',
      size: '12GB',
      description: 'State-of-the-art image generation model',
      isLocal: true
    },
    {
      id: 'qwen-image',
      name: 'Qwen Image',
      type: 'multimodal',
      provider: 'qwen',
      status: 'available',
      size: '8GB',
      description: 'Multimodal model with image understanding',
      isLocal: true
    },
    {
      id: 'stable-diffusion-xl',
      name: 'Stable Diffusion XL',
      type: 'image',
      provider: 'stable-diffusion',
      status: 'available',
      size: '6GB',
      description: 'High-quality image generation',
      isLocal: true
    },
    {
      id: 'ostris-toolkit',
      name: 'Ostris AI Toolkit',
      type: 'multimodal',
      provider: 'ostris',
      status: 'available',
      description: 'Comprehensive AI toolkit for training and generation',
      apiEndpoint: 'https://api.ostris.ai',
      requiresApiKey: true
    },
    {
      id: 'openrouter-gpt4',
      name: 'GPT-4 (OpenRouter)',
      type: 'text',
      provider: 'openrouter',
      status: 'available',
      description: 'Advanced text generation via OpenRouter',
      apiEndpoint: 'https://openrouter.ai/api/v1',
      requiresApiKey: true
    }
  ]

  const handleDownload = async (modelId: string) => {
    setDownloadingModels(prev => new Set(prev).add(modelId))
    
    // Simulate download process
    setTimeout(() => {
      setDownloadingModels(prev => {
        const newSet = new Set(prev)
        newSet.delete(modelId)
        return newSet
      })
    }, 3000)
  }

  const handleModelSelect = (model: AIModel) => {
    onModelSelect(model)
  }

  const getModelIcon = (provider: AIModel['provider']) => {
    switch (provider) {
      case 'flux':
        return <Zap className="h-4 w-4" />
      case 'qwen':
        return <Brain className="h-4 w-4" />
      case 'stable-diffusion':
        return <Cpu className="h-4 w-4" />
      case 'ostris':
        return <Settings className="h-4 w-4" />
      case 'openrouter':
        return <Brain className="h-4 w-4" />
      default:
        return <Cpu className="h-4 w-4" />
    }
  }

  const getStatusBadge = (status: AIModel['status']) => {
    switch (status) {
      case 'available':
        return <Badge variant="secondary">Available</Badge>
      case 'downloading':
        return <Badge variant="outline">Downloading...</Badge>
      case 'ready':
        return <Badge variant="default">Ready</Badge>
      case 'error':
        return <Badge variant="destructive">Error</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  return (
    <div className={cn("space-y-6", className)}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5" />
            <span>AI Model Manager</span>
          </CardTitle>
          <CardDescription>
            Manage and configure AI models for image and text generation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="available">Available Models</TabsTrigger>
              <TabsTrigger value="download">Downloads</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="available" className="space-y-4">
              <div className="space-y-3">
                {availableModels.map((model) => (
                  <Card
                    key={model.id}
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-md",
                      selectedModel?.id === model.id && "ring-2 ring-primary"
                    )}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-2">
                            {getModelIcon(model.provider)}
                            <h4 className="font-medium">{model.name}</h4>
                            {getStatusBadge(model.status)}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {model.description}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <span className="capitalize">{model.type}</span>
                            {model.size && <span>•</span>}
                            {model.size && <span>{model.size}</span>
                            {model.isLocal && <span>•</span>}
                            {model.isLocal && <span>Local</span>}
                            {model.requiresApiKey && <span>•</span>}
                            {model.requiresApiKey && <span>API Key Required</span>}
                          </div>
                        </div>
                        <div className="flex flex-col space-y-2">
                          {model.isLocal && model.status === 'available' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownload(model.id)}
                              disabled={downloadingModels.has(model.id)}
                              className="flex items-center space-x-1"
                            >
                              {downloadingModels.has(model.id) ? (
                                <>
                                  <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                                  <span>Downloading</span>
                                </>
                              ) : (
                                <>
                                  <Download className="h-4 w-4" />
                                  <span>Download</span>
                                </>
                              )}
                            </Button>
                          )}
                          <Button
                            variant={selectedModel?.id === model.id ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleModelSelect(model)}
                          >
                            {selectedModel?.id === model.id ? (
                              <>
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Selected
                              </>
                            ) : (
                              "Select"
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="download" className="space-y-4">
              <div className="space-y-4">
                <div className="text-center py-8">
                  <Download className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">Model Downloads</h3>
                  <p className="text-muted-foreground">
                    Download and manage local AI models for offline generation
                  </p>
                </div>
                
                {downloadingModels.size > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Currently Downloading</h4>
                    {Array.from(downloadingModels).map(modelId => {
                      const model = availableModels.find(m => m.id === modelId)
                      return model ? (
                        <Card key={modelId}>
                          <CardContent className="p-3">
                            <div className="flex items-center space-x-3">
                              <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                              <div className="flex-1">
                                <p className="text-sm font-medium">{model.name}</p>
                                <p className="text-xs text-muted-foreground">Downloading...</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ) : null
                    })}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <div className="space-y-6">
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">API Configuration</h4>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="openrouter-key">OpenRouter API Key</Label>
                      <Input
                        id="openrouter-key"
                        type="password"
                        placeholder="Enter your OpenRouter API key"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ostris-key">Ostris API Key</Label>
                      <Input
                        id="ostris-key"
                        type="password"
                        placeholder="Enter your Ostris API key"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Generation Settings</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="auto-download">Auto-download models</Label>
                      <Switch id="auto-download" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="prefer-local">Prefer local models</Label>
                      <Switch id="prefer-local" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="fast-generation">Fast generation mode</Label>
                      <Switch id="fast-generation" />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
