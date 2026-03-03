"use client"

import { useState } from "react"
import { FileUpload } from "@/components/ui/file-upload"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { BookOpen, FileText, Zap, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

interface StoryFile {
  id: string
  name: string
  content: string
  size: number
  type: string
}

interface StoryManagerProps {
  onStorySelect: (story: string) => void
  className?: string
}

export function StoryManager({ onStorySelect, className }: StoryManagerProps) {
  const [stories, setStories] = useState<StoryFile[]>([])
  const [selectedStory, setSelectedStory] = useState<string>("")
  const [activeTab, setActiveTab] = useState("upload")

  const handleFilesChange = (files: any[]) => {
    const storyFiles = files.filter(f => f.content).map(f => ({
      id: f.id,
      name: f.name,
      content: f.content,
      size: f.size,
      type: f.type
    }))
    setStories(storyFiles)
    
    if (storyFiles.length > 0 && !selectedStory) {
      setSelectedStory(storyFiles[0].content)
      onStorySelect(storyFiles[0].content)
    }
  }

  const handleStorySelect = (story: StoryFile) => {
    setSelectedStory(story.content)
    onStorySelect(story.content)
  }

  const combineStories = () => {
    const combinedContent = stories.map(s => `# ${s.name}\n\n${s.content}`).join('\n\n---\n\n')
    setSelectedStory(combinedContent)
    onStorySelect(combinedContent)
    setActiveTab("preview")
  }

  const getWordCount = (text: string) => {
    return text.trim().split(/\s+/).length
  }

  const getCharacterCount = (text: string) => {
    return text.length
  }

  return (
    <div className={cn("space-y-6", className)}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5" />
            <span>Story Manager</span>
          </CardTitle>
          <CardDescription>
            Upload and manage multiple story files for your comic generation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upload" className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Upload</span>
              </TabsTrigger>
              <TabsTrigger value="stories" className="flex items-center space-x-2">
                <BookOpen className="h-4 w-4" />
                <span>Stories ({stories.length})</span>
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center space-x-2">
                <Zap className="h-4 w-4" />
                <span>Preview</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-4">
              <FileUpload
                onFilesChange={handleFilesChange}
                accept={['.txt', '.md', '.zip']}
                maxSize={50 * 1024 * 1024} // 50MB
                maxFiles={20}
                multiple={true}
                allowZip={true}
              />
              {stories.length > 1 && (
                <div className="flex justify-center">
                  <Button onClick={combineStories} className="flex items-center space-x-2">
                    <Settings className="h-4 w-4" />
                    <span>Combine All Stories</span>
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="stories" className="space-y-4">
              {stories.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No stories uploaded yet</p>
                  <p className="text-sm">Upload some story files to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {stories.map((story) => (
                    <Card
                      key={story.id}
                      className={cn(
                        "cursor-pointer transition-all hover:shadow-md",
                        selectedStory === story.content && "ring-2 ring-primary"
                      )}
                      onClick={() => handleStorySelect(story)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate">{story.name}</h4>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                              <span>{getWordCount(story.content)} words</span>
                              <span>{getCharacterCount(story.content)} chars</span>
                              <span>{(story.size / 1024).toFixed(1)} KB</span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                              {story.content.substring(0, 150)}...
                            </p>
                          </div>
                          {selectedStory === story.content && (
                            <Badge variant="default">Active</Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="preview" className="space-y-4">
              {selectedStory ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Story Preview</h3>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <span>{getWordCount(selectedStory)} words</span>
                      <span>•</span>
                      <span>{getCharacterCount(selectedStory)} characters</span>
                    </div>
                  </div>
                  <div className="border rounded-lg p-4 max-h-96 overflow-y-auto bg-muted/50">
                    <pre className="whitespace-pre-wrap text-sm font-mono">
                      {selectedStory}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No story selected</p>
                  <p className="text-sm">Upload and select a story to preview</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
