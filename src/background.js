/* global chrome */

chrome.action.onClicked.addListener((clickedTab) => {
  // If the current tab is on the target site, send the message immediately.
  if (clickedTab.url && clickedTab.url.startsWith("https://vinrcl.safercar.gov/")) {
    chrome.tabs.sendMessage(clickedTab.id, { togglePanel: true });
  } else {
    // Look for any open tab on the target domain.
    chrome.tabs.query({ url: "https://vinrcl.safercar.gov/*" }, (tabs) => {
      if (tabs.length > 0) {
        // Activate the first matching tab.
        chrome.tabs.update(tabs[0].id, { active: true }, () => {
          chrome.tabs.sendMessage(tabs[0].id, { togglePanel: true });
        });
      } else {
        // If no matching tab exists, create a new tab.
        chrome.tabs.create({ url: "https://vinrcl.safercar.gov/vin/" }, (newTab) => {
          // Wait for the new tab to fully load before sending the message.
          chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
            if (tabId === newTab.id && changeInfo.status === "complete") {
              chrome.tabs.sendMessage(newTab.id, { togglePanel: true });
              chrome.tabs.onUpdated.removeListener(listener);
            }
          });
        });
      }
    });
  }
});
