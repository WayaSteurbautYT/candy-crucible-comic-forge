"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Layout, Grid, Book, Image as ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export type ComicLayoutType = 'flat-page' | 'up-page' | 'manga' | 'webcomic' | 'strip'

interface ComicLayout {
  id: ComicLayoutType
  name: string
  description: string
  icon: React.ReactNode
  preview: string
  panels: number
  aspectRatio: string
  readingDirection: 'left-to-right' | 'right-to-left' | 'top-to-bottom'
}

interface ComicLayoutSelectorProps {
  onLayoutSelect: (layout: ComicLayoutType) => void
  selectedLayout?: ComicLayoutType
  className?: string
}

export function ComicLayoutSelector({ onLayoutSelect, selectedLayout, className }: ComicLayoutSelectorProps) {
  const layouts: ComicLayout[] = [
    {
      id: 'flat-page',
      name: 'Flat Page',
      description: 'Traditional comic book layout with rectangular panels',
      icon: <Book className="h-4 w-4" />,
      preview: '┌─┬─┐\n│ │ │\n├─┼─┤\n│ │ │\n└─┴─┘',
      panels: 4,
      aspectRatio: '16:9',
      readingDirection: 'left-to-right'
    },
    {
      id: 'up-page',
      name: 'Up Page',
      description: 'Vertical scrolling layout for mobile/web',
      icon: <Layout className="h-4 w-4" />,
      preview: '┌─────┐\n│  1  │\n├─────┤\n│  2  │\n├─────┤\n│  3  │\n└─────┘',
      panels: 3,
      aspectRatio: '9:16',
      readingDirection: 'top-to-bottom'
    },
    {
      id: 'manga',
      name: 'Manga Style',
      description: 'Japanese manga layout with right-to-left reading',
      icon: <Grid className="h-4 w-4" />,
      preview: '┌─┬─┐\n│3│4│\n├─┼─┤\n│1│2│\n└─┴─┘',
      panels: 4,
      aspectRatio: '16:9',
      readingDirection: 'right-to-left'
    },
    {
      id: 'webcomic',
      name: 'Webcomic',
      description: 'Optimized for web viewing with flexible panels',
      icon: <ImageIcon className="h-4 w-4" />,
      preview: '┌─────┐\n│  1  │\n├─┬─┬─┤\n│2│3│4│\n└─┴─┴─┘',
      panels: 4,
      aspectRatio: '16:9',
      readingDirection: 'left-to-right'
    },
    {
      id: 'strip',
      name: 'Comic Strip',
      description: 'Classic newspaper comic strip format',
      icon: <Layout className="h-4 w-4" />,
      preview: '┌─┬─┬─┐\n│1│2│3│\n└─┴─┴─┘',
      panels: 3,
      aspectRatio: '3:1',
      readingDirection: 'left-to-right'
    }
  ]

  const handleLayoutSelect = (layoutId: ComicLayoutType) => {
    onLayoutSelect(layoutId)
  }

  const getReadingDirectionIcon = (direction: string) => {
    switch (direction) {
      case 'left-to-right':
        return '→'
      case 'right-to-left':
        return '←'
      case 'top-to-bottom':
        return '↓'
      default:
        return '→'
    }
  }

  return (
    <div className={cn("space-y-6", className)}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Layout className="h-5 w-5" />
            <span>Comic Layout</span>
          </CardTitle>
          <CardDescription>
            Choose the layout style for your comic book pages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {layouts.map((layout) => (
              <Card
                key={layout.id}
                className={cn(
                  "cursor-pointer transition-all hover:shadow-md hover:scale-105",
                  selectedLayout === layout.id && "ring-2 ring-primary shadow-lg"
                )}
                onClick={() => handleLayoutSelect(layout.id)}
              >
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {layout.icon}
                        <h3 className="font-medium">{layout.name}</h3>
                      </div>
                      {selectedLayout === layout.id && (
                        <Badge variant="default">Selected</Badge>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground">
                      {layout.description}
                    </p>

                    {/* Preview */}
                    <div className="bg-muted rounded p-3">
                      <pre className="text-xs font-mono text-center leading-none">
                        {layout.preview}
                      </pre>
                    </div>

                    {/* Specs */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center space-x-3">
                        <span>{layout.panels} panels</span>
                        <span>{layout.aspectRatio}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span>Reading:</span>
                        <span className="font-mono">
                          {getReadingDirectionIcon(layout.readingDirection)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Selected Layout Details */}
          {selectedLayout && (
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">Selected Layout Details</h4>
              {(() => {
                const layout = layouts.find(l => l.id === selectedLayout)
                return layout ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Format:</span> {layout.name}
                    </div>
                    <div>
                      <span className="font-medium">Panels:</span> {layout.panels}
                    </div>
                    <div>
                      <span className="font-medium">Aspect Ratio:</span> {layout.aspectRatio}
                    </div>
                    <div>
                      <span className="font-medium">Reading Direction:</span> {layout.readingDirection.replace('-', ' → ')}
                    </div>
                    <div className="md:col-span-2">
                      <span className="font-medium">Description:</span> {layout.description}
                    </div>
                  </div>
                ) : null
              })()}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
