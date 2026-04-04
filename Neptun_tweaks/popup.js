// popup.js

document.addEventListener('DOMContentLoaded', () => {
    const bgToggle = document.getElementById('bgToggle');
    const bgUrlInput = document.getElementById('bgUrlInput');
    const homeToggle = document.getElementById('homeToggle');
    const listToggle = document.getElementById('listToggle');
    
    // New elements
    const shiftControls = document.getElementById('shiftControls');
    const bgPosUp = document.getElementById('bgPosUp');
    const bgPosDown = document.getElementById('bgPosDown');
    const bgPosValue = document.getElementById('bgPosValue');

    // 1. Load settings (Added bgPositionY, defaulting to 50%)
    chrome.storage.local.get({
        featureBackground: true,
        backgroundUrl: '', 
        bgPositionY: 50, // 50% is perfectly centered
        featureHomeExpand: true,
        featureListExpand: true
    }, (settings) => {
        bgToggle.checked = settings.featureBackground;
        bgUrlInput.value = settings.backgroundUrl;
        homeToggle.checked = settings.featureHomeExpand;
        listToggle.checked = settings.featureListExpand;
        
        // Setup shift controls
        bgPosValue.innerText = settings.bgPositionY + '%';
        updateBackgroundControlsState(settings.featureBackground);
    });

    // Helper to gray out controls when feature is off
    function updateBackgroundControlsState(isEnabled) {
        bgUrlInput.disabled = !isEnabled;
        bgPosUp.disabled = !isEnabled;
        bgPosDown.disabled = !isEnabled;
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
    
    // --- 3. NEW: Shift Button Logic ---
    // Moving the focal point "Up" means decreasing the percentage (0% is top)
    bgPosUp.addEventListener('click', () => {
        chrome.storage.local.get({ bgPositionY: 50 }, (data) => {
            let newVal = data.bgPositionY - 5;
            if (newVal < 0) newVal = 0; // Cap at 0%
            chrome.storage.local.set({ bgPositionY: newVal });
            bgPosValue.innerText = newVal + '%';
        });
    });

    bgPosDown.addEventListener('click', () => {
        chrome.storage.local.get({ bgPositionY: 50 }, (data) => {
            let newVal = data.bgPositionY + 5;
            if (newVal > 100) newVal = 100; // Cap at 100%
            chrome.storage.local.set({ bgPositionY: newVal });
            bgPosValue.innerText = newVal + '%';
        });
    });
    
    homeToggle.addEventListener('change', () => {
        chrome.storage.local.set({ featureHomeExpand: homeToggle.checked });
    });
    
    listToggle.addEventListener('change', () => {
        chrome.storage.local.set({ featureListExpand: listToggle.checked });
    });
});