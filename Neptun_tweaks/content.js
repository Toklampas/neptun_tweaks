// 1. Function that finds and clicks collapsed menus
function expandMenus() {
    const collapsedHeaders = document.querySelectorAll('mat-expansion-panel-header[aria-expanded="false"]');
    
    if (collapsedHeaders.length > 0) {
        collapsedHeaders.forEach(header => header.click());
        return true; 
    }
    return false; 
}

// 2. Function to add the version link to the header
function injectVersion() {
    // Find the greeting element
    const titleElement = document.querySelector('h3.header__title');
    
    // Check if we found the title AND make sure we haven't already added the version text
    if (titleElement && !document.getElementById('neptun-ext-version')) {
        // Ask Chrome for the version number from manifest.json
        const version = chrome.runtime.getManifest().version; 
        
        // Create a new anchor (link) element
        const versionLink = document.createElement('a');
        versionLink.id = 'neptun-ext-version'; 
        versionLink.innerText = ` (Neptun tweaks - v${version})`;
        
        // Set the link to your GitHub repo and make it open in a new tab
        versionLink.href = 'https://github.com/Toklampas/neptun_tweaks';
        versionLink.target = '_blank';
        
        // Styling to make it fit in nicely
        versionLink.style.fontSize = '0.6em';
        versionLink.style.color = '#888';
        versionLink.style.fontWeight = 'normal';
        versionLink.style.marginLeft = '8px';
        versionLink.style.textDecoration = 'none'; // Removes the default link underline
        
        // Add a simple hover effect so it feels like a clickable link
        versionLink.addEventListener('mouseover', () => versionLink.style.color = '#0056b3');
        versionLink.addEventListener('mouseout', () => versionLink.style.color = '#888');
        
        // Attach it to the end of the greeting
        titleElement.appendChild(versionLink);
        return true;
    }
    
    // Return true if our text is already there so the interval knows it's done
    return document.getElementById('neptun-ext-version') !== null; 
}

// 3. Main function to run both tweaks while the page is loading
function startTweaks() {
    let attempts = 0;
    const checkInterval = setInterval(() => {
        attempts++;
        
        // Try running both functions
        const menusDone = expandMenus();
        const versionDone = injectVersion();
        
        // If both tasks succeeded, OR we tried 10 times, stop checking
        if (menusDone && versionDone || attempts >= 10) {
            clearInterval(checkInterval);
        }
    }, 500);
}

// --- Watchdog Logic (Checks if URL changed back to dashboard) ---

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
