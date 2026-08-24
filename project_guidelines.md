# Neptun Tweaks — Project Guidelines

> **Purpose:** This document is the authoritative blueprint for any future development on this codebase. Every pattern, convention, and constraint described here was extracted directly from the existing code. Follow it exactly.

---

## 1. Tech Stack

| Layer | Technology | Version / Spec |
|---|---|---|
| **Platform** | Browser Extension (Chrome + Firefox) | Manifest V3 |
| **Manifest version** | `"manifest_version": 3` | — |
| **Extension version** | Tracked in `manifest.json` → `"version"` | Currently `1.2.9` |
| **Language** | Vanilla JavaScript (ES6+) | No TypeScript, no transpiler, no bundler |
| **Markup** | Raw HTML | Single file: `popup.html` |
| **Styling** | Vanilla CSS | Two scopes: inline `<style>` in `popup.html`, injected `content.css` |
| **APIs** | `chrome.storage.local`, `chrome.runtime`, `chrome.storage.onChanged` | MV3 `chrome.*` namespace |
| **Target site** | Neptun (Angular-based SPA at `neptun.bme.hu`) + Unipoll subdomain | — |
| **Firefox compat** | `browser_specific_settings.gecko` block in manifest | `strict_min_version: "142.0"` |
| **Permissions** | `storage` only | — |
| **Build system** | **None.** Code is loaded directly as an unpacked extension. | No npm, no webpack, no Vite |

---

## 2. Project Structure

```
neptun_tweaks/                   ← Repo root
├── readme.md                    ← User-facing docs (Hungarian)
├── project_guidelines.md        ← This file
└── Neptun_tweaks/               ← Extension root (loaded into browser)
    ├── manifest.json            ← MV3 manifest — single source of truth for script loading order
    ├── content.css              ← Injected styles for ALL content-script DOM manipulations
    ├── main.js                  ← Orchestrator: reads settings, routes by URL, applies tweaks
    ├── popup.html               ← Extension popup UI (also used as options_ui page)
    ├── popup.js                 ← Popup logic: load/save settings, page switching, UI state
    ├── icons/                   ← Browser extension icons
    │   ├── icon16.png           ← 16x16 icon (favicon / small toolbar)
    │   ├── icon32.png           ← 32x32 icon (retina / standard toolbar)
    │   ├── icon48.png           ← 48x48 icon (extensions manager)
    │   └── icon128.png          ← 128x128 icon (store / high-res)
    └── modules/                 ← Feature modules — one file per feature
        ├── defaults.js          ← NEPTUN_TWEAKS_DEFAULTS constant (settings schema + defaults)
        ├── darkMode.js          ← Dark mode toggle (CSS class on <html>)
        ├── headerImage.js       ← Custom dashboard background (image or color)
        ├── homePageExpander.js  ← Auto-expand collapsed dashboard panels
        ├── listExpander.js      ← Auto-click "Load More" buttons on lists
        ├── calendarButton.js    ← Inject quick-access calendar button in header
        ├── version.js           ← Inject version badge in header + footer
        ├── serverInfoMirror.js  ← Mirror server info + custom login button text
        ├── filterTweaks.js      ← Auto-open filter panel + auto-submit on selection
        ├── examRegistration.js  ← Auto exam registration with priority queue
        └── subjectRegistration.js ← Auto subject registration via Órarendtervező
```

### Naming Conventions
- **Module files:** `camelCase.js` — always a single descriptive noun or compound (e.g., `listExpander.js`, `filterTweaks.js`, `subjectRegistration.js`).
- **CSS IDs for injected elements:** Prefixed with `neptun-tweaks-` (e.g., `neptun-tweaks-calendar-btn`, `neptun-tweaks-server-info-mirror`).
- **CSS classes for injected elements:** Prefixed with `neptun-tweaks-` (e.g., `neptun-tweaks-lang-flex`, `neptun-tweaks-custom-bg`, `neptun-tweaks-dark-mode`).
- **Data attributes:** `data-image-set` on manipulated host elements to track initialization state.
- **Setting keys:** `camelCase` prefixed with `feature` for boolean toggles (e.g., `featureDarkMode`, `featureListExpand`, `featureAutoSubject`).

