chrome.runtime.onMessage.addListener((message, sender) => {
    if (message.CloseMe) {
        chrome.tabs.remove(sender.tab.id)
    }
})

function UnblockUrl(urlToUnblock) {
    chrome.storage.local.get("BlockedUrls", (data) => {
        if (data.BlockedUrls !== undefined) {
            const updatedUrls = data.BlockedUrls.filter((entry) => entry.url !== urlToUnblock);

            chrome.storage.local.set({ BlockedUrls: updatedUrls }, () => {
                console.log(`Unblocked ${urlToUnblock}`);
            });
        }
    });
}

// Listen for unblock requests from the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "unblock") {
        const urlToUnblock = message.url;
        UnblockUrl(urlToUnblock); 
        sendResponse({ status: "success", url: urlToUnblock });
        return true; 
    }
});
