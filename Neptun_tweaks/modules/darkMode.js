// modules/darkMode.js

function startDarkMode(enabled) {
    if (enabled) {
        document.documentElement.classList.add('neptun-tweaks-dark-mode');
    } else {
        document.documentElement.classList.remove('neptun-tweaks-dark-mode');
    }
}
