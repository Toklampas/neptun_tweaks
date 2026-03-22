// modules/expander.js

// Function that finds and clicks collapsed menus
function expandMenus() {
    const collapsedHeaders = document.querySelectorAll('mat-expansion-panel-header[aria-expanded="false"]');
    
    if (collapsedHeaders.length > 0) {
        collapsedHeaders.forEach(header => header.click());
        return true; 
    }
    return false; 
}