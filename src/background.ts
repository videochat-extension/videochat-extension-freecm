async function showBadge() {
    await chrome.action.setBadgeBackgroundColor({ color: "#000000" })
    await chrome.action.setBadgeText({
        text: "ext",
    });
}

async function onMessage(message: { action: string }, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) {
    if (message.action === 'injectScript' && sender.tab?.id) {
        chrome.scripting.executeScript({
            target: { tabId: sender.tab.id },
            files: ['injection/coomeetfree.js'],
            world: 'MAIN'
        });
    }
}

// this is used to check if the extension is installed
// if the extension is not installed, user will be notified
// that freecm support has been moved to this extension
async function onMessageExternal(message: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) {
    if (message.type === "PING") {
        sendResponse("PONG");
    }
}

async function onInstalled(details: chrome.runtime.InstalledDetails) {
    if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
        await chrome.tabs.create({ url: chrome.runtime.getURL('popup/popup.html') });
        if (chrome.action?.openPopup) {
            await chrome.action.openPopup();
        }
    }
    await showBadge();
}

// Initialize badge on install/startup
function init() {
    chrome.runtime.onInstalled.addListener(onInstalled);
    chrome.runtime.onMessage.addListener(onMessage);
    chrome.runtime.onMessageExternal.addListener(onMessageExternal);
    chrome.runtime.onStartup.addListener(showBadge);
}

init();