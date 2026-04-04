// modules/version.js

// 1. Dashboard specific function
function injectVersion() {
    const titleElement = document.querySelector('h3.header__title');
    
    if (titleElement && !document.getElementById('neptun-ext-version')) {
        let version = "1.0"; 
        try { version = chrome.runtime.getManifest().version; } catch (e) { return true; }
        
        const versionLink = document.createElement('a');
        versionLink.id = 'neptun-ext-version'; 
        versionLink.innerText = ` (Neptun Tweaks - v${version})`;
        versionLink.href = 'https://github.com/Toklampas/neptun_tweaks';
        versionLink.target = '_blank';
        
        titleElement.appendChild(versionLink);
        return true;
    }
    return document.getElementById('neptun-ext-version') !== null; 
}

// 2. Global Footer function
function appendFooterVersion() {
    const originalVersionElement = document.querySelector('.footer__version');

    if (originalVersionElement && !document.getElementById('neptun-tweaks-footer-v')) {
        let version = "1.0";
        try { version = chrome.runtime.getManifest().version; } catch (e) { return true; }

        const versionSpan = document.createElement('span');
        versionSpan.id = 'neptun-tweaks-footer-v'; 
        versionSpan.innerText = ` (Neptun Tweaks - v${version})`;

        originalVersionElement.appendChild(versionSpan);
        return true; 
    }
    return document.getElementById('neptun-tweaks-footer-v') !== null;
}

// Global orchestrator for the footer
function startFooterVersionTweaks() {
    let attempts = 0;
    const footerInterval = setInterval(() => {
        attempts++;
        if (appendFooterVersion() || attempts >= 10) {
            clearInterval(footerInterval);
        }
    }, 500);
}