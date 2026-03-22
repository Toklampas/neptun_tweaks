// Function that finds and clicks collapsed menus
function expandMenus() {
    const collapsedHeaders = document.querySelectorAll('mat-expansion-panel-header[aria-expanded="false"]');
    
    if (collapsedHeaders.length > 0) {
        collapsedHeaders.forEach(header => header.click());
        return true; 
    }
    return false; 
}

// Function to try expanding multiple times (for when the page is drawing)
function startExpanding() {
    let attempts = 0;
    const checkInterval = setInterval(() => {
        attempts++;
        if (expandMenus() || attempts >= 10) {
            clearInterval(checkInterval);
        }
    }, 500);
}

// 1. Run immediately when the page first loads
if (location.href.includes('/dashboard')) {
    startExpanding();
}

// 2. The "Watchdog": Check every half-second to see if the URL changed.
let lastUrl = location.href;
setInterval(() => {
    const currentUrl = location.href;
    // Did the URL change since we last checked?
    if (currentUrl !== lastUrl) {
        lastUrl = currentUrl; // Update our memory
        
        // Did we just navigate back to the dashboard?
        if (currentUrl.includes('/dashboard')) {
            startExpanding(); // Run the expander again!
        }
    }
}, 500);