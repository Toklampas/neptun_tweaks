// modules/version.js

function injectVersion() {
    const titleElement = document.querySelector('h3.header__title');
    
    if (titleElement && !document.getElementById('neptun-ext-version')) {
        let version = "1.0"; // Fallback version
        
        // Try to get the version from Chrome. 
        // If the extension was reloaded but the page wasn't, this will gracefully fail.
        try {
            version = chrome.runtime.getManifest().version; 
        } catch (error) {
            console.warn("Neptun Tweaks: Extension updated. Please refresh the page to reconnect.");
            return true; // Pretend we succeeded so the interval stops trying
        }
        
        const versionLink = document.createElement('a');
        versionLink.id = 'neptun-ext-version'; 
        versionLink.innerText = ` (Neptun tweaks - v${version})`;
        versionLink.href = 'https://github.com/Toklampas/neptun_tweaks';
        versionLink.target = '_blank';
        
        versionLink.style.fontSize = '0.6em';
        versionLink.style.color = '#888';
        versionLink.style.fontWeight = 'normal';
        versionLink.style.marginLeft = '8px';
        versionLink.style.textDecoration = 'none'; 
        
        versionLink.addEventListener('mouseover', () => versionLink.style.color = '#0056b3');
        versionLink.addEventListener('mouseout', () => versionLink.style.color = '#888');
        
        titleElement.appendChild(versionLink);
        return true;
    }
    
    return document.getElementById('neptun-ext-version') !== null; 
}