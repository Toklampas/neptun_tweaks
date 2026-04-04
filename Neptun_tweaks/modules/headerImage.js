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
        
        // Toggle body class — CSS handles greeting text + version link colors
        document.body.classList.add('neptun-tweaks-custom-bg');
        
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
        
        // Remove body class — CSS reverts greeting text + version link colors
        document.body.classList.remove('neptun-tweaks-custom-bg');
    }
}