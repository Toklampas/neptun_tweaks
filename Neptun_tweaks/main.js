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

        if (typeof startDarkMode === 'function') {
            startDarkMode(settings.featureDarkMode);
        }

        if (settings.featureListExpand) {
            startListExpander(settings.listExpandLimit);
        }
        startFooterVersionTweaks();

        if (settings.featureAutoFilter) {
            startQueryTweaks();
        }

        if (location.href.includes('/dashboard')) {
            if (settings.featureAutoExam && !sessionStorage.getItem('neptunTweaksAutoExamRedirected')) {
                sessionStorage.setItem('neptunTweaksAutoExamRedirected', 'true');
                console.log("Neptun Tweaks: Auto Exam is ON. Redirecting to Exams page...");
                window.location.href = location.href.replace('/dashboard', '/exams/overview/registration');
                return;
            }
            startDashboardTweaks(settings);
        } else if (location.href.includes('/login')) {
            if (settings.featureServerInfo) {
                startServerInfoMirror();
            } else {
                removeServerInfoMirror();
            }
        } else if (location.href.includes('/exams')) {
            if (typeof startAutoExamRegistration === 'function') {
                startAutoExamRegistration(settings);
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
    if (namespace === 'local') {
        // Grab the freshest settings
        chrome.storage.local.get(NEPTUN_TWEAKS_DEFAULTS, (settings) => {
            
            // Instantly apply dark mode on any page
            if (typeof startDarkMode === 'function') {
                startDarkMode(settings.featureDarkMode);
            }

            // Dashboard-specific live updates
            if (location.href.includes('/dashboard')) {
                let urlToUse = settings.backgroundUrl.trim();
                if (urlToUse === '') {
                    urlToUse = DEFAULT_BACKGROUND_URL;
                }

                if (typeof window.updateLiveBackground === 'function') {
                    window.updateLiveBackground(settings.featureBackground, settings.bgType, urlToUse, settings.bgPositionY, settings.bgColor);
                }
            } 
            // Login-specific live updates
            else if (location.href.includes('/login')) {
                if (settings.featureServerInfo) {
                    startServerInfoMirror();
                } else {
                    removeServerInfoMirror();
                }
            }
        });
    }
});