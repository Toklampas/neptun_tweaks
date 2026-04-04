// popup.js

document.addEventListener('DOMContentLoaded', () => {
    const bgToggle = document.getElementById('bgToggle');
    const bgUrlInput = document.getElementById('bgUrlInput');
    const homeToggle = document.getElementById('homeToggle');
    const listToggle = document.getElementById('listToggle');
    
    // Position controls
    const shiftControls = document.getElementById('shiftControls');
    const bgPosUp5 = document.getElementById('bgPosUp5');
    const bgPosUp1 = document.getElementById('bgPosUp1');
    const bgPosDown1 = document.getElementById('bgPosDown1');
    const bgPosDown5 = document.getElementById('bgPosDown5');
    const bgPosReset = document.getElementById('bgPosReset');
    const bgPosValue = document.getElementById('bgPosValue');

    // 1. Load settings
    chrome.storage.local.get({
        featureBackground: true,
        backgroundUrl: '', 
        bgPositionY: 50, 
        featureHomeExpand: true,
        featureListExpand: true
    }, (settings) => {
        bgToggle.checked = settings.featureBackground;
        bgUrlInput.value = settings.backgroundUrl;
        homeToggle.checked = settings.featureHomeExpand;
        listToggle.checked = settings.featureListExpand;
        
        bgPosValue.innerText = settings.bgPositionY + '%';
        updateBackgroundControlsState(settings.featureBackground);
    });

    // Helper to gray out controls when feature is off
    function updateBackgroundControlsState(isEnabled) {
        bgUrlInput.disabled = !isEnabled;
        bgPosUp5.disabled = !isEnabled;
        bgPosUp1.disabled = !isEnabled;
        bgPosDown1.disabled = !isEnabled;
        bgPosDown5.disabled = !isEnabled;
        bgPosReset.disabled = !isEnabled;
        shiftControls.style.opacity = isEnabled ? '1' : '0.5';
    }

    // 2. Save settings when toggled/typed
    bgToggle.addEventListener('change', () => {
        chrome.storage.local.set({ featureBackground: bgToggle.checked });
        updateBackgroundControlsState(bgToggle.checked);
    });
    
    bgUrlInput.addEventListener('input', () => {
        chrome.storage.local.set({ backgroundUrl: bgUrlInput.value });
    });
    
    // --- 3. NEW: Multi-Step Shift Logic ---
    
    // Helper function that calculates and applies the new percentage
    function changeBgPosition(amount) {
        chrome.storage.local.get({ bgPositionY: 50 }, (data) => {
            let newVal;
            
            if (amount === 'reset') {
                newVal = 50; // Instantly snap back to center
            } else {
                newVal = data.bgPositionY + amount;
                // Keep the value strictly between 0% and 100%
                if (newVal < 0) newVal = 0;
                if (newVal > 100) newVal = 100;
            }
            
            // Save it to Chrome, which instantly triggers the live update on the page!
            chrome.storage.local.set({ bgPositionY: newVal });
            bgPosValue.innerText = newVal + '%';
        });
    }

    // Attach the helper function to all our new buttons
    // Remember: Moving "Up" means lowering the percentage.
    bgPosUp5.addEventListener('click', () => changeBgPosition(-5));
    bgPosUp1.addEventListener('click', () => changeBgPosition(-1));
    
    // Moving "Down" means increasing the percentage.
    bgPosDown1.addEventListener('click', () => changeBgPosition(1));
    bgPosDown5.addEventListener('click', () => changeBgPosition(5));
    
    // The reset button
    bgPosReset.addEventListener('click', () => changeBgPosition('reset'));
    
    // --- End Shift Logic ---

    homeToggle.addEventListener('change', () => {
        chrome.storage.local.set({ featureHomeExpand: homeToggle.checked });
    });
    
    listToggle.addEventListener('change', () => {
        chrome.storage.local.set({ featureListExpand: listToggle.checked });
    });
});