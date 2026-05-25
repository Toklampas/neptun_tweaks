// modules/examRegistration.js

function startAutoExamRegistration(settings) {
    let targets = settings.autoExamTargets || [];
    let isAutoRegisterEnabled = settings.featureAutoExam;

    // Listen for live updates from the popup!
    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'local') {
            if (changes.featureAutoExam !== undefined) {
                isAutoRegisterEnabled = changes.featureAutoExam.newValue;
                console.log("Neptun Tweaks: Auto Exam Registration is now " + (isAutoRegisterEnabled ? "ON" : "OFF"));
            }
            if (changes.autoExamTargets !== undefined) {
                targets = changes.autoExamTargets.newValue || [];
            }
        }
    });

    console.log("Neptun Tweaks: Auto Exam Registration module started. Currently: " + (isAutoRegisterEnabled ? "ON" : "OFF"));

    let lastClickedPriorityIndex = -1;

    // Check every 500ms for dynamically loaded rows
    setInterval(() => {
        // If Neptun is already processing an action (showing a spinner), wait patiently.
        if (document.querySelector('.spinner.table-action')) return;

        let readyTargets = [];

        // Find all tables on the page
        const tables = document.querySelectorAll('table.mat-mdc-table');

        tables.forEach(table => {
            // 1. Inject the Header Column if missing
            const theadRow = table.querySelector('thead tr');
            if (theadRow && !theadRow.querySelector('.neptun-tweaks-target-th')) {
                const th = document.createElement('th');
                th.className = 'neptun-tweaks-target-th mat-mdc-header-cell mdc-data-table__header-cell cdk-header-cell';
                th.textContent = 'Auto';
                th.title = 'Select an exam for auto-registration';
                th.style.textAlign = 'center';
                th.style.fontWeight = 'bold';
                th.style.color = '#0056b3';
                th.style.padding = '0 10px';

                // Prepend as the first column
                theadRow.insertBefore(th, theadRow.firstChild);
            }

            // 2. Handle Rows
            const rows = table.querySelectorAll('tbody tr');
            rows.forEach(row => {
                // 1. Get Date
                const dateCell = row.querySelector('td.mat-column-fromDate');
                const dateStr = dateCell ? dateCell.textContent.trim().replace(/\s+/g, ' ') : 'Unknown Date';

                // 2. Get Subject Name robustly
                let subjectName = 'Unknown Subject';
                const tableContainer = table.closest('[test-id="exam-subject-table"]') || table.closest('.exam-subject-table') || table.closest('neptun-data-table');

                if (tableContainer && tableContainer.parentElement) {
                    let prev = tableContainer.parentElement.previousElementSibling;
                    while (prev) {
                        if (prev.tagName && prev.tagName.toLowerCase() === 'neptun-secondary-title') {
                            subjectName = prev.textContent.trim().replace(/\s+/g, ' ');
                            break;
                        }
                        prev = prev.previousElementSibling;
                    }
                }

                // 2.5 Get Exam Type (Vizsgatípus) to differentiate exams at the same time
                let typeCell = row.querySelector('td.mat-column-examType') || row.querySelector('td.mat-column-type');
                let typeStr = 'Unknown Type';
                if (typeCell) {
                    typeStr = typeCell.textContent.trim().replace(/\s+/g, ' ');
                } else {
                    const origTds = Array.from(row.querySelectorAll('td')).filter(t => !t.classList.contains('neptun-tweaks-target-td'));
                    if (origTds.length >= 2) {
                        typeStr = origTds[1].textContent.trim().replace(/\s+/g, ' ');
                    }
                }

                const targetKey = subjectName + '||' + dateStr + '||' + typeStr;
                const subjectPrefix = subjectName + '||';

                // 3. Auto Register Logic
                if (isAutoRegisterEnabled && targets.includes(targetKey)) {
                    if (!window.neptunTweaksLastClick) window.neptunTweaksLastClick = {};
                    const lastClick = window.neptunTweaksLastClick[targetKey] || 0;

                    if (Date.now() - lastClick >= 5000) {
                        const actionCell = row.querySelector('td.mat-column-actions');
                        if (actionCell) {
                            const buttons = actionCell.querySelectorAll('button');
                            buttons.forEach(btn => {
                                if (btn.textContent.toLowerCase().includes('felvétel') && !btn.disabled) {
                                    readyTargets.push({ btn: btn, targetKey: targetKey, lastClick: lastClick });
                                }
                            });
                        }
                    }
                }

                // If we already injected the cell in this row, skip UI injection
                if (row.querySelector('.neptun-tweaks-target-td')) return;

                // 4. Inject Checkbox Column
                const td = document.createElement('td');
                td.className = 'neptun-tweaks-target-td mat-mdc-cell mdc-data-table__cell cdk-cell';
                td.style.textAlign = 'center';
                td.style.verticalAlign = 'middle';
                td.style.padding = '0 10px';

                const cb = document.createElement('input');
                cb.type = 'checkbox';
                cb.style.cursor = 'pointer';
                cb.style.width = '18px';
                cb.style.height = '18px';
                cb.style.margin = '0';
                cb.style.position = 'relative';
                cb.style.zIndex = '100';
                cb.style.pointerEvents = 'auto';

                if (targets.includes(targetKey)) {
                    cb.checked = true;
                }

                // Prevent Angular Material from intercepting row clicks and stopping the checkbox from toggling
                cb.addEventListener('click', (e) => e.stopPropagation());
                cb.addEventListener('mousedown', (e) => e.stopPropagation());
                cb.addEventListener('mouseup', (e) => e.stopPropagation());

                cb.addEventListener('change', () => {
                    chrome.storage.local.get(['autoExamTargets'], (currentSettings) => {
                        let currentTargets = currentSettings.autoExamTargets || [];

                        if (cb.checked) {
                            // Remove existing targets for this specific subject (only 1 allowed)
                            currentTargets = currentTargets.filter(t => !t.startsWith(subjectPrefix));
                            currentTargets.push(targetKey);

                            // Visually uncheck other checkboxes for the same subject
                            if (table) {
                                const allCheckboxes = table.querySelectorAll('.neptun-tweaks-target-td input[type="checkbox"]');
                                allCheckboxes.forEach(otherCb => {
                                    if (otherCb !== cb) otherCb.checked = false;
                                });
                            }
                        } else {
                            currentTargets = currentTargets.filter(t => t !== targetKey);
                        }

                        chrome.storage.local.set({ autoExamTargets: currentTargets });
                        targets = currentTargets; // update local ref
                    });
                });

                td.appendChild(cb);

                // Prepend as the first column
                row.insertBefore(td, row.firstChild);
            });
        });

        if (readyTargets.length > 0) {
            // Find targets that are lower down the priority list than the one we just clicked
            let nextTargets = readyTargets.filter(t => targets.indexOf(t.targetKey) > lastClickedPriorityIndex);

            let targetToClick;
            if (nextTargets.length > 0) {
                // Pick the next available one in the list
                nextTargets.sort((a, b) => targets.indexOf(a.targetKey) - targets.indexOf(b.targetKey));
                targetToClick = nextTargets[0];
            } else {
                // We reached the bottom of the list. Wrap around to the top!
                readyTargets.sort((a, b) => targets.indexOf(a.targetKey) - targets.indexOf(b.targetKey));
                targetToClick = readyTargets[0];
            }

            console.log('Neptun Tweaks: Auto-registering for', targetToClick.targetKey);
            targetToClick.btn.click();
            window.neptunTweaksLastClick[targetToClick.targetKey] = Date.now();

            // Save where we left off
            lastClickedPriorityIndex = targets.indexOf(targetToClick.targetKey);
        }

    }, 500);
}
