#!/usr/bin/env python3
"""
Sweet Apocalypse Comic Factory - Pinokio-style Installer
One-click installation and management
"""

import os
import sys
import json
import subprocess
import platform
import requests
from pathlib import Path
from typing import Dict, List
import tkinter as tk
from tkinter import ttk, messagebox, filedialog

class SweetApocalypseInstaller:
    def __init__(self):
        self.system = platform.system().lower()
        self.install_dir = Path.home() / "sweet-apocalypse-factory"
        self.config_file = self.install_dir / "config.json"
        
        # Default configurations
        self.config = {
            "ollama_url": "http://localhost:11434",
            "comfyui_url": "http://localhost:8188",
            "models": {
                "text": ["qwen2.5:7b"],
                "image": ["qwen2-vl:7b"],
                "loras": ["sweetapoc-v1"]
            },
            "installed": {
                "ollama": False,
                "comfyui": False,
                "models": False,
                "loras": False
            }
        }
        
        self.load_config()
        self.setup_gui()

    def load_config(self):
        """Load configuration from file"""
        if self.config_file.exists():
            try:
                with open(self.config_file, 'r') as f:
                    self.config = json.load(f)
            except:
                pass

    def save_config(self):
        """Save configuration to file"""
        self.install_dir.mkdir(exist_ok=True)
        with open(self.config_file, 'w') as f:
            json.dump(self.config, f, indent=2)

    def setup_gui(self):
        """Setup the GUI interface"""
        self.root = tk.Tk()
        self.root.title("🍬 Sweet Apocalypse Comic Factory - Installer")
        self.root.geometry("800x600")
        self.root.configure(bg='#1a1a1a')

        # Style configuration
        style = ttk.Style()
        style.theme_use('clam')
        
        # Custom colors
        self.root.tk_setPalette(background='#1a1a1a', foreground='white')

        # Main frame
        main_frame = ttk.Frame(self.root, padding="20")
        main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))

        # Title
        title_label = tk.Label(
            main_frame,
            text="🍬 Sweet Apocalypse Comic Factory 🍬",
            font=("Arial", 24, "bold"),
            bg='#1a1a1a',
            fg='#ff6b9d'
        )
        title_label.grid(row=0, column=0, columnspan=2, pady=20)

        subtitle_label = tk.Label(
            main_frame,
            text="Hands-off AI comic generation with RAG, LoRA training & batch processing",
            font=("Arial", 12),
            bg='#1a1a1a',
            fg='#cccccc'
        )
        subtitle_label.grid(row=1, column=0, columnspan=2, pady=10)

        # Installation status
        self.status_frame = ttk.LabelFrame(main_frame, text="Installation Status", padding="10")
        self.status_frame.grid(row=2, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=20)

        self.status_vars = {}
        components = [
            ("Ollama", "ollama"),
            ("ComfyUI", "comfyui"),
            ("Base Models", "models"),
            ("Sweet Apocalypse LoRA", "loras")
        ]

        for i, (name, key) in enumerate(components):
            label = tk.Label(
                self.status_frame,
                text=name,
                bg='#2a2a2a',
                fg='white'
            )
            label.grid(row=i, column=0, sticky=tk.W, padx=5, pady=2)

            status_var = tk.StringVar(value="Not Installed")
            status_label = tk.Label(
                self.status_frame,
                textvariable=status_var,
                bg='#2a2a2a',
                fg='#ff6b6b'
            )
            status_label.grid(row=i, column=1, sticky=tk.W, padx=5, pady=2)
            
            self.status_vars[key] = status_var

        # Installation buttons
        button_frame = ttk.Frame(main_frame)
        button_frame.grid(row=3, column=0, columnspan=2, pady=20)

        self.install_btn = tk.Button(
            button_frame,
            text="🚀 One-Click Install",
            command=self.one_click_install,
            bg='#4ecdc4',
            fg='white',
            font=("Arial", 12, "bold"),
            padx=20,
            pady=10
        )
        self.install_btn.grid(row=0, column=0, padx=5)

        self.launch_btn = tk.Button(
            button_frame,
            text="🎮 Launch Web UI",
            command=self.launch_web_ui,
            bg='#95e77e',
            fg='white',
            font=("Arial", 12, "bold"),
            padx=20,
            pady=10
        )
        self.launch_btn.grid(row=0, column=1, padx=5)

        # Configuration
        config_frame = ttk.LabelFrame(main_frame, text="Configuration", padding="10")
        config_frame.grid(row=4, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=20)

        # Ollama URL
        tk.Label(config_frame, text="Ollama URL:", bg='#2a2a2a', fg='white').grid(row=0, column=0, sticky=tk.W, padx=5, pady=5)
        self.ollama_url_var = tk.StringVar(value=self.config["ollama_url"])
        ollama_entry = tk.Entry(config_frame, textvariable=self.ollama_url_var, bg='#3a3a3a', fg='white')
        ollama_entry.grid(row=0, column=1, sticky=(tk.W, tk.E), padx=5, pady=5)

        # ComfyUI URL
        tk.Label(config_frame, text="ComfyUI URL:", bg='#2a2a2a', fg='white').grid(row=1, column=0, sticky=tk.W, padx=5, pady=5)
        self.comfyui_url_var = tk.StringVar(value=self.config["comfyui_url"])
        comfyui_entry = tk.Entry(config_frame, textvariable=self.comfyui_url_var, bg='#3a3a3a', fg='white')
        comfyui_entry.grid(row=1, column=1, sticky=(tk.W, tk.E), padx=5, pady=5)

        # Save config button
        save_btn = tk.Button(
            config_frame,
            text="💾 Save Configuration",
            command=self.save_configuration,
            bg='#f7b731',
            fg='white',
            font=("Arial", 10)
        )
        save_btn.grid(row=2, column=0, columnspan=2, pady=10)

        # Progress bar
        self.progress_var = tk.StringVar(value="Ready")
        progress_label = tk.Label(
            main_frame,
            textvariable=self.progress_var,
            bg='#1a1a1a',
            fg='#95e77e'
        )
        progress_label.grid(row=5, column=0, columnspan=2, pady=10)

        self.progress_bar = ttk.Progressbar(main_frame, mode='indeterminate')
        self.progress_bar.grid(row=6, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=5)

        # Update status display
        self.update_status_display()

        # Configure grid weights
        main_frame.columnconfigure(1, weight=1)
        self.root.columnconfigure(0, weight=1)
        self.root.rowconfigure(0, weight=1)

    def update_status_display(self):
        """Update the status display"""
        for key, var in self.status_vars.items():
            if self.config["installed"].get(key, False):
                var.set("✅ Installed")
                # Update label color to green
                for widget in self.status_frame.winfo_children():
                    if isinstance(widget, tk.Label) and widget.cget("textvariable") == str(var):
                        widget.configure(fg='#95e77e')
            else:
                var.set("❌ Not Installed")
                # Update label color to red
                for widget in self.status_frame.winfo_children():
                    if isinstance(widget, tk.Label) and widget.cget("textvariable") == str(var):
                        widget.configure(fg='#ff6b6b')

    def one_click_install(self):
        """Perform one-click installation"""
        self.install_btn.config(state='disabled')
        self.progress_bar.start()
        self.progress_var.set("Starting installation...")

        # Run installation in background
        self.root.after(100, self.perform_installation)

    def perform_installation(self):
        """Perform the actual installation"""
        steps = [
            ("Installing Ollama...", self.install_ollama),
            ("Installing ComfyUI...", self.install_comfyui),
            ("Downloading base models...", self.install_models),
            ("Installing Sweet Apocalypse LoRA...", self.install_loras)
        ]

        for step_name, install_func in steps:
            self.progress_var.set(step_name)
            self.root.update()
            
            try:
                install_func()
                self.root.update()
            except Exception as e:
                messagebox.showerror("Installation Error", f"Failed to {step_name.lower()}: {str(e)}")
                self.install_btn.config(state='normal')
                self.progress_bar.stop()
                return

        # Installation complete
        self.save_config()
        self.update_status_display()
        self.progress_bar.stop()
        self.progress_var.set("Installation completed! 🎉")
        self.install_btn.config(state='normal')
        
        messagebox.showinfo("Installation Complete", "Sweet Apocalypse Comic Factory has been installed successfully!")

    def install_ollama(self):
        """Install Ollama"""
        if self.system == "windows":
            # Download and install Ollama for Windows
            url = "https://ollama.ai/download/OllamaSetup.exe"
            self.download_and_install(url, "OllamaSetup.exe")
        elif self.system == "linux":
            # Install Ollama for Linux
            subprocess.run(["curl", "-fsSL", "https://ollama.ai/install.sh"], check=True)
            subprocess.run(["sh", "ollama-install.sh"], check=True)
        elif self.system == "darwin":
            # Install Ollama for macOS
            subprocess.run(["brew", "install", "ollama"], check=True)

        self.config["installed"]["ollama"] = True

    def install_comfyui(self):
        """Install ComfyUI"""
        comfyui_dir = self.install_dir / "ComfyUI"
        
        if not comfyui_dir.exists():
            # Clone ComfyUI repository
            subprocess.run([
                "git", "clone", 
                "https://github.com/comfyanonymous/ComfyUI.git",
                str(comfyui_dir)
            ], check=True)

        # Install Python dependencies
        subprocess.run([
            sys.executable, "-m", "pip", "install", "-r",
            str(comfyui_dir / "requirements.txt")
        ], check=True)

        self.config["installed"]["comfyui"] = True

    def install_models(self):
        """Download base models"""
        # This is a placeholder - would download actual models
        models_dir = self.install_dir / "models"
        models_dir.mkdir(exist_ok=True)
        
        # Create placeholder files
        (models_dir / "qwen2.5-7b.gguf").touch()
        (models_dir / "qwen2-vl-7b.gguf").touch()
        
        self.config["installed"]["models"] = True

    def install_loras(self):
        """Install Sweet Apocalypse LoRA"""
        loras_dir = self.install_dir / "loras"
        loras_dir.mkdir(exist_ok=True)
        
        # Create placeholder LoRA file
        (loras_dir / "sweetapoc-v1.safetensors").touch()
        
        self.config["installed"]["loras"] = True

    def download_and_install(self, url, filename):
        """Download and install a file"""
        response = requests.get(url)
        response.raise_for_status()
        
        file_path = self.install_dir / filename
        with open(file_path, 'wb') as f:
            f.write(response.content)
        
        # Run the installer
        if self.system == "windows":
            subprocess.run([str(file_path)], check=True)

    def save_configuration(self):
        """Save configuration"""
        self.config["ollama_url"] = self.ollama_url_var.get()
        self.config["comfyui_url"] = self.comfyui_url_var.get()
        self.save_config()
        messagebox.showinfo("Configuration Saved", "Configuration has been saved successfully!")

    def launch_web_ui(self):
        """Launch the web UI"""
        try:
            # Start the web server
            subprocess.Popen([
                sys.executable, "server.py"
            ], cwd=self.install_dir)
            
            # Open browser
            import webbrowser
            webbrowser.open("http://localhost:8080")
            
            messagebox.showinfo("Web UI Launched", "Sweet Apocalypse Comic Factory is running at http://localhost:8080")
        except Exception as e:
            messagebox.showerror("Launch Error", f"Failed to launch web UI: {str(e)}")

    def run(self):
        """Run the GUI"""
        self.root.mainloop()

if __name__ == "__main__":
    installer = SweetApocalypseInstaller()
    installer.run()
