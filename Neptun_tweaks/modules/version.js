// modules/version.js (Updated for Readability against Background Images)

function injectVersion() {
    const titleElement = document.querySelector('h3.header__title');
    
    if (titleElement && !document.getElementById('neptun-ext-version')) {
        let version = "1.0"; 
        
        try {
            version = chrome.runtime.getManifest().version; 
        } catch (error) {
            console.warn("Neptun Tweaks: Extension updated. Please refresh the page to reconnect.");
            return true; 
        }
        
        const versionLink = document.createElement('a');
        versionLink.id = 'neptun-ext-version'; 
        versionLink.innerText = ` (Neptun Tweaks - v${version})`;
        versionLink.href = 'https://github.com/Toklampas/neptun_tweaks';
        versionLink.target = '_blank';
        
        versionLink.style.fontSize = '0.6em';
        // *** READABILITY TWEAK ***
        // Set to white for visibility against any background image
        versionLink.style.color = 'white'; 
        versionLink.style.fontWeight = 'normal';
        versionLink.style.marginLeft = '8px';
        versionLink.style.textDecoration = 'none'; 
        
        // *** HOVER EFFECTS ***
        // Add a light blue hover effect that stands out against white text
        versionLink.addEventListener('mouseover', () => versionLink.style.color = '#add8e6'); // Light blue hover
        versionLink.addEventListener('mouseout', () => versionLink.style.color = 'white'); 
        
        titleElement.appendChild(versionLink);
        return true;
    }
    
    return document.getElementById('neptun-ext-version') !== null; 
}