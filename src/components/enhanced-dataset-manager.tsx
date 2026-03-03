"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Image, FileText, Eye, Trash2, Plus, Filter, Search, CheckCircle, AlertCircle, FolderOpen, Download, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

interface DatasetFile {
  id: string
  name: string
  type: 'image' | 'text' | 'archive'
  size: number
  uploadedAt: string
  description?: string
  preview?: string
  tags?: string[]
  category?: 'character' | 'environment' | 'object' | 'style' | 'reference'
  analyzed?: boolean
  duplicate?: boolean
  missing?: boolean
}

interface DatasetManagerProps {
  onDatasetUpdate: (files: DatasetFile[]) => void
  className?: string
}

export function EnhancedDatasetManager({ onDatasetUpdate, className }: DatasetManagerProps) {
  const [activeTab, setActiveTab] = useState("files")
  const [selectedFiles, setSelectedFiles] = useState<DatasetFile[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [showAnalysis, setShowAnalysis] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [datasets] = useState<DatasetFile[]>([
    {
      id: '1',
      name: 'minecraft-characters',
      type: 'image',
      size: 245760,
      uploadedAt: '2024-03-01',
      description: 'Minecraft character sprites and textures for training',
      preview: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDAgMCwgdmVyc2lnKXRvcyIgdmlld0JveD0iMCAwIDAgdC',
      tags: ['minecraft', 'characters', 'sprites'],
      category: 'character',
      analyzed: true
    },
    {
      id: '2',
      name: 'minecraft-environments',
      type: 'image',
      size: 524288,
      uploadedAt: '2024-03-01',
      description: 'Minecraft environment screenshots for scene training',
      preview: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDAgMCwgdmVyc2lnKXRvcyIgdmlld0JveD0iMCAwIDAgdC',
      tags: ['minecraft', 'environments', 'scenes'],
      category: 'environment',
      analyzed: true
    },
    {
      id: '3',
      name: 'comic-panels',
      type: 'image',
      size: 1048576,
      uploadedAt: '2024-03-01',
      description: 'Generated comic panels for style reference',
      preview: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDAgMCwgdmVyc2lnKXRvcyIgdmlld0JveD0iMCAwIDAgdC',
      tags: ['minecraft', 'comics', 'panels'],
      category: 'reference',
      analyzed: true
    },
    {
      id: '4',
      name: 'story-prompts',
      type: 'text',
      size: 12580,
      uploadedAt: '2024-03-01',
      description: 'Story prompts and dialogues for training',
      preview: '',
      tags: ['minecraft', 'stories', 'prompts'],
      category: 'style',
      analyzed: true
    }
  ])

  const filteredDatasets = datasets.filter(dataset => {
    if (selectedCategory === 'all') return true
    return dataset.category === selectedCategory
  })

  const searchedDatasets = filteredDatasets.filter(dataset =>
    dataset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dataset.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    Array.from(files).forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        if (content) {
          const newFile: DatasetFile = {
            id: Date.now().toString(),
            name: file.name,
            type: file.type.startsWith('image/') ? 'image' : 'text',
            size: file.size,
            uploadedAt: new Date().toISOString(),
            description: `Uploaded ${file.type}`,
            preview: file.type.startsWith('image/') ? content : undefined,
            tags: ['uploaded'],
            category: 'character',
            analyzed: false
          }
          setSelectedFiles(prev => [...prev, newFile])
        }
      }
      reader.readAsText(file)
    })
  }

  const handleFileSelect = (file: DatasetFile) => {
    setSelectedFiles(prev => 
      prev.map(f => f.id === file.id ? { ...f, selected: true } : { ...f, selected: false })
    )
  }

  const handleAnalyzeDataset = () => {
    setShowAnalysis(true)
    // Simulate AI analysis
    setTimeout(() => {
      setShowAnalysis(false)
      setSelectedFiles(prev => prev.map(f => ({ ...f, analyzed: true, duplicate: false })))
    }, 2000)
  }

  const handleDeleteFile = (fileId: string) => {
    setSelectedFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const handleCreateLora = () => {
    const selectedImageFiles = selectedFiles.filter(f => f.type === 'image' && f.selected)
    if (selectedImageFiles.length === 0) {
      alert('Please select at least one image file to create a LoRA')
      return
    }
    console.log(`🎯 Creating LoRA from ${selectedImageFiles.length} images...`)
    alert(`LoRA creation started with ${selectedImageFiles.length} images!`)
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="h-4 w-4" />
      case 'text': return <FileText className="h-4 w-4" />
      case 'archive': return <FolderOpen className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const getCategoryBadge = (category: string) => {
    const colors = {
      character: 'bg-purple-100 text-purple-800',
      environment: 'bg-green-100 text-green-800',
      object: 'bg-blue-100 text-blue-800',
      style: 'bg-orange-100 text-orange-800',
      reference: 'bg-gray-100 text-gray-800'
    }
    return (
      <Badge className={colors[category as keyof typeof colors]}>
        {category}
      </Badge>
    )
  }

  return (
    <div className={cn("w-full space-y-6", className)}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FolderOpen className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Enhanced Dataset Manager</h3>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Plus className="h-4 w-4" />
                Upload Files
              </Button>
              <Button
                onClick={handleAnalyzeDataset}
                disabled={selectedFiles.length === 0}
                className="bg-blue-600 hover:bg-blue-700 text-white ml-2"
              >
                <Zap className="h-4 w-4" />
                Analyze Dataset
              </Button>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="files" className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Files ({selectedFiles.length})</span>
              </TabsTrigger>
              <TabsTrigger value="analysis" className="flex items-center space-x-2">
                <Eye className="h-4 w-4" />
                <span>Analysis</span>
              </TabsTrigger>
              <TabsTrigger value="categories" className="flex items-center space-x-2">
                <Filter className="h-4 w-4" />
                <span>Categories</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="files" className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Files</SelectItem>
                      <SelectItem value="character">Characters</SelectItem>
                      <SelectItem value="environment">Environments</SelectItem>
                      <SelectItem value="object">Objects</SelectItem>
                      <SelectItem value="style">Styles</SelectItem>
                      <SelectItem value="reference">References</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="relative">
                    <Search className="absolute right-4 top-3" />
                    <Input
                      placeholder="Search files..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 w-[200px]"
                    />
                  </div>
                </div>
                <Button
                  onClick={handleCreateLora}
                  disabled={selectedFiles.filter(f => f.type === 'image' && f.selected).length === 0}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Zap className="h-4 w-4" />
                  Create LoRA
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {searchedDatasets.map((file) => (
                  <Card key={file.id} className={cn(
                    "hover:shadow-md transition-shadow cursor-pointer",
                    file.selected && "ring-2 ring-purple-500"
                  )} onClick={() => handleFileSelect(file)}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={file.selected}
                            onChange={() => handleFileSelect(file)}
                            className="h-4 w-4"
                          />
                          <div className="flex items-center space-x-3">
                            {getFileIcon(file.type)}
                            <div>
                              <div className="font-medium">{file.name}</div>
                              <div className="text-sm text-gray-500">
                                {(file.size / 1024).toFixed(1)} KB • {file.category}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getCategoryBadge(file.category)}
                          {file.analyzed && (
                            <Badge className="bg-green-500 hover:bg-green-600 ml-2">
                              <CheckCircle className="h-3 w-3" />
                            </Badge>
                          )}
                          {file.duplicate && (
                            <Badge className="bg-orange-500 hover:bg-orange-600 ml-2">
                              <AlertCircle className="h-3 w-3" />
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {file.preview && (
                        <div className="mb-3">
                          <img
                            src={file.preview}
                            alt={file.name}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        </div>
                      )}
                      <CardDescription className="text-sm text-gray-600">
                        {file.description}
                      </CardDescription>
                      <div className="flex items-center justify-between pt-4">
                        <div className="text-sm text-gray-500">
                          {file.uploadedAt}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteFile(file.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-4">
              {showAnalysis ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="h-8 w-8 text-white animate-pulse" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">Analyzing Dataset...</h3>
                  <p className="text-gray-600">
                    Processing {selectedFiles.length} files with AI vision...
                  </p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <h3 className="text-xl font-semibold mb-4">Dataset Analysis</h3>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                      <CardHeader>
                        <CardTitle>Total Files</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-purple-600">
                          {datasets.length}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>Categories</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Characters</span>
                            <Badge className="bg-purple-100 text-purple-800">
                              {datasets.filter(d => d.category === 'character').length}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Environments</span>
                            <Badge className="bg-green-100 text-green-800">
                              {datasets.filter(d => d.category === 'environment').length}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span>Objects</span>
                            <Badge className="bg-blue-100 text-blue-800">
                              {datasets.filter(d => d.category === 'object').length}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span>Styles</span>
                            <Badge className="bg-orange-100 text-orange-800">
                              {datasets.filter(d => d.category === 'style').length}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span>References</span>
                            <Badge className="bg-gray-100 text-gray-800">
                              {datasets.filter(d => d.category === 'reference').length}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>Quality Assessment</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span>High Quality Images</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                            <span>Medium Quality Images</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            <span>Needs Improvement</span>
                          </div>
                        </div>
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                          <h4 className="font-semibold mb-2">Recommendations</h4>
                          <ul className="list-disc list-inside space-y-1">
                            <li>Add more character variations for better training</li>
                            <li>Include diverse environments and lighting conditions</li>
                            <li>Ensure consistent image resolution (512x512 recommended)</li>
                            <li>Add reference images for style guidance</li>
                            <li>Remove duplicate or low-quality images</li>
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="categories" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {['character', 'environment', 'object', 'style', 'reference'].map((category) => (
                  <Card key={category}>
                    <CardHeader>
                      <CardTitle className="capitalize">{category}</CardTitle>
                      <CardDescription>
                        {datasets.filter(d => d.category === category).length} files
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {datasets
                          .filter(d => d.category === category)
                          .slice(0, 3)
                          .map((file) => (
                            <div key={file.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                              <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                                {getFileIcon(file.type)}
                              </div>
                              <div className="flex-1">
                                <div className="font-medium">{file.name}</div>
                                <div className="text-sm text-gray-500">
                                  {(file.size / 1024).toFixed(1)} KB
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,.txt,.json,.csv"
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  )
}
