// modules/listExpander.js

let expanderInterval = null;
let clickCount = 0;
let MAX_CLICKS = 50; // 50 clicks * 10 items = 500 items

// We add a listener to the whole document to watch for your manual clicks
document.addEventListener('click', (event) => {
    // 1. Did the click happen on or inside our target button?
    const clickedButton = event.target.closest('button#next-visible-button, button#user-list-load-more');

    // 2. event.isTrusted is TRUE only if a real human clicked the mouse.
    // If it's true, it means YOU clicked it, so we reset the counter to 0!
    if (clickedButton && event.isTrusted) {
        console.log(`Neptun Tweaks: Manual click detected! Loading up to the limit again...`);
        clickCount = 0;
    }
});

function startListExpander(limit = 500) {
    // Clear any existing timers first
    if (expanderInterval) {
        clearInterval(expanderInterval);
    }

    MAX_CLICKS = Math.ceil(limit / 10) - 1; // -1 because the first 10 items are already loaded

    // Reset the counter every time you navigate to a new page
    clickCount = 0;
    console.log(`Neptun Tweaks: Auto-expander active. Limit set to ${limit} items (${MAX_CLICKS} clicks).`);

    // Run the check 10 times a second
    expanderInterval = setInterval(() => {

        const loadMoreBtn = document.querySelector('button#next-visible-button, button#user-list-load-more');

        // If the button exists, isn't disabled, AND we haven't hit our limit...
        if (loadMoreBtn && !loadMoreBtn.disabled) {
            if (clickCount < MAX_CLICKS) {
                // Click it and increase our counter
                loadMoreBtn.click();
                clickCount++;
            }
        }

    }, 100);
}