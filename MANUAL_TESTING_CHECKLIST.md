# 🧪 Manual Testing Checklist - AI Comic Factory

## 🚀 Application Status
- **URL**: http://localhost:3000
- **Server**: Running ✅
- **Browser**: Open the preview link above

## 📋 Step-by-Step Testing Guide

### **Step 1: Initial Application Load**
1. Open http://localhost:3000 in your browser
2. Verify the Sweet Apocalypse theme loads (purple/pink gradient)
3. Check that all 6 tabs are visible: Story, AI Models, Cover, Layout, Generate, Downloads
4. Open browser console (F12) and run: `copy(window.testAIComicFactory.runAllTests())`

---

### **Step 2: Story Manager Testing** 📚
1. Click on the **"Story"** tab
2. **Test File Upload**:
   - Click "Upload Files" button
   - Select the `test-story.txt` file we created
   - Verify the story appears in the uploaded files list
   - Click "Preview" to see the story content
   - Click "Select" to make it the active story
3. **Test ZIP Upload**:
   - Create a ZIP file with multiple text files
   - Upload and verify extraction works
4. **Expected Results**:
   - ✅ Story preview shows content
   - ✅ File management buttons work
   - ✅ No console errors

---

### **Step 3: AI Model Manager Testing** 🤖
1. Click on the **"AI Models"** tab
2. **Test Model Selection**:
   - Browse available models (Qwen, OpenRouter, Ostris)
   - Click on different models to view details
   - Check model specifications and requirements
3. **Test Configuration**:
   - Try adding API keys (use dummy keys for testing)
   - Verify save/remove functionality
4. **Expected Results**:
   - ✅ Model cards display correctly
   - ✅ Configuration forms work
   - ✅ Status indicators show correct states

---

### **Step 4: Cover Page Generator Testing** 🎨
1. Click on the **"Cover"** tab
2. **Test Cover Design**:
   - Enter title: "The Sweet Apocalypse"
   - Enter author: "AI Comic Factory"
   - Select genre: "Fantasy"
   - Choose style: "Comic Book"
   - Select layout: "Centered"
   - Pick color scheme: "Purple Dreams"
3. **Test Preview**:
   - Verify live preview updates
   - Check that all fields affect the preview
4. **Test Generation**:
   - Click "Generate Cover Page"
   - Verify loading animation appears
5. **Expected Results**:
   - ✅ All form fields work
   - ✅ Preview updates in real-time
   - ✅ Generation process starts

---

### **Step 5: Comic Layout Selector Testing** 📖
1. Click on the **"Layout"** tab
2. **Test Layout Options**:
   - Click on each layout type: Flat Page, Up Page, Manga, Webcomic, Strip
   - Verify ASCII art previews appear
   - Check specifications (panels, aspect ratio)
   - Read layout descriptions
3. **Test Selection**:
   - Select "Flat Page" layout
   - Verify it becomes the active selection
4. **Expected Results**:
   - ✅ All 5 layouts display correctly
   - ✅ ASCII art is visible
   - ✅ Selection works properly

---

### **Step 6: Model Downloads Testing** ⬇️
1. Click on the **"Downloads"** tab
2. **Test Model Library**:
   - Browse all available models
   - Check system requirements for each model
   - View model sizes and descriptions
3. **Test Download Simulation**:
   - Click "Download" on "Flux Dev" model
   - Watch the progress bar animate
   - Try "Pause" button
   - Click "Resume" to continue
   - Wait for completion (simulated)
4. **Test Management**:
   - Try "Use Model" button on installed models
   - Test "Remove" functionality
5. **Expected Results**:
   - ✅ All models listed with details
   - ✅ Download progress works
   - ✅ Pause/resume functions work
   - ✅ Statistics update correctly

---

### **Step 7: Generation Workflow Testing** 🔄
1. Click on the **"Generate"** tab
2. **Test Complete Workflow**:
   - Verify selected story is displayed
   - Check AI model selection
   - Review cover page settings
   - Confirm layout choice