---

## 3. Architecture & Execution Model

### 3.1 Script Loading Order (Critical)

Scripts are loaded as **content scripts** in the exact order declared in `manifest.json`. There is **no module system** (`import`/`export`). Scripts share the **same global scope** and rely on load order for dependency resolution:

```
1. modules/defaults.js            ← Defines NEPTUN_TWEAKS_DEFAULTS (used by everything)
2. modules/headerImage.js         ← Defines startHeaderImageTweaks(), window.updateLiveBackground
3. modules/listExpander.js        ← Defines startListExpander()
4. modules/homePageExpander.js     ← Defines expandMenus()
5. modules/version.js             ← Defines injectVersion(), startFooterVersionTweaks()
6. modules/calendarButton.js      ← Defines injectCalendarButton()
7. modules/serverInfoMirror.js     ← Defines startServerInfoMirror(), startLoginButtonTweaks()
8. modules/filterTweaks.js        ← Defines startQueryTweaks()
9. modules/examRegistration.js    ← Defines startAutoExamRegistration()
10. modules/subjectRegistration.js ← Defines startAutoSubjectRegistration()
11. modules/darkMode.js           ← Defines startDarkMode()
12. main.js                       ← Orchestrator — calls all of the above
```

**Rule:** `main.js` is always loaded **last**. Module files define functions; `main.js` calls them.

### 3.2 Orchestration Pattern (`main.js`)

`main.js` follows a three-part structure:

1. **`determinePageAndRun()`** — Reads settings from `chrome.storage.local.get()` with `NEPTUN_TWEAKS_DEFAULTS` as the defaults object, then conditionally invokes feature functions based on `location.href`:
   - `/dashboard` → dashboard tweaks (background, expand, calendar, version) + optional delayed redirect to `/exams` or `/subjects/registration`
   - `/login` → server info mirror + dynamic login button text (`startLoginButtonTweaks`)
   - `/exams` → auto exam registration
   - `/subjects/registration` → auto subject registration via Órarendtervező
   - Global (all pages) → dark mode, list expander, footer version, filter tweaks

