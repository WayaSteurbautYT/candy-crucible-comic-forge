"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Download, 
  Play, 
  Pause, 
  Check, 
  X, 
  HardDrive, 
  Zap, 
  Image as ImageIcon,
  Cpu,
  Package,
  RefreshCw,
  Settings
} from "lucide-react"
import { cn } from "@/lib/utils"

interface BaseModel {
  id: string
  name: string
  description: string
  size: string // in GB
  type: 'stable-diffusion' | 'flux' | 'qwen' | 'custom'
  version: string
  downloadUrl?: string
  status: 'available' | 'downloading' | 'installed' | 'error'
  progress?: number
  installedPath?: string
  requirements: {
    minRam: string
    minVram: string
    recommended: string
  }
  tags: string[]
}

interface ModelDownloadManagerProps {
  className?: string
}

export function ModelDownloadManager({ className }: ModelDownloadManagerProps) {
  const [models, setModels] = useState<BaseModel[]>([
    {
      id: 'flux-minecraft-movie',
      name: 'Flux Minecraft Movie',
      description: 'Specialized FLUX model for Minecraft-style movie scenes and comic generation - Perfect for testing!',
      size: '12.4',
      type: 'flux',
      version: '1.0-minecraft',
      status: 'installed',
      requirements: {
        minRam: '16GB',
        minVram: '8GB',
        recommended: '24GB RAM, 12GB VRAM'
      },
      tags: ['minecraft', 'movie-scenes', 'comic-generation', 'testing-ready'],
      downloadUrl: 'https://huggingface.co/fofr/flux-minecraft-movie'
    },
    {
      id: 'flux-dev',
      name: 'Flux Dev',
      description: 'State-of-the-art image generation model with superior quality',
      size: '12.4',
      type: 'flux',
      version: '1.0-dev',
      status: 'available',
      requirements: {
        minRam: '16GB',
        minVram: '8GB',
        recommended: '24GB RAM, 12GB VRAM'
      },
      tags: ['image-generation', 'high-quality', 'latest']
    },
    {
      id: 'flux-schnell',
      name: 'Flux Schnell',
      description: 'Fast inference version of Flux for rapid generation',
      size: '6.8',
      type: 'flux',
      version: '1.0-schnell',
      status: 'available',
      requirements: {
        minRam: '12GB',
        minVram: '6GB',
        recommended: '16GB RAM, 8GB VRAM'
      },
      tags: ['image-generation', 'fast', 'efficient']
    },
    {
      id: 'gwen-image',
      name: 'Gwen Image',
      description: 'Specialized model for comic and illustration style',
      size: '4.2',
      type: 'stable-diffusion',
      version: '2.1',
      status: 'installed',
      installedPath: '/models/gwen-image-v2.1.safetensors',
      requirements: {
        minRam: '8GB',
        minVram: '4GB',
        recommended: '12GB RAM, 6GB VRAM'
      },
      tags: ['comic', 'illustration', 'art-style']
    },
    {
      id: 'qwen-image-vl',
      name: 'Qwen Image VL',
      description: 'Vision-language model for text-to-image generation',
      size: '8.7',
      type: 'qwen',
      version: '1.0',
      status: 'available',
      requirements: {
        minRam: '16GB',
        minVram: '8GB',
        recommended: '32GB RAM, 16GB VRAM'
      },
      tags: ['vision-language', 'multimodal', 'text-to-image']
    },
    {
      id: 'sweet-apocalypse-base',
      name: 'Sweet Apocalypse Base',
      description: 'Pre-trained model optimized for comic generation',
      size: '3.8',
      type: 'stable-diffusion',
      version: '1.0',
      status: 'downloading',
      progress: 65,
      requirements: {
        minRam: '8GB',
        minVram: '4GB',
        recommended: '16GB RAM, 8GB VRAM'
      },
      tags: ['comic', 'pre-trained', 'optimized']
    },
    {
      id: 'realistic-vision',
      name: 'Realistic Vision',
      description: 'Photorealistic image generation model',
      size: '5.3',
      type: 'stable-diffusion',
      version: '6.0',
      status: 'error',
      requirements: {
        minRam: '12GB',
        minVram: '6GB',
        recommended: '24GB RAM, 12GB VRAM'
      },
      tags: ['photorealistic', 'realistic', 'portrait']
    }
  ])

  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const handleDownload = async (modelId: string) => {
    setModels(prev => prev.map(model => 
      model.id === modelId 
        ? { ...model, status: 'downloading' as const, progress: 0 }
        : model
    ))

    // Simulate download progress
    const interval = setInterval(() => {
      setModels(prev => prev.map(model => {
        if (model.id === modelId && model.status === 'downloading') {
          const newProgress = (model.progress || 0) + Math.random() * 15
          if (newProgress >= 100) {
            clearInterval(interval)
            return {
              ...model,
              status: 'installed' as const,
              progress: 100,
              installedPath: `/models/${model.name.toLowerCase().replace(/\s+/g, '-')}-${model.version}.safetensors`
            }
          }
          return { ...model, progress: Math.min(newProgress, 99) }
        }
        return model
      }))
    }, 500)
  }

  const handlePauseDownload = (modelId: string) => {
    setModels(prev => prev.map(model => 
      model.id === modelId 
        ? { ...model, status: 'available' as const, progress: 0 }
        : model
    ))
  }

  const handleRetryDownload = (modelId: string) => {
    setModels(prev => prev.map(model => 
      model.id === modelId 
        ? { ...model, status: 'available' as const, progress: 0 }
        : model
    ))
  }

  const handleDeleteModel = (modelId: string) => {
    setModels(prev => prev.map(model => 
      model.id === modelId 
        ? { ...model, status: 'available' as const, progress: 0, installedPath: undefined }
        : model
    ))
  }

  const filteredModels = selectedCategory === 'all' 
    ? models 
    : models.filter(model => model.type === selectedCategory)

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'flux':
        return <Zap className="h-4 w-4" />
      case 'qwen':
        return <Cpu className="h-4 w-4" />
      case 'stable-diffusion':
        return <ImageIcon className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  const getStatusBadge = (status: string, progress?: number) => {
    switch (status) {
      case 'installed':
        return <Badge className="bg-green-500 hover:bg-green-600"><Check className="h-3 w-3 mr-1" />Installed</Badge>
      case 'downloading':
        return <Badge className="bg-blue-500 hover:bg-blue-600"><RefreshCw className="h-3 w-3 mr-1 animate-spin" />Downloading {progress?.toFixed(0)}%</Badge>
      case 'error':
        return <Badge variant="destructive"><X className="h-3 w-3 mr-1" />Error</Badge>
      default:
        return <Badge variant="secondary">Available</Badge>
    }
  }

  const totalDownloaded = models.filter(m => m.status === 'installed').length
  const totalSize = models.filter(m => m.status === 'installed').reduce((acc, m) => acc + parseFloat(m.size), 0)

  return (
    <div className={cn("space-y-6", className)}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <HardDrive className="h-5 w-5" />
            <span>Base Model Downloads</span>
          </CardTitle>
          <CardDescription>
            Download and manage base AI models for immediate use without training
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Package className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">{models.length}</p>
                    <p className="text-sm text-muted-foreground">Total Models</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Check className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">{totalDownloaded}</p>
                    <p className="text-sm text-muted-foreground">Installed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <HardDrive className="h-8 w-8 text-purple-500" />
                  <div>
                    <p className="text-2xl font-bold">{totalSize.toFixed(1)}GB</p>
                    <p className="text-sm text-muted-foreground">Storage Used</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Download className="h-8 w-8 text-orange-500" />
                  <div>
                    <p className="text-2xl font-bold">{models.filter(m => m.status === 'downloading').length}</p>
                    <p className="text-sm text-muted-foreground">Downloading</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
            >
              All Models
            </Button>
            <Button
              variant={selectedCategory === 'flux' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('flux')}
            >
              <Zap className="h-4 w-4 mr-1" />
              Flux
            </Button>
            <Button
              variant={selectedCategory === 'stable-diffusion' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('stable-diffusion')}
            >
              <ImageIcon className="h-4 w-4 mr-1" />
              Stable Diffusion
            </Button>
            <Button
              variant={selectedCategory === 'qwen' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('qwen')}
            >
              <Cpu className="h-4 w-4 mr-1" />
              Qwen
            </Button>
          </div>

          {/* Model List */}
          <div className="space-y-4">
            {filteredModels.map((model) => (
              <Card key={model.id} className={cn(
                "transition-all hover:shadow-md",
                model.status === 'downloading' && "border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20"
              )}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {getTypeIcon(model.type)}
                        <h3 className="text-lg font-semibold">{model.name}</h3>
                        {getStatusBadge(model.status, model.progress)}
                      </div>
                      <p className="text-muted-foreground mb-3">{model.description}</p>
                      
                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {model.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      {/* Requirements */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Size:</span> {model.size}GB
                        </div>
                        <div>
                          <span className="font-medium">Min RAM:</span> {model.requirements.minRam}
                        </div>
                        <div>
                          <span className="font-medium">Min VRAM:</span> {model.requirements.minVram}
                        </div>
                      </div>

                      {/* Installed Path */}
                      {model.installedPath && (
                        <div className="mt-2 text-sm text-green-600">
                          <span className="font-medium">Installed:</span> {model.installedPath}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col space-y-2 ml-4">
                      {model.status === 'available' && (
                        <Button onClick={() => handleDownload(model.id)} size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      )}
                      {model.status === 'downloading' && (
                        <>
                          <Button onClick={() => handlePauseDownload(model.id)} variant="outline" size="sm">
                            <Pause className="h-4 w-4 mr-2" />
                            Pause
                          </Button>
                          <div className="text-xs text-muted-foreground">
                            {model.size}GB total
                          </div>
                        </>
                      )}
                      {model.status === 'installed' && (
                        <>
                          <Button variant="outline" size="sm">
                            <Play className="h-4 w-4 mr-2" />
                            Use Model
                          </Button>
                          <Button 
                            onClick={() => handleDeleteModel(model.id)} 
                            variant="destructive" 
                            size="sm"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Remove
                          </Button>
                        </>
                      )}
                      {model.status === 'error' && (
                        <>
                          <Button onClick={() => handleRetryDownload(model.id)} variant="outline" size="sm">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Retry
                          </Button>
                          <div className="text-xs text-red-600">
                            Download failed
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {model.status === 'downloading' && model.progress && (
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Download Progress</span>
                        <span>{model.progress.toFixed(1)}%</span>
                      </div>
                      <Progress value={model.progress} className="w-full" />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Settings */}
          <div className="mt-8 p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Download Settings</h4>
                <p className="text-sm text-muted-foreground">
                  Configure download location and parallel downloads
                </p>
              </div>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
