// popup.js

document.addEventListener('DOMContentLoaded', () => {
    const bgToggle = document.getElementById('bgToggle');
    const bgUrlInput = document.getElementById('bgUrlInput');
    const bgTypeSelect = document.getElementById('bgTypeSelect');
    const bgColorInput = document.getElementById('bgColorInput');
    const bgTypeRow = document.getElementById('bgTypeRow');
    const bgColorRow = document.getElementById('bgColorRow');
    const homeToggle = document.getElementById('homeToggle');
    const listToggle = document.getElementById('listToggle');
    const listExpandLimit = document.getElementById('listExpandLimit');
    const listLimitRow = document.getElementById('listLimitRow');
    
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
        bgType: 'image',
        bgColor: '#0056b3',
        backgroundUrl: '', 
        bgPositionY: 50, 
        featureHomeExpand: true,
        featureListExpand: true,
        listExpandLimit: 500
    }, (settings) => {
        bgToggle.checked = settings.featureBackground;
        bgTypeSelect.value = settings.bgType;
        bgColorInput.value = settings.bgColor;
        bgUrlInput.value = settings.backgroundUrl;
        homeToggle.checked = settings.featureHomeExpand;
        listToggle.checked = settings.featureListExpand;
        listExpandLimit.value = settings.listExpandLimit;
        
        bgPosValue.innerText = settings.bgPositionY + '%';
        updateBackgroundControlsState(settings.featureBackground, settings.bgType);
        updateListControlsState(settings.featureListExpand);
    });

    // Helper to gray out controls when feature is off
    function updateBackgroundControlsState(isEnabled, bgType) {
        bgTypeSelect.disabled = !isEnabled;
        bgTypeRow.style.opacity = isEnabled ? '1' : '0.5';

        if (bgType === 'color') {
            bgColorRow.style.display = 'flex';
            bgUrlInput.style.display = 'none';
            shiftControls.style.display = 'none';
            bgColorInput.disabled = !isEnabled;
            bgColorRow.style.opacity = isEnabled ? '1' : '0.5';
        } else {
            bgColorRow.style.display = 'none';
            bgUrlInput.style.display = 'block';
            shiftControls.style.display = 'flex';
            bgUrlInput.disabled = !isEnabled;
            bgPosUp5.disabled = !isEnabled;
            bgPosUp1.disabled = !isEnabled;
            bgPosDown1.disabled = !isEnabled;
            bgPosDown5.disabled = !isEnabled;
            bgPosReset.disabled = !isEnabled;
            shiftControls.style.opacity = isEnabled ? '1' : '0.5';
        }
    }

    function updateListControlsState(isEnabled) {
        listExpandLimit.disabled = !isEnabled;
        listLimitRow.style.opacity = isEnabled ? '1' : '0.5';
    }

    // 2. Save settings when toggled/typed
    bgToggle.addEventListener('change', () => {
        chrome.storage.local.set({ featureBackground: bgToggle.checked });
        updateBackgroundControlsState(bgToggle.checked, bgTypeSelect.value);
    });

    bgTypeSelect.addEventListener('change', () => {
        chrome.storage.local.set({ bgType: bgTypeSelect.value });
        updateBackgroundControlsState(bgToggle.checked, bgTypeSelect.value);
    });

    bgColorInput.addEventListener('input', () => {
        chrome.storage.local.set({ bgColor: bgColorInput.value });
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
        updateListControlsState(listToggle.checked);
    });

    listExpandLimit.addEventListener('change', () => {
        const val = parseInt(listExpandLimit.value, 10);
        chrome.storage.local.set({ listExpandLimit: val });
    });
});