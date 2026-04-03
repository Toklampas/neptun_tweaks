// popup.js

document.addEventListener('DOMContentLoaded', () => {
    const bgToggle = document.getElementById('bgToggle');
    const bgUrlInput = document.getElementById('bgUrlInput'); // Our new input box
    const homeToggle = document.getElementById('homeToggle');
    const listToggle = document.getElementById('listToggle');

    // 1. Load settings (we added 'backgroundUrl' to the list)
    chrome.storage.local.get({
        featureBackground: true,
        backgroundUrl: '', // Default is empty
        featureHomeExpand: true,
        featureListExpand: true
    }, (settings) => {
        bgToggle.checked = settings.featureBackground;
        bgUrlInput.value = settings.backgroundUrl;
        homeToggle.checked = settings.featureHomeExpand;
        listToggle.checked = settings.featureListExpand;
        
        // Gray out the URL box if the feature is turned off
        bgUrlInput.disabled = !settings.featureBackground;
    });

    // 2. Save settings when toggles are clicked
    bgToggle.addEventListener('change', () => {
        chrome.storage.local.set({ featureBackground: bgToggle.checked });
        bgUrlInput.disabled = !bgToggle.checked; // Toggle the grayed-out state
    });
    
    // 3. Save the URL automatically when you type or paste into it!
    bgUrlInput.addEventListener('input', () => {
        chrome.storage.local.set({ backgroundUrl: bgUrlInput.value });
    });
    
    homeToggle.addEventListener('change', () => {
        chrome.storage.local.set({ featureHomeExpand: homeToggle.checked });
    });
    
    listToggle.addEventListener('change', () => {
        chrome.storage.local.set({ featureListExpand: listToggle.checked });
    });
});