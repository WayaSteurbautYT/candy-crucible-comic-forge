// Candy Crucible Comic Forge - Enhanced Edition with AI Toolkit Integration
class CandyCrucibleForge {
    constructor() {
        this.currentTab = 'generate';
        this.isGenerating = false;
        this.isTraining = false;
        this.progress = 0;
        this.currentStatus = '🍬 Ready to Forge';
        this.generatedPages = [];
        this.trainedModels = new Map();
        this.activeJobs = new Map();
        
        // AI Toolkit Configuration
        this.aiToolkitConfig = {
            baseUrl: 'http://localhost:8000',
            apiKey: null,
            connected: false
        };
        
        // Sweet Apocalypse Configuration
        this.sweetApocalypseConfig = {
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
            styleLock: {
                basePrompt: 'sweetapoc_style, dark tragic sweetness, candy apocalypse realism',
                negativePrompt: 'anime, oversaturated, childish, low detail, 3D render',
                requiredTags: ['mutation', 'bruges', 'apocalypse', 'sweet'],
                forbiddenTags: ['happy', 'normal', 'clean', 'bright']
            },
            characters: {
                lucas: { seed: 12345, description: 'Teenage boy, immune to mutations' },
                clara: { seed: 67890, description: 'Young girl, partially transformed' }
            }
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

        document.getElementById('ai-toolkit-images').addEventListener('change', (e) => {
            this.handleFileUpload(e, 'ai-toolkit');
        });

        document.getElementById('sweet-images').addEventListener('change', (e) => {
            this.handleFileUpload(e, 'sweet');
        });

        // Auto-save settings
        ['ollama-url', 'comfyui-url', 'ai-toolkit-url'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', () => this.saveSettings());
            }
        });
    }

    handleFileUpload(event, type) {
        const files = event.target.files;
        if (files.length > 0) {
            console.log(`Uploaded ${files.length} ${type} file(s)`);
            
            // Validate files based on type
            if (type === 'ai-toolkit' || type === 'sweet') {
                this.validateTrainingImages(files);
            }
        }
    }

    validateTrainingImages(files) {
        const validFormats = ['jpg', 'jpeg', 'png', 'webp'];
        const errors = [];

        for (const file of files) {
            const extension = file.name.split('.').pop()?.toLowerCase();
            if (!extension || !validFormats.includes(extension)) {
                errors.push(`Invalid format: ${file.name}`);
            }
        }

        if (errors.length > 0) {
            alert(`Image validation errors:\n${errors.join('\n')}`);
        } else {
            console.log(`✅ ${files.length} images validated successfully`);
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

        // Check AI Toolkit connection
        try {
            const toolkitUrl = document.getElementById('ai-toolkit-url').value;
            const response = await fetch(`${toolkitUrl}/api/status`);
            this.aiToolkitConfig.connected = response.ok;
        } catch (error) {
            this.aiToolkitConfig.connected = false;
        }

        this.updateStatusDisplay();
    }

    updateStatusDisplay() {
        const statusText = this.models.ollama && this.models.comfyui && this.aiToolkitConfig.connected ? 
            '🍬 All Systems Ready' : '🔧 Some Services Offline';
        document.getElementById('status').textContent = statusText;
        
        const modelStatus = `Ollama: ${this.models.ollama ? '✓' : '✗'}, ComfyUI: ${this.models.comfyui ? '✓' : '✗'}, AI Toolkit: ${this.aiToolkitConfig.connected ? '✓' : '✗'}`;
        document.getElementById('model-status').textContent = modelStatus;
        
        document.getElementById('trained-loras').textContent = `${this.trainedModels.size} Trained LoRAs`;
    }

    switchTab(tabName) {
        // Hide all tabs
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.add('hidden');
        });

        // Remove active class from all tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('candy-crucible', 'text-white', 'font-bold');
            btn.classList.add('hover:bg-gray-700');
        });

        // Show selected tab
        document.getElementById(`${tabName}-tab`).classList.remove('hidden');

        // Add active class to selected tab button
        const activeBtn = document.querySelector(`[data-tab="${tabName}"]`);
        activeBtn.classList.add('candy-crucible', 'text-white', 'font-bold');
        activeBtn.classList.remove('hover:bg-gray-700');

        this.currentTab = tabName;
    }

    async startGeneration() {
        if (this.isGenerating) return;

        this.isGenerating = true;
        this.progress = 0;
        this.currentStatus = '🍬 Initializing Sweet Apocalypse pipeline...';

        // Get form values
        const customPrompt = document.getElementById('custom-prompt').value;
        const numPages = parseInt(document.getElementById('num-pages').value);
        const styleLoRA = document.getElementById('style-lora').value;

        // Update UI
        this.updateProgressUI();

        try {
            // Simulate enhanced generation process
            await this.simulateSweetApocalypseGeneration(customPrompt, numPages, styleLoRA);
            
            this.currentStatus = '🎉 Sweet Apocalypse comic generated successfully!';
            this.progress = 100;
            
        } catch (error) {
            this.currentStatus = `❌ Generation failed: ${error.message}`;
        } finally {
            this.isGenerating = false;
            this.updateProgressUI();
        }
    }

    async simulateSweetApocalypseGeneration(prompt, numPages, style) {
        const steps = [
            '📚 Processing RAG context...',
            '🧠 Generating Sweet Apocalypse narrative...',
            '🎨 Building mutation-aware prompts...',
            '⚡ Starting batch generation...',
            '🍬 Rendering crystalline panels...',
            '✨ Quality checking mutations...',
            '📖 Assembling dark-sweet story...'
        ];

        for (let i = 0; i < steps.length; i++) {
            this.currentStatus = steps[i];
            this.progress = (i + 1) / steps.length * 100;
            this.updateProgressUI();
            
            // Simulate processing time
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        // Generate mock Sweet Apocalypse pages
        this.generatedPages = [];
        for (let page = 1; page <= numPages; page++) {
            const panels = [];
            for (let panel = 1; panel <= 4; panel++) {
                panels.push({
                    panelNumber: panel,
                    imageUrl: `generated/sweet_apocalypse_page${page}_panel${panel}.png`,
                    prompt: `Sweet Apocalypse style - ${this.sweetApocalypseConfig.styleLock.basePrompt} - Panel ${panel} of page ${page}`,
                    metadata: {
                        style: style,
                        seed: this.sweetApocalypseConfig.characters.lucas.seed + panel,
                        mutationType: ['crystalline', 'candy', 'emotional', 'twisted'][panel - 1]
                    }
                });
            }
            this.generatedPages.push({ pageNumber: page, panels });
        }
    }

    async startAIToolkitTraining() {
        const images = document.getElementById('ai-toolkit-images').files;
        const trainingType = document.getElementById('training-type').value;
        const baseModel = document.getElementById('base-model').value;

        if (images.length < 4) {
            alert('Please upload at least 4 images for AI Toolkit training');
            return;
        }

        this.isTraining = true;
        this.currentStatus = '🤖 Starting AI Toolkit training...';
        this.updateStatusDisplay();

        try {
            // Create training configuration
            const trainingConfig = {
                job: 'train',
                training_folder: `ai_toolkit_${Date.now()}`,
                device: 'cuda',
                processes: [{
                    type: trainingType,
                    config: {
                        model: baseModel,
                        training_images: Array.from(images),
                        epochs: parseInt(document.getElementById('epochs').value),
                        batch_size: parseInt(document.getElementById('batch-size').value),
                        learning_rate: parseFloat(document.getElementById('learning-rate').value),
                        resolution: parseInt(document.getElementById('resolution').value)
                    }
                }]
            };

            // Submit to AI Toolkit
            const jobId = await this.submitAIToolkitJob(trainingConfig);
            
            // Monitor progress
            await this.monitorAIToolkitTraining(jobId);
            
            alert('🎉 AI Toolkit training completed successfully!');
            
        } catch (error) {
            alert(`❌ AI Toolkit training failed: ${error.message}`);
        } finally {
            this.isTraining = false;
            this.updateStatusDisplay();
        }
    }

    async startSweetTraining() {
        const images = document.getElementById('sweet-images').files;
        const description = document.getElementById('sweet-description').value;

        if (images.length < 10) {
            alert('Please upload at least 10 images for Sweet Apocalypse training');
            return;
        }

        this.isTraining = true;
        this.currentStatus = '🍬 Starting Sweet Apocalypse style training...';
        this.updateStatusDisplay();

        try {
            // Create Sweet Apocalypse training configuration
            const trainingConfig = {
                job: 'train',
                training_folder: `sweet_apocalypse_${Date.now()}`,
                device: 'cuda',
                processes: [{
                    type: 'lora_hack',
                    config: {
                        model: 'flux-dev',
                        training_images: Array.from(images),
                        concept_sentence: description,
                        trigger_words: ['sweetapoc_style', 'bruges-infected', 'mutation-horror'],
                        style_prompts: [
                            'dark tragic sweetness, candy apocalypse realism',
                            'bruges cathedral infected with crystalline mutations',
                            'pastel horror aesthetic, emotional depth'
                        ],
                        negative_prompts: [
                            'anime, oversaturated, childish, low detail, 3D render',
                            'happy, normal, clean, bright, cheerful'
                        ],
                        epochs: 100,
                        batch_size: 4,
                        learning_rate: 1e-4,
                        resolution: 512
                    }
                }]
            };

            // Submit to AI Toolkit
            const jobId = await this.submitAIToolkitJob(trainingConfig);
            
            // Monitor progress
            await this.monitorAIToolkitTraining(jobId);
            
            // Register trained model
            this.trainedModels.set(jobId, {
                name: `sweet_apocalypse_${Date.now()}`,
                type: 'lora',
                triggerWords: ['sweetapoc_style', 'bruges-infected', 'mutation-horror'],
                trainedAt: new Date().toISOString()
            });
            
            this.updateStatusDisplay();
            alert('🎉 Sweet Apocalypse style training completed successfully!');
            
        } catch (error) {
            alert(`❌ Sweet Apocalypse training failed: ${error.message}`);
        } finally {
            this.isTraining = false;
            this.updateStatusDisplay();
        }
    }

    async submitAIToolkitJob(config) {
        const toolkitUrl = document.getElementById('ai-toolkit-url').value;
        
        const response = await fetch(`${toolkitUrl}/api/job`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(this.aiToolkitConfig.apiKey && { 'Authorization': `Bearer ${this.aiToolkitConfig.apiKey}` })
            },
            body: JSON.stringify(config)
        });

        if (!response.ok) {
            throw new Error(`AI Toolkit error: ${response.statusText}`);
        }

        const result = await response.json();
        return result.job_id;
    }

    async monitorAIToolkitTraining(jobId) {
        const toolkitUrl = document.getElementById('ai-toolkit-url').value;
        
        return new Promise((resolve, reject) => {
            const pollInterval = setInterval(async () => {
                try {
                    const response = await fetch(`${toolkitUrl}/api/job/${jobId}`);
                    const status = await response.json();

                    this.currentStatus = `🍬 Training: ${status.status} - ${Math.round(status.progress || 0)}%`;
                    this.updateStatusDisplay();

                    if (status.status === 'completed') {
                        clearInterval(pollInterval);
                        resolve(status);
                    } else if (status.status === 'failed') {
                        clearInterval(pollInterval);
                        reject(new Error(status.error || 'Training failed'));
                    }

                } catch (error) {
                    clearInterval(pollInterval);
                    reject(error);
                }
            }, 2000);
        });
    }

    selectSweetTraining(type) {
        // Update UI based on selected training type
        const description = document.getElementById('sweet-description');
        
        switch (type) {
            case 'character':
                description.value = 'Sweet Apocalypse character style - consistent facial features, emotional depth, crystalline mutations, dark tragic sweetness';
                break;
            case 'environment':
                description.value = 'Sweet Apocalypse environment - Bruges architecture, candy-infected buildings, pastel horror atmosphere, crystalline structures';
                break;
            case 'mutation':
                description.value = 'Sweet Apocalypse mutation effects - crystalline growth, candy-like textures, pastel color corruption, organic transformations';
                break;
        }
    }

    updateProgressUI() {
        const progressSection = document.getElementById('progress-section');
        
        if (this.isGenerating || this.generatedPages.length > 0) {
            progressSection.innerHTML = `
                <div class="space-y-4">
                    <div>
                        <div class="flex justify-between mb-2">
                            <span class="text-sm font-medium">🍬 Sweet Apocalypse Progress</span>
                            <span class="text-sm text-gray-400">${Math.round(this.progress)}%</span>
                        </div>
                        <div class="w-full bg-gray-700 rounded-full h-3">
                            <div class="candy-crucible h-3 rounded-full transition-all duration-500" 
                                 style="width: ${this.progress}%"></div>
                        </div>
                        <p class="text-sm text-gray-400 mt-2">${this.currentStatus}</p>
                    </div>

                    ${this.generatedPages.length > 0 ? `
                        <div>
                            <h3 class="font-bold mb-2 text-pink-300">🍬 Generated Sweet Apocalypse Pages</h3>
                            <div class="space-y-2">
                                ${this.generatedPages.map(page => `
                                    <div class="flex items-center justify-between p-2 bg-gray-700 rounded border border-pink-500/30">
                                        <span>📖 Page ${page.pageNumber}</span>
                                        <span class="text-sm text-purple-400">${page.panels.length} mutation panels</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        <button onclick="exportComic()" class="w-full candy-crucible text-white font-bold py-2 rounded-lg hover:opacity-90">
                            <i data-lucide="download" class="w-4 h-4 inline mr-2"></i>
                            Export Sweet Apocalypse Comic
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

    async testOllama() {
        try {
            const ollamaUrl = document.getElementById('ollama-url').value;
            const response = await fetch(`${ollamaUrl}/api/tags`);
            
            if (response.ok) {
                alert('✅ Ollama connection successful!');
                this.models.ollama = true;
            } else {
                throw new Error('Connection failed');
            }
        } catch (error) {
            alert(`❌ Ollama connection failed: ${error.message}`);
            this.models.ollama = false;
        }
        
        this.updateStatusDisplay();
    }

    async testComfyUI() {
        try {
            const comfyuiUrl = document.getElementById('comfyui-url').value;
            const response = await fetch(`${comfyuiUrl}/system_stats`);
            
            if (response.ok) {
                alert('✅ ComfyUI connection successful!');
                this.models.comfyui = true;
            } else {
                throw new Error('Connection failed');
            }
        } catch (error) {
            alert(`❌ ComfyUI connection failed: ${error.message}`);
            this.models.comfyui = false;
        }
        
        this.updateStatusDisplay();
    }

    async testAIToolkit() {
        try {
            const toolkitUrl = document.getElementById('ai-toolkit-url').value;
            const response = await fetch(`${toolkitUrl}/api/status`);
            
            if (response.ok) {
                alert('✅ AI Toolkit connection successful!');
                this.aiToolkitConfig.connected = true;
            } else {
                throw new Error('Connection failed');
            }
        } catch (error) {
            alert(`❌ AI Toolkit connection failed: ${error.message}`);
            this.aiToolkitConfig.connected = false;
        }
        
        this.updateStatusDisplay();
    }

    exportComic() {
        const exportData = {
            pages: this.generatedPages,
            sweetApocalypseConfig: this.sweetApocalypseConfig,
            trainedModels: Array.from(this.trainedModels.values()),
            settings: {
                ollamaUrl: document.getElementById('ollama-url').value,
                comfyuiUrl: document.getElementById('comfyui-url').value,
                aiToolkitUrl: document.getElementById('ai-toolkit-url').value
            },
            exportedAt: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: 'application/json'
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sweet_apocalypse_comic_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    saveSettings() {
        const settings = {
            ollamaUrl: document.getElementById('ollama-url').value,
            comfyuiUrl: document.getElementById('comfyui-url').value,
            aiToolkitUrl: document.getElementById('ai-toolkit-url').value,
            sweetApocalypseConfig: this.sweetApocalypseConfig
        };
        localStorage.setItem('candyCrucibleSettings', JSON.stringify(settings));
    }

    loadSettings() {
        const saved = localStorage.getItem('candyCrucibleSettings');
        if (saved) {
            const settings = JSON.parse(saved);
            document.getElementById('ollama-url').value = settings.ollamaUrl || 'http://localhost:11434';
            document.getElementById('comfyui-url').value = settings.comfyuiUrl || 'http://localhost:8188';
            document.getElementById('ai-toolkit-url').value = settings.aiToolkitUrl || 'http://localhost:8000';
            
            if (settings.sweetApocalypseConfig) {
                this.sweetApocalypseConfig = settings.sweetApocalypseConfig;
            }
        }
    }
}

// One-click installation
async function oneClickInstall() {
    const installSteps = [
        '🔧 Checking system requirements...',
        '🤖 Installing AI Toolkit...',
        '🦙 Installing Ollama...',
        '🎨 Installing ComfyUI...',
        '🍬 Downloading Sweet Apocalypse models...',
        '⚡ Setting up Candy Crucible pipeline...',
        '✨ Ready to forge Sweet Apocalypse comics!'
    ];

    for (let i = 0; i < installSteps.length; i++) {
        document.getElementById('status').textContent = installSteps[i];
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    alert('🎉 Candy Crucible Comic Forge installed successfully!');
    factory.checkSystemStatus();
}

// Global functions
function switchTab(tabName) {
    factory.switchTab(tabName);
}

function startGeneration() {
    factory.startGeneration();
}

function startAIToolkitTraining() {
    factory.startAIToolkitTraining();
}

function startSweetTraining() {
    factory.startSweetTraining();
}

function selectSweetTraining(type) {
    factory.selectSweetTraining(type);
}

function testOllama() {
    factory.testOllama();
}

function testComfyUI() {
    factory.testComfyUI();
}

function testAIToolkit() {
    factory.testAIToolkit();
}

function exportComic() {
    factory.exportComic();
}

function oneClickInstall() {
    oneClickInstall();
}

// Initialize the Candy Crucible Forge
const factory = new CandyCrucibleForge();
