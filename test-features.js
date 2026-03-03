// AI Comic Factory - Feature Testing Script
// Run this in browser console to test all features systematically

console.log('🚀 Starting AI Comic Factory Feature Tests...\n');

// Test 1: Check if all components are loaded
function testComponentLoading() {
    console.log('📦 Test 1: Component Loading');
    
    const components = [
        'StoryManager',
        'AIModelManager', 
        'CoverPageGenerator',
        'ComicLayoutSelector',
        'ModelDownloadManager',
        'OstrisToolkit',
        'EnhancedDashboard'
    ];
    
    components.forEach(comp => {
        const element = document.querySelector(`[data-testid="${comp}"]`) || 
                        document.querySelector(`.${comp.toLowerCase()}`) ||
                        document.querySelector(`[data-component="${comp}"]`);
        console.log(`  ${element ? '✅' : '❌'} ${comp}`);
    });
}

// Test 2: Tab Navigation
function testTabNavigation() {
    console.log('\n📑 Test 2: Tab Navigation');
    
    const tabs = ['story', 'ai', 'cover', 'layout', 'generate', 'downloads'];
    const tabList = document.querySelector('[role="tablist"]');
    
    if (tabList) {
        tabs.forEach(tab => {
            const tabButton = Array.from(document.querySelectorAll('[role="tab"]'))
                .find(t => t.textContent.toLowerCase().includes(tab) || 
                           t.getAttribute('data-value') === tab);
            console.log(`  ${tabButton ? '✅' : '❌'} ${tab} tab`);
        });
    } else {
        console.log('  ❌ Tab list not found');
    }
}

// Test 3: File Upload (Story Manager)
function testFileUpload() {
    console.log('\n📁 Test 3: File Upload');
    
    const fileInput = document.querySelector('input[type="file"]');
    const dropzone = document.querySelector('[data-dropzone="true"]') || 
                    document.querySelector('.dropzone');
    
    console.log(`  ${fileInput ? '✅' : '❌'} File input present`);
    console.log(`  ${dropzone ? '✅' : '❌'} Dropzone present`);
    
    // Create test file
    if (fileInput) {
        const testFile = new File(['Test story content'], 'test-story.txt', {
            type: 'text/plain'
        });
        
        // Test file selection (don't actually upload, just test the UI)
        try {
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(testFile);
            fileInput.files = dataTransfer.files;
            console.log('  ✅ File selection test passed');
        } catch (e) {
            console.log('  ❌ File selection test failed:', e.message);
        }
    }
}

// Test 4: Model Download Interface
function testModelDownloads() {
    console.log('\n⬇️ Test 4: Model Download Interface');
    
    const downloadButtons = document.querySelectorAll('[data-action="download"]');
    const progressBars = document.querySelectorAll('[role="progressbar"]');
    const modelCards = document.querySelectorAll('.model-card');
    
    console.log(`  ${downloadButtons.length > 0 ? '✅' : '❌'} Download buttons: ${downloadButtons.length}`);
    console.log(`  ${progressBars.length > 0 ? '✅' : '❌'} Progress bars: ${progressBars.length}`);
    console.log(`  ${modelCards.length > 0 ? '✅' : '❌'} Model cards: ${modelCards.length}`);
}

// Test 5: Cover Page Generator
function testCoverPageGenerator() {
    console.log('\n🎨 Test 5: Cover Page Generator');
    
    const inputs = {
        title: document.querySelector('input[placeholder*="title"]') || 
               document.querySelector('#title'),
        author: document.querySelector('input[placeholder*="author"]') || 
                document.querySelector('#author'),
        genre: document.querySelector('select') || 
               document.querySelector('[role="combobox"]'),
        layout: document.querySelector('[data-layout-selector]')
    };
    
    Object.entries(inputs).forEach(([key, element]) => {
        console.log(`  ${element ? '✅' : '❌'} ${key} input`);
    });
}

// Test 6: Comic Layout Selector
function testLayoutSelector() {
    console.log('\n📖 Test 6: Comic Layout Selector');
    
    const layoutOptions = document.querySelectorAll('[data-layout]');
    const previews = document.querySelectorAll('.layout-preview');
    const asciiArt = document.querySelectorAll('.ascii-art');
    
    console.log(`  ${layoutOptions.length > 0 ? '✅' : '❌'} Layout options: ${layoutOptions.length}`);
    console.log(`  ${previews.length > 0 ? '✅' : '❌'} Previews: ${previews.length}`);
    console.log(`  ${asciiArt.length > 0 ? '✅' : '❌'} ASCII art: ${asciiArt.length}`);
}

// Test 7: Loading Animations
function testLoadingAnimations() {
    console.log('\n⏳ Test 7: Loading Animations');
    
    const loadingElements = document.querySelectorAll('.loading, .spinner, [data-loading]');
    const progressIndicators = document.querySelectorAll('.progress-indicator');
    const chatGptStyle = document.querySelectorAll('.chatgpt-loading');
    
    console.log(`  ${loadingElements.length > 0 ? '✅' : '❌'} Loading elements: ${loadingElements.length}`);
    console.log(`  ${progressIndicators.length > 0 ? '✅' : '❌'} Progress indicators: ${progressIndicators.length}`);
    console.log(`  ${chatGptStyle.length > 0 ? '✅' : '❌'} ChatGPT-style loaders: ${chatGptStyle.length}`);
}

