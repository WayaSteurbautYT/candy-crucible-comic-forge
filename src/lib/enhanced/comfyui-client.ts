import { ComfyUIConfig, BatchGenerationJob, PanelGenerationRequest, LoRAConfig } from '@/types/enhanced-types'

export interface ComfyUINode {
  id: number
  type: string
  inputs: Record<string, any>
}

export interface ComfyUIWorkflow {
  nodes: ComfyUINode[]
  links: Array<[number, number, number, number, number]>
  groups?: Array<{
    title: string
    bounding: [number, number, number, number]
    color: string
    font_size: number
  }>
}

export interface ComfyUIQueueResponse {
  queue_running: Array<{ prompt_id: string }>
  queue_pending: Array<{ prompt_id: string }>
}

export interface ComfyUIHistoryResponse {
  [prompt_id: string]: {
    prompt: ComfyUIWorkflow
    outputs: Record<string, any>
    status: {
      status_str: string
      completed: boolean
      messages: Array<{ type: string; message: string }>
    }
  }
}

export class ComfyUIClient {
  private config: ComfyUIConfig
  private baseUrl: string

  constructor(config: ComfyUIConfig) {
    this.config = config
    this.baseUrl = config.apiUrl.replace(/\/$/, '')
  }

  async generateWorkflow(
    request: PanelGenerationRequest,
    workflowType: 'text-to-image' | 'image-to-image' = 'text-to-image'
  ): Promise<ComfyUIWorkflow> {
    const baseWorkflow = await this.loadBaseWorkflow(workflowType)
    
    // Customize workflow based on request
    const customizedWorkflow = this.customizeWorkflow(baseWorkflow, request)
    
    return customizedWorkflow
  }

