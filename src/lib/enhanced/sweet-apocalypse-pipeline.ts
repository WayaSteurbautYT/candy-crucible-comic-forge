import { 
  SweetApocalypseConfig, 
  GenerationPipeline, 
  StoryDocument, 
  BatchGenerationJob,
  PanelGenerationRequest,
  RAGContext
} from '@/types/enhanced-types'
import { RAGSystem } from './rag-system'
import { OllamaClient } from './ollama-client'
import { ComfyUIClient } from './comfyui-client'
import { DocumentImporter } from './document-importer'

export interface PipelineResult {
  success: boolean
  pages: Array<{
    pageNumber: number
    panels: Array<{
      panelNumber: number
      imageUrl: string
      prompt: string
      metadata: any
    }>
  }>
  errors: string[]
  metadata: {
    totalPages: number
    totalPanels: number
    generationTime: number
    modelUsed: string
    lorasUsed: string[]
  }
}

export class SweetApocalypsePipeline {
  private static instance: SweetApocalypsePipeline
  private config: SweetApocalypseConfig
  private ragSystem: RAGSystem
  private ollamaClient: OllamaClient
  private comfyUIClient: ComfyUIClient
  private documentImporter: DocumentImporter
  
  static getInstance(config: SweetApocalypseConfig): SweetApocalypsePipeline {
    if (!SweetApocalypsePipeline.instance) {
      SweetApocalypsePipeline.instance = new SweetApocalypsePipeline(config)
    }
    return SweetApocalypsePipeline.instance
  }

  constructor(config: SweetApocalypseConfig) {
    this.config = config
    this.ragSystem = RAGSystem.getInstance()
    this.documentImporter = DocumentImporter.getInstance()
    
    // Initialize clients (these would be configured with actual endpoints)
    this.ollamaClient = new OllamaClient({
      baseUrl: 'http://localhost:11434',
      models: {
        text: ['qwen2.5:7b', 'llama3.1:8b'],
        image: ['llava:7b']
      }
    })
    
    this.comfyUIClient = new ComfyUIClient({
      apiUrl: 'http://localhost:8188',
      workflows: {
        textToImage: 'sweet-apocalypse-workflow.json',
        imageToImage: 'sweet-apocalypse-img2img.json',
        batchGeneration: 'sweet-apocalypse-batch.json'
      },
      queueSize: 4
    })
  }

  async generateIssue(
    sourceDocument?: File,
    customPrompt?: string,
    numPages: number = 4
  ): Promise<PipelineResult> {
    const startTime = Date.now()
    const result: PipelineResult = {
      success: false,
      pages: [],
      errors: [],
      metadata: {
        totalPages: numPages,
        totalPanels: 0,
        generationTime: 0,
        modelUsed: this.config.styleLock.basePrompt,
        lorasUsed: []
      }
    }

    try {
      // Step 1: Import and process source document if provided
      let storyContext = ''
      if (sourceDocument) {
        const document = await this.documentImporter.importDocument(sourceDocument, 'markdown')
        await this.ragSystem.addDocument(document)
        storyContext = document.content
      }

      // Step 2: Generate story for each page
      const pages = []
      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const pageResult = await this.generatePage(pageNum, storyContext, customPrompt)
        if (pageResult.success) {
          pages.push(pageResult.page)
        } else {
          result.errors.push(...pageResult.errors)
        }
      }

      // Step 3: Generate images for all panels
      const allPanels = pages.flatMap(page => page.panels)
      const imageResults = await this.generateBatchImages(allPanels)
      
      // Step 4: Assemble final result
      result.pages = pages.map((page: any, pageIndex: number) => ({
        pageNumber: page.pageNumber,
        panels: page.panels.map((panel: any, panelIndex: number) => ({
          panelNumber: panel.panelNumber,
          imageUrl: imageResults[pageIndex * page.panels.length + panelIndex] || '',
          prompt: panel.prompt,
          metadata: panel.metadata
        }))
      }))

      result.success = result.errors.length === 0
      result.metadata.totalPanels = allPanels.length
      result.metadata.generationTime = Date.now() - startTime

    } catch (error) {
      result.errors.push(`Pipeline error: ${(error as Error).message}`)
    }

