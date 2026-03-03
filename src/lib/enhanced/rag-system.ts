import { StoryDocument, StoryChunk, RAGContext } from '@/types/enhanced-types'

export class RAGSystem {
  private static instance: RAGSystem
  private documents: Map<string, StoryDocument> = new Map()
  private embeddings: Map<string, number[]> = new Map()
  
  static getInstance(): RAGSystem {
    if (!RAGSystem.instance) {
      RAGSystem.instance = new RAGSystem()
    }
    return RAGSystem.instance
  }

  async addDocument(document: StoryDocument): Promise<void> {
    this.documents.set(document.id, document)
    
    // Generate embeddings for each chunk
    for (const chunk of document.chunks) {
      const embedding = await this.generateEmbedding(chunk.content)
      chunk.embedding = embedding
      this.embeddings.set(chunk.id, embedding)
    }
  }

  async getContext(query: string, maxChunks: number = 5): Promise<RAGContext> {
    const queryEmbedding = await this.generateEmbedding(query)
    
    // Find most similar chunks
    const similarities: Array<{ chunk: StoryChunk; similarity: number }> = []
    
    for (const document of this.documents.values()) {
      for (const chunk of document.chunks) {
        if (chunk.embedding) {
          const similarity = this.cosineSimilarity(queryEmbedding, chunk.embedding)
          similarities.push({ chunk, similarity })
        }
      }
    }
    
    // Sort by similarity and take top chunks
    similarities.sort((a, b) => b.similarity - a.similarity)
    const relevantChunks = similarities.slice(0, maxChunks).map(s => s.chunk)
    
    // Build context string
    const context = relevantChunks
      .map(chunk => `[${chunk.type.toUpperCase()}] ${chunk.content}`)
      .join('\n\n')
    
    const avgSimilarity = similarities.slice(0, maxChunks).reduce((sum, s) => sum + s.similarity, 0) / Math.min(maxChunks, similarities.length)
    
    return {
      query,
      relevantChunks,
      context,
      confidence: avgSimilarity
    }
  }

  private async generateEmbedding(text: string): Promise<number[]> {
    // For now, return a simple hash-based embedding
    // In production, you'd use a proper embedding model like nomic-embed-text
    const words = text.toLowerCase().split(/\s+/)
    const embedding = new Array(384).fill(0) // Standard embedding size
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i]
      for (let j = 0; j < word.length; j++) {
        const charCode = word.charCodeAt(j)
        const index = (i * word.length + j) % embedding.length
        embedding[index] += charCode / 255 // Normalize
      }
    }
    
    // Normalize the embedding
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0))
    return embedding.map(val => val / magnitude)
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0
    
    let dotProduct = 0
    let magnitudeA = 0
    let magnitudeB = 0
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i]
      magnitudeA += a[i] * a[i]
      magnitudeB += b[i] * b[i]
    }
    
    magnitudeA = Math.sqrt(magnitudeA)
    magnitudeB = Math.sqrt(magnitudeB)
    
    if (magnitudeA === 0 || magnitudeB === 0) return 0
    
    return dotProduct / (magnitudeA * magnitudeB)
  }

  async searchByCharacter(characterName: string): Promise<StoryChunk[]> {
    const results: StoryChunk[] = []
    
    for (const document of this.documents.values()) {
      for (const chunk of document.chunks) {
        if (chunk.characters?.includes(characterName)) {
          results.push(chunk)
        }
      }
    }
    
    return results
  }

  async searchByTag(tag: string): Promise<StoryChunk[]> {
    const results: StoryChunk[] = []
    
    for (const document of this.documents.values()) {
      for (const chunk of document.chunks) {
        if (chunk.tags?.includes(tag)) {
          results.push(chunk)
        }
      }
    }
    
    return results
  }

  async searchByType(type: StoryChunk['type']): Promise<StoryChunk[]> {
    const results: StoryChunk[] = []
    
    for (const document of this.documents.values()) {
      for (const chunk of document.chunks) {
        if (chunk.type === type) {
          results.push(chunk)
        }
      }
    }
    
    return results
  }

  getDocumentSummaries(): Array<{ id: string; title: string; chunkCount: number; type: string }> {
    return Array.from(this.documents.values()).map(doc => ({
      id: doc.id,
      title: doc.title,
      chunkCount: doc.chunks.length,
      type: doc.type
    }))
  }

  getStatistics(): {
    totalDocuments: number
    totalChunks: number
    chunksByType: Record<StoryChunk['type'], number>
    uniqueCharacters: number
    uniqueTags: number
  } {
    const chunksByType: Record<StoryChunk['type'], number> = {
      scene: 0,
      character: 0,
      dialogue: 0,
      description: 0,
      worldbuilding: 0
    }
    
    const allCharacters = new Set<string>()
    const allTags = new Set<string>()
    let totalChunks = 0
    
    for (const document of this.documents.values()) {
      totalChunks += document.chunks.length
      
      for (const chunk of document.chunks) {
        chunksByType[chunk.type]++
        
        if (chunk.characters) {
          chunk.characters.forEach(char => allCharacters.add(char))
        }
        
        if (chunk.tags) {
          chunk.tags.forEach(tag => allTags.add(tag))
        }
      }
    }
    
    return {
      totalDocuments: this.documents.size,
      totalChunks,
      chunksByType,
      uniqueCharacters: allCharacters.size,
      uniqueTags: allTags.size
    }
  }

  clearAll(): void {
    this.documents.clear()
    this.embeddings.clear()
  }

  removeDocument(documentId: string): boolean {
    const document = this.documents.get(documentId)
    if (!document) return false
    
    // Remove embeddings for this document's chunks
    for (const chunk of document.chunks) {
      this.embeddings.delete(chunk.id)
    }
    
    this.documents.delete(documentId)
    return true
  }
}
