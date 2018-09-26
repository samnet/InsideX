




chrome.runtime.onInstalled.addListener(function() {

  // Initial tickers selection
  chrome.storage.sync.set({tickers: ["MKR", "ZRX"]}, function() {
    console.log("The by default selection tickers were saved.");
  });


  chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [
        new chrome.declarativeContent.PageStateMatcher({
          pageUrl: { urlContains: 'http' }
        }),
      ],
      actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });
});

// Don't know what this line is for.
var bkg = chrome.extension.getBackgroundPage();

// Alarm pop-up
chrome.alarms.onAlarm.addListener(function() {
  // chrome.browserAction.setBadgeText({text: ''});
  chrome.notifications.create({
      type:     'basic',
      iconUrl:  './images/iX32.png',
      title:    'Insider Move Alert',
      message:  'Holding by top 10 holders of this token changed by X',
      buttons: [
        {title: 'Not defined yet.'}
      ],
      priority: 0});
});

// Event listener for clickhin on alarm popup button
chrome.notifications.onButtonClicked.addListener(function() {
  chrome.storage.sync.get(['minutes'], function(item) {
    // chrome.browserAction.setBadgeText({text: 'ON'});
    // chrome.alarms.create({delayInMinutes: item.minutes});
  });
});
