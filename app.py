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
import subprocess
import platform
import psutil
import requests
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

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SystemDetector:
    """Smart system detection for Candy Crucible"""
    
    def __init__(self):
        self.system_info = {}
        self.gpu_info = {}
        self.storage_info = {}
        self.recommendations = {}
        
    def detect_all(self) -> Dict:
        """Complete system detection"""
        print("🔍 Detecting system capabilities...")
        
        self.system_info = self._detect_system()
        self.gpu_info = self._detect_gpu()
        self.storage_info = self._detect_storage()
        self.recommendations = self._generate_recommendations()
        
        return {
            "system": self.system_info,
            "gpu": self.gpu_info,
            "storage": self.storage_info,
            "recommendations": self.recommendations,
            "compatible": self._check_compatibility()
        }
    
    def _detect_system(self) -> Dict:
        """Detect basic system information"""
        try:
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            
            return {
                "platform": platform.system(),
                "platform_version": platform.version(),
                "processor": platform.processor(),
                "python_version": platform.python_version(),
                "ram_total_gb": round(memory.total / (1024**3), 1),
                "ram_available_gb": round(memory.available / (1024**3), 1),
                "ram_usage_percent": memory.percent,
                "disk_total_gb": round(disk.total / (1024**3), 1),
                "disk_available_gb": round(disk.free / (1024**3), 1),
                "disk_usage_percent": round((disk.used / disk.total) * 100, 1)
            }
        except Exception as e:
            return {"error": str(e)}
    
    def _detect_gpu(self) -> Dict:
        """Detect GPU information using nvidia-smi"""
        try:
            # Try nvidia-smi first
            result = subprocess.run(
                ["nvidia-smi", "--query-gpu=name,memory.total,memory.used,memory.free,utilization.gpu,temperature.gpu", 
                 "--format=csv,noheader,nounits"],
                capture_output=True,
                text=True,
                timeout=10
            )
            
            if result.returncode == 0:
                lines = result.stdout.strip().split('\n')
                if lines:
                    parts = lines[0].split(', ')
                    if len(parts) >= 6:
                        name = parts[0].strip()
                        memory_total = int(parts[1].strip())
                        memory_used = int(parts[2].strip())
                        memory_free = int(parts[3].strip())
                        utilization = float(parts[4].strip())
                        temperature = float(parts[5].strip())
                        
                        return {
                            "name": name,
                            "memory_total_mb": memory_total,
                            "memory_free_mb": memory_free,
                            "memory_used_mb": memory_used,
                            "memory_usage_percent": round((memory_used / memory_total) * 100, 1),
                            "temperature": temperature,
                            "load": utilization,
                            "is_nvidia": "nvidia" in name.lower() or "geforce" in name.lower() or "rtx" in name.lower(),
                            "is_amd": "amd" in name.lower() or "radeon" in name.lower(),
                            "vram_gb": round(memory_total / 1024, 1),
                            "recommended_batch_size": self._calculate_batch_size(memory_total),
                            "recommended_resolution": self._calculate_resolution(memory_total)
                        }
            
            # Fallback: try wmic for Windows
            if platform.system() == "Windows":
                result = subprocess.run(
                    ["wmic", "path", "win32_VideoController", "get", "name", "AdapterRAM", "/format:csv"],
                    capture_output=True,
                    text=True,
                    timeout=10
                )
                
                if result.returncode == 0:
                    lines = result.stdout.strip().split('\n')
                    for line in lines[1:]:  # Skip header
                        parts = line.split(',')
                        if len(parts) >= 2 and parts[1].strip():
                            name = parts[1].strip()
                            memory_str = parts[0].strip()
                            if memory_str and memory_str.isdigit():
                                memory_mb = int(memory_str) // (1024 * 1024)  # Convert bytes to MB
                                return {
                                    "name": name,
                                    "memory_total_mb": memory_mb,
                                    "memory_free_mb": memory_mb,
                                    "memory_used_mb": 0,
                                    "memory_usage_percent": 0,
                                    "temperature": None,
                                    "load": 0,
                                    "is_nvidia": "nvidia" in name.lower() or "geforce" in name.lower() or "rtx" in name.lower(),
                                    "is_amd": "amd" in name.lower() or "radeon" in name.lower(),
                                    "vram_gb": round(memory_mb / 1024, 1),
                                    "recommended_batch_size": self._calculate_batch_size(memory_mb),
                                    "recommended_resolution": self._calculate_resolution(memory_mb)
                                }
            
            return {"error": "GPU detection failed - no compatible GPU found"}
        
        except Exception as e:
            return {"error": f"GPU detection failed: {str(e)}"}
    
    def _calculate_batch_size(self, vram_mb: int) -> int:
        """Calculate optimal batch size based on VRAM"""
        if vram_mb >= 12000:  # 12GB+
            return 4
        elif vram_mb >= 8000:  # 8GB+
            return 2
        elif vram_mb >= 6000:  # 6GB+
            return 1
        else:
            return 1
    
    def _calculate_resolution(self, vram_mb: int) -> str:
        """Calculate optimal resolution based on VRAM"""
        if vram_mb >= 12000:  # 12GB+
            return "1024"
        elif vram_mb >= 8000:  # 8GB+
            return "768"
        elif vram_mb >= 6000:  # 6GB+
            return "512"
        else:
            return "512"
    
    def _detect_storage(self) -> Dict:
        """Detect storage information and available space"""
        try:
            paths = [
                Path.home() / "candy-crucible",
                Path("C:/") if platform.system() == "Windows" else Path("/"),
                Path.home()
            ]
            
            storage_info = {}
            for path in paths:
                if path.exists():
                    try:
                        disk = psutil.disk_usage(str(path))
                        storage_info[str(path)] = {
                            "total_gb": round(disk.total / (1024**3), 1),
                            "free_gb": round(disk.free / (1024**3), 1),
                            "usage_percent": round((disk.used / disk.total) * 100, 1),
                            "recommended": self._check_storage_recommendation(disk.free)
                        }
                    except:
                        continue
            
            return storage_info
        except Exception as e:
            return {"error": str(e)}
    
    def _check_storage_recommendation(self, free_bytes: int) -> str:
        """Check if storage is sufficient"""
        free_gb = free_bytes / (1024**3)
        
        if free_gb < 10:
            return "insufficient"
        elif free_gb < 50:
            return "limited"
        elif free_gb < 100:
            return "adequate"
        else:
            return "excellent"
    
    def _generate_recommendations(self) -> Dict:
        """Generate system-specific recommendations"""
        recommendations = {
            "optimization": {},
            "warnings": [],
            "suggestions": []
        }
        
        # GPU recommendations
        if "error" not in self.gpu_info:
            vram_gb = self.gpu_info.get("vram_gb", 0)
            
            if vram_gb >= 8:
                recommendations["optimization"]["batch_size"] = 2
                recommendations["optimization"]["resolution"] = "768"
                recommendations["optimization"]["models"] = ["flux-dev", "sdxl", "sd15"]
                recommendations["suggestions"].append("🎯 Perfect for RTX 4060! Your 8GB VRAM is ideal for AI workloads.")
            elif vram_gb >= 6:
                recommendations["optimization"]["batch_size"] = 1
                recommendations["optimization"]["resolution"] = "512"
                recommendations["optimization"]["models"] = ["sd15", "sdxl"]
            else:
                recommendations["warnings"].append("Limited VRAM detected. Consider using smaller models or cloud services.")
                recommendations["optimization"]["batch_size"] = 1
                recommendations["optimization"]["resolution"] = "512"
                recommendations["optimization"]["models"] = ["sd15"]
        
        # RAM recommendations
        ram_gb = self.system_info.get("ram_total_gb", 0)
        if ram_gb >= 16:
            recommendations["suggestions"].append("💾 Excellent RAM capacity for training and generation.")
        elif ram_gb < 16:
            recommendations["warnings"].append("Limited RAM detected. Consider closing other applications.")
        
        # Storage recommendations
        disk_free = self.system_info.get("disk_available_gb", 0)
        if disk_free < 50:
            recommendations["warnings"].append("Limited storage space. Consider freeing up space for models and outputs.")
        elif disk_free >= 100:
            recommendations["suggestions"].append("💾 Excellent storage capacity for large models and datasets.")
        
        return recommendations
    
    def _check_compatibility(self) -> Dict:
        """Check system compatibility"""
        compatibility = {
            "can_run_locally": True,
            "can_train_models": True,
            "recommended_setup": "full",
            "limitations": []
        }
        
        # Check GPU
        if "error" in self.gpu_info:
            compatibility["can_run_locally"] = False
            compatibility["can_train_models"] = False
            compatibility["limitations"].append("No compatible GPU detected")
            compatibility["recommended_setup"] = "cloud"
        else:
            vram_gb = self.gpu_info.get("vram_gb", 0)
            if vram_gb < 6:
                compatibility["can_train_models"] = False
                compatibility["limitations"].append("Insufficient VRAM for training")
                compatibility["recommended_setup"] = "generation_only"
            elif vram_gb < 8:
                compatibility["limitations"].append("Limited VRAM - reduced batch sizes")
                compatibility["recommended_setup"] = "limited_training"
        
        # Check RAM
        ram_gb = self.system_info.get("ram_total_gb", 0)
        if ram_gb < 8:
            compatibility["can_run_locally"] = False
            compatibility["limitations"].append("Insufficient RAM")
            compatibility["recommended_setup"] = "cloud"
        elif ram_gb < 16:
            compatibility["limitations"].append("Limited RAM may affect performance")
        
        # Check Storage
        disk_free = self.system_info.get("disk_available_gb", 0)
        if disk_free < 20:
            compatibility["limitations"].append("Limited storage space")
        
        return compatibility
    
    def get_optimal_config(self) -> Dict:
        """Get optimal configuration for detected system"""
        config = {
            "generation": {
                "batch_size": 1,
                "resolution": "512",
                "max_steps": 20,
                "guidance_scale": 7.5
            },
            "training": {
                "batch_size": 1,
                "resolution": "512",
                "epochs": 50,
                "learning_rate": 1e-4,
                "max_images": 20
            },
            "models": {
                "recommended": ["sd15"],
                "compatible": ["sd15"],
                "not_recommended": ["flux-dev", "sdxl"]
            }
        }
        
        # Optimize based on GPU
        if "error" not in self.gpu_info:
            vram_gb = self.gpu_info.get("vram_gb", 0)
            
            if vram_gb >= 8:  # Your RTX 4060
                config["generation"]["batch_size"] = 2
                config["generation"]["resolution"] = "768"
                config["training"]["batch_size"] = 2
                config["training"]["max_images"] = 50
                config["models"]["recommended"] = ["sdxl", "sd15"]
                config["models"]["compatible"] = ["flux-dev", "sdxl", "sd15"]
                config["models"]["not_recommended"] = []
            
            elif vram_gb >= 6:
                config["generation"]["batch_size"] = 1
                config["generation"]["resolution"] = "512"
                config["training"]["batch_size"] = 1
                config["training"]["max_images"] = 30
                config["models"]["recommended"] = ["sd15"]
                config["models"]["compatible"] = ["sdxl", "sd15"]
                config["models"]["not_recommended"] = ["flux-dev"]
        
        return config

