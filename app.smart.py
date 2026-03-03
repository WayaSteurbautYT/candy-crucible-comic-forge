#!/usr/bin/env python3
"""
Candy Crucible Comic Forge - Smart Web Application
Intelligent system detection, dependency management, and web interface
"""

import os
import sys
import json
import asyncio
import logging
from pathlib import Path
from typing import Dict, List, Optional
from datetime import datetime

# Add current directory to path
sys.path.insert(0, os.getcwd())

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Import our smart modules
from system_detector_fixed import SystemDetector
from dependency_manager import DependencyManager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class CandyCrucibleSmartApp:
    def __init__(self):
        self.app = FastAPI(
            title="Candy Crucible Comic Forge - Smart Edition",
            description="Intelligent AI comic generation with automatic system optimization",
            version="3.0.0"
        )
        
        self.setup_middleware()
        self.setup_routes()
        self.setup_static_files()
        
        # Initialize smart components
        self.system_detector = SystemDetector()
        self.dependency_manager = DependencyManager()
        
        # System info cache
        self.system_info = None
        self.dependency_status = None
        
        # Directories
        self.static_dir = Path("static")
        self.static_dir.mkdir(exist_ok=True)
        
        logger.info("🍬 Candy Crucible Smart App initialized")
    
    def setup_middleware(self):
        """Setup CORS and other middleware"""
        self.app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )
    
    def setup_routes(self):
        """Setup API routes"""
        
        @self.app.get("/", response_class=HTMLResponse)
        async def root():
            """Serve the smart web interface"""
            return self.get_smart_interface()
        
        @self.app.get("/api/system/detect")
        async def detect_system():
            """Complete system detection"""
            try:
                self.system_info = self.system_detector.detect_all()
                return self.system_info
            except Exception as e:
                raise HTTPException(status_code=500, detail=str(e))
        
        @self.app.get("/api/system/status")
        async def get_system_status():
            """Get current system status"""
            if self.system_info is None:
                self.system_info = self.system_detector.detect_all()
            return self.system_info
        
        @self.app.get("/api/dependencies/status")
        async def get_dependency_status():
            """Get all dependency status"""
            try:
                self.dependency_status = self.dependency_manager.check_all_dependencies()
                return self.dependency_status
            except Exception as e:
                raise HTTPException(status_code=500, detail=str(e))
        
        @self.app.post("/api/dependencies/install/{dep_name}")
        async def install_dependency(dep_name: str, background_tasks: BackgroundTasks):
            """Install a dependency"""
            background_tasks.add_task(self._install_dependency_task, dep_name)
            return {"status": "installation_started", "dependency": dep_name}
        
        @self.app.post("/api/dependencies/start/{dep_name}")
        async def start_service(dep_name: str):
            """Start a service"""
            try:
                result = self.dependency_manager.start_service(dep_name)
                return result
            except Exception as e:
                raise HTTPException(status_code=500, detail=str(e))
        
        @self.app.get("/api/config/optimal")
        async def get_optimal_config():
            """Get optimal configuration for detected system"""
            try:
                if self.system_info is None:
                    self.system_info = self.system_detector.detect_all()
                return self.system_detector.get_optimal_config()
            except Exception as e:
                raise HTTPException(status_code=500, detail=str(e))
        
        @self.app.get("/api/storage/info")
        async def get_storage_info():
            """Get storage information"""
            try:
                return self.dependency_manager.get_storage_info()
            except Exception as e:
                raise HTTPException(status_code=500, detail=str(e))
        
        @self.app.post("/api/storage/cleanup")
        async def cleanup_storage():
            """Clean up unused files"""
            try:
                return self.dependency_manager.cleanup_unused_files()
            except Exception as e:
                raise HTTPException(status_code=500, detail=str(e))
        
        @self.app.get("/api/health")
        async def health_check():
            """Health check endpoint"""
            return {
                "status": "healthy",
                "timestamp": datetime.now().isoformat(),
                "version": "3.0.0"
            }
    
    def setup_static_files(self):
        """Setup static file serving"""
        if self.static_dir.exists():
            self.app.mount("/static", StaticFiles(directory=str(self.static_dir)), name="static")
    
    async def _install_dependency_task(self, dep_name: str):
        """Background task for installing dependency"""
        try:
            def progress_callback(message):
                logger.info(f"Installation progress: {message}")
            
            result = self.dependency_manager.install_dependency(dep_name, progress_callback)
            logger.info(f"Installation result for {dep_name}: {result}")
        except Exception as e:
            logger.error(f"Installation failed for {dep_name}: {e}")
    
    def get_smart_interface(self) -> str:
        """Generate the smart web interface"""
        return """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🍬 Candy Crucible Comic Forge - Smart Edition</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
    <style>
        .gradient-bg {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .sweet-gradient {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        }
        .apocalypse-gradient {
            background: linear-gradient(135deg, #4a00e0 0%, #8e2de2 100%);
        }
        .candy-crucible {
            background: linear-gradient(135deg, #ff6b9d 0%, #c66cff 50%, #4ecdc4 100%);
        }
        .crystalline-effect {
            background: linear-gradient(45deg, rgba(255,107,157,0.1), rgba(198,108,255,0.1), rgba(78,205,196,0.1));
            backdrop-filter: blur(10px);
        }
        @keyframes pulse-glow {
            0%, 100% { box-shadow: 0 0 20px rgba(255,107,157,0.5); }
            50% { box-shadow: 0 0 40px rgba(198,108,255,0.8); }
        }
        .glow-effect {
            animation: pulse-glow 2s infinite;
        }
        .status-indicator {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            display: inline-block;
            margin-right: 8px;
        }
        .status-running { background-color: #10b981; }
        .status-installed { background-color: #3b82f6; }
        .status-missing { background-color: #ef4444; }
        .status-warning { background-color: #f59e0b; }
    </style>
</head>
<body class="bg-gray-900 text-white">
    <div id="app" class="min-h-screen">
        <!-- Header -->
        <header class="candy-crucible p-6 shadow-lg">
            <div class="container mx-auto">
                <h1 class="text-4xl font-bold flex items-center gap-3 glow-effect">
                    <span class="text-5xl">🍬</span>
                    Candy Crucible Comic Forge
                    <span class="text-5xl">🔥</span>
                </h1>
                <p class="text-purple-100 mt-2">Smart Edition - Automatic System Detection & Optimization</p>
                <div class="flex gap-4 mt-4">
                    <span class="bg-white/20 px-3 py-1 rounded-full text-sm">🧠 System Detection</span>
                    <span class="bg-white/20 px-3 py-1 rounded-full text-sm">⚡ Auto-Setup</span>
                    <span class="bg-white/20 px-3 py-1 rounded-full text-sm">🔧 Dependency Management</span>
                </div>
            </div>
        </header>

        <!-- Main Content -->
        <main class="container mx-auto p-6">
            <!-- System Status -->
            <div class="bg-gray-800 rounded-lg p-6 mb-6 crystalline-effect">
                <h2 class="text-2xl font-bold mb-4 flex items-center gap-2">
                    <i data-lucide="cpu" class="w-6 h-6 text-cyan-400"></i>
                    System Detection
                </h2>
                <div id="system-status" class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="bg-gray-700 rounded-lg p-4">
                        <h3 class="font-bold mb-2 text-cyan-300">GPU Information</h3>
                        <div id="gpu-info" class="text-sm">
                            <div class="animate-pulse">Detecting GPU...</div>
                        </div>
                    </div>
                    <div class="bg-gray-700 rounded-lg p-4">
                        <h3 class="font-bold mb-2 text-purple-300">Memory & Storage</h3>
                        <div id="memory-info" class="text-sm">
                            <div class="animate-pulse">Detecting memory...</div>
                        </div>
                    </div>
                    <div class="bg-gray-700 rounded-lg p-4">
                        <h3 class="font-bold mb-2 text-pink-300">Optimization</h3>
                        <div id="optimization-info" class="text-sm">
                            <div class="animate-pulse">Calculating optimizations...</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Dependencies -->
            <div class="bg-gray-800 rounded-lg p-6 mb-6 crystalline-effect">
                <h2 class="text-2xl font-bold mb-4 flex items-center gap-2">
                    <i data-lucide="package" class="w-6 h-6 text-purple-400"></i>
                    Dependency Management
                </h2>
                <div id="dependencies-status" class="space-y-3">
                    <div class="animate-pulse">Checking dependencies...</div>
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="bg-gray-800 rounded-lg p-6 mb-6 crystalline-effect">
                <h2 class="text-2xl font-bold mb-4 flex items-center gap-2">
                    <i data-lucide="zap" class="w-6 h-6 text-yellow-400"></i>
                    Quick Actions
                </h2>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <button onclick="detectSystem()" class="bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded-lg flex items-center gap-2">
                        <i data-lucide="search" class="w-4 h-4"></i>
                        Detect System
                    </button>
                    <button onclick="installAllDependencies()" class="bg-green-600 hover:bg-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
                        <i data-lucide="download" class="w-4 h-4"></i>
                        Install All
                    </button>
                    <button onclick="startAllServices()" class="bg-purple-600 hover:bg-purple-700 px-4 py-3 rounded-lg flex items-center gap-2">
                        <i data-lucide="play" class="w-4 h-4"></i>
                        Start Services
                    </button>
                    <button onclick="launchInterface()" class="candy-crucible text-white font-bold px-4 py-3 rounded-lg flex items-center gap-2">
                        <i data-lucide="rocket" class="w-4 h-4"></i>
                        Launch Interface
                    </button>
                </div>
            </div>

            <!-- Storage Info -->
            <div class="bg-gray-800 rounded-lg p-6 crystalline-effect">
                <h2 class="text-2xl font-bold mb-4 flex items-center gap-2">
                    <i data-lucide="hard-drive" class="w-6 h-6 text-green-400"></i>
                    Storage Management
                </h2>
                <div id="storage-info" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="animate-pulse">Checking storage...</div>
                </div>
            </div>
        </main>
    </div>

    <script>
        let systemInfo = null;
        let dependencyStatus = null;

        // Initialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        // Auto-detect on load
        window.addEventListener('load', () => {
            detectSystem();
        });

        async function detectSystem() {
            try {
                const response = await fetch('/api/system/detect');
                systemInfo = await response.json();
                updateSystemDisplay();
                await checkDependencies();
                await updateStorageInfo();
            } catch (error) {
                console.error('System detection failed:', error);
            }
        }

        function updateSystemDisplay() {
            if (!systemInfo) return;

            // GPU Info
            const gpuDiv = document.getElementById('gpu-info');
            if (systemInfo.gpu.error) {
                gpuDiv.innerHTML = `<div class="text-red-400">⚠️ ${systemInfo.gpu.error}</div>`;
            } else {
                gpuDiv.innerHTML = `
                    <div class="mb-2">
                        <span class="status-indicator status-installed"></span>
                        <strong>${systemInfo.gpu.name}</strong>
                    </div>
                    <div class="text-gray-300">
                        VRAM: ${systemInfo.gpu.vram_gb}GB (${systemInfo.gpu.memory_usage_percent}% used)<br>
                        Batch Size: ${systemInfo.recommendations.optimization.batch_size || 1}<br>
                        Resolution: ${systemInfo.recommendations.optimization.resolution || '512'}px
                    </div>
                `;
            }

            // Memory Info
            const memoryDiv = document.getElementById('memory-info');
            memoryDiv.innerHTML = `
                <div class="mb-2">
                    <span class="status-indicator ${systemInfo.system.ram_usage_percent > 80 ? 'status-warning' : 'status-installed'}"></span>
                    RAM: ${systemInfo.system.ram_total_gb}GB (${systemInfo.system.ram_usage_percent}% used)
                </div>
                <div class="text-gray-300">
                    Available: ${systemInfo.system.ram_available_gb}GB<br>
                    Disk: ${systemInfo.system.disk_available_gb}GB free
                </div>
            `;

            // Optimization Info
            const optDiv = document.getElementById('optimization-info');
            const warnings = systemInfo.recommendations.warnings || [];
            const suggestions = systemInfo.recommendations.suggestions || [];
            
            optDiv.innerHTML = `
                <div class="mb-2">
                    <span class="status-indicator ${warnings.length > 0 ? 'status-warning' : 'status-installed'}"></span>
                    ${warnings.length > 0 ? warnings.length + ' Warnings' : 'Optimized'}
                </div>
                <div class="text-gray-300 text-sm">
                    ${warnings.length > 0 ? warnings[0] : 'System ready for AI workloads'}
                </div>
            `;
        }

        async function checkDependencies() {
            try {
                const response = await fetch('/api/dependencies/status');
                dependencyStatus = await response.json();
                updateDependencyDisplay();
            } catch (error) {
                console.error('Dependency check failed:', error);
            }
        }

        function updateDependencyDisplay() {
            const depDiv = document.getElementById('dependencies-status');
            if (!dependencyStatus) return;

            let html = '';
            for (const [name, status] of Object.entries(dependencyStatus)) {
                const statusClass = status.running ? 'status-running' : 
                                   status.installed ? 'status-installed' : 'status-missing';
                
                html += `
                    <div class="bg-gray-700 rounded-lg p-4 flex items-center justify-between">
                        <div class="flex items-center">
                            <span class="status-indicator ${statusClass}"></span>
                            <div>
                                <div class="font-bold">${status.name}</div>
                                <div class="text-sm text-gray-300">
                                    ${status.running ? 'Running' : status.installed ? 'Installed' : 'Not Installed'}
                                    ${status.version ? ` (${status.version})` : ''}
                                </div>
                            </div>
                        </div>
                        <div class="flex gap-2">
                            ${!status.installed ? `
                                <button onclick="installDependency('${name}')" class="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm">
                                    Install
                                </button>
                            ` : ''}
                            ${status.installed && !status.running ? `
                                <button onclick="startService('${name}')" class="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm">
                                    Start
                                </button>
                            ` : ''}
                        </div>
                    </div>
                `;
            }
            depDiv.innerHTML = html;
        }

        async function updateStorageInfo() {
            try {
                const response = await fetch('/api/storage/info');
                const storageInfo = await response.json();
                
                const storageDiv = document.getElementById('storage-info');
                storageDiv.innerHTML = `
                    <div class="bg-gray-700 rounded-lg p-4">
                        <h3 class="font-bold mb-2">Storage Usage</h3>
                        <div class="text-sm">
                            Available: ${storageInfo.available_gb}GB<br>
                            ${storageInfo.candy_crucible_size_gb ? `Candy Crucible: ${storageInfo.candy_crucible_size_gb}GB` : ''}
                        </div>
                    </div>
                    ${storageInfo.recommended_cleanup ? `
                        <div class="bg-gray-700 rounded-lg p-4">
                            <h3 class="font-bold mb-2 text-yellow-400">Cleanup Recommended</h3>
                            <button onclick="cleanupStorage()" class="bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded text-sm">
                                Cleanup Files
                            </button>
                        </div>
                    ` : ''}
                `;
            } catch (error) {
                console.error('Storage info failed:', error);
            }
        }

        async function installDependency(depName) {
            try {
                const response = await fetch(`/api/dependencies/install/${depName}`, { method: 'POST' });
                const result = await response.json();
                
                if (result.status === 'installation_started') {
                    // Show installation progress
                    alert(`Installing ${depName}. This may take a few minutes...`);
                    // Poll for status updates
                    setTimeout(() => {
                        checkDependencies();
                    }, 5000);
                }
            } catch (error) {
                console.error('Installation failed:', error);
                alert('Installation failed. Check console for details.');
            }
        }

        async function startService(serviceName) {
            try {
                const response = await fetch(`/api/dependencies/start/${serviceName}`, { method: 'POST' });
                const result = await response.json();
                
                if (result.success) {
                    alert(`${serviceName} started successfully!`);
                    checkDependencies();
                } else {
                    alert(`Failed to start ${serviceName}: ${result.error}`);
                }
            } catch (error) {
                console.error('Service start failed:', error);
                alert('Service start failed. Check console for details.');
            }
        }

        async function installAllDependencies() {
            if (!dependencyStatus) {
                await checkDependencies();
            }
            
            for (const [name, status] of Object.entries(dependencyStatus)) {
                if (!status.installed) {
                    await installDependency(name);
                    // Wait a bit between installations
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
            }
        }

        async function startAllServices() {
            if (!dependencyStatus) {
                await checkDependencies();
            }
            
            for (const [name, status] of Object.entries(dependencyStatus)) {
                if (status.installed && !status.running) {
                    await startService(name);
                    // Wait a bit between service starts
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
            }
        }

        async function cleanupStorage() {
            try {
                const response = await fetch('/api/storage/cleanup', { method: 'POST' });
                const result = await response.json();
                
                if (result.success) {
                    alert(`Cleanup completed! Freed ${result.cleaned_size_gb}GB`);
                    updateStorageInfo();
                } else {
                    alert(`Cleanup failed: ${result.error}`);
                }
            } catch (error) {
                console.error('Cleanup failed:', error);
                alert('Cleanup failed. Check console for details.');
            }
        }

        function launchInterface() {
            // Open the main Candy Crucible interface
            window.open('/index.enhanced.html', '_blank');
        }

        // Refresh status every 30 seconds
        setInterval(() => {
            if (dependencyStatus) {
                checkDependencies();
            }
        }, 30000);
    </script>
</body>
</html>
        """

def create_app():
    """Create and configure the FastAPI app"""
    return CandyCrucibleSmartApp().app

if __name__ == "__main__":
    # Run the smart server
    app = create_app()
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8080,
        log_level="info"
    )
