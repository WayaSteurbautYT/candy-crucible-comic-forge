import { OllamaConfig } from '@/types/enhanced-types'

export interface OllamaMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface OllamaResponse {
  model: string
  created_at: string
  response: string
  done: boolean
  total_duration?: number
  load_duration?: number
  prompt_eval_count?: number
  prompt_eval_duration?: number
  eval_count?: number
  eval_duration?: number
}

export interface OllamaModel {
  name: string
  model: string
  modified_at: string
  size: number
  digest: string
  details: {
    format: string
    family: string
    families: string[]
    parameter_size: string
    quantization_level: string
  }
}

export class OllamaClient {
  private config: OllamaConfig
  private baseUrl: string

  constructor(config: OllamaConfig) {
    this.config = config
    this.baseUrl = config.baseUrl.replace(/\/$/, '') // Remove trailing slash
  }

  async listModels(): Promise<OllamaModel[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`)
      if (!response.ok) {
        throw new Error(`Failed to list models: ${response.statusText}`)
      }
      
      const data = await response.json()
      return data.models || []
    } catch (error) {
      console.error('Error listing Ollama models:', error)
      return []
    }
  }

  async generateText(
    model: string,
    messages: OllamaMessage[],
    options: {
      temperature?: number
      max_tokens?: number
      top_p?: number
      stream?: boolean
    } = {}
  ): Promise<string> {
    const payload = {
      model,
      messages,
      stream: options.stream || false,
      options: {
        temperature: options.temperature || 0.7,
        num_predict: options.max_tokens || 2048,
        top_p: options.top_p || 0.9
      }
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`)
      }

      if (options.stream) {
        // Handle streaming response
        const reader = response.body?.getReader()
        let fullResponse = ''
        
        if (reader) {
          const decoder = new TextDecoder()
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            
            const chunk = decoder.decode(value)
            const lines = chunk.split('\n').filter(line => line.trim())
            
            for (const line of lines) {
              try {
                const data = JSON.parse(line)
                if (data.message?.content) {
                  fullResponse += data.message.content
                }
              } catch (e) {
                // Skip invalid JSON lines
              }
            }
          }
        }
        
        return fullResponse
      } else {
        const data: OllamaResponse = await response.json()
        return data.response || ''
      }
    } catch (error) {
      console.error('Error generating text with Ollama:', error)
      throw error
    }
  }

  async generateStoryPrompt(
    model: string,
    context: string,
    userPrompt: string,
    style: 'sweet-apocalypse' | 'general' = 'sweet-apocalypse'
  ): Promise<string> {
    const systemPrompt = style === 'sweet-apocalypse' 
      ? `You are a story generator for the Sweet Apocalypse universe. 

Key elements:
- Setting: Bruges, Belgium infected by a mysterious candy-like mutation
- Tone: Dark but whimsical, tragic yet beautiful
- Themes: Transformation, loss, survival, childhood innocence corrupted
- Visual style: Pastel colors with horror elements, decay mixed with sweetness

Generate compelling comic panel descriptions that maintain this unique aesthetic. Each panel should:
1. Advance the story
2. Maintain visual consistency
3. Balance horror and beauty
4. Include emotional depth

Format your response as a JSON object with panels array.`
      : `You are a creative story generator for comic books. Generate engaging panel descriptions that tell a compelling story with visual interest and emotional depth.`

    const messages: OllamaMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Context: ${context}\n\nUser request: ${userPrompt}\n\nGenerate 4-6 panel descriptions for this comic page.` }
    ]

    return this.generateText(model, messages, {
      temperature: 0.8,
      max_tokens: 1500
    })
  }

  async generateImagePrompt(
    model: string,
    panelDescription: string,
    styleConfig: {
      baseStyle: string
      loras?: string[]
      negativePrompt?: string
    }
  ): Promise<string> {
    const systemPrompt = `You are an expert prompt engineer for AI image generation.

Convert panel descriptions into detailed image prompts that include:
1. Subject and action
2. Composition and framing
3. Lighting and atmosphere
4. Style and aesthetic
5. Technical details for AI generation

Always include the base style and any LoRA triggers in the prompt.`

    const userPrompt = `Panel description: ${panelDescription}

Style configuration:
- Base style: ${styleConfig.baseStyle}
- LoRAs: ${styleConfig.loras?.join(', ') || 'none'}
- Negative prompt: ${styleConfig.negativePrompt || 'none'}

Generate a detailed image prompt for this panel.`

    const messages: OllamaMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]

    return this.generateText(model, messages, {
      temperature: 0.7,
      max_tokens: 500
    })
  }

  async analyzeGeneratedImage(
    model: string,
    imageUrl: string,
    originalPrompt: string
  ): Promise<{
    matchesPrompt: boolean
    quality: number
    issues: string[]
    suggestions: string[]
  }> {
    const systemPrompt = `You are an AI image quality analyst for comic generation.

Analyze the generated image and provide:
1. Does it match the prompt intent? (yes/no)
2. Quality score (1-10)
3. Any issues or problems
4. Suggestions for improvement

Be specific and constructive.`

    const userPrompt = `Original prompt: ${originalPrompt}

Please analyze this image and provide feedback according to the system instructions.

Respond in JSON format:
{
  "matchesPrompt": boolean,
  "quality": number,
  "issues": ["string"],
  "suggestions": ["string"]
}`

    // Note: This would need image input capability in Ollama
    // For now, return a placeholder
    return {
      matchesPrompt: true,
      quality: 8,
      issues: [],
      suggestions: []
    }
  }

  async isModelAvailable(model: string): Promise<boolean> {
    try {
      const models = await this.listModels()
      return models.some(m => m.name === model || m.model === model)
    } catch {
      return false
    }
  }

  async pullModel(model: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/pull`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
        },
        body: JSON.stringify({ name: model })
      })

      return response.ok
    } catch (error) {
      console.error('Error pulling model:', error)
      return false
    }
  }

  async getModelsByType(): Promise<{
    text: OllamaModel[]
    image: OllamaModel[]
  }> {
    const allModels = await this.listModels()
    
    const textModels = allModels.filter(model => 
      model.details.family.includes('llama') ||
      model.details.family.includes('mistral') ||
      model.details.family.includes('qwen') ||
      model.name.includes('text')
    )
    
    const imageModels = allModels.filter(model => 
      model.details.family.includes('llava') ||
      model.details.family.includes('vision') ||
      model.name.includes('vision') ||
      model.name.includes('image')
    )

    return { text: textModels, image: imageModels }
  }

  updateConfig(config: OllamaConfig): void {
    this.config = config
    this.baseUrl = config.baseUrl.replace(/\/$/, '')
  }
}
