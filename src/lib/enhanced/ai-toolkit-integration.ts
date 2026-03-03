/**
 * AI Toolkit Integration for Candy Crucible Comic Forge
 * Sweet Apocalypse styled LoRA training and model management
 */

import { TrainingConfig, ArtStyleTrainingData, TrainingProgress } from '@/types/enhanced-types';
import { generateId } from '@/lib/enhanced/document-importer';

export interface AIToolkitConfig {
  baseUrl: string;
  apiKey?: string;
  defaultModel: string;
  supportedTrainingTypes: string[];
}

export interface AIToolkitJob {
  id: string;
  type: 'train' | 'extract' | 'generate' | 'mod';
  config: any;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  startedAt?: string;
  completedAt?: string;
  result?: any;
  error?: string;
}

export interface SweetApocalypseTrainingConfig extends TrainingConfig {
  // Sweet Apocalypse specific settings
  styleType: 'character' | 'environment' | 'mutation' | 'general';
  universeRules: {
    setting: string;
    tone: string;
    mutationRules: string[];
  };
  characterConsistency?: {
    characterName: string;
    seed: number;
    description: string;
  };
  qualityThreshold: number;
  autoValidation: boolean;
}

export class AIToolkitIntegration {
  private static instance: AIToolkitIntegration;
  private config: AIToolkitConfig;
  private activeJobs: Map<string, AIToolkitJob> = new Map();
  private trainedModels: Map<string, any> = new Map();

  static getInstance(config?: AIToolkitConfig): AIToolkitIntegration {
    if (!AIToolkitIntegration.instance) {
      AIToolkitIntegration.instance = new AIToolkitIntegration(config || {
        baseUrl: 'http://localhost:8000',
        defaultModel: 'flux-dev',
        supportedTrainingTypes: ['lora', 'fine-tune', 'textual-inversion']
      });
    }
    return AIToolkitIntegration.instance;
  }

  constructor(config: AIToolkitConfig) {
    this.config = config;
  }

  /**
   * Create Sweet Apocalypse styled training configuration
   */
  createSweetApocalypseTrainingConfig(
    styleType: string,
    images: File[],
    description: string
  ): SweetApocalypseTrainingConfig {
    return {
      // Base training config
      epochs: 100,
      batchSize: 4,
      learningRate: 1e-4,
      resolution: 512,
      steps: 1000,
      
      // Sweet Apocalypse specific
      styleType: styleType as any,
      universeRules: {
        setting: 'bruges-infected',
        tone: 'dark-sweet',
        mutationRules: [
          'candy-like crystallization',
          'pastel color corruption',
          'emotional manifestation',
          'childhood innocence twisted'
        ]
      },
      qualityThreshold: 0.7,
      autoValidation: true
    };
  }

  /**
   * Start training Sweet Apocalypse LoRA
   */
  async startSweetApocalypseTraining(
    trainingData: ArtStyleTrainingData,
    config: SweetApocalypseTrainingConfig
  ): Promise<string> {
    const jobId = generateId();
    
    // Prepare AI Toolkit job configuration
    const jobConfig = {
      job: 'train',
      training_folder: `sweet_apocalypse_${Date.now()}`,
      device: 'cuda',
      processes: [{
        type: 'lora_hack',
        config: {
          model: this.config.defaultModel,
          training_images: trainingData.images,
          concept_sentence: trainingData.description,
          trigger_words: this.generateSweetApocalypseTriggers(config.styleType),
          resolution: config.resolution,
          batch_size: config.batchSize,
          epochs: config.epochs,
          learning_rate: config.learningRate,
          steps: config.steps,
          // Sweet Apocalypse specific
          style_prompts: this.generateSweetApocalypsePrompts(config),
          negative_prompts: this.generateSweetApocalypseNegatives(),
          validation_prompts: this.generateValidationPrompts(config)
        }
      }]
    };

    // Create and track job
    const job: AIToolkitJob = {
      id: jobId,
      type: 'train',
      config: jobConfig,
      status: 'pending',
      progress: 0
    };

    this.activeJobs.set(jobId, job);

    // Start training
    this.executeTrainingJob(jobId, jobConfig);

    return jobId;
  }

  /**
   * Generate Sweet Apocalypse trigger words
   */
  private generateSweetApocalypseTriggers(styleType: string): string[] {
    const baseTriggers = ['sweetapoc_style', 'bruges-infected', 'mutation-horror'];
    
    switch (styleType) {
      case 'character':
        return [...baseTriggers, 'character-consistency', 'emotional-depth'];
      case 'environment':
        return [...baseTriggers, 'candy-architecture', 'pastel-horror'];
      case 'mutation':
        return [...baseTriggers, 'crystalline-mutation', 'sweet-decay'];
      default:
        return baseTriggers;
    }
  }

  /**
   * Generate Sweet Apocalypse style prompts
   */
  private generateSweetApocalypsePrompts(config: SweetApocalypseTrainingConfig): string[] {
    const basePrompts = [
      'dark tragic sweetness, candy apocalypse realism',
      'bruges cathedral infected with crystalline mutations',
      'pastel horror aesthetic, emotional depth'
    ];

    if (config.characterConsistency) {
      basePrompts.push(
        `${config.characterConsistency.characterName}, ${config.characterConsistency.description}`
      );
    }

    return basePrompts;
  }

  /**
   * Generate Sweet Apocalypse negative prompts
   */
  private generateSweetApocalypseNegatives(): string[] {
    return [
      'anime, oversaturated, childish, low detail, 3D render',
      'happy, normal, clean, bright, cheerful',
      'cartoon, illustration, drawing, painting'
    ];
  }

