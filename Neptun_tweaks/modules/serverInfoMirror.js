// modules/serverInfoMirror.js

function mirrorServerInfo() {
    if (!location.href.includes('/login')) return false;

    const serverInfoSrc = document.querySelector('.footer__server-info');
    const langDropdown = document.querySelector('neptun-language-dropdown.neptun-language-dropdown');
    
    if (serverInfoSrc && langDropdown) {
        // Wait until it actually has text
        const rawText = serverInfoSrc.innerText.trim();
        if (rawText === '') return false;

        // Parse "BME_HPA_15   (981)"
        const match = rawText.match(/(.*?)\s*\(\s*(\d+)\s*\)/);
        let serverName = rawText;
        let freeSpaces = '';
        if (match) {
            serverName = match[1].trim();
            freeSpaces = match[2].trim();
        }

        let mirror = document.getElementById('neptun-tweaks-server-info-mirror');
        if (!mirror) {
            mirror = document.createElement('div');
            mirror.id = 'neptun-tweaks-server-info-mirror';
            
            // Clean up old parent modifications if they exist from previous load
            if (langDropdown.parentNode) {
                langDropdown.parentNode.style.display = '';
                langDropdown.parentNode.style.alignItems = '';
                langDropdown.parentNode.style.justifyContent = '';
            }

            // Make the language dropdown a flex container so they sit side-by-side
            langDropdown.classList.add('neptun-tweaks-lang-flex');
            
            langDropdown.appendChild(mirror);
        }
        
        // Update text with structured format (using DOM API to avoid innerHTML)
        mirror.textContent = '';

        const serverLine = document.createElement('div');
        serverLine.append('Csatlakozott szerver: ');
        const serverBold = document.createElement('strong');
        serverBold.textContent = serverName;
        serverLine.appendChild(serverBold);
        mirror.appendChild(serverLine);

        if (freeSpaces) {
            const spacesLine = document.createElement('div');
            spacesLine.append('Szabad helyek száma: ');
            const spacesBold = document.createElement('strong');
            spacesBold.textContent = freeSpaces;
            spacesLine.appendChild(spacesBold);
            mirror.appendChild(spacesLine);
        }
        return true;
    }
    return false;
}

function startServerInfoMirror() {
    let attempts = 0;
    const mirrorInterval = setInterval(() => {
        attempts++;
        if (mirrorServerInfo()) {
            clearInterval(mirrorInterval);
        } else if (attempts > 20 || !location.href.includes('/login')) {
            // max 10 seconds of checking
            clearInterval(mirrorInterval);
        }
    }, 500);
}

function removeServerInfoMirror() {
    const mirror = document.getElementById('neptun-tweaks-server-info-mirror');
    if (mirror) {
        mirror.remove();
    }
}
