previousWebsiteName = '';
function extractWebsiteName(url) {
    let websiteName = '';
    try {
        const parsedUrl = new URL(url);
        websiteName = parsedUrl.hostname.replace(/^www\./, '');
    } catch (error) {
        console.error('Error extracting website name:', error);
    }
    return websiteName;
}

function updateWebsiteName() {
    const currentWebsiteName = extractWebsiteName(window.location.href);
    const currentTime = Math.round(Date.now() / 1000);
    if (currentWebsiteName !== previousWebsiteName) {
        previousWebsiteName = currentWebsiteName;
        chrome.storage.local.set({ websiteName: currentWebsiteName });
        chrome.storage.local.set({ startTime: currentTime });
    }
}
document.addEventListener("DOMContentLoaded", () => {
    updateWebsiteName();
});

document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
        updateWebsiteName();
    }
});
updateWebsiteName();
