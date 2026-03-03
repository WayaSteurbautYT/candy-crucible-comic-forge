// Enhanced types for Sweet Apocalypse Issue Generator

export type LoRAConfig = {
  id: string
  name: string
  path: string
  strength: number
  triggerWords: string[]
  type: 'style' | 'character' | 'concept'
}

export type ModelConfig = {
  id: string
  name: string
  type: 'text' | 'image'
  provider: 'ollama' | 'huggingface' | 'comfyui' | 'openai' | 'local'
  modelPath: string
  isDefault: boolean
  loras: LoRAConfig[]
}

export type DocumentType = 'pdf' | 'markdown' | 'docx' | 'txt'

export type StoryDocument = {
  id: string
  title: string
  type: DocumentType
  content: string
  chunks: StoryChunk[]
  metadata: DocumentMetadata
  processedAt: string
}

export type StoryChunk = {
  id: string
  content: string
  type: 'scene' | 'character' | 'dialogue' | 'description' | 'worldbuilding'
  page?: number
  characters?: string[]
  tags?: string[]
  embedding?: number[]
}

export type DocumentMetadata = {
  title?: string
  author?: string
  genre?: string
  tone?: string
  setting?: string
  themes?: string[]
  characters?: string[]
  summary?: string
}

export type RAGContext = {
  query: string
  relevantChunks: StoryChunk[]
  context: string
  confidence: number
}

export type ArtStyleTrainingData = {
  id: string
  name: string
  images: string[]
  description: string
  tags: string[]
  trainedModelPath?: string
  trainingStatus: 'pending' | 'training' | 'completed' | 'failed'
  createdAt: string
}

export type TrainingConfig = {
  epochs: number
  batchSize: number
  learningRate: number
  resolution: number
  steps: number
}

export type TrainingProgress = {
  epoch: number
  step: number
  totalSteps: number
  loss: number
  learningRate: number
  estimatedTimeRemaining: number
  status: 'training' | 'completed' | 'failed' | 'paused'
}

export type BatchGenerationJob = {
  id: string
  storyId: string
  panels: PanelGenerationRequest[]
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  createdAt: string
  completedAt?: string
  error?: string
}

export type PanelGenerationRequest = {
  id: string
  pageNumber: number
  panelNumber: number
  prompt: string
  negativePrompt?: string
  styleConfig: StyleConfig
  characterConfig?: CharacterConfig
  compositionConfig?: CompositionConfig
}

export type StyleConfig = {
  modelId: string
  loras: LoRAConfig[]
  styleTags: string[]
  qualityTags: string[]
  aspectRatio: string
}

export type CharacterConfig = {
  seed: number
  consistencyMode: 'seed' | 'ipadapter' | 'controlnet'
  referenceImage?: string
  pose?: string
}

export type CompositionConfig = {
  shotType: 'wide' | 'medium' | 'close' | 'extreme-close' | 'establishing'
  angle?: 'eye-level' | 'high' | 'low' | 'dutch'
  lighting?: string
  mood?: string
}

export type SweetApocalypseConfig = {
 世界观: {
    setting: 'bruges-infected' | 'candy-apocalypse' | 'mutation-zone'
    tone: 'dark-sweet' | 'tragic-whimsy' | 'hopeless-wonder'
    mutationRules: string[]
  }
  styleLock: {
    basePrompt: string
    negativePrompt: string
    requiredTags: string[]
    forbiddenTags: string[]
  }
  characterConsistency: {
    mainCharacters: CharacterProfile[]
    seedMapping: Record<string, number>
  }
}

export type CharacterProfile = {
  name: string
  description: string
  appearance: string
  personality: string
  role: 'protagonist' | 'antagonist' | 'supporting'
  seed?: number
  referenceImage?: string
}

export type OllamaConfig = {
  baseUrl: string
  models: {
    text: string[]
    image: string[]
  }
  apiKey?: string
}

export type ComfyUIConfig = {
  apiUrl: string
  workflows: {
    textToImage: string
    imageToImage: string
    batchGeneration: string
  }
  queueSize: number
}

export type EnhancedSettings = {
  // Original settings
  ...originalSettings
  
  // New enhanced settings
  ollamaConfig: OllamaConfig
  comfyUIConfig: ComfyUIConfig
  sweetApocalypseConfig: SweetApocalypseConfig
  availableModels: ModelConfig[]
  activeTextModel: string
  activeImageModel: string
  ragEnabled: boolean
  batchSize: number
  autoExport: boolean
}

export type GenerationPipeline = {
  id: string
  name: string
  steps: PipelineStep[]
  config: PipelineConfig
}

export type PipelineStep = {
  id: string
  name: string
  type: 'document-import' | 'rag-context' | 'text-generation' | 'prompt-building' | 'image-generation' | 'quality-check' | 'export'
  config: Record<string, any>
  enabled: boolean
}

export type PipelineConfig = {
  autoRun: boolean
  retryOnError: boolean
  maxRetries: number
  notifications: boolean
}