2. **SPA Navigation Watchdog** — Detects URL changes via:
   - `popstate` + `hashchange` event listeners (instant)
   - `setInterval(onUrlChange, 1000)` fallback (for Angular's `pushState`)

3. **Live Settings Listener** — `chrome.storage.onChanged` listener that re-applies settings in real-time without page reload.

### 3.3 Module Pattern

Every module follows this template:

```javascript
// modules/featureName.js

// Core function — does the actual DOM work
// Returns true when done, false if the target element wasn't found yet
function doTheThing() {
    const target = document.querySelector('...');
    if (!target) return false;
    
    // Guard: check if already applied
    if (document.getElementById('neptun-tweaks-xxx')) return true;
    
    // Do DOM manipulation
    // ...
    return true;
}

// Orchestrator — polls with setInterval until doTheThing() succeeds
function startFeatureName() {
    let attempts = 0;
    const interval = setInterval(() => {
        attempts++;
        if (doTheThing() || attempts >= 10) {
            clearInterval(interval);
        }
    }, 500);
}
```

**Key characteristics:**
- **Polling with `setInterval`** — The standard pattern for waiting on Angular's dynamic DOM. Interval is typically `500ms` for feature-level polling, `100ms` for rapid UI interactions (like list expanding).
- **Attempt limits** — Always cap at a fixed number of attempts (usually `10` at `500ms` = 5 seconds). Never poll indefinitely.
- **Idempotency guards** — Always check `document.getElementById('neptun-tweaks-xxx')` or `data-*` attributes before injecting to prevent duplicates.
- **Return value convention** — `true` = "done, stop polling", `false` = "not ready yet, try again".

---

## 4. State Management

### 4.1 Storage API

- **Only** `chrome.storage.local` is used. Never `chrome.storage.sync`, never `localStorage`, never `sessionStorage` (except the one-time `sessionStorage.getItem('neptunTweaksAutoExamRedirected')` redirect guard in `main.js`).
- Settings are always read with `chrome.storage.local.get(NEPTUN_TWEAKS_DEFAULTS, callback)` — the defaults object serves as both the schema and the fallback values.
- Settings are written individually: `chrome.storage.local.set({ settingKey: value })`. Never batch-write the entire settings object unless necessary.

### 4.2 Defaults Schema (`defaults.js`)

```javascript
const NEPTUN_TWEAKS_DEFAULTS = {
    featureDarkMode: false,
    featureBackground: true,
    bgType: 'image',           // 'image' | 'color'
    bgColor: '#0056b3',
    backgroundUrl: '',
    bgPositionY: 50,           // 0–100 (percentage)
    featureHomeExpand: true,
    featureCalendarButton: true,
    featureListExpand: true,
    listExpandLimit: 100,      // 50 | 100 | 250 | 500
    featureServerInfo: true,
    featureAutoFilter: true,
    featureAutoExam: false,
    autoExamTargets: [],       // Array of "subject||date||type" strings
    featureAutoSubjectRedirect: false,
    featureAutoSubject: false
};
```

**Rules:**
- Any new feature toggle **must** be added to `NEPTUN_TWEAKS_DEFAULTS` with a sensible default.
- Boolean feature flags use the `feature` prefix.
- This object is the **single source of truth** for all setting keys and their types.

### 4.3 Live Reactivity

Settings changes are propagated in real-time via `chrome.storage.onChanged`. The listener in `main.js` re-reads the full settings object and re-applies affected features. This allows the popup to control the page without requiring a refresh.

---

## 5. Popup UI Architecture

### 5.1 Structure

- `popup.html` contains **everything**: markup, inline `<style>`, and script tags.
- It functions as both the popup (browser action) and the options page (`options_ui` with `open_in_tab: true`).
- Multi-page navigation is handled with **div-based page switching** (show/hide `mainPage`, `targetsPage`, `bgSettingsPage` via `display: none`/`display: block`).

### 5.2 UI Patterns

- **Toggle switches:** Custom CSS sliders using `<label class="switch"><input type="checkbox"><span class="slider"></span></label>`.
- **Mutual Exclusivity:** Auto Exam Registration and Auto Subject Registration/Redirect are mutually exclusive; enabling one automatically disables the other in storage and UI.
- **Feature-dependent controls:** When a parent toggle is off, child controls are `disabled` and their container opacity is set to `0.5`.
- **Element references:** All interactive elements are grabbed by `document.getElementById()` at the top of the `DOMContentLoaded` handler. No `querySelector` for popup controls.
- **Settings I/O:** Each control has its own individual `change`/`input` event listener that writes a single key to storage.
- **Dark mode in popup:** Applied via `body.dark-mode` class, toggled in sync with the setting.
- **Firefox detection:** `navigator.userAgent.includes('Firefox')` — used to swap native color picker for hex text input (because Firefox's color dialog closes the popup).

### 5.3 Popup Styling

- All popup styles are **inline** in `popup.html`'s `<style>` block. There is no external CSS file for the popup.
- Design system: `Segoe UI` font family, `#0056b3` as the primary accent color, `#f9f9f9` light background, `#222` dark background.
- Dark mode overrides use `body.dark-mode` selector with `#4ea8ff` as the dark-mode accent.

---

## 6. Content Script Styling (`content.css`)

### 6.1 Principles

- **One file for all injected styles.** Every element created by content scripts is styled here.
- **Scoped via unique IDs** — `#neptun-tweaks-calendar-btn`, `#neptun-ext-version`, etc.
- **Body class toggles** — Features that affect broad layout use body/html classes:
  - `body.neptun-tweaks-custom-bg` — active when custom background is set
  - `html.neptun-tweaks-dark-mode` — active when dark mode is on
  - `html.neptun-tweaks-site-main` / `html.neptun-tweaks-site-unipoll` — site discrimination for dark mode
- **`!important` usage** — Used **only** in dark mode rules to override Angular Material's inline styles and deep shadow DOM. Never use `!important` for normal feature styling.
- **Section headers** — CSS is organized with `/* ============ Section ============ */` block comment headers.

### 6.2 Dark Mode Strategy

Dark mode uses a **CSS filter inversion** approach:
```css
html.neptun-tweaks-dark-mode {
    filter: invert(1) hue-rotate(180deg) !important;
    background-color: #ffffff !important;
}
```
Then selectively **un-inverts** media elements (images, video, SVGs, iframes) and **re-inverts** specific UI components (buttons, dialog actions, navigation elements) to preserve their intended appearance. This is a layered inversion system — be extremely careful adding new rules; the cascade of `invert → un-invert → re-invert` is deliberate and fragile.

---

## 7. DOM Manipulation Conventions

### 7.1 Element Creation

- **Always use `document.createElement()`** — never `innerHTML` for structural elements (see `serverInfoMirror.js` as the exemplar: uses `createElement`, `append`, `textContent`).
- **Exception:** `innerHTML` is acceptable only for simple static templates within self-created elements (e.g., `calendarButton.js` button body, `popup.js` placeholder text).
- **Always set a unique ID** on injected elements with the `neptun-tweaks-` prefix.
- **Reuse Neptun's existing CSS classes** for seamless visual integration (e.g., `neptun-button header__main-menu flat small-padding tertiary` on the calendar button).

### 7.2 Element Querying

- Content scripts: Use `document.querySelector()` / `document.querySelectorAll()` to find host page elements.
- Popup: Use `document.getElementById()` exclusively for control references.

### 7.3 Event Handling

- `addEventListener()` only — never inline `onclick` attributes in HTML.
- `onclick` property assignment is acceptable only for dynamically created buttons (e.g., `btn.onclick = () => { ... }`).
- Use `event.stopPropagation()` when preventing Angular Material from intercepting clicks (see exam registration checkboxes).

---

## 8. Cross-Browser Compatibility

- The manifest includes `browser_specific_settings.gecko` for Firefox with `strict_min_version: "142.0"`.
- Firefox-specific UI workarounds are handled at runtime via `navigator.userAgent.includes('Firefox')`.
- Use only `chrome.*` API namespace (Firefox's MV3 supports it). Do **not** use `browser.*` namespace.
- The color picker in popup has an explicit Firefox fallback (hex text input instead of native `<input type="color">`).

---

## 9. Strict Constraints

> **These are absolute rules. Violating any of them is a breaking change.**

### ❌ DO NOT use:

| Banned | Reason |
|---|---|
| **ES Modules (`import`/`export`)** | Content scripts share global scope via manifest load order. ES modules would break every cross-file function call. |
| **TypeScript** | The project has no build step. All JS is executed directly. |
| **Any bundler** (Webpack, Vite, Rollup, esbuild) | Same as above — no build step exists or is wanted. |
| **npm / node_modules** | The extension directory is loaded raw. No package manager. |
| **`chrome.storage.sync`** | All settings use `chrome.storage.local`. Sync would introduce quota limits and cross-device conflicts. |
| **`localStorage` / `sessionStorage`** for settings | Use `chrome.storage.local` exclusively. The one `sessionStorage` usage is a one-time redirect guard, not settings. |
| **`browser.*` API namespace** | Use `chrome.*` only for cross-browser compatibility under MV3. |
| **Manifest V2 APIs** (`chrome.browserAction`, `chrome.pageAction`, background pages) | This is a Manifest V3 extension. |
| **`innerHTML` for user-controlled or parsed data** | Security risk. Use `createElement` + `textContent`/`append`. |
| **`var` declarations** | Use `const` and `let` exclusively. |
| **CSS frameworks** (Tailwind, Bootstrap, etc.) | All styling is vanilla CSS. |
| **jQuery or any JS library** | Pure vanilla JS only. |
| **Service workers / background scripts** | The extension has no background script. All logic runs in content scripts and the popup. |
| **`eval()` or `new Function()`** | Blocked by MV3 CSP and is a security risk. |
| **`document.write()`** | Deprecated, blocks parsing, incompatible with content scripts. |
| **`MutationObserver` for polling** | The codebase uses `setInterval`-based polling. MutationObserver is not used anywhere and would be an inconsistent pattern. If MutationObserver is ever introduced, it must be a deliberate architectural decision, not a one-off. |
| **`async`/`await`** | The codebase uses callback-style `chrome.storage` APIs throughout. Do not mix paradigms — stay callback-based for storage operations. |
| **Arrow functions for module-level named functions** | Module entry points are declared with `function` keyword (hoisted). Arrow functions are used only inside callbacks and event listeners. |
| **`XMLHttpRequest`** | If network requests are ever needed, use `fetch()`. |

### ✅ ALWAYS:

| Rule | Detail |
|---|---|
| **Add new settings to `NEPTUN_TWEAKS_DEFAULTS`** | Every new feature needs a default value in the schema object. |
| **Add new content scripts to `manifest.json`** | In the correct position (before `main.js`, after `defaults.js`). |
| **Prefix injected element IDs with `neptun-tweaks-`** | Prevents collisions with Neptun's own DOM. |
| **Guard against duplicate injection** | Check for existing element by ID or data attribute before creating. |
| **Cap polling attempts** | Never create an unbounded `setInterval`. Always clear after N attempts. |
| **Return `true`/`false` from core functions** | To signal completion status to the polling orchestrator. |
| **Use `chrome.storage.local.get(NEPTUN_TWEAKS_DEFAULTS, cb)`** | Always pass the defaults object to ensure all keys exist. |
| **Keep modules single-responsibility** | One file = one feature. Don't mix concerns. |
| **Add CSS for new injected elements in `content.css`** | Never use inline styles for content-script elements unless absolutely necessary for dynamic values (e.g., `backgroundPosition`). Popup elements are styled in `popup.html`'s `<style>` block. |
| **Test on both Chrome and Firefox** | Use `browser_specific_settings.gecko` for Firefox-specific manifest entries. |
| **Log with `console.log("Neptun Tweaks: ...")`** | Always prefix console output with `Neptun Tweaks:` for easy filtering. |

---

## 10. Adding a New Feature — Checklist

1. **Create `modules/featureName.js`** with the standard polling pattern.
2. **Add default setting** to `NEPTUN_TWEAKS_DEFAULTS` in `defaults.js`.
3. **Register the script** in `manifest.json` → `content_scripts[0].js` array (before `main.js`).
4. **Wire it up in `main.js`** → `determinePageAndRun()`, gated by the setting flag.
5. **Add live-update support** in `main.js` → `chrome.storage.onChanged` listener if needed.
6. **Add popup toggle** in `popup.html` (HTML + inline CSS) and `popup.js` (load/save/event).
7. **Add injected-element styles** in `content.css` with `neptun-tweaks-` prefixed selectors.
8. **Add dark mode overrides** in `content.css` under `html.neptun-tweaks-dark-mode` if the feature adds visible DOM elements.
9. **Test** on Chrome, Edge, and Firefox.

---

## 11. Version Bumping

The version string in `manifest.json` → `"version"` is the single source of truth. It is read at runtime via `chrome.runtime.getManifest().version` and displayed in:
- The dashboard header (`#neptun-ext-version`)
- The site footer (`#neptun-tweaks-footer-v`)

Bump it in `manifest.json` only. No other file tracks the version.
