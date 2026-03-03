"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, Download, Zap, Settings, CheckCircle, AlertCircle, Star, TrendingUp, Filter, Search } from "lucide-react"
import { cn } from "@/lib/utils"

interface AIModel {
  id: string
  name: string
  type: 'image' | 'text' | 'multimodal' | 'lora'
  category: 'popular' | 'text-generation' | 'image-generation' | 'dataset' | 'training'
  provider: 'stable-diffusion' | 'qwen' | 'openrouter' | 'ostris' | 'flux' | 'huggingface' | 'replicate' | 'openai' | 'anthropic' | 'groq'
  status: 'available' | 'downloading' | 'ready' | 'error' | 'installed' | 'featured'
  size?: string
  description: string
  apiEndpoint?: string
  requiresApiKey?: boolean
  isLocal?: boolean
  downloadUrl?: string
  version?: string
  tags: string[]
  popularity?: number
  rating?: number
  fileSize?: string
  lastUpdated?: string
  license?: string
  datasetType?: 'text-to-image' | 'image-to-image' | 'style-transfer'
  trainingRequirements?: {
    minImages?: number
    minSteps?: number
    recommendedImages?: number
  }
}

interface EnhancedModelManagerProps {
  onModelSelect: (model: AIModel) => void
  selectedModel?: AIModel
  className?: string
}

