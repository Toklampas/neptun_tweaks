// main.js

// Main function to run both tweaks while the page is loading
function startTweaks() {
    let attempts = 0;
    const checkInterval = setInterval(() => {
        attempts++;
        
        // These functions come from our module files!
        const menusDone = expandMenus();
        const versionDone = injectVersion();
        
        if ((menusDone && versionDone) || attempts >= 10) {
            clearInterval(checkInterval);
        }
    }, 500);
}

// --- Watchdog Logic ---
if (location.href.includes('/dashboard')) {
    startTweaks();
}

let lastUrl = location.href;
setInterval(() => {
    const currentUrl = location.href;
    if (currentUrl !== lastUrl) {
        lastUrl = currentUrl; 
        if (currentUrl.includes('/dashboard')) {
            startTweaks(); 
        }
    }
}, 500);