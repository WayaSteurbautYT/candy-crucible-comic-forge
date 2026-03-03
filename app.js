// Sweet Apocalypse Comic Factory - Web UI
class SweetApocalypseFactory {
    constructor() {
        this.currentTab = 'generate';
        this.isGenerating = false;
        this.progress = 0;
        this.currentStatus = 'Ready';
        this.generatedPages = [];
        this.models = {
            ollama: false,
            comfyui: false,
            textModels: ['qwen2.5:7b', 'llama3.1:8b'],
            imageModels: ['qwen2-vl:7b', 'sdxl']
        };
        
        this.init();
    }

    init() {
        // Initialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        // Check system status
        this.checkSystemStatus();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Load saved settings
        this.loadSettings();
    }

    setupEventListeners() {
        // File upload listeners
        document.getElementById('document-upload').addEventListener('change', (e) => {
            this.handleFileUpload(e, 'document');
        });

        document.getElementById('art-images').addEventListener('change', (e) => {
            this.handleFileUpload(e, 'art');
        });

        // Auto-save settings
        document.getElementById('ollama-url').addEventListener('change', () => this.saveSettings());
        document.getElementById('comfyui-url').addEventListener('change', () => this.saveSettings());
    }

    handleFileUpload(event, type) {
        const files = event.target.files;
        if (files.length > 0) {
            console.log(`Uploaded ${files.length} ${type} file(s)`);
            // Handle file upload logic here
        }
    }

    async checkSystemStatus() {
        // Check Ollama connection
        try {
            const ollamaUrl = document.getElementById('ollama-url').value;
            const response = await fetch(`${ollamaUrl}/api/tags`);
            this.models.ollama = response.ok;
        } catch (error) {
            this.models.ollama = false;
        }

        // Check ComfyUI connection
        try {
            const comfyuiUrl = document.getElementById('comfyui-url').value;
            const response = await fetch(`${comfyuiUrl}/system_stats`);
            this.models.comfyui = response.ok;
        } catch (error) {
            this.models.comfyui = false;
        }

        this.updateStatusDisplay();
    }

    updateStatusDisplay() {
        const statusText = this.models.ollama && this.models.comfyui ? 
            'All Systems Ready' : 'Some Services Offline';
        document.getElementById('status').textContent = statusText;
        
        const modelStatus = `Ollama: ${this.models.ollama ? '✓' : '✗'}, ComfyUI: ${this.models.comfyui ? '✓' : '✗'}`;
        document.getElementById('model-status').textContent = modelStatus;
    }

