"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Image, FileText, Settings, Play, Download, Zap, AlertCircle, CheckCircle, Brain, Eye, Trash2, Plus, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

interface TrainingImage {
  id: string
  name: string
  url: string
  caption?: string
  tags?: string[]
  selected?: boolean
  quality: 'high' | 'medium' | 'low'
  size: number
  dimensions: { width: number; height: number }
}

interface LoraConfig {
  name: string
  triggerWord: string
  learningRate: number
  steps: number
  batchSize: number
  epochs: number
  resolution: number
  rank: number
  networkAlpha: number
  networkDim: number
  clipSkip: number
  noiseOffset: number
  validationImages: number
  validationSteps: number
  captionEvery: number
  saveEvery: number
  samplePrompts: string[]
}

interface LoraTrainingSystemProps {
  className?: string
}

export function LoraTrainingSystem({ className }: LoraTrainingSystemProps) {
  const [activeTab, setActiveTab] = useState("images")
  const [selectedImages, setSelectedImages] = useState<TrainingImage[]>([])
  const [trainingConfig, setTrainingConfig] = useState<LoraConfig>({
    name: "sweet-apocalypse-lora",
    triggerWord: "sweet apocalypse",
    learningRate: 1e-4,
    steps: 1000,
    batchSize: 1,
    epochs: 10,
    resolution: 512,
    rank: 128,
    networkAlpha: 16,
    networkDim: 1024,
    clipSkip: 2,
    noiseOffset: 0,
    validationImages: 5,
    validationSteps: 100,
    captionEvery: 100,
    saveEvery: 500,
    samplePrompts: [
      "sweet apocalypse character, minecraft style",
      "post-apocalyptic survivor with comic book aesthetic",
      "zombie apocalypse scene with dramatic lighting",
      "futuristic sweet apocalypse cityscape",
      "character in sweet apocalypse armor and weapons"
    ]
  })

  const [isTraining, setIsTraining] = useState(false)
  const [trainingProgress, setTrainingProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    Array.from(files).forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        if (result) {
          const newImage: TrainingImage = {
            id: Date.now().toString(),
            name: file.name,
            url: result,
            caption: file.name.replace(/\.[^/.]+$/, ""), // Remove extension for caption
            tags: ['uploaded'],
            selected: false,
            quality: 'medium',
            size: file.size,
            dimensions: { width: 512, height: 512 }
          }
          setSelectedImages(prev => [...prev, newImage])
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const handleImageSelect = (image: TrainingImage) => {
    setSelectedImages(prev => 
      prev.map(img => img.id === image.id ? { ...img, selected: !img.selected } : img)
    )
  }

  const handleRemoveImage = (imageId: string) => {
    setSelectedImages(prev => prev.filter(img => img.id !== imageId))
  }

  const startTraining = () => {
    if (selectedImages.length < 10) {
      alert("Need at least 10 images for training. Please upload more images.")
      return
    }

    setIsTraining(true)
    setTrainingProgress(0)

    // Simulate training process
    const trainingSteps = [
      { message: "Preparing dataset...", duration: 2000 },
      { message: "Extracting features...", duration: 3000 },
      { message: "Training LoRA model...", duration: 10000 },
      { message: "Validating model...", duration: 2000 },
      { message: "Saving trained model...", duration: 1500 }
    ]

    let currentStep = 0
    const runTrainingStep = async () => {
      const step = trainingSteps[currentStep]
      setTrainingProgress((currentStep + 1) / trainingSteps.length * 100)
      
      await new Promise(resolve => setTimeout(resolve, step.duration))
      
      currentStep++
      if (currentStep < trainingSteps.length) {
        runTrainingStep()
      } else {
        setIsTraining(false)
        setTrainingProgress(100)
        alert(`🎯 Training completed! LoRA model "${trainingConfig.name}" is ready for use.`)
      }
    }

    runTrainingStep()
  }

  const generateCaption = (image: TrainingImage): string => {
    const baseCaption = image.caption || image.name.replace(/\.[^/.]+$/, "")
    return `${baseCaption} - ${image.quality} quality, ${image.dimensions.width}x${image.dimensions.height}px`
  }

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'high': return 'text-green-600'
      case 'medium': return 'text-yellow-600'
      case 'low': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className={cn("w-full space-y-6", className)}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5" />
            <h3 className="text-lg font-semibold">LORA Training System</h3>
            <Badge className="bg-purple-500 hover:bg-purple-600">Sweet Apocalypse</Badge>
          </CardTitle>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="images" className="flex items-center space-x-2">
                <Image className="h-4 w-4" />
                <span>Images ({selectedImages.length})</span>
              </TabsTrigger>
              <TabsTrigger value="config" className="flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span>Configuration</span>
              </TabsTrigger>
              <TabsTrigger value="training" className="flex items-center space-x-2">
                <Play className="h-4 w-4" />
                <span>Training</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="images" className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-6">
                <Upload
                  className="w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:border-purple-500 transition-colors"
                  onDrop={(e) => {
                    e.preventDefault()
                    const files = e.dataTransfer.files
                    handleImageUpload({ target: { files } as any })
                  }}
                >
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <Upload className="h-8 w-8" />
                    <p className="mt-2 text-sm">Drag & drop images here</p>
                    <p className="text-xs">or</p>
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-2"
                    >
                      <Plus className="h-4 w-4" />
                      Browse Files
                    </Button>
                  </div>
                </Upload>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {selectedImages.map((image) => (
                  <Card key={image.id} className={cn(
                    "hover:shadow-lg transition-shadow cursor-pointer",
                    image.selected && "ring-2 ring-purple-500"
                  )} onClick={() => handleImageSelect(image)}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={image.selected}
                            onChange={() => handleImageSelect(image)}
                            className="h-4 w-4"
                          />
                          <div className="flex-1">
                            <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                              <img
                                src={image.url}
                                alt={image.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">{image.name}</div>
                              <div className="text-sm text-gray-500">
                                {generateCaption(image)}
                              </div>
                              <div className="flex items-center space-x-2 mt-2">
                                <span className={cn("text-xs px-2 py-1 rounded", getQualityColor(image.quality))}>
                                  {image.quality.toUpperCase()}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {image.dimensions.width}x{image.dimensions.height}px
                                </span>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRemoveImage(image.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const caption = prompt(`Generate a descriptive caption for this image: ${image.name}`)
                                  const newCaption = prompt(`Current caption: ${generateCaption(image)}\n\nNew caption suggestion: ${caption}\n\nAccept the suggestion?`)
                                  if (confirm(newCaption)) {
                                    setSelectedImages(prev => prev.map(img => 
                                      img.id === image.id ? { ...img, caption } : img
                                    ))
                                  }
                                }}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <FileText className="h-3 w-3" />
                                Caption
                              </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                ))}
              </div>

              {selectedImages.length > 0 && (
                <div className="flex justify-center mt-6">
                  <Button
                    onClick={startTraining}
                    disabled={isTraining}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-8"
                  >
                    {isTraining ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 mr-2 border-2 border-transparent border-t-purple-600"></div>
                        Training... {Math.round(trainingProgress)}%
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4" />
                        Start Training ({selectedImages.length} images)
                      </>
                    )}
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="config" className="space-y-6">
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold mb-4">LoRA Configuration</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Model Name</label>
                      <input
                        type="text"
                        value={trainingConfig.name}
                        onChange={(e) => setTrainingConfig(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Trigger Word</label>
                      <input
                        type="text"
                        value={trainingConfig.triggerWord}
                        onChange={(e) => setTrainingConfig(prev => ({ ...prev, triggerWord: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Learning Rate</label>
                      <input
                        type="number"
                        value={trainingConfig.learningRate}
                        onChange={(e) => setTrainingConfig(prev => ({ ...prev, learningRate: parseFloat(e.target.value) }))}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                        step="1e-6"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Training Steps</label>
                      <input
                        type="number"
                        value={trainingConfig.steps}
                        onChange={(e) => setTrainingConfig(prev => ({ ...prev, steps: parseInt(e.target.value) }))}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Epochs</label>
                      <input
                        type="number"
                        value={trainingConfig.epochs}
                        onChange={(e) => setTrainingConfig(prev => ({ ...prev, epochs: parseInt(e.target.value) }))}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Batch Size</label>
                      <input
                        type="number"
                        value={trainingConfig.batchSize}
                        onChange={(e) => setTrainingConfig(prev => ({ ...prev, batchSize: parseInt(e.target.value) }))}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-4">Sample Prompts</h4>
                  <div className="space-y-2">
                    {trainingConfig.samplePrompts.map((prompt, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600 flex-1">{index + 1}.</span>
                        <input
                          type="text"
                          value={prompt}
                          onChange={(e) => {
                            const newPrompts = [...trainingConfig.samplePrompts]
                            newPrompts[index] = e.target.value
                            setTrainingConfig(prev => ({ ...prev, samplePrompts: newPrompts }))
                          }}
                          className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newPrompts = trainingConfig.samplePrompts.filter((_, i) => i !== index)
                            setTrainingConfig(prev => ({ ...prev, samplePrompts: newPrompts }))
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      onClick={() => {
                        const newPrompt = prompt(`Add a new sample prompt for training:`)
                        if (newPrompt) {
                          setTrainingConfig(prev => ({ ...prev, samplePrompts: [...prev.samplePrompts, newPrompt] }))
                        }
                      }}
                      className="mt-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Prompt
                    </Button>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-4">Advanced Settings</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Resolution</label>
                      <select
                        value={trainingConfig.resolution}
                        onChange={(e) => setTrainingConfig(prev => ({ ...prev, resolution: parseInt(e.target.value) }))}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                      >
                        <option value={256}>256x256</option>
                        <option value={512}>512x512</option>
                        <option value={768}>768x768</option>
                        <option value={1024}>1024x1024</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Network Alpha</label>
                      <input
                        type="number"
                        value={trainingConfig.networkAlpha}
                        onChange={(e) => setTrainingConfig(prev => ({ ...prev, networkAlpha: parseFloat(e.target.value) }))}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                        step="0.1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="training" className="space-y-6">
              {isTraining ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Brain className="h-8 w-8 text-white animate-pulse" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">Training in Progress...</h3>
                  <div className="w-full max-w-md mx-auto">
                    <Progress value={trainingProgress} className="mb-4" />
                    <div className="text-center text-sm text-gray-600 mb-2">
                      Step {Math.floor(trainingProgress)}: {trainingSteps[Math.floor(trainingProgress * trainingSteps.length)]?.message || "Processing..."}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <h3 className="text-xl font-semibold mb-4">Ready to Train</h3>
                  <p className="text-gray-600 mb-6">
                    Configure your training settings and upload at least 10 images to start training your custom LoRA model.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Quick Start</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                              <h4 className="font-semibold">Images Selected</h4>
                              <p className="text-2xl font-bold text-purple-600">{selectedImages.length}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Recommended: 10-20 images</p>
                              <p className="text-xs text-gray-500">Current: {selectedImages.length < 10 ? 'Need more images' : 'Ready'}</p>
                            </div>
                          </div>
                        </div>
                        <Button
                          onClick={startTraining}
                          disabled={selectedImages.length < 10}
                          className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                        >
                          <Zap className="h-4 w-4" />
                          Start Training
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                      <CardHeader>
                        <CardTitle>Export Dataset</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Button
                          onClick={() => {
                            const dataset = selectedImages.map(img => ({
                              name: img.name,
                              url: img.url,
                              caption: img.caption,
                              tags: img.tags
                            }))
                            const blob = new Blob([JSON.stringify(dataset, null, 2)], { type: 'application/json' })
                            const url = URL.createObjectURL(blob)
                            const a = document.createElement('a')
                            a.href = url
                            a.download = 'sweet-apocalypse-dataset.json'
                            a.click()
                          }}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Download className="h-4 w-4" />
                          Export Dataset
                        </Button>
                      </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
    </div>
  )
}
