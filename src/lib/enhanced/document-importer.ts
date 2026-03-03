import { StoryDocument, StoryChunk, DocumentType, DocumentMetadata } from '@/types/enhanced-types'

// Simple ID generator since we don't have uuid/nanoid
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
}

export class DocumentImporter {
  private static instance: DocumentImporter
  
  static getInstance(): DocumentImporter {
    if (!DocumentImporter.instance) {
      DocumentImporter.instance = new DocumentImporter()
    }
    return DocumentImporter.instance
  }

  async importDocument(file: File, type: DocumentType): Promise<StoryDocument> {
    const content = await this.extractContent(file, type)
    const chunks = await this.chunkContent(content)
    const metadata = await this.extractMetadata(content, chunks)
    
    return {
      id: generateId(),
      title: file.name.replace(/\.[^/.]+$/, ''),
      type,
      content,
      chunks,
      metadata,
      processedAt: new Date().toISOString()
    }
  }

  private async extractContent(file: File, type: DocumentType): Promise<string> {
    switch (type) {
      case 'pdf':
        return this.extractPDFContent(file)
      case 'markdown':
        return this.extractMarkdownContent(file)
      case 'docx':
        return this.extractDocxContent(file)
      case 'txt':
        return this.extractTextContent(file)
      default:
        throw new Error(`Unsupported document type: ${type}`)
    }
  }

  private async extractPDFContent(file: File): Promise<string> {
    // Use pdf-lib or pdf-parse for PDF extraction
    // For now, return placeholder
    return `PDF content from ${file.name} - implement PDF parsing library`
  }

  private async extractMarkdownContent(file: File): Promise<string> {
    return await file.text()
  }

  private async extractDocxContent(file: File): Promise<string> {
    // Use docx library for DOCX extraction
    // For now, return placeholder
    return `DOCX content from ${file.name} - implement docx parsing library`
  }

  private async extractTextContent(file: File): Promise<string> {
    return await file.text()
  }

  private async chunkContent(content: string): Promise<StoryChunk[]> {
    const chunks: StoryChunk[] = []
    
    // Split by paragraphs first
    const paragraphs = content.split(/\n\n+/)
    
    let currentId = 0
    let pageNumber = 1
    
    for (const paragraph of paragraphs) {
      if (paragraph.trim().length === 0) continue
      
      const chunkType = this.detectChunkType(paragraph)
      const characters = this.extractCharacters(paragraph)
      const tags = this.extractTags(paragraph)
      
      // Simple page detection (you can make this smarter)
      if (paragraph.toLowerCase().includes('page') || chunks.length % 5 === 0) {
        pageNumber++
      }
      
      chunks.push({
        id: generateId(),
        content: paragraph.trim(),
        type: chunkType,
        page: pageNumber,
        characters: characters.length > 0 ? characters : undefined,
        tags: tags.length > 0 ? tags : undefined
      })
      
      currentId++
    }
    
    return chunks
  }

  private detectChunkType(content: string): StoryChunk['type'] {
    const lower = content.toLowerCase()
    
    if (lower.includes('chapter') || lower.includes('scene') || lower.includes('setting')) {
      return 'scene'
    }
    
    if (this.hasDialogue(content)) {
      return 'dialogue'
    }
    
    if (this.hasCharacterDescription(content)) {
      return 'character'
    }
    
    if (this.hasWorldBuilding(content)) {
      return 'worldbuilding'
    }
    
    return 'description'
  }