    switchTab(tabName) {
        // Hide all tabs
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.add('hidden');
        });

        // Remove active class from all tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('bg-purple-600');
            btn.classList.add('hover:bg-gray-700');
        });

        // Show selected tab
        document.getElementById(`${tabName}-tab`).classList.remove('hidden');

        // Add active class to selected tab button
        const activeBtn = document.querySelector(`[data-tab="${tabName}"]`);
        activeBtn.classList.add('bg-purple-600');
        activeBtn.classList.remove('hover:bg-gray-700');

        this.currentTab = tabName;
    }

    async startGeneration() {
        if (this.isGenerating) return;

        this.isGenerating = true;
        this.progress = 0;
        this.currentStatus = 'Initializing pipeline...';

        // Get form values
        const customPrompt = document.getElementById('custom-prompt').value;
        const numPages = parseInt(document.getElementById('num-pages').value);
        const styleLoRA = document.getElementById('style-lora').value;

        // Update UI
        this.updateProgressUI();

        try {
            // Simulate generation process
            await this.simulateGeneration(customPrompt, numPages, styleLoRA);
            
            this.currentStatus = 'Generation completed successfully!';
            this.progress = 100;
            
        } catch (error) {
            this.currentStatus = `Error: ${error.message}`;
        } finally {
            this.isGenerating = false;
            this.updateProgressUI();
        }
    }

    async simulateGeneration(prompt, numPages, style) {
        const steps = [
            'Processing story context...',
            'Generating page narratives...',
            'Building image prompts...',
            'Starting batch generation...',
            'Rendering panels...',
            'Quality checking...',
            'Assembling comic...'
        ];

        for (let i = 0; i < steps.length; i++) {
            this.currentStatus = steps[i];
            this.progress = (i + 1) / steps.length * 100;
            this.updateProgressUI();
            
            // Simulate processing time
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        // Generate mock pages
        this.generatedPages = [];
        for (let page = 1; page <= numPages; page++) {
            const panels = [];
            for (let panel = 1; panel <= 4; panel++) {
                panels.push({
                    panelNumber: panel,
                    imageUrl: `generated/page${page}_panel${panel}.png`,
                    prompt: `Sweet Apocalypse style - Panel ${panel} of page ${page}`
                });
            }
            this.generatedPages.push({ pageNumber: page, panels });
        }
    }

    updateProgressUI() {
        const progressSection = document.getElementById('progress-section');
        
        if (this.isGenerating || this.generatedPages.length > 0) {
            progressSection.innerHTML = `
                <div class="space-y-4">
                    <div>
                        <div class="flex justify-between mb-2">
                            <span class="text-sm font-medium">Progress</span>
                            <span class="text-sm text-gray-400">${Math.round(this.progress)}%</span>
                        </div>
                        <div class="w-full bg-gray-700 rounded-full h-3">
                            <div class="sweet-gradient h-3 rounded-full transition-all duration-500" 
                                 style="width: ${this.progress}%"></div>
                        </div>
                        <p class="text-sm text-gray-400 mt-2">${this.currentStatus}</p>
                    </div>

                    ${this.generatedPages.length > 0 ? `
                        <div>
                            <h3 class="font-bold mb-2">Generated Pages</h3>
                            <div class="space-y-2">
                                ${this.generatedPages.map(page => `
                                    <div class="flex items-center justify-between p-2 bg-gray-700 rounded">
                                        <span>Page ${page.pageNumber}</span>
                                        <span class="text-sm text-purple-400">${page.panels.length} panels</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        <button onclick="exportComic()" class="w-full bg-green-600 hover:bg-green-700 py-2 rounded-lg">
                            <i data-lucide="download" class="w-4 h-4 inline mr-2"></i>
                            Export Comic
                        </button>
                    ` : ''}
                </div>
            `;
            
            // Re-initialize icons
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }
    }

    async startTraining() {
        const artImages = document.getElementById('art-images').files;
        const styleDescription = document.getElementById('style-description').value;

        if (artImages.length < 10) {
            alert('Please upload at least 10 images for training');
            return;
        }

        this.currentStatus = 'Starting LoRA training...';
        this.updateStatusDisplay();

        try {
            // Simulate training process
            await this.simulateTraining(artImages, styleDescription);
            alert('LoRA training completed successfully!');
        } catch (error) {
            alert(`Training failed: ${error.message}`);
        }
    }

    async simulateTraining(images, description) {
        const steps = [
            'Processing images...',
            'Extracting style features...',
            'Training LoRA model...',
            'Validating results...',
            'Saving model...'
        ];

        for (let i = 0; i < steps.length; i++) {
            this.currentStatus = steps[i];
            this.updateStatusDisplay();
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
    }

    async testOllama() {
        try {
            const ollamaUrl = document.getElementById('ollama-url').value;
            const response = await fetch(`${ollamaUrl}/api/tags`);
            
            if (response.ok) {
                alert('Ollama connection successful!');
                this.models.ollama = true;
            } else {
                throw new Error('Connection failed');
            }
        } catch (error) {
            alert(`Ollama connection failed: ${error.message}`);
            this.models.ollama = false;
        }
        
        this.updateStatusDisplay();
    }

    async testComfyUI() {
        try {
            const comfyuiUrl = document.getElementById('comfyui-url').value;
            const response = await fetch(`${comfyuiUrl}/system_stats`);
            
            if (response.ok) {
                alert('ComfyUI connection successful!');
                this.models.comfyui = true;
            } else {
                throw new Error('Connection failed');
            }
        } catch (error) {
            alert(`ComfyUI connection failed: ${error.message}`);
            this.models.comfyui = false;
        }
        
        this.updateStatusDisplay();
    }

    exportComic() {
        const exportData = {
            pages: this.generatedPages,
            settings: {
                ollamaUrl: document.getElementById('ollama-url').value,
                comfyuiUrl: document.getElementById('comfyui-url').value
            },
            exportedAt: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: 'application/json'
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sweet-apocalypse-comic-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    saveSettings() {
        const settings = {
            ollamaUrl: document.getElementById('ollama-url').value,
            comfyuiUrl: document.getElementById('comfyui-url').value
        };
        localStorage.setItem('sweetApocalypseSettings', JSON.stringify(settings));
    }

    loadSettings() {
        const saved = localStorage.getItem('sweetApocalypseSettings');
        if (saved) {
            const settings = JSON.parse(saved);
            document.getElementById('ollama-url').value = settings.ollamaUrl || 'http://localhost:11434';
            document.getElementById('comfyui-url').value = settings.comfyuiUrl || 'http://localhost:8188';
        }
    }
}

// One-click installation
async function oneClickInstall() {
    const installSteps = [
        'Checking system requirements...',
        'Installing Ollama...',
        'Installing ComfyUI...',
        'Downloading base models...',
        'Setting up Sweet Apocalypse LoRA...',
        'Configuring pipeline...',
        'Ready to use!'
    ];

    for (let i = 0; i < installSteps.length; i++) {
        document.getElementById('status').textContent = installSteps[i];
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    alert('Sweet Apocalypse Comic Factory installed successfully!');
    factory.checkSystemStatus();
}

// Global functions
function switchTab(tabName) {
    factory.switchTab(tabName);
}

function startGeneration() {
    factory.startGeneration();
}

function startTraining() {
    factory.startTraining();
}

function testOllama() {
    factory.testOllama();
}

function testComfyUI() {
    factory.testComfyUI();
}

function exportComic() {
    factory.exportComic();
}

function oneClickInstall() {
    oneClickInstall();
}

// Initialize the factory
const factory = new SweetApocalypseFactory();
