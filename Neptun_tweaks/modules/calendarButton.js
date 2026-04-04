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

    btn.innerHTML = `
        <span class="neptun-button_body">
            <i class="menu__item__icon icon-calendar-dates"></i>
            Naptár
        </span>
    `;

    btn.onclick = () => {
        window.location.href = '/hallgatoi/calendar';
    };

    headerLeft.appendChild(btn);

    return true;
}
