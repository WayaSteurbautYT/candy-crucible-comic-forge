'use client'

import React, { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, Play, Pause, Square, Download, Settings, BookOpen, Image, Layers } from 'lucide-react'

import { SweetApocalypsePipeline } from '@/lib/enhanced/sweet-apocalypse-pipeline'
import { SweetApocalypseConfig } from '@/types/enhanced-types'

const DEFAULT_CONFIG: SweetApocalypseConfig = {
  世界观: {
    setting: 'bruges-infected',
    tone: 'dark-sweet',
    mutationRules: [
      'candy-like crystallization',
      'pastel color corruption',
      'emotional manifestation',
      'childhood innocence twisted'
    ]
  },
  styleLock: {
    basePrompt: 'sweetapoc_style, dark tragic sweetness, candy apocalypse realism',
    negativePrompt: 'anime, oversaturated, childish, low detail, 3D render, photorealistic',
    requiredTags: ['mutation', 'bruges', 'apocalypse', 'sweet'],
    forbiddenTags: ['happy', 'normal', 'clean', 'bright']
  },
  characterConsistency: {
    mainCharacters: [
      {
        name: 'Lucas',
        description: 'Teenage boy, immune to mutations',
        appearance: 'Dark hair, haunted eyes, tattered clothes',
        personality: 'Protective, determined, fearful',
        role: 'protagonist'
      },
      {
        name: 'Clara',
        description: 'Young girl, partially transformed',
        appearance: 'Crystalline skin, candy-colored tears',
        personality: 'Innocent, tragic, wise beyond years',
        role: 'supporting'
      }
    ],
    seedMapping: {
      'Lucas': 12345,
      'Clara': 67890
    }
  }
}