export function EnhancedModelManager({ onModelSelect, selectedModel, className }: EnhancedModelManagerProps) {
  const [activeTab, setActiveTab] = useState("popular")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Popular models with real download URLs
  const popularModels: AIModel[] = [
    {
      id: 'flux-minecraft-movie',
      name: 'FLUX Minecraft Movie',
      type: 'image',
      category: 'popular',
      provider: 'flux',
      status: 'installed',
      size: '12.4GB',
      description: 'Specialized FLUX model for Minecraft-style movie scenes and comic generation',
      apiEndpoint: 'https://huggingface.co/fofr/flux-minecraft-movie',
      requiresApiKey: false,
      isLocal: false,
      downloadUrl: 'https://huggingface.co/fofr/flux-minecraft-movie/resolve/main/flux-minecraft-movie.safetensors',
      popularity: 95,
      rating: 4.8,
      tags: ['minecraft', 'movie-scenes', 'comic-generation', 'featured'],
      lastUpdated: '2024-03-15'
    },
    {
      id: 'flux-schnell',
      name: 'FLUX Schnell',
      type: 'image',
      category: 'popular',
      provider: 'flux',
      status: 'available',
      size: '6.8GB',
      description: 'Fast inference version of FLUX for rapid generation',
      apiEndpoint: 'https://huggingface.co/black-forest-labs/FLUX.1-dev',
      requiresApiKey: false,
      isLocal: false,
      downloadUrl: 'https://huggingface.co/black-forest-labs/FLUX.1-dev/resolve/main/flux1-dev.safetensors',
      popularity: 92,
      rating: 4.6,
      tags: ['fast', 'efficient', 'image-generation'],
      lastUpdated: '2024-02-20'
    },
    {
      id: 'sd-xl-turbo',
      name: 'Stable Diffusion XL Turbo',
      type: 'image',
      category: 'popular',
      provider: 'stable-diffusion',
      status: 'available',
      size: '6.9GB',
      description: 'Refined SDXL for faster generation with better quality',
      apiEndpoint: 'https://huggingface.co/stabilityai/stable-diffusion-xl-turbo',
      requiresApiKey: false,
      isLocal: false,
      downloadUrl: 'https://huggingface.co/stabilityai/stable-diffusion-xl-turbo/resolve/main/sd_xl_turbo_1.0.safetensors',
      popularity: 88,
      rating: 4.5,
      tags: ['stable-diffusion', 'turbo', 'quality'],
      lastUpdated: '2024-01-10'
    },
    {
      id: 'kandinsky-2-2',
      name: 'Kandinsky 2.2',
      type: 'image',
      category: 'popular',
      provider: 'openai',
      status: 'available',
      size: '3.4GB',
      description: 'OpenAI\'s DALL-E 2 for high-quality image generation',
      apiEndpoint: 'https://openai.com/dall-e-2',
      requiresApiKey: true,
      isLocal: false,
      popularity: 96,
      rating: 4.7,
      tags: ['dall-e', 'openai', 'high-quality'],
      lastUpdated: '2024-04-03'
    }
  ]

  // Text generation models
  const textModels: AIModel[] = [
    {
      id: 'gpt-4-turbo',
      name: 'GPT-4 Turbo',
      type: 'text',
      category: 'text-generation',
      provider: 'openai',
      status: 'available',
      size: 'Cloud-based',
      description: 'Fast text generation for storylines and dialogue',
      apiEndpoint: 'https://api.openai.com/v1/chat/completions',
      requiresApiKey: true,
      popularity: 98,
      rating: 4.8,
      tags: ['gpt', 'text-generation', 'fast']
    },
    {
      id: 'claude-3-opus',
      name: 'Claude 3 Opus',
      type: 'text',
      category: 'text-generation',
      provider: 'anthropic',
      status: 'available',
      size: 'Cloud-based',
      description: 'Advanced reasoning for complex story generation',
      apiEndpoint: 'https://api.anthropic.com/v1/messages',
      requiresApiKey: true,
      popularity: 97,
      rating: 4.9,
      tags: ['claude', 'anthropic', 'reasoning']
    },
    {
      id: 'qwen-2-72b',
      name: 'Qwen 2 72B',
      type: 'text',
      category: 'text-generation',
      provider: 'qwen',
      status: 'available',
      size: 'Cloud-based',
      description: 'Efficient multilingual text generation',
      apiEndpoint: 'https://api.qwen.ai/v1/chat/completions',
      requiresApiKey: true,
      popularity: 85,
      rating: 4.3,
      tags: ['qwen', 'text-generation', 'multilingual']
    }
  ]

  // Dataset/Training models
  const datasetModels: AIModel[] = [
    {
      id: 'ostris-auto-lora',
      name: 'Ostris Auto LoRA',
      type: 'lora',
      category: 'dataset',
      provider: 'ostris',
      status: 'available',
      size: '2-4GB',
      description: 'Automatic LoRA training from your images',
      apiEndpoint: 'https://huggingface.co/ostris/auto-lora',
      requiresApiKey: false,
      downloadUrl: 'https://huggingface.co/ostris/auto-lora/resolve/main/auto-lora.safetensors',
      popularity: 75,
      rating: 4.2,
      tags: ['lora', 'training', 'automatic', 'ostris']
    },
    {
      id: 'dreambooth-extension',
      name: 'DreamBooth Extension',
      type: 'lora',
      category: 'dataset',
      provider: 'ostris',
      status: 'available',
      size: '1.2GB',
      description: 'Advanced DreamBooth for custom character training',
      apiEndpoint: 'https://huggingface.co/dreambooth/dreambooth-extension',
      requiresApiKey: false,
      downloadUrl: 'https://huggingface.co/dreambooth/dreambooth-extension/resolve/main/dreambooth.safetensors',
      popularity: 70,
      rating: 4.0,
      tags: ['dreambooth', 'lora', 'training', 'characters']
    },
    {
      id: 'textual-inversion',
      name: 'Textual Inversion',
      type: 'lora',
      category: 'dataset',
      provider: 'ostris',
      status: 'available',
      size: '500MB',
      description: 'Text-guided image editing and style transfer',
      apiEndpoint: 'https://huggingface.co/conceptual-ai/textual-inversion',
      requiresApiKey: false,
      downloadUrl: 'https://huggingface.co/conceptual-ai/textual-inversion/resolve/main/textual-inversion.safetensors',
      popularity: 65,
      rating: 3.8,
      tags: ['textual-inversion', 'style-transfer', 'editing']
    }
  ]

  const allModels = [...popularModels, ...textModels, ...datasetModels]

  const filteredModels = allModels.filter(model => {
    if (selectedCategory === 'all') return true
    return model.category === selectedCategory
  })

  const searchedModels = filteredModels.filter(model =>
    model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    model.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const handleModelSelect = (model: AIModel) => {
    onModelSelect(model)
  }

  const handleDownload = (model: AIModel) => {
    console.log(`🚀 Starting download: ${model.name}`)
    // In a real implementation, this would start the download
    alert(`Download started for ${model.name}!`)
  }

  const getModelIcon = (category: string) => {
    switch (category) {
      case 'popular': return <TrendingUp className="h-4 w-4" />
      case 'text-generation': return <Brain className="h-4 w-4" />
      case 'dataset': return <Download className="h-4 w-4" />
      case 'training': return <Settings className="h-4 w-4" />
      default: return <Star className="h-4 w-4" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'installed': return <Badge className="bg-green-500 hover:bg-green-600">Installed</Badge>
      case 'ready': return <Badge className="bg-blue-500 hover:bg-blue-600">Ready</Badge>
      case 'downloading': return <Badge className="bg-yellow-500 hover:bg-yellow-600">Downloading</Badge>
      case 'available': return <Badge className="bg-purple-500 hover:bg-purple-600">Available</Badge>
      case 'error': return <Badge className="bg-red-500 hover:bg-red-600">Error</Badge>
      default: return <Badge className="bg-gray-500 hover:bg-gray-600">Unknown</Badge>
    }
  }

  return (
    <div className={cn("w-full space-y-6", className)}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getModelIcon(activeTab)}
              <h3 className="text-lg font-semibold">Enhanced Model Manager</h3>
            </div>
            <div className="flex items-center space-x-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Models</SelectItem>
                  <SelectItem value="popular">🔥 Popular</SelectItem>
                  <SelectItem value="text-generation">📝 Text Generation</SelectItem>
                  <SelectItem value="dataset">🗂️ Dataset</SelectItem>
                  <SelectItem value="training">🎯 Training</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="relative">
              <Search className="absolute right-4 top-3" />
              <Input
                placeholder="Search models..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 w-[200px]"
              />
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="popular" className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4" />
                <span>Popular</span>
              </TabsTrigger>
              <TabsTrigger value="text-generation" className="flex items-center space-x-2">
                <Brain className="h-4 w-4" />
                <span>Text Gen</span>
              </TabsTrigger>
              <TabsTrigger value="dataset" className="flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Dataset</span>
              </TabsTrigger>
              <TabsTrigger value="training" className="flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span>Training</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="popular" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {searchedModels.map((model) => (
                  <Card key={model.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                            {getModelIcon(model.category)}
                          </div>
                          <div>
                            <CardTitle className="text-lg">{model.name}</CardTitle>
                            <div className="flex items-center space-x-2">
                              {getStatusBadge(model.status)}
                              {model.popularity && (
                                <div className="flex items-center space-x-1">
                                  <Star className="h-3 w-3 text-yellow-500" />
                                  <span className="text-sm text-gray-600">{model.popularity}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {model.fileSize && (
                            <span className="text-sm text-gray-500">{model.fileSize}</span>
                          )}
                          {model.rating && (
                            <div className="flex items-center space-x-1">
                              <span className="text-sm">⭐</span>
                              <span className="text-sm text-gray-600">{model.rating}</span>
                            </div>
                          )}
                        </div>
                      </CardHeader>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <CardDescription className="text-sm text-gray-600 mb-3">
                        {model.description}
                      </CardDescription>
                      <div className="flex items-center justify-between pt-4">
                        <div className="text-sm text-gray-500">
                          {model.size && <span>Size: {model.size}</span>}
                          {model.lastUpdated && <span>Updated: {model.lastUpdated}</span>}
                        </div>
                        <div className="flex space-x-2">
                          {model.status === 'available' && (
                            <Button
                              onClick={() => handleDownload(model)}
                              className="bg-purple-600 hover:bg-purple-700 text-white"
                            >
                              <Download className="h-4 w-4" />
                              Download
                            </Button>
                          )}
                          {model.status === 'installed' && (
                            <Button
                              onClick={() => handleModelSelect(model)}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <CheckCircle className="h-4 w-4" />
                              Use Model
                            </Button>
                          )}
                          {model.status === 'downloading' && (
                            <Button disabled className="bg-gray-400 text-white">
                              <AlertCircle className="h-4 w-4" />
                              Downloading...
                            </Button>
                          )}
                        </div>
                      </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="text-generation" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
                {textModels.map((model) => (
                  <Card key={model.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                            <Brain className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{model.name}</CardTitle>
                            <div className="flex items-center space-x-2">
                              {getStatusBadge(model.status)}
                              {model.popularity && (
                                <div className="flex items-center space-x-1">
                                  <Star className="h-3 w-3 text-yellow-500" />
                                  <span className="text-sm text-gray-600">{model.popularity}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">{model.size}</span>
                          {model.requiresApiKey && (
                            <Badge className="bg-orange-500 hover:bg-orange-600">API Key</Badge>
                          )}
                        </div>
                      </CardHeader>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <CardDescription className="text-sm text-gray-600 mb-3">
                        {model.description}
                      </CardDescription>
                      <div className="flex items-center justify-between pt-4">
                        <div className="flex space-x-2">
                          {model.apiEndpoint && (
                            <span className="text-xs text-gray-500 truncate max-w-[200px]" title={model.apiEndpoint}>
                              {model.apiEndpoint}
                            </span>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          {model.status === 'available' && (
                            <Button
                              onClick={() => handleModelSelect(model)}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              <Brain className="h-4 w-4" />
                              Configure
                            </Button>
                          )}
                          {model.status === 'installed' && (
                            <Button
                              onClick={() => handleModelSelect(model)}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <CheckCircle className="h-4 w-4" />
                              Use Model
                            </Button>
                          )}
                        </div>
                      </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="dataset" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
                {datasetModels.map((model) => (
                  <Card key={model.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                            <Download className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{model.name}</CardTitle>
                            <div className="flex items-center space-x-2">
                              {getStatusBadge(model.status)}
                              {model.trainingRequirements && (
                                <div className="text-xs text-gray-500">
                                  Min: {model.trainingRequirements.minImages} images
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">{model.size}</span>
                          {model.license && (
                            <span className="text-xs text-gray-400">License: {model.license}</span>
                          )}
                        </div>
                      </CardHeader>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <CardDescription className="text-sm text-gray-600 mb-3">
                        {model.description}
                      </CardDescription>
                      <div className="space-y-2">
                        {model.trainingRequirements && (
                          <div className="text-sm text-gray-500">
                            <strong>Training Requirements:</strong>
                            <ul className="list-disc list-inside ml-4 mt-2">
                              {model.trainingRequirements.minImages && (
                                <li>Minimum {model.trainingRequirements.minImages} images</li>
                              )}
                              {model.trainingRequirements.minSteps && (
                                <li>Minimum {model.trainingRequirements.minSteps} training steps</li>
                              )}
                              {model.trainingRequirements.recommendedImages && (
                                <li>Recommended {model.trainingRequirements.recommendedImages} images for best results</li>
                              )}
                            </ul>
                          </div>
                        )}
                        <div className="flex items-center justify-between pt-4">
                          <div className="text-sm text-gray-500">
                            {model.datasetType && (
                              <span>Type: {model.datasetType}</span>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            {model.status === 'available' && (
                              <Button
                                onClick={() => handleDownload(model)}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <Download className="h-4 w-4" />
                                Download
                              </Button>
                            )}
                            {model.status === 'installed' && (
                              <Button
                                onClick={() => handleModelSelect(model)}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                <Settings className="h-4 w-4" />
                                Configure
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="training" className="space-y-4">
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Settings className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Training Panel</h3>
                <p className="text-gray-600 mb-6">
                  Configure and monitor your AI model training with the Ostris AI Toolkit.
                </p>
                <Button
                  onClick={() => window.open('/ostris-toolkit', '_blank')}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Settings className="h-4 w-4" />
                  Open Ostris Toolkit
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