  /**
   * Generate validation prompts for quality checking
   */
  private generateValidationPrompts(config: SweetApocalypseTrainingConfig): string[] {
    return [
      'sweetapoc_style, bruges-infected, crystalline mutation, dark tragic sweetness',
      'character study, emotional depth, candy apocalypse realism',
      'environment shot, pastel horror, architectural mutation'
    ];
  }

  /**
   * Execute training job via AI Toolkit
   */
  private async executeTrainingJob(jobId: string, config: any): Promise<void> {
    const job = this.activeJobs.get(jobId);
    if (!job) return;

    try {
      // Update job status
      job.status = 'running';
      job.startedAt = new Date().toISOString();

      // Send job to AI Toolkit
      const response = await fetch(`${this.config.baseUrl}/api/job`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
        },
        body: JSON.stringify(config)
      });

      if (!response.ok) {
        throw new Error(`AI Toolkit error: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Start monitoring progress
      this.monitorJobProgress(jobId, result.job_id);

    } catch (error) {
      job.status = 'failed';
      job.error = (error as Error).message;
      job.completedAt = new Date().toISOString();
    }
  }

  /**
   * Monitor job progress
   */
  private async monitorJobProgress(jobId: string, toolkitJobId: string): Promise<void> {
    const job = this.activeJobs.get(jobId);
    if (!job) return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`${this.config.baseUrl}/api/job/${toolkitJobId}`);
        const status = await response.json();

        // Update progress
        job.progress = status.progress || 0;

        // Check if completed
        if (status.status === 'completed') {
          job.status = 'completed';
          job.progress = 100;
          job.completedAt = new Date().toISOString();
          job.result = status.result;
          
          // Register trained model
          this.registerTrainedModel(jobId, status.result);
          
          clearInterval(pollInterval);
        } else if (status.status === 'failed') {
          job.status = 'failed';
          job.error = status.error;
          job.completedAt = new Date().toISOString();
          
          clearInterval(pollInterval);
        }

      } catch (error) {
        console.error('Error monitoring job progress:', error);
      }
    }, 2000); // Poll every 2 seconds
  }

  /**
   * Register trained model
   */
  private registerTrainedModel(jobId: string, result: any): void {
    const modelInfo = {
      id: jobId,
      name: `sweet_apocalypse_${Date.now()}`,
      type: 'lora',
      path: result.model_path,
      triggerWords: result.trigger_words,
      trainedAt: new Date().toISOString(),
      quality: result.quality_score || 0.8
    };

    this.trainedModels.set(jobId, modelInfo);
  }

  /**
   * Get job status
   */
  getJobStatus(jobId: string): AIToolkitJob | null {
    return this.activeJobs.get(jobId) || null;
  }

  /**
   * Get all trained models
   */
  getTrainedModels(): Map<string, any> {
    return this.trainedModels;
  }

  /**
   * Cancel training job
   */
  async cancelJob(jobId: string): Promise<boolean> {
    const job = this.activeJobs.get(jobId);
    if (!job || job.status !== 'running') return false;

    try {
      await fetch(`${this.config.baseUrl}/api/job/${jobId}/cancel`, {
        method: 'POST'
      });

      job.status = 'failed';
      job.error = 'Cancelled by user';
      job.completedAt = new Date().toISOString();

      return true;
    } catch (error) {
      console.error('Error cancelling job:', error);
      return false;
    }
  }

  /**
   * Validate training data
   */
  async validateTrainingData(
    images: File[],
    description: string,
    styleType: string
  ): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Check image count
    if (images.length < 4) {
      errors.push('Minimum 4 images required for training');
    }
    if (images.length > 100) {
      errors.push('Maximum 100 images allowed for training');
    }

    // Check description
    if (!description || description.length < 10) {
      errors.push('Description must be at least 10 characters');
    }

    // Check image formats
    const validFormats = ['jpg', 'jpeg', 'png', 'webp'];
    for (const image of images) {
      const extension = image.name.split('.').pop()?.toLowerCase();
      if (!extension || !validFormats.includes(extension)) {
        errors.push(`Invalid image format: ${image.name}`);
      }
    }

    // Sweet Apocalypse specific validation
    if (styleType === 'character' && !description.toLowerCase().includes('character')) {
      errors.push('Character training should include character description');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Get training recommendations
   */
  getTrainingRecommendations(styleType: string): {
    recommendedImages: number;
    recommendedEpochs: number;
    tips: string[];
  } {
    const baseRecommendations = {
      recommendedImages: 20,
      recommendedEpochs: 100,
      tips: [
        'Use diverse images showing different angles and lighting',
        'Include both close-ups and full shots',
        'Maintain consistent style across all images',
        'Avoid images with text or watermarks'
      ]
    };

    switch (styleType) {
      case 'character':
        return {
          ...baseRecommendations,
          recommendedImages: 15,
          tips: [
            ...baseRecommendations.tips,
            'Include multiple expressions and poses',
            'Show character in different outfits if applicable',
            'Maintain consistent facial features'
          ]
        };
      case 'environment':
        return {
          ...baseRecommendations,
          recommendedImages: 25,
          tips: [
            ...baseRecommendations.tips,
            'Include various architectural elements',
            'Show different times of day if possible',
            'Include both interior and exterior shots'
          ]
        };
      case 'mutation':
        return {
          ...baseRecommendations,
          recommendedImages: 30,
          tips: [
            ...baseRecommendations.tips,
            'Show mutation progression stages',
            'Include detail shots of crystalline structures',
            'Demonstrate color variations'
          ]
        };
      default:
        return baseRecommendations;
    }
  }
}
