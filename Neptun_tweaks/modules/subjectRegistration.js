// modules/subjectRegistration.js

function startAutoSubjectRegistration(settings) {
    let isAutoRegisterEnabled = settings.featureAutoSubject;

    // Listen for live updates from the popup
    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'local') {
            if (changes.featureAutoSubject !== undefined) {
                isAutoRegisterEnabled = changes.featureAutoSubject.newValue;
                console.log("Neptun Tweaks: Auto Subject Registration is now " + (isAutoRegisterEnabled ? "ON" : "OFF"));
            }
        }
    });

    console.log("Neptun Tweaks: Auto Subject Registration module started. Currently: " + (isAutoRegisterEnabled ? "ON" : "OFF"));

    // Only run on the Subject Registration page
    if (!window.location.href.toLowerCase().includes('subjects/registration')) return;

    // --- Phase 1: Navigate to Órarendtervező → Lista nézet ---
    setupPageView(function onReady() {
        // --- Phase 2: Sequential Registration Loop ---
        startRegistrationLoop();
    });

    // =========================================================
    // Phase 1: Page Setup — click tabs and select the right view
    // =========================================================
    function setupPageView(onComplete) {
        // Give the page 2 seconds to fully render before interacting
        setTimeout(() => {
            // Step 1: Click the "Órarendtervező" tab
            waitAndClick(
                () => findButtonByText('Órarendtervező'),
                'Órarendtervező tab',
                () => {
                    // Step 2: Open the view-mode dropdown
                    waitForElement(
                        () => findDropdownTrigger(),
                        'view-mode dropdown',
                        (dropdown) => {
                            openDropdown(dropdown);

                            // Step 3: Select "Lista nézet" from the dropdown options (0.5s pause after opening)
                            setTimeout(() => {
                                waitForElement(
                                    () => findOptionByText('Lista'),
                                    'Lista nézet option',
                                    (option) => {
                                        console.log('Neptun Tweaks: Clicking Lista nézet option');
                                        option.click();

                                        // Step 4: Wait for accordion panels to appear
                                        setTimeout(() => {
                                            console.log("Neptun Tweaks: Waiting for subject list to load...");
                                            waitForElement(
                                                () => document.querySelector('mat-expansion-panel'),
                                                'subject accordion panels',
                                                () => {
                                                    console.log("Neptun Tweaks: Page setup complete. Starting in 2.5s...");
                                                    setTimeout(onComplete, 2500);
                                                }
                                            );
                                        }, 1500);
                                    }
                                );
                            }, 500);
                        }
                    );
                },
                1000
            );
        }, 2000);
    }

    // =========================================================
    // Phase 2: Registration Loop
    // =========================================================
    function startRegistrationLoop() {
        // Track which subjects we've successfully registered (by header text)
        let registeredSubjects = {};
        // Track cooldowns per subject to avoid hammering
        let lastClickTime = {};
        // Global throttle to keep actions human-paced
        let nextAllowedActionTime = 0;
        // Current state
        let currentIndex = 0;

        const loopInterval = setInterval(() => {
            if (!isAutoRegisterEnabled) return;

            const now = Date.now();
            if (now < nextAllowedActionTime) return;

            // If Neptun is processing (spinner visible), wait patiently
            if (document.querySelector('.spinner, .spinner.table-action, .mat-mdc-progress-spinner')) return;

            // Check for and handle confirmation dialogs
            if (handleConfirmationDialog()) {
                nextAllowedActionTime = now + 2000;
                return;
            }

            // Get all accordion panels
            const panels = Array.from(document.querySelectorAll('mat-expansion-panel'));
            if (panels.length === 0) return;

            // Filter out Zárthelyi and already-registered subjects
            const eligiblePanels = panels.filter(panel => {
                const headerText = getAccordionHeaderText(panel);
                if (headerText.includes('Zárthelyi')) return false;
                if (registeredSubjects[headerText]) return false;
                return true;
            });

            if (eligiblePanels.length === 0) {
                // All done (or all filtered out)
                return;
            }

            // Wrap around if we've gone past the end
            if (currentIndex >= eligiblePanels.length) {
                currentIndex = 0;
            }

            const panel = eligiblePanels[currentIndex];
            const headerText = getAccordionHeaderText(panel);

            // Cooldown check — at least 6 seconds between attempts on the same subject
            if (lastClickTime[headerText] && (now - lastClickTime[headerText] < 6000)) {
                // Skip to next subject while this one cools down
                currentIndex++;
                return;
            }

            // Step 1: Expand the accordion if it's collapsed
            const header = panel.querySelector('mat-expansion-panel-header');
            if (!header) {
                currentIndex++;
                return;
            }

            const isExpanded = header.getAttribute('aria-expanded') === 'true';
            if (!isExpanded) {
                console.log('Neptun Tweaks: Expanding accordion for "' + headerText + '"');
                header.click();
                // Pause 1.2 seconds for the panel expansion animation and content to render
                nextAllowedActionTime = now + 1200;
                return;
            }

            // Step 2: Find the "Tárgy felvétele" button inside the expanded panel
            const registerBtn = findRegisterButton(panel);

            if (!registerBtn) {
                // Button not found — check if content is still loading or subject is already taken
                const panelContent = panel.querySelector('.mat-expansion-panel-content, mat-expansion-panel-body');
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
                }
                return;
            }

            // Step 3: Click the register button
            if (registerBtn.disabled) {
                console.log('Neptun Tweaks: Register button disabled for "' + headerText + '". Skipping.');
                currentIndex++;
                nextAllowedActionTime = now + 1000;
                return;
            }

            console.log('Neptun Tweaks: Clicking "Tárgy felvétele" for "' + headerText + '"');
            registerBtn.click();
            lastClickTime[headerText] = Date.now();

            // Give 2.5 seconds between clicking subjects to let network requests resolve naturally
            nextAllowedActionTime = now + 2500;
            currentIndex++;

        }, 1000);
    }

    // =========================================================
    // Helper Functions
    // =========================================================

    /**
     * Gets the subject name from an accordion panel header.
     */
    function getAccordionHeaderText(panel) {
        const header = panel.querySelector('mat-expansion-panel-header');
        if (!header) return '';
        return header.textContent.trim().replace(/\s+/g, ' ');
    }

    /**
     * Finds the "Tárgy felvétele" button inside an expanded accordion panel.
     */
    function findRegisterButton(panel) {
        const buttons = panel.querySelectorAll('button');
        for (const btn of buttons) {
            const text = btn.textContent.trim();
            if (text.includes('Tárgy felvétele')) {
                return btn;
            }
        }
        return null;
    }

    /**
     * Handles "Megerősítés" confirmation dialogs that may appear after clicking register.
     * Returns true if a dialog was found and handled (caller should wait).
     */
    function handleConfirmationDialog() {
        const dialog = document.querySelector('mat-dialog-container, .mat-mdc-dialog-container, .cdk-overlay-pane mat-dialog-container');
        if (!dialog) return false;

        const buttons = dialog.querySelectorAll('button');
        for (const btn of buttons) {
            const text = btn.textContent.trim();
            if (text.includes('Megerősítés') || text.includes('megerősítés')) {
                console.log('Neptun Tweaks: Confirmation dialog detected. Clicking "Megerősítés"...');
                btn.click();
                return true;
            }
        }
        return false;
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
