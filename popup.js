function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function updateTable() {
  const table = document.getElementById('mainTableBody')

  return Promise.all([
    getStore('tickers'),
    getStore('tokens'),
    getStore('holdings-24'),
    getStore('holdings-120'),
    getStore('prices')
  ])
  .then((res) => {
    const tickers = res[0]
    const tokens = res[1]
    const holdings24 = res[2]
    const holdings120 = res[3]
    const prices = res[4]

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
      if (holdings120[contractAddress]) {
        var volumeDelta3 = getHoldingChange(holdings120[contractAddress])
        table.rows[rownum].cells[1].innerHTML = volumeDelta3;
      }

      if (holdings24[contractAddress]) {
        var volumeDelta24 = getHoldingChange(holdings24[contractAddress])
        table.rows[rownum].cells[2].innerHTML = volumeDelta24;
      }

      var newPriceObj = prices.find(p => p.ticker.toLowerCase() === ticker)
      if (newPriceObj) {
        var oldPrice = table.rows[rownum].cells[3].innerHTML = volumeDelta24;
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
  const delta = (holdings.maxTimestampShares - holdings.minTimestampShare) / holdings.maxTimestampShares
  return (delta * 100).toFixed(1)
}

function deleteTicker() {
  const ticker = this.id.split('-')[0]
  console.log('delete', ticker)
  getStore('tickers')
    .then(tickers => {
      var index = tickers.indexOf(ticker);
      if (index > -1) {
        tickers.splice(index, 1);
        setStore('tickers', tickers)
          .then(() => {
            $(`#mainTableBody #${ticker}`).remove()
          });
      }
    })
}

function loadTokensJson() {
  return axios.get('data/tokens.json')
    .then(resp => {
      return setStore('tokens', resp.data);
    })
}

function loadHoldingsData() {
  return Promise.all([
      getStore('tickers'),
      getStore('tokens')
    ])
    .then((res) => {
      const tickers = res[0]
      const tokens = res[1]
      const contractAddresses = tickers.map(ticker => {
        return tokens
          .find(t => t.ticker.toLowerCase() === ticker.toLowerCase())
          .contractAddress
      })
      return Promise.all([
        getDiffInHoldings(24, contractAddresses),
        getDiffInHoldings(120, contractAddresses)
      ])
    })
    .then((res) => {
      console.log(res)
      return Promise.all([
        setStore('holdings-24', res[0]),
        setStore('holdings-120', res[1]),
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
      setStore('prices', prices)
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
      return `<img src="vendor/icons/${item.name}.png">   ${abbrevAndName}`
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
            updateTable()
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
      lastLoaded.setHours(lastLoaded.getHours() + 1)
      if (Date.now() > lastLoaded) {
        return loadHoldingsData()
      }
    })

  updateTable()
  loadPrices()
    .then(() => {
      updateTable()
    })
});



// store info
// tickers : watching tokens
// tokens : total tokens available
// holdings-24 : 24 hour holdings for the tickers
// holdings-120 : 120 hour holdings for the tickers

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
        getStore('holdings-24'),
        getStore('holdings-120')
      ])
    })
    .then((res) => {
      const tickers = res[0]
      const tokens = res[1]
      const holdings24 = res[2]
      const holdings120 = res[3]

      tickers.forEach((ticker) => {
        const contractAddress = tokens
          .find(t => t.ticker.toLowerCase() === ticker.toLowerCase())
          .contractAddress

        var volumeChange120 = getHoldingChange(holdings120[contractAddress])
        var volumeChange24 = getHoldingChange(holdings24[contractAddress])
        if (volumeChange120 < -5 || volumeChange24 < -5) {
          // set the alarm
          console.log("set alarm", ticker, volumeChange120, volumeChange24)
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
