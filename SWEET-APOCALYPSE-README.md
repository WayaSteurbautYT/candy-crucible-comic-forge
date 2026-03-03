# 🍬 Sweet Apocalypse Issue Generator

**Enhanced AI Comic Factory with Hands-off Automation**

## 🎯 Overview

This is a comprehensive enhancement of the AI Comic Factory, specifically designed for generating Sweet Apocalypse comic issues with minimal user intervention. The system combines RAG context, batch processing, and user art style training to create a fully automated comic generation pipeline.

## 🧠 Core Architecture

### **3 Brains Working Together**

1. **Story Brain** - Qwen text models with RAG context
2. **Visual Brain** - Qwen image models + SweetApoc LoRA  
3. **Batch Engine** - ComfyUI queue automation

## 🚀 Key Features

### ✅ **Document Import System**
- **Supported Formats**: PDF, Markdown, DOCX, TXT
- **Smart Chunking**: Automatic scene/character/dialogue detection
- **Metadata Extraction**: Characters, themes, tone, setting
- **RAG Integration**: Context-aware story generation

### ✅ **RAG Context Memory**
- **Embedding System**: Semantic similarity matching
- **Canon Consistency**: Maintains story universe rules
- **Dynamic Retrieval**: Relevant context for each page
- **Character Tracking**: Consistent character behavior

### ✅ **Modular LoRA/Model System**
- **Hot-Swappable Models**: Qwen2.5, Llama3.1, Mixtral
- **LoRA Management**: Multiple style LoRAs with strength control
- **User Style Training**: Train custom art style LoRAs
- **Character Consistency**: Seed-based character preservation

### ✅ **Batch Generation Pipeline**
- **ComfyUI Integration**: Workflow-based image generation
- **Queue Management**: Batch processing with progress tracking
- **Quality Control**: Automated prompt optimization
- **Error Handling**: Retry and recovery mechanisms

### ✅ **Ollama Integration**
- **Local Models**: Full offline capability
- **Cloud Support**: Ollama cloud connectivity
- **Model Management**: Dynamic model loading
- **Fallback Systems**: Multiple provider options

## 🎨 Sweet Apocalypse Configuration

### **World-Building Rules**
```typescript
世界观: {
  setting: 'bruges-infected',     // Infected Bruges, Belgium
  tone: 'dark-sweet',            // Tragic yet beautiful
  mutationRules: [
    'candy-like crystallization',
    'pastel color corruption', 
    'emotional manifestation',
    'childhood innocence twisted'
  ]
}
```

### **Style Lock System**
```typescript
styleLock: {
  basePrompt: 'sweetapoc_style, dark tragic sweetness, candy apocalypse realism',
  negativePrompt: 'anime, oversaturated, childish, low detail, 3D render',
  requiredTags: ['mutation', 'bruges', 'apocalypse', 'sweet'],
  forbiddenTags: ['happy', 'normal', 'clean', 'bright']
}
```

### **Character Consistency**
```typescript
characterConsistency: {
  mainCharacters: [
    {
      name: 'Lucas',
      description: 'Teenage boy, immune to mutations',
      seed: 12345  // Fixed seed for consistency
    },
    {
      name: 'Clara', 
      description: 'Young girl, partially transformed',
      seed: 67890
    }
  ]
}
```

## 📁 Project Structure

```
src/
├── types/
│   └── enhanced-types.ts          # Extended type definitions
├── lib/enhanced/
│   ├── document-importer.ts       # PDF/MD/DOCX processing
│   ├── rag-system.ts             # RAG context management
│   ├── ollama-client.ts          # Ollama API integration
│   ├── comfyui-client.ts         # ComfyUI workflow management
│   ├── art-style-trainer.ts      # User art style training
│   └── sweet-apocalypse-pipeline.ts # Main automation pipeline
├── components/enhanced/
│   └── sweet-apocalypse-generator.tsx # Main UI component
```

## 🛠️ Installation & Setup

### **Prerequisites**
- Node.js 18+
- Ollama (local or cloud)
- ComfyUI (for image generation)
- AI Toolkit (for LoRA training)

### **Installation**
```bash
# Clone the enhanced repository
git clone https://github.com/your-username/ai-comic-factory-enhanced
cd ai-comic-factory-enhanced

# Install dependencies
npm install

# Start development server
npm run dev
```

### **Environment Configuration**
```bash
# .env.local
OLLAMA_BASE_URL=http://localhost:11434
COMFYUI_API_URL=http://localhost:8188
AI_TOOLKIT_API_URL=http://localhost:8000
```