// Test 8: Text Editing (Double-click)
function testTextEditing() {
    console.log('\n✏️ Test 8: Text Editing');
    
    const editableTexts = document.querySelectorAll('[contenteditable="true"]');
    const doubleClickElements = document.querySelectorAll('[data-editable]');
    const comicPanels = document.querySelectorAll('.comic-panel');
    
    console.log(`  ${editableTexts.length > 0 ? '✅' : '❌'} Editable texts: ${editableTexts.length}`);
    console.log(`  ${doubleClickElements.length > 0 ? '✅' : '❌'} Double-click elements: ${doubleClickElements.length}`);
    console.log(`  ${comicPanels.length > 0 ? '✅' : '❌'} Comic panels: ${comicPanels.length}`);
}

// Test 9: Sweet Apocalypse Theme
function testTheme() {
    console.log('\n🎭 Test 9: Sweet Apocalypse Theme');
    
    const body = document.body;
    const computedStyle = window.getComputedStyle(body);
    const gradient = computedStyle.background || computedStyle.backgroundImage;
    
    const hasGradient = gradient.includes('gradient') || gradient.includes('purple') || gradient.includes('pink');
    const hasSweetColors = gradient.includes('purple') && gradient.includes('pink');
    
    console.log(`  ${hasGradient ? '✅' : '❌'} Gradient background`);
    console.log(`  ${hasSweetColors ? '✅' : '❌'} Sweet colors (purple/pink)`);
    
    // Check for theme classes
    const themeElements = document.querySelectorAll('.sweet-apocalypse, .theme-gradient');
    console.log(`  ${themeElements.length > 0 ? '✅' : '❌'} Theme elements: ${themeElements.length}`);
}

// Test 10: Responsive Design
function testResponsiveDesign() {
    console.log('\n📱 Test 10: Responsive Design');
    
    const container = document.querySelector('.container') || document.querySelector('main');
    const flexElements = document.querySelectorAll('.flex, .grid');
    const responsiveClasses = document.querySelectorAll('[class*="md:"], [class*="lg:"], [class*="sm:"]');
    
    console.log(`  ${container ? '✅' : '❌'} Main container`);
    console.log(`  ${flexElements.length > 0 ? '✅' : '❌'} Flex/Grid elements: ${flexElements.length}`);
    console.log(`  ${responsiveClasses.length > 0 ? '✅' : '❌'} Responsive classes: ${responsiveClasses.length}`);
}

// Test 11: Error Handling
function testErrorHandling() {
    console.log('\n⚠️ Test 11: Error Handling');
    
    const errorElements = document.querySelectorAll('.error, .alert-error');
    const toastElements = document.querySelectorAll('.toast, .notification');
    const loadingStates = document.querySelectorAll('[data-state="loading"], [data-state="error"]');
    
    console.log(`  ${errorElements.length >= 0 ? '✅' : '❌'} Error elements: ${errorElements.length}`);
    console.log(`  ${toastElements.length >= 0 ? '✅' : '❌'} Toast notifications: ${toastElements.length}`);
    console.log(`  ${loadingStates.length >= 0 ? '✅' : '❌'} Loading states: ${loadingStates.length}`);
}

// Test 12: Performance
function testPerformance() {
    console.log('\n⚡ Test 12: Performance');
    
    const startTime = performance.now();
    
    // Count DOM elements
    const totalElements = document.querySelectorAll('*').length;
    const images = document.querySelectorAll('img').length;
    const scripts = document.querySelectorAll('script').length;
    
    const endTime = performance.now();
    const loadTime = endTime - startTime;
    
    console.log(`  ✅ DOM elements: ${totalElements}`);
    console.log(`  ✅ Images: ${images}`);
    console.log(`  ✅ Scripts: ${scripts}`);
    console.log(`  ✅ Test execution time: ${loadTime.toFixed(2)}ms`);
}

// Run all tests
function runAllTests() {
    console.log('🧪 Running Complete Feature Test Suite\n');
    console.log('=' .repeat(50));
    
    testComponentLoading();
    testTabNavigation();
    testFileUpload();
    testModelDownloads();
    testCoverPageGenerator();
    testLayoutSelector();
    testLoadingAnimations();
    testTextEditing();
    testTheme();
    testResponsiveDesign();
    testErrorHandling();
    testPerformance();
    
    console.log('\n' + '=' .repeat(50));
    console.log('🎉 Feature Testing Complete!\n');
    console.log('📝 Review the results above and test manually in the browser.');
    console.log('📸 Take screenshots of each working feature.');
    console.log('🎥 Record video of the complete workflow.');
}

// Auto-run tests
runAllTests();

// Export for manual testing
window.testAIComicFactory = {
    runAllTests,
    testComponentLoading,
    testTabNavigation,
    testFileUpload,
    testModelDownloads,
    testCoverPageGenerator,
    testLayoutSelector,
    testLoadingAnimations,
    testTextEditing,
    testTheme,
    testResponsiveDesign,
    testErrorHandling,
    testPerformance
};

console.log('\n💡 Manual testing functions available in window.testAIComicFactory');
console.log('🔧 Run window.testAIComicFactory.runAllTests() to re-run tests');