3. **Start Generation**:
   - Click "Generate Comic" button
   - Watch ChatGPT-style loading animation
   - Monitor progress through steps:
     - Step 1: Story Generation (3 seconds)
     - Step 2: Cover Generation (2 seconds)  
     - Step 3: Image Generation (5 seconds)
4. **Expected Results**:
   - ✅ All selections displayed
   - ✅ Loading animations work
   - ✅ Progress steps complete
   - ✅ Final result appears

---

### **Step 8: Text Editing Testing** ✏️
1. After generation, test text editing:
   - Double-click on any comic panel text
   - Verify edit mode activates
   - Type new text
   - Press Enter to save
   - Press Escape to cancel
2. **Expected Results**:
   - ✅ Double-click activates editing
   - ✅ Text can be modified
   - ✅ Save/cancel works correctly

---

### **Step 9: Ostris AI Toolkit Testing** 🔧
1. Navigate to Ostris Toolkit (if accessible)
2. **Test Dataset Upload**:
   - Try uploading training images
   - Check file validation
3. **Test Training Interface**:
   - Configure training parameters
   - Start mock training
   - Monitor progress
4. **Expected Results**:
   - ✅ Interface loads correctly
   - ✅ Forms are functional
   - ✅ Progress tracking works

---

### **Step 10: UI/UX Testing** 💅
1. **Theme Consistency**:
   - Check Sweet Apocalypse theme across all tabs
   - Verify purple/pink gradient backgrounds
   - Test hover states and animations
2. **Responsive Design**:
   - Resize browser window
   - Test on different screen sizes
   - Check mobile layout
3. **Accessibility**:
   - Test keyboard navigation
   - Check ARIA labels
   - Verify color contrast
4. **Expected Results**:
   - ✅ Consistent theming
   - ✅ Responsive layout
   - ✅ Accessible interface

---

## 📸 Screenshots Required

Take screenshots of:
1. **Main Dashboard** - All tabs visible
2. **Story Manager** - With uploaded test story
3. **AI Models** - Model selection interface  
4. **Cover Generator** - Filled form with preview
5. **Layout Selector** - All layout options
6. **Model Downloads** - Active download in progress
7. **Generation Process** - Loading animation
8. **Final Comic** - Generated result
9. **Text Editing** - Edit mode active
10. **Mobile View** - Responsive design

---

## 🎥 Video Recording Script

**Intro Video (3-4 minutes):**

1. **Opening (30s)**:
   - Show main dashboard with Sweet Apocalypse theme
   - Highlight all 6 tabs
   - Mention comprehensive feature set

2. **Story Upload (30s)**:
   - Upload test story file
   - Show preview and selection

3. **AI Model Setup (30s)**:
   - Browse AI models
   - Show model download interface

4. **Cover Design (30s)**:
   - Fill cover page form
   - Show live preview updates

5. **Layout Selection (20s)**:
   - Browse layout options
   - Show ASCII previews

6. **Generation Process (45s)**:
   - Start complete workflow
   - Show ChatGPT-style animations
   - Display final result

7. **Text Editing (30s)**:
   - Demonstrate double-click editing
   - Show save/cancel functionality

8. **Closing (15s)**:
   - Show all features working
   - Call to action for GitHub

---

## ✅ Success Criteria

- [ ] All tabs load without errors
- [ ] File uploads work correctly
- [ ] Mock downloads complete successfully
- [ ] Generation workflow completes
- [ ] Text editing functions properly
- [ ] UI is responsive and interactive
- [ ] No console errors
- [ ] All features accessible

---

## 🐛 Bug Reporting

If issues found:
1. **Screenshot** the problem
2. **Copy** console errors
3. **Describe** reproduction steps
4. **Note** browser and OS

---

## 🚀 Ready for GitHub

Once all tests pass:
1. **Commit** code changes
2. **Create** comprehensive README
3. **Upload** screenshots
4. **Add** intro video
5. **Deploy** to production

---

**Happy Testing! 🎉 Let me know when you're ready to proceed to GitHub!**