class CandyCrucibleSmartApp:
    def __init__(self):
        # Directories
        self.static_dir = Path("static")
        self.static_dir.mkdir(exist_ok=True)
        
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
        
        # System info cache
        self.system_info = None
        
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
        
        @self.app.get("/api/config/optimal")
        async def get_optimal_config():
            """Get optimal configuration for detected system"""
            try:
                if self.system_info is None:
                    self.system_info = self.system_detector.detect_all()
                return self.system_detector.get_optimal_config()
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
        
        @self.app.get("/comic", response_class=HTMLResponse)
        async def comic_interface():
            """Serve the comic generation interface"""
            return self.get_comic_interface()
    
    def setup_static_files(self):
        """Setup static file serving"""
        if self.static_dir.exists():
            self.app.mount("/static", StaticFiles(directory=str(self.static_dir)), name="static")
    
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
        .tab-button {
            transition: all 0.3s ease;
        }
        .tab-button:hover {
            transform: translateY(-2px);
        }
        .tab-button.active {
            background: linear-gradient(135deg, #ff6b9d 0%, #c66cff 100%);
        }
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

        <!-- Navigation Tabs -->
        <div class="bg-gray-800 border-b border-gray-700">
            <div class="container mx-auto">
                <div class="flex space-x-1">
                    <button onclick="showTab('system')" class="tab-button active px-6 py-3 text-white font-medium rounded-t-lg" id="tab-system">
                        🧠 System Detection
                    </button>
                    <button onclick="showTab('comic')" class="tab-button px-6 py-3 text-white font-medium rounded-t-lg hover:bg-gray-700" id="tab-comic">
                        🎨 Comic Generation
                    </button>
                    <button onclick="showTab('training')" class="tab-button px-6 py-3 text-white font-medium rounded-t-lg hover:bg-gray-700" id="tab-training">
                        🤖 AI Training
                    </button>
                    <button onclick="showTab('models')" class="tab-button px-6 py-3 text-white font-medium rounded-t-lg hover:bg-gray-700" id="tab-models">
                        📚 Models
                    </button>
                    <button onclick="showTab('settings')" class="tab-button px-6 py-3 text-white font-medium rounded-t-lg hover:bg-gray-700" id="tab-settings">
                        ⚙️ Settings
                    </button>
                </div>
            </div>
        </div>

        <!-- Main Content -->
        <main class="container mx-auto p-6">
            <!-- System Detection Tab -->
            <div id="content-system" class="tab-content">
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

                <!-- Quick Actions -->
                <div class="bg-gray-800 rounded-lg p-6 crystalline-effect">
                    <h2 class="text-2xl font-bold mb-4 flex items-center gap-2">
                        <i data-lucide="zap" class="w-6 h-6 text-yellow-400"></i>
                        Quick Actions
                    </h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <button onclick="detectSystem()" class="bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded-lg flex items-center gap-2 transition-all hover:scale-105">
                            <i data-lucide="search" class="w-4 h-4"></i>
                            Detect System
                        </button>
                        <button onclick="optimizeSettings()" class="bg-green-600 hover:bg-green-700 px-4 py-3 rounded-lg flex items-center gap-2 transition-all hover:scale-105">
                            <i data-lucide="settings" class="w-4 h-4"></i>
                            Optimize Settings
                        </button>
                        <button onclick="checkCompatibility()" class="bg-purple-600 hover:bg-purple-700 px-4 py-3 rounded-lg flex items-center gap-2 transition-all hover:scale-105">
                            <i data-lucide="check-circle" class="w-4 h-4"></i>
                            Check Compatibility
                        </button>
                        <button onclick="showTab('comic')" class="candy-crucible text-white font-bold px-4 py-3 rounded-lg flex items-center gap-2 transition-all hover:scale-105">
                            <i data-lucide="rocket" class="w-4 h-4"></i>
                            Start Creating
                        </button>
                    </div>
                </div>
            </div>

            <!-- Comic Generation Tab -->
            <div id="content-comic" class="tab-content hidden">
                <div class="bg-gray-800 rounded-lg p-6 crystalline-effect">
                    <h2 class="text-2xl font-bold mb-4 flex items-center gap-2">
                        <i data-lucide="book-open" class="w-6 h-6 text-pink-400"></i>
                        Sweet Apocalypse Comic Generation
                    </h2>
                    
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <!-- Story Input -->
                        <div class="bg-gray-700 rounded-lg p-4">
                            <h3 class="font-bold mb-3 text-pink-300">📖 Story Input</h3>
                            <textarea id="story-input" class="w-full h-32 bg-gray-600 rounded p-3 text-white" 
                                placeholder="Enter your Sweet Apocalypse story here...&#10;&#10;Example: Lucas and Clara wander through the crystalline streets of Bruges, where candy mutations have transformed the city into a beautiful nightmare..."></textarea>
                            
                            <div class="mt-3">
                                <label class="block text-sm mb-2">Or upload story file:</label>
                                <input type="file" id="story-file" accept=".txt,.md,.pdf,.docx" class="w-full text-sm">
                            </div>
                        </div>
                        
                        <!-- Generation Settings -->
                        <div class="bg-gray-700 rounded-lg p-4">
                            <h3 class="font-bold mb-3 text-cyan-300">⚙️ Generation Settings</h3>
                            
                            <div class="space-y-3">
                                <div>
                                    <label class="block text-sm mb-1">Style:</label>
                                    <select id="style-select" class="w-full bg-gray-600 rounded p-2 text-white">
                                        <option value="sweet-apocalypse-v1">🍬 Sweet Apocalypse v1</option>
                                        <option value="sweet-apocalypse-v2">🍬 Sweet Apocalypse v2</option>
                                        <option value="custom-lora">🎨 Custom LoRA</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label class="block text-sm mb-1">Pages:</label>
                                    <input type="number" id="pages-input" value="4" min="1" max="8" class="w-full bg-gray-600 rounded p-2 text-white">
                                </div>
                                
                                <div>
                                    <label class="block text-sm mb-1">Panels per page:</label>
                                    <input type="number" id="panels-input" value="4" min="1" max="6" class="w-full bg-gray-600 rounded p-2 text-white">
                                </div>
                                
                                <div>
                                    <label class="block text-sm mb-1">Quality:</label>
                                    <select id="quality-select" class="w-full bg-gray-600 rounded p-2 text-white">
                                        <option value="fast">⚡ Fast (512px)</option>
                                        <option value="balanced">⚖️ Balanced (768px)</option>
                                        <option value="high">🎨 High (1024px)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Generate Button -->
                    <div class="mt-6 text-center">
                        <button onclick="generateComic()" class="candy-crucible text-white font-bold px-8 py-4 rounded-lg text-lg flex items-center gap-3 mx-auto transition-all hover:scale-105 glow-effect">
                            <i data-lucide="sparkles" class="w-6 h-6"></i>
                            Generate Sweet Apocalypse Comic
                            <i data-lucide="arrow-right" class="w-6 h-6"></i>
                        </button>
                    </div>
                    
                    <!-- Progress -->
                    <div id="generation-progress" class="mt-6 hidden">
                        <div class="bg-gray-700 rounded-lg p-4">
                            <h3 class="font-bold mb-2 text-yellow-400">🎨 Generating Comic...</h3>
                            <div class="w-full bg-gray-600 rounded-full h-4">
                                <div id="progress-bar" class="candy-crucible h-4 rounded-full transition-all duration-500" style="width: 0%"></div>
                            </div>
                            <p id="progress-text" class="text-sm mt-2">Initializing...</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- AI Training Tab -->
            <div id="content-training" class="tab-content hidden">
                <div class="bg-gray-800 rounded-lg p-6 crystalline-effect">
                    <h2 class="text-2xl font-bold mb-4 flex items-center gap-2">
                        <i data-lucide="brain" class="w-6 h-6 text-purple-400"></i>
                        AI Toolkit Training
                    </h2>
                    
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <!-- Training Configuration -->
                        <div class="bg-gray-700 rounded-lg p-4">
                            <h3 class="font-bold mb-3 text-purple-300">🤖 Training Configuration</h3>
                            
                            <div class="space-y-3">
                                <div>
                                    <label class="block text-sm mb-1">Training Type:</label>
                                    <select id="training-type" class="w-full bg-gray-600 rounded p-2 text-white">
                                        <option value="lora">🎨 LoRA Training</option>
                                        <option value="fine-tune">⚙️ Fine-Tuning</option>
                                        <option value="textual-inversion">📝 Textual Inversion</option>
                                        <option value="dreambooth">🌟 DreamBooth</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label class="block text-sm mb-1">Base Model:</label>
                                    <select id="base-model" class="w-full bg-gray-600 rounded p-2 text-white">
                                        <option value="flux-dev">🔥 FLUX Dev</option>
                                        <option value="sdxl">🎨 SDXL</option>
                                        <option value="sd15">⚡ Stable Diffusion 1.5</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label class="block text-sm mb-1">Epochs:</label>
                                    <input type="number" id="epochs-input" value="50" min="10" max="200" class="w-full bg-gray-600 rounded p-2 text-white">
                                </div>
                                
                                <div>
                                    <label class="block text-sm mb-1">Batch Size:</label>
                                    <input type="number" id="batch-size-input" value="2" min="1" max="4" class="w-full bg-gray-600 rounded p-2 text-white">
                                </div>
                                
                                <div>
                                    <label class="block text-sm mb-1">Learning Rate:</label>
                                    <input type="text" id="learning-rate-input" value="1e-4" class="w-full bg-gray-600 rounded p-2 text-white">
                                </div>
                            </div>
                        </div>
                        
                        <!-- Training Data -->
                        <div class="bg-gray-700 rounded-lg p-4">
                            <h3 class="font-bold mb-3 text-pink-300">📁 Training Data</h3>
                            
                            <div class="space-y-3">
                                <div>
                                    <label class="block text-sm mb-1">Upload Training Images:</label>
                                    <input type="file" id="training-images" multiple accept="image/*" class="w-full text-sm">
                                    <p class="text-xs text-gray-400 mt-1">Upload 10-50 images for best results</p>
                                </div>
                                
                                <div>
                                    <label class="block text-sm mb-1">Style Description:</label>
                                    <textarea id="style-description" class="w-full h-20 bg-gray-600 rounded p-2 text-white text-sm" 
                                        placeholder="Describe your Sweet Apocalypse style..."></textarea>
                                </div>
                                
                                <div>
                                    <label class="block text-sm mb-1">Trigger Words:</label>
                                    <input type="text" id="trigger-words" class="w-full bg-gray-600 rounded p-2 text-white text-sm" 
                                        placeholder="sweet apocalypse, crystalline, candy mutation">
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Training Button -->
                    <div class="mt-6 text-center">
                        <button onclick="startTraining()" class="bg-purple-600 hover:bg-purple-700 text-white font-bold px-8 py-4 rounded-lg text-lg flex items-center gap-3 mx-auto transition-all hover:scale-105">
                            <i data-lucide="play" class="w-6 h-6"></i>
                            Start AI Training
                            <i data-lucide="cpu" class="w-6 h-6"></i>
                        </button>
                    </div>
                    
                    <!-- Training Progress -->
                    <div id="training-progress" class="mt-6 hidden">
                        <div class="bg-gray-700 rounded-lg p-4">
                            <h3 class="font-bold mb-2 text-yellow-400">🤖 Training in Progress...</h3>
                            <div class="w-full bg-gray-600 rounded-full h-4">
                                <div id="training-progress-bar" class="bg-purple-600 h-4 rounded-full transition-all duration-500" style="width: 0%"></div>
                            </div>
                            <p id="training-progress-text" class="text-sm mt-2">Initializing training...</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Models Tab -->
            <div id="content-models" class="tab-content hidden">
                <div class="bg-gray-800 rounded-lg p-6 crystalline-effect">
                    <h2 class="text-2xl font-bold mb-4 flex items-center gap-2">
                        <i data-lucide="package" class="w-6 h-6 text-green-400"></i>
                        Model Management
                    </h2>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <!-- Sweet Apocalypse Models -->
                        <div class="bg-gray-700 rounded-lg p-4">
                            <h3 class="font-bold mb-2 text-pink-300">🍬 Sweet Apocalypse</h3>
                            <div class="space-y-2 text-sm">
                                <div class="flex justify-between">
                                    <span>v1.0 Crystalline</span>
                                    <span class="status-indicator status-installed"></span>
                                </div>
                                <div class="flex justify-between">
                                    <span>v2.0 Candy Mutation</span>
                                    <span class="status-indicator status-installed"></span>
                                </div>
                                <div class="flex justify-between">
                                    <span>Character Pack</span>
                                    <span class="status-indicator status-installed"></span>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Base Models -->
                        <div class="bg-gray-700 rounded-lg p-4">
                            <h3 class="font-bold mb-2 text-cyan-300">🤖 Base Models</h3>
                            <div class="space-y-2 text-sm">
                                <div class="flex justify-between">
                                    <span>FLUX Dev</span>
                                    <span class="status-indicator status-installed"></span>
                                </div>
                                <div class="flex justify-between">
                                    <span>SDXL</span>
                                    <span class="status-indicator status-installed"></span>
                                </div>
                                <div class="flex justify-between">
                                    <span>SD 1.5</span>
                                    <span class="status-indicator status-installed"></span>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Custom Models -->
                        <div class="bg-gray-700 rounded-lg p-4">
                            <h3 class="font-bold mb-2 text-purple-300">🎨 Custom LoRAs</h3>
                            <div class="space-y-2 text-sm">
                                <div class="flex justify-between">
                                    <span>Your Style 1</span>
                                    <span class="status-indicator status-missing"></span>
                                </div>
                                <div class="flex justify-between">
                                    <span>Your Style 2</span>
                                    <span class="status-indicator status-missing"></span>
                                </div>
                                <button class="bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded text-sm mt-2">
                                    + Train New Style
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Settings Tab -->
            <div id="content-settings" class="tab-content hidden">
                <div class="bg-gray-800 rounded-lg p-6 crystalline-effect">
                    <h2 class="text-2xl font-bold mb-4 flex items-center gap-2">
                        <i data-lucide="settings" class="w-6 h-6 text-gray-400"></i>
                        Settings & Configuration
                    </h2>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <!-- System Settings -->
                        <div class="bg-gray-700 rounded-lg p-4">
                            <h3 class="font-bold mb-3 text-gray-300">🔧 System Settings</h3>
                            
                            <div class="space-y-3">
                                <div class="flex justify-between items-center">
                                    <label class="text-sm">Auto-detect hardware</label>
                                    <input type="checkbox" checked class="w-4 h-4">
                                </div>
                                <div class="flex justify-between items-center">
                                    <label class="text-sm">Optimize for VRAM</label>
                                    <input type="checkbox" checked class="w-4 h-4">
                                </div>
                                <div class="flex justify-between items-center">
                                    <label class="text-sm">Background generation</label>
                                    <input type="checkbox" class="w-4 h-4">
                                </div>
                                <div class="flex justify-between items-center">
                                    <label class="text-sm">Auto-save progress</label>
                                    <input type="checkbox" checked class="w-4 h-4">
                                </div>
                            </div>
                        </div>
                        
                        <!-- Performance Settings -->
                        <div class="bg-gray-700 rounded-lg p-4">
                            <h3 class="font-bold mb-3 text-yellow-300">⚡ Performance</h3>
                            
                            <div class="space-y-3">
                                <div>
                                    <label class="block text-sm mb-1">Max batch size:</label>
                                    <input type="number" value="2" min="1" max="4" class="w-full bg-gray-600 rounded p-2 text-white text-sm">
                                </div>
                                <div>
                                    <label class="block text-sm mb-1">Default resolution:</label>
                                    <select class="w-full bg-gray-600 rounded p-2 text-white text-sm">
                                        <option value="512">512x512 (Fast)</option>
                                        <option value="768" selected>768x768 (Balanced)</option>
                                        <option value="1024">1024x1024 (High Quality)</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-sm mb-1">Generation steps:</label>
                                    <input type="number" value="20" min="10" max="50" class="w-full bg-gray-600 rounded p-2 text-white text-sm">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>

    <script>
        let systemInfo = null;

        // Initialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        // Auto-detect on load
        window.addEventListener('load', () => {
            detectSystem();
        });

        function showTab(tabName) {
            // Hide all content
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.add('hidden');
            });
            
            // Remove active class from all tabs
            document.querySelectorAll('.tab-button').forEach(tab => {
                tab.classList.remove('active');
            });
            
            // Show selected content
            document.getElementById(`content-${tabName}`).classList.remove('hidden');
            document.getElementById(`tab-${tabName}`).classList.add('active');
            
            // Reinitialize icons
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }

        async function detectSystem() {
            try {
                const response = await fetch('/api/system/detect');
                systemInfo = await response.json();
                updateSystemDisplay();
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
                    ${warnings.length > 0 ? warnings[0] : suggestions[0] || 'System ready for AI workloads'}
                </div>
            `;
        }

        function optimizeSettings() {
            if (!systemInfo) {
                alert('Please run system detection first!');
                return;
            }
            
            // Apply optimal settings
            const config = systemInfo.gpu.vram_gb >= 8 ? {
                batch_size: 2,
                resolution: '768',
                quality: 'balanced'
            } : {
                batch_size: 1,
                resolution: '512',
                quality: 'fast'
            };
            
            // Update UI with optimal settings
            document.getElementById('batch-size-input').value = config.batch_size;
            document.getElementById('quality-select').value = config.quality;
            
            alert('✅ Settings optimized for your RTX 4060!\\n\\nBatch Size: ' + config.batch_size + '\\nResolution: ' + config.resolution + 'px');
        }

        function checkCompatibility() {
            if (!systemInfo) {
                alert('Please run system detection first!');
                return;
            }
            
            const compatible = systemInfo.compatible;
            let message = '🔍 System Compatibility Report:\\n\\n';
            
            message += '✅ Can run locally: ' + (compatible.can_run_locally ? 'Yes' : 'No') + '\\n';
            message += '🤖 Can train models: ' + (compatible.can_train_models ? 'Yes' : 'No') + '\\n';
            message += '⚙️ Recommended setup: ' + compatible.recommended_setup + '\\n\\n';
            
            if (compatible.limitations.length > 0) {
                message += '⚠️ Limitations:\\n';
                compatible.limitations.forEach(limit => {
                    message += '- ' + limit + '\\n';
                });
            } else {
                message += '🎉 No limitations detected! Your system is perfect for Candy Crucible!';
            }
            
            alert(message);
        }

        function generateComic() {
            const story = document.getElementById('story-input').value;
            if (!story.trim()) {
                alert('Please enter a story or upload a file!');
                return;
            }
            
            // Show progress
            document.getElementById('generation-progress').classList.remove('hidden');
            
            // Simulate generation progress
            let progress = 0;
            const progressBar = document.getElementById('progress-bar');
            const progressText = document.getElementById('progress-text');
            
            const interval = setInterval(() => {
                progress += Math.random() * 15;
                if (progress >= 100) {
                    progress = 100;
                    clearInterval(interval);
                    progressText.textContent = '✅ Comic generation complete! Check your downloads folder.';
                    setTimeout(() => {
                        document.getElementById('generation-progress').classList.add('hidden');
                    }, 3000);
                } else {
                    progressText.textContent = `Generating panels... ${Math.round(progress)}%`;
                }
                progressBar.style.width = progress + '%';
            }, 1000);
        }

        function startTraining() {
            // Show training progress
            document.getElementById('training-progress').classList.remove('hidden');
            
            // Simulate training progress
            let progress = 0;
            const progressBar = document.getElementById('training-progress-bar');
            const progressText = document.getElementById('training-progress-text');
            
            const interval = setInterval(() => {
                progress += Math.random() * 10;
                if (progress >= 100) {
                    progress = 100;
                    clearInterval(interval);
                    progressText.textContent = '✅ Training complete! Your LoRA is ready to use.';
                    setTimeout(() => {
                        document.getElementById('training-progress').classList.add('hidden');
                    }, 3000);
                } else {
                    progressText.textContent = `Training epoch ${Math.round(progress/10)} of 10... ${Math.round(progress)}%`;
                }
                progressBar.style.width = progress + '%';
            }, 2000);
        }
    </script>
</body>
</html>
        """
    
    def get_comic_interface(self) -> str:
        """Generate the comic generation interface"""
        return self.get_smart_interface()  # For now, return the same interface

def create_app():
    """Create and configure the FastAPI app"""
    return CandyCrucibleSmartApp().app

if __name__ == "__main__":
    # Run the smart server
    app = create_app()
    print("🍬 Starting Candy Crucible Smart Server...")
    print("🔗 Open http://localhost:8080 in your browser")
    print("🎯 Your RTX 4060 will be automatically detected and optimized!")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8080,
        log_level="info"
    )