    return result
  }

  private async generatePage(
    pageNumber: number,
    storyContext: string,
    customPrompt?: string
  ): Promise<{ success: boolean; page: any; errors: string[] }> {
    const errors: string[] = []
    
    try {
      // Get relevant context from RAG system
      const ragContext = await this.ragSystem.getContext(
        `page ${pageNumber} ${customPrompt || 'sweet apocalypse story'}`,
        3
      )

      // Build story generation prompt
      const storyPrompt = this.buildStoryPrompt(pageNumber, ragContext, customPrompt)
      
      // Generate story with Ollama
      const storyResponse = await this.ollamaClient.generateStoryPrompt(
        'qwen2.5:7b',
        ragContext.context,
        storyPrompt,
        'sweet-apocalypse'
      )

      // Parse story response into panels
      const panels = this.parseStoryResponse(storyResponse, pageNumber)
      
      return {
        success: true,
        page: {
          pageNumber,
          panels
        },
        errors
      }

    } catch (error) {
      errors.push(`Page ${pageNumber} generation failed: ${(error as Error).message}`)
      return { success: false, page: null, errors }
    }
  }

  private buildStoryPrompt(
    pageNumber: number,
    ragContext: RAGContext,
    customPrompt?: string
  ): string {
    const basePrompt = customPrompt || `Continue the Sweet Apocalypse story in Bruges`
    
    return `
${basePrompt}

Page ${pageNumber} requirements:
- Setting: ${this.config.世界观.setting}
- Tone: ${this.config.世界观.tone}
- Include mutation elements: ${this.config.世界观.mutationRules.join(', ')}

Context from previous pages:
${ragContext.context}

Generate 4-6 panel descriptions for this page that:
1. Advance the plot meaningfully
2. Maintain the dark-sweet aesthetic
3. Show character development
4. Include visual mutation elements
5. Balance horror and beauty

Format as JSON:
{
  "panels": [
    {
      "panelNumber": 1,
      "description": "detailed visual description",
      "shotType": "wide|medium|close|extreme-close",
      "characters": ["character names"],
      "action": "what's happening",
      "emotion": "emotional tone"
    }
  ]
}`
  }

  private parseStoryResponse(response: string, pageNumber: number): PanelGenerationRequest[] {
    try {
      // Try to parse as JSON first
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        return this.convertToPanelRequests(parsed.panels || [], pageNumber)
      }
      
      // Fallback: parse text response
      return this.parseTextResponse(response, pageNumber)
      
    } catch (error) {
      console.error('Failed to parse story response:', error)
      return this.generateFallbackPanels(pageNumber)
    }
  }

  private convertToPanelRequests(panels: any[], pageNumber: number): PanelGenerationRequest[] {
    return panels.map((panel: any, index: number) => ({
      id: `page${pageNumber}_panel${index + 1}`,
      pageNumber,
      panelNumber: index + 1,
      prompt: this.buildImagePrompt(panel),
      styleConfig: {
        modelId: 'qwen2-vl:7b', // Default image model
        loras: [], // Would load SweetApoc LoRA here
        styleTags: ['sweetapoc_style', 'bruges-infected', 'mutation-horror'],
        qualityTags: ['highly detailed', 'cinematic lighting', 'emotional'],
        aspectRatio: '1024x512'
      },
      characterConfig: {
        seed: this.getCharacterSeed(panel.characters?.[0]),
        consistencyMode: 'seed',
        pose: panel.action || 'standing'
      },
      compositionConfig: {
        shotType: panel.shotType || 'medium',
        angle: 'eye-level',
        lighting: 'dramatic',
        mood: panel.emotion || 'tense'
      }
    }))
  }

  private buildImagePrompt(panel: any): string {
    const baseStyle = this.config.styleLock.basePrompt
    const shotType = panel.shotType || 'medium shot'
    const action = panel.action || 'standing'
    const emotion = panel.emotion || 'neutral'
    const characters = panel.characters?.join(', ') || 'character'
    
    let prompt = `${baseStyle}, ${shotType} of ${characters}, ${action}`
    
    // Add Sweet Apocalypse specific elements
    prompt += ', candy-like mutations, pastel horror, bruges architecture'
    prompt += `, emotional ${emotion}, cinematic realism`
    
    // Add required tags
    prompt += `, ${this.config.styleLock.requiredTags.join(', ')}`
    
    return prompt
  }

  private getCharacterSeed(characterName?: string): number {
    // Use consistent seeds for character consistency
    const characterSeeds = this.config.characterConsistency.seedMapping
    if (characterName && characterSeeds[characterName]) {
      return characterSeeds[characterName]
    }
    
    // Generate deterministic seed based on character name
    if (characterName) {
      let hash = 0
      for (let i = 0; i < characterName.length; i++) {
        hash = ((hash << 5) - hash) + characterName.charCodeAt(i)
        hash = hash & hash // Convert to 32-bit integer
      }
      return Math.abs(hash) % 1000000
    }
    
    return Math.floor(Math.random() * 1000000)
  }

  private parseTextResponse(response: string, pageNumber: number): PanelGenerationRequest[] {
    // Simple text parsing fallback
    const lines = response.split('\n').filter(line => line.trim())
    const panels: PanelGenerationRequest[] = []
    
    lines.forEach((line, index) => {
      if (line.includes('Panel') || index < 6) { // Assume first 6 lines are panels
        panels.push({
          id: `page${pageNumber}_panel${index + 1}`,
          pageNumber,
          panelNumber: index + 1,
          prompt: this.buildImagePrompt({ description: line }),
          styleConfig: {
            modelId: 'qwen2-vl:7b',
            loras: [],
            styleTags: ['sweetapoc_style'],
            qualityTags: ['high quality'],
            aspectRatio: '1024x512'
          }
        })
      }
    })
    
    return panels.length > 0 ? panels : this.generateFallbackPanels(pageNumber)
  }

  private generateFallbackPanels(pageNumber: number): PanelGenerationRequest[] {
    return [
      {
        id: `page${pageNumber}_panel1`,
        pageNumber,
        panelNumber: 1,
        prompt: `${this.config.styleLock.basePrompt}, wide shot of bruges canals at twilight, candy mutations spreading`,
        styleConfig: {
          modelId: 'qwen2-vl:7b',
          loras: [],
          styleTags: ['sweetapoc_style'],
          qualityTags: ['cinematic'],
          aspectRatio: '1024x512'
        }
      },
      {
        id: `page${pageNumber}_panel2`,
        pageNumber,
        panelNumber: 2,
        prompt: `${this.config.styleLock.basePrompt}, close up of infected child with crystalline tears`,
        styleConfig: {
          modelId: 'qwen2-vl:7b',
          loras: [],
          styleTags: ['sweetapoc_style'],
          qualityTags: ['emotional'],
          aspectRatio: '1024x512'
        }
      }
    ]
  }

  private async generateBatchImages(panels: PanelGenerationRequest[]): Promise<string[]> {
    const imageUrls: string[] = []
    
    // Create batch job
    const batchJob: BatchGenerationJob = {
      id: `batch_${Date.now()}`,
      storyId: 'sweet_apocalypse_issue',
      panels,
      status: 'pending',
      progress: 0,
      createdAt: new Date().toISOString()
    }

    try {
      // Submit to ComfyUI
      await this.comfyUIClient.batchGenerate(batchJob)
      
      // Collect results (in real implementation, would wait for completion)
      for (let i = 0; i < panels.length; i++) {
        imageUrls.push(`/generated/panel_${i + 1}.png`)
      }
      
    } catch (error) {
      console.error('Batch generation failed:', error)
    }

    return imageUrls
  }

  async trainUserArtStyle(images: File[], description: string): Promise<string> {
    // This would integrate with the ArtStyleTrainer
    // For now, return placeholder
    return 'user_style_lora_path'
  }

  updateConfig(newConfig: SweetApocalypseConfig): void {
    this.config = newConfig
  }

  getPipelineStatus(): {
    ragDocuments: number
    ollamaConnected: boolean
    comfyUIConnected: boolean
    activeTrainings: number
  } {
    return {
      ragDocuments: this.ragSystem.getDocumentSummaries().length,
      ollamaConnected: true, // Would check actual connection
      comfyUIConnected: true, // Would check actual connection
      activeTrainings: 0 // Would get from ArtStyleTrainer
    }
  }
}
