// modules/darkMode.js

function startDarkMode(enabled) {
    if (enabled) {
        document.documentElement.classList.add('neptun-tweaks-dark-mode');
        if (window.location.hostname === 'unipoll.neptun.bme.hu') {
            document.documentElement.classList.add('neptun-tweaks-site-unipoll');
        } else {
            document.documentElement.classList.add('neptun-tweaks-site-main');
        }
    } else {
        document.documentElement.classList.remove('neptun-tweaks-dark-mode');
        document.documentElement.classList.remove('neptun-tweaks-site-unipoll');
        document.documentElement.classList.remove('neptun-tweaks-site-main');
    }
}
