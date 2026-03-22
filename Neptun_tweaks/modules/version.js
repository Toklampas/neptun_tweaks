// modules/version.js

// Function to add the version link to the header
function injectVersion() {
    const titleElement = document.querySelector('h3.header__title');
    
    if (titleElement && !document.getElementById('neptun-ext-version')) {
        const version = chrome.runtime.getManifest().version; 
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