// modules/calendarButton.js

function injectCalendarButton() {
    const headerLeft = document.querySelector('.header__left');
    if (!headerLeft) return false;
    
    // Check if it already exists
    if (document.getElementById('neptun-tweaks-calendar-btn')) return true;

    // Create the button using Neptun's existing utility classes for seamless integration
    const btn = document.createElement('button');
    btn.id = 'neptun-tweaks-calendar-btn';
    btn.type = 'button';
    btn.className = 'neptun-button header__main-menu flat small-padding tertiary';
    
    // Apply styling so it fits exactly beside the Menu / Search
    btn.style.marginLeft = '16px'; 
    
    // Explicit inline overrides to guarantee it matches the Menu button perfectly
    btn.style.cursor = 'pointer';
    btn.style.border = 'none';
    btn.style.backgroundColor = '#213855'; // The exact dark blue of the Menu button
    btn.style.color = '#ffffff'; 
    btn.style.display = 'flex';
    btn.style.alignItems = 'center';
    btn.style.justifyContent = 'center';
    btn.style.height = '44px'; // Matches Menu button height
    btn.style.padding = '0 16px'; // Standard small-padding
    btn.style.borderRadius = '4px';
    btn.style.transition = 'filter 0.2s ease';

    // Hover effect using brightness ensures we don't have to hardcode a lighter blue
    btn.onmouseenter = () => btn.style.filter = 'brightness(1.15)';
    btn.onmouseleave = () => btn.style.filter = 'brightness(1)';

    btn.innerHTML = `
        <span class="neptun-button_body" style="display:flex; align-items:center; gap:6px; font-weight:600; font-size:14px;">
            <i class="menu__item__icon icon-calendar-dates" style="font-size: 18px; margin-right: 2px;"></i>
            Naptár
        </span>
    `;

    btn.onclick = () => {
        window.location.href = '/hallgatoi/calendar';
    };

    headerLeft.appendChild(btn);

    return true;
}
