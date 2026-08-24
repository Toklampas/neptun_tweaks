// modules/subjectRegistration.js

let subjectRegistrationInterval = null;

function startAutoSubjectRegistration(settings) {
    let isAutoRegisterEnabled = !!settings.featureAutoSubject;

    if (!isAutoRegisterEnabled) {
        if (subjectRegistrationInterval) {
            clearInterval(subjectRegistrationInterval);
            subjectRegistrationInterval = null;
        }
        return;
    }

    // Only run on the Subject Registration page
    if (!window.location.href.toLowerCase().includes('subjects/registration')) return;

    // Listen for live updates from the popup
    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'local') {
            if (changes.featureAutoSubject !== undefined) {
                isAutoRegisterEnabled = !!changes.featureAutoSubject.newValue;
                console.log("Neptun Tweaks: Auto Subject Registration is now " + (isAutoRegisterEnabled ? "ON" : "OFF"));
                if (!isAutoRegisterEnabled && subjectRegistrationInterval) {
                    clearInterval(subjectRegistrationInterval);
                    subjectRegistrationInterval = null;
                }
            }
        }
    });

    console.log("Neptun Tweaks: Auto Subject Registration module started. Currently: ON");

    // --- Phase 1: Navigate to Órarendtervező → Lista nézet ---
    setupPageView(function onReady() {
        if (!isAutoRegisterEnabled) return;
        // --- Phase 2: Sequential Registration Loop ---
        startRegistrationLoop();
    });

    // =========================================================
    // Phase 1: Page Setup — click tabs and select the right view
    // =========================================================
    function setupPageView(onComplete) {
        if (!isAutoRegisterEnabled) return;

        // Check if Órarendtervező tab/container is already open
        function isPlannerOpen() {
            const planner = document.querySelector('neptun-timetable-planner, .timetable-planner__container, .timetable-planner__content, [class*="timetable-planner"]');
            if (planner && planner.offsetParent !== null) return true;

            const tab = findButtonByText('Órarendtervező');
            if (tab && (tab.getAttribute('aria-selected') === 'true' || tab.classList.contains('active') || tab.classList.contains('mat-mdc-tab-active') || tab.classList.contains('selected'))) {
                return true;
            }
            return false;
        }

        // Check if "Lista nézet" is already active
        function isListaViewActive() {
            const dropdown = findDropdownTrigger();
            if (dropdown && dropdown.textContent.includes('Lista')) return true;
            return false;
        }

        function ensureListaView(afterViewReady) {
            if (!isAutoRegisterEnabled) return;

            if (isListaViewActive()) {
                console.log("Neptun Tweaks: Lista nézet is already active.");
                waitForSubjectsAndExpand(afterViewReady);
                return;
            }

            console.log("Neptun Tweaks: Switching view mode to Lista nézet...");
            waitForElement(
                () => findDropdownTrigger(),
                'view-mode dropdown',
                (dropdown) => {
                    if (!isAutoRegisterEnabled) return;
                    openDropdown(dropdown);

                    setTimeout(() => {
                        if (!isAutoRegisterEnabled) return;

                        waitForElement(
                            () => findOptionByText('Lista'),
                            'Lista nézet option',
                            (option) => {
                                if (!isAutoRegisterEnabled) return;
                                console.log('Neptun Tweaks: Clicking Lista nézet option');
                                option.click();

                                setTimeout(() => {
                                    waitForSubjectsAndExpand(afterViewReady);
                                }, 1500);
                            }
                        );
                    }, 500);
                }
            );
        }

        function waitForSubjectsAndExpand(afterDone) {
            if (!isAutoRegisterEnabled) return;

            console.log("Neptun Tweaks: Waiting for subject list in Órarendtervező to load...");
            waitForElement(
                () => {
                    const p = getPlannerPanels();
                    return p.length > 0 ? p[0] : null;
                },
                'subject accordion panels in Órarendtervező',
                () => {
                    if (!isAutoRegisterEnabled) return;

                    expandAllPlannerPanels((wasAlreadyOpen) => {
                        if (!isAutoRegisterEnabled) return;

                        if (wasAlreadyOpen) {
                            console.log("Neptun Tweaks: Accordions were already open. Starting loop immediately...");
                            afterDone();
                        } else {
                            console.log("Neptun Tweaks: Accordions expanded. Starting loop in 1.5s...");
                            setTimeout(afterDone, 1500);
                        }
                    });
                }
            );
        }

        // --- Main setup flow ---
        if (isPlannerOpen()) {
            console.log("Neptun Tweaks: Órarendtervező tab is already open.");
            ensureListaView(onComplete);
        } else {
            console.log("Neptun Tweaks: Opening Órarendtervező tab in 2.0s...");
            setTimeout(() => {
                if (!isAutoRegisterEnabled) return;

                waitAndClick(
                    () => findButtonByText('Órarendtervező'),
                    'Órarendtervező tab',
                    () => {
                        if (!isAutoRegisterEnabled) return;
                        setTimeout(() => {
                            ensureListaView(onComplete);
                        }, 1000);
                    }
                );
            }, 2000);
        }
    }

    // =========================================================
    // Phase 2: Registration Loop
    // =========================================================
    function startRegistrationLoop() {
        if (!isAutoRegisterEnabled) return;
        console.log("Neptun Tweaks: Registration loop started.");
        // Track which subjects we've successfully registered (by header text)
        let registeredSubjects = {};
        // Track cooldowns per subject to avoid hammering
        let lastClickTime = {};
        // Global throttle to keep actions human-paced
        let nextAllowedActionTime = 0;
        // Current state
        let currentIndex = 0;
        let logTickCount = 0;

        if (subjectRegistrationInterval) clearInterval(subjectRegistrationInterval);

        subjectRegistrationInterval = setInterval(() => {
            if (!isAutoRegisterEnabled) {
                clearInterval(subjectRegistrationInterval);
                subjectRegistrationInterval = null;
                return;
            }

            const now = Date.now();
            if (now < nextAllowedActionTime) return;

            // If Neptun is processing (visible spinner active), wait patiently
            if (isSpinnerActive()) {
                console.log("Neptun Tweaks: Waiting for loading spinner to clear...");
                return;
            }

            // Check for and handle confirmation dialogs
            if (handleConfirmationDialog()) {
                nextAllowedActionTime = now + 800;
                return;
            }

            // Get all accordion panels strictly inside Órarendtervező
            const panels = getPlannerPanels();
            if (panels.length === 0) {
                if (logTickCount++ % 5 === 0) {
                    console.log("Neptun Tweaks: No subject accordion panels found inside Órarendtervező yet.");
                }
                return;
            }

            // Filter out Zárthelyi and already-registered subjects
            const eligiblePanels = panels.filter(panel => {
                const headerText = getAccordionHeaderText(panel);
                if (!headerText) return false;
                if (headerText.toLowerCase().includes('zárthelyi')) return false;
                if (registeredSubjects[headerText]) return false;
                return true;
            });

            if (eligiblePanels.length === 0) {
                if (logTickCount++ % 10 === 0) {
                    console.log("Neptun Tweaks: No eligible subjects remaining (all registered or skipped).");
                }
                return;
            }

            // Wrap around if we've gone past the end
            if (currentIndex >= eligiblePanels.length) {
                currentIndex = 0;
            }

            const panel = eligiblePanels[currentIndex];
            const headerText = getAccordionHeaderText(panel);

            // Cooldown check — at least 2.5 seconds between attempts on the same subject
            if (lastClickTime[headerText] && (now - lastClickTime[headerText] < 2500)) {
                // Skip to next subject while this one cools down
                currentIndex++;
                return;
            }

            // Step 1: Expand the accordion if it's collapsed
            const header = panel.querySelector('mat-expansion-panel-header, .mat-expansion-panel-header');
            if (!header) {
                console.log('Neptun Tweaks: No header found in panel for "' + headerText + '". Skipping.');
                currentIndex++;
                return;
            }

            const isExpanded = isAccordionExpanded(panel, header);

            if (!isExpanded) {
                console.log('Neptun Tweaks: Expanding accordion for "' + headerText + '"');
                triggerAccordionExpansion(panel, header);
                // Pause 1.2 seconds for the panel expansion animation and content to render
                nextAllowedActionTime = now + 1200;
                return;
            }

            // Step 2: Find the "Tárgy felvétele" button inside the expanded panel
            const registerBtn = findRegisterButton(panel);

            if (!registerBtn) {
                // Button not found — check if content is still loading or subject is already taken
                const panelContent = panel.querySelector('.mat-expansion-panel-content, mat-expansion-panel-body, .mat-expansion-panel-body');
                if (panelContent) {
                    if (!panel._neptunTweaksWaitCount) panel._neptunTweaksWaitCount = 0;
                    panel._neptunTweaksWaitCount++;

                    if (panel._neptunTweaksWaitCount > 6) {
                        // Waited several cycles, mark as completed/skipped
                        console.log('Neptun Tweaks: No register button found for "' + headerText + '". Skipping.');
                        registeredSubjects[headerText] = true;
                        panel._neptunTweaksWaitCount = 0;
                        currentIndex++;
                        nextAllowedActionTime = now + 1000;
                    }
                } else {
                    console.log('Neptun Tweaks: Waiting for panel content to render for "' + headerText + '"');
                }
                return;
            }

            // Step 3: Click the register button
            if (registerBtn.disabled) {
                console.log('Neptun Tweaks: Register button disabled for "' + headerText + '". Skipping.');
                currentIndex++;
                nextAllowedActionTime = now + 300;
                return;
            }

            console.log('Neptun Tweaks: Clicking "Tárgy felvétele" for "' + headerText + '"');
            registerBtn.click();
            lastClickTime[headerText] = Date.now();

            // Snappy 500ms delay before advancing to the next subject
            nextAllowedActionTime = now + 500;
            currentIndex++;

        }, 300);
    }

    // =========================================================
    // Helper Functions
    // =========================================================

    /**
     * Checks if a loading spinner is currently visible on the page.
     */
    function isSpinnerActive() {
        const spinners = document.querySelectorAll('.spinner.table-action, .mat-mdc-progress-spinner, .spinner');
        for (const s of spinners) {
            if (s.offsetParent !== null && window.getComputedStyle(s).display !== 'none' && window.getComputedStyle(s).visibility !== 'hidden') {
                return true;
            }
        }
        return false;
    }

    /**
     * Gets all accordion panels located strictly inside the Órarendtervező (timetable planner) container.
     */
    function getPlannerPanels() {
        // Query timetable planner modal/overlay/container specifically
        const plannerContainers = document.querySelectorAll('neptun-timetable-planner, .timetable-planner__container, .timetable-planner__content, [class*="timetable-planner"]');
        for (const container of plannerContainers) {
            const panels = Array.from(container.querySelectorAll('mat-expansion-panel, .mat-expansion-panel'));
            if (panels.length > 0) return panels;
        }

        // Fallback: look for panels inside subject-list containers within the planner
        const subjectLists = document.querySelectorAll('.timetable-planner__container mat-expansion-panel, neptun-timetable-planner mat-expansion-panel');
        if (subjectLists.length > 0) return Array.from(subjectLists);

        return [];
    }

    /**
     * Expands all unexpanded subject accordion panels inside Órarendtervező with a 400ms staggered delay (skipping Zárthelyi).
     * Passes true to onDone if all panels were already expanded, or false if expansions were performed.
     */
    function expandAllPlannerPanels(onDone) {
        const panels = getPlannerPanels();
        const unexpandedPanels = panels.filter(panel => {
            const headerText = getAccordionHeaderText(panel);
            if (headerText.toLowerCase().includes('zárthelyi')) return false;

            const header = panel.querySelector('mat-expansion-panel-header, .mat-expansion-panel-header');
            if (!header) return false;

            return !isAccordionExpanded(panel, header);
        });

        if (unexpandedPanels.length === 0) {
            console.log('Neptun Tweaks: All eligible subject accordions are already expanded.');
            if (typeof onDone === 'function') onDone(true);
            return;
        }

        console.log('Neptun Tweaks: Found ' + unexpandedPanels.length + ' unexpanded subject accordions to expand.');

        let index = 0;
        function expandNext() {
            if (index >= unexpandedPanels.length) {
                console.log('Neptun Tweaks: Finished expanding all subject accordions.');
                if (typeof onDone === 'function') onDone(false);
                return;
            }

            const panel = unexpandedPanels[index++];
            const header = panel.querySelector('mat-expansion-panel-header, .mat-expansion-panel-header');
            if (header && !isAccordionExpanded(panel, header)) {
                const headerText = getAccordionHeaderText(panel);
                console.log('Neptun Tweaks: Expanding accordion [' + index + '/' + unexpandedPanels.length + '] "' + headerText + '"');
                triggerAccordionExpansion(panel, header);
            }

            setTimeout(expandNext, 400);
        }

        expandNext();
    }

    /**
     * Checks if an accordion panel is currently expanded.
     */
    function isAccordionExpanded(panel, header) {
        if (panel.classList.contains('mat-expanded')) return true;
        if (panel.classList.contains('mat-expansion-panel-spacing')) return true;
        if (header && (header.getAttribute('aria-expanded') === 'true' || header.classList.contains('mat-expanded'))) return true;

        const content = panel.querySelector('.mat-expansion-panel-content, mat-expansion-panel-body, .mat-expansion-panel-body');
        if (content) {
            if (content.offsetHeight > 20 || content.clientHeight > 20) return true;
            if (content.getAttribute('aria-hidden') === 'false') return true;
        }
        return false;
    }

    /**
     * Triggers accordion expansion with a single click.
     */
    function triggerAccordionExpansion(panel, header) {
        // Find the most specific trigger element (title or header) and click it ONCE
        const title = header.querySelector('mat-panel-title, .mat-expansion-panel-header-title') || header;
        title.click();
    }

    /**
     * Handles "Megerősítés" and "Rendben" dialogs/notices that may appear.
     * Returns true if a dialog was found and handled (caller should wait).
     */
    function handleConfirmationDialog() {
        // 1. Check for confirmation dialogs
        const dialog = document.querySelector('mat-dialog-container, .mat-mdc-dialog-container, .cdk-overlay-pane mat-dialog-container, neptun-registration-confirmation-dialog');
        if (dialog) {
            // Check "Ne jelenjen meg többször" checkbox if present and not yet checked
            const checkboxInput = dialog.querySelector('input[type="checkbox"], .mdc-checkbox__native-control');
            const matCheckbox = dialog.querySelector('mat-checkbox');
            const label = dialog.querySelector('mat-checkbox label, label[for*="checkbox"], .mdc-form-field label');

            if (checkboxInput && !checkboxInput.checked) {
                console.log('Neptun Tweaks: Checking "Ne jelenjen meg többször" in confirmation dialog...');
                if (label) {
                    label.click();
                } else if (matCheckbox) {
                    matCheckbox.click();
                } else {
                    checkboxInput.click();
                }
            }

            const buttons = dialog.querySelectorAll('button');
            for (const btn of buttons) {
                const text = btn.textContent.trim().toLowerCase();
                if (text.includes('megerősítés') || text.includes('megerosites') || text.includes('rendben')) {
                    console.log('Neptun Tweaks: Dialog detected. Clicking "' + text + '"...');
                    btn.click();
                    return true;
                }
            }
        }

        // 2. Check for notice alerts / snackbars with "Rendben" button
        const rendbenBtns = document.querySelectorAll('button');
        for (const btn of rendbenBtns) {
            if (btn.textContent.trim().toLowerCase() === 'rendben' && btn.offsetParent !== null) {
                console.log('Neptun Tweaks: Dismissing notice banner ("Rendben")...');
                btn.click();
                return true;
            }
        }

        return false;
    }

    /**
     * Gets the subject name from an accordion panel header.
     */
    function getAccordionHeaderText(panel) {
        const header = panel.querySelector('mat-expansion-panel-header, .mat-expansion-panel-header');
        if (!header) return '';
        const titleEl = header.querySelector('mat-panel-title, .mat-expansion-panel-header-title, [class*="panel-title"]') || header;
        return titleEl.textContent.trim().replace(/\s+/g, ' ');
    }

    /**
     * Finds the "Tárgy felvétele" button inside an expanded accordion panel.
     */
    function findRegisterButton(panel) {
        const buttons = panel.querySelectorAll('button, .neptun-button, a[role="tab"], .mat-mdc-button, .mat-mdc-raised-button');
        for (const btn of buttons) {
            const text = btn.textContent.trim().toLowerCase();
            if (text.includes('tárgy felvétele') || text.includes('targy felvetele')) {
                return btn;
            }
        }
        return null;
    }

    /**
     * Finds a button element by its text content (partial match).
     */
    function findButtonByText(text) {
        const buttons = document.querySelectorAll('button, [role="tab"], a.mat-mdc-tab-link, .mat-mdc-tab');
        for (const btn of buttons) {
            if (btn.textContent.trim().includes(text)) {
                return btn;
            }
        }
        return null;
    }

    /**
     * Finds the view-mode dropdown container.
     * Returns the mat-form-field or wrapper containing the view selector.
     */
    function findDropdownTrigger() {
        // Try to find form fields on the page and match by content
        const formFields = document.querySelectorAll('mat-form-field, .mat-mdc-form-field');
        for (const field of formFields) {
            const text = field.textContent.trim();
            if (text.includes('nézet') || text.includes('Heti') || text.includes('Lista') || text.includes('Havi')) {
                return field;
            }
        }

        // Broader fallback
        const wrappers = document.querySelectorAll('.mat-mdc-text-field-wrapper');
        for (const wrapper of wrappers) {
            const text = wrapper.textContent.trim();
            if (text.includes('nézet') || text.includes('Heti') || text.includes('Lista') || text.includes('Havi')) {
                return wrapper;
            }
        }
        return null;
    }

    /**
     * Attempts to open an Angular Material dropdown by trying multiple click targets.
     * Angular Material listens for events on specific inner elements, not the outer wrapper.
     */
    function openDropdown(container) {
        // Priority list of elements to try clicking inside the container
        const selectors = [
            'mat-select',
            '.mat-mdc-select',
            '[role="combobox"]',
            '[role="listbox"]',
            '.mat-mdc-select-trigger',
            '.mat-select-trigger',
            '.mdc-text-field',
            '.mat-mdc-text-field-wrapper'
        ];

        for (const sel of selectors) {
            const el = container.querySelector(sel);
            if (el) {
                console.log('Neptun Tweaks: Clicking dropdown trigger via ' + sel);
                el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
                el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
                return;
            }
        }

        // Last resort: click the container itself with proper event dispatching
        console.log('Neptun Tweaks: Clicking dropdown container directly');
        container.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        container.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    }

    /**
     * Finds a dropdown option by its text content (partial match).
     * Searches both inline options and the CDK overlay container where Angular renders dropdown panels.
     */
    function findOptionByText(text) {
        // Search in CDK overlay (where Angular Material renders dropdown options)
        const overlayOptions = document.querySelectorAll('.cdk-overlay-container mat-option, .cdk-overlay-container .mat-mdc-option');
        for (const opt of overlayOptions) {
            if (opt.textContent.trim().includes(text)) {
                return opt;
            }
        }

        // Fallback: search all options on the page
        const options = document.querySelectorAll('mat-option, .mat-mdc-option');
        for (const opt of options) {
            if (opt.textContent.trim().includes(text)) {
                return opt;
            }
        }
        return null;
    }

    /**
     * Polls for an element to appear, then calls the callback.
     * Standard polling pattern: 500ms interval, max 20 attempts (10 seconds).
     */
    function waitForElement(selectorFn, description, callback) {
        let attempts = 0;
        const interval = setInterval(() => {
            attempts++;
            const el = selectorFn();
            if (el) {
                console.log('Neptun Tweaks: Found ' + description);
                clearInterval(interval);
                callback(el);
            } else if (attempts >= 20) {
                console.log('Neptun Tweaks: Timed out waiting for ' + description);
                clearInterval(interval);
            }
        }, 500);
    }

    /**
     * Polls for an element to appear, clicks it, then calls the callback.
     */
    function waitAndClick(selectorFn, description, callback, postClickDelay = 1000) {
        waitForElement(selectorFn, description, (el) => {
            console.log('Neptun Tweaks: Clicking ' + description);
            el.click();
            // Give Angular a moment to process the click
            setTimeout(callback, postClickDelay);
        });
    }
}
