var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-127056435-1']);
_gaq.push(['_trackPageview']);

(function () {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function updateTable() {
  const table = document.getElementById('mainTableBody')

  return Promise.all([
    getStore('tickers'),
    getStore('tokens'),
    getStore('holdings-1change'),
    getStore('holdings-2change'),
    getStore('prices')
  ])
  .then((res) => {
    const tickers = res[0] || []
    const tokens = res[1] || []
    const holdings1Change = res[2] || []
    const holdings2Change = res[3] || []
    const prices = res[4] || []

    tickers.forEach((ticker) => {
      console.log("[updateTable]: ", ticker)
      ticker = ticker.toLowerCase()
      const token = tokens
        .find(t => t.ticker.toLowerCase() === ticker)

      let rownum = $(`#mainTableBody #${ticker}`).index();
      if (rownum === -1) {
        const row = table.insertRow(0);
        row.id = ticker;
        [capitalizeFirstLetter(token.name), '-', '-', '-', '-'].forEach(function (element) {
          let newcell = row.insertCell(-1);
          newcell.innerHTML = element;
        })
        rownum = $(`#mainTableBody #${ticker}`).index();
      }

      const contractAddress = token.contractAddress
      if (holdings1Change[contractAddress]) {
        var volumeDelta1 = getHoldingChange(holdings1Change[contractAddress])
        table.rows[rownum].cells[1].innerHTML = volumeDelta1;
      }

      if (holdings2Change[contractAddress]) {
        var volumeDelta = getHoldingChange(holdings2Change[contractAddress])
        table.rows[rownum].cells[2].innerHTML = volumeDelta;
      }

      var newPriceObj = prices.find(p => p.ticker.toLowerCase() === ticker)
      if (newPriceObj) {
        var oldPrice = volumeDelta1 || table.rows[rownum].cells[3].innerHTML;
        table.rows[rownum].cells[3].innerHTML = Number(newPriceObj.price).toFixed(2);
        if (newPriceObj.price > oldPrice) {
          table.rows[rownum].cells[3].style.color = "green";
        } else {
          table.rows[rownum].cells[3].style.color = "red";
        }
      }

      const removeBtn = '<img src="vendor/images/cancel.png" alt="Delete" height=15 width=15></img>'
      table.rows[rownum].cells[4].innerHTML = removeBtn;
      table.rows[rownum].cells[4].id = `${ticker}-delete`
      table.rows[rownum].cells[4].addEventListener("click", deleteTicker);
    })
  })
}

function getHoldingChange(holdings) {
  if (!holdings) { return '-' }
  const delta = (holdings.maxTimestampShares - holdings.minTimestampShare) / holdings.maxTimestampShares
  const change = (delta * 100).toFixed(1)

  return Math.abs(change) === 0 ? Math.abs(change).toFixed(1) : change
}

function deleteTicker() {
  const ticker = this.id.split('-')[0]
  console.log('delete', ticker)
  getStore('tickers')
    .then(tickers => {
      var index = tickers.indexOf(ticker);
      if (index > -1) {
        tickers.splice(index, 1);
        return setStore('tickers', tickers)
          .then(() => {
            $(`#mainTableBody #${ticker}`).remove()
          });
      }
    })

  _gaq.push(['_trackEvent', ticker, 'deleted']);
}

function loadTokensJson() {
  return axios.get('data/tokens.json')
    .then(resp => {
      const tokens = resp.data.map(t => {
        t.ticker = t.ticker.toLowerCase()
        return t
      })
      return setStore('tokens', tokens);
    })
}

function loadHoldingsData() {
  return Promise.all([
      getStore('tickers'),
      getStore('tokens')
    ])
    .then((res) => {
      const tickers = res[0] || []
      const tokens = res[1] || []
      const contractAddresses = tickers.map(ticker => {
        const token = tokens
          .find(t => t.ticker.toLowerCase() === ticker.toLowerCase())
        return token && token.contractAddress
      })
      return Promise.all([
        getDiffInHoldings(5, contractAddresses),
        getDiffInHoldings(24, contractAddresses)
      ])
    })
    .then((res) => {
      console.log(res)
      return Promise.all([
        setStore('holdings-1change', res[0]),
        setStore('holdings-2change', res[1]),
        setStore('holdings-last-load', Date.now())
      ])
    })
}

function loadPrices() {
  return getStore('tickers')
    .then((tickers) => {
      return getPrices(tickers)
    })
    .then((prices) => {
      return setStore('prices', prices)
    })
}

// The typeahead
$("#token_name_input").easyAutocomplete({
  theme: "plate-dark",
  url: "data/tokens.json",
  getValue: function (element) {
    return element.name + element.ticker
  },
  minCharNumber: 1,
  template: {
    type: "custom",
    method: function (value, item) {
      const abbrevAndName = `${item.name} | ${item.ticker.toUpperCase()}`
      const imgName = item.name.toLowerCase().split(' ').join('-')
      return `<img src="vendor/icons/${imgName}.png">   ${abbrevAndName}`
    }
  },
  list: {
    match: {
      enabled: true
    },
    maxNumberOfElements: 6,
    onChooseEvent: function() {
      var newTicker = $("#token_name_input").getSelectedItemData().ticker;

      getStore('tickers')
        .then(tickers => {
          if (!tickers.includes(newTicker)) {

            // Add new ticker
            _gaq.push(['_trackEvent', newTicker, 'added']);
            tickers.push(newTicker)
            return setStore('tickers', tickers)
              .then(() => {
                return updateTable()
              });
          }
        })
        .then(() => {
          $("#token_name_input").val("")
          return Promise.all([
            loadHoldingsData(),
            loadPrices()
          ])
          .then(() => {
            return updateTable()
          })
        })
    }
  }
});


$(document).ready(function () {
  $('[data-toggle="tooltip"]').tooltip({
    placement: "bottom",
    delay: 500,
  }) // tool tips (indication column title)

  loadTokensJson()
  getStore('holdings-last-load')
    .then((lastLoaded) => {
      console.log({lastLoaded})
      if (!lastLoaded) {
        return loadHoldingsData()
      }

      lastLoaded = new Date(lastLoaded)
      lastLoaded.setMinutes(lastLoaded.getMinutes() + 20)
      if (Date.now() > lastLoaded) {
        return loadHoldingsData()
      }

      return Promise.resolve()
    })
    .then(() => {
      return updateTable()
    })

  loadPrices()
    .then(() => {
      return updateTable()
    })
});



// store info
// tickers : watching tokens
// tokens : total tokens available
// holdings-1change : 5 hour holdings for the tickers
// holdings-2change : 24 hour holdings for the tickers

///// polling
var pollInterval = 20 * 60000;
var timerId;

function startPoller() {
  console.log('poller started')
  loadHoldingsData()
    .then(() => {
      return Promise.all([
        getStore('tickers'),
        getStore('tokens'),
        getStore('holdings-1change'),
        getStore('holdings-2change')
      ])
    })
    .then((res) => {
      const tickers = res[0] || []
      const tokens = res[1] || []
      const holdings1Change = res[2] || []
      const holdings2Change = res[3] || []

      tickers.forEach((ticker) => {
        const token = tokens
          .find(t => t.ticker.toLowerCase() === ticker.toLowerCase())
        const contractAddress = token || token.contractAddress

        var volumeChange1 = getHoldingChange(holdings1Change[contractAddress])
        var volumeChange2 = getHoldingChange(holdings2Change[contractAddress])
        if (volumeChange1 < -5 || volumeChange2 < -5) {
          // set the alarm
          console.log("set alarm", ticker, volumeChange1, volumeChange2)
          setAlarm()
        }
      })
    })
    .catch(err => {
      console.log('Polling err', err);
    })

  timerId = window.setTimeout(startPoller, pollInterval);
}

window.addEventListener('DOMContentLoaded', function () {
  console.log('window.addEventListener');
  startPoller();
});


// Alarm (for now a place holder. Alarm triggered every 6 seconds)
function setAlarm() {
  let minutes = 0.1
  chrome.alarms.create({ delayInMinutes: minutes });
  setStore('minutes', minutes)
}

function clearAlarm() {
  chrome.alarms.clearAll();
}
