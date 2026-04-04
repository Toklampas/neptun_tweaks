// popup.js

document.addEventListener('DOMContentLoaded', () => {
    const bgToggle = document.getElementById('bgToggle');
    const bgUrlInput = document.getElementById('bgUrlInput');
    const bgTypeSelect = document.getElementById('bgTypeSelect');
    const bgColorInput = document.getElementById('bgColorInput');
    const bgHexInput = document.getElementById('bgHexInput');
    const openOptionsPage = document.getElementById('openOptionsPage');
    const bgTypeRow = document.getElementById('bgTypeRow');
    const bgColorRow = document.getElementById('bgColorRow');

    // Detect Firefox: hide native color picker (it closes the popup), show hex input instead
    const isFirefox = navigator.userAgent.includes('Firefox');
    const bgColorLabel = bgColorRow.querySelector('label');
    if (isFirefox) {
        bgColorInput.style.display = 'none';
        bgColorLabel.textContent = 'Hex Color Code';
    } else {
        bgHexInput.style.display = 'none';
        bgColorLabel.textContent = 'Choose Color';
    }
    const homeToggle = document.getElementById('homeToggle');
    const calendarToggle = document.getElementById('calendarToggle');
    const listToggle = document.getElementById('listToggle');
    const listExpandLimit = document.getElementById('listExpandLimit');
    const listLimitRow = document.getElementById('listLimitRow');
    const serverInfoToggle = document.getElementById('serverInfoToggle');
    const autoFilterToggle = document.getElementById('autoFilterToggle');
    
    // Position controls
    const shiftControls = document.getElementById('shiftControls');
    const bgPosUp5 = document.getElementById('bgPosUp5');
    const bgPosUp1 = document.getElementById('bgPosUp1');
    const bgPosDown1 = document.getElementById('bgPosDown1');
    const bgPosDown5 = document.getElementById('bgPosDown5');
    const bgPosReset = document.getElementById('bgPosReset');
    const bgPosValue = document.getElementById('bgPosValue');

    // 1. Load settings
    chrome.storage.local.get(NEPTUN_TWEAKS_DEFAULTS, (settings) => {
        bgToggle.checked = settings.featureBackground;
        bgTypeSelect.value = settings.bgType;
        bgColorInput.value = settings.bgColor;
        bgUrlInput.value = settings.backgroundUrl;
        homeToggle.checked = settings.featureHomeExpand;
        calendarToggle.checked = settings.featureCalendarButton;
        listToggle.checked = settings.featureListExpand;
        listExpandLimit.value = settings.listExpandLimit;
        serverInfoToggle.checked = settings.featureServerInfo;
        autoFilterToggle.checked = settings.featureAutoFilter;
        
        bgHexInput.value = settings.bgColor;
        
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
        bgHexInput.value = bgColorInput.value;
        chrome.storage.local.set({ bgColor: bgColorInput.value });
    });
    // Firefox specific fix: Ensure 'change' is also monitored, as 'input' can be flaky in the native OS color dialog
    bgColorInput.addEventListener('change', () => {
        bgHexInput.value = bgColorInput.value;
        chrome.storage.local.set({ bgColor: bgColorInput.value });
    });

    // Fallback: update color if valid hex is typed manually
    bgHexInput.addEventListener('input', () => {
        const val = bgHexInput.value.trim();
        if (/^#[0-9A-F]{6}$/i.test(val)) {
            bgColorInput.value = val;
            chrome.storage.local.set({ bgColor: val });
        }
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

    calendarToggle.addEventListener('change', () => {
        chrome.storage.local.set({ featureCalendarButton: calendarToggle.checked });
    });
    
    listToggle.addEventListener('change', () => {
        chrome.storage.local.set({ featureListExpand: listToggle.checked });
        updateListControlsState(listToggle.checked);
    });

    listExpandLimit.addEventListener('change', () => {
        const val = parseInt(listExpandLimit.value, 10);
        chrome.storage.local.set({ listExpandLimit: val });
    });

    serverInfoToggle.addEventListener('change', () => {
        chrome.storage.local.set({ featureServerInfo: serverInfoToggle.checked });
    });

    autoFilterToggle.addEventListener('change', () => {
        chrome.storage.local.set({ featureAutoFilter: autoFilterToggle.checked });
    });

    if (openOptionsPage) {
        openOptionsPage.addEventListener('click', (e) => {
            e.preventDefault();
            if (chrome.runtime.openOptionsPage) {
                chrome.runtime.openOptionsPage();
            } else {
                window.open(chrome.runtime.getURL('popup.html'));
            }
        });
    }
});