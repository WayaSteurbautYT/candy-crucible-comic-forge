# 🍬 Sweet Apocalypse Comic Factory - Web Edition

**One-Click Install Web UI for Local & Cloud Deployment**

## 🚀 Quick Start

### **Option 1: One-Click Install (Recommended)**
```bash
# Run the Pinokio-style installer
python app.py
```

### **Option 2: Manual Setup**
```bash
# Install dependencies
pip install -r requirements.txt

# Start the web server
python server.py
```

Open your browser to **http://localhost:8080**

## 🎯 Features

### **🖥️ Web Interface**
- **Modern UI**: Beautiful dark theme with purple/pink gradients
- **Tabbed Interface**: Organized workflow (Generate, Train, Models, Settings)
- **Real-time Progress**: Live generation status and progress bars
- **File Upload**: Drag & drop document and image uploads
- **One-Click Install**: Pinokio-style automatic setup

### **🧠 AI Capabilities**
- **RAG Context**: Story consistency with semantic search
- **LoRA Training**: Train custom art styles from your images
- **Batch Generation**: Process multiple panels simultaneously
- **Quality Control**: Automated validation and retry

### **🔧 Integration**
- **Ollama**: Local text model hosting
- **ComfyUI**: Professional image generation workflows
- **Multiple Models**: Qwen2.5, Llama3.1, SDXL support
- **Cloud Ready**: Deploy to Hugging Face or Replicate

## 📁 Project Structure

```
Sweet-Apocalypse-Factory/
├── index.html              # Main web interface
├── app.js                  # Frontend JavaScript
├── server.py               # FastAPI backend
├── app.py                  # Pinokio-style installer
├── requirements.txt        # Python dependencies
├── Dockerfile.web          # Web deployment container
└── README-WEB.md          # This file
```

## 🛠️ Installation

### **System Requirements**
- **OS**: Windows 10+, macOS 10.15+, Linux (Ubuntu 20.04+)
- **Python**: 3.8 or higher
- **GPU**: RTX 3060+ recommended (8GB+ VRAM)
- **RAM**: 16GB+ recommended
- **Storage**: 50GB+ free space

### **One-Click Installation**
1. Download the repository
2. Run `python app.py`
3. Click "🚀 One-Click Install"
4. Wait for automatic setup
5. Click "🎮 Launch Web UI"

### **What Gets Installed**
- **Ollama**: Local AI model server
- **ComfyUI**: Image generation interface
- **Base Models**: Qwen2.5 7B, Qwen2-VL 7B
- **Sweet Apocalypse LoRA**: Pre-trained style model
- **Dependencies**: All required Python packages

## 🎨 Usage Guide

### **Generate Comic Issue**
1. **Upload Document** (Optional): PDF, Markdown, DOCX, or TXT
2. **Enter Custom Prompt** (Optional): Your story idea
3. **Configure Settings**: Pages, style, models
4. **Click Generate**: Watch real-time progress
5. **Export Results**: Download complete comic

### **Train Custom LoRA**
1. **Upload Art Images**: 10-100 images of your style
2. **Describe Style**: Text description of your art
3. **Start Training**: Automated LoRA creation
4. **Use in Generation**: Select your custom LoRA

### **Model Management**
- **Text Models**: Qwen2.5, Llama3.1, Mixtral
- **Image Models**: Qwen2-VL, SDXL, Stable Diffusion
- **LoRAs**: Sweet Apocalypse, user-trained styles
- **Connection Testing**: Verify Ollama & ComfyUI

## 🌐 Deployment Options

### **Local Deployment**
```bash
python server.py
# Access at http://localhost:8080
```

### **Docker Deployment**
```bash
docker build -f Dockerfile.web -t sweet-apocalypse-factory .
docker run -p 8080:8080 sweet-apocalypse-factory
```

### **Hugging Face Spaces**
```bash
# Deploy to Hugging Face
python deploy_huggingface.py
```

### **Replicate**
```bash
# Deploy to Replicate
python deploy_replicate.py
```

## 🎛️ API Endpoints

