// main.js

// *** YOUR DEFAULT IMAGE URL GOES HERE ***
// This image will load if the toggle is ON but the text box is empty.
const DEFAULT_BACKGROUND_URL = 'https://www.knykk.hu/hirek/wp-content/uploads/2025/06/Magyarorszag-vezeto-muszaki-egyeteme-atveszi-a-teljesitmenyalapu-finanszirozasi-modellt.jpg'; 

// --- 1. Dashboard Tweaks ---
function startDashboardTweaks(settings) {
    let attempts = 0;
    
    // Check if the background feature is turned on
    if (settings.featureBackground) {
        
        let urlToUse = settings.backgroundUrl.trim();
        
        // If the URL box is empty, fall back to our default!
        if (urlToUse === '') {
            urlToUse = DEFAULT_BACKGROUND_URL;
        }
        
        // Pass the chosen URL to the image script
        startHeaderImageTweaks(urlToUse); 
    }

    const checkInterval = setInterval(() => {
        attempts++;
        let menusDone = true;
        
        if (settings.featureHomeExpand) {
            menusDone = expandMenus(); 
        }
        
        const versionDone = injectVersion(); 
        
        if ((menusDone && versionDone) || attempts >= 10) {
            clearInterval(checkInterval);
        }
    }, 500);
}

// --- 2. Startup & Watchdog Logic --- 
function determinePageAndRun() {
    chrome.storage.local.get({
        featureBackground: true,
        backgroundUrl: '', 
        featureHomeExpand: true,
        featureListExpand: true
    }, (settings) => {
        
        // 1. GLOBAL: List Expander
        if (settings.featureListExpand) {
            startListExpander(); 
        }

        // 2. GLOBAL: Footer Version
        startFooterVersionTweaks();
        
        // 3. SPECIFIC: Dashboard
        if (location.href.includes('/dashboard')) {
            startDashboardTweaks(settings);
        } 
    });
}

// Start immediately
determinePageAndRun();

// Watchdog
let lastUrl = location.href;
setInterval(() => {
    const currentUrl = location.href;
    if (currentUrl !== lastUrl) {
        lastUrl = currentUrl; 
        setTimeout(determinePageAndRun, 50); 
    }
}, 100);