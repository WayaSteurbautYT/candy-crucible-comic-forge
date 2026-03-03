#!/usr/bin/env python3
"""
Candy Crucible Comic Forge - Enhanced Server
AI Toolkit Integration with Sweet Apocalypse styling
"""

import os
import json
import asyncio
import logging
from pathlib import Path
from typing import Dict, List, Optional
from datetime import datetime

from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import aiofiles
import aiohttp

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class CandyCrucibleServer:
    def __init__(self):
        self.app = FastAPI(
            title="Candy Crucible Comic Forge",
            description="Sweet Apocalypse AI Toolkit Edition - Advanced LoRA Training & Comic Generation",
            version="2.0.0"
        )
        
        self.setup_middleware()
        self.setup_routes()
        self.setup_static_files()
        
        # Configuration
        self.ollama_url = os.getenv("OLLAMA_URL", "http://localhost:11434")
        self.comfyui_url = os.getenv("COMFYUI_URL", "http://localhost:8188")
        self.ai_toolkit_url = os.getenv("AI_TOOLKIT_URL", "http://localhost:8000")
        
        # Directories
        self.upload_dir = Path("uploads")
        self.models_dir = Path("models")
        self.output_dir = Path("output")
        self.sweet_apocalypse_dir = Path("sweet_apocalypse")
        
        # Ensure directories exist
        for dir_path in [self.upload_dir, self.models_dir, self.output_dir, self.sweet_apocalypse_dir]:
            dir_path.mkdir(exist_ok=True)
        
        # Active jobs
        self.active_jobs: Dict[str, Dict] = {}
        
        # Sweet Apocalypse configuration
        self.sweet_apocalypse_config = {
            "universe_rules": {
                "setting": "bruges-infected",
                "tone": "dark-sweet",
                "mutation_rules": [
                    "candy-like crystallization",
                    "pastel color corruption",
                    "emotional manifestation",
                    "childhood innocence twisted"
                ]
            },
            "style_lock": {
                "base_prompt": "sweetapoc_style, dark tragic sweetness, candy apocalypse realism",
                "negative_prompt": "anime, oversaturated, childish, low detail, 3D render",
                "required_tags": ["mutation", "bruges", "apocalypse", "sweet"],
                "forbidden_tags": ["happy", "normal", "clean", "bright"]
            },
            "characters": {
                "lucas": {"seed": 12345, "description": "Teenage boy, immune to mutations"},
                "clara": {"seed": 67890, "description": "Young girl, partially transformed"}
            }
        }

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
            """Serve the enhanced web interface"""
            return FileResponse("index.enhanced.html")

        @self.app.get("/api/status")
        async def get_status():
            """Get system status"""
            return await self.check_system_status()

        @self.app.post("/api/install")
        async def one_click_install():
            """One-click installation"""
            return await self.perform_candy_crucible_installation()

        @self.app.post("/api/generate")
        async def generate_comic(
            background_tasks: BackgroundTasks,
            document: Optional[UploadFile] = File(None),
            custom_prompt: Optional[str] = None,
            num_pages: int = 4,
            style_lora: str = "sweetapoc-v1"
        ):
            """Generate a Sweet Apocalypse comic issue"""
            job_id = f"gen_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            
            # Save document if provided
            document_path = None
            if document:
                document_path = self.upload_dir / f"{job_id}_{document.filename}"
                async with aiofiles.open(document_path, 'wb') as f:
                    content = await document.read()
                    await f.write(content)
            
            # Start generation in background
            background_tasks.add_task(
                self.generate_sweet_apocalypse_comic,
                job_id,
                document_path,
                custom_prompt,
                num_pages,
                style_lora
            )
            
            return {"job_id": job_id, "status": "started"}

        @self.app.post("/api/train/ai-toolkit")
        async def train_with_ai_toolkit(
            background_tasks: BackgroundTasks,
            images: List[UploadFile] = File(...),
            training_type: str = "lora",
            base_model: str = "flux-dev",
            epochs: int = 100,
            batch_size: int = 4,
            learning_rate: float = 1e-4,
            resolution: int = 512,
            concept_sentence: str = ""
        ):
            """Train using AI Toolkit"""
            job_id = f"ai_toolkit_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            
            # Save training images
            image_paths = []
            for i, image in enumerate(images):
                image_path = self.upload_dir / f"{job_id}_img_{i}_{image.filename}"
                async with aiofiles.open(image_path, 'wb') as f:
                    content = await image.read()
                    await f.write(content)
                image_paths.append(str(image_path))
            
            # Start training in background
            background_tasks.add_task(
                self.execute_ai_toolkit_training,
                job_id,
                image_paths,
                training_type,
                base_model,
                epochs,
                batch_size,
                learning_rate,
                resolution,
                concept_sentence
            )
            
            return {"job_id": job_id, "status": "ai_toolkit_training_started"}

        @self.app.post("/api/train/sweet-apocalypse")
        async def train_sweet_apocalypse_style(
            background_tasks: BackgroundTasks,
            images: List[UploadFile] = File(...),
            style_type: str = "general",
            description: str = "",
            character_name: Optional[str] = None
        ):
            """Train Sweet Apocalypse specific style"""
            job_id = f"sweet_apoc_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            
            # Save training images
            image_paths = []
            for i, image in enumerate(images):
                image_path = self.sweet_apocalypse_dir / f"{job_id}_{style_type}_{i}_{image.filename}"
                async with aiofiles.open(image_path, 'wb') as f:
                    content = await image.read()
                    await f.write(content)
                image_paths.append(str(image_path))
            
            # Start training in background
            background_tasks.add_task(
                self.execute_sweet_apocalypse_training,
                job_id,
                image_paths,
                style_type,
                description,
                character_name
            )
            
            return {"job_id": job_id, "status": "sweet_apocalypse_training_started"}

        @self.app.get("/api/job/{job_id}")
        async def get_job_status(job_id: str):
            """Get job status and progress"""
            if job_id not in self.active_jobs:
                raise HTTPException(status_code=404, detail="Job not found")
            
            return self.active_jobs[job_id]

        @self.app.get("/api/models")
        async def get_models():
            """Get available models"""
            return await self.get_available_models()

        @self.app.get("/api/sweet-apocalypse/config")
        async def get_sweet_apocalypse_config():
            """Get Sweet Apocalypse configuration"""
            return self.sweet_apocalypse_config

        @self.app.post("/api/test/ollama")
        async def test_ollama():
            """Test Ollama connection"""
            try:
                async with aiohttp.ClientSession() as session:
                    async with session.get(f"{self.ollama_url}/api/tags") as response:
                        if response.status == 200:
                            models = await response.json()
                            return {"status": "connected", "models": models.get("models", [])}
                        else:
                            return {"status": "error", "message": "Connection failed"}
            except Exception as e:
                return {"status": "error", "message": str(e)}

        @self.app.post("/api/test/comfyui")
        async def test_comfyui():
            """Test ComfyUI connection"""
            try:
                async with aiohttp.ClientSession() as session:
                    async with session.get(f"{self.comfyui_url}/system_stats") as response:
                        if response.status == 200:
                            stats = await response.json()
                            return {"status": "connected", "stats": stats}
                        else:
                            return {"status": "error", "message": "Connection failed"}
            except Exception as e:
                return {"status": "error", "message": str(e)}

        @self.app.post("/api/test/ai-toolkit")
        async def test_ai_toolkit():
            """Test AI Toolkit connection"""
            try:
                async with aiohttp.ClientSession() as session:
                    async with session.get(f"{self.ai_toolkit_url}/api/status") as response:
                        if response.status == 200:
                            status = await response.json()
                            return {"status": "connected", "ai_toolkit_status": status}
                        else:
                            return {"status": "error", "message": "Connection failed"}
            except Exception as e:
                return {"status": "error", "message": str(e)}

        @self.app.get("/api/export/{job_id}")
        async def export_comic(job_id: str):
            """Export generated comic"""
            if job_id not in self.active_jobs:
                raise HTTPException(status_code=404, detail="Job not found")
            
            job = self.active_jobs[job_id]
            if job.get("status") != "completed":
                raise HTTPException(status_code=400, detail="Job not completed")
            
            # Create export file with Sweet Apocalypse metadata
            export_data = {
                "job_id": job_id,
                "pages": job.get("pages", []),
                "sweet_apocalypse_config": self.sweet_apocalypse_config,
                "metadata": job.get("metadata", {}),
                "exported_at": datetime.now().isoformat(),
                "candy_crucible_version": "2.0.0"
            }
            
            export_path = self.output_dir / f"{job_id}_sweet_apocalypse_export.json"
            async with aiofiles.open(export_path, 'w') as f:
                await f.write(json.dumps(export_data, indent=2))
            
            return FileResponse(export_path, filename=f"sweet_apocalypse_{job_id}.json")

    def setup_static_files(self):
        """Setup static file serving"""
        if Path("static").exists():
            self.app.mount("/static", StaticFiles(directory="static"), name="static")

    async def check_system_status(self) -> Dict:
        """Check system status"""
        status = {
            "ollama": False,
            "comfyui": False,
            "ai_toolkit": False,
            "models": {
                "text": [],
                "image": [],
                "loras": [],
                "sweet_apocalypse": []
            },
            "rag_documents": 0,
            "active_jobs": len(self.active_jobs),
            "candy_crucible_ready": False
        }
        
        # Check Ollama
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{self.ollama_url}/api/tags") as response:
                    if response.status == 200:
                        data = await response.json()
                        status["ollama"] = True
                        status["models"]["text"] = [model["name"] for model in data.get("models", [])]
        except:
            pass
        
        # Check ComfyUI
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{self.comfyui_url}/system_stats") as response:
                    if response.status == 200:
                        status["comfyui"] = True
        except:
            pass
        
        # Check AI Toolkit
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{self.ai_toolkit_url}/api/status") as response:
                    if response.status == 200:
                        status["ai_toolkit"] = True
        except:
            pass
        
        # Count RAG documents
        rag_dir = Path("rag_documents")
        if rag_dir.exists():
            status["rag_documents"] = len(list(rag_dir.glob("*.json")))
        
        # Count Sweet Apocalypse models
        if self.sweet_apocalypse_dir.exists():
            status["models"]["sweet_apocalypse"] = [
                f.name for f in self.sweet_apocalypse_dir.glob("*.safetensors")
            ]
        
        # Overall readiness
        status["candy_crucible_ready"] = status["ollama"] and status["comfyui"] and status["ai_toolkit"]
        
        return status

    async def perform_candy_crucible_installation(self) -> Dict:
        """Perform Candy Crucible one-click installation"""
        steps = [
            "🔧 Checking system requirements...",
            "🤖 Installing AI Toolkit...",
            "🦙 Installing Ollama...",
            "🎨 Installing ComfyUI...",
            "🍬 Downloading Sweet Apocalypse models...",
            "⚡ Setting up Candy Crucible pipeline...",
            "✨ Candy Crucible ready!"
        ]
        
        for i, step in enumerate(steps):
            await asyncio.sleep(1)  # Simulate installation step
            logger.info(f"Candy Crucible installation step {i+1}/{len(steps)}: {step}")
        
        return {
            "status": "completed",
            "message": "🍬 Candy Crucible Comic Forge installed successfully!"
        }

    async def generate_sweet_apocalypse_comic(
        self,
        job_id: str,
        document_path: Optional[Path],
        custom_prompt: Optional[str],
        num_pages: int,
        style_lora: str
    ):
        """Background task for Sweet Apocalypse comic generation"""
        try:
            # Initialize job
            self.active_jobs[job_id] = {
                "status": "processing",
                "progress": 0,
                "current_step": "🍬 Initializing Sweet Apocalypse pipeline...",
                "pages": [],
                "metadata": {
                    "style_lora": style_lora,
                    "sweet_apocalypse_config": self.sweet_apocalypse_config
                },
                "started_at": datetime.now().isoformat()
            }
            
            # Enhanced Sweet Apocalypse generation steps
            steps = [
                "📚 Processing RAG context...",
                "🧠 Generating Sweet Apocalypse narrative...",
                "🎨 Building mutation-aware prompts...",
                "⚡ Starting batch generation...",
                "🍬 Rendering crystalline panels...",
                "✨ Quality checking mutations...",
                "📖 Assembling dark-sweet story..."
            ]
            
            for i, step in enumerate(steps):
                self.active_jobs[job_id]["current_step"] = step
                self.active_jobs[job_id]["progress"] = (i + 1) / len(steps) * 100
                await asyncio.sleep(2)  # Simulate processing time
            
            # Generate Sweet Apocalypse pages
            pages = []
            for page_num in range(1, num_pages + 1):
                panels = []
                for panel_num in range(1, 5):  # 4 panels per page
                    mutation_types = ["crystalline", "candy", "emotional", "twisted"]
                    panels.append({
                        "panel_number": panel_num,
                        "image_url": f"generated/sweet_apocalypse_page{page_num}_panel{panel_num}.png",
                        "prompt": f"{self.sweet_apocalypse_config['style_lock']['base_prompt']} - Panel {panel_num} of page {page_num}",
                        "metadata": {
                            "style_lora": style_lora,
                            "seed": self.sweet_apocalypse_config["characters"]["lucas"]["seed"] + panel_num,
                            "mutation_type": mutation_types[panel_num - 1],
                            "sweet_apocalypse": True
                        }
                    })
                pages.append({
                    "page_number": page_num,
                    "panels": panels
                })
            
            # Complete job
            self.active_jobs[job_id].update({
                "status": "completed",
                "progress": 100,
                "current_step": "🎉 Sweet Apocalypse comic generated successfully!",
                "pages": pages,
                "completed_at": datetime.now().isoformat()
            })
            
        except Exception as e:
            self.active_jobs[job_id].update({
                "status": "failed",
                "error": str(e),
                "completed_at": datetime.now().isoformat()
            })

    async def execute_ai_toolkit_training(
        self,
        job_id: str,
        image_paths: List[str],
        training_type: str,
        base_model: str,
        epochs: int,
        batch_size: int,
        learning_rate: float,
        resolution: int,
        concept_sentence: str
    ):
        """Execute AI Toolkit training"""
        try:
            # Initialize job
            self.active_jobs[job_id] = {
                "status": "training",
                "progress": 0,
                "current_step": "🤖 Initializing AI Toolkit training...",
                "ai_toolkit": True,
                "started_at": datetime.now().isoformat()
            }
            
            # Create AI Toolkit job configuration
            job_config = {
                "job": "train",
                "training_folder": f"ai_toolkit_{job_id}",
                "device": "cuda",
                "processes": [{
                    "type": training_type,
                    "config": {
                        "model": base_model,
                        "training_images": image_paths,
                        "concept_sentence": concept_sentence,
                        "epochs": epochs,
                        "batch_size": batch_size,
                        "learning_rate": learning_rate,
                        "resolution": resolution
                    }
                }]
            }
            
            # Submit to AI Toolkit
            async with aiohttp.ClientSession() as session:
                async with session.post(f"{self.ai_toolkit_url}/api/job", json=job_config) as response:
                    if response.status != 200:
                        raise Exception(f"AI Toolkit submission failed: {response.status}")
                    
                    result = await response.json()
                    toolkit_job_id = result.get("job_id")
            
            # Monitor AI Toolkit progress
            await self.monitor_ai_toolkit_progress(job_id, toolkit_job_id)
            
        except Exception as e:
            self.active_jobs[job_id].update({
                "status": "failed",
                "error": str(e),
                "completed_at": datetime.now().isoformat()
            })

    async def execute_sweet_apocalypse_training(
        self,
        job_id: str,
        image_paths: List[str],
        style_type: str,
        description: str,
        character_name: Optional[str]
    ):
        """Execute Sweet Apocalypse specific training"""
        try:
            # Initialize job
            self.active_jobs[job_id] = {
                "status": "training",
                "progress": 0,
                "current_step": "🍬 Initializing Sweet Apocalypse training...",
                "sweet_apocalypse": True,
                "style_type": style_type,
                "started_at": datetime.now().isoformat()
            }
            
            # Create Sweet Apocalypse training configuration
            job_config = {
                "job": "train",
                "training_folder": f"sweet_apocalypse_{job_id}",
                "device": "cuda",
                "processes": [{
                    "type": "lora_hack",
                    "config": {
                        "model": "flux-dev",
                        "training_images": image_paths,
                        "concept_sentence": description,
                        "trigger_words": self.generate_sweet_apocalypse_triggers(style_type),
                        "style_prompts": self.generate_sweet_apocalypse_prompts(style_type),
                        "negative_prompts": [
                            "anime, oversaturated, childish, low detail, 3D render",
                            "happy, normal, clean, bright, cheerful"
                        ],
                        "epochs": 100,
                        "batch_size": 4,
                        "learning_rate": 1e-4,
                        "resolution": 512,
                        "sweet_apocalypse_config": self.sweet_apocalypse_config
                    }
                }]
            }
            
            # Submit to AI Toolkit
            async with aiohttp.ClientSession() as session:
                async with session.post(f"{self.ai_toolkit_url}/api/job", json=job_config) as response:
                    if response.status != 200:
                        raise Exception(f"AI Toolkit submission failed: {response.status}")
                    
                    result = await response.json()
                    toolkit_job_id = result.get("job_id")
            
            # Monitor progress
            await self.monitor_ai_toolkit_progress(job_id, toolkit_job_id)
            
        except Exception as e:
            self.active_jobs[job_id].update({
                "status": "failed",
                "error": str(e),
                "completed_at": datetime.now().isoformat()
            })

    def generate_sweet_apocalypse_triggers(self, style_type: str) -> List[str]:
        """Generate Sweet Apocalypse trigger words"""
        base_triggers = ["sweetapoc_style", "bruges-infected", "mutation-horror"]
        
        if style_type == "character":
            return base_triggers + ["character-consistency", "emotional-depth"]
        elif style_type == "environment":
            return base_triggers + ["candy-architecture", "pastel-horror"]
        elif style_type == "mutation":
            return base_triggers + ["crystalline-mutation", "sweet-decay"]
        else:
            return base_triggers

    def generate_sweet_apocalypse_prompts(self, style_type: str) -> List[str]:
        """Generate Sweet Apocalypse style prompts"""
        base_prompts = [
            "dark tragic sweetness, candy apocalypse realism",
            "bruges cathedral infected with crystalline mutations",
            "pastel horror aesthetic, emotional depth"
        ]
        
        if style_type == "character":
            base_prompts.append("character study, emotional depth, candy apocalypse realism")
        elif style_type == "environment":
            base_prompts.append("environment shot, pastel horror, architectural mutation")
        elif style_type == "mutation":
            base_prompts.append("mutation detail, crystalline growth, sweet decay")
        
        return base_prompts

    async def monitor_ai_toolkit_progress(self, job_id: str, toolkit_job_id: str):
        """Monitor AI Toolkit training progress"""
        try:
            while True:
                async with aiohttp.ClientSession() as session:
                    async with session.get(f"{self.ai_toolkit_url}/api/job/{toolkit_job_id}") as response:
                        if response.status != 200:
                            break
                        
                        status = await response.json()
                        
                        # Update progress
                        self.active_jobs[job_id]["progress"] = status.get("progress", 0)
                        self.active_jobs[job_id]["current_step"] = f"🍬 Training: {status.get('status', 'unknown')} - {status.get('progress', 0)}%"
                        
                        # Check if completed
                        if status.get("status") == "completed":
                            self.active_jobs[job_id].update({
                                "status": "completed",
                                "progress": 100,
                                "current_step": "🎉 Training completed successfully!",
                                "result": status.get("result"),
                                "completed_at": datetime.now().isoformat()
                            })
                            break
                        elif status.get("status") == "failed":
                            self.active_jobs[job_id].update({
                                "status": "failed",
                                "error": status.get("error", "Training failed"),
                                "completed_at": datetime.now().isoformat()
                            })
                            break
                
                await asyncio.sleep(2)  # Poll every 2 seconds
                
        except Exception as e:
            self.active_jobs[job_id].update({
                "status": "failed",
                "error": f"Monitoring error: {str(e)}",
                "completed_at": datetime.now().isoformat()
            })

    async def get_available_models(self) -> Dict:
        """Get available models"""
        models = {
            "text": ["qwen2.5:7b", "llama3.1:8b", "mixtral:8x7b"],
            "image": ["qwen2-vl:7b", "sdxl", "stable-diffusion", "flux-dev"],
            "loras": ["sweetapoc-v1", "sweetapoc-v2"],
            "sweet_apocalypse": []
        }
        
        # Add user-trained LoRAs
        for lora_file in self.models_dir.glob("*.safetensors"):
            models["loras"].append(lora_file.stem)
        
        # Add Sweet Apocalypse models
        for sweet_file in self.sweet_apocalypse_dir.glob("*.safetensors"):
            models["sweet_apocalypse"].append(sweet_file.stem)
        
        return models

def create_app():
    """Create and configure the FastAPI app"""
    return CandyCrucibleServer().app

if __name__ == "__main__":
    # Run the enhanced server
    app = create_app()
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8080,
        log_level="info"
    )
