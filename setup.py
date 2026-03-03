#!/usr/bin/env python3
"""
Sweet Apocalypse Comic Factory - Setup Script
Automated installation and configuration
"""

import os
import sys
import subprocess
import platform
import requests
from pathlib import Path
import json

class SweetApocalypseSetup:
    def __init__(self):
        self.system = platform.system().lower()
        self.install_dir = Path.cwd()
        self.config = {
            "ollama_url": "http://localhost:11434",
            "comfyui_url": "http://localhost:8188",
            "models": {
                "text": ["qwen2.5:7b"],
                "image": ["qwen2-vl:7b"],
                "loras": ["sweetapoc-v1"]
            }
        }
        
    def run(self):
        """Run the setup process"""
        print("🍬 Sweet Apocalypse Comic Factory - Setup")
        print("=" * 50)
        
        steps = [
            ("Installing Python dependencies", self.install_dependencies),
            ("Installing Ollama", self.install_ollama),
            ("Installing ComfyUI", self.install_comfyui),
            ("Downloading base models", self.download_models),
            ("Setting up directories", self.setup_directories),
            ("Creating configuration", self.create_config)
        ]
        
        for step_name, step_func in steps:
            print(f"\n📦 {step_name}...")
            try:
                step_func()
                print(f"✅ {step_name} completed")
            except Exception as e:
                print(f"❌ {step_name} failed: {e}")
                return False
        
        print("\n🎉 Setup completed successfully!")
        print("\nTo start the application:")
        print("1. Run: python app.py (for GUI installer)")
        print("2. Run: python server.py (for web server)")
        print("3. Open: http://localhost:8080")
        
        return True

    def install_dependencies(self):
        """Install Python dependencies"""
        subprocess.run([
            sys.executable, "-m", "pip", "install", "-r", "requirements.txt"
        ], check=True)

    def install_ollama(self):
        """Install Ollama"""
        if self.system == "windows":
            url = "https://ollama.ai/download/OllamaSetup.exe"
            print("Downloading Ollama for Windows...")
            response = requests.get(url)
            response.raise_for_status()
            
            setup_path = self.install_dir / "OllamaSetup.exe"
            with open(setup_path, 'wb') as f:
                f.write(response.content)
            
            print("Please run OllamaSetup.exe manually to complete installation")
            
        elif self.system == "linux":
            print("Installing Ollama for Linux...")
            subprocess.run(["curl", "-fsSL", "https://ollama.ai/install.sh"], check=True)
            subprocess.run(["sh", "ollama-install.sh"], check=True)
            
        elif self.system == "darwin":
            print("Installing Ollama for macOS...")
            subprocess.run(["brew", "install", "ollama"], check=True)

    def install_comfyui(self):
        """Install ComfyUI"""
        comfyui_dir = self.install_dir / "ComfyUI"
        
        if not comfyui_dir.exists():
            print("Cloning ComfyUI repository...")
            subprocess.run([
                "git", "clone", 
                "https://github.com/comfyanonymous/ComfyUI.git",
                str(comfyui_dir)
            ], check=True)

        print("Installing ComfyUI dependencies...")
        subprocess.run([
            sys.executable, "-m", "pip", "install", "-r",
            str(comfyui_dir / "requirements.txt")
        ], check=True)

    def download_models(self):
        """Download base models"""
        models_dir = self.install_dir / "models"
        models_dir.mkdir(exist_ok=True)
        
        print("Setting up model directories...")
        (models_dir / "text").mkdir(exist_ok=True)
        (models_dir / "image").mkdir(exist_ok=True)
        (models_dir / "loras").mkdir(exist_ok=True)
        
        # Create placeholder files (in real implementation, would download actual models)
        print("Creating model placeholders...")
        (models_dir / "text" / "qwen2.5-7b.gguf").touch()
        (models_dir / "image" / "qwen2-vl-7b.gguf").touch()
        (models_dir / "loras" / "sweetapoc-v1.safetensors").touch()

    def setup_directories(self):
        """Setup required directories"""
        directories = [
            "uploads",
            "output", 
            "rag_documents",
            "static",
            "temp"
        ]
        
        for dir_name in directories:
            dir_path = self.install_dir / dir_name
            dir_path.mkdir(exist_ok=True)
            print(f"Created directory: {dir_name}")

    def create_config(self):
        """Create configuration file"""
        config_path = self.install_dir / "config.json"
        with open(config_path, 'w') as f:
            json.dump(self.config, f, indent=2)
        print(f"Created configuration: {config_path}")

if __name__ == "__main__":
    setup = SweetApocalypseSetup()
    success = setup.run()
    sys.exit(0 if success else 1)
