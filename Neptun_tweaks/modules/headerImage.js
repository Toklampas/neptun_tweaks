// modules/headerImage.js

function setHeaderImage(imageUrl) {
    const bgWrapper = document.querySelector('div.primary-bg-wrapper');
    
    if (bgWrapper && !bgWrapper.hasAttribute('data-image-set')) {
        bgWrapper.setAttribute('data-image-set', 'true');
        
        bgWrapper.style.backgroundImage = `url(${imageUrl})`;
        bgWrapper.style.backgroundSize = 'cover';    
        bgWrapper.style.backgroundPosition = 'center'; 
        bgWrapper.style.backgroundRepeat = 'no-repeat';
        bgWrapper.style.backgroundColor = 'transparent'; 
        
        const greetingText = document.querySelector('h3.header__title');
        if (greetingText) {
            greetingText.style.color = 'white';
            greetingText.style.textShadow = '1px 1px 4px rgba(0, 0, 0, 0.8)';
        }
        
        return true; 
    }
    
    return bgWrapper && bgWrapper.hasAttribute('data-image-set'); 
}

// Now we accept the customImageUrl as an argument
function startHeaderImageTweaks(customImageUrl) {
    
    // Safety check just in case it's empty
    if (!customImageUrl) {
      console.warn('Neptun Tweaks: No image URL provided.');
      return; 
    }
    
    let attempts = 0;
    const checkInterval = setInterval(() => {
        attempts++;
        if (setHeaderImage(customImageUrl) || attempts >= 10) {
            clearInterval(checkInterval);
        }
    }, 500);
}