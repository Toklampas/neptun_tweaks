// main.js

// --- 1. Functions from our module files (Orchestrators) ---

// Dashboard logic (version, accordion expander, and header image)
function startDashboardTweaks() {
    console.log('Neptun Tweaks: Dashboard detected. Starting tweaks.');
    let attempts = 0;
    
    // First, call the header image expander immediately.
    startHeaderImageTweaks(); 

    // Then, set up the interval to handle the complex Angular loads
    const checkInterval = setInterval(() => {
        attempts++;
        
        // These are safe to call, as they have attribute/error checks
        const menusDone = expandMenus(); // From homePageExpander.js
        const versionDone = injectVersion(); // From version.js
        
        if ((menusDone && versionDone) || attempts >= 10) {
            clearInterval(checkInterval);
        }
    }, 500);
}

// --- 2. Startup & Watchdog Logic --- 

function determinePageAndRun() {
    const currentUrl = location.href;
    
    // 1. ALWAYS run the list expander! 
    // It will quietly wait in the background on every page looking for the button.
    startListExpander(); 
    
    // 2. ONLY run the dashboard tweaks if we are actually on the dashboard.
    if (currentUrl.includes('/dashboard')) {
        startDashboardTweaks();
    } 
}

determinePageAndRun();

let lastUrl = location.href;
setInterval(() => {
    const currentUrl = location.href;
    if (currentUrl !== lastUrl) {
        lastUrl = currentUrl; 
        setTimeout(determinePageAndRun, 500); 
    }
}, 1000);