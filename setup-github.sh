#!/bin/bash

# Candy Crucible Comic Forge - GitHub Setup Script
# This script helps you create the repository and push all files

echo "🍬 Candy Crucible Comic Forge - GitHub Setup"
echo "=========================================="

# Repository information
REPO_NAME="candy-crucible-comic-forge"
REPO_DESCRIPTION="🍬 Candy Crucible Comic Forge - AI Toolkit Edition. Ultimate Sweet Apocalypse comic generation with advanced LoRA training, RAG context, and one-click installation."

echo "📁 Setting up local repository..."

# Initialize git repository if not already done
if [ ! -d ".git" ]; then
    git init
    echo "✅ Git repository initialized"
else
    echo "✅ Git repository already exists"
fi

# Add all files
echo "📦 Adding all files to git..."
git add .

# Create initial commit
echo "💾 Creating initial commit..."
git commit -m "🍬 Initial Release: Candy Crucible Comic Forge - AI Toolkit Edition

🚀 Features:
- AI Toolkit integration for professional LoRA training
- Sweet Apocalypse universe with character consistency
- One-click installation with Pinokio-style GUI
- Advanced RAG context system for story memory
- Batch generation with ComfyUI automation
- Beautiful Candy Crucible web interface
- Multi-deployment options (local, HF Spaces, Replicate, Docker)

🎨 Sweet Apocalypse Universe:
- Bruges-infected setting with candy mutations
- Character consistency (Lucas, Clara) with fixed seeds
- Dark-tragic aesthetic enforcement
- Mutation types: crystalline, candy, emotional, twisted

🤖 AI Toolkit Features:
- LoRA, Fine-Tuning, Textual Inversion, DreamBooth
- FLUX Dev, SDXL, Stable Diffusion support
- Real-time training progress monitoring
- Professional workflow integration

🍬 Ready to forge Sweet Apocalypse comics!
"

echo ""
echo "🔗 Next Steps:"
echo "1. Create repository on GitHub: https://github.com/new"
echo "2. Repository name: $REPO_NAME"
echo "3. Description: $REPO_DESCRIPTION"
echo "4. Make it PUBLIC"
echo "5. DO NOT initialize with README (we already have one)"
echo "6. Click 'Create repository'"
echo ""
echo "7. Then run these commands:"
echo "   git remote add origin https://github.com/WayaSteurbautYT/$REPO_NAME.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "🎉 Your Candy Crucible Comic Forge will be live on GitHub!"
echo ""
echo "📋 Repository URL will be: https://github.com/WayaSteurbautYT/$REPO_NAME"
