// modules/headerImage.js

function setHeaderImage(bgType, imageUrl, bgPositionY, bgColor) {
    const bgWrapper = document.querySelector('div.primary-bg-wrapper');
    
    if (bgWrapper && !bgWrapper.hasAttribute('data-image-set')) {
        bgWrapper.setAttribute('data-image-set', 'true');
        
        if (bgType === 'color') {
            bgWrapper.style.backgroundImage = 'none';
            bgWrapper.style.backgroundColor = bgColor;
        } else {
            bgWrapper.style.backgroundImage = `url(${imageUrl})`;
            bgWrapper.style.backgroundSize = 'cover';    
            bgWrapper.style.backgroundPosition = `center ${bgPositionY}%`; 
            bgWrapper.style.backgroundRepeat = 'no-repeat';
            bgWrapper.style.backgroundColor = 'transparent'; 
        }
        
        const greetingText = document.querySelector('h3.header__title');
        if (greetingText) {
            greetingText.style.color = 'white';
            greetingText.style.textShadow = '1px 1px 4px rgba(0, 0, 0, 0.8)';
        }

        // Also update the version link if it's already on the screen
        const versionLink = document.getElementById('neptun-ext-version');
        if (versionLink) {
            versionLink.style.color = 'white';
            versionLink.style.textShadow = '1px 1px 4px rgba(0, 0, 0, 0.8)';
        }
        
        return true; 
    }
    
    return bgWrapper && bgWrapper.hasAttribute('data-image-set'); 
}

function startHeaderImageTweaks(bgType, customImageUrl, bgPositionY, bgColor) {
    if (bgType === 'image' && !customImageUrl) return; 
    
    let attempts = 0;
    const checkInterval = setInterval(() => {
        attempts++;
        if (setHeaderImage(bgType, customImageUrl, bgPositionY, bgColor) || attempts >= 10) {
            clearInterval(checkInterval);
        }
    }, 500);
}

// Live Update Function
window.updateLiveBackground = function(isEnabled, bgType, imageUrl, bgPositionY, bgColor) {
    const bgWrapper = document.querySelector('div.primary-bg-wrapper');
    const greetingText = document.querySelector('h3.header__title');
    const versionLink = document.getElementById('neptun-ext-version');

    if (!bgWrapper) return;

    if (isEnabled) {
        // Force the setter to run again by removing the attribute
        bgWrapper.removeAttribute('data-image-set');
        setHeaderImage(bgType, imageUrl, bgPositionY, bgColor);
    } else {
        // Strip custom styles away
        bgWrapper.removeAttribute('data-image-set');
        bgWrapper.style.backgroundImage = '';
        bgWrapper.style.backgroundColor = ''; 
        
        if (greetingText) {
            greetingText.style.color = '';
            greetingText.style.textShadow = '';
        }

        // Reset the version link back to dark grey!
        if (versionLink) {
            versionLink.style.color = '#555';
            versionLink.style.textShadow = '';
        }
    }
}