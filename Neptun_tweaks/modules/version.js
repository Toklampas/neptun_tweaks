// modules/version.js

// Global Footer function
function appendFooterVersion() {
    const originalVersionElement = document.querySelector('.footer__version');

    if (originalVersionElement && !document.getElementById('neptun-tweaks-footer-v')) {
        let version = "1.0";
        try { version = chrome.runtime.getManifest().version; } catch (e) { return true; }

        const versionLink = document.createElement('a');
        versionLink.id = 'neptun-tweaks-footer-v';
        versionLink.innerText = `Neptun Tweaks v${version}`;
        versionLink.href = 'https://github.com/Toklampas/neptun_tweaks';
        versionLink.target = '_blank';
        versionLink.title = 'Neptun Tweaks GitHub Repository';

        originalVersionElement.appendChild(versionLink);
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