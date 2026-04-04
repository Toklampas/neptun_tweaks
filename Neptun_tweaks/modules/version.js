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
        
        // Check if the custom background is currently active
        const isCustomBg = document.querySelector('div.primary-bg-wrapper[data-image-set="true"]') !== null;
        
        versionLink.style.fontSize = '0.6em';
        versionLink.style.fontWeight = 'normal';
        versionLink.style.marginLeft = '8px';
        versionLink.style.textDecoration = 'none'; 
        
        // Set the initial color based on whether the image is currently active
        if (isCustomBg) {
            versionLink.style.color = 'white';
            versionLink.style.textShadow = '1px 1px 4px rgba(0, 0, 0, 0.8)';
        } else {
            versionLink.style.color = '#555'; // Darker grey for the default background
            versionLink.style.textShadow = '';
        }
        
        // Handle hover states dynamically
        versionLink.addEventListener('mouseover', () => {
            const hasBg = document.querySelector('div.primary-bg-wrapper[data-image-set="true"]') !== null;
            versionLink.style.color = hasBg ? '#add8e6' : '#0056b3'; // Light blue on image, Neptun blue on default
        });
        versionLink.addEventListener('mouseout', () => {
            const hasBg = document.querySelector('div.primary-bg-wrapper[data-image-set="true"]') !== null;
            versionLink.style.color = hasBg ? 'white' : '#555';
        });
        
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

        versionSpan.style.fontSize = '1em';
        versionSpan.style.color = '#ccc'; 
        versionSpan.style.marginLeft = '5px';

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