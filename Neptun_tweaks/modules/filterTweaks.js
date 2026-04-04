// modules/filterTweaks.js

function startQueryTweaks() {
    autoOpenFilterPanel();
    autoSubmitOnSelection();
}

// Auto-clicks the "Szűrő megnyitása" button to open the filter panel
function autoOpenFilterPanel() {
    let attempts = 0;
    const maxAttempts = 50; // Try for up to 5 seconds (50 * 100ms)

    const interval = setInterval(() => {
        attempts++;

        const allButtons = document.querySelectorAll('button');
        for (const btn of allButtons) {
            const text = btn.textContent.trim();
            if (text.includes('Szűrő megnyitása') || text.includes('Open filter')) {
                btn.click();
                console.log('Neptun Tweaks: Auto-opened filter panel.');
                clearInterval(interval);
                return;
            }
        }

        if (attempts >= maxAttempts) {
            clearInterval(interval);
        }
    }, 100);
}

// Auto-clicks "Lista szűrése" after selecting a dropdown option
function autoSubmitOnSelection() {
    document.addEventListener('click', (event) => {
        const option = event.target.closest('mat-option');
        if (!option) return;

        // Small delay to let Angular process the selection
        setTimeout(() => {
            let filterBtn = document.getElementById('filter-table');

            if (filterBtn) {
                filterBtn.click();
                console.log('Neptun Tweaks: Auto-submitted filter after selection.');
            }
        }, 300);
    });

    console.log('Neptun Tweaks: Auto-filter-submit listener active.');
}