## 🎯 Usage Guide

### **1. Document-Based Generation**
```typescript
// Upload your story document
const document = await documentImporter.importDocument(file, 'markdown')

// Generate issue with context
const result = await pipeline.generateIssue(document, undefined, 4)
```

### **2. Custom Prompt Generation**
```typescript
// Generate with custom prompt
const result = await pipeline.generateIssue(
  undefined,
  "Lucas discovers the source of the candy infection in the cathedral",
  6
)
```

### **3. User Art Style Training**
```typescript
// Train custom LoRA
const trainingData = await artStyleTrainer.prepareTrainingData(
  images, 
  "My dark fantasy art style",
  ["dark", "fantasy", "emotional"]
)

const modelPath = await artStyleTrainer.startTraining(trainingData, config)
```

## 🔧 Advanced Features

### **RAG Context Retrieval**
```typescript
// Get relevant story context
const context = await ragSystem.getContext(
  "Lucas emotional transformation",
  5  // Max chunks
)

// Search by character
const lucasScenes = await ragSystem.searchByCharacter("Lucas")
```

### **Batch Image Generation**
```typescript
// Generate multiple panels simultaneously
const batchJob: BatchGenerationJob = {
  panels: panelRequests,
  batchSize: 4
}

await comfyUIClient.batchGenerate(batchJob)
```

### **Quality Control Loop**
```typescript
// Analyze generated images
const analysis = await ollamaClient.analyzeGeneratedImage(
  'qwen2-vl:7b',
  imageUrl,
  originalPrompt
)

// Auto-regenerate if quality is low
if (analysis.quality < 7) {
  await regeneratePanel(panelRequest)
}
```

## 🎨 Sweet Apocalypse Workflow

### **Page Generation Pipeline**
1. **Context Retrieval** → RAG finds relevant story chunks
2. **Story Generation** → Qwen creates panel descriptions  
3. **Prompt Building** → Convert to image prompts with style tags
4. **Batch Processing** → ComfyUI generates all panels
5. **Quality Check** → Analyze and regenerate if needed
6. **Assembly** → Combine into final comic page

### **Automation Controls**
- **Canon Lock**: Enforces Sweet Apocalypse universe rules
- **Tone Lock**: Maintains dark-sweet aesthetic
- **Style Lock**: Ensures visual consistency
- **Character Lock**: Preserves character appearance

## 📊 Performance & Scaling

### **RTX 4060 Optimization**
- **Text Models**: Qwen2.5 7B (local)
- **Image Models**: Qwen2-VL 7B + LoRA
- **Batch Size**: 2-4 panels simultaneously
- **Memory Usage**: ~8-10GB VRAM

### **Quality vs Speed**
- **Fast Mode**: Turbo models, lower resolution
- **Quality Mode**: Full models, higher resolution  
- **Balanced Mode**: Mixed approach, best results

## 🔮 Future Enhancements

### **Planned Features**
- [ ] **Voice Integration**: Text-to-speech for dialogue
- [ ] **Animation**: Panel transition effects
- [ ] **Collaboration**: Multi-user story editing
- [ ] **Marketplace**: Share custom LoRAs and stories
- [ ] **Mobile App**: On-the-go comic generation

### **AI Improvements**
- [ ] **Self-Critique**: Advanced quality analysis
- [ ] **Style Transfer**: Automatic art style adaptation
- [ ] **Character Evolution**: Dynamic character development
- [ ] **World Building**: Automatic universe expansion

## 🤝 Contributing

### **Development Setup**
```bash
# Install development dependencies
npm install --dev

# Run tests
npm test

# Build for production
npm run build
```

### **Code Style**
- TypeScript strict mode
- ESLint + Prettier
- Component-based architecture
- Comprehensive error handling

## 📄 License

This project extends the original AI Comic Factory with enhanced automation capabilities. Please refer to the original license terms.

## 🙏 Acknowledgments

- **Original AI Comic Factory** - Base framework and inspiration
- **Ollama** - Local AI model hosting
- **ComfyUI** - Image generation workflows
- **Qwen Models** - Text and image generation
- **AI Toolkit** - LoRA training capabilities

---

## 🍬 **Sweet Apocalypse - Where Horror Meets Beauty**

*In the infected canals of Bruges, where candy crystallizes reality and childhood dreams become nightmares, a new kind of story awaits...*

**Generated with ❤️ by the Sweet Apocalypse Issue Generator**
