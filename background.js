chrome.runtime.onInstalled.addListener(function() {
  // Default tickers selection
  chrome.storage.sync.set({tickers: ["mkr", "zrx"]}, function() {
    console.log("The by default selection tickers were saved.");
  });
});

// There is no console. Use bkg.console.log()
var bkg = chrome.extension.getBackgroundPage();

chrome.alarms.onAlarm.addListener(function() {
  chrome.notifications.create({
    type:     'basic',
    iconUrl:  './images/iX32.png',
    title:    'Insider Move Alert',
    message:  'Holding by top 10 holders of this token changed by X',
    buttons: [
      {title: 'Not defined yet.'}
    ],
    priority: 0
  });
});

// Event listener for clickhin on alarm popup button
chrome.notifications.onButtonClicked.addListener(function() {
  bkg.console.log('Started alarm')
  chrome.storage.sync.get(['minutes'], function(item) {
    chrome.browserAction.setBadgeText({text: 'ON'});
    // chrome.alarms.create({delayInMinutes: item.minutes});
  });
});

chrome.browserAction.setBadgeText({text: 'BETA'});
