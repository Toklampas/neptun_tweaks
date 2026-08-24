// popup.js

document.addEventListener('DOMContentLoaded', () => {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const bgToggle = document.getElementById('bgToggle');
    const bgUrlInput = document.getElementById('bgUrlInput');
    const bgTypeSelect = document.getElementById('bgTypeSelect');
    const bgColorInput = document.getElementById('bgColorInput');
    const bgHexInput = document.getElementById('bgHexInput');
    const openOptionsPage = document.getElementById('openOptionsPage');
    const popupVersion = document.getElementById('popupVersion');
    const bgTypeRow = document.getElementById('bgTypeRow');
    const bgColorRow = document.getElementById('bgColorRow');

    // Populate version badge from manifest
    try {
        const manifestVersion = chrome.runtime.getManifest().version;
        if (popupVersion) {
            popupVersion.textContent = `v${manifestVersion}`;
        }
    } catch (e) {}

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
    const autoExamToggle = document.getElementById('autoExamToggle');
    const autoSubjectRedirectToggle = document.getElementById('autoSubjectRedirectToggle');
    const autoSubjectToggle = document.getElementById('autoSubjectToggle');
    const autoExamTargetsContainer = document.getElementById('autoExamTargetsContainer');
    const autoExamTargetsList = document.getElementById('autoExamTargetsList');
    const clearExamTargetsBtn = document.getElementById('clearExamTargetsBtn');
    
    // Page switching elements
    const mainPage = document.getElementById('mainPage');
    const targetsPage = document.getElementById('targetsPage');
    const viewTargetsBtn = document.getElementById('viewTargetsBtn');
    const backToMainBtn = document.getElementById('backToMainBtn');
    
    const bgSettingsPage = document.getElementById('bgSettingsPage');
    const viewBgSettingsBtn = document.getElementById('viewBgSettingsBtn');
    const backToMainFromBgBtn = document.getElementById('backToMainFromBgBtn');
    
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
        darkModeToggle.checked = settings.featureDarkMode;
        document.body.classList.toggle('dark-mode', settings.featureDarkMode);
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
        autoExamToggle.checked = settings.featureAutoExam;
        autoSubjectRedirectToggle.checked = settings.featureAutoSubjectRedirect;
        autoSubjectToggle.checked = settings.featureAutoSubject;
        
        renderAutoExamTargets(settings.autoExamTargets || []);
        
        bgHexInput.value = settings.bgColor;
        
        bgPosValue.innerText = settings.bgPositionY + '%';
        updateBackgroundControlsState(settings.featureBackground, settings.bgType);
        updateListControlsState(settings.featureListExpand);
    });

    // Helper to gray out controls when feature is off
    function updateBackgroundControlsState(isEnabled, bgType) {
        bgTypeSelect.disabled = !isEnabled;
        bgTypeRow.style.opacity = isEnabled ? '1' : '0.5';
        viewBgSettingsBtn.disabled = !isEnabled;

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
    darkModeToggle.addEventListener('change', () => {
        chrome.storage.local.set({ featureDarkMode: darkModeToggle.checked });
        document.body.classList.toggle('dark-mode', darkModeToggle.checked);
    });

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

    autoExamToggle.addEventListener('change', () => {
        const updates = { featureAutoExam: autoExamToggle.checked };
        if (autoExamToggle.checked) {
            updates.featureAutoSubjectRedirect = false;
            autoSubjectRedirectToggle.checked = false;
        }
        chrome.storage.local.set(updates);
    });

    autoSubjectRedirectToggle.addEventListener('change', () => {
        const updates = { featureAutoSubjectRedirect: autoSubjectRedirectToggle.checked };
        if (autoSubjectRedirectToggle.checked) {
            updates.featureAutoExam = false;
            autoExamToggle.checked = false;
        }
        chrome.storage.local.set(updates);
    });

    autoSubjectToggle.addEventListener('change', () => {
        chrome.storage.local.set({ featureAutoSubject: autoSubjectToggle.checked });
    });

    function renderAutoExamTargets(targets) {
        if (!targets || targets.length === 0) {
            autoExamTargetsList.innerHTML = '<li style="color: #777; text-align: center;">No exams selected.</li>';
            clearExamTargetsBtn.style.display = 'none';
            viewTargetsBtn.textContent = 'View Selected Exams (0)';
        } else {
            clearExamTargetsBtn.style.display = 'block';
            viewTargetsBtn.textContent = `View Selected Exams (${targets.length})`;
            autoExamTargetsList.innerHTML = '';
            targets.forEach((target, index) => {
                const parts = target.split('||');
                const subject = parts[0] || 'Unknown';
                const date = parts[1] || '';
                const type = parts[2] ? ` (${parts[2]})` : '';
                
                const li = document.createElement('li');
                li.style.marginBottom = '4px';
                li.style.borderBottom = '1px dashed #eee';
                li.style.paddingBottom = '4px';
                li.style.display = 'flex';
                li.style.justifyContent = 'space-between';
                li.style.alignItems = 'center';

                const textSpan = document.createElement('span');
                textSpan.innerText = `${index + 1}. ${subject} - ${date}${type}`;
                textSpan.style.flex = '1';
                textSpan.style.paddingRight = '5px';

                const btnGroup = document.createElement('div');
                btnGroup.style.display = 'flex';
                btnGroup.style.gap = '2px';

                const upBtn = document.createElement('button');
                upBtn.innerHTML = '▲';
                upBtn.className = 'shift-btn';
                upBtn.style.padding = '1px 4px';
                upBtn.style.fontSize = '9px';
                upBtn.disabled = index === 0;
                upBtn.onclick = () => {
                    const temp = targets[index - 1];
                    targets[index - 1] = targets[index];
                    targets[index] = temp;
                    chrome.storage.local.set({ autoExamTargets: targets });
                    renderAutoExamTargets(targets);
                };

                const downBtn = document.createElement('button');
                downBtn.innerHTML = '▼';
                downBtn.className = 'shift-btn';
                downBtn.style.padding = '1px 4px';
                downBtn.style.fontSize = '9px';
                downBtn.disabled = index === targets.length - 1;
                downBtn.onclick = () => {
                    const temp = targets[index + 1];
                    targets[index + 1] = targets[index];
                    targets[index] = temp;
                    chrome.storage.local.set({ autoExamTargets: targets });
                    renderAutoExamTargets(targets);
                };

                btnGroup.appendChild(upBtn);
                btnGroup.appendChild(downBtn);
                
                li.appendChild(textSpan);
                li.appendChild(btnGroup);
                autoExamTargetsList.appendChild(li);
            });
        }
    }

    clearExamTargetsBtn.addEventListener('click', () => {
        if (confirm("Are you sure you want to clear all saved exams for auto registration?\n\nThis cannot be undone.")) {
            chrome.storage.local.set({ autoExamTargets: [] });
            renderAutoExamTargets([]);
        }
    });

    viewTargetsBtn.addEventListener('click', () => {
        mainPage.style.display = 'none';
        targetsPage.style.display = 'block';
    });

    backToMainBtn.addEventListener('click', () => {
        targetsPage.style.display = 'none';
        mainPage.style.display = 'block';
    });

    viewBgSettingsBtn.addEventListener('click', () => {
        mainPage.style.display = 'none';
        bgSettingsPage.style.display = 'block';
    });

    backToMainFromBgBtn.addEventListener('click', () => {
        bgSettingsPage.style.display = 'none';
        mainPage.style.display = 'block';
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