export default function SweetApocalypseGenerator() {
  const [pipeline] = useState(() => new SweetApocalypsePipeline(DEFAULT_CONFIG))
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentStatus, setCurrentStatus] = useState('')
  const [generatedPages, setGeneratedPages] = useState<any[]>([])
  const [errors, setErrors] = useState<string[]>([])
  
  // Form states
  const [sourceDocument, setSourceDocument] = useState<File | null>(null)
  const [customPrompt, setCustomPrompt] = useState('')
  const [numPages, setNumPages] = useState(4)
  const [selectedModel, setSelectedModel] = useState('qwen2.5:7b')
  const [selectedLoRA, setSelectedLoRA] = useState('sweetapoc-v1')
  
  // Pipeline status
  const [pipelineStatus, setPipelineStatus] = useState<any>(null)

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSourceDocument(file)
    }
  }, [])

  const startGeneration = useCallback(async () => {
    if (!pipeline) return
    
    setIsGenerating(true)
    setProgress(0)
    setCurrentStatus('Initializing pipeline...')
    setErrors([])
    
    try {
      setCurrentStatus('Generating Sweet Apocalypse issue...')
      
      const result = await pipeline.generateIssue(
        sourceDocument || undefined,
        customPrompt || undefined,
        numPages
      )
      
      if (result.success) {
        setGeneratedPages(result.pages)
        setCurrentStatus('Generation completed successfully!')
        setProgress(100)
      } else {
        setErrors(result.errors)
        setCurrentStatus('Generation completed with errors')
      }
      
    } catch (error) {
      setErrors([`Generation failed: ${(error as Error).message}`])
      setCurrentStatus('Generation failed')
    } finally {
      setIsGenerating(false)
    }
  }, [pipeline, sourceDocument, customPrompt, numPages])

  const pauseGeneration = useCallback(() => {
    // Implement pause functionality
    setCurrentStatus('Generation paused')
  }, [])

  const exportComic = useCallback(() => {
    // Implement export functionality
    const exportData = {
      pages: generatedPages,
      config: DEFAULT_CONFIG,
      exportedAt: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    })
    
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sweet-apocalypse-issue-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [generatedPages])

  const updatePipelineStatus = useCallback(async () => {
    if (!pipeline) return
    
    try {
      const status = pipeline.getPipelineStatus()
      setPipelineStatus(status)
    } catch (error) {
      console.error('Failed to get pipeline status:', error)
    }
  }, [pipeline])

  React.useEffect(() => {
    updatePipelineStatus()
    const interval = setInterval(updatePipelineStatus, 5000)
    return () => clearInterval(interval)
  }, [updatePipelineStatus])

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 text-red-900">Sweet Apocalypse Issue Generator</h1>
        <p className="text-gray-600">Hands-off comic generation with RAG context and batch processing</p>
      </div>

      <Tabs defaultValue="generate" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="generate" className="flex items-center gap-2">
            <Play className="w-4 h-4" />
            Generate
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="models" className="flex items-center gap-2">
            <Image className="w-4 h-4" />
            Models & LoRAs
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="w-5 h-5" />
                  Story Configuration
                </CardTitle>
                <CardDescription>
                  Configure your Sweet Apocalypse issue generation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="document-upload">Source Document (Optional)</Label>
                  <Input
                    id="document-upload"
                    type="file"
                    accept=".pdf,.md,.docx,.txt"
                    onChange={handleFileUpload}
                    className="mt-1"
                  />
                  {sourceDocument && (
                    <p className="text-sm text-gray-600 mt-1">
                      Selected: {sourceDocument.name}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="custom-prompt">Custom Prompt (Optional)</Label>
                  <Textarea
                    id="custom-prompt"
                    placeholder="Enter your custom story prompt or leave empty for default Sweet Apocalypse story..."
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="num-pages">Number of Pages</Label>
                  <Select value={numPages.toString()} onValueChange={(v) => setNumPages(parseInt(v))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 Pages</SelectItem>
                      <SelectItem value="4">4 Pages</SelectItem>
                      <SelectItem value="6">6 Pages</SelectItem>
                      <SelectItem value="8">8 Pages</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="text-model">Text Model</Label>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="qwen2.5:7b">Qwen 2.5 7B</SelectItem>
                      <SelectItem value="llama3.1:8b">Llama 3.1 8B</SelectItem>
                      <SelectItem value="mixtral:8x7b">Mixtral 8x7B</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="lora">Style LoRA</Label>
                  <Select value={selectedLoRA} onValueChange={setSelectedLoRA}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sweetapoc-v1">Sweet Apocalypse v1</SelectItem>
                      <SelectItem value="sweetapoc-v2">Sweet Apocalypse v2</SelectItem>
                      <SelectItem value="user-trained">User Trained Style</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button 
                    onClick={startGeneration} 
                    disabled={isGenerating}
                    className="flex-1"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    {isGenerating ? 'Generating...' : 'Generate Issue'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={pauseGeneration}
                    disabled={!isGenerating}
                  >
                    <Pause className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={exportComic}
                    disabled={generatedPages.length === 0}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Status and Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Generation Status</CardTitle>
                <CardDescription>
                  Real-time progress and pipeline information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isGenerating && (
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Progress</span>
                      <span className="text-sm text-gray-600">{progress}%</span>
                    </div>
                    <Progress value={progress} className="w-full" />
                    <p className="text-sm text-gray-600 mt-2">{currentStatus}</p>
                  </div>
                )}

                {pipelineStatus && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Pipeline Status</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex justify-between">
                        <span>RAG Documents:</span>
                        <Badge variant="secondary">{pipelineStatus.ragDocuments}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Ollama:</span>
                        <Badge variant={pipelineStatus.ollamaConnected ? "default" : "destructive"}>
                          {pipelineStatus.ollamaConnected ? "Connected" : "Disconnected"}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>ComfyUI:</span>
                        <Badge variant={pipelineStatus.comfyUIConnected ? "default" : "destructive"}>
                          {pipelineStatus.comfyUIConnected ? "Connected" : "Disconnected"}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Active Trainings:</span>
                        <Badge variant="secondary">{pipelineStatus.activeTrainings}</Badge>
                      </div>
                    </div>
                  </div>
                )}

                {errors.length > 0 && (
                  <Alert>
                    <AlertDescription>
                      <div className="space-y-1">
                        <p className="font-medium">Errors occurred:</p>
                        {errors.map((error, index) => (
                          <p key={index} className="text-sm text-red-600">{error}</p>
                        ))}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {generatedPages.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Generated Pages</h4>
                    <div className="space-y-2">
                      {generatedPages.map((page, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <span className="text-sm">Page {page.pageNumber}</span>
                          <Badge variant="outline">{page.panels?.length || 0} panels</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Document Management</CardTitle>
              <CardDescription>
                Manage story documents and RAG context
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Document management interface coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="models">
          <Card>
            <CardHeader>
              <CardTitle>Model Management</CardTitle>
              <CardDescription>
                Configure AI models and LoRAs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Model management interface coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Pipeline Settings</CardTitle>
              <CardDescription>
                Configure Sweet Apocalypse generation parameters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Settings interface coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
