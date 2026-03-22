// modules/listExpander.js

let expanderInterval = null;

// Renamed slightly since it now works on ALL lists, not just students
function startListExpander() {
    // Clear any existing timers first
    if (expanderInterval) {
        clearInterval(expanderInterval);
    }

    // Run the check 10 times a second
    expanderInterval = setInterval(() => {
        
        // Find the button (No URL check anymore! We just look for the button everywhere)
        const loadMoreBtn = document.querySelector('button#next-visible-button');

        // If the button exists AND isn't disabled by Angular...
        if (loadMoreBtn && !loadMoreBtn.disabled) {
            // Click it silently in the background
            loadMoreBtn.click();
        }
        
    }, 100); 
}