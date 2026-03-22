// modules/headerImage.js

function setHeaderImage(imageUrl) {
    // 1. CHANGE: Target the outer full-width wrapper instead of the inner one
    const bgWrapper = document.querySelector('div.primary-bg-wrapper');
    
    if (bgWrapper && !bgWrapper.hasAttribute('data-image-set')) {
        console.log('Neptun Tweaks: Setting full-width header background image...');
        
        bgWrapper.setAttribute('data-image-set', 'true');
        
        // Apply the background to the full-width container
        bgWrapper.style.backgroundImage = `url(${imageUrl})`;
        bgWrapper.style.backgroundSize = 'cover';    
        bgWrapper.style.backgroundPosition = 'center'; 
        bgWrapper.style.backgroundRepeat = 'no-repeat';
        
        // Remove the default blue color just in case it interferes
        bgWrapper.style.backgroundColor = 'transparent'; 
        
        // 2. Readability Tweaks
        const greetingText = document.querySelector('h3.header__title');
        if (greetingText) {
            greetingText.style.color = 'white';
            // Add a subtle drop shadow so the text pops against bright images
            greetingText.style.textShadow = '1px 1px 4px rgba(0, 0, 0, 0.8)';
        }
        
        return true; 
    }
    
    return bgWrapper && bgWrapper.hasAttribute('data-image-set'); 
}

function startHeaderImageTweaks() {
    // Paste your image URL here again!
    const customImageUrl = 'https://www.knykk.hu/hirek/wp-content/uploads/2025/06/Magyarorszag-vezeto-muszaki-egyeteme-atveszi-a-teljesitmenyalapu-finanszirozasi-modellt.jpg';
    
    if (customImageUrl === '*** YOUR_IMAGE_URL_HERE ***' || customImageUrl === '') {
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