// main.js

// --- 1. Dashboard Tweaks ---
function startDashboardTweaks() {
    let attempts = 0;
    const checkInterval = setInterval(() => {
        attempts++;
        
        const menusDone = expandMenus();
        const versionDone = injectVersion();
        
        if ((menusDone && versionDone) || attempts >= 10) {
            clearInterval(checkInterval);
        }
    }, 500);
}

// --- 2. Startup & Watchdog Logic ---
function determinePageAndRun() {
    // ALWAYS run the list expander, no matter what URL we are on!
    startListExpander();
    
    // ONLY run the dashboard tweaks if we are actually on the dashboard
    if (location.href.includes('/dashboard')) {
        startDashboardTweaks();
    }
}

// A. Run immediately when the script first loads
determinePageAndRun();

// B. Watchdog: Check if the URL changed silently
let lastUrl = location.href;
setInterval(() => {
    const currentUrl = location.href;
    if (currentUrl !== lastUrl) {
        lastUrl = currentUrl; 
        
        // URL changed! Wait 0.5 seconds for Angular to load, then run our checks.
        setTimeout(determinePageAndRun, 500); 
    }
}, 1000);