  private hasDialogue(content: string): boolean {
    // Check for dialogue patterns
    return /["']|".*"|'.*'/g.test(content) || 
           content.includes('said') ||
           content.includes('whispered') ||
           content.includes('shouted')
  }

  private hasCharacterDescription(content: string): boolean {
    const characterKeywords = ['tall', 'short', 'hair', 'eyes', 'wearing', 'dressed', 'appeared']
    return characterKeywords.some(keyword => 
      content.toLowerCase().includes(keyword)
    )
  }

  private hasWorldBuilding(content: string): boolean {
    const worldKeywords = ['city', 'building', 'street', 'world', 'environment', 'atmosphere']
    return worldKeywords.some(keyword => 
      content.toLowerCase().includes(keyword)
    )
  }

  private extractCharacters(content: string): string[] {
    const characters: string[] = []
    
    // Simple character name extraction - you can make this smarter with NLP
    const namePattern = /\b[A-Z][a-z]+\b/g
    const matches = content.match(namePattern)
    
    if (matches) {
      // Filter out common words that aren't character names
      const commonWords = ['The', 'A', 'An', 'And', 'But', 'Or', 'So', 'It', 'He', 'She', 'They', 'We', 'I']
      characters.push(...matches.filter(name => !commonWords.includes(name)))
    }
    
    return [...new Set(characters)] // Remove duplicates
  }

  private extractTags(content: string): string[] {
    const tags: string[] = []
    const lower = content.toLowerCase()
    
    // Extract thematic tags
    if (lower.includes('sweet') || lower.includes('candy')) tags.push('sweet')
    if (lower.includes('apocalypse') || lower.includes('end')) tags.push('apocalypse')
    if (lower.includes('mutation') || lower.includes('transform')) tags.push('mutation')
    if (lower.includes('bruges')) tags.push('bruges')
    if (lower.includes('infected') || lower.includes('virus')) tags.push('infected')
    
    return tags
  }

  private async extractMetadata(content: string, chunks: StoryChunk[]): Promise<DocumentMetadata> {
    const metadata: DocumentMetadata = {}
    
    // Extract title (first line or first significant chunk)
    const firstChunk = chunks.find(c => c.type === 'scene' || c.type === 'description')
    if (firstChunk) {
      const firstLine = firstChunk.content.split('\n')[0]
      metadata.title = firstLine.length < 100 ? firstLine : undefined
    }
    
    // Extract characters from all chunks
    const allCharacters = chunks.flatMap(c => c.characters || [])
    metadata.characters = [...new Set(allCharacters)]
    
    // Extract themes from tags
    const allTags = chunks.flatMap(c => c.tags || [])
    metadata.themes = [...new Set(allTags)]
    
    // Detect genre and tone from content
    const lowerContent = content.toLowerCase()
    if (lowerContent.includes('horror') || lowerContent.includes('scary')) {
      metadata.genre = 'horror'
    } else if (lowerContent.includes('fantasy') || lowerContent.includes('magic')) {
      metadata.genre = 'fantasy'
    } else if (lowerContent.includes('sci-fi') || lowerContent.includes('future')) {
      metadata.genre = 'sci-fi'
    }
    
    if (lowerContent.includes('dark') || lowerContent.includes('grim')) {
      metadata.tone = 'dark'
    } else if (lowerContent.includes('hopeful') || lowerContent.includes('optimistic')) {
      metadata.tone = 'hopeful'
    }
    
    // Generate summary (first few paragraphs)
    const summaryChunks = chunks.slice(0, 3).map(c => c.content).join(' ')
    metadata.summary = summaryChunks.length > 500 ? 
      summaryChunks.substring(0, 497) + '...' : 
      summaryChunks
    
    return metadata
  }

  async validateDocument(file: File, type: DocumentType): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = []
    
    // File size check
    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      errors.push('File size exceeds 50MB limit')
    }
    
    // File type validation
    const allowedTypes = {
      pdf: 'application/pdf',
      markdown: 'text/markdown',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      txt: 'text/plain'
    }
    
    if (allowedTypes[type] && !file.type.includes(allowedTypes[type].split('/')[1])) {
      errors.push(`Invalid file type for ${type}. Expected: ${allowedTypes[type]}`)
    }
    
    return {
      valid: errors.length === 0,
      errors
    }
  }
}