### **Core Endpoints**
- `GET /` - Web interface
- `GET /api/status` - System status
- `POST /api/install` - One-click install
- `POST /api/generate` - Generate comic
- `POST /api/train` - Train LoRA
- `GET /api/models` - Available models

### **Utility Endpoints**
- `POST /api/test/ollama` - Test Ollama connection
- `POST /api/test/comfyui` - Test ComfyUI connection
- `GET /api/job/{job_id}` - Job status
- `GET /api/export/{job_id}` - Export comic

## 🔧 Configuration

### **Environment Variables**
```bash
OLLAMA_URL=http://localhost:11434
COMFYUI_URL=http://localhost:8188
```

### **Web UI Settings**
- **Ollama URL**: Configure Ollama server
- **ComfyUI URL**: Configure ComfyUI server
- **Model Selection**: Choose text/image models
- **LoRA Settings**: Style model configuration

## 🎨 Sweet Apocalypse Universe

### **World-Building**
- **Setting**: Bruges, Belgium infected by candy mutations
- **Tone**: Dark tragic sweetness with horror elements
- **Characters**: Lucas (immune teen), Clara (transformed girl)
- **Style**: Pastel horror, crystalline mutations

### **Generation Rules**
- **Canon Lock**: Enforces universe consistency
- **Tone Lock**: Maintains dark-sweet aesthetic
- **Character Lock**: Preserves appearance and behavior
- **Style Lock**: Ensures visual consistency

## 🚀 Advanced Features

### **RAG System**
- **Semantic Search**: Find relevant story context
- **Character Tracking**: Maintain consistent behavior
- **World Building**: Preserve universe rules
- **Dynamic Retrieval**: Context for each page

### **Batch Processing**
- **Queue Management**: Handle multiple requests
- **Progress Tracking**: Real-time status updates
- **Error Recovery**: Automatic retry mechanisms
- **Quality Control**: Validate and regenerate

### **LoRA Training**
- **Style Extraction**: Analyze art patterns
- **Feature Learning**: Train on user images
- **Model Validation**: Quality assessment
- **Easy Integration**: Use in generation

## 📊 Performance

### **Hardware Requirements**
- **Minimum**: RTX 3060, 8GB VRAM, 16GB RAM
- **Recommended**: RTX 4060+, 12GB+ VRAM, 32GB+ RAM
- **Storage**: 50GB+ for models and outputs

### **Generation Speed**
- **Text Generation**: ~2-5 seconds per page
- **Image Generation**: ~10-30 seconds per panel
- **Full Issue**: ~5-15 minutes for 4-page comic
- **Batch Processing**: 2-4 panels simultaneously

## 🔮 Future Updates

### **Planned Features**
- [ ] **Voice Integration**: Text-to-speech for dialogue
- [ ] **Animation**: Panel transition effects
- [ ] **Collaboration**: Multi-user editing
- [ ] **Marketplace**: Share LoRAs and stories
- [ ] **Mobile App**: On-the-go generation

### **Technical Improvements**
- [ ] **Self-Critique**: Advanced quality analysis
- [ ] **Style Transfer**: Automatic adaptation
- [ ] **Character Evolution**: Dynamic development
- [ ] **Performance**: Optimized batch processing

## 🤝 Contributing

### **Development Setup**
```bash
# Clone repository
git clone https://github.com/your-username/sweet-apocalypse-factory
cd sweet-apocalypse-factory

# Install dependencies
pip install -r requirements.txt

# Run development server
python server.py --dev
```

### **Code Style**
- **Python**: Black, flake8, type hints
- **JavaScript**: ESLint, Prettier
- **HTML/CSS**: Tailwind CSS classes
- **Documentation**: Clear comments and README

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- **AI Comic Factory**: Original framework inspiration
- **Ollama**: Local AI model hosting
- **ComfyUI**: Image generation workflows
- **FastAPI**: Modern Python web framework
- **Tailwind CSS**: Utility-first CSS framework

---

## 🍬 **Ready to Create Your Sweet Apocalypse?**

**Start the installer, click "One-Click Install", and begin generating your dark, beautiful comic universe!**

*Where candy meets horror, and stories come to life with AI...*
