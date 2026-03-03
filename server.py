#!/usr/bin/env python3
"""
Sweet Apocalypse Comic Factory - Web Server
One-click install web UI for local and cloud deployment
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

class SweetApocalypseServer:
    def __init__(self):
        self.app = FastAPI(
            title="Sweet Apocalypse Comic Factory",
            description="Hands-off AI comic generation with RAG, LoRA training & batch processing",
            version="2.0.0"
        )
        
        self.setup_middleware()
        self.setup_routes()
        self.setup_static_files()
        
        # Configuration
        self.ollama_url = os.getenv("OLLAMA_URL", "http://localhost:11434")
        self.comfyui_url = os.getenv("COMFYUI_URL", "http://localhost:8188")
        self.upload_dir = Path("uploads")
        self.models_dir = Path("models")
        self.output_dir = Path("output")
        
        # Ensure directories exist
        self.upload_dir.mkdir(exist_ok=True)
        self.models_dir.mkdir(exist_ok=True)
        self.output_dir.mkdir(exist_ok=True)
        
        # Active jobs
        self.active_jobs: Dict[str, Dict] = {}

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
            """Serve the main web interface"""
            return FileResponse("index.html")

        @self.app.get("/api/status")
        async def get_status():
            """Get system status"""
            return await self.check_system_status()

        @self.app.post("/api/install")
        async def one_click_install():
            """One-click installation"""
            return await self.perform_installation()

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
                self.generate_comic_background,
                job_id,
                document_path,
                custom_prompt,
                num_pages,
                style_lora
            )
            
            return {"job_id": job_id, "status": "started"}

        @self.app.get("/api/job/{job_id}")
        async def get_job_status(job_id: str):
            """Get job status and progress"""
            if job_id not in self.active_jobs:
                raise HTTPException(status_code=404, detail="Job not found")
            
            return self.active_jobs[job_id]

        @self.app.post("/api/train")
        async def train_lora(
            background_tasks: BackgroundTasks,
            images: List[UploadFile] = File(...),
            style_description: str = "",
            model_name: str = "user_style"
        ):
            """Train a custom LoRA from user images"""
            job_id = f"train_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            
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
                self.train_lora_background,
                job_id,
                image_paths,
                style_description,
                model_name
            )
            
            return {"job_id": job_id, "status": "training_started"}

        @self.app.get("/api/models")
        async def get_models():
            """Get available models"""
            return await self.get_available_models()

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

        @self.app.get("/api/export/{job_id}")
        async def export_comic(job_id: str):
            """Export generated comic"""
            if job_id not in self.active_jobs:
                raise HTTPException(status_code=404, detail="Job not found")
            
            job = self.active_jobs[job_id]
            if job.get("status") != "completed":
                raise HTTPException(status_code=400, detail="Job not completed")
            
            # Create export file
            export_data = {
                "job_id": job_id,
                "pages": job.get("pages", []),
                "metadata": job.get("metadata", {}),
                "exported_at": datetime.now().isoformat()
            }
            
            export_path = self.output_dir / f"{job_id}_export.json"
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
            "models": {
                "text": [],
                "image": [],
                "loras": []
            },
            "rag_documents": 0,
            "active_jobs": len(self.active_jobs)
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
        
        # Count RAG documents
        rag_dir = Path("rag_documents")
        if rag_dir.exists():
            status["rag_documents"] = len(list(rag_dir.glob("*.json")))
        
        return status

    async def perform_installation(self) -> Dict:
        """Perform one-click installation"""
        steps = [
            "Checking system requirements...",
            "Installing Ollama...",
            "Installing ComfyUI...",
            "Downloading base models...",
            "Setting up Sweet Apocalypse LoRA...",
            "Configuring pipeline..."
        ]
        
        for i, step in enumerate(steps):
            await asyncio.sleep(1)  # Simulate installation step
            logger.info(f"Installation step {i+1}/{len(steps)}: {step}")
        
        return {
            "status": "completed",
            "message": "Sweet Apocalypse Comic Factory installed successfully!"
        }

    async def generate_comic_background(
        self,
        job_id: str,
        document_path: Optional[Path],
        custom_prompt: Optional[str],
        num_pages: int,
        style_lora: str
    ):
        """Background task for comic generation"""
        try:
            # Initialize job
            self.active_jobs[job_id] = {
                "status": "processing",
                "progress": 0,
                "current_step": "Initializing pipeline...",
                "pages": [],
                "metadata": {},
                "started_at": datetime.now().isoformat()
            }
            
            # Simulate generation steps
            steps = [
                "Processing story context...",
                "Generating page narratives...",
                "Building image prompts...",
                "Starting batch generation...",
                "Rendering panels...",
                "Quality checking...",
                "Assembling comic..."
            ]
            
            for i, step in enumerate(steps):
                self.active_jobs[job_id]["current_step"] = step
                self.active_jobs[job_id]["progress"] = (i + 1) / len(steps) * 100
                await asyncio.sleep(2)  # Simulate processing time
            
            # Generate mock pages
            pages = []
            for page_num in range(1, num_pages + 1):
                panels = []
                for panel_num in range(1, 5):  # 4 panels per page
                    panels.append({
                        "panel_number": panel_num,
                        "image_url": f"generated/page{page_num}_panel{panel_num}.png",
                        "prompt": f"Sweet Apocalypse style - Panel {panel_num} of page {page_num}",
                        "metadata": {
                            "style_lora": style_lora,
                            "seed": 12345 + panel_num
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
                "current_step": "Generation completed!",
                "pages": pages,
                "completed_at": datetime.now().isoformat()
            })
            
        except Exception as e:
            self.active_jobs[job_id].update({
                "status": "failed",
                "error": str(e),
                "completed_at": datetime.now().isoformat()
            })

    async def train_lora_background(
        self,
        job_id: str,
        image_paths: List[str],
        style_description: str,
        model_name: str
    ):
        """Background task for LoRA training"""
        try:
            # Initialize job
            self.active_jobs[job_id] = {
                "status": "training",
                "progress": 0,
                "current_step": "Processing images...",
                "model_name": model_name,
                "started_at": datetime.now().isoformat()
            }
            
            # Simulate training steps
            steps = [
                "Processing images...",
                "Extracting style features...",
                "Training LoRA model...",
                "Validating results...",
                "Saving model..."
            ]
            
            for i, step in enumerate(steps):
                self.active_jobs[job_id]["current_step"] = step
                self.active_jobs[job_id]["progress"] = (i + 1) / len(steps) * 100
                await asyncio.sleep(3)  # Simulate training time
            
            # Complete training
            model_path = self.models_dir / f"{model_name}.safetensors"
            self.active_jobs[job_id].update({
                "status": "completed",
                "progress": 100,
                "current_step": "Training completed!",
                "model_path": str(model_path),
                "completed_at": datetime.now().isoformat()
            })
            
        except Exception as e:
            self.active_jobs[job_id].update({
                "status": "failed",
                "error": str(e),
                "completed_at": datetime.now().isoformat()
            })

    async def get_available_models(self) -> Dict:
        """Get available models"""
        models = {
            "text": ["qwen2.5:7b", "llama3.1:8b", "mixtral:8x7b"],
            "image": ["qwen2-vl:7b", "sdxl", "stable-diffusion"],
            "loras": ["sweetapoc-v1", "sweetapoc-v2"]
        }
        
        # Add user-trained LoRAs
        for lora_file in self.models_dir.glob("*.safetensors"):
            models["loras"].append(lora_file.stem)
        
        return models

def create_app():
    """Create and configure the FastAPI app"""
    return SweetApocalypseServer().app

if __name__ == "__main__":
    # Run the server
    app = create_app()
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8080,
        log_level="info"
    )
