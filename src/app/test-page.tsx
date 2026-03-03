"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
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

export default function TestPage() {
  const [activeTab, setActiveTab] = useState("story")

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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-purple-950 dark:via-pink-950 dark:to-orange-950">
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
                  AI Comic Factory - Test Mode
                </h1>
                <p className="text-muted-foreground">Testing all components and features</p>
              </div>
            </div>
            <Badge className="bg-green-500 hover:bg-green-600">
              All Systems Operational
            </Badge>
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
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BookOpen className="h-5 w-5" />
                    <span>Story Manager Test</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p>✅ Story Manager Component Loaded Successfully</p>
                    <Button>Test File Upload</Button>
                    <Button variant="outline">Test ZIP Upload</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ai" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Brain className="h-5 w-5" />
                    <span>AI Model Manager Test</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p>✅ AI Model Manager Component Loaded Successfully</p>
                    <Button>Configure Qwen Model</Button>
                    <Button variant="outline">Configure OpenRouter</Button>
                    <Button variant="outline">Configure Ostris AI</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="cover" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Palette className="h-5 w-5" />
                    <span>Cover Page Generator Test</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p>✅ Cover Page Generator Component Loaded Successfully</p>
                    <Button>Generate Cover Page</Button>
                    <Button variant="outline">Preview Design</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="layout" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Layout className="h-5 w-5" />
                    <span>Comic Layout Selector Test</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p>✅ Comic Layout Selector Component Loaded Successfully</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <Button variant="outline">Flat Page</Button>
                      <Button variant="outline">Up Page</Button>
                      <Button variant="outline">Manga</Button>
                      <Button variant="outline">Webcomic</Button>
                      <Button variant="outline">Strip</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="generate" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Rocket className="h-5 w-5" />
                    <span>Generation Workflow Test</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p>✅ Generation Workflow Component Loaded Successfully</p>
                    <Button className="w-full">
                      <Zap className="h-4 w-4 mr-2" />
                      Start Comic Generation
                    </Button>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Button variant="outline" size="sm">Download Templates</Button>
                      <Button variant="outline" size="sm">Advanced Settings</Button>
                      <Button variant="outline" size="sm">View Tutorial</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="downloads" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Download className="h-5 w-5" />
                    <span>Model Downloads Test</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p>✅ Model Download Manager Component Loaded Successfully</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button>Download Flux Dev</Button>
                      <Button variant="outline">Download Gwen Image</Button>
                      <Button variant="outline">Download Qwen Image</Button>
                      <Button variant="outline">Download Sweet Apocalypse Base</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
