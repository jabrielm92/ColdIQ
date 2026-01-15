// ColdIQ Chrome Extension - Background Service Worker

// Listen for installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('ColdIQ extension installed');
  } else if (details.reason === 'update') {
    console.log('ColdIQ extension updated');
  }
});

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_TOKEN') {
    chrome.storage.local.get(['coldiq_token'], (result) => {
      sendResponse({ token: result.coldiq_token || null });
    });
    return true; // Keep message channel open for async response
  }
  
  if (message.type === 'SET_TOKEN') {
    chrome.storage.local.set({ coldiq_token: message.token }, () => {
      sendResponse({ success: true });
    });
    return true;
  }
  
  if (message.type === 'CLEAR_TOKEN') {
    chrome.storage.local.remove(['coldiq_token', 'coldiq_user'], () => {
      sendResponse({ success: true });
    });
    return true;
  }
});

// Context menu for quick access
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'analyze-selection',
    title: 'Analyze with ColdIQ',
    contexts: ['selection']
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'analyze-selection' && info.selectionText) {
    // Open popup or send to analyzer
    chrome.tabs.create({
      url: `https://cold-email-pro-6.preview.emergentagent.com/analyze?prefill=${encodeURIComponent(info.selectionText)}`
    });
  }
});
