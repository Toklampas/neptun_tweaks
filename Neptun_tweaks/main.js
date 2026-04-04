// main.js

const DEFAULT_BACKGROUND_URL = 'https://www.knykk.hu/hirek/wp-content/uploads/2025/06/Magyarorszag-vezeto-muszaki-egyeteme-atveszi-a-teljesitmenyalapu-finanszirozasi-modellt.jpg'; 

// --- 1. Dashboard Tweaks ---
function startDashboardTweaks(settings) {
    let attempts = 0;
    
    if (settings.featureBackground) {
        let urlToUse = settings.backgroundUrl.trim();
        if (urlToUse === '') {
            urlToUse = DEFAULT_BACKGROUND_URL;
        }
        startHeaderImageTweaks(settings.bgType, urlToUse, settings.bgPositionY, settings.bgColor); 
    }

    const checkInterval = setInterval(() => {
        attempts++;
        let menusDone = true;
        let calendarDone = true;
        
        if (settings.featureHomeExpand) {
            menusDone = expandMenus(); 
        }
        
        if (settings.featureCalendarButton) {
            calendarDone = injectCalendarButton();
        }
        
        const versionDone = injectVersion(); 
        
        if ((menusDone && versionDone && calendarDone) || attempts >= 10) {
            clearInterval(checkInterval);
        }
    }, 500);
}

// --- 2. Startup & Watchdog Logic --- 
function determinePageAndRun() {
    chrome.storage.local.get(NEPTUN_TWEAKS_DEFAULTS, (settings) => {
        
        if (settings.featureListExpand) {
            startListExpander(settings.listExpandLimit); 
        }
        startFooterVersionTweaks();

        if (settings.featureAutoFilter) {
            startQueryTweaks();
        }
        
        if (location.href.includes('/dashboard')) {
            startDashboardTweaks(settings);
        } else if (location.href.includes('/login')) {
            if (settings.featureServerInfo) {
                startServerInfoMirror();
            } else {
                removeServerInfoMirror();
            }
        }
    });
}

// Start immediately
determinePageAndRun();

// Watchdog: detect SPA navigations
let lastUrl = location.href;
function onUrlChange() {
    const currentUrl = location.href;
    if (currentUrl !== lastUrl) {
        lastUrl = currentUrl;
        setTimeout(determinePageAndRun, 50);
    }
}

// Instant detection for browser back/forward buttons
window.addEventListener('popstate', onUrlChange);
window.addEventListener('hashchange', onUrlChange);

// Fallback poll for Angular's internal pushState navigations (1s is plenty —
// the page itself takes longer to render than that)
setInterval(onUrlChange, 1000);

// --- 3. NEW: Live Settings Listener ---
// This listens for any changes made in the popup menu in real-time
chrome.storage.onChanged.addListener((changes, namespace) => {
    // Only react if we are actually looking at the dashboard
    if (namespace === 'local' && location.href.includes('/dashboard')) {
        
        // Grab the freshest settings
        chrome.storage.local.get(NEPTUN_TWEAKS_DEFAULTS, (settings) => {
            let urlToUse = settings.backgroundUrl.trim();
            if (urlToUse === '') {
                urlToUse = DEFAULT_BACKGROUND_URL;
            }
            
            // Instantly apply the changes to the DOM!
            if (typeof window.updateLiveBackground === 'function') {
                window.updateLiveBackground(settings.featureBackground, settings.bgType, urlToUse, settings.bgPositionY, settings.bgColor);
            }
        });
    } else if (namespace === 'local' && location.href.includes('/login')) {
        chrome.storage.local.get({ featureServerInfo: true }, (settings) => {
            if (settings.featureServerInfo) {
                startServerInfoMirror();
            } else {
                removeServerInfoMirror();
            }
        });
    }
});