  async submitPrompt(workflow: ComfyUIWorkflow): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/prompt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt: workflow })
      })

      if (!response.ok) {
        throw new Error(`Failed to submit prompt: ${response.statusText}`)
      }

      const data = await response.json()
      return data.prompt_id
    } catch (error) {
      console.error('Error submitting ComfyUI prompt:', error)
      throw error
    }
  }

  async getQueue(): Promise<ComfyUIQueueResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/queue`)
      if (!response.ok) {
        throw new Error(`Failed to get queue: ${response.statusText}`)
      }
      return await response.json()
    } catch (error) {
      console.error('Error getting ComfyUI queue:', error)
      return { queue_running: [], queue_pending: [] }
    }
  }

  async getHistory(promptId?: string): Promise<ComfyUIHistoryResponse> {
    try {
      const url = promptId 
        ? `${this.baseUrl}/history/${promptId}`
        : `${this.baseUrl}/history`
      
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to get history: ${response.statusText}`)
      }
      return await response.json()
    } catch (error) {
      console.error('Error getting ComfyUI history:', error)
      return {}
    }
  }

  async getImage(promptId: string, nodeId: number): Promise<Blob> {
    try {
      const response = await fetch(`${this.baseUrl}/view?filename=${promptId}_${nodeId}.png`)
      if (!response.ok) {
        throw new Error(`Failed to get image: ${response.statusText}`)
      }
      return await response.blob()
    } catch (error) {
      console.error('Error getting ComfyUI image:', error)
      throw error
    }
  }

  async batchGenerate(job: BatchGenerationJob): Promise<void> {
    const workflow = await this.loadBaseWorkflow('batch-generation')
    
    // Process panels in batches to avoid overwhelming the system
    const batchSize = Math.min(this.config.queueSize, 4)
    const batches = []
    
    for (let i = 0; i < job.panels.length; i += batchSize) {
      batches.push(job.panels.slice(i, i + batchSize))
    }

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex]
      const promptIds: string[] = []

      // Submit all prompts in this batch
      for (const panel of batch) {
        const workflow = await this.generateWorkflow(panel)
        const promptId = await this.submitPrompt(workflow)
        promptIds.push(promptId)
      }

      // Wait for batch completion
      await this.waitForBatchCompletion(promptIds)

      // Update progress
      const completedCount = (batchIndex + 1) * batchSize
      const progress = Math.min((completedCount / job.panels.length) * 100, 100)
      job.progress = progress
    }
  }

  private async waitForBatchCompletion(promptIds: string[]): Promise<void> {
    const maxWaitTime = 300000 // 5 minutes max wait
    const checkInterval = 5000 // Check every 5 seconds
    let elapsedTime = 0

    while (elapsedTime < maxWaitTime) {
      const history = await this.getHistory()
      const completed = promptIds.every(id => 
        history[id]?.status?.completed
      )

      if (completed) {
        return
      }

      await new Promise(resolve => setTimeout(resolve, checkInterval))
      elapsedTime += checkInterval
    }

    throw new Error('Batch generation timed out')
  }

  private async loadBaseWorkflow(workflowType: string): Promise<ComfyUIWorkflow> {
    // In a real implementation, this would load from files or API
    // For now, return a basic workflow structure
    return {
      nodes: [],
      links: []
    }
  }

  private customizeWorkflow(baseWorkflow: ComfyUIWorkflow, request: PanelGenerationRequest): ComfyUIWorkflow {
    const workflow = JSON.parse(JSON.stringify(baseWorkflow)) // Deep clone

    // Find and configure key nodes
    const checkpointLoader = workflow.nodes.find((n: ComfyUINode) => n.type === 'CheckpointLoaderSimple')
    const ksampler = workflow.nodes.find((n: ComfyUINode) => n.type === 'KSampler')
    const emptyLatent = workflow.nodes.find((n: ComfyUINode) => n.type === 'EmptyLatentImage')
    const textToImage = workflow.nodes.find((n: ComfyUINode) => n.type === 'CLIPTextEncode')

    if (checkpointLoader) {
      checkpointLoader.inputs = {
        ckpt_name: request.styleConfig.modelId
      }
    }

    if (ksampler) {
      ksampler.inputs = {
        seed: request.characterConfig?.seed || Math.floor(Math.random() * 1000000),
        steps: 20,
        cfg: 7.5,
        sampler_name: 'dpmpp_2m',
        scheduler: 'karras',
        denoise: 1.0
      }
    }

    if (emptyLatent) {
      const [width, height] = request.styleConfig.aspectRatio.split('x').map(Number)
      emptyLatent.inputs = {
        width: width || 1024,
        height: height || 512,
        batch_size: 1
      }
    }

    if (textToImage) {
      textToImage.inputs = {
        text: request.prompt,
        clip: workflow.nodes.find((n: ComfyUINode) => n.type === 'CLIPTextEncode')?.inputs?.clip || [1, 1]
      }
    }

    // Add LoRA nodes if specified
    if (request.styleConfig.loras.length > 0) {
      this.addLoRANodes(workflow, request.styleConfig.loras)
    }

    return workflow
  }

  private addLoRANodes(workflow: ComfyUIWorkflow, loras: LoRAConfig[]): void {
    let nodeId = Math.max(...workflow.nodes.map(n => n.id)) + 1

    for (const lora of loras) {
      // Add LoRA loader node
      const loraLoader: ComfyUINode = {
        id: nodeId,
        type: 'LoraLoader',
        inputs: {
          model: workflow.nodes.find((n: ComfyUINode) => n.type === 'CheckpointLoaderSimple')?.id || [1, 1],
          clip: workflow.nodes.find((n: ComfyUINode) => n.type === 'CLIPTextEncode')?.inputs?.clip || [1, 1],
          lora_name: lora.path,
          strength_model: lora.strength,
          strength_clip: lora.strength
        }
      }

      workflow.nodes.push(loraLoader)
      nodeId++
    }
  }

  async checkConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/system_stats`)
      return response.ok
    } catch {
      return false
    }
  }

  async getSystemStats(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/system_stats`)
      if (!response.ok) {
        throw new Error(`Failed to get system stats: ${response.statusText}`)
      }
      return await response.json()
    } catch (error) {
      console.error('Error getting ComfyUI system stats:', error)
      return null
    }
  }

  async interrupt(): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/interrupt`, { method: 'POST' })
    } catch (error) {
      console.error('Error interrupting ComfyUI:', error)
    }
  }

  async clearQueue(): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/queue`, { method: 'DELETE' })
    } catch (error) {
      console.error('Error clearing ComfyUI queue:', error)
    }
  }

  updateConfig(config: ComfyUIConfig): void {
    this.config = config
    this.baseUrl = config.apiUrl.replace(/\/$/, '')
  }